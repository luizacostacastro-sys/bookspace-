import { CheckCircle2, BookOpen, Wrench, AlertTriangle, CircleSlash, Clock, Undo2 } from "lucide-react";
import { COPY_STATUS, LOAN_STATUS, loanStatusKey } from "@/lib/library";

const COPY_ICONS = {
  disponivel: CheckCircle2,
  emprestado: BookOpen,
  manutencao: Wrench,
  danificado: AlertTriangle,
  perdido: CircleSlash,
  inativo: CircleSlash
};

const LOAN_ICONS = {
  ativo: BookOpen,
  atrasado: Clock,
  devolvido: Undo2,
  cancelado: CircleSlash
};

export function CopyStatusBadge({ status }) {
  const meta = COPY_STATUS[status] || COPY_STATUS.inativo;
  const Icon = COPY_ICONS[status] || CircleSlash;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${meta.tone}`}
    >
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {meta.label}
    </span>
  );
}

export function LoanStatusBadge({ loan }) {
  const key = loanStatusKey(loan);
  const meta = LOAN_STATUS[key] || LOAN_STATUS.cancelado;
  const Icon = LOAN_ICONS[key] || CircleSlash;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${meta.tone}`}
    >
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {meta.label}
    </span>
  );
}