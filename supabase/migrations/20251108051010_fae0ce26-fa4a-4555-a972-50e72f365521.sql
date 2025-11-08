-- Habilitar RLS nas tabelas de backup criadas pela migração anterior
ALTER TABLE IF EXISTS conversations_backup ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS messages_backup ENABLE ROW LEVEL SECURITY;

-- Adicionar políticas para as tabelas de backup (somente admins podem ver)
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'conversations_backup') THEN
    EXECUTE 'CREATE POLICY "Admins can view backup" ON conversations_backup FOR SELECT USING (has_role(auth.uid(), ''admin''::app_role))';
  END IF;
  
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'messages_backup') THEN
    EXECUTE 'CREATE POLICY "Admins can view backup" ON messages_backup FOR SELECT USING (has_role(auth.uid(), ''admin''::app_role))';
  END IF;
END $$;