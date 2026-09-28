import type { LucideIcon } from "lucide-react";

// Labelled input with a leading icon, shared by the login and sign-up forms.
export function AuthField({
  label,
  icon: Icon,
  animate,
  ...input
}: {
  label: string;
  icon: LucideIcon;
  animate?: boolean;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label
      data-animate={animate || undefined}
      className={`flex flex-col gap-1.5 text-[13px] font-medium text-text-dim ${animate ? "opacity-0" : ""}`}
    >
      {label}
      <div className="flex items-center gap-2.5 rounded-[10px] border border-border/80 bg-bg/60 px-3 py-2.5 transition-all focus-within:border-gold/60 focus-within:ring-2 focus-within:ring-gold/15">
        <Icon size={15} className="shrink-0 text-text-faint" aria-hidden />
        <input {...input} className="w-full bg-transparent text-[13.5px] text-text placeholder:text-text-faint focus:outline-none" />
      </div>
    </label>
  );
}
