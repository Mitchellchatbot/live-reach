

# Geo-Filtering for Chat Widget

## Overview
Add a per-property setting that lets you restrict which regions the AI chatbot will engage with. Visitors outside the allowed region will see the widget but get a polite "unavailable" message instead of starting a conversation. Their data will not be stored and no conversation will be created.

## How It Works

1. **Settings UI** -- A new "Service Area" section on the AI Settings page (per-property) with three modes:
   - **Anywhere** (default) -- no filtering
   - **United States only** -- any US state
   - **Specific states** -- multi-select list of US states (e.g., Florida, Texas)

2. **Geo-check at widget bootstrap** -- When a visitor opens the widget, the `widget-bootstrap` edge function already knows the visitor's IP. We'll add geo-lookup logic there (before creating a visitor record) and compare against the property's allowed regions. If the visitor is outside the allowed area:
   - Return a `geoBlocked: true` flag to the widget
   - Do NOT create a visitor record or conversation
   - The widget shows a static message like "We're sorry, our services are currently only available in [region]. Please visit [website] for more information."

3. **No data stored** -- Blocked visitors never get a visitor record, conversation, or messages saved to the database. They never appear in the dashboard inbox.

## Technical Details

### Database Changes
Add three columns to the `properties` table:
- `geo_filter_mode` (text, default `'anywhere'`) -- values: `anywhere`, `us_only`, `specific_states`
- `geo_allowed_states` (text[], default `'{}'`) -- e.g. `{'FL','TX','CA'}`
- `geo_blocked_message` (text, nullable) -- custom message for blocked visitors

### Edge Function Changes

**`widget-bootstrap/index.ts`**:
- Fetch geo-filter settings along with the property greeting
- Before creating/finding a visitor, perform the IP geolocation check (reuse ip-api.com logic from `get-visitor-location`)
- If blocked: return `{ geoBlocked: true, geoBlockedMessage: "..." }` immediately, skip all visitor/conversation creation
- If allowed: proceed as normal

**`get-property-settings/index.ts`**:
- Add `geo_filter_mode`, `geo_allowed_states`, `geo_blocked_message` to the SELECT list

### Frontend Changes

**`src/hooks/useWidgetChat.ts`**:
- Handle `geoBlocked` response from bootstrap
- Expose a `geoBlocked` state and `geoBlockedMessage` to the widget UI
- When blocked: skip all chat initialization, hide input, show the blocked message

**`src/components/widget/ChatWidget.tsx`**:
- When `geoBlocked` is true, render a static "unavailable in your area" message instead of the chat interface

**`src/pages/AISupport.tsx`**:
- Add a "Service Area" card in the AI settings section
- Three radio options: Anywhere, US Only, Specific States
- When "Specific States" is selected, show a multi-select dropdown with US state abbreviations
- Optional custom blocked message text field
- Save to properties table on the existing save flow

### Flow Diagram

```text
Visitor opens widget
        |
        v
  widget-bootstrap (edge fn)
        |
        v
  Fetch property geo settings
        |
        v
  Lookup visitor IP location
        |
    +---+---+
    |       |
 Allowed  Blocked
    |       |
    v       v
 Normal   Return geoBlocked=true
 flow     (no visitor/conversation created)
```

### Privacy Note
IP geolocation is performed server-side and never stored for blocked visitors. Only the boolean result (allowed/blocked) is sent to the client.

