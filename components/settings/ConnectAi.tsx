"use client";

import { useState, useTransition } from "react";
import { createApiToken } from "@/lib/token-actions";
import { sfx } from "@/lib/sfx";

type Provider = "claude" | "chatgpt";

const PROVIDERS: Record<
  Provider,
  { label: string; settingsUrl: string; settingsLabel: string; steps: string[] }
> = {
  claude: {
    label: "Claude",
    settingsUrl: "https://claude.ai/settings/connectors",
    settingsLabel: "Open Claude connectors",
    steps: ["Tap Add custom connector.", "Name it QuestOS and paste the link.", "Save, then enable QuestOS in a chat."],
  },
  chatgpt: {
    label: "ChatGPT",
    settingsUrl: "https://chatgpt.com/#settings/Connectors",
    settingsLabel: "Open ChatGPT connectors",
    steps: [
      "Settings > Connectors > Advanced: turn on Developer mode.",
      "Create a connector, name it QuestOS, paste the link.",
      "Set authentication to None, then create it.",
    ],
  },
};

// One tap: mint a token, build the connector link, copy it, and send the user
// to the right settings page. The link embeds the token, so it is a password.
export function ConnectAi({ endpoint }: { endpoint: string }) {
  const [active, setActive] = useState<Provider | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function copy(text: string, id: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(id);
      window.setTimeout(() => setCopied(null), 1500);
    } catch {
      setError("Couldn't copy automatically. Select the link and copy it by hand.");
    }
  }

  function connect(provider: Provider) {
    sfx.tap();
    setError(null);
    setToken(null);
    setActive(provider);
    const formData = new FormData();
    formData.set("name", PROVIDERS[provider].label);
    startTransition(async () => {
      const result = await createApiToken(formData);
      if (result.error || !result.token) {
        setError(result.error ?? "Couldn't create a token.");
        setActive(null);
        return;
      }
      setToken(result.token);
      void copy(`${endpoint}/${result.token}`, "link");
    });
  }

  const link = token ? `${endpoint}/${token}` : "";
  const command = token ? `claude mcp add --transport http questos ${endpoint} --header "Authorization: Bearer ${token}"` : "";
  const provider = active ? PROVIDERS[active] : null;

  return (
    <div>
      <div className="grid grid-cols-2 gap-3">
        <button type="button" className="px-btn" disabled={isPending} onClick={() => connect("claude")}>
          Connect Claude
        </button>
        <button type="button" className="px-btn px-btn-ghost" disabled={isPending} onClick={() => connect("chatgpt")}>
          Connect ChatGPT
        </button>
      </div>

      {isPending && <p className="mt-3 text-[22px] text-dim">Forging your key...</p>}
      {error && (
        <p role="alert" className="mt-3 text-[22px] leading-tight text-ruby">
          ! {error}
        </p>
      )}

      {token && provider && (
        <div className="mt-5 bg-ink p-3 shadow-[0_-3px_0_0_#ffd24a,0_3px_0_0_#ffd24a,-3px_0_0_0_#ffd24a,3px_0_0_0_#ffd24a]">
          <p className="px-title text-[10px] leading-relaxed text-gold">{provider.label} link ready</p>
          <p className="mt-2 text-[22px] leading-tight text-paper">
            {copied === "link" ? "Copied to your clipboard." : "Copy the link:"} It is shown once. Treat it like a password.
          </p>
          <code className="mt-2 block break-all bg-night p-2 text-[20px] leading-tight text-sky">{link}</code>
          <div className="mt-3 flex gap-3">
            <button type="button" className="px-btn !px-3 !py-2.5 !text-[9px]" onClick={() => copy(link, "link")}>
              {copied === "link" ? "Copied" : "Copy link"}
            </button>
            <a href={provider.settingsUrl} target="_blank" rel="noopener noreferrer" className="px-btn px-btn-ghost !px-3 !py-2.5 !text-[9px]">
              {provider.settingsLabel}
            </a>
          </div>
          <ol className="mt-4 flex list-decimal flex-col gap-1 pl-6 text-[22px] leading-tight text-dim">
            {provider.steps.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ol>

          <details className="mt-4 text-[22px] text-dim">
            <summary className="cursor-pointer text-faint">Using Claude Code instead?</summary>
            <code className="mt-2 block break-all bg-night p-2 text-[18px] leading-tight text-sky">{command}</code>
            <button type="button" className="px-btn px-btn-ghost mt-2 !px-3 !py-2.5 !text-[9px]" onClick={() => copy(command, "cmd")}>
              {copied === "cmd" ? "Copied" : "Copy command"}
            </button>
          </details>
        </div>
      )}
    </div>
  );
}
