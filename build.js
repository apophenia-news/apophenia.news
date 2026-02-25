import { readFileSync, writeFileSync, mkdirSync, cpSync, readdirSync, existsSync, statSync } from 'fs'
import { join } from 'path'
import matter from 'gray-matter'
import { marked } from 'marked'

const ARTICLES = 'articles'
const DIST = 'dist'
const TEMPLATES = 'templates'
const STATIC = 'static'

const template = n => readFileSync(join(TEMPLATES, n), 'utf-8')
const articleTmpl = template('article.html')
const homeTmpl = template('home.html')

const render = (tpl, data) =>
  tpl.replace(/{{\s*([a-zA-Z0-9_]+)\s*}}/g, (_, key) => `${data[key] ?? ''}`)

const fmtDateLong = d =>
  d ? new Date(d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : ''

const fmtDateIso = d => (d ? new Date(d).toISOString().split('T')[0] : '')

mkdirSync(DIST, { recursive: true })

if (existsSync(STATIC)) cpSync(STATIC, DIST, { recursive: true })

const articles = []

for (const slug of readdirSync(ARTICLES)) {
  const dir = join(ARTICLES, slug)
  if (!statSync(dir).isDirectory()) continue

  const mdPath = join(dir, 'index.md')
  if (!existsSync(mdPath)) continue

  const { data, content } = matter(readFileSync(mdPath, 'utf-8'))
  const html = marked(content)

  const outDir = join(DIST, slug)
  mkdirSync(outDir, { recursive: true })

  for (const f of readdirSync(dir)) {
    if (f === 'index.md') continue
    cpSync(join(dir, f), join(outDir, f), { recursive: true })
  }

  const page = render(articleTmpl, {
    title: data.title || slug,
    date: fmtDateLong(data.date),
    date_iso: fmtDateIso(data.date),
    tags: (data.tags || [])
      .map(
        t =>
          `<span class="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-xs font-medium text-gray-600 mono">${t}</span>`
      )
      .join(' '),
    excerpt: data.excerpt || '',
    slug,
    body: html
  })

  writeFileSync(join(outDir, 'index.html'), page)
  articles.push({ slug, ...data })
  console.log(`✅ ${slug}`)
}

articles.sort((a, b) => new Date(b.date) - new Date(a.date))

const articleListHtml = articles
  .map(
    a => `
  <a href="/${a.slug}/" class="block rounded-2xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow overflow-hidden">
    <div class="px-5 py-4">
      <div class="flex items-start justify-between gap-4">
        <h2 class="text-base font-semibold text-gray-900">${a.title}</h2>
        <time datetime="${new Date(a.date).toISOString().split('T')[0]}" class="mono text-xs text-gray-400 whitespace-nowrap mt-0.5">${new Date(a.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</time>
      </div>
      ${a.excerpt ? `<p class="text-sm text-gray-500 mt-1.5">${a.excerpt}</p>` : ''}
      <div class="flex gap-1.5 mt-3">${(a.tags || [])
        .map(
          t =>
            `<span class="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-xs font-medium text-gray-600 mono">${t}</span>`
        )
        .join('')}</div>
    </div>
  </a>`
  )
  .join('\n')

const home = render(homeTmpl, { articles: articleListHtml })
writeFileSync(join(DIST, 'index.html'), home)
console.log(`\n🏠 index.html → ${articles.length} article(s)`)
