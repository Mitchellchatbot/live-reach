import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, propertyContext, personalityPrompt, agentName, basePrompt, naturalLeadCaptureFields } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY is not configured');
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log('Processing chat request with', messages?.length || 0, 'messages');
    if (agentName) {
      console.log('Using AI agent:', agentName);
    }

    // Default base prompt if none provided
    const defaultBasePrompt = `You're a support team member at an addiction treatment center.

Your job:
- Help visitors understand treatment options
- Answer questions about recovery
- Encourage that first step toward help

Keep it real:
- Short sentences. 1-2 max per response.
- No fluff. Get to the point.
- Sound human. Use contractions.
- Never say you're AI, a bot, or automated
- If asked, redirect: "How can I help you today?"
- Don't split your answer into two paragraphs
- Text like a human would

Never give medical advice. If crisis, suggest calling a helpline.`;

    // Use custom base prompt if provided, otherwise use default
    const effectiveBasePrompt = basePrompt || defaultBasePrompt;

    // Build natural lead capture instructions if fields are specified
    let leadCaptureInstructions = '';
    if (naturalLeadCaptureFields && naturalLeadCaptureFields.length > 0) {
      const hasEmail = naturalLeadCaptureFields.includes('email');
      const hasPhone = naturalLeadCaptureFields.includes('phone');
      const hasName = naturalLeadCaptureFields.includes('name');
      const hasInsurance = naturalLeadCaptureFields.includes('insurance_card');
      
      let fieldInstructions = [];
      if (hasName) fieldInstructions.push('- Ask for their name first');
      if (hasEmail && hasPhone) {
        fieldInstructions.push('- Ask for email AND phone number together in the same message');
      } else if (hasEmail) {
        fieldInstructions.push('- Ask for their email address');
      } else if (hasPhone) {
        fieldInstructions.push('- Ask for their phone number');
      }
      if (hasInsurance) {
        fieldInstructions.push('- Ask for a photo of the FRONT of their insurance card (mention they can tap the image button to upload). If they decline or refuse to upload the front, do NOT ask for the back.');
      }
      
      leadCaptureInstructions = `

CRITICAL - LEAD CAPTURE PRIORITY:
Your goal is to naturally collect visitor contact information during the conversation.
After listening to what the visitor says and giving a short helpful response, gently ask for information.

Collection order:
${fieldInstructions.join('\n')}

IMPORTANT RULES:
- If the visitor declines to provide ANY piece of information, respect that and STOP asking for more details. Move on and just help them.
- Never pressure or repeat asks. One gentle attempt per field is enough.
- Be warm and conversational, not robotic.
- If they share info voluntarily, acknowledge it warmly.`;
    }

    // Build system prompt - combine base prompt with personality if provided
    let systemPrompt: string;
    
    if (personalityPrompt) {
      // Use the AI agent's custom personality on top of base prompt
      systemPrompt = `${personalityPrompt}

${effectiveBasePrompt}${leadCaptureInstructions}

${propertyContext ? `Property context: ${propertyContext}` : ''}`;
    } else {
      // Just use the base prompt
      systemPrompt = `${effectiveBasePrompt}${leadCaptureInstructions}

${propertyContext ? `Property context: ${propertyContext}` : ''}`;
    }

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'Service temporarily unavailable. Please try again later.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      return new Response(JSON.stringify({ error: 'AI service error' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Streaming response from AI gateway');

    return new Response(response.body, {
      headers: { ...corsHeaders, 'Content-Type': 'text/event-stream' },
    });
  } catch (error) {
    console.error('Chat AI error:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
