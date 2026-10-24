const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

import PageHeader from "@/components/PageHeader";
import { Image } from "@/components/ui/image";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CopyStatusBadge } from "@/components/StatusBadge";
import { initials } from "@/lib/library";

export default function MemberBookDetail() {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [copies, setCopies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const [bookData, copyPage] = await Promise.all([
          db.entities.Book.get(id),
          db.entities.BookCopy.filter({ book_id: id }, { sort: "copy_code", limit: 100 })
        ]);
        if (!active) return;
        setBook(bookData);
        setCopies(copyPage.items || []);
      } catch (err) {
        if (active) setBook(null);
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [id]);

  if (loading) return <p className="text-sm text-muted-foreground">Carregando livro…</p>;
  if (!book) {
    return (
      <div>
        <p className="font-semibold">Livro não encontrado.</p>
        <Button asChild variant="outline" className="mt-3">
          <Link to="/membro/catalogo">Voltar ao catálogo</Link>
        </Button>
      </div>
    );
  }

  const available = copies.filter((copy) => copy.status === "disponivel").length;

  return (
    <div>
      <Button asChild variant="ghost" className="mb-3 -ml-2">
        <Link to="/membro/catalogo">
          <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
          Voltar ao catálogo
        </Link>
      </Button>

      <PageHeader eyebrow={book.category} title={book.title} description={book.authors} />

      <div className="grid gap-4 lg:grid-cols-[260px_1fr]">
        <div className="overflow-hidden rounded-xl border border-border bg-secondary">
          {book.cover_url ? (
            <Image src={book.cover_url} alt={`Capa de ${book.title}`} className="h-full w-full" fittingType="fit" />
          ) : (
            <span className="flex aspect-[3/4] w-full items-center justify-center font-display text-3xl font-semibold text-muted-foreground">
              {initials(book.title)}
            </span>
          )}
        </div>

        <div className="space-y-4">
          <section className="rounded-xl border border-border bg-card p-4">
            <h3 className="font-heading text-lg font-semibold">Disponibilidade</h3>
            <p className="mt-1 text-sm" role="status">
              {available > 0
                ? `${available} de ${copies.length} exemplar(es) disponível(is) para empréstimo.`
                : "Nenhum exemplar disponível no momento."}
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              Para emprestar, procure a equipe da biblioteca com sua identificação. Não há reserva automática pelo
              sistema.
            </p>
          </section>

          <section className="rounded-xl border border-border bg-card p-4">
            <h3 className="font-heading text-lg font-semibold">Ficha do livro</h3>
            <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
              {[
                ["Editora", book.publisher],
                ["Ano", book.publication_year],
                ["Edição", book.edition],
                ["ISBN", book.isbn],
                ["Idioma", book.language],
                ["Localização", book.physical_location]
              ].map(([label, value]) => (
                <div key={label}>
                  <dt className="text-xs uppercase tracking-wide text-muted-foreground">{label}</dt>
                  <dd className="font-medium">{value || "—"}</dd>
                </div>
              ))}
            </dl>
            {book.description ? <p className="mt-3 text-sm leading-relaxed">{book.description}</p> : null}
          </section>

          <section aria-labelledby="copies-status" className="rounded-xl border border-border bg-card p-4">
            <h3 id="copies-status" className="font-heading text-lg font-semibold">
              Exemplares
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Nenhum dado pessoal de outros leitores é exibido aqui.
            </p>
            {copies.length === 0 ? (
              <Alert className="mt-3">
                <AlertDescription>Este título ainda não possui exemplares cadastrados.</AlertDescription>
              </Alert>
            ) : (
              <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                {copies.map((copy) => (
                  <li key={copy.id} className="flex items-center justify-between gap-2 rounded-lg border border-border px-3 py-2">
                    <span className="font-mono text-sm font-semibold tracking-wider">{copy.copy_code}</span>
                    <CopyStatusBadge status={copy.status} />
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}