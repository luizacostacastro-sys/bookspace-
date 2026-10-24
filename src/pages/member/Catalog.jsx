const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Search } from "lucide-react";

import PageHeader from "@/components/PageHeader";
import { Image } from "@/components/ui/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { initials } from "@/lib/library";

export default function Catalog() {
  const [params] = useSearchParams();
  const [query, setQuery] = useState(params.get("q") || "");
  const [category, setCategory] = useState("todas");
  const [availability, setAvailability] = useState("todos");
  const [books, setBooks] = useState([]);
  const [copies, setCopies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const [bookPage, copyPage] = await Promise.all([
          db.entities.Book.filter({ status: "ativo" }, { sort: "title", limit: 300 }),
          db.entities.BookCopy.filter({}, { limit: 900 })
        ]);
        if (!active) return;
        setBooks(bookPage.items || []);
        setCopies(copyPage.items || []);
      } catch (err) {
        if (active) setError("Não foi possível carregar o catálogo agora.");
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    setQuery(params.get("q") || "");
  }, [params]);

  const counts = useMemo(() => {
    const map = {};
    copies.forEach((copy) => {
      if (!map[copy.book_id]) map[copy.book_id] = { total: 0, available: 0 };
      map[copy.book_id].total += 1;
      if (copy.status === "disponivel") map[copy.book_id].available += 1;
    });
    return map;
  }, [copies]);

  const categories = Array.from(new Set(books.map((book) => book.category).filter(Boolean))).sort();

  const visible = books.filter((book) => {
    const info = counts[book.id] || { total: 0, available: 0 };
    if (category !== "todas" && book.category !== category) return false;
    if (availability === "disponivel" && info.available === 0) return false;
    if (availability === "indisponivel" && info.available > 0) return false;
    if (!query.trim()) return true;
    const term = query.trim().toLowerCase();
    return [book.title, book.authors, book.isbn, book.category, book.publisher]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(term));
  });

  return (
    <div>
      <PageHeader
        title="Buscar livros"
        description="Pesquise por título, autor, ISBN, categoria ou editora. A disponibilidade é atualizada em tempo real."
      />

      {error ? (
        <Alert variant="destructive" role="alert" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        <div>
          <Label htmlFor="catalog-search">Buscar</Label>
          <div className="relative mt-1.5">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <Input
              id="catalog-search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="pl-9"
              placeholder="Ex.: Machado de Assis"
            />
          </div>
        </div>
        <div>
          <Label htmlFor="catalog-category">Categoria</Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger id="catalog-category" className="mt-1.5">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas as categorias</SelectItem>
              {categories.map((item) => (
                <SelectItem key={item} value={item}>
                  {item}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="catalog-availability">Disponibilidade</Label>
          <Select value={availability} onValueChange={setAvailability}>
            <SelectTrigger id="catalog-availability" className="mt-1.5">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="disponivel">Somente disponíveis</SelectItem>
              <SelectItem value="indisponivel">Sem exemplar disponível</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <p className="mb-3 text-sm text-muted-foreground" role="status">
        {loading ? "Carregando catálogo…" : `${visible.length} livro(s) encontrados`}
      </p>

      {!loading && visible.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-8 text-center">
          <p className="font-semibold">Nenhum livro encontrado</p>
          <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
            Tente outro termo ou ajuste os filtros. Você também pode procurar a equipe da biblioteca.
          </p>
          <Button
            className="mt-4"
            variant="outline"
            onClick={() => {
              setQuery("");
              setCategory("todas");
              setAvailability("todos");
            }}
          >
            Limpar filtros
          </Button>
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((book) => {
            const info = counts[book.id] || { total: 0, available: 0 };
            return (
              <li key={book.id} className="rounded-xl border border-border bg-card p-4">
                <div className="flex gap-3">
                  <div className="h-28 w-20 shrink-0 overflow-hidden rounded-md bg-secondary">
                    {book.cover_url ? (
                      <Image src={book.cover_url} alt={`Capa de ${book.title}`} className="h-full w-full" fittingType="fill" />
                    ) : (
                      <span className="flex h-full w-full items-center justify-center font-display text-lg font-semibold text-muted-foreground">
                        {initials(book.title)}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-heading text-lg font-semibold leading-snug">{book.title}</h3>
                    <p className="text-sm text-muted-foreground">{book.authors}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{book.category || "Sem categoria"}</p>
                    <p className="mt-2 text-sm font-medium">
                      {info.available > 0
                        ? `${info.available} de ${info.total} exemplar(es) disponível(is)`
                        : "Nenhum exemplar disponível no momento"}
                    </p>
                  </div>
                </div>
                {book.description ? (
                  <p className="mt-3 line-clamp-3 text-sm text-muted-foreground">{book.description}</p>
                ) : null}
                <Button asChild variant="outline" className="mt-3 w-full">
                  <Link to={`/membro/livros/${book.id}`}>Ver detalhes</Link>
                </Button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}