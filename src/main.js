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

const candidateRoles = [
  "Customer Success Manager",
  "SDR / Sales Development Rep",
  "Technical Support Specialist",
  "Marketing Ops / Content Specialist",
  "Operations Manager",
  "Software Developer (Full Stack)",
  "Executive Assistant",
  "Account Manager",
  "Implementation Specialist"
];

const canonicalLocations = [
  { value: "remote-colombia", label: "Remote, Colombia", city: "Remote", country: "Colombia", precision: "country" },
  { value: "bogota-co", label: "Bogotá, Colombia", city: "Bogotá", country: "Colombia", precision: "city" },
  { value: "medellin-co", label: "Medellín, Colombia", city: "Medellín", country: "Colombia", precision: "city" },
  { value: "cali-co", label: "Cali, Colombia", city: "Cali", country: "Colombia", precision: "city" },
  { value: "barranquilla-co", label: "Barranquilla, Colombia", city: "Barranquilla", country: "Colombia", precision: "city" },
  { value: "cartagena-co", label: "Cartagena, Colombia", city: "Cartagena", country: "Colombia", precision: "city" },
  { value: "bucaramanga-co", label: "Bucaramanga, Colombia", city: "Bucaramanga", country: "Colombia", precision: "city" },
  { value: "pereira-co", label: "Pereira, Colombia", city: "Pereira", country: "Colombia", precision: "city" },
  { value: "manizales-co", label: "Manizales, Colombia", city: "Manizales", country: "Colombia", precision: "city" }
];

const skillOptions = [
  "SaaS",
  "Customer Success",
  "HubSpot",
  "Salesforce",
  "Outbound",
  "Technical Support",
  "APIs",
  "Excel",
  "SQL",
  "Operations",
  "Content",
  "English C1",
  "Design",
  "JavaScript",
  "React"
];

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
  const nextPage = navItems().some(([key]) => key === page) ? page : "overview";
  state = { ...state, activePage: nextPage, message: "" };
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

function selectedLocation() {
  const stored = state.candidate?.locationId || state.candidate?.location;
  return canonicalLocations.find((location) => location.value === stored || location.label === stored) || canonicalLocations[0];
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
  if (code.includes("operation-not-allowed")) return "This sign-in method is not enabled in Firebase Authentication.";
  if (code.includes("unauthorized-domain")) return "Add this domain in Firebase Authentication authorized domains.";
  if (code.includes("permission-denied")) return "Firestore rules blocked saving or reading the candidate profile.";
  if (code.includes("weak-password")) return "Password must be at least 6 characters.";
  if (code.includes("invalid-credential") || code.includes("wrong-password")) return "That email/password did not match. If this account was created with Google, use Continue with Google.";
  if (code.includes("user-not-found")) return "No Firebase Auth account exists for that email yet.";
  if (code.includes("email-already-in-use")) return "That email already has an account. Sign in or use Google.";
  if (code.includes("popup")) return "The Google sign-in popup was closed before finishing.";
  return String(error?.message || "Something went wrong. Please try again.").replace("Firebase: ", "");
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
      ${hasFirebaseConfig ? "" : `<div class="notice">${icon("triangle-alert")} Firebase config is missing.</div>`}
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
    const [candidate, applications, jobs] = await Promise.all([
      getCandidateForAuthUser(user),
      listCandidateApplications(user.uid),
      listOpenJobs()
    ]);
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
      activePage: pageFromPath()
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
      message: friendlyAuthError(error)
    });
  }
}

