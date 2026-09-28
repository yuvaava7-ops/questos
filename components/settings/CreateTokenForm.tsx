"use client";

import { useState, useTransition } from "react";
import { Copy, Check, KeyRound } from "lucide-react";
import { createApiToken } from "@/lib/token-actions";
import { INPUT_CLASS, PRIMARY_BUTTON_CLASS } from "@/lib/theme";

export function CreateTokenForm({ endpoint }: { endpoint: string }) {
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function copy(text: string, id: string) {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(id);
      setTimeout(() => setCopied(null), 1500);
    });
  }

  const command = token ? `claude mcp add --transport http questos ${endpoint} --header "Authorization: Bearer ${token}"` : "";

  return (
    <div>
      <form
        action={(formData) => {
          setError(null);
          startTransition(async () => {
            const result = await createApiToken(formData);
            if (result.error) setError(result.error);
            else setToken(result.token ?? null);
          });
        }}
        className="flex flex-wrap items-center gap-2"
      >
        <input name="name" placeholder="Token name, e.g. Claude Code laptop" maxLength={60} aria-label="Token name" className={`${INPUT_CLASS} min-w-0 flex-1`} />
        <button type="submit" disabled={isPending} className={`${PRIMARY_BUTTON_CLASS} flex items-center gap-1.5 px-3.5 py-2 text-[13px]`}>
          <KeyRound size={14} />
          {isPending ? "Creating..." : "Create token"}
        </button>
      </form>
      {error && (
        <p role="alert" className="mt-2 text-[12.5px] text-red">
          {error}
        </p>
      )}

      {token && (
        <div className="mt-4 rounded-[10px] border border-gold/40 bg-gold-dim/40 p-4">
          <p className="mb-2 text-[12.5px] font-medium text-gold">Copy this token now. It won&apos;t be shown again.</p>
          <CopyRow text={token} copied={copied === "token"} onCopy={() => copy(token, "token")} />
          <p className="mb-2 mt-4 text-[12.5px] text-text-dim">Claude Code: run this in your terminal.</p>
          <CopyRow text={command} copied={copied === "cmd"} onCopy={() => copy(command, "cmd")} />
        </div>
      )}
    </div>
  );
}

function CopyRow({ text, copied, onCopy }: { text: string; copied: boolean; onCopy: () => void }) {
  return (
    <div className="flex items-start gap-2">
      <code className="min-w-0 flex-1 break-all rounded-[8px] bg-bg/70 px-3 py-2 font-mono text-[11.5px] text-text">{text}</code>
      <button type="button" onClick={onCopy} aria-label="Copy" className="rounded-[8px] p-2 text-text-faint hover:text-text">
        {copied ? <Check size={14} className="text-green" /> : <Copy size={14} />}
      </button>
    </div>
  );
}
