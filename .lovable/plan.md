

## Ensure /start Page Loads at Top

The global `ScrollToTop` component exists but may not fire reliably for direct navigation to `/start` due to timing with lazy-loaded content. 

### Fix
Add `useEffect(() => { window.scrollTo(0, 0); }, [])` at the top of `src/pages/Funnel.tsx` — this guarantees the page scrolls to top on mount regardless of navigation method.

One-line addition inside the existing component, using the already-imported `useEffect`.

