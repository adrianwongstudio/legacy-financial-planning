# Testing procedures

How to check the site actually works — before pushing, after pushing, and
when something looks off. There are no automated tests wired in; this is
the manual playbook. See the end for what could be automated later.

Pair this with [design.md](design.md), which documents *how the site works*.
This doc documents *how to prove it still works*.

---

## Table of contents

1. [Ground rules](#ground-rules)
2. [Local build verification](#local-build-verification)
3. [Local dev server smoke test](#local-dev-server-smoke-test)
4. [CMS testing (local, no login)](#cms-testing-local-no-login)
5. [Content testing patterns](#content-testing-patterns)
6. [Responsive / cross-viewport check](#responsive--cross-viewport-check)
7. [Production smoke test after deploy](#production-smoke-test-after-deploy)
8. [Regression checklist](#regression-checklist)
9. [Debugging when something is wrong](#debugging-when-something-is-wrong)
10. [What could be automated](#what-could-be-automated)

---

## Ground rules

- **Every change gets a local build before push.** `npm run build` catches
  90% of what's going to break in Actions. Two-second turnaround, do it.
- **Test with representative content, not empty stubs.** Add a temporary
  tag / section / member to see the real render, then revert before commit.
- **The blog listing and one blog post is the minimum surface to verify
  after any template change** — those are the touched-most templates.
- **Never test on the live domain first.** Test locally, then push, then
  check the deployed site.

---

## Local build verification

Fastest check after any change to `src/**`, `.eleventy.js`, or the CMS
config:

```bash
rm -rf _site && npm run build
```

**What "success" looks like:**

- Exit code 0
- Final line: `[11ty] Copied N files / Wrote M files in Xs (vY.Y.Y)`
- No `[11ty]` lines with `Error` in them (warnings are usually fine — read
  them anyway)

**Then eyeball the output structure:**

```bash
ls -la _site/                              # root: index.html, 404.html, CNAME, .nojekyll, admin/, css/, images/, blog/
ls _site/blog/                             # index.html + one folder per post + category/ + tag/
ls _site/blog/category/ _site/blog/tag/    # one folder per in-use category/tag
```

**Quick grep sanity checks:**

```bash
# No Netlify residue anywhere in the build
grep -r "identity.netlify\|data-netlify\|git-gateway" _site/ 2>&1 | grep -v node_modules

# No WP hot-linked images
grep -c "legacyfinancialplanning.ca/wp-content" _site/**/*.html _site/*.html 2>/dev/null | grep -v ":0$"

# Contact form points at the real Formspree ID
grep -oE 'action="[^"]*"' _site/contact/index.html

# tel: link derives from site.phone (matches displayed number)
grep -o 'tel:[^"]*' _site/index.html | head -1

# CNAME landed correctly at the root
cat _site/CNAME

# .nojekyll present at root (empty file, so byte size 0)
ls -la _site/.nojekyll
```

If any of those look off, don't push. Fix locally first.

---

## Local dev server smoke test

For layout / visual / interaction changes:

```bash
npm start                    # eleventy --serve on http://localhost:8080
```

Open `http://localhost:8080/` and click every page:

- **`/`** — home renders, hero cycles between slides after ~6s, feature
  cards visible, services, about, team, CTA, latest 3 posts, footer
- **`/blog/`** — listing with all posts + right sidebar (Categories,
  Tags cloud)
- **`/blog/<any-post-slug>/`** — the article, category badge at top, tag
  chips below the body (if the post has any), "Back to all articles" link
- **`/blog/category/<any-slug>/`** — filter page, only the matching posts
- **`/blog/tag/<any-slug>/`** — filter page, only tagged posts
- **`/contact/`** — form renders, phone/email/address correct, map iframe
  loads
- **`/contact/thanks/`** — reached by typing the URL directly (fine)
- **`/definitely-not-a-page`** — reaches the styled 404 (via Eleventy
  serving `_site/404.html` on unknown URLs)

**Click every link at least once** on the home page and blog listing:
category badges → category filter page, tag chips → tag filter page,
"View All Articles" → `/blog/`, footer nav → each page, "Get a Quote"
buttons → `/contact/`.

---

## CMS testing (local, no login)

Two-terminal setup:

```bash
npm start                    # terminal 1
npm run cms                  # terminal 2 — decap-server on :8081
```

Open `http://localhost:8080/admin/` in a browser. **No login prompt should
appear** — the local proxy bypasses OAuth. If you see a "Login with GitHub"
button locally, `npm run cms` isn't running or the port is blocked.

**Full CMS smoke test (~5 min):**

1. **Home Page → Home Page Content** — the Page Sections list should show
   all current sections collapsed with meaningful summaries (e.g. "Team —
   Meet the Legacy Financial Planning Team"). Drag one section to a
   different position → save → the change appears in `src/_data/home.json`
   on disk immediately (git status shows it modified) → the running dev
   server rebuilds → the front-end reflects the reorder.
2. **Add a section** — click "Add Section", pick any type, fill required
   fields, publish. Verify it renders on `/`. Then delete it, verify it's
   gone.
3. **Categories** — add a category (e.g. "Retirement"). It should appear
   as a file `src/_data/categories/retirement.yml` and show up in the
   Category dropdown on the Blog Posts form. Delete it and confirm it
   disappears from the dropdown.
4. **Tags** — same pattern.
5. **Blog Posts → New Blog Post** — fill title, date, category, add tags
   (both existing + newly-added), upload a featured image, add body,
   publish. Verify:
   - New markdown file appears in `src/posts/`
   - Post shows on `/blog/`
   - Category badge + tag chips link to filter pages
   - Uploaded image loads (should be at `/images/<uploaded-name>`)
6. **Site Settings** — change the phone number by one digit. Verify:
   - `site.json` on disk updates
   - The `tel:` link on `/` uses the new number (topbar + footer)
   - The displayed number matches the `tel:` — critical, because these
     used to drift apart (see [regression: phone tel: bug](#regression-checklist))
   - Revert the change.

**If the CMS UI won't load** — check browser console. Common errors:

- `TypeError: crypto.randomUUID is not a function` → you're on `http://`,
  need `https://` (secure context). On localhost this works because
  localhost is considered secure.
- Error loading config → YAML syntax error in `src/admin/config.yml`.
  Run `node -e "require('js-yaml').load(require('fs').readFileSync('src/admin/config.yml','utf8'))"`
  to find the parse error.

---

## Content testing patterns

**Pattern 1 — Verify a template change with real-shaped data**

If you change how sections render, add a temporary section to `home.json`
that exercises the change, verify, then revert.

Example: adding a new field to `two_column`? Insert a two-column block
with the new field populated in `src/_data/home.json`, `npm start`, look
at the home page, remove the block before committing.

**Pattern 2 — Verify tag/category pages with representative variety**

The tag cloud sizing tiers only look right when there's variance in post
counts. To verify the heatmap sizing:

```yaml
# In one post's frontmatter:
tags:
  - home         # add to 3 posts total
  - savings      # 1 post
  - family       # 1 post
```

Then check `/blog/` sidebar — `home` should be visibly larger than
`savings`. Revert the tags before committing (unless they're real).

**Pattern 3 — Verify build output without touching the browser**

For headless verification (in CI or a script):

```bash
# All 3 posts still in the collection
grep -oE 'href="/blog/[^"]+"' _site/blog/index.html | sort -u

# Number of post cards on the listing (each card = 3 matches of "post-card"
# for the article + img wrapper + body wrapper — divide as needed)
grep -c "post-card__body" _site/blog/index.html

# Section order on home
awk '/<section /{n++; print n, $0}' _site/index.html
```

---

## Responsive / cross-viewport check

The site has one breakpoint at **900px**. Test at:

- **1280+px** — desktop layout, 2-column blog grid, sidebar visible on
  the right
- **768–900px** — tablet-ish, still desktop layout barely
- **≤900px** — mobile: blog grid collapses to 1 column, sidebar drops
  below posts, nav becomes a hamburger toggle
- **375px (iPhone SE-ish)** — narrow mobile, everything single-column,
  no horizontal scroll

Chrome DevTools device mode (`Cmd + Shift + M`) is enough for a first pass.
Test the hamburger menu opens and closes, nav links work when tapped.

**Quick horizontal-overflow check** — the #1 mobile bug source:

```js
// Paste in browser console at 375px viewport
document.documentElement.scrollWidth > window.innerWidth
// Should be `false` on every page
```

---

## Production smoke test after deploy

Every push to `main` triggers an Actions run. Wait for the green check
(~90 seconds), then:

**Immediate checks (~2 min):**

1. **Actions ran cleanly** — https://github.com/adrianwongstudio/legacy-financial-planning-test/actions
   → most recent run → green check. No red X on the "build" or "deploy" jobs.
2. **`https://legacyfinancialplanning.ca/`** loads over HTTPS, page is
   styled (not raw unstyled HTML — the classic "cache serving old 404 for
   CSS" symptom).
3. **`https://legacyfinancialplanning.ca/blog/`** — sidebar visible, all
   posts listed, category counts correct.
4. **`https://legacyfinancialplanning.ca/blog/<a-real-post-slug>/`** — the
   post loads with layout intact.
5. **`https://legacyfinancialplanning.ca/definitely-not-a-page`** — styled
   404 (not GitHub's generic default).

**Once per new build with a template change:**

6. Home page — every section renders. Screenshot and eyeball against the
   previous state if you did a layout change.
7. Contact form — submit a test message. Should redirect to
   `/contact/thanks/` and you should get an email at
   `info@legacyfinancialplanning.ca` within a minute.

**Once per new build touching admin/config.yml or the CMS:**

8. `https://legacyfinancialplanning.ca/admin/` — Login with GitHub works,
   sidebar shows all collections, opening a blog post loads its fields
   correctly.

**Browser cache traps** — if you see something old:

- **Hard reload** in the browser (`Cmd + Shift + R`)
- Or open in an **incognito window** — no cache, no service workers,
  definitive test of what the server is actually returning
- `curl -sI https://legacyfinancialplanning.ca/css/style.css` — check
  the `last-modified` header to confirm what's really on the CDN

---

## Regression checklist

Bugs we've hit before. If you touched adjacent code, re-verify these:

### Phone `tel:` link matches displayed number
- **What broke:** `tel:+17789070790` (old number) was hardcoded in 3 places
  while the visible number was updated via `site.phone`. Clicks dialed the
  wrong number.
- **How to verify:** On any page, hover the phone link, confirm the URL
  matches the number you see. `grep 'tel:' src/_includes/layout.njk src/contact.njk`
  — every match should use `{{ site.phone | replace(...) }}`, not a
  hardcoded number.

### `tags` frontmatter doesn't leak "posts"
- **What broke:** Eleventy uses `tags:` for collection membership. Adding
  user tags to a post used to make "posts" appear as a visible tag chip.
- **How to verify:** Add a temporary tag to a post, `npm run build`, check
  `_site/blog/index.html` — chips should only show your tag, not "posts".
  Also confirm `src/posts/posts.json` does NOT contain `"tags": ["posts"]`.

### `_site/` not accidentally committed
- **What broke:** `_site/` was tracked once. Made every commit huge and
  triggered spurious diffs.
- **How to verify:** `git ls-files _site/` should return nothing.
  `_site/` must be in `.gitignore`.

### `.nojekyll` present at repo root
- **What broke:** GitHub Pages ran Jekyll on `.njk` files → build failure.
- **How to verify:** `ls .nojekyll` at repo root (not just `src/.nojekyll`).
  Both should exist.

### Uploaded images resolve on the deployed site
- **What broke:** `src/images/` wasn't in `.eleventy.js` passthrough. CMS
  uploads showed up in git but 404'd in production.
- **How to verify:** `grep passthrough .eleventy.js` — should include
  `addPassthroughCopy("src/images")`. After uploading via CMS,
  `_site/images/<file>` should exist after build.

### HTTPS enforced on the domain
- **What broke:** `http://` requests to `/admin/` failed with
  `crypto.randomUUID is not a function`.
- **How to verify:** `curl -sI http://legacyfinancialplanning.ca/` — should
  return a `301` redirect to `https://`. GitHub Pages does this
  automatically when "Enforce HTTPS" is checked. If it's not, the setting
  isn't on.

### Hot-linked images aren't crept back in
- **What broke:** Someone (WordPress, an editor pasting HTML) could
  reintroduce absolute WP URLs that 404.
- **How to verify:** `grep -r "wp-content" src/` → should be empty.

### Pages source is "GitHub Actions", not "Deploy from a branch"
- **What broke:** Setting a custom domain in the UI can flip this back.
- **How to verify:** repo Settings → Pages → Source should say
  "GitHub Actions". If it says "Deploy from a branch", switch it back.
  Jekyll doesn't run either way thanks to `.nojekyll`, but the wrong
  workflow deploys nothing.

### CNAME file matches the domain
- **What broke:** GitHub UI wrote a CNAME at the repo root that conflicted
  with `src/CNAME`.
- **How to verify:** Only one CNAME file should exist — `src/CNAME`. If
  a root `CNAME` appears, delete it (GH UI likely re-added it; also check
  Settings → Pages → Custom domain).

---

## Debugging when something is wrong

**Symptom: Site looks unstyled**
- Almost always browser cache. Try incognito.
- `curl -sI https://<domain>/css/style.css` — expect 200 + `content-type: text/css`.
- Check DevTools Network tab for the CSS request — 404 means the path is
  wrong (subdirectory-prefix issue on project sites).

**Symptom: CMS shows "Error loading config"**
- YAML parse error. Validate with `node -e "require('js-yaml').load(require('fs').readFileSync('src/admin/config.yml','utf8'))"`.
- Or type/schema mismatch — a Decap-specific error message usually appears
  in the browser console.

**Symptom: CMS shows "Server not found: replace_me_..."**
- `base_url` in `src/admin/config.yml` is still a placeholder. Fill in the
  real Cloudflare Worker URL.

**Symptom: A blog post doesn't appear on `/blog/`**
- Check the post has a `date:` in the frontmatter. Missing date → excluded
  from `collections.posts`.
- Check the file is under `src/posts/*.md` (not a subdirectory).

**Symptom: A filter page 404s but the category/tag exists**
- The filter page is only generated when at least one post uses that
  category/tag. Empty categories from `src/_data/categories/` don't
  produce pages.

**Symptom: Actions build failed on GitHub but works locally**
- Node version mismatch — CI uses Node 22. `node -v` locally.
- Case-sensitivity — macOS is case-insensitive, Linux runners aren't.
  If a template says `include "Layout.njk"` but the file is `layout.njk`,
  it works on Mac and fails on Ubuntu.
- Missing dep — `npm ci` in CI is stricter than `npm install`. If it
  fails, check `package-lock.json` is committed and matches `package.json`.

**Symptom: Contact form submits but no email arrives**
- Formspree free tier caps at 50 submissions/month. Check the Formspree
  dashboard for a "limit exceeded" flag.
- Check spam folder.
- Formspree's first-ever submission to a new form goes to a "verify this
  email address" flow — click the link in the confirmation email.

---

## What could be automated

Not built. Listed here as a reasonable next step if the site gets more
active or another editor joins:

- **CI build check on PRs** — a lightweight `pull_request` trigger on the
  workflow that runs `npm ci && npm run build` (skipping `deploy`).
  Catches template/config errors before merge.
- **Link checker** — `npx linkinator _site/ --recurse` as a CI step to
  catch broken internal links (e.g. a deleted category still referenced
  by a post).
- **HTML validation** — `npx html-validate _site/**/*.html`. Cheap and
  catches structural issues.
- **Lighthouse budget** — `npx lighthouse https://<domain>/ --output json`
  with thresholds on Performance / Accessibility / SEO. Runs in CI on a
  schedule; alerts if scores regress.
- **Playwright smoke test** — one script that visits `/`, `/blog/`,
  `/contact/`, checks each has a `<h1>` and no console errors. Runs on
  deploy.
- **Formspree submission monitor** — send a scripted submission daily and
  confirm the email arrives (e.g. a Zapier flow that alerts if it
  doesn't).

Each of those adds 15-30 minutes of setup and pays off if the site
becomes something people can accidentally break. For a 1-editor
brochure site, the manual playbook above is enough.
