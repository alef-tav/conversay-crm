-- Create contacts table for CRM leads/clients
CREATE TABLE public.contacts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  stage TEXT NOT NULL DEFAULT 'lead',
  last_contact TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT valid_stage CHECK (stage IN ('lead', 'qualificado', 'negociacao', 'cliente', 'inativo'))
);

-- Create conversations table to track message counts
CREATE TABLE public.conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  contact_id UUID NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
  message_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create tags table
CREATE TABLE public.tags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  color TEXT NOT NULL DEFAULT '#6B7280',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create contact_tags junction table
CREATE TABLE public.contact_tags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  contact_id UUID NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(contact_id, tag_id)
);

-- Enable Row Level Security
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_tags ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (you can restrict this later with auth)
CREATE POLICY "Allow public read access to contacts" 
ON public.contacts FOR SELECT USING (true);

CREATE POLICY "Allow public insert access to contacts" 
ON public.contacts FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update access to contacts" 
ON public.contacts FOR UPDATE USING (true);

CREATE POLICY "Allow public delete access to contacts" 
ON public.contacts FOR DELETE USING (true);

CREATE POLICY "Allow public read access to conversations" 
ON public.conversations FOR SELECT USING (true);

CREATE POLICY "Allow public insert access to conversations" 
ON public.conversations FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update access to conversations" 
ON public.conversations FOR UPDATE USING (true);

CREATE POLICY "Allow public read access to tags" 
ON public.tags FOR SELECT USING (true);

CREATE POLICY "Allow public insert access to tags" 
ON public.tags FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read access to contact_tags" 
ON public.contact_tags FOR SELECT USING (true);

CREATE POLICY "Allow public insert access to contact_tags" 
ON public.contact_tags FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public delete access to contact_tags" 
ON public.contact_tags FOR DELETE USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_contacts_updated_at
BEFORE UPDATE ON public.contacts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_conversations_updated_at
BEFORE UPDATE ON public.conversations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for contacts table
ALTER PUBLICATION supabase_realtime ADD TABLE public.contacts;

-- Add indexes for better performance
CREATE INDEX idx_contacts_stage ON public.contacts(stage);
CREATE INDEX idx_conversations_contact_id ON public.conversations(contact_id);
CREATE INDEX idx_contact_tags_contact_id ON public.contact_tags(contact_id);
CREATE INDEX idx_contact_tags_tag_id ON public.contact_tags(tag_id);