const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  BookOpen,
  Layers,
  CheckCircle2,
  BookOpenCheck,
  AlarmClock,
  Users,
  ScanLine,
  QrCode,
  Plus
} from "lucide-react";

import { useSession } from "@/hooks/useSession";
import PageHeader from "@/components/PageHeader";
import StatCard from "@/components/StatCard";
import { Button } from "@/components/ui/button";
import { CopyStatusBadge, LoanStatusBadge } from "@/components/StatusBadge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { formatDateBR, formatDateTimeBR } from "@/lib/library";
import { can } from "@/lib/roles";

export default function AdminDashboard() {
  const { user, profile, role, settings, isAdmin } = useSession();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    db.functions
      .invoke("staffData", { resource: "stats" })
      .then((response) => {
        if (!active) return;
        if (response.data?.error) setError(response.data.error);
        else setData(response.data);
      })
      .catch(() => active && setError("Não foi possível carregar os indicadores."));
    return () => {
      active = false;
    };
  }, []);

  const stats = data?.stats;

  return (
    <div>
      <PageHeader
        eyebrow={settings.library_name}
        title={`Olá, ${(profile?.full_name || user?.full_name || "equipe").split(" ")[0]}`}
        description="Visão geral do acervo e das movimentações da biblioteca."
        actions={
          <>
            <Button asChild>
              <Link to="/admin/emprestimos">
                <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
                Registrar empréstimo
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/admin/leitor">
                <ScanLine className="mr-2 h-4 w-4" aria-hidden="true" />
                Leitor de QR Code
              </Link>
            </Button>
          </>
        }
      />

      {error ? (
        <Alert variant="destructive" role="alert" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      {!stats ? (
        <p className="text-sm text-muted-foreground" role="status">
          Carregando indicadores…
        </p>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            <StatCard label="Títulos ativos" value={stats.books} icon={BookOpen} to="/admin/livros" />
            <StatCard label="Exemplares físicos" value={stats.copies} icon={Layers} to="/admin/exemplares" />
            <StatCard label="Exemplares disponíveis" value={stats.available} icon={CheckCircle2} to="/admin/exemplares" />
            <StatCard label="Exemplares emprestados" value={stats.loaned} icon={BookOpenCheck} to="/admin/emprestimos" />
            <StatCard
              label="Empréstimos em atraso"
              value={stats.overdue}
              icon={AlarmClock}
              hint={stats.overdue ? "Procure os leitores para regularizar" : "Nenhum atraso registrado"}
              to="/admin/atrasos"
            />
            <StatCard label="Usuários cadastrados" value={stats.users} icon={Users} to="/admin/usuarios" />
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <section aria-labelledby="recent-loans" className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center justify-between">
                <h3 id="recent-loans" className="font-heading text-lg font-semibold">
                  Empréstimos recentes
                </h3>
                <Button asChild variant="ghost" size="sm">
                  <Link to="/admin/emprestimos">Ver todos</Link>
                </Button>
              </div>
              {data.recentLoans.length === 0 ? (
                <p className="mt-3 text-sm text-muted-foreground">Nenhum empréstimo ativo no momento.</p>
              ) : (
                <ul className="mt-3 space-y-2">
                  {data.recentLoans.map((loan) => (
                    <li key={loan.id} className="flex items-start justify-between gap-3 rounded-lg border border-border p-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">{loan.book_title}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {loan.user_name} · {loan.copy_code}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Devolver até {formatDateBR(loan.due_at)}
                        </p>
                      </div>
                      <LoanStatusBadge loan={loan} />
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section aria-labelledby="recent-returns" className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center justify-between">
                <h3 id="recent-returns" className="font-heading text-lg font-semibold">
                  Devoluções recentes
                </h3>
                <Button asChild variant="ghost" size="sm">
                  <Link to="/admin/historico">Ver histórico</Link>
                </Button>
              </div>
              {data.recentReturns.length === 0 ? (
                <p className="mt-3 text-sm text-muted-foreground">Nenhuma devolução registrada ainda.</p>
              ) : (
                <ul className="mt-3 space-y-2">
                  {data.recentReturns.map((loan) => (
                    <li key={loan.id} className="flex items-start justify-between gap-3 rounded-lg border border-border p-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">{loan.book_title}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {loan.user_name} · {loan.copy_code}
                        </p>
                        <p className="text-xs text-muted-foreground">Devolvido em {formatDateTimeBR(loan.returned_at)}</p>
                      </div>
                      <CopyStatusBadge status={loan.return_condition === "bom" ? "disponivel" : loan.return_condition || "disponivel"} />
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section aria-labelledby="top-books" className="rounded-xl border border-border bg-card p-4">
              <h3 id="top-books" className="font-heading text-lg font-semibold">
                Livros mais emprestados
              </h3>
              {data.stats.topBooks.length === 0 ? (
                <p className="mt-3 text-sm text-muted-foreground">Ainda não há empréstimos suficientes para o ranking.</p>
              ) : (
                <ol className="mt-3 space-y-2">
                  {data.stats.topBooks.map((item, index) => (
                    <li key={item.title} className="flex items-center gap-3 rounded-lg bg-secondary/60 px-3 py-2">
                      <span className="font-display text-lg font-semibold text-primary">{index + 1}</span>
                      <span className="min-w-0 flex-1 truncate text-sm">{item.title}</span>
                      <span className="text-xs font-semibold text-muted-foreground">{item.count} empréstimo(s)</span>
                    </li>
                  ))}
                </ol>
              )}
            </section>

            <section aria-labelledby="attention" className="rounded-xl border border-border bg-card p-4">
              <h3 id="attention" className="font-heading text-lg font-semibold">
                Pendências e avisos
              </h3>
              <ul className="mt-3 space-y-2 text-sm">
                <li className="rounded-lg bg-secondary/60 px-3 py-2">
                  {data.stats.overdue > 0
                    ? `${data.stats.overdue} empréstimo(s) em atraso aguardando devolução.`
                    : "Nenhum empréstimo em atraso."}
                </li>
                <li className="rounded-lg bg-secondary/60 px-3 py-2">
                  {data.stats.available === 0
                    ? "Nenhum exemplar disponível — avalie ampliar o acervo."
                    : `${data.stats.available} exemplar(es) prontos para empréstimo.`}
                </li>
                {isAdmin ? (
                  <li className="rounded-lg bg-secondary/60 px-3 py-2">
                    Cadastros pendentes de aprovação aparecem em{" "}
                    <Link to="/admin/usuarios" className="font-semibold text-primary underline underline-offset-4">
                      Usuários
                    </Link>
                    .
                  </li>
                ) : null}
              </ul>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button asChild variant="outline" size="sm">
                  <Link to="/admin/qrcodes">
                    <QrCode className="mr-2 h-4 w-4" aria-hidden="true" />
                    Gerar QR Codes
                  </Link>
                </Button>
                {can(role, "relatorios:view") ? (
                  <Button asChild variant="outline" size="sm">
                    <Link to="/admin/relatorios">Relatórios</Link>
                  </Button>
                ) : null}
              </div>
            </section>
          </div>

          {data.overdueList.length > 0 ? (
            <section aria-labelledby="overdue-list" className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-900">
              <h3 id="overdue-list" className="font-heading text-lg font-semibold">
                Atrasos que precisam de atenção
              </h3>
              <ul className="mt-2 space-y-1 text-sm">
                {data.overdueList.map((loan) => (
                  <li key={loan.id}>
                    {loan.book_title} · {loan.copy_code} — {loan.user_name} (previsto para {formatDateBR(loan.due_at)})
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </>
      )}
    </div>
  );
}