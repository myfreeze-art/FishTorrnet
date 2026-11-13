import { useEffect, useState } from "react";
import { api, type Details, type FileView, type Peer, type Pieces, type Torrent } from "../api";
import { bytes, percent, ratio, shortPath, speedParts } from "../format";
import { useI18n } from "../i18n";
import { ArrowDown, ArrowUp, Folder, KindIcon, Play, Shield } from "../icons";
import { barColor, type Series } from "../ui";
import { SpeedChart } from "./SpeedChart";
import { useToast } from "./Toasts";

type Tab = "overview" | "files" | "peers";

interface Props {
  torrent: Torrent;
  series: Series;
  local: boolean;
  onPlay: (t: Torrent, file: FileView) => void;
}

export const PLAYABLE = new Set(["mp4", "m4v", "webm", "mkv", "mov", "ogv", "mp3", "m4a", "ogg", "opus", "flac", "wav", "aac"]);

export function isPlayable(name: string) {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  return PLAYABLE.has(ext);
}

export function PieceBar({ pieces, className }: { pieces: Pieces | null; className?: string }) {
  return (
    <div className={`pieces ${className ?? ""}`}>
      {(pieces?.buckets ?? []).map((b, idx) => (
        <span
          key={idx}
          style={{
            background:
              b >= 100 ? "var(--accent)" : b > 0 ? `color-mix(in srgb, var(--accent) ${20 + b * 0.6}%, var(--track))` : "transparent",
          }}
        />
      ))}
    </div>
  );
}

