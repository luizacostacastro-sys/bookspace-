import { Link } from "react-router-dom";

export default function StatCard({ label, value, icon: Icon, hint, to }) {
  const content = (
    <div className="flex items-start justify-between gap-3 rounded-xl border border-border bg-card p-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="mt-1 font-display text-3xl font-semibold leading-none">{value}</p>
        {hint ? <p className="mt-2 text-xs text-muted-foreground">{hint}</p> : null}
      </div>
      {Icon ? (
        <span className="rounded-lg bg-secondary p-2 text-primary" aria-hidden="true">
          <Icon className="h-5 w-5" />
        </span>
      ) : null}
    </div>
  );

  if (to) {
    return (
      <Link to={to} className="block rounded-xl transition-shadow hover:shadow-sm">
        {content}
      </Link>