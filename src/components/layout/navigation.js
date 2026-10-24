import {
  LayoutDashboard,
  BookOpen,
  Layers,
  QrCode,
  Printer,
  ScanLine,
  Users,
  UserCog,
  BookOpenCheck,
  Undo2,
  AlarmClock,
  History,
  BarChart3,
  Settings,
  ShieldCheck,
  HelpCircle,
  User,
  Accessibility,
  Search
} from "lucide-react";

export const ADMIN_NAV = [
  { to: "/admin", label: "Painel", icon: LayoutDashboard, end: true },
  { to: "/admin/livros", label: "Livros", icon: BookOpen },
  { to: "/admin/exemplares", label: "Exemplares", icon: Layers },
  { to: "/admin/qrcodes", label: "Gerador de QR Codes", icon: QrCode },
  { to: "/admin/etiquetas", label: "Impressão de etiquetas", icon: Printer },
  { to: "/admin/leitor", label: "Leitor de QR Code", icon: ScanLine },
  { to: "/admin/emprestimos", label: "Empréstimos", icon: BookOpenCheck },
  { to: "/admin/devolucoes", label: "Devoluções", icon: Undo2 },
  { to: "/admin/atrasos", label: "Empréstimos em atraso", icon: AlarmClock },
  { to: "/admin/historico", label: "Histórico", icon: History },
  { to: "/admin/usuarios", label: "Usuários", icon: Users },
  { to: "/admin/equipe", label: "Equipe e administradores", icon: UserCog, permission: "equipe:manage" },
  { to: "/admin/relatorios", label: "Relatórios", icon: BarChart3, permission: "relatorios:view" },
  { to: "/admin/configuracoes", label: "Configurações", icon: Settings, permission: "configuracoes:edit" },
  { to: "/admin/auditoria", label: "Auditoria e segurança", icon: ShieldCheck, permission: "auditoria:view" },
  { to: "/perfil", label: "Meu perfil", icon: User },
  { to: "/acessibilidade", label: "Acessibilidade", icon: Accessibility },
  { to: "/ajuda", label: "Ajuda e documentação", icon: HelpCircle }
];

export const MEMBER_NAV = [
  { to: "/membro", label: "Início", icon: LayoutDashboard, end: true },
  { to: "/membro/catalogo", label: "Buscar livros", icon: Search },
  { to: "/membro/emprestimos", label: "Meus empréstimos", icon: BookOpen },
  { to: "/perfil", label: "Meu perfil", icon: User },
  { to: "/acessibilidade", label: "Acessibilidade", icon: Accessibility },
  { to: "/ajuda", label: "Ajuda", icon: HelpCircle }
];

export const STAFF_NAV = ADMIN_NAV.filter((item) =>
  ["/admin", "/admin/livros", "/admin/exemplares", "/admin/leitor", "/admin/emprestimos", "/admin/devolucoes", "/admin/usuarios"].includes(
    item.to
  )
);