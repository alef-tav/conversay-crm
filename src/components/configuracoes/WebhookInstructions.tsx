import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Code, Info, Link as LinkIcon } from "lucide-react";

export const WebhookInstructions = () => {
  const projectId = "mxodnxejdlxyxeaczpma";
  const webhookUrl = `https://${projectId}.supabase.co/functions/v1/webhook-whatsapp`;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Como Configurar o Webhook
          </CardTitle>
          <CardDescription>
            Siga os passos abaixo para conectar seu WhatsApp ao dashboard
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h3 className="font-semibold">1. URL do Webhook do Dashboard</h3>
            <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
              <Code className="h-4 w-4 text-muted-foreground" />
              <code className="text-sm flex-1">{webhookUrl}</code>
              <Badge>Sua URL</Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Esta é a URL que você deve configurar na sua plataforma de WhatsApp para que ela
              envie as mensagens para o dashboard.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">2. Configure na sua Plataforma WhatsApp</h3>
            <p className="text-sm text-muted-foreground">
              Acesse as configurações da sua plataforma de WhatsApp e adicione a URL acima como
              webhook de destino. Cada plataforma tem um processo diferente:
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4">
              <li>Evolution API: Configurações → Webhook → URL do Webhook</li>
              <li>WhatsApp Business API: Webhooks → Adicionar URL de Callback</li>
              <li>Baileys: Configure no arquivo de configuração</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">3. Configurar Tokens (Opcional)</h3>
            <p className="text-sm text-muted-foreground">
              Se sua plataforma requer autenticação, configure os tokens acima no formulário.
              O token de verificação é usado para validar o webhook, e o token de autenticação
              é enviado nas requisições.
            </p>
          </div>

          <Alert>
            <LinkIcon className="h-4 w-4" />
            <AlertDescription>
              <strong>Importante:</strong> Após configurar, teste a conexão usando o botão
              "Testar Conexão" para verificar se tudo está funcionando corretamente.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Formato das Mensagens</CardTitle>
          <CardDescription>
            Como as mensagens devem ser enviadas para o webhook
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              O webhook espera receber mensagens no seguinte formato JSON:
            </p>
            <pre className="p-4 bg-muted rounded-md overflow-x-auto text-xs">
{`{
  "from": "5511999999999",
  "fromName": "Nome do Contato",
  "message": "Texto da mensagem",
  "timestamp": 1234567890
}`}
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};