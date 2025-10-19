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
          // Vendor chunks - keep separate
          if (id.includes("node_modules/firebase")) {
            return "firebase-vendor";
          }
          if (
            id.includes("node_modules/react") &&
            !id.includes("react-router")
          ) {
            return "react-vendor";
          }
          if (id.includes("node_modules/react-router")) {
            return "router-vendor";
          }
          if (id.includes("node_modules/@radix-ui")) {
            return "ui-vendor";
          }
          if (id.includes("node_modules/@tanstack/react-query")) {
            return "query-vendor";
          }
          if (id.includes("node_modules/recharts")) {
            return "charts";
          }
          if (
            id.includes("node_modules/lucide-react") ||
            id.includes("node_modules/react-icons")
          ) {
            return "icons";
          }
          if (id.includes("node_modules/date-fns")) {
            return "dateutils";
          }
          if (id.includes("node_modules/purify")) {
            return "purify";
          }

          // Lazy load pages separately
          if (id.includes("/pages/") && id.endsWith(".tsx")) {
            const match = id.match(/\/pages\/([^/]+)\.tsx$/);
            if (match) {
              return `page-${match[1]}`;
            }
          }

          // Lazy load components separately
          if (id.includes("/components/") && id.endsWith(".tsx")) {
            const match = id.match(/\/components\/([^/]+)\.tsx$/);
            if (match) {
              return `comp-${match[1]}`;
            }
          }
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
    port: 8080,
    open: true,
    hmr: {
      host: "localhost",
      port: 8080,
      protocol: "ws",
    },
  },
});
