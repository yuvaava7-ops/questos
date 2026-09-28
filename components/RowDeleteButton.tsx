import { X } from "lucide-react";

// Hover-revealed on pointer devices, always visible on touch (no hover there).
export function RowDeleteButton({ label, disabled, onDelete }: { label: string; disabled?: boolean; onDelete: () => void }) {
  return (
    <button
      type="button"
      onClick={onDelete}
      disabled={disabled}
      aria-label={`Delete "${label}"`}
      className="rounded-[8px] p-1.5 text-text-faint hover:bg-red-dim hover:text-red transition-opacity focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50 disabled:invisible [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100"
    >
      <X size={13} />
    </button>
  );
}
