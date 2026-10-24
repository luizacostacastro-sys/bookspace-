import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, UserRoundCheck } from "lucide-react";

import { useSession } from "@/hooks/useSession";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import AuthShell from "@/components/auth/AuthShell";
import { KIND_LABELS } from "@/lib/roles";

export default function Onboarding() {
  const { user, profile, settings, loading } = useSession();
  const navigate = useNavigate();
  const [form, setForm] = useState({ full_name: "", matricula: "", kind: "estudante", class_or_department: "" });
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {