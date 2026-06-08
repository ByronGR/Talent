import {
  applyToJob,
  auth,
  createUserWithEmailAndPassword,
  getCandidateForAuthUser,
  getCandidateAssessment,
  hasFirebaseConfig,
  listCandidateApplications,
  listCandidateAssessments,
  listOpenJobs,
  markNotificationRead,
  onAuthStateChanged,
  saveAssessmentAnswer,
  saveNotificationPreferences,
  sendCandidateAccountCreatedEmail,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithGoogle,
  signOut,
  startCandidateAssessment,
  subscribeToNotifications,
  submitCandidateAssessment,
  updateCandidateAvailability,
  updateCandidateProfile,
  updateProfile,
  uploadCandidateCv,
  uploadCandidatePhoto,
  upsertCandidate,
  parseCvWithAffinda
} from "./firebase.js";

// Holds data extracted by Affinda until the profile form is saved.
// Reset each time a new CV is selected or the profile form is submitted.
let _cvParsedData = null;
let _cvOverwrite  = false; // true for new candidates and returning candidates who toggled "rewrite"

// ─── Onboarding wizard state ──────────────────────────────────────────────────
let _onbStep         = 1;
let _onbData         = {};   // accumulated answers from steps 1-4
let _onbCvFile       = null; // File object selected in step 1
let _onbParsePromise = null; // in-flight Affinda request
let _onbParsed       = null; // resolved Affinda result

const app = document.querySelector("#app");
const SUPPORT_WHATSAPP = "+573135928691";
const SUPPORT_WHATSAPP_URL = "https://wa.me/573135928691";

const roleGroups = {
  "Customer Success": [
    "Customer Success Manager",
    "Customer Success Associate",
    "Account Manager",
    "Implementation Specialist",
    "Onboarding Specialist",
    "Renewals Manager"
  ],
  Sales: [
    "SDR / Sales Development Rep",
    "BDR / Business Development Rep",
    "Account Executive",
    "Sales Operations Specialist",
    "Sales Manager"
  ],
  Support: [
    "Technical Support Specialist",
    "Customer Support Representative",
    "Support Team Lead",
    "QA Support Analyst"
  ],
  Operations: [
    "Operations Manager",
    "Operations Analyst",
    "Executive Assistant",
    "Virtual Assistant",
    "Project Coordinator",
    "Recruiting Coordinator"
  ],
  Marketing: [
    "Marketing Ops / Content Specialist",
    "Content Writer",
    "SEO Specialist",
    "Lifecycle Marketing Specialist",
    "Social Media Manager"
  ],
  Engineering: [
    "Software Developer (Full Stack)",
    "Frontend Developer",
    "Backend Developer",
    "No-Code Developer",
    "Data Analyst",
    "QA Engineer"
  ],
  Finance: [
    "Bookkeeper",
    "Accounting Assistant",
    "Financial Analyst",
    "Payroll Specialist"
  ]
};

const skillGroups = {
  "CRM & Sales": ["HubSpot", "Salesforce", "Pipedrive", "Apollo", "Outbound", "Cold Email", "Discovery Calls", "CRM Hygiene"],
  "Customer Success": ["SaaS", "Customer Success", "QBRs", "Onboarding", "Renewals", "Expansion", "Churn Reduction", "Intercom", "Zendesk"],
  Support: ["Technical Support", "Tickets", "Troubleshooting", "APIs", "Bug Reproduction", "Help Center", "CSAT"],
  Operations: ["Excel", "Google Sheets", "Reporting", "Process Design", "Project Management", "Notion", "Airtable", "Zapier"],
  Marketing: ["Content", "SEO", "Lifecycle", "Email Marketing", "HubSpot Marketing", "Copywriting", "Analytics"],
  Engineering: ["JavaScript", "React", "Node.js", "SQL", "Python", "REST APIs", "QA", "GitHub"],
  Language: ["English B2", "English C1", "English C2", "Spanish Native"]
};

const extendedSkillCatalog = [
  "Account Management", "Accounts Payable", "Accounts Receivable", "Adobe Creative Suite", "Agile", "AI Tools",
  "Analytics", "Appointment Setting", "B2B Sales", "B2C Sales", "Billing", "Bookkeeping", "Business Analysis",
  "Canva", "Cash Collections", "Chat Support", "Cold Calling", "Community Management", "Compliance",
  "Content Strategy", "Contract Management", "Customer Onboarding", "Customer Retention", "Customer Service",
  "Data Analysis", "Data Entry", "Email Support", "Excel / Google Sheets", "Executive Assistance", "Figma",
  "Financial Reporting", "Forecasting", "Helpdesk", "HR Operations", "Inbound Calls", "Insurance Support",
  "Lead Generation", "Live Chat", "Logistics", "Looker", "Microsoft Office", "NetSuite", "Outbound Calls",
  "Payroll", "Performance Marketing", "Power BI", "Product Support", "QuickBooks", "Recruiting",
  "Salesforce Administration", "Sales Operations", "Shopify", "Slack", "Social Media", "SQL Reporting",
  "Stripe", "Tableau", "Technical Writing", "Ticket Quality", "Training", "Vendor Management", "WordPress",
  "Workday", "Workforce Management", "Zendesk Guide", "Zoho"
];
const ALL_SKILLS = [...new Set([...Object.values(skillGroups).flat(), ...extendedSkillCatalog])]
  .sort((a, b) => a.localeCompare(b));

const colombiaLocations = {
  "Amazonas": ["Leticia", "Puerto Nariño"],
  "Antioquia": ["Medellín", "Abejorral", "Apartadó", "Bello", "Caldas", "Caucasia", "Copacabana", "El Carmen de Viboral", "Envigado", "Girardota", "Itagüí", "La Ceja", "La Estrella", "Marinilla", "Rionegro", "Sabaneta", "Santa Fe de Antioquia", "Turbo"],
  "Arauca": ["Arauca", "Arauquita", "Saravena", "Tame"],
  "Atlántico": ["Barranquilla", "Baranoa", "Galapa", "Malambo", "Puerto Colombia", "Sabanalarga", "Soledad"],
  "Bogotá D.C.": ["Bogotá"],
  "Bolívar": ["Cartagena", "Arjona", "El Carmen de Bolívar", "Magangué", "Mompox", "Turbaco"],
  "Boyacá": ["Tunja", "Chiquinquirá", "Duitama", "Paipa", "Sogamoso", "Villa de Leyva"],
  "Caldas": ["Manizales", "Aguadas", "Chinchiná", "La Dorada", "Riosucio", "Villamaría"],
  "Caquetá": ["Florencia", "El Doncello", "Puerto Rico", "San Vicente del Caguán"],
  "Casanare": ["Yopal", "Aguazul", "Paz de Ariporo", "Villanueva"],
  "Cauca": ["Popayán", "El Tambo", "Puerto Tejada", "Santander de Quilichao"],
  "Cesar": ["Valledupar", "Aguachica", "Bosconia", "Codazzi"],
  "Chocó": ["Quibdó", "Istmina", "Nuquí", "Tadó"],
  "Córdoba": ["Montería", "Cereté", "Lorica", "Sahagún"],
  "Cundinamarca": ["Chía", "Cajicá", "Facatativá", "Fusagasugá", "Girardot", "Madrid", "Mosquera", "Soacha", "Tocancipá", "Zipaquirá"],
  "Guainía": ["Inírida"],
  "Guaviare": ["San José del Guaviare", "Calamar", "El Retorno", "Miraflores"],
  "Huila": ["Neiva", "Garzón", "La Plata", "Pitalito"],
  "La Guajira": ["Riohacha", "Maicao", "San Juan del Cesar", "Uribia"],
  "Magdalena": ["Santa Marta", "Ciénaga", "El Banco", "Fundación"],
  "Meta": ["Villavicencio", "Acacías", "Granada", "Puerto López"],
  "Nariño": ["Pasto", "Ipiales", "Tumaco", "Túquerres"],
  "Norte de Santander": ["Cúcuta", "Ocaña", "Pamplona", "Villa del Rosario"],
  "Putumayo": ["Mocoa", "Orito", "Puerto Asís", "Valle del Guamuez"],
  "Quindío": ["Armenia", "Calarcá", "La Tebaida", "Montenegro", "Quimbaya"],
  "Risaralda": ["Pereira", "Dosquebradas", "La Virginia", "Santa Rosa de Cabal"],
  "San Andrés y Providencia": ["San Andrés", "Providencia"],
  "Santander": ["Bucaramanga", "Barrancabermeja", "Floridablanca", "Girón", "Piedecuesta", "San Gil"],
  "Sucre": ["Sincelejo", "Corozal", "Sampués", "Tolú"],
  "Tolima": ["Ibagué", "Espinal", "Honda", "Melgar"],
  "Valle del Cauca": ["Cali", "Buga", "Buenaventura", "Cartago", "Jamundí", "Palmira", "Tuluá", "Yumbo"],
  "Vaupés": ["Mitú"],
  "Vichada": ["Puerto Carreño", "La Primavera", "Santa Rosalía"]
};
let locationCatalog = colombiaLocations;

const tips = [
  {
    title: "How to answer salary questions",
    tag: "Interview",
    read: "4 min",
    body: "Use a confident range, anchor it to the role, and avoid apologizing for earning in USD.",
    actions: ["Know your floor", "Use monthly USD", "Mention flexibility last"]
  },
  {
    title: "Writing a CV for US SaaS companies",
    tag: "CV",
    read: "6 min",
    body: "Translate local experience into metrics US hiring managers can scan in under a minute.",
    actions: ["Lead with outcomes", "Add tools", "Quantify scope"]
  },
  {
    title: "Before your recruiter screen",
    tag: "Process",
    read: "3 min",
    body: "Prepare availability, compensation, English comfort, and two strong role stories.",
    actions: ["Check your setup", "Review the opening", "Bring questions"]
  },
  {
    title: "STAR stories that feel natural",
    tag: "Interview",
    read: "5 min",
    body: "Keep stories specific, concise, and tied to business impact instead of job duties.",
    actions: ["Situation", "Action", "Result"]
  }
];

const pipelineStages = [
  { key: "profile-review", label: "Profile Review", help: "We are checking role fit and your candidate profile." },
  { key: "background-check", label: "Background Checks", help: "Nearwork is verifying relevant background and work details." },
  { key: "assessment", label: "Assessment", help: "Complete role-specific questions when assigned." },
  { key: "interview", label: "Interview", help: "Meet the recruiter and book your next conversation." },
  { key: "presented", label: "Presented", help: "Your profile has been prepared for the company." },
  { key: "client-review", label: "Client Review", help: "The company is reviewing your profile and next steps." },
  { key: "hired", label: "Hired", help: "Offer accepted and onboarding is ready to begin." }
];

let state = {
  user: null,
  candidate: null,
  applications: [],
  assessments: [],
  notifications: [],
  notificationPanelOpen: false,
  notificationSettingsOpen: false,
  jobs: [],
  loading: true,
  view: "login",
  activePage: "overview",
  matchesFiltered: false,
  message: "",
  assessmentUiStep: null  // null | "techIntro" | "discIntro"
};

let notificationUnsubscribe = null;

const restoredPath = sessionStorage.getItem("nw_restore_path");
if (restoredPath) {
  sessionStorage.removeItem("nw_restore_path");
  window.history.replaceState({ page: restoredPath }, "", restoredPath);
}

function navItems() {
  return [
    ["overview", "layout-dashboard", "Overview"],
    ["matches", "briefcase-business", "Matches"],
    ["applications", "send", "Applications"],
    ["assessment", "clipboard-check", "Assessment"],
    ["cvs", "files", "CV Picker"],
    ["tips", "book-open", "Tips"],
    ["recruiter", "calendar-days", "Recruiter"],
    ["profile", "user-round-cog", "Profile"]
  ];
}

function pageFromPath() {
  const parts = window.location.pathname.split("/").filter(Boolean);
  const segment = parts[0];
  if (segment === "onboarding") return "onboarding";
  if (segment === "assessment" || segment === "assessments") return "assessment";
  return navItems().some(([key]) => key === segment) ? segment : "overview";
}

function assessmentIdFromPath() {
  const parts = window.location.pathname.split("/").filter(Boolean);
  return (parts[0] === "assessment" || parts[0] === "assessments") ? parts[1] || "" : "";
}

function assessmentQuestionIndexFromPath() {
  const parts = window.location.pathname.split("/").filter(Boolean);
  const qIndex = parts.findIndex((part) => part === "q" || part === "question");
  if (qIndex === -1) return null;
  const value = Number(parts[qIndex + 1]);
  return Number.isFinite(value) && value > 0 ? value - 1 : null;
}

function assessmentQuestionUrl(assessmentId, questionIndex = 0) {
  return `/assessment/${encodeURIComponent(assessmentId)}/start/q/${Number(questionIndex || 0) + 1}`;
}

function setAssessmentQuestionUrl(assessmentId, questionIndex = 0, replace = false) {
  const url = assessmentQuestionUrl(assessmentId, questionIndex);
  if (window.location.pathname === url) return;
  const method = replace ? "replaceState" : "pushState";
  window.history[method]({ page: "assessment", assessmentId, questionIndex }, "", url);
}

function icon(name, label) {
  return `<i data-lucide="${name}" aria-label="${label || name}"></i>`;
}

function syncIcons() {
  if (window.lucide) window.lucide.createIcons();
}

function setState(patch) {
  state = { ...state, ...patch };
  render();
}

function setActivePage(page, push = true) {
  const validPage = page === "onboarding" || navItems().some(([key]) => key === page);
  const nextPage = validPage ? page : "overview";
  state = { ...state, activePage: nextPage, matchesFiltered: nextPage === "matches" ? state.matchesFiltered : false, message: "", assessmentUiStep: null };
  if (push) {
    window.history.pushState({ page: nextPage }, "", nextPage === "overview" ? "/" : `/${nextPage}`);
  }
  render();
}

function firstName() {
  const name = state.candidate?.name || state.user?.displayName || "there";
  return name.split(" ")[0] || "there";
}

