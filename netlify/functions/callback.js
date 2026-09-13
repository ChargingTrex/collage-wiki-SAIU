// netlify/functions/callback.js
//
// Serverless twin of oauth-proxy/server.js's `/callback` route. See
// auth.js's header comment for why this exists and what it's for.
//
// Protocol is Decap's own documented popup handshake
// (https://decapcms.org/docs/backends-overview/#custom-backend): GitHub
// redirects here with `?code=...` after the user approves the OAuth App;
// this exchanges that code for an access token, then returns a tiny HTML
// page that posts the token back to the window that opened the popup.

exports.handler = async (event) => {
  const {GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET, URL: siteUrl} = process.env;
  if (!GITHUB_CLIENT_ID || !GITHUB_CLIENT_SECRET) {
    return {
      statusCode: 500,
      body: 'Missing GITHUB_CLIENT_ID/GITHUB_CLIENT_SECRET env var — set both in Netlify site settings.',
    };
  }

  const code = event.queryStringParameters && event.queryStringParameters.code;
  if (!code) {
    return {statusCode: 400, body: 'Missing code'};
  }

  const baseUrl = siteUrl || `https://${event.headers.host}`;
  const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: {'Content-Type': 'application/json', Accept: 'application/json'},
    body: JSON.stringify({
      client_id: GITHUB_CLIENT_ID,
      client_secret: GITHUB_CLIENT_SECRET,
      code,
      redirect_uri: `${baseUrl}/.netlify/functions/callback`,
    }),
  });
  const {access_token: token, error} = await tokenRes.json();

  if (error || !token) {
    return {statusCode: 502, body: `GitHub token exchange failed: ${error || 'no token returned'}`};
  }

  const payload = JSON.stringify({token, provider: 'github'});

  // Decap's popup-handshake contract: the popup waits for the opener to
  // message it first (so it learns a trustworthy `origin` to reply to,
  // rather than broadcasting the access token to '*'), then sends the real
  // payload back to exactly that origin.
  return {
    statusCode: 200,
    headers: {'Content-Type': 'text/html'},
    body: `<script>
      (function() {
        function receiveMessage(e) {
          window.opener.postMessage('authorization:github:success:' + ${JSON.stringify(payload)}, e.origin);
          window.removeEventListener('message', receiveMessage, false);
        }
        window.addEventListener('message', receiveMessage, false);
        window.opener.postMessage('authorizing:github', '*');
      })();
    </script>`,
  };
};
