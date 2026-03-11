

## Replace Lovable AI Gateway with OpenAI GPT-4o

### Summary
Replace all 6 edge functions that currently use the Lovable AI Gateway (`ai.gateway.lovable.dev`) with direct OpenAI API calls using `gpt-4o`.

### Prerequisites
- Add an `OPENAI_API_KEY` secret to the project (will prompt you to enter it)

### Functions to Update

| Function | Current Model | Change |
|---|---|---|
| `chat-ai` | gemini-2.5-flash | → `gpt-4o` via OpenAI API |
| `sales-chat` | gemini-2.5-flash-lite | → `gpt-4o` via OpenAI API |
| `generate-demo-script` | gemini-3-flash-preview | → `gpt-4o` via OpenAI API |
| `generate-greeting` | gemini-2.5-flash | → `gpt-4o` via OpenAI API |
| `extract-visitor-info` | gemini-2.5-flash | → `gpt-4o` via OpenAI API |
| `salesforce-export-leads` | gemini-2.5-flash | → `gpt-4o` via OpenAI API |

### Changes Per Function
For each function, the edit is mechanical:

1. **Replace the API URL**:
   - From: `https://ai.gateway.lovable.dev/v1/chat/completions`
   - To: `https://api.openai.com/v1/chat/completions`

2. **Replace the API key**:
   - From: `Deno.env.get('LOVABLE_API_KEY')`
   - To: `Deno.env.get('OPENAI_API_KEY')`

3. **Replace the model name**:
   - From: `google/gemini-*` variants
   - To: `gpt-4o`

4. **Authorization header stays the same format**: `Bearer ${key}`

The OpenAI API is compatible with the same request/response format already used, so no structural changes to request bodies, tool calling, or response parsing are needed.

### No Frontend Changes
All AI calls go through edge functions — no client-side code changes required.

