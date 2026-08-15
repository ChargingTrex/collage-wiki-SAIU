// Decap CMS's `github` backend needs somewhere to run the OAuth handshake —
// GitHub doesn't let a purely client-side app hold a client secret. This is
// that somewhere: deploy it once, point ../static/admin/config.yml's
// `backend.base_url` at wherever it ends up running. See
// ../docs-internal/decap-cms-auth-todo.md and ../vps-hosting-plan.md for
// the decision this implements and the intended deploy target (a small
// always-on process on the VPS, behind the same reverse proxy as the site).
//
// Protocol is Decap's own documented popup handshake
// (https://decapcms.org/docs/backends-overview/#custom-backend), the same
// contract the original netlify-cms-oauth-provider used:
//   1. The CMS opens a popup at GET /auth — redirects to GitHub's OAuth
//      authorize page.
//   2. GitHub redirects back to GET /callback?code=... — this exchanges
//      the code for an access token, then returns a tiny HTML page that
//      posts the token back to the window that opened the popup.

import express from 'express';
import crypto from 'node:crypto';

const {
  GITHUB_CLIENT_ID,
  GITHUB_CLIENT_SECRET,
  OAUTH_PROXY_BASE_URL,
  PORT = 8081,
} = process.env;

for (const name of ['GITHUB_CLIENT_ID', 'GITHUB_CLIENT_SECRET', 'OAUTH_PROXY_BASE_URL']) {
  if (!process.env[name]) {
    throw new Error(`Missing required env var ${name} — see oauth-proxy/README.md`);
  }
}

const app = express();

app.get('/auth', (req, res) => {
  // GitHub requires `state` to be present but decap-cms's popup flow
  // doesn't check it back against anything itself, so a fresh random value
  // per request (CSRF hygiene on the GitHub side) is all this needs to do.
  const state = crypto.randomBytes(16).toString('hex');
  const params = new URLSearchParams({
    client_id: GITHUB_CLIENT_ID,
    redirect_uri: `${OAUTH_PROXY_BASE_URL}/callback`,
    scope: 'repo,user',
    state,
  });
  res.redirect(`https://github.com/login/oauth/authorize?${params}`);
});

app.get('/callback', async (req, res) => {
  const {code} = req.query;
  if (!code) {
    res.status(400).send('Missing code');
    return;
  }

  const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: {'Content-Type': 'application/json', Accept: 'application/json'},
    body: JSON.stringify({
      client_id: GITHUB_CLIENT_ID,
      client_secret: GITHUB_CLIENT_SECRET,
      code,
      redirect_uri: `${OAUTH_PROXY_BASE_URL}/callback`,
    }),
  });
  const {access_token: token, error} = await tokenRes.json();

  if (error || !token) {
    res.status(502).send(`GitHub token exchange failed: ${error || 'no token returned'}`);
    return;
  }

  const payload = JSON.stringify({token, provider: 'github'});

  // Decap's popup-handshake contract: the popup waits for the opener to
  // message it first (so it learns a trustworthy `origin` to reply to,
  // rather than broadcasting the access token to '*'), then sends the real
  // payload back to exactly that origin.
  res.send(`<script>
    (function() {
      function receiveMessage(e) {
        window.opener.postMessage('authorization:github:success:' + ${JSON.stringify(payload)}, e.origin);
        window.removeEventListener('message', receiveMessage, false);
      }
      window.addEventListener('message', receiveMessage, false);
      window.opener.postMessage('authorizing:github', '*');
    })();
  </script>`);
});

app.listen(PORT, () => {
  console.log(`OAuth proxy listening on :${PORT}`);
});
