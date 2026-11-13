export type Level = "safe" | "caution" | "danger";
export type Kind = "video" | "audio" | "document" | "disk" | "archive" | "program" | "image" | "other";
export type Status =
  | "checking"
  | "metadata"
  | "downloading"
  | "stalled"
  | "seeding"
  | "done"
  | "paused"
  | "error";
export type Theme = "system" | "dark" | "light";
export type Language = "auto" | "en" | "ru" | "uk" | "de" | "fr" | "es" | "pt" | "zh" | "ja" | "tr";

export interface Torrent {
  id: number;
  info_hash: string;
  name: string;
  status: Status;
  progress_bytes: number;
  total_bytes: number;
  uploaded_bytes: number;
  download_bps: number;
  upload_bps: number;
  peers: number;
  seeds: number;
  eta_secs: number | null;
  error: string | null;
  guard: Level;
  kind: Kind;
  output_folder: string;
}

export interface SessionInfo {
  download_bps: number;
  upload_bps: number;
  downloaded_bytes: number;
  uploaded_bytes: number;
  peers_live: number;
  dht_nodes: number | null;
  uptime_secs: number;
  listen_port: number | null;
  free_bytes: number | null;
}

export interface AppState {
  version: string;
  torrents: Torrent[];
  session: SessionInfo;
  restart_required: boolean;
  local: boolean;
  can_pick_folder: boolean;
  can_restart: boolean;
  inbox: number;
  theme: Theme;
  language: Language;
  upnp: boolean;
}

export type Finding =
  | "double_extension"
  | "hidden_extension"
  | "executable_in_media"
  | "fake_codec"
  | "executable"
  | "script"
  | "shortcut"
  | "password_hint";

export interface Issue {
  finding: Finding;
  level: Level;
  file: string;
}

export interface Report {
  level: Level;
  issues: Issue[];
  files_checked: number;
}

export interface FileView {
  index: number;
  name: string;
  path: string[];
  length: number;
  progress_bytes: number;
  included: boolean;
  kind: Kind;
}

export interface PeerCounts {
  live: number;
  tcp: number;
  utp: number;
  seeds: number;
  connecting: number;
  queued: number;
  seen: number;
  dead: number;
}

export interface Details {
  info_hash: string;
  name: string;
  output_folder: string;
  total_pieces: number;
  files: FileView[];
  peers: PeerCounts | null;
  average_piece_ms: number | null;
  fetched_bytes: number;
  ratio: number;
  report: Report;
}

export interface Peer {
  address: string;
  client: string | null;
  state: string;
  connection: "tcp" | "utp" | "socks" | null;
  downloaded_bytes: number;
  uploaded_bytes: number;
  pieces: number;
  errors: number;
  incoming: boolean;
}

export interface Pieces {
  total: number;
  have: number;
  buckets: number[];
}

export interface PreviewFile {
  index: number;
  name: string;
  path: string[];
  length: number;
  kind: Kind;
}

export interface Preview {
  info_hash: string;
  name: string | null;
  total_bytes?: number;
  files?: PreviewFile[];
  multi_file?: boolean;
  report?: Report;
  kind?: Kind;
  torrent?: string;
  peers?: string[];
  existing_id: number | null;
  default_folder?: string;
}

export interface Settings {
  download_folder: string;
  listen_port: number;
  upnp: boolean;
  utp: boolean;
  dht: boolean;
  lsd: boolean;
  download_limit_kib: number;
  upload_limit_kib: number;
  peer_limit: number;
  remote_access: boolean;
  remote_port: number;
  theme: Theme;
  language: Language;
  close_to_tray: boolean;
}

export interface RemoteInfo {
  enabled: boolean;
  port: number;
  active: boolean;
  urls: string[];
  qr_svg: string | null;
}

export interface ImportResult {
  found: number;
  added: number;
  existing: number;
  failed: { source: string; error: string }[];
}

export type Client = "qbittorrent" | "utorrent";

const TOKEN_KEY = "fishtorrnet.token";

function readToken(): string {
  const url = new URL(window.location.href);
  const fromUrl = url.searchParams.get("t");
  if (fromUrl) {
    localStorage.setItem(TOKEN_KEY, fromUrl);
    url.searchParams.delete("t");
    window.history.replaceState(null, "", url.pathname + url.search + url.hash);
    return fromUrl;
  }
  return localStorage.getItem(TOKEN_KEY) ?? "";
}

export const token = readToken();

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const res = await fetch(path, {
    method,
    headers: {
      "x-fishtorrnet-token": token,
      ...(body === undefined ? {} : { "content-type": "application/json" }),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await res.text();
  const data = text ? JSON.parse(text) : {};
  if (!res.ok) {
    throw new ApiError(res.status, data.error ?? res.statusText);
  }
  return data as T;
}

export interface AddRequest {
  magnet?: string;
  torrent?: string;
  folder?: string;
  files?: number[];
  name?: string;
  multi_file?: boolean;
  peers?: string[];
  paused?: boolean;
}

export const api = {
  state: () => request<AppState>("GET", "/api/state"),
  settings: () => request<Settings>("GET", "/api/settings"),
  saveSettings: (s: Settings) =>
    request<{ settings: Settings; restart_required: boolean }>("PUT", "/api/settings", s),
  remote: () => request<RemoteInfo>("GET", "/api/remote"),
  importDetect: () => request<Record<Client, string | null>>("GET", "/api/import"),
  importRun: (client: Client, path?: string) =>
    request<ImportResult>("POST", "/api/import", { client, path }),
  pickFolder: () => request<{ path: string | null }>("POST", "/api/pick-folder"),
  restart: () => request<object>("POST", "/api/restart"),
  takeInbox: () => request<{ items: { magnet?: string; torrent?: string }[] }>("POST", "/api/inbox"),
  preview: (src: { magnet?: string; torrent?: string }) => request<Preview>("POST", "/api/preview", src),
  add: (req: AddRequest) => request<{ id: number; info_hash: string }>("POST", "/api/add", req),
  pauseAll: () => request<object>("POST", "/api/pause-all"),
  resumeAll: () => request<object>("POST", "/api/resume-all"),
  details: (id: number) => request<Details>("GET", `/api/torrents/${id}`),
  peers: (id: number) => request<{ peers: Peer[] }>("GET", `/api/torrents/${id}/peers`),
  pieces: (id: number, buckets: number) =>
    request<Pieces>("GET", `/api/torrents/${id}/pieces?buckets=${buckets}`),
  pause: (id: number) => request<object>("POST", `/api/torrents/${id}/pause`),
  resume: (id: number) => request<object>("POST", `/api/torrents/${id}/resume`),
  remove: (id: number, files: boolean) =>
    request<object>("DELETE", `/api/torrents/${id}?files=${files}`),
  setFiles: (id: number, files: number[]) =>
    request<object>("POST", `/api/torrents/${id}/files`, { files }),
  open: (id: number, file?: number) =>
    request<object>("POST", `/api/torrents/${id}/open`, { file: file ?? null }),
};

export function streamUrl(id: number, file: number): string {
  return `${window.location.origin}/api/torrents/${id}/stream/${file}?t=${encodeURIComponent(token)}`;
}

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const s = String(reader.result);
      resolve(s.slice(s.indexOf(",") + 1));
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}
