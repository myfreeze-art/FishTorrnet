pub mod api;
mod bencode;
pub mod guard;
pub mod import;
pub mod settings;
mod stream;
mod ui;
pub mod view;

use std::collections::HashMap;
use std::net::{Ipv4Addr, Ipv6Addr, SocketAddr};
use std::num::NonZeroU32;
use std::path::{Path, PathBuf};
use std::sync::{Arc, Mutex, RwLock};
use std::time::{Duration, Instant};

use anyhow::Context;
use librqbit::dht::DhtPersistenceConfig;
use librqbit::limits::LimitsConfig;
use librqbit::{
    Api, DhtSessionConfig, ListenerMode, ListenerOptions, Session, SessionOptions,
    SessionPersistenceConfig, generate_azereus_style,
};
use tokio::net::TcpListener;

use crate::guard::{Kind, Level};
use crate::settings::Settings;

pub const VERSION: &str = env!("CARGO_PKG_VERSION");

pub type FolderPicker = Arc<dyn Fn(PathBuf) -> Option<PathBuf> + Send + Sync>;
pub type RestartHook = Arc<dyn Fn() + Send + Sync>;

pub struct Options {
    pub config_dir: PathBuf,
    pub desktop: bool,
    pub folder_picker: Option<FolderPicker>,
    pub restart: Option<RestartHook>,
    pub download_dir: Option<PathBuf>,
}

pub struct Engine {
    pub api: Api,
    pub desktop: bool,
    pub folder_picker: Option<FolderPicker>,
    pub restart: Option<RestartHook>,
    pub started: Instant,
    pub(crate) guard_cache: Mutex<HashMap<String, (Level, Kind)>>,
    pub(crate) inbox: Mutex<Vec<serde_json::Value>>,
    config_dir: PathBuf,
    token: String,
    settings: RwLock<Settings>,
    applied: Settings,
}

fn load_token(path: &Path) -> anyhow::Result<String> {
    if let Ok(t) = std::fs::read_to_string(path) {
        let t = t.trim();
        if t.len() >= 32 && t.chars().all(|c| c.is_ascii_hexdigit()) {
            return Ok(t.to_string());
        }
    }
    let bytes: [u8; 24] = rand::random();
    let token: String = bytes.iter().map(|b| format!("{b:02x}")).collect();
    std::fs::write(path, &token).context("cannot write access token")?;
    Ok(token)
}

fn limit(kib: u32) -> Option<NonZeroU32> {
    NonZeroU32::new(kib.saturating_mul(1024))
}

pub fn default_config_dir() -> PathBuf {
    dirs::config_dir()
        .unwrap_or_else(|| PathBuf::from("."))
        .join("FishTorrnet")
}

impl Engine {
    pub async fn start(opts: Options) -> anyhow::Result<Arc<Engine>> {
        let config_dir = opts.config_dir;
        std::fs::create_dir_all(&config_dir)
            .with_context(|| format!("cannot create {}", config_dir.display()))?;
        let settings_path = config_dir.join("settings.json");
        let mut settings = Settings::load(&settings_path);
        if let Some(dir) = opts.download_dir.filter(|_| !settings_path.exists()) {
            settings.download_folder = dir;
        }
        let token = load_token(&config_dir.join("token"))?;
        std::fs::create_dir_all(&settings.download_folder)
            .with_context(|| format!("cannot create {}", settings.download_folder.display()))?;

        let folder = settings.download_folder.clone();
        let attempts = [
            (false, settings.listen_port),
            (true, settings.listen_port),
            (true, 0),
        ];
        let mut last_err = None;
        let mut session = None;
        for (ipv4_only, port) in attempts {
            match Session::new_with_opts(
                folder.clone(),
                session_options(&settings, &config_dir, ipv4_only, port),
            )
            .await
            {
                Ok(s) => {
                    session = Some(s);
                    break;
                }
                Err(e) => {
                    tracing::warn!(ipv4_only, port, "session start failed: {e:#}");
                    last_err = Some(e);
                }
            }
        }
        let session = match session {
            Some(s) => s,
            None => {
                return Err(last_err
                    .unwrap_or_else(|| anyhow::anyhow!("unknown error"))
                    .context("cannot start BitTorrent session"));
            }
        };

        Ok(Arc::new(Engine {
            api: Api::new(session, None),
            desktop: opts.desktop,
            folder_picker: opts.folder_picker,
            restart: opts.restart,
            started: Instant::now(),
            guard_cache: Mutex::new(HashMap::new()),
            inbox: Mutex::new(Vec::new()),
            config_dir,
            token,
            applied: settings.clone(),
            settings: RwLock::new(settings),
        }))
    }

