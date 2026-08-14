import Link from "next/link";
import { Flame, TreeDeciduous, BarChart3 } from "lucide-react";
import { Header } from "@/components/marketing/Header";

export default function HomePage() {
  return (
    <div className="flex w-full flex-1 flex-col">
      <Header />

      <section className="border-b border-border px-6 pb-16 pt-14 text-center md:pt-20">
        <h1 className="mx-auto max-w-[720px] font-display text-[32px] font-semibold leading-tight tracking-wide md:text-[42px]">
          Turn your daily life into an RPG.
        </h1>
        <p className="mx-auto mt-4 max-w-[520px] text-[15px] text-text-dim">
          Log quests, earn XP, and level up skill trees for fitness, coding, and creative work — one dashboard for
          the game you&apos;re actually playing.
        </p>
        <div className="mt-7 flex items-center justify-center gap-3">
          <Link
            href="/signup"
            className="rounded-[8px] bg-gold px-5 py-3 text-[14px] font-semibold text-bg transition-opacity hover:opacity-90"
          >
            Start your first quest
          </Link>
          <Link
            href="/login"
            className="rounded-[8px] border border-border bg-panel2 px-5 py-3 text-[14px] font-semibold text-text-dim"
          >
            Log in
          </Link>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-[1000px] gap-4 px-6 py-16 md:grid-cols-3">
        <div className="rounded-card border border-border bg-panel p-6">
          <Flame className="mb-3 text-orange" size={20} strokeWidth={1.75} />
          <h3 className="mb-1.5 font-display text-[14px] font-semibold tracking-wide">Quests & XP</h3>
          <p className="text-[13px] leading-relaxed text-text-dim">
            Log what you actually did today. Every quest completed earns XP toward your next level.
          </p>
        </div>
        <div className="rounded-card border border-border bg-panel p-6">
          <TreeDeciduous className="mb-3 text-green" size={20} strokeWidth={1.75} />
          <h3 className="mb-1.5 font-display text-[14px] font-semibold tracking-wide">Skill trees</h3>
          <p className="text-[13px] leading-relaxed text-text-dim">
            Skyrim-style trees for Fitness, Coding, and Creative work — unlock perks as you build streaks.
          </p>
        </div>
        <div className="rounded-card border border-border bg-panel p-6">
          <BarChart3 className="mb-3 text-blue" size={20} strokeWidth={1.75} />
          <h3 className="mb-1.5 font-display text-[14px] font-semibold tracking-wide">Activity heatmap</h3>
          <p className="text-[13px] leading-relaxed text-text-dim">
            A GitHub-style contribution grid of your streaks — see your consistency at a glance.
          </p>
        </div>
      </section>

      <section className="border-t border-border px-6 py-14 text-center">
        <h2 className="font-display text-[20px] font-semibold tracking-wide">Ready to start your streak?</h2>
        <p className="mx-auto mt-2 max-w-[420px] text-[13.5px] text-text-dim">
          Free to use, single sign-up, your data stays yours.
        </p>
        <Link
          href="/signup"
          className="mt-5 inline-block rounded-[8px] bg-gold px-5 py-3 text-[14px] font-semibold text-bg transition-opacity hover:opacity-90"
        >
          Create your account
        </Link>
      </section>
    </div>
  );
}
