import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Copy, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";

export const WebhookConfigForm = () => {
  const projectId = "mxodnxejdlxyxeaczpma";
  const webhookUrl = `https://${projectId}.supabase.co/functions/v1/webhook-whatsapp`;
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(webhookUrl);
    setCopied(true);
    toast({
      title: "URL copiada!",
      description: "A URL do webhook foi copiada para a área de transferência.",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>URL do Webhook do Supabase</CardTitle>
        <CardDescription>
          Use esta URL no final do seu workflow do n8n para enviar os dados ao dashboard
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input 
            value={webhookUrl} 
            readOnly 
            className="font-mono text-sm"
          />
          <Button 
            onClick={copyToClipboard}
            variant="outline"
            size="icon"
            className="shrink-0"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Cole esta URL em um nó HTTP Request no seu workflow do n8n para enviar os dados processados ao Supabase.
        </p>
      </CardContent>
    </Card>
  );
};