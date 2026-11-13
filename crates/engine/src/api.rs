use std::borrow::Cow;
use std::collections::HashSet;
use std::net::SocketAddr;
use std::path::PathBuf;
use std::sync::Arc;
use std::time::Duration;

use axum::extract::{ConnectInfo, Path, Query, Request, State};
use axum::middleware::{self, Next};
use axum::response::{IntoResponse, Response};
use axum::routing::{get, post};
use axum::{Json, Router};
use base64::Engine as _;
use base64::engine::general_purpose::STANDARD as B64;
use http::{HeaderMap, StatusCode};
use librqbit::api::{ApiTorrentListOpts, TorrentIdOrHash};
use librqbit::{AddTorrent, AddTorrentOptions, AddTorrentResponse};
use serde::{Deserialize, Serialize};
use serde_json::{Value, json};

use crate::guard::{Kind, Level};
use crate::import::{self, Client};
use crate::settings::Settings;
use crate::{Engine, stream, view};

type Shared = Arc<Engine>;

pub struct ApiError(StatusCode, String);

impl IntoResponse for ApiError {
    fn into_response(self) -> Response {
        (self.0, Json(json!({ "error": self.1 }))).into_response()
    }
}

impl From<anyhow::Error> for ApiError {
    fn from(e: anyhow::Error) -> Self {
        Self(StatusCode::BAD_REQUEST, format!("{e:#}"))
    }
}

impl From<librqbit::ApiError> for ApiError {
    fn from(e: librqbit::ApiError) -> Self {
        Self(e.status(), e.to_string())
    }
}

type R<T> = Result<Json<T>, ApiError>;

fn bad(msg: impl Into<String>) -> ApiError {
    ApiError(StatusCode::BAD_REQUEST, msg.into())
}

fn parse_id(raw: &str) -> Result<TorrentIdOrHash, ApiError> {
    TorrentIdOrHash::parse(raw).map_err(|_| bad("invalid torrent id"))
}

fn constant_eq(a: &str, b: &str) -> bool {
    let (a, b) = (a.as_bytes(), b.as_bytes());
    a.len() == b.len() && a.iter().zip(b).fold(0u8, |acc, (x, y)| acc | (x ^ y)) == 0
}

fn is_local(engine: &Engine, addr: &SocketAddr) -> bool {
    engine.desktop && addr.ip().is_loopback()
}

async fn auth(State(engine): State<Shared>, req: Request, next: Next) -> Response {
    let header = req
        .headers()
        .get("x-fishtorrnet-token")
        .and_then(|v| v.to_str().ok())
        .map(str::to_owned);
    let query = req.uri().query().and_then(|q| {
        q.split('&')
            .find_map(|kv| kv.strip_prefix("t=").map(str::to_owned))
    });
    let ok = header
        .or(query)
        .is_some_and(|t| constant_eq(&t, engine.token()));
    if !ok {
        return ApiError(StatusCode::UNAUTHORIZED, "unauthorized".into()).into_response();
    }
    next.run(req).await
}

pub fn router(engine: Shared) -> Router {
    Router::new()
        .route("/api/state", get(state))
        .route("/api/settings", get(get_settings).put(put_settings))
        .route("/api/remote", get(remote))
        .route("/api/import", get(import_detect).post(import_run))
        .route("/api/pick-folder", post(pick_folder))
        .route("/api/restart", post(restart))
        .route("/api/inbox", post(take_inbox))
        .route("/api/preview", post(preview))
        .route("/api/add", post(add))
        .route("/api/pause-all", post(pause_all))
        .route("/api/resume-all", post(resume_all))
        .route("/api/torrents/{id}", get(torrent).delete(remove))
        .route("/api/torrents/{id}/peers", get(peers))
        .route("/api/torrents/{id}/pieces", get(pieces))
        .route("/api/torrents/{id}/pause", post(pause))
        .route("/api/torrents/{id}/resume", post(resume))
        .route("/api/torrents/{id}/files", post(set_files))
        .route("/api/torrents/{id}/open", post(open))
        .route("/api/torrents/{id}/stream/{file}", get(stream_file))
        .layer(middleware::from_fn_with_state(engine.clone(), auth))
        .with_state(engine)
}

