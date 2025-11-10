import { DraggableProvided } from "@hello-pangea/dnd";
import { MessageSquare, Clock, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Contact } from "./KanbanBoard";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useState } from "react";

interface LeadCardProps {
  contact: Contact;
  provided: DraggableProvided;
  isDragging: boolean;
  onDelete?: () => void;
}

const LeadCard = ({ contact, provided, isDragging, onDelete }: LeadCardProps) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const messageCount = contact.conversations?.[0]?.message_count || 0;
  const lastContact = formatDistanceToNow(new Date(contact.last_contact), {
    addSuffix: true,
    locale: ptBR,
  });

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      
      // Primeiro buscar as conversas relacionadas
      const { data: conversations } = await supabase
        .from('conversations')
        .select('id')
        .eq('contact_id', contact.id);

      // Deletar as mensagens dessas conversas
      if (conversations && conversations.length > 0) {
        const conversationIds = conversations.map(c => c.id);
        const { error: messagesError } = await supabase
          .from('messages')
          .delete()
          .in('conversation_id', conversationIds);
        
        if (messagesError) throw messagesError;
      }

      // Deletar as conversas
      const { error: conversationsError } = await supabase
        .from('conversations')
        .delete()
        .eq('contact_id', contact.id);
      
      if (conversationsError) throw conversationsError;

      // Deletar as tags do contato
      const { error: tagsError } = await supabase
        .from('contact_tags')
        .delete()
        .eq('contact_id', contact.id);
      
      if (tagsError) throw tagsError;

      // Por fim, deletar o contato
      const { error: contactError } = await supabase
        .from('contacts')
        .delete()
        .eq('id', contact.id);
      
      if (contactError) throw contactError;

      toast({
        title: "Contato excluído",
        description: "O contato e suas conversas foram removidos com sucesso.",
      });

      if (onDelete) onDelete();
    } catch (error: any) {
      toast({
        title: "Erro ao excluir",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div
      ref={provided.innerRef}
      {...provided.draggableProps}
      {...provided.dragHandleProps}
      className={cn(
        "bg-card rounded-lg p-4 border border-border transition-all hover:shadow-lg cursor-grab active:cursor-grabbing",
        isDragging && "shadow-2xl rotate-2"
      )}
    >
      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
          <span className="text-sm font-semibold text-primary">
            {contact.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2)}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-foreground truncate">{contact.name}</h4>
          <p className="text-sm text-muted-foreground">{contact.phone}</p>
        </div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-destructive"
              disabled={isDeleting}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir o contato <strong>{contact.name}</strong>?
                <br />
                Todas as conversas e mensagens relacionadas também serão removidas permanentemente.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <div className="flex items-center gap-4 mb-3 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <MessageSquare className="w-3.5 h-3.5" />
          <span>{messageCount} conversas</span>
        </div>
      </div>

      <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
        <Clock className="w-3.5 h-3.5" />
        <span>Último contato {lastContact}</span>
      </div>

      {contact.tags && contact.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {contact.tags.map((ct: any, idx: number) => (
            <span
              key={idx}
              className="px-2 py-0.5 rounded text-xs font-medium"
              style={{
                backgroundColor: `${ct.tag.color}20`,
                color: ct.tag.color,
              }}
            >
              {ct.tag.name}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default LeadCard;
