
## Swap Vimeo Video on /start Page

The video is a single `<iframe>` on line 203 of `src/pages/Funnel.tsx`. The new Vimeo ID is **1173333979** (extracted from the URL `https://vimeo.com/1173333979`).

### Change
- Replace the `src` on line 203:
  - Old: `https://player.vimeo.com/video/1172714416?...`
  - New: `https://player.vimeo.com/video/1173333979?badge=0&autopause=0&player_id=0&app_id=58479&autoplay=1&muted=0&loop=1`

That's the only change needed — one line in `src/pages/Funnel.tsx`.
