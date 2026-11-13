<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="../../assets/logo-dark.svg">
    <img src="../../assets/logo-light.svg" width="112" height="112" alt="FishTorrnet">
  </picture>
</p>

<h1 align="center">FishTorrnet</h1>

<p align="center">
  <b>Швидкий і чесний BitTorrent-клієнт.</b><br>
  Без реклами. Без телеметрії. З відкритим кодом.
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
  <b>Українська</b> ·
  <a href="README.de.md">Deutsch</a> ·
  <a href="README.fr.md">Français</a> ·
  <a href="README.es.md">Español</a> ·
  <a href="README.pt-BR.md">Português</a> ·
  <a href="README.zh-CN.md">简体中文</a> ·
  <a href="README.ja.md">日本語</a> ·
  <a href="README.tr.md">Türkçe</a>
</p>

<p align="center">
  <a href="#завантажити">Завантажити</a> ·
  <a href="#можливості">Можливості</a> ·
  <a href="#збірка-з-вихідного-коду">Збірка</a> ·
  <a href="../../CONTRIBUTING.md">Участь</a>
</p>

<p align="center">
  <picture>
    <source media="(prefers-color-scheme: light)" srcset="../screenshots/main-light.png">
    <img src="../screenshots/main-dark.png" width="900" alt="Головне вікно FishTorrnet">
  </picture>
</p>

## Можливості

- **Дивіться під час завантаження.** Відео й музика одразу відкриваються у вбудованому плеєрі: потрібні частини завантажуються першими. Потік можна відкрити і у VLC.
- **FishGuard.** Кожна роздача перевіряється до початку завантаження. FishTorrnet виявляє подвійні розширення на кшталт `video.mp4.exe`, приховані символи, що перевертають ім'я файлу, програми й підроблені кодеки у фільмах, рекламні ярлики та файли з паролями. Небезпечну роздачу не можна додати, доки ви не підтвердите ризик.
- **Керування з телефона.** Увімкніть віддалений доступ і відскануйте QR-код. Інтерфейс підлаштовується під малий екран.
- **Переїзд в один клік.** Імпорт роздач із qBittorrent і uTorrent разом із теками. Завантажені файли перевіряються й продовжують роздаватися.
- **Звичайний BitTorrent.** Magnet-посилання, .torrent-файли, трекери, DHT, PEX, uTP, UPnP і пошук пірів у локальній мережі. FishTorrnet працює в одній мережі з qBittorrent, Transmission та будь-якими іншими клієнтами.
- **Гарно всюди.** Темна й світла тема з власним логотипом, 10 мов інтерфейсу з автовизначенням, обмеження швидкості без перезапуску.

| | FishTorrnet | qBittorrent | Transmission |
| --- | :---: | :---: | :---: |
| Без реклами, відкритий код | Так | Так | Так |
| Вбудований плеєр під час завантаження | Так | Лише послідовне завантаження | Ні |
| Перевірка на віруси до завантаження | Так | Ні | Ні |
| Керування з телефона за QR-кодом | Так | Web UI | Web UI |
| Імпорт з інших клієнтів | Так | Ні | Ні |
| Сервер без вікна та Docker-образ | Так | Так | Так |

<table>
  <tr>
    <td width="62%"><img src="../screenshots/add-fishguard.png" alt="FishGuard"></td>
    <td width="38%"><img src="../screenshots/mobile.png" alt="Mobile"></td>
  </tr>
  <tr>
    <td align="center">FishGuard зупиняє фальшивий фільм із <code>.mp4.exe</code> усередині</td>
    <td align="center">Ті самі завантаження на телефоні</td>
  </tr>
</table>

## Завантажити

Остання версія на сторінці [Releases](https://github.com/myfreeze-art/FishTorrnet/releases/latest).

| Система | Як встановити |
| --- | --- |
| Windows 10 і 11 | `FishTorrnet_x64-setup.exe` або `winget install myfreeze-art.FishTorrnet` |
| macOS 11 і новіші | `FishTorrnet_universal.dmg`, для Intel і Apple Silicon |
| Ubuntu, Debian, Mint | пакет `.deb` |
| Fedora, openSUSE | пакет `.rpm` |
| Arch Linux | `yay -S fishtorrnet-bin` |
| Будь-який Linux | `.AppImage` |
| Сервер або NAS | `docker run -p 8787:8787 -v ./downloads:/downloads ghcr.io/myfreeze-art/fishtorrnet` |

FishTorrnet безкоштовний, тому інсталятори не підписані платним сертифікатом, і система один раз попередить. У Windows натисніть **Докладніше**, потім **Усе одно запустити**. У macOS відкрийте **Системні параметри → Приватність і безпека** та натисніть **Усе одно відкрити**. У кожному випуску є `SHA256SUMS.txt`: за ним можна перевірити, що файл не підмінено.

## Мови

Програма розмовляє English, Русский, Українська, Deutsch, Français, Español, Português, 简体中文, 日本語 і Türkçe. Мова вибирається за системою, змінити її можна в **Налаштування → Інтерфейс**. Хочете додати свою? Дивіться [docs/TRANSLATING.md](../TRANSLATING.md).

## Збірка з вихідного коду

Потрібні Rust 1.85+ і Node.js 20+. На Linux спершу встановіть пакети розробки WebKitGTK (див. [docs/DEVELOPMENT.md](../DEVELOPMENT.md)).

```sh
git clone https://github.com/myfreeze-art/FishTorrnet.git
cd FishTorrnet
npm ci && npm ci --prefix ui
npm run app:build
```

Інсталятори з'являться в `target/release/bundle`. Для сервера без вікна використовуйте `cargo build --release -p fishtorrnet-server`.

## Документація

- [Розробка, будова проєкту та HTTP API](../DEVELOPMENT.md)
- [Випуск версій і публікація в магазинах](../../packaging/README.md)
- [Переклад програми](../TRANSLATING.md)
- [Як допомогти проєкту](../../CONTRIBUTING.md) · [Безпека](../../SECURITY.md)

## Ліцензія

FishTorrnet — вільна програма за ліцензією [GNU GPL v3 або новішою](../../LICENSE). Ядро BitTorrent — [librqbit](https://github.com/ikatson/rqbit) (Apache-2.0).
