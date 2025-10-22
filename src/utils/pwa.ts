// PWA utilities for service worker and offline functionality
export const registerSW = async () => {
  if ("serviceWorker" in navigator) {
    try {
      const registration = await navigator.serviceWorker.register("/sw.js");

      registration.addEventListener("updatefound", () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener("statechange", () => {
            if (
              newWorker.state === "installed" &&
              navigator.serviceWorker.controller
            ) {
              // Auto-refresh: activate new SW and reload
              if (registration.waiting) {
                registration.waiting.postMessage({ type: "SKIP_WAITING" });
                registration.waiting.addEventListener(
                  "statechange",
                  (e: Event) => {
                    const sw = e.target as ServiceWorker;
                    if (sw.state === "activated") {
                      window.location.reload();
                    }
                  }
                );
              } else {
                window.location.reload();
              }
            }
          });
        }
      });
    } catch (error) {
      console.error("SW registration failed:", error);
    }
  }
};

// Image preloading for critical assets
export const preloadImages = () => {
  const criticalImages = ["/logo192.png", "/logo512.png"];

  criticalImages.forEach((src) => {
    const link = document.createElement("link");
    link.rel = "preload";
    link.as = "image";
    link.href = src;
    document.head.appendChild(link);
  });
};

// Request notification permission
export const requestNotificationPermission = async () => {
  if ("Notification" in window && Notification.permission === "default") {
    await Notification.requestPermission();
  }
};

// Check if app is running as PWA
export const isPWA = () => {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as any).standalone === true
  );
};
