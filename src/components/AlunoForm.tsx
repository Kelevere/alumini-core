import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface AlunoFormData {
  nome: string;
  idade: string;
  email: string;
  curso: string;
}

interface AlunoFormProps {
  onSubmit: (data: AlunoFormData) => Promise<void>;
  initialData?: AlunoFormData;
  isEditing?: boolean;
  onCancel?: () => void;
}

export const AlunoForm = ({ onSubmit, initialData, isEditing, onCancel }: AlunoFormProps) => {
  const [formData, setFormData] = useState<AlunoFormData>(
    initialData || {
      nome: "",
      idade: "",
      email: "",
      curso: "",
    }
  );
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(formData);
      if (!isEditing) {
        setFormData({ nome: "", idade: "", email: "", curso: "" });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6 bg-gradient-to-b from-card to-card/80 border-border">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="nome">Nome Completo</Label>
          <Input
            id="nome"
            value={formData.nome}
            onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
            required
            placeholder="Digite o nome completo"
            className="transition-all focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="idade">Idade</Label>
          <Input
            id="idade"
            type="number"
            value={formData.idade}
            onChange={(e) => setFormData({ ...formData, idade: e.target.value })}
            required
            min="1"
            max="150"
            placeholder="Digite a idade"
            className="transition-all focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
            placeholder="exemplo@email.com"
            className="transition-all focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="curso">Curso</Label>
          <Input
            id="curso"
            value={formData.curso}
            onChange={(e) => setFormData({ ...formData, curso: e.target.value })}
            required
            placeholder="Digite o nome do curso"
            className="transition-all focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <Button
            type="submit"
            disabled={loading}
            className="flex-1 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary transition-all"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isEditing ? "Atualizando..." : "Cadastrando..."}
              </>
            ) : (
              <>{isEditing ? "Atualizar Aluno" : "Cadastrar Aluno"}</>
            )}
          </Button>
          
          {isEditing && onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={loading}
            >
              Cancelar
            </Button>
          )}
        </div>
      </form>
    </Card>
  );
};