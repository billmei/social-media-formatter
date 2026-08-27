import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// Deployed to https://billmei.github.io/social-media-formatter/, so assets are
// served from a subpath rather than the domain root.
export default defineConfig({
  base: "/social-media-formatter/",
  plugins: [react(), tailwindcss()],
  build: { outDir: "build" },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./src/setupTests.js",
  },
});
