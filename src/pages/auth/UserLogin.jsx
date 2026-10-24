const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useState } from "react";
import { Link } from "react-router-dom";
import { Eye, EyeOff, Loader2, LogIn } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import AuthShell from "@/components/auth/AuthShell";
import { roleOf } from "@/lib/roles";

export default function UserLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      await db.auth.loginViaEmailPassword(email.trim(), password);
      const me = await db.auth.me();
      const role = roleOf(me);
      if (role === "administrador" || role === "funcionario") {
        window.location.href = "/admin";
        return;
      }
      const rows = await db.entities.MemberProfile.filter({ user_email: me.email });
      const list = Array.isArray(rows) ? rows : rows.items || [];
      window.location.href = list.length ? "/membro" : "/onboarding";
    } catch (err) {
      setError("Não foi possível entrar. Confira o e-mail e a senha informados.");
      setLoading(false);
    }
  };

  return (
    <AuthShell
      eyebrow="Área do leitor"
      title="Entrar na sua conta"
      description="Para estudantes, professores e funcionários: pesquise o acervo, consulte disponibilidade e acompanhe seus empréstimos."
      aside={{
        title: "Encontre o próximo livro que você vai ler.",
        description:
          "Busque por título, autor, categoria ou código do exemplar e veja na hora se o livro está disponível para empréstimo.",
        bullets: [
          "Consulta de disponibilidade em tempo real",
          "Prazos de devolução bem visíveis",
          "Histórico dos seus empréstimos",
          "Leitura acessível em qualquer dispositivo"
        ]
      }}
      footer={
        <div className="space-y-2">
          <p>
            Ainda não tem conta?{" "}
            <Link to="/register" className="font-semibold text-primary underline underline-offset-4">
              Criar conta
            </Link>
          </p>
          <p>
            Esqueceu a senha?{" "}
            <Link to="/forgot-password" className="font-semibold text-primary underline underline-offset-4">
              Recuperar acesso
            </Link>
          </p>
          <p>
            É da equipe da biblioteca?{" "}
            <Link to="/admin/entrar" className="font-semibold text-primary underline underline-offset-4">
              Acesso administrativo
            </Link>
          </p>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div>
          <Label htmlFor="user-email">E-mail institucional</Label>
          <Input
            id="user-email"
            type="email"
            autoComplete="email"
            autoFocus
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="mt-1.5"
          />
        </div>

        <div>
          <Label htmlFor="user-password">Senha</Label>
          <div className="relative mt-1.5">
            <Input
              id="user-password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="pr-12"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 h-9 w-9 -translate-y-1/2"
              onClick={() => setShowPassword((value) => !value)}
              aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
              aria-pressed={showPassword}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {error ? (
          <Alert variant="destructive" role="alert">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}

        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" /> : <LogIn className="mr-2 h-4 w-4" aria-hidden="true" />}
          {loading ? "Entrando…" : "Entrar"}
        </Button>
      </form>
    </AuthShell>
  );
}