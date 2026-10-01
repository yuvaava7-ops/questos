import { NavBar } from "@/components/game/NavBar";
import { SetupNotice } from "@/components/SetupNotice";
import { isSupabaseConfigured } from "@/lib/supabase/config";

// Level and streak are relative to "now" and the ledger; always render fresh.
export const dynamic = "force-dynamic";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  if (!isSupabaseConfigured) return <SetupNotice />;

  return (
    <>
      <main className="mx-auto w-full max-w-[560px] px-4 pb-32 pt-2">{children}</main>
      <NavBar />
    </>
  );
}
