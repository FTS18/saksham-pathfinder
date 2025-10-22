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
        // Re-enable code splitting and emit hashed filenames for cache-busting
        entryFileNames: "assets/[name]-[hash].js",
        chunkFileNames: "assets/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash].[ext]",
      },
    },
    target: "es2020",
    minify: false,
    sourcemap: false,
    reportCompressedSize: false,
    chunkSizeWarningLimit: 5000, // Suppress large bundle warning
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
    middlewareMode: false,
  },
});
