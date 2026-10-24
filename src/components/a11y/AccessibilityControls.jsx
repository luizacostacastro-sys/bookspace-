import { useEffect, useState } from "react";
import { Volume2, Square, RotateCcw, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { useAccessibility } from "@/lib/accessibility";

const THEMES = [
  { value: "light", label: "Claro" },
  { value: "dark", label: "Escuro" },
  { value: "contrast", label: "Alto contraste" }
];

const FONTS = [
  { value: "default", label: "Padrão" },
  { value: "atkinson", label: "Atkinson Hyperlegible" },
  { value: "lexend", label: "Lexend" }
];

function SwitchRow({ id, label, description, checked, onChange }) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-lg border border-border p-3">
      <div>
        <Label htmlFor={id} className="text-sm font-semibold">
          {label}
        </Label>
        <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
      </div>
      <Switch id={id} checked={checked} onCheckedChange={onChange} className="mt-1 shrink-0" />
    </div>
  );
}

export default function AccessibilityControls() {
  const { prefs, update, reset, saved } = useAccessibility();
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const toggleSpeech = () => {
    if (!("speechSynthesis" in window)) return;
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }
    const main = document.getElementById("conteudo") || document.querySelector("main") || document.body;
    const text = String(main.innerText || "").slice(0, 5000);
    if (!text) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "pt-BR";
    utterance.rate = 1;
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
    setSpeaking(true);
  };

  return (
    <div className="space-y-6">
      <fieldset className="space-y-3">
        <legend className="text-sm font-semibold">Tamanho do texto</legend>
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label="Diminuir tamanho do texto"
            onClick={() => update({ font_scale: Math.max(80, prefs.font_scale - 10) })}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <span className="min-w-16 text-center text-sm font-semibold tabular-nums" aria-live="polite">
            {prefs.font_scale}%
          </span>
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label="Aumentar tamanho do texto"
            onClick={() => update({ font_scale: Math.min(200, prefs.font_scale + 10) })}
          >
            <Plus className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <Slider
              value={[prefs.font_scale]}
              min={80}
              max={200}
              step={5}
              aria-label="Ajustar tamanho do texto em porcentagem"
              onValueChange={([value]) => update({ font_scale: value })}
            />
          </div>
        </div>
      </fieldset>

      <fieldset className="space-y-3">
        <legend className="text-sm font-semibold">Espaçamento entre linhas</legend>
        <Slider
          value={[prefs.line_spacing]}
          min={120}
          max={240}
          step={10}
          aria-label="Espaçamento entre linhas"
          onValueChange={([value]) => update({ line_spacing: value })}
        />
        <p className="text-xs text-muted-foreground">Atual: {prefs.line_spacing}% da altura padrão.</p>
      </fieldset>

      <fieldset className="space-y-3">
        <legend className="text-sm font-semibold">Espaçamento entre letras e palavras</legend>
        <Slider
          value={[prefs.letter_spacing]}
          min={0}
          max={4}
          step={0.5}
          aria-label="Espaçamento entre letras"
          onValueChange={([value]) => update({ letter_spacing: value })}
        />
        <p className="text-xs text-muted-foreground">Atual: {prefs.letter_spacing}px entre letras.</p>
      </fieldset>

      <fieldset className="space-y-2">
        <legend className="text-sm font-semibold">Tema e contraste</legend>
        <div className="flex flex-wrap gap-2">
          {THEMES.map((theme) => (
            <Button
              key={theme.value}
              type="button"
              variant={prefs.theme === theme.value ? "default" : "outline"}
              aria-pressed={prefs.theme === theme.value}
              onClick={() => update({ theme: theme.value })}
            >
              {theme.label}
            </Button>
          ))}
        </div>
      </fieldset>

      <fieldset className="space-y-2">
        <legend className="text-sm font-semibold">Fonte de leitura</legend>
        <div className="flex flex-wrap gap-2">
          {FONTS.map((font) => (
            <Button
              key={font.value}
              type="button"
              variant={prefs.reading_font === font.value ? "default" : "outline"}
              aria-pressed={prefs.reading_font === font.value}
              onClick={() => update({ reading_font: font.value })}
            >
              {font.label}
            </Button>
          ))}
        </div>
      </fieldset>

      <fieldset className="space-y-2">
        <legend className="text-sm font-semibold">Conforto visual e navegação</legend>
        <SwitchRow
          id="a11y-simplified"
          label="Modo de leitura simplificada"
          description="Reduz elementos decorativos e distrações na tela."
          checked={prefs.simplified}
          onChange={(value) => update({ simplified: value })}
        />
        <SwitchRow
          id="a11y-motion"
          label="Reduzir animações e movimentos"
          description="Desliga transições, animações e rolagem suave."
          checked={prefs.reduced_motion}
          onChange={(value) => update({ reduced_motion: value })}
        />
        <SwitchRow
          id="a11y-links"
          label="Destacar links e foco"
          description="Links sempre sublinhados e foco de teclado reforçado."
          checked={prefs.highlight_links}
          onChange={(value) => update({ highlight_links: value })}
        />
        <SwitchRow
          id="a11y-targets"
          label="Botões maiores"
          description="Áreas de toque com pelo menos 44 × 44 pixels."
          checked={prefs.big_targets}
          onChange={(value) => update({ big_targets: value })}
        />
      </fieldset>

      <fieldset className="space-y-2">
        <legend className="text-sm font-semibold">Leitura em voz alta</legend>
        <p className="text-xs text-muted-foreground">
          Usa a voz do seu dispositivo. Nenhuma informação sai do navegador.
        </p>
        <Button type="button" variant="outline" onClick={toggleSpeech} aria-pressed={speaking}>
          {speaking ? <Square className="mr-2 h-4 w-4" /> : <Volume2 className="mr-2 h-4 w-4" />}
          {speaking ? "Parar leitura" : "Ouvir esta página"}
        </Button>
      </fieldset>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
        <p role="status" className="text-xs text-muted-foreground">
          {saved ? "Preferências salvas na sua conta." : "Preferências válidas para esta visita."}
        </p>
        <Button type="button" variant="ghost" onClick={reset}>
          <RotateCcw className="mr-2 h-4 w-4" />
          Restaurar padrões
        </Button>
      </div>
    </div>
  );
}