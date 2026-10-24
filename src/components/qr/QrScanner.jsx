import { useCallback, useEffect, useRef, useState } from "react";
import jsQR from "jsqr";
import { Camera, CameraOff, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function QrScanner({ onDecode, disabled }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const rafRef = useRef(null);
  const lastRef = useRef({ code: "", at: 0 });

  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");
  const [devices, setDevices] = useState([]);
  const [deviceId, setDeviceId] = useState("");
  const [running, setRunning] = useState(false);

  const stop = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
    setRunning(false);
    setStatus("idle");
    setMessage("Câmera desligada. Você pode digitar o código manualmente.");
  }, []);

  useEffect(() => () => stop(), [stop]);

  const tick = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState !== 4) {
      rafRef.current = requestAnimationFrame(tick);
      return;
    }
    const width = video.videoWidth;
    const height = video.videoHeight;
    if (!width || !height) {
      rafRef.current = requestAnimationFrame(tick);
      return;
    }
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    context.drawImage(video, 0, 0, width, height);
    const image = context.getImageData(0, 0, width, height);
    const found = jsQR(image.data, width, height, { inversionAttempts: "dontInvert" });
    if (found && found.data) {
      const now = Date.now();
      if (found.data !== lastRef.current.code || now - lastRef.current.at > 4000) {
        lastRef.current = { code: found.data, at: now };
        onDecode?.(found.data);
      }
    }
    rafRef.current = requestAnimationFrame(tick);
  }, [onDecode]);

  const start = useCallback(
    async (id) => {
      if (disabled) return;
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setStatus("error");
        setMessage("Este navegador não oferece acesso à câmera. Use a pesquisa manual pelo código do exemplar.");
        return;
      }
      stop();
      setStatus("starting");
      setMessage("Solicitando permissão da câmera…");
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: id ? { deviceId: { exact: id } } : { facingMode: { ideal: "environment" } },
          audio: false
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
        setRunning(true);
        setStatus("running");
        setMessage("Câmera ligada. Aponte para o QR Code da etiqueta do exemplar.");
        try {
          const all = await navigator.mediaDevices.enumerateDevices();
          const cams = all.filter((device) => device.kind === "videoinput");
          setDevices(cams);
          const active = stream.getVideoTracks()[0]?.getSettings()?.deviceId;
          if (active) setDeviceId(active);
        } catch (error) {
          /* seleção de câmera indisponível */
        }
        rafRef.current = requestAnimationFrame(tick);
      } catch (error) {
        setStatus("error");
        const denied = error && (error.name === "NotAllowedError" || error.name === "SecurityError");
        setMessage(
          denied
            ? "Permissão da câmera negada. Libere o acesso nas configurações do navegador ou use a pesquisa manual."
            : "Não foi possível abrir a câmera. Verifique se outro aplicativo está usando a câmera ou use a pesquisa manual."
        );
      }
    },
    [disabled, stop, tick]
  );

  return (
    <div className="space-y-4">
      <ol className="list-decimal space-y-1 pl-5 text-sm text-muted-foreground">
        <li>Permita o uso da câmera quando o navegador perguntar.</li>
        <li>Aponte a câmera para o QR Code impresso na etiqueta do exemplar.</li>
        <li>Confira os dados na tela antes de confirmar qualquer operação.</li>
      </ol>

      <div className="overflow-hidden rounded-xl border border-border bg-black">
        <video
          ref={videoRef}
          className="aspect-video w-full object-cover"
          playsInline
          muted
          aria-label="Imagem da câmera para leitura de QR Code"
        />
        <canvas ref={canvasRef} className="hidden" aria-hidden="true" />
      </div>

      <div className="flex flex-wrap gap-2">
        {!running ? (
          <Button type="button" onClick={() => start(deviceId)} disabled={disabled || status === "starting"}>
            <Camera className="mr-2 h-4 w-4" aria-hidden="true" />
            {status === "starting" ? "Abrindo câmera…" : "Ligar câmera"}
          </Button>
        ) : (
          <Button type="button" variant="outline" onClick={stop}>
            <CameraOff className="mr-2 h-4 w-4" aria-hidden="true" />
            Parar câmera
          </Button>
        )}
        {running ? (
          <Button type="button" variant="ghost" onClick={() => start(deviceId)}>
            <RefreshCw className="mr-2 h-4 w-4" aria-hidden="true" />
            Reiniciar
          </Button>
        ) : null}
      </div>

      {devices.length > 1 ? (
        <div>
          <Label htmlFor="camera-select">Câmera</Label>
          <select
            id="camera-select"
            value={deviceId}
            onChange={(event) => {
              setDeviceId(event.target.value);
              start(event.target.value);
            }}
            className="mt-1.5 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            {devices.map((device, index) => (
              <option key={device.deviceId || index} value={device.deviceId}>
                {device.label || `Câmera ${index + 1}`}
              </option>
            ))}
          </select>
        </div>
      ) : null}

      <p role="status" aria-live="polite" className="min-h-5 text-sm font-medium">
        {message}
      </p>

      {status === "error" ? (
        <Alert variant="destructive" role="alert">
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      ) : null}
    </div>
  );
}