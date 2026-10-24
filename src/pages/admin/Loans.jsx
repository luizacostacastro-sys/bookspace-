import { useEffect, useState } from "react";
import { BookOpenCheck, RefreshCw } from "lucide-react";

import PageHeader from "@/components/PageHeader";
import LoanTable from "@/components/loans/LoanTable";
import ReturnLoanDialog from "@/components/loans/ReturnLoanDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import TurmaFilter from "@/components/members/TurmaFilter";
import { formatDateBR } from "@/lib/library";

export default function AdminLoans() {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");
  const [working, setWorking] = useState(false);