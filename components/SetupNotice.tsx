import { DatabaseZap } from "lucide-react";

export function SetupNotice() {
  return (
    <main className="flex min-h-screen flex-1 items-center justify-center px-6">
      <div className="max-w-md rounded-card border border-border bg-panel p-7 text-center">
        <DatabaseZap size={28} className="mx-auto mb-3 text-blue" />
        <h1 className="mb-2 text-lg font-bold">Connect Supabase</h1>
        <p className="text-[13px] leading-relaxed text-text-dim">
          Create a Supabase project, run <code className="rounded bg-panel2 px-1.5 py-0.5 text-text">supabase/schema.sql</code> in
          its SQL editor, then set <code className="rounded bg-panel2 px-1.5 py-0.5 text-text">NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
          <code className="rounded bg-panel2 px-1.5 py-0.5 text-text">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> in{" "}
          <code className="rounded bg-panel2 px-1.5 py-0.5 text-text">.env.local</code>, then restart the dev server.
        </p>
      </div>
    </main>
  );
}
