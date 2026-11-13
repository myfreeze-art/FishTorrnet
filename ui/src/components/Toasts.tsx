import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { Alert, CheckCircle, X } from "../icons";

interface Toast {
  id: number;
  kind: "ok" | "error";
  text: string;
}

interface Api {
  ok: (text: string) => void;
  error: (e: unknown) => void;
}

const Ctx = createContext<Api>({ ok: () => {}, error: () => {} });

export const useToast = () => useContext(Ctx);

let seq = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Toast[]>([]);

  const push = useCallback((kind: Toast["kind"], text: string) => {
    const id = ++seq;
    setItems((l) => [...l.slice(-3), { id, kind, text }]);
    setTimeout(() => setItems((l) => l.filter((t) => t.id !== id)), kind === "error" ? 7000 : 3500);
  }, []);

  const api = useMemo<Api>(
    () => ({
      ok: (text) => push("ok", text),
      error: (e) => push("error", e instanceof Error ? e.message : String(e)),
    }),
    [push],
  );

  return (
    <Ctx.Provider value={api}>
      {children}
      <div className="toasts">
        {items.map((t) => (
          <div key={t.id} className={`toast ${t.kind}`}>
            {t.kind === "ok" ? <CheckCircle /> : <Alert />}
            <div className="text">{t.text}</div>
            <button
              className="icon-btn"
              style={{ width: 16, height: 16 }}
              onClick={() => setItems((l) => l.filter((x) => x.id !== t.id))}
            >
              <X size={12} />
            </button>
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}
