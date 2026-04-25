import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

let ViteImageOptimizer: ((opts?: unknown) => unknown) | null = null;
let imagetools: (() => unknown) | null = null;

try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  ViteImageOptimizer = require("vite-plugin-image-optimizer").ViteImageOptimizer;
} catch {
  // optional plugin — skip if not installed
}

try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  imagetools = require("vite-imagetools").imagetools;
} catch {
  // optional plugin — skip if not installed
}

// https://vitejs.dev/config/
export default defineConfig(() => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    imagetools?.(),
    ViteImageOptimizer?.({
      jpg: { quality: 80 },
      jpeg: { quality: 80 },
      png: { quality: 80 },
      webp: { quality: 80 },
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
