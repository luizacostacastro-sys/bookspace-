const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useEffect, useState } from "react";

import PageHeader from "@/components/PageHeader";
import CopyLookupPanel from "@/components/qr/CopyLookupPanel";
import LoanTable from "@/components/loans/LoanTable";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function AdminReturns() {
  const [recent, setRecent] = useState([]);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  const load = async () => {
    try {
      const response = await db.functions.invoke("staffData", { resource: "history" });
      if (response.data?.error) setError(response.data.error);
      else setRecent((response.data.items || []).slice(0, 10));
    } catch (err) {
      setError("Não foi possível carregar as devoluções recentes.");
    }
  };

  useEffect(() => {