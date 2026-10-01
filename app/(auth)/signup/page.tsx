import { Window } from "@/components/pixel/Window";
import { SignUpForm } from "@/components/auth/SignUpForm";

export default function SignUpPage() {
  return (
    <Window title="New Game" bodyClassName="p-5 pt-6">
      <p className="mb-4 text-[24px] leading-tight text-dim">Name your hero and start earning XP today.</p>
      <SignUpForm />
    </Window>
  );
}
