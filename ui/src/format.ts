import { fill, locale, type LangCode } from "./i18n";

function num(n: number, lang: LangCode, digits: number) {
  return n.toLocaleString(locale(lang).intl, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

export function splitBytes(bytes: number, lang: LangCode): [string, string] {
  const u = locale(lang).units;
  let i = 0;
  let v = bytes;
  while (v >= 1024 && i < u.length - 1) {
    v /= 1024;
    i++;
  }
  const digits = i === 0 ? 0 : v >= 100 ? 0 : 1;
  return [num(v, lang, digits), u[i]];
}

export function bytes(n: number, lang: LangCode): string {
  const [v, u] = splitBytes(n, lang);
  return `${v} ${u}`;
}

export function speedParts(bps: number, lang: LangCode): [string, string] {
  const [v, u] = splitBytes(bps, lang);
  return [v, u + locale(lang).perSecond];
}

export function speed(bps: number, lang: LangCode): string {
  const [v, u] = speedParts(bps, lang);
  return `${v} ${u}`;
}

export function percent(done: number, total: number): number {
  if (total <= 0) return 0;
  return Math.min(100, Math.floor((done / total) * 100));
}

export function duration(secs: number, lang: LangCode): string {
  const d = locale(lang).duration;
  if (secs < 60) return d.lessMin;
  const m = Math.round(secs / 60);
  if (m < 60) return fill(d.min, { m });
  const h = Math.floor(m / 60);
  if (h < 24) return fill(d.hourMin, { h, m: m % 60 });
  return fill(d.dayHour, { d: Math.floor(h / 24), h: h % 24 });
}

export function ratio(r: number, lang: LangCode): string {
  return num(r, lang, 2);
}

export function shortPath(p: string): string {
  const home = p.match(/^(\/home\/[^/]+|\/Users\/[^/]+|[A-Za-z]:\\Users\\[^\\]+)/);
  return home ? "~" + p.slice(home[0].length) : p;
}
