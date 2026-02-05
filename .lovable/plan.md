

## Fix: Auto-Click Tabs Should Fully Handle Step Advancement

### Problem
When the tour reaches a "click this tab" step (Widget Embed tab, Salesforce Settings tab, Email tab) and the user presses **Next**, the auto-click logic runs but then falls through to the generic scroll-and-advance code. This causes a race condition: the tab content hasn't rendered yet, so the next step's target element doesn't exist, and the tour stops with `TARGET_NOT_FOUND`.

### Root Cause
After the `isClickRequired` block clicks the tab and waits for the next target, the code continues to the scroll block at line 776. That block calls `setRun(false)`, tries to scroll to the target (which may still not be in the DOM), sets the step index, then re-enables the tour. The timing is off because the tab click already waited, but the scroll block doesn't know that.

### Solution
After the `isClickRequired` auto-click block successfully clicks the tab and confirms the next target exists, it should **advance the step and return immediately** instead of falling through.

### File to Modify

**`src/components/dashboard/DashboardTour.tsx`** (~lines 756-774)

After the auto-click block (clicking the tab, waiting for the next target to appear), add:
- `setRun(false)`
- `setStepIndex(nextIndex)`
- `setTimeout(() => setRun(true), 200)` (slightly longer delay to let tab content settle)
- `return` to prevent falling through to the generic scroll logic

This mirrors the same pattern used for sidebar navigation transitions (e.g., analytics-to-widget-code), where the handler sets `run=false`, navigates, and returns -- letting the `useEffect` re-engage the tour on the new page. Here, instead of navigating to a new page, we just advance the step after the tab switch.

### Technical Detail

```text
Current flow (broken):
  isClickRequired block runs -> clicks tab -> waits -> falls through
  scroll block runs -> target may not exist -> tour breaks

Fixed flow:
  isClickRequired block runs -> clicks tab -> waits for target ->
  setRun(false) -> setStepIndex(next) -> setRun(true) -> return
  (scroll block is skipped)
```
