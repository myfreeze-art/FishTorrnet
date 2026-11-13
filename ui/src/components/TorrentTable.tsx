import type { MouseEvent } from "react";
import type { Torrent } from "../api";
import { bytes, duration, percent, speed } from "../format";
import { useI18n } from "../i18n";
import { Alert, KindIcon } from "../icons";
import { STATUS_COLOR, barColor } from "../ui";

interface Props {
  torrents: Torrent[];
  selected: Set<number>;
  onSelect: (id: number, e: MouseEvent) => void;
  onOpen: (t: Torrent) => void;
}

const DASH = "—";

export function TorrentTable({ torrents, selected, onSelect, onOpen }: Props) {
  const i = useI18n();
  const L = i.lang;

  return (
    <div role="table">
      <div className="grid-row thead" role="row">
        <div>{i.t("colName")}</div>
        <div className="r col-size">{i.t("colSize")}</div>
        <div className="col-progress">{i.t("colProgress")}</div>
        <div className="col-status">{i.t("colStatus")}</div>
        <div className="r col-down">{i.t("colDown")}</div>
        <div className="r col-up">{i.t("colUp")}</div>
        <div className="r col-peers">{i.t("colPeers")}</div>
        <div className="r col-eta">{i.t("colEta")}</div>
      </div>
      {torrents.map((t) => {
        const p = percent(t.progress_bytes, t.total_bytes);
        const active = t.status !== "paused" && t.status !== "done" && t.status !== "error";
        return (
          <div
            key={t.id}
            role="row"
            className={`grid-row trow${selected.has(t.id) ? " selected" : ""}`}
            onMouseDown={(e) => onSelect(t.id, e)}
            onDoubleClick={() => onOpen(t)}
            title={t.error ?? undefined}
          >
            <div className="cell-name">
              <KindIcon kind={t.kind} />
              <span className="title">{t.name}</span>
              {t.guard !== "safe" && (
                <span className={`badge ${t.guard}`}>
                  <Alert size={12} />
                  {i.level(t.guard)}
                </span>
              )}
            </div>
            <div className="r num col-size">{t.total_bytes ? bytes(t.total_bytes, L) : DASH}</div>
            <div className="progress col-progress">
              <div className="bar">
                <span style={{ width: `${p}%`, background: barColor(t) }} />
              </div>
              <span className="num" style={{ textAlign: "right" }}>
                {p}%
              </span>
            </div>
            <div className="status-cell col-status">
              <span className="dot" style={{ background: STATUS_COLOR[t.status] }} />
              <span className="ellipsis">{i.status(t.status)}</span>
            </div>
            <div className="r num col-down">{active && t.download_bps > 0 ? speed(t.download_bps, L) : DASH}</div>
            <div className="r num col-up">{active && t.upload_bps > 0 ? speed(t.upload_bps, L) : DASH}</div>
            <div className="r num col-peers">{active ? t.peers : DASH}</div>
            <div className="r num col-eta">{t.eta_secs != null ? duration(t.eta_secs, L) : DASH}</div>
          </div>
        );
      })}
    </div>
  );
}
