

## Problem

When switching tabs on the Notifications page, the settings components (Business Info, Slack, Email) reload their data and lose any unsaved changes. Two root causes:

1. **Radix `TabsContent` with `forceMount` still interacts with internal Radix state**, which can cause subtle remount behavior depending on the `value` prop changes routed through `useSearchParams`.

2. **Each child component (BusinessInfoSettings, SlackSettings, EmailSettings) has its own `useEffect` that re-fetches on mount**, so if they remount for any reason, all local form state is wiped.

## Solution

Replace the Radix `TabsContent` wrappers with plain `<div>` elements that use CSS `display: none` to toggle visibility. This completely bypasses Radix's mount/unmount lifecycle and guarantees components stay mounted with their state intact.

### Changes

**File: `src/pages/Notifications.tsx`**

- Keep the `TabsList` + `TabsTrigger` buttons (they still control which tab is visually active).
- Replace each `<TabsContent value="..." forceMount className={...}>` with a simple `<div style={{ display: activeTab === 'xxx' ? 'block' : 'none' }}>`.
- This ensures the child components are **always** in the React tree and never unmount/remount when switching tabs. Unsaved form data persists across tab switches.

---

### Technical Details

Current (broken):
```text
<Tabs>
  <TabsList>...</TabsList>
  <TabsContent value="slack" forceMount className={hidden}>
    <SlackSettings ... />
  </TabsContent>
  <TabsContent value="business" forceMount className={hidden}>
    <BusinessInfoSettings ... />
  </TabsContent>
</Tabs>
```

Fixed:
```text
<Tabs>
  <TabsList>...</TabsList>
</Tabs>
<div style={{ display: activeTab === 'slack' ? 'block' : 'none' }}>
  <SlackSettings ... />
</div>
<div style={{ display: activeTab === 'business' ? 'block' : 'none' }}>
  <BusinessInfoSettings ... />
</div>
```

The `<Tabs>` component still wraps the trigger buttons so they highlight correctly, but the content panels are rendered outside of Radix's control entirely. This is a minimal, reliable fix that preserves all existing behavior while preventing any remounting.

