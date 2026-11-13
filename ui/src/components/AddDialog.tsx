import { useEffect, useMemo, useRef, useState } from "react";
import { api, fileToBase64, type Preview, type PreviewFile, type Report } from "../api";
import { bytes } from "../format";
import { useI18n } from "../i18n";
import { Alert, CheckCircle, FileIcon, Folder, KindIcon, MagnetIcon, Plus, Shield } from "../icons";
import { Dialog } from "./Dialog";
import { isPlayable } from "./DetailsPanel";
import { useToast } from "./Toasts";

export type AddSource = { magnet: string } | { file: File } | { torrent: string } | null;

interface Props {
  initial: AddSource;
  canPickFolder: boolean;
  onClose: () => void;
  onAdded: (id: number, watch: number | null) => void;
  onShowExisting: (id: number) => void;
}

export function GuardBox({ report }: { report: Report }) {
  const i = useI18n();
  const title = report.level === "safe" ? i.t("guardSafe") : report.level === "caution" ? i.t("guardCaution") : i.t("guardDanger");
  return (
    <div className={`guard ${report.level}`}>
      <div className="guard-head">
        {report.level === "safe" ? <Shield /> : <Alert />}
        <span>{title}</span>
        <span className="faint" style={{ marginLeft: "auto", fontWeight: 400, fontSize: 12 }}>
          {i.t("guardChecked")}: {report.files_checked}
        </span>
      </div>
      {report.issues.length > 0 && (
        <ul>
          {report.issues.slice(0, 6).map((is, idx) => (
            <li key={idx}>
              <span style={{ color: is.level === "danger" ? "var(--red)" : "var(--yellow)" }}>{i.finding(is.finding)}</span>
              <code>{is.file}</code>
            </li>
          ))}
          {report.issues.length > 6 && <li className="faint">+{report.issues.length - 6}</li>}
        </ul>
      )}
    </div>
  );
}

