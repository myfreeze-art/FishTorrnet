use serde::Serialize;

#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Serialize, Hash)]
#[serde(rename_all = "lowercase")]
pub enum Level {
    Safe,
    Caution,
    Danger,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize)]
#[serde(rename_all = "snake_case")]
pub enum Finding {
    DoubleExtension,
    HiddenExtension,
    ExecutableInMedia,
    FakeCodec,
    Executable,
    Script,
    Shortcut,
    PasswordHint,
}

impl Finding {
    pub fn level(self) -> Level {
        match self {
            Finding::DoubleExtension
            | Finding::HiddenExtension
            | Finding::ExecutableInMedia
            | Finding::FakeCodec => Level::Danger,
            Finding::Executable | Finding::Script | Finding::Shortcut | Finding::PasswordHint => {
                Level::Caution
            }
        }
    }
}

#[derive(Debug, Clone, Serialize)]
pub struct Issue {
    pub finding: Finding,
    pub level: Level,
    pub file: String,
}

#[derive(Debug, Clone, Serialize)]
pub struct Report {
    pub level: Level,
    pub issues: Vec<Issue>,
    pub files_checked: usize,
}

pub struct FileEntry<'a> {
    pub path: &'a str,
    pub length: u64,
}

const EXECUTABLE: &[&str] = &[
    "exe", "scr", "com", "pif", "msi", "msp", "cpl", "dll", "sys", "app", "dmg", "pkg", "deb",
    "rpm", "apk", "appimage", "run",
];
const SCRIPT: &[&str] = &[
    "bat", "cmd", "vbs", "vbe", "js", "jse", "wsf", "wsh", "ps1", "psm1", "hta", "jar", "reg",
    "sh", "command", "scpt",
];
const SHORTCUT: &[&str] = &["lnk", "url", "website", "webloc", "desktop"];
const VIDEO: &[&str] = &[
    "mkv", "mp4", "m4v", "avi", "mov", "wmv", "webm", "ts", "m2ts", "mpg", "mpeg", "flv", "ogv",
    "3gp",
];
const AUDIO: &[&str] = &[
    "mp3", "flac", "ogg", "opus", "m4a", "aac", "wav", "wma", "ape", "alac", "aiff",
];
const DOCUMENT: &[&str] = &[
    "pdf", "epub", "fb2", "djvu", "mobi", "azw3", "doc", "docx", "txt", "cbr", "cbz",
];
const DISK_IMAGE: &[&str] = &["iso", "img"];
const ARCHIVE: &[&str] = &["zip", "rar", "7z", "tar", "gz", "xz", "bz2", "zst"];
const IMAGE: &[&str] = &["jpg", "jpeg", "png", "gif", "webp", "bmp", "nfo", "srt", "ass", "sub"];

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize)]
#[serde(rename_all = "lowercase")]
pub enum Kind {
    Video,
    Audio,
    Document,
    Disk,
    Archive,
    Program,
    Image,
    Other,
}

pub fn extension(name: &str) -> Option<String> {
    let base = name.rsplit(['/', '\\']).next().unwrap_or(name);
    let (stem, ext) = base.rsplit_once('.')?;
    if stem.is_empty() || ext.is_empty() || ext.len() > 10 {
        return None;
    }
    Some(ext.trim().to_ascii_lowercase())
}

pub fn kind_of(name: &str) -> Kind {
    let Some(ext) = extension(name) else {
        return Kind::Other;
    };
    let e = ext.as_str();
    if VIDEO.contains(&e) {
        Kind::Video
    } else if AUDIO.contains(&e) {
        Kind::Audio
    } else if DOCUMENT.contains(&e) {
        Kind::Document
    } else if DISK_IMAGE.contains(&e) {
        Kind::Disk
    } else if ARCHIVE.contains(&e) {
        Kind::Archive
    } else if EXECUTABLE.contains(&e) || SCRIPT.contains(&e) {
        Kind::Program
    } else if IMAGE.contains(&e) {
        Kind::Image
    } else {
        Kind::Other
    }
}

