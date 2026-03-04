

## Plan: Remove Standalone Pause Button, Keep Auto-Pause on Edit

Yes — the widget needs to be published for the pause checks to take effect, since the widget runs on the live site. We'll remove the standalone Pause/Resume button from the dashboard UI but **keep** the auto-pause logic that triggers when editing a queued message.

### Changes to `src/components/dashboard/ChatPanel.tsx`

1. **Remove Pause/Resume button** (lines 151-164): Delete the Tooltip wrapping the Pause/Play button entirely. The Edit, Send Now, and Cancel buttons remain.

2. **Remove `Pause` and `Play` from icon imports** (line 3): Clean up unused imports.

3. **Keep existing auto-pause logic**: `handleStartEdit` still calls `onPauseAIQueue?.(true)`, and `handleSaveEdit`/`handleCancelEdit` still call `onPauseAIQueue?.(false)`. The timer display will still show "Paused" when editing.

No other files need changes.