    pub fn enqueue_magnet(&self, magnet: &str) {
        self.inbox
            .lock()
            .unwrap()
            .push(serde_json::json!({ "magnet": magnet }));
    }

    pub fn enqueue_torrent(&self, bytes: &[u8]) {
        use base64::Engine as _;
        let b64 = base64::engine::general_purpose::STANDARD.encode(bytes);
        self.inbox
            .lock()
            .unwrap()
            .push(serde_json::json!({ "torrent": b64 }));
    }

    pub fn session(&self) -> &Arc<Session> {
        self.api.session()
    }

    pub fn token(&self) -> &str {
        &self.token
    }

    pub fn config_dir(&self) -> &Path {
        &self.config_dir
    }

    pub fn settings(&self) -> Settings {
        self.settings.read().unwrap().clone()
    }

    pub fn restart_required(&self) -> bool {
        self.settings.read().unwrap().needs_restart(&self.applied)
    }

    pub fn session_folder(&self) -> &Path {
        &self.applied.download_folder
    }

    pub fn update_settings(&self, new: Settings) -> anyhow::Result<Settings> {
        new.validate()?;
        std::fs::create_dir_all(&new.download_folder)
            .with_context(|| format!("cannot create {}", new.download_folder.display()))?;
        new.save(&self.config_dir.join("settings.json"))?;
        let limits = &self.session().ratelimits;
        limits.set_download_bps(limit(new.download_limit_kib));
        limits.set_upload_bps(limit(new.upload_limit_kib));
        *self.settings.write().unwrap() = new.clone();
        Ok(new)
    }

    pub fn local_url(&self, addr: SocketAddr) -> String {
        format!("http://{addr}/?t={}", self.token)
    }

    pub fn remote_urls(&self) -> Vec<String> {
        let s = self.settings.read().unwrap();
        if !self.applied.remote_access || !s.remote_access {
            return Vec::new();
        }
        let port = self.applied.remote_port;
        let mut ips: Vec<std::net::IpAddr> = local_ip_address::list_afinet_netifas()
            .map(|l| l.into_iter().map(|(_, ip)| ip).collect())
            .unwrap_or_default();
        ips.retain(|ip| match ip {
            std::net::IpAddr::V4(v4) => !v4.is_loopback() && !v4.is_link_local(),
            std::net::IpAddr::V6(_) => false,
        });
        ips.sort_by_key(|ip| match ip {
            std::net::IpAddr::V4(v4) if v4.is_private() => 0,
            _ => 1,
        });
        ips.dedup();
        ips.into_iter()
            .map(|ip| format!("http://{ip}:{port}/?t={}", self.token))
            .collect()
    }

    pub fn router(self: &Arc<Self>) -> axum::Router {
        api::router(self.clone()).merge(ui::router())
    }

    pub async fn bind_local(self: &Arc<Self>, port: u16) -> anyhow::Result<SocketAddr> {
        let listener = TcpListener::bind((Ipv4Addr::LOCALHOST, port)).await?;
        let addr = listener.local_addr()?;
        self.spawn_server(listener);
        Ok(addr)
    }

