import { Sprite } from "@/components/pixel/Sprite";
import { Window } from "@/components/pixel/Window";
import { CHEST } from "@/components/pixel/sprites";

export function SetupNotice() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[480px] items-center px-4">
      <Window title="Save data missing" className="w-full" bodyClassName="p-5 pt-6 text-center">
        <div className="mb-3 flex justify-center">
          <Sprite def={CHEST} scale={5} />
        </div>
        <p className="text-[24px] leading-tight text-paper">
          Create a Supabase project and run <span className="text-gold">supabase/schema.sql</span> in its SQL editor.
        </p>
        <p className="mt-3 text-[22px] leading-tight text-dim">
          Then set <span className="text-sky">NEXT_PUBLIC_SUPABASE_URL</span> and{" "}
          <span className="text-sky">NEXT_PUBLIC_SUPABASE_ANON_KEY</span> in <span className="text-sky">.env.local</span> and restart the
          dev server.
        </p>
      </Window>
    </main>
  );
}
