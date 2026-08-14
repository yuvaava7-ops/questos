"use client";

import { useState, useTransition } from "react";
import { MailCheck } from "lucide-react";
import { resendConfirmationAction } from "@/lib/auth-actions";

export function CheckEmailNotice({ email }: { email?: string }) {
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<"idle" | "sent" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  function handleResend() {
    setError(null);
    startTransition(async () => {
      const formData = new FormData();
      formData.set("email", email ?? "");
      const result = await resendConfirmationAction(formData);
      if (result.error) {
        setError(result.error);
        setStatus("error");
      } else {
        setStatus("sent");
      }
    });
  }

  return (
    <div className="mb-3.5 rounded-[8px] border border-border bg-panel2 p-3 text-[12.5px] text-text-dim">
      <div className="flex items-start gap-2">
        <MailCheck size={15} className="mt-0.5 shrink-0 text-blue" />
        <span>Almost there — check your email for a confirmation link before signing in.</span>
      </div>
      <button
        type="button"
        onClick={handleResend}
        disabled={isPending || !email || status === "sent"}
        className="mt-2 text-[12px] font-semibold text-blue disabled:cursor-default disabled:text-text-faint"
      >
        {status === "sent" ? "Confirmation email sent" : isPending ? "Sending..." : "Resend confirmation email"}
      </button>
      {error && <p className="mt-1 text-[12px] text-[#f87171]">{error}</p>}
    </div>
  );
}