function initials() {
  const name = state.candidate?.name || state.user?.displayName || state.user?.email || "NW";
  return name.split(/[ @.]/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
}

function avatarMarkup(size = "normal") {
  const photoURL = state.candidate?.photoURL || state.user?.photoURL || "";
  const className = size === "large" ? "avatar avatar-large" : "avatar";
  return photoURL
    ? `<img class="${className}" src="${escapeAttr(photoURL)}" alt="${escapeAttr(firstName())}" />`
    : `<div class="${className}">${initials()}</div>`;
}

function escapeAttr(value) {
  return String(value || "").replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

function escapeHtml(value) {
  return String(value || "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
}

function formatDate(value) {
  if (!value) return "Recently";
  const date = value.toDate ? value.toDate() : new Date(value);
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(date);
}

function candidateSkills() {
  const skills = state.candidate?.skills || [];
  if (Array.isArray(skills)) return skills;
  return String(skills).split(",").map((skill) => skill.trim()).filter(Boolean);
}

function normalizeSkillName(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function matchingSkillsForJob(job, skills = candidateSkills()) {
  const role = normalizeRole(job);
  const jobSkills = new Set((role.skills || []).map(normalizeSkillName).filter(Boolean));
  const candidateSkillMap = new Map(skills.map((skill) => [normalizeSkillName(skill), skill]).filter(([key]) => key));
  return [...candidateSkillMap.keys()]
    .filter((skill) => jobSkills.has(skill))
    .map((skill) => candidateSkillMap.get(skill));
}

function otherSkillsText() {
  const otherSkills = state.candidate?.otherSkills || [];
  if (Array.isArray(otherSkills)) return otherSkills.join(", ");
  return String(otherSkills || "");
}

function parseOtherSkills(value) {
  return String(value || "")
    .split(",")
    .map((skill) => skill.trim())
    .filter(Boolean);
}

function isPlaceholderRole(value) {
  return ["Nearwork candidate", "Talent member"].includes(String(value || "").trim());
}

function isProfileComplete() {
  return profileCompletion() >= 100;
}

function dateFromValue(value) {
  if (!value) return null;
  if (value.toDate) return value.toDate();
  if (typeof value === "object" && typeof value.seconds === "number") return new Date(value.seconds * 1000);
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function assessmentStageName(stage) {
  return Number(stage || 1) === 1 ? "Technical Assessment" : "DISC Assessment";
}

function answerValueFor(assessment, question) {
  return assessment?.answers?.[question?.id]?.value ?? assessment?.answers?.[question?.id] ?? "";
}

function isAnsweredValue(value) {
  return value !== undefined && value !== null && value !== "";
}

function stageQuestions(assessment, stage) {
  return (assessment?.questions || []).slice(0, 70).filter((question) => Number(question.stage || 1) === Number(stage));
}

function missedQuestionsForStage(assessment, stage, answers = assessment?.answers || {}) {
  return stageQuestions(assessment, stage).filter((question) => !isAnsweredValue(answers[question.id]?.value ?? answers[question.id]));
}

function candidateHasPipeline() {
  return Boolean((state.applications || []).length || (state.candidate?.pipelineCodes || []).length || state.candidate?.pipelineCode);
}

function selectedLocation() {
  const department = state.candidate?.department || "Bogotá D.C.";
  const cities = locationCatalog[department] || locationCatalog["Bogotá D.C."] || ["Bogotá"];
  const city = state.candidate?.city || state.candidate?.locationCity || cities[0];
  return { department, city, label: `${city}, ${department}` };
}

async function ensureLocationCatalog() {
  try {
    const response = await fetch("/api/locations?ts=" + Date.now(), { cache: "no-store" });
    const data = await response.json();
    if (!response.ok || !data.ok || !data.departments) throw new Error(data.error || "Location API unavailable");
    locationCatalog = data.departments;
  } catch (error) {
    console.warn("Using bundled Colombia locations:", error.message || error);
    locationCatalog = colombiaLocations;
  }
}

function roleOptions() {
  return Object.entries(roleGroups).map(([group, roles]) => `
    <optgroup label="${escapeAttr(group)}">
      ${roles.map((role) => `<option value="${escapeAttr(role)}" ${state.candidate?.targetRole === role || state.candidate?.headline === role ? "selected" : ""}>${role}</option>`).join("")}
    </optgroup>
  `).join("");
}

function selectedRoleGroup() {
  const selectedRole = state.candidate?.targetRole || state.candidate?.headline || "";
  return Object.entries(roleGroups).find(([, roles]) => roles.includes(selectedRole))?.[0] || Object.keys(roleGroups)[0];
}

function roleGroupOptions(selectedGroup) {
  return Object.keys(roleGroups).map((group) => `<option value="${escapeAttr(group)}" ${group === selectedGroup ? "selected" : ""}>${group}</option>`).join("");
}

function roleOptionsForGroup(group, selectedRole) {
  const roles = roleGroups[group] || Object.values(roleGroups).flat();
  return [`<option value="">Choose the closest role</option>`]
    .concat(roles.map((role) => `<option value="${escapeAttr(role)}" ${selectedRole === role ? "selected" : ""}>${role}</option>`))
    .join("");
}

function canonicalSkillName(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  const match = ALL_SKILLS.find((skill) => normalizeSkillName(skill) === normalizeSkillName(raw));
  if (match) return match;
  return raw.split(/\s+/).map((part) => part.length <= 3 && part === part.toUpperCase()
    ? part
    : part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()).join(" ");
}

function skillSearchMarkup(selectedSkills) {
  const selected = [...new Set((selectedSkills || []).map(canonicalSkillName).filter(Boolean))];
  const popular = ["Customer Service", "Salesforce", "HubSpot", "Excel", "Google Sheets", "Technical Support", "Outbound Calls", "React", "SQL", "Payroll"];
  return `
    <div class="skill-search-shell" data-skill-search>
      <div class="selected-skills" id="selectedSkills">
        ${selected.map((skill) => `
          <span class="selected-skill" data-skill-chip="${escapeAttr(skill)}">
            ${escapeHtml(skill)}
            <button type="button" class="skill-remove" data-remove-skill="${escapeAttr(skill)}" aria-label="Remove ${escapeAttr(skill)}">×</button>
            <input type="hidden" name="skills" value="${escapeAttr(skill)}" />
          </span>
        `).join("") || '<span class="skill-empty">Selected skills will appear here.</span>'}
      </div>
      <div class="skill-search-box">
        <input id="skillSearchInput" type="search" autocomplete="off" placeholder="Search skills like Salesforce, payroll, React, B2B sales..." />
        <button class="secondary-action" type="button" id="addTypedSkill">Add skill</button>
      </div>
      <div class="skill-suggestions" id="skillSuggestions">
        ${popular.map((skill) => `<button type="button" class="skill-suggestion" data-skill="${escapeAttr(skill)}">${escapeHtml(skill)}</button>`).join("")}
      </div>
      <p class="field-hint">Search, select, and remove skills anytime. Use as many as apply to your experience.</p>
    </div>
  `;
}

function normalizeSalaryValue(value, currency = "USD") {
  const numeric = Number(String(value || "").replace(/[^\d.]/g, ""));
  const salaryCurrency = String(currency || "USD").toUpperCase() === "COP" ? "COP" : "USD";
  if (!Number.isFinite(numeric) || numeric <= 0) return { salary: "", salaryUSD: null, salaryCurrency, salaryAmount: null };
  const rounded = Math.round(numeric);
  return {
    salary: `${salaryCurrency} ${new Intl.NumberFormat("en-US").format(rounded)}/mo`,
    salaryUSD: salaryCurrency === "USD" ? rounded : null,
    salaryCurrency,
    salaryAmount: rounded
  };
}

function salaryNumberFromInput(value) {
  return Number(String(value || "").replace(/[^\d.]/g, ""));
}

function coerceSalaryCurrency(value, currency = "USD") {
  const amount = salaryNumberFromInput(value);
  const selectedCurrency = String(currency || "USD").toUpperCase() === "COP" ? "COP" : "USD";
  if (selectedCurrency === "USD" && amount >= 100000) return "COP";
  return selectedCurrency;
}

function formatSalaryInputValue(value, currency = "USD") {
  const amount = salaryNumberFromInput(value);
  if (!Number.isFinite(amount) || amount <= 0) return "";
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(Math.round(amount));
}

function normalizeList(value) {
  if (Array.isArray(value)) return value;
  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeRole(job) {
  const skills = normalizeList(job.skills || job.requiredSkills);
  return {
    id: job.id || job.code,
    code: job.code || job.id,
    title: job.title || job.role || job.openingTitle || "Open role",
    orgName: job.orgName || job.company || job.clientName || "Nearwork client",
    location: job.location || "Remote",
    compensation: job.compensation || job.salary || job.rate || "Competitive",
    match: job.match || null,
    skills,
    description: job.description || job.about || "Nearwork is reviewing candidates for this role now."
  };
}

function friendlyAuthError(error) {
  const code = error?.code || "";
  if (code.includes("operation-not-allowed")) return "This sign-in method is not available yet.";
  if (code.includes("unauthorized-domain")) return "This website still needs to be approved for sign-in.";
  if (code.includes("permission-denied")) return "We could not save this yet. Please try again in a moment or contact Nearwork support.";
  if (code.includes("weak-password")) return "Password must be at least 6 characters.";
  if (code.includes("invalid-credential") || code.includes("wrong-password")) return "That email/password did not match. If this account was created with Google, use Continue with Google.";
  if (code.includes("user-not-found")) return "No account exists for that email yet.";
  if (code.includes("email-already-in-use")) return "That email already has an account. Sign in or use Google.";
  if (code.includes("popup")) return "The Google sign-in popup was closed before finishing.";
  return "Something went wrong. Please try again or contact Nearwork support.";
}

function renderShell(content) {
  app.innerHTML = `
    <main class="app-shell">
      <section class="brand-panel">
        <div class="left-bg"></div>
        <div class="left-grid"></div>
        <div class="brand-top">
          <span class="wordmark">Near<span>work</span></span>
          <a href="https://nearwork.co">Back</a>
        </div>
        <div class="brand-copy">
          <h1>Your next great job<br><span>is waiting for you.</span></h1>
          <p>Join Colombian professionals working with top US SaaS companies, earning in USD, working remotely, with full transparency at every stage.</p>
          <div class="stats">
            <div><strong>60%</strong><small>Avg. salary increase</small></div>
            <div><strong>21d</strong><small>Days to first interview</small></div>
            <div><strong>USD</strong><small>Remote roles</small></div>
          </div>
        </div>
        <div class="role-strip">
          <p>Roles we place</p>
          <span>Customer Success</span>
          <span>SDR</span>
          <span>Technical Support</span>
          <span>Marketing Ops</span>
          <span>Operations</span>
        </div>
      </section>
      ${content}
    </main>
  `;
  syncIcons();
}

function renderLogin(mode = "login") {
  const isSignup = mode === "signup";
  renderShell(`
    <section class="auth-panel">
      <div class="right-brand">Near<span>work</span></div>
      <div class="candidate-chip">For candidates</div>
      <div class="panel-heading">
        <h2>${isSignup ? "Create your account." : "Welcome back."}</h2>
        <p>${isSignup ? "Create your profile, browse roles, and track your application." : "Use Google if your candidate account was created with Google."}</p>
      </div>
      ${state.message ? `<div class="notice">${icon("lock")} ${escapeAttr(state.message)}</div>` : ""}
      ${hasFirebaseConfig ? "" : `<div class="notice">${icon("triangle-alert")} Sign-in is still being set up.</div>`}
      <button id="googleSignIn" class="social-action" type="button">
        <span class="google-dot">G</span>
        Continue with Google
      </button>
      <div class="divider"><span></span>or use email<span></span></div>
      <form id="authForm" class="stacked-form">
        ${isSignup ? `<label>Full name<input name="name" type="text" autocomplete="name" placeholder="Full name" required /></label>` : ""}
        <label>Email<input name="email" type="email" autocomplete="email" placeholder="you@example.com" required /></label>
        <label>Password<input name="password" type="password" autocomplete="${isSignup ? "new-password" : "current-password"}" minlength="6" placeholder="••••••••" required /></label>
        ${isSignup ? `
        <div id="consentBlock" style="margin:2px 0 4px;">
          <label style="display:flex;align-items:flex-start;gap:9px;cursor:pointer;font-size:13px;color:#2d2d2d;line-height:1.5;margin-bottom:3px;">
            <input type="checkbox" name="privacyConsent" id="privacyConsent" style="margin-top:3px;flex-shrink:0;accent-color:#16a085;">
            <span>I have read and agree to Nearwork's <a href="https://nearwork.co/privacy" target="_blank" rel="noopener" style="color:#16a085;text-decoration:underline;">Privacy Policy</a> and <a href="https://nearwork.co/terms" target="_blank" rel="noopener" style="color:#16a085;text-decoration:underline;">Terms of Service</a> *</span>
          </label>
          <p id="privacyConsentError" style="display:none;font-size:12px;color:#c0392b;margin:2px 0 6px 27px;">You must accept the Privacy Policy to continue</p>
          <label style="display:flex;align-items:flex-start;gap:9px;cursor:pointer;margin-top:10px;font-size:13px;color:#555;line-height:1.5;">
            <input type="checkbox" name="marketingConsent" id="marketingConsent" style="margin-top:3px;flex-shrink:0;accent-color:#16a085;">
            <span>I agree to receive future job opportunities and updates from Nearwork (optional)</span>
          </label>
        </div>` : ""}
        <button class="primary-action" type="submit">${icon(isSignup ? "user-plus" : "log-in")} ${isSignup ? "Create account" : "Sign in"}</button>
        <p id="formMessage" class="form-message" role="status"></p>
      </form>
      ${isSignup ? "" : `<button id="resetPassword" class="text-action small" type="button">Forgot password?</button>`}
      <button id="toggleMode" class="text-action" type="button">${isSignup ? "Already have an account? Sign in" : "New or invited by Nearwork? Create your profile"}</button>
    </section>
  `);

  document.querySelector("#toggleMode").addEventListener("click", () => renderLogin(isSignup ? "login" : "signup"));
  document.querySelector("#googleSignIn").addEventListener("click", async () => {
    const message = document.querySelector("#formMessage");
    message.textContent = "";
    if (isSignup) {
      const privacyBox = document.querySelector("#privacyConsent");
      const privacyError = document.querySelector("#privacyConsentError");
      if (privacyBox && !privacyBox.checked) {
        if (privacyError) privacyError.style.display = "";
        message.textContent = "Please accept the Privacy Policy to continue.";
        privacyBox.scrollIntoView({ behavior: "smooth", block: "center" });
        return;
      }
      if (privacyError) privacyError.style.display = "none";
    }
    const marketingConsent = isSignup ? (document.querySelector("#marketingConsent")?.checked === true) : false;
    try {
      await signInWithGoogle(marketingConsent);
    } catch (error) {
      message.textContent = friendlyAuthError(error);
    }
  });
  document.querySelector("#resetPassword")?.addEventListener("click", async () => {
    const email = document.querySelector("input[name='email']").value.trim().toLowerCase();
    const message = document.querySelector("#formMessage");
    if (!email) {
      message.textContent = "Enter your email first, then request a reset link.";
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      message.textContent = `Password reset sent to ${email}.`;
    } catch (error) {
      message.textContent = friendlyAuthError(error);
    }
  });
  document.querySelector("#authForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const message = document.querySelector("#formMessage");
    const email = String(form.get("email")).trim().toLowerCase();
    message.textContent = "";
    if (isSignup) {
      const privacyBox = document.querySelector("#privacyConsent");
      const privacyError = document.querySelector("#privacyConsentError");
      if (privacyBox && !privacyBox.checked) {
        if (privacyError) privacyError.style.display = "";
        message.textContent = "Please accept the Privacy Policy to continue.";
        return;
      }
      if (privacyError) privacyError.style.display = "none";
    }
    const marketingConsent = isSignup ? (document.querySelector("#marketingConsent")?.checked === true) : false;
    const consentAt = new Date().toISOString();
    try {
      if (isSignup) {
        const credential = await createUserWithEmailAndPassword(auth, email, form.get("password"));
        await updateProfile(credential.user, { displayName: form.get("name") });
        sessionStorage.setItem("nw_new_account", "1");
        await upsertCandidate(credential.user.uid, {
          name: form.get("name"),
          email,
          availability: "open",
          headline: "Nearwork candidate",
          onboarded: false,
          source: "talent.nearwork.co",
          privacyConsent: true,
          privacyConsentAt: consentAt,
          marketingConsent,
          marketingConsentAt: marketingConsent ? consentAt : null
        });
        sendCandidateAccountCreatedEmail({
          name: form.get("name"),
          firstName: String(form.get("name") || "").trim().split(/\s+/)[0],
          email
        }).catch(() => null);
      } else {
        await signInWithEmailAndPassword(auth, email, form.get("password"));
      }
    } catch (error) {
      message.textContent = friendlyAuthError(error);
    }
  });
}

async function loadDashboard(user) {
  setState({ loading: true, user });
  try {
    await ensureLocationCatalog();
    const [candidateResult, applicationsResult, jobsResult] = await Promise.allSettled([
      getCandidateForAuthUser(user),
      listCandidateApplications(user.uid),
      listOpenJobs()
    ]);
    const candidate = candidateResult.status === "fulfilled" ? candidateResult.value : null;
    const applications = applicationsResult.status === "fulfilled" ? applicationsResult.value : [];
    const jobs = jobsResult.status === "fulfilled" ? jobsResult.value : [];
    let assessments = [];
    try {
      assessments = await listCandidateAssessments(user.uid, user.email, candidate?.candidateCode || candidate?.code || "");
    } catch (error) {
      console.warn(error);
    }
    const directAssessmentId = assessmentIdFromPath();
    if (directAssessmentId && !assessments.some((assessment) => assessment.id === directAssessmentId)) {
      const directAssessment = await getCandidateAssessment(directAssessmentId, user.uid, user.email, candidate?.candidateCode || candidate?.code || "").catch(() => null);
      if (directAssessment) assessments = [directAssessment, ...assessments];
    }
    const isNewAccount = sessionStorage.getItem("nw_new_account") === "1";
    if (isNewAccount) sessionStorage.removeItem("nw_new_account");
    // Show wizard for:
    //  - explicit new-account flag (talent.nearwork.co signup)
    //  - accounts created via jobs.nearwork.co that have no targetRole or onboarded flag yet
    // Skip wizard for existing candidates who already have a complete profile (they
    // just lack the onboarded flag) — silently mark them as onboarded instead.
    const needsWizard = !candidate?.onboarded && !candidate?.targetRole;
    const hasProfile  = !candidate?.onboarded && candidate?.targetRole;
    if (hasProfile) {
      // Existing candidate missing the flag — backfill it silently
      updateCandidateProfile(user.uid, { onboarded: true, candidateCode: candidate?.candidateCode }).catch(() => null);
    }
    const activePage = (isNewAccount || needsWizard) ? "onboarding" : pageFromPath();
    setState({
      candidate: {
        ...(candidate || {}),
        name: candidate?.name || user.displayName || "Talent member",
        email: candidate?.email || user.email,
        availability: candidate?.availability || "open",
        headline: candidate?.headline || candidate?.targetRole || "Nearwork candidate"
      },
      applications,
      assessments,
      jobs: jobs.map(normalizeRole),
      loading: false,
      view: "dashboard",
      activePage,
      message: ""
    });
    if (notificationUnsubscribe) notificationUnsubscribe();
    if (hasFirebaseConfig) {
      notificationUnsubscribe = subscribeToNotifications(user.uid, (notifications) => {
        state.notifications = notifications;
        if (state.view === "dashboard") renderDashboard();
      });
    }
  } catch (error) {
    console.warn(error);
    setState({
      candidate: {
        name: user.displayName || "Talent member",
        email: user.email,
        availability: "open",
        headline: "Nearwork candidate"
      },
      applications: [],
      assessments: [],
      jobs: [],
      loading: false,
      view: "dashboard",
      activePage: pageFromPath(),
      message: ""
    });
  }
}

async function loadPublicPage() {
  const activePage = pageFromPath();
  if (activePage === "assessment") {
    sessionStorage.setItem("nw_restore_path", window.location.pathname);
    setState({
      user: null,
      candidate: null,
      applications: [],
      assessments: [],
      jobs: [],
      loading: false,
      view: "login",
      activePage: "overview",
      message: "Please log in to open your assessment."
    });
    return;
  }
  if (activePage === "overview") {
    if (notificationUnsubscribe) notificationUnsubscribe();
    notificationUnsubscribe = null;
    setState({ user: null, candidate: null, loading: false, view: "login", activePage: "overview" });
    return;
  }

  let jobs = [];
  try {
    const openings = await listOpenJobs();
    if (openings.length) jobs = openings.map(normalizeRole);
  } catch (error) {
    console.warn(error);
  }

  setState({
    user: null,
    candidate: null,
    applications: [],
    assessments: [],
    jobs,
    loading: false,
    view: "login",
    activePage: "overview",
    message: "Please log in to view your profile, matched openings, applications, and assessments."
  });
}

function renderDashboard() {
  const unreadNotifications = (state.notifications || []).filter((item) => !item.read).length;
  app.innerHTML = `
    <main class="dashboard">
      <aside class="sidebar">
        <div class="brand-top"><button class="wordmark wordmark-button" type="button" data-dashboard-home>Near<span>work</span></button></div>
        <div class="candidate-card">
          ${avatarMarkup()}
          <strong>${state.candidate?.name || state.user?.displayName || "Talent member"}</strong>
          <span>${state.candidate?.headline || state.candidate?.targetRole || "Nearwork candidate"}</span>
        </div>
        <nav>
          ${navItems().map(([key, iconName, label]) => `
            <button class="${state.activePage === key ? "active" : ""}" data-page="${key}">${icon(iconName)} ${label}</button>
          `).join("")}
          <a class="sidebar-jobs-link" href="https://jobs.nearwork.co" target="_blank" rel="noreferrer">${icon("external-link")} Browse Jobs</a>
        </nav>
        <button id="${state.user ? "signOut" : "signIn"}" class="ghost-action">${icon(state.user ? "log-out" : "log-in")} ${state.user ? "Sign out" : "Sign in"}</button>
      </aside>
      <section class="workspace">
        <header class="topbar">
          <div><p class="eyebrow">Candidate workspace</p><h1>${pageTitle()}</h1></div>
          <div class="topbar-actions">
            <div class="notification-wrap">
              <button class="icon-action" type="button" id="notificationBell" aria-label="Notifications">${icon("bell")}${unreadNotifications ? `<span>${unreadNotifications}</span>` : ""}</button>
              ${state.notificationPanelOpen ? renderNotificationPanel() : ""}
            </div>
            <button class="icon-action" type="button" id="notificationSettings" aria-label="Notification settings">${icon("settings")}</button>
            <label class="availability">Availability
              <select id="availability">
                ${["open", "interviewing", "paused"].map((value) => `<option value="${value}" ${state.candidate?.availability === value ? "selected" : ""}>${value}</option>`).join("")}
              </select>
            </label>
          </div>
        </header>
        ${state.notificationSettingsOpen ? renderNotificationSettings() : ""}
        ${state.message ? `<div class="notice">${state.message}</div>` : ""}
        ${(() => { try { return renderActivePage(); } catch (err) { console.error("renderActivePage error:", err); return `<div class="notice">Page failed to render. <button type="button" data-page="overview">Go to overview</button></div>`; } })()}
      </section>
    </main>
  `;
  syncIcons();
  bindDashboardEvents();
  syncAssessmentRouteToActive();
  setupAssessmentTimer();
}

function notificationTime(value) {
  const date = value?.toDate ? value.toDate() : new Date(value || Date.now());
  return date.toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });
}

function renderNotificationPanel() {
  const items = (state.notifications || []).slice(0, 10);
  return `
    <div class="notification-panel">
      <div class="notification-panel-head"><strong>Notifications</strong><span>${items.length ? "Latest updates" : "All clear"}</span></div>
      ${items.length ? items.map((item) => `
        <button class="notification-item ${item.read ? "" : "unread"}" type="button" data-notification-read="${item.id}">
          <strong>${escapeAttr(item.title || "Nearwork update")}</strong>
          <span>${escapeAttr(item.message || "")}</span>
          <time>${notificationTime(item.createdAt)}</time>
        </button>
      `).join("") : `<div class="notification-empty">No notifications yet.</div>`}
    </div>
  `;
}

function renderNotificationSettings() {
  const preferences = state.candidate?.notificationPreferences || {};
  const rows = [
    ["recruitmentUpdates", "Recruitment updates"],
    ["assessmentUpdates", "Assessment updates"],
    ["mentions", "Mentions"],
    ["openingMovement", "Opening movement"],
    ["jobAlerts", "Similar role alerts"]
  ];
  return `
    <section class="notification-settings-card">
      <div class="section-heading"><div><p class="eyebrow">Settings</p><h2>Notification preferences</h2></div></div>
      <div class="notification-settings-grid">
        ${rows.map(([key, label]) => {
          const pref = preferences[key] || {};
          return `<div class="notification-setting-row">
            <strong>${label}</strong>
            <label><input type="checkbox" data-notification-pref="${key}" data-channel="app" ${pref.app !== false ? "checked" : ""}> In-app</label>
            <label><input type="checkbox" data-notification-pref="${key}" data-channel="email" ${pref.email !== false ? "checked" : ""}> Email</label>
          </div>`;
        }).join("")}
      </div>
      <p class="field-hint">Email notifications are grouped with a 2-hour buffer. The bell always keeps the detailed history with date and time.</p>
    </section>
  `;
}

let assessmentTimerInterval = null;

function setupAssessmentTimer() {
  if (assessmentTimerInterval) window.clearInterval(assessmentTimerInterval);
  const timer = document.querySelector("#assessmentTimer");
  if (!timer) return;
  const endTime = new Date(timer.dataset.end || "").getTime();
  const updateTimer = () => {
    const remaining = Math.max(0, endTime - Date.now());
    const totalSeconds = Math.floor(remaining / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = String(totalSeconds % 60).padStart(2, "0");
    timer.textContent = `${minutes}:${seconds}`;
    timer.classList.toggle("is-low", remaining <= 10 * 60 * 1000);
    if (remaining <= 0) window.clearInterval(assessmentTimerInterval);
  };
  updateTimer();
  assessmentTimerInterval = window.setInterval(updateTimer, 1000);
}

function syncAssessmentRouteToActive() {
  if (state.activePage !== "assessment") return;
  const assessments = state.assessments || [];
  const directId = assessmentIdFromPath();
  const directAssessment = directId ? assessments.find((assessment) => assessment.id === directId) : null;
  const activeAssessment = directAssessment || assessments.find((assessment) => ["sent", "started"].includes(String(assessment.status || "").toLowerCase()));
  if (!activeAssessment?.id) return;
  const status = String(activeAssessment.status || "").toLowerCase();
  if (status === "started" && assessmentQuestionIndexFromPath() === null) {
    setAssessmentQuestionUrl(activeAssessment.id, Number(activeAssessment.currentQuestionIndex || 0), true);
    return;
  }
  if (!directId && status === "sent") {
    const url = `/assessment/${encodeURIComponent(activeAssessment.id)}/start`;
    window.history.replaceState({ page: "assessment", assessmentId: activeAssessment.id }, "", url);
  }
}

function pageTitle() {
  const map = {
    onboarding: "Complete your candidate profile",
    overview: `Hi ${firstName()}, here's your process`,
    matches: "Role matches",
    applications: "Application pipeline",
    assessment: "Assessment center",
    cvs: "CV picker",
    tips: "Interview tips",
    recruiter: "Your recruiter",
    profile: "Candidate profile"
  };
  return map[state.activePage] || "Talent";
}

function renderActivePage() {
  const pages = {
    onboarding: renderOnboarding,
    overview: renderOverview,
    matches: renderMatches,
    applications: renderApplications,
    assessment: renderAssessment,
    cvs: renderCvs,
    tips: renderTips,
    recruiter: renderRecruiter,
    profile: renderProfile
  };
  return (pages[state.activePage] || renderOverview)();
}

function renderOverview() {
  const complete = isProfileComplete();
  const hasPipeline = candidateHasPipeline();
  const activeOpenings = state.jobs.length;
  return `
    ${complete ? "" : `
      <section class="hero-card">
        <div><p class="eyebrow">Action needed</p><h2>Finish your profile to unlock matches.</h2><p>Add your role, city, salary, and skills so Nearwork can match you to the right openings.</p></div>
        <button class="primary-action fit" type="button" data-page="profile">${icon("arrow-right")} Complete profile</button>
      </section>
    `}
    <section class="summary-grid">
      ${metricCard("Profile readiness", `${profileCompletion()}%`, "sparkles")}
      ${metricCard("Open roles", activeOpenings, "briefcase-business")}
      ${metricCard("Applications", state.applications.length, "send")}
      ${metricCard("CVs saved", (state.candidate?.cvLibrary || []).length, "files")}
    </section>
    <section class="content-grid">
      <div class="section-block"><div class="section-heading"><div><p class="eyebrow">Now</p><h2>${hasPipeline ? "Talent pipeline" : "Find your next opening"}</h2></div></div>${hasPipeline ? pipelineView(currentStage()) : noPipelineView()}</div>
      <div class="section-block compact"><div class="section-heading"><div><p class="eyebrow">Recruiter</p><h2>Need help?</h2></div></div>${recruiterCard()}</div>
    </section>
  `;
}

function renderOnboarding() {
  _onbStep = 1;
  // Pre-populate from any data already collected (e.g. from jobs.nearwork.co account creation)
  // so the candidate doesn't have to re-enter what they've already provided.
  const c = state.candidate || {};
  _onbData = {
    roleGroup:  c.roleGroup  || "",
    targetRole: c.targetRole || "",
    department: c.department || c.locationDepartment || "",
    city:       c.city       || c.locationCity       || "",
    salary:     String(c.salaryAmount || c.salary || ""),
    english:    c.english    || "",
    name:       c.name       || "",
    whatsapp:   c.whatsapp   || c.phone              || "",
    linkedin:   c.linkedin   || "",
  };
  _onbCvFile = null; _onbParsePromise = null; _onbParsed = null;
  return `<div id="onboardingWizard" class="onb-shell"></div>`;
}

// ─── Onboarding wizard ────────────────────────────────────────────────────────

function bindOnboardingWizardEvents() {
  if (!document.querySelector("#onboardingWizard")) return;
  _onbRender(_onbStep);
}

function _onbRender(step) {
  _onbStep = step;
  const el = document.querySelector("#onboardingWizard");
  if (!el) return;
  el.innerHTML = _onbStepHtml(step);
  _onbBindStep(step);
}

function _onbProgress(step) {
  const total = 4;
  return `
    <div style="display:flex;align-items:center;gap:5px;margin-bottom:28px;">
      ${Array.from({ length: total }, (_, i) => `
        <div style="height:5px;border-radius:3px;flex:${i < step ? 2 : 1};background:${i < step ? "var(--green)" : "var(--border)"};transition:all .3s;"></div>
      `).join("")}
      <span style="margin-left:6px;font-size:11px;font-weight:600;color:var(--light);white-space:nowrap;">${step <= total ? `${step} / ${total}` : "Review"}</span>
    </div>`;
}

function _onbField(label, optional, input) {
  return `<label style="display:flex;flex-direction:column;gap:5px;font-size:11px;font-weight:600;letter-spacing:.07em;text-transform:uppercase;color:var(--light);">${label}${optional ? `<span style="font-weight:400;font-size:10px;text-transform:none;letter-spacing:0;opacity:.7;">(optional)</span>` : ""} ${input}</label>`;
}

function _onbInput(id, type, value, placeholder, extra = "") {
  return `<input id="${id}" type="${type}" value="${escapeAttr(value || "")}" placeholder="${escapeAttr(placeholder)}" ${extra} style="font-size:14px;padding:10px 12px;border:1.5px solid var(--border);border-radius:8px;background:#fff;outline:none;width:100%;box-sizing:border-box;" />`;
}

function _onbSelect(id, options, selected) {
  const opts = options.map(([val, label]) => `<option value="${escapeAttr(val)}" ${val === selected ? "selected" : ""}>${escapeHtml(label)}</option>`).join("");
  return `<select id="${id}" style="font-size:14px;padding:10px 12px;border:1.5px solid var(--border);border-radius:8px;background:#fff;outline:none;width:100%;box-sizing:border-box;">${opts}</select>`;
}

function _onbActions(backStep, nextLabel) {
  return `<div style="display:flex;justify-content:space-between;align-items:center;margin-top:28px;">
    ${backStep ? `<button type="button" id="onbBack" class="secondary-action">← Back</button>` : `<span></span>`}
    <button type="button" id="onbNext" class="primary-action">${nextLabel || "Continue →"}</button>
  </div>`;
}

function _onbStepHtml(step) {
  const d = _onbData;
  switch (step) {

    // ── Step 1: CV ────────────────────────────────────────────────────────────
    case 1: {
      const hasFile = Boolean(_onbCvFile);
      return `
        <div class="onb-step">
          ${_onbProgress(1)}
          <p class="eyebrow">Step 1 · Your CV</p>
          <h2 class="onb-heading">Upload your CV to get started</h2>
          <p class="onb-sub">We'll extract your experience, skills, and contact info automatically — so you don't have to type it all out.</p>
          <div class="upload-box" style="margin-bottom:4px;">
            <input id="onbCvInput" type="file" accept=".pdf,.doc,.docx" />
            <p style="font-size:11px;color:var(--light);margin:6px 0 0;text-align:center;">PDF or Word · max 10 MB</p>
          </div>
          <p id="onbCvStatus" style="font-size:12px;color:var(--green);min-height:18px;margin:4px 0 0;">${hasFile ? `✓ ${escapeHtml(_onbCvFile.name)}` : ""}</p>
          <div style="display:flex;justify-content:space-between;align-items:center;margin-top:24px;">
            <button type="button" id="onbSkipCv" style="background:none;border:none;font-size:13px;color:var(--light);cursor:pointer;text-decoration:underline;padding:0;">Skip — I'll fill in manually</button>
            <button type="button" id="onbNext" class="primary-action" ${hasFile ? "" : "disabled"}>Continue →</button>
          </div>
        </div>`;
    }

    // ── Step 2: Role ──────────────────────────────────────────────────────────
    case 2: {
      const rg = d.roleGroup || Object.keys(roleGroups)[0] || "";
      return `
        <div class="onb-step">
          ${_onbProgress(2)}
          <p class="eyebrow">Step 2 · Role</p>
          <h2 class="onb-heading">What role are you looking for?</h2>
          <p class="onb-sub">We use this to match you with the right openings from our clients.</p>
          <div style="display:grid;gap:12px;margin-bottom:4px;">
            ${_onbField("Area", false, `<select id="onbRoleGroup" style="font-size:14px;padding:10px 12px;border:1.5px solid var(--border);border-radius:8px;background:#fff;outline:none;">${roleGroupOptions(rg)}</select>`)}
            ${_onbField("Role", false, `<select id="onbTargetRole" style="font-size:14px;padding:10px 12px;border:1.5px solid var(--border);border-radius:8px;background:#fff;outline:none;">${roleOptionsForGroup(rg, d.targetRole || "")}</select>`)}
          </div>
          ${_onbActions(1)}
        </div>`;
    }

    // ── Step 3: Location + compensation ───────────────────────────────────────
    case 3: {
      const dept  = d.department || Object.keys(locationCatalog)[0] || "";
      const cities = locationCatalog[dept] || [];
      return `
        <div class="onb-step">
          ${_onbProgress(3)}
          <p class="eyebrow">Step 3 · Location & compensation</p>
          <h2 class="onb-heading">Where are you based?</h2>
          <p class="onb-sub">This helps us narrow down roles by location and align on salary expectations.</p>
          <div style="display:grid;gap:12px;margin-bottom:4px;">
            ${_onbField("Department", false, `<select id="onbDept" style="font-size:14px;padding:10px 12px;border:1.5px solid var(--border);border-radius:8px;background:#fff;outline:none;">${Object.keys(locationCatalog).map((dep) => `<option value="${escapeAttr(dep)}" ${dep === dept ? "selected" : ""}>${escapeHtml(dep)}</option>`).join("")}</select>`)}
            ${_onbField("City", false, `<select id="onbCity" style="font-size:14px;padding:10px 12px;border:1.5px solid var(--border);border-radius:8px;background:#fff;outline:none;">${cities.map((c) => `<option value="${escapeAttr(c)}" ${c === d.city ? "selected" : ""}>${escapeHtml(c)}</option>`).join("")}</select>`)}
            ${_onbField("Target monthly salary (USD)", true, _onbInput("onbSalary", "number", d.salary || "", "e.g. 2000", 'min="0"'))}
            ${_onbField("English level", false, `<select id="onbEnglish" style="font-size:14px;padding:10px 12px;border:1.5px solid var(--border);border-radius:8px;background:#fff;outline:none;">${["", "B1", "B2", "C1", "C2", "Native"].map((l) => `<option value="${l}" ${l === d.english ? "selected" : ""}>${l || "Select level"}</option>`).join("")}</select>`)}
          </div>
          ${_onbActions(2)}
        </div>`;
    }

    // ── Step 4: Contact + name ────────────────────────────────────────────────
    case 4: {
      const defaultName = d.name || state.candidate?.name || state.user?.displayName || "";
      const defaultPhone = d.whatsapp || (_onbParsed?.phone ?? "");
      return `
        <div class="onb-step">
          ${_onbProgress(4)}
          <p class="eyebrow">Step 4 · Contact</p>
          <h2 class="onb-heading">How can we reach you?</h2>
          <p class="onb-sub">Your WhatsApp number is how our recruiters will contact you directly.</p>
          <div style="display:grid;gap:12px;margin-bottom:4px;">
            ${_onbField("Full name", false, _onbInput("onbName", "text", defaultName, "Your full name", 'autocomplete="name"'))}
            ${_onbField("WhatsApp number", false, _onbInput("onbWhatsapp", "tel", defaultPhone, "+57 300 123 4567", 'autocomplete="tel"'))}
            ${_onbField("LinkedIn", true, _onbInput("onbLinkedin", "url", d.linkedin || "", "https://linkedin.com/in/...", ""))}
          </div>
          <p id="onbContactError" style="font-size:12px;color:#e74c3c;min-height:16px;margin:4px 0 0;"></p>
          ${_onbActions(3, "Review →")}
        </div>`;
    }

    // ── Review ────────────────────────────────────────────────────────────────
    case 5: return _onbReviewHtml();

    default: return "";
  }
}

function _onbReviewHtml() {
  const d = _onbData;
  const p = _onbParsed || {};
  const name     = d.name     || p.name     || state.candidate?.name || "—";
  const role     = d.targetRole || "—";
  const location = [d.city, d.department].filter(Boolean).join(", ") || "—";
  const salary   = d.salary   ? `USD ${Number(d.salary).toLocaleString()}/mo` : "—";
  const english  = d.english  || "—";
  const whatsapp = d.whatsapp || "—";
  const skills   = p.skills   || [];
  const work     = p.workHistory || [];
  const cvName   = _onbCvFile?.name || "";

  const row = (label, value) => !value || value === "—" ? "" : `
    <div style="display:flex;gap:16px;padding:10px 0;border-bottom:1px solid var(--border);">
      <span style="width:110px;flex-shrink:0;font-size:10px;font-weight:700;letter-spacing:.07em;text-transform:uppercase;color:var(--light);padding-top:3px;">${label}</span>
      <span style="font-size:13px;color:var(--black);line-height:1.5;">${escapeHtml(String(value))}</span>
    </div>`;

  return `
    <div class="onb-step">
      <p class="eyebrow" style="color:var(--green);">Almost done</p>
      <h2 class="onb-heading">Does this look right?</h2>
      <p class="onb-sub" style="margin-bottom:20px;">Review your profile before we save it. You can always update it later from Settings.</p>
      <div style="border:1.5px solid var(--border);border-radius:12px;padding:2px 16px 2px;margin-bottom:24px;">
        ${row("Name",     name)}
        ${row("Role",     role)}
        ${row("Location", location)}
        ${row("Salary",   salary)}
        ${row("English",  english)}
        ${row("WhatsApp", whatsapp)}
        ${cvName ? row("CV", cvName) : ""}
        ${skills.length ? `
          <div style="display:flex;gap:16px;padding:10px 0;border-bottom:1px solid var(--border);">
            <span style="width:110px;flex-shrink:0;font-size:10px;font-weight:700;letter-spacing:.07em;text-transform:uppercase;color:var(--light);padding-top:6px;">Skills</span>
            <div style="display:flex;flex-wrap:wrap;gap:4px;">
              ${skills.slice(0, 12).map((s) => `<span style="background:var(--bg);border:1px solid var(--border);border-radius:999px;padding:3px 10px;font-size:11px;color:var(--mid);">${escapeHtml(s)}</span>`).join("")}
              ${skills.length > 12 ? `<span style="font-size:11px;color:var(--light);padding:4px 6px;">+${skills.length - 12} more</span>` : ""}
            </div>
          </div>` : ""}
        ${work.length ? `
          <div style="display:flex;gap:16px;padding:10px 0;">
            <span style="width:110px;flex-shrink:0;font-size:10px;font-weight:700;letter-spacing:.07em;text-transform:uppercase;color:var(--light);padding-top:4px;">Experience</span>
            <div style="display:flex;flex-direction:column;gap:8px;">
              ${work.map((w) => `
                <div>
                  <p style="font-size:13px;font-weight:600;color:var(--black);margin:0;">${escapeHtml(w.title || "—")}</p>
                  <p style="font-size:12px;color:var(--mid);margin:2px 0 0;">${escapeHtml(w.company || "")}${w.from ? ` · ${w.from} → ${w.to === "present" ? "Present" : w.to || "?"}` : ""}</p>
                </div>`).join("")}
            </div>
          </div>` : ""}
      </div>
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <button type="button" id="onbEdit" class="secondary-action">← Edit</button>
        <button type="button" id="onbFinish" class="primary-action">${icon("check")} Finish setup</button>
      </div>
      <p id="onbFinishErr" style="font-size:12px;color:#e74c3c;text-align:right;min-height:18px;margin-top:6px;"></p>
    </div>`;
}

function _onbBindStep(step) {
  const back = document.querySelector("#onbBack");
  const next = document.querySelector("#onbNext");
  back?.addEventListener("click", () => _onbRender(step - 1));

  switch (step) {

    case 1: {
      const cvInput = document.querySelector("#onbCvInput");
      const status  = document.querySelector("#onbCvStatus");
      const skipBtn = document.querySelector("#onbSkipCv");

      // Restore previously selected file display
      if (_onbCvFile && cvInput) next.disabled = false;

      cvInput?.addEventListener("change", () => {
        const file = cvInput.files?.[0];
        if (!file) return;
        _onbCvFile = file;
        if (status) status.textContent = `✓ ${file.name}`;
        next.disabled = false;
        // Kick off Affinda in background immediately
        _onbParsed = null;
        _onbParsePromise = parseCvWithAffinda(file).catch(() => null);
      });

      next?.addEventListener("click", () => _onbRender(2));
      skipBtn?.addEventListener("click", () => { _onbCvFile = null; _onbParsePromise = null; _onbRender(2); });
      break;
    }

    case 2: {
      const rgSel  = document.querySelector("#onbRoleGroup");
      const roleSel = document.querySelector("#onbTargetRole");
      rgSel?.addEventListener("change", () => {
        roleSel.innerHTML = roleOptionsForGroup(rgSel.value, "");
      });
      next?.addEventListener("click", () => {
        _onbData.roleGroup  = rgSel?.value  || "";
        _onbData.targetRole = roleSel?.value || "";
        _onbRender(3);
      });
      break;
    }

    case 3: {
      const deptSel = document.querySelector("#onbDept");
      const citySel = document.querySelector("#onbCity");
      deptSel?.addEventListener("change", () => {
        const cities = locationCatalog[deptSel.value] || [];
        citySel.innerHTML = cities.map((c) => `<option value="${escapeAttr(c)}">${escapeHtml(c)}</option>`).join("");
      });
      next?.addEventListener("click", () => {
        _onbData.department = deptSel?.value || "";
        _onbData.city       = citySel?.value || "";
        _onbData.salary     = document.querySelector("#onbSalary")?.value || "";
        _onbData.english    = document.querySelector("#onbEnglish")?.value || "";
        _onbRender(4);
      });
      break;
    }

    case 4: {
      next?.addEventListener("click", () => {
        const name     = document.querySelector("#onbName")?.value.trim();
        const whatsapp = document.querySelector("#onbWhatsapp")?.value.trim();
        const errEl    = document.querySelector("#onbContactError");
        if (!whatsapp) {
          if (errEl) errEl.textContent = "WhatsApp number is required.";
          document.querySelector("#onbWhatsapp")?.focus();
          return;
        }
        _onbData.name     = name;
        _onbData.whatsapp = whatsapp;
        _onbData.linkedin = document.querySelector("#onbLinkedin")?.value.trim() || "";
        _onbGoToReview();
      });
      break;
    }

    case 5: {
      document.querySelector("#onbEdit")?.addEventListener("click", () => _onbRender(1));
      document.querySelector("#onbFinish")?.addEventListener("click", _onbFinish);
      break;
    }
  }
}

async function _onbGoToReview() {
  const el = document.querySelector("#onboardingWizard");
  if (!el) return;
  // Show "Finalising…" while we wait for Affinda if it's still in flight
  if (_onbParsePromise && !_onbParsed) {
    el.innerHTML = `<div class="onb-step"><p style="text-align:center;font-size:14px;font-weight:600;color:var(--green);padding:56px 0;">Finalising your profile…</p></div>`;
    _onbParsed = await _onbParsePromise;
  }
  // Merge Affinda data that wasn't explicitly entered
  if (_onbParsed?.phone && !_onbData.whatsapp) _onbData.whatsapp = _onbParsed.phone;
  if (_onbParsed?.name  && !_onbData.name)     _onbData.name     = _onbParsed.name;
  _onbRender(5);
}

async function _onbFinish() {
  const finishBtn = document.querySelector("#onbFinish");
  const errEl     = document.querySelector("#onbFinishErr");
  if (finishBtn) { finishBtn.disabled = true; finishBtn.innerHTML = "Saving…"; }

  try {
    const d   = _onbData;
    const p   = _onbParsed || {};
    const uid = state.user?.uid;
    if (!uid) throw new Error("Not signed in");

    const sal  = normalizeSalaryValue(d.salary || "", "USD");
    const dept = d.department || "";
    const city = d.city || "";

    // Upload CV (non-blocking — failure doesn't stop save)
    let cvFields = {};
    if (_onbCvFile) {
      try {
        const cv = await uploadCandidateCv(uid, _onbCvFile, "");
        cvFields = { activeCvId: cv.id, activeCvName: cv.name || cv.fileName, cvUrl: cv.url, cvLibrary: [cv] };
      } catch { /* ignore */ }
    }

    const profileData = {
      name:                  d.name || p.name || state.candidate?.name || state.user?.displayName || "",
      targetRole:            d.targetRole || "",
      headline:              d.targetRole || "",
      department:            dept,
      city,
      location:              [city, dept].filter(Boolean).join(", "),
      locationCity:          city,
      locationDepartment:    dept,
      locationCountry:       "Colombia",
      locationId:            `${String(city).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-")}-co`,
      english:               d.english || "",
      salary:                sal.salary,
      salaryUSD:             sal.salaryUSD,
      salaryAmount:          sal.salaryAmount,
      salaryCurrency:        "USD",
      expectedSalaryAmount:  sal.salaryAmount,
      expectedSalaryCurrency:"USD",
      whatsapp:              d.whatsapp || "",
      phone:                 d.whatsapp || "",
      linkedin:              d.linkedin || "",
      skills:                [...new Set((p.skills || []).map(canonicalSkillName).filter(Boolean))],
      workHistory:           p.workHistory || [],
      summary:               p.summary    || "",
      email:                 state.candidate?.email || state.user?.email || "",
      candidateCode:         state.candidate?.candidateCode,
      marketingConsent:      state.candidate?.marketingConsent === true,
      availability:          "open",
      onboarded:             true,
      ...cvFields,
    };

    await updateCandidateProfile(uid, profileData);
    window.history.pushState({ page: "overview" }, "", "/");
    setState({ candidate: { ...state.candidate, ...profileData }, activePage: "overview", message: "Welcome to Nearwork! Your profile is ready." });
  } catch {
    if (errEl)     errEl.textContent = "Something went wrong. Please try again.";
    if (finishBtn) { finishBtn.disabled = false; finishBtn.innerHTML = `${icon("check")} Finish setup`; }
  }
}

function renderMatches() {
  const preferredRole = state.candidate?.targetRole || (!isPlaceholderRole(state.candidate?.headline) ? state.candidate?.headline : "");
  const skills = candidateSkills();
  const filteredJobs = state.jobs.map(normalizeRole).filter((job) => matchingSkillsForJob(job, skills).length >= 3);
  const canFilter = skills.length >= 3;
  const visibleJobs = state.matchesFiltered && canFilter ? filteredJobs : state.jobs.map(normalizeRole);
  const filteredEmpty = state.matchesFiltered && !filteredJobs.length;
  return `
    <section class="section-block">
      <div class="section-heading">
        <div><p class="eyebrow">Openings</p><h2>${state.matchesFiltered ? "Best fit from your profile" : "All current openings"}</h2></div>
        <button id="filterMatches" class="secondary-action" type="button">${icon(state.matchesFiltered ? "list" : "filter")} ${state.matchesFiltered ? "Show all openings" : "Filter by my role & skills"}</button>
      </div>
      <div class="match-note"><strong>${visibleJobs.length}</strong> of <strong>${state.jobs.length}</strong> openings showing. Matches require <strong>3+ shared skills</strong>. Role: <strong>${preferredRole || "not set"}</strong>. Skills: <strong>${skills.join(", ") || "not set"}</strong>.</div>
      <div class="job-list">${filteredEmpty ? emptyState("No filtered matches yet", "Add a target role and skills in Profile to improve matching.") : visibleJobs.map((job) => jobCard(job)).join("")}</div>
    </section>
  `;
}

function renderApplications() {
  const hasPipeline = candidateHasPipeline();
  return `
    <section class="section-block">
      <div class="section-heading"><div><p class="eyebrow">Pipeline</p><h2>Your applications</h2></div></div>
      ${hasPipeline ? pipelineView(currentStage()) : noPipelineView()}
      <div class="timeline page-gap">${state.applications.length ? state.applications.map(applicationCard).join("") : emptyState("No applications yet", "Apply to a role and your process will show here.")}</div>
    </section>
  `;
}

function renderAssessment() {
  const directId = assessmentIdFromPath();
  const assessments = state.assessments || [];
  const assignedAssessments = assessments.filter((a) => ["sent", "started"].includes(String(a.status || "").toLowerCase()));
  const completedAssessments = assessments.filter((a) => String(a.status || "").toLowerCase() === "completed");
  const activeAssessment = directId
    ? assessments.find((a) => a.id === directId)
    : assignedAssessments[0] || completedAssessments[0] || null;

  // Tech intro step
  if (state.assessmentUiStep === "techIntro" && activeAssessment) {
    return renderAssessmentTechIntro(activeAssessment);
  }
  // DISC intro step
  if (state.assessmentUiStep === "discIntro" && activeAssessment) {
    return renderAssessmentDiscIntro(activeAssessment);
  }

  // Error: direct link but no matching assessment
  if (directId && !activeAssessment) {
    return `
      <div class="nw-assess-wrap nw-assess-state-page">
        <div class="nw-assess-state-card">
          <div class="nw-assess-state-icon" style="background:#FEF0F5;color:#CC3666">${icon("link-2-off")}</div>
          <strong>This link isn't available</strong>
          <p>Make sure you're logged into the same account that received the assessment email. If the problem persists, reach out to your Nearwork recruiter.</p>
          <button class="primary-action fit" data-page="recruiter" type="button">${icon("message-circle")} Contact support</button>
        </div>
      </div>
    `;
  }

  // Not assigned yet
  if (!activeAssessment) {
    return `
      <div class="nw-assess-wrap nw-assess-state-page">
        <div class="nw-assess-state-card">
          <div class="nw-assess-state-icon">${icon("inbox")}</div>
          <strong>No assessment assigned yet</strong>
          <p>Your assessment will appear here when Nearwork sends it. You'll receive an email notification when it's ready.</p>
          <div class="nw-assess-info-row">
            <div class="nw-assess-info-item">${icon("shield-check")}<span>One attempt</span></div>
            <div class="nw-assess-info-item">${icon("timer")}<span>~45–90 min</span></div>
            <div class="nw-assess-info-item">${icon("users")}<span>Recruiter reviewed</span></div>
          </div>
        </div>
      </div>
    `;
  }

  // Active assessment
  const questions = Array.isArray(activeAssessment.questions) ? activeAssessment.questions : [];
  const started = String(activeAssessment.status || "").toLowerCase() === "started";
  const completed = String(activeAssessment.status || "").toLowerCase() === "completed";
  const cancelled = String(activeAssessment.status || "").toLowerCase() === "cancelled";
  const expired = isAssessmentExpired(activeAssessment);
  const urlIndex = assessmentQuestionIndexFromPath();
  const savedIndex = Number(activeAssessment.currentQuestionIndex || 0);
  const currentIndex = Math.min(urlIndex ?? savedIndex, Math.max(questions.length - 1, 0));
  const currentQuestion = questions[currentIndex];
  const currentStage = currentQuestion?.stage || activeAssessment.currentStage || 1;
  const showChrome = started && !completed && !cancelled && !expired;

  return `
    <div class="nw-assess-wrap">
      ${showChrome
        ? renderAssessmentTimer(activeAssessment, currentStage, currentIndex, questions)
        : renderAssessmentChromeSimple(activeAssessment)}
      ${showChrome ? renderAssessmentProgress(activeAssessment, currentIndex) : ""}
      <div class="nw-assess-body" id="assessmentWorkspace">
        ${completed
          ? renderAssessmentResult(activeAssessment)
          : cancelled
          ? `<div class="nw-assess-state-card nw-assess-state-card--inline"><div class="nw-assess-state-icon" style="background:#F5F4F0;color:#555">${icon("ban")}</div><strong>Assessment cancelled</strong><p>This assessment is no longer available. A new assigned assessment will appear here when your recruiter sends one.</p></div>`
          : expired
          ? `<div class="nw-assess-state-card nw-assess-state-card--inline"><div class="nw-assess-state-icon" style="background:#FEF0F5;color:#CC3666">${icon("clock-x")}</div><strong>Assessment link expired</strong><p>This unique assessment link is no longer valid. Contact your Nearwork recruiter if you need a new one.</p><button class="ghost-action" data-page="recruiter" type="button">${icon("message-circle")} Contact recruiter</button></div>`
          : renderAssessmentQuestions(activeAssessment, started, currentIndex)}
      </div>
      ${renderAssessmentHistory(assessments, activeAssessment.id)}
    </div>
  `;
}

function renderAssessmentChromeSimple(assessment) {
  const statusText = String(assessment.status || "").toLowerCase();
  return `
    <div class="nw-assess-chrome">
      <div class="nw-assess-chrome__logo">
        <div class="nw-assess-chrome__logotile">N</div>
        <span class="nw-assess-chrome__brand">Nearwork</span>
        <div class="nw-assess-chrome__divider"></div>
        <span class="nw-assess-chrome__sub">Candidate assessment</span>
      </div>
      <div style="flex:1"></div>
      ${!["completed", "cancelled"].includes(statusText) ? `<button class="nw-assess-chrome__exit" type="button">${icon("x")} Save &amp; exit</button>` : ""}
    </div>
  `;
}

function renderAssessmentProgress(assessment, currentIndex) {
  const questions = (assessment.questions || []).slice(0, 70);
  const technicalAnswered = stageQuestions(assessment, 1).filter((q) => isAnsweredValue(answerValueFor(assessment, q))).length;
  const discAnswered = stageQuestions(assessment, 2).filter((q) => isAnsweredValue(answerValueFor(assessment, q))).length;
  const stage1Count = stageQuestions(assessment, 1).length || 50;
  const stage2Count = stageQuestions(assessment, 2).length || 20;
  return `
    <section class="assessment-progress-panel">
      <div><strong>Technical</strong><span>${technicalAnswered}/${stage1Count} answered</span></div>
      <div><strong>DISC</strong><span>${discAnswered}/${stage2Count} answered</span></div>
      <div class="assessment-progress-strip">
        ${questions.map((q, index) => {
          const answered = isAnsweredValue(answerValueFor(assessment, q));
          return `<button type="button" class="${index === currentIndex ? "active" : ""} ${answered ? "answered" : ""}" data-assessment-jump="${index}" title="${assessmentStageName(q.stage)} · Q${index + 1}">${index + 1}</button>`;
        }).join("")}
      </div>
    </section>
  `;
}

function renderAssessmentTimer(assessment, currentStage, currentIndex, questions) {
  const stage = Number(currentStage || 1);
  const technicalStartedAt = dateFromValue(assessment.technicalStartedAt || assessment.startedAt) || new Date();
  const discStartedAt = dateFromValue(assessment.discStartedAt) || new Date();
  const stageStartedAt = stage === 1 ? technicalStartedAt : discStartedAt;
  const stageMinutes = stage === 1 ? Number(assessment.technicalMinutes || 60) : Number(assessment.discMinutes || 30);
  const endsAt = new Date(stageStartedAt.getTime() + stageMinutes * 60 * 1000);
  const sectionLabel = stage === 1 ? "Technical" : "DISC profile";
  const stageQs = (questions || []).filter((q) => Number(q.stage || 1) === stage);
  const stageStart = (questions || []).findIndex((q) => Number(q.stage || 1) === stage);
  const stageIdx = Math.max(0, currentIndex - stageStart);
  const pct = stageQs.length ? Math.round(((stageIdx + 1) / stageQs.length) * 100) : 2;
  return `
    <div class="nw-assess-chrome nw-assess-chrome--active">
      <div class="nw-assess-chrome__logo">
        <div class="nw-assess-chrome__logotile">N</div>
        <span class="nw-assess-chrome__brand">Nearwork</span>
        <div class="nw-assess-chrome__divider"></div>
        <span class="nw-assess-chrome__sub">Candidate assessment</span>
      </div>
      <div class="nw-assess-chrome__center">
        <div class="nw-assess-chrome__section">
          ${icon("clipboard-check")}
          <span>${sectionLabel} &middot; Question ${stageIdx + 1} of ${stageQs.length || (stage === 1 ? 50 : 20)}</span>
        </div>
        <div class="nw-assess-chrome__progresstrack">
          <div class="nw-assess-chrome__progressfill" style="width:${Math.max(2, pct)}%"></div>
        </div>
      </div>
      <div class="nw-timer-pill">
        ${icon("timer")}
        <span id="assessmentTimer" data-end="${endsAt.toISOString()}">${stageMinutes}:00</span>
      </div>
      <button class="nw-assess-chrome__exit" type="button">${icon("x")} Save &amp; exit</button>
    </div>
  `;
}

function renderAssessmentQuestions(assessment, started, displayIndex = null) {
  // ── Welcome screen (not yet started) ────────────────────────────────────
  if (!started) {
    const role = escapeAttr(assessment.role || "Role assessment");
    const recruiter = escapeAttr(assessment.recruiterName || assessment.recruiter || "Nearwork");
    const expiry = formatDate(assessment.expiresAt || assessment.deadline);
    const stage1Q = stageQuestions(assessment, 1).length || 50;
    const stage2Q = stageQuestions(assessment, 2).length || 20;
    const stage1Min = Number(assessment.technicalMinutes || 60);
    const stage2Min = Number(assessment.discMinutes || 30);
    return `
      <div class="nw-assess-welcome">
        <div class="nw-assess-welcome__header">
          <span class="nw-assess-role-chip">${icon("sparkles")} ${role}</span>
          <span>Sent by ${recruiter}${expiry ? " &middot; expires " + expiry : ""}</span>
        </div>
        <h2 class="nw-assess-welcome__title">Let's see how you think — and how you work.</h2>
        <p class="nw-assess-welcome__desc">This assessment has two parts: a role-knowledge check and a behavioral profile.</p>
        <div class="nw-assess-parts">
          <div class="nw-assess-part">
            <div class="nw-assess-part__blob" style="background:#E8F8F5"></div>
            <div class="nw-assess-part__icon" style="background:#E8F8F5;color:#16A085">${icon("code-2")}</div>
            <span class="nw-assess-part__tag" style="color:#16A085">Part 1</span>
            <strong class="nw-assess-part__title">Technical Assessment</strong>
            <span class="nw-assess-part__sub">${stage1Q} questions &middot; ~${stage1Min} min</span>
            <p class="nw-assess-part__desc">Single-choice role scenarios. We're looking at how you think, not whether you remember definitions.</p>
          </div>
          <div class="nw-assess-part">
            <div class="nw-assess-part__blob" style="background:#F7F2FC"></div>
            <div class="nw-assess-part__icon" style="background:#F7F2FC;color:#AF7AC5">${icon("compass")}</div>
            <span class="nw-assess-part__tag" style="color:#AF7AC5">Part 2</span>
            <strong class="nw-assess-part__title">DISC Profile</strong>
            <span class="nw-assess-part__sub">${stage2Q} statements &middot; ~${stage2Min} min</span>
            <p class="nw-assess-part__desc">How you work, communicate, and lead under pressure. No right or wrong answers.</p>
          </div>
        </div>
        <div class="nw-assess-rules">
          <div class="nw-assess-rule"><div class="nw-assess-rule__icon">${icon("wifi")}</div><div><strong>Stable connection</strong><span>Progress saves on every answer.</span></div></div>
          <div class="nw-assess-rule"><div class="nw-assess-rule__icon">${icon("timer")}</div><div><strong>Timed sections</strong><span>A countdown runs per stage.</span></div></div>
          <div class="nw-assess-rule"><div class="nw-assess-rule__icon">${icon("lock")}</div><div><strong>One attempt</strong><span>Take it when you can give it your full focus.</span></div></div>
          <div class="nw-assess-rule"><div class="nw-assess-rule__icon">${icon("eye-off")}</div><div><strong>No proctoring</strong><span>No camera or screen recording.</span></div></div>
        </div>
        <div class="nw-assess-welcome__cta">
          <button class="primary-action" id="showTechIntro" type="button">${icon("arrow-right")} Begin assessment</button>
          <span>Questions are timed. Open when you're ready to focus.</span>
        </div>
      </div>
    `;
  }

  // ── Active question ──────────────────────────────────────────────────────
  const questions = (assessment.questions || []).slice(0, 70);
  const currentIndex = Math.min(displayIndex ?? Number(assessment.currentQuestionIndex || 0), Math.max(questions.length - 1, 0));
  const question = questions[currentIndex];
  const saved = assessment.answers?.[question.id]?.value ?? assessment.answers?.[question.id] ?? "";
  const options = Array.isArray(question.options) && question.options.length ? question.options : ["Strongly agree", "Agree", "Neutral", "Disagree"];
  const nextQuestion = questions[currentIndex + 1];
  const nextStage = nextQuestion?.stage;
  const finishesStage = nextStage && nextStage !== question.stage;
  const stageMissed = missedQuestionsForStage(assessment, question.stage);
  const shouldReviewStage = finishesStage && stageMissed.length;
  const finishingAssessment = currentIndex + 1 >= questions.length;
  const finalMissed = finishingAssessment ? missedQuestionsForStage(assessment, question.stage) : [];
  const isMulti = !!question.multiple;
  const chipVariant = Number(question.stage || 1) === 2 ? "nw-assess-chip--violet" : "nw-assess-chip--teal";
  const typeLabel = isMulti ? "Multi-select" : "Single choice";
  const partLabel = escapeAttr(question.part || question.type || (Number(question.stage || 1) === 2 ? "DISC" : "Scenario"));
  const bankLabel = escapeAttr(question.bank || "");
  return `
    <form id="assessmentQuestionForm" class="nw-assess-qcard" data-current-index="${currentIndex}">
      <div class="nw-assess-qmeta">
        <span class="nw-assess-chip ${chipVariant}">${partLabel}</span>
        ${bankLabel ? `<span class="nw-assess-chip nw-assess-chip--gray">${bankLabel}</span>` : ""}
        <span class="nw-assess-qtype">&middot; ${typeLabel}</span>
      </div>
      ${question.context ? `<div class="nw-assess-context"><strong>Context: </strong>${escapeAttr(question.context)}</div>` : ""}
      <p class="nw-assess-qprompt">${escapeAttr(question.q || "")}</p>
      <fieldset class="nw-assess-options${isMulti ? " nw-assess-options--multi" : ""}">
        <legend>${typeLabel}</legend>
        ${options.map((opt, i) => `
          <label class="nw-assess-option${isMulti ? " nw-assess-option--multi" : ""}">
            <input type="radio" name="answer" value="${i}" ${String(saved) === String(i) ? "checked" : ""} />
            <span class="nw-assess-option__key">${String.fromCharCode(65 + i)}</span>
            <span class="nw-assess-option__text">${escapeAttr(opt)}</span>
            ${!isMulti ? `<span class="nw-assess-option__check">${icon("check-circle-2")}</span>` : ""}
          </label>
        `).join("")}
      </fieldset>
      ${shouldReviewStage || finalMissed.length ? renderMissedQuestionPrompt(assessment, shouldReviewStage ? stageMissed : finalMissed, question.stage) : ""}
      <div class="nw-assess-qfooter">
        <button class="ghost-action" id="prevAssessmentQuestion" type="button" ${currentIndex === 0 ? "disabled" : ""}>${icon("arrow-left")} Back</button>
        <span class="nw-assess-autosave">${icon("check")} Auto-saved</span>
        <div style="flex:1"></div>
        <button class="primary-action fit" type="submit">${finishingAssessment ? icon("send") + " Submit assessment" : "Next " + icon("arrow-right")}</button>
      </div>
    </form>
  `;
}

function renderMissedQuestionPrompt(assessment, missed, stage) {
  if (!missed.length) return "";
  const questions = (assessment.questions || []).slice(0, 70);
  return `
    <div class="nw-assess-missed">
      <strong>${icon("alert-triangle")} Unanswered questions in ${assessmentStageName(stage)}</strong>
      <p>You skipped ${missed.map((q) => `Question ${questions.findIndex((item) => item.id === q.id) + 1}`).join(", ")}. You can go back now or continue if you meant to leave them blank.</p>
      <div class="nw-assess-missed__links">${missed.map((q) => {
        const idx = questions.findIndex((item) => item.id === q.id);
        return `<button class="ghost-action" type="button" data-assessment-jump="${idx}">${icon("arrow-left")} Go to ${idx + 1}</button>`;
      }).join("")}</div>
    </div>
  `;
}

function isAssessmentExpired(assessment) {
  if (!assessment?.expiresAt || String(assessment.status || "").toLowerCase() === "completed") return false;
  return Date.now() > new Date(assessment.expiresAt).getTime();
}

function renderAssessmentTechIntro(assessment) {
  const role = escapeAttr(assessment.role || "Role assessment");
  const stage1Q = stageQuestions(assessment, 1).length || 50;
  const stage1Min = Number(assessment.technicalMinutes || 60);
  return `
    <div class="nw-assess-wrap">
      ${renderAssessmentChromeSimple(assessment)}
      <div class="nw-assess-body">
        <div class="nw-assess-welcome" style="max-width:860px">
          <div style="display:inline-flex;align-items:center;gap:8px;padding:5px 12px;border-radius:999px;background:#E8F8F5;border:1px solid rgba(22,160,133,0.25);margin-bottom:4px">
            <span style="width:6px;height:6px;border-radius:50%;background:#16A085;display:inline-block"></span>
            <span style="font-size:11.5px;font-weight:600;color:#0E6B58;text-transform:uppercase;letter-spacing:0.05em">Part 1 of 2 &middot; Starting now</span>
          </div>
          <h2 class="nw-assess-welcome__title" style="font-size:2.2rem">Role knowledge check.</h2>
          <p class="nw-assess-welcome__desc">The next <strong>${stage1Q} questions</strong> are about the day-to-day of the ${role} role — scenarios, decisions, and judgement calls. We're looking at how you think, not whether you remember definitions.</p>
          <p style="font-size:0.88rem;color:#9E9E9E;margin:0">You have <strong style="color:#555">${stage1Min} minutes</strong> total. Your progress saves automatically after every question. DISC follows when you finish.</p>
          <div class="nw-assess-welcome__cta" style="margin-top:8px">
            <button class="primary-action" id="startAssessment" type="button">${icon("play")} Start Part 1</button>
            <button class="ghost-action" id="backToWelcome" type="button">${icon("arrow-left")} Back</button>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderAssessmentDiscIntro(assessment) {
  const stage1Q = stageQuestions(assessment, 1).length || 50;
  const stage2Q = stageQuestions(assessment, 2).length || 20;
  const stage2Min = Number(assessment.discMinutes || 30);
  const recruiter = escapeAttr(assessment.recruiterName || assessment.recruiter || "your recruiter");
  const discIntroIdx = (assessment.questions || []).findIndex((q) => Number(q.stage || 1) === 2);
  return `
    <div class="nw-assess-wrap">
      ${renderAssessmentChromeSimple(assessment)}
      <div class="nw-assess-body">
        <div style="background:#E8F8F5;border-bottom:1px solid rgba(22,160,133,0.15);padding:13px 20px;display:flex;align-items:center;gap:12px;margin-bottom:24px;border-radius:10px">
          <div style="width:26px;height:26px;border-radius:50%;background:#16A085;color:#fff;display:flex;align-items:center;justify-content:center;flex-shrink:0">${icon("check")}</div>
          <div style="flex:1">
            <div style="font-size:13px;font-weight:600;color:#0E6B58">Part 1 complete — nice work.</div>
            <div style="font-size:12px;color:#12866E;margin-top:1px">${stage1Q}/${stage1Q} answered &middot; submitted to ${recruiter} for review</div>
          </div>
          <span class="nw-assess-chip nw-assess-chip--teal">${icon("trophy")} Part 1 done</span>
        </div>
        <div class="nw-assess-welcome" style="max-width:860px">
          <div style="display:inline-flex;align-items:center;gap:8px;padding:5px 12px;border-radius:999px;background:#F7F2FC;border:1px solid rgba(175,122,197,0.25);margin-bottom:4px">
            <span style="width:6px;height:6px;border-radius:50%;background:#AF7AC5;display:inline-block"></span>
            <span style="font-size:11.5px;font-weight:600;color:#784899;text-transform:uppercase;letter-spacing:0.05em">Part 2 of 2 &middot; Up next</span>
          </div>
          <h2 class="nw-assess-welcome__title" style="font-size:2.2rem">Now, the DISC profile.</h2>
          <p class="nw-assess-welcome__desc"><strong>DISC</strong> is a behavioral framework. It tells your future team how you tend to communicate, decide, and respond to pressure — not whether you're "good" at the job.</p>
          <div class="nw-assess-parts" style="grid-template-columns:1fr">
            <div class="nw-assess-part" style="background:#F8F7F3;border-left:3px solid #AF7AC5">
              <strong style="font-size:0.88rem;font-weight:600;color:#555;margin-bottom:8px;display:block">How it works</strong>
              <p class="nw-assess-part__desc">You'll see ${stage2Q} statements about how you work. For each one, pick the option that's most like you. Go with your gut — there are no right answers. Takes about ${stage2Min} minutes.</p>
            </div>
          </div>
          <div class="nw-assess-rules">
            <div class="nw-assess-rule"><div class="nw-assess-rule__icon" style="color:#AF7AC5">${icon("users-round")}</div><div><strong>No right answers</strong><span>This measures style, not performance.</span></div></div>
            <div class="nw-assess-rule"><div class="nw-assess-rule__icon" style="color:#AF7AC5">${icon("timer")}</div><div><strong>${stage2Min} min total</strong><span>Go with your first instinct.</span></div></div>
            <div class="nw-assess-rule"><div class="nw-assess-rule__icon" style="color:#AF7AC5">${icon("shield-check")}</div><div><strong>Used for fit</strong><span>Helps match you with the right team.</span></div></div>
            <div class="nw-assess-rule"><div class="nw-assess-rule__icon" style="color:#AF7AC5">${icon("check")}</div><div><strong>Auto-saved</strong><span>Progress saves on every answer.</span></div></div>
          </div>
          <div class="nw-assess-welcome__cta" style="margin-top:8px">
            <button class="primary-action" id="startDiscAssessment" data-disc-index="${discIntroIdx >= 0 ? discIntroIdx : 50}" type="button">${icon("play")} Start Part 2</button>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderAssessmentResult(assessment) {
  const candidateName = state.candidate?.name || state.user?.displayName || "";
  const firstName = candidateName.split(" ")[0] || "You";
  const recruiter = escapeAttr(assessment.recruiterName || assessment.recruiter || "your recruiter");
  const stage1Q = stageQuestions(assessment, 1).length || 50;
  const stage2Q = stageQuestions(assessment, 2).length || 20;
  return `
    <div class="nw-assess-complete">
      <div class="nw-assess-complete__hero">
        <div class="nw-assess-complete__icon">
          ${icon("check")}
          <div class="nw-assess-complete__ring1"></div>
          <div class="nw-assess-complete__ring2"></div>
        </div>
        <h2 class="nw-assess-complete__title">You're done, ${escapeAttr(firstName)}.</h2>
        <p class="nw-assess-complete__desc">Your results have been sent to ${recruiter}. They'll reach out personally — usually within a business day.</p>
      </div>
      <div class="nw-assess-complete__chips">
        <span class="nw-assess-complete__chip nw-assess-complete__chip--teal">${icon("clipboard-check")} Part 1 &middot; ${stage1Q}/${stage1Q} answered</span>
        <span class="nw-assess-complete__chip nw-assess-complete__chip--violet">${icon("compass")} Part 2 &middot; ${stage2Q}/${stage2Q} answered</span>
        <span class="nw-assess-complete__chip nw-assess-complete__chip--gray">${icon("check-circle-2")} Assessment complete</span>
      </div>
      <div class="nw-assess-next">
        <div class="nw-assess-next__label">What happens next</div>
        ${[
          { icon: "inbox", title: "Your recruiter reviews your results", desc: `${recruiter} will read your scenarios and DISC profile, usually within one business day.`, when: "Within 24h" },
          { icon: "message-square", title: `A personal note from ${recruiter}`, desc: "Not an automated email. They'll share what stood out and what comes next.", when: "Tomorrow" },
          { icon: "calendar-check", title: "Interview with the hiring team", desc: "If there's a match, you'll get a calendar link to book a slot that works for you.", when: "This week" },
        ].map(({ icon: ic, title, desc, when }, i) => `
          <div class="nw-assess-next__item">
            <div class="nw-assess-next__icon-wrap">
              <div class="nw-assess-next__iconbox">${icon(ic)}</div>
              <div class="nw-assess-next__num">${i + 1}</div>
            </div>
            <div class="nw-assess-next__body">
              <div class="nw-assess-next__title">${title}</div>
              <div class="nw-assess-next__desc">${desc}</div>
            </div>
            <div class="nw-assess-next__when">${when}</div>
          </div>
        `).join("")}
      </div>
      <div class="nw-assess-recruiter">
        <div class="nw-assess-recruiter__avatar">${(assessment.recruiterName || assessment.recruiter || "NW").split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}</div>
        <div style="flex:1">
          <div class="nw-assess-recruiter__label">Your recruiter</div>
          <div class="nw-assess-recruiter__name">${recruiter}</div>
          <div class="nw-assess-recruiter__role">Talent partner &middot; Nearwork</div>
        </div>
        <button class="ghost-action" data-page="recruiter" type="button">${icon("message-circle")} Message recruiter</button>
      </div>
    </div>
  `;
}

function renderAssessmentHistory(assessments, activeId) {
  if (!assessments.length) return "";
  return `
    <section class="section-block page-gap">
      <div class="section-heading"><div><p class="eyebrow">Assessment center</p><h2>Your assessment history</h2></div></div>
      <div class="assessment-history-list">
        ${assessments.map((assessment) => `
          <article class="assessment-history-row ${assessment.id === activeId ? "active" : ""}">
            <div><strong>${escapeAttr(assessment.role || "Nearwork assessment")}</strong><span>${escapeAttr(assessment.id || "")}</span></div>
            <div>${escapeAttr(String(assessment.status || "assigned"))}</div>
            <a href="/assessment/${encodeURIComponent(assessment.id)}/start">${assessment.status === "completed" ? "View" : "Continue"}</a>
          </article>
        `).join("")}
      </div>
    </section>
  `;
}

function scoreAssessment(assessment, answers) {
  const questions = assessment.questions || [];
  const technical = questions.filter((q) => q.stage === 1);
  const disc = questions.filter((q) => q.stage === 2);
  const correct = technical.filter((q) => typeof q.correctIndex === "number" && Number(answers[q.id]?.value) === q.correctIndex).length;
  const discAnswered = disc.filter((q) => isAnsweredValue(answers[q.id]?.value ?? answers[q.id])).length;
  return {
    technicalScore: technical.length ? Math.round((correct / technical.length) * 100) : 0,
    discScore: disc.length ? Math.round((discAnswered / disc.length) * 100) : 0
  };
}

function buildDiscProfile(assessment, answers) {
  const totals = { Dominance: 0, Influence: 0, Steadiness: 0, Conscientiousness: 0 };
  (assessment.questions || []).filter((question) => Number(question.stage) === 2).forEach((question) => {
    const value = answers[question.id]?.value;
    if (!isAnsweredValue(value)) return;
    const skill = totals[question.skill] !== undefined ? question.skill : "Steadiness";
    const weight = Math.max(1, 4 - Number(value || 0));
    totals[skill] += weight;
  });
  const sorted = Object.entries(totals).sort((a, b) => b[1] - a[1]);
  const high = sorted[0]?.[0] || "Steadiness";
  const low = sorted[sorted.length - 1]?.[0] || "Dominance";
  const initials = { Dominance: "D", Influence: "I", Steadiness: "S", Conscientiousness: "C" };
  return {
    label: initials[high] || "S",
    high,
    low,
    scores: totals,
    summary: `${high} is the strongest observed DISC tendency; ${low} appears lowest based on this assessment.`
  };
}

async function notifyAssessmentCompletion(assessment, result) {
  const endpoint = "https://admin.nearwork.co/api/send-email";
  const candidateEmail = assessment.candidateEmail || state.user?.email || state.candidate?.email;
  const candidateName = assessment.candidateName || state.candidate?.name || state.user?.displayName || "there";
  const recruiterEmails = normalizeList([assessment.recruiterEmail, assessment.stakeholderEmail, assessment.hiringManagerEmail].filter(Boolean).join(","));
  const requests = [];
  if (candidateEmail) {
    requests.push(fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: candidateEmail,
        templateId: "assessment_completed_candidate",
        data: { name: candidateName, role: assessment.role, actionUrl: "https://talent.nearwork.co/assessment", actionText: "Open assessment center" }
      })
    }));
  }
  const notifyTo = recruiterEmails.length ? recruiterEmails : ["support@nearwork.co"];
  requests.push(fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      to: notifyTo,
      templateId: "assessment_completed_recruiter",
      data: {
        name: "Nearwork team",
        role: assessment.role,
        actionUrl: `https://admin.nearwork.co/assessments/${assessment.id}/questions`,
        actionText: "Review assessment",
        message: `${candidateName} completed the assessment. Overall: ${result.score}%. Technical: ${result.technicalScore}%. DISC: ${result.discProfile?.label || "Submitted"}.`
      }
    })
  }));
  await Promise.allSettled(requests);
}

