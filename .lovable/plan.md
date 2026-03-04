

## Problem Analysis: AI Message Sent While Agent Is Editing

There are **three gaps** in the current flow where the widget ignores the `aiQueuedPaused` flag and delivers the original (unedited) message:

### Issue 1: Final Guard Check Ignores Pause State (Line ~1706-1728)

After the polling loop exits, a "final guard" fetches the conversation state one last time before starting the typing simulation. It checks for `aiQueuedAt === null` (cancel), but it **does not check `aiQueuedPaused`**. If the agent starts editing right as the deadline expires, the pause is ignored and the message proceeds to typing + delivery.

**Fix:** Add a pause check to the final guard. If `aiQueuedPaused === true`, loop/wait instead of proceeding.

### Issue 2: No Pause Check During Typing Simulation (Lines ~1730-1753)

Once the polling loop ends, the widget enters a typing simulation phase (`sleep` for calculated typing time). During this entire period (potentially several seconds), there is **zero checking** of the pause/cancel state. If an agent clicks Edit during typing, it's too late — the message will be saved and shown to the visitor.

**Fix:** Break the typing sleep into smaller chunks and re-poll the conversation state periodically. If paused or cancelled, abort before saving.

### Issue 3: Poll Interval Creates a 3-Second Blind Spot

The poll happens every 3 seconds. If an agent pauses right after a poll, the widget won't see it for up to 3 seconds. Combined with the deadline check (`Date.now() < deadline`), the loop can exit during this blind spot. The 60-second extension only applies if the pause is detected during the poll — if the loop exits first, the pause is missed entirely.

**Fix:** This is mitigated by fixes #1 and #2 above (the final guard and typing-phase checks catch what the polling loop misses).

### Implementation Plan

1. **Modify the final guard block** (after the polling loop, before typing) to also check `aiQueuedPaused`. If paused, enter a secondary wait loop that polls every 2 seconds until either unpaused or cancelled.

2. **Modify the typing simulation** to poll the conversation state every ~2 seconds during the typing sleep. If `aiQueuedPaused` is true, pause the typing. If `aiQueuedAt` is null, abort entirely.

3. **Update `aiContent` from `aiQueuedPreview`** during both the final guard wait and typing-phase polls, so if the agent edits the text, the widget delivers the edited version.

### Files to Change

- `src/hooks/useWidgetChat.ts` — Final guard block (~line 1706) and typing simulation block (~line 1730)

