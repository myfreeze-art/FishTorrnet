<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="../../assets/logo-dark.svg">
    <img src="../../assets/logo-light.svg" width="112" height="112" alt="FishTorrnet">
  </picture>
</p>

<h1 align="center">FishTorrnet</h1>

<p align="center">
  <b>Hızlı ve dürüst bir BitTorrent istemcisi.</b><br>
  Reklam yok. Telemetri yok. Açık kaynak.
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
  <a href="README.fr.md">Français</a> ·
  <a href="README.es.md">Español</a> ·
  <a href="README.pt-BR.md">Português</a> ·
  <a href="README.zh-CN.md">简体中文</a> ·
  <a href="README.ja.md">日本語</a> ·
  <b>Türkçe</b>
</p>

<p align="center">
  <a href="#indir">İndir</a> ·
  <a href="#özellikler">Özellikler</a> ·
  <a href="#kaynak-koddan-derleme">Derle</a> ·
  <a href="../../CONTRIBUTING.md">Katkıda bulun</a>
</p>

<p align="center">
  <picture>
    <source media="(prefers-color-scheme: light)" srcset="../screenshots/main-light.png">
    <img src="../screenshots/main-dark.png" width="900" alt="FishTorrnet ana penceresi">
  </picture>
</p>

## Özellikler

- **İnerken izle.** Gereken parçalar önce indirildiği için video ve müzik yerleşik oynatıcıda hemen başlar. Akışı VLC'de de açabilirsiniz.
- **FishGuard.** Her torrent başlamadan önce denetlenir. FishTorrnet `video.mp4.exe` gibi çift uzantıları, dosya adını ters çeviren gizli karakterleri, film torrentlerindeki programları ve sahte codec'leri, reklam kısayollarını ve parola dosyalarını yakalar. Tehlikeli bir torrent, riski onaylayana kadar eklenemez.
- **Telefondan kontrol.** Uzaktan erişimi açın ve QR kodunu okutun. Arayüz küçük ekranlara uyum sağlar.
- **Tek tıkla taşınma.** Torrentlerinizi klasörleriyle birlikte qBittorrent ve uTorrent'ten içe aktarın. İndirilmiş dosyalar doğrulanır ve paylaşılmaya devam eder.
- **Bildiğiniz BitTorrent.** Magnet bağlantıları, .torrent dosyaları, izleyiciler, DHT, PEX, uTP, UPnP ve yerel eş keşfi. FishTorrnet; qBittorrent, Transmission ve diğer tüm istemcilerle aynı sürüye katılır.
- **Her yerde şık.** Kendi logosuyla koyu ve açık tema, sistemi takip eden 10 dil, yeniden başlatmadan hız sınırı.

| | FishTorrnet | qBittorrent | Transmission |
| --- | :---: | :---: | :---: |
| Reklamsız, açık kaynak | Var | Var | Var |
| İndirirken yerleşik oynatıcı | Var | Yalnızca sıralı indirme | Yok |
| İndirmeden önce zararlı yazılım denetimi | Var | Yok | Yok |
| QR kodla telefondan kontrol | Var | Web UI | Web UI |
| Diğer istemcilerden içe aktarma | Var | Yok | Yok |
| Penceresiz sunucu ve Docker imajı | Var | Var | Var |

<table>
  <tr>
    <td width="62%"><img src="../screenshots/add-fishguard.png" alt="FishGuard"></td>
    <td width="38%"><img src="../screenshots/mobile.png" alt="Mobile"></td>
  </tr>
  <tr>
    <td align="center">FishGuard içinde <code>.mp4.exe</code> olan sahte bir filmi durduruyor</td>
    <td align="center">Aynı indirmeler telefonda</td>
  </tr>
</table>

## İndir

En son sürüm [Releases](https://github.com/myfreeze-art/FishTorrnet/releases/latest) sayfasında.

| Sistem | Nasıl kurulur |
| --- | --- |
| Windows 10 ve 11 | `FishTorrnet_x64-setup.exe` veya `winget install myfreeze-art.FishTorrnet` |
| macOS 11 ve üzeri | `FishTorrnet_universal.dmg`, Intel ve Apple Silicon için |
| Ubuntu, Debian, Mint | `.deb` paketi |
| Fedora, openSUSE | `.rpm` paketi |
| Arch Linux | `yay -S fishtorrnet-bin` |
| Herhangi bir Linux | `.AppImage` |
| Sunucu veya NAS | `docker run -p 8787:8787 -v ./downloads:/downloads ghcr.io/myfreeze-art/fishtorrnet` |

FishTorrnet ücretsizdir; bu yüzden yükleyiciler ücretli bir sertifikayla imzalanmamıştır ve sistem bir kez uyarır. Windows'ta **Ek bilgi**'ye, ardından **Yine de çalıştır**'a tıklayın. macOS'ta **Sistem Ayarları → Gizlilik ve Güvenlik**'i açıp **Yine de Aç**'a tıklayın. Her sürümde, bir dosyanın değiştirilmediğini doğrulamanız için `SHA256SUMS.txt` bulunur.

## Diller

Uygulama English, Русский, Українська, Deutsch, Français, Español, Português, 简体中文, 日本語 ve Türkçe konuşur. Sistem dilinizi kullanır, **Ayarlar → Arayüz** bölümünden değiştirebilirsiniz. Diliniz eksik mi? [docs/TRANSLATING.md](../TRANSLATING.md) sayfasına bakın.

## Kaynak koddan derleme

Rust 1.85+ ve Node.js 20+ gerekir. Linux'ta önce WebKitGTK geliştirme paketlerini kurun (bkz. [docs/DEVELOPMENT.md](../DEVELOPMENT.md)).

```sh
git clone https://github.com/myfreeze-art/FishTorrnet.git
cd FishTorrnet
npm ci && npm ci --prefix ui
npm run app:build
```

Yükleyiciler `target/release/bundle` klasöründe oluşur. Penceresiz bir sunucu için `cargo build --release -p fishtorrnet-server` kullanın.

## Belgeler

- [Geliştirme, proje yapısı ve HTTP API](../DEVELOPMENT.md)
- [Sürümler ve mağazalarda yayınlama](../../packaging/README.md)
- [Uygulamayı çevirme](../TRANSLATING.md)
- [Katkıda bulunma](../../CONTRIBUTING.md) · [Güvenlik](../../SECURITY.md)

## Lisans

FishTorrnet, [GNU GPL v3 veya üzeri](../../LICENSE) lisanslı özgür bir yazılımdır. BitTorrent çekirdeği [librqbit](https://github.com/ikatson/rqbit)'tir (Apache-2.0).