function renderCvs() {
  const cvs = state.candidate?.cvLibrary || [];
  return `
    <section class="section-block">
      <div class="section-heading"><div><p class="eyebrow">CV picker</p><h2>Store multiple resumes</h2></div></div>
      <form id="cvForm" class="upload-box">
        ${icon("upload-cloud")}<strong>Upload a CV for this role</strong><p>Save multiple versions and pick the best one for each opening.</p>
        <input name="cv" type="file" accept=".pdf,.doc,.docx" required />
        <input name="label" type="text" placeholder="CV label, e.g. CSM resume" />
        <button class="primary-action fit" type="submit">Upload CV</button>
      </form>
      <div class="cv-list">
        ${cvs.length ? cvs.map((cv) => `<article class="cv-item">${icon("file-text")}<div><strong>${cv.name || cv.fileName}</strong><span>${formatDate(cv.uploadedAt)}</span></div>${cv.url ? `<a href="${cv.url}" target="_blank" rel="noreferrer">Open</a>` : ""}</article>`).join("") : emptyState("No CVs saved yet", "Upload role-specific resumes here.")}
      </div>
    </section>
  `;
}

function renderTips() {
  return `
    <section class="tips-hero"><div><p class="eyebrow">Candidate guide</p><h2>Practical prep for US SaaS interviews.</h2><p>Short, useful guidance candidates can read before recruiter screens, assessments, and client interviews.</p></div></section>
    <section class="tips-grid rich">
      ${tips.map((tip, index) => `
        <article class="tip-card">
          <div class="tip-number">${String(index + 1).padStart(2, "0")}</div>
          <span>${tip.tag}</span>
          <h3>${tip.title}</h3>
          <p>${tip.body}</p>
          <div class="tip-actions">${tip.actions.map((action) => `<small>${action}</small>`).join("")}</div>
          <strong>${tip.read} read</strong>
        </article>
      `).join("")}
    </section>
  `;
}

