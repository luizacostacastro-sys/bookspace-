const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { Link } from "react-router-dom";

import { useSession } from "@/hooks/useSession";
import PageHeader from "@/components/PageHeader";
import { KIND_LABELS } from "@/lib/roles";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import AccessibilityDialog from "@/components/a11y/AccessibilityDialog";

const STATUS_LABELS = { pendente: "Aguardando aprovação da biblioteca", ativo: "Ativo", bloqueado: "Bloqueado" };

export default function Profile() {
  const { user, profile, role, isStaff } = useSession();

  const logout = async () => {
    await db.auth.logout();
    window.location.href = "/";
  };

  return (
    <div>
      <PageHeader
        title="Meu perfil"