import { useCallback, useEffect, useMemo, useRef, useState, type MouseEvent } from "react";
import { ApiError, api, type AppState, type FileView, type Torrent } from "./api";
import { bytes } from "./format";
import { I18nContext, makeI18n, resolveLanguage } from "./i18n";
import { MagnetIcon, PauseIcon, Play, Plus, Search, Trash } from "./icons";
import { AddDialog, type AddSource } from "./components/AddDialog";
import { DeleteDialog } from "./components/DeleteDialog";
import { DetailsPanel, isPlayable } from "./components/DetailsPanel";
import { ImportDialog } from "./components/ImportDialog";
import { Player } from "./components/Player";
import { RemoteDialog } from "./components/RemoteDialog";
import { SettingsDialog } from "./components/SettingsDialog";
import { Sidebar } from "./components/Sidebar";
import { StatusBar } from "./components/StatusBar";
import { useToast } from "./components/Toasts";
import { WindowControls } from "./components/WindowControls";
import { isDesktop, isMac } from "./desktop";
import { TorrentTable } from "./components/TorrentTable";
import { matches, pushSample, type Filter, type Series } from "./ui";

type Resolved = "dark" | "light";

function systemTheme(): Resolved {
  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

function looksLikeLink(s: string) {
  const v = s.trim();
  return v.startsWith("magnet:") || /^[0-9a-fA-F]{40}$/.test(v) || /^https?:\/\/.+\.torrent(\?.*)?$/i.test(v);
}

const EMPTY: Series = { down: [], up: [] };

interface PlayerState {
  id: number;
  file: number;
  name: string;
  audio: boolean;
}

export function App() {
  const toast = useToast();
  const [state, setState] = useState<AppState | null>(null);
  const [conn, setConn] = useState<"ok" | "offline" | "unauthorized">("ok");
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [focusId, setFocusId] = useState<number | null>(null);
  const [adding, setAddingRaw] = useState<AddSource | undefined>(undefined);
  const [addSeq, setAddSeq] = useState(0);
  const setAdding = useCallback((src: AddSource | undefined) => {
    if (src !== undefined) setAddSeq((n) => n + 1);
    setAddingRaw(src);
  }, []);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [remoteOpen, setRemoteOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [deleting, setDeleting] = useState<Torrent[] | null>(null);
  const [player, setPlayer] = useState<PlayerState | null>(null);
  const [dragging, setDragging] = useState(false);
  const [systemPref, setSystemPref] = useState<Resolved>(systemTheme);
  const series = useRef(new Map<number, Series>());
  const searchRef = useRef<HTMLInputElement>(null);
  const pendingWatch = useRef<{ id: number; file: number } | null>(null);

  const i18n = useMemo(
    () => makeI18n(resolveLanguage(state?.language ?? localStorage.getItem("fishtorrnet.lang"))),
    [state?.language],
  );
  const theme: Resolved = useMemo(() => {
    const t = state?.theme ?? (localStorage.getItem("fishtorrnet.theme") as AppState["theme"] | null) ?? "system";
    return t === "system" ? systemPref : t;
  }, [state?.theme, systemPref]);
  const logo = theme === "dark" ? "/logo-dark.svg" : "/logo-light.svg";

  useEffect(() => {
    if (isDesktop) document.documentElement.classList.add("desktop", isMac ? "mac" : "frameless");
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.lang = i18n.lang;
    const link = document.querySelector<HTMLLinkElement>("link[rel=icon]");
    if (link) link.href = logo;
  }, [theme, i18n.lang, logo]);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: light)");
    const on = () => setSystemPref(mq.matches ? "light" : "dark");
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);

  const refresh = useCallback(async () => {
    try {
      const s = await api.state();
      setConn("ok");
      setState(s);
      localStorage.setItem("fishtorrnet.theme", s.theme);
      localStorage.setItem("fishtorrnet.lang", s.language);
      const m = series.current;
      m.set(-1, pushSample(m.get(-1) ?? EMPTY, s.session.download_bps, s.session.upload_bps));
      const ids = new Set(s.torrents.map((t) => t.id));
      for (const t of s.torrents) m.set(t.id, pushSample(m.get(t.id) ?? EMPTY, t.download_bps, t.upload_bps));
      for (const k of [...m.keys()]) if (k >= 0 && !ids.has(k)) m.delete(k);
      setSelected((sel) => {
        const next = new Set([...sel].filter((id) => ids.has(id)));
        return next.size === sel.size ? sel : next;
      });
      const w = pendingWatch.current;
      if (w && ids.has(w.id)) {
        pendingWatch.current = null;
        const t = s.torrents.find((x) => x.id === w.id)!;
        api.details(w.id).then((d) => {
          const f = d.files.find((x) => x.index === w.file);
          if (f) setPlayer({ id: t.id, file: f.index, name: f.path.join(" / "), audio: f.kind === "audio" });
        }, toast.error);
      }
    } catch (e) {
      setConn(e instanceof ApiError && e.status === 401 ? "unauthorized" : "offline");
    }
  }, [toast]);

  useEffect(() => {
    refresh();
    const t = setInterval(refresh, 1000);
    return () => clearInterval(t);
  }, [refresh]);

  const inboxCount = state?.inbox ?? 0;
  useEffect(() => {
    if (inboxCount === 0) return;
    api.takeInbox().then(({ items }) => {
      const last = items[items.length - 1];
      if (last?.magnet) setAdding({ magnet: last.magnet });
      else if (last?.torrent) setAdding({ torrent: last.torrent });
    }, toast.error);
  }, [inboxCount, setAdding, toast]);

  const torrents = state?.torrents ?? [];
  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return torrents.filter((t) => matches(t, filter) && (!q || looksLikeLink(q) || t.name.toLowerCase().includes(q)));
  }, [torrents, filter, query]);

  const focus = torrents.find((t) => t.id === focusId) ?? null;
  const selTorrents = torrents.filter((t) => selected.has(t.id));

  const onSelect = (id: number, e: MouseEvent) => {
    if (e.button !== 0) return;
    if (e.metaKey || e.ctrlKey) {
      const next = new Set(selected);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      setSelected(next);
    } else if (e.shiftKey && focusId != null) {
      const a = visible.findIndex((t) => t.id === focusId);
      const b = visible.findIndex((t) => t.id === id);
      const [from, to] = a < b ? [a, b] : [b, a];
      setSelected(new Set(visible.slice(from, to + 1).map((t) => t.id)));
      return;
    } else {
      setSelected(new Set([id]));
    }
    setFocusId(id);
  };

  const act = async (fn: (id: number) => Promise<unknown>, list: Torrent[]) => {
    try {
      await Promise.all(list.map((t) => fn(t.id)));
      refresh();
    } catch (e) {
      toast.error(e);
    }
  };

  const runAll = async (fn: () => Promise<unknown>) => {
    try {
      await fn();
      refresh();
    } catch (e) {
      toast.error(e);
    }
  };

  const openPlayer = (t: Torrent, f: FileView) =>
    setPlayer({ id: t.id, file: f.index, name: f.path.join(" / "), audio: f.kind === "audio" });

  const openDefault = async (t: Torrent) => {
    try {
      const d = await api.details(t.id);
      const media = d.files
        .filter((f) => f.included && isPlayable(f.name) && (f.kind === "video" || f.kind === "audio"))
        .sort((a, b) => b.length - a.length)[0];
      if (media) openPlayer(t, media);
      else if (state?.local) await api.open(t.id);
    } catch (e) {
      toast.error(e);
    }
  };

  const restart = async () => {
    try {
      await api.restart();
    } catch (e) {
      toast.error(e);
    }
  };

  const modalOpen = adding !== undefined || settingsOpen || remoteOpen || importOpen || deleting !== null || player !== null;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const typing = target.tagName === "INPUT" || target.tagName === "TEXTAREA";
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchRef.current?.focus();
        return;
      }
      if (typing || modalOpen) return;
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "a") {
        e.preventDefault();
        setSelected(new Set(visible.map((t) => t.id)));
      } else if ((e.key === "Delete" || e.key === "Backspace") && selTorrents.length) {
        setDeleting(selTorrents);
      } else if (e.key === " " && selTorrents.length) {
        e.preventDefault();
        const anyActive = selTorrents.some((t) => t.status !== "paused" && t.status !== "done");
        act(anyActive ? api.pause : api.resume, selTorrents);
      } else if (e.key === "Enter" && focus) {
        openDefault(focus);
      }
    };
    const onPaste = (e: ClipboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || modalOpen) return;
      const text = e.clipboardData?.getData("text") ?? "";
      if (looksLikeLink(text)) setAdding({ magnet: text.trim() });
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("paste", onPaste);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("paste", onPaste);
    };
  });

  useEffect(() => {
    let depth = 0;
    const hasFiles = (e: DragEvent) => [...(e.dataTransfer?.types ?? [])].includes("Files");
    const enter = (e: DragEvent) => {
      if (!hasFiles(e) || modalOpen) return;
      depth++;
      setDragging(true);
    };
    const leave = () => {
      depth = Math.max(0, depth - 1);
      if (depth === 0) setDragging(false);
    };
    const over = (e: DragEvent) => {
      if (hasFiles(e)) e.preventDefault();
    };
    const drop = (e: DragEvent) => {
      e.preventDefault();
      depth = 0;
      setDragging(false);
      if (modalOpen) return;
      const f = e.dataTransfer?.files?.[0];
      if (f) setAdding({ file: f });
    };
    window.addEventListener("dragenter", enter);
    window.addEventListener("dragleave", leave);
    window.addEventListener("dragover", over);
    window.addEventListener("drop", drop);
    return () => {
      window.removeEventListener("dragenter", enter);
      window.removeEventListener("dragleave", leave);
      window.removeEventListener("dragover", over);
      window.removeEventListener("drop", drop);
    };
  }, [modalOpen]);

  const i = i18n;

  if (conn !== "ok" && !state) {
    return (
      <I18nContext.Provider value={i18n}>
        <div className="blocked">
          <img src={logo} alt="" />
          {conn === "unauthorized" ? i.t("unauthorized") : <span className="spinner" />}
          {conn === "offline" && <span>{i.t("offline")}</span>}
        </div>
      </I18nContext.Provider>
    );
  }

  if (conn === "unauthorized") {
    return (
      <I18nContext.Provider value={i18n}>
        <div className="blocked">
          <img src={logo} alt="" />
          <span>{i.t("unauthorized")}</span>
        </div>
      </I18nContext.Provider>
    );
  }

  const totalBytes = visible.reduce((a, t) => a + t.total_bytes, 0);
  const title =
    filter === "all"
      ? i.t("allDownloads")
      : filter.startsWith("kind:")
        ? i.kind(filter.slice(5) as Torrent["kind"])
        : i.t(filter as "downloading" | "seeding" | "completed" | "paused" | "errors");
  const anyActive = selTorrents.some((t) => t.status !== "paused" && t.status !== "done");
  const anyPaused = selTorrents.some((t) => t.status === "paused" || t.status === "done");
  const mobileFilters: Filter[] = ["all", "downloading", "seeding", "completed", "paused"];

  return (
    <I18nContext.Provider value={i18n}>
      <div className="app">
        <Sidebar
          logo={logo}
          version={state?.version ?? ""}
          torrents={torrents}
          filter={filter}
          onFilter={setFilter}
          onRemote={() => setRemoteOpen(true)}
          onImport={() => setImportOpen(true)}
          onSettings={() => setSettingsOpen(true)}
        />
        <main className="main">
          <div className="toolbar" data-tauri-drag-region>
            <button className="btn primary" onClick={() => setAdding(null)}>
              <Plus />
              <span className="hide-sm">{i.t("add")}</span>
            </button>
            <button className="btn hide-sm" onClick={() => setAdding(null)}>
              <MagnetIcon />
              {i.t("magnet")}
            </button>
            <span className="sep hide-sm" />
            <button className="icon-btn" title={i.t("resume")} disabled={!anyPaused} onClick={() => act(api.resume, selTorrents)}>
              <Play />
            </button>
            <button className="icon-btn" title={i.t("pause")} disabled={!anyActive} onClick={() => act(api.pause, selTorrents)}>
              <PauseIcon />
            </button>
            <button
              className="icon-btn"
              title={i.t("remove")}
              disabled={selTorrents.length === 0}
              onClick={() => setDeleting(selTorrents)}
            >
              <Trash />
            </button>
            <label className="search">
              <Search />
              <input
                ref={searchRef}
                value={query}
                placeholder={i.t("search")}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && looksLikeLink(query)) {
                    setAdding({ magnet: query.trim() });
                    setQuery("");
                  }
                  if (e.key === "Escape") {
                    setQuery("");
                    (e.target as HTMLInputElement).blur();
                  }
                }}
              />
              <span className="kbd">{isMac ? "⌘K" : "Ctrl K"}</span>
            </label>
            {isDesktop && !isMac && <WindowControls />}
          </div>

          <div className="header" data-tauri-drag-region>
            <h1>{title}</h1>
            <span className="muted num">
              {i.torrents(visible.length)} · {bytes(totalBytes, i.lang)}
            </span>
            {torrents.length > 0 && (
              <div className="right hide-sm">
                <button className="btn ghost" onClick={() => runAll(api.resumeAll)}>
                  <Play />
                  {i.t("resumeAll")}
                </button>
                <button className="btn ghost" onClick={() => runAll(api.pauseAll)}>
                  <PauseIcon />
                  {i.t("pauseAll")}
                </button>
              </div>
            )}
          </div>

          <div className="mobile-tabs">
            {mobileFilters.map((f) => (
              <button key={f} className={filter === f ? "on" : ""} onClick={() => setFilter(f)}>
                {i.t(f === "all" ? "all" : (f as "downloading"))}
              </button>
            ))}
          </div>

          <div
            className="table-wrap"
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) setSelected(new Set());
            }}
          >
            {visible.length > 0 ? (
              <TorrentTable torrents={visible} selected={selected} onSelect={onSelect} onOpen={openDefault} />
            ) : torrents.length === 0 ? (
              <div className="empty">
                <img src={logo} alt="" />
                <h2>{i.t("emptyTitle")}</h2>
                <span>{i.t("emptyText")}</span>
                <button className="btn primary" style={{ marginTop: 8 }} onClick={() => setAdding(null)}>
                  <Plus />
                  {i.t("add")}
                </button>
              </div>
            ) : (
              <div className="empty">{i.t("emptyFilter")}</div>
            )}
          </div>

          {focus ? (
            <DetailsPanel
              key={focus.id}
              torrent={focus}
              series={series.current.get(focus.id) ?? EMPTY}
              local={!!state?.local}
              onPlay={openPlayer}
            />
          ) : (
            torrents.length > 0 && (
              <section className="details">
                <div className="hint">{i.t("selectHint")}</div>
              </section>
            )
          )}
        </main>
        {state && <StatusBar state={state} onRestart={restart} />}
      </div>

      {adding !== undefined && (
        <AddDialog
          key={addSeq}
          initial={adding}
          canPickFolder={!!state?.can_pick_folder}
          onClose={() => setAdding(undefined)}
          onAdded={(id, watch) => {
            setAdding(undefined);
            setFilter("all");
            setSelected(new Set([id]));
            setFocusId(id);
            if (watch != null) pendingWatch.current = { id, file: watch };
            refresh();
          }}
          onShowExisting={(id) => {
            setAdding(undefined);
            setFilter("all");
            setSelected(new Set([id]));
            setFocusId(id);
          }}
        />
      )}
      {settingsOpen && (
        <SettingsDialog
          canPickFolder={!!state?.can_pick_folder}
          onClose={() => setSettingsOpen(false)}
          onSaved={() => refresh()}
        />
      )}
      {remoteOpen && (
        <RemoteDialog
          local={!!state?.local}
          canRestart={!!state?.can_restart}
          onClose={() => setRemoteOpen(false)}
          onRestart={restart}
        />
      )}
      {importOpen && <ImportDialog onClose={() => setImportOpen(false)} />}
      {deleting && (
        <DeleteDialog
          torrents={deleting}
          onClose={() => setDeleting(null)}
          onConfirm={async (files) => {
            await act((id) => api.remove(id, files), deleting);
            setDeleting(null);
            setSelected(new Set());
          }}
        />
      )}
      {player && (
        <Player
          torrentId={player.id}
          file={player.file}
          name={player.name}
          audio={player.audio}
          local={!!state?.local}
          onClose={() => setPlayer(null)}
        />
      )}
      {dragging && (
        <div className="drop-overlay">
          <div>{i.t("dropTorrent")}</div>
        </div>
      )}
    </I18nContext.Provider>
  );
}
