# Design & architecture reference

A blueprint for rebuilding this kind of small-business site — static build,
free hosting, editor-friendly CMS, block-based home page, tag/category-aware
blog — on a new domain and repo. Everything here is what we actually shipped;
nothing hypothetical.

## What "this" is

A static marketing site for a small business, with:

- Home page built from **reorderable typed sections** (hero, banner, feature
  cards, services, about, team, CTA, blog list, plus 6 custom types the editor
  can drop in freely)
- **Blog** with categories and tags, both managed by the editor
- **Auto-generated filter pages** at `/blog/category/<slug>/` and
  `/blog/tag/<slug>/`
- **Blog sidebar** with a category list (with counts) and a size-tiered tag
  cloud ("heatmap")
- **Contact form** wired to Formspree, redirects to a thank-you page
- **CMS at `/admin/`** where non-technical staff manage everything through
  a friendly UI, logging in with GitHub
- **Custom domain** with HTTPS, DNS pointed at GitHub Pages

Total ongoing cost: **$0** (GitHub Pages, Cloudflare Workers free tier,
Formspree free tier for ≤50 submissions/month).

---

## Stack at a glance

| Concern | Choice |
|---|---|
| Static site generator | **Eleventy 3.x** (Nunjucks templates, Markdown posts) |
| Hosting | **GitHub Pages** via GitHub Actions workflow (no `gh-pages` branch) |
| CMS | **Decap CMS** (fork of Netlify CMS), served from `/admin/` |
| CMS auth | GitHub OAuth backend + tiny **Cloudflare Worker** as OAuth proxy |
| Contact form | **Formspree** (drop-in POST endpoint) |
| Node runtime (CI) | Node 22 (LTS) on `ubuntu-latest` |
| Local dev CMS | `decap-server` proxy (no auth needed locally) |

Nothing here needs a database, a Node server, or a paid tier.

---

## Deployment architecture

```
┌──────────────────────────────────────────────────────────────┐
│                     legacyfinancialplanning.ca               │
│                       (custom domain)                        │
└──────────────────────────────────────────────────────────────┘
                              │  DNS: A records → 185.199.108-111.153
                              ▼
┌──────────────────────────────────────────────────────────────┐
│                     GitHub Pages                             │
│              serves _site/ artifact from                     │
│              the last successful Actions run                 │
└──────────────────────────────────────────────────────────────┘
                              ▲
                              │  actions/deploy-pages
┌──────────────────────────────────────────────────────────────┐
│                    GitHub Actions                            │
│       npm ci → npm run build → upload-pages-artifact         │
│               (triggered on push to main)                    │
└──────────────────────────────────────────────────────────────┘
                              ▲
                              │  push
┌──────────────────────────────────────────────────────────────┐
│         GitHub repo main branch  ◀───────┐                   │
└──────────────────────────────────────────────────────────────┘
                              ▲            │  commits
                              │            │
                    editor's browser ─────────┐
                       Decap CMS UI at /admin/│
                              │            │
                              │  OAuth     │
                              ▼            │
┌──────────────────────────────────────────────────────────────┐
│           Cloudflare Worker (OAuth proxy)                    │
│      /auth  → redirect to GitHub OAuth                       │
│      /callback  → exchange code + client_secret → token      │
└──────────────────────────────────────────────────────────────┘

Contact form:
  browser  ──POST──▶  formspree.io/f/<id>  ──email──▶  info@…
```

---

## Repository layout

```
.
├── .github/workflows/deploy.yml       ← Actions: build + Pages deploy
├── .eleventy.js                       ← Eleventy config
├── .gitignore
├── .nojekyll                          ← empty; belt-and-suspenders
├── package.json / package-lock.json
├── src/
│   ├── .nojekyll                      ← copied to _site/.nojekyll
│   ├── CNAME                          ← custom domain (single line)
│   ├── 404.njk                        ← permalink: /404.html
│   ├── blog.njk                       ← /blog/ listing
│   ├── blog-category.njk              ← paginated /blog/category/<slug>/
│   ├── blog-tag.njk                   ← paginated /blog/tag/<slug>/
│   ├── contact.njk                    ← /contact/
│   ├── contact-thanks.njk             ← /contact/thanks/
│   ├── index.njk                      ← / — loops home.sections
│   ├── admin/
│   │   ├── config.yml                 ← Decap CMS config (all collections)
│   │   └── index.html                 ← Decap CMS loader
│   ├── _data/
│   │   ├── site.json                  ← company info (name, phone, logo, …)
│   │   ├── home.json                  ← home page: { sections: […] }
│   │   ├── categories/*.yml           ← one file per category (managed by CMS)
│   │   └── tags/*.yml                 ← one file per tag (managed by CMS)
│   ├── _includes/
│   │   ├── layout.njk                 ← site chrome (nav, footer, scripts)
│   │   ├── post.njk                   ← individual blog post layout
│   │   ├── custom-section.njk         ← renders any typed section block
│   │   └── blog-sidebar.njk           ← Categories + Tags widgets
│   ├── css/style.css
│   ├── images/                        ← uploaded via CMS
│   └── posts/
│       ├── posts.json                 ← default frontmatter for posts
│       └── YYYY-MM-DD-slug.md
└── oauth-worker/                      ← Cloudflare Worker source (see below)
    ├── package.json
    ├── worker.js
    ├── wrangler.toml
    └── README.md
```

