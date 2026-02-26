import { defineConfig } from "vite";
import fg from "fast-glob";

export default defineConfig({
  root: "src",
  build: {
    outDir: "../dist",
    emptyOutDir: true,
    rollupOptions: {
      input: fg.sync("src/**/*.html", { absolute: true })
    }
  }
});
