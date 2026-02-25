## The news outlet for pattern seekers

### Structure

```
articles/
  why-pigeons-watch-you/
    index.md          ← frontmatter + markdown
    pigeon-wire.webp  ← co-located assets
templates/
  article.html        ← shared article shell
  home.html           ← index page
static/
  style.css
  favicon.svg
build.js              ← markdown → dist pipeline
```

### Usage

```bash
npm i
npm run build    # outputs to dist/
npm run dev      # vite dev server
```
