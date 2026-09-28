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
      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-[1.5px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50 disabled:cursor-not-allowed ${
        checked ? "border-green bg-green text-bg" : "border-text-faint/60 hover:border-gold"
      }`}
    >
      {checked && <Check size={12} strokeWidth={3} />}
    </button>
  );
}
