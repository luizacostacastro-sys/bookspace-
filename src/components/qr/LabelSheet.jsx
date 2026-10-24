import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";

function LabelItem({ copy, qrUrl }) {
  return (
    <div className="label-card flex items-start gap-3 rounded-md border border-black bg-white p-3 text-black">
      {qrUrl ? (
        <img
          src={qrUrl}
          alt={`QR Code do exemplar ${copy.copy_code}`}
          width={104}
          height={104}
          className="h-[104px] w-[104px] shrink-0"
        />
      ) : (
        <div className="h-[104px] w-[104px] shrink-0 border border-dashed border-black" aria-hidden="true" />
      )}
      <div className="min-w-0">
        <p className="line-clamp-2 text-[13px] font-bold leading-tight">{copy.book_title || "Exemplar"}</p>
        <p className="mt-1 line-clamp-1 text-[11px] leading-tight">{copy.book_authors || ""}</p>
        <p className="mt-1.5 font-mono text-[15px] font-bold tracking-widest">{copy.copy_code}</p>
        <p className="mt-1 text-[10px] leading-snug">
          Se não puder ler o QR Code, digite o código acima no Leitor de QR Code.
        </p>
      </div>
    </div>
  );
}

export default function LabelSheet({ copies, title }) {
  const [urls, setUrls] = useState({});

  useEffect(() => {
    let active = true;
    const build = async () => {
      const next = {};
      for (const copy of copies) {
        const payload = copy.qr_identifier || `bookspace:copy:${copy.copy_code}`;
        try {
          next[copy.id] = await QRCode.toDataURL(payload, {
            margin: 1,
            width: 320,
            errorCorrectionLevel: "M",
            color: { dark: "#000000", light: "#FFFFFF" }
          });
        } catch (error) {
          next[copy.id] = "";
        }
      }
      if (active) setUrls(next);
    };
    if (copies.length) build();
    return () => {
      active = false;
    };
  }, [copies]);

  const handlePrint = () => {
    document.body.classList.add("printing");
    const cleanup = () => {
      document.body.classList.remove("printing");
      window.removeEventListener("afterprint", cleanup);
    };
    window.addEventListener("afterprint", cleanup);
    window.print();
    setTimeout(cleanup, 1500);
  };

  if (!copies.length) {
    return (
      <p className="rounded-lg border border-dashed border-border p-6 text-sm text-muted-foreground">
        Selecione ao menos um exemplar para pré-visualizar as etiquetas.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 no-print">
        <p className="text-sm text-muted-foreground">
          {copies.length} etiqueta(s) · folha A4 · duas colunas · margens de 12 mm
        </p>
        <Button type="button" onClick={handlePrint} disabled={Object.keys(urls).length === 0}>
          <Printer className="mr-2 h-4 w-4" aria-hidden="true" />
          Imprimir etiquetas
        </Button>
      </div>

      <div className="print-area rounded-xl border border-border bg-card p-4">
        {title ? <h3 className="mb-3 font-heading text-lg font-semibold no-print">{title}</h3> : null}
        <div className="print-sheet grid gap-3 sm:grid-cols-2">
          {copies.map((copy) => (
            <LabelItem key={copy.id} copy={copy} qrUrl={urls[copy.id] || ""} />
          ))}
        </div>
      </div>
      <p className="text-xs text-muted-foreground no-print">
        Cada etiqueta traz o título, o código legível do exemplar e o QR Code. O identificador nunca muda, mesmo
        ao reimprimir.
      </p>
    </div>
  );
}