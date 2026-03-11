

# Add "Performance Dashboard" Section to /lp

## Placement
Insert a new section between the Testimonials section (line 295) and the Final CTA section (line 297).

## Structure
A full-width section with `bg-[#FAF8F6]` (warm light background) containing a two-column grid (`md:grid-cols-2`) at `max-w-6xl`:

### Left Column
1. Orange uppercase label: `CARE-ASSIST — AI CHAT WIDGET`
2. Large headline (3 lines): "HIPAA Compliant." / "35% More Leads." / "27% Faster Learning." — with "27% Faster" in `text-primary` and "Learning." in black
3. Body paragraph about cleaner conversion signals
4. Four pill badges in a 2x2 grid with orange dot indicators
5. Thin divider line
6. Three large orange stats in a row: 35%, 27%, <4s with labels beneath

### Right Column — Dark Card (`bg-[#1A1614]`, `rounded-3xl`)
1. Orange uppercase label: `LIVE PERFORMANCE DASHBOARD`
2. Fake chat widget preview:
   - Orange header bar with "CA" avatar circle + "Care Assist / Here to help"
   - Dark bot message bubble: "Are you looking for help for yourself or a loved one?"
   - Orange user message bubble: "My son. He needs treatment."
   - Animated typing indicator (3 bouncing orange dots via CSS keyframes)
3. Divider, then three metric rows:
   - "Leads Captured" → "+35%" with green "↑ This month"
   - "Google Ad Learning" → "27% faster" with orange "↑ Cleaner signals"
   - "Cost Per Lead" → "$42.10" with green "↓ 47%"
4. Three mini stat cards in a row (dark bg, orange text): 3x, 24/7, <4s
5. Green HIPAA strip at bottom with lock icon

## Technical Details
- All content is static/decorative — no data fetching needed
- Typing dots animation: CSS `@keyframes bounce` with staggered `animation-delay`
- Add keyframes inline via `style` JSX or a small `<style>` block
- Uses existing `reveal` class for scroll-triggered fade-in
- Responsive: stacks to single column on mobile
- Colors: primary orange `#F47920` (already `hsl(var(--primary))`), dark card `#1A1614`, green accents `#22C55E`

## Files Changed
- `src/pages/Funnel.tsx` — add new section (~120 lines of JSX)

