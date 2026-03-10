

## Plan: Create `/test` Page

A new standalone page at `/test` that replicates the uploaded screenshot's layout — Care Assist logo on the left, bold headline "What if you could increase qualified leads by 35%?", and subtext "Without increasing ad spend or hiring more staff." — enhanced with the same background effects from the homepage.

### What to build

**1. Create `src/pages/Test.tsx`**
- Full-screen centered layout with the logo + headline + subtext as shown in the screenshot
- Reuse the homepage's background layers:
  - **Floating orbs** (primary/accent colored, blurred, animated with `animate-float`)
  - **Grid overlay** (`bg-[linear-gradient(...)]` at 4rem spacing, 15% opacity)
  - **Mouse-follow glow** (600px blurred circle tracking cursor, desktop only)
- Add a subtle fade-in animation on the content block
- Logo uses the existing `care-assist-icon.png` asset (the orange speech-bubble icon shown in the screenshot)
- Headline in bold/black (~text-4xl md:text-6xl font-bold), subtext in muted gray below

**2. Register route in `src/App.tsx`**
- Add `/test` route pointing to the new Test page (eagerly loaded for simplicity)

### File changes
| File | Change |
|------|--------|
| `src/pages/Test.tsx` | New file — full page component |
| `src/App.tsx` | Add `/test` route |

