

# Business Information Section for Properties

## Overview
Add a "Business Information" section to each property where details like phone number, address, hours of operation, and other business info are stored. This data will be **auto-populated during onboarding** using the existing Firecrawl website scraper, and can be **manually edited** afterward from a new settings page.

## What Changes

### 1. Database: Add columns to `properties` table
Add new nullable text columns to the existing `properties` table:
- `business_phone` (text)
- `business_email` (text)
- `business_address` (text)
- `business_hours` (text) -- e.g. "Mon-Fri 9am-5pm"
- `business_description` (text) -- short company description
- `business_logo_url` (text) -- extracted logo URL

No new tables needed -- these belong on the property since each property represents a single website/business.

### 2. Enhance the Website Scraper
Update `supabase/functions/extract-website-info/index.ts` to also extract:
- Phone numbers (regex scan of page content for phone patterns)
- Email addresses (regex scan for email patterns)
- Physical address (look for common address patterns or structured data)
- Business hours (if found in page content)

The function already returns `companyName`, `description`, `primaryColor`, and `logo`. We add the new fields to its response.

### 3. Auto-populate During Onboarding
Update `src/pages/Onboarding.tsx`:
- After the `extract-website-info` call succeeds, save the extracted business info fields into onboarding state
- Pass these fields through to `createProperty()` so they get stored on the property row

### 4. Update `createProperty` in `useConversations.ts`
Extend the property creation options to accept and insert the new business info columns.

### 5. New "Business Info" Settings Page/Section
Create a new component `src/components/settings/BusinessInfoSettings.tsx`:
- Displayed on a new route or as a section in an existing settings area
- Shows editable fields for phone, email, address, hours, description, and logo
- Has a "Re-scan Website" button that calls `extract-website-info` again and pre-fills the fields
- Save button updates the `properties` row
- Supports the "All Properties" bulk mode (similar to email/slack settings)

### 6. Add Navigation
Add a sidebar link or integrate into the existing settings/notifications flow so users can access Business Info settings.

### 7. Property Cards Enhancement
Optionally show a snippet of business info (phone, address) on the property cards in `/dashboard/properties`.

## Technical Details

### Migration SQL
```sql
ALTER TABLE public.properties
  ADD COLUMN IF NOT EXISTS business_phone text,
  ADD COLUMN IF NOT EXISTS business_email text,
  ADD COLUMN IF NOT EXISTS business_address text,
  ADD COLUMN IF NOT EXISTS business_hours text,
  ADD COLUMN IF NOT EXISTS business_description text,
  ADD COLUMN IF NOT EXISTS business_logo_url text;
```

No RLS changes needed -- existing property RLS policies already cover these columns.

### Scraper Enhancement (extract-website-info)
Add regex-based extraction from the scraped markdown content:
- Phone: `/(\+?1?\s*[-.\s]?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4})/` 
- Email: `/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/`
- Address: Look for patterns with street numbers, state abbreviations, zip codes

These get returned alongside the existing `companyName`, `description`, etc.

### Files Modified
- `supabase/functions/extract-website-info/index.ts` -- add phone/email/address extraction
- `src/pages/Onboarding.tsx` -- pass extracted business info to property creation
- `src/hooks/useConversations.ts` -- accept new fields in `createProperty`
- `src/pages/Properties.tsx` -- optionally show business info on cards

### Files Created
- `src/components/settings/BusinessInfoSettings.tsx` -- editable business info form with re-scan button
- New migration file for the schema changes

