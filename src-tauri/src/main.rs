#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::path::Path;
use std::sync::Arc;

use fishtorrnet_engine::{Engine, Options, default_config_dir};
use tauri::{AppHandle, Manager, RunEvent, WebviewUrl, WebviewWindowBuilder};
use tauri_plugin_deep_link::DeepLinkExt;
use tauri_plugin_dialog::DialogExt;

fn enqueue<'a>(engine: &Engine, args: impl IntoIterator<Item = &'a str>) -> bool {
    let mut any = false;
    for arg in args {
        if arg.starts_with("magnet:") {
            engine.enqueue_magnet(arg);
            any = true;
            continue;
        }
        let path = match url::Url::parse(arg) {
            Ok(u) if u.scheme() == "file" => match u.to_file_path() {
                Ok(p) => p,
                Err(_) => continue,
            },
            _ => Path::new(arg).to_path_buf(),
        };
        let is_torrent = path
            .extension()
            .and_then(|e| e.to_str())
            .is_some_and(|e| e.eq_ignore_ascii_case("torrent"));
        if let (true, Ok(bytes)) = (is_torrent, std::fs::read(&path)) {
            engine.enqueue_torrent(&bytes);
            any = true;
        }
    }
    any
}

fn handle_args<'a>(app: &AppHandle, args: impl IntoIterator<Item = &'a str>) {
    let Some(engine) = app.try_state::<Arc<Engine>>() else {
        return;
    };
    enqueue(&engine, args);
    if let Some(window) = app.get_webview_window("main") {
        let _ = window.unminimize();
        let _ = window.show();
        let _ = window.set_focus();
    }
}

fn main() -> anyhow::Result<()> {
    tracing_subscriber::fmt()
        .with_env_filter(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| "info,librqbit=warn".into()),
        )
        .init();

    let args: Vec<String> = std::env::args().skip(1).collect();

    let app = tauri::Builder::default()
        .plugin(tauri_plugin_single_instance::init(|app, argv, _cwd| {
            handle_args(app, argv.iter().skip(1).map(String::as_str));
        }))
        .plugin(tauri_plugin_deep_link::init())
        .plugin(tauri_plugin_dialog::init())
        .setup(move |app| {
            #[cfg(any(windows, target_os = "linux"))]
            {
                let _ = app.deep_link().register_all();
            }
            let handle = app.handle().clone();
            app.deep_link().on_open_url(move |event| {
                let urls: Vec<String> = event.urls().iter().map(|u| u.to_string()).collect();
                handle_args(&handle, urls.iter().map(String::as_str));
            });

            let picker = app.handle().clone();
            let restarter = app.handle().clone();
            let engine = tauri::async_runtime::block_on(Engine::start(Options {
                config_dir: default_config_dir(),
                desktop: true,
                folder_picker: Some(Arc::new(move |start| {
                    picker
                        .dialog()
                        .file()
                        .set_directory(start)
                        .blocking_pick_folder()
                        .and_then(|p| p.into_path().ok())
                })),
                restart: Some(Arc::new(move || restarter.restart())),
            }))?;
            enqueue(&engine, args.iter().map(String::as_str));
            let addr = tauri::async_runtime::block_on(engine.bind_local(0))?;
            if let Err(e) = tauri::async_runtime::block_on(engine.bind_remote_if_enabled()) {
                tracing::warn!("remote access is not available: {e:#}");
            }
            let url = engine.local_url(addr).parse()?;
            app.manage(engine);

            let window = WebviewWindowBuilder::new(app, "main", WebviewUrl::External(url))
                .title("FishTorrnet")
                .inner_size(1360.0, 860.0)
                .min_inner_size(960.0, 600.0)
                .disable_drag_drop_handler();
            #[cfg(target_os = "macos")]
            let window = window
                .title_bar_style(tauri::TitleBarStyle::Overlay)
                .hidden_title(true)
                .traffic_light_position(tauri::LogicalPosition::new(18.0, 18.0));
            #[cfg(not(target_os = "macos"))]
            let window = window.decorations(false).shadow(true);
            window.build()?;
            Ok(())
        })
        .build(tauri::generate_context!())?;

    app.run(|app, event| match event {
        #[cfg(target_os = "macos")]
        RunEvent::Opened { urls } => {
            let urls: Vec<String> = urls.iter().map(|u| u.to_string()).collect();
            handle_args(app, urls.iter().map(String::as_str));
        }
        RunEvent::Exit => {
            if let Some(engine) = app.try_state::<Arc<Engine>>() {
                tauri::async_runtime::block_on(engine.shutdown());
            }
        }
        _ => {}
    });
    Ok(())
}
