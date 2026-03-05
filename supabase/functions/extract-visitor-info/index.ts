import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ExtractedInfo {
  name?: string;
  email?: string;
  phone?: string;
  age?: string;
  occupation?: string;
  addiction_history?: string;
  drug_of_choice?: string;
  treatment_interest?: string;
  insurance_info?: string;
  urgency_level?: string;
}

const EXTRACT_FIELDS: (keyof ExtractedInfo)[] = [
  'name', 'email', 'phone', 'age', 'occupation',
  'addiction_history', 'drug_of_choice', 'treatment_interest',
  'insurance_info', 'urgency_level',
];

const isPlaceholder = (val?: string | null): boolean => {
  if (!val) return true;
  const normalized = val.trim().toLowerCase();
  return ['n/a', 'na', 'none', 'unknown', 'not provided', 'not available', ''].includes(normalized);
};

const cleanValue = (val?: string): string | undefined => {
  if (!val || isPlaceholder(val)) return undefined;
  return val;
};

// ── Side-effect dispatchers ──────────────────────────────────────────────

/** Fire-and-forget: send phone/email notifications for newly captured phone */
function dispatchPhoneNotifications(
  supabase: ReturnType<typeof createClient>,
  propertyId: string,
  conversationId: string,
  visitorName: string | null,
  phone: string,
) {
  const payload = {
    propertyId,
    eventType: 'phone_submission',
    visitorName,
    visitorPhone: phone,
    conversationId,
  };
  supabase.functions.invoke('send-email-notification', { body: payload }).catch((e: any) =>
    console.error('Phone email notification error:', e)
  );
  supabase.functions.invoke('send-slack-notification', { body: payload }).catch((e: any) =>
    console.error('Phone slack notification error:', e)
  );
}

/** Fire-and-forget: auto-export to Salesforce when a trigger field is detected */
function dispatchSalesforceExport(
  supabaseUrl: string,
  serviceKey: string,
  propertyId: string,
  visitorId: string,
  triggerField: string,
) {
  console.log(`${triggerField} detected – triggering Salesforce auto-export for visitor`, visitorId);
  fetch(`${supabaseUrl}/functions/v1/salesforce-export-leads`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${serviceKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      propertyId,
      visitorIds: [visitorId],
      _serviceRoleExport: true,
    }),
  }).catch((e: any) => console.error(`SF ${triggerField} auto-export error:`, e));
}

/** Check Salesforce settings and trigger export if enabled for the given trigger */
async function maybeSalesforceExport(
  supabase: ReturnType<typeof createClient>,
  supabaseUrl: string,
  serviceKey: string,
  propertyId: string,
  visitorId: string,
  triggerField: 'phone' | 'insurance',
) {
  try {
    const settingKey = triggerField === 'phone'
      ? 'auto_export_on_phone_detected'
      : 'auto_export_on_insurance_detected';

    const { data: sf } = await supabase
      .from('salesforce_settings')
      .select(`enabled, instance_url, access_token, ${settingKey}`)
      .eq('property_id', propertyId)
      .single();

    if (sf?.enabled && (sf as any)[settingKey] && sf?.instance_url && sf?.access_token) {
      dispatchSalesforceExport(supabaseUrl, serviceKey, propertyId, visitorId, triggerField);
    }
  } catch (err) {
    console.error(`Error checking SF ${triggerField} auto-export:`, err);
  }
}

