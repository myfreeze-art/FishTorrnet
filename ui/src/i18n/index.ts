import { createContext, useContext } from "react";
import type { Finding, Kind, Language, Level, Status } from "../api";
import { de } from "./locales/de";
import { en } from "./locales/en";
import { es } from "./locales/es";
import { fr } from "./locales/fr";
import { ja } from "./locales/ja";
import { pt } from "./locales/pt";
import { ru } from "./locales/ru";
import { tr } from "./locales/tr";
import { uk } from "./locales/uk";
import { zh } from "./locales/zh";
import type { Forms, Key, Locale } from "./types";

export type { Key, Locale } from "./types";

export const LOCALES = { en, ru, uk, de, fr, es, pt, zh, ja, tr } satisfies Record<string, Locale>;

export type LangCode = keyof typeof LOCALES;

export const LANG_CODES = Object.keys(LOCALES) as LangCode[];

export function isLangCode(v: string): v is LangCode {
  return v in LOCALES;
}

export function detectLanguage(): LangCode {
  for (const tag of navigator.languages ?? [navigator.language]) {
    const base = tag.toLowerCase().split("-")[0];
    if (isLangCode(base)) return base;
  }
  return "en";
}

export function resolveLanguage(lang: Language | string | null | undefined): LangCode {
  return lang && isLangCode(lang) ? lang : detectLanguage();
}

export function locale(lang: LangCode): Locale {
  return LOCALES[lang];
}

export function fill(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, k) => String(values[k] ?? ""));
}

export interface I18n {
  lang: LangCode;
  locale: string;
  t: (k: Key) => string;
  status: (s: Status) => string;
  kind: (k: Kind) => string;
  finding: (f: Finding) => string;
  level: (l: Level) => string;
  torrents: (n: number) => string;
  peersCount: (n: number) => string;
  seedsCount: (n: number) => string;
}

export function makeI18n(lang: LangCode): I18n {
  const l = LOCALES[lang];
  const rules = new Intl.PluralRules(l.intl);
  const plural = (forms: Forms, n: number) => {
    const cat = rules.select(n) as keyof Forms;
    return fill(forms[cat] ?? forms.other, { n: n.toLocaleString(l.intl) });
  };
  return {
    lang,
    locale: l.intl,
    t: (k) => l.strings[k],
    status: (s) => l.status[s],
    kind: (k) => l.kind[k],
    finding: (f) => l.finding[f],
    level: (v) => l.level[v],
    torrents: (n) => plural(l.torrents, n),
    peersCount: (n) => plural(l.peers, n),
    seedsCount: (n) => plural(l.seeds, n),
  };
}

export const I18nContext = createContext<I18n>(makeI18n("en"));
export const useI18n = () => useContext(I18nContext);
