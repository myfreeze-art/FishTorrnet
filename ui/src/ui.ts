import type { Kind, Status, Torrent } from "./api";

export type Filter = "all" | "downloading" | "seeding" | "completed" | "paused" | "errors" | `kind:${Kind}`;

export const STATUS_COLOR: Record<Status, string> = {
  checking: "var(--yellow)",
  metadata: "var(--yellow)",
  downloading: "var(--accent)",
  stalled: "var(--yellow)",
  seeding: "var(--blue)",
  done: "var(--green)",
  paused: "var(--text-3)",
  error: "var(--red)",
};

export const KIND_COLOR: Record<Kind, string> = {
  video: "#ff6a3d",
  audio: "#34c77b",
  document: "#a77bf3",
  disk: "#5b9bff",
  archive: "#8b8b93",
  program: "#f2b53d",
  image: "#f06ba8",
  other: "#6c6c75",
};

export const KIND_ORDER: Kind[] = ["video", "audio", "disk", "document", "program", "archive", "image", "other"];

export function matches(t: Torrent, f: Filter): boolean {
  switch (f) {
    case "all":
      return true;
    case "downloading":
      return ["downloading", "stalled", "metadata", "checking"].includes(t.status);
    case "seeding":
      return t.status === "seeding";
    case "completed":
      return t.status === "seeding" || t.status === "done";
    case "paused":
      return t.status === "paused";
    case "errors":
      return t.status === "error";
    default:
      return t.kind === f.slice(5);
  }
}

export function barColor(t: Torrent): string {
  if (t.status === "error") return "var(--red)";
  if (t.status === "paused") return "var(--text-3)";
  if (t.total_bytes > 0 && t.progress_bytes >= t.total_bytes) return "var(--green)";
  return "var(--accent)";
}

export function isActive(t: Torrent): boolean {
  return t.status !== "paused" && t.status !== "done" && t.status !== "error";
}

export const HISTORY = 300;

export interface Series {
  down: number[];
  up: number[];
}

export function pushSample(s: Series, down: number, up: number): Series {
  const d = s.down.length >= HISTORY ? s.down.slice(1) : s.down.slice();
  const u = s.up.length >= HISTORY ? s.up.slice(1) : s.up.slice();
  d.push(down);
  u.push(up);
  return { down: d, up: u };
}
