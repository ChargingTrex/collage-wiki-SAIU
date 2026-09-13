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
  //
  // The `window.opener` guard below is defensive, not part of that
  // contract: this page only makes sense opened as a popup from Decap's
  // own "Login with GitHub" button. If it's reached any other way — a
  // browser popup blocker silently preventing the popup (some fall back to
  // a same-tab redirect instead of just failing), a bookmarked/shared link
  // to this URL, back/forward navigation replaying it — `window.opener` is
  // `null` and calling `.postMessage` on it throws immediately, which
  // otherwise leaves the visitor looking at a blank white page with no
  // indication of what went wrong (confirmed against the Netlify Functions
  // twin of this route — see netlify/functions/callback.js). A real token
  // was still successfully exchanged above in that case; there's just
  // nowhere to deliver it, so say so instead of failing silently.
  res.send(`<!DOCTYPE html>
<html><body style="font: 14px system-ui, sans-serif; padding: 2rem; max-width: 32rem; margin: 0 auto;">
    <div id="no-opener-message" style="display: none;">
      <p><strong>GitHub authorized this login, but this page isn't running as a
      popup</strong>, so there's no CMS window to hand the result back to.</p>
      <p>This usually means the browser blocked the popup, or this URL was
      opened directly instead of via the CMS's "Login with GitHub" button.
      Close this tab, allow popups for this site if prompted, and click
      "Login with GitHub" again from <a href="/admin/">/admin</a>.</p>
    </div>
    <script>
      if (!window.opener) {
        document.getElementById('no-opener-message').style.display = 'block';
      } else {
        (function() {
          // Real-world finding: a live login got exactly this far — token
          // exchanged, opener present, "authorizing:github" ping sent — and
          // then stalled forever with a valid token never delivered, because
          // the opener never echoed the ping back (confirmed against the
          // Netlify Functions twin of this route — see
          // netlify/functions/callback.js — /admin's own UI never updated).
          // Rather than wait indefinitely for a reply that isn't guaranteed,
          // broadcast the real result on a short timeout if nothing replies
          // first. \`done\` guards against sending twice if a genuine (if
          // slow — e.g. a backgrounded /admin tab gets its JS throttled)
          // reply arrives right around the same time as the fallback fires.
          var done = false;
          function complete(targetOrigin) {
            if (done) return;
            done = true;
            window.opener.postMessage('authorization:github:success:' + ${JSON.stringify(payload)}, targetOrigin);
          }
          function receiveMessage(e) {
            window.removeEventListener('message', receiveMessage, false);
            complete(e.origin);
          }
          window.addEventListener('message', receiveMessage, false);
          window.opener.postMessage('authorizing:github', '*');
          setTimeout(function() { complete('*'); }, 1500);
        })();
      }
    </script>
</body></html>`);
});

app.listen(PORT, () => {
  console.log(`OAuth proxy listening on :${PORT}`);
});
