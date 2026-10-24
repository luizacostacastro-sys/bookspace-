const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { isStaffRole, normalizeCode, roleOf } from "../../shared/libraryCore.ts";

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await db.auth.me();
    if (!user) return Response.json({ error: "Não autenticado." }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const code = normalizeCode(body.code);
    if (!code) return Response.json({ found: false, error: "Informe um código válido." }, { status: 400 });

    const byCode = await db.asServiceRole.entities.BookCopy.filter({ copy_code: code });
    let copy = (Array.isArray(byCode) ? byCode : byCode.items || [])[0];
    if (!copy) {
      const byQr = await db.asServiceRole.entities.BookCopy.filter({ qr_identifier: String(body.code || "").trim() });
      copy = (Array.isArray(byQr) ? byQr : byQr.items || [])[0];
    }
    if (!copy) return Response.json({ found: false });

    const books = await db.asServiceRole.entities.Book.filter({ id: copy.book_id });
    const book = (Array.isArray(books) ? books : books.items || [])[0] || null;

    const role = roleOf(user);
    const staff = isStaffRole(role);

    const activeRows = await db.asServiceRole.entities.Loan.filter({ copy_id: copy.id, status: "ativo" });
    const activeLoan = (Array.isArray(activeRows) ? activeRows : activeRows.items || [])[0] || null;

    let loan = null;
    if (activeLoan) {
      const isOwner = activeLoan.user_email === user.email;
      if (staff) {
        loan = {
          id: activeLoan.id,
          user_name: activeLoan.user_name,
          user_email: activeLoan.user_email,
          due_at: activeLoan.due_at,
          loaned_at: activeLoan.loaned_at
        };
      } else if (isOwner) {
        loan = { id: activeLoan.id, due_at: activeLoan.due_at, loaned_at: activeLoan.loaned_at, own: true };
      }
    }

    return Response.json({
      found: true,
      canOperate: staff,
      copy: {
        id: copy.id,
        copy_code: copy.copy_code,
        status: copy.status,
        physical_location: copy.physical_location || "",
        notes: copy.notes || "",
        book_id: copy.book_id
      },
      book: book
        ? {
            id: book.id,
            title: book.title,
            authors: book.authors,
            cover_url: book.cover_url || "",
            category: book.category || "",
            status: book.status
          }
        : null,
      loan
    });
  } catch (error) {
    return Response.json({ error: error.message || "Erro ao consultar o código." }, { status: 500 });
  }
}