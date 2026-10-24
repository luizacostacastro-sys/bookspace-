const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useEffect, useRef } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useAuth } from "@/lib/AuthContext";
import { roleOf } from "@/lib/roles";

export default function RoleRoute({ allow }) {
  const { user, isLoadingAuth } = useAuth();
  const location = useLocation();
  const role = roleOf(user);
  const allowed = allow.includes(role);
  const logged = useRef(false);

  useEffect(() => {
    if (!allowed && user && !logged.current) {
      logged.current = true;
      db.functions
        .invoke("recordAudit", {
          action: "acesso_negado",
          details: `Rota ${location.pathname} negada para o perfil ${role}.`
        })
        .catch(() => {});
    }
  }, [allowed, user, role, location.pathname]);

  if (isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" />
      </div>
    );
  }

  if (!allowed) {
    return <Navigate to={role === "visitante" ? "/login" : "/membro"} replace />;
  }

  return <Outlet />;
}