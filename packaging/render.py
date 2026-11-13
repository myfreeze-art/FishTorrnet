import argparse
import hashlib
import shutil
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent


def sha256(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(1 << 20), b""):
            h.update(chunk)
    return h.hexdigest()


def render(src: Path, dst: Path, values: dict[str, str]) -> None:
    text = src.read_text(encoding="utf-8")
    for key, value in values.items():
        text = text.replace("{{" + key + "}}", value)
    if "{{" in text:
        sys.exit(f"unfilled placeholder in {src}")
    dst.parent.mkdir(parents=True, exist_ok=True)
    dst.write_text(text, encoding="utf-8", newline="\n")


def main() -> None:
    parser = argparse.ArgumentParser(description="Render store manifests for a FishTorrnet release")
    parser.add_argument("--version", required=True)
    parser.add_argument("--assets", required=True, type=Path)
    parser.add_argument("--out", required=True, type=Path)
    args = parser.parse_args()

    version = args.version.removeprefix("v")
    deb = args.assets / f"FishTorrnet_{version}_amd64.deb"
    msi = args.assets / f"FishTorrnet_{version}_x64_en-US.msi"
    for f in (deb, msi):
        if not f.is_file():
            sys.exit(f"missing release asset {f.name}")
    values = {"VERSION": version, "SHA_DEB": sha256(deb), "SHA_MSI": sha256(msi).upper()}

    out = args.out
    if out.exists():
        shutil.rmtree(out)

    render(HERE / "aur/PKGBUILD.in", out / "aur/PKGBUILD", values)
    render(HERE / "aur/SRCINFO.in", out / "aur/.SRCINFO", values)

    winget = out / "winget/manifests/m/myfreeze-art/FishTorrnet" / version
    for src in sorted((HERE / "winget").glob("*.yaml.in")):
        render(src, winget / src.name.removesuffix(".in"), values)

    flatpak = out / "flatpak"
    render(HERE / "flatpak/io.github.myfreeze_art.FishTorrnet.yml.in", flatpak / "io.github.myfreeze_art.FishTorrnet.yml", values)
    shutil.copy(HERE / "flatpak/io.github.myfreeze_art.FishTorrnet.metainfo.xml", flatpak)
    shutil.copy(HERE / "flatpak/flathub.json", flatpak)

    print(out)


if __name__ == "__main__":
    main()
