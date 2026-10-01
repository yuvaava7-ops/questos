"use client";

import { useEffect } from "react";
import { Sprite } from "@/components/pixel/Sprite";
import { STAR } from "@/components/pixel/sprites";

export interface Fanfare {
  headline: string; // "LEVEL UP!" / "NEW CLASS!"
  big: string; // "LV 4" / "Ranger"
  sub: string; // title or class blurb
}

// Full-screen fanfare for level-ups and class unlocks.
export function LevelUp({ fanfare, onClose }: { fanfare: Fanfare; onClose: () => void }) {
  useEffect(() => {
    const t = window.setTimeout(onClose, 4500);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " " || e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${fanfare.headline} ${fanfare.big}`}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/85 p-6"
    >
      <div className="anim-pop win w-full max-w-[360px] text-center">
        <div className="flex justify-center gap-2 pt-5">
          {[0, 1, 2].map((i) => (
            <div key={i} className="anim-twinkle" style={{ animationDelay: `${i * 0.25}s` }}>
              <Sprite def={STAR} scale={i === 1 ? 5 : 4} />
            </div>
          ))}
        </div>
        <p className="logo-shine px-title mt-4 text-[22px]">{fanfare.headline}</p>
        <p className="px-title mt-5 text-[14px] text-gold">{fanfare.big}</p>
        <p className="mx-4 mb-5 mt-2 text-[24px] leading-tight text-dim">{fanfare.sub}</p>
        <button type="button" className="px-btn mb-5" onClick={onClose}>
          CONTINUE
        </button>
      </div>
    </div>
  );
}
