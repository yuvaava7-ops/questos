import Link from "next/link";
import { Zap } from "lucide-react";

export function AuthCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="w-full max-w-[400px] rounded-card border border-border bg-panel p-7">
      <Link href="/" className="mb-6 flex items-center gap-2.5 font-display text-[16px] font-semibold tracking-wide">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gold text-bg">
          <Zap size={15} />
        </div>
        QuestOS
      </Link>
      <h1 className="mb-1.5 font-display text-lg font-semibold tracking-wide">{title}</h1>
      <p className="mb-6 text-[13px] text-text-dim">{subtitle}</p>
      {children}
    </div>
  );
}
