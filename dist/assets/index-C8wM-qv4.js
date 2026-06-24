import{initializeApp as ya}from"https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";import{getAuth as wa,signInWithCustomToken as ba,onAuthStateChanged as Sa,createUserWithEmailAndPassword as Ca,updateProfile as ka,signInWithEmailAndPassword as $a,signOut as ct}from"https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";import{getFirestore as Aa,query as ce,collection as se,where as de,limit as ue,getDocs as pe,getDoc as xe,doc as F,setDoc as W,serverTimestamp as j,onSnapshot as xa,updateDoc as Pa,addDoc as Dt,arrayUnion as vt}from"https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";import{getStorage as Ea,ref as ft,uploadBytes as jt,getDownloadURL as zt,deleteObject as La}from"https://www.gstatic.com/firebasejs/10.12.5/firebase-storage.js";(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))n(s);new MutationObserver(s=>{for(const i of s)if(i.type==="childList")for(const l of i.addedNodes)l.tagName==="LINK"&&l.rel==="modulepreload"&&n(l)}).observe(document,{childList:!0,subtree:!0});function a(s){const i={};return s.integrity&&(i.integrity=s.integrity),s.referrerPolicy&&(i.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?i.credentials="include":s.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function n(s){if(s.ep)return;s.ep=!0;const i=a(s);fetch(s.href,i)}})();const Ht={apiKey:"AIzaSyApRNyW8PoP28E0x77dUB5jOgHuTqA2by4",authDomain:"nearwork-97e3c.firebaseapp.com",projectId:"nearwork-97e3c",storageBucket:"nearwork-97e3c.firebasestorage.app",messagingSenderId:"145642656516",appId:"1:145642656516:web:0ac2da8931283121e87651",measurementId:"G-3LC8N6FFSH"},we=Object.values(Ht).slice(0,6).every(Boolean),Ae=we?ya(Ht):null,U=Ae?wa(Ae):null,L=Ae?Aa(Ae):null,Xe=Ae?Ea(Ae):null,T={users:"users",candidates:"candidates",openings:"openings",pipelines:"pipelines",applications:"applications",assessments:"assessments",activity:"candidateActivity",notifications:"notifications",notificationPreferences:"notificationPreferences"},Vt="/api/send-email-proxy";function G(){if(!Ae||!U||!L||!Xe)throw new Error("Missing Firebase environment variables. Copy .env.example to .env.local and fill in the Admin app config.")}async function Ta(e={}){var i,l;const t=String(e.email||((i=U==null?void 0:U.currentUser)==null?void 0:i.email)||"").trim().toLowerCase();if(!t)return{ok:!1,skipped:!0,reason:"Missing candidate email"};const a=e.name||((l=U==null?void 0:U.currentUser)==null?void 0:l.displayName)||"",n=e.firstName||a.split(/\s+/)[0]||"there",s=await fetch(Vt,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({to:t,templateId:"account_created",data:{name:a||n,firstName:n,actionUrl:"https://talent.nearwork.co"}})});return s.json().catch(()=>({ok:s.ok}))}async function Na(e={},t={}){var l,r;const a=String((e==null?void 0:e.email)||((l=U==null?void 0:U.currentUser)==null?void 0:l.email)||"").trim().toLowerCase();if(!a)return{ok:!1,skipped:!0,reason:"Missing candidate email"};const n=(e==null?void 0:e.name)||((r=U==null?void 0:U.currentUser)==null?void 0:r.displayName)||"",s=(e==null?void 0:e.firstName)||n.split(/\s+/)[0]||"there",i=await fetch(Vt,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({to:a,templateId:"job_applied",data:{name:n||s,firstName:s,roleTitle:t.title||t.role||t.openingTitle||"this role",openingCode:t.code||t.id||"",actionUrl:"https://talent.nearwork.co"}})});return i.json().catch(()=>({ok:i.ok}))}async function Gt(e){G();const t=await xe(F(L,T.users,e));return t.exists()?{id:t.id,...t.data()}:null}async function Ma(e){G();const t=String(e||"").trim(),a=t.toLowerCase(),n=ce(se(L,T.users),de("email","==",a),ue(1)),s=await pe(n);if(!s.empty)return{id:s.docs[0].id,...s.docs[0].data()};if(t===a)return null;const i=ce(se(L,T.users),de("email","==",t),ue(1)),l=await pe(i);return l.empty?null:{id:l.docs[0].id,...l.docs[0].data()}}async function qa(e){const t=await Gt(e.uid);if(t)return t;const a=await Ma(e.email);return a?(await Jt(e.uid,{...a,email:e.email,connectedFromUserId:a.id}),{...a,id:e.uid,connectedFromUserId:a.id}):null}async function Qt(e,t,a){const n=await xe(F(L,T.candidates,t)).catch(()=>null),s=n!=null&&n.exists()?n.data():{};return Wt(e,{...s,...a,candidateCode:t})}async function Jt(e,t){G();const a=t.candidateCode||Ge(e),n={...t,candidateCode:a,role:"candidate",updatedAt:j()};await W(F(L,T.users,e),n,{merge:!0}),await W(F(L,T.candidates,a),await Qt(e,a,{...n,candidateCode:a}),{merge:!0}).catch(()=>null),t.marketingConsent===!0&&Zt({...n,candidateCode:a,source:"talent.nearwork.co"}).catch(()=>null)}function Ge(e){return`CAND-${String(e||"").replace(/[^a-z0-9]/gi,"").slice(0,8).toUpperCase()||Date.now()}`}function Ia(e){return String(e||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"")}function Wt(e,t){const a=t.candidateCode||Ge(e),n=t.location||[t.locationCity||t.city,t.locationDepartment||t.department].filter(Boolean).join(", "),s=new Date().toISOString().slice(0,10);return{code:a,uid:e,ownerUid:e,name:t.name||"Talent member",role:t.targetRole||t.headline||"Nearwork candidate",skills:Array.isArray(t.skills)?t.skills:[],applied:t.applied||s,lastContact:t.lastContact||s,experience:Number(t.experience||0),location:n,city:Ia(t.locationCity||t.city||n),department:t.locationDepartment||t.department||"",country:t.locationCountry||"Colombia",source:"talent.nearwork.co",status:t.status||"active",score:Number(t.score||50),email:t.email||"",phone:t.whatsapp||t.phone||"",whatsapp:t.whatsapp||t.phone||"",currentRole:t.currentRole||"",salary:t.salary||"",salaryUSD:Number(t.salaryUSD||0)||null,salaryAmount:Number(t.salaryAmount||t.expectedSalaryAmount||0)||null,salaryCurrency:t.salaryCurrency||t.expectedSalaryCurrency||"USD",expectedSalaryUSD:Number(t.expectedSalaryUSD||0)||null,expectedSalaryCOP:Number(t.expectedSalaryCOP||0)||null,expectedSalaryAmount:Number(t.expectedSalaryAmount||t.salaryAmount||0)||null,expectedSalaryCurrency:t.expectedSalaryCurrency||t.salaryCurrency||"USD",expectedSalary:t.expectedSalary||t.salary||"",availability:t.availability||"open",english:t.english||"",visa:t.visa||"No",linkedin:t.linkedin||"",cv:t.activeCvName||"",cvUrl:t.cvUrl||null,photoUrl:t.photoURL||t.photoUrl||null,tags:t.tags||["talent profile"],notes:t.summary||"",summary:t.summary||"",workHistory:Array.isArray(t.workHistory)?t.workHistory:[],languages:Array.isArray(t.languages)?t.languages:[],certifications:Array.isArray(t.certifications)?t.certifications:[],appliedBefore:!!t.appliedBefore,applications:t.applications||[],pipelineCodes:t.pipelineCodes||[],loom:t.loom||"Not uploaded",assessments:t.assessments||[],work:t.work||[],updatedAt:j()}}async function Da(e){G();const t=ce(se(L,T.applications),de("candidateId","==",e),ue(20)),a=ce(se(L,T.applications),de("ownerUid","==",e),ue(20)),n=await Promise.allSettled([pe(t),pe(a)]),s=new Map;return n.forEach(i=>{i.status==="fulfilled"&&i.value.docs.forEach(l=>s.set(l.id,{id:l.id,...l.data()}))}),Array.from(s.values()).sort((i,l)=>{const r=d=>{var c,p;return((p=(c=d==null?void 0:d.toDate)==null?void 0:c.call(d))==null?void 0:p.getTime())??(d?new Date(d).getTime():0)};return r(l.updatedAt||l.createdAt)-r(i.updatedAt||i.createdAt)})}async function _a(e,t="",a=""){G();const n=String(t||"").trim().toLowerCase(),s=String(a||"").trim(),i=[pe(ce(se(L,T.assessments),de("candidateUid","==",e),ue(25))),pe(ce(se(L,T.assessments),de("candidateId","==",e),ue(25)))];n&&i.push(pe(ce(se(L,T.assessments),de("candidateEmail","==",n),ue(25)))),s&&i.push(pe(ce(se(L,T.assessments),de("candidateCode","==",s),ue(25))));const l=await Promise.allSettled(i),r=new Map;return l.forEach(d=>{d.status==="fulfilled"&&d.value.docs.forEach(c=>r.set(c.id,{id:c.id,...c.data()}))}),Array.from(r.values()).sort((d,c)=>{const p=u=>{var v,h;return((h=(v=u==null?void 0:u.toDate)==null?void 0:v.call(u))==null?void 0:h.getTime())??(u?new Date(u).getTime():0)};return p(c.updatedAt||c.createdAt||c.sentAt)-p(d.updatedAt||d.createdAt||d.sentAt)})}async function Ra(e,t,a="",n=""){G();const s=await xe(F(L,T.assessments,e));if(!s.exists())return null;const i={id:s.id,...s.data()},l=String(a||"").trim().toLowerCase(),r=String(n||"").trim();return i.candidateUid===t||i.candidateId===t||String(i.candidateEmail||"").trim().toLowerCase()===l||String(i.candidateCode||"").trim()===r?i:null}async function Ua(e,t){G();const a=await xe(F(L,T.assessments,e)),n=a.exists()?a.data():{};if(n.status==="completed")throw new Error("This assessment is already completed.");if(n.expiresAt&&Date.now()>new Date(n.expiresAt).getTime())throw new Error("This assessment link has expired.");await W(F(L,T.assessments,e),{status:"started",currentQuestionIndex:Number(n.currentQuestionIndex||0),currentStage:Number(n.currentStage||1),technicalStartedAt:n.technicalStartedAt||j(),startedAt:n.startedAt||j(),updatedAt:j()},{merge:!0})}async function Fe(e,t,a,n={}){G();const s=await xe(F(L,T.assessments,e)),i=s.exists()?s.data():{};if(i.status==="completed")throw new Error("This assessment is already completed.");if(i.expiresAt&&Date.now()>new Date(i.expiresAt).getTime())throw new Error("This assessment link has expired.");await W(F(L,T.assessments,e),{[`answers.${t}`]:a,progress:`${n.currentQuestionIndex||0}/${n.totalQuestions||""}`.replace(/\/$/,""),currentQuestionIndex:n.currentQuestionIndex||0,currentStage:n.currentStage||1,...n.discStartedAt?{discStartedAt:n.discStartedAt}:{},updatedAt:j()},{merge:!0})}async function Ba(e,t,a={}){var v;G();const n=F(L,T.assessments,e),s=await xe(n),i=s.exists()?s.data():{};if(i.status==="completed")throw new Error("This assessment is already completed.");if(i.expiresAt&&Date.now()>new Date(i.expiresAt).getTime())throw new Error("This assessment link has expired.");const l=Object.values(t||{}).filter(h=>String((h==null?void 0:h.value)??h??"").trim()).length,r=Number(a.totalQuestions||Object.keys(t||{}).length||0),d=Number(a.technicalScore||0),c=Number(a.discScore||0),p=Number(a.score||(r?Math.round(l/r*100):0));await W(n,{answers:t,answeredCount:l,totalQuestions:r,score:p,technical:d||p,disc:((v=a.discProfile)==null?void 0:v.label)||(c?`${c}%`:"Submitted"),discScore:c,discProfile:a.discProfile||null,progress:`${l}/${r}`,status:"completed",finished:new Date().toLocaleString("en-US",{month:"short",day:"numeric",year:"numeric",hour:"numeric",minute:"2-digit"}),finishedAt:j(),updatedAt:j()},{merge:!0});const u=Math.round(p);i.candidateUid&&await W(F(L,T.users,i.candidateUid),{score:u,nwScore:u,lastAssessmentScore:u,lastAssessmentId:e,updatedAt:j()},{merge:!0}).catch(()=>null),i.candidateCode&&await W(F(L,T.candidates,i.candidateCode),{score:u,nwScore:u,lastAssessmentScore:u,lastAssessmentId:e,updatedAt:j()},{merge:!0}).catch(()=>null)}async function Yt(){G();const e=ce(se(L,T.openings),de("published","==",!0),ue(12));return(await pe(e)).docs.map(a=>({id:a.id,...a.data()}))}async function Fa(e,t){G();const a=t.code||t.id,n=await Gt(e).catch(()=>null),s=(n==null?void 0:n.candidateCode)||Ge(e),i=new Date().toISOString().slice(0,10),l={opening:a,openingCode:a,jobId:a,role:t.title||t.role||"Untitled role",openingTitle:t.title||t.role||"Untitled role",applied:i,appliedAt:i,status:"applied",outcome:"Application only",source:"talent.nearwork.co"},r={candidateId:e,ownerUid:e,authUid:e,candidateDocId:s,candidateCode:s,candidateEmail:(n==null?void 0:n.email)||"",candidateName:(n==null?void 0:n.name)||"",openingCode:a,jobId:a,openingTitle:t.title||t.role||"Untitled role",jobTitle:t.title||t.role||"Untitled role",title:t.title||t.role||"Untitled role",clientName:t.orgName||t.clientName||t.company||"Nearwork client",status:"applied",inPipeline:!1,isMockData:!1,source:"talent.nearwork.co",createdAt:j(),updatedAt:j()};await Dt(se(L,T.applications),r),await W(F(L,T.candidates,s),{...Wt(e,{...n||{},candidateCode:s,appliedBefore:!0,lastContact:i}),applications:vt(l),appliedBefore:!0},{merge:!0}).catch(()=>null),await W(F(L,T.users,e),{role:"candidate",candidateCode:s,code:s,applications:vt(l),lastAppliedOpeningCode:a,lastAppliedAt:j(),updatedAt:j()},{merge:!0}).catch(()=>null),await Dt(se(L,T.activity),{candidateId:e,type:"application_submitted",title:r.jobTitle,createdAt:j()}).catch(()=>null),Na(n,t).catch(()=>null)}async function Oa(e,t){await Pa(F(L,T.users,e),{availability:t,updatedAt:j()})}async function Ct(e,t){G();const a=t.candidateCode||Ge(e);await W(F(L,T.users,e),{...t,candidateCode:a,role:"candidate",updatedAt:j()},{merge:!0});try{return await W(F(L,T.candidates,a),await Qt(e,a,{...t,candidateCode:a}),{merge:!0}),t.marketingConsent===!0&&Zt({...t,candidateCode:a,source:"talent.nearwork.co"}).catch(()=>null),{candidateCode:a,atsSynced:!0}}catch(n){return console.warn("Candidate ATS sync failed.",n),{candidateCode:a,atsSynced:!1}}}async function ja(){var n;G();const e=await((n=U.currentUser)==null?void 0:n.getIdToken());if(!e)throw new Error("You must be signed in to delete your account.");const t=await fetch("/api/delete-account",{method:"POST",headers:{Authorization:`Bearer ${e}`}}),a=await t.json().catch(()=>({}));if(!t.ok||!a.ok)throw new Error(a.error||"Failed to delete account.");return a}async function za(e){const t=await fetch("/api/send-reset",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:e,continueUrl:`${window.location.origin}/reset-password`})}),a=await t.json().catch(()=>({}));if(!t.ok||!a.ok)throw new Error(a.error||"Failed to send the reset email.");return a}async function Zt(e){var s,i;const t=(e==null?void 0:e.email)||((s=U.currentUser)==null?void 0:s.email)||"";if(!t)return{ok:!1,skipped:!0};const a=await((i=U.currentUser)==null?void 0:i.getIdToken().catch(()=>""));return(await fetch("/api/sync-hubspot-candidate",{method:"POST",headers:{"Content-Type":"application/json",...a?{Authorization:`Bearer ${a}`}:{}},body:JSON.stringify({candidate:{...e,email:t}})})).json().catch(()=>({ok:!1}))}async function Ha(e,t){G();const a=t.name.replace(/[^a-z0-9._-]/gi,"-").toLowerCase(),n=`candidate-photos/${e}/${Date.now()}-${a}`,s=ft(Xe,n);await jt(s,t,{contentType:t.type||"application/octet-stream"});const i=await zt(s);return await W(F(L,T.users,e),{photoURL:i,updatedAt:j()},{merge:!0}),i}async function ht(e,t,a){G();let n=null,s=Ge(e);try{const p=await xe(F(L,T.users,e));if(p.exists()){const u=p.data();n=u.activeCvId||null,u.candidateCode&&(s=u.candidateCode)}}catch{}const i=t.name.replace(/[^a-z0-9._-]/gi,"-").toLowerCase(),l=`candidate-cvs/${e}/${Date.now()}-${i}`,r=ft(Xe,l);await jt(r,t,{contentType:t.type||"application/octet-stream"});const d=await zt(r),c={id:l,name:a||t.name,fileName:t.name,url:d,uploadedAt:new Date().toISOString()};return await W(F(L,T.users,e),{cvLibrary:vt(c),activeCvId:c.id,activeCvName:c.name||c.fileName,cvUrl:d,updatedAt:j()},{merge:!0}),W(F(L,T.candidates,s),{cvUrl:d,activeCvId:c.id,activeCvName:c.name||c.fileName,updatedAt:j()},{merge:!0}).catch(()=>null),n&&n!==l&&La(ft(Xe,n)).catch(()=>{}),c}function Va(e,t){if(G(),!e)return()=>{};const a=ce(se(L,T.notifications),de("recipientUid","==",e),ue(50));return xa(a,n=>{const s=n.docs.map(i=>({id:i.id,...i.data()})).sort((i,l)=>{var c,p;const r=(c=i.createdAt)!=null&&c.toDate?i.createdAt.toDate().getTime():new Date(i.createdAt||0).getTime();return((p=l.createdAt)!=null&&p.toDate?l.createdAt.toDate().getTime():new Date(l.createdAt||0).getTime())-r});t(s)})}async function Ga(e){G(),e&&await W(F(L,T.notifications,e),{read:!0,readAt:j()},{merge:!0})}async function Qa(e,t){G(),await W(F(L,T.notificationPreferences,e),{uid:e,app:"talent.nearwork.co",preferences:t,updatedAt:j()},{merge:!0})}async function kt(e){var t;if(!e)return null;try{const a=await new Promise((M,A)=>{const x=new FileReader;x.onload=()=>M(x.result.split(",")[1]),x.onerror=A,x.readAsDataURL(e)}),n=await((t=U.currentUser)==null?void 0:t.getIdToken().catch(()=>""))??"",s=await fetch("/api/parse-cv",{method:"POST",headers:{"Content-Type":"application/json",...n?{Authorization:`Bearer ${n}`}:{}},body:JSON.stringify({data:a,filename:e.name,mimeType:e.type||"application/octet-stream"})});if(!s.ok)return null;const i=await s.json();if(!(i!=null&&i.ok))return null;const{name:l,phone:r,city:d,summary:c,skills:p,workHistory:u,languages:v,certifications:h}=i;return{name:l,phone:r,city:d,summary:c,skills:p,workHistory:u,languages:v||[],certifications:h||[]}}catch{return null}}async function Ja(e){return ba(U,e)}let ne=null,Ne=!1,et=null,$t=1,P={},re=null,Ve=null,_=null,ze=!1,J=!1,oe=null;const st=document.querySelector("#app"),Wa="+573135928691",Ya="https://wa.me/573135928691",qe={"Customer Success":["Customer Success Manager","Customer Success Associate","Account Manager","Technical Account Manager","Client Success Specialist","Implementation Specialist","Onboarding Specialist","Renewals Manager"],Sales:["SDR / Sales Development Rep","BDR / Business Development Rep","Account Executive","Inside Sales Representative","Channel Sales Manager","Sales Operations Specialist","Revenue Operations Specialist","Sales Manager"],Support:["Technical Support Specialist","Customer Support Representative","Help Desk Technician","Escalations Specialist","Support Team Lead","QA Support Analyst"],Operations:["Operations Manager","Operations Analyst","Executive Assistant","Administrative Assistant","Virtual Assistant","Office Manager","Project Coordinator","Procurement Specialist","Logistics Coordinator","Recruiting Coordinator"],Marketing:["Marketing Ops / Content Specialist","Content Writer","SEO Specialist","Email Marketing Specialist","Lifecycle Marketing Specialist","Social Media Manager","Graphic Designer","Growth Marketing Specialist"],Engineering:["Software Developer (Full Stack)","Frontend Developer","Backend Developer","Mobile Developer","DevOps Engineer","No-Code Developer","Data Analyst","Data Engineer","QA Engineer","Product Manager"],Finance:["Bookkeeper","Accounting Assistant","Accounts Payable / Receivable Specialist","Financial Analyst","FP&A Analyst","Payroll Specialist","Tax Analyst"],"Human Resources":["HR Generalist","Recruiter / Talent Sourcer","People Operations Specialist","Payroll & Benefits Coordinator","Learning & Development Coordinator"],"Healthcare & Insurance":["Insurance Account Manager","Claims Specialist","Medical Billing Specialist","Healthcare Virtual Assistant","Patient Coordinator"],Other:["Other / Not Listed"]},Za={"CRM & Sales":["HubSpot","Salesforce","Pipedrive","Apollo","Outbound","Cold Email","Discovery Calls","CRM Hygiene"],"Customer Success":["SaaS","Customer Success","QBRs","Onboarding","Renewals","Expansion","Churn Reduction","Intercom","Zendesk"],Support:["Technical Support","Tickets","Troubleshooting","APIs","Bug Reproduction","Help Center","CSAT"],Operations:["Excel","Google Sheets","Reporting","Process Design","Project Management","Notion","Airtable","Zapier"],Marketing:["Content","SEO","Lifecycle","Email Marketing","HubSpot Marketing","Copywriting","Analytics"],Engineering:["JavaScript","React","Node.js","SQL","Python","REST APIs","QA","GitHub"],Language:["English B2","English C1","English C2","Spanish Native"]},Ka=["Account Management","Accounts Payable","Accounts Receivable","Adobe Creative Suite","Agile","AI Tools","Analytics","Appointment Setting","B2B Sales","B2C Sales","Billing","Bookkeeping","Business Analysis","Canva","Cash Collections","Chat Support","Cold Calling","Community Management","Compliance","Content Strategy","Contract Management","Customer Onboarding","Customer Retention","Customer Service","Data Analysis","Data Entry","Email Support","Excel / Google Sheets","Executive Assistance","Figma","Financial Reporting","Forecasting","Helpdesk","HR Operations","Inbound Calls","Insurance Support","Lead Generation","Live Chat","Logistics","Looker","Microsoft Office","NetSuite","Outbound Calls","Payroll","Performance Marketing","Power BI","Product Support","QuickBooks","Recruiting","Salesforce Administration","Sales Operations","Shopify","Slack","Social Media","SQL Reporting","Stripe","Tableau","Technical Writing","Ticket Quality","Training","Vendor Management","WordPress","Workday","Workforce Management","Zendesk Guide","Zoho"],Kt=[...new Set([...Object.values(Za).flat(),...Ka])].sort((e,t)=>e.localeCompare(t)),me={Amazonas:["El Encanto","La Chorrera","La Pedrera","La Victoria","Leticia","Miriti - Paraná","Puerto Alegría","Puerto Arica","Puerto Nariño","Puerto Santander","Tarapacá"],Antioquia:["Abejorral","Abriaquí","Alejandría","Amagá","Amalfi","Andes","Angelópolis","Angostura","Anorí","Anza","Apartadó","Arboletes","Argelia","Armenia","Barbosa","Bello","Belmira","Betania","Betulia","Briceño","Buriticá","Cáceres","Caicedo","Caldas","Campamento","Cañasgordas","Caracolí","Caramanta","Carepa","Carmen de Viboral","Carolina","Caucasia","Chigorodó","Cisneros","Ciudad Bolívar","Cocorná","Concepción","Concordia","Copacabana","Dabeiba","Don Matías","Ebéjico","El Bagre","Entrerríos","Envigado","Fredonia","Frontino","Giraldo","Girardota","Gómez Plata","Granada","Guadalupe","Guarne","Guatapé","Heliconia","Hispania","Itagüí","Ituango","Jardín","Jericó","La Ceja","La Estrella","La Pintada","La Unión","Liborina","Maceo","Marinilla","Medellín","Montebello","Murindó","Mutata","Nariño","Nechí","Necoclí","Olaya","Peñol","Peque","Pueblorrico","Puerto Berrío","Puerto Nare","Puerto Triunfo","Remedios","Retiro","Rionegro","Sabanalarga","Sabaneta","Salgar","San Andrés","San Carlos","San Francisco","San Jerónimo","San José de la Montaña","San Juan de Urabá","San Luis","San Pedro","San Pedro de Urabá","San Rafael","San Roque","San Vicente","Santa Bárbara","Santa Rosa de Osos","Santafé de Antioquia","Santo Domingo","Santuario","Segovia","Sonsón","Sopetrán","Támesis","Tarazá","Tarso","Titiribí","Toledo","Turbo","Uramita","Urrao","Valdivia","Valparaíso","Vegachí","Venecia","Vigía del Fuerte","Yalí","Yarumal","Yolombó","Yondó","Zaragoza"],Arauca:["Arauca","Arauquita","Cravo Norte","Fortul","Puerto Rondón","Saravena","Tame"],Atlántico:["Baranoa","Barranquilla","Campo de la Cruz","Candelaria","Galapa","Juan de Acosta","Luruaco","Malambo","Manatí","Palmar de Varela","Piojó","Polonuevo","Ponedera","Puerto Colombia","Repelón","Sabanagrande","Sabanalarga","Santa Lucía","Santo Tomás","Soledad","Suan","Tubara","Usiacurí"],"Bogotá D.C.":["Bogotá"],Bolívar:["Achí","Altos del Rosario","Arenal","Arjona","Arroyohondo","Barranco de Loba","Calamar","Cantagallo","Carmen de Bolívar","Cartagena","Cicuco","Clemencia","Córdoba","El Guamo","El Peñón","Hatillo de Loba","Magangué","Mahates","Margarita","María la Baja","Mompós","Montecristo","Morales","Pinillos","Regidor","Río Viejo","San Cristóbal","San Estanislao","San Fernando","San Jacinto","San Jacinto del Cauca","San Juan Nepomuceno","San Martín de Loba","San Pablo","Santa Catalina","Santa Rosa de Lima","Santa Rosa del Sur","Simití","Soplaviento","Talaigua Nuevo","Tiquisio","Turbaco","Turbana","Villanueva","Zambrano"],Boyacá:["Almeida","Aquitania","Arcabuco","Belén","Berbeo","Betéitiva","Boavita","Boyacá","Briceño","Buenavista","Busbanzá","Caldas","Campohermoso","Cerinza","Chinavita","Chiquinquirá","Chíquiza","Chiscas","Chita","Chitaraque","Chivatá","Chivor","Ciénega","Cómbita","Coper","Corrales","Covarachía","Cubará","Cucaita","Cuítiva","Duitama","El Cocuy","El Espino","Firavitoba","Floresta","Gachantivá","Gameza","Garagoa","Guacamayas","Guateque","Guayatá","Güicán","Iza","Jenesano","Jericó","La Capilla","La Uvita","La Victoria","Labranzagrande","Macanal","Maripí","Miraflores","Mongua","Monguí","Moniquirá","Motavita","Muzo","Nobsa","Nuevo Colón","Oicatá","Otanche","Pachavita","Páez","Paipa","Pajarito","Panqueba","Pauna","Paya","Paz de Río","Pesca","Pisba","Puerto Boyacá","Quípama","Ramiriquí","Ráquira","Rondón","Saboyá","Sáchica","Samacá","San Eduardo","San José de Pare","San Luis de Gaceno","San Mateo","San Miguel de Sema","San Pablo Borbur","Santa María","Santa Rosa de Viterbo","Santa Sofía","Santana","Sativanorte","Sativasur","Siachoque","Soatá","Socha","Socotá","Sogamoso","Somondoco","Sora","Soracá","Sotaquirá","Susacón","Sutamarchán","Sutatenza","Tasco","Tenza","Tibaná","Tibasosa","Tinjacá","Tipacoque","Toca","Togüí","Tópaga","Tota","Tunja","Tununguá","Turmequé","Tuta","Tutazá","Umbita","Ventaquemada","Villa de Leyva","Viracachá","Zetaquira"],Caldas:["Aguadas","Anserma","Aranzazu","Belalcázar","Chinchiná","Filadelfia","La Dorada","La Merced","Manizales","Manzanares","Marmato","Marquetalia","Marulanda","Neira","Norcasia","Pácora","Palestina","Pensilvania","Riosucio","Risaralda","Salamina","Samaná","San José","Supía","Victoria","Villamaría","Viterbo"],Caquetá:["Albania","Belén de los Andaquíes","Cartagena del Chairá","Currillo","El Doncello","El Paujil","Florencia","La Montañita","Milán","Morelia","Puerto Rico","San José del Fragua","San Vicente del Caguán","Solano","Solita","Valparaiso"],Casanare:["Aguazul","Chameza","Hato Corozal","La Salina","Maní","Monterrey","Nunchía","Orocué","Paz de Ariporo","Pore","Recetor","Sabanalarga","Sácama","San Luis de Palenque","Támara","Tauramena","Trinidad","Villanueva","Yopal"],Cauca:["Almaguer","Argelia","Balboa","Bolívar","Buenos Aires","Cajibío","Caldono","Caloto","Corinto","El Tambo","Florencia","Guapi","Inzá","Jambalo","La Sierra","La Vega","Lopez","Mercaderes","Miranda","Morales","Padilla","Paez","Patia","Piamonte","Piendamo","Popayán","Puerto Tejada","Purace","Rosas","San Sebastian","Santa Rosa","Santander de Quilichao","Silvia","Sotara","Suarez","Sucre","Timbio","Timbiqui","Toribio","Totoro","Villa Rica"],Cesar:["Aguachica","Agustín Codazzi","Astrea","Becerril","Bosconia","Chimichagua","Chiriguaná","Curumaní","El Copey","El Paso","Gamarra","González","La Gloria","La Jagua de Ibirico","La Paz","Manaure","Pailitas","Pelaya","Pueblo Bello","Río de Oro","San Alberto","San Diego","San Martín","Tamalameque","Valledupar"],Chocó:["Acandí","Alto Baudó","Atrato","Bagadó","Bahía Solano","Bajo Baudó","Belén de Bajirá","Bojayá","Cantón de San Pablo","Carmen del Darién","Cértegui","Condoto","El Carmen de Atrato","El Litoral del San Juan","Istmina","Juradó","Lloró","Medio Atrato","Medio Baudó","Medio San Juan","Nóvita","Nuquí","Quibdó","Río Iró","Río Quito","Riosucio","San José del Palmar","Sipí","Tadó","Unguía","Unión Panamericana"],Córdoba:["Ayapel","Buenavista","Canalete","Cereté","Chimá","Chinú","Ciénaga de Oro","Cotorra","La Apartada","Lorica","Los Córdobas","Momil","Moñitos","Montelíbano","Montería","Planeta Rica","Pueblo Nuevo","Puerto Escondido","Puerto Libertador","Purísima","Sahagún","San Andrés de Sotavento","San Antero","San Bernardo del Viento","San Carlos","San Pelayo","Tierralta","Valencia"],Cundinamarca:["Agua de Dios","Albán","Anapoima","Anolaima","Apulo","Arbeláez","Beltrán","Bituima","Bojacá","Cabrera","Cachipay","Cajicá","Caparrapí","Cáqueza","Carmen de Carupa","Chaguaní","Chía","Chipaque","Choachí","Chocontá","Cogua","Cota","Cucunubá","El Colegio","El Peñón","El Rosal","Facatativá","Fomeque","Fosca","Funza","Fúquene","Fusagasugá","Gachala","Gachancipá","Gachetá","Gama","Girardot","Granada","Guachetá","Guaduas","Guasca","Guataquí","Guatavita","Guayabal de Síquima","Guayabetal","Gutiérrez","Jerusalén","Junín","La Calera","La Mesa","La Palma","La Peña","La Vega","Lenguazaque","Macheta","Madrid","Manta","Medina","Mosquera","Nariño","Nemocón","Nilo","Nimaima","Nocaima","Pacho","Paime","Pandi","Paratebueno","Pasca","Puerto Salgar","Puli","Quebradanegra","Quetame","Quipile","Ricaurte","San Antonio de Tequendama","San Bernardo","San Cayetano","San Francisco","San Juan de Rioseco","Sasaima","Sesquilé","Sibaté","Silvania","Simijaca","Soacha","Sopó","Subachoque","Suesca","Supatá","Susa","Sutatausa","Tabio","Tausa","Tena","Tenjo","Tibacuy","Tibirita","Tocaima","Tocancipá","Topaipí","Ubalá","Ubaque","Ubaté","Une","Útica","Venecia","Vergara","Vianí","Villagómez","Villapinzón","Villeta","Viotá","Yacopí","Zipacón","Zipaquirá"],Guainía:["Barranco Minas","Cacahual","Inírida","La Guadalupe","Mapiripana","Morichal","Pana Pana","Puerto Colombia","San Felipe"],Guaviare:["Calamar","El Retorno","Miraflores","San José del Guaviare"],Huila:["Acevedo","Agrado","Aipe","Algeciras","Altamira","Baraya","Campoalegre","Colombia","Elías","Garzón","Gigante","Guadalupe","Hobo","Iquira","Isnos","La Argentina","La Plata","Nátaga","Neiva","Oporapa","Paicol","Palermo","Palestina","Pital","Pitalito","Rivera","Saladoblanco","San Agustín","Santa María","Suaza","Tarqui","Tello","Teruel","Tesalia","Timaná","Villavieja","Yaguará"],"La Guajira":["Albania","Barrancas","Dibulla","Distracción","El Molino","Fonseca","Hatonuevo","La Jagua del Pilar","Maicao","Manaure","Riohacha","San Juan del Cesar","Uribia","Urumita","Villanueva"],Magdalena:["Algarrobo","Aracataca","Ariguaní","Cerro San Antonio","Chibolo","Ciénaga","Concordia","El Banco","El Piñón","El Reten","Fundación","Guamal","Nueva Granada","Pedraza","Pijiño del Carmen","Pivijay","Plato","Pueblo Viejo","Remolino","Sabanas de San Ángel","Salamina","San Sebastián de Buenavista","San Zenón","Santa Ana","Santa Bárbara de Pinto","Santa Marta","Sitionuevo","Tenerife","Zapayán","Zona Bananera"],Meta:["Acacías","Barranca de Upía","Cabuyaro","Castilla la Nueva","Cumaral","El Calvario","El Castillo","El Dorado","Fuente de Oro","Granada","Guamal","La Macarena","La Uribe","Lejanías","Mapiripán","Mesetas","Puerto Concordia","Puerto Gaitán","Puerto Lleras","Puerto López","Puerto Rico","Restrepo","San Carlos Guaroa","San Juan de Arama","San Juanito","San Luis de Cubarral","San Martín","Villavicencio","Vista Hermosa"],Nariño:["Albán","Aldana","Ancuyá","Arboleda","Barbacoas","Belén","Buesaco","Chachagüí","Colón","Consacá","Contadero","Córdoba","Cuaspud","Cumbal","Cumbitara","El Charco","El Peñol","El Rosario","El Tablón de Gómez","El Tambo","Francisco Pizarro","Funes","Guachucal","Guaitarilla","Gualmatán","Iles","Imues","Ipiales","La Cruz","La Florida","La Llanada","La Tola","La Unión","Leiva","Linares","Los Andes","Magüí Payán","Mallama","Mosquera","Nariño","Olaya Herrera","Ospina","Pasto","Policarpa","Potosí","Providencia","Puerres","Pupiales","Ricaurte","Roberto Payán","Samaniego","San Bernardo","San Lorenzo","San Pablo","San Pedro de Cartago","Sandoná","Santa Bárbara","Santa Cruz","Sapuyes","Taminango","Tangua","Tumaco","Túquerres","Yacuanquer"],"Norte de Santander":["Abrego","Arboledas","Bochalema","Bucarasica","Cachirá","Cácota","Chinácota","Chitagá","Convención","Cúcuta","Cucutilla","Durania","El Carmen","El Tarra","El Zulia","Gramalote","Hacarí","Herrán","La Esperanza","La Playa","Labateca","Los Patios","Lourdes","Mutiscua","Ocaña","Pamplona","Pamplonita","Puerto Santander","Ragonvalia","Salazar","San Calixto","San Cayetano","Santiago","Sardinata","Silos","Teorama","Tibú","Toledo","Villa Caro","Villa del Rosario"],Putumayo:["Colón","Mocoa","Orito","Puerto Asís","Puerto Caicedo","Puerto Guzmán","Puerto Leguizamo","San Francisco","San Miguel","Santiago","Sibundoy","Valle del Guamuez","Villa Garzón"],Quindío:["Armenia","Buenavista","Calarcá","Circasia","Córdoba","Filandia","Génova","La Tebaida","Montenegro","Pijao","Quimbaya","Salento"],Risaralda:["Apía","Balboa","Belén de Umbría","Dosquebradas","Guática","La Celia","La Virginia","Marsella","Mistrató","Pereira","Pueblo Rico","Quinchía","Santa Rosa de Cabal","Santuario"],"San Andrés y Providencia":["Providencia y Santa Catalina","San Andrés"],Santander:["Aguada","Albania","Aratoca","Barbosa","Barichara","Barrancabermeja","Betulia","Bolívar","Bucaramanga","Cabrera","California","Capitanejo","Carcasí","Cepitá","Cerrito","Charalá","Charta","Chima","Chipatá","Cimitarra","Concepción","Confines","Contratación","Coromoro","Curití","El Carmen de Chucurí","El Guacamayo","El Peñón","El Playón","Encino","Enciso","Florián","Floridablanca","Galán","Gambita","Girón","Guaca","Guadalupe","Guapotá","Guavatá","Güepsa","Hato","Jesús María","Jordán","La Belleza","La Paz","Landázuri","Lebríja","Los Santos","Macaravita","Málaga","Matanza","Mogotes","Molagavita","Ocamonte","Oiba","Onzaga","Palmar","Palmas del Socorro","Páramo","Piedecuesta","Pinchote","Puente Nacional","Puerto Parra","Puerto Wilches","Rionegro","Sabana de Torres","San Andrés","San Benito","San Gil","San Joaquín","San José de Miranda","San Miguel","San Vicente de Chucurí","Santa Bárbara","Santa Helena del Opón","Simacota","Socorro","Suaita","Sucre","Surata","Tona","Valle de San José","Vélez","Vetas","Villanueva","Zapatoca"],Sucre:["Buenavista","Caimito","Chalán","Coloso","Corozal","Coveñas","El Roble","Galeras","Guaranda","La Unión","Los Palmitos","Majagual","Morroa","Ovejas","Palmito","Sampués","San Benito Abad","San Juan Betulia","San Marcos","San Onofre","San Pedro","Santiago de Tolú","Sincé","Sincelejo","Sucre","Tolú Viejo"],Tolima:["Alpujarra","Alvarado","Ambalema","Anzoátegui","Armero","Ataco","Cajamarca","Carmen de Apicalá","Casabianca","Chaparral","Coello","Coyaima","Cunday","Dolores","Espinal","Falan","Flandes","Fresno","Guamo","Herveo","Honda","Ibagué","Icononzo","Lérida","Líbano","Mariquita","Melgar","Murillo","Natagaima","Ortega","Palocabildo","Piedras","Planadas","Prado","Purificación","Rioblanco","Roncesvalles","Rovira","Saldaña","San Antonio","San Luis","Santa Isabel","Suárez","Valle de San Juan","Venadillo","Villahermosa","Villarrica"],"Valle del Cauca":["Alcalá","Andalucía","Ansermanuevo","Argelia","Bolívar","Buenaventura","Buga","Bugalagrande","Caicedonia","Cali","Calima","Candelaria","Cartago","Dagua","El Águila","El Cairo","El Cerrito","El Dovio","Florida","Ginebra","Guacarí","Jamundí","La Cumbre","La Unión","La Victoria","Obando","Palmira","Pradera","Restrepo","Riofrío","Roldanillo","San Pedro","Sevilla","Toro","Trujillo","Tuluá","Ulloa","Versalles","Vijes","Yotoco","Yumbo","Zarzal"],Vaupés:["Carurú","Mitú","Pacoa","Papunahua","Taraira","Yavaraté"],Vichada:["Cumaribo","La Primavera","Puerto Carreño","Santa Rosalía"]},Xa=[{title:"How to answer salary questions",tag:"Interview",read:"4 min",body:"Use a confident range, anchor it to the role, and avoid apologizing for earning in USD.",actions:["Know your floor","Use monthly USD","Mention flexibility last"]},{title:"Writing a CV for US SaaS companies",tag:"CV",read:"6 min",body:"Translate local experience into metrics US hiring managers can scan in under a minute.",actions:["Lead with outcomes","Add tools","Quantify scope"]},{title:"Before your recruiter screen",tag:"Process",read:"3 min",body:"Prepare availability, compensation, English comfort, and two strong role stories.",actions:["Check your setup","Review the opening","Bring questions"]},{title:"STAR stories that feel natural",tag:"Interview",read:"5 min",body:"Keep stories specific, concise, and tied to business impact instead of job duties.",actions:["Situation","Action","Result"]}],_t=[{key:"profile-review",label:"Profile Review",help:"We are checking role fit and your candidate profile."},{key:"background-check",label:"Background Checks",help:"Nearwork is verifying relevant background and work details."},{key:"assessment",label:"Assessment",help:"Complete role-specific questions when assigned."},{key:"interview",label:"Interview",help:"Meet the recruiter and book your next conversation."},{key:"presented",label:"Presented",help:"Your profile has been prepared for the company."},{key:"client-review",label:"Client Review",help:"The company is reviewing your profile and next steps."},{key:"hired",label:"Hired",help:"Offer accepted and onboarding is ready to begin."}],Xt=["Applied","Assessment","Interview","Final round","Offer"];let o={user:null,candidate:null,applications:[],assessments:[],notifications:[],notificationPanelOpen:!1,notificationSettingsOpen:!1,jobs:[],loading:!0,view:"login",activePage:"overview",matchesFiltered:!1,message:"",assessmentUiStep:null,showDeleteAccountModal:!1,deleteAccountStatus:null,deleteAccountError:"",showUnsavedChangesModal:!1,resetCodeStatus:null,resetCodeError:""},V=null;const dt=sessionStorage.getItem("nw_restore_path");dt&&(sessionStorage.removeItem("nw_restore_path"),window.history.replaceState({page:dt},"",dt));function ea(){return[["overview","layout-dashboard","Overview"],["matches","briefcase-business","Matches"],["applications","send","Applications"],["assessment","clipboard-check","Assessment"],["cvs","files","CV Picker"],["tips","book-open","Tips"],["recruiter","calendar-days","Recruiter"],["profile","user-round-cog","Profile"]]}function tt(){const t=window.location.pathname.split("/").filter(Boolean)[0];return t==="onboarding"?"onboarding":t==="assessment"||t==="assessments"?"assessment":ea().some(([a])=>a===t)?t:"overview"}function he(){const e=window.location.pathname.split("/").filter(Boolean);return(e[0]==="assessment"||e[0]==="assessments")&&e[1]||""}function ta(){const e=window.location.pathname.split("/").filter(Boolean),t=e.findIndex(n=>n==="q"||n==="question");if(t===-1)return null;const a=Number(e[t+1]);return Number.isFinite(a)&&a>0?a-1:null}function en(e,t=0){return`/assessment/${encodeURIComponent(e)}/start/q/${Number(t||0)+1}`}function Te(e,t=0,a=!1){const n=en(e,t);if(window.location.pathname===n)return;const s=a?"replaceState":"pushState";window.history[s]({page:"assessment",assessmentId:e,questionIndex:t},"",n)}function m(e,t){return`<i data-lucide="${e}" aria-label="${e}"></i>`}let ut=!1;function Ie(){if(window.lucide){window.lucide.createIcons();return}if(ut)return;ut=!0;const e=()=>{window.lucide?(window.lucide.createIcons(),ut=!1):setTimeout(e,50)};e()}function S(e){o={...o,...e},fa()}function Oe(e,t=!0){const n=e==="onboarding"||ea().some(([s])=>s===e)?e:"overview";o={...o,activePage:n,matchesFiltered:n==="matches"?o.matchesFiltered:!1,message:"",assessmentUiStep:null},t&&window.history.pushState({page:n},"",n==="overview"?"/":`/${n}`),fa()}function aa(){var t,a;return(((t=o.candidate)==null?void 0:t.name)||((a=o.user)==null?void 0:a.displayName)||"there").split(" ")[0]||"there"}function tn(){var t,a,n;return(((t=o.candidate)==null?void 0:t.name)||((a=o.user)==null?void 0:a.displayName)||((n=o.user)==null?void 0:n.email)||"NW").split(/[ @.]/).filter(Boolean).slice(0,2).map(s=>s[0]).join("").toUpperCase()}function na(e="normal"){var n,s;const t=((n=o.candidate)==null?void 0:n.photoURL)||((s=o.user)==null?void 0:s.photoURL)||"",a=e==="large"?"avatar avatar-large":"avatar";return t?`<img class="${a}" src="${w(t)}" alt="${w(aa())}" />`:`<div class="${a}">${tn()}</div>`}function w(e){return String(e||"").replaceAll("&","&amp;").replaceAll('"',"&quot;").replaceAll("<","&lt;").replaceAll(">","&gt;")}function E(e){return String(e||"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;")}function it(e){if(!e)return"Recently";const t=e.toDate?e.toDate():new Date(e);return new Intl.DateTimeFormat("en",{month:"short",day:"numeric"}).format(t)}function Qe(){var t;const e=((t=o.candidate)==null?void 0:t.skills)||[];return Array.isArray(e)?e:String(e).split(",").map(a=>a.trim()).filter(Boolean)}function Q(e){return String(e||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/&/g," and ").replace(/[^a-z0-9]+/g," ").trim().replace(/\s+/g," ")}function At(e,t=Qe()){const a=Se(e),n=new Set((a.skills||[]).map(Q).filter(Boolean)),s=new Map(t.map(i=>[Q(i),i]).filter(([i])=>i));return[...s.keys()].filter(i=>n.has(i)).map(i=>s.get(i))}function sa(e){return["Nearwork candidate","Talent member"].includes(String(e||"").trim())}function Rt(e){if(!e)return null;if(e.toDate)return e.toDate();if(typeof e=="object"&&typeof e.seconds=="number")return new Date(e.seconds*1e3);const t=new Date(e);return Number.isNaN(t.getTime())?null:t}function xt(e){return Number(e||1)===1?"Technical Assessment":"DISC Assessment"}function pt(e,t){var a,n,s;return((n=(a=e==null?void 0:e.answers)==null?void 0:a[t==null?void 0:t.id])==null?void 0:n.value)??((s=e==null?void 0:e.answers)==null?void 0:s[t==null?void 0:t.id])??""}function Me(e){return e!=null&&e!==""}function ie(e,t){return((e==null?void 0:e.questions)||[]).slice(0,70).filter(a=>Number(a.stage||1)===Number(t))}function yt(e,t,a=(e==null?void 0:e.answers)||{}){return ie(e,t).filter(n=>{var s;return!Me(((s=a[n.id])==null?void 0:s.value)??a[n.id])})}function an(){var e,t;return!!((o.applications||[]).length||(((e=o.candidate)==null?void 0:e.pipelineCodes)||[]).length||(t=o.candidate)!=null&&t.pipelineCode)}function nn(){var n,s,i;const e=((n=o.candidate)==null?void 0:n.department)||"Bogotá D.C.",t=me[e]||me["Bogotá D.C."]||["Bogotá"],a=((s=o.candidate)==null?void 0:s.city)||((i=o.candidate)==null?void 0:i.locationCity)||t[0];return{department:e,city:a,label:`${a}, ${e}`}}function sn(){var t,a,n;const e=((t=o.candidate)==null?void 0:t.targetRole)||((a=o.candidate)==null?void 0:a.headline)||"";return((n=Object.entries(qe).find(([,s])=>s.includes(e)))==null?void 0:n[0])||Object.keys(qe)[0]}function ia(e){return Object.keys(qe).map(t=>`<option value="${w(t)}" ${t===e?"selected":""}>${t}</option>`).join("")}function ot(e,t){const a=qe[e]||Object.values(qe).flat();return['<option value="">Choose the closest role</option>'].concat(a.map(n=>`<option value="${w(n)}" ${t===n?"selected":""}>${n}</option>`)).join("")}function Pe(e){const t=String(e||"").replace(/[,.\s]+$/,"").replace(/^[,.\s]+/,"").trim();if(!t||t.length<2)return"";const a=Kt.find(n=>Q(n)===Q(t));return a||t.split(/\s+/).map(n=>n.length<=3&&n===n.toUpperCase()?n:n.charAt(0).toUpperCase()+n.slice(1).toLowerCase()).join(" ")}function oa(e){const t=[...new Set((e||[]).map(Pe).filter(Boolean))],a=["Customer Service","Salesforce","HubSpot","Excel","Google Sheets","Technical Support","Outbound Calls","React","SQL","Payroll"];return`
    <div class="skill-search-shell" data-skill-search>
      <div class="selected-skills" id="selectedSkills">
        ${t.map(n=>`
          <span class="selected-skill" data-skill-chip="${w(n)}">
            ${E(n)}
            <button type="button" class="skill-remove" data-remove-skill="${w(n)}" aria-label="Remove ${w(n)}">×</button>
            <input type="hidden" name="skills" value="${w(n)}" />
          </span>
        `).join("")||'<span class="skill-empty">Selected skills will appear here.</span>'}
      </div>
      <div class="skill-search-box">
        <input id="skillSearchInput" type="search" autocomplete="off" placeholder="Type any skill — e.g. Salesforce, Excel, B2B sales, Canva…" />
        <button class="secondary-action" type="button" id="addTypedSkill">Add skill</button>
      </div>
      <div class="skill-suggestions" id="skillSuggestions">
        ${a.map(n=>`<button type="button" class="skill-suggestion" data-skill="${w(n)}">${E(n)}</button>`).join("")}
      </div>
      <p class="field-hint">Select between 5 and 20 skills that best describe your experience.</p>
    </div>
  `}function ra(e,t="USD"){const a=Number(String(e||"").replace(/[^\d.]/g,"")),n=String(t||"USD").toUpperCase()==="COP"?"COP":"USD";if(!Number.isFinite(a)||a<=0)return{salary:"",salaryUSD:null,salaryCurrency:n,salaryAmount:null};const s=Math.round(a),i=n==="COP"?"es-CO":"en-US";return{salary:`$${new Intl.NumberFormat(i).format(s)} ${n}/mo`,salaryUSD:n==="USD"?s:null,salaryCurrency:n,salaryAmount:s}}function la(e){return Number(String(e||"").replace(/[^\d.]/g,""))}function Ut(e,t="USD"){const a=la(e),n=String(t||"USD").toUpperCase()==="COP"?"COP":"USD";return n==="USD"&&a>=1e5?"COP":n}function wt(e,t="USD"){const a=la(e);return!Number.isFinite(a)||a<=0?"":new Intl.NumberFormat("en-US",{maximumFractionDigits:0}).format(Math.round(a))}function ca(e){return Array.isArray(e)?e:String(e||"").split(",").map(t=>t.trim()).filter(Boolean)}function Se(e){const t=ca(e.skills||e.requiredSkills);return{id:e.id||e.code,code:e.code||e.id,title:e.title||e.role||e.openingTitle||"Open role",orgName:e.orgName||e.company||e.clientName||"Nearwork client",location:e.location||"Remote",compensation:e.compensation||e.salary||e.rate||"Competitive",match:e.match||null,skills:t,description:e.description||e.about||"Nearwork is reviewing candidates for this role now."}}function $e(e){const t=(e==null?void 0:e.code)||"";return t.includes("operation-not-allowed")?"This sign-in method is not available yet.":t.includes("unauthorized-domain")?"This website still needs to be approved for sign-in.":t.includes("permission-denied")?"We could not save this yet. Please try again in a moment or contact Nearwork support.":t.includes("weak-password")?"Password must be at least 6 characters.":t.includes("invalid-credential")||t.includes("wrong-password")?"That email/password did not match.":t.includes("user-not-found")?"No account exists for that email yet.":t.includes("email-already-in-use")?"That email already has an account. Sign in instead.":"Something went wrong. Please try again or contact Nearwork support."}const We=[{initials:"CP",name:"Camila P.",role:"Product Designer",city:"Medellín",quote:"I doubled my income and kept living in Medellín. The whole process took 19 days from apply to signed offer."},{initials:"AR",name:"Andrés R.",role:"SDR",city:"Bogotá",quote:"I went from chasing local leads to running outbound for a US SaaS team — same desk, way better pay."},{initials:"LG",name:"Laura G.",role:"Customer Success Manager",city:"Cali",quote:"No recruiters ghosting me. One profile, real interviews, and an offer that actually matched the role."},{initials:"FT",name:"Felipe T.",role:"Sales Ops Analyst",city:"Bucaramanga",quote:"The matching was spot on. I only talked to teams that fit what I was looking for, and signed within a month."},{initials:"DV",name:"Daniela V.",role:"Account Executive",city:"Cartagena",quote:"Now I'm closing deals for a US company in USD, still based in Cartagena. Best career move I've made."}];let ye=null;function on(e){ye&&clearInterval(ye);const t=We[0];st.innerHTML=`
    <main class="app-shell">
      <section class="brand-panel">
        <div class="left-bg"></div>
        <div class="left-grid"></div>
        <div class="brand-top">
          <span class="wordmark">Near<span>work</span></span>
          <a class="back-home" href="https://nearwork.co">/ Back to home</a>
        </div>
        <div class="brand-copy">
          <h1>The bridge to your<br><span>next big leap.</span></h1>
          <p>A transparent journey from your current role to a world-class US career, paid in USD.</p>
        </div>
        <div class="journey">
          <div class="journey-step">
            <span class="journey-dot"></span>
            <p class="journey-step-label">Step 01</p>
            <h3>Apply once</h3>
            <p>Join 5,000+ Colombian pros. Your profile is your permanent ticket to high-growth US SaaS roles.</p>
          </div>
          <div class="journey-step">
            <span class="journey-dot"></span>
            <p class="journey-step-label">Step 02</p>
            <h3>21 Days to a US Company</h3>
            <p>Our matching engine skips the noise. In as little as 21 days you're interviewing — and signing — with a vetted US company, earning in USD.</p>
            <div class="journey-tags"><span>Sales Ops</span><span>SDR</span><span>CSM</span></div>
          </div>
          <div class="journey-step journey-result">
            <span class="journey-dot"></span>
            <div class="result-card">
              <div class="result-card-head">
                <p class="result-card-label">The result</p>
                <span class="result-card-badge">+60% avg increase</span>
              </div>
              <h3>The USD Offer</h3>
              <div class="result-card-image">
                <div class="offer-row offer-row--before">
                  <span class="offer-row-label">Bogotá market rate</span>
                  <div class="offer-row-track"><span class="offer-row-fill" style="width:58%"></span></div>
                  <span class="offer-row-value">$1,150</span>
                </div>
                <div class="offer-row offer-row--after">
                  <span class="offer-row-label">Nearwork USD offer</span>
                  <div class="offer-row-track"><span class="offer-row-fill" style="width:100%"></span></div>
                  <span class="offer-row-value">$1,850</span>
                </div>
              </div>
              <div class="result-person">
                <span class="mini-avatar">VM</span>
                <div><strong>Valentina M.</strong><small>Operations Lead, Bogotá</small></div>
              </div>
            </div>
          </div>
        </div>
        <div class="testimonial">
          ${m("quote")}
          <div class="testimonial-content">
            <p>"${t.quote}"</p>
            <div class="testimonial-person">
              <span class="mini-avatar">${t.initials}</span>
              <div><strong>${t.name}</strong><small>${t.role}, ${t.city}</small></div>
            </div>
          </div>
          <div class="testimonial-dots">
            ${We.map((n,s)=>`<span class="testimonial-dot${s===0?" is-active":""}"></span>`).join("")}
          </div>
        </div>
        <div class="stats-bar">
          <div><strong>60%</strong><small>Salary bump</small></div>
          <div><strong>21d</strong><small>To a US offer</small></div>
          <div><strong>USD</strong><small>Remote only</small></div>
        </div>
      </section>
      ${e}
    </main>
  `,Ie();let a=0;ye=setInterval(()=>{const n=document.querySelector(".testimonial");if(!n){clearInterval(ye),ye=null;return}const s=n.querySelector(".testimonial-content");s.classList.add("is-flipping"),setTimeout(()=>{a=(a+1)%We.length;const i=We[a],l=s.querySelector("p"),r=s.querySelector(".mini-avatar"),d=s.querySelector(".testimonial-person strong"),c=s.querySelector(".testimonial-person small");l&&(l.textContent=`"${i.quote}"`),r&&(r.textContent=i.initials),d&&(d.textContent=i.name),c&&(c.textContent=`${i.role}, ${i.city}`),n.querySelectorAll(".testimonial-dot").forEach((p,u)=>p.classList.toggle("is-active",u===a)),s.classList.remove("is-flipping")},320)},6e3)}function da(e="login"){var s;const t=e==="signup";ye&&clearInterval(ye),ye=null,st.innerHTML=`
    <main class="nw-login-grid">
      <!-- Story panel (left) -->
      <div class="nw-story-panel">
        <div class="nw-story-texture"></div>
        <div class="nw-story-glow"></div>
        <div class="nw-story-inner">
          <div class="nw-story-topbar">
            <div class="nw-wordmark-login">Near<span>work</span></div>
            <a class="nw-back-home" href="https://nearwork.co">${m("arrow-left")} NEARWORK.CO</a>
          </div>
          <div class="nw-story-body">
            <div class="nw-story-badge">
              <span class="nw-badge-dot"></span>
              <span>5,000+ Colombian pros placed</span>
            </div>
            <h1 class="nw-story-headline">The bridge to your<br><span>next big leap.</span></h1>
            <p class="nw-story-sub">A transparent journey from your current role to a world-class US career — paid in USD.</p>
            <div class="nw-journey">
              <div class="nw-journey-line"></div>
              <div class="nw-step">
                <div class="nw-step-node"><span></span></div>
                <div class="nw-step-body">
                  <div class="nw-step-num">STEP 01</div>
                  <div class="nw-step-title">Apply once</div>
                  <p class="nw-step-desc">One profile becomes your permanent ticket to high-growth US SaaS roles.</p>
                </div>
              </div>
              <div class="nw-step">
                <div class="nw-step-node"><span></span></div>
                <div class="nw-step-body">
                  <div class="nw-step-num">STEP 02</div>
                  <div class="nw-step-title">21 days to a US company</div>
                  <p class="nw-step-desc">Our matching engine skips the noise — interview and sign with a vetted US team, fast.</p>
                  <div class="nw-step-tags"><span>Customer Success</span><span>SDR</span><span>Ops</span></div>
                </div>
              </div>
              <div class="nw-step">
                <div class="nw-step-node"><span></span></div>
                <div class="nw-step-body">
                  <div class="nw-step-num">STEP 03</div>
                  <div class="nw-step-title">Earn in USD</div>
                  <p class="nw-step-desc">Work remotely from Colombia, paid on a US salary band with full transparency.</p>
                </div>
              </div>
            </div>
            <div class="nw-offer-card">
              <div class="nw-offer-head">
                <span class="nw-offer-label">THE USD OFFER</span>
                <span class="nw-offer-badge">+60% avg</span>
              </div>
              <div class="nw-offer-bars">
                <div class="nw-bar">
                  <div class="nw-bar-top">
                    <span class="nw-bar-lbl">Bogotá market rate</span>
                    <span class="nw-bar-val">$1,150</span>
                  </div>
                  <div class="nw-bar-track"><div class="nw-bar-fill" style="width:62%;background:rgba(255,255,255,0.30)"></div></div>
                </div>
                <div class="nw-bar">
                  <div class="nw-bar-top">
                    <span class="nw-bar-lbl">Nearwork USD offer</span>
                    <span class="nw-bar-val nw-bar-val--main">$1,850</span>
                  </div>
                  <div class="nw-bar-track"><div class="nw-bar-fill" style="width:100%;background:linear-gradient(90deg,#16A085,#AF7AC5)"></div></div>
                </div>
              </div>
              <div class="nw-offer-person">
                <div class="nw-offer-avatar">VM</div>
                <div>
                  <div class="nw-offer-name">Valentina M.</div>
                  <div class="nw-offer-role">Operations Lead · Bogotá</div>
                </div>
              </div>
            </div>
          </div>
          <div class="nw-story-foot">
            ${m("shield-check")} 100% free for candidates · Your data stays private
          </div>
        </div>
      </div>

      <!-- Sign-in side (right) -->
      <div class="nw-signin-side">
        <div class="nw-signin-card">
          <div class="nw-mobile-wm">Near<span>work</span></div>
          <div class="nw-cand-chip"><span class="nw-cand-dot"></span>For candidates</div>
          <h2 class="nw-signin-heading">${t?"Create your account.":"Welcome back."}</h2>
          ${o.message?`<div class="notice">${m("lock")} ${w(o.message)}</div>`:""}
          ${we?"":`<div class="notice">${m("triangle-alert")} Sign-in is still being set up.</div>`}
          <form id="authForm" class="nw-auth-fields">
            ${t?`
            <div class="nw-field-wrap">
              <label class="nw-field-label" for="nameInput">Full name</label>
              <div class="nw-field-inner">
                <input id="nameInput" class="nw-field-input" name="name" type="text" autocomplete="name" placeholder="Full name" required />
              </div>
            </div>`:""}
            <div class="nw-field-wrap">
              <label class="nw-field-label" for="emailInput">Email address</label>
              <div class="nw-field-inner">
                <input id="emailInput" class="nw-field-input" name="email" type="email" autocomplete="email" placeholder="you@example.com" required />
              </div>
            </div>
            <div class="nw-field-wrap">
              <div class="nw-field-label-row">
                <label class="nw-field-label" for="passwordInput">Password</label>
                ${t?"":'<button type="button" id="resetPassword" class="nw-forgot-link">Forgot?</button>'}
              </div>
              <div class="nw-field-inner">
                <input id="passwordInput" class="nw-field-input" name="password" type="password" autocomplete="${t?"new-password":"current-password"}" minlength="6" placeholder="••••••••" required />
                <button type="button" class="nw-pw-toggle" data-password-toggle aria-label="Show password">${m("eye")}</button>
              </div>
            </div>
            ${t?`
            <div id="consentBlock" style="margin:2px 0 4px;">
              <label style="display:flex;align-items:flex-start;gap:9px;cursor:pointer;font-size:13px;color:#2d2d2d;line-height:1.5;margin-bottom:3px;">
                <input type="checkbox" name="privacyConsent" id="privacyConsent" style="width:16px!important;height:16px!important;min-height:16px!important;min-width:16px!important;padding:0!important;border:1px solid #aaa!important;border-radius:3px!important;background:#fff!important;flex-shrink:0;margin-top:3px;accent-color:#16a085;cursor:pointer;">
                <span>I have read and agree to Nearwork's <a href="https://www.nearwork.co/privacy-policy" target="_blank" rel="noopener" style="color:#16a085;text-decoration:underline;">Privacy Policy</a>, <a href="https://www.nearwork.co/terms-of-service" target="_blank" rel="noopener" style="color:#16a085;text-decoration:underline;">Terms of Service</a> and <a href="https://www.nearwork.co/cookie-policy" target="_blank" rel="noopener" style="color:#16a085;text-decoration:underline;">Cookie Policy</a> *</span>
              </label>
              <p id="privacyConsentError" style="display:none;font-size:12px;color:#c0392b;margin:2px 0 6px 27px;">You must accept the Privacy Policy to continue</p>
              <label style="display:flex;align-items:flex-start;gap:9px;cursor:pointer;margin-top:10px;font-size:13px;color:#555;line-height:1.5;">
                <input type="checkbox" name="marketingConsent" id="marketingConsent" style="width:16px!important;height:16px!important;min-height:16px!important;min-width:16px!important;padding:0!important;border:1px solid #aaa!important;border-radius:3px!important;background:#fff!important;flex-shrink:0;margin-top:3px;accent-color:#16a085;cursor:pointer;">
                <span>I agree to receive future job opportunities and updates from Nearwork (optional)</span>
              </label>
            </div>`:""}
            <button class="nw-signin-btn" type="submit">
              ${t?`${m("user-plus")} Create account`:`Sign in ${m("arrow-right")}`}
            </button>
            <p id="formMessage" class="form-message" role="status"></p>
          </form>
          <div class="nw-card-foot">
            ${m("sparkles")}
            <button id="toggleMode" class="nw-create-link" type="button">${t?"Already have an account? Sign in":"New or invited by Nearwork? Create your profile"}</button>
          </div>
          <a class="nw-back-jobs" href="https://jobs.nearwork.co" target="_blank" rel="noreferrer">${m("arrow-left")} Back to job board</a>
        </div>
      </div>
    </main>
  `,Ie();const a=new URLSearchParams(window.location.search).get("email");if(a){const i=document.querySelector("#emailInput");i&&(i.value=a,i.dispatchEvent(new Event("input")));const l=document.querySelector("#passwordInput");l&&l.focus()}if(new URLSearchParams(window.location.search).get("from")==="jobs"&&o.message!=="Welcome from Jobs — log in to view your dashboard."){const i=document.querySelector("#formMessage");i&&(i.textContent="Welcome from Jobs — log in to view your dashboard.",i.classList.add("success"))}document.querySelector("#toggleMode").addEventListener("click",()=>da(t?"login":"signup")),document.querySelectorAll("[data-password-toggle]").forEach(i=>{i.addEventListener("click",()=>{const l=i.previousElementSibling,r=l.type==="password";l.type=r?"text":"password",i.innerHTML=m(r?"eye-off":"eye"),i.setAttribute("aria-label",r?"Hide password":"Show password"),Ie()})}),(s=document.querySelector("#resetPassword"))==null||s.addEventListener("click",async()=>{const i=document.querySelector("input[name='email']").value.trim().toLowerCase(),l=document.querySelector("#formMessage");if(!i){l.classList.remove("success"),l.textContent="Enter your email first, then request a reset link.";return}try{await za(i),l.classList.add("success"),l.textContent=`Reset link sent! Check ${i} — it should arrive within a minute.`}catch(r){l.classList.remove("success"),l.textContent=$e(r)}}),document.querySelector("#authForm").addEventListener("submit",async i=>{var u;i.preventDefault();const l=new FormData(i.currentTarget),r=document.querySelector("#formMessage"),d=String(l.get("email")).trim().toLowerCase();if(r.textContent="",t){const v=document.querySelector("#privacyConsent"),h=document.querySelector("#privacyConsentError");if(v&&!v.checked){h&&(h.style.display=""),r.textContent="Please accept the Privacy Policy to continue.";return}h&&(h.style.display="none")}const c=t?((u=document.querySelector("#marketingConsent"))==null?void 0:u.checked)===!0:!1,p=new Date().toISOString();try{if(t){const v=await Ca(U,d,l.get("password"));await ka(v.user,{displayName:l.get("name")}),sessionStorage.setItem("nw_new_account","1"),await Jt(v.user.uid,{name:l.get("name"),email:d,availability:"open",headline:"Nearwork candidate",onboarded:!1,source:"talent.nearwork.co",privacyConsent:!0,privacyConsentAt:p,marketingConsent:c,marketingConsentAt:c?p:null}),await Ta({name:l.get("name"),firstName:String(l.get("name")||"").trim().split(/\s+/)[0],email:d}).catch(h=>console.error("[NW] account email failed:",h==null?void 0:h.message))}else await $a(U,d,l.get("password"))}catch(v){r.textContent=$e(v)}})}function rn(){var n,s;const e=new URLSearchParams(window.location.search),t=e.get("token")||"",a=e.get("email")||"";on(`
    <section class="auth-panel">
      <div class="auth-top">
        <div class="right-brand">Near<span>work</span></div>
        <div class="candidate-chip">Candidate portal</div>
      </div>
      <div class="panel-heading">
        <h2>Set a new password.</h2>
        <p>${a?`Resetting password for <strong>${E(a)}</strong>. Choose a password you haven't used before.`:"Choose a new password you haven't used before."}</p>
      </div>
      ${t?o.resetCodeStatus==="success"?`
        <div class="notice">${m("check-circle-2")} Password updated! Sign in with your new password.</div>
        <button class="primary-action" type="button" id="backToLogin">Sign in</button>
      `:`
      <form id="resetForm" class="stacked-form">
        <div class="field-group">
          <label class="field-label" for="newPassword">New password</label>
          <div class="password-field">
            <input id="newPassword" name="newPassword" type="password" autocomplete="new-password" minlength="6" placeholder="••••••••" required />
            <button type="button" class="password-toggle" data-password-toggle aria-label="Show password">${m("eye")}</button>
          </div>
        </div>
        <div class="field-group">
          <label class="field-label" for="confirmPassword">Confirm password</label>
          <div class="password-field">
            <input id="confirmPassword" name="confirmPassword" type="password" autocomplete="new-password" minlength="6" placeholder="••••••••" required />
            <button type="button" class="password-toggle" data-password-toggle aria-label="Show confirm">${m("eye")}</button>
          </div>
        </div>
        ${o.resetCodeStatus==="error"?`<div class="notice">${m("triangle-alert")} ${E(o.resetCodeError||"Something went wrong. Please request a new link.")}</div>`:""}
        <button class="primary-action" type="submit" ${o.resetCodeStatus==="resetting"?"disabled":""}>
          ${o.resetCodeStatus==="resetting"?"Updating…":`${m("lock")} Set new password`}
        </button>
        <p id="formMessage" class="form-message" role="status"></p>
      </form>
      <button id="backToLogin" class="text-action" type="button">Back to sign in</button>
      `:`
        <div class="notice">${m("triangle-alert")} This link is invalid or has already been used. Request a new one below.</div>
        <button class="primary-action" type="button" id="backToLogin">Back to sign in</button>
      `}
      <p class="auth-footer">© ${new Date().getFullYear()} Nearwork Inc. All rights reserved.</p>
    </section>
  `),document.querySelectorAll("[data-password-toggle]").forEach(i=>{i.addEventListener("click",()=>{const l=i.previousElementSibling,r=l.type==="password";l.type=r?"text":"password",i.innerHTML=m(r?"eye-off":"eye"),i.setAttribute("aria-label",r?"Hide password":"Show password"),Ie()})}),(n=document.querySelector("#backToLogin"))==null||n.addEventListener("click",()=>{const i=o.resetCodeStatus==="success"?"Your password has been reset. Sign in with your new password.":"";window.history.pushState({},"","/"),S({view:"login",message:i,resetCodeStatus:null,resetCodeError:""})}),(s=document.querySelector("#resetForm"))==null||s.addEventListener("submit",async i=>{i.preventDefault();const l=document.querySelector("#newPassword").value,r=document.querySelector("#confirmPassword").value;if(l!==r){S({resetCodeStatus:"error",resetCodeError:"Passwords do not match."});return}if(l.length<6){S({resetCodeStatus:"error",resetCodeError:"Password must be at least 6 characters."});return}S({resetCodeStatus:"resetting"});try{const d=await fetch("/api/confirm-reset",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({token:t,newPassword:l})}),c=await d.json().catch(()=>({}));if(!d.ok||!c.ok)throw new Error(c.error||"Something went wrong. Please request a new link.");S({resetCodeStatus:"success"})}catch(d){const c=(d==null?void 0:d.message)||"This link has expired or already been used. Please request a new one.";S({resetCodeStatus:"error",resetCodeError:c})}})}async function Bt(e){var t,a,n;S({loading:!0,user:e});try{const[s,i,l]=await Promise.allSettled([qa(e),Da(e.uid),Yt()]);let r=s.status==="fulfilled"?s.value:null;if(!r){const k=s.status==="rejected"?(t=s.reason)==null?void 0:t.message:"document not found";console.error("[NW] profile load:",k,"uid:",e.uid,"email:",e.email),new URLSearchParams(window.location.search).get("debug")==="1"&&alert("Profile debug — uid: "+e.uid+`
Status: `+s.status+`
Reason: `+k)}const d=i.status==="fulfilled"?i.value:[],c=l.status==="fulfilled"?l.value:[];let p=[];try{p=await _a(e.uid,e.email,(r==null?void 0:r.candidateCode)||(r==null?void 0:r.code)||"")}catch(k){console.warn(k)}const u=he();if(u&&!p.some(k=>k.id===u)){const k=await Ra(u,e.uid,e.email,(r==null?void 0:r.candidateCode)||(r==null?void 0:r.code)||"").catch(()=>null);k&&(p=[k,...p])}const v=sessionStorage.getItem("nw_new_account")==="1";v&&sessionStorage.removeItem("nw_new_account");const h=!!(r!=null&&r.targetRole||!sa(r==null?void 0:r.headline)&&(r!=null&&r.headline)),M=new URLSearchParams(window.location.search).get("from")==="jobs",A=!!(r!=null&&r.cvUrl||(a=r==null?void 0:r.applications)!=null&&a.length||((n=r==null?void 0:r.skills)==null?void 0:n.length)>=3),x=(r==null?void 0:r.onboarded)||h||A||M;!(r!=null&&r.onboarded)&&x&&(r!=null&&r.candidateCode)&&Ct(e.uid,{onboarded:!0,candidateCode:r.candidateCode}).catch(()=>null);const $=v&&!x?"onboarding":x?tt():"onboarding";S({candidate:{...r||{},name:(r==null?void 0:r.name)||e.displayName||"Talent member",email:(r==null?void 0:r.email)||e.email,availability:(r==null?void 0:r.availability)||"open",headline:(r==null?void 0:r.headline)||(r==null?void 0:r.targetRole)||"Nearwork candidate"},applications:d,assessments:p,jobs:c.map(Se),loading:!1,view:"dashboard",activePage:$,message:""}),fetch("/api/intercom-token",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({userId:e.uid,email:e.email})}).then(k=>k.ok?k.json():null).then(k=>{k!=null&&k.token&&window.Intercom&&window.Intercom("boot",{api_base:"https://api-iam.intercom.io",app_id:"pelltlav",intercom_user_jwt:k.token,user_id:e.uid,name:(r==null?void 0:r.name)||e.displayName||"",email:e.email,session_duration:864e5})}).catch(()=>{}),V&&V(),we&&(V=Va(e.uid,k=>{o.notifications=k,o.view==="dashboard"&&!o.message&&ua()}))}catch(s){console.warn(s),S({candidate:{name:e.displayName||"Talent member",email:e.email,availability:"open",headline:"Nearwork candidate"},applications:[],assessments:[],jobs:[],loading:!1,view:"dashboard",activePage:tt(),message:""})}}async function je(){if(window.location.pathname==="/reset-password"){V&&V(),V=null,S({user:null,candidate:null,loading:!1,view:"reset-password",resetCodeStatus:null});return}const e=tt();if(e==="assessment"){sessionStorage.setItem("nw_restore_path",window.location.pathname),S({user:null,candidate:null,applications:[],assessments:[],jobs:[],loading:!1,view:"login",activePage:"overview",message:"Please log in to open your assessment."});return}if(e==="overview"){V&&V(),V=null,S({user:null,candidate:null,loading:!1,view:"login",activePage:"overview"});return}let t=[];try{const a=await Yt();a.length&&(t=a.map(Se))}catch(a){console.warn(a)}S({user:null,candidate:null,applications:[],assessments:[],jobs:t,loading:!1,view:"login",activePage:"overview",message:"Please log in to view your profile, matched openings, applications, and assessments."})}function ln(){return[{label:"My journey",items:[["overview","layout-dashboard","Overview"],["applications","send","Applications"],["assessment","clipboard-check","Assessment"]]},{label:"My search",items:[["matches","briefcase-business","Matches"],["cvs","files","CV Picker"]]},{label:"Support",items:[["tips","book-open","Tips"],["recruiter","calendar-days","Recruiter"],["profile","user-round-cog","Profile"]]}]}function cn(){var e;return{open:"Open to roles",interviewing:"Interviewing",paused:"Not looking"}[((e=o.candidate)==null?void 0:e.availability)||"open"]||"Open to roles"}function Pt(){const e=o.candidate||{},t=Qe();return[{id:"name",label:"Full name",done:!!e.name},{id:"role",label:"Target role",done:!!(e.targetRole||!sa(e.headline)&&e.headline)},{id:"location",label:"City",done:!!e.city},{id:"salary",label:"Salary",done:!!(e.salaryAmount||e.salary)},{id:"english",label:"English",done:!!e.english},{id:"whatsapp",label:"WhatsApp",done:!!(e.whatsapp||e.phone)},{id:"skills",label:"Skills (5-20)",done:t.length>=5},{id:"cv",label:"CV",done:!!e.cvUrl}]}function ua(){var l,r,d,c,p;const e=(o.notifications||[]).filter(u=>!u.read).length,t=((l=o.candidate)==null?void 0:l.availability)||"open",n={open:"#10A07C",interviewing:"#EAB308",paused:"#9AA0A6"}[t]||"#10A07C",s=((r=o.candidate)==null?void 0:r.name)||((d=o.user)==null?void 0:d.displayName)||"Talent member",i=((c=o.candidate)==null?void 0:c.headline)||((p=o.candidate)==null?void 0:p.targetRole)||"Nearwork candidate";st.innerHTML=`
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

        <!-- Nav sections -->
        <nav class="nw-sidebar-nav">
          ${ln().map(u=>`
            <div class="nw-nav-group">
              <div class="nw-nav-group-label">${u.label}</div>
              ${u.items.map(([v,h,M])=>`
                <button class="nw-nav-item${o.activePage===v?" active":""}" data-page="${v}" type="button">
                  ${m(h)} ${M}
                </button>
              `).join("")}
            </div>
          `).join("")}
          <div class="nw-nav-group">
            <a class="nw-nav-item nw-nav-external" href="https://jobs.nearwork.co" target="_blank" rel="noreferrer">
              ${m("external-link")} Browse jobs
            </a>
          </div>
        </nav>

        <!-- Profile card -->
        <div class="nw-sidebar-profile">
          ${na()}
          <div class="nw-sidebar-profile-text">
            <div class="nw-sidebar-profile-name">${E(s)}</div>
            <div class="nw-sidebar-profile-role">${E(i)}</div>
          </div>
        </div>

        <!-- Sign out -->
        <button id="${o.user?"signOut":"signIn"}" class="nw-sidebar-signout" type="button">
          ${m(o.user?"log-out":"log-in")} ${o.user?"Sign out":"Sign in"}
        </button>
      </aside>

      <!-- ── Mobile bottom nav ── -->
      <nav class="nw-mobile-nav">
        <button class="nw-mob-tab${o.activePage==="overview"?" active":""}" data-page="overview" type="button">${m("layout-dashboard")}<span>Home</span></button>
        <button class="nw-mob-tab${o.activePage==="applications"?" active":""}" data-page="applications" type="button">${m("send")}<span>Applied</span></button>
        <button class="nw-mob-tab${o.activePage==="matches"?" active":""}" data-page="matches" type="button">${m("briefcase-business")}<span>Jobs</span></button>
        <button class="nw-mob-tab${o.activePage==="profile"?" active":""}" data-page="profile" type="button">${m("user-round-cog")}<span>Profile</span></button>
        <button id="mobileSignOut" class="nw-mob-tab" type="button">${m("log-out")}<span>Out</span></button>
      </nav>

      <!-- ── Main workspace ── -->
      <section class="nw-workspace">

        <!-- Top bar -->
        <div class="nw-topbar">
          <div class="nw-topbar-search">
            ${m("search")}
            <input class="nw-search-input" placeholder="Search roles, companies, skills…" tabindex="-1" />
          </div>
          <div class="nw-topbar-right">
            <!-- Availability pill (wraps the real select for functionality) -->
            <div class="nw-avail-pill">
              <span class="nw-avail-dot" style="background:${n};box-shadow:0 0 0 3px ${n}26;"></span>
              <span class="nw-avail-label">${cn()}</span>
              ${m("chevron-down")}
              <select id="availability" class="nw-avail-select" aria-label="Availability">
                <option value="open"         ${t==="open"?"selected":""}>Open to roles</option>
                <option value="interviewing" ${t==="interviewing"?"selected":""}>Interviewing</option>
                <option value="paused"       ${t==="paused"?"selected":""}>Not looking</option>
              </select>
            </div>

            <!-- Notifications -->
            <div class="nw-notif-wrap">
              <button class="nw-icon-btn" type="button" id="notificationBell" aria-label="Notifications">
                ${m("bell")}
                ${e?'<span class="nw-notif-badge"></span>':""}
              </button>
              ${o.notificationPanelOpen?un():""}
            </div>
            <button class="nw-icon-btn" type="button" id="notificationSettings" aria-label="Settings">
              ${m("settings")}
            </button>
          </div>
        </div>

        <!-- Notification settings -->
        ${o.notificationSettingsOpen?pn():""}

        <!-- Page content -->
        ${o.message?`<div class="notice" style="margin:0 36px;">${o.message}</div>`:""}
        <div class="nw-page-content">
          ${(()=>{try{return vn()}catch(u){return console.error("renderActivePage error:",u),'<div class="notice">Page failed to render. <button type="button" data-page="overview">Go to overview</button></div>'}})()}
        </div>
      </section>
    </main>
  `,Ie(),Kn(),gn(),mn()}function dn(e){return(e!=null&&e.toDate?e.toDate():new Date(e||Date.now())).toLocaleString("en-US",{month:"short",day:"numeric",year:"numeric",hour:"numeric",minute:"2-digit"})}function un(){const e=(o.notifications||[]).slice(0,10);return`
    <div class="notification-panel">
      <div class="notification-panel-head"><strong>Notifications</strong><span>${e.length?"Latest updates":"All clear"}</span></div>
      ${e.length?e.map(t=>`
        <button class="notification-item ${t.read?"":"unread"}" type="button" data-notification-read="${t.id}">
          <strong>${w(t.title||"Nearwork update")}</strong>
          <span>${w(t.message||"")}</span>
          <time>${dn(t.createdAt)}</time>
        </button>
      `).join(""):'<div class="notification-empty">No notifications yet.</div>'}
    </div>
  `}function pn(){var a;const e=((a=o.candidate)==null?void 0:a.notificationPreferences)||{};return`
    <section class="notification-settings-card">
      <div class="section-heading"><div><p class="eyebrow">Settings</p><h2>Notification preferences</h2></div></div>
      <div class="notification-settings-grid">
        ${[["recruitmentUpdates","Recruitment updates"],["assessmentUpdates","Assessment updates"],["mentions","Mentions"],["openingMovement","Opening movement"],["jobAlerts","Similar role alerts"]].map(([n,s])=>{const i=e[n]||{};return`<div class="notification-setting-row">
            <strong>${s}</strong>
            <label><input type="checkbox" data-notification-pref="${n}" data-channel="app" ${i.app!==!1?"checked":""}> In-app</label>
            <label><input type="checkbox" data-notification-pref="${n}" data-channel="email" ${i.email!==!1?"checked":""}> Email</label>
          </div>`}).join("")}
      </div>
      <p class="field-hint">Email notifications are grouped with a 2-hour buffer. The bell always keeps the detailed history with date and time.</p>
    </section>
  `}let Ye=null;function mn(){Ye&&window.clearInterval(Ye);const e=document.querySelector("#assessmentTimer");if(!e)return;const t=new Date(e.dataset.end||"").getTime(),a=()=>{const n=Math.max(0,t-Date.now()),s=Math.floor(n/1e3),i=Math.floor(s/60),l=String(s%60).padStart(2,"0");e.textContent=`${i}:${l}`,e.classList.toggle("is-low",n<=10*60*1e3),n<=0&&window.clearInterval(Ye)};a(),Ye=window.setInterval(a,1e3)}function gn(){if(o.activePage!=="assessment")return;const e=o.assessments||[],t=he(),n=(t?e.find(i=>i.id===t):null)||e.find(i=>["sent","started"].includes(String(i.status||"").toLowerCase()));if(!(n!=null&&n.id))return;const s=String(n.status||"").toLowerCase();if(s==="started"&&ta()===null){Te(n.id,Number(n.currentQuestionIndex||0),!0);return}if(!t&&s==="sent"){const i=`/assessment/${encodeURIComponent(n.id)}/start`;window.history.replaceState({page:"assessment",assessmentId:n.id},"",i)}}function vn(){return({onboarding:fn,overview:Ft,matches:Cn,applications:kn,assessment:$n,cvs:Rn,tips:Un,recruiter:Bn,profile:Fn}[o.activePage]||Ft)()}function Ft(){var A,x;const e=pa(),t=Pt(),a=t.filter($=>$.done).length,n=t.length,s=o.applications||[],i=s.filter($=>["action-needed","interview-scheduled","assessment-sent"].includes(String($.status||"").toLowerCase())).length,l=(o.jobs||[]).slice(0,3),r=((A=o.candidate)==null?void 0:A.recruiter)||{},d=2*Math.PI*52,c=d*(1-e/100),u=new Date().toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"}),v=($,k,R,z,B)=>`
    <div class="nw-stat-tile">
      <div class="nw-stat-tile-top">
        <span class="nw-stat-tile-label">${$}</span>
        <div class="nw-stat-icon" style="background:${z}14;">
          ${m(B)}
        </div>
      </div>
      <div class="nw-stat-value">${k}</div>
      <div class="nw-stat-sub">${R}</div>
    </div>`,h=($,k)=>{const R=String($.stage||$.status||"applied").toLowerCase(),z=R.includes("offer")?4:R.includes("final")?3:R.includes("interview")?2:R.includes("assessment")?1:0,B=$.clientName||$.company||"Nearwork client",q=B.split(/\s+/).slice(0,2).map(f=>f[0]).join("").toUpperCase(),Z=["#10A07C","#EC4E7E","#3B82F6","#F4A52E","#8B5CF6"],Y=Z[B.length%Z.length];return`
      <div class="nw-app-row${k?" last":""}">
        <div class="nw-app-avatar" style="background:${Y};">${q}</div>
        <div class="nw-app-info">
          <div class="nw-app-title">${E($.jobTitle||$.title||"Application")} <span class="nw-app-company">· ${E(B)}</span></div>
          <div class="nw-app-stages">
            ${Xt.map((f,g)=>`<div class="nw-stage-pip${g<=z?" done":""}"></div>`).join("")}
            <span class="nw-app-stage-label">${$.stage||$.status||"Applied"}</span>
          </div>
        </div>
        <div class="nw-app-meta">
          <span class="nw-app-status${i?" action":""}">${$.status||"In review"}</span>
          <div class="nw-app-date">${it($.updatedAt||$.createdAt)}</div>
        </div>
        ${m("chevron-right")}
      </div>`},M=$=>{const k=Se($),R=At(k),z=k.match||(R.length>=3?Math.min(97,70+R.length*4):null),B=["#10A07C","#EC4E7E","#3B82F6","#F4A52E"],q=B[k.orgName.length%B.length],Z=k.orgName.split(/\s+/).slice(0,2).map(Y=>Y[0]).join("").toUpperCase();return`${encodeURIComponent(k.code)}`,`
      <div class="nw-match-card">
        <div class="nw-match-card-top">
          <div class="nw-match-avatar" style="background:${q};">${Z}</div>
          ${z?`<div class="nw-match-score">${z}%</div>`:""}
        </div>
        <div class="nw-match-role">${E(k.title)}</div>
        <div class="nw-match-company">${E(k.orgName)} · ${E(k.location)}</div>
        ${R.length?`<div class="nw-match-why">${R.slice(0,3).map(E).join(" · ")} match</div>`:`<div class="nw-match-why">${E(k.description).slice(0,80)}…</div>`}
        <div class="nw-match-footer">
          <span class="nw-match-salary">${E(k.compensation)}</span>
          <button type="button" class="nw-match-apply" data-apply="${w(k.code)}">Apply ${m("arrow-right")}</button>
        </div>
      </div>`};return`
    <!-- Greeting -->
    <div class="nw-overview-header">
      <div class="nw-overview-date">Overview · ${u}</div>
      <h1 class="nw-overview-greeting">
        Hi ${E(aa())},
        ${i>0?`<span class="nw-greeting-muted">you have</span> <span class="nw-greeting-accent">${i} thing${i>1?"s":""}</span> <span class="nw-greeting-muted">that need you.</span>`:`<span class="nw-greeting-muted">let's get you matched.</span>`}
      </h1>
    </div>

    <!-- Readiness card -->
    ${a>=n?"":`
    <div class="nw-readiness-card">
      <div class="nw-readiness-donut">
        <svg viewBox="0 0 120 120" style="width:100%;height:100%;transform:rotate(-90deg);">
          <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,0.25)" stroke-width="8"/>
          <circle cx="60" cy="60" r="52" fill="none" stroke="#FFFFFF" stroke-width="8"
            stroke-dasharray="${d.toFixed(1)}" stroke-dashoffset="${c.toFixed(1)}"
            stroke-linecap="round"/>
        </svg>
        <div class="nw-readiness-pct">
          <span class="nw-readiness-num">${e}<span class="nw-readiness-pct-sign">%</span></span>
          <span class="nw-readiness-ready">ready</span>
        </div>
      </div>
      <div class="nw-readiness-body">
        <div class="nw-readiness-overline">Profile readiness</div>
        <h2 class="nw-readiness-title">${n-a} more step${n-a>1?"s":""} and Nearwork can boost your matches.</h2>
        <div class="nw-readiness-checklist">
          ${t.map($=>`
            <div class="nw-check-pill${$.done?" done":""}">
              ${m($.done?"check":"circle")} ${$.label}
            </div>`).join("")}
        </div>
        <div class="nw-readiness-actions">
          <button class="nw-finish-btn" type="button" data-page="profile">
            Finish profile ${m("arrow-right")}
          </button>
          <span class="nw-readiness-count">${a} of ${n} complete</span>
        </div>
      </div>
    </div>`}

    <!-- Stat tiles -->
    <div class="nw-stat-grid">
      ${v("Open matches",o.jobs.length,o.jobs.length?`${o.jobs.length} role${o.jobs.length>1?"s":""} waiting`:"Complete profile to unlock","#10A07C","sparkles")}
      ${v("Applications",s.length,s.length?`${i||"0"} need your input`:"Not applied yet","#EC4E7E","send")}
      ${v("Interviews",s.filter($=>String($.stage||$.status||"").toLowerCase().includes("interview")).length,"Scheduled","Not yet scheduled","#F4A52E")}
      ${v("CVs saved",(((x=o.candidate)==null?void 0:x.cvLibrary)||[]).length,"In your library","Upload your first CV","#3B82F6")}
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
          ${s.length?`<button class="nw-ghost-btn" type="button" data-page="applications">All applications ${m("arrow-right")}</button>`:""}
        </div>
        ${s.length?s.slice(0,4).map(($,k)=>h($,k===Math.min(s.length,4)-1)).join(""):`<div class="nw-empty">
              ${m("briefcase")}
              <strong>No active pipeline yet</strong>
              <p>Browse openings and apply — we'll show your pipeline here once an application moves forward.</p>
              <div style="display:flex;gap:8px;margin-top:12px;">
                <button class="nw-btn-primary" type="button" data-page="matches">${m("sparkles")} View matches</button>
                <a class="nw-btn-secondary" href="https://jobs.nearwork.co" target="_blank" rel="noreferrer">${m("external-link")} Open jobs</a>
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
            ${m("bell")}
            <strong>Nothing yet</strong>
            <p>Movement on your search lands here.</p>
          </div>
        </section>

        <!-- Recruiter card (dark) -->
        <section class="nw-recruiter-dark">
          <div class="nw-recruiter-overline">Your talent partner</div>
          <div class="nw-recruiter-row">
            <div class="nw-recruiter-avatar">${r.initials||"NW"}</div>
            <div>
              <div class="nw-recruiter-name">${E(r.name||"Nearwork Support")}</div>
              <div class="nw-recruiter-role">${E(r.role||"Talent Partner")}</div>
            </div>
          </div>
          <p class="nw-recruiter-bio">I'll review every match and prep you before each interview. Reach out anytime.</p>
          <div class="nw-recruiter-btns">
            <a class="nw-recruiter-msg" href="mailto:${w(r.email||"support@nearwork.co")}">${m("message-square-text")} Message</a>
            <a class="nw-recruiter-call" href="https://wa.me/${encodeURIComponent((r.whatsapp||"+1").replace(/\D/g,""))}" target="_blank" rel="noreferrer">${m("calendar-plus")} WhatsApp</a>
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
          <button class="nw-ghost-btn" type="button" data-page="matches">See all ${m("arrow-right")}</button>
        </div>
        <div class="nw-match-grid">
          ${l.map($=>M($)).join("")}
        </div>
      </section>
    `:""}
  `}function fn(){if(!ze){ze=!0,$t=1;const e=o.candidate||{},t=String(e.name||"").trim().split(/\s+/).filter(Boolean);P={roleGroup:e.roleGroup||"",targetRole:e.targetRole||"",department:e.department||e.locationDepartment||"",city:e.city||e.locationCity||"",english:e.english||"",firstName:e.firstName||t[0]||"",lastName:e.lastName||t.slice(1).join(" ")||"",phone:e.phone||e.whatsapp||"",currentRole:e.currentRole||"",expectedSalaryUSD:e.expectedSalaryUSD||(e.salaryCurrency!=="COP"?e.salaryAmount:null)||"",expectedSalaryCOP:e.expectedSalaryCOP||(e.salaryCurrency==="COP"?e.salaryAmount:null)||"",linkedin:e.linkedin||"",experience:Array.isArray(e.workHistory)?e.workHistory.map(a=>({...a})):[],languages:Array.isArray(e.languages)?[...e.languages]:[],skills:Array.isArray(e.skills)?[...e.skills]:[],certifications:Array.isArray(e.certifications)?e.certifications.map(a=>({...a})):[]},re=null,Ve=null,_=null}return'<div id="onboardingWizard" class="onb-shell"></div>'}function hn(){document.querySelector("#onboardingWizard")&&He($t)}function He(e){$t=e;const t=document.querySelector("#onboardingWizard");t&&(t.innerHTML=yn(e),bn(e))}function mt(e){return`
    <div style="display:flex;align-items:center;gap:5px;margin-bottom:28px;">
      ${Array.from({length:3},(a,n)=>`
        <div style="height:5px;border-radius:3px;flex:${n<e?2:1};background:${n<e?"var(--green)":"var(--border)"};transition:all .3s;"></div>
      `).join("")}
      <span style="margin-left:6px;font-size:11px;font-weight:600;color:var(--light);white-space:nowrap;">${e<=3?`${e} / 3`:"Review"}</span>
    </div>`}function te(e,t,a){return`<label style="display:flex;flex-direction:column;gap:5px;font-size:11px;font-weight:600;letter-spacing:.07em;text-transform:uppercase;color:var(--light);">${e}${t?'<span style="font-weight:400;font-size:10px;text-transform:none;letter-spacing:0;opacity:.7;">(optional)</span>':""} ${a}</label>`}function fe(e,t,a,n,s=""){return`<input id="${e}" type="${t}" value="${w(a||"")}" placeholder="${w(n)}" ${s} style="font-size:14px;padding:10px 12px;border:1.5px solid var(--border);border-radius:8px;background:#fff;outline:none;width:100%;box-sizing:border-box;" />`}function Ot(e,t){return`<div style="display:flex;justify-content:space-between;align-items:center;margin-top:28px;">
    ${e?'<button type="button" id="onbBack" class="secondary-action">← Back</button>':"<span></span>"}
    <button type="button" id="onbNext" class="primary-action fit">${t||"Continue →"}</button>
  </div>`}function yn(e){var a,n,s,i;const t=P;switch(e){case 1:{const l=!!re;return`
        <div class="onb-step">
          ${mt(1)}
          <p class="eyebrow">Step 1 · Your CV</p>
          <h2 class="onb-heading">Upload your CV to get started</h2>
          <p class="onb-sub">We'll extract your experience, skills, and contact info automatically — so you don't have to type it all out.</p>
          <div class="upload-box" style="margin-bottom:4px;" id="onbCvBox">
            <input id="onbCvInput" type="file" accept=".pdf,.doc,.docx" style="display:none;" />
            <label for="onbCvInput" class="upload-trigger">${m("upload")} Choose file</label>
            <p id="onbCvStatus" style="font-size:12px;color:var(--green);min-height:18px;margin:0;">${l?`✓ ${E(re.name)}`:""}</p>
            <p>PDF or Word · max 10 MB</p>
          </div>
          <div style="display:flex;justify-content:space-between;align-items:center;margin-top:24px;">
            <button type="button" id="onbSkipCv" style="background:none;border:none;font-size:13px;color:var(--light);cursor:pointer;text-decoration:underline;padding:0;">Skip — I'll fill in manually</button>
            <button type="button" id="onbNext" class="primary-action fit" ${l?"":"disabled"}>Continue →</button>
          </div>
        </div>`}case 2:{const l=((a=o.candidate)==null?void 0:a.email)||((n=o.user)==null?void 0:n.email)||"",r=t.phone||((_==null?void 0:_.phone)??""),d=t.currentRole||(((i=(s=_==null?void 0:_.workHistory)==null?void 0:s[0])==null?void 0:i.title)??"");return`
        <div class="onb-step">
          ${mt(2)}
          <p class="eyebrow">Step 2 · Your profile</p>
          <h2 class="onb-heading">Tell us about yourself</h2>
          <p class="onb-sub">This is the basic information we'll use across every role you apply for.</p>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:4px;">
            ${te("First name",!1,fe("onbFirstName","text",t.firstName||"","María",'autocomplete="given-name"'))}
            ${te("Last name",!1,fe("onbLastName","text",t.lastName||"","García",'autocomplete="family-name"'))}
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:4px;">
            ${te("Email",!1,fe("onbEmail","email",l,"","disabled"))}
            ${te("Phone",!1,fe("onbPhone","tel",r,"+57 300 123 4567",'autocomplete="tel"'))}
          </div>
          ${te("Current role",!1,fe("onbCurrentRole","text",d,"e.g. Customer Success Manager"))}
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:4px;">
            ${te("Expected salary — USD",!0,fe("onbSalaryUSD","number",t.expectedSalaryUSD||"","2500",'min="0" step="100"'))}
            ${te("Expected salary — COP",!0,fe("onbSalaryCOP","number",t.expectedSalaryCOP||"","10000000",'min="0" step="100000"'))}
          </div>
          ${te("LinkedIn",!0,fe("onbLinkedin","url",t.linkedin||"","https://linkedin.com/in/..."))}
          <p id="onbBasicError" style="font-size:12px;color:#e74c3c;min-height:16px;margin:4px 0 0;"></p>
          ${Ot(1)}
        </div>`}case 3:{const l=t.roleGroup||Object.keys(qe)[0]||"",r=t.department||Object.keys(me)[0]||"",d=me[r]||[];return`
        <div class="onb-step">
          ${mt(3)}
          <p class="eyebrow">Step 3 · Role & location</p>
          <h2 class="onb-heading">What role are you looking for, and where are you based?</h2>
          <p class="onb-sub">We use this to match you with the right openings from our clients.</p>
          <div style="display:grid;gap:12px;margin-bottom:4px;">
            ${te("Area",!1,`<select id="onbRoleGroup" style="font-size:14px;padding:10px 12px;border:1.5px solid var(--border);border-radius:8px;background:#fff;outline:none;">${ia(l)}</select>`)}
            ${te("Role",!1,`<select id="onbTargetRole" style="font-size:14px;padding:10px 12px;border:1.5px solid var(--border);border-radius:8px;background:#fff;outline:none;">${ot(l,t.targetRole||"")}</select>`)}
            ${te("Department",!1,`<select id="onbDept" style="font-size:14px;padding:10px 12px;border:1.5px solid var(--border);border-radius:8px;background:#fff;outline:none;">${Object.keys(me).map(c=>`<option value="${w(c)}" ${c===r?"selected":""}>${E(c)}</option>`).join("")}</select>`)}
            ${te("City",!1,`<select id="onbCity" style="font-size:14px;padding:10px 12px;border:1.5px solid var(--border);border-radius:8px;background:#fff;outline:none;">${d.map(c=>`<option value="${w(c)}" ${c===t.city?"selected":""}>${E(c)}</option>`).join("")}</select>`)}
            ${te("English level",!1,`<select id="onbEnglish" style="font-size:14px;padding:10px 12px;border:1.5px solid var(--border);border-radius:8px;background:#fff;outline:none;">${["","B1","B2","C1","C2","Native"].map(c=>`<option value="${c}" ${c===t.english?"selected":""}>${c||"Select level"}</option>`).join("")}</select>`)}
          </div>
          ${Ot(2,"Review →")}
        </div>`}case 4:return wn();default:return""}}const be="font-size:14px;padding:10px 12px;border:1.5px solid var(--border);border-radius:8px;background:#fff;outline:none;width:100%;box-sizing:border-box;",Et="flex-shrink:0;width:38px;height:38px;border:1.5px solid var(--border);border-radius:8px;background:#fff;color:var(--light);font-size:14px;cursor:pointer;";function Ze(e){return`<label style="display:block;margin-bottom:8px;font-size:11px;font-weight:600;letter-spacing:.07em;text-transform:uppercase;color:var(--light);">${e}</label>`}function wn(){var u;const e=P,t=_||{};!e.experience.length&&Array.isArray(t.workHistory)&&t.workHistory.length&&(e.experience=t.workHistory.map(v=>({company:v.company||"",title:v.title||"",from:v.from||"",to:v.to||""}))),!e.languages.length&&Array.isArray(t.languages)&&t.languages.length&&(e.languages=t.languages.filter(Boolean).map(String)),!e.skills.length&&Array.isArray(t.skills)&&t.skills.length&&(e.skills=[...new Set(t.skills.map(Pe).filter(Boolean))]),!e.certifications.length&&Array.isArray(t.certifications)&&t.certifications.length&&(e.certifications=t.certifications.map(v=>({name:v.name||"",issuer:v.issuer||"",date:v.date||""})));const a=[e.firstName,e.lastName].filter(Boolean).join(" ")||((u=o.candidate)==null?void 0:u.name)||"—",n=e.targetRole||"—",s=[e.city,e.department].filter(Boolean).join(", ")||"—",i=[];e.expectedSalaryUSD&&i.push(`$${Number(e.expectedSalaryUSD).toLocaleString("en-US")} USD/mo`),e.expectedSalaryCOP&&i.push(`$${Number(e.expectedSalaryCOP).toLocaleString("es-CO")} COP/mo`);const l=i.join(" · ")||"—",r=e.english||"—",d=e.phone||"—",c=(re==null?void 0:re.name)||"",p=(v,h)=>!h||h==="—"?"":`
    <div style="display:flex;gap:16px;padding:10px 0;border-bottom:1px solid var(--border);">
      <span style="width:110px;flex-shrink:0;font-size:10px;font-weight:700;letter-spacing:.07em;text-transform:uppercase;color:var(--light);padding-top:3px;">${v}</span>
      <span style="font-size:13px;color:var(--black);line-height:1.5;">${E(String(h))}</span>
    </div>`;return`
    <div class="onb-step">
      <p class="eyebrow" style="color:var(--green);">Almost done</p>
      <h2 class="onb-heading">Does this look right?</h2>
      <p class="onb-sub" style="margin-bottom:20px;">Review your profile before we save it. You can always update it later from Settings.</p>
      <div style="border:1.5px solid var(--border);border-radius:12px;padding:2px 16px 2px;margin-bottom:24px;">
        ${p("Name",a)}
        ${p("Role",n)}
        ${p("Location",s)}
        ${p("Salary",l)}
        ${p("English",r)}
        ${p("Phone",d)}
        ${p("Current role",e.currentRole||"—")}
        ${c?p("CV",c):""}
      </div>

      <div class="field" style="margin-bottom:20px;">
        ${Ze("Experience")}
        <div id="onbExperienceList"></div>
        <button type="button" class="secondary-action" id="onbAddExperience">+ Add position</button>
      </div>

      <div class="field" style="margin-bottom:20px;">
        ${Ze("Languages")}
        <div id="onbLanguagesList"></div>
        <button type="button" class="secondary-action" id="onbAddLanguage">+ Add language</button>
      </div>

      <div class="field" style="margin-bottom:20px;">
        ${Ze("Skills")}
        ${oa(e.skills)}
      </div>

      <div class="field" style="margin-bottom:20px;">
        ${Ze("Certifications")}
        <div id="onbCertificationsList"></div>
        <button type="button" class="secondary-action" id="onbAddCertification">+ Add certification</button>
      </div>

      <div style="display:flex;justify-content:space-between;align-items:center;">
        <button type="button" id="onbEdit" class="secondary-action">← Edit</button>
        <button type="button" id="onbFinish" class="primary-action fit">${m("check")} Finish setup</button>
      </div>
      <p id="onbFinishErr" style="font-size:12px;color:#e74c3c;text-align:right;min-height:18px;margin-top:6px;"></p>
    </div>`}function at(){const e=document.querySelector("#onbExperienceList");e&&(e.innerHTML="",P.experience.length||(e.innerHTML='<p style="font-size:12px;color:var(--light);margin:0 0 10px;">No experience added yet.</p>'),P.experience.forEach((t,a)=>{var s,i;const n=document.createElement("div");n.style.cssText="border:1.5px solid var(--border);border-radius:10px;padding:12px;margin-bottom:10px;",n.innerHTML=`
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px;">
        <input type="text" data-k="title" placeholder="Title" value="${w(t.title||"")}" style="${be}">
        <input type="text" data-k="company" placeholder="Company" value="${w(t.company||"")}" style="${be}">
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr auto;gap:8px;align-items:center;">
        <input type="month" data-k="from" value="${w(t.from||"")}" style="${be}">
        <input type="month" data-k="to" value="${t.to==="present"?"":w(t.to||"")}" ${t.to==="present"?"disabled":""} style="${be}">
        <button type="button" class="onb-list-remove" aria-label="Remove" style="${Et}">×</button>
      </div>
      <label style="display:flex;align-items:center;gap:6px;font-size:12px;color:var(--mid);margin-top:8px;">
        <input type="checkbox" data-k="current" ${t.to==="present"?"checked":""}> I currently work here
      </label>`,n.querySelectorAll('input[type="text"][data-k], input[type="month"][data-k]').forEach(l=>{l.addEventListener("input",r=>{t[r.target.dataset.k]=r.target.value})}),(s=n.querySelector('input[type="checkbox"][data-k="current"]'))==null||s.addEventListener("change",l=>{t.to=l.target.checked?"present":"",at()}),(i=n.querySelector(".onb-list-remove"))==null||i.addEventListener("click",()=>{P.experience.splice(a,1),at()}),e.appendChild(n)}))}function bt(){const e=document.querySelector("#onbLanguagesList");if(e){if(e.innerHTML="",P.english){const t=document.createElement("div");t.style.cssText="display:flex;align-items:center;gap:8px;margin-bottom:8px;padding:10px 12px;border:1.5px solid var(--border);border-radius:8px;background:var(--gray-1);font-size:14px;color:var(--black);",t.innerHTML=`<span style="font-weight:600;">English</span><span style="color:var(--light);">${E(P.english)}</span>`,e.appendChild(t)}if(!P.languages.length){const t=document.createElement("p");t.style.cssText="font-size:12px;color:var(--light);margin:0 0 10px;",t.textContent="No other languages added yet.",e.appendChild(t)}P.languages.forEach((t,a)=>{const n=document.createElement("div");n.style.cssText="display:flex;gap:10px;align-items:center;margin-bottom:8px;",n.innerHTML=`
      <input type="text" value="${w(t)}" placeholder="e.g. English (B2)" style="${be}flex:1;">
      <button type="button" class="onb-list-remove" aria-label="Remove" style="${Et}">×</button>`,n.querySelector("input").addEventListener("input",s=>{P.languages[a]=s.target.value}),n.querySelector(".onb-list-remove").addEventListener("click",()=>{P.languages.splice(a,1),bt()}),e.appendChild(n)})}}function St(){const e=document.querySelector("#onbCertificationsList");e&&(e.innerHTML="",P.certifications.length||(e.innerHTML='<p style="font-size:12px;color:var(--light);margin:0 0 10px;">No certifications added yet.</p>'),P.certifications.forEach((t,a)=>{const n=document.createElement("div");n.style.cssText="display:flex;gap:10px;align-items:flex-start;margin-bottom:8px;",n.innerHTML=`
      <div class="onb-cert-grid" style="flex:1;">
        <input type="text" data-k="name" value="${w(t.name||"")}" placeholder="Certification name" style="${be}">
        <input type="text" data-k="issuer" value="${w(t.issuer||"")}" placeholder="Issuer" style="${be}">
        <input type="text" data-k="date" value="${w(t.date||"")}" placeholder="Date" style="${be}">
      </div>
      <button type="button" class="onb-list-remove" aria-label="Remove" style="${Et}">×</button>`,n.querySelectorAll("input[data-k]").forEach(s=>{s.addEventListener("input",i=>{t[i.target.dataset.k]=i.target.value})}),n.querySelector(".onb-list-remove").addEventListener("click",()=>{P.certifications.splice(a,1),St()}),e.appendChild(n)}))}function bn(e){var n,s,i,l,r;const t=document.querySelector("#onbBack"),a=document.querySelector("#onbNext");switch(t==null||t.addEventListener("click",()=>He(e-1)),e){case 1:{const d=document.querySelector("#onbCvInput"),c=document.querySelector("#onbCvStatus"),p=document.querySelector("#onbSkipCv");re&&d&&(a.disabled=!1),d==null||d.addEventListener("change",()=>{var v;const u=(v=d.files)==null?void 0:v[0];u&&(re=u,c&&(c.textContent=`✓ ${u.name}`),a.disabled=!1,_=null,Ve=kt(u).catch(()=>null))}),a==null||a.addEventListener("click",()=>gt(2)),p==null||p.addEventListener("click",()=>{re=null,Ve=null,gt(2)});break}case 2:{a==null||a.addEventListener("click",()=>{var x,$,k,R,z,B,q;const d=((x=document.querySelector("#onbFirstName"))==null?void 0:x.value.trim())||"",c=(($=document.querySelector("#onbLastName"))==null?void 0:$.value.trim())||"",p=((k=document.querySelector("#onbPhone"))==null?void 0:k.value.trim())||"",u=((R=document.querySelector("#onbCurrentRole"))==null?void 0:R.value.trim())||"",v=((z=document.querySelector("#onbSalaryUSD"))==null?void 0:z.value)||"",h=((B=document.querySelector("#onbSalaryCOP"))==null?void 0:B.value)||"",M=((q=document.querySelector("#onbLinkedin"))==null?void 0:q.value.trim())||"",A=document.querySelector("#onbBasicError");if(!d||!c||!p||!u){A&&(A.textContent="Please fill in your name, phone, and current role.");return}if(!v&&!h){A&&(A.textContent="Please enter an expected salary in USD, COP, or both.");return}P.firstName=d,P.lastName=c,P.phone=p,P.currentRole=u,P.expectedSalaryUSD=v?Number(v):"",P.expectedSalaryCOP=h?Number(h):"",P.linkedin=M,He(3)});break}case 3:{const d=document.querySelector("#onbRoleGroup"),c=document.querySelector("#onbTargetRole"),p=document.querySelector("#onbDept"),u=document.querySelector("#onbCity");d==null||d.addEventListener("change",()=>{c.innerHTML=ot(d.value,"")}),p==null||p.addEventListener("change",()=>{const v=me[p.value]||[];u.innerHTML=v.map(h=>`<option value="${w(h)}">${E(h)}</option>`).join("")}),a==null||a.addEventListener("click",()=>{var v;P.roleGroup=(d==null?void 0:d.value)||"",P.targetRole=(c==null?void 0:c.value)||"",P.department=(p==null?void 0:p.value)||"",P.city=(u==null?void 0:u.value)||"",P.english=((v=document.querySelector("#onbEnglish"))==null?void 0:v.value)||"",gt(4)});break}case 4:{(n=document.querySelector("#onbEdit"))==null||n.addEventListener("click",()=>He(1)),(s=document.querySelector("#onbFinish"))==null||s.addEventListener("click",Sn),at(),bt(),St(),(i=document.querySelector("#onbAddExperience"))==null||i.addEventListener("click",()=>{P.experience.push({company:"",title:"",from:"",to:""}),at()}),(l=document.querySelector("#onbAddLanguage"))==null||l.addEventListener("click",()=>{P.languages.push(""),bt()}),(r=document.querySelector("#onbAddCertification"))==null||r.addEventListener("click",()=>{P.certifications.push({name:"",issuer:"",date:""}),St()}),va();break}}}async function gt(e){var a,n;const t=document.querySelector("#onboardingWizard");if(Ve&&!_&&(t&&(t.innerHTML='<div class="onb-step"><p style="text-align:center;font-size:14px;font-weight:600;color:var(--green);padding:56px 0;">Analysing your CV…</p></div>'),_=await Ve),_!=null&&_.phone&&!P.phone&&(P.phone=_.phone),_!=null&&_.name&&!P.firstName&&!P.lastName){const s=String(_.name).trim().split(/\s+/).filter(Boolean);P.firstName=s[0]||"",P.lastName=s.slice(1).join(" ")}(n=(a=_==null?void 0:_.workHistory)==null?void 0:a[0])!=null&&n.title&&!P.currentRole&&(P.currentRole=_.workHistory[0].title),He(e)}async function Sn(){var a,n,s,i,l,r,d;const e=document.querySelector("#onbFinish"),t=document.querySelector("#onbFinishErr");e&&(e.disabled=!0,e.innerHTML="Saving…");try{const c=P,p=(a=o.user)==null?void 0:a.uid;if(!p)throw new Error("Not signed in");const u=c.department||"",v=c.city||"",h=Number(c.expectedSalaryUSD||0)||null,M=Number(c.expectedSalaryCOP||0)||null,A=h||M||null,x=h?"USD":M?"COP":"USD",$=A?`${x} ${A.toLocaleString()}/mo`:"",k=[...document.querySelectorAll('[data-skill-search] input[name="skills"]')].map(q=>q.value),R=[c.firstName,c.lastName].filter(Boolean).join(" ")||((n=o.candidate)==null?void 0:n.name)||((s=o.user)==null?void 0:s.displayName)||"";let z={};if(re)try{const q=await ht(p,re,"");z={activeCvId:q.id,activeCvName:q.name||q.fileName,cvUrl:q.url,cvLibrary:[q]}}catch{}const B={name:R,firstName:c.firstName||"",lastName:c.lastName||"",targetRole:c.targetRole||"",headline:c.targetRole||"",currentRole:c.currentRole||"",department:u,city:v,location:[v,u].filter(Boolean).join(", "),locationCity:v,locationDepartment:u,locationCountry:"Colombia",locationId:`${String(v).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,"").replace(/[^a-z0-9]+/g,"-")}-co`,english:c.english||"",salary:$,salaryUSD:h,salaryAmount:A,salaryCurrency:x,expectedSalaryUSD:h,expectedSalaryCOP:M,expectedSalaryAmount:A,expectedSalaryCurrency:x,whatsapp:c.phone||"",phone:c.phone||"",linkedin:c.linkedin||"",skills:[...new Set(k.map(Pe).filter(Boolean))],workHistory:c.experience||[],certifications:(c.certifications||[]).filter(q=>q.name&&q.name.trim()),languages:(c.languages||[]).map(q=>q.trim()).filter(Boolean),summary:(_==null?void 0:_.summary)||"",email:((i=o.candidate)==null?void 0:i.email)||((l=o.user)==null?void 0:l.email)||"",candidateCode:(r=o.candidate)==null?void 0:r.candidateCode,marketingConsent:((d=o.candidate)==null?void 0:d.marketingConsent)===!0,availability:"open",onboarded:!0,...z};await Ct(p,B),window.history.pushState({page:"overview"},"","/"),S({candidate:{...o.candidate,...B},activePage:"overview",message:"Welcome to Nearwork! Your profile is ready."})}catch{t&&(t.textContent="Something went wrong. Please try again."),e&&(e.disabled=!1,e.innerHTML=`${m("check")} Finish setup`)}}function Cn(){const e=Qe(),t=o.jobs.map(Se).filter(i=>At(i,e).length>=3),a=e.length>=5,n=o.matchesFiltered&&a?t:o.jobs.map(Se),s=o.matchesFiltered&&!t.length;return`
    <div class="nw-page-head">
      <div class="nw-page-overline">My search</div>
      <h1 class="nw-page-title">Matches</h1>
      <p class="nw-page-lede">Roles picked for you from your skills, target role, and salary.</p>
    </div>
    <div class="nw-filterbar">
      <button id="filterMatches" class="nw-chip${o.matchesFiltered?" active":""}" type="button">${m(o.matchesFiltered?"list":"filter")} ${o.matchesFiltered?"Show all openings":"Filter by my role & skills"}</button>
      <div class="nw-filter-count">${n.length} of ${o.jobs.length} open roles</div>
    </div>
    <div class="nw-match-grid nw-match-grid--wide">${s?ga("No filtered matches yet","Add a target role and skills in Profile to improve matching."):n.map(i=>Gn(i)).join("")}</div>
  `}function kn(){const e=o.applications||[];return`
    <div class="nw-page-head">
      <div class="nw-page-overline">My journey</div>
      <h1 class="nw-page-title">Applications</h1>
      <p class="nw-page-lede">Every role you've applied to, and exactly where it stands.</p>
    </div>
    ${an()?`
      <section class="nw-panel nw-pipeline-panel">
        <div class="nw-panel-head"><div><div class="nw-panel-overline">Status</div><div class="nw-panel-title">Where you are in the process</div></div></div>
        ${Hn(zn())}
      </section>`:""}
    <section class="nw-panel nw-applist">
      ${e.length?e.map((a,n)=>Qn(a,n===e.length-1)).join(""):Vn()}
    </section>
  `}function $n(){const e=he(),t=o.assessments||[],a=t.filter(x=>["sent","started"].includes(String(x.status||"").toLowerCase())),n=t.filter(x=>String(x.status||"").toLowerCase()==="completed"),s=e?t.find(x=>x.id===e):a[0]||n[0]||null;if(o.assessmentUiStep==="techIntro"&&s)return Tn(s);if(o.assessmentUiStep==="discIntro"&&s)return Nn(s);if(e&&!s)return`
      <div class="nw-page-head">
        <div class="nw-page-overline">My journey</div>
        <h1 class="nw-page-title">Assessment</h1>
        <p class="nw-page-lede">A short role assessment helps your recruiter advocate for you with real signal.</p>
      </div>
      <div class="nw-assess-wrap nw-assess-state-page">
        <div class="nw-assess-state-card">
          <div class="nw-assess-state-icon" style="background:var(--pp-pink-soft);color:#CC3666">${m("link-2-off")}</div>
          <strong>This link isn't available</strong>
          <p>Make sure you're logged into the same account that received the assessment email. If the problem persists, reach out to your Nearwork recruiter.</p>
          <button class="primary-action fit" data-page="recruiter" type="button">${m("message-circle")} Contact support</button>
        </div>
      </div>
    `;if(!s)return`
      <div class="nw-page-head">
        <div class="nw-page-overline">My journey</div>
        <h1 class="nw-page-title">Assessment</h1>
        <p class="nw-page-lede">A short role assessment helps your recruiter advocate for you with real signal.</p>
      </div>
      <div class="nw-assess-wrap nw-assess-state-page">
        <div class="nw-assess-state-card">
          <div class="nw-assess-state-icon">${m("inbox")}</div>
          <strong>No assessment assigned yet</strong>
          <p>Your assessment will appear here when Nearwork sends it. You'll receive an email notification when it's ready.</p>
          <div class="nw-assess-info-row">
            <div class="nw-assess-info-item">${m("shield-check")}<span>One attempt</span></div>
            <div class="nw-assess-info-item">${m("timer")}<span>~45–90 min</span></div>
            <div class="nw-assess-info-item">${m("users")}<span>Recruiter reviewed</span></div>
          </div>
        </div>
      </div>
    `;const i=Array.isArray(s.questions)?s.questions:[],l=String(s.status||"").toLowerCase()==="started",r=String(s.status||"").toLowerCase()==="completed",d=String(s.status||"").toLowerCase()==="cancelled",c=Ln(s),p=ta(),u=Number(s.currentQuestionIndex||0),v=Math.min(p??u,Math.max(i.length-1,0)),h=i[v],M=(h==null?void 0:h.stage)||s.currentStage||1,A=l&&!r&&!d&&!c;return`
    <div class="nw-assess-wrap">
      ${A?xn(s,M,v,i):Lt(s)}
      ${A?An(s,v):""}
      <div class="nw-assess-body" id="assessmentWorkspace">
        ${r?Mn(s):d?`<div class="nw-assess-state-card nw-assess-state-card--inline"><div class="nw-assess-state-icon" style="background:#F5F4F0;color:#555">${m("ban")}</div><strong>Assessment cancelled</strong><p>This assessment is no longer available. A new assigned assessment will appear here when your recruiter sends one.</p></div>`:c?`<div class="nw-assess-state-card nw-assess-state-card--inline"><div class="nw-assess-state-icon" style="background:#FEF0F5;color:#CC3666">${m("clock-x")}</div><strong>Assessment link expired</strong><p>This unique assessment link is no longer valid. Contact your Nearwork recruiter if you need a new one.</p><button class="ghost-action" data-page="recruiter" type="button">${m("message-circle")} Contact recruiter</button></div>`:Pn(s,l,v)}
      </div>
      ${qn(t,s.id)}
    </div>
  `}function Lt(e){const t=String(e.status||"").toLowerCase();return`
    <div class="nw-assess-chrome">
      <div class="nw-assess-chrome__logo">
        <div class="nw-assess-chrome__logotile">N</div>
        <span class="nw-assess-chrome__brand">Nearwork</span>
        <div class="nw-assess-chrome__divider"></div>
        <span class="nw-assess-chrome__sub">Candidate assessment</span>
      </div>
      <div style="flex:1"></div>
      ${["completed","cancelled"].includes(t)?"":`<button class="nw-assess-chrome__exit" type="button">${m("x")} Save &amp; exit</button>`}
    </div>
  `}function An(e,t){const a=(e.questions||[]).slice(0,70),n=ie(e,1).filter(r=>Me(pt(e,r))).length,s=ie(e,2).filter(r=>Me(pt(e,r))).length,i=ie(e,1).length||50,l=ie(e,2).length||20;return`
    <section class="assessment-progress-panel">
      <div><strong>Technical</strong><span>${n}/${i} answered</span></div>
      <div><strong>DISC</strong><span>${s}/${l} answered</span></div>
      <div class="assessment-progress-strip">
        ${a.map((r,d)=>{const c=Me(pt(e,r));return`<button type="button" class="${d===t?"active":""} ${c?"answered":""}" data-assessment-jump="${d}" title="${xt(r.stage)} · Q${d+1}">${d+1}</button>`}).join("")}
      </div>
    </section>
  `}function xn(e,t,a,n){const s=Number(t),i=Rt(e.technicalStartedAt||e.startedAt)||new Date,l=Rt(e.discStartedAt)||new Date,r=s===1?i:l,d=Number(s===1?e.technicalMinutes||60:e.discMinutes||30),c=new Date(r.getTime()+d*60*1e3),p=s===1?"Technical":"DISC profile",u=(n||[]).filter(A=>Number(A.stage||1)===s),v=(n||[]).findIndex(A=>Number(A.stage||1)===s),h=Math.max(0,a-v),M=u.length?Math.round((h+1)/u.length*100):2;return`
    <div class="nw-assess-chrome nw-assess-chrome--active">
      <div class="nw-assess-chrome__logo">
        <div class="nw-assess-chrome__logotile">N</div>
        <span class="nw-assess-chrome__brand">Nearwork</span>
        <div class="nw-assess-chrome__divider"></div>
        <span class="nw-assess-chrome__sub">Candidate assessment</span>
      </div>
      <div class="nw-assess-chrome__center">
        <div class="nw-assess-chrome__section">
          ${m("clipboard-check")}
          <span>${p} &middot; Question ${h+1} of ${u.length||(s===1?50:20)}</span>
        </div>
        <div class="nw-assess-chrome__progresstrack">
          <div class="nw-assess-chrome__progressfill" style="width:${Math.max(2,M)}%"></div>
        </div>
      </div>
      <div class="nw-timer-pill">
        ${m("timer")}
        <span id="assessmentTimer" data-end="${c.toISOString()}">${d}:00</span>
      </div>
      <button class="nw-assess-chrome__exit" type="button">${m("x")} Save &amp; exit</button>
    </div>
  `}function Pn(e,t,a=null){var z,B,q;if(!t){const Z=w(e.role||"Role assessment"),Y=w(e.recruiterName||e.recruiter||"Nearwork"),f=it(e.expiresAt||e.deadline),g=ie(e,1).length||50,b=ie(e,2).length||20,C=Number(e.technicalMinutes||60),y=Number(e.discMinutes||30);return`
      <div class="nw-assess-welcome">
        <div class="nw-assess-welcome__header">
          <span class="nw-assess-role-chip">${m("sparkles")} ${Z}</span>
          <span>Sent by ${Y}${f?" &middot; expires "+f:""}</span>
        </div>
        <h2 class="nw-assess-welcome__title">Let's see how you think — and how you work.</h2>
        <p class="nw-assess-welcome__desc">This assessment has two parts: a role-knowledge check and a behavioral profile.</p>
        <div class="nw-assess-parts">
          <div class="nw-assess-part">
            <div class="nw-assess-part__blob" style="background:#E4F6EF"></div>
            <div class="nw-assess-part__icon" style="background:#E4F6EF;color:#10A07C">${m("code-2")}</div>
            <span class="nw-assess-part__tag" style="color:#10A07C">Part 1</span>
            <strong class="nw-assess-part__title">Technical Assessment</strong>
            <span class="nw-assess-part__sub">${g} questions &middot; ~${C} min</span>
            <p class="nw-assess-part__desc">Single-choice role scenarios. We're looking at how you think, not whether you remember definitions.</p>
          </div>
          <div class="nw-assess-part">
            <div class="nw-assess-part__blob" style="background:#F7F2FC"></div>
            <div class="nw-assess-part__icon" style="background:#F7F2FC;color:#AF7AC5">${m("compass")}</div>
            <span class="nw-assess-part__tag" style="color:#AF7AC5">Part 2</span>
            <strong class="nw-assess-part__title">DISC Profile</strong>
            <span class="nw-assess-part__sub">${b} statements &middot; ~${y} min</span>
            <p class="nw-assess-part__desc">How you work, communicate, and lead under pressure. No right or wrong answers.</p>
          </div>
        </div>
        <div class="nw-assess-rules">
          <div class="nw-assess-rule"><div class="nw-assess-rule__icon">${m("wifi")}</div><div><strong>Stable connection</strong><span>Progress saves on every answer.</span></div></div>
          <div class="nw-assess-rule"><div class="nw-assess-rule__icon">${m("timer")}</div><div><strong>Timed sections</strong><span>A countdown runs per stage.</span></div></div>
          <div class="nw-assess-rule"><div class="nw-assess-rule__icon">${m("lock")}</div><div><strong>One attempt</strong><span>Take it when you can give it your full focus.</span></div></div>
          <div class="nw-assess-rule"><div class="nw-assess-rule__icon">${m("eye-off")}</div><div><strong>No proctoring</strong><span>No camera or screen recording.</span></div></div>
        </div>
        <div class="nw-assess-welcome__cta">
          <button class="primary-action" id="showTechIntro" type="button">${m("arrow-right")} Begin assessment</button>
          <span>Questions are timed. Open when you're ready to focus.</span>
        </div>
      </div>
    `}const n=(e.questions||[]).slice(0,70),s=Math.min(a??Number(e.currentQuestionIndex||0),Math.max(n.length-1,0)),i=n[s],l=((B=(z=e.answers)==null?void 0:z[i.id])==null?void 0:B.value)??((q=e.answers)==null?void 0:q[i.id])??"",r=Array.isArray(i.options)&&i.options.length?i.options:["Strongly agree","Agree","Neutral","Disagree"],d=n[s+1],c=d==null?void 0:d.stage,p=c&&c!==i.stage,u=yt(e,i.stage),v=p&&u.length,h=s+1>=n.length,M=h?yt(e,i.stage):[],A=!!i.multiple,x=Number(i.stage||1)===2?"nw-assess-chip--violet":"nw-assess-chip--teal",$=A?"Multi-select":"Single choice",k=w(i.part||i.type||(Number(i.stage||1)===2?"DISC":"Scenario")),R=w(i.bank||"");return`
    <form id="assessmentQuestionForm" class="nw-assess-qcard" data-current-index="${s}">
      <div class="nw-assess-qmeta">
        <span class="nw-assess-chip ${x}">${k}</span>
        ${R?`<span class="nw-assess-chip nw-assess-chip--gray">${R}</span>`:""}
        <span class="nw-assess-qtype">&middot; ${$}</span>
      </div>
      ${i.context?`<div class="nw-assess-context"><strong>Context: </strong>${w(i.context)}</div>`:""}
      <p class="nw-assess-qprompt">${w(i.q||"")}</p>
      <fieldset class="nw-assess-options${A?" nw-assess-options--multi":""}">
        <legend>${$}</legend>
        ${r.map((Z,Y)=>`
          <label class="nw-assess-option${A?" nw-assess-option--multi":""}">
            <input type="radio" name="answer" value="${Y}" ${String(l)===String(Y)?"checked":""} />
            <span class="nw-assess-option__key">${String.fromCharCode(65+Y)}</span>
            <span class="nw-assess-option__text">${w(Z)}</span>
            ${A?"":`<span class="nw-assess-option__check">${m("check-circle-2")}</span>`}
          </label>
        `).join("")}
      </fieldset>
      ${v||M.length?En(e,v?u:M,i.stage):""}
      <div class="nw-assess-qfooter">
        <button class="ghost-action" id="prevAssessmentQuestion" type="button" ${s===0?"disabled":""}>${m("arrow-left")} Back</button>
        <span class="nw-assess-autosave">${m("check")} Auto-saved</span>
        <div style="flex:1"></div>
        <button class="primary-action fit" type="submit">${h?m("send")+" Submit assessment":"Next "+m("arrow-right")}</button>
      </div>
    </form>
  `}function En(e,t,a){if(!t.length)return"";const n=(e.questions||[]).slice(0,70);return`
    <div class="nw-assess-missed">
      <strong>${m("alert-triangle")} Unanswered questions in ${xt(a)}</strong>
      <p>You skipped ${t.map(s=>`Question ${n.findIndex(i=>i.id===s.id)+1}`).join(", ")}. You can go back now or continue if you meant to leave them blank.</p>
      <div class="nw-assess-missed__links">${t.map(s=>{const i=n.findIndex(l=>l.id===s.id);return`<button class="ghost-action" type="button" data-assessment-jump="${i}">${m("arrow-left")} Go to ${i+1}</button>`}).join("")}</div>
    </div>
  `}function Ln(e){return!(e!=null&&e.expiresAt)||String(e.status||"").toLowerCase()==="completed"?!1:Date.now()>new Date(e.expiresAt).getTime()}function Tn(e){const t=w(e.role||"Role assessment"),a=ie(e,1).length||50,n=Number(e.technicalMinutes||60);return`
    <div class="nw-assess-wrap">
      ${Lt(e)}
      <div class="nw-assess-body">
        <div class="nw-assess-welcome" style="max-width:860px">
          <div style="display:inline-flex;align-items:center;gap:8px;padding:5px 12px;border-radius:999px;background:#E4F6EF;border:1px solid rgba(16,160,124,0.25);margin-bottom:4px">
            <span style="width:6px;height:6px;border-radius:50%;background:#10A07C;display:inline-block"></span>
            <span style="font-size:11.5px;font-weight:600;color:#0A7C5E;text-transform:uppercase;letter-spacing:0.05em">Part 1 of 2 &middot; Starting now</span>
          </div>
          <h2 class="nw-assess-welcome__title" style="font-size:2.2rem">Role knowledge check.</h2>
          <p class="nw-assess-welcome__desc">The next <strong>${a} questions</strong> are about the day-to-day of the ${t} role — scenarios, decisions, and judgement calls. We're looking at how you think, not whether you remember definitions.</p>
          <p style="font-size:0.88rem;color:#9AA0A6;margin:0">You have <strong style="color:#5C6066">${n} minutes</strong> total. Your progress saves automatically after every question. DISC follows when you finish.</p>
          <div class="nw-assess-welcome__cta" style="margin-top:8px">
            <button class="primary-action" id="startAssessment" type="button">${m("play")} Start Part 1</button>
            <button class="ghost-action" id="backToWelcome" type="button">${m("arrow-left")} Back</button>
          </div>
        </div>
      </div>
    </div>
  `}function Nn(e){const t=ie(e,1).length||50,a=ie(e,2).length||20,n=Number(e.discMinutes||30),s=w(e.recruiterName||e.recruiter||"your recruiter"),i=(e.questions||[]).findIndex(l=>Number(l.stage||1)===2);return`
    <div class="nw-assess-wrap">
      ${Lt(e)}
      <div class="nw-assess-body">
        <div style="background:#E4F6EF;border-bottom:1px solid rgba(16,160,124,0.15);padding:13px 20px;display:flex;align-items:center;gap:12px;margin-bottom:24px;border-radius:10px">
          <div style="width:26px;height:26px;border-radius:50%;background:#10A07C;color:#fff;display:flex;align-items:center;justify-content:center;flex-shrink:0">${m("check")}</div>
          <div style="flex:1">
            <div style="font-size:13px;font-weight:600;color:#0A7C5E">Part 1 complete — nice work.</div>
            <div style="font-size:12px;color:#0A7C5E;margin-top:1px">${t}/${t} answered &middot; submitted to ${s} for review</div>
          </div>
          <span class="nw-assess-chip nw-assess-chip--teal">${m("trophy")} Part 1 done</span>
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
              <p class="nw-assess-part__desc">You'll see ${a} statements about how you work. For each one, pick the option that's most like you. Go with your gut — there are no right answers. Takes about ${n} minutes.</p>
            </div>
          </div>
          <div class="nw-assess-rules">
            <div class="nw-assess-rule"><div class="nw-assess-rule__icon" style="color:#AF7AC5">${m("users-round")}</div><div><strong>No right answers</strong><span>This measures style, not performance.</span></div></div>
            <div class="nw-assess-rule"><div class="nw-assess-rule__icon" style="color:#AF7AC5">${m("timer")}</div><div><strong>${n} min total</strong><span>Go with your first instinct.</span></div></div>
            <div class="nw-assess-rule"><div class="nw-assess-rule__icon" style="color:#AF7AC5">${m("shield-check")}</div><div><strong>Used for fit</strong><span>Helps match you with the right team.</span></div></div>
            <div class="nw-assess-rule"><div class="nw-assess-rule__icon" style="color:#AF7AC5">${m("check")}</div><div><strong>Auto-saved</strong><span>Progress saves on every answer.</span></div></div>
          </div>
          <div class="nw-assess-welcome__cta" style="margin-top:8px">
            <button class="primary-action" id="startDiscAssessment" data-disc-index="${i>=0?i:50}" type="button">${m("play")} Start Part 2</button>
          </div>
        </div>
      </div>
    </div>
  `}function Mn(e){var l,r;const a=(((l=o.candidate)==null?void 0:l.name)||((r=o.user)==null?void 0:r.displayName)||"").split(" ")[0]||"You",n=w(e.recruiterName||e.recruiter||"your recruiter"),s=ie(e,1).length||50,i=ie(e,2).length||20;return`
    <div class="nw-assess-complete">
      <div class="nw-assess-complete__hero">
        <div class="nw-assess-complete__icon">
          ${m("check")}
          <div class="nw-assess-complete__ring1"></div>
          <div class="nw-assess-complete__ring2"></div>
        </div>
        <h2 class="nw-assess-complete__title">You're done, ${w(a)}.</h2>
        <p class="nw-assess-complete__desc">Your results have been sent to ${n}. They'll reach out personally — usually within a business day.</p>
      </div>
      <div class="nw-assess-complete__chips">
        <span class="nw-assess-complete__chip nw-assess-complete__chip--teal">${m("clipboard-check")} Part 1 &middot; ${s}/${s} answered</span>
        <span class="nw-assess-complete__chip nw-assess-complete__chip--violet">${m("compass")} Part 2 &middot; ${i}/${i} answered</span>
        <span class="nw-assess-complete__chip nw-assess-complete__chip--gray">${m("check-circle-2")} Assessment complete</span>
      </div>
      <div class="nw-assess-next">
        <div class="nw-assess-next__label">What happens next</div>
        ${[{icon:"inbox",title:"Your recruiter reviews your results",desc:`${n} will read your scenarios and DISC profile, usually within one business day.`,when:"Within 24h"},{icon:"message-square",title:`A personal note from ${n}`,desc:"Not an automated email. They'll share what stood out and what comes next.",when:"Tomorrow"},{icon:"calendar-check",title:"Interview with the hiring team",desc:"If there's a match, you'll get a calendar link to book a slot that works for you.",when:"This week"}].map(({icon:d,title:c,desc:p,when:u},v)=>`
          <div class="nw-assess-next__item">
            <div class="nw-assess-next__icon-wrap">
              <div class="nw-assess-next__iconbox">${m(d)}</div>
              <div class="nw-assess-next__num">${v+1}</div>
            </div>
            <div class="nw-assess-next__body">
              <div class="nw-assess-next__title">${c}</div>
              <div class="nw-assess-next__desc">${p}</div>
            </div>
            <div class="nw-assess-next__when">${u}</div>
          </div>
        `).join("")}
      </div>
      <div class="nw-assess-recruiter">
        <div class="nw-assess-recruiter__avatar">${(e.recruiterName||e.recruiter||"NW").split(" ").map(d=>d[0]).join("").slice(0,2).toUpperCase()}</div>
        <div style="flex:1">
          <div class="nw-assess-recruiter__label">Your recruiter</div>
          <div class="nw-assess-recruiter__name">${n}</div>
          <div class="nw-assess-recruiter__role">Talent partner &middot; Nearwork</div>
        </div>
        <button class="ghost-action" data-page="recruiter" type="button">${m("message-circle")} Message recruiter</button>
      </div>
    </div>
  `}function qn(e,t){return e.length?`
    <section class="nw-panel" style="margin-top:18px;padding-bottom:18px;">
      <div class="nw-panel-head"><div><div class="nw-panel-overline">Assessment center</div><div class="nw-panel-title">Your assessment history</div></div></div>
      <div class="assessment-history-list">
        ${e.map(a=>`
          <article class="assessment-history-row ${a.id===t?"active":""}">
            <div><strong>${w(a.role||"Nearwork assessment")}</strong><span>${w(a.id||"")}</span></div>
            <div>${w(String(a.status||"assigned"))}</div>
            <a href="/assessment/${encodeURIComponent(a.id)}/start">${a.status==="completed"?"View":"Continue"}</a>
          </article>
        `).join("")}
      </div>
    </section>
  `:""}function In(e,t){const a=e.questions||[],n=a.filter(r=>r.stage===1),s=a.filter(r=>r.stage===2),i=n.filter(r=>{var d;return typeof r.correctIndex=="number"&&Number((d=t[r.id])==null?void 0:d.value)===r.correctIndex}).length,l=s.filter(r=>{var d;return Me(((d=t[r.id])==null?void 0:d.value)??t[r.id])}).length;return{technicalScore:n.length?Math.round(i/n.length*100):0,discScore:s.length?Math.round(l/s.length*100):0}}function Dn(e,t){var r,d;const a={Dominance:0,Influence:0,Steadiness:0,Conscientiousness:0};(e.questions||[]).filter(c=>Number(c.stage)===2).forEach(c=>{var h;const p=(h=t[c.id])==null?void 0:h.value;if(!Me(p))return;const u=a[c.skill]!==void 0?c.skill:"Steadiness",v=Math.max(1,4-Number(p||0));a[u]+=v});const n=Object.entries(a).sort((c,p)=>p[1]-c[1]),s=((r=n[0])==null?void 0:r[0])||"Steadiness",i=((d=n[n.length-1])==null?void 0:d[0])||"Dominance";return{label:{Dominance:"D",Influence:"I",Steadiness:"S",Conscientiousness:"C"}[s]||"S",high:s,low:i,scores:a,summary:`${s} is the strongest observed DISC tendency; ${i} appears lowest based on this assessment.`}}async function _n(e,t){var d,c,p,u,v;const a="https://admin.nearwork.co/api/send-email",n=e.candidateEmail||((d=o.user)==null?void 0:d.email)||((c=o.candidate)==null?void 0:c.email),s=e.candidateName||((p=o.candidate)==null?void 0:p.name)||((u=o.user)==null?void 0:u.displayName)||"there",i=ca([e.recruiterEmail,e.stakeholderEmail,e.hiringManagerEmail].filter(Boolean).join(",")),l=[];n&&l.push(fetch(a,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({to:n,templateId:"assessment_completed_candidate",data:{name:s,role:e.role,actionUrl:"https://talent.nearwork.co/assessment",actionText:"Open assessment center"}})}));const r=i.length?i:["support@nearwork.co"];l.push(fetch(a,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({to:r,templateId:"assessment_completed_recruiter",data:{name:"Nearwork team",role:e.role,actionUrl:`https://admin.nearwork.co/assessments/${e.id}/questions`,actionText:"Review assessment",message:`${s} completed the assessment. Overall: ${t.score}%. Technical: ${t.technicalScore}%. DISC: ${((v=t.discProfile)==null?void 0:v.label)||"Submitted"}.`}})})),await Promise.allSettled(l)}function Rn(){var t;const e=((t=o.candidate)==null?void 0:t.cvLibrary)||[];return`
    <div class="nw-page-head">
      <div class="nw-page-overline">My search</div>
      <h1 class="nw-page-title">CV picker</h1>
      <p class="nw-page-lede">Save multiple resumes and pick the best one for each opening.</p>
    </div>
    <section class="nw-panel" style="margin-top:18px;padding-bottom:18px;">
      <form id="cvForm" class="upload-box">
        ${m("upload-cloud")}<strong>Upload a CV for this role</strong><p>Save multiple versions and pick the best one for each opening.</p>
        <input name="cv" type="file" accept=".pdf,.doc,.docx" required />
        <input name="label" type="text" placeholder="CV label, e.g. CSM resume" />
        <button class="primary-action fit" type="submit">Upload CV</button>
      </form>
      <div class="cv-list">
        ${e.length?e.map(a=>`<article class="cv-item">${m("file-text")}<div><strong>${a.name||a.fileName}</strong><span>${it(a.uploadedAt)}</span></div>${a.url?`<a href="${a.url}" target="_blank" rel="noreferrer">Open</a>`:""}</article>`).join(""):ga("No CVs saved yet","Upload role-specific resumes here.")}
      </div>
    </section>
  `}function Un(){return`
    <div class="nw-page-head">
      <div class="nw-page-overline">Support</div>
      <h1 class="nw-page-title">Tips</h1>
      <p class="nw-page-lede">Practical prep for US SaaS interviews — short, useful guidance before recruiter screens, assessments, and client interviews.</p>
    </div>
    <section class="tips-grid rich" style="margin-top:18px;">
      ${Xa.map((e,t)=>`
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
  `}function Bn(){var a,n;const t=(((a=o.candidate)==null?void 0:a.recruiter)||{}).bookingUrl||((n=o.candidate)==null?void 0:n.recruiterBookingUrl)||"mailto:support@nearwork.co?subject=Nearwork%20candidate%20question";return`
    <div class="nw-page-head">
      <div class="nw-page-overline">Support</div>
      <h1 class="nw-page-title">Recruiter</h1>
      <p class="nw-page-lede">Your Nearwork talent partner — reach out anytime about assessments, interviews, feedback, or CV selection.</p>
    </div>
    <div class="nw-split" style="margin-top:18px;">
      <section class="nw-panel" style="padding-bottom:18px;">
        <div class="nw-panel-head"><div><div class="nw-panel-overline">Recruiter</div><div class="nw-panel-title">Your Nearwork contact</div></div></div>
        ${Jn(!0)}
      </section>
      <section class="nw-panel" style="padding-bottom:18px;">
        <div class="nw-panel-head"><div><div class="nw-panel-overline">Booking</div><div class="nw-panel-title">Schedule soon</div></div></div>
        <p class="muted">Ask the Nearwork recruiting team for the earliest available slot. Candidate booking links can be attached to this profile later.</p>
        <a class="primary-action fit" href="${t}" target="_blank" rel="noreferrer">${m("calendar-plus")} Book recruiter call</a>
      </section>
    </div>
  `}function Fn(){return jn("profile")}function H(e,t=!1){return`<span class="pf-label">${e}${t?'<span class="pf-optional">optional</span>':""}</span>`}function ae(e,t,a=""){return`
    <div class="pf-card-head">
      <div class="pf-card-icon">${m(e)}</div>
      <div class="pf-card-title">${t}</div>
      ${a?`<span class="pf-card-badge">${a}</span>`:""}
    </div>`}function Tt(e,t={}){const a=e,n=(t.company||"?")[0].toUpperCase();return`
    <div class="pf-sub-card work-entry" data-work-index="${a}">
      <div class="pf-sub-card-left">
        <div class="pf-work-avatar">${n}</div>
      </div>
      <div class="pf-sub-card-body">
        <div class="pf-field-row">
          <label class="pf-field">
            ${H("Job title")}
            <input type="text" class="pf-input work-field" data-field="title" value="${w(t.title||"")}" placeholder="e.g. Customer Success Manager" />
          </label>
          <label class="pf-field">
            ${H("Company")}
            <input type="text" class="pf-input work-field" data-field="company" value="${w(t.company||"")}" placeholder="e.g. Acme Corp" />
          </label>
        </div>
        <div class="pf-field-row pf-field-row--3">
          <label class="pf-field">
            ${H("From")}
            <input type="text" class="pf-input work-field" data-field="from" value="${w(t.from||"")}" placeholder="2021-03" />
          </label>
          <label class="pf-field">
            ${H("To")}
            <input type="text" class="pf-input work-field" data-field="to" value="${w(t.to||"")}" placeholder="present" />
          </label>
          <div></div>
        </div>
      </div>
      <button type="button" class="pf-remove-btn remove-work-entry" data-remove="${a}" aria-label="Remove">
        ${m("x")}
      </button>
    </div>`}const On=["","A1","A2","B1","B2","C1","C2","Native"];function Nt(e,t={}){const a=e,n=typeof t=="string"?{name:t,level:""}:t;return`
    <div class="pf-sub-card lang-entry" data-lang-index="${a}">
      <div class="pf-sub-card-body">
        <div class="pf-field-row">
          <label class="pf-field">
            ${H("Language")}
            <input type="text" class="pf-input lang-field" data-field="name" value="${w(n.name||"")}" placeholder="e.g. Spanish, French…" />
          </label>
          <label class="pf-field">
            ${H("Level")}
            <select class="pf-input lang-field" data-field="level">
              ${On.map(s=>`<option value="${s}" ${(n.level||"")===s?"selected":""}>${s||"Select level"}</option>`).join("")}
            </select>
          </label>
        </div>
      </div>
      <button type="button" class="pf-remove-btn remove-lang-entry" data-remove="${a}" aria-label="Remove">
        ${m("x")}
      </button>
    </div>`}function Mt(e,t={}){const a=e;return`
    <div class="pf-sub-card cert-entry" data-cert-index="${a}">
      <div class="pf-sub-card-left">
        <div class="pf-cert-icon">✓</div>
      </div>
      <div class="pf-sub-card-body">
        <div class="pf-field-row">
          <label class="pf-field">
            ${H("Certificate / Course")}
            <input type="text" class="pf-input cert-field" data-field="name" value="${w(t.name||"")}" placeholder="e.g. Google Analytics" />
          </label>
          <label class="pf-field">
            ${H("Issuer",!0)}
            <input type="text" class="pf-input cert-field" data-field="issuer" value="${w(t.issuer||"")}" placeholder="e.g. Coursera, HubSpot" />
          </label>
        </div>
        <label class="pf-field" style="max-width:200px;">
          ${H("Date (YYYY-MM)",!0)}
          <input type="text" class="pf-input cert-field" data-field="date" value="${w(t.date||"")}" placeholder="2023-06" />
        </label>
      </div>
      <button type="button" class="pf-remove-btn remove-cert-entry" data-remove="${a}" aria-label="Remove">
        ${m("x")}
      </button>
    </div>`}function jn(e="profile"){var u,v,h,M,A,x,$,k,R,z,B,q,Z,Y,f,g,b,C;const t=Qe(),a=nn(),n=me[a.department]||[],s=((u=o.candidate)==null?void 0:u.salaryCurrency)||"USD",i=ra(((v=o.candidate)==null?void 0:v.salaryAmount)||((h=o.candidate)==null?void 0:h.salary)||((M=o.candidate)==null?void 0:M.salaryUSD),s),l=sn(),r=((A=o.candidate)==null?void 0:A.targetRole)||((x=o.candidate)==null?void 0:x.headline)||"",d=pa(),c=Pt(),p=c.filter(y=>y.done).length;return`
    <div class="pf-page">

      <!-- Page header -->
      <div class="pf-page-header">
        <div>
          <div class="pf-page-overline">${e==="onboarding"?"Setup":"Candidate profile"}</div>
          <h1 class="pf-page-title">${e==="onboarding"?"Let's build your profile.":"Improve your match quality."}</h1>
        </div>
        <div class="pf-completion-badge">
          <svg viewBox="0 0 40 40" class="pf-completion-ring">
            <circle cx="20" cy="20" r="16" fill="none" stroke="#EBEDF0" stroke-width="3"/>
            <circle cx="20" cy="20" r="16" fill="none" stroke="#10A07C" stroke-width="3"
              stroke-dasharray="${(2*Math.PI*16).toFixed(1)}"
              stroke-dashoffset="${(2*Math.PI*16*(1-d/100)).toFixed(1)}"
              stroke-linecap="round" transform="rotate(-90 20 20)"/>
          </svg>
          <span class="pf-completion-pct">${d}%</span>
        </div>
      </div>

      <!-- Progress bar -->
      <div class="pf-progress-bar">
        <div class="pf-progress-fill" style="width:${d}%;"></div>
      </div>
      <div class="pf-progress-label">${p} of ${c.length} sections complete</div>

      <!-- Tabs -->
      <div class="pf-tabs" role="tablist">
        <button type="button" class="pf-tab active" data-tab="profile">${m("user-round")} Profile</button>
        <button type="button" class="pf-tab" data-tab="skills">${m("sparkles")} Skills</button>
        <button type="button" class="pf-tab" data-tab="cv">${m("file-text")} CV</button>
        <button type="button" class="pf-tab" data-tab="experience">${m("building-2")} Experience</button>
        <button type="button" class="pf-tab" data-tab="certifications">${m("graduation-cap")} Certifications</button>
      </div>

      <form id="profileForm" class="pf-form">

        <!-- ── Profile ── -->
        <div class="pf-tab-panel" data-tab-panel="profile">

          <!-- ── Identity ── -->
          <div class="pf-card">
            ${ae("user-round","Identity")}
            <div class="pf-identity-row">
              <div class="pf-avatar-upload">
                ${na("large")}
                <label class="pf-photo-btn">
                  ${m("camera")} Change photo
                  <input name="photo" type="file" accept="image/png,image/jpeg,image/webp" style="display:none;" />
                </label>
              </div>
              <div class="pf-field" style="flex:1;">
                ${H("Full name")}
                <input class="pf-input" name="name" value="${w((($=o.candidate)==null?void 0:$.name)||((k=o.user)==null?void 0:k.displayName)||"")}" placeholder="Your full name" />
              </div>
            </div>
          </div>

          <!-- ── Role ── -->
          <div class="pf-card">
            ${ae("briefcase-business","Role applying for")}
            <div class="pf-field-row">
              <label class="pf-field">
                ${H("Area")}
                <select class="pf-input" name="roleGroup" id="roleGroupSelect">
                  ${ia(l)}
                </select>
              </label>
              <label class="pf-field">
                ${H("Target role")}
                <select class="pf-input" name="targetRole" id="targetRoleSelect">
                  ${ot(l,r)}
                </select>
              </label>
            </div>
          </div>

          <!-- ── Location ── -->
          <div class="pf-card">
            ${ae("map-pin","Location")}
            <div class="pf-field-row">
              <label class="pf-field">
                ${H("Department")}
                <select class="pf-input" name="department" id="departmentSelect">
                  ${Object.keys(me).map(y=>`<option value="${w(y)}" ${y===a.department?"selected":""}>${y}</option>`).join("")}
                </select>
              </label>
              <label class="pf-field">
                ${H("City")}
                <select class="pf-input" name="city" id="citySelect">
                  ${n.map(y=>`<option value="${w(y)}" ${y===a.city?"selected":""}>${y}</option>`).join("")}
                </select>
              </label>
            </div>
          </div>

          <!-- ── Compensation ── -->
          <div class="pf-card">
            ${ae("banknote","Compensation")}
            <label class="pf-field" style="max-width:280px;">
              ${H("Target monthly salary")}
              <div class="pf-salary-wrap">
                <select id="salaryCurrencyInput" name="salaryCurrency" class="pf-currency-select">
                  <option value="USD" ${i.salaryCurrency==="USD"?"selected":""}>USD</option>
                  <option value="COP" ${i.salaryCurrency==="COP"?"selected":""}>COP</option>
                </select>
                <input class="pf-input pf-salary-input" id="salaryInput" name="salary" value="${w(i.salaryAmount?wt(i.salaryAmount,i.salaryCurrency):"")}" inputmode="numeric" placeholder="2,500" />
              </div>
              <span class="pf-hint">How much you're looking for, per month.</span>
            </label>
          </div>

          <!-- ── English & languages ── -->
          <div class="pf-card" id="langCard">
            ${ae("languages","English & languages")}
            <label class="pf-field" style="max-width:280px; margin-bottom:14px;">
              ${H("English level")}
              <select class="pf-input" name="english">
                ${["","B1","B2","C1","C2","Native"].map(y=>{var N;return`<option value="${y}" ${((N=o.candidate)==null?void 0:N.english)===y?"selected":""}>${y||"Select level"}</option>`}).join("")}
              </select>
            </label>
            ${H("Other languages",!0)}
            <p class="pf-hint">Add any other languages you speak and your level in each.</p>
            <div id="langEntries" class="pf-entries">
              ${(((R=o.candidate)==null?void 0:R.languages)||[]).map((y,N)=>Nt(N,y)).join("")}
            </div>
            <button type="button" id="addLangEntry" class="pf-add-btn">
              ${m("plus")} Add language
            </button>
          </div>

          <!-- ── Contact ── -->
          <div class="pf-card">
            ${ae("phone","Contact")}
            <div class="pf-field-row">
              <label class="pf-field">
                ${H("WhatsApp number")}
                <input class="pf-input" name="whatsapp" value="${w(((z=o.candidate)==null?void 0:z.whatsapp)||((B=o.candidate)==null?void 0:B.phone)||"")}" inputmode="tel" autocomplete="tel" placeholder="+57 300 123 4567" required />
              </label>
              <label class="pf-field">
                ${H("LinkedIn",!0)}
                <input class="pf-input" name="linkedin" value="${w(((q=o.candidate)==null?void 0:q.linkedin)||"")}" placeholder="https://linkedin.com/in/…" />
              </label>
            </div>
          </div>

          <!-- ── Communications ── -->
          <div class="pf-card">
            ${ae("mail","Communications")}
            <label class="pf-checkbox-row">
              <input type="checkbox" name="marketingConsent" ${((Z=o.candidate)==null?void 0:Z.marketingConsent)===!0?"checked":""} />
              <span>Send me job opportunities and updates from Nearwork by email</span>
            </label>
            <p class="pf-hint">You can turn this on or off at any time. It won't affect emails about your active applications.</p>
          </div>

          ${e==="onboarding"?"":`
          <!-- ── Danger zone ── -->
          <div class="pf-card pf-danger-card">
            ${ae("trash-2","Delete account")}
            <p class="pf-hint">Permanently delete your Nearwork profile, resume, applications, and assessment history. This cannot be undone — you can create a new account with the same email later if you change your mind.</p>
            <button type="button" id="openDeleteAccount" class="pf-danger-btn">
              ${m("trash-2")} Delete my account
            </button>
          </div>`}

        </div>

        <!-- ── Skills ── -->
        <div class="pf-tab-panel" data-tab-panel="skills" hidden>
          <div class="pf-card">
            ${ae("sparkles","Skills",t.length?`${t.length} added`:"")}
            ${oa(t)}
          </div>
        </div>

        <!-- ── CV ── -->
        <div class="pf-tab-panel" data-tab-panel="cv" hidden>
          <div class="pf-card" id="profileCvCard">
            ${ae("file-text","CV")}
            <p class="pf-hint">Upload the CV you want Nearwork to use for your applications.</p>
            ${(Y=o.candidate)!=null&&Y.activeCvName||(f=o.candidate)!=null&&f.cvUrl?`
              <div class="pf-cv-current">
                <div class="pf-cv-icon">${m("file-text")}</div>
                <div class="pf-cv-info">
                  <strong>${E(o.candidate.activeCvName||"CV on file")}</strong>
                  <span>Currently active · upload below to replace</span>
                </div>
                ${o.candidate.cvUrl?`<a class="pf-cv-open" href="${w(o.candidate.cvUrl)}" target="_blank" rel="noreferrer">${m("external-link")} Open</a>`:""}
              </div>`:""}
            <label class="pf-file-label" for="profileCvFileInput">
              ${m("upload")} Choose file (.pdf, .doc, .docx)
            </label>
            <input id="profileCvFileInput" name="profileCv" type="file" accept=".pdf,.doc,.docx" style="display:none;" />
            <label class="pf-field" style="margin-top:10px;">
              ${H("CV label",!0)}
              <input class="pf-input" name="profileCvLabel" type="text" placeholder="e.g. Customer Success CV" />
            </label>
          </div>
        </div>

        <!-- ── Experience ── -->
        <div class="pf-tab-panel" data-tab-panel="experience" hidden>

          <!-- ── Summary ── -->
          <div class="pf-card">
            ${ae("align-left","Summary","optional")}
            <textarea class="pf-input pf-textarea" name="summary" placeholder="Add a short note about what you do best — 2–3 sentences.">${E(((g=o.candidate)==null?void 0:g.summary)||"")}</textarea>
          </div>

          <!-- ── Work history ── -->
          <div class="pf-card" id="workHistoryCard">
            ${ae("building-2","Work experience","optional")}
            <p class="pf-hint">Add your previous roles so recruiters can see your background.</p>
            <div id="workEntries" class="pf-entries">
              ${(((b=o.candidate)==null?void 0:b.workHistory)||[]).map((y,N)=>Tt(N,y)).join("")}
            </div>
            <button type="button" id="addWorkEntry" class="pf-add-btn">
              ${m("plus")} Add position
            </button>
          </div>

        </div>

        <!-- ── Certifications ── -->
        <div class="pf-tab-panel" data-tab-panel="certifications" hidden>
          <div class="pf-card" id="certCard">
            ${ae("graduation-cap","Certifications &amp; courses","optional")}
            <p class="pf-hint">Add certificates, licences, or courses relevant to your work.</p>
            <div id="certEntries" class="pf-entries">
              ${(((C=o.candidate)==null?void 0:C.certifications)||[]).map((y,N)=>Mt(N,y)).join("")}
            </div>
            <button type="button" id="addCertEntry" class="pf-add-btn">
              ${m("plus")} Add certificate
            </button>
          </div>
        </div>

        <input type="hidden" name="mode" value="${e}" />

        <!-- Save -->
        <div class="pf-footer">
          <button class="pf-save-btn" type="submit">
            ${m("save")} ${e==="onboarding"?"Finish setup":"Save profile"}
          </button>
          <span class="pf-footer-hint">Changes save to your profile instantly.</span>
        </div>

      </form>

      ${o.showDeleteAccountModal?`
      <div class="nw-modal-overlay" id="deleteAccountOverlay">
        <div class="nw-modal">
          <h3>Delete your account?</h3>
          <p>This will permanently delete your profile, resume, applications, and assessment history from Nearwork. This cannot be undone.</p>
          <label class="pf-field">
            <span class="pf-label" style="text-transform:none;">Type DELETE to confirm</span>
            <input class="pf-input" id="deleteConfirmInput" autocomplete="off" />
          </label>
          ${o.deleteAccountStatus==="error"?`<div class="nw-modal-error">${E(o.deleteAccountError||"Something went wrong.")}</div>`:""}
          <div class="nw-modal-actions">
            <button type="button" id="cancelDeleteAccount" class="nw-btn-secondary" ${o.deleteAccountStatus==="deleting"?"disabled":""}>Cancel</button>
            <button type="button" id="confirmDeleteAccount" class="pf-danger-btn" ${o.deleteAccountStatus==="deleting"?"disabled":""}>
              ${o.deleteAccountStatus==="deleting"?"Deleting…":"Delete permanently"}
            </button>
          </div>
        </div>
      </div>`:""}

      ${e==="profile"&&o.showUnsavedChangesModal?`
      <div class="nw-modal-overlay" id="unsavedChangesOverlay">
        <div class="nw-modal">
          <h3>Save your changes?</h3>
          <p>You've made changes to your profile that haven't been saved yet. Do you want to save them before leaving this page?</p>
          <div class="nw-modal-actions">
            <button type="button" id="cancelUnsavedNav" class="nw-btn-secondary">Stay on this page</button>
            <button type="button" id="discardUnsavedNav" class="nw-btn-secondary">Discard changes</button>
            <button type="button" id="saveUnsavedNav" class="pf-save-btn">Save &amp; continue</button>
          </div>
        </div>
      </div>`:""}
    </div>
  `}function pa(){const e=Pt(),t=e.filter(a=>a.done).length;return Math.max(25,Math.round(t/e.length*100))}function zn(){const e=o.applications[0];return(e==null?void 0:e.stage)||(e==null?void 0:e.status)||"profile-review"}function Hn(e){const t=String(e).toLowerCase().replace(/_/g,"-").replace(/\s+/g,"-"),a=Math.max(0,_t.findIndex(n=>t.includes(n.key)||n.key.includes(t)));return`<div class="pipeline">${_t.map((n,s)=>`<article class="${s<=a?"done":""} ${s===a?"current":""}"><span>${s+1}</span><strong>${n.label}</strong><p>${n.help}</p></article>`).join("")}</div>`}function Vn(){return`
    <div class="nw-empty">
      ${m("briefcase-business")}
      <strong>No active pipeline yet</strong>
      <p>Browse current openings and apply when you find a role that fits. Nearwork will show your applications here once you apply.</p>
      <div style="display:flex;gap:8px;margin-top:12px;">
        <button class="nw-btn-primary" type="button" data-page="matches">${m("sparkles")} View matches</button>
        <a class="nw-btn-secondary" href="https://jobs.nearwork.co" target="_blank" rel="noreferrer">${m("external-link")} Open jobs</a>
      </div>
    </div>
  `}function ma(){try{return new Set(JSON.parse(localStorage.getItem("nw_talent_applied")||"[]"))}catch{return new Set}}function Gn(e){const t=Se(e),n=new Set(o.applications.map(u=>u.jobId||u.openingCode)).has(t.code)||ma().has(t.code),s=At(t),i=t.match||(s.length>=3?Math.min(97,70+s.length*4):null),l=["#10A07C","#EC4E7E","#3B82F6","#F4A52E"],r=l[t.orgName.length%l.length],d=t.orgName.split(/\s+/).slice(0,2).map(u=>u[0]).join("").toUpperCase(),c=`https://jobs.nearwork.co/apply?code=${encodeURIComponent(t.code)}`,p=(s.length?s:t.skills).slice(0,3);return`
    <div class="nw-match-card">
      <div class="nw-match-card-top">
        <div class="nw-match-avatar" style="background:${r};">${d}</div>
        ${i?`<div class="nw-match-score">${i}% match</div>`:""}
      </div>
      <div class="nw-match-role">${E(t.title)}</div>
      <div class="nw-match-company">${E(t.orgName)} · ${E(t.location)}</div>
      <div class="nw-match-chips">${p.map(E).map(u=>`<span class="nw-match-chip">${u}</span>`).join("")}</div>
      <div class="nw-match-footer">
        <span class="nw-match-salary">${E(t.compensation)}</span>
        <button type="button" class="nw-match-view" data-open-url="${w(c)}">View opening ${m("arrow-up-right")}</button>
      </div>
      <button class="nw-match-applybtn${n?" applied":""}" type="button" data-apply="${t.code}" ${n?"disabled":""}>${n?`${m("check")} Applied`:`Apply now ${m("arrow-right")}`}</button>
    </div>
  `}function Qn(e,t){const a=String(e.stage||e.status||"applied").toLowerCase(),n=a.includes("offer")?4:a.includes("final")?3:a.includes("interview")?2:a.includes("assessment")?1:0,s=e.clientName||e.company||"Nearwork client",i=s.split(/\s+/).slice(0,2).map(c=>c[0]).join("").toUpperCase(),l=["#10A07C","#EC4E7E","#3B82F6","#F4A52E","#8B5CF6"],r=l[s.length%l.length],d=["action-needed","interview-scheduled","assessment-sent"].includes(String(e.status||"").toLowerCase());return`
    <div class="nw-app-row${t?" last":""}">
      <div class="nw-app-avatar" style="background:${r};">${i}</div>
      <div class="nw-app-info">
        <div class="nw-app-title">${E(e.jobTitle||e.title||"Application")} <span class="nw-app-company">· ${E(s)}</span></div>
        <div class="nw-app-stages">
          ${Xt.map((c,p)=>`<div class="nw-stage-pip${p<=n?" done":""}"></div>`).join("")}
          <span class="nw-app-stage-label">${e.stage||e.status||"Applied"}</span>
        </div>
      </div>
      <div class="nw-app-meta">
        <span class="nw-app-status${d?" action":""}">${e.status||"In review"}</span>
        <div class="nw-app-date">${it(e.updatedAt||e.createdAt)}</div>
      </div>
      ${m("chevron-right")}
    </div>`}function Jn(e=!1){var i;const t=((i=o.candidate)==null?void 0:i.recruiter)||{},a=t.email||"support@nearwork.co",n=t.whatsapp||Wa,s=t.whatsappUrl||Ya;return`<article class="recruiter-card"><div class="avatar recruiter-avatar">NW</div><div><strong>${t.name||"Nearwork Support"}</strong><p><a href="mailto:${a}">${a}</a></p><p><a href="${s}" target="_blank" rel="noreferrer">WhatsApp ${n}</a></p>${e?"<span>Questions about assessments, interviews, feedback, or CV selection should go here.</span>":""}</div></article>`}function ga(e,t){return`<div class="empty-state">${m("inbox")}<strong>${e}</strong><p>${t}</p></div>`}function Wn(e){const t=(e==null?void 0:e.title)||(e==null?void 0:e.role)||"this role",a=document.createElement("div");a.className="nw-modal-overlay",a.innerHTML=`
    <div class="nw-modal" style="text-align:center;padding:32px 28px;">
      <div style="font-size:48px;margin-bottom:12px;">🎉</div>
      <h3 style="font-size:18px;margin-bottom:10px;">Application submitted!</h3>
      <p style="margin-bottom:6px;">You've applied to <strong>${E(t)}</strong>. Our team will review your profile and reach out with next steps shortly.</p>
      <p style="font-size:12px;color:var(--light);margin-bottom:20px;">You can track your application status in the Applications tab.</p>
      <button type="button" class="pf-btn-primary" id="dismissApplySuccess" style="padding:11px 28px;border-radius:99px;font-size:14px;">Got it</button>
    </div>`,document.body.appendChild(a),a.addEventListener("click",n=>{(n.target===a||n.target.id==="dismissApplySuccess")&&a.remove()}),document.getElementById("dismissApplySuccess").focus()}function Yn(){st.innerHTML='<main class="loading-screen"><span class="logo-mark">N</span><p>Loading Talent...</p></main>'}async function Zn(e){var t;try{const a=await((t=U.currentUser)==null?void 0:t.getIdToken().catch(()=>""));if(a){const n=await fetch("/api/auth-handoff",{method:"POST",headers:{Authorization:"Bearer "+a,"Content-Type":"application/json"}});if(n.ok){const{customToken:s}=await n.json();if(s){const i=new URL(e);i.searchParams.set("ct",s),window.open(i.toString(),"_blank","noreferrer");return}}}}catch{}window.open(e,"_blank","noreferrer")}function Kn(){var e,t,a,n,s,i,l,r,d,c,p,u,v,h,M,A,x,$,k,R,z,B,q,Z,Y;(e=document.querySelector("#signOut"))==null||e.addEventListener("click",async()=>{await ct(U),V&&V(),V=null,ze=!1,J=!1,oe=null,window.history.pushState({page:"overview"},"","/"),S({user:null,candidate:null,applications:[],assessments:[],jobs:[],view:"login",activePage:"overview",message:""})}),(t=document.querySelector("#mobileSignOut"))==null||t.addEventListener("click",async()=>{await ct(U),V&&V(),V=null,ze=!1,J=!1,oe=null,window.history.pushState({page:"overview"},"","/"),S({user:null,candidate:null,applications:[],assessments:[],jobs:[],view:"login",activePage:"overview",message:""})}),(a=document.querySelector("#signIn"))==null||a.addEventListener("click",()=>{window.history.pushState({page:"overview"},"","/"),S({view:"login",activePage:"overview",message:""})}),(n=document.querySelector("#openDeleteAccount"))==null||n.addEventListener("click",()=>{S({showDeleteAccountModal:!0,deleteAccountStatus:null,deleteAccountError:""})}),(s=document.querySelector("#cancelDeleteAccount"))==null||s.addEventListener("click",()=>{S({showDeleteAccountModal:!1,deleteAccountStatus:null,deleteAccountError:""})}),(i=document.querySelector("#confirmDeleteAccount"))==null||i.addEventListener("click",async()=>{var g,b;if(((b=(g=document.querySelector("#deleteConfirmInput"))==null?void 0:g.value)==null?void 0:b.trim())!=="DELETE"){S({deleteAccountStatus:"error",deleteAccountError:'Type "DELETE" to confirm.'});return}S({deleteAccountStatus:"deleting"});try{await ja(),await ct(U),V&&V(),V=null,ze=!1,J=!1,oe=null,window.history.pushState({page:"overview"},"","/"),S({user:null,candidate:null,applications:[],assessments:[],jobs:[],view:"login",activePage:"overview",showDeleteAccountModal:!1,deleteAccountStatus:null,deleteAccountError:"",message:"Your account has been deleted. You're welcome to sign up again anytime."})}catch(C){S({deleteAccountStatus:"error",deleteAccountError:C.message||"Failed to delete account."})}}),document.querySelectorAll("[data-page]").forEach(f=>{f.addEventListener("click",g=>{const C=(g.currentTarget.closest("[data-page]")||g.currentTarget).dataset.page;if(o.activePage==="profile"&&J&&C!=="profile"){oe=C,S({showUnsavedChangesModal:!0});return}Oe(C)})}),(l=document.querySelector("[data-dashboard-home]"))==null||l.addEventListener("click",()=>{if(o.activePage==="profile"&&J){oe="overview",S({showUnsavedChangesModal:!0});return}Oe("overview")}),(r=document.querySelector("#cancelUnsavedNav"))==null||r.addEventListener("click",()=>{oe=null,S({showUnsavedChangesModal:!1})}),(d=document.querySelector("#discardUnsavedNav"))==null||d.addEventListener("click",()=>{J=!1;const f=oe;oe=null,S({showUnsavedChangesModal:!1}),f&&Oe(f)}),(c=document.querySelector("#saveUnsavedNav"))==null||c.addEventListener("click",()=>{var f;S({showUnsavedChangesModal:!1}),(f=document.querySelector("#profileForm"))==null||f.requestSubmit()}),(p=document.querySelector("#notificationBell"))==null||p.addEventListener("click",()=>{S({notificationPanelOpen:!o.notificationPanelOpen,notificationSettingsOpen:!1})}),(u=document.querySelector("#notificationSettings"))==null||u.addEventListener("click",()=>{S({notificationSettingsOpen:!o.notificationSettingsOpen,notificationPanelOpen:!1})}),document.querySelectorAll("[data-notification-read]").forEach(f=>{f.addEventListener("click",async()=>{const g=f.dataset.notificationRead;o.user&&we&&await Ga(g).catch(()=>null),S({notifications:o.notifications.map(b=>b.id===g?{...b,read:!0}:b)})})}),document.querySelectorAll("[data-notification-pref]").forEach(f=>{f.addEventListener("change",async()=>{var y;const g=structuredClone(((y=o.candidate)==null?void 0:y.notificationPreferences)||{}),b=f.dataset.notificationPref,C=f.dataset.channel;g[b]={...g[b]||{},[C]:f.checked},S({candidate:{...o.candidate,notificationPreferences:g}}),o.user&&we&&await Qa(o.user.uid,g).catch(()=>null)})}),document.querySelectorAll("[data-assessment-jump]").forEach(f=>{f.addEventListener("click",async()=>{var K,X,D;const g=he()||((K=(o.assessments||[])[0])==null?void 0:K.id),b=(o.assessments||[]).find(I=>I.id===g),C=Number(f.dataset.assessmentJump||0),y=(X=b==null?void 0:b.questions)==null?void 0:X[C];if(!g||!y)return;await Fe(g,"__progress__","",{currentQuestionIndex:C,totalQuestions:((D=b==null?void 0:b.questions)==null?void 0:D.length)||70,currentStage:y.stage||1}),Te(g,C);const N=(o.assessments||[]).map(I=>I.id===g?{...I,currentQuestionIndex:C,currentStage:y.stage||1}:I);S({assessments:N,activePage:"assessment",message:""})})}),document.querySelector("#availability").addEventListener("change",async f=>{const g=f.target.value;S({candidate:{...o.candidate,availability:g}}),o.user&&we?await Oa(o.user.uid,g):S({message:"Sign in to save availability."})}),(v=document.querySelector("#filterMatches"))==null||v.addEventListener("click",()=>{const f=Qe().length>=3;S({matchesFiltered:f?!o.matchesFiltered:!1,message:f?"":"Add at least 5 skills in Profile first, then filter matching openings."})}),(h=document.querySelector("#departmentSelect"))==null||h.addEventListener("change",f=>{const g=document.querySelector("#citySelect"),b=me[f.target.value]||[];g.innerHTML=b.map(C=>`<option value="${w(C)}">${C}</option>`).join("")}),(M=document.querySelector("#roleGroupSelect"))==null||M.addEventListener("change",f=>{const g=document.querySelector("#targetRoleSelect");g.innerHTML=ot(f.target.value,"")}),(A=document.querySelector("#salaryCurrencyInput"))==null||A.addEventListener("change",f=>{const g=document.querySelector("#salaryInput");if(!g)return;const b=Ut(g.value,f.target.value);f.target.value=b,g.placeholder=b==="COP"?"5,000,000":"2,500",g.value=wt(g.value,b)}),(x=document.querySelector("#salaryInput"))==null||x.addEventListener("blur",f=>{const g=document.querySelector("#salaryCurrencyInput"),b=Ut(f.target.value,(g==null?void 0:g.value)||"USD");g&&(g.value=b),f.target.placeholder=b==="COP"?"5,000,000":"2,500",f.target.value=wt(f.target.value,b)}),hn(),va(),os(),es(),ss(),as(),Xn(),document.querySelectorAll("[data-open-url]").forEach(f=>{f.addEventListener("click",()=>Zn(f.dataset.openUrl))}),document.querySelectorAll("[data-apply]").forEach(f=>{f.addEventListener("click",async()=>{const g=o.jobs.map(Se).find(C=>C.code===f.dataset.apply),b=f.dataset.apply;if(f.disabled=!0,f.textContent="Submitting...",o.user&&we){try{const C=ma();C.add(b),localStorage.setItem("nw_talent_applied",JSON.stringify([...C]))}catch{}await Fa(o.user.uid,g),f.textContent=`${m("check")} Applied`,f.classList.add("applied"),Wn(g)}else S({message:"Sign in to apply to this opening."})})}),($=document.querySelector("#showTechIntro"))==null||$.addEventListener("click",()=>{S({assessmentUiStep:"techIntro",message:""})}),(k=document.querySelector("#backToWelcome"))==null||k.addEventListener("click",()=>{S({assessmentUiStep:null,message:""})}),(R=document.querySelector("#startDiscAssessment"))==null||R.addEventListener("click",async()=>{var X;const f=he()||((X=(o.assessments||[])[0])==null?void 0:X.id),g=(o.assessments||[]).find(D=>D.id===f);if(!f||!g)return;const b=g.questions||[],C=document.querySelector("#startDiscAssessment"),y=C?Number(C.dataset.discIndex||50):b.findIndex(D=>Number(D.stage||1)===2),N=y>=0?y:50,K=new Date().toISOString();try{await Fe(f,"__progress__","",{currentQuestionIndex:N,totalQuestions:b.length,currentStage:2,discStartedAt:K}),Te(f,N);const D=(o.assessments||[]).map(I=>I.id===f?{...I,currentQuestionIndex:N,currentStage:2,discStartedAt:K}:I);S({assessments:D,activePage:"assessment",assessmentUiStep:null,message:""})}catch(D){S({message:$e(D)})}}),(z=document.querySelector("#startAssessment"))==null||z.addEventListener("click",async()=>{var b;const f=he()||((b=(o.assessments||[])[0])==null?void 0:b.id),g=(o.assessments||[]).find(C=>C.id===f)||(o.assessments||[])[0];if(!f||!o.user){S({message:"Please log in to start your assessment."});return}try{await Ua(f,o.user.uid),Te(f,Number((g==null?void 0:g.currentQuestionIndex)||0),!0);const C=(o.assessments||[]).map(y=>y.id===f?{...y,status:"started",startedAt:y.startedAt||new Date().toISOString(),technicalStartedAt:y.technicalStartedAt||new Date().toISOString()}:y);S({assessments:C,activePage:"assessment",assessmentUiStep:null,message:""})}catch(C){S({message:$e(C)})}}),(B=document.querySelector("#prevAssessmentQuestion"))==null||B.addEventListener("click",async()=>{var K,X,D,I;const f=he()||((K=(o.assessments||[])[0])==null?void 0:K.id),g=(o.assessments||[]).find(le=>le.id===f),b=Number(((X=document.querySelector("#assessmentQuestionForm"))==null?void 0:X.dataset.currentIndex)??(g==null?void 0:g.currentQuestionIndex)??0),C=Math.max(0,b-1),y=(D=g==null?void 0:g.questions)==null?void 0:D[C];await Fe(f,"__progress__","",{currentQuestionIndex:C,totalQuestions:((I=g==null?void 0:g.questions)==null?void 0:I.length)||70,currentStage:(y==null?void 0:y.stage)||1}),Te(f,C);const N=(o.assessments||[]).map(le=>le.id===f?{...le,currentQuestionIndex:C,currentStage:(y==null?void 0:y.stage)||1}:le);S({assessments:N,activePage:"assessment",message:""})}),(q=document.querySelector("#assessmentQuestionForm"))==null||q.addEventListener("submit",async f=>{var De;f.preventDefault();const g=he()||((De=(o.assessments||[])[0])==null?void 0:De.id),b=(o.assessments||[]).find(O=>O.id===g),C=(b==null?void 0:b.questions)||[],y=Number(f.currentTarget.dataset.currentIndex??(b==null?void 0:b.currentQuestionIndex)??0),N=C[y],K=new FormData(f.currentTarget).get("answer");if(!N){S({message:"This question could not be loaded. Please refresh and try again."});return}const X=K===null?{value:"",skipped:!0,answeredAt:new Date().toISOString()}:{value:Number(K),skipped:!1,answeredAt:new Date().toISOString()},D={...b.answers||{},[N.id]:X},I=C[y+1],le=I&&Number(I.stage||1)!==Number(N.stage||1),Ee=yt(b,N.stage,D);try{if((le||y+1>=C.length)&&Ee.length){await Fe(g,N.id,D[N.id],{currentQuestionIndex:y,totalQuestions:C.length,currentStage:N.stage||1});const O=(o.assessments||[]).map(ee=>ee.id===g?{...ee,answers:D,currentQuestionIndex:y,currentStage:N.stage||1,progress:`${y+1}/${C.length}`}:ee);S({assessments:O,activePage:"assessment",message:`You missed ${Ee.length} question${Ee.length===1?"":"s"} in the ${xt(N.stage)}.`});return}if(y+1>=C.length){const O=In(b,D),ee=Dn(b,D);await Ba(g,D,{totalQuestions:C.length,technicalScore:O.technicalScore,discScore:O.discScore,score:Math.round(O.technicalScore*.75+O.discScore*.25),discProfile:ee}),fetch("https://admin.nearwork.co/api/generate-assessment-insights",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({assessmentId:g})}).catch(()=>null),_n(b,{score:Math.round(O.technicalScore*.75+O.discScore*.25),technicalScore:O.technicalScore,discScore:O.discScore,discProfile:ee}).catch(ve=>console.warn(ve));const ge=(o.assessments||[]).map(ve=>ve.id===g?{...ve,answers:D,status:"completed",score:Math.round(O.technicalScore*.75+O.discScore*.25),technical:O.technicalScore,disc:ee.label,discProfile:ee,progress:`${C.length}/${C.length}`}:ve);S({assessments:ge,activePage:"assessment",message:""})}else{const O=N.stage===1&&(I==null?void 0:I.stage)===2&&!b.discStartedAt;await Fe(g,N.id,D[N.id],{currentQuestionIndex:y+1,totalQuestions:C.length,currentStage:(I==null?void 0:I.stage)||N.stage||1}),Te(g,y+1);const ee=(o.assessments||[]).map(ge=>ge.id===g?{...ge,answers:D,currentQuestionIndex:y+1,currentStage:(I==null?void 0:I.stage)||N.stage||1,progress:`${y+1}/${C.length}`}:ge);S({assessments:ee,activePage:"assessment",message:"",assessmentUiStep:O?"discIntro":null})}}catch(O){S({message:$e(O)})}}),(Z=document.querySelector("#profileForm"))==null||Z.addEventListener("submit",async f=>{var X,D,I,le,Ee,De,O,ee,ge,ve;f.preventDefault();const g=new FormData(f.currentTarget),b=g.get("department"),C=g.get("city"),y=ra(g.get("salary"),g.get("salaryCurrency")),N=g.get("marketingConsent")==="on",K={name:g.get("name"),targetRole:g.get("targetRole"),headline:g.get("targetRole"),department:b,city:C,locationId:`${String(C).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g,"-")}-co`,location:`${C}, ${b}`,locationCity:C,locationDepartment:b,locationCountry:"Colombia",english:g.get("english"),salary:y.salary,salaryUSD:y.salaryUSD,salaryAmount:y.salaryAmount,salaryCurrency:y.salaryCurrency,expectedSalaryAmount:y.salaryAmount,expectedSalaryCurrency:y.salaryCurrency,linkedin:g.get("linkedin"),whatsapp:g.get("whatsapp"),phone:g.get("whatsapp"),skills:[...new Set(g.getAll("skills").map(Pe).filter(Boolean))],otherSkills:[],languages:ns(),summary:g.get("summary"),email:((X=o.candidate)==null?void 0:X.email)||((D=o.user)==null?void 0:D.email)||"",availability:((I=o.candidate)==null?void 0:I.availability)||"open",marketingConsent:N,marketingConsentAt:N?((le=o.candidate)==null?void 0:le.marketingConsent)===!0?((Ee=o.candidate)==null?void 0:Ee.marketingConsentAt)||null:new Date().toISOString():null,onboarded:!0};if(!o.user){S({candidate:{...o.candidate,...K},message:"Preview updated. Sign in to save this profile."});return}try{const Le=g.get("photo");let qt=((De=o.candidate)==null?void 0:De.photoURL)||((O=o.user)==null?void 0:O.photoURL)||"";Le!=null&&Le.name&&(qt=await Ha(o.user.uid,Le));const Je=(ee=g.get("profileCv"))!=null&&ee.name?g.get("profileCv"):et;let Ce=null,It=!1;if(Je!=null&&Je.name)try{Ce=await ht(o.user.uid,Je,g.get("profileCvLabel")||""),et=null}catch{It=!0}const rt={...K,photoURL:qt,candidateCode:(ge=o.candidate)==null?void 0:ge.candidateCode,...Ce?{activeCvId:Ce.id,activeCvName:Ce.name||Ce.fileName,cvUrl:Ce.url,cvLibrary:[...((ve=o.candidate)==null?void 0:ve.cvLibrary)||[],Ce]}:{},workHistory:(()=>{var _e,Re,Ue,Be;const ke=ts();return ke.length?ke:(_e=ne==null?void 0:ne.workHistory)!=null&&_e.length&&(Ne||!((Ue=(Re=o.candidate)==null?void 0:Re.workHistory)!=null&&Ue.length))?ne.workHistory:((Be=o.candidate)==null?void 0:Be.workHistory)||[]})(),certifications:(()=>{var _e,Re,Ue,Be;const ke=is();return ke.length?ke:(_e=ne==null?void 0:ne.certifications)!=null&&_e.length&&(Ne||!((Ue=(Re=o.candidate)==null?void 0:Re.certifications)!=null&&Ue.length))?ne.certifications:((Be=o.candidate)==null?void 0:Be.certifications)||[]})()};ne=null,Ne=!1;const lt=await Ct(o.user.uid,rt),ha=It?"Profile saved, but the CV failed to upload. Try uploading it again from the CV section.":(lt==null?void 0:lt.atsSynced)===!1?"Profile saved. Nearwork will finish connecting it to your workspace.":"Profile saved.";if(g.get("mode")==="onboarding")window.history.pushState({page:"overview"},"","/"),S({candidate:{...o.candidate,...rt},activePage:"overview",message:"Profile complete. Welcome to Talent."});else if(J=!1,S({candidate:{...o.candidate,...rt},message:ha,showUnsavedChangesModal:!1}),oe){const ke=oe;oe=null,Oe(ke)}}catch(Le){S({message:$e(Le)})}}),(Y=document.querySelector("#cvForm"))==null||Y.addEventListener("submit",async f=>{var C;f.preventDefault();const g=new FormData(f.currentTarget),b=g.get("cv");if(b!=null&&b.name){if(!o.user){S({message:"Sign in to upload and store CVs."});return}try{const y=await ht(o.user.uid,b,g.get("label"));S({candidate:{...o.candidate,cvLibrary:[...((C=o.candidate)==null?void 0:C.cvLibrary)||[],y],activeCvId:y.id},message:"CV uploaded."})}catch(y){S({message:$e(y)})}}})}function Xn(){var s;const e=document.querySelectorAll(".pf-tab"),t=document.querySelectorAll(".pf-tab-panel");if(!e.length||!t.length)return;const a=i=>{e.forEach(l=>l.classList.toggle("active",l.dataset.tab===i)),t.forEach(l=>{l.hidden=l.dataset.tabPanel!==i})};e.forEach(i=>{i.addEventListener("click",()=>a(i.dataset.tab))}),(s=document.querySelector("#profileForm"))==null||s.addEventListener("invalid",i=>{const l=i.target.closest(".pf-tab-panel");l&&a(l.dataset.tabPanel)},!0);const n=document.querySelector("#profileForm");n==null||n.addEventListener("input",()=>{J=!0}),n==null||n.addEventListener("change",()=>{J=!0})}function es(){const e=document.querySelector("#workHistoryCard");if(!e)return;let t=e.querySelectorAll(".work-entry").length;e.addEventListener("click",a=>{var s;const n=a.target.closest(".remove-work-entry");if(n){(s=n.closest(".work-entry"))==null||s.remove(),J=!0;return}if(a.target.closest("#addWorkEntry")){const i=document.querySelector("#workEntries");if(!i)return;const l=document.createElement("div");l.innerHTML=Tt(t++,{}),i.appendChild(l.firstElementChild),J=!0}})}function ts(){return[...document.querySelectorAll(".work-entry")].map(e=>{const t=a=>{var n,s;return((s=(n=e.querySelector(`[data-field="${a}"]`))==null?void 0:n.value)==null?void 0:s.trim())||""};return{title:t("title"),company:t("company"),from:t("from"),to:t("to")}}).filter(e=>e.title||e.company)}function as(){const e=document.querySelector("#langCard");if(!e)return;let t=e.querySelectorAll(".lang-entry").length;e.addEventListener("click",a=>{var s;const n=a.target.closest(".remove-lang-entry");if(n){(s=n.closest(".lang-entry"))==null||s.remove(),J=!0;return}if(a.target.closest("#addLangEntry")){const i=document.querySelector("#langEntries");if(!i)return;const l=document.createElement("div");l.innerHTML=Nt(t++,{}),i.appendChild(l.firstElementChild),J=!0}})}function ns(){return[...document.querySelectorAll(".lang-entry")].map(e=>{const t=a=>{var n,s;return((s=(n=e.querySelector(`[data-field="${a}"]`))==null?void 0:n.value)==null?void 0:s.trim())||""};return{name:t("name"),level:t("level")}}).filter(e=>e.name)}function ss(){const e=document.querySelector("#certCard");if(!e)return;let t=e.querySelectorAll(".cert-entry").length;e.addEventListener("click",a=>{var s;const n=a.target.closest(".remove-cert-entry");if(n){(s=n.closest(".cert-entry"))==null||s.remove(),J=!0;return}if(a.target.closest("#addCertEntry")){const i=document.querySelector("#certEntries");if(!i)return;const l=document.createElement("div");l.innerHTML=Mt(t++,{}),i.appendChild(l.firstElementChild),J=!0}})}function is(){return[...document.querySelectorAll(".cert-entry")].map(e=>{const t=a=>{var n,s;return((s=(n=e.querySelector(`[data-field="${a}"]`))==null?void 0:n.value)==null?void 0:s.trim())||""};return{name:t("name"),issuer:t("issuer"),date:t("date")}}).filter(e=>e.name)}function os(){var n,s,i,l,r,d;const e=document.querySelector("#profileForm"),t=e==null?void 0:e.querySelector('input[name="profileCv"]');if(!e||!t)return;((n=e.querySelector('input[name="mode"]'))==null?void 0:n.value)==="onboarding"&&!((i=(s=o.candidate)==null?void 0:s.skills)!=null&&i.length)&&!((r=(l=o.candidate)==null?void 0:l.workHistory)!=null&&r.length)&&!((d=o.candidate)!=null&&d.name)?rs(e,t):ls(t)}function rs(e,t){var l;const a=document.querySelector("#profileCvCard");if(!a)return;const n=[...e.children].filter(r=>r!==a&&r.type!=="hidden"&&r.getAttribute("name")!=="mode");n.forEach(r=>{r.style.display="none"});const s=document.createElement("p");s.id="cvGatePrompt",s.style.cssText="font-size:13px;color:var(--mid);margin:10px 0 4px;text-align:center;",s.innerHTML=`Upload your CV and we'll fill in the rest for you — or <button type="button" id="skipCvParse" style="background:none;border:none;padding:0;font-size:13px;color:var(--green);cursor:pointer;text-decoration:underline;">skip and fill in manually</button>`,a.insertAdjacentElement("afterend",s);function i(){var r,d;(r=document.querySelector("#cvGatePrompt"))==null||r.remove(),(d=document.querySelector("#cvParseLoading"))==null||d.remove(),n.forEach(c=>{c.style.display=""})}(l=document.querySelector("#skipCvParse"))==null||l.addEventListener("click",i),t.addEventListener("change",async()=>{var p,u;const r=(p=t.files)==null?void 0:p[0];if(!r)return;(u=document.querySelector("#cvGatePrompt"))==null||u.remove();const d=document.createElement("p");d.id="cvParseLoading",d.style.cssText="font-size:13px;font-weight:600;color:var(--green);padding:14px 0;text-align:center;",d.textContent="Analysing your CV…",a.insertAdjacentElement("afterend",d),ne=null,Ne=!0;const c=await kt(r);i(),c&&(ne=c,cs(c,!0),ds(c,t))})}function ls(e){e.addEventListener("change",async()=>{var r,d,c,p,u,v,h,M,A;const t=(r=e.files)==null?void 0:r[0];if(!t)return;ne=null,Ne=!1,et=null,S({message:"⏳ Analysing your CV — this takes up to 30 seconds…"});const a=await kt(t);if(!a){S({message:"⚠️ Could not read your CV. Check the browser console for details, or try a different file."});return}ne=a,Ne=!0,et=t;const n=o.candidate||{},s={...n,...a.name?{name:a.name}:{},...a.phone?{whatsapp:a.phone,phone:a.phone}:{},...a.summary?{summary:a.summary}:{},skills:(d=a.skills)!=null&&d.length?[...new Set(a.skills.map(Pe).filter(Boolean))]:n.skills||[],workHistory:(c=a.workHistory)!=null&&c.length?a.workHistory:n.workHistory||[],certifications:(p=a.certifications)!=null&&p.length?a.certifications:n.certifications||[],languages:(u=a.languages)!=null&&u.length?a.languages:n.languages||[]},i=[];a.name&&i.push("name"),a.phone&&i.push("phone"),a.summary&&i.push("summary"),(v=a.skills)!=null&&v.length&&i.push(`${a.skills.length} skill${a.skills.length!==1?"s":""}`),(h=a.workHistory)!=null&&h.length&&i.push(`${a.workHistory.length} role${a.workHistory.length!==1?"s":""}`),(M=a.certifications)!=null&&M.length&&i.push(`${a.certifications.length} cert${a.certifications.length!==1?"s":""}`),(A=a.languages)!=null&&A.length&&i.push("languages");const l=i.length?`✓ Pre-filled from CV: ${i.join(", ")}. Review and save your profile.`:"✓ CV analysed. Review your profile and save.";S({candidate:s,message:l})})}function cs(e,t){var n,s,i,l,r;const a=(d,c)=>{const p=document.querySelector(d);p&&c&&t&&(p.value=c)};if(a('input[name="name"]',e.name),a('input[name="whatsapp"]',e.phone),a('textarea[name="summary"]',e.summary),(n=e.skills)!=null&&n.length){const d=document.querySelector("#selectedSkills");if(d){d.innerHTML="";const c=new Set([...d.querySelectorAll('input[name="skills"]')].map(u=>u.value.toLowerCase()));(s=d.querySelector(".skill-empty"))==null||s.remove(),[...new Set(e.skills.map(Pe).filter(Boolean))].forEach(u=>{if(c.has(u.toLowerCase()))return;c.add(u.toLowerCase());const v=document.createElement("span");v.className="selected-skill",v.setAttribute("data-skill-chip",u),v.innerHTML=`${E(u)}<button type="button" class="skill-remove" data-remove-skill="${w(u)}" aria-label="Remove ${w(u)}">×</button><input type="hidden" name="skills" value="${w(u)}" />`,d.appendChild(v)})}}if((i=e.workHistory)!=null&&i.length){const d=document.querySelector("#workEntries");if(d){d.innerHTML="";let c=d.querySelectorAll(".work-entry").length;e.workHistory.forEach(p=>{const u=document.createElement("div");u.innerHTML=Tt(c++,p),d.appendChild(u.firstElementChild)})}}if((l=e.languages)!=null&&l.length){const d=document.querySelector("#langEntries");if(d){d.innerHTML="";let c=d.querySelectorAll(".lang-entry").length;e.languages.forEach(p=>{const u=document.createElement("div");u.innerHTML=Nt(c++,p),d.appendChild(u.firstElementChild)})}}if((r=e.certifications)!=null&&r.length){const d=document.querySelector("#certEntries");if(d){d.innerHTML="";let c=d.querySelectorAll(".cert-entry").length;e.certifications.forEach(p=>{const u=document.createElement("div");u.innerHTML=Mt(c++,p),d.appendChild(u.firstElementChild)})}}Ie()}function ds(e,t){var s,i,l,r,d;const a=[];e.name&&a.push("name"),e.phone&&a.push("phone"),(s=e.skills)!=null&&s.length&&a.push(`${e.skills.length} skill${e.skills.length>1?"s":""}`),(i=e.workHistory)!=null&&i.length&&a.push(`${e.workHistory.length} role${e.workHistory.length>1?"s":""}`),(l=e.certifications)!=null&&l.length&&a.push(`${e.certifications.length} cert${e.certifications.length>1?"s":""}`),(r=e.languages)!=null&&r.length&&a.push("languages"),(d=document.querySelector("#cvParseHint"))==null||d.remove();const n=document.createElement("p");n.id="cvParseHint",n.style.cssText="font-size:12px;color:var(--green);margin:4px 0 0;",n.innerHTML=a.length?`✓ Pre-filled: <strong>${a.join(", ")}</strong>. Review and save.`:"✓ CV analysed. Review your profile and save.",t.insertAdjacentElement("afterend",n)}function va(){var d;const e=document.querySelector("[data-skill-search]");if(!e)return;const t=e.querySelector("#skillSearchInput"),a=e.querySelector("#skillSuggestions"),n=e.querySelector("#selectedSkills"),s=()=>[...n.querySelectorAll('input[name="skills"]')].map(c=>c.value),i=c=>{n.innerHTML=c.length?c.map(p=>`
      <span class="selected-skill" data-skill-chip="${w(p)}">
        ${E(p)}
        <button type="button" class="skill-remove" data-remove-skill="${w(p)}" aria-label="Remove ${w(p)}">×</button>
        <input type="hidden" name="skills" value="${w(p)}" />
      </span>`).join(""):'<span class="skill-empty">Selected skills will appear here.</span>'},l=()=>{const c=Q(t.value),p=t.value.trim(),u=new Set(s().map(Q)),v=Kt.filter(x=>!u.has(Q(x))).filter(x=>!c||Q(x).includes(c)).slice(0,12),h=v.find(x=>Q(x)===c),A=p.length>1&&!u.has(Q(p))&&!h?`<button type="button" class="skill-suggestion add-custom" data-skill="${w(p)}">+ Add "${E(p)}"</button>`:"";a.innerHTML=A+v.map(x=>`<button type="button" class="skill-suggestion" data-skill="${w(x)}">${E(x)}</button>`).join("")},r=c=>{const p=(c||t.value).trim(),u=Pe(p);if(!u)return;const v=Q(u),h=s();if(h.length>=20&&!h.some(A=>Q(A)===v)){t.value="";return}const M=[...h.filter(A=>Q(A)!==v),u];i(M),t.value="",l(),J=!0};t==null||t.addEventListener("input",l),t==null||t.addEventListener("focus",l),t==null||t.addEventListener("keydown",c=>{if(c.key!=="Enter")return;c.preventDefault();const p=Q(t.value),u=[...a.querySelectorAll(".skill-suggestion:not(.add-custom)")].find(v=>Q(v.dataset.skill)===p);r((u==null?void 0:u.dataset.skill)||t.value)}),(d=e.querySelector("#addTypedSkill"))==null||d.addEventListener("click",()=>r(t.value)),a.addEventListener("click",c=>{const p=c.target.closest("[data-skill]");p&&r(p.dataset.skill)}),n.addEventListener("click",c=>{const p=c.target.closest("[data-remove-skill]");if(!p)return;const u=Q(p.dataset.removeSkill);i(s().filter(v=>Q(v)!==u)),l(),J=!0})}function fa(){if(o.loading)return Yn();if(o.view==="reset-password")return rn();if(o.view==="dashboard")return ua();da()}window.addEventListener("popstate",()=>{if(window.location.pathname==="/reset-password"){S({view:"reset-password",resetCodeStatus:null,resetCodeError:""});return}const e=tt();e==="overview"&&!o.user?S({view:"login",activePage:"overview",message:""}):o.view==="dashboard"?Oe(e,!1):je()});const nt=new URLSearchParams(window.location.search).get("ct");nt&&window.history.replaceState({},"",window.location.pathname);let Ke=!!nt;we?(Sa(U,e=>{if(!Ke)if(e)Bt(e);else{try{localStorage.removeItem("nw_talent_applied")}catch{}je()}}),window.setTimeout(()=>{o.loading&&(Ke=!1,je())},2500),nt&&Ja(nt).then(e=>{Ke=!1,Bt(e.user)}).catch(()=>{Ke=!1,je()})):je();