function renderRecruiter() {
  const recruiter = state.candidate?.recruiter || {};
  const bookingUrl = recruiter.bookingUrl || state.candidate?.recruiterBookingUrl || "mailto:support@nearwork.co?subject=Nearwork%20candidate%20question";
  return `
    <section class="content-grid">
      <div class="section-block"><div class="section-heading"><div><p class="eyebrow">Recruiter</p><h2>Your Nearwork contact</h2></div></div>${recruiterCard(true)}</div>
      <div class="section-block compact"><div class="section-heading"><div><p class="eyebrow">Booking</p><h2>Schedule soon</h2></div></div><p class="muted">Ask the Nearwork recruiting team for the earliest available slot. Candidate booking links can be attached to this profile later.</p><a class="primary-action fit" href="${bookingUrl}" target="_blank" rel="noreferrer">${icon("calendar-plus")} Book recruiter call</a></div>
    </section>
  `;
}

function renderProfile() {
  return renderProfileForm("profile");
}

function renderProfileForm(mode = "profile") {
  const skills = candidateSkills();
  const location = selectedLocation();
  const cities = locationCatalog[location.department] || [];
  const salaryCurrency = state.candidate?.salaryCurrency || "USD";
  const normalizedSalary = normalizeSalaryValue(state.candidate?.salaryAmount || state.candidate?.salary || state.candidate?.salaryUSD, salaryCurrency);
  const roleGroup = selectedRoleGroup();
  const selectedRole = state.candidate?.targetRole || state.candidate?.headline || "";
  return `
    <section class="section-block">
      <div class="section-heading"><div><p class="eyebrow">${mode === "onboarding" ? "Setup" : "Profile"}</p><h2>${mode === "onboarding" ? "Complete your account" : "Improve your match quality"}</h2></div><span class="profile-score">${profileCompletion()}%</span></div>
      <form id="profileForm" class="profile-form">
        <div class="profile-card profile-identity wide">
          ${avatarMarkup("large")}
          <label>Profile photo <span class="optional-label">optional</span>
            <input name="photo" type="file" accept="image/png,image/jpeg,image/webp" />
          </label>
        </div>
        <label class="wide">Full name<input name="name" value="${escapeAttr(state.candidate?.name || state.user?.displayName || "")}" /></label>
        <div class="profile-card wide">
          <div class="field-label">Role applying for</div>
          <div class="profile-card-grid">
            <label>Area
              <select name="roleGroup" id="roleGroupSelect">
                ${roleGroupOptions(roleGroup)}
              </select>
            </label>
            <label>Role
              <select name="targetRole" id="targetRoleSelect">
                ${roleOptionsForGroup(roleGroup, selectedRole)}
              </select>
            </label>
          </div>
        </div>
        <div class="profile-card wide">
          <div class="field-label">Location</div>
          <div class="profile-card-grid">
            <label>Department
              <select name="department" id="departmentSelect">
                ${Object.keys(locationCatalog).map((department) => `<option value="${escapeAttr(department)}" ${department === location.department ? "selected" : ""}>${department}</option>`).join("")}
              </select>
            </label>
            <label>City
              <select name="city" id="citySelect">
                ${cities.map((city) => `<option value="${escapeAttr(city)}" ${city === location.city ? "selected" : ""}>${city}</option>`).join("")}
              </select>
            </label>
          </div>
        </div>
        <div class="profile-card wide">
          <div class="field-label">Compensation and English</div>
          <div class="profile-card-grid">
            <label>Target monthly salary
              <div class="salary-field"><select id="salaryCurrencyInput" name="salaryCurrency"><option value="USD" ${normalizedSalary.salaryCurrency === "USD" ? "selected" : ""}>USD</option><option value="COP" ${normalizedSalary.salaryCurrency === "COP" ? "selected" : ""}>COP</option></select><input id="salaryInput" name="salary" value="${escapeAttr(normalizedSalary.salary || "")}" inputmode="numeric" placeholder="1000" /></div>
            </label>
            <label>English level<select name="english">${["", "B1", "B2", "C1", "C2", "Native"].map((level) => `<option value="${level}" ${state.candidate?.english === level ? "selected" : ""}>${level || "Select level"}</option>`).join("")}</select></label>
          </div>
        </div>
        <div class="profile-card wide">
          <div class="field-label">Contact</div>
          <div class="profile-card-grid">
            <label>WhatsApp number
              <input name="whatsapp" value="${escapeAttr(state.candidate?.whatsapp || state.candidate?.phone || "")}" inputmode="tel" autocomplete="tel" placeholder="+57 300 123 4567" required />
            </label>
            <label>LinkedIn <span class="optional-label">optional</span>
              <input name="linkedin" value="${escapeAttr(state.candidate?.linkedin || "")}" placeholder="https://linkedin.com/in/..." />
            </label>
          </div>
        </div>
        <div class="profile-card wide">
          <div class="field-label">Skills</div>
          <p class="field-hint">Search for skills and add everything that applies to your experience.</p>
          ${skillSearchMarkup(skills)}
        </div>
        <div class="profile-card wide" id="profileCvCard">
          <div class="field-label">CV</div>
          <p class="field-hint">Upload the CV you want Nearwork to use for your applications.</p>
          ${state.candidate?.activeCvName || state.candidate?.cvUrl ? `
            <div class="cv-item" style="border:1px solid var(--border);border-radius:10px;margin-bottom:4px;">
              ${icon("file-text")}
              <div>
                <strong>${state.candidate.activeCvName || "CV on file"}</strong>
                <span>Currently saved · select a new file below to replace</span>
              </div>
              ${state.candidate.cvUrl ? `<a href="${state.candidate.cvUrl}" target="_blank" rel="noreferrer">Open</a>` : ""}
            </div>
          ` : ""}
          <input name="profileCv" type="file" accept=".pdf,.doc,.docx" />
          <input name="profileCvLabel" type="text" placeholder="CV label, e.g. Customer Success CV" />
        </div>
        <label class="wide">Summary <span class="optional-label">optional</span><textarea name="summary" placeholder="Add a short note about what you do best.">${state.candidate?.summary || ""}</textarea></label>
        <input type="hidden" name="mode" value="${mode}" />
        <button class="primary-action fit" type="submit">${icon("save")} ${mode === "onboarding" ? "Finish setup" : "Save profile"}</button>
      </form>
    </section>
  `;
}

