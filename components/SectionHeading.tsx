export function SectionHeading({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div className="mb-5 flex items-center justify-between border-b border-gold/20 pb-3">
      <h3 className="font-display text-[13px] font-semibold uppercase tracking-[0.14em] text-gold">{title}</h3>
      {children}
    </div>
  );
}
