import { useEffect, useState } from "react";
import { api, type Language, type Settings, type Theme } from "../api";
import { LANG_CODES, LOCALES, useI18n, type Key } from "../i18n";
import { Alert, Folder, Gear } from "../icons";
import { Dialog } from "./Dialog";
import { useToast } from "./Toasts";

type Section = "downloads" | "network" | "interface" | "remote";

interface Props {
  canPickFolder: boolean;
  initialSection?: Section;
  onClose: () => void;
  onSaved: (s: Settings) => void;
}

const SECTIONS: { id: Section; key: Key }[] = [
  { id: "downloads", key: "secDownloads" },
  { id: "network", key: "secNetwork" },
  { id: "interface", key: "secInterface" },
  { id: "remote", key: "secRemote" },
];

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="toggle">
      <input type="checkbox" className="switch" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span>{label}</span>
    </label>
  );
}

function NumberField({
  label,
  value,
  onChange,
  hint,
  min,
  max,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  hint?: string;
  min?: number;
  max?: number;
}) {
  return (
    <div className="field">
      <label>{label}</label>
      <input
        className="input num"
        type="number"
        min={min}
        max={max}
        value={Number.isFinite(value) ? value : 0}
        onChange={(e) => onChange(Math.max(0, Math.floor(Number(e.target.value) || 0)))}
      />
      {hint && <span className="faint" style={{ fontSize: 12 }}>{hint}</span>}
    </div>
  );
}

export function SettingsDialog({ canPickFolder, initialSection, onClose, onSaved }: Props) {
  const i = useI18n();
  const toast = useToast();
  const [section, setSection] = useState<Section>(initialSection ?? "downloads");
  const [s, setS] = useState<Settings | null>(null);
  const [saving, setSaving] = useState(false);
  const [restart, setRestart] = useState(false);

  useEffect(() => {
    api.settings().then(setS, toast.error);
  }, [toast]);

  const set = <K extends keyof Settings>(k: K, v: Settings[K]) => setS((cur) => (cur ? { ...cur, [k]: v } : cur));

  const save = async () => {
    if (!s) return;
    setSaving(true);
    try {
      const r = await api.saveSettings(s);
      setRestart(r.restart_required);
      onSaved(r.settings);
      toast.ok(i.t("saved"));
      if (!r.restart_required) onClose();
    } catch (e) {
      toast.error(e);
    } finally {
      setSaving(false);
    }
  };

  const pick = async () => {
    try {
      const r = await api.pickFolder();
      if (r.path) set("download_folder", r.path);
    } catch (e) {
      toast.error(e);
    }
  };

  return (
    <Dialog
      wide
      title={i.t("settingsTitle")}
      icon={<Gear style={{ color: "var(--accent)" }} />}
      onClose={onClose}
      bodyClass="settings-grid"
      footer={
        <>
          {restart && (
            <span className="inline muted">
              <Alert size={14} style={{ color: "var(--accent)" }} />
              {i.t("needRestartNote")}
            </span>
          )}
          <span className="grow" />
          <button className="btn" onClick={onClose}>
            {i.t("cancel")}
          </button>
          <button className="btn primary" disabled={!s || saving} onClick={save}>
            {i.t("save")}
          </button>
        </>
      }
    >
      <nav className="settings-nav">
        {SECTIONS.map((x) => (
          <button
            key={x.id}
            className={`nav-item${section === x.id ? " active" : ""}`}
            onClick={() => setSection(x.id)}
          >
            {i.t(x.key)}
          </button>
        ))}
      </nav>
      <div className="settings-pane">
        {!s && <span className="spinner" />}
        {s && section === "downloads" && (
          <>
            <div className="field">
              <label>{i.t("downloadFolder")}</label>
              <div className="inline">
                <input
                  className="input mono"
                  value={s.download_folder}
                  onChange={(e) => set("download_folder", e.target.value)}
                />
                {canPickFolder && (
                  <button className="btn" onClick={pick}>
                    <Folder />
                    {i.t("browse")}
                  </button>
                )}
              </div>
            </div>
            <div className="two">
              <NumberField
                label={i.t("downLimit")}
                value={s.download_limit_kib}
                onChange={(v) => set("download_limit_kib", v)}
                hint={i.t("zeroUnlimited")}
              />
              <NumberField
                label={i.t("upLimit")}
                value={s.upload_limit_kib}
                onChange={(v) => set("upload_limit_kib", v)}
                hint={i.t("zeroUnlimited")}
              />
            </div>
          </>
        )}
        {s && section === "network" && (
          <>
            <div className="two">
              <NumberField
                label={i.t("listenPort")}
                value={s.listen_port}
                min={1024}
                max={65535}
                onChange={(v) => set("listen_port", Math.min(65535, v))}
              />
              <NumberField
                label={i.t("peerLimit")}
                value={s.peer_limit}
                min={10}
                max={2000}
                onChange={(v) => set("peer_limit", v)}
              />
            </div>
            <div>
              <Toggle checked={s.upnp} onChange={(v) => set("upnp", v)} label={i.t("upnp")} />
              <Toggle checked={s.utp} onChange={(v) => set("utp", v)} label={i.t("utp")} />
              <Toggle checked={s.dht} onChange={(v) => set("dht", v)} label={i.t("dhtLabel")} />
              <Toggle checked={s.lsd} onChange={(v) => set("lsd", v)} label={i.t("lsd")} />
            </div>
          </>
        )}
        {s && section === "interface" && (
          <>
            <div className="field">
              <span className="label">{i.t("theme")}</span>
              <div className="segmented">
                {(["system", "dark", "light"] as Theme[]).map((t) => (
                  <button key={t} className={s.theme === t ? "on" : ""} onClick={() => set("theme", t)}>
                    {i.t(t === "system" ? "themeSystem" : t === "dark" ? "themeDark" : "themeLight")}
                  </button>
                ))}
              </div>
            </div>
            <div className="field">
              <span className="label">{i.t("language")}</span>
              <select
                className="input"
                style={{ maxWidth: 280 }}
                value={s.language}
                onChange={(e) => set("language", e.target.value as Language)}
              >
                <option value="auto">{i.t("languageAuto")}</option>
                {LANG_CODES.map((code) => (
                  <option key={code} value={code}>
                    {LOCALES[code].name}
                  </option>
                ))}
              </select>
            </div>
          </>
        )}
        {s && section === "remote" && (
          <>
            <Toggle checked={s.remote_access} onChange={(v) => set("remote_access", v)} label={i.t("remoteEnable")} />
            <NumberField
              label={i.t("remotePort")}
              value={s.remote_port}
              min={1024}
              max={65535}
              onChange={(v) => set("remote_port", Math.min(65535, v))}
            />
            <span className="faint">{i.t("remoteWarn")}</span>
          </>
        )}
      </div>
    </Dialog>
  );
}
