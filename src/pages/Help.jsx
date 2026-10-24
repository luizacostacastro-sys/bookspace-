import { Link } from "react-router-dom";
import PageHeader from "@/components/PageHeader";
import { useSession } from "@/hooks/useSession";
import { can } from "@/lib/roles";

export default function Help() {
  const { role, isStaff } = useSession();

  return (
    <div>
      <PageHeader
        title="Ajuda e documentação"
        description="Como usar o BookSpace no dia a dia, com os perfis de acesso e as regras da biblioteca."
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-xl border border-border bg-card p-4">
          <h3 className="font-heading text-lg font-semibold">Para leitores</h3>
          <ol className="mt-2 list-decimal space-y-2 pl-5 text-sm text-muted-foreground">
            <li>Entre pelo “Acesso de usuários” e complete seu cadastro com matrícula e turma.</li>
            <li>Pesquise o acervo por título, autor, ISBN, categoria ou código do exemplar.</li>
            <li>Veja na página do livro quantos exemplares estão disponíveis.</li>
            <li>Acompanhe prazos em “Meus empréstimos”. Empréstimos vencidos aparecem como “Atrasado”.</li>
            <li>Para emprestar ou devolver, procure a equipe da biblioteca.</li>
          </ol>
        </section>

        <section className="rounded-xl border border-border bg-card p-4">
          <h3 className="font-heading text-lg font-semibold">Para a equipe</h3>
          <ol className="mt-2 list-decimal space-y-2 pl-5 text-sm text-muted-foreground">
            <li>Cadastre o livro (título e autor são obrigatórios) e depois gere os exemplares.</li>
            <li>Cada exemplar recebe código e QR Code permanentes — reimprimir não altera o identificador.</li>
            <li>Imprima etiquetas em lote pelo título e cole nos exemplares.</li>
            <li>Registre empréstimos pelo leitor de QR Code, pela página de empréstimos ou digitando o código.</li>
            <li>Registre devoluções informando o estado do exemplar (bom, manutenção, danificado, perdido).</li>
            <li>Aprove cadastros em “Usuários” antes de liberar empréstimos.</li>
          </ol>
        </section>

        <section className="rounded-xl border border-border bg-card p-4">
          <h3 className="font-heading text-lg font-semibold">Regras aplicadas pelo sistema</h3>
          <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
            <li>Um exemplar só é emprestado se estiver disponível e não tiver outro empréstimo ativo.</li>
            <li>Um empréstimo já devolvido não pode ser devolvido novamente.</li>
            <li>O histórico é preservado: desativar um título não apaga empréstimos antigos.</li>
            <li>Atrasos são calculados automaticamente pelo prazo, sem ajuste manual.</li>
            <li>Limite de empréstimos e prazo variam por perfil, conforme as configurações.</li>
            <li>Administradores nunca são criados por cadastro público: é necessário código de ativação.</li>
          </ul>
        </section>

        <section className="rounded-xl border border-border bg-card p-4">
          <h3 className="font-heading text-lg font-semibold">Perfis e permissões</h3>
          <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
            <li>
              <strong>Administrador:</strong> acervo, exemplares, QR Codes, empréstimos, usuários, configurações,
              relatórios e auditoria.
            </li>
            <li>
              <strong>Funcionário:</strong> acervo, exemplares, QR Codes, empréstimos e devoluções; consulta de
              usuários sem poder alterar contas ou configurações.
            </li>
            <li>
              <strong>Professor e estudante:</strong> busca no acervo, disponibilidade, próprios empréstimos, perfil e
              acessibilidade.
            </li>
          </ul>
          <p className="mt-3 text-xs text-muted-foreground">
            Seu perfil atual: <strong>{role}</strong>.{" "}
            {isStaff ? (
              <Link to="/admin/leitor" className="font-semibold text-primary underline underline-offset-4">
                Abrir leitor de QR Code
              </Link>
            ) : null}
          </p>
        </section>

        <section className="rounded-xl border border-border bg-card p-4 lg:col-span-2">
          <h3 className="font-heading text-lg font-semibold">Limitações conhecidas</h3>
          <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
            <li>Leitura de QR Code depende de câmera e permissão do navegador; a pesquisa manual sempre funciona.</li>
            <li>A leitura em voz alta usa as vozes do dispositivo e pode variar entre navegadores.</li>
            <li>Notificações por e-mail exigem um serviço de e-mail configurado e consentimento do titular.</li>
            <li>Os relatórios são exportados em CSV; a impressão usa as configurações da impressora do computador.</li>
            <li>
              A avaliação de acessibilidade segue as WCAG 2.2 AA como referência, mas ainda depende de testes manuais
              com tecnologias assistivas reais antes de qualquer afirmação de conformidade total.
            </li>
          </ul>
          {can(role, "auditoria:view") ? (
            <p className="mt-3 text-sm">
              <Link to="/admin/auditoria" className="font-semibold text-primary underline underline-offset-4">
                Ver auditoria e segurança
              </Link>
            </p>
          ) : null}
        </section>
      </div>
    </div>
  );
}