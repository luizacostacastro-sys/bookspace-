import Shell from "@/components/layout/Shell";
import { ADMIN_NAV, MEMBER_NAV } from "@/components/layout/navigation";
import { useSession } from "@/hooks/useSession";
import { can } from "@/lib/roles";

export default function Layout() {
  const { role, isStaff } = useSession();
  const base = isStaff ? ADMIN_NAV : MEMBER_NAV;
  const nav = base.filter((item) => !item.permission || can(role, item.permission));
  const title = isStaff ? "Painel da biblioteca" : "Área do leitor";

  return <Shell nav={nav} title={title} />;
}