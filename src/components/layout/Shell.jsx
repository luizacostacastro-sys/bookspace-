const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { Menu, LogOut, BookMarked } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import AccessibilityDialog from "@/components/a11y/AccessibilityDialog";
import { useSession } from "@/hooks/useSession";
import { KIND_LABELS } from "@/lib/roles";

function Brand({ compact }) {
  return (
    <Link to="/" className="flex items-center gap-2.5 rounded-lg focus-visible:outline-none">
      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
        <BookMarked className="h-5 w-5" aria-hidden="true" />
      </span>
      <span className={compact ? "font-display text-lg font-semibold" : "font-display text-xl font-semibold"}>
        BookSpace
        <span className="text-sidebar-primary">.</span>
      </span>
    </Link>
  );
}

function NavList({ items, onNavigate }) {
  return (
    <nav aria-label="Menu principal" className="space-y-1">
      <ul className="space-y-1">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <li key={item.to}>
              <NavLink
                to={item.to}
                end={item.end}
                onClick={onNavigate}
                className={({ isActive }) =>
                  [
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                      : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
                  ].join(" ")
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                    <span className="leading-tight">{item.label}</span>
                    {isActive ? <span className="sr-only">(página atual)</span> : null}
                  </>
                )}
              </NavLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export default function Shell({ nav, title }) {
  const { user, role, settings } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await db.auth.logout();
    navigate("/", { replace: true });
  };

  const userBlock = (
    <div className="rounded-lg border border-sidebar-border/70 bg-sidebar-accent/30 p-3">
      <p className="truncate text-sm font-semibold">{user?.full_name || user?.email || "Visitante"}</p>
      <p className="truncate text-xs text-sidebar-foreground/70">{KIND_LABELS[role] || "Estudante"}</p>
      <Button
        variant="ghost"
        onClick={handleLogout}
        className="mt-2 w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground"
      >
        <LogOut className="mr-2 h-4 w-4" aria-hidden="true" />
        Sair do sistema
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-primary-foreground"
      >
        Ir para o conteúdo principal
      </a>

      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 flex-col justify-between bg-sidebar px-4 py-5 text-sidebar-foreground lg:flex">
        <div className="space-y-6">
          <div className="px-1">
            <Brand />
            <p className="mt-2 truncate text-xs text-sidebar-foreground/60">
              {settings.library_name || "Biblioteca escolar"}
            </p>
          </div>
          <div className="max-h-[calc(100vh-16rem)] overflow-y-auto pr-1">
            <NavList items={nav} />
          </div>
        </div>
        {userBlock}
      </aside>

      <div className="flex min-h-screen flex-col lg:pl-72">
        <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur">
          <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-10">
            <div className="flex items-center gap-3">
              <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon" className="lg:hidden" aria-label="Abrir menu de navegação">
                    <Menu className="h-5 w-5" aria-hidden="true" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[19rem] overflow-y-auto bg-sidebar p-4 text-sidebar-foreground">
                  <SheetHeader className="mb-4 text-left">
                    <SheetTitle className="text-sidebar-foreground">
                      <Brand compact />
                    </SheetTitle>
                  </SheetHeader>
                  <NavList items={nav} onNavigate={() => setMobileOpen(false)} />
                  <div className="mt-6">{userBlock}</div>
                </SheetContent>
              </Sheet>
              <div>
                <p className="text-xs uppercase tracking-widest text-muted-foreground">BookSpace</p>
                <h1 className="text-lg font-semibold leading-tight">{title}</h1>
              </div>
            </div>
            <AccessibilityDialog className="shrink-0" />
          </div>
        </header>

        <main id="conteudo" tabIndex={-1} className="flex-1 px-4 py-6 sm:px-6 lg:px-10">
          <div className="mx-auto w-full max-w-6xl">
            <Outlet />
          </div>
        </main>

        <footer className="border-t border-border px-4 py-4 text-xs text-muted-foreground sm:px-6 lg:px-10">
          BookSpace · {settings.library_name || "Biblioteca escolar"} — acessibilidade em construção contínua, com base nas
          WCAG 2.2 nível AA.
        </footer>
      </div>
    </div>
  );
}