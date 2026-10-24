const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useEffect, useMemo, useState } from "react";

import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import LabelSheet from "@/components/qr/LabelSheet";

export default function AdminLabels() {
  const [books, setBooks] = useState([]);
  const [copies, setCopies] = useState([]);
  const [bookId, setBookId] = useState("");
  const [selected, setSelected] = useState([]);

  useEffect(() => {
    const load = async () => {
      const [bookPage, copyPage] = await Promise.all([
        db.entities.Book.filter({ status: "ativo" }, { sort: "title", limit: 300 }),
        db.entities.BookCopy.filter({}, { sort: "copy_code", limit: 800 })
      ]);
      const bookItems = bookPage.items || [];
      setBooks(bookItems);