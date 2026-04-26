import{initializeApp as T}from"https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";import{getAuth as F,onAuthStateChanged as L,signOut as M,createUserWithEmailAndPassword as I,updateProfile as q,signInWithEmailAndPassword as x}from"https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";import{getFirestore as R,getDoc as B,doc as v,query as k,collection as y,where as N,orderBy as H,limit as S,getDocs as O,updateDoc as j,serverTimestamp as p,addDoc as $,setDoc as J}from"https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";(function(){const a=document.createElement("link").relList;if(a&&a.supports&&a.supports("modulepreload"))return;for(const n of document.querySelectorAll('link[rel="modulepreload"]'))i(n);new MutationObserver(n=>{for(const o of n)if(o.type==="childList")for(const b of o.addedNodes)b.tagName==="LINK"&&b.rel==="modulepreload"&&i(b)}).observe(document,{childList:!0,subtree:!0});function t(n){const o={};return n.integrity&&(o.integrity=n.integrity),n.referrerPolicy&&(o.referrerPolicy=n.referrerPolicy),n.crossOrigin==="use-credentials"?o.credentials="include":n.crossOrigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function i(n){if(n.ep)return;n.ep=!0;const o=t(n);fetch(n.href,o)}})();const C={apiKey:"AIzaSyApRNyW8PoP28E0x77dUB5jOgHuTqA2by4",authDomain:"nearwork-97e3c.firebaseapp.com",projectId:"nearwork-97e3c",storageBucket:"nearwork-97e3c.firebasestorage.app",messagingSenderId:"145642656516",appId:"1:145642656516:web:0ac2da8931283121e87651",measurementId:"G-3LC8N6FFSH"},u=Object.values(C).slice(0,6).every(Boolean),m=u?T(C):null,g=m?F(m):null,c=m?R(m):null,r={users:"users",openings:"openings",applications:"applications",activity:"candidateActivity"};function h(){if(!m||!g||!c)throw new Error("Missing Firebase environment variables. Copy .env.example to .env.local and fill in the Admin app config.")}async function U(e){h();const a=await B(v(c,r.users,e));return a.exists()?{id:a.id,...a.data()}:null}async function G(e,a){h();const t={...a,role:"candidate",updatedAt:p()};await J(v(c,r.users,e),t,{merge:!0})}async function W(e){h();const a=k(y(c,r.applications),N("candidateId","==",e),H("updatedAt","desc"),S(20));return(await O(a)).docs.map(i=>({id:i.id,...i.data()}))}async function z(){h();const e=k(y(c,r.openings),N("published","==",!0),S(12));return(await O(e)).docs.map(t=>({id:t.id,...t.data()}))}async function Q(e,a){h();const t=a.code||a.id,i={candidateId:e,openingCode:t,jobId:t,jobTitle:a.title||a.role||"Untitled role",clientName:a.orgName||a.clientName||a.company||"Nearwork client",status:"submitted",source:"talent.nearwork.co",createdAt:p(),updatedAt:p()};await $(y(c,r.applications),i),await $(y(c,r.activity),{candidateId:e,type:"application_submitted",title:i.jobTitle,createdAt:p()})}async function K(e,a){await j(v(c,r.users,e),{availability:a,updatedAt:p()})}const w=document.querySelector("#app"),A=[{id:"OPEN-FOPS-DEMO",code:"OPEN-FOPS-DEMO",title:"Fractional Operations Lead",company:"Series A fintech",location:"Remote, Americas",compensation:"$55-75/hr",match:94,skills:["Ops","SaaS","Customer Success"],status:"published"},{id:"OPEN-GA-DEMO",code:"OPEN-GA-DEMO",title:"Growth Analyst",company:"Marketplace studio",location:"Remote",compensation:"$4.5k-6k/mo",match:89,skills:["SQL","Lifecycle","Experimentation"],status:"published"},{id:"OPEN-PD-DEMO",code:"OPEN-PD-DEMO",title:"Product Designer",company:"AI workflow startup",location:"Hybrid Bogota",compensation:"$65-90/hr",match:86,skills:["Figma","Design Systems","UX"],status:"published"}];let s={user:null,candidate:null,applications:[],jobs:[],loading:!0,view:"login"};function l(e,a){return`<i data-lucide="${e}" aria-label="${e}"></i>`}function D(){window.lucide&&window.lucide.createIcons()}function d(e){s={...s,...e},te()}function X(e){if(!e)return"Recently";const a=e.toDate?e.toDate():new Date(e);return new Intl.DateTimeFormat("en",{month:"short",day:"numeric"}).format(a)}function _(e){w.innerHTML=`
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
          <span>${l("shield-check")} Curated clients</span>
          <span>${l("sparkles")} Match-first search</span>
          <span>${l("clock-3")} Fast follow-up</span>
        </div>
      </section>
      ${e}
    </main>
  `,D()}function E(e="login"){const a=e==="signup";_(`
    <section class="auth-panel">
      <div class="panel-heading">
        <p class="eyebrow">${a?"Create profile":"Welcome back"}</p>
        <h2>${a?"Join Talent":"Sign in to Talent"}</h2>
      </div>
      ${u?"":`<div class="notice">${l("triangle-alert")} Firebase config is missing. Add Admin config values to <code>.env.local</code>.</div>`}
      <form id="authForm" class="stacked-form">
        ${a?`
          <label>
            Full name
            <input name="name" type="text" autocomplete="name" placeholder="Alex Morgan" required />
          </label>
        `:""}
        <label>
          Email
          <input name="email" type="email" autocomplete="email" placeholder="you@example.com" required />
        </label>
        <label>
          Password
          <input name="password" type="password" autocomplete="${a?"new-password":"current-password"}" minlength="6" placeholder="••••••••" required />
        </label>
        <button class="primary-action" type="submit">
          ${l(a?"user-plus":"log-in")}
          ${a?"Create account":"Sign in"}
        </button>
        <p id="formMessage" class="form-message" role="status"></p>
      </form>
      <button id="toggleMode" class="text-action" type="button">
        ${a?"Already have an account? Sign in":"New to Nearwork? Create your profile"}
      </button>
    </section>
  `),document.querySelector("#toggleMode").addEventListener("click",()=>E(a?"login":"signup")),document.querySelector("#authForm").addEventListener("submit",async t=>{t.preventDefault();const i=new FormData(t.currentTarget),n=document.querySelector("#formMessage");n.textContent="";try{if(a){const o=await I(g,i.get("email"),i.get("password"));await q(o.user,{displayName:i.get("name")}),await G(o.user.uid,{name:i.get("name"),email:i.get("email"),availability:"open",headline:"Nearwork candidate",onboarded:!1})}else await x(g,i.get("email"),i.get("password"))}catch(o){n.textContent=o.message.replace("Firebase: ","")}})}async function P(e){d({loading:!0,user:e});try{const[a,t,i]=await Promise.all([U(e.uid),W(e.uid),z()]);d({candidate:a||{name:e.displayName||"Talent member",email:e.email,availability:"open",headline:"Nearwork candidate"},applications:t,jobs:i.length?i:A,loading:!1,view:"dashboard"})}catch(a){console.warn(a),d({candidate:{name:e.displayName||"Talent member",email:e.email,availability:"open",headline:"Nearwork candidate"},applications:[],jobs:A,loading:!1,view:"dashboard"})}}function V(){const e=s.candidate||{},a=new Set(s.applications.map(t=>t.jobId));w.innerHTML=`
    <main class="dashboard">
      <aside class="sidebar">
        <div class="brand-top">
          <span class="logo-mark">N</span>
          <span>Talent</span>
        </div>
        <nav>
          <a class="active">${l("layout-dashboard")} Overview</a>
          <a>${l("briefcase-business")} Matches</a>
          <a>${l("send")} Applications</a>
          <a>${l("user-round-cog")} Profile</a>
        </nav>
        <button id="signOut" class="ghost-action">${l("log-out")} Sign out</button>
      </aside>
      <section class="workspace">
        <header class="topbar">
          <div>
            <p class="eyebrow">Candidate dashboard</p>
            <h1>${e.name||"Talent member"}</h1>
          </div>
          <label class="availability">
            Availability
            <select id="availability">
              ${["open","interviewing","paused"].map(t=>`
                <option value="${t}" ${e.availability===t?"selected":""}>${t}</option>
              `).join("")}
            </select>
          </label>
        </header>
        <section class="summary-grid">
          ${f("Best match",`${Math.max(...s.jobs.map(t=>t.match||78))}%`,"sparkles")}
          ${f("Applications",s.applications.length,"send")}
          ${f("Profile status",e.profileComplete?"Complete":"Needs polish","badge-check")}
          ${f("Availability",e.availability||"open","calendar-check")}
        </section>
        <section class="content-grid">
          <div class="section-block">
            <div class="section-heading">
              <div>
                <p class="eyebrow">Recommended</p>
                <h2>Role matches</h2>
              </div>
              <button class="icon-button" title="Refresh matches">${l("refresh-cw")}</button>
            </div>
            <div class="job-list">
              ${s.jobs.map(t=>Y(t,a.has(t.id||t.code))).join("")}
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
              ${s.applications.length?s.applications.map(Z).join(""):ee()}
            </div>
          </div>
        </section>
      </section>
    </main>
  `,D(),document.querySelector("#signOut").addEventListener("click",()=>M(g)),document.querySelector("#availability").addEventListener("change",async t=>{const i=t.target.value;d({candidate:{...s.candidate,availability:i}}),s.user&&u&&await K(s.user.uid,i)}),document.querySelectorAll("[data-apply]").forEach(t=>{t.addEventListener("click",async()=>{const i=s.jobs.find(n=>(n.id||n.code)===t.dataset.apply);t.disabled=!0,t.textContent="Submitted",s.user&&u&&(await Q(s.user.uid,i),await P(s.user))})})}function f(e,a,t){return`
    <article class="metric">
      <span>${l(t)}</span>
      <p>${e}</p>
      <strong>${a}</strong>
    </article>
  `}function Y(e,a){const t=e.skills||e.requiredSkills||[];return`
    <article class="job-card">
      <div>
        <div class="match-pill">${e.match||82}% match</div>
        <h3>${e.title||e.role||"Untitled role"}</h3>
        <p>${e.orgName||e.company||e.clientName||"Nearwork client"} · ${e.location||"Remote"}</p>
      </div>
      <div class="skill-row">
        ${t.slice(0,3).map(i=>`<span>${i}</span>`).join("")}
      </div>
      <div class="job-footer">
        <strong>${e.compensation||e.rate||"Competitive"}</strong>
        <button class="secondary-action" type="button" data-apply="${e.id||e.code}" ${a?"disabled":""}>
          ${a?"Applied":"Apply"}
        </button>
      </div>
    </article>
  `}function Z(e){return`
    <article class="timeline-item">
      <span>${l("circle-dot")}</span>
      <div>
        <strong>${e.jobTitle||e.title||"Application"}</strong>
        <p>${e.clientName||e.company||"Nearwork"} · ${e.status||"submitted"}</p>
        <small>${X(e.updatedAt||e.createdAt)}</small>
      </div>
    </article>
  `}function ee(){return`
    <div class="empty-state">
      ${l("send-horizontal")}
      <strong>No applications yet</strong>
      <p>Apply to a match and it will appear here with Admin-facing status updates.</p>
    </div>
  `}function ae(){w.innerHTML=`
    <main class="loading-screen">
      <span class="logo-mark">N</span>
      <p>Loading Talent...</p>
    </main>
  `}function te(){if(s.loading)return ae();if(s.view==="dashboard"&&s.user)return V();E()}u?L(g,e=>{e?P(e):d({user:null,candidate:null,loading:!1,view:"login"})}):d({loading:!1,view:"login"});
