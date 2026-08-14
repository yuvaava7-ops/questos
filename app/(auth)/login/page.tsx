import { MailCheck } from "lucide-react";
import { AuthCard } from "@/components/auth/AuthCard";
import { CameraHero } from "@/components/auth/CameraHero";
import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage({
  searchParams,
}: {
  searchParams: { message?: string };
}) {
  return (
    <div className="grid w-full max-w-[920px] gap-5 md:grid-cols-2">
      <div className="hidden md:block">
        <CameraHero />
      </div>
      <div className="flex items-center justify-center">
        <AuthCard title="Welcome back" subtitle="Log in to pick up your streak.">
          {searchParams.message === "check-email" && (
            <div className="mb-3.5 flex items-start gap-2 rounded-[8px] border border-border bg-panel2 p-3 text-[12.5px] text-text-dim">
              <MailCheck size={15} className="mt-0.5 shrink-0 text-blue" />
              Almost there — check your email for a confirmation link before signing in.
            </div>
          )}
          <LoginForm />
        </AuthCard>
      </div>
    </div>
  );
}
