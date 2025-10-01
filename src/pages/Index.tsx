import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AlunoForm } from "@/components/AlunoForm";
import { AlunosList } from "@/components/AlunosList";
import { toast } from "sonner";
import { GraduationCap, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Aluno {
  id: string;
  nome: string;
  idade: number;
  email: string;
  curso: string;
  created_at?: string;
  updated_at?: string;
}

interface AlunoFormData {
  nome: string;
  idade: string;
  email: string;
  curso: string;
}

const Index = () => {
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingAluno, setEditingAluno] = useState<Aluno | null>(null);

  const fetchAlunos = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke("alunos-api", {
        method: "GET",
      });

      if (error) throw error;

      if (data.success) {
        setAlunos(data.data || []);
      } else {
        toast.error(data.message || "Erro ao carregar alunos");
      }
    } catch (error: any) {
      console.error("Erro ao buscar alunos:", error);
      toast.error("Erro ao carregar alunos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlunos();
  }, []);

  const handleCreate = async (formData: AlunoFormData) => {
    try {
      const { data, error } = await supabase.functions.invoke("alunos-api", {
        method: "POST",
        body: {
          nome: formData.nome,
          idade: parseInt(formData.idade),
          email: formData.email,
          curso: formData.curso,
        },
      });

      if (error) throw error;

      if (data.success) {
        toast.success(data.message || "Aluno cadastrado com sucesso!");
        fetchAlunos();
      } else {
        if (data.errors) {
          data.errors.forEach((err: any) => {
            toast.error(`${err.field}: ${err.message}`);
          });
        } else {
          toast.error(data.message || "Erro ao cadastrar aluno");
        }
      }
    } catch (error: any) {
      console.error("Erro ao criar aluno:", error);
      toast.error("Erro ao cadastrar aluno");
    }
  };

  const handleUpdate = async (formData: AlunoFormData) => {
    if (!editingAluno) return;

    try {
      const { data, error } = await supabase.functions.invoke(
        `alunos-api/${editingAluno.id}`,
        {
          method: "PUT",
          body: {
            nome: formData.nome,
            idade: parseInt(formData.idade),
            email: formData.email,
            curso: formData.curso,
          },
        }
      );

      if (error) throw error;

      if (data.success) {
        toast.success(data.message || "Aluno atualizado com sucesso!");
        setEditingAluno(null);
        fetchAlunos();
      } else {
        if (data.errors) {
          data.errors.forEach((err: any) => {
            toast.error(`${err.field}: ${err.message}`);
          });
        } else {
          toast.error(data.message || "Erro ao atualizar aluno");
        }
      }
    } catch (error: any) {
      console.error("Erro ao atualizar aluno:", error);
      toast.error("Erro ao atualizar aluno");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { data, error } = await supabase.functions.invoke(`alunos-api/${id}`, {
        method: "DELETE",
      });

      if (error) throw error;

      if (data.success) {
        toast.success(data.message || "Aluno excluído com sucesso!");
        fetchAlunos();
      } else {
        toast.error(data.message || "Erro ao excluir aluno");
      }
    } catch (error: any) {
      console.error("Erro ao deletar aluno:", error);
      toast.error("Erro ao excluir aluno");
    }
  };

  const handleEdit = (aluno: Aluno) => {
    setEditingAluno(aluno);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    setEditingAluno(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary/80 mb-4">
            <GraduationCap className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent mb-2">
            Sistema de Gestão de Alunos
          </h1>
          <p className="text-muted-foreground text-lg">
            CRUD completo com Node.js + TypeScript + Supabase
          </p>
        </div>

        {/* Form Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold">
              {editingAluno ? "Editar Aluno" : "Cadastrar Novo Aluno"}
            </h2>
          </div>
          <AlunoForm
            onSubmit={editingAluno ? handleUpdate : handleCreate}
            initialData={
              editingAluno
                ? {
                    nome: editingAluno.nome,
                    idade: editingAluno.idade.toString(),
                    email: editingAluno.email,
                    curso: editingAluno.curso,
                  }
                : undefined
            }
            isEditing={!!editingAluno}
            onCancel={handleCancelEdit}
          />
        </div>

        {/* List Section */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold">
              Alunos Cadastrados
              {!loading && <span className="text-muted-foreground ml-2">({alunos.length})</span>}
            </h2>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchAlunos}
              disabled={loading}
              className="hover:bg-primary/10 hover:text-primary hover:border-primary transition-all"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Atualizar
            </Button>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto text-primary mb-4" />
              <p className="text-muted-foreground">Carregando alunos...</p>
            </div>
          ) : (
            <AlunosList alunos={alunos} onEdit={handleEdit} onDelete={handleDelete} />
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;