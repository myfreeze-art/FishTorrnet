import { useEffect, useState } from "react";
import { appWindow } from "../desktop";

export function WindowControls() {
  const [maximized, setMaximized] = useState(false);

  useEffect(() => {
    const w = appWindow();
    let unlisten: (() => void) | undefined;
    const sync = () => w.isMaximized().then(setMaximized, () => {});
    sync();
    w.onResized(sync).then((u) => (unlisten = u), () => {});
    return () => unlisten?.();
  }, []);

  return (
    <div className="window-controls">
      <button className="wc" aria-label="minimize" onClick={() => appWindow().minimize()}>
        <svg width="10" height="10" viewBox="0 0 10 10">
          <path d="M0 5h10" stroke="currentColor" strokeWidth="1" />
        </svg>
      </button>
      <button className="wc" aria-label="maximize" onClick={() => appWindow().toggleMaximize()}>
        {maximized ? (
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1">
            <path d="M2.5 2.5V.5h7v7h-2" />
            <rect x=".5" y="2.5" width="7" height="7" />
          </svg>
        ) : (
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1">
            <rect x=".5" y=".5" width="9" height="9" />
          </svg>
        )}
      </button>
      <button className="wc close" aria-label="close" onClick={() => appWindow().close()}>
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1">
          <path d="m.5.5 9 9M9.5.5l-9 9" />
        </svg>
      </button>
    </div>
  );
}
