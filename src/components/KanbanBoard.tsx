import { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import KanbanColumn from "./KanbanColumn";
import LeadCard from "./LeadCard";

export type Stage = "lead" | "qualificado" | "negociacao" | "cliente" | "inativo";

export interface Contact {
  id: string;
  name: string;
  phone: string;
  stage: Stage;
  last_contact: string;
  conversations?: { message_count: number }[];
  tags?: { tag: { name: string; color: string } }[];
}

const stages: { id: Stage; label: string; color: string }[] = [
  { id: "lead", label: "Lead", color: "stage-lead" },
  { id: "qualificado", label: "Qualificado", color: "stage-qualificado" },
  { id: "negociacao", label: "Negociação", color: "stage-negociacao" },
  { id: "cliente", label: "Cliente", color: "stage-cliente" },
  { id: "inativo", label: "Inativo", color: "stage-inativo" },
];

const KanbanBoard = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedStage, setSelectedStage] = useState<Stage | "all">("all");
  const { toast } = useToast();

  useEffect(() => {
    fetchContacts();

    // Subscribe to real-time updates
    const channel = supabase
      .channel("contacts-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "contacts",
        },
        () => {
          fetchContacts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchContacts = async () => {
    const { data, error } = await supabase
      .from("contacts")
      .select(
        `
        *,
        conversations(message_count),
        contact_tags(tag:tags(*))
      `
      )
      .order("last_contact", { ascending: false });

    if (error) {
      toast({
        title: "Erro ao carregar contatos",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    setContacts((data as any) || []);
  };

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const { draggableId, destination } = result;
    const newStage = destination.droppableId as Stage;

    // Optimistic update
    setContacts((prev) =>
      prev.map((contact) =>
        contact.id === draggableId ? { ...contact, stage: newStage } : contact
      )
    );

    // Update in database
    const { error } = await supabase
      .from("contacts")
      .update({ stage: newStage, last_contact: new Date().toISOString() })
      .eq("id", draggableId);

    if (error) {
      toast({
        title: "Erro ao atualizar contato",
        description: error.message,
        variant: "destructive",
      });
      fetchContacts(); // Revert on error
    }
  };

  const getContactsByStage = (stage: Stage) => {
    return contacts.filter((contact) => contact.stage === stage);
  };

  const filteredStages = selectedStage === "all" ? stages : stages.filter((s) => s.id === selectedStage);

  return (
    <div className="space-y-4">
      <div className="flex gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setSelectedStage("all")}
          className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
            selectedStage === "all"
              ? "bg-primary text-primary-foreground"
              : "bg-card text-card-foreground hover:bg-muted"
          }`}
        >
          Todos
        </button>
        {stages.map((stage) => (
          <button
            key={stage.id}
            onClick={() => setSelectedStage(stage.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              selectedStage === stage.id
                ? `bg-${stage.color} text-foreground`
                : "bg-card text-card-foreground hover:bg-muted"
            }`}
            style={
              selectedStage === stage.id
                ? { backgroundColor: `hsl(var(--${stage.color}))` }
                : undefined
            }
          >
            • {stage.label}
          </button>
        ))}
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid gap-4 auto-cols-[320px] grid-flow-col overflow-x-auto pb-4">
          {filteredStages.map((stage) => {
            const stageContacts = getContactsByStage(stage.id);
            return (
              <Droppable key={stage.id} droppableId={stage.id}>
                {(provided, snapshot) => (
                  <KanbanColumn
                    title={stage.label}
                    count={stageContacts.length}
                    color={stage.color}
                    isDraggingOver={snapshot.isDraggingOver}
                    provided={provided}
                  >
                    {stageContacts.map((contact, index) => (
                      <Draggable key={contact.id} draggableId={contact.id} index={index}>
                        {(provided, snapshot) => (
                          <LeadCard
                            contact={contact}
                            provided={provided}
                            isDragging={snapshot.isDragging}
                          />
                        )}
                      </Draggable>
                    ))}
                  </KanbanColumn>
                )}
              </Droppable>
            );
          })}
        </div>
      </DragDropContext>
    </div>
  );
};

export default KanbanBoard;
