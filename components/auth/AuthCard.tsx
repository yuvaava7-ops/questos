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
    <div className="frame relative w-full max-w-[420px] px-4 pb-4 pt-3 sm:px-6 sm:pb-6">
      <BrandMark className="mb-6" />
      <h1 className="engraved mb-1.5 font-display text-[24px] font-bold tracking-wide">{title}</h1>
      <p className="mb-6 text-[15px] text-text-dim">{subtitle}</p>
      {children}
    </div>
  );
}
