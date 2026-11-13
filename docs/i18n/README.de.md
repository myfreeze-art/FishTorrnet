<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="../../assets/logo-dark.svg">
    <img src="../../assets/logo-light.svg" width="112" height="112" alt="FishTorrnet">
  </picture>
</p>

<h1 align="center">FishTorrnet</h1>

<p align="center">
  <b>Ein schneller und ehrlicher BitTorrent-Client.</b><br>
  Keine Werbung. Keine Telemetrie. Open Source.
</p>

<p align="center">
  <a href="https://github.com/myfreeze-art/FishTorrnet/releases/latest"><img src="https://img.shields.io/github/v/release/myfreeze-art/FishTorrnet?style=flat-square&color=ff6a3d&label=release" alt="Release"></a>
  <a href="https://github.com/myfreeze-art/FishTorrnet/releases"><img src="https://img.shields.io/github/downloads/myfreeze-art/FishTorrnet/total?style=flat-square&color=2f7bff" alt="Downloads"></a>
  <a href="https://github.com/myfreeze-art/FishTorrnet/actions/workflows/ci.yml"><img src="https://img.shields.io/github/actions/workflow/status/myfreeze-art/FishTorrnet/ci.yml?branch=main&style=flat-square&label=CI" alt="CI"></a>
  <a href="../../LICENSE"><img src="https://img.shields.io/github/license/myfreeze-art/FishTorrnet?style=flat-square&color=34c77b" alt="License"></a>
  <img src="https://img.shields.io/badge/platforms-Windows%20%7C%20macOS%20%7C%20Linux%20%7C%20Docker-6c6c75?style=flat-square" alt="Platforms">
  <img src="https://img.shields.io/badge/languages-10-a77bf3?style=flat-square" alt="10 languages">
</p>

<p align="center">
  <a href="../../README.md">English</a> ·
  <a href="README.ru.md">Русский</a> ·
  <a href="README.uk.md">Українська</a> ·
  <b>Deutsch</b> ·
  <a href="README.fr.md">Français</a> ·
  <a href="README.es.md">Español</a> ·
  <a href="README.pt-BR.md">Português</a> ·
  <a href="README.zh-CN.md">简体中文</a> ·
  <a href="README.ja.md">日本語</a> ·
  <a href="README.tr.md">Türkçe</a>
</p>

<p align="center">
  <a href="#download">Download</a> ·
  <a href="#funktionen">Funktionen</a> ·
  <a href="#aus-dem-quellcode-bauen">Bauen</a> ·
  <a href="../../CONTRIBUTING.md">Mitmachen</a>
</p>

<p align="center">
  <picture>
    <source media="(prefers-color-scheme: light)" srcset="../screenshots/main-light.png">
    <img src="../screenshots/main-dark.png" width="900" alt="Hauptfenster von FishTorrnet">
  </picture>
</p>

## Funktionen

- **Ansehen, während es lädt.** Videos und Musik starten sofort im eingebauten Player, weil die benötigten Teile zuerst geladen werden. Den Stream kannst du auch in VLC öffnen.
- **FishGuard.** Jeder Torrent wird vor dem Start geprüft. FishTorrnet erkennt doppelte Endungen wie `video.mp4.exe`, versteckte Zeichen, die einen Dateinamen umdrehen, Programme und gefälschte Codecs in Film-Torrents, Werbe-Verknüpfungen und Passwortdateien. Ein gefährlicher Torrent lässt sich erst hinzufügen, wenn du das Risiko bestätigst.
- **Steuerung vom Handy.** Fernzugriff einschalten und den QR-Code scannen. Die Oberfläche passt sich kleinen Bildschirmen an.
- **Umzug mit einem Klick.** Importiere deine Torrents aus qBittorrent und uTorrent samt Ordnern. Heruntergeladene Dateien werden geprüft und weiter geteilt.
- **Ganz normales BitTorrent.** Magnet-Links, .torrent-Dateien, Tracker, DHT, PEX, uTP, UPnP und lokale Peer-Suche. FishTorrnet ist im selben Schwarm wie qBittorrent, Transmission und alle anderen Clients.
- **Sieht überall gut aus.** Dunkles und helles Design mit passendem Logo, 10 Sprachen, die sich nach dem System richten, Geschwindigkeitslimits ohne Neustart.

