export default function PageHeader({ title, description, actions, eyebrow }) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow ? (
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{eyebrow}</p>
        ) : null}
        <h2 className="mt-1 font-display text-2xl font-semibold sm:text-3xl">{title}</h2>
        {description ? <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}