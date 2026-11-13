import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@fontsource-variable/inter";
import "./styles.css";
import { App } from "./App";
import { ToastProvider } from "./components/Toasts";

const saved = localStorage.getItem("fishtorrnet.theme");
const dark = saved === "dark" || (saved !== "light" && !window.matchMedia("(prefers-color-scheme: light)").matches);
document.documentElement.dataset.theme = dark ? "dark" : "light";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ToastProvider>
      <App />
    </ToastProvider>
  </StrictMode>,
);
