import { defineConfig } from "vite";
import fs from "node:fs";
import fg from "fast-glob";

// Vite hashes images it finds in HTML into /assets/, but og:image and JSON-LD point at /<slug>/<file>, so ship those too
const articleAssets = {
  name: "article-assets",
  generateBundle() {
    for (const fileName of fg.sync("*/*", { cwd: "src", ignore: ["**/*.html"] }))
      this.emitFile({ type: "asset", fileName, source: fs.readFileSync(`src/${fileName}`) });
  }
};

export default defineConfig({
  root: "src",
  publicDir: "../public",
  plugins: [articleAssets],
  build: {
    outDir: "../dist",
    emptyOutDir: true,
    rollupOptions: {
      input: fg.sync("src/**/*.html", { absolute: true })
    }
  }
});
