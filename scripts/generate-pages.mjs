import fs from "node:fs/promises";
import path from "node:path";
import fg from "fast-glob";
import matter from "gray-matter";
import { marked } from "marked";

const ROOT = process.cwd();
const SRC = path.join(ROOT, "src");
const PUBLIC = path.join(ROOT, "public");
const ARTICLES_GLOB = "articles/**/index.md";
const SITE_URL = (process.env.SITE_URL || "https://apophenia.news").replace(/\/+$/, "");

marked.setOptions({ breaks: true, gfm: true });

const logo = `
<svg class="h-10 w-10 brand-glow" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Apophenia News logo">
  <defs>
    <linearGradient id="ap-grad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#4f46e5"/>
      <stop offset="100%" stop-color="#0ea5e9"/>
    </linearGradient>
  </defs>
  <rect x="6" y="6" width="108" height="108" rx="28" fill="#ffffff" stroke="url(#ap-grad)" stroke-width="8"/>
  <circle cx="36" cy="36" r="8" fill="#4f46e5"/>
  <circle cx="84" cy="36" r="8" fill="#0ea5e9"/>
  <circle cx="36" cy="84" r="8" fill="#0ea5e9"/>
  <circle cx="84" cy="84" r="8" fill="#4f46e5"/>
  <path d="M36 36L84 84M84 36L36 84M36 36H84M36 84H84" stroke="#111827" stroke-opacity=".6" stroke-width="4" stroke-linecap="round"/>
  <circle cx="60" cy="60" r="10" fill="#111827"/>
</svg>`;

const shellHead = ({ title, desc, image, url, type = "website" }) => `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <meta name="description" content="${escapeHtml(desc || "")}" />
  <meta property="og:title" content="${escapeHtml(title)}" />
  <meta property="og:description" content="${escapeHtml(desc || "")}" />
  <meta property="og:type" content="${type}" />
  ${url ? `<meta property="og:url" content="${url}" />` : ""}
  ${image ? `<meta property="og:image" content="${image}" />` : ""}
  <meta name="theme-color" content="#fcfcfa" />
  ${url ? `<link rel="canonical" href="${url}" />` : ""}
  <link rel="alternate" type="application/rss+xml" title="apophenia.news RSS" href="${SITE_URL}/rss.xml" />
  <script type="module" src="/main.js"></script>
</head>
<body>
`;

const nav = `
<header class="sticky top-0 z-40 border-b border-zinc-200/80 bg-paper/95 backdrop-blur">
  <div class="shell py-3 flex items-center justify-between gap-4" x-data="{open:false}">
    <a href="/" class="inline-flex items-center gap-3">
      ${logo}
      <div>
        <p class="text-lg leading-none font-bold">apophenia.news</p>
        <p class="text-xs text-zinc-500">for pattern seekers</p>
      </div>
    </a>
    <button class="sm:hidden p-2 rounded-lg border border-zinc-200 bg-white" @click="open=!open" aria-label="Toggle menu">
      <i data-lucide="menu" class="h-4 w-4"></i>
    </button>
    <nav class="hidden sm:flex items-center gap-6 text-sm">
      <a href="/">Home</a>
      <a href="/write/">Become a writer</a>
      <a href="/rss.xml">RSS</a>
    </nav>
    <nav class="sm:hidden absolute left-4 right-4 top-[70px] card p-3" x-show="open" x-transition>
      <a class="block py-1.5" href="/">Home</a>
      <a class="block py-1.5" href="/write/">Become a writer</a>
      <a class="block py-1.5" href="/rss.xml">RSS</a>
    </nav>
  </div>
</header>
`;

const footer = `
<footer class="mt-16 border-t border-zinc-200 bg-white/70">
  <div class="shell py-8 text-sm text-zinc-600 flex flex-col sm:flex-row justify-between gap-2">
    <p>Apophenia News — finding patterns in the noise since 2026</p>
    <p>© ${new Date().getFullYear()} apophenia.news</p>
  </div>
</footer>
</body>
</html>`;

const fmtDate = (date) =>
  new Date(date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

const escapeHtml = (s = "") =>
  s.replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]));

