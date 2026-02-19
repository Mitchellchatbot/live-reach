
## Hide Floating Support Button on Mobile

The orange floating help button (FAB) in the bottom-right corner will be hidden on mobile viewports.

### Change

**`src/components/dashboard/FloatingSupportButton.tsx`** -- Add a `hidden md:flex` class to the outer container so it only appears on desktop (768px+). This is the simplest, cleanest approach using the existing Tailwind responsive utilities.

The single change is updating the outer `div`'s className from:
```
"fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2"
```
to:
```
"fixed bottom-6 right-6 z-50 hidden md:flex flex-col items-end gap-2"
```