function profileCompletion() {
  const fields = ["name", "targetRole", "department", "city", "english", "salary", "whatsapp"];
  const filled = fields.filter((field) => {
    if (field === "targetRole") return Boolean(state.candidate?.targetRole || (!isPlaceholderRole(state.candidate?.headline) && state.candidate?.headline));
    return Boolean(state.candidate?.[field]);
  }).length + (candidateSkills().length ? 1 : 0);
  return Math.max(25, Math.round((filled / (fields.length + 1)) * 100));
}

function currentStage() {
  const first = state.applications[0];
  return first?.stage || first?.status || "profile-review";
}

function pipelineView(activeStage) {
  const normalizedStage = String(activeStage || "")
    .toLowerCase()
    .replace(/_/g, "-")
    .replace(/\s+/g, "-");
  const activeIndex = Math.max(0, pipelineStages.findIndex((stage) => normalizedStage.includes(stage.key) || stage.key.includes(normalizedStage)));
  return `<div class="pipeline">${pipelineStages.map((stage, index) => `<article class="${index <= activeIndex ? "done" : ""} ${index === activeIndex ? "current" : ""}"><span>${index + 1}</span><strong>${stage.label}</strong><p>${stage.help}</p></article>`).join("")}</div>`;
}

function noPipelineView() {
  return `
    <div class="empty-state">
      ${icon("briefcase-business")}
      <strong>No active pipeline yet</strong>
      <p>Browse current openings and apply when you find a role that fits. Nearwork will show a pipeline here after an application moves forward.</p>
      <div class="empty-actions">
        <button class="primary-action fit" type="button" data-page="matches">${icon("sparkles")} View matches</button>
        <a class="secondary-action" href="https://jobs.nearwork.co" target="_blank" rel="noreferrer">${icon("external-link")} Open jobs</a>
      </div>
    </div>
  `;
}

