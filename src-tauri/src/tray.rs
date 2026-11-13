use std::sync::Arc;
use std::time::Duration;

use fishtorrnet_engine::Engine;
use tauri::menu::{Menu, MenuItem, PredefinedMenuItem};
use tauri::tray::{MouseButton, MouseButtonState, TrayIcon, TrayIconBuilder, TrayIconEvent};
use tauri::{AppHandle, Manager, Wry};

struct Labels {
    show: &'static str,
    pause: &'static str,
    resume: &'static str,
    quit: &'static str,
}

fn labels(code: &str) -> Labels {
    let (show, pause, resume, quit) = match code {
        "ru" => (
            "Открыть FishTorrnet",
            "Пауза для всех",
            "Продолжить все",
            "Выход",
        ),
        "uk" => (
            "Відкрити FishTorrnet",
            "Пауза для всіх",
            "Продовжити всі",
            "Вихід",
        ),
        "de" => (
            "FishTorrnet öffnen",
            "Alle pausieren",
            "Alle fortsetzen",
            "Beenden",
        ),
        "fr" => (
            "Ouvrir FishTorrnet",
            "Tout mettre en pause",
            "Tout reprendre",
            "Quitter",
        ),
        "es" => ("Abrir FishTorrnet", "Pausar todo", "Reanudar todo", "Salir"),
        "pt" => (
            "Abrir o FishTorrnet",
            "Pausar todos",
            "Retomar todos",
            "Sair",
        ),
        "zh" => ("打开 FishTorrnet", "全部暂停", "全部继续", "退出"),
        "ja" => ("FishTorrnet を開く", "すべて一時停止", "すべて再開", "終了"),
        "tr" => (
            "FishTorrnet'i aç",
            "Tümünü duraklat",
            "Tümünü sürdür",
            "Çıkış",
        ),
        _ => ("Open FishTorrnet", "Pause all", "Resume all", "Quit"),
    };
    Labels {
        show,
        pause,
        resume,
        quit,
    }
}

fn language(engine: &Engine) -> String {
    let code = serde_json::to_value(engine.settings().language)
        .ok()
        .and_then(|v| v.as_str().map(str::to_owned))
        .unwrap_or_default();
    if code != "auto" {
        return code;
    }
    sys_locale::get_locale()
        .and_then(|l| l.split(['-', '_']).next().map(str::to_lowercase))
        .unwrap_or_else(|| "en".into())
}

fn menu(app: &AppHandle, code: &str) -> tauri::Result<Menu<Wry>> {
    let l = labels(code);
    Menu::with_items(
        app,
        &[
            &MenuItem::with_id(app, "show", l.show, true, None::<&str>)?,
            &PredefinedMenuItem::separator(app)?,
            &MenuItem::with_id(app, "pause", l.pause, true, None::<&str>)?,
            &MenuItem::with_id(app, "resume", l.resume, true, None::<&str>)?,
            &PredefinedMenuItem::separator(app)?,
            &MenuItem::with_id(app, "quit", l.quit, true, None::<&str>)?,
        ],
    )
}

pub fn show_window(app: &AppHandle) {
    if let Some(w) = app.get_webview_window("main") {
        let _ = w.unminimize();
        let _ = w.show();
        let _ = w.set_focus();
    }
}

fn toggle_window(app: &AppHandle) {
    let Some(w) = app.get_webview_window("main") else {
        return;
    };
    let visible = w.is_visible().unwrap_or(false) && !w.is_minimized().unwrap_or(false);
    if visible && w.is_focused().unwrap_or(false) {
        let _ = w.hide();
    } else {
        show_window(app);
    }
}

fn speed(bps: u64) -> String {
    const MB: f64 = 1024.0 * 1024.0;
    if (bps as f64) < MB {
        format!("{} KB/s", bps / 1024)
    } else {
        format!("{:.1} MB/s", bps as f64 / MB)
    }
}

fn engine(app: &AppHandle) -> Arc<Engine> {
    app.state::<Arc<Engine>>().inner().clone()
}

pub fn create(app: &AppHandle) -> tauri::Result<()> {
    let code = language(&engine(app));
    let mut builder = TrayIconBuilder::with_id("main")
        .tooltip("FishTorrnet")
        .menu(&menu(app, &code)?)
        .show_menu_on_left_click(false)
        .on_menu_event(|app, event| match event.id().as_ref() {
            "show" => show_window(app),
            "pause" => {
                let e = engine(app);
                tauri::async_runtime::spawn(async move { e.pause_all().await });
            }
            "resume" => {
                let e = engine(app);
                tauri::async_runtime::spawn(async move { e.resume_all().await });
            }
            "quit" => app.exit(0),
            _ => {}
        })
        .on_tray_icon_event(|tray, event| {
            if let TrayIconEvent::Click {
                button: MouseButton::Left,
                button_state: MouseButtonState::Up,
                ..
            } = event
            {
                toggle_window(tray.app_handle());
            }
        });
    if let Some(icon) = app.default_window_icon() {
        builder = builder.icon(icon.clone());
    }
    let tray = builder.build(app)?;
    spawn_updates(app.clone(), tray, code);
    Ok(())
}

fn spawn_updates(app: AppHandle, tray: TrayIcon, mut code: String) {
    tauri::async_runtime::spawn(async move {
        let mut tick = tokio::time::interval(Duration::from_secs(2));
        loop {
            tick.tick().await;
            let e = engine(&app);
            let (down, up) = e.speeds();
            let _ = tray.set_tooltip(Some(format!(
                "FishTorrnet\n↓ {}   ↑ {}",
                speed(down),
                speed(up)
            )));
            let now = language(&e);
            if now != code {
                code = now;
                let handle = app.clone();
                let tray = tray.clone();
                let lang = code.clone();
                let _ = app.run_on_main_thread(move || {
                    if let Ok(m) = menu(&handle, &lang) {
                        let _ = tray.set_menu(Some(m));
                    }
                });
            }
        }
    });
}
