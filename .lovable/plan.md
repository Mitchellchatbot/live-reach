

## Tone Down Chat Bot Animations

Three animations need to be softened:

### 1. `gentlePulse` in `src/index.css` (line 538-541)
Used by `SalesChatBot` FAB before auto-open. Currently scales to 1.06 with a glowing ring.
- Reduce scale from `1.06` → `1.02`
- Reduce box-shadow spread from `8px` → `4px`

### 2. `jiggle` keyframe in `tailwind.config.ts` (line 96-102)
Aggressive rotation (±12°) and scaling (up to 1.15). Currently unused by these components but defined globally.
- Reduce rotations: `-12deg` → `-5deg`, `10deg` → `4deg`, `-8deg` → `-3deg`, `6deg` → `2deg`, `-3deg` → `-1deg`
- Reduce scales: `1.1` → `1.04`, `1.15` → `1.06`, `1.1` → `1.04`, `1.05` → `1.02`, `1.02` → `1.01`

### 3. `attention-bounce` in `tailwind.config.ts` (line 143-148)
Used by `ChatWidget` launcher (`LPDemoWidget` on homepage). Currently bounces 12px up.
- Reduce bounce: `-12px` → `-5px`, `-6px` → `-2px`

All changes are CSS-only — no logic changes needed.

