/* eslint-disable @next/next/no-img-element -- tiny static sprites; next/image adds nothing here */

// Steel ring checkbox (painted sprites) shared by quest and task rows.
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
      className="h-7 w-7 shrink-0 rounded-full transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60 disabled:cursor-not-allowed"
    >
      <img src={checked ? "/ui/check-done.webp" : "/ui/check-empty.webp"} alt="" className="h-full w-full" draggable={false} />
    </button>
  );
}
