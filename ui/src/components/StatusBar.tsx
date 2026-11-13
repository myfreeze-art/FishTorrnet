import type { AppState } from "../api";
import { bytes, speed } from "../format";
import { useI18n } from "../i18n";
import { ArrowDown, ArrowUp, Refresh } from "../icons";

interface Props {
  state: AppState;
  onRestart: () => void;
}

export function StatusBar({ state, onRestart }: Props) {
  const i = useI18n();
  const s = state.session;
  const L = i.lang;
  return (
    <footer className="statusbar">
      <span className="item">
        <ArrowDown size={14} style={{ color: "var(--accent)" }} />
        <b>{speed(s.download_bps, L)}</b>
      </span>
      <span className="item">
        <ArrowUp size={14} style={{ color: "var(--blue)" }} />
        <b>{speed(s.upload_bps, L)}</b>
      </span>
      <span className="item hide-sm">
        <span
          className="dot"
          style={{ background: s.dht_nodes == null ? "var(--text-3)" : s.dht_nodes > 0 ? "var(--green)" : "var(--yellow)" }}
        />
        {s.dht_nodes == null ? (
          i.t("dhtOff")
        ) : (
          <span>
            {i.t("dht")} <b>{s.dht_nodes}</b> {i.t("nodes")}
          </span>
        )}
      </span>
      {s.listen_port != null && (
        <span className="item hide-sm">
          {i.t("port")} <b>{s.listen_port}</b>
          {state.upnp ? " · UPnP" : ""}
        </span>
      )}
      {state.restart_required && (
        <span className="item">
          <Refresh size={14} style={{ color: "var(--accent)" }} />
          {state.can_restart ? (
            <button className="restart" onClick={onRestart}>
              {i.t("restartNeeded")}
            </button>
          ) : (
            <span>{i.t("restartNeeded")}</span>
          )}
        </span>
      )}
      <span className="item end hide-sm">
        {s.free_bytes != null && (
          <span>
            {i.t("free")} <b>{bytes(s.free_bytes, L)}</b>
          </span>
        )}
      </span>
    </footer>
  );
}
