

## Chat Flow Performance Optimization Plan

After reviewing the entire chat pipeline (2091-line widget hook, dashboard conversations, bootstrap, message save, AI generation), here are the key bottlenecks slowing things down — excluding humanizing delays.

### 1. Eliminate `close-stale-conversations` from every conversation fetch

**Problem**: `useConversations.ts` line 166 calls `close-stale-conversations` Edge Function on **every single `fetchConversationsData`** call. This adds 200-800ms of latency before conversations even load, and it runs `getUser()` + multiple DB queries + potentially Salesforce exports.

**Fix**: Move stale conversation cleanup to a **periodic background interval** (every 60s) instead of blocking every fetch. This alone could shave 500ms+ off initial dashboard load.

### 2. Merge `widget-create-conversation` into `widget-save-message`

**Problem**: In `sendMessage` (line 1254-1276), the flow is sequential:
1. `await ensureWidgetIds()` (bootstrap Edge Function)
2. `await ensureConversationExists()` (create-conversation Edge Function)
3. `await fetch(SAVE_MESSAGE_URL)` (save message Edge Function)

That's **3 sequential Edge Function calls** before AI generation even starts.

**Fix**: Merge `widget-create-conversation` into `widget-save-message` — if no conversation exists, create it atomically in the same call. This eliminates one full round-trip (~200-400ms).

### 3. Start AI generation while saving visitor message

**Problem**: AI generation only starts **after** the visitor message save completes (line 1276 blocks, then generation begins at line 1432). The save doesn't need to finish for AI to generate — it just needs the conversation history.

**Fix**: Fire the visitor message save as fire-and-forget (or parallel with generation start), and begin AI streaming immediately. The local `conversationHistory` already has the content.

### 4. Merge message history into `widget-bootstrap`

**Problem**: `ensureWidgetIds` (line 710-768) first calls `widget-bootstrap`, then **sequentially** calls `widget-get-messages` as a second Edge Function. Both could be done in one call.

**Fix**: Merge message history loading into the `widget-bootstrap` Edge Function for returning visitors. If a conversation exists, return the last N messages in the same response. Eliminates one full round-trip (~200-400ms) for returning visitors.

### 5. Remove redundant DB history fetches

**Problem**: `autoReplyIfPending` (line 1007-1021) calls `GET_MESSAGES_URL` to fetch the full conversation history from DB, even though the widget already has it locally in `messages` state. Then the hybrid flow does it **again** at line 1412.

**Fix**: Use the local `messages` state as the primary source for AI history. Only fall back to DB fetch when there's a suspicion of missed messages (e.g., after reconnection).

### 6. Single-query conversation fetch on dashboard

**Problem**: In the realtime handler (line 580-611), when a new conversation arrives, it fetches the conversation and then fetches messages **sequentially**.

**Fix**: Use a single query with embedded select: `conversations.select('*, visitor:visitors(*), messages(*)')` to get everything in one call.

---

### Summary of impact (estimated latency savings)

| Optimization | Estimated Saving |
|---|---|
| 1. Background stale cleanup | 300-800ms per dashboard load |
| 2. Merge create-conv into save-message | 200-400ms on first message |
| 3. Parallel AI gen + message save | 200-500ms per message |
| 4. Merge messages into bootstrap | 200-400ms for returning visitors |
| 5. Skip redundant DB history fetch | 100-300ms per AI reply |
| 6. Single-query conversation fetch | 50-150ms per new conv on dashboard |
| **Total potential** | **~1-2.5s faster end-to-end** |

### Implementation order (by impact)

1. Background stale cleanup (biggest dashboard improvement)
2. Parallel AI generation + message save (biggest widget improvement)
3. Merge messages into bootstrap (returning visitor improvement)
4. Merge create-conversation into save-message (first message improvement)
5. Single-query conversation fetch on dashboard
6. Remove redundant history fetches
