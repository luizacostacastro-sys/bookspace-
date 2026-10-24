const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useEffect, useState } from "react";
import { Save } from "lucide-react";

import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function AdminSettings() {
  const [record, setRecord] = useState(null);
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const rows = await db.entities.LibrarySettings.filter({ key: "default" });
        const list = Array.isArray(rows) ? rows : rows.items || [];
        const found = list[0] || null;
        setRecord(found);
        setForm(
          found || {
            key: "default",
            library_name: "Biblioteca Escolar BookSpace",
            school_name: "",
            loan_days_estudante: 7,
            loan_days_professor: 21,
            loan_days_funcionario: 14,
            loan_days_administrador: 30,
            max_loans_estudante: 2,
            max_loans_professor: 5,
            max_loans_funcionario: 5,
            max_loans_administrador: 10,
            renewal_days: 7,
            public_registration_enabled: true,
            approval_required: true,
            overdue_notice_days: 3
          }
        );
      } catch (err) {
        setError("Não foi possível carregar as configurações.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const setNumber = (key) => (event) => setForm({ ...form, [key]: Number(event.target.value) });

  const save = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const payload = { ...form, updated_by: "painel administrativo" };
      delete payload.id;
      delete payload.created_date;
      delete payload.updated_date;
      delete payload.created_by_id;
      delete payload.created_by;
      if (record?.id) await db.entities.LibrarySettings.update(record.id, payload);
      else {
        const created = await db.entities.LibrarySettings.create(payload);
        setRecord(created);
      }
      setMessage("Configurações salvas. Novos empréstimos já usam estas regras.");
    } catch (err) {
      setError("Não foi possível salvar as configurações.");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !form) return <p className="text-sm text-muted-foreground">Carregando configurações…</p>;

  return (
    <div>
      <PageHeader
        title="Configurações da biblioteca"
        description="Prazos, limites e políticas de cadastro. As regras valem para todos os novos empréstimos, sem alterar registros antigos."
      />

      {message ? (
        <Alert className="mb-4" role="status">
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      ) : null}
      {error ? (
        <Alert variant="destructive" role="alert" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <form onSubmit={save} className="space-y-6">
        <fieldset className="rounded-xl border border-border bg-card p-4">
          <legend className="px-1 text-sm font-semibold">Identificação</legend>
          <div className="mt-2 grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="cfg-library">Nome da biblioteca</Label>
              <Input
                id="cfg-library"
                value={form.library_name || ""}
                onChange={(event) => setForm({ ...form, library_name: event.target.value })}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="cfg-school">Escola</Label>
              <Input
                id="cfg-school"
                value={form.school_name || ""}
                onChange={(event) => setForm({ ...form, school_name: event.target.value })}
                className="mt-1.5"
              />
            </div>
          </div>
        </fieldset>

        <fieldset className="rounded-xl border border-border bg-card p-4">
          <legend className="px-1 text-sm font-semibold">Prazos de empréstimo (dias)</legend>
          <div className="mt-2 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["estudante", "Estudantes"],
              ["professor", "Professores"],
              ["funcionario", "Funcionários"],
              ["administrador", "Administradores"]
            ].map(([key, label]) => (
              <div key={key}>
                <Label htmlFor={`cfg-days-${key}`}>{label}</Label>
                <Input
                  id={`cfg-days-${key}`}
                  type="number"
                  min="1"
                  max="365"
                  value={form[`loan_days_${key}`]}
                  onChange={setNumber(`loan_days_${key}`)}
                  className="mt-1.5"
                />
              </div>
            ))}
          </div>
        </fieldset>

        <fieldset className="rounded-xl border border-border bg-card p-4">
          <legend className="px-1 text-sm font-semibold">Limite de empréstimos simultâneos</legend>
          <div className="mt-2 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["estudante", "Estudantes"],
              ["professor", "Professores"],
              ["funcionario", "Funcionários"],
              ["administrador", "Administradores"]
            ].map(([key, label]) => (
              <div key={key}>
                <Label htmlFor={`cfg-max-${key}`}>{label}</Label>
                <Input
                  id={`cfg-max-${key}`}
                  type="number"
                  min="1"
                  max="50"
                  value={form[`max_loans_${key}`]}
                  onChange={setNumber(`max_loans_${key}`)}
                  className="mt-1.5"
                />
              </div>
            ))}
          </div>
        </fieldset>

        <fieldset className="rounded-xl border border-border bg-card p-4">
          <legend className="px-1 text-sm font-semibold">Cadastro e renovação</legend>
          <div className="mt-2 grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="cfg-renewal">Dias adicionados na renovação</Label>
              <Input
                id="cfg-renewal"
                type="number"
                min="1"
                max="90"
                value={form.renewal_days}
                onChange={setNumber("renewal_days")}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="cfg-notice">Aviso antecipado de atraso (dias)</Label>
              <Input
                id="cfg-notice"
                type="number"
                min="0"
                max="30"
                value={form.overdue_notice_days}
                onChange={setNumber("overdue_notice_days")}
                className="mt-1.5"
              />
            </div>
          </div>
          <div className="mt-4 space-y-3">
            <div className="flex items-start justify-between gap-4 rounded-lg border border-border p-3">
              <div>
                <Label htmlFor="cfg-public" className="text-sm font-semibold">
                  Permitir cadastro público de usuários
                </Label>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Quando desativado, apenas convites da equipe criam novos usuários.
                </p>
              </div>
              <Switch
                id="cfg-public"
                checked={Boolean(form.public_registration_enabled)}
                onCheckedChange={(value) => setForm({ ...form, public_registration_enabled: value })}
              />
            </div>
            <div className="flex items-start justify-between gap-4 rounded-lg border border-border p-3">
              <div>
                <Label htmlFor="cfg-approval" className="text-sm font-semibold">
                  Exigir aprovação do cadastro
                </Label>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Recomendado: o cadastro fica pendente até a equipe aprovar e liberar empréstimos.
                </p>
              </div>
              <Switch
                id="cfg-approval"
                checked={Boolean(form.approval_required)}
                onCheckedChange={(value) => setForm({ ...form, approval_required: value })}
              />
            </div>
          </div>
        </fieldset>

        <Button type="submit" size="lg" disabled={saving}>
          <Save className="mr-2 h-4 w-4" aria-hidden="true" />
          {saving ? "Salvando…" : "Salvar configurações"}
        </Button>
      </form>
    </div>
  );
}