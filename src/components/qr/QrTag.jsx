import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Download, FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";

export function useQrDataUrl(text, size = 320) {
  const [url, setUrl] = useState("");
  useEffect(() => {
    let active = true;
    if (!text) {
      setUrl("");
      return () => {
        active = false;
      };
    }
    QRCode.toDataURL(text, {
      margin: 1,
      width: size,
      errorCorrectionLevel: "M",
      color: { dark: "#000000", light: "#FFFFFF" }
    })
      .then((value) => {
        if (active) setUrl(value);
      })
      .catch(() => {
        if (active) setUrl("");
      });
    return () => {
      active = false;
    };
  }, [text, size]);
  return url;
}

function saveBlob(content, filename, mime) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export async function downloadQrPng(text, filename) {
  const dataUrl = await QRCode.toDataURL(text, { margin: 1, width: 1024, errorCorrectionLevel: "M" });
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export async function downloadQrSvg(text, filename) {
  const svg = await QRCode.toString(text, { type: "svg", margin: 1, errorCorrectionLevel: "M" });
  saveBlob(svg, filename, "image/svg+xml;charset=utf-8");
}

export default function QrTag({ copy, size = 180, showActions = true }) {
  const payload = copy?.qr_identifier || (copy?.copy_code ? `bookspace:copy:${copy.copy_code}` : "");
  const url = useQrDataUrl(payload, 480);

  return (
    <div className="space-y-3">
      <div className="flex flex-col items-center gap-2 rounded-lg border border-border bg-white p-3">
        {url ? (
          <img
            src={url}
            alt={`QR Code do exemplar ${copy.copy_code || ""}`}
            width={size}
            height={size}
            className="h-auto w-full max-w-[220px]"
          />
        ) : (
          <div className="flex h-40 w-full items-center justify-center text-xs text-muted-foreground">
            Gerando QR Code…
          </div>
        )}
        <p className="text-center text-xs font-semibold text-black">{copy?.book_title || "Exemplar"}</p>
        <p className="text-center font-mono text-sm font-bold tracking-wider text-black">{copy?.copy_code}</p>
      </div>

      {showActions ? (
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => downloadQrPng(payload, `${copy.copy_code}-qrcode.png`)}
          >
            <Download className="mr-2 h-4 w-4" aria-hidden="true" />
            Baixar PNG
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => downloadQrSvg(payload, `${copy.copy_code}-qrcode.svg`)}
          >
            <FileDown className="mr-2 h-4 w-4" aria-hidden="true" />
            Baixar SVG
          </Button>
        </div>
      ) : null}
    </div>
  );
}