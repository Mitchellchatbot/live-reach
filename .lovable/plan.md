

# Hide Existing Widget in Preview

## Problem
When a customer's website already has the Care Assist chat widget installed, loading that site in the dashboard preview iframe causes the **real embedded widget** to appear alongside the **preview overlay widget**, resulting in two widgets visible at once.

## Solution
A two-part approach that makes the embed script self-aware of when it's being shown inside the dashboard preview:

### 1. Add a query parameter to the preview iframe URL
In `src/pages/WidgetPreview.tsx`, append `?scaledbot_preview=true` to the customer website URL loaded in the `FitScaledIframe` for both desktop and mobile previews.

### 2. Update the embed script to check for this parameter
In the generated embed code (also in `WidgetPreview.tsx`), add a guard at the top of the script: if `window.location.search` contains `scaledbot_preview=true`, skip widget initialization entirely. This way, when the customer's site loads inside the preview iframe, the real widget won't render -- only the dashboard's overlay `ChatWidget` component will show.

## Files to Modify
- **`src/pages/WidgetPreview.tsx`**:
  - Update `FitScaledIframe` `src` URLs (desktop line ~699, mobile line ~653) to append `?scaledbot_preview=true`
  - Update the `widgetScript` template (line ~333) to add `if (window.location.search.indexOf('scaledbot_preview=true') !== -1) return;` at the start of the IIFE

## Limitation
Customers who already embedded the **old** script (without the preview check) will still see the duplicate widget in previews until they update their embed code. New embeds will work correctly immediately.

