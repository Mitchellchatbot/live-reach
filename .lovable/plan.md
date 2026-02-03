
## Fix: Eliminate Black Rectangle Background from Widget Embed

The widget continues to display inside a persistent black rectangle. This happens because:

1. **CSS specificity issue**: The `bg-background` Tailwind class is applied to `body` via `@layer base`, which gets resolved to `hsl(var(--background))`. Even though we override `--background`, the dark mode value (`0 0% 4%`) is being used first.

2. **Missing selectors**: The `#root` div inside the iframe also needs to be transparent, and is not being targeted.

3. **Class mismatch**: The CSS rule `body.widget-embed-mode` won't work because the class is added to `html`, not `body`.

---

### Solution

**1. Update the iframe embed code** in `WidgetPreview.tsx` to explicitly set a transparent background on the iframe (which it already does, but needs double-checking).

**2. Add CSS rules that target all elements** in embed mode, including `#root`:

```css
html.widget-embed-mode,
html.widget-embed-mode body,
html.widget-embed-mode #root,
html.widget-embed-mode.dark,
html.widget-embed-mode.dark body,
html.widget-embed-mode.dark #root {
  background: transparent !important;
  background-color: transparent !important;
}
```

**3. Update `WidgetApp.tsx`** to apply transparency to the `#root` element as well before React renders.

**4. Add inline styles to `index.html`** via a script that runs before any CSS loads, to ensure the elements are transparent from the very start.

---

### Files to Modify

| File | Changes |
|------|---------|
| `src/index.css` | Add `#root` to widget-embed-mode selectors |
| `src/WidgetApp.tsx` | Also set transparency on `#root` element |
| `index.html` | Add early inline script to set transparency for widget-embed routes |

---

### Technical Implementation

**`index.html`** - Add an inline script that runs immediately:
```html
<script>
  // Early transparency for widget embed
  if (window.location.pathname.startsWith('/widget-embed/')) {
    document.documentElement.classList.add('widget-embed-mode');
    document.documentElement.style.background = 'transparent';
    document.body.style.background = 'transparent';
  }
</script>
```

**`src/index.css`** - Update the widget-embed-mode selectors to include `#root`:
```css
html.widget-embed-mode,
html.widget-embed-mode body,
html.widget-embed-mode #root,
html.widget-embed-mode.dark,
html.widget-embed-mode.dark body,
html.widget-embed-mode.dark #root {
  background: transparent !important;
  background-color: transparent !important;
}
```

**`src/WidgetApp.tsx`** - Also set transparency on the root element:
```typescript
const rootElement = document.getElementById('root');
if (rootElement) {
  rootElement.style.setProperty('background', 'transparent', 'important');
}
```

---

### Flow Diagram

```text
BEFORE (current problem):
  [Browser loads iframe]
       ↓
  [index.html loads]
       ↓
  [CSS loads with bg-background = dark]  ← BLACK BACKGROUND APPEARS
       ↓
  [main.tsx detects widget route]
       ↓
  [WidgetApp.tsx adds classes]
       ↓
  [CSS overrides attempted]  ← TOO LATE, black already visible

AFTER (with fix):
  [Browser loads iframe]
       ↓
  [index.html inline script runs FIRST]  ← SETS TRANSPARENT IMMEDIATELY
       ↓
  [CSS loads but transparency enforced]
       ↓
  [WidgetApp.tsx reinforces transparency]
       ↓
  [Widget renders in transparent container]
```

---

### Summary

The fix adds transparency enforcement at the earliest possible moment (inline script in HTML) and ensures all container elements (`html`, `body`, and `#root`) are explicitly targeted in the CSS rules.
