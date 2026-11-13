import { useEffect, useState } from "react";
import { api, streamUrl, type Pieces } from "../api";
import { percent } from "../format";
import { useI18n } from "../i18n";
import { Copy, Folder, X } from "../icons";
import { PieceBar } from "./DetailsPanel";
import { useToast } from "./Toasts";

interface Props {
  torrentId: number;
  file: number;
  name: string;
  audio: boolean;
  local: boolean;
  onClose: () => void;
}

export function Player({ torrentId, file, name, audio, local, onClose }: Props) {
  const i = useI18n();
  const toast = useToast();
  const [failed, setFailed] = useState(false);
  const [pieces, setPieces] = useState<Pieces | null>(null);
  const src = streamUrl(torrentId, file);

  useEffect(() => {
    let alive = true;
    const load = () =>
      api.pieces(torrentId, 200).then(
        (p) => alive && setPieces(p),
        () => {},
      );
    load();
    const t = setInterval(load, 2000);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !document.fullscreenElement) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      alive = false;
      clearInterval(t);
      window.removeEventListener("keydown", onKey);
    };
  }, [torrentId, onClose]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(src);
      toast.ok(i.t("copied"));
    } catch (e) {
      toast.error(e);
    }
  };

  return (
    <div className="player">
      <div className="player-head">
        <span className="title">{name}</span>
        <span style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          <button className="btn" onClick={copy}>
            <Copy />
            {i.t("copyLink")}
          </button>
          {local && (
            <button className="btn" onClick={() => api.open(torrentId, file).catch(toast.error)}>
              <Folder />
              {i.t("openFolder")}
            </button>
          )}
          <button className="icon-btn" onClick={onClose} aria-label="close">
            <X />
          </button>
        </span>
      </div>
      <div className="player-stage">
        {failed ? (
          <div className="player-error">
            <span>{i.t("playerError")}</span>
            <button className="btn" onClick={copy}>
              <Copy />
              {i.t("copyLink")}
            </button>
          </div>
        ) : audio ? (
          <audio src={src} controls autoPlay onError={() => setFailed(true)} style={{ width: "min(640px, 90%)" }} />
        ) : (
          <video src={src} controls autoPlay playsInline onError={() => setFailed(true)} />
        )}
      </div>
      <div className="player-foot">
        <span className="num">
          {pieces ? percent(pieces.have, pieces.total) : 0}% {i.t("piecesReady")}
        </span>
        <PieceBar pieces={pieces} />
      </div>
    </div>
  );
}
