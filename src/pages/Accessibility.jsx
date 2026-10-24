import PageHeader from "@/components/PageHeader";
import AccessibilityControls from "@/components/a11y/AccessibilityControls";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function AccessibilityPage() {
  return (
    <div>
      <PageHeader
        title="Central de acessibilidade"
        description="Ajustes de leitura e navegação válidos em todas as telas do BookSpace. Nenhum recurso exige informar diagnóstico, laudo ou deficiência."
      />

      <Alert className="mb-4" role="note">
        <AlertDescription>
          As preferências são salvas na sua conta e aplicadas automaticamente no próximo acesso. Visitantes mantêm
          as escolhas apenas neste navegador.
        </AlertDescription>
      </Alert>

      <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
        <section className="rounded-xl border border-border bg-card p-4">
          <AccessibilityControls />
        </section>

        <section className="rounded-xl border border-border bg-card p-4">
          <h3 className="font-heading text-lg font-semibold">Como usamos acessibilidade</h3>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>Todos os estados são escritos, não apenas coloridos: “Disponível”, “Emprestado”, “Atrasado”, “Devolvido”.</li>
            <li>A navegação por teclado funciona em todo o sistema, com foco visível e link para pular ao conteúdo.</li>
            <li>O zoom do navegador até 400% reorganiza o conteúdo sem esconder funções.</li>
            <li>Nenhuma operação essencial depende de som; todas têm confirmação textual na tela.</li>
            <li>O leitor de QR Code sempre oferece a pesquisa manual pelo código impresso.</li>
            <li>Formulários têm rótulos visíveis, erros específicos e dados preservados após falhas.</li>
          </ul>
          <p className="mt-4 text-xs text-muted-foreground">
            Limitações conhecidas: a leitura em voz alta depende das vozes instaladas no dispositivo; a leitura por
            câmera depende do navegador e da permissão de acesso. Em ambos os casos existe alternativa funcional.
          </p>
        </section>
      </div>
    </div>
  );
}