# Translating FishTorrnet

The app is available in English, Русский, Українська, Deutsch, Français, Español, Português, 简体中文, 日本語 and Türkçe. Adding a language takes one file.

## Improve an existing translation

1. Open the file for your language in [`ui/src/i18n/locales`](../ui/src/i18n/locales), for example `de.ts`.
2. Change the text on the right side of each line. Keep the keys on the left and the `{n}`, `{m}`, `{h}`, `{d}` placeholders unchanged.
3. Open a pull request.

## Add a new language

1. Copy `ui/src/i18n/locales/en.ts` to a new file named after the two-letter language code, for example `it.ts`, and rename the exported constant to `it`.
2. Translate every value. Fill in:
   - `name`, the name of the language in that language, for example `Italiano`;
   - `intl`, the locale used for numbers and plural rules, for example `it-IT`;
   - `units` and `perSecond`, the way sizes and speeds are written;
   - `duration`, `torrents`, `peers`, `seeds`. Plural forms follow [Unicode plural rules](https://www.unicode.org/cldr/charts/latest/supplemental/language_plural_rules.html): use `one`, `few`, `many` and `other` as your language needs. `other` is required.
3. Register the file in `ui/src/i18n/index.ts` by importing it and adding it to `LOCALES`.
4. Add the code to the `Language` type in `ui/src/api.ts` and to the `Language` enum in `crates/engine/src/settings.rs`.
5. Run `npm --prefix ui run typecheck`. It fails if a key is missing.
6. Check the result: start the app, open **Settings → Interface** and pick your language. Long words should fit in the sidebar and the table headers.

## Translate the README

Translated READMEs live in [`docs/i18n`](i18n). Copy the main [README.md](../README.md), translate it, save it as `README.<code>.md` and add a link to the language bar at the top of every README.

## Style

- Use the informal tone that is common for software in your language.
- Keep it short: buttons and table headers have little space.
- Use the established words for BitTorrent terms in your language. If there is none, keep the English term, like DHT, magnet or peer.
