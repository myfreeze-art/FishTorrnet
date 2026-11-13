# Development

## Requirements

- Rust 1.85 or newer
- Node.js 20 or newer
- On Linux, the WebKitGTK and GTK development packages:

```sh
sudo apt install libwebkit2gtk-4.1-dev libgtk-3-dev libayatana-appindicator3-dev librsvg2-dev
```

## Run in development

Start the engine as a headless server and the interface with hot reload:

```sh
npm ci --prefix ui
cargo run -p fishtorrnet-server -- --listen 127.0.0.1:8787
npm --prefix ui run dev
```

Open `http://localhost:5173/?t=KEY`. Requests to `/api` are proxied to the server. The key is stored in the `token` file of the settings folder:

| System | Settings folder |
| --- | --- |
| Linux | `~/.config/FishTorrnet` |
| macOS | `~/Library/Application Support/FishTorrnet` |
| Windows | `%APPDATA%\FishTorrnet` |

To run the desktop app:

```sh
npm ci
npm run app:dev
```

## Build

Desktop installers end up in `target/release/bundle`:

```sh
npm ci
npm ci --prefix ui
npm run app:build
```

Headless server:

```sh
npm --prefix ui run build
cargo build --release -p fishtorrnet-server
./target/release/fishtorrnet-server --listen 0.0.0.0:8787 --download-dir ~/Downloads/FishTorrnet
```

The server also reads `FISHTORRNET_CONFIG_DIR`, `FISHTORRNET_DOWNLOAD_DIR` and `FISHTORRNET_LISTEN`.

## Tests

```sh
cargo test --workspace
cargo clippy --workspace --all-targets -- -D warnings
npm --prefix ui run typecheck
```

The integration test `crates/engine/tests/swarm.rs` starts two clients, seeds a file from one to the other, reads a range from the middle of the file while it downloads and verifies the data.

## Project layout

| Folder | Contents |
| --- | --- |
| `crates/engine` | Core: librqbit session, settings, FishGuard, import, HTTP API, file streaming |
| `crates/server` | Headless server |
| `src-tauri` | Tauri desktop app: window, folder picker, magnet links and .torrent files from the system |
| `ui` | React and TypeScript interface, translations in `ui/src/i18n/locales` |
| `assets` | Logos in SVG |
| `packaging` | Microsoft Store, winget, AUR, Flathub and Linux desktop files |
| `vendor/librqbit-tracker-comms` | Copy of the librqbit tracker module with an IPv4 fallback for systems without IPv6 |

The engine and the interface talk over an HTTP API on `127.0.0.1`. Every request carries the access key in the `x-fishtorrnet-token` header or the `t` query parameter. Actions on local files, such as opening a folder, work only from the app window itself.

## API

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/api/state` | Torrents and session state |
| GET, PUT | `/api/settings` | Settings |
| POST | `/api/preview` | File list and FishGuard report for a magnet link or .torrent |
| POST | `/api/add` | Add a torrent |
| GET, DELETE | `/api/torrents/{id}` | Details, removal (`?files=true` also deletes files) |
| POST | `/api/torrents/{id}/pause`, `/resume` | Pause and resume |
| POST | `/api/torrents/{id}/files` | Choose files to download |
| GET | `/api/torrents/{id}/peers`, `/pieces` | Peers and piece map |
| GET | `/api/torrents/{id}/stream/{file}` | File stream with HTTP Range support |
| GET, POST | `/api/import` | Find and import qBittorrent or uTorrent torrents |
| GET | `/api/remote` | Addresses and QR code for the phone |

## Releases

See [packaging/README.md](../packaging/README.md).
