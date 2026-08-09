// GET /api/linkedin/start
// Kicks off "Sign in with LinkedIn using OpenID Connect".
//
// Everything the candidate is in the middle of — which opening they came to
// apply for, whether they were signing up or signing in — has to survive a
// full round-trip through linkedin.com. Anything held in the page is gone by
// the time they come back, so it travels in the OAuth `state` instead.
//
// `state` is also the CSRF defence, so it can't just be the opening code: it
// carries a random nonce that we set as an httpOnly cookie and compare on the
// way back. A callback whose state doesn't match the cookie is a forged one.

import crypto from 'node:crypto';

const AUTHORIZE = 'https://www.linkedin.com/oauth/v2/authorization';

export const STATE_COOKIE = 'nw_li_state';

/** The exact redirect registered in the LinkedIn app — must match to the character. */
export function redirectUri(req) {
  const host = req.headers['x-forwarded-host'] || req.headers.host || 'talent.nearwork.co';
  const proto = host.startsWith('localhost') ? 'http' : 'https';
  return `${proto}://${host}/api/linkedin/callback`;
}

export default async function handler(req, res) {
  const clientId = process.env.LINKEDIN_CLIENT_ID;
  if (!clientId) {
    // Fail loudly and in plain language — a misconfigured env var here would
    // otherwise surface as an opaque error on LinkedIn's own domain.
    return res.status(500).send('LinkedIn sign-in is not configured (LINKEDIN_CLIENT_ID missing).');
  }

  const url = new URL(req.url, 'https://x');
  const nonce = crypto.randomBytes(16).toString('hex');

  // What to restore when they come back.
  const ctx = {
    n: nonce,
    // The opening they were applying to, if they arrived from a job post.
    o: (url.searchParams.get('opening') || url.searchParams.get('code') || '').slice(0, 64),
    // Where to send them afterwards, relative only — an absolute URL here would
    // turn this endpoint into an open redirect.
    r: (url.searchParams.get('next') || '').startsWith('/') ? url.searchParams.get('next').slice(0, 200) : '',
  };
  const state = Buffer.from(JSON.stringify(ctx)).toString('base64url');

  res.setHeader('Set-Cookie', [
    `${STATE_COOKIE}=${nonce}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=600`,
  ]);

  const auth = new URL(AUTHORIZE);
  auth.searchParams.set('response_type', 'code');
  auth.searchParams.set('client_id', clientId);
  auth.searchParams.set('redirect_uri', redirectUri(req));
  auth.searchParams.set('state', state);
  auth.searchParams.set('scope', 'openid profile email');

  res.writeHead(302, { Location: auth.toString() });
  res.end();
}
