import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Register service worker for offline support
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // Service worker registration failed, continue without it
    });
  });
}

createRoot(document.getElementById("root")!).render(<App />);
