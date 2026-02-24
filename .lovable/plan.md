

## Why the App "Reloads" When You Switch Browser Tabs

There are three overlapping causes that make the entire app feel like it reloads whenever you switch away from the browser tab and come back:

### Root Causes

**1. Auth token refresh triggers a cascade of re-renders**
When you leave the tab and return, the authentication system refreshes the session token. This fires a `TOKEN_REFRESHED` event that updates the user/session state in the AuthProvider. Since almost every page depends on the user object, this triggers re-renders throughout the entire component tree. The Workspace provider also re-fetches when auth state changes, adding another layer.

**2. Short data staleness window (30 seconds)**
The data-fetching layer considers cached data "stale" after just 30 seconds. So if you're away from the tab for more than 30 seconds, every data query will re-fetch when you return, causing loading spinners and UI flickers even though nothing changed.

**3. Form state lives in component-local `useState`**
Most settings forms (Business Info, Slack, Email, etc.) store their field values in plain `useState`. When the re-render cascade from causes 1 and 2 causes these components to unmount and remount, all unsaved form data is wiped. The localStorage draft system we added only covers the Notifications page — other pages have the same vulnerability.

---

### Proposed Fixes

#### Fix 1: Suppress unnecessary auth re-renders
**File: `src/hooks/useAuth.tsx`**
- When a `TOKEN_REFRESHED` event fires and the user ID hasn't changed, skip updating `session` and `user` state entirely (currently it only skips the role fetch, but still sets session/user, which triggers re-renders throughout the app).

#### Fix 2: Increase staleTime to 5 minutes
**File: `src/App.tsx`**
- Change `staleTime` from 30 seconds to 5 minutes (`5 * 60 * 1000`). This prevents data queries from automatically re-fetching just because you tabbed away for a minute. Data will still refresh when you explicitly navigate or when mutations invalidate the cache.

#### Fix 3: Stabilize WorkspaceProvider
**File: `src/hooks/useWorkspace.tsx`**
- Add a guard so `fetchWorkspaces` doesn't re-run if data is already loaded and the user ID hasn't changed. Currently it re-runs whenever the `useCallback` dependencies change (which includes `isClient`, `isAdmin`, `isAgent` — values that get briefly set to false during auth refresh).

---

### Technical Details

**Auth fix (useAuth.tsx):**
```text
Current behavior on TOKEN_REFRESHED:
  - Skips role fetch (good)
  - Still calls setSession() and setUser() (triggers full app re-render)

Fixed behavior on TOKEN_REFRESHED:
  - If user ID is the same, return early BEFORE setSession/setUser
  - No re-render propagates through the app
```

**StaleTime fix (App.tsx):**
```text
staleTime: 30 * 1000    -->    staleTime: 5 * 60 * 1000
```

**Workspace fix (useWorkspace.tsx):**
```text
Add: if workspaces are already loaded and user.id matches, skip refetch
This prevents the loading flash when auth roles momentarily reset
```

These three changes together address the root cause rather than patching individual pages. The app will feel stable when switching browser tabs, and forms won't lose their state.
