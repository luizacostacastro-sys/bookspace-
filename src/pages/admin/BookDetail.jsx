import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Plus, Printer } from "lucide-react";

import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CopyStatusBadge } from "@/components/StatusBadge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import QrTag from "@/components/qr/QrTag";
import LabelSheet from "@/components/qr/LabelSheet";
import { formatDateBR } from "@/lib/library";

export default function AdminBookDetail() {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [copies, setCopies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [count, setCount] = useState("1");
  const [location, setLocation] = useState("");
  const [feedback, setFeedback] = useState("");