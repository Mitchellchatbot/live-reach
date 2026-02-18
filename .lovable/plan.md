
# Fix Capacitor App to Run from Bundled Assets (Not Remote URL)

## The Problem

The `capacitor.config.ts` currently has a `server.url` pointing to the published website. This tells Capacitor's native WebView to load everything from that URL at runtime — which is indistinguishable from just opening Safari. It is meant only for live-reload development, not for shipping a real app.

## What Needs to Change

### 1. Remove `server.url` from `capacitor.config.ts`

The entire `server` block needs to be removed. Without it, Capacitor will serve the app from the bundled `dist/` folder that gets compiled into the native binary via `npx cap sync`.

Before:
```typescript
const config: CapacitorConfig = {
  appId: 'app.lovable.e131b87620e34027a6c4576fd3c85b88',
  appName: 'live-reach',
  webDir: 'dist',
  server: {
    url: 'https://live-reach.lovable.app',
    cleartext: true,
  },
};
```

After:
```typescript
const config: CapacitorConfig = {
  appId: 'app.lovable.e131b87620e34027a6c4576fd3c85b88',
  appName: 'live-reach',
  webDir: 'dist',
};
```

## What YOU Need to Do Locally After This Change

Once the config is updated here, you need to re-sync the native project locally. These steps rebundle the web app into the native binary:

```text
Step 1: Pull the latest changes from GitHub
        git pull

Step 2: Rebuild the web app
        npm run build

Step 3: Sync into the native iOS/Android project
        npx cap sync

Step 4: Re-open in Xcode and rebuild to device
        npx cap open ios
        → Product → Run (or Cmd+R)
```

## Why This Works

When there is no `server.url`, Capacitor copies everything from the `dist/` folder directly into the native app bundle. The app loads from local files on the device — no internet required to launch, and it behaves like a fully standalone native app.

## Important Notes

- The app still needs internet to communicate with the backend (auth, conversations, etc.) — but the app shell itself loads locally
- Any time you want to update what the mobile app shows, you pull → `npm run build` → `npx cap sync` → rebuild in Xcode
- If you ever want live-reload again during development, you can temporarily add `server.url` back — just remember to remove it before building for distribution

## File Changed

| File | Change |
|------|--------|
| `capacitor.config.ts` | Remove the `server` block entirely |
