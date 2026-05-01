import{initializeApp as He}from"https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";import{getAuth as We,GoogleAuthProvider as Ye,signInWithPopup as Je,onAuthStateChanged as Ke,sendPasswordResetEmail as Ze,createUserWithEmailAndPassword as Xe,updateProfile as et,signInWithEmailAndPassword as tt,signOut as at}from"https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";import{getFirestore as nt,query as T,collection as D,where as E,limit as M,getDocs as x,orderBy as we,getDoc as Pe,doc as N,serverTimestamp as k,setDoc as L,updateDoc as it,addDoc as be,arrayUnion as se}from"https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";import{getStorage as st,ref as Ne,uploadBytes as Re,getDownloadURL as De}from"https://www.gstatic.com/firebasejs/10.12.5/firebase-storage.js";(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))n(s);new MutationObserver(s=>{for(const o of s)if(o.type==="childList")for(const l of o.addedNodes)l.tagName==="LINK"&&l.rel==="modulepreload"&&n(l)}).observe(document,{childList:!0,subtree:!0});function a(s){const o={};return s.integrity&&(o.integrity=s.integrity),s.referrerPolicy&&(o.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?o.credentials="include":s.crossOrigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function n(s){if(s.ep)return;s.ep=!0;const o=a(s);fetch(s.href,o)}})();const Le={apiKey:"AIzaSyApRNyW8PoP28E0x77dUB5jOgHuTqA2by4",authDomain:"nearwork-97e3c.firebaseapp.com",projectId:"nearwork-97e3c",storageBucket:"nearwork-97e3c.firebasestorage.app",messagingSenderId:"145642656516",appId:"1:145642656516:web:0ac2da8931283121e87651",measurementId:"G-3LC8N6FFSH"},_=Object.values(Le).slice(0,6).every(Boolean),O=_?He(Le):null,U=O?We(O):null,y=O?nt(O):null,le=O?st(O):null,ot=O?new Ye:null,w={users:"users",candidates:"candidates",openings:"openings",pipelines:"pipelines",applications:"applications",assessments:"assessments",activity:"candidateActivity"};function A(){if(!O||!U||!y||!le)throw new Error("Missing Firebase environment variables. Copy .env.example to .env.local and fill in the Admin app config.")}async function Ie(e){A();const t=await Pe(N(y,w.users,e));return t.exists()?{id:t.id,...t.data()}:null}async function rt(e){A();const t=String(e||"").trim(),a=t.toLowerCase(),n=T(D(y,w.users),E("email","==",a),M(1)),s=await x(n);if(!s.empty)return{id:s.docs[0].id,...s.docs[0].data()};if(t===a)return null;const o=T(D(y,w.users),E("email","==",t),M(1)),l=await x(o);return l.empty?null:{id:l.docs[0].id,...l.docs[0].data()}}async function Te(e){const t=await Ie(e.uid);if(t)return t;const a=await rt(e.email);return a?(await ce(e.uid,{...a,email:e.email,connectedFromUserId:a.id}),{...a,id:e.uid,connectedFromUserId:a.id}):null}async function ce(e,t){A();const a={...t,role:"candidate",updatedAt:k()};await L(N(y,w.users,e),a,{merge:!0})}function ee(e){return`CAND-${String(e||"").replace(/[^a-z0-9]/gi,"").slice(0,8).toUpperCase()||Date.now()}`}function lt(e){return String(e||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"")}function de(e,t){const a=t.candidateCode||ee(e),n=t.location||[t.locationCity||t.city,t.locationDepartment||t.department].filter(Boolean).join(", "),s=new Date().toISOString().slice(0,10);return{code:a,uid:e,ownerUid:e,name:t.name||"Talent member",role:t.targetRole||t.headline||"Nearwork candidate",skills:Array.isArray(t.skills)?t.skills:[],applied:t.applied||s,lastContact:t.lastContact||s,experience:Number(t.experience||0),location:n,city:lt(t.locationCity||t.city||n),department:t.locationDepartment||t.department||"",country:t.locationCountry||"Colombia",source:"talent.nearwork.co",status:t.status||"active",score:Number(t.score||50),email:t.email||"",phone:t.whatsapp||t.phone||"",whatsapp:t.whatsapp||t.phone||"",salary:t.salary||"",salaryUSD:Number(t.salaryUSD||0)||null,availability:t.availability||"open",english:t.english||"",visa:t.visa||"No",linkedin:t.linkedin||"",cv:t.activeCvName||"",tags:t.tags||["talent profile"],notes:t.summary||"",appliedBefore:!!t.appliedBefore,applications:t.applications||[],pipelineCodes:t.pipelineCodes||[],loom:t.loom||"Not uploaded",assessments:t.assessments||[],work:t.work||[],updatedAt:k()}}async function ct(){A();const e=await Je(U,ot),t=await Te(e.user),a={email:e.user.email,name:e.user.displayName||"",availability:"open",onboarded:!1};t||await ce(e.user.uid,a);const n=ee(e.user.uid),s={...t||a,candidateCode:n};return await L(N(y,w.candidates,n),de(e.user.uid,s),{merge:!0}).catch(()=>null),e.user}async function dt(e){A();const t=T(D(y,w.applications),E("candidateId","==",e),we("updatedAt","desc"),M(20)),a=T(D(y,w.applications),E("ownerUid","==",e),we("updatedAt","desc"),M(20)),n=await Promise.allSettled([x(t),x(a)]),s=new Map;return n.forEach(o=>{o.status==="fulfilled"&&o.value.docs.forEach(l=>s.set(l.id,{id:l.id,...l.data()}))}),Array.from(s.values()).sort((o,l)=>{const d=u=>{var g,h;return((h=(g=u==null?void 0:u.toDate)==null?void 0:g.call(u))==null?void 0:h.getTime())??(u?new Date(u).getTime():0)};return d(l.updatedAt||l.createdAt)-d(o.updatedAt||o.createdAt)})}async function pt(e,t=""){A();const a=String(t||"").trim().toLowerCase(),n=[x(T(D(y,w.assessments),E("candidateUid","==",e),M(25))),x(T(D(y,w.assessments),E("candidateId","==",e),M(25)))];a&&n.push(x(T(D(y,w.assessments),E("candidateEmail","==",a),M(25))));const s=await Promise.allSettled(n),o=new Map;return s.forEach(l=>{l.status==="fulfilled"&&l.value.docs.forEach(d=>o.set(d.id,{id:d.id,...d.data()}))}),Array.from(o.values()).sort((l,d)=>{const u=g=>{var h,c;return((c=(h=g==null?void 0:g.toDate)==null?void 0:h.call(g))==null?void 0:c.getTime())??(g?new Date(g).getTime():0)};return u(d.updatedAt||d.createdAt||d.sentAt)-u(l.updatedAt||l.createdAt||l.sentAt)})}async function ut(e,t,a=""){A();const n=await Pe(N(y,w.assessments,e));if(!n.exists())return null;const s={id:n.id,...n.data()},o=String(a||"").trim().toLowerCase();return s.candidateUid===t||s.candidateId===t||String(s.candidateEmail||"").trim().toLowerCase()===o?s:null}async function mt(e,t){A(),await L(N(y,w.assessments,e),{status:"started",currentQuestionIndex:0,currentStage:1,technicalStartedAt:k(),startedAt:k(),updatedAt:k()},{merge:!0})}async function Se(e,t,a,n={}){A(),await L(N(y,w.assessments,e),{[`answers.${t}`]:a,progress:`${n.currentQuestionIndex||0}/${n.totalQuestions||""}`.replace(/\/$/,""),currentQuestionIndex:n.currentQuestionIndex||0,currentStage:n.currentStage||1,updatedAt:k()},{merge:!0})}async function gt(e,t,a={}){A();const n=Object.values(t||{}).filter(u=>String((u==null?void 0:u.value)??u??"").trim()).length,s=Number(a.totalQuestions||Object.keys(t||{}).length||0),o=Number(a.technicalScore||0),l=Number(a.discScore||0),d=Number(a.score||(s?Math.round(n/s*100):0));await L(N(y,w.assessments,e),{answers:t,answeredCount:n,totalQuestions:s,score:d,technical:o||d,disc:l?`${l}%`:"Submitted",progress:`${n}/${s}`,status:"completed",finished:new Date().toLocaleString("en-US",{month:"short",day:"numeric",year:"numeric",hour:"numeric",minute:"2-digit"}),finishedAt:k(),updatedAt:k()},{merge:!0})}async function Ee(){A();const e=T(D(y,w.openings),E("published","==",!0),M(12));return(await x(e)).docs.map(a=>({id:a.id,...a.data()}))}async function ht(e,t){A();const a=t.code||t.id,n=await Ie(e).catch(()=>null),s={candidateId:e,candidateCode:(n==null?void 0:n.candidateCode)||ee(e),candidateEmail:(n==null?void 0:n.email)||"",candidateName:(n==null?void 0:n.name)||"",openingCode:a,jobId:a,jobTitle:t.title||t.role||"Untitled role",clientName:t.orgName||t.clientName||t.company||"Nearwork client",status:"submitted",source:"talent.nearwork.co",createdAt:k(),updatedAt:k()};await be(D(y,w.applications),s),await L(N(y,w.candidates,s.candidateCode),{...de(e,{...n||{},candidateCode:s.candidateCode,applications:se(a),appliedBefore:!0,lastContact:new Date().toISOString().slice(0,10)}),applications:se(a),appliedBefore:!0},{merge:!0}).catch(()=>null),await be(D(y,w.activity),{candidateId:e,type:"application_submitted",title:s.jobTitle,createdAt:k()}).catch(()=>null)}async function ft(e,t){await it(N(y,w.users,e),{availability:t,updatedAt:k()})}async function vt(e,t){A();const a=t.candidateCode||ee(e);await L(N(y,w.users,e),{...t,candidateCode:a,role:"candidate",updatedAt:k()},{merge:!0});try{return await L(N(y,w.candidates,a),de(e,{...t,candidateCode:a}),{merge:!0}),{candidateCode:a,atsSynced:!0}}catch(n){return console.warn("Candidate ATS sync failed.",n),{candidateCode:a,atsSynced:!1}}}async function yt(e,t){A();const a=t.name.replace(/[^a-z0-9._-]/gi,"-").toLowerCase(),n=`candidate-photos/${e}/${Date.now()}-${a}`,s=Ne(le,n);await Re(s,t,{contentType:t.type||"application/octet-stream"});const o=await De(s);return await L(N(y,w.users,e),{photoURL:o,updatedAt:k()},{merge:!0}),o}async function $e(e,t,a){A();const n=t.name.replace(/[^a-z0-9._-]/gi,"-").toLowerCase(),s=`candidate-cvs/${e}/${Date.now()}-${n}`,o=Ne(le,s);await Re(o,t,{contentType:t.type||"application/octet-stream"});const l=await De(o),d={id:s,name:a||t.name,fileName:t.name,url:l,uploadedAt:new Date().toISOString()};return await L(N(y,w.users,e),{cvLibrary:se(d),activeCvId:d.id,activeCvName:d.name||d.fileName,updatedAt:k()},{merge:!0}),d}const pe=document.querySelector("#app"),wt="+573135928691",bt="https://wa.me/573135928691",K=[{id:"OPEN-CSM-DEMO",code:"OPEN-CSM-DEMO",title:"Customer Success Manager",orgName:"US SaaS company",location:"Remote, Colombia",compensation:"$2,000-$2,800/mo USD",match:94,skills:["SaaS","Customer Success","English C1","QBRs"],description:"Own onboarding, adoption, renewals, and expansion for a portfolio of US-based SaaS clients."},{id:"OPEN-SDR-DEMO",code:"OPEN-SDR-DEMO",title:"SDR / Sales Development Rep",orgName:"B2B marketplace",location:"Remote",compensation:"$1,700-$2,200/mo USD",match:89,skills:["HubSpot","Outbound","Salesforce","English C1"],description:"Qualify outbound leads, book demos, and work closely with a high-performing US sales team."},{id:"OPEN-SUP-DEMO",code:"OPEN-SUP-DEMO",title:"Technical Support Specialist",orgName:"Cloud workflow platform",location:"Remote, LatAm",compensation:"$1,400-$1,900/mo USD",match:86,skills:["Technical Support","APIs","Tickets","Troubleshooting"],description:"Handle Tier 1 and Tier 2 support, troubleshoot product issues, and maintain excellent CSAT."}],H={"Customer Success":["Customer Success Manager","Customer Success Associate","Account Manager","Implementation Specialist","Onboarding Specialist","Renewals Manager"],Sales:["SDR / Sales Development Rep","BDR / Business Development Rep","Account Executive","Sales Operations Specialist","Sales Manager"],Support:["Technical Support Specialist","Customer Support Representative","Support Team Lead","QA Support Analyst"],Operations:["Operations Manager","Operations Analyst","Executive Assistant","Virtual Assistant","Project Coordinator","Recruiting Coordinator"],Marketing:["Marketing Ops / Content Specialist","Content Writer","SEO Specialist","Lifecycle Marketing Specialist","Social Media Manager"],Engineering:["Software Developer (Full Stack)","Frontend Developer","Backend Developer","No-Code Developer","Data Analyst","QA Engineer"],Finance:["Bookkeeper","Accounting Assistant","Financial Analyst","Payroll Specialist"]},St={"CRM & Sales":["HubSpot","Salesforce","Pipedrive","Apollo","Outbound","Cold Email","Discovery Calls","CRM Hygiene"],"Customer Success":["SaaS","Customer Success","QBRs","Onboarding","Renewals","Expansion","Churn Reduction","Intercom","Zendesk"],Support:["Technical Support","Tickets","Troubleshooting","APIs","Bug Reproduction","Help Center","CSAT"],Operations:["Excel","Google Sheets","Reporting","Process Design","Project Management","Notion","Airtable","Zapier"],Marketing:["Content","SEO","Lifecycle","Email Marketing","HubSpot Marketing","Copywriting","Analytics"],Engineering:["JavaScript","React","Node.js","SQL","Python","REST APIs","QA","GitHub"],Language:["English B2","English C1","English C2","Spanish Native"]},W={Amazonas:["Leticia","Puerto Nariño"],Antioquia:["Medellín","Abejorral","Apartadó","Bello","Caldas","Caucasia","Copacabana","El Carmen de Viboral","Envigado","Girardota","Itagüí","La Ceja","La Estrella","Marinilla","Rionegro","Sabaneta","Santa Fe de Antioquia","Turbo"],Arauca:["Arauca","Arauquita","Saravena","Tame"],Atlántico:["Barranquilla","Baranoa","Galapa","Malambo","Puerto Colombia","Sabanalarga","Soledad"],"Bogotá D.C.":["Bogotá"],Bolívar:["Cartagena","Arjona","El Carmen de Bolívar","Magangué","Mompox","Turbaco"],Boyacá:["Tunja","Chiquinquirá","Duitama","Paipa","Sogamoso","Villa de Leyva"],Caldas:["Manizales","Aguadas","Chinchiná","La Dorada","Riosucio","Villamaría"],Caquetá:["Florencia","El Doncello","Puerto Rico","San Vicente del Caguán"],Casanare:["Yopal","Aguazul","Paz de Ariporo","Villanueva"],Cauca:["Popayán","El Tambo","Puerto Tejada","Santander de Quilichao"],Cesar:["Valledupar","Aguachica","Bosconia","Codazzi"],Chocó:["Quibdó","Istmina","Nuquí","Tadó"],Córdoba:["Montería","Cereté","Lorica","Sahagún"],Cundinamarca:["Chía","Cajicá","Facatativá","Fusagasugá","Girardot","Madrid","Mosquera","Soacha","Tocancipá","Zipaquirá"],Guainía:["Inírida"],Guaviare:["San José del Guaviare","Calamar","El Retorno","Miraflores"],Huila:["Neiva","Garzón","La Plata","Pitalito"],"La Guajira":["Riohacha","Maicao","San Juan del Cesar","Uribia"],Magdalena:["Santa Marta","Ciénaga","El Banco","Fundación"],Meta:["Villavicencio","Acacías","Granada","Puerto López"],Nariño:["Pasto","Ipiales","Tumaco","Túquerres"],"Norte de Santander":["Cúcuta","Ocaña","Pamplona","Villa del Rosario"],Putumayo:["Mocoa","Orito","Puerto Asís","Valle del Guamuez"],Quindío:["Armenia","Calarcá","La Tebaida","Montenegro","Quimbaya"],Risaralda:["Pereira","Dosquebradas","La Virginia","Santa Rosa de Cabal"],"San Andrés y Providencia":["San Andrés","Providencia"],Santander:["Bucaramanga","Barrancabermeja","Floridablanca","Girón","Piedecuesta","San Gil"],Sucre:["Sincelejo","Corozal","Sampués","Tolú"],Tolima:["Ibagué","Espinal","Honda","Melgar"],"Valle del Cauca":["Cali","Buga","Buenaventura","Cartago","Jamundí","Palmira","Tuluá","Yumbo"],Vaupés:["Mitú"],Vichada:["Puerto Carreño","La Primavera","Santa Rosalía"]},$t=[{title:"How to answer salary questions",tag:"Interview",read:"4 min",body:"Use a confident range, anchor it to the role, and avoid apologizing for earning in USD.",actions:["Know your floor","Use monthly USD","Mention flexibility last"]},{title:"Writing a CV for US SaaS companies",tag:"CV",read:"6 min",body:"Translate local experience into metrics US hiring managers can scan in under a minute.",actions:["Lead with outcomes","Add tools","Quantify scope"]},{title:"Before your recruiter screen",tag:"Process",read:"3 min",body:"Prepare availability, compensation, English comfort, and two strong role stories.",actions:["Check your setup","Review the opening","Bring questions"]},{title:"STAR stories that feel natural",tag:"Interview",read:"5 min",body:"Keep stories specific, concise, and tied to business impact instead of job duties.",actions:["Situation","Action","Result"]}],Ce=[{key:"applied",label:"Applied",help:"Your profile is in Nearwork review."},{key:"profile",label:"Profile Review",help:"We are checking role fit, CV, and background."},{key:"assessment",label:"Assessment",help:"Complete role-specific questions when assigned."},{key:"interview",label:"Interview",help:"Meet the recruiter or client team."},{key:"decision",label:"Decision",help:"Final feedback or offer decision."}];let i={user:null,candidate:null,applications:[],assessments:[],jobs:[],loading:!0,view:"login",activePage:"overview",matchesFiltered:!1,message:""};const ie=sessionStorage.getItem("nw_restore_path");ie&&(sessionStorage.removeItem("nw_restore_path"),window.history.replaceState({page:ie},"",ie));function ue(){return[["overview","layout-dashboard","Overview"],["matches","briefcase-business","Matches"],["applications","send","Applications"],["assessment","clipboard-check","Assessment"],["cvs","files","CV Picker"],["tips","book-open","Tips"],["recruiter","calendar-days","Recruiter"],["profile","user-round-cog","Profile"]]}function X(){const t=window.location.pathname.split("/").filter(Boolean)[0];return t==="onboarding"?"onboarding":t==="assessment"||t==="assessments"?"assessment":ue().some(([a])=>a===t)?t:"overview"}function z(){const e=window.location.pathname.split("/").filter(Boolean);return(e[0]==="assessment"||e[0]==="assessments")&&e[1]||""}function b(e,t){return`<i data-lucide="${e}" aria-label="${e}"></i>`}function Me(){window.lucide&&window.lucide.createIcons()}function v(e){i={...i,...e},ze()}function oe(e,t=!0){const n=e==="onboarding"||ue().some(([s])=>s===e)?e:"overview";i={...i,activePage:n,matchesFiltered:n==="matches"?i.matchesFiltered:!1,message:""},t&&window.history.pushState({page:n},"",n==="overview"?"/":`/${n}`),ze()}function xe(){var t,a;return(((t=i.candidate)==null?void 0:t.name)||((a=i.user)==null?void 0:a.displayName)||"there").split(" ")[0]||"there"}function Ct(){var t,a,n;return(((t=i.candidate)==null?void 0:t.name)||((a=i.user)==null?void 0:a.displayName)||((n=i.user)==null?void 0:n.email)||"NW").split(/[ @.]/).filter(Boolean).slice(0,2).map(s=>s[0]).join("").toUpperCase()}function Oe(e="normal"){var n,s;const t=((n=i.candidate)==null?void 0:n.photoURL)||((s=i.user)==null?void 0:s.photoURL)||"",a=e==="large"?"avatar avatar-large":"avatar";return t?`<img class="${a}" src="${S(t)}" alt="${S(xe())}" />`:`<div class="${a}">${Ct()}</div>`}function S(e){return String(e||"").replaceAll("&","&amp;").replaceAll('"',"&quot;").replaceAll("<","&lt;").replaceAll(">","&gt;")}function me(e){if(!e)return"Recently";const t=e.toDate?e.toDate():new Date(e);return new Intl.DateTimeFormat("en",{month:"short",day:"numeric"}).format(t)}function te(){var t;const e=((t=i.candidate)==null?void 0:t.skills)||[];return Array.isArray(e)?e:String(e).split(",").map(a=>a.trim()).filter(Boolean)}function kt(){var t;const e=((t=i.candidate)==null?void 0:t.otherSkills)||[];return Array.isArray(e)?e.join(", "):String(e||"")}function ke(e){return String(e||"").split(",").map(t=>t.trim()).filter(Boolean)}function ge(e){return["Nearwork candidate","Preview mode","Talent member"].includes(String(e||"").trim())}function At(){return he()>=100}function qe(){var e,t;return!!((i.applications||[]).length||(((e=i.candidate)==null?void 0:e.pipelineCodes)||[]).length||(t=i.candidate)!=null&&t.pipelineCode)}function Pt(){var n,s,o;const e=((n=i.candidate)==null?void 0:n.department)||"Bogotá D.C.",t=W[e]||W["Bogotá D.C."],a=((s=i.candidate)==null?void 0:s.city)||((o=i.candidate)==null?void 0:o.locationCity)||t[0];return{department:e,city:a,label:`${a}, ${e}`}}function Nt(){var t,a,n;const e=((t=i.candidate)==null?void 0:t.targetRole)||((a=i.candidate)==null?void 0:a.headline)||"";return((n=Object.entries(H).find(([,s])=>s.includes(e)))==null?void 0:n[0])||Object.keys(H)[0]}function Rt(e){return Object.keys(H).map(t=>`<option value="${S(t)}" ${t===e?"selected":""}>${t}</option>`).join("")}function Ue(e,t){const a=H[e]||Object.values(H).flat();return['<option value="">Choose the closest role</option>'].concat(a.map(n=>`<option value="${S(n)}" ${t===n?"selected":""}>${n}</option>`)).join("")}function Dt(e){return Object.entries(St).map(([t,a])=>`
    <fieldset class="skill-group">
      <legend>${S(t)}</legend>
      <div class="skill-picker">
        ${a.map(n=>`
          <label class="skill-choice">
            <input type="checkbox" name="skills" value="${S(n)}" ${e.includes(n)?"checked":""} />
            <span>${S(n)}</span>
          </label>
        `).join("")}
      </div>
    </fieldset>
  `).join("")+`
    <fieldset class="skill-group">
      <legend>Other</legend>
      <label>Other skills
        <input name="otherSkills" value="${S(kt())}" placeholder="Type extra skills, separated by commas" />
      </label>
    </fieldset>
  `}function re(e){const t=Number(String(e||"").replace(/[^\d.]/g,""));if(!Number.isFinite(t)||t<=0)return{salary:"",salaryUSD:null};const a=Math.round(t);return{salary:`$${new Intl.NumberFormat("en-US").format(a)}/mo USD`,salaryUSD:a}}function Lt(e){return Array.isArray(e)?e:String(e||"").split(",").map(t=>t.trim()).filter(Boolean)}function G(e){const t=Lt(e.skills||e.requiredSkills);return{id:e.id||e.code,code:e.code||e.id,title:e.title||e.role||e.openingTitle||"Open role",orgName:e.orgName||e.company||e.clientName||"Nearwork client",location:e.location||"Remote",compensation:e.compensation||e.salary||e.rate||"Competitive",match:e.match||82,skills:t,description:e.description||e.about||"Nearwork is reviewing candidates for this role now."}}function q(e){const t=(e==null?void 0:e.code)||"";return t.includes("operation-not-allowed")?"This sign-in method is not available yet.":t.includes("unauthorized-domain")?"This website still needs to be approved for sign-in.":t.includes("permission-denied")?"We could not save this yet. Please try again in a moment or contact Nearwork support.":t.includes("weak-password")?"Password must be at least 6 characters.":t.includes("invalid-credential")||t.includes("wrong-password")?"That email/password did not match. If this account was created with Google, use Continue with Google.":t.includes("user-not-found")?"No account exists for that email yet.":t.includes("email-already-in-use")?"That email already has an account. Sign in or use Google.":t.includes("popup")?"The Google sign-in popup was closed before finishing.":"Something went wrong. Please try again or contact Nearwork support."}function It(e){pe.innerHTML=`
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
      ${e}
    </main>
  `,Me()}function Be(e="login"){var a;const t=e==="signup";It(`
    <section class="auth-panel">
      <div class="right-brand">Near<span>work</span></div>
      <div class="candidate-chip">For candidates</div>
      <div class="panel-heading">
        <h2>${t?"Create your account.":"Welcome back."}</h2>
        <p>${t?"Create your profile, browse roles, and track your application.":"Use Google if your candidate account was created with Google."}</p>
      </div>
      ${i.message?`<div class="notice">${b("lock")} ${S(i.message)}</div>`:""}
      ${_?"":`<div class="notice">${b("triangle-alert")} Sign-in is still being set up.</div>`}
      <button id="googleSignIn" class="social-action" type="button">
        <span class="google-dot">G</span>
        Continue with Google
      </button>
      <div class="divider"><span></span>or use email<span></span></div>
      <form id="authForm" class="stacked-form">
        ${t?'<label>Full name<input name="name" type="text" autocomplete="name" placeholder="Byron Giraldo" required /></label>':""}
        <label>Email<input name="email" type="email" autocomplete="email" placeholder="you@example.com" required /></label>
        <label>Password<input name="password" type="password" autocomplete="${t?"new-password":"current-password"}" minlength="6" placeholder="••••••••" required /></label>
        <button class="primary-action" type="submit">${b(t?"user-plus":"log-in")} ${t?"Create account":"Sign in"}</button>
        <p id="formMessage" class="form-message" role="status"></p>
      </form>
      ${t?"":'<button id="resetPassword" class="text-action small" type="button">Forgot password?</button>'}
      <button id="toggleMode" class="text-action" type="button">${t?"Already have an account? Sign in":"New or invited by Nearwork? Create your profile"}</button>
    </section>
  `),document.querySelector("#toggleMode").addEventListener("click",()=>Be(t?"login":"signup")),document.querySelector("#googleSignIn").addEventListener("click",async()=>{const n=document.querySelector("#formMessage");n.textContent="";try{await ct()}catch(s){n.textContent=q(s)}}),(a=document.querySelector("#resetPassword"))==null||a.addEventListener("click",async()=>{const n=document.querySelector("input[name='email']").value.trim().toLowerCase(),s=document.querySelector("#formMessage");if(!n){s.textContent="Enter your email first, then request a reset link.";return}try{await Ze(U,n),s.textContent=`Password reset sent to ${n}.`}catch(o){s.textContent=q(o)}}),document.querySelector("#authForm").addEventListener("submit",async n=>{n.preventDefault();const s=new FormData(n.currentTarget),o=document.querySelector("#formMessage"),l=String(s.get("email")).trim().toLowerCase();o.textContent="";try{if(t){const d=await Xe(U,l,s.get("password"));await et(d.user,{displayName:s.get("name")}),sessionStorage.setItem("nw_new_account","1"),await ce(d.user.uid,{name:s.get("name"),email:l,availability:"open",headline:"Nearwork candidate",onboarded:!1})}else await tt(U,l,s.get("password"))}catch(d){o.textContent=q(d)}})}async function Q(e){v({loading:!0,user:e});try{const[t,a,n,s]=await Promise.allSettled([Te(e),dt(e.uid),Ee(),pt(e.uid,e.email)]),o=t.status==="fulfilled"?t.value:null,l=a.status==="fulfilled"?a.value:[],d=n.status==="fulfilled"?n.value:K;let u=s.status==="fulfilled"?s.value:[];const g=z();if(g&&!u.some(r=>r.id===g)){const r=await ut(g,e.uid,e.email).catch(()=>null);r&&(u=[r,...u])}const h=sessionStorage.getItem("nw_new_account")==="1";h&&sessionStorage.removeItem("nw_new_account");const c=h&&(o==null?void 0:o.onboarded)!==!0?"onboarding":X();v({candidate:{...o||{},name:(o==null?void 0:o.name)||e.displayName||"Talent member",email:(o==null?void 0:o.email)||e.email,availability:(o==null?void 0:o.availability)||"open",headline:(o==null?void 0:o.headline)||(o==null?void 0:o.targetRole)||"Nearwork candidate"},applications:l,assessments:u,jobs:d.length?d.map(G):K,loading:!1,view:"dashboard",activePage:c,message:""})}catch(t){console.warn(t),v({candidate:{name:e.displayName||"Talent member",email:e.email,availability:"open",headline:"Nearwork candidate"},applications:[],assessments:[],jobs:K,loading:!1,view:"dashboard",activePage:X(),message:""})}}async function Z(){const e=X();if(e==="assessment"){sessionStorage.setItem("nw_restore_path",window.location.pathname),v({user:null,candidate:null,applications:[],assessments:[],jobs:[],loading:!1,view:"login",activePage:"overview",message:"Please log in to open your assessment."});return}if(e==="overview"){v({user:null,candidate:null,loading:!1,view:"login",activePage:"overview"});return}let t=K;try{const a=await Ee();a.length&&(t=a.map(G))}catch(a){console.warn(a)}v({user:null,candidate:{name:"Guest candidate",availability:"open",headline:"Preview mode"},applications:[],assessments:[],jobs:t,loading:!1,view:"dashboard",activePage:e,message:"Preview mode. Sign in with Google to save your profile, apply, upload CVs, or track your actual pipeline."})}function Tt(){var e,t,a,n;pe.innerHTML=`
    <main class="dashboard">
      <aside class="sidebar">
        <div class="brand-top"><span class="wordmark">Near<span>work</span></span></div>
        <div class="candidate-card">
          ${Oe()}
          <strong>${((e=i.candidate)==null?void 0:e.name)||((t=i.user)==null?void 0:t.displayName)||"Talent member"}</strong>
          <span>${((a=i.candidate)==null?void 0:a.headline)||((n=i.candidate)==null?void 0:n.targetRole)||"Nearwork candidate"}</span>
        </div>
        <nav>
          ${ue().map(([s,o,l])=>`
            <button class="${i.activePage===s?"active":""}" data-page="${s}">${b(o)} ${l}</button>
          `).join("")}
        </nav>
        <button id="${i.user?"signOut":"signIn"}" class="ghost-action">${b(i.user?"log-out":"log-in")} ${i.user?"Sign out":"Sign in"}</button>
      </aside>
      <section class="workspace">
        <header class="topbar">
          <div><p class="eyebrow">Candidate workspace</p><h1>${Et()}</h1></div>
          <label class="availability">Availability
            <select id="availability">
              ${["open","interviewing","paused"].map(s=>{var o;return`<option value="${s}" ${((o=i.candidate)==null?void 0:o.availability)===s?"selected":""}>${s}</option>`}).join("")}
            </select>
          </label>
        </header>
        ${i.message?`<div class="notice">${i.message}</div>`:""}
        ${Mt()}
      </section>
    </main>
  `,Me(),Jt()}function Et(){return{onboarding:"Complete your candidate profile",overview:`Hi ${xe()}, here's your process`,matches:"Role matches",applications:"Application pipeline",assessment:"Assessment center",cvs:"CV picker",tips:"Interview tips",recruiter:"Your recruiter",profile:"Candidate profile"}[i.activePage]||"Talent"}function Mt(){return({onboarding:xt,overview:Ae,matches:Ot,applications:qt,assessment:Ut,cvs:Vt,tips:Qt,recruiter:zt,profile:_t}[i.activePage]||Ae)()}function Ae(){var n;const e=At(),t=qe(),a=i.jobs.length;return`
    ${e?"":`
      <section class="hero-card">
        <div><p class="eyebrow">Action needed</p><h2>Finish your profile to unlock matches.</h2><p>Add your role, city, salary, and skills so Nearwork can match you to the right openings.</p></div>
        <button class="primary-action fit" data-page="profile">${b("arrow-right")} Complete profile</button>
      </section>
    `}
    <section class="summary-grid">
      ${I("Profile readiness",`${he()}%`,"sparkles")}
      ${I("Open roles",a,"briefcase-business")}
      ${I("Applications",i.applications.length,"send")}
      ${I("CVs saved",(((n=i.candidate)==null?void 0:n.cvLibrary)||[]).length,"files")}
    </section>
    <section class="content-grid">
      <div class="section-block"><div class="section-heading"><div><p class="eyebrow">Now</p><h2>${t?"Talent pipeline":"Find your next opening"}</h2></div></div>${t?Ge(je()):Ve()}</div>
      <div class="section-block compact"><div class="section-heading"><div><p class="eyebrow">Recruiter</p><h2>Need help?</h2></div></div>${Qe()}</div>
    </section>
  `}function xt(){return`
    <section class="onboarding-hero">
      <div>
        <p class="eyebrow">New candidate setup</p>
        <h2>Tell Nearwork what role, city, salary, and skills fit you best.</h2>
        <p>This only appears as a first-run setup. After you submit it, you will land in the Talent workspace.</p>
      </div>
    </section>
    ${Fe("onboarding")}
  `}function Ot(){var d,u,g;const e=((d=i.candidate)==null?void 0:d.targetRole)||(ge((u=i.candidate)==null?void 0:u.headline)?"":(g=i.candidate)==null?void 0:g.headline),t=te(),a=t.map(h=>h.toLowerCase()),n=i.jobs.map(G).filter(h=>{const c=e.toLowerCase().split(/[^a-z0-9]+/).filter(f=>f.length>2),r=[h.title,h.description,h.skills.join(" ")].join(" ").toLowerCase(),p=c.length?c.some(f=>r.includes(f)):!1,m=a.length?a.some(f=>r.includes(f)):!1;return p||m}),s=!!(e||t.length),o=i.matchesFiltered&&s?n:i.jobs.map(G),l=i.matchesFiltered&&!n.length;return`
    <section class="section-block">
      <div class="section-heading">
        <div><p class="eyebrow">Openings</p><h2>${i.matchesFiltered?"Best fit from your profile":"All current openings"}</h2></div>
        <button id="filterMatches" class="secondary-action" type="button">${b(i.matchesFiltered?"list":"filter")} ${i.matchesFiltered?"Show all openings":"Filter by my role & skills"}</button>
      </div>
      <div class="match-note"><strong>${o.length}</strong> of <strong>${i.jobs.length}</strong> openings showing. Role: <strong>${e||"not set"}</strong>. Skills: <strong>${t.join(", ")||"not set"}</strong>.</div>
      <div class="job-list">${l?Y("No filtered matches yet","Add a target role and skills in Profile to improve matching."):o.map(h=>Ht(h)).join("")}</div>
    </section>
  `}function qt(){return`
    <section class="section-block">
      <div class="section-heading"><div><p class="eyebrow">Pipeline</p><h2>Your applications</h2></div></div>
      ${qe()?Ge(je()):Ve()}
      <div class="timeline page-gap">${i.applications.length?i.applications.map(Wt).join(""):Y("No applications yet","Apply to a role and your process will show here.")}</div>
    </section>
  `}function Ut(){const e=z(),t=i.assessments||[],a=e?t.find(n=>n.id===e):t.find(n=>["sent","started"].includes(String(n.status||"").toLowerCase()))||t[0];if(e&&!a)return`
      <section class="assessment-hero">
        <div><p class="eyebrow">Assessment</p><h2>No assessment available for this link.</h2><p>Make sure you are logged into the same account that received the assessment email. If this keeps happening, contact Nearwork support.</p></div>
        <button class="primary-action fit" data-page="recruiter" type="button">${b("message-circle")} Contact support</button>
      </section>
    `;if(a){const n=Array.isArray(a.questions)?a.questions:[],s=String(a.status||"").toLowerCase()==="started",o=String(a.status||"").toLowerCase()==="completed",l=Ft(a),d=Math.min(Number(a.currentQuestionIndex||0),Math.max(n.length-1,0)),u=n[d],g=(u==null?void 0:u.stage)||a.currentStage||1;return`
      <section class="assessment-hero">
        <div>
          <p class="eyebrow">Nearwork assessment</p>
          <h2>${S(a.role||"Role assessment")}</h2>
          <p>${o?"This assessment has been submitted.":l?"This assessment link has expired.":"This assessment has 2 stages. Stage 1 is technical, Stage 2 is DISC. You must be logged in to complete it."}</p>
        </div>
        <button class="primary-action fit" id="startAssessment" type="button" ${o||l?"disabled":""}>${b(s?"play":"clipboard-check")} ${s?"Continue assessment":"Start assessment"}</button>
      </section>
      <section class="info-grid">
        ${j("Stage 1","50 technical multiple-choice questions. 60 minutes.")}
        ${j("Stage 2","20 DISC multiple-choice questions. 30 minutes.")}
        ${j("24-hour link",`Expires ${me(a.expiresAt||a.deadline)}.`)}
      </section>
      <section class="section-block page-gap" id="assessmentWorkspace">
        <div class="section-heading"><div><p class="eyebrow">${o?"Results":`Stage ${g} of 2`}</p><h2>${o?"Assessment result":`${d+1} of ${n.length||70}`}</h2></div></div>
        ${o?jt(a):l?Y("Assessment expired","This unique assessment link is no longer available. Contact Nearwork if you need help."):Bt(a,s)}
      </section>
    `}return`
    <section class="assessment-hero">
      <div><p class="eyebrow">Assessment</p><h2>Complete role-specific questions when Nearwork assigns them.</h2><p>Your assessment will include English, work simulation, and role-specific scenarios. Results are reviewed by the Nearwork recruiting team.</p></div>
      <button class="primary-action fit" type="button" disabled>${b("lock")} Not assigned yet</button>
    </section>
    <section class="info-grid">${j("One attempt","Retakes are only opened by your recruiter when needed.")}${j("Timed work","Most role assessments take 45-90 minutes.")}${j("Recruiter review","You will get next steps or respectful feedback after review.")}</section>
  `}function Bt(e,t){var g,h,c,r;if(!t)return`
      <div class="empty-state">
        ${b("timer")}
        <strong>Ready when you are</strong>
        <p>You are entering Stage 1: Technical. After you finish it, you will continue into Stage 2: DISC.</p>
      </div>
    `;const a=(e.questions||[]).slice(0,70),n=Math.min(Number(e.currentQuestionIndex||0),Math.max(a.length-1,0)),s=a[n],o=((h=(g=e.answers)==null?void 0:g[s.id])==null?void 0:h.value)??((c=e.answers)==null?void 0:c[s.id])??"",l=Array.isArray(s.options)&&s.options.length?s.options:["Strongly agree","Agree","Neutral","Disagree"],d=(r=a[n+1])==null?void 0:r.stage,u=d&&d!==s.stage;return`
    <form id="assessmentQuestionForm" class="stacked-form">
      <div class="match-note"><strong>${S(s.part||s.type)}</strong> · ${S(s.bank||"")} · ${s.stage===1?"60 minutes":"30 minutes"}</div>
      <label>
        ${S(s.q||"")}
        <div class="skill-picker">
          ${l.map((p,m)=>`
            <label class="skill-choice">
              <input type="radio" name="answer" value="${m}" ${String(o)===String(m)?"checked":""} />
              <span>${S(p)}</span>
            </label>
          `).join("")}
        </div>
      </label>
      <p class="field-hint">${u?"After this answer, you finished Stage 1 and will enter Stage 2.":"Your progress saves after every question. If you refresh, you will return here."}</p>
      <div class="job-footer">
        <button class="ghost-action" id="prevAssessmentQuestion" type="button" ${n===0?"disabled":""}>${b("arrow-left")} Previous</button>
        <button class="primary-action fit" type="submit">${n+1>=a.length?"Submit assessment":"Save and continue"}</button>
      </div>
    </form>
  `}function Ft(e){return!(e!=null&&e.expiresAt)||String(e.status||"").toLowerCase()==="completed"?!1:Date.now()>new Date(e.expiresAt).getTime()}function jt(e){return`
    <div class="summary-grid">
      ${I("Overall",`${e.score||0}%`,"sparkles")}
      ${I("Technical",`${e.technical||0}%`,"clipboard-check")}
      ${I("DISC",String(e.disc||"Submitted"),"users")}
      ${I("Progress",e.progress||"70/70","timer")}
    </div>
    ${Y("Assessment submitted","Nearwork is reviewing your answers. Your results are saved to your profile.")}
  `}function Gt(e,t){const a=e.questions||[],n=a.filter(l=>l.stage===1),s=a.filter(l=>l.stage===2),o=n.filter(l=>{var d;return typeof l.correctIndex=="number"&&Number((d=t[l.id])==null?void 0:d.value)===l.correctIndex}).length;return{technicalScore:n.length?Math.round(o/n.length*100):0,discScore:s.length?Math.round(s.filter(l=>t[l.id]).length/s.length*100):0}}function Vt(){var t;const e=((t=i.candidate)==null?void 0:t.cvLibrary)||[];return`
    <section class="section-block">
      <div class="section-heading"><div><p class="eyebrow">CV picker</p><h2>Store multiple resumes</h2></div></div>
      <form id="cvForm" class="upload-box">
        ${b("upload-cloud")}<strong>Upload a CV for this role</strong><p>Save multiple versions and pick the best one for each opening.</p>
        <input name="cv" type="file" accept=".pdf,.doc,.docx" required />
        <input name="label" type="text" placeholder="CV label, e.g. CSM resume" />
        <button class="primary-action fit" type="submit">Upload CV</button>
      </form>
      <div class="cv-list">
        ${e.length?e.map(a=>`<article class="cv-item">${b("file-text")}<div><strong>${a.name||a.fileName}</strong><span>${me(a.uploadedAt)}</span></div>${a.url?`<a href="${a.url}" target="_blank" rel="noreferrer">Open</a>`:""}</article>`).join(""):Y("No CVs saved yet","Upload role-specific resumes here.")}
      </div>
    </section>
  `}function Qt(){return`
    <section class="tips-hero"><div><p class="eyebrow">Candidate guide</p><h2>Practical prep for US SaaS interviews.</h2><p>Short, useful guidance candidates can read before recruiter screens, assessments, and client interviews.</p></div></section>
    <section class="tips-grid rich">
      ${$t.map((e,t)=>`
        <article class="tip-card">
          <div class="tip-number">${String(t+1).padStart(2,"0")}</div>
          <span>${e.tag}</span>
          <h3>${e.title}</h3>
          <p>${e.body}</p>
          <div class="tip-actions">${e.actions.map(a=>`<small>${a}</small>`).join("")}</div>
          <strong>${e.read} read</strong>
        </article>
      `).join("")}
    </section>
  `}function zt(){var a,n;const t=(((a=i.candidate)==null?void 0:a.recruiter)||{}).bookingUrl||((n=i.candidate)==null?void 0:n.recruiterBookingUrl)||"mailto:support@nearwork.co?subject=Nearwork%20candidate%20question";return`
    <section class="content-grid">
      <div class="section-block"><div class="section-heading"><div><p class="eyebrow">Recruiter</p><h2>Your Nearwork contact</h2></div></div>${Qe(!0)}</div>
      <div class="section-block compact"><div class="section-heading"><div><p class="eyebrow">Booking</p><h2>Schedule soon</h2></div></div><p class="muted">Ask the Nearwork recruiting team for the earliest available slot. Candidate booking links can be attached to this profile later.</p><a class="primary-action fit" href="${t}" target="_blank" rel="noreferrer">${b("calendar-plus")} Book recruiter call</a></div>
    </section>
  `}function _t(){return Fe("profile")}function Fe(e="profile"){var d,u,g,h,c,r,p,m,f,P;const t=te(),a=Pt(),n=W[a.department]||[],s=re(((d=i.candidate)==null?void 0:d.salary)||((u=i.candidate)==null?void 0:u.salaryUSD)),o=Nt(),l=((g=i.candidate)==null?void 0:g.targetRole)||((h=i.candidate)==null?void 0:h.headline)||"";return`
    <section class="section-block">
      <div class="section-heading"><div><p class="eyebrow">${e==="onboarding"?"Setup":"Profile"}</p><h2>${e==="onboarding"?"Complete your account":"Improve your match quality"}</h2></div><span class="profile-score">${he()}%</span></div>
      <form id="profileForm" class="profile-form">
        <div class="profile-card profile-identity wide">
          ${Oe("large")}
          <label>Profile photo <span class="optional-label">optional</span>
            <input name="photo" type="file" accept="image/png,image/jpeg,image/webp" />
          </label>
        </div>
        <label class="wide">Full name<input name="name" value="${S(((c=i.candidate)==null?void 0:c.name)||((r=i.user)==null?void 0:r.displayName)||"")}" /></label>
        <div class="profile-card wide">
          <div class="field-label">Role applying for</div>
          <div class="profile-card-grid">
            <label>Area
              <select name="roleGroup" id="roleGroupSelect">
                ${Rt(o)}
              </select>
            </label>
            <label>Role
              <select name="targetRole" id="targetRoleSelect">
                ${Ue(o,l)}
              </select>
            </label>
          </div>
        </div>
        <div class="profile-card wide">
          <div class="field-label">Location</div>
          <div class="profile-card-grid">
            <label>Department
              <select name="department" id="departmentSelect">
                ${Object.keys(W).map($=>`<option value="${S($)}" ${$===a.department?"selected":""}>${$}</option>`).join("")}
              </select>
            </label>
            <label>City
              <select name="city" id="citySelect">
                ${n.map($=>`<option value="${S($)}" ${$===a.city?"selected":""}>${$}</option>`).join("")}
              </select>
            </label>
          </div>
        </div>
        <div class="profile-card wide">
          <div class="field-label">Compensation and English</div>
          <div class="profile-card-grid">
            <label>Target monthly salary
              <div class="salary-field"><span>USD</span><input id="salaryInput" name="salary" value="${S(s.salary||"")}" inputmode="numeric" placeholder="1000" /></div>
            </label>
            <label>English level<select name="english">${["","B1","B2","C1","C2","Native"].map($=>{var R;return`<option value="${$}" ${((R=i.candidate)==null?void 0:R.english)===$?"selected":""}>${$||"Select level"}</option>`}).join("")}</select></label>
          </div>
        </div>
        <div class="profile-card wide">
          <div class="field-label">Contact</div>
          <div class="profile-card-grid">
            <label>WhatsApp number
              <input name="whatsapp" value="${S(((p=i.candidate)==null?void 0:p.whatsapp)||((m=i.candidate)==null?void 0:m.phone)||"")}" inputmode="tel" autocomplete="tel" placeholder="+57 300 123 4567" required />
            </label>
            <label>LinkedIn <span class="optional-label">optional</span>
              <input name="linkedin" value="${S(((f=i.candidate)==null?void 0:f.linkedin)||"")}" placeholder="https://linkedin.com/in/..." />
            </label>
          </div>
        </div>
        <div class="profile-card wide">
          <div class="field-label">Skills</div>
          <p class="field-hint">Tap the skills that best match your experience.</p>
          ${Dt(t)}
        </div>
        <div class="profile-card wide">
          <div class="field-label">CV</div>
          <p class="field-hint">Upload the CV you want Nearwork to use for your applications.</p>
          <input name="profileCv" type="file" accept=".pdf,.doc,.docx" />
          <input name="profileCvLabel" type="text" placeholder="CV label, e.g. Customer Success CV" />
        </div>
        <label class="wide">Summary <span class="optional-label">optional</span><textarea name="summary" placeholder="Add a short note about what you do best.">${((P=i.candidate)==null?void 0:P.summary)||""}</textarea></label>
        <input type="hidden" name="mode" value="${e}" />
        <button class="primary-action fit" type="submit">${b("save")} ${e==="onboarding"?"Finish setup":"Save profile"}</button>
      </form>
    </section>
  `}function he(){const e=["name","targetRole","department","city","english","salary","whatsapp"],t=e.filter(a=>{var n,s,o,l;return a==="targetRole"?!!((n=i.candidate)!=null&&n.targetRole||!ge((s=i.candidate)==null?void 0:s.headline)&&((o=i.candidate)!=null&&o.headline)):!!((l=i.candidate)!=null&&l[a])}).length+(te().length?1:0);return Math.max(25,Math.round(t/(e.length+1)*100))}function je(){const e=i.applications[0];return(e==null?void 0:e.stage)||(e==null?void 0:e.status)||"profile"}function Ge(e){const t=Math.max(0,Ce.findIndex(a=>e==null?void 0:e.toLowerCase().includes(a.key)));return`<div class="pipeline">${Ce.map((a,n)=>`<article class="${n<=t?"done":""} ${n===t?"current":""}"><span>${n+1}</span><strong>${a.label}</strong><p>${a.help}</p></article>`).join("")}</div>`}function Ve(){return`
    <div class="empty-state">
      ${b("briefcase-business")}
      <strong>No active pipeline yet</strong>
      <p>Browse current openings and apply when you find a role that fits. Nearwork will show a pipeline here after an application moves forward.</p>
      <div class="empty-actions">
        <button class="primary-action fit" type="button" data-page="matches">${b("sparkles")} View matches</button>
        <a class="secondary-action" href="https://jobs.nearwork.co" target="_blank" rel="noreferrer">${b("external-link")} Open jobs</a>
      </div>
    </div>
  `}function I(e,t,a){return`<article class="metric"><span>${b(a)}</span><p>${e}</p><strong>${t}</strong></article>`}function Ht(e){const t=G(e),a=new Set(i.applications.map(n=>n.jobId||n.openingCode)).has(t.code);return`
    <article class="job-card">
      <div><div class="match-pill">${t.match}% match</div><h3>${t.title}</h3><p>${t.orgName} · ${t.location}</p></div>
      <p class="job-description">${t.description}</p>
      <div class="skill-row">${t.skills.slice(0,4).map(n=>`<span>${n}</span>`).join("")}</div>
      <div class="job-footer"><strong>${t.compensation}</strong><button class="secondary-action" type="button" data-apply="${t.code}" ${a?"disabled":""}>${a?"Applied":"Apply"}</button></div>
    </article>
  `}function Wt(e){return`<article class="timeline-item"><span>${b("circle-dot")}</span><div><strong>${e.jobTitle||e.title||"Application"}</strong><p>${e.clientName||e.company||"Nearwork"} · ${e.status||"submitted"}</p><small>${me(e.updatedAt||e.createdAt)}</small></div></article>`}function j(e,t){return`<article class="info-card"><strong>${e}</strong><p>${t}</p></article>`}function Qe(e=!1){var o;const t=((o=i.candidate)==null?void 0:o.recruiter)||{},a=t.email||"support@nearwork.co",n=t.whatsapp||wt,s=t.whatsappUrl||bt;return`<article class="recruiter-card"><div class="avatar recruiter-avatar">NW</div><div><strong>${t.name||"Nearwork Support"}</strong><p><a href="mailto:${a}">${a}</a></p><p><a href="${s}" target="_blank" rel="noreferrer">WhatsApp ${n}</a></p>${e?"<span>Questions about assessments, interviews, feedback, or CV selection should go here.</span>":""}</div></article>`}function Y(e,t){return`<div class="empty-state">${b("inbox")}<strong>${e}</strong><p>${t}</p></div>`}function Yt(){pe.innerHTML='<main class="loading-screen"><span class="logo-mark">N</span><p>Loading Talent...</p></main>'}function Jt(){var e,t,a,n,s,o,l,d,u,g,h;(e=document.querySelector("#signOut"))==null||e.addEventListener("click",async()=>{await at(U),window.history.pushState({page:"overview"},"","/"),v({user:null,candidate:null,applications:[],assessments:[],jobs:[],view:"login",activePage:"overview",message:""})}),(t=document.querySelector("#signIn"))==null||t.addEventListener("click",()=>{window.history.pushState({page:"overview"},"","/"),v({view:"login",activePage:"overview",message:""})}),document.querySelectorAll("[data-page]").forEach(c=>{c.addEventListener("click",()=>oe(c.dataset.page))}),document.querySelector("#availability").addEventListener("change",async c=>{const r=c.target.value;v({candidate:{...i.candidate,availability:r}}),i.user&&_?await ft(i.user.uid,r):v({message:"Sign in with Google to save availability."})}),(a=document.querySelector("#filterMatches"))==null||a.addEventListener("click",()=>{var r,p,m;const c=!!((r=i.candidate)!=null&&r.targetRole||!ge((p=i.candidate)==null?void 0:p.headline)&&((m=i.candidate)!=null&&m.headline)||te().length);v({matchesFiltered:c?!i.matchesFiltered:!1,message:c?"":"Add your role and skills in Profile first, then filter openings."})}),(n=document.querySelector("#departmentSelect"))==null||n.addEventListener("change",c=>{const r=document.querySelector("#citySelect"),p=W[c.target.value]||[];r.innerHTML=p.map(m=>`<option value="${S(m)}">${m}</option>`).join("")}),(s=document.querySelector("#roleGroupSelect"))==null||s.addEventListener("change",c=>{const r=document.querySelector("#targetRoleSelect");r.innerHTML=Ue(c.target.value,"")}),(o=document.querySelector("#salaryInput"))==null||o.addEventListener("blur",c=>{const r=re(c.target.value);r.salary&&(c.target.value=r.salary)}),document.querySelectorAll("[data-apply]").forEach(c=>{c.addEventListener("click",async()=>{const r=i.jobs.map(G).find(p=>p.code===c.dataset.apply);c.disabled=!0,c.textContent="Submitted",i.user&&_?(await ht(i.user.uid,r),await Q(i.user),oe("applications")):v({message:"Sign in with Google to apply to this opening."})})}),(l=document.querySelector("#startAssessment"))==null||l.addEventListener("click",async()=>{var r;const c=z()||((r=(i.assessments||[])[0])==null?void 0:r.id);if(!c||!i.user){v({message:"Please log in to start your assessment."});return}try{await mt(c,i.user.uid),await Q(i.user)}catch(p){v({message:q(p)})}}),(d=document.querySelector("#prevAssessmentQuestion"))==null||d.addEventListener("click",async()=>{var f,P,$;const c=z()||((f=(i.assessments||[])[0])==null?void 0:f.id),r=(i.assessments||[]).find(R=>R.id===c),p=Math.max(0,Number((r==null?void 0:r.currentQuestionIndex)||0)-1),m=(P=r==null?void 0:r.questions)==null?void 0:P[p];await Se(c,"__progress__","",{currentQuestionIndex:p,totalQuestions:(($=r==null?void 0:r.questions)==null?void 0:$.length)||70,currentStage:(m==null?void 0:m.stage)||1}),await Q(i.user)}),(u=document.querySelector("#assessmentQuestionForm"))==null||u.addEventListener("submit",async c=>{var V;c.preventDefault();const r=z()||((V=(i.assessments||[])[0])==null?void 0:V.id),p=(i.assessments||[]).find(C=>C.id===r),m=(p==null?void 0:p.questions)||[],f=Number((p==null?void 0:p.currentQuestionIndex)||0),P=m[f],$=new FormData(c.currentTarget).get("answer");if(!P||$===null){v({message:"Select an answer before continuing."});return}const R={...p.answers||{},[P.id]:{value:Number($),answeredAt:new Date().toISOString()}};try{if(f+1>=m.length){const C=Gt(p,R);await gt(r,R,{totalQuestions:m.length,technicalScore:C.technicalScore,discScore:C.discScore,score:Math.round(C.technicalScore*.75+C.discScore*.25)})}else{const C=m[f+1];await Se(r,P.id,R[P.id],{currentQuestionIndex:f+1,totalQuestions:m.length,currentStage:(C==null?void 0:C.stage)||P.stage||1})}await Q(i.user)}catch(C){v({message:q(C)})}}),(g=document.querySelector("#profileForm"))==null||g.addEventListener("submit",async c=>{var $,R,V,C,fe,ve;c.preventDefault();const r=new FormData(c.currentTarget),p=r.get("department"),m=r.get("city"),f=re(r.get("salary")),P={name:r.get("name"),targetRole:r.get("targetRole"),headline:r.get("targetRole"),department:p,city:m,locationId:`${String(m).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g,"-")}-co`,location:`${m}, ${p}`,locationCity:m,locationDepartment:p,locationCountry:"Colombia",english:r.get("english"),salary:f.salary,salaryUSD:f.salaryUSD,linkedin:r.get("linkedin"),whatsapp:r.get("whatsapp"),phone:r.get("whatsapp"),skills:[...new Set([...r.getAll("skills"),...ke(r.get("otherSkills"))])],otherSkills:ke(r.get("otherSkills")),summary:r.get("summary"),email:(($=i.candidate)==null?void 0:$.email)||((R=i.user)==null?void 0:R.email)||"",availability:((V=i.candidate)==null?void 0:V.availability)||"open",onboarded:!0};if(!i.user){v({candidate:{...i.candidate,...P},message:"Preview updated. Sign in with Google to save this profile."});return}try{const B=r.get("photo");let ye=((C=i.candidate)==null?void 0:C.photoURL)||((fe=i.user)==null?void 0:fe.photoURL)||"";B!=null&&B.name&&(ye=await yt(i.user.uid,B));const J=r.get("profileCv");let F=null;J!=null&&J.name&&(F=await $e(i.user.uid,J,r.get("profileCvLabel")));const ae={...P,photoURL:ye,...F?{activeCvId:F.id,activeCvName:F.name||F.fileName,cvLibrary:[...((ve=i.candidate)==null?void 0:ve.cvLibrary)||[],F]}:{}},ne=await vt(i.user.uid,ae),_e=(ne==null?void 0:ne.atsSynced)===!1?"Profile saved. Nearwork will finish connecting it to your workspace.":"Profile saved.";r.get("mode")==="onboarding"?(window.history.pushState({page:"overview"},"","/"),v({candidate:{...i.candidate,...ae},activePage:"overview",message:"Profile complete. Welcome to Talent."})):v({candidate:{...i.candidate,...ae},message:_e})}catch(B){v({message:q(B)})}}),(h=document.querySelector("#cvForm"))==null||h.addEventListener("submit",async c=>{var m;c.preventDefault();const r=new FormData(c.currentTarget),p=r.get("cv");if(p!=null&&p.name){if(!i.user){v({message:"Sign in with Google to upload and store CVs."});return}try{const f=await $e(i.user.uid,p,r.get("label"));v({candidate:{...i.candidate,cvLibrary:[...((m=i.candidate)==null?void 0:m.cvLibrary)||[],f],activeCvId:f.id},message:"CV uploaded."})}catch(f){v({message:q(f)})}}})}function ze(){if(i.loading)return Yt();if(i.view==="dashboard")return Tt();Be()}window.addEventListener("popstate",()=>{const e=X();e==="overview"&&!i.user?v({view:"login",activePage:"overview",message:""}):i.view==="dashboard"?oe(e,!1):Z()});_?(Ke(U,e=>{e?Q(e):Z()}),window.setTimeout(()=>{i.loading&&Z()},2500)):Z();