Eleventy is configured with `dir.input = "src"` — everything outside `src/`
is untouched by the build (except `_site/` for output).

---

## Content model

### `src/_data/site.json` — global site info

```json
{
  "name": "…",
  "tagline": "…",
  "description": "…",
  "phone": "+1 (778) …",
  "email": "info@…",
  "email_secondary": "",
  "address": "…",
  "logo": "/images/uploaded-logo.png"
}
```

Used everywhere via `{{ site.foo }}` in templates.

### `src/_data/home.json` — home page as ordered blocks

```json
{
  "sections": [
    { "type": "hero_slider",         "slides": [...] },
    { "type": "consultation_banner", "text": "…", "button_label": "…", ... },
    { "type": "feature_cards",       "cards": [...] },
    { "type": "services",            "heading": "…", "cards": [...] },
    { "type": "about",               "heading": "…", "text": "…", "stat_number": "3", ... },
    { "type": "team",                "heading": "…", "members": [...] },
    { "type": "cta_band",            "heading": "…", "style": "navy" },
    { "type": "testimonial",         "quote": "…", "author_name": "…" },
    { "type": "blog_list",           "heading": "…" }
  ]
}
```

The template just loops the array and dispatches to a partial per `type`.
Editors reorder / add / delete sections; nothing else changes.

**Available `type` values** (each with its own fields — see
`src/admin/config.yml` for the definitive schema):

| Type | Purpose |
|---|---|
| `hero_slider` | Rotating hero with background image, eyebrow, heading, CTA |
| `consultation_banner` | Gold band with text + CTA |
| `feature_cards` | 3 icon tiles (icons hardcoded in template, cycle after 3) |
| `services` | 3-column service cards with icons |
| `about` | Two-column: text + stat panel (e.g. "3 Pillars") |
| `team` | Grid of member cards (photo, name, role, bio) |
| `blog_list` | Latest 3 posts from `collections.posts` |
| `tile_grid` | Generic 3-tile grid, no icons |
| `two_column` | Text + optional image, image side left/right |
| `cta_band` | Full-width call-to-action band (navy/gold/soft/plain) |
| `rich_text` | Free markdown block |
| `service_cards` | Like `services` but no icons |
| `testimonial` | Big italic quote + attribution |

### `src/_data/categories/*.yml` and `src/_data/tags/*.yml`

One tiny file per category or tag, e.g. `insurance.yml`:

```yaml
name: "Insurance"
```

Editors create and delete these via the CMS's "Categories" / "Tags" sections.
Blog posts pick from them via the CMS's `relation` widget.

### Blog post frontmatter

```yaml
---
title: My post
date: 2025-05-30
category: Insurance          # matches a name in _data/categories/
tags:                        # each matches a name in _data/tags/
  - home
  - savings
image: "/images/foo.jpg"
image_position: center
excerpt: One-liner shown on the blog card.
---

Post body in Markdown.
```

Categories and tags are stored as their string names (not slugs) — the URL
slugs are computed at render time via `| slugify`.

---

## CMS (Decap) design

See `src/admin/config.yml` for the full definition. Structure:

```
backend: github            ← via OAuth proxy (see below)
local_backend: true        ← ignored on live site; enables local dev CMS
media_folder: "src/images"
public_folder: "/images"

collections:
  ─ Blog Posts   (folder-based, src/posts/*.md)
  ─ Categories   (folder-based, src/_data/categories/*.yml)
  ─ Tags         (folder-based, src/_data/tags/*.yml)
  ─ Home Page    (file-based, edits src/_data/home.json)
  ─ Site Settings (file-based, edits src/_data/site.json)
```

**Key techniques worth reusing:**

