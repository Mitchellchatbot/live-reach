

## Plan: Replace Widget Polling with Realtime Subscriptions

### Current Problem

The widget uses **polling** (every 2-3 seconds via `widget-get-messages` Edge Function) in two places:

1. **Background poll** (lines 2152-2258): Polls every 2s for new human agent messages
2. **Hybrid flow poll loop** (lines 1578-1652): Polls every 1.5-3s during the AI response delay window to check for human takeover, pause/cancel, and edits

Each poll hits an Edge Function that makes 2 DB queries (validate conversation + fetch messages). With 10 concurrent users, this creates dozens of function invocations per second.

### Why Polling Exists Today

The widget runs inside a cross-origin iframe **without Supabase authentication**. Supabase Realtime requires the anon key and respects RLS policies. Since the `messages` table has RLS policies that check `auth.uid()`, unauthenticated widget clients can't subscribe directly.

### Solution: Use Supabase Realtime with Anon Key + RLS Bypass

The Realtime publication is already enabled for `messages` and `conversations` tables. We can make the widget subscribe by:

1. **Adding an RLS SELECT policy** on `messages` that allows reads when the visitor's session is validated (using the existing `visitor_matches_session` security definer function)
2. **Subscribing from the widget** using the Supabase JS client (already imported) with channel filters scoped to the `conversation_id`

This eliminates polling entirely and replaces it with push-based updates.

### Changes

#### Database Migration
- Add a new RLS SELECT policy on `messages`: allow select when the conversation's visitor matches the requesting session (using a new security definer function that validates visitor+session ownership of a conversation, to avoid exposing the anon key to arbitrary message reads)
- Add a similar SELECT policy on `conversations` for queue state monitoring (pause/cancel/edit)

#### New Security Definer Function
Create `visitor_owns_conversation(conv_id uuid, visitor_session text)` that returns true if the conversation belongs to a visitor with the matching session_id. This keeps the security model intact without requiring auth.

#### `src/hooks/useWidgetChat.ts`
- **Replace background poll** (lines 2152-2258): Subscribe to `postgres_changes` on `messages` table filtered by `conversation_id`. On INSERT events where `sender_type = 'agent'` and `sender_id != 'ai-bot'`, add the message to state and set `humanHasTakenOver`.
- **Replace hybrid flow poll loop** (lines 1578-1652): Subscribe to `postgres_changes` on `conversations` table filtered by `id = conversationId`. Listen for UPDATE events to detect changes to `ai_queued_at` (cancel), `ai_queued_paused` (pause/resume), `ai_queued_preview` (edits), and `ai_queued_window_ms` (send now). Use a promise-based approach where the subscription resolves/rejects based on events received, replacing the sleep+poll loop.
- **Replace typing phase polls** (lines 1775-1816, 1822-1863): Same conversation subscription handles pause/cancel during typing simulation.
- Keep `widget-get-messages` Edge Function as a **one-time initial load** to fetch message history when a returning visitor reopens the widget — but remove all interval-based polling.

#### `supabase/functions/widget-get-messages/index.ts`
- No changes needed — still used for initial history load on reconnect.

#### `supabase/functions/widget-save-message/index.ts`
- No changes needed — still saves messages; Realtime will push the new row automatically.

### Architecture After Change

```text
Before (per message exchange):
  Widget → poll widget-get-messages every 2s → Edge Function → 2 DB queries → response
  Widget → poll during 15s delay window (5-10 polls) → Edge Function → 2 DB queries each
  Total: ~8-12 Edge Function calls per message exchange per user

After:
  Widget → supabase.channel().on('postgres_changes', ...).subscribe()
  DB INSERT/UPDATE → Realtime pushes row to widget (zero Edge Function calls)
  Total: 0 polling Edge Function calls per message exchange
```

### Important Considerations

- The Realtime subscription uses the **anon key** (already available in the widget via `VITE_SUPABASE_PUBLISHABLE_KEY`). The RLS policy ensures only messages for the visitor's own conversation are visible.
- Channel subscriptions are scoped with a filter like `filter: 'conversation_id=eq.{convId}'` to avoid receiving messages from other conversations.
- Fallback: if the Realtime connection drops, the widget will do a one-time fetch via `widget-get-messages` to catch up, then re-subscribe. No interval polling.
- The `conversations` subscription replaces all queue-state polling (pause, cancel, edit, send-now).

