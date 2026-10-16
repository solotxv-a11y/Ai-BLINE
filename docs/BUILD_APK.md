# 📱 Building the Ai BLINE Android APK

Ai BLINE is a **full-stack Next.js app** — the UI *and* the AI backend (chat, tools) run together.
The Android build is a **native WebView shell (Capacitor)** that points to your deployed web app.

> **How it works:** deploy once → wrap with Capacitor → get a real, installable `.apk`
> with your own icon, splash screen and portrait-locked experience.

---

## Prerequisites

| Tool | Version | Check |
| --- | --- | --- |
| Node.js | 20+ | `node -v` |
| JDK | 17 | `java -version` |
| Android Studio | latest | includes Android SDK |
| Android SDK | API 34 | via Android Studio → SDK Manager |

---

## Step 1 — Deploy the web app

The APK loads a live URL, so deploy the Next.js app first (any host works):

```bash
# Example: Vercel (easiest)
npm i -g vercel
vercel            # follow the prompts → https://your-app.vercel.app
```

Set the required environment variables on your host:

```
DATABASE_URL="file:./db/custom.db"   # or a hosted SQLite/Turso URL
```

> ⚠️ Verify the deployed site opens and the AI chat works **before** continuing.

## Step 2 — Install Capacitor (one time)

```bash
npm install @capacitor/core @capacitor/cli @capacitor/android
npx cap add android
```

## Step 3 — Point the shell to your deployed app

Create a `.env.local` (or export the variable) and set your URL:

```bash
export AIBLINE_SERVER_URL="https://your-app.vercel.app"
```

`capacitor.config.ts` in the repo root already reads this variable.

## Step 4 — Sync and build the APK

```bash
npx cap sync android
cd android
./gradlew assembleDebug          # → debug APK
# or for a release APK:
./gradlew assembleRelease
```

**Your APK is ready:**

```
android/app/build/outputs/apk/debug/app-debug.apk
android/app/build/outputs/apk/release/app-release-unsigned.apk
```

## Step 5 — Install on your phone

```bash
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

…or copy the APK to your phone and tap it (allow "Install unknown apps").

### Sign a release APK (optional)

Use Android Studio: `Build → Generate Signed Bundle / APK → APK` and create a keystore,
or sign from the CLI with `apksigner`.

---

## Alternative: no APK — "Add to Home Screen" (PWA)

Ai BLINE ships a full PWA manifest (`public/manifest.json`):

1. Open the deployed app in Chrome (Android).
2. Menu → **Add to Home screen**.
3. You get a standalone, icon-bearing app-like experience — zero build required.

## Alternative: fully offline shell (advanced)

If you want the APK to embed the UI instead of loading a URL:

1. Add `output: "export"` to `next.config.ts` (static export).
2. Point `webDir` in `capacitor.config.ts` to the export folder (`out`).
3. The UI works offline, but AI features need a reachable backend —
   host the API separately and point the client calls at it
   (search for `fetch("/api/` in `src/lib/api.ts`).

---

## Troubleshooting

| Problem | Fix |
| --- | --- |
| White screen in the APK | `AIBLINE_SERVER_URL` not set or site not deployed — open the URL in your phone browser first |
| `SDK location not found` | Create `android/local.properties` with `sdk.dir=/path/to/android-sdk` |
| Gradle build fails on JDK | Use JDK 17 (`java -version`) |
| Splash screen white flash | Already handled via SplashScreen plugin config — ensure `npx cap sync` ran |

Made with ⚡ — Ai BLINE
