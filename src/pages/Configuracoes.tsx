import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WebhookConfigForm } from "@/components/configuracoes/WebhookConfigForm";
import { WebhookStatusIndicator } from "@/components/configuracoes/WebhookStatusIndicator";
import { WebhookLogsList } from "@/components/configuracoes/WebhookLogsList";
import { WebhookInstructions } from "@/components/configuracoes/WebhookInstructions";
import { MessageTemplateList } from "@/components/configuracoes/MessageTemplateList";
import { useWebhookConfig } from "@/hooks/useWebhookConfig";
import { Loader2 } from "lucide-react";

const Configuracoes = () => {
  const { config, isLoading } = useWebhookConfig();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Configurações</h1>
        <p className="text-muted-foreground mt-2">
          Gerencie suas integrações e configurações do sistema
        </p>
      </div>

      <Tabs defaultValue="webhook" className="w-full">
        <TabsList>
          <TabsTrigger value="webhook">WhatsApp Webhook</TabsTrigger>
          <TabsTrigger value="templates">Templates de Mensagens</TabsTrigger>
          <TabsTrigger value="logs">Histórico</TabsTrigger>
          <TabsTrigger value="instructions">Instruções</TabsTrigger>
        </TabsList>

        <TabsContent value="webhook" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Integração WhatsApp</CardTitle>
                <CardDescription>
                  Configure o webhook para receber mensagens do WhatsApp
                </CardDescription>
              </CardHeader>
              <CardContent>
                <WebhookConfigForm config={config} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Status da Conexão</CardTitle>
                <CardDescription>
                  Verifique o status da integração em tempo real
                </CardDescription>
              </CardHeader>
              <CardContent>
                <WebhookStatusIndicator config={config} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="templates">
          <MessageTemplateList />
        </TabsContent>

        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Sincronização</CardTitle>
              <CardDescription>
                Visualize os últimos eventos e sincronizações do webhook
              </CardDescription>
            </CardHeader>
            <CardContent>
              <WebhookLogsList configId={config?.id} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="instructions">
          <WebhookInstructions />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Configuracoes;