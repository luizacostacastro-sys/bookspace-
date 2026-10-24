import { useState } from "react";
import { CheckCircle2, Ban } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { KIND_LABELS } from "@/lib/roles";

const STATUS_LABELS = { pendente: "Pendente", ativo: "Ativo", bloqueado: "Bloqueado" };

export default function MemberCard({ profile, isAdmin, onAction }) {
  const [turma, setTurma] = useState(profile.class_or_department || "");

  return (
    <li className="rounded-xl border border-border bg-card p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate font-semibold">{profile.full_name}</p>
          <p className="truncate text-xs text-muted-foreground">{profile.user_email}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {KIND_LABELS[profile.kind] || profile.kind}
            {profile.matricula ? ` · Matrícula ${profile.matricula}` : ""}
            {profile.class_or_department ? ` · ${profile.class_or_department}` : ""}
          </p>
        </div>
        <span className="rounded-full border border-border bg-secondary px-2.5 py-1 text-xs font-semibold">
          {STATUS_LABELS[profile.status] || profile.status}
        </span>
      </div>

      {isAdmin ? (
        <div className="mt-3 flex flex-wrap items-end gap-2">
          {profile.status !== "ativo" ? (
            <Button size="sm" onClick={() => onAction({ action: "approve", profile_id: profile.id }, "Cadastro aprovado.")}>
              <CheckCircle2 className="mr-1.5 h-4 w-4" aria-hidden="true" />
              Aprovar
            </Button>
          ) : null}
          {profile.status !== "bloqueado" ? (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onAction({ action: "block", profile_id: profile.id }, "Usuário bloqueado.")}
            >
              <Ban className="mr-1.5 h-4 w-4" aria-hidden="true" />
              Bloquear
            </Button>
          ) : null}
          <div className="min-w-40">
            <Label htmlFor={`kind-${profile.id}`} className="text-xs">
              Tipo de usuário
            </Label>
            <Select
              value={profile.kind}
              onValueChange={(value) =>
                onAction({ action: "set_kind", email: profile.user_email, kind: value }, "Tipo de usuário atualizado.")
              }
            >
              <SelectTrigger id={`kind-${profile.id}`} className="mt-1 h-9">
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
          <div className="flex items-end gap-2">
            <div className="min-w-32 flex-1">
              <Label htmlFor={`turma-${profile.id}`} className="text-xs">
                Turma / setor
              </Label>
              <Input
                id={`turma-${profile.id}`}
                value={turma}
                onChange={(event) => setTurma(event.target.value)}
                placeholder="Ex.: 7º ano B"
                className="mt-1 h-9"
              />
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                onAction(
                  { action: "set_class", profile_id: profile.id, class_or_department: turma },
                  "Turma atualizada."
                )
              }
            >
              Salvar
            </Button>
          </div>
        </div>
      ) : (
        <p className="mt-3 text-xs text-muted-foreground">Somente administradores podem alterar cadastros.</p>
      )}
    </li>
  );
}