// POST /api/auth-handoff
// Called by jobs.nearwork.co after a candidate applies.
// Verifies the candidate's Firebase ID token and returns a short-lived custom
// token for the same UID so talent.nearwork.co can sign them in automatically.

import { adminAuth } from './_lib/firebase-admin.js';

const ALLOWED_ORIGINS = ['https://jobs.nearwork.co', 'https://talent.nearwork.co'];

export default async function handler(req, res) {
  const origin = req.headers.origin || '';
  const corsOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  res.setHeader('Access-Control-Allow-Origin', corsOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
  res.setHeader('Vary', 'Origin');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const authHeader = String(req.headers.authorization || '');
  if (!authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing bearer token' });
  }

  const idToken = authHeader.slice(7);
  try {
    const { uid } = await adminAuth().verifyIdToken(idToken);
    const customToken = await adminAuth().createCustomToken(uid);
    return res.status(200).json({ customToken });
  } catch (e) {
    return res.status(401).json({ error: e.message || 'Invalid token' });
  }
}