function renderDashboard() {
  app.innerHTML = `
    <main class="dashboard">
      <aside class="sidebar">
        <div class="brand-top"><span class="wordmark">Near<span>work</span></span></div>
        <div class="candidate-card">
          <div class="avatar">${initials()}</div>
          <strong>${state.candidate?.name || state.user?.displayName || "Talent member"}</strong>
          <span>${state.candidate?.headline || state.candidate?.targetRole || "Nearwork candidate"}</span>
        </div>
        <nav>
          ${navItems().map(([key, iconName, label]) => `
            <button class="${state.activePage === key ? "active" : ""}" data-page="${key}">${icon(iconName)} ${label}</button>
          `).join("")}
        </nav>
        <button id="signOut" class="ghost-action">${icon("log-out")} Sign out</button>
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
  return `
    <section class="hero-card">
      <div><p class="eyebrow">Nearwork talent</p><h2>${firstName()}, your profile is ${profileCompletion()}% ready.</h2><p>Complete your profile, keep a tailored CV ready, and follow your pipeline from application to decision.</p></div>
      <button class="primary-action fit" data-page="profile">${icon("arrow-right")} Complete profile</button>
    </section>
    <section class="summary-grid">
      ${metricCard("Best match", `${Math.max(...state.jobs.map((job) => job.match || 78))}%`, "sparkles")}
      ${metricCard("Applications", state.applications.length, "send")}
      ${metricCard("CVs saved", (state.candidate?.cvLibrary || []).length, "files")}
      ${metricCard("Availability", state.candidate?.availability || "open", "calendar-check")}
    </section>
    <section class="content-grid">
      <div class="section-block"><div class="section-heading"><div><p class="eyebrow">Now</p><h2>Talent pipeline</h2></div></div>${pipelineView(currentStage())}</div>
      <div class="section-block compact"><div class="section-heading"><div><p class="eyebrow">Recruiter</p><h2>Need help?</h2></div></div>${recruiterCard()}</div>
    </section>
  `;
}

function renderMatches() {
  const preferredRole = state.candidate?.targetRole || state.candidate?.headline || "";
  const skills = candidateSkills();
  const filteredJobs = state.jobs.map(normalizeRole).filter((job) => {
    const roleNeedle = preferredRole.toLowerCase().split("/")[0].trim();
    const roleMatch = roleNeedle ? job.title.toLowerCase().includes(roleNeedle) : false;
    const skillMatch = skills.length ? skills.some((skill) => job.skills.join(" ").toLowerCase().includes(skill.toLowerCase())) : false;
    return roleMatch || skillMatch;
  });
  return `
    <section class="section-block">
      <div class="section-heading">
        <div><p class="eyebrow">Openings</p><h2>All current openings</h2></div>
        <button id="filterMatches" class="secondary-action" type="button">${icon("filter")} Filter by my role & skills</button>
      </div>
      <div class="match-note"><strong>${state.jobs.length}</strong> openings loaded. Role: <strong>${preferredRole || "not set"}</strong>. Skills: <strong>${skills.join(", ") || "not set"}</strong>.</div>
      <div class="job-list">${state.jobs.map((job) => jobCard(job)).join("")}</div>
      <div id="filteredMatches" class="job-list page-gap is-hidden">
        <div class="section-heading inner"><div><p class="eyebrow">Filtered</p><h2>Best fit from profile</h2></div></div>
        ${filteredJobs.length ? filteredJobs.map((job) => jobCard(job)).join("") : emptyState("No filtered matches yet", "Add a target role and skills in Profile to improve matching.")}
      </div>
    </section>
  `;
}

function renderApplications() {
  return `
    <section class="section-block">
      <div class="section-heading"><div><p class="eyebrow">Pipeline</p><h2>Your applications</h2></div></div>
      ${pipelineView(currentStage())}
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
  return `
    <section class="content-grid">
      <div class="section-block"><div class="section-heading"><div><p class="eyebrow">Recruiter</p><h2>Your Nearwork contact</h2></div></div>${recruiterCard(true)}</div>
      <div class="section-block compact"><div class="section-heading"><div><p class="eyebrow">Booking</p><h2>Schedule soon</h2></div></div><p class="muted">Candidates should be able to book no further than 4 days out. Connect this button to your recruiter booking page when ready.</p><a class="primary-action fit" href="https://nearwork.co" target="_blank" rel="noreferrer">${icon("calendar-plus")} Book recruiter call</a></div>
    </section>
  `;
}

