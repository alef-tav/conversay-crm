import { DroppableProvided } from "@hello-pangea/dnd";
import { cn } from "@/lib/utils";

interface KanbanColumnProps {
  title: string;
  count: number;
  color: string;
  isDraggingOver: boolean;
  provided: DroppableProvided;
  children: React.ReactNode;
}

const KanbanColumn = ({
  title,
  count,
  color,
  isDraggingOver,
  provided,
  children,
}: KanbanColumnProps) => {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        <span
          className="px-2 py-1 rounded-full text-xs font-medium text-foreground"
          style={{ backgroundColor: `hsl(var(--${color}) / 0.2)` }}
        >
          {count}
        </span>
      </div>

      <div
        ref={provided.innerRef}
        {...provided.droppableProps}
        className={cn(
          "flex-1 space-y-3 rounded-lg p-3 transition-colors min-h-[500px]",
          isDraggingOver ? "bg-muted/50" : "bg-background/50"
        )}
      >
        {children}
        {provided.placeholder}
      </div>
    </div>
  );
};

export default KanbanColumn;
