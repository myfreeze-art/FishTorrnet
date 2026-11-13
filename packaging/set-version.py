import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent


def main() -> None:
    if len(sys.argv) != 2:
        sys.exit("usage: set-version.py 1.2.3")
    version = sys.argv[1].removeprefix("v")
    if not re.fullmatch(r"\d+\.\d+\.\d+", version):
        sys.exit(f"tag must look like v1.2.3, got {sys.argv[1]}")

    cargo = ROOT / "Cargo.toml"
    text = cargo.read_text(encoding="utf-8")
    text, n = re.subn(r'(\[workspace\.package\]\nversion = )"[^"]+"', rf'\g<1>"{version}"', text)
    if n != 1:
        sys.exit("workspace version not found in Cargo.toml")
    cargo.write_text(text, encoding="utf-8")

    for path in ("src-tauri/tauri.conf.json", "package.json", "ui/package.json"):
        f = ROOT / path
        data = json.loads(f.read_text(encoding="utf-8"))
        data["version"] = version
        f.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

    print(version)


if __name__ == "__main__":
    main()
