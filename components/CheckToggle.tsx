import { Check } from "lucide-react";

// Round completion checkbox shared by quest and task rows.
export function CheckToggle({
  checked,
  label,
  disabled,
  onToggle,
}: {
  checked: boolean;
  label: string;
  disabled?: boolean;
  onToggle: (el: HTMLButtonElement) => void;
}) {
  return (
    <button
      type="button"
      onClick={(e) => onToggle(e.currentTarget)}
      disabled={disabled}
      aria-pressed={checked}
      aria-label={`Mark "${label}" as ${checked ? "not done" : "done"}`}
      className={`flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full border-2 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50 disabled:cursor-not-allowed ${
        checked
          ? "border-green bg-green text-bg shadow-[0_0_14px_-2px_rgb(var(--green)/0.8)]"
          : "border-text-faint/50 hover:border-gold hover:shadow-[0_0_12px_-3px_rgb(var(--gold)/0.7)]"
      }`}
    >
      {checked && <Check size={13} strokeWidth={3.25} />}
    </button>
  );
}
