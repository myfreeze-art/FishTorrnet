<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="assets/logo-dark.svg">
    <img src="assets/logo-light.svg" width="112" height="112" alt="FishTorrnet">
  </picture>
</p>

<h1 align="center">FishTorrnet</h1>

<p align="center">
  <b>A fast and honest BitTorrent client.</b><br>
  No ads. No telemetry. Open source.
</p>

<p align="center">
  <a href="https://github.com/myfreeze-art/FishTorrnet/releases/latest"><img src="https://img.shields.io/github/v/release/myfreeze-art/FishTorrnet?style=flat-square&color=ff6a3d&label=release" alt="Latest release"></a>
  <a href="https://github.com/myfreeze-art/FishTorrnet/releases"><img src="https://img.shields.io/github/downloads/myfreeze-art/FishTorrnet/total?style=flat-square&color=2f7bff" alt="Downloads"></a>
  <a href="https://github.com/myfreeze-art/FishTorrnet/actions/workflows/ci.yml"><img src="https://img.shields.io/github/actions/workflow/status/myfreeze-art/FishTorrnet/ci.yml?branch=main&style=flat-square&label=CI" alt="CI"></a>
  <a href="LICENSE"><img src="https://img.shields.io/github/license/myfreeze-art/FishTorrnet?style=flat-square&color=34c77b" alt="License"></a>
  <img src="https://img.shields.io/badge/platforms-Windows%20%7C%20macOS%20%7C%20Linux%20%7C%20Docker-6c6c75?style=flat-square" alt="Platforms">
  <img src="https://img.shields.io/badge/languages-10-a77bf3?style=flat-square" alt="10 languages">
</p>

<p align="center">
  <b>English</b> ·
  <a href="docs/i18n/README.ru.md">Русский</a> ·
  <a href="docs/i18n/README.uk.md">Українська</a> ·
  <a href="docs/i18n/README.de.md">Deutsch</a> ·
  <a href="docs/i18n/README.fr.md">Français</a> ·
  <a href="docs/i18n/README.es.md">Español</a> ·
  <a href="docs/i18n/README.pt-BR.md">Português</a> ·
  <a href="docs/i18n/README.zh-CN.md">简体中文</a> ·
  <a href="docs/i18n/README.ja.md">日本語</a> ·
  <a href="docs/i18n/README.tr.md">Türkçe</a>
</p>

<p align="center">
  <a href="#download">Download</a> ·
  <a href="#features">Features</a> ·
  <a href="#build-from-source">Build</a> ·
  <a href="CONTRIBUTING.md">Contribute</a>
</p>

<p align="center">
  <picture>
    <source media="(prefers-color-scheme: light)" srcset="docs/screenshots/main-light.png">
    <img src="docs/screenshots/main-dark.png" width="900" alt="FishTorrnet main window">
  </picture>
</p>

## Features

- **Watch while it downloads.** Videos and music start playing right away in the built-in player, because the pieces you need are fetched first. You can also open the stream in VLC.
- **FishGuard.** Every torrent is checked before it starts. FishTorrnet catches double extensions like `video.mp4.exe`, hidden characters that flip a file name, programs and fake codecs inside movie torrents, ad shortcuts and password files. A dangerous torrent cannot be added until you confirm the risk.
- **Control from your phone.** Turn on remote access and scan the QR code. The interface adapts to small screens.
- **Move in with one click.** Import your torrents from qBittorrent and uTorrent together with their folders. Downloaded files are verified and keep seeding.
- **Plain BitTorrent.** Magnet links, .torrent files, trackers, DHT, PEX, uTP, UPnP and local peer discovery. FishTorrnet shares the same swarm as qBittorrent, Transmission and every other client.
- **Looks right everywhere.** Dark and light themes with a matching logo, 10 interface languages that follow your system, speed limits without a restart.

| | FishTorrnet | qBittorrent | Transmission |
| --- | :---: | :---: | :---: |
| No ads, open source | Yes | Yes | Yes |
| Built-in player while downloading | Yes | Sequential download only | No |
| Malware check before download | Yes | No | No |
| Phone control with a QR code | Yes | Web UI | Web UI |
| Import from other clients | Yes | No | No |
| Headless server and Docker image | Yes | Yes | Yes |

<table>
  <tr>
    <td width="62%"><img src="docs/screenshots/add-fishguard.png" alt="FishGuard warns about malware"></td>
    <td width="38%"><img src="docs/screenshots/mobile.png" alt="Phone interface"></td>
  </tr>
  <tr>
    <td align="center">FishGuard stops a fake movie with <code>.mp4.exe</code> inside</td>
    <td align="center">The same downloads on a phone</td>
  </tr>
</table>

## Download

Get the latest version on the [Releases](https://github.com/myfreeze-art/FishTorrnet/releases/latest) page.

| System | How to install |
| --- | --- |
| Windows 10 and 11 | `FishTorrnet_x64-setup.exe` or `winget install myfreeze-art.FishTorrnet` |
| macOS 11 and newer | `FishTorrnet_universal.dmg`, works on Intel and Apple Silicon |
| Ubuntu, Debian, Mint | `.deb` package |
| Fedora, openSUSE | `.rpm` package |
| Arch Linux | `yay -S fishtorrnet-bin` |
| Any Linux | `.AppImage` |
| Server or NAS | `docker run -p 8787:8787 -v ./downloads:/downloads ghcr.io/myfreeze-art/fishtorrnet` |

FishTorrnet is free, so the installers are not signed with a paid certificate, and your system will warn you once. On Windows click **More info**, then **Run anyway**. On macOS open **System Settings**, go to **Privacy & Security** and click **Open Anyway**. Every release comes with `SHA256SUMS.txt`, so you can check that a file has not been changed.

## Languages

The app speaks English, Русский, Українська, Deutsch, Français, Español, Português, 简体中文, 日本語 and Türkçe. It picks the language of your system, and you can change it in **Settings → Interface**. Want to add yours? See [docs/TRANSLATING.md](docs/TRANSLATING.md).

## Build from source

You need Rust 1.85+ and Node.js 20+. On Linux, install the WebKitGTK development packages first (see [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md)).

```sh
git clone https://github.com/myfreeze-art/FishTorrnet.git
cd FishTorrnet
npm ci && npm ci --prefix ui
npm run app:build
```

Installers end up in `target/release/bundle`. To run without a window on a server, use `cargo build --release -p fishtorrnet-server`.

## Documentation

- [Development, project layout and HTTP API](docs/DEVELOPMENT.md)
- [Releases and publishing to stores](packaging/README.md)
- [Translating the app](docs/TRANSLATING.md)
- [Contributing](CONTRIBUTING.md) and [security policy](SECURITY.md)

## License

FishTorrnet is free software under the [GNU GPL v3 or later](LICENSE). The BitTorrent core is [librqbit](https://github.com/ikatson/rqbit) (Apache-2.0).