fn guard_info(engine: &Engine, id: TorrentIdOrHash, info_hash: &str) -> (Level, Kind) {
    if let Some(v) = engine.guard_cache.lock().unwrap().get(info_hash) {
        return *v;
    }
    let Ok(d) = engine.api.api_torrent_details(id) else {
        return (Level::Safe, Kind::Other);
    };
    let Some(files) = d.files.as_deref().filter(|f| !f.is_empty()) else {
        return (Level::Safe, Kind::Other);
    };
    let v = (view::report_for(files).level, view::kind_for(files));
    engine
        .guard_cache
        .lock()
        .unwrap()
        .insert(info_hash.to_string(), v);
    v
}

#[derive(Serialize)]
struct SessionView {
    download_bps: u64,
    upload_bps: u64,
    downloaded_bytes: u64,
    uploaded_bytes: u64,
    peers_live: u64,
    dht_nodes: Option<u64>,
    uptime_secs: u64,
    listen_port: Option<u16>,
    free_bytes: Option<u64>,
}

fn num(v: &Value, path: &[&str]) -> f64 {
    let mut c = v;
    for k in path {
        match c.get(k) {
            Some(n) => c = n,
            None => return 0.0,
        }
    }
    c.as_f64().unwrap_or(0.0)
}

async fn state(State(e): State<Shared>, ConnectInfo(addr): ConnectInfo<SocketAddr>) -> R<Value> {
    let list = e
        .api
        .api_torrent_list_ext(ApiTorrentListOpts { with_stats: true });
    let mut torrents: Vec<view::Summary> = list
        .torrents
        .iter()
        .filter_map(|t| {
            let id = t.id?;
            let stats = t.stats.as_ref()?;
            let (level, kind) = guard_info(&e, id.into(), &t.info_hash);
            Some(view::summary(t, stats, level, kind))
        })
        .collect();
    torrents.sort_by_key(|t| std::cmp::Reverse(t.id));
    let s = serde_json::to_value(e.api.api_session_stats()).unwrap_or(Value::Null);
    let settings = e.settings();
    let session = SessionView {
        download_bps: (num(&s, &["download_speed", "mbps"]) * 1048576.0) as u64,
        upload_bps: (num(&s, &["upload_speed", "mbps"]) * 1048576.0) as u64,
        downloaded_bytes: num(&s, &["counters", "fetched_bytes"]) as u64,
        uploaded_bytes: num(&s, &["counters", "uploaded_bytes"]) as u64,
        peers_live: num(&s, &["peers", "live"]) as u64,
        dht_nodes: e
            .api
            .api_dht_stats()
            .ok()
            .map(|d| (d.routing_table_size + d.routing_table_size_v6) as u64),
        uptime_secs: e.started.elapsed().as_secs(),
        listen_port: e.session().announce_port(),
        free_bytes: e.free_space(),
    };
    Ok(Json(json!({
        "version": crate::VERSION,
        "torrents": torrents,
        "session": session,
        "restart_required": e.restart_required(),
        "local": is_local(&e, &addr),
        "can_pick_folder": is_local(&e, &addr) && e.folder_picker.is_some(),
        "can_restart": is_local(&e, &addr) && e.restart.is_some(),
        "inbox": if is_local(&e, &addr) { e.inbox.lock().unwrap().len() } else { 0 },
        "theme": settings.theme,
        "language": settings.language,
        "upnp": settings.upnp,
    })))
}

async fn get_settings(State(e): State<Shared>) -> R<Settings> {
    Ok(Json(e.settings()))
}

async fn put_settings(State(e): State<Shared>, Json(s): Json<Settings>) -> R<Value> {
    let saved = e.update_settings(s)?;
    Ok(Json(
        json!({ "settings": saved, "restart_required": e.restart_required() }),
    ))
}

