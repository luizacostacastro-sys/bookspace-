import { Link } from "react-router-dom";
import { Undo2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CopyStatusBadge, LoanStatusBadge } from "@/components/StatusBadge";
import { formatDateBR, formatDateTimeBR, daysLate, isOverdue } from "@/lib/library";

export default function LoanTable({ loans, showUser = true, onReturn, onRenew, emptyMessage }) {
  if (!loans.length) {
    return (
      <p className="rounded-lg border border-dashed border-border p-6 text-sm text-muted-foreground">
        {emptyMessage || "Nenhum empréstimo encontrado."}
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full min-w-[720px] border-collapse text-sm">
        <caption className="sr-only">Lista de empréstimos</caption>
        <thead className="bg-secondary/70 text-left">
          <tr>
            <th scope="col" className="px-3 py-3 font-semibold">
              Livro / exemplar
            </th>
            {showUser ? (
              <th scope="col" className="px-3 py-3 font-semibold">
                Leitor
              </th>
            ) : null}
            <th scope="col" className="px-3 py-3 font-semibold">
              Empréstimo
            </th>
            <th scope="col" className="px-3 py-3 font-semibold">
              Devolução prevista
            </th>
            <th scope="col" className="px-3 py-3 font-semibold">
              Situação
            </th>
            {onReturn || onRenew ? (
              <th scope="col" className="px-3 py-3 font-semibold">
                Ações
              </th>
            ) : null}
          </tr>
        </thead>
        <tbody>
          {loans.map((loan) => {
            const late = daysLate(loan.due_at);
            return (
              <tr key={loan.id} className="border-t border-border align-top">
                <td className="px-3 py-3">
                  <p className="font-semibold leading-snug">{loan.book_title || "Exemplar"}</p>
                  <p className="font-mono text-xs text-muted-foreground">{loan.copy_code}</p>
                </td>
                {showUser ? (
                  <td className="px-3 py-3">
                    <p className="font-medium leading-snug">{loan.user_name}</p>
                    <p className="text-xs text-muted-foreground">{loan.user_email}</p>
                    {loan.class_or_department ? (
                      <p className="text-xs text-muted-foreground">{loan.class_or_department}</p>
                    ) : null}
                  </td>
                ) : null}
                <td className="px-3 py-3 whitespace-nowrap">{formatDateTimeBR(loan.loaned_at)}</td>
                <td className="px-3 py-3 whitespace-nowrap">
                  <span className="font-medium">{formatDateBR(loan.due_at)}</span>
                  {loan.status === "ativo" && late > 0 ? (
                    <span className="block text-xs font-semibold text-rose-800">{late} dia(s) de atraso</span>
                  ) : null}
                  {loan.returned_at ? (
                    <span className="block text-xs text-muted-foreground">
                      Devolvido em {formatDateTimeBR(loan.returned_at)}
                    </span>
                  ) : null}
                </td>
                <td className="px-3 py-3">
                  <LoanStatusBadge loan={loan} />
                  {loan.return_condition && loan.return_condition !== "bom" ? (
                    <p className="mt-1 text-xs text-muted-foreground">Estado: {loan.return_condition}</p>
                  ) : null}
                </td>
                {onReturn || onRenew ? (
                  <td className="px-3 py-3">
                    {loan.status === "ativo" ? (
                      <div className="flex flex-wrap gap-2">
                        {onReturn ? (
                          <Button size="sm" variant="outline" onClick={() => onReturn(loan)}>
                            <Undo2 className="mr-1.5 h-4 w-4" aria-hidden="true" />
                            Devolver
                          </Button>
                        ) : null}
                        {onRenew ? (
                          <Button size="sm" variant="ghost" onClick={() => onRenew(loan)}>
                            <RefreshCw className="mr-1.5 h-4 w-4" aria-hidden="true" />
                            Renovar
                          </Button>
                        ) : null}
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">Finalizado</span>
                    )}
                  </td>
                ) : null}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export function LoanSummaryCard({ loan }) {
  return (
    <article className="rounded-xl border border-border bg-card p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="font-heading text-lg font-semibold leading-snug">{loan.book_title || "Exemplar"}</h3>
          <p className="font-mono text-xs text-muted-foreground">{loan.copy_code}</p>
        </div>
        <LoanStatusBadge loan={loan} />
      </div>
      <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-xs uppercase tracking-wide text-muted-foreground">Empréstimo</dt>
          <dd>{formatDateTimeBR(loan.loaned_at)}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-muted-foreground">Devolver até</dt>
          <dd className="font-semibold">{formatDateBR(loan.due_at)}</dd>
        </div>
      </dl>
      {isOverdue(loan) ? (
        <p className="mt-3 rounded-md bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-900" role="status">
          Atrasado em {daysLate(loan.due_at)} dia(s). Procure a biblioteca para regularizar.
        </p>
      ) : null}
      <div className="mt-3">
        <CopyStatusBadge status={loan.status === "ativo" ? "emprestado" : "disponivel"} />
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        <Link to={`/membro/catalogo`} className="font-semibold text-primary underline underline-offset-4">
          Ver acervo
        </Link>
      </p>
    </article>
  );
}