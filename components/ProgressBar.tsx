export function ProgressBar({
  percent,
  barClassName = "bg-gold",
  label,
}: {
  percent: number;
  barClassName?: string;
  label?: string;
}) {
  const value = Math.min(100, Math.max(0, percent));
  return (
    <div
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
      className="h-[3px] overflow-hidden rounded-full bg-white/[0.06]"
    >
      <div className={`h-full rounded-full transition-[width] duration-500 ${barClassName}`} style={{ width: `${value}%` }} />
    </div>
  );
}
