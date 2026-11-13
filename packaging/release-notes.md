## Download

| System | File |
| --- | --- |
| Windows 10 and 11 | `FishTorrnet_*_x64-setup.exe` or `FishTorrnet_*_x64_en-US.msi` |
| macOS 11 and newer, Intel and Apple Silicon | `FishTorrnet_*_universal.dmg` |
| Ubuntu, Debian, Mint | `FishTorrnet_*_amd64.deb` |
| Fedora, openSUSE | `FishTorrnet-*.x86_64.rpm` |
| Any Linux | `FishTorrnet_*_amd64.AppImage` |
| Server or NAS without a screen | `fishtorrnet-server-*` or Docker image `ghcr.io/myfreeze-art/fishtorrnet` |

Also available with `winget install myfreeze-art.FishTorrnet` on Windows and `fishtorrnet-bin` in the AUR once the packages are accepted.

## First launch

FishTorrnet is free and open source, so the installers are not signed with a paid certificate. The system will warn you once.

- **Windows.** If SmartScreen says "Windows protected your PC", click "More info" and then "Run anyway".
- **macOS.** Open the app once. If macOS refuses, open System Settings, go to Privacy and Security and click "Open Anyway" next to FishTorrnet.

## Verify the download

Every file is built by GitHub Actions from the source code of this tag. Checksums are in `SHA256SUMS.txt`:

```sh
sha256sum -c SHA256SUMS.txt --ignore-missing
```