const escapeXml = (s = "") =>
  s.replace(/[<>&'"]/g, (ch) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" }[ch]));

const fixInternalLinks = (html) =>
  html
    .replace(/href="\.\//g, 'href="/')
    .replace(/href="([^"]+)"(?=[^>]*>)/g, (_, href) =>
      href.startsWith("http") || href.startsWith("#") || href.endsWith("/") || href.endsWith(".md")
        ? `href="${href}"`
        : `href="${href}/"`
    );

const renderHome = (articles) => `
${shellHead({
  title: "apophenia.news — The news outlet for pattern seekers",
  desc: "Signals, anomalies, civilization trajectories, and deep pattern analysis.",
  image: "https://direct-img.link/constellation+data+points+minimal+white+background",
  url: `${SITE_URL}/`,
  type: "website"
})}
${nav}
<main class="shell py-10">
  <section class="card p-6 sm:p-10 bg-gradient-to-b from-white to-indigo-50/50">
    <p class="tag mb-3"><i data-lucide="sparkles" class="h-3.5 w-3.5"></i>Pattern Intelligence Journalism</p>
    <h1 class="text-4xl sm:text-5xl font-bold leading-tight">The news outlet for pattern seekers</h1>
    <p class="mt-4 text-zinc-700 max-w-2xl">High-agency analysis at the intersection of AGI, consciousness, geopolitics, and first-contact logic.</p>
  </section>

  <section class="mt-10">
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-2xl font-bold">Latest Articles</h2>
      <span class="text-sm text-zinc-500">${articles.length} published</span>
    </div>

    <div class="grid md:grid-cols-2 gap-5">
      ${articles
        .map(
          (a) => `
      <article class="card overflow-hidden hover:-translate-y-0.5 transition">
        <img src="${a.header_image}" alt="${escapeHtml(a.title)}" class="h-48 w-full object-cover" />
        <div class="p-5">
          <p class="text-xs uppercase tracking-wide text-zinc-500">${fmtDate(a.date)}</p>
          <h3 class="mt-2 text-2xl font-semibold leading-tight">
            <a href="/${a.slug}/">${escapeHtml(a.title)}</a>
          </h3>
          <p class="mt-2 text-zinc-700">${escapeHtml(a.description || "")}</p>
          <div class="mt-4 flex flex-wrap gap-2">
            ${(a.tags || []).slice(0, 4).map((t) => `<span class="tag">#${escapeHtml(t)}</span>`).join("")}
          </div>
          <a href="/${a.slug}/" class="inline-flex items-center gap-1 mt-5 text-sm font-medium">
            Read article <i data-lucide="arrow-right" class="h-4 w-4"></i>
          </a>
        </div>
      </article>`
        )
        .join("")}
    </div>
  </section>
</main>
${footer}
`;

const renderArticle = (article) => `
${shellHead({
  title: `${article.title} — apophenia.news`,
  desc: article.description,
  image: article.header_image,
  url: `${SITE_URL}/${article.slug}/`,
  type: "article"
})}
${nav}
<main class="shell py-10">
  <article class="card overflow-hidden">
    <img src="${article.header_image}" alt="${escapeHtml(article.title)}" class="h-64 w-full object-cover" />
    <div class="p-6 sm:p-10">
      <p class="text-xs uppercase tracking-wide text-zinc-500">${fmtDate(article.date)} • ${escapeHtml(article.author || "Apophenia")}</p>
      <h1 class="mt-2 text-4xl sm:text-5xl font-bold leading-tight">${escapeHtml(article.title)}</h1>
      <p class="mt-4 text-zinc-700 max-w-3xl">${escapeHtml(article.description || "")}</p>
      <div class="mt-5 flex flex-wrap gap-2">
        ${(article.tags || []).map((t) => `<span class="tag">#${escapeHtml(t)}</span>`).join("")}
      </div>
      <hr class="my-8 border-zinc-200" />
      <div class="article-prose">${article.html}</div>
    </div>
  </article>

  <div class="mt-8">
    <a href="/" class="inline-flex items-center gap-2 text-sm">
      <i data-lucide="arrow-left" class="h-4 w-4"></i> Back to Home
    </a>
  </div>
</main>
${footer}
`;

const renderWritePage = () => `
${shellHead({
  title: "Become a writer for apophenia.news",
  desc: "Pitch your pattern analysis. Email your story as a Markdown file for review and publication.",
  image: "https://direct-img.link/writer+typing+cosmic+newsroom+editorial",
  url: `${SITE_URL}/write/`,
  type: "website"
})}
${nav}
<main class="shell py-10">
  <article class="card p-6 sm:p-10">
    <p class="tag mb-3"><i data-lucide="pen-line" class="h-3.5 w-3.5"></i>Contributor Program</p>
    <h1 class="text-4xl sm:text-5xl font-bold leading-tight">Become a writer for apophenia.news</h1>
    <p class="mt-4 text-zinc-700 max-w-3xl">
      Have a strong pattern-based story, analysis, or investigation? Send it to us.
    </p>

    <div class="article-prose mt-8">
      <h2>How to submit</h2>
      <ul>
        <li>Write your article in a <strong>.md (Markdown)</strong> file.</li>
        <li>Email it to <a href="mailto:planetrenox@pm.me">planetrenox@pm.me</a>.</li>
        <li>If approved, your story will be published on apophenia.news.</li>
        <li>Your byline can use your real name or an alias.</li>
      </ul>

      <h2>Submission tips</h2>
      <ul>
        <li>Lead with a clear thesis and strong evidence.</li>
        <li>Use links/citations when making factual claims.</li>
        <li>Include a short author bio line if you want one shown.</li>
        <li>Add a suggested title, slug, description, and tags at the top (frontmatter preferred).</li>
      </ul>

      <h2>Frontmatter template (optional)</h2>
      <pre><code>---
title: "Your headline"
slug: your-slug
date: 2026-03-01
author: Your Name or Alias
description: "1-2 sentence summary"
header_image: https://direct-img.link/your+image+query
tags:
  - your-tag
  - another-tag
---</code></pre>
    </div>
  </article>
</main>
${footer}
`;

const ensureCleanGenerated = async () => {
  await fs.mkdir(SRC, { recursive: true });
  const children = await fs.readdir(SRC, { withFileTypes: true });
  const keep = new Set(["assets"]);
  await Promise.all(
    children
      .filter((d) => d.isDirectory() && !keep.has(d.name))
      .map((d) => fs.rm(path.join(SRC, d.name), { recursive: true, force: true }))
  );
};

const toISODate = (d) => new Date(d).toISOString().split("T")[0];

const renderRss = (articles) => {
  const lastBuildDate = new Date().toUTCString();
  const items = articles
    .map((a) => {
      const link = `${SITE_URL}/${a.slug}/`;
      return `<item>
  <title>${escapeXml(a.title || "")}</title>
  <link>${escapeXml(link)}</link>
  <guid>${escapeXml(link)}</guid>
  <pubDate>${new Date(a.date).toUTCString()}</pubDate>
  <description>${escapeXml(a.description || "")}</description>
</item>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
<channel>
  <title>apophenia.news</title>
  <link>${SITE_URL}/</link>
  <description>Signals, anomalies, civilization trajectories, and deep pattern analysis.</description>
  <language>en-us</language>
  <lastBuildDate>${lastBuildDate}</lastBuildDate>
  ${items}
</channel>
</rss>
`;
};

const renderSitemap = (articles) => {
  const now = toISODate(new Date());
  const urls = [
    { loc: `${SITE_URL}/`, lastmod: now },
    { loc: `${SITE_URL}/write/`, lastmod: now },
    ...articles.map((a) => ({ loc: `${SITE_URL}/${a.slug}/`, lastmod: toISODate(a.date || new Date()) }))
  ];

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url>
    <loc>${escapeXml(u.loc)}</loc>
    <lastmod>${u.lastmod}</lastmod>
  </url>`
  )
  .join("\n")}
