import type { CapacitorConfig } from "@capacitor/cli";

/**
 * Ai BLINE — Capacitor configuration
 *
 * The app is a full-stack Next.js application (UI + AI API routes).
 * The Android build wraps the *deployed* web app in a native WebView shell,
 * so you must deploy the web app first (e.g. Vercel) and set SERVER_URL below.
 *
 * Full step-by-step guide: docs/BUILD_APK.md
 */
const config: CapacitorConfig = {
  appId: "com.aibline.app",
  appName: "Ai BLINE",
  webDir: "public",
  server: {
    // Replace with your deployed app URL (e.g. https://ai-bline.vercel.app)
    url: process.env.AIBLINE_SERVER_URL ?? "https://ai-bline.vercel.app",
    cleartext: false,
    androidScheme: "https",
  },
  android: {
    backgroundColor: "#04060B",
    allowMixedContent: false,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1200,
      backgroundColor: "#04060B",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
    },
  },
};

export default config;
