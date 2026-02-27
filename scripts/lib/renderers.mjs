import { SITE_URL } from "./constants.mjs";
import { footer, nav, shellHead } from "./templates.mjs";
import { escapeHtml, escapeXml, fmtDate, renderAuthorInline, toISODate } from "./utils.mjs";

export const renderHome = (articles) => `
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

export const renderArticle = (article) => `
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
      <p class="text-xs uppercase tracking-wide text-zinc-500">${fmtDate(article.date)} • ${renderAuthorInline(article.author)}</p>
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

export const renderWritePage = () => `
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

export const renderAuthorPage = (author) => `
${shellHead({
  title: `${author.name} — apophenia.news`,
  desc: author.bio,
  image: author.image || "https://direct-img.link/author+profile+minimal+portrait+placeholder",
  url: `${SITE_URL}/author/${author.slug}/`,
  type: "profile"
})}
${nav}
<main class="shell py-10">
  <article class="card p-6 sm:p-10">
    <p class="tag mb-3"><i data-lucide="user-round" class="h-3.5 w-3.5"></i>Author</p>
    <h1 class="text-4xl sm:text-5xl font-bold leading-tight">${escapeHtml(author.name)}</h1>

    <div class="mt-8 grid md:grid-cols-[240px,1fr] gap-8 items-start">
      <div class="h-64 w-full rounded-2xl border border-dashed border-zinc-300 bg-zinc-50/70 flex items-center justify-center text-sm text-zinc-500">
        Photo coming soon
      </div>

      <div class="article-prose max-w-none">
        <p>${escapeHtml(author.bio)}</p>
        <p><strong>Contact:</strong> <a href="mailto:${escapeHtml(author.contact)}">${escapeHtml(author.contact)}</a></p>
      </div>
    </div>
  </article>
</main>
${footer}
`;

export const renderRss = (articles) => {
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

export const renderSitemap = (articles, authors = []) => {
  const now = toISODate(new Date());
  const urls = [
    { loc: `${SITE_URL}/`, lastmod: now },
    { loc: `${SITE_URL}/write/`, lastmod: now },
    ...authors.map((a) => ({ loc: `${SITE_URL}/author/${a.slug}/`, lastmod: now })),
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

export const renderRobots = () => `User-agent: *
Allow: /

Sitemap: ${SITE_URL}/sitemap.xml
`;
