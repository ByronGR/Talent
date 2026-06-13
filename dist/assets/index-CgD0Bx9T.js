import{initializeApp as en}from"https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";import{getAuth as tn,GoogleAuthProvider as nn,signInWithPopup as sn,onAuthStateChanged as an,sendPasswordResetEmail as on,createUserWithEmailAndPassword as rn,updateProfile as ln,signInWithEmailAndPassword as cn,signOut as dn}from"https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";import{getFirestore as pn,query as ne,collection as K,where as se,limit as ae,getDocs as ie,getDoc as Se,doc as U,setDoc as V,serverTimestamp as O,onSnapshot as un,updateDoc as mn,addDoc as wt,arrayUnion as Ze}from"https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";import{getStorage as gn,ref as Xe,uploadBytes as At,getDownloadURL as Nt,deleteObject as fn}from"https://www.gstatic.com/firebasejs/10.12.5/firebase-storage.js";(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const a of document.querySelectorAll('link[rel="modulepreload"]'))s(a);new MutationObserver(a=>{for(const i of a)if(i.type==="childList")for(const l of i.addedNodes)l.tagName==="LINK"&&l.rel==="modulepreload"&&s(l)}).observe(document,{childList:!0,subtree:!0});function n(a){const i={};return a.integrity&&(i.integrity=a.integrity),a.referrerPolicy&&(i.referrerPolicy=a.referrerPolicy),a.crossOrigin==="use-credentials"?i.credentials="include":a.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function s(a){if(a.ep)return;a.ep=!0;const i=n(a);fetch(a.href,i)}})();const Pt={apiKey:"AIzaSyApRNyW8PoP28E0x77dUB5jOgHuTqA2by4",authDomain:"nearwork-97e3c.firebaseapp.com",projectId:"nearwork-97e3c",storageBucket:"nearwork-97e3c.firebasestorage.app",messagingSenderId:"145642656516",appId:"1:145642656516:web:0ac2da8931283121e87651",measurementId:"G-3LC8N6FFSH"},pe=Object.values(Pt).slice(0,6).every(Boolean),me=pe?en(Pt):null,B=me?tn(me):null,N=me?pn(me):null,Ue=me?gn(me):null,vn=me?new nn:null,P={users:"users",candidates:"candidates",openings:"openings",pipelines:"pipelines",applications:"applications",assessments:"assessments",activity:"candidateActivity",notifications:"notifications",notificationPreferences:"notificationPreferences"},Et="https://admin.nearwork.co/api/send-email";function H(){if(!me||!B||!N||!Ue)throw new Error("Missing Firebase environment variables. Copy .env.example to .env.local and fill in the Admin app config.")}async function Lt(e={}){var i,l;const t=String(e.email||((i=B==null?void 0:B.currentUser)==null?void 0:i.email)||"").trim().toLowerCase();if(!t)return{ok:!1,skipped:!0,reason:"Missing candidate email"};const n=e.name||((l=B==null?void 0:B.currentUser)==null?void 0:l.displayName)||"",s=e.firstName||n.split(/\s+/)[0]||"there",a=await fetch(Et,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({to:t,templateId:"account_created",data:{name:n||s,firstName:s,actionUrl:"https://talent.nearwork.co"}})});return a.json().catch(()=>({ok:a.ok}))}async function hn(e={},t={}){var l,d;const n=String((e==null?void 0:e.email)||((l=B==null?void 0:B.currentUser)==null?void 0:l.email)||"").trim().toLowerCase();if(!n)return{ok:!1,skipped:!0,reason:"Missing candidate email"};const s=(e==null?void 0:e.name)||((d=B==null?void 0:B.currentUser)==null?void 0:d.displayName)||"",a=(e==null?void 0:e.firstName)||s.split(/\s+/)[0]||"there",i=await fetch(Et,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({to:n,templateId:"job_applied",data:{name:s||a,firstName:a,roleTitle:t.title||t.role||t.openingTitle||"this role",openingCode:t.code||t.id||"",actionUrl:"https://talent.nearwork.co"}})});return i.json().catch(()=>({ok:i.ok}))}async function _t(e){H();const t=await Se(U(N,P.users,e));return t.exists()?{id:t.id,...t.data()}:null}async function yn(e){H();const t=String(e||"").trim(),n=t.toLowerCase(),s=ne(K(N,P.users),se("email","==",n),ae(1)),a=await ie(s);if(!a.empty)return{id:a.docs[0].id,...a.docs[0].data()};if(t===n)return null;const i=ne(K(N,P.users),se("email","==",t),ae(1)),l=await ie(i);return l.empty?null:{id:l.docs[0].id,...l.docs[0].data()}}async function Tt(e){const t=await _t(e.uid);if(t)return t;const n=await yn(e.email);return n?(await at(e.uid,{...n,email:e.email,connectedFromUserId:n.id}),{...n,id:e.uid,connectedFromUserId:n.id}):null}async function at(e,t){H();const n=t.candidateCode||$e(e),s={...t,candidateCode:n,role:"candidate",updatedAt:O()};await V(U(N,P.users,e),s,{merge:!0}),await V(U(N,P.candidates,n),je(e,{...s,candidateCode:n}),{merge:!0}).catch(()=>null),t.marketingConsent===!0&&ot({...s,candidateCode:n,source:"talent.nearwork.co"}).catch(()=>null)}function $e(e){return`CAND-${String(e||"").replace(/[^a-z0-9]/gi,"").slice(0,8).toUpperCase()||Date.now()}`}function wn(e){return String(e||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"")}function je(e,t){const n=t.candidateCode||$e(e),s=t.location||[t.locationCity||t.city,t.locationDepartment||t.department].filter(Boolean).join(", "),a=new Date().toISOString().slice(0,10);return{code:n,uid:e,ownerUid:e,name:t.name||"Talent member",role:t.targetRole||t.headline||"Nearwork candidate",skills:Array.isArray(t.skills)?t.skills:[],applied:t.applied||a,lastContact:t.lastContact||a,experience:Number(t.experience||0),location:s,city:wn(t.locationCity||t.city||s),department:t.locationDepartment||t.department||"",country:t.locationCountry||"Colombia",source:"talent.nearwork.co",status:t.status||"active",score:Number(t.score||50),email:t.email||"",phone:t.whatsapp||t.phone||"",whatsapp:t.whatsapp||t.phone||"",currentRole:t.currentRole||"",salary:t.salary||"",salaryUSD:Number(t.salaryUSD||0)||null,salaryAmount:Number(t.salaryAmount||t.expectedSalaryAmount||0)||null,salaryCurrency:t.salaryCurrency||t.expectedSalaryCurrency||"USD",expectedSalaryUSD:Number(t.expectedSalaryUSD||0)||null,expectedSalaryCOP:Number(t.expectedSalaryCOP||0)||null,expectedSalaryAmount:Number(t.expectedSalaryAmount||t.salaryAmount||0)||null,expectedSalaryCurrency:t.expectedSalaryCurrency||t.salaryCurrency||"USD",expectedSalary:t.expectedSalary||t.salary||"",availability:t.availability||"open",english:t.english||"",visa:t.visa||"No",linkedin:t.linkedin||"",cv:t.activeCvName||"",cvUrl:t.cvUrl||null,photoUrl:t.photoURL||t.photoUrl||null,tags:t.tags||["talent profile"],notes:t.summary||"",summary:t.summary||"",workHistory:Array.isArray(t.workHistory)?t.workHistory:[],languages:Array.isArray(t.languages)?t.languages:[],certifications:Array.isArray(t.certifications)?t.certifications:[],appliedBefore:!!t.appliedBefore,applications:t.applications||[],pipelineCodes:t.pipelineCodes||[],loom:t.loom||"Not uploaded",assessments:t.assessments||[],work:t.work||[],updatedAt:O()}}async function bn(e=!1){H();const t=await sn(B,vn),n=await Tt(t.user),s=new Date().toISOString(),a={email:t.user.email,name:t.user.displayName||"",availability:"open",onboarded:!1,privacyConsent:!0,privacyConsentAt:s,marketingConsent:e,marketingConsentAt:e?s:null},i=!n;i&&(await at(t.user.uid,a),Lt(a).catch(()=>null));const l=$e(t.user.uid),d={...n||a,candidateCode:l};return await V(U(N,P.candidates,l),je(t.user.uid,d),{merge:!0}).catch(()=>null),(i?e:(n==null?void 0:n.marketingConsent)===!0)&&ot({...d,candidateCode:l,source:"talent.nearwork.co"}).catch(()=>null),t.user}async function Sn(e){H();const t=ne(K(N,P.applications),se("candidateId","==",e),ae(20)),n=ne(K(N,P.applications),se("ownerUid","==",e),ae(20)),s=await Promise.allSettled([ie(t),ie(n)]),a=new Map;return s.forEach(i=>{i.status==="fulfilled"&&i.value.docs.forEach(l=>a.set(l.id,{id:l.id,...l.data()}))}),Array.from(a.values()).sort((i,l)=>{const d=c=>{var r,p;return((p=(r=c==null?void 0:c.toDate)==null?void 0:r.call(c))==null?void 0:p.getTime())??(c?new Date(c).getTime():0)};return d(l.updatedAt||l.createdAt)-d(i.updatedAt||i.createdAt)})}async function $n(e,t="",n=""){H();const s=String(t||"").trim().toLowerCase(),a=String(n||"").trim(),i=[ie(ne(K(N,P.assessments),se("candidateUid","==",e),ae(25))),ie(ne(K(N,P.assessments),se("candidateId","==",e),ae(25)))];s&&i.push(ie(ne(K(N,P.assessments),se("candidateEmail","==",s),ae(25)))),a&&i.push(ie(ne(K(N,P.assessments),se("candidateCode","==",a),ae(25))));const l=await Promise.allSettled(i),d=new Map;return l.forEach(c=>{c.status==="fulfilled"&&c.value.docs.forEach(r=>d.set(r.id,{id:r.id,...r.data()}))}),Array.from(d.values()).sort((c,r)=>{const p=u=>{var v,b;return((b=(v=u==null?void 0:u.toDate)==null?void 0:v.call(u))==null?void 0:b.getTime())??(u?new Date(u).getTime():0)};return p(r.updatedAt||r.createdAt||r.sentAt)-p(c.updatedAt||c.createdAt||c.sentAt)})}async function kn(e,t,n="",s=""){H();const a=await Se(U(N,P.assessments,e));if(!a.exists())return null;const i={id:a.id,...a.data()},l=String(n||"").trim().toLowerCase(),d=String(s||"").trim();return i.candidateUid===t||i.candidateId===t||String(i.candidateEmail||"").trim().toLowerCase()===l||String(i.candidateCode||"").trim()===d?i:null}async function Cn(e,t){H();const n=await Se(U(N,P.assessments,e)),s=n.exists()?n.data():{};if(s.status==="completed")throw new Error("This assessment is already completed.");if(s.expiresAt&&Date.now()>new Date(s.expiresAt).getTime())throw new Error("This assessment link has expired.");await V(U(N,P.assessments,e),{status:"started",currentQuestionIndex:Number(s.currentQuestionIndex||0),currentStage:Number(s.currentStage||1),technicalStartedAt:s.technicalStartedAt||O(),startedAt:s.startedAt||O(),updatedAt:O()},{merge:!0})}async function Le(e,t,n,s={}){H();const a=await Se(U(N,P.assessments,e)),i=a.exists()?a.data():{};if(i.status==="completed")throw new Error("This assessment is already completed.");if(i.expiresAt&&Date.now()>new Date(i.expiresAt).getTime())throw new Error("This assessment link has expired.");await V(U(N,P.assessments,e),{[`answers.${t}`]:n,progress:`${s.currentQuestionIndex||0}/${s.totalQuestions||""}`.replace(/\/$/,""),currentQuestionIndex:s.currentQuestionIndex||0,currentStage:s.currentStage||1,...s.discStartedAt?{discStartedAt:s.discStartedAt}:{},updatedAt:O()},{merge:!0})}async function xn(e,t,n={}){var v;H();const s=U(N,P.assessments,e),a=await Se(s),i=a.exists()?a.data():{};if(i.status==="completed")throw new Error("This assessment is already completed.");if(i.expiresAt&&Date.now()>new Date(i.expiresAt).getTime())throw new Error("This assessment link has expired.");const l=Object.values(t||{}).filter(b=>String((b==null?void 0:b.value)??b??"").trim()).length,d=Number(n.totalQuestions||Object.keys(t||{}).length||0),c=Number(n.technicalScore||0),r=Number(n.discScore||0),p=Number(n.score||(d?Math.round(l/d*100):0));await V(s,{answers:t,answeredCount:l,totalQuestions:d,score:p,technical:c||p,disc:((v=n.discProfile)==null?void 0:v.label)||(r?`${r}%`:"Submitted"),discScore:r,discProfile:n.discProfile||null,progress:`${l}/${d}`,status:"completed",finished:new Date().toLocaleString("en-US",{month:"short",day:"numeric",year:"numeric",hour:"numeric",minute:"2-digit"}),finishedAt:O(),updatedAt:O()},{merge:!0});const u=Math.round(p);i.candidateUid&&await V(U(N,P.users,i.candidateUid),{score:u,nwScore:u,lastAssessmentScore:u,lastAssessmentId:e,updatedAt:O()},{merge:!0}).catch(()=>null),i.candidateCode&&await V(U(N,P.candidates,i.candidateCode),{score:u,nwScore:u,lastAssessmentScore:u,lastAssessmentId:e,updatedAt:O()},{merge:!0}).catch(()=>null)}async function It(){H();const e=ne(K(N,P.openings),se("published","==",!0),ae(12));return(await ie(e)).docs.map(n=>({id:n.id,...n.data()}))}async function An(e,t){H();const n=t.code||t.id,s=await _t(e).catch(()=>null),a=(s==null?void 0:s.candidateCode)||$e(e),i=new Date().toISOString().slice(0,10),l={opening:n,openingCode:n,jobId:n,role:t.title||t.role||"Untitled role",openingTitle:t.title||t.role||"Untitled role",applied:i,appliedAt:i,status:"applied",outcome:"Application only",source:"talent.nearwork.co"},d={candidateId:e,ownerUid:e,authUid:e,candidateDocId:a,candidateCode:a,candidateEmail:(s==null?void 0:s.email)||"",candidateName:(s==null?void 0:s.name)||"",openingCode:n,jobId:n,openingTitle:t.title||t.role||"Untitled role",jobTitle:t.title||t.role||"Untitled role",title:t.title||t.role||"Untitled role",clientName:t.orgName||t.clientName||t.company||"Nearwork client",status:"applied",inPipeline:!1,isMockData:!1,source:"talent.nearwork.co",createdAt:O(),updatedAt:O()};await wt(K(N,P.applications),d),await V(U(N,P.candidates,a),{...je(e,{...s||{},candidateCode:a,appliedBefore:!0,lastContact:i}),applications:Ze(l),appliedBefore:!0},{merge:!0}).catch(()=>null),await V(U(N,P.users,e),{role:"candidate",candidateCode:a,code:a,applications:Ze(l),lastAppliedOpeningCode:n,lastAppliedAt:O(),updatedAt:O()},{merge:!0}).catch(()=>null),await wt(K(N,P.activity),{candidateId:e,type:"application_submitted",title:d.jobTitle,createdAt:O()}).catch(()=>null),hn(s,t).catch(()=>null)}async function Nn(e,t){await mn(U(N,P.users,e),{availability:t,updatedAt:O()})}async function it(e,t){H();const n=t.candidateCode||$e(e);await V(U(N,P.users,e),{...t,candidateCode:n,role:"candidate",updatedAt:O()},{merge:!0});try{return await V(U(N,P.candidates,n),je(e,{...t,candidateCode:n}),{merge:!0}),t.marketingConsent===!0&&ot({...t,candidateCode:n,source:"talent.nearwork.co"}).catch(()=>null),{candidateCode:n,atsSynced:!0}}catch(s){return console.warn("Candidate ATS sync failed.",s),{candidateCode:n,atsSynced:!1}}}async function ot(e){var s;const t=(e==null?void 0:e.email)||((s=B.currentUser)==null?void 0:s.email)||"";return t?(await fetch("/api/sync-hubspot-candidate",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({candidate:{...e,email:t}})})).json().catch(()=>({ok:!1})):{ok:!1,skipped:!0}}async function Pn(e,t){H();const n=t.name.replace(/[^a-z0-9._-]/gi,"-").toLowerCase(),s=`candidate-photos/${e}/${Date.now()}-${n}`,a=Xe(Ue,s);await At(a,t,{contentType:t.type||"application/octet-stream"});const i=await Nt(a);return await V(U(N,P.users,e),{photoURL:i,updatedAt:O()},{merge:!0}),i}async function et(e,t,n){H();let s=null,a=$e(e);try{const p=await Se(U(N,P.users,e));if(p.exists()){const u=p.data();s=u.activeCvId||null,u.candidateCode&&(a=u.candidateCode)}}catch{}const i=t.name.replace(/[^a-z0-9._-]/gi,"-").toLowerCase(),l=`candidate-cvs/${e}/${Date.now()}-${i}`,d=Xe(Ue,l);await At(d,t,{contentType:t.type||"application/octet-stream"});const c=await Nt(d),r={id:l,name:n||t.name,fileName:t.name,url:c,uploadedAt:new Date().toISOString()};return await V(U(N,P.users,e),{cvLibrary:Ze(r),activeCvId:r.id,activeCvName:r.name||r.fileName,cvUrl:c,updatedAt:O()},{merge:!0}),V(U(N,P.candidates,a),{cvUrl:c,activeCvId:r.id,activeCvName:r.name||r.fileName,updatedAt:O()},{merge:!0}).catch(()=>null),s&&s!==l&&fn(Xe(Ue,s)).catch(()=>{}),r}function En(e,t){if(H(),!e)return()=>{};const n=ne(K(N,P.notifications),se("recipientUid","==",e),ae(50));return un(n,s=>{const a=s.docs.map(i=>({id:i.id,...i.data()})).sort((i,l)=>{var r,p;const d=(r=i.createdAt)!=null&&r.toDate?i.createdAt.toDate().getTime():new Date(i.createdAt||0).getTime();return((p=l.createdAt)!=null&&p.toDate?l.createdAt.toDate().getTime():new Date(l.createdAt||0).getTime())-d});t(a)})}async function Ln(e){H(),e&&await V(U(N,P.notifications,e),{read:!0,readAt:O()},{merge:!0})}async function _n(e,t){H(),await V(U(N,P.notificationPreferences,e),{uid:e,app:"talent.nearwork.co",preferences:t,updatedAt:O()},{merge:!0})}async function rt(e){if(!e)return null;try{const t=await new Promise((v,b)=>{const _=new FileReader;_.onload=()=>v(_.result.split(",")[1]),_.onerror=b,_.readAsDataURL(e)}),n=await fetch("/api/parse-cv",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({data:t,filename:e.name,mimeType:e.type||"application/octet-stream"})});if(!n.ok)return null;const s=await n.json();if(!(s!=null&&s.ok))return null;const{name:a,phone:i,city:l,summary:d,skills:c,workHistory:r,languages:p,certifications:u}=s;return{name:a,phone:i,city:l,summary:d,skills:c,workHistory:r,languages:p||[],certifications:u||[]}}catch{return null}}let J=null,ye=!1,Fe=null,lt=1,x={},X=null,Te=null,R=null;const ct=document.querySelector("#app"),Tn="+573135928691",In="https://wa.me/573135928691",be={"Customer Success":["Customer Success Manager","Customer Success Associate","Account Manager","Implementation Specialist","Onboarding Specialist","Renewals Manager"],Sales:["SDR / Sales Development Rep","BDR / Business Development Rep","Account Executive","Sales Operations Specialist","Sales Manager"],Support:["Technical Support Specialist","Customer Support Representative","Support Team Lead","QA Support Analyst"],Operations:["Operations Manager","Operations Analyst","Executive Assistant","Virtual Assistant","Project Coordinator","Recruiting Coordinator"],Marketing:["Marketing Ops / Content Specialist","Content Writer","SEO Specialist","Lifecycle Marketing Specialist","Social Media Manager"],Engineering:["Software Developer (Full Stack)","Frontend Developer","Backend Developer","No-Code Developer","Data Analyst","QA Engineer"],Finance:["Bookkeeper","Accounting Assistant","Financial Analyst","Payroll Specialist"]},Dn={"CRM & Sales":["HubSpot","Salesforce","Pipedrive","Apollo","Outbound","Cold Email","Discovery Calls","CRM Hygiene"],"Customer Success":["SaaS","Customer Success","QBRs","Onboarding","Renewals","Expansion","Churn Reduction","Intercom","Zendesk"],Support:["Technical Support","Tickets","Troubleshooting","APIs","Bug Reproduction","Help Center","CSAT"],Operations:["Excel","Google Sheets","Reporting","Process Design","Project Management","Notion","Airtable","Zapier"],Marketing:["Content","SEO","Lifecycle","Email Marketing","HubSpot Marketing","Copywriting","Analytics"],Engineering:["JavaScript","React","Node.js","SQL","Python","REST APIs","QA","GitHub"],Language:["English B2","English C1","English C2","Spanish Native"]},qn=["Account Management","Accounts Payable","Accounts Receivable","Adobe Creative Suite","Agile","AI Tools","Analytics","Appointment Setting","B2B Sales","B2C Sales","Billing","Bookkeeping","Business Analysis","Canva","Cash Collections","Chat Support","Cold Calling","Community Management","Compliance","Content Strategy","Contract Management","Customer Onboarding","Customer Retention","Customer Service","Data Analysis","Data Entry","Email Support","Excel / Google Sheets","Executive Assistance","Figma","Financial Reporting","Forecasting","Helpdesk","HR Operations","Inbound Calls","Insurance Support","Lead Generation","Live Chat","Logistics","Looker","Microsoft Office","NetSuite","Outbound Calls","Payroll","Performance Marketing","Power BI","Product Support","QuickBooks","Recruiting","Salesforce Administration","Sales Operations","Shopify","Slack","Social Media","SQL Reporting","Stripe","Tableau","Technical Writing","Ticket Quality","Training","Vendor Management","WordPress","Workday","Workforce Management","Zendesk Guide","Zoho"],Dt=[...new Set([...Object.values(Dn).flat(),...qn])].sort((e,t)=>e.localeCompare(t)),qt={Amazonas:["Leticia","Puerto Nariño"],Antioquia:["Medellín","Abejorral","Apartadó","Bello","Caldas","Caucasia","Copacabana","El Carmen de Viboral","Envigado","Girardota","Itagüí","La Ceja","La Estrella","Marinilla","Rionegro","Sabaneta","Santa Fe de Antioquia","Turbo"],Arauca:["Arauca","Arauquita","Saravena","Tame"],Atlántico:["Barranquilla","Baranoa","Galapa","Malambo","Puerto Colombia","Sabanalarga","Soledad"],"Bogotá D.C.":["Bogotá"],Bolívar:["Cartagena","Arjona","El Carmen de Bolívar","Magangué","Mompox","Turbaco"],Boyacá:["Tunja","Chiquinquirá","Duitama","Paipa","Sogamoso","Villa de Leyva"],Caldas:["Manizales","Aguadas","Chinchiná","La Dorada","Riosucio","Villamaría"],Caquetá:["Florencia","El Doncello","Puerto Rico","San Vicente del Caguán"],Casanare:["Yopal","Aguazul","Paz de Ariporo","Villanueva"],Cauca:["Popayán","El Tambo","Puerto Tejada","Santander de Quilichao"],Cesar:["Valledupar","Aguachica","Bosconia","Codazzi"],Chocó:["Quibdó","Istmina","Nuquí","Tadó"],Córdoba:["Montería","Cereté","Lorica","Sahagún"],Cundinamarca:["Chía","Cajicá","Facatativá","Fusagasugá","Girardot","Madrid","Mosquera","Soacha","Tocancipá","Zipaquirá"],Guainía:["Inírida"],Guaviare:["San José del Guaviare","Calamar","El Retorno","Miraflores"],Huila:["Neiva","Garzón","La Plata","Pitalito"],"La Guajira":["Riohacha","Maicao","San Juan del Cesar","Uribia"],Magdalena:["Santa Marta","Ciénaga","El Banco","Fundación"],Meta:["Villavicencio","Acacías","Granada","Puerto López"],Nariño:["Pasto","Ipiales","Tumaco","Túquerres"],"Norte de Santander":["Cúcuta","Ocaña","Pamplona","Villa del Rosario"],Putumayo:["Mocoa","Orito","Puerto Asís","Valle del Guamuez"],Quindío:["Armenia","Calarcá","La Tebaida","Montenegro","Quimbaya"],Risaralda:["Pereira","Dosquebradas","La Virginia","Santa Rosa de Cabal"],"San Andrés y Providencia":["San Andrés","Providencia"],Santander:["Bucaramanga","Barrancabermeja","Floridablanca","Girón","Piedecuesta","San Gil"],Sucre:["Sincelejo","Corozal","Sampués","Tolú"],Tolima:["Ibagué","Espinal","Honda","Melgar"],"Valle del Cauca":["Cali","Buga","Buenaventura","Cartago","Jamundí","Palmira","Tuluá","Yumbo"],Vaupés:["Mitú"],Vichada:["Puerto Carreño","La Primavera","Santa Rosalía"]};let ee=qt;const Rn=[{title:"How to answer salary questions",tag:"Interview",read:"4 min",body:"Use a confident range, anchor it to the role, and avoid apologizing for earning in USD.",actions:["Know your floor","Use monthly USD","Mention flexibility last"]},{title:"Writing a CV for US SaaS companies",tag:"CV",read:"6 min",body:"Translate local experience into metrics US hiring managers can scan in under a minute.",actions:["Lead with outcomes","Add tools","Quantify scope"]},{title:"Before your recruiter screen",tag:"Process",read:"3 min",body:"Prepare availability, compensation, English comfort, and two strong role stories.",actions:["Check your setup","Review the opening","Bring questions"]},{title:"STAR stories that feel natural",tag:"Interview",read:"5 min",body:"Keep stories specific, concise, and tied to business impact instead of job duties.",actions:["Situation","Action","Result"]}],bt=[{key:"profile-review",label:"Profile Review",help:"We are checking role fit and your candidate profile."},{key:"background-check",label:"Background Checks",help:"Nearwork is verifying relevant background and work details."},{key:"assessment",label:"Assessment",help:"Complete role-specific questions when assigned."},{key:"interview",label:"Interview",help:"Meet the recruiter and book your next conversation."},{key:"presented",label:"Presented",help:"Your profile has been prepared for the company."},{key:"client-review",label:"Client Review",help:"The company is reviewing your profile and next steps."},{key:"hired",label:"Hired",help:"Offer accepted and onboarding is ready to begin."}];let o={user:null,candidate:null,applications:[],assessments:[],notifications:[],notificationPanelOpen:!1,notificationSettingsOpen:!1,jobs:[],loading:!0,view:"login",activePage:"overview",matchesFiltered:!1,message:"",assessmentUiStep:null},oe=null;const We=sessionStorage.getItem("nw_restore_path");We&&(sessionStorage.removeItem("nw_restore_path"),window.history.replaceState({page:We},"",We));function Rt(){return[["overview","layout-dashboard","Overview"],["matches","briefcase-business","Matches"],["applications","send","Applications"],["assessment","clipboard-check","Assessment"],["cvs","files","CV Picker"],["tips","book-open","Tips"],["recruiter","calendar-days","Recruiter"],["profile","user-round-cog","Profile"]]}function Oe(){const t=window.location.pathname.split("/").filter(Boolean)[0];return t==="onboarding"?"onboarding":t==="assessment"||t==="assessments"?"assessment":Rt().some(([n])=>n===t)?t:"overview"}function ce(){const e=window.location.pathname.split("/").filter(Boolean);return(e[0]==="assessment"||e[0]==="assessments")&&e[1]||""}function Mt(){const e=window.location.pathname.split("/").filter(Boolean),t=e.findIndex(s=>s==="q"||s==="question");if(t===-1)return null;const n=Number(e[t+1]);return Number.isFinite(n)&&n>0?n-1:null}function Mn(e,t=0){return`/assessment/${encodeURIComponent(e)}/start/q/${Number(t||0)+1}`}function he(e,t=0,n=!1){const s=Mn(e,t);if(window.location.pathname===s)return;const a=n?"replaceState":"pushState";window.history[a]({page:"assessment",assessmentId:e,questionIndex:t},"",s)}function g(e,t){return`<i data-lucide="${e}" aria-label="${e}"></i>`}function He(){window.lucide&&window.lucide.createIcons()}function k(e){o={...o,...e},Zt()}function Re(e,t=!0){const s=e==="onboarding"||Rt().some(([a])=>a===e)?e:"overview";o={...o,activePage:s,matchesFiltered:s==="matches"?o.matchesFiltered:!1,message:"",assessmentUiStep:null},t&&window.history.pushState({page:s},"",s==="overview"?"/":`/${s}`),Zt()}function Ut(){var t,n;return(((t=o.candidate)==null?void 0:t.name)||((n=o.user)==null?void 0:n.displayName)||"there").split(" ")[0]||"there"}function Un(){var t,n,s;return(((t=o.candidate)==null?void 0:t.name)||((n=o.user)==null?void 0:n.displayName)||((s=o.user)==null?void 0:s.email)||"NW").split(/[ @.]/).filter(Boolean).slice(0,2).map(a=>a[0]).join("").toUpperCase()}function Ft(e="normal"){var s,a;const t=((s=o.candidate)==null?void 0:s.photoURL)||((a=o.user)==null?void 0:a.photoURL)||"",n=e==="large"?"avatar avatar-large":"avatar";return t?`<img class="${n}" src="${S(t)}" alt="${S(Ut())}" />`:`<div class="${n}">${Un()}</div>`}function S(e){return String(e||"").replaceAll("&","&amp;").replaceAll('"',"&quot;").replaceAll("<","&lt;").replaceAll(">","&gt;")}function q(e){return String(e||"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;")}function ze(e){if(!e)return"Recently";const t=e.toDate?e.toDate():new Date(e);return new Intl.DateTimeFormat("en",{month:"short",day:"numeric"}).format(t)}function ke(){var t;const e=((t=o.candidate)==null?void 0:t.skills)||[];return Array.isArray(e)?e:String(e).split(",").map(n=>n.trim()).filter(Boolean)}function z(e){return String(e||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/&/g," and ").replace(/[^a-z0-9]+/g," ").trim().replace(/\s+/g," ")}function dt(e,t=ke()){const n=ge(e),s=new Set((n.skills||[]).map(z).filter(Boolean)),a=new Map(t.map(i=>[z(i),i]).filter(([i])=>i));return[...a.keys()].filter(i=>s.has(i)).map(i=>a.get(i))}function pt(e){return["Nearwork candidate","Talent member"].includes(String(e||"").trim())}function St(e){if(!e)return null;if(e.toDate)return e.toDate();if(typeof e=="object"&&typeof e.seconds=="number")return new Date(e.seconds*1e3);const t=new Date(e);return Number.isNaN(t.getTime())?null:t}function ut(e){return Number(e||1)===1?"Technical Assessment":"DISC Assessment"}function Ye(e,t){var n,s,a;return((s=(n=e==null?void 0:e.answers)==null?void 0:n[t==null?void 0:t.id])==null?void 0:s.value)??((a=e==null?void 0:e.answers)==null?void 0:a[t==null?void 0:t.id])??""}function we(e){return e!=null&&e!==""}function Z(e,t){return((e==null?void 0:e.questions)||[]).slice(0,70).filter(n=>Number(n.stage||1)===Number(t))}function tt(e,t,n=(e==null?void 0:e.answers)||{}){return Z(e,t).filter(s=>{var a;return!we(((a=n[s.id])==null?void 0:a.value)??n[s.id])})}function Fn(){var e,t;return!!((o.applications||[]).length||(((e=o.candidate)==null?void 0:e.pipelineCodes)||[]).length||(t=o.candidate)!=null&&t.pipelineCode)}function On(){var s,a,i;const e=((s=o.candidate)==null?void 0:s.department)||"Bogotá D.C.",t=ee[e]||ee["Bogotá D.C."]||["Bogotá"],n=((a=o.candidate)==null?void 0:a.city)||((i=o.candidate)==null?void 0:i.locationCity)||t[0];return{department:e,city:n,label:`${n}, ${e}`}}async function Bn(){try{const e=await fetch("/api/locations?ts="+Date.now(),{cache:"no-store"}),t=await e.json();if(!e.ok||!t.ok||!t.departments)throw new Error(t.error||"Location API unavailable");ee=t.departments}catch(e){console.warn("Using bundled Colombia locations:",e.message||e),ee=qt}}function jn(){var t,n,s;const e=((t=o.candidate)==null?void 0:t.targetRole)||((n=o.candidate)==null?void 0:n.headline)||"";return((s=Object.entries(be).find(([,a])=>a.includes(e)))==null?void 0:s[0])||Object.keys(be)[0]}function Ot(e){return Object.keys(be).map(t=>`<option value="${S(t)}" ${t===e?"selected":""}>${t}</option>`).join("")}function Ve(e,t){const n=be[e]||Object.values(be).flat();return['<option value="">Choose the closest role</option>'].concat(n.map(s=>`<option value="${S(s)}" ${t===s?"selected":""}>${s}</option>`)).join("")}function ve(e){const t=String(e||"").replace(/[,.\s]+$/,"").replace(/^[,.\s]+/,"").trim();if(!t||t.length<2)return"";const n=Dt.find(s=>z(s)===z(t));return n||t.split(/\s+/).map(s=>s.length<=3&&s===s.toUpperCase()?s:s.charAt(0).toUpperCase()+s.slice(1).toLowerCase()).join(" ")}function Bt(e){const t=[...new Set((e||[]).map(ve).filter(Boolean))],n=["Customer Service","Salesforce","HubSpot","Excel","Google Sheets","Technical Support","Outbound Calls","React","SQL","Payroll"];return`
    <div class="skill-search-shell" data-skill-search>
      <div class="selected-skills" id="selectedSkills">
        ${t.map(s=>`
          <span class="selected-skill" data-skill-chip="${S(s)}">
            ${q(s)}
            <button type="button" class="skill-remove" data-remove-skill="${S(s)}" aria-label="Remove ${S(s)}">×</button>
            <input type="hidden" name="skills" value="${S(s)}" />
          </span>
        `).join("")||'<span class="skill-empty">Selected skills will appear here.</span>'}
      </div>
      <div class="skill-search-box">
        <input id="skillSearchInput" type="search" autocomplete="off" placeholder="Type any skill — e.g. Salesforce, Excel, B2B sales, Canva…" />
        <button class="secondary-action" type="button" id="addTypedSkill">Add skill</button>
      </div>
      <div class="skill-suggestions" id="skillSuggestions">
        ${n.map(s=>`<button type="button" class="skill-suggestion" data-skill="${S(s)}">${q(s)}</button>`).join("")}
      </div>
      <p class="field-hint">Select between 5 and 20 skills that best describe your experience.</p>
    </div>
  `}function jt(e,t="USD"){const n=Number(String(e||"").replace(/[^\d.]/g,"")),s=String(t||"USD").toUpperCase()==="COP"?"COP":"USD";if(!Number.isFinite(n)||n<=0)return{salary:"",salaryUSD:null,salaryCurrency:s,salaryAmount:null};const a=Math.round(n),i=s==="COP"?"es-CO":"en-US";return{salary:`$${new Intl.NumberFormat(i).format(a)} ${s}/mo`,salaryUSD:s==="USD"?a:null,salaryCurrency:s,salaryAmount:a}}function Ht(e){return Number(String(e||"").replace(/[^\d.]/g,""))}function $t(e,t="USD"){const n=Ht(e),s=String(t||"USD").toUpperCase()==="COP"?"COP":"USD";return s==="USD"&&n>=1e5?"COP":s}function kt(e,t="USD"){const n=Ht(e);return!Number.isFinite(n)||n<=0?"":new Intl.NumberFormat("en-US",{maximumFractionDigits:0}).format(Math.round(n))}function zt(e){return Array.isArray(e)?e:String(e||"").split(",").map(t=>t.trim()).filter(Boolean)}function ge(e){const t=zt(e.skills||e.requiredSkills);return{id:e.id||e.code,code:e.code||e.id,title:e.title||e.role||e.openingTitle||"Open role",orgName:e.orgName||e.company||e.clientName||"Nearwork client",location:e.location||"Remote",compensation:e.compensation||e.salary||e.rate||"Competitive",match:e.match||null,skills:t,description:e.description||e.about||"Nearwork is reviewing candidates for this role now."}}function de(e){const t=(e==null?void 0:e.code)||"";return t.includes("operation-not-allowed")?"This sign-in method is not available yet.":t.includes("unauthorized-domain")?"This website still needs to be approved for sign-in.":t.includes("permission-denied")?"We could not save this yet. Please try again in a moment or contact Nearwork support.":t.includes("weak-password")?"Password must be at least 6 characters.":t.includes("invalid-credential")||t.includes("wrong-password")?"That email/password did not match. If this account was created with Google, use Continue with Google.":t.includes("user-not-found")?"No account exists for that email yet.":t.includes("email-already-in-use")?"That email already has an account. Sign in or use Google.":t.includes("popup")?"The Google sign-in popup was closed before finishing.":"Something went wrong. Please try again or contact Nearwork support."}function Hn(e){ct.innerHTML=`
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
  `,He()}function Vt(e="login"){var n;const t=e==="signup";Hn(`
    <section class="auth-panel">
      <div class="right-brand">Near<span>work</span></div>
      <div class="candidate-chip">For candidates</div>
      <div class="panel-heading">
        <h2>${t?"Create your account.":"Welcome back."}</h2>
        <p>${t?"Create your profile, browse roles, and track your application.":"Use Google if your candidate account was created with Google."}</p>
      </div>
      ${o.message?`<div class="notice">${g("lock")} ${S(o.message)}</div>`:""}
      ${pe?"":`<div class="notice">${g("triangle-alert")} Sign-in is still being set up.</div>`}
      <button id="googleSignIn" class="social-action" type="button">
        <span class="google-dot">G</span>
        Continue with Google
      </button>
      <div class="divider"><span></span>or use email<span></span></div>
      <form id="authForm" class="stacked-form">
        ${t?'<label>Full name<input name="name" type="text" autocomplete="name" placeholder="Full name" required /></label>':""}
        <label>Email<input name="email" type="email" autocomplete="email" placeholder="you@example.com" required /></label>
        <label>Password
          <div class="password-field">
            <input name="password" type="password" autocomplete="${t?"new-password":"current-password"}" minlength="6" placeholder="••••••••" required />
            <button type="button" class="password-toggle" data-password-toggle aria-label="Show password">${g("eye")}</button>
          </div>
        </label>
        ${t?`
        <div id="consentBlock" style="margin:2px 0 4px;">
          <label style="display:flex;align-items:flex-start;gap:9px;cursor:pointer;font-size:13px;color:#2d2d2d;line-height:1.5;margin-bottom:3px;">
            <input type="checkbox" name="privacyConsent" id="privacyConsent" style="width:16px!important;height:16px!important;min-height:16px!important;min-width:16px!important;padding:0!important;border:1px solid #aaa!important;border-radius:3px!important;background:#fff!important;flex-shrink:0;margin-top:3px;accent-color:#16a085;cursor:pointer;">
            <span>I have read and agree to Nearwork's <a href="https://nearwork.co/privacy" target="_blank" rel="noopener" style="color:#16a085;text-decoration:underline;">Privacy Policy</a> and <a href="https://nearwork.co/terms" target="_blank" rel="noopener" style="color:#16a085;text-decoration:underline;">Terms of Service</a> *</span>
          </label>
          <p id="privacyConsentError" style="display:none;font-size:12px;color:#c0392b;margin:2px 0 6px 27px;">You must accept the Privacy Policy to continue</p>
          <label style="display:flex;align-items:flex-start;gap:9px;cursor:pointer;margin-top:10px;font-size:13px;color:#555;line-height:1.5;">
            <input type="checkbox" name="marketingConsent" id="marketingConsent" style="width:16px!important;height:16px!important;min-height:16px!important;min-width:16px!important;padding:0!important;border:1px solid #aaa!important;border-radius:3px!important;background:#fff!important;flex-shrink:0;margin-top:3px;accent-color:#16a085;cursor:pointer;">
            <span>I agree to receive future job opportunities and updates from Nearwork (optional)</span>
          </label>
        </div>`:""}
        <button class="primary-action" type="submit">${g(t?"user-plus":"log-in")} ${t?"Create account":"Sign in"}</button>
        <p id="formMessage" class="form-message" role="status"></p>
      </form>
      ${t?"":'<button id="resetPassword" class="text-action small" type="button">Forgot password?</button>'}
      <button id="toggleMode" class="text-action" type="button">${t?"Already have an account? Sign in":"New or invited by Nearwork? Create your profile"}</button>
    </section>
  `),document.querySelector("#toggleMode").addEventListener("click",()=>Vt(t?"login":"signup")),document.querySelectorAll("[data-password-toggle]").forEach(s=>{s.addEventListener("click",()=>{const a=s.previousElementSibling,i=a.type==="password";a.type=i?"text":"password",s.innerHTML=g(i?"eye-off":"eye"),s.setAttribute("aria-label",i?"Hide password":"Show password"),He()})}),document.querySelector("#googleSignIn").addEventListener("click",async()=>{var i;const s=document.querySelector("#formMessage");if(s.textContent="",t){const l=document.querySelector("#privacyConsent"),d=document.querySelector("#privacyConsentError");if(l&&!l.checked){d&&(d.style.display=""),s.textContent="Please accept the Privacy Policy to continue.",l.scrollIntoView({behavior:"smooth",block:"center"});return}d&&(d.style.display="none")}const a=t?((i=document.querySelector("#marketingConsent"))==null?void 0:i.checked)===!0:!1;try{await bn(a)}catch(l){s.textContent=de(l)}}),(n=document.querySelector("#resetPassword"))==null||n.addEventListener("click",async()=>{const s=document.querySelector("input[name='email']").value.trim().toLowerCase(),a=document.querySelector("#formMessage");if(!s){a.textContent="Enter your email first, then request a reset link.";return}try{await on(B,s),a.textContent=`Password reset sent to ${s}.`}catch(i){a.textContent=de(i)}}),document.querySelector("#authForm").addEventListener("submit",async s=>{var r;s.preventDefault();const a=new FormData(s.currentTarget),i=document.querySelector("#formMessage"),l=String(a.get("email")).trim().toLowerCase();if(i.textContent="",t){const p=document.querySelector("#privacyConsent"),u=document.querySelector("#privacyConsentError");if(p&&!p.checked){u&&(u.style.display=""),i.textContent="Please accept the Privacy Policy to continue.";return}u&&(u.style.display="none")}const d=t?((r=document.querySelector("#marketingConsent"))==null?void 0:r.checked)===!0:!1,c=new Date().toISOString();try{if(t){const p=await rn(B,l,a.get("password"));await ln(p.user,{displayName:a.get("name")}),sessionStorage.setItem("nw_new_account","1"),await at(p.user.uid,{name:a.get("name"),email:l,availability:"open",headline:"Nearwork candidate",onboarded:!1,source:"talent.nearwork.co",privacyConsent:!0,privacyConsentAt:c,marketingConsent:d,marketingConsentAt:d?c:null}),Lt({name:a.get("name"),firstName:String(a.get("name")||"").trim().split(/\s+/)[0],email:l}).catch(()=>null)}else await cn(B,l,a.get("password"))}catch(p){i.textContent=de(p)}})}async function Qt(e){k({loading:!0,user:e});try{await Bn();const[t,n,s]=await Promise.allSettled([Tt(e),Sn(e.uid),It()]),a=t.status==="fulfilled"?t.value:null,i=n.status==="fulfilled"?n.value:[],l=s.status==="fulfilled"?s.value:[];let d=[];try{d=await $n(e.uid,e.email,(a==null?void 0:a.candidateCode)||(a==null?void 0:a.code)||"")}catch(b){console.warn(b)}const c=ce();if(c&&!d.some(b=>b.id===c)){const b=await kn(c,e.uid,e.email,(a==null?void 0:a.candidateCode)||(a==null?void 0:a.code)||"").catch(()=>null);b&&(d=[b,...d])}const r=sessionStorage.getItem("nw_new_account")==="1";r&&sessionStorage.removeItem("nw_new_account");const p=!(a!=null&&a.onboarded)&&!(a!=null&&a.targetRole);!(a!=null&&a.onboarded)&&(a==null?void 0:a.targetRole)&&it(e.uid,{onboarded:!0,candidateCode:a==null?void 0:a.candidateCode}).catch(()=>null);const v=r||p?"onboarding":Oe();k({candidate:{...a||{},name:(a==null?void 0:a.name)||e.displayName||"Talent member",email:(a==null?void 0:a.email)||e.email,availability:(a==null?void 0:a.availability)||"open",headline:(a==null?void 0:a.headline)||(a==null?void 0:a.targetRole)||"Nearwork candidate"},applications:i,assessments:d,jobs:l.map(ge),loading:!1,view:"dashboard",activePage:v,message:""}),oe&&oe(),pe&&(oe=En(e.uid,b=>{o.notifications=b,o.view==="dashboard"&&!o.message&&Wt()}))}catch(t){console.warn(t),k({candidate:{name:e.displayName||"Talent member",email:e.email,availability:"open",headline:"Nearwork candidate"},applications:[],assessments:[],jobs:[],loading:!1,view:"dashboard",activePage:Oe(),message:""})}}async function Me(){const e=Oe();if(e==="assessment"){sessionStorage.setItem("nw_restore_path",window.location.pathname),k({user:null,candidate:null,applications:[],assessments:[],jobs:[],loading:!1,view:"login",activePage:"overview",message:"Please log in to open your assessment."});return}if(e==="overview"){oe&&oe(),oe=null,k({user:null,candidate:null,loading:!1,view:"login",activePage:"overview"});return}let t=[];try{const n=await It();n.length&&(t=n.map(ge))}catch(n){console.warn(n)}k({user:null,candidate:null,applications:[],assessments:[],jobs:t,loading:!1,view:"login",activePage:"overview",message:"Please log in to view your profile, matched openings, applications, and assessments."})}function zn(){return[{label:"My journey",items:[["overview","layout-dashboard","Overview"],["applications","send","Applications"],["assessment","clipboard-check","Assessment"]]},{label:"My search",items:[["matches","briefcase-business","Matches"],["cvs","files","CV Picker"]]},{label:"Support",items:[["tips","book-open","Tips"],["recruiter","calendar-days","Recruiter"],["profile","user-round-cog","Profile"]]}]}function Vn(){var e;return{open:"Open to roles",interviewing:"Interviewing",paused:"Not looking"}[((e=o.candidate)==null?void 0:e.availability)||"open"]||"Open to roles"}function Gt(){const e=o.candidate||{},t=ke();return[{id:"name",label:"Full name",done:!!e.name},{id:"role",label:"Target role",done:!!(e.targetRole||!pt(e.headline)&&e.headline)},{id:"location",label:"City",done:!!e.city},{id:"salary",label:"Salary",done:!!(e.salaryAmount||e.salary)},{id:"english",label:"English",done:!!e.english},{id:"whatsapp",label:"WhatsApp",done:!!(e.whatsapp||e.phone)},{id:"skills",label:"Skills (5-20)",done:t.length>=5},{id:"cv",label:"CV",done:!!e.cvUrl}]}function Wt(){var l,d,c,r,p;const e=(o.notifications||[]).filter(u=>!u.read).length,t=((l=o.candidate)==null?void 0:l.availability)||"open",s={open:"#16A085",interviewing:"#EAB308",paused:"#9E9E9E"}[t]||"#16A085",a=((d=o.candidate)==null?void 0:d.name)||((c=o.user)==null?void 0:c.displayName)||"Talent member",i=((r=o.candidate)==null?void 0:r.headline)||((p=o.candidate)==null?void 0:p.targetRole)||"Nearwork candidate";ct.innerHTML=`
    <main class="nw-dashboard">

      <!-- ── Sidebar ── -->
      <aside class="nw-sidebar">
        <!-- Logo -->
        <button class="nw-logo" type="button" data-dashboard-home>
          <div class="nw-logo-box">N<div class="nw-logo-bar"></div></div>
          <div>
            <div class="nw-logo-name">Nearwork</div>
            <div class="nw-logo-sub">Talent portal</div>
          </div>
        </button>

        <!-- Profile card -->
        <div class="nw-sidebar-profile">
          ${Ft()}
          <div class="nw-sidebar-profile-text">
            <div class="nw-sidebar-profile-name">${q(a)}</div>
            <div class="nw-sidebar-profile-role">${q(i)}</div>
          </div>
        </div>

        <!-- Nav sections -->
        <nav class="nw-sidebar-nav">
          ${zn().map(u=>`
            <div class="nw-nav-group">
              <div class="nw-nav-group-label">${u.label}</div>
              ${u.items.map(([v,b,_])=>`
                <button class="nw-nav-item${o.activePage===v?" active":""}" data-page="${v}" type="button">
                  ${g(b)} ${_}
                </button>
              `).join("")}
            </div>
          `).join("")}
          <div class="nw-nav-group">
            <a class="nw-nav-item nw-nav-external" href="https://jobs.nearwork.co" target="_blank" rel="noreferrer">
              ${g("external-link")} Browse jobs
            </a>
          </div>
        </nav>

        <!-- Sign out -->
        <button id="${o.user?"signOut":"signIn"}" class="nw-sidebar-signout" type="button">
          ${g(o.user?"log-out":"log-in")} ${o.user?"Sign out":"Sign in"}
        </button>
      </aside>

      <!-- ── Main workspace ── -->
      <section class="nw-workspace">

        <!-- Top bar -->
        <div class="nw-topbar">
          <div class="nw-topbar-search">
            ${g("search")}
            <input class="nw-search-input" placeholder="Search roles, companies, skills…" tabindex="-1" />
          </div>
          <div class="nw-topbar-right">
            <!-- Availability pill (wraps the real select for functionality) -->
            <div class="nw-avail-pill">
              <span class="nw-avail-dot" style="background:${s};box-shadow:0 0 0 3px ${s}26;"></span>
              <span class="nw-avail-label">${Vn()}</span>
              ${g("chevron-down")}
              <select id="availability" class="nw-avail-select" aria-label="Availability">
                <option value="open"         ${t==="open"?"selected":""}>Open to roles</option>
                <option value="interviewing" ${t==="interviewing"?"selected":""}>Interviewing</option>
                <option value="paused"       ${t==="paused"?"selected":""}>Not looking</option>
              </select>
            </div>

            <!-- Notifications -->
            <div class="nw-notif-wrap">
              <button class="nw-icon-btn" type="button" id="notificationBell" aria-label="Notifications">
                ${g("bell")}
                ${e?'<span class="nw-notif-badge"></span>':""}
              </button>
              ${o.notificationPanelOpen?Gn():""}
            </div>
            <button class="nw-icon-btn" type="button" id="notificationSettings" aria-label="Settings">
              ${g("settings")}
            </button>
          </div>
        </div>

        <!-- Notification settings -->
        ${o.notificationSettingsOpen?Wn():""}

        <!-- Page content -->
        ${o.message?`<div class="notice" style="margin:0 36px;">${o.message}</div>`:""}
        <div class="nw-page-content">
          ${(()=>{try{return Kn()}catch(u){return console.error("renderActivePage error:",u),'<div class="notice">Page failed to render. <button type="button" data-page="overview">Go to overview</button></div>'}})()}
        </div>
      </section>
    </main>
  `,He(),_s(),Jn(),Yn()}function Qn(e){return(e!=null&&e.toDate?e.toDate():new Date(e||Date.now())).toLocaleString("en-US",{month:"short",day:"numeric",year:"numeric",hour:"numeric",minute:"2-digit"})}function Gn(){const e=(o.notifications||[]).slice(0,10);return`
    <div class="notification-panel">
      <div class="notification-panel-head"><strong>Notifications</strong><span>${e.length?"Latest updates":"All clear"}</span></div>
      ${e.length?e.map(t=>`
        <button class="notification-item ${t.read?"":"unread"}" type="button" data-notification-read="${t.id}">
          <strong>${S(t.title||"Nearwork update")}</strong>
          <span>${S(t.message||"")}</span>
          <time>${Qn(t.createdAt)}</time>
        </button>
      `).join(""):'<div class="notification-empty">No notifications yet.</div>'}
    </div>
  `}function Wn(){var n;const e=((n=o.candidate)==null?void 0:n.notificationPreferences)||{};return`
    <section class="notification-settings-card">
      <div class="section-heading"><div><p class="eyebrow">Settings</p><h2>Notification preferences</h2></div></div>
      <div class="notification-settings-grid">
        ${[["recruitmentUpdates","Recruitment updates"],["assessmentUpdates","Assessment updates"],["mentions","Mentions"],["openingMovement","Opening movement"],["jobAlerts","Similar role alerts"]].map(([s,a])=>{const i=e[s]||{};return`<div class="notification-setting-row">
            <strong>${a}</strong>
            <label><input type="checkbox" data-notification-pref="${s}" data-channel="app" ${i.app!==!1?"checked":""}> In-app</label>
            <label><input type="checkbox" data-notification-pref="${s}" data-channel="email" ${i.email!==!1?"checked":""}> Email</label>
          </div>`}).join("")}
      </div>
      <p class="field-hint">Email notifications are grouped with a 2-hour buffer. The bell always keeps the detailed history with date and time.</p>
    </section>
  `}let De=null;function Yn(){De&&window.clearInterval(De);const e=document.querySelector("#assessmentTimer");if(!e)return;const t=new Date(e.dataset.end||"").getTime(),n=()=>{const s=Math.max(0,t-Date.now()),a=Math.floor(s/1e3),i=Math.floor(a/60),l=String(a%60).padStart(2,"0");e.textContent=`${i}:${l}`,e.classList.toggle("is-low",s<=10*60*1e3),s<=0&&window.clearInterval(De)};n(),De=window.setInterval(n,1e3)}function Jn(){if(o.activePage!=="assessment")return;const e=o.assessments||[],t=ce(),s=(t?e.find(i=>i.id===t):null)||e.find(i=>["sent","started"].includes(String(i.status||"").toLowerCase()));if(!(s!=null&&s.id))return;const a=String(s.status||"").toLowerCase();if(a==="started"&&Mt()===null){he(s.id,Number(s.currentQuestionIndex||0),!0);return}if(!t&&a==="sent"){const i=`/assessment/${encodeURIComponent(s.id)}/start`;window.history.replaceState({page:"assessment",assessmentId:s.id},"",i)}}function Kn(){return({onboarding:Zn,overview:Ct,matches:as,applications:is,assessment:os,cvs:ws,tips:bs,recruiter:Ss,profile:$s}[o.activePage]||Ct)()}function Ct(){var C,T;const e=Yt(),t=Gt(),n=t.filter($=>$.done).length,s=t.length,a=o.applications||[],i=a.filter($=>["action-needed","interview-scheduled","assessment-sent"].includes(String($.status||"").toLowerCase())).length,l=(o.jobs||[]).slice(0,3),d=((C=o.candidate)==null?void 0:C.recruiter)||{},c=2*Math.PI*52,r=c*(1-e/100),u=new Date().toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"}),v=($,f,m,h,w)=>`
    <div class="nw-stat-tile">
      <div class="nw-stat-tile-top">
        <span class="nw-stat-tile-label">${$}</span>
        <div class="nw-stat-icon" style="background:${h}14;">
          ${g(w)}
        </div>
      </div>
      <div class="nw-stat-value">${f}</div>
      <div class="nw-stat-sub">${m}</div>
    </div>`,b=($,f)=>{const m=["Applied","Assessment","Interview","Final round","Offer"],h=String($.stage||$.status||"applied").toLowerCase(),w=h.includes("offer")?4:h.includes("final")?3:h.includes("interview")?2:h.includes("assessment")?1:0,y=$.clientName||$.company||"Nearwork client",A=y.split(/\s+/).slice(0,2).map(E=>E[0]).join("").toUpperCase(),D=["#16A085","#AF7AC5","#E74C7C","#3B82F6","#EAB308"],M=D[y.length%D.length];return`
      <div class="nw-app-row${f?" last":""}">
        <div class="nw-app-avatar" style="background:${M};">${A}</div>
        <div class="nw-app-info">
          <div class="nw-app-title">${q($.jobTitle||$.title||"Application")} <span class="nw-app-company">· ${q(y)}</span></div>
          <div class="nw-app-stages">
            ${m.map((E,L)=>`<div class="nw-stage-pip${L<=w?" done":""}"></div>`).join("")}
            <span class="nw-app-stage-label">${$.stage||$.status||"Applied"}</span>
          </div>
        </div>
        <div class="nw-app-meta">
          <span class="nw-app-status${i?" action":""}">${$.status||"In review"}</span>
          <div class="nw-app-date">${ze($.updatedAt||$.createdAt)}</div>
        </div>
        ${g("chevron-right")}
      </div>`},_=$=>{const f=ge($),m=dt(f),h=f.match||(m.length>=3?Math.min(97,70+m.length*4):null),w=["#16A085","#AF7AC5","#E74C7C","#3B82F6"],y=w[f.orgName.length%w.length],A=f.orgName.split(/\s+/).slice(0,2).map(M=>M[0]).join("").toUpperCase(),D=`https://jobs.nearwork.co/apply?code=${encodeURIComponent(f.code)}`;return`
      <div class="nw-match-card">
        <div class="nw-match-card-top">
          <div class="nw-match-avatar" style="background:${y};">${A}</div>
          ${h?`<div class="nw-match-score">${h}%</div>`:""}
        </div>
        <div class="nw-match-role">${q(f.title)}</div>
        <div class="nw-match-company">${q(f.orgName)} · ${q(f.location)}</div>
        ${m.length?`<div class="nw-match-why">${m.slice(0,3).map(q).join(" · ")} match</div>`:`<div class="nw-match-why">${q(f.description).slice(0,80)}…</div>`}
        <div class="nw-match-footer">
          <span class="nw-match-salary">${q(f.compensation)}</span>
          <a href="${D}" target="_blank" rel="noreferrer" class="nw-match-apply">Apply ${g("arrow-right")}</a>
        </div>
      </div>`};return`
    <!-- Greeting -->
    <div class="nw-overview-header">
      <div class="nw-overview-date">Overview · ${u}</div>
      <h1 class="nw-overview-greeting">
        Hi ${q(Ut())},
        ${i>0?`<span class="nw-greeting-muted">you have</span> <span class="nw-greeting-accent">${i} thing${i>1?"s":""}</span> <span class="nw-greeting-muted">that need you.</span>`:`<span class="nw-greeting-muted">let's get you matched.</span>`}
      </h1>
    </div>

    <!-- Readiness card -->
    <div class="nw-readiness-card">
      <div class="nw-readiness-donut">
        <svg viewBox="0 0 120 120" style="width:100%;height:100%;transform:rotate(-90deg);">
          <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,0.12)" stroke-width="8"/>
          <circle cx="60" cy="60" r="52" fill="none" stroke="#16A085" stroke-width="8"
            stroke-dasharray="${c.toFixed(1)}" stroke-dashoffset="${r.toFixed(1)}"
            stroke-linecap="round"/>
        </svg>
        <div class="nw-readiness-pct">
          <span class="nw-readiness-num">${e}<span class="nw-readiness-pct-sign">%</span></span>
          <span class="nw-readiness-ready">ready</span>
        </div>
      </div>
      <div class="nw-readiness-body">
        <div class="nw-readiness-overline">Profile readiness</div>
        <h2 class="nw-readiness-title">${n>=s?"Your profile is complete — you're ready to match.":`${s-n} more step${s-n>1?"s":""} and Nearwork can boost your matches.`}</h2>
        <div class="nw-readiness-checklist">
          ${t.map($=>`
            <div class="nw-check-pill${$.done?" done":""}">
              ${g($.done?"check":"circle")} ${$.label}
            </div>`).join("")}
        </div>
        <div class="nw-readiness-actions">
          <button class="nw-finish-btn" type="button" data-page="profile">
            ${n>=s?"View profile":"Finish profile"} ${g("arrow-right")}
          </button>
          <span class="nw-readiness-count">${n} of ${s} complete</span>
        </div>
      </div>
    </div>

    <!-- Stat tiles -->
    <div class="nw-stat-grid">
      ${v("Open matches",o.jobs.length,o.jobs.length?`${o.jobs.length} role${o.jobs.length>1?"s":""} waiting`:"Complete profile to unlock","#16A085","sparkles")}
      ${v("Applications",a.length,a.length?`${i||"0"} need your input`:"Not applied yet","#AF7AC5","send")}
      ${v("Interviews",a.filter($=>String($.stage||$.status||"").toLowerCase().includes("interview")).length,"Scheduled","Not yet scheduled","#E74C7C")}
      ${v("CVs saved",(((T=o.candidate)==null?void 0:T.cvLibrary)||[]).length,"In your library","Upload your first CV","#555555")}
    </div>

    <!-- Pipeline + side rail -->
    <div class="nw-split">
      <!-- Active pipeline -->
      <section class="nw-panel">
        <div class="nw-panel-head">
          <div>
            <div class="nw-panel-overline">Now</div>
            <div class="nw-panel-title">Your active pipeline</div>
          </div>
          ${a.length?`<button class="nw-ghost-btn" type="button" data-page="applications">All applications ${g("arrow-right")}</button>`:""}
        </div>
        ${a.length?a.slice(0,4).map(($,f)=>b($,f===Math.min(a.length,4)-1)).join(""):`<div class="nw-empty">
              ${g("briefcase")}
              <strong>No active pipeline yet</strong>
              <p>Browse openings and apply — we'll show your pipeline here once an application moves forward.</p>
              <div style="display:flex;gap:8px;margin-top:12px;">
                <button class="nw-btn-primary" type="button" data-page="matches">${g("sparkles")} View matches</button>
                <a class="nw-btn-secondary" href="https://jobs.nearwork.co" target="_blank" rel="noreferrer">${g("external-link")} Open jobs</a>
              </div>
            </div>`}
      </section>

      <!-- Side rail -->
      <div class="nw-side-rail">
        <!-- Activity -->
        <section class="nw-panel">
          <div class="nw-panel-head">
            <div>
              <div class="nw-panel-overline">Recent</div>
              <div class="nw-panel-title">Updates</div>
            </div>
          </div>
          <div class="nw-empty" style="padding:20px 0;">
            ${g("bell")}
            <strong>Nothing yet</strong>
            <p>Movement on your search lands here.</p>
          </div>
        </section>

        <!-- Recruiter card (dark) -->
        <section class="nw-recruiter-dark">
          <div class="nw-recruiter-overline">Your talent partner</div>
          <div class="nw-recruiter-row">
            <div class="nw-recruiter-avatar">${d.initials||"NW"}</div>
            <div>
              <div class="nw-recruiter-name">${q(d.name||"Nearwork Support")}</div>
              <div class="nw-recruiter-role">${q(d.role||"Talent Partner")}</div>
            </div>
          </div>
          <p class="nw-recruiter-bio">I'll review every match and prep you before each interview. Reach out anytime.</p>
          <div class="nw-recruiter-btns">
            <a class="nw-recruiter-msg" href="mailto:${S(d.email||"support@nearwork.co")}">${g("message-square-text")} Message</a>
            <a class="nw-recruiter-call" href="https://wa.me/${encodeURIComponent((d.whatsapp||"+1").replace(/\D/g,""))}" target="_blank" rel="noreferrer">${g("calendar-plus")} WhatsApp</a>
          </div>
        </section>
      </div>
    </div>

    <!-- Top matches -->
    ${l.length?`
      <section class="nw-matches-section">
        <div class="nw-panel-head">
          <div>
            <div class="nw-panel-overline">Picked for you</div>
            <div class="nw-panel-title">Top matches this week</div>
          </div>
          <button class="nw-ghost-btn" type="button" data-page="matches">See all ${g("arrow-right")}</button>
        </div>
        <div class="nw-match-grid">
          ${l.map($=>_($)).join("")}
        </div>
      </section>
    `:""}
  `}function Zn(){lt=1;const e=o.candidate||{},t=String(e.name||"").trim().split(/\s+/).filter(Boolean);return x={roleGroup:e.roleGroup||"",targetRole:e.targetRole||"",department:e.department||e.locationDepartment||"",city:e.city||e.locationCity||"",english:e.english||"",firstName:e.firstName||t[0]||"",lastName:e.lastName||t.slice(1).join(" ")||"",phone:e.phone||e.whatsapp||"",currentRole:e.currentRole||"",expectedSalaryUSD:e.expectedSalaryUSD||(e.salaryCurrency!=="COP"?e.salaryAmount:null)||"",expectedSalaryCOP:e.expectedSalaryCOP||(e.salaryCurrency==="COP"?e.salaryAmount:null)||"",linkedin:e.linkedin||"",experience:Array.isArray(e.workHistory)?e.workHistory.map(n=>({...n})):[],languages:Array.isArray(e.languages)?[...e.languages]:[],skills:Array.isArray(e.skills)?[...e.skills]:[],certifications:Array.isArray(e.certifications)?e.certifications.map(n=>({...n})):[]},X=null,Te=null,R=null,'<div id="onboardingWizard" class="onb-shell"></div>'}function Xn(){document.querySelector("#onboardingWizard")&&_e(lt)}function _e(e){lt=e;const t=document.querySelector("#onboardingWizard");t&&(t.innerHTML=es(e),ns(e))}function Je(e){return`
    <div style="display:flex;align-items:center;gap:5px;margin-bottom:28px;">
      ${Array.from({length:3},(n,s)=>`
        <div style="height:5px;border-radius:3px;flex:${s<e?2:1};background:${s<e?"var(--green)":"var(--border)"};transition:all .3s;"></div>
      `).join("")}
      <span style="margin-left:6px;font-size:11px;font-weight:600;color:var(--light);white-space:nowrap;">${e<=3?`${e} / 3`:"Review"}</span>
    </div>`}function Y(e,t,n){return`<label style="display:flex;flex-direction:column;gap:5px;font-size:11px;font-weight:600;letter-spacing:.07em;text-transform:uppercase;color:var(--light);">${e}${t?'<span style="font-weight:400;font-size:10px;text-transform:none;letter-spacing:0;opacity:.7;">(optional)</span>':""} ${n}</label>`}function le(e,t,n,s,a=""){return`<input id="${e}" type="${t}" value="${S(n||"")}" placeholder="${S(s)}" ${a} style="font-size:14px;padding:10px 12px;border:1.5px solid var(--border);border-radius:8px;background:#fff;outline:none;width:100%;box-sizing:border-box;" />`}function xt(e,t){return`<div style="display:flex;justify-content:space-between;align-items:center;margin-top:28px;">
    ${e?'<button type="button" id="onbBack" class="secondary-action">← Back</button>':"<span></span>"}
    <button type="button" id="onbNext" class="primary-action">${t||"Continue →"}</button>
  </div>`}function es(e){var n,s,a,i;const t=x;switch(e){case 1:{const l=!!X;return`
        <div class="onb-step">
          ${Je(1)}
          <p class="eyebrow">Step 1 · Your CV</p>
          <h2 class="onb-heading">Upload your CV to get started</h2>
          <p class="onb-sub">We'll extract your experience, skills, and contact info automatically — so you don't have to type it all out.</p>
          <div class="upload-box" style="margin-bottom:4px;" id="onbCvBox">
            <input id="onbCvInput" type="file" accept=".pdf,.doc,.docx" style="display:none;" />
            <label for="onbCvInput" class="upload-trigger">${g("upload")} Choose file</label>
            <p id="onbCvStatus" style="font-size:12px;color:var(--green);min-height:18px;margin:0;">${l?`✓ ${q(X.name)}`:""}</p>
            <p>PDF or Word · max 10 MB</p>
          </div>
          <div style="display:flex;justify-content:space-between;align-items:center;margin-top:24px;">
            <button type="button" id="onbSkipCv" style="background:none;border:none;font-size:13px;color:var(--light);cursor:pointer;text-decoration:underline;padding:0;">Skip — I'll fill in manually</button>
            <button type="button" id="onbNext" class="primary-action" ${l?"":"disabled"}>Continue →</button>
          </div>
        </div>`}case 2:{const l=((n=o.candidate)==null?void 0:n.email)||((s=o.user)==null?void 0:s.email)||"",d=t.phone||((R==null?void 0:R.phone)??""),c=t.currentRole||(((i=(a=R==null?void 0:R.workHistory)==null?void 0:a[0])==null?void 0:i.title)??"");return`
        <div class="onb-step">
          ${Je(2)}
          <p class="eyebrow">Step 2 · Your profile</p>
          <h2 class="onb-heading">Tell us about yourself</h2>
          <p class="onb-sub">This is the basic information we'll use across every role you apply for.</p>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:4px;">
            ${Y("First name",!1,le("onbFirstName","text",t.firstName||"","María",'autocomplete="given-name"'))}
            ${Y("Last name",!1,le("onbLastName","text",t.lastName||"","García",'autocomplete="family-name"'))}
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:4px;">
            ${Y("Email",!1,le("onbEmail","email",l,"","disabled"))}
            ${Y("Phone",!1,le("onbPhone","tel",d,"+57 300 123 4567",'autocomplete="tel"'))}
          </div>
          ${Y("Current role",!1,le("onbCurrentRole","text",c,"e.g. Customer Success Manager"))}
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:4px;">
            ${Y("Expected salary — USD",!0,le("onbSalaryUSD","number",t.expectedSalaryUSD||"","2500",'min="0" step="100"'))}
            ${Y("Expected salary — COP",!0,le("onbSalaryCOP","number",t.expectedSalaryCOP||"","10000000",'min="0" step="100000"'))}
          </div>
          ${Y("LinkedIn",!0,le("onbLinkedin","url",t.linkedin||"","https://linkedin.com/in/..."))}
          <p id="onbBasicError" style="font-size:12px;color:#e74c3c;min-height:16px;margin:4px 0 0;"></p>
          ${xt(1)}
        </div>`}case 3:{const l=t.roleGroup||Object.keys(be)[0]||"",d=t.department||Object.keys(ee)[0]||"",c=ee[d]||[];return`
        <div class="onb-step">
          ${Je(3)}
          <p class="eyebrow">Step 3 · Role & location</p>
          <h2 class="onb-heading">What role are you looking for, and where are you based?</h2>
          <p class="onb-sub">We use this to match you with the right openings from our clients.</p>
          <div style="display:grid;gap:12px;margin-bottom:4px;">
            ${Y("Area",!1,`<select id="onbRoleGroup" style="font-size:14px;padding:10px 12px;border:1.5px solid var(--border);border-radius:8px;background:#fff;outline:none;">${Ot(l)}</select>`)}
            ${Y("Role",!1,`<select id="onbTargetRole" style="font-size:14px;padding:10px 12px;border:1.5px solid var(--border);border-radius:8px;background:#fff;outline:none;">${Ve(l,t.targetRole||"")}</select>`)}
            ${Y("Department",!1,`<select id="onbDept" style="font-size:14px;padding:10px 12px;border:1.5px solid var(--border);border-radius:8px;background:#fff;outline:none;">${Object.keys(ee).map(r=>`<option value="${S(r)}" ${r===d?"selected":""}>${q(r)}</option>`).join("")}</select>`)}
            ${Y("City",!1,`<select id="onbCity" style="font-size:14px;padding:10px 12px;border:1.5px solid var(--border);border-radius:8px;background:#fff;outline:none;">${c.map(r=>`<option value="${S(r)}" ${r===t.city?"selected":""}>${q(r)}</option>`).join("")}</select>`)}
            ${Y("English level",!1,`<select id="onbEnglish" style="font-size:14px;padding:10px 12px;border:1.5px solid var(--border);border-radius:8px;background:#fff;outline:none;">${["","B1","B2","C1","C2","Native"].map(r=>`<option value="${r}" ${r===t.english?"selected":""}>${r||"Select level"}</option>`).join("")}</select>`)}
          </div>
          ${xt(2,"Review →")}
        </div>`}case 4:return ts();default:return""}}const ue="font-size:14px;padding:10px 12px;border:1.5px solid var(--border);border-radius:8px;background:#fff;outline:none;width:100%;box-sizing:border-box;",mt="flex-shrink:0;width:38px;height:38px;border:1.5px solid var(--border);border-radius:8px;background:#fff;color:var(--light);font-size:14px;cursor:pointer;";function qe(e){return`<label style="display:block;margin-bottom:8px;font-size:11px;font-weight:600;letter-spacing:.07em;text-transform:uppercase;color:var(--light);">${e}</label>`}function ts(){var u;const e=x,t=R||{};!e.experience.length&&Array.isArray(t.workHistory)&&t.workHistory.length&&(e.experience=t.workHistory.map(v=>({company:v.company||"",title:v.title||"",from:v.from||"",to:v.to||""}))),!e.languages.length&&Array.isArray(t.languages)&&t.languages.length&&(e.languages=t.languages.filter(Boolean).map(String)),!e.skills.length&&Array.isArray(t.skills)&&t.skills.length&&(e.skills=[...new Set(t.skills.map(ve).filter(Boolean))]),!e.certifications.length&&Array.isArray(t.certifications)&&t.certifications.length&&(e.certifications=t.certifications.map(v=>({name:v.name||"",issuer:v.issuer||"",date:v.date||""})));const n=[e.firstName,e.lastName].filter(Boolean).join(" ")||((u=o.candidate)==null?void 0:u.name)||"—",s=e.targetRole||"—",a=[e.city,e.department].filter(Boolean).join(", ")||"—",i=[];e.expectedSalaryUSD&&i.push(`$${Number(e.expectedSalaryUSD).toLocaleString("en-US")} USD/mo`),e.expectedSalaryCOP&&i.push(`$${Number(e.expectedSalaryCOP).toLocaleString("es-CO")} COP/mo`);const l=i.join(" · ")||"—",d=e.english||"—",c=e.phone||"—",r=(X==null?void 0:X.name)||"",p=(v,b)=>!b||b==="—"?"":`
    <div style="display:flex;gap:16px;padding:10px 0;border-bottom:1px solid var(--border);">
      <span style="width:110px;flex-shrink:0;font-size:10px;font-weight:700;letter-spacing:.07em;text-transform:uppercase;color:var(--light);padding-top:3px;">${v}</span>
      <span style="font-size:13px;color:var(--black);line-height:1.5;">${q(String(b))}</span>
    </div>`;return`
    <div class="onb-step">
      <p class="eyebrow" style="color:var(--green);">Almost done</p>
      <h2 class="onb-heading">Does this look right?</h2>
      <p class="onb-sub" style="margin-bottom:20px;">Review your profile before we save it. You can always update it later from Settings.</p>
      <div style="border:1.5px solid var(--border);border-radius:12px;padding:2px 16px 2px;margin-bottom:24px;">
        ${p("Name",n)}
        ${p("Role",s)}
        ${p("Location",a)}
        ${p("Salary",l)}
        ${p("English",d)}
        ${p("Phone",c)}
        ${p("Current role",e.currentRole||"—")}
        ${r?p("CV",r):""}
      </div>

      <div class="field" style="margin-bottom:20px;">
        ${qe("Experience")}
        <div id="onbExperienceList"></div>
        <button type="button" class="secondary-action" id="onbAddExperience">+ Add position</button>
      </div>

      <div class="field" style="margin-bottom:20px;">
        ${qe("Languages")}
        <div id="onbLanguagesList"></div>
        <button type="button" class="secondary-action" id="onbAddLanguage">+ Add language</button>
      </div>

      <div class="field" style="margin-bottom:20px;">
        ${qe("Skills")}
        ${Bt(e.skills)}
      </div>

      <div class="field" style="margin-bottom:20px;">
        ${qe("Certifications")}
        <div id="onbCertificationsList"></div>
        <button type="button" class="secondary-action" id="onbAddCertification">+ Add certification</button>
      </div>

      <div style="display:flex;justify-content:space-between;align-items:center;">
        <button type="button" id="onbEdit" class="secondary-action">← Edit</button>
        <button type="button" id="onbFinish" class="primary-action">${g("check")} Finish setup</button>
      </div>
      <p id="onbFinishErr" style="font-size:12px;color:#e74c3c;text-align:right;min-height:18px;margin-top:6px;"></p>
    </div>`}function Be(){const e=document.querySelector("#onbExperienceList");e&&(e.innerHTML="",x.experience.length||(e.innerHTML='<p style="font-size:12px;color:var(--light);margin:0 0 10px;">No experience added yet.</p>'),x.experience.forEach((t,n)=>{var a,i;const s=document.createElement("div");s.style.cssText="border:1.5px solid var(--border);border-radius:10px;padding:12px;margin-bottom:10px;",s.innerHTML=`
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px;">
        <input type="text" data-k="title" placeholder="Title" value="${S(t.title||"")}" style="${ue}">
        <input type="text" data-k="company" placeholder="Company" value="${S(t.company||"")}" style="${ue}">
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr auto;gap:8px;align-items:center;">
        <input type="month" data-k="from" value="${S(t.from||"")}" style="${ue}">
        <input type="month" data-k="to" value="${t.to==="present"?"":S(t.to||"")}" ${t.to==="present"?"disabled":""} style="${ue}">
        <button type="button" class="onb-list-remove" aria-label="Remove" style="${mt}">×</button>
      </div>
      <label style="display:flex;align-items:center;gap:6px;font-size:12px;color:var(--mid);margin-top:8px;">
        <input type="checkbox" data-k="current" ${t.to==="present"?"checked":""}> I currently work here
      </label>`,s.querySelectorAll('input[type="text"][data-k], input[type="month"][data-k]').forEach(l=>{l.addEventListener("input",d=>{t[d.target.dataset.k]=d.target.value})}),(a=s.querySelector('input[type="checkbox"][data-k="current"]'))==null||a.addEventListener("change",l=>{t.to=l.target.checked?"present":"",Be()}),(i=s.querySelector(".onb-list-remove"))==null||i.addEventListener("click",()=>{x.experience.splice(n,1),Be()}),e.appendChild(s)}))}function nt(){const e=document.querySelector("#onbLanguagesList");e&&(e.innerHTML="",x.languages.length||(e.innerHTML='<p style="font-size:12px;color:var(--light);margin:0 0 10px;">No languages added yet.</p>'),x.languages.forEach((t,n)=>{const s=document.createElement("div");s.style.cssText="display:flex;gap:10px;align-items:center;margin-bottom:8px;",s.innerHTML=`
      <input type="text" value="${S(t)}" placeholder="e.g. English (B2)" style="${ue}flex:1;">
      <button type="button" class="onb-list-remove" aria-label="Remove" style="${mt}">×</button>`,s.querySelector("input").addEventListener("input",a=>{x.languages[n]=a.target.value}),s.querySelector(".onb-list-remove").addEventListener("click",()=>{x.languages.splice(n,1),nt()}),e.appendChild(s)}))}function st(){const e=document.querySelector("#onbCertificationsList");e&&(e.innerHTML="",x.certifications.length||(e.innerHTML='<p style="font-size:12px;color:var(--light);margin:0 0 10px;">No certifications added yet.</p>'),x.certifications.forEach((t,n)=>{const s=document.createElement("div");s.style.cssText="display:flex;gap:10px;align-items:flex-start;margin-bottom:8px;",s.innerHTML=`
      <div class="onb-cert-grid" style="flex:1;">
        <input type="text" data-k="name" value="${S(t.name||"")}" placeholder="Certification name" style="${ue}">
        <input type="text" data-k="issuer" value="${S(t.issuer||"")}" placeholder="Issuer" style="${ue}">
        <input type="text" data-k="date" value="${S(t.date||"")}" placeholder="Date" style="${ue}">
      </div>
      <button type="button" class="onb-list-remove" aria-label="Remove" style="${mt}">×</button>`,s.querySelectorAll("input[data-k]").forEach(a=>{a.addEventListener("input",i=>{t[i.target.dataset.k]=i.target.value})}),s.querySelector(".onb-list-remove").addEventListener("click",()=>{x.certifications.splice(n,1),st()}),e.appendChild(s)}))}function ns(e){var s,a,i,l,d;const t=document.querySelector("#onbBack"),n=document.querySelector("#onbNext");switch(t==null||t.addEventListener("click",()=>_e(e-1)),e){case 1:{const c=document.querySelector("#onbCvInput"),r=document.querySelector("#onbCvStatus"),p=document.querySelector("#onbSkipCv");X&&c&&(n.disabled=!1),c==null||c.addEventListener("change",()=>{var v;const u=(v=c.files)==null?void 0:v[0];u&&(X=u,r&&(r.textContent=`✓ ${u.name}`),n.disabled=!1,R=null,Te=rt(u).catch(()=>null))}),n==null||n.addEventListener("click",()=>Ke(2)),p==null||p.addEventListener("click",()=>{X=null,Te=null,Ke(2)});break}case 2:{n==null||n.addEventListener("click",()=>{var T,$,f,m,h,w,y;const c=((T=document.querySelector("#onbFirstName"))==null?void 0:T.value.trim())||"",r=(($=document.querySelector("#onbLastName"))==null?void 0:$.value.trim())||"",p=((f=document.querySelector("#onbPhone"))==null?void 0:f.value.trim())||"",u=((m=document.querySelector("#onbCurrentRole"))==null?void 0:m.value.trim())||"",v=((h=document.querySelector("#onbSalaryUSD"))==null?void 0:h.value)||"",b=((w=document.querySelector("#onbSalaryCOP"))==null?void 0:w.value)||"",_=((y=document.querySelector("#onbLinkedin"))==null?void 0:y.value.trim())||"",C=document.querySelector("#onbBasicError");if(!c||!r||!p||!u){C&&(C.textContent="Please fill in your name, phone, and current role.");return}if(!v&&!b){C&&(C.textContent="Please enter an expected salary in USD, COP, or both.");return}x.firstName=c,x.lastName=r,x.phone=p,x.currentRole=u,x.expectedSalaryUSD=v?Number(v):"",x.expectedSalaryCOP=b?Number(b):"",x.linkedin=_,_e(3)});break}case 3:{const c=document.querySelector("#onbRoleGroup"),r=document.querySelector("#onbTargetRole"),p=document.querySelector("#onbDept"),u=document.querySelector("#onbCity");c==null||c.addEventListener("change",()=>{r.innerHTML=Ve(c.value,"")}),p==null||p.addEventListener("change",()=>{const v=ee[p.value]||[];u.innerHTML=v.map(b=>`<option value="${S(b)}">${q(b)}</option>`).join("")}),n==null||n.addEventListener("click",()=>{var v;x.roleGroup=(c==null?void 0:c.value)||"",x.targetRole=(r==null?void 0:r.value)||"",x.department=(p==null?void 0:p.value)||"",x.city=(u==null?void 0:u.value)||"",x.english=((v=document.querySelector("#onbEnglish"))==null?void 0:v.value)||"",Ke(4)});break}case 4:{(s=document.querySelector("#onbEdit"))==null||s.addEventListener("click",()=>_e(1)),(a=document.querySelector("#onbFinish"))==null||a.addEventListener("click",ss),Be(),nt(),st(),(i=document.querySelector("#onbAddExperience"))==null||i.addEventListener("click",()=>{x.experience.push({company:"",title:"",from:"",to:""}),Be()}),(l=document.querySelector("#onbAddLanguage"))==null||l.addEventListener("click",()=>{x.languages.push(""),nt()}),(d=document.querySelector("#onbAddCertification"))==null||d.addEventListener("click",()=>{x.certifications.push({name:"",issuer:"",date:""}),st()}),Kt();break}}}async function Ke(e){var n,s;const t=document.querySelector("#onboardingWizard");if(Te&&!R&&(t&&(t.innerHTML='<div class="onb-step"><p style="text-align:center;font-size:14px;font-weight:600;color:var(--green);padding:56px 0;">Analysing your CV…</p></div>'),R=await Te),R!=null&&R.phone&&!x.phone&&(x.phone=R.phone),R!=null&&R.name&&!x.firstName&&!x.lastName){const a=String(R.name).trim().split(/\s+/).filter(Boolean);x.firstName=a[0]||"",x.lastName=a.slice(1).join(" ")}(s=(n=R==null?void 0:R.workHistory)==null?void 0:n[0])!=null&&s.title&&!x.currentRole&&(x.currentRole=R.workHistory[0].title),_e(e)}async function ss(){var n,s,a,i,l,d,c;const e=document.querySelector("#onbFinish"),t=document.querySelector("#onbFinishErr");e&&(e.disabled=!0,e.innerHTML="Saving…");try{const r=x,p=(n=o.user)==null?void 0:n.uid;if(!p)throw new Error("Not signed in");const u=r.department||"",v=r.city||"",b=Number(r.expectedSalaryUSD||0)||null,_=Number(r.expectedSalaryCOP||0)||null,C=b||_||null,T=b?"USD":_?"COP":"USD",$=C?`${T} ${C.toLocaleString()}/mo`:"",f=[...document.querySelectorAll('[data-skill-search] input[name="skills"]')].map(y=>y.value),m=[r.firstName,r.lastName].filter(Boolean).join(" ")||((s=o.candidate)==null?void 0:s.name)||((a=o.user)==null?void 0:a.displayName)||"";let h={};if(X)try{const y=await et(p,X,"");h={activeCvId:y.id,activeCvName:y.name||y.fileName,cvUrl:y.url,cvLibrary:[y]}}catch{}const w={name:m,firstName:r.firstName||"",lastName:r.lastName||"",targetRole:r.targetRole||"",headline:r.targetRole||"",currentRole:r.currentRole||"",department:u,city:v,location:[v,u].filter(Boolean).join(", "),locationCity:v,locationDepartment:u,locationCountry:"Colombia",locationId:`${String(v).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,"").replace(/[^a-z0-9]+/g,"-")}-co`,english:r.english||"",salary:$,salaryUSD:b,salaryAmount:C,salaryCurrency:T,expectedSalaryUSD:b,expectedSalaryCOP:_,expectedSalaryAmount:C,expectedSalaryCurrency:T,whatsapp:r.phone||"",phone:r.phone||"",linkedin:r.linkedin||"",skills:[...new Set(f.map(ve).filter(Boolean))],workHistory:r.experience||[],certifications:(r.certifications||[]).filter(y=>y.name&&y.name.trim()),languages:(r.languages||[]).map(y=>y.trim()).filter(Boolean),summary:(R==null?void 0:R.summary)||"",email:((i=o.candidate)==null?void 0:i.email)||((l=o.user)==null?void 0:l.email)||"",candidateCode:(d=o.candidate)==null?void 0:d.candidateCode,marketingConsent:((c=o.candidate)==null?void 0:c.marketingConsent)===!0,availability:"open",onboarded:!0,...h};await it(p,w),window.history.pushState({page:"overview"},"","/"),k({candidate:{...o.candidate,...w},activePage:"overview",message:"Welcome to Nearwork! Your profile is ready."})}catch{t&&(t.textContent="Something went wrong. Please try again."),e&&(e.disabled=!1,e.innerHTML=`${g("check")} Finish setup`)}}function as(){var l,d,c;const e=((l=o.candidate)==null?void 0:l.targetRole)||(pt((d=o.candidate)==null?void 0:d.headline)?"":(c=o.candidate)==null?void 0:c.headline),t=ke(),n=o.jobs.map(ge).filter(r=>dt(r,t).length>=3),s=t.length>=5,a=o.matchesFiltered&&s?n:o.jobs.map(ge),i=o.matchesFiltered&&!n.length;return`
    <section class="section-block">
      <div class="section-heading">
        <div><p class="eyebrow">Openings</p><h2>${o.matchesFiltered?"Best fit from your profile":"All current openings"}</h2></div>
        <button id="filterMatches" class="secondary-action" type="button">${g(o.matchesFiltered?"list":"filter")} ${o.matchesFiltered?"Show all openings":"Filter by my role & skills"}</button>
      </div>
      <div class="match-note"><strong>${a.length}</strong> of <strong>${o.jobs.length}</strong> openings showing. Matches require <strong>3+ shared skills</strong>. Role: <strong>${e||"not set"}</strong>. Skills: <strong>${t.join(", ")||"not set"}</strong>.</div>
      <div class="job-list">${i?ht("No filtered matches yet","Add a target role and skills in Profile to improve matching."):a.map(r=>Ns(r)).join("")}</div>
    </section>
  `}function is(){return`
    <section class="section-block">
      <div class="section-heading"><div><p class="eyebrow">Pipeline</p><h2>Your applications</h2></div></div>
      ${Fn()?xs(Cs()):As()}
      <div class="timeline page-gap">${o.applications.length?o.applications.map(Ps).join(""):ht("No applications yet","Apply to a role and your process will show here.")}</div>
    </section>
  `}function os(){const e=ce(),t=o.assessments||[],n=t.filter(T=>["sent","started"].includes(String(T.status||"").toLowerCase())),s=t.filter(T=>String(T.status||"").toLowerCase()==="completed"),a=e?t.find(T=>T.id===e):n[0]||s[0]||null;if(o.assessmentUiStep==="techIntro"&&a)return us(a);if(o.assessmentUiStep==="discIntro"&&a)return ms(a);if(e&&!a)return`
      <div class="nw-assess-wrap nw-assess-state-page">
        <div class="nw-assess-state-card">
          <div class="nw-assess-state-icon" style="background:#FEF0F5;color:#CC3666">${g("link-2-off")}</div>
          <strong>This link isn't available</strong>
          <p>Make sure you're logged into the same account that received the assessment email. If the problem persists, reach out to your Nearwork recruiter.</p>
          <button class="primary-action fit" data-page="recruiter" type="button">${g("message-circle")} Contact support</button>
        </div>
      </div>
    `;if(!a)return`
      <div class="nw-assess-wrap nw-assess-state-page">
        <div class="nw-assess-state-card">
          <div class="nw-assess-state-icon">${g("inbox")}</div>
          <strong>No assessment assigned yet</strong>
          <p>Your assessment will appear here when Nearwork sends it. You'll receive an email notification when it's ready.</p>
          <div class="nw-assess-info-row">
            <div class="nw-assess-info-item">${g("shield-check")}<span>One attempt</span></div>
            <div class="nw-assess-info-item">${g("timer")}<span>~45–90 min</span></div>
            <div class="nw-assess-info-item">${g("users")}<span>Recruiter reviewed</span></div>
          </div>
        </div>
      </div>
    `;const i=Array.isArray(a.questions)?a.questions:[],l=String(a.status||"").toLowerCase()==="started",d=String(a.status||"").toLowerCase()==="completed",c=String(a.status||"").toLowerCase()==="cancelled",r=ps(a),p=Mt(),u=Number(a.currentQuestionIndex||0),v=Math.min(p??u,Math.max(i.length-1,0)),b=i[v],_=(b==null?void 0:b.stage)||a.currentStage||1,C=l&&!d&&!c&&!r;return`
    <div class="nw-assess-wrap">
      ${C?ls(a,_,v,i):gt(a)}
      ${C?rs(a,v):""}
      <div class="nw-assess-body" id="assessmentWorkspace">
        ${d?gs(a):c?`<div class="nw-assess-state-card nw-assess-state-card--inline"><div class="nw-assess-state-icon" style="background:#F5F4F0;color:#555">${g("ban")}</div><strong>Assessment cancelled</strong><p>This assessment is no longer available. A new assigned assessment will appear here when your recruiter sends one.</p></div>`:r?`<div class="nw-assess-state-card nw-assess-state-card--inline"><div class="nw-assess-state-icon" style="background:#FEF0F5;color:#CC3666">${g("clock-x")}</div><strong>Assessment link expired</strong><p>This unique assessment link is no longer valid. Contact your Nearwork recruiter if you need a new one.</p><button class="ghost-action" data-page="recruiter" type="button">${g("message-circle")} Contact recruiter</button></div>`:cs(a,l,v)}
      </div>
      ${fs(t,a.id)}
    </div>
  `}function gt(e){const t=String(e.status||"").toLowerCase();return`
    <div class="nw-assess-chrome">
      <div class="nw-assess-chrome__logo">
        <div class="nw-assess-chrome__logotile">N</div>
        <span class="nw-assess-chrome__brand">Nearwork</span>
        <div class="nw-assess-chrome__divider"></div>
        <span class="nw-assess-chrome__sub">Candidate assessment</span>
      </div>
      <div style="flex:1"></div>
      ${["completed","cancelled"].includes(t)?"":`<button class="nw-assess-chrome__exit" type="button">${g("x")} Save &amp; exit</button>`}
    </div>
  `}function rs(e,t){const n=(e.questions||[]).slice(0,70),s=Z(e,1).filter(d=>we(Ye(e,d))).length,a=Z(e,2).filter(d=>we(Ye(e,d))).length,i=Z(e,1).length||50,l=Z(e,2).length||20;return`
    <section class="assessment-progress-panel">
      <div><strong>Technical</strong><span>${s}/${i} answered</span></div>
      <div><strong>DISC</strong><span>${a}/${l} answered</span></div>
      <div class="assessment-progress-strip">
        ${n.map((d,c)=>{const r=we(Ye(e,d));return`<button type="button" class="${c===t?"active":""} ${r?"answered":""}" data-assessment-jump="${c}" title="${ut(d.stage)} · Q${c+1}">${c+1}</button>`}).join("")}
      </div>
    </section>
  `}function ls(e,t,n,s){const a=Number(t),i=St(e.technicalStartedAt||e.startedAt)||new Date,l=St(e.discStartedAt)||new Date,d=a===1?i:l,c=Number(a===1?e.technicalMinutes||60:e.discMinutes||30),r=new Date(d.getTime()+c*60*1e3),p=a===1?"Technical":"DISC profile",u=(s||[]).filter(C=>Number(C.stage||1)===a),v=(s||[]).findIndex(C=>Number(C.stage||1)===a),b=Math.max(0,n-v),_=u.length?Math.round((b+1)/u.length*100):2;return`
    <div class="nw-assess-chrome nw-assess-chrome--active">
      <div class="nw-assess-chrome__logo">
        <div class="nw-assess-chrome__logotile">N</div>
        <span class="nw-assess-chrome__brand">Nearwork</span>
        <div class="nw-assess-chrome__divider"></div>
        <span class="nw-assess-chrome__sub">Candidate assessment</span>
      </div>
      <div class="nw-assess-chrome__center">
        <div class="nw-assess-chrome__section">
          ${g("clipboard-check")}
          <span>${p} &middot; Question ${b+1} of ${u.length||(a===1?50:20)}</span>
        </div>
        <div class="nw-assess-chrome__progresstrack">
          <div class="nw-assess-chrome__progressfill" style="width:${Math.max(2,_)}%"></div>
        </div>
      </div>
      <div class="nw-timer-pill">
        ${g("timer")}
        <span id="assessmentTimer" data-end="${r.toISOString()}">${c}:00</span>
      </div>
      <button class="nw-assess-chrome__exit" type="button">${g("x")} Save &amp; exit</button>
    </div>
  `}function cs(e,t,n=null){var h,w,y;if(!t){const A=S(e.role||"Role assessment"),D=S(e.recruiterName||e.recruiter||"Nearwork"),M=ze(e.expiresAt||e.deadline),E=Z(e,1).length||50,L=Z(e,2).length||20,I=Number(e.technicalMinutes||60),Q=Number(e.discMinutes||30);return`
      <div class="nw-assess-welcome">
        <div class="nw-assess-welcome__header">
          <span class="nw-assess-role-chip">${g("sparkles")} ${A}</span>
          <span>Sent by ${D}${M?" &middot; expires "+M:""}</span>
        </div>
        <h2 class="nw-assess-welcome__title">Let's see how you think — and how you work.</h2>
        <p class="nw-assess-welcome__desc">This assessment has two parts: a role-knowledge check and a behavioral profile.</p>
        <div class="nw-assess-parts">
          <div class="nw-assess-part">
            <div class="nw-assess-part__blob" style="background:#E8F8F5"></div>
            <div class="nw-assess-part__icon" style="background:#E8F8F5;color:#16A085">${g("code-2")}</div>
            <span class="nw-assess-part__tag" style="color:#16A085">Part 1</span>
            <strong class="nw-assess-part__title">Technical Assessment</strong>
            <span class="nw-assess-part__sub">${E} questions &middot; ~${I} min</span>
            <p class="nw-assess-part__desc">Single-choice role scenarios. We're looking at how you think, not whether you remember definitions.</p>
          </div>
          <div class="nw-assess-part">
            <div class="nw-assess-part__blob" style="background:#F7F2FC"></div>
            <div class="nw-assess-part__icon" style="background:#F7F2FC;color:#AF7AC5">${g("compass")}</div>
            <span class="nw-assess-part__tag" style="color:#AF7AC5">Part 2</span>
            <strong class="nw-assess-part__title">DISC Profile</strong>
            <span class="nw-assess-part__sub">${L} statements &middot; ~${Q} min</span>
            <p class="nw-assess-part__desc">How you work, communicate, and lead under pressure. No right or wrong answers.</p>
          </div>
        </div>
        <div class="nw-assess-rules">
          <div class="nw-assess-rule"><div class="nw-assess-rule__icon">${g("wifi")}</div><div><strong>Stable connection</strong><span>Progress saves on every answer.</span></div></div>
          <div class="nw-assess-rule"><div class="nw-assess-rule__icon">${g("timer")}</div><div><strong>Timed sections</strong><span>A countdown runs per stage.</span></div></div>
          <div class="nw-assess-rule"><div class="nw-assess-rule__icon">${g("lock")}</div><div><strong>One attempt</strong><span>Take it when you can give it your full focus.</span></div></div>
          <div class="nw-assess-rule"><div class="nw-assess-rule__icon">${g("eye-off")}</div><div><strong>No proctoring</strong><span>No camera or screen recording.</span></div></div>
        </div>
        <div class="nw-assess-welcome__cta">
          <button class="primary-action" id="showTechIntro" type="button">${g("arrow-right")} Begin assessment</button>
          <span>Questions are timed. Open when you're ready to focus.</span>
        </div>
      </div>
    `}const s=(e.questions||[]).slice(0,70),a=Math.min(n??Number(e.currentQuestionIndex||0),Math.max(s.length-1,0)),i=s[a],l=((w=(h=e.answers)==null?void 0:h[i.id])==null?void 0:w.value)??((y=e.answers)==null?void 0:y[i.id])??"",d=Array.isArray(i.options)&&i.options.length?i.options:["Strongly agree","Agree","Neutral","Disagree"],c=s[a+1],r=c==null?void 0:c.stage,p=r&&r!==i.stage,u=tt(e,i.stage),v=p&&u.length,b=a+1>=s.length,_=b?tt(e,i.stage):[],C=!!i.multiple,T=Number(i.stage||1)===2?"nw-assess-chip--violet":"nw-assess-chip--teal",$=C?"Multi-select":"Single choice",f=S(i.part||i.type||(Number(i.stage||1)===2?"DISC":"Scenario")),m=S(i.bank||"");return`
    <form id="assessmentQuestionForm" class="nw-assess-qcard" data-current-index="${a}">
      <div class="nw-assess-qmeta">
        <span class="nw-assess-chip ${T}">${f}</span>
        ${m?`<span class="nw-assess-chip nw-assess-chip--gray">${m}</span>`:""}
        <span class="nw-assess-qtype">&middot; ${$}</span>
      </div>
      ${i.context?`<div class="nw-assess-context"><strong>Context: </strong>${S(i.context)}</div>`:""}
      <p class="nw-assess-qprompt">${S(i.q||"")}</p>
      <fieldset class="nw-assess-options${C?" nw-assess-options--multi":""}">
        <legend>${$}</legend>
        ${d.map((A,D)=>`
          <label class="nw-assess-option${C?" nw-assess-option--multi":""}">
            <input type="radio" name="answer" value="${D}" ${String(l)===String(D)?"checked":""} />
            <span class="nw-assess-option__key">${String.fromCharCode(65+D)}</span>
            <span class="nw-assess-option__text">${S(A)}</span>
            ${C?"":`<span class="nw-assess-option__check">${g("check-circle-2")}</span>`}
          </label>
        `).join("")}
      </fieldset>
      ${v||_.length?ds(e,v?u:_,i.stage):""}
      <div class="nw-assess-qfooter">
        <button class="ghost-action" id="prevAssessmentQuestion" type="button" ${a===0?"disabled":""}>${g("arrow-left")} Back</button>
        <span class="nw-assess-autosave">${g("check")} Auto-saved</span>
        <div style="flex:1"></div>
        <button class="primary-action fit" type="submit">${b?g("send")+" Submit assessment":"Next "+g("arrow-right")}</button>
      </div>
    </form>
  `}function ds(e,t,n){if(!t.length)return"";const s=(e.questions||[]).slice(0,70);return`
    <div class="nw-assess-missed">
      <strong>${g("alert-triangle")} Unanswered questions in ${ut(n)}</strong>
      <p>You skipped ${t.map(a=>`Question ${s.findIndex(i=>i.id===a.id)+1}`).join(", ")}. You can go back now or continue if you meant to leave them blank.</p>
      <div class="nw-assess-missed__links">${t.map(a=>{const i=s.findIndex(l=>l.id===a.id);return`<button class="ghost-action" type="button" data-assessment-jump="${i}">${g("arrow-left")} Go to ${i+1}</button>`}).join("")}</div>
    </div>
  `}function ps(e){return!(e!=null&&e.expiresAt)||String(e.status||"").toLowerCase()==="completed"?!1:Date.now()>new Date(e.expiresAt).getTime()}function us(e){const t=S(e.role||"Role assessment"),n=Z(e,1).length||50,s=Number(e.technicalMinutes||60);return`
    <div class="nw-assess-wrap">
      ${gt(e)}
      <div class="nw-assess-body">
        <div class="nw-assess-welcome" style="max-width:860px">
          <div style="display:inline-flex;align-items:center;gap:8px;padding:5px 12px;border-radius:999px;background:#E8F8F5;border:1px solid rgba(22,160,133,0.25);margin-bottom:4px">
            <span style="width:6px;height:6px;border-radius:50%;background:#16A085;display:inline-block"></span>
            <span style="font-size:11.5px;font-weight:600;color:#0E6B58;text-transform:uppercase;letter-spacing:0.05em">Part 1 of 2 &middot; Starting now</span>
          </div>
          <h2 class="nw-assess-welcome__title" style="font-size:2.2rem">Role knowledge check.</h2>
          <p class="nw-assess-welcome__desc">The next <strong>${n} questions</strong> are about the day-to-day of the ${t} role — scenarios, decisions, and judgement calls. We're looking at how you think, not whether you remember definitions.</p>
          <p style="font-size:0.88rem;color:#9E9E9E;margin:0">You have <strong style="color:#555">${s} minutes</strong> total. Your progress saves automatically after every question. DISC follows when you finish.</p>
          <div class="nw-assess-welcome__cta" style="margin-top:8px">
            <button class="primary-action" id="startAssessment" type="button">${g("play")} Start Part 1</button>
            <button class="ghost-action" id="backToWelcome" type="button">${g("arrow-left")} Back</button>
          </div>
        </div>
      </div>
    </div>
  `}function ms(e){const t=Z(e,1).length||50,n=Z(e,2).length||20,s=Number(e.discMinutes||30),a=S(e.recruiterName||e.recruiter||"your recruiter"),i=(e.questions||[]).findIndex(l=>Number(l.stage||1)===2);return`
    <div class="nw-assess-wrap">
      ${gt(e)}
      <div class="nw-assess-body">
        <div style="background:#E8F8F5;border-bottom:1px solid rgba(22,160,133,0.15);padding:13px 20px;display:flex;align-items:center;gap:12px;margin-bottom:24px;border-radius:10px">
          <div style="width:26px;height:26px;border-radius:50%;background:#16A085;color:#fff;display:flex;align-items:center;justify-content:center;flex-shrink:0">${g("check")}</div>
          <div style="flex:1">
            <div style="font-size:13px;font-weight:600;color:#0E6B58">Part 1 complete — nice work.</div>
            <div style="font-size:12px;color:#12866E;margin-top:1px">${t}/${t} answered &middot; submitted to ${a} for review</div>
          </div>
          <span class="nw-assess-chip nw-assess-chip--teal">${g("trophy")} Part 1 done</span>
        </div>
        <div class="nw-assess-welcome" style="max-width:860px">
          <div style="display:inline-flex;align-items:center;gap:8px;padding:5px 12px;border-radius:999px;background:#F7F2FC;border:1px solid rgba(175,122,197,0.25);margin-bottom:4px">
            <span style="width:6px;height:6px;border-radius:50%;background:#AF7AC5;display:inline-block"></span>
            <span style="font-size:11.5px;font-weight:600;color:#784899;text-transform:uppercase;letter-spacing:0.05em">Part 2 of 2 &middot; Up next</span>
          </div>
          <h2 class="nw-assess-welcome__title" style="font-size:2.2rem">Now, the DISC profile.</h2>
          <p class="nw-assess-welcome__desc"><strong>DISC</strong> is a behavioral framework. It tells your future team how you tend to communicate, decide, and respond to pressure — not whether you're "good" at the job.</p>
          <div class="nw-assess-parts" style="grid-template-columns:1fr">
            <div class="nw-assess-part" style="background:#F8F7F3;border-left:3px solid #AF7AC5">
              <strong style="font-size:0.88rem;font-weight:600;color:#555;margin-bottom:8px;display:block">How it works</strong>
              <p class="nw-assess-part__desc">You'll see ${n} statements about how you work. For each one, pick the option that's most like you. Go with your gut — there are no right answers. Takes about ${s} minutes.</p>
            </div>
          </div>
          <div class="nw-assess-rules">
            <div class="nw-assess-rule"><div class="nw-assess-rule__icon" style="color:#AF7AC5">${g("users-round")}</div><div><strong>No right answers</strong><span>This measures style, not performance.</span></div></div>
            <div class="nw-assess-rule"><div class="nw-assess-rule__icon" style="color:#AF7AC5">${g("timer")}</div><div><strong>${s} min total</strong><span>Go with your first instinct.</span></div></div>
            <div class="nw-assess-rule"><div class="nw-assess-rule__icon" style="color:#AF7AC5">${g("shield-check")}</div><div><strong>Used for fit</strong><span>Helps match you with the right team.</span></div></div>
            <div class="nw-assess-rule"><div class="nw-assess-rule__icon" style="color:#AF7AC5">${g("check")}</div><div><strong>Auto-saved</strong><span>Progress saves on every answer.</span></div></div>
          </div>
          <div class="nw-assess-welcome__cta" style="margin-top:8px">
            <button class="primary-action" id="startDiscAssessment" data-disc-index="${i>=0?i:50}" type="button">${g("play")} Start Part 2</button>
          </div>
        </div>
      </div>
    </div>
  `}function gs(e){var l,d;const n=(((l=o.candidate)==null?void 0:l.name)||((d=o.user)==null?void 0:d.displayName)||"").split(" ")[0]||"You",s=S(e.recruiterName||e.recruiter||"your recruiter"),a=Z(e,1).length||50,i=Z(e,2).length||20;return`
    <div class="nw-assess-complete">
      <div class="nw-assess-complete__hero">
        <div class="nw-assess-complete__icon">
          ${g("check")}
          <div class="nw-assess-complete__ring1"></div>
          <div class="nw-assess-complete__ring2"></div>
        </div>
        <h2 class="nw-assess-complete__title">You're done, ${S(n)}.</h2>
        <p class="nw-assess-complete__desc">Your results have been sent to ${s}. They'll reach out personally — usually within a business day.</p>
      </div>
      <div class="nw-assess-complete__chips">
        <span class="nw-assess-complete__chip nw-assess-complete__chip--teal">${g("clipboard-check")} Part 1 &middot; ${a}/${a} answered</span>
        <span class="nw-assess-complete__chip nw-assess-complete__chip--violet">${g("compass")} Part 2 &middot; ${i}/${i} answered</span>
        <span class="nw-assess-complete__chip nw-assess-complete__chip--gray">${g("check-circle-2")} Assessment complete</span>
      </div>
      <div class="nw-assess-next">
        <div class="nw-assess-next__label">What happens next</div>
        ${[{icon:"inbox",title:"Your recruiter reviews your results",desc:`${s} will read your scenarios and DISC profile, usually within one business day.`,when:"Within 24h"},{icon:"message-square",title:`A personal note from ${s}`,desc:"Not an automated email. They'll share what stood out and what comes next.",when:"Tomorrow"},{icon:"calendar-check",title:"Interview with the hiring team",desc:"If there's a match, you'll get a calendar link to book a slot that works for you.",when:"This week"}].map(({icon:c,title:r,desc:p,when:u},v)=>`
          <div class="nw-assess-next__item">
            <div class="nw-assess-next__icon-wrap">
              <div class="nw-assess-next__iconbox">${g(c)}</div>
              <div class="nw-assess-next__num">${v+1}</div>
            </div>
            <div class="nw-assess-next__body">
              <div class="nw-assess-next__title">${r}</div>
              <div class="nw-assess-next__desc">${p}</div>
            </div>
            <div class="nw-assess-next__when">${u}</div>
          </div>
        `).join("")}
      </div>
      <div class="nw-assess-recruiter">
        <div class="nw-assess-recruiter__avatar">${(e.recruiterName||e.recruiter||"NW").split(" ").map(c=>c[0]).join("").slice(0,2).toUpperCase()}</div>
        <div style="flex:1">
          <div class="nw-assess-recruiter__label">Your recruiter</div>
          <div class="nw-assess-recruiter__name">${s}</div>
          <div class="nw-assess-recruiter__role">Talent partner &middot; Nearwork</div>
        </div>
        <button class="ghost-action" data-page="recruiter" type="button">${g("message-circle")} Message recruiter</button>
      </div>
    </div>
  `}function fs(e,t){return e.length?`
    <section class="section-block page-gap">
      <div class="section-heading"><div><p class="eyebrow">Assessment center</p><h2>Your assessment history</h2></div></div>
      <div class="assessment-history-list">
        ${e.map(n=>`
          <article class="assessment-history-row ${n.id===t?"active":""}">
            <div><strong>${S(n.role||"Nearwork assessment")}</strong><span>${S(n.id||"")}</span></div>
            <div>${S(String(n.status||"assigned"))}</div>
            <a href="/assessment/${encodeURIComponent(n.id)}/start">${n.status==="completed"?"View":"Continue"}</a>
          </article>
        `).join("")}
      </div>
    </section>
  `:""}function vs(e,t){const n=e.questions||[],s=n.filter(d=>d.stage===1),a=n.filter(d=>d.stage===2),i=s.filter(d=>{var c;return typeof d.correctIndex=="number"&&Number((c=t[d.id])==null?void 0:c.value)===d.correctIndex}).length,l=a.filter(d=>{var c;return we(((c=t[d.id])==null?void 0:c.value)??t[d.id])}).length;return{technicalScore:s.length?Math.round(i/s.length*100):0,discScore:a.length?Math.round(l/a.length*100):0}}function hs(e,t){var d,c;const n={Dominance:0,Influence:0,Steadiness:0,Conscientiousness:0};(e.questions||[]).filter(r=>Number(r.stage)===2).forEach(r=>{var b;const p=(b=t[r.id])==null?void 0:b.value;if(!we(p))return;const u=n[r.skill]!==void 0?r.skill:"Steadiness",v=Math.max(1,4-Number(p||0));n[u]+=v});const s=Object.entries(n).sort((r,p)=>p[1]-r[1]),a=((d=s[0])==null?void 0:d[0])||"Steadiness",i=((c=s[s.length-1])==null?void 0:c[0])||"Dominance";return{label:{Dominance:"D",Influence:"I",Steadiness:"S",Conscientiousness:"C"}[a]||"S",high:a,low:i,scores:n,summary:`${a} is the strongest observed DISC tendency; ${i} appears lowest based on this assessment.`}}async function ys(e,t){var c,r,p,u,v;const n="https://admin.nearwork.co/api/send-email",s=e.candidateEmail||((c=o.user)==null?void 0:c.email)||((r=o.candidate)==null?void 0:r.email),a=e.candidateName||((p=o.candidate)==null?void 0:p.name)||((u=o.user)==null?void 0:u.displayName)||"there",i=zt([e.recruiterEmail,e.stakeholderEmail,e.hiringManagerEmail].filter(Boolean).join(",")),l=[];s&&l.push(fetch(n,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({to:s,templateId:"assessment_completed_candidate",data:{name:a,role:e.role,actionUrl:"https://talent.nearwork.co/assessment",actionText:"Open assessment center"}})}));const d=i.length?i:["support@nearwork.co"];l.push(fetch(n,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({to:d,templateId:"assessment_completed_recruiter",data:{name:"Nearwork team",role:e.role,actionUrl:`https://admin.nearwork.co/assessments/${e.id}/questions`,actionText:"Review assessment",message:`${a} completed the assessment. Overall: ${t.score}%. Technical: ${t.technicalScore}%. DISC: ${((v=t.discProfile)==null?void 0:v.label)||"Submitted"}.`}})})),await Promise.allSettled(l)}function ws(){var t;const e=((t=o.candidate)==null?void 0:t.cvLibrary)||[];return`
    <section class="section-block">
      <div class="section-heading"><div><p class="eyebrow">CV picker</p><h2>Store multiple resumes</h2></div></div>
      <form id="cvForm" class="upload-box">
        ${g("upload-cloud")}<strong>Upload a CV for this role</strong><p>Save multiple versions and pick the best one for each opening.</p>
        <input name="cv" type="file" accept=".pdf,.doc,.docx" required />
        <input name="label" type="text" placeholder="CV label, e.g. CSM resume" />
        <button class="primary-action fit" type="submit">Upload CV</button>
      </form>
      <div class="cv-list">
        ${e.length?e.map(n=>`<article class="cv-item">${g("file-text")}<div><strong>${n.name||n.fileName}</strong><span>${ze(n.uploadedAt)}</span></div>${n.url?`<a href="${n.url}" target="_blank" rel="noreferrer">Open</a>`:""}</article>`).join(""):ht("No CVs saved yet","Upload role-specific resumes here.")}
      </div>
    </section>
  `}function bs(){return`
    <section class="tips-hero"><div><p class="eyebrow">Candidate guide</p><h2>Practical prep for US SaaS interviews.</h2><p>Short, useful guidance candidates can read before recruiter screens, assessments, and client interviews.</p></div></section>
    <section class="tips-grid rich">
      ${Rn.map((e,t)=>`
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
  `}function Ss(){var n,s;const t=(((n=o.candidate)==null?void 0:n.recruiter)||{}).bookingUrl||((s=o.candidate)==null?void 0:s.recruiterBookingUrl)||"mailto:support@nearwork.co?subject=Nearwork%20candidate%20question";return`
    <section class="content-grid">
      <div class="section-block"><div class="section-heading"><div><p class="eyebrow">Recruiter</p><h2>Your Nearwork contact</h2></div></div>${Es(!0)}</div>
      <div class="section-block compact"><div class="section-heading"><div><p class="eyebrow">Booking</p><h2>Schedule soon</h2></div></div><p class="muted">Ask the Nearwork recruiting team for the earliest available slot. Candidate booking links can be attached to this profile later.</p><a class="primary-action fit" href="${t}" target="_blank" rel="noreferrer">${g("calendar-plus")} Book recruiter call</a></div>
    </section>
  `}function $s(){return ks("profile")}function j(e,t=!1){return`<span class="pf-label">${e}${t?'<span class="pf-optional">optional</span>':""}</span>`}function te(e,t,n=""){return`
    <div class="pf-card-head">
      <div class="pf-card-icon">${g(e)}</div>
      <div class="pf-card-title">${t}</div>
      ${n?`<span class="pf-card-badge">${n}</span>`:""}
    </div>`}function ft(e,t={}){const n=e,s=(t.company||"?")[0].toUpperCase();return`
    <div class="pf-sub-card work-entry" data-work-index="${n}">
      <div class="pf-sub-card-left">
        <div class="pf-work-avatar">${s}</div>
      </div>
      <div class="pf-sub-card-body">
        <div class="pf-field-row">
          <label class="pf-field">
            ${j("Job title")}
            <input type="text" class="pf-input work-field" data-field="title" value="${S(t.title||"")}" placeholder="e.g. Customer Success Manager" />
          </label>
          <label class="pf-field">
            ${j("Company")}
            <input type="text" class="pf-input work-field" data-field="company" value="${S(t.company||"")}" placeholder="e.g. Acme Corp" />
          </label>
        </div>
        <div class="pf-field-row pf-field-row--3">
          <label class="pf-field">
            ${j("From")}
            <input type="text" class="pf-input work-field" data-field="from" value="${S(t.from||"")}" placeholder="2021-03" />
          </label>
          <label class="pf-field">
            ${j("To")}
            <input type="text" class="pf-input work-field" data-field="to" value="${S(t.to||"")}" placeholder="present" />
          </label>
          <div></div>
        </div>
      </div>
      <button type="button" class="pf-remove-btn remove-work-entry" data-remove="${n}" aria-label="Remove">
        ${g("x")}
      </button>
    </div>`}function vt(e,t={}){const n=e;return`
    <div class="pf-sub-card cert-entry" data-cert-index="${n}">
      <div class="pf-sub-card-left">
        <div class="pf-cert-icon">✓</div>
      </div>
      <div class="pf-sub-card-body">
        <div class="pf-field-row">
          <label class="pf-field">
            ${j("Certificate / Course")}
            <input type="text" class="pf-input cert-field" data-field="name" value="${S(t.name||"")}" placeholder="e.g. Google Analytics" />
          </label>
          <label class="pf-field">
            ${j("Issuer",!0)}
            <input type="text" class="pf-input cert-field" data-field="issuer" value="${S(t.issuer||"")}" placeholder="e.g. Coursera, HubSpot" />
          </label>
        </div>
        <label class="pf-field" style="max-width:200px;">
          ${j("Date (YYYY-MM)",!0)}
          <input type="text" class="pf-input cert-field" data-field="date" value="${S(t.date||"")}" placeholder="2023-06" />
        </label>
      </div>
      <button type="button" class="pf-remove-btn remove-cert-entry" data-remove="${n}" aria-label="Remove">
        ${g("x")}
      </button>
    </div>`}function ks(e="profile"){var u,v,b,_,C,T,$,f,m,h,w,y,A,D,M,E,L;const t=ke(),n=On(),s=ee[n.department]||[],a=((u=o.candidate)==null?void 0:u.salaryCurrency)||"USD",i=jt(((v=o.candidate)==null?void 0:v.salaryAmount)||((b=o.candidate)==null?void 0:b.salary)||((_=o.candidate)==null?void 0:_.salaryUSD),a),l=jn(),d=((C=o.candidate)==null?void 0:C.targetRole)||((T=o.candidate)==null?void 0:T.headline)||"",c=Yt(),r=Gt(),p=r.filter(I=>I.done).length;return`
    <div class="pf-page">

      <!-- Page header -->
      <div class="pf-page-header">
        <div>
          <div class="pf-page-overline">${e==="onboarding"?"Setup":"Candidate profile"}</div>
          <h1 class="pf-page-title">${e==="onboarding"?"Let's build your profile.":"Improve your match quality."}</h1>
        </div>
        <div class="pf-completion-badge">
          <svg viewBox="0 0 40 40" class="pf-completion-ring">
            <circle cx="20" cy="20" r="16" fill="none" stroke="#EBEBEB" stroke-width="3"/>
            <circle cx="20" cy="20" r="16" fill="none" stroke="#16A085" stroke-width="3"
              stroke-dasharray="${(2*Math.PI*16).toFixed(1)}"
              stroke-dashoffset="${(2*Math.PI*16*(1-c/100)).toFixed(1)}"
              stroke-linecap="round" transform="rotate(-90 20 20)"/>
          </svg>
          <span class="pf-completion-pct">${c}%</span>
        </div>
      </div>

      <!-- Progress bar -->
      <div class="pf-progress-bar">
        <div class="pf-progress-fill" style="width:${c}%;"></div>
      </div>
      <div class="pf-progress-label">${p} of ${r.length} sections complete</div>

      <form id="profileForm" class="pf-form">

        <!-- ── Identity ── -->
        <div class="pf-card">
          ${te("user-round","Identity")}
          <div class="pf-identity-row">
            <div class="pf-avatar-upload">
              ${Ft("large")}
              <label class="pf-photo-btn">
                ${g("camera")} Change photo
                <input name="photo" type="file" accept="image/png,image/jpeg,image/webp" style="display:none;" />
              </label>
            </div>
            <div class="pf-field" style="flex:1;">
              ${j("Full name")}
              <input class="pf-input" name="name" value="${S((($=o.candidate)==null?void 0:$.name)||((f=o.user)==null?void 0:f.displayName)||"")}" placeholder="Your full name" />
            </div>
          </div>
        </div>

        <!-- ── Role ── -->
        <div class="pf-card">
          ${te("briefcase-business","Role applying for")}
          <div class="pf-field-row">
            <label class="pf-field">
              ${j("Area")}
              <select class="pf-input" name="roleGroup" id="roleGroupSelect">
                ${Ot(l)}
              </select>
            </label>
            <label class="pf-field">
              ${j("Target role")}
              <select class="pf-input" name="targetRole" id="targetRoleSelect">
                ${Ve(l,d)}
              </select>
            </label>
          </div>
        </div>

        <!-- ── Location ── -->
        <div class="pf-card">
          ${te("map-pin","Location")}
          <div class="pf-field-row">
            <label class="pf-field">
              ${j("Department")}
              <select class="pf-input" name="department" id="departmentSelect">
                ${Object.keys(ee).map(I=>`<option value="${S(I)}" ${I===n.department?"selected":""}>${I}</option>`).join("")}
              </select>
            </label>
            <label class="pf-field">
              ${j("City")}
              <select class="pf-input" name="city" id="citySelect">
                ${s.map(I=>`<option value="${S(I)}" ${I===n.city?"selected":""}>${I}</option>`).join("")}
              </select>
            </label>
          </div>
        </div>

        <!-- ── Compensation ── -->
        <div class="pf-card">
          ${te("banknote","Compensation & English")}
          <div class="pf-field-row pf-field-row--3">
            <label class="pf-field">
              ${j("Target monthly salary")}
              <div class="pf-salary-wrap">
                <select id="salaryCurrencyInput" name="salaryCurrency" class="pf-currency-select">
                  <option value="USD" ${i.salaryCurrency==="USD"?"selected":""}>USD</option>
                  <option value="COP" ${i.salaryCurrency==="COP"?"selected":""}>COP</option>
                </select>
                <input class="pf-input pf-salary-input" id="salaryInput" name="salary" value="${S(i.salary||"")}" inputmode="numeric" placeholder="2,500" />
              </div>
            </label>
            <label class="pf-field">
              ${j("English level")}
              <select class="pf-input" name="english">
                ${["","B1","B2","C1","C2","Native"].map(I=>{var Q;return`<option value="${I}" ${((Q=o.candidate)==null?void 0:Q.english)===I?"selected":""}>${I||"Select level"}</option>`}).join("")}
              </select>
            </label>
            <label class="pf-field">
              ${j("Other languages",!0)}
              <input class="pf-input" name="languages" value="${S((((m=o.candidate)==null?void 0:m.languages)||[]).join(", "))}" placeholder="Spanish, French…" />
            </label>
          </div>
        </div>

        <!-- ── Contact ── -->
        <div class="pf-card">
          ${te("phone","Contact")}
          <div class="pf-field-row">
            <label class="pf-field">
              ${j("WhatsApp number")}
              <input class="pf-input" name="whatsapp" value="${S(((h=o.candidate)==null?void 0:h.whatsapp)||((w=o.candidate)==null?void 0:w.phone)||"")}" inputmode="tel" autocomplete="tel" placeholder="+57 300 123 4567" required />
            </label>
            <label class="pf-field">
              ${j("LinkedIn",!0)}
              <input class="pf-input" name="linkedin" value="${S(((y=o.candidate)==null?void 0:y.linkedin)||"")}" placeholder="https://linkedin.com/in/…" />
            </label>
          </div>
        </div>

        <!-- ── Skills ── -->
        <div class="pf-card">
          ${te("sparkles","Skills",t.length?`${t.length} added`:"")}
          ${Bt(t)}
        </div>

        <!-- ── CV ── -->
        <div class="pf-card" id="profileCvCard">
          ${te("file-text","CV")}
          <p class="pf-hint">Upload the CV you want Nearwork to use for your applications.</p>
          ${(A=o.candidate)!=null&&A.activeCvName||(D=o.candidate)!=null&&D.cvUrl?`
            <div class="pf-cv-current">
              <div class="pf-cv-icon">${g("file-text")}</div>
              <div class="pf-cv-info">
                <strong>${q(o.candidate.activeCvName||"CV on file")}</strong>
                <span>Currently active · upload below to replace</span>
              </div>
              ${o.candidate.cvUrl?`<a class="pf-cv-open" href="${S(o.candidate.cvUrl)}" target="_blank" rel="noreferrer">${g("external-link")} Open</a>`:""}
            </div>`:""}
          <label class="pf-file-label" for="profileCvFileInput">
            ${g("upload")} Choose file (.pdf, .doc, .docx)
          </label>
          <input id="profileCvFileInput" name="profileCv" type="file" accept=".pdf,.doc,.docx" style="display:none;" />
          <label class="pf-field" style="margin-top:10px;">
            ${j("CV label",!0)}
            <input class="pf-input" name="profileCvLabel" type="text" placeholder="e.g. Customer Success CV" />
          </label>
        </div>

        <!-- ── Summary ── -->
        <div class="pf-card">
          ${te("align-left","Summary","optional")}
          <textarea class="pf-input pf-textarea" name="summary" placeholder="Add a short note about what you do best — 2–3 sentences.">${q(((M=o.candidate)==null?void 0:M.summary)||"")}</textarea>
        </div>

        <!-- ── Work history ── -->
        <div class="pf-card" id="workHistoryCard">
          ${te("building-2","Work experience","optional")}
          <p class="pf-hint">Add your previous roles so recruiters can see your background.</p>
          <div id="workEntries" class="pf-entries">
            ${(((E=o.candidate)==null?void 0:E.workHistory)||[]).map((I,Q)=>ft(Q,I)).join("")}
          </div>
          <button type="button" id="addWorkEntry" class="pf-add-btn">
            ${g("plus")} Add position
          </button>
        </div>

        <!-- ── Certifications ── -->
        <div class="pf-card" id="certCard">
          ${te("graduation-cap","Certifications &amp; courses","optional")}
          <p class="pf-hint">Add certificates, licences, or courses relevant to your work.</p>
          <div id="certEntries" class="pf-entries">
            ${(((L=o.candidate)==null?void 0:L.certifications)||[]).map((I,Q)=>vt(Q,I)).join("")}
          </div>
          <button type="button" id="addCertEntry" class="pf-add-btn">
            ${g("plus")} Add certificate
          </button>
        </div>

        <input type="hidden" name="mode" value="${e}" />

        <!-- Save -->
        <div class="pf-footer">
          <button class="pf-save-btn" type="submit">
            ${g("save")} ${e==="onboarding"?"Finish setup":"Save profile"}
          </button>
          <span class="pf-footer-hint">Changes save to your profile instantly.</span>
        </div>

      </form>
    </div>
  `}function Yt(){const e=["name","targetRole","department","city","english","salary","whatsapp"],t=e.filter(n=>{var s,a,i,l;return n==="targetRole"?!!((s=o.candidate)!=null&&s.targetRole||!pt((a=o.candidate)==null?void 0:a.headline)&&((i=o.candidate)!=null&&i.headline)):!!((l=o.candidate)!=null&&l[n])}).length+(ke().length?1:0);return Math.max(25,Math.round(t/(e.length+1)*100))}function Cs(){const e=o.applications[0];return(e==null?void 0:e.stage)||(e==null?void 0:e.status)||"profile-review"}function xs(e){const t=String(e).toLowerCase().replace(/_/g,"-").replace(/\s+/g,"-"),n=Math.max(0,bt.findIndex(s=>t.includes(s.key)||s.key.includes(t)));return`<div class="pipeline">${bt.map((s,a)=>`<article class="${a<=n?"done":""} ${a===n?"current":""}"><span>${a+1}</span><strong>${s.label}</strong><p>${s.help}</p></article>`).join("")}</div>`}function As(){return`
    <div class="empty-state">
      ${g("briefcase-business")}
      <strong>No active pipeline yet</strong>
      <p>Browse current openings and apply when you find a role that fits. Nearwork will show a pipeline here after an application moves forward.</p>
      <div class="empty-actions">
        <button class="primary-action fit" type="button" data-page="matches">${g("sparkles")} View matches</button>
        <a class="secondary-action" href="https://jobs.nearwork.co" target="_blank" rel="noreferrer">${g("external-link")} Open jobs</a>
      </div>
    </div>
  `}function Jt(){try{return new Set(JSON.parse(localStorage.getItem("nw_talent_applied")||"[]"))}catch{return new Set}}function Ns(e){const t=ge(e),s=new Set(o.applications.map(l=>l.jobId||l.openingCode)).has(t.code)||Jt().has(t.code),a=dt(t),i=`https://jobs.nearwork.co/apply?code=${encodeURIComponent(t.code)}`;return`
    <article class="job-card">
      <div>
        ${a.length>=3?`<div class="match-pill">${a.length} skill match</div>`:t.match?`<div class="match-pill">${t.match}% match</div>`:""}
        <h3><a href="${i}" target="_blank" rel="noreferrer" style="color:inherit;text-decoration:none;" onmouseover="this.style.textDecoration='underline'" onmouseout="this.style.textDecoration='none'">${t.title}</a></h3>
        <p>${t.location}</p>
      </div>
      <p class="job-description">${t.description}</p>
      <div class="skill-row">${t.skills.slice(0,4).map(l=>`<span>${l}</span>`).join("")}</div>
      ${a.length>=3?`<p class="field-hint">Matched skills: ${a.slice(0,5).map(q).join(", ")}</p>`:""}
      <div class="job-footer">
        <strong>${t.compensation}</strong>
        <div style="display:flex;gap:8px;align-items:center;">
          <a href="${i}" target="_blank" rel="noreferrer" class="secondary-action" style="text-decoration:none;font-size:12px;opacity:0.75;">View opening ↗</a>
          <button class="secondary-action" type="button" data-apply="${t.code}" ${s?"disabled":""}>${s?"Applied ✓":"Apply"}</button>
        </div>
      </div>
    </article>
  `}function Ps(e){return`<article class="timeline-item"><span>${g("circle-dot")}</span><div><strong>${e.jobTitle||e.title||"Application"}</strong><p>${e.clientName||e.company||"Nearwork"} · ${e.status||"submitted"}</p><small>${ze(e.updatedAt||e.createdAt)}</small></div></article>`}function Es(e=!1){var i;const t=((i=o.candidate)==null?void 0:i.recruiter)||{},n=t.email||"support@nearwork.co",s=t.whatsapp||Tn,a=t.whatsappUrl||In;return`<article class="recruiter-card"><div class="avatar recruiter-avatar">NW</div><div><strong>${t.name||"Nearwork Support"}</strong><p><a href="mailto:${n}">${n}</a></p><p><a href="${a}" target="_blank" rel="noreferrer">WhatsApp ${s}</a></p>${e?"<span>Questions about assessments, interviews, feedback, or CV selection should go here.</span>":""}</div></article>`}function ht(e,t){return`<div class="empty-state">${g("inbox")}<strong>${e}</strong><p>${t}</p></div>`}function Ls(){ct.innerHTML='<main class="loading-screen"><span class="logo-mark">N</span><p>Loading Talent...</p></main>'}function _s(){var e,t,n,s,a,i,l,d,c,r,p,u,v,b,_,C,T,$;(e=document.querySelector("#signOut"))==null||e.addEventListener("click",async()=>{await dn(B),oe&&oe(),oe=null,window.history.pushState({page:"overview"},"","/"),k({user:null,candidate:null,applications:[],assessments:[],jobs:[],view:"login",activePage:"overview",message:""})}),(t=document.querySelector("#signIn"))==null||t.addEventListener("click",()=>{window.history.pushState({page:"overview"},"","/"),k({view:"login",activePage:"overview",message:""})}),document.querySelectorAll("[data-page]").forEach(f=>{f.addEventListener("click",m=>{const h=m.currentTarget.closest("[data-page]")||m.currentTarget;Re(h.dataset.page)})}),(n=document.querySelector("[data-dashboard-home]"))==null||n.addEventListener("click",()=>Re("overview")),(s=document.querySelector("#notificationBell"))==null||s.addEventListener("click",()=>{k({notificationPanelOpen:!o.notificationPanelOpen,notificationSettingsOpen:!1})}),(a=document.querySelector("#notificationSettings"))==null||a.addEventListener("click",()=>{k({notificationSettingsOpen:!o.notificationSettingsOpen,notificationPanelOpen:!1})}),document.querySelectorAll("[data-notification-read]").forEach(f=>{f.addEventListener("click",async()=>{const m=f.dataset.notificationRead;o.user&&pe&&await Ln(m).catch(()=>null),k({notifications:o.notifications.map(h=>h.id===m?{...h,read:!0}:h)})})}),document.querySelectorAll("[data-notification-pref]").forEach(f=>{f.addEventListener("change",async()=>{var y;const m=structuredClone(((y=o.candidate)==null?void 0:y.notificationPreferences)||{}),h=f.dataset.notificationPref,w=f.dataset.channel;m[h]={...m[h]||{},[w]:f.checked},k({candidate:{...o.candidate,notificationPreferences:m}}),o.user&&pe&&await _n(o.user.uid,m).catch(()=>null)})}),document.querySelectorAll("[data-assessment-jump]").forEach(f=>{f.addEventListener("click",async()=>{var D,M,E;const m=ce()||((D=(o.assessments||[])[0])==null?void 0:D.id),h=(o.assessments||[]).find(L=>L.id===m),w=Number(f.dataset.assessmentJump||0),y=(M=h==null?void 0:h.questions)==null?void 0:M[w];if(!m||!y)return;await Le(m,"__progress__","",{currentQuestionIndex:w,totalQuestions:((E=h==null?void 0:h.questions)==null?void 0:E.length)||70,currentStage:y.stage||1}),he(m,w);const A=(o.assessments||[]).map(L=>L.id===m?{...L,currentQuestionIndex:w,currentStage:y.stage||1}:L);k({assessments:A,activePage:"assessment",message:""})})}),document.querySelector("#availability").addEventListener("change",async f=>{const m=f.target.value;k({candidate:{...o.candidate,availability:m}}),o.user&&pe?await Nn(o.user.uid,m):k({message:"Sign in with Google to save availability."})}),(i=document.querySelector("#filterMatches"))==null||i.addEventListener("click",()=>{const f=ke().length>=3;k({matchesFiltered:f?!o.matchesFiltered:!1,message:f?"":"Add at least 5 skills in Profile first, then filter matching openings."})}),(l=document.querySelector("#departmentSelect"))==null||l.addEventListener("change",f=>{const m=document.querySelector("#citySelect"),h=ee[f.target.value]||[];m.innerHTML=h.map(w=>`<option value="${S(w)}">${w}</option>`).join("")}),(d=document.querySelector("#roleGroupSelect"))==null||d.addEventListener("change",f=>{const m=document.querySelector("#targetRoleSelect");m.innerHTML=Ve(f.target.value,"")}),(c=document.querySelector("#salaryCurrencyInput"))==null||c.addEventListener("change",f=>{const m=document.querySelector("#salaryInput");if(!m)return;const h=$t(m.value,f.target.value);f.target.value=h,m.placeholder=h==="COP"?"5,000,000":"2,500",m.value=kt(m.value,h)}),(r=document.querySelector("#salaryInput"))==null||r.addEventListener("blur",f=>{const m=document.querySelector("#salaryCurrencyInput"),h=$t(f.target.value,(m==null?void 0:m.value)||"USD");m&&(m.value=h),f.target.placeholder=h==="COP"?"5,000,000":"2,500",f.target.value=kt(f.target.value,h)}),Xn(),Kt(),Rs(),Ts(),Ds(),document.querySelectorAll("[data-apply]").forEach(f=>{f.addEventListener("click",async()=>{const m=o.jobs.map(ge).find(w=>w.code===f.dataset.apply),h=f.dataset.apply;if(f.disabled=!0,f.textContent="Submitted",o.user&&pe){try{const w=Jt();w.add(h),localStorage.setItem("nw_talent_applied",JSON.stringify([...w]))}catch{}await An(o.user.uid,m),await Qt(o.user),Re("applications")}else k({message:"Sign in with Google to apply to this opening."})})}),(p=document.querySelector("#showTechIntro"))==null||p.addEventListener("click",()=>{k({assessmentUiStep:"techIntro",message:""})}),(u=document.querySelector("#backToWelcome"))==null||u.addEventListener("click",()=>{k({assessmentUiStep:null,message:""})}),(v=document.querySelector("#startDiscAssessment"))==null||v.addEventListener("click",async()=>{var M;const f=ce()||((M=(o.assessments||[])[0])==null?void 0:M.id),m=(o.assessments||[]).find(E=>E.id===f);if(!f||!m)return;const h=m.questions||[],w=document.querySelector("#startDiscAssessment"),y=w?Number(w.dataset.discIndex||50):h.findIndex(E=>Number(E.stage||1)===2),A=y>=0?y:50,D=new Date().toISOString();try{await Le(f,"__progress__","",{currentQuestionIndex:A,totalQuestions:h.length,currentStage:2,discStartedAt:D}),he(f,A);const E=(o.assessments||[]).map(L=>L.id===f?{...L,currentQuestionIndex:A,currentStage:2,discStartedAt:D}:L);k({assessments:E,activePage:"assessment",assessmentUiStep:null,message:""})}catch(E){k({message:de(E)})}}),(b=document.querySelector("#startAssessment"))==null||b.addEventListener("click",async()=>{var h;const f=ce()||((h=(o.assessments||[])[0])==null?void 0:h.id),m=(o.assessments||[]).find(w=>w.id===f)||(o.assessments||[])[0];if(!f||!o.user){k({message:"Please log in to start your assessment."});return}try{await Cn(f,o.user.uid),he(f,Number((m==null?void 0:m.currentQuestionIndex)||0),!0);const w=(o.assessments||[]).map(y=>y.id===f?{...y,status:"started",startedAt:y.startedAt||new Date().toISOString(),technicalStartedAt:y.technicalStartedAt||new Date().toISOString()}:y);k({assessments:w,activePage:"assessment",assessmentUiStep:null,message:""})}catch(w){k({message:de(w)})}}),(_=document.querySelector("#prevAssessmentQuestion"))==null||_.addEventListener("click",async()=>{var D,M,E,L;const f=ce()||((D=(o.assessments||[])[0])==null?void 0:D.id),m=(o.assessments||[]).find(I=>I.id===f),h=Number(((M=document.querySelector("#assessmentQuestionForm"))==null?void 0:M.dataset.currentIndex)??(m==null?void 0:m.currentQuestionIndex)??0),w=Math.max(0,h-1),y=(E=m==null?void 0:m.questions)==null?void 0:E[w];await Le(f,"__progress__","",{currentQuestionIndex:w,totalQuestions:((L=m==null?void 0:m.questions)==null?void 0:L.length)||70,currentStage:(y==null?void 0:y.stage)||1}),he(f,w);const A=(o.assessments||[]).map(I=>I.id===f?{...I,currentQuestionIndex:w,currentStage:(y==null?void 0:y.stage)||1}:I);k({assessments:A,activePage:"assessment",message:""})}),(C=document.querySelector("#assessmentQuestionForm"))==null||C.addEventListener("submit",async f=>{var Ce;f.preventDefault();const m=ce()||((Ce=(o.assessments||[])[0])==null?void 0:Ce.id),h=(o.assessments||[]).find(F=>F.id===m),w=(h==null?void 0:h.questions)||[],y=Number(f.currentTarget.dataset.currentIndex??(h==null?void 0:h.currentQuestionIndex)??0),A=w[y],D=new FormData(f.currentTarget).get("answer");if(!A){k({message:"This question could not be loaded. Please refresh and try again."});return}const M=D===null?{value:"",skipped:!0,answeredAt:new Date().toISOString()}:{value:Number(D),skipped:!1,answeredAt:new Date().toISOString()},E={...h.answers||{},[A.id]:M},L=w[y+1],I=L&&Number(L.stage||1)!==Number(A.stage||1),Q=tt(h,A.stage,E);try{if((I||y+1>=w.length)&&Q.length){await Le(m,A.id,E[A.id],{currentQuestionIndex:y,totalQuestions:w.length,currentStage:A.stage||1});const F=(o.assessments||[]).map(W=>W.id===m?{...W,answers:E,currentQuestionIndex:y,currentStage:A.stage||1,progress:`${y+1}/${w.length}`}:W);k({assessments:F,activePage:"assessment",message:`You missed ${Q.length} question${Q.length===1?"":"s"} in the ${ut(A.stage)}.`});return}if(y+1>=w.length){const F=vs(h,E),W=hs(h,E);await xn(m,E,{totalQuestions:w.length,technicalScore:F.technicalScore,discScore:F.discScore,score:Math.round(F.technicalScore*.75+F.discScore*.25),discProfile:W}),fetch("https://admin.nearwork.co/api/generate-assessment-insights",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({assessmentId:m})}).catch(()=>null),ys(h,{score:Math.round(F.technicalScore*.75+F.discScore*.25),technicalScore:F.technicalScore,discScore:F.discScore,discProfile:W}).catch(re=>console.warn(re));const G=(o.assessments||[]).map(re=>re.id===m?{...re,answers:E,status:"completed",score:Math.round(F.technicalScore*.75+F.discScore*.25),technical:F.technicalScore,disc:W.label,discProfile:W,progress:`${w.length}/${w.length}`}:re);k({assessments:G,activePage:"assessment",message:""})}else{const F=A.stage===1&&(L==null?void 0:L.stage)===2&&!h.discStartedAt;await Le(m,A.id,E[A.id],{currentQuestionIndex:y+1,totalQuestions:w.length,currentStage:(L==null?void 0:L.stage)||A.stage||1}),he(m,y+1);const W=(o.assessments||[]).map(G=>G.id===m?{...G,answers:E,currentQuestionIndex:y+1,currentStage:(L==null?void 0:L.stage)||A.stage||1,progress:`${y+1}/${w.length}`}:G);k({assessments:W,activePage:"assessment",message:"",assessmentUiStep:F?"discIntro":null})}}catch(F){k({message:de(F)})}}),(T=document.querySelector("#profileForm"))==null||T.addEventListener("submit",async f=>{var D,M,E,L,I,Q,Ce,F,W;f.preventDefault();const m=new FormData(f.currentTarget),h=m.get("department"),w=m.get("city"),y=jt(m.get("salary"),m.get("salaryCurrency")),A={name:m.get("name"),targetRole:m.get("targetRole"),headline:m.get("targetRole"),department:h,city:w,locationId:`${String(w).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g,"-")}-co`,location:`${w}, ${h}`,locationCity:w,locationDepartment:h,locationCountry:"Colombia",english:m.get("english"),salary:y.salary,salaryUSD:y.salaryUSD,salaryAmount:y.salaryAmount,salaryCurrency:y.salaryCurrency,expectedSalaryAmount:y.salaryAmount,expectedSalaryCurrency:y.salaryCurrency,linkedin:m.get("linkedin"),whatsapp:m.get("whatsapp"),phone:m.get("whatsapp"),skills:[...new Set(m.getAll("skills").map(ve).filter(Boolean))],otherSkills:[],languages:(m.get("languages")||"").split(",").map(G=>G.trim()).filter(Boolean),summary:m.get("summary"),email:((D=o.candidate)==null?void 0:D.email)||((M=o.user)==null?void 0:M.email)||"",availability:((E=o.candidate)==null?void 0:E.availability)||"open",onboarded:!0};if(!o.user){k({candidate:{...o.candidate,...A},message:"Preview updated. Sign in with Google to save this profile."});return}try{const G=m.get("photo");let re=((L=o.candidate)==null?void 0:L.photoURL)||((I=o.user)==null?void 0:I.photoURL)||"";G!=null&&G.name&&(re=await Pn(o.user.uid,G));const Ie=(Q=m.get("profileCv"))!=null&&Q.name?m.get("profileCv"):Fe;let fe=null,yt=!1;if(Ie!=null&&Ie.name)try{fe=await et(o.user.uid,Ie,m.get("profileCvLabel")||""),Fe=null}catch{yt=!0}const Qe={...A,photoURL:re,candidateCode:(Ce=o.candidate)==null?void 0:Ce.candidateCode,marketingConsent:((F=o.candidate)==null?void 0:F.marketingConsent)===!0,...fe?{activeCvId:fe.id,activeCvName:fe.name||fe.fileName,cvUrl:fe.url,cvLibrary:[...((W=o.candidate)==null?void 0:W.cvLibrary)||[],fe]}:{},workHistory:(()=>{var Ae,Ne,Pe,Ee;const xe=Is();return xe.length?xe:(Ae=J==null?void 0:J.workHistory)!=null&&Ae.length&&(ye||!((Pe=(Ne=o.candidate)==null?void 0:Ne.workHistory)!=null&&Pe.length))?J.workHistory:((Ee=o.candidate)==null?void 0:Ee.workHistory)||[]})(),certifications:(()=>{var Ae,Ne,Pe,Ee;const xe=qs();return xe.length?xe:(Ae=J==null?void 0:J.certifications)!=null&&Ae.length&&(ye||!((Pe=(Ne=o.candidate)==null?void 0:Ne.certifications)!=null&&Pe.length))?J.certifications:((Ee=o.candidate)==null?void 0:Ee.certifications)||[]})()};J=null,ye=!1;const Ge=await it(o.user.uid,Qe),Xt=yt?"Profile saved, but the CV failed to upload. Try uploading it again from the CV section.":(Ge==null?void 0:Ge.atsSynced)===!1?"Profile saved. Nearwork will finish connecting it to your workspace.":"Profile saved.";m.get("mode")==="onboarding"?(window.history.pushState({page:"overview"},"","/"),k({candidate:{...o.candidate,...Qe},activePage:"overview",message:"Profile complete. Welcome to Talent."})):k({candidate:{...o.candidate,...Qe},message:Xt})}catch(G){k({message:de(G)})}}),($=document.querySelector("#cvForm"))==null||$.addEventListener("submit",async f=>{var w;f.preventDefault();const m=new FormData(f.currentTarget),h=m.get("cv");if(h!=null&&h.name){if(!o.user){k({message:"Sign in with Google to upload and store CVs."});return}try{const y=await et(o.user.uid,h,m.get("label"));k({candidate:{...o.candidate,cvLibrary:[...((w=o.candidate)==null?void 0:w.cvLibrary)||[],y],activeCvId:y.id},message:"CV uploaded."})}catch(y){k({message:de(y)})}}})}function Ts(){const e=document.querySelector("#workHistoryCard");if(!e)return;let t=e.querySelectorAll(".work-entry").length;e.addEventListener("click",n=>{var a;const s=n.target.closest(".remove-work-entry");if(s){(a=s.closest(".work-entry"))==null||a.remove();return}if(n.target.closest("#addWorkEntry")){const i=document.querySelector("#workEntries");if(!i)return;const l=document.createElement("div");l.innerHTML=ft(t++,{}),i.appendChild(l.firstElementChild)}})}function Is(){return[...document.querySelectorAll(".work-entry")].map(e=>{const t=n=>{var s,a;return((a=(s=e.querySelector(`[data-field="${n}"]`))==null?void 0:s.value)==null?void 0:a.trim())||""};return{title:t("title"),company:t("company"),from:t("from"),to:t("to")}}).filter(e=>e.title||e.company)}function Ds(){const e=document.querySelector("#certCard");if(!e)return;let t=e.querySelectorAll(".cert-entry").length;e.addEventListener("click",n=>{var a;const s=n.target.closest(".remove-cert-entry");if(s){(a=s.closest(".cert-entry"))==null||a.remove();return}if(n.target.closest("#addCertEntry")){const i=document.querySelector("#certEntries");if(!i)return;const l=document.createElement("div");l.innerHTML=vt(t++,{}),i.appendChild(l.firstElementChild)}})}function qs(){return[...document.querySelectorAll(".cert-entry")].map(e=>{const t=n=>{var s,a;return((a=(s=e.querySelector(`[data-field="${n}"]`))==null?void 0:s.value)==null?void 0:a.trim())||""};return{name:t("name"),issuer:t("issuer"),date:t("date")}}).filter(e=>e.name)}function Rs(){var s,a,i,l,d,c;const e=document.querySelector("#profileForm"),t=e==null?void 0:e.querySelector('input[name="profileCv"]');if(!e||!t)return;((s=e.querySelector('input[name="mode"]'))==null?void 0:s.value)==="onboarding"&&!((i=(a=o.candidate)==null?void 0:a.skills)!=null&&i.length)&&!((d=(l=o.candidate)==null?void 0:l.workHistory)!=null&&d.length)&&!((c=o.candidate)!=null&&c.name)?Ms(e,t):Us(t)}function Ms(e,t){var l;const n=document.querySelector("#profileCvCard");if(!n)return;const s=[...e.children].filter(d=>d!==n&&d.type!=="hidden"&&d.getAttribute("name")!=="mode");s.forEach(d=>{d.style.display="none"});const a=document.createElement("p");a.id="cvGatePrompt",a.style.cssText="font-size:13px;color:var(--mid);margin:10px 0 4px;text-align:center;",a.innerHTML=`Upload your CV and we'll fill in the rest for you — or <button type="button" id="skipCvParse" style="background:none;border:none;padding:0;font-size:13px;color:var(--green);cursor:pointer;text-decoration:underline;">skip and fill in manually</button>`,n.insertAdjacentElement("afterend",a);function i(){var d,c;(d=document.querySelector("#cvGatePrompt"))==null||d.remove(),(c=document.querySelector("#cvParseLoading"))==null||c.remove(),s.forEach(r=>{r.style.display=""})}(l=document.querySelector("#skipCvParse"))==null||l.addEventListener("click",i),t.addEventListener("change",async()=>{var p,u;const d=(p=t.files)==null?void 0:p[0];if(!d)return;(u=document.querySelector("#cvGatePrompt"))==null||u.remove();const c=document.createElement("p");c.id="cvParseLoading",c.style.cssText="font-size:13px;font-weight:600;color:var(--green);padding:14px 0;text-align:center;",c.textContent="Analysing your CV…",n.insertAdjacentElement("afterend",c),J=null,ye=!0;const r=await rt(d);i(),r&&(J=r,Fs(r,!0),Os(r,t))})}function Us(e){e.addEventListener("change",async()=>{var d,c,r,p,u,v,b,_,C;const t=(d=e.files)==null?void 0:d[0];if(!t)return;J=null,ye=!1,Fe=null,k({message:"⏳ Analysing your CV — this takes up to 30 seconds…"});const n=await rt(t);if(!n){k({message:"⚠️ Could not read your CV. Check the browser console for details, or try a different file."});return}J=n,ye=!0,Fe=t;const s=o.candidate||{},a={...s,...n.name?{name:n.name}:{},...n.phone?{whatsapp:n.phone,phone:n.phone}:{},...n.summary?{summary:n.summary}:{},skills:(c=n.skills)!=null&&c.length?[...new Set(n.skills.map(ve).filter(Boolean))]:s.skills||[],workHistory:(r=n.workHistory)!=null&&r.length?n.workHistory:s.workHistory||[],certifications:(p=n.certifications)!=null&&p.length?n.certifications:s.certifications||[],languages:(u=n.languages)!=null&&u.length?n.languages:s.languages||[]},i=[];n.name&&i.push("name"),n.phone&&i.push("phone"),n.summary&&i.push("summary"),(v=n.skills)!=null&&v.length&&i.push(`${n.skills.length} skill${n.skills.length!==1?"s":""}`),(b=n.workHistory)!=null&&b.length&&i.push(`${n.workHistory.length} role${n.workHistory.length!==1?"s":""}`),(_=n.certifications)!=null&&_.length&&i.push(`${n.certifications.length} cert${n.certifications.length!==1?"s":""}`),(C=n.languages)!=null&&C.length&&i.push("languages");const l=i.length?`✓ Pre-filled from CV: ${i.join(", ")}. Review and save your profile.`:"✓ CV analysed. Review your profile and save.";k({candidate:a,message:l})})}function Fs(e,t){var s,a,i,l,d;const n=(c,r)=>{const p=document.querySelector(c);p&&r&&t&&(p.value=r)};if(n('input[name="name"]',e.name),n('input[name="whatsapp"]',e.phone),n('textarea[name="summary"]',e.summary),(s=e.skills)!=null&&s.length){const c=document.querySelector("#selectedSkills");if(c){c.innerHTML="";const r=new Set([...c.querySelectorAll('input[name="skills"]')].map(u=>u.value.toLowerCase()));(a=c.querySelector(".skill-empty"))==null||a.remove(),[...new Set(e.skills.map(ve).filter(Boolean))].forEach(u=>{if(r.has(u.toLowerCase()))return;r.add(u.toLowerCase());const v=document.createElement("span");v.className="selected-skill",v.setAttribute("data-skill-chip",u),v.innerHTML=`${q(u)}<button type="button" class="skill-remove" data-remove-skill="${S(u)}" aria-label="Remove ${S(u)}">×</button><input type="hidden" name="skills" value="${S(u)}" />`,c.appendChild(v)})}}if((i=e.workHistory)!=null&&i.length){const c=document.querySelector("#workEntries");if(c){c.innerHTML="";let r=c.querySelectorAll(".work-entry").length;e.workHistory.forEach(p=>{const u=document.createElement("div");u.innerHTML=ft(r++,p),c.appendChild(u.firstElementChild)})}}if((l=e.languages)!=null&&l.length){const c=document.querySelector('input[name="languages"]');c&&t&&(c.value=e.languages.join(", "))}if((d=e.certifications)!=null&&d.length){const c=document.querySelector("#certEntries");if(c){c.innerHTML="";let r=c.querySelectorAll(".cert-entry").length;e.certifications.forEach(p=>{const u=document.createElement("div");u.innerHTML=vt(r++,p),c.appendChild(u.firstElementChild)})}}He()}function Os(e,t){var a,i,l,d,c;const n=[];e.name&&n.push("name"),e.phone&&n.push("phone"),(a=e.skills)!=null&&a.length&&n.push(`${e.skills.length} skill${e.skills.length>1?"s":""}`),(i=e.workHistory)!=null&&i.length&&n.push(`${e.workHistory.length} role${e.workHistory.length>1?"s":""}`),(l=e.certifications)!=null&&l.length&&n.push(`${e.certifications.length} cert${e.certifications.length>1?"s":""}`),(d=e.languages)!=null&&d.length&&n.push("languages"),(c=document.querySelector("#cvParseHint"))==null||c.remove();const s=document.createElement("p");s.id="cvParseHint",s.style.cssText="font-size:12px;color:var(--green);margin:4px 0 0;",s.innerHTML=n.length?`✓ Pre-filled: <strong>${n.join(", ")}</strong>. Review and save.`:"✓ CV analysed. Review your profile and save.",t.insertAdjacentElement("afterend",s)}function Kt(){var c;const e=document.querySelector("[data-skill-search]");if(!e)return;const t=e.querySelector("#skillSearchInput"),n=e.querySelector("#skillSuggestions"),s=e.querySelector("#selectedSkills"),a=()=>[...s.querySelectorAll('input[name="skills"]')].map(r=>r.value),i=r=>{s.innerHTML=r.length?r.map(p=>`
      <span class="selected-skill" data-skill-chip="${S(p)}">
        ${q(p)}
        <button type="button" class="skill-remove" data-remove-skill="${S(p)}" aria-label="Remove ${S(p)}">×</button>
        <input type="hidden" name="skills" value="${S(p)}" />
      </span>`).join(""):'<span class="skill-empty">Selected skills will appear here.</span>'},l=()=>{const r=z(t.value),p=t.value.trim(),u=new Set(a().map(z)),v=Dt.filter(T=>!u.has(z(T))).filter(T=>!r||z(T).includes(r)).slice(0,12),b=v.find(T=>z(T)===r),C=p.length>1&&!u.has(z(p))&&!b?`<button type="button" class="skill-suggestion add-custom" data-skill="${S(p)}">+ Add "${q(p)}"</button>`:"";n.innerHTML=C+v.map(T=>`<button type="button" class="skill-suggestion" data-skill="${S(T)}">${q(T)}</button>`).join("")},d=r=>{const p=(r||t.value).trim(),u=ve(p);if(!u)return;const v=z(u),b=a();if(b.length>=20&&!b.some(C=>z(C)===v)){t.value="";return}const _=[...b.filter(C=>z(C)!==v),u];i(_),t.value="",l()};t==null||t.addEventListener("input",l),t==null||t.addEventListener("focus",l),t==null||t.addEventListener("keydown",r=>{if(r.key!=="Enter")return;r.preventDefault();const p=z(t.value),u=[...n.querySelectorAll(".skill-suggestion:not(.add-custom)")].find(v=>z(v.dataset.skill)===p);d((u==null?void 0:u.dataset.skill)||t.value)}),(c=e.querySelector("#addTypedSkill"))==null||c.addEventListener("click",()=>d(t.value)),n.addEventListener("click",r=>{const p=r.target.closest("[data-skill]");p&&d(p.dataset.skill)}),s.addEventListener("click",r=>{const p=r.target.closest("[data-remove-skill]");if(!p)return;const u=z(p.dataset.removeSkill);i(a().filter(v=>z(v)!==u)),l()})}function Zt(){if(o.loading)return Ls();if(o.view==="dashboard")return Wt();Vt()}window.addEventListener("popstate",()=>{const e=Oe();e==="overview"&&!o.user?k({view:"login",activePage:"overview",message:""}):o.view==="dashboard"?Re(e,!1):Me()});pe?(an(B,e=>{if(e)Qt(e);else{try{localStorage.removeItem("nw_talent_applied")}catch{}Me()}}),window.setTimeout(()=>{o.loading&&Me()},2500)):Me();