async fn remote(State(e): State<Shared>) -> R<Value> {
    let urls = e.remote_urls();
    let qr = urls.first().and_then(|u| {
        qrcode::QrCode::new(u.as_bytes()).ok().map(|code| {
            code.render::<qrcode::render::svg::Color>()
                .min_dimensions(200, 200)
                .quiet_zone(true)
                .dark_color(qrcode::render::svg::Color("#000000"))
                .light_color(qrcode::render::svg::Color("#ffffff"))
                .build()
        })
    });
    let s = e.settings();
    Ok(Json(json!({
        "enabled": s.remote_access,
        "port": s.remote_port,
        "active": !urls.is_empty(),
        "urls": urls,
        "qr_svg": qr,
    })))
}

#[derive(Deserialize)]
struct Source {
    magnet: Option<String>,
    torrent: Option<String>,
}

impl Source {
    fn into_add(self) -> Result<AddTorrent<'static>, ApiError> {
        if let Some(b64) = self.torrent.filter(|t| !t.trim().is_empty()) {
            let bytes = B64
                .decode(b64.trim())
                .map_err(|_| bad("torrent file is not valid base64"))?;
            return Ok(AddTorrent::TorrentFileBytes(bytes.into()));
        }
        let m = self.magnet.unwrap_or_default();
        let m = m.trim();
        if m.is_empty() {
            return Err(bad("magnet link or torrent file is required"));
        }
        let url = if m.len() == 40 && m.chars().all(|c| c.is_ascii_hexdigit()) {
            format!("magnet:?xt=urn:btih:{m}")
        } else if m.starts_with("magnet:") || m.starts_with("http://") || m.starts_with("https://")
        {
            m.to_string()
        } else {
            return Err(bad("unsupported link"));
        };
        Ok(AddTorrent::Url(Cow::Owned(url)))
    }
}

const METADATA_TIMEOUT: Duration = Duration::from_secs(120);

async fn preview(State(e): State<Shared>, Json(src): Json<Source>) -> R<Value> {
    let add = src.into_add()?;
    let opts = AddTorrentOptions {
        list_only: true,
        ..Default::default()
    };
    let resp = tokio::time::timeout(METADATA_TIMEOUT, e.session().add_torrent(add, Some(opts)))
        .await
        .map_err(|_| {
            ApiError(
                StatusCode::GATEWAY_TIMEOUT,
                "metadata not received in time".into(),
            )
        })??;
    let (info_hash, torrent_bytes, peers) = match resp {
        AddTorrentResponse::ListOnly(r) => (r.info_hash, r.torrent_bytes, r.seen_peers),
        AddTorrentResponse::AlreadyManaged(id, h) => {
            return Ok(Json(json!({
                "info_hash": h.info_hash().as_string(),
                "name": h.name(),
                "existing_id": id,
            })));
        }
        AddTorrentResponse::Added(..) => return Err(bad("unexpected add")),
    };
    let reparsed = e
        .api
        .api_add_torrent(
            AddTorrent::TorrentFileBytes(torrent_bytes.clone()),
            Some(AddTorrentOptions {
                list_only: true,
                ..Default::default()
            }),
        )
        .await?;
    let files_raw = reparsed.details.files.as_deref().unwrap_or_default();
    let report = view::report_for(files_raw);
    let visible: Vec<_> = view::visible_files(files_raw).collect();
    let multi_file = visible.len() > 1 || visible.iter().any(|(_, f)| f.components.len() > 1);
    let files: Vec<Value> = visible
        .iter()
        .map(|(i, f)| {
            json!({
                "index": i,
                "name": f.name,
                "path": f.components,
                "length": f.length,
                "kind": crate::guard::kind_of(&f.name),
            })
        })
        .collect();
    let total: u64 = visible.iter().map(|(_, f)| f.length).sum();
    Ok(Json(json!({
        "info_hash": info_hash.as_string(),
        "name": reparsed.details.name,
        "total_bytes": total,
        "files": files,
        "multi_file": multi_file,
        "report": report,
        "kind": view::kind_for(files_raw),
        "torrent": B64.encode(&torrent_bytes),
        "peers": peers.iter().map(|p| p.to_string()).collect::<Vec<_>>(),
        "existing_id": Value::Null,
        "default_folder": e.settings().download_folder,
    })))
}

