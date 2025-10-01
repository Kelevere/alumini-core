import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Pencil, Trash2, Mail, GraduationCap, Calendar } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Aluno {
  id: string;
  nome: string;
  idade: number;
  email: string;
  curso: string;
  created_at?: string;
  updated_at?: string;
}

interface AlunosListProps {
  alunos: Aluno[];
  onEdit: (aluno: Aluno) => void;
  onDelete: (id: string) => void;
}

export const AlunosList = ({ alunos, onEdit, onDelete }: AlunosListProps) => {
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleDeleteConfirm = () => {
    if (deleteId) {
      onDelete(deleteId);
      setDeleteId(null);
    }
  };

  if (alunos.length === 0) {
    return (
      <Card className="p-12 text-center bg-gradient-to-b from-card to-card/80">
        <GraduationCap className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
        <p className="text-lg font-medium text-muted-foreground">Nenhum aluno cadastrado</p>
        <p className="text-sm text-muted-foreground mt-2">
          Comece cadastrando o primeiro aluno usando o formulário acima
        </p>
      </Card>
    );
  }

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {alunos.map((aluno) => (
          <Card
            key={aluno.id}
            className="p-6 bg-gradient-to-b from-card to-card/80 border-border hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
          >
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-1">{aluno.nome}</h3>
                <p className="text-sm text-muted-foreground">{aluno.idade} anos</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="w-4 h-4 text-primary" />
                  <span className="text-muted-foreground">{aluno.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <GraduationCap className="w-4 h-4 text-primary" />
                  <span className="text-muted-foreground">{aluno.curso}</span>
                </div>
                {aluno.created_at && (
                  <div className="flex items-center gap-2 text-xs">
                    <Calendar className="w-3 h-3 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      Cadastrado em {new Date(aluno.created_at).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(aluno)}
                  className="flex-1 hover:bg-primary/10 hover:text-primary hover:border-primary transition-all"
                >
                  <Pencil className="w-4 h-4 mr-2" />
                  Editar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDeleteId(aluno.id)}
                  className="flex-1 hover:bg-destructive/10 hover:text-destructive hover:border-destructive transition-all"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Excluir
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este aluno? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};