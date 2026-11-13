import { useEffect, type ReactNode } from "react";
import { X } from "../icons";

interface Props {
  title: ReactNode;
  icon?: ReactNode;
  wide?: boolean;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  bodyClass?: string;
}

export function Dialog({ title, icon, wide, onClose, children, footer, bodyClass }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="overlay"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className={`dialog${wide ? " wide" : ""}`} role="dialog" aria-modal="true">
        <div className="dialog-head">
          {icon}
          <h2>{title}</h2>
          <button className="icon-btn" onClick={onClose} aria-label="close">
            <X />
          </button>
        </div>
        <div className={bodyClass ?? "dialog-body"}>{children}</div>
        {footer && <div className="dialog-foot">{footer}</div>}
      </div>
    </div>
  );
}
