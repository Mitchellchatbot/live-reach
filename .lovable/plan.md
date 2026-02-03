

## Fix Widget Background and Dark Mode Issues

The widget embed has two problems:
1. **Black rectangle background** - The iframe background appears black instead of transparent
2. **Dark mode rendering** - The widget is displaying in dark mode when it should match light mode

### Root Causes Identified

**Issue 1: Black Background**
The `ThemeProvider` from `next-themes` applies theme classes and CSS variables that affect the background color. Even though we're removing the `dark` class in `WidgetEmbed.tsx`, the theme system is still initializing and the CSS variables from `index.css` set `--background` which gets applied to `body`.

**Issue 2: Dark Mode**
The `ThemeProvider` defaults to `"system"` theme, so if the user's browser/OS prefers dark mode, the widget inherits that. The current code only removes the `dark` class once but doesn't prevent the theme system from re-adding it.

---

### Solution

#### 1. Exclude Widget Embed from ThemeProvider
Create a separate entry point for the widget that doesn't wrap the component in `ThemeProvider`. The widget should always use light mode and have explicit transparency.

#### 2. Force Light Mode CSS in Widget Embed
Update the CSS to ensure that when `widget-embed-mode` is active, all dark mode variables are overridden with light mode values, and background transparency is enforced.

#### 3. Update WidgetEmbed Component
- Force the `:root` CSS variables to use light theme values
- Prevent any dark mode class from being applied
- Add a `MutationObserver` to continuously remove dark class if the theme system tries to add it

---

### Technical Details

**File: `src/index.css`**

Add stronger CSS overrides for widget embed mode:
```css
/* Widget embed mode - force light theme + full transparency */
html.widget-embed-mode,
html.widget-embed-mode body {
  --background: 0 0% 100% !important;
  --foreground: 0 0% 8% !important;
  --card: 0 0% 100% !important;
  /* ... other light mode variables ... */
  background: transparent !important;
  background-color: transparent !important;
}

/* Prevent dark mode in widget embed */
html.widget-embed-mode.dark {
  /* Override all dark mode settings with light mode */
}
```

**File: `src/pages/WidgetEmbed.tsx`**

Update the useEffect to:
1. Force light mode CSS variables directly on `:root`
2. Use a `MutationObserver` to prevent the `dark` class from being added
3. Add explicit inline styles for full transparency

```text
Flow:
  [User Browser] 
       |
       v
  [Parent Website (light theme)]
       |
       v
  [Widget Iframe]
       |
       v
  [WidgetEmbed.tsx]
       |-- Forces light mode variables
       |-- Removes dark class
       |-- Sets transparent background
       |
       v
  [ChatWidget.tsx]
       |-- Renders with light theme
       |-- Transparent container
```

**File: `src/components/widget/ChatWidget.tsx`**

Update the chat panel and other elements to use explicit light-mode colors when in embed mode (passed via prop or detected via class).

---

### Implementation Steps

1. Update `src/index.css` to add comprehensive widget-embed-mode overrides that force light theme and transparency
2. Update `src/pages/WidgetEmbed.tsx` to:
   - Set CSS custom properties to light mode values
   - Add a MutationObserver to continuously prevent dark class
   - Force all backgrounds to transparent
3. Optionally update `src/components/widget/ChatWidget.tsx` to use explicit colors rather than CSS variables for embed mode

