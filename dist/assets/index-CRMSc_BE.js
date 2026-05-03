import{initializeApp as mt}from"https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";import{getAuth as gt,GoogleAuthProvider as ht,signInWithPopup as ft,onAuthStateChanged as yt,sendPasswordResetEmail as vt,createUserWithEmailAndPassword as wt,updateProfile as bt,signInWithEmailAndPassword as St,signOut as $t}from"https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";import{getFirestore as Ct,query as B,collection as U,where as Q,limit as G,getDocs as _,orderBy as xe,getDoc as oe,doc as I,onSnapshot as At,serverTimestamp as D,setDoc as M,updateDoc as kt,addDoc as Ee,arrayUnion as be}from"https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";import{getStorage as Pt,ref as je,uploadBytes as Be,getDownloadURL as Qe}from"https://www.gstatic.com/firebasejs/10.12.5/firebase-storage.js";(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const n of document.querySelectorAll('link[rel="modulepreload"]'))s(n);new MutationObserver(n=>{for(const i of n)if(i.type==="childList")for(const c of i.addedNodes)c.tagName==="LINK"&&c.rel==="modulepreload"&&s(c)}).observe(document,{childList:!0,subtree:!0});function a(n){const i={};return n.integrity&&(i.integrity=n.integrity),n.referrerPolicy&&(i.referrerPolicy=n.referrerPolicy),n.crossOrigin==="use-credentials"?i.credentials="include":n.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function s(n){if(n.ep)return;n.ep=!0;const i=a(n);fetch(n.href,i)}})();const Ge={apiKey:"AIzaSyApRNyW8PoP28E0x77dUB5jOgHuTqA2by4",authDomain:"nearwork-97e3c.firebaseapp.com",projectId:"nearwork-97e3c",storageBucket:"nearwork-97e3c.firebasestorage.app",messagingSenderId:"145642656516",appId:"1:145642656516:web:0ac2da8931283121e87651",measurementId:"G-3LC8N6FFSH"},H=Object.values(Ge).slice(0,6).every(Boolean),W=H?mt(Ge):null,K=W?gt(W):null,b=W?Ct(W):null,Ce=W?Pt(W):null,Nt=W?new ht:null,S={users:"users",candidates:"candidates",openings:"openings",pipelines:"pipelines",applications:"applications",assessments:"assessments",activity:"candidateActivity",notifications:"notifications",notificationPreferences:"notificationPreferences"};function x(){if(!W||!K||!b||!Ce)throw new Error("Missing Firebase environment variables. Copy .env.example to .env.local and fill in the Admin app config.")}async function Ve(e){x();const t=await oe(I(b,S.users,e));return t.exists()?{id:t.id,...t.data()}:null}async function Dt(e){x();const t=String(e||"").trim(),a=t.toLowerCase(),s=B(U(b,S.users),Q("email","==",a),G(1)),n=await _(s);if(!n.empty)return{id:n.docs[0].id,...n.docs[0].data()};if(t===a)return null;const i=B(U(b,S.users),Q("email","==",t),G(1)),c=await _(i);return c.empty?null:{id:c.docs[0].id,...c.docs[0].data()}}async function _e(e){const t=await Ve(e.uid);if(t)return t;const a=await Dt(e.email);return a?(await Ae(e.uid,{...a,email:e.email,connectedFromUserId:a.id}),{...a,id:e.uid,connectedFromUserId:a.id}):null}async function Ae(e,t){x();const a={...t,role:"candidate",updatedAt:D()};await M(I(b,S.users,e),a,{merge:!0})}function he(e){return`CAND-${String(e||"").replace(/[^a-z0-9]/gi,"").slice(0,8).toUpperCase()||Date.now()}`}function It(e){return String(e||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"")}function ke(e,t){const a=t.candidateCode||he(e),s=t.location||[t.locationCity||t.city,t.locationDepartment||t.department].filter(Boolean).join(", "),n=new Date().toISOString().slice(0,10);return{code:a,uid:e,ownerUid:e,name:t.name||"Talent member",role:t.targetRole||t.headline||"Nearwork candidate",skills:Array.isArray(t.skills)?t.skills:[],applied:t.applied||n,lastContact:t.lastContact||n,experience:Number(t.experience||0),location:s,city:It(t.locationCity||t.city||s),department:t.locationDepartment||t.department||"",country:t.locationCountry||"Colombia",source:"talent.nearwork.co",status:t.status||"active",score:Number(t.score||50),email:t.email||"",phone:t.whatsapp||t.phone||"",whatsapp:t.whatsapp||t.phone||"",salary:t.salary||"",salaryUSD:Number(t.salaryUSD||0)||null,salaryAmount:Number(t.salaryAmount||t.expectedSalaryAmount||0)||null,salaryCurrency:t.salaryCurrency||t.expectedSalaryCurrency||"USD",expectedSalaryAmount:Number(t.expectedSalaryAmount||t.salaryAmount||0)||null,expectedSalaryCurrency:t.expectedSalaryCurrency||t.salaryCurrency||"USD",expectedSalary:t.expectedSalary||t.salary||"",availability:t.availability||"open",english:t.english||"",visa:t.visa||"No",linkedin:t.linkedin||"",cv:t.activeCvName||"",tags:t.tags||["talent profile"],notes:t.summary||"",appliedBefore:!!t.appliedBefore,applications:t.applications||[],pipelineCodes:t.pipelineCodes||[],loom:t.loom||"Not uploaded",assessments:t.assessments||[],work:t.work||[],updatedAt:D()}}async function Tt(){x();const e=await ft(K,Nt),t=await _e(e.user),a={email:e.user.email,name:e.user.displayName||"",availability:"open",onboarded:!1};t||await Ae(e.user.uid,a);const s=he(e.user.uid),n={...t||a,candidateCode:s};return await M(I(b,S.candidates,s),ke(e.user.uid,n),{merge:!0}).catch(()=>null),e.user}async function xt(e){x();const t=B(U(b,S.applications),Q("candidateId","==",e),xe("updatedAt","desc"),G(20)),a=B(U(b,S.applications),Q("ownerUid","==",e),xe("updatedAt","desc"),G(20)),s=await Promise.allSettled([_(t),_(a)]),n=new Map;return s.forEach(i=>{i.status==="fulfilled"&&i.value.docs.forEach(c=>n.set(c.id,{id:c.id,...c.data()}))}),Array.from(n.values()).sort((i,c)=>{const l=p=>{var g,y;return((y=(g=p==null?void 0:p.toDate)==null?void 0:g.call(p))==null?void 0:y.getTime())??(p?new Date(p).getTime():0)};return l(c.updatedAt||c.createdAt)-l(i.updatedAt||i.createdAt)})}async function Et(e,t="",a=""){x();const s=String(t||"").trim().toLowerCase(),n=String(a||"").trim(),i=[_(B(U(b,S.assessments),Q("candidateUid","==",e),G(25))),_(B(U(b,S.assessments),Q("candidateId","==",e),G(25)))];s&&i.push(_(B(U(b,S.assessments),Q("candidateEmail","==",s),G(25)))),n&&i.push(_(B(U(b,S.assessments),Q("candidateCode","==",n),G(25))));const c=await Promise.allSettled(i),l=new Map;return c.forEach(p=>{p.status==="fulfilled"&&p.value.docs.forEach(g=>l.set(g.id,{id:g.id,...g.data()}))}),Array.from(l.values()).sort((p,g)=>{const y=f=>{var C,A;return((A=(C=f==null?void 0:f.toDate)==null?void 0:C.call(f))==null?void 0:A.getTime())??(f?new Date(f).getTime():0)};return y(g.updatedAt||g.createdAt||g.sentAt)-y(p.updatedAt||p.createdAt||p.sentAt)})}async function Lt(e,t,a="",s=""){x();const n=await oe(I(b,S.assessments,e));if(!n.exists())return null;const i={id:n.id,...n.data()},c=String(a||"").trim().toLowerCase(),l=String(s||"").trim();return i.candidateUid===t||i.candidateId===t||String(i.candidateEmail||"").trim().toLowerCase()===c||String(i.candidateCode||"").trim()===l?i:null}async function Mt(e,t){x();const a=await oe(I(b,S.assessments,e)),s=a.exists()?a.data():{};if(s.status==="completed")throw new Error("This assessment is already completed.");if(s.expiresAt&&Date.now()>new Date(s.expiresAt).getTime())throw new Error("This assessment link has expired.");await M(I(b,S.assessments,e),{status:"started",currentQuestionIndex:Number(s.currentQuestionIndex||0),currentStage:Number(s.currentStage||1),technicalStartedAt:s.technicalStartedAt||D(),startedAt:s.startedAt||D(),updatedAt:D()},{merge:!0})}async function ce(e,t,a,s={}){x();const n=await oe(I(b,S.assessments,e)),i=n.exists()?n.data():{};if(i.status==="completed")throw new Error("This assessment is already completed.");if(i.expiresAt&&Date.now()>new Date(i.expiresAt).getTime())throw new Error("This assessment link has expired.");await M(I(b,S.assessments,e),{[`answers.${t}`]:a,progress:`${s.currentQuestionIndex||0}/${s.totalQuestions||""}`.replace(/\/$/,""),currentQuestionIndex:s.currentQuestionIndex||0,currentStage:s.currentStage||1,...s.discStartedAt?{discStartedAt:s.discStartedAt}:{},updatedAt:D()},{merge:!0})}async function Rt(e,t,a={}){var C;x();const s=I(b,S.assessments,e),n=await oe(s),i=n.exists()?n.data():{};if(i.status==="completed")throw new Error("This assessment is already completed.");if(i.expiresAt&&Date.now()>new Date(i.expiresAt).getTime())throw new Error("This assessment link has expired.");const c=Object.values(t||{}).filter(A=>String((A==null?void 0:A.value)??A??"").trim()).length,l=Number(a.totalQuestions||Object.keys(t||{}).length||0),p=Number(a.technicalScore||0),g=Number(a.discScore||0),y=Number(a.score||(l?Math.round(c/l*100):0));await M(s,{answers:t,answeredCount:c,totalQuestions:l,score:y,technical:p||y,disc:((C=a.discProfile)==null?void 0:C.label)||(g?`${g}%`:"Submitted"),discScore:g,discProfile:a.discProfile||null,progress:`${c}/${l}`,status:"completed",finished:new Date().toLocaleString("en-US",{month:"short",day:"numeric",year:"numeric",hour:"numeric",minute:"2-digit"}),finishedAt:D(),updatedAt:D()},{merge:!0});const f=Math.round(y);i.candidateUid&&await M(I(b,S.users,i.candidateUid),{score:f,nwScore:f,lastAssessmentScore:f,lastAssessmentId:e,updatedAt:D()},{merge:!0}).catch(()=>null),i.candidateCode&&await M(I(b,S.candidates,i.candidateCode),{score:f,nwScore:f,lastAssessmentScore:f,lastAssessmentId:e,updatedAt:D()},{merge:!0}).catch(()=>null)}async function ze(){x();const e=B(U(b,S.openings),Q("published","==",!0),G(12));return(await _(e)).docs.map(a=>({id:a.id,...a.data()}))}async function Ot(e,t){x();const a=t.code||t.id,s=await Ve(e).catch(()=>null),n={candidateId:e,candidateCode:(s==null?void 0:s.candidateCode)||he(e),candidateEmail:(s==null?void 0:s.email)||"",candidateName:(s==null?void 0:s.name)||"",openingCode:a,jobId:a,jobTitle:t.title||t.role||"Untitled role",clientName:t.orgName||t.clientName||t.company||"Nearwork client",status:"submitted",source:"talent.nearwork.co",createdAt:D(),updatedAt:D()};await Ee(U(b,S.applications),n),await M(I(b,S.candidates,n.candidateCode),{...ke(e,{...s||{},candidateCode:n.candidateCode,applications:be(a),appliedBefore:!0,lastContact:new Date().toISOString().slice(0,10)}),applications:be(a),appliedBefore:!0},{merge:!0}).catch(()=>null),await Ee(U(b,S.activity),{candidateId:e,type:"application_submitted",title:n.jobTitle,createdAt:D()}).catch(()=>null)}async function Ut(e,t){await kt(I(b,S.users,e),{availability:t,updatedAt:D()})}async function qt(e,t){x();const a=t.candidateCode||he(e);await M(I(b,S.users,e),{...t,candidateCode:a,role:"candidate",updatedAt:D()},{merge:!0});try{return await M(I(b,S.candidates,a),ke(e,{...t,candidateCode:a}),{merge:!0}),{candidateCode:a,atsSynced:!0}}catch(s){return console.warn("Candidate ATS sync failed.",s),{candidateCode:a,atsSynced:!1}}}async function Ft(e,t){x();const a=t.name.replace(/[^a-z0-9._-]/gi,"-").toLowerCase(),s=`candidate-photos/${e}/${Date.now()}-${a}`,n=je(Ce,s);await Be(n,t,{contentType:t.type||"application/octet-stream"});const i=await Qe(n);return await M(I(b,S.users,e),{photoURL:i,updatedAt:D()},{merge:!0}),i}async function Le(e,t,a){x();const s=t.name.replace(/[^a-z0-9._-]/gi,"-").toLowerCase(),n=`candidate-cvs/${e}/${Date.now()}-${s}`,i=je(Ce,n);await Be(i,t,{contentType:t.type||"application/octet-stream"});const c=await Qe(i),l={id:n,name:a||t.name,fileName:t.name,url:c,uploadedAt:new Date().toISOString()};return await M(I(b,S.users,e),{cvLibrary:be(l),activeCvId:l.id,activeCvName:l.name||l.fileName,updatedAt:D()},{merge:!0}),l}function jt(e,t){if(x(),!e)return()=>{};const a=B(U(b,S.notifications),Q("recipientUid","==",e),G(50));return At(a,s=>{const n=s.docs.map(i=>({id:i.id,...i.data()})).sort((i,c)=>{var g,y;const l=(g=i.createdAt)!=null&&g.toDate?i.createdAt.toDate().getTime():new Date(i.createdAt||0).getTime();return((y=c.createdAt)!=null&&y.toDate?c.createdAt.toDate().getTime():new Date(c.createdAt||0).getTime())-l});t(n)})}async function Bt(e){x(),e&&await M(I(b,S.notifications,e),{read:!0,readAt:D()},{merge:!0})}async function Qt(e,t){x(),await M(I(b,S.notificationPreferences,e),{uid:e,app:"talent.nearwork.co",preferences:t,updatedAt:D()},{merge:!0})}const Pe=document.querySelector("#app"),Gt="+573135928691",Vt="https://wa.me/573135928691",ue=[{id:"OPEN-CSM-DEMO",code:"OPEN-CSM-DEMO",title:"Customer Success Manager",orgName:"US SaaS company",location:"Remote, Colombia",compensation:"$2,000-$2,800/mo USD",match:94,skills:["SaaS","Customer Success","English C1","QBRs"],description:"Own onboarding, adoption, renewals, and expansion for a portfolio of US-based SaaS clients."},{id:"OPEN-SDR-DEMO",code:"OPEN-SDR-DEMO",title:"SDR / Sales Development Rep",orgName:"B2B marketplace",location:"Remote",compensation:"$1,700-$2,200/mo USD",match:89,skills:["HubSpot","Outbound","Salesforce","English C1"],description:"Qualify outbound leads, book demos, and work closely with a high-performing US sales team."},{id:"OPEN-SUP-DEMO",code:"OPEN-SUP-DEMO",title:"Technical Support Specialist",orgName:"Cloud workflow platform",location:"Remote, LatAm",compensation:"$1,400-$1,900/mo USD",match:86,skills:["Technical Support","APIs","Tickets","Troubleshooting"],description:"Handle Tier 1 and Tier 2 support, troubleshoot product issues, and maintain excellent CSAT."}],ie={"Customer Success":["Customer Success Manager","Customer Success Associate","Account Manager","Implementation Specialist","Onboarding Specialist","Renewals Manager"],Sales:["SDR / Sales Development Rep","BDR / Business Development Rep","Account Executive","Sales Operations Specialist","Sales Manager"],Support:["Technical Support Specialist","Customer Support Representative","Support Team Lead","QA Support Analyst"],Operations:["Operations Manager","Operations Analyst","Executive Assistant","Virtual Assistant","Project Coordinator","Recruiting Coordinator"],Marketing:["Marketing Ops / Content Specialist","Content Writer","SEO Specialist","Lifecycle Marketing Specialist","Social Media Manager"],Engineering:["Software Developer (Full Stack)","Frontend Developer","Backend Developer","No-Code Developer","Data Analyst","QA Engineer"],Finance:["Bookkeeper","Accounting Assistant","Financial Analyst","Payroll Specialist"]},_t={"CRM & Sales":["HubSpot","Salesforce","Pipedrive","Apollo","Outbound","Cold Email","Discovery Calls","CRM Hygiene"],"Customer Success":["SaaS","Customer Success","QBRs","Onboarding","Renewals","Expansion","Churn Reduction","Intercom","Zendesk"],Support:["Technical Support","Tickets","Troubleshooting","APIs","Bug Reproduction","Help Center","CSAT"],Operations:["Excel","Google Sheets","Reporting","Process Design","Project Management","Notion","Airtable","Zapier"],Marketing:["Content","SEO","Lifecycle","Email Marketing","HubSpot Marketing","Copywriting","Analytics"],Engineering:["JavaScript","React","Node.js","SQL","Python","REST APIs","QA","GitHub"],Language:["English B2","English C1","English C2","Spanish Native"]},He={Amazonas:["Leticia","Puerto Nariño"],Antioquia:["Medellín","Abejorral","Apartadó","Bello","Caldas","Caucasia","Copacabana","El Carmen de Viboral","Envigado","Girardota","Itagüí","La Ceja","La Estrella","Marinilla","Rionegro","Sabaneta","Santa Fe de Antioquia","Turbo"],Arauca:["Arauca","Arauquita","Saravena","Tame"],Atlántico:["Barranquilla","Baranoa","Galapa","Malambo","Puerto Colombia","Sabanalarga","Soledad"],"Bogotá D.C.":["Bogotá"],Bolívar:["Cartagena","Arjona","El Carmen de Bolívar","Magangué","Mompox","Turbaco"],Boyacá:["Tunja","Chiquinquirá","Duitama","Paipa","Sogamoso","Villa de Leyva"],Caldas:["Manizales","Aguadas","Chinchiná","La Dorada","Riosucio","Villamaría"],Caquetá:["Florencia","El Doncello","Puerto Rico","San Vicente del Caguán"],Casanare:["Yopal","Aguazul","Paz de Ariporo","Villanueva"],Cauca:["Popayán","El Tambo","Puerto Tejada","Santander de Quilichao"],Cesar:["Valledupar","Aguachica","Bosconia","Codazzi"],Chocó:["Quibdó","Istmina","Nuquí","Tadó"],Córdoba:["Montería","Cereté","Lorica","Sahagún"],Cundinamarca:["Chía","Cajicá","Facatativá","Fusagasugá","Girardot","Madrid","Mosquera","Soacha","Tocancipá","Zipaquirá"],Guainía:["Inírida"],Guaviare:["San José del Guaviare","Calamar","El Retorno","Miraflores"],Huila:["Neiva","Garzón","La Plata","Pitalito"],"La Guajira":["Riohacha","Maicao","San Juan del Cesar","Uribia"],Magdalena:["Santa Marta","Ciénaga","El Banco","Fundación"],Meta:["Villavicencio","Acacías","Granada","Puerto López"],Nariño:["Pasto","Ipiales","Tumaco","Túquerres"],"Norte de Santander":["Cúcuta","Ocaña","Pamplona","Villa del Rosario"],Putumayo:["Mocoa","Orito","Puerto Asís","Valle del Guamuez"],Quindío:["Armenia","Calarcá","La Tebaida","Montenegro","Quimbaya"],Risaralda:["Pereira","Dosquebradas","La Virginia","Santa Rosa de Cabal"],"San Andrés y Providencia":["San Andrés","Providencia"],Santander:["Bucaramanga","Barrancabermeja","Floridablanca","Girón","Piedecuesta","San Gil"],Sucre:["Sincelejo","Corozal","Sampués","Tolú"],Tolima:["Ibagué","Espinal","Honda","Melgar"],"Valle del Cauca":["Cali","Buga","Buenaventura","Cartago","Jamundí","Palmira","Tuluá","Yumbo"],Vaupés:["Mitú"],Vichada:["Puerto Carreño","La Primavera","Santa Rosalía"]};let Z=He;const zt=[{title:"How to answer salary questions",tag:"Interview",read:"4 min",body:"Use a confident range, anchor it to the role, and avoid apologizing for earning in USD.",actions:["Know your floor","Use monthly USD","Mention flexibility last"]},{title:"Writing a CV for US SaaS companies",tag:"CV",read:"6 min",body:"Translate local experience into metrics US hiring managers can scan in under a minute.",actions:["Lead with outcomes","Add tools","Quantify scope"]},{title:"Before your recruiter screen",tag:"Process",read:"3 min",body:"Prepare availability, compensation, English comfort, and two strong role stories.",actions:["Check your setup","Review the opening","Bring questions"]},{title:"STAR stories that feel natural",tag:"Interview",read:"5 min",body:"Keep stories specific, concise, and tied to business impact instead of job duties.",actions:["Situation","Action","Result"]}],Me=[{key:"applied",label:"Applied",help:"Your profile is in Nearwork review."},{key:"profile",label:"Profile Review",help:"We are checking role fit, CV, and background."},{key:"assessment",label:"Assessment",help:"Complete role-specific questions when assigned."},{key:"interview",label:"Interview",help:"Meet the recruiter or client team."},{key:"decision",label:"Decision",help:"Final feedback or offer decision."}];let o={user:null,candidate:null,applications:[],assessments:[],notifications:[],notificationPanelOpen:!1,notificationSettingsOpen:!1,jobs:[],loading:!0,view:"login",activePage:"overview",matchesFiltered:!1,message:""},z=null;const ve=sessionStorage.getItem("nw_restore_path");ve&&(sessionStorage.removeItem("nw_restore_path"),window.history.replaceState({page:ve},"",ve));function Ne(){return[["overview","layout-dashboard","Overview"],["matches","briefcase-business","Matches"],["applications","send","Applications"],["assessment","clipboard-check","Assessment"],["cvs","files","CV Picker"],["tips","book-open","Tips"],["recruiter","calendar-days","Recruiter"],["profile","user-round-cog","Profile"]]}function ge(){const t=window.location.pathname.split("/").filter(Boolean)[0];return t==="onboarding"?"onboarding":t==="assessment"||t==="assessments"?"assessment":Ne().some(([a])=>a===t)?t:"overview"}function Y(){const e=window.location.pathname.split("/").filter(Boolean);return(e[0]==="assessment"||e[0]==="assessments")&&e[1]||""}function We(){const e=window.location.pathname.split("/").filter(Boolean),t=e.findIndex(s=>s==="q"||s==="question");if(t===-1)return null;const a=Number(e[t+1]);return Number.isFinite(a)&&a>0?a-1:null}function Ht(e,t=0){return`/assessment/${encodeURIComponent(e)}/start/q/${Number(t||0)+1}`}function se(e,t=0,a=!1){const s=Ht(e,t);if(window.location.pathname===s)return;const n=a?"replaceState":"pushState";window.history[n]({page:"assessment",assessmentId:e,questionIndex:t},"",s)}function k(e,t){return`<i data-lucide="${e}" aria-label="${e}"></i>`}function Ye(){window.lucide&&window.lucide.createIcons()}function w(e){o={...o,...e},ut()}function pe(e,t=!0){const s=e==="onboarding"||Ne().some(([n])=>n===e)?e:"overview";o={...o,activePage:s,matchesFiltered:s==="matches"?o.matchesFiltered:!1,message:""},t&&window.history.pushState({page:s},"",s==="overview"?"/":`/${s}`),ut()}function Je(){var t,a;return(((t=o.candidate)==null?void 0:t.name)||((a=o.user)==null?void 0:a.displayName)||"there").split(" ")[0]||"there"}function Wt(){var t,a,s;return(((t=o.candidate)==null?void 0:t.name)||((a=o.user)==null?void 0:a.displayName)||((s=o.user)==null?void 0:s.email)||"NW").split(/[ @.]/).filter(Boolean).slice(0,2).map(n=>n[0]).join("").toUpperCase()}function Ke(e="normal"){var s,n;const t=((s=o.candidate)==null?void 0:s.photoURL)||((n=o.user)==null?void 0:n.photoURL)||"",a=e==="large"?"avatar avatar-large":"avatar";return t?`<img class="${a}" src="${$(t)}" alt="${$(Je())}" />`:`<div class="${a}">${Wt()}</div>`}function $(e){return String(e||"").replaceAll("&","&amp;").replaceAll('"',"&quot;").replaceAll("<","&lt;").replaceAll(">","&gt;")}function De(e){if(!e)return"Recently";const t=e.toDate?e.toDate():new Date(e);return new Intl.DateTimeFormat("en",{month:"short",day:"numeric"}).format(t)}function fe(){var t;const e=((t=o.candidate)==null?void 0:t.skills)||[];return Array.isArray(e)?e:String(e).split(",").map(a=>a.trim()).filter(Boolean)}function Yt(){var t;const e=((t=o.candidate)==null?void 0:t.otherSkills)||[];return Array.isArray(e)?e.join(", "):String(e||"")}function Re(e){return String(e||"").split(",").map(t=>t.trim()).filter(Boolean)}function Ie(e){return["Nearwork candidate","Preview mode","Talent member"].includes(String(e||"").trim())}function Jt(){return Te()>=100}function Oe(e){if(!e)return null;if(e.toDate)return e.toDate();if(typeof e=="object"&&typeof e.seconds=="number")return new Date(e.seconds*1e3);const t=new Date(e);return Number.isNaN(t.getTime())?null:t}function re(e){return Number(e||1)===1?"Technical Assessment":"DISC Assessment"}function we(e,t){var a,s,n;return((s=(a=e==null?void 0:e.answers)==null?void 0:a[t==null?void 0:t.id])==null?void 0:s.value)??((n=e==null?void 0:e.answers)==null?void 0:n[t==null?void 0:t.id])??""}function te(e){return e!=null&&e!==""}function Se(e,t){return((e==null?void 0:e.questions)||[]).slice(0,70).filter(a=>Number(a.stage||1)===Number(t))}function $e(e,t,a=(e==null?void 0:e.answers)||{}){return Se(e,t).filter(s=>{var n;return!te(((n=a[s.id])==null?void 0:n.value)??a[s.id])})}function Ze(){var e,t;return!!((o.applications||[]).length||(((e=o.candidate)==null?void 0:e.pipelineCodes)||[]).length||(t=o.candidate)!=null&&t.pipelineCode)}function Kt(){var s,n,i;const e=((s=o.candidate)==null?void 0:s.department)||"Bogotá D.C.",t=Z[e]||Z["Bogotá D.C."]||["Bogotá"],a=((n=o.candidate)==null?void 0:n.city)||((i=o.candidate)==null?void 0:i.locationCity)||t[0];return{department:e,city:a,label:`${a}, ${e}`}}async function Zt(){try{const e=await fetch("/api/locations?ts="+Date.now(),{cache:"no-store"}),t=await e.json();if(!e.ok||!t.ok||!t.departments)throw new Error(t.error||"Location API unavailable");Z=t.departments}catch(e){console.warn("Using bundled Colombia locations:",e.message||e),Z=He}}function Xt(){var t,a,s;const e=((t=o.candidate)==null?void 0:t.targetRole)||((a=o.candidate)==null?void 0:a.headline)||"";return((s=Object.entries(ie).find(([,n])=>n.includes(e)))==null?void 0:s[0])||Object.keys(ie)[0]}function ea(e){return Object.keys(ie).map(t=>`<option value="${$(t)}" ${t===e?"selected":""}>${t}</option>`).join("")}function Xe(e,t){const a=ie[e]||Object.values(ie).flat();return['<option value="">Choose the closest role</option>'].concat(a.map(s=>`<option value="${$(s)}" ${t===s?"selected":""}>${s}</option>`)).join("")}function ta(e){return Object.entries(_t).map(([t,a])=>`
    <fieldset class="skill-group">
      <legend>${$(t)}</legend>
      <div class="skill-picker">
        ${a.map(s=>`
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
        <input name="otherSkills" value="${$(Yt())}" placeholder="Type extra skills, separated by commas" />
      </label>
    </fieldset>
  `}function et(e,t="USD"){const a=Number(String(e||"").replace(/[^\d.]/g,"")),s=String(t||"USD").toUpperCase()==="COP"?"COP":"USD";if(!Number.isFinite(a)||a<=0)return{salary:"",salaryUSD:null,salaryCurrency:s,salaryAmount:null};const n=Math.round(a);return{salary:`${s} ${new Intl.NumberFormat("en-US").format(n)}/mo`,salaryUSD:s==="USD"?n:null,salaryCurrency:s,salaryAmount:n}}function tt(e){return Number(String(e||"").replace(/[^\d.]/g,""))}function Ue(e,t="USD"){const a=tt(e),s=String(t||"USD").toUpperCase()==="COP"?"COP":"USD";return s==="USD"&&a>=1e5?"COP":s}function qe(e,t="USD"){const a=tt(e);return!Number.isFinite(a)||a<=0?"":new Intl.NumberFormat("en-US",{maximumFractionDigits:0}).format(Math.round(a))}function at(e){return Array.isArray(e)?e:String(e||"").split(",").map(t=>t.trim()).filter(Boolean)}function ae(e){const t=at(e.skills||e.requiredSkills);return{id:e.id||e.code,code:e.code||e.id,title:e.title||e.role||e.openingTitle||"Open role",orgName:e.orgName||e.company||e.clientName||"Nearwork client",location:e.location||"Remote",compensation:e.compensation||e.salary||e.rate||"Competitive",match:e.match||82,skills:t,description:e.description||e.about||"Nearwork is reviewing candidates for this role now."}}function J(e){const t=(e==null?void 0:e.code)||"";return t.includes("operation-not-allowed")?"This sign-in method is not available yet.":t.includes("unauthorized-domain")?"This website still needs to be approved for sign-in.":t.includes("permission-denied")?"We could not save this yet. Please try again in a moment or contact Nearwork support.":t.includes("weak-password")?"Password must be at least 6 characters.":t.includes("invalid-credential")||t.includes("wrong-password")?"That email/password did not match. If this account was created with Google, use Continue with Google.":t.includes("user-not-found")?"No account exists for that email yet.":t.includes("email-already-in-use")?"That email already has an account. Sign in or use Google.":t.includes("popup")?"The Google sign-in popup was closed before finishing.":"Something went wrong. Please try again or contact Nearwork support."}function aa(e){Pe.innerHTML=`
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
  `,Ye()}function nt(e="login"){var a;const t=e==="signup";aa(`
    <section class="auth-panel">
      <div class="right-brand">Near<span>work</span></div>
      <div class="candidate-chip">For candidates</div>
      <div class="panel-heading">
        <h2>${t?"Create your account.":"Welcome back."}</h2>
        <p>${t?"Create your profile, browse roles, and track your application.":"Use Google if your candidate account was created with Google."}</p>
      </div>
      ${o.message?`<div class="notice">${k("lock")} ${$(o.message)}</div>`:""}
      ${H?"":`<div class="notice">${k("triangle-alert")} Sign-in is still being set up.</div>`}
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
  `),document.querySelector("#toggleMode").addEventListener("click",()=>nt(t?"login":"signup")),document.querySelector("#googleSignIn").addEventListener("click",async()=>{const s=document.querySelector("#formMessage");s.textContent="";try{await Tt()}catch(n){s.textContent=J(n)}}),(a=document.querySelector("#resetPassword"))==null||a.addEventListener("click",async()=>{const s=document.querySelector("input[name='email']").value.trim().toLowerCase(),n=document.querySelector("#formMessage");if(!s){n.textContent="Enter your email first, then request a reset link.";return}try{await vt(K,s),n.textContent=`Password reset sent to ${s}.`}catch(i){n.textContent=J(i)}}),document.querySelector("#authForm").addEventListener("submit",async s=>{s.preventDefault();const n=new FormData(s.currentTarget),i=document.querySelector("#formMessage"),c=String(n.get("email")).trim().toLowerCase();i.textContent="";try{if(t){const l=await wt(K,c,n.get("password"));await bt(l.user,{displayName:n.get("name")}),sessionStorage.setItem("nw_new_account","1"),await Ae(l.user.uid,{name:n.get("name"),email:c,availability:"open",headline:"Nearwork candidate",onboarded:!1})}else await St(K,c,n.get("password"))}catch(l){i.textContent=J(l)}})}async function st(e){w({loading:!0,user:e});try{await Zt();const[t,a,s]=await Promise.allSettled([_e(e),xt(e.uid),ze()]),n=t.status==="fulfilled"?t.value:null,i=a.status==="fulfilled"?a.value:[],c=s.status==="fulfilled"?s.value:ue;let l=[];try{l=await Et(e.uid,e.email,(n==null?void 0:n.candidateCode)||(n==null?void 0:n.code)||"")}catch(f){console.warn(f)}const p=Y();if(p&&!l.some(f=>f.id===p)){const f=await Lt(p,e.uid,e.email,(n==null?void 0:n.candidateCode)||(n==null?void 0:n.code)||"").catch(()=>null);f&&(l=[f,...l])}const g=sessionStorage.getItem("nw_new_account")==="1";g&&sessionStorage.removeItem("nw_new_account");const y=g&&(n==null?void 0:n.onboarded)!==!0?"onboarding":ge();w({candidate:{...n||{},name:(n==null?void 0:n.name)||e.displayName||"Talent member",email:(n==null?void 0:n.email)||e.email,availability:(n==null?void 0:n.availability)||"open",headline:(n==null?void 0:n.headline)||(n==null?void 0:n.targetRole)||"Nearwork candidate"},applications:i,assessments:l,jobs:c.length?c.map(ae):ue,loading:!1,view:"dashboard",activePage:y,message:""}),z&&z(),H&&(z=jt(e.uid,f=>{o.notifications=f,o.view==="dashboard"&&it()}))}catch(t){console.warn(t),w({candidate:{name:e.displayName||"Talent member",email:e.email,availability:"open",headline:"Nearwork candidate"},applications:[],assessments:[],jobs:ue,loading:!1,view:"dashboard",activePage:ge(),message:""})}}async function me(){const e=ge();if(e==="assessment"){sessionStorage.setItem("nw_restore_path",window.location.pathname),w({user:null,candidate:null,applications:[],assessments:[],jobs:[],loading:!1,view:"login",activePage:"overview",message:"Please log in to open your assessment."});return}if(e==="overview"){z&&z(),z=null,w({user:null,candidate:null,loading:!1,view:"login",activePage:"overview"});return}let t=ue;try{const a=await ze();a.length&&(t=a.map(ae))}catch(a){console.warn(a)}w({user:null,candidate:{name:"Guest candidate",availability:"open",headline:"Preview mode"},applications:[],assessments:[],jobs:t,loading:!1,view:"dashboard",activePage:e,message:"Preview mode. Sign in with Google to save your profile, apply, upload CVs, or track your actual pipeline."})}function it(){var t,a,s,n;const e=(o.notifications||[]).filter(i=>!i.read).length;Pe.innerHTML=`
    <main class="dashboard">
      <aside class="sidebar">
        <div class="brand-top"><button class="wordmark wordmark-button" type="button" data-dashboard-home>Near<span>work</span></button></div>
        <div class="candidate-card">
          ${Ke()}
          <strong>${((t=o.candidate)==null?void 0:t.name)||((a=o.user)==null?void 0:a.displayName)||"Talent member"}</strong>
          <span>${((s=o.candidate)==null?void 0:s.headline)||((n=o.candidate)==null?void 0:n.targetRole)||"Nearwork candidate"}</span>
        </div>
        <nav>
          ${Ne().map(([i,c,l])=>`
            <button class="${o.activePage===i?"active":""}" data-page="${i}">${k(c)} ${l}</button>
          `).join("")}
        </nav>
        <button id="${o.user?"signOut":"signIn"}" class="ghost-action">${k(o.user?"log-out":"log-in")} ${o.user?"Sign out":"Sign in"}</button>
      </aside>
      <section class="workspace">
        <header class="topbar">
          <div><p class="eyebrow">Candidate workspace</p><h1>${ca()}</h1></div>
          <div class="topbar-actions">
            <div class="notification-wrap">
              <button class="icon-action" type="button" id="notificationBell" aria-label="Notifications">${k("bell")}${e?`<span>${e}</span>`:""}</button>
              ${o.notificationPanelOpen?sa():""}
            </div>
            <button class="icon-action" type="button" id="notificationSettings" aria-label="Notification settings">${k("settings")}</button>
            <label class="availability">Availability
              <select id="availability">
                ${["open","interviewing","paused"].map(i=>{var c;return`<option value="${i}" ${((c=o.candidate)==null?void 0:c.availability)===i?"selected":""}>${i}</option>`}).join("")}
              </select>
            </label>
          </div>
        </header>
        ${o.notificationSettingsOpen?ia():""}
        ${o.message?`<div class="notice">${o.message}</div>`:""}
        ${la()}
      </section>
    </main>
  `,Ye(),xa(),ra(),oa()}function na(e){return(e!=null&&e.toDate?e.toDate():new Date(e||Date.now())).toLocaleString("en-US",{month:"short",day:"numeric",year:"numeric",hour:"numeric",minute:"2-digit"})}function sa(){const e=(o.notifications||[]).slice(0,10);return`
    <div class="notification-panel">
      <div class="notification-panel-head"><strong>Notifications</strong><span>${e.length?"Latest updates":"All clear"}</span></div>
      ${e.length?e.map(t=>`
        <button class="notification-item ${t.read?"":"unread"}" type="button" data-notification-read="${t.id}">
          <strong>${$(t.title||"Nearwork update")}</strong>
          <span>${$(t.message||"")}</span>
          <time>${na(t.createdAt)}</time>
        </button>
      `).join(""):'<div class="notification-empty">No notifications yet.</div>'}
    </div>
  `}function ia(){var a;const e=((a=o.candidate)==null?void 0:a.notificationPreferences)||{};return`
    <section class="notification-settings-card">
      <div class="section-heading"><div><p class="eyebrow">Settings</p><h2>Notification preferences</h2></div></div>
      <div class="notification-settings-grid">
        ${[["recruitmentUpdates","Recruitment updates"],["assessmentUpdates","Assessment updates"],["mentions","Mentions"],["openingMovement","Opening movement"]].map(([s,n])=>{const i=e[s]||{};return`<div class="notification-setting-row">
            <strong>${n}</strong>
            <label><input type="checkbox" data-notification-pref="${s}" data-channel="app" ${i.app!==!1?"checked":""}> In-app</label>
            <label><input type="checkbox" data-notification-pref="${s}" data-channel="email" ${i.email!==!1?"checked":""}> Email</label>
          </div>`}).join("")}
      </div>
      <p class="field-hint">Email notifications are grouped with a 2-hour buffer. The bell always keeps the detailed history with date and time.</p>
    </section>
  `}let le=null;function oa(){le&&window.clearInterval(le);const e=document.querySelector("#assessmentTimer");if(!e)return;const t=new Date(e.dataset.end||"").getTime(),a=()=>{const s=Math.max(0,t-Date.now()),n=Math.floor(s/1e3),i=Math.floor(n/60),c=String(n%60).padStart(2,"0");e.textContent=`${i}:${c}`,e.classList.toggle("is-low",s<=10*60*1e3),s<=0&&window.clearInterval(le)};a(),le=window.setInterval(a,1e3)}function ra(){if(o.activePage!=="assessment")return;const e=o.assessments||[],t=Y(),s=(t?e.find(i=>i.id===t):null)||e.find(i=>["sent","started"].includes(String(i.status||"").toLowerCase()));if(!(s!=null&&s.id))return;const n=String(s.status||"").toLowerCase();if(n==="started"&&We()===null){se(s.id,Number(s.currentQuestionIndex||0),!0);return}if(!t&&n==="sent"){const i=`/assessment/${encodeURIComponent(s.id)}/start`;window.history.replaceState({page:"assessment",assessmentId:s.id},"",i)}}function ca(){return{onboarding:"Complete your candidate profile",overview:`Hi ${Je()}, here's your process`,matches:"Role matches",applications:"Application pipeline",assessment:"Assessment center",cvs:"CV picker",tips:"Interview tips",recruiter:"Your recruiter",profile:"Candidate profile"}[o.activePage]||"Talent"}function la(){return({onboarding:da,overview:Fe,matches:ua,applications:pa,assessment:ma,cvs:Aa,tips:ka,recruiter:Pa,profile:Na}[o.activePage]||Fe)()}function Fe(){var s;const e=Jt(),t=Ze(),a=o.jobs.length;return`
    ${e?"":`
      <section class="hero-card">
        <div><p class="eyebrow">Action needed</p><h2>Finish your profile to unlock matches.</h2><p>Add your role, city, salary, and skills so Nearwork can match you to the right openings.</p></div>
        <button class="primary-action fit" data-page="profile">${k("arrow-right")} Complete profile</button>
      </section>
    `}
    <section class="summary-grid">
      ${de("Profile readiness",`${Te()}%`,"sparkles")}
      ${de("Open roles",a,"briefcase-business")}
      ${de("Applications",o.applications.length,"send")}
      ${de("CVs saved",(((s=o.candidate)==null?void 0:s.cvLibrary)||[]).length,"files")}
    </section>
    <section class="content-grid">
      <div class="section-block"><div class="section-heading"><div><p class="eyebrow">Now</p><h2>${t?"Talent pipeline":"Find your next opening"}</h2></div></div>${t?ct(rt()):lt()}</div>
      <div class="section-block compact"><div class="section-heading"><div><p class="eyebrow">Recruiter</p><h2>Need help?</h2></div></div>${dt()}</div>
    </section>
  `}function da(){return`
    <section class="onboarding-hero">
      <div>
        <p class="eyebrow">New candidate setup</p>
        <h2>Tell Nearwork what role, city, salary, and skills fit you best.</h2>
        <p>This only appears as a first-run setup. After you submit it, you will land in the Talent workspace.</p>
      </div>
    </section>
    ${ot("onboarding")}
  `}function ua(){var l,p,g;const e=((l=o.candidate)==null?void 0:l.targetRole)||(Ie((p=o.candidate)==null?void 0:p.headline)?"":(g=o.candidate)==null?void 0:g.headline),t=fe(),a=t.map(y=>y.toLowerCase()),s=o.jobs.map(ae).filter(y=>{const f=e.toLowerCase().split(/[^a-z0-9]+/).filter(d=>d.length>2),C=[y.title,y.description,y.skills.join(" ")].join(" ").toLowerCase(),A=f.length?f.some(d=>C.includes(d)):!1,R=a.length?a.some(d=>C.includes(d)):!1;return A||R}),n=!!(e||t.length),i=o.matchesFiltered&&n?s:o.jobs.map(ae),c=o.matchesFiltered&&!s.length;return`
    <section class="section-block">
      <div class="section-heading">
        <div><p class="eyebrow">Openings</p><h2>${o.matchesFiltered?"Best fit from your profile":"All current openings"}</h2></div>
        <button id="filterMatches" class="secondary-action" type="button">${k(o.matchesFiltered?"list":"filter")} ${o.matchesFiltered?"Show all openings":"Filter by my role & skills"}</button>
      </div>
      <div class="match-note"><strong>${i.length}</strong> of <strong>${o.jobs.length}</strong> openings showing. Role: <strong>${e||"not set"}</strong>. Skills: <strong>${t.join(", ")||"not set"}</strong>.</div>
      <div class="job-list">${c?ne("No filtered matches yet","Add a target role and skills in Profile to improve matching."):i.map(y=>Da(y)).join("")}</div>
    </section>
  `}function pa(){return`
    <section class="section-block">
      <div class="section-heading"><div><p class="eyebrow">Pipeline</p><h2>Your applications</h2></div></div>
      ${Ze()?ct(rt()):lt()}
      <div class="timeline page-gap">${o.applications.length?o.applications.map(Ia).join(""):ne("No applications yet","Apply to a role and your process will show here.")}</div>
    </section>
  `}function ma(){const e=Y(),t=o.assessments||[],a=t.filter(i=>["sent","started"].includes(String(i.status||"").toLowerCase())),s=t.filter(i=>String(i.status||"").toLowerCase()==="completed"),n=e?t.find(i=>i.id===e):a[0]||s[0]||null;if(e&&!n)return`
      <section class="assessment-hero">
        <div><p class="eyebrow">Assessment</p><h2>No assessment available for this link.</h2><p>Make sure you are logged into the same account that received the assessment email. If this keeps happening, contact Nearwork support.</p></div>
        <button class="primary-action fit" data-page="recruiter" type="button">${k("message-circle")} Contact support</button>
      </section>
    `;if(n){const i=Array.isArray(n.questions)?n.questions:[],c=String(n.status||"").toLowerCase()==="started",l=String(n.status||"").toLowerCase()==="completed",p=String(n.status||"").toLowerCase()==="cancelled",g=va(n),y=We(),f=Number(n.currentQuestionIndex||0),C=Math.min(y??f,Math.max(i.length-1,0)),A=i[C],R=(A==null?void 0:A.stage)||n.currentStage||1;return`
      <section class="assessment-hero">
        <div>
          <p class="eyebrow">Nearwork assessment</p>
          <h2>${$(n.role||"Role assessment")}</h2>
          <p>${l?"This assessment has been submitted.":p?"This assessment was cancelled by Nearwork. If a new one is assigned, it will appear here automatically.":g?"This assessment link has expired.":"This assessment has 2 stages. Stage 1 is technical, Stage 2 is DISC. You must be logged in to complete it."}</p>
        </div>
        <button class="primary-action fit" id="startAssessment" type="button" ${l||p||g?"disabled":""}>${k(c?"play":"clipboard-check")} ${c?"Continue assessment":"Start assessment"}</button>
      </section>
      ${c&&!l&&!p&&!g?ha(n,R):""}
      ${c&&!l&&!p&&!g?ga(n,C):""}
      <section class="info-grid">
        ${ee("Technical Assessment","50 technical single-choice questions. 60 minutes.")}
        ${ee("DISC Assessment","20 work-style single-choice questions. 30 minutes.")}
        ${ee("24-hour link",`Expires ${De(n.expiresAt||n.deadline)}.`)}
      </section>
      <section class="section-block page-gap" id="assessmentWorkspace">
        <div class="section-heading"><div><p class="eyebrow">${l?"Submitted":re(R)}</p><h2>${l?"Assessment received":`${C+1} of ${i.length||70}`}</h2></div></div>
        ${l?wa():p?ne("Assessment cancelled","This assessment is no longer available. A new assigned assessment will appear here when your recruiter sends it."):g?ne("Assessment expired","This unique assessment link is no longer available. Contact Nearwork if you need help."):fa(n,c,C)}
      </section>
      ${ba(t,n.id)}
    `}return`
    <section class="assessment-hero">
      <div><p class="eyebrow">Assessment</p><h2>Complete role-specific questions when Nearwork assigns them.</h2><p>Your assessment will include English, work simulation, and role-specific scenarios. Results are reviewed by the Nearwork recruiting team.</p></div>
      <button class="primary-action fit" type="button" disabled>${k("lock")} Not assigned yet</button>
    </section>
    <section class="info-grid">${ee("One attempt","Retakes are only opened by your recruiter when needed.")}${ee("Timed work","Most role assessments take 45-90 minutes.")}${ee("Recruiter review","You will get next steps or respectful feedback after review.")}</section>
  `}function ga(e,t){const a=(e.questions||[]).slice(0,70),s=Se(e,1).filter(i=>te(we(e,i))).length,n=Se(e,2).filter(i=>te(we(e,i))).length;return`
    <section class="assessment-progress-panel">
      <div><strong>Technical Assessment</strong><span>${s}/50 answered</span></div>
      <div><strong>DISC Assessment</strong><span>${n}/20 answered</span></div>
      <div class="assessment-progress-strip">
        ${a.map((i,c)=>{const l=te(we(e,i));return`<button type="button" class="${c===t?"active":""} ${l?"answered":""}" data-assessment-jump="${c}" title="${re(i.stage)} question ${c+1}">${c+1}</button>`}).join("")}
      </div>
    </section>
  `}function ha(e,t){const a=Number(t),s=Oe(e.technicalStartedAt||e.startedAt)||new Date,n=Oe(e.discStartedAt)||new Date,i=a===1?s:n,c=Number(a===1?e.technicalMinutes||60:e.discMinutes||30),l=new Date(i.getTime()+c*60*1e3);return`
    <section class="assessment-timer-bar">
      <div>
        <span>${re(a)} timer</span>
        <strong id="assessmentTimer" data-end="${l.toISOString()}">${c}:00</strong>
      </div>
      <p>${a===1?"Technical section: 60 minutes. DISC follows after Stage 1.":"DISC section: 30 minutes. Submit when you finish."}</p>
    </section>
  `}function fa(e,t,a=null){var d,r,u,h;if(!t)return`
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
    `;const s=(e.questions||[]).slice(0,70),n=Math.min(a??Number(e.currentQuestionIndex||0),Math.max(s.length-1,0)),i=s[n],c=((r=(d=e.answers)==null?void 0:d[i.id])==null?void 0:r.value)??((u=e.answers)==null?void 0:u[i.id])??"",l=Array.isArray(i.options)&&i.options.length?i.options:["Strongly agree","Agree","Neutral","Disagree"],p=(h=s[n+1])==null?void 0:h.stage,g=p&&p!==i.stage,y=$e(e,i.stage),f=g&&y.length,A=n+1>=s.length?$e(e,i.stage):[],R=i.multiple?"Multiple choice":"Single choice";return`
    <form id="assessmentQuestionForm" class="assessment-question-card" data-current-index="${n}">
      <div class="assessment-question-meta">
        <span>${$(i.part||i.type)}</span>
        <span>${$(i.bank||"")}</span>
        <span>${R}</span>
      </div>
      ${Number(i.stage||1)===2&&n===s.findIndex(m=>Number(m.stage||1)===2)?'<div class="assessment-stage-divider"><strong>DISC Assessment</strong><span>You finished the Technical Assessment. Continue with the work-style section.</span></div>':""}
      <div class="question-prompt">${$(i.q||"")}</div>
      <fieldset class="assessment-options">
        <legend>${R}</legend>
          ${l.map((m,v)=>`
            <label class="assessment-option">
              <input type="radio" name="answer" value="${v}" ${String(c)===String(v)?"checked":""} />
              <b>${String.fromCharCode(65+v)}</b>
              <span>${$(m)}</span>
            </label>
          `).join("")}
      </fieldset>
      ${f||A.length?ya(e,f?y:A,i.stage):""}
      <p class="field-hint">${g?"After this answer, you will finish the Technical Assessment and enter the DISC Assessment.":"Your progress saves after every question. If you refresh, you will return here."}</p>
      <div class="job-footer">
        <button class="ghost-action" id="prevAssessmentQuestion" type="button" ${n===0?"disabled":""}>${k("arrow-left")} Previous</button>
        <button class="primary-action fit" type="submit">${n+1>=s.length?"Submit assessment":"Next"}</button>
      </div>
    </form>
  `}function ya(e,t,a){if(!t.length)return"";const s=(e.questions||[]).slice(0,70);return`
    <div class="missed-question-prompt">
      <strong>You still have unanswered questions in the ${re(a)}.</strong>
      <p>You missed ${t.map(n=>`Question ${s.findIndex(i=>i.id===n.id)+1}`).join(", ")}. You can go back now or continue if you meant to leave them unanswered.</p>
      <div>${t.map(n=>{const i=s.findIndex(c=>c.id===n.id);return`<button class="ghost-action" type="button" data-assessment-jump="${i}">Go to ${i+1}</button>`}).join("")}</div>
    </div>
  `}function va(e){return!(e!=null&&e.expiresAt)||String(e.status||"").toLowerCase()==="completed"?!1:Date.now()>new Date(e.expiresAt).getTime()}function wa(e){return`
    ${ne("Thank you for completing your assessment","This has been shared successfully with the Nearwork team. We will review it and reach out with next steps.")}
  `}function ba(e,t){return e.length?`
    <section class="section-block page-gap">
      <div class="section-heading"><div><p class="eyebrow">Assessment center</p><h2>Your assessment history</h2></div></div>
      <div class="assessment-history-list">
        ${e.map(a=>`
          <article class="assessment-history-row ${a.id===t?"active":""}">
            <div><strong>${$(a.role||"Nearwork assessment")}</strong><span>${$(a.id||"")}</span></div>
            <div>${$(String(a.status||"assigned"))}</div>
            <a href="/assessment/${encodeURIComponent(a.id)}/start">${a.status==="completed"?"View":"Continue"}</a>
          </article>
        `).join("")}
      </div>
    </section>
  `:""}function Sa(e,t){const a=e.questions||[],s=a.filter(l=>l.stage===1),n=a.filter(l=>l.stage===2),i=s.filter(l=>{var p;return typeof l.correctIndex=="number"&&Number((p=t[l.id])==null?void 0:p.value)===l.correctIndex}).length,c=n.filter(l=>{var p;return te(((p=t[l.id])==null?void 0:p.value)??t[l.id])}).length;return{technicalScore:s.length?Math.round(i/s.length*100):0,discScore:n.length?Math.round(c/n.length*100):0}}function $a(e,t){var l,p;const a={Dominance:0,Influence:0,Steadiness:0,Conscientiousness:0};(e.questions||[]).filter(g=>Number(g.stage)===2).forEach(g=>{var A;const y=(A=t[g.id])==null?void 0:A.value;if(!te(y))return;const f=a[g.skill]!==void 0?g.skill:"Steadiness",C=Math.max(1,4-Number(y||0));a[f]+=C});const s=Object.entries(a).sort((g,y)=>y[1]-g[1]),n=((l=s[0])==null?void 0:l[0])||"Steadiness",i=((p=s[s.length-1])==null?void 0:p[0])||"Dominance";return{label:{Dominance:"D",Influence:"I",Steadiness:"S",Conscientiousness:"C"}[n]||"S",high:n,low:i,scores:a,summary:`${n} is the strongest observed DISC tendency; ${i} appears lowest based on this assessment.`}}async function Ca(e,t){var p,g,y,f,C;const a="https://admin.nearwork.co/api/send-email",s=e.candidateEmail||((p=o.user)==null?void 0:p.email)||((g=o.candidate)==null?void 0:g.email),n=e.candidateName||((y=o.candidate)==null?void 0:y.name)||((f=o.user)==null?void 0:f.displayName)||"there",i=at([e.recruiterEmail,e.stakeholderEmail,e.hiringManagerEmail].filter(Boolean).join(",")),c=[];s&&c.push(fetch(a,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({to:s,templateId:"assessment_completed_candidate",data:{name:n,role:e.role,actionUrl:"https://talent.nearwork.co/assessment",actionText:"Open assessment center"}})}));const l=i.length?i:["support@nearwork.co"];c.push(fetch(a,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({to:l,templateId:"assessment_completed_recruiter",data:{name:"Nearwork team",role:e.role,actionUrl:`https://admin.nearwork.co/assessments/${e.id}/questions`,actionText:"Review assessment",message:`${n} completed the assessment. Overall: ${t.score}%. Technical: ${t.technicalScore}%. DISC: ${((C=t.discProfile)==null?void 0:C.label)||"Submitted"}.`}})})),await Promise.allSettled(c)}function Aa(){var t;const e=((t=o.candidate)==null?void 0:t.cvLibrary)||[];return`
    <section class="section-block">
      <div class="section-heading"><div><p class="eyebrow">CV picker</p><h2>Store multiple resumes</h2></div></div>
      <form id="cvForm" class="upload-box">
        ${k("upload-cloud")}<strong>Upload a CV for this role</strong><p>Save multiple versions and pick the best one for each opening.</p>
        <input name="cv" type="file" accept=".pdf,.doc,.docx" required />
        <input name="label" type="text" placeholder="CV label, e.g. CSM resume" />
        <button class="primary-action fit" type="submit">Upload CV</button>
      </form>
      <div class="cv-list">
        ${e.length?e.map(a=>`<article class="cv-item">${k("file-text")}<div><strong>${a.name||a.fileName}</strong><span>${De(a.uploadedAt)}</span></div>${a.url?`<a href="${a.url}" target="_blank" rel="noreferrer">Open</a>`:""}</article>`).join(""):ne("No CVs saved yet","Upload role-specific resumes here.")}
      </div>
    </section>
  `}function ka(){return`
    <section class="tips-hero"><div><p class="eyebrow">Candidate guide</p><h2>Practical prep for US SaaS interviews.</h2><p>Short, useful guidance candidates can read before recruiter screens, assessments, and client interviews.</p></div></section>
    <section class="tips-grid rich">
      ${zt.map((e,t)=>`
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
  `}function Pa(){var a,s;const t=(((a=o.candidate)==null?void 0:a.recruiter)||{}).bookingUrl||((s=o.candidate)==null?void 0:s.recruiterBookingUrl)||"mailto:support@nearwork.co?subject=Nearwork%20candidate%20question";return`
    <section class="content-grid">
      <div class="section-block"><div class="section-heading"><div><p class="eyebrow">Recruiter</p><h2>Your Nearwork contact</h2></div></div>${dt(!0)}</div>
      <div class="section-block compact"><div class="section-heading"><div><p class="eyebrow">Booking</p><h2>Schedule soon</h2></div></div><p class="muted">Ask the Nearwork recruiting team for the earliest available slot. Candidate booking links can be attached to this profile later.</p><a class="primary-action fit" href="${t}" target="_blank" rel="noreferrer">${k("calendar-plus")} Book recruiter call</a></div>
    </section>
  `}function Na(){return ot("profile")}function ot(e="profile"){var p,g,y,f,C,A,R,d,r,u,h,m;const t=fe(),a=Kt(),s=Z[a.department]||[],n=((p=o.candidate)==null?void 0:p.salaryCurrency)||"USD",i=et(((g=o.candidate)==null?void 0:g.salaryAmount)||((y=o.candidate)==null?void 0:y.salary)||((f=o.candidate)==null?void 0:f.salaryUSD),n),c=Xt(),l=((C=o.candidate)==null?void 0:C.targetRole)||((A=o.candidate)==null?void 0:A.headline)||"";return`
    <section class="section-block">
      <div class="section-heading"><div><p class="eyebrow">${e==="onboarding"?"Setup":"Profile"}</p><h2>${e==="onboarding"?"Complete your account":"Improve your match quality"}</h2></div><span class="profile-score">${Te()}%</span></div>
      <form id="profileForm" class="profile-form">
        <div class="profile-card profile-identity wide">
          ${Ke("large")}
          <label>Profile photo <span class="optional-label">optional</span>
            <input name="photo" type="file" accept="image/png,image/jpeg,image/webp" />
          </label>
        </div>
        <label class="wide">Full name<input name="name" value="${$(((R=o.candidate)==null?void 0:R.name)||((d=o.user)==null?void 0:d.displayName)||"")}" /></label>
        <div class="profile-card wide">
          <div class="field-label">Role applying for</div>
          <div class="profile-card-grid">
            <label>Area
              <select name="roleGroup" id="roleGroupSelect">
                ${ea(c)}
              </select>
            </label>
            <label>Role
              <select name="targetRole" id="targetRoleSelect">
                ${Xe(c,l)}
              </select>
            </label>
          </div>
        </div>
        <div class="profile-card wide">
          <div class="field-label">Location</div>
          <div class="profile-card-grid">
            <label>Department
              <select name="department" id="departmentSelect">
                ${Object.keys(Z).map(v=>`<option value="${$(v)}" ${v===a.department?"selected":""}>${v}</option>`).join("")}
              </select>
            </label>
            <label>City
              <select name="city" id="citySelect">
                ${s.map(v=>`<option value="${$(v)}" ${v===a.city?"selected":""}>${v}</option>`).join("")}
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
            <label>English level<select name="english">${["","B1","B2","C1","C2","Native"].map(v=>{var L;return`<option value="${v}" ${((L=o.candidate)==null?void 0:L.english)===v?"selected":""}>${v||"Select level"}</option>`}).join("")}</select></label>
          </div>
        </div>
        <div class="profile-card wide">
          <div class="field-label">Contact</div>
          <div class="profile-card-grid">
            <label>WhatsApp number
              <input name="whatsapp" value="${$(((r=o.candidate)==null?void 0:r.whatsapp)||((u=o.candidate)==null?void 0:u.phone)||"")}" inputmode="tel" autocomplete="tel" placeholder="+57 300 123 4567" required />
            </label>
            <label>LinkedIn <span class="optional-label">optional</span>
              <input name="linkedin" value="${$(((h=o.candidate)==null?void 0:h.linkedin)||"")}" placeholder="https://linkedin.com/in/..." />
            </label>
          </div>
        </div>
        <div class="profile-card wide">
          <div class="field-label">Skills</div>
          <p class="field-hint">Tap the skills that best match your experience.</p>
          ${ta(t)}
        </div>
        <div class="profile-card wide">
          <div class="field-label">CV</div>
          <p class="field-hint">Upload the CV you want Nearwork to use for your applications.</p>
          <input name="profileCv" type="file" accept=".pdf,.doc,.docx" />
          <input name="profileCvLabel" type="text" placeholder="CV label, e.g. Customer Success CV" />
        </div>
        <label class="wide">Summary <span class="optional-label">optional</span><textarea name="summary" placeholder="Add a short note about what you do best.">${((m=o.candidate)==null?void 0:m.summary)||""}</textarea></label>
        <input type="hidden" name="mode" value="${e}" />
        <button class="primary-action fit" type="submit">${k("save")} ${e==="onboarding"?"Finish setup":"Save profile"}</button>
      </form>
    </section>
  `}function Te(){const e=["name","targetRole","department","city","english","salary","whatsapp"],t=e.filter(a=>{var s,n,i,c;return a==="targetRole"?!!((s=o.candidate)!=null&&s.targetRole||!Ie((n=o.candidate)==null?void 0:n.headline)&&((i=o.candidate)!=null&&i.headline)):!!((c=o.candidate)!=null&&c[a])}).length+(fe().length?1:0);return Math.max(25,Math.round(t/(e.length+1)*100))}function rt(){const e=o.applications[0];return(e==null?void 0:e.stage)||(e==null?void 0:e.status)||"profile"}function ct(e){const t=Math.max(0,Me.findIndex(a=>e==null?void 0:e.toLowerCase().includes(a.key)));return`<div class="pipeline">${Me.map((a,s)=>`<article class="${s<=t?"done":""} ${s===t?"current":""}"><span>${s+1}</span><strong>${a.label}</strong><p>${a.help}</p></article>`).join("")}</div>`}function lt(){return`
    <div class="empty-state">
      ${k("briefcase-business")}
      <strong>No active pipeline yet</strong>
      <p>Browse current openings and apply when you find a role that fits. Nearwork will show a pipeline here after an application moves forward.</p>
      <div class="empty-actions">
        <button class="primary-action fit" type="button" data-page="matches">${k("sparkles")} View matches</button>
        <a class="secondary-action" href="https://jobs.nearwork.co" target="_blank" rel="noreferrer">${k("external-link")} Open jobs</a>
      </div>
    </div>
  `}function de(e,t,a){return`<article class="metric"><span>${k(a)}</span><p>${e}</p><strong>${t}</strong></article>`}function Da(e){const t=ae(e),a=new Set(o.applications.map(s=>s.jobId||s.openingCode)).has(t.code);return`
    <article class="job-card">
      <div><div class="match-pill">${t.match}% match</div><h3>${t.title}</h3><p>${t.orgName} · ${t.location}</p></div>
      <p class="job-description">${t.description}</p>
      <div class="skill-row">${t.skills.slice(0,4).map(s=>`<span>${s}</span>`).join("")}</div>
      <div class="job-footer"><strong>${t.compensation}</strong><button class="secondary-action" type="button" data-apply="${t.code}" ${a?"disabled":""}>${a?"Applied":"Apply"}</button></div>
    </article>
  `}function Ia(e){return`<article class="timeline-item"><span>${k("circle-dot")}</span><div><strong>${e.jobTitle||e.title||"Application"}</strong><p>${e.clientName||e.company||"Nearwork"} · ${e.status||"submitted"}</p><small>${De(e.updatedAt||e.createdAt)}</small></div></article>`}function ee(e,t){return`<article class="info-card"><strong>${e}</strong><p>${t}</p></article>`}function dt(e=!1){var i;const t=((i=o.candidate)==null?void 0:i.recruiter)||{},a=t.email||"support@nearwork.co",s=t.whatsapp||Gt,n=t.whatsappUrl||Vt;return`<article class="recruiter-card"><div class="avatar recruiter-avatar">NW</div><div><strong>${t.name||"Nearwork Support"}</strong><p><a href="mailto:${a}">${a}</a></p><p><a href="${n}" target="_blank" rel="noreferrer">WhatsApp ${s}</a></p>${e?"<span>Questions about assessments, interviews, feedback, or CV selection should go here.</span>":""}</div></article>`}function ne(e,t){return`<div class="empty-state">${k("inbox")}<strong>${e}</strong><p>${t}</p></div>`}function Ta(){Pe.innerHTML='<main class="loading-screen"><span class="logo-mark">N</span><p>Loading Talent...</p></main>'}function xa(){var e,t,a,s,n,i,c,l,p,g,y,f,C,A,R;(e=document.querySelector("#signOut"))==null||e.addEventListener("click",async()=>{await $t(K),z&&z(),z=null,window.history.pushState({page:"overview"},"","/"),w({user:null,candidate:null,applications:[],assessments:[],jobs:[],view:"login",activePage:"overview",message:""})}),(t=document.querySelector("#signIn"))==null||t.addEventListener("click",()=>{window.history.pushState({page:"overview"},"","/"),w({view:"login",activePage:"overview",message:""})}),document.querySelectorAll("[data-page]").forEach(d=>{d.addEventListener("click",()=>pe(d.dataset.page))}),(a=document.querySelector("[data-dashboard-home]"))==null||a.addEventListener("click",()=>pe("overview")),(s=document.querySelector("#notificationBell"))==null||s.addEventListener("click",()=>{w({notificationPanelOpen:!o.notificationPanelOpen,notificationSettingsOpen:!1})}),(n=document.querySelector("#notificationSettings"))==null||n.addEventListener("click",()=>{w({notificationSettingsOpen:!o.notificationSettingsOpen,notificationPanelOpen:!1})}),document.querySelectorAll("[data-notification-read]").forEach(d=>{d.addEventListener("click",async()=>{const r=d.dataset.notificationRead;o.user&&H&&await Bt(r).catch(()=>null),w({notifications:o.notifications.map(u=>u.id===r?{...u,read:!0}:u)})})}),document.querySelectorAll("[data-notification-pref]").forEach(d=>{d.addEventListener("change",async()=>{var m;const r=structuredClone(((m=o.candidate)==null?void 0:m.notificationPreferences)||{}),u=d.dataset.notificationPref,h=d.dataset.channel;r[u]={...r[u]||{},[h]:d.checked},w({candidate:{...o.candidate,notificationPreferences:r}}),o.user&&H&&await Qt(o.user.uid,r).catch(()=>null)})}),document.querySelectorAll("[data-assessment-jump]").forEach(d=>{d.addEventListener("click",async()=>{var L,q,T;const r=Y()||((L=(o.assessments||[])[0])==null?void 0:L.id),u=(o.assessments||[]).find(P=>P.id===r),h=Number(d.dataset.assessmentJump||0),m=(q=u==null?void 0:u.questions)==null?void 0:q[h];if(!r||!m)return;await ce(r,"__progress__","",{currentQuestionIndex:h,totalQuestions:((T=u==null?void 0:u.questions)==null?void 0:T.length)||70,currentStage:m.stage||1}),se(r,h);const v=(o.assessments||[]).map(P=>P.id===r?{...P,currentQuestionIndex:h,currentStage:m.stage||1}:P);w({assessments:v,activePage:"assessment",message:""})})}),document.querySelector("#availability").addEventListener("change",async d=>{const r=d.target.value;w({candidate:{...o.candidate,availability:r}}),o.user&&H?await Ut(o.user.uid,r):w({message:"Sign in with Google to save availability."})}),(i=document.querySelector("#filterMatches"))==null||i.addEventListener("click",()=>{var r,u,h;const d=!!((r=o.candidate)!=null&&r.targetRole||!Ie((u=o.candidate)==null?void 0:u.headline)&&((h=o.candidate)!=null&&h.headline)||fe().length);w({matchesFiltered:d?!o.matchesFiltered:!1,message:d?"":"Add your role and skills in Profile first, then filter openings."})}),(c=document.querySelector("#departmentSelect"))==null||c.addEventListener("change",d=>{const r=document.querySelector("#citySelect"),u=Z[d.target.value]||[];r.innerHTML=u.map(h=>`<option value="${$(h)}">${h}</option>`).join("")}),(l=document.querySelector("#roleGroupSelect"))==null||l.addEventListener("change",d=>{const r=document.querySelector("#targetRoleSelect");r.innerHTML=Xe(d.target.value,"")}),(p=document.querySelector("#salaryCurrencyInput"))==null||p.addEventListener("change",d=>{const r=document.querySelector("#salaryInput");if(!r)return;const u=Ue(r.value,d.target.value);d.target.value=u,r.placeholder=u==="COP"?"5,000,000":"2,500",r.value=qe(r.value,u)}),(g=document.querySelector("#salaryInput"))==null||g.addEventListener("blur",d=>{const r=document.querySelector("#salaryCurrencyInput"),u=Ue(d.target.value,(r==null?void 0:r.value)||"USD");r&&(r.value=u),d.target.placeholder=u==="COP"?"5,000,000":"2,500",d.target.value=qe(d.target.value,u)}),document.querySelectorAll("[data-apply]").forEach(d=>{d.addEventListener("click",async()=>{const r=o.jobs.map(ae).find(u=>u.code===d.dataset.apply);d.disabled=!0,d.textContent="Submitted",o.user&&H?(await Ot(o.user.uid,r),await st(o.user),pe("applications")):w({message:"Sign in with Google to apply to this opening."})})}),(y=document.querySelector("#startAssessment"))==null||y.addEventListener("click",async()=>{var u;const d=Y()||((u=(o.assessments||[])[0])==null?void 0:u.id),r=(o.assessments||[]).find(h=>h.id===d)||(o.assessments||[])[0];if(!d||!o.user){w({message:"Please log in to start your assessment."});return}try{await Mt(d,o.user.uid),se(d,Number((r==null?void 0:r.currentQuestionIndex)||0),!0);const h=(o.assessments||[]).map(m=>m.id===d?{...m,status:"started",startedAt:m.startedAt||new Date().toISOString(),technicalStartedAt:m.technicalStartedAt||new Date().toISOString()}:m);w({assessments:h,activePage:"assessment",message:""})}catch(h){w({message:J(h)})}}),(f=document.querySelector("#prevAssessmentQuestion"))==null||f.addEventListener("click",async()=>{var L,q,T,P;const d=Y()||((L=(o.assessments||[])[0])==null?void 0:L.id),r=(o.assessments||[]).find(F=>F.id===d),u=Number(((q=document.querySelector("#assessmentQuestionForm"))==null?void 0:q.dataset.currentIndex)??(r==null?void 0:r.currentQuestionIndex)??0),h=Math.max(0,u-1),m=(T=r==null?void 0:r.questions)==null?void 0:T[h];await ce(d,"__progress__","",{currentQuestionIndex:h,totalQuestions:((P=r==null?void 0:r.questions)==null?void 0:P.length)||70,currentStage:(m==null?void 0:m.stage)||1}),se(d,h);const v=(o.assessments||[]).map(F=>F.id===d?{...F,currentQuestionIndex:h,currentStage:(m==null?void 0:m.stage)||1}:F);w({assessments:v,activePage:"assessment",message:""})}),(C=document.querySelector("#assessmentQuestionForm"))==null||C.addEventListener("submit",async d=>{var V;d.preventDefault();const r=Y()||((V=(o.assessments||[])[0])==null?void 0:V.id),u=(o.assessments||[]).find(N=>N.id===r),h=(u==null?void 0:u.questions)||[],m=Number(d.currentTarget.dataset.currentIndex??(u==null?void 0:u.currentQuestionIndex)??0),v=h[m],L=new FormData(d.currentTarget).get("answer");if(!v){w({message:"This question could not be loaded. Please refresh and try again."});return}const q=L===null?{value:"",skipped:!0,answeredAt:new Date().toISOString()}:{value:Number(L),skipped:!1,answeredAt:new Date().toISOString()},T={...u.answers||{},[v.id]:q},P=h[m+1],F=P&&Number(P.stage||1)!==Number(v.stage||1),X=$e(u,v.stage,T);try{if((F||m+1>=h.length)&&X.length){await ce(r,v.id,T[v.id],{currentQuestionIndex:m,totalQuestions:h.length,currentStage:v.stage||1});const N=(o.assessments||[]).map(E=>E.id===r?{...E,answers:T,currentQuestionIndex:m,currentStage:v.stage||1,progress:`${m+1}/${h.length}`}:E);w({assessments:N,activePage:"assessment",message:`You missed ${X.length} question${X.length===1?"":"s"} in the ${re(v.stage)}.`});return}if(m+1>=h.length){const N=Sa(u,T),E=$a(u,T);await Rt(r,T,{totalQuestions:h.length,technicalScore:N.technicalScore,discScore:N.discScore,score:Math.round(N.technicalScore*.75+N.discScore*.25),discProfile:E}),Ca(u,{score:Math.round(N.technicalScore*.75+N.discScore*.25),technicalScore:N.technicalScore,discScore:N.discScore,discProfile:E}).catch(O=>console.warn(O));const j=(o.assessments||[]).map(O=>O.id===r?{...O,answers:T,status:"completed",score:Math.round(N.technicalScore*.75+N.discScore*.25),technical:N.technicalScore,disc:E.label,discProfile:E,progress:`${h.length}/${h.length}`}:O);w({assessments:j,activePage:"assessment",message:""})}else{const N=v.stage===1&&(P==null?void 0:P.stage)===2&&!u.discStartedAt,E=N?new Date().toISOString():u.discStartedAt;await ce(r,v.id,T[v.id],{currentQuestionIndex:m+1,totalQuestions:h.length,currentStage:(P==null?void 0:P.stage)||v.stage||1,discStartedAt:N?E:void 0}),se(r,m+1);const j=(o.assessments||[]).map(O=>O.id===r?{...O,answers:T,currentQuestionIndex:m+1,currentStage:(P==null?void 0:P.stage)||v.stage||1,discStartedAt:E,progress:`${m+1}/${h.length}`}:O);w({assessments:j,activePage:"assessment",message:""})}}catch(N){w({message:J(N)})}}),(A=document.querySelector("#profileForm"))==null||A.addEventListener("submit",async d=>{var L,q,T,P,F,X;d.preventDefault();const r=new FormData(d.currentTarget),u=r.get("department"),h=r.get("city"),m=et(r.get("salary"),r.get("salaryCurrency")),v={name:r.get("name"),targetRole:r.get("targetRole"),headline:r.get("targetRole"),department:u,city:h,locationId:`${String(h).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g,"-")}-co`,location:`${h}, ${u}`,locationCity:h,locationDepartment:u,locationCountry:"Colombia",english:r.get("english"),salary:m.salary,salaryUSD:m.salaryUSD,salaryAmount:m.salaryAmount,salaryCurrency:m.salaryCurrency,expectedSalaryAmount:m.salaryAmount,expectedSalaryCurrency:m.salaryCurrency,linkedin:r.get("linkedin"),whatsapp:r.get("whatsapp"),phone:r.get("whatsapp"),skills:[...new Set([...r.getAll("skills"),...Re(r.get("otherSkills"))])],otherSkills:Re(r.get("otherSkills")),summary:r.get("summary"),email:((L=o.candidate)==null?void 0:L.email)||((q=o.user)==null?void 0:q.email)||"",availability:((T=o.candidate)==null?void 0:T.availability)||"open",onboarded:!0};if(!o.user){w({candidate:{...o.candidate,...v},message:"Preview updated. Sign in with Google to save this profile."});return}try{const V=r.get("photo");let N=((P=o.candidate)==null?void 0:P.photoURL)||((F=o.user)==null?void 0:F.photoURL)||"";V!=null&&V.name&&(N=await Ft(o.user.uid,V));const E=r.get("profileCv");let j=null;E!=null&&E.name&&(j=await Le(o.user.uid,E,r.get("profileCvLabel")));const O={...v,photoURL:N,...j?{activeCvId:j.id,activeCvName:j.name||j.fileName,cvLibrary:[...((X=o.candidate)==null?void 0:X.cvLibrary)||[],j]}:{}},ye=await qt(o.user.uid,O),pt=(ye==null?void 0:ye.atsSynced)===!1?"Profile saved. Nearwork will finish connecting it to your workspace.":"Profile saved.";r.get("mode")==="onboarding"?(window.history.pushState({page:"overview"},"","/"),w({candidate:{...o.candidate,...O},activePage:"overview",message:"Profile complete. Welcome to Talent."})):w({candidate:{...o.candidate,...O},message:pt})}catch(V){w({message:J(V)})}}),(R=document.querySelector("#cvForm"))==null||R.addEventListener("submit",async d=>{var h;d.preventDefault();const r=new FormData(d.currentTarget),u=r.get("cv");if(u!=null&&u.name){if(!o.user){w({message:"Sign in with Google to upload and store CVs."});return}try{const m=await Le(o.user.uid,u,r.get("label"));w({candidate:{...o.candidate,cvLibrary:[...((h=o.candidate)==null?void 0:h.cvLibrary)||[],m],activeCvId:m.id},message:"CV uploaded."})}catch(m){w({message:J(m)})}}})}function ut(){if(o.loading)return Ta();if(o.view==="dashboard")return it();nt()}window.addEventListener("popstate",()=>{const e=ge();e==="overview"&&!o.user?w({view:"login",activePage:"overview",message:""}):o.view==="dashboard"?pe(e,!1):me()});H?(yt(K,e=>{e?st(e):me()}),window.setTimeout(()=>{o.loading&&me()},2500)):me();
