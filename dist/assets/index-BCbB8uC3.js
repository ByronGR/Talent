import{initializeApp as wt}from"https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";import{getAuth as St,GoogleAuthProvider as bt,signInWithPopup as Ct,onAuthStateChanged as $t,sendPasswordResetEmail as kt,createUserWithEmailAndPassword as At,updateProfile as Nt,signInWithEmailAndPassword as Pt,signOut as Tt}from"https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";import{getFirestore as Dt,query as G,collection as q,where as V,limit as _,getDocs as H,orderBy as Ee,getDoc as re,doc as I,onSnapshot as It,serverTimestamp as D,setDoc as R,updateDoc as Lt,addDoc as Me,arrayUnion as be}from"https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";import{getStorage as xt,ref as Fe,uploadBytes as Qe,getDownloadURL as Ge}from"https://www.gstatic.com/firebasejs/10.12.5/firebase-storage.js";(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const n of document.querySelectorAll('link[rel="modulepreload"]'))a(n);new MutationObserver(n=>{for(const i of n)if(i.type==="childList")for(const r of i.addedNodes)r.tagName==="LINK"&&r.rel==="modulepreload"&&a(r)}).observe(document,{childList:!0,subtree:!0});function s(n){const i={};return n.integrity&&(i.integrity=n.integrity),n.referrerPolicy&&(i.referrerPolicy=n.referrerPolicy),n.crossOrigin==="use-credentials"?i.credentials="include":n.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function a(n){if(n.ep)return;n.ep=!0;const i=s(n);fetch(n.href,i)}})();const Ve={apiKey:"AIzaSyApRNyW8PoP28E0x77dUB5jOgHuTqA2by4",authDomain:"nearwork-97e3c.firebaseapp.com",projectId:"nearwork-97e3c",storageBucket:"nearwork-97e3c.firebasestorage.app",messagingSenderId:"145642656516",appId:"1:145642656516:web:0ac2da8931283121e87651",measurementId:"G-3LC8N6FFSH"},Y=Object.values(Ve).slice(0,6).every(Boolean),J=Y?wt(Ve):null,T=J?St(J):null,C=J?Dt(J):null,ke=J?xt(J):null,Et=J?new bt:null,$={users:"users",candidates:"candidates",openings:"openings",pipelines:"pipelines",applications:"applications",assessments:"assessments",activity:"candidateActivity",notifications:"notifications",notificationPreferences:"notificationPreferences"},_e="https://admin.nearwork.co/api/send-email";function x(){if(!J||!T||!C||!ke)throw new Error("Missing Firebase environment variables. Copy .env.example to .env.local and fill in the Admin app config.")}async function ze(e={}){var i,r;const t=String(e.email||((i=T==null?void 0:T.currentUser)==null?void 0:i.email)||"").trim().toLowerCase();if(!t)return{ok:!1,skipped:!0,reason:"Missing candidate email"};const s=e.name||((r=T==null?void 0:T.currentUser)==null?void 0:r.displayName)||"",a=e.firstName||s.split(/\s+/)[0]||"there",n=await fetch(_e,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({to:t,templateId:"account_created",data:{name:s||a,firstName:a,actionUrl:"https://talent.nearwork.co"}})});return n.json().catch(()=>({ok:n.ok}))}async function Mt(e={},t={}){var r,l;const s=String(e.email||((r=T==null?void 0:T.currentUser)==null?void 0:r.email)||"").trim().toLowerCase();if(!s)return{ok:!1,skipped:!0,reason:"Missing candidate email"};const a=e.name||((l=T==null?void 0:T.currentUser)==null?void 0:l.displayName)||"",n=e.firstName||a.split(/\s+/)[0]||"there",i=await fetch(_e,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({to:s,templateId:"job_applied",data:{name:a||n,firstName:n,roleTitle:t.title||t.role||t.openingTitle||"this role",openingCode:t.code||t.id||"",actionUrl:"https://talent.nearwork.co"}})});return i.json().catch(()=>({ok:i.ok}))}async function He(e){x();const t=await re(I(C,$.users,e));return t.exists()?{id:t.id,...t.data()}:null}async function Rt(e){x();const t=String(e||"").trim(),s=t.toLowerCase(),a=G(q(C,$.users),V("email","==",s),_(1)),n=await H(a);if(!n.empty)return{id:n.docs[0].id,...n.docs[0].data()};if(t===s)return null;const i=G(q(C,$.users),V("email","==",t),_(1)),r=await H(i);return r.empty?null:{id:r.docs[0].id,...r.docs[0].data()}}async function We(e){const t=await He(e.uid);if(t)return t;const s=await Rt(e.email);return s?(await Ae(e.uid,{...s,email:e.email,connectedFromUserId:s.id}),{...s,id:e.uid,connectedFromUserId:s.id}):null}async function Ae(e,t){x();const s={...t,role:"candidate",updatedAt:D()};await R(I(C,$.users,e),s,{merge:!0}),Pe({...s,candidateCode:t.candidateCode||ce(e),source:"talent.nearwork.co"}).catch(()=>null)}function ce(e){return`CAND-${String(e||"").replace(/[^a-z0-9]/gi,"").slice(0,8).toUpperCase()||Date.now()}`}function Ot(e){return String(e||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"")}function Ne(e,t){const s=t.candidateCode||ce(e),a=t.location||[t.locationCity||t.city,t.locationDepartment||t.department].filter(Boolean).join(", "),n=new Date().toISOString().slice(0,10);return{code:s,uid:e,ownerUid:e,name:t.name||"Talent member",role:t.targetRole||t.headline||"Nearwork candidate",skills:Array.isArray(t.skills)?t.skills:[],applied:t.applied||n,lastContact:t.lastContact||n,experience:Number(t.experience||0),location:a,city:Ot(t.locationCity||t.city||a),department:t.locationDepartment||t.department||"",country:t.locationCountry||"Colombia",source:"talent.nearwork.co",status:t.status||"active",score:Number(t.score||50),email:t.email||"",phone:t.whatsapp||t.phone||"",whatsapp:t.whatsapp||t.phone||"",salary:t.salary||"",salaryUSD:Number(t.salaryUSD||0)||null,salaryAmount:Number(t.salaryAmount||t.expectedSalaryAmount||0)||null,salaryCurrency:t.salaryCurrency||t.expectedSalaryCurrency||"USD",expectedSalaryAmount:Number(t.expectedSalaryAmount||t.salaryAmount||0)||null,expectedSalaryCurrency:t.expectedSalaryCurrency||t.salaryCurrency||"USD",expectedSalary:t.expectedSalary||t.salary||"",availability:t.availability||"open",english:t.english||"",visa:t.visa||"No",linkedin:t.linkedin||"",cv:t.activeCvName||"",tags:t.tags||["talent profile"],notes:t.summary||"",appliedBefore:!!t.appliedBefore,applications:t.applications||[],pipelineCodes:t.pipelineCodes||[],loom:t.loom||"Not uploaded",assessments:t.assessments||[],work:t.work||[],updatedAt:D()}}async function Ut(){x();const e=await Ct(T,Et),t=await We(e.user),s={email:e.user.email,name:e.user.displayName||"",availability:"open",onboarded:!1};t||(await Ae(e.user.uid,s),ze(s).catch(()=>null));const a=ce(e.user.uid),n={...t||s,candidateCode:a};return await R(I(C,$.candidates,a),Ne(e.user.uid,n),{merge:!0}).catch(()=>null),Pe({...n,candidateCode:a,source:"talent.nearwork.co"}).catch(()=>null),e.user}async function qt(e){x();const t=G(q(C,$.applications),V("candidateId","==",e),Ee("updatedAt","desc"),_(20)),s=G(q(C,$.applications),V("ownerUid","==",e),Ee("updatedAt","desc"),_(20)),a=await Promise.allSettled([H(t),H(s)]),n=new Map;return a.forEach(i=>{i.status==="fulfilled"&&i.value.docs.forEach(r=>n.set(r.id,{id:r.id,...r.data()}))}),Array.from(n.values()).sort((i,r)=>{const l=m=>{var d,g;return((g=(d=m==null?void 0:m.toDate)==null?void 0:d.call(m))==null?void 0:g.getTime())??(m?new Date(m).getTime():0)};return l(r.updatedAt||r.createdAt)-l(i.updatedAt||i.createdAt)})}async function Bt(e,t="",s=""){x();const a=String(t||"").trim().toLowerCase(),n=String(s||"").trim(),i=[H(G(q(C,$.assessments),V("candidateUid","==",e),_(25))),H(G(q(C,$.assessments),V("candidateId","==",e),_(25)))];a&&i.push(H(G(q(C,$.assessments),V("candidateEmail","==",a),_(25)))),n&&i.push(H(G(q(C,$.assessments),V("candidateCode","==",n),_(25))));const r=await Promise.allSettled(i),l=new Map;return r.forEach(m=>{m.status==="fulfilled"&&m.value.docs.forEach(d=>l.set(d.id,{id:d.id,...d.data()}))}),Array.from(l.values()).sort((m,d)=>{const g=f=>{var S,k;return((k=(S=f==null?void 0:f.toDate)==null?void 0:S.call(f))==null?void 0:k.getTime())??(f?new Date(f).getTime():0)};return g(d.updatedAt||d.createdAt||d.sentAt)-g(m.updatedAt||m.createdAt||m.sentAt)})}async function jt(e,t,s="",a=""){x();const n=await re(I(C,$.assessments,e));if(!n.exists())return null;const i={id:n.id,...n.data()},r=String(s||"").trim().toLowerCase(),l=String(a||"").trim();return i.candidateUid===t||i.candidateId===t||String(i.candidateEmail||"").trim().toLowerCase()===r||String(i.candidateCode||"").trim()===l?i:null}async function Ft(e,t){x();const s=await re(I(C,$.assessments,e)),a=s.exists()?s.data():{};if(a.status==="completed")throw new Error("This assessment is already completed.");if(a.expiresAt&&Date.now()>new Date(a.expiresAt).getTime())throw new Error("This assessment link has expired.");await R(I(C,$.assessments,e),{status:"started",currentQuestionIndex:Number(a.currentQuestionIndex||0),currentStage:Number(a.currentStage||1),technicalStartedAt:a.technicalStartedAt||D(),startedAt:a.startedAt||D(),updatedAt:D()},{merge:!0})}async function ue(e,t,s,a={}){x();const n=await re(I(C,$.assessments,e)),i=n.exists()?n.data():{};if(i.status==="completed")throw new Error("This assessment is already completed.");if(i.expiresAt&&Date.now()>new Date(i.expiresAt).getTime())throw new Error("This assessment link has expired.");await R(I(C,$.assessments,e),{[`answers.${t}`]:s,progress:`${a.currentQuestionIndex||0}/${a.totalQuestions||""}`.replace(/\/$/,""),currentQuestionIndex:a.currentQuestionIndex||0,currentStage:a.currentStage||1,...a.discStartedAt?{discStartedAt:a.discStartedAt}:{},updatedAt:D()},{merge:!0})}async function Qt(e,t,s={}){var S;x();const a=I(C,$.assessments,e),n=await re(a),i=n.exists()?n.data():{};if(i.status==="completed")throw new Error("This assessment is already completed.");if(i.expiresAt&&Date.now()>new Date(i.expiresAt).getTime())throw new Error("This assessment link has expired.");const r=Object.values(t||{}).filter(k=>String((k==null?void 0:k.value)??k??"").trim()).length,l=Number(s.totalQuestions||Object.keys(t||{}).length||0),m=Number(s.technicalScore||0),d=Number(s.discScore||0),g=Number(s.score||(l?Math.round(r/l*100):0));await R(a,{answers:t,answeredCount:r,totalQuestions:l,score:g,technical:m||g,disc:((S=s.discProfile)==null?void 0:S.label)||(d?`${d}%`:"Submitted"),discScore:d,discProfile:s.discProfile||null,progress:`${r}/${l}`,status:"completed",finished:new Date().toLocaleString("en-US",{month:"short",day:"numeric",year:"numeric",hour:"numeric",minute:"2-digit"}),finishedAt:D(),updatedAt:D()},{merge:!0});const f=Math.round(g);i.candidateUid&&await R(I(C,$.users,i.candidateUid),{score:f,nwScore:f,lastAssessmentScore:f,lastAssessmentId:e,updatedAt:D()},{merge:!0}).catch(()=>null),i.candidateCode&&await R(I(C,$.candidates,i.candidateCode),{score:f,nwScore:f,lastAssessmentScore:f,lastAssessmentId:e,updatedAt:D()},{merge:!0}).catch(()=>null)}async function Ye(){x();const e=G(q(C,$.openings),V("published","==",!0),_(12));return(await H(e)).docs.map(s=>({id:s.id,...s.data()}))}async function Gt(e,t){x();const s=t.code||t.id,a=await He(e).catch(()=>null),n={candidateId:e,candidateCode:(a==null?void 0:a.candidateCode)||ce(e),candidateEmail:(a==null?void 0:a.email)||"",candidateName:(a==null?void 0:a.name)||"",openingCode:s,jobId:s,jobTitle:t.title||t.role||"Untitled role",clientName:t.orgName||t.clientName||t.company||"Nearwork client",status:"submitted",source:"talent.nearwork.co",createdAt:D(),updatedAt:D()};await Me(q(C,$.applications),n),await R(I(C,$.candidates,n.candidateCode),{...Ne(e,{...a||{},candidateCode:n.candidateCode,applications:be(s),appliedBefore:!0,lastContact:new Date().toISOString().slice(0,10)}),applications:be(s),appliedBefore:!0},{merge:!0}).catch(()=>null),await Me(q(C,$.activity),{candidateId:e,type:"application_submitted",title:n.jobTitle,createdAt:D()}).catch(()=>null),Mt(a,t).catch(()=>null)}async function Vt(e,t){await Lt(I(C,$.users,e),{availability:t,updatedAt:D()})}async function _t(e,t){x();const s=t.candidateCode||ce(e);await R(I(C,$.users,e),{...t,candidateCode:s,role:"candidate",updatedAt:D()},{merge:!0});try{return await R(I(C,$.candidates,s),Ne(e,{...t,candidateCode:s}),{merge:!0}),Pe({...t,candidateCode:s,source:"talent.nearwork.co"}).catch(()=>null),{candidateCode:s,atsSynced:!0}}catch(a){return console.warn("Candidate ATS sync failed.",a),{candidateCode:s,atsSynced:!1}}}async function Pe(e){var a;const t=(e==null?void 0:e.email)||((a=T.currentUser)==null?void 0:a.email)||"";return t?(await fetch("/api/sync-hubspot-candidate",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({candidate:{...e,email:t}})})).json().catch(()=>({ok:!1})):{ok:!1,skipped:!0}}async function zt(e,t){x();const s=t.name.replace(/[^a-z0-9._-]/gi,"-").toLowerCase(),a=`candidate-photos/${e}/${Date.now()}-${s}`,n=Fe(ke,a);await Qe(n,t,{contentType:t.type||"application/octet-stream"});const i=await Ge(n);return await R(I(C,$.users,e),{photoURL:i,updatedAt:D()},{merge:!0}),i}async function Re(e,t,s){x();const a=t.name.replace(/[^a-z0-9._-]/gi,"-").toLowerCase(),n=`candidate-cvs/${e}/${Date.now()}-${a}`,i=Fe(ke,n);await Qe(i,t,{contentType:t.type||"application/octet-stream"});const r=await Ge(i),l={id:n,name:s||t.name,fileName:t.name,url:r,uploadedAt:new Date().toISOString()};return await R(I(C,$.users,e),{cvLibrary:be(l),activeCvId:l.id,activeCvName:l.name||l.fileName,updatedAt:D()},{merge:!0}),l}function Ht(e,t){if(x(),!e)return()=>{};const s=G(q(C,$.notifications),V("recipientUid","==",e),_(50));return It(s,a=>{const n=a.docs.map(i=>({id:i.id,...i.data()})).sort((i,r)=>{var d,g;const l=(d=i.createdAt)!=null&&d.toDate?i.createdAt.toDate().getTime():new Date(i.createdAt||0).getTime();return((g=r.createdAt)!=null&&g.toDate?r.createdAt.toDate().getTime():new Date(r.createdAt||0).getTime())-l});t(n)})}async function Wt(e){x(),e&&await R(I(C,$.notifications,e),{read:!0,readAt:D()},{merge:!0})}async function Yt(e,t){x(),await R(I(C,$.notificationPreferences,e),{uid:e,app:"talent.nearwork.co",preferences:t,updatedAt:D()},{merge:!0})}const Te=document.querySelector("#app"),Jt="+573135928691",Kt="https://wa.me/573135928691",ge=[{id:"OPEN-CSM-DEMO",code:"OPEN-CSM-DEMO",title:"Customer Success Manager",orgName:"US SaaS company",location:"Remote, Colombia",compensation:"$2,000-$2,800/mo USD",match:94,skills:["SaaS","Customer Success","English C1","QBRs"],description:"Own onboarding, adoption, renewals, and expansion for a portfolio of US-based SaaS clients."},{id:"OPEN-SDR-DEMO",code:"OPEN-SDR-DEMO",title:"SDR / Sales Development Rep",orgName:"B2B marketplace",location:"Remote",compensation:"$1,700-$2,200/mo USD",match:89,skills:["HubSpot","Outbound","Salesforce","English C1"],description:"Qualify outbound leads, book demos, and work closely with a high-performing US sales team."},{id:"OPEN-SUP-DEMO",code:"OPEN-SUP-DEMO",title:"Technical Support Specialist",orgName:"Cloud workflow platform",location:"Remote, LatAm",compensation:"$1,400-$1,900/mo USD",match:86,skills:["Technical Support","APIs","Tickets","Troubleshooting"],description:"Handle Tier 1 and Tier 2 support, troubleshoot product issues, and maintain excellent CSAT."}],oe={"Customer Success":["Customer Success Manager","Customer Success Associate","Account Manager","Implementation Specialist","Onboarding Specialist","Renewals Manager"],Sales:["SDR / Sales Development Rep","BDR / Business Development Rep","Account Executive","Sales Operations Specialist","Sales Manager"],Support:["Technical Support Specialist","Customer Support Representative","Support Team Lead","QA Support Analyst"],Operations:["Operations Manager","Operations Analyst","Executive Assistant","Virtual Assistant","Project Coordinator","Recruiting Coordinator"],Marketing:["Marketing Ops / Content Specialist","Content Writer","SEO Specialist","Lifecycle Marketing Specialist","Social Media Manager"],Engineering:["Software Developer (Full Stack)","Frontend Developer","Backend Developer","No-Code Developer","Data Analyst","QA Engineer"],Finance:["Bookkeeper","Accounting Assistant","Financial Analyst","Payroll Specialist"]},Zt={"CRM & Sales":["HubSpot","Salesforce","Pipedrive","Apollo","Outbound","Cold Email","Discovery Calls","CRM Hygiene"],"Customer Success":["SaaS","Customer Success","QBRs","Onboarding","Renewals","Expansion","Churn Reduction","Intercom","Zendesk"],Support:["Technical Support","Tickets","Troubleshooting","APIs","Bug Reproduction","Help Center","CSAT"],Operations:["Excel","Google Sheets","Reporting","Process Design","Project Management","Notion","Airtable","Zapier"],Marketing:["Content","SEO","Lifecycle","Email Marketing","HubSpot Marketing","Copywriting","Analytics"],Engineering:["JavaScript","React","Node.js","SQL","Python","REST APIs","QA","GitHub"],Language:["English B2","English C1","English C2","Spanish Native"]},Xt=["Account Management","Accounts Payable","Accounts Receivable","Adobe Creative Suite","Agile","AI Tools","Analytics","Appointment Setting","B2B Sales","B2C Sales","Billing","Bookkeeping","Business Analysis","Canva","Cash Collections","Chat Support","Cold Calling","Community Management","Compliance","Content Strategy","Contract Management","Customer Onboarding","Customer Retention","Customer Service","Data Analysis","Data Entry","Email Support","Excel / Google Sheets","Executive Assistance","Figma","Financial Reporting","Forecasting","Helpdesk","HR Operations","Inbound Calls","Insurance Support","Lead Generation","Live Chat","Logistics","Looker","Microsoft Office","NetSuite","Outbound Calls","Payroll","Performance Marketing","Power BI","Product Support","QuickBooks","Recruiting","Salesforce Administration","Sales Operations","Shopify","Slack","Social Media","SQL Reporting","Stripe","Tableau","Technical Writing","Ticket Quality","Training","Vendor Management","WordPress","Workday","Workforce Management","Zendesk Guide","Zoho"],Je=[...new Set([...Object.values(Zt).flat(),...Xt])].sort((e,t)=>e.localeCompare(t)),Ke={Amazonas:["Leticia","Puerto Nariño"],Antioquia:["Medellín","Abejorral","Apartadó","Bello","Caldas","Caucasia","Copacabana","El Carmen de Viboral","Envigado","Girardota","Itagüí","La Ceja","La Estrella","Marinilla","Rionegro","Sabaneta","Santa Fe de Antioquia","Turbo"],Arauca:["Arauca","Arauquita","Saravena","Tame"],Atlántico:["Barranquilla","Baranoa","Galapa","Malambo","Puerto Colombia","Sabanalarga","Soledad"],"Bogotá D.C.":["Bogotá"],Bolívar:["Cartagena","Arjona","El Carmen de Bolívar","Magangué","Mompox","Turbaco"],Boyacá:["Tunja","Chiquinquirá","Duitama","Paipa","Sogamoso","Villa de Leyva"],Caldas:["Manizales","Aguadas","Chinchiná","La Dorada","Riosucio","Villamaría"],Caquetá:["Florencia","El Doncello","Puerto Rico","San Vicente del Caguán"],Casanare:["Yopal","Aguazul","Paz de Ariporo","Villanueva"],Cauca:["Popayán","El Tambo","Puerto Tejada","Santander de Quilichao"],Cesar:["Valledupar","Aguachica","Bosconia","Codazzi"],Chocó:["Quibdó","Istmina","Nuquí","Tadó"],Córdoba:["Montería","Cereté","Lorica","Sahagún"],Cundinamarca:["Chía","Cajicá","Facatativá","Fusagasugá","Girardot","Madrid","Mosquera","Soacha","Tocancipá","Zipaquirá"],Guainía:["Inírida"],Guaviare:["San José del Guaviare","Calamar","El Retorno","Miraflores"],Huila:["Neiva","Garzón","La Plata","Pitalito"],"La Guajira":["Riohacha","Maicao","San Juan del Cesar","Uribia"],Magdalena:["Santa Marta","Ciénaga","El Banco","Fundación"],Meta:["Villavicencio","Acacías","Granada","Puerto López"],Nariño:["Pasto","Ipiales","Tumaco","Túquerres"],"Norte de Santander":["Cúcuta","Ocaña","Pamplona","Villa del Rosario"],Putumayo:["Mocoa","Orito","Puerto Asís","Valle del Guamuez"],Quindío:["Armenia","Calarcá","La Tebaida","Montenegro","Quimbaya"],Risaralda:["Pereira","Dosquebradas","La Virginia","Santa Rosa de Cabal"],"San Andrés y Providencia":["San Andrés","Providencia"],Santander:["Bucaramanga","Barrancabermeja","Floridablanca","Girón","Piedecuesta","San Gil"],Sucre:["Sincelejo","Corozal","Sampués","Tolú"],Tolima:["Ibagué","Espinal","Honda","Melgar"],"Valle del Cauca":["Cali","Buga","Buenaventura","Cartago","Jamundí","Palmira","Tuluá","Yumbo"],Vaupés:["Mitú"],Vichada:["Puerto Carreño","La Primavera","Santa Rosalía"]};let X=Ke;const ea=[{title:"How to answer salary questions",tag:"Interview",read:"4 min",body:"Use a confident range, anchor it to the role, and avoid apologizing for earning in USD.",actions:["Know your floor","Use monthly USD","Mention flexibility last"]},{title:"Writing a CV for US SaaS companies",tag:"CV",read:"6 min",body:"Translate local experience into metrics US hiring managers can scan in under a minute.",actions:["Lead with outcomes","Add tools","Quantify scope"]},{title:"Before your recruiter screen",tag:"Process",read:"3 min",body:"Prepare availability, compensation, English comfort, and two strong role stories.",actions:["Check your setup","Review the opening","Bring questions"]},{title:"STAR stories that feel natural",tag:"Interview",read:"5 min",body:"Keep stories specific, concise, and tied to business impact instead of job duties.",actions:["Situation","Action","Result"]}],Oe=[{key:"profile-review",label:"Profile Review",help:"We are checking role fit and your candidate profile."},{key:"background-check",label:"Background Checks",help:"Nearwork is verifying relevant background and work details."},{key:"assessment",label:"Assessment",help:"Complete role-specific questions when assigned."},{key:"interview",label:"Interview",help:"Meet the recruiter and book your next conversation."},{key:"presented",label:"Presented",help:"Your profile has been prepared for the company."},{key:"client-review",label:"Client Review",help:"The company is reviewing your profile and next steps."},{key:"hired",label:"Hired",help:"Offer accepted and onboarding is ready to begin."}];let o={user:null,candidate:null,applications:[],assessments:[],notifications:[],notificationPanelOpen:!1,notificationSettingsOpen:!1,jobs:[],loading:!0,view:"login",activePage:"overview",matchesFiltered:!1,message:""},W=null;const we=sessionStorage.getItem("nw_restore_path");we&&(sessionStorage.removeItem("nw_restore_path"),window.history.replaceState({page:we},"",we));function De(){return[["overview","layout-dashboard","Overview"],["matches","briefcase-business","Matches"],["applications","send","Applications"],["assessment","clipboard-check","Assessment"],["cvs","files","CV Picker"],["tips","book-open","Tips"],["recruiter","calendar-days","Recruiter"],["profile","user-round-cog","Profile"]]}function ye(){const t=window.location.pathname.split("/").filter(Boolean)[0];return t==="onboarding"?"onboarding":t==="assessment"||t==="assessments"?"assessment":De().some(([s])=>s===t)?t:"overview"}function K(){const e=window.location.pathname.split("/").filter(Boolean);return(e[0]==="assessment"||e[0]==="assessments")&&e[1]||""}function Ze(){const e=window.location.pathname.split("/").filter(Boolean),t=e.findIndex(a=>a==="q"||a==="question");if(t===-1)return null;const s=Number(e[t+1]);return Number.isFinite(s)&&s>0?s-1:null}function ta(e,t=0){return`/assessment/${encodeURIComponent(e)}/start/q/${Number(t||0)+1}`}function ie(e,t=0,s=!1){const a=ta(e,t);if(window.location.pathname===a)return;const n=s?"replaceState":"pushState";window.history[n]({page:"assessment",assessmentId:e,questionIndex:t},"",a)}function A(e,t){return`<i data-lucide="${e}" aria-label="${e}"></i>`}function Xe(){window.lucide&&window.lucide.createIcons()}function w(e){o={...o,...e},yt()}function he(e,t=!0){const a=e==="onboarding"||De().some(([n])=>n===e)?e:"overview";o={...o,activePage:a,matchesFiltered:a==="matches"?o.matchesFiltered:!1,message:""},t&&window.history.pushState({page:a},"",a==="overview"?"/":`/${a}`),yt()}function et(){var t,s;return(((t=o.candidate)==null?void 0:t.name)||((s=o.user)==null?void 0:s.displayName)||"there").split(" ")[0]||"there"}function aa(){var t,s,a;return(((t=o.candidate)==null?void 0:t.name)||((s=o.user)==null?void 0:s.displayName)||((a=o.user)==null?void 0:a.email)||"NW").split(/[ @.]/).filter(Boolean).slice(0,2).map(n=>n[0]).join("").toUpperCase()}function tt(e="normal"){var a,n;const t=((a=o.candidate)==null?void 0:a.photoURL)||((n=o.user)==null?void 0:n.photoURL)||"",s=e==="large"?"avatar avatar-large":"avatar";return t?`<img class="${s}" src="${b(t)}" alt="${b(et())}" />`:`<div class="${s}">${aa()}</div>`}function b(e){return String(e||"").replaceAll("&","&amp;").replaceAll('"',"&quot;").replaceAll("<","&lt;").replaceAll(">","&gt;")}function Ie(e){if(!e)return"Recently";const t=e.toDate?e.toDate():new Date(e);return new Intl.DateTimeFormat("en",{month:"short",day:"numeric"}).format(t)}function le(){var t;const e=((t=o.candidate)==null?void 0:t.skills)||[];return Array.isArray(e)?e:String(e).split(",").map(s=>s.trim()).filter(Boolean)}function U(e){return String(e||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/&/g," and ").replace(/[^a-z0-9]+/g," ").trim().replace(/\s+/g," ")}function at(e,t=le()){const s=ee(e),a=new Set((s.skills||[]).map(U).filter(Boolean)),n=new Map(t.map(i=>[U(i),i]).filter(([i])=>i));return[...n.keys()].filter(i=>a.has(i)).map(i=>n.get(i))}function nt(e){return["Nearwork candidate","Preview mode","Talent member"].includes(String(e||"").trim())}function na(){return xe()>=100}function Ue(e){if(!e)return null;if(e.toDate)return e.toDate();if(typeof e=="object"&&typeof e.seconds=="number")return new Date(e.seconds*1e3);const t=new Date(e);return Number.isNaN(t.getTime())?null:t}function de(e){return Number(e||1)===1?"Technical Assessment":"DISC Assessment"}function Se(e,t){var s,a,n;return((a=(s=e==null?void 0:e.answers)==null?void 0:s[t==null?void 0:t.id])==null?void 0:a.value)??((n=e==null?void 0:e.answers)==null?void 0:n[t==null?void 0:t.id])??""}function ne(e){return e!=null&&e!==""}function Ce(e,t){return((e==null?void 0:e.questions)||[]).slice(0,70).filter(s=>Number(s.stage||1)===Number(t))}function $e(e,t,s=(e==null?void 0:e.answers)||{}){return Ce(e,t).filter(a=>{var n;return!ne(((n=s[a.id])==null?void 0:n.value)??s[a.id])})}function st(){var e,t;return!!((o.applications||[]).length||(((e=o.candidate)==null?void 0:e.pipelineCodes)||[]).length||(t=o.candidate)!=null&&t.pipelineCode)}function sa(){var a,n,i;const e=((a=o.candidate)==null?void 0:a.department)||"Bogotá D.C.",t=X[e]||X["Bogotá D.C."]||["Bogotá"],s=((n=o.candidate)==null?void 0:n.city)||((i=o.candidate)==null?void 0:i.locationCity)||t[0];return{department:e,city:s,label:`${s}, ${e}`}}async function ia(){try{const e=await fetch("/api/locations?ts="+Date.now(),{cache:"no-store"}),t=await e.json();if(!e.ok||!t.ok||!t.departments)throw new Error(t.error||"Location API unavailable");X=t.departments}catch(e){console.warn("Using bundled Colombia locations:",e.message||e),X=Ke}}function oa(){var t,s,a;const e=((t=o.candidate)==null?void 0:t.targetRole)||((s=o.candidate)==null?void 0:s.headline)||"";return((a=Object.entries(oe).find(([,n])=>n.includes(e)))==null?void 0:a[0])||Object.keys(oe)[0]}function ra(e){return Object.keys(oe).map(t=>`<option value="${b(t)}" ${t===e?"selected":""}>${t}</option>`).join("")}function it(e,t){const s=oe[e]||Object.values(oe).flat();return['<option value="">Choose the closest role</option>'].concat(s.map(a=>`<option value="${b(a)}" ${t===a?"selected":""}>${a}</option>`)).join("")}function Le(e){const t=String(e||"").trim();if(!t)return"";const s=Je.find(a=>U(a)===U(t));return s||t.split(/\s+/).map(a=>a.length<=3&&a===a.toUpperCase()?a:a.charAt(0).toUpperCase()+a.slice(1).toLowerCase()).join(" ")}function ca(e){const t=[...new Set((e||[]).map(Le).filter(Boolean))],s=["Customer Service","Salesforce","HubSpot","Excel","Google Sheets","Technical Support","Outbound Calls","React","SQL","Payroll"];return`
    <div class="skill-search-shell" data-skill-search>
      <div class="selected-skills" id="selectedSkills">
        ${t.map(a=>`
          <span class="selected-skill" data-skill-chip="${b(a)}">
            ${escapeHtml(a)}
            <button type="button" class="skill-remove" data-remove-skill="${b(a)}" aria-label="Remove ${b(a)}">×</button>
            <input type="hidden" name="skills" value="${b(a)}" />
          </span>
        `).join("")||'<span class="skill-empty">Selected skills will appear here.</span>'}
      </div>
      <div class="skill-search-box">
        <input id="skillSearchInput" type="search" autocomplete="off" placeholder="Search skills like Salesforce, payroll, React, B2B sales..." />
        <button class="secondary-action" type="button" id="addTypedSkill">Add skill</button>
      </div>
      <div class="skill-suggestions" id="skillSuggestions">
        ${s.map(a=>`<button type="button" class="skill-suggestion" data-skill="${b(a)}">${escapeHtml(a)}</button>`).join("")}
      </div>
      <p class="field-hint">Search, select, and remove skills anytime. Use as many as apply to your experience.</p>
    </div>
  `}function ot(e,t="USD"){const s=Number(String(e||"").replace(/[^\d.]/g,"")),a=String(t||"USD").toUpperCase()==="COP"?"COP":"USD";if(!Number.isFinite(s)||s<=0)return{salary:"",salaryUSD:null,salaryCurrency:a,salaryAmount:null};const n=Math.round(s);return{salary:`${a} ${new Intl.NumberFormat("en-US").format(n)}/mo`,salaryUSD:a==="USD"?n:null,salaryCurrency:a,salaryAmount:n}}function rt(e){return Number(String(e||"").replace(/[^\d.]/g,""))}function qe(e,t="USD"){const s=rt(e),a=String(t||"USD").toUpperCase()==="COP"?"COP":"USD";return a==="USD"&&s>=1e5?"COP":a}function Be(e,t="USD"){const s=rt(e);return!Number.isFinite(s)||s<=0?"":new Intl.NumberFormat("en-US",{maximumFractionDigits:0}).format(Math.round(s))}function ct(e){return Array.isArray(e)?e:String(e||"").split(",").map(t=>t.trim()).filter(Boolean)}function ee(e){const t=ct(e.skills||e.requiredSkills);return{id:e.id||e.code,code:e.code||e.id,title:e.title||e.role||e.openingTitle||"Open role",orgName:e.orgName||e.company||e.clientName||"Nearwork client",location:e.location||"Remote",compensation:e.compensation||e.salary||e.rate||"Competitive",match:e.match||82,skills:t,description:e.description||e.about||"Nearwork is reviewing candidates for this role now."}}function Z(e){const t=(e==null?void 0:e.code)||"";return t.includes("operation-not-allowed")?"This sign-in method is not available yet.":t.includes("unauthorized-domain")?"This website still needs to be approved for sign-in.":t.includes("permission-denied")?"We could not save this yet. Please try again in a moment or contact Nearwork support.":t.includes("weak-password")?"Password must be at least 6 characters.":t.includes("invalid-credential")||t.includes("wrong-password")?"That email/password did not match. If this account was created with Google, use Continue with Google.":t.includes("user-not-found")?"No account exists for that email yet.":t.includes("email-already-in-use")?"That email already has an account. Sign in or use Google.":t.includes("popup")?"The Google sign-in popup was closed before finishing.":"Something went wrong. Please try again or contact Nearwork support."}function la(e){Te.innerHTML=`
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
  `,Xe()}function lt(e="login"){var s;const t=e==="signup";la(`
    <section class="auth-panel">
      <div class="right-brand">Near<span>work</span></div>
      <div class="candidate-chip">For candidates</div>
      <div class="panel-heading">
        <h2>${t?"Create your account.":"Welcome back."}</h2>
        <p>${t?"Create your profile, browse roles, and track your application.":"Use Google if your candidate account was created with Google."}</p>
      </div>
      ${o.message?`<div class="notice">${A("lock")} ${b(o.message)}</div>`:""}
      ${Y?"":`<div class="notice">${A("triangle-alert")} Sign-in is still being set up.</div>`}
      <button id="googleSignIn" class="social-action" type="button">
        <span class="google-dot">G</span>
        Continue with Google
      </button>
      <div class="divider"><span></span>or use email<span></span></div>
      <form id="authForm" class="stacked-form">
        ${t?'<label>Full name<input name="name" type="text" autocomplete="name" placeholder="Byron Giraldo" required /></label>':""}
        <label>Email<input name="email" type="email" autocomplete="email" placeholder="you@example.com" required /></label>
        <label>Password<input name="password" type="password" autocomplete="${t?"new-password":"current-password"}" minlength="6" placeholder="••••••••" required /></label>
        <button class="primary-action" type="submit">${A(t?"user-plus":"log-in")} ${t?"Create account":"Sign in"}</button>
        <p id="formMessage" class="form-message" role="status"></p>
      </form>
      ${t?"":'<button id="resetPassword" class="text-action small" type="button">Forgot password?</button>'}
      <button id="toggleMode" class="text-action" type="button">${t?"Already have an account? Sign in":"New or invited by Nearwork? Create your profile"}</button>
    </section>
  `),document.querySelector("#toggleMode").addEventListener("click",()=>lt(t?"login":"signup")),document.querySelector("#googleSignIn").addEventListener("click",async()=>{const a=document.querySelector("#formMessage");a.textContent="";try{await Ut()}catch(n){a.textContent=Z(n)}}),(s=document.querySelector("#resetPassword"))==null||s.addEventListener("click",async()=>{const a=document.querySelector("input[name='email']").value.trim().toLowerCase(),n=document.querySelector("#formMessage");if(!a){n.textContent="Enter your email first, then request a reset link.";return}try{await kt(T,a),n.textContent=`Password reset sent to ${a}.`}catch(i){n.textContent=Z(i)}}),document.querySelector("#authForm").addEventListener("submit",async a=>{a.preventDefault();const n=new FormData(a.currentTarget),i=document.querySelector("#formMessage"),r=String(n.get("email")).trim().toLowerCase();i.textContent="";try{if(t){const l=await At(T,r,n.get("password"));await Nt(l.user,{displayName:n.get("name")}),sessionStorage.setItem("nw_new_account","1"),await Ae(l.user.uid,{name:n.get("name"),email:r,availability:"open",headline:"Nearwork candidate",onboarded:!1}),ze({name:n.get("name"),firstName:String(n.get("name")||"").trim().split(/\s+/)[0],email:r}).catch(()=>null)}else await Pt(T,r,n.get("password"))}catch(l){i.textContent=Z(l)}})}async function dt(e){w({loading:!0,user:e});try{await ia();const[t,s,a]=await Promise.allSettled([We(e),qt(e.uid),Ye()]),n=t.status==="fulfilled"?t.value:null,i=s.status==="fulfilled"?s.value:[],r=a.status==="fulfilled"?a.value:ge;let l=[];try{l=await Bt(e.uid,e.email,(n==null?void 0:n.candidateCode)||(n==null?void 0:n.code)||"")}catch(f){console.warn(f)}const m=K();if(m&&!l.some(f=>f.id===m)){const f=await jt(m,e.uid,e.email,(n==null?void 0:n.candidateCode)||(n==null?void 0:n.code)||"").catch(()=>null);f&&(l=[f,...l])}const d=sessionStorage.getItem("nw_new_account")==="1";d&&sessionStorage.removeItem("nw_new_account");const g=d&&(n==null?void 0:n.onboarded)!==!0?"onboarding":ye();w({candidate:{...n||{},name:(n==null?void 0:n.name)||e.displayName||"Talent member",email:(n==null?void 0:n.email)||e.email,availability:(n==null?void 0:n.availability)||"open",headline:(n==null?void 0:n.headline)||(n==null?void 0:n.targetRole)||"Nearwork candidate"},applications:i,assessments:l,jobs:r.length?r.map(ee):ge,loading:!1,view:"dashboard",activePage:g,message:""}),W&&W(),Y&&(W=Ht(e.uid,f=>{o.notifications=f,o.view==="dashboard"&&ut()}))}catch(t){console.warn(t),w({candidate:{name:e.displayName||"Talent member",email:e.email,availability:"open",headline:"Nearwork candidate"},applications:[],assessments:[],jobs:ge,loading:!1,view:"dashboard",activePage:ye(),message:""})}}async function fe(){const e=ye();if(e==="assessment"){sessionStorage.setItem("nw_restore_path",window.location.pathname),w({user:null,candidate:null,applications:[],assessments:[],jobs:[],loading:!1,view:"login",activePage:"overview",message:"Please log in to open your assessment."});return}if(e==="overview"){W&&W(),W=null,w({user:null,candidate:null,loading:!1,view:"login",activePage:"overview"});return}let t=ge;try{const s=await Ye();s.length&&(t=s.map(ee))}catch(s){console.warn(s)}w({user:null,candidate:{name:"Guest candidate",availability:"open",headline:"Preview mode"},applications:[],assessments:[],jobs:t,loading:!1,view:"dashboard",activePage:e,message:"Preview mode. Sign in with Google to save your profile, apply, upload CVs, or track your actual pipeline."})}function ut(){var t,s,a,n;const e=(o.notifications||[]).filter(i=>!i.read).length;Te.innerHTML=`
    <main class="dashboard">
      <aside class="sidebar">
        <div class="brand-top"><button class="wordmark wordmark-button" type="button" data-dashboard-home>Near<span>work</span></button></div>
        <div class="candidate-card">
          ${tt()}
          <strong>${((t=o.candidate)==null?void 0:t.name)||((s=o.user)==null?void 0:s.displayName)||"Talent member"}</strong>
          <span>${((a=o.candidate)==null?void 0:a.headline)||((n=o.candidate)==null?void 0:n.targetRole)||"Nearwork candidate"}</span>
        </div>
        <nav>
          ${De().map(([i,r,l])=>`
            <button class="${o.activePage===i?"active":""}" data-page="${i}">${A(r)} ${l}</button>
          `).join("")}
        </nav>
        <button id="${o.user?"signOut":"signIn"}" class="ghost-action">${A(o.user?"log-out":"log-in")} ${o.user?"Sign out":"Sign in"}</button>
      </aside>
      <section class="workspace">
        <header class="topbar">
          <div><p class="eyebrow">Candidate workspace</p><h1>${ha()}</h1></div>
          <div class="topbar-actions">
            <div class="notification-wrap">
              <button class="icon-action" type="button" id="notificationBell" aria-label="Notifications">${A("bell")}${e?`<span>${e}</span>`:""}</button>
              ${o.notificationPanelOpen?ua():""}
            </div>
            <button class="icon-action" type="button" id="notificationSettings" aria-label="Notification settings">${A("settings")}</button>
            <label class="availability">Availability
              <select id="availability">
                ${["open","interviewing","paused"].map(i=>{var r;return`<option value="${i}" ${((r=o.candidate)==null?void 0:r.availability)===i?"selected":""}>${i}</option>`}).join("")}
              </select>
            </label>
          </div>
        </header>
        ${o.notificationSettingsOpen?pa():""}
        ${o.message?`<div class="notice">${o.message}</div>`:""}
        ${fa()}
      </section>
    </main>
  `,Xe(),qa(),ga(),ma()}function da(e){return(e!=null&&e.toDate?e.toDate():new Date(e||Date.now())).toLocaleString("en-US",{month:"short",day:"numeric",year:"numeric",hour:"numeric",minute:"2-digit"})}function ua(){const e=(o.notifications||[]).slice(0,10);return`
    <div class="notification-panel">
      <div class="notification-panel-head"><strong>Notifications</strong><span>${e.length?"Latest updates":"All clear"}</span></div>
      ${e.length?e.map(t=>`
        <button class="notification-item ${t.read?"":"unread"}" type="button" data-notification-read="${t.id}">
          <strong>${b(t.title||"Nearwork update")}</strong>
          <span>${b(t.message||"")}</span>
          <time>${da(t.createdAt)}</time>
        </button>
      `).join(""):'<div class="notification-empty">No notifications yet.</div>'}
    </div>
  `}function pa(){var s;const e=((s=o.candidate)==null?void 0:s.notificationPreferences)||{};return`
    <section class="notification-settings-card">
      <div class="section-heading"><div><p class="eyebrow">Settings</p><h2>Notification preferences</h2></div></div>
      <div class="notification-settings-grid">
        ${[["recruitmentUpdates","Recruitment updates"],["assessmentUpdates","Assessment updates"],["mentions","Mentions"],["openingMovement","Opening movement"],["jobAlerts","Similar role alerts"]].map(([a,n])=>{const i=e[a]||{};return`<div class="notification-setting-row">
            <strong>${n}</strong>
            <label><input type="checkbox" data-notification-pref="${a}" data-channel="app" ${i.app!==!1?"checked":""}> In-app</label>
            <label><input type="checkbox" data-notification-pref="${a}" data-channel="email" ${i.email!==!1?"checked":""}> Email</label>
          </div>`}).join("")}
      </div>
      <p class="field-hint">Email notifications are grouped with a 2-hour buffer. The bell always keeps the detailed history with date and time.</p>
    </section>
  `}let pe=null;function ma(){pe&&window.clearInterval(pe);const e=document.querySelector("#assessmentTimer");if(!e)return;const t=new Date(e.dataset.end||"").getTime(),s=()=>{const a=Math.max(0,t-Date.now()),n=Math.floor(a/1e3),i=Math.floor(n/60),r=String(n%60).padStart(2,"0");e.textContent=`${i}:${r}`,e.classList.toggle("is-low",a<=10*60*1e3),a<=0&&window.clearInterval(pe)};s(),pe=window.setInterval(s,1e3)}function ga(){if(o.activePage!=="assessment")return;const e=o.assessments||[],t=K(),a=(t?e.find(i=>i.id===t):null)||e.find(i=>["sent","started"].includes(String(i.status||"").toLowerCase()));if(!(a!=null&&a.id))return;const n=String(a.status||"").toLowerCase();if(n==="started"&&Ze()===null){ie(a.id,Number(a.currentQuestionIndex||0),!0);return}if(!t&&n==="sent"){const i=`/assessment/${encodeURIComponent(a.id)}/start`;window.history.replaceState({page:"assessment",assessmentId:a.id},"",i)}}function ha(){return{onboarding:"Complete your candidate profile",overview:`Hi ${et()}, here's your process`,matches:"Role matches",applications:"Application pipeline",assessment:"Assessment center",cvs:"CV picker",tips:"Interview tips",recruiter:"Your recruiter",profile:"Candidate profile"}[o.activePage]||"Talent"}function fa(){return({onboarding:ya,overview:je,matches:va,applications:wa,assessment:Sa,cvs:La,tips:xa,recruiter:Ea,profile:Ma}[o.activePage]||je)()}function je(){var a;const e=na(),t=st(),s=o.jobs.length;return`
    ${e?"":`
      <section class="hero-card">
        <div><p class="eyebrow">Action needed</p><h2>Finish your profile to unlock matches.</h2><p>Add your role, city, salary, and skills so Nearwork can match you to the right openings.</p></div>
        <button class="primary-action fit" data-page="profile">${A("arrow-right")} Complete profile</button>
      </section>
    `}
    <section class="summary-grid">
      ${me("Profile readiness",`${xe()}%`,"sparkles")}
      ${me("Open roles",s,"briefcase-business")}
      ${me("Applications",o.applications.length,"send")}
      ${me("CVs saved",(((a=o.candidate)==null?void 0:a.cvLibrary)||[]).length,"files")}
    </section>
    <section class="content-grid">
      <div class="section-block"><div class="section-heading"><div><p class="eyebrow">Now</p><h2>${t?"Talent pipeline":"Find your next opening"}</h2></div></div>${t?gt(mt()):ht()}</div>
      <div class="section-block compact"><div class="section-heading"><div><p class="eyebrow">Recruiter</p><h2>Need help?</h2></div></div>${ft()}</div>
    </section>
  `}function ya(){return`
    <section class="onboarding-hero">
      <div>
        <p class="eyebrow">New candidate setup</p>
        <h2>Tell Nearwork what role, city, salary, and skills fit you best.</h2>
        <p>This only appears as a first-run setup. After you submit it, you will land in the Talent workspace.</p>
      </div>
    </section>
    ${pt("onboarding")}
  `}function va(){var r,l,m;const e=((r=o.candidate)==null?void 0:r.targetRole)||(nt((l=o.candidate)==null?void 0:l.headline)?"":(m=o.candidate)==null?void 0:m.headline),t=le(),s=o.jobs.map(ee).filter(d=>at(d,t).length>=3),a=t.length>=3,n=o.matchesFiltered&&a?s:o.jobs.map(ee),i=o.matchesFiltered&&!s.length;return`
    <section class="section-block">
      <div class="section-heading">
        <div><p class="eyebrow">Openings</p><h2>${o.matchesFiltered?"Best fit from your profile":"All current openings"}</h2></div>
        <button id="filterMatches" class="secondary-action" type="button">${A(o.matchesFiltered?"list":"filter")} ${o.matchesFiltered?"Show all openings":"Filter by my role & skills"}</button>
      </div>
      <div class="match-note"><strong>${n.length}</strong> of <strong>${o.jobs.length}</strong> openings showing. Matches require <strong>3+ shared skills</strong>. Role: <strong>${e||"not set"}</strong>. Skills: <strong>${t.join(", ")||"not set"}</strong>.</div>
      <div class="job-list">${i?se("No filtered matches yet","Add a target role and skills in Profile to improve matching."):n.map(d=>Ra(d)).join("")}</div>
    </section>
  `}function wa(){return`
    <section class="section-block">
      <div class="section-heading"><div><p class="eyebrow">Pipeline</p><h2>Your applications</h2></div></div>
      ${st()?gt(mt()):ht()}
      <div class="timeline page-gap">${o.applications.length?o.applications.map(Oa).join(""):se("No applications yet","Apply to a role and your process will show here.")}</div>
    </section>
  `}function Sa(){const e=K(),t=o.assessments||[],s=t.filter(i=>["sent","started"].includes(String(i.status||"").toLowerCase())),a=t.filter(i=>String(i.status||"").toLowerCase()==="completed"),n=e?t.find(i=>i.id===e):s[0]||a[0]||null;if(e&&!n)return`
      <section class="assessment-hero">
        <div><p class="eyebrow">Assessment</p><h2>No assessment available for this link.</h2><p>Make sure you are logged into the same account that received the assessment email. If this keeps happening, contact Nearwork support.</p></div>
        <button class="primary-action fit" data-page="recruiter" type="button">${A("message-circle")} Contact support</button>
      </section>
    `;if(n){const i=Array.isArray(n.questions)?n.questions:[],r=String(n.status||"").toLowerCase()==="started",l=String(n.status||"").toLowerCase()==="completed",m=String(n.status||"").toLowerCase()==="cancelled",d=Aa(n),g=Ze(),f=Number(n.currentQuestionIndex||0),S=Math.min(g??f,Math.max(i.length-1,0)),k=i[S],B=(k==null?void 0:k.stage)||n.currentStage||1;return`
      <section class="assessment-hero">
        <div>
          <p class="eyebrow">Nearwork assessment</p>
          <h2>${b(n.role||"Role assessment")}</h2>
          <p>${l?"This assessment has been submitted.":m?"This assessment was cancelled by Nearwork. If a new one is assigned, it will appear here automatically.":d?"This assessment link has expired.":"This assessment has 2 stages. Stage 1 is technical, Stage 2 is DISC. You must be logged in to complete it."}</p>
        </div>
        <button class="primary-action fit" id="startAssessment" type="button" ${l||m||d?"disabled":""}>${A(r?"play":"clipboard-check")} ${r?"Continue assessment":"Start assessment"}</button>
      </section>
      ${r&&!l&&!m&&!d?Ca(n,B):""}
      ${r&&!l&&!m&&!d?ba(n,S):""}
      <section class="info-grid">
        ${ae("Technical Assessment","50 technical single-choice questions. 60 minutes.")}
        ${ae("DISC Assessment","20 work-style single-choice questions. 30 minutes.")}
        ${ae("24-hour link",`Expires ${Ie(n.expiresAt||n.deadline)}.`)}
      </section>
      <section class="section-block page-gap" id="assessmentWorkspace">
        <div class="section-heading"><div><p class="eyebrow">${l?"Submitted":de(B)}</p><h2>${l?"Assessment received":`${S+1} of ${i.length||70}`}</h2></div></div>
        ${l?Na():m?se("Assessment cancelled","This assessment is no longer available. A new assigned assessment will appear here when your recruiter sends it."):d?se("Assessment expired","This unique assessment link is no longer available. Contact Nearwork if you need help."):$a(n,r,S)}
      </section>
      ${Pa(t,n.id)}
    `}return`
    <section class="assessment-hero">
      <div><p class="eyebrow">Assessment</p><h2>Complete role-specific questions when Nearwork assigns them.</h2><p>Your assessment will include English, work simulation, and role-specific scenarios. Results are reviewed by the Nearwork recruiting team.</p></div>
      <button class="primary-action fit" type="button" disabled>${A("lock")} Not assigned yet</button>
    </section>
    <section class="info-grid">${ae("One attempt","Retakes are only opened by your recruiter when needed.")}${ae("Timed work","Most role assessments take 45-90 minutes.")}${ae("Recruiter review","You will get next steps or respectful feedback after review.")}</section>
  `}function ba(e,t){const s=(e.questions||[]).slice(0,70),a=Ce(e,1).filter(i=>ne(Se(e,i))).length,n=Ce(e,2).filter(i=>ne(Se(e,i))).length;return`
    <section class="assessment-progress-panel">
      <div><strong>Technical Assessment</strong><span>${a}/50 answered</span></div>
      <div><strong>DISC Assessment</strong><span>${n}/20 answered</span></div>
      <div class="assessment-progress-strip">
        ${s.map((i,r)=>{const l=ne(Se(e,i));return`<button type="button" class="${r===t?"active":""} ${l?"answered":""}" data-assessment-jump="${r}" title="${de(i.stage)} question ${r+1}">${r+1}</button>`}).join("")}
      </div>
    </section>
  `}function Ca(e,t){const s=Number(t),a=Ue(e.technicalStartedAt||e.startedAt)||new Date,n=Ue(e.discStartedAt)||new Date,i=s===1?a:n,r=Number(s===1?e.technicalMinutes||60:e.discMinutes||30),l=new Date(i.getTime()+r*60*1e3);return`
    <section class="assessment-timer-bar">
      <div>
        <span>${de(s)} timer</span>
        <strong id="assessmentTimer" data-end="${l.toISOString()}">${r}:00</strong>
      </div>
      <p>${s===1?"Technical section: 60 minutes. DISC follows after Stage 1.":"DISC section: 30 minutes. Submit when you finish."}</p>
    </section>
  `}function $a(e,t,s=null){var u,c,p,y;if(!t)return`
      <div class="assessment-preview">
        <div>
          ${A("timer")}
          <strong>Before you start</strong>
          <p>Choose a quiet room, close extra tabs, keep your phone away unless needed for login, and make sure your internet connection is stable. The timer starts when you begin.</p>
        </div>
        <ul>
          <li>Technical Assessment: 50 single-choice questions.</li>
          <li>DISC Assessment: 20 work-style single-choice questions.</li>
          <li>Your progress saves after every answer, and refresh will return to the current question.</li>
        </ul>
      </div>
    `;const a=(e.questions||[]).slice(0,70),n=Math.min(s??Number(e.currentQuestionIndex||0),Math.max(a.length-1,0)),i=a[n],r=((c=(u=e.answers)==null?void 0:u[i.id])==null?void 0:c.value)??((p=e.answers)==null?void 0:p[i.id])??"",l=Array.isArray(i.options)&&i.options.length?i.options:["Strongly agree","Agree","Neutral","Disagree"],m=(y=a[n+1])==null?void 0:y.stage,d=m&&m!==i.stage,g=$e(e,i.stage),f=d&&g.length,k=n+1>=a.length?$e(e,i.stage):[],B=i.multiple?"Multiple choice":"Single choice";return`
    <form id="assessmentQuestionForm" class="assessment-question-card" data-current-index="${n}">
      <div class="assessment-question-meta">
        <span>${b(i.part||i.type)}</span>
        <span>${b(i.bank||"")}</span>
        <span>${B}</span>
      </div>
      ${Number(i.stage||1)===2&&n===a.findIndex(h=>Number(h.stage||1)===2)?'<div class="assessment-stage-divider"><strong>DISC Assessment</strong><span>You finished the Technical Assessment. Continue with the work-style section.</span></div>':""}
      <div class="question-prompt">${b(i.q||"")}</div>
      <fieldset class="assessment-options">
        <legend>${B}</legend>
          ${l.map((h,v)=>`
            <label class="assessment-option">
              <input type="radio" name="answer" value="${v}" ${String(r)===String(v)?"checked":""} />
              <b>${String.fromCharCode(65+v)}</b>
              <span>${b(h)}</span>
            </label>
          `).join("")}
      </fieldset>
      ${f||k.length?ka(e,f?g:k,i.stage):""}
      <p class="field-hint">${d?"After this answer, you will finish the Technical Assessment and enter the DISC Assessment.":"Your progress saves after every question. If you refresh, you will return here."}</p>
      <div class="job-footer">
        <button class="ghost-action" id="prevAssessmentQuestion" type="button" ${n===0?"disabled":""}>${A("arrow-left")} Previous</button>
        <button class="primary-action fit" type="submit">${n+1>=a.length?"Submit assessment":"Next"}</button>
      </div>
    </form>
  `}function ka(e,t,s){if(!t.length)return"";const a=(e.questions||[]).slice(0,70);return`
    <div class="missed-question-prompt">
      <strong>You still have unanswered questions in the ${de(s)}.</strong>
      <p>You missed ${t.map(n=>`Question ${a.findIndex(i=>i.id===n.id)+1}`).join(", ")}. You can go back now or continue if you meant to leave them unanswered.</p>
      <div>${t.map(n=>{const i=a.findIndex(r=>r.id===n.id);return`<button class="ghost-action" type="button" data-assessment-jump="${i}">Go to ${i+1}</button>`}).join("")}</div>
    </div>
  `}function Aa(e){return!(e!=null&&e.expiresAt)||String(e.status||"").toLowerCase()==="completed"?!1:Date.now()>new Date(e.expiresAt).getTime()}function Na(e){return`
    ${se("Thank you for completing your assessment","This has been shared successfully with the Nearwork team. We will review it and reach out with next steps.")}
  `}function Pa(e,t){return e.length?`
    <section class="section-block page-gap">
      <div class="section-heading"><div><p class="eyebrow">Assessment center</p><h2>Your assessment history</h2></div></div>
      <div class="assessment-history-list">
        ${e.map(s=>`
          <article class="assessment-history-row ${s.id===t?"active":""}">
            <div><strong>${b(s.role||"Nearwork assessment")}</strong><span>${b(s.id||"")}</span></div>
            <div>${b(String(s.status||"assigned"))}</div>
            <a href="/assessment/${encodeURIComponent(s.id)}/start">${s.status==="completed"?"View":"Continue"}</a>
          </article>
        `).join("")}
      </div>
    </section>
  `:""}function Ta(e,t){const s=e.questions||[],a=s.filter(l=>l.stage===1),n=s.filter(l=>l.stage===2),i=a.filter(l=>{var m;return typeof l.correctIndex=="number"&&Number((m=t[l.id])==null?void 0:m.value)===l.correctIndex}).length,r=n.filter(l=>{var m;return ne(((m=t[l.id])==null?void 0:m.value)??t[l.id])}).length;return{technicalScore:a.length?Math.round(i/a.length*100):0,discScore:n.length?Math.round(r/n.length*100):0}}function Da(e,t){var l,m;const s={Dominance:0,Influence:0,Steadiness:0,Conscientiousness:0};(e.questions||[]).filter(d=>Number(d.stage)===2).forEach(d=>{var k;const g=(k=t[d.id])==null?void 0:k.value;if(!ne(g))return;const f=s[d.skill]!==void 0?d.skill:"Steadiness",S=Math.max(1,4-Number(g||0));s[f]+=S});const a=Object.entries(s).sort((d,g)=>g[1]-d[1]),n=((l=a[0])==null?void 0:l[0])||"Steadiness",i=((m=a[a.length-1])==null?void 0:m[0])||"Dominance";return{label:{Dominance:"D",Influence:"I",Steadiness:"S",Conscientiousness:"C"}[n]||"S",high:n,low:i,scores:s,summary:`${n} is the strongest observed DISC tendency; ${i} appears lowest based on this assessment.`}}async function Ia(e,t){var m,d,g,f,S;const s="https://admin.nearwork.co/api/send-email",a=e.candidateEmail||((m=o.user)==null?void 0:m.email)||((d=o.candidate)==null?void 0:d.email),n=e.candidateName||((g=o.candidate)==null?void 0:g.name)||((f=o.user)==null?void 0:f.displayName)||"there",i=ct([e.recruiterEmail,e.stakeholderEmail,e.hiringManagerEmail].filter(Boolean).join(",")),r=[];a&&r.push(fetch(s,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({to:a,templateId:"assessment_completed_candidate",data:{name:n,role:e.role,actionUrl:"https://talent.nearwork.co/assessment",actionText:"Open assessment center"}})}));const l=i.length?i:["support@nearwork.co"];r.push(fetch(s,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({to:l,templateId:"assessment_completed_recruiter",data:{name:"Nearwork team",role:e.role,actionUrl:`https://admin.nearwork.co/assessments/${e.id}/questions`,actionText:"Review assessment",message:`${n} completed the assessment. Overall: ${t.score}%. Technical: ${t.technicalScore}%. DISC: ${((S=t.discProfile)==null?void 0:S.label)||"Submitted"}.`}})})),await Promise.allSettled(r)}function La(){var t;const e=((t=o.candidate)==null?void 0:t.cvLibrary)||[];return`
    <section class="section-block">
      <div class="section-heading"><div><p class="eyebrow">CV picker</p><h2>Store multiple resumes</h2></div></div>
      <form id="cvForm" class="upload-box">
        ${A("upload-cloud")}<strong>Upload a CV for this role</strong><p>Save multiple versions and pick the best one for each opening.</p>
        <input name="cv" type="file" accept=".pdf,.doc,.docx" required />
        <input name="label" type="text" placeholder="CV label, e.g. CSM resume" />
        <button class="primary-action fit" type="submit">Upload CV</button>
      </form>
      <div class="cv-list">
        ${e.length?e.map(s=>`<article class="cv-item">${A("file-text")}<div><strong>${s.name||s.fileName}</strong><span>${Ie(s.uploadedAt)}</span></div>${s.url?`<a href="${s.url}" target="_blank" rel="noreferrer">Open</a>`:""}</article>`).join(""):se("No CVs saved yet","Upload role-specific resumes here.")}
      </div>
    </section>
  `}function xa(){return`
    <section class="tips-hero"><div><p class="eyebrow">Candidate guide</p><h2>Practical prep for US SaaS interviews.</h2><p>Short, useful guidance candidates can read before recruiter screens, assessments, and client interviews.</p></div></section>
    <section class="tips-grid rich">
      ${ea.map((e,t)=>`
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
  `}function Ea(){var s,a;const t=(((s=o.candidate)==null?void 0:s.recruiter)||{}).bookingUrl||((a=o.candidate)==null?void 0:a.recruiterBookingUrl)||"mailto:support@nearwork.co?subject=Nearwork%20candidate%20question";return`
    <section class="content-grid">
      <div class="section-block"><div class="section-heading"><div><p class="eyebrow">Recruiter</p><h2>Your Nearwork contact</h2></div></div>${ft(!0)}</div>
      <div class="section-block compact"><div class="section-heading"><div><p class="eyebrow">Booking</p><h2>Schedule soon</h2></div></div><p class="muted">Ask the Nearwork recruiting team for the earliest available slot. Candidate booking links can be attached to this profile later.</p><a class="primary-action fit" href="${t}" target="_blank" rel="noreferrer">${A("calendar-plus")} Book recruiter call</a></div>
    </section>
  `}function Ma(){return pt("profile")}function pt(e="profile"){var m,d,g,f,S,k,B,u,c,p,y,h;const t=le(),s=sa(),a=X[s.department]||[],n=((m=o.candidate)==null?void 0:m.salaryCurrency)||"USD",i=ot(((d=o.candidate)==null?void 0:d.salaryAmount)||((g=o.candidate)==null?void 0:g.salary)||((f=o.candidate)==null?void 0:f.salaryUSD),n),r=oa(),l=((S=o.candidate)==null?void 0:S.targetRole)||((k=o.candidate)==null?void 0:k.headline)||"";return`
    <section class="section-block">
      <div class="section-heading"><div><p class="eyebrow">${e==="onboarding"?"Setup":"Profile"}</p><h2>${e==="onboarding"?"Complete your account":"Improve your match quality"}</h2></div><span class="profile-score">${xe()}%</span></div>
      <form id="profileForm" class="profile-form">
        <div class="profile-card profile-identity wide">
          ${tt("large")}
          <label>Profile photo <span class="optional-label">optional</span>
            <input name="photo" type="file" accept="image/png,image/jpeg,image/webp" />
          </label>
        </div>
        <label class="wide">Full name<input name="name" value="${b(((B=o.candidate)==null?void 0:B.name)||((u=o.user)==null?void 0:u.displayName)||"")}" /></label>
        <div class="profile-card wide">
          <div class="field-label">Role applying for</div>
          <div class="profile-card-grid">
            <label>Area
              <select name="roleGroup" id="roleGroupSelect">
                ${ra(r)}
              </select>
            </label>
            <label>Role
              <select name="targetRole" id="targetRoleSelect">
                ${it(r,l)}
              </select>
            </label>
          </div>
        </div>
        <div class="profile-card wide">
          <div class="field-label">Location</div>
          <div class="profile-card-grid">
            <label>Department
              <select name="department" id="departmentSelect">
                ${Object.keys(X).map(v=>`<option value="${b(v)}" ${v===s.department?"selected":""}>${v}</option>`).join("")}
              </select>
            </label>
            <label>City
              <select name="city" id="citySelect">
                ${a.map(v=>`<option value="${b(v)}" ${v===s.city?"selected":""}>${v}</option>`).join("")}
              </select>
            </label>
          </div>
        </div>
        <div class="profile-card wide">
          <div class="field-label">Compensation and English</div>
          <div class="profile-card-grid">
            <label>Target monthly salary
              <div class="salary-field"><select id="salaryCurrencyInput" name="salaryCurrency"><option value="USD" ${i.salaryCurrency==="USD"?"selected":""}>USD</option><option value="COP" ${i.salaryCurrency==="COP"?"selected":""}>COP</option></select><input id="salaryInput" name="salary" value="${b(i.salary||"")}" inputmode="numeric" placeholder="1000" /></div>
            </label>
            <label>English level<select name="english">${["","B1","B2","C1","C2","Native"].map(v=>{var M;return`<option value="${v}" ${((M=o.candidate)==null?void 0:M.english)===v?"selected":""}>${v||"Select level"}</option>`}).join("")}</select></label>
          </div>
        </div>
        <div class="profile-card wide">
          <div class="field-label">Contact</div>
          <div class="profile-card-grid">
            <label>WhatsApp number
              <input name="whatsapp" value="${b(((c=o.candidate)==null?void 0:c.whatsapp)||((p=o.candidate)==null?void 0:p.phone)||"")}" inputmode="tel" autocomplete="tel" placeholder="+57 300 123 4567" required />
            </label>
            <label>LinkedIn <span class="optional-label">optional</span>
              <input name="linkedin" value="${b(((y=o.candidate)==null?void 0:y.linkedin)||"")}" placeholder="https://linkedin.com/in/..." />
            </label>
          </div>
        </div>
        <div class="profile-card wide">
          <div class="field-label">Skills</div>
          <p class="field-hint">Search for skills and add everything that applies to your experience.</p>
          ${ca(t)}
        </div>
        <div class="profile-card wide">
          <div class="field-label">CV</div>
          <p class="field-hint">Upload the CV you want Nearwork to use for your applications.</p>
          <input name="profileCv" type="file" accept=".pdf,.doc,.docx" />
          <input name="profileCvLabel" type="text" placeholder="CV label, e.g. Customer Success CV" />
        </div>
        <label class="wide">Summary <span class="optional-label">optional</span><textarea name="summary" placeholder="Add a short note about what you do best.">${((h=o.candidate)==null?void 0:h.summary)||""}</textarea></label>
        <input type="hidden" name="mode" value="${e}" />
        <button class="primary-action fit" type="submit">${A("save")} ${e==="onboarding"?"Finish setup":"Save profile"}</button>
      </form>
    </section>
  `}function xe(){const e=["name","targetRole","department","city","english","salary","whatsapp"],t=e.filter(s=>{var a,n,i,r;return s==="targetRole"?!!((a=o.candidate)!=null&&a.targetRole||!nt((n=o.candidate)==null?void 0:n.headline)&&((i=o.candidate)!=null&&i.headline)):!!((r=o.candidate)!=null&&r[s])}).length+(le().length?1:0);return Math.max(25,Math.round(t/(e.length+1)*100))}function mt(){const e=o.applications[0];return(e==null?void 0:e.stage)||(e==null?void 0:e.status)||"profile-review"}function gt(e){const t=String(e||"").toLowerCase().replace(/_/g,"-").replace(/\s+/g,"-"),s=Math.max(0,Oe.findIndex(a=>t.includes(a.key)||a.key.includes(t)));return`<div class="pipeline">${Oe.map((a,n)=>`<article class="${n<=s?"done":""} ${n===s?"current":""}"><span>${n+1}</span><strong>${a.label}</strong><p>${a.help}</p></article>`).join("")}</div>`}function ht(){return`
    <div class="empty-state">
      ${A("briefcase-business")}
      <strong>No active pipeline yet</strong>
      <p>Browse current openings and apply when you find a role that fits. Nearwork will show a pipeline here after an application moves forward.</p>
      <div class="empty-actions">
        <button class="primary-action fit" type="button" data-page="matches">${A("sparkles")} View matches</button>
        <a class="secondary-action" href="https://jobs.nearwork.co" target="_blank" rel="noreferrer">${A("external-link")} Open jobs</a>
      </div>
    </div>
  `}function me(e,t,s){return`<article class="metric"><span>${A(s)}</span><p>${e}</p><strong>${t}</strong></article>`}function Ra(e){const t=ee(e),s=new Set(o.applications.map(n=>n.jobId||n.openingCode)).has(t.code),a=at(t);return`
    <article class="job-card">
      <div><div class="match-pill">${a.length>=3?`${a.length} skill match`:`${t.match}% match`}</div><h3>${t.title}</h3><p>${t.orgName} · ${t.location}</p></div>
      <p class="job-description">${t.description}</p>
      <div class="skill-row">${t.skills.slice(0,4).map(n=>`<span>${n}</span>`).join("")}</div>
      ${a.length>=3?`<p class="field-hint">Matched skills: ${a.slice(0,5).map(escapeHtml).join(", ")}</p>`:""}
      <div class="job-footer"><strong>${t.compensation}</strong><button class="secondary-action" type="button" data-apply="${t.code}" ${s?"disabled":""}>${s?"Applied":"Apply"}</button></div>
    </article>
  `}function Oa(e){return`<article class="timeline-item"><span>${A("circle-dot")}</span><div><strong>${e.jobTitle||e.title||"Application"}</strong><p>${e.clientName||e.company||"Nearwork"} · ${e.status||"submitted"}</p><small>${Ie(e.updatedAt||e.createdAt)}</small></div></article>`}function ae(e,t){return`<article class="info-card"><strong>${e}</strong><p>${t}</p></article>`}function ft(e=!1){var i;const t=((i=o.candidate)==null?void 0:i.recruiter)||{},s=t.email||"support@nearwork.co",a=t.whatsapp||Jt,n=t.whatsappUrl||Kt;return`<article class="recruiter-card"><div class="avatar recruiter-avatar">NW</div><div><strong>${t.name||"Nearwork Support"}</strong><p><a href="mailto:${s}">${s}</a></p><p><a href="${n}" target="_blank" rel="noreferrer">WhatsApp ${a}</a></p>${e?"<span>Questions about assessments, interviews, feedback, or CV selection should go here.</span>":""}</div></article>`}function se(e,t){return`<div class="empty-state">${A("inbox")}<strong>${e}</strong><p>${t}</p></div>`}function Ua(){Te.innerHTML='<main class="loading-screen"><span class="logo-mark">N</span><p>Loading Talent...</p></main>'}function qa(){var e,t,s,a,n,i,r,l,m,d,g,f,S,k,B;(e=document.querySelector("#signOut"))==null||e.addEventListener("click",async()=>{await Tt(T),W&&W(),W=null,window.history.pushState({page:"overview"},"","/"),w({user:null,candidate:null,applications:[],assessments:[],jobs:[],view:"login",activePage:"overview",message:""})}),(t=document.querySelector("#signIn"))==null||t.addEventListener("click",()=>{window.history.pushState({page:"overview"},"","/"),w({view:"login",activePage:"overview",message:""})}),document.querySelectorAll("[data-page]").forEach(u=>{u.addEventListener("click",()=>he(u.dataset.page))}),(s=document.querySelector("[data-dashboard-home]"))==null||s.addEventListener("click",()=>he("overview")),(a=document.querySelector("#notificationBell"))==null||a.addEventListener("click",()=>{w({notificationPanelOpen:!o.notificationPanelOpen,notificationSettingsOpen:!1})}),(n=document.querySelector("#notificationSettings"))==null||n.addEventListener("click",()=>{w({notificationSettingsOpen:!o.notificationSettingsOpen,notificationPanelOpen:!1})}),document.querySelectorAll("[data-notification-read]").forEach(u=>{u.addEventListener("click",async()=>{const c=u.dataset.notificationRead;o.user&&Y&&await Wt(c).catch(()=>null),w({notifications:o.notifications.map(p=>p.id===c?{...p,read:!0}:p)})})}),document.querySelectorAll("[data-notification-pref]").forEach(u=>{u.addEventListener("change",async()=>{var h;const c=structuredClone(((h=o.candidate)==null?void 0:h.notificationPreferences)||{}),p=u.dataset.notificationPref,y=u.dataset.channel;c[p]={...c[p]||{},[y]:u.checked},w({candidate:{...o.candidate,notificationPreferences:c}}),o.user&&Y&&await Yt(o.user.uid,c).catch(()=>null)})}),document.querySelectorAll("[data-assessment-jump]").forEach(u=>{u.addEventListener("click",async()=>{var M,j,L;const c=K()||((M=(o.assessments||[])[0])==null?void 0:M.id),p=(o.assessments||[]).find(N=>N.id===c),y=Number(u.dataset.assessmentJump||0),h=(j=p==null?void 0:p.questions)==null?void 0:j[y];if(!c||!h)return;await ue(c,"__progress__","",{currentQuestionIndex:y,totalQuestions:((L=p==null?void 0:p.questions)==null?void 0:L.length)||70,currentStage:h.stage||1}),ie(c,y);const v=(o.assessments||[]).map(N=>N.id===c?{...N,currentQuestionIndex:y,currentStage:h.stage||1}:N);w({assessments:v,activePage:"assessment",message:""})})}),document.querySelector("#availability").addEventListener("change",async u=>{const c=u.target.value;w({candidate:{...o.candidate,availability:c}}),o.user&&Y?await Vt(o.user.uid,c):w({message:"Sign in with Google to save availability."})}),(i=document.querySelector("#filterMatches"))==null||i.addEventListener("click",()=>{const u=le().length>=3;w({matchesFiltered:u?!o.matchesFiltered:!1,message:u?"":"Add at least 3 skills in Profile first, then filter matching openings."})}),(r=document.querySelector("#departmentSelect"))==null||r.addEventListener("change",u=>{const c=document.querySelector("#citySelect"),p=X[u.target.value]||[];c.innerHTML=p.map(y=>`<option value="${b(y)}">${y}</option>`).join("")}),(l=document.querySelector("#roleGroupSelect"))==null||l.addEventListener("change",u=>{const c=document.querySelector("#targetRoleSelect");c.innerHTML=it(u.target.value,"")}),(m=document.querySelector("#salaryCurrencyInput"))==null||m.addEventListener("change",u=>{const c=document.querySelector("#salaryInput");if(!c)return;const p=qe(c.value,u.target.value);u.target.value=p,c.placeholder=p==="COP"?"5,000,000":"2,500",c.value=Be(c.value,p)}),(d=document.querySelector("#salaryInput"))==null||d.addEventListener("blur",u=>{const c=document.querySelector("#salaryCurrencyInput"),p=qe(u.target.value,(c==null?void 0:c.value)||"USD");c&&(c.value=p),u.target.placeholder=p==="COP"?"5,000,000":"2,500",u.target.value=Be(u.target.value,p)}),Ba(),document.querySelectorAll("[data-apply]").forEach(u=>{u.addEventListener("click",async()=>{const c=o.jobs.map(ee).find(p=>p.code===u.dataset.apply);u.disabled=!0,u.textContent="Submitted",o.user&&Y?(await Gt(o.user.uid,c),await dt(o.user),he("applications")):w({message:"Sign in with Google to apply to this opening."})})}),(g=document.querySelector("#startAssessment"))==null||g.addEventListener("click",async()=>{var p;const u=K()||((p=(o.assessments||[])[0])==null?void 0:p.id),c=(o.assessments||[]).find(y=>y.id===u)||(o.assessments||[])[0];if(!u||!o.user){w({message:"Please log in to start your assessment."});return}try{await Ft(u,o.user.uid),ie(u,Number((c==null?void 0:c.currentQuestionIndex)||0),!0);const y=(o.assessments||[]).map(h=>h.id===u?{...h,status:"started",startedAt:h.startedAt||new Date().toISOString(),technicalStartedAt:h.technicalStartedAt||new Date().toISOString()}:h);w({assessments:y,activePage:"assessment",message:""})}catch(y){w({message:Z(y)})}}),(f=document.querySelector("#prevAssessmentQuestion"))==null||f.addEventListener("click",async()=>{var M,j,L,N;const u=K()||((M=(o.assessments||[])[0])==null?void 0:M.id),c=(o.assessments||[]).find(F=>F.id===u),p=Number(((j=document.querySelector("#assessmentQuestionForm"))==null?void 0:j.dataset.currentIndex)??(c==null?void 0:c.currentQuestionIndex)??0),y=Math.max(0,p-1),h=(L=c==null?void 0:c.questions)==null?void 0:L[y];await ue(u,"__progress__","",{currentQuestionIndex:y,totalQuestions:((N=c==null?void 0:c.questions)==null?void 0:N.length)||70,currentStage:(h==null?void 0:h.stage)||1}),ie(u,y);const v=(o.assessments||[]).map(F=>F.id===u?{...F,currentQuestionIndex:y,currentStage:(h==null?void 0:h.stage)||1}:F);w({assessments:v,activePage:"assessment",message:""})}),(S=document.querySelector("#assessmentQuestionForm"))==null||S.addEventListener("submit",async u=>{var z;u.preventDefault();const c=K()||((z=(o.assessments||[])[0])==null?void 0:z.id),p=(o.assessments||[]).find(P=>P.id===c),y=(p==null?void 0:p.questions)||[],h=Number(u.currentTarget.dataset.currentIndex??(p==null?void 0:p.currentQuestionIndex)??0),v=y[h],M=new FormData(u.currentTarget).get("answer");if(!v){w({message:"This question could not be loaded. Please refresh and try again."});return}const j=M===null?{value:"",skipped:!0,answeredAt:new Date().toISOString()}:{value:Number(M),skipped:!1,answeredAt:new Date().toISOString()},L={...p.answers||{},[v.id]:j},N=y[h+1],F=N&&Number(N.stage||1)!==Number(v.stage||1),te=$e(p,v.stage,L);try{if((F||h+1>=y.length)&&te.length){await ue(c,v.id,L[v.id],{currentQuestionIndex:h,totalQuestions:y.length,currentStage:v.stage||1});const P=(o.assessments||[]).map(E=>E.id===c?{...E,answers:L,currentQuestionIndex:h,currentStage:v.stage||1,progress:`${h+1}/${y.length}`}:E);w({assessments:P,activePage:"assessment",message:`You missed ${te.length} question${te.length===1?"":"s"} in the ${de(v.stage)}.`});return}if(h+1>=y.length){const P=Ta(p,L),E=Da(p,L);await Qt(c,L,{totalQuestions:y.length,technicalScore:P.technicalScore,discScore:P.discScore,score:Math.round(P.technicalScore*.75+P.discScore*.25),discProfile:E}),Ia(p,{score:Math.round(P.technicalScore*.75+P.discScore*.25),technicalScore:P.technicalScore,discScore:P.discScore,discProfile:E}).catch(O=>console.warn(O));const Q=(o.assessments||[]).map(O=>O.id===c?{...O,answers:L,status:"completed",score:Math.round(P.technicalScore*.75+P.discScore*.25),technical:P.technicalScore,disc:E.label,discProfile:E,progress:`${y.length}/${y.length}`}:O);w({assessments:Q,activePage:"assessment",message:""})}else{const P=v.stage===1&&(N==null?void 0:N.stage)===2&&!p.discStartedAt,E=P?new Date().toISOString():p.discStartedAt;await ue(c,v.id,L[v.id],{currentQuestionIndex:h+1,totalQuestions:y.length,currentStage:(N==null?void 0:N.stage)||v.stage||1,discStartedAt:P?E:void 0}),ie(c,h+1);const Q=(o.assessments||[]).map(O=>O.id===c?{...O,answers:L,currentQuestionIndex:h+1,currentStage:(N==null?void 0:N.stage)||v.stage||1,discStartedAt:E,progress:`${h+1}/${y.length}`}:O);w({assessments:Q,activePage:"assessment",message:""})}}catch(P){w({message:Z(P)})}}),(k=document.querySelector("#profileForm"))==null||k.addEventListener("submit",async u=>{var M,j,L,N,F,te;u.preventDefault();const c=new FormData(u.currentTarget),p=c.get("department"),y=c.get("city"),h=ot(c.get("salary"),c.get("salaryCurrency")),v={name:c.get("name"),targetRole:c.get("targetRole"),headline:c.get("targetRole"),department:p,city:y,locationId:`${String(y).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g,"-")}-co`,location:`${y}, ${p}`,locationCity:y,locationDepartment:p,locationCountry:"Colombia",english:c.get("english"),salary:h.salary,salaryUSD:h.salaryUSD,salaryAmount:h.salaryAmount,salaryCurrency:h.salaryCurrency,expectedSalaryAmount:h.salaryAmount,expectedSalaryCurrency:h.salaryCurrency,linkedin:c.get("linkedin"),whatsapp:c.get("whatsapp"),phone:c.get("whatsapp"),skills:[...new Set(c.getAll("skills").map(Le).filter(Boolean))],otherSkills:[],summary:c.get("summary"),email:((M=o.candidate)==null?void 0:M.email)||((j=o.user)==null?void 0:j.email)||"",availability:((L=o.candidate)==null?void 0:L.availability)||"open",onboarded:!0};if(!o.user){w({candidate:{...o.candidate,...v},message:"Preview updated. Sign in with Google to save this profile."});return}try{const z=c.get("photo");let P=((N=o.candidate)==null?void 0:N.photoURL)||((F=o.user)==null?void 0:F.photoURL)||"";z!=null&&z.name&&(P=await zt(o.user.uid,z));const E=c.get("profileCv");let Q=null;E!=null&&E.name&&(Q=await Re(o.user.uid,E,c.get("profileCvLabel")));const O={...v,photoURL:P,...Q?{activeCvId:Q.id,activeCvName:Q.name||Q.fileName,cvLibrary:[...((te=o.candidate)==null?void 0:te.cvLibrary)||[],Q]}:{}},ve=await _t(o.user.uid,O),vt=(ve==null?void 0:ve.atsSynced)===!1?"Profile saved. Nearwork will finish connecting it to your workspace.":"Profile saved.";c.get("mode")==="onboarding"?(window.history.pushState({page:"overview"},"","/"),w({candidate:{...o.candidate,...O},activePage:"overview",message:"Profile complete. Welcome to Talent."})):w({candidate:{...o.candidate,...O},message:vt})}catch(z){w({message:Z(z)})}}),(B=document.querySelector("#cvForm"))==null||B.addEventListener("submit",async u=>{var y;u.preventDefault();const c=new FormData(u.currentTarget),p=c.get("cv");if(p!=null&&p.name){if(!o.user){w({message:"Sign in with Google to upload and store CVs."});return}try{const h=await Re(o.user.uid,p,c.get("label"));w({candidate:{...o.candidate,cvLibrary:[...((y=o.candidate)==null?void 0:y.cvLibrary)||[],h],activeCvId:h.id},message:"CV uploaded."})}catch(h){w({message:Z(h)})}}})}function Ba(){var m;const e=document.querySelector("[data-skill-search]");if(!e)return;const t=e.querySelector("#skillSearchInput"),s=e.querySelector("#skillSuggestions"),a=e.querySelector("#selectedSkills"),n=()=>[...a.querySelectorAll('input[name="skills"]')].map(d=>d.value),i=d=>{a.innerHTML=d.length?d.map(g=>`
      <span class="selected-skill" data-skill-chip="${b(g)}">
        ${escapeHtml(g)}
        <button type="button" class="skill-remove" data-remove-skill="${b(g)}" aria-label="Remove ${b(g)}">×</button>
        <input type="hidden" name="skills" value="${b(g)}" />
      </span>`).join(""):'<span class="skill-empty">Selected skills will appear here.</span>'},r=()=>{const d=U(t.value),g=new Set(n().map(U)),f=Je.filter(S=>!g.has(U(S))).filter(S=>!d||U(S).includes(d)).slice(0,18);s.innerHTML=f.length?f.map(S=>`<button type="button" class="skill-suggestion" data-skill="${b(S)}">${escapeHtml(S)}</button>`).join(""):`<button type="button" class="skill-suggestion add-custom" data-skill="${b(t.value)}">Add "${escapeHtml(t.value)}"</button>`},l=d=>{const g=Le(d||t.value);if(!g)return;const f=U(g),S=[...n().filter(k=>U(k)!==f),g];i(S),t.value="",r()};t==null||t.addEventListener("input",r),t==null||t.addEventListener("focus",r),t==null||t.addEventListener("keydown",d=>{if(d.key!=="Enter")return;d.preventDefault();const g=s.querySelector(".skill-suggestion");l((g==null?void 0:g.dataset.skill)||t.value)}),(m=e.querySelector("#addTypedSkill"))==null||m.addEventListener("click",()=>l(t.value)),s.addEventListener("click",d=>{const g=d.target.closest("[data-skill]");g&&l(g.dataset.skill)}),a.addEventListener("click",d=>{const g=d.target.closest("[data-remove-skill]");if(!g)return;const f=U(g.dataset.removeSkill);i(n().filter(S=>U(S)!==f)),r()})}function yt(){if(o.loading)return Ua();if(o.view==="dashboard")return ut();lt()}window.addEventListener("popstate",()=>{const e=ye();e==="overview"&&!o.user?w({view:"login",activePage:"overview",message:""}):o.view==="dashboard"?he(e,!1):fe()});Y?($t(T,e=>{e?dt(e):fe()}),window.setTimeout(()=>{o.loading&&fe()},2500)):fe();
