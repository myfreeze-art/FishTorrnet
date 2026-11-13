<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="../../assets/logo-dark.svg">
    <img src="../../assets/logo-light.svg" width="112" height="112" alt="FishTorrnet">
  </picture>
</p>

<h1 align="center">FishTorrnet</h1>

<p align="center">
  <b>Un cliente BitTorrent rápido y honesto.</b><br>
  Sin anuncios. Sin telemetría. Código abierto.
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
  <b>Español</b> ·
  <a href="README.pt-BR.md">Português</a> ·
  <a href="README.zh-CN.md">简体中文</a> ·
  <a href="README.ja.md">日本語</a> ·
  <a href="README.tr.md">Türkçe</a>
</p>

<p align="center">
  <a href="#descargar">Descargar</a> ·
  <a href="#funciones">Funciones</a> ·
  <a href="#compilar-desde-el-código-fuente">Compilar</a> ·
  <a href="../../CONTRIBUTING.md">Colaborar</a>
</p>

<p align="center">
  <picture>
    <source media="(prefers-color-scheme: light)" srcset="../screenshots/main-light.png">
    <img src="../screenshots/main-dark.png" width="900" alt="Ventana principal de FishTorrnet">
  </picture>
</p>

## Funciones

- **Mira mientras se descarga.** Los vídeos y la música empiezan al instante en el reproductor integrado, porque las piezas necesarias llegan primero. También puedes abrir el flujo en VLC.
- **FishGuard.** Cada torrent se revisa antes de empezar. FishTorrnet detecta dobles extensiones como `video.mp4.exe`, caracteres ocultos que invierten el nombre de un archivo, programas y códecs falsos dentro de películas, accesos directos con publicidad y archivos de contraseñas. Un torrent peligroso no se puede añadir hasta que confirmes el riesgo.
- **Control desde el móvil.** Activa el acceso remoto y escanea el código QR. La interfaz se adapta a pantallas pequeñas.
- **Mudanza en un clic.** Importa tus torrents de qBittorrent y uTorrent con sus carpetas. Los archivos descargados se verifican y siguen compartiéndose.
- **BitTorrent de siempre.** Enlaces magnet, archivos .torrent, trackers, DHT, PEX, uTP, UPnP y descubrimiento de pares en la red local. FishTorrnet comparte el mismo enjambre que qBittorrent, Transmission y cualquier otro cliente.
- **Se ve bien en todas partes.** Temas oscuro y claro con su propio logo, 10 idiomas que siguen al sistema y límites de velocidad sin reiniciar.

| | FishTorrnet | qBittorrent | Transmission |
| --- | :---: | :---: | :---: |
| Sin anuncios, código abierto | Sí | Sí | Sí |
| Reproductor integrado durante la descarga | Sí | Solo descarga secuencial | No |
| Análisis de malware antes de descargar | Sí | No | No |
| Control desde el móvil con código QR | Sí | Web UI | Web UI |
| Importación desde otros clientes | Sí | No | No |
| Servidor sin ventana e imagen Docker | Sí | Sí | Sí |

<table>
  <tr>
    <td width="62%"><img src="../screenshots/add-fishguard.png" alt="FishGuard"></td>
    <td width="38%"><img src="../screenshots/mobile.png" alt="Mobile"></td>
  </tr>
  <tr>
    <td align="center">FishGuard detiene una película falsa con <code>.mp4.exe</code> dentro</td>
    <td align="center">Las mismas descargas en el móvil</td>
  </tr>
</table>

## Descargar

La última versión está en la página [Releases](https://github.com/myfreeze-art/FishTorrnet/releases/latest).

| Sistema | Cómo instalar |
| --- | --- |
| Windows 10 y 11 | `FishTorrnet_x64-setup.exe` o `winget install myfreeze-art.FishTorrnet` |
| macOS 11 o posterior | `FishTorrnet_universal.dmg`, para Intel y Apple Silicon |
| Ubuntu, Debian, Mint | paquete `.deb` |
| Fedora, openSUSE | paquete `.rpm` |
| Arch Linux | `yay -S fishtorrnet-bin` |
| Cualquier Linux | `.AppImage` |
| Servidor o NAS | `docker run -p 8787:8787 -v ./downloads:/downloads ghcr.io/myfreeze-art/fishtorrnet` |

FishTorrnet es gratuito, así que los instaladores no están firmados con un certificado de pago y el sistema avisará una vez. En Windows pulsa **Más información** y luego **Ejecutar de todas formas**. En macOS abre **Ajustes del Sistema → Privacidad y seguridad** y pulsa **Abrir igualmente**. Cada versión incluye `SHA256SUMS.txt` para comprobar que un archivo no ha sido modificado.

## Idiomas

La aplicación habla English, Русский, Українська, Deutsch, Français, Español, Português, 简体中文, 日本語 y Türkçe. Usa el idioma de tu sistema y puedes cambiarlo en **Ajustes → Interfaz**. ¿Falta el tuyo? Consulta [docs/TRANSLATING.md](../TRANSLATING.md).

## Compilar desde el código fuente

Necesitas Rust 1.85+ y Node.js 20+. En Linux, instala antes los paquetes de desarrollo de WebKitGTK (ver [docs/DEVELOPMENT.md](../DEVELOPMENT.md)).

```sh
git clone https://github.com/myfreeze-art/FishTorrnet.git
cd FishTorrnet
npm ci && npm ci --prefix ui
npm run app:build
```

Los instaladores aparecen en `target/release/bundle`. Para un servidor sin ventana usa `cargo build --release -p fishtorrnet-server`.

## Documentación

- [Desarrollo, estructura del proyecto y API HTTP](../DEVELOPMENT.md)
- [Versiones y publicación en tiendas](../../packaging/README.md)
- [Traducir la aplicación](../TRANSLATING.md)
- [Colaborar](../../CONTRIBUTING.md) · [Seguridad](../../SECURITY.md)

## Licencia

FishTorrnet es software libre bajo la [GNU GPL v3 o posterior](../../LICENSE). El núcleo BitTorrent es [librqbit](https://github.com/ikatson/rqbit) (Apache-2.0).
