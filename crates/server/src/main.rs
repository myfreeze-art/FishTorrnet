use std::net::SocketAddr;
use std::path::PathBuf;

use anyhow::{Context, bail};
use fishtorrnet_engine::{Engine, Options, default_config_dir};

struct Args {
    config_dir: PathBuf,
    listen: SocketAddr,
}

const USAGE: &str = "Usage: fishtorrnet-server [--config-dir DIR] [--listen ADDR:PORT]

Runs FishTorrnet without a window and serves the web interface.

Options:
  --config-dir DIR     Folder for settings and session state
  --listen ADDR:PORT   Address of the web interface (default 127.0.0.1:8787)
  -h, --help           Show this help";

fn parse_args() -> anyhow::Result<Args> {
    let mut args = Args {
        config_dir: default_config_dir(),
        listen: "127.0.0.1:8787".parse()?,
    };
    let mut it = std::env::args().skip(1);
    while let Some(a) = it.next() {
        match a.as_str() {
            "--config-dir" => {
                args.config_dir = it.next().context("--config-dir needs a value")?.into()
            }
            "--listen" => {
                args.listen = it
                    .next()
                    .context("--listen needs a value")?
                    .parse()
                    .context("--listen must look like 0.0.0.0:8787")?
            }
            "-h" | "--help" => {
                println!("{USAGE}");
                std::process::exit(0);
            }
            other => bail!("unknown argument {other}\n\n{USAGE}"),
        }
    }
    Ok(args)
}

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    tracing_subscriber::fmt()
        .with_env_filter(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| "info,librqbit=warn".into()),
        )
        .init();
    let args = parse_args()?;
    let engine = Engine::start(Options {
        config_dir: args.config_dir,
        desktop: false,
        folder_picker: None,
        restart: None,
    })
    .await?;
    let addr = engine.bind(args.listen).await?;
    let shown = if addr.ip().is_unspecified() {
        SocketAddr::from(([127, 0, 0, 1], addr.port()))
    } else {
        addr
    };
    println!("FishTorrnet {} is running", fishtorrnet_engine::VERSION);
    println!("Open {}", engine.local_url(shown));
    tokio::signal::ctrl_c().await?;
    println!("Stopping");
    engine.shutdown().await;
    Ok(())
}
