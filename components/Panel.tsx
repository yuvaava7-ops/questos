// The standard dashboard card: bordered panel with an optional gold
// small-caps heading and a right-aligned slot for actions/meta.
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
    <section id={id} className={`rounded-card border border-border/60 bg-panel p-5 md:p-6 ${className}`}>
      {title && (
        <div className="mb-5 flex items-center justify-between gap-3 border-b border-gold/20 pb-3">
          <h2 className="font-display text-[13px] font-semibold uppercase tracking-[0.14em] text-gold">{title}</h2>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}
