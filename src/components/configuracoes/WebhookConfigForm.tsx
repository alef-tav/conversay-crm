import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useWebhookConfig } from "@/hooks/useWebhookConfig";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  webhook_url: z.string().url({ message: "URL inválida" }).nonempty({ message: "URL é obrigatória" }),
  webhook_token: z.string().optional(),
  verify_token: z.string().optional(),
});

interface WebhookConfigFormProps {
  config: any;
}

export const WebhookConfigForm = ({ config }: WebhookConfigFormProps) => {
  const { saveConfig, isSaving } = useWebhookConfig();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      webhook_url: config?.webhook_url || "",
      webhook_token: config?.webhook_token || "",
      verify_token: config?.verify_token || "",
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    saveConfig(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="webhook_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL do Webhook</FormLabel>
              <FormControl>
                <Input placeholder="https://api.exemplo.com/webhook" {...field} />
              </FormControl>
              <FormDescription>
                URL da sua API de WhatsApp que enviará as mensagens
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="webhook_token"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Token de Autenticação</FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••••" {...field} />
              </FormControl>
              <FormDescription>
                Token para autenticar as requisições (opcional)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="verify_token"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Token de Verificação</FormLabel>
              <FormControl>
                <Input placeholder="token-verificacao" {...field} />
              </FormControl>
              <FormDescription>
                Token usado para verificar o webhook (opcional)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isSaving} className="w-full">
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Salvando...
            </>
          ) : (
            "Salvar Configuração"
          )}
        </Button>
      </form>
    </Form>
  );
};