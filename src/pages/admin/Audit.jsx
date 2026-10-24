const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useEffect, useState } from "react";
import { ShieldCheck, Search } from "lucide-react";

import PageHeader from "@/components/PageHeader";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatDateTimeBR } from "@/lib/library";

const OUTCOME_LABELS = { sucesso: "Sucesso", negado: "Negado", erro: "Erro" };

export default function AdminAudit() {
  const [logs, setLogs] = useState([]);
  const [query, setQuery] = useState("");
  const [outcome, setOutcome] = useState("todos");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const page = await db.entities.AuditLog.filter({}, { sort: "-created_date", limit: 200 });