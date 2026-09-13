// netlify/functions/auth.js
//
// Serverless twin of oauth-proxy/server.js's `/auth` route, deployed
// alongside the Netlify *test* site so Decap CMS's real GitHub OAuth login
// can actually be exercised on this domain without the Hostinger VPS (or
// any separately-hosted process) needing to exist yet — see
// vps-hosting-plan.md's "Netlify test deploy" section. Production still
// moves to the standalone oauth-proxy/ service once the VPS is reachable;
// this function exists only to make Netlify testing self-contained in the
// meantime, and mirrors that service's logic exactly so nothing behaves
// differently between the two.
//
// Needs GITHUB_CLIENT_ID (+ GITHUB_CLIENT_SECRET, used by callback.js) set
// as Netlify environment variables (Site configuration -> Environment
// variables), from a GitHub OAuth App whose Authorization callback URL is
// exactly `<this site's URL>/.netlify/functions/callback`.

const crypto = require('node:crypto');

exports.handler = async (event) => {
  const {GITHUB_CLIENT_ID, URL: siteUrl} = process.env;
  if (!GITHUB_CLIENT_ID) {
    return {statusCode: 500, body: 'Missing GITHUB_CLIENT_ID env var — set it in Netlify site settings.'};
  }

  // `URL` is Netlify's own build/runtime env var for the site's real
  // origin; falling back to the request's own Host header covers deploy
  // previews or any context where it's unset.
  const baseUrl = siteUrl || `https://${event.headers.host}`;

  // GitHub requires `state` to be present but Decap's popup flow doesn't
  // check it back against anything itself, so a fresh random value per
  // request (CSRF hygiene on GitHub's side) is all this needs to do.
  const state = crypto.randomBytes(16).toString('hex');
  const params = new URLSearchParams({
    client_id: GITHUB_CLIENT_ID,
    redirect_uri: `${baseUrl}/.netlify/functions/callback`,
    scope: 'repo,user',
    state,
  });

  return {
    statusCode: 302,
    headers: {Location: `https://github.com/login/oauth/authorize?${params}`},
    body: '',
  };
};
