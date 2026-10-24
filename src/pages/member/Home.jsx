const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, BookOpen, AlarmClock, UserRoundCheck } from "lucide-react";

import { useSession } from "@/hooks/useSession";
import PageHeader from "@/components/PageHeader";
import StatCard from "@/components/StatCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { LoanStatusBadge } from "@/components/StatusBadge";
import { formatDateBR, isOverdue, daysLate } from "@/lib/library";

export default function MemberHome() {
  const { user, profile, role, settings } = useSession();
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (!user?.email) return;
    let active = true;
    db.entities.Loan
      .filter({ user_email: user.email }, { sort: "due_at", limit: 100 })
      .then((page) => active && setLoans(page.items || []))
      .catch(() => active && setLoans([]))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [user]);

  const actives = loans.filter((loan) => loan.status === "ativo");
  const late = actives.filter((loan) => isOverdue(loan));

  return (
    <div>
      <PageHeader
        eyebrow={settings.library_name}
        title={`Olá, ${(profile?.full_name || user?.full_name || "leitor").split(" ")[0]}`}
        description="Pesquise o acervo, consulte a disponibilidade e acompanhe seus empréstimos."
      />

      {!profile ? (
        <Alert className="mb-4" role="status">
          <AlertDescription className="flex flex-wrap items-center gap-3">
            Complete seu cadastro para poder emprestar livros na biblioteca.
            <Button asChild size="sm">
              <Link to="/onboarding">
                <UserRoundCheck className="mr-2 h-4 w-4" aria-hidden="true" />
                Completar cadastro
              </Link>
            </Button>
          </AlertDescription>
        </Alert>
      ) : profile.status === "pendente" ? (
        <Alert className="mb-4" role="status">
          <AlertDescription>
            Seu cadastro está aguardando aprovação da biblioteca. A pesquisa no acervo já está liberada.
          </AlertDescription>
        </Alert>
      ) : profile.status === "bloqueado" ? (
        <Alert variant="destructive" role="alert" className="mb-4">
          <AlertDescription>
            Seu cadastro está bloqueado. Procure a equipe da biblioteca para regularizar a situação.
          </AlertDescription>
        </Alert>
      ) : null}

      <form
        onSubmit={(event) => {
          event.preventDefault();
          navigate(query.trim() ? `/membro/catalogo?q=${encodeURIComponent(query.trim())}` : "/membro/catalogo");
        }}
        className="rounded-2xl border border-border bg-card p-4"
      >
        <Label htmlFor="home-search" className="text-base">
          Buscar no acervo
        </Label>
        <div className="mt-2 flex flex-col gap-2 sm:flex-row">
          <Input
            id="home-search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Título, autor, categoria ou ISBN"
            className="sm:max-w-md"
          />
          <Button type="submit">
            <Search className="mr-2 h-4 w-4" aria-hidden="true" />
            Buscar
          </Button>
        </div>
      </form>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <StatCard label="Empréstimos ativos" value={loading ? "…" : actives.length} icon={BookOpen} to="/membro/emprestimos" />
        <StatCard
          label="Em atraso"
          value={loading ? "…" : late.length}
          icon={AlarmClock}
          hint={late.length ? "Devolva para liberar novos empréstimos" : "Tudo em dia"}
          to="/membro/emprestimos"
        />
        <StatCard label="Prazos de devolução" value={loading ? "…" : actives.length} hint="Confira as datas abaixo" />
      </div>

      <section aria-labelledby="my-active" className="mt-6">
        <div className="flex items-center justify-between">
          <h3 id="my-active" className="font-heading text-xl font-semibold">
            Meus empréstimos em andamento
          </h3>
          <Button asChild variant="ghost" size="sm">
            <Link to="/membro/emprestimos">Ver todos</Link>
          </Button>
        </div>

        {loading ? (
          <p className="mt-3 text-sm text-muted-foreground">Carregando seus empréstimos…</p>
        ) : actives.length === 0 ? (
          <div className="mt-3 rounded-xl border border-dashed border-border p-6">
            <p className="font-medium">Você não tem empréstimos ativos.</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Pesquise um livro e procure a biblioteca para realizar o empréstimo.
            </p>
            <Button asChild className="mt-3" variant="outline">
              <Link to="/membro/catalogo">Explorar o acervo</Link>
            </Button>
          </div>
        ) : (
          <ul className="mt-3 grid gap-3 sm:grid-cols-2">
            {actives.map((loan) => (
              <li key={loan.id} className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{loan.book_title}</p>
                    <p className="font-mono text-xs text-muted-foreground">{loan.copy_code}</p>
                  </div>
                  <LoanStatusBadge loan={loan} />
                </div>
                <p className="mt-2 text-sm">
                  Devolver até <strong>{formatDateBR(loan.due_at)}</strong>
                </p>
                {isOverdue(loan) ? (
                  <p className="mt-1 text-sm font-semibold text-rose-800">{daysLate(loan.due_at)} dia(s) de atraso</p>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="rules" className="mt-6 rounded-xl border border-border bg-card p-4">
        <h3 id="rules" className="font-heading text-lg font-semibold">
          Seus prazos
        </h3>
        <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
          <li>
            Prazo de empréstimo para o seu perfil:{" "}
            <strong>{settings[`loan_days_${role || "estudante"}`] || 7} dias</strong>.
          </li>
          <li>
            Limite de empréstimos simultâneos: <strong>{settings[`max_loans_${role || "estudante"}`] || 2}</strong>.
          </li>
          <li>Renovações são feitas pela equipe da biblioteca.</li>
        </ul>
      </section>
    </div>
  );
}