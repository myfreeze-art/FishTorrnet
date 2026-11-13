<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="../../assets/logo-dark.svg">
    <img src="../../assets/logo-light.svg" width="112" height="112" alt="FishTorrnet">
  </picture>
</p>

<h1 align="center">FishTorrnet</h1>

<p align="center">
  <b>Um cliente BitTorrent rápido e honesto.</b><br>
  Sem anúncios. Sem telemetria. Código aberto.
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
  <b>Português</b> ·
  <a href="README.zh-CN.md">简体中文</a> ·
  <a href="README.ja.md">日本語</a> ·
  <a href="README.tr.md">Türkçe</a>
</p>

<p align="center">
  <a href="#baixar">Baixar</a> ·
  <a href="#recursos">Recursos</a> ·
  <a href="#compilar-a-partir-do-código">Compilar</a> ·
  <a href="../../CONTRIBUTING.md">Contribuir</a>
</p>

<p align="center">
  <picture>
    <source media="(prefers-color-scheme: light)" srcset="../screenshots/main-light.png">
    <img src="../screenshots/main-dark.png" width="900" alt="Janela principal do FishTorrnet">
  </picture>
</p>

## Recursos

- **Assista enquanto baixa.** Vídeos e músicas começam na hora no player integrado, porque as partes necessárias chegam primeiro. Também dá para abrir o fluxo no VLC.
- **FishGuard.** Cada torrent é verificado antes de começar. O FishTorrnet detecta extensões duplas como `video.mp4.exe`, caracteres ocultos que invertem o nome do arquivo, programas e codecs falsos dentro de filmes, atalhos de propaganda e arquivos de senha. Um torrent perigoso só pode ser adicionado depois que você confirmar o risco.
- **Controle pelo celular.** Ative o acesso remoto e leia o QR code. A interface se adapta a telas pequenas.
- **Mudança em um clique.** Importe seus torrents do qBittorrent e do uTorrent junto com as pastas. Os arquivos baixados são verificados e continuam sendo semeados.
- **BitTorrent de verdade.** Links magnet, arquivos .torrent, trackers, DHT, PEX, uTP, UPnP e descoberta de pares na rede local. O FishTorrnet participa do mesmo enxame que o qBittorrent, o Transmission e qualquer outro cliente.
- **Bonito em qualquer lugar.** Temas escuro e claro com logo próprio, 10 idiomas que seguem o sistema e limites de velocidade sem reiniciar.

| | FishTorrnet | qBittorrent | Transmission |
| --- | :---: | :---: | :---: |
| Sem anúncios, código aberto | Sim | Sim | Sim |
| Player integrado durante o download | Sim | Só download sequencial | Não |
| Verificação de malware antes de baixar | Sim | Não | Não |
| Controle pelo celular com QR code | Sim | Web UI | Web UI |
| Importação de outros clientes | Sim | Não | Não |
| Servidor sem janela e imagem Docker | Sim | Sim | Sim |

<table>
  <tr>
    <td width="62%"><img src="../screenshots/add-fishguard.png" alt="FishGuard"></td>
    <td width="38%"><img src="../screenshots/mobile.png" alt="Mobile"></td>
  </tr>
  <tr>
    <td align="center">O FishGuard barra um filme falso com <code>.mp4.exe</code> dentro</td>
    <td align="center">Os mesmos downloads no celular</td>
  </tr>
</table>

## Baixar

A versão mais recente está na página [Releases](https://github.com/myfreeze-art/FishTorrnet/releases/latest).

| Sistema | Como instalar |
| --- | --- |
| Windows 10 e 11 | `FishTorrnet_x64-setup.exe` ou `winget install myfreeze-art.FishTorrnet` |
| macOS 11 ou mais recente | `FishTorrnet_universal.dmg`, para Intel e Apple Silicon |
| Ubuntu, Debian, Mint | pacote `.deb` |
| Fedora, openSUSE | pacote `.rpm` |
| Arch Linux | `yay -S fishtorrnet-bin` |
| Qualquer Linux | `.AppImage` |
| Servidor ou NAS | `docker run -p 8787:8787 -v ./downloads:/downloads ghcr.io/myfreeze-art/fishtorrnet` |

O FishTorrnet é gratuito, então os instaladores não são assinados com um certificado pago e o sistema vai avisar uma vez. No Windows, clique em **Mais informações** e depois em **Executar assim mesmo**. No macOS, abra **Ajustes do Sistema → Privacidade e Segurança** e clique em **Abrir Mesmo Assim**. Toda versão traz `SHA256SUMS.txt` para você conferir que nenhum arquivo foi alterado.

## Idiomas

O aplicativo fala English, Русский, Українська, Deutsch, Français, Español, Português, 简体中文, 日本語 e Türkçe. Ele usa o idioma do sistema, e você pode trocar em **Configurações → Interface**. Falta o seu? Veja [docs/TRANSLATING.md](../TRANSLATING.md).

## Compilar a partir do código

Você precisa de Rust 1.85+ e Node.js 20+. No Linux, instale antes os pacotes de desenvolvimento do WebKitGTK (veja [docs/DEVELOPMENT.md](../DEVELOPMENT.md)).

```sh
git clone https://github.com/myfreeze-art/FishTorrnet.git
cd FishTorrnet
npm ci && npm ci --prefix ui
npm run app:build
```

Os instaladores ficam em `target/release/bundle`. Para um servidor sem janela, use `cargo build --release -p fishtorrnet-server`.

## Documentação

- [Desenvolvimento, estrutura do projeto e API HTTP](../DEVELOPMENT.md)
- [Versões e publicação nas lojas](../../packaging/README.md)
- [Traduzir o aplicativo](../TRANSLATING.md)
- [Contribuir](../../CONTRIBUTING.md) · [Segurança](../../SECURITY.md)

## Licença

O FishTorrnet é software livre sob a [GNU GPL v3 ou posterior](../../LICENSE). O núcleo BitTorrent é o [librqbit](https://github.com/ikatson/rqbit) (Apache-2.0).