function metricCard(label, value, iconName) {
  return `<article class="metric"><span>${icon(iconName)}</span><p>${label}</p><strong>${value}</strong></article>`;
}

function getLocalAppliedSet() {
  try { return new Set(JSON.parse(localStorage.getItem("nw_talent_applied") || "[]")); } catch { return new Set(); }
}

function jobCard(job) {
  const role = normalizeRole(job);
  // Check Firestore-loaded applications first, then fall back to localStorage
  // so the "Applied" state survives a page refresh even when Firestore reads fail.
  const appliedFromServer = new Set(state.applications.map((item) => item.jobId || item.openingCode)).has(role.code);
  const applied = appliedFromServer || getLocalAppliedSet().has(role.code);
  const matchedSkills = matchingSkillsForJob(role);
  const openingUrl = `https://jobs.nearwork.co/apply?code=${encodeURIComponent(role.code)}`;
  return `
    <article class="job-card">
      <div>
        ${matchedSkills.length >= 3 ? `<div class="match-pill">${matchedSkills.length} skill match</div>` : role.match ? `<div class="match-pill">${role.match}% match</div>` : ''}
        <h3><a href="${openingUrl}" target="_blank" rel="noreferrer" style="color:inherit;text-decoration:none;" onmouseover="this.style.textDecoration='underline'" onmouseout="this.style.textDecoration='none'">${role.title}</a></h3>
        <p>${role.location}</p>
      </div>
      <p class="job-description">${role.description}</p>
      <div class="skill-row">${role.skills.slice(0, 4).map((skill) => `<span>${skill}</span>`).join("")}</div>
      ${matchedSkills.length >= 3 ? `<p class="field-hint">Matched skills: ${matchedSkills.slice(0, 5).map(escapeHtml).join(", ")}</p>` : ""}
      <div class="job-footer">
        <strong>${role.compensation}</strong>
        <div style="display:flex;gap:8px;align-items:center;">
          <a href="${openingUrl}" target="_blank" rel="noreferrer" class="secondary-action" style="text-decoration:none;font-size:12px;opacity:0.75;">View opening ↗</a>
          <button class="secondary-action" type="button" data-apply="${role.code}" ${applied ? "disabled" : ""}>${applied ? "Applied ✓" : "Apply"}</button>
        </div>
      </div>
    </article>
  `;
}

