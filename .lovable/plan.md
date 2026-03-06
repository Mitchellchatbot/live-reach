

## Co-Admin / Shared Account Access

### What You're Asking
You want two people with separate login credentials to both have full admin-level access to the same account — same properties, same data, same settings.

### Current Architecture
Right now, the system ties all data (properties, agents, conversations) to a single `user_id`. There is no concept of a "shared account" or "organization." Adding a second admin means they'd see nothing — they'd have their own empty workspace.

### Proposed Solution: Account Co-Owners

Add an `account_co_owners` table that lets one admin grant another user full access to their account. The system would then treat co-owners as equivalent to the original owner for all data access.

**Database changes:**
1. New `account_co_owners` table: `id`, `owner_user_id` (the primary account holder), `co_owner_user_id` (the invited admin), `created_at`
2. A `user_is_account_member(user_uuid)` security-definer function that returns true if `user_uuid` is either the owner or a co-owner
3. Update RLS policies on `properties`, `agents`, `conversations`, `visitors`, `messages`, and all settings tables to use this function instead of `auth.uid() = user_id`

**UI changes:**
1. Add a "Co-Admins" section to the Team Members page (since you're already there) with an invite flow — enter an email, the system checks if they have an account, and links them
2. Co-admins see the same sidebar, same properties, same inbox — identical experience

**Auth changes:**
- Co-owners would need their own signup/login and would need the `client` role assigned
- On login, if a user is a co-owner, the app resolves which "primary account" to load and uses that context throughout

### Key Considerations
- This is a significant architectural change — nearly every RLS policy references `user_id = auth.uid()` and would need updating to also check co-ownership
- Need to decide: can co-owners invite/remove each other, or only the original owner manages this?
- Co-owners would share the same subscription/billing tier

### Estimated Scope
- 1 new table + 1 helper function
- ~15-20 RLS policy updates
- New UI section on Team Members page
- Query logic updates across hooks (`useConversations`, `useUserProfile`, etc.)

This is a multi-step implementation. Shall I proceed?

