import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";
import { Panel } from "@/components/Panel";
import { CreateTokenForm } from "@/components/settings/CreateTokenForm";
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
      <header className="mb-7">
        <h1 className="font-display text-[22px] font-semibold tracking-wide md:text-[26px]">Settings</h1>
      </header>

      <div className="flex max-w-3xl flex-col gap-4">
        <Panel title="Connect Claude (MCP)">
          <div className="flex flex-col gap-3 text-[13px] leading-relaxed text-text-dim">
            <p>
              QuestOS is an MCP server. Connected to Claude, it can read your progress, generate skill trees, plan quests for
              skills that are available or rusty, and log activity you tell it about.
            </p>
            {!mcpConfigured && (
              <p className="rounded-[8px] border border-orange/40 bg-orange-dim/50 px-3 py-2 text-orange">
                The server is missing <code>SUPABASE_SERVICE_ROLE_KEY</code>, so the MCP endpoint is disabled. Add it to the
                environment (never expose it to the browser) and restart.
              </p>
            )}
            <div>
              <div className="mb-1 text-[12px] text-text-faint">Endpoint</div>
              <code className="block break-all rounded-[8px] bg-bg/70 px-3 py-2 font-mono text-[12px] text-text">{endpoint}</code>
            </div>
            <p className="text-[12.5px] text-text-faint">
              Create a token below and send it as <code>Authorization: Bearer &lt;token&gt;</code>. Claude Code gets a ready-made
              command. Clients that only support OAuth connectors can&apos;t use token auth yet.
            </p>
            <CreateTokenForm endpoint={endpoint} />
          </div>
        </Panel>

        <Panel title="Active tokens">
          {tokens.length === 0 ? (
            <p className="text-[13px] text-text-faint">No tokens yet.</p>
          ) : (
            <ul className="divide-y divide-border/40">
              {tokens.map((t) => (
                <li key={t.id} className="flex items-center justify-between gap-3 py-2.5 text-[13px]">
                  <div className="min-w-0">
                    <div className="truncate font-medium text-text">{t.name}</div>
                    <div className="text-[11.5px] text-text-faint">
                      Created {formatDate(t.created_at)} · Last used {formatDate(t.last_used_at)}
                    </div>
                  </div>
                  <RevokeTokenButton id={t.id} name={t.name} />
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </>
  );
}
