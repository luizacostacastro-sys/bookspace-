import { Link } from "react-router-dom";
import { ArrowRight, BookMarked, ShieldCheck, GraduationCap, ScanLine, Type } from "lucide-react";
import { Button } from "@/components/ui/button";
import AccessibilityDialog from "@/components/a11y/AccessibilityDialog";
import { useSession } from "@/hooks/useSession";

export default function Landing() {
  const { user, role, isStaff } = useSession();
  const panelPath = isStaff ? "/admin" : "/membro";

  return (
    <div className="min-h-screen paper">
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-primary-foreground"
      >
        Ir para o conteúdo principal
      </a>

      <header className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-5 py-5">
        <div className="flex items-center gap-2.5">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <BookMarked className="h-5 w-5" aria-hidden="true" />
          </span>
          <span className="font-display text-xl font-semibold">
            BookSpace<span className="text-accent">.</span>
          </span>
        </div>
        <AccessibilityDialog />
      </header>

      <main id="conteudo" className="mx-auto w-full max-w-6xl px-5 pb-16">
        <section className="grid gap-8 py-8 lg:grid-cols-[1.05fr_1fr] lg:items-center lg:py-14">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Biblioteca escolar
            </p>
            <h1 className="mt-5 font-display text-4xl font-semibold leading-[1.05] sm:text-5xl lg:text-6xl">
              Todo livro no lugar certo, todo leitor bem atendido.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              Acervo, exemplares, QR Codes, empréstimos e devoluções em um só sistema — com leitura acessível
              para estudantes, professores e equipe da biblioteca.
            </p>
            {user ? (
              <div className="mt-7 rounded-xl border border-primary/30 bg-card p-5">
                <p className="text-sm font-semibold">Você já está conectado como {user.full_name || user.email}.</p>
                <Button asChild className="mt-3">
                  <Link to={panelPath}>
                    Ir para o meu painel
                    <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                  </Link>
                </Button>
              </div>
            ) : (
              <ul className="mt-7 grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
                <li className="flex items-center gap-2">
                  <ScanLine className="h-4 w-4 text-primary" aria-hidden="true" /> Leitura por QR Code com alternativa manual
                </li>
                <li className="flex items-center gap-2">
                  <Type className="h-4 w-4 text-primary" aria-hidden="true" /> Texto ampliável, alto contraste e leitura em voz alta
                </li>
              </ul>
            )}
          </div>

          <div className="grid gap-4" aria-label="Escolha o seu tipo de acesso">
            <section
              aria-labelledby="acesso-admin"
              className="rounded-2xl border border-primary/25 bg-primary p-6 text-primary-foreground shadow-sm"
            >
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5" aria-hidden="true" />
                <h2 id="acesso-admin" className="font-heading text-2xl font-semibold">
                  Administração da biblioteca
                </h2>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-primary-foreground/85">
                Para administradores e funcionários autorizados: cadastro do acervo, exemplares, QR Codes,
                empréstimos, relatórios e auditoria.
              </p>
              <div className="mt-5 space-y-3">
                <Button asChild size="lg" className="w-full bg-primary-foreground text-primary hover:bg-primary-foreground/90">
                  <Link to="/admin/entrar">
                    Entrar como Administrador
                    <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                  </Link>
                </Button>
                <Link
                  to="/admin/primeiro-acesso"
                  className="block text-center text-sm font-semibold text-primary-foreground underline underline-offset-4"
                >
                  Primeiro acesso? Cadastrar administrador
                </Link>
              </div>
            </section>

            <section aria-labelledby="acesso-usuario" className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <div className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-primary" aria-hidden="true" />
                <h2 id="acesso-usuario" className="font-heading text-2xl font-semibold">
                  Acesso de usuários
                </h2>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Estudantes, professores e funcionários: pesquise o acervo, consulte a disponibilidade e
                acompanhe seus empréstimos e prazos.
              </p>
              <div className="mt-5 space-y-3">
                <Button asChild size="lg" variant="outline" className="w-full">
                  <Link to="/entrar">
                    Entrar como Usuário
                    <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                  </Link>
                </Button>
                <Link
                  to="/register"
                  className="block text-center text-sm font-semibold text-primary underline underline-offset-4"
                >
                  Criar conta
                </Link>
              </div>
            </section>
          </div>
        </section>

        <section aria-labelledby="a11y-title" className="rounded-2xl border border-border bg-card p-6 sm:p-8">
          <h2 id="a11y-title" className="font-heading text-2xl font-semibold">
            Acessibilidade em primeiro lugar
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            O BookSpace foi desenhado para pessoas autistas, com dislexia, daltonismo, baixa visão, glaucoma,
            deficiência auditiva, cegueira ou dificuldades motoras. Nenhum recurso de acessibilidade exige
            informar diagnóstico.
          </p>
          <ul className="mt-5 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
            {[
              "Texto ampliável até 200% com espaçamento ajustável",
              "Temas claro, escuro e alto contraste",
              "Navegação completa por teclado e foco visível",
              "Estados sempre descritos por texto e ícone, nunca só cor",
              "Leitura em voz alta das páginas",
              "Alternativa digitada para todo QR Code"
            ].map((item) => (
              <li key={item} className="flex items-start gap-2 rounded-lg bg-secondary/60 p-3">
                <span aria-hidden="true" className="mt-1 h-2 w-2 shrink-0 rounded-full bg-accent" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>
      </main>

      <footer className="border-t border-border/70 px-5 py-6">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>BookSpace · gerenciamento de biblioteca escolar</p>
          <p>Perfil atual: {role === "visitante" ? "visitante" : role}</p>
        </div>
      </footer>
    </div>
  );
}