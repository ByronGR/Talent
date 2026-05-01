import{initializeApp as Ke}from"https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";import{getAuth as Ze,GoogleAuthProvider as Xe,signInWithPopup as et,onAuthStateChanged as tt,sendPasswordResetEmail as at,createUserWithEmailAndPassword as st,updateProfile as nt,signInWithEmailAndPassword as it,signOut as ot}from"https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";import{getFirestore as rt,query as x,collection as R,where as M,limit as E,getDocs as q,orderBy as Se,getDoc as Z,doc as N,serverTimestamp as k,setDoc as T,updateDoc as lt,addDoc as $e,arrayUnion as de}from"https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";import{getStorage as ct,ref as Ie,uploadBytes as Te,getDownloadURL as Re}from"https://www.gstatic.com/firebasejs/10.12.5/firebase-storage.js";(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const a of document.querySelectorAll('link[rel="modulepreload"]'))s(a);new MutationObserver(a=>{for(const o of a)if(o.type==="childList")for(const c of o.addedNodes)c.tagName==="LINK"&&c.rel==="modulepreload"&&s(c)}).observe(document,{childList:!0,subtree:!0});function n(a){const o={};return a.integrity&&(o.integrity=a.integrity),a.referrerPolicy&&(o.referrerPolicy=a.referrerPolicy),a.crossOrigin==="use-credentials"?o.credentials="include":a.crossOrigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function s(a){if(a.ep)return;a.ep=!0;const o=n(a);fetch(a.href,o)}})();const Le={apiKey:"AIzaSyApRNyW8PoP28E0x77dUB5jOgHuTqA2by4",authDomain:"nearwork-97e3c.firebaseapp.com",projectId:"nearwork-97e3c",storageBucket:"nearwork-97e3c.firebasestorage.app",messagingSenderId:"145642656516",appId:"1:145642656516:web:0ac2da8931283121e87651",measurementId:"G-3LC8N6FFSH"},Y=Object.values(Le).slice(0,6).every(Boolean),B=Y?Ke(Le):null,G=B?Ze(B):null,v=B?rt(B):null,me=B?ct(B):null,dt=B?new Xe:null,b={users:"users",candidates:"candidates",openings:"openings",pipelines:"pipelines",applications:"applications",assessments:"assessments",activity:"candidateActivity"};function P(){if(!B||!G||!v||!me)throw new Error("Missing Firebase environment variables. Copy .env.example to .env.local and fill in the Admin app config.")}async function xe(e){P();const t=await Z(N(v,b.users,e));return t.exists()?{id:t.id,...t.data()}:null}async function ut(e){P();const t=String(e||"").trim(),n=t.toLowerCase(),s=x(R(v,b.users),M("email","==",n),E(1)),a=await q(s);if(!a.empty)return{id:a.docs[0].id,...a.docs[0].data()};if(t===n)return null;const o=x(R(v,b.users),M("email","==",t),E(1)),c=await q(o);return c.empty?null:{id:c.docs[0].id,...c.docs[0].data()}}async function Me(e){const t=await xe(e.uid);if(t)return t;const n=await ut(e.email);return n?(await ge(e.uid,{...n,email:e.email,connectedFromUserId:n.id}),{...n,id:e.uid,connectedFromUserId:n.id}):null}async function ge(e,t){P();const n={...t,role:"candidate",updatedAt:k()};await T(N(v,b.users,e),n,{merge:!0})}function ie(e){return`CAND-${String(e||"").replace(/[^a-z0-9]/gi,"").slice(0,8).toUpperCase()||Date.now()}`}function pt(e){return String(e||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"")}function he(e,t){const n=t.candidateCode||ie(e),s=t.location||[t.locationCity||t.city,t.locationDepartment||t.department].filter(Boolean).join(", "),a=new Date().toISOString().slice(0,10);return{code:n,uid:e,ownerUid:e,name:t.name||"Talent member",role:t.targetRole||t.headline||"Nearwork candidate",skills:Array.isArray(t.skills)?t.skills:[],applied:t.applied||a,lastContact:t.lastContact||a,experience:Number(t.experience||0),location:s,city:pt(t.locationCity||t.city||s),department:t.locationDepartment||t.department||"",country:t.locationCountry||"Colombia",source:"talent.nearwork.co",status:t.status||"active",score:Number(t.score||50),email:t.email||"",phone:t.whatsapp||t.phone||"",whatsapp:t.whatsapp||t.phone||"",salary:t.salary||"",salaryUSD:Number(t.salaryUSD||0)||null,availability:t.availability||"open",english:t.english||"",visa:t.visa||"No",linkedin:t.linkedin||"",cv:t.activeCvName||"",tags:t.tags||["talent profile"],notes:t.summary||"",appliedBefore:!!t.appliedBefore,applications:t.applications||[],pipelineCodes:t.pipelineCodes||[],loom:t.loom||"Not uploaded",assessments:t.assessments||[],work:t.work||[],updatedAt:k()}}async function mt(){P();const e=await et(G,dt),t=await Me(e.user),n={email:e.user.email,name:e.user.displayName||"",availability:"open",onboarded:!1};t||await ge(e.user.uid,n);const s=ie(e.user.uid),a={...t||n,candidateCode:s};return await T(N(v,b.candidates,s),he(e.user.uid,a),{merge:!0}).catch(()=>null),e.user}async function gt(e){P();const t=x(R(v,b.applications),M("candidateId","==",e),Se("updatedAt","desc"),E(20)),n=x(R(v,b.applications),M("ownerUid","==",e),Se("updatedAt","desc"),E(20)),s=await Promise.allSettled([q(t),q(n)]),a=new Map;return s.forEach(o=>{o.status==="fulfilled"&&o.value.docs.forEach(c=>a.set(c.id,{id:c.id,...c.data()}))}),Array.from(a.values()).sort((o,c)=>{const d=g=>{var h,f;return((f=(h=g==null?void 0:g.toDate)==null?void 0:h.call(g))==null?void 0:f.getTime())??(g?new Date(g).getTime():0)};return d(c.updatedAt||c.createdAt)-d(o.updatedAt||o.createdAt)})}async function ht(e,t="",n=""){P();const s=String(t||"").trim().toLowerCase(),a=String(n||"").trim(),o=[q(x(R(v,b.assessments),M("candidateUid","==",e),E(25))),q(x(R(v,b.assessments),M("candidateId","==",e),E(25)))];s&&o.push(q(x(R(v,b.assessments),M("candidateEmail","==",s),E(25)))),a&&o.push(q(x(R(v,b.assessments),M("candidateCode","==",a),E(25))));const c=await Promise.allSettled(o),d=new Map;return c.forEach(g=>{g.status==="fulfilled"&&g.value.docs.forEach(h=>d.set(h.id,{id:h.id,...h.data()}))}),Array.from(d.values()).sort((g,h)=>{const f=l=>{var r,u;return((u=(r=l==null?void 0:l.toDate)==null?void 0:r.call(l))==null?void 0:u.getTime())??(l?new Date(l).getTime():0)};return f(h.updatedAt||h.createdAt||h.sentAt)-f(g.updatedAt||g.createdAt||g.sentAt)})}async function ft(e,t,n="",s=""){P();const a=await Z(N(v,b.assessments,e));if(!a.exists())return null;const o={id:a.id,...a.data()},c=String(n||"").trim().toLowerCase(),d=String(s||"").trim();return o.candidateUid===t||o.candidateId===t||String(o.candidateEmail||"").trim().toLowerCase()===c||String(o.candidateCode||"").trim()===d?o:null}async function vt(e,t){P();const n=await Z(N(v,b.assessments,e)),s=n.exists()?n.data():{};if(s.status==="completed")throw new Error("This assessment is already completed.");if(s.expiresAt&&Date.now()>new Date(s.expiresAt).getTime())throw new Error("This assessment link has expired.");await T(N(v,b.assessments,e),{status:"started",currentQuestionIndex:Number(s.currentQuestionIndex||0),currentStage:Number(s.currentStage||1),technicalStartedAt:s.technicalStartedAt||k(),startedAt:s.startedAt||k(),updatedAt:k()},{merge:!0})}async function Ce(e,t,n,s={}){P();const a=await Z(N(v,b.assessments,e)),o=a.exists()?a.data():{};if(o.status==="completed")throw new Error("This assessment is already completed.");if(o.expiresAt&&Date.now()>new Date(o.expiresAt).getTime())throw new Error("This assessment link has expired.");await T(N(v,b.assessments,e),{[`answers.${t}`]:n,progress:`${s.currentQuestionIndex||0}/${s.totalQuestions||""}`.replace(/\/$/,""),currentQuestionIndex:s.currentQuestionIndex||0,currentStage:s.currentStage||1,...s.discStartedAt?{discStartedAt:s.discStartedAt}:{},updatedAt:k()},{merge:!0})}async function wt(e,t,n={}){P();const s=N(v,b.assessments,e),a=await Z(s),o=a.exists()?a.data():{};if(o.status==="completed")throw new Error("This assessment is already completed.");if(o.expiresAt&&Date.now()>new Date(o.expiresAt).getTime())throw new Error("This assessment link has expired.");const c=Object.values(t||{}).filter(r=>String((r==null?void 0:r.value)??r??"").trim()).length,d=Number(n.totalQuestions||Object.keys(t||{}).length||0),g=Number(n.technicalScore||0),h=Number(n.discScore||0),f=Number(n.score||(d?Math.round(c/d*100):0));await T(s,{answers:t,answeredCount:c,totalQuestions:d,score:f,technical:g||f,disc:h?`${h}%`:"Submitted",progress:`${c}/${d}`,status:"completed",finished:new Date().toLocaleString("en-US",{month:"short",day:"numeric",year:"numeric",hour:"numeric",minute:"2-digit"}),finishedAt:k(),updatedAt:k()},{merge:!0});const l=Math.round(f);o.candidateUid&&await T(N(v,b.users,o.candidateUid),{score:l,nwScore:l,lastAssessmentScore:l,lastAssessmentId:e,updatedAt:k()},{merge:!0}).catch(()=>null),o.candidateCode&&await T(N(v,b.candidates,o.candidateCode),{score:l,nwScore:l,lastAssessmentScore:l,lastAssessmentId:e,updatedAt:k()},{merge:!0}).catch(()=>null)}async function Ee(){P();const e=x(R(v,b.openings),M("published","==",!0),E(12));return(await q(e)).docs.map(n=>({id:n.id,...n.data()}))}async function yt(e,t){P();const n=t.code||t.id,s=await xe(e).catch(()=>null),a={candidateId:e,candidateCode:(s==null?void 0:s.candidateCode)||ie(e),candidateEmail:(s==null?void 0:s.email)||"",candidateName:(s==null?void 0:s.name)||"",openingCode:n,jobId:n,jobTitle:t.title||t.role||"Untitled role",clientName:t.orgName||t.clientName||t.company||"Nearwork client",status:"submitted",source:"talent.nearwork.co",createdAt:k(),updatedAt:k()};await $e(R(v,b.applications),a),await T(N(v,b.candidates,a.candidateCode),{...he(e,{...s||{},candidateCode:a.candidateCode,applications:de(n),appliedBefore:!0,lastContact:new Date().toISOString().slice(0,10)}),applications:de(n),appliedBefore:!0},{merge:!0}).catch(()=>null),await $e(R(v,b.activity),{candidateId:e,type:"application_submitted",title:a.jobTitle,createdAt:k()}).catch(()=>null)}async function bt(e,t){await lt(N(v,b.users,e),{availability:t,updatedAt:k()})}async function St(e,t){P();const n=t.candidateCode||ie(e);await T(N(v,b.users,e),{...t,candidateCode:n,role:"candidate",updatedAt:k()},{merge:!0});try{return await T(N(v,b.candidates,n),he(e,{...t,candidateCode:n}),{merge:!0}),{candidateCode:n,atsSynced:!0}}catch(s){return console.warn("Candidate ATS sync failed.",s),{candidateCode:n,atsSynced:!1}}}async function $t(e,t){P();const n=t.name.replace(/[^a-z0-9._-]/gi,"-").toLowerCase(),s=`candidate-photos/${e}/${Date.now()}-${n}`,a=Ie(me,s);await Te(a,t,{contentType:t.type||"application/octet-stream"});const o=await Re(a);return await T(N(v,b.users,e),{photoURL:o,updatedAt:k()},{merge:!0}),o}async function Ae(e,t,n){P();const s=t.name.replace(/[^a-z0-9._-]/gi,"-").toLowerCase(),a=`candidate-cvs/${e}/${Date.now()}-${s}`,o=Ie(me,a);await Te(o,t,{contentType:t.type||"application/octet-stream"});const c=await Re(o),d={id:a,name:n||t.name,fileName:t.name,url:c,uploadedAt:new Date().toISOString()};return await T(N(v,b.users,e),{cvLibrary:de(d),activeCvId:d.id,activeCvName:d.name||d.fileName,updatedAt:k()},{merge:!0}),d}const fe=document.querySelector("#app"),Ct="+573135928691",At="https://wa.me/573135928691",te=[{id:"OPEN-CSM-DEMO",code:"OPEN-CSM-DEMO",title:"Customer Success Manager",orgName:"US SaaS company",location:"Remote, Colombia",compensation:"$2,000-$2,800/mo USD",match:94,skills:["SaaS","Customer Success","English C1","QBRs"],description:"Own onboarding, adoption, renewals, and expansion for a portfolio of US-based SaaS clients."},{id:"OPEN-SDR-DEMO",code:"OPEN-SDR-DEMO",title:"SDR / Sales Development Rep",orgName:"B2B marketplace",location:"Remote",compensation:"$1,700-$2,200/mo USD",match:89,skills:["HubSpot","Outbound","Salesforce","English C1"],description:"Qualify outbound leads, book demos, and work closely with a high-performing US sales team."},{id:"OPEN-SUP-DEMO",code:"OPEN-SUP-DEMO",title:"Technical Support Specialist",orgName:"Cloud workflow platform",location:"Remote, LatAm",compensation:"$1,400-$1,900/mo USD",match:86,skills:["Technical Support","APIs","Tickets","Troubleshooting"],description:"Handle Tier 1 and Tier 2 support, troubleshoot product issues, and maintain excellent CSAT."}],J={"Customer Success":["Customer Success Manager","Customer Success Associate","Account Manager","Implementation Specialist","Onboarding Specialist","Renewals Manager"],Sales:["SDR / Sales Development Rep","BDR / Business Development Rep","Account Executive","Sales Operations Specialist","Sales Manager"],Support:["Technical Support Specialist","Customer Support Representative","Support Team Lead","QA Support Analyst"],Operations:["Operations Manager","Operations Analyst","Executive Assistant","Virtual Assistant","Project Coordinator","Recruiting Coordinator"],Marketing:["Marketing Ops / Content Specialist","Content Writer","SEO Specialist","Lifecycle Marketing Specialist","Social Media Manager"],Engineering:["Software Developer (Full Stack)","Frontend Developer","Backend Developer","No-Code Developer","Data Analyst","QA Engineer"],Finance:["Bookkeeper","Accounting Assistant","Financial Analyst","Payroll Specialist"]},kt={"CRM & Sales":["HubSpot","Salesforce","Pipedrive","Apollo","Outbound","Cold Email","Discovery Calls","CRM Hygiene"],"Customer Success":["SaaS","Customer Success","QBRs","Onboarding","Renewals","Expansion","Churn Reduction","Intercom","Zendesk"],Support:["Technical Support","Tickets","Troubleshooting","APIs","Bug Reproduction","Help Center","CSAT"],Operations:["Excel","Google Sheets","Reporting","Process Design","Project Management","Notion","Airtable","Zapier"],Marketing:["Content","SEO","Lifecycle","Email Marketing","HubSpot Marketing","Copywriting","Analytics"],Engineering:["JavaScript","React","Node.js","SQL","Python","REST APIs","QA","GitHub"],Language:["English B2","English C1","English C2","Spanish Native"]},K={Amazonas:["Leticia","Puerto Nariño"],Antioquia:["Medellín","Abejorral","Apartadó","Bello","Caldas","Caucasia","Copacabana","El Carmen de Viboral","Envigado","Girardota","Itagüí","La Ceja","La Estrella","Marinilla","Rionegro","Sabaneta","Santa Fe de Antioquia","Turbo"],Arauca:["Arauca","Arauquita","Saravena","Tame"],Atlántico:["Barranquilla","Baranoa","Galapa","Malambo","Puerto Colombia","Sabanalarga","Soledad"],"Bogotá D.C.":["Bogotá"],Bolívar:["Cartagena","Arjona","El Carmen de Bolívar","Magangué","Mompox","Turbaco"],Boyacá:["Tunja","Chiquinquirá","Duitama","Paipa","Sogamoso","Villa de Leyva"],Caldas:["Manizales","Aguadas","Chinchiná","La Dorada","Riosucio","Villamaría"],Caquetá:["Florencia","El Doncello","Puerto Rico","San Vicente del Caguán"],Casanare:["Yopal","Aguazul","Paz de Ariporo","Villanueva"],Cauca:["Popayán","El Tambo","Puerto Tejada","Santander de Quilichao"],Cesar:["Valledupar","Aguachica","Bosconia","Codazzi"],Chocó:["Quibdó","Istmina","Nuquí","Tadó"],Córdoba:["Montería","Cereté","Lorica","Sahagún"],Cundinamarca:["Chía","Cajicá","Facatativá","Fusagasugá","Girardot","Madrid","Mosquera","Soacha","Tocancipá","Zipaquirá"],Guainía:["Inírida"],Guaviare:["San José del Guaviare","Calamar","El Retorno","Miraflores"],Huila:["Neiva","Garzón","La Plata","Pitalito"],"La Guajira":["Riohacha","Maicao","San Juan del Cesar","Uribia"],Magdalena:["Santa Marta","Ciénaga","El Banco","Fundación"],Meta:["Villavicencio","Acacías","Granada","Puerto López"],Nariño:["Pasto","Ipiales","Tumaco","Túquerres"],"Norte de Santander":["Cúcuta","Ocaña","Pamplona","Villa del Rosario"],Putumayo:["Mocoa","Orito","Puerto Asís","Valle del Guamuez"],Quindío:["Armenia","Calarcá","La Tebaida","Montenegro","Quimbaya"],Risaralda:["Pereira","Dosquebradas","La Virginia","Santa Rosa de Cabal"],"San Andrés y Providencia":["San Andrés","Providencia"],Santander:["Bucaramanga","Barrancabermeja","Floridablanca","Girón","Piedecuesta","San Gil"],Sucre:["Sincelejo","Corozal","Sampués","Tolú"],Tolima:["Ibagué","Espinal","Honda","Melgar"],"Valle del Cauca":["Cali","Buga","Buenaventura","Cartago","Jamundí","Palmira","Tuluá","Yumbo"],Vaupés:["Mitú"],Vichada:["Puerto Carreño","La Primavera","Santa Rosalía"]},Nt=[{title:"How to answer salary questions",tag:"Interview",read:"4 min",body:"Use a confident range, anchor it to the role, and avoid apologizing for earning in USD.",actions:["Know your floor","Use monthly USD","Mention flexibility last"]},{title:"Writing a CV for US SaaS companies",tag:"CV",read:"6 min",body:"Translate local experience into metrics US hiring managers can scan in under a minute.",actions:["Lead with outcomes","Add tools","Quantify scope"]},{title:"Before your recruiter screen",tag:"Process",read:"3 min",body:"Prepare availability, compensation, English comfort, and two strong role stories.",actions:["Check your setup","Review the opening","Bring questions"]},{title:"STAR stories that feel natural",tag:"Interview",read:"5 min",body:"Keep stories specific, concise, and tied to business impact instead of job duties.",actions:["Situation","Action","Result"]}],ke=[{key:"applied",label:"Applied",help:"Your profile is in Nearwork review."},{key:"profile",label:"Profile Review",help:"We are checking role fit, CV, and background."},{key:"assessment",label:"Assessment",help:"Complete role-specific questions when assigned."},{key:"interview",label:"Interview",help:"Meet the recruiter or client team."},{key:"decision",label:"Decision",help:"Final feedback or offer decision."}];let i={user:null,candidate:null,applications:[],assessments:[],jobs:[],loading:!0,view:"login",activePage:"overview",matchesFiltered:!1,message:""};const ce=sessionStorage.getItem("nw_restore_path");ce&&(sessionStorage.removeItem("nw_restore_path"),window.history.replaceState({page:ce},"",ce));function ve(){return[["overview","layout-dashboard","Overview"],["matches","briefcase-business","Matches"],["applications","send","Applications"],["assessment","clipboard-check","Assessment"],["cvs","files","CV Picker"],["tips","book-open","Tips"],["recruiter","calendar-days","Recruiter"],["profile","user-round-cog","Profile"]]}function ne(){const t=window.location.pathname.split("/").filter(Boolean)[0];return t==="onboarding"?"onboarding":t==="assessment"||t==="assessments"?"assessment":ve().some(([n])=>n===t)?t:"overview"}function _(){const e=window.location.pathname.split("/").filter(Boolean);return(e[0]==="assessment"||e[0]==="assessments")&&e[1]||""}function qe(){const e=window.location.pathname.split("/").filter(Boolean),t=e.findIndex(s=>s==="q"||s==="question");if(t===-1)return null;const n=Number(e[t+1]);return Number.isFinite(n)&&n>0?n-1:null}function Pt(e,t=0){return`/assessment/${encodeURIComponent(e)}/start/q/${Number(t||0)+1}`}function ae(e,t=0,n=!1){const s=Pt(e,t);if(window.location.pathname===s)return;const a=n?"replaceState":"pushState";window.history[a]({page:"assessment",assessmentId:e,questionIndex:t},"",s)}function S(e,t){return`<i data-lucide="${e}" aria-label="${e}"></i>`}function Oe(){window.lucide&&window.lucide.createIcons()}function y(e){i={...i,...e},Ye()}function ue(e,t=!0){const s=e==="onboarding"||ve().some(([a])=>a===e)?e:"overview";i={...i,activePage:s,matchesFiltered:s==="matches"?i.matchesFiltered:!1,message:""},t&&window.history.pushState({page:s},"",s==="overview"?"/":`/${s}`),Ye()}function Ue(){var t,n;return(((t=i.candidate)==null?void 0:t.name)||((n=i.user)==null?void 0:n.displayName)||"there").split(" ")[0]||"there"}function Dt(){var t,n,s;return(((t=i.candidate)==null?void 0:t.name)||((n=i.user)==null?void 0:n.displayName)||((s=i.user)==null?void 0:s.email)||"NW").split(/[ @.]/).filter(Boolean).slice(0,2).map(a=>a[0]).join("").toUpperCase()}function Fe(e="normal"){var s,a;const t=((s=i.candidate)==null?void 0:s.photoURL)||((a=i.user)==null?void 0:a.photoURL)||"",n=e==="large"?"avatar avatar-large":"avatar";return t?`<img class="${n}" src="${$(t)}" alt="${$(Ue())}" />`:`<div class="${n}">${Dt()}</div>`}function $(e){return String(e||"").replaceAll("&","&amp;").replaceAll('"',"&quot;").replaceAll("<","&lt;").replaceAll(">","&gt;")}function we(e){if(!e)return"Recently";const t=e.toDate?e.toDate():new Date(e);return new Intl.DateTimeFormat("en",{month:"short",day:"numeric"}).format(t)}function oe(){var t;const e=((t=i.candidate)==null?void 0:t.skills)||[];return Array.isArray(e)?e:String(e).split(",").map(n=>n.trim()).filter(Boolean)}function It(){var t;const e=((t=i.candidate)==null?void 0:t.otherSkills)||[];return Array.isArray(e)?e.join(", "):String(e||"")}function Ne(e){return String(e||"").split(",").map(t=>t.trim()).filter(Boolean)}function ye(e){return["Nearwork candidate","Preview mode","Talent member"].includes(String(e||"").trim())}function Tt(){return be()>=100}function Pe(e){if(!e)return null;if(e.toDate)return e.toDate();if(typeof e=="object"&&typeof e.seconds=="number")return new Date(e.seconds*1e3);const t=new Date(e);return Number.isNaN(t.getTime())?null:t}function Be(){var e,t;return!!((i.applications||[]).length||(((e=i.candidate)==null?void 0:e.pipelineCodes)||[]).length||(t=i.candidate)!=null&&t.pipelineCode)}function Rt(){var s,a,o;const e=((s=i.candidate)==null?void 0:s.department)||"Bogotá D.C.",t=K[e]||K["Bogotá D.C."],n=((a=i.candidate)==null?void 0:a.city)||((o=i.candidate)==null?void 0:o.locationCity)||t[0];return{department:e,city:n,label:`${n}, ${e}`}}function Lt(){var t,n,s;const e=((t=i.candidate)==null?void 0:t.targetRole)||((n=i.candidate)==null?void 0:n.headline)||"";return((s=Object.entries(J).find(([,a])=>a.includes(e)))==null?void 0:s[0])||Object.keys(J)[0]}function xt(e){return Object.keys(J).map(t=>`<option value="${$(t)}" ${t===e?"selected":""}>${t}</option>`).join("")}function je(e,t){const n=J[e]||Object.values(J).flat();return['<option value="">Choose the closest role</option>'].concat(n.map(s=>`<option value="${$(s)}" ${t===s?"selected":""}>${s}</option>`)).join("")}function Mt(e){return Object.entries(kt).map(([t,n])=>`
    <fieldset class="skill-group">
      <legend>${$(t)}</legend>
      <div class="skill-picker">
        ${n.map(s=>`
          <label class="skill-choice">
            <input type="checkbox" name="skills" value="${$(s)}" ${e.includes(s)?"checked":""} />
            <span>${$(s)}</span>
          </label>
        `).join("")}
      </div>
    </fieldset>
  `).join("")+`
    <fieldset class="skill-group">
      <legend>Other</legend>
      <label>Other skills
        <input name="otherSkills" value="${$(It())}" placeholder="Type extra skills, separated by commas" />
      </label>
    </fieldset>
  `}function pe(e){const t=Number(String(e||"").replace(/[^\d.]/g,""));if(!Number.isFinite(t)||t<=0)return{salary:"",salaryUSD:null};const n=Math.round(t);return{salary:`$${new Intl.NumberFormat("en-US").format(n)}/mo USD`,salaryUSD:n}}function Et(e){return Array.isArray(e)?e:String(e||"").split(",").map(t=>t.trim()).filter(Boolean)}function H(e){const t=Et(e.skills||e.requiredSkills);return{id:e.id||e.code,code:e.code||e.id,title:e.title||e.role||e.openingTitle||"Open role",orgName:e.orgName||e.company||e.clientName||"Nearwork client",location:e.location||"Remote",compensation:e.compensation||e.salary||e.rate||"Competitive",match:e.match||82,skills:t,description:e.description||e.about||"Nearwork is reviewing candidates for this role now."}}function j(e){const t=(e==null?void 0:e.code)||"";return t.includes("operation-not-allowed")?"This sign-in method is not available yet.":t.includes("unauthorized-domain")?"This website still needs to be approved for sign-in.":t.includes("permission-denied")?"We could not save this yet. Please try again in a moment or contact Nearwork support.":t.includes("weak-password")?"Password must be at least 6 characters.":t.includes("invalid-credential")||t.includes("wrong-password")?"That email/password did not match. If this account was created with Google, use Continue with Google.":t.includes("user-not-found")?"No account exists for that email yet.":t.includes("email-already-in-use")?"That email already has an account. Sign in or use Google.":t.includes("popup")?"The Google sign-in popup was closed before finishing.":"Something went wrong. Please try again or contact Nearwork support."}function qt(e){fe.innerHTML=`
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
  `,Oe()}function Ge(e="login"){var n;const t=e==="signup";qt(`
    <section class="auth-panel">
      <div class="right-brand">Near<span>work</span></div>
      <div class="candidate-chip">For candidates</div>
      <div class="panel-heading">
        <h2>${t?"Create your account.":"Welcome back."}</h2>
        <p>${t?"Create your profile, browse roles, and track your application.":"Use Google if your candidate account was created with Google."}</p>
      </div>
      ${i.message?`<div class="notice">${S("lock")} ${$(i.message)}</div>`:""}
      ${Y?"":`<div class="notice">${S("triangle-alert")} Sign-in is still being set up.</div>`}
      <button id="googleSignIn" class="social-action" type="button">
        <span class="google-dot">G</span>
        Continue with Google
      </button>
      <div class="divider"><span></span>or use email<span></span></div>
      <form id="authForm" class="stacked-form">
        ${t?'<label>Full name<input name="name" type="text" autocomplete="name" placeholder="Byron Giraldo" required /></label>':""}
        <label>Email<input name="email" type="email" autocomplete="email" placeholder="you@example.com" required /></label>
        <label>Password<input name="password" type="password" autocomplete="${t?"new-password":"current-password"}" minlength="6" placeholder="••••••••" required /></label>
        <button class="primary-action" type="submit">${S(t?"user-plus":"log-in")} ${t?"Create account":"Sign in"}</button>
        <p id="formMessage" class="form-message" role="status"></p>
      </form>
      ${t?"":'<button id="resetPassword" class="text-action small" type="button">Forgot password?</button>'}
      <button id="toggleMode" class="text-action" type="button">${t?"Already have an account? Sign in":"New or invited by Nearwork? Create your profile"}</button>
    </section>
  `),document.querySelector("#toggleMode").addEventListener("click",()=>Ge(t?"login":"signup")),document.querySelector("#googleSignIn").addEventListener("click",async()=>{const s=document.querySelector("#formMessage");s.textContent="";try{await mt()}catch(a){s.textContent=j(a)}}),(n=document.querySelector("#resetPassword"))==null||n.addEventListener("click",async()=>{const s=document.querySelector("input[name='email']").value.trim().toLowerCase(),a=document.querySelector("#formMessage");if(!s){a.textContent="Enter your email first, then request a reset link.";return}try{await at(G,s),a.textContent=`Password reset sent to ${s}.`}catch(o){a.textContent=j(o)}}),document.querySelector("#authForm").addEventListener("submit",async s=>{s.preventDefault();const a=new FormData(s.currentTarget),o=document.querySelector("#formMessage"),c=String(a.get("email")).trim().toLowerCase();o.textContent="";try{if(t){const d=await st(G,c,a.get("password"));await nt(d.user,{displayName:a.get("name")}),sessionStorage.setItem("nw_new_account","1"),await ge(d.user.uid,{name:a.get("name"),email:c,availability:"open",headline:"Nearwork candidate",onboarded:!1})}else await it(G,c,a.get("password"))}catch(d){o.textContent=j(d)}})}async function Qe(e){y({loading:!0,user:e});try{const[t,n,s]=await Promise.allSettled([Me(e),gt(e.uid),Ee()]),a=t.status==="fulfilled"?t.value:null,o=n.status==="fulfilled"?n.value:[],c=s.status==="fulfilled"?s.value:te;let d=[];try{d=await ht(e.uid,e.email,(a==null?void 0:a.candidateCode)||(a==null?void 0:a.code)||"")}catch(l){console.warn(l)}const g=_();if(g&&!d.some(l=>l.id===g)){const l=await ft(g,e.uid,e.email,(a==null?void 0:a.candidateCode)||(a==null?void 0:a.code)||"").catch(()=>null);l&&(d=[l,...d])}const h=sessionStorage.getItem("nw_new_account")==="1";h&&sessionStorage.removeItem("nw_new_account");const f=h&&(a==null?void 0:a.onboarded)!==!0?"onboarding":ne();y({candidate:{...a||{},name:(a==null?void 0:a.name)||e.displayName||"Talent member",email:(a==null?void 0:a.email)||e.email,availability:(a==null?void 0:a.availability)||"open",headline:(a==null?void 0:a.headline)||(a==null?void 0:a.targetRole)||"Nearwork candidate"},applications:o,assessments:d,jobs:c.length?c.map(H):te,loading:!1,view:"dashboard",activePage:f,message:""})}catch(t){console.warn(t),y({candidate:{name:e.displayName||"Talent member",email:e.email,availability:"open",headline:"Nearwork candidate"},applications:[],assessments:[],jobs:te,loading:!1,view:"dashboard",activePage:ne(),message:""})}}async function se(){const e=ne();if(e==="assessment"){sessionStorage.setItem("nw_restore_path",window.location.pathname),y({user:null,candidate:null,applications:[],assessments:[],jobs:[],loading:!1,view:"login",activePage:"overview",message:"Please log in to open your assessment."});return}if(e==="overview"){y({user:null,candidate:null,loading:!1,view:"login",activePage:"overview"});return}let t=te;try{const n=await Ee();n.length&&(t=n.map(H))}catch(n){console.warn(n)}y({user:null,candidate:{name:"Guest candidate",availability:"open",headline:"Preview mode"},applications:[],assessments:[],jobs:t,loading:!1,view:"dashboard",activePage:e,message:"Preview mode. Sign in with Google to save your profile, apply, upload CVs, or track your actual pipeline."})}function Ot(){var e,t,n,s;fe.innerHTML=`
    <main class="dashboard">
      <aside class="sidebar">
        <div class="brand-top"><span class="wordmark">Near<span>work</span></span></div>
        <div class="candidate-card">
          ${Fe()}
          <strong>${((e=i.candidate)==null?void 0:e.name)||((t=i.user)==null?void 0:t.displayName)||"Talent member"}</strong>
          <span>${((n=i.candidate)==null?void 0:n.headline)||((s=i.candidate)==null?void 0:s.targetRole)||"Nearwork candidate"}</span>
        </div>
        <nav>
          ${ve().map(([a,o,c])=>`
            <button class="${i.activePage===a?"active":""}" data-page="${a}">${S(o)} ${c}</button>
          `).join("")}
        </nav>
        <button id="${i.user?"signOut":"signIn"}" class="ghost-action">${S(i.user?"log-out":"log-in")} ${i.user?"Sign out":"Sign in"}</button>
      </aside>
      <section class="workspace">
        <header class="topbar">
          <div><p class="eyebrow">Candidate workspace</p><h1>${Bt()}</h1></div>
          <label class="availability">Availability
            <select id="availability">
              ${["open","interviewing","paused"].map(a=>{var o;return`<option value="${a}" ${((o=i.candidate)==null?void 0:o.availability)===a?"selected":""}>${a}</option>`}).join("")}
            </select>
          </label>
        </header>
        ${i.message?`<div class="notice">${i.message}</div>`:""}
        ${jt()}
      </section>
    </main>
  `,Oe(),na(),Ft(),Ut()}let ee=null;function Ut(){ee&&window.clearInterval(ee);const e=document.querySelector("#assessmentTimer");if(!e)return;const t=new Date(e.dataset.end||"").getTime(),n=()=>{const s=Math.max(0,t-Date.now()),a=Math.floor(s/1e3),o=Math.floor(a/60),c=String(a%60).padStart(2,"0");e.textContent=`${o}:${c}`,e.classList.toggle("is-low",s<=10*60*1e3),s<=0&&window.clearInterval(ee)};n(),ee=window.setInterval(n,1e3)}function Ft(){if(i.activePage!=="assessment")return;const e=i.assessments||[],t=_(),s=(t?e.find(o=>o.id===t):null)||e.find(o=>["sent","started"].includes(String(o.status||"").toLowerCase()));if(!(s!=null&&s.id))return;const a=String(s.status||"").toLowerCase();if(a==="started"&&qe()===null){ae(s.id,Number(s.currentQuestionIndex||0),!0);return}if(!t&&a==="sent"){const o=`/assessment/${encodeURIComponent(s.id)}/start`;window.history.replaceState({page:"assessment",assessmentId:s.id},"",o)}}function Bt(){return{onboarding:"Complete your candidate profile",overview:`Hi ${Ue()}, here's your process`,matches:"Role matches",applications:"Application pipeline",assessment:"Assessment center",cvs:"CV picker",tips:"Interview tips",recruiter:"Your recruiter",profile:"Candidate profile"}[i.activePage]||"Talent"}function jt(){return({onboarding:Gt,overview:De,matches:Qt,applications:Vt,assessment:zt,cvs:Kt,tips:Zt,recruiter:Xt,profile:ea}[i.activePage]||De)()}function De(){var s;const e=Tt(),t=Be(),n=i.jobs.length;return`
    ${e?"":`
      <section class="hero-card">
        <div><p class="eyebrow">Action needed</p><h2>Finish your profile to unlock matches.</h2><p>Add your role, city, salary, and skills so Nearwork can match you to the right openings.</p></div>
        <button class="primary-action fit" data-page="profile">${S("arrow-right")} Complete profile</button>
      </section>
    `}
    <section class="summary-grid">
      ${F("Profile readiness",`${be()}%`,"sparkles")}
      ${F("Open roles",n,"briefcase-business")}
      ${F("Applications",i.applications.length,"send")}
      ${F("CVs saved",(((s=i.candidate)==null?void 0:s.cvLibrary)||[]).length,"files")}
    </section>
    <section class="content-grid">
      <div class="section-block"><div class="section-heading"><div><p class="eyebrow">Now</p><h2>${t?"Talent pipeline":"Find your next opening"}</h2></div></div>${t?_e(ze()):He()}</div>
      <div class="section-block compact"><div class="section-heading"><div><p class="eyebrow">Recruiter</p><h2>Need help?</h2></div></div>${We()}</div>
    </section>
  `}function Gt(){return`
    <section class="onboarding-hero">
      <div>
        <p class="eyebrow">New candidate setup</p>
        <h2>Tell Nearwork what role, city, salary, and skills fit you best.</h2>
        <p>This only appears as a first-run setup. After you submit it, you will land in the Talent workspace.</p>
      </div>
    </section>
    ${Ve("onboarding")}
  `}function Qt(){var d,g,h;const e=((d=i.candidate)==null?void 0:d.targetRole)||(ye((g=i.candidate)==null?void 0:g.headline)?"":(h=i.candidate)==null?void 0:h.headline),t=oe(),n=t.map(f=>f.toLowerCase()),s=i.jobs.map(H).filter(f=>{const l=e.toLowerCase().split(/[^a-z0-9]+/).filter(m=>m.length>2),r=[f.title,f.description,f.skills.join(" ")].join(" ").toLowerCase(),u=l.length?l.some(m=>r.includes(m)):!1,p=n.length?n.some(m=>r.includes(m)):!1;return u||p}),a=!!(e||t.length),o=i.matchesFiltered&&a?s:i.jobs.map(H),c=i.matchesFiltered&&!s.length;return`
    <section class="section-block">
      <div class="section-heading">
        <div><p class="eyebrow">Openings</p><h2>${i.matchesFiltered?"Best fit from your profile":"All current openings"}</h2></div>
        <button id="filterMatches" class="secondary-action" type="button">${S(i.matchesFiltered?"list":"filter")} ${i.matchesFiltered?"Show all openings":"Filter by my role & skills"}</button>
      </div>
      <div class="match-note"><strong>${o.length}</strong> of <strong>${i.jobs.length}</strong> openings showing. Role: <strong>${e||"not set"}</strong>. Skills: <strong>${t.join(", ")||"not set"}</strong>.</div>
      <div class="job-list">${c?W("No filtered matches yet","Add a target role and skills in Profile to improve matching."):o.map(f=>ta(f)).join("")}</div>
    </section>
  `}function Vt(){return`
    <section class="section-block">
      <div class="section-heading"><div><p class="eyebrow">Pipeline</p><h2>Your applications</h2></div></div>
      ${Be()?_e(ze()):He()}
      <div class="timeline page-gap">${i.applications.length?i.applications.map(aa).join(""):W("No applications yet","Apply to a role and your process will show here.")}</div>
    </section>
  `}function zt(){const e=_(),t=i.assessments||[],n=t.filter(o=>["sent","started"].includes(String(o.status||"").toLowerCase())),s=t.filter(o=>String(o.status||"").toLowerCase()==="completed"),a=e?t.find(o=>o.id===e):n[0]||s[0]||null;if(e&&!a)return`
      <section class="assessment-hero">
        <div><p class="eyebrow">Assessment</p><h2>No assessment available for this link.</h2><p>Make sure you are logged into the same account that received the assessment email. If this keeps happening, contact Nearwork support.</p></div>
        <button class="primary-action fit" data-page="recruiter" type="button">${S("message-circle")} Contact support</button>
      </section>
    `;if(a){const o=Array.isArray(a.questions)?a.questions:[],c=String(a.status||"").toLowerCase()==="started",d=String(a.status||"").toLowerCase()==="completed",g=String(a.status||"").toLowerCase()==="cancelled",h=Wt(a),f=qe(),l=Number(a.currentQuestionIndex||0),r=Math.min(f??l,Math.max(o.length-1,0)),u=o[r],p=(u==null?void 0:u.stage)||a.currentStage||1;return`
      <section class="assessment-hero">
        <div>
          <p class="eyebrow">Nearwork assessment</p>
          <h2>${$(a.role||"Role assessment")}</h2>
          <p>${d?"This assessment has been submitted.":g?"This assessment was cancelled by Nearwork. If a new one is assigned, it will appear here automatically.":h?"This assessment link has expired.":"This assessment has 2 stages. Stage 1 is technical, Stage 2 is DISC. You must be logged in to complete it."}</p>
        </div>
        <button class="primary-action fit" id="startAssessment" type="button" ${d||g||h?"disabled":""}>${S(c?"play":"clipboard-check")} ${c?"Continue assessment":"Start assessment"}</button>
      </section>
      ${c&&!d&&!g&&!h?_t(a,p):""}
      <section class="info-grid">
        ${z("Stage 1","50 technical multiple-choice questions. 60 minutes.")}
        ${z("Stage 2","20 DISC multiple-choice questions. 30 minutes.")}
        ${z("24-hour link",`Expires ${we(a.expiresAt||a.deadline)}.`)}
      </section>
      <section class="section-block page-gap" id="assessmentWorkspace">
        <div class="section-heading"><div><p class="eyebrow">${d?"Results":`Stage ${p} of 2`}</p><h2>${d?"Assessment result":`${r+1} of ${o.length||70}`}</h2></div></div>
        ${d?Yt(a):g?W("Assessment cancelled","This assessment is no longer available. A new assigned assessment will appear here when your recruiter sends it."):h?W("Assessment expired","This unique assessment link is no longer available. Contact Nearwork if you need help."):Ht(a,c,r)}
      </section>
    `}return`
    <section class="assessment-hero">
      <div><p class="eyebrow">Assessment</p><h2>Complete role-specific questions when Nearwork assigns them.</h2><p>Your assessment will include English, work simulation, and role-specific scenarios. Results are reviewed by the Nearwork recruiting team.</p></div>
      <button class="primary-action fit" type="button" disabled>${S("lock")} Not assigned yet</button>
    </section>
    <section class="info-grid">${z("One attempt","Retakes are only opened by your recruiter when needed.")}${z("Timed work","Most role assessments take 45-90 minutes.")}${z("Recruiter review","You will get next steps or respectful feedback after review.")}</section>
  `}function _t(e,t){const n=Number(t),s=Pe(e.technicalStartedAt||e.startedAt)||new Date,a=Pe(e.discStartedAt)||new Date,o=n===1?s:a,c=Number(n===1?e.technicalMinutes||60:e.discMinutes||30),d=new Date(o.getTime()+c*60*1e3);return`
    <section class="assessment-timer-bar">
      <div>
        <span>Stage ${n} timer</span>
        <strong id="assessmentTimer" data-end="${d.toISOString()}">${c}:00</strong>
      </div>
      <p>${n===1?"Technical section: 60 minutes. DISC follows after Stage 1.":"DISC section: 30 minutes. Submit when you finish."}</p>
    </section>
  `}function Ht(e,t,n=null){var l,r,u,p;if(!t)return`
      <div class="assessment-preview">
        <div>
          ${S("timer")}
          <strong>Before you start</strong>
          <p>Choose a quiet room, close extra tabs, keep your phone away unless needed for login, and make sure your internet connection is stable. The timer starts when you begin.</p>
        </div>
        <ul>
          <li>Stage 1: 50 technical single-choice questions.</li>
          <li>Stage 2: 20 DISC single-choice questions.</li>
          <li>Your progress saves after every answer, and refresh will return to the current question.</li>
        </ul>
      </div>
    `;const s=(e.questions||[]).slice(0,70),a=Math.min(n??Number(e.currentQuestionIndex||0),Math.max(s.length-1,0)),o=s[a],c=((r=(l=e.answers)==null?void 0:l[o.id])==null?void 0:r.value)??((u=e.answers)==null?void 0:u[o.id])??"",d=Array.isArray(o.options)&&o.options.length?o.options:["Strongly agree","Agree","Neutral","Disagree"],g=(p=s[a+1])==null?void 0:p.stage,h=g&&g!==o.stage,f=o.multiple?"Multiple choice":"Single choice";return`
    <form id="assessmentQuestionForm" class="assessment-question-card" data-current-index="${a}">
      <div class="assessment-question-meta">
        <span>${$(o.part||o.type)}</span>
        <span>${$(o.bank||"")}</span>
        <span>${f}</span>
      </div>
      <div class="question-prompt">${$(o.q||"")}</div>
      <fieldset class="assessment-options">
        <legend>${f}</legend>
          ${d.map((m,A)=>`
            <label class="assessment-option">
              <input type="radio" name="answer" value="${A}" ${String(c)===String(A)?"checked":""} />
              <b>${String.fromCharCode(65+A)}</b>
              <span>${$(m)}</span>
            </label>
          `).join("")}
      </fieldset>
      <p class="field-hint">${h?"After this answer, you finished Stage 1 and will enter Stage 2.":"Your progress saves after every question. If you refresh, you will return here."}</p>
      <div class="job-footer">
        <button class="ghost-action" id="prevAssessmentQuestion" type="button" ${a===0?"disabled":""}>${S("arrow-left")} Previous</button>
        <button class="primary-action fit" type="submit">${a+1>=s.length?"Submit assessment":"Next"}</button>
      </div>
    </form>
  `}function Wt(e){return!(e!=null&&e.expiresAt)||String(e.status||"").toLowerCase()==="completed"?!1:Date.now()>new Date(e.expiresAt).getTime()}function Yt(e){return`
    <div class="summary-grid">
      ${F("Overall",`${e.score||0}%`,"sparkles")}
      ${F("Technical",`${e.technical||0}%`,"clipboard-check")}
      ${F("DISC",String(e.disc||"Submitted"),"users")}
      ${F("Progress",e.progress||"70/70","timer")}
    </div>
    ${W("Assessment submitted","Nearwork is reviewing your answers. Your results are saved to your profile.")}
  `}function Jt(e,t){const n=e.questions||[],s=n.filter(c=>c.stage===1),a=n.filter(c=>c.stage===2),o=s.filter(c=>{var d;return typeof c.correctIndex=="number"&&Number((d=t[c.id])==null?void 0:d.value)===c.correctIndex}).length;return{technicalScore:s.length?Math.round(o/s.length*100):0,discScore:a.length?Math.round(a.filter(c=>t[c.id]).length/a.length*100):0}}function Kt(){var t;const e=((t=i.candidate)==null?void 0:t.cvLibrary)||[];return`
    <section class="section-block">
      <div class="section-heading"><div><p class="eyebrow">CV picker</p><h2>Store multiple resumes</h2></div></div>
      <form id="cvForm" class="upload-box">
        ${S("upload-cloud")}<strong>Upload a CV for this role</strong><p>Save multiple versions and pick the best one for each opening.</p>
        <input name="cv" type="file" accept=".pdf,.doc,.docx" required />
        <input name="label" type="text" placeholder="CV label, e.g. CSM resume" />
        <button class="primary-action fit" type="submit">Upload CV</button>
      </form>
      <div class="cv-list">
        ${e.length?e.map(n=>`<article class="cv-item">${S("file-text")}<div><strong>${n.name||n.fileName}</strong><span>${we(n.uploadedAt)}</span></div>${n.url?`<a href="${n.url}" target="_blank" rel="noreferrer">Open</a>`:""}</article>`).join(""):W("No CVs saved yet","Upload role-specific resumes here.")}
      </div>
    </section>
  `}function Zt(){return`
    <section class="tips-hero"><div><p class="eyebrow">Candidate guide</p><h2>Practical prep for US SaaS interviews.</h2><p>Short, useful guidance candidates can read before recruiter screens, assessments, and client interviews.</p></div></section>
    <section class="tips-grid rich">
      ${Nt.map((e,t)=>`
        <article class="tip-card">
          <div class="tip-number">${String(t+1).padStart(2,"0")}</div>
          <span>${e.tag}</span>
          <h3>${e.title}</h3>
          <p>${e.body}</p>
          <div class="tip-actions">${e.actions.map(n=>`<small>${n}</small>`).join("")}</div>
          <strong>${e.read} read</strong>
        </article>
      `).join("")}
    </section>
  `}function Xt(){var n,s;const t=(((n=i.candidate)==null?void 0:n.recruiter)||{}).bookingUrl||((s=i.candidate)==null?void 0:s.recruiterBookingUrl)||"mailto:support@nearwork.co?subject=Nearwork%20candidate%20question";return`
    <section class="content-grid">
      <div class="section-block"><div class="section-heading"><div><p class="eyebrow">Recruiter</p><h2>Your Nearwork contact</h2></div></div>${We(!0)}</div>
      <div class="section-block compact"><div class="section-heading"><div><p class="eyebrow">Booking</p><h2>Schedule soon</h2></div></div><p class="muted">Ask the Nearwork recruiting team for the earliest available slot. Candidate booking links can be attached to this profile later.</p><a class="primary-action fit" href="${t}" target="_blank" rel="noreferrer">${S("calendar-plus")} Book recruiter call</a></div>
    </section>
  `}function ea(){return Ve("profile")}function Ve(e="profile"){var d,g,h,f,l,r,u,p,m,A;const t=oe(),n=Rt(),s=K[n.department]||[],a=pe(((d=i.candidate)==null?void 0:d.salary)||((g=i.candidate)==null?void 0:g.salaryUSD)),o=Lt(),c=((h=i.candidate)==null?void 0:h.targetRole)||((f=i.candidate)==null?void 0:f.headline)||"";return`
    <section class="section-block">
      <div class="section-heading"><div><p class="eyebrow">${e==="onboarding"?"Setup":"Profile"}</p><h2>${e==="onboarding"?"Complete your account":"Improve your match quality"}</h2></div><span class="profile-score">${be()}%</span></div>
      <form id="profileForm" class="profile-form">
        <div class="profile-card profile-identity wide">
          ${Fe("large")}
          <label>Profile photo <span class="optional-label">optional</span>
            <input name="photo" type="file" accept="image/png,image/jpeg,image/webp" />
          </label>
        </div>
        <label class="wide">Full name<input name="name" value="${$(((l=i.candidate)==null?void 0:l.name)||((r=i.user)==null?void 0:r.displayName)||"")}" /></label>
        <div class="profile-card wide">
          <div class="field-label">Role applying for</div>
          <div class="profile-card-grid">
            <label>Area
              <select name="roleGroup" id="roleGroupSelect">
                ${xt(o)}
              </select>
            </label>
            <label>Role
              <select name="targetRole" id="targetRoleSelect">
                ${je(o,c)}
              </select>
            </label>
          </div>
        </div>
        <div class="profile-card wide">
          <div class="field-label">Location</div>
          <div class="profile-card-grid">
            <label>Department
              <select name="department" id="departmentSelect">
                ${Object.keys(K).map(C=>`<option value="${$(C)}" ${C===n.department?"selected":""}>${C}</option>`).join("")}
              </select>
            </label>
            <label>City
              <select name="city" id="citySelect">
                ${s.map(C=>`<option value="${$(C)}" ${C===n.city?"selected":""}>${C}</option>`).join("")}
              </select>
            </label>
          </div>
        </div>
        <div class="profile-card wide">
          <div class="field-label">Compensation and English</div>
          <div class="profile-card-grid">
            <label>Target monthly salary
              <div class="salary-field"><span>USD</span><input id="salaryInput" name="salary" value="${$(a.salary||"")}" inputmode="numeric" placeholder="1000" /></div>
            </label>
            <label>English level<select name="english">${["","B1","B2","C1","C2","Native"].map(C=>{var D;return`<option value="${C}" ${((D=i.candidate)==null?void 0:D.english)===C?"selected":""}>${C||"Select level"}</option>`}).join("")}</select></label>
          </div>
        </div>
        <div class="profile-card wide">
          <div class="field-label">Contact</div>
          <div class="profile-card-grid">
            <label>WhatsApp number
              <input name="whatsapp" value="${$(((u=i.candidate)==null?void 0:u.whatsapp)||((p=i.candidate)==null?void 0:p.phone)||"")}" inputmode="tel" autocomplete="tel" placeholder="+57 300 123 4567" required />
            </label>
            <label>LinkedIn <span class="optional-label">optional</span>
              <input name="linkedin" value="${$(((m=i.candidate)==null?void 0:m.linkedin)||"")}" placeholder="https://linkedin.com/in/..." />
            </label>
          </div>
        </div>
        <div class="profile-card wide">
          <div class="field-label">Skills</div>
          <p class="field-hint">Tap the skills that best match your experience.</p>
          ${Mt(t)}
        </div>
        <div class="profile-card wide">
          <div class="field-label">CV</div>
          <p class="field-hint">Upload the CV you want Nearwork to use for your applications.</p>
          <input name="profileCv" type="file" accept=".pdf,.doc,.docx" />
          <input name="profileCvLabel" type="text" placeholder="CV label, e.g. Customer Success CV" />
        </div>
        <label class="wide">Summary <span class="optional-label">optional</span><textarea name="summary" placeholder="Add a short note about what you do best.">${((A=i.candidate)==null?void 0:A.summary)||""}</textarea></label>
        <input type="hidden" name="mode" value="${e}" />
        <button class="primary-action fit" type="submit">${S("save")} ${e==="onboarding"?"Finish setup":"Save profile"}</button>
      </form>
    </section>
  `}function be(){const e=["name","targetRole","department","city","english","salary","whatsapp"],t=e.filter(n=>{var s,a,o,c;return n==="targetRole"?!!((s=i.candidate)!=null&&s.targetRole||!ye((a=i.candidate)==null?void 0:a.headline)&&((o=i.candidate)!=null&&o.headline)):!!((c=i.candidate)!=null&&c[n])}).length+(oe().length?1:0);return Math.max(25,Math.round(t/(e.length+1)*100))}function ze(){const e=i.applications[0];return(e==null?void 0:e.stage)||(e==null?void 0:e.status)||"profile"}function _e(e){const t=Math.max(0,ke.findIndex(n=>e==null?void 0:e.toLowerCase().includes(n.key)));return`<div class="pipeline">${ke.map((n,s)=>`<article class="${s<=t?"done":""} ${s===t?"current":""}"><span>${s+1}</span><strong>${n.label}</strong><p>${n.help}</p></article>`).join("")}</div>`}function He(){return`
    <div class="empty-state">
      ${S("briefcase-business")}
      <strong>No active pipeline yet</strong>
      <p>Browse current openings and apply when you find a role that fits. Nearwork will show a pipeline here after an application moves forward.</p>
      <div class="empty-actions">
        <button class="primary-action fit" type="button" data-page="matches">${S("sparkles")} View matches</button>
        <a class="secondary-action" href="https://jobs.nearwork.co" target="_blank" rel="noreferrer">${S("external-link")} Open jobs</a>
      </div>
    </div>
  `}function F(e,t,n){return`<article class="metric"><span>${S(n)}</span><p>${e}</p><strong>${t}</strong></article>`}function ta(e){const t=H(e),n=new Set(i.applications.map(s=>s.jobId||s.openingCode)).has(t.code);return`
    <article class="job-card">
      <div><div class="match-pill">${t.match}% match</div><h3>${t.title}</h3><p>${t.orgName} · ${t.location}</p></div>
      <p class="job-description">${t.description}</p>
      <div class="skill-row">${t.skills.slice(0,4).map(s=>`<span>${s}</span>`).join("")}</div>
      <div class="job-footer"><strong>${t.compensation}</strong><button class="secondary-action" type="button" data-apply="${t.code}" ${n?"disabled":""}>${n?"Applied":"Apply"}</button></div>
    </article>
  `}function aa(e){return`<article class="timeline-item"><span>${S("circle-dot")}</span><div><strong>${e.jobTitle||e.title||"Application"}</strong><p>${e.clientName||e.company||"Nearwork"} · ${e.status||"submitted"}</p><small>${we(e.updatedAt||e.createdAt)}</small></div></article>`}function z(e,t){return`<article class="info-card"><strong>${e}</strong><p>${t}</p></article>`}function We(e=!1){var o;const t=((o=i.candidate)==null?void 0:o.recruiter)||{},n=t.email||"support@nearwork.co",s=t.whatsapp||Ct,a=t.whatsappUrl||At;return`<article class="recruiter-card"><div class="avatar recruiter-avatar">NW</div><div><strong>${t.name||"Nearwork Support"}</strong><p><a href="mailto:${n}">${n}</a></p><p><a href="${a}" target="_blank" rel="noreferrer">WhatsApp ${s}</a></p>${e?"<span>Questions about assessments, interviews, feedback, or CV selection should go here.</span>":""}</div></article>`}function W(e,t){return`<div class="empty-state">${S("inbox")}<strong>${e}</strong><p>${t}</p></div>`}function sa(){fe.innerHTML='<main class="loading-screen"><span class="logo-mark">N</span><p>Loading Talent...</p></main>'}function na(){var e,t,n,s,a,o,c,d,g,h,f;(e=document.querySelector("#signOut"))==null||e.addEventListener("click",async()=>{await ot(G),window.history.pushState({page:"overview"},"","/"),y({user:null,candidate:null,applications:[],assessments:[],jobs:[],view:"login",activePage:"overview",message:""})}),(t=document.querySelector("#signIn"))==null||t.addEventListener("click",()=>{window.history.pushState({page:"overview"},"","/"),y({view:"login",activePage:"overview",message:""})}),document.querySelectorAll("[data-page]").forEach(l=>{l.addEventListener("click",()=>ue(l.dataset.page))}),document.querySelector("#availability").addEventListener("change",async l=>{const r=l.target.value;y({candidate:{...i.candidate,availability:r}}),i.user&&Y?await bt(i.user.uid,r):y({message:"Sign in with Google to save availability."})}),(n=document.querySelector("#filterMatches"))==null||n.addEventListener("click",()=>{var r,u,p;const l=!!((r=i.candidate)!=null&&r.targetRole||!ye((u=i.candidate)==null?void 0:u.headline)&&((p=i.candidate)!=null&&p.headline)||oe().length);y({matchesFiltered:l?!i.matchesFiltered:!1,message:l?"":"Add your role and skills in Profile first, then filter openings."})}),(s=document.querySelector("#departmentSelect"))==null||s.addEventListener("change",l=>{const r=document.querySelector("#citySelect"),u=K[l.target.value]||[];r.innerHTML=u.map(p=>`<option value="${$(p)}">${p}</option>`).join("")}),(a=document.querySelector("#roleGroupSelect"))==null||a.addEventListener("change",l=>{const r=document.querySelector("#targetRoleSelect");r.innerHTML=je(l.target.value,"")}),(o=document.querySelector("#salaryInput"))==null||o.addEventListener("blur",l=>{const r=pe(l.target.value);r.salary&&(l.target.value=r.salary)}),document.querySelectorAll("[data-apply]").forEach(l=>{l.addEventListener("click",async()=>{const r=i.jobs.map(H).find(u=>u.code===l.dataset.apply);l.disabled=!0,l.textContent="Submitted",i.user&&Y?(await yt(i.user.uid,r),await Qe(i.user),ue("applications")):y({message:"Sign in with Google to apply to this opening."})})}),(c=document.querySelector("#startAssessment"))==null||c.addEventListener("click",async()=>{var u;const l=_()||((u=(i.assessments||[])[0])==null?void 0:u.id),r=(i.assessments||[]).find(p=>p.id===l)||(i.assessments||[])[0];if(!l||!i.user){y({message:"Please log in to start your assessment."});return}try{await vt(l,i.user.uid),ae(l,Number((r==null?void 0:r.currentQuestionIndex)||0),!0);const p=(i.assessments||[]).map(m=>m.id===l?{...m,status:"started",startedAt:m.startedAt||new Date().toISOString(),technicalStartedAt:m.technicalStartedAt||new Date().toISOString()}:m);y({assessments:p,activePage:"assessment",message:""})}catch(p){y({message:j(p)})}}),(d=document.querySelector("#prevAssessmentQuestion"))==null||d.addEventListener("click",async()=>{var C,D,O,w;const l=_()||((C=(i.assessments||[])[0])==null?void 0:C.id),r=(i.assessments||[]).find(I=>I.id===l),u=Number(((D=document.querySelector("#assessmentQuestionForm"))==null?void 0:D.dataset.currentIndex)??(r==null?void 0:r.currentQuestionIndex)??0),p=Math.max(0,u-1),m=(O=r==null?void 0:r.questions)==null?void 0:O[p];await Ce(l,"__progress__","",{currentQuestionIndex:p,totalQuestions:((w=r==null?void 0:r.questions)==null?void 0:w.length)||70,currentStage:(m==null?void 0:m.stage)||1}),ae(l,p);const A=(i.assessments||[]).map(I=>I.id===l?{...I,currentQuestionIndex:p,currentStage:(m==null?void 0:m.stage)||1}:I);y({assessments:A,activePage:"assessment",message:""})}),(g=document.querySelector("#assessmentQuestionForm"))==null||g.addEventListener("submit",async l=>{var O;l.preventDefault();const r=_()||((O=(i.assessments||[])[0])==null?void 0:O.id),u=(i.assessments||[]).find(w=>w.id===r),p=(u==null?void 0:u.questions)||[],m=Number(l.currentTarget.dataset.currentIndex??(u==null?void 0:u.currentQuestionIndex)??0),A=p[m],C=new FormData(l.currentTarget).get("answer");if(!A||C===null){y({message:"Select an answer before continuing."});return}const D={...u.answers||{},[A.id]:{value:Number(C),answeredAt:new Date().toISOString()}};try{if(m+1>=p.length){const w=Jt(u,D);await wt(r,D,{totalQuestions:p.length,technicalScore:w.technicalScore,discScore:w.discScore,score:Math.round(w.technicalScore*.75+w.discScore*.25)});const I=(i.assessments||[]).map(L=>L.id===r?{...L,answers:D,status:"completed",score:Math.round(w.technicalScore*.75+w.discScore*.25),technical:w.technicalScore,disc:`${w.discScore}%`,progress:`${p.length}/${p.length}`}:L);y({assessments:I,activePage:"assessment",message:""})}else{const w=p[m+1],I=A.stage===1&&(w==null?void 0:w.stage)===2&&!u.discStartedAt,L=I?new Date().toISOString():u.discStartedAt;await Ce(r,A.id,D[A.id],{currentQuestionIndex:m+1,totalQuestions:p.length,currentStage:(w==null?void 0:w.stage)||A.stage||1,discStartedAt:I?L:void 0}),ae(r,m+1);const U=(i.assessments||[]).map(Q=>Q.id===r?{...Q,answers:D,currentQuestionIndex:m+1,currentStage:(w==null?void 0:w.stage)||A.stage||1,discStartedAt:L,progress:`${m+1}/${p.length}`}:Q);y({assessments:U,activePage:"assessment",message:""})}}catch(w){y({message:j(w)})}}),(h=document.querySelector("#profileForm"))==null||h.addEventListener("submit",async l=>{var C,D,O,w,I,L;l.preventDefault();const r=new FormData(l.currentTarget),u=r.get("department"),p=r.get("city"),m=pe(r.get("salary")),A={name:r.get("name"),targetRole:r.get("targetRole"),headline:r.get("targetRole"),department:u,city:p,locationId:`${String(p).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g,"-")}-co`,location:`${p}, ${u}`,locationCity:p,locationDepartment:u,locationCountry:"Colombia",english:r.get("english"),salary:m.salary,salaryUSD:m.salaryUSD,linkedin:r.get("linkedin"),whatsapp:r.get("whatsapp"),phone:r.get("whatsapp"),skills:[...new Set([...r.getAll("skills"),...Ne(r.get("otherSkills"))])],otherSkills:Ne(r.get("otherSkills")),summary:r.get("summary"),email:((C=i.candidate)==null?void 0:C.email)||((D=i.user)==null?void 0:D.email)||"",availability:((O=i.candidate)==null?void 0:O.availability)||"open",onboarded:!0};if(!i.user){y({candidate:{...i.candidate,...A},message:"Preview updated. Sign in with Google to save this profile."});return}try{const U=r.get("photo");let Q=((w=i.candidate)==null?void 0:w.photoURL)||((I=i.user)==null?void 0:I.photoURL)||"";U!=null&&U.name&&(Q=await $t(i.user.uid,U));const X=r.get("profileCv");let V=null;X!=null&&X.name&&(V=await Ae(i.user.uid,X,r.get("profileCvLabel")));const re={...A,photoURL:Q,...V?{activeCvId:V.id,activeCvName:V.name||V.fileName,cvLibrary:[...((L=i.candidate)==null?void 0:L.cvLibrary)||[],V]}:{}},le=await St(i.user.uid,re),Je=(le==null?void 0:le.atsSynced)===!1?"Profile saved. Nearwork will finish connecting it to your workspace.":"Profile saved.";r.get("mode")==="onboarding"?(window.history.pushState({page:"overview"},"","/"),y({candidate:{...i.candidate,...re},activePage:"overview",message:"Profile complete. Welcome to Talent."})):y({candidate:{...i.candidate,...re},message:Je})}catch(U){y({message:j(U)})}}),(f=document.querySelector("#cvForm"))==null||f.addEventListener("submit",async l=>{var p;l.preventDefault();const r=new FormData(l.currentTarget),u=r.get("cv");if(u!=null&&u.name){if(!i.user){y({message:"Sign in with Google to upload and store CVs."});return}try{const m=await Ae(i.user.uid,u,r.get("label"));y({candidate:{...i.candidate,cvLibrary:[...((p=i.candidate)==null?void 0:p.cvLibrary)||[],m],activeCvId:m.id},message:"CV uploaded."})}catch(m){y({message:j(m)})}}})}function Ye(){if(i.loading)return sa();if(i.view==="dashboard")return Ot();Ge()}window.addEventListener("popstate",()=>{const e=ne();e==="overview"&&!i.user?y({view:"login",activePage:"overview",message:""}):i.view==="dashboard"?ue(e,!1):se()});Y?(tt(G,e=>{e?Qe(e):se()}),window.setTimeout(()=>{i.loading&&se()},2500)):se();
