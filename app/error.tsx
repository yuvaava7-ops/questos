"use client";

import { TriangleAlert } from "lucide-react";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <main className="flex min-h-screen flex-1 items-center justify-center px-6">
      <div className="max-w-md rounded-card border border-border bg-panel p-7 text-center">
        <TriangleAlert size={28} className="mx-auto mb-3 text-orange" />
        <h1 className="mb-2 text-lg font-bold">Couldn&apos;t load your data</h1>
        <p className="mb-4 text-[13px] leading-relaxed text-text-dim">
          {error.message || "Something went wrong talking to Supabase. Check your project URL/key and RLS policies."}
        </p>
        <button
          onClick={reset}
          className="rounded-[10px] border border-border bg-panel2 px-4 py-2 text-[13px] font-medium text-text"
        >
          Try again
        </button>
      </div>
    </main>
  );
}
