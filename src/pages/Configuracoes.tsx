import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WebhookConfigForm } from "@/components/configuracoes/WebhookConfigForm";
import { WebhookInstructions } from "@/components/configuracoes/WebhookInstructions";
import { MessageTemplateList } from "@/components/configuracoes/MessageTemplateList";
import { WebhookLogsList } from "@/components/configuracoes/WebhookLogsList";
import { useWebhookConfig } from "@/hooks/useWebhookConfig";

const Configuracoes = () => {
  const { config } = useWebhookConfig();

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Configurações</h1>
        <p className="text-muted-foreground mt-2">
          Configure a integração WhatsApp + n8n + Supabase
        </p>
      </div>

      <Tabs defaultValue="webhook" className="space-y-6">
        <TabsList>
          <TabsTrigger value="webhook">Webhook</TabsTrigger>
          <TabsTrigger value="instructions">Instruções</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="webhook" className="space-y-6">
          <WebhookConfigForm />
        </TabsContent>

        <TabsContent value="instructions">
          <WebhookInstructions />
        </TabsContent>

        <TabsContent value="templates">
          <MessageTemplateList />
        </TabsContent>

        <TabsContent value="logs">
          <WebhookLogsList configId={config?.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Configuracoes;
