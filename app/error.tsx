"use client";

import { useTransition } from "react";
import { TriangleAlert } from "lucide-react";
import { signOutAction } from "@/lib/auth-actions";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const [isPending, startTransition] = useTransition();

  // In production, Next.js redacts the real Server Component error message
  // down to a generic "An error occurred..." string — show our own
  // explanation instead of that boilerplate, keeping the digest for reference.
  const isRedacted = !error.message || error.message.includes("Server Components render");
  const message = isRedacted
    ? "Something went wrong talking to Supabase. Check that supabase/schema.sql has been run against your project, and that your URL/key and RLS policies are correct."
    : error.message;

  return (
    <main className="flex min-h-screen flex-1 items-center justify-center px-6">
      <div className="max-w-md rounded-card border border-border bg-panel p-7 text-center">
        <TriangleAlert size={28} className="mx-auto mb-3 text-orange" />
        <h1 className="mb-2 text-lg font-bold">Couldn&apos;t load your data</h1>
        <p className="mb-4 text-[13px] leading-relaxed text-text-dim">
          {message}
          {error.digest && (
            <span className="mt-1.5 block font-mono text-[10.5px] text-text-faint">Ref: {error.digest}</span>
          )}
        </p>
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={reset}
            className="rounded-[10px] border border-border bg-panel2 px-4 py-2 text-[13px] font-medium text-text"
          >
            Try again
          </button>
          <button
            onClick={() => startTransition(() => signOutAction())}
            disabled={isPending}
            className="rounded-[10px] px-4 py-2 text-[13px] font-medium text-text-dim transition-colors hover:text-text disabled:opacity-60"
          >
            {isPending ? "Signing out..." : "Sign out"}
          </button>
        </div>
      </div>
    </main>
  );
}
