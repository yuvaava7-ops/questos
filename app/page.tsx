import Link from "next/link";
import { PixelScene } from "@/components/pixel/PixelScene";
import { Sprite } from "@/components/pixel/Sprite";
import { Window } from "@/components/pixel/Window";
import { COIN, CURSOR, FLAME, STAR } from "@/components/pixel/sprites";

const STEPS = [
  { sprite: COIN, title: "Do quests", body: "Log what you actually did today and check it off." },
  { sprite: STAR, title: "Earn XP", body: "Every quest pays out. Fill the bar, level up, earn a new title." },
  { sprite: FLAME, title: "Keep the streak", body: "A heatmap of every day you showed up. Don't break the chain." },
];

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center">
      <header className="px-4 pb-5 pt-10 text-center">
        <h1 className="logo-shine px-title text-[34px] sm:text-[60px]">QUESTOS</h1>
        <p className="mt-5 text-[26px] uppercase tracking-wide text-dim sm:text-[30px]">A 16-bit RPG for your real life</p>
      </header>

      <div className="w-full max-w-[960px]">
        <PixelScene mode="title" className="shadow-[0_-4px_0_0_#0b0820,0_4px_0_0_#0b0820]" />
      </div>

      <nav aria-label="Main menu" className="w-full max-w-[360px] px-4 pt-10">
        <Window bodyClassName="p-5">
          <ul className="flex flex-col gap-5">
            <li className="flex items-center gap-3">
              <span className="anim-blink w-6 shrink-0">
                <Sprite def={CURSOR} scale={2} />
              </span>
              <Link href="/signup" className="px-btn block flex-1 text-center">
                New game
              </Link>
            </li>
            <li className="flex items-center gap-3">
              <span className="w-6 shrink-0" />
              <Link href="/login" className="px-btn px-btn-ghost block flex-1 text-center">
                Continue
              </Link>
            </li>
          </ul>
        </Window>
      </nav>

      <section aria-labelledby="how" className="mt-14 w-full max-w-[960px] px-4">
        <h2 id="how" className="px-title mb-8 text-center text-[12px] text-gold">
          How to play
        </h2>
        <div className="grid gap-8 sm:grid-cols-3">
          {STEPS.map((s, i) => (
            <Window key={s.title} bodyClassName="p-4">
              <div className="flex items-center gap-3">
                <Sprite def={s.sprite} scale={4} />
                <h3 className="px-title text-[11px]">
                  {i + 1}. {s.title}
                </h3>
              </div>
              <p className="mt-3 text-[24px] leading-tight text-dim">{s.body}</p>
            </Window>
          ))}
        </div>
      </section>

      <footer className="mt-16 pb-10 text-center text-[20px] text-faint">QuestOS &middot; your life, leveled</footer>
    </main>
  );
}
