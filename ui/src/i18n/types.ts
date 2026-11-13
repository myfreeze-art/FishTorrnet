import type { Finding, Kind, Level, Status } from "../api";
import type { strings } from "./locales/en";

export type Key = keyof typeof strings;

export type Forms = { other: string } & Partial<Record<"zero" | "one" | "two" | "few" | "many", string>>;

export interface Locale {
  name: string;
  intl: string;
  units: [string, string, string, string, string];
  perSecond: string;
  duration: { lessMin: string; min: string; hourMin: string; dayHour: string };
  torrents: Forms;
  peers: Forms;
  seeds: Forms;
  strings: Record<Key, string>;
  status: Record<Status, string>;
  kind: Record<Kind, string>;
  finding: Record<Finding, string>;
  level: Record<Level, string>;
}
