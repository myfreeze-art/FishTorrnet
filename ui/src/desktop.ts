import { getCurrentWindow } from "@tauri-apps/api/window";

export const isDesktop = "__TAURI_INTERNALS__" in window;
export const isMac = /Mac/.test(navigator.userAgent);

export const appWindow = () => getCurrentWindow();
