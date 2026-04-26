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
    skills: ["SaaS", "QBRs", "English C1"],
    description: "Own customer onboarding, adoption, renewals, and expansion for a portfolio of US-based SaaS clients.",
    status: "published"
  },
  {
    id: "OPEN-SDR-DEMO",
    code: "OPEN-SDR-DEMO",
    title: "SDR / Sales Development Rep",
    orgName: "B2B marketplace",
    location: "Remote",
    compensation: "$1,700-$2,200/mo USD",
    match: 89,
    skills: ["HubSpot", "Outbound", "Discovery"],
    description: "Qualify outbound leads, book demos, and work closely with a high-performing US sales team.",
    status: "published"
  },
  {
    id: "OPEN-SUP-DEMO",
    code: "OPEN-SUP-DEMO",
    title: "Technical Support Specialist",
    orgName: "Cloud workflow platform",
    location: "Remote, LatAm",
    compensation: "$1,400-$1,900/mo USD",
    match: 86,
    skills: ["Tickets", "Troubleshooting", "APIs"],
    description: "Handle Tier 1 and Tier 2 support, troubleshoot product issues, and maintain excellent CSAT.",
    status: "published"
  }
];

const tips = [
  { title: "How to answer salary questions", tag: "Interview", read: "4 min" },
  { title: "Writing a CV for US SaaS companies", tag: "CV", read: "6 min" },
  { title: "Before your recruiter screen", tag: "Process", read: "3 min" },
  { title: "STAR stories that feel natural", tag: "Interview", read: "5 min" }
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

function firstName() {
  const name = state.candidate?.name || state.user?.displayName || "there";
  return name.split(" ")[0] || "there";
}

function initials() {
  const name = state.candidate?.name || state.user?.displayName || state.user?.email || "NW";
  return name.split(/[ @.]/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
}

function formatDate(value) {
  if (!value) return "Recently";
  const date = value.toDate ? value.toDate() : new Date(value);
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(date);
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
        ${isSignup ? `
          <label>
            Full name
            <input name="name" type="text" autocomplete="name" placeholder="Byron Giraldo" required />
          </label>
        ` : ""}
        <label>
          Email
          <input name="email" type="email" autocomplete="email" placeholder="you@example.com" required />
        </label>
        <label>
          Password
          <input name="password" type="password" autocomplete="${isSignup ? "new-password" : "current-password"}" minlength="6" placeholder="••••••••" required />
        </label>
        <button class="primary-action" type="submit">
          ${icon(isSignup ? "user-plus" : "log-in")}
          ${isSignup ? "Create account" : "Sign in"}
        </button>
        <p id="formMessage" class="form-message" role="status"></p>
      </form>
      ${isSignup ? "" : `<button id="resetPassword" class="text-action small" type="button">Forgot password?</button>`}
      <button id="toggleMode" class="text-action" type="button">
        ${isSignup ? "Already have an account? Sign in" : "New or invited by Nearwork? Create your profile"}
      </button>
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

async function loadDashboard(user) {
  setState({ loading: true, user });
  try {
    const [candidate, applications, jobs] = await Promise.all([
      getCandidateForAuthUser(user),
      listCandidateApplications(user.uid),
      listOpenJobs()
    ]);
    setState({
      candidate: candidate || {
        name: user.displayName || "Talent member",
        email: user.email,
        availability: "open",
        headline: "Nearwork candidate"
      },
      applications,
      jobs: jobs.length ? jobs.map(normalizeRole) : demoJobs,
      loading: false,
      view: "dashboard"
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
      message: friendlyAuthError(error)
    });
  }
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

function renderDashboard() {
  app.innerHTML = `
    <main class="dashboard">
      <aside class="sidebar">
        <div class="brand-top">
          <span class="wordmark">Near<span>work</span></span>
        </div>
        <div class="candidate-card">
          <div class="avatar">${initials()}</div>
          <strong>${state.candidate?.name || state.user?.displayName || "Talent member"}</strong>
          <span>${state.candidate?.headline || state.candidate?.role || "Nearwork candidate"}</span>
        </div>
        <nav>
          ${navItems().map(([key, iconName, label]) => `
            <button class="${state.activePage === key ? "active" : ""}" data-page="${key}">
              ${icon(iconName)} ${label}
            </button>
          `).join("")}
        </nav>
        <button id="signOut" class="ghost-action">${icon("log-out")} Sign out</button>
      </aside>
      <section class="workspace">
        <header class="topbar">
          <div>
            <p class="eyebrow">Candidate workspace</p>
            <h1>${pageTitle()}</h1>
          </div>
          <label class="availability">
            Availability
            <select id="availability">
              ${["open", "interviewing", "paused"].map((value) => `
                <option value="${value}" ${state.candidate?.availability === value ? "selected" : ""}>${value}</option>
              `).join("")}
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
      <div>
        <p class="eyebrow">Nearwork talent</p>
        <h2>${firstName()}, your profile is ${profileCompletion()}% ready.</h2>
        <p>Complete your profile, keep a tailored CV ready, and follow your pipeline from application to decision.</p>
      </div>
      <button class="primary-action fit" data-page="profile">${icon("arrow-right")} Complete profile</button>
    </section>
    <section class="summary-grid">
      ${metricCard("Best match", `${Math.max(...state.jobs.map((job) => job.match || 78))}%`, "sparkles")}
      ${metricCard("Applications", state.applications.length, "send")}
      ${metricCard("CVs saved", (state.candidate?.cvLibrary || []).length, "files")}
      ${metricCard("Availability", state.candidate?.availability || "open", "calendar-check")}
    </section>
    <section class="content-grid">
      <div class="section-block">
        <div class="section-heading">
          <div><p class="eyebrow">Now</p><h2>Talent pipeline</h2></div>
        </div>
        ${pipelineView(currentStage())}
      </div>
      <div class="section-block compact">
        <div class="section-heading">
          <div><p class="eyebrow">Recruiter</p><h2>Need help?</h2></div>
        </div>
        ${recruiterCard()}
      </div>
    </section>
  `;
}

function renderMatches() {
  return `
    <section class="section-block">
      <div class="section-heading">
        <div><p class="eyebrow">Recommended</p><h2>Open roles for you</h2></div>
      </div>
      <div class="job-list">
        ${state.jobs.map((job) => jobCard(job)).join("")}
      </div>
    </section>
  `;
}

function renderApplications() {
  return `
    <section class="section-block">
      <div class="section-heading">
        <div><p class="eyebrow">Pipeline</p><h2>Your applications</h2></div>
      </div>
      ${pipelineView(currentStage())}
      <div class="timeline page-gap">
        ${state.applications.length ? state.applications.map(applicationCard).join("") : emptyState("No applications yet", "Apply to a role and your process will show here.")}
      </div>
    </section>
  `;
}

function renderAssessment() {
  return `
    <section class="assessment-hero">
      <div>
        <p class="eyebrow">Assessment</p>
        <h2>Complete role-specific questions when Nearwork assigns them.</h2>
        <p>Your assessment will include English, work simulation, and role-specific scenarios. Results are reviewed by the Nearwork recruiting team.</p>
      </div>
      <button class="primary-action fit" type="button" disabled>${icon("lock")} Not assigned yet</button>
    </section>
    <section class="info-grid">
      ${infoCard("One attempt", "Retakes are only opened by your recruiter when needed.")}
      ${infoCard("Timed work", "Most role assessments take 45-90 minutes.")}
      ${infoCard("Recruiter review", "You will get next steps or respectful feedback after review.")}
    </section>
  `;
}

function renderCvs() {
  const cvs = state.candidate?.cvLibrary || [];
  return `
    <section class="section-block">
      <div class="section-heading">
        <div><p class="eyebrow">CV picker</p><h2>Store multiple resumes</h2></div>
      </div>
      <form id="cvForm" class="upload-box">
        ${icon("upload-cloud")}
        <strong>Upload a CV for this role</strong>
        <p>Save multiple versions and pick the best one for each opening.</p>
        <input name="cv" type="file" accept=".pdf,.doc,.docx" required />
        <input name="label" type="text" placeholder="CV label, e.g. CSM resume" />
        <button class="primary-action fit" type="submit">Upload CV</button>
      </form>
      <div class="cv-list">
        ${cvs.length ? cvs.map((cv) => `
          <article class="cv-item">
            ${icon("file-text")}
            <div><strong>${cv.name || cv.fileName}</strong><span>${formatDate(cv.uploadedAt)}</span></div>
            ${cv.url ? `<a href="${cv.url}" target="_blank" rel="noreferrer">Open</a>` : ""}
          </article>
        `).join("") : emptyState("No CVs saved yet", "Upload role-specific resumes here.")}
      </div>
    </section>
  `;
}

function renderTips() {
  return `
    <section class="tips-grid">
      ${tips.map((tip) => `
        <article class="tip-card">
          <span>${tip.tag}</span>
          <h3>${tip.title}</h3>
          <p>${tip.read} read</p>
        </article>
      `).join("")}
    </section>
  `;
}

function renderRecruiter() {
  return `
    <section class="content-grid">
      <div class="section-block">
        <div class="section-heading">
          <div><p class="eyebrow">Recruiter</p><h2>Your Nearwork contact</h2></div>
        </div>
        ${recruiterCard(true)}
      </div>
      <div class="section-block compact">
        <div class="section-heading"><div><p class="eyebrow">Booking</p><h2>Schedule soon</h2></div></div>
        <p class="muted">Candidates should be able to book no further than 4 days out. Connect this button to your recruiter booking page when ready.</p>
        <a class="primary-action fit" href="https://nearwork.co" target="_blank" rel="noreferrer">${icon("calendar-plus")} Book recruiter call</a>
      </div>
    </section>
  `;
}

function renderProfile() {
  return `
    <section class="section-block">
      <div class="section-heading">
        <div><p class="eyebrow">Profile</p><h2>Improve your match quality</h2></div>
        <span class="profile-score">${profileCompletion()}%</span>
      </div>
      <form id="profileForm" class="profile-form">
        <label>Full name<input name="name" value="${state.candidate?.name || state.user?.displayName || ""}" /></label>
        <label>Headline<input name="headline" value="${state.candidate?.headline || ""}" placeholder="Customer Success Manager" /></label>
        <label>Location<input name="location" value="${state.candidate?.location || ""}" placeholder="Bogota, Colombia" /></label>
        <label>English level<input name="english" value="${state.candidate?.english || ""}" placeholder="C1" /></label>
        <label>Target salary<input name="salary" value="${state.candidate?.salary || ""}" placeholder="$2,800/mo USD" /></label>
        <label>LinkedIn<input name="linkedin" value="${state.candidate?.linkedin || ""}" placeholder="https://linkedin.com/in/..." /></label>
        <label class="wide">Summary<textarea name="summary" placeholder="Tell Nearwork what roles you want and what you do best.">${state.candidate?.summary || ""}</textarea></label>
        <button class="primary-action fit" type="submit">${icon("save")} Save profile</button>
        <p id="profileMessage" class="form-message"></p>
      </form>
    </section>
  `;
}

function profileCompletion() {
  const fields = ["name", "headline", "location", "english", "salary", "linkedin", "summary"];
  const filled = fields.filter((field) => Boolean(state.candidate?.[field])).length;
  return Math.max(25, Math.round((filled / fields.length) * 100));
}

function currentStage() {
  const first = state.applications[0];
  return first?.stage || first?.status || "profile";
}

function pipelineView(activeStage) {
  const activeIndex = Math.max(0, pipelineStages.findIndex((stage) => activeStage?.toLowerCase().includes(stage.key)));
  return `
    <div class="pipeline">
      ${pipelineStages.map((stage, index) => `
        <article class="${index <= activeIndex ? "done" : ""} ${index === activeIndex ? "current" : ""}">
          <span>${index + 1}</span>
          <strong>${stage.label}</strong>
          <p>${stage.help}</p>
        </article>
      `).join("")}
    </div>
  `;
}

function metricCard(label, value, iconName) {
  return `
    <article class="metric">
      <span>${icon(iconName)}</span>
      <p>${label}</p>
      <strong>${value}</strong>
    </article>
  `;
}

function jobCard(job) {
  const role = normalizeRole(job);
  const applied = new Set(state.applications.map((item) => item.jobId || item.openingCode)).has(role.code);
  return `
    <article class="job-card">
      <div>
        <div class="match-pill">${role.match}% match</div>
        <h3>${role.title}</h3>
        <p>${role.orgName} · ${role.location}</p>
      </div>
      <p class="job-description">${role.description}</p>
      <div class="skill-row">
        ${role.skills.slice(0, 4).map((skill) => `<span>${skill}</span>`).join("")}
      </div>
      <div class="job-footer">
        <strong>${role.compensation}</strong>
        <button class="secondary-action" type="button" data-apply="${role.code}" ${applied ? "disabled" : ""}>
          ${applied ? "Applied" : "Apply"}
        </button>
      </div>
    </article>
  `;
}

function applicationCard(application) {
  return `
    <article class="timeline-item">
      <span>${icon("circle-dot")}</span>
      <div>
        <strong>${application.jobTitle || application.title || "Application"}</strong>
        <p>${application.clientName || application.company || "Nearwork"} · ${application.status || "submitted"}</p>
        <small>${formatDate(application.updatedAt || application.createdAt)}</small>
      </div>
    </article>
  `;
}

function infoCard(title, body) {
  return `<article class="info-card"><strong>${title}</strong><p>${body}</p></article>`;
}

function recruiterCard(full = false) {
  const recruiter = state.candidate?.recruiter || {};
  return `
    <article class="recruiter-card">
      <div class="avatar recruiter-avatar">NW</div>
      <div>
        <strong>${recruiter.name || "Nearwork Recruiting Team"}</strong>
        <p>${recruiter.email || "talent@nearwork.co"}</p>
        ${full ? `<span>Questions about assessments, interviews, feedback, or CV selection should go here.</span>` : ""}
      </div>
    </article>
  `;
}

function emptyState(title, body) {
  return `
    <div class="empty-state">
      ${icon("inbox")}
      <strong>${title}</strong>
      <p>${body}</p>
    </div>
  `;
}

function renderLoading() {
  app.innerHTML = `
    <main class="loading-screen">
      <span class="logo-mark">N</span>
      <p>Loading Talent...</p>
    </main>
  `;
}

function bindDashboardEvents() {
  document.querySelector("#signOut").addEventListener("click", () => signOut(auth));
  document.querySelectorAll("[data-page]").forEach((button) => {
    button.addEventListener("click", () => setState({ activePage: button.dataset.page, message: "" }));
  });
  document.querySelector("#availability").addEventListener("change", async (event) => {
    const availability = event.target.value;
    setState({ candidate: { ...state.candidate, availability } });
    if (state.user && hasFirebaseConfig) await updateCandidateAvailability(state.user.uid, availability);
  });
  document.querySelectorAll("[data-apply]").forEach((button) => {
    button.addEventListener("click", async () => {
      const job = state.jobs.map(normalizeRole).find((item) => item.code === button.dataset.apply);
      button.disabled = true;
      button.textContent = "Submitted";
      if (state.user && hasFirebaseConfig) {
        await applyToJob(state.user.uid, job);
        await loadDashboard(state.user);
        setState({ activePage: "applications" });
      }
    });
  });
  document.querySelector("#profileForm")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget).entries());
    await updateCandidateProfile(state.user.uid, data);
    setState({ candidate: { ...state.candidate, ...data }, message: "Profile saved." });
  });
  document.querySelector("#cvForm")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const file = form.get("cv");
    if (!file?.name) return;
    const cv = await uploadCandidateCv(state.user.uid, file, form.get("label"));
    setState({
      candidate: {
        ...state.candidate,
        cvLibrary: [...(state.candidate?.cvLibrary || []), cv],
        activeCvId: cv.id
      },
      message: "CV uploaded."
    });
  });
}

function render() {
  if (state.loading) return renderLoading();
  if (state.view === "dashboard" && state.user) return renderDashboard();
  renderLogin();
}

if (hasFirebaseConfig) {
  onAuthStateChanged(auth, (user) => {
    if (user) loadDashboard(user);
    else setState({ user: null, candidate: null, loading: false, view: "login" });
  });
} else {
  setState({ loading: false, view: "login" });
}
