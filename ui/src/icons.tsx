import type { ReactNode, SVGProps } from "react";
import type { Kind } from "./api";

type P = SVGProps<SVGSVGElement> & { size?: number };

function Svg({ size = 16, children, ...rest }: P & { children: ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.4}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...rest}
    >
      {children}
    </svg>
  );
}

export const Plus = (p: P) => (
  <Svg {...p}>
    <path d="M8 3v10M3 8h10" />
  </Svg>
);
export const MagnetIcon = (p: P) => (
  <Svg {...p}>
    <path d="M4 2.5v5a4 4 0 0 0 8 0v-5" />
    <path d="M4 5h2.5M9.5 5H12M6.5 2.5v5a1.5 1.5 0 0 0 3 0v-5" />
  </Svg>
);
export const Play = (p: P) => (
  <Svg {...p}>
    <path d="M5 3.5v9l7-4.5-7-4.5Z" />
  </Svg>
);
export const PauseIcon = (p: P) => (
  <Svg {...p}>
    <path d="M5.5 3.5v9M10.5 3.5v9" />
  </Svg>
);
export const Trash = (p: P) => (
  <Svg {...p}>
    <path d="M2.5 4.5h11M6 4.5V3h4v1.5M4 4.5l.6 8.2a1 1 0 0 0 1 .8h4.8a1 1 0 0 0 1-.8l.6-8.2M6.7 7v4M9.3 7v4" />
  </Svg>
);
export const Search = (p: P) => (
  <Svg {...p}>
    <circle cx="7" cy="7" r="4.25" />
    <path d="m10.2 10.2 3.3 3.3" />
  </Svg>
);
export const ListIcon = (p: P) => (
  <Svg {...p}>
    <path d="M5.5 4h8M5.5 8h8M5.5 12h8M2.5 4h.01M2.5 8h.01M2.5 12h.01" />
  </Svg>
);
export const Down = (p: P) => (
  <Svg {...p}>
    <path d="M8 2.5v8M4.5 7 8 10.5 11.5 7M3 13.5h10" />
  </Svg>
);
export const Up = (p: P) => (
  <Svg {...p}>
    <path d="M8 13.5v-8M4.5 9 8 5.5 11.5 9M3 2.5h10" />
  </Svg>
);
export const ArrowDown = (p: P) => (
  <Svg {...p}>
    <path d="M8 3v10M4.5 9.5 8 13l3.5-3.5" />
  </Svg>
);
export const ArrowUp = (p: P) => (
  <Svg {...p}>
    <path d="M8 13V3M4.5 6.5 8 3l3.5 3.5" />
  </Svg>
);
export const CheckCircle = (p: P) => (
  <Svg {...p}>
    <circle cx="8" cy="8" r="5.75" />
    <path d="m5.5 8.2 1.7 1.7 3.3-3.6" />
  </Svg>
);
export const Check = (p: P) => (
  <Svg {...p}>
    <path d="m3.5 8.5 3 3 6-7" />
  </Svg>
);
export const Alert = (p: P) => (
  <Svg {...p}>
    <path d="M8 2.5 14 13H2L8 2.5Z" />
    <path d="M8 6.5v3M8 11.3h.01" />
  </Svg>
);
export const Shield = (p: P) => (
  <Svg {...p}>
    <path d="M8 2 3 4v4c0 3 2.2 5.1 5 6 2.8-.9 5-3 5-6V4L8 2Z" />
    <path d="m5.8 8 1.5 1.5L10.3 6.5" />
  </Svg>
);
export const Phone = (p: P) => (
  <Svg {...p}>
    <rect x="4.5" y="1.75" width="7" height="12.5" rx="1.5" />
    <path d="M7.3 12h1.4" />
  </Svg>
);
export const Gear = (p: P) => (
  <Svg {...p}>
    <circle cx="8" cy="8" r="2" />
    <path d="M8 1.75v1.5M8 12.75v1.5M14.25 8h-1.5M3.25 8h-1.5M12.4 3.6l-1.06 1.06M4.66 11.34 3.6 12.4M12.4 12.4l-1.06-1.06M4.66 4.66 3.6 3.6" />
  </Svg>
);
export const ImportIcon = (p: P) => (
  <Svg {...p}>
    <path d="M8 2v7.5M5 6.5 8 9.5l3-3" />
    <path d="M2.5 10v2.5a1 1 0 0 0 1 1h9a1 1 0 0 0 1-1V10" />
  </Svg>
);
export const Film = (p: P) => (
  <Svg {...p}>
    <rect x="2" y="2.5" width="12" height="11" rx="1.5" />
    <path d="M5 2.5v11M11 2.5v11M2 6h3M2 10h3M11 6h3M11 10h3" />
  </Svg>
);
export const Music = (p: P) => (
  <Svg {...p}>
    <path d="M6 11.5V3.5l7-1.5v8" />
    <circle cx="4.5" cy="11.5" r="1.75" />
    <circle cx="11.5" cy="10" r="1.75" />
  </Svg>
);
export const Disc = (p: P) => (
  <Svg {...p}>
    <circle cx="8" cy="8" r="5.75" />
    <circle cx="8" cy="8" r="1.5" />
  </Svg>
);
export const Book = (p: P) => (
  <Svg {...p}>
    <path d="M3 3a1 1 0 0 1 1-1h8v10H4a1 1 0 0 0-1 1V3Z" />
    <path d="M3 13a1 1 0 0 0 1 1h8v-2" />
  </Svg>
);
export const Box = (p: P) => (
  <Svg {...p}>
    <path d="M8 1.75 13.5 4.6v6.8L8 14.25 2.5 11.4V4.6L8 1.75Z" />
    <path d="M2.5 4.6 8 7.5l5.5-2.9M8 7.5v6.75" />
  </Svg>
);
export const Archive = (p: P) => (
  <Svg {...p}>
    <rect x="2" y="2.5" width="12" height="3" rx="1" />
    <path d="M3 5.5v7a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-7M6.5 8.5h3" />
  </Svg>
);
export const ImageIcon = (p: P) => (
  <Svg {...p}>
    <rect x="2" y="2.5" width="12" height="11" rx="1.5" />
    <circle cx="5.75" cy="6" r="1.1" />
    <path d="m2.5 12 3.7-3.7 2.3 2.3 2-2 3 3" />
  </Svg>
);
export const FileIcon = (p: P) => (
  <Svg {...p}>
    <path d="M9 1.75H4.5a1 1 0 0 0-1 1v10.5a1 1 0 0 0 1 1h7a1 1 0 0 0 1-1V5.25L9 1.75Z" />
    <path d="M9 1.75v3.5h3.5" />
  </Svg>
);
export const Folder = (p: P) => (
  <Svg {...p}>
    <path d="M2 4a1 1 0 0 1 1-1h3.2l1.5 1.5H13a1 1 0 0 1 1 1V12a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V4Z" />
  </Svg>
);
export const X = (p: P) => (
  <Svg {...p}>
    <path d="m4 4 8 8M12 4l-8 8" />
  </Svg>
);
export const Bolt = (p: P) => (
  <Svg {...p}>
    <path d="M9 1.75 3.5 9H8l-1 5.25L12.5 7H8l1-5.25Z" />
  </Svg>
);
export const Copy = (p: P) => (
  <Svg {...p}>
    <rect x="5.5" y="5.5" width="8" height="8" rx="1.25" />
    <path d="M10.5 5.5V3.5a1 1 0 0 0-1-1h-6a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2" />
  </Svg>
);
export const External = (p: P) => (
  <Svg {...p}>
    <path d="M9.5 2.5h4v4M13.5 2.5 7.5 8.5M12 9.5v3a1 1 0 0 1-1 1H3.5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h3" />
  </Svg>
);
export const Refresh = (p: P) => (
  <Svg {...p}>
    <path d="M13.25 8a5.25 5.25 0 1 1-1.54-3.71" />
    <path d="M13.5 2.5v3h-3" />
  </Svg>
);

export const Dot = ({ color }: { color: string }) => (
  <span className="dot" style={{ background: color }} />
);

export function KindIcon({ kind, ...p }: P & { kind: Kind }) {
  switch (kind) {
    case "video":
      return <Film {...p} />;
    case "audio":
      return <Music {...p} />;
    case "disk":
      return <Disc {...p} />;
    case "document":
      return <Book {...p} />;
    case "program":
      return <Box {...p} />;
    case "archive":
      return <Archive {...p} />;
    case "image":
      return <ImageIcon {...p} />;
    default:
      return <FileIcon {...p} />;
  }
}
