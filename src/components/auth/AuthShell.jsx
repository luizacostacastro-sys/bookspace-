import { Link } from "react-router-dom";
import { ArrowLeft, BookMarked } from "lucide-react";
import AccessibilityDialog from "@/components/a11y/AccessibilityDialog";

export default function AuthShell({ eyebrow, title, description, children, footer, aside }) {
  return (
    <div className="min-h-screen paper">
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-5 py-8 lg:grid-cols-[0.9fr_1fr] lg:items-center lg:gap-16 lg:py-16">
        <div className="hidden lg:block">
          <Link to="/" className="inline-flex items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <BookMarked className="h-5 w-5" aria-hidden="true" />
            </span>
            <span className="font-display text-xl font-semibold">
              BookSpace<span className="text-accent">.</span>
            </span>
          </Link>
          <h2 className="mt-8 font-display text-4xl font-semibold leading-tight">
            {aside?.title || "Uma biblioteca escolar organizada, do acervo ao leitor."}
          </h2>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
            {aside?.description ||
              "Controle de exemplares por QR Code, empréstimos com regras claras, relatórios confiáveis e acessibilidade em todas as telas."}