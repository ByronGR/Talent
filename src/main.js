import {
  applyToJob,
  auth,
  createUserWithEmailAndPassword,
  getCandidateForAuthUser,
  hasFirebaseConfig,
  listCandidateApplications,
  listOpenJobs,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithGoogle,
  signOut,
  updateCandidateAvailability,
  updateCandidateProfile,
  updateProfile,
  uploadCandidateCv,
  uploadCandidatePhoto,
  upsertCandidate
} from "./firebase.js";

const app = document.querySelector("#app");

const demoJobs = [
  {
    id: "OPEN-CSM-DEMO",
    code: "OPEN-CSM-DEMO",
    title: "Customer Success Manager",
    orgName: "US SaaS company",
    location: "Remote, Colombia",
    compensation: "$2,000-$2,800/mo USD",
    match: 94,
    skills: ["SaaS", "Customer Success", "English C1", "QBRs"],
    description: "Own onboarding, adoption, renewals, and expansion for a portfolio of US-based SaaS clients."
  },
  {
    id: "OPEN-SDR-DEMO",
    code: "OPEN-SDR-DEMO",
    title: "SDR / Sales Development Rep",
    orgName: "B2B marketplace",
    location: "Remote",
    compensation: "$1,700-$2,200/mo USD",
    match: 89,
    skills: ["HubSpot", "Outbound", "Salesforce", "English C1"],
    description: "Qualify outbound leads, book demos, and work closely with a high-performing US sales team."
  },
  {
    id: "OPEN-SUP-DEMO",
    code: "OPEN-SUP-DEMO",
    title: "Technical Support Specialist",
    orgName: "Cloud workflow platform",
    location: "Remote, LatAm",
    compensation: "$1,400-$1,900/mo USD",
    match: 86,
    skills: ["Technical Support", "APIs", "Tickets", "Troubleshooting"],
    description: "Handle Tier 1 and Tier 2 support, troubleshoot product issues, and maintain excellent CSAT."
  }
];

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
  { key: "applied", label: "Applied", help: "Your profile is in Nearwork review." },
  { key: "profile", label: "Profile Review", help: "We are checking role fit, CV, and background." },
  { key: "assessment", label: "Assessment", help: "Complete role-specific questions when assigned." },
  { key: "interview", label: "Interview", help: "Meet the recruiter or client team." },
  { key: "decision", label: "Decision", help: "Final feedback or offer decision." }
];

let state = {
  user: null,
  candidate: null,
  applications: [],
  jobs: [],
  loading: true,
  view: "login",
  activePage: "overview",
  matchesFiltered: false,
  message: ""
};

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
  const segment = window.location.pathname.split("/").filter(Boolean)[0];
  if (segment === "onboarding") return "onboarding";
  return navItems().some(([key]) => key === segment) ? segment : "overview";
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
  state = { ...state, activePage: nextPage, matchesFiltered: nextPage === "matches" ? state.matchesFiltered : false, message: "" };
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

function isPlaceholderRole(value) {
  return ["Nearwork candidate", "Preview mode", "Talent member"].includes(String(value || "").trim());
}

function isProfileComplete() {
  return profileCompletion() >= 100;
}

function candidateHasPipeline() {
  return Boolean((state.applications || []).length || (state.candidate?.pipelineCodes || []).length || state.candidate?.pipelineCode);
}

