const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { audit, codePrefix, isStaffRole, normalizeCode, roleOf } from "../../shared/libraryCore.ts";

const BOOK_FIELDS = [
  "title",
  "authors",
  "isbn",
  "publisher",
  "publication_year",
  "edition",
  "category",
  "description",
  "language",
  "cover_url",
  "physical_location",
  "notes"
];

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await db.auth.me();
    if (!user) return Response.json({ error: "Não autenticado." }, { status: 401 });
    const role = roleOf(user);
    if (!isStaffRole(role)) {
      await audit(base44, {
        action: "tentativa de alteração no acervo negada",
        actor_email: user.email,
        actor_role: role,
        outcome: "negado"
      });
      return Response.json({ error: "Apenas a equipe da biblioteca pode alterar o acervo." }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const action = String(body.action || "");

    const cleanBook = (input) => {
      const out = {};
      BOOK_FIELDS.forEach((field) => {
        if (input[field] !== undefined && input[field] !== null) {
          out[field] = input[field];
        }
      });
      if (out.publication_year !== undefined) out.publication_year = Number(out.publication_year) || null;
      if (out.title) out.title = String(out.title).trim().slice(0, 300);
      if (out.authors) out.authors = String(out.authors).trim().slice(0, 300);
      return out;
    };

    if (action === "book.create") {
      const patch = cleanBook(body.book || {});
      if (!patch.title || !patch.authors) {
        return Response.json({ error: "Informe título e autor." }, { status: 400 });
      }
      const book = await db.asServiceRole.entities.Book.create({ ...patch, status: "ativo" });
      await audit(base44, {
        action: "livro cadastrado",
        actor_email: user.email,
        actor_name: user.full_name,
        actor_role: role,
        entity_type: "Book",
        entity_id: book.id,
        details: book.title
      });
      return Response.json({ ok: true, book });
    }

    if (action === "book.update") {
      const id = String(body.id || "");
      if (!id) return Response.json({ error: "Livro não informado." }, { status: 400 });
      const patch = cleanBook(body.book || {});
      const book = await db.asServiceRole.entities.Book.update(id, patch);
      await audit(base44, {
        action: "livro atualizado",
        actor_email: user.email,
        actor_role: role,
        entity_type: "Book",
        entity_id: id,
        details: book ? book.title : ""
      });
      return Response.json({ ok: true, book });
    }

    if (action === "book.status") {
      const id = String(body.id || "");
      const status = body.status === "ativo" ? "ativo" : "inativo";
      const book = await db.asServiceRole.entities.Book.update(id, { status });
      await audit(base44, {
        action: status === "ativo" ? "livro reativado" : "livro desativado",
        actor_email: user.email,
        actor_role: role,
        entity_type: "Book",
        entity_id: id,
        details: book ? book.title : ""
      });
      return Response.json({ ok: true, book });
    }

    if (action === "copies.create") {
      const bookId = String(body.book_id || "");
      const count = Math.min(Math.max(Number(body.count) || 1, 1), 50);
      const book = await db.asServiceRole.entities.Book.get(bookId);
      if (!book) return Response.json({ error: "Livro não encontrado." }, { status: 404 });

      const existing = await db.asServiceRole.entities.BookCopy.filter({ book_id: bookId });
      const siblings = Array.isArray(existing) ? existing : existing.items || [];
      const prefix = codePrefix(book.title);
      let nextNumber = 1;
      siblings.forEach((copy) => {
        const match = String(copy.copy_code || "").match(/(\d+)$/);
        if (match) nextNumber = Math.max(nextNumber, Number(match[1]) + 1);
      });

      const toCreate = [];
      for (let i = 0; i < count; i++) {
        let code = prefix + "-" + String(nextNumber).padStart(4, "0");
        let guard = 0;
        while (guard < 200) {
          const clash = await db.asServiceRole.entities.BookCopy.filter({ copy_code: code });
          if ((Array.isArray(clash) ? clash : clash.items || []).length === 0) break;
          nextNumber += 1;
          code = prefix + "-" + String(nextNumber).padStart(4, "0");
          guard += 1;
        }
        nextNumber += 1;
        toCreate.push({
          book_id: bookId,
          book_title: book.title,
          book_authors: book.authors || "",
          copy_code: code,
          qr_identifier: "bookspace:copy:" + code,
          status: "disponivel",
          physical_location: String(body.physical_location || book.physical_location || "").slice(0, 120),
          notes: String(body.notes || "").slice(0, 400)
        });
      }

      const copies = await db.asServiceRole.entities.BookCopy.bulkCreate(toCreate);
      await audit(base44, {
        action: "exemplares cadastrados",
        actor_email: user.email,
        actor_role: role,
        entity_type: "Book",
        entity_id: bookId,
        details: count + " exemplar(es) de " + book.title
      });
      return Response.json({ ok: true, copies });
    }

    if (action === "copy.update") {
      const id = String(body.id || "");
      const copy = await db.asServiceRole.entities.BookCopy.get(id);
      if (!copy) return Response.json({ error: "Exemplar não encontrado." }, { status: 404 });

      const patch = {};
      if (body.physical_location !== undefined) patch.physical_location = String(body.physical_location).slice(0, 120);
      if (body.notes !== undefined) patch.notes = String(body.notes).slice(0, 400);
      if (body.status !== undefined) {
        const allowed = ["disponivel", "manutencao", "danificado", "perdido", "inativo"];
        if (!allowed.includes(body.status)) {
          return Response.json(
            { error: "O estado “emprestado” só é definido pelo registro de empréstimo." },
            { status: 400 }
          );
        }
        const activeLoans = await db.asServiceRole.entities.Loan.filter({ copy_id: id, status: "ativo" });
        const hasActive = (Array.isArray(activeLoans) ? activeLoans : activeLoans.items || []).length > 0;
        if (hasActive && body.status !== "manutencao" && body.status !== "perdido" && body.status !== "danificado") {
          return Response.json(
            { error: "Este exemplar possui empréstimo ativo. Registre a devolução antes de alterar o estado." },
            { status: 409 }
          );
        }
        patch.status = body.status;
      }

      const updated = await db.asServiceRole.entities.BookCopy.update(id, patch);
      await audit(base44, {
        action: "exemplar atualizado",
        actor_email: user.email,
        actor_role: role,
        entity_type: "BookCopy",
        entity_id: id,
        details: copy.copy_code + (patch.status ? " → " + patch.status : "")
      });
      return Response.json({ ok: true, copy: updated });
    }

    return Response.json({ error: "Ação desconhecida." }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message || "Erro ao salvar no acervo." }, { status: 500 });
  }
}