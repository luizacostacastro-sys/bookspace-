import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { isStaffRole, roleOf, todayISO } from "../../shared/libraryCore.ts";

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await db.auth.me();
    if (!user) return Response.json({ error: "Não autenticado." }, { status: 401 });
    const role = roleOf(user);
    if (!isStaffRole(role)) {
      return Response.json({ error: "Acesso restrito à equipe da biblioteca." }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const resource = String(body.resource || "loans");
    const today = todayISO();
    const db = db.asServiceRole.entities;

    if (resource === "loans" || resource === "overdue" || resource === "history") {
      const query = resource === "history" ? {} : { status: "ativo" };
      const rows = await db.Loan.filter(query, { sort: "-loaned_at", limit: 400 });
      let items = Array.isArray(rows) ? rows : rows.items || [];
      if (resource === "overdue") items = items.filter((loan) => loan.status === "ativo" && loan.due_at < today);
      if (resource === "history") items = items.filter((loan) => loan.status !== "ativo");
      const profileRows = await db.MemberProfile.list({ limit: 500 });
      const profiles = Array.isArray(profileRows) ? profileRows : profileRows.items || [];
      const classByEmail = {};
      profiles.forEach((profile) => {
        classByEmail[profile.user_email] = profile.class_or_department || "";
      });
      items = items.map((loan) => ({
        ...loan,
        class_or_department: classByEmail[loan.user_email] || ""
      }));
      const q = String(body.q || "").trim().toLowerCase();
      if (q) {
        items = items.filter((loan) =>
          [loan.user_name, loan.user_email, loan.copy_code, loan.book_title, loan.class_or_department]
            .filter(Boolean)
            .some((value) => String(value).toLowerCase().includes(q))
        );
      }
      return Response.json({ items: items.slice(0, 200) });
    }

    if (resource === "users") {
      const profiles = await db.MemberProfile.list({ sort: "-created_date", limit: 500 });
      const users = await db.User.list();
      const profileList = Array.isArray(profiles) ? profiles : profiles.items || [];
      const userList = Array.isArray(users) ? users : users.items || [];
      const byEmail = {};
      userList.forEach((u) => {
        byEmail[u.email] = u;
      });
      const items = profileList.map((profile) => ({
        ...profile,
        account_role: byEmail[profile.user_email] ? byEmail[profile.user_email].role : "user",
        account_id: byEmail[profile.user_email] ? byEmail[profile.user_email].id : null
      }));
      const q = String(body.q || "").trim().toLowerCase();
      const filtered = q
        ? items.filter((item) =>
            [item.full_name, item.user_email, item.matricula, item.class_or_department]
              .filter(Boolean)
              .some((value) => String(value).toLowerCase().includes(q))
          )
        : items;
      return Response.json({ items: filtered.slice(0, 300) });
    }

    if (resource === "stats") {
      const [books, copies, available, loaned, users, activeLoans] = await Promise.all([
        db.Book.count({ status: "ativo" }),
        db.BookCopy.count(),
        db.BookCopy.count({ status: "disponivel" }),
        db.BookCopy.count({ status: "emprestado" }),
        db.MemberProfile.count(),
        db.Loan.filter({ status: "ativo" }, { sort: "-loaned_at", limit: 300 })
      ]);
      const active = Array.isArray(activeLoans) ? activeLoans : activeLoans.items || [];
      const overdue = active.filter((loan) => loan.due_at < today);
      const historyRows = await db.Loan.filter({ status: "devolvido" }, { sort: "-returned_at", limit: 300 });
      const history = Array.isArray(historyRows) ? historyRows : historyRows.items || [];
      const tally = {};
      history.concat(active).forEach((loan) => {
        const key = loan.book_title || "Sem título";
        tally[key] = (tally[key] || 0) + 1;
      });
      const topBooks = Object.keys(tally)
        .map((title) => ({ title, count: tally[title] }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);
      return Response.json({
        stats: {
          books,
          copies,
          available,
          loaned,
          overdue: overdue.length,
          activeLoans: active.length,
          users,
          topBooks
        },
        recentLoans: active.slice(0, 5),
        recentReturns: history.slice(0, 5),
        overdueList: overdue.slice(0, 5)
      });
    }

    return Response.json({ error: "Recurso desconhecido." }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message || "Erro ao carregar dados operacionais." }, { status: 500 });
  }
}