#[derive(Deserialize)]
struct AddRequest {
    #[serde(flatten)]
    source: Source,
    folder: Option<String>,
    files: Option<Vec<usize>>,
    name: Option<String>,
    #[serde(default)]
    multi_file: bool,
    #[serde(default)]
    peers: Vec<String>,
    #[serde(default)]
    paused: bool,
}

async fn add(State(e): State<Shared>, Json(req): Json<AddRequest>) -> R<Value> {
    let settings = e.settings();
    let base = req
        .folder
        .as_deref()
        .map(str::trim)
        .filter(|f| !f.is_empty())
        .map(PathBuf::from)
        .unwrap_or(settings.download_folder);
    let output_folder = match (&req.name, req.multi_file) {
        (Some(name), true) => Some(base.join(import::sanitize(name))),
        (Some(_), false) => Some(base),
        (None, _) if base == e.session_folder() => None,
        (None, _) => Some(base),
    };
    if let Some(f) = &output_folder {
        std::fs::create_dir_all(f).map_err(|err| bad(format!("cannot create folder: {err}")))?;
    }
    let initial_peers: Vec<SocketAddr> = req.peers.iter().filter_map(|p| p.parse().ok()).collect();
    let opts = AddTorrentOptions {
        paused: req.paused,
        only_files: req.files.filter(|f| !f.is_empty()),
        output_folder: output_folder.map(|f| f.to_string_lossy().into_owned()),
        overwrite: true,
        initial_peers: (!initial_peers.is_empty()).then_some(initial_peers),
        ..Default::default()
    };
    let add = req.source.into_add()?;
    let resp = tokio::time::timeout(METADATA_TIMEOUT, e.api.api_add_torrent(add, Some(opts)))
        .await
        .map_err(|_| {
            ApiError(
                StatusCode::GATEWAY_TIMEOUT,
                "metadata not received in time".into(),
            )
        })??;
    Ok(Json(
        json!({ "id": resp.id, "info_hash": resp.details.info_hash }),
    ))
}

fn all_ids(e: &Engine) -> Vec<usize> {
    e.api
        .api_torrent_list()
        .torrents
        .into_iter()
        .filter_map(|t| t.id)
        .collect()
}

async fn pause_all(State(e): State<Shared>) -> R<Value> {
    for id in all_ids(&e) {
        let _ = e.api.api_torrent_action_pause(id.into()).await;
    }
    Ok(Json(json!({})))
}

async fn resume_all(State(e): State<Shared>) -> R<Value> {
    for id in all_ids(&e) {
        let _ = e.api.api_torrent_action_start(id.into()).await;
    }
    Ok(Json(json!({})))
}

async fn torrent(State(e): State<Shared>, Path(id): Path<String>) -> R<view::Details> {
    let id = parse_id(&id)?;
    let d = e.api.api_torrent_details(id)?;
    let stats = e.api.api_stats_v1(id)?;
    Ok(Json(view::details(d, &stats)))
}

async fn peers(State(e): State<Shared>, Path(id): Path<String>) -> R<Value> {
    let id = parse_id(&id)?;
    let snap = match e.api.api_peer_stats(id, Default::default()) {
        Ok(s) => s,
        Err(_) => return Ok(Json(json!({ "peers": [] }))),
    };
    let mut peers: Vec<Value> = snap
        .peers
        .into_iter()
        .map(|(addr, p)| {
            json!({
                "address": addr,
                "client": p.client_name,
                "state": p.state,
                "connection": p.conn_kind,
                "downloaded_bytes": p.counters.fetched_bytes,
                "uploaded_bytes": p.counters.uploaded_bytes,
                "pieces": p.counters.downloaded_and_checked_pieces,
                "errors": p.counters.errors,
                "incoming": p.counters.incoming_connections > 0,
            })
        })
        .collect();
    peers.sort_by_key(|p| std::cmp::Reverse(p["downloaded_bytes"].as_u64().unwrap_or(0)));
    Ok(Json(json!({ "peers": peers })))
}

