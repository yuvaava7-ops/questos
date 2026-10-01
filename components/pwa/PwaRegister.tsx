"use client";

import { useEffect } from "react";

// Registers the service worker (production only: it would fight hot reload in dev).
export function PwaRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch(() => {
      // Installability is a nicety; ignore registration failures.
    });
  }, []);
  return null;
}
