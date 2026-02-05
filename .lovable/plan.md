
## Add Widget Code Tour After Analytics

This plan fixes the tour flow so Analytics correctly transitions to the Widget Code tour instead of ending with "Get Started!".

### Problem
The Analytics tour currently shows "Get Started!" on the last step because `isLastStep` is true for that phase. Instead, it should show a transition button like "Tour Widget Code" and navigate to the widget customization page.

### Solution

**1. Add a Transition Step at the End of Analytics Steps**

Add a new step to `analyticsSteps` that targets the Widget Code sidebar item:

```typescript
// After the analytics-stats step
{
  target: '[data-tour="widget-code-sidebar"]',
  content: "widget-code-sidebar-special",
  title: "Widget Code",
  placement: 'right',
  data: { isWidgetCodeSidebar: true },
}
```

**2. Add `data-tour` Attribute to Widget Code Sidebar Item**

In `DashboardSidebar.tsx`, add `data-tour="widget-code-sidebar"` to the Widget Code menu item so the tour can target it.

**3. Update CustomTooltip to Handle the Widget Code Sidebar Transition**

Add a special case in `CustomTooltip` for `isWidgetCodeSidebar`:
- Display a styled card explaining Widget Customization features
- Button says "Tour Widget Code" instead of "Get Started!"
- Clicking navigates to `/dashboard/widget?tour=1&tourPhase=widget-code`

**4. Add Handler Function for Widget Code Navigation**

Add `handleSetupWidgetCode` function that navigates to the widget page with tour params (similar to `handleSetupAnalytics`).

**5. Update Button Logic in CustomTooltip**

Modify the button text logic to check for `isWidgetCodeSidebar` so it shows the correct label instead of "Get Started!".

### Files to Modify

| File | Changes |
|------|---------|
| `src/components/dashboard/DashboardTour.tsx` | Add transition step to `analyticsSteps`, add `isWidgetCodeSidebar` handling in CustomTooltip, add `handleSetupWidgetCode` function, update button onClick logic |
| `src/components/dashboard/DashboardSidebar.tsx` | Add `data-tour="widget-code-sidebar"` attribute to the Widget Code menu item |

### Technical Details

**New Analytics Step (end of `analyticsSteps` array):**
```typescript
{
  target: '[data-tour="widget-code-sidebar"]',
  content: "widget-code-sidebar-special",
  title: "Widget Code",
  placement: 'right',
  data: { isWidgetCodeSidebar: true },
}
```

**CustomTooltip Addition:**
```typescript
const isWidgetCodeSidebar = step.data?.isWidgetCodeSidebar;

// In the render, add a case for isWidgetCodeSidebar similar to isAnalyticsSidebar
// Shows: Code icon, "Go Live" title, description about embedding the widget
```

**Handler Function:**
```typescript
const handleSetupWidgetCode = () => {
  setRun(false);
  navigate(`/dashboard/widget?tour=1&tourPhase=widget-code`);
};
```

**Button Logic Update (in CustomTooltip):**
```typescript
onClick={
  isAISettings ? onSetupAI : 
  isAnalyticsSidebar ? onSetupAnalytics : 
  isWidgetCodeSidebar ? onSetupWidgetCode : 
  primaryProps.onClick
}
```

```typescript
// Button text
{isAISettings ? 'Tour AI Settings' : 
 isAnalyticsSidebar ? 'View Analytics' : 
 isWidgetCodeSidebar ? 'Tour Widget Code' : 
 isLastStep ? 'Get Started!' : 'Next'}
```

### Tour Flow After Fix
1. Dashboard (5 steps) - ends with "Tour AI Settings" button
2. AI Support (5 steps) - ends with "View Analytics" button  
3. Analytics (3 steps) - ends with "Tour Widget Code" button (NEW!)
4. Widget Code (5 steps) - ends with navigation to remaining steps
5. Remaining (3 steps) - ends with "Get Started!"
