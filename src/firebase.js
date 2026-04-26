import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import {
  addDoc,
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

const collections = {
  users: "users",
  openings: "openings",
  pipelines: "pipelines",
  applications: "applications",
  activity: "candidateActivity"
};

function requireFirebase() {
  if (!app || !auth || !db) {
    throw new Error("Missing Firebase environment variables. Copy .env.example to .env.local and fill in the Admin app config.");
  }
}

async function getCandidate(uid) {
  requireFirebase();
  const snapshot = await getDoc(doc(db, collections.users, uid));
  return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null;
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
  const application = {
    candidateId: uid,
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
  await addDoc(collection(db, collections.activity), {
    candidateId: uid,
    type: "application_submitted",
    title: application.jobTitle,
    createdAt: serverTimestamp()
  });
}

async function updateCandidateAvailability(uid, availability) {
  await updateDoc(doc(db, collections.users, uid), {
    availability,
    updatedAt: serverTimestamp()
  });
}

export {
  applyToJob,
  auth,
  createUserWithEmailAndPassword,
  getCandidate,
  hasFirebaseConfig,
  listCandidateApplications,
  listOpenJobs,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateCandidateAvailability,
  updateProfile,
  upsertCandidate
};
