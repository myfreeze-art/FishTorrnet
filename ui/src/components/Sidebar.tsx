import type { ReactNode } from "react";
import type { Kind, Torrent } from "../api";
import { useI18n, type Key } from "../i18n";
import { Alert, CheckCircle, Down, Gear, ImportIcon, ListIcon, PauseIcon, Phone, Up } from "../icons";
import { KIND_COLOR, KIND_ORDER, matches, type Filter } from "../ui";

interface Props {
  logo: string;
  version: string;
  torrents: Torrent[];
  filter: Filter;
  onFilter: (f: Filter) => void;
  onRemote: () => void;
  onImport: () => void;
  onSettings: () => void;
}

const MAIN: { f: Filter; key: Key; icon: ReactNode }[] = [
  { f: "all", key: "all", icon: <ListIcon /> },
  { f: "downloading", key: "downloading", icon: <Down /> },
  { f: "seeding", key: "seeding", icon: <Up /> },
  { f: "completed", key: "completed", icon: <CheckCircle /> },
  { f: "paused", key: "paused", icon: <PauseIcon /> },
];

export function Sidebar({ logo, version, torrents, filter, onFilter, onRemote, onImport, onSettings }: Props) {
  const i = useI18n();
  const count = (f: Filter) => torrents.filter((t) => matches(t, f)).length;
  const kinds = KIND_ORDER.filter((k) => torrents.some((t) => t.kind === k));
  const errors = count("errors");

  return (
    <aside className="sidebar" data-tauri-drag-region>
      <div className="brand" data-tauri-drag-region>
        <img src={logo} alt="" />
        <span>FishTorrnet</span>
        <span className="ver">{version}</span>
      </div>

      <nav className="nav-group">
        {MAIN.map((m) => (
          <button
            key={m.f}
            className={`nav-item${filter === m.f ? " active" : ""}`}
            onClick={() => onFilter(m.f)}
          >
            {m.icon}
            <span>{i.t(m.key)}</span>
            <span className="count">{count(m.f)}</span>
          </button>
        ))}
        {errors > 0 && (
          <button
            className={`nav-item${filter === "errors" ? " active" : ""}`}
            onClick={() => onFilter("errors")}
          >
            <Alert />
            <span>{i.t("errors")}</span>
            <span className="count">{errors}</span>
          </button>
        )}
      </nav>

      {kinds.length > 0 && (
        <nav className="nav-group">
          <div className="nav-title">{i.t("categories")}</div>
          {kinds.map((k: Kind) => {
            const f = `kind:${k}` as Filter;
            return (
              <button
                key={k}
                className={`nav-item${filter === f ? " active" : ""}`}
                onClick={() => onFilter(f)}
              >
                <span className="swatch" style={{ background: KIND_COLOR[k] }} />
                <span>{i.kind(k)}</span>
                <span className="count">{count(f)}</span>
              </button>
            );
          })}
        </nav>
      )}

      <nav className="nav-group">
        <div className="nav-title">{i.t("tools")}</div>
        <button className="nav-item" onClick={onRemote}>
          <Phone />
          <span>{i.t("remote")}</span>
        </button>
        <button className="nav-item" onClick={onImport}>
          <ImportIcon />
          <span>{i.t("import")}</span>
        </button>
        <button className="nav-item" onClick={onSettings}>
          <Gear />
          <span>{i.t("settings")}</span>
        </button>
      </nav>
    </aside>
  );
}
