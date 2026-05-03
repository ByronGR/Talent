import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import {
  GoogleAuthProvider,
  getAuth,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import {
  addDoc,
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytes
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-storage.js";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyApRNyW8PoP28E0x77dUB5jOgHuTqA2by4",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "nearwork-97e3c.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "nearwork-97e3c",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "nearwork-97e3c.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "145642656516",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:145642656516:web:0ac2da8931283121e87651",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-3LC8N6FFSH"
};

const hasFirebaseConfig = Object.values(firebaseConfig)
  .slice(0, 6)
  .every(Boolean);

const app = hasFirebaseConfig ? initializeApp(firebaseConfig) : null;
const auth = app ? getAuth(app) : null;
const db = app ? getFirestore(app) : null;
const storage = app ? getStorage(app) : null;
const googleProvider = app ? new GoogleAuthProvider() : null;

const collections = {
  users: "users",
  candidates: "candidates",
  openings: "openings",
  pipelines: "pipelines",
  applications: "applications",
  assessments: "assessments",
  activity: "candidateActivity",
  notifications: "notifications",
  notificationPreferences: "notificationPreferences"
};

function requireFirebase() {
  if (!app || !auth || !db || !storage) {
    throw new Error("Missing Firebase environment variables. Copy .env.example to .env.local and fill in the Admin app config.");
  }
}

async function getCandidate(uid) {
  requireFirebase();
  const snapshot = await getDoc(doc(db, collections.users, uid));
  return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null;
}

async function findCandidateByEmail(email) {
  requireFirebase();
  const rawEmail = String(email || "").trim();
  const normalizedEmail = rawEmail.toLowerCase();
  const userQuery = query(
    collection(db, collections.users),
    where("email", "==", normalizedEmail),
    limit(1)
  );
  const snapshot = await getDocs(userQuery);
  if (!snapshot.empty) return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
  if (rawEmail === normalizedEmail) return null;

  const rawEmailQuery = query(
    collection(db, collections.users),
    where("email", "==", rawEmail),
    limit(1)
  );
  const rawSnapshot = await getDocs(rawEmailQuery);
  return rawSnapshot.empty ? null : { id: rawSnapshot.docs[0].id, ...rawSnapshot.docs[0].data() };
}

async function getCandidateForAuthUser(user) {
  const directProfile = await getCandidate(user.uid);
  if (directProfile) return directProfile;

  const emailProfile = await findCandidateByEmail(user.email);
  if (!emailProfile) return null;

  await upsertCandidate(user.uid, {
    ...emailProfile,
    email: user.email,
    connectedFromUserId: emailProfile.id
  });
  return { ...emailProfile, id: user.uid, connectedFromUserId: emailProfile.id };
}

async function upsertCandidate(uid, data) {
  requireFirebase();
  const payload = {
    ...data,
    role: "candidate",
    updatedAt: serverTimestamp()
  };
  await setDoc(doc(db, collections.users, uid), payload, { merge: true });
}

function candidateCodeForUid(uid) {
  const stableId = String(uid || "").replace(/[^a-z0-9]/gi, "").slice(0, 8).toUpperCase();
  return `CAND-${stableId || Date.now()}`;
}

function normalizeLocationKey(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function toAtsCandidate(uid, data) {
  const code = data.candidateCode || candidateCodeForUid(uid);
  const location = data.location || [data.locationCity || data.city, data.locationDepartment || data.department].filter(Boolean).join(", ");
  const today = new Date().toISOString().slice(0, 10);
  return {
    code,
    uid,
    ownerUid: uid,
    name: data.name || "Talent member",
    role: data.targetRole || data.headline || "Nearwork candidate",
    skills: Array.isArray(data.skills) ? data.skills : [],
    applied: data.applied || today,
    lastContact: data.lastContact || today,
    experience: Number(data.experience || 0),
    location,
    city: normalizeLocationKey(data.locationCity || data.city || location),
    department: data.locationDepartment || data.department || "",
    country: data.locationCountry || "Colombia",
    source: "talent.nearwork.co",
    status: data.status || "active",
    score: Number(data.score || 50),
    email: data.email || "",
    phone: data.whatsapp || data.phone || "",
    whatsapp: data.whatsapp || data.phone || "",
    salary: data.salary || "",
    salaryUSD: Number(data.salaryUSD || 0) || null,
    salaryAmount: Number(data.salaryAmount || data.expectedSalaryAmount || 0) || null,
    salaryCurrency: data.salaryCurrency || data.expectedSalaryCurrency || "USD",
    expectedSalaryAmount: Number(data.expectedSalaryAmount || data.salaryAmount || 0) || null,
    expectedSalaryCurrency: data.expectedSalaryCurrency || data.salaryCurrency || "USD",
    expectedSalary: data.expectedSalary || data.salary || "",
    availability: data.availability || "open",
    english: data.english || "",
    visa: data.visa || "No",
    linkedin: data.linkedin || "",
    cv: data.activeCvName || "",
    tags: data.tags || ["talent profile"],
    notes: data.summary || "",
    appliedBefore: Boolean(data.appliedBefore),
    applications: data.applications || [],
    pipelineCodes: data.pipelineCodes || [],
    loom: data.loom || "Not uploaded",
    assessments: data.assessments || [],
    work: data.work || [],
    updatedAt: serverTimestamp()
  };
}

async function signInWithGoogle() {
  requireFirebase();
  const result = await signInWithPopup(auth, googleProvider);
  const profile = await getCandidateForAuthUser(result.user);
  const basicData = {
    email: result.user.email,
    name: result.user.displayName || "",
    availability: "open",
    onboarded: false
  };
  if (!profile) {
    await upsertCandidate(result.user.uid, basicData);
  }
  const candidateCode = candidateCodeForUid(result.user.uid);
  const merged = { ...(profile || basicData), candidateCode };
  await setDoc(doc(db, collections.candidates, candidateCode), toAtsCandidate(result.user.uid, merged), { merge: true }).catch(() => null);
  return result.user;
}

async function listCandidateApplications(uid) {
  requireFirebase();
  const byCandidateId = query(
    collection(db, collections.applications),
    where("candidateId", "==", uid),
    orderBy("updatedAt", "desc"),
    limit(20)
  );
  const byOwnerUid = query(
    collection(db, collections.applications),
    where("ownerUid", "==", uid),
    orderBy("updatedAt", "desc"),
    limit(20)
  );
  const snapshots = await Promise.allSettled([getDocs(byCandidateId), getDocs(byOwnerUid)]);
  const byId = new Map();
  snapshots.forEach((result) => {
    if (result.status !== "fulfilled") return;
    result.value.docs.forEach((item) => byId.set(item.id, { id: item.id, ...item.data() }));
  });
  return Array.from(byId.values()).sort((a, b) => {
    const toMs = (value) => value?.toDate?.()?.getTime() ?? (value ? new Date(value).getTime() : 0);
    return toMs(b.updatedAt || b.createdAt) - toMs(a.updatedAt || a.createdAt);
  });
}

async function listCandidateAssessments(uid, email = "", candidateCode = "") {
  requireFirebase();
  const normalizedEmail = String(email || "").trim().toLowerCase();
  const normalizedCode = String(candidateCode || "").trim();
  const requests = [
    getDocs(query(collection(db, collections.assessments), where("candidateUid", "==", uid), limit(25))),
    getDocs(query(collection(db, collections.assessments), where("candidateId", "==", uid), limit(25)))
  ];
  if (normalizedEmail) {
    requests.push(getDocs(query(collection(db, collections.assessments), where("candidateEmail", "==", normalizedEmail), limit(25))));
  }
  if (normalizedCode) {
    requests.push(getDocs(query(collection(db, collections.assessments), where("candidateCode", "==", normalizedCode), limit(25))));
  }
  const snapshots = await Promise.allSettled(requests);
  const byId = new Map();
  snapshots.forEach((result) => {
    if (result.status !== "fulfilled") return;
    result.value.docs.forEach((item) => byId.set(item.id, { id: item.id, ...item.data() }));
  });
  return Array.from(byId.values()).sort((a, b) => {
    const toMs = (value) => value?.toDate?.()?.getTime() ?? (value ? new Date(value).getTime() : 0);
    return toMs(b.updatedAt || b.createdAt || b.sentAt) - toMs(a.updatedAt || a.createdAt || a.sentAt);
  });
}

async function getCandidateAssessment(assessmentId, uid, email = "", candidateCode = "") {
  requireFirebase();
  const snapshot = await getDoc(doc(db, collections.assessments, assessmentId));
  if (!snapshot.exists()) return null;
  const data = { id: snapshot.id, ...snapshot.data() };
  const normalizedEmail = String(email || "").trim().toLowerCase();
  const normalizedCode = String(candidateCode || "").trim();
  const allowed = data.candidateUid === uid
    || data.candidateId === uid
    || String(data.candidateEmail || "").trim().toLowerCase() === normalizedEmail
    || String(data.candidateCode || "").trim() === normalizedCode;
  return allowed ? data : null;
}

async function startCandidateAssessment(assessmentId, uid) {
  requireFirebase();
  const current = await getDoc(doc(db, collections.assessments, assessmentId));
  const data = current.exists() ? current.data() : {};
  if (data.status === "completed") throw new Error("This assessment is already completed.");
  if (data.expiresAt && Date.now() > new Date(data.expiresAt).getTime()) throw new Error("This assessment link has expired.");
  await setDoc(doc(db, collections.assessments, assessmentId), {
    status: "started",
    currentQuestionIndex: Number(data.currentQuestionIndex || 0),
    currentStage: Number(data.currentStage || 1),
    technicalStartedAt: data.technicalStartedAt || serverTimestamp(),
    startedAt: data.startedAt || serverTimestamp(),
    updatedAt: serverTimestamp()
  }, { merge: true });
}

async function saveAssessmentAnswer(assessmentId, questionId, answer, meta = {}) {
  requireFirebase();
  const current = await getDoc(doc(db, collections.assessments, assessmentId));
  const data = current.exists() ? current.data() : {};
  if (data.status === "completed") throw new Error("This assessment is already completed.");
  if (data.expiresAt && Date.now() > new Date(data.expiresAt).getTime()) throw new Error("This assessment link has expired.");
  await setDoc(doc(db, collections.assessments, assessmentId), {
    [`answers.${questionId}`]: answer,
    progress: `${meta.currentQuestionIndex || 0}/${meta.totalQuestions || ""}`.replace(/\/$/, ""),
    currentQuestionIndex: meta.currentQuestionIndex || 0,
    currentStage: meta.currentStage || 1,
    ...(meta.discStartedAt ? { discStartedAt: meta.discStartedAt } : {}),
    updatedAt: serverTimestamp()
  }, { merge: true });
}

async function submitCandidateAssessment(assessmentId, answers, meta = {}) {
  requireFirebase();
  const assessmentRef = doc(db, collections.assessments, assessmentId);
  const current = await getDoc(assessmentRef);
  const assessment = current.exists() ? current.data() : {};
  if (assessment.status === "completed") throw new Error("This assessment is already completed.");
  if (assessment.expiresAt && Date.now() > new Date(assessment.expiresAt).getTime()) throw new Error("This assessment link has expired.");
  const answered = Object.values(answers || {}).filter((answer) => String(answer?.value ?? answer ?? "").trim()).length;
  const total = Number(meta.totalQuestions || Object.keys(answers || {}).length || 0);
  const technicalScore = Number(meta.technicalScore || 0);
  const discScore = Number(meta.discScore || 0);
  const completionScore = Number(meta.score || (total ? Math.round((answered / total) * 100) : 0));
  await setDoc(assessmentRef, {
    answers,
    answeredCount: answered,
    totalQuestions: total,
    score: completionScore,
    technical: technicalScore || completionScore,
    disc: meta.discProfile?.label || (discScore ? `${discScore}%` : "Submitted"),
    discScore,
    discProfile: meta.discProfile || null,
    progress: `${answered}/${total}`,
    status: "completed",
    finished: new Date().toLocaleString("en-US", { month:"short", day:"numeric", year:"numeric", hour:"numeric", minute:"2-digit" }),
    finishedAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  }, { merge: true });
  const nextScore = Math.round(completionScore);
  if (assessment.candidateUid) {
    await setDoc(doc(db, collections.users, assessment.candidateUid), {
      score: nextScore,
      nwScore: nextScore,
      lastAssessmentScore: nextScore,
      lastAssessmentId: assessmentId,
      updatedAt: serverTimestamp()
    }, { merge: true }).catch(() => null);
  }
  if (assessment.candidateCode) {
    await setDoc(doc(db, collections.candidates, assessment.candidateCode), {
      score: nextScore,
      nwScore: nextScore,
      lastAssessmentScore: nextScore,
      lastAssessmentId: assessmentId,
      updatedAt: serverTimestamp()
    }, { merge: true }).catch(() => null);
  }
}

async function listOpenJobs() {
  requireFirebase();
  const jobsQuery = query(
    collection(db, collections.openings),
    where("published", "==", true),
    limit(12)
  );
  const snapshot = await getDocs(jobsQuery);
  return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
}

async function applyToJob(uid, job) {
  requireFirebase();
  const code = job.code || job.id;
  const candidate = await getCandidate(uid).catch(() => null);
  const application = {
    candidateId: uid,
    candidateCode: candidate?.candidateCode || candidateCodeForUid(uid),
    candidateEmail: candidate?.email || "",
    candidateName: candidate?.name || "",
    openingCode: code,
    jobId: code,
    jobTitle: job.title || job.role || "Untitled role",
    clientName: job.orgName || job.clientName || job.company || "Nearwork client",
    status: "submitted",
    source: "talent.nearwork.co",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };
  await addDoc(collection(db, collections.applications), application);
  await setDoc(doc(db, collections.candidates, application.candidateCode), {
    ...toAtsCandidate(uid, {
      ...(candidate || {}),
      candidateCode: application.candidateCode,
      applications: arrayUnion(code),
      appliedBefore: true,
      lastContact: new Date().toISOString().slice(0, 10)
    }),
    applications: arrayUnion(code),
    appliedBefore: true
  }, { merge: true }).catch(() => null);
  await addDoc(collection(db, collections.activity), {
    candidateId: uid,
    type: "application_submitted",
    title: application.jobTitle,
    createdAt: serverTimestamp()
  }).catch(() => null);
}

async function updateCandidateAvailability(uid, availability) {
  await updateDoc(doc(db, collections.users, uid), {
    availability,
    updatedAt: serverTimestamp()
  });
}

async function updateCandidateProfile(uid, data) {
  requireFirebase();
  const candidateCode = data.candidateCode || candidateCodeForUid(uid);
  await setDoc(doc(db, collections.users, uid), {
    ...data,
    candidateCode,
    role: "candidate",
    updatedAt: serverTimestamp()
  }, { merge: true });
  try {
    await setDoc(doc(db, collections.candidates, candidateCode), toAtsCandidate(uid, {
      ...data,
      candidateCode
    }), { merge: true });
    return { candidateCode, atsSynced: true };
  } catch (error) {
    console.warn("Candidate ATS sync failed.", error);
    return { candidateCode, atsSynced: false };
  }
}

async function uploadCandidatePhoto(uid, file) {
  requireFirebase();
  const safeName = file.name.replace(/[^a-z0-9._-]/gi, "-").toLowerCase();
  const path = `candidate-photos/${uid}/${Date.now()}-${safeName}`;
  const fileRef = ref(storage, path);
  await uploadBytes(fileRef, file, {
    contentType: file.type || "application/octet-stream"
  });
  const url = await getDownloadURL(fileRef);
  await setDoc(doc(db, collections.users, uid), {
    photoURL: url,
    updatedAt: serverTimestamp()
  }, { merge: true });
  return url;
}

async function uploadCandidateCv(uid, file, label) {
  requireFirebase();
  const safeName = file.name.replace(/[^a-z0-9._-]/gi, "-").toLowerCase();
  const path = `candidate-cvs/${uid}/${Date.now()}-${safeName}`;
  const fileRef = ref(storage, path);
  await uploadBytes(fileRef, file, {
    contentType: file.type || "application/octet-stream"
  });
  const url = await getDownloadURL(fileRef);
  const cv = {
    id: path,
    name: label || file.name,
    fileName: file.name,
    url,
    uploadedAt: new Date().toISOString()
  };
  await setDoc(doc(db, collections.users, uid), {
    cvLibrary: arrayUnion(cv),
    activeCvId: cv.id,
    activeCvName: cv.name || cv.fileName,
    updatedAt: serverTimestamp()
  }, { merge: true });
  return cv;
}

function subscribeToNotifications(userId, callback) {
  requireFirebase();
  if (!userId) return () => {};
  const q = query(
    collection(db, collections.notifications),
    where("recipientUid", "==", userId),
    limit(50)
  );
  return onSnapshot(q, (snapshot) => {
    const items = snapshot.docs
      .map((item) => ({ id: item.id, ...item.data() }))
      .sort((a, b) => {
        const aTime = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : new Date(a.createdAt || 0).getTime();
        const bTime = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : new Date(b.createdAt || 0).getTime();
        return bTime - aTime;
      });
    callback(items);
  });
}

async function markNotificationRead(notificationId) {
  requireFirebase();
  if (!notificationId) return;
  await setDoc(doc(db, collections.notifications, notificationId), {
    read: true,
    readAt: serverTimestamp()
  }, { merge: true });
}

async function saveNotificationPreferences(uid, preferences) {
  requireFirebase();
  await setDoc(doc(db, collections.notificationPreferences, uid), {
    uid,
    app: "talent.nearwork.co",
    preferences,
    updatedAt: serverTimestamp()
  }, { merge: true });
}

export {
  applyToJob,
  auth,
  createUserWithEmailAndPassword,
  findCandidateByEmail,
  getCandidate,
  getCandidateForAuthUser,
  hasFirebaseConfig,
  listCandidateApplications,
  listCandidateAssessments,
  listOpenJobs,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithGoogle,
  signOut,
  markNotificationRead,
  getCandidateAssessment,
  saveAssessmentAnswer,
  startCandidateAssessment,
  subscribeToNotifications,
  submitCandidateAssessment,
  storage,
  updateCandidateAvailability,
  updateCandidateProfile,
  updateProfile,
  saveNotificationPreferences,
  uploadCandidateCv,
  uploadCandidatePhoto,
  upsertCandidate
};
