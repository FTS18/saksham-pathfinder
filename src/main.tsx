import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./styles/card-grid.css";
import "./utils/themeInitializer";
import * as Sentry from "@sentry/react";

// FIX #9: Initialize Sentry error monitoring BEFORE rendering the app.
// Set VITE_SENTRY_DSN in your .env file to enable. Leave blank for local dev.
if (import.meta.env.VITE_SENTRY_DSN && import.meta.env.PROD) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: import.meta.env.MODE,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: false,
        blockAllMedia: false,
      }),
    ],
    // Performance: trace 10% of transactions in prod
    tracesSampleRate: 0.1,
    // Capture 5% of sessions for replay — increases to 100% on errors
    replaysSessionSampleRate: 0.05,
    replaysOnErrorSampleRate: 1.0,
    // Don't send errors from browser extensions
    denyUrls: [/extensions\//i, /^chrome:\/\//i, /^moz-extension:\/\//i],
    beforeSend(event) {
      // Strip PII from error reports
      if (event.user) {
        delete event.user.email;
        delete event.user.username;
      }
      return event;
    },
  });
}

// Initialize theme before rendering to prevent flash
const root = createRoot(document.getElementById("root")!);
root.render(<App />);

requestAnimationFrame(() => {
	const skeleton = document.getElementById("initial-skeleton");
	if (skeleton) {
		skeleton.remove();
	}
});
