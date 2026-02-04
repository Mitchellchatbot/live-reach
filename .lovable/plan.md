

# Dashboard Tour Implementation Plan

## Overview

After the current 5-step onboarding wizard is complete, we'll guide new users through an interactive tour of the dashboard. This helps users understand where everything is and how to use the platform effectively.

## Recommended Approach: react-joyride

I recommend using **react-joyride** for the dashboard tour because:
- It's the most popular React-specific tour library (7.5k+ GitHub stars)
- Native TypeScript support
- Highly customizable tooltips that can match our design
- Supports step-by-step controlled tours with callbacks
- Easy to add to existing components without major refactoring
- Lightweight compared to alternatives

## User Experience Flow

```text
Onboarding Wizard (Steps 1-5)
         |
         v
   Completion Step
         |
         v
Navigate to Dashboard with ?tour=1
         |
         v
   Dashboard loads
         |
         v
  Tour auto-starts
         |
         v
 6-8 interactive steps highlighting key areas:
   1. Sidebar - Navigation overview
   2. Inbox - Where conversations appear
   3. Active/Closed filters
   4. Chat panel - Where you respond
   5. AI Support - Configure your AI
   6. Widget Code - Get embed code
   7. Analytics - Track performance
   8. Team Members - Add your team
         |
         v
 Tour complete -> Mark dashboard_tour_complete in DB
```

## Implementation Steps

### Step 1: Install react-joyride
Add the react-joyride package to the project dependencies.

### Step 2: Add database column for tour tracking
Create a new column `dashboard_tour_complete` on the `profiles` table to persist whether the user has seen the tour. This prevents showing the tour on every login.

### Step 3: Create a reusable DashboardTour component
Build a new component at `src/components/dashboard/DashboardTour.tsx` that:
- Defines all tour steps with targets pointing to sidebar elements
- Handles tour callbacks (next, skip, complete)
- Uses custom styling to match the app's dark sidebar theme
- Shows a progress indicator

### Step 4: Add data-tour attributes to dashboard elements
Add `data-tour="sidebar"`, `data-tour="inbox"`, etc. to the relevant elements in:
- `DashboardSidebar.tsx` - For sidebar section highlights
- `Dashboard.tsx` - For conversation list and chat panel highlights

### Step 5: Update Onboarding completion flow
Modify the "Go to Dashboard" button in Onboarding.tsx to navigate to `/dashboard?tour=1` instead of just `/dashboard`.

### Step 6: Integrate tour in Dashboard.tsx
- Detect the `?tour=1` query parameter
- Check if user hasn't completed the tour yet (from DB)
- Render the DashboardTour component conditionally
- Mark tour as complete in the database when finished or skipped

### Step 7: Add "Restart Tour" option
Add a menu item in the user profile dropdown or help section to restart the tour anytime.

## Tour Steps Content

| Step | Target | Title | Content |
|------|--------|-------|---------|
| 1 | Sidebar logo | Welcome! | This is your command center. Let me show you around. |
| 2 | Inbox section | Your Inbox | All visitor conversations appear here. New messages show badges. |
| 3 | Active filter | Active Chats | Quick filter to see ongoing conversations that need attention. |
| 4 | Conversation list | Conversation List | Click any conversation to open it. Unread ones are highlighted. |
| 5 | Chat panel | Reply to Visitors | This is where you chat with visitors. Your AI handles responses automatically. |
| 6 | AI Support link | AI Settings | Customize your AI assistant's personality and behavior here. |
| 7 | Widget Code link | Get Your Widget | Copy the embed code to add chat to your website. |
| 8 | Team Members link | Build Your Team | Invite agents to help manage conversations. |

## Technical Details

### File Changes Summary

| File | Change |
|------|--------|
| `package.json` | Add react-joyride dependency |
| `supabase/migrations/` | New migration for `dashboard_tour_complete` column |
| `src/components/dashboard/DashboardTour.tsx` | New component with tour logic |
| `src/components/dashboard/DashboardSidebar.tsx` | Add data-tour attributes |
| `src/pages/Dashboard.tsx` | Integrate tour, detect query param |
| `src/pages/Onboarding.tsx` | Navigate with ?tour=1 |
| `src/hooks/useUserProfile.ts` | Add tour_complete field |
| `src/integrations/supabase/types.ts` | Auto-updated with new column |

### Custom Styling
The tour tooltips will be styled to match the app's design system:
- Dark tooltips when highlighting sidebar (for contrast)
- Light tooltips when highlighting main content
- Smooth animations matching existing transitions
- Skip button for users who want to explore on their own

### Accessibility
- Keyboard navigation support (built into react-joyride)
- Focus management between steps
- ARIA labels for screen readers

