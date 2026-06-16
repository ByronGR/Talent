// POST /api/confirm-reset
// Validates a 30-minute password reset token (stored in Firestore when the
// reset email was sent) and confirms the password change via the Firebase
// Auth REST API. The oobCode is never exposed in the URL — only the opaque
// tokenId issued at send time reaches the client.

import { adminDb } from './_lib/firebase-admin.js';

// The web API key is intentionally public (same value is shipped in firebase-config.js
// and used by the client SDK). Used here only to call Firebase's REST endpoint.
const FIREBASE_API_KEY = process.env.FIREBASE_API_KEY || 'AIzaSyApRNyW8PoP28E0x77dUB5jOgHuTqA2by4';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  const token = String(req.body?.token || '').trim();
  const newPassword = String(req.body?.newPassword || '');

  if (!token) {
    return res.status(400).json({ ok: false, error: 'Reset token is required.' });
  }
  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ ok: false, error: 'Password must be at least 6 characters.' });
  }

  const db = adminDb();
  const tokenRef = db.collection('passwordResetTokens').doc(token);

  let oobCode;
  try {
    const snap = await tokenRef.get();
    if (!snap.exists) {
      return res.status(400).json({
        ok: false,
        error: 'This link is invalid or has already been used. Please request a new one.',
      });
    }
    const data = snap.data();
    if (Date.now() > data.expiresAt) {
      return res.status(400).json({
        ok: false,
        error: 'This link has expired (links are valid for 30 minutes). Please request a new one.',
      });
    }
    oobCode = data.oobCode;
  } catch {
    return res.status(500).json({ ok: false, error: 'Something went wrong. Please try again.' });
  }

  // Confirm via Firebase Auth REST API (Firebase Admin SDK has no confirmPasswordReset)
  try {
    const fbRes = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:resetPassword?key=${FIREBASE_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ oobCode, newPassword }),
      }
    );
    const fbData = await fbRes.json().catch(() => ({}));

    if (!fbRes.ok) {
      const fbError = fbData?.error?.message || '';
      if (fbError === 'EXPIRED_OOB_CODE') {
        return res.status(400).json({ ok: false, error: 'This link has expired. Please request a new one.' });
      }
      if (fbError === 'INVALID_OOB_CODE') {
        return res.status(400).json({ ok: false, error: 'This link is invalid or has already been used.' });
      }
      if (fbError.startsWith('WEAK_PASSWORD')) {
        return res.status(400).json({ ok: false, error: 'Password must be at least 6 characters.' });
      }
      return res.status(400).json({ ok: false, error: 'Could not update password. Please try again.' });
    }

    // Delete the token after a successful reset (fire-and-forget)
    tokenRef.delete().catch(() => {});
    return res.status(200).json({ ok: true });
  } catch {
    return res.status(502).json({ ok: false, error: 'Could not reach the authentication service. Please try again.' });
  }
}
