

## Chat Flow Performance Optimization Plan — COMPLETED ✅

All 6 optimizations implemented:

### 1. ✅ Background stale cleanup
Moved `close-stale-conversations` from blocking every `fetchConversationsData` call to a 60s background interval via `useEffect` + `setInterval`.

### 2. ✅ Merge create-conversation into save-message
`widget-save-message` now accepts optional `propertyId` and auto-creates conversations atomically when no `conversationId` is provided. Eliminates one full Edge Function round-trip.

### 3. ✅ Parallel AI generation + message save
Visitor message save is now fire-and-forget (not awaited) for subsequent messages, allowing AI generation to start immediately in parallel. Only the first message (which creates the conversation) is awaited.

### 4. ✅ Merge messages into bootstrap
`widget-bootstrap` now returns `messages`, `aiEnabled`, `aiQueuedAt`, `aiQueuedPaused`, `aiQueuedPreview`, and `aiQueuedWindowMs` in its response. The separate `widget-get-messages` call is eliminated for returning visitors.

### 5. ✅ Remove redundant history fetches
`autoReplyIfPending` and the hybrid flow now use `messagesRef.current` (synced via `useEffect`) instead of making DB round-trips to `widget-get-messages`.

### 6. ✅ Single-query dashboard fetch
`fetchSingleConversation` in `useConversations.ts` now uses embedded select `conversations.select('*, visitor:visitors(*), property:properties(*), messages(*)')` — single DB call instead of two sequential ones.

### Estimated total savings: ~1-2.5s faster end-to-end
