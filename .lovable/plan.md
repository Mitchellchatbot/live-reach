

## Add Properties Page to Sidebar

### Overview
Add a "Properties" navigation item under the **Manage** section in the sidebar, linking to a new `/dashboard/properties` route. This page will let users view and manage their properties (websites) in a dedicated full-page view, consistent with the existing sidebar style.

### Changes

**1. Sidebar Update** (`src/components/dashboard/DashboardSidebar.tsx`)
- Add a `Building2` icon import (from lucide-react, already used in PropertySelector)
- Insert a new `SidebarItem` under the "Manage" section, after "Team Members":
  - Route: `/dashboard/properties`
  - Icon: `Building2`
  - Label: "Properties"
  - Icon color: `#F97316` (orange, matching the property/building theme)

**2. New Properties Page** (`src/pages/Properties.tsx`)
- Create a new page component that displays properties in a card-based layout
- Reuse the existing `useConversations` hook (which already fetches properties) or query properties directly
- Include ability to view, delete, and add properties (leveraging existing `PropertySelector` logic)
- Match the page layout pattern used by TeamMembers, Analytics, etc. (PageHeader + content area with sidebar)

**3. Route Registration** (`src/App.tsx`)
- Lazy-load the new Properties page
- Add route: `/dashboard/properties` wrapped in `RequireClient`

### Technical Details

- The `Building2` icon is already imported in `PropertySelector.tsx`, confirming it's available from `lucide-react`
- The sidebar item will use `iconColor="#F97316"` for the orange tint, keeping the duotone icon container style consistent with existing items
- The new page will follow the same dashboard layout pattern (DashboardSidebar + main content area) as other `/dashboard/*` pages

