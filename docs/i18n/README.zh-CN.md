<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="../../assets/logo-dark.svg">
    <img src="../../assets/logo-light.svg" width="112" height="112" alt="FishTorrnet">
  </picture>
</p>

<h1 align="center">FishTorrnet</h1>

<p align="center">
  <b>快速、诚实的 BitTorrent 客户端。</b><br>
  无广告，无遥测，开源。
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
  <b>简体中文</b> ·
  <a href="README.ja.md">日本語</a> ·
  <a href="README.tr.md">Türkçe</a>
</p>

<p align="center">
  <a href="#下载">下载</a> ·
  <a href="#功能">功能</a> ·
  <a href="#从源代码构建">构建</a> ·
  <a href="../../CONTRIBUTING.md">参与贡献</a>
</p>

<p align="center">
  <picture>
    <source media="(prefers-color-scheme: light)" srcset="../screenshots/main-light.png">
    <img src="../screenshots/main-dark.png" width="900" alt="FishTorrnet 主窗口">
  </picture>
</p>

## 功能

- **边下边播。** 视频和音乐会立刻在内置播放器中开始播放，因为需要的分块会优先下载。也可以用 VLC 打开串流。
- **FishGuard。** 每个种子在开始下载前都会被检查。FishTorrnet 能发现 `video.mp4.exe` 这样的双重扩展名、反转文件名的隐藏字符、电影种子里的程序和假解码器、广告快捷方式以及密码文件。在你确认风险之前，危险的种子无法被添加。
- **用手机控制。** 开启远程访问并扫描二维码即可。界面会自动适配小屏幕。
- **一键迁移。** 从 qBittorrent 和 uTorrent 导入种子及其文件夹。已下载的文件会被校验并继续做种。
- **标准 BitTorrent。** 支持磁力链接、.torrent 文件、Tracker、DHT、PEX、uTP、UPnP 和局域网用户发现。FishTorrnet 与 qBittorrent、Transmission 及其他所有客户端处在同一个网络中。
- **处处好看。** 深色和浅色主题各有匹配的标志，10 种界面语言自动跟随系统，限速无需重启。

| | FishTorrnet | qBittorrent | Transmission |
| --- | :---: | :---: | :---: |
| 无广告、开源 | 有 | 有 | 有 |
| 下载时内置播放器 | 有 | 仅顺序下载 | 无 |
| 下载前检查恶意软件 | 有 | 无 | 无 |
| 扫码用手机控制 | 有 | Web UI | Web UI |
| 从其他客户端导入 | 有 | 无 | 无 |
| 无界面服务器与 Docker 镜像 | 有 | 有 | 有 |

<table>
  <tr>
    <td width="62%"><img src="../screenshots/add-fishguard.png" alt="FishGuard"></td>
    <td width="38%"><img src="../screenshots/mobile.png" alt="Mobile"></td>
  </tr>
  <tr>
    <td align="center">FishGuard 拦下了一个内含 <code>.mp4.exe</code> 的假电影</td>
    <td align="center">在手机上查看同样的下载</td>
  </tr>
</table>

## 下载

最新版本请到 [Releases](https://github.com/myfreeze-art/FishTorrnet/releases/latest) 页面下载。

| 系统 | 安装方式 |
| --- | --- |
| Windows 10 和 11 | `FishTorrnet_x64-setup.exe` 或 `winget install myfreeze-art.FishTorrnet` |
| macOS 11 及以上 | `FishTorrnet_universal.dmg`, 支持 Intel 和 Apple Silicon |
| Ubuntu, Debian, Mint | `.deb` 安装包 |
| Fedora, openSUSE | `.rpm` 安装包 |
| Arch Linux | `yay -S fishtorrnet-bin` |
| 任意 Linux | `.AppImage` |
| 服务器或 NAS | `docker run -p 8787:8787 -v ./downloads:/downloads ghcr.io/myfreeze-art/fishtorrnet` |

FishTorrnet 是免费的，安装程序没有使用付费证书签名，系统会提示一次。在 Windows 上点击 **更多信息**，然后点击 **仍要运行**。在 macOS 上打开 **系统设置 → 隐私与安全性**，点击 **仍要打开**。每个版本都附带 `SHA256SUMS.txt`，可用来校验文件是否被篡改。

## 语言

应用支持 English、Русский、Українська、Deutsch、Français、Español、Português、简体中文、日本語 和 Türkçe。默认跟随系统语言，也可以在 **设置 → 界面** 中更改。想添加你的语言？请看 [docs/TRANSLATING.md](../TRANSLATING.md)。

## 从源代码构建

需要 Rust 1.85+ 和 Node.js 20+。在 Linux 上请先安装 WebKitGTK 开发包（见 [docs/DEVELOPMENT.md](../DEVELOPMENT.md)）。

```sh
git clone https://github.com/myfreeze-art/FishTorrnet.git
cd FishTorrnet
npm ci && npm ci --prefix ui
npm run app:build
```

安装程序会生成在 `target/release/bundle`。如需无界面服务器，请使用 `cargo build --release -p fishtorrnet-server`。

## 文档

- [开发、项目结构和 HTTP API](../DEVELOPMENT.md)
- [发布版本与上架应用商店](../../packaging/README.md)
- [翻译应用](../TRANSLATING.md)
- [参与贡献](../../CONTRIBUTING.md) · [安全政策](../../SECURITY.md)

## 许可证

FishTorrnet 是自由软件，采用 [GNU GPL v3 或更高版本](../../LICENSE) 授权。BitTorrent 核心为 [librqbit](https://github.com/ikatson/rqbit)（Apache-2.0）。
