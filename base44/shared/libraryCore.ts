const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

export const DEFAULT_SETTINGS = {
  key: "default",
  library_name: "Biblioteca Escolar BookSpace",
  school_name: "",
  loan_days_estudante: 7,
  loan_days_professor: 21,
  loan_days_funcionario: 14,
  loan_days_administrador: 30,
  max_loans_estudante: 2,
  max_loans_professor: 5,
  max_loans_funcionario: 5,
  max_loans_administrador: 10,
  renewal_days: 7,
  public_registration_enabled: true,
  approval_required: true,
  overdue_notice_days: 3
};

export const KINDS = ["estudante", "professor", "funcionario", "administrador"];

export function roleOf(user) {
  if (!user) return "visitante";
  if (user.role === "admin") return "administrador";
  const sr = user.staff_role || (user.data ? user.data.staff_role : null);
  if (KINDS.includes(sr)) return sr;
  return "estudante";
}

export function isStaffRole(role) {
  return role === "administrador" || role === "funcionario";
}

export function pickSettings(found) {
  return { ...DEFAULT_SETTINGS, ...(found || {}) };
}

export async function getSettings(base44) {
  const rows = await db.asServiceRole.entities.LibrarySettings.filter({ key: "default" });
  const list = Array.isArray(rows) ? rows : (rows && rows.items) || [];
  return pickSettings(list[0]);
}

export function todayISO() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(new Date());
}

export function addDaysISO(days, from) {
  const base = from ? new Date(from + "T12:00:00") : new Date();
  base.setDate(base.getDate() + Number(days || 0));
  return base.toISOString().slice(0, 10);
}

export function normalizeCode(raw) {
  let v = String(raw || "").trim();
  if (!v) return "";
  if (v.includes("bookspace:copy:")) v = v.split("bookspace:copy:").slice(-1)[0];
  const idx = v.indexOf("/c/");
  if (idx >= 0) v = v.slice(idx + 3);
  return v.trim().toUpperCase();
}

export function codePrefix(title) {
  const clean = String(title || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Za-z]/g, "")
    .toUpperCase();
  return clean.slice(0, 3) || "LIV";
}

export async function audit(base44, entry) {
  try {
    await db.asServiceRole.entities.AuditLog.create({
      action: entry.action,
      actor_email: entry.actor_email || "",
      actor_name: entry.actor_name || "",
      actor_role: entry.actor_role || "",
      entity_type: entry.entity_type || "",
      entity_id: entry.entity_id || "",
      outcome: entry.outcome || "sucesso",
      details: entry.details ? String(entry.details).slice(0, 500) : ""
    });
  } catch (error) {
    // auditoria nunca deve interromper a operação principal
  }
}

export async function findProfile(base44, email) {
  if (!email) return null;
  const rows = await db.asServiceRole.entities.MemberProfile.filter({ user_email: email });
  const list = Array.isArray(rows) ? rows : (rows && rows.items) || [];
  return list[0] || null;
}

export async function activeLoansOf(base44, email) {
  const rows = await db.asServiceRole.entities.Loan.filter({ user_email: email, status: "ativo" });
  return Array.isArray(rows) ? rows : (rows && rows.items) || [];
}