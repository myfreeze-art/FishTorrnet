import { useState } from "react";
import type { Torrent } from "../api";
import { useI18n } from "../i18n";
import { Trash } from "../icons";
import { Dialog } from "./Dialog";

interface Props {
  torrents: Torrent[];
  onClose: () => void;
  onConfirm: (withFiles: boolean) => Promise<void>;
}

export function DeleteDialog({ torrents, onClose, onConfirm }: Props) {
  const i = useI18n();
  const [files, setFiles] = useState(false);
  const [busy, setBusy] = useState(false);
  const one = torrents.length === 1;

  return (
    <Dialog
      title={i.t("deleteTitle")}
      icon={<Trash style={{ color: "var(--red)" }} />}
      onClose={onClose}
      footer={
        <>
          <span className="grow" />
          <button className="btn" onClick={onClose}>
            {i.t("cancel")}
          </button>
          <button
            className="btn danger"
            disabled={busy}
            autoFocus
            onClick={async () => {
              setBusy(true);
              await onConfirm(files);
            }}
          >
            {i.t("remove")}
          </button>
        </>
      }
    >
      <span className="muted">{one ? torrents[0].name : `${i.t("deleteMany")}: ${torrents.length}`}</span>
      <span>{i.t("deleteText")}</span>
      <label className="toggle">
        <input type="checkbox" className="check" checked={files} onChange={(e) => setFiles(e.target.checked)} />
        <span>{i.t("deleteFiles")}</span>
      </label>
    </Dialog>
  );
}
