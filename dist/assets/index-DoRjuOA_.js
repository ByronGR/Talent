import{initializeApp as nt}from"https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";import{getAuth as it,GoogleAuthProvider as ot,signInWithPopup as rt,onAuthStateChanged as lt,sendPasswordResetEmail as ct,createUserWithEmailAndPassword as dt,updateProfile as ut,signInWithEmailAndPassword as pt,signOut as mt}from"https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";import{getFirestore as gt,query as q,collection as R,where as j,limit as F,getDocs as B,orderBy as Pe,getDoc as te,doc as D,serverTimestamp as P,setDoc as M,updateDoc as ht,addDoc as De,arrayUnion as ge}from"https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";import{getStorage as ft,ref as Me,uploadBytes as Re,getDownloadURL as Oe}from"https://www.gstatic.com/firebasejs/10.12.5/firebase-storage.js";(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const a of document.querySelectorAll('link[rel="modulepreload"]'))n(a);new MutationObserver(a=>{for(const i of a)if(i.type==="childList")for(const c of i.addedNodes)c.tagName==="LINK"&&c.rel==="modulepreload"&&n(c)}).observe(document,{childList:!0,subtree:!0});function s(a){const i={};return a.integrity&&(i.integrity=a.integrity),a.referrerPolicy&&(i.referrerPolicy=a.referrerPolicy),a.crossOrigin==="use-credentials"?i.credentials="include":a.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function n(a){if(a.ep)return;a.ep=!0;const i=s(a);fetch(a.href,i)}})();const Ue={apiKey:"AIzaSyApRNyW8PoP28E0x77dUB5jOgHuTqA2by4",authDomain:"nearwork-97e3c.firebaseapp.com",projectId:"nearwork-97e3c",storageBucket:"nearwork-97e3c.firebasestorage.app",messagingSenderId:"145642656516",appId:"1:145642656516:web:0ac2da8931283121e87651",measurementId:"G-3LC8N6FFSH"},X=Object.values(Ue).slice(0,6).every(Boolean),Q=X?nt(Ue):null,z=Q?it(Q):null,w=Q?gt(Q):null,we=Q?ft(Q):null,yt=Q?new ot:null,b={users:"users",candidates:"candidates",openings:"openings",pipelines:"pipelines",applications:"applications",assessments:"assessments",activity:"candidateActivity"};function x(){if(!Q||!z||!w||!we)throw new Error("Missing Firebase environment variables. Copy .env.example to .env.local and fill in the Admin app config.")}async function qe(e){x();const t=await te(D(w,b.users,e));return t.exists()?{id:t.id,...t.data()}:null}async function vt(e){x();const t=String(e||"").trim(),s=t.toLowerCase(),n=q(R(w,b.users),j("email","==",s),F(1)),a=await B(n);if(!a.empty)return{id:a.docs[0].id,...a.docs[0].data()};if(t===s)return null;const i=q(R(w,b.users),j("email","==",t),F(1)),c=await B(i);return c.empty?null:{id:c.docs[0].id,...c.docs[0].data()}}async function je(e){const t=await qe(e.uid);if(t)return t;const s=await vt(e.email);return s?(await be(e.uid,{...s,email:e.email,connectedFromUserId:s.id}),{...s,id:e.uid,connectedFromUserId:s.id}):null}async function be(e,t){x();const s={...t,role:"candidate",updatedAt:P()};await M(D(w,b.users,e),s,{merge:!0})}function ce(e){return`CAND-${String(e||"").replace(/[^a-z0-9]/gi,"").slice(0,8).toUpperCase()||Date.now()}`}function wt(e){return String(e||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"")}function Se(e,t){const s=t.candidateCode||ce(e),n=t.location||[t.locationCity||t.city,t.locationDepartment||t.department].filter(Boolean).join(", "),a=new Date().toISOString().slice(0,10);return{code:s,uid:e,ownerUid:e,name:t.name||"Talent member",role:t.targetRole||t.headline||"Nearwork candidate",skills:Array.isArray(t.skills)?t.skills:[],applied:t.applied||a,lastContact:t.lastContact||a,experience:Number(t.experience||0),location:n,city:wt(t.locationCity||t.city||n),department:t.locationDepartment||t.department||"",country:t.locationCountry||"Colombia",source:"talent.nearwork.co",status:t.status||"active",score:Number(t.score||50),email:t.email||"",phone:t.whatsapp||t.phone||"",whatsapp:t.whatsapp||t.phone||"",salary:t.salary||"",salaryUSD:Number(t.salaryUSD||0)||null,salaryAmount:Number(t.salaryAmount||t.expectedSalaryAmount||0)||null,salaryCurrency:t.salaryCurrency||t.expectedSalaryCurrency||"USD",expectedSalaryAmount:Number(t.expectedSalaryAmount||t.salaryAmount||0)||null,expectedSalaryCurrency:t.expectedSalaryCurrency||t.salaryCurrency||"USD",expectedSalary:t.expectedSalary||t.salary||"",availability:t.availability||"open",english:t.english||"",visa:t.visa||"No",linkedin:t.linkedin||"",cv:t.activeCvName||"",tags:t.tags||["talent profile"],notes:t.summary||"",appliedBefore:!!t.appliedBefore,applications:t.applications||[],pipelineCodes:t.pipelineCodes||[],loom:t.loom||"Not uploaded",assessments:t.assessments||[],work:t.work||[],updatedAt:P()}}async function bt(){x();const e=await rt(z,yt),t=await je(e.user),s={email:e.user.email,name:e.user.displayName||"",availability:"open",onboarded:!1};t||await be(e.user.uid,s);const n=ce(e.user.uid),a={...t||s,candidateCode:n};return await M(D(w,b.candidates,n),Se(e.user.uid,a),{merge:!0}).catch(()=>null),e.user}async function St(e){x();const t=q(R(w,b.applications),j("candidateId","==",e),Pe("updatedAt","desc"),F(20)),s=q(R(w,b.applications),j("ownerUid","==",e),Pe("updatedAt","desc"),F(20)),n=await Promise.allSettled([B(t),B(s)]),a=new Map;return n.forEach(i=>{i.status==="fulfilled"&&i.value.docs.forEach(c=>a.set(c.id,{id:c.id,...c.data()}))}),Array.from(a.values()).sort((i,c)=>{const d=g=>{var h,y;return((y=(h=g==null?void 0:g.toDate)==null?void 0:h.call(g))==null?void 0:y.getTime())??(g?new Date(g).getTime():0)};return d(c.updatedAt||c.createdAt)-d(i.updatedAt||i.createdAt)})}async function Ct(e,t="",s=""){x();const n=String(t||"").trim().toLowerCase(),a=String(s||"").trim(),i=[B(q(R(w,b.assessments),j("candidateUid","==",e),F(25))),B(q(R(w,b.assessments),j("candidateId","==",e),F(25)))];n&&i.push(B(q(R(w,b.assessments),j("candidateEmail","==",n),F(25)))),a&&i.push(B(q(R(w,b.assessments),j("candidateCode","==",a),F(25))));const c=await Promise.allSettled(i),d=new Map;return c.forEach(g=>{g.status==="fulfilled"&&g.value.docs.forEach(h=>d.set(h.id,{id:h.id,...h.data()}))}),Array.from(d.values()).sort((g,h)=>{const y=l=>{var r,u;return((u=(r=l==null?void 0:l.toDate)==null?void 0:r.call(l))==null?void 0:u.getTime())??(l?new Date(l).getTime():0)};return y(h.updatedAt||h.createdAt||h.sentAt)-y(g.updatedAt||g.createdAt||g.sentAt)})}async function $t(e,t,s="",n=""){x();const a=await te(D(w,b.assessments,e));if(!a.exists())return null;const i={id:a.id,...a.data()},c=String(s||"").trim().toLowerCase(),d=String(n||"").trim();return i.candidateUid===t||i.candidateId===t||String(i.candidateEmail||"").trim().toLowerCase()===c||String(i.candidateCode||"").trim()===d?i:null}async function At(e,t){x();const s=await te(D(w,b.assessments,e)),n=s.exists()?s.data():{};if(n.status==="completed")throw new Error("This assessment is already completed.");if(n.expiresAt&&Date.now()>new Date(n.expiresAt).getTime())throw new Error("This assessment link has expired.");await M(D(w,b.assessments,e),{status:"started",currentQuestionIndex:Number(n.currentQuestionIndex||0),currentStage:Number(n.currentStage||1),technicalStartedAt:n.technicalStartedAt||P(),startedAt:n.startedAt||P(),updatedAt:P()},{merge:!0})}async function se(e,t,s,n={}){x();const a=await te(D(w,b.assessments,e)),i=a.exists()?a.data():{};if(i.status==="completed")throw new Error("This assessment is already completed.");if(i.expiresAt&&Date.now()>new Date(i.expiresAt).getTime())throw new Error("This assessment link has expired.");await M(D(w,b.assessments,e),{[`answers.${t}`]:s,progress:`${n.currentQuestionIndex||0}/${n.totalQuestions||""}`.replace(/\/$/,""),currentQuestionIndex:n.currentQuestionIndex||0,currentStage:n.currentStage||1,...n.discStartedAt?{discStartedAt:n.discStartedAt}:{},updatedAt:P()},{merge:!0})}async function kt(e,t,s={}){var r;x();const n=D(w,b.assessments,e),a=await te(n),i=a.exists()?a.data():{};if(i.status==="completed")throw new Error("This assessment is already completed.");if(i.expiresAt&&Date.now()>new Date(i.expiresAt).getTime())throw new Error("This assessment link has expired.");const c=Object.values(t||{}).filter(u=>String((u==null?void 0:u.value)??u??"").trim()).length,d=Number(s.totalQuestions||Object.keys(t||{}).length||0),g=Number(s.technicalScore||0),h=Number(s.discScore||0),y=Number(s.score||(d?Math.round(c/d*100):0));await M(n,{answers:t,answeredCount:c,totalQuestions:d,score:y,technical:g||y,disc:((r=s.discProfile)==null?void 0:r.label)||(h?`${h}%`:"Submitted"),discScore:h,discProfile:s.discProfile||null,progress:`${c}/${d}`,status:"completed",finished:new Date().toLocaleString("en-US",{month:"short",day:"numeric",year:"numeric",hour:"numeric",minute:"2-digit"}),finishedAt:P(),updatedAt:P()},{merge:!0});const l=Math.round(y);i.candidateUid&&await M(D(w,b.users,i.candidateUid),{score:l,nwScore:l,lastAssessmentScore:l,lastAssessmentId:e,updatedAt:P()},{merge:!0}).catch(()=>null),i.candidateCode&&await M(D(w,b.candidates,i.candidateCode),{score:l,nwScore:l,lastAssessmentScore:l,lastAssessmentId:e,updatedAt:P()},{merge:!0}).catch(()=>null)}async function Fe(){x();const e=q(R(w,b.openings),j("published","==",!0),F(12));return(await B(e)).docs.map(s=>({id:s.id,...s.data()}))}async function Nt(e,t){x();const s=t.code||t.id,n=await qe(e).catch(()=>null),a={candidateId:e,candidateCode:(n==null?void 0:n.candidateCode)||ce(e),candidateEmail:(n==null?void 0:n.email)||"",candidateName:(n==null?void 0:n.name)||"",openingCode:s,jobId:s,jobTitle:t.title||t.role||"Untitled role",clientName:t.orgName||t.clientName||t.company||"Nearwork client",status:"submitted",source:"talent.nearwork.co",createdAt:P(),updatedAt:P()};await De(R(w,b.applications),a),await M(D(w,b.candidates,a.candidateCode),{...Se(e,{...n||{},candidateCode:a.candidateCode,applications:ge(s),appliedBefore:!0,lastContact:new Date().toISOString().slice(0,10)}),applications:ge(s),appliedBefore:!0},{merge:!0}).catch(()=>null),await De(R(w,b.activity),{candidateId:e,type:"application_submitted",title:a.jobTitle,createdAt:P()}).catch(()=>null)}async function Pt(e,t){await ht(D(w,b.users,e),{availability:t,updatedAt:P()})}async function Dt(e,t){x();const s=t.candidateCode||ce(e);await M(D(w,b.users,e),{...t,candidateCode:s,role:"candidate",updatedAt:P()},{merge:!0});try{return await M(D(w,b.candidates,s),Se(e,{...t,candidateCode:s}),{merge:!0}),{candidateCode:s,atsSynced:!0}}catch(n){return console.warn("Candidate ATS sync failed.",n),{candidateCode:s,atsSynced:!1}}}async function It(e,t){x();const s=t.name.replace(/[^a-z0-9._-]/gi,"-").toLowerCase(),n=`candidate-photos/${e}/${Date.now()}-${s}`,a=Me(we,n);await Re(a,t,{contentType:t.type||"application/octet-stream"});const i=await Oe(a);return await M(D(w,b.users,e),{photoURL:i,updatedAt:P()},{merge:!0}),i}async function Ie(e,t,s){x();const n=t.name.replace(/[^a-z0-9._-]/gi,"-").toLowerCase(),a=`candidate-cvs/${e}/${Date.now()}-${n}`,i=Me(we,a);await Re(i,t,{contentType:t.type||"application/octet-stream"});const c=await Oe(i),d={id:a,name:s||t.name,fileName:t.name,url:c,uploadedAt:new Date().toISOString()};return await M(D(w,b.users,e),{cvLibrary:ge(d),activeCvId:d.id,activeCvName:d.name||d.fileName,updatedAt:P()},{merge:!0}),d}const Ce=document.querySelector("#app"),Tt="+573135928691",xt="https://wa.me/573135928691",oe=[{id:"OPEN-CSM-DEMO",code:"OPEN-CSM-DEMO",title:"Customer Success Manager",orgName:"US SaaS company",location:"Remote, Colombia",compensation:"$2,000-$2,800/mo USD",match:94,skills:["SaaS","Customer Success","English C1","QBRs"],description:"Own onboarding, adoption, renewals, and expansion for a portfolio of US-based SaaS clients."},{id:"OPEN-SDR-DEMO",code:"OPEN-SDR-DEMO",title:"SDR / Sales Development Rep",orgName:"B2B marketplace",location:"Remote",compensation:"$1,700-$2,200/mo USD",match:89,skills:["HubSpot","Outbound","Salesforce","English C1"],description:"Qualify outbound leads, book demos, and work closely with a high-performing US sales team."},{id:"OPEN-SUP-DEMO",code:"OPEN-SUP-DEMO",title:"Technical Support Specialist",orgName:"Cloud workflow platform",location:"Remote, LatAm",compensation:"$1,400-$1,900/mo USD",match:86,skills:["Technical Support","APIs","Tickets","Troubleshooting"],description:"Handle Tier 1 and Tier 2 support, troubleshoot product issues, and maintain excellent CSAT."}],ee={"Customer Success":["Customer Success Manager","Customer Success Associate","Account Manager","Implementation Specialist","Onboarding Specialist","Renewals Manager"],Sales:["SDR / Sales Development Rep","BDR / Business Development Rep","Account Executive","Sales Operations Specialist","Sales Manager"],Support:["Technical Support Specialist","Customer Support Representative","Support Team Lead","QA Support Analyst"],Operations:["Operations Manager","Operations Analyst","Executive Assistant","Virtual Assistant","Project Coordinator","Recruiting Coordinator"],Marketing:["Marketing Ops / Content Specialist","Content Writer","SEO Specialist","Lifecycle Marketing Specialist","Social Media Manager"],Engineering:["Software Developer (Full Stack)","Frontend Developer","Backend Developer","No-Code Developer","Data Analyst","QA Engineer"],Finance:["Bookkeeper","Accounting Assistant","Financial Analyst","Payroll Specialist"]},Et={"CRM & Sales":["HubSpot","Salesforce","Pipedrive","Apollo","Outbound","Cold Email","Discovery Calls","CRM Hygiene"],"Customer Success":["SaaS","Customer Success","QBRs","Onboarding","Renewals","Expansion","Churn Reduction","Intercom","Zendesk"],Support:["Technical Support","Tickets","Troubleshooting","APIs","Bug Reproduction","Help Center","CSAT"],Operations:["Excel","Google Sheets","Reporting","Process Design","Project Management","Notion","Airtable","Zapier"],Marketing:["Content","SEO","Lifecycle","Email Marketing","HubSpot Marketing","Copywriting","Analytics"],Engineering:["JavaScript","React","Node.js","SQL","Python","REST APIs","QA","GitHub"],Language:["English B2","English C1","English C2","Spanish Native"]},Be={Amazonas:["Leticia","Puerto Nariño"],Antioquia:["Medellín","Abejorral","Apartadó","Bello","Caldas","Caucasia","Copacabana","El Carmen de Viboral","Envigado","Girardota","Itagüí","La Ceja","La Estrella","Marinilla","Rionegro","Sabaneta","Santa Fe de Antioquia","Turbo"],Arauca:["Arauca","Arauquita","Saravena","Tame"],Atlántico:["Barranquilla","Baranoa","Galapa","Malambo","Puerto Colombia","Sabanalarga","Soledad"],"Bogotá D.C.":["Bogotá"],Bolívar:["Cartagena","Arjona","El Carmen de Bolívar","Magangué","Mompox","Turbaco"],Boyacá:["Tunja","Chiquinquirá","Duitama","Paipa","Sogamoso","Villa de Leyva"],Caldas:["Manizales","Aguadas","Chinchiná","La Dorada","Riosucio","Villamaría"],Caquetá:["Florencia","El Doncello","Puerto Rico","San Vicente del Caguán"],Casanare:["Yopal","Aguazul","Paz de Ariporo","Villanueva"],Cauca:["Popayán","El Tambo","Puerto Tejada","Santander de Quilichao"],Cesar:["Valledupar","Aguachica","Bosconia","Codazzi"],Chocó:["Quibdó","Istmina","Nuquí","Tadó"],Córdoba:["Montería","Cereté","Lorica","Sahagún"],Cundinamarca:["Chía","Cajicá","Facatativá","Fusagasugá","Girardot","Madrid","Mosquera","Soacha","Tocancipá","Zipaquirá"],Guainía:["Inírida"],Guaviare:["San José del Guaviare","Calamar","El Retorno","Miraflores"],Huila:["Neiva","Garzón","La Plata","Pitalito"],"La Guajira":["Riohacha","Maicao","San Juan del Cesar","Uribia"],Magdalena:["Santa Marta","Ciénaga","El Banco","Fundación"],Meta:["Villavicencio","Acacías","Granada","Puerto López"],Nariño:["Pasto","Ipiales","Tumaco","Túquerres"],"Norte de Santander":["Cúcuta","Ocaña","Pamplona","Villa del Rosario"],Putumayo:["Mocoa","Orito","Puerto Asís","Valle del Guamuez"],Quindío:["Armenia","Calarcá","La Tebaida","Montenegro","Quimbaya"],Risaralda:["Pereira","Dosquebradas","La Virginia","Santa Rosa de Cabal"],"San Andrés y Providencia":["San Andrés","Providencia"],Santander:["Bucaramanga","Barrancabermeja","Floridablanca","Girón","Piedecuesta","San Gil"],Sucre:["Sincelejo","Corozal","Sampués","Tolú"],Tolima:["Ibagué","Espinal","Honda","Melgar"],"Valle del Cauca":["Cali","Buga","Buenaventura","Cartago","Jamundí","Palmira","Tuluá","Yumbo"],Vaupés:["Mitú"],Vichada:["Puerto Carreño","La Primavera","Santa Rosalía"]};let _=Be;const Lt=[{title:"How to answer salary questions",tag:"Interview",read:"4 min",body:"Use a confident range, anchor it to the role, and avoid apologizing for earning in USD.",actions:["Know your floor","Use monthly USD","Mention flexibility last"]},{title:"Writing a CV for US SaaS companies",tag:"CV",read:"6 min",body:"Translate local experience into metrics US hiring managers can scan in under a minute.",actions:["Lead with outcomes","Add tools","Quantify scope"]},{title:"Before your recruiter screen",tag:"Process",read:"3 min",body:"Prepare availability, compensation, English comfort, and two strong role stories.",actions:["Check your setup","Review the opening","Bring questions"]},{title:"STAR stories that feel natural",tag:"Interview",read:"5 min",body:"Keep stories specific, concise, and tied to business impact instead of job duties.",actions:["Situation","Action","Result"]}],Te=[{key:"applied",label:"Applied",help:"Your profile is in Nearwork review."},{key:"profile",label:"Profile Review",help:"We are checking role fit, CV, and background."},{key:"assessment",label:"Assessment",help:"Complete role-specific questions when assigned."},{key:"interview",label:"Interview",help:"Meet the recruiter or client team."},{key:"decision",label:"Decision",help:"Final feedback or offer decision."}];let o={user:null,candidate:null,applications:[],assessments:[],jobs:[],loading:!0,view:"login",activePage:"overview",matchesFiltered:!1,message:""};const pe=sessionStorage.getItem("nw_restore_path");pe&&(sessionStorage.removeItem("nw_restore_path"),window.history.replaceState({page:pe},"",pe));function $e(){return[["overview","layout-dashboard","Overview"],["matches","briefcase-business","Matches"],["applications","send","Applications"],["assessment","clipboard-check","Assessment"],["cvs","files","CV Picker"],["tips","book-open","Tips"],["recruiter","calendar-days","Recruiter"],["profile","user-round-cog","Profile"]]}function le(){const t=window.location.pathname.split("/").filter(Boolean)[0];return t==="onboarding"?"onboarding":t==="assessment"||t==="assessments"?"assessment":$e().some(([s])=>s===t)?t:"overview"}function G(){const e=window.location.pathname.split("/").filter(Boolean);return(e[0]==="assessment"||e[0]==="assessments")&&e[1]||""}function Qe(){const e=window.location.pathname.split("/").filter(Boolean),t=e.findIndex(n=>n==="q"||n==="question");if(t===-1)return null;const s=Number(e[t+1]);return Number.isFinite(s)&&s>0?s-1:null}function Mt(e,t=0){return`/assessment/${encodeURIComponent(e)}/start/q/${Number(t||0)+1}`}function Z(e,t=0,s=!1){const n=Mt(e,t);if(window.location.pathname===n)return;const a=s?"replaceState":"pushState";window.history[a]({page:"assessment",assessmentId:e,questionIndex:t},"",n)}function k(e,t){return`<i data-lucide="${e}" aria-label="${e}"></i>`}function Ge(){window.lucide&&window.lucide.createIcons()}function v(e){o={...o,...e},at()}function he(e,t=!0){const n=e==="onboarding"||$e().some(([a])=>a===e)?e:"overview";o={...o,activePage:n,matchesFiltered:n==="matches"?o.matchesFiltered:!1,message:""},t&&window.history.pushState({page:n},"",n==="overview"?"/":`/${n}`),at()}function Ve(){var t,s;return(((t=o.candidate)==null?void 0:t.name)||((s=o.user)==null?void 0:s.displayName)||"there").split(" ")[0]||"there"}function Rt(){var t,s,n;return(((t=o.candidate)==null?void 0:t.name)||((s=o.user)==null?void 0:s.displayName)||((n=o.user)==null?void 0:n.email)||"NW").split(/[ @.]/).filter(Boolean).slice(0,2).map(a=>a[0]).join("").toUpperCase()}function ze(e="normal"){var n,a;const t=((n=o.candidate)==null?void 0:n.photoURL)||((a=o.user)==null?void 0:a.photoURL)||"",s=e==="large"?"avatar avatar-large":"avatar";return t?`<img class="${s}" src="${$(t)}" alt="${$(Ve())}" />`:`<div class="${s}">${Rt()}</div>`}function $(e){return String(e||"").replaceAll("&","&amp;").replaceAll('"',"&quot;").replaceAll("<","&lt;").replaceAll(">","&gt;")}function Ae(e){if(!e)return"Recently";const t=e.toDate?e.toDate():new Date(e);return new Intl.DateTimeFormat("en",{month:"short",day:"numeric"}).format(t)}function de(){var t;const e=((t=o.candidate)==null?void 0:t.skills)||[];return Array.isArray(e)?e:String(e).split(",").map(s=>s.trim()).filter(Boolean)}function Ot(){var t;const e=((t=o.candidate)==null?void 0:t.otherSkills)||[];return Array.isArray(e)?e.join(", "):String(e||"")}function xe(e){return String(e||"").split(",").map(t=>t.trim()).filter(Boolean)}function ke(e){return["Nearwork candidate","Preview mode","Talent member"].includes(String(e||"").trim())}function Ut(){return Ne()>=100}function Ee(e){if(!e)return null;if(e.toDate)return e.toDate();if(typeof e=="object"&&typeof e.seconds=="number")return new Date(e.seconds*1e3);const t=new Date(e);return Number.isNaN(t.getTime())?null:t}function ae(e){return Number(e||1)===1?"Technical Assessment":"DISC Assessment"}function me(e,t){var s,n,a;return((n=(s=e==null?void 0:e.answers)==null?void 0:s[t==null?void 0:t.id])==null?void 0:n.value)??((a=e==null?void 0:e.answers)==null?void 0:a[t==null?void 0:t.id])??""}function Y(e){return e!=null&&e!==""}function fe(e,t){return((e==null?void 0:e.questions)||[]).slice(0,70).filter(s=>Number(s.stage||1)===Number(t))}function ye(e,t,s=(e==null?void 0:e.answers)||{}){return fe(e,t).filter(n=>{var a;return!Y(((a=s[n.id])==null?void 0:a.value)??s[n.id])})}function _e(){var e,t;return!!((o.applications||[]).length||(((e=o.candidate)==null?void 0:e.pipelineCodes)||[]).length||(t=o.candidate)!=null&&t.pipelineCode)}function qt(){var n,a,i;const e=((n=o.candidate)==null?void 0:n.department)||"Bogotá D.C.",t=_[e]||_["Bogotá D.C."]||["Bogotá"],s=((a=o.candidate)==null?void 0:a.city)||((i=o.candidate)==null?void 0:i.locationCity)||t[0];return{department:e,city:s,label:`${s}, ${e}`}}async function jt(){try{const e=await fetch("/api/locations?ts="+Date.now(),{cache:"no-store"}),t=await e.json();if(!e.ok||!t.ok||!t.departments)throw new Error(t.error||"Location API unavailable");_=t.departments}catch(e){console.warn("Using bundled Colombia locations:",e.message||e),_=Be}}function Ft(){var t,s,n;const e=((t=o.candidate)==null?void 0:t.targetRole)||((s=o.candidate)==null?void 0:s.headline)||"";return((n=Object.entries(ee).find(([,a])=>a.includes(e)))==null?void 0:n[0])||Object.keys(ee)[0]}function Bt(e){return Object.keys(ee).map(t=>`<option value="${$(t)}" ${t===e?"selected":""}>${t}</option>`).join("")}function He(e,t){const s=ee[e]||Object.values(ee).flat();return['<option value="">Choose the closest role</option>'].concat(s.map(n=>`<option value="${$(n)}" ${t===n?"selected":""}>${n}</option>`)).join("")}function Qt(e){return Object.entries(Et).map(([t,s])=>`
    <fieldset class="skill-group">
      <legend>${$(t)}</legend>
      <div class="skill-picker">
        ${s.map(n=>`
          <label class="skill-choice">
            <input type="checkbox" name="skills" value="${$(n)}" ${e.includes(n)?"checked":""} />
            <span>${$(n)}</span>
          </label>
        `).join("")}
      </div>
    </fieldset>
  `).join("")+`
    <fieldset class="skill-group">
      <legend>Other</legend>
      <label>Other skills
        <input name="otherSkills" value="${$(Ot())}" placeholder="Type extra skills, separated by commas" />
      </label>
    </fieldset>
  `}function ve(e,t="USD"){const s=Number(String(e||"").replace(/[^\d.]/g,"")),n=String(t||"USD").toUpperCase()==="COP"?"COP":"USD";if(!Number.isFinite(s)||s<=0)return{salary:"",salaryUSD:null,salaryCurrency:n,salaryAmount:null};const a=Math.round(s);return{salary:`${n} ${new Intl.NumberFormat("en-US").format(a)}/mo`,salaryUSD:n==="USD"?a:null,salaryCurrency:n,salaryAmount:a}}function We(e){return Array.isArray(e)?e:String(e||"").split(",").map(t=>t.trim()).filter(Boolean)}function J(e){const t=We(e.skills||e.requiredSkills);return{id:e.id||e.code,code:e.code||e.id,title:e.title||e.role||e.openingTitle||"Open role",orgName:e.orgName||e.company||e.clientName||"Nearwork client",location:e.location||"Remote",compensation:e.compensation||e.salary||e.rate||"Competitive",match:e.match||82,skills:t,description:e.description||e.about||"Nearwork is reviewing candidates for this role now."}}function V(e){const t=(e==null?void 0:e.code)||"";return t.includes("operation-not-allowed")?"This sign-in method is not available yet.":t.includes("unauthorized-domain")?"This website still needs to be approved for sign-in.":t.includes("permission-denied")?"We could not save this yet. Please try again in a moment or contact Nearwork support.":t.includes("weak-password")?"Password must be at least 6 characters.":t.includes("invalid-credential")||t.includes("wrong-password")?"That email/password did not match. If this account was created with Google, use Continue with Google.":t.includes("user-not-found")?"No account exists for that email yet.":t.includes("email-already-in-use")?"That email already has an account. Sign in or use Google.":t.includes("popup")?"The Google sign-in popup was closed before finishing.":"Something went wrong. Please try again or contact Nearwork support."}function Gt(e){Ce.innerHTML=`
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
  `,Ge()}function Ye(e="login"){var s;const t=e==="signup";Gt(`
    <section class="auth-panel">
      <div class="right-brand">Near<span>work</span></div>
      <div class="candidate-chip">For candidates</div>
      <div class="panel-heading">
        <h2>${t?"Create your account.":"Welcome back."}</h2>
        <p>${t?"Create your profile, browse roles, and track your application.":"Use Google if your candidate account was created with Google."}</p>
      </div>
      ${o.message?`<div class="notice">${k("lock")} ${$(o.message)}</div>`:""}
      ${X?"":`<div class="notice">${k("triangle-alert")} Sign-in is still being set up.</div>`}
      <button id="googleSignIn" class="social-action" type="button">
        <span class="google-dot">G</span>
        Continue with Google
      </button>
      <div class="divider"><span></span>or use email<span></span></div>
      <form id="authForm" class="stacked-form">
        ${t?'<label>Full name<input name="name" type="text" autocomplete="name" placeholder="Byron Giraldo" required /></label>':""}
        <label>Email<input name="email" type="email" autocomplete="email" placeholder="you@example.com" required /></label>
        <label>Password<input name="password" type="password" autocomplete="${t?"new-password":"current-password"}" minlength="6" placeholder="••••••••" required /></label>
        <button class="primary-action" type="submit">${k(t?"user-plus":"log-in")} ${t?"Create account":"Sign in"}</button>
        <p id="formMessage" class="form-message" role="status"></p>
      </form>
      ${t?"":'<button id="resetPassword" class="text-action small" type="button">Forgot password?</button>'}
      <button id="toggleMode" class="text-action" type="button">${t?"Already have an account? Sign in":"New or invited by Nearwork? Create your profile"}</button>
    </section>
  `),document.querySelector("#toggleMode").addEventListener("click",()=>Ye(t?"login":"signup")),document.querySelector("#googleSignIn").addEventListener("click",async()=>{const n=document.querySelector("#formMessage");n.textContent="";try{await bt()}catch(a){n.textContent=V(a)}}),(s=document.querySelector("#resetPassword"))==null||s.addEventListener("click",async()=>{const n=document.querySelector("input[name='email']").value.trim().toLowerCase(),a=document.querySelector("#formMessage");if(!n){a.textContent="Enter your email first, then request a reset link.";return}try{await ct(z,n),a.textContent=`Password reset sent to ${n}.`}catch(i){a.textContent=V(i)}}),document.querySelector("#authForm").addEventListener("submit",async n=>{n.preventDefault();const a=new FormData(n.currentTarget),i=document.querySelector("#formMessage"),c=String(a.get("email")).trim().toLowerCase();i.textContent="";try{if(t){const d=await dt(z,c,a.get("password"));await ut(d.user,{displayName:a.get("name")}),sessionStorage.setItem("nw_new_account","1"),await be(d.user.uid,{name:a.get("name"),email:c,availability:"open",headline:"Nearwork candidate",onboarded:!1})}else await pt(z,c,a.get("password"))}catch(d){i.textContent=V(d)}})}async function Je(e){v({loading:!0,user:e});try{await jt();const[t,s,n]=await Promise.allSettled([je(e),St(e.uid),Fe()]),a=t.status==="fulfilled"?t.value:null,i=s.status==="fulfilled"?s.value:[],c=n.status==="fulfilled"?n.value:oe;let d=[];try{d=await Ct(e.uid,e.email,(a==null?void 0:a.candidateCode)||(a==null?void 0:a.code)||"")}catch(l){console.warn(l)}const g=G();if(g&&!d.some(l=>l.id===g)){const l=await $t(g,e.uid,e.email,(a==null?void 0:a.candidateCode)||(a==null?void 0:a.code)||"").catch(()=>null);l&&(d=[l,...d])}const h=sessionStorage.getItem("nw_new_account")==="1";h&&sessionStorage.removeItem("nw_new_account");const y=h&&(a==null?void 0:a.onboarded)!==!0?"onboarding":le();v({candidate:{...a||{},name:(a==null?void 0:a.name)||e.displayName||"Talent member",email:(a==null?void 0:a.email)||e.email,availability:(a==null?void 0:a.availability)||"open",headline:(a==null?void 0:a.headline)||(a==null?void 0:a.targetRole)||"Nearwork candidate"},applications:i,assessments:d,jobs:c.length?c.map(J):oe,loading:!1,view:"dashboard",activePage:y,message:""})}catch(t){console.warn(t),v({candidate:{name:e.displayName||"Talent member",email:e.email,availability:"open",headline:"Nearwork candidate"},applications:[],assessments:[],jobs:oe,loading:!1,view:"dashboard",activePage:le(),message:""})}}async function re(){const e=le();if(e==="assessment"){sessionStorage.setItem("nw_restore_path",window.location.pathname),v({user:null,candidate:null,applications:[],assessments:[],jobs:[],loading:!1,view:"login",activePage:"overview",message:"Please log in to open your assessment."});return}if(e==="overview"){v({user:null,candidate:null,loading:!1,view:"login",activePage:"overview"});return}let t=oe;try{const s=await Fe();s.length&&(t=s.map(J))}catch(s){console.warn(s)}v({user:null,candidate:{name:"Guest candidate",availability:"open",headline:"Preview mode"},applications:[],assessments:[],jobs:t,loading:!1,view:"dashboard",activePage:e,message:"Preview mode. Sign in with Google to save your profile, apply, upload CVs, or track your actual pipeline."})}function Vt(){var e,t,s,n;Ce.innerHTML=`
    <main class="dashboard">
      <aside class="sidebar">
        <div class="brand-top"><span class="wordmark">Near<span>work</span></span></div>
        <div class="candidate-card">
          ${ze()}
          <strong>${((e=o.candidate)==null?void 0:e.name)||((t=o.user)==null?void 0:t.displayName)||"Talent member"}</strong>
          <span>${((s=o.candidate)==null?void 0:s.headline)||((n=o.candidate)==null?void 0:n.targetRole)||"Nearwork candidate"}</span>
        </div>
        <nav>
          ${$e().map(([a,i,c])=>`
            <button class="${o.activePage===a?"active":""}" data-page="${a}">${k(i)} ${c}</button>
          `).join("")}
        </nav>
        <button id="${o.user?"signOut":"signIn"}" class="ghost-action">${k(o.user?"log-out":"log-in")} ${o.user?"Sign out":"Sign in"}</button>
      </aside>
      <section class="workspace">
        <header class="topbar">
          <div><p class="eyebrow">Candidate workspace</p><h1>${Ht()}</h1></div>
          <label class="availability">Availability
            <select id="availability">
              ${["open","interviewing","paused"].map(a=>{var i;return`<option value="${a}" ${((i=o.candidate)==null?void 0:i.availability)===a?"selected":""}>${a}</option>`}).join("")}
            </select>
          </label>
        </header>
        ${o.message?`<div class="notice">${o.message}</div>`:""}
        ${Wt()}
      </section>
    </main>
  `,Ge(),fa(),_t(),zt()}let ne=null;function zt(){ne&&window.clearInterval(ne);const e=document.querySelector("#assessmentTimer");if(!e)return;const t=new Date(e.dataset.end||"").getTime(),s=()=>{const n=Math.max(0,t-Date.now()),a=Math.floor(n/1e3),i=Math.floor(a/60),c=String(a%60).padStart(2,"0");e.textContent=`${i}:${c}`,e.classList.toggle("is-low",n<=10*60*1e3),n<=0&&window.clearInterval(ne)};s(),ne=window.setInterval(s,1e3)}function _t(){if(o.activePage!=="assessment")return;const e=o.assessments||[],t=G(),n=(t?e.find(i=>i.id===t):null)||e.find(i=>["sent","started"].includes(String(i.status||"").toLowerCase()));if(!(n!=null&&n.id))return;const a=String(n.status||"").toLowerCase();if(a==="started"&&Qe()===null){Z(n.id,Number(n.currentQuestionIndex||0),!0);return}if(!t&&a==="sent"){const i=`/assessment/${encodeURIComponent(n.id)}/start`;window.history.replaceState({page:"assessment",assessmentId:n.id},"",i)}}function Ht(){return{onboarding:"Complete your candidate profile",overview:`Hi ${Ve()}, here's your process`,matches:"Role matches",applications:"Application pipeline",assessment:"Assessment center",cvs:"CV picker",tips:"Interview tips",recruiter:"Your recruiter",profile:"Candidate profile"}[o.activePage]||"Talent"}function Wt(){return({onboarding:Yt,overview:Le,matches:Jt,applications:Kt,assessment:Zt,cvs:ca,tips:da,recruiter:ua,profile:pa}[o.activePage]||Le)()}function Le(){var n;const e=Ut(),t=_e(),s=o.jobs.length;return`
    ${e?"":`
      <section class="hero-card">
        <div><p class="eyebrow">Action needed</p><h2>Finish your profile to unlock matches.</h2><p>Add your role, city, salary, and skills so Nearwork can match you to the right openings.</p></div>
        <button class="primary-action fit" data-page="profile">${k("arrow-right")} Complete profile</button>
      </section>
    `}
    <section class="summary-grid">
      ${ie("Profile readiness",`${Ne()}%`,"sparkles")}
      ${ie("Open roles",s,"briefcase-business")}
      ${ie("Applications",o.applications.length,"send")}
      ${ie("CVs saved",(((n=o.candidate)==null?void 0:n.cvLibrary)||[]).length,"files")}
    </section>
    <section class="content-grid">
      <div class="section-block"><div class="section-heading"><div><p class="eyebrow">Now</p><h2>${t?"Talent pipeline":"Find your next opening"}</h2></div></div>${t?Xe(Ze()):et()}</div>
      <div class="section-block compact"><div class="section-heading"><div><p class="eyebrow">Recruiter</p><h2>Need help?</h2></div></div>${tt()}</div>
    </section>
  `}function Yt(){return`
    <section class="onboarding-hero">
      <div>
        <p class="eyebrow">New candidate setup</p>
        <h2>Tell Nearwork what role, city, salary, and skills fit you best.</h2>
        <p>This only appears as a first-run setup. After you submit it, you will land in the Talent workspace.</p>
      </div>
    </section>
    ${Ke("onboarding")}
  `}function Jt(){var d,g,h;const e=((d=o.candidate)==null?void 0:d.targetRole)||(ke((g=o.candidate)==null?void 0:g.headline)?"":(h=o.candidate)==null?void 0:h.headline),t=de(),s=t.map(y=>y.toLowerCase()),n=o.jobs.map(J).filter(y=>{const l=e.toLowerCase().split(/[^a-z0-9]+/).filter(m=>m.length>2),r=[y.title,y.description,y.skills.join(" ")].join(" ").toLowerCase(),u=l.length?l.some(m=>r.includes(m)):!1,p=s.length?s.some(m=>r.includes(m)):!1;return u||p}),a=!!(e||t.length),i=o.matchesFiltered&&a?n:o.jobs.map(J),c=o.matchesFiltered&&!n.length;return`
    <section class="section-block">
      <div class="section-heading">
        <div><p class="eyebrow">Openings</p><h2>${o.matchesFiltered?"Best fit from your profile":"All current openings"}</h2></div>
        <button id="filterMatches" class="secondary-action" type="button">${k(o.matchesFiltered?"list":"filter")} ${o.matchesFiltered?"Show all openings":"Filter by my role & skills"}</button>
      </div>
      <div class="match-note"><strong>${i.length}</strong> of <strong>${o.jobs.length}</strong> openings showing. Role: <strong>${e||"not set"}</strong>. Skills: <strong>${t.join(", ")||"not set"}</strong>.</div>
      <div class="job-list">${c?K("No filtered matches yet","Add a target role and skills in Profile to improve matching."):i.map(y=>ma(y)).join("")}</div>
    </section>
  `}function Kt(){return`
    <section class="section-block">
      <div class="section-heading"><div><p class="eyebrow">Pipeline</p><h2>Your applications</h2></div></div>
      ${_e()?Xe(Ze()):et()}
      <div class="timeline page-gap">${o.applications.length?o.applications.map(ga).join(""):K("No applications yet","Apply to a role and your process will show here.")}</div>
    </section>
  `}function Zt(){const e=G(),t=o.assessments||[],s=t.filter(i=>["sent","started"].includes(String(i.status||"").toLowerCase())),n=t.filter(i=>String(i.status||"").toLowerCase()==="completed"),a=e?t.find(i=>i.id===e):s[0]||n[0]||null;if(e&&!a)return`
      <section class="assessment-hero">
        <div><p class="eyebrow">Assessment</p><h2>No assessment available for this link.</h2><p>Make sure you are logged into the same account that received the assessment email. If this keeps happening, contact Nearwork support.</p></div>
        <button class="primary-action fit" data-page="recruiter" type="button">${k("message-circle")} Contact support</button>
      </section>
    `;if(a){const i=Array.isArray(a.questions)?a.questions:[],c=String(a.status||"").toLowerCase()==="started",d=String(a.status||"").toLowerCase()==="completed",g=String(a.status||"").toLowerCase()==="cancelled",h=sa(a),y=Qe(),l=Number(a.currentQuestionIndex||0),r=Math.min(y??l,Math.max(i.length-1,0)),u=i[r],p=(u==null?void 0:u.stage)||a.currentStage||1;return`
      <section class="assessment-hero">
        <div>
          <p class="eyebrow">Nearwork assessment</p>
          <h2>${$(a.role||"Role assessment")}</h2>
          <p>${d?"This assessment has been submitted.":g?"This assessment was cancelled by Nearwork. If a new one is assigned, it will appear here automatically.":h?"This assessment link has expired.":"This assessment has 2 stages. Stage 1 is technical, Stage 2 is DISC. You must be logged in to complete it."}</p>
        </div>
        <button class="primary-action fit" id="startAssessment" type="button" ${d||g||h?"disabled":""}>${k(c?"play":"clipboard-check")} ${c?"Continue assessment":"Start assessment"}</button>
      </section>
      ${c&&!d&&!g&&!h?ea(a,p):""}
      ${c&&!d&&!g&&!h?Xt(a,r):""}
      <section class="info-grid">
        ${W("Technical Assessment","50 technical single-choice questions. 60 minutes.")}
        ${W("DISC Assessment","20 work-style single-choice questions. 30 minutes.")}
        ${W("24-hour link",`Expires ${Ae(a.expiresAt||a.deadline)}.`)}
      </section>
      <section class="section-block page-gap" id="assessmentWorkspace">
        <div class="section-heading"><div><p class="eyebrow">${d?"Submitted":ae(p)}</p><h2>${d?"Assessment received":`${r+1} of ${i.length||70}`}</h2></div></div>
        ${d?na():g?K("Assessment cancelled","This assessment is no longer available. A new assigned assessment will appear here when your recruiter sends it."):h?K("Assessment expired","This unique assessment link is no longer available. Contact Nearwork if you need help."):ta(a,c,r)}
      </section>
      ${ia(t,a.id)}
    `}return`
    <section class="assessment-hero">
      <div><p class="eyebrow">Assessment</p><h2>Complete role-specific questions when Nearwork assigns them.</h2><p>Your assessment will include English, work simulation, and role-specific scenarios. Results are reviewed by the Nearwork recruiting team.</p></div>
      <button class="primary-action fit" type="button" disabled>${k("lock")} Not assigned yet</button>
    </section>
    <section class="info-grid">${W("One attempt","Retakes are only opened by your recruiter when needed.")}${W("Timed work","Most role assessments take 45-90 minutes.")}${W("Recruiter review","You will get next steps or respectful feedback after review.")}</section>
  `}function Xt(e,t){const s=(e.questions||[]).slice(0,70),n=fe(e,1).filter(i=>Y(me(e,i))).length,a=fe(e,2).filter(i=>Y(me(e,i))).length;return`
    <section class="assessment-progress-panel">
      <div><strong>Technical Assessment</strong><span>${n}/50 answered</span></div>
      <div><strong>DISC Assessment</strong><span>${a}/20 answered</span></div>
      <div class="assessment-progress-strip">
        ${s.map((i,c)=>{const d=Y(me(e,i));return`<button type="button" class="${c===t?"active":""} ${d?"answered":""}" data-assessment-jump="${c}" title="${ae(i.stage)} question ${c+1}">${c+1}</button>`}).join("")}
      </div>
    </section>
  `}function ea(e,t){const s=Number(t),n=Ee(e.technicalStartedAt||e.startedAt)||new Date,a=Ee(e.discStartedAt)||new Date,i=s===1?n:a,c=Number(s===1?e.technicalMinutes||60:e.discMinutes||30),d=new Date(i.getTime()+c*60*1e3);return`
    <section class="assessment-timer-bar">
      <div>
        <span>${ae(s)} timer</span>
        <strong id="assessmentTimer" data-end="${d.toISOString()}">${c}:00</strong>
      </div>
      <p>${s===1?"Technical section: 60 minutes. DISC follows after Stage 1.":"DISC section: 30 minutes. Submit when you finish."}</p>
    </section>
  `}function ta(e,t,s=null){var m,S,N,I;if(!t)return`
      <div class="assessment-preview">
        <div>
          ${k("timer")}
          <strong>Before you start</strong>
          <p>Choose a quiet room, close extra tabs, keep your phone away unless needed for login, and make sure your internet connection is stable. The timer starts when you begin.</p>
        </div>
        <ul>
          <li>Technical Assessment: 50 single-choice questions.</li>
          <li>DISC Assessment: 20 work-style single-choice questions.</li>
          <li>Your progress saves after every answer, and refresh will return to the current question.</li>
        </ul>
      </div>
    `;const n=(e.questions||[]).slice(0,70),a=Math.min(s??Number(e.currentQuestionIndex||0),Math.max(n.length-1,0)),i=n[a],c=((S=(m=e.answers)==null?void 0:m[i.id])==null?void 0:S.value)??((N=e.answers)==null?void 0:N[i.id])??"",d=Array.isArray(i.options)&&i.options.length?i.options:["Strongly agree","Agree","Neutral","Disagree"],g=(I=n[a+1])==null?void 0:I.stage,h=g&&g!==i.stage,y=ye(e,i.stage),l=h&&y.length,u=a+1>=n.length?ye(e,i.stage):[],p=i.multiple?"Multiple choice":"Single choice";return`
    <form id="assessmentQuestionForm" class="assessment-question-card" data-current-index="${a}">
      <div class="assessment-question-meta">
        <span>${$(i.part||i.type)}</span>
        <span>${$(i.bank||"")}</span>
        <span>${p}</span>
      </div>
      ${Number(i.stage||1)===2&&a===n.findIndex(C=>Number(C.stage||1)===2)?'<div class="assessment-stage-divider"><strong>DISC Assessment</strong><span>You finished the Technical Assessment. Continue with the work-style section.</span></div>':""}
      <div class="question-prompt">${$(i.q||"")}</div>
      <fieldset class="assessment-options">
        <legend>${p}</legend>
          ${d.map((C,f)=>`
            <label class="assessment-option">
              <input type="radio" name="answer" value="${f}" ${String(c)===String(f)?"checked":""} />
              <b>${String.fromCharCode(65+f)}</b>
              <span>${$(C)}</span>
            </label>
          `).join("")}
      </fieldset>
      ${l||u.length?aa(e,l?y:u,i.stage):""}
      <p class="field-hint">${h?"After this answer, you will finish the Technical Assessment and enter the DISC Assessment.":"Your progress saves after every question. If you refresh, you will return here."}</p>
      <div class="job-footer">
        <button class="ghost-action" id="prevAssessmentQuestion" type="button" ${a===0?"disabled":""}>${k("arrow-left")} Previous</button>
        <button class="primary-action fit" type="submit">${a+1>=n.length?"Submit assessment":"Next"}</button>
      </div>
    </form>
  `}function aa(e,t,s){if(!t.length)return"";const n=(e.questions||[]).slice(0,70);return`
    <div class="missed-question-prompt">
      <strong>You still have unanswered questions in the ${ae(s)}.</strong>
      <p>You missed ${t.map(a=>`Question ${n.findIndex(i=>i.id===a.id)+1}`).join(", ")}. You can go back now or continue if you meant to leave them unanswered.</p>
      <div>${t.map(a=>{const i=n.findIndex(c=>c.id===a.id);return`<button class="ghost-action" type="button" data-assessment-jump="${i}">Go to ${i+1}</button>`}).join("")}</div>
    </div>
  `}function sa(e){return!(e!=null&&e.expiresAt)||String(e.status||"").toLowerCase()==="completed"?!1:Date.now()>new Date(e.expiresAt).getTime()}function na(e){return`
    ${K("Thank you for completing your assessment","This has been shared successfully with the Nearwork team. We will review it and reach out with next steps.")}
  `}function ia(e,t){return e.length?`
    <section class="section-block page-gap">
      <div class="section-heading"><div><p class="eyebrow">Assessment center</p><h2>Your assessment history</h2></div></div>
      <div class="assessment-history-list">
        ${e.map(s=>`
          <article class="assessment-history-row ${s.id===t?"active":""}">
            <div><strong>${$(s.role||"Nearwork assessment")}</strong><span>${$(s.id||"")}</span></div>
            <div>${$(String(s.status||"assigned"))}</div>
            <a href="/assessment/${encodeURIComponent(s.id)}/start">${s.status==="completed"?"View":"Continue"}</a>
          </article>
        `).join("")}
      </div>
    </section>
  `:""}function oa(e,t){const s=e.questions||[],n=s.filter(d=>d.stage===1),a=s.filter(d=>d.stage===2),i=n.filter(d=>{var g;return typeof d.correctIndex=="number"&&Number((g=t[d.id])==null?void 0:g.value)===d.correctIndex}).length,c=a.filter(d=>{var g;return Y(((g=t[d.id])==null?void 0:g.value)??t[d.id])}).length;return{technicalScore:n.length?Math.round(i/n.length*100):0,discScore:a.length?Math.round(c/a.length*100):0}}function ra(e,t){var d,g;const s={Dominance:0,Influence:0,Steadiness:0,Conscientiousness:0};(e.questions||[]).filter(h=>Number(h.stage)===2).forEach(h=>{var u;const y=(u=t[h.id])==null?void 0:u.value;if(!Y(y))return;const l=s[h.skill]!==void 0?h.skill:"Steadiness",r=Math.max(1,4-Number(y||0));s[l]+=r});const n=Object.entries(s).sort((h,y)=>y[1]-h[1]),a=((d=n[0])==null?void 0:d[0])||"Steadiness",i=((g=n[n.length-1])==null?void 0:g[0])||"Dominance";return{label:{Dominance:"D",Influence:"I",Steadiness:"S",Conscientiousness:"C"}[a]||"S",high:a,low:i,scores:s,summary:`${a} is the strongest observed DISC tendency; ${i} appears lowest based on this assessment.`}}async function la(e,t){var g,h,y,l,r;const s="https://admin.nearwork.co/api/send-email",n=e.candidateEmail||((g=o.user)==null?void 0:g.email)||((h=o.candidate)==null?void 0:h.email),a=e.candidateName||((y=o.candidate)==null?void 0:y.name)||((l=o.user)==null?void 0:l.displayName)||"there",i=We([e.recruiterEmail,e.stakeholderEmail,e.hiringManagerEmail].filter(Boolean).join(",")),c=[];n&&c.push(fetch(s,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({to:n,templateId:"assessment_completed_candidate",data:{name:a,role:e.role,actionUrl:"https://talent.nearwork.co/assessment",actionText:"Open assessment center"}})}));const d=i.length?i:["support@nearwork.co"];c.push(fetch(s,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({to:d,templateId:"assessment_completed_recruiter",data:{name:"Nearwork team",role:e.role,actionUrl:`https://admin.nearwork.co/assessments/${e.id}/questions`,actionText:"Review assessment",message:`${a} completed the assessment. Overall: ${t.score}%. Technical: ${t.technicalScore}%. DISC: ${((r=t.discProfile)==null?void 0:r.label)||"Submitted"}.`}})})),await Promise.allSettled(c)}function ca(){var t;const e=((t=o.candidate)==null?void 0:t.cvLibrary)||[];return`
    <section class="section-block">
      <div class="section-heading"><div><p class="eyebrow">CV picker</p><h2>Store multiple resumes</h2></div></div>
      <form id="cvForm" class="upload-box">
        ${k("upload-cloud")}<strong>Upload a CV for this role</strong><p>Save multiple versions and pick the best one for each opening.</p>
        <input name="cv" type="file" accept=".pdf,.doc,.docx" required />
        <input name="label" type="text" placeholder="CV label, e.g. CSM resume" />
        <button class="primary-action fit" type="submit">Upload CV</button>
      </form>
      <div class="cv-list">
        ${e.length?e.map(s=>`<article class="cv-item">${k("file-text")}<div><strong>${s.name||s.fileName}</strong><span>${Ae(s.uploadedAt)}</span></div>${s.url?`<a href="${s.url}" target="_blank" rel="noreferrer">Open</a>`:""}</article>`).join(""):K("No CVs saved yet","Upload role-specific resumes here.")}
      </div>
    </section>
  `}function da(){return`
    <section class="tips-hero"><div><p class="eyebrow">Candidate guide</p><h2>Practical prep for US SaaS interviews.</h2><p>Short, useful guidance candidates can read before recruiter screens, assessments, and client interviews.</p></div></section>
    <section class="tips-grid rich">
      ${Lt.map((e,t)=>`
        <article class="tip-card">
          <div class="tip-number">${String(t+1).padStart(2,"0")}</div>
          <span>${e.tag}</span>
          <h3>${e.title}</h3>
          <p>${e.body}</p>
          <div class="tip-actions">${e.actions.map(s=>`<small>${s}</small>`).join("")}</div>
          <strong>${e.read} read</strong>
        </article>
      `).join("")}
    </section>
  `}function ua(){var s,n;const t=(((s=o.candidate)==null?void 0:s.recruiter)||{}).bookingUrl||((n=o.candidate)==null?void 0:n.recruiterBookingUrl)||"mailto:support@nearwork.co?subject=Nearwork%20candidate%20question";return`
    <section class="content-grid">
      <div class="section-block"><div class="section-heading"><div><p class="eyebrow">Recruiter</p><h2>Your Nearwork contact</h2></div></div>${tt(!0)}</div>
      <div class="section-block compact"><div class="section-heading"><div><p class="eyebrow">Booking</p><h2>Schedule soon</h2></div></div><p class="muted">Ask the Nearwork recruiting team for the earliest available slot. Candidate booking links can be attached to this profile later.</p><a class="primary-action fit" href="${t}" target="_blank" rel="noreferrer">${k("calendar-plus")} Book recruiter call</a></div>
    </section>
  `}function pa(){return Ke("profile")}function Ke(e="profile"){var g,h,y,l,r,u,p,m,S,N,I,C;const t=de(),s=qt(),n=_[s.department]||[],a=((g=o.candidate)==null?void 0:g.salaryCurrency)||"USD",i=ve(((h=o.candidate)==null?void 0:h.salaryAmount)||((y=o.candidate)==null?void 0:y.salary)||((l=o.candidate)==null?void 0:l.salaryUSD),a),c=Ft(),d=((r=o.candidate)==null?void 0:r.targetRole)||((u=o.candidate)==null?void 0:u.headline)||"";return`
    <section class="section-block">
      <div class="section-heading"><div><p class="eyebrow">${e==="onboarding"?"Setup":"Profile"}</p><h2>${e==="onboarding"?"Complete your account":"Improve your match quality"}</h2></div><span class="profile-score">${Ne()}%</span></div>
      <form id="profileForm" class="profile-form">
        <div class="profile-card profile-identity wide">
          ${ze("large")}
          <label>Profile photo <span class="optional-label">optional</span>
            <input name="photo" type="file" accept="image/png,image/jpeg,image/webp" />
          </label>
        </div>
        <label class="wide">Full name<input name="name" value="${$(((p=o.candidate)==null?void 0:p.name)||((m=o.user)==null?void 0:m.displayName)||"")}" /></label>
        <div class="profile-card wide">
          <div class="field-label">Role applying for</div>
          <div class="profile-card-grid">
            <label>Area
              <select name="roleGroup" id="roleGroupSelect">
                ${Bt(c)}
              </select>
            </label>
            <label>Role
              <select name="targetRole" id="targetRoleSelect">
                ${He(c,d)}
              </select>
            </label>
          </div>
        </div>
        <div class="profile-card wide">
          <div class="field-label">Location</div>
          <div class="profile-card-grid">
            <label>Department
              <select name="department" id="departmentSelect">
                ${Object.keys(_).map(f=>`<option value="${$(f)}" ${f===s.department?"selected":""}>${f}</option>`).join("")}
              </select>
            </label>
            <label>City
              <select name="city" id="citySelect">
                ${n.map(f=>`<option value="${$(f)}" ${f===s.city?"selected":""}>${f}</option>`).join("")}
              </select>
            </label>
          </div>
        </div>
        <div class="profile-card wide">
          <div class="field-label">Compensation and English</div>
          <div class="profile-card-grid">
            <label>Target monthly salary
              <div class="salary-field"><select id="salaryCurrencyInput" name="salaryCurrency"><option value="USD" ${i.salaryCurrency==="USD"?"selected":""}>USD</option><option value="COP" ${i.salaryCurrency==="COP"?"selected":""}>COP</option></select><input id="salaryInput" name="salary" value="${$(i.salary||"")}" inputmode="numeric" placeholder="1000" /></div>
            </label>
            <label>English level<select name="english">${["","B1","B2","C1","C2","Native"].map(f=>{var E;return`<option value="${f}" ${((E=o.candidate)==null?void 0:E.english)===f?"selected":""}>${f||"Select level"}</option>`}).join("")}</select></label>
          </div>
        </div>
        <div class="profile-card wide">
          <div class="field-label">Contact</div>
          <div class="profile-card-grid">
            <label>WhatsApp number
              <input name="whatsapp" value="${$(((S=o.candidate)==null?void 0:S.whatsapp)||((N=o.candidate)==null?void 0:N.phone)||"")}" inputmode="tel" autocomplete="tel" placeholder="+57 300 123 4567" required />
            </label>
            <label>LinkedIn <span class="optional-label">optional</span>
              <input name="linkedin" value="${$(((I=o.candidate)==null?void 0:I.linkedin)||"")}" placeholder="https://linkedin.com/in/..." />
            </label>
          </div>
        </div>
        <div class="profile-card wide">
          <div class="field-label">Skills</div>
          <p class="field-hint">Tap the skills that best match your experience.</p>
          ${Qt(t)}
        </div>
        <div class="profile-card wide">
          <div class="field-label">CV</div>
          <p class="field-hint">Upload the CV you want Nearwork to use for your applications.</p>
          <input name="profileCv" type="file" accept=".pdf,.doc,.docx" />
          <input name="profileCvLabel" type="text" placeholder="CV label, e.g. Customer Success CV" />
        </div>
        <label class="wide">Summary <span class="optional-label">optional</span><textarea name="summary" placeholder="Add a short note about what you do best.">${((C=o.candidate)==null?void 0:C.summary)||""}</textarea></label>
        <input type="hidden" name="mode" value="${e}" />
        <button class="primary-action fit" type="submit">${k("save")} ${e==="onboarding"?"Finish setup":"Save profile"}</button>
      </form>
    </section>
  `}function Ne(){const e=["name","targetRole","department","city","english","salary","whatsapp"],t=e.filter(s=>{var n,a,i,c;return s==="targetRole"?!!((n=o.candidate)!=null&&n.targetRole||!ke((a=o.candidate)==null?void 0:a.headline)&&((i=o.candidate)!=null&&i.headline)):!!((c=o.candidate)!=null&&c[s])}).length+(de().length?1:0);return Math.max(25,Math.round(t/(e.length+1)*100))}function Ze(){const e=o.applications[0];return(e==null?void 0:e.stage)||(e==null?void 0:e.status)||"profile"}function Xe(e){const t=Math.max(0,Te.findIndex(s=>e==null?void 0:e.toLowerCase().includes(s.key)));return`<div class="pipeline">${Te.map((s,n)=>`<article class="${n<=t?"done":""} ${n===t?"current":""}"><span>${n+1}</span><strong>${s.label}</strong><p>${s.help}</p></article>`).join("")}</div>`}function et(){return`
    <div class="empty-state">
      ${k("briefcase-business")}
      <strong>No active pipeline yet</strong>
      <p>Browse current openings and apply when you find a role that fits. Nearwork will show a pipeline here after an application moves forward.</p>
      <div class="empty-actions">
        <button class="primary-action fit" type="button" data-page="matches">${k("sparkles")} View matches</button>
        <a class="secondary-action" href="https://jobs.nearwork.co" target="_blank" rel="noreferrer">${k("external-link")} Open jobs</a>
      </div>
    </div>
  `}function ie(e,t,s){return`<article class="metric"><span>${k(s)}</span><p>${e}</p><strong>${t}</strong></article>`}function ma(e){const t=J(e),s=new Set(o.applications.map(n=>n.jobId||n.openingCode)).has(t.code);return`
    <article class="job-card">
      <div><div class="match-pill">${t.match}% match</div><h3>${t.title}</h3><p>${t.orgName} · ${t.location}</p></div>
      <p class="job-description">${t.description}</p>
      <div class="skill-row">${t.skills.slice(0,4).map(n=>`<span>${n}</span>`).join("")}</div>
      <div class="job-footer"><strong>${t.compensation}</strong><button class="secondary-action" type="button" data-apply="${t.code}" ${s?"disabled":""}>${s?"Applied":"Apply"}</button></div>
    </article>
  `}function ga(e){return`<article class="timeline-item"><span>${k("circle-dot")}</span><div><strong>${e.jobTitle||e.title||"Application"}</strong><p>${e.clientName||e.company||"Nearwork"} · ${e.status||"submitted"}</p><small>${Ae(e.updatedAt||e.createdAt)}</small></div></article>`}function W(e,t){return`<article class="info-card"><strong>${e}</strong><p>${t}</p></article>`}function tt(e=!1){var i;const t=((i=o.candidate)==null?void 0:i.recruiter)||{},s=t.email||"support@nearwork.co",n=t.whatsapp||Tt,a=t.whatsappUrl||xt;return`<article class="recruiter-card"><div class="avatar recruiter-avatar">NW</div><div><strong>${t.name||"Nearwork Support"}</strong><p><a href="mailto:${s}">${s}</a></p><p><a href="${a}" target="_blank" rel="noreferrer">WhatsApp ${n}</a></p>${e?"<span>Questions about assessments, interviews, feedback, or CV selection should go here.</span>":""}</div></article>`}function K(e,t){return`<div class="empty-state">${k("inbox")}<strong>${e}</strong><p>${t}</p></div>`}function ha(){Ce.innerHTML='<main class="loading-screen"><span class="logo-mark">N</span><p>Loading Talent...</p></main>'}function fa(){var e,t,s,n,a,i,c,d,g,h,y;(e=document.querySelector("#signOut"))==null||e.addEventListener("click",async()=>{await mt(z),window.history.pushState({page:"overview"},"","/"),v({user:null,candidate:null,applications:[],assessments:[],jobs:[],view:"login",activePage:"overview",message:""})}),(t=document.querySelector("#signIn"))==null||t.addEventListener("click",()=>{window.history.pushState({page:"overview"},"","/"),v({view:"login",activePage:"overview",message:""})}),document.querySelectorAll("[data-page]").forEach(l=>{l.addEventListener("click",()=>he(l.dataset.page))}),document.querySelectorAll("[data-assessment-jump]").forEach(l=>{l.addEventListener("click",async()=>{var N,I,C;const r=G()||((N=(o.assessments||[])[0])==null?void 0:N.id),u=(o.assessments||[]).find(f=>f.id===r),p=Number(l.dataset.assessmentJump||0),m=(I=u==null?void 0:u.questions)==null?void 0:I[p];if(!r||!m)return;await se(r,"__progress__","",{currentQuestionIndex:p,totalQuestions:((C=u==null?void 0:u.questions)==null?void 0:C.length)||70,currentStage:m.stage||1}),Z(r,p);const S=(o.assessments||[]).map(f=>f.id===r?{...f,currentQuestionIndex:p,currentStage:m.stage||1}:f);v({assessments:S,activePage:"assessment",message:""})})}),document.querySelector("#availability").addEventListener("change",async l=>{const r=l.target.value;v({candidate:{...o.candidate,availability:r}}),o.user&&X?await Pt(o.user.uid,r):v({message:"Sign in with Google to save availability."})}),(s=document.querySelector("#filterMatches"))==null||s.addEventListener("click",()=>{var r,u,p;const l=!!((r=o.candidate)!=null&&r.targetRole||!ke((u=o.candidate)==null?void 0:u.headline)&&((p=o.candidate)!=null&&p.headline)||de().length);v({matchesFiltered:l?!o.matchesFiltered:!1,message:l?"":"Add your role and skills in Profile first, then filter openings."})}),(n=document.querySelector("#departmentSelect"))==null||n.addEventListener("change",l=>{const r=document.querySelector("#citySelect"),u=_[l.target.value]||[];r.innerHTML=u.map(p=>`<option value="${$(p)}">${p}</option>`).join("")}),(a=document.querySelector("#roleGroupSelect"))==null||a.addEventListener("change",l=>{const r=document.querySelector("#targetRoleSelect");r.innerHTML=He(l.target.value,"")}),(i=document.querySelector("#salaryInput"))==null||i.addEventListener("blur",l=>{var u;const r=ve(l.target.value,((u=document.querySelector("#salaryCurrencyInput"))==null?void 0:u.value)||"USD");r.salary&&(l.target.value=r.salary)}),document.querySelectorAll("[data-apply]").forEach(l=>{l.addEventListener("click",async()=>{const r=o.jobs.map(J).find(u=>u.code===l.dataset.apply);l.disabled=!0,l.textContent="Submitted",o.user&&X?(await Nt(o.user.uid,r),await Je(o.user),he("applications")):v({message:"Sign in with Google to apply to this opening."})})}),(c=document.querySelector("#startAssessment"))==null||c.addEventListener("click",async()=>{var u;const l=G()||((u=(o.assessments||[])[0])==null?void 0:u.id),r=(o.assessments||[]).find(p=>p.id===l)||(o.assessments||[])[0];if(!l||!o.user){v({message:"Please log in to start your assessment."});return}try{await At(l,o.user.uid),Z(l,Number((r==null?void 0:r.currentQuestionIndex)||0),!0);const p=(o.assessments||[]).map(m=>m.id===l?{...m,status:"started",startedAt:m.startedAt||new Date().toISOString(),technicalStartedAt:m.technicalStartedAt||new Date().toISOString()}:m);v({assessments:p,activePage:"assessment",message:""})}catch(p){v({message:V(p)})}}),(d=document.querySelector("#prevAssessmentQuestion"))==null||d.addEventListener("click",async()=>{var N,I,C,f;const l=G()||((N=(o.assessments||[])[0])==null?void 0:N.id),r=(o.assessments||[]).find(E=>E.id===l),u=Number(((I=document.querySelector("#assessmentQuestionForm"))==null?void 0:I.dataset.currentIndex)??(r==null?void 0:r.currentQuestionIndex)??0),p=Math.max(0,u-1),m=(C=r==null?void 0:r.questions)==null?void 0:C[p];await se(l,"__progress__","",{currentQuestionIndex:p,totalQuestions:((f=r==null?void 0:r.questions)==null?void 0:f.length)||70,currentStage:(m==null?void 0:m.stage)||1}),Z(l,p);const S=(o.assessments||[]).map(E=>E.id===l?{...E,currentQuestionIndex:p,currentStage:(m==null?void 0:m.stage)||1}:E);v({assessments:S,activePage:"assessment",message:""})}),(g=document.querySelector("#assessmentQuestionForm"))==null||g.addEventListener("submit",async l=>{var U;l.preventDefault();const r=G()||((U=(o.assessments||[])[0])==null?void 0:U.id),u=(o.assessments||[]).find(A=>A.id===r),p=(u==null?void 0:u.questions)||[],m=Number(l.currentTarget.dataset.currentIndex??(u==null?void 0:u.currentQuestionIndex)??0),S=p[m],N=new FormData(l.currentTarget).get("answer");if(!S){v({message:"This question could not be loaded. Please refresh and try again."});return}const I=N===null?{value:"",skipped:!0,answeredAt:new Date().toISOString()}:{value:Number(N),skipped:!1,answeredAt:new Date().toISOString()},C={...u.answers||{},[S.id]:I},f=p[m+1],E=f&&Number(f.stage||1)!==Number(S.stage||1),H=ye(u,S.stage,C);try{if((E||m+1>=p.length)&&H.length){await se(r,S.id,C[S.id],{currentQuestionIndex:m,totalQuestions:p.length,currentStage:S.stage||1});const A=(o.assessments||[]).map(T=>T.id===r?{...T,answers:C,currentQuestionIndex:m,currentStage:S.stage||1,progress:`${m+1}/${p.length}`}:T);v({assessments:A,activePage:"assessment",message:`You missed ${H.length} question${H.length===1?"":"s"} in the ${ae(S.stage)}.`});return}if(m+1>=p.length){const A=oa(u,C),T=ra(u,C);await kt(r,C,{totalQuestions:p.length,technicalScore:A.technicalScore,discScore:A.discScore,score:Math.round(A.technicalScore*.75+A.discScore*.25),discProfile:T}),la(u,{score:Math.round(A.technicalScore*.75+A.discScore*.25),technicalScore:A.technicalScore,discScore:A.discScore,discProfile:T}).catch(L=>console.warn(L));const O=(o.assessments||[]).map(L=>L.id===r?{...L,answers:C,status:"completed",score:Math.round(A.technicalScore*.75+A.discScore*.25),technical:A.technicalScore,disc:T.label,discProfile:T,progress:`${p.length}/${p.length}`}:L);v({assessments:O,activePage:"assessment",message:""})}else{const A=S.stage===1&&(f==null?void 0:f.stage)===2&&!u.discStartedAt,T=A?new Date().toISOString():u.discStartedAt;await se(r,S.id,C[S.id],{currentQuestionIndex:m+1,totalQuestions:p.length,currentStage:(f==null?void 0:f.stage)||S.stage||1,discStartedAt:A?T:void 0}),Z(r,m+1);const O=(o.assessments||[]).map(L=>L.id===r?{...L,answers:C,currentQuestionIndex:m+1,currentStage:(f==null?void 0:f.stage)||S.stage||1,discStartedAt:T,progress:`${m+1}/${p.length}`}:L);v({assessments:O,activePage:"assessment",message:""})}}catch(A){v({message:V(A)})}}),(h=document.querySelector("#profileForm"))==null||h.addEventListener("submit",async l=>{var N,I,C,f,E,H;l.preventDefault();const r=new FormData(l.currentTarget),u=r.get("department"),p=r.get("city"),m=ve(r.get("salary"),r.get("salaryCurrency")),S={name:r.get("name"),targetRole:r.get("targetRole"),headline:r.get("targetRole"),department:u,city:p,locationId:`${String(p).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g,"-")}-co`,location:`${p}, ${u}`,locationCity:p,locationDepartment:u,locationCountry:"Colombia",english:r.get("english"),salary:m.salary,salaryUSD:m.salaryUSD,salaryAmount:m.salaryAmount,salaryCurrency:m.salaryCurrency,expectedSalaryAmount:m.salaryAmount,expectedSalaryCurrency:m.salaryCurrency,linkedin:r.get("linkedin"),whatsapp:r.get("whatsapp"),phone:r.get("whatsapp"),skills:[...new Set([...r.getAll("skills"),...xe(r.get("otherSkills"))])],otherSkills:xe(r.get("otherSkills")),summary:r.get("summary"),email:((N=o.candidate)==null?void 0:N.email)||((I=o.user)==null?void 0:I.email)||"",availability:((C=o.candidate)==null?void 0:C.availability)||"open",onboarded:!0};if(!o.user){v({candidate:{...o.candidate,...S},message:"Preview updated. Sign in with Google to save this profile."});return}try{const U=r.get("photo");let A=((f=o.candidate)==null?void 0:f.photoURL)||((E=o.user)==null?void 0:E.photoURL)||"";U!=null&&U.name&&(A=await It(o.user.uid,U));const T=r.get("profileCv");let O=null;T!=null&&T.name&&(O=await Ie(o.user.uid,T,r.get("profileCvLabel")));const L={...S,photoURL:A,...O?{activeCvId:O.id,activeCvName:O.name||O.fileName,cvLibrary:[...((H=o.candidate)==null?void 0:H.cvLibrary)||[],O]}:{}},ue=await Dt(o.user.uid,L),st=(ue==null?void 0:ue.atsSynced)===!1?"Profile saved. Nearwork will finish connecting it to your workspace.":"Profile saved.";r.get("mode")==="onboarding"?(window.history.pushState({page:"overview"},"","/"),v({candidate:{...o.candidate,...L},activePage:"overview",message:"Profile complete. Welcome to Talent."})):v({candidate:{...o.candidate,...L},message:st})}catch(U){v({message:V(U)})}}),(y=document.querySelector("#cvForm"))==null||y.addEventListener("submit",async l=>{var p;l.preventDefault();const r=new FormData(l.currentTarget),u=r.get("cv");if(u!=null&&u.name){if(!o.user){v({message:"Sign in with Google to upload and store CVs."});return}try{const m=await Ie(o.user.uid,u,r.get("label"));v({candidate:{...o.candidate,cvLibrary:[...((p=o.candidate)==null?void 0:p.cvLibrary)||[],m],activeCvId:m.id},message:"CV uploaded."})}catch(m){v({message:V(m)})}}})}function at(){if(o.loading)return ha();if(o.view==="dashboard")return Vt();Ye()}window.addEventListener("popstate",()=>{const e=le();e==="overview"&&!o.user?v({view:"login",activePage:"overview",message:""}):o.view==="dashboard"?he(e,!1):re()});X?(lt(z,e=>{e?Je(e):re()}),window.setTimeout(()=>{o.loading&&re()},2500)):re();
