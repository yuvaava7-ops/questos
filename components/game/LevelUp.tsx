"use client";

import { useEffect } from "react";
import { Sprite } from "@/components/pixel/Sprite";
import { STAR } from "@/components/pixel/sprites";

// Full-screen fanfare when XP crosses a level boundary.
export function LevelUp({ level, title, onClose }: { level: number; title: string; onClose: () => void }) {
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
      aria-label={`Level up! You reached level ${level}`}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/85 p-6"
    >
      <div className="anim-pop win w-full max-w-[340px] text-center">
        <div className="flex justify-center gap-2 pt-5">
          {[0, 1, 2].map((i) => (
            <div key={i} className="anim-twinkle" style={{ animationDelay: `${i * 0.25}s` }}>
              <Sprite def={STAR} scale={i === 1 ? 5 : 4} />
            </div>
          ))}
        </div>
        <p className="logo-shine px-title mt-4 text-[24px]">LEVEL UP!</p>
        <p className="px-title mt-5 text-[14px] text-gold">LV {level}</p>
        <p className="mt-1 text-[26px] uppercase text-dim">{title}</p>
        <p className="mb-5 mt-4 text-[22px] text-paper">Your legend grows.</p>
        <button type="button" className="px-btn mb-5" onClick={onClose}>
          CONTINUE
        </button>
      </div>
    </div>
  );
}