#[derive(Deserialize)]
struct PiecesQuery {
    buckets: Option<usize>,
}

async fn pieces(
    State(e): State<Shared>,
    Path(id): Path<String>,
    Query(q): Query<PiecesQuery>,
) -> R<Value> {
    let id = parse_id(&id)?;
    let buckets = q.buckets.unwrap_or(120).clamp(8, 1000);
    let (bf, total) = match e.api.api_dump_haves(id) {
        Ok(v) => v,
        Err(_) => return Ok(Json(json!({ "total": 0, "have": 0, "buckets": [] }))),
    };
    let total = total as usize;
    let bits: Vec<bool> = bf.iter().take(total).map(|b| *b).collect();
    let have = bits.iter().filter(|b| **b).count();
    let mut out = Vec::with_capacity(buckets);
    if total > 0 {
        for i in 0..buckets {
            let from = (i * total / buckets).min(total - 1);
            let to = ((i + 1) * total / buckets).clamp(from + 1, total);
            let got = bits[from..to].iter().filter(|b| **b).count();
            out.push((got as f64 / (to - from) as f64 * 100.0).round() as u8);
        }
    }
    Ok(Json(
        json!({ "total": total, "have": have, "buckets": out }),
    ))
}

async fn pause(State(e): State<Shared>, Path(id): Path<String>) -> R<Value> {
    e.api.api_torrent_action_pause(parse_id(&id)?).await?;
    Ok(Json(json!({})))
}

async fn resume(State(e): State<Shared>, Path(id): Path<String>) -> R<Value> {
    e.api.api_torrent_action_start(parse_id(&id)?).await?;
    Ok(Json(json!({})))
}

#[derive(Deserialize)]
struct RemoveQuery {
    #[serde(default)]
    files: bool,
}

async fn remove(
    State(e): State<Shared>,
    Path(id): Path<String>,
    Query(q): Query<RemoveQuery>,
) -> R<Value> {
    let id = parse_id(&id)?;
    if let Ok(d) = e.api.api_torrent_details(id) {
        e.guard_cache.lock().unwrap().remove(&d.info_hash);
    }
    if q.files {
        e.api.api_torrent_action_delete(id).await?;
    } else {
        e.api.api_torrent_action_forget(id).await?;
    }
    Ok(Json(json!({})))
}

#[derive(Deserialize)]
struct FilesRequest {
    files: Vec<usize>,
}

async fn set_files(
    State(e): State<Shared>,
    Path(id): Path<String>,
    Json(req): Json<FilesRequest>,
) -> R<Value> {
    if req.files.is_empty() {
        return Err(bad("select at least one file"));
    }
    let set: HashSet<usize> = req.files.into_iter().collect();
    e.api
        .api_torrent_action_update_only_files(parse_id(&id)?, &set)
        .await?;
    Ok(Json(json!({})))
}

#[derive(Deserialize)]
struct OpenRequest {
    file: Option<usize>,
}

async fn open(
    State(e): State<Shared>,
    ConnectInfo(addr): ConnectInfo<SocketAddr>,
    Path(id): Path<String>,
    Json(req): Json<OpenRequest>,
) -> R<Value> {
    if !is_local(&e, &addr) {
        return Err(ApiError(
            StatusCode::FORBIDDEN,
            "not available in remote mode".into(),
        ));
    }
    let d = e.api.api_torrent_details(parse_id(&id)?)?;
    let base = PathBuf::from(&d.output_folder);
    let files = d.files.unwrap_or_default();
    match req.file.and_then(|i| files.get(i)) {
        Some(f) => {
            let mut path = base;
            for c in &f.components {
                path.push(c);
            }
            opener::reveal(&path).map_err(|err| bad(err.to_string()))?;
        }
        None => {
            let target = if files.len() == 1 {
                let mut p = base.clone();
                for c in &files[0].components {
                    p.push(c);
                }
                if p.exists() {
                    opener::reveal(&p).map_err(|err| bad(err.to_string()))?;
                    return Ok(Json(json!({})));
                }
                base
            } else {
                base
            };
            opener::open(&target).map_err(|err| bad(err.to_string()))?;
        }
    }
    Ok(Json(json!({})))
}

