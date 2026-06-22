import{initializeApp as ha}from"https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";import{getAuth as ya,signInWithCustomToken as wa,onAuthStateChanged as ba,createUserWithEmailAndPassword as Sa,updateProfile as Ca,signInWithEmailAndPassword as ka,signOut as qt}from"https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";import{getFirestore as $a,query as le,collection as ne,where as ce,limit as de,getDocs as ue,getDoc as Ae,doc as O,setDoc as W,serverTimestamp as z,onSnapshot as Aa,updateDoc as xa,addDoc as It,arrayUnion as mt}from"https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";import{getStorage as Pa,ref as gt,uploadBytes as Ot,getDownloadURL as jt,deleteObject as Ea}from"https://www.gstatic.com/firebasejs/10.12.5/firebase-storage.js";(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))n(s);new MutationObserver(s=>{for(const i of s)if(i.type==="childList")for(const o of i.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&n(o)}).observe(document,{childList:!0,subtree:!0});function a(s){const i={};return s.integrity&&(i.integrity=s.integrity),s.referrerPolicy&&(i.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?i.credentials="include":s.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function n(s){if(s.ep)return;s.ep=!0;const i=a(s);fetch(s.href,i)}})();const zt={apiKey:"AIzaSyApRNyW8PoP28E0x77dUB5jOgHuTqA2by4",authDomain:"nearwork-97e3c.firebaseapp.com",projectId:"nearwork-97e3c",storageBucket:"nearwork-97e3c.firebasestorage.app",messagingSenderId:"145642656516",appId:"1:145642656516:web:0ac2da8931283121e87651",measurementId:"G-3LC8N6FFSH"},ye=Object.values(zt).slice(0,6).every(Boolean),$e=ye?ha(zt):null,U=$e?ya($e):null,L=$e?$a($e):null,Ze=$e?Pa($e):null,T={users:"users",candidates:"candidates",openings:"openings",pipelines:"pipelines",applications:"applications",assessments:"assessments",activity:"candidateActivity",notifications:"notifications",notificationPreferences:"notificationPreferences"},Ht="/api/send-email-proxy";function G(){if(!$e||!U||!L||!Ze)throw new Error("Missing Firebase environment variables. Copy .env.example to .env.local and fill in the Admin app config.")}async function La(e={}){var i,o;const t=String(e.email||((i=U==null?void 0:U.currentUser)==null?void 0:i.email)||"").trim().toLowerCase();if(!t)return{ok:!1,skipped:!0,reason:"Missing candidate email"};const a=e.name||((o=U==null?void 0:U.currentUser)==null?void 0:o.displayName)||"",n=e.firstName||a.split(/\s+/)[0]||"there",s=await fetch(Ht,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({to:t,templateId:"account_created",data:{name:a||n,firstName:n,actionUrl:"https://talent.nearwork.co"}})});return s.json().catch(()=>({ok:s.ok}))}async function Ta(e={},t={}){var o,d;const a=String((e==null?void 0:e.email)||((o=U==null?void 0:U.currentUser)==null?void 0:o.email)||"").trim().toLowerCase();if(!a)return{ok:!1,skipped:!0,reason:"Missing candidate email"};const n=(e==null?void 0:e.name)||((d=U==null?void 0:U.currentUser)==null?void 0:d.displayName)||"",s=(e==null?void 0:e.firstName)||n.split(/\s+/)[0]||"there",i=await fetch(Ht,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({to:a,templateId:"job_applied",data:{name:n||s,firstName:s,roleTitle:t.title||t.role||t.openingTitle||"this role",openingCode:t.code||t.id||"",actionUrl:"https://talent.nearwork.co"}})});return i.json().catch(()=>({ok:i.ok}))}async function Vt(e){G();const t=await Ae(O(L,T.users,e));return t.exists()?{id:t.id,...t.data()}:null}async function Na(e){G();const t=String(e||"").trim(),a=t.toLowerCase(),n=le(ne(L,T.users),ce("email","==",a),de(1)),s=await ue(n);if(!s.empty)return{id:s.docs[0].id,...s.docs[0].data()};if(t===a)return null;const i=le(ne(L,T.users),ce("email","==",t),de(1)),o=await ue(i);return o.empty?null:{id:o.docs[0].id,...o.docs[0].data()}}async function Ma(e){const t=await Vt(e.uid);if(t)return t;const a=await Na(e.email);return a?(await Qt(e.uid,{...a,email:e.email,connectedFromUserId:a.id}),{...a,id:e.uid,connectedFromUserId:a.id}):null}async function Gt(e,t,a){const n=await Ae(O(L,T.candidates,t)).catch(()=>null),s=n!=null&&n.exists()?n.data():{};return Jt(e,{...s,...a,candidateCode:t})}async function Qt(e,t){G();const a=t.candidateCode||He(e),n={...t,candidateCode:a,role:"candidate",updatedAt:z()};await W(O(L,T.users,e),n,{merge:!0}),await W(O(L,T.candidates,a),await Gt(e,a,{...n,candidateCode:a}),{merge:!0}).catch(()=>null),t.marketingConsent===!0&&Yt({...n,candidateCode:a,source:"talent.nearwork.co"}).catch(()=>null)}function He(e){return`CAND-${String(e||"").replace(/[^a-z0-9]/gi,"").slice(0,8).toUpperCase()||Date.now()}`}function qa(e){return String(e||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"")}function Jt(e,t){const a=t.candidateCode||He(e),n=t.location||[t.locationCity||t.city,t.locationDepartment||t.department].filter(Boolean).join(", "),s=new Date().toISOString().slice(0,10);return{code:a,uid:e,ownerUid:e,name:t.name||"Talent member",role:t.targetRole||t.headline||"Nearwork candidate",skills:Array.isArray(t.skills)?t.skills:[],applied:t.applied||s,lastContact:t.lastContact||s,experience:Number(t.experience||0),location:n,city:qa(t.locationCity||t.city||n),department:t.locationDepartment||t.department||"",country:t.locationCountry||"Colombia",source:"talent.nearwork.co",status:t.status||"active",score:Number(t.score||50),email:t.email||"",phone:t.whatsapp||t.phone||"",whatsapp:t.whatsapp||t.phone||"",currentRole:t.currentRole||"",salary:t.salary||"",salaryUSD:Number(t.salaryUSD||0)||null,salaryAmount:Number(t.salaryAmount||t.expectedSalaryAmount||0)||null,salaryCurrency:t.salaryCurrency||t.expectedSalaryCurrency||"USD",expectedSalaryUSD:Number(t.expectedSalaryUSD||0)||null,expectedSalaryCOP:Number(t.expectedSalaryCOP||0)||null,expectedSalaryAmount:Number(t.expectedSalaryAmount||t.salaryAmount||0)||null,expectedSalaryCurrency:t.expectedSalaryCurrency||t.salaryCurrency||"USD",expectedSalary:t.expectedSalary||t.salary||"",availability:t.availability||"open",english:t.english||"",visa:t.visa||"No",linkedin:t.linkedin||"",cv:t.activeCvName||"",cvUrl:t.cvUrl||null,photoUrl:t.photoURL||t.photoUrl||null,tags:t.tags||["talent profile"],notes:t.summary||"",summary:t.summary||"",workHistory:Array.isArray(t.workHistory)?t.workHistory:[],languages:Array.isArray(t.languages)?t.languages:[],certifications:Array.isArray(t.certifications)?t.certifications:[],appliedBefore:!!t.appliedBefore,applications:t.applications||[],pipelineCodes:t.pipelineCodes||[],loom:t.loom||"Not uploaded",assessments:t.assessments||[],work:t.work||[],updatedAt:z()}}async function Ia(e){G();const t=le(ne(L,T.applications),ce("candidateId","==",e),de(20)),a=le(ne(L,T.applications),ce("ownerUid","==",e),de(20)),n=await Promise.allSettled([ue(t),ue(a)]),s=new Map;return n.forEach(i=>{i.status==="fulfilled"&&i.value.docs.forEach(o=>s.set(o.id,{id:o.id,...o.data()}))}),Array.from(s.values()).sort((i,o)=>{const d=c=>{var l,p;return((p=(l=c==null?void 0:c.toDate)==null?void 0:l.call(c))==null?void 0:p.getTime())??(c?new Date(c).getTime():0)};return d(o.updatedAt||o.createdAt)-d(i.updatedAt||i.createdAt)})}async function Da(e,t="",a=""){G();const n=String(t||"").trim().toLowerCase(),s=String(a||"").trim(),i=[ue(le(ne(L,T.assessments),ce("candidateUid","==",e),de(25))),ue(le(ne(L,T.assessments),ce("candidateId","==",e),de(25)))];n&&i.push(ue(le(ne(L,T.assessments),ce("candidateEmail","==",n),de(25)))),s&&i.push(ue(le(ne(L,T.assessments),ce("candidateCode","==",s),de(25))));const o=await Promise.allSettled(i),d=new Map;return o.forEach(c=>{c.status==="fulfilled"&&c.value.docs.forEach(l=>d.set(l.id,{id:l.id,...l.data()}))}),Array.from(d.values()).sort((c,l)=>{const p=u=>{var v,h;return((h=(v=u==null?void 0:u.toDate)==null?void 0:v.call(u))==null?void 0:h.getTime())??(u?new Date(u).getTime():0)};return p(l.updatedAt||l.createdAt||l.sentAt)-p(c.updatedAt||c.createdAt||c.sentAt)})}async function _a(e,t,a="",n=""){G();const s=await Ae(O(L,T.assessments,e));if(!s.exists())return null;const i={id:s.id,...s.data()},o=String(a||"").trim().toLowerCase(),d=String(n||"").trim();return i.candidateUid===t||i.candidateId===t||String(i.candidateEmail||"").trim().toLowerCase()===o||String(i.candidateCode||"").trim()===d?i:null}async function Ra(e,t){G();const a=await Ae(O(L,T.assessments,e)),n=a.exists()?a.data():{};if(n.status==="completed")throw new Error("This assessment is already completed.");if(n.expiresAt&&Date.now()>new Date(n.expiresAt).getTime())throw new Error("This assessment link has expired.");await W(O(L,T.assessments,e),{status:"started",currentQuestionIndex:Number(n.currentQuestionIndex||0),currentStage:Number(n.currentStage||1),technicalStartedAt:n.technicalStartedAt||z(),startedAt:n.startedAt||z(),updatedAt:z()},{merge:!0})}async function Be(e,t,a,n={}){G();const s=await Ae(O(L,T.assessments,e)),i=s.exists()?s.data():{};if(i.status==="completed")throw new Error("This assessment is already completed.");if(i.expiresAt&&Date.now()>new Date(i.expiresAt).getTime())throw new Error("This assessment link has expired.");await W(O(L,T.assessments,e),{[`answers.${t}`]:a,progress:`${n.currentQuestionIndex||0}/${n.totalQuestions||""}`.replace(/\/$/,""),currentQuestionIndex:n.currentQuestionIndex||0,currentStage:n.currentStage||1,...n.discStartedAt?{discStartedAt:n.discStartedAt}:{},updatedAt:z()},{merge:!0})}async function Ua(e,t,a={}){var v;G();const n=O(L,T.assessments,e),s=await Ae(n),i=s.exists()?s.data():{};if(i.status==="completed")throw new Error("This assessment is already completed.");if(i.expiresAt&&Date.now()>new Date(i.expiresAt).getTime())throw new Error("This assessment link has expired.");const o=Object.values(t||{}).filter(h=>String((h==null?void 0:h.value)??h??"").trim()).length,d=Number(a.totalQuestions||Object.keys(t||{}).length||0),c=Number(a.technicalScore||0),l=Number(a.discScore||0),p=Number(a.score||(d?Math.round(o/d*100):0));await W(n,{answers:t,answeredCount:o,totalQuestions:d,score:p,technical:c||p,disc:((v=a.discProfile)==null?void 0:v.label)||(l?`${l}%`:"Submitted"),discScore:l,discProfile:a.discProfile||null,progress:`${o}/${d}`,status:"completed",finished:new Date().toLocaleString("en-US",{month:"short",day:"numeric",year:"numeric",hour:"numeric",minute:"2-digit"}),finishedAt:z(),updatedAt:z()},{merge:!0});const u=Math.round(p);i.candidateUid&&await W(O(L,T.users,i.candidateUid),{score:u,nwScore:u,lastAssessmentScore:u,lastAssessmentId:e,updatedAt:z()},{merge:!0}).catch(()=>null),i.candidateCode&&await W(O(L,T.candidates,i.candidateCode),{score:u,nwScore:u,lastAssessmentScore:u,lastAssessmentId:e,updatedAt:z()},{merge:!0}).catch(()=>null)}async function Wt(){G();const e=le(ne(L,T.openings),ce("published","==",!0),de(12));return(await ue(e)).docs.map(a=>({id:a.id,...a.data()}))}async function Ba(e,t){G();const a=t.code||t.id,n=await Vt(e).catch(()=>null),s=(n==null?void 0:n.candidateCode)||He(e),i=new Date().toISOString().slice(0,10),o={opening:a,openingCode:a,jobId:a,role:t.title||t.role||"Untitled role",openingTitle:t.title||t.role||"Untitled role",applied:i,appliedAt:i,status:"applied",outcome:"Application only",source:"talent.nearwork.co"},d={candidateId:e,ownerUid:e,authUid:e,candidateDocId:s,candidateCode:s,candidateEmail:(n==null?void 0:n.email)||"",candidateName:(n==null?void 0:n.name)||"",openingCode:a,jobId:a,openingTitle:t.title||t.role||"Untitled role",jobTitle:t.title||t.role||"Untitled role",title:t.title||t.role||"Untitled role",clientName:t.orgName||t.clientName||t.company||"Nearwork client",status:"applied",inPipeline:!1,isMockData:!1,source:"talent.nearwork.co",createdAt:z(),updatedAt:z()};await It(ne(L,T.applications),d),await W(O(L,T.candidates,s),{...Jt(e,{...n||{},candidateCode:s,appliedBefore:!0,lastContact:i}),applications:mt(o),appliedBefore:!0},{merge:!0}).catch(()=>null),await W(O(L,T.users,e),{role:"candidate",candidateCode:s,code:s,applications:mt(o),lastAppliedOpeningCode:a,lastAppliedAt:z(),updatedAt:z()},{merge:!0}).catch(()=>null),await It(ne(L,T.activity),{candidateId:e,type:"application_submitted",title:d.jobTitle,createdAt:z()}).catch(()=>null),Ta(n,t).catch(()=>null)}async function Fa(e,t){await xa(O(L,T.users,e),{availability:t,updatedAt:z()})}async function bt(e,t){G();const a=t.candidateCode||He(e);await W(O(L,T.users,e),{...t,candidateCode:a,role:"candidate",updatedAt:z()},{merge:!0});try{return await W(O(L,T.candidates,a),await Gt(e,a,{...t,candidateCode:a}),{merge:!0}),t.marketingConsent===!0&&Yt({...t,candidateCode:a,source:"talent.nearwork.co"}).catch(()=>null),{candidateCode:a,atsSynced:!0}}catch(n){return console.warn("Candidate ATS sync failed.",n),{candidateCode:a,atsSynced:!1}}}async function Oa(){var n;G();const e=await((n=U.currentUser)==null?void 0:n.getIdToken());if(!e)throw new Error("You must be signed in to delete your account.");const t=await fetch("/api/delete-account",{method:"POST",headers:{Authorization:`Bearer ${e}`}}),a=await t.json().catch(()=>({}));if(!t.ok||!a.ok)throw new Error(a.error||"Failed to delete account.");return a}async function ja(e){const t=await fetch("/api/send-reset",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:e,continueUrl:`${window.location.origin}/reset-password`})}),a=await t.json().catch(()=>({}));if(!t.ok||!a.ok)throw new Error(a.error||"Failed to send the reset email.");return a}async function Yt(e){var s,i;const t=(e==null?void 0:e.email)||((s=U.currentUser)==null?void 0:s.email)||"";if(!t)return{ok:!1,skipped:!0};const a=await((i=U.currentUser)==null?void 0:i.getIdToken().catch(()=>""));return(await fetch("/api/sync-hubspot-candidate",{method:"POST",headers:{"Content-Type":"application/json",...a?{Authorization:`Bearer ${a}`}:{}},body:JSON.stringify({candidate:{...e,email:t}})})).json().catch(()=>({ok:!1}))}async function za(e,t){G();const a=t.name.replace(/[^a-z0-9._-]/gi,"-").toLowerCase(),n=`candidate-photos/${e}/${Date.now()}-${a}`,s=gt(Ze,n);await Ot(s,t,{contentType:t.type||"application/octet-stream"});const i=await jt(s);return await W(O(L,T.users,e),{photoURL:i,updatedAt:z()},{merge:!0}),i}async function vt(e,t,a){G();let n=null,s=He(e);try{const p=await Ae(O(L,T.users,e));if(p.exists()){const u=p.data();n=u.activeCvId||null,u.candidateCode&&(s=u.candidateCode)}}catch{}const i=t.name.replace(/[^a-z0-9._-]/gi,"-").toLowerCase(),o=`candidate-cvs/${e}/${Date.now()}-${i}`,d=gt(Ze,o);await Ot(d,t,{contentType:t.type||"application/octet-stream"});const c=await jt(d),l={id:o,name:a||t.name,fileName:t.name,url:c,uploadedAt:new Date().toISOString()};return await W(O(L,T.users,e),{cvLibrary:mt(l),activeCvId:l.id,activeCvName:l.name||l.fileName,cvUrl:c,updatedAt:z()},{merge:!0}),W(O(L,T.candidates,s),{cvUrl:c,activeCvId:l.id,activeCvName:l.name||l.fileName,updatedAt:z()},{merge:!0}).catch(()=>null),n&&n!==o&&Ea(gt(Ze,n)).catch(()=>{}),l}function Ha(e,t){if(G(),!e)return()=>{};const a=le(ne(L,T.notifications),ce("recipientUid","==",e),de(50));return Aa(a,n=>{const s=n.docs.map(i=>({id:i.id,...i.data()})).sort((i,o)=>{var l,p;const d=(l=i.createdAt)!=null&&l.toDate?i.createdAt.toDate().getTime():new Date(i.createdAt||0).getTime();return((p=o.createdAt)!=null&&p.toDate?o.createdAt.toDate().getTime():new Date(o.createdAt||0).getTime())-d});t(s)})}async function Va(e){G(),e&&await W(O(L,T.notifications,e),{read:!0,readAt:z()},{merge:!0})}async function Ga(e,t){G(),await W(O(L,T.notificationPreferences,e),{uid:e,app:"talent.nearwork.co",preferences:t,updatedAt:z()},{merge:!0})}async function St(e){var t;if(!e)return null;try{const a=await new Promise((N,A)=>{const x=new FileReader;x.onload=()=>N(x.result.split(",")[1]),x.onerror=A,x.readAsDataURL(e)}),n=await((t=U.currentUser)==null?void 0:t.getIdToken().catch(()=>""))??"",s=await fetch("/api/parse-cv",{method:"POST",headers:{"Content-Type":"application/json",...n?{Authorization:`Bearer ${n}`}:{}},body:JSON.stringify({data:a,filename:e.name,mimeType:e.type||"application/octet-stream"})});if(!s.ok)return null;const i=await s.json();if(!(i!=null&&i.ok))return null;const{name:o,phone:d,city:c,summary:l,skills:p,workHistory:u,languages:v,certifications:h}=i;return{name:o,phone:d,city:c,summary:l,skills:p,workHistory:u,languages:v||[],certifications:h||[]}}catch{return null}}async function Qa(e){return wa(U,e)}let ae=null,Te=!1,Ke=null,Ct=1,P={},ie=null,ze=null,_=null,Xe=!1,J=!1,re=null;const nt=document.querySelector("#app"),Ja="+573135928691",Wa="https://wa.me/573135928691",Me={"Customer Success":["Customer Success Manager","Customer Success Associate","Account Manager","Technical Account Manager","Client Success Specialist","Implementation Specialist","Onboarding Specialist","Renewals Manager"],Sales:["SDR / Sales Development Rep","BDR / Business Development Rep","Account Executive","Inside Sales Representative","Channel Sales Manager","Sales Operations Specialist","Revenue Operations Specialist","Sales Manager"],Support:["Technical Support Specialist","Customer Support Representative","Help Desk Technician","Escalations Specialist","Support Team Lead","QA Support Analyst"],Operations:["Operations Manager","Operations Analyst","Executive Assistant","Administrative Assistant","Virtual Assistant","Office Manager","Project Coordinator","Procurement Specialist","Logistics Coordinator","Recruiting Coordinator"],Marketing:["Marketing Ops / Content Specialist","Content Writer","SEO Specialist","Email Marketing Specialist","Lifecycle Marketing Specialist","Social Media Manager","Graphic Designer","Growth Marketing Specialist"],Engineering:["Software Developer (Full Stack)","Frontend Developer","Backend Developer","Mobile Developer","DevOps Engineer","No-Code Developer","Data Analyst","Data Engineer","QA Engineer","Product Manager"],Finance:["Bookkeeper","Accounting Assistant","Accounts Payable / Receivable Specialist","Financial Analyst","FP&A Analyst","Payroll Specialist","Tax Analyst"],"Human Resources":["HR Generalist","Recruiter / Talent Sourcer","People Operations Specialist","Payroll & Benefits Coordinator","Learning & Development Coordinator"],"Healthcare & Insurance":["Insurance Account Manager","Claims Specialist","Medical Billing Specialist","Healthcare Virtual Assistant","Patient Coordinator"],Other:["Other / Not Listed"]},Ya={"CRM & Sales":["HubSpot","Salesforce","Pipedrive","Apollo","Outbound","Cold Email","Discovery Calls","CRM Hygiene"],"Customer Success":["SaaS","Customer Success","QBRs","Onboarding","Renewals","Expansion","Churn Reduction","Intercom","Zendesk"],Support:["Technical Support","Tickets","Troubleshooting","APIs","Bug Reproduction","Help Center","CSAT"],Operations:["Excel","Google Sheets","Reporting","Process Design","Project Management","Notion","Airtable","Zapier"],Marketing:["Content","SEO","Lifecycle","Email Marketing","HubSpot Marketing","Copywriting","Analytics"],Engineering:["JavaScript","React","Node.js","SQL","Python","REST APIs","QA","GitHub"],Language:["English B2","English C1","English C2","Spanish Native"]},Za=["Account Management","Accounts Payable","Accounts Receivable","Adobe Creative Suite","Agile","AI Tools","Analytics","Appointment Setting","B2B Sales","B2C Sales","Billing","Bookkeeping","Business Analysis","Canva","Cash Collections","Chat Support","Cold Calling","Community Management","Compliance","Content Strategy","Contract Management","Customer Onboarding","Customer Retention","Customer Service","Data Analysis","Data Entry","Email Support","Excel / Google Sheets","Executive Assistance","Figma","Financial Reporting","Forecasting","Helpdesk","HR Operations","Inbound Calls","Insurance Support","Lead Generation","Live Chat","Logistics","Looker","Microsoft Office","NetSuite","Outbound Calls","Payroll","Performance Marketing","Power BI","Product Support","QuickBooks","Recruiting","Salesforce Administration","Sales Operations","Shopify","Slack","Social Media","SQL Reporting","Stripe","Tableau","Technical Writing","Ticket Quality","Training","Vendor Management","WordPress","Workday","Workforce Management","Zendesk Guide","Zoho"],Zt=[...new Set([...Object.values(Ya).flat(),...Za])].sort((e,t)=>e.localeCompare(t)),pe={Amazonas:["El Encanto","La Chorrera","La Pedrera","La Victoria","Leticia","Miriti - Paraná","Puerto Alegría","Puerto Arica","Puerto Nariño","Puerto Santander","Tarapacá"],Antioquia:["Abejorral","Abriaquí","Alejandría","Amagá","Amalfi","Andes","Angelópolis","Angostura","Anorí","Anza","Apartadó","Arboletes","Argelia","Armenia","Barbosa","Bello","Belmira","Betania","Betulia","Briceño","Buriticá","Cáceres","Caicedo","Caldas","Campamento","Cañasgordas","Caracolí","Caramanta","Carepa","Carmen de Viboral","Carolina","Caucasia","Chigorodó","Cisneros","Ciudad Bolívar","Cocorná","Concepción","Concordia","Copacabana","Dabeiba","Don Matías","Ebéjico","El Bagre","Entrerríos","Envigado","Fredonia","Frontino","Giraldo","Girardota","Gómez Plata","Granada","Guadalupe","Guarne","Guatapé","Heliconia","Hispania","Itagüí","Ituango","Jardín","Jericó","La Ceja","La Estrella","La Pintada","La Unión","Liborina","Maceo","Marinilla","Medellín","Montebello","Murindó","Mutata","Nariño","Nechí","Necoclí","Olaya","Peñol","Peque","Pueblorrico","Puerto Berrío","Puerto Nare","Puerto Triunfo","Remedios","Retiro","Rionegro","Sabanalarga","Sabaneta","Salgar","San Andrés","San Carlos","San Francisco","San Jerónimo","San José de la Montaña","San Juan de Urabá","San Luis","San Pedro","San Pedro de Urabá","San Rafael","San Roque","San Vicente","Santa Bárbara","Santa Rosa de Osos","Santafé de Antioquia","Santo Domingo","Santuario","Segovia","Sonsón","Sopetrán","Támesis","Tarazá","Tarso","Titiribí","Toledo","Turbo","Uramita","Urrao","Valdivia","Valparaíso","Vegachí","Venecia","Vigía del Fuerte","Yalí","Yarumal","Yolombó","Yondó","Zaragoza"],Arauca:["Arauca","Arauquita","Cravo Norte","Fortul","Puerto Rondón","Saravena","Tame"],Atlántico:["Baranoa","Barranquilla","Campo de la Cruz","Candelaria","Galapa","Juan de Acosta","Luruaco","Malambo","Manatí","Palmar de Varela","Piojó","Polonuevo","Ponedera","Puerto Colombia","Repelón","Sabanagrande","Sabanalarga","Santa Lucía","Santo Tomás","Soledad","Suan","Tubara","Usiacurí"],"Bogotá D.C.":["Bogotá"],Bolívar:["Achí","Altos del Rosario","Arenal","Arjona","Arroyohondo","Barranco de Loba","Calamar","Cantagallo","Carmen de Bolívar","Cartagena","Cicuco","Clemencia","Córdoba","El Guamo","El Peñón","Hatillo de Loba","Magangué","Mahates","Margarita","María la Baja","Mompós","Montecristo","Morales","Pinillos","Regidor","Río Viejo","San Cristóbal","San Estanislao","San Fernando","San Jacinto","San Jacinto del Cauca","San Juan Nepomuceno","San Martín de Loba","San Pablo","Santa Catalina","Santa Rosa de Lima","Santa Rosa del Sur","Simití","Soplaviento","Talaigua Nuevo","Tiquisio","Turbaco","Turbana","Villanueva","Zambrano"],Boyacá:["Almeida","Aquitania","Arcabuco","Belén","Berbeo","Betéitiva","Boavita","Boyacá","Briceño","Buenavista","Busbanzá","Caldas","Campohermoso","Cerinza","Chinavita","Chiquinquirá","Chíquiza","Chiscas","Chita","Chitaraque","Chivatá","Chivor","Ciénega","Cómbita","Coper","Corrales","Covarachía","Cubará","Cucaita","Cuítiva","Duitama","El Cocuy","El Espino","Firavitoba","Floresta","Gachantivá","Gameza","Garagoa","Guacamayas","Guateque","Guayatá","Güicán","Iza","Jenesano","Jericó","La Capilla","La Uvita","La Victoria","Labranzagrande","Macanal","Maripí","Miraflores","Mongua","Monguí","Moniquirá","Motavita","Muzo","Nobsa","Nuevo Colón","Oicatá","Otanche","Pachavita","Páez","Paipa","Pajarito","Panqueba","Pauna","Paya","Paz de Río","Pesca","Pisba","Puerto Boyacá","Quípama","Ramiriquí","Ráquira","Rondón","Saboyá","Sáchica","Samacá","San Eduardo","San José de Pare","San Luis de Gaceno","San Mateo","San Miguel de Sema","San Pablo Borbur","Santa María","Santa Rosa de Viterbo","Santa Sofía","Santana","Sativanorte","Sativasur","Siachoque","Soatá","Socha","Socotá","Sogamoso","Somondoco","Sora","Soracá","Sotaquirá","Susacón","Sutamarchán","Sutatenza","Tasco","Tenza","Tibaná","Tibasosa","Tinjacá","Tipacoque","Toca","Togüí","Tópaga","Tota","Tunja","Tununguá","Turmequé","Tuta","Tutazá","Umbita","Ventaquemada","Villa de Leyva","Viracachá","Zetaquira"],Caldas:["Aguadas","Anserma","Aranzazu","Belalcázar","Chinchiná","Filadelfia","La Dorada","La Merced","Manizales","Manzanares","Marmato","Marquetalia","Marulanda","Neira","Norcasia","Pácora","Palestina","Pensilvania","Riosucio","Risaralda","Salamina","Samaná","San José","Supía","Victoria","Villamaría","Viterbo"],Caquetá:["Albania","Belén de los Andaquíes","Cartagena del Chairá","Currillo","El Doncello","El Paujil","Florencia","La Montañita","Milán","Morelia","Puerto Rico","San José del Fragua","San Vicente del Caguán","Solano","Solita","Valparaiso"],Casanare:["Aguazul","Chameza","Hato Corozal","La Salina","Maní","Monterrey","Nunchía","Orocué","Paz de Ariporo","Pore","Recetor","Sabanalarga","Sácama","San Luis de Palenque","Támara","Tauramena","Trinidad","Villanueva","Yopal"],Cauca:["Almaguer","Argelia","Balboa","Bolívar","Buenos Aires","Cajibío","Caldono","Caloto","Corinto","El Tambo","Florencia","Guapi","Inzá","Jambalo","La Sierra","La Vega","Lopez","Mercaderes","Miranda","Morales","Padilla","Paez","Patia","Piamonte","Piendamo","Popayán","Puerto Tejada","Purace","Rosas","San Sebastian","Santa Rosa","Santander de Quilichao","Silvia","Sotara","Suarez","Sucre","Timbio","Timbiqui","Toribio","Totoro","Villa Rica"],Cesar:["Aguachica","Agustín Codazzi","Astrea","Becerril","Bosconia","Chimichagua","Chiriguaná","Curumaní","El Copey","El Paso","Gamarra","González","La Gloria","La Jagua de Ibirico","La Paz","Manaure","Pailitas","Pelaya","Pueblo Bello","Río de Oro","San Alberto","San Diego","San Martín","Tamalameque","Valledupar"],Chocó:["Acandí","Alto Baudó","Atrato","Bagadó","Bahía Solano","Bajo Baudó","Belén de Bajirá","Bojayá","Cantón de San Pablo","Carmen del Darién","Cértegui","Condoto","El Carmen de Atrato","El Litoral del San Juan","Istmina","Juradó","Lloró","Medio Atrato","Medio Baudó","Medio San Juan","Nóvita","Nuquí","Quibdó","Río Iró","Río Quito","Riosucio","San José del Palmar","Sipí","Tadó","Unguía","Unión Panamericana"],Córdoba:["Ayapel","Buenavista","Canalete","Cereté","Chimá","Chinú","Ciénaga de Oro","Cotorra","La Apartada","Lorica","Los Córdobas","Momil","Moñitos","Montelíbano","Montería","Planeta Rica","Pueblo Nuevo","Puerto Escondido","Puerto Libertador","Purísima","Sahagún","San Andrés de Sotavento","San Antero","San Bernardo del Viento","San Carlos","San Pelayo","Tierralta","Valencia"],Cundinamarca:["Agua de Dios","Albán","Anapoima","Anolaima","Apulo","Arbeláez","Beltrán","Bituima","Bojacá","Cabrera","Cachipay","Cajicá","Caparrapí","Cáqueza","Carmen de Carupa","Chaguaní","Chía","Chipaque","Choachí","Chocontá","Cogua","Cota","Cucunubá","El Colegio","El Peñón","El Rosal","Facatativá","Fomeque","Fosca","Funza","Fúquene","Fusagasugá","Gachala","Gachancipá","Gachetá","Gama","Girardot","Granada","Guachetá","Guaduas","Guasca","Guataquí","Guatavita","Guayabal de Síquima","Guayabetal","Gutiérrez","Jerusalén","Junín","La Calera","La Mesa","La Palma","La Peña","La Vega","Lenguazaque","Macheta","Madrid","Manta","Medina","Mosquera","Nariño","Nemocón","Nilo","Nimaima","Nocaima","Pacho","Paime","Pandi","Paratebueno","Pasca","Puerto Salgar","Puli","Quebradanegra","Quetame","Quipile","Ricaurte","San Antonio de Tequendama","San Bernardo","San Cayetano","San Francisco","San Juan de Rioseco","Sasaima","Sesquilé","Sibaté","Silvania","Simijaca","Soacha","Sopó","Subachoque","Suesca","Supatá","Susa","Sutatausa","Tabio","Tausa","Tena","Tenjo","Tibacuy","Tibirita","Tocaima","Tocancipá","Topaipí","Ubalá","Ubaque","Ubaté","Une","Útica","Venecia","Vergara","Vianí","Villagómez","Villapinzón","Villeta","Viotá","Yacopí","Zipacón","Zipaquirá"],Guainía:["Barranco Minas","Cacahual","Inírida","La Guadalupe","Mapiripana","Morichal","Pana Pana","Puerto Colombia","San Felipe"],Guaviare:["Calamar","El Retorno","Miraflores","San José del Guaviare"],Huila:["Acevedo","Agrado","Aipe","Algeciras","Altamira","Baraya","Campoalegre","Colombia","Elías","Garzón","Gigante","Guadalupe","Hobo","Iquira","Isnos","La Argentina","La Plata","Nátaga","Neiva","Oporapa","Paicol","Palermo","Palestina","Pital","Pitalito","Rivera","Saladoblanco","San Agustín","Santa María","Suaza","Tarqui","Tello","Teruel","Tesalia","Timaná","Villavieja","Yaguará"],"La Guajira":["Albania","Barrancas","Dibulla","Distracción","El Molino","Fonseca","Hatonuevo","La Jagua del Pilar","Maicao","Manaure","Riohacha","San Juan del Cesar","Uribia","Urumita","Villanueva"],Magdalena:["Algarrobo","Aracataca","Ariguaní","Cerro San Antonio","Chibolo","Ciénaga","Concordia","El Banco","El Piñón","El Reten","Fundación","Guamal","Nueva Granada","Pedraza","Pijiño del Carmen","Pivijay","Plato","Pueblo Viejo","Remolino","Sabanas de San Ángel","Salamina","San Sebastián de Buenavista","San Zenón","Santa Ana","Santa Bárbara de Pinto","Santa Marta","Sitionuevo","Tenerife","Zapayán","Zona Bananera"],Meta:["Acacías","Barranca de Upía","Cabuyaro","Castilla la Nueva","Cumaral","El Calvario","El Castillo","El Dorado","Fuente de Oro","Granada","Guamal","La Macarena","La Uribe","Lejanías","Mapiripán","Mesetas","Puerto Concordia","Puerto Gaitán","Puerto Lleras","Puerto López","Puerto Rico","Restrepo","San Carlos Guaroa","San Juan de Arama","San Juanito","San Luis de Cubarral","San Martín","Villavicencio","Vista Hermosa"],Nariño:["Albán","Aldana","Ancuyá","Arboleda","Barbacoas","Belén","Buesaco","Chachagüí","Colón","Consacá","Contadero","Córdoba","Cuaspud","Cumbal","Cumbitara","El Charco","El Peñol","El Rosario","El Tablón de Gómez","El Tambo","Francisco Pizarro","Funes","Guachucal","Guaitarilla","Gualmatán","Iles","Imues","Ipiales","La Cruz","La Florida","La Llanada","La Tola","La Unión","Leiva","Linares","Los Andes","Magüí Payán","Mallama","Mosquera","Nariño","Olaya Herrera","Ospina","Pasto","Policarpa","Potosí","Providencia","Puerres","Pupiales","Ricaurte","Roberto Payán","Samaniego","San Bernardo","San Lorenzo","San Pablo","San Pedro de Cartago","Sandoná","Santa Bárbara","Santa Cruz","Sapuyes","Taminango","Tangua","Tumaco","Túquerres","Yacuanquer"],"Norte de Santander":["Abrego","Arboledas","Bochalema","Bucarasica","Cachirá","Cácota","Chinácota","Chitagá","Convención","Cúcuta","Cucutilla","Durania","El Carmen","El Tarra","El Zulia","Gramalote","Hacarí","Herrán","La Esperanza","La Playa","Labateca","Los Patios","Lourdes","Mutiscua","Ocaña","Pamplona","Pamplonita","Puerto Santander","Ragonvalia","Salazar","San Calixto","San Cayetano","Santiago","Sardinata","Silos","Teorama","Tibú","Toledo","Villa Caro","Villa del Rosario"],Putumayo:["Colón","Mocoa","Orito","Puerto Asís","Puerto Caicedo","Puerto Guzmán","Puerto Leguizamo","San Francisco","San Miguel","Santiago","Sibundoy","Valle del Guamuez","Villa Garzón"],Quindío:["Armenia","Buenavista","Calarcá","Circasia","Córdoba","Filandia","Génova","La Tebaida","Montenegro","Pijao","Quimbaya","Salento"],Risaralda:["Apía","Balboa","Belén de Umbría","Dosquebradas","Guática","La Celia","La Virginia","Marsella","Mistrató","Pereira","Pueblo Rico","Quinchía","Santa Rosa de Cabal","Santuario"],"San Andrés y Providencia":["Providencia y Santa Catalina","San Andrés"],Santander:["Aguada","Albania","Aratoca","Barbosa","Barichara","Barrancabermeja","Betulia","Bolívar","Bucaramanga","Cabrera","California","Capitanejo","Carcasí","Cepitá","Cerrito","Charalá","Charta","Chima","Chipatá","Cimitarra","Concepción","Confines","Contratación","Coromoro","Curití","El Carmen de Chucurí","El Guacamayo","El Peñón","El Playón","Encino","Enciso","Florián","Floridablanca","Galán","Gambita","Girón","Guaca","Guadalupe","Guapotá","Guavatá","Güepsa","Hato","Jesús María","Jordán","La Belleza","La Paz","Landázuri","Lebríja","Los Santos","Macaravita","Málaga","Matanza","Mogotes","Molagavita","Ocamonte","Oiba","Onzaga","Palmar","Palmas del Socorro","Páramo","Piedecuesta","Pinchote","Puente Nacional","Puerto Parra","Puerto Wilches","Rionegro","Sabana de Torres","San Andrés","San Benito","San Gil","San Joaquín","San José de Miranda","San Miguel","San Vicente de Chucurí","Santa Bárbara","Santa Helena del Opón","Simacota","Socorro","Suaita","Sucre","Surata","Tona","Valle de San José","Vélez","Vetas","Villanueva","Zapatoca"],Sucre:["Buenavista","Caimito","Chalán","Coloso","Corozal","Coveñas","El Roble","Galeras","Guaranda","La Unión","Los Palmitos","Majagual","Morroa","Ovejas","Palmito","Sampués","San Benito Abad","San Juan Betulia","San Marcos","San Onofre","San Pedro","Santiago de Tolú","Sincé","Sincelejo","Sucre","Tolú Viejo"],Tolima:["Alpujarra","Alvarado","Ambalema","Anzoátegui","Armero","Ataco","Cajamarca","Carmen de Apicalá","Casabianca","Chaparral","Coello","Coyaima","Cunday","Dolores","Espinal","Falan","Flandes","Fresno","Guamo","Herveo","Honda","Ibagué","Icononzo","Lérida","Líbano","Mariquita","Melgar","Murillo","Natagaima","Ortega","Palocabildo","Piedras","Planadas","Prado","Purificación","Rioblanco","Roncesvalles","Rovira","Saldaña","San Antonio","San Luis","Santa Isabel","Suárez","Valle de San Juan","Venadillo","Villahermosa","Villarrica"],"Valle del Cauca":["Alcalá","Andalucía","Ansermanuevo","Argelia","Bolívar","Buenaventura","Buga","Bugalagrande","Caicedonia","Cali","Calima","Candelaria","Cartago","Dagua","El Águila","El Cairo","El Cerrito","El Dovio","Florida","Ginebra","Guacarí","Jamundí","La Cumbre","La Unión","La Victoria","Obando","Palmira","Pradera","Restrepo","Riofrío","Roldanillo","San Pedro","Sevilla","Toro","Trujillo","Tuluá","Ulloa","Versalles","Vijes","Yotoco","Yumbo","Zarzal"],Vaupés:["Carurú","Mitú","Pacoa","Papunahua","Taraira","Yavaraté"],Vichada:["Cumaribo","La Primavera","Puerto Carreño","Santa Rosalía"]},Ka=[{title:"How to answer salary questions",tag:"Interview",read:"4 min",body:"Use a confident range, anchor it to the role, and avoid apologizing for earning in USD.",actions:["Know your floor","Use monthly USD","Mention flexibility last"]},{title:"Writing a CV for US SaaS companies",tag:"CV",read:"6 min",body:"Translate local experience into metrics US hiring managers can scan in under a minute.",actions:["Lead with outcomes","Add tools","Quantify scope"]},{title:"Before your recruiter screen",tag:"Process",read:"3 min",body:"Prepare availability, compensation, English comfort, and two strong role stories.",actions:["Check your setup","Review the opening","Bring questions"]},{title:"STAR stories that feel natural",tag:"Interview",read:"5 min",body:"Keep stories specific, concise, and tied to business impact instead of job duties.",actions:["Situation","Action","Result"]}],Dt=[{key:"profile-review",label:"Profile Review",help:"We are checking role fit and your candidate profile."},{key:"background-check",label:"Background Checks",help:"Nearwork is verifying relevant background and work details."},{key:"assessment",label:"Assessment",help:"Complete role-specific questions when assigned."},{key:"interview",label:"Interview",help:"Meet the recruiter and book your next conversation."},{key:"presented",label:"Presented",help:"Your profile has been prepared for the company."},{key:"client-review",label:"Client Review",help:"The company is reviewing your profile and next steps."},{key:"hired",label:"Hired",help:"Offer accepted and onboarding is ready to begin."}],Kt=["Applied","Assessment","Interview","Final round","Offer"];let r={user:null,candidate:null,applications:[],assessments:[],notifications:[],notificationPanelOpen:!1,notificationSettingsOpen:!1,jobs:[],loading:!0,view:"login",activePage:"overview",matchesFiltered:!1,message:"",assessmentUiStep:null,showDeleteAccountModal:!1,deleteAccountStatus:null,deleteAccountError:"",showUnsavedChangesModal:!1,resetCodeStatus:null,resetCodeError:""},Y=null;const lt=sessionStorage.getItem("nw_restore_path");lt&&(sessionStorage.removeItem("nw_restore_path"),window.history.replaceState({page:lt},"",lt));function Xt(){return[["overview","layout-dashboard","Overview"],["matches","briefcase-business","Matches"],["applications","send","Applications"],["assessment","clipboard-check","Assessment"],["cvs","files","CV Picker"],["tips","book-open","Tips"],["recruiter","calendar-days","Recruiter"],["profile","user-round-cog","Profile"]]}function et(){const t=window.location.pathname.split("/").filter(Boolean)[0];return t==="onboarding"?"onboarding":t==="assessment"||t==="assessments"?"assessment":Xt().some(([a])=>a===t)?t:"overview"}function fe(){const e=window.location.pathname.split("/").filter(Boolean);return(e[0]==="assessment"||e[0]==="assessments")&&e[1]||""}function ea(){const e=window.location.pathname.split("/").filter(Boolean),t=e.findIndex(n=>n==="q"||n==="question");if(t===-1)return null;const a=Number(e[t+1]);return Number.isFinite(a)&&a>0?a-1:null}function Xa(e,t=0){return`/assessment/${encodeURIComponent(e)}/start/q/${Number(t||0)+1}`}function Le(e,t=0,a=!1){const n=Xa(e,t);if(window.location.pathname===n)return;const s=a?"replaceState":"pushState";window.history[s]({page:"assessment",assessmentId:e,questionIndex:t},"",n)}function m(e,t){return`<i data-lucide="${e}" aria-label="${e}"></i>`}let ct=!1;function qe(){if(window.lucide){window.lucide.createIcons();return}if(ct)return;ct=!0;const e=()=>{window.lucide?(window.lucide.createIcons(),ct=!1):setTimeout(e,50)};e()}function b(e){r={...r,...e},va()}function Fe(e,t=!0){const n=e==="onboarding"||Xt().some(([s])=>s===e)?e:"overview";r={...r,activePage:n,matchesFiltered:n==="matches"?r.matchesFiltered:!1,message:"",assessmentUiStep:null},t&&window.history.pushState({page:n},"",n==="overview"?"/":`/${n}`),va()}function ta(){var t,a;return(((t=r.candidate)==null?void 0:t.name)||((a=r.user)==null?void 0:a.displayName)||"there").split(" ")[0]||"there"}function en(){var t,a,n;return(((t=r.candidate)==null?void 0:t.name)||((a=r.user)==null?void 0:a.displayName)||((n=r.user)==null?void 0:n.email)||"NW").split(/[ @.]/).filter(Boolean).slice(0,2).map(s=>s[0]).join("").toUpperCase()}function aa(e="normal"){var n,s;const t=((n=r.candidate)==null?void 0:n.photoURL)||((s=r.user)==null?void 0:s.photoURL)||"",a=e==="large"?"avatar avatar-large":"avatar";return t?`<img class="${a}" src="${y(t)}" alt="${y(ta())}" />`:`<div class="${a}">${en()}</div>`}function y(e){return String(e||"").replaceAll("&","&amp;").replaceAll('"',"&quot;").replaceAll("<","&lt;").replaceAll(">","&gt;")}function E(e){return String(e||"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;")}function st(e){if(!e)return"Recently";const t=e.toDate?e.toDate():new Date(e);return new Intl.DateTimeFormat("en",{month:"short",day:"numeric"}).format(t)}function Ve(){var t;const e=((t=r.candidate)==null?void 0:t.skills)||[];return Array.isArray(e)?e:String(e).split(",").map(a=>a.trim()).filter(Boolean)}function Q(e){return String(e||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/&/g," and ").replace(/[^a-z0-9]+/g," ").trim().replace(/\s+/g," ")}function kt(e,t=Ve()){const a=be(e),n=new Set((a.skills||[]).map(Q).filter(Boolean)),s=new Map(t.map(i=>[Q(i),i]).filter(([i])=>i));return[...s.keys()].filter(i=>n.has(i)).map(i=>s.get(i))}function na(e){return["Nearwork candidate","Talent member"].includes(String(e||"").trim())}function _t(e){if(!e)return null;if(e.toDate)return e.toDate();if(typeof e=="object"&&typeof e.seconds=="number")return new Date(e.seconds*1e3);const t=new Date(e);return Number.isNaN(t.getTime())?null:t}function $t(e){return Number(e||1)===1?"Technical Assessment":"DISC Assessment"}function dt(e,t){var a,n,s;return((n=(a=e==null?void 0:e.answers)==null?void 0:a[t==null?void 0:t.id])==null?void 0:n.value)??((s=e==null?void 0:e.answers)==null?void 0:s[t==null?void 0:t.id])??""}function Ne(e){return e!=null&&e!==""}function se(e,t){return((e==null?void 0:e.questions)||[]).slice(0,70).filter(a=>Number(a.stage||1)===Number(t))}function ft(e,t,a=(e==null?void 0:e.answers)||{}){return se(e,t).filter(n=>{var s;return!Ne(((s=a[n.id])==null?void 0:s.value)??a[n.id])})}function tn(){var e,t;return!!((r.applications||[]).length||(((e=r.candidate)==null?void 0:e.pipelineCodes)||[]).length||(t=r.candidate)!=null&&t.pipelineCode)}function an(){var n,s,i;const e=((n=r.candidate)==null?void 0:n.department)||"Bogotá D.C.",t=pe[e]||pe["Bogotá D.C."]||["Bogotá"],a=((s=r.candidate)==null?void 0:s.city)||((i=r.candidate)==null?void 0:i.locationCity)||t[0];return{department:e,city:a,label:`${a}, ${e}`}}function nn(){var t,a,n;const e=((t=r.candidate)==null?void 0:t.targetRole)||((a=r.candidate)==null?void 0:a.headline)||"";return((n=Object.entries(Me).find(([,s])=>s.includes(e)))==null?void 0:n[0])||Object.keys(Me)[0]}function sa(e){return Object.keys(Me).map(t=>`<option value="${y(t)}" ${t===e?"selected":""}>${t}</option>`).join("")}function it(e,t){const a=Me[e]||Object.values(Me).flat();return['<option value="">Choose the closest role</option>'].concat(a.map(n=>`<option value="${y(n)}" ${t===n?"selected":""}>${n}</option>`)).join("")}function xe(e){const t=String(e||"").replace(/[,.\s]+$/,"").replace(/^[,.\s]+/,"").trim();if(!t||t.length<2)return"";const a=Zt.find(n=>Q(n)===Q(t));return a||t.split(/\s+/).map(n=>n.length<=3&&n===n.toUpperCase()?n:n.charAt(0).toUpperCase()+n.slice(1).toLowerCase()).join(" ")}function ia(e){const t=[...new Set((e||[]).map(xe).filter(Boolean))],a=["Customer Service","Salesforce","HubSpot","Excel","Google Sheets","Technical Support","Outbound Calls","React","SQL","Payroll"];return`
    <div class="skill-search-shell" data-skill-search>
      <div class="selected-skills" id="selectedSkills">
        ${t.map(n=>`
          <span class="selected-skill" data-skill-chip="${y(n)}">
            ${E(n)}
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
        ${a.map(n=>`<button type="button" class="skill-suggestion" data-skill="${y(n)}">${E(n)}</button>`).join("")}
      </div>
      <p class="field-hint">Select between 5 and 20 skills that best describe your experience.</p>
    </div>
  `}function oa(e,t="USD"){const a=Number(String(e||"").replace(/[^\d.]/g,"")),n=String(t||"USD").toUpperCase()==="COP"?"COP":"USD";if(!Number.isFinite(a)||a<=0)return{salary:"",salaryUSD:null,salaryCurrency:n,salaryAmount:null};const s=Math.round(a),i=n==="COP"?"es-CO":"en-US";return{salary:`$${new Intl.NumberFormat(i).format(s)} ${n}/mo`,salaryUSD:n==="USD"?s:null,salaryCurrency:n,salaryAmount:s}}function ra(e){return Number(String(e||"").replace(/[^\d.]/g,""))}function Rt(e,t="USD"){const a=ra(e),n=String(t||"USD").toUpperCase()==="COP"?"COP":"USD";return n==="USD"&&a>=1e5?"COP":n}function ht(e,t="USD"){const a=ra(e);return!Number.isFinite(a)||a<=0?"":new Intl.NumberFormat("en-US",{maximumFractionDigits:0}).format(Math.round(a))}function la(e){return Array.isArray(e)?e:String(e||"").split(",").map(t=>t.trim()).filter(Boolean)}function be(e){const t=la(e.skills||e.requiredSkills);return{id:e.id||e.code,code:e.code||e.id,title:e.title||e.role||e.openingTitle||"Open role",orgName:e.orgName||e.company||e.clientName||"Nearwork client",location:e.location||"Remote",compensation:e.compensation||e.salary||e.rate||"Competitive",match:e.match||null,skills:t,description:e.description||e.about||"Nearwork is reviewing candidates for this role now."}}function ke(e){const t=(e==null?void 0:e.code)||"";return t.includes("operation-not-allowed")?"This sign-in method is not available yet.":t.includes("unauthorized-domain")?"This website still needs to be approved for sign-in.":t.includes("permission-denied")?"We could not save this yet. Please try again in a moment or contact Nearwork support.":t.includes("weak-password")?"Password must be at least 6 characters.":t.includes("invalid-credential")||t.includes("wrong-password")?"That email/password did not match.":t.includes("user-not-found")?"No account exists for that email yet.":t.includes("email-already-in-use")?"That email already has an account. Sign in instead.":"Something went wrong. Please try again or contact Nearwork support."}const Qe=[{initials:"CP",name:"Camila P.",role:"Product Designer",city:"Medellín",quote:"I doubled my income and kept living in Medellín. The whole process took 19 days from apply to signed offer."},{initials:"AR",name:"Andrés R.",role:"SDR",city:"Bogotá",quote:"I went from chasing local leads to running outbound for a US SaaS team — same desk, way better pay."},{initials:"LG",name:"Laura G.",role:"Customer Success Manager",city:"Cali",quote:"No recruiters ghosting me. One profile, real interviews, and an offer that actually matched the role."},{initials:"FT",name:"Felipe T.",role:"Sales Ops Analyst",city:"Bucaramanga",quote:"The matching was spot on. I only talked to teams that fit what I was looking for, and signed within a month."},{initials:"DV",name:"Daniela V.",role:"Account Executive",city:"Cartagena",quote:"Now I'm closing deals for a US company in USD, still based in Cartagena. Best career move I've made."}];let he=null;function sn(e){he&&clearInterval(he);const t=Qe[0];nt.innerHTML=`
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
            ${Qe.map((n,s)=>`<span class="testimonial-dot${s===0?" is-active":""}"></span>`).join("")}
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
  `,qe();let a=0;he=setInterval(()=>{const n=document.querySelector(".testimonial");if(!n){clearInterval(he),he=null;return}const s=n.querySelector(".testimonial-content");s.classList.add("is-flipping"),setTimeout(()=>{a=(a+1)%Qe.length;const i=Qe[a],o=s.querySelector("p"),d=s.querySelector(".mini-avatar"),c=s.querySelector(".testimonial-person strong"),l=s.querySelector(".testimonial-person small");o&&(o.textContent=`"${i.quote}"`),d&&(d.textContent=i.initials),c&&(c.textContent=i.name),l&&(l.textContent=`${i.role}, ${i.city}`),n.querySelectorAll(".testimonial-dot").forEach((p,u)=>p.classList.toggle("is-active",u===a)),s.classList.remove("is-flipping")},320)},6e3)}function ca(e="login"){var s;const t=e==="signup";he&&clearInterval(he),he=null,nt.innerHTML=`
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
          ${r.message?`<div class="notice">${m("lock")} ${y(r.message)}</div>`:""}
          ${ye?"":`<div class="notice">${m("triangle-alert")} Sign-in is still being set up.</div>`}
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
  `,qe();const a=new URLSearchParams(window.location.search).get("email");if(a){const i=document.querySelector("#emailInput");i&&(i.value=a,i.dispatchEvent(new Event("input")));const o=document.querySelector("#passwordInput");o&&o.focus()}if(new URLSearchParams(window.location.search).get("from")==="jobs"&&r.message!=="Welcome from Jobs — log in to view your dashboard."){const i=document.querySelector("#formMessage");i&&(i.textContent="Welcome from Jobs — log in to view your dashboard.",i.classList.add("success"))}document.querySelector("#toggleMode").addEventListener("click",()=>ca(t?"login":"signup")),document.querySelectorAll("[data-password-toggle]").forEach(i=>{i.addEventListener("click",()=>{const o=i.previousElementSibling,d=o.type==="password";o.type=d?"text":"password",i.innerHTML=m(d?"eye-off":"eye"),i.setAttribute("aria-label",d?"Hide password":"Show password"),qe()})}),(s=document.querySelector("#resetPassword"))==null||s.addEventListener("click",async()=>{const i=document.querySelector("input[name='email']").value.trim().toLowerCase(),o=document.querySelector("#formMessage");if(!i){o.classList.remove("success"),o.textContent="Enter your email first, then request a reset link.";return}try{await ja(i),o.classList.add("success"),o.textContent=`Reset link sent! Check ${i} — it should arrive within a minute.`}catch(d){o.classList.remove("success"),o.textContent=ke(d)}}),document.querySelector("#authForm").addEventListener("submit",async i=>{var u;i.preventDefault();const o=new FormData(i.currentTarget),d=document.querySelector("#formMessage"),c=String(o.get("email")).trim().toLowerCase();if(d.textContent="",t){const v=document.querySelector("#privacyConsent"),h=document.querySelector("#privacyConsentError");if(v&&!v.checked){h&&(h.style.display=""),d.textContent="Please accept the Privacy Policy to continue.";return}h&&(h.style.display="none")}const l=t?((u=document.querySelector("#marketingConsent"))==null?void 0:u.checked)===!0:!1,p=new Date().toISOString();try{if(t){const v=await Sa(U,c,o.get("password"));await Ca(v.user,{displayName:o.get("name")}),sessionStorage.setItem("nw_new_account","1"),await Qt(v.user.uid,{name:o.get("name"),email:c,availability:"open",headline:"Nearwork candidate",onboarded:!1,source:"talent.nearwork.co",privacyConsent:!0,privacyConsentAt:p,marketingConsent:l,marketingConsentAt:l?p:null}),await La({name:o.get("name"),firstName:String(o.get("name")||"").trim().split(/\s+/)[0],email:c}).catch(h=>console.error("[NW] account email failed:",h==null?void 0:h.message))}else await ka(U,c,o.get("password"))}catch(v){d.textContent=ke(v)}})}function on(){var n,s;const e=new URLSearchParams(window.location.search),t=e.get("token")||"",a=e.get("email")||"";sn(`
    <section class="auth-panel">
      <div class="auth-top">
        <div class="right-brand">Near<span>work</span></div>
        <div class="candidate-chip">Candidate portal</div>
      </div>
      <div class="panel-heading">
        <h2>Set a new password.</h2>
        <p>${a?`Resetting password for <strong>${E(a)}</strong>. Choose a password you haven't used before.`:"Choose a new password you haven't used before."}</p>
      </div>
      ${t?r.resetCodeStatus==="success"?`
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
        ${r.resetCodeStatus==="error"?`<div class="notice">${m("triangle-alert")} ${E(r.resetCodeError||"Something went wrong. Please request a new link.")}</div>`:""}
        <button class="primary-action" type="submit" ${r.resetCodeStatus==="resetting"?"disabled":""}>
          ${r.resetCodeStatus==="resetting"?"Updating…":`${m("lock")} Set new password`}
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
  `),document.querySelectorAll("[data-password-toggle]").forEach(i=>{i.addEventListener("click",()=>{const o=i.previousElementSibling,d=o.type==="password";o.type=d?"text":"password",i.innerHTML=m(d?"eye-off":"eye"),i.setAttribute("aria-label",d?"Hide password":"Show password"),qe()})}),(n=document.querySelector("#backToLogin"))==null||n.addEventListener("click",()=>{const i=r.resetCodeStatus==="success"?"Your password has been reset. Sign in with your new password.":"";window.history.pushState({},"","/"),b({view:"login",message:i,resetCodeStatus:null,resetCodeError:""})}),(s=document.querySelector("#resetForm"))==null||s.addEventListener("submit",async i=>{i.preventDefault();const o=document.querySelector("#newPassword").value,d=document.querySelector("#confirmPassword").value;if(o!==d){b({resetCodeStatus:"error",resetCodeError:"Passwords do not match."});return}if(o.length<6){b({resetCodeStatus:"error",resetCodeError:"Password must be at least 6 characters."});return}b({resetCodeStatus:"resetting"});try{const c=await fetch("/api/confirm-reset",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({token:t,newPassword:o})}),l=await c.json().catch(()=>({}));if(!c.ok||!l.ok)throw new Error(l.error||"Something went wrong. Please request a new link.");b({resetCodeStatus:"success"})}catch(c){const l=(c==null?void 0:c.message)||"This link has expired or already been used. Please request a new one.";b({resetCodeStatus:"error",resetCodeError:l})}})}async function Ut(e){var t,a;b({loading:!0,user:e});try{const[n,s,i]=await Promise.allSettled([Ma(e),Ia(e.uid),Wt()]),o=n.status==="fulfilled"?n.value:null,d=s.status==="fulfilled"?s.value:[],c=i.status==="fulfilled"?i.value:[];let l=[];try{l=await Da(e.uid,e.email,(o==null?void 0:o.candidateCode)||(o==null?void 0:o.code)||"")}catch(C){console.warn(C)}const p=fe();if(p&&!l.some(C=>C.id===p)){const C=await _a(p,e.uid,e.email,(o==null?void 0:o.candidateCode)||(o==null?void 0:o.code)||"").catch(()=>null);C&&(l=[C,...l])}const u=sessionStorage.getItem("nw_new_account")==="1";u&&sessionStorage.removeItem("nw_new_account");const v=!!(o!=null&&o.targetRole||!na(o==null?void 0:o.headline)&&(o!=null&&o.headline)),h=new URLSearchParams(window.location.search).get("from")==="jobs",N=!!(o!=null&&o.cvUrl||(t=o==null?void 0:o.applications)!=null&&t.length||((a=o==null?void 0:o.skills)==null?void 0:a.length)>=3),A=(o==null?void 0:o.onboarded)||v||N||h;!(o!=null&&o.onboarded)&&A&&bt(e.uid,{onboarded:!0,candidateCode:o==null?void 0:o.candidateCode}).catch(()=>null);const x=u&&!A?"onboarding":A?et():"onboarding";b({candidate:{...o||{},name:(o==null?void 0:o.name)||e.displayName||"Talent member",email:(o==null?void 0:o.email)||e.email,availability:(o==null?void 0:o.availability)||"open",headline:(o==null?void 0:o.headline)||(o==null?void 0:o.targetRole)||"Nearwork candidate"},applications:d,assessments:l,jobs:c.map(be),loading:!1,view:"dashboard",activePage:x,message:""}),Y&&Y(),ye&&(Y=Ha(e.uid,C=>{r.notifications=C,r.view==="dashboard"&&!r.message&&da()}))}catch(n){console.warn(n),b({candidate:{name:e.displayName||"Talent member",email:e.email,availability:"open",headline:"Nearwork candidate"},applications:[],assessments:[],jobs:[],loading:!1,view:"dashboard",activePage:et(),message:""})}}async function Oe(){if(window.location.pathname==="/reset-password"){Y&&Y(),Y=null,b({user:null,candidate:null,loading:!1,view:"reset-password",resetCodeStatus:null});return}const e=et();if(e==="assessment"){sessionStorage.setItem("nw_restore_path",window.location.pathname),b({user:null,candidate:null,applications:[],assessments:[],jobs:[],loading:!1,view:"login",activePage:"overview",message:"Please log in to open your assessment."});return}if(e==="overview"){Y&&Y(),Y=null,b({user:null,candidate:null,loading:!1,view:"login",activePage:"overview"});return}let t=[];try{const a=await Wt();a.length&&(t=a.map(be))}catch(a){console.warn(a)}b({user:null,candidate:null,applications:[],assessments:[],jobs:t,loading:!1,view:"login",activePage:"overview",message:"Please log in to view your profile, matched openings, applications, and assessments."})}function rn(){return[{label:"My journey",items:[["overview","layout-dashboard","Overview"],["applications","send","Applications"],["assessment","clipboard-check","Assessment"]]},{label:"My search",items:[["matches","briefcase-business","Matches"],["cvs","files","CV Picker"]]},{label:"Support",items:[["tips","book-open","Tips"],["recruiter","calendar-days","Recruiter"],["profile","user-round-cog","Profile"]]}]}function ln(){var e;return{open:"Open to roles",interviewing:"Interviewing",paused:"Not looking"}[((e=r.candidate)==null?void 0:e.availability)||"open"]||"Open to roles"}function At(){const e=r.candidate||{},t=Ve();return[{id:"name",label:"Full name",done:!!e.name},{id:"role",label:"Target role",done:!!(e.targetRole||!na(e.headline)&&e.headline)},{id:"location",label:"City",done:!!e.city},{id:"salary",label:"Salary",done:!!(e.salaryAmount||e.salary)},{id:"english",label:"English",done:!!e.english},{id:"whatsapp",label:"WhatsApp",done:!!(e.whatsapp||e.phone)},{id:"skills",label:"Skills (5-20)",done:t.length>=5},{id:"cv",label:"CV",done:!!e.cvUrl}]}function da(){var o,d,c,l,p;const e=(r.notifications||[]).filter(u=>!u.read).length,t=((o=r.candidate)==null?void 0:o.availability)||"open",n={open:"#10A07C",interviewing:"#EAB308",paused:"#9AA0A6"}[t]||"#10A07C",s=((d=r.candidate)==null?void 0:d.name)||((c=r.user)==null?void 0:c.displayName)||"Talent member",i=((l=r.candidate)==null?void 0:l.headline)||((p=r.candidate)==null?void 0:p.targetRole)||"Nearwork candidate";nt.innerHTML=`
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
          ${rn().map(u=>`
            <div class="nw-nav-group">
              <div class="nw-nav-group-label">${u.label}</div>
              ${u.items.map(([v,h,N])=>`
                <button class="nw-nav-item${r.activePage===v?" active":""}" data-page="${v}" type="button">
                  ${m(h)} ${N}
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
          ${aa()}
          <div class="nw-sidebar-profile-text">
            <div class="nw-sidebar-profile-name">${E(s)}</div>
            <div class="nw-sidebar-profile-role">${E(i)}</div>
          </div>
        </div>

        <!-- Sign out -->
        <button id="${r.user?"signOut":"signIn"}" class="nw-sidebar-signout" type="button">
          ${m(r.user?"log-out":"log-in")} ${r.user?"Sign out":"Sign in"}
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
              <span class="nw-avail-label">${ln()}</span>
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
              ${r.notificationPanelOpen?dn():""}
            </div>
            <button class="nw-icon-btn" type="button" id="notificationSettings" aria-label="Settings">
              ${m("settings")}
            </button>
          </div>
        </div>

        <!-- Notification settings -->
        ${r.notificationSettingsOpen?un():""}

        <!-- Page content -->
        ${r.message?`<div class="notice" style="margin:0 36px;">${r.message}</div>`:""}
        <div class="nw-page-content">
          ${(()=>{try{return gn()}catch(u){return console.error("renderActivePage error:",u),'<div class="notice">Page failed to render. <button type="button" data-page="overview">Go to overview</button></div>'}})()}
        </div>
      </section>
    </main>
  `,qe(),Zn(),mn(),pn()}function cn(e){return(e!=null&&e.toDate?e.toDate():new Date(e||Date.now())).toLocaleString("en-US",{month:"short",day:"numeric",year:"numeric",hour:"numeric",minute:"2-digit"})}function dn(){const e=(r.notifications||[]).slice(0,10);return`
    <div class="notification-panel">
      <div class="notification-panel-head"><strong>Notifications</strong><span>${e.length?"Latest updates":"All clear"}</span></div>
      ${e.length?e.map(t=>`
        <button class="notification-item ${t.read?"":"unread"}" type="button" data-notification-read="${t.id}">
          <strong>${y(t.title||"Nearwork update")}</strong>
          <span>${y(t.message||"")}</span>
          <time>${cn(t.createdAt)}</time>
        </button>
      `).join(""):'<div class="notification-empty">No notifications yet.</div>'}
    </div>
  `}function un(){var a;const e=((a=r.candidate)==null?void 0:a.notificationPreferences)||{};return`
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
  `}let Je=null;function pn(){Je&&window.clearInterval(Je);const e=document.querySelector("#assessmentTimer");if(!e)return;const t=new Date(e.dataset.end||"").getTime(),a=()=>{const n=Math.max(0,t-Date.now()),s=Math.floor(n/1e3),i=Math.floor(s/60),o=String(s%60).padStart(2,"0");e.textContent=`${i}:${o}`,e.classList.toggle("is-low",n<=10*60*1e3),n<=0&&window.clearInterval(Je)};a(),Je=window.setInterval(a,1e3)}function mn(){if(r.activePage!=="assessment")return;const e=r.assessments||[],t=fe(),n=(t?e.find(i=>i.id===t):null)||e.find(i=>["sent","started"].includes(String(i.status||"").toLowerCase()));if(!(n!=null&&n.id))return;const s=String(n.status||"").toLowerCase();if(s==="started"&&ea()===null){Le(n.id,Number(n.currentQuestionIndex||0),!0);return}if(!t&&s==="sent"){const i=`/assessment/${encodeURIComponent(n.id)}/start`;window.history.replaceState({page:"assessment",assessmentId:n.id},"",i)}}function gn(){return({onboarding:vn,overview:Bt,matches:Sn,applications:Cn,assessment:kn,cvs:_n,tips:Rn,recruiter:Un,profile:Bn}[r.activePage]||Bt)()}function Bt(){var A,x;const e=ua(),t=At(),a=t.filter(C=>C.done).length,n=t.length,s=r.applications||[],i=s.filter(C=>["action-needed","interview-scheduled","assessment-sent"].includes(String(C.status||"").toLowerCase())).length,o=(r.jobs||[]).slice(0,3),d=((A=r.candidate)==null?void 0:A.recruiter)||{},c=2*Math.PI*52,l=c*(1-e/100),u=new Date().toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"}),v=(C,M,R,H,B)=>`
    <div class="nw-stat-tile">
      <div class="nw-stat-tile-top">
        <span class="nw-stat-tile-label">${C}</span>
        <div class="nw-stat-icon" style="background:${H}14;">
          ${m(B)}
        </div>
      </div>
      <div class="nw-stat-value">${M}</div>
      <div class="nw-stat-sub">${R}</div>
    </div>`,h=(C,M)=>{const R=String(C.stage||C.status||"applied").toLowerCase(),H=R.includes("offer")?4:R.includes("final")?3:R.includes("interview")?2:R.includes("assessment")?1:0,B=C.clientName||C.company||"Nearwork client",q=B.split(/\s+/).slice(0,2).map(g=>g[0]).join("").toUpperCase(),Z=["#10A07C","#EC4E7E","#3B82F6","#F4A52E","#8B5CF6"],f=Z[B.length%Z.length];return`
      <div class="nw-app-row${M?" last":""}">
        <div class="nw-app-avatar" style="background:${f};">${q}</div>
        <div class="nw-app-info">
          <div class="nw-app-title">${E(C.jobTitle||C.title||"Application")} <span class="nw-app-company">· ${E(B)}</span></div>
          <div class="nw-app-stages">
            ${Kt.map((g,w)=>`<div class="nw-stage-pip${w<=H?" done":""}"></div>`).join("")}
            <span class="nw-app-stage-label">${C.stage||C.status||"Applied"}</span>
          </div>
        </div>
        <div class="nw-app-meta">
          <span class="nw-app-status${i?" action":""}">${C.status||"In review"}</span>
          <div class="nw-app-date">${st(C.updatedAt||C.createdAt)}</div>
        </div>
        ${m("chevron-right")}
      </div>`},N=C=>{const M=be(C),R=kt(M),H=M.match||(R.length>=3?Math.min(97,70+R.length*4):null),B=["#10A07C","#EC4E7E","#3B82F6","#F4A52E"],q=B[M.orgName.length%B.length],Z=M.orgName.split(/\s+/).slice(0,2).map(f=>f[0]).join("").toUpperCase();return`${encodeURIComponent(M.code)}`,`
      <div class="nw-match-card">
        <div class="nw-match-card-top">
          <div class="nw-match-avatar" style="background:${q};">${Z}</div>
          ${H?`<div class="nw-match-score">${H}%</div>`:""}
        </div>
        <div class="nw-match-role">${E(M.title)}</div>
        <div class="nw-match-company">${E(M.orgName)} · ${E(M.location)}</div>
        ${R.length?`<div class="nw-match-why">${R.slice(0,3).map(E).join(" · ")} match</div>`:`<div class="nw-match-why">${E(M.description).slice(0,80)}…</div>`}
        <div class="nw-match-footer">
          <span class="nw-match-salary">${E(M.compensation)}</span>
          <button type="button" class="nw-match-apply" data-apply="${y(M.code)}">Apply ${m("arrow-right")}</button>
        </div>
      </div>`};return`
    <!-- Greeting -->
    <div class="nw-overview-header">
      <div class="nw-overview-date">Overview · ${u}</div>
      <h1 class="nw-overview-greeting">
        Hi ${E(ta())},
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
          ${t.map(C=>`
            <div class="nw-check-pill${C.done?" done":""}">
              ${m(C.done?"check":"circle")} ${C.label}
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
      ${v("Open matches",r.jobs.length,r.jobs.length?`${r.jobs.length} role${r.jobs.length>1?"s":""} waiting`:"Complete profile to unlock","#10A07C","sparkles")}
      ${v("Applications",s.length,s.length?`${i||"0"} need your input`:"Not applied yet","#EC4E7E","send")}
      ${v("Interviews",s.filter(C=>String(C.stage||C.status||"").toLowerCase().includes("interview")).length,"Scheduled","Not yet scheduled","#F4A52E")}
      ${v("CVs saved",(((x=r.candidate)==null?void 0:x.cvLibrary)||[]).length,"In your library","Upload your first CV","#3B82F6")}
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
        ${s.length?s.slice(0,4).map((C,M)=>h(C,M===Math.min(s.length,4)-1)).join(""):`<div class="nw-empty">
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
              <div class="nw-recruiter-name">${E(d.name||"Nearwork Support")}</div>
              <div class="nw-recruiter-role">${E(d.role||"Talent Partner")}</div>
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
    ${o.length?`
      <section class="nw-matches-section">
        <div class="nw-panel-head">
          <div>
            <div class="nw-panel-overline">Picked for you</div>
            <div class="nw-panel-title">Top matches this week</div>
          </div>
          <button class="nw-ghost-btn" type="button" data-page="matches">See all ${m("arrow-right")}</button>
        </div>
        <div class="nw-match-grid">
          ${o.map(C=>N(C)).join("")}
        </div>
      </section>
    `:""}
  `}function vn(){if(!Xe){Xe=!0,Ct=1;const e=r.candidate||{},t=String(e.name||"").trim().split(/\s+/).filter(Boolean);P={roleGroup:e.roleGroup||"",targetRole:e.targetRole||"",department:e.department||e.locationDepartment||"",city:e.city||e.locationCity||"",english:e.english||"",firstName:e.firstName||t[0]||"",lastName:e.lastName||t.slice(1).join(" ")||"",phone:e.phone||e.whatsapp||"",currentRole:e.currentRole||"",expectedSalaryUSD:e.expectedSalaryUSD||(e.salaryCurrency!=="COP"?e.salaryAmount:null)||"",expectedSalaryCOP:e.expectedSalaryCOP||(e.salaryCurrency==="COP"?e.salaryAmount:null)||"",linkedin:e.linkedin||"",experience:Array.isArray(e.workHistory)?e.workHistory.map(a=>({...a})):[],languages:Array.isArray(e.languages)?[...e.languages]:[],skills:Array.isArray(e.skills)?[...e.skills]:[],certifications:Array.isArray(e.certifications)?e.certifications.map(a=>({...a})):[]},ie=null,ze=null,_=null}return'<div id="onboardingWizard" class="onb-shell"></div>'}function fn(){document.querySelector("#onboardingWizard")&&je(Ct)}function je(e){Ct=e;const t=document.querySelector("#onboardingWizard");t&&(t.innerHTML=hn(e),wn(e))}function ut(e){return`
    <div style="display:flex;align-items:center;gap:5px;margin-bottom:28px;">
      ${Array.from({length:3},(a,n)=>`
        <div style="height:5px;border-radius:3px;flex:${n<e?2:1};background:${n<e?"var(--green)":"var(--border)"};transition:all .3s;"></div>
      `).join("")}
      <span style="margin-left:6px;font-size:11px;font-weight:600;color:var(--light);white-space:nowrap;">${e<=3?`${e} / 3`:"Review"}</span>
    </div>`}function ee(e,t,a){return`<label style="display:flex;flex-direction:column;gap:5px;font-size:11px;font-weight:600;letter-spacing:.07em;text-transform:uppercase;color:var(--light);">${e}${t?'<span style="font-weight:400;font-size:10px;text-transform:none;letter-spacing:0;opacity:.7;">(optional)</span>':""} ${a}</label>`}function ve(e,t,a,n,s=""){return`<input id="${e}" type="${t}" value="${y(a||"")}" placeholder="${y(n)}" ${s} style="font-size:14px;padding:10px 12px;border:1.5px solid var(--border);border-radius:8px;background:#fff;outline:none;width:100%;box-sizing:border-box;" />`}function Ft(e,t){return`<div style="display:flex;justify-content:space-between;align-items:center;margin-top:28px;">
    ${e?'<button type="button" id="onbBack" class="secondary-action">← Back</button>':"<span></span>"}
    <button type="button" id="onbNext" class="primary-action fit">${t||"Continue →"}</button>
  </div>`}function hn(e){var a,n,s,i;const t=P;switch(e){case 1:{const o=!!ie;return`
        <div class="onb-step">
          ${ut(1)}
          <p class="eyebrow">Step 1 · Your CV</p>
          <h2 class="onb-heading">Upload your CV to get started</h2>
          <p class="onb-sub">We'll extract your experience, skills, and contact info automatically — so you don't have to type it all out.</p>
          <div class="upload-box" style="margin-bottom:4px;" id="onbCvBox">
            <input id="onbCvInput" type="file" accept=".pdf,.doc,.docx" style="display:none;" />
            <label for="onbCvInput" class="upload-trigger">${m("upload")} Choose file</label>
            <p id="onbCvStatus" style="font-size:12px;color:var(--green);min-height:18px;margin:0;">${o?`✓ ${E(ie.name)}`:""}</p>
            <p>PDF or Word · max 10 MB</p>
          </div>
          <div style="display:flex;justify-content:space-between;align-items:center;margin-top:24px;">
            <button type="button" id="onbSkipCv" style="background:none;border:none;font-size:13px;color:var(--light);cursor:pointer;text-decoration:underline;padding:0;">Skip — I'll fill in manually</button>
            <button type="button" id="onbNext" class="primary-action fit" ${o?"":"disabled"}>Continue →</button>
          </div>
        </div>`}case 2:{const o=((a=r.candidate)==null?void 0:a.email)||((n=r.user)==null?void 0:n.email)||"",d=t.phone||((_==null?void 0:_.phone)??""),c=t.currentRole||(((i=(s=_==null?void 0:_.workHistory)==null?void 0:s[0])==null?void 0:i.title)??"");return`
        <div class="onb-step">
          ${ut(2)}
          <p class="eyebrow">Step 2 · Your profile</p>
          <h2 class="onb-heading">Tell us about yourself</h2>
          <p class="onb-sub">This is the basic information we'll use across every role you apply for.</p>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:4px;">
            ${ee("First name",!1,ve("onbFirstName","text",t.firstName||"","María",'autocomplete="given-name"'))}
            ${ee("Last name",!1,ve("onbLastName","text",t.lastName||"","García",'autocomplete="family-name"'))}
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:4px;">
            ${ee("Email",!1,ve("onbEmail","email",o,"","disabled"))}
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
        </div>`}case 3:{const o=t.roleGroup||Object.keys(Me)[0]||"",d=t.department||Object.keys(pe)[0]||"",c=pe[d]||[];return`
        <div class="onb-step">
          ${ut(3)}
          <p class="eyebrow">Step 3 · Role & location</p>
          <h2 class="onb-heading">What role are you looking for, and where are you based?</h2>
          <p class="onb-sub">We use this to match you with the right openings from our clients.</p>
          <div style="display:grid;gap:12px;margin-bottom:4px;">
            ${ee("Area",!1,`<select id="onbRoleGroup" style="font-size:14px;padding:10px 12px;border:1.5px solid var(--border);border-radius:8px;background:#fff;outline:none;">${sa(o)}</select>`)}
            ${ee("Role",!1,`<select id="onbTargetRole" style="font-size:14px;padding:10px 12px;border:1.5px solid var(--border);border-radius:8px;background:#fff;outline:none;">${it(o,t.targetRole||"")}</select>`)}
            ${ee("Department",!1,`<select id="onbDept" style="font-size:14px;padding:10px 12px;border:1.5px solid var(--border);border-radius:8px;background:#fff;outline:none;">${Object.keys(pe).map(l=>`<option value="${y(l)}" ${l===d?"selected":""}>${E(l)}</option>`).join("")}</select>`)}
            ${ee("City",!1,`<select id="onbCity" style="font-size:14px;padding:10px 12px;border:1.5px solid var(--border);border-radius:8px;background:#fff;outline:none;">${c.map(l=>`<option value="${y(l)}" ${l===t.city?"selected":""}>${E(l)}</option>`).join("")}</select>`)}
            ${ee("English level",!1,`<select id="onbEnglish" style="font-size:14px;padding:10px 12px;border:1.5px solid var(--border);border-radius:8px;background:#fff;outline:none;">${["","B1","B2","C1","C2","Native"].map(l=>`<option value="${l}" ${l===t.english?"selected":""}>${l||"Select level"}</option>`).join("")}</select>`)}
          </div>
          ${Ft(2,"Review →")}
        </div>`}case 4:return yn();default:return""}}const we="font-size:14px;padding:10px 12px;border:1.5px solid var(--border);border-radius:8px;background:#fff;outline:none;width:100%;box-sizing:border-box;",xt="flex-shrink:0;width:38px;height:38px;border:1.5px solid var(--border);border-radius:8px;background:#fff;color:var(--light);font-size:14px;cursor:pointer;";function We(e){return`<label style="display:block;margin-bottom:8px;font-size:11px;font-weight:600;letter-spacing:.07em;text-transform:uppercase;color:var(--light);">${e}</label>`}function yn(){var u;const e=P,t=_||{};!e.experience.length&&Array.isArray(t.workHistory)&&t.workHistory.length&&(e.experience=t.workHistory.map(v=>({company:v.company||"",title:v.title||"",from:v.from||"",to:v.to||""}))),!e.languages.length&&Array.isArray(t.languages)&&t.languages.length&&(e.languages=t.languages.filter(Boolean).map(String)),!e.skills.length&&Array.isArray(t.skills)&&t.skills.length&&(e.skills=[...new Set(t.skills.map(xe).filter(Boolean))]),!e.certifications.length&&Array.isArray(t.certifications)&&t.certifications.length&&(e.certifications=t.certifications.map(v=>({name:v.name||"",issuer:v.issuer||"",date:v.date||""})));const a=[e.firstName,e.lastName].filter(Boolean).join(" ")||((u=r.candidate)==null?void 0:u.name)||"—",n=e.targetRole||"—",s=[e.city,e.department].filter(Boolean).join(", ")||"—",i=[];e.expectedSalaryUSD&&i.push(`$${Number(e.expectedSalaryUSD).toLocaleString("en-US")} USD/mo`),e.expectedSalaryCOP&&i.push(`$${Number(e.expectedSalaryCOP).toLocaleString("es-CO")} COP/mo`);const o=i.join(" · ")||"—",d=e.english||"—",c=e.phone||"—",l=(ie==null?void 0:ie.name)||"",p=(v,h)=>!h||h==="—"?"":`
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
        ${p("Salary",o)}
        ${p("English",d)}
        ${p("Phone",c)}
        ${p("Current role",e.currentRole||"—")}
        ${l?p("CV",l):""}
      </div>

      <div class="field" style="margin-bottom:20px;">
        ${We("Experience")}
        <div id="onbExperienceList"></div>
        <button type="button" class="secondary-action" id="onbAddExperience">+ Add position</button>
      </div>

      <div class="field" style="margin-bottom:20px;">
        ${We("Languages")}
        <div id="onbLanguagesList"></div>
        <button type="button" class="secondary-action" id="onbAddLanguage">+ Add language</button>
      </div>

      <div class="field" style="margin-bottom:20px;">
        ${We("Skills")}
        ${ia(e.skills)}
      </div>

      <div class="field" style="margin-bottom:20px;">
        ${We("Certifications")}
        <div id="onbCertificationsList"></div>
        <button type="button" class="secondary-action" id="onbAddCertification">+ Add certification</button>
      </div>

      <div style="display:flex;justify-content:space-between;align-items:center;">
        <button type="button" id="onbEdit" class="secondary-action">← Edit</button>
        <button type="button" id="onbFinish" class="primary-action fit">${m("check")} Finish setup</button>
      </div>
      <p id="onbFinishErr" style="font-size:12px;color:#e74c3c;text-align:right;min-height:18px;margin-top:6px;"></p>
    </div>`}function tt(){const e=document.querySelector("#onbExperienceList");e&&(e.innerHTML="",P.experience.length||(e.innerHTML='<p style="font-size:12px;color:var(--light);margin:0 0 10px;">No experience added yet.</p>'),P.experience.forEach((t,a)=>{var s,i;const n=document.createElement("div");n.style.cssText="border:1.5px solid var(--border);border-radius:10px;padding:12px;margin-bottom:10px;",n.innerHTML=`
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px;">
        <input type="text" data-k="title" placeholder="Title" value="${y(t.title||"")}" style="${we}">
        <input type="text" data-k="company" placeholder="Company" value="${y(t.company||"")}" style="${we}">
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr auto;gap:8px;align-items:center;">
        <input type="month" data-k="from" value="${y(t.from||"")}" style="${we}">
        <input type="month" data-k="to" value="${t.to==="present"?"":y(t.to||"")}" ${t.to==="present"?"disabled":""} style="${we}">
        <button type="button" class="onb-list-remove" aria-label="Remove" style="${xt}">×</button>
      </div>
      <label style="display:flex;align-items:center;gap:6px;font-size:12px;color:var(--mid);margin-top:8px;">
        <input type="checkbox" data-k="current" ${t.to==="present"?"checked":""}> I currently work here
      </label>`,n.querySelectorAll('input[type="text"][data-k], input[type="month"][data-k]').forEach(o=>{o.addEventListener("input",d=>{t[d.target.dataset.k]=d.target.value})}),(s=n.querySelector('input[type="checkbox"][data-k="current"]'))==null||s.addEventListener("change",o=>{t.to=o.target.checked?"present":"",tt()}),(i=n.querySelector(".onb-list-remove"))==null||i.addEventListener("click",()=>{P.experience.splice(a,1),tt()}),e.appendChild(n)}))}function yt(){const e=document.querySelector("#onbLanguagesList");if(e){if(e.innerHTML="",P.english){const t=document.createElement("div");t.style.cssText="display:flex;align-items:center;gap:8px;margin-bottom:8px;padding:10px 12px;border:1.5px solid var(--border);border-radius:8px;background:var(--gray-1);font-size:14px;color:var(--black);",t.innerHTML=`<span style="font-weight:600;">English</span><span style="color:var(--light);">${E(P.english)}</span>`,e.appendChild(t)}if(!P.languages.length){const t=document.createElement("p");t.style.cssText="font-size:12px;color:var(--light);margin:0 0 10px;",t.textContent="No other languages added yet.",e.appendChild(t)}P.languages.forEach((t,a)=>{const n=document.createElement("div");n.style.cssText="display:flex;gap:10px;align-items:center;margin-bottom:8px;",n.innerHTML=`
      <input type="text" value="${y(t)}" placeholder="e.g. English (B2)" style="${we}flex:1;">
      <button type="button" class="onb-list-remove" aria-label="Remove" style="${xt}">×</button>`,n.querySelector("input").addEventListener("input",s=>{P.languages[a]=s.target.value}),n.querySelector(".onb-list-remove").addEventListener("click",()=>{P.languages.splice(a,1),yt()}),e.appendChild(n)})}}function wt(){const e=document.querySelector("#onbCertificationsList");e&&(e.innerHTML="",P.certifications.length||(e.innerHTML='<p style="font-size:12px;color:var(--light);margin:0 0 10px;">No certifications added yet.</p>'),P.certifications.forEach((t,a)=>{const n=document.createElement("div");n.style.cssText="display:flex;gap:10px;align-items:flex-start;margin-bottom:8px;",n.innerHTML=`
      <div class="onb-cert-grid" style="flex:1;">
        <input type="text" data-k="name" value="${y(t.name||"")}" placeholder="Certification name" style="${we}">
        <input type="text" data-k="issuer" value="${y(t.issuer||"")}" placeholder="Issuer" style="${we}">
        <input type="text" data-k="date" value="${y(t.date||"")}" placeholder="Date" style="${we}">
      </div>
      <button type="button" class="onb-list-remove" aria-label="Remove" style="${xt}">×</button>`,n.querySelectorAll("input[data-k]").forEach(s=>{s.addEventListener("input",i=>{t[i.target.dataset.k]=i.target.value})}),n.querySelector(".onb-list-remove").addEventListener("click",()=>{P.certifications.splice(a,1),wt()}),e.appendChild(n)}))}function wn(e){var n,s,i,o,d;const t=document.querySelector("#onbBack"),a=document.querySelector("#onbNext");switch(t==null||t.addEventListener("click",()=>je(e-1)),e){case 1:{const c=document.querySelector("#onbCvInput"),l=document.querySelector("#onbCvStatus"),p=document.querySelector("#onbSkipCv");ie&&c&&(a.disabled=!1),c==null||c.addEventListener("change",()=>{var v;const u=(v=c.files)==null?void 0:v[0];u&&(ie=u,l&&(l.textContent=`✓ ${u.name}`),a.disabled=!1,_=null,ze=St(u).catch(()=>null))}),a==null||a.addEventListener("click",()=>pt(2)),p==null||p.addEventListener("click",()=>{ie=null,ze=null,pt(2)});break}case 2:{a==null||a.addEventListener("click",()=>{var x,C,M,R,H,B,q;const c=((x=document.querySelector("#onbFirstName"))==null?void 0:x.value.trim())||"",l=((C=document.querySelector("#onbLastName"))==null?void 0:C.value.trim())||"",p=((M=document.querySelector("#onbPhone"))==null?void 0:M.value.trim())||"",u=((R=document.querySelector("#onbCurrentRole"))==null?void 0:R.value.trim())||"",v=((H=document.querySelector("#onbSalaryUSD"))==null?void 0:H.value)||"",h=((B=document.querySelector("#onbSalaryCOP"))==null?void 0:B.value)||"",N=((q=document.querySelector("#onbLinkedin"))==null?void 0:q.value.trim())||"",A=document.querySelector("#onbBasicError");if(!c||!l||!p||!u){A&&(A.textContent="Please fill in your name, phone, and current role.");return}if(!v&&!h){A&&(A.textContent="Please enter an expected salary in USD, COP, or both.");return}P.firstName=c,P.lastName=l,P.phone=p,P.currentRole=u,P.expectedSalaryUSD=v?Number(v):"",P.expectedSalaryCOP=h?Number(h):"",P.linkedin=N,je(3)});break}case 3:{const c=document.querySelector("#onbRoleGroup"),l=document.querySelector("#onbTargetRole"),p=document.querySelector("#onbDept"),u=document.querySelector("#onbCity");c==null||c.addEventListener("change",()=>{l.innerHTML=it(c.value,"")}),p==null||p.addEventListener("change",()=>{const v=pe[p.value]||[];u.innerHTML=v.map(h=>`<option value="${y(h)}">${E(h)}</option>`).join("")}),a==null||a.addEventListener("click",()=>{var v;P.roleGroup=(c==null?void 0:c.value)||"",P.targetRole=(l==null?void 0:l.value)||"",P.department=(p==null?void 0:p.value)||"",P.city=(u==null?void 0:u.value)||"",P.english=((v=document.querySelector("#onbEnglish"))==null?void 0:v.value)||"",pt(4)});break}case 4:{(n=document.querySelector("#onbEdit"))==null||n.addEventListener("click",()=>je(1)),(s=document.querySelector("#onbFinish"))==null||s.addEventListener("click",bn),tt(),yt(),wt(),(i=document.querySelector("#onbAddExperience"))==null||i.addEventListener("click",()=>{P.experience.push({company:"",title:"",from:"",to:""}),tt()}),(o=document.querySelector("#onbAddLanguage"))==null||o.addEventListener("click",()=>{P.languages.push(""),yt()}),(d=document.querySelector("#onbAddCertification"))==null||d.addEventListener("click",()=>{P.certifications.push({name:"",issuer:"",date:""}),wt()}),ga();break}}}async function pt(e){var a,n;const t=document.querySelector("#onboardingWizard");if(ze&&!_&&(t&&(t.innerHTML='<div class="onb-step"><p style="text-align:center;font-size:14px;font-weight:600;color:var(--green);padding:56px 0;">Analysing your CV…</p></div>'),_=await ze),_!=null&&_.phone&&!P.phone&&(P.phone=_.phone),_!=null&&_.name&&!P.firstName&&!P.lastName){const s=String(_.name).trim().split(/\s+/).filter(Boolean);P.firstName=s[0]||"",P.lastName=s.slice(1).join(" ")}(n=(a=_==null?void 0:_.workHistory)==null?void 0:a[0])!=null&&n.title&&!P.currentRole&&(P.currentRole=_.workHistory[0].title),je(e)}async function bn(){var a,n,s,i,o,d,c;const e=document.querySelector("#onbFinish"),t=document.querySelector("#onbFinishErr");e&&(e.disabled=!0,e.innerHTML="Saving…");try{const l=P,p=(a=r.user)==null?void 0:a.uid;if(!p)throw new Error("Not signed in");const u=l.department||"",v=l.city||"",h=Number(l.expectedSalaryUSD||0)||null,N=Number(l.expectedSalaryCOP||0)||null,A=h||N||null,x=h?"USD":N?"COP":"USD",C=A?`${x} ${A.toLocaleString()}/mo`:"",M=[...document.querySelectorAll('[data-skill-search] input[name="skills"]')].map(q=>q.value),R=[l.firstName,l.lastName].filter(Boolean).join(" ")||((n=r.candidate)==null?void 0:n.name)||((s=r.user)==null?void 0:s.displayName)||"";let H={};if(ie)try{const q=await vt(p,ie,"");H={activeCvId:q.id,activeCvName:q.name||q.fileName,cvUrl:q.url,cvLibrary:[q]}}catch{}const B={name:R,firstName:l.firstName||"",lastName:l.lastName||"",targetRole:l.targetRole||"",headline:l.targetRole||"",currentRole:l.currentRole||"",department:u,city:v,location:[v,u].filter(Boolean).join(", "),locationCity:v,locationDepartment:u,locationCountry:"Colombia",locationId:`${String(v).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,"").replace(/[^a-z0-9]+/g,"-")}-co`,english:l.english||"",salary:C,salaryUSD:h,salaryAmount:A,salaryCurrency:x,expectedSalaryUSD:h,expectedSalaryCOP:N,expectedSalaryAmount:A,expectedSalaryCurrency:x,whatsapp:l.phone||"",phone:l.phone||"",linkedin:l.linkedin||"",skills:[...new Set(M.map(xe).filter(Boolean))],workHistory:l.experience||[],certifications:(l.certifications||[]).filter(q=>q.name&&q.name.trim()),languages:(l.languages||[]).map(q=>q.trim()).filter(Boolean),summary:(_==null?void 0:_.summary)||"",email:((i=r.candidate)==null?void 0:i.email)||((o=r.user)==null?void 0:o.email)||"",candidateCode:(d=r.candidate)==null?void 0:d.candidateCode,marketingConsent:((c=r.candidate)==null?void 0:c.marketingConsent)===!0,availability:"open",onboarded:!0,...H};await bt(p,B),window.history.pushState({page:"overview"},"","/"),b({candidate:{...r.candidate,...B},activePage:"overview",message:"Welcome to Nearwork! Your profile is ready."})}catch{t&&(t.textContent="Something went wrong. Please try again."),e&&(e.disabled=!1,e.innerHTML=`${m("check")} Finish setup`)}}function Sn(){const e=Ve(),t=r.jobs.map(be).filter(i=>kt(i,e).length>=3),a=e.length>=5,n=r.matchesFiltered&&a?t:r.jobs.map(be),s=r.matchesFiltered&&!t.length;return`
    <div class="nw-page-head">
      <div class="nw-page-overline">My search</div>
      <h1 class="nw-page-title">Matches</h1>
      <p class="nw-page-lede">Roles picked for you from your skills, target role, and salary.</p>
    </div>
    <div class="nw-filterbar">
      <button id="filterMatches" class="nw-chip${r.matchesFiltered?" active":""}" type="button">${m(r.matchesFiltered?"list":"filter")} ${r.matchesFiltered?"Show all openings":"Filter by my role & skills"}</button>
      <div class="nw-filter-count">${n.length} of ${r.jobs.length} open roles</div>
    </div>
    <div class="nw-match-grid nw-match-grid--wide">${s?ma("No filtered matches yet","Add a target role and skills in Profile to improve matching."):n.map(i=>Vn(i)).join("")}</div>
  `}function Cn(){const e=r.applications||[];return`
    <div class="nw-page-head">
      <div class="nw-page-overline">My journey</div>
      <h1 class="nw-page-title">Applications</h1>
      <p class="nw-page-lede">Every role you've applied to, and exactly where it stands.</p>
    </div>
    ${tn()?`
      <section class="nw-panel nw-pipeline-panel">
        <div class="nw-panel-head"><div><div class="nw-panel-overline">Status</div><div class="nw-panel-title">Where you are in the process</div></div></div>
        ${zn(jn())}
      </section>`:""}
    <section class="nw-panel nw-applist">
      ${e.length?e.map((a,n)=>Gn(a,n===e.length-1)).join(""):Hn()}
    </section>
  `}function kn(){const e=fe(),t=r.assessments||[],a=t.filter(x=>["sent","started"].includes(String(x.status||"").toLowerCase())),n=t.filter(x=>String(x.status||"").toLowerCase()==="completed"),s=e?t.find(x=>x.id===e):a[0]||n[0]||null;if(r.assessmentUiStep==="techIntro"&&s)return Ln(s);if(r.assessmentUiStep==="discIntro"&&s)return Tn(s);if(e&&!s)return`
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
    `;const i=Array.isArray(s.questions)?s.questions:[],o=String(s.status||"").toLowerCase()==="started",d=String(s.status||"").toLowerCase()==="completed",c=String(s.status||"").toLowerCase()==="cancelled",l=En(s),p=ea(),u=Number(s.currentQuestionIndex||0),v=Math.min(p??u,Math.max(i.length-1,0)),h=i[v],N=(h==null?void 0:h.stage)||s.currentStage||1,A=o&&!d&&!c&&!l;return`
    <div class="nw-assess-wrap">
      ${A?An(s,N,v,i):Pt(s)}
      ${A?$n(s,v):""}
      <div class="nw-assess-body" id="assessmentWorkspace">
        ${d?Nn(s):c?`<div class="nw-assess-state-card nw-assess-state-card--inline"><div class="nw-assess-state-icon" style="background:#F5F4F0;color:#555">${m("ban")}</div><strong>Assessment cancelled</strong><p>This assessment is no longer available. A new assigned assessment will appear here when your recruiter sends one.</p></div>`:l?`<div class="nw-assess-state-card nw-assess-state-card--inline"><div class="nw-assess-state-icon" style="background:#FEF0F5;color:#CC3666">${m("clock-x")}</div><strong>Assessment link expired</strong><p>This unique assessment link is no longer valid. Contact your Nearwork recruiter if you need a new one.</p><button class="ghost-action" data-page="recruiter" type="button">${m("message-circle")} Contact recruiter</button></div>`:xn(s,o,v)}
      </div>
      ${Mn(t,s.id)}
    </div>
  `}function Pt(e){const t=String(e.status||"").toLowerCase();return`
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
  `}function $n(e,t){const a=(e.questions||[]).slice(0,70),n=se(e,1).filter(d=>Ne(dt(e,d))).length,s=se(e,2).filter(d=>Ne(dt(e,d))).length,i=se(e,1).length||50,o=se(e,2).length||20;return`
    <section class="assessment-progress-panel">
      <div><strong>Technical</strong><span>${n}/${i} answered</span></div>
      <div><strong>DISC</strong><span>${s}/${o} answered</span></div>
      <div class="assessment-progress-strip">
        ${a.map((d,c)=>{const l=Ne(dt(e,d));return`<button type="button" class="${c===t?"active":""} ${l?"answered":""}" data-assessment-jump="${c}" title="${$t(d.stage)} · Q${c+1}">${c+1}</button>`}).join("")}
      </div>
    </section>
  `}function An(e,t,a,n){const s=Number(t),i=_t(e.technicalStartedAt||e.startedAt)||new Date,o=_t(e.discStartedAt)||new Date,d=s===1?i:o,c=Number(s===1?e.technicalMinutes||60:e.discMinutes||30),l=new Date(d.getTime()+c*60*1e3),p=s===1?"Technical":"DISC profile",u=(n||[]).filter(A=>Number(A.stage||1)===s),v=(n||[]).findIndex(A=>Number(A.stage||1)===s),h=Math.max(0,a-v),N=u.length?Math.round((h+1)/u.length*100):2;return`
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
          <div class="nw-assess-chrome__progressfill" style="width:${Math.max(2,N)}%"></div>
        </div>
      </div>
      <div class="nw-timer-pill">
        ${m("timer")}
        <span id="assessmentTimer" data-end="${l.toISOString()}">${c}:00</span>
      </div>
      <button class="nw-assess-chrome__exit" type="button">${m("x")} Save &amp; exit</button>
    </div>
  `}function xn(e,t,a=null){var H,B,q;if(!t){const Z=y(e.role||"Role assessment"),f=y(e.recruiterName||e.recruiter||"Nearwork"),g=st(e.expiresAt||e.deadline),w=se(e,1).length||50,S=se(e,2).length||20,k=Number(e.technicalMinutes||60),$=Number(e.discMinutes||30);return`
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
            <span class="nw-assess-part__sub">${w} questions &middot; ~${k} min</span>
            <p class="nw-assess-part__desc">Single-choice role scenarios. We're looking at how you think, not whether you remember definitions.</p>
          </div>
          <div class="nw-assess-part">
            <div class="nw-assess-part__blob" style="background:#F7F2FC"></div>
            <div class="nw-assess-part__icon" style="background:#F7F2FC;color:#AF7AC5">${m("compass")}</div>
            <span class="nw-assess-part__tag" style="color:#AF7AC5">Part 2</span>
            <strong class="nw-assess-part__title">DISC Profile</strong>
            <span class="nw-assess-part__sub">${S} statements &middot; ~${$} min</span>
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
    `}const n=(e.questions||[]).slice(0,70),s=Math.min(a??Number(e.currentQuestionIndex||0),Math.max(n.length-1,0)),i=n[s],o=((B=(H=e.answers)==null?void 0:H[i.id])==null?void 0:B.value)??((q=e.answers)==null?void 0:q[i.id])??"",d=Array.isArray(i.options)&&i.options.length?i.options:["Strongly agree","Agree","Neutral","Disagree"],c=n[s+1],l=c==null?void 0:c.stage,p=l&&l!==i.stage,u=ft(e,i.stage),v=p&&u.length,h=s+1>=n.length,N=h?ft(e,i.stage):[],A=!!i.multiple,x=Number(i.stage||1)===2?"nw-assess-chip--violet":"nw-assess-chip--teal",C=A?"Multi-select":"Single choice",M=y(i.part||i.type||(Number(i.stage||1)===2?"DISC":"Scenario")),R=y(i.bank||"");return`
    <form id="assessmentQuestionForm" class="nw-assess-qcard" data-current-index="${s}">
      <div class="nw-assess-qmeta">
        <span class="nw-assess-chip ${x}">${M}</span>
        ${R?`<span class="nw-assess-chip nw-assess-chip--gray">${R}</span>`:""}
        <span class="nw-assess-qtype">&middot; ${C}</span>
      </div>
      ${i.context?`<div class="nw-assess-context"><strong>Context: </strong>${y(i.context)}</div>`:""}
      <p class="nw-assess-qprompt">${y(i.q||"")}</p>
      <fieldset class="nw-assess-options${A?" nw-assess-options--multi":""}">
        <legend>${C}</legend>
        ${d.map((Z,f)=>`
          <label class="nw-assess-option${A?" nw-assess-option--multi":""}">
            <input type="radio" name="answer" value="${f}" ${String(o)===String(f)?"checked":""} />
            <span class="nw-assess-option__key">${String.fromCharCode(65+f)}</span>
            <span class="nw-assess-option__text">${y(Z)}</span>
            ${A?"":`<span class="nw-assess-option__check">${m("check-circle-2")}</span>`}
          </label>
        `).join("")}
      </fieldset>
      ${v||N.length?Pn(e,v?u:N,i.stage):""}
      <div class="nw-assess-qfooter">
        <button class="ghost-action" id="prevAssessmentQuestion" type="button" ${s===0?"disabled":""}>${m("arrow-left")} Back</button>
        <span class="nw-assess-autosave">${m("check")} Auto-saved</span>
        <div style="flex:1"></div>
        <button class="primary-action fit" type="submit">${h?m("send")+" Submit assessment":"Next "+m("arrow-right")}</button>
      </div>
    </form>
  `}function Pn(e,t,a){if(!t.length)return"";const n=(e.questions||[]).slice(0,70);return`
    <div class="nw-assess-missed">
      <strong>${m("alert-triangle")} Unanswered questions in ${$t(a)}</strong>
      <p>You skipped ${t.map(s=>`Question ${n.findIndex(i=>i.id===s.id)+1}`).join(", ")}. You can go back now or continue if you meant to leave them blank.</p>
      <div class="nw-assess-missed__links">${t.map(s=>{const i=n.findIndex(o=>o.id===s.id);return`<button class="ghost-action" type="button" data-assessment-jump="${i}">${m("arrow-left")} Go to ${i+1}</button>`}).join("")}</div>
    </div>
  `}function En(e){return!(e!=null&&e.expiresAt)||String(e.status||"").toLowerCase()==="completed"?!1:Date.now()>new Date(e.expiresAt).getTime()}function Ln(e){const t=y(e.role||"Role assessment"),a=se(e,1).length||50,n=Number(e.technicalMinutes||60);return`
    <div class="nw-assess-wrap">
      ${Pt(e)}
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
  `}function Tn(e){const t=se(e,1).length||50,a=se(e,2).length||20,n=Number(e.discMinutes||30),s=y(e.recruiterName||e.recruiter||"your recruiter"),i=(e.questions||[]).findIndex(o=>Number(o.stage||1)===2);return`
    <div class="nw-assess-wrap">
      ${Pt(e)}
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
  `}function Nn(e){var o,d;const a=(((o=r.candidate)==null?void 0:o.name)||((d=r.user)==null?void 0:d.displayName)||"").split(" ")[0]||"You",n=y(e.recruiterName||e.recruiter||"your recruiter"),s=se(e,1).length||50,i=se(e,2).length||20;return`
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
        ${[{icon:"inbox",title:"Your recruiter reviews your results",desc:`${n} will read your scenarios and DISC profile, usually within one business day.`,when:"Within 24h"},{icon:"message-square",title:`A personal note from ${n}`,desc:"Not an automated email. They'll share what stood out and what comes next.",when:"Tomorrow"},{icon:"calendar-check",title:"Interview with the hiring team",desc:"If there's a match, you'll get a calendar link to book a slot that works for you.",when:"This week"}].map(({icon:c,title:l,desc:p,when:u},v)=>`
          <div class="nw-assess-next__item">
            <div class="nw-assess-next__icon-wrap">
              <div class="nw-assess-next__iconbox">${m(c)}</div>
              <div class="nw-assess-next__num">${v+1}</div>
            </div>
            <div class="nw-assess-next__body">
              <div class="nw-assess-next__title">${l}</div>
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
          <div class="nw-assess-recruiter__name">${n}</div>
          <div class="nw-assess-recruiter__role">Talent partner &middot; Nearwork</div>
        </div>
        <button class="ghost-action" data-page="recruiter" type="button">${m("message-circle")} Message recruiter</button>
      </div>
    </div>
  `}function Mn(e,t){return e.length?`
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
  `:""}function qn(e,t){const a=e.questions||[],n=a.filter(d=>d.stage===1),s=a.filter(d=>d.stage===2),i=n.filter(d=>{var c;return typeof d.correctIndex=="number"&&Number((c=t[d.id])==null?void 0:c.value)===d.correctIndex}).length,o=s.filter(d=>{var c;return Ne(((c=t[d.id])==null?void 0:c.value)??t[d.id])}).length;return{technicalScore:n.length?Math.round(i/n.length*100):0,discScore:s.length?Math.round(o/s.length*100):0}}function In(e,t){var d,c;const a={Dominance:0,Influence:0,Steadiness:0,Conscientiousness:0};(e.questions||[]).filter(l=>Number(l.stage)===2).forEach(l=>{var h;const p=(h=t[l.id])==null?void 0:h.value;if(!Ne(p))return;const u=a[l.skill]!==void 0?l.skill:"Steadiness",v=Math.max(1,4-Number(p||0));a[u]+=v});const n=Object.entries(a).sort((l,p)=>p[1]-l[1]),s=((d=n[0])==null?void 0:d[0])||"Steadiness",i=((c=n[n.length-1])==null?void 0:c[0])||"Dominance";return{label:{Dominance:"D",Influence:"I",Steadiness:"S",Conscientiousness:"C"}[s]||"S",high:s,low:i,scores:a,summary:`${s} is the strongest observed DISC tendency; ${i} appears lowest based on this assessment.`}}async function Dn(e,t){var c,l,p,u,v;const a="https://admin.nearwork.co/api/send-email",n=e.candidateEmail||((c=r.user)==null?void 0:c.email)||((l=r.candidate)==null?void 0:l.email),s=e.candidateName||((p=r.candidate)==null?void 0:p.name)||((u=r.user)==null?void 0:u.displayName)||"there",i=la([e.recruiterEmail,e.stakeholderEmail,e.hiringManagerEmail].filter(Boolean).join(",")),o=[];n&&o.push(fetch(a,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({to:n,templateId:"assessment_completed_candidate",data:{name:s,role:e.role,actionUrl:"https://talent.nearwork.co/assessment",actionText:"Open assessment center"}})}));const d=i.length?i:["support@nearwork.co"];o.push(fetch(a,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({to:d,templateId:"assessment_completed_recruiter",data:{name:"Nearwork team",role:e.role,actionUrl:`https://admin.nearwork.co/assessments/${e.id}/questions`,actionText:"Review assessment",message:`${s} completed the assessment. Overall: ${t.score}%. Technical: ${t.technicalScore}%. DISC: ${((v=t.discProfile)==null?void 0:v.label)||"Submitted"}.`}})})),await Promise.allSettled(o)}function _n(){var t;const e=((t=r.candidate)==null?void 0:t.cvLibrary)||[];return`
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
        ${e.length?e.map(a=>`<article class="cv-item">${m("file-text")}<div><strong>${a.name||a.fileName}</strong><span>${st(a.uploadedAt)}</span></div>${a.url?`<a href="${a.url}" target="_blank" rel="noreferrer">Open</a>`:""}</article>`).join(""):ma("No CVs saved yet","Upload role-specific resumes here.")}
      </div>
    </section>
  `}function Rn(){return`
    <div class="nw-page-head">
      <div class="nw-page-overline">Support</div>
      <h1 class="nw-page-title">Tips</h1>
      <p class="nw-page-lede">Practical prep for US SaaS interviews — short, useful guidance before recruiter screens, assessments, and client interviews.</p>
    </div>
    <section class="tips-grid rich" style="margin-top:18px;">
      ${Ka.map((e,t)=>`
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
  `}function Un(){var a,n;const t=(((a=r.candidate)==null?void 0:a.recruiter)||{}).bookingUrl||((n=r.candidate)==null?void 0:n.recruiterBookingUrl)||"mailto:support@nearwork.co?subject=Nearwork%20candidate%20question";return`
    <div class="nw-page-head">
      <div class="nw-page-overline">Support</div>
      <h1 class="nw-page-title">Recruiter</h1>
      <p class="nw-page-lede">Your Nearwork talent partner — reach out anytime about assessments, interviews, feedback, or CV selection.</p>
    </div>
    <div class="nw-split" style="margin-top:18px;">
      <section class="nw-panel" style="padding-bottom:18px;">
        <div class="nw-panel-head"><div><div class="nw-panel-overline">Recruiter</div><div class="nw-panel-title">Your Nearwork contact</div></div></div>
        ${Qn(!0)}
      </section>
      <section class="nw-panel" style="padding-bottom:18px;">
        <div class="nw-panel-head"><div><div class="nw-panel-overline">Booking</div><div class="nw-panel-title">Schedule soon</div></div></div>
        <p class="muted">Ask the Nearwork recruiting team for the earliest available slot. Candidate booking links can be attached to this profile later.</p>
        <a class="primary-action fit" href="${t}" target="_blank" rel="noreferrer">${m("calendar-plus")} Book recruiter call</a>
      </section>
    </div>
  `}function Bn(){return On("profile")}function V(e,t=!1){return`<span class="pf-label">${e}${t?'<span class="pf-optional">optional</span>':""}</span>`}function te(e,t,a=""){return`
    <div class="pf-card-head">
      <div class="pf-card-icon">${m(e)}</div>
      <div class="pf-card-title">${t}</div>
      ${a?`<span class="pf-card-badge">${a}</span>`:""}
    </div>`}function Et(e,t={}){const a=e,n=(t.company||"?")[0].toUpperCase();return`
    <div class="pf-sub-card work-entry" data-work-index="${a}">
      <div class="pf-sub-card-left">
        <div class="pf-work-avatar">${n}</div>
      </div>
      <div class="pf-sub-card-body">
        <div class="pf-field-row">
          <label class="pf-field">
            ${V("Job title")}
            <input type="text" class="pf-input work-field" data-field="title" value="${y(t.title||"")}" placeholder="e.g. Customer Success Manager" />
          </label>
          <label class="pf-field">
            ${V("Company")}
            <input type="text" class="pf-input work-field" data-field="company" value="${y(t.company||"")}" placeholder="e.g. Acme Corp" />
          </label>
        </div>
        <div class="pf-field-row pf-field-row--3">
          <label class="pf-field">
            ${V("From")}
            <input type="text" class="pf-input work-field" data-field="from" value="${y(t.from||"")}" placeholder="2021-03" />
          </label>
          <label class="pf-field">
            ${V("To")}
            <input type="text" class="pf-input work-field" data-field="to" value="${y(t.to||"")}" placeholder="present" />
          </label>
          <div></div>
        </div>
      </div>
      <button type="button" class="pf-remove-btn remove-work-entry" data-remove="${a}" aria-label="Remove">
        ${m("x")}
      </button>
    </div>`}const Fn=["","A1","A2","B1","B2","C1","C2","Native"];function Lt(e,t={}){const a=e,n=typeof t=="string"?{name:t,level:""}:t;return`
    <div class="pf-sub-card lang-entry" data-lang-index="${a}">
      <div class="pf-sub-card-body">
        <div class="pf-field-row">
          <label class="pf-field">
            ${V("Language")}
            <input type="text" class="pf-input lang-field" data-field="name" value="${y(n.name||"")}" placeholder="e.g. Spanish, French…" />
          </label>
          <label class="pf-field">
            ${V("Level")}
            <select class="pf-input lang-field" data-field="level">
              ${Fn.map(s=>`<option value="${s}" ${(n.level||"")===s?"selected":""}>${s||"Select level"}</option>`).join("")}
            </select>
          </label>
        </div>
      </div>
      <button type="button" class="pf-remove-btn remove-lang-entry" data-remove="${a}" aria-label="Remove">
        ${m("x")}
      </button>
    </div>`}function Tt(e,t={}){const a=e;return`
    <div class="pf-sub-card cert-entry" data-cert-index="${a}">
      <div class="pf-sub-card-left">
        <div class="pf-cert-icon">✓</div>
      </div>
      <div class="pf-sub-card-body">
        <div class="pf-field-row">
          <label class="pf-field">
            ${V("Certificate / Course")}
            <input type="text" class="pf-input cert-field" data-field="name" value="${y(t.name||"")}" placeholder="e.g. Google Analytics" />
          </label>
          <label class="pf-field">
            ${V("Issuer",!0)}
            <input type="text" class="pf-input cert-field" data-field="issuer" value="${y(t.issuer||"")}" placeholder="e.g. Coursera, HubSpot" />
          </label>
        </div>
        <label class="pf-field" style="max-width:200px;">
          ${V("Date (YYYY-MM)",!0)}
          <input type="text" class="pf-input cert-field" data-field="date" value="${y(t.date||"")}" placeholder="2023-06" />
        </label>
      </div>
      <button type="button" class="pf-remove-btn remove-cert-entry" data-remove="${a}" aria-label="Remove">
        ${m("x")}
      </button>
    </div>`}function On(e="profile"){var u,v,h,N,A,x,C,M,R,H,B,q,Z,f,g,w,S,k;const t=Ve(),a=an(),n=pe[a.department]||[],s=((u=r.candidate)==null?void 0:u.salaryCurrency)||"USD",i=oa(((v=r.candidate)==null?void 0:v.salaryAmount)||((h=r.candidate)==null?void 0:h.salary)||((N=r.candidate)==null?void 0:N.salaryUSD),s),o=nn(),d=((A=r.candidate)==null?void 0:A.targetRole)||((x=r.candidate)==null?void 0:x.headline)||"",c=ua(),l=At(),p=l.filter($=>$.done).length;return`
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
      <div class="pf-progress-label">${p} of ${l.length} sections complete</div>

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
                ${aa("large")}
                <label class="pf-photo-btn">
                  ${m("camera")} Change photo
                  <input name="photo" type="file" accept="image/png,image/jpeg,image/webp" style="display:none;" />
                </label>
              </div>
              <div class="pf-field" style="flex:1;">
                ${V("Full name")}
                <input class="pf-input" name="name" value="${y(((C=r.candidate)==null?void 0:C.name)||((M=r.user)==null?void 0:M.displayName)||"")}" placeholder="Your full name" />
              </div>
            </div>
          </div>

          <!-- ── Role ── -->
          <div class="pf-card">
            ${te("briefcase-business","Role applying for")}
            <div class="pf-field-row">
              <label class="pf-field">
                ${V("Area")}
                <select class="pf-input" name="roleGroup" id="roleGroupSelect">
                  ${sa(o)}
                </select>
              </label>
              <label class="pf-field">
                ${V("Target role")}
                <select class="pf-input" name="targetRole" id="targetRoleSelect">
                  ${it(o,d)}
                </select>
              </label>
            </div>
          </div>

          <!-- ── Location ── -->
          <div class="pf-card">
            ${te("map-pin","Location")}
            <div class="pf-field-row">
              <label class="pf-field">
                ${V("Department")}
                <select class="pf-input" name="department" id="departmentSelect">
                  ${Object.keys(pe).map($=>`<option value="${y($)}" ${$===a.department?"selected":""}>${$}</option>`).join("")}
                </select>
              </label>
              <label class="pf-field">
                ${V("City")}
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
              ${V("Target monthly salary")}
              <div class="pf-salary-wrap">
                <select id="salaryCurrencyInput" name="salaryCurrency" class="pf-currency-select">
                  <option value="USD" ${i.salaryCurrency==="USD"?"selected":""}>USD</option>
                  <option value="COP" ${i.salaryCurrency==="COP"?"selected":""}>COP</option>
                </select>
                <input class="pf-input pf-salary-input" id="salaryInput" name="salary" value="${y(i.salaryAmount?ht(i.salaryAmount,i.salaryCurrency):"")}" inputmode="numeric" placeholder="2,500" />
              </div>
              <span class="pf-hint">How much you're looking for, per month.</span>
            </label>
          </div>

          <!-- ── English & languages ── -->
          <div class="pf-card" id="langCard">
            ${te("languages","English & languages")}
            <label class="pf-field" style="max-width:280px; margin-bottom:14px;">
              ${V("English level")}
              <select class="pf-input" name="english">
                ${["","B1","B2","C1","C2","Native"].map($=>{var F;return`<option value="${$}" ${((F=r.candidate)==null?void 0:F.english)===$?"selected":""}>${$||"Select level"}</option>`}).join("")}
              </select>
            </label>
            ${V("Other languages",!0)}
            <p class="pf-hint">Add any other languages you speak and your level in each.</p>
            <div id="langEntries" class="pf-entries">
              ${(((R=r.candidate)==null?void 0:R.languages)||[]).map(($,F)=>Lt(F,$)).join("")}
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
                ${V("WhatsApp number")}
                <input class="pf-input" name="whatsapp" value="${y(((H=r.candidate)==null?void 0:H.whatsapp)||((B=r.candidate)==null?void 0:B.phone)||"")}" inputmode="tel" autocomplete="tel" placeholder="+57 300 123 4567" required />
              </label>
              <label class="pf-field">
                ${V("LinkedIn",!0)}
                <input class="pf-input" name="linkedin" value="${y(((q=r.candidate)==null?void 0:q.linkedin)||"")}" placeholder="https://linkedin.com/in/…" />
              </label>
            </div>
          </div>

          <!-- ── Communications ── -->
          <div class="pf-card">
            ${te("mail","Communications")}
            <label class="pf-checkbox-row">
              <input type="checkbox" name="marketingConsent" ${((Z=r.candidate)==null?void 0:Z.marketingConsent)===!0?"checked":""} />
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
            ${ia(t)}
          </div>
        </div>

        <!-- ── CV ── -->
        <div class="pf-tab-panel" data-tab-panel="cv" hidden>
          <div class="pf-card" id="profileCvCard">
            ${te("file-text","CV")}
            <p class="pf-hint">Upload the CV you want Nearwork to use for your applications.</p>
            ${(f=r.candidate)!=null&&f.activeCvName||(g=r.candidate)!=null&&g.cvUrl?`
              <div class="pf-cv-current">
                <div class="pf-cv-icon">${m("file-text")}</div>
                <div class="pf-cv-info">
                  <strong>${E(r.candidate.activeCvName||"CV on file")}</strong>
                  <span>Currently active · upload below to replace</span>
                </div>
                ${r.candidate.cvUrl?`<a class="pf-cv-open" href="${y(r.candidate.cvUrl)}" target="_blank" rel="noreferrer">${m("external-link")} Open</a>`:""}
              </div>`:""}
            <label class="pf-file-label" for="profileCvFileInput">
              ${m("upload")} Choose file (.pdf, .doc, .docx)
            </label>
            <input id="profileCvFileInput" name="profileCv" type="file" accept=".pdf,.doc,.docx" style="display:none;" />
            <label class="pf-field" style="margin-top:10px;">
              ${V("CV label",!0)}
              <input class="pf-input" name="profileCvLabel" type="text" placeholder="e.g. Customer Success CV" />
            </label>
          </div>
        </div>

        <!-- ── Experience ── -->
        <div class="pf-tab-panel" data-tab-panel="experience" hidden>

          <!-- ── Summary ── -->
          <div class="pf-card">
            ${te("align-left","Summary","optional")}
            <textarea class="pf-input pf-textarea" name="summary" placeholder="Add a short note about what you do best — 2–3 sentences.">${E(((w=r.candidate)==null?void 0:w.summary)||"")}</textarea>
          </div>

          <!-- ── Work history ── -->
          <div class="pf-card" id="workHistoryCard">
            ${te("building-2","Work experience","optional")}
            <p class="pf-hint">Add your previous roles so recruiters can see your background.</p>
            <div id="workEntries" class="pf-entries">
              ${(((S=r.candidate)==null?void 0:S.workHistory)||[]).map(($,F)=>Et(F,$)).join("")}
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
              ${(((k=r.candidate)==null?void 0:k.certifications)||[]).map(($,F)=>Tt(F,$)).join("")}
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

      ${r.showDeleteAccountModal?`
      <div class="nw-modal-overlay" id="deleteAccountOverlay">
        <div class="nw-modal">
          <h3>Delete your account?</h3>
          <p>This will permanently delete your profile, resume, applications, and assessment history from Nearwork. This cannot be undone.</p>
          <label class="pf-field">
            <span class="pf-label" style="text-transform:none;">Type DELETE to confirm</span>
            <input class="pf-input" id="deleteConfirmInput" autocomplete="off" />
          </label>
          ${r.deleteAccountStatus==="error"?`<div class="nw-modal-error">${E(r.deleteAccountError||"Something went wrong.")}</div>`:""}
          <div class="nw-modal-actions">
            <button type="button" id="cancelDeleteAccount" class="nw-btn-secondary" ${r.deleteAccountStatus==="deleting"?"disabled":""}>Cancel</button>
            <button type="button" id="confirmDeleteAccount" class="pf-danger-btn" ${r.deleteAccountStatus==="deleting"?"disabled":""}>
              ${r.deleteAccountStatus==="deleting"?"Deleting…":"Delete permanently"}
            </button>
          </div>
        </div>
      </div>`:""}

      ${e==="profile"&&r.showUnsavedChangesModal?`
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
  `}function ua(){const e=At(),t=e.filter(a=>a.done).length;return Math.max(25,Math.round(t/e.length*100))}function jn(){const e=r.applications[0];return(e==null?void 0:e.stage)||(e==null?void 0:e.status)||"profile-review"}function zn(e){const t=String(e).toLowerCase().replace(/_/g,"-").replace(/\s+/g,"-"),a=Math.max(0,Dt.findIndex(n=>t.includes(n.key)||n.key.includes(t)));return`<div class="pipeline">${Dt.map((n,s)=>`<article class="${s<=a?"done":""} ${s===a?"current":""}"><span>${s+1}</span><strong>${n.label}</strong><p>${n.help}</p></article>`).join("")}</div>`}function Hn(){return`
    <div class="nw-empty">
      ${m("briefcase-business")}
      <strong>No active pipeline yet</strong>
      <p>Browse current openings and apply when you find a role that fits. Nearwork will show your applications here once you apply.</p>
      <div style="display:flex;gap:8px;margin-top:12px;">
        <button class="nw-btn-primary" type="button" data-page="matches">${m("sparkles")} View matches</button>
        <a class="nw-btn-secondary" href="https://jobs.nearwork.co" target="_blank" rel="noreferrer">${m("external-link")} Open jobs</a>
      </div>
    </div>
  `}function pa(){try{return new Set(JSON.parse(localStorage.getItem("nw_talent_applied")||"[]"))}catch{return new Set}}function Vn(e){const t=be(e),n=new Set(r.applications.map(u=>u.jobId||u.openingCode)).has(t.code)||pa().has(t.code),s=kt(t),i=t.match||(s.length>=3?Math.min(97,70+s.length*4):null),o=["#10A07C","#EC4E7E","#3B82F6","#F4A52E"],d=o[t.orgName.length%o.length],c=t.orgName.split(/\s+/).slice(0,2).map(u=>u[0]).join("").toUpperCase(),l=`https://jobs.nearwork.co/apply?code=${encodeURIComponent(t.code)}`,p=(s.length?s:t.skills).slice(0,3);return`
    <div class="nw-match-card">
      <div class="nw-match-card-top">
        <div class="nw-match-avatar" style="background:${d};">${c}</div>
        ${i?`<div class="nw-match-score">${i}% match</div>`:""}
      </div>
      <div class="nw-match-role">${E(t.title)}</div>
      <div class="nw-match-company">${E(t.orgName)} · ${E(t.location)}</div>
      <div class="nw-match-chips">${p.map(E).map(u=>`<span class="nw-match-chip">${u}</span>`).join("")}</div>
      <div class="nw-match-footer">
        <span class="nw-match-salary">${E(t.compensation)}</span>
        <button type="button" class="nw-match-view" data-open-url="${y(l)}">View opening ${m("arrow-up-right")}</button>
      </div>
      <button class="nw-match-applybtn${n?" applied":""}" type="button" data-apply="${t.code}" ${n?"disabled":""}>${n?`${m("check")} Applied`:`Apply now ${m("arrow-right")}`}</button>
    </div>
  `}function Gn(e,t){const a=String(e.stage||e.status||"applied").toLowerCase(),n=a.includes("offer")?4:a.includes("final")?3:a.includes("interview")?2:a.includes("assessment")?1:0,s=e.clientName||e.company||"Nearwork client",i=s.split(/\s+/).slice(0,2).map(l=>l[0]).join("").toUpperCase(),o=["#10A07C","#EC4E7E","#3B82F6","#F4A52E","#8B5CF6"],d=o[s.length%o.length],c=["action-needed","interview-scheduled","assessment-sent"].includes(String(e.status||"").toLowerCase());return`
    <div class="nw-app-row${t?" last":""}">
      <div class="nw-app-avatar" style="background:${d};">${i}</div>
      <div class="nw-app-info">
        <div class="nw-app-title">${E(e.jobTitle||e.title||"Application")} <span class="nw-app-company">· ${E(s)}</span></div>
        <div class="nw-app-stages">
          ${Kt.map((l,p)=>`<div class="nw-stage-pip${p<=n?" done":""}"></div>`).join("")}
          <span class="nw-app-stage-label">${e.stage||e.status||"Applied"}</span>
        </div>
      </div>
      <div class="nw-app-meta">
        <span class="nw-app-status${c?" action":""}">${e.status||"In review"}</span>
        <div class="nw-app-date">${st(e.updatedAt||e.createdAt)}</div>
      </div>
      ${m("chevron-right")}
    </div>`}function Qn(e=!1){var i;const t=((i=r.candidate)==null?void 0:i.recruiter)||{},a=t.email||"support@nearwork.co",n=t.whatsapp||Ja,s=t.whatsappUrl||Wa;return`<article class="recruiter-card"><div class="avatar recruiter-avatar">NW</div><div><strong>${t.name||"Nearwork Support"}</strong><p><a href="mailto:${a}">${a}</a></p><p><a href="${s}" target="_blank" rel="noreferrer">WhatsApp ${n}</a></p>${e?"<span>Questions about assessments, interviews, feedback, or CV selection should go here.</span>":""}</div></article>`}function ma(e,t){return`<div class="empty-state">${m("inbox")}<strong>${e}</strong><p>${t}</p></div>`}function Jn(e){const t=(e==null?void 0:e.title)||(e==null?void 0:e.role)||"this role",a=document.createElement("div");a.className="nw-modal-overlay",a.innerHTML=`
    <div class="nw-modal" style="text-align:center;padding:32px 28px;">
      <div style="font-size:48px;margin-bottom:12px;">🎉</div>
      <h3 style="font-size:18px;margin-bottom:10px;">Application submitted!</h3>
      <p style="margin-bottom:6px;">You've applied to <strong>${E(t)}</strong>. Our team will review your profile and reach out with next steps shortly.</p>
      <p style="font-size:12px;color:var(--light);margin-bottom:20px;">You can track your application status in the Applications tab.</p>
      <button type="button" class="pf-btn-primary" id="dismissApplySuccess" style="padding:11px 28px;border-radius:99px;font-size:14px;">Got it</button>
    </div>`,document.body.appendChild(a),a.addEventListener("click",n=>{(n.target===a||n.target.id==="dismissApplySuccess")&&a.remove()}),document.getElementById("dismissApplySuccess").focus()}function Wn(){nt.innerHTML='<main class="loading-screen"><span class="logo-mark">N</span><p>Loading Talent...</p></main>'}async function Yn(e){var t;try{const a=await((t=U.currentUser)==null?void 0:t.getIdToken().catch(()=>""));if(a){const n=await fetch("/api/auth-handoff",{method:"POST",headers:{Authorization:"Bearer "+a,"Content-Type":"application/json"}});if(n.ok){const{customToken:s}=await n.json();if(s){const i=new URL(e);i.searchParams.set("ct",s),window.open(i.toString(),"_blank","noreferrer");return}}}}catch{}window.open(e,"_blank","noreferrer")}function Zn(){var e,t,a,n,s,i,o,d,c,l,p,u,v,h,N,A,x,C,M,R,H,B,q,Z;(e=document.querySelector("#signOut"))==null||e.addEventListener("click",async()=>{await qt(U),Y&&Y(),Y=null,Xe=!1,J=!1,re=null,window.history.pushState({page:"overview"},"","/"),b({user:null,candidate:null,applications:[],assessments:[],jobs:[],view:"login",activePage:"overview",message:""})}),(t=document.querySelector("#signIn"))==null||t.addEventListener("click",()=>{window.history.pushState({page:"overview"},"","/"),b({view:"login",activePage:"overview",message:""})}),(a=document.querySelector("#openDeleteAccount"))==null||a.addEventListener("click",()=>{b({showDeleteAccountModal:!0,deleteAccountStatus:null,deleteAccountError:""})}),(n=document.querySelector("#cancelDeleteAccount"))==null||n.addEventListener("click",()=>{b({showDeleteAccountModal:!1,deleteAccountStatus:null,deleteAccountError:""})}),(s=document.querySelector("#confirmDeleteAccount"))==null||s.addEventListener("click",async()=>{var g,w;if(((w=(g=document.querySelector("#deleteConfirmInput"))==null?void 0:g.value)==null?void 0:w.trim())!=="DELETE"){b({deleteAccountStatus:"error",deleteAccountError:'Type "DELETE" to confirm.'});return}b({deleteAccountStatus:"deleting"});try{await Oa(),await qt(U),Y&&Y(),Y=null,Xe=!1,J=!1,re=null,window.history.pushState({page:"overview"},"","/"),b({user:null,candidate:null,applications:[],assessments:[],jobs:[],view:"login",activePage:"overview",showDeleteAccountModal:!1,deleteAccountStatus:null,deleteAccountError:"",message:"Your account has been deleted. You're welcome to sign up again anytime."})}catch(S){b({deleteAccountStatus:"error",deleteAccountError:S.message||"Failed to delete account."})}}),document.querySelectorAll("[data-page]").forEach(f=>{f.addEventListener("click",g=>{const S=(g.currentTarget.closest("[data-page]")||g.currentTarget).dataset.page;if(r.activePage==="profile"&&J&&S!=="profile"){re=S,b({showUnsavedChangesModal:!0});return}Fe(S)})}),(i=document.querySelector("[data-dashboard-home]"))==null||i.addEventListener("click",()=>{if(r.activePage==="profile"&&J){re="overview",b({showUnsavedChangesModal:!0});return}Fe("overview")}),(o=document.querySelector("#cancelUnsavedNav"))==null||o.addEventListener("click",()=>{re=null,b({showUnsavedChangesModal:!1})}),(d=document.querySelector("#discardUnsavedNav"))==null||d.addEventListener("click",()=>{J=!1;const f=re;re=null,b({showUnsavedChangesModal:!1}),f&&Fe(f)}),(c=document.querySelector("#saveUnsavedNav"))==null||c.addEventListener("click",()=>{var f;b({showUnsavedChangesModal:!1}),(f=document.querySelector("#profileForm"))==null||f.requestSubmit()}),(l=document.querySelector("#notificationBell"))==null||l.addEventListener("click",()=>{b({notificationPanelOpen:!r.notificationPanelOpen,notificationSettingsOpen:!1})}),(p=document.querySelector("#notificationSettings"))==null||p.addEventListener("click",()=>{b({notificationSettingsOpen:!r.notificationSettingsOpen,notificationPanelOpen:!1})}),document.querySelectorAll("[data-notification-read]").forEach(f=>{f.addEventListener("click",async()=>{const g=f.dataset.notificationRead;r.user&&ye&&await Va(g).catch(()=>null),b({notifications:r.notifications.map(w=>w.id===g?{...w,read:!0}:w)})})}),document.querySelectorAll("[data-notification-pref]").forEach(f=>{f.addEventListener("change",async()=>{var k;const g=structuredClone(((k=r.candidate)==null?void 0:k.notificationPreferences)||{}),w=f.dataset.notificationPref,S=f.dataset.channel;g[w]={...g[w]||{},[S]:f.checked},b({candidate:{...r.candidate,notificationPreferences:g}}),r.user&&ye&&await Ga(r.user.uid,g).catch(()=>null)})}),document.querySelectorAll("[data-assessment-jump]").forEach(f=>{f.addEventListener("click",async()=>{var F,K,D;const g=fe()||((F=(r.assessments||[])[0])==null?void 0:F.id),w=(r.assessments||[]).find(I=>I.id===g),S=Number(f.dataset.assessmentJump||0),k=(K=w==null?void 0:w.questions)==null?void 0:K[S];if(!g||!k)return;await Be(g,"__progress__","",{currentQuestionIndex:S,totalQuestions:((D=w==null?void 0:w.questions)==null?void 0:D.length)||70,currentStage:k.stage||1}),Le(g,S);const $=(r.assessments||[]).map(I=>I.id===g?{...I,currentQuestionIndex:S,currentStage:k.stage||1}:I);b({assessments:$,activePage:"assessment",message:""})})}),document.querySelector("#availability").addEventListener("change",async f=>{const g=f.target.value;b({candidate:{...r.candidate,availability:g}}),r.user&&ye?await Fa(r.user.uid,g):b({message:"Sign in to save availability."})}),(u=document.querySelector("#filterMatches"))==null||u.addEventListener("click",()=>{const f=Ve().length>=3;b({matchesFiltered:f?!r.matchesFiltered:!1,message:f?"":"Add at least 5 skills in Profile first, then filter matching openings."})}),(v=document.querySelector("#departmentSelect"))==null||v.addEventListener("change",f=>{const g=document.querySelector("#citySelect"),w=pe[f.target.value]||[];g.innerHTML=w.map(S=>`<option value="${y(S)}">${S}</option>`).join("")}),(h=document.querySelector("#roleGroupSelect"))==null||h.addEventListener("change",f=>{const g=document.querySelector("#targetRoleSelect");g.innerHTML=it(f.target.value,"")}),(N=document.querySelector("#salaryCurrencyInput"))==null||N.addEventListener("change",f=>{const g=document.querySelector("#salaryInput");if(!g)return;const w=Rt(g.value,f.target.value);f.target.value=w,g.placeholder=w==="COP"?"5,000,000":"2,500",g.value=ht(g.value,w)}),(A=document.querySelector("#salaryInput"))==null||A.addEventListener("blur",f=>{const g=document.querySelector("#salaryCurrencyInput"),w=Rt(f.target.value,(g==null?void 0:g.value)||"USD");g&&(g.value=w),f.target.placeholder=w==="COP"?"5,000,000":"2,500",f.target.value=ht(f.target.value,w)}),fn(),ga(),is(),Xn(),ns(),ts(),Kn(),document.querySelectorAll("[data-open-url]").forEach(f=>{f.addEventListener("click",()=>Yn(f.dataset.openUrl))}),document.querySelectorAll("[data-apply]").forEach(f=>{f.addEventListener("click",async()=>{const g=r.jobs.map(be).find(S=>S.code===f.dataset.apply),w=f.dataset.apply;if(f.disabled=!0,f.textContent="Submitting...",r.user&&ye){try{const S=pa();S.add(w),localStorage.setItem("nw_talent_applied",JSON.stringify([...S]))}catch{}await Ba(r.user.uid,g),f.textContent=`${m("check")} Applied`,f.classList.add("applied"),Jn(g)}else b({message:"Sign in to apply to this opening."})})}),(x=document.querySelector("#showTechIntro"))==null||x.addEventListener("click",()=>{b({assessmentUiStep:"techIntro",message:""})}),(C=document.querySelector("#backToWelcome"))==null||C.addEventListener("click",()=>{b({assessmentUiStep:null,message:""})}),(M=document.querySelector("#startDiscAssessment"))==null||M.addEventListener("click",async()=>{var K;const f=fe()||((K=(r.assessments||[])[0])==null?void 0:K.id),g=(r.assessments||[]).find(D=>D.id===f);if(!f||!g)return;const w=g.questions||[],S=document.querySelector("#startDiscAssessment"),k=S?Number(S.dataset.discIndex||50):w.findIndex(D=>Number(D.stage||1)===2),$=k>=0?k:50,F=new Date().toISOString();try{await Be(f,"__progress__","",{currentQuestionIndex:$,totalQuestions:w.length,currentStage:2,discStartedAt:F}),Le(f,$);const D=(r.assessments||[]).map(I=>I.id===f?{...I,currentQuestionIndex:$,currentStage:2,discStartedAt:F}:I);b({assessments:D,activePage:"assessment",assessmentUiStep:null,message:""})}catch(D){b({message:ke(D)})}}),(R=document.querySelector("#startAssessment"))==null||R.addEventListener("click",async()=>{var w;const f=fe()||((w=(r.assessments||[])[0])==null?void 0:w.id),g=(r.assessments||[]).find(S=>S.id===f)||(r.assessments||[])[0];if(!f||!r.user){b({message:"Please log in to start your assessment."});return}try{await Ra(f,r.user.uid),Le(f,Number((g==null?void 0:g.currentQuestionIndex)||0),!0);const S=(r.assessments||[]).map(k=>k.id===f?{...k,status:"started",startedAt:k.startedAt||new Date().toISOString(),technicalStartedAt:k.technicalStartedAt||new Date().toISOString()}:k);b({assessments:S,activePage:"assessment",assessmentUiStep:null,message:""})}catch(S){b({message:ke(S)})}}),(H=document.querySelector("#prevAssessmentQuestion"))==null||H.addEventListener("click",async()=>{var F,K,D,I;const f=fe()||((F=(r.assessments||[])[0])==null?void 0:F.id),g=(r.assessments||[]).find(oe=>oe.id===f),w=Number(((K=document.querySelector("#assessmentQuestionForm"))==null?void 0:K.dataset.currentIndex)??(g==null?void 0:g.currentQuestionIndex)??0),S=Math.max(0,w-1),k=(D=g==null?void 0:g.questions)==null?void 0:D[S];await Be(f,"__progress__","",{currentQuestionIndex:S,totalQuestions:((I=g==null?void 0:g.questions)==null?void 0:I.length)||70,currentStage:(k==null?void 0:k.stage)||1}),Le(f,S);const $=(r.assessments||[]).map(oe=>oe.id===f?{...oe,currentQuestionIndex:S,currentStage:(k==null?void 0:k.stage)||1}:oe);b({assessments:$,activePage:"assessment",message:""})}),(B=document.querySelector("#assessmentQuestionForm"))==null||B.addEventListener("submit",async f=>{var Ie;f.preventDefault();const g=fe()||((Ie=(r.assessments||[])[0])==null?void 0:Ie.id),w=(r.assessments||[]).find(j=>j.id===g),S=(w==null?void 0:w.questions)||[],k=Number(f.currentTarget.dataset.currentIndex??(w==null?void 0:w.currentQuestionIndex)??0),$=S[k],F=new FormData(f.currentTarget).get("answer");if(!$){b({message:"This question could not be loaded. Please refresh and try again."});return}const K=F===null?{value:"",skipped:!0,answeredAt:new Date().toISOString()}:{value:Number(F),skipped:!1,answeredAt:new Date().toISOString()},D={...w.answers||{},[$.id]:K},I=S[k+1],oe=I&&Number(I.stage||1)!==Number($.stage||1),Pe=ft(w,$.stage,D);try{if((oe||k+1>=S.length)&&Pe.length){await Be(g,$.id,D[$.id],{currentQuestionIndex:k,totalQuestions:S.length,currentStage:$.stage||1});const j=(r.assessments||[]).map(X=>X.id===g?{...X,answers:D,currentQuestionIndex:k,currentStage:$.stage||1,progress:`${k+1}/${S.length}`}:X);b({assessments:j,activePage:"assessment",message:`You missed ${Pe.length} question${Pe.length===1?"":"s"} in the ${$t($.stage)}.`});return}if(k+1>=S.length){const j=qn(w,D),X=In(w,D);await Ua(g,D,{totalQuestions:S.length,technicalScore:j.technicalScore,discScore:j.discScore,score:Math.round(j.technicalScore*.75+j.discScore*.25),discProfile:X}),fetch("https://admin.nearwork.co/api/generate-assessment-insights",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({assessmentId:g})}).catch(()=>null),Dn(w,{score:Math.round(j.technicalScore*.75+j.discScore*.25),technicalScore:j.technicalScore,discScore:j.discScore,discProfile:X}).catch(ge=>console.warn(ge));const me=(r.assessments||[]).map(ge=>ge.id===g?{...ge,answers:D,status:"completed",score:Math.round(j.technicalScore*.75+j.discScore*.25),technical:j.technicalScore,disc:X.label,discProfile:X,progress:`${S.length}/${S.length}`}:ge);b({assessments:me,activePage:"assessment",message:""})}else{const j=$.stage===1&&(I==null?void 0:I.stage)===2&&!w.discStartedAt;await Be(g,$.id,D[$.id],{currentQuestionIndex:k+1,totalQuestions:S.length,currentStage:(I==null?void 0:I.stage)||$.stage||1}),Le(g,k+1);const X=(r.assessments||[]).map(me=>me.id===g?{...me,answers:D,currentQuestionIndex:k+1,currentStage:(I==null?void 0:I.stage)||$.stage||1,progress:`${k+1}/${S.length}`}:me);b({assessments:X,activePage:"assessment",message:"",assessmentUiStep:j?"discIntro":null})}}catch(j){b({message:ke(j)})}}),(q=document.querySelector("#profileForm"))==null||q.addEventListener("submit",async f=>{var K,D,I,oe,Pe,Ie,j,X,me,ge;f.preventDefault();const g=new FormData(f.currentTarget),w=g.get("department"),S=g.get("city"),k=oa(g.get("salary"),g.get("salaryCurrency")),$=g.get("marketingConsent")==="on",F={name:g.get("name"),targetRole:g.get("targetRole"),headline:g.get("targetRole"),department:w,city:S,locationId:`${String(S).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g,"-")}-co`,location:`${S}, ${w}`,locationCity:S,locationDepartment:w,locationCountry:"Colombia",english:g.get("english"),salary:k.salary,salaryUSD:k.salaryUSD,salaryAmount:k.salaryAmount,salaryCurrency:k.salaryCurrency,expectedSalaryAmount:k.salaryAmount,expectedSalaryCurrency:k.salaryCurrency,linkedin:g.get("linkedin"),whatsapp:g.get("whatsapp"),phone:g.get("whatsapp"),skills:[...new Set(g.getAll("skills").map(xe).filter(Boolean))],otherSkills:[],languages:as(),summary:g.get("summary"),email:((K=r.candidate)==null?void 0:K.email)||((D=r.user)==null?void 0:D.email)||"",availability:((I=r.candidate)==null?void 0:I.availability)||"open",marketingConsent:$,marketingConsentAt:$?((oe=r.candidate)==null?void 0:oe.marketingConsent)===!0?((Pe=r.candidate)==null?void 0:Pe.marketingConsentAt)||null:new Date().toISOString():null,onboarded:!0};if(!r.user){b({candidate:{...r.candidate,...F},message:"Preview updated. Sign in to save this profile."});return}try{const Ee=g.get("photo");let Nt=((Ie=r.candidate)==null?void 0:Ie.photoURL)||((j=r.user)==null?void 0:j.photoURL)||"";Ee!=null&&Ee.name&&(Nt=await za(r.user.uid,Ee));const Ge=(X=g.get("profileCv"))!=null&&X.name?g.get("profileCv"):Ke;let Se=null,Mt=!1;if(Ge!=null&&Ge.name)try{Se=await vt(r.user.uid,Ge,g.get("profileCvLabel")||""),Ke=null}catch{Mt=!0}const ot={...F,photoURL:Nt,candidateCode:(me=r.candidate)==null?void 0:me.candidateCode,...Se?{activeCvId:Se.id,activeCvName:Se.name||Se.fileName,cvUrl:Se.url,cvLibrary:[...((ge=r.candidate)==null?void 0:ge.cvLibrary)||[],Se]}:{},workHistory:(()=>{var De,_e,Re,Ue;const Ce=es();return Ce.length?Ce:(De=ae==null?void 0:ae.workHistory)!=null&&De.length&&(Te||!((Re=(_e=r.candidate)==null?void 0:_e.workHistory)!=null&&Re.length))?ae.workHistory:((Ue=r.candidate)==null?void 0:Ue.workHistory)||[]})(),certifications:(()=>{var De,_e,Re,Ue;const Ce=ss();return Ce.length?Ce:(De=ae==null?void 0:ae.certifications)!=null&&De.length&&(Te||!((Re=(_e=r.candidate)==null?void 0:_e.certifications)!=null&&Re.length))?ae.certifications:((Ue=r.candidate)==null?void 0:Ue.certifications)||[]})()};ae=null,Te=!1;const rt=await bt(r.user.uid,ot),fa=Mt?"Profile saved, but the CV failed to upload. Try uploading it again from the CV section.":(rt==null?void 0:rt.atsSynced)===!1?"Profile saved. Nearwork will finish connecting it to your workspace.":"Profile saved.";if(g.get("mode")==="onboarding")window.history.pushState({page:"overview"},"","/"),b({candidate:{...r.candidate,...ot},activePage:"overview",message:"Profile complete. Welcome to Talent."});else if(J=!1,b({candidate:{...r.candidate,...ot},message:fa,showUnsavedChangesModal:!1}),re){const Ce=re;re=null,Fe(Ce)}}catch(Ee){b({message:ke(Ee)})}}),(Z=document.querySelector("#cvForm"))==null||Z.addEventListener("submit",async f=>{var S;f.preventDefault();const g=new FormData(f.currentTarget),w=g.get("cv");if(w!=null&&w.name){if(!r.user){b({message:"Sign in to upload and store CVs."});return}try{const k=await vt(r.user.uid,w,g.get("label"));b({candidate:{...r.candidate,cvLibrary:[...((S=r.candidate)==null?void 0:S.cvLibrary)||[],k],activeCvId:k.id},message:"CV uploaded."})}catch(k){b({message:ke(k)})}}})}function Kn(){var s;const e=document.querySelectorAll(".pf-tab"),t=document.querySelectorAll(".pf-tab-panel");if(!e.length||!t.length)return;const a=i=>{e.forEach(o=>o.classList.toggle("active",o.dataset.tab===i)),t.forEach(o=>{o.hidden=o.dataset.tabPanel!==i})};e.forEach(i=>{i.addEventListener("click",()=>a(i.dataset.tab))}),(s=document.querySelector("#profileForm"))==null||s.addEventListener("invalid",i=>{const o=i.target.closest(".pf-tab-panel");o&&a(o.dataset.tabPanel)},!0);const n=document.querySelector("#profileForm");n==null||n.addEventListener("input",()=>{J=!0}),n==null||n.addEventListener("change",()=>{J=!0})}function Xn(){const e=document.querySelector("#workHistoryCard");if(!e)return;let t=e.querySelectorAll(".work-entry").length;e.addEventListener("click",a=>{var s;const n=a.target.closest(".remove-work-entry");if(n){(s=n.closest(".work-entry"))==null||s.remove(),J=!0;return}if(a.target.closest("#addWorkEntry")){const i=document.querySelector("#workEntries");if(!i)return;const o=document.createElement("div");o.innerHTML=Et(t++,{}),i.appendChild(o.firstElementChild),J=!0}})}function es(){return[...document.querySelectorAll(".work-entry")].map(e=>{const t=a=>{var n,s;return((s=(n=e.querySelector(`[data-field="${a}"]`))==null?void 0:n.value)==null?void 0:s.trim())||""};return{title:t("title"),company:t("company"),from:t("from"),to:t("to")}}).filter(e=>e.title||e.company)}function ts(){const e=document.querySelector("#langCard");if(!e)return;let t=e.querySelectorAll(".lang-entry").length;e.addEventListener("click",a=>{var s;const n=a.target.closest(".remove-lang-entry");if(n){(s=n.closest(".lang-entry"))==null||s.remove(),J=!0;return}if(a.target.closest("#addLangEntry")){const i=document.querySelector("#langEntries");if(!i)return;const o=document.createElement("div");o.innerHTML=Lt(t++,{}),i.appendChild(o.firstElementChild),J=!0}})}function as(){return[...document.querySelectorAll(".lang-entry")].map(e=>{const t=a=>{var n,s;return((s=(n=e.querySelector(`[data-field="${a}"]`))==null?void 0:n.value)==null?void 0:s.trim())||""};return{name:t("name"),level:t("level")}}).filter(e=>e.name)}function ns(){const e=document.querySelector("#certCard");if(!e)return;let t=e.querySelectorAll(".cert-entry").length;e.addEventListener("click",a=>{var s;const n=a.target.closest(".remove-cert-entry");if(n){(s=n.closest(".cert-entry"))==null||s.remove(),J=!0;return}if(a.target.closest("#addCertEntry")){const i=document.querySelector("#certEntries");if(!i)return;const o=document.createElement("div");o.innerHTML=Tt(t++,{}),i.appendChild(o.firstElementChild),J=!0}})}function ss(){return[...document.querySelectorAll(".cert-entry")].map(e=>{const t=a=>{var n,s;return((s=(n=e.querySelector(`[data-field="${a}"]`))==null?void 0:n.value)==null?void 0:s.trim())||""};return{name:t("name"),issuer:t("issuer"),date:t("date")}}).filter(e=>e.name)}function is(){var n,s,i,o,d,c;const e=document.querySelector("#profileForm"),t=e==null?void 0:e.querySelector('input[name="profileCv"]');if(!e||!t)return;((n=e.querySelector('input[name="mode"]'))==null?void 0:n.value)==="onboarding"&&!((i=(s=r.candidate)==null?void 0:s.skills)!=null&&i.length)&&!((d=(o=r.candidate)==null?void 0:o.workHistory)!=null&&d.length)&&!((c=r.candidate)!=null&&c.name)?os(e,t):rs(t)}function os(e,t){var o;const a=document.querySelector("#profileCvCard");if(!a)return;const n=[...e.children].filter(d=>d!==a&&d.type!=="hidden"&&d.getAttribute("name")!=="mode");n.forEach(d=>{d.style.display="none"});const s=document.createElement("p");s.id="cvGatePrompt",s.style.cssText="font-size:13px;color:var(--mid);margin:10px 0 4px;text-align:center;",s.innerHTML=`Upload your CV and we'll fill in the rest for you — or <button type="button" id="skipCvParse" style="background:none;border:none;padding:0;font-size:13px;color:var(--green);cursor:pointer;text-decoration:underline;">skip and fill in manually</button>`,a.insertAdjacentElement("afterend",s);function i(){var d,c;(d=document.querySelector("#cvGatePrompt"))==null||d.remove(),(c=document.querySelector("#cvParseLoading"))==null||c.remove(),n.forEach(l=>{l.style.display=""})}(o=document.querySelector("#skipCvParse"))==null||o.addEventListener("click",i),t.addEventListener("change",async()=>{var p,u;const d=(p=t.files)==null?void 0:p[0];if(!d)return;(u=document.querySelector("#cvGatePrompt"))==null||u.remove();const c=document.createElement("p");c.id="cvParseLoading",c.style.cssText="font-size:13px;font-weight:600;color:var(--green);padding:14px 0;text-align:center;",c.textContent="Analysing your CV…",a.insertAdjacentElement("afterend",c),ae=null,Te=!0;const l=await St(d);i(),l&&(ae=l,ls(l,!0),cs(l,t))})}function rs(e){e.addEventListener("change",async()=>{var d,c,l,p,u,v,h,N,A;const t=(d=e.files)==null?void 0:d[0];if(!t)return;ae=null,Te=!1,Ke=null,b({message:"⏳ Analysing your CV — this takes up to 30 seconds…"});const a=await St(t);if(!a){b({message:"⚠️ Could not read your CV. Check the browser console for details, or try a different file."});return}ae=a,Te=!0,Ke=t;const n=r.candidate||{},s={...n,...a.name?{name:a.name}:{},...a.phone?{whatsapp:a.phone,phone:a.phone}:{},...a.summary?{summary:a.summary}:{},skills:(c=a.skills)!=null&&c.length?[...new Set(a.skills.map(xe).filter(Boolean))]:n.skills||[],workHistory:(l=a.workHistory)!=null&&l.length?a.workHistory:n.workHistory||[],certifications:(p=a.certifications)!=null&&p.length?a.certifications:n.certifications||[],languages:(u=a.languages)!=null&&u.length?a.languages:n.languages||[]},i=[];a.name&&i.push("name"),a.phone&&i.push("phone"),a.summary&&i.push("summary"),(v=a.skills)!=null&&v.length&&i.push(`${a.skills.length} skill${a.skills.length!==1?"s":""}`),(h=a.workHistory)!=null&&h.length&&i.push(`${a.workHistory.length} role${a.workHistory.length!==1?"s":""}`),(N=a.certifications)!=null&&N.length&&i.push(`${a.certifications.length} cert${a.certifications.length!==1?"s":""}`),(A=a.languages)!=null&&A.length&&i.push("languages");const o=i.length?`✓ Pre-filled from CV: ${i.join(", ")}. Review and save your profile.`:"✓ CV analysed. Review your profile and save.";b({candidate:s,message:o})})}function ls(e,t){var n,s,i,o,d;const a=(c,l)=>{const p=document.querySelector(c);p&&l&&t&&(p.value=l)};if(a('input[name="name"]',e.name),a('input[name="whatsapp"]',e.phone),a('textarea[name="summary"]',e.summary),(n=e.skills)!=null&&n.length){const c=document.querySelector("#selectedSkills");if(c){c.innerHTML="";const l=new Set([...c.querySelectorAll('input[name="skills"]')].map(u=>u.value.toLowerCase()));(s=c.querySelector(".skill-empty"))==null||s.remove(),[...new Set(e.skills.map(xe).filter(Boolean))].forEach(u=>{if(l.has(u.toLowerCase()))return;l.add(u.toLowerCase());const v=document.createElement("span");v.className="selected-skill",v.setAttribute("data-skill-chip",u),v.innerHTML=`${E(u)}<button type="button" class="skill-remove" data-remove-skill="${y(u)}" aria-label="Remove ${y(u)}">×</button><input type="hidden" name="skills" value="${y(u)}" />`,c.appendChild(v)})}}if((i=e.workHistory)!=null&&i.length){const c=document.querySelector("#workEntries");if(c){c.innerHTML="";let l=c.querySelectorAll(".work-entry").length;e.workHistory.forEach(p=>{const u=document.createElement("div");u.innerHTML=Et(l++,p),c.appendChild(u.firstElementChild)})}}if((o=e.languages)!=null&&o.length){const c=document.querySelector("#langEntries");if(c){c.innerHTML="";let l=c.querySelectorAll(".lang-entry").length;e.languages.forEach(p=>{const u=document.createElement("div");u.innerHTML=Lt(l++,p),c.appendChild(u.firstElementChild)})}}if((d=e.certifications)!=null&&d.length){const c=document.querySelector("#certEntries");if(c){c.innerHTML="";let l=c.querySelectorAll(".cert-entry").length;e.certifications.forEach(p=>{const u=document.createElement("div");u.innerHTML=Tt(l++,p),c.appendChild(u.firstElementChild)})}}qe()}function cs(e,t){var s,i,o,d,c;const a=[];e.name&&a.push("name"),e.phone&&a.push("phone"),(s=e.skills)!=null&&s.length&&a.push(`${e.skills.length} skill${e.skills.length>1?"s":""}`),(i=e.workHistory)!=null&&i.length&&a.push(`${e.workHistory.length} role${e.workHistory.length>1?"s":""}`),(o=e.certifications)!=null&&o.length&&a.push(`${e.certifications.length} cert${e.certifications.length>1?"s":""}`),(d=e.languages)!=null&&d.length&&a.push("languages"),(c=document.querySelector("#cvParseHint"))==null||c.remove();const n=document.createElement("p");n.id="cvParseHint",n.style.cssText="font-size:12px;color:var(--green);margin:4px 0 0;",n.innerHTML=a.length?`✓ Pre-filled: <strong>${a.join(", ")}</strong>. Review and save.`:"✓ CV analysed. Review your profile and save.",t.insertAdjacentElement("afterend",n)}function ga(){var c;const e=document.querySelector("[data-skill-search]");if(!e)return;const t=e.querySelector("#skillSearchInput"),a=e.querySelector("#skillSuggestions"),n=e.querySelector("#selectedSkills"),s=()=>[...n.querySelectorAll('input[name="skills"]')].map(l=>l.value),i=l=>{n.innerHTML=l.length?l.map(p=>`
      <span class="selected-skill" data-skill-chip="${y(p)}">
        ${E(p)}
        <button type="button" class="skill-remove" data-remove-skill="${y(p)}" aria-label="Remove ${y(p)}">×</button>
        <input type="hidden" name="skills" value="${y(p)}" />
      </span>`).join(""):'<span class="skill-empty">Selected skills will appear here.</span>'},o=()=>{const l=Q(t.value),p=t.value.trim(),u=new Set(s().map(Q)),v=Zt.filter(x=>!u.has(Q(x))).filter(x=>!l||Q(x).includes(l)).slice(0,12),h=v.find(x=>Q(x)===l),A=p.length>1&&!u.has(Q(p))&&!h?`<button type="button" class="skill-suggestion add-custom" data-skill="${y(p)}">+ Add "${E(p)}"</button>`:"";a.innerHTML=A+v.map(x=>`<button type="button" class="skill-suggestion" data-skill="${y(x)}">${E(x)}</button>`).join("")},d=l=>{const p=(l||t.value).trim(),u=xe(p);if(!u)return;const v=Q(u),h=s();if(h.length>=20&&!h.some(A=>Q(A)===v)){t.value="";return}const N=[...h.filter(A=>Q(A)!==v),u];i(N),t.value="",o(),J=!0};t==null||t.addEventListener("input",o),t==null||t.addEventListener("focus",o),t==null||t.addEventListener("keydown",l=>{if(l.key!=="Enter")return;l.preventDefault();const p=Q(t.value),u=[...a.querySelectorAll(".skill-suggestion:not(.add-custom)")].find(v=>Q(v.dataset.skill)===p);d((u==null?void 0:u.dataset.skill)||t.value)}),(c=e.querySelector("#addTypedSkill"))==null||c.addEventListener("click",()=>d(t.value)),a.addEventListener("click",l=>{const p=l.target.closest("[data-skill]");p&&d(p.dataset.skill)}),n.addEventListener("click",l=>{const p=l.target.closest("[data-remove-skill]");if(!p)return;const u=Q(p.dataset.removeSkill);i(s().filter(v=>Q(v)!==u)),o(),J=!0})}function va(){if(r.loading)return Wn();if(r.view==="reset-password")return on();if(r.view==="dashboard")return da();ca()}window.addEventListener("popstate",()=>{if(window.location.pathname==="/reset-password"){b({view:"reset-password",resetCodeStatus:null,resetCodeError:""});return}const e=et();e==="overview"&&!r.user?b({view:"login",activePage:"overview",message:""}):r.view==="dashboard"?Fe(e,!1):Oe()});const at=new URLSearchParams(window.location.search).get("ct");at&&window.history.replaceState({},"",window.location.pathname);let Ye=!!at;ye?(ba(U,e=>{if(!Ye)if(e)Ut(e);else{try{localStorage.removeItem("nw_talent_applied")}catch{}Oe()}}),window.setTimeout(()=>{r.loading&&(Ye=!1,Oe())},2500),at&&Qa(at).then(e=>{Ye=!1,Ut(e.user)}).catch(()=>{Ye=!1,Oe()})):Oe();
