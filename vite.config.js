import { defineConfig } from "vite";
import fg from "fast-glob";

export default defineConfig({
  root: "src",
  publicDir: "../public",
  build: {
    outDir: "../dist",
    emptyOutDir: true,
    rollupOptions: {
      input: fg.sync("src/**/*.html", { absolute: true })
    }
  }
});
