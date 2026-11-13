use std::path::{Path, PathBuf};

use serde::{Deserialize, Serialize};

use crate::bencode::{self, Value};

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum Client {
    QBittorrent,
    UTorrent,
}

#[derive(Debug)]
pub struct Item {
    pub torrent: Vec<u8>,
    pub output_folder: Option<PathBuf>,
    pub paused: bool,
    pub source: String,
}

pub struct TorrentMeta {
    pub name: String,
    pub multi_file: bool,
}

pub fn torrent_meta(bytes: &[u8]) -> Option<TorrentMeta> {
    let v = bencode::decode(bytes).ok()?;
    let info = v.get("info")?;
    let name = info
        .get("name.utf-8")
        .or_else(|| info.get("name"))?
        .as_str()?
        .to_string();
    let multi_file = info.get("files").is_some();
    Some(TorrentMeta { name, multi_file })
}

pub fn content_folder(save_path: &Path, torrent: &[u8]) -> PathBuf {
    match torrent_meta(torrent) {
        Some(m) if m.multi_file => save_path.join(sanitize(&m.name)),
        _ => save_path.to_path_buf(),
    }
}

pub fn sanitize(name: &str) -> String {
    let cleaned: String = name
        .chars()
        .map(|c| match c {
            '/' | '\\' | ':' | '*' | '?' | '"' | '<' | '>' | '|' => '_',
            c if c.is_control() => '_',
            c => c,
        })
        .collect();
    let cleaned = cleaned.trim().trim_matches('.').to_string();
    if cleaned.is_empty() { "torrent".into() } else { cleaned }
}

pub fn default_dir(client: Client) -> Option<PathBuf> {
    let candidates: Vec<PathBuf> = match client {
        Client::QBittorrent => {
            let mut v = Vec::new();
            if let Some(d) = dirs::data_local_dir() {
                v.push(d.join("qBittorrent").join("BT_backup"));
                v.push(d.join("data").join("qBittorrent").join("BT_backup"));
            }
            if let Some(d) = dirs::data_dir() {
                v.push(d.join("qBittorrent").join("BT_backup"));
            }
            if let Some(h) = dirs::home_dir() {
                v.push(h.join(".var/app/org.qbittorrent.qBittorrent/data/qBittorrent/BT_backup"));
            }
            v
        }
        Client::UTorrent => {
            let mut v = Vec::new();
            if let Some(d) = dirs::config_dir() {
                v.push(d.join("uTorrent"));
                v.push(d.join("uTorrent Web"));
            }
            if let Some(d) = dirs::data_dir() {
                v.push(d.join("uTorrent"));
            }
            v
        }
    };
    candidates.into_iter().find(|p| match client {
        Client::QBittorrent => p.is_dir(),
        Client::UTorrent => p.join("resume.dat").is_file(),
    })
}

pub fn scan(client: Client, dir: &Path) -> anyhow::Result<Vec<Item>> {
    match client {
        Client::QBittorrent => scan_qbittorrent(dir),
        Client::UTorrent => scan_utorrent(dir),
    }
}

fn scan_qbittorrent(dir: &Path) -> anyhow::Result<Vec<Item>> {
    let mut out = Vec::new();
    for entry in std::fs::read_dir(dir)? {
        let path = entry?.path();
        if path.extension().and_then(|e| e.to_str()) != Some("torrent") {
            continue;
        }
        let Ok(torrent) = std::fs::read(&path) else {
            continue;
        };
        let resume = std::fs::read(path.with_extension("fastresume"))
            .ok()
            .and_then(|b| bencode::decode(&b).ok());
        let save_path = resume.as_ref().and_then(|r| {
            r.get("qBt-savePath")
                .and_then(Value::as_str)
                .filter(|s| !s.is_empty())
                .or_else(|| r.get("save_path").and_then(Value::as_str))
                .map(PathBuf::from)
        });
        let paused = resume
            .as_ref()
            .and_then(|r| r.get("paused").or_else(|| r.get("qBt-paused")))
            .and_then(Value::as_int)
            .is_some_and(|v| v != 0);
        let output_folder = save_path.map(|p| content_folder(&p, &torrent));
        out.push(Item {
            torrent,
            output_folder,
            paused,
            source: path.file_name().unwrap_or_default().to_string_lossy().into_owned(),
        });
    }
    Ok(out)
}

