import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Loader2 } from "lucide-react";

interface WebhookLogsListProps {
  configId?: string;
}

export const WebhookLogsList = ({ configId }: WebhookLogsListProps) => {
  const { data: logs, isLoading } = useQuery({
    queryKey: ["webhook-logs", configId],
    queryFn: async () => {
      if (!configId) return [];

      const { data, error } = await supabase
        .from("webhook_logs")
        .select("*")
        .eq("webhook_config_id", configId)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      return data || [];
    },
    enabled: !!configId,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!logs || logs.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>Nenhum log encontrado</p>
        <p className="text-sm mt-1">Os eventos serão registrados aqui</p>
      </div>
    );
  }

  const getEventBadge = (eventType: string) => {
    switch (eventType) {
      case "message_received":
        return <Badge>Mensagem</Badge>;
      case "status_update":
        return <Badge variant="secondary">Status</Badge>;
      case "error":
        return <Badge variant="destructive">Erro</Badge>;
      default:
        return <Badge variant="outline">{eventType}</Badge>;
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Data/Hora</TableHead>
            <TableHead>Tipo de Evento</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Tempo de Resposta</TableHead>
            <TableHead>Detalhes</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.map((log) => (
            <TableRow key={log.id}>
              <TableCell className="font-medium">
                {format(new Date(log.created_at), "dd/MM/yyyy HH:mm:ss", { locale: ptBR })}
              </TableCell>
              <TableCell>{getEventBadge(log.event_type)}</TableCell>
              <TableCell>
                {log.status_code && (
                  <Badge variant={log.status_code < 400 ? "default" : "destructive"}>
                    {log.status_code}
                  </Badge>
                )}
              </TableCell>
              <TableCell>
                {log.response_time_ms ? `${log.response_time_ms}ms` : "-"}
              </TableCell>
              <TableCell className="max-w-xs truncate">
                {log.error_message || "Sucesso"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};