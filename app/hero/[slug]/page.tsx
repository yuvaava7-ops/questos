import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { getPublicHero } from "@/lib/game-data";
import { STAT_KEYS, STATS } from "@/lib/stats";
import { ACCENT } from "@/components/pixel/accent";
import { AccentGem } from "@/components/pixel/AccentGem";
import { heroFrames } from "@/components/pixel/heroSprites";
import { SegBar } from "@/components/pixel/SegBar";
import { Sprite } from "@/components/pixel/Sprite";
import { Window } from "@/components/pixel/Window";
import { FLAME } from "@/components/pixel/sprites";
import type { Accent } from "@/lib/types";

// Public, read-only hero card. Data is read with the service key but only the
// fields the owner opted in to share are selected into PublicHero.
export const dynamic = "force-dynamic";

const SLUG = /^[a-z0-9][a-z0-9-]{2,23}$/i;

async function load(slug: string) {
  if (!SLUG.test(slug)) return null;
  const db = createAdminClient();
  if (!db) return null;
  return getPublicHero(db, slug);
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const hero = await load(params.slug);
  if (!hero) return { title: "Hero not found" };
  return {
    title: `${hero.name}, level ${hero.level} ${hero.className} | QuestOS`,
    description: `${hero.name} is a level ${hero.level} ${hero.className} on QuestOS.`,
  };
}

const TEXT: Record<string, string> = { ruby: "text-ruby", sky: "text-sky", leaf: "text-leaf", grape: "text-grape", gold: "text-gold" };

export default async function HeroPage({ params }: { params: { slug: string } }) {
  const hero = await load(params.slug);
  if (!hero) notFound();
  const frames = heroFrames(hero.primary, hero.avatar);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[560px] flex-col px-4 pb-16 pt-8">
      <Link href="/" className="logo-shine px-title mb-8 block text-center text-[20px]">
        QUESTOS
      </Link>

      <Window className="mt-2" bodyClassName="p-5">
        <div className="flex items-center gap-4">
          <div className="shrink-0 bg-ink p-2 shadow-[0_-3px_0_0_#ffd24a,0_3px_0_0_#ffd24a,-3px_0_0_0_#ffd24a,3px_0_0_0_#ffd24a]">
            <Sprite def={frames.a} scale={7} title={`${hero.name}'s avatar`} />
          </div>
          <div className="min-w-0">
            <h1 className="px-title break-words text-[16px] leading-snug">{hero.name}</h1>
            <p className="mt-2 text-[26px] uppercase leading-none text-gold">
              LV {hero.level} {hero.className}
            </p>
            <p className="mt-1 text-[22px] uppercase leading-none text-dim">{hero.title ?? hero.levelTitle}</p>
            <p className="mt-2 flex items-center gap-1 text-[24px] leading-none text-ember">
              <Sprite def={FLAME} scale={2} /> {hero.streakDays} day streak
            </p>
          </div>
        </div>
        <p className="mt-4 text-[23px] leading-tight text-dim">{hero.classBlurb}</p>
      </Window>

      <Window title="Stats" className="mt-8">
        <ul className="flex flex-col gap-3">
          {STAT_KEYS.map((k) => {
            const s = hero.stats[k];
            return (
              <li key={k}>
                <div className="mb-1 flex items-baseline justify-between text-[24px] leading-none">
                  <span className={`px-title text-[11px] ${TEXT[STATS[k].color]}`}>{STATS[k].abbr}</span>
                  <span className="text-dim">{STATS[k].name}</span>
                  <span className="text-paper">{s.level}</span>
                </div>
                <SegBar fraction={s.fraction} color={STATS[k].color} segments={16} label={`${STATS[k].name} progress`} />
              </li>
            );
          })}
        </ul>
      </Window>

      {hero.trees.length > 0 && (
        <Window title="Skill trees" className="mt-8">
          <ul className="flex flex-col gap-4">
            {hero.trees.map((t) => {
              const a = ACCENT[t.color as Accent] ?? ACCENT.blue;
              return (
                <li key={t.name}>
                  <div className="mb-1.5 flex items-center gap-3">
                    <AccentGem accent={(t.color as Accent) in ACCENT ? (t.color as Accent) : "blue"} scale={3} />
                    <span className="min-w-0 flex-1 truncate text-[26px] uppercase leading-none text-paper">{t.name}</span>
                    <span className={`px-title text-[10px] ${a.text}`}>{t.percent}%</span>
                  </div>
                  <SegBar fraction={t.percent / 100} color={a.bar} label={`${t.name} progress`} />
                  <p className="mt-1 text-[20px] leading-none text-faint">
                    {t.complete}/{t.nodes} perks
                  </p>
                </li>
              );
            })}
          </ul>
        </Window>
      )}

      <p className="mt-8 text-center text-[23px] text-dim">
        {hero.achievements} of {hero.achievementsTotal} trophies earned
      </p>

      <div className="mt-8 text-center">
        <Link href="/signup" className="px-btn inline-block">
          Start your own quest
        </Link>
      </div>
    </main>
  );
}