pub fn dominant_kind<'a>(files: impl IntoIterator<Item = FileEntry<'a>>) -> Kind {
    let mut totals: Vec<(Kind, u64)> = Vec::new();
    for f in files {
        let k = kind_of(f.path);
        if matches!(k, Kind::Image | Kind::Other) {
            continue;
        }
        match totals.iter_mut().find(|(kk, _)| *kk == k) {
            Some((_, v)) => *v += f.length,
            None => totals.push((k, f.length)),
        }
    }
    totals
        .into_iter()
        .max_by_key(|(_, v)| *v)
        .map(|(k, _)| k)
        .unwrap_or(Kind::Other)
}

fn is_media_ext(e: &str) -> bool {
    VIDEO.contains(&e) || AUDIO.contains(&e) || DOCUMENT.contains(&e) || IMAGE.contains(&e)
}

fn is_dangerous_ext(e: &str) -> bool {
    EXECUTABLE.contains(&e) || SCRIPT.contains(&e)
}

const BIDI: &[char] = &[
    '\u{202A}', '\u{202B}', '\u{202C}', '\u{202D}', '\u{202E}', '\u{2066}', '\u{2067}', '\u{2068}',
    '\u{2069}', '\u{200E}', '\u{200F}',
];

fn file_name(path: &str) -> &str {
    path.rsplit(['/', '\\']).next().unwrap_or(path)
}

fn has_double_extension(name: &str) -> bool {
    let Some(ext) = extension(name) else {
        return false;
    };
    if !is_dangerous_ext(&ext) {
        return false;
    }
    let stem = &name[..name.len() - ext.len() - 1];
    let stem = stem.trim_end();
    match extension(stem) {
        Some(inner) => is_media_ext(&inner) || inner == "zip" || inner == "rar",
        None => false,
    }
}

