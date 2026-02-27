

## AI Conversation Summary for Salesforce Export

### Goal
Add the ability to generate an AI summary of the conversation transcript and send it to Salesforce as a mapped field during lead export.

### How It Works

1. **New visitor field option**: Replace the current non-functional `conversation_transcript` mapping with two options:
   - `conversation_transcript` -- Full raw transcript
   - `conversation_summary` -- AI-generated summary

2. **Export function enhancement**: When the export function encounters a `conversation_transcript` or `conversation_summary` mapping, it will:
   - Fetch all messages for the visitor's most recent conversation
   - For `conversation_transcript`: concatenate them into a readable transcript
   - For `conversation_summary`: call Lovable AI to generate a concise summary of the conversation

3. **Settings toggle**: Add a toggle in Salesforce Settings to enable/disable AI summarization (so users can choose between raw transcript and AI summary via the field mapping dropdown)

### Technical Details

**Files to modify:**

1. **`src/components/settings/SalesforceSettings.tsx`**
   - Add `conversation_summary` to the `VISITOR_FIELDS` list with label "Conversation Summary (AI)"
   - Rename existing `conversation_transcript` label to "Conversation Transcript (Full)"

2. **`supabase/functions/salesforce-export-leads/index.ts`**
   - After building `leadData` from visitor columns, check if any mapped field references `conversation_transcript` or `conversation_summary`
   - If so, fetch messages from the `messages` table for the visitor's conversation
   - For `conversation_transcript`: format messages as "Visitor: ... / Agent: ..." text
   - For `conversation_summary`: call the Lovable AI gateway (`https://ai.gateway.lovable.dev/v1/chat/completions`) with the transcript and a system prompt asking for a concise lead summary (key concerns, contact info mentioned, intent, urgency)
   - Use `LOVABLE_API_KEY` (already available as a secret) for the AI call
   - Truncate the result to fit Salesforce field limits (typically 32,000 chars for long text fields)

### Edge Cases
- If conversation has no messages, the field will be set to "No conversation recorded"
- If AI summarization fails, fall back to the raw transcript
- Summary is generated per-visitor at export time (not cached), ensuring it reflects the latest conversation state
