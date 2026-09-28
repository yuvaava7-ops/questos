/* eslint-disable @next/next/no-img-element -- small static sprite */
import Image from "next/image";
import { TrendingUp, TrendingDown, PartyPopper } from "lucide-react";
import { toggleQuest } from "@/lib/actions";
import { PRIMARY_BUTTON_CLASS } from "@/lib/theme";
import type { Quest } from "@/lib/types";

const RING = 136;
const STROKE = 7;
const R = (RING - STROKE) / 2;
const C = 2 * Math.PI * R;

function ratingFor(score: number): { label: string; className: string } {
  if (score >= 85) return { label: "Legendary day", className: "text-green" };
  if (score >= 65) return { label: "Great progress", className: "text-gold" };
  if (score >= 40) return { label: "Building momentum", className: "text-orange" };
  return { label: "Getting started", className: "text-text-dim" };
}

export function QuestScoreHero({
  score,
  trend,
  mainQuest,
  allDone,
}: {
  score: number;
  trend: number | null;
  mainQuest: Quest | null;
  allDone: boolean;
}) {
  const rating = ratingFor(score);

  return (
    <section className="frame flex flex-col md:flex-row">
      <div className="relative min-h-[210px] flex-1 overflow-hidden rounded-[4px]">
        <Image src="/illustrations/quest-hero.jpg" alt="" fill sizes="(min-width: 768px) 60vw, 100vw" className="object-cover opacity-60" priority />
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/60 to-black/10" />

        <div className="relative flex h-full items-center gap-6 p-4 md:p-5">
          {/* Painted steel orb with a gold progress arc around it. */}
          <div className="relative shrink-0" style={{ width: RING, height: RING }}>
            <img src="/ui/orb-empty.webp" alt="" className="absolute inset-[9px] h-[calc(100%-18px)] w-[calc(100%-18px)]" />
            <svg width={RING} height={RING} className="absolute inset-0 -rotate-90" aria-hidden>
              <circle cx={RING / 2} cy={RING / 2} r={R} fill="none" stroke="rgb(0 0 0 / 0.6)" strokeWidth={STROKE} />
              <circle
                cx={RING / 2}
                cy={RING / 2}
                r={R}
                fill="none"
                stroke="rgb(var(--gold))"
                strokeWidth={STROKE - 2}
                strokeLinecap="butt"
                strokeDasharray={C}
                strokeDashoffset={C * (1 - score / 100)}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="engraved font-display text-[36px] font-bold leading-none">{score}</span>
              <span className="mt-1 font-display text-[11px] text-text-faint">of 100</span>
            </div>
          </div>

          <div className="min-w-0">
            <div className="engraved font-display text-[13px] font-bold uppercase tracking-[0.18em] text-gold">Quest Score</div>
            <div className={`engraved mt-1.5 font-display text-[22px] font-bold ${rating.className}`}>{rating.label}</div>
            <p className="mt-1 text-[14px] text-text-dim">Share of today&apos;s quest XP you&apos;ve earned.</p>
            {trend !== null && (
              <div className={`mt-2.5 inline-flex items-center gap-1.5 text-[14px] font-medium ${trend >= 0 ? "text-green" : "text-orange"}`}>
                {trend >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                {trend >= 0 ? "+" : ""}
                {trend} points vs yesterday
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex w-full flex-col border-t border-gold/25 pt-4 md:w-[270px] md:border-l md:border-t-0 md:pl-5 md:pt-1">
        <span className="engraved font-display text-[13px] font-bold uppercase tracking-[0.18em] text-gold">Today&apos;s Focus</span>
        {mainQuest ? (
          <>
            <div className="mt-3 flex-1">
              <div className="font-display text-[17px] font-bold leading-snug">{mainQuest.label}</div>
              <div className="mt-1.5 text-[14px] text-text-dim">
                {mainQuest.time && <span>{mainQuest.time} · </span>}
                <span className="font-display font-semibold text-gold">+{mainQuest.xp} XP</span>
              </div>
            </div>
            <form action={toggleQuest.bind(null, mainQuest.id, true)} className="mt-4">
              <button type="submit" className={`${PRIMARY_BUTTON_CLASS} w-full py-1.5 text-[14px]`}>
                Complete quest
              </button>
            </form>
          </>
        ) : allDone ? (
          <div className="mt-3 flex flex-1 flex-col items-center justify-center text-center">
            <PartyPopper size={24} className="mb-2 text-gold" />
            <p className="font-display text-[15px] font-bold">All quests complete</p>
            <p className="mt-1 text-[13px] text-text-faint">Come back tomorrow for more.</p>
          </div>
        ) : (
          <div className="mt-3 flex flex-1 items-center">
            <p className="text-[14px] text-text-faint">No quests logged yet. Add one below to start the day.</p>
          </div>
        )}
      </div>
    </section>
  );
}
