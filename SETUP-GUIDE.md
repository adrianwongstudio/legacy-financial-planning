# Legacy Financial Planning — Website Setup & Editing Guide

This is your new website: three pages (Home, Blog, Contact), free hosting on Netlify,
and a simple admin screen your team uses to edit everything — no code required.

It's built as a small static site (using a tool called Eleventy) with the **Decap CMS**
editor wired in. You don't need to understand any of that to run it — just follow the
steps below.

---

## What you have

- **Home page** — matches your old site's layout: hero banner, three highlights, services,
  about, team, call-to-action, and latest blog posts.
- **Blog** — a listing page plus three starter articles you can edit or delete.
- **Contact page** — a working form that emails you, plus your phone/email/address and a map.
- **Editor** — at `yoursite.com/admin/`, your team logs in and edits text, photos, team
  bios, contact details, and blog posts through a friendly screen.

Everything is free. No ads.

---

## Part 1 — Put the site online (one-time, ~15 minutes)

You'll need a free **GitHub** account and a free **Netlify** account.

### Step 1: Put the files on GitHub
1. Create a free account at https://github.com and click **New repository**.
   Name it something like `legacy-financial-planning`. Leave it Public or Private — either works.
2. Upload this entire folder to the repository (GitHub lets you drag-and-drop files in the
   browser: **Add file → Upload files**). Make sure `package.json`, `netlify.toml`, and the
   `src` folder are all included.

### Step 2: Connect Netlify
1. Create a free account at https://netlify.com (choose "Sign up with GitHub").
2. Click **Add new site → Import an existing project → GitHub**, and pick your repository.
3. Netlify reads the included `netlify.toml` automatically, so the settings should already say:
   - **Build command:** `npm run build`
   - **Publish directory:** `_site`
   Click **Deploy**. In about a minute your site is live at a temporary address like
   `random-name-1234.netlify.app`.

### Step 3: Use your own domain (legacyfinancialplanning.ca)
1. In Netlify: **Domain settings → Add a domain** → type `legacyfinancialplanning.ca`.
2. Netlify shows you the DNS records to set. Log in wherever your domain is registered
   (your domain registrar) and point it to Netlify by either:
   - changing the nameservers to Netlify's, **or**
   - adding the DNS records Netlify lists.
3. Netlify turns on HTTPS (the padlock) automatically once DNS is verified — usually within
   an hour.

> Tip: If you're not ready to move the domain yet, you can rename the free `.netlify.app`
> address under **Site configuration → Change site name** and use that in the meantime.

---

## Part 2 — Turn on the editor (one-time, ~5 minutes)

This lets your team log in at `yoursite.com/admin/` and edit content.

1. In Netlify, open your site → **Integrations / Identity** and click **Enable Identity**.
2. Under **Identity → Registration**, set it to **Invite only** (so only your team can log in).
3. Under **Identity → Services → Git Gateway**, click **Enable Git Gateway**.
4. Go to **Identity → Invite users** and invite your team's email addresses. Each person
   gets an email, sets a password, and can then log in at `yoursite.com/admin/`.

That's it. The editor is now live.

> **If your Netlify account doesn't offer "Identity"** (Netlify is gradually retiring it):
> open `src/admin/config.yml` and swap the `backend:` block for the **GitHub backend**
> example at the bottom of that file (fill in your repo name). Editors then log in with a
> GitHub account instead of an email invite. A modern, actively-maintained drop-in
> alternative is **Sveltia CMS** — same config file, just a different script line in
> `src/admin/index.html`. Ask your web helper if you go this route.

---

## Part 3 — Make the contact form email you

The form already works and saves every submission in Netlify. To also get an email:

1. In Netlify: **Site configuration → Forms → Form notifications → Add notification →
   Email notification**.
2. Enter **info@legacyfinancialplanning.ca** as the recipient. Save.

Now every form submission is emailed to you and stored in Netlify's dashboard.

---

## Part 4 — How your team edits the site (day-to-day)

1. Go to **yoursite.com/admin/** and log in.
2. You'll see three sections:
   - **Blog Posts** — add, edit, or delete articles. Click **New Blog Post**, fill in the
     title, date, category, an optional photo, a short summary, and the body. Click
     **Publish**.
   - **Home Page** — edit every part of the home page: the rotating hero banners, the three
     highlights, services, the about text, team members (name, role, photo, bio), and the
     call-to-action.
   - **Site Settings & Contact Info** — phone, email, address, and logo. These update
     everywhere on the site at once.
3. Click **Publish** after any change. The site rebuilds and updates automatically in about
   a minute. Refresh the page to see it live.

No changes ever touch the design — the layout stays exactly as built.

---

## Replacing the images with your own (recommended)

To keep the site fully independent, replace the photos currently pulled from your old site:

- **Logo & team photos:** In the editor, open **Site Settings** (for the logo) or **Home
  Page → Team Members** (for advisor photos), click the image field, and upload your own file.
- **Blog images:** Open each post and upload a featured image.

Until you do, the site borrows those images from your existing site so it looks complete
from day one.

---

## Editing on your own computer (optional, for a web helper)

If someone technical wants to preview changes locally:

```bash
npm install      # once
npm start        # then open http://localhost:8080
```

Run `npm run build` to produce the finished site in the `_site` folder.

---

## Quick reference

| Thing | Where |
|---|---|
| Live site | your domain, once DNS is pointed |
| Editor login | yoursite.com/admin/ |
| Contact form submissions | Netlify dashboard → Forms |
| Home page content | src/_data/home.json (or edit via the admin) |
| Company / contact details | src/_data/site.json (or edit via the admin) |
| Blog posts | src/posts/ (or edit via the admin) |
| Design / styling | src/css/style.css |
| Colours | top of src/css/style.css (`--navy`, `--gold`) |

Questions or changes down the road — like adding an About or Services page — can be dropped
straight into this same structure.
