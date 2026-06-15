// POST /api/delete-account
// Lets a signed-in candidate permanently delete their own account: Firebase Auth
// user, users/{uid} + candidates/{code} profile docs, Storage CV/photo uploads,
// and every linked applications/assessments/activity/notifications/notes/pipeline
// reference. Intentionally does NOT touch hiredPlacements/placements, payrollRuns,
// performanceReviews, or timeOffRequests — those remain as Nearwork's business
// records even after the candidate's profile is gone.
//
// Requires the Vercel OIDC -> GCP Workload Identity Federation credential
// (GCP_WIF_AUDIENCE) configured on this project, since candidates can't delete
// users/{uid} or candidates/{code} under Firestore rules (Admin-only).

import { adminAuth, adminDb, adminStorage } from './_lib/firebase-admin.js';

function candidateCodeForUid(uid) {
  const stableId = String(uid || '').replace(/[^a-z0-9]/gi, '').slice(0, 8).toUpperCase();
  return `CAND-${stableId || Date.now()}`;
}

async function deleteStoragePrefix(prefix) {
  const bucket = adminStorage().bucket();
  const [files] = await bucket.getFiles({ prefix });
  await Promise.all(files.map((file) => file.delete().catch(() => null)));
}

async function deleteDocsByQuery(db, collectionName, field, value, seen, refs) {
  if (!value) return;
  const snapshot = await db.collection(collectionName).where(field, '==', value).get();
  snapshot.docs.forEach((doc) => {
    const key = doc.ref.path;
    if (!seen.has(key)) {
      seen.add(key);
      refs.push(doc.ref);
    }
  });
}

async function commitInBatches(db, refs) {
  const chunkSize = 450;
  for (let i = 0; i < refs.length; i += chunkSize) {
    const batch = db.batch();
    refs.slice(i, i + chunkSize).forEach((ref) => batch.delete(ref));
    await batch.commit();
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  const authHeader = req.headers.authorization || '';
  const idToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
  if (!idToken) {
    return res.status(401).json({ ok: false, error: 'Missing auth token' });
  }

  let decoded;
  try {
    decoded = await adminAuth().verifyIdToken(idToken);
  } catch {
    return res.status(401).json({ ok: false, error: 'Invalid or expired session' });
  }

  const uid = decoded.uid;
  const email = (decoded.email || '').toLowerCase();

  try {
    const db = adminDb();
    const userSnap = await db.collection('users').doc(uid).get();
    const userData = userSnap.exists ? userSnap.data() : {};
    const candidateCode = userData.candidateCode || candidateCodeForUid(uid);
    const candidateEmail = (userData.email || email || '').toLowerCase();

    // ── Storage: CV uploads + profile photos ──
    await Promise.all([
      deleteStoragePrefix(`candidate-photos/${uid}/`),
      deleteStoragePrefix(`candidate-cvs/${uid}/`),
    ]);

    // ── Firestore: gather every doc linked to this candidate ──
    const seen = new Set();
    const refsToDelete = [];

    await Promise.all([
      deleteDocsByQuery(db, 'applications', 'candidateId', uid, seen, refsToDelete),
      deleteDocsByQuery(db, 'applications', 'candidateId', candidateCode, seen, refsToDelete),
      deleteDocsByQuery(db, 'applications', 'ownerUid', uid, seen, refsToDelete),
      deleteDocsByQuery(db, 'applications', 'candidateEmail', candidateEmail, seen, refsToDelete),

      deleteDocsByQuery(db, 'assessments', 'candidateUid', uid, seen, refsToDelete),
      deleteDocsByQuery(db, 'assessments', 'candidateId', uid, seen, refsToDelete),
      deleteDocsByQuery(db, 'assessments', 'candidateId', candidateCode, seen, refsToDelete),
      deleteDocsByQuery(db, 'assessments', 'candidateCode', candidateCode, seen, refsToDelete),
      deleteDocsByQuery(db, 'assessments', 'candidateEmail', candidateEmail, seen, refsToDelete),

      deleteDocsByQuery(db, 'candidateActivity', 'candidateId', uid, seen, refsToDelete),

      deleteDocsByQuery(db, 'notifications', 'recipientUid', uid, seen, refsToDelete),
      deleteDocsByQuery(db, 'notifications', 'recipientEmail', candidateEmail, seen, refsToDelete),

      deleteDocsByQuery(db, 'candidateNotes', 'candidateId', candidateCode, seen, refsToDelete),
      deleteDocsByQuery(db, 'candidateNotes', 'candidateId', uid, seen, refsToDelete),
    ]);

    // notificationPreferences/{uid} is keyed by uid directly
    const prefRef = db.collection('notificationPreferences').doc(uid);
    if ((await prefRef.get()).exists) refsToDelete.push(prefRef);

    // ── Pipelines: strip this candidate out of any candidates[] array ──
    const pipelinesSnap = await db.collection('pipelines').get();
    const pipelineUpdates = [];
    pipelinesSnap.docs.forEach((doc) => {
      const data = doc.data();
      const candidates = Array.isArray(data.candidates) ? data.candidates : [];
      const filtered = candidates.filter((c) => (
        c?.candidateId !== candidateCode && c?.candidateId !== uid && c?.candidateCode !== candidateCode
      ));
      if (filtered.length !== candidates.length) {
        pipelineUpdates.push(doc.ref.update({ candidates: filtered }));
      }
    });
    await Promise.all(pipelineUpdates);

    // ── Candidate profile docs (Admin-only deletes) ──
    refsToDelete.push(db.collection('candidates').doc(candidateCode));
    refsToDelete.push(db.collection('users').doc(uid));

    await commitInBatches(db, refsToDelete);

    // ── Auth user, deleted last so a partial failure above is retryable ──
    await adminAuth().deleteUser(uid);

    return res.status(200).json({ ok: true });
  } catch (error) {
    return res.status(500).json({ ok: false, error: error?.message || 'Failed to delete account' });
  }
}