function applicationCard(application) {
  return `<article class="timeline-item"><span>${icon("circle-dot")}</span><div><strong>${application.jobTitle || application.title || "Application"}</strong><p>${application.clientName || application.company || "Nearwork"} · ${application.status || "submitted"}</p><small>${formatDate(application.updatedAt || application.createdAt)}</small></div></article>`;
}

function infoCard(title, body) {
  return `<article class="info-card"><strong>${title}</strong><p>${body}</p></article>`;
}

function recruiterCard(full = false) {
  const recruiter = state.candidate?.recruiter || {};
  const email = recruiter.email || "support@nearwork.co";
  const whatsapp = recruiter.whatsapp || SUPPORT_WHATSAPP;
  const whatsappUrl = recruiter.whatsappUrl || SUPPORT_WHATSAPP_URL;
  return `<article class="recruiter-card"><div class="avatar recruiter-avatar">NW</div><div><strong>${recruiter.name || "Nearwork Support"}</strong><p><a href="mailto:${email}">${email}</a></p><p><a href="${whatsappUrl}" target="_blank" rel="noreferrer">WhatsApp ${whatsapp}</a></p>${full ? `<span>Questions about assessments, interviews, feedback, or CV selection should go here.</span>` : ""}</div></article>`;
}

function emptyState(title, body) {
  return `<div class="empty-state">${icon("inbox")}<strong>${title}</strong><p>${body}</p></div>`;
}

function renderLoading() {
  app.innerHTML = `<main class="loading-screen"><span class="logo-mark">N</span><p>Loading Talent...</p></main>`;
}

function bindDashboardEvents() {
  document.querySelector("#signOut")?.addEventListener("click", async () => {
    await signOut(auth);
    if (notificationUnsubscribe) notificationUnsubscribe();
    notificationUnsubscribe = null;
    window.history.pushState({ page: "overview" }, "", "/");
    setState({ user: null, candidate: null, applications: [], assessments: [], jobs: [], view: "login", activePage: "overview", message: "" });
  });
  document.querySelector("#signIn")?.addEventListener("click", () => {
    window.history.pushState({ page: "overview" }, "", "/");
    setState({ view: "login", activePage: "overview", message: "" });
  });
  document.querySelectorAll("[data-page]").forEach((button) => {
    button.addEventListener("click", (e) => {
      const target = e.currentTarget.closest("[data-page]") || e.currentTarget;
      setActivePage(target.dataset.page);
    });
  });
  document.querySelector("[data-dashboard-home]")?.addEventListener("click", () => setActivePage("overview"));
  document.querySelector("#notificationBell")?.addEventListener("click", () => {
    setState({ notificationPanelOpen: !state.notificationPanelOpen, notificationSettingsOpen: false });
  });
  document.querySelector("#notificationSettings")?.addEventListener("click", () => {
    setState({ notificationSettingsOpen: !state.notificationSettingsOpen, notificationPanelOpen: false });
  });
  document.querySelectorAll("[data-notification-read]").forEach((button) => {
    button.addEventListener("click", async () => {
      const id = button.dataset.notificationRead;
      if (state.user && hasFirebaseConfig) await markNotificationRead(id).catch(() => null);
      setState({ notifications: state.notifications.map((item) => item.id === id ? { ...item, read: true } : item) });
    });
  });
  document.querySelectorAll("[data-notification-pref]").forEach((input) => {
    input.addEventListener("change", async () => {
      const preferences = structuredClone(state.candidate?.notificationPreferences || {});
      const key = input.dataset.notificationPref;
      const channel = input.dataset.channel;
      preferences[key] = { ...(preferences[key] || {}), [channel]: input.checked };
      setState({ candidate: { ...state.candidate, notificationPreferences: preferences } });
      if (state.user && hasFirebaseConfig) await saveNotificationPreferences(state.user.uid, preferences).catch(() => null);
    });
  });
  document.querySelectorAll("[data-assessment-jump]").forEach((button) => {
    button.addEventListener("click", async () => {
      const assessmentId = assessmentIdFromPath() || (state.assessments || [])[0]?.id;
      const assessment = (state.assessments || []).find((item) => item.id === assessmentId);
      const targetIndex = Number(button.dataset.assessmentJump || 0);
      const question = assessment?.questions?.[targetIndex];
      if (!assessmentId || !question) return;
      await saveAssessmentAnswer(assessmentId, "__progress__", "", {
        currentQuestionIndex: targetIndex,
        totalQuestions: assessment?.questions?.length || 70,
        currentStage: question.stage || 1
      });
      setAssessmentQuestionUrl(assessmentId, targetIndex);
      const updatedAssessments = (state.assessments || []).map((item) => item.id === assessmentId
        ? { ...item, currentQuestionIndex: targetIndex, currentStage: question.stage || 1 }
        : item);
      setState({ assessments: updatedAssessments, activePage: "assessment", message: "" });
    });
  });
  document.querySelector("#availability").addEventListener("change", async (event) => {
    const availability = event.target.value;
    setState({ candidate: { ...state.candidate, availability } });
    if (state.user && hasFirebaseConfig) await updateCandidateAvailability(state.user.uid, availability);
    else setState({ message: "Sign in with Google to save availability." });
  });
  document.querySelector("#filterMatches")?.addEventListener("click", () => {
    const hasProfileSignals = candidateSkills().length >= 3;
    setState({
      matchesFiltered: hasProfileSignals ? !state.matchesFiltered : false,
      message: hasProfileSignals ? "" : "Add at least 3 skills in Profile first, then filter matching openings."
    });
  });
  document.querySelector("#departmentSelect")?.addEventListener("change", (event) => {
    const citySelect = document.querySelector("#citySelect");
    const cities = locationCatalog[event.target.value] || [];
    citySelect.innerHTML = cities.map((city) => `<option value="${escapeAttr(city)}">${city}</option>`).join("");
  });
  document.querySelector("#roleGroupSelect")?.addEventListener("change", (event) => {
    const targetRoleSelect = document.querySelector("#targetRoleSelect");
    targetRoleSelect.innerHTML = roleOptionsForGroup(event.target.value, "");
  });
  document.querySelector("#salaryCurrencyInput")?.addEventListener("change", (event) => {
    const input = document.querySelector("#salaryInput");
    if (!input) return;
    const currency = coerceSalaryCurrency(input.value, event.target.value);
    event.target.value = currency;
    input.placeholder = currency === "COP" ? "5,000,000" : "2,500";
    input.value = formatSalaryInputValue(input.value, currency);
  });
  document.querySelector("#salaryInput")?.addEventListener("blur", (event) => {
    const currencySelect = document.querySelector("#salaryCurrencyInput");
    const currency = coerceSalaryCurrency(event.target.value, currencySelect?.value || "USD");
    if (currencySelect) currencySelect.value = currency;
    event.target.placeholder = currency === "COP" ? "5,000,000" : "2,500";
    event.target.value = formatSalaryInputValue(event.target.value, currency);
  });
  bindOnboardingWizardEvents();
  bindSkillSearch();
  bindCvAutofill();
  document.querySelectorAll("[data-apply]").forEach((button) => {
    button.addEventListener("click", async () => {
      const job = state.jobs.map(normalizeRole).find((item) => item.code === button.dataset.apply);
      const code = button.dataset.apply;
      button.disabled = true;
      button.textContent = "Submitted";
      if (state.user && hasFirebaseConfig) {
        // Persist to localStorage immediately so refresh still shows Applied state
        try {
          const _set = getLocalAppliedSet();
          _set.add(code);
          localStorage.setItem("nw_talent_applied", JSON.stringify([..._set]));
        } catch (_e) {}
        await applyToJob(state.user.uid, job);
        await loadDashboard(state.user);
        setActivePage("applications");
      } else {
        setState({ message: "Sign in with Google to apply to this opening." });
      }
    });
  });
  // Welcome → Tech intro
  document.querySelector("#showTechIntro")?.addEventListener("click", () => {
    setState({ assessmentUiStep: "techIntro", message: "" });
  });

  // Tech intro → back to welcome
  document.querySelector("#backToWelcome")?.addEventListener("click", () => {
    setState({ assessmentUiStep: null, message: "" });
  });

  // DISC intro → start Part 2
  document.querySelector("#startDiscAssessment")?.addEventListener("click", async () => {
    const assessmentId = assessmentIdFromPath() || (state.assessments || [])[0]?.id;
    const assessment = (state.assessments || []).find((item) => item.id === assessmentId);
    if (!assessmentId || !assessment) return;
    const questions = assessment.questions || [];
    const discBtn = document.querySelector("#startDiscAssessment");
    const discIndex = discBtn ? Number(discBtn.dataset.discIndex || 50) : questions.findIndex((q) => Number(q.stage || 1) === 2);
    const safeIndex = discIndex >= 0 ? discIndex : 50;
    const discStartedAt = new Date().toISOString();
    try {
      await saveAssessmentAnswer(assessmentId, "__progress__", "", {
        currentQuestionIndex: safeIndex,
        totalQuestions: questions.length,
        currentStage: 2,
        discStartedAt
      });
      setAssessmentQuestionUrl(assessmentId, safeIndex);
      const updatedAssessments = (state.assessments || []).map((item) => item.id === assessmentId
        ? { ...item, currentQuestionIndex: safeIndex, currentStage: 2, discStartedAt }
        : item);
      setState({ assessments: updatedAssessments, activePage: "assessment", assessmentUiStep: null, message: "" });
    } catch (error) {
      setState({ message: friendlyAuthError(error) });
    }
  });

  document.querySelector("#startAssessment")?.addEventListener("click", async () => {
    const assessmentId = assessmentIdFromPath() || (state.assessments || [])[0]?.id;
    const assessment = (state.assessments || []).find((item) => item.id === assessmentId) || (state.assessments || [])[0];
    if (!assessmentId || !state.user) {
      setState({ message: "Please log in to start your assessment." });
      return;
    }
    try {
      await startCandidateAssessment(assessmentId, state.user.uid);
      setAssessmentQuestionUrl(assessmentId, Number(assessment?.currentQuestionIndex || 0), true);
      const updatedAssessments = (state.assessments || []).map((item) => item.id === assessmentId
        ? { ...item, status: "started", startedAt: item.startedAt || new Date().toISOString(), technicalStartedAt: item.technicalStartedAt || new Date().toISOString() }
        : item);
      setState({ assessments: updatedAssessments, activePage: "assessment", assessmentUiStep: null, message: "" });
    } catch (error) {
      setState({ message: friendlyAuthError(error) });
    }
  });
  document.querySelector("#prevAssessmentQuestion")?.addEventListener("click", async () => {
    const assessmentId = assessmentIdFromPath() || (state.assessments || [])[0]?.id;
    const assessment = (state.assessments || []).find((item) => item.id === assessmentId);
    const currentDisplayIndex = Number(document.querySelector("#assessmentQuestionForm")?.dataset.currentIndex ?? assessment?.currentQuestionIndex ?? 0);
    const prevIndex = Math.max(0, currentDisplayIndex - 1);
    const question = assessment?.questions?.[prevIndex];
    await saveAssessmentAnswer(assessmentId, "__progress__", "", {
      currentQuestionIndex: prevIndex,
      totalQuestions: assessment?.questions?.length || 70,
      currentStage: question?.stage || 1
    });
    setAssessmentQuestionUrl(assessmentId, prevIndex);
    const updatedAssessments = (state.assessments || []).map((item) => item.id === assessmentId
      ? { ...item, currentQuestionIndex: prevIndex, currentStage: question?.stage || 1 }
      : item);
    setState({ assessments: updatedAssessments, activePage: "assessment", message: "" });
  });
  document.querySelector("#assessmentQuestionForm")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const assessmentId = assessmentIdFromPath() || (state.assessments || [])[0]?.id;
    const assessment = (state.assessments || []).find((item) => item.id === assessmentId);
    const questions = assessment?.questions || [];
    const currentIndex = Number(event.currentTarget.dataset.currentIndex ?? assessment?.currentQuestionIndex ?? 0);
    const question = questions[currentIndex];
    const answer = new FormData(event.currentTarget).get("answer");
    if (!question) {
      setState({ message: "This question could not be loaded. Please refresh and try again." });
      return;
    }
    const answerPayload = answer === null
      ? { value: "", skipped: true, answeredAt: new Date().toISOString() }
      : { value: Number(answer), skipped: false, answeredAt: new Date().toISOString() };
    const answers = { ...(assessment.answers || {}), [question.id]: answerPayload };
    const nextQuestion = questions[currentIndex + 1];
    const finishesStage = nextQuestion && Number(nextQuestion.stage || 1) !== Number(question.stage || 1);
    const missedThisStage = missedQuestionsForStage(assessment, question.stage, answers);
    try {
      if ((finishesStage || currentIndex + 1 >= questions.length) && missedThisStage.length) {
        await saveAssessmentAnswer(assessmentId, question.id, answers[question.id], {
          currentQuestionIndex: currentIndex,
          totalQuestions: questions.length,
          currentStage: question.stage || 1
        });
        const updatedAssessments = (state.assessments || []).map((item) => item.id === assessmentId
          ? { ...item, answers, currentQuestionIndex: currentIndex, currentStage: question.stage || 1, progress: `${currentIndex + 1}/${questions.length}` }
          : item);
        setState({ assessments: updatedAssessments, activePage: "assessment", message: `You missed ${missedThisStage.length} question${missedThisStage.length === 1 ? "" : "s"} in the ${assessmentStageName(question.stage)}.` });
        return;
      }
      if (currentIndex + 1 >= questions.length) {
        const scores = scoreAssessment(assessment, answers);
        const discProfile = buildDiscProfile(assessment, answers);
        await submitCandidateAssessment(assessmentId, answers, {
          totalQuestions: questions.length,
          technicalScore: scores.technicalScore,
          discScore: scores.discScore,
          score: Math.round((scores.technicalScore * 0.75) + (scores.discScore * 0.25)),
          discProfile
        });
        // Auto-generate AI insights (fire-and-forget — non-blocking)
        fetch("https://admin.nearwork.co/api/generate-assessment-insights", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ assessmentId })
        }).catch(() => null);
        notifyAssessmentCompletion(assessment, {
          score: Math.round((scores.technicalScore * 0.75) + (scores.discScore * 0.25)),
          technicalScore: scores.technicalScore,
          discScore: scores.discScore,
          discProfile
        }).catch((error) => console.warn(error));
        const completedAssessments = (state.assessments || []).map((item) => item.id === assessmentId
          ? { ...item, answers, status: "completed", score: Math.round((scores.technicalScore * 0.75) + (scores.discScore * 0.25)), technical: scores.technicalScore, disc: discProfile.label, discProfile, progress: `${questions.length}/${questions.length}` }
          : item);
        setState({ assessments: completedAssessments, activePage: "assessment", message: "" });
      } else {
        const enteringDisc = question.stage === 1 && nextQuestion?.stage === 2 && !assessment.discStartedAt;
        await saveAssessmentAnswer(assessmentId, question.id, answers[question.id], {
          currentQuestionIndex: currentIndex + 1,
          totalQuestions: questions.length,
          currentStage: nextQuestion?.stage || question.stage || 1,
        });
        setAssessmentQuestionUrl(assessmentId, currentIndex + 1);
        const updatedAssessments = (state.assessments || []).map((item) => item.id === assessmentId
          ? { ...item, answers, currentQuestionIndex: currentIndex + 1, currentStage: nextQuestion?.stage || question.stage || 1, progress: `${currentIndex + 1}/${questions.length}` }
          : item);
        // Show DISC intro screen before the first DISC question
        setState({ assessments: updatedAssessments, activePage: "assessment", message: "", assessmentUiStep: enteringDisc ? "discIntro" : null });
      }
    } catch (error) {
      setState({ message: friendlyAuthError(error) });
    }
  });
  document.querySelector("#profileForm")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const department = form.get("department");
    const city = form.get("city");
    const salary = normalizeSalaryValue(form.get("salary"), form.get("salaryCurrency"));
    const data = {
      name: form.get("name"),
      targetRole: form.get("targetRole"),
      headline: form.get("targetRole"),
      department,
      city,
      locationId: `${String(city).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-")}-co`,
      location: `${city}, ${department}`,
      locationCity: city,
      locationDepartment: department,
      locationCountry: "Colombia",
      english: form.get("english"),
      salary: salary.salary,
      salaryUSD: salary.salaryUSD,
      salaryAmount: salary.salaryAmount,
      salaryCurrency: salary.salaryCurrency,
      expectedSalaryAmount: salary.salaryAmount,
      expectedSalaryCurrency: salary.salaryCurrency,
      linkedin: form.get("linkedin"),
      whatsapp: form.get("whatsapp"),
      phone: form.get("whatsapp"),
      skills: [...new Set(form.getAll("skills").map(canonicalSkillName).filter(Boolean))],
      otherSkills: [],
      summary: form.get("summary"),
      email: state.candidate?.email || state.user?.email || "",
      availability: state.candidate?.availability || "open",
      onboarded: true
    };
    if (!state.user) {
      setState({ candidate: { ...state.candidate, ...data }, message: "Preview updated. Sign in with Google to save this profile." });
      return;
    }
    try {
      const photoFile = form.get("photo");
      let photoURL = state.candidate?.photoURL || state.user?.photoURL || "";
      if (photoFile?.name) {
        photoURL = await uploadCandidatePhoto(state.user.uid, photoFile);
      }

      // CV upload is non-blocking — a Storage failure must not prevent the
      // rest of the profile (name, salary, skills, etc.) from saving.
      const cvFile = form.get("profileCv");
      let cv = null;
      let cvUploadFailed = false;
      if (cvFile?.name) {
        try {
          cv = await uploadCandidateCv(state.user.uid, cvFile, form.get("profileCvLabel"));
        } catch {
          cvUploadFailed = true;
        }
      }

      const enrichedData = {
        ...data,
        photoURL,
        // Preserve the existing CAND code so we never create a duplicate candidate doc
        candidateCode: state.candidate?.candidateCode,
        // Forward stored marketing consent so HubSpot sync remains gated correctly
        marketingConsent: state.candidate?.marketingConsent === true,
        ...(cv ? {
          activeCvId: cv.id,
          activeCvName: cv.name || cv.fileName,
          cvUrl: cv.url,           // synced to candidates collection so Admin can see the file
          cvLibrary: [...(state.candidate?.cvLibrary || []), cv]
        } : {}),
        // Merge Affinda-parsed work history — always for new candidates, only when
        // the "rewrite" toggle is ON for returning candidates.
        ...(_cvParsedData?.workHistory?.length && (_cvOverwrite || !state.candidate?.workHistory?.length)
          ? { workHistory: _cvParsedData.workHistory }
          : {})
      };
      _cvParsedData = null; _cvOverwrite = false; // consumed — reset for next upload
      const result = await updateCandidateProfile(state.user.uid, enrichedData);
      const savedMessage = cvUploadFailed
        ? "Profile saved, but the CV failed to upload. Try uploading it again from the CV section."
        : result?.atsSynced === false
          ? "Profile saved. Nearwork will finish connecting it to your workspace."
          : "Profile saved.";
      if (form.get("mode") === "onboarding") {
        window.history.pushState({ page: "overview" }, "", "/");
        setState({ candidate: { ...state.candidate, ...enrichedData }, activePage: "overview", message: "Profile complete. Welcome to Talent." });
      } else {
        setState({ candidate: { ...state.candidate, ...enrichedData }, message: savedMessage });
      }
    } catch (error) {
      setState({ message: friendlyAuthError(error) });
    }
  });
  document.querySelector("#cvForm")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const file = form.get("cv");
    if (!file?.name) return;
    if (!state.user) {
      setState({ message: "Sign in with Google to upload and store CVs." });
      return;
    }
    try {
      const cv = await uploadCandidateCv(state.user.uid, file, form.get("label"));
      setState({
        candidate: {
          ...state.candidate,
          cvLibrary: [...(state.candidate?.cvLibrary || []), cv],
          activeCvId: cv.id
        },
        message: "CV uploaded."
      });
    } catch (error) {
      setState({ message: friendlyAuthError(error) });
    }
  });
}

