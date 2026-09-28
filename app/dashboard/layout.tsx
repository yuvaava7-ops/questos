import { Sidebar } from "@/components/Sidebar";
import { MobileTopBar } from "@/components/MobileTopBar";
import { SetupNotice } from "@/components/SetupNotice";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getUserSummary } from "@/lib/queries";

// Level and streak are relative to "now" and the ledger; always render fresh.
export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  if (!isSupabaseConfigured) return <SetupNotice />;

  const user = await getUserSummary();

  return (
    <div className="flex w-full flex-1 flex-col md:flex-row">
      <Sidebar user={user} />
      <MobileTopBar user={user} />
      <main className="w-full max-w-[1400px] flex-1 px-4 py-6 sm:px-6 md:px-10 md:py-10">{children}</main>
    </div>
  );
}
