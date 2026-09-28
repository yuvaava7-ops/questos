// The standard card: steel-framed charcoal panel, or a parchment scroll.
// Title is engraved gold small caps over a thin gold rule.
export function Panel({
  title,
  action,
  id,
  variant = "frame",
  className = "",
  children,
}: {
  title?: string;
  action?: React.ReactNode;
  id?: string;
  variant?: "frame" | "parchment";
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className={`${variant} px-3 pb-3 pt-2 md:px-4 md:pb-4 ${className}`}>
      {title && (
        <div className="mb-4 flex items-center gap-3 border-b border-gold/30 pb-2.5">
          <h2
            className={`flex-1 font-display text-[14px] font-bold uppercase tracking-[0.18em] text-gold ${variant === "frame" ? "engraved" : ""}`}
          >
            {title}
          </h2>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}
