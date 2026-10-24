const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function ReturnLoanDialog({ loan, open, onOpenChange, onDone }) {
  const [condition, setCondition] = useState("bom");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [working, setWorking] = useState(false);

  useEffect(() => {
    if (open) {
      setCondition("bom");
      setNotes("");
      setError("");
    }
  }, [open]);

  const submit = async (event) => {
    event.preventDefault();
    setWorking(true);
    setError("");
    try {
      const response = await db.functions.invoke("libraryOps", {
        action: "return",
        loan_id: loan?.id,
        condition,
        notes
      });
      if (response.data?.error) {
        setError(response.data.error);
        setWorking(false);
        return;
      }
      onOpenChange(false);
      onDone?.("Devolução registrada com sucesso.");
    } catch (err) {
      setError(err?.response?.data?.error || "Não foi possível registrar a devolução.");
    } finally {
      setWorking(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Confirmar devolução</DialogTitle>
          <DialogDescription>
            {loan ? `${loan.book_title} · ${loan.copy_code} · ${loan.user_name}` : ""}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <Label htmlFor="return-state">Estado do exemplar devolvido</Label>
            <Select value={condition} onValueChange={setCondition}>
              <SelectTrigger id="return-state" className="mt-1.5">
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
            <Label htmlFor="return-obs">Observações (opcional)</Label>
            <Textarea
              id="return-obs"
              rows={2}
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              className="mt-1.5"
            />
          </div>
          {error ? (
            <Alert variant="destructive" role="alert">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}
          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={working}>
              {working ? "Registrando…" : "Confirmar devolução"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}