pub fn check<'a>(files: impl IntoIterator<Item = FileEntry<'a>>) -> Report {
    let files: Vec<FileEntry<'a>> = files.into_iter().collect();
    let mut issues = Vec::new();

    let mut media_bytes = 0u64;
    let mut total_bytes = 0u64;
    for f in &files {
        total_bytes += f.length;
        if let Some(e) = extension(f.path)
            && (VIDEO.contains(&e.as_str()) || AUDIO.contains(&e.as_str())) {
                media_bytes += f.length;
            }
    }
    let media_torrent = total_bytes > 0 && media_bytes * 10 >= total_bytes * 7;

    for f in &files {
        let name = file_name(f.path);
        let lower = name.to_lowercase();
        let ext = extension(name);
        let ext = ext.as_deref().unwrap_or("");
        let mut push = |finding: Finding| {
            issues.push(Issue {
                finding,
                level: finding.level(),
                file: f.path.to_string(),
            })
        };

        if name.chars().any(|c| BIDI.contains(&c)) {
            push(Finding::HiddenExtension);
            continue;
        }
        if has_double_extension(name) {
            push(Finding::DoubleExtension);
            continue;
        }
        if is_dangerous_ext(ext) {
            if ["codec", "player", "decoder", "plugin", "kodek"]
                .iter()
                .any(|w| lower.contains(w))
                && media_torrent
            {
                push(Finding::FakeCodec);
            } else if media_torrent {
                push(Finding::ExecutableInMedia);
            } else if SCRIPT.contains(&ext) {
                push(Finding::Script);
            } else {
                push(Finding::Executable);
            }
            continue;
        }
        if SHORTCUT.contains(&ext) {
            push(Finding::Shortcut);
            continue;
        }
        if ext == "txt"
            && ["password", "parol", "пароль", "pass"]
                .iter()
                .any(|w| lower.contains(w))
        {
            push(Finding::PasswordHint);
        }
    }

    issues.sort_by_key(|i| std::cmp::Reverse(i.level));
    let level = issues.iter().map(|i| i.level).max().unwrap_or(Level::Safe);
    let program_torrent = matches!(
        dominant_kind(files.iter().map(|f| FileEntry {
            path: f.path,
            length: f.length
        })),
        Kind::Program | Kind::Disk | Kind::Archive
    );
    let level = if level == Level::Caution
        && program_torrent
        && issues
            .iter()
            .all(|i| matches!(i.finding, Finding::Executable | Finding::Script))
    {
        Level::Safe
    } else {
        level
    };
    Report {
        level,
        issues,
        files_checked: files.len(),
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn run(files: &[(&str, u64)]) -> Report {
        check(files.iter().map(|(p, l)| FileEntry {
            path: p,
            length: *l,
        }))
    }

    #[test]
    fn clean_movie() {
        let r = run(&[
            ("Movie/movie.mkv", 4_000_000_000),
            ("Movie/movie.srt", 80_000),
            ("Movie/cover.jpg", 200_000),
        ]);
        assert_eq!(r.level, Level::Safe);
        assert!(r.issues.is_empty());
        assert_eq!(r.files_checked, 3);
    }

    #[test]
    fn double_extension() {
        let r = run(&[("setup.mp4.exe", 2_000_000)]);
        assert_eq!(r.level, Level::Danger);
        assert_eq!(r.issues[0].finding, Finding::DoubleExtension);
    }

    #[test]
    fn padded_double_extension() {
        let r = run(&[("film.avi          .scr", 2_000_000)]);
        assert_eq!(r.issues[0].finding, Finding::DoubleExtension);
    }

    #[test]
    fn bidi_override() {
        let r = run(&[("movie\u{202E}4pm.exe", 1_000)]);
        assert_eq!(r.issues[0].finding, Finding::HiddenExtension);
        assert_eq!(r.level, Level::Danger);
    }

    #[test]
    fn executable_inside_movie() {
        let r = run(&[("Film/film.mkv", 3_000_000_000), ("Film/play.exe", 900_000)]);
        assert_eq!(r.level, Level::Danger);
        assert_eq!(r.issues[0].finding, Finding::ExecutableInMedia);
    }

    #[test]
    fn fake_codec() {
        let r = run(&[
            ("Film/film.mp4", 3_000_000_000),
            ("Film/Codec_Install.exe", 900_000),
        ]);
        assert_eq!(r.issues[0].finding, Finding::FakeCodec);
    }

    #[test]
    fn software_torrent_is_not_flagged() {
        let r = run(&[
            ("App/setup.exe", 80_000_000),
            ("App/readme.txt", 1_000),
            ("App/install.bat", 400),
        ]);
        assert_eq!(r.level, Level::Safe);
        assert_eq!(r.issues.len(), 2);
    }

    #[test]
    fn linux_iso_is_safe() {
        let r = run(&[("ubuntu-26.04-desktop-amd64.iso", 5_800_000_000)]);
        assert_eq!(r.level, Level::Safe);
    }

    #[test]
    fn shortcut_and_password() {
        let r = run(&[
            ("Album/01.flac", 40_000_000),
            ("Album/Visit our site.url", 100),
            ("Album/PASSWORD.txt", 100),
        ]);
        assert_eq!(r.level, Level::Caution);
        assert_eq!(r.issues.len(), 2);
    }

    #[test]
    fn kinds() {
        assert_eq!(kind_of("a/b/c.MKV"), Kind::Video);
        assert_eq!(kind_of("track.flac"), Kind::Audio);
        assert_eq!(kind_of("book.epub"), Kind::Document);
        assert_eq!(kind_of("debian.iso"), Kind::Disk);
        assert_eq!(kind_of("noext"), Kind::Other);
        assert_eq!(kind_of(".hidden"), Kind::Other);
        let k = dominant_kind(
            [("a.mp3", 10u64), ("b.mp3", 10), ("cover.jpg", 100), ("x.pdf", 15)]
                .iter()
                .map(|(p, l)| FileEntry { path: p, length: *l }),
        );
        assert_eq!(k, Kind::Audio);
    }
}
