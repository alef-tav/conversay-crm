-- Atualizar política RLS para permitir que usuários vejam contatos não atribuídos
DROP POLICY IF EXISTS "Users can view own contacts" ON contacts;

CREATE POLICY "Users can view own contacts" ON contacts
  FOR SELECT
  USING (
    auth.uid() = user_id 
    OR user_id IS NULL
  );

-- Atualizar política RLS para permitir que usuários atualizem contatos não atribuídos
DROP POLICY IF EXISTS "Users can update own contacts" ON contacts;

CREATE POLICY "Users can update own contacts" ON contacts
  FOR UPDATE
  USING (
    auth.uid() = user_id 
    OR user_id IS NULL
  );

-- Atualizar política RLS para conversas não atribuídas
DROP POLICY IF EXISTS "Users can view own conversations" ON conversations;

CREATE POLICY "Users can view own conversations" ON conversations
  FOR SELECT
  USING (
    auth.uid() = user_id 
    OR user_id IS NULL
  );

DROP POLICY IF EXISTS "Users can update own conversations" ON conversations;

CREATE POLICY "Users can update own conversations" ON conversations
  FOR UPDATE
  USING (
    auth.uid() = user_id 
    OR user_id IS NULL
  );