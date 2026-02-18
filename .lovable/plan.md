
# Building a Capacitor Mobile App from Live Reach

This plan sets up Capacitor so the existing Live Reach web app can run as a real native app on iOS and Android phones. No existing functionality is changed — Capacitor wraps the current app and adds native capabilities on top.

## What Lovable Will Do

### 1. Install Capacitor Packages
Add the required Capacitor libraries to the project:
- `@capacitor/core` — the core runtime
- `@capacitor/cli` — development tool (dev dependency only)
- `@capacitor/ios` — iOS platform support
- `@capacitor/android` — Android platform support

### 2. Create the Capacitor Config File
Create `capacitor.config.ts` in the project root with:
- **App ID**: `app.lovable.e131b87620e34027a6c4576fd3c85b88`
- **App Name**: `live-reach`
- **Live reload server URL**: pointing to the Lovable preview URL so you can test on a real phone with live updates during development

### 3. Add Mobile Meta Tags to `index.html`
Update the HTML head to include mobile-specific tags:
- Viewport settings optimized for native mobile (no pinch zoom, safe area insets)
- Status bar theme color
- Apple mobile web app meta tags

### 4. Update `vite.config.ts`
Ensure the build output directory is set to `dist` (Capacitor's expected default) and that assets are handled correctly.

## What YOU Need to Do After (Step-by-Step)

Once Lovable applies the code changes, here is what you do on your local machine:

```text
Step 1: Export project to your own GitHub repo
        (Settings → GitHub → Export to GitHub)

Step 2: Git clone the repo locally and run:
        npm install

Step 3: Add the native platforms:
        npx cap add ios
        npx cap add android

Step 4: Build the web app:
        npm run build

Step 5: Sync Capacitor:
        npx cap sync

Step 6: Run on a device or emulator:
        npx cap run ios      (requires a Mac with Xcode)
        npx cap run android  (requires Android Studio)
```

## Important Notes

- **iOS** requires a Mac with Xcode installed — you cannot build for iPhone on Windows
- **Android** works on Mac or Windows with Android Studio installed
- The live reload config means during development your physical phone will connect to the Lovable preview URL — so changes you make here reflect instantly on your device
- The widget embed route (`/widget-embed/`) is browser-only and not part of the mobile app experience — the dashboard and conversations are the core mobile features

## Files to Be Created/Modified

| File | Change |
|------|--------|
| `capacitor.config.ts` | Created — core Capacitor configuration |
| `package.json` | Updated — Capacitor packages added |
| `index.html` | Updated — mobile meta tags added |
| `vite.config.ts` | Minor update — ensure build output is `dist` |
