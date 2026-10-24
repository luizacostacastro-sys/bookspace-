const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useEffect, useState } from "react";
import { Download, Printer } from "lucide-react";

import PageHeader from "@/components/PageHeader";
import StatCard from "@/components/StatCard";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { formatDateBR, toCSV, downloadText } from "@/lib/library";

export default function AdminReports() {
  const [stats, setStats] = useState(null);
  const [books, setBooks] = useState([]);
  const [copies, setCopies] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const [statsResponse, bookPage, copyPage] = await Promise.all([
          db.functions.invoke("staffData", { resource: "stats" }),
          db.entities.Book.filter({}, { sort: "title", limit: 300 }),
          db.entities.BookCopy.filter({}, { limit: 800 })
        ]);
        if (statsResponse.data?.error) setError(statsResponse.data.error);
        else setStats(statsResponse.data.stats);
        setBooks(bookPage.items || []);
        setCopies(copyPage.items || []);
      } catch (err) {
        setError("Não foi possível montar os relatórios.");
      }
    };
    load();
  }, []);

  const tally = (bookId) => {
    const list = copies.filter((copy) => copy.book_id === bookId);
    return { total: list.length, available: list.filter((copy) => copy.status === "disponivel").length };
  };

  const categoryMap = copies.reduce((acc, copy) => {
    const book = books.find((item) => item.id === copy.book_id);
    const category = book?.category || "Sem categoria";
    if (!acc[category]) acc[category] = { total: 0, available: 0 };
    acc[category].total += 1;
    if (copy.status === "disponivel") acc[category].available += 1;
    return acc;
  }, {});

  const exportAcervo = () => {
    const rows = books.map((book) => {
      const counts = tally(book.id);
      return {
        Titulo: book.title,
        Autor: book.authors,
        ISBN: book.isbn || "",
        Editora: book.publisher || "",
        Ano: book.publication_year || "",
        Categoria: book.category || "",
        Exemplares: counts.total,
        Disponiveis: counts.available,
        Situacao: book.status,
        Cadastrado_em: formatDateBR(book.created_date)
      };
    });
    downloadText(`relatorio-acervo-${new Date().toISOString().slice(0, 10)}.csv`, toCSV(rows));
  };

  return (
    <div>
      <PageHeader
        title="Relatórios"
        description="Indicadores do acervo e da circulação. A exportação em CSV deve ser compartilhada apenas com pessoas autorizadas."
        actions={
          <>
            <Button variant="outline" onClick={exportAcervo} disabled={!books.length}>
              <Download className="mr-2 h-4 w-4" aria-hidden="true" />
              Exportar acervo (CSV)
            </Button>
            <Button variant="outline" onClick={() => window.print()}>
              <Printer className="mr-2 h-4 w-4" aria-hidden="true" />
              Imprimir
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
        <p className="text-sm text-muted-foreground">Calculando indicadores…</p>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Títulos" value={stats.books} />
            <StatCard label="Exemplares" value={stats.copies} />
            <StatCard label="Disponíveis" value={stats.available} />
            <StatCard label="Emprestados" value={stats.loaned} hint={`${stats.overdue} em atraso`} />
          </div>

          <section aria-labelledby="by-category" className="mt-6 rounded-xl border border-border bg-card p-4">
            <h3 id="by-category" className="font-heading text-lg font-semibold">
              Exemplares por categoria
            </h3>
            {Object.keys(categoryMap).length === 0 ? (
              <p className="mt-2 text-sm text-muted-foreground">Nenhum exemplar cadastrado.</p>
            ) : (
              <div className="mt-3 overflow-x-auto">
                <table className="w-full min-w-[420px] border-collapse text-sm">
                  <caption className="sr-only">Exemplares por categoria</caption>
                  <thead className="bg-secondary/70 text-left">
                    <tr>
                      <th scope="col" className="px-3 py-2 font-semibold">Categoria</th>
                      <th scope="col" className="px-3 py-2 font-semibold">Exemplares</th>
                      <th scope="col" className="px-3 py-2 font-semibold">Disponíveis</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(categoryMap).map(([category, value]) => (
                      <tr key={category} className="border-t border-border">
                        <td className="px-3 py-2">{category}</td>
                        <td className="px-3 py-2">{value.total}</td>
                        <td className="px-3 py-2">{value.available}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <section aria-labelledby="top-report" className="rounded-xl border border-border bg-card p-4">
              <h3 id="top-report" className="font-heading text-lg font-semibold">
                Livros mais emprestados
              </h3>
              {stats.topBooks.length === 0 ? (
                <p className="mt-2 text-sm text-muted-foreground">Sem dados suficientes.</p>
              ) : (
                <ol className="mt-3 space-y-2">
                  {stats.topBooks.map((item, index) => (
                    <li key={item.title} className="flex items-center justify-between gap-3 rounded-lg bg-secondary/60 px-3 py-2 text-sm">
                      <span className="min-w-0 truncate">
                        {index + 1}. {item.title}
                      </span>
                      <span className="shrink-0 font-semibold">{item.count}</span>
                    </li>
                  ))}
                </ol>
              )}
            </section>

            <section aria-labelledby="status-report" className="rounded-xl border border-border bg-card p-4">
              <h3 id="status-report" className="font-heading text-lg font-semibold">
                Situação dos exemplares
              </h3>
              <ul className="mt-3 space-y-2 text-sm">
                {["disponivel", "emprestado", "manutencao", "danificado", "perdido", "inativo"].map((status) => {
                  const count = copies.filter((copy) => copy.status === status).length;
                  return (
                    <li key={status} className="flex items-center justify-between rounded-lg bg-secondary/60 px-3 py-2">
                      <span className="capitalize">{status}</span>
                      <span className="font-semibold">{count}</span>
                    </li>
                  );
                })}
              </ul>
            </section>
          </div>

          <section aria-labelledby="acervo-table" className="mt-6">
            <h3 id="acervo-table" className="mb-3 font-heading text-lg font-semibold">
              Acervo detalhado
            </h3>
            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full min-w-[640px] border-collapse text-sm">
                <caption className="sr-only">Acervo com contagem de exemplares</caption>
                <thead className="bg-secondary/70 text-left">
                  <tr>
                    <th scope="col" className="px-3 py-2 font-semibold">Título</th>
                    <th scope="col" className="px-3 py-2 font-semibold">Categoria</th>
                    <th scope="col" className="px-3 py-2 font-semibold">Exemplares</th>
                    <th scope="col" className="px-3 py-2 font-semibold">Disponíveis</th>
                  </tr>
                </thead>
                <tbody>
                  {books.map((book) => {
                    const counts = tally(book.id);
                    return (
                      <tr key={book.id} className="border-t border-border">
                        <td className="px-3 py-2">
                          <p className="font-medium">{book.title}</p>
                          <p className="text-xs text-muted-foreground">{book.authors}</p>
                        </td>
                        <td className="px-3 py-2">{book.category || "—"}</td>
                        <td className="px-3 py-2">{counts.total}</td>
                        <td className="px-3 py-2">{counts.available}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </div>
  );
}