# Decap CMS OAuth proxy (Cloudflare Worker)

This tiny Worker (~90 lines) sits between the CMS in the browser and GitHub's
OAuth endpoints. It lets editors log into `/admin/` with their GitHub account
without exposing your OAuth Client Secret to the browser.

Deploy it once and forget about it — no maintenance.

## What you need before deploying

1. **A free Cloudflare account** — sign up at https://cloudflare.com
2. **A GitHub OAuth App** (Client ID + Client Secret) — see
   `../MIGRATION.md` step 1.

Node.js is already required by the parent project, so nothing else to install.

## Deploy

From this `oauth-worker/` folder:

```bash
npm install                    # installs wrangler locally into oauth-worker/node_modules
npm run login                  # opens browser to authorize Wrangler with Cloudflare
npm run secret:client-id       # paste your GitHub OAuth Client ID
npm run secret:client-secret   # paste your GitHub OAuth Client Secret
npm run deploy
```

(All npm scripts wrap `wrangler` so you don't need it installed globally.)

Deploy prints a URL like `https://decap-oauth-proxy.your-account.workers.dev`.
That's your `base_url` — put it into two places:

1. **GitHub OAuth App** (the one you created in `../MIGRATION.md` step 1):
   update the callback URL to `https://<that-url>/callback`.
2. **`src/admin/config.yml`**: replace `REPLACE_ME_WORKER_URL.workers.dev`
   with your Worker's hostname (without the `https://`).

## Test it

Open `https://<your-worker>/auth` in a browser. You should get redirected to
GitHub's authorize page for your OAuth App. Cancel it — that's enough to
prove the Worker is wired up.

## How it works

- `GET /auth` — redirects the browser to `github.com/login/oauth/authorize`
  with your Client ID and the `/callback` URL.
- `GET /callback` — GitHub sends the browser here with a temporary `code`.
  The Worker POSTs `{ code, client_id, client_secret }` to GitHub, receives
  an access token, and returns a tiny HTML page that `postMessage`s the token
  back to the opener window (the CMS).

The Client Secret lives only in Cloudflare's encrypted secret store and in
the `github.com/login/oauth/access_token` exchange. It never touches your
Pages site or a browser.

## Cost

Cloudflare Workers free tier: 100,000 requests/day. CMS login is a couple
requests per editor session, so you'll be nowhere near the limit.
