import fs from "node:fs/promises";
import path from "node:path";
import fg from "fast-glob";
import matter from "gray-matter";
import { marked } from "marked";
import { ARTICLES_GLOB, AUTHOR_PAGES, ROOT, SRC, UNLISTED_PATH } from "./lib/constants.mjs";
import { fixInternalLinks } from "./lib/utils.mjs";
import { renderArticle, renderHome, renderWritePage, renderNewsletterPage, renderAuthorPage } from "./lib/renderers.mjs";
import { ensureCleanGenerated, writeDiscoveryFiles, writePage } from "./lib/io.mjs";

marked.setOptions({ breaks: true, gfm: true });

const getUnlistedSlugs = async () => {
  try {
    const raw = await fs.readFile(UNLISTED_PATH, "utf8");
    return new Set(raw.split("\n").map((s) => s.trim()).filter((s) => s && !s.startsWith("#")));
  } catch {
    return new Set();
  }
};

const copyArticleAssets = async (file, slug) => {
  const dir = path.dirname(file);
  const entries = await fs.readdir(dir, { withFileTypes: true });
  await Promise.all(
    entries
      .filter((entry) => entry.name !== "index.md")
      .map((entry) =>
        fs.cp(path.join(dir, entry.name), path.join(SRC, slug, entry.name), {
          recursive: true,
          force: true
        })
      )
  );
};

const run = async () => {
  const [files, unlisted] = await Promise.all([
    fg(ARTICLES_GLOB, { cwd: ROOT, absolute: true }),
    getUnlistedSlugs()
  ]);

  const articles = [];

  for (const file of files) {
    const md = await fs.readFile(file, "utf8");
    const { data, content } = matter(md);
    if (!data.slug) continue;

    articles.push({
      ...data,
      sourceFile: file,
      isUnlisted: unlisted.has(data.slug),
      html: fixInternalLinks(marked.parse(content))
    });
  }

  articles.sort((a, b) => +new Date(b.date) - +new Date(a.date));
  const listedArticles = articles.filter((a) => !a.isUnlisted);

  await ensureCleanGenerated();

  await writePage([SRC, "index.html"], renderHome(listedArticles));
  await writePage([SRC, "write", "index.html"], renderWritePage());
  await writePage([SRC, "newsletter", "index.html"], renderNewsletterPage());

  for (const author of AUTHOR_PAGES) {
    await writePage([SRC, "author", author.slug, "index.html"], renderAuthorPage(author));
  }

  for (const article of articles) {
    await writePage([SRC, article.slug, "index.html"], renderArticle(article));
    await copyArticleAssets(article.sourceFile, article.slug);
  }

  await writeDiscoveryFiles(listedArticles, AUTHOR_PAGES);

  console.log(`Generated ${articles.length} article pages (${listedArticles.length} listed) + home + write + newsletter + author pages + rss/sitemap/robots.`);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
