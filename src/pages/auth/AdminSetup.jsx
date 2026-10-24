const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { KeyRound, ShieldCheck, ArrowLeft } from "lucide-react";

import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function AdminSetup() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    if (!code.trim()) {
      setError("Informe o código de ativação fornecido pela coordenação da biblioteca.");
      return;
    }
    if (!accepted) {
      setError("É necessário aceitar as condições de uso e a política de privacidade.");
      return;
    }
    setLoading(true);
    try {
      const response = await db.functions.invoke("adminSetup", { setup_code: code.trim() });
      if (response.data?.error) {
        setError(response.data.error);
        setLoading(false);
        return;
      }
      window.location.href = "/admin";
    } catch (err) {
      setError(err?.response?.data?.error || "Não foi possível ativar o acesso administrativo.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen paper">
      <div className="mx-auto w-full max-w-3xl px-5 py-10">
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-primary underline underline-offset-4">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Voltar para a entrada
        </Link>

        <div className="mt-6 rounded-2xl border border-border bg-card p-6 sm:p-8">
          <div className="flex items-center gap-2 text-primary">
            <ShieldCheck className="h-5 w-5" aria-hidden="true" />
            <p className="text-xs font-semibold uppercase tracking-widest">Configuração inicial segura</p>
          </div>
          <h1 className="mt-2 font-display text-3xl font-semibold">Primeiro acesso do administrador</h1>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            A criação de administradores é protegida por um código de ativação de uso restrito, entregue pela
            coordenação da escola. Nenhum visitante consegue se tornar administrador sozinho.
          </p>

          {!user ? (
            <div className="mt-6 space-y-4">
              <Alert>
                <AlertDescription>
                  Para ativar o acesso administrativo, entre ou crie sua conta institucional primeiro. Depois
                  volte a esta página e informe o código de ativação.
                </AlertDescription>
              </Alert>
              <div className="flex flex-wrap gap-3">
                <Button asChild>
                  <Link to="/register">Criar conta institucional</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link to="/login">Já tenho conta</Link>
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={submit} className="mt-6 space-y-5" noValidate>
              <p className="rounded-lg bg-secondary px-3 py-2 text-sm">
                Conta conectada: <strong>{user.full_name || user.email}</strong> ({user.email})
              </p>

              <div>
                <Label htmlFor="setup-code">Código de ativação</Label>
                <Input
                  id="setup-code"
                  type="password"
                  autoComplete="one-time-code"
                  value={code}
                  onChange={(event) => setCode(event.target.value)}
                  aria-describedby="setup-code-help"
                  className="mt-1.5"
                />
                <p id="setup-code-help" className="mt-1.5 text-xs text-muted-foreground">
                  O código é secreto e não aparece em nenhuma tela do sistema.
                </p>
              </div>

              <div className="flex items-start gap-3">
                <input
                  id="setup-accept"
                  type="checkbox"
                  checked={accepted}
                  onChange={(event) => setAccepted(event.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-input"
                />
                <Label htmlFor="setup-accept" className="text-sm font-normal leading-relaxed">
                  Aceito as condições de uso e a política de privacidade, incluindo o tratamento de dados
                  pessoais conforme a LGPD.
                </Label>
              </div>

              {error ? (
                <Alert variant="destructive" role="alert">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              ) : null}

              <Button type="submit" size="lg" disabled={loading} className="w-full sm:w-auto">
                <KeyRound className="mr-2 h-4 w-4" aria-hidden="true" />
                {loading ? "Ativando acesso…" : "Ativar acesso administrativo"}
              </Button>
              <p className="text-xs text-muted-foreground">
                Já é administrador?{" "}
                <button type="button" onClick={() => navigate("/admin/entrar")} className="font-semibold text-primary underline underline-offset-4">
                  Entrar no painel administrativo
                </button>
                .
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}