| | FishTorrnet | qBittorrent | Transmission |
| --- | :---: | :---: | :---: |
| Keine Werbung, Open Source | Ja | Ja | Ja |
| Eingebauter Player während des Downloads | Ja | Nur sequenzieller Download | Nein |
| Malware-Prüfung vor dem Download | Ja | Nein | Nein |
| Steuerung vom Handy per QR-Code | Ja | Web UI | Web UI |
| Import aus anderen Clients | Ja | Nein | Nein |
| Server ohne Fenster und Docker-Image | Ja | Ja | Ja |

<table>
  <tr>
    <td width="62%"><img src="../screenshots/add-fishguard.png" alt="FishGuard"></td>
    <td width="38%"><img src="../screenshots/mobile.png" alt="Mobile"></td>
  </tr>
  <tr>
    <td align="center">FishGuard stoppt einen gefälschten Film mit <code>.mp4.exe</code></td>
    <td align="center">Dieselben Downloads auf dem Handy</td>
  </tr>
</table>

## Download

Die neueste Version gibt es auf der Seite [Releases](https://github.com/myfreeze-art/FishTorrnet/releases/latest).

| System | Installation |
| --- | --- |
| Windows 10 und 11 | `FishTorrnet_x64-setup.exe` oder `winget install myfreeze-art.FishTorrnet` |
| macOS 11 und neuer | `FishTorrnet_universal.dmg`, für Intel und Apple Silicon |
| Ubuntu, Debian, Mint | `.deb`-Paket |
| Fedora, openSUSE | `.rpm`-Paket |
| Arch Linux | `yay -S fishtorrnet-bin` |
| Jedes Linux | `.AppImage` |
| Server oder NAS | `docker run -p 8787:8787 -v ./downloads:/downloads ghcr.io/myfreeze-art/fishtorrnet` |

FishTorrnet ist kostenlos, daher sind die Installer nicht mit einem kostenpflichtigen Zertifikat signiert, und das System warnt einmal. Unter Windows auf **Weitere Informationen** und dann **Trotzdem ausführen** klicken. Unter macOS **Systemeinstellungen → Datenschutz & Sicherheit** öffnen und **Dennoch öffnen** wählen. Jedes Release enthält `SHA256SUMS.txt`, damit du prüfen kannst, dass eine Datei nicht verändert wurde.

## Sprachen

Die App spricht English, Русский, Українська, Deutsch, Français, Español, Português, 简体中文, 日本語 und Türkçe. Sie übernimmt die Sprache deines Systems, ändern kannst du sie unter **Einstellungen → Oberfläche**. Deine Sprache fehlt? Siehe [docs/TRANSLATING.md](../TRANSLATING.md).

## Aus dem Quellcode bauen

Du brauchst Rust 1.85+ und Node.js 20+. Unter Linux zuerst die WebKitGTK-Entwicklerpakete installieren (siehe [docs/DEVELOPMENT.md](../DEVELOPMENT.md)).

```sh
git clone https://github.com/myfreeze-art/FishTorrnet.git
cd FishTorrnet
npm ci && npm ci --prefix ui
npm run app:build
```

Die Installer landen in `target/release/bundle`. Für einen Server ohne Fenster: `cargo build --release -p fishtorrnet-server`.

## Dokumentation

- [Entwicklung, Projektaufbau und HTTP-API](../DEVELOPMENT.md)
- [Releases und Veröffentlichung in Stores](../../packaging/README.md)
- [Die App übersetzen](../TRANSLATING.md)
- [Mitmachen](../../CONTRIBUTING.md) · [Sicherheit](../../SECURITY.md)

## Lizenz

FishTorrnet ist freie Software unter der [GNU GPL v3 oder neuer](../../LICENSE). Der BitTorrent-Kern ist [librqbit](https://github.com/ikatson/rqbit) (Apache-2.0).
