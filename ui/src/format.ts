import type { Language } from "./api";

const UNITS: Record<Language, string[]> = {
  ru: ["Б", "КБ", "МБ", "ГБ", "ТБ"],
  en: ["B", "KB", "MB", "GB", "TB"],
};

function num(n: number, lang: Language, digits: number) {
  return n.toLocaleString(lang === "ru" ? "ru-RU" : "en-US", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

export function splitBytes(bytes: number, lang: Language): [string, string] {
  const u = UNITS[lang];
  let i = 0;
  let v = bytes;
  while (v >= 1024 && i < u.length - 1) {
    v /= 1024;
    i++;
  }
  const digits = i === 0 ? 0 : v >= 100 ? 0 : 1;
  return [num(v, lang, digits), u[i]];
}

export function bytes(n: number, lang: Language): string {
  const [v, u] = splitBytes(n, lang);
  return `${v} ${u}`;
}

export function speedParts(bps: number, lang: Language): [string, string] {
  const [v, u] = splitBytes(bps, lang);
  return [v, lang === "ru" ? `${u}/с` : `${u}/s`];
}

export function speed(bps: number, lang: Language): string {
  const [v, u] = speedParts(bps, lang);
  return `${v} ${u}`;
}

export function percent(done: number, total: number): number {
  if (total <= 0) return 0;
  return Math.min(100, Math.floor((done / total) * 100));
}

export function duration(secs: number, lang: Language): string {
  const ru = lang === "ru";
  if (secs < 60) return ru ? "< 1 мин" : "< 1 min";
  const m = Math.round(secs / 60);
  if (m < 60) return ru ? `${m} мин` : `${m} min`;
  const h = Math.floor(m / 60);
  const mm = m % 60;
  if (h < 24) return ru ? `${h} ч ${mm} мин` : `${h} h ${mm} min`;
  const d = Math.floor(h / 24);
  return ru ? `${d} д ${h % 24} ч` : `${d} d ${h % 24} h`;
}

export function ratio(r: number, lang: Language): string {
  return num(r, lang, 2);
}

export function shortPath(p: string): string {
  const home = p.match(/^(\/home\/[^/]+|\/Users\/[^/]+|[A-Za-z]:\\Users\\[^\\]+)/);
  return home ? "~" + p.slice(home[0].length) : p;
}
