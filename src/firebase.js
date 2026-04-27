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
  activity: "candidateActivity"
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
    phone: data.phone || "",
    salary: data.salary || "",
    salaryUSD: Number(data.salaryUSD || 0) || null,
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
  if (!profile) {
    await upsertCandidate(result.user.uid, {
      email: result.user.email,
      name: result.user.displayName || "",
      availability: "open",
      onboarded: false
    });
  }
  return result.user;
}

async function listCandidateApplications(uid) {
  requireFirebase();
  const applicationQuery = query(
    collection(db, collections.applications),
    where("candidateId", "==", uid),
    orderBy("updatedAt", "desc"),
    limit(20)
  );
  const snapshot = await getDocs(applicationQuery);
  return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
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
  if (data.onboarded === true) {
    try {
      await setDoc(doc(db, collections.candidates, candidateCode), toAtsCandidate(uid, {
      ...data,
      candidateCode
      }), { merge: true });
      return { candidateCode, atsSynced: true };
    } catch (error) {
      console.warn("Candidate workspace sync is pending.", error);
      return { candidateCode, atsSynced: false };
    }
  }
  return { candidateCode, atsSynced: false };
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

export {
  applyToJob,
  auth,
  createUserWithEmailAndPassword,
  findCandidateByEmail,
  getCandidate,
  getCandidateForAuthUser,
  hasFirebaseConfig,
  listCandidateApplications,
  listOpenJobs,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithGoogle,
  signOut,
  storage,
  updateCandidateAvailability,
  updateCandidateProfile,
  updateProfile,
  uploadCandidateCv,
  uploadCandidatePhoto,
  upsertCandidate
};
