import {
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
} from "./firebase.js";

const app = document.querySelector("#app");

const demoJobs = [
  {
    id: "OPEN-FOPS-DEMO",
    code: "OPEN-FOPS-DEMO",
    title: "Fractional Operations Lead",
    company: "Series A fintech",
    location: "Remote, Americas",
    compensation: "$55-75/hr",
    match: 94,
    skills: ["Ops", "SaaS", "Customer Success"],
    status: "published"
  },
  {
    id: "OPEN-GA-DEMO",
    code: "OPEN-GA-DEMO",
    title: "Growth Analyst",
    company: "Marketplace studio",
    location: "Remote",
    compensation: "$4.5k-6k/mo",
    match: 89,
    skills: ["SQL", "Lifecycle", "Experimentation"],
    status: "published"
  },
  {
    id: "OPEN-PD-DEMO",
    code: "OPEN-PD-DEMO",
    title: "Product Designer",
    company: "AI workflow startup",
    location: "Hybrid Bogota",
    compensation: "$65-90/hr",
    match: 86,
    skills: ["Figma", "Design Systems", "UX"],
    status: "published"
  }
];

let state = {
  user: null,
  candidate: null,
  applications: [],
  jobs: [],
  loading: true,
  view: "login"
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

function formatDate(value) {
  if (!value) return "Recently";
  const date = value.toDate ? value.toDate() : new Date(value);
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(date);
}

function renderShell(content) {
  app.innerHTML = `
    <main class="app-shell">
      <section class="brand-panel">
        <div class="brand-top">
          <span class="logo-mark">N</span>
          <span>Nearwork Talent</span>
        </div>
        <div class="brand-copy">
          <p class="eyebrow">Talent workspace</p>
          <h1>Find the next role that actually fits your range.</h1>
          <p>Track matches, applications, profile signal, and availability in one focused workspace for Nearwork candidates.</p>
        </div>
        <div class="trust-strip">
          <span>${icon("shield-check")} Curated clients</span>
          <span>${icon("sparkles")} Match-first search</span>
          <span>${icon("clock-3")} Fast follow-up</span>
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
      <div class="panel-heading">
        <p class="eyebrow">${isSignup ? "Create profile" : "Welcome back"}</p>
        <h2>${isSignup ? "Join Talent" : "Sign in to Talent"}</h2>
      </div>
      ${hasFirebaseConfig ? "" : `<div class="notice">${icon("triangle-alert")} Firebase config is missing. Add Admin config values to <code>.env.local</code>.</div>`}
      <form id="authForm" class="stacked-form">
        ${isSignup ? `
          <label>
            Full name
            <input name="name" type="text" autocomplete="name" placeholder="Alex Morgan" required />
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
      <button id="toggleMode" class="text-action" type="button">
        ${isSignup ? "Already have an account? Sign in" : "New to Nearwork? Create your profile"}
      </button>
    </section>
  `);

  document.querySelector("#toggleMode").addEventListener("click", () => renderLogin(isSignup ? "login" : "signup"));
  document.querySelector("#authForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const message = document.querySelector("#formMessage");
    message.textContent = "";
    try {
      if (isSignup) {
        const credential = await createUserWithEmailAndPassword(auth, form.get("email"), form.get("password"));
        await updateProfile(credential.user, { displayName: form.get("name") });
        await upsertCandidate(credential.user.uid, {
          name: form.get("name"),
          email: form.get("email"),
          availability: "open",
          headline: "Nearwork candidate",
          onboarded: false
        });
      } else {
        await signInWithEmailAndPassword(auth, form.get("email"), form.get("password"));
      }
    } catch (error) {
      message.textContent = error.message.replace("Firebase: ", "");
    }
  });
}

async function loadDashboard(user) {
  setState({ loading: true, user });
  try {
    const [candidate, applications, jobs] = await Promise.all([
      getCandidate(user.uid),
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
      jobs: jobs.length ? jobs : demoJobs,
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
      view: "dashboard"
    });
  }
}

function renderDashboard() {
  const candidate = state.candidate || {};
  const appliedJobIds = new Set(state.applications.map((item) => item.jobId));
  app.innerHTML = `
    <main class="dashboard">
      <aside class="sidebar">
        <div class="brand-top">
          <span class="logo-mark">N</span>
          <span>Talent</span>
        </div>
        <nav>
          <a class="active">${icon("layout-dashboard")} Overview</a>
          <a>${icon("briefcase-business")} Matches</a>
          <a>${icon("send")} Applications</a>
          <a>${icon("user-round-cog")} Profile</a>
        </nav>
        <button id="signOut" class="ghost-action">${icon("log-out")} Sign out</button>
      </aside>
      <section class="workspace">
        <header class="topbar">
          <div>
            <p class="eyebrow">Candidate dashboard</p>
            <h1>${candidate.name || "Talent member"}</h1>
          </div>
          <label class="availability">
            Availability
            <select id="availability">
              ${["open", "interviewing", "paused"].map((value) => `
                <option value="${value}" ${candidate.availability === value ? "selected" : ""}>${value}</option>
              `).join("")}
            </select>
          </label>
        </header>
        <section class="summary-grid">
          ${metricCard("Best match", `${Math.max(...state.jobs.map((job) => job.match || 78))}%`, "sparkles")}
          ${metricCard("Applications", state.applications.length, "send")}
          ${metricCard("Profile status", candidate.profileComplete ? "Complete" : "Needs polish", "badge-check")}
          ${metricCard("Availability", candidate.availability || "open", "calendar-check")}
        </section>
        <section class="content-grid">
          <div class="section-block">
            <div class="section-heading">
              <div>
                <p class="eyebrow">Recommended</p>
                <h2>Role matches</h2>
              </div>
              <button class="icon-button" title="Refresh matches">${icon("refresh-cw")}</button>
            </div>
            <div class="job-list">
              ${state.jobs.map((job) => jobCard(job, appliedJobIds.has(job.id || job.code))).join("")}
            </div>
          </div>
          <div class="section-block compact">
            <div class="section-heading">
              <div>
                <p class="eyebrow">Pipeline</p>
                <h2>Applications</h2>
              </div>
            </div>
            <div class="timeline">
              ${state.applications.length ? state.applications.map(applicationCard).join("") : emptyState()}
            </div>
          </div>
        </section>
      </section>
    </main>
  `;
  syncIcons();

  document.querySelector("#signOut").addEventListener("click", () => signOut(auth));
  document.querySelector("#availability").addEventListener("change", async (event) => {
    const availability = event.target.value;
    setState({ candidate: { ...state.candidate, availability } });
    if (state.user && hasFirebaseConfig) await updateCandidateAvailability(state.user.uid, availability);
  });
  document.querySelectorAll("[data-apply]").forEach((button) => {
    button.addEventListener("click", async () => {
      const job = state.jobs.find((item) => (item.id || item.code) === button.dataset.apply);
      button.disabled = true;
      button.textContent = "Submitted";
      if (state.user && hasFirebaseConfig) {
        await applyToJob(state.user.uid, job);
        await loadDashboard(state.user);
      }
    });
  });
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

function jobCard(job, applied) {
  const skills = job.skills || job.requiredSkills || [];
  return `
    <article class="job-card">
      <div>
        <div class="match-pill">${job.match || 82}% match</div>
        <h3>${job.title || job.role || "Untitled role"}</h3>
        <p>${job.orgName || job.company || job.clientName || "Nearwork client"} · ${job.location || "Remote"}</p>
      </div>
      <div class="skill-row">
        ${skills.slice(0, 3).map((skill) => `<span>${skill}</span>`).join("")}
      </div>
      <div class="job-footer">
        <strong>${job.compensation || job.rate || "Competitive"}</strong>
        <button class="secondary-action" type="button" data-apply="${job.id || job.code}" ${applied ? "disabled" : ""}>
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

function emptyState() {
  return `
    <div class="empty-state">
      ${icon("send-horizontal")}
      <strong>No applications yet</strong>
      <p>Apply to a match and it will appear here with Admin-facing status updates.</p>
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
