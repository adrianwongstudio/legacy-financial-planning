# Legacy Financial Planning — Website

Website for one of World Financial Groups team. Legacy Financial Planning

A small static website (Eleventy) with the Decap CMS editor, deployable free on Netlify.
Three pages — Home, Blog, Contact — editable by non-technical staff at `/admin/`.

**Full setup & editing instructions:** see [SETUP-GUIDE.md](./SETUP-GUIDE.md).

## Quick start (local)

```bash
npm install
npm start        # preview at http://localhost:8080
npm run build    # outputs the finished site to _site/
```

## Deploy

Push this repo to GitHub, then import it into Netlify. Netlify reads `netlify.toml`
automatically (build: `npm run build`, publish: `_site`). See the setup guide for domain,
editor login, and contact-form email steps.
