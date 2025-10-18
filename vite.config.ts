import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          "react-vendor": ["react", "react-dom"],
          "router-vendor": ["react-router-dom"],
          "ui-vendor": [
            "@radix-ui/react-dialog",
            "@radix-ui/react-dropdown-menu",
            "@radix-ui/react-select",
          ],
          "firebase-vendor": [
            "firebase/app",
            "firebase/auth",
            "firebase/firestore",
          ],
          "query-vendor": ["@tanstack/react-query"],

          // Feature chunks
          "ai-features": ["@google/generative-ai"],
          charts: ["recharts"],
          icons: ["lucide-react", "react-icons"],
          utils: ["date-fns", "clsx", "tailwind-merge"],
        },
      },
    },
    target: "es2020",
    minify: "esbuild",
    sourcemap: false,
    reportCompressedSize: false,
    chunkSizeWarningLimit: 1000,
  },
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react-router-dom",
      "@tanstack/react-query",
    ],
  },
  server: {
    host: "0.0.0.0",
    port: 8080,
    open: true,
    hmr: {
      host: "localhost",
      port: 8080,
      protocol: "ws",
    },
  },
});