</urlset>
`;
};

const renderRobots = () => `User-agent: *
Allow: /

Sitemap: ${SITE_URL}/sitemap.xml
`;

const writeDiscoveryFiles = async (articles) => {
  await fs.mkdir(PUBLIC, { recursive: true });
  await Promise.all([
    fs.writeFile(path.join(PUBLIC, "rss.xml"), renderRss(articles), "utf8"),
    fs.writeFile(path.join(PUBLIC, "sitemap.xml"), renderSitemap(articles), "utf8"),
    fs.writeFile(path.join(PUBLIC, "robots.txt"), renderRobots(), "utf8")
  ]);
};

const run = async () => {
  const files = await fg(ARTICLES_GLOB, { cwd: ROOT, absolute: true });
  const articles = [];

  for (const file of files) {
    const md = await fs.readFile(file, "utf8");
    const { data, content } = matter(md);
    const html = fixInternalLinks(marked.parse(content));
    if (!data.slug) continue;

    articles.push({
      ...data,
      html
    });
  }

  articles.sort((a, b) => +new Date(b.date) - +new Date(a.date));

  await ensureCleanGenerated();
  await fs.writeFile(path.join(SRC, "index.html"), renderHome(articles), "utf8");

  const writeDir = path.join(SRC, "write");
  await fs.mkdir(writeDir, { recursive: true });
  await fs.writeFile(path.join(writeDir, "index.html"), renderWritePage(), "utf8");

  for (const article of articles) {
    const dir = path.join(SRC, article.slug);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(path.join(dir, "index.html"), renderArticle(article), "utf8");
  }

  await writeDiscoveryFiles(articles);

  console.log(`Generated ${articles.length} article pages + home + write + rss/sitemap/robots.`);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
