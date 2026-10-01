"use client";

import { useState, useTransition } from "react";
import { setPublicProfile } from "@/lib/game-actions";
import { sfx } from "@/lib/sfx";

// Opt-in public hero card: class, level, stats and skill progress. Never quests or tasks.
export function PublicCardForm({ initialPublic, initialSlug }: { initialPublic: boolean; initialSlug: string }) {
  const [isPublic, setIsPublic] = useState(initialPublic);
  const [slug, setSlug] = useState(initialSlug);
  const [saved, setSaved] = useState<string | null>(initialPublic && initialSlug ? initialSlug : null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <form
      action={(formData) => {
        sfx.tap();
        setError(null);
        startTransition(async () => {
          const result = await setPublicProfile(formData);
          if (result.error) setError(result.error);
          else setSaved(formData.get("is_public") === "on" ? slug.trim().toLowerCase() : null);
        });
      }}
      className="flex flex-col gap-3"
    >
      <p className="text-[23px] leading-tight text-dim">
        Share a card with your avatar, class, level, stats and skill trees. Quests, errands and everything else stay private.
      </p>

      <label className="flex items-center gap-3 text-[24px] text-paper">
        <input
          type="checkbox"
          name="is_public"
          checked={isPublic}
          onChange={(e) => setIsPublic(e.target.checked)}
          className="h-6 w-6 accent-[#ffd24a]"
        />
        Make my hero card public
      </label>

      <label className="flex flex-col gap-2 text-[22px] uppercase text-dim">
        Link name
        <input
          name="slug"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          maxLength={24}
          placeholder="youbal"
          autoComplete="off"
          className="px-input normal-case"
        />
      </label>

      {error && (
        <p role="alert" className="text-[22px] leading-tight text-ruby">
          ! {error}
        </p>
      )}
      {saved && (
        <p className="break-all text-[22px] leading-tight text-leaf">
          Live at{" "}
          <a href={`/hero/${saved}`} target="_blank" rel="noopener noreferrer" className="text-sky underline decoration-2 underline-offset-4">
            /hero/{saved}
          </a>
        </p>
      )}

      <button type="submit" disabled={isPending} className="px-btn w-full">
        {isPending ? "Saving..." : "Save"}
      </button>
    </form>
  );
}
