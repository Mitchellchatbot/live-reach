

## Plan: Create `/marketing` Static Results Page

Create a new page at `/marketing` that presents the Care Assist statistics script as a visually compelling, static marketing page using the same design elements from the homepage (floating orbs, grid overlay, mouse-follow glow).

### Layout

```text
┌──────────────────────────────────────┐
│  [Background: orbs + grid + glow]    │
│                                      │
│  "On average, centers using          │
│   Care-Assist see:"                  │
│                                      │
│  ┌────────┐ ┌────────┐ ┌────────┐   │
│  │  3x    │ │  47%   │ │  35%   │   │
│  │captured│ │lower   │ │lift in │   │
│  │ leads  │ │cost/   │ │qual.   │   │
│  │        │ │lead    │ │inquir. │   │
│  └────────┘ └────────┘ └────────┘   │
│                                      │
│  "Not because they bought more       │
│   traffic."                          │
│  "Because they stopped leaking it."  │
│                                      │
│  [Care Assist logo at top]           │
└──────────────────────────────────────┘
```

### What to build

**1. Create `src/pages/Marketing.tsx`**
- Full-screen layout with the same background layers as `/test` and homepage: floating orbs, 4rem grid, mouse-follow glow
- Care Assist favicon logo at top
- Intro line: "On average, centers using Care-Assist see:"
- Three stat cards in a row: "Up to 3x", "Up to 47%", "Up to 35%" with descriptions beneath each
- Cards styled with glass/frosted effect, subtle border, staggered fade-in animation
- Closing lines: "Not because they bought more traffic." / "Because they stopped leaking it." — styled as bold, impactful text
- Responsive: cards stack vertically on mobile

**2. Register route in `src/App.tsx`**
- Add `/marketing` route (lazy loaded)

### File changes
| File | Change |
|------|--------|
| `src/pages/Marketing.tsx` | New file |
| `src/App.tsx` | Add lazy import + `/marketing` route |

