const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useEffect, useState } from "react";
import { Search, BookOpenCheck, Undo2, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CopyStatusBadge } from "@/components/StatusBadge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatDateBR, normalizeCode } from "@/lib/library";

const STATUS_MESSAGES = {
  disponivel: "Exemplar disponível para empréstimo.",
  emprestado: "Exemplar emprestado no momento.",
  manutencao: "Exemplar em manutenção — não está disponível para empréstimo.",
  danificado: "Exemplar danificado — encaminhado para avaliação.",
  perdido: "Exemplar registrado como perdido.",
  inativo: "Este exemplar está desativado."
};

export default function CopyLookupPanel({ scanned, mode = "full", onChanged }) {
  const [code, setCode] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notFound, setNotFound] = useState(false);
  const [feedback, setFeedback] = useState("");

  const [loanOpen, setLoanOpen] = useState(false);
  const [returnOpen, setReturnOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [condition, setCondition] = useState("bom");
  const [working, setWorking] = useState(false);

  const lookup = async (raw) => {
    const value = normalizeCode(raw);
    if (!value) return;
    setLoading(true);
    setError("");
    setNotFound(false);
    setFeedback("");
    try {
      const response = await db.functions.invoke("libraryLookup", { code: value });
      if (response.data?.error) {
        setError(response.data.error);
        setResult(null);
      } else if (!response.data?.found) {
        setNotFound(true);
        setResult(null);
      } else {
        setResult(response.data);
      }
    } catch (err) {
      setError("Não foi possível consultar o código agora. Tente novamente.");
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (scanned && scanned.code) {
      setCode(scanned.code);
      lookup(scanned.code);
    }
  }, [scanned]);

  const submitLoan = async (event) => {
    event.preventDefault();
    setWorking(true);
    setError("");
    setFeedback("");
    try {
      const response = await db.functions.invoke("libraryOps", {
        action: "loan",
        copy_code: result?.copy?.copy_code || code,
        user_email: email.trim(),
        notes
      });
      if (response.data?.error) {
        setError(response.data.error);
        setWorking(false);
        return;
      }
      setLoanOpen(false);
      setEmail("");
      setNotes("");
      setFeedback(
        `Empréstimo registrado para ${response.data.loan.user_name}. Devolução prevista para ${formatDateBR(
          response.data.loan.due_at
        )}.`
      );
      await lookup(result?.copy?.copy_code || code);
      onChanged?.();
    } catch (err) {
      setError(err?.response?.data?.error || "Não foi possível registrar o empréstimo.");
    } finally {
      setWorking(false);
    }
  };

  const submitReturn = async (event) => {
    event.preventDefault();
    setWorking(true);
    setError("");
    setFeedback("");
    try {
      const response = await db.functions.invoke("libraryOps", {
        action: "return",
        loan_id: result?.loan?.id,
        condition,
        notes
      });
      if (response.data?.error) {
        setError(response.data.error);
        setWorking(false);
        return;
      }
      setReturnOpen(false);
      setNotes("");
      setCondition("bom");
      setFeedback("Devolução registrada. O exemplar foi atualizado conforme o estado informado.");
      await lookup(result?.copy?.copy_code || code);
      onChanged?.();
    } catch (err) {
      setError(err?.response?.data?.error || "Não foi possível registrar a devolução.");
    } finally {
      setWorking(false);
    }
  };

  const canLoan = result?.canOperate && result?.copy?.status === "disponivel" && result?.book?.status === "ativo";
  const canReturn = result?.canOperate && result?.copy?.status === "emprestado" && result?.loan;

  return (
    <div className="space-y-4">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          lookup(code);
        }}
        className="rounded-xl border border-border bg-card p-4"
      >
        <Label htmlFor="manual-code">Pesquisar código do exemplar</Label>
        <p className="mt-1 text-xs text-muted-foreground">
          A câmera nunca é a única forma de operar. Digite o código impresso na etiqueta, por exemplo DOM-0001.
        </p>
        <div className="mt-2 flex flex-col gap-2 sm:flex-row">
          <Input
            id="manual-code"
            value={code}
            onChange={(event) => setCode(event.target.value.toUpperCase())}
            placeholder="DOM-0001"
            autoComplete="off"
            className="font-mono tracking-wider sm:max-w-xs"
          />
          <Button type="submit" disabled={loading}>
            <Search className="mr-2 h-4 w-4" aria-hidden="true" />
            {loading ? "Pesquisando…" : "Pesquisar código"}
          </Button>
        </div>
      </form>

      <div aria-live="polite" className="space-y-3">
        {feedback ? (
          <Alert role="status">
            <AlertDescription>{feedback}</AlertDescription>
          </Alert>
        ) : null}
        {error ? (
          <Alert variant="destructive" role="alert">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}
        {notFound ? (
          <Alert role="alert">
            <AlertDescription>
              QR Code ou código não encontrado. Confira a etiqueta ou procure o exemplar pelo título no acervo.
            </AlertDescription>
          </Alert>
        ) : null}
      </div>

      {result ? (
        <article className="rounded-xl border border-border bg-card p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="font-heading text-xl font-semibold leading-snug">
                {result.book?.title || "Exemplar"}
              </h3>
              <p className="text-sm text-muted-foreground">{result.book?.authors || ""}</p>
              <p className="mt-2 font-mono text-sm font-bold tracking-widest">{result.copy.copy_code}</p>
            </div>
            <CopyStatusBadge status={result.copy.status} />
          </div>

          <p className="mt-3 rounded-lg bg-secondary px-3 py-2 text-sm font-medium" role="status">
            {STATUS_MESSAGES[result.copy.status] || "Situação não reconhecida."}
          </p>

          <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-xs uppercase tracking-wide text-muted-foreground">Localização</dt>
              <dd>{result.copy.physical_location || "—"}</dd>
            </div>
            {result.loan ? (
              <div>
                <dt className="text-xs uppercase tracking-wide text-muted-foreground">
                  {result.loan.own ? "Seu empréstimo" : "Empréstimo ativo"}
                </dt>
                <dd>
                  {result.loan.user_name ? `${result.loan.user_name} · ` : ""}
                  devolução prevista para {formatDateBR(result.loan.due_at)}
                </dd>
              </div>
            ) : null}
          </dl>

          <div className="mt-4 flex flex-wrap gap-2">
            {mode !== "return" && canLoan ? (
              <Button onClick={() => setLoanOpen(true)}>
                <BookOpenCheck className="mr-2 h-4 w-4" aria-hidden="true" />
                Registrar empréstimo
              </Button>
            ) : null}
            {canReturn ? (
              <Button variant={mode === "return" ? "default" : "outline"} onClick={() => setReturnOpen(true)}>
                <Undo2 className="mr-2 h-4 w-4" aria-hidden="true" />
                Registrar devolução
              </Button>
            ) : null}
            <Button variant="ghost" onClick={() => lookup(result.copy.copy_code)}>
              <RotateCcw className="mr-2 h-4 w-4" aria-hidden="true" />
              Atualizar dados
            </Button>
          </div>

          {!result.canOperate ? (
            <p className="mt-3 text-xs text-muted-foreground">
              Seu perfil permite apenas consultar as informações deste exemplar.
            </p>
          ) : null}
        </article>
      ) : null}

      <Dialog open={loanOpen} onOpenChange={setLoanOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmar empréstimo</DialogTitle>
            <DialogDescription>
              Exemplar {result?.copy?.copy_code} — {result?.book?.title}. O prazo é calculado pelo perfil do leitor.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={submitLoan} className="space-y-4">
            <div>
              <Label htmlFor="loan-email">E-mail do leitor</Label>
              <Input
                id="loan-email"
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="mt-1.5"
                placeholder="leitor@escola.edu.br"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                O leitor precisa ter cadastro aprovado na biblioteca.
              </p>
            </div>
            <div>
              <Label htmlFor="loan-notes">Observações (opcional)</Label>
              <Textarea
                id="loan-notes"
                rows={2}
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                className="mt-1.5"
              />
            </div>
            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" onClick={() => setLoanOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={working}>
                {working ? "Registrando…" : "Confirmar empréstimo"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={returnOpen} onOpenChange={setReturnOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmar devolução</DialogTitle>
            <DialogDescription>
              Exemplar {result?.copy?.copy_code} — {result?.loan?.user_name || "leitor"}. Informe o estado em que o
              livro retornou.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={submitReturn} className="space-y-4">
            <div>
              <Label htmlFor="return-condition">Estado do exemplar</Label>
              <Select value={condition} onValueChange={setCondition}>
                <SelectTrigger id="return-condition" className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bom">Bom — volta a ficar disponível</SelectItem>
                  <SelectItem value="manutencao">Precisa de manutenção</SelectItem>
                  <SelectItem value="danificado">Danificado</SelectItem>
                  <SelectItem value="perdido">Perdido</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="return-notes">Observações (opcional)</Label>
              <Textarea
                id="return-notes"
                rows={2}
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                className="mt-1.5"
              />
            </div>
            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" onClick={() => setReturnOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={working}>
                {working ? "Registrando…" : "Confirmar devolução"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}