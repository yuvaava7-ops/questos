"use client";

import { useEffect, useState } from "react";
import { sfx } from "@/lib/sfx";

interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

type Mode = "checking" | "installed" | "prompt" | "ios" | "manual";

// "Download" the game as an installable app: a one-tap install on Chrome/Edge/
// Android, Add-to-Home-Screen steps on iOS, and a hint everywhere else.
export function InstallApp() {
  const [mode, setMode] = useState<Mode>("checking");
  const [deferred, setDeferred] = useState<InstallPromptEvent | null>(null);

  useEffect(() => {
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as unknown as { standalone?: boolean }).standalone === true;
    if (standalone) {
      setMode("installed");
      return;
    }
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
    setMode(ios ? "ios" : "manual");

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as InstallPromptEvent);
      setMode("prompt");
    };
    const onInstalled = () => setMode("installed");
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  async function install() {
    if (!deferred) return;
    sfx.tap();
    await deferred.prompt();
    const { outcome } = await deferred.userChoice;
    if (outcome === "accepted") setMode("installed");
    setDeferred(null);
  }

  if (mode === "checking") return null;

  return (
    <div>
      {mode === "installed" && <p className="text-[24px] leading-tight text-leaf">Installed. You are playing the app.</p>}

      {mode === "prompt" && (
        <>
          <p className="mb-4 text-[23px] leading-tight text-dim">
            Install QuestOS as an app: its own window and icon, launches full screen, works on phone and PC.
          </p>
          <button type="button" className="px-btn w-full" onClick={install}>
            Download app
          </button>
        </>
      )}

      {mode === "ios" && (
        <p className="text-[23px] leading-tight text-dim">
          On iPhone or iPad: tap <span className="text-gold">Share</span>, then <span className="text-gold">Add to Home Screen</span>.
        </p>
      )}

      {mode === "manual" && (
        <p className="text-[23px] leading-tight text-dim">
          Your browser has not offered install yet. In Chrome or Edge, look for the install icon in the address bar, or open the
          menu and choose <span className="text-gold">Install QuestOS</span>. On Android, use menu &gt; Add to Home screen.
        </p>
      )}
    </div>
  );
}