function renderProfile() {
  const skills = candidateSkills();
  const location = selectedLocation();
  return `
    <section class="section-block">
      <div class="section-heading"><div><p class="eyebrow">Profile</p><h2>Improve your match quality</h2></div><span class="profile-score">${profileCompletion()}%</span></div>
      <form id="profileForm" class="profile-form">
        <label>Full name<input name="name" value="${escapeAttr(state.candidate?.name || state.user?.displayName || "")}" /></label>
        <label>Role applying for<select name="targetRole"><option value="">Select a role</option>${candidateRoles.map((role) => `<option value="${escapeAttr(role)}" ${state.candidate?.targetRole === role || state.candidate?.headline === role ? "selected" : ""}>${role}</option>`).join("")}</select></label>
        <label>Canonical location<select name="locationId">${canonicalLocations.map((item) => `<option value="${item.value}" ${location.value === item.value ? "selected" : ""}>${item.label}</option>`).join("")}</select></label>
        <label>Location precision<select name="locationPrecision"><option value="city" ${state.candidate?.locationPrecision === "city" ? "selected" : ""}>City-level filtering</option><option value="country" ${state.candidate?.locationPrecision === "country" ? "selected" : ""}>Country-level remote</option><option value="timezone" ${state.candidate?.locationPrecision === "timezone" ? "selected" : ""}>Timezone only</option></select></label>
        <label>English level<select name="english">${["", "B1", "B2", "C1", "C2", "Native"].map((level) => `<option value="${level}" ${state.candidate?.english === level ? "selected" : ""}>${level || "Select level"}</option>`).join("")}</select></label>
        <label>Target salary<input name="salary" value="${escapeAttr(state.candidate?.salary || "")}" placeholder="$2,800/mo USD" /></label>
        <label>LinkedIn<input name="linkedin" value="${escapeAttr(state.candidate?.linkedin || "")}" placeholder="https://linkedin.com/in/..." /></label>
        <div class="wide"><div class="field-label">Skills</div><div class="skills-picker">${skillOptions.map((skill) => `<label><input type="checkbox" name="skills" value="${escapeAttr(skill)}" ${skills.includes(skill) ? "checked" : ""} /><span>${skill}</span></label>`).join("")}</div></div>
        <label class="wide">Summary<textarea name="summary" placeholder="Tell Nearwork what roles you want and what you do best.">${state.candidate?.summary || ""}</textarea></label>
        <button class="primary-action fit" type="submit">${icon("save")} Save profile</button>
      </form>
    </section>
  `;
}

function profileCompletion() {
  const fields = ["name", "targetRole", "locationId", "english", "salary", "linkedin", "summary"];
  const filled = fields.filter((field) => Boolean(state.candidate?.[field] || (field === "targetRole" && state.candidate?.headline))).length + (candidateSkills().length ? 1 : 0);
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
  return `<article class="recruiter-card"><div class="avatar recruiter-avatar">NW</div><div><strong>${recruiter.name || "Nearwork Recruiting Team"}</strong><p>${recruiter.email || "talent@nearwork.co"}</p>${full ? `<span>Questions about assessments, interviews, feedback, or CV selection should go here.</span>` : ""}</div></article>`;
}

function emptyState(title, body) {
  return `<div class="empty-state">${icon("inbox")}<strong>${title}</strong><p>${body}</p></div>`;
}

function renderLoading() {
  app.innerHTML = `<main class="loading-screen"><span class="logo-mark">N</span><p>Loading Talent...</p></main>`;
}

function bindDashboardEvents() {
  document.querySelector("#signOut").addEventListener("click", () => signOut(auth));
  document.querySelectorAll("[data-page]").forEach((button) => {
    button.addEventListener("click", () => setActivePage(button.dataset.page));
  });
  document.querySelector("#availability").addEventListener("change", async (event) => {
    const availability = event.target.value;
    setState({ candidate: { ...state.candidate, availability } });
    if (state.user && hasFirebaseConfig) await updateCandidateAvailability(state.user.uid, availability);
  });
  document.querySelector("#filterMatches")?.addEventListener("click", () => {
    document.querySelector("#filteredMatches")?.classList.toggle("is-hidden");
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
      }
    });
  });
  document.querySelector("#profileForm")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const location = canonicalLocations.find((item) => item.value === form.get("locationId")) || canonicalLocations[0];
    const data = {
      name: form.get("name"),
      targetRole: form.get("targetRole"),
      headline: form.get("targetRole"),
      locationId: location.value,
      location: location.label,
      locationCity: location.city,
      locationCountry: location.country,
      locationPrecision: form.get("locationPrecision") || location.precision,
      english: form.get("english"),
      salary: form.get("salary"),
      linkedin: form.get("linkedin"),
      skills: form.getAll("skills"),
      summary: form.get("summary")
    };
    try {
      await updateCandidateProfile(state.user.uid, data);
      setState({ candidate: { ...state.candidate, ...data }, message: "Profile saved." });
    } catch (error) {
      setState({ message: friendlyAuthError(error) });
    }
  });
  document.querySelector("#cvForm")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const file = form.get("cv");
    if (!file?.name) return;
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
  if (state.view === "dashboard" && state.user) return renderDashboard();
  renderLogin();
}

window.addEventListener("popstate", () => {
  if (state.view === "dashboard") setActivePage(pageFromPath(), false);
});

if (hasFirebaseConfig) {
  onAuthStateChanged(auth, (user) => {
    if (user) loadDashboard(user);
    else setState({ user: null, candidate: null, loading: false, view: "login" });
  });
} else {
  setState({ loading: false, view: "login" });
}
