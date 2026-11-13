use std::path::{Path, PathBuf};

use anyhow::{Context, bail};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize, Default)]
#[serde(rename_all = "lowercase")]
pub enum Theme {
    #[default]
    System,
    Dark,
    Light,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize, Default)]
#[serde(rename_all = "lowercase")]
pub enum Language {
    #[default]
    Auto,
    En,
    Ru,
    Uk,
    De,
    Fr,
    Es,
    Pt,
    Zh,
    Ja,
    Tr,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(default)]
pub struct Settings {
    pub download_folder: PathBuf,
    pub listen_port: u16,
    pub upnp: bool,
    pub utp: bool,
    pub dht: bool,
    pub lsd: bool,
    pub download_limit_kib: u32,
    pub upload_limit_kib: u32,
    pub peer_limit: u32,
    pub remote_access: bool,
    pub remote_port: u16,
    pub theme: Theme,
    pub language: Language,
    pub close_to_tray: bool,
}

impl Default for Settings {
    fn default() -> Self {
        Self {
            download_folder: default_download_folder(),
            listen_port: 51420,
            upnp: true,
            utp: true,
            dht: true,
            lsd: true,
            download_limit_kib: 0,
            upload_limit_kib: 0,
            peer_limit: 200,
            remote_access: false,
            remote_port: 8787,
            theme: Theme::System,
            language: Language::Auto,
            close_to_tray: true,
        }
    }
}

fn default_download_folder() -> PathBuf {
    dirs::download_dir()
        .or_else(|| dirs::home_dir().map(|h| h.join("Downloads")))
        .unwrap_or_else(|| PathBuf::from("."))
        .join("FishTorrnet")
}

impl Settings {
    pub fn load(path: &Path) -> Self {
        std::fs::read(path)
            .ok()
            .and_then(|b| serde_json::from_slice(&b).ok())
            .unwrap_or_default()
    }

    pub fn save(&self, path: &Path) -> anyhow::Result<()> {
        if let Some(dir) = path.parent() {
            std::fs::create_dir_all(dir)?;
        }
        let tmp = path.with_extension("json.tmp");
        std::fs::write(&tmp, serde_json::to_vec_pretty(self)?)?;
        std::fs::rename(&tmp, path).context("cannot save settings")
    }

    pub fn validate(&self) -> anyhow::Result<()> {
        if self.download_folder.as_os_str().is_empty() {
            bail!("download folder is required");
        }
        if self.listen_port < 1024 {
            bail!("listen port must be between 1024 and 65535");
        }
        if self.remote_port < 1024 {
            bail!("remote port must be between 1024 and 65535");
        }
        if self.remote_access && self.remote_port == self.listen_port {
            bail!("remote port must differ from listen port");
        }
        if !(10..=2000).contains(&self.peer_limit) {
            bail!("peer limit must be between 10 and 2000");
        }
        Ok(())
    }

    pub fn needs_restart(&self, applied: &Settings) -> bool {
        self.listen_port != applied.listen_port
            || self.upnp != applied.upnp
            || self.utp != applied.utp
            || self.dht != applied.dht
            || self.lsd != applied.lsd
            || self.peer_limit != applied.peer_limit
            || self.remote_access != applied.remote_access
            || self.remote_port != applied.remote_port
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn roundtrip() {
        let dir = tempfile::tempdir().unwrap();
        let path = dir.path().join("settings.json");
        let s = Settings {
            listen_port: 40000,
            theme: Theme::Dark,
            ..Settings::default()
        };
        s.save(&path).unwrap();
        assert_eq!(Settings::load(&path), s);
    }

    #[test]
    fn missing_fields_use_defaults() {
        let s: Settings = serde_json::from_str(r#"{"listen_port": 50000}"#).unwrap();
        assert_eq!(s.listen_port, 50000);
        assert!(s.dht);
        assert_eq!(s.peer_limit, 200);
    }

    #[test]
    fn languages() {
        for code in [
            "auto", "en", "ru", "uk", "de", "fr", "es", "pt", "zh", "ja", "tr",
        ] {
            let s: Settings =
                serde_json::from_str(&format!(r#"{{"language": "{code}"}}"#)).unwrap();
            assert_eq!(serde_json::to_value(s.language).unwrap(), code);
        }
        assert_eq!(Settings::default().language, Language::Auto);
    }

    #[test]
    fn validation() {
        let mut s = Settings::default();
        assert!(s.validate().is_ok());
        s.listen_port = 80;
        assert!(s.validate().is_err());
        s.listen_port = 50000;
        s.remote_access = true;
        s.remote_port = 50000;
        assert!(s.validate().is_err());
    }

    #[test]
    fn restart_detection() {
        let a = Settings::default();
        let mut b = a.clone();
        b.download_limit_kib = 100;
        b.theme = Theme::Light;
        assert!(!b.needs_restart(&a));
        b.listen_port = 50001;
        assert!(b.needs_restart(&a));
    }
}
