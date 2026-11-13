# Contributing to FishTorrnet

Thank you for helping. Bug reports, translations, design ideas and code are all welcome.

## Ways to help

- **Report a bug** with the [bug report form](https://github.com/myfreeze-art/FishTorrnet/issues/new?template=bug_report.yml). Include your system, the FishTorrnet version and the steps to reproduce.
- **Suggest a feature** with the [feature request form](https://github.com/myfreeze-art/FishTorrnet/issues/new?template=feature_request.yml).
- **Translate** the app or the README into your language. See [docs/TRANSLATING.md](docs/TRANSLATING.md).
- **Write code.** Pick an open issue or open one first to discuss a larger change.

## Working on the code

The setup, the project layout and the HTTP API are described in [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md).

Before you open a pull request, run:

```sh
cargo fmt --all
cargo clippy --workspace --all-targets -- -D warnings
cargo test --workspace
npm --prefix ui run typecheck
```

## Code style

- Keep changes small and focused on one problem.
- The code base has no comments. Use clear names and small functions so the code explains itself.
- Every user-facing string goes through `ui/src/i18n`. Add new keys to all locales, the type checker will tell you which ones are missing.
- Stick to the 8 px grid from the existing styles in `ui/src/styles.css`.
- No ads, trackers or telemetry, ever.

## Pull requests

- Describe what changed and how you tested it.
- Add screenshots for interface changes, in both dark and light themes.
- One approval from a maintainer is needed to merge.

By contributing you agree that your work is released under the [GPL-3.0-or-later](LICENSE) license and that you follow the [code of conduct](CODE_OF_CONDUCT.md).
