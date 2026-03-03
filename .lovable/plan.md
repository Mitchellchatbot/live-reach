

## Analysis: Why the Chatbot Freezes on First Rapid Messages

After reviewing the code, here are the likely causes specific to the **first messages** of a conversation:

### Root Cause: Race Condition in `ensureWidgetIds()` and `ensureConversationExists()`

When a visitor sends 2+ messages rapidly at the **start** of a conversation (before visitor/conversation IDs exist), the concurrency guards fail because they rely on refs that haven't been set yet:

1. **Message 1** calls `ensureWidgetIds()` → starts the bootstrap network request (visitor not yet created)
2. **Message 2** calls `ensureWidgetIds()` → checks `if (visitorIdRef.current) return;` — but it's still `null` because Message 1's bootstrap hasn't returned yet → starts a **second** bootstrap request
3. Both bootstrap calls may create separate visitors, or one fails, leaving the conversation in an inconsistent state
4. Same race exists for `ensureConversationExists()` — both messages pass the `if (conversationIdRef.current) return` guard

The hybrid flow lock (`hybridFlowActiveRef`) only kicks in **after** the visitor/conversation setup (line 1386+), so it can't prevent this race.

### Why It Works Fine After the First Exchange

Once `visitorIdRef.current` and `conversationIdRef.current` are set (after the first bootstrap completes), all subsequent `ensureWidgetIds()` calls bail out immediately at the guard check. The hybrid flow lock then properly serializes AI generation.

### Fix Plan

Add a **bootstrap mutex** — a simple ref-based promise lock for `ensureWidgetIds` so concurrent callers share a single bootstrap call instead of racing:

1. Add a `bootstrapPromiseRef = useRef<Promise<void> | null>(null)` 
2. In `ensureWidgetIds`, if the ref already holds a promise, `await` it instead of starting a new bootstrap
3. Set the ref at the start of bootstrap, clear it when done
4. Apply the same pattern to `ensureConversationExists` for safety

This is a small, surgical change (~15 lines) that ensures the first rapid messages share a single visitor/conversation creation flow, after which the existing hybrid lock handles everything correctly.