- **Typed list for home page sections** — `widget: list` with `types:` gives
  editors an "Add Section" dropdown of block types. Every type has its own
  fields, a `summary:` for the collapsed row, and drag-to-reorder built in.
- **`collapsed: true` + `minimize_collapsed: true`** on long lists so the
  UI stays scannable.
- **Relation widgets for category/tag pickers** — `widget: relation` pointing
  at the categories/tags collections. New categories added by the editor
  appear in the picker immediately.
- **Data-driven select vs static enum** — folder-based collections (Categories,
  Tags) are the pattern that lets editors add options without touching the
  config file. Static `select` widgets are fine when the list truly won't
  change (e.g. image focus point: top/center/bottom).
- **Hint text on every non-obvious field** — a one-liner under each field
  saves the editor a support ticket. E.g. "Upload at least 600×600 for a
  sharp result."

---

## Templates & rendering

### The core loop (`src/index.njk`)

```njk
---
layout: layout.njk
title: Home
permalink: /
---

{% for section in home.sections %}
  {% include "custom-section.njk" %}
{% endfor %}
```

That's the whole home page template. All rendering logic lives in
`src/_includes/custom-section.njk`, which is a big `{% if section.type == "…" %}
… {% elif … %}` dispatch.

### Blog listing (`src/blog.njk` + `blog-sidebar.njk`)

Two-column `.blog-grid`:
- Left: `.posts` grid of post cards
- Right: `<aside class="blog-sidebar">` include with Categories widget +
  Tag cloud widget

Category badges and tag chips are `<a>`s linking to filter pages.

### Auto-generated filter pages

Pagination-based. `.eleventy.js` adds two collections that group posts:

```js
eleventyConfig.addCollection("postsByCategory", (c) => {
  const buckets = new Map();
  for (const post of c.getFilteredByGlob("src/posts/*.md")) {
    const name = post.data.category;
    if (!name) continue;
    if (!buckets.has(name)) buckets.set(name, []);
    buckets.get(name).push(post);
  }
  return Array.from(buckets, ([name, posts]) => ({ name, posts }));
});
// Same shape for postsByTag, looping post.data.tags || [].
```

Then `src/blog-category.njk` and `src/blog-tag.njk` paginate over those:

```njk
---
pagination:
  data: collections.postsByCategory
  size: 1
  alias: cat
permalink: "/blog/category/{{ cat.name | slugify }}/"
---
```

One page per record. Only categories/tags with ≥1 post produce a page —
unused categories from `src/_data/categories/` are skipped.

### The Tag heatmap

In `src/_includes/blog-sidebar.njk`, tag chips are sized in three tiers
(`sm` / `md` / `lg`) based on `tag.posts.length / maxPostCount`:

```njk
{% set _tagMax = 1 %}
{% for t in _tags %}{% if t.posts.length > _tagMax %}{% set _tagMax = t.posts.length %}{% endif %}{% endfor %}

{% for tag in _tags %}
  {% set _ratio = tag.posts.length / _tagMax %}
  {% set _tier = 'lg' if _ratio >= 0.66 else ('md' if _ratio >= 0.33 else 'sm') %}
  <a class="chip chip--{{ _tier }}" href="…">{{ tag.name }}</a>
{% endfor %}
```

Three tiers is enough visual variety; continuous font-size lerping looks noisy.

---

## Build pipeline

`.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages
on:
  push: { branches: [main] }
  workflow_dispatch:
permissions: { contents: read, pages: write, id-token: write }
concurrency: { group: pages, cancel-in-progress: false }
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v5
      - uses: actions/setup-node@v4
        with: { node-version: '22', cache: 'npm' }
      - run: npm ci
      - run: npm run build
      - uses: actions/configure-pages@v5
        with: { enablement: true }      ← auto-enables Pages on first run
      - uses: actions/upload-pages-artifact@v3
        with: { path: _site }
  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment: { name: github-pages, url: ${{ steps.deployment.outputs.page_url }} }
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

`enablement: true` on `configure-pages` means the first build auto-turns on
Pages with Source = GitHub Actions. No manual UI toggle required.

**If the site is served under a subdirectory (project site, not custom
domain), set a `PATH_PREFIX` env var on the build step:**

```yaml
      - run: npm run build
        env:
          PATH_PREFIX: /repo-name/
