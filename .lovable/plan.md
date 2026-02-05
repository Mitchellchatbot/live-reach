
## What’s happening (root cause)
Your Salesforce connect flow is failing because the **backend functions for Salesforce are not deployed/available** right now.

I verified this directly by calling the backend endpoints:
- `POST /salesforce-describe-lead` → **404** `{"code":"NOT_FOUND","message":"Requested function was not found"}`
- `POST /salesforce-export-leads` → **404** same
- `GET /salesforce-oauth-callback` → **404** same

As a control, another function **does** exist and responds (`/extract-brand-colors` returned 200), so this isn’t a general backend outage—just these specific functions (and a couple related ones like `close-stale-conversations`, `widget-conversation-presence`) are missing.

This is **not** on Salesforce’s side: the request is failing before Salesforce APIs even come into play.

## Why the functions are “missing”
A 404 `NOT_FOUND` from the functions gateway means **the function isn’t deployed** (or deployment failed), not that your function code threw an error.

Given you also have 404s for:
- `close-stale-conversations`
- `widget-conversation-presence`

…it strongly suggests a recurring deploy/bundling problem for a subset of functions.

## Fix approach (what I will implement)
### 1) Confirm exactly which functions are missing
Using backend calls (same method I already used), we’ll confirm 404s for:
- `salesforce-oauth-callback`
- `salesforce-describe-lead`
- `salesforce-export-leads`
- `close-stale-conversations`
- `widget-conversation-presence`

### 2) Re-deploy the missing backend functions
Attempt deployment of the missing functions as-is. After deployment:
- Re-test each one with a simple request.
- Success criteria: they return **anything other than 404** (even a 400 “missing params” is fine—means the route exists).

### 3) If deployment still fails: make bundling more reliable (code changes)
If the platform is failing to bundle these functions, I’ll refactor them to match the simplest, already-working patterns in your project:

**Changes to apply to each missing function (where applicable):**
- Replace `import { serve } from "https://deno.land/std@.../server.ts"` with **`Deno.serve(...)`** to reduce external dependency bundling.
- Replace `https://esm.sh/@supabase/supabase-js@2` import with a more stable import strategy (prefer `npm:@supabase/supabase-js@2` if supported in this runtime; otherwise pin esm.sh with deno target parameters) to avoid flaky remote bundling.
- Normalize CORS headers to the recommended superset (your codebase is inconsistent here).
  
Target files:
- `supabase/functions/salesforce-describe-lead/index.ts`
- `supabase/functions/salesforce-export-leads/index.ts`
- `supabase/functions/widget-conversation-presence/index.ts`
- `supabase/functions/close-stale-conversations/index.ts`
- (Salesforce callback already uses `Deno.serve`, but we’ll align imports/CORS if needed): `supabase/functions/salesforce-oauth-callback/index.ts`

### 4) Ensure the OAuth callback is callable without login (important)
Salesforce redirects a browser to your callback URL without an auth token. We should explicitly allow that by setting:

- `supabase/config.toml`:
  - `[functions.salesforce-oauth-callback] verify_jwt = false`

(Separately, `widget-conversation-presence` is also called from the public widget and likely needs `verify_jwt = false` too—otherwise it would 401. That’s not your current error, but it’s the correct config to prevent the next blocker after deployment.)

### 5) End-to-end verification checklist
After the functions exist:
1. From the backend test tool, confirm:
   - `/salesforce-describe-lead` returns 400/404(settings)/200 depending on connection state (but not 404 NOT_FOUND).
2. In the UI (`/dashboard/salesforce`):
   - Click **Connect Salesforce**
   - Complete login in the popup
   - Popup should close and the app should show “Connected”
3. Confirm Lead fields load (this is where `salesforce-describe-lead` is used).
4. (Optional) Trigger a manual export from Visitor Leads to confirm `salesforce-export-leads` works.

## Expected outcome
- The `NOT_FOUND` error goes away because the Salesforce backend functions will be deployed and reachable.
- Salesforce OAuth can complete, fields can be described, and exports can run.
- The other missing conversation-related functions will also be restored, removing that warning you saw in logs.

## Notes / edge cases to keep in mind
- If Salesforce Connected App redirect URI is wrong, you’ll get a Salesforce OAuth error, not a “function not found”. So once the function exists, if there’s still trouble, we’ll validate the redirect URI value in your Salesforce app settings.
- If token refresh fails later, that would show up as a Salesforce API error (401/invalid_grant), not NOT_FOUND.

