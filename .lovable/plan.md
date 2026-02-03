

## Fix: Remove Black Background from Widget Embed

The widget is now rendering in light mode (white content), but the iframe still shows a black rectangular background. This is because the `ThemeProvider` from `next-themes` wraps the entire app, including the widget embed route, and applies background styling before our override code runs.

---

### Root Cause

The `ThemeProvider` in `App.tsx` wraps all routes, including `/widget-embed/:propertyId`. When a user's system prefers dark mode, `next-themes`:
1. Adds the `dark` class to `<html>` 
2. Applies CSS variables that set `--background` to a dark color
3. The body gets `bg-background` which translates to dark background color

Our current fix in `WidgetEmbed.tsx` runs in a `useEffect`, which happens **after** the initial render. There's a brief moment where the dark theme styles are applied before we override them, causing a flash of black background.

---

### Solution

Create a **separate entry point** for the widget embed that bypasses `ThemeProvider` entirely. This ensures the widget never receives dark mode styling.

---

### Implementation Steps

**1. Create a new Widget App component (`src/WidgetApp.tsx`)**
- A minimal app that renders only the widget embed route
- No ThemeProvider wrapper
- Immediately applies light mode and transparency

**2. Update `src/main.tsx` to detect widget embed route**
- Check if the current path starts with `/widget-embed/`
- If yes, render `WidgetApp` instead of the full `App`
- This prevents ThemeProvider from ever loading for widget embeds

**3. Update `src/index.css`**
- Add additional CSS rules for `html:not(.dark)` when in widget-embed-mode to ensure no dark styles leak through

---

### Files to Modify

| File | Changes |
|------|---------|
| `src/WidgetApp.tsx` | **New file** - Minimal app for widget embed without ThemeProvider |
| `src/main.tsx` | Check path and conditionally render WidgetApp for widget embeds |
| `src/pages/WidgetEmbed.tsx` | Simplify since it no longer needs to fight ThemeProvider |

---

### Code Changes

**`src/WidgetApp.tsx` (new file):**
```tsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import WidgetEmbed from "./pages/WidgetEmbed";

// Minimal app specifically for widget embed - no ThemeProvider
const WidgetApp = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/widget-embed/:propertyId" element={<WidgetEmbed />} />
    </Routes>
  </BrowserRouter>
);

export default WidgetApp;
```

**`src/main.tsx` changes:**
```tsx
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import WidgetApp from './WidgetApp.tsx';
import './index.css';

// Detect if we're loading the widget embed route
const isWidgetEmbed = window.location.pathname.startsWith('/widget-embed/');

// Use minimal WidgetApp for embed (no ThemeProvider = no dark mode issues)
createRoot(document.getElementById("root")!).render(
  isWidgetEmbed ? <WidgetApp /> : <App />
);
```

**`src/pages/WidgetEmbed.tsx` simplification:**
- Remove the MutationObserver since ThemeProvider won't be adding dark class
- Keep the transparency styling for safety
- Add immediate class application (no useEffect delay needed for initial render)

---

### Why This Works

```text
BEFORE:
  main.tsx → App.tsx → ThemeProvider (applies dark) → WidgetEmbed → useEffect (too late!)
                             ↓
                        Black background flashes

AFTER:
  main.tsx → detects /widget-embed/ → WidgetApp (no ThemeProvider) → WidgetEmbed
                                           ↓
                                     No dark theme ever applied
                                     Transparent from the start
```

