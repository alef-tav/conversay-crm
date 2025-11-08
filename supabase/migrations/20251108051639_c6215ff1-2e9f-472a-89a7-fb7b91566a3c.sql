-- Remover política de INSERT antiga que requer autenticação
DROP POLICY IF EXISTS "Users can insert own contacts" ON contacts;
DROP POLICY IF EXISTS "Allow webhook to insert contacts" ON contacts;

-- Criar nova política que permite INSERT para usuários autenticados OU anônimos (webhook)
-- Para usuários autenticados: user_id deve ser igual ao auth.uid()
-- Para requisições anônimas (webhook): user_id pode ser NULL
CREATE POLICY "Allow insert for authenticated users and webhook"
  ON contacts FOR INSERT
  WITH CHECK (
    -- Permite se for autenticado e user_id é o próprio usuário
    (auth.uid() = user_id)
    OR
    -- Permite se for requisição anônima (webhook) com user_id NULL ou qualquer valor
    (auth.role() = 'anon')
  );

-- Garantir que RLS está habilitado
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;