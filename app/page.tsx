import Link from "next/link";
import { Flame, TreeDeciduous, BarChart3 } from "lucide-react";
import { Header } from "@/components/marketing/Header";
import { AnimatedHeadline } from "@/components/marketing/AnimatedHeadline";
import { PRIMARY_BUTTON_CLASS } from "@/lib/theme";

const FEATURES = [
  {
    icon: Flame,
    iconClass: "text-orange",
    title: "Quests & XP",
    body: "Log what you actually did today. Every quest completed earns XP toward your next level.",
  },
  {
    icon: TreeDeciduous,
    iconClass: "text-green",
    title: "Skill trees",
    body: "Skyrim-style trees for Fitness, Coding, and Creative work. Unlock perks as you build streaks.",
  },
  {
    icon: BarChart3,
    iconClass: "text-blue",
    title: "Activity heatmap",
    body: "A GitHub-style contribution grid of your streaks. See your consistency at a glance.",
  },
];

export default function HomePage() {
  return (
    <div className="flex w-full flex-1 flex-col">
      <Header />

      <main className="flex-1">
        <section className="border-b border-border px-4 pb-16 pt-14 text-center sm:px-6 md:pt-20">
          <AnimatedHeadline
            text="Turn your daily life into an RPG."
            className="mx-auto max-w-[720px] font-display text-[30px] font-semibold leading-tight tracking-wide sm:text-[34px] md:text-[42px]"
          />
          <p className="mx-auto mt-4 max-w-[520px] text-[15px] text-text-dim">
            Log quests, earn XP, and level up skill trees for fitness, coding, and creative work. One dashboard for the
            game you&apos;re actually playing.
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <Link href="/signup" className={`${PRIMARY_BUTTON_CLASS} px-5 py-3 text-[14px]`}>
              Start your first quest
            </Link>
            <Link
              href="/login"
              className="rounded-[8px] border border-border bg-panel2 px-5 py-3 text-[14px] font-semibold text-text-dim transition-colors hover:text-text"
            >
              Log in
            </Link>
          </div>
        </section>

        <section className="mx-auto grid w-full max-w-[1000px] gap-4 px-4 py-16 sm:px-6 md:grid-cols-3">
          {FEATURES.map(({ icon: Icon, iconClass, title, body }) => (
            <div key={title} className="rounded-card border border-border bg-panel p-6">
              <Icon className={`mb-3 ${iconClass}`} size={20} strokeWidth={1.75} aria-hidden />
              <h2 className="mb-1.5 font-display text-[14px] font-semibold tracking-wide">{title}</h2>
              <p className="text-[13px] leading-relaxed text-text-dim">{body}</p>
            </div>
          ))}
        </section>

        <section className="border-t border-border px-4 py-14 text-center sm:px-6">
          <h2 className="font-display text-[20px] font-semibold tracking-wide">Ready to start your streak?</h2>
          <p className="mx-auto mt-2 max-w-[420px] text-[13.5px] text-text-dim">
            Free to use, single sign-up, your data stays yours.
          </p>
          <Link href="/signup" className={`${PRIMARY_BUTTON_CLASS} mt-5 inline-block px-5 py-3 text-[14px]`}>
            Create your account
          </Link>
        </section>
      </main>
    </div>
  );
}
