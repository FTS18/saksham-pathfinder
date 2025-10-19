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
        manualChunks: (id) => {
          // ONLY split Firebase - it's completely independent and large
          if (id.includes("node_modules/firebase")) {
            return "firebase-vendor";
          }
          // Everything else bundles together to avoid dependency issues:
          // - React needs React Router to use its context
          // - Components need Radix UI utilities
          // - Pages use Radix UI and icons
          // - Icons need their utility functions
          // Bundling together prevents undefined reference errors
        },
      },
    },
    target: "es2020",
    minify: false,
    sourcemap: false,
    reportCompressedSize: false,
    chunkSizeWarningLimit: 2000, // Increased to suppress warning during build
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
    port: 5173,
    open: false,
    hmr: {
      host: "localhost",
      port: 5173,
      protocol: "ws",
    },
    middlewareMode: false,
  },
});