export function DetailsPanel({ torrent, series, local, onPlay }: Props) {
  const i = useI18n();
  const toast = useToast();
  const L = i.lang;
  const [tab, setTab] = useState<Tab>("overview");
  const [details, setDetails] = useState<Details | null>(null);
  const [pieces, setPieces] = useState<Pieces | null>(null);
  const [peers, setPeers] = useState<Peer[]>([]);
  const id = torrent.id;

  useEffect(() => {
    setDetails(null);
    setPieces(null);
    setPeers([]);
  }, [id]);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const d = await api.details(id);
        if (!alive) return;
        setDetails(d);
        if (tab === "overview") {
          const p = await api.pieces(id, 96);
          if (alive) setPieces(p);
        }
        if (tab === "peers") {
          const p = await api.peers(id);
          if (alive) setPeers(p.peers);
        }
      } catch {
        return;
      }
    };
    load();
    const timer = setInterval(load, 1500);
    return () => {
      alive = false;
      clearInterval(timer);
    };
  }, [id, tab]);

  const toggleFile = async (f: FileView, on: boolean) => {
    if (!details) return;
    const next = details.files.filter((x) => (x.index === f.index ? on : x.included)).map((x) => x.index);
    try {
      await api.setFiles(id, next);
      setDetails({ ...details, files: details.files.map((x) => (x.index === f.index ? { ...x, included: on } : x)) });
    } catch (e) {
      toast.error(e);
    }
  };

  const reveal = async (file?: number) => {
    try {
      await api.open(id, file);
    } catch (e) {
      toast.error(e);
    }
  };

  const [down, downUnit] = speedParts(torrent.download_bps, L);
  const [up, upUnit] = speedParts(torrent.upload_bps, L);
  const p = details?.peers;

  return (
    <section className="details">
      <div className="tabs">
        {(["overview", "files", "peers"] as Tab[]).map((t) => (
          <button key={t} className={`tab${tab === t ? " active" : ""}`} onClick={() => setTab(t)}>
            {i.t(t === "overview" ? "tabOverview" : t === "files" ? "tabFiles" : "tabPeers")}
          </button>
        ))}
        <div className="aside">
          {p && p.live > 0 && (
            <span>
              {i.peersCount(p.live)} · {i.seedsCount(p.seeds)}
            </span>
          )}
        </div>
      </div>

      {tab === "overview" && (
        <div className="overview">
          <div className="chart-pane">
            <div className="chart-head">
              <span className="big">
                {down}
                <small>
                  {downUnit} <ArrowDown size={12} />
                </small>
              </span>
              <span className="big">
                {up}
                <small>
                  {upUnit} <ArrowUp size={12} />
                </small>
              </span>
              <div className="legend">
                <span>
                  <i style={{ background: "var(--accent)" }} />
                  {i.t("legendDown")}
                </span>
                <span>
                  <i style={{ background: "var(--blue)" }} />
                  {i.t("legendUp")}
                </span>
              </div>
            </div>
            <SpeedChart series={series} />
          </div>
          <div className="info-pane">
            <div className="kv">
              <span>{i.t("folder")}</span>
              <span title={details?.output_folder}>{details ? shortPath(details.output_folder) : "—"}</span>
            </div>
            <div className="kv">
              <span>{i.t("downloaded")}</span>
              <span>
                {bytes(torrent.progress_bytes, L)} {i.t("of")} {bytes(torrent.total_bytes, L)}
              </span>
            </div>
            <div className="kv">
              <span>{i.t("ratio")}</span>
              <span>{ratio(details?.ratio ?? 0, L)}</span>
            </div>
            <div className="kv">
              <span>{i.t("connections")}</span>
              <span>{p ? `TCP ${p.tcp} · uTP ${p.utp}` : "—"}</span>
            </div>
            <div className="kv">
              <span>{i.t("protection")}</span>
              <span style={{ color: torrent.guard === "safe" ? "var(--green)" : torrent.guard === "danger" ? "var(--red)" : "var(--yellow)" }}>
                <Shield size={12} style={{ verticalAlign: "-2px", marginRight: 6 }} />
                {i.level(torrent.guard)}
              </span>
            </div>
            <div className="pieces-head">
              <span>
                {i.t("pieces")} · {(pieces?.total ?? details?.total_pieces ?? 0).toLocaleString(i.locale)}
              </span>
              <span>
                {i.t("piecesReady")} {pieces ? percent(pieces.have, pieces.total) : 0}%
              </span>
            </div>
            <PieceBar pieces={pieces} />
          </div>
        </div>
      )}

      {tab === "files" && (
        <div className="list">
          <div className="list-row head files-grid">
            <span />
            <span>{i.t("colName")}</span>
            <span style={{ textAlign: "right" }}>{i.t("colSize")}</span>
            <span>{i.t("colProgress")}</span>
            <span />
          </div>
          {(details?.files ?? []).map((f) => {
            const pct = percent(f.progress_bytes, f.length);
            return (
              <div key={f.index} className="list-row files-grid">
                <input
                  type="checkbox"
                  className="check"
                  checked={f.included}
                  title={i.t("include")}
                  onChange={(e) => toggleFile(f, e.target.checked)}
                />
                <span className="cell-name">
                  <KindIcon kind={f.kind} />
                  <span className="ellipsis" title={f.name}>
                    {f.path.join(" / ")}
                  </span>
                </span>
                <span className="num" style={{ textAlign: "right" }}>
                  {bytes(f.length, L)}
                </span>
                <span className="progress">
                  <span className="bar">
                    <span style={{ width: `${pct}%`, background: barColor({ ...torrent, progress_bytes: f.progress_bytes, total_bytes: f.length }) }} />
                  </span>
                  <span className="num" style={{ textAlign: "right" }}>
                    {pct}%
                  </span>
                </span>
                <span className="row-actions">
                  {isPlayable(f.name) && f.included && (
                    <button className="icon-btn" title={i.t("play")} onClick={() => onPlay(torrent, f)}>
                      <Play />
                    </button>
                  )}
                  {local && f.progress_bytes > 0 && (
                    <button className="icon-btn" title={i.t("openFolder")} onClick={() => reveal(f.index)}>
                      <Folder />
                    </button>
                  )}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {tab === "peers" && (
        <div className="list">
          <div className="list-row head peers-grid">
            <span>{i.t("address")}</span>
            <span>{i.t("client")}</span>
            <span>{i.t("connection")}</span>
            <span style={{ textAlign: "right" }}>{i.t("colDown")}</span>
            <span style={{ textAlign: "right" }}>{i.t("colUp")}</span>
          </div>
          {peers.length === 0 && <div className="hint" style={{ height: 120 }}>{i.t("noPeers")}</div>}
          {peers.map((pr) => (
            <div key={pr.address} className="list-row peers-grid">
              <span className="ellipsis num">{pr.address}</span>
              <span className="ellipsis muted">{pr.client ?? "—"}</span>
              <span className="muted">{pr.connection ? pr.connection.toUpperCase() : "—"}</span>
              <span className="num" style={{ textAlign: "right" }}>
                {bytes(pr.downloaded_bytes, L)}
              </span>
              <span className="num" style={{ textAlign: "right" }}>
                {bytes(pr.uploaded_bytes, L)}
              </span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
