import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Workflow, MessageSquare, Database, ArrowRight } from "lucide-react";

export const WebhookInstructions = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Workflow className="h-5 w-5" />
            Como Funciona o Fluxo
          </CardTitle>
          <CardDescription>
            Entenda como as mensagens chegam ao seu dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 bg-muted/50 rounded-lg">
            <div className="flex flex-col items-center text-center">
              <MessageSquare className="h-8 w-8 mb-2 text-primary" />
              <p className="font-semibold">WhatsApp</p>
              <p className="text-xs text-muted-foreground">Evolution API</p>
            </div>
            <ArrowRight className="h-5 w-5 text-muted-foreground rotate-90 md:rotate-0" />
            <div className="flex flex-col items-center text-center">
              <Workflow className="h-8 w-8 mb-2 text-primary" />
              <p className="font-semibold">n8n</p>
              <p className="text-xs text-muted-foreground">Processa dados</p>
            </div>
            <ArrowRight className="h-5 w-5 text-muted-foreground rotate-90 md:rotate-0" />
            <div className="flex flex-col items-center text-center">
              <Database className="h-8 w-8 mb-2 text-primary" />
              <p className="font-semibold">Supabase</p>
              <p className="text-xs text-muted-foreground">Salva no banco</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Passo a Passo da Configuração</CardTitle>
          <CardDescription>
            Siga estes passos para conectar tudo
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-start gap-3">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                1
              </div>
              <div className="space-y-1">
                <h3 className="font-semibold">Configure a Evolution API com seu WhatsApp</h3>
                <p className="text-sm text-muted-foreground">
                  Conecte sua conta do WhatsApp à Evolution API seguindo a documentação oficial. 
                  Você receberá um QR Code para escanear e ativar a conexão.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-start gap-3">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                2
              </div>
              <div className="space-y-1">
                <h3 className="font-semibold">Configure o webhook na Evolution API</h3>
                <p className="text-sm text-muted-foreground">
                  Nas configurações da Evolution API, adicione a URL do webhook do seu n8n para que 
                  as mensagens recebidas sejam enviadas automaticamente para lá.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-start gap-3">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                3
              </div>
              <div className="space-y-1">
                <h3 className="font-semibold">Crie seu workflow no n8n</h3>
                <p className="text-sm text-muted-foreground">
                  No n8n, crie um workflow que começa com um Webhook node para receber dados da Evolution API. 
                  Processe os dados como necessário (ex: filtros, transformações, enriquecimento).
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-start gap-3">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                4
              </div>
              <div className="space-y-1">
                <h3 className="font-semibold">Adicione o nó HTTP Request no final do workflow</h3>
                <p className="text-sm text-muted-foreground">
                  No final do seu workflow do n8n, adicione um nó "HTTP Request" com método POST. 
                  Cole a URL do webhook do Supabase (mostrada acima) e envie os dados processados.
                </p>
              </div>
            </div>
          </div>

          <Alert>
            <Workflow className="h-4 w-4" />
            <AlertDescription>
              <strong>Dica:</strong> O n8n permite que você teste o workflow passo a passo. 
              Use mensagens de teste no WhatsApp para validar que todo o fluxo está funcionando corretamente.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Formato dos Dados para Enviar ao Supabase</CardTitle>
          <CardDescription>
            O nó HTTP Request do n8n deve enviar os dados neste formato
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Configure o body do HTTP Request no n8n para enviar um JSON com esta estrutura:
            </p>
            <pre className="p-4 bg-muted rounded-md overflow-x-auto text-xs">
{`{
  "from": "5511999999999",
  "fromName": "Nome do Contato",
  "message": "Texto da mensagem",
  "timestamp": 1234567890
}`}
            </pre>
            <p className="text-sm text-muted-foreground mt-2">
              <strong>from:</strong> Número do WhatsApp (apenas números)
              <br />
              <strong>fromName:</strong> Nome do contato que enviou a mensagem
              <br />
              <strong>message:</strong> Conteúdo da mensagem recebida
              <br />
              <strong>timestamp:</strong> Unix timestamp (opcional, será gerado automaticamente se não fornecido)
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};