import { Search, Download, Grid, Table } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import KanbanBoard from "@/components/KanbanBoard";
import AddContactDialog from "@/components/AddContactDialog";
import { useState } from "react";

const Index = () => {
  const [viewMode, setViewMode] = useState<"kanban" | "table">("kanban");

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-4 flex-1">
            <div className="flex gap-2">
              <Button
                variant={viewMode === "kanban" ? "default" : "secondary"}
                size="sm"
                onClick={() => setViewMode("kanban")}
                className="gap-2"
              >
                <Grid className="w-4 h-4" />
                Kanban
              </Button>
              <Button
                variant={viewMode === "table" ? "default" : "secondary"}
                size="sm"
                onClick={() => setViewMode("table")}
                className="gap-2"
              >
                <Table className="w-4 h-4" />
                Tabela
              </Button>
            </div>

            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, telefone ou email..."
                className="pl-9"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" className="gap-2">
              <Download className="w-4 h-4" />
              Exportar
            </Button>
            <AddContactDialog />
          </div>
        </div>
      </div>

      <div className="p-6">
        {viewMode === "kanban" ? (
          <KanbanBoard />
        ) : (
          <div className="bg-card rounded-lg p-8 text-center">
            <Table className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Visualização em Tabela</h3>
            <p className="text-muted-foreground">
              A visualização em tabela será implementada em breve.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
