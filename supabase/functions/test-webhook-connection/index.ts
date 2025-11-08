import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { webhook_url } = await req.json();

    if (!webhook_url) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "webhook_url is required",
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    console.log("Testing webhook connection to:", webhook_url);

    const startTime = Date.now();
    const testPayload = {
      test: true,
      from: "test",
      fromName: "Test Connection",
      message: "This is a test message from the dashboard",
      timestamp: Date.now(),
    };

    const response = await fetch(webhook_url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(testPayload),
    });

    const responseTime = Date.now() - startTime;
    const isSuccess = response.ok;

    console.log(
      `Webhook test ${isSuccess ? "successful" : "failed"} - Status: ${
        response.status
      }, Time: ${responseTime}ms`
    );

    return new Response(
      JSON.stringify({
        success: isSuccess,
        status_code: response.status,
        response_time_ms: responseTime,
        message: isSuccess
          ? "Webhook está respondendo corretamente"
          : `Webhook retornou status ${response.status}`,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Test connection error:", error);

    const errorMessage = error instanceof Error ? error.message : "Failed to connect to webhook";

    return new Response(
      JSON.stringify({
        success: false,
        message: errorMessage,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});