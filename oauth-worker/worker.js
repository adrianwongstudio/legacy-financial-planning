// Cloudflare Worker that acts as the OAuth token-exchange proxy for
// Decap CMS on GitHub Pages. Deploy this Worker, set OAUTH_CLIENT_ID and
// OAUTH_CLIENT_SECRET as secrets, and point src/admin/config.yml's
// backend.base_url at this Worker's URL.
//
// Flow:
//   1. Editor clicks "Login with GitHub" in the CMS.
//   2. CMS opens a popup to <worker>/auth, which redirects to GitHub OAuth.
//   3. GitHub redirects the popup to <worker>/callback with an auth code.
//   4. Callback exchanges the code (with the secret) for an access token.
//   5. Callback posts the token back to the opener window (the CMS).

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/auth") {
      const params = new URLSearchParams({
        client_id: env.OAUTH_CLIENT_ID,
        redirect_uri: `${url.origin}/callback`,
        scope: "repo,user",
        state: crypto.randomUUID(),
      });
      return Response.redirect(
        `https://github.com/login/oauth/authorize?${params}`,
        302
      );
    }

    if (url.pathname === "/callback") {
      const code = url.searchParams.get("code");
      if (!code) {
        return new Response("Missing code parameter", { status: 400 });
      }

      const tokenRes = await fetch(
        "https://github.com/login/oauth/access_token",
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            client_id: env.OAUTH_CLIENT_ID,
            client_secret: env.OAUTH_CLIENT_SECRET,
            code,
          }),
        }
      );

      const data = await tokenRes.json();

      if (data.error || !data.access_token) {
        return renderPage("error", data);
      }

      return renderPage("success", {
        token: data.access_token,
        provider: "github",
      });
    }

    return new Response("Decap OAuth proxy. Endpoints: /auth, /callback", {
      status: 200,
    });
  },
};

function renderPage(status, content) {
  const message = `authorization:github:${status}:${JSON.stringify(content)}`;

  return new Response(
    `<!doctype html>
<html>
<body>
<script>
  (function () {
    function receiveMessage(e) {
      window.opener.postMessage(
        ${JSON.stringify(message)},
        e.origin
      );
      window.removeEventListener("message", receiveMessage, false);
    }
    window.addEventListener("message", receiveMessage, false);
    window.opener.postMessage("authorizing:github", "*");
  })();
</script>
</body>
</html>`,
    { headers: { "content-type": "text/html" } }
  );
}
