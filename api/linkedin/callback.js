// GET /api/linkedin/callback
// Where LinkedIn returns after the candidate approves.
//
// Exchanges the code for their profile, finds or creates their Firebase user,
// and hands the browser a short-lived custom token so talent.nearwork.co can
// sign them in — the same mechanism /api/auth-handoff already uses.
//
// The opening they came to apply for is restored from `state` and passed
// through to onboarding, so a candidate who started on a job post finishes
// attached to that role rather than floating loose.

import crypto from 'node:crypto';
import { adminAuth, adminBucket, adminDb } from '../_lib/firebase-admin.js';
import { STATE_COOKIE, redirectUri } from './start.js';

const TOKEN_URL = 'https://www.linkedin.com/oauth/v2/accessToken';
const USERINFO = 'https://api.linkedin.com/v2/userinfo';

function readCookie(req, name) {
  const raw = req.headers.cookie || '';
  for (const part of raw.split(';')) {
    const [k, ...v] = part.trim().split('=');
    if (k === name) return v.join('=');
  }
  return '';
}

/** Send them back to Talent with a message rather than leaving them on a blank page. */
function bail(res, message) {
  const to = `/?li_error=${encodeURIComponent(message)}`;
  res.setHeader('Set-Cookie', `${STATE_COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`);
  res.writeHead(302, { Location: to });
  res.end();
}