    pub async fn bind_remote_if_enabled(self: &Arc<Self>) -> anyhow::Result<Option<SocketAddr>> {
        if !self.applied.remote_access {
            return Ok(None);
        }
        let listener = TcpListener::bind((Ipv4Addr::UNSPECIFIED, self.applied.remote_port))
            .await
            .with_context(|| format!("cannot listen on port {}", self.applied.remote_port))?;
        let addr = listener.local_addr()?;
        self.spawn_server(listener);
        Ok(Some(addr))
    }

    pub async fn bind(self: &Arc<Self>, addr: SocketAddr) -> anyhow::Result<SocketAddr> {
        let listener = TcpListener::bind(addr).await?;
        let addr = listener.local_addr()?;
        self.spawn_server(listener);
        Ok(addr)
    }

    fn spawn_server(self: &Arc<Self>, listener: TcpListener) {
        let app = self
            .router()
            .into_make_service_with_connect_info::<SocketAddr>();
        tokio::spawn(async move {
            if let Err(e) = axum::serve(listener, app).await {
                tracing::error!("http server stopped: {e:#}");
            }
        });
    }

    pub async fn shutdown(&self) {
        let _ = tokio::time::timeout(Duration::from_secs(5), self.session().stop()).await;
    }

    fn torrent_ids(&self) -> Vec<usize> {
        self.api
            .api_torrent_list()
            .torrents
            .into_iter()
            .filter_map(|t| t.id)
            .collect()
    }

    pub async fn pause_all(&self) {
        for id in self.torrent_ids() {
            let _ = self.api.api_torrent_action_pause(id.into()).await;
        }
    }

    pub async fn resume_all(&self) {
        for id in self.torrent_ids() {
            let _ = self.api.api_torrent_action_start(id.into()).await;
        }
    }

    pub fn speeds(&self) -> (u64, u64) {
        let s = self.api.api_session_stats();
        (s.download_speed.as_bytes(), s.upload_speed.as_bytes())
    }

    pub fn free_space(&self) -> Option<u64> {
        fs2::available_space(&self.settings.read().unwrap().download_folder).ok()
    }
}

fn session_options(
    settings: &Settings,
    config_dir: &Path,
    ipv4_only: bool,
    port: u16,
) -> SessionOptions {
    let (major, minor, patch) = version_parts();
    let listen_addr: SocketAddr = if ipv4_only {
        (Ipv4Addr::UNSPECIFIED, port).into()
    } else {
        (Ipv6Addr::UNSPECIFIED, port).into()
    };
    SessionOptions {
        dht: settings.dht.then(|| DhtSessionConfig {
            persistence: Some(DhtPersistenceConfig {
                config_filename: Some(config_dir.join("dht.json")),
                ..Default::default()
            }),
            ..Default::default()
        }),
        fastresume: true,
        persistence: Some(SessionPersistenceConfig::Json {
            folder: Some(config_dir.join("session")),
        }),
        peer_id: Some(generate_azereus_style(*b"FT", (major, minor, patch, 0))),
        listen: Some(ListenerOptions {
            mode: if settings.utp {
                ListenerMode::TcpAndUtp
            } else {
                ListenerMode::TcpOnly
            },
            listen_addr,
            enable_upnp_port_forwarding: settings.upnp,
            ipv4_only,
            ..Default::default()
        }),
        ratelimits: LimitsConfig {
            download_bps: limit(settings.download_limit_kib),
            upload_bps: limit(settings.upload_limit_kib),
        },
        peer_limit: Some(settings.peer_limit as usize),
        disable_local_service_discovery: !settings.lsd,
        ipv4_only,
        client_name_and_version: Some(format!("FishTorrnet {VERSION}")),
        ..Default::default()
    }
}

fn version_parts() -> (u8, u8, u8) {
    let mut it = VERSION.split('.').map(|p| p.parse::<u8>().unwrap_or(0));
    (
        it.next().unwrap_or(0),
        it.next().unwrap_or(0),
        it.next().unwrap_or(0),
    )
}
