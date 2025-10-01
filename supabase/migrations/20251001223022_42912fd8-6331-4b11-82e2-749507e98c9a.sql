-- Atualizar políticas RLS para exigir autenticação
DROP POLICY IF EXISTS "Permitir leitura pública de alunos" ON public.alunos;
DROP POLICY IF EXISTS "Permitir inserção pública de alunos" ON public.alunos;
DROP POLICY IF EXISTS "Permitir atualização pública de alunos" ON public.alunos;
DROP POLICY IF EXISTS "Permitir exclusão pública de alunos" ON public.alunos;

-- Novas políticas: apenas usuários autenticados podem acessar
CREATE POLICY "Usuários autenticados podem ler alunos"
  ON public.alunos FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuários autenticados podem inserir alunos"
  ON public.alunos FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem atualizar alunos"
  ON public.alunos FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem deletar alunos"
  ON public.alunos FOR DELETE
  TO authenticated
  USING (true);