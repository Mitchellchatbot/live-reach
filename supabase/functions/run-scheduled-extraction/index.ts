// Cron-triggered: extracts visitor info for conversations with recent visitor activity
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, serviceKey);

  const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
  const oneMinAgo = new Date(Date.now() - 60 * 1000).toISOString();

  // Find conversations where visitor was active in the last 5 min
  // and extraction hasn't run in the last 1 min
  const { data: convos, error } = await supabase
    .from("conversations")
    .select("id, visitor_id")
    .gt("last_visitor_message_at", fiveMinAgo)
    .or(`last_extraction_at.is.null,last_extraction_at.lt.${oneMinAgo}`)
    .neq("status", "closed")
    .limit(50);

  if (error) {
    console.error("run-scheduled-extraction: query error", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  if (!convos || convos.length === 0) {
    return new Response(JSON.stringify({ processed: 0 }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  console.log(`run-scheduled-extraction: processing ${convos.length} conversations`);

  let processed = 0;

  for (const conv of convos) {
    try {
      // Get conversation history
      const { data: msgs } = await supabase
        .from("messages")
        .select("sender_type, content")
        .eq("conversation_id", conv.id)
        .order("sequence_number", { ascending: true })
        .limit(50);

      if (!msgs || msgs.length === 0) continue;

      const conversationHistory = msgs.map((m: { sender_type: string; content: string }) => ({
        role: m.sender_type === "visitor" ? "user" : "assistant",
        content: m.content,
      }));

      // Call extract-visitor-info synchronously so we can stamp last_extraction_at after
      const res = await fetch(`${supabaseUrl}/functions/v1/extract-visitor-info`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${serviceKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ visitorId: conv.visitor_id, conversationHistory }),
      });

      if (!res.ok) {
        console.error(`Extraction failed for conv ${conv.id}: ${res.status}`);
        continue;
      }

      // Stamp last_extraction_at
      await supabase
        .from("conversations")
        .update({ last_extraction_at: new Date().toISOString() })
        .eq("id", conv.id);

      processed++;
    } catch (e) {
      console.error(`Extraction error for conv ${conv.id}:`, e);
    }
  }

  console.log(`run-scheduled-extraction: completed ${processed}/${convos.length}`);

  return new Response(JSON.stringify({ processed, total: convos.length }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
