


## Chat System Audit Cleanup — COMPLETED ✅

All audit items implemented:

### 1. ✅ Dead code removed
Deleted `ensureConversationExists`, `CREATE_CONVERSATION_URL`, `refreshAiEnabledFromServer`, `GET_MESSAGES_URL`, client-side `extractVisitorInfo`, and `EXTRACT_INFO_URL`. Also removed `conversationPromiseRef`.

### 2. ✅ Lock bug fixed
Removed premature `hybridFlowActiveRef.current = false` at the end of the delay window. Lock is now held through typing simulation and only released in the `finally` block. Removed redundant lock release in `cancelledByDashboard` branch.

### 3. ✅ Shared helpers extracted
Created `buildNaturalLeadCaptureFields()` and `computeResponseDelay()` helpers. Both `autoReplyIfPending` and `sendMessage` hybrid flow now use them instead of duplicating the logic.

### 4. ✅ Proactive timer stale closure fixed
`startProactiveTimer` now reads `messagesRef.current` instead of capturing `messages` in the closure. Removed `messages` from the dependency array.

### 5. ✅ Dashboard fetch optimized
`fetchConversationsData` now uses embedded select (`conversations.select('*, messages(*)')`) — single query instead of batch-chunked message fetches.

### 6. ✅ Realtime channels consolidated
Three separate channels (messages, conversations, visitors) merged into a single `dashboard-realtime-*` channel with multiple `.on()` listeners.

### 7. ✅ Verbose logging removed
Stripped all `console.log` statements from Realtime handlers in both `useConversations.ts` and `useWidgetChat.ts`. Kept `console.warn` and `console.error`.

### Estimated reduction: ~200+ lines removed, 2 bug fixes, significant dashboard performance improvement.
