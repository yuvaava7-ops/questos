// SNES-style menu window. `title` renders as a small tab sitting on the top border.
export function Window({
  title,
  right,
  className,
  bodyClassName,
  children,
}: {
  title?: string;
  right?: React.ReactNode;
  className?: string;
  bodyClassName?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={`win ${className ?? ""}`}>
      {title && (
        <div className="absolute -top-[14px] left-4 right-4 z-10 flex items-center justify-between">
          <h2 className="px-title bg-ink px-2 text-[10px] text-gold">{title}</h2>
          {right && <div className="bg-ink px-2 text-[20px] leading-none text-dim">{right}</div>}
        </div>
      )}
      <div className={bodyClassName ?? "p-4 pt-5"}>{children}</div>
    </section>
  );
}
