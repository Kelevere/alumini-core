-- Criar tabela de alunos
CREATE TABLE public.alunos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  idade INTEGER NOT NULL CHECK (idade > 0 AND idade < 150),
  email TEXT NOT NULL UNIQUE,
  curso TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.alunos ENABLE ROW LEVEL SECURITY;

-- Políticas RLS - Permitir acesso público para este exemplo de CRUD
CREATE POLICY "Permitir leitura pública de alunos"
  ON public.alunos FOR SELECT
  USING (true);

CREATE POLICY "Permitir inserção pública de alunos"
  ON public.alunos FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Permitir atualização pública de alunos"
  ON public.alunos FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Permitir exclusão pública de alunos"
  ON public.alunos FOR DELETE
  USING (true);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.alunos
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();