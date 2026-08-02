# Legacy Financial Planning — Website

A small-business marketing site — home, blog, contact — deployed free on
GitHub Pages, with a friendly CMS at `/admin/` so non-technical staff can
edit everything without touching code. This same shape is intentionally
reusable as a **starter template for other small-business sites**.

## Stack

- **[Eleventy 3.x](https://www.11ty.dev/)** — static site generator (Nunjucks + Markdown)
- **[Decap CMS](https://decapcms.org/)** — in-browser editor at `/admin/`
- **[GitHub Pages](https://pages.github.com/)** — free hosting via GitHub Actions
- **[Cloudflare Workers](https://workers.cloudflare.com/)** — ~90-line OAuth proxy for CMS auth (free tier)
- **[Formspree](https://formspree.io/)** — contact form endpoint (free tier: 50 submissions/month)

Total ongoing cost: **$0**.

## Quick start (local)

```bash
npm install       # once
npm start         # terminal 1 — preview at http://localhost:8080
npm run cms       # terminal 2 — CMS proxy, no login needed locally
```

Then `http://localhost:8080/admin/` opens the CMS with no auth prompt. Edits
write straight to `src/_data/*.json` and `src/posts/*.md`; the dev server
rebuilds automatically.

```bash
npm run build     # produces the finished site in _site/
```

## Deploy

Every push to `main` triggers `.github/workflows/deploy.yml` — Eleventy
builds, GitHub Actions publishes `_site/` to GitHub Pages. Live in ~90
seconds. Custom domain is set via `src/CNAME` + repo Settings → Pages.

Full setup — including OAuth app, Cloudflare Worker deploy, Formspree, DNS
— is documented in [`design.md`](./design.md).

## Documentation

| Read this | For |
|---|---|
| [`design.md`](./design.md) | How the site works — architecture, content model, CMS design, external services, gotchas. |
| [`testing.md`](./testing.md) | How to verify it still works — manual playbook, regression checklist, debug flowchart. |
| [`CUSTOMIZATION.md`](./CUSTOMIZATION.md) | How to fork this as a template for a new client site — rebrand, retheme, add pages, add section types. |
| [`SETUP-GUIDE.md`](./SETUP-GUIDE.md) | Client-facing editor manual (day-to-day CMS use). |
| [`oauth-worker/README.md`](./oauth-worker/README.md) | Deploying the OAuth proxy Worker. |
| [`MIGRATION.md`](./MIGRATION.md) | Historical: the one-time Netlify → GitHub Pages migration. Skip unless doing that migration on another site. |

## Project layout at a glance

```
src/
├── admin/           ← Decap CMS config + loader
├── _data/           ← site.json, home.json, categories/, tags/
├── _includes/       ← layout + section renderer + blog sidebar
├── css/             ← one stylesheet, color tokens at the top
├── images/          ← uploaded via CMS
├── posts/           ← blog posts as Markdown
├── index.njk        ← home page (loops home.sections)
├── blog.njk         ← /blog/ listing
├── blog-category.njk  ← auto-generated /blog/category/<slug>/
├── blog-tag.njk     ← auto-generated /blog/tag/<slug>/
├── contact.njk      ← /contact/
└── CNAME            ← custom domain
```

Full layout in [`design.md`](./design.md).

## License

MIT — see [`LICENSE`](./LICENSE). Reuse the code freely for other projects.