export function AddDialog({ initial, canPickFolder, onClose, onAdded, onShowExisting }: Props) {
  const i = useI18n();
  const toast = useToast();
  const L = i.lang;
  const [link, setLink] = useState(initial && "magnet" in initial ? initial.magnet : "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<Preview | null>(null);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [folder, setFolder] = useState("");
  const [startNow, setStartNow] = useState(true);
  const [watch, setWatch] = useState(false);
  const [risk, setRisk] = useState(false);
  const [adding, setAdding] = useState(false);
  const [over, setOver] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const started = useRef(false);

  const load = async (src: { magnet?: string; torrent?: string }) => {
    setLoading(true);
    setError(null);
    try {
      const p = await api.preview(src);
      setPreview(p);
      setSelected(new Set((p.files ?? []).map((f) => f.index)));
      setFolder(p.default_folder ?? "");
      setWatch(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  const loadFile = async (f: File) => {
    try {
      await load({ torrent: await fileToBase64(f) });
    } catch (e) {
      setError(String(e));
    }
  };

  useEffect(() => {
    if (started.current || !initial) return;
    started.current = true;
    if ("magnet" in initial) load({ magnet: initial.magnet });
    else if ("torrent" in initial) load({ torrent: initial.torrent });
    else loadFile(initial.file);
  }, []);

  const files = preview?.files ?? [];
  const selectedBytes = useMemo(
    () => files.filter((f) => selected.has(f.index)).reduce((a, f) => a + f.length, 0),
    [files, selected],
  );
  const playable: PreviewFile | undefined = useMemo(
    () =>
      files
        .filter((f) => selected.has(f.index) && isPlayable(f.name) && (f.kind === "video" || f.kind === "audio"))
        .sort((a, b) => b.length - a.length)[0],
    [files, selected],
  );
  const danger = preview?.report?.level === "danger";

  const toggle = (idx: number) => {
    const next = new Set(selected);
    if (next.has(idx)) next.delete(idx);
    else next.add(idx);
    setSelected(next);
  };

  const pick = async () => {
    try {
      const r = await api.pickFolder();
      if (r.path) setFolder(r.path);
    } catch (e) {
      toast.error(e);
    }
  };

  const submit = async () => {
    if (!preview?.torrent) return;
    setAdding(true);
    try {
      const all = selected.size === files.length;
      const r = await api.add({
        torrent: preview.torrent,
        name: preview.name ?? undefined,
        multi_file: preview.multi_file,
        peers: preview.peers,
        folder,
        files: all ? undefined : [...selected],
        paused: !startNow && !watch,
      });
      onAdded(r.id, watch && playable ? playable.index : null);
    } catch (e) {
      toast.error(e);
      setAdding(false);
    }
  };

  if (preview && preview.existing_id != null) {
    return (
      <Dialog
        title={preview.name ?? i.t("addTitle")}
        onClose={onClose}
        footer={
          <>
            <span className="grow" />
            <button className="btn" onClick={onClose}>
              {i.t("close")}
            </button>
            <button className="btn primary" onClick={() => onShowExisting(preview.existing_id!)}>
              {i.t("showIt")}
            </button>
          </>
        }
      >
        <div className="notice">
          <CheckCircle />
          <span>{i.t("alreadyAdded")}</span>
        </div>
      </Dialog>
    );
  }

  if (!preview) {
    return (
      <Dialog
        title={i.t("addTitle")}
        icon={<MagnetIcon style={{ color: "var(--accent)" }} />}
        onClose={onClose}
        footer={
          <>
            <span className="grow" />
            <button className="btn" onClick={onClose}>
              {i.t("cancel")}
            </button>
            <button className="btn primary" disabled={loading || !link.trim()} onClick={() => load({ magnet: link })}>
              {i.t("next")}
            </button>
          </>
        }
      >
        <div className="field">
          <label htmlFor="src">{i.t("addSource")}</label>
          <input
            id="src"
            className="input mono"
            autoFocus
            value={link}
            disabled={loading}
            placeholder="magnet:?xt=urn:btih:…"
            onChange={(e) => setLink(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && link.trim()) load({ magnet: link });
            }}
          />
        </div>
        <div
          className={`drop${over ? " over" : ""}`}
          onDragOver={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setOver(true);
          }}
          onDragLeave={() => setOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setOver(false);
            const f = e.dataTransfer.files[0];
            if (f) loadFile(f);
          }}
        >
          <button className="btn" disabled={loading} onClick={() => fileInput.current?.click()}>
            <FileIcon />
            {i.t("chooseFile")}
          </button>
          <span className="faint">{i.t("dropHere")}</span>
          <input
            ref={fileInput}
            type="file"
            accept=".torrent,application/x-bittorrent"
            hidden
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) loadFile(f);
              e.target.value = "";
            }}
          />
        </div>
        {loading && (
          <div className="loading">
            <span className="spinner" />
            <span>{i.t("fetchingMeta")}</span>
          </div>
        )}
        {error && <div className="error-text">{error}</div>}
      </Dialog>
    );
  }

  const allChecked = selected.size === files.length;
  return (
    <Dialog
      wide
      title={i.t("addTitle")}
      icon={<Plus style={{ color: "var(--accent)" }} />}
      onClose={onClose}
      footer={
        <>
          <span className="muted num">
            {i.t("filesSelected")}: {selected.size} / {files.length} · {bytes(selectedBytes, L)}
          </span>
          <span className="grow" />
          <button className="btn" onClick={() => setPreview(null)}>
            {i.t("back")}
          </button>
          <button
            className={`btn ${danger ? "danger" : "primary"}`}
            disabled={adding || selected.size === 0 || (danger && !risk)}
            onClick={submit}
          >
            {adding ? <span className="spinner" /> : <Plus />}
            {i.t("add")}
          </button>
        </>
      }
    >
      <div className="meta-card">
        <div className="icon">
          <KindIcon kind={preview.kind ?? "other"} size={20} />
        </div>
        <div style={{ minWidth: 0, display: "flex", flexDirection: "column", gap: 4 }}>
          <span className="name">{preview.name}</span>
          <span className="muted num">
            {bytes(preview.total_bytes ?? 0, L)} · {files.length} · {i.kind(preview.kind ?? "other")}
          </span>
        </div>
      </div>

      {preview.report && <GuardBox report={preview.report} />}
      {danger && (
        <label className="toggle">
          <input type="checkbox" className="check" checked={risk} onChange={(e) => setRisk(e.target.checked)} />
          <span>{i.t("riskAccept")}</span>
        </label>
      )}

      <div className="field">
        <span className="label">{i.t("saveTo")}</span>
        <div className="inline">
          <input className="input mono" value={folder} onChange={(e) => setFolder(e.target.value)} />
          {canPickFolder && (
            <button className="btn" onClick={pick}>
              <Folder />
              {i.t("browse")}
            </button>
          )}
        </div>
      </div>

      <div className="file-list">
        <div className="file-row head">
          <input
            type="checkbox"
            className="check"
            checked={allChecked}
            ref={(el) => {
              if (el) el.indeterminate = !allChecked && selected.size > 0;
            }}
            onChange={() => setSelected(allChecked ? new Set() : new Set(files.map((f) => f.index)))}
          />
          <span>{i.t("colName")}</span>
          <span>{i.t("colSize")}</span>
        </div>
        {files.map((f) => (
          <label key={f.index} className="file-row" style={{ cursor: "pointer" }}>
            <input type="checkbox" className="check" checked={selected.has(f.index)} onChange={() => toggle(f.index)} />
            <KindIcon kind={f.kind} />
            <span className="ellipsis" title={f.name}>
              {f.path.join(" / ")}
            </span>
            <span className="num muted" style={{ textAlign: "right" }}>
              {bytes(f.length, L)}
            </span>
          </label>
        ))}
      </div>

      <div style={{ display: "flex", flexDirection: "column" }}>
        <label className="toggle">
          <input type="checkbox" className="switch" checked={startNow} onChange={(e) => setStartNow(e.target.checked)} />
          <span>{i.t("startNow")}</span>
        </label>
        {playable && (
          <label className="toggle">
            <input type="checkbox" className="switch" checked={watch} onChange={(e) => setWatch(e.target.checked)} />
            <span>{i.t("watchNow")}</span>
            <span className="faint ellipsis">{playable.name}</span>
          </label>
        )}
      </div>
    </Dialog>
  );
}
