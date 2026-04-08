export const SectionTitle = ({
  eyebrow,
  title,
  detail
}: {
  eyebrow: string;
  title: string;
  detail?: string;
}) => (
  <header className="mb-6 border-b border-ink/10 pb-4">
    <p className="text-xs uppercase tracking-[0.24em] text-ink/55">{eyebrow}</p>
    <div className="mt-2 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
      <h1 className="font-display text-4xl tracking-tight text-ink sm:text-5xl">{title}</h1>
      {detail ? <p className="max-w-xl text-sm text-ink/65">{detail}</p> : null}
    </div>
  </header>
);