```

Combined with `pathPrefix: process.env.PATH_PREFIX || "/"` in `.eleventy.js`
and `{{ '/absolute/path' | url }}` in templates, this rewrites every internal
link. Leave unset for custom-domain sites.

---

## External services — the setup checklist

### 1. GitHub OAuth App (~5 min)

- GitHub Settings → Developer settings → OAuth Apps → **New**
- Homepage URL: your site URL
- Authorization callback URL: placeholder for now
  (`https://placeholder.example.com/callback`) — update after step 2
- Copy Client ID; generate + copy Client Secret

### 2. Cloudflare Worker OAuth proxy (~15 min)

Ready-to-deploy source lives in `oauth-worker/`. From that folder:

```bash
npm install                    # installs wrangler locally (no sudo)
npm run login                  # authorize wrangler in the browser
npm run secret:client-id       # paste Client ID at the prompt
npm run secret:client-secret   # paste Client Secret at the prompt
npm run deploy
```

- Copy the printed URL, e.g. `https://<name>.<account>.workers.dev`
- Go back to the GitHub OAuth App and update the callback URL to
  `https://<that-url>/callback`
- Update `src/admin/config.yml` `backend.base_url` to `https://<that-url>`
- **Do NOT reuse the same Worker across two OAuth apps** — the callback URL
  is fixed. One OAuth app + one Worker per site, unless you deliberately
  share (see notes on secret rotation coupling below).

The Worker is ~90 lines: `/auth` redirects to GitHub OAuth, `/callback`
exchanges the code + secret for a token, posts the token to the opener
window. See `oauth-worker/worker.js`.

### 3. Formspree (~5 min)

- Sign up at formspree.io, create a form with the destination email
- Copy the form ID (the `xxxxxxxx` in `https://formspree.io/f/xxxxxxxx`)
- Update the `action` attribute in `src/contact.njk`

The form needs two extra hidden inputs:
- `<input type="hidden" name="_next" value="https://<domain>/contact/thanks/">`
  — where to redirect after submit
- `<input type="text" name="_gotcha" style="display:none">` — honeypot

### 4. DNS + custom domain (~15 min + up to 24h for TLS cert)

- Add `src/CNAME` (single line, no protocol: `example.com`)
- Add `eleventyConfig.addPassthroughCopy("src/CNAME");` in `.eleventy.js`
- Repo → Settings → Pages → **Custom domain** → enter the domain → **Save**
- DNS at your registrar:
  - Apex: four A records → `185.199.108.153`, `185.199.109.153`,
    `185.199.110.153`, `185.199.111.153`
  - `www`: CNAME → `<user>.github.io`
- Wait for GitHub's DNS check to pass
- Enable **Enforce HTTPS** once the cert issues (up to an hour, sometimes
  longer)
- **Only ONE repo can claim a given custom domain** at a time — if you
  transfer, clear the setting on the losing repo first

---

## Local development

Two-terminal workflow:

```bash
npm install       # once
npm start         # terminal 1: Eleventy dev server on :8080
npm run cms       # terminal 2: Decap proxy on :8081, no login needed locally
```

Then `http://localhost:8080/admin/` opens the CMS with no auth prompt —
Decap auto-detects the local proxy and reads/writes directly to your git
working tree. Save in the CMS → files change on disk → Eleventy rebuilds →
browser refreshes.

The `local_backend: true` line in `admin/config.yml` is what enables this.
It's ignored on the deployed site (GitHub OAuth still handles auth there).

---

## Known gotchas (things we hit while building this)

### 1. `crypto.randomUUID is not a function` in the CMS
The Decap admin JS uses `crypto.randomUUID`, which browsers only expose in
**secure contexts (HTTPS or localhost)**. If you visit `http://<domain>/admin/`
the CMS fails to init. Fix: enforce HTTPS on the GitHub Pages custom domain,
or always use `https://` when visiting `/admin/`.

### 2. `tags` is a reserved Eleventy keyword
Eleventy uses `tags:` frontmatter to build collections
(`{% for post in collections.posts %}`). If you also use `tags:` for
user-facing content tagging (as we did), the two collide — Eleventy's
internal collection identifier leaks into the visible tag list.

Fix: **build the `posts` collection from a glob** in `.eleventy.js`
(`collection.getFilteredByGlob("src/posts/*.md")`) and drop the
`tags: ["posts"]` line from `src/posts/posts.json`. Now `tags:` is 100%
user-facing.

### 3. Jekyll runs by default on GitHub Pages
Setting a custom domain via the Pages UI has a known quirk where **Source can
flip back to "Deploy from a branch"** — which triggers Jekyll on the raw
source. Jekyll tries to parse `.njk` as Liquid and dies on `{% set %}`.

