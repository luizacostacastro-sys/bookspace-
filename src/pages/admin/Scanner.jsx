import { useState } from "react";
import PageHeader from "@/components/PageHeader";
import QrScanner from "@/components/qr/QrScanner";
import CopyLookupPanel from "@/components/qr/CopyLookupPanel";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function AdminScanner() {
  const [scanned, setScanned] = useState(null);
  const [notice, setNotice] = useState("");

  return (
    <div>
      <PageHeader
        title="Leitor de QR Code"
        description="Leia o QR Code da etiqueta ou digite o código do exemplar. Nenhuma operação é efetivada sem a sua confirmação na tela."
      />

      <Alert className="mb-4" role="note">
        <AlertDescription>
          A leitura funciona em computadores, tablets e celulares. É necessário permitir o uso da câmera no
          navegador; sem permissão, use a pesquisa manual abaixo.
        </AlertDescription>
      </Alert>

      <div className="grid gap-4 lg:grid-cols-2">
        <section aria-labelledby="camera-title" className="rounded-xl border border-border bg-card p-4">
          <h3 id="camera-title" className="font-heading text-lg font-semibold">
            Leitura pela câmera
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            A imagem é processada no próprio dispositivo; nada é enviado para fora.
          </p>
          <div className="mt-3">
            <QrScanner
              onDecode={(value) => {
                setNotice("Código lido pela câmera. Confira os dados antes de confirmar qualquer operação.");
                setScanned({ code: value, at: Date.now() });
              }}
            />
          </div>
          {notice ? (
            <p role="status" aria-live="polite" className="mt-3 rounded-lg bg-secondary px-3 py-2 text-sm">
              {notice}
            </p>
          ) : null}
        </section>

        <section aria-labelledby="manual-title">
          <h3 id="manual-title" className="mb-2 font-heading text-lg font-semibold lg:hidden">
            Pesquisa manual e resultado
          </h3>
          <CopyLookupPanel scanned={scanned} onChanged={() => setNotice("Operação concluída e dados atualizados.")} />
        </section>
      </div>
    </div>
  );
}