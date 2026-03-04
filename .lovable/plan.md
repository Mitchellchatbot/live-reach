

## Plan: Fix Timer Pause During Editing (Both Visual and Functional)

There are **two separate bugs** causing the timer to keep counting down and messages to still deliver during editing:

### Bug 1: ConversationList sidebar badge ignores pause entirely

The `AgentCountdownBadge` component in `ConversationList.tsx` (lines 14-37) calculates remaining time with zero pause awareness. It just does `Date.now() - aiQueuedAt.getTime()` regardless of whether the queue is paused. This is the `⚡ 8s` badge you see ticking down in the sidebar.

**Fix**: Pass `aiQueuedPaused` to the badge and stop the countdown when paused. Show a "Paused" indicator instead.

### Bug 2: ChatPanel timer ref update timing

The `isPausedRef` approach works in theory, but there's a subtle issue: the `update()` function inside the interval does `if (isPausedRef.current) return;` — this prevents updating the display but the underlying time keeps passing. When the pause ends, the offset calculation should compensate, but there may be an off-by-one-tick issue where the timer jumps. More critically, the `update()` function runs first on mount (line 503: `update();`) before the interval, and the effect that sets `isPausedRef.current` may not have fired yet.

**Fix**: Simplify the timer approach - instead of tracking pause offsets, simply stop and restart the interval when pause state changes, and freeze `queueSecondsLeft` at its current value when paused.

### Bug 3: Widget delivery race condition

The widget polls every 3 seconds. If the agent clicks Edit when there are fewer than 3 seconds remaining, the widget's next poll may not fire before the deadline. The final guard check at line 1713 should catch this, but there's a window where the DB write hasn't committed yet.

**Fix**: Reduce the poll interval from 3000ms to 1500ms for the last 10 seconds of the countdown. Also, the widget should do a mandatory pause check right before starting typing simulation (already exists as final guard, but ensure it's robust).

### Changes

**`src/components/dashboard/ConversationList.tsx`**:
- Add `aiQueuedPaused` to the `AgentCountdownBadge` props
- When paused, show "⏸" or freeze the display instead of counting down
- Pass `aiQueuedPaused` from the conversation data through to the badge

**`src/components/dashboard/ChatPanel.tsx`**:
- Simplify the timer: when `isPaused` becomes true, capture the current `queueSecondsLeft` and stop updating. When unpaused, recalculate the new `aiQueuedAt` effective start time.

**`src/hooks/useWidgetChat.ts`**:
- In the polling wait loop (line 1577), reduce `POLL_INTERVAL` to 1500ms when remaining time is under 10 seconds, to reduce the race window.

**`src/pages/Dashboard.tsx`** and **`src/hooks/useConversations.ts`**:
- Ensure `aiQueuedPaused` is passed through to the ConversationList component's conversation objects (verify it's already there).

