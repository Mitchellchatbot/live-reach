

## Plan: Add Real Calendly Link to Homepage

Currently the homepage "Book a Strategy Call" section (lines 1004-1053 of `Index.tsx`) is a **static placeholder** — a fake calendar UI that doesn't link anywhere. I'll replace it with an embedded Calendly inline widget pointing to `https://calendly.com/care-assist-support/support-call-clone`, which will let visitors book intro/demo calls directly from the homepage.

I'll also update the `FloatingSupportButton` to use the same real Calendly URL instead of the generic `https://calendly.com`.

### Changes

**`src/pages/Index.tsx`** — Replace the fake calendar placeholder (lines ~1004-1053) with a Calendly inline embed using an `<iframe>`. The card header ("Book a Strategy Call" / "Schedule a free intro or demo call") stays, but the body becomes the live Calendly scheduling widget.

**`src/components/dashboard/FloatingSupportButton.tsx`** — Update the `href` on line 32 from `https://calendly.com` to `https://calendly.com/care-assist-support/support-call-clone`.

