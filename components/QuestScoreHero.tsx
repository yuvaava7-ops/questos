import Image from "next/image";
import { TrendingUp, TrendingDown, PartyPopper } from "lucide-react";
import { adaptSize } from "@/icons/game/adapt-size";
import CompassSvg from "@/icons/game/lorc/compass.svg";
import { toggleQuest } from "@/lib/actions";
import type { Quest } from "@/lib/types";

const Compass = adaptSize(CompassSvg);

function ratingFor(score: number): { label: string; className: string } {
  if (score >= 85) return { label: "Excellent", className: "text-green" };
  if (score >= 65) return { label: "Great", className: "text-gold" };
  if (score >= 40) return { label: "Good", className: "text-orange" };
  return { label: "Getting Started", className: "text-text-dim" };
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
    <div className="flex flex-col overflow-hidden rounded-card border border-border/60 bg-panel md:flex-row">
      <div className="relative min-h-[220px] flex-1 p-6">
        <Image src="/illustrations/quest-hero.jpg" alt="" fill className="object-cover" priority />
        <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/70 to-bg/20" />
        <div className="relative flex h-full flex-col justify-between">
          <div className="relative flex items-center gap-2">
            <div className="absolute -left-2 -top-2 h-8 w-8 rounded-full bg-gold/30 blur-lg" aria-hidden />
            <Compass size={16} className="relative text-gold drop-shadow-[0_0_6px_rgba(200,161,92,0.7)]" />
            <span className="relative font-display text-[12px] font-semibold uppercase tracking-[0.14em] text-gold">
              Quest Score
            </span>
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-[44px] font-semibold leading-none tracking-tight text-text drop-shadow-[0_0_20px_rgba(200,161,92,0.35)]">
                {score}
              </span>
              <span className="text-[15px] text-text-faint">/100</span>
            </div>
            <div className={`mt-1.5 text-[13px] font-semibold ${rating.className}`}>{rating.label}</div>
            {trend !== null && (
              <div
                className={`mt-1 flex items-center gap-1 text-[12px] ${trend >= 0 ? "text-green" : "text-orange"}`}
              >
                {trend >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                {trend >= 0 ? "+" : ""}
                {trend} pts from yesterday
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="relative flex w-full flex-col justify-between overflow-hidden border-t border-border/60 p-6 md:w-[280px] md:border-l md:border-t-0">
        <div className="pointer-events-none absolute -right-6 -top-10 h-[220px] w-[110px] opacity-25">
          <Image src="/illustrations/banner.webp" alt="" fill className="object-contain object-top" />
        </div>
        <div className="relative z-10 flex flex-1 flex-col justify-between">
          <span className="font-display text-[12px] font-semibold uppercase tracking-[0.14em] text-gold">
            Today&apos;s Focus
          </span>
          {mainQuest ? (
            <>
              <div className="mt-3">
                <div className="text-[15px] font-semibold text-text">{mainQuest.label}</div>
                {mainQuest.time && <div className="mt-1 text-[12px] text-text-faint">{mainQuest.time}</div>}
              </div>
              <div className="mt-4">
                <div className="mb-2 font-mono text-[12px] text-text-faint">+{mainQuest.xp} XP</div>
                <form action={toggleQuest.bind(null, mainQuest.id, true)}>
                  <button
                    type="submit"
                    className="flex w-full items-center justify-center gap-1.5 rounded-[8px] bg-gold py-2.5 text-[13px] font-semibold text-bg transition-opacity hover:opacity-90"
                  >
                    Mark Complete
                  </button>
                </form>
              </div>
            </>
          ) : allDone ? (
            <div className="mt-3 flex flex-1 flex-col items-center justify-center text-center">
              <PartyPopper size={22} className="mb-2 text-gold" />
              <p className="text-[13px] font-medium text-text">All quests complete</p>
              <p className="mt-1 text-[12px] text-text-faint">Come back tomorrow for more.</p>
            </div>
          ) : (
            <div className="mt-3 flex flex-1 items-center">
              <p className="text-[13px] text-text-faint">No quests logged yet — add one below.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