// ─── CV autofill (Affinda) ────────────────────────────────────────────────────
// NEW CANDIDATE  — the form is hidden behind the CV upload. Everything stays
//                  locked until Affinda finishes (or the user clicks "skip").
// RETURNING CANDIDATE — form shows normally. Uploading a new CV reveals a
//                  toggle "Update my profile from this CV" (default: off).

function bindCvAutofill() {
  const form    = document.querySelector("#profileForm");
  const cvInput = form?.querySelector('input[name="profileCv"]');
  if (!form || !cvInput) return;

  // A candidate is "new" if they haven't onboarded yet and have no profile data
  const isNew = form.querySelector('input[name="mode"]')?.value === "onboarding"
    && !state.candidate?.skills?.length
    && !state.candidate?.workHistory?.length
    && !state.candidate?.name;

  if (isNew) {
    _bindNewCandidateCvGate(form, cvInput);
  } else {
    _bindReturnCandidateCvToggle(cvInput);
  }
}

// ── New candidate: gate the form behind the CV upload ────────────────────────

function _bindNewCandidateCvGate(form, cvInput) {
  const cvCard = document.querySelector("#profileCvCard");
  if (!cvCard) return;

  // Hide every direct child of the form except the CV card and hidden inputs
  const hideable = [...form.children].filter(
    (el) => el !== cvCard && el.type !== "hidden" && el.getAttribute("name") !== "mode"
  );
  hideable.forEach((el) => { el.style.display = "none"; });

  // Gate prompt
  const gate = document.createElement("p");
  gate.id = "cvGatePrompt";
  gate.style.cssText = "font-size:13px;color:var(--mid);margin:10px 0 4px;text-align:center;";
  gate.innerHTML = `Upload your CV and we'll fill in the rest for you — or <button type="button" id="skipCvParse" style="background:none;border:none;padding:0;font-size:13px;color:var(--green);cursor:pointer;text-decoration:underline;">skip and fill in manually</button>`;
  cvCard.insertAdjacentElement("afterend", gate);

  function revealForm() {
    document.querySelector("#cvGatePrompt")?.remove();
    document.querySelector("#cvParseLoading")?.remove();
    hideable.forEach((el) => { el.style.display = ""; });
  }

  document.querySelector("#skipCvParse")?.addEventListener("click", revealForm);

  cvInput.addEventListener("change", async () => {
    const file = cvInput.files?.[0];
    if (!file) return;

    // Replace gate with loading message — form stays hidden
    document.querySelector("#cvGatePrompt")?.remove();
    const loading = document.createElement("p");
    loading.id = "cvParseLoading";
    loading.style.cssText = "font-size:13px;font-weight:600;color:var(--green);padding:14px 0;text-align:center;";
    loading.textContent = "Analysing your CV…";
    cvCard.insertAdjacentElement("afterend", loading);

    _cvParsedData = null;
    _cvOverwrite  = true; // new candidate — always overwrite (nothing to protect)
    const parsed  = await parseCvWithAffinda(file);

    revealForm(); // always reveal, even if parsing failed

    if (!parsed) return;

    _cvParsedData = parsed;
    _applyParsedToForm(parsed, true);
    _showCvParseBanner(parsed, cvInput);
  });
}

// ── Returning candidate: toggle below the CV file input ──────────────────────

function _bindReturnCandidateCvToggle(cvInput) {
  cvInput.addEventListener("change", () => {
    const file = cvInput.files?.[0];
    if (!file) return;

    _cvParsedData = null;
    _cvOverwrite  = false;
    document.querySelector("#cvRewriteWrap")?.remove();
    document.querySelector("#cvParseHint")?.remove();

    // Kick off parsing in background so it's ready when toggle is turned on
    const parsedPromise = parseCvWithAffinda(file);

    const wrap = document.createElement("div");
    wrap.id = "cvRewriteWrap";
    wrap.style.cssText = "margin-top:8px;";
    wrap.innerHTML = `<label style="display:flex;align-items:center;gap:6px;cursor:pointer;font-size:12px;color:var(--mid);"><input type="checkbox" id="cvRewriteCheck" style="accent-color:var(--green);width:14px;height:14px;" /> Update my profile information from this CV</label>`;
    cvInput.insertAdjacentElement("afterend", wrap);

    document.querySelector("#cvRewriteCheck").addEventListener("change", async (e) => {
      document.querySelector("#cvParseHint")?.remove();

      if (!e.target.checked) {
        _cvParsedData = null;
        _cvOverwrite  = false;
        return;
      }

      const hint = document.createElement("p");
      hint.id = "cvParseHint";
      hint.style.cssText = "font-size:12px;color:var(--green);margin:4px 0 0;";
      hint.textContent = "Analysing your CV…";
      wrap.insertAdjacentElement("afterend", hint);

      const parsed = await parsedPromise;

      if (!parsed) {
        hint.textContent = "Could not extract data from this CV. The file will still be saved.";
        return;
      }

      _cvParsedData = parsed;
      _cvOverwrite  = true;
      _applyParsedToForm(parsed, true);
      _showCvParseBanner(parsed, cvInput);
    });
  });
}

// ── Shared helpers ────────────────────────────────────────────────────────────

function _applyParsedToForm(parsed, overwrite) {
  const set = (sel, val) => {
    const el = document.querySelector(sel);
    if (el && val && (overwrite || !el.value?.trim())) el.value = val;
  };
  set('input[name="name"]',      parsed.name);
  set('input[name="whatsapp"]',  parsed.phone);
  set('textarea[name="summary"]', parsed.summary);

  if (parsed.skills?.length) {
    const wrap = document.querySelector("#selectedSkills");
    if (wrap) {
      if (overwrite) wrap.innerHTML = "";
      const existing = new Set([...wrap.querySelectorAll('input[name="skills"]')].map((i) => i.value.toLowerCase()));
      wrap.querySelector(".skill-empty")?.remove();
      parsed.skills.forEach((skill) => {
        if (existing.has(skill.toLowerCase())) return;
        existing.add(skill.toLowerCase());
        const span = document.createElement("span");
        span.className = "selected-skill";
        span.innerHTML = `${escapeHtml(skill)}<button type="button" data-skill="${escapeAttr(skill)}">&times;</button><input type="hidden" name="skills" value="${escapeAttr(skill)}" />`;
        wrap.appendChild(span);
      });
    }
  }
}

function _showCvParseBanner(parsed, cvInput) {
  const parts = [];
  if (parsed.name)                parts.push("name");
  if (parsed.phone)               parts.push("phone");
  if (parsed.skills?.length)      parts.push(`${parsed.skills.length} skill${parsed.skills.length > 1 ? "s" : ""}`);
  if (parsed.workHistory?.length) parts.push(`${parsed.workHistory.length} work entr${parsed.workHistory.length > 1 ? "ies" : "y"}`);

  document.querySelector("#cvParseHint")?.remove();
  const hint = document.createElement("p");
  hint.id = "cvParseHint";
  hint.style.cssText = "font-size:12px;color:var(--green);margin:4px 0 0;";
  hint.innerHTML = parts.length
    ? `✓ Pre-filled: <strong>${parts.join(", ")}</strong>. Review and save.`
    : "✓ CV analysed. Review your profile and save.";
  cvInput.insertAdjacentElement("afterend", hint);
}

function bindSkillSearch() {
  const shell = document.querySelector("[data-skill-search]");
  if (!shell) return;
  const input = shell.querySelector("#skillSearchInput");
  const suggestions = shell.querySelector("#skillSuggestions");
  const selectedWrap = shell.querySelector("#selectedSkills");

  const selected = () => [...selectedWrap.querySelectorAll('input[name="skills"]')].map((item) => item.value);
  const renderSelected = (skills) => {
    selectedWrap.innerHTML = skills.length ? skills.map((skill) => `
      <span class="selected-skill" data-skill-chip="${escapeAttr(skill)}">
        ${escapeHtml(skill)}
        <button type="button" class="skill-remove" data-remove-skill="${escapeAttr(skill)}" aria-label="Remove ${escapeAttr(skill)}">×</button>
        <input type="hidden" name="skills" value="${escapeAttr(skill)}" />
      </span>`).join("") : '<span class="skill-empty">Selected skills will appear here.</span>';
  };
  const renderSuggestions = () => {
    const queryText = normalizeSkillName(input.value);
    const current = new Set(selected().map(normalizeSkillName));
    const matches = ALL_SKILLS
      .filter((skill) => !current.has(normalizeSkillName(skill)))
      .filter((skill) => !queryText || normalizeSkillName(skill).includes(queryText))
      .slice(0, 18);
    suggestions.innerHTML = matches.length
      ? matches.map((skill) => `<button type="button" class="skill-suggestion" data-skill="${escapeAttr(skill)}">${escapeHtml(skill)}</button>`).join("")
      : `<button type="button" class="skill-suggestion add-custom" data-skill="${escapeAttr(input.value)}">Add "${escapeHtml(input.value)}"</button>`;
  };
  const addSkill = (value) => {
    const skill = canonicalSkillName(value || input.value);
    if (!skill) return;
    const normalized = normalizeSkillName(skill);
    const next = [...selected().filter((item) => normalizeSkillName(item) !== normalized), skill];
    renderSelected(next);
    input.value = "";
    renderSuggestions();
  };

  input?.addEventListener("input", renderSuggestions);
  input?.addEventListener("focus", renderSuggestions);
  input?.addEventListener("keydown", (event) => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    const first = suggestions.querySelector(".skill-suggestion");
    addSkill(first?.dataset.skill || input.value);
  });
  shell.querySelector("#addTypedSkill")?.addEventListener("click", () => addSkill(input.value));
  suggestions.addEventListener("click", (event) => {
    const button = event.target.closest("[data-skill]");
    if (button) addSkill(button.dataset.skill);
  });
  selectedWrap.addEventListener("click", (event) => {
    const button = event.target.closest("[data-remove-skill]");
    if (!button) return;
    const remove = normalizeSkillName(button.dataset.removeSkill);
    renderSelected(selected().filter((skill) => normalizeSkillName(skill) !== remove));
    renderSuggestions();
  });
}

function render() {
  if (state.loading) return renderLoading();
  if (state.view === "dashboard") return renderDashboard();
  renderLogin();
}

window.addEventListener("popstate", () => {
  const page = pageFromPath();
  if (page === "overview" && !state.user) {
    setState({ view: "login", activePage: "overview", message: "" });
  } else if (state.view === "dashboard") {
    setActivePage(page, false);
  } else {
    loadPublicPage();
  }
});

if (hasFirebaseConfig) {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      loadDashboard(user);
    } else {
      // Clear any cached applied/session data so stale badges don't survive
      // account deletion or external session revocation.
      try { localStorage.removeItem("nw_talent_applied"); } catch {}
      loadPublicPage();
    }
  });
  window.setTimeout(() => {
    if (state.loading) loadPublicPage();
  }, 2500);
} else {
  loadPublicPage();
}
