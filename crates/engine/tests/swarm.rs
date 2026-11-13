use std::net::SocketAddr;
use std::path::Path;
use std::time::Duration;

use axum::body::Body;
use axum::extract::ConnectInfo;
use base64::Engine as _;
use fishtorrnet_engine::settings::Settings;
use fishtorrnet_engine::{Engine, Options};
use http::{Request, StatusCode};
use librqbit::spawn_utils::BlockingSpawner;
use librqbit::{AddTorrent, AddTorrentOptions, CreateTorrentOptions, create_torrent};
use serde_json::{Value, json};
use tower::ServiceExt;

fn write_settings(dir: &Path, download: &Path, port: u16) {
    let s = Settings {
        download_folder: download.to_path_buf(),
        listen_port: port,
        upnp: false,
        utp: false,
        dht: false,
        lsd: false,
        ..Settings::default()
    };
    s.save(&dir.join("settings.json")).unwrap();
}

async fn call(engine: &std::sync::Arc<Engine>, req: Request<Body>) -> (StatusCode, Vec<u8>) {
    let mut req = req;
    req.extensions_mut()
        .insert(ConnectInfo(SocketAddr::from(([127, 0, 0, 1], 1))));
    let res = engine.router().oneshot(req).await.unwrap();
    let status = res.status();
    let body = axum::body::to_bytes(res.into_body(), usize::MAX)
        .await
        .unwrap();
    (status, body.to_vec())
}

async fn json_call(
    engine: &std::sync::Arc<Engine>,
    method: &str,
    uri: &str,
    body: Option<Value>,
) -> Value {
    let req = Request::builder()
        .method(method)
        .uri(uri)
        .header("x-fishtorrnet-token", engine.token())
        .header("content-type", "application/json")
        .body(body.map(|b| Body::from(b.to_string())).unwrap_or_default())
        .unwrap();
    let (status, bytes) = call(engine, req).await;
    assert!(
        status.is_success(),
        "{uri}: {status} {}",
        String::from_utf8_lossy(&bytes)
    );
    serde_json::from_slice(&bytes).unwrap()
}

#[tokio::test(flavor = "multi_thread", worker_threads = 4)]
async fn download_stream_and_verify() {
    let root = tempfile::tempdir().unwrap();
    let seed_cfg = root.path().join("seed-cfg");
    let seed_dl = root.path().join("seed-dl");
    let leech_cfg = root.path().join("leech-cfg");
    let leech_dl = root.path().join("leech-dl");
    for d in [&seed_cfg, &seed_dl, &leech_cfg, &leech_dl] {
        std::fs::create_dir_all(d).unwrap();
    }
    write_settings(&seed_cfg, &seed_dl, 46101);
    write_settings(&leech_cfg, &leech_dl, 46102);

    let data: Vec<u8> = (0..3 * 1024 * 1024u32)
        .map(|i| (i.wrapping_mul(2654435761) >> 13) as u8)
        .collect();
    let file = seed_dl.join("clip.mkv");
    std::fs::write(&file, &data).unwrap();

    let seeder = Engine::start(Options {
        config_dir: seed_cfg,
        desktop: false,
        folder_picker: None,
        restart: None,
        download_dir: None,
    })
    .await
    .unwrap();
    let leecher = Engine::start(Options {
        config_dir: leech_cfg,
        desktop: true,
        folder_picker: None,
        restart: None,
        download_dir: None,
    })
    .await
    .unwrap();

    let created = create_torrent(
        &file,
        CreateTorrentOptions {
            name: None,
            trackers: vec![],
            piece_length: Some(64 * 1024),
        },
        &BlockingSpawner::new(2),
    )
    .await
    .unwrap();
    let torrent = created.as_bytes().unwrap();

    seeder
        .api
        .api_add_torrent(
            AddTorrent::TorrentFileBytes(torrent.clone()),
            Some(AddTorrentOptions {
                output_folder: Some(seed_dl.to_string_lossy().into_owned()),
                overwrite: true,
                ..Default::default()
            }),
        )
        .await
        .unwrap();
    for _ in 0..100 {
        let s = seeder.api.api_stats_v1(0.into()).unwrap();
        if s.finished {
            break;
        }
        tokio::time::sleep(Duration::from_millis(100)).await;
    }
    assert!(seeder.api.api_stats_v1(0.into()).unwrap().finished);
    let seed_port = seeder.session().announce_port().unwrap();

    let unauthorized = Request::builder()
        .uri("/api/state")
        .body(Body::empty())
        .unwrap();
    assert_eq!(
        call(&leecher, unauthorized).await.0,
        StatusCode::UNAUTHORIZED
    );

    let b64 = base64::engine::general_purpose::STANDARD.encode(&torrent);
    let preview = json_call(
        &leecher,
        "POST",
        "/api/preview",
        Some(json!({ "torrent": b64 })),
    )
    .await;
    assert_eq!(preview["name"], "clip.mkv");
    assert_eq!(preview["kind"], "video");
    assert_eq!(preview["report"]["level"], "safe");
    assert_eq!(preview["multi_file"], false);

    let added = json_call(
        &leecher,
        "POST",
        "/api/add",
        Some(json!({
            "torrent": preview["torrent"],
            "name": preview["name"],
            "multi_file": false,
            "peers": [format!("127.0.0.1:{seed_port}")],
        })),
    )
    .await;
    let id = added["id"].as_u64().unwrap();

    let range = Request::builder()
        .uri(format!("/api/torrents/{id}/stream/0?t={}", leecher.token()))
        .header("range", "bytes=1000000-1000999")
        .body(Body::empty())
        .unwrap();
    let (status, bytes) = tokio::time::timeout(Duration::from_secs(60), call(&leecher, range))
        .await
        .expect("stream timed out");
    assert_eq!(status, StatusCode::PARTIAL_CONTENT);
    assert_eq!(bytes, &data[1_000_000..1_001_000]);

    let mut status = String::new();
    for _ in 0..300 {
        let st = json_call(&leecher, "GET", "/api/state", None).await;
        status = st["torrents"][0]["status"]
            .as_str()
            .unwrap_or("")
            .to_string();
        if status == "seeding" {
            break;
        }
        tokio::time::sleep(Duration::from_millis(200)).await;
    }
    assert_eq!(status, "seeding");
    assert_eq!(std::fs::read(leech_dl.join("clip.mkv")).unwrap(), data);

    let pieces = json_call(
        &leecher,
        "GET",
        &format!("/api/torrents/{id}/pieces?buckets=16"),
        None,
    )
    .await;
    assert_eq!(pieces["have"], pieces["total"]);
    assert_eq!(pieces["buckets"].as_array().unwrap().len(), 16);

    let details = json_call(&leecher, "GET", &format!("/api/torrents/{id}"), None).await;
    assert_eq!(details["files"][0]["progress_bytes"], data.len() as u64);

    let state = json_call(&leecher, "GET", "/api/state", None).await;
    assert_eq!(state["local"], true);

    json_call(&leecher, "POST", &format!("/api/torrents/{id}/pause"), None).await;
    json_call(
        &leecher,
        "DELETE",
        &format!("/api/torrents/{id}?files=true"),
        None,
    )
    .await;
    let state = json_call(&leecher, "GET", "/api/state", None).await;
    assert!(state["torrents"].as_array().unwrap().is_empty());
    assert!(!leech_dl.join("clip.mkv").exists());

    leecher.shutdown().await;
    seeder.shutdown().await;
}
