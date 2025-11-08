-- Criar políticas RLS para permitir inserção de dados via webhook

-- 1. Política para tabela contacts - permitir inserção anônima (webhook)
CREATE POLICY "Allow webhook to insert contacts"
  ON contacts FOR INSERT
  WITH CHECK (true);

-- 2. Política para tabela conversations - permitir inserção anônima (webhook)
CREATE POLICY "Allow webhook to insert conversations"
  ON conversations FOR INSERT
  WITH CHECK (true);

-- 3. Política para tabela messages - permitir inserção anônima (webhook)
CREATE POLICY "Allow webhook to insert messages"
  ON messages FOR INSERT
  WITH CHECK (true);

-- 4. Política para tabela webhook_logs - permitir inserção anônima
CREATE POLICY "Allow webhook to insert logs"
  ON webhook_logs FOR INSERT
  WITH CHECK (true);

-- Nota: Estas políticas permitem inserção sem autenticação, o que é necessário
-- porque o webhook do WhatsApp precisa inserir dados vindos de fontes externas.
-- A segurança é mantida porque:
-- 1. O webhook valida os dados recebidos
-- 2. A URL do webhook só é conhecida por quem configura o n8n
-- 3. Os dados são validados antes da inserção