export default async function handler(req, res) {
  const clientId = process.env.LINKEDIN_CLIENT_ID;
  const clientSecret = process.env.LINKEDIN_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return bail(res, 'LinkedIn sign-in is not configured.');
  }

  const url = new URL(req.url, 'https://x');
  const code = url.searchParams.get('code');
  const rawState = url.searchParams.get('state') || '';

  // The candidate pressed Cancel on LinkedIn's screen. Not an error worth
  // shouting about — put them back where they were.
  if (url.searchParams.get('error')) {
    return bail(res, 'LinkedIn sign-in was cancelled.');
  }
  if (!code) return bail(res, 'LinkedIn did not return a sign-in code.');

  // ── CSRF: state must match the cookie we set at the start ──
  let ctx = { n: '', o: '', r: '' };
  try { ctx = JSON.parse(Buffer.from(rawState, 'base64url').toString()); } catch { /* handled below */ }
  const cookieNonce = readCookie(req, STATE_COOKIE);
  if (!ctx.n || !cookieNonce || ctx.n !== cookieNonce) {
    return bail(res, 'Sign-in link expired — please try again.');
  }

  try {
    // ── Code → access token ──
    const tokenRes = await fetch(TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri(req),
      }),
    });
    const token = await tokenRes.json();
    if (!tokenRes.ok || !token.access_token) {
      console.error('[linkedin] token exchange failed:', token);
      return bail(res, 'Could not complete LinkedIn sign-in.');
    }

    // ── Access token → profile ──
    const infoRes = await fetch(USERINFO, { headers: { Authorization: `Bearer ${token.access_token}` } });
    const info = await infoRes.json();
    if (!infoRes.ok || !info.sub) {
      console.error('[linkedin] userinfo failed:', info);
      return bail(res, 'Could not read your LinkedIn profile.');
    }

    const email = String(info.email || '').toLowerCase().trim();
    const emailVerified = info.email_verified === true || info.email_verified === 'true';
    const name = String(info.name || [info.given_name, info.family_name].filter(Boolean).join(' ')).trim();
    const picture = String(info.picture || '');

    if (!email) return bail(res, 'LinkedIn did not share an email address.');

    // ── Find or create the Firebase user ──
    let uid = '';
    let isNew = false;
    let existing = null;
    try { existing = await adminAuth().getUserByEmail(email); } catch { /* no account yet */ }

    if (existing) {
      // Linking to an account that already exists is only safe when LinkedIn
      // says it verified the address. Without that, anyone could register a
      // LinkedIn account against a candidate's email and take over the profile.
      if (!emailVerified) {
        return bail(res, 'Please sign in with your password first, then link LinkedIn from your profile.');
      }
      uid = existing.uid;
    } else {
      const created = await adminAuth().createUser({
        email,
        emailVerified,
        displayName: name || undefined,
        // No password: this account is reachable through LinkedIn, or through
        // the existing password-reset flow if they ever want one.
        password: crypto.randomBytes(32).toString('base64url'),
      });
      uid = created.uid;
      isNew = true;
    }

    // ── Copy the photo into our own storage ──
    // LinkedIn's picture URL is a signed CDN link that expires within weeks.
    // Saving the link would give us avatars that quietly break; saving the
    // bytes gives us one that lasts. Best-effort — a failed copy must not cost
    // the candidate their sign-in.
    let storedPhoto = '';
    if (picture) {
      try {
        const img = await fetch(picture);
        if (img.ok) {
          const buf = Buffer.from(await img.arrayBuffer());
          const type = img.headers.get('content-type') || 'image/jpeg';
          const ext = type.includes('png') ? 'png' : 'jpg';
          const file = adminBucket().file(`candidate-photos/${uid}/linkedin.${ext}`);
          const downloadToken = crypto.randomUUID();
          await file.save(buf, {
            contentType: type,
            metadata: { metadata: { firebaseStorageDownloadTokens: downloadToken } },
          });
          storedPhoto = `https://firebasestorage.googleapis.com/v0/b/${adminBucket().name}`
            + `/o/${encodeURIComponent(file.name)}?alt=media&token=${downloadToken}`;
        }
      } catch (e) {
        console.warn('[linkedin] photo copy failed, continuing without it:', e?.message);
      }
    }

    if (storedPhoto || name) {
      // photoURL is the spelling Talent already writes; Admin reads either.
      await adminAuth().updateUser(uid, {
        ...(storedPhoto ? { photoURL: storedPhoto } : {}),
        ...(name && !existing?.displayName ? { displayName: name } : {}),
      }).catch(() => null);
    }

    // ── The profile records, written HERE ──
    // Creating the auth user on the server and its Firestore records in the
    // browser meant two halves that could drift apart — and did: the browser
    // half hung off a one-shot session flag and could be refused by security
    // rules, silently, leaving an account that could sign in but appeared
    // nowhere in Admin. The server has admin rights and already knows
    // everything needed, so it writes both.
    if (isNew) {
      const candidateCode = `CAND-${uid.replace(/[^a-z0-9]/gi, '').slice(0, 8).toUpperCase()}`;
      const today = new Date().toISOString().slice(0, 10);
      const now = new Date();

      const profile = {
        name, email,
        candidateCode,
        role: 'candidate',
        availability: 'open',
        headline: 'Nearwork candidate',
        onboarded: false,
        // Durable: survives any number of sign-ins until they finish setup.
        needsOnboarding: true,
        source: 'linkedin',
        ...(storedPhoto ? { photoURL: storedPhoto } : {}),
        createdAt: now,
        updatedAt: now,
      };

      // Mirrors toAtsCandidate() so Admin sees the same shape it does for every
      // other candidate. createdAt matters twice over: Admin sorts newest-first
      // and the intake KPI buckets by month, and a record without it lands last
      // and uncounted.
      const ats = {
        code: candidateCode,
        uid, ownerUid: uid,
        name: name || 'Talent member',
        role: 'Nearwork candidate',
        skills: [],
        applied: today,
        lastContact: today,
        experience: 0,
        location: '', city: '', department: '', country: '',
        timezone: '', timezoneName: '',
        // The rules only accept these two values on this collection.
        source: 'talent.nearwork.co',
        status: 'active',
        score: 50,
        email,
        phone: '', whatsapp: '', currentRole: '',
        ...(storedPhoto ? { photoURL: storedPhoto } : {}),
        onboarded: false,
        needsOnboarding: true,
        createdAt: now,
        updatedAt: now,
      };

      await Promise.all([
        adminDb().collection('users').doc(uid).set(profile, { merge: true }),
        adminDb().collection('candidates').doc(candidateCode).set(ats, { merge: true }),
      ]);
    }

    const customToken = await adminAuth().createCustomToken(uid, { provider: 'linkedin' });

    // ── Back to Talent ──
    // `new=1` makes the app route them into the onboarding wizard; `opening`
    // carries the role they came to apply for, so onboarding can attach them to
    // it. Deliberately NOT `from=jobs`, which the app treats as "skip the
    // wizard" — a brand-new LinkedIn signup has no profile yet.
    const next = new URLSearchParams();
    next.set('li_token', customToken);
    if (isNew) next.set('new', '1');
    if (ctx.o) next.set('opening', ctx.o);
    if (storedPhoto) next.set('li_photo', storedPhoto);
    if (name) next.set('li_name', name);

    const dest = ctx.r && ctx.r.startsWith('/') ? ctx.r : '/';
    res.setHeader('Set-Cookie', `${STATE_COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`);
    res.writeHead(302, { Location: `${dest}?${next.toString()}` });
    res.end();
  } catch (e) {
    // Name the failing stage in the message itself. Without it, diagnosing this
    // means reading server logs, and the person hitting the error is a
    // candidate who can't.
    console.error('[linkedin] callback failed:', e);
    const detail = String(e?.errorInfo?.code || e?.code || e?.message || 'unknown').slice(0, 120);
    return bail(res, `LinkedIn sign-in failed (${detail})`);
  }
}
