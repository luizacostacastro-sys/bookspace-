const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { useSession } from "@/hooks/useSession";
import PageHeader from "@/components/PageHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { LoanSummaryCard } from "@/components/loans/LoanTable";
import { LoanStatusBadge } from "@/components/StatusBadge";
import { formatDateBR, formatDateTimeBR } from "@/lib/library";

export default function MyLoans() {
  const { user } = useSession();
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user?.email) return;
    let active = true;
    db.entities.Loan
      .filter({ user_email: user.email }, { sort: "-loaned_at", limit: 200 })
      .then((page) => active && setLoans(page.items || []))
      .catch(() => active && setError("Não foi possível carregar seus empréstimos."))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [user]);

  const actives = loans.filter((loan) => loan.status === "ativo");
  const history = loans.filter((loan) => loan.status !== "ativo");

  return (
    <div>
      <PageHeader
        title="Meus empréstimos"
        description="Acompanhe prazos e consulte o histórico dos seus empréstimos. Em caso de atraso, procure a biblioteca."
      />

      {error ? (
        <Alert variant="destructive" role="alert" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      {loading ? (
        <p className="text-sm text-muted-foreground">Carregando empréstimos…</p>
      ) : (
        <Tabs defaultValue="ativos">
          <TabsList>
            <TabsTrigger value="ativos">Em andamento ({actives.length})</TabsTrigger>
            <TabsTrigger value="historico">Histórico ({history.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="ativos" className="mt-4">
            {actives.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border p-6">
                <p className="font-medium">Nenhum empréstimo em andamento.</p>
                <p className="mt-1 text-sm text-muted-foreground">Pesquise o acervo e procure a biblioteca para emprestar.</p>
                <Button asChild variant="outline" className="mt-3">
                  <Link to="/membro/catalogo">Explorar o acervo</Link>
                </Button>
              </div>
            ) : (
              <ul className="grid gap-3 sm:grid-cols-2">
                {actives.map((loan) => (
                  <li key={loan.id}>
                    <LoanSummaryCard loan={loan} />
                  </li>
                ))}
              </ul>
            )}
          </TabsContent>

          <TabsContent value="historico" className="mt-4">
            {history.length === 0 ? (
              <p className="rounded-lg border border-dashed border-border p-6 text-sm text-muted-foreground">
                Seu histórico ainda está vazio.
              </p>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-border">
                <table className="w-full min-w-[560px] border-collapse text-sm">
                  <caption className="sr-only">Histórico de empréstimos</caption>
                  <thead className="bg-secondary/70 text-left">
                    <tr>
                      <th scope="col" className="px-3 py-2 font-semibold">Livro</th>
                      <th scope="col" className="px-3 py-2 font-semibold">Empréstimo</th>
                      <th scope="col" className="px-3 py-2 font-semibold">Devolvido em</th>
                      <th scope="col" className="px-3 py-2 font-semibold">Situação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((loan) => (
                      <tr key={loan.id} className="border-t border-border">
                        <td className="px-3 py-2">
                          <p className="font-medium">{loan.book_title}</p>
                          <p className="font-mono text-xs text-muted-foreground">{loan.copy_code}</p>
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap">{formatDateBR(loan.loaned_at)}</td>
                        <td className="px-3 py-2 whitespace-nowrap">
                          {loan.returned_at ? formatDateTimeBR(loan.returned_at) : "—"}
                        </td>
                        <td className="px-3 py-2">
                          <LoanStatusBadge loan={loan} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}