import{initializeApp as ya}from"https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";import{getAuth as wa,GoogleAuthProvider as ba,signInWithPopup as Sa,getAdditionalUserInfo as Ca,onAuthStateChanged as $a,createUserWithEmailAndPassword as ka,updateProfile as Aa,signInWithEmailAndPassword as xa,signOut as It}from"https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";import{getFirestore as Pa,query as le,collection as ne,where as ce,limit as de,getDocs as ue,getDoc as ke,doc as U,setDoc as J,serverTimestamp as z,onSnapshot as Ea,updateDoc as La,addDoc as Dt,arrayUnion as dt}from"https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";import{getStorage as Ta,ref as ut,uploadBytes as Ot,getDownloadURL as jt,deleteObject as Na}from"https://www.gstatic.com/firebasejs/10.12.5/firebase-storage.js";(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))n(s);new MutationObserver(s=>{for(const i of s)if(i.type==="childList")for(const r of i.addedNodes)r.tagName==="LINK"&&r.rel==="modulepreload"&&n(r)}).observe(document,{childList:!0,subtree:!0});function a(s){const i={};return s.integrity&&(i.integrity=s.integrity),s.referrerPolicy&&(i.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?i.credentials="include":s.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function n(s){if(s.ep)return;s.ep=!0;const i=a(s);fetch(s.href,i)}})();const zt={apiKey:"AIzaSyApRNyW8PoP28E0x77dUB5jOgHuTqA2by4",authDomain:"nearwork-97e3c.firebaseapp.com",projectId:"nearwork-97e3c",storageBucket:"nearwork-97e3c.firebasestorage.app",messagingSenderId:"145642656516",appId:"1:145642656516:web:0ac2da8931283121e87651",measurementId:"G-3LC8N6FFSH"},ye=Object.values(zt).slice(0,6).every(Boolean),be=ye?ya(zt):null,O=be?wa(be):null,T=be?Pa(be):null,Ye=be?Ta(be):null,Ma=be?new ba:null,N={users:"users",candidates:"candidates",openings:"openings",pipelines:"pipelines",applications:"applications",assessments:"assessments",activity:"candidateActivity",notifications:"notifications",notificationPreferences:"notificationPreferences"},Ht="/api/send-email-proxy";function V(){if(!be||!O||!T||!Ye)throw new Error("Missing Firebase environment variables. Copy .env.example to .env.local and fill in the Admin app config.")}async function Gt(e={}){var i,r;const t=String(e.email||((i=O==null?void 0:O.currentUser)==null?void 0:i.email)||"").trim().toLowerCase();if(!t)return{ok:!1,skipped:!0,reason:"Missing candidate email"};const a=e.name||((r=O==null?void 0:O.currentUser)==null?void 0:r.displayName)||"",n=e.firstName||a.split(/\s+/)[0]||"there",s=await fetch(Ht,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({to:t,templateId:"account_created",data:{name:a||n,firstName:n,actionUrl:"https://talent.nearwork.co"}})});return s.json().catch(()=>({ok:s.ok}))}async function qa(e={},t={}){var r,d;const a=String((e==null?void 0:e.email)||((r=O==null?void 0:O.currentUser)==null?void 0:r.email)||"").trim().toLowerCase();if(!a)return{ok:!1,skipped:!0,reason:"Missing candidate email"};const n=(e==null?void 0:e.name)||((d=O==null?void 0:O.currentUser)==null?void 0:d.displayName)||"",s=(e==null?void 0:e.firstName)||n.split(/\s+/)[0]||"there",i=await fetch(Ht,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({to:a,templateId:"job_applied",data:{name:n||s,firstName:s,roleTitle:t.title||t.role||t.openingTitle||"this role",openingCode:t.code||t.id||"",actionUrl:"https://talent.nearwork.co"}})});return i.json().catch(()=>({ok:i.ok}))}async function Vt(e){V();const t=await ke(U(T,N.users,e));return t.exists()?{id:t.id,...t.data()}:null}async function Ia(e){V();const t=String(e||"").trim(),a=t.toLowerCase(),n=le(ne(T,N.users),ce("email","==",a),de(1)),s=await ue(n);if(!s.empty)return{id:s.docs[0].id,...s.docs[0].data()};if(t===a)return null;const i=le(ne(T,N.users),ce("email","==",t),de(1)),r=await ue(i);return r.empty?null:{id:r.docs[0].id,...r.docs[0].data()}}async function Qt(e){const t=await Vt(e.uid);if(t)return t;const a=await Ia(e.email);return a?(await ht(e.uid,{...a,email:e.email,connectedFromUserId:a.id}),{...a,id:e.uid,connectedFromUserId:a.id}):null}async function Jt(e,t,a){const n=await ke(U(T,N.candidates,t)).catch(()=>null),s=n!=null&&n.exists()?n.data():{};return yt(e,{...s,...a,candidateCode:t})}async function ht(e,t){V();const a=t.candidateCode||qe(e),n={...t,candidateCode:a,role:"candidate",updatedAt:z()};await J(U(T,N.users,e),n,{merge:!0}),await J(U(T,N.candidates,a),await Jt(e,a,{...n,candidateCode:a}),{merge:!0}).catch(()=>null),t.marketingConsent===!0&&bt({...n,candidateCode:a,source:"talent.nearwork.co"}).catch(()=>null)}function qe(e){return`CAND-${String(e||"").replace(/[^a-z0-9]/gi,"").slice(0,8).toUpperCase()||Date.now()}`}function Da(e){return String(e||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"")}function yt(e,t){const a=t.candidateCode||qe(e),n=t.location||[t.locationCity||t.city,t.locationDepartment||t.department].filter(Boolean).join(", "),s=new Date().toISOString().slice(0,10);return{code:a,uid:e,ownerUid:e,name:t.name||"Talent member",role:t.targetRole||t.headline||"Nearwork candidate",skills:Array.isArray(t.skills)?t.skills:[],applied:t.applied||s,lastContact:t.lastContact||s,experience:Number(t.experience||0),location:n,city:Da(t.locationCity||t.city||n),department:t.locationDepartment||t.department||"",country:t.locationCountry||"Colombia",source:"talent.nearwork.co",status:t.status||"active",score:Number(t.score||50),email:t.email||"",phone:t.whatsapp||t.phone||"",whatsapp:t.whatsapp||t.phone||"",currentRole:t.currentRole||"",salary:t.salary||"",salaryUSD:Number(t.salaryUSD||0)||null,salaryAmount:Number(t.salaryAmount||t.expectedSalaryAmount||0)||null,salaryCurrency:t.salaryCurrency||t.expectedSalaryCurrency||"USD",expectedSalaryUSD:Number(t.expectedSalaryUSD||0)||null,expectedSalaryCOP:Number(t.expectedSalaryCOP||0)||null,expectedSalaryAmount:Number(t.expectedSalaryAmount||t.salaryAmount||0)||null,expectedSalaryCurrency:t.expectedSalaryCurrency||t.salaryCurrency||"USD",expectedSalary:t.expectedSalary||t.salary||"",availability:t.availability||"open",english:t.english||"",visa:t.visa||"No",linkedin:t.linkedin||"",cv:t.activeCvName||"",cvUrl:t.cvUrl||null,photoUrl:t.photoURL||t.photoUrl||null,tags:t.tags||["talent profile"],notes:t.summary||"",summary:t.summary||"",workHistory:Array.isArray(t.workHistory)?t.workHistory:[],languages:Array.isArray(t.languages)?t.languages:[],certifications:Array.isArray(t.certifications)?t.certifications:[],appliedBefore:!!t.appliedBefore,applications:t.applications||[],pipelineCodes:t.pipelineCodes||[],loom:t.loom||"Not uploaded",assessments:t.assessments||[],work:t.work||[],updatedAt:z()}}async function _a(e=!1){var u;V();const t=await Sa(O,Ma),a=((u=Ca(t))==null?void 0:u.isNewUser)===!0,n=await Qt(t.user),s=new Date().toISOString(),i={email:t.user.email,name:t.user.displayName||"",availability:"open",onboarded:!1,privacyConsent:!0,privacyConsentAt:s,marketingConsent:e,marketingConsentAt:e?s:null},r=!n;r&&await ht(t.user.uid,i),a&&Gt(i).catch(()=>null);const d=qe(t.user.uid),c={...n||i,candidateCode:d};return await J(U(T,N.candidates,d),yt(t.user.uid,c),{merge:!0}).catch(()=>null),(r?e:(n==null?void 0:n.marketingConsent)===!0)&&bt({...c,candidateCode:d,source:"talent.nearwork.co"}).catch(()=>null),t.user}async function Ra(e){V();const t=le(ne(T,N.applications),ce("candidateId","==",e),de(20)),a=le(ne(T,N.applications),ce("ownerUid","==",e),de(20)),n=await Promise.allSettled([ue(t),ue(a)]),s=new Map;return n.forEach(i=>{i.status==="fulfilled"&&i.value.docs.forEach(r=>s.set(r.id,{id:r.id,...r.data()}))}),Array.from(s.values()).sort((i,r)=>{const d=c=>{var l,u;return((u=(l=c==null?void 0:c.toDate)==null?void 0:l.call(c))==null?void 0:u.getTime())??(c?new Date(c).getTime():0)};return d(r.updatedAt||r.createdAt)-d(i.updatedAt||i.createdAt)})}async function Ua(e,t="",a=""){V();const n=String(t||"").trim().toLowerCase(),s=String(a||"").trim(),i=[ue(le(ne(T,N.assessments),ce("candidateUid","==",e),de(25))),ue(le(ne(T,N.assessments),ce("candidateId","==",e),de(25)))];n&&i.push(ue(le(ne(T,N.assessments),ce("candidateEmail","==",n),de(25)))),s&&i.push(ue(le(ne(T,N.assessments),ce("candidateCode","==",s),de(25))));const r=await Promise.allSettled(i),d=new Map;return r.forEach(c=>{c.status==="fulfilled"&&c.value.docs.forEach(l=>d.set(l.id,{id:l.id,...l.data()}))}),Array.from(d.values()).sort((c,l)=>{const u=p=>{var v,S;return((S=(v=p==null?void 0:p.toDate)==null?void 0:v.call(p))==null?void 0:S.getTime())??(p?new Date(p).getTime():0)};return u(l.updatedAt||l.createdAt||l.sentAt)-u(c.updatedAt||c.createdAt||c.sentAt)})}async function Ba(e,t,a="",n=""){V();const s=await ke(U(T,N.assessments,e));if(!s.exists())return null;const i={id:s.id,...s.data()},r=String(a||"").trim().toLowerCase(),d=String(n||"").trim();return i.candidateUid===t||i.candidateId===t||String(i.candidateEmail||"").trim().toLowerCase()===r||String(i.candidateCode||"").trim()===d?i:null}async function Fa(e,t){V();const a=await ke(U(T,N.assessments,e)),n=a.exists()?a.data():{};if(n.status==="completed")throw new Error("This assessment is already completed.");if(n.expiresAt&&Date.now()>new Date(n.expiresAt).getTime())throw new Error("This assessment link has expired.");await J(U(T,N.assessments,e),{status:"started",currentQuestionIndex:Number(n.currentQuestionIndex||0),currentStage:Number(n.currentStage||1),technicalStartedAt:n.technicalStartedAt||z(),startedAt:n.startedAt||z(),updatedAt:z()},{merge:!0})}async function Be(e,t,a,n={}){V();const s=await ke(U(T,N.assessments,e)),i=s.exists()?s.data():{};if(i.status==="completed")throw new Error("This assessment is already completed.");if(i.expiresAt&&Date.now()>new Date(i.expiresAt).getTime())throw new Error("This assessment link has expired.");await J(U(T,N.assessments,e),{[`answers.${t}`]:a,progress:`${n.currentQuestionIndex||0}/${n.totalQuestions||""}`.replace(/\/$/,""),currentQuestionIndex:n.currentQuestionIndex||0,currentStage:n.currentStage||1,...n.discStartedAt?{discStartedAt:n.discStartedAt}:{},updatedAt:z()},{merge:!0})}async function Oa(e,t,a={}){var v;V();const n=U(T,N.assessments,e),s=await ke(n),i=s.exists()?s.data():{};if(i.status==="completed")throw new Error("This assessment is already completed.");if(i.expiresAt&&Date.now()>new Date(i.expiresAt).getTime())throw new Error("This assessment link has expired.");const r=Object.values(t||{}).filter(S=>String((S==null?void 0:S.value)??S??"").trim()).length,d=Number(a.totalQuestions||Object.keys(t||{}).length||0),c=Number(a.technicalScore||0),l=Number(a.discScore||0),u=Number(a.score||(d?Math.round(r/d*100):0));await J(n,{answers:t,answeredCount:r,totalQuestions:d,score:u,technical:c||u,disc:((v=a.discProfile)==null?void 0:v.label)||(l?`${l}%`:"Submitted"),discScore:l,discProfile:a.discProfile||null,progress:`${r}/${d}`,status:"completed",finished:new Date().toLocaleString("en-US",{month:"short",day:"numeric",year:"numeric",hour:"numeric",minute:"2-digit"}),finishedAt:z(),updatedAt:z()},{merge:!0});const p=Math.round(u);i.candidateUid&&await J(U(T,N.users,i.candidateUid),{score:p,nwScore:p,lastAssessmentScore:p,lastAssessmentId:e,updatedAt:z()},{merge:!0}).catch(()=>null),i.candidateCode&&await J(U(T,N.candidates,i.candidateCode),{score:p,nwScore:p,lastAssessmentScore:p,lastAssessmentId:e,updatedAt:z()},{merge:!0}).catch(()=>null)}async function Wt(){V();const e=le(ne(T,N.openings),ce("published","==",!0),de(12));return(await ue(e)).docs.map(a=>({id:a.id,...a.data()}))}async function ja(e,t){V();const a=t.code||t.id,n=await Vt(e).catch(()=>null),s=(n==null?void 0:n.candidateCode)||qe(e),i=new Date().toISOString().slice(0,10),r={opening:a,openingCode:a,jobId:a,role:t.title||t.role||"Untitled role",openingTitle:t.title||t.role||"Untitled role",applied:i,appliedAt:i,status:"applied",outcome:"Application only",source:"talent.nearwork.co"},d={candidateId:e,ownerUid:e,authUid:e,candidateDocId:s,candidateCode:s,candidateEmail:(n==null?void 0:n.email)||"",candidateName:(n==null?void 0:n.name)||"",openingCode:a,jobId:a,openingTitle:t.title||t.role||"Untitled role",jobTitle:t.title||t.role||"Untitled role",title:t.title||t.role||"Untitled role",clientName:t.orgName||t.clientName||t.company||"Nearwork client",status:"applied",inPipeline:!1,isMockData:!1,source:"talent.nearwork.co",createdAt:z(),updatedAt:z()};await Dt(ne(T,N.applications),d),await J(U(T,N.candidates,s),{...yt(e,{...n||{},candidateCode:s,appliedBefore:!0,lastContact:i}),applications:dt(r),appliedBefore:!0},{merge:!0}).catch(()=>null),await J(U(T,N.users,e),{role:"candidate",candidateCode:s,code:s,applications:dt(r),lastAppliedOpeningCode:a,lastAppliedAt:z(),updatedAt:z()},{merge:!0}).catch(()=>null),await Dt(ne(T,N.activity),{candidateId:e,type:"application_submitted",title:d.jobTitle,createdAt:z()}).catch(()=>null),qa(n,t).catch(()=>null)}async function za(e,t){await La(U(T,N.users,e),{availability:t,updatedAt:z()})}async function wt(e,t){V();const a=t.candidateCode||qe(e);await J(U(T,N.users,e),{...t,candidateCode:a,role:"candidate",updatedAt:z()},{merge:!0});try{return await J(U(T,N.candidates,a),await Jt(e,a,{...t,candidateCode:a}),{merge:!0}),t.marketingConsent===!0&&bt({...t,candidateCode:a,source:"talent.nearwork.co"}).catch(()=>null),{candidateCode:a,atsSynced:!0}}catch(n){return console.warn("Candidate ATS sync failed.",n),{candidateCode:a,atsSynced:!1}}}async function Ha(){var n;V();const e=await((n=O.currentUser)==null?void 0:n.getIdToken());if(!e)throw new Error("You must be signed in to delete your account.");const t=await fetch("/api/delete-account",{method:"POST",headers:{Authorization:`Bearer ${e}`}}),a=await t.json().catch(()=>({}));if(!t.ok||!a.ok)throw new Error(a.error||"Failed to delete account.");return a}async function Ga(e){const t=await fetch("/api/send-reset",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:e,continueUrl:`${window.location.origin}/reset-password`})}),a=await t.json().catch(()=>({}));if(!t.ok||!a.ok)throw new Error(a.error||"Failed to send the reset email.");return a}async function bt(e){var s,i;const t=(e==null?void 0:e.email)||((s=O.currentUser)==null?void 0:s.email)||"";if(!t)return{ok:!1,skipped:!0};const a=await((i=O.currentUser)==null?void 0:i.getIdToken().catch(()=>""));return(await fetch("/api/sync-hubspot-candidate",{method:"POST",headers:{"Content-Type":"application/json",...a?{Authorization:`Bearer ${a}`}:{}},body:JSON.stringify({candidate:{...e,email:t}})})).json().catch(()=>({ok:!1}))}async function Va(e,t){V();const a=t.name.replace(/[^a-z0-9._-]/gi,"-").toLowerCase(),n=`candidate-photos/${e}/${Date.now()}-${a}`,s=ut(Ye,n);await Ot(s,t,{contentType:t.type||"application/octet-stream"});const i=await jt(s);return await J(U(T,N.users,e),{photoURL:i,updatedAt:z()},{merge:!0}),i}async function pt(e,t,a){V();let n=null,s=qe(e);try{const u=await ke(U(T,N.users,e));if(u.exists()){const p=u.data();n=p.activeCvId||null,p.candidateCode&&(s=p.candidateCode)}}catch{}const i=t.name.replace(/[^a-z0-9._-]/gi,"-").toLowerCase(),r=`candidate-cvs/${e}/${Date.now()}-${i}`,d=ut(Ye,r);await Ot(d,t,{contentType:t.type||"application/octet-stream"});const c=await jt(d),l={id:r,name:a||t.name,fileName:t.name,url:c,uploadedAt:new Date().toISOString()};return await J(U(T,N.users,e),{cvLibrary:dt(l),activeCvId:l.id,activeCvName:l.name||l.fileName,cvUrl:c,updatedAt:z()},{merge:!0}),J(U(T,N.candidates,s),{cvUrl:c,activeCvId:l.id,activeCvName:l.name||l.fileName,updatedAt:z()},{merge:!0}).catch(()=>null),n&&n!==r&&Na(ut(Ye,n)).catch(()=>{}),l}function Qa(e,t){if(V(),!e)return()=>{};const a=le(ne(T,N.notifications),ce("recipientUid","==",e),de(50));return Ea(a,n=>{const s=n.docs.map(i=>({id:i.id,...i.data()})).sort((i,r)=>{var l,u;const d=(l=i.createdAt)!=null&&l.toDate?i.createdAt.toDate().getTime():new Date(i.createdAt||0).getTime();return((u=r.createdAt)!=null&&u.toDate?r.createdAt.toDate().getTime():new Date(r.createdAt||0).getTime())-d});t(s)})}async function Ja(e){V(),e&&await J(U(T,N.notifications,e),{read:!0,readAt:z()},{merge:!0})}async function Wa(e,t){V(),await J(U(T,N.notificationPreferences,e),{uid:e,app:"talent.nearwork.co",preferences:t,updatedAt:z()},{merge:!0})}async function St(e){var t;if(!e)return null;try{const a=await new Promise((x,A)=>{const E=new FileReader;E.onload=()=>x(E.result.split(",")[1]),E.onerror=A,E.readAsDataURL(e)}),n=await((t=O.currentUser)==null?void 0:t.getIdToken().catch(()=>""))??"",s=await fetch("/api/parse-cv",{method:"POST",headers:{"Content-Type":"application/json",...n?{Authorization:`Bearer ${n}`}:{}},body:JSON.stringify({data:a,filename:e.name,mimeType:e.type||"application/octet-stream"})});if(!s.ok)return null;const i=await s.json();if(!(i!=null&&i.ok))return null;const{name:r,phone:d,city:c,summary:l,skills:u,workHistory:p,languages:v,certifications:S}=i;return{name:r,phone:d,city:c,summary:l,skills:u,workHistory:p,languages:v||[],certifications:S||[]}}catch{return null}}let ae=null,Te=!1,Ze=null,Ct=1,P={},ie=null,je=null,_=null,Ke=!1,W=!1,re=null;const $t=document.querySelector("#app"),Ya="+573135928691",Za="https://wa.me/573135928691",Me={"Customer Success":["Customer Success Manager","Customer Success Associate","Account Manager","Technical Account Manager","Client Success Specialist","Implementation Specialist","Onboarding Specialist","Renewals Manager"],Sales:["SDR / Sales Development Rep","BDR / Business Development Rep","Account Executive","Inside Sales Representative","Channel Sales Manager","Sales Operations Specialist","Revenue Operations Specialist","Sales Manager"],Support:["Technical Support Specialist","Customer Support Representative","Help Desk Technician","Escalations Specialist","Support Team Lead","QA Support Analyst"],Operations:["Operations Manager","Operations Analyst","Executive Assistant","Administrative Assistant","Virtual Assistant","Office Manager","Project Coordinator","Procurement Specialist","Logistics Coordinator","Recruiting Coordinator"],Marketing:["Marketing Ops / Content Specialist","Content Writer","SEO Specialist","Email Marketing Specialist","Lifecycle Marketing Specialist","Social Media Manager","Graphic Designer","Growth Marketing Specialist"],Engineering:["Software Developer (Full Stack)","Frontend Developer","Backend Developer","Mobile Developer","DevOps Engineer","No-Code Developer","Data Analyst","Data Engineer","QA Engineer","Product Manager"],Finance:["Bookkeeper","Accounting Assistant","Accounts Payable / Receivable Specialist","Financial Analyst","FP&A Analyst","Payroll Specialist","Tax Analyst"],"Human Resources":["HR Generalist","Recruiter / Talent Sourcer","People Operations Specialist","Payroll & Benefits Coordinator","Learning & Development Coordinator"],"Healthcare & Insurance":["Insurance Account Manager","Claims Specialist","Medical Billing Specialist","Healthcare Virtual Assistant","Patient Coordinator"],Other:["Other / Not Listed"]},Ka={"CRM & Sales":["HubSpot","Salesforce","Pipedrive","Apollo","Outbound","Cold Email","Discovery Calls","CRM Hygiene"],"Customer Success":["SaaS","Customer Success","QBRs","Onboarding","Renewals","Expansion","Churn Reduction","Intercom","Zendesk"],Support:["Technical Support","Tickets","Troubleshooting","APIs","Bug Reproduction","Help Center","CSAT"],Operations:["Excel","Google Sheets","Reporting","Process Design","Project Management","Notion","Airtable","Zapier"],Marketing:["Content","SEO","Lifecycle","Email Marketing","HubSpot Marketing","Copywriting","Analytics"],Engineering:["JavaScript","React","Node.js","SQL","Python","REST APIs","QA","GitHub"],Language:["English B2","English C1","English C2","Spanish Native"]},Xa=["Account Management","Accounts Payable","Accounts Receivable","Adobe Creative Suite","Agile","AI Tools","Analytics","Appointment Setting","B2B Sales","B2C Sales","Billing","Bookkeeping","Business Analysis","Canva","Cash Collections","Chat Support","Cold Calling","Community Management","Compliance","Content Strategy","Contract Management","Customer Onboarding","Customer Retention","Customer Service","Data Analysis","Data Entry","Email Support","Excel / Google Sheets","Executive Assistance","Figma","Financial Reporting","Forecasting","Helpdesk","HR Operations","Inbound Calls","Insurance Support","Lead Generation","Live Chat","Logistics","Looker","Microsoft Office","NetSuite","Outbound Calls","Payroll","Performance Marketing","Power BI","Product Support","QuickBooks","Recruiting","Salesforce Administration","Sales Operations","Shopify","Slack","Social Media","SQL Reporting","Stripe","Tableau","Technical Writing","Ticket Quality","Training","Vendor Management","WordPress","Workday","Workforce Management","Zendesk Guide","Zoho"],Yt=[...new Set([...Object.values(Ka).flat(),...Xa])].sort((e,t)=>e.localeCompare(t)),pe={Amazonas:["El Encanto","La Chorrera","La Pedrera","La Victoria","Leticia","Miriti - Paraná","Puerto Alegría","Puerto Arica","Puerto Nariño","Puerto Santander","Tarapacá"],Antioquia:["Abejorral","Abriaquí","Alejandría","Amagá","Amalfi","Andes","Angelópolis","Angostura","Anorí","Anza","Apartadó","Arboletes","Argelia","Armenia","Barbosa","Bello","Belmira","Betania","Betulia","Briceño","Buriticá","Cáceres","Caicedo","Caldas","Campamento","Cañasgordas","Caracolí","Caramanta","Carepa","Carmen de Viboral","Carolina","Caucasia","Chigorodó","Cisneros","Ciudad Bolívar","Cocorná","Concepción","Concordia","Copacabana","Dabeiba","Don Matías","Ebéjico","El Bagre","Entrerríos","Envigado","Fredonia","Frontino","Giraldo","Girardota","Gómez Plata","Granada","Guadalupe","Guarne","Guatapé","Heliconia","Hispania","Itagüí","Ituango","Jardín","Jericó","La Ceja","La Estrella","La Pintada","La Unión","Liborina","Maceo","Marinilla","Medellín","Montebello","Murindó","Mutata","Nariño","Nechí","Necoclí","Olaya","Peñol","Peque","Pueblorrico","Puerto Berrío","Puerto Nare","Puerto Triunfo","Remedios","Retiro","Rionegro","Sabanalarga","Sabaneta","Salgar","San Andrés","San Carlos","San Francisco","San Jerónimo","San José de la Montaña","San Juan de Urabá","San Luis","San Pedro","San Pedro de Urabá","San Rafael","San Roque","San Vicente","Santa Bárbara","Santa Rosa de Osos","Santafé de Antioquia","Santo Domingo","Santuario","Segovia","Sonsón","Sopetrán","Támesis","Tarazá","Tarso","Titiribí","Toledo","Turbo","Uramita","Urrao","Valdivia","Valparaíso","Vegachí","Venecia","Vigía del Fuerte","Yalí","Yarumal","Yolombó","Yondó","Zaragoza"],Arauca:["Arauca","Arauquita","Cravo Norte","Fortul","Puerto Rondón","Saravena","Tame"],Atlántico:["Baranoa","Barranquilla","Campo de la Cruz","Candelaria","Galapa","Juan de Acosta","Luruaco","Malambo","Manatí","Palmar de Varela","Piojó","Polonuevo","Ponedera","Puerto Colombia","Repelón","Sabanagrande","Sabanalarga","Santa Lucía","Santo Tomás","Soledad","Suan","Tubara","Usiacurí"],"Bogotá D.C.":["Bogotá"],Bolívar:["Achí","Altos del Rosario","Arenal","Arjona","Arroyohondo","Barranco de Loba","Calamar","Cantagallo","Carmen de Bolívar","Cartagena","Cicuco","Clemencia","Córdoba","El Guamo","El Peñón","Hatillo de Loba","Magangué","Mahates","Margarita","María la Baja","Mompós","Montecristo","Morales","Pinillos","Regidor","Río Viejo","San Cristóbal","San Estanislao","San Fernando","San Jacinto","San Jacinto del Cauca","San Juan Nepomuceno","San Martín de Loba","San Pablo","Santa Catalina","Santa Rosa de Lima","Santa Rosa del Sur","Simití","Soplaviento","Talaigua Nuevo","Tiquisio","Turbaco","Turbana","Villanueva","Zambrano"],Boyacá:["Almeida","Aquitania","Arcabuco","Belén","Berbeo","Betéitiva","Boavita","Boyacá","Briceño","Buenavista","Busbanzá","Caldas","Campohermoso","Cerinza","Chinavita","Chiquinquirá","Chíquiza","Chiscas","Chita","Chitaraque","Chivatá","Chivor","Ciénega","Cómbita","Coper","Corrales","Covarachía","Cubará","Cucaita","Cuítiva","Duitama","El Cocuy","El Espino","Firavitoba","Floresta","Gachantivá","Gameza","Garagoa","Guacamayas","Guateque","Guayatá","Güicán","Iza","Jenesano","Jericó","La Capilla","La Uvita","La Victoria","Labranzagrande","Macanal","Maripí","Miraflores","Mongua","Monguí","Moniquirá","Motavita","Muzo","Nobsa","Nuevo Colón","Oicatá","Otanche","Pachavita","Páez","Paipa","Pajarito","Panqueba","Pauna","Paya","Paz de Río","Pesca","Pisba","Puerto Boyacá","Quípama","Ramiriquí","Ráquira","Rondón","Saboyá","Sáchica","Samacá","San Eduardo","San José de Pare","San Luis de Gaceno","San Mateo","San Miguel de Sema","San Pablo Borbur","Santa María","Santa Rosa de Viterbo","Santa Sofía","Santana","Sativanorte","Sativasur","Siachoque","Soatá","Socha","Socotá","Sogamoso","Somondoco","Sora","Soracá","Sotaquirá","Susacón","Sutamarchán","Sutatenza","Tasco","Tenza","Tibaná","Tibasosa","Tinjacá","Tipacoque","Toca","Togüí","Tópaga","Tota","Tunja","Tununguá","Turmequé","Tuta","Tutazá","Umbita","Ventaquemada","Villa de Leyva","Viracachá","Zetaquira"],Caldas:["Aguadas","Anserma","Aranzazu","Belalcázar","Chinchiná","Filadelfia","La Dorada","La Merced","Manizales","Manzanares","Marmato","Marquetalia","Marulanda","Neira","Norcasia","Pácora","Palestina","Pensilvania","Riosucio","Risaralda","Salamina","Samaná","San José","Supía","Victoria","Villamaría","Viterbo"],Caquetá:["Albania","Belén de los Andaquíes","Cartagena del Chairá","Currillo","El Doncello","El Paujil","Florencia","La Montañita","Milán","Morelia","Puerto Rico","San José del Fragua","San Vicente del Caguán","Solano","Solita","Valparaiso"],Casanare:["Aguazul","Chameza","Hato Corozal","La Salina","Maní","Monterrey","Nunchía","Orocué","Paz de Ariporo","Pore","Recetor","Sabanalarga","Sácama","San Luis de Palenque","Támara","Tauramena","Trinidad","Villanueva","Yopal"],Cauca:["Almaguer","Argelia","Balboa","Bolívar","Buenos Aires","Cajibío","Caldono","Caloto","Corinto","El Tambo","Florencia","Guapi","Inzá","Jambalo","La Sierra","La Vega","Lopez","Mercaderes","Miranda","Morales","Padilla","Paez","Patia","Piamonte","Piendamo","Popayán","Puerto Tejada","Purace","Rosas","San Sebastian","Santa Rosa","Santander de Quilichao","Silvia","Sotara","Suarez","Sucre","Timbio","Timbiqui","Toribio","Totoro","Villa Rica"],Cesar:["Aguachica","Agustín Codazzi","Astrea","Becerril","Bosconia","Chimichagua","Chiriguaná","Curumaní","El Copey","El Paso","Gamarra","González","La Gloria","La Jagua de Ibirico","La Paz","Manaure","Pailitas","Pelaya","Pueblo Bello","Río de Oro","San Alberto","San Diego","San Martín","Tamalameque","Valledupar"],Chocó:["Acandí","Alto Baudó","Atrato","Bagadó","Bahía Solano","Bajo Baudó","Belén de Bajirá","Bojayá","Cantón de San Pablo","Carmen del Darién","Cértegui","Condoto","El Carmen de Atrato","El Litoral del San Juan","Istmina","Juradó","Lloró","Medio Atrato","Medio Baudó","Medio San Juan","Nóvita","Nuquí","Quibdó","Río Iró","Río Quito","Riosucio","San José del Palmar","Sipí","Tadó","Unguía","Unión Panamericana"],Córdoba:["Ayapel","Buenavista","Canalete","Cereté","Chimá","Chinú","Ciénaga de Oro","Cotorra","La Apartada","Lorica","Los Córdobas","Momil","Moñitos","Montelíbano","Montería","Planeta Rica","Pueblo Nuevo","Puerto Escondido","Puerto Libertador","Purísima","Sahagún","San Andrés de Sotavento","San Antero","San Bernardo del Viento","San Carlos","San Pelayo","Tierralta","Valencia"],Cundinamarca:["Agua de Dios","Albán","Anapoima","Anolaima","Apulo","Arbeláez","Beltrán","Bituima","Bojacá","Cabrera","Cachipay","Cajicá","Caparrapí","Cáqueza","Carmen de Carupa","Chaguaní","Chía","Chipaque","Choachí","Chocontá","Cogua","Cota","Cucunubá","El Colegio","El Peñón","El Rosal","Facatativá","Fomeque","Fosca","Funza","Fúquene","Fusagasugá","Gachala","Gachancipá","Gachetá","Gama","Girardot","Granada","Guachetá","Guaduas","Guasca","Guataquí","Guatavita","Guayabal de Síquima","Guayabetal","Gutiérrez","Jerusalén","Junín","La Calera","La Mesa","La Palma","La Peña","La Vega","Lenguazaque","Macheta","Madrid","Manta","Medina","Mosquera","Nariño","Nemocón","Nilo","Nimaima","Nocaima","Pacho","Paime","Pandi","Paratebueno","Pasca","Puerto Salgar","Puli","Quebradanegra","Quetame","Quipile","Ricaurte","San Antonio de Tequendama","San Bernardo","San Cayetano","San Francisco","San Juan de Rioseco","Sasaima","Sesquilé","Sibaté","Silvania","Simijaca","Soacha","Sopó","Subachoque","Suesca","Supatá","Susa","Sutatausa","Tabio","Tausa","Tena","Tenjo","Tibacuy","Tibirita","Tocaima","Tocancipá","Topaipí","Ubalá","Ubaque","Ubaté","Une","Útica","Venecia","Vergara","Vianí","Villagómez","Villapinzón","Villeta","Viotá","Yacopí","Zipacón","Zipaquirá"],Guainía:["Barranco Minas","Cacahual","Inírida","La Guadalupe","Mapiripana","Morichal","Pana Pana","Puerto Colombia","San Felipe"],Guaviare:["Calamar","El Retorno","Miraflores","San José del Guaviare"],Huila:["Acevedo","Agrado","Aipe","Algeciras","Altamira","Baraya","Campoalegre","Colombia","Elías","Garzón","Gigante","Guadalupe","Hobo","Iquira","Isnos","La Argentina","La Plata","Nátaga","Neiva","Oporapa","Paicol","Palermo","Palestina","Pital","Pitalito","Rivera","Saladoblanco","San Agustín","Santa María","Suaza","Tarqui","Tello","Teruel","Tesalia","Timaná","Villavieja","Yaguará"],"La Guajira":["Albania","Barrancas","Dibulla","Distracción","El Molino","Fonseca","Hatonuevo","La Jagua del Pilar","Maicao","Manaure","Riohacha","San Juan del Cesar","Uribia","Urumita","Villanueva"],Magdalena:["Algarrobo","Aracataca","Ariguaní","Cerro San Antonio","Chibolo","Ciénaga","Concordia","El Banco","El Piñón","El Reten","Fundación","Guamal","Nueva Granada","Pedraza","Pijiño del Carmen","Pivijay","Plato","Pueblo Viejo","Remolino","Sabanas de San Ángel","Salamina","San Sebastián de Buenavista","San Zenón","Santa Ana","Santa Bárbara de Pinto","Santa Marta","Sitionuevo","Tenerife","Zapayán","Zona Bananera"],Meta:["Acacías","Barranca de Upía","Cabuyaro","Castilla la Nueva","Cumaral","El Calvario","El Castillo","El Dorado","Fuente de Oro","Granada","Guamal","La Macarena","La Uribe","Lejanías","Mapiripán","Mesetas","Puerto Concordia","Puerto Gaitán","Puerto Lleras","Puerto López","Puerto Rico","Restrepo","San Carlos Guaroa","San Juan de Arama","San Juanito","San Luis de Cubarral","San Martín","Villavicencio","Vista Hermosa"],Nariño:["Albán","Aldana","Ancuyá","Arboleda","Barbacoas","Belén","Buesaco","Chachagüí","Colón","Consacá","Contadero","Córdoba","Cuaspud","Cumbal","Cumbitara","El Charco","El Peñol","El Rosario","El Tablón de Gómez","El Tambo","Francisco Pizarro","Funes","Guachucal","Guaitarilla","Gualmatán","Iles","Imues","Ipiales","La Cruz","La Florida","La Llanada","La Tola","La Unión","Leiva","Linares","Los Andes","Magüí Payán","Mallama","Mosquera","Nariño","Olaya Herrera","Ospina","Pasto","Policarpa","Potosí","Providencia","Puerres","Pupiales","Ricaurte","Roberto Payán","Samaniego","San Bernardo","San Lorenzo","San Pablo","San Pedro de Cartago","Sandoná","Santa Bárbara","Santa Cruz","Sapuyes","Taminango","Tangua","Tumaco","Túquerres","Yacuanquer"],"Norte de Santander":["Abrego","Arboledas","Bochalema","Bucarasica","Cachirá","Cácota","Chinácota","Chitagá","Convención","Cúcuta","Cucutilla","Durania","El Carmen","El Tarra","El Zulia","Gramalote","Hacarí","Herrán","La Esperanza","La Playa","Labateca","Los Patios","Lourdes","Mutiscua","Ocaña","Pamplona","Pamplonita","Puerto Santander","Ragonvalia","Salazar","San Calixto","San Cayetano","Santiago","Sardinata","Silos","Teorama","Tibú","Toledo","Villa Caro","Villa del Rosario"],Putumayo:["Colón","Mocoa","Orito","Puerto Asís","Puerto Caicedo","Puerto Guzmán","Puerto Leguizamo","San Francisco","San Miguel","Santiago","Sibundoy","Valle del Guamuez","Villa Garzón"],Quindío:["Armenia","Buenavista","Calarcá","Circasia","Córdoba","Filandia","Génova","La Tebaida","Montenegro","Pijao","Quimbaya","Salento"],Risaralda:["Apía","Balboa","Belén de Umbría","Dosquebradas","Guática","La Celia","La Virginia","Marsella","Mistrató","Pereira","Pueblo Rico","Quinchía","Santa Rosa de Cabal","Santuario"],"San Andrés y Providencia":["Providencia y Santa Catalina","San Andrés"],Santander:["Aguada","Albania","Aratoca","Barbosa","Barichara","Barrancabermeja","Betulia","Bolívar","Bucaramanga","Cabrera","California","Capitanejo","Carcasí","Cepitá","Cerrito","Charalá","Charta","Chima","Chipatá","Cimitarra","Concepción","Confines","Contratación","Coromoro","Curití","El Carmen de Chucurí","El Guacamayo","El Peñón","El Playón","Encino","Enciso","Florián","Floridablanca","Galán","Gambita","Girón","Guaca","Guadalupe","Guapotá","Guavatá","Güepsa","Hato","Jesús María","Jordán","La Belleza","La Paz","Landázuri","Lebríja","Los Santos","Macaravita","Málaga","Matanza","Mogotes","Molagavita","Ocamonte","Oiba","Onzaga","Palmar","Palmas del Socorro","Páramo","Piedecuesta","Pinchote","Puente Nacional","Puerto Parra","Puerto Wilches","Rionegro","Sabana de Torres","San Andrés","San Benito","San Gil","San Joaquín","San José de Miranda","San Miguel","San Vicente de Chucurí","Santa Bárbara","Santa Helena del Opón","Simacota","Socorro","Suaita","Sucre","Surata","Tona","Valle de San José","Vélez","Vetas","Villanueva","Zapatoca"],Sucre:["Buenavista","Caimito","Chalán","Coloso","Corozal","Coveñas","El Roble","Galeras","Guaranda","La Unión","Los Palmitos","Majagual","Morroa","Ovejas","Palmito","Sampués","San Benito Abad","San Juan Betulia","San Marcos","San Onofre","San Pedro","Santiago de Tolú","Sincé","Sincelejo","Sucre","Tolú Viejo"],Tolima:["Alpujarra","Alvarado","Ambalema","Anzoátegui","Armero","Ataco","Cajamarca","Carmen de Apicalá","Casabianca","Chaparral","Coello","Coyaima","Cunday","Dolores","Espinal","Falan","Flandes","Fresno","Guamo","Herveo","Honda","Ibagué","Icononzo","Lérida","Líbano","Mariquita","Melgar","Murillo","Natagaima","Ortega","Palocabildo","Piedras","Planadas","Prado","Purificación","Rioblanco","Roncesvalles","Rovira","Saldaña","San Antonio","San Luis","Santa Isabel","Suárez","Valle de San Juan","Venadillo","Villahermosa","Villarrica"],"Valle del Cauca":["Alcalá","Andalucía","Ansermanuevo","Argelia","Bolívar","Buenaventura","Buga","Bugalagrande","Caicedonia","Cali","Calima","Candelaria","Cartago","Dagua","El Águila","El Cairo","El Cerrito","El Dovio","Florida","Ginebra","Guacarí","Jamundí","La Cumbre","La Unión","La Victoria","Obando","Palmira","Pradera","Restrepo","Riofrío","Roldanillo","San Pedro","Sevilla","Toro","Trujillo","Tuluá","Ulloa","Versalles","Vijes","Yotoco","Yumbo","Zarzal"],Vaupés:["Carurú","Mitú","Pacoa","Papunahua","Taraira","Yavaraté"],Vichada:["Cumaribo","La Primavera","Puerto Carreño","Santa Rosalía"]},en=[{title:"How to answer salary questions",tag:"Interview",read:"4 min",body:"Use a confident range, anchor it to the role, and avoid apologizing for earning in USD.",actions:["Know your floor","Use monthly USD","Mention flexibility last"]},{title:"Writing a CV for US SaaS companies",tag:"CV",read:"6 min",body:"Translate local experience into metrics US hiring managers can scan in under a minute.",actions:["Lead with outcomes","Add tools","Quantify scope"]},{title:"Before your recruiter screen",tag:"Process",read:"3 min",body:"Prepare availability, compensation, English comfort, and two strong role stories.",actions:["Check your setup","Review the opening","Bring questions"]},{title:"STAR stories that feel natural",tag:"Interview",read:"5 min",body:"Keep stories specific, concise, and tied to business impact instead of job duties.",actions:["Situation","Action","Result"]}],_t=[{key:"profile-review",label:"Profile Review",help:"We are checking role fit and your candidate profile."},{key:"background-check",label:"Background Checks",help:"Nearwork is verifying relevant background and work details."},{key:"assessment",label:"Assessment",help:"Complete role-specific questions when assigned."},{key:"interview",label:"Interview",help:"Meet the recruiter and book your next conversation."},{key:"presented",label:"Presented",help:"Your profile has been prepared for the company."},{key:"client-review",label:"Client Review",help:"The company is reviewing your profile and next steps."},{key:"hired",label:"Hired",help:"Offer accepted and onboarding is ready to begin."}],Zt=["Applied","Assessment","Interview","Final round","Offer"];let o={user:null,candidate:null,applications:[],assessments:[],notifications:[],notificationPanelOpen:!1,notificationSettingsOpen:!1,jobs:[],loading:!0,view:"login",activePage:"overview",matchesFiltered:!1,message:"",assessmentUiStep:null,showDeleteAccountModal:!1,deleteAccountStatus:null,deleteAccountError:"",showUnsavedChangesModal:!1,resetCodeStatus:null,resetCodeError:""},Y=null;const it=sessionStorage.getItem("nw_restore_path");it&&(sessionStorage.removeItem("nw_restore_path"),window.history.replaceState({page:it},"",it));function Kt(){return[["overview","layout-dashboard","Overview"],["matches","briefcase-business","Matches"],["applications","send","Applications"],["assessment","clipboard-check","Assessment"],["cvs","files","CV Picker"],["tips","book-open","Tips"],["recruiter","calendar-days","Recruiter"],["profile","user-round-cog","Profile"]]}function Xe(){const t=window.location.pathname.split("/").filter(Boolean)[0];return t==="onboarding"?"onboarding":t==="assessment"||t==="assessments"?"assessment":Kt().some(([a])=>a===t)?t:"overview"}function fe(){const e=window.location.pathname.split("/").filter(Boolean);return(e[0]==="assessment"||e[0]==="assessments")&&e[1]||""}function Xt(){const e=window.location.pathname.split("/").filter(Boolean),t=e.findIndex(n=>n==="q"||n==="question");if(t===-1)return null;const a=Number(e[t+1]);return Number.isFinite(a)&&a>0?a-1:null}function tn(e,t=0){return`/assessment/${encodeURIComponent(e)}/start/q/${Number(t||0)+1}`}function Ee(e,t=0,a=!1){const n=tn(e,t);if(window.location.pathname===n)return;const s=a?"replaceState":"pushState";window.history[s]({page:"assessment",assessmentId:e,questionIndex:t},"",n)}function m(e,t){return`<i data-lucide="${e}" aria-label="${e}"></i>`}let ot=!1;function ze(){if(window.lucide){window.lucide.createIcons();return}if(ot)return;ot=!0;const e=()=>{window.lucide?(window.lucide.createIcons(),ot=!1):setTimeout(e,50)};e()}function w(e){o={...o,...e},fa()}function Le(e,t=!0){const n=e==="onboarding"||Kt().some(([s])=>s===e)?e:"overview";o={...o,activePage:n,matchesFiltered:n==="matches"?o.matchesFiltered:!1,message:"",assessmentUiStep:null},t&&window.history.pushState({page:n},"",n==="overview"?"/":`/${n}`),fa()}function ea(){var t,a;return(((t=o.candidate)==null?void 0:t.name)||((a=o.user)==null?void 0:a.displayName)||"there").split(" ")[0]||"there"}function an(){var t,a,n;return(((t=o.candidate)==null?void 0:t.name)||((a=o.user)==null?void 0:a.displayName)||((n=o.user)==null?void 0:n.email)||"NW").split(/[ @.]/).filter(Boolean).slice(0,2).map(s=>s[0]).join("").toUpperCase()}function ta(e="normal"){var n,s;const t=((n=o.candidate)==null?void 0:n.photoURL)||((s=o.user)==null?void 0:s.photoURL)||"",a=e==="large"?"avatar avatar-large":"avatar";return t?`<img class="${a}" src="${y(t)}" alt="${y(ea())}" />`:`<div class="${a}">${an()}</div>`}function y(e){return String(e||"").replaceAll("&","&amp;").replaceAll('"',"&quot;").replaceAll("<","&lt;").replaceAll(">","&gt;")}function L(e){return String(e||"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;")}function tt(e){if(!e)return"Recently";const t=e.toDate?e.toDate():new Date(e);return new Intl.DateTimeFormat("en",{month:"short",day:"numeric"}).format(t)}function He(){var t;const e=((t=o.candidate)==null?void 0:t.skills)||[];return Array.isArray(e)?e:String(e).split(",").map(a=>a.trim()).filter(Boolean)}function Q(e){return String(e||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/&/g," and ").replace(/[^a-z0-9]+/g," ").trim().replace(/\s+/g," ")}function kt(e,t=He()){const a=Se(e),n=new Set((a.skills||[]).map(Q).filter(Boolean)),s=new Map(t.map(i=>[Q(i),i]).filter(([i])=>i));return[...s.keys()].filter(i=>n.has(i)).map(i=>s.get(i))}function aa(e){return["Nearwork candidate","Talent member"].includes(String(e||"").trim())}function Rt(e){if(!e)return null;if(e.toDate)return e.toDate();if(typeof e=="object"&&typeof e.seconds=="number")return new Date(e.seconds*1e3);const t=new Date(e);return Number.isNaN(t.getTime())?null:t}function At(e){return Number(e||1)===1?"Technical Assessment":"DISC Assessment"}function rt(e,t){var a,n,s;return((n=(a=e==null?void 0:e.answers)==null?void 0:a[t==null?void 0:t.id])==null?void 0:n.value)??((s=e==null?void 0:e.answers)==null?void 0:s[t==null?void 0:t.id])??""}function Ne(e){return e!=null&&e!==""}function se(e,t){return((e==null?void 0:e.questions)||[]).slice(0,70).filter(a=>Number(a.stage||1)===Number(t))}function mt(e,t,a=(e==null?void 0:e.answers)||{}){return se(e,t).filter(n=>{var s;return!Ne(((s=a[n.id])==null?void 0:s.value)??a[n.id])})}function nn(){var e,t;return!!((o.applications||[]).length||(((e=o.candidate)==null?void 0:e.pipelineCodes)||[]).length||(t=o.candidate)!=null&&t.pipelineCode)}function sn(){var n,s,i;const e=((n=o.candidate)==null?void 0:n.department)||"Bogotá D.C.",t=pe[e]||pe["Bogotá D.C."]||["Bogotá"],a=((s=o.candidate)==null?void 0:s.city)||((i=o.candidate)==null?void 0:i.locationCity)||t[0];return{department:e,city:a,label:`${a}, ${e}`}}function on(){var t,a,n;const e=((t=o.candidate)==null?void 0:t.targetRole)||((a=o.candidate)==null?void 0:a.headline)||"";return((n=Object.entries(Me).find(([,s])=>s.includes(e)))==null?void 0:n[0])||Object.keys(Me)[0]}function na(e){return Object.keys(Me).map(t=>`<option value="${y(t)}" ${t===e?"selected":""}>${t}</option>`).join("")}function at(e,t){const a=Me[e]||Object.values(Me).flat();return['<option value="">Choose the closest role</option>'].concat(a.map(n=>`<option value="${y(n)}" ${t===n?"selected":""}>${n}</option>`)).join("")}function Ae(e){const t=String(e||"").replace(/[,.\s]+$/,"").replace(/^[,.\s]+/,"").trim();if(!t||t.length<2)return"";const a=Yt.find(n=>Q(n)===Q(t));return a||t.split(/\s+/).map(n=>n.length<=3&&n===n.toUpperCase()?n:n.charAt(0).toUpperCase()+n.slice(1).toLowerCase()).join(" ")}function sa(e){const t=[...new Set((e||[]).map(Ae).filter(Boolean))],a=["Customer Service","Salesforce","HubSpot","Excel","Google Sheets","Technical Support","Outbound Calls","React","SQL","Payroll"];return`
    <div class="skill-search-shell" data-skill-search>
      <div class="selected-skills" id="selectedSkills">
        ${t.map(n=>`
          <span class="selected-skill" data-skill-chip="${y(n)}">
            ${L(n)}
            <button type="button" class="skill-remove" data-remove-skill="${y(n)}" aria-label="Remove ${y(n)}">×</button>
            <input type="hidden" name="skills" value="${y(n)}" />
          </span>
        `).join("")||'<span class="skill-empty">Selected skills will appear here.</span>'}
      </div>
      <div class="skill-search-box">
        <input id="skillSearchInput" type="search" autocomplete="off" placeholder="Type any skill — e.g. Salesforce, Excel, B2B sales, Canva…" />
        <button class="secondary-action" type="button" id="addTypedSkill">Add skill</button>
      </div>
      <div class="skill-suggestions" id="skillSuggestions">
        ${a.map(n=>`<button type="button" class="skill-suggestion" data-skill="${y(n)}">${L(n)}</button>`).join("")}
      </div>
      <p class="field-hint">Select between 5 and 20 skills that best describe your experience.</p>
    </div>
  `}function ia(e,t="USD"){const a=Number(String(e||"").replace(/[^\d.]/g,"")),n=String(t||"USD").toUpperCase()==="COP"?"COP":"USD";if(!Number.isFinite(a)||a<=0)return{salary:"",salaryUSD:null,salaryCurrency:n,salaryAmount:null};const s=Math.round(a),i=n==="COP"?"es-CO":"en-US";return{salary:`$${new Intl.NumberFormat(i).format(s)} ${n}/mo`,salaryUSD:n==="USD"?s:null,salaryCurrency:n,salaryAmount:s}}function oa(e){return Number(String(e||"").replace(/[^\d.]/g,""))}function Ut(e,t="USD"){const a=oa(e),n=String(t||"USD").toUpperCase()==="COP"?"COP":"USD";return n==="USD"&&a>=1e5?"COP":n}function gt(e,t="USD"){const a=oa(e);return!Number.isFinite(a)||a<=0?"":new Intl.NumberFormat("en-US",{maximumFractionDigits:0}).format(Math.round(a))}function ra(e){return Array.isArray(e)?e:String(e||"").split(",").map(t=>t.trim()).filter(Boolean)}function Se(e){const t=ra(e.skills||e.requiredSkills);return{id:e.id||e.code,code:e.code||e.id,title:e.title||e.role||e.openingTitle||"Open role",orgName:e.orgName||e.company||e.clientName||"Nearwork client",location:e.location||"Remote",compensation:e.compensation||e.salary||e.rate||"Competitive",match:e.match||null,skills:t,description:e.description||e.about||"Nearwork is reviewing candidates for this role now."}}function he(e){const t=(e==null?void 0:e.code)||"";return t.includes("operation-not-allowed")?"This sign-in method is not available yet.":t.includes("unauthorized-domain")?"This website still needs to be approved for sign-in.":t.includes("permission-denied")?"We could not save this yet. Please try again in a moment or contact Nearwork support.":t.includes("weak-password")?"Password must be at least 6 characters.":t.includes("invalid-credential")||t.includes("wrong-password")?"That email/password did not match. If this account was created with Google, use Continue with Google.":t.includes("user-not-found")?"No account exists for that email yet.":t.includes("email-already-in-use")?"That email already has an account. Sign in or use Google.":t.includes("popup")?"The Google sign-in popup was closed before finishing.":"Something went wrong. Please try again or contact Nearwork support."}const Ve=[{initials:"CP",name:"Camila P.",role:"Product Designer",city:"Medellín",quote:"I doubled my income and kept living in Medellín. The whole process took 19 days from apply to signed offer."},{initials:"AR",name:"Andrés R.",role:"SDR",city:"Bogotá",quote:"I went from chasing local leads to running outbound for a US SaaS team — same desk, way better pay."},{initials:"LG",name:"Laura G.",role:"Customer Success Manager",city:"Cali",quote:"No recruiters ghosting me. One profile, real interviews, and an offer that actually matched the role."},{initials:"FT",name:"Felipe T.",role:"Sales Ops Analyst",city:"Bucaramanga",quote:"The matching was spot on. I only talked to teams that fit what I was looking for, and signed within a month."},{initials:"DV",name:"Daniela V.",role:"Account Executive",city:"Cartagena",quote:"Now I'm closing deals for a US company in USD, still based in Cartagena. Best career move I've made."}];let Fe=null;function la(e){Fe&&clearInterval(Fe);const t=Ve[0];$t.innerHTML=`
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
            ${Ve.map((n,s)=>`<span class="testimonial-dot${s===0?" is-active":""}"></span>`).join("")}
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
  `,ze();let a=0;Fe=setInterval(()=>{const n=document.querySelector(".testimonial");if(!n){clearInterval(Fe),Fe=null;return}const s=n.querySelector(".testimonial-content");s.classList.add("is-flipping"),setTimeout(()=>{a=(a+1)%Ve.length;const i=Ve[a],r=s.querySelector("p"),d=s.querySelector(".mini-avatar"),c=s.querySelector(".testimonial-person strong"),l=s.querySelector(".testimonial-person small");r&&(r.textContent=`"${i.quote}"`),d&&(d.textContent=i.initials),c&&(c.textContent=i.name),l&&(l.textContent=`${i.role}, ${i.city}`),n.querySelectorAll(".testimonial-dot").forEach((u,p)=>u.classList.toggle("is-active",p===a)),s.classList.remove("is-flipping")},320)},6e3)}function ca(e="login"){var a;const t=e==="signup";la(`
    <section class="auth-panel">
      <div class="auth-top">
        <div class="right-brand">Near<span>work</span></div>
        <div class="candidate-chip">For candidates</div>
      </div>
      <div class="panel-heading">
        <h2>${t?"Create your account.":"Welcome back."}</h2>
        <p>${t?"Create your profile, browse roles, and track your application.":"Log in to your dashboard to manage applications and interview requests."}</p>
      </div>
      <ul class="trust-points">
        <li>${m("check-circle-2")} 100% free for candidates, always</li>
        <li>${m("check-circle-2")} Real interviews with vetted US teams</li>
      </ul>
      ${o.message?`<div class="notice">${m("lock")} ${y(o.message)}</div>`:""}
      ${ye?"":`<div class="notice">${m("triangle-alert")} Sign-in is still being set up.</div>`}
      <button id="googleSignIn" class="social-action" type="button">
        <svg class="google-icon" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
          <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/>
          <path fill="#FBBC05" d="M3.964 10.706A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.038l3.007-2.332z"/>
          <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.962L3.964 7.294C4.672 5.167 6.656 3.58 9 3.58z"/>
        </svg>
        Continue with Google
      </button>
      <div class="divider"><span></span>or email<span></span></div>
      <form id="authForm" class="stacked-form">
        ${t?'<label class="field-label">Full name<input name="name" type="text" autocomplete="name" placeholder="Full name" required /></label>':""}
        <label class="field-label">Email address<input name="email" type="email" autocomplete="email" placeholder="you@example.com" required /></label>
        <div class="field-group">
          <div class="label-row">
            <label class="field-label" for="passwordInput">Password</label>
            ${t?"":'<button type="button" id="resetPassword" class="forgot-link">Forgot?</button>'}
          </div>
          <div class="password-field">
            <input id="passwordInput" name="password" type="password" autocomplete="${t?"new-password":"current-password"}" minlength="6" placeholder="••••••••" required />
            <button type="button" class="password-toggle" data-password-toggle aria-label="Show password">${m("eye")}</button>
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
        <button class="primary-action" type="submit">${t?`${m("user-plus")} Create account`:`Sign in ${m("arrow-right")}`}</button>
        <p id="formMessage" class="form-message" role="status"></p>
      </form>
      <button id="toggleMode" class="text-action" type="button">${t?"Already have an account? Sign in":"New or invited by Nearwork? Create your profile"}</button>
      <a class="back-jobboard" href="https://jobs.nearwork.co" target="_blank" rel="noreferrer">${m("arrow-left")} Back to job board</a>
      <p class="auth-footer">© ${new Date().getFullYear()} Nearwork Inc. All rights reserved.</p>
    </section>
  `),document.querySelector("#toggleMode").addEventListener("click",()=>ca(t?"login":"signup")),document.querySelectorAll("[data-password-toggle]").forEach(n=>{n.addEventListener("click",()=>{const s=n.previousElementSibling,i=s.type==="password";s.type=i?"text":"password",n.innerHTML=m(i?"eye-off":"eye"),n.setAttribute("aria-label",i?"Hide password":"Show password"),ze()})}),document.querySelector("#googleSignIn").addEventListener("click",async()=>{var i;const n=document.querySelector("#formMessage");if(n.textContent="",t){const r=document.querySelector("#privacyConsent"),d=document.querySelector("#privacyConsentError");if(r&&!r.checked){d&&(d.style.display=""),n.textContent="Please accept the Privacy Policy to continue.",r.scrollIntoView({behavior:"smooth",block:"center"});return}d&&(d.style.display="none")}const s=t?((i=document.querySelector("#marketingConsent"))==null?void 0:i.checked)===!0:!1;try{await _a(s)}catch(r){n.textContent=he(r)}}),(a=document.querySelector("#resetPassword"))==null||a.addEventListener("click",async()=>{const n=document.querySelector("input[name='email']").value.trim().toLowerCase(),s=document.querySelector("#formMessage");if(!n){s.textContent="Enter your email first, then request a reset link.";return}try{await Ga(n),s.textContent=`If an account exists for ${n}, a password reset email is on its way.`}catch(i){s.textContent=he(i)}}),document.querySelector("#authForm").addEventListener("submit",async n=>{var l;n.preventDefault();const s=new FormData(n.currentTarget),i=document.querySelector("#formMessage"),r=String(s.get("email")).trim().toLowerCase();if(i.textContent="",t){const u=document.querySelector("#privacyConsent"),p=document.querySelector("#privacyConsentError");if(u&&!u.checked){p&&(p.style.display=""),i.textContent="Please accept the Privacy Policy to continue.";return}p&&(p.style.display="none")}const d=t?((l=document.querySelector("#marketingConsent"))==null?void 0:l.checked)===!0:!1,c=new Date().toISOString();try{if(t){const u=await ka(O,r,s.get("password"));await Aa(u.user,{displayName:s.get("name")}),sessionStorage.setItem("nw_new_account","1"),await ht(u.user.uid,{name:s.get("name"),email:r,availability:"open",headline:"Nearwork candidate",onboarded:!1,source:"talent.nearwork.co",privacyConsent:!0,privacyConsentAt:c,marketingConsent:d,marketingConsentAt:d?c:null}),Gt({name:s.get("name"),firstName:String(s.get("name")||"").trim().split(/\s+/)[0],email:r}).catch(()=>null)}else await xa(O,r,s.get("password"))}catch(u){i.textContent=he(u)}})}function rn(){var n,s;const e=new URLSearchParams(window.location.search),t=e.get("token")||"",a=e.get("email")||"";la(`
    <section class="auth-panel">
      <div class="auth-top">
        <div class="right-brand">Near<span>work</span></div>
        <div class="candidate-chip">Candidate portal</div>
      </div>
      <div class="panel-heading">
        <h2>Set a new password.</h2>
        <p>${a?`Resetting password for <strong>${L(a)}</strong>. Choose a password you haven't used before.`:"Choose a new password you haven't used before."}</p>
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
        ${o.resetCodeStatus==="error"?`<div class="notice">${m("triangle-alert")} ${L(o.resetCodeError||"Something went wrong. Please request a new link.")}</div>`:""}
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
  `),document.querySelectorAll("[data-password-toggle]").forEach(i=>{i.addEventListener("click",()=>{const r=i.previousElementSibling,d=r.type==="password";r.type=d?"text":"password",i.innerHTML=m(d?"eye-off":"eye"),i.setAttribute("aria-label",d?"Hide password":"Show password"),ze()})}),(n=document.querySelector("#backToLogin"))==null||n.addEventListener("click",()=>{const i=o.resetCodeStatus==="success"?"Your password has been reset. Sign in with your new password.":"";window.history.pushState({},"","/"),w({view:"login",message:i,resetCodeStatus:null,resetCodeError:""})}),(s=document.querySelector("#resetForm"))==null||s.addEventListener("submit",async i=>{i.preventDefault();const r=document.querySelector("#newPassword").value,d=document.querySelector("#confirmPassword").value;if(r!==d){w({resetCodeStatus:"error",resetCodeError:"Passwords do not match."});return}if(r.length<6){w({resetCodeStatus:"error",resetCodeError:"Password must be at least 6 characters."});return}w({resetCodeStatus:"resetting"});try{const c=await fetch("/api/confirm-reset",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({token:t,newPassword:r})}),l=await c.json().catch(()=>({}));if(!c.ok||!l.ok)throw new Error(l.error||"Something went wrong. Please request a new link.");w({resetCodeStatus:"success"})}catch(c){const l=(c==null?void 0:c.message)||"This link has expired or already been used. Please request a new one.";w({resetCodeStatus:"error",resetCodeError:l})}})}async function da(e){w({loading:!0,user:e});try{const[t,a,n]=await Promise.allSettled([Qt(e),Ra(e.uid),Wt()]),s=t.status==="fulfilled"?t.value:null,i=a.status==="fulfilled"?a.value:[],r=n.status==="fulfilled"?n.value:[];let d=[];try{d=await Ua(e.uid,e.email,(s==null?void 0:s.candidateCode)||(s==null?void 0:s.code)||"")}catch(x){console.warn(x)}const c=fe();if(c&&!d.some(x=>x.id===c)){const x=await Ba(c,e.uid,e.email,(s==null?void 0:s.candidateCode)||(s==null?void 0:s.code)||"").catch(()=>null);x&&(d=[x,...d])}const l=sessionStorage.getItem("nw_new_account")==="1";l&&sessionStorage.removeItem("nw_new_account");const u=!!(s!=null&&s.targetRole||!aa(s==null?void 0:s.headline)&&(s!=null&&s.headline)),p=!(s!=null&&s.onboarded)&&!u;!(s!=null&&s.onboarded)&&u&&wt(e.uid,{onboarded:!0,candidateCode:s==null?void 0:s.candidateCode}).catch(()=>null);const S=l||p?"onboarding":Xe();w({candidate:{...s||{},name:(s==null?void 0:s.name)||e.displayName||"Talent member",email:(s==null?void 0:s.email)||e.email,availability:(s==null?void 0:s.availability)||"open",headline:(s==null?void 0:s.headline)||(s==null?void 0:s.targetRole)||"Nearwork candidate"},applications:i,assessments:d,jobs:r.map(Se),loading:!1,view:"dashboard",activePage:S,message:""}),Y&&Y(),ye&&(Y=Qa(e.uid,x=>{o.notifications=x,o.view==="dashboard"&&!o.message&&ua()}))}catch(t){console.warn(t),w({candidate:{name:e.displayName||"Talent member",email:e.email,availability:"open",headline:"Nearwork candidate"},applications:[],assessments:[],jobs:[],loading:!1,view:"dashboard",activePage:Xe(),message:""})}}async function We(){if(window.location.pathname==="/reset-password"){Y&&Y(),Y=null,w({user:null,candidate:null,loading:!1,view:"reset-password",resetCodeStatus:null});return}const e=Xe();if(e==="assessment"){sessionStorage.setItem("nw_restore_path",window.location.pathname),w({user:null,candidate:null,applications:[],assessments:[],jobs:[],loading:!1,view:"login",activePage:"overview",message:"Please log in to open your assessment."});return}if(e==="overview"){Y&&Y(),Y=null,w({user:null,candidate:null,loading:!1,view:"login",activePage:"overview"});return}let t=[];try{const a=await Wt();a.length&&(t=a.map(Se))}catch(a){console.warn(a)}w({user:null,candidate:null,applications:[],assessments:[],jobs:t,loading:!1,view:"login",activePage:"overview",message:"Please log in to view your profile, matched openings, applications, and assessments."})}function ln(){return[{label:"My journey",items:[["overview","layout-dashboard","Overview"],["applications","send","Applications"],["assessment","clipboard-check","Assessment"]]},{label:"My search",items:[["matches","briefcase-business","Matches"],["cvs","files","CV Picker"]]},{label:"Support",items:[["tips","book-open","Tips"],["recruiter","calendar-days","Recruiter"],["profile","user-round-cog","Profile"]]}]}function cn(){var e;return{open:"Open to roles",interviewing:"Interviewing",paused:"Not looking"}[((e=o.candidate)==null?void 0:e.availability)||"open"]||"Open to roles"}function xt(){const e=o.candidate||{},t=He();return[{id:"name",label:"Full name",done:!!e.name},{id:"role",label:"Target role",done:!!(e.targetRole||!aa(e.headline)&&e.headline)},{id:"location",label:"City",done:!!e.city},{id:"salary",label:"Salary",done:!!(e.salaryAmount||e.salary)},{id:"english",label:"English",done:!!e.english},{id:"whatsapp",label:"WhatsApp",done:!!(e.whatsapp||e.phone)},{id:"skills",label:"Skills (5-20)",done:t.length>=5},{id:"cv",label:"CV",done:!!e.cvUrl}]}function ua(){var r,d,c,l,u;const e=(o.notifications||[]).filter(p=>!p.read).length,t=((r=o.candidate)==null?void 0:r.availability)||"open",n={open:"#10A07C",interviewing:"#EAB308",paused:"#9AA0A6"}[t]||"#10A07C",s=((d=o.candidate)==null?void 0:d.name)||((c=o.user)==null?void 0:c.displayName)||"Talent member",i=((l=o.candidate)==null?void 0:l.headline)||((u=o.candidate)==null?void 0:u.targetRole)||"Nearwork candidate";$t.innerHTML=`
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
          ${ln().map(p=>`
            <div class="nw-nav-group">
              <div class="nw-nav-group-label">${p.label}</div>
              ${p.items.map(([v,S,x])=>`
                <button class="nw-nav-item${o.activePage===v?" active":""}" data-page="${v}" type="button">
                  ${m(S)} ${x}
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
          ${ta()}
          <div class="nw-sidebar-profile-text">
            <div class="nw-sidebar-profile-name">${L(s)}</div>
            <div class="nw-sidebar-profile-role">${L(i)}</div>
          </div>
        </div>

        <!-- Sign out -->
        <button id="${o.user?"signOut":"signIn"}" class="nw-sidebar-signout" type="button">
          ${m(o.user?"log-out":"log-in")} ${o.user?"Sign out":"Sign in"}
        </button>
      </aside>

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
          ${(()=>{try{return vn()}catch(p){return console.error("renderActivePage error:",p),'<div class="notice">Page failed to render. <button type="button" data-page="overview">Go to overview</button></div>'}})()}
        </div>
      </section>
    </main>
  `,ze(),Yn(),gn(),mn()}function dn(e){return(e!=null&&e.toDate?e.toDate():new Date(e||Date.now())).toLocaleString("en-US",{month:"short",day:"numeric",year:"numeric",hour:"numeric",minute:"2-digit"})}function un(){const e=(o.notifications||[]).slice(0,10);return`
    <div class="notification-panel">
      <div class="notification-panel-head"><strong>Notifications</strong><span>${e.length?"Latest updates":"All clear"}</span></div>
      ${e.length?e.map(t=>`
        <button class="notification-item ${t.read?"":"unread"}" type="button" data-notification-read="${t.id}">
          <strong>${y(t.title||"Nearwork update")}</strong>
          <span>${y(t.message||"")}</span>
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
  `}let Qe=null;function mn(){Qe&&window.clearInterval(Qe);const e=document.querySelector("#assessmentTimer");if(!e)return;const t=new Date(e.dataset.end||"").getTime(),a=()=>{const n=Math.max(0,t-Date.now()),s=Math.floor(n/1e3),i=Math.floor(s/60),r=String(s%60).padStart(2,"0");e.textContent=`${i}:${r}`,e.classList.toggle("is-low",n<=10*60*1e3),n<=0&&window.clearInterval(Qe)};a(),Qe=window.setInterval(a,1e3)}function gn(){if(o.activePage!=="assessment")return;const e=o.assessments||[],t=fe(),n=(t?e.find(i=>i.id===t):null)||e.find(i=>["sent","started"].includes(String(i.status||"").toLowerCase()));if(!(n!=null&&n.id))return;const s=String(n.status||"").toLowerCase();if(s==="started"&&Xt()===null){Ee(n.id,Number(n.currentQuestionIndex||0),!0);return}if(!t&&s==="sent"){const i=`/assessment/${encodeURIComponent(n.id)}/start`;window.history.replaceState({page:"assessment",assessmentId:n.id},"",i)}}function vn(){return({onboarding:fn,overview:Bt,matches:Cn,applications:$n,assessment:kn,cvs:Rn,tips:Un,recruiter:Bn,profile:Fn}[o.activePage]||Bt)()}function Bt(){var A,E;const e=pa(),t=xt(),a=t.filter(k=>k.done).length,n=t.length,s=o.applications||[],i=s.filter(k=>["action-needed","interview-scheduled","assessment-sent"].includes(String(k.status||"").toLowerCase())).length,r=(o.jobs||[]).slice(0,3),d=((A=o.candidate)==null?void 0:A.recruiter)||{},c=2*Math.PI*52,l=c*(1-e/100),p=new Date().toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"}),v=(k,M,R,H,B)=>`
    <div class="nw-stat-tile">
      <div class="nw-stat-tile-top">
        <span class="nw-stat-tile-label">${k}</span>
        <div class="nw-stat-icon" style="background:${H}14;">
          ${m(B)}
        </div>
      </div>
      <div class="nw-stat-value">${M}</div>
      <div class="nw-stat-sub">${R}</div>
    </div>`,S=(k,M)=>{const R=String(k.stage||k.status||"applied").toLowerCase(),H=R.includes("offer")?4:R.includes("final")?3:R.includes("interview")?2:R.includes("assessment")?1:0,B=k.clientName||k.company||"Nearwork client",q=B.split(/\s+/).slice(0,2).map(g=>g[0]).join("").toUpperCase(),Z=["#10A07C","#EC4E7E","#3B82F6","#F4A52E","#8B5CF6"],f=Z[B.length%Z.length];return`
      <div class="nw-app-row${M?" last":""}">
        <div class="nw-app-avatar" style="background:${f};">${q}</div>
        <div class="nw-app-info">
          <div class="nw-app-title">${L(k.jobTitle||k.title||"Application")} <span class="nw-app-company">· ${L(B)}</span></div>
          <div class="nw-app-stages">
            ${Zt.map((g,h)=>`<div class="nw-stage-pip${h<=H?" done":""}"></div>`).join("")}
            <span class="nw-app-stage-label">${k.stage||k.status||"Applied"}</span>
          </div>
        </div>
        <div class="nw-app-meta">
          <span class="nw-app-status${i?" action":""}">${k.status||"In review"}</span>
          <div class="nw-app-date">${tt(k.updatedAt||k.createdAt)}</div>
        </div>
        ${m("chevron-right")}
      </div>`},x=k=>{const M=Se(k),R=kt(M),H=M.match||(R.length>=3?Math.min(97,70+R.length*4):null),B=["#10A07C","#EC4E7E","#3B82F6","#F4A52E"],q=B[M.orgName.length%B.length],Z=M.orgName.split(/\s+/).slice(0,2).map(g=>g[0]).join("").toUpperCase(),f=`https://jobs.nearwork.co/apply?code=${encodeURIComponent(M.code)}`;return`
      <div class="nw-match-card">
        <div class="nw-match-card-top">
          <div class="nw-match-avatar" style="background:${q};">${Z}</div>
          ${H?`<div class="nw-match-score">${H}%</div>`:""}
        </div>
        <div class="nw-match-role">${L(M.title)}</div>
        <div class="nw-match-company">${L(M.orgName)} · ${L(M.location)}</div>
        ${R.length?`<div class="nw-match-why">${R.slice(0,3).map(L).join(" · ")} match</div>`:`<div class="nw-match-why">${L(M.description).slice(0,80)}…</div>`}
        <div class="nw-match-footer">
          <span class="nw-match-salary">${L(M.compensation)}</span>
          <a href="${f}" target="_blank" rel="noreferrer" class="nw-match-apply">Apply ${m("arrow-right")}</a>
        </div>
      </div>`};return`
    <!-- Greeting -->
    <div class="nw-overview-header">
      <div class="nw-overview-date">Overview · ${p}</div>
      <h1 class="nw-overview-greeting">
        Hi ${L(ea())},
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
            stroke-dasharray="${c.toFixed(1)}" stroke-dashoffset="${l.toFixed(1)}"
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
          ${t.map(k=>`
            <div class="nw-check-pill${k.done?" done":""}">
              ${m(k.done?"check":"circle")} ${k.label}
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
      ${v("Interviews",s.filter(k=>String(k.stage||k.status||"").toLowerCase().includes("interview")).length,"Scheduled","Not yet scheduled","#F4A52E")}
      ${v("CVs saved",(((E=o.candidate)==null?void 0:E.cvLibrary)||[]).length,"In your library","Upload your first CV","#3B82F6")}
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
        ${s.length?s.slice(0,4).map((k,M)=>S(k,M===Math.min(s.length,4)-1)).join(""):`<div class="nw-empty">
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
            <div class="nw-recruiter-avatar">${d.initials||"NW"}</div>
            <div>
              <div class="nw-recruiter-name">${L(d.name||"Nearwork Support")}</div>
              <div class="nw-recruiter-role">${L(d.role||"Talent Partner")}</div>
            </div>
          </div>
          <p class="nw-recruiter-bio">I'll review every match and prep you before each interview. Reach out anytime.</p>
          <div class="nw-recruiter-btns">
            <a class="nw-recruiter-msg" href="mailto:${y(d.email||"support@nearwork.co")}">${m("message-square-text")} Message</a>
            <a class="nw-recruiter-call" href="https://wa.me/${encodeURIComponent((d.whatsapp||"+1").replace(/\D/g,""))}" target="_blank" rel="noreferrer">${m("calendar-plus")} WhatsApp</a>
          </div>
        </section>
      </div>
    </div>

    <!-- Top matches -->
    ${r.length?`
      <section class="nw-matches-section">
        <div class="nw-panel-head">
          <div>
            <div class="nw-panel-overline">Picked for you</div>
            <div class="nw-panel-title">Top matches this week</div>
          </div>
          <button class="nw-ghost-btn" type="button" data-page="matches">See all ${m("arrow-right")}</button>
        </div>
        <div class="nw-match-grid">
          ${r.map(k=>x(k)).join("")}
        </div>
      </section>
    `:""}
  `}function fn(){if(!Ke){Ke=!0,Ct=1;const e=o.candidate||{},t=String(e.name||"").trim().split(/\s+/).filter(Boolean);P={roleGroup:e.roleGroup||"",targetRole:e.targetRole||"",department:e.department||e.locationDepartment||"",city:e.city||e.locationCity||"",english:e.english||"",firstName:e.firstName||t[0]||"",lastName:e.lastName||t.slice(1).join(" ")||"",phone:e.phone||e.whatsapp||"",currentRole:e.currentRole||"",expectedSalaryUSD:e.expectedSalaryUSD||(e.salaryCurrency!=="COP"?e.salaryAmount:null)||"",expectedSalaryCOP:e.expectedSalaryCOP||(e.salaryCurrency==="COP"?e.salaryAmount:null)||"",linkedin:e.linkedin||"",experience:Array.isArray(e.workHistory)?e.workHistory.map(a=>({...a})):[],languages:Array.isArray(e.languages)?[...e.languages]:[],skills:Array.isArray(e.skills)?[...e.skills]:[],certifications:Array.isArray(e.certifications)?e.certifications.map(a=>({...a})):[]},ie=null,je=null,_=null}return'<div id="onboardingWizard" class="onb-shell"></div>'}function hn(){document.querySelector("#onboardingWizard")&&Oe(Ct)}function Oe(e){Ct=e;const t=document.querySelector("#onboardingWizard");t&&(t.innerHTML=yn(e),bn(e))}function lt(e){return`
    <div style="display:flex;align-items:center;gap:5px;margin-bottom:28px;">
      ${Array.from({length:3},(a,n)=>`
        <div style="height:5px;border-radius:3px;flex:${n<e?2:1};background:${n<e?"var(--green)":"var(--border)"};transition:all .3s;"></div>
      `).join("")}
      <span style="margin-left:6px;font-size:11px;font-weight:600;color:var(--light);white-space:nowrap;">${e<=3?`${e} / 3`:"Review"}</span>
    </div>`}function ee(e,t,a){return`<label style="display:flex;flex-direction:column;gap:5px;font-size:11px;font-weight:600;letter-spacing:.07em;text-transform:uppercase;color:var(--light);">${e}${t?'<span style="font-weight:400;font-size:10px;text-transform:none;letter-spacing:0;opacity:.7;">(optional)</span>':""} ${a}</label>`}function ve(e,t,a,n,s=""){return`<input id="${e}" type="${t}" value="${y(a||"")}" placeholder="${y(n)}" ${s} style="font-size:14px;padding:10px 12px;border:1.5px solid var(--border);border-radius:8px;background:#fff;outline:none;width:100%;box-sizing:border-box;" />`}function Ft(e,t){return`<div style="display:flex;justify-content:space-between;align-items:center;margin-top:28px;">
    ${e?'<button type="button" id="onbBack" class="secondary-action">← Back</button>':"<span></span>"}
    <button type="button" id="onbNext" class="primary-action fit">${t||"Continue →"}</button>
  </div>`}function yn(e){var a,n,s,i;const t=P;switch(e){case 1:{const r=!!ie;return`
        <div class="onb-step">
          ${lt(1)}
          <p class="eyebrow">Step 1 · Your CV</p>
          <h2 class="onb-heading">Upload your CV to get started</h2>
          <p class="onb-sub">We'll extract your experience, skills, and contact info automatically — so you don't have to type it all out.</p>
          <div class="upload-box" style="margin-bottom:4px;" id="onbCvBox">
            <input id="onbCvInput" type="file" accept=".pdf,.doc,.docx" style="display:none;" />
            <label for="onbCvInput" class="upload-trigger">${m("upload")} Choose file</label>
            <p id="onbCvStatus" style="font-size:12px;color:var(--green);min-height:18px;margin:0;">${r?`✓ ${L(ie.name)}`:""}</p>
            <p>PDF or Word · max 10 MB</p>
          </div>
          <div style="display:flex;justify-content:space-between;align-items:center;margin-top:24px;">
            <button type="button" id="onbSkipCv" style="background:none;border:none;font-size:13px;color:var(--light);cursor:pointer;text-decoration:underline;padding:0;">Skip — I'll fill in manually</button>
            <button type="button" id="onbNext" class="primary-action fit" ${r?"":"disabled"}>Continue →</button>
          </div>
        </div>`}case 2:{const r=((a=o.candidate)==null?void 0:a.email)||((n=o.user)==null?void 0:n.email)||"",d=t.phone||((_==null?void 0:_.phone)??""),c=t.currentRole||(((i=(s=_==null?void 0:_.workHistory)==null?void 0:s[0])==null?void 0:i.title)??"");return`
        <div class="onb-step">
          ${lt(2)}
          <p class="eyebrow">Step 2 · Your profile</p>
          <h2 class="onb-heading">Tell us about yourself</h2>
          <p class="onb-sub">This is the basic information we'll use across every role you apply for.</p>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:4px;">
            ${ee("First name",!1,ve("onbFirstName","text",t.firstName||"","María",'autocomplete="given-name"'))}
            ${ee("Last name",!1,ve("onbLastName","text",t.lastName||"","García",'autocomplete="family-name"'))}
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:4px;">
            ${ee("Email",!1,ve("onbEmail","email",r,"","disabled"))}
            ${ee("Phone",!1,ve("onbPhone","tel",d,"+57 300 123 4567",'autocomplete="tel"'))}
          </div>
          ${ee("Current role",!1,ve("onbCurrentRole","text",c,"e.g. Customer Success Manager"))}
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:4px;">
            ${ee("Expected salary — USD",!0,ve("onbSalaryUSD","number",t.expectedSalaryUSD||"","2500",'min="0" step="100"'))}
            ${ee("Expected salary — COP",!0,ve("onbSalaryCOP","number",t.expectedSalaryCOP||"","10000000",'min="0" step="100000"'))}
          </div>
          ${ee("LinkedIn",!0,ve("onbLinkedin","url",t.linkedin||"","https://linkedin.com/in/..."))}
          <p id="onbBasicError" style="font-size:12px;color:#e74c3c;min-height:16px;margin:4px 0 0;"></p>
          ${Ft(1)}
        </div>`}case 3:{const r=t.roleGroup||Object.keys(Me)[0]||"",d=t.department||Object.keys(pe)[0]||"",c=pe[d]||[];return`
        <div class="onb-step">
          ${lt(3)}
          <p class="eyebrow">Step 3 · Role & location</p>
          <h2 class="onb-heading">What role are you looking for, and where are you based?</h2>
          <p class="onb-sub">We use this to match you with the right openings from our clients.</p>
          <div style="display:grid;gap:12px;margin-bottom:4px;">
            ${ee("Area",!1,`<select id="onbRoleGroup" style="font-size:14px;padding:10px 12px;border:1.5px solid var(--border);border-radius:8px;background:#fff;outline:none;">${na(r)}</select>`)}
            ${ee("Role",!1,`<select id="onbTargetRole" style="font-size:14px;padding:10px 12px;border:1.5px solid var(--border);border-radius:8px;background:#fff;outline:none;">${at(r,t.targetRole||"")}</select>`)}
            ${ee("Department",!1,`<select id="onbDept" style="font-size:14px;padding:10px 12px;border:1.5px solid var(--border);border-radius:8px;background:#fff;outline:none;">${Object.keys(pe).map(l=>`<option value="${y(l)}" ${l===d?"selected":""}>${L(l)}</option>`).join("")}</select>`)}
            ${ee("City",!1,`<select id="onbCity" style="font-size:14px;padding:10px 12px;border:1.5px solid var(--border);border-radius:8px;background:#fff;outline:none;">${c.map(l=>`<option value="${y(l)}" ${l===t.city?"selected":""}>${L(l)}</option>`).join("")}</select>`)}
            ${ee("English level",!1,`<select id="onbEnglish" style="font-size:14px;padding:10px 12px;border:1.5px solid var(--border);border-radius:8px;background:#fff;outline:none;">${["","B1","B2","C1","C2","Native"].map(l=>`<option value="${l}" ${l===t.english?"selected":""}>${l||"Select level"}</option>`).join("")}</select>`)}
          </div>
          ${Ft(2,"Review →")}
        </div>`}case 4:return wn();default:return""}}const we="font-size:14px;padding:10px 12px;border:1.5px solid var(--border);border-radius:8px;background:#fff;outline:none;width:100%;box-sizing:border-box;",Pt="flex-shrink:0;width:38px;height:38px;border:1.5px solid var(--border);border-radius:8px;background:#fff;color:var(--light);font-size:14px;cursor:pointer;";function Je(e){return`<label style="display:block;margin-bottom:8px;font-size:11px;font-weight:600;letter-spacing:.07em;text-transform:uppercase;color:var(--light);">${e}</label>`}function wn(){var p;const e=P,t=_||{};!e.experience.length&&Array.isArray(t.workHistory)&&t.workHistory.length&&(e.experience=t.workHistory.map(v=>({company:v.company||"",title:v.title||"",from:v.from||"",to:v.to||""}))),!e.languages.length&&Array.isArray(t.languages)&&t.languages.length&&(e.languages=t.languages.filter(Boolean).map(String)),!e.skills.length&&Array.isArray(t.skills)&&t.skills.length&&(e.skills=[...new Set(t.skills.map(Ae).filter(Boolean))]),!e.certifications.length&&Array.isArray(t.certifications)&&t.certifications.length&&(e.certifications=t.certifications.map(v=>({name:v.name||"",issuer:v.issuer||"",date:v.date||""})));const a=[e.firstName,e.lastName].filter(Boolean).join(" ")||((p=o.candidate)==null?void 0:p.name)||"—",n=e.targetRole||"—",s=[e.city,e.department].filter(Boolean).join(", ")||"—",i=[];e.expectedSalaryUSD&&i.push(`$${Number(e.expectedSalaryUSD).toLocaleString("en-US")} USD/mo`),e.expectedSalaryCOP&&i.push(`$${Number(e.expectedSalaryCOP).toLocaleString("es-CO")} COP/mo`);const r=i.join(" · ")||"—",d=e.english||"—",c=e.phone||"—",l=(ie==null?void 0:ie.name)||"",u=(v,S)=>!S||S==="—"?"":`
    <div style="display:flex;gap:16px;padding:10px 0;border-bottom:1px solid var(--border);">
      <span style="width:110px;flex-shrink:0;font-size:10px;font-weight:700;letter-spacing:.07em;text-transform:uppercase;color:var(--light);padding-top:3px;">${v}</span>
      <span style="font-size:13px;color:var(--black);line-height:1.5;">${L(String(S))}</span>
    </div>`;return`
    <div class="onb-step">
      <p class="eyebrow" style="color:var(--green);">Almost done</p>
      <h2 class="onb-heading">Does this look right?</h2>
      <p class="onb-sub" style="margin-bottom:20px;">Review your profile before we save it. You can always update it later from Settings.</p>
      <div style="border:1.5px solid var(--border);border-radius:12px;padding:2px 16px 2px;margin-bottom:24px;">
        ${u("Name",a)}
        ${u("Role",n)}
        ${u("Location",s)}
        ${u("Salary",r)}
        ${u("English",d)}
        ${u("Phone",c)}
        ${u("Current role",e.currentRole||"—")}
        ${l?u("CV",l):""}
      </div>

      <div class="field" style="margin-bottom:20px;">
        ${Je("Experience")}
        <div id="onbExperienceList"></div>
        <button type="button" class="secondary-action" id="onbAddExperience">+ Add position</button>
      </div>

      <div class="field" style="margin-bottom:20px;">
        ${Je("Languages")}
        <div id="onbLanguagesList"></div>
        <button type="button" class="secondary-action" id="onbAddLanguage">+ Add language</button>
      </div>

      <div class="field" style="margin-bottom:20px;">
        ${Je("Skills")}
        ${sa(e.skills)}
      </div>

      <div class="field" style="margin-bottom:20px;">
        ${Je("Certifications")}
        <div id="onbCertificationsList"></div>
        <button type="button" class="secondary-action" id="onbAddCertification">+ Add certification</button>
      </div>

      <div style="display:flex;justify-content:space-between;align-items:center;">
        <button type="button" id="onbEdit" class="secondary-action">← Edit</button>
        <button type="button" id="onbFinish" class="primary-action fit">${m("check")} Finish setup</button>
      </div>
      <p id="onbFinishErr" style="font-size:12px;color:#e74c3c;text-align:right;min-height:18px;margin-top:6px;"></p>
    </div>`}function et(){const e=document.querySelector("#onbExperienceList");e&&(e.innerHTML="",P.experience.length||(e.innerHTML='<p style="font-size:12px;color:var(--light);margin:0 0 10px;">No experience added yet.</p>'),P.experience.forEach((t,a)=>{var s,i;const n=document.createElement("div");n.style.cssText="border:1.5px solid var(--border);border-radius:10px;padding:12px;margin-bottom:10px;",n.innerHTML=`
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px;">
        <input type="text" data-k="title" placeholder="Title" value="${y(t.title||"")}" style="${we}">
        <input type="text" data-k="company" placeholder="Company" value="${y(t.company||"")}" style="${we}">
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr auto;gap:8px;align-items:center;">
        <input type="month" data-k="from" value="${y(t.from||"")}" style="${we}">
        <input type="month" data-k="to" value="${t.to==="present"?"":y(t.to||"")}" ${t.to==="present"?"disabled":""} style="${we}">
        <button type="button" class="onb-list-remove" aria-label="Remove" style="${Pt}">×</button>
      </div>
      <label style="display:flex;align-items:center;gap:6px;font-size:12px;color:var(--mid);margin-top:8px;">
        <input type="checkbox" data-k="current" ${t.to==="present"?"checked":""}> I currently work here
      </label>`,n.querySelectorAll('input[type="text"][data-k], input[type="month"][data-k]').forEach(r=>{r.addEventListener("input",d=>{t[d.target.dataset.k]=d.target.value})}),(s=n.querySelector('input[type="checkbox"][data-k="current"]'))==null||s.addEventListener("change",r=>{t.to=r.target.checked?"present":"",et()}),(i=n.querySelector(".onb-list-remove"))==null||i.addEventListener("click",()=>{P.experience.splice(a,1),et()}),e.appendChild(n)}))}function vt(){const e=document.querySelector("#onbLanguagesList");if(e){if(e.innerHTML="",P.english){const t=document.createElement("div");t.style.cssText="display:flex;align-items:center;gap:8px;margin-bottom:8px;padding:10px 12px;border:1.5px solid var(--border);border-radius:8px;background:var(--gray-1);font-size:14px;color:var(--black);",t.innerHTML=`<span style="font-weight:600;">English</span><span style="color:var(--light);">${L(P.english)}</span>`,e.appendChild(t)}if(!P.languages.length){const t=document.createElement("p");t.style.cssText="font-size:12px;color:var(--light);margin:0 0 10px;",t.textContent="No other languages added yet.",e.appendChild(t)}P.languages.forEach((t,a)=>{const n=document.createElement("div");n.style.cssText="display:flex;gap:10px;align-items:center;margin-bottom:8px;",n.innerHTML=`
      <input type="text" value="${y(t)}" placeholder="e.g. English (B2)" style="${we}flex:1;">
      <button type="button" class="onb-list-remove" aria-label="Remove" style="${Pt}">×</button>`,n.querySelector("input").addEventListener("input",s=>{P.languages[a]=s.target.value}),n.querySelector(".onb-list-remove").addEventListener("click",()=>{P.languages.splice(a,1),vt()}),e.appendChild(n)})}}function ft(){const e=document.querySelector("#onbCertificationsList");e&&(e.innerHTML="",P.certifications.length||(e.innerHTML='<p style="font-size:12px;color:var(--light);margin:0 0 10px;">No certifications added yet.</p>'),P.certifications.forEach((t,a)=>{const n=document.createElement("div");n.style.cssText="display:flex;gap:10px;align-items:flex-start;margin-bottom:8px;",n.innerHTML=`
      <div class="onb-cert-grid" style="flex:1;">
        <input type="text" data-k="name" value="${y(t.name||"")}" placeholder="Certification name" style="${we}">
        <input type="text" data-k="issuer" value="${y(t.issuer||"")}" placeholder="Issuer" style="${we}">
        <input type="text" data-k="date" value="${y(t.date||"")}" placeholder="Date" style="${we}">
      </div>
      <button type="button" class="onb-list-remove" aria-label="Remove" style="${Pt}">×</button>`,n.querySelectorAll("input[data-k]").forEach(s=>{s.addEventListener("input",i=>{t[i.target.dataset.k]=i.target.value})}),n.querySelector(".onb-list-remove").addEventListener("click",()=>{P.certifications.splice(a,1),ft()}),e.appendChild(n)}))}function bn(e){var n,s,i,r,d;const t=document.querySelector("#onbBack"),a=document.querySelector("#onbNext");switch(t==null||t.addEventListener("click",()=>Oe(e-1)),e){case 1:{const c=document.querySelector("#onbCvInput"),l=document.querySelector("#onbCvStatus"),u=document.querySelector("#onbSkipCv");ie&&c&&(a.disabled=!1),c==null||c.addEventListener("change",()=>{var v;const p=(v=c.files)==null?void 0:v[0];p&&(ie=p,l&&(l.textContent=`✓ ${p.name}`),a.disabled=!1,_=null,je=St(p).catch(()=>null))}),a==null||a.addEventListener("click",()=>ct(2)),u==null||u.addEventListener("click",()=>{ie=null,je=null,ct(2)});break}case 2:{a==null||a.addEventListener("click",()=>{var E,k,M,R,H,B,q;const c=((E=document.querySelector("#onbFirstName"))==null?void 0:E.value.trim())||"",l=((k=document.querySelector("#onbLastName"))==null?void 0:k.value.trim())||"",u=((M=document.querySelector("#onbPhone"))==null?void 0:M.value.trim())||"",p=((R=document.querySelector("#onbCurrentRole"))==null?void 0:R.value.trim())||"",v=((H=document.querySelector("#onbSalaryUSD"))==null?void 0:H.value)||"",S=((B=document.querySelector("#onbSalaryCOP"))==null?void 0:B.value)||"",x=((q=document.querySelector("#onbLinkedin"))==null?void 0:q.value.trim())||"",A=document.querySelector("#onbBasicError");if(!c||!l||!u||!p){A&&(A.textContent="Please fill in your name, phone, and current role.");return}if(!v&&!S){A&&(A.textContent="Please enter an expected salary in USD, COP, or both.");return}P.firstName=c,P.lastName=l,P.phone=u,P.currentRole=p,P.expectedSalaryUSD=v?Number(v):"",P.expectedSalaryCOP=S?Number(S):"",P.linkedin=x,Oe(3)});break}case 3:{const c=document.querySelector("#onbRoleGroup"),l=document.querySelector("#onbTargetRole"),u=document.querySelector("#onbDept"),p=document.querySelector("#onbCity");c==null||c.addEventListener("change",()=>{l.innerHTML=at(c.value,"")}),u==null||u.addEventListener("change",()=>{const v=pe[u.value]||[];p.innerHTML=v.map(S=>`<option value="${y(S)}">${L(S)}</option>`).join("")}),a==null||a.addEventListener("click",()=>{var v;P.roleGroup=(c==null?void 0:c.value)||"",P.targetRole=(l==null?void 0:l.value)||"",P.department=(u==null?void 0:u.value)||"",P.city=(p==null?void 0:p.value)||"",P.english=((v=document.querySelector("#onbEnglish"))==null?void 0:v.value)||"",ct(4)});break}case 4:{(n=document.querySelector("#onbEdit"))==null||n.addEventListener("click",()=>Oe(1)),(s=document.querySelector("#onbFinish"))==null||s.addEventListener("click",Sn),et(),vt(),ft(),(i=document.querySelector("#onbAddExperience"))==null||i.addEventListener("click",()=>{P.experience.push({company:"",title:"",from:"",to:""}),et()}),(r=document.querySelector("#onbAddLanguage"))==null||r.addEventListener("click",()=>{P.languages.push(""),vt()}),(d=document.querySelector("#onbAddCertification"))==null||d.addEventListener("click",()=>{P.certifications.push({name:"",issuer:"",date:""}),ft()}),va();break}}}async function ct(e){var a,n;const t=document.querySelector("#onboardingWizard");if(je&&!_&&(t&&(t.innerHTML='<div class="onb-step"><p style="text-align:center;font-size:14px;font-weight:600;color:var(--green);padding:56px 0;">Analysing your CV…</p></div>'),_=await je),_!=null&&_.phone&&!P.phone&&(P.phone=_.phone),_!=null&&_.name&&!P.firstName&&!P.lastName){const s=String(_.name).trim().split(/\s+/).filter(Boolean);P.firstName=s[0]||"",P.lastName=s.slice(1).join(" ")}(n=(a=_==null?void 0:_.workHistory)==null?void 0:a[0])!=null&&n.title&&!P.currentRole&&(P.currentRole=_.workHistory[0].title),Oe(e)}async function Sn(){var a,n,s,i,r,d,c;const e=document.querySelector("#onbFinish"),t=document.querySelector("#onbFinishErr");e&&(e.disabled=!0,e.innerHTML="Saving…");try{const l=P,u=(a=o.user)==null?void 0:a.uid;if(!u)throw new Error("Not signed in");const p=l.department||"",v=l.city||"",S=Number(l.expectedSalaryUSD||0)||null,x=Number(l.expectedSalaryCOP||0)||null,A=S||x||null,E=S?"USD":x?"COP":"USD",k=A?`${E} ${A.toLocaleString()}/mo`:"",M=[...document.querySelectorAll('[data-skill-search] input[name="skills"]')].map(q=>q.value),R=[l.firstName,l.lastName].filter(Boolean).join(" ")||((n=o.candidate)==null?void 0:n.name)||((s=o.user)==null?void 0:s.displayName)||"";let H={};if(ie)try{const q=await pt(u,ie,"");H={activeCvId:q.id,activeCvName:q.name||q.fileName,cvUrl:q.url,cvLibrary:[q]}}catch{}const B={name:R,firstName:l.firstName||"",lastName:l.lastName||"",targetRole:l.targetRole||"",headline:l.targetRole||"",currentRole:l.currentRole||"",department:p,city:v,location:[v,p].filter(Boolean).join(", "),locationCity:v,locationDepartment:p,locationCountry:"Colombia",locationId:`${String(v).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,"").replace(/[^a-z0-9]+/g,"-")}-co`,english:l.english||"",salary:k,salaryUSD:S,salaryAmount:A,salaryCurrency:E,expectedSalaryUSD:S,expectedSalaryCOP:x,expectedSalaryAmount:A,expectedSalaryCurrency:E,whatsapp:l.phone||"",phone:l.phone||"",linkedin:l.linkedin||"",skills:[...new Set(M.map(Ae).filter(Boolean))],workHistory:l.experience||[],certifications:(l.certifications||[]).filter(q=>q.name&&q.name.trim()),languages:(l.languages||[]).map(q=>q.trim()).filter(Boolean),summary:(_==null?void 0:_.summary)||"",email:((i=o.candidate)==null?void 0:i.email)||((r=o.user)==null?void 0:r.email)||"",candidateCode:(d=o.candidate)==null?void 0:d.candidateCode,marketingConsent:((c=o.candidate)==null?void 0:c.marketingConsent)===!0,availability:"open",onboarded:!0,...H};await wt(u,B),window.history.pushState({page:"overview"},"","/"),w({candidate:{...o.candidate,...B},activePage:"overview",message:"Welcome to Nearwork! Your profile is ready."})}catch{t&&(t.textContent="Something went wrong. Please try again."),e&&(e.disabled=!1,e.innerHTML=`${m("check")} Finish setup`)}}function Cn(){const e=He(),t=o.jobs.map(Se).filter(i=>kt(i,e).length>=3),a=e.length>=5,n=o.matchesFiltered&&a?t:o.jobs.map(Se),s=o.matchesFiltered&&!t.length;return`
    <div class="nw-page-head">
      <div class="nw-page-overline">My search</div>
      <h1 class="nw-page-title">Matches</h1>
      <p class="nw-page-lede">Roles picked for you from your skills, target role, and salary.</p>
    </div>
    <div class="nw-filterbar">
      <button id="filterMatches" class="nw-chip${o.matchesFiltered?" active":""}" type="button">${m(o.matchesFiltered?"list":"filter")} ${o.matchesFiltered?"Show all openings":"Filter by my role & skills"}</button>
      <div class="nw-filter-count">${n.length} of ${o.jobs.length} open roles</div>
    </div>
    <div class="nw-match-grid nw-match-grid--wide">${s?ga("No filtered matches yet","Add a target role and skills in Profile to improve matching."):n.map(i=>Vn(i)).join("")}</div>
  `}function $n(){const e=o.applications||[];return`
    <div class="nw-page-head">
      <div class="nw-page-overline">My journey</div>
      <h1 class="nw-page-title">Applications</h1>
      <p class="nw-page-lede">Every role you've applied to, and exactly where it stands.</p>
    </div>
    ${nn()?`
      <section class="nw-panel nw-pipeline-panel">
        <div class="nw-panel-head"><div><div class="nw-panel-overline">Status</div><div class="nw-panel-title">Where you are in the process</div></div></div>
        ${Hn(zn())}
      </section>`:""}
    <section class="nw-panel nw-applist">
      ${e.length?e.map((a,n)=>Qn(a,n===e.length-1)).join(""):Gn()}
    </section>
  `}function kn(){const e=fe(),t=o.assessments||[],a=t.filter(E=>["sent","started"].includes(String(E.status||"").toLowerCase())),n=t.filter(E=>String(E.status||"").toLowerCase()==="completed"),s=e?t.find(E=>E.id===e):a[0]||n[0]||null;if(o.assessmentUiStep==="techIntro"&&s)return Tn(s);if(o.assessmentUiStep==="discIntro"&&s)return Nn(s);if(e&&!s)return`
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
    `;const i=Array.isArray(s.questions)?s.questions:[],r=String(s.status||"").toLowerCase()==="started",d=String(s.status||"").toLowerCase()==="completed",c=String(s.status||"").toLowerCase()==="cancelled",l=Ln(s),u=Xt(),p=Number(s.currentQuestionIndex||0),v=Math.min(u??p,Math.max(i.length-1,0)),S=i[v],x=(S==null?void 0:S.stage)||s.currentStage||1,A=r&&!d&&!c&&!l;return`
    <div class="nw-assess-wrap">
      ${A?xn(s,x,v,i):Et(s)}
      ${A?An(s,v):""}
      <div class="nw-assess-body" id="assessmentWorkspace">
        ${d?Mn(s):c?`<div class="nw-assess-state-card nw-assess-state-card--inline"><div class="nw-assess-state-icon" style="background:#F5F4F0;color:#555">${m("ban")}</div><strong>Assessment cancelled</strong><p>This assessment is no longer available. A new assigned assessment will appear here when your recruiter sends one.</p></div>`:l?`<div class="nw-assess-state-card nw-assess-state-card--inline"><div class="nw-assess-state-icon" style="background:#FEF0F5;color:#CC3666">${m("clock-x")}</div><strong>Assessment link expired</strong><p>This unique assessment link is no longer valid. Contact your Nearwork recruiter if you need a new one.</p><button class="ghost-action" data-page="recruiter" type="button">${m("message-circle")} Contact recruiter</button></div>`:Pn(s,r,v)}
      </div>
      ${qn(t,s.id)}
    </div>
  `}function Et(e){const t=String(e.status||"").toLowerCase();return`
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
  `}function An(e,t){const a=(e.questions||[]).slice(0,70),n=se(e,1).filter(d=>Ne(rt(e,d))).length,s=se(e,2).filter(d=>Ne(rt(e,d))).length,i=se(e,1).length||50,r=se(e,2).length||20;return`
    <section class="assessment-progress-panel">
      <div><strong>Technical</strong><span>${n}/${i} answered</span></div>
      <div><strong>DISC</strong><span>${s}/${r} answered</span></div>
      <div class="assessment-progress-strip">
        ${a.map((d,c)=>{const l=Ne(rt(e,d));return`<button type="button" class="${c===t?"active":""} ${l?"answered":""}" data-assessment-jump="${c}" title="${At(d.stage)} · Q${c+1}">${c+1}</button>`}).join("")}
      </div>
    </section>
  `}function xn(e,t,a,n){const s=Number(t),i=Rt(e.technicalStartedAt||e.startedAt)||new Date,r=Rt(e.discStartedAt)||new Date,d=s===1?i:r,c=Number(s===1?e.technicalMinutes||60:e.discMinutes||30),l=new Date(d.getTime()+c*60*1e3),u=s===1?"Technical":"DISC profile",p=(n||[]).filter(A=>Number(A.stage||1)===s),v=(n||[]).findIndex(A=>Number(A.stage||1)===s),S=Math.max(0,a-v),x=p.length?Math.round((S+1)/p.length*100):2;return`
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
          <span>${u} &middot; Question ${S+1} of ${p.length||(s===1?50:20)}</span>
        </div>
        <div class="nw-assess-chrome__progresstrack">
          <div class="nw-assess-chrome__progressfill" style="width:${Math.max(2,x)}%"></div>
        </div>
      </div>
      <div class="nw-timer-pill">
        ${m("timer")}
        <span id="assessmentTimer" data-end="${l.toISOString()}">${c}:00</span>
      </div>
      <button class="nw-assess-chrome__exit" type="button">${m("x")} Save &amp; exit</button>
    </div>
  `}function Pn(e,t,a=null){var H,B,q;if(!t){const Z=y(e.role||"Role assessment"),f=y(e.recruiterName||e.recruiter||"Nearwork"),g=tt(e.expiresAt||e.deadline),h=se(e,1).length||50,b=se(e,2).length||20,C=Number(e.technicalMinutes||60),$=Number(e.discMinutes||30);return`
      <div class="nw-assess-welcome">
        <div class="nw-assess-welcome__header">
          <span class="nw-assess-role-chip">${m("sparkles")} ${Z}</span>
          <span>Sent by ${f}${g?" &middot; expires "+g:""}</span>
        </div>
        <h2 class="nw-assess-welcome__title">Let's see how you think — and how you work.</h2>
        <p class="nw-assess-welcome__desc">This assessment has two parts: a role-knowledge check and a behavioral profile.</p>
        <div class="nw-assess-parts">
          <div class="nw-assess-part">
            <div class="nw-assess-part__blob" style="background:#E4F6EF"></div>
            <div class="nw-assess-part__icon" style="background:#E4F6EF;color:#10A07C">${m("code-2")}</div>
            <span class="nw-assess-part__tag" style="color:#10A07C">Part 1</span>
            <strong class="nw-assess-part__title">Technical Assessment</strong>
            <span class="nw-assess-part__sub">${h} questions &middot; ~${C} min</span>
            <p class="nw-assess-part__desc">Single-choice role scenarios. We're looking at how you think, not whether you remember definitions.</p>
          </div>
          <div class="nw-assess-part">
            <div class="nw-assess-part__blob" style="background:#F7F2FC"></div>
            <div class="nw-assess-part__icon" style="background:#F7F2FC;color:#AF7AC5">${m("compass")}</div>
            <span class="nw-assess-part__tag" style="color:#AF7AC5">Part 2</span>
            <strong class="nw-assess-part__title">DISC Profile</strong>
            <span class="nw-assess-part__sub">${b} statements &middot; ~${$} min</span>
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
    `}const n=(e.questions||[]).slice(0,70),s=Math.min(a??Number(e.currentQuestionIndex||0),Math.max(n.length-1,0)),i=n[s],r=((B=(H=e.answers)==null?void 0:H[i.id])==null?void 0:B.value)??((q=e.answers)==null?void 0:q[i.id])??"",d=Array.isArray(i.options)&&i.options.length?i.options:["Strongly agree","Agree","Neutral","Disagree"],c=n[s+1],l=c==null?void 0:c.stage,u=l&&l!==i.stage,p=mt(e,i.stage),v=u&&p.length,S=s+1>=n.length,x=S?mt(e,i.stage):[],A=!!i.multiple,E=Number(i.stage||1)===2?"nw-assess-chip--violet":"nw-assess-chip--teal",k=A?"Multi-select":"Single choice",M=y(i.part||i.type||(Number(i.stage||1)===2?"DISC":"Scenario")),R=y(i.bank||"");return`
    <form id="assessmentQuestionForm" class="nw-assess-qcard" data-current-index="${s}">
      <div class="nw-assess-qmeta">
        <span class="nw-assess-chip ${E}">${M}</span>
        ${R?`<span class="nw-assess-chip nw-assess-chip--gray">${R}</span>`:""}
        <span class="nw-assess-qtype">&middot; ${k}</span>
      </div>
      ${i.context?`<div class="nw-assess-context"><strong>Context: </strong>${y(i.context)}</div>`:""}
      <p class="nw-assess-qprompt">${y(i.q||"")}</p>
      <fieldset class="nw-assess-options${A?" nw-assess-options--multi":""}">
        <legend>${k}</legend>
        ${d.map((Z,f)=>`
          <label class="nw-assess-option${A?" nw-assess-option--multi":""}">
            <input type="radio" name="answer" value="${f}" ${String(r)===String(f)?"checked":""} />
            <span class="nw-assess-option__key">${String.fromCharCode(65+f)}</span>
            <span class="nw-assess-option__text">${y(Z)}</span>
            ${A?"":`<span class="nw-assess-option__check">${m("check-circle-2")}</span>`}
          </label>
        `).join("")}
      </fieldset>
      ${v||x.length?En(e,v?p:x,i.stage):""}
      <div class="nw-assess-qfooter">
        <button class="ghost-action" id="prevAssessmentQuestion" type="button" ${s===0?"disabled":""}>${m("arrow-left")} Back</button>
        <span class="nw-assess-autosave">${m("check")} Auto-saved</span>
        <div style="flex:1"></div>
        <button class="primary-action fit" type="submit">${S?m("send")+" Submit assessment":"Next "+m("arrow-right")}</button>
      </div>
    </form>
  `}function En(e,t,a){if(!t.length)return"";const n=(e.questions||[]).slice(0,70);return`
    <div class="nw-assess-missed">
      <strong>${m("alert-triangle")} Unanswered questions in ${At(a)}</strong>
      <p>You skipped ${t.map(s=>`Question ${n.findIndex(i=>i.id===s.id)+1}`).join(", ")}. You can go back now or continue if you meant to leave them blank.</p>
      <div class="nw-assess-missed__links">${t.map(s=>{const i=n.findIndex(r=>r.id===s.id);return`<button class="ghost-action" type="button" data-assessment-jump="${i}">${m("arrow-left")} Go to ${i+1}</button>`}).join("")}</div>
    </div>
  `}function Ln(e){return!(e!=null&&e.expiresAt)||String(e.status||"").toLowerCase()==="completed"?!1:Date.now()>new Date(e.expiresAt).getTime()}function Tn(e){const t=y(e.role||"Role assessment"),a=se(e,1).length||50,n=Number(e.technicalMinutes||60);return`
    <div class="nw-assess-wrap">
      ${Et(e)}
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
  `}function Nn(e){const t=se(e,1).length||50,a=se(e,2).length||20,n=Number(e.discMinutes||30),s=y(e.recruiterName||e.recruiter||"your recruiter"),i=(e.questions||[]).findIndex(r=>Number(r.stage||1)===2);return`
    <div class="nw-assess-wrap">
      ${Et(e)}
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
  `}function Mn(e){var r,d;const a=(((r=o.candidate)==null?void 0:r.name)||((d=o.user)==null?void 0:d.displayName)||"").split(" ")[0]||"You",n=y(e.recruiterName||e.recruiter||"your recruiter"),s=se(e,1).length||50,i=se(e,2).length||20;return`
    <div class="nw-assess-complete">
      <div class="nw-assess-complete__hero">
        <div class="nw-assess-complete__icon">
          ${m("check")}
          <div class="nw-assess-complete__ring1"></div>
          <div class="nw-assess-complete__ring2"></div>
        </div>
        <h2 class="nw-assess-complete__title">You're done, ${y(a)}.</h2>
        <p class="nw-assess-complete__desc">Your results have been sent to ${n}. They'll reach out personally — usually within a business day.</p>
      </div>
      <div class="nw-assess-complete__chips">
        <span class="nw-assess-complete__chip nw-assess-complete__chip--teal">${m("clipboard-check")} Part 1 &middot; ${s}/${s} answered</span>
        <span class="nw-assess-complete__chip nw-assess-complete__chip--violet">${m("compass")} Part 2 &middot; ${i}/${i} answered</span>
        <span class="nw-assess-complete__chip nw-assess-complete__chip--gray">${m("check-circle-2")} Assessment complete</span>
      </div>
      <div class="nw-assess-next">
        <div class="nw-assess-next__label">What happens next</div>
        ${[{icon:"inbox",title:"Your recruiter reviews your results",desc:`${n} will read your scenarios and DISC profile, usually within one business day.`,when:"Within 24h"},{icon:"message-square",title:`A personal note from ${n}`,desc:"Not an automated email. They'll share what stood out and what comes next.",when:"Tomorrow"},{icon:"calendar-check",title:"Interview with the hiring team",desc:"If there's a match, you'll get a calendar link to book a slot that works for you.",when:"This week"}].map(({icon:c,title:l,desc:u,when:p},v)=>`
          <div class="nw-assess-next__item">
            <div class="nw-assess-next__icon-wrap">
              <div class="nw-assess-next__iconbox">${m(c)}</div>
              <div class="nw-assess-next__num">${v+1}</div>
            </div>
            <div class="nw-assess-next__body">
              <div class="nw-assess-next__title">${l}</div>
              <div class="nw-assess-next__desc">${u}</div>
            </div>
            <div class="nw-assess-next__when">${p}</div>
          </div>
        `).join("")}
      </div>
      <div class="nw-assess-recruiter">
        <div class="nw-assess-recruiter__avatar">${(e.recruiterName||e.recruiter||"NW").split(" ").map(c=>c[0]).join("").slice(0,2).toUpperCase()}</div>
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
            <div><strong>${y(a.role||"Nearwork assessment")}</strong><span>${y(a.id||"")}</span></div>
            <div>${y(String(a.status||"assigned"))}</div>
            <a href="/assessment/${encodeURIComponent(a.id)}/start">${a.status==="completed"?"View":"Continue"}</a>
          </article>
        `).join("")}
      </div>
    </section>
  `:""}function In(e,t){const a=e.questions||[],n=a.filter(d=>d.stage===1),s=a.filter(d=>d.stage===2),i=n.filter(d=>{var c;return typeof d.correctIndex=="number"&&Number((c=t[d.id])==null?void 0:c.value)===d.correctIndex}).length,r=s.filter(d=>{var c;return Ne(((c=t[d.id])==null?void 0:c.value)??t[d.id])}).length;return{technicalScore:n.length?Math.round(i/n.length*100):0,discScore:s.length?Math.round(r/s.length*100):0}}function Dn(e,t){var d,c;const a={Dominance:0,Influence:0,Steadiness:0,Conscientiousness:0};(e.questions||[]).filter(l=>Number(l.stage)===2).forEach(l=>{var S;const u=(S=t[l.id])==null?void 0:S.value;if(!Ne(u))return;const p=a[l.skill]!==void 0?l.skill:"Steadiness",v=Math.max(1,4-Number(u||0));a[p]+=v});const n=Object.entries(a).sort((l,u)=>u[1]-l[1]),s=((d=n[0])==null?void 0:d[0])||"Steadiness",i=((c=n[n.length-1])==null?void 0:c[0])||"Dominance";return{label:{Dominance:"D",Influence:"I",Steadiness:"S",Conscientiousness:"C"}[s]||"S",high:s,low:i,scores:a,summary:`${s} is the strongest observed DISC tendency; ${i} appears lowest based on this assessment.`}}async function _n(e,t){var c,l,u,p,v;const a="https://admin.nearwork.co/api/send-email",n=e.candidateEmail||((c=o.user)==null?void 0:c.email)||((l=o.candidate)==null?void 0:l.email),s=e.candidateName||((u=o.candidate)==null?void 0:u.name)||((p=o.user)==null?void 0:p.displayName)||"there",i=ra([e.recruiterEmail,e.stakeholderEmail,e.hiringManagerEmail].filter(Boolean).join(",")),r=[];n&&r.push(fetch(a,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({to:n,templateId:"assessment_completed_candidate",data:{name:s,role:e.role,actionUrl:"https://talent.nearwork.co/assessment",actionText:"Open assessment center"}})}));const d=i.length?i:["support@nearwork.co"];r.push(fetch(a,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({to:d,templateId:"assessment_completed_recruiter",data:{name:"Nearwork team",role:e.role,actionUrl:`https://admin.nearwork.co/assessments/${e.id}/questions`,actionText:"Review assessment",message:`${s} completed the assessment. Overall: ${t.score}%. Technical: ${t.technicalScore}%. DISC: ${((v=t.discProfile)==null?void 0:v.label)||"Submitted"}.`}})})),await Promise.allSettled(r)}function Rn(){var t;const e=((t=o.candidate)==null?void 0:t.cvLibrary)||[];return`
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
        ${e.length?e.map(a=>`<article class="cv-item">${m("file-text")}<div><strong>${a.name||a.fileName}</strong><span>${tt(a.uploadedAt)}</span></div>${a.url?`<a href="${a.url}" target="_blank" rel="noreferrer">Open</a>`:""}</article>`).join(""):ga("No CVs saved yet","Upload role-specific resumes here.")}
      </div>
    </section>
  `}function Un(){return`
    <div class="nw-page-head">
      <div class="nw-page-overline">Support</div>
      <h1 class="nw-page-title">Tips</h1>
      <p class="nw-page-lede">Practical prep for US SaaS interviews — short, useful guidance before recruiter screens, assessments, and client interviews.</p>
    </div>
    <section class="tips-grid rich" style="margin-top:18px;">
      ${en.map((e,t)=>`
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
  `}function Fn(){return jn("profile")}function G(e,t=!1){return`<span class="pf-label">${e}${t?'<span class="pf-optional">optional</span>':""}</span>`}function te(e,t,a=""){return`
    <div class="pf-card-head">
      <div class="pf-card-icon">${m(e)}</div>
      <div class="pf-card-title">${t}</div>
      ${a?`<span class="pf-card-badge">${a}</span>`:""}
    </div>`}function Lt(e,t={}){const a=e,n=(t.company||"?")[0].toUpperCase();return`
    <div class="pf-sub-card work-entry" data-work-index="${a}">
      <div class="pf-sub-card-left">
        <div class="pf-work-avatar">${n}</div>
      </div>
      <div class="pf-sub-card-body">
        <div class="pf-field-row">
          <label class="pf-field">
            ${G("Job title")}
            <input type="text" class="pf-input work-field" data-field="title" value="${y(t.title||"")}" placeholder="e.g. Customer Success Manager" />
          </label>
          <label class="pf-field">
            ${G("Company")}
            <input type="text" class="pf-input work-field" data-field="company" value="${y(t.company||"")}" placeholder="e.g. Acme Corp" />
          </label>
        </div>
        <div class="pf-field-row pf-field-row--3">
          <label class="pf-field">
            ${G("From")}
            <input type="text" class="pf-input work-field" data-field="from" value="${y(t.from||"")}" placeholder="2021-03" />
          </label>
          <label class="pf-field">
            ${G("To")}
            <input type="text" class="pf-input work-field" data-field="to" value="${y(t.to||"")}" placeholder="present" />
          </label>
          <div></div>
        </div>
      </div>
      <button type="button" class="pf-remove-btn remove-work-entry" data-remove="${a}" aria-label="Remove">
        ${m("x")}
      </button>
    </div>`}const On=["","A1","A2","B1","B2","C1","C2","Native"];function Tt(e,t={}){const a=e,n=typeof t=="string"?{name:t,level:""}:t;return`
    <div class="pf-sub-card lang-entry" data-lang-index="${a}">
      <div class="pf-sub-card-body">
        <div class="pf-field-row">
          <label class="pf-field">
            ${G("Language")}
            <input type="text" class="pf-input lang-field" data-field="name" value="${y(n.name||"")}" placeholder="e.g. Spanish, French…" />
          </label>
          <label class="pf-field">
            ${G("Level")}
            <select class="pf-input lang-field" data-field="level">
              ${On.map(s=>`<option value="${s}" ${(n.level||"")===s?"selected":""}>${s||"Select level"}</option>`).join("")}
            </select>
          </label>
        </div>
      </div>
      <button type="button" class="pf-remove-btn remove-lang-entry" data-remove="${a}" aria-label="Remove">
        ${m("x")}
      </button>
    </div>`}function Nt(e,t={}){const a=e;return`
    <div class="pf-sub-card cert-entry" data-cert-index="${a}">
      <div class="pf-sub-card-left">
        <div class="pf-cert-icon">✓</div>
      </div>
      <div class="pf-sub-card-body">
        <div class="pf-field-row">
          <label class="pf-field">
            ${G("Certificate / Course")}
            <input type="text" class="pf-input cert-field" data-field="name" value="${y(t.name||"")}" placeholder="e.g. Google Analytics" />
          </label>
          <label class="pf-field">
            ${G("Issuer",!0)}
            <input type="text" class="pf-input cert-field" data-field="issuer" value="${y(t.issuer||"")}" placeholder="e.g. Coursera, HubSpot" />
          </label>
        </div>
        <label class="pf-field" style="max-width:200px;">
          ${G("Date (YYYY-MM)",!0)}
          <input type="text" class="pf-input cert-field" data-field="date" value="${y(t.date||"")}" placeholder="2023-06" />
        </label>
      </div>
      <button type="button" class="pf-remove-btn remove-cert-entry" data-remove="${a}" aria-label="Remove">
        ${m("x")}
      </button>
    </div>`}function jn(e="profile"){var p,v,S,x,A,E,k,M,R,H,B,q,Z,f,g,h,b,C;const t=He(),a=sn(),n=pe[a.department]||[],s=((p=o.candidate)==null?void 0:p.salaryCurrency)||"USD",i=ia(((v=o.candidate)==null?void 0:v.salaryAmount)||((S=o.candidate)==null?void 0:S.salary)||((x=o.candidate)==null?void 0:x.salaryUSD),s),r=on(),d=((A=o.candidate)==null?void 0:A.targetRole)||((E=o.candidate)==null?void 0:E.headline)||"",c=pa(),l=xt(),u=l.filter($=>$.done).length;return`
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
      <div class="pf-progress-label">${u} of ${l.length} sections complete</div>

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
            ${te("user-round","Identity")}
            <div class="pf-identity-row">
              <div class="pf-avatar-upload">
                ${ta("large")}
                <label class="pf-photo-btn">
                  ${m("camera")} Change photo
                  <input name="photo" type="file" accept="image/png,image/jpeg,image/webp" style="display:none;" />
                </label>
              </div>
              <div class="pf-field" style="flex:1;">
                ${G("Full name")}
                <input class="pf-input" name="name" value="${y(((k=o.candidate)==null?void 0:k.name)||((M=o.user)==null?void 0:M.displayName)||"")}" placeholder="Your full name" />
              </div>
            </div>
          </div>

          <!-- ── Role ── -->
          <div class="pf-card">
            ${te("briefcase-business","Role applying for")}
            <div class="pf-field-row">
              <label class="pf-field">
                ${G("Area")}
                <select class="pf-input" name="roleGroup" id="roleGroupSelect">
                  ${na(r)}
                </select>
              </label>
              <label class="pf-field">
                ${G("Target role")}
                <select class="pf-input" name="targetRole" id="targetRoleSelect">
                  ${at(r,d)}
                </select>
              </label>
            </div>
          </div>

          <!-- ── Location ── -->
          <div class="pf-card">
            ${te("map-pin","Location")}
            <div class="pf-field-row">
              <label class="pf-field">
                ${G("Department")}
                <select class="pf-input" name="department" id="departmentSelect">
                  ${Object.keys(pe).map($=>`<option value="${y($)}" ${$===a.department?"selected":""}>${$}</option>`).join("")}
                </select>
              </label>
              <label class="pf-field">
                ${G("City")}
                <select class="pf-input" name="city" id="citySelect">
                  ${n.map($=>`<option value="${y($)}" ${$===a.city?"selected":""}>${$}</option>`).join("")}
                </select>
              </label>
            </div>
          </div>

          <!-- ── Compensation ── -->
          <div class="pf-card">
            ${te("banknote","Compensation")}
            <label class="pf-field" style="max-width:280px;">
              ${G("Target monthly salary")}
              <div class="pf-salary-wrap">
                <select id="salaryCurrencyInput" name="salaryCurrency" class="pf-currency-select">
                  <option value="USD" ${i.salaryCurrency==="USD"?"selected":""}>USD</option>
                  <option value="COP" ${i.salaryCurrency==="COP"?"selected":""}>COP</option>
                </select>
                <input class="pf-input pf-salary-input" id="salaryInput" name="salary" value="${y(i.salaryAmount?gt(i.salaryAmount,i.salaryCurrency):"")}" inputmode="numeric" placeholder="2,500" />
              </div>
              <span class="pf-hint">How much you're looking for, per month.</span>
            </label>
          </div>

          <!-- ── English & languages ── -->
          <div class="pf-card" id="langCard">
            ${te("languages","English & languages")}
            <label class="pf-field" style="max-width:280px; margin-bottom:14px;">
              ${G("English level")}
              <select class="pf-input" name="english">
                ${["","B1","B2","C1","C2","Native"].map($=>{var F;return`<option value="${$}" ${((F=o.candidate)==null?void 0:F.english)===$?"selected":""}>${$||"Select level"}</option>`}).join("")}
              </select>
            </label>
            ${G("Other languages",!0)}
            <p class="pf-hint">Add any other languages you speak and your level in each.</p>
            <div id="langEntries" class="pf-entries">
              ${(((R=o.candidate)==null?void 0:R.languages)||[]).map(($,F)=>Tt(F,$)).join("")}
            </div>
            <button type="button" id="addLangEntry" class="pf-add-btn">
              ${m("plus")} Add language
            </button>
          </div>

          <!-- ── Contact ── -->
          <div class="pf-card">
            ${te("phone","Contact")}
            <div class="pf-field-row">
              <label class="pf-field">
                ${G("WhatsApp number")}
                <input class="pf-input" name="whatsapp" value="${y(((H=o.candidate)==null?void 0:H.whatsapp)||((B=o.candidate)==null?void 0:B.phone)||"")}" inputmode="tel" autocomplete="tel" placeholder="+57 300 123 4567" required />
              </label>
              <label class="pf-field">
                ${G("LinkedIn",!0)}
                <input class="pf-input" name="linkedin" value="${y(((q=o.candidate)==null?void 0:q.linkedin)||"")}" placeholder="https://linkedin.com/in/…" />
              </label>
            </div>
          </div>

          <!-- ── Communications ── -->
          <div class="pf-card">
            ${te("mail","Communications")}
            <label class="pf-checkbox-row">
              <input type="checkbox" name="marketingConsent" ${((Z=o.candidate)==null?void 0:Z.marketingConsent)===!0?"checked":""} />
              <span>Send me job opportunities and updates from Nearwork by email</span>
            </label>
            <p class="pf-hint">You can turn this on or off at any time. It won't affect emails about your active applications.</p>
          </div>

          ${e==="onboarding"?"":`
          <!-- ── Danger zone ── -->
          <div class="pf-card pf-danger-card">
            ${te("trash-2","Delete account")}
            <p class="pf-hint">Permanently delete your Nearwork profile, resume, applications, and assessment history. This cannot be undone — you can create a new account with the same email later if you change your mind.</p>
            <button type="button" id="openDeleteAccount" class="pf-danger-btn">
              ${m("trash-2")} Delete my account
            </button>
          </div>`}

        </div>

        <!-- ── Skills ── -->
        <div class="pf-tab-panel" data-tab-panel="skills" hidden>
          <div class="pf-card">
            ${te("sparkles","Skills",t.length?`${t.length} added`:"")}
            ${sa(t)}
          </div>
        </div>

        <!-- ── CV ── -->
        <div class="pf-tab-panel" data-tab-panel="cv" hidden>
          <div class="pf-card" id="profileCvCard">
            ${te("file-text","CV")}
            <p class="pf-hint">Upload the CV you want Nearwork to use for your applications.</p>
            ${(f=o.candidate)!=null&&f.activeCvName||(g=o.candidate)!=null&&g.cvUrl?`
              <div class="pf-cv-current">
                <div class="pf-cv-icon">${m("file-text")}</div>
                <div class="pf-cv-info">
                  <strong>${L(o.candidate.activeCvName||"CV on file")}</strong>
                  <span>Currently active · upload below to replace</span>
                </div>
                ${o.candidate.cvUrl?`<a class="pf-cv-open" href="${y(o.candidate.cvUrl)}" target="_blank" rel="noreferrer">${m("external-link")} Open</a>`:""}
              </div>`:""}
            <label class="pf-file-label" for="profileCvFileInput">
              ${m("upload")} Choose file (.pdf, .doc, .docx)
            </label>
            <input id="profileCvFileInput" name="profileCv" type="file" accept=".pdf,.doc,.docx" style="display:none;" />
            <label class="pf-field" style="margin-top:10px;">
              ${G("CV label",!0)}
              <input class="pf-input" name="profileCvLabel" type="text" placeholder="e.g. Customer Success CV" />
            </label>
          </div>
        </div>

        <!-- ── Experience ── -->
        <div class="pf-tab-panel" data-tab-panel="experience" hidden>

          <!-- ── Summary ── -->
          <div class="pf-card">
            ${te("align-left","Summary","optional")}
            <textarea class="pf-input pf-textarea" name="summary" placeholder="Add a short note about what you do best — 2–3 sentences.">${L(((h=o.candidate)==null?void 0:h.summary)||"")}</textarea>
          </div>

          <!-- ── Work history ── -->
          <div class="pf-card" id="workHistoryCard">
            ${te("building-2","Work experience","optional")}
            <p class="pf-hint">Add your previous roles so recruiters can see your background.</p>
            <div id="workEntries" class="pf-entries">
              ${(((b=o.candidate)==null?void 0:b.workHistory)||[]).map(($,F)=>Lt(F,$)).join("")}
            </div>
            <button type="button" id="addWorkEntry" class="pf-add-btn">
              ${m("plus")} Add position
            </button>
          </div>

        </div>

        <!-- ── Certifications ── -->
        <div class="pf-tab-panel" data-tab-panel="certifications" hidden>
          <div class="pf-card" id="certCard">
            ${te("graduation-cap","Certifications &amp; courses","optional")}
            <p class="pf-hint">Add certificates, licences, or courses relevant to your work.</p>
            <div id="certEntries" class="pf-entries">
              ${(((C=o.candidate)==null?void 0:C.certifications)||[]).map(($,F)=>Nt(F,$)).join("")}
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
            ${G("Type DELETE to confirm")}
            <input class="pf-input" id="deleteConfirmInput" autocomplete="off" />
          </label>
          ${o.deleteAccountStatus==="error"?`<div class="nw-modal-error">${L(o.deleteAccountError||"Something went wrong.")}</div>`:""}
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
  `}function pa(){const e=xt(),t=e.filter(a=>a.done).length;return Math.max(25,Math.round(t/e.length*100))}function zn(){const e=o.applications[0];return(e==null?void 0:e.stage)||(e==null?void 0:e.status)||"profile-review"}function Hn(e){const t=String(e).toLowerCase().replace(/_/g,"-").replace(/\s+/g,"-"),a=Math.max(0,_t.findIndex(n=>t.includes(n.key)||n.key.includes(t)));return`<div class="pipeline">${_t.map((n,s)=>`<article class="${s<=a?"done":""} ${s===a?"current":""}"><span>${s+1}</span><strong>${n.label}</strong><p>${n.help}</p></article>`).join("")}</div>`}function Gn(){return`
    <div class="nw-empty">
      ${m("briefcase-business")}
      <strong>No active pipeline yet</strong>
      <p>Browse current openings and apply when you find a role that fits. Nearwork will show your applications here once you apply.</p>
      <div style="display:flex;gap:8px;margin-top:12px;">
        <button class="nw-btn-primary" type="button" data-page="matches">${m("sparkles")} View matches</button>
        <a class="nw-btn-secondary" href="https://jobs.nearwork.co" target="_blank" rel="noreferrer">${m("external-link")} Open jobs</a>
      </div>
    </div>
  `}function ma(){try{return new Set(JSON.parse(localStorage.getItem("nw_talent_applied")||"[]"))}catch{return new Set}}function Vn(e){const t=Se(e),n=new Set(o.applications.map(p=>p.jobId||p.openingCode)).has(t.code)||ma().has(t.code),s=kt(t),i=t.match||(s.length>=3?Math.min(97,70+s.length*4):null),r=["#10A07C","#EC4E7E","#3B82F6","#F4A52E"],d=r[t.orgName.length%r.length],c=t.orgName.split(/\s+/).slice(0,2).map(p=>p[0]).join("").toUpperCase(),l=`https://jobs.nearwork.co/apply?code=${encodeURIComponent(t.code)}`,u=(s.length?s:t.skills).slice(0,3);return`
    <div class="nw-match-card">
      <div class="nw-match-card-top">
        <div class="nw-match-avatar" style="background:${d};">${c}</div>
        ${i?`<div class="nw-match-score">${i}% match</div>`:""}
      </div>
      <div class="nw-match-role">${L(t.title)}</div>
      <div class="nw-match-company">${L(t.orgName)} · ${L(t.location)}</div>
      <div class="nw-match-chips">${u.map(L).map(p=>`<span class="nw-match-chip">${p}</span>`).join("")}</div>
      <div class="nw-match-footer">
        <span class="nw-match-salary">${L(t.compensation)}</span>
        <a href="${l}" target="_blank" rel="noreferrer" class="nw-match-view">View opening ${m("arrow-up-right")}</a>
      </div>
      <button class="nw-match-applybtn${n?" applied":""}" type="button" data-apply="${t.code}" ${n?"disabled":""}>${n?`${m("check")} Applied`:`Apply now ${m("arrow-right")}`}</button>
    </div>
  `}function Qn(e,t){const a=String(e.stage||e.status||"applied").toLowerCase(),n=a.includes("offer")?4:a.includes("final")?3:a.includes("interview")?2:a.includes("assessment")?1:0,s=e.clientName||e.company||"Nearwork client",i=s.split(/\s+/).slice(0,2).map(l=>l[0]).join("").toUpperCase(),r=["#10A07C","#EC4E7E","#3B82F6","#F4A52E","#8B5CF6"],d=r[s.length%r.length],c=["action-needed","interview-scheduled","assessment-sent"].includes(String(e.status||"").toLowerCase());return`
    <div class="nw-app-row${t?" last":""}">
      <div class="nw-app-avatar" style="background:${d};">${i}</div>
      <div class="nw-app-info">
        <div class="nw-app-title">${L(e.jobTitle||e.title||"Application")} <span class="nw-app-company">· ${L(s)}</span></div>
        <div class="nw-app-stages">
          ${Zt.map((l,u)=>`<div class="nw-stage-pip${u<=n?" done":""}"></div>`).join("")}
          <span class="nw-app-stage-label">${e.stage||e.status||"Applied"}</span>
        </div>
      </div>
      <div class="nw-app-meta">
        <span class="nw-app-status${c?" action":""}">${e.status||"In review"}</span>
        <div class="nw-app-date">${tt(e.updatedAt||e.createdAt)}</div>
      </div>
      ${m("chevron-right")}
    </div>`}function Jn(e=!1){var i;const t=((i=o.candidate)==null?void 0:i.recruiter)||{},a=t.email||"support@nearwork.co",n=t.whatsapp||Ya,s=t.whatsappUrl||Za;return`<article class="recruiter-card"><div class="avatar recruiter-avatar">NW</div><div><strong>${t.name||"Nearwork Support"}</strong><p><a href="mailto:${a}">${a}</a></p><p><a href="${s}" target="_blank" rel="noreferrer">WhatsApp ${n}</a></p>${e?"<span>Questions about assessments, interviews, feedback, or CV selection should go here.</span>":""}</div></article>`}function ga(e,t){return`<div class="empty-state">${m("inbox")}<strong>${e}</strong><p>${t}</p></div>`}function Wn(){$t.innerHTML='<main class="loading-screen"><span class="logo-mark">N</span><p>Loading Talent...</p></main>'}function Yn(){var e,t,a,n,s,i,r,d,c,l,u,p,v,S,x,A,E,k,M,R,H,B,q,Z;(e=document.querySelector("#signOut"))==null||e.addEventListener("click",async()=>{await It(O),Y&&Y(),Y=null,Ke=!1,W=!1,re=null,window.history.pushState({page:"overview"},"","/"),w({user:null,candidate:null,applications:[],assessments:[],jobs:[],view:"login",activePage:"overview",message:""})}),(t=document.querySelector("#signIn"))==null||t.addEventListener("click",()=>{window.history.pushState({page:"overview"},"","/"),w({view:"login",activePage:"overview",message:""})}),(a=document.querySelector("#openDeleteAccount"))==null||a.addEventListener("click",()=>{w({showDeleteAccountModal:!0,deleteAccountStatus:null,deleteAccountError:""})}),(n=document.querySelector("#cancelDeleteAccount"))==null||n.addEventListener("click",()=>{w({showDeleteAccountModal:!1,deleteAccountStatus:null,deleteAccountError:""})}),(s=document.querySelector("#confirmDeleteAccount"))==null||s.addEventListener("click",async()=>{var g,h;if(((h=(g=document.querySelector("#deleteConfirmInput"))==null?void 0:g.value)==null?void 0:h.trim())!=="DELETE"){w({deleteAccountStatus:"error",deleteAccountError:'Type "DELETE" to confirm.'});return}w({deleteAccountStatus:"deleting"});try{await Ha(),await It(O),Y&&Y(),Y=null,Ke=!1,W=!1,re=null,window.history.pushState({page:"overview"},"","/"),w({user:null,candidate:null,applications:[],assessments:[],jobs:[],view:"login",activePage:"overview",showDeleteAccountModal:!1,deleteAccountStatus:null,deleteAccountError:"",message:"Your account has been deleted. You're welcome to sign up again anytime."})}catch(b){w({deleteAccountStatus:"error",deleteAccountError:b.message||"Failed to delete account."})}}),document.querySelectorAll("[data-page]").forEach(f=>{f.addEventListener("click",g=>{const b=(g.currentTarget.closest("[data-page]")||g.currentTarget).dataset.page;if(o.activePage==="profile"&&W&&b!=="profile"){re=b,w({showUnsavedChangesModal:!0});return}Le(b)})}),(i=document.querySelector("[data-dashboard-home]"))==null||i.addEventListener("click",()=>{if(o.activePage==="profile"&&W){re="overview",w({showUnsavedChangesModal:!0});return}Le("overview")}),(r=document.querySelector("#cancelUnsavedNav"))==null||r.addEventListener("click",()=>{re=null,w({showUnsavedChangesModal:!1})}),(d=document.querySelector("#discardUnsavedNav"))==null||d.addEventListener("click",()=>{W=!1;const f=re;re=null,w({showUnsavedChangesModal:!1}),f&&Le(f)}),(c=document.querySelector("#saveUnsavedNav"))==null||c.addEventListener("click",()=>{var f;w({showUnsavedChangesModal:!1}),(f=document.querySelector("#profileForm"))==null||f.requestSubmit()}),(l=document.querySelector("#notificationBell"))==null||l.addEventListener("click",()=>{w({notificationPanelOpen:!o.notificationPanelOpen,notificationSettingsOpen:!1})}),(u=document.querySelector("#notificationSettings"))==null||u.addEventListener("click",()=>{w({notificationSettingsOpen:!o.notificationSettingsOpen,notificationPanelOpen:!1})}),document.querySelectorAll("[data-notification-read]").forEach(f=>{f.addEventListener("click",async()=>{const g=f.dataset.notificationRead;o.user&&ye&&await Ja(g).catch(()=>null),w({notifications:o.notifications.map(h=>h.id===g?{...h,read:!0}:h)})})}),document.querySelectorAll("[data-notification-pref]").forEach(f=>{f.addEventListener("change",async()=>{var C;const g=structuredClone(((C=o.candidate)==null?void 0:C.notificationPreferences)||{}),h=f.dataset.notificationPref,b=f.dataset.channel;g[h]={...g[h]||{},[b]:f.checked},w({candidate:{...o.candidate,notificationPreferences:g}}),o.user&&ye&&await Wa(o.user.uid,g).catch(()=>null)})}),document.querySelectorAll("[data-assessment-jump]").forEach(f=>{f.addEventListener("click",async()=>{var F,K,D;const g=fe()||((F=(o.assessments||[])[0])==null?void 0:F.id),h=(o.assessments||[]).find(I=>I.id===g),b=Number(f.dataset.assessmentJump||0),C=(K=h==null?void 0:h.questions)==null?void 0:K[b];if(!g||!C)return;await Be(g,"__progress__","",{currentQuestionIndex:b,totalQuestions:((D=h==null?void 0:h.questions)==null?void 0:D.length)||70,currentStage:C.stage||1}),Ee(g,b);const $=(o.assessments||[]).map(I=>I.id===g?{...I,currentQuestionIndex:b,currentStage:C.stage||1}:I);w({assessments:$,activePage:"assessment",message:""})})}),document.querySelector("#availability").addEventListener("change",async f=>{const g=f.target.value;w({candidate:{...o.candidate,availability:g}}),o.user&&ye?await za(o.user.uid,g):w({message:"Sign in with Google to save availability."})}),(p=document.querySelector("#filterMatches"))==null||p.addEventListener("click",()=>{const f=He().length>=3;w({matchesFiltered:f?!o.matchesFiltered:!1,message:f?"":"Add at least 5 skills in Profile first, then filter matching openings."})}),(v=document.querySelector("#departmentSelect"))==null||v.addEventListener("change",f=>{const g=document.querySelector("#citySelect"),h=pe[f.target.value]||[];g.innerHTML=h.map(b=>`<option value="${y(b)}">${b}</option>`).join("")}),(S=document.querySelector("#roleGroupSelect"))==null||S.addEventListener("change",f=>{const g=document.querySelector("#targetRoleSelect");g.innerHTML=at(f.target.value,"")}),(x=document.querySelector("#salaryCurrencyInput"))==null||x.addEventListener("change",f=>{const g=document.querySelector("#salaryInput");if(!g)return;const h=Ut(g.value,f.target.value);f.target.value=h,g.placeholder=h==="COP"?"5,000,000":"2,500",g.value=gt(g.value,h)}),(A=document.querySelector("#salaryInput"))==null||A.addEventListener("blur",f=>{const g=document.querySelector("#salaryCurrencyInput"),h=Ut(f.target.value,(g==null?void 0:g.value)||"USD");g&&(g.value=h),f.target.placeholder=h==="COP"?"5,000,000":"2,500",f.target.value=gt(f.target.value,h)}),hn(),va(),ss(),Kn(),as(),es(),Zn(),document.querySelectorAll("[data-apply]").forEach(f=>{f.addEventListener("click",async()=>{const g=o.jobs.map(Se).find(b=>b.code===f.dataset.apply),h=f.dataset.apply;if(f.disabled=!0,f.textContent="Submitted",o.user&&ye){try{const b=ma();b.add(h),localStorage.setItem("nw_talent_applied",JSON.stringify([...b]))}catch{}await ja(o.user.uid,g),await da(o.user),Le("applications")}else w({message:"Sign in with Google to apply to this opening."})})}),(E=document.querySelector("#showTechIntro"))==null||E.addEventListener("click",()=>{w({assessmentUiStep:"techIntro",message:""})}),(k=document.querySelector("#backToWelcome"))==null||k.addEventListener("click",()=>{w({assessmentUiStep:null,message:""})}),(M=document.querySelector("#startDiscAssessment"))==null||M.addEventListener("click",async()=>{var K;const f=fe()||((K=(o.assessments||[])[0])==null?void 0:K.id),g=(o.assessments||[]).find(D=>D.id===f);if(!f||!g)return;const h=g.questions||[],b=document.querySelector("#startDiscAssessment"),C=b?Number(b.dataset.discIndex||50):h.findIndex(D=>Number(D.stage||1)===2),$=C>=0?C:50,F=new Date().toISOString();try{await Be(f,"__progress__","",{currentQuestionIndex:$,totalQuestions:h.length,currentStage:2,discStartedAt:F}),Ee(f,$);const D=(o.assessments||[]).map(I=>I.id===f?{...I,currentQuestionIndex:$,currentStage:2,discStartedAt:F}:I);w({assessments:D,activePage:"assessment",assessmentUiStep:null,message:""})}catch(D){w({message:he(D)})}}),(R=document.querySelector("#startAssessment"))==null||R.addEventListener("click",async()=>{var h;const f=fe()||((h=(o.assessments||[])[0])==null?void 0:h.id),g=(o.assessments||[]).find(b=>b.id===f)||(o.assessments||[])[0];if(!f||!o.user){w({message:"Please log in to start your assessment."});return}try{await Fa(f,o.user.uid),Ee(f,Number((g==null?void 0:g.currentQuestionIndex)||0),!0);const b=(o.assessments||[]).map(C=>C.id===f?{...C,status:"started",startedAt:C.startedAt||new Date().toISOString(),technicalStartedAt:C.technicalStartedAt||new Date().toISOString()}:C);w({assessments:b,activePage:"assessment",assessmentUiStep:null,message:""})}catch(b){w({message:he(b)})}}),(H=document.querySelector("#prevAssessmentQuestion"))==null||H.addEventListener("click",async()=>{var F,K,D,I;const f=fe()||((F=(o.assessments||[])[0])==null?void 0:F.id),g=(o.assessments||[]).find(oe=>oe.id===f),h=Number(((K=document.querySelector("#assessmentQuestionForm"))==null?void 0:K.dataset.currentIndex)??(g==null?void 0:g.currentQuestionIndex)??0),b=Math.max(0,h-1),C=(D=g==null?void 0:g.questions)==null?void 0:D[b];await Be(f,"__progress__","",{currentQuestionIndex:b,totalQuestions:((I=g==null?void 0:g.questions)==null?void 0:I.length)||70,currentStage:(C==null?void 0:C.stage)||1}),Ee(f,b);const $=(o.assessments||[]).map(oe=>oe.id===f?{...oe,currentQuestionIndex:b,currentStage:(C==null?void 0:C.stage)||1}:oe);w({assessments:$,activePage:"assessment",message:""})}),(B=document.querySelector("#assessmentQuestionForm"))==null||B.addEventListener("submit",async f=>{var Ie;f.preventDefault();const g=fe()||((Ie=(o.assessments||[])[0])==null?void 0:Ie.id),h=(o.assessments||[]).find(j=>j.id===g),b=(h==null?void 0:h.questions)||[],C=Number(f.currentTarget.dataset.currentIndex??(h==null?void 0:h.currentQuestionIndex)??0),$=b[C],F=new FormData(f.currentTarget).get("answer");if(!$){w({message:"This question could not be loaded. Please refresh and try again."});return}const K=F===null?{value:"",skipped:!0,answeredAt:new Date().toISOString()}:{value:Number(F),skipped:!1,answeredAt:new Date().toISOString()},D={...h.answers||{},[$.id]:K},I=b[C+1],oe=I&&Number(I.stage||1)!==Number($.stage||1),xe=mt(h,$.stage,D);try{if((oe||C+1>=b.length)&&xe.length){await Be(g,$.id,D[$.id],{currentQuestionIndex:C,totalQuestions:b.length,currentStage:$.stage||1});const j=(o.assessments||[]).map(X=>X.id===g?{...X,answers:D,currentQuestionIndex:C,currentStage:$.stage||1,progress:`${C+1}/${b.length}`}:X);w({assessments:j,activePage:"assessment",message:`You missed ${xe.length} question${xe.length===1?"":"s"} in the ${At($.stage)}.`});return}if(C+1>=b.length){const j=In(h,D),X=Dn(h,D);await Oa(g,D,{totalQuestions:b.length,technicalScore:j.technicalScore,discScore:j.discScore,score:Math.round(j.technicalScore*.75+j.discScore*.25),discProfile:X}),fetch("https://admin.nearwork.co/api/generate-assessment-insights",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({assessmentId:g})}).catch(()=>null),_n(h,{score:Math.round(j.technicalScore*.75+j.discScore*.25),technicalScore:j.technicalScore,discScore:j.discScore,discProfile:X}).catch(ge=>console.warn(ge));const me=(o.assessments||[]).map(ge=>ge.id===g?{...ge,answers:D,status:"completed",score:Math.round(j.technicalScore*.75+j.discScore*.25),technical:j.technicalScore,disc:X.label,discProfile:X,progress:`${b.length}/${b.length}`}:ge);w({assessments:me,activePage:"assessment",message:""})}else{const j=$.stage===1&&(I==null?void 0:I.stage)===2&&!h.discStartedAt;await Be(g,$.id,D[$.id],{currentQuestionIndex:C+1,totalQuestions:b.length,currentStage:(I==null?void 0:I.stage)||$.stage||1}),Ee(g,C+1);const X=(o.assessments||[]).map(me=>me.id===g?{...me,answers:D,currentQuestionIndex:C+1,currentStage:(I==null?void 0:I.stage)||$.stage||1,progress:`${C+1}/${b.length}`}:me);w({assessments:X,activePage:"assessment",message:"",assessmentUiStep:j?"discIntro":null})}}catch(j){w({message:he(j)})}}),(q=document.querySelector("#profileForm"))==null||q.addEventListener("submit",async f=>{var K,D,I,oe,xe,Ie,j,X,me,ge;f.preventDefault();const g=new FormData(f.currentTarget),h=g.get("department"),b=g.get("city"),C=ia(g.get("salary"),g.get("salaryCurrency")),$=g.get("marketingConsent")==="on",F={name:g.get("name"),targetRole:g.get("targetRole"),headline:g.get("targetRole"),department:h,city:b,locationId:`${String(b).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g,"-")}-co`,location:`${b}, ${h}`,locationCity:b,locationDepartment:h,locationCountry:"Colombia",english:g.get("english"),salary:C.salary,salaryUSD:C.salaryUSD,salaryAmount:C.salaryAmount,salaryCurrency:C.salaryCurrency,expectedSalaryAmount:C.salaryAmount,expectedSalaryCurrency:C.salaryCurrency,linkedin:g.get("linkedin"),whatsapp:g.get("whatsapp"),phone:g.get("whatsapp"),skills:[...new Set(g.getAll("skills").map(Ae).filter(Boolean))],otherSkills:[],languages:ts(),summary:g.get("summary"),email:((K=o.candidate)==null?void 0:K.email)||((D=o.user)==null?void 0:D.email)||"",availability:((I=o.candidate)==null?void 0:I.availability)||"open",marketingConsent:$,marketingConsentAt:$?((oe=o.candidate)==null?void 0:oe.marketingConsent)===!0?((xe=o.candidate)==null?void 0:xe.marketingConsentAt)||null:new Date().toISOString():null,onboarded:!0};if(!o.user){w({candidate:{...o.candidate,...F},message:"Preview updated. Sign in with Google to save this profile."});return}try{const Pe=g.get("photo");let Mt=((Ie=o.candidate)==null?void 0:Ie.photoURL)||((j=o.user)==null?void 0:j.photoURL)||"";Pe!=null&&Pe.name&&(Mt=await Va(o.user.uid,Pe));const Ge=(X=g.get("profileCv"))!=null&&X.name?g.get("profileCv"):Ze;let Ce=null,qt=!1;if(Ge!=null&&Ge.name)try{Ce=await pt(o.user.uid,Ge,g.get("profileCvLabel")||""),Ze=null}catch{qt=!0}const nt={...F,photoURL:Mt,candidateCode:(me=o.candidate)==null?void 0:me.candidateCode,...Ce?{activeCvId:Ce.id,activeCvName:Ce.name||Ce.fileName,cvUrl:Ce.url,cvLibrary:[...((ge=o.candidate)==null?void 0:ge.cvLibrary)||[],Ce]}:{},workHistory:(()=>{var De,_e,Re,Ue;const $e=Xn();return $e.length?$e:(De=ae==null?void 0:ae.workHistory)!=null&&De.length&&(Te||!((Re=(_e=o.candidate)==null?void 0:_e.workHistory)!=null&&Re.length))?ae.workHistory:((Ue=o.candidate)==null?void 0:Ue.workHistory)||[]})(),certifications:(()=>{var De,_e,Re,Ue;const $e=ns();return $e.length?$e:(De=ae==null?void 0:ae.certifications)!=null&&De.length&&(Te||!((Re=(_e=o.candidate)==null?void 0:_e.certifications)!=null&&Re.length))?ae.certifications:((Ue=o.candidate)==null?void 0:Ue.certifications)||[]})()};ae=null,Te=!1;const st=await wt(o.user.uid,nt),ha=qt?"Profile saved, but the CV failed to upload. Try uploading it again from the CV section.":(st==null?void 0:st.atsSynced)===!1?"Profile saved. Nearwork will finish connecting it to your workspace.":"Profile saved.";if(g.get("mode")==="onboarding")window.history.pushState({page:"overview"},"","/"),w({candidate:{...o.candidate,...nt},activePage:"overview",message:"Profile complete. Welcome to Talent."});else if(W=!1,w({candidate:{...o.candidate,...nt},message:ha,showUnsavedChangesModal:!1}),re){const $e=re;re=null,Le($e)}}catch(Pe){w({message:he(Pe)})}}),(Z=document.querySelector("#cvForm"))==null||Z.addEventListener("submit",async f=>{var b;f.preventDefault();const g=new FormData(f.currentTarget),h=g.get("cv");if(h!=null&&h.name){if(!o.user){w({message:"Sign in with Google to upload and store CVs."});return}try{const C=await pt(o.user.uid,h,g.get("label"));w({candidate:{...o.candidate,cvLibrary:[...((b=o.candidate)==null?void 0:b.cvLibrary)||[],C],activeCvId:C.id},message:"CV uploaded."})}catch(C){w({message:he(C)})}}})}function Zn(){var s;const e=document.querySelectorAll(".pf-tab"),t=document.querySelectorAll(".pf-tab-panel");if(!e.length||!t.length)return;const a=i=>{e.forEach(r=>r.classList.toggle("active",r.dataset.tab===i)),t.forEach(r=>{r.hidden=r.dataset.tabPanel!==i})};e.forEach(i=>{i.addEventListener("click",()=>a(i.dataset.tab))}),(s=document.querySelector("#profileForm"))==null||s.addEventListener("invalid",i=>{const r=i.target.closest(".pf-tab-panel");r&&a(r.dataset.tabPanel)},!0);const n=document.querySelector("#profileForm");n==null||n.addEventListener("input",()=>{W=!0}),n==null||n.addEventListener("change",()=>{W=!0})}function Kn(){const e=document.querySelector("#workHistoryCard");if(!e)return;let t=e.querySelectorAll(".work-entry").length;e.addEventListener("click",a=>{var s;const n=a.target.closest(".remove-work-entry");if(n){(s=n.closest(".work-entry"))==null||s.remove(),W=!0;return}if(a.target.closest("#addWorkEntry")){const i=document.querySelector("#workEntries");if(!i)return;const r=document.createElement("div");r.innerHTML=Lt(t++,{}),i.appendChild(r.firstElementChild),W=!0}})}function Xn(){return[...document.querySelectorAll(".work-entry")].map(e=>{const t=a=>{var n,s;return((s=(n=e.querySelector(`[data-field="${a}"]`))==null?void 0:n.value)==null?void 0:s.trim())||""};return{title:t("title"),company:t("company"),from:t("from"),to:t("to")}}).filter(e=>e.title||e.company)}function es(){const e=document.querySelector("#langCard");if(!e)return;let t=e.querySelectorAll(".lang-entry").length;e.addEventListener("click",a=>{var s;const n=a.target.closest(".remove-lang-entry");if(n){(s=n.closest(".lang-entry"))==null||s.remove(),W=!0;return}if(a.target.closest("#addLangEntry")){const i=document.querySelector("#langEntries");if(!i)return;const r=document.createElement("div");r.innerHTML=Tt(t++,{}),i.appendChild(r.firstElementChild),W=!0}})}function ts(){return[...document.querySelectorAll(".lang-entry")].map(e=>{const t=a=>{var n,s;return((s=(n=e.querySelector(`[data-field="${a}"]`))==null?void 0:n.value)==null?void 0:s.trim())||""};return{name:t("name"),level:t("level")}}).filter(e=>e.name)}function as(){const e=document.querySelector("#certCard");if(!e)return;let t=e.querySelectorAll(".cert-entry").length;e.addEventListener("click",a=>{var s;const n=a.target.closest(".remove-cert-entry");if(n){(s=n.closest(".cert-entry"))==null||s.remove(),W=!0;return}if(a.target.closest("#addCertEntry")){const i=document.querySelector("#certEntries");if(!i)return;const r=document.createElement("div");r.innerHTML=Nt(t++,{}),i.appendChild(r.firstElementChild),W=!0}})}function ns(){return[...document.querySelectorAll(".cert-entry")].map(e=>{const t=a=>{var n,s;return((s=(n=e.querySelector(`[data-field="${a}"]`))==null?void 0:n.value)==null?void 0:s.trim())||""};return{name:t("name"),issuer:t("issuer"),date:t("date")}}).filter(e=>e.name)}function ss(){var n,s,i,r,d,c;const e=document.querySelector("#profileForm"),t=e==null?void 0:e.querySelector('input[name="profileCv"]');if(!e||!t)return;((n=e.querySelector('input[name="mode"]'))==null?void 0:n.value)==="onboarding"&&!((i=(s=o.candidate)==null?void 0:s.skills)!=null&&i.length)&&!((d=(r=o.candidate)==null?void 0:r.workHistory)!=null&&d.length)&&!((c=o.candidate)!=null&&c.name)?is(e,t):os(t)}function is(e,t){var r;const a=document.querySelector("#profileCvCard");if(!a)return;const n=[...e.children].filter(d=>d!==a&&d.type!=="hidden"&&d.getAttribute("name")!=="mode");n.forEach(d=>{d.style.display="none"});const s=document.createElement("p");s.id="cvGatePrompt",s.style.cssText="font-size:13px;color:var(--mid);margin:10px 0 4px;text-align:center;",s.innerHTML=`Upload your CV and we'll fill in the rest for you — or <button type="button" id="skipCvParse" style="background:none;border:none;padding:0;font-size:13px;color:var(--green);cursor:pointer;text-decoration:underline;">skip and fill in manually</button>`,a.insertAdjacentElement("afterend",s);function i(){var d,c;(d=document.querySelector("#cvGatePrompt"))==null||d.remove(),(c=document.querySelector("#cvParseLoading"))==null||c.remove(),n.forEach(l=>{l.style.display=""})}(r=document.querySelector("#skipCvParse"))==null||r.addEventListener("click",i),t.addEventListener("change",async()=>{var u,p;const d=(u=t.files)==null?void 0:u[0];if(!d)return;(p=document.querySelector("#cvGatePrompt"))==null||p.remove();const c=document.createElement("p");c.id="cvParseLoading",c.style.cssText="font-size:13px;font-weight:600;color:var(--green);padding:14px 0;text-align:center;",c.textContent="Analysing your CV…",a.insertAdjacentElement("afterend",c),ae=null,Te=!0;const l=await St(d);i(),l&&(ae=l,rs(l,!0),ls(l,t))})}function os(e){e.addEventListener("change",async()=>{var d,c,l,u,p,v,S,x,A;const t=(d=e.files)==null?void 0:d[0];if(!t)return;ae=null,Te=!1,Ze=null,w({message:"⏳ Analysing your CV — this takes up to 30 seconds…"});const a=await St(t);if(!a){w({message:"⚠️ Could not read your CV. Check the browser console for details, or try a different file."});return}ae=a,Te=!0,Ze=t;const n=o.candidate||{},s={...n,...a.name?{name:a.name}:{},...a.phone?{whatsapp:a.phone,phone:a.phone}:{},...a.summary?{summary:a.summary}:{},skills:(c=a.skills)!=null&&c.length?[...new Set(a.skills.map(Ae).filter(Boolean))]:n.skills||[],workHistory:(l=a.workHistory)!=null&&l.length?a.workHistory:n.workHistory||[],certifications:(u=a.certifications)!=null&&u.length?a.certifications:n.certifications||[],languages:(p=a.languages)!=null&&p.length?a.languages:n.languages||[]},i=[];a.name&&i.push("name"),a.phone&&i.push("phone"),a.summary&&i.push("summary"),(v=a.skills)!=null&&v.length&&i.push(`${a.skills.length} skill${a.skills.length!==1?"s":""}`),(S=a.workHistory)!=null&&S.length&&i.push(`${a.workHistory.length} role${a.workHistory.length!==1?"s":""}`),(x=a.certifications)!=null&&x.length&&i.push(`${a.certifications.length} cert${a.certifications.length!==1?"s":""}`),(A=a.languages)!=null&&A.length&&i.push("languages");const r=i.length?`✓ Pre-filled from CV: ${i.join(", ")}. Review and save your profile.`:"✓ CV analysed. Review your profile and save.";w({candidate:s,message:r})})}function rs(e,t){var n,s,i,r,d;const a=(c,l)=>{const u=document.querySelector(c);u&&l&&t&&(u.value=l)};if(a('input[name="name"]',e.name),a('input[name="whatsapp"]',e.phone),a('textarea[name="summary"]',e.summary),(n=e.skills)!=null&&n.length){const c=document.querySelector("#selectedSkills");if(c){c.innerHTML="";const l=new Set([...c.querySelectorAll('input[name="skills"]')].map(p=>p.value.toLowerCase()));(s=c.querySelector(".skill-empty"))==null||s.remove(),[...new Set(e.skills.map(Ae).filter(Boolean))].forEach(p=>{if(l.has(p.toLowerCase()))return;l.add(p.toLowerCase());const v=document.createElement("span");v.className="selected-skill",v.setAttribute("data-skill-chip",p),v.innerHTML=`${L(p)}<button type="button" class="skill-remove" data-remove-skill="${y(p)}" aria-label="Remove ${y(p)}">×</button><input type="hidden" name="skills" value="${y(p)}" />`,c.appendChild(v)})}}if((i=e.workHistory)!=null&&i.length){const c=document.querySelector("#workEntries");if(c){c.innerHTML="";let l=c.querySelectorAll(".work-entry").length;e.workHistory.forEach(u=>{const p=document.createElement("div");p.innerHTML=Lt(l++,u),c.appendChild(p.firstElementChild)})}}if((r=e.languages)!=null&&r.length){const c=document.querySelector("#langEntries");if(c){c.innerHTML="";let l=c.querySelectorAll(".lang-entry").length;e.languages.forEach(u=>{const p=document.createElement("div");p.innerHTML=Tt(l++,u),c.appendChild(p.firstElementChild)})}}if((d=e.certifications)!=null&&d.length){const c=document.querySelector("#certEntries");if(c){c.innerHTML="";let l=c.querySelectorAll(".cert-entry").length;e.certifications.forEach(u=>{const p=document.createElement("div");p.innerHTML=Nt(l++,u),c.appendChild(p.firstElementChild)})}}ze()}function ls(e,t){var s,i,r,d,c;const a=[];e.name&&a.push("name"),e.phone&&a.push("phone"),(s=e.skills)!=null&&s.length&&a.push(`${e.skills.length} skill${e.skills.length>1?"s":""}`),(i=e.workHistory)!=null&&i.length&&a.push(`${e.workHistory.length} role${e.workHistory.length>1?"s":""}`),(r=e.certifications)!=null&&r.length&&a.push(`${e.certifications.length} cert${e.certifications.length>1?"s":""}`),(d=e.languages)!=null&&d.length&&a.push("languages"),(c=document.querySelector("#cvParseHint"))==null||c.remove();const n=document.createElement("p");n.id="cvParseHint",n.style.cssText="font-size:12px;color:var(--green);margin:4px 0 0;",n.innerHTML=a.length?`✓ Pre-filled: <strong>${a.join(", ")}</strong>. Review and save.`:"✓ CV analysed. Review your profile and save.",t.insertAdjacentElement("afterend",n)}function va(){var c;const e=document.querySelector("[data-skill-search]");if(!e)return;const t=e.querySelector("#skillSearchInput"),a=e.querySelector("#skillSuggestions"),n=e.querySelector("#selectedSkills"),s=()=>[...n.querySelectorAll('input[name="skills"]')].map(l=>l.value),i=l=>{n.innerHTML=l.length?l.map(u=>`
      <span class="selected-skill" data-skill-chip="${y(u)}">
        ${L(u)}
        <button type="button" class="skill-remove" data-remove-skill="${y(u)}" aria-label="Remove ${y(u)}">×</button>
        <input type="hidden" name="skills" value="${y(u)}" />
      </span>`).join(""):'<span class="skill-empty">Selected skills will appear here.</span>'},r=()=>{const l=Q(t.value),u=t.value.trim(),p=new Set(s().map(Q)),v=Yt.filter(E=>!p.has(Q(E))).filter(E=>!l||Q(E).includes(l)).slice(0,12),S=v.find(E=>Q(E)===l),A=u.length>1&&!p.has(Q(u))&&!S?`<button type="button" class="skill-suggestion add-custom" data-skill="${y(u)}">+ Add "${L(u)}"</button>`:"";a.innerHTML=A+v.map(E=>`<button type="button" class="skill-suggestion" data-skill="${y(E)}">${L(E)}</button>`).join("")},d=l=>{const u=(l||t.value).trim(),p=Ae(u);if(!p)return;const v=Q(p),S=s();if(S.length>=20&&!S.some(A=>Q(A)===v)){t.value="";return}const x=[...S.filter(A=>Q(A)!==v),p];i(x),t.value="",r(),W=!0};t==null||t.addEventListener("input",r),t==null||t.addEventListener("focus",r),t==null||t.addEventListener("keydown",l=>{if(l.key!=="Enter")return;l.preventDefault();const u=Q(t.value),p=[...a.querySelectorAll(".skill-suggestion:not(.add-custom)")].find(v=>Q(v.dataset.skill)===u);d((p==null?void 0:p.dataset.skill)||t.value)}),(c=e.querySelector("#addTypedSkill"))==null||c.addEventListener("click",()=>d(t.value)),a.addEventListener("click",l=>{const u=l.target.closest("[data-skill]");u&&d(u.dataset.skill)}),n.addEventListener("click",l=>{const u=l.target.closest("[data-remove-skill]");if(!u)return;const p=Q(u.dataset.removeSkill);i(s().filter(v=>Q(v)!==p)),r(),W=!0})}function fa(){if(o.loading)return Wn();if(o.view==="reset-password")return rn();if(o.view==="dashboard")return ua();ca()}window.addEventListener("popstate",()=>{if(window.location.pathname==="/reset-password"){w({view:"reset-password",resetCodeStatus:null,resetCodeError:""});return}const e=Xe();e==="overview"&&!o.user?w({view:"login",activePage:"overview",message:""}):o.view==="dashboard"?Le(e,!1):We()});ye?($a(O,e=>{if(e)da(e);else{try{localStorage.removeItem("nw_talent_applied")}catch{}We()}}),window.setTimeout(()=>{o.loading&&We()},2500)):We();
