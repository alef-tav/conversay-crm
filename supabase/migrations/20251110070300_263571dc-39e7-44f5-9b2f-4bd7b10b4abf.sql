-- Atualizar política RLS para permitir que usuários deletem contatos não atribuídos
DROP POLICY IF EXISTS "Users can delete own contacts" ON contacts;

CREATE POLICY "Users can delete own contacts" ON contacts
  FOR DELETE
  USING (
    auth.uid() = user_id 
    OR user_id IS NULL
  );

-- Criar política RLS para permitir deletar conversas não atribuídas
DROP POLICY IF EXISTS "Users can delete own conversations" ON conversations;

CREATE POLICY "Users can delete own conversations" ON conversations
  FOR DELETE
  USING (
    auth.uid() = user_id 
    OR user_id IS NULL
  );