function selectedLocation() {
  const department = state.candidate?.department || "Bogotá D.C.";
  const cities = colombiaLocations[department] || colombiaLocations["Bogotá D.C."];
  const city = state.candidate?.city || state.candidate?.locationCity || cities[0];
  return { department, city, label: `${city}, ${department}` };
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

function skillCardsMarkup(selectedSkills) {
  return Object.entries(skillGroups).map(([group, skills]) => `
    <fieldset class="skill-group">
      <legend>${escapeAttr(group)}</legend>
      <div class="skill-picker">
        ${skills.map((skill) => `
          <label class="skill-choice">
            <input type="checkbox" name="skills" value="${escapeAttr(skill)}" ${selectedSkills.includes(skill) ? "checked" : ""} />
            <span>${escapeAttr(skill)}</span>
          </label>
        `).join("")}
      </div>
    </fieldset>
  `).join("");
}

function normalizeSalaryValue(value) {
  const numeric = Number(String(value || "").replace(/[^\d.]/g, ""));
  if (!Number.isFinite(numeric) || numeric <= 0) return { salary: "", salaryUSD: null };
  const rounded = Math.round(numeric);
  return {
    salary: `$${new Intl.NumberFormat("en-US").format(rounded)}/mo USD`,
    salaryUSD: rounded
  };
}

function normalizeRole(job) {
  return {
    id: job.id || job.code,
    code: job.code || job.id,
    title: job.title || job.role || job.openingTitle || "Open role",
    orgName: job.orgName || job.company || job.clientName || "Nearwork client",
    location: job.location || "Remote",
    compensation: job.compensation || job.salary || job.rate || "Competitive",
    match: job.match || 82,
    skills: job.skills || job.requiredSkills || [],
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
      ${hasFirebaseConfig ? "" : `<div class="notice">${icon("triangle-alert")} Sign-in is still being set up.</div>`}
      <button id="googleSignIn" class="social-action" type="button">
        <span class="google-dot">G</span>
        Continue with Google
      </button>
      <div class="divider"><span></span>or use email<span></span></div>
      <form id="authForm" class="stacked-form">
        ${isSignup ? `<label>Full name<input name="name" type="text" autocomplete="name" placeholder="Byron Giraldo" required /></label>` : ""}
        <label>Email<input name="email" type="email" autocomplete="email" placeholder="you@example.com" required /></label>
        <label>Password<input name="password" type="password" autocomplete="${isSignup ? "new-password" : "current-password"}" minlength="6" placeholder="••••••••" required /></label>
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
    try {
      await signInWithGoogle();
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
          onboarded: false
        });
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
    const [candidateResult, applicationsResult, jobsResult] = await Promise.allSettled([
      getCandidateForAuthUser(user),
      listCandidateApplications(user.uid),
      listOpenJobs()
    ]);
    const candidate = candidateResult.status === "fulfilled" ? candidateResult.value : null;
    const applications = applicationsResult.status === "fulfilled" ? applicationsResult.value : [];
    const jobs = jobsResult.status === "fulfilled" ? jobsResult.value : demoJobs;
    const isNewAccount = sessionStorage.getItem("nw_new_account") === "1";
    if (isNewAccount) sessionStorage.removeItem("nw_new_account");
    const activePage = isNewAccount && candidate?.onboarded !== true ? "onboarding" : pageFromPath();
    setState({
      candidate: {
        ...(candidate || {}),
        name: candidate?.name || user.displayName || "Talent member",
        email: candidate?.email || user.email,
        availability: candidate?.availability || "open",
        headline: candidate?.headline || candidate?.targetRole || "Nearwork candidate"
      },
      applications,
      jobs: jobs.length ? jobs.map(normalizeRole) : demoJobs,
      loading: false,
      view: "dashboard",
      activePage,
      message: ""
    });
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
      jobs: demoJobs,
      loading: false,
      view: "dashboard",
      activePage: pageFromPath(),
      message: ""
    });
  }
}

async function loadPublicPage() {
  const activePage = pageFromPath();
  if (activePage === "overview") {
    setState({ user: null, candidate: null, loading: false, view: "login", activePage: "overview" });
    return;
  }

  let jobs = demoJobs;
  try {
    const openings = await listOpenJobs();
    if (openings.length) jobs = openings.map(normalizeRole);
  } catch (error) {
    console.warn(error);
  }

  setState({
    user: null,
    candidate: {
      name: "Guest candidate",
      availability: "open",
      headline: "Preview mode"
    },
    applications: [],
    jobs,
    loading: false,
    view: "dashboard",
    activePage,
    message: "Preview mode. Sign in with Google to save your profile, apply, upload CVs, or track your actual pipeline."
  });
}

