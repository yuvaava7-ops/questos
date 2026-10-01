import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";
import { Window } from "@/components/pixel/Window";
import { ConnectAi } from "@/components/settings/ConnectAi";
import { InstallApp } from "@/components/pwa/InstallApp";
import { RevokeTokenButton } from "@/components/settings/RevokeTokenButton";

function formatDate(iso: string | null): string {
  return iso ? new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "Never";
}

export default async function SettingsPage() {
  const user = await requireUser();
  const { data: tokens, error } = await createClient()
    .from("api_tokens")
    .select("id, name, created_at, last_used_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });
  if (error) throw error;

  const h = headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const endpoint = `${proto}://${host}/api/mcp`;
  const mcpConfigured = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);

  return (
    <>
      <h1 className="px-title mb-2 mt-6 text-[16px] text-gold">Camp</h1>

      <Window title="Download" className="mt-7">
        <InstallApp />
      </Window>

      <Window title="Connect an AI" className="mt-7">
        <p className="mb-4 text-[23px] leading-tight text-dim">
          Link QuestOS to Claude or ChatGPT. They can read your progress, build skill trees, plan quests and log what you did.
        </p>
        {!mcpConfigured && (
          <p className="mb-4 bg-ink p-3 text-[22px] leading-tight text-ember">
            The server is missing SUPABASE_SERVICE_ROLE_KEY, so the connection is disabled. Add it in your host&apos;s environment
            settings (server-only, never NEXT_PUBLIC_) and redeploy.
          </p>
        )}
        <ConnectAi endpoint={endpoint} />
      </Window>

      <Window title="Active keys" className="mt-7">
        {tokens.length === 0 ? (
          <p className="text-[24px] text-dim">No keys yet.</p>
        ) : (
          <ul className="flex flex-col">
            {tokens.map((t) => (
              <li key={t.id} className="flex items-center justify-between gap-3 border-b-2 border-dusk/70 py-2.5 last:border-b-0">
                <div className="min-w-0">
                  <div className="truncate text-[26px] leading-none text-paper">{t.name}</div>
                  <div className="mt-1 text-[19px] leading-none text-faint">
                    Created {formatDate(t.created_at)} · Last used {formatDate(t.last_used_at)}
                  </div>
                </div>
                <RevokeTokenButton id={t.id} name={t.name} />
              </li>
            ))}
          </ul>
        )}
      </Window>
    </>
  );
}
