

# Simplify Salesforce OAuth (Managed App Pattern)

## Overview
Replace the per-user Client ID / Client Secret input fields with a single "Connect to Salesforce" button. The app owner's Salesforce Connected App credentials will be stored as backend secrets, just like Slack.

## Prerequisites
Two new backend secrets need to be added:
- `SALESFORCE_CLIENT_ID` -- from your Salesforce Connected App
- `SALESFORCE_CLIENT_SECRET` -- from your Salesforce Connected App

## Changes

### 1. New Edge Function: `salesforce-oauth-start`
Mirrors the Slack pattern. Accepts `propertyId`, generates CSRF token, stores it in `salesforce_settings`, builds the Salesforce OAuth URL using the backend secrets, and returns the URL.

- Reads `SALESFORCE_CLIENT_ID` from env
- Generates PKCE code verifier + challenge server-side (more secure than client-side)
- Stores CSRF token + code verifier in `salesforce_settings`
- Returns the authorization URL to the frontend

Config: `verify_jwt = false` in config.toml (auth handled in-code)

### 2. Update Edge Function: `salesforce-oauth-callback`
- Remove the logic that reads `client_id` / `client_secret` from the per-property `salesforce_settings` row
- Instead read `SALESFORCE_CLIENT_ID` and `SALESFORCE_CLIENT_SECRET` from env (backend secrets)
- Read the `code_verifier` from the database (stored by `salesforce-oauth-start`) instead of from the URL state param

### 3. Database Migration
- Add a `pending_code_verifier` text column to `salesforce_settings` (to store the PKCE verifier server-side instead of passing it through the URL state)
- The existing `client_id` and `client_secret` columns can remain for backward compatibility but will no longer be used by new connections

### 4. Update UI: `SalesforceSettings.tsx`
- Remove the Client ID and Client Secret input fields entirely
- Remove the `showClientSecret` state and eye toggle
- Remove the client-side PKCE generation (`generatePKCE` function)
- Simplify `handleConnect`:
  1. Call `salesforce-oauth-start` edge function with `propertyId`
  2. Receive the OAuth URL back
  3. Open it in a popup
  4. Listen for `salesforce-oauth-success` / `salesforce-oauth-error` messages (same as now)
- The "not connected" state becomes a simple card with a "Connect to Salesforce" button and a brief description -- no credential fields
- Keep everything else (auto-export toggles, field mappings, disconnect) as-is

### 5. Config
Add to `supabase/config.toml`:
```text
[functions.salesforce-oauth-start]
verify_jwt = false
```

## User Experience (After)

1. User navigates to Salesforce settings
2. Sees a "Connect to Salesforce" button
3. Clicks it -- a Salesforce login popup opens
4. User logs in and grants permission
5. Popup closes, settings show "Connected"

No Client ID, no Client Secret, no confusion.

## Technical Details

- The PKCE code verifier moves from client-side `sessionStorage` to server-side `salesforce_settings.pending_code_verifier` for better security
- The OAuth `state` parameter simplifies to `propertyId:csrfToken` (no more code verifier in URL)
- The `salesforce-oauth-start` function handles CSRF token generation + PKCE, keeping all secrets server-side
- Existing `client_id`/`client_secret` columns are left in the DB but ignored going forward

