const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";

const EMPTY = {
  title: "",
  authors: "",
  isbn: "",
  publisher: "",
  publication_year: "",
  edition: "",
  category: "",
  description: "",
  language: "Português",
  cover_url: "",
  physical_location: "",
  notes: ""
};

export default function BookForm({ open, onOpenChange, book, onSaved }) {
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setError("");
      if (book) {
        const next = { ...EMPTY };
        Object.keys(EMPTY).forEach((key) => {
          next[key] = book[key] === undefined || book[key] === null ? "" : book[key];
        });
        setForm(next);
      } else {
        setForm(EMPTY);
      }
    }
  }, [open, book]);

  const set = (key) => (event) => setForm({ ...form, [key]: event.target.value });

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    if (!form.title.trim() || !form.authors.trim()) {
      setError("Título e autor são obrigatórios.");
      return;
    }
    setSaving(true);
    try {
      const payload = { ...form, publication_year: form.publication_year ? Number(form.publication_year) : null };
      const response = await db.functions.invoke("libraryWrite", {
        action: book ? "book.update" : "book.create",
        id: book?.id,
        book: payload
      });
      if (response.data?.error) {
        setError(response.data.error);
        setSaving(false);
        return;
      }
      onSaved?.(response.data.book);
      onOpenChange(false);
    } catch (err) {
      setError(err?.response?.data?.error || "Não foi possível salvar o livro.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{book ? "Editar livro" : "Cadastrar livro"}</DialogTitle>
          <DialogDescription>
            Dados bibliográficos do título. Depois de salvar, cadastre os exemplares físicos na página do livro.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-4" noValidate>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label htmlFor="book-title">Título *</Label>
              <Input id="book-title" required value={form.title} onChange={set("title")} className="mt-1.5" />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="book-authors">Autor(es) *</Label>
              <Input id="book-authors" required value={form.authors} onChange={set("authors")} className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="book-isbn">ISBN</Label>
              <Input id="book-isbn" value={form.isbn} onChange={set("isbn")} className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="book-publisher">Editora</Label>
              <Input id="book-publisher" value={form.publisher} onChange={set("publisher")} className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="book-year">Ano de publicação</Label>
              <Input
                id="book-year"
                type="number"
                min="0"
                max="2200"
                value={form.publication_year}
                onChange={set("publication_year")}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="book-edition">Edição</Label>
              <Input id="book-edition" value={form.edition} onChange={set("edition")} className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="book-category">Categoria / gênero</Label>
              <Input id="book-category" value={form.category} onChange={set("category")} className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="book-language">Idioma</Label>
              <Input id="book-language" value={form.language} onChange={set("language")} className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="book-location">Localização física</Label>
              <Input
                id="book-location"
                value={form.physical_location}
                onChange={set("physical_location")}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="book-cover">URL da capa (opcional)</Label>
              <Input id="book-cover" value={form.cover_url} onChange={set("cover_url")} className="mt-1.5" />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="book-description">Descrição</Label>
              <Textarea
                id="book-description"
                rows={3}
                value={form.description}
                onChange={set("description")}
                className="mt-1.5"
              />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="book-notes">Observações internas</Label>
              <Textarea id="book-notes" rows={2} value={form.notes} onChange={set("notes")} className="mt-1.5" />
            </div>
          </div>

          {error ? (
            <Alert variant="destructive" role="alert">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Salvando…" : book ? "Salvar alterações" : "Cadastrar livro"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}