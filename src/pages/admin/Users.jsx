const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useEffect, useState } from "react";
import { Search, UserPlus } from "lucide-react";

import { useSession } from "@/hooks/useSession";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { KIND_LABELS } from "@/lib/roles";
import TurmaFilter from "@/components/members/TurmaFilter";
import MemberCard from "@/components/members/MemberCard";

export default function AdminUsers() {
  const { isAdmin } = useSession();
  const [users, setUsers] = useState([]);
  const [query, setQuery] = useState("");
  const [turmaFilter, setTurmaFilter] = useState("todas");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");
  const [inviteOpen, setInviteOpen] = useState(false);
  const [invite, setInvite] = useState({ email: "", full_name: "", kind: "estudante", class_or_department: "" });
  const [working, setWorking] = useState(false);

  const load = async () => {
    try {
      const response = await db.functions.invoke("staffData", { resource: "users" });
      if (response.data?.error) setError(response.data.error);
      else setUsers(response.data.items || []);
    } catch (err) {
      setError("Não foi possível carregar os usuários.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const act = async (payload, message) => {
    setError("");
    setFeedback("");
    try {
      const response = await db.functions.invoke("manageUser", payload);
      if (response.data?.error) {
        setError(response.data.error);
        return;
      }
      setFeedback(message);
      load();
    } catch (err) {
      setError(err?.response?.data?.error || "Não foi possível concluir a ação.");
    }
  };

  const submitInvite = async (event) => {
    event.preventDefault();
    if (invite.kind === "estudante" && !invite.class_or_department.trim()) {
      setError("Informe a turma do estudante.");
      return;
    }
    setWorking(true);
    await act(
      {
        action: "invite",
        email: invite.email.trim(),
        full_name: invite.full_name,
        kind: invite.kind,
        class_or_department: invite.class_or_department.trim()
      },
      "Convite enviado. A pessoa receberá o e-mail para criar a senha."
    );
    setWorking(false);
    setInviteOpen(false);
    setInvite({ email: "", full_name: "", kind: "estudante", class_or_department: "" });
  };

  const turmas = Array.from(
    new Set(users.map((profile) => String(profile.class_or_department || "").trim()).filter(Boolean))
  ).sort((a, b) => a.localeCompare(b, "pt-BR"));

  const visible = users.filter((profile) => {
    const turma = String(profile.class_or_department || "").trim();
    if (turmaFilter !== "todas" && turma !== turmaFilter) return false;
    if (!query.trim()) return true;
    const term = query.trim().toLowerCase();
    return [profile.full_name, profile.user_email, profile.matricula, profile.class_or_department]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(term));
  });

  const groups = visible.reduce((acc, profile) => {
    const turma = String(profile.class_or_department || "").trim() || "Sem turma";
    const group = acc.find((item) => item.turma === turma);
    if (group) group.items.push(profile);
    else acc.push({ turma, items: [profile] });
    return acc;
  }, []);
  groups.sort((a, b) => {
    if (a.turma === "Sem turma") return 1;
    if (b.turma === "Sem turma") return -1;
    return a.turma.localeCompare(b.turma, "pt-BR");
  });

  return (
    <div>
      <PageHeader
        title="Usuários"
        description="Estudantes, professores e funcionários cadastrados. A aprovação do cadastro libera empréstimos."
        actions={
          isAdmin ? (
            <Button onClick={() => setInviteOpen(true)}>
              <UserPlus className="mr-2 h-4 w-4" aria-hidden="true" />
              Convidar usuário
            </Button>
          ) : null
        }
      />

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

      <div className="mb-4 flex flex-wrap items-end gap-4">
        <div className="max-w-md flex-1">
          <Label htmlFor="user-search">Buscar por nome, e-mail, matrícula ou turma</Label>
          <div className="relative mt-1.5">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <Input id="user-search" value={query} onChange={(event) => setQuery(event.target.value)} className="pl-9" />
          </div>
        </div>
        <TurmaFilter
          id="user-turma"
          label="Filtrar por turma / setor"
          value={turmaFilter}
          onChange={setTurmaFilter}
          options={turmas}
        />
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Carregando usuários…</p>
      ) : groups.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border p-6 text-sm text-muted-foreground">
          Nenhum usuário encontrado. {isAdmin ? "Use “Convidar usuário” para cadastrar alguém." : ""}
        </p>
      ) : (
        <div className="space-y-6">
          {groups.map((group) => (
            <section key={group.turma} aria-labelledby={`turma-${group.turma.replace(/\s+/g, "-")}`}>
              <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
                <h3 id={`turma-${group.turma.replace(/\s+/g, "-")}`} className="font-heading text-lg font-semibold">
                  {group.turma}
                </h3>
                <p className="text-xs text-muted-foreground">{group.items.length} pessoa(s)</p>
              </div>
              <ul className="grid gap-3 lg:grid-cols-2">
                {group.items.map((profile) => (
                  <MemberCard key={profile.id} profile={profile} isAdmin={isAdmin} onAction={act} />
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}

      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Convidar usuário</DialogTitle>
            <DialogDescription>
              A pessoa recebe um convite por e-mail para criar a senha. O tipo de usuário define prazos e limites.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={submitInvite} className="space-y-4">
            <div>
              <Label htmlFor="invite-name">Nome completo</Label>
              <Input
                id="invite-name"
                required
                value={invite.full_name}
                onChange={(event) => setInvite({ ...invite, full_name: event.target.value })}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="invite-email">E-mail</Label>
              <Input
                id="invite-email"
                type="email"
                required
                value={invite.email}
                onChange={(event) => setInvite({ ...invite, email: event.target.value })}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="invite-kind">Tipo de usuário</Label>
              <Select value={invite.kind} onValueChange={(value) => setInvite({ ...invite, kind: value })}>
                <SelectTrigger id="invite-kind" className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(KIND_LABELS).map((kind) => (
                    <SelectItem key={kind} value={kind}>
                      {KIND_LABELS[kind]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="invite-turma">
                {invite.kind === "estudante" ? "Turma (obrigatória)" : "Turma, série ou departamento (opcional)"}
              </Label>
              <Input
                id="invite-turma"
                required={invite.kind === "estudante"}
                value={invite.class_or_department}
                onChange={(event) => setInvite({ ...invite, class_or_department: event.target.value })}
                placeholder="Ex.: 7º ano B"
                className="mt-1.5"
              />
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