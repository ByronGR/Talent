import { adminDb } from './firebase-admin.js';

// Firestore-backed rate limiter. Uses a transaction so concurrent requests
// with the same key don't slip through simultaneously.
// Returns { allowed: true } or { allowed: false, retryAfter: seconds }.

function sanitizeKey(str) {
  return str.replace(/\//g, '_').replace(/[.#$[\]]/g, '-').slice(0, 1024);
}

export async function checkRateLimit({ key, limit, windowMs }) {
  const db = adminDb();
  const ref = db.collection('_rateLimits').doc(sanitizeKey(key));
  const now = Date.now();

  return db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);

    if (!snap.exists || (now - snap.data().windowStart) > windowMs) {
      tx.set(ref, { count: 1, windowStart: now });
      return { allowed: true };
    }

    const { count, windowStart } = snap.data();

    if (count >= limit) {
      const retryAfter = Math.ceil((windowStart + windowMs - now) / 1000);
      return { allowed: false, retryAfter };
    }

    tx.update(ref, { count: count + 1 });
    return { allowed: true };
  });
}