Two mitigations, apply both:
- Add `.nojekyll` at the **repo root** (not just in `src/`) — even if Jekyll
  is invoked, it exits immediately
- Verify Pages Source is set to **GitHub Actions**, not "Deploy from a branch"

### 4. Project-site subdirectory paths
GitHub Pages serves a repo at `<user>.github.io/<repo>/` if there's no
custom domain. Absolute paths like `/css/style.css` in your HTML then 404
because they resolve to the domain root.

Fix: `pathPrefix: process.env.PATH_PREFIX || "/"` in `.eleventy.js`, wrap
internal URLs with `| url` filter, set `PATH_PREFIX=/repo-name/` in the
build workflow. Custom-domain sites don't need this — leave `PATH_PREFIX`
unset and paths work at the domain root.

### 5. macOS `npm install -g` permission errors
`npm install -g wrangler` fails with `EACCES` on default macOS setups (npm's
global prefix is root-owned `/usr/local/lib/node_modules`). Don't use `sudo`.

Fix: install wrangler locally as a devDependency in `oauth-worker/`, expose
it via npm scripts (`npm run login`, `npm run deploy`, etc.). No global
install needed.

### 6. Never paste OAuth secrets into files
`wrangler secret put OAUTH_CLIENT_SECRET` **prompts** for the value at the
terminal — it doesn't take it as an argument. Editing a config file with
the raw secret is the wrong pattern; the secret lives only in Cloudflare's
encrypted store. `.gitignore` these anyway as belt-and-suspenders:

```
.env
.env.*
.dev.vars      # wrangler local secrets
.wrangler/     # wrangler state cache
*.pem
*.key
```

### 7. Hot-linked assets are fragile
If your images point at some other domain (a WordPress host, a CDN you
don't control), one DNS change or hosting cancellation breaks every
reference. Always **commit images into `src/images/`** rather than
hot-linking.

### 8. Only one repo can claim a custom domain
The custom-domain field in Pages Settings writes a `CNAME` file to the
repo. If two repos both have that CNAME, only one wins. **Clear the domain
from the losing repo before setting it on the new one**, or accept a brief
404 window during handoff.

### 9. Fresh Formspree forms have low limits
Free tier: 50 submissions/month **total**. If two sites share the same
form ID, the count is shared. Fine for testing, use separate forms for
separate businesses.

---

## Reproduction checklist for a new site

For someone spinning up a fresh copy of this stack:

1. **Clone this repo to a new folder, wipe `.git`, `git init`, push to a
   new GitHub repo.** Or fork on GitHub if history isn't sensitive.
2. **Rename**: `src/_data/site.json` (all fields), `src/CNAME` (or delete
   if no custom domain), `oauth-worker/wrangler.toml` (unique Worker
   `name:`).
3. **Register a new GitHub OAuth App** for the new repo — placeholder
   callback URL for now.
4. **Deploy the Worker** from `oauth-worker/`:
   `npm install && npm run login && npm run secret:client-id && npm run
   secret:client-secret && npm run deploy`. Note the Worker URL.
5. **Update GitHub OAuth App** callback URL → `<worker>/callback`.
6. **Update `src/admin/config.yml`**:
   - `backend.repo: <owner>/<new-repo>`
   - `backend.base_url: https://<worker>`
7. **Set up Formspree**, get form ID, update `src/contact.njk` action + `_next`.
8. **DNS + domain**: A records to GH Pages IPs, add domain in Settings →
   Pages → Custom domain.
9. **Wipe placeholder content**: seed `src/_data/home.json` with the
   sections the new site needs, replace posts in `src/posts/`, upload real
   images via the CMS.
10. **First push to `main`** triggers the Actions workflow, Pages
    auto-enables, site publishes. Enable "Enforce HTTPS" once the cert
    provisions.

Time from empty new repo to live site: **~1.5–2 hours**, most of that
waiting on TLS provisioning.

---

## Files worth reading first when opening this codebase

For anyone new to the code, in order:

1. `.eleventy.js` — the whole build config in one 60-line file
2. `src/admin/config.yml` — the CMS schema, i.e. the shape of your content
3. `src/index.njk` — the entire home page (just a loop over sections)
4. `src/_includes/custom-section.njk` — every section type's rendering
5. `src/_includes/layout.njk` — site chrome (nav, footer)
6. `src/css/style.css` — one CSS file; color tokens at the top
7. `.github/workflows/deploy.yml` — the deploy pipeline
8. `oauth-worker/worker.js` — the auth proxy

Everything else is either data (`src/_data/**`, `src/posts/**`, `src/images/**`)
or a small template variation.
