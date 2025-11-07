import { DraggableProvided } from "@hello-pangea/dnd";
import { MessageSquare, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Contact } from "./KanbanBoard";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface LeadCardProps {
  contact: Contact;
  provided: DraggableProvided;
  isDragging: boolean;
}

const LeadCard = ({ contact, provided, isDragging }: LeadCardProps) => {
  const messageCount = contact.conversations?.[0]?.message_count || 0;
  const lastContact = formatDistanceToNow(new Date(contact.last_contact), {
    addSuffix: true,
    locale: ptBR,
  });

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
