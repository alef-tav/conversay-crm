import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "@/hooks/use-toast";

interface WebhookConfig {
  id: string;
  user_id: string;
  provider: string;
  webhook_url: string;
  webhook_token?: string;
  verify_token?: string;
  is_active: boolean;
  last_sync?: string;
  sync_status: string;
  error_message?: string;
  created_at: string;
  updated_at: string;
}

export const useWebhookConfig = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: config, isLoading } = useQuery({
    queryKey: ["webhook-config", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from("webhook_configs")
        .select("*")
        .eq("user_id", user.id)
        .eq("provider", "whatsapp")
        .maybeSingle();

      if (error) throw error;
      return data as WebhookConfig | null;
    },
    enabled: !!user?.id,
  });

  const saveMutation = useMutation({
    mutationFn: async (values: Partial<WebhookConfig>) => {
      if (!user?.id) throw new Error("User not authenticated");

      if (config?.id) {
        const { data, error } = await supabase
          .from("webhook_configs")
          .update(values)
          .eq("id", config.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from("webhook_configs")
          .insert([{
            webhook_url: values.webhook_url || "",
            webhook_token: values.webhook_token,
            verify_token: values.verify_token,
            is_active: values.is_active || false,
            user_id: user.id,
            provider: "whatsapp",
          }])
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["webhook-config"] });
      toast({
        title: "Configuração salva",
        description: "As configurações do webhook foram salvas com sucesso.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao salvar",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async (isActive: boolean) => {
      if (!config?.id) throw new Error("No configuration found");

      const { data, error } = await supabase
        .from("webhook_configs")
        .update({ is_active: isActive })
        .eq("id", config.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["webhook-config"] });
      toast({
        title: "Status atualizado",
        description: "O status do webhook foi atualizado.",
      });
    },
  });

  return {
    config,
    isLoading,
    saveConfig: saveMutation.mutate,
    isSaving: saveMutation.isPending,
    toggleActive: toggleActiveMutation.mutate,
  };
};