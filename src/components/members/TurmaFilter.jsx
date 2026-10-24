import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function TurmaFilter({ id = "turma-filter", label = "Turma / setor", value, onChange, options }) {
  return (
    <div className="max-w-xs">
      <Label htmlFor={id}>{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id={id} className="mt-1.5">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="todas">Todas as turmas</SelectItem>
          {options.map((turma) => (
            <SelectItem key={turma} value={turma}>
              {turma}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}