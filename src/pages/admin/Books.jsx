import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Search, Pencil, Eye, Power } from "lucide-react";

import PageHeader from "@/components/PageHeader";
import BookForm from "@/components/books/BookForm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CopyStatusBadge } from "@/components/StatusBadge";

export default function AdminBooks() {
  const [books, setBooks] = useState([]);
  const [copies, setCopies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ativos");
  const [availability, setAvailability] = useState("todos");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [feedback, setFeedback] = useState("");