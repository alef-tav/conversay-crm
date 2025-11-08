import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const payload = await req.json();
    console.log("Webhook received:", payload);

    const { from, fromName, message, timestamp } = payload;

    if (!from || !message) {
      throw new Error("Missing required fields: from and message");
    }

    // Find or create contact
    const { data: existingContact } = await supabaseClient
      .from("contacts")
      .select("*")
      .eq("phone", from)
      .maybeSingle();

    let contactId = existingContact?.id;

    if (!existingContact) {
      const { data: newContact, error: contactError } = await supabaseClient
        .from("contacts")
        .insert({
          name: fromName || from,
          phone: from,
          stage: "lead",
          user_id: null, // Will be assigned by admin later
        })
        .select()
        .single();

      if (contactError) throw contactError;
      contactId = newContact.id;
      console.log("New contact created:", contactId);
    } else {
      // Update last_contact timestamp
      await supabaseClient
        .from("contacts")
        .update({ last_contact: new Date().toISOString() })
        .eq("id", contactId);
    }

    // Find or create conversation
    const { data: existingConversation } = await supabaseClient
      .from("conversations")
      .select("*")
      .eq("contact_id", contactId)
      .maybeSingle();

    let conversationId = existingConversation?.id;

    if (!existingConversation) {
      const { data: newConversation, error: conversationError } = await supabaseClient
        .from("conversations")
        .insert({
          contact_id: contactId,
          message_count: 0,
          user_id: existingContact?.user_id || null,
        })
        .select()
        .single();

      if (conversationError) throw conversationError;
      conversationId = newConversation.id;
      console.log("New conversation created:", conversationId);
    }

    // Create message
    const { error: messageError } = await supabaseClient
      .from("messages")
      .insert({
        conversation_id: conversationId,
        content: message,
        sender_type: "contact",
        sender_name: fromName || from,
        read: false,
        metadata: {
          timestamp: timestamp || Date.now(),
          source: "whatsapp",
        },
      });

    if (messageError) throw messageError;

    // Update conversation message count
    await supabaseClient
      .from("conversations")
      .update({
        message_count: (existingConversation?.message_count || 0) + 1,
        updated_at: new Date().toISOString(),
      })
      .eq("id", conversationId);

    // Log webhook event
    const { data: webhookConfig } = await supabaseClient
      .from("webhook_configs")
      .select("id")
      .eq("provider", "whatsapp")
      .eq("is_active", true)
      .maybeSingle();

    if (webhookConfig) {
      await supabaseClient.from("webhook_logs").insert({
        webhook_config_id: webhookConfig.id,
        event_type: "message_received",
        payload: payload,
        status_code: 200,
        response_time_ms: Date.now() - startTime,
      });

      // Update webhook config last_sync
      await supabaseClient
        .from("webhook_configs")
        .update({
          last_sync: new Date().toISOString(),
          sync_status: "success",
          error_message: null,
        })
        .eq("id", webhookConfig.id);
    }

    console.log("Message processed successfully");

    return new Response(
      JSON.stringify({
        success: true,
        message: "Message received and processed",
        contact_id: contactId,
        conversation_id: conversationId,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Webhook error:", error);

    const errorMessage = error instanceof Error ? error.message : "Unknown error";

    // Log error
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { data: webhookConfig } = await supabaseClient
      .from("webhook_configs")
      .select("id")
      .eq("provider", "whatsapp")
      .eq("is_active", true)
      .maybeSingle();

    if (webhookConfig) {
      await supabaseClient.from("webhook_logs").insert({
        webhook_config_id: webhookConfig.id,
        event_type: "error",
        status_code: 500,
        error_message: errorMessage,
        response_time_ms: Date.now() - startTime,
      });

      await supabaseClient
        .from("webhook_configs")
        .update({
          sync_status: "error",
          error_message: errorMessage,
        })
        .eq("id", webhookConfig.id);
    }

    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});