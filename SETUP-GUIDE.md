# Website Setup & Editing Guide

Your website in plain English: what's on it, how to log in, and how to
change anything without touching code. Written for the people who actually
use the site day-to-day, not developers.

If you're setting up the site from scratch (moving hosting, changing
domains, etc.), see [`CUSTOMIZATION.md`](./CUSTOMIZATION.md) or hand this
project to a technical helper.

---

## What you have

A three-page website:

- **Home** — hero banner, service highlights, about, team, call-to-action,
  latest blog posts. Every section can be reordered, added to, or removed.
- **Blog** — listing page + individual posts. Categories and tags let you
  organize posts; filter pages generate automatically at
  `/blog/category/<name>/` and `/blog/tag/<name>/`.
- **Contact** — working form (emails you), plus your phone/email/address
  and a Google map.

Plus a private **admin screen** at `yoursite.com/admin/` where your team
edits everything.

**Hosting is free** — the site runs on GitHub Pages, the contact form
uses Formspree's free tier, and the admin login uses your GitHub account.
No monthly bills.

---

## Part 1 — Logging in

1. Open `https://legacyfinancialplanning.ca/admin/` in your browser
2. Click **Login with GitHub**
3. If you're not already signed into GitHub, sign in with your GitHub
   account
4. First time only: click **Authorize** on the GitHub screen — this lets
   the CMS save your edits
5. You're in the editor

**Important**: use `https://` not `http://` — the login needs a secure
connection. If you go to `http://yoursite.com/admin/` you'll see a
`crypto.randomUUID` error. Just add the `s`.

