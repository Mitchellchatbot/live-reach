
## Fix: Admin/Agent Role Switcher Not Appearing

### Root Cause

The role switcher requires **two conditions** to be true simultaneously:
1. `hasAgentAccess` = true (user has a row in the `agents` table with `invitation_status = 'accepted'`)
2. `isClient || isAdmin` = true (user's role in `user_roles` is `client` or `admin`)

**Currently, no user in the database satisfies both conditions.** All client/admin users have zero agent invitations, so the toggle never renders.

Additionally, `fetchUserRole` in `useAuth.tsx` uses `.maybeSingle()` which only returns one role and errors if multiple exist -- making it structurally impossible to hold dual roles via `user_roles` alone.

### Solution

**Two changes are needed:**

#### 1. Fix `useAuth.tsx` to support multiple roles

- Change `fetchUserRole` from `.maybeSingle()` to `.select('role')` (returns all rows)
- Set the "primary" role to the highest-privilege one found (admin > client > agent)
- Derive `isAdmin`, `isClient`, `isAgent` from the full list of roles, not just one
- Keep `hasAgentAccess` check as-is (it works correctly via the `agents` table)

#### 2. Update sidebar condition to also consider `isAgent` from `user_roles`

- The sidebar toggle currently checks `hasAgentAccess && (isClient || isAdmin)`. This is fine once the auth hook correctly reports both flags.
- No sidebar code change needed if auth is fixed.

### Technical Details

**File: `src/hooks/useAuth.tsx`**

Replace the single-role fetch (lines 39-48):
```typescript
// Before: only gets one role
const { data } = await supabase
  .from('user_roles')
  .select('role')
  .eq('user_id', userId)
  .maybeSingle();
```

With a multi-role fetch:
```typescript
// After: gets all roles for the user
const { data: roles } = await supabase
  .from('user_roles')
  .select('role')
  .eq('user_id', userId);

const roleSet = new Set((roles || []).map(r => r.role));
// Pick highest-privilege as primary role
const primary = roleSet.has('admin') ? 'admin'
  : roleSet.has('client') ? 'client'
  : roleSet.has('agent') ? 'agent'
  : null;
setRole(primary);
setAllRoles(roleSet);
```

Add a new `allRoles` state and expose `isAdmin`, `isClient`, `isAgent` from the full set rather than just the primary role:
```typescript
isAdmin: allRoles.has('admin'),
isClient: allRoles.has('client'),
isAgent: allRoles.has('agent'),
```

This way, a user who is both a `client` and has an accepted agent invitation will see `isClient = true` AND `hasAgentAccess = true`, making the toggle appear.

**Database**: Insert an agent record for the current admin user so they can test the toggle. This will be a one-row insert into the `agents` table linking the admin's `user_id` with `invitation_status = 'accepted'` and `invited_by` set to their own user ID.