// ── Main handler ─────────────────────────────────────────────────────────

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { visitorId, conversationHistory } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY is not configured');

    if (!visitorId || !conversationHistory || conversationHistory.length === 0) {
      return new Response(JSON.stringify({ extracted: false }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Get current visitor data
    const { data: visitor } = await supabase
      .from('visitors')
      .select('name, email, phone, age, occupation, addiction_history, drug_of_choice, treatment_interest, insurance_info, urgency_level')
      .eq('id', visitorId)
      .single();

    const conversationText = conversationHistory
      .map((msg: { role: string; content: string }) => `${msg.role}: ${msg.content}`)
      .join('\n');

    // ── AI extraction with 20s timeout ───────────────────────────────────
    const aiController = new AbortController();
    const aiTimeout = setTimeout(() => aiController.abort(), 20000);

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash-lite',
        messages: [
          {
            role: 'system',
            content: `You are an information extraction assistant. Analyze the conversation and extract any personal information the visitor has shared naturally. Only extract information that was explicitly stated by the visitor (user messages), not inferred. If information is not clearly stated, do NOT include it — leave the field out entirely. Never return placeholder values like "N/A", "none", "unknown", or empty strings.`
          },
          {
            role: 'user',
            content: `Extract any personal information from this conversation:\n\n${conversationText}`
          }
        ],
        tools: [
          {
            type: 'function',
            function: {
              name: 'extract_visitor_info',
              description: 'Extract personal information from the conversation',
              parameters: {
                type: 'object',
                properties: {
                  name: { type: 'string', description: "The visitor's name if they mentioned it" },
                  email: { type: 'string', description: "The visitor's email address if they shared it" },
                  phone: { type: 'string', description: "The visitor's phone number if they shared it" },
                  age: { type: 'string', description: "The visitor's age or age range if mentioned" },
                  occupation: { type: 'string', description: "The visitor's job, profession, or occupation if mentioned" },
                  addiction_history: { type: 'string', description: 'Any mention of past or current substance use, addiction history, how long they have been struggling, or relapse history' },
                  drug_of_choice: { type: 'string', description: 'Specific substances mentioned like alcohol, opioids, heroin, fentanyl, meth, cocaine, prescription pills, benzodiazepines, marijuana, etc.' },
                  treatment_interest: { type: 'string', description: 'What type of treatment they are seeking: inpatient, outpatient, detox, residential, PHP, IOP, therapy, counseling, rehab' },
                  insurance_info: { type: 'string', description: 'Insurance provider mentioned (Blue Cross, Aetna, Cigna, etc.), Medicaid, Medicare, self-pay, or concerns about payment/cost' },
                  urgency_level: { type: 'string', description: 'How urgent their situation is: crisis/immediate need, ready to start treatment, planning for near future, or just researching options' },
                },
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: 'function', function: { name: 'extract_visitor_info' } },
      }),
      signal: aiController.signal,
    });
    clearTimeout(aiTimeout);

    if (!response.ok) {
      console.error('AI extraction error:', response.status);
      return new Response(JSON.stringify({ extracted: false }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];

    if (!toolCall) {
      return new Response(JSON.stringify({ extracted: false }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let extractedInfo: ExtractedInfo;
    try {
      extractedInfo = JSON.parse(toolCall.function.arguments);
    } catch {
      return new Response(JSON.stringify({ extracted: false }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ── Diff: only update fields that are newly extracted ────────────────
    const updates: Partial<ExtractedInfo> = {};
    for (const field of EXTRACT_FIELDS) {
      const extracted = cleanValue(extractedInfo[field]);
      const existing = visitor?.[field];
      if (extracted && isPlaceholder(existing)) {
        updates[field] = extracted;
      }
    }

    if (Object.keys(updates).length === 0) {
      return new Response(JSON.stringify({ extracted: false }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Updating visitor with extracted info:', updates);

    const { error } = await supabase
      .from('visitors')
      .update(updates)
      .eq('id', visitorId);

    if (error) {
      console.error('Error updating visitor:', error);
    }

    // ── Side-effects: notifications & Salesforce (single conversation lookup) ──
    const needsNotifications = updates.phone;
    const needsSalesforce = updates.phone || updates.insurance_info;

    if (needsNotifications || needsSalesforce) {
      try {
        const { data: conv } = await supabase
          .from('conversations')
          .select('id, property_id')
          .eq('visitor_id', visitorId)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (conv) {
          // Phone notifications
          if (updates.phone) {
            dispatchPhoneNotifications(supabase, conv.property_id, conv.id, updates.name || visitor?.name || null, updates.phone);
          }

          // Salesforce auto-exports (parallel)
          const sfPromises: Promise<void>[] = [];
          if (updates.phone) {
            sfPromises.push(maybeSalesforceExport(supabase, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, conv.property_id, visitorId, 'phone'));
          }
          if (updates.insurance_info) {
            sfPromises.push(maybeSalesforceExport(supabase, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, conv.property_id, visitorId, 'insurance'));
          }
          await Promise.allSettled(sfPromises);
        }
      } catch (sideEffectErr) {
        console.error('Error in side-effects:', sideEffectErr);
      }
    }

    return new Response(JSON.stringify({ extracted: true, info: updates }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    const isAbort = error instanceof DOMException && error.name === 'AbortError';
    if (isAbort) {
      console.error('AI extraction timed out after 20s');
      return new Response(JSON.stringify({ extracted: false, error: 'AI extraction timed out' }), {
        status: 504,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    console.error('Extract visitor info error:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