function renderDashboard() {
  app.innerHTML = `
    <main class="dashboard">
      <aside class="sidebar">
        <div class="brand-top"><span class="wordmark">Near<span>work</span></span></div>
        <div class="candidate-card">
          ${avatarMarkup()}
          <strong>${state.candidate?.name || state.user?.displayName || "Talent member"}</strong>
          <span>${state.candidate?.headline || state.candidate?.targetRole || "Nearwork candidate"}</span>
        </div>
        <nav>
          ${navItems().map(([key, iconName, label]) => `
            <button class="${state.activePage === key ? "active" : ""}" data-page="${key}">${icon(iconName)} ${label}</button>
          `).join("")}
        </nav>
        <button id="${state.user ? "signOut" : "signIn"}" class="ghost-action">${icon(state.user ? "log-out" : "log-in")} ${state.user ? "Sign out" : "Sign in"}</button>
      </aside>
      <section class="workspace">
        <header class="topbar">
          <div><p class="eyebrow">Candidate workspace</p><h1>${pageTitle()}</h1></div>
          <label class="availability">Availability
            <select id="availability">
              ${["open", "interviewing", "paused"].map((value) => `<option value="${value}" ${state.candidate?.availability === value ? "selected" : ""}>${value}</option>`).join("")}
            </select>
          </label>
        </header>
        ${state.message ? `<div class="notice">${state.message}</div>` : ""}
        ${renderActivePage()}
      </section>
    </main>
  `;
  syncIcons();
  bindDashboardEvents();
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
  return `
    ${complete ? "" : `
      <section class="hero-card">
        <div><p class="eyebrow">Action needed</p><h2>Finish your profile to unlock matches.</h2><p>Add your role, city, salary, and skills so Nearwork can match you to the right openings.</p></div>
        <button class="primary-action fit" data-page="profile">${icon("arrow-right")} Complete profile</button>
      </section>
    `}
    <section class="summary-grid">
      ${metricCard("Best match", `${Math.max(...state.jobs.map((job) => job.match || 78))}%`, "sparkles")}
      ${metricCard("Applications", state.applications.length, "send")}
      ${metricCard("CVs saved", (state.candidate?.cvLibrary || []).length, "files")}
      ${metricCard("Availability", state.candidate?.availability || "open", "calendar-check")}
    </section>
    <section class="content-grid">
      <div class="section-block"><div class="section-heading"><div><p class="eyebrow">Now</p><h2>${hasPipeline ? "Talent pipeline" : "Find your next opening"}</h2></div></div>${hasPipeline ? pipelineView(currentStage()) : noPipelineView()}</div>
      <div class="section-block compact"><div class="section-heading"><div><p class="eyebrow">Recruiter</p><h2>Need help?</h2></div></div>${recruiterCard()}</div>
    </section>
  `;
}

function renderOnboarding() {
  return `
    <section class="onboarding-hero">
      <div>
        <p class="eyebrow">New candidate setup</p>
        <h2>Tell Nearwork what role, city, salary, and skills fit you best.</h2>
        <p>This only appears as a first-run setup. After you submit it, you will land in the Talent workspace.</p>
      </div>
    </section>
    ${renderProfileForm("onboarding")}
  `;
}

