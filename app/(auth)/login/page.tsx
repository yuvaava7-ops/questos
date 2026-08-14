import { AuthCard } from "@/components/auth/AuthCard";
import { CameraHero } from "@/components/auth/CameraHero";
import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <div className="grid w-full max-w-[920px] gap-5 md:grid-cols-2">
      <div className="hidden md:block">
        <CameraHero />
      </div>
      <div className="flex items-center justify-center">
        <AuthCard title="Welcome back" subtitle="Log in to pick up your streak.">
          <LoginForm />
        </AuthCard>
      </div>
    </div>
  );
}
