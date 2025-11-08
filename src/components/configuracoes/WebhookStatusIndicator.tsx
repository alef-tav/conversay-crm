import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useWebhookConfig } from "@/hooks/useWebhookConfig";
import { RefreshCw, CheckCircle2, XCircle, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface WebhookStatusIndicatorProps {
  config: any;
}

export const WebhookStatusIndicator = ({ config }: WebhookStatusIndicatorProps) => {
  const { testConnection, isTesting, toggleActive } = useWebhookConfig();

  if (!config) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <XCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
        <p>Nenhuma configuração encontrada</p>
        <p className="text-sm">Configure o webhook para começar</p>
      </div>
    );
  }

  const getStatusBadge = () => {
    if (!config.is_active) {
      return <Badge variant="secondary">Inativo</Badge>;
    }

    switch (config.sync_status) {
      case "success":
        return <Badge className="bg-green-500">Conectado</Badge>;
      case "error":
        return <Badge variant="destructive">Erro</Badge>;
      default:
        return <Badge variant="secondary">Pendente</Badge>;
    }
  };

  const getStatusIcon = () => {
    if (!config.is_active) {
      return <Clock className="h-8 w-8 text-muted-foreground" />;
    }

    switch (config.sync_status) {
      case "success":
        return <CheckCircle2 className="h-8 w-8 text-green-500" />;
      case "error":
        return <XCircle className="h-8 w-8 text-destructive" />;
      default:
        return <Clock className="h-8 w-8 text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {getStatusIcon()}
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium">Status:</span>
              {getStatusBadge()}
            </div>
            {config.last_sync && (
              <p className="text-sm text-muted-foreground mt-1">
                Última sincronização:{" "}
                {formatDistanceToNow(new Date(config.last_sync), {
                  addSuffix: true,
                  locale: ptBR,
                })}
              </p>
            )}
          </div>
        </div>
      </div>

      {config.error_message && (
        <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
          <p className="text-sm text-destructive">{config.error_message}</p>
        </div>
      )}

      <div className="flex items-center justify-between p-3 bg-muted rounded-md">
        <div>
          <p className="font-medium">Webhook Ativo</p>
          <p className="text-sm text-muted-foreground">
            {config.is_active ? "Recebendo mensagens" : "Pausado"}
          </p>
        </div>
        <Switch
          checked={config.is_active}
          onCheckedChange={(checked) => toggleActive(checked)}
        />
      </div>

      <Button
        onClick={() => testConnection()}
        disabled={isTesting || !config.webhook_url}
        variant="outline"
        className="w-full"
      >
        {isTesting ? (
          <>
            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            Testando...
          </>
        ) : (
          <>
            <RefreshCw className="mr-2 h-4 w-4" />
            Testar Conexão
          </>
        )}
      </Button>
    </div>
  );
};