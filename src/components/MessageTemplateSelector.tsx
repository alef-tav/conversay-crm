import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useMessageTemplates } from "@/hooks/useMessageTemplates";
import { FileText, Search } from "lucide-react";

interface MessageTemplateSelectorProps {
  onSelectTemplate: (content: string) => void;
}

export const MessageTemplateSelector = ({ onSelectTemplate }: MessageTemplateSelectorProps) => {
  const { templates, incrementUsage } = useMessageTemplates();
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);

  const activeTemplates = templates.filter(t => t.is_active);
  const filteredTemplates = activeTemplates.filter(
    t => 
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.content.toLowerCase().includes(search.toLowerCase()) ||
      t.category?.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelectTemplate = (id: string, content: string) => {
    onSelectTemplate(content);
    incrementUsage(id);
    setOpen(false);
    setSearch("");
  };

  if (activeTemplates.length === 0) {
    return null;
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm">
          <FileText className="mr-2 h-4 w-4" />
          Templates
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="start">
        <div className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Templates de Mensagens</h4>
            <p className="text-sm text-muted-foreground">
              Selecione um template para usar
            </p>
          </div>

          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar templates..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8"
            />
          </div>

          <ScrollArea className="h-[300px]">
            <div className="space-y-2">
              {filteredTemplates.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nenhum template encontrado
                </p>
              ) : (
                filteredTemplates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => handleSelectTemplate(template.id, template.content)}
                    className="w-full text-left p-3 rounded-lg border hover:bg-accent transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <span className="font-medium text-sm">{template.name}</span>
                      {template.category && (
                        <Badge variant="secondary" className="text-xs">
                          {template.category}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {template.content}
                    </p>
                    {template.usage_count > 0 && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Usado {template.usage_count}x
                      </p>
                    )}
                  </button>
                ))
              )}
            </div>
          </ScrollArea>
        </div>
      </PopoverContent>
    </Popover>
  );
};