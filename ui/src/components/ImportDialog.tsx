import { useEffect, useState } from "react";
import { api, type Client, type ImportResult } from "../api";
import { useI18n } from "../i18n";
import { ImportIcon } from "../icons";
import { Dialog } from "./Dialog";
import { useToast } from "./Toasts";

const CLIENTS: { id: Client; name: string }[] = [
  { id: "qbittorrent", name: "qBittorrent" },
  { id: "utorrent", name: "uTorrent" },
];

export function ImportDialog({ onClose }: { onClose: () => void }) {
  const i = useI18n();
  const toast = useToast();
  const [paths, setPaths] = useState<Record<Client, string | null> | null>(null);
  const [custom, setCustom] = useState<Record<Client, string>>({ qbittorrent: "", utorrent: "" });
  const [busy, setBusy] = useState<Client | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);

  useEffect(() => {
    api.importDetect().then(setPaths, toast.error);
  }, [toast]);

  const run = async (c: Client) => {
    setBusy(c);
    setResult(null);
    try {
      const r = await api.importRun(c, custom[c].trim() || undefined);
      setResult(r);
    } catch (e) {
      toast.error(e);
    } finally {
      setBusy(null);
    }
  };

  return (
    <Dialog title={i.t("importTitle")} icon={<ImportIcon style={{ color: "var(--accent)" }} />} onClose={onClose}>
      <span className="muted">{i.t("importText")}</span>
      {!paths && <span className="spinner" />}
      {paths &&
        CLIENTS.map((c) => (
          <div key={c.id} className="import-row">
            <div style={{ display: "flex", flexDirection: "column", gap: 8, minWidth: 0 }}>
              <b>{c.name}</b>
              <span className="path">{paths[c.id] ?? i.t("notFound")}</span>
              <input
                className="input mono"
                placeholder={i.t("customPath")}
                value={custom[c.id]}
                onChange={(e) => setCustom({ ...custom, [c.id]: e.target.value })}
              />
            </div>
            <button
              className="btn primary"
              disabled={busy !== null || (!paths[c.id] && !custom[c.id].trim())}
              onClick={() => run(c.id)}
            >
              {busy === c.id ? <span className="spinner" /> : <ImportIcon />}
              {i.t("importFrom")}
            </button>
          </div>
        ))}
      {result && (
        <>
          <b>{i.t("importDone")}</b>
          <div className="stats">
            <div className="stat">
              <b>{result.found}</b>
              <span>{i.t("importFound")}</span>
            </div>
            <div className="stat">
              <b>{result.added}</b>
              <span>{i.t("importAdded")}</span>
            </div>
            <div className="stat">
              <b>{result.existing}</b>
              <span>{i.t("importExisting")}</span>
            </div>
            <div className="stat">
              <b>{result.failed.length}</b>
              <span>{i.t("importFailed")}</span>
            </div>
          </div>
          {result.failed.slice(0, 5).map((f) => (
            <span key={f.source} className="error-text">
              {f.source}: {f.error}
            </span>
          ))}
        </>
      )}
    </Dialog>
  );
}
