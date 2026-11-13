use librqbit::api::{TorrentDetailsResponse, TorrentDetailsResponseFile};
use librqbit::{TorrentStats, TorrentStatsState};
use serde::Serialize;

use crate::guard::{self, FileEntry, Kind, Level, Report};

#[derive(Debug, Clone, Copy, Serialize, PartialEq, Eq)]
#[serde(rename_all = "snake_case")]
pub enum Status {
    Checking,
    Metadata,
    Downloading,
    Stalled,
    Seeding,
    Done,
    Paused,
    Error,
}

#[derive(Debug, Serialize)]
pub struct Summary {
    pub id: usize,
    pub info_hash: String,
    pub name: String,
    pub status: Status,
    pub progress_bytes: u64,
    pub total_bytes: u64,
    pub uploaded_bytes: u64,
    pub download_bps: u64,
    pub upload_bps: u64,
    pub peers: u32,
    pub seeds: u32,
    pub eta_secs: Option<u64>,
    pub error: Option<String>,
    pub guard: Level,
    pub kind: Kind,
    pub output_folder: String,
}

#[derive(Debug, Serialize)]
pub struct PeerCounts {
    pub live: u32,
    pub tcp: u32,
    pub utp: u32,
    pub seeds: u32,
    pub connecting: u32,
    pub queued: u32,
    pub seen: u32,
    pub dead: u32,
}

#[derive(Debug, Serialize)]
pub struct FileView {
    pub index: usize,
    pub name: String,
    pub path: Vec<String>,
    pub length: u64,
    pub progress_bytes: u64,
    pub included: bool,
    pub kind: Kind,
}

#[derive(Debug, Serialize)]
pub struct Details {
    pub info_hash: String,
    pub name: String,
    pub output_folder: String,
    pub total_pieces: u32,
    pub files: Vec<FileView>,
    pub peers: Option<PeerCounts>,
    pub average_piece_ms: Option<u64>,
    pub fetched_bytes: u64,
    pub ratio: f64,
    pub report: Report,
}

pub fn status(stats: &TorrentStats) -> Status {
    match stats.state {
        TorrentStatsState::Initializing { .. } => Status::Checking,
        TorrentStatsState::Paused => {
            if stats.finished {
                Status::Done
            } else {
                Status::Paused
            }
        }
        TorrentStatsState::Error => Status::Error,
        TorrentStatsState::Live => {
            let live = stats.live.as_ref();
            if stats.finished {
                return Status::Seeding;
            }
            if stats.total_bytes == 0 {
                return Status::Metadata;
            }
            let down = live.map(|l| l.download_speed.as_bytes()).unwrap_or(0);
            let peers = live.map(|l| l.snapshot.peer_stats.live).unwrap_or(0);
            if down == 0 && peers == 0 {
                Status::Stalled
            } else {
                Status::Downloading
            }
        }
    }
}

pub fn eta(stats: &TorrentStats) -> Option<u64> {
    if stats.finished {
        return None;
    }
    let bps = stats.live.as_ref()?.download_speed.as_bytes();
    if bps < 1024 {
        return None;
    }
    Some(stats.total_bytes.saturating_sub(stats.progress_bytes) / bps)
}

pub fn visible_files(
    files: &[TorrentDetailsResponseFile],
) -> impl Iterator<Item = (usize, &TorrentDetailsResponseFile)> {
    files
        .iter()
        .enumerate()
        .filter(|(_, f)| !f.attributes.padding)
}

fn entries(files: &[TorrentDetailsResponseFile]) -> impl Iterator<Item = FileEntry<'_>> {
    visible_files(files).map(|(_, f)| FileEntry {
        path: f.name.as_str(),
        length: f.length,
    })
}

pub fn report_for(files: &[TorrentDetailsResponseFile]) -> Report {
    guard::check(entries(files))
}

pub fn kind_for(files: &[TorrentDetailsResponseFile]) -> Kind {
    guard::dominant_kind(entries(files))
}

pub fn summary(
    t: &TorrentDetailsResponse,
    stats: &TorrentStats,
    level: Level,
    kind: Kind,
) -> Summary {
    let live = stats.live.as_ref();
    let status = status(stats);
    let active = matches!(
        status,
        Status::Downloading | Status::Seeding | Status::Stalled
    );
    Summary {
        id: t.id.unwrap_or_default(),
        info_hash: t.info_hash.clone(),
        name: t.name.clone().unwrap_or_else(|| t.info_hash.clone()),
        status,
        progress_bytes: stats.progress_bytes,
        total_bytes: stats.total_bytes,
        uploaded_bytes: stats.uploaded_bytes,
        download_bps: if active && !stats.finished {
            live.map(|l| l.download_speed.as_bytes()).unwrap_or(0)
        } else {
            0
        },
        upload_bps: if active {
            live.map(|l| l.upload_speed.as_bytes()).unwrap_or(0)
        } else {
            0
        },
        peers: live.map(|l| l.snapshot.peer_stats.live).unwrap_or(0),
        seeds: live
            .map(|l| l.snapshot.peer_stats.live_seeders)
            .unwrap_or(0),
        eta_secs: eta(stats),
        error: stats.error.clone(),
        guard: level,
        kind,
        output_folder: t.output_folder.clone(),
    }
}

pub fn details(d: TorrentDetailsResponse, stats: &TorrentStats) -> Details {
    let raw = d.files.unwrap_or_default();
    let report = report_for(&raw);
    let files = visible_files(&raw)
        .map(|(i, f)| FileView {
            index: i,
            name: f.name.clone(),
            path: f.components.clone(),
            length: f.length,
            progress_bytes: stats.file_progress.get(i).copied().unwrap_or(0),
            included: f.included,
            kind: guard::kind_of(&f.name),
        })
        .collect();
    let live = stats.live.as_ref();
    let peers = live.map(|l| {
        let p = &l.snapshot.peer_stats;
        PeerCounts {
            live: p.live,
            tcp: p.live_tcp,
            utp: p.live_utp,
            seeds: p.live_seeders,
            connecting: p.connecting,
            queued: p.queued,
            seen: p.seen,
            dead: p.dead,
        }
    });
    let ratio = if stats.progress_bytes > 0 {
        stats.uploaded_bytes as f64 / stats.progress_bytes as f64
    } else {
        0.0
    };
    Details {
        name: d.name.unwrap_or_else(|| d.info_hash.clone()),
        info_hash: d.info_hash,
        output_folder: d.output_folder,
        total_pieces: d.total_pieces,
        files,
        peers,
        average_piece_ms: live
            .and_then(|l| l.average_piece_download_time)
            .map(|t| t.as_millis() as u64),
        fetched_bytes: live.map(|l| l.snapshot.fetched_bytes).unwrap_or(0),
        ratio,
        report,
    }
}
