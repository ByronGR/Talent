// POST /api/send-reset
// Sends a branded HTML password-reset email to a candidate. Generates a
// Firebase reset link, wraps the oobCode in a short-lived Firestore token
// (30-minute expiry, one-time use), and embeds the opaque tokenId in the
// email link instead of the raw oobCode.
//
// Rate limited: 3 requests per email address per 15 minutes.
//
// Public + unauthenticated by nature (forgot-password), so it must never
// reveal whether an account exists. Body: { email, continueUrl? }

import { adminAuth, adminDb } from './_lib/firebase-admin.js';
import { checkRateLimit } from './_lib/rate-limit.js';
import { randomBytes } from 'crypto';

const DEFAULT_RESET_PAGE = 'https://talent.nearwork.co/reset-password';
const TOKEN_TTL_MS = 30 * 60 * 1000; // 30 minutes

function isAllowedResetPage(url) {
  try {
    const u = new URL(url);
    return u.protocol === 'https:' && (u.hostname === 'nearwork.co' || u.hostname.endsWith('.nearwork.co'));
  } catch {
    return false;
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  const email = String(req.body?.email || '').trim().toLowerCase();
  if (!email) {
    return res.status(400).json({ ok: false, error: 'Email is required' });
  }

  // Rate limit: 3 reset attempts per email per 15 minutes
  try {
    const rl = await checkRateLimit({
      key: `send-reset:${email}`,
      limit: 3,
      windowMs: 15 * 60 * 1000,
    });
    if (!rl.allowed) {
      const wait = Math.ceil(rl.retryAfter / 60);
      return res.status(429).json({
        ok: false,
        error: `Too many reset requests. Please wait ${wait} minute${wait === 1 ? '' : 's'} before trying again.`,
      });
    }
  } catch {
    // Rate-limit failure is non-fatal; proceed to avoid locking out legitimate users
  }

  const continueUrl = req.body?.continueUrl;
  const resetPage = continueUrl && isAllowedResetPage(continueUrl) ? continueUrl : DEFAULT_RESET_PAGE;

  let tokenId = null;
  let firstName = 'there';
  try {
    const auth = adminAuth();
    const fbLink = await auth.generatePasswordResetLink(email);
    const oobCode = new URL(fbLink).searchParams.get('oobCode');

    if (oobCode) {
      // Store an opaque token in Firestore — never put the raw oobCode in the URL
      tokenId = randomBytes(32).toString('hex');
      await adminDb().collection('passwordResetTokens').doc(tokenId).set({
        oobCode,
        email,
        expiresAt: Date.now() + TOKEN_TTL_MS,
        createdAt: Date.now(),
      });
    }

    try {
      const user = await auth.getUserByEmail(email);
      const display = user.displayName?.trim();
      if (display) firstName = display.split(/\s+/)[0];
    } catch {
      // no display name — keep fallback
    }
  } catch (error) {
    if (error?.code === 'auth/user-not-found') {
      return res.status(200).json({ ok: true });
    }
    return res.status(503).json({ ok: false, error: 'Password reset is not available right now. Please try again later.' });
  }

  if (!tokenId) {
    return res.status(200).json({ ok: true });
  }

  const resetLink = `${resetPage}?token=${tokenId}&email=${encodeURIComponent(email)}`;

  try {
    const emailApiUrl = process.env.EMAIL_API_URL || 'https://admin.nearwork.co/api/send-email';
    const emailSecret = process.env.INTERNAL_EMAIL_SECRET || '';
    const response = await fetch(emailApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(emailSecret ? { 'X-Internal-Secret': emailSecret } : {}),
      },
      body: JSON.stringify({
        to: email,
        templateId: 'candidate_password_reset',
        data: { firstName, resetLink },
      }),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      return res.status(502).json({ ok: false, error: err?.error || 'Could not send the reset email' });
    }
    return res.status(200).json({ ok: true });
  } catch {
    return res.status(502).json({ ok: false, error: 'Failed to reach the email service' });
  }
}
