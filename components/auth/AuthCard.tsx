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
    <div className="surface relative w-full max-w-[410px] animate-fade-up overflow-hidden p-6 sm:p-8">
      <div aria-hidden className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-gold/70 to-transparent" />
      <div aria-hidden className="pointer-events-none absolute -top-24 left-1/2 h-48 w-72 -translate-x-1/2 rounded-full bg-gold/10 blur-3xl" />
      <BrandMark className="relative mb-7 text-[16px]" />
      <h1 className="relative mb-1.5 font-display text-[22px] font-semibold tracking-wide">{title}</h1>
      <p className="relative mb-7 text-[13.5px] text-text-dim">{subtitle}</p>
      <div className="relative">{children}</div>
    </div>
  );
}
