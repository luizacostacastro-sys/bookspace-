const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useCallback, useEffect, useState } from "react";

import { useAuth } from "@/lib/AuthContext";
import { roleOf } from "@/lib/roles";

const FALLBACK_SETTINGS = {
  library_name: "Biblioteca Escolar BookSpace",
  school_name: "",
  loan_days_estudante: 7,
  loan_days_professor: 21,
  loan_days_funcionario: 14,
  loan_days_administrador: 30,
  max_loans_estudante: 2,
  max_loans_professor: 5,
  max_loans_funcionario: 5,
  max_loans_administrador: 10,
  renewal_days: 7,
  public_registration_enabled: true,
  approval_required: true,
  overdue_notice_days: 3
};

export function useSession() {
  const { user, isAuthenticated } = useAuth();
  const [profile, setProfile] = useState(null);
  const [settings, setSettings] = useState(FALLBACK_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [tick, setTick] = useState(0);

  const refresh = useCallback(() => setTick((value) => value + 1), []);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const settingsRows = await db.entities.LibrarySettings.filter({ key: "default" });
        const settingsList = Array.isArray(settingsRows) ? settingsRows : settingsRows.items || [];
        if (!cancelled && settingsList[0]) {
          setSettings({ ...FALLBACK_SETTINGS, ...settingsList[0] });
        }
        if (user && user.email) {
          const rows = await db.entities.MemberProfile.filter({ user_email: user.email });
          const list = Array.isArray(rows) ? rows : rows.items || [];
          if (!cancelled) setProfile(list[0] || null);
        } else if (!cancelled) {
          setProfile(null);
        }
      } catch (error) {
        /* mantém padrões quando não há acesso de leitura */
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [user, tick]);

  const role = roleOf(user);

  return {
    user,
    isAuthenticated,
    profile,
    settings,
    role,
    loading,
    refresh,
    isStaff: role === "administrador" || role === "funcionario",
    isAdmin: role === "administrador"
  };
}