**Only people with access to the GitHub repo can log in.** Random visitors
who click "Login with GitHub" can complete sign-in but won't be able to
save any changes — GitHub blocks them. To add another editor, see
[Part 8](#part-8--adding-another-editor).

---

## Part 2 — Adding a blog post

1. From the admin sidebar, click **Blog Posts**
2. Click **+ New Blog Post** (top right)
3. Fill in the fields:
   - **Title** — the post's headline
   - **Publish Date** — today, or whatever date should show on the post
   - **Category** — pick one from the dropdown. To add a new category
     first, see [Part 3](#part-3--managing-categories-and-tags).
   - **Tags** — pick any number, or none. Same "add new one first" flow
     as categories.
   - **Featured Image** — click, upload. Recommended: 1200×750 or larger
     for a sharp result. Shown at the top of the post and on the blog card.
   - **Image focus point** — pick which part of the image stays visible
     when it's cropped (top / center / bottom). "top" is safest for photos
     of people.
   - **Short Summary** — one or two sentences shown on the blog listing
     card
   - **Body** — the article itself. Formatting toolbar for headings,
     bold, links, lists, images
4. Click **Publish** (top right)
5. Wait ~1 minute — the site rebuilds automatically. Refresh the front
   end (`/blog/`) to see the post live.

**To edit a post**: Blog Posts → click it → change what you need →
Publish. Same 1-minute wait to see it live.

**To delete a post**: open it → **Delete Blog Post** button (bottom left).

---

## Part 3 — Managing categories and tags

**Categories** are broad groupings (Insurance, Investments, Estate
Planning, etc.). Each post has exactly one category.

**Tags** are specific keywords (home, savings, retirement, etc.). Each
post can have any number of tags, or none.

Both are lists you manage yourself — the dropdowns on the Blog Post form
pull from them.

**Adding a category:**

1. Admin sidebar → **Categories**
2. **+ New Category**
3. **Name** field — type it (e.g. "Retirement")
4. **Publish**

The new category is available in the Blog Post form's Category dropdown
the next time you open a post.

**Adding a tag** — same flow, in the **Tags** section.

**Renaming a category or tag** — open it in the Categories or Tags list,
change the Name, publish. But: existing posts still reference the OLD
name in their files, so you'd need to open each post using that category
and re-pick it from the dropdown. Easier to keep the name and just add
new ones for new concepts.

**Deleting a category or tag** — open it → **Delete**. Any post that
still references the deleted category will show a broken reference until
you edit the post and pick a different one.

---

## Part 4 — Editing the home page

The home page is built from **sections**, each of which you can add,
remove, or drag to reorder.

1. Admin sidebar → **Home Page → Home Page Content**
2. Under **Page Sections**, you'll see the current sections collapsed —
   e.g. "Hero Slider — Building Financial Futures…", "Services — What We
   Offer…". Click any to expand.
3. **To reorder**: drag the `═` handle at the top of a section to a new
   spot in the list
4. **To delete**: click the `✕` on a section (it's removed on save)
5. **To add**: click **Add Section** (top right of the list), pick a type
   from the dropdown

Section types available:

| Type | What it looks like |
|---|---|
| Hero Slider | Full-width rotating banner at the top, with an optional background image |
| Consultation Banner | Gold band with a short message + button |
| Feature Cards | 3 tiles with icons (like the "Timely Support / Personalized Planning" row) |
| Services | 3-column service list with icons |
| About / Why Choose Us | Two-column text + stat panel |
| Team Members | Grid of advisor cards (photo, name, role, bio) |
| Blog List | Latest 3 blog posts |
| Tile Grid | Generic 3-tile row (like Feature Cards but without icons) |
| Two-column | Text + optional image, side by side |
| CTA Band | Full-width call-to-action, navy/gold/plain background |
| Rich Text | Free-form paragraph (with formatting) |
| Service Cards | Like Services but without icons |
| Testimonial | Large italic quote with attribution |

**Publish** to save. Site rebuilds in ~1 minute.

**Tip**: sections you're building can be collapsed (click the arrow) so
the list stays manageable. Each section shows a summary of what it
contains when collapsed.

---

## Part 5 — Editing site info (phone, email, logo, etc.)

Admin sidebar → **Site Settings & Contact Info → Company & Contact Details**

Fields:
- Company Name, Tagline, Short Description (used in the footer)
- Phone, Primary Email, Secondary Email (leave blank if none)
- Address
- Logo (upload)

Any change here updates the site everywhere the value is used — header,
footer, contact page, etc. — automatically.

The phone number formatting is up to you (`+1 (778) 953 0228` works
fine); the code strips out the spaces and parens when creating the
clickable "call me" link, so both the display and the tap-to-call number
stay in sync.

---

## Part 6 — Uploading images

The CMS handles image uploads for you. Anywhere there's an "Image" field:

1. Click the field (or the current image thumbnail if there is one)
2. Either **Upload** a new file or **Choose from Media Library** to pick
   one you've already uploaded
3. The image lives at `/images/<name>` and is available across the site

Recommended sizes:
- **Logo**: at least 400×200 (or SVG for perfect scaling)
- **Team photos**: at least 600×600 (square or portrait)
- **Blog featured images**: at least 1200×750
- **Hero background images**: at least 1600×900 (wide landscape)

Very small images will look pixelated when scaled up. Bigger is better —
the site downsizes for display but can't upsize.

---

## Part 7 — Contact form

Already working. Every message submitted to `/contact/` is emailed to
`info@legacyfinancialplanning.ca` within a minute.

Submissions also appear in the Formspree dashboard at
[formspree.io](https://formspree.io) — log in with the same email address
to see the full history.

**Free tier**: 50 submissions per month. If you hit that, you'll be asked
to upgrade (~$10/month) or wait for the counter to reset next month.

**Not receiving emails?** Check your spam folder. Formspree's very first
message to a new destination email needs you to click a verification
link.

---

## Part 8 — Adding another editor

To let another team member edit the site:

1. They need a **GitHub account** (free — sign up at github.com)
2. Send their GitHub username to whoever owns the site's repo
3. Repo owner adds them: GitHub → the repo → **Settings** → **Collaborators**
   → **Add people** → type their username
4. They accept the invite (email + GitHub notification)
5. They visit `yoursite.com/admin/`, click **Login with GitHub**, authorize,
   and they're in

Their edits will show up in the git history under their own name, so you
can see who changed what.

---

## Part 9 — Publishing (what happens when you click Publish)

Under the hood, publishing a change writes to a file on GitHub, which
triggers an automatic rebuild of the site. The whole thing takes about
90 seconds:

- 0s — you click **Publish**
- 5s — the CMS saves your change to GitHub
- 10s — GitHub starts a build job
- 60s — build completes, publishes to the live site
- 90s — your change is visible when you refresh the front-end

**If a change doesn't appear after 90 seconds** — refresh with cache
bypassed (`Cmd + Shift + R` on Mac, `Ctrl + Shift + R` on Windows). Your
browser is probably showing an old cached version.

**If it still doesn't appear after that** — the build might have failed.
Check `https://github.com/adrianwongstudio/legacy-financial-planning-test/actions`
— if the most recent run has a red X, something in your change confused
the build. Contact your web helper with a link to that failed run.

---

## Part 10 — Common problems and fixes

**"crypto.randomUUID is not a function" when I try to log in**
→ You went to `http://` — need `https://`. Change the URL and reload.

**Login popup shows "Server not found"**
→ Talk to your web helper. The CMS's OAuth proxy might be down or
misconfigured. Not something you can fix on your side.

**My change doesn't show up**
→ Wait 90 seconds, then hard-reload (`Cmd + Shift + R`). If still nothing,
check the [Actions page](https://github.com/adrianwongstudio/legacy-financial-planning-test/actions)
for a failed build.

**Uploaded image doesn't appear in the post**
→ Make sure you actually clicked **Publish** on the post after inserting
the image. Uploading and inserting are separate steps.

**The site looks unstyled — like plain black text on white**
→ Browser cache. Open in a private/incognito window to confirm; if it
looks right there, hard-reload your main browser to clear the stale
cache.

**Category dropdown doesn't show my new category**
→ Reload the CMS admin page (`Cmd + R`). New categories don't always
appear in an already-open Blog Post form until you refresh.

**Delete button is missing on a section**
→ You're viewing the section in collapsed form. Click the arrow to
expand; the `✕` is at the top-right of the expanded section.

---

## Part 11 — For a technical helper (editing locally)

If someone needs to edit the code (styling, adding features, etc.):

```bash
git clone https://github.com/adrianwongstudio/legacy-financial-planning-test.git
cd legacy-financial-planning-test
npm install                # once
npm start                  # terminal 1 — dev server on http://localhost:8080
npm run cms                # terminal 2 — CMS proxy, no login needed locally
```

Then open `http://localhost:8080/admin/` — no login prompt, edits write
directly to the local files. Commit + push to deploy.

Full developer docs:
- [`README.md`](./README.md) — stack overview
- [`design.md`](./design.md) — architecture reference
- [`testing.md`](./testing.md) — verification playbook
- [`CUSTOMIZATION.md`](./CUSTOMIZATION.md) — customization guide

---

## Quick reference

| Thing | Where |
|---|---|
| Live site | https://legacyfinancialplanning.ca |
| CMS login | https://legacyfinancialplanning.ca/admin/ |
| Contact form dashboard | https://formspree.io (login as `info@legacyfinancialplanning.ca`) |
| Build status | https://github.com/adrianwongstudio/legacy-financial-planning-test/actions |
| Repo | https://github.com/adrianwongstudio/legacy-financial-planning-test |

**No monthly costs.** Free hosting (GitHub Pages), free CMS (Decap), free
form (Formspree free tier up to 50/month), free login (GitHub).

Questions? Ask your web helper.
