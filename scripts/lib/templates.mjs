import { SITE_URL } from "./constants.mjs";
import { escapeHtml } from "./utils.mjs";

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

export const shellHead = ({ title, desc, image, url, type = "website" }) => `<!doctype html>
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

export const nav = `
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

export const footer = `
<footer class="mt-16 border-t border-zinc-200 bg-white/70">
  <div class="shell py-8 text-sm text-zinc-600 flex flex-col sm:flex-row justify-between gap-2">
    <p>Apophenia News — finding patterns in the noise since 2026</p>
    <p>© ${new Date().getFullYear()} apophenia.news</p>
  </div>
</footer>
</body>
</html>`;
