-- 1. Adicionar coluna contact_phone na tabela messages
ALTER TABLE public.messages
ADD COLUMN IF NOT EXISTS contact_phone TEXT;

-- 2. Criar índice para otimizar buscas por telefone
CREATE INDEX IF NOT EXISTS idx_messages_contact_phone 
ON public.messages (contact_phone);

-- 3. Adicionar coluna conversation_count na tabela contacts
ALTER TABLE public.contacts
ADD COLUMN IF NOT EXISTS conversation_count INTEGER DEFAULT 0;

-- 4. Atualizar conversation_count existente com base nas conversas atuais
UPDATE public.contacts c
SET conversation_count = (
  SELECT COALESCE(SUM(message_count), 0)
  FROM public.conversations
  WHERE contact_id = c.id
);

-- 5. Criar função para atualizar automaticamente conversation_count
CREATE OR REPLACE FUNCTION update_contact_conversation_count()
RETURNS TRIGGER AS $$
BEGIN
  -- Atualizar a contagem do contato quando message_count mudar
  UPDATE public.contacts
  SET conversation_count = (
    SELECT COALESCE(SUM(message_count), 0)
    FROM public.conversations
    WHERE contact_id = (
      SELECT contact_id FROM public.conversations WHERE id = NEW.conversation_id
    )
  )
  WHERE id = (
    SELECT contact_id FROM public.conversations WHERE id = NEW.conversation_id
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 6. Criar trigger para manter conversation_count atualizado
DROP TRIGGER IF EXISTS trigger_update_contact_conversation_count ON public.messages;
CREATE TRIGGER trigger_update_contact_conversation_count
AFTER INSERT OR UPDATE OR DELETE ON public.messages
FOR EACH ROW
EXECUTE FUNCTION update_contact_conversation_count();

-- 7. Criar função para popular contact_phone automaticamente em novas mensagens
CREATE OR REPLACE FUNCTION populate_contact_phone()
RETURNS TRIGGER AS $$
BEGIN
  -- Buscar o telefone do contato através da conversation
  NEW.contact_phone := (
    SELECT c.phone
    FROM public.contacts c
    JOIN public.conversations conv ON conv.contact_id = c.id
    WHERE conv.id = NEW.conversation_id
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 8. Criar trigger para popular contact_phone automaticamente
DROP TRIGGER IF EXISTS trigger_populate_contact_phone ON public.messages;
CREATE TRIGGER trigger_populate_contact_phone
BEFORE INSERT ON public.messages
FOR EACH ROW
EXECUTE FUNCTION populate_contact_phone();

-- 9. Popular contact_phone nas mensagens existentes
UPDATE public.messages m
SET contact_phone = (
  SELECT c.phone
  FROM public.contacts c
  JOIN public.conversations conv ON conv.contact_id = c.id
  WHERE conv.id = m.conversation_id
);