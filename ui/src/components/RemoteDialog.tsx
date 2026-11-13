import { useEffect, useState } from "react";
import { api, type RemoteInfo } from "../api";
import { useI18n } from "../i18n";
import { Alert, Copy, Phone } from "../icons";
import { Dialog } from "./Dialog";
import { useToast } from "./Toasts";

interface Props {
  local: boolean;
  canRestart: boolean;
  onClose: () => void;
  onRestart: () => void;
}

export function RemoteDialog({ local, canRestart, onClose, onRestart }: Props) {
  const i = useI18n();
  const toast = useToast();
  const [info, setInfo] = useState<RemoteInfo | null>(null);
  const [busy, setBusy] = useState(false);

  const load = () => api.remote().then(setInfo, toast.error);
  useEffect(() => {
    load();
  }, []);

  const enable = async () => {
    setBusy(true);
    try {
      const s = await api.settings();
      await api.saveSettings({ ...s, remote_access: true });
      await load();
    } catch (e) {
      toast.error(e);
    } finally {
      setBusy(false);
    }
  };

  const copy = async (u: string) => {
    try {
      await navigator.clipboard.writeText(u);
      toast.ok(i.t("copied"));
    } catch (e) {
      toast.error(e);
    }
  };

  return (
    <Dialog title={i.t("remoteTitle")} icon={<Phone style={{ color: "var(--accent)" }} />} onClose={onClose}>
      {!info && <span className="spinner" />}
      {info && !local && <span className="muted">{i.t("remoteOnlyLocal")}</span>}
      {info && local && !info.enabled && (
        <>
          <span className="muted">{i.t("remoteOff")}</span>
          <div>
            <button className="btn primary" disabled={busy} onClick={enable}>
              {i.t("remoteEnableButton")}
            </button>
          </div>
        </>
      )}
      {info && local && info.enabled && !info.active && (
        <div className="notice">
          <Alert />
          <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-start" }}>
            <span>{i.t("remotePending")}</span>
            {canRestart && (
              <button className="btn primary" onClick={onRestart}>
                {i.t("restartNow")}
              </button>
            )}
          </div>
        </div>
      )}
      {info && local && info.active && (
        <>
          <div className="qr">
            {info.qr_svg && <div className="code" dangerouslySetInnerHTML={{ __html: info.qr_svg }} />}
            <span className="muted">{i.t("remoteScan")}</span>
          </div>
          {info.urls.map((u) => (
            <div key={u} className="url-row">
              <input className="input mono" readOnly value={u} onFocus={(e) => e.target.select()} />
              <button className="btn" onClick={() => copy(u)}>
                <Copy />
                {i.t("copyLink")}
              </button>
            </div>
          ))}
          <span className="faint">{i.t("remoteWarn")}</span>
        </>
      )}
    </Dialog>
  );
}
