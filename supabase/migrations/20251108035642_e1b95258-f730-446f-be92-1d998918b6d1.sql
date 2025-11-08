-- Create messages table for conversation history
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('customer', 'agent', 'system')),
  sender_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  read BOOLEAN NOT NULL DEFAULT false,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Create index for faster queries
CREATE INDEX idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX idx_messages_created_at ON public.messages(created_at DESC);
CREATE INDEX idx_messages_read ON public.messages(read);

-- Enable Row Level Security
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for messages
CREATE POLICY "Allow public read access to messages"
  ON public.messages
  FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert access to messages"
  ON public.messages
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update access to messages"
  ON public.messages
  FOR UPDATE
  USING (true);

CREATE POLICY "Allow public delete access to messages"
  ON public.messages
  FOR DELETE
  USING (true);

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;