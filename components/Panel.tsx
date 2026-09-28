// The standard dashboard card: raised surface with an optional gold
// small-caps heading (diamond ornament + fading rule) and an action slot.
export function Panel({
  title,
  action,
  id,
  className = "",
  children,
}: {
  title?: string;
  action?: React.ReactNode;
  id?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className={`surface p-5 md:p-6 ${className}`}>
      {title && (
        <div className="mb-5 flex items-center gap-3">
          <span aria-hidden className="h-1.5 w-1.5 rotate-45 bg-gold shadow-[0_0_8px_rgb(var(--gold)/0.8)]" />
          <h2 className="font-display text-[13px] font-semibold uppercase tracking-[0.16em] text-gold">{title}</h2>
          <span aria-hidden className="h-px flex-1 bg-gradient-to-r from-gold/25 to-transparent" />
          {action}
        </div>
      )}
      {children}
    </section>
  );
}
