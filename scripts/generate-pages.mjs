import fs from "node:fs/promises";
import fg from "fast-glob";
import matter from "gray-matter";
import { marked } from "marked";
import { ARTICLES_GLOB, AUTHOR_PAGES, ROOT, SRC } from "./lib/constants.mjs";
import { fixInternalLinks } from "./lib/utils.mjs";
import { renderArticle, renderHome, renderWritePage, renderAuthorPage } from "./lib/renderers.mjs";
import { ensureCleanGenerated, writeDiscoveryFiles, writePage } from "./lib/io.mjs";

marked.setOptions({ breaks: true, gfm: true });

const run = async () => {
  const files = await fg(ARTICLES_GLOB, { cwd: ROOT, absolute: true });
  const articles = [];

  for (const file of files) {
    const md = await fs.readFile(file, "utf8");
    const { data, content } = matter(md);
    if (!data.slug) continue;

    articles.push({
      ...data,
      html: fixInternalLinks(marked.parse(content))
    });
  }

  articles.sort((a, b) => +new Date(b.date) - +new Date(a.date));

  await ensureCleanGenerated();

  await writePage([SRC, "index.html"], renderHome(articles));
  await writePage([SRC, "write", "index.html"], renderWritePage());

  for (const author of AUTHOR_PAGES) {
    await writePage([SRC, "author", author.slug, "index.html"], renderAuthorPage(author));
  }

  for (const article of articles) {
    await writePage([SRC, article.slug, "index.html"], renderArticle(article));
  }

  await writeDiscoveryFiles(articles, AUTHOR_PAGES);

  console.log(`Generated ${articles.length} article pages + home + write + author pages + rss/sitemap/robots.`);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
