import fs from "node:fs/promises";
import path from "node:path";
import fg from "fast-glob";
import matter from "gray-matter";
import { marked } from "marked";

const ROOT = process.cwd();
const SRC = path.join(ROOT, "src");
const ARTICLES_GLOB = "articles/**/index.md";

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

const shellHead = ({ title, desc, image }) => `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <meta name="description" content="${escapeHtml(desc || "")}" />
  <meta property="og:title" content="${escapeHtml(title)}" />
  <meta property="og:description" content="${escapeHtml(desc || "")}" />
  <meta property="og:type" content="article" />
  ${image ? `<meta property="og:image" content="${image}" />` : ""}
  <meta name="theme-color" content="#fcfcfa" />
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
      <a href="#latest">Latest</a>
    </nav>
    <nav class="sm:hidden absolute left-4 right-4 top-[70px] card p-3" x-show="open" x-transition>
      <a class="block py-1.5" href="/">Home</a>
      <a class="block py-1.5" href="#latest">Latest</a>
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
  image: "https://direct-img.link/constellation+data+points+minimal+white+background"
})}
${nav}
<main class="shell py-10">
  <section class="card p-6 sm:p-10 bg-gradient-to-b from-white to-indigo-50/50">
    <p class="tag mb-3"><i data-lucide="sparkles" class="h-3.5 w-3.5"></i>Pattern Intelligence Journalism</p>
    <h1 class="text-4xl sm:text-5xl font-bold leading-tight">The news outlet for pattern seekers</h1>
    <p class="mt-4 text-zinc-700 max-w-2xl">High-agency analysis at the intersection of AGI, consciousness, geopolitics, and first-contact logic.</p>
  </section>

  <section id="latest" class="mt-10">
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
${shellHead({ title: `${article.title} — apophenia.news`, desc: article.description, image: article.header_image })}
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

  for (const article of articles) {
    const dir = path.join(SRC, article.slug);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(path.join(dir, "index.html"), renderArticle(article), "utf8");
  }

  console.log(`Generated ${articles.length} article pages + home.`);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
