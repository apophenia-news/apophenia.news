import path from "node:path";

export const ROOT = process.cwd();
export const SRC = path.join(ROOT, "src");
export const PUBLIC = path.join(ROOT, "public");
export const ARTICLES_GLOB = "articles/**/index.md";
export const SITE_URL = (process.env.SITE_URL || "https://apophenia.news").replace(/\/+$/, "");

export const AUTHOR_PAGES = [
  {
    slug: "renox",
    name: "Renox",
    bio: "Renox is the founder of apophenia.news.",
    contact: "planetrenox@pm.me",
    image: ""
  }
];
