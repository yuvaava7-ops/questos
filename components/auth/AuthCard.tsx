import { BrandMark } from "@/components/BrandMark";

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
    <div className="w-full max-w-[400px] rounded-card border border-border bg-panel p-6 sm:p-7">
      <BrandMark className="mb-6 text-[16px]" />
      <h1 className="mb-1.5 font-display text-lg font-semibold tracking-wide">{title}</h1>
      <p className="mb-6 text-[13px] text-text-dim">{subtitle}</p>
      {children}
    </div>
  );
}
