import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { audit, findProfile, KINDS, roleOf } from "../../shared/libraryCore.ts";

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await db.auth.me();
    if (!user) return Response.json({ error: "Não autenticado." }, { status: 401 });
    const role = roleOf(user);
    if (role !== "administrador" || user.role !== "admin") {
      await audit(base44, {
        action: "gestão de usuários negada",
        actor_email: user.email,
        actor_role: role,
        outcome: "negado"
      });
      return Response.json({ error: "Apenas administradores podem gerenciar contas." }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const action = String(body.action || "");
    const db = db.asServiceRole.entities;
    const kind = KINDS.includes(body.kind) ? body.kind : "estudante";

    if (action === "invite") {
      const email = String(body.email || "").trim().toLowerCase();
      if (!email || !email.includes("@")) return Response.json({ error: "Informe um e-mail válido." }, { status: 400 });

      const className = String(body.class_or_department || "").trim().slice(0, 120);
      if (kind === "estudante" && !className) {
        return Response.json({ error: "Informe a turma do estudante." }, { status: 400 });
      }

      await db.asServiceRole.users.inviteUser(email, kind === "administrador" ? "admin" : "user");

      const users = await db.User.filter({ email });
      const invited = (Array.isArray(users) ? users : users.items || [])[0];
      if (invited) {
        await db.User.update(invited.id, { staff_role: kind });
      }
      const profile = await findProfile(base44, email);
      if (profile) {
        await db.MemberProfile.update(profile.id, {
          kind,
          status: "ativo",
          full_name: body.full_name || profile.full_name,
          class_or_department: className || profile.class_or_department || ""
        });
      } else {
        await db.MemberProfile.create({
          user_id: invited ? invited.id : "",
          user_email: email,
          full_name: String(body.full_name || email).slice(0, 160),
          matricula: String(body.matricula || "").slice(0, 40),
          kind,
          class_or_department: className,
          status: "ativo"
        });
      }
      await audit(base44, {
        action: "convite de usuário enviado",
        actor_email: user.email,
        actor_name: user.full_name,
        actor_role: role,
        entity_type: "User",
        entity_id: email,
        details: kind
      });
      return Response.json({ ok: true });
    }

    if (action === "approve" || action === "block" || action === "reactivate") {
      const profileId = String(body.profile_id || "");
      const profile = await db.MemberProfile.get(profileId);
      if (!profile) return Response.json({ error: "Perfil não encontrado." }, { status: 404 });
      const status = action === "approve" ? "ativo" : action === "block" ? "bloqueado" : "ativo";
      await db.MemberProfile.update(profile.id, { status });
      await audit(base44, {
        action: action === "block" ? "usuário bloqueado" : "cadastro aprovado",
        actor_email: user.email,
        actor_name: user.full_name,
        actor_role: role,
        entity_type: "MemberProfile",
        entity_id: profile.id,
        details: profile.user_email
      });
      return Response.json({ ok: true, status });
    }

    if (action === "set_class") {
      const profileId = String(body.profile_id || "");
      const className = String(body.class_or_department || "").trim().slice(0, 120);
      const profile = await db.MemberProfile.get(profileId);
      if (!profile) return Response.json({ error: "Perfil não encontrado." }, { status: 404 });
      if (profile.kind === "estudante" && !className) {
        return Response.json({ error: "Informe a turma do estudante." }, { status: 400 });
      }
      await db.MemberProfile.update(profile.id, { class_or_department: className });
      await audit(base44, {
        action: "turma atualizada",
        actor_email: user.email,
        actor_name: user.full_name,
        actor_role: role,
        entity_type: "MemberProfile",
        entity_id: profile.id,
        details: profile.user_email + " → " + (className || "sem turma")
      });
      return Response.json({ ok: true });
    }

    if (action === "set_kind") {
      const email = String(body.email || "").trim().toLowerCase();
      const profile = await findProfile(base44, email);
      if (!profile) return Response.json({ error: "Perfil não encontrado." }, { status: 404 });
      await db.MemberProfile.update(profile.id, { kind });

      const users = await db.User.filter({ email });
      const target = (Array.isArray(users) ? users : users.items || [])[0];
      if (target) {
        await db.User.update(target.id, {
          staff_role: kind,
          role: kind === "administrador" ? "admin" : "user"
        });
      }
      if (target && target.id === user.id && kind !== "administrador") {
        return Response.json(
          { error: "Você não pode remover seu próprio acesso administrativo." },
          { status: 409 }
        );
      }
      await audit(base44, {
        action: "perfil de acesso alterado",
        actor_email: user.email,
        actor_name: user.full_name,
        actor_role: role,
        entity_type: "MemberProfile",
        entity_id: profile.id,
        details: email + " → " + kind
      });
      return Response.json({ ok: true });
    }

    return Response.json({ error: "Ação desconhecida." }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message || "Erro ao gerenciar usuário." }, { status: 500 });
  }
}