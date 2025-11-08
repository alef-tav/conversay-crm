-- Remover a política anterior que tinha condições complexas
DROP POLICY IF EXISTS "Allow insert for authenticated users and webhook" ON contacts;

-- Criar política simples para inserções anônimas (webhook)
CREATE POLICY "Allow anon insert"
  ON contacts FOR INSERT
  TO anon
  WITH CHECK (true);

-- Criar política para inserções de usuários autenticados
CREATE POLICY "Allow authenticated user insert"
  ON contacts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);