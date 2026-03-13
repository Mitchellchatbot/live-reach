
## Fix Black Bars on Vimeo Video

**Root cause**: Line 200 has `bg-background` on the wrapper div (white/light), but the black bars are actually coming from the Vimeo player itself rendering black letterbox/pillarbox bars because the video's native aspect ratio doesn't match the 16:9 `aspect-video` container.

The fix is to remove the `bg-background` and replace it with `bg-black` so the bars blend invisibly, OR better — add `?dnt=1&background=1` style params and also try removing the `p-1` padding which adds a small gap. 

The real fix: change the container background from `bg-background` to `bg-black` on line 200, so any letterbox bars are invisible. Also remove the `p-1` padding since that creates a thin gap where the background shows through between the border and video.

### Change in `src/pages/Funnel.tsx` line 200:
- Remove `bg-background p-1` → replace with `bg-black`

That's it — one line change. The black bars from the player itself will then be invisible against the black background.
