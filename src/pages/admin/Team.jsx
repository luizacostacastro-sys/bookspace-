const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useEffect, useState } from "react";
import { ShieldCheck, UserPlus } from "lucide-react";

import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function AdminTeam() {
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");
  const [inviteOpen, setInviteOpen] = useState(false);
  const [invite, setInvite] = useState({ email: "", full_name: "", kind: "funcionario" });
  const [working, setWorking] = useState(false);

  const load = async () => {
    try {
      const response = await db.functions.invoke("staffData", { resource: "users" });
      if (response.data?.error) setError(response.data.error);
      else
        setTeam(
          (response.data.items || []).filter((item) => item.kind === "funcionario" || item.kind === "administrador")
        );
    } catch (err) {
      setError("Não foi possível carregar a equipe.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const submitInvite = async (event) => {
    event.preventDefault();
    setWorking(true);
    setError("");
    setFeedback("");
    try {
      const response = await db.functions.invoke("manageUser", {
        action: "invite",
        email: invite.email.trim(),
        full_name: invite.full_name,
        kind: invite.kind
      });
      if (response.data?.error) setError(response.data.error);
      else {
        setFeedback("Convite enviado com sucesso.");
        setInviteOpen(false);
        setInvite({ email: "", full_name: "", kind: "funcionario" });
        load();
      }
    } catch (err) {
      setError(err?.response?.data?.error || "Não foi possível enviar o convite.");
    } finally {
      setWorking(false);
    }
  };

  const changeKind = async (email, kind) => {
    setError("");
    setFeedback("");
    try {
      const response = await db.functions.invoke("manageUser", { action: "set_kind", email, kind });
      if (response.data?.error) setError(response.data.error);
      else {
        setFeedback("Permissão atualizada.");
        load();
      }
    } catch (err) {
      setError(err?.response?.data?.error || "Não foi possível alterar a permissão.");
    }
  };

  return (
    <div>
      <PageHeader
        title="Equipe e administradores autorizados"
        description="Funcionários da biblioteca operam empréstimos e devoluções; administradores também gerenciam contas, configurações e auditoria."
        actions={
          <Button onClick={() => setInviteOpen(true)}>
            <UserPlus className="mr-2 h-4 w-4" aria-hidden="true" />
            Convidar para a equipe
          </Button>
        }
      />

      <Alert className="mb-4" role="note">
        <AlertDescription>
          <strong>Administradores</strong> podem ver e alterar todos os dados e gerenciar contas. Conceda esse nível
          apenas a pessoas de confiança da coordenação.
        </AlertDescription>
      </Alert>

      {feedback ? (
        <Alert className="mb-4" role="status">
          <AlertDescription>{feedback}</AlertDescription>
        </Alert>
      ) : null}
      {error ? (
        <Alert variant="destructive" role="alert" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      {loading ? (
        <p className="text-sm text-muted-foreground">Carregando equipe…</p>
      ) : team.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border p-6 text-sm text-muted-foreground">
          Nenhum funcionário ou administrador cadastrado além de você.
        </p>
      ) : (
        <ul className="space-y-3">
          {team.map((member) => (
            <li key={member.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-4">
              <div className="min-w-0">
                <p className="flex items-center gap-2 font-semibold">
                  <ShieldCheck className="h-4 w-4 text-primary" aria-hidden="true" />
                  {member.full_name}
                </p>
                <p className="truncate text-xs text-muted-foreground">{member.user_email}</p>
              </div>
              <div className="min-w-48">
                <Label htmlFor={`team-${member.id}`} className="text-xs">
                  Nível de acesso
                </Label>
                <Select value={member.kind} onValueChange={(value) => changeKind(member.user_email, value)}>
                  <SelectTrigger id={`team-${member.id}`} className="mt-1 h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="funcionario">Funcionário da biblioteca</SelectItem>
                    <SelectItem value="administrador">Administrador</SelectItem>
                    <SelectItem value="professor">Professor(a)</SelectItem>
                    <SelectItem value="estudante">Estudante</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Convidar para a equipe</DialogTitle>
            <DialogDescription>
              O convite envia um e-mail para a pessoa criar a senha. A permissão é aplicada no servidor.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={submitInvite} className="space-y-4">
            <div>
              <Label htmlFor="team-name">Nome completo</Label>
              <Input
                id="team-name"
                required
                value={invite.full_name}
                onChange={(event) => setInvite({ ...invite, full_name: event.target.value })}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="team-email">E-mail institucional</Label>
              <Input
                id="team-email"
                type="email"
                required
                value={invite.email}
                onChange={(event) => setInvite({ ...invite, email: event.target.value })}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="team-kind">Nível de acesso</Label>
              <Select value={invite.kind} onValueChange={(value) => setInvite({ ...invite, kind: value })}>
                <SelectTrigger id="team-kind" className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="funcionario">Funcionário da biblioteca</SelectItem>
                  <SelectItem value="administrador">Administrador</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" onClick={() => setInviteOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={working}>
                {working ? "Enviando…" : "Enviar convite"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}