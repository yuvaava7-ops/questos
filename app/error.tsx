"use client";

import { useTransition } from "react";
import { signOutAction } from "@/lib/auth-actions";
import { Sprite } from "@/components/pixel/Sprite";
import { Window } from "@/components/pixel/Window";
import { HEART } from "@/components/pixel/sprites";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const [isPending, startTransition] = useTransition();

  // In production, Next.js redacts the real Server Component error message
  // down to a generic "An error occurred..." string — show our own
  // explanation instead of that boilerplate, keeping the digest for reference.
  const isRedacted = !error.message || error.message.includes("Server Components render");
  const message = isRedacted
    ? "The save server didn't answer. Check that supabase/schema.sql has been run, and that your URL, key and RLS policies are correct."
    : error.message;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[480px] items-center px-4">
      <Window title="Game over?" className="w-full" bodyClassName="p-5 pt-6 text-center">
        <div className="mb-3 flex justify-center opacity-70 grayscale">
          <Sprite def={HEART} scale={6} />
        </div>
        <p className="text-[24px] leading-tight text-paper">{message}</p>
        {error.digest && <p className="mt-2 text-[18px] text-faint">Ref: {error.digest}</p>}
        <div className="mt-5 flex justify-center gap-4">
          <button onClick={reset} className="px-btn">
            Retry
          </button>
          <button
            onClick={() => startTransition(() => signOutAction())}
            disabled={isPending}
            className="px-btn px-btn-ghost"
          >
            {isPending ? "..." : "Exit"}
          </button>
        </div>
      </Window>
    </main>
  );
}
