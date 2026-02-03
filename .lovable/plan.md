
## Fix: Remove Faint Drop Shadow from Widget

The widget has a visible drop shadow around it that creates a subtle rectangular outline. This is caused by `shadow-2xl` Tailwind classes applied to the chat panel and floating button.

---

### Changes Required

**File: `src/components/widget/ChatWidget.tsx`**

Remove or reduce the shadow classes from the main widget elements:

| Line | Current | Change To |
|------|---------|-----------|
| 409 | `shadow-2xl` on chat panel | Remove entirely |
| 699 | `shadow-2xl` on floating button | Remove entirely |
| 683 | `shadow-lg` on send button | Keep (internal, not visible outside) |

---

### Implementation

**Line 409** - Chat Panel:
```tsx
// Before
className="animate-scale-in mb-4 bg-card/95 backdrop-blur-lg shadow-2xl overflow-hidden flex flex-col pointer-events-auto"

// After  
className="animate-scale-in mb-4 bg-card/95 backdrop-blur-lg overflow-hidden flex flex-col pointer-events-auto"
```

**Line 699** - Floating Button:
```tsx
// Before
className="flex items-center justify-center shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 pointer-events-auto"

// After
className="flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 pointer-events-auto"
```

This removes all external shadows from the widget, making it appear cleanly without any rectangular outline.
