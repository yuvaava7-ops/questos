import Image from "next/image";
import { TrendingUp, TrendingDown, PartyPopper, Swords } from "lucide-react";
import { adaptSize } from "@/icons/game/adapt-size";
import CompassSvg from "@/icons/game/lorc/compass.svg";
import { toggleQuest } from "@/lib/actions";
import { PRIMARY_BUTTON_CLASS } from "@/lib/theme";
import type { Quest } from "@/lib/types";

const Compass = adaptSize(CompassSvg);

const RING = 132;
const STROKE = 10;
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
    <section className="surface relative flex animate-fade-up flex-col overflow-hidden md:flex-row">
      <div className="relative min-h-[230px] flex-1 p-5 md:p-7">
        <Image
          src="/illustrations/quest-hero.jpg"
          alt=""
          fill
          sizes="(min-width: 768px) 60vw, 100vw"
          className="object-cover opacity-50 saturate-50"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-panel via-panel/85 to-panel/30" />
        <div className="absolute inset-0 bg-[radial-gradient(400px_220px_at_20%_60%,rgb(var(--gold)/0.14),transparent)]" />

        <div className="relative flex h-full items-center gap-6">
          <div className="relative shrink-0" style={{ width: RING, height: RING }}>
            <svg width={RING} height={RING} className="-rotate-90" aria-hidden>
              <defs>
                <linearGradient id="score-ring" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="rgb(var(--gold-bright))" />
                  <stop offset="100%" stopColor="rgb(var(--gold))" />
                </linearGradient>
              </defs>
              <circle cx={RING / 2} cy={RING / 2} r={R} fill="none" stroke="rgb(255 255 255 / 0.07)" strokeWidth={STROKE} />
              <circle
                cx={RING / 2}
                cy={RING / 2}
                r={R}
                fill="none"
                stroke="url(#score-ring)"
                strokeWidth={STROKE}
                strokeLinecap="round"
                strokeDasharray={C}
                strokeDashoffset={C * (1 - score / 100)}
                style={{ filter: "drop-shadow(0 0 6px rgb(var(--gold) / 0.6))" }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-[38px] font-bold leading-none tracking-tight text-text">{score}</span>
              <span className="mt-0.5 font-mono text-[10.5px] text-text-faint">/ 100</span>
            </div>
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <Compass size={15} className="text-gold drop-shadow-[0_0_6px_rgb(var(--gold)/0.7)]" />
              <span className="font-display text-[12px] font-semibold uppercase tracking-[0.16em] text-gold">Quest Score</span>
            </div>
            <div className={`mt-2 text-[20px] font-semibold ${rating.className}`}>{rating.label}</div>
            <p className="mt-1 text-[12.5px] text-text-faint">Share of today&apos;s quest XP you&apos;ve earned.</p>
            {trend !== null && (
              <div
                className={`mt-3 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[12px] font-medium ${
                  trend >= 0 ? "bg-green-dim text-green" : "bg-orange-dim text-orange"
                }`}
              >
                {trend >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                {trend >= 0 ? "+" : ""}
                {trend} pts vs yesterday
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="relative flex w-full flex-col overflow-hidden border-t border-border/60 bg-panel2/40 p-5 md:w-[290px] md:border-l md:border-t-0 md:p-6">
        <div className="pointer-events-none absolute -right-6 -top-10 h-[220px] w-[110px] opacity-20">
          <Image src="/illustrations/banner.webp" alt="" fill sizes="110px" className="object-contain object-top" />
        </div>
        <div className="relative z-10 flex flex-1 flex-col">
          <span className="font-display text-[12px] font-semibold uppercase tracking-[0.16em] text-gold">Today&apos;s Focus</span>
          {mainQuest ? (
            <>
              <div className="mt-3 flex-1">
                <div className="text-[16px] font-semibold leading-snug text-text">{mainQuest.label}</div>
                <div className="mt-2 flex items-center gap-2 text-[12px] text-text-faint">
                  {mainQuest.time && <span>{mainQuest.time}</span>}
                  <span className="rounded-full bg-gold/10 px-2 py-0.5 font-mono text-[11px] text-gold">+{mainQuest.xp} XP</span>
                </div>
              </div>
              <form action={toggleQuest.bind(null, mainQuest.id, true)} className="mt-5">
                <button type="submit" className={`${PRIMARY_BUTTON_CLASS} flex w-full items-center justify-center gap-2 py-2.5 text-[13px]`}>
                  <Swords size={15} />
                  Complete quest
                </button>
              </form>
            </>
          ) : allDone ? (
            <div className="mt-3 flex flex-1 flex-col items-center justify-center text-center">
              <PartyPopper size={24} className="mb-2 text-gold drop-shadow-[0_0_8px_rgb(var(--gold)/0.7)]" />
              <p className="text-[13.5px] font-semibold text-text">All quests complete</p>
              <p className="mt-1 text-[12px] text-text-faint">Come back tomorrow for more.</p>
            </div>
          ) : (
            <div className="mt-3 flex flex-1 items-center">
              <p className="text-[13px] text-text-faint">No quests logged yet. Add one below to start the day.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
