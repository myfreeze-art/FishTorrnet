import { useEffect, useRef, useState } from "react";
import { HISTORY, type Series } from "../ui";
import { useI18n } from "../i18n";

function niceMax(v: number): number {
  if (v <= 0) return 1024 * 1024;
  const mb = v / (1024 * 1024);
  const steps = [0.1, 0.2, 0.5, 1, 2, 4, 5, 10, 20, 40, 50, 100, 200, 400, 500, 1000];
  const s = steps.find((x) => x >= mb * 1.1) ?? Math.ceil(mb / 1000) * 1000;
  return s * 1024 * 1024;
}

function label(bytes: number, intl: string) {
  const mb = bytes / (1024 * 1024);
  return mb.toLocaleString(intl, { maximumFractionDigits: mb < 1 ? 1 : 0 });
}

export function SpeedChart({ series }: { series: Series }) {
  const i = useI18n();
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 600, h: 160 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => {
      setSize({ w: Math.max(100, e.contentRect.width), h: Math.max(60, e.contentRect.height) });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const axis = 40;
  const bottom = 20;
  const w = size.w - axis;
  const h = size.h - bottom;
  const max = niceMax(Math.max(0, ...series.down, ...series.up));
  const x = (idx: number, len: number) => w - ((len - 1 - idx) / (HISTORY - 1)) * w;
  const y = (v: number) => h - (Math.min(v, max) / max) * (h - 4);

  const line = (data: number[]) =>
    data.map((v, idx) => `${idx === 0 ? "M" : "L"}${x(idx, data.length).toFixed(1)} ${y(v).toFixed(1)}`).join("");
  const area = (data: number[]) =>
    data.length > 1 ? `${line(data)}L${x(data.length - 1, data.length).toFixed(1)} ${h}L${x(0, data.length).toFixed(1)} ${h}Z` : "";

  const ticks = [0, 1, 2, 3, 4, 5];

  return (
    <div className="chart" ref={ref}>
      <svg viewBox={`0 0 ${size.w} ${size.h}`} preserveAspectRatio="none">
        <defs>
          <linearGradient id="fill-down" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="var(--accent)" stopOpacity="0.32" />
            <stop offset="1" stopColor="var(--accent)" stopOpacity="0.02" />
          </linearGradient>
        </defs>
        {[0, 0.5, 1].map((f) => (
          <g key={f}>
            <line x1={0} x2={w} y1={y(max * f)} y2={y(max * f)} stroke="var(--line)" />
            <text x={size.w} y={y(max * f) + 4} textAnchor="end">
              {label(max * f, i.locale)}
            </text>
          </g>
        ))}
        <path d={area(series.down)} fill="url(#fill-down)" />
        <path d={line(series.down)} fill="none" stroke="var(--accent)" strokeWidth={1.5} strokeLinejoin="round" />
        <path d={line(series.up)} fill="none" stroke="var(--blue)" strokeWidth={1.5} strokeLinejoin="round" />
        {ticks.map((t) => (
          <text
            key={t}
            x={(t / 5) * w}
            y={size.h - 4}
            textAnchor={t === 0 ? "start" : t === 5 ? "end" : "middle"}
          >
            {t === 5 ? i.t("now") : `−${5 - t}${t === 0 ? ` ${i.t("minAgo")}` : ""}`}
          </text>
        ))}
      </svg>
    </div>
  );
}