function renderMatches() {
  const preferredRole = state.candidate?.targetRole || (!isPlaceholderRole(state.candidate?.headline) ? state.candidate?.headline : "");
  const skills = candidateSkills();
  const normalizedSkills = skills.map((skill) => skill.toLowerCase());
  const filteredJobs = state.jobs.map(normalizeRole).filter((job) => {
    const roleWords = preferredRole.toLowerCase().split(/[^a-z0-9]+/).filter((word) => word.length > 2);
    const haystack = [job.title, job.description, job.skills.join(" ")].join(" ").toLowerCase();
    const roleMatch = roleWords.length ? roleWords.some((word) => haystack.includes(word)) : false;
    const skillMatch = normalizedSkills.length ? normalizedSkills.some((skill) => haystack.includes(skill)) : false;
    return roleMatch || skillMatch;
  });
  const canFilter = Boolean(preferredRole || skills.length);
  const visibleJobs = state.matchesFiltered && canFilter ? filteredJobs : state.jobs.map(normalizeRole);
  const filteredEmpty = state.matchesFiltered && !filteredJobs.length;
  return `
    <section class="section-block">
      <div class="section-heading">
        <div><p class="eyebrow">Openings</p><h2>${state.matchesFiltered ? "Best fit from your profile" : "All current openings"}</h2></div>
        <button id="filterMatches" class="secondary-action" type="button">${icon(state.matchesFiltered ? "list" : "filter")} ${state.matchesFiltered ? "Show all openings" : "Filter by my role & skills"}</button>
      </div>
      <div class="match-note"><strong>${visibleJobs.length}</strong> of <strong>${state.jobs.length}</strong> openings showing. Role: <strong>${preferredRole || "not set"}</strong>. Skills: <strong>${skills.join(", ") || "not set"}</strong>.</div>
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
  return `
    <section class="assessment-hero">
      <div><p class="eyebrow">Assessment</p><h2>Complete role-specific questions when Nearwork assigns them.</h2><p>Your assessment will include English, work simulation, and role-specific scenarios. Results are reviewed by the Nearwork recruiting team.</p></div>
      <button class="primary-action fit" type="button" disabled>${icon("lock")} Not assigned yet</button>
    </section>
    <section class="info-grid">${infoCard("One attempt", "Retakes are only opened by your recruiter when needed.")}${infoCard("Timed work", "Most role assessments take 45-90 minutes.")}${infoCard("Recruiter review", "You will get next steps or respectful feedback after review.")}</section>
  `;
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
  const cities = colombiaLocations[location.department] || [];
  const normalizedSalary = normalizeSalaryValue(state.candidate?.salary || state.candidate?.salaryUSD);
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
                ${Object.keys(colombiaLocations).map((department) => `<option value="${escapeAttr(department)}" ${department === location.department ? "selected" : ""}>${department}</option>`).join("")}
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
              <div class="salary-field"><span>USD</span><input id="salaryInput" name="salary" value="${escapeAttr(normalizedSalary.salary || "")}" inputmode="numeric" placeholder="1000" /></div>
            </label>
            <label>English level<select name="english">${["", "B1", "B2", "C1", "C2", "Native"].map((level) => `<option value="${level}" ${state.candidate?.english === level ? "selected" : ""}>${level || "Select level"}</option>`).join("")}</select></label>
          </div>
        </div>
        <label class="wide">LinkedIn <span class="optional-label">optional</span><input name="linkedin" value="${escapeAttr(state.candidate?.linkedin || "")}" placeholder="https://linkedin.com/in/..." /></label>
        <div class="profile-card wide">
          <div class="field-label">Skills</div>
          <p class="field-hint">Tap the skills that best match your experience.</p>
          ${skillCardsMarkup(skills)}
        </div>
        <div class="profile-card wide">
          <div class="field-label">CV</div>
          <p class="field-hint">Upload the CV you want Nearwork to use for your applications.</p>
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
  const fields = ["name", "targetRole", "department", "city", "english", "salary"];
  const filled = fields.filter((field) => {
    if (field === "targetRole") return Boolean(state.candidate?.targetRole || (!isPlaceholderRole(state.candidate?.headline) && state.candidate?.headline));
    return Boolean(state.candidate?.[field]);
  }).length + (candidateSkills().length ? 1 : 0);
  return Math.max(25, Math.round((filled / (fields.length + 1)) * 100));
}

function currentStage() {
  const first = state.applications[0];
  return first?.stage || first?.status || "profile";
}

function pipelineView(activeStage) {
  const activeIndex = Math.max(0, pipelineStages.findIndex((stage) => activeStage?.toLowerCase().includes(stage.key)));
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

function jobCard(job) {
  const role = normalizeRole(job);
  const applied = new Set(state.applications.map((item) => item.jobId || item.openingCode)).has(role.code);
  return `
    <article class="job-card">
      <div><div class="match-pill">${role.match}% match</div><h3>${role.title}</h3><p>${role.orgName} · ${role.location}</p></div>
      <p class="job-description">${role.description}</p>
      <div class="skill-row">${role.skills.slice(0, 4).map((skill) => `<span>${skill}</span>`).join("")}</div>
      <div class="job-footer"><strong>${role.compensation}</strong><button class="secondary-action" type="button" data-apply="${role.code}" ${applied ? "disabled" : ""}>${applied ? "Applied" : "Apply"}</button></div>
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
  return `<article class="recruiter-card"><div class="avatar recruiter-avatar">NW</div><div><strong>${recruiter.name || "Nearwork Support"}</strong><p><a href="mailto:${email}">${email}</a></p>${full ? `<span>Questions about assessments, interviews, feedback, or CV selection should go here.</span>` : ""}</div></article>`;
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
    window.history.pushState({ page: "overview" }, "", "/");
    setState({ user: null, candidate: null, applications: [], jobs: [], view: "login", activePage: "overview", message: "" });
  });
  document.querySelector("#signIn")?.addEventListener("click", () => {
    window.history.pushState({ page: "overview" }, "", "/");
    setState({ view: "login", activePage: "overview", message: "" });
  });
  document.querySelectorAll("[data-page]").forEach((button) => {
    button.addEventListener("click", () => setActivePage(button.dataset.page));
  });
  document.querySelector("#availability").addEventListener("change", async (event) => {
    const availability = event.target.value;
    setState({ candidate: { ...state.candidate, availability } });
    if (state.user && hasFirebaseConfig) await updateCandidateAvailability(state.user.uid, availability);
    else setState({ message: "Sign in with Google to save availability." });
  });
  document.querySelector("#filterMatches")?.addEventListener("click", () => {
    const hasProfileSignals = Boolean((state.candidate?.targetRole || (!isPlaceholderRole(state.candidate?.headline) && state.candidate?.headline)) || candidateSkills().length);
    setState({
      matchesFiltered: hasProfileSignals ? !state.matchesFiltered : false,
      message: hasProfileSignals ? "" : "Add your role and skills in Profile first, then filter openings."
    });
  });
  document.querySelector("#departmentSelect")?.addEventListener("change", (event) => {
    const citySelect = document.querySelector("#citySelect");
    const cities = colombiaLocations[event.target.value] || [];
    citySelect.innerHTML = cities.map((city) => `<option value="${escapeAttr(city)}">${city}</option>`).join("");
  });
  document.querySelector("#roleGroupSelect")?.addEventListener("change", (event) => {
    const targetRoleSelect = document.querySelector("#targetRoleSelect");
    targetRoleSelect.innerHTML = roleOptionsForGroup(event.target.value, "");
  });
  document.querySelector("#salaryInput")?.addEventListener("blur", (event) => {
    const normalized = normalizeSalaryValue(event.target.value);
    if (normalized.salary) event.target.value = normalized.salary;
  });
  document.querySelectorAll("[data-apply]").forEach((button) => {
    button.addEventListener("click", async () => {
      const job = state.jobs.map(normalizeRole).find((item) => item.code === button.dataset.apply);
      button.disabled = true;
      button.textContent = "Submitted";
      if (state.user && hasFirebaseConfig) {
        await applyToJob(state.user.uid, job);
        await loadDashboard(state.user);
        setActivePage("applications");
      } else {
        setState({ message: "Sign in with Google to apply to this opening." });
      }
    });
  });
  document.querySelector("#profileForm")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const department = form.get("department");
    const city = form.get("city");
    const salary = normalizeSalaryValue(form.get("salary"));
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
      linkedin: form.get("linkedin"),
      skills: form.getAll("skills"),
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
      const cvFile = form.get("profileCv");
      let cv = null;
      if (cvFile?.name) {
        cv = await uploadCandidateCv(state.user.uid, cvFile, form.get("profileCvLabel"));
      }
      const enrichedData = {
        ...data,
        photoURL,
        ...(cv ? {
          activeCvId: cv.id,
          activeCvName: cv.name || cv.fileName,
          cvLibrary: [...(state.candidate?.cvLibrary || []), cv]
        } : {})
      };
      const result = await updateCandidateProfile(state.user.uid, enrichedData);
      const savedMessage = result?.atsSynced === false ? "Profile saved. Nearwork will finish connecting it to your workspace." : "Profile saved.";
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
    if (user) loadDashboard(user);
    else loadPublicPage();
  });
} else {
  loadPublicPage();
}
