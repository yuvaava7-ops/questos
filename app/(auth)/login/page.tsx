import { Window } from "@/components/pixel/Window";
import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <Window title="Continue" bodyClassName="p-5 pt-6">
      <p className="mb-4 text-[24px] leading-tight text-dim">Welcome back, hero. Pick up your streak.</p>
      <LoginForm />
    </Window>
  );
}
