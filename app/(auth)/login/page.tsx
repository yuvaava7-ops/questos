import { AuthCard } from "@/components/auth/AuthCard";
import { CameraHero } from "@/components/auth/CameraHero";
import { LoginForm } from "@/components/auth/LoginForm";
import { CheckEmailNotice } from "@/components/auth/CheckEmailNotice";

export default function LoginPage({
  searchParams,
}: {
  searchParams: { message?: string; email?: string };
}) {
  return (
    <div className="grid w-full max-w-[920px] gap-5 md:grid-cols-2">
      <div className="hidden md:block">
        <CameraHero />
      </div>
      <div className="flex items-center justify-center">
        <AuthCard title="Welcome back" subtitle="Log in to pick up your streak.">
          {searchParams.message === "check-email" && <CheckEmailNotice email={searchParams.email} />}
          <LoginForm />
        </AuthCard>
      </div>
    </div>
  );
}
