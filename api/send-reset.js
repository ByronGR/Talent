// POST /api/send-reset
// Sends a branded HTML password-reset email to a candidate, using a reset
// link generated via the Firebase Admin SDK (generatePasswordResetLink) and
// Admin's shared /api/send-email branded-email service (candidate_password_reset
// template). Replaces Firebase Auth's default sendPasswordResetEmail, which
// renders as a raw, unbranded link for this project.
//
// Public + unauthenticated by nature (forgot-password), so it must never
// reveal whether an account exists. Body: { email, continueUrl? } — continueUrl
// is the caller's own /reset-password page; allowlisted to *.nearwork.co.

import { adminAuth } from './_lib/firebase-admin.js';

const DEFAULT_RESET_PAGE = 'https://talent.nearwork.co/reset-password';

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

  const continueUrl = req.body?.continueUrl;
  const resetPage = continueUrl && isAllowedResetPage(continueUrl) ? continueUrl : DEFAULT_RESET_PAGE;

  let resetLink = null;
  let firstName = 'there';
  try {
    const auth = adminAuth();
    const fbLink = await auth.generatePasswordResetLink(email);
    const oobCode = new URL(fbLink).searchParams.get('oobCode');
    if (oobCode) {
      resetLink = `${resetPage}?oobCode=${encodeURIComponent(oobCode)}&email=${encodeURIComponent(email)}`;
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
      // Don't reveal that the account doesn't exist.
      return res.status(200).json({ ok: true });
    }
    return res.status(503).json({ ok: false, error: 'Password reset is not available right now. Please try again later.' });
  }

  if (!resetLink) {
    return res.status(200).json({ ok: true });
  }

  try {
    const emailApiUrl = process.env.EMAIL_API_URL || 'https://admin.nearwork.co/api/send-email';
    const response = await fetch(emailApiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: email,
        templateId: 'candidate_password_reset',
        data: { firstName, resetLink }
      })
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
