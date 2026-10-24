const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { audit, roleOf } from "../../shared/libraryCore.ts";

const ALLOWED = ["acesso_negado", "login_falha", "login_sucesso", "logout", "qr_leitura_erro"];

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await db.auth.me();
    if (!user) return Response.json({ error: "Não autenticado." }, { status: 401 });
    const body = await req.json().catch(() => ({}));
    const action = String(body.action || "");
    if (!ALLOWED.includes(action)) return Response.json({ error: "Evento não permitido." }, { status: 400 });

    await audit(base44, {
      action,
      actor_email: user.email,
      actor_name: user.full_name,
      actor_role: roleOf(user),
      outcome: action === "login_sucesso" || action === "logout" ? "sucesso" : "negado",
      details: String(body.details || "").slice(0, 400)
    });
    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}