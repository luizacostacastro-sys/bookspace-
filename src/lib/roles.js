export const KIND_LABELS = {
  estudante: "Estudante",
  professor: "Professor(a)",
  funcionario: "Funcionário(a) da biblioteca",
  administrador: "Administrador(a)"
};

export const KIND_OPTIONS = ["estudante", "professor", "funcionario"];

export function roleOf(user) {
  if (!user) return "visitante";
  if (user.role === "admin") return "administrador";
  const sr = user.staff_role || (user.data ? user.data.staff_role : null);
  if (["administrador", "funcionario", "professor", "estudante"].includes(sr)) return sr;
  return "estudante";
}

export function isStaffRole(role) {
  return role === "administrador" || role === "funcionario";
}

const PERMISSIONS = {
  administrador: [
    "acervo:write",
    "emprestimos:operate",
    "usuarios:view",
    "usuarios:manage",
    "equipe:manage",
    "configuracoes:edit",
    "relatorios:view",
    "auditoria:view"
  ],
  funcionario: ["acervo:write", "emprestimos:operate", "usuarios:view"],
  professor: [],
  estudante: []
};

export function can(role, permission) {
  return (PERMISSIONS[role] || []).includes(permission);
}