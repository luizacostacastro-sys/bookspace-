import { useState } from "react";
import { Accessibility as AccessibilityIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import AccessibilityControls from "@/components/a11y/AccessibilityControls";

export default function AccessibilityDialog({ className }) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className={className}>
          <AccessibilityIcon className="mr-2 h-4 w-4" />
          Acessibilidade
        </Button>