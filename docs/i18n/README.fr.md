<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="../../assets/logo-dark.svg">
    <img src="../../assets/logo-light.svg" width="112" height="112" alt="FishTorrnet">
  </picture>
</p>

<h1 align="center">FishTorrnet</h1>

<p align="center">
  <b>Un client BitTorrent rapide et honnête.</b><br>
  Sans publicité. Sans télémétrie. Open source.
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
  <a href="README.de.md">Deutsch</a> ·
  <b>Français</b> ·
  <a href="README.es.md">Español</a> ·
  <a href="README.pt-BR.md">Português</a> ·
  <a href="README.zh-CN.md">简体中文</a> ·
  <a href="README.ja.md">日本語</a> ·
  <a href="README.tr.md">Türkçe</a>
</p>

<p align="center">
  <a href="#télécharger">Télécharger</a> ·
  <a href="#fonctionnalités">Fonctionnalités</a> ·
  <a href="#compiler-depuis-les-sources">Compiler</a> ·
  <a href="../../CONTRIBUTING.md">Contribuer</a>
</p>

<p align="center">
  <picture>
    <source media="(prefers-color-scheme: light)" srcset="../screenshots/main-light.png">
    <img src="../screenshots/main-dark.png" width="900" alt="Fenêtre principale de FishTorrnet">
  </picture>
</p>

## Fonctionnalités

- **Regardez pendant le téléchargement.** Vidéos et musique démarrent tout de suite dans le lecteur intégré, car les pièces nécessaires arrivent en premier. Le flux s'ouvre aussi dans VLC.
- **FishGuard.** Chaque torrent est vérifié avant de démarrer. FishTorrnet repère les doubles extensions comme `video.mp4.exe`, les caractères cachés qui inversent un nom de fichier, les programmes et faux codecs dans les films, les raccourcis publicitaires et les fichiers de mot de passe. Un torrent dangereux ne peut pas être ajouté tant que vous n'avez pas confirmé le risque.
- **Contrôle depuis le téléphone.** Activez l'accès à distance et scannez le QR code. L'interface s'adapte aux petits écrans.
- **Déménagement en un clic.** Importez vos torrents depuis qBittorrent et uTorrent avec leurs dossiers. Les fichiers téléchargés sont vérifiés et continuent d'être partagés.
- **Du BitTorrent standard.** Liens magnet, fichiers .torrent, trackers, DHT, PEX, uTP, UPnP et découverte de pairs locale. FishTorrnet partage le même essaim que qBittorrent, Transmission et tous les autres clients.
- **Beau partout.** Thèmes sombre et clair avec un logo assorti, 10 langues qui suivent votre système, limites de vitesse sans redémarrage.

| | FishTorrnet | qBittorrent | Transmission |
| --- | :---: | :---: | :---: |
| Sans publicité, open source | Oui | Oui | Oui |
| Lecteur intégré pendant le téléchargement | Oui | Téléchargement séquentiel seulement | Non |
| Détection de malware avant téléchargement | Oui | Non | Non |
| Contrôle depuis le téléphone par QR code | Oui | Web UI | Web UI |
| Import depuis d'autres clients | Oui | Non | Non |
| Serveur sans fenêtre et image Docker | Oui | Oui | Oui |

<table>
  <tr>
    <td width="62%"><img src="../screenshots/add-fishguard.png" alt="FishGuard"></td>
    <td width="38%"><img src="../screenshots/mobile.png" alt="Mobile"></td>
  </tr>
  <tr>
    <td align="center">FishGuard bloque un faux film contenant <code>.mp4.exe</code></td>
    <td align="center">Les mêmes téléchargements sur téléphone</td>
  </tr>
</table>

## Télécharger

La dernière version est sur la page [Releases](https://github.com/myfreeze-art/FishTorrnet/releases/latest).

| Système | Installation |
| --- | --- |
| Windows 10 et 11 | `FishTorrnet_x64-setup.exe` ou `winget install myfreeze-art.FishTorrnet` |
| macOS 11 et plus récent | `FishTorrnet_universal.dmg`, pour Intel et Apple Silicon |
| Ubuntu, Debian, Mint | paquet `.deb` |
| Fedora, openSUSE | paquet `.rpm` |
| Arch Linux | `yay -S fishtorrnet-bin` |
| Tout Linux | `.AppImage` |
| Serveur ou NAS | `docker run -p 8787:8787 -v ./downloads:/downloads ghcr.io/myfreeze-art/fishtorrnet` |

FishTorrnet est gratuit : les installeurs ne sont pas signés avec un certificat payant et le système vous avertira une fois. Sous Windows, cliquez sur **Informations complémentaires** puis **Exécuter quand même**. Sous macOS, ouvrez **Réglages Système → Confidentialité et sécurité** et cliquez sur **Ouvrir quand même**. Chaque version inclut `SHA256SUMS.txt` pour vérifier qu'un fichier n'a pas été modifié.

## Langues

L'application parle English, Русский, Українська, Deutsch, Français, Español, Português, 简体中文, 日本語 et Türkçe. Elle suit la langue de votre système, et vous pouvez la changer dans **Paramètres → Interface**. Votre langue manque ? Voir [docs/TRANSLATING.md](../TRANSLATING.md).

## Compiler depuis les sources

Il faut Rust 1.85+ et Node.js 20+. Sous Linux, installez d'abord les paquets de développement WebKitGTK (voir [docs/DEVELOPMENT.md](../DEVELOPMENT.md)).

```sh
git clone https://github.com/myfreeze-art/FishTorrnet.git
cd FishTorrnet
npm ci && npm ci --prefix ui
npm run app:build
```

Les installeurs se trouvent dans `target/release/bundle`. Pour un serveur sans fenêtre : `cargo build --release -p fishtorrnet-server`.

## Documentation

- [Développement, structure du projet et API HTTP](../DEVELOPMENT.md)
- [Versions et publication dans les boutiques](../../packaging/README.md)
- [Traduire l'application](../TRANSLATING.md)
- [Contribuer](../../CONTRIBUTING.md) · [Sécurité](../../SECURITY.md)

## Licence

FishTorrnet est un logiciel libre sous [GNU GPL v3 ou ultérieure](../../LICENSE). Le moteur BitTorrent est [librqbit](https://github.com/ikatson/rqbit) (Apache-2.0).