fn scan_utorrent(dir: &Path) -> anyhow::Result<Vec<Item>> {
    let resume = bencode::decode(&std::fs::read(dir.join("resume.dat"))?)?;
    let Some(entries) = resume.as_dict() else {
        return Ok(Vec::new());
    };
    let mut out = Vec::new();
    for (key, val) in entries {
        let Ok(key) = std::str::from_utf8(key) else {
            continue;
        };
        if !key.ends_with(".torrent") {
            continue;
        }
        let file = Path::new(key);
        let file = if file.is_absolute() { file.to_path_buf() } else { dir.join(file) };
        let Ok(torrent) = std::fs::read(&file) else {
            continue;
        };
        let content = val.get("path").and_then(Value::as_str).map(PathBuf::from);
        let multi = torrent_meta(&torrent).is_some_and(|m| m.multi_file);
        let output_folder = content.map(|p| {
            if multi {
                p
            } else {
                p.parent().map(Path::to_path_buf).unwrap_or(p)
            }
        });
        let paused = val
            .get("started")
            .and_then(Value::as_int)
            .is_some_and(|s| s == 0);
        out.push(Item {
            torrent,
            output_folder,
            paused,
            source: key.to_string(),
        });
    }
    Ok(out)
}

#[cfg(test)]
mod tests {
    use super::*;

    fn single() -> Vec<u8> {
        b"d4:infod6:lengthi10e4:name8:file.iso12:piece lengthi16384e6:pieces20:aaaaaaaaaaaaaaaaaaaaee".to_vec()
    }

    fn multi() -> Vec<u8> {
        b"d4:infod5:filesld6:lengthi5e4:pathl5:a.txteed6:lengthi5e4:pathl5:b.txteee4:name6:Folder12:piece lengthi16384e6:pieces20:aaaaaaaaaaaaaaaaaaaaee".to_vec()
    }

    #[test]
    fn meta() {
        let m = torrent_meta(&single()).unwrap();
        assert_eq!(m.name, "file.iso");
        assert!(!m.multi_file);
        let m = torrent_meta(&multi()).unwrap();
        assert_eq!(m.name, "Folder");
        assert!(m.multi_file);
    }

    #[test]
    fn content_folders() {
        let base = Path::new("/data");
        assert_eq!(content_folder(base, &single()), PathBuf::from("/data"));
        assert_eq!(content_folder(base, &multi()), PathBuf::from("/data/Folder"));
    }

    #[test]
    fn sanitizes() {
        assert_eq!(sanitize("a/b:c"), "a_b_c");
        assert_eq!(sanitize(" .. "), "torrent");
    }

    #[test]
    fn qbittorrent_backup() {
        let dir = tempfile::tempdir().unwrap();
        std::fs::write(dir.path().join("abc.torrent"), multi()).unwrap();
        std::fs::write(
            dir.path().join("abc.fastresume"),
            b"d9:save_path8:/srv/dl/6:pausedi1ee",
        )
        .unwrap();
        std::fs::write(dir.path().join("def.torrent"), single()).unwrap();
        let mut items = scan(Client::QBittorrent, dir.path()).unwrap();
        items.sort_by(|a, b| a.source.cmp(&b.source));
        assert_eq!(items.len(), 2);
        assert_eq!(items[0].output_folder, Some(PathBuf::from("/srv/dl/Folder")));
        assert!(items[0].paused);
        assert_eq!(items[1].output_folder, None);
        assert!(!items[1].paused);
    }

    #[test]
    fn utorrent_resume() {
        let dir = tempfile::tempdir().unwrap();
        std::fs::write(dir.path().join("one.torrent"), single()).unwrap();
        std::fs::write(
            dir.path().join("resume.dat"),
            b"d10:.fileguard3:xyz11:one.torrentd4:path16:/mnt/dl/file.iso7:startedi0eee",
        )
        .unwrap();
        let items = scan(Client::UTorrent, dir.path()).unwrap();
        assert_eq!(items.len(), 1);
        assert_eq!(items[0].output_folder, Some(PathBuf::from("/mnt/dl")));
        assert!(items[0].paused);
    }
}