async fn pick_folder(
    State(e): State<Shared>,
    ConnectInfo(addr): ConnectInfo<SocketAddr>,
) -> R<Value> {
    if !is_local(&e, &addr) {
        return Err(ApiError(
            StatusCode::FORBIDDEN,
            "not available in remote mode".into(),
        ));
    }
    let Some(picker) = e.folder_picker.clone() else {
        return Err(ApiError(
            StatusCode::NOT_IMPLEMENTED,
            "folder picker is not available".into(),
        ));
    };
    let start = e.settings().download_folder;
    let picked = tokio::task::spawn_blocking(move || picker(start))
        .await
        .map_err(|err| bad(err.to_string()))?;
    Ok(Json(json!({ "path": picked })))
}

async fn take_inbox(
    State(e): State<Shared>,
    ConnectInfo(addr): ConnectInfo<SocketAddr>,
) -> R<Value> {
    if !is_local(&e, &addr) {
        return Ok(Json(json!({ "items": [] })));
    }
    let items = std::mem::take(&mut *e.inbox.lock().unwrap());
    Ok(Json(json!({ "items": items })))
}

async fn restart(State(e): State<Shared>, ConnectInfo(addr): ConnectInfo<SocketAddr>) -> R<Value> {
    if !is_local(&e, &addr) {
        return Err(ApiError(
            StatusCode::FORBIDDEN,
            "not available in remote mode".into(),
        ));
    }
    let Some(hook) = e.restart.clone() else {
        return Err(ApiError(
            StatusCode::NOT_IMPLEMENTED,
            "restart is not available".into(),
        ));
    };
    tokio::spawn(async move {
        tokio::time::sleep(Duration::from_millis(200)).await;
        e.shutdown().await;
        hook();
    });
    Ok(Json(json!({})))
}

async fn import_detect() -> R<Value> {
    Ok(Json(json!({
        "qbittorrent": import::default_dir(Client::QBittorrent),
        "utorrent": import::default_dir(Client::UTorrent),
    })))
}

#[derive(Deserialize)]
struct ImportRequest {
    client: Client,
    path: Option<String>,
}

async fn import_run(State(e): State<Shared>, Json(req): Json<ImportRequest>) -> R<Value> {
    let dir = match req.path.filter(|p| !p.trim().is_empty()) {
        Some(p) => PathBuf::from(p.trim()),
        None => {
            import::default_dir(req.client).ok_or_else(|| bad("client data folder not found"))?
        }
    };
    let items = tokio::task::spawn_blocking(move || import::scan(req.client, &dir))
        .await
        .map_err(|err| bad(err.to_string()))??;
    let found = items.len();
    let (mut added, mut existing, mut failed) = (0, 0, Vec::new());
    for item in items {
        let opts = AddTorrentOptions {
            paused: item.paused,
            overwrite: true,
            output_folder: item.output_folder.map(|p| p.to_string_lossy().into_owned()),
            ..Default::default()
        };
        match e
            .session()
            .add_torrent(
                AddTorrent::TorrentFileBytes(item.torrent.into()),
                Some(opts),
            )
            .await
        {
            Ok(AddTorrentResponse::AlreadyManaged(..)) => existing += 1,
            Ok(_) => added += 1,
            Err(err) => failed.push(json!({ "source": item.source, "error": format!("{err:#}") })),
        }
    }
    Ok(Json(
        json!({ "found": found, "added": added, "existing": existing, "failed": failed }),
    ))
}

async fn stream_file(
    State(e): State<Shared>,
    Path((id, file)): Path<(String, usize)>,
    headers: HeaderMap,
) -> Result<Response, ApiError> {
    let id = parse_id(&id)?;
    Ok(stream::serve(&e, id, file, &headers).await)
}
