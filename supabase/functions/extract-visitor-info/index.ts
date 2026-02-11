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

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { visitorId, conversationHistory } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Supabase configuration missing');
    }

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

    // Build conversation text
    const conversationText = conversationHistory
      .map((msg: { role: string; content: string }) => `${msg.role}: ${msg.content}`)
      .join('\n');

    // Use tool calling to extract structured info
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
            content: `You are an information extraction assistant. Analyze the conversation and extract any personal information the visitor has shared naturally. Only extract information that was explicitly stated by the visitor (user messages), not inferred. If information is not clearly stated, do not include it.`
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
                  name: {
                    type: 'string',
                    description: 'The visitor\'s name if they mentioned it'
                  },
                  email: {
                    type: 'string',
                    description: 'The visitor\'s email address if they shared it'
                  },
                  phone: {
                    type: 'string',
                    description: 'The visitor\'s phone number if they shared it'
                  },
                  age: {
                    type: 'string',
                    description: 'The visitor\'s age or age range if mentioned'
                  },
                  occupation: {
                    type: 'string',
                    description: 'The visitor\'s job, profession, or occupation if mentioned'
                  },
                  addiction_history: {
                    type: 'string',
                    description: 'Any mention of past or current substance use, addiction history, how long they have been struggling, or relapse history'
                  },
                  drug_of_choice: {
                    type: 'string',
                    description: 'Specific substances mentioned like alcohol, opioids, heroin, fentanyl, meth, cocaine, prescription pills, benzodiazepines, marijuana, etc.'
                  },
                  treatment_interest: {
                    type: 'string',
                    description: 'What type of treatment they are seeking: inpatient, outpatient, detox, residential, PHP, IOP, therapy, counseling, rehab'
                  },
                  insurance_info: {
                    type: 'string',
                    description: 'Insurance provider mentioned (Blue Cross, Aetna, Cigna, etc.), Medicaid, Medicare, self-pay, or concerns about payment/cost'
                  },
                  urgency_level: {
                    type: 'string',
                    description: 'How urgent their situation is: crisis/immediate need, ready to start treatment, planning for near future, or just researching options'
                  }
                },
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: 'function', function: { name: 'extract_visitor_info' } }
      }),
    });

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

    // Only update fields that are newly extracted and not already set
    const updates: Partial<ExtractedInfo> = {};
    
    if (extractedInfo.name && !visitor?.name) {
      updates.name = extractedInfo.name;
    }
    if (extractedInfo.email && !visitor?.email) {
      updates.email = extractedInfo.email;
    }
    if (extractedInfo.phone && !visitor?.phone) {
      updates.phone = extractedInfo.phone;
    }
    if (extractedInfo.age && !visitor?.age) {
      updates.age = extractedInfo.age;
    }
    if (extractedInfo.occupation && !visitor?.occupation) {
      updates.occupation = extractedInfo.occupation;
    }
    if (extractedInfo.addiction_history && !visitor?.addiction_history) {
      updates.addiction_history = extractedInfo.addiction_history;
    }
    if (extractedInfo.drug_of_choice && !visitor?.drug_of_choice) {
      updates.drug_of_choice = extractedInfo.drug_of_choice;
    }
    if (extractedInfo.treatment_interest && !visitor?.treatment_interest) {
      updates.treatment_interest = extractedInfo.treatment_interest;
    }
    if (extractedInfo.insurance_info && !visitor?.insurance_info) {
      updates.insurance_info = extractedInfo.insurance_info;
    }
    if (extractedInfo.urgency_level && !visitor?.urgency_level) {
      updates.urgency_level = extractedInfo.urgency_level;
    }

    // Update visitor if we have new info
    if (Object.keys(updates).length > 0) {
      console.log('Updating visitor with extracted info:', updates);
      
      const { error } = await supabase
        .from('visitors')
        .update(updates)
        .eq('id', visitorId);

      if (error) {
        console.error('Error updating visitor:', error);
      }

      // Fire phone submission notifications if a new phone was captured
      if (updates.phone) {
        try {
          // Look up active conversation for this visitor to get conversationId and propertyId
          const { data: conversation } = await supabase
            .from('conversations')
            .select('id, property_id')
            .eq('visitor_id', visitorId)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          if (conversation) {
            const notificationPayload = {
              propertyId: conversation.property_id,
              eventType: 'phone_submission',
              visitorName: updates.name || visitor?.name || null,
              visitorPhone: updates.phone,
              conversationId: conversation.id,
            };

            // Fire-and-forget notifications
            supabase.functions.invoke('send-email-notification', { body: notificationPayload }).catch((e: any) =>
              console.error('Phone email notification error:', e)
            );
            supabase.functions.invoke('send-slack-notification', { body: notificationPayload }).catch((e: any) =>
              console.error('Phone slack notification error:', e)
            );
          }
        } catch (notifErr) {
          console.error('Error sending phone notifications:', notifErr);
        }
      }

      // Auto-export to Salesforce if insurance info was newly captured
      if (updates.insurance_info) {
        try {
          const conv = conversation || (await (async () => {
            const { data } = await supabase
              .from('conversations')
              .select('id, property_id')
              .eq('visitor_id', visitorId)
              .order('created_at', { ascending: false })
              .limit(1)
              .single();
            return data;
          })());

          if (conv) {
            const { data: sfSettings } = await supabase
              .from('salesforce_settings')
              .select('auto_export_on_insurance_detected, enabled, instance_url, access_token')
              .eq('property_id', conv.property_id)
              .single();

            if (sfSettings?.enabled && sfSettings?.auto_export_on_insurance_detected && sfSettings?.instance_url && sfSettings?.access_token) {
              console.log('Insurance detected – triggering Salesforce auto-export for visitor', visitorId);
              // Use direct fetch with service role key since this runs without user JWT
              fetch(`${SUPABASE_URL}/functions/v1/salesforce-export-leads`, {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  propertyId: conv.property_id,
                  visitorIds: [visitorId],
                  _serviceRoleExport: true,
                }),
              }).catch((e: any) => console.error('SF insurance auto-export error:', e));
            }
          }
        } catch (sfErr) {
          console.error('Error checking SF insurance auto-export:', sfErr);
        }
      }

      return new Response(JSON.stringify({ extracted: true, info: updates }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ extracted: false }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Extract visitor info error:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
