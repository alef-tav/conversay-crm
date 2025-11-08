import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { MessageTemplateForm } from "./MessageTemplateForm";
import { useMessageTemplates, MessageTemplate } from "@/hooks/useMessageTemplates";
import { Plus, Edit, Trash2, Copy, TrendingUp } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export const MessageTemplateList = () => {
  const { templates, createTemplate, updateTemplate, deleteTemplate, isCreating, isUpdating, isDeleting } = useMessageTemplates();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<MessageTemplate | undefined>();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleEdit = (template: MessageTemplate) => {
    setEditingTemplate(template);
    setIsFormOpen(true);
  };

  const handleCreate = () => {
    setEditingTemplate(undefined);
    setIsFormOpen(true);
  };

  const handleSubmit = (values: any) => {
    if (editingTemplate) {
      updateTemplate(values);
    } else {
      createTemplate(values);
    }
  };

  const handleCopyContent = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({
      title: "Copiado!",
      description: "Conteúdo copiado para a área de transferência.",
    });
  };

  const getCategoryBadgeVariant = (category?: string) => {
    switch (category) {
      case "boas-vindas":
        return "default";
      case "follow-up":
        return "secondary";
      case "agradecimento":
        return "outline";
      default:
        return "secondary";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Templates de Mensagens</h2>
          <p className="text-muted-foreground">
            Crie templates para respostas rápidas aos seus contatos
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Template
        </Button>
      </div>

      {templates.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">Nenhum template criado ainda</p>
            <Button onClick={handleCreate} variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              Criar Primeiro Template
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {templates.map((template) => (
            <Card key={template.id} className={!template.is_active ? "opacity-60" : ""}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <CardDescription className="mt-1 flex items-center gap-2">
                      {template.category && (
                        <Badge variant={getCategoryBadgeVariant(template.category)}>
                          {template.category}
                        </Badge>
                      )}
                      {!template.is_active && <Badge variant="outline">Inativo</Badge>}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {template.content}
                </p>

                {template.usage_count > 0 && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <TrendingUp className="h-3 w-3" />
                    Usado {template.usage_count}x
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleCopyContent(template.content)}
                  >
                    <Copy className="mr-2 h-3 w-3" />
                    Copiar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(template)}
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDeletingId(template.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <MessageTemplateForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSubmit={handleSubmit}
        isLoading={isCreating || isUpdating}
        template={editingTemplate}
      />

      <AlertDialog open={!!deletingId} onOpenChange={() => setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Template</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este template? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deletingId) {
                  deleteTemplate(deletingId);
                  setDeletingId(null);
                }
              }}
              disabled={isDeleting}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};