import{initializeApp as Xt}from"https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";import{getAuth as ea,GoogleAuthProvider as ta,signInWithPopup as aa,onAuthStateChanged as na,sendPasswordResetEmail as sa,createUserWithEmailAndPassword as ia,updateProfile as oa,signInWithEmailAndPassword as ra,signOut as la}from"https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";import{getFirestore as ca,query as te,collection as Z,where as ae,limit as ne,getDocs as se,getDoc as Se,doc as B,setDoc as H,serverTimestamp as F,onSnapshot as da,updateDoc as ua,addDoc as bt,arrayUnion as Ke}from"https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";import{getStorage as pa,ref as Xe,uploadBytes as At,getDownloadURL as Pt,deleteObject as ma}from"https://www.gstatic.com/firebasejs/10.12.5/firebase-storage.js";(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))n(s);new MutationObserver(s=>{for(const i of s)if(i.type==="childList")for(const l of i.addedNodes)l.tagName==="LINK"&&l.rel==="modulepreload"&&n(l)}).observe(document,{childList:!0,subtree:!0});function a(s){const i={};return s.integrity&&(i.integrity=s.integrity),s.referrerPolicy&&(i.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?i.credentials="include":s.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function n(s){if(s.ep)return;s.ep=!0;const i=a(s);fetch(s.href,i)}})();const Lt={apiKey:"AIzaSyApRNyW8PoP28E0x77dUB5jOgHuTqA2by4",authDomain:"nearwork-97e3c.firebaseapp.com",projectId:"nearwork-97e3c",storageBucket:"nearwork-97e3c.firebasestorage.app",messagingSenderId:"145642656516",appId:"1:145642656516:web:0ac2da8931283121e87651",measurementId:"G-3LC8N6FFSH"},ue=Object.values(Lt).slice(0,6).every(Boolean),me=ue?Xt(Lt):null,O=me?ea(me):null,P=me?ca(me):null,Be=me?pa(me):null,ga=me?new ta:null,L={users:"users",candidates:"candidates",openings:"openings",pipelines:"pipelines",applications:"applications",assessments:"assessments",activity:"candidateActivity",notifications:"notifications",notificationPreferences:"notificationPreferences"},Nt="/api/send-email-proxy";function z(){if(!me||!O||!P||!Be)throw new Error("Missing Firebase environment variables. Copy .env.example to .env.local and fill in the Admin app config.")}async function Et(e={}){var i,l;const t=String(e.email||((i=O==null?void 0:O.currentUser)==null?void 0:i.email)||"").trim().toLowerCase();if(!t)return{ok:!1,skipped:!0,reason:"Missing candidate email"};const a=e.name||((l=O==null?void 0:O.currentUser)==null?void 0:l.displayName)||"",n=e.firstName||a.split(/\s+/)[0]||"there",s=await fetch(Nt,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({to:t,templateId:"account_created",data:{name:a||n,firstName:n,actionUrl:"https://talent.nearwork.co"}})});return s.json().catch(()=>({ok:s.ok}))}async function va(e={},t={}){var l,d;const a=String((e==null?void 0:e.email)||((l=O==null?void 0:O.currentUser)==null?void 0:l.email)||"").trim().toLowerCase();if(!a)return{ok:!1,skipped:!0,reason:"Missing candidate email"};const n=(e==null?void 0:e.name)||((d=O==null?void 0:O.currentUser)==null?void 0:d.displayName)||"",s=(e==null?void 0:e.firstName)||n.split(/\s+/)[0]||"there",i=await fetch(Nt,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({to:a,templateId:"job_applied",data:{name:n||s,firstName:s,roleTitle:t.title||t.role||t.openingTitle||"this role",openingCode:t.code||t.id||"",actionUrl:"https://talent.nearwork.co"}})});return i.json().catch(()=>({ok:i.ok}))}async function Tt(e){z();const t=await Se(B(P,L.users,e));return t.exists()?{id:t.id,...t.data()}:null}async function fa(e){z();const t=String(e||"").trim(),a=t.toLowerCase(),n=te(Z(P,L.users),ae("email","==",a),ne(1)),s=await se(n);if(!s.empty)return{id:s.docs[0].id,...s.docs[0].data()};if(t===a)return null;const i=te(Z(P,L.users),ae("email","==",t),ne(1)),l=await se(i);return l.empty?null:{id:l.docs[0].id,...l.docs[0].data()}}async function Mt(e){const t=await Tt(e.uid);if(t)return t;const a=await fa(e.email);return a?(await st(e.uid,{...a,email:e.email,connectedFromUserId:a.id}),{...a,id:e.uid,connectedFromUserId:a.id}):null}async function st(e,t){z();const a=t.candidateCode||Ce(e),n={...t,candidateCode:a,role:"candidate",updatedAt:F()};await H(B(P,L.users,e),n,{merge:!0}),await H(B(P,L.candidates,a),je(e,{...n,candidateCode:a}),{merge:!0}).catch(()=>null),t.marketingConsent===!0&&ot({...n,candidateCode:a,source:"talent.nearwork.co"}).catch(()=>null)}function Ce(e){return`CAND-${String(e||"").replace(/[^a-z0-9]/gi,"").slice(0,8).toUpperCase()||Date.now()}`}function ha(e){return String(e||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"")}function je(e,t){const a=t.candidateCode||Ce(e),n=t.location||[t.locationCity||t.city,t.locationDepartment||t.department].filter(Boolean).join(", "),s=new Date().toISOString().slice(0,10);return{code:a,uid:e,ownerUid:e,name:t.name||"Talent member",role:t.targetRole||t.headline||"Nearwork candidate",skills:Array.isArray(t.skills)?t.skills:[],applied:t.applied||s,lastContact:t.lastContact||s,experience:Number(t.experience||0),location:n,city:ha(t.locationCity||t.city||n),department:t.locationDepartment||t.department||"",country:t.locationCountry||"Colombia",source:"talent.nearwork.co",status:t.status||"active",score:Number(t.score||50),email:t.email||"",phone:t.whatsapp||t.phone||"",whatsapp:t.whatsapp||t.phone||"",currentRole:t.currentRole||"",salary:t.salary||"",salaryUSD:Number(t.salaryUSD||0)||null,salaryAmount:Number(t.salaryAmount||t.expectedSalaryAmount||0)||null,salaryCurrency:t.salaryCurrency||t.expectedSalaryCurrency||"USD",expectedSalaryUSD:Number(t.expectedSalaryUSD||0)||null,expectedSalaryCOP:Number(t.expectedSalaryCOP||0)||null,expectedSalaryAmount:Number(t.expectedSalaryAmount||t.salaryAmount||0)||null,expectedSalaryCurrency:t.expectedSalaryCurrency||t.salaryCurrency||"USD",expectedSalary:t.expectedSalary||t.salary||"",availability:t.availability||"open",english:t.english||"",visa:t.visa||"No",linkedin:t.linkedin||"",cv:t.activeCvName||"",cvUrl:t.cvUrl||null,photoUrl:t.photoURL||t.photoUrl||null,tags:t.tags||["talent profile"],notes:t.summary||"",summary:t.summary||"",workHistory:Array.isArray(t.workHistory)?t.workHistory:[],languages:Array.isArray(t.languages)?t.languages:[],certifications:Array.isArray(t.certifications)?t.certifications:[],appliedBefore:!!t.appliedBefore,applications:t.applications||[],pipelineCodes:t.pipelineCodes||[],loom:t.loom||"Not uploaded",assessments:t.assessments||[],work:t.work||[],updatedAt:F()}}async function ya(e=!1){z();const t=await aa(O,ga),a=await Mt(t.user),n=new Date().toISOString(),s={email:t.user.email,name:t.user.displayName||"",availability:"open",onboarded:!1,privacyConsent:!0,privacyConsentAt:n,marketingConsent:e,marketingConsentAt:e?n:null},i=!a;i&&(await st(t.user.uid,s),Et(s).catch(()=>null));const l=Ce(t.user.uid),d={...a||s,candidateCode:l};return await H(B(P,L.candidates,l),je(t.user.uid,d),{merge:!0}).catch(()=>null),(i?e:(a==null?void 0:a.marketingConsent)===!0)&&ot({...d,candidateCode:l,source:"talent.nearwork.co"}).catch(()=>null),t.user}async function ba(e){z();const t=te(Z(P,L.applications),ae("candidateId","==",e),ne(20)),a=te(Z(P,L.applications),ae("ownerUid","==",e),ne(20)),n=await Promise.allSettled([se(t),se(a)]),s=new Map;return n.forEach(i=>{i.status==="fulfilled"&&i.value.docs.forEach(l=>s.set(l.id,{id:l.id,...l.data()}))}),Array.from(s.values()).sort((i,l)=>{const d=c=>{var r,u;return((u=(r=c==null?void 0:c.toDate)==null?void 0:r.call(c))==null?void 0:u.getTime())??(c?new Date(c).getTime():0)};return d(l.updatedAt||l.createdAt)-d(i.updatedAt||i.createdAt)})}async function wa(e,t="",a=""){z();const n=String(t||"").trim().toLowerCase(),s=String(a||"").trim(),i=[se(te(Z(P,L.assessments),ae("candidateUid","==",e),ne(25))),se(te(Z(P,L.assessments),ae("candidateId","==",e),ne(25)))];n&&i.push(se(te(Z(P,L.assessments),ae("candidateEmail","==",n),ne(25)))),s&&i.push(se(te(Z(P,L.assessments),ae("candidateCode","==",s),ne(25))));const l=await Promise.allSettled(i),d=new Map;return l.forEach(c=>{c.status==="fulfilled"&&c.value.docs.forEach(r=>d.set(r.id,{id:r.id,...r.data()}))}),Array.from(d.values()).sort((c,r)=>{const u=p=>{var f,w;return((w=(f=p==null?void 0:p.toDate)==null?void 0:f.call(p))==null?void 0:w.getTime())??(p?new Date(p).getTime():0)};return u(r.updatedAt||r.createdAt||r.sentAt)-u(c.updatedAt||c.createdAt||c.sentAt)})}async function Sa(e,t,a="",n=""){z();const s=await Se(B(P,L.assessments,e));if(!s.exists())return null;const i={id:s.id,...s.data()},l=String(a||"").trim().toLowerCase(),d=String(n||"").trim();return i.candidateUid===t||i.candidateId===t||String(i.candidateEmail||"").trim().toLowerCase()===l||String(i.candidateCode||"").trim()===d?i:null}async function Ca(e,t){z();const a=await Se(B(P,L.assessments,e)),n=a.exists()?a.data():{};if(n.status==="completed")throw new Error("This assessment is already completed.");if(n.expiresAt&&Date.now()>new Date(n.expiresAt).getTime())throw new Error("This assessment link has expired.");await H(B(P,L.assessments,e),{status:"started",currentQuestionIndex:Number(n.currentQuestionIndex||0),currentStage:Number(n.currentStage||1),technicalStartedAt:n.technicalStartedAt||F(),startedAt:n.startedAt||F(),updatedAt:F()},{merge:!0})}async function Ee(e,t,a,n={}){z();const s=await Se(B(P,L.assessments,e)),i=s.exists()?s.data():{};if(i.status==="completed")throw new Error("This assessment is already completed.");if(i.expiresAt&&Date.now()>new Date(i.expiresAt).getTime())throw new Error("This assessment link has expired.");await H(B(P,L.assessments,e),{[`answers.${t}`]:a,progress:`${n.currentQuestionIndex||0}/${n.totalQuestions||""}`.replace(/\/$/,""),currentQuestionIndex:n.currentQuestionIndex||0,currentStage:n.currentStage||1,...n.discStartedAt?{discStartedAt:n.discStartedAt}:{},updatedAt:F()},{merge:!0})}async function $a(e,t,a={}){var f;z();const n=B(P,L.assessments,e),s=await Se(n),i=s.exists()?s.data():{};if(i.status==="completed")throw new Error("This assessment is already completed.");if(i.expiresAt&&Date.now()>new Date(i.expiresAt).getTime())throw new Error("This assessment link has expired.");const l=Object.values(t||{}).filter(w=>String((w==null?void 0:w.value)??w??"").trim()).length,d=Number(a.totalQuestions||Object.keys(t||{}).length||0),c=Number(a.technicalScore||0),r=Number(a.discScore||0),u=Number(a.score||(d?Math.round(l/d*100):0));await H(n,{answers:t,answeredCount:l,totalQuestions:d,score:u,technical:c||u,disc:((f=a.discProfile)==null?void 0:f.label)||(r?`${r}%`:"Submitted"),discScore:r,discProfile:a.discProfile||null,progress:`${l}/${d}`,status:"completed",finished:new Date().toLocaleString("en-US",{month:"short",day:"numeric",year:"numeric",hour:"numeric",minute:"2-digit"}),finishedAt:F(),updatedAt:F()},{merge:!0});const p=Math.round(u);i.candidateUid&&await H(B(P,L.users,i.candidateUid),{score:p,nwScore:p,lastAssessmentScore:p,lastAssessmentId:e,updatedAt:F()},{merge:!0}).catch(()=>null),i.candidateCode&&await H(B(P,L.candidates,i.candidateCode),{score:p,nwScore:p,lastAssessmentScore:p,lastAssessmentId:e,updatedAt:F()},{merge:!0}).catch(()=>null)}async function It(){z();const e=te(Z(P,L.openings),ae("published","==",!0),ne(12));return(await se(e)).docs.map(a=>({id:a.id,...a.data()}))}async function ka(e,t){z();const a=t.code||t.id,n=await Tt(e).catch(()=>null),s=(n==null?void 0:n.candidateCode)||Ce(e),i=new Date().toISOString().slice(0,10),l={opening:a,openingCode:a,jobId:a,role:t.title||t.role||"Untitled role",openingTitle:t.title||t.role||"Untitled role",applied:i,appliedAt:i,status:"applied",outcome:"Application only",source:"talent.nearwork.co"},d={candidateId:e,ownerUid:e,authUid:e,candidateDocId:s,candidateCode:s,candidateEmail:(n==null?void 0:n.email)||"",candidateName:(n==null?void 0:n.name)||"",openingCode:a,jobId:a,openingTitle:t.title||t.role||"Untitled role",jobTitle:t.title||t.role||"Untitled role",title:t.title||t.role||"Untitled role",clientName:t.orgName||t.clientName||t.company||"Nearwork client",status:"applied",inPipeline:!1,isMockData:!1,source:"talent.nearwork.co",createdAt:F(),updatedAt:F()};await bt(Z(P,L.applications),d),await H(B(P,L.candidates,s),{...je(e,{...n||{},candidateCode:s,appliedBefore:!0,lastContact:i}),applications:Ke(l),appliedBefore:!0},{merge:!0}).catch(()=>null),await H(B(P,L.users,e),{role:"candidate",candidateCode:s,code:s,applications:Ke(l),lastAppliedOpeningCode:a,lastAppliedAt:F(),updatedAt:F()},{merge:!0}).catch(()=>null),await bt(Z(P,L.activity),{candidateId:e,type:"application_submitted",title:d.jobTitle,createdAt:F()}).catch(()=>null),va(n,t).catch(()=>null)}async function xa(e,t){await ua(B(P,L.users,e),{availability:t,updatedAt:F()})}async function it(e,t){z();const a=t.candidateCode||Ce(e);await H(B(P,L.users,e),{...t,candidateCode:a,role:"candidate",updatedAt:F()},{merge:!0});try{return await H(B(P,L.candidates,a),je(e,{...t,candidateCode:a}),{merge:!0}),t.marketingConsent===!0&&ot({...t,candidateCode:a,source:"talent.nearwork.co"}).catch(()=>null),{candidateCode:a,atsSynced:!0}}catch(n){return console.warn("Candidate ATS sync failed.",n),{candidateCode:a,atsSynced:!1}}}async function ot(e){var n;const t=(e==null?void 0:e.email)||((n=O.currentUser)==null?void 0:n.email)||"";return t?(await fetch("/api/sync-hubspot-candidate",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({candidate:{...e,email:t}})})).json().catch(()=>({ok:!1})):{ok:!1,skipped:!0}}async function Aa(e,t){z();const a=t.name.replace(/[^a-z0-9._-]/gi,"-").toLowerCase(),n=`candidate-photos/${e}/${Date.now()}-${a}`,s=Xe(Be,n);await At(s,t,{contentType:t.type||"application/octet-stream"});const i=await Pt(s);return await H(B(P,L.users,e),{photoURL:i,updatedAt:F()},{merge:!0}),i}async function et(e,t,a){z();let n=null,s=Ce(e);try{const u=await Se(B(P,L.users,e));if(u.exists()){const p=u.data();n=p.activeCvId||null,p.candidateCode&&(s=p.candidateCode)}}catch{}const i=t.name.replace(/[^a-z0-9._-]/gi,"-").toLowerCase(),l=`candidate-cvs/${e}/${Date.now()}-${i}`,d=Xe(Be,l);await At(d,t,{contentType:t.type||"application/octet-stream"});const c=await Pt(d),r={id:l,name:a||t.name,fileName:t.name,url:c,uploadedAt:new Date().toISOString()};return await H(B(P,L.users,e),{cvLibrary:Ke(r),activeCvId:r.id,activeCvName:r.name||r.fileName,cvUrl:c,updatedAt:F()},{merge:!0}),H(B(P,L.candidates,s),{cvUrl:c,activeCvId:r.id,activeCvName:r.name||r.fileName,updatedAt:F()},{merge:!0}).catch(()=>null),n&&n!==l&&ma(Xe(Be,n)).catch(()=>{}),r}function Pa(e,t){if(z(),!e)return()=>{};const a=te(Z(P,L.notifications),ae("recipientUid","==",e),ne(50));return da(a,n=>{const s=n.docs.map(i=>({id:i.id,...i.data()})).sort((i,l)=>{var r,u;const d=(r=i.createdAt)!=null&&r.toDate?i.createdAt.toDate().getTime():new Date(i.createdAt||0).getTime();return((u=l.createdAt)!=null&&u.toDate?l.createdAt.toDate().getTime():new Date(l.createdAt||0).getTime())-d});t(s)})}async function La(e){z(),e&&await H(B(P,L.notifications,e),{read:!0,readAt:F()},{merge:!0})}async function Na(e,t){z(),await H(B(P,L.notificationPreferences,e),{uid:e,app:"talent.nearwork.co",preferences:t,updatedAt:F()},{merge:!0})}async function rt(e){if(!e)return null;try{const t=await new Promise((f,w)=>{const T=new FileReader;T.onload=()=>f(T.result.split(",")[1]),T.onerror=w,T.readAsDataURL(e)}),a=await fetch("/api/parse-cv",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({data:t,filename:e.name,mimeType:e.type||"application/octet-stream"})});if(!a.ok)return null;const n=await a.json();if(!(n!=null&&n.ok))return null;const{name:s,phone:i,city:l,summary:d,skills:c,workHistory:r,languages:u,certifications:p}=n;return{name:s,phone:i,city:l,summary:d,skills:c,workHistory:r,languages:u||[],certifications:p||[]}}catch{return null}}let Y=null,ye=!1,Ue=null,lt=1,x={},X=null,Me=null,R=null;const ct=document.querySelector("#app"),Ea="+573135928691",Ta="https://wa.me/573135928691",we={"Customer Success":["Customer Success Manager","Customer Success Associate","Account Manager","Implementation Specialist","Onboarding Specialist","Renewals Manager"],Sales:["SDR / Sales Development Rep","BDR / Business Development Rep","Account Executive","Sales Operations Specialist","Sales Manager"],Support:["Technical Support Specialist","Customer Support Representative","Support Team Lead","QA Support Analyst"],Operations:["Operations Manager","Operations Analyst","Executive Assistant","Virtual Assistant","Project Coordinator","Recruiting Coordinator"],Marketing:["Marketing Ops / Content Specialist","Content Writer","SEO Specialist","Lifecycle Marketing Specialist","Social Media Manager"],Engineering:["Software Developer (Full Stack)","Frontend Developer","Backend Developer","No-Code Developer","Data Analyst","QA Engineer"],Finance:["Bookkeeper","Accounting Assistant","Financial Analyst","Payroll Specialist"]},Ma={"CRM & Sales":["HubSpot","Salesforce","Pipedrive","Apollo","Outbound","Cold Email","Discovery Calls","CRM Hygiene"],"Customer Success":["SaaS","Customer Success","QBRs","Onboarding","Renewals","Expansion","Churn Reduction","Intercom","Zendesk"],Support:["Technical Support","Tickets","Troubleshooting","APIs","Bug Reproduction","Help Center","CSAT"],Operations:["Excel","Google Sheets","Reporting","Process Design","Project Management","Notion","Airtable","Zapier"],Marketing:["Content","SEO","Lifecycle","Email Marketing","HubSpot Marketing","Copywriting","Analytics"],Engineering:["JavaScript","React","Node.js","SQL","Python","REST APIs","QA","GitHub"],Language:["English B2","English C1","English C2","Spanish Native"]},Ia=["Account Management","Accounts Payable","Accounts Receivable","Adobe Creative Suite","Agile","AI Tools","Analytics","Appointment Setting","B2B Sales","B2C Sales","Billing","Bookkeeping","Business Analysis","Canva","Cash Collections","Chat Support","Cold Calling","Community Management","Compliance","Content Strategy","Contract Management","Customer Onboarding","Customer Retention","Customer Service","Data Analysis","Data Entry","Email Support","Excel / Google Sheets","Executive Assistance","Figma","Financial Reporting","Forecasting","Helpdesk","HR Operations","Inbound Calls","Insurance Support","Lead Generation","Live Chat","Logistics","Looker","Microsoft Office","NetSuite","Outbound Calls","Payroll","Performance Marketing","Power BI","Product Support","QuickBooks","Recruiting","Salesforce Administration","Sales Operations","Shopify","Slack","Social Media","SQL Reporting","Stripe","Tableau","Technical Writing","Ticket Quality","Training","Vendor Management","WordPress","Workday","Workforce Management","Zendesk Guide","Zoho"],_t=[...new Set([...Object.values(Ma).flat(),...Ia])].sort((e,t)=>e.localeCompare(t)),ie={Amazonas:["El Encanto","La Chorrera","La Pedrera","La Victoria","Leticia","Miriti - Paraná","Puerto Alegría","Puerto Arica","Puerto Nariño","Puerto Santander","Tarapacá"],Antioquia:["Abejorral","Abriaquí","Alejandría","Amagá","Amalfi","Andes","Angelópolis","Angostura","Anorí","Anza","Apartadó","Arboletes","Argelia","Armenia","Barbosa","Bello","Belmira","Betania","Betulia","Briceño","Buriticá","Cáceres","Caicedo","Caldas","Campamento","Cañasgordas","Caracolí","Caramanta","Carepa","Carmen de Viboral","Carolina","Caucasia","Chigorodó","Cisneros","Ciudad Bolívar","Cocorná","Concepción","Concordia","Copacabana","Dabeiba","Don Matías","Ebéjico","El Bagre","Entrerríos","Envigado","Fredonia","Frontino","Giraldo","Girardota","Gómez Plata","Granada","Guadalupe","Guarne","Guatapé","Heliconia","Hispania","Itagüí","Ituango","Jardín","Jericó","La Ceja","La Estrella","La Pintada","La Unión","Liborina","Maceo","Marinilla","Medellín","Montebello","Murindó","Mutata","Nariño","Nechí","Necoclí","Olaya","Peñol","Peque","Pueblorrico","Puerto Berrío","Puerto Nare","Puerto Triunfo","Remedios","Retiro","Rionegro","Sabanalarga","Sabaneta","Salgar","San Andrés","San Carlos","San Francisco","San Jerónimo","San José de la Montaña","San Juan de Urabá","San Luis","San Pedro","San Pedro de Urabá","San Rafael","San Roque","San Vicente","Santa Bárbara","Santa Rosa de Osos","Santafé de Antioquia","Santo Domingo","Santuario","Segovia","Sonsón","Sopetrán","Támesis","Tarazá","Tarso","Titiribí","Toledo","Turbo","Uramita","Urrao","Valdivia","Valparaíso","Vegachí","Venecia","Vigía del Fuerte","Yalí","Yarumal","Yolombó","Yondó","Zaragoza"],Arauca:["Arauca","Arauquita","Cravo Norte","Fortul","Puerto Rondón","Saravena","Tame"],Atlántico:["Baranoa","Barranquilla","Campo de la Cruz","Candelaria","Galapa","Juan de Acosta","Luruaco","Malambo","Manatí","Palmar de Varela","Piojó","Polonuevo","Ponedera","Puerto Colombia","Repelón","Sabanagrande","Sabanalarga","Santa Lucía","Santo Tomás","Soledad","Suan","Tubara","Usiacurí"],"Bogotá D.C.":["Bogotá"],Bolívar:["Achí","Altos del Rosario","Arenal","Arjona","Arroyohondo","Barranco de Loba","Calamar","Cantagallo","Carmen de Bolívar","Cartagena","Cicuco","Clemencia","Córdoba","El Guamo","El Peñón","Hatillo de Loba","Magangué","Mahates","Margarita","María la Baja","Mompós","Montecristo","Morales","Pinillos","Regidor","Río Viejo","San Cristóbal","San Estanislao","San Fernando","San Jacinto","San Jacinto del Cauca","San Juan Nepomuceno","San Martín de Loba","San Pablo","Santa Catalina","Santa Rosa de Lima","Santa Rosa del Sur","Simití","Soplaviento","Talaigua Nuevo","Tiquisio","Turbaco","Turbana","Villanueva","Zambrano"],Boyacá:["Almeida","Aquitania","Arcabuco","Belén","Berbeo","Betéitiva","Boavita","Boyacá","Briceño","Buenavista","Busbanzá","Caldas","Campohermoso","Cerinza","Chinavita","Chiquinquirá","Chíquiza","Chiscas","Chita","Chitaraque","Chivatá","Chivor","Ciénega","Cómbita","Coper","Corrales","Covarachía","Cubará","Cucaita","Cuítiva","Duitama","El Cocuy","El Espino","Firavitoba","Floresta","Gachantivá","Gameza","Garagoa","Guacamayas","Guateque","Guayatá","Güicán","Iza","Jenesano","Jericó","La Capilla","La Uvita","La Victoria","Labranzagrande","Macanal","Maripí","Miraflores","Mongua","Monguí","Moniquirá","Motavita","Muzo","Nobsa","Nuevo Colón","Oicatá","Otanche","Pachavita","Páez","Paipa","Pajarito","Panqueba","Pauna","Paya","Paz de Río","Pesca","Pisba","Puerto Boyacá","Quípama","Ramiriquí","Ráquira","Rondón","Saboyá","Sáchica","Samacá","San Eduardo","San José de Pare","San Luis de Gaceno","San Mateo","San Miguel de Sema","San Pablo Borbur","Santa María","Santa Rosa de Viterbo","Santa Sofía","Santana","Sativanorte","Sativasur","Siachoque","Soatá","Socha","Socotá","Sogamoso","Somondoco","Sora","Soracá","Sotaquirá","Susacón","Sutamarchán","Sutatenza","Tasco","Tenza","Tibaná","Tibasosa","Tinjacá","Tipacoque","Toca","Togüí","Tópaga","Tota","Tunja","Tununguá","Turmequé","Tuta","Tutazá","Umbita","Ventaquemada","Villa de Leyva","Viracachá","Zetaquira"],Caldas:["Aguadas","Anserma","Aranzazu","Belalcázar","Chinchiná","Filadelfia","La Dorada","La Merced","Manizales","Manzanares","Marmato","Marquetalia","Marulanda","Neira","Norcasia","Pácora","Palestina","Pensilvania","Riosucio","Risaralda","Salamina","Samaná","San José","Supía","Victoria","Villamaría","Viterbo"],Caquetá:["Albania","Belén de los Andaquíes","Cartagena del Chairá","Currillo","El Doncello","El Paujil","Florencia","La Montañita","Milán","Morelia","Puerto Rico","San José del Fragua","San Vicente del Caguán","Solano","Solita","Valparaiso"],Casanare:["Aguazul","Chameza","Hato Corozal","La Salina","Maní","Monterrey","Nunchía","Orocué","Paz de Ariporo","Pore","Recetor","Sabanalarga","Sácama","San Luis de Palenque","Támara","Tauramena","Trinidad","Villanueva","Yopal"],Cauca:["Almaguer","Argelia","Balboa","Bolívar","Buenos Aires","Cajibío","Caldono","Caloto","Corinto","El Tambo","Florencia","Guapi","Inzá","Jambalo","La Sierra","La Vega","Lopez","Mercaderes","Miranda","Morales","Padilla","Paez","Patia","Piamonte","Piendamo","Popayán","Puerto Tejada","Purace","Rosas","San Sebastian","Santa Rosa","Santander de Quilichao","Silvia","Sotara","Suarez","Sucre","Timbio","Timbiqui","Toribio","Totoro","Villa Rica"],Cesar:["Aguachica","Agustín Codazzi","Astrea","Becerril","Bosconia","Chimichagua","Chiriguaná","Curumaní","El Copey","El Paso","Gamarra","González","La Gloria","La Jagua de Ibirico","La Paz","Manaure","Pailitas","Pelaya","Pueblo Bello","Río de Oro","San Alberto","San Diego","San Martín","Tamalameque","Valledupar"],Chocó:["Acandí","Alto Baudó","Atrato","Bagadó","Bahía Solano","Bajo Baudó","Belén de Bajirá","Bojayá","Cantón de San Pablo","Carmen del Darién","Cértegui","Condoto","El Carmen de Atrato","El Litoral del San Juan","Istmina","Juradó","Lloró","Medio Atrato","Medio Baudó","Medio San Juan","Nóvita","Nuquí","Quibdó","Río Iró","Río Quito","Riosucio","San José del Palmar","Sipí","Tadó","Unguía","Unión Panamericana"],Córdoba:["Ayapel","Buenavista","Canalete","Cereté","Chimá","Chinú","Ciénaga de Oro","Cotorra","La Apartada","Lorica","Los Córdobas","Momil","Moñitos","Montelíbano","Montería","Planeta Rica","Pueblo Nuevo","Puerto Escondido","Puerto Libertador","Purísima","Sahagún","San Andrés de Sotavento","San Antero","San Bernardo del Viento","San Carlos","San Pelayo","Tierralta","Valencia"],Cundinamarca:["Agua de Dios","Albán","Anapoima","Anolaima","Apulo","Arbeláez","Beltrán","Bituima","Bojacá","Cabrera","Cachipay","Cajicá","Caparrapí","Cáqueza","Carmen de Carupa","Chaguaní","Chía","Chipaque","Choachí","Chocontá","Cogua","Cota","Cucunubá","El Colegio","El Peñón","El Rosal","Facatativá","Fomeque","Fosca","Funza","Fúquene","Fusagasugá","Gachala","Gachancipá","Gachetá","Gama","Girardot","Granada","Guachetá","Guaduas","Guasca","Guataquí","Guatavita","Guayabal de Síquima","Guayabetal","Gutiérrez","Jerusalén","Junín","La Calera","La Mesa","La Palma","La Peña","La Vega","Lenguazaque","Macheta","Madrid","Manta","Medina","Mosquera","Nariño","Nemocón","Nilo","Nimaima","Nocaima","Pacho","Paime","Pandi","Paratebueno","Pasca","Puerto Salgar","Puli","Quebradanegra","Quetame","Quipile","Ricaurte","San Antonio de Tequendama","San Bernardo","San Cayetano","San Francisco","San Juan de Rioseco","Sasaima","Sesquilé","Sibaté","Silvania","Simijaca","Soacha","Sopó","Subachoque","Suesca","Supatá","Susa","Sutatausa","Tabio","Tausa","Tena","Tenjo","Tibacuy","Tibirita","Tocaima","Tocancipá","Topaipí","Ubalá","Ubaque","Ubaté","Une","Útica","Venecia","Vergara","Vianí","Villagómez","Villapinzón","Villeta","Viotá","Yacopí","Zipacón","Zipaquirá"],Guainía:["Barranco Minas","Cacahual","Inírida","La Guadalupe","Mapiripana","Morichal","Pana Pana","Puerto Colombia","San Felipe"],Guaviare:["Calamar","El Retorno","Miraflores","San José del Guaviare"],Huila:["Acevedo","Agrado","Aipe","Algeciras","Altamira","Baraya","Campoalegre","Colombia","Elías","Garzón","Gigante","Guadalupe","Hobo","Iquira","Isnos","La Argentina","La Plata","Nátaga","Neiva","Oporapa","Paicol","Palermo","Palestina","Pital","Pitalito","Rivera","Saladoblanco","San Agustín","Santa María","Suaza","Tarqui","Tello","Teruel","Tesalia","Timaná","Villavieja","Yaguará"],"La Guajira":["Albania","Barrancas","Dibulla","Distracción","El Molino","Fonseca","Hatonuevo","La Jagua del Pilar","Maicao","Manaure","Riohacha","San Juan del Cesar","Uribia","Urumita","Villanueva"],Magdalena:["Algarrobo","Aracataca","Ariguaní","Cerro San Antonio","Chibolo","Ciénaga","Concordia","El Banco","El Piñón","El Reten","Fundación","Guamal","Nueva Granada","Pedraza","Pijiño del Carmen","Pivijay","Plato","Pueblo Viejo","Remolino","Sabanas de San Ángel","Salamina","San Sebastián de Buenavista","San Zenón","Santa Ana","Santa Bárbara de Pinto","Santa Marta","Sitionuevo","Tenerife","Zapayán","Zona Bananera"],Meta:["Acacías","Barranca de Upía","Cabuyaro","Castilla la Nueva","Cumaral","El Calvario","El Castillo","El Dorado","Fuente de Oro","Granada","Guamal","La Macarena","La Uribe","Lejanías","Mapiripán","Mesetas","Puerto Concordia","Puerto Gaitán","Puerto Lleras","Puerto López","Puerto Rico","Restrepo","San Carlos Guaroa","San Juan de Arama","San Juanito","San Luis de Cubarral","San Martín","Villavicencio","Vista Hermosa"],Nariño:["Albán","Aldana","Ancuyá","Arboleda","Barbacoas","Belén","Buesaco","Chachagüí","Colón","Consacá","Contadero","Córdoba","Cuaspud","Cumbal","Cumbitara","El Charco","El Peñol","El Rosario","El Tablón de Gómez","El Tambo","Francisco Pizarro","Funes","Guachucal","Guaitarilla","Gualmatán","Iles","Imues","Ipiales","La Cruz","La Florida","La Llanada","La Tola","La Unión","Leiva","Linares","Los Andes","Magüí Payán","Mallama","Mosquera","Nariño","Olaya Herrera","Ospina","Pasto","Policarpa","Potosí","Providencia","Puerres","Pupiales","Ricaurte","Roberto Payán","Samaniego","San Bernardo","San Lorenzo","San Pablo","San Pedro de Cartago","Sandoná","Santa Bárbara","Santa Cruz","Sapuyes","Taminango","Tangua","Tumaco","Túquerres","Yacuanquer"],"Norte de Santander":["Abrego","Arboledas","Bochalema","Bucarasica","Cachirá","Cácota","Chinácota","Chitagá","Convención","Cúcuta","Cucutilla","Durania","El Carmen","El Tarra","El Zulia","Gramalote","Hacarí","Herrán","La Esperanza","La Playa","Labateca","Los Patios","Lourdes","Mutiscua","Ocaña","Pamplona","Pamplonita","Puerto Santander","Ragonvalia","Salazar","San Calixto","San Cayetano","Santiago","Sardinata","Silos","Teorama","Tibú","Toledo","Villa Caro","Villa del Rosario"],Putumayo:["Colón","Mocoa","Orito","Puerto Asís","Puerto Caicedo","Puerto Guzmán","Puerto Leguizamo","San Francisco","San Miguel","Santiago","Sibundoy","Valle del Guamuez","Villa Garzón"],Quindío:["Armenia","Buenavista","Calarcá","Circasia","Córdoba","Filandia","Génova","La Tebaida","Montenegro","Pijao","Quimbaya","Salento"],Risaralda:["Apía","Balboa","Belén de Umbría","Dosquebradas","Guática","La Celia","La Virginia","Marsella","Mistrató","Pereira","Pueblo Rico","Quinchía","Santa Rosa de Cabal","Santuario"],"San Andrés y Providencia":["Providencia y Santa Catalina","San Andrés"],Santander:["Aguada","Albania","Aratoca","Barbosa","Barichara","Barrancabermeja","Betulia","Bolívar","Bucaramanga","Cabrera","California","Capitanejo","Carcasí","Cepitá","Cerrito","Charalá","Charta","Chima","Chipatá","Cimitarra","Concepción","Confines","Contratación","Coromoro","Curití","El Carmen de Chucurí","El Guacamayo","El Peñón","El Playón","Encino","Enciso","Florián","Floridablanca","Galán","Gambita","Girón","Guaca","Guadalupe","Guapotá","Guavatá","Güepsa","Hato","Jesús María","Jordán","La Belleza","La Paz","Landázuri","Lebríja","Los Santos","Macaravita","Málaga","Matanza","Mogotes","Molagavita","Ocamonte","Oiba","Onzaga","Palmar","Palmas del Socorro","Páramo","Piedecuesta","Pinchote","Puente Nacional","Puerto Parra","Puerto Wilches","Rionegro","Sabana de Torres","San Andrés","San Benito","San Gil","San Joaquín","San José de Miranda","San Miguel","San Vicente de Chucurí","Santa Bárbara","Santa Helena del Opón","Simacota","Socorro","Suaita","Sucre","Surata","Tona","Valle de San José","Vélez","Vetas","Villanueva","Zapatoca"],Sucre:["Buenavista","Caimito","Chalán","Coloso","Corozal","Coveñas","El Roble","Galeras","Guaranda","La Unión","Los Palmitos","Majagual","Morroa","Ovejas","Palmito","Sampués","San Benito Abad","San Juan Betulia","San Marcos","San Onofre","San Pedro","Santiago de Tolú","Sincé","Sincelejo","Sucre","Tolú Viejo"],Tolima:["Alpujarra","Alvarado","Ambalema","Anzoátegui","Armero","Ataco","Cajamarca","Carmen de Apicalá","Casabianca","Chaparral","Coello","Coyaima","Cunday","Dolores","Espinal","Falan","Flandes","Fresno","Guamo","Herveo","Honda","Ibagué","Icononzo","Lérida","Líbano","Mariquita","Melgar","Murillo","Natagaima","Ortega","Palocabildo","Piedras","Planadas","Prado","Purificación","Rioblanco","Roncesvalles","Rovira","Saldaña","San Antonio","San Luis","Santa Isabel","Suárez","Valle de San Juan","Venadillo","Villahermosa","Villarrica"],"Valle del Cauca":["Alcalá","Andalucía","Ansermanuevo","Argelia","Bolívar","Buenaventura","Buga","Bugalagrande","Caicedonia","Cali","Calima","Candelaria","Cartago","Dagua","El Águila","El Cairo","El Cerrito","El Dovio","Florida","Ginebra","Guacarí","Jamundí","La Cumbre","La Unión","La Victoria","Obando","Palmira","Pradera","Restrepo","Riofrío","Roldanillo","San Pedro","Sevilla","Toro","Trujillo","Tuluá","Ulloa","Versalles","Vijes","Yotoco","Yumbo","Zarzal"],Vaupés:["Carurú","Mitú","Pacoa","Papunahua","Taraira","Yavaraté"],Vichada:["Cumaribo","La Primavera","Puerto Carreño","Santa Rosalía"]},_a=[{title:"How to answer salary questions",tag:"Interview",read:"4 min",body:"Use a confident range, anchor it to the role, and avoid apologizing for earning in USD.",actions:["Know your floor","Use monthly USD","Mention flexibility last"]},{title:"Writing a CV for US SaaS companies",tag:"CV",read:"6 min",body:"Translate local experience into metrics US hiring managers can scan in under a minute.",actions:["Lead with outcomes","Add tools","Quantify scope"]},{title:"Before your recruiter screen",tag:"Process",read:"3 min",body:"Prepare availability, compensation, English comfort, and two strong role stories.",actions:["Check your setup","Review the opening","Bring questions"]},{title:"STAR stories that feel natural",tag:"Interview",read:"5 min",body:"Keep stories specific, concise, and tied to business impact instead of job duties.",actions:["Situation","Action","Result"]}],wt=[{key:"profile-review",label:"Profile Review",help:"We are checking role fit and your candidate profile."},{key:"background-check",label:"Background Checks",help:"Nearwork is verifying relevant background and work details."},{key:"assessment",label:"Assessment",help:"Complete role-specific questions when assigned."},{key:"interview",label:"Interview",help:"Meet the recruiter and book your next conversation."},{key:"presented",label:"Presented",help:"Your profile has been prepared for the company."},{key:"client-review",label:"Client Review",help:"The company is reviewing your profile and next steps."},{key:"hired",label:"Hired",help:"Offer accepted and onboarding is ready to begin."}];let o={user:null,candidate:null,applications:[],assessments:[],notifications:[],notificationPanelOpen:!1,notificationSettingsOpen:!1,jobs:[],loading:!0,view:"login",activePage:"overview",matchesFiltered:!1,message:"",assessmentUiStep:null},oe=null;const Je=sessionStorage.getItem("nw_restore_path");Je&&(sessionStorage.removeItem("nw_restore_path"),window.history.replaceState({page:Je},"",Je));function qt(){return[["overview","layout-dashboard","Overview"],["matches","briefcase-business","Matches"],["applications","send","Applications"],["assessment","clipboard-check","Assessment"],["cvs","files","CV Picker"],["tips","book-open","Tips"],["recruiter","calendar-days","Recruiter"],["profile","user-round-cog","Profile"]]}function Fe(){const t=window.location.pathname.split("/").filter(Boolean)[0];return t==="onboarding"?"onboarding":t==="assessment"||t==="assessments"?"assessment":qt().some(([a])=>a===t)?t:"overview"}function ce(){const e=window.location.pathname.split("/").filter(Boolean);return(e[0]==="assessment"||e[0]==="assessments")&&e[1]||""}function Rt(){const e=window.location.pathname.split("/").filter(Boolean),t=e.findIndex(n=>n==="q"||n==="question");if(t===-1)return null;const a=Number(e[t+1]);return Number.isFinite(a)&&a>0?a-1:null}function qa(e,t=0){return`/assessment/${encodeURIComponent(e)}/start/q/${Number(t||0)+1}`}function he(e,t=0,a=!1){const n=qa(e,t);if(window.location.pathname===n)return;const s=a?"replaceState":"pushState";window.history[s]({page:"assessment",assessmentId:e,questionIndex:t},"",n)}function g(e,t){return`<i data-lucide="${e}" aria-label="${e}"></i>`}function ze(){window.lucide&&window.lucide.createIcons()}function $(e){o={...o,...e},Zt()}function Re(e,t=!0){const n=e==="onboarding"||qt().some(([s])=>s===e)?e:"overview";o={...o,activePage:n,matchesFiltered:n==="matches"?o.matchesFiltered:!1,message:"",assessmentUiStep:null},t&&window.history.pushState({page:n},"",n==="overview"?"/":`/${n}`),Zt()}function Dt(){var t,a;return(((t=o.candidate)==null?void 0:t.name)||((a=o.user)==null?void 0:a.displayName)||"there").split(" ")[0]||"there"}function Ra(){var t,a,n;return(((t=o.candidate)==null?void 0:t.name)||((a=o.user)==null?void 0:a.displayName)||((n=o.user)==null?void 0:n.email)||"NW").split(/[ @.]/).filter(Boolean).slice(0,2).map(s=>s[0]).join("").toUpperCase()}function Bt(e="normal"){var n,s;const t=((n=o.candidate)==null?void 0:n.photoURL)||((s=o.user)==null?void 0:s.photoURL)||"",a=e==="large"?"avatar avatar-large":"avatar";return t?`<img class="${a}" src="${S(t)}" alt="${S(Dt())}" />`:`<div class="${a}">${Ra()}</div>`}function S(e){return String(e||"").replaceAll("&","&amp;").replaceAll('"',"&quot;").replaceAll("<","&lt;").replaceAll(">","&gt;")}function q(e){return String(e||"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;")}function Ge(e){if(!e)return"Recently";const t=e.toDate?e.toDate():new Date(e);return new Intl.DateTimeFormat("en",{month:"short",day:"numeric"}).format(t)}function $e(){var t;const e=((t=o.candidate)==null?void 0:t.skills)||[];return Array.isArray(e)?e:String(e).split(",").map(a=>a.trim()).filter(Boolean)}function G(e){return String(e||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/&/g," and ").replace(/[^a-z0-9]+/g," ").trim().replace(/\s+/g," ")}function dt(e,t=$e()){const a=ge(e),n=new Set((a.skills||[]).map(G).filter(Boolean)),s=new Map(t.map(i=>[G(i),i]).filter(([i])=>i));return[...s.keys()].filter(i=>n.has(i)).map(i=>s.get(i))}function ut(e){return["Nearwork candidate","Talent member"].includes(String(e||"").trim())}function St(e){if(!e)return null;if(e.toDate)return e.toDate();if(typeof e=="object"&&typeof e.seconds=="number")return new Date(e.seconds*1e3);const t=new Date(e);return Number.isNaN(t.getTime())?null:t}function pt(e){return Number(e||1)===1?"Technical Assessment":"DISC Assessment"}function We(e,t){var a,n,s;return((n=(a=e==null?void 0:e.answers)==null?void 0:a[t==null?void 0:t.id])==null?void 0:n.value)??((s=e==null?void 0:e.answers)==null?void 0:s[t==null?void 0:t.id])??""}function be(e){return e!=null&&e!==""}function K(e,t){return((e==null?void 0:e.questions)||[]).slice(0,70).filter(a=>Number(a.stage||1)===Number(t))}function tt(e,t,a=(e==null?void 0:e.answers)||{}){return K(e,t).filter(n=>{var s;return!be(((s=a[n.id])==null?void 0:s.value)??a[n.id])})}function Da(){var e,t;return!!((o.applications||[]).length||(((e=o.candidate)==null?void 0:e.pipelineCodes)||[]).length||(t=o.candidate)!=null&&t.pipelineCode)}function Ba(){var n,s,i;const e=((n=o.candidate)==null?void 0:n.department)||"Bogotá D.C.",t=ie[e]||ie["Bogotá D.C."]||["Bogotá"],a=((s=o.candidate)==null?void 0:s.city)||((i=o.candidate)==null?void 0:i.locationCity)||t[0];return{department:e,city:a,label:`${a}, ${e}`}}function Ua(){var t,a,n;const e=((t=o.candidate)==null?void 0:t.targetRole)||((a=o.candidate)==null?void 0:a.headline)||"";return((n=Object.entries(we).find(([,s])=>s.includes(e)))==null?void 0:n[0])||Object.keys(we)[0]}function Ut(e){return Object.keys(we).map(t=>`<option value="${S(t)}" ${t===e?"selected":""}>${t}</option>`).join("")}function He(e,t){const a=we[e]||Object.values(we).flat();return['<option value="">Choose the closest role</option>'].concat(a.map(n=>`<option value="${S(n)}" ${t===n?"selected":""}>${n}</option>`)).join("")}function fe(e){const t=String(e||"").replace(/[,.\s]+$/,"").replace(/^[,.\s]+/,"").trim();if(!t||t.length<2)return"";const a=_t.find(n=>G(n)===G(t));return a||t.split(/\s+/).map(n=>n.length<=3&&n===n.toUpperCase()?n:n.charAt(0).toUpperCase()+n.slice(1).toLowerCase()).join(" ")}function Ft(e){const t=[...new Set((e||[]).map(fe).filter(Boolean))],a=["Customer Service","Salesforce","HubSpot","Excel","Google Sheets","Technical Support","Outbound Calls","React","SQL","Payroll"];return`
    <div class="skill-search-shell" data-skill-search>
      <div class="selected-skills" id="selectedSkills">
        ${t.map(n=>`
          <span class="selected-skill" data-skill-chip="${S(n)}">
            ${q(n)}
            <button type="button" class="skill-remove" data-remove-skill="${S(n)}" aria-label="Remove ${S(n)}">×</button>
            <input type="hidden" name="skills" value="${S(n)}" />
          </span>
        `).join("")||'<span class="skill-empty">Selected skills will appear here.</span>'}
      </div>
      <div class="skill-search-box">
        <input id="skillSearchInput" type="search" autocomplete="off" placeholder="Type any skill — e.g. Salesforce, Excel, B2B sales, Canva…" />
        <button class="secondary-action" type="button" id="addTypedSkill">Add skill</button>
      </div>
      <div class="skill-suggestions" id="skillSuggestions">
        ${a.map(n=>`<button type="button" class="skill-suggestion" data-skill="${S(n)}">${q(n)}</button>`).join("")}
      </div>
      <p class="field-hint">Select between 5 and 20 skills that best describe your experience.</p>
    </div>
  `}function Ot(e,t="USD"){const a=Number(String(e||"").replace(/[^\d.]/g,"")),n=String(t||"USD").toUpperCase()==="COP"?"COP":"USD";if(!Number.isFinite(a)||a<=0)return{salary:"",salaryUSD:null,salaryCurrency:n,salaryAmount:null};const s=Math.round(a),i=n==="COP"?"es-CO":"en-US";return{salary:`$${new Intl.NumberFormat(i).format(s)} ${n}/mo`,salaryUSD:n==="USD"?s:null,salaryCurrency:n,salaryAmount:s}}function jt(e){return Number(String(e||"").replace(/[^\d.]/g,""))}function Ct(e,t="USD"){const a=jt(e),n=String(t||"USD").toUpperCase()==="COP"?"COP":"USD";return n==="USD"&&a>=1e5?"COP":n}function $t(e,t="USD"){const a=jt(e);return!Number.isFinite(a)||a<=0?"":new Intl.NumberFormat("en-US",{maximumFractionDigits:0}).format(Math.round(a))}function zt(e){return Array.isArray(e)?e:String(e||"").split(",").map(t=>t.trim()).filter(Boolean)}function ge(e){const t=zt(e.skills||e.requiredSkills);return{id:e.id||e.code,code:e.code||e.id,title:e.title||e.role||e.openingTitle||"Open role",orgName:e.orgName||e.company||e.clientName||"Nearwork client",location:e.location||"Remote",compensation:e.compensation||e.salary||e.rate||"Competitive",match:e.match||null,skills:t,description:e.description||e.about||"Nearwork is reviewing candidates for this role now."}}function de(e){const t=(e==null?void 0:e.code)||"";return t.includes("operation-not-allowed")?"This sign-in method is not available yet.":t.includes("unauthorized-domain")?"This website still needs to be approved for sign-in.":t.includes("permission-denied")?"We could not save this yet. Please try again in a moment or contact Nearwork support.":t.includes("weak-password")?"Password must be at least 6 characters.":t.includes("invalid-credential")||t.includes("wrong-password")?"That email/password did not match. If this account was created with Google, use Continue with Google.":t.includes("user-not-found")?"No account exists for that email yet.":t.includes("email-already-in-use")?"That email already has an account. Sign in or use Google.":t.includes("popup")?"The Google sign-in popup was closed before finishing.":"Something went wrong. Please try again or contact Nearwork support."}function Fa(e){ct.innerHTML=`
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
  `,ze()}function Gt(e="login"){var a;const t=e==="signup";Fa(`
    <section class="auth-panel">
      <div class="right-brand">Near<span>work</span></div>
      <div class="candidate-chip">For candidates</div>
      <div class="panel-heading">
        <h2>${t?"Create your account.":"Welcome back."}</h2>
        <p>${t?"Create your profile, browse roles, and track your application.":"Use Google if your candidate account was created with Google."}</p>
      </div>
      ${o.message?`<div class="notice">${g("lock")} ${S(o.message)}</div>`:""}
      ${ue?"":`<div class="notice">${g("triangle-alert")} Sign-in is still being set up.</div>`}
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
  `),document.querySelector("#toggleMode").addEventListener("click",()=>Gt(t?"login":"signup")),document.querySelectorAll("[data-password-toggle]").forEach(n=>{n.addEventListener("click",()=>{const s=n.previousElementSibling,i=s.type==="password";s.type=i?"text":"password",n.innerHTML=g(i?"eye-off":"eye"),n.setAttribute("aria-label",i?"Hide password":"Show password"),ze()})}),document.querySelector("#googleSignIn").addEventListener("click",async()=>{var i;const n=document.querySelector("#formMessage");if(n.textContent="",t){const l=document.querySelector("#privacyConsent"),d=document.querySelector("#privacyConsentError");if(l&&!l.checked){d&&(d.style.display=""),n.textContent="Please accept the Privacy Policy to continue.",l.scrollIntoView({behavior:"smooth",block:"center"});return}d&&(d.style.display="none")}const s=t?((i=document.querySelector("#marketingConsent"))==null?void 0:i.checked)===!0:!1;try{await ya(s)}catch(l){n.textContent=de(l)}}),(a=document.querySelector("#resetPassword"))==null||a.addEventListener("click",async()=>{const n=document.querySelector("input[name='email']").value.trim().toLowerCase(),s=document.querySelector("#formMessage");if(!n){s.textContent="Enter your email first, then request a reset link.";return}try{await sa(O,n),s.textContent=`Password reset sent to ${n}.`}catch(i){s.textContent=de(i)}}),document.querySelector("#authForm").addEventListener("submit",async n=>{var r;n.preventDefault();const s=new FormData(n.currentTarget),i=document.querySelector("#formMessage"),l=String(s.get("email")).trim().toLowerCase();if(i.textContent="",t){const u=document.querySelector("#privacyConsent"),p=document.querySelector("#privacyConsentError");if(u&&!u.checked){p&&(p.style.display=""),i.textContent="Please accept the Privacy Policy to continue.";return}p&&(p.style.display="none")}const d=t?((r=document.querySelector("#marketingConsent"))==null?void 0:r.checked)===!0:!1,c=new Date().toISOString();try{if(t){const u=await ia(O,l,s.get("password"));await oa(u.user,{displayName:s.get("name")}),sessionStorage.setItem("nw_new_account","1"),await st(u.user.uid,{name:s.get("name"),email:l,availability:"open",headline:"Nearwork candidate",onboarded:!1,source:"talent.nearwork.co",privacyConsent:!0,privacyConsentAt:c,marketingConsent:d,marketingConsentAt:d?c:null}),Et({name:s.get("name"),firstName:String(s.get("name")||"").trim().split(/\s+/)[0],email:l}).catch(()=>null)}else await ra(O,l,s.get("password"))}catch(u){i.textContent=de(u)}})}async function Ht(e){$({loading:!0,user:e});try{const[t,a,n]=await Promise.allSettled([Mt(e),ba(e.uid),It()]),s=t.status==="fulfilled"?t.value:null,i=a.status==="fulfilled"?a.value:[],l=n.status==="fulfilled"?n.value:[];let d=[];try{d=await wa(e.uid,e.email,(s==null?void 0:s.candidateCode)||(s==null?void 0:s.code)||"")}catch(w){console.warn(w)}const c=ce();if(c&&!d.some(w=>w.id===c)){const w=await Sa(c,e.uid,e.email,(s==null?void 0:s.candidateCode)||(s==null?void 0:s.code)||"").catch(()=>null);w&&(d=[w,...d])}const r=sessionStorage.getItem("nw_new_account")==="1";r&&sessionStorage.removeItem("nw_new_account");const u=!(s!=null&&s.onboarded)&&!(s!=null&&s.targetRole);!(s!=null&&s.onboarded)&&(s==null?void 0:s.targetRole)&&it(e.uid,{onboarded:!0,candidateCode:s==null?void 0:s.candidateCode}).catch(()=>null);const f=r||u?"onboarding":Fe();$({candidate:{...s||{},name:(s==null?void 0:s.name)||e.displayName||"Talent member",email:(s==null?void 0:s.email)||e.email,availability:(s==null?void 0:s.availability)||"open",headline:(s==null?void 0:s.headline)||(s==null?void 0:s.targetRole)||"Nearwork candidate"},applications:i,assessments:d,jobs:l.map(ge),loading:!1,view:"dashboard",activePage:f,message:""}),oe&&oe(),ue&&(oe=Pa(e.uid,w=>{o.notifications=w,o.view==="dashboard"&&!o.message&&Qt()}))}catch(t){console.warn(t),$({candidate:{name:e.displayName||"Talent member",email:e.email,availability:"open",headline:"Nearwork candidate"},applications:[],assessments:[],jobs:[],loading:!1,view:"dashboard",activePage:Fe(),message:""})}}async function De(){const e=Fe();if(e==="assessment"){sessionStorage.setItem("nw_restore_path",window.location.pathname),$({user:null,candidate:null,applications:[],assessments:[],jobs:[],loading:!1,view:"login",activePage:"overview",message:"Please log in to open your assessment."});return}if(e==="overview"){oe&&oe(),oe=null,$({user:null,candidate:null,loading:!1,view:"login",activePage:"overview"});return}let t=[];try{const a=await It();a.length&&(t=a.map(ge))}catch(a){console.warn(a)}$({user:null,candidate:null,applications:[],assessments:[],jobs:t,loading:!1,view:"login",activePage:"overview",message:"Please log in to view your profile, matched openings, applications, and assessments."})}function Oa(){return[{label:"My journey",items:[["overview","layout-dashboard","Overview"],["applications","send","Applications"],["assessment","clipboard-check","Assessment"]]},{label:"My search",items:[["matches","briefcase-business","Matches"],["cvs","files","CV Picker"]]},{label:"Support",items:[["tips","book-open","Tips"],["recruiter","calendar-days","Recruiter"],["profile","user-round-cog","Profile"]]}]}function ja(){var e;return{open:"Open to roles",interviewing:"Interviewing",paused:"Not looking"}[((e=o.candidate)==null?void 0:e.availability)||"open"]||"Open to roles"}function Vt(){const e=o.candidate||{},t=$e();return[{id:"name",label:"Full name",done:!!e.name},{id:"role",label:"Target role",done:!!(e.targetRole||!ut(e.headline)&&e.headline)},{id:"location",label:"City",done:!!e.city},{id:"salary",label:"Salary",done:!!(e.salaryAmount||e.salary)},{id:"english",label:"English",done:!!e.english},{id:"whatsapp",label:"WhatsApp",done:!!(e.whatsapp||e.phone)},{id:"skills",label:"Skills (5-20)",done:t.length>=5},{id:"cv",label:"CV",done:!!e.cvUrl}]}function Qt(){var l,d,c,r,u;const e=(o.notifications||[]).filter(p=>!p.read).length,t=((l=o.candidate)==null?void 0:l.availability)||"open",n={open:"#16A085",interviewing:"#EAB308",paused:"#9E9E9E"}[t]||"#16A085",s=((d=o.candidate)==null?void 0:d.name)||((c=o.user)==null?void 0:c.displayName)||"Talent member",i=((r=o.candidate)==null?void 0:r.headline)||((u=o.candidate)==null?void 0:u.targetRole)||"Nearwork candidate";ct.innerHTML=`
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
          ${Bt()}
          <div class="nw-sidebar-profile-text">
            <div class="nw-sidebar-profile-name">${q(s)}</div>
            <div class="nw-sidebar-profile-role">${q(i)}</div>
          </div>
        </div>

        <!-- Nav sections -->
        <nav class="nw-sidebar-nav">
          ${Oa().map(p=>`
            <div class="nw-nav-group">
              <div class="nw-nav-group-label">${p.label}</div>
              ${p.items.map(([f,w,T])=>`
                <button class="nw-nav-item${o.activePage===f?" active":""}" data-page="${f}" type="button">
                  ${g(w)} ${T}
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
              <span class="nw-avail-dot" style="background:${n};box-shadow:0 0 0 3px ${n}26;"></span>
              <span class="nw-avail-label">${ja()}</span>
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
              ${o.notificationPanelOpen?Ga():""}
            </div>
            <button class="nw-icon-btn" type="button" id="notificationSettings" aria-label="Settings">
              ${g("settings")}
            </button>
          </div>
        </div>

        <!-- Notification settings -->
        ${o.notificationSettingsOpen?Ha():""}

        <!-- Page content -->
        ${o.message?`<div class="notice" style="margin:0 36px;">${o.message}</div>`:""}
        <div class="nw-page-content">
          ${(()=>{try{return Ja()}catch(p){return console.error("renderActivePage error:",p),'<div class="notice">Page failed to render. <button type="button" data-page="overview">Go to overview</button></div>'}})()}
        </div>
      </section>
    </main>
  `,ze(),Nn(),Qa(),Va()}function za(e){return(e!=null&&e.toDate?e.toDate():new Date(e||Date.now())).toLocaleString("en-US",{month:"short",day:"numeric",year:"numeric",hour:"numeric",minute:"2-digit"})}function Ga(){const e=(o.notifications||[]).slice(0,10);return`
    <div class="notification-panel">
      <div class="notification-panel-head"><strong>Notifications</strong><span>${e.length?"Latest updates":"All clear"}</span></div>
      ${e.length?e.map(t=>`
        <button class="notification-item ${t.read?"":"unread"}" type="button" data-notification-read="${t.id}">
          <strong>${S(t.title||"Nearwork update")}</strong>
          <span>${S(t.message||"")}</span>
          <time>${za(t.createdAt)}</time>
        </button>
      `).join(""):'<div class="notification-empty">No notifications yet.</div>'}
    </div>
  `}function Ha(){var a;const e=((a=o.candidate)==null?void 0:a.notificationPreferences)||{};return`
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
  `}let _e=null;function Va(){_e&&window.clearInterval(_e);const e=document.querySelector("#assessmentTimer");if(!e)return;const t=new Date(e.dataset.end||"").getTime(),a=()=>{const n=Math.max(0,t-Date.now()),s=Math.floor(n/1e3),i=Math.floor(s/60),l=String(s%60).padStart(2,"0");e.textContent=`${i}:${l}`,e.classList.toggle("is-low",n<=10*60*1e3),n<=0&&window.clearInterval(_e)};a(),_e=window.setInterval(a,1e3)}function Qa(){if(o.activePage!=="assessment")return;const e=o.assessments||[],t=ce(),n=(t?e.find(i=>i.id===t):null)||e.find(i=>["sent","started"].includes(String(i.status||"").toLowerCase()));if(!(n!=null&&n.id))return;const s=String(n.status||"").toLowerCase();if(s==="started"&&Rt()===null){he(n.id,Number(n.currentQuestionIndex||0),!0);return}if(!t&&s==="sent"){const i=`/assessment/${encodeURIComponent(n.id)}/start`;window.history.replaceState({page:"assessment",assessmentId:n.id},"",i)}}function Ja(){return({onboarding:Wa,overview:kt,matches:tn,applications:an,assessment:nn,cvs:hn,tips:yn,recruiter:bn,profile:wn}[o.activePage]||kt)()}function kt(){var k,M;const e=Jt(),t=Vt(),a=t.filter(C=>C.done).length,n=t.length,s=o.applications||[],i=s.filter(C=>["action-needed","interview-scheduled","assessment-sent"].includes(String(C.status||"").toLowerCase())).length,l=(o.jobs||[]).slice(0,3),d=((k=o.candidate)==null?void 0:k.recruiter)||{},c=2*Math.PI*52,r=c*(1-e/100),p=new Date().toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"}),f=(C,v,m,h,b)=>`
    <div class="nw-stat-tile">
      <div class="nw-stat-tile-top">
        <span class="nw-stat-tile-label">${C}</span>
        <div class="nw-stat-icon" style="background:${h}14;">
          ${g(b)}
        </div>
      </div>
      <div class="nw-stat-value">${v}</div>
      <div class="nw-stat-sub">${m}</div>
    </div>`,w=(C,v)=>{const m=["Applied","Assessment","Interview","Final round","Offer"],h=String(C.stage||C.status||"applied").toLowerCase(),b=h.includes("offer")?4:h.includes("final")?3:h.includes("interview")?2:h.includes("assessment")?1:0,y=C.clientName||C.company||"Nearwork client",A=y.split(/\s+/).slice(0,2).map(N=>N[0]).join("").toUpperCase(),_=["#16A085","#AF7AC5","#E74C7C","#3B82F6","#EAB308"],D=_[y.length%_.length];return`
      <div class="nw-app-row${v?" last":""}">
        <div class="nw-app-avatar" style="background:${D};">${A}</div>
        <div class="nw-app-info">
          <div class="nw-app-title">${q(C.jobTitle||C.title||"Application")} <span class="nw-app-company">· ${q(y)}</span></div>
          <div class="nw-app-stages">
            ${m.map((N,E)=>`<div class="nw-stage-pip${E<=b?" done":""}"></div>`).join("")}
            <span class="nw-app-stage-label">${C.stage||C.status||"Applied"}</span>
          </div>
        </div>
        <div class="nw-app-meta">
          <span class="nw-app-status${i?" action":""}">${C.status||"In review"}</span>
          <div class="nw-app-date">${Ge(C.updatedAt||C.createdAt)}</div>
        </div>
        ${g("chevron-right")}
      </div>`},T=C=>{const v=ge(C),m=dt(v),h=v.match||(m.length>=3?Math.min(97,70+m.length*4):null),b=["#16A085","#AF7AC5","#E74C7C","#3B82F6"],y=b[v.orgName.length%b.length],A=v.orgName.split(/\s+/).slice(0,2).map(D=>D[0]).join("").toUpperCase(),_=`https://jobs.nearwork.co/apply?code=${encodeURIComponent(v.code)}`;return`
      <div class="nw-match-card">
        <div class="nw-match-card-top">
          <div class="nw-match-avatar" style="background:${y};">${A}</div>
          ${h?`<div class="nw-match-score">${h}%</div>`:""}
        </div>
        <div class="nw-match-role">${q(v.title)}</div>
        <div class="nw-match-company">${q(v.orgName)} · ${q(v.location)}</div>
        ${m.length?`<div class="nw-match-why">${m.slice(0,3).map(q).join(" · ")} match</div>`:`<div class="nw-match-why">${q(v.description).slice(0,80)}…</div>`}
        <div class="nw-match-footer">
          <span class="nw-match-salary">${q(v.compensation)}</span>
          <a href="${_}" target="_blank" rel="noreferrer" class="nw-match-apply">Apply ${g("arrow-right")}</a>
        </div>
      </div>`};return`
    <!-- Greeting -->
    <div class="nw-overview-header">
      <div class="nw-overview-date">Overview · ${p}</div>
      <h1 class="nw-overview-greeting">
        Hi ${q(Dt())},
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
        <h2 class="nw-readiness-title">${a>=n?"Your profile is complete — you're ready to match.":`${n-a} more step${n-a>1?"s":""} and Nearwork can boost your matches.`}</h2>
        <div class="nw-readiness-checklist">
          ${t.map(C=>`
            <div class="nw-check-pill${C.done?" done":""}">
              ${g(C.done?"check":"circle")} ${C.label}
            </div>`).join("")}
        </div>
        <div class="nw-readiness-actions">
          <button class="nw-finish-btn" type="button" data-page="profile">
            ${a>=n?"View profile":"Finish profile"} ${g("arrow-right")}
          </button>
          <span class="nw-readiness-count">${a} of ${n} complete</span>
        </div>
      </div>
    </div>

    <!-- Stat tiles -->
    <div class="nw-stat-grid">
      ${f("Open matches",o.jobs.length,o.jobs.length?`${o.jobs.length} role${o.jobs.length>1?"s":""} waiting`:"Complete profile to unlock","#16A085","sparkles")}
      ${f("Applications",s.length,s.length?`${i||"0"} need your input`:"Not applied yet","#AF7AC5","send")}
      ${f("Interviews",s.filter(C=>String(C.stage||C.status||"").toLowerCase().includes("interview")).length,"Scheduled","Not yet scheduled","#E74C7C")}
      ${f("CVs saved",(((M=o.candidate)==null?void 0:M.cvLibrary)||[]).length,"In your library","Upload your first CV","#555555")}
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
          ${s.length?`<button class="nw-ghost-btn" type="button" data-page="applications">All applications ${g("arrow-right")}</button>`:""}
        </div>
        ${s.length?s.slice(0,4).map((C,v)=>w(C,v===Math.min(s.length,4)-1)).join(""):`<div class="nw-empty">
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
          ${l.map(C=>T(C)).join("")}
        </div>
      </section>
    `:""}
  `}function Wa(){lt=1;const e=o.candidate||{},t=String(e.name||"").trim().split(/\s+/).filter(Boolean);return x={roleGroup:e.roleGroup||"",targetRole:e.targetRole||"",department:e.department||e.locationDepartment||"",city:e.city||e.locationCity||"",english:e.english||"",firstName:e.firstName||t[0]||"",lastName:e.lastName||t.slice(1).join(" ")||"",phone:e.phone||e.whatsapp||"",currentRole:e.currentRole||"",expectedSalaryUSD:e.expectedSalaryUSD||(e.salaryCurrency!=="COP"?e.salaryAmount:null)||"",expectedSalaryCOP:e.expectedSalaryCOP||(e.salaryCurrency==="COP"?e.salaryAmount:null)||"",linkedin:e.linkedin||"",experience:Array.isArray(e.workHistory)?e.workHistory.map(a=>({...a})):[],languages:Array.isArray(e.languages)?[...e.languages]:[],skills:Array.isArray(e.skills)?[...e.skills]:[],certifications:Array.isArray(e.certifications)?e.certifications.map(a=>({...a})):[]},X=null,Me=null,R=null,'<div id="onboardingWizard" class="onb-shell"></div>'}function Ya(){document.querySelector("#onboardingWizard")&&Te(lt)}function Te(e){lt=e;const t=document.querySelector("#onboardingWizard");t&&(t.innerHTML=Za(e),Xa(e))}function Ye(e){return`
    <div style="display:flex;align-items:center;gap:5px;margin-bottom:28px;">
      ${Array.from({length:3},(a,n)=>`
        <div style="height:5px;border-radius:3px;flex:${n<e?2:1};background:${n<e?"var(--green)":"var(--border)"};transition:all .3s;"></div>
      `).join("")}
      <span style="margin-left:6px;font-size:11px;font-weight:600;color:var(--light);white-space:nowrap;">${e<=3?`${e} / 3`:"Review"}</span>
    </div>`}function W(e,t,a){return`<label style="display:flex;flex-direction:column;gap:5px;font-size:11px;font-weight:600;letter-spacing:.07em;text-transform:uppercase;color:var(--light);">${e}${t?'<span style="font-weight:400;font-size:10px;text-transform:none;letter-spacing:0;opacity:.7;">(optional)</span>':""} ${a}</label>`}function le(e,t,a,n,s=""){return`<input id="${e}" type="${t}" value="${S(a||"")}" placeholder="${S(n)}" ${s} style="font-size:14px;padding:10px 12px;border:1.5px solid var(--border);border-radius:8px;background:#fff;outline:none;width:100%;box-sizing:border-box;" />`}function xt(e,t){return`<div style="display:flex;justify-content:space-between;align-items:center;margin-top:28px;">
    ${e?'<button type="button" id="onbBack" class="secondary-action">← Back</button>':"<span></span>"}
    <button type="button" id="onbNext" class="primary-action">${t||"Continue →"}</button>
  </div>`}function Za(e){var a,n,s,i;const t=x;switch(e){case 1:{const l=!!X;return`
        <div class="onb-step">
          ${Ye(1)}
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
        </div>`}case 2:{const l=((a=o.candidate)==null?void 0:a.email)||((n=o.user)==null?void 0:n.email)||"",d=t.phone||((R==null?void 0:R.phone)??""),c=t.currentRole||(((i=(s=R==null?void 0:R.workHistory)==null?void 0:s[0])==null?void 0:i.title)??"");return`
        <div class="onb-step">
          ${Ye(2)}
          <p class="eyebrow">Step 2 · Your profile</p>
          <h2 class="onb-heading">Tell us about yourself</h2>
          <p class="onb-sub">This is the basic information we'll use across every role you apply for.</p>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:4px;">
            ${W("First name",!1,le("onbFirstName","text",t.firstName||"","María",'autocomplete="given-name"'))}
            ${W("Last name",!1,le("onbLastName","text",t.lastName||"","García",'autocomplete="family-name"'))}
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:4px;">
            ${W("Email",!1,le("onbEmail","email",l,"","disabled"))}
            ${W("Phone",!1,le("onbPhone","tel",d,"+57 300 123 4567",'autocomplete="tel"'))}
          </div>
          ${W("Current role",!1,le("onbCurrentRole","text",c,"e.g. Customer Success Manager"))}
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:4px;">
            ${W("Expected salary — USD",!0,le("onbSalaryUSD","number",t.expectedSalaryUSD||"","2500",'min="0" step="100"'))}
            ${W("Expected salary — COP",!0,le("onbSalaryCOP","number",t.expectedSalaryCOP||"","10000000",'min="0" step="100000"'))}
          </div>
          ${W("LinkedIn",!0,le("onbLinkedin","url",t.linkedin||"","https://linkedin.com/in/..."))}
          <p id="onbBasicError" style="font-size:12px;color:#e74c3c;min-height:16px;margin:4px 0 0;"></p>
          ${xt(1)}
        </div>`}case 3:{const l=t.roleGroup||Object.keys(we)[0]||"",d=t.department||Object.keys(ie)[0]||"",c=ie[d]||[];return`
        <div class="onb-step">
          ${Ye(3)}
          <p class="eyebrow">Step 3 · Role & location</p>
          <h2 class="onb-heading">What role are you looking for, and where are you based?</h2>
          <p class="onb-sub">We use this to match you with the right openings from our clients.</p>
          <div style="display:grid;gap:12px;margin-bottom:4px;">
            ${W("Area",!1,`<select id="onbRoleGroup" style="font-size:14px;padding:10px 12px;border:1.5px solid var(--border);border-radius:8px;background:#fff;outline:none;">${Ut(l)}</select>`)}
            ${W("Role",!1,`<select id="onbTargetRole" style="font-size:14px;padding:10px 12px;border:1.5px solid var(--border);border-radius:8px;background:#fff;outline:none;">${He(l,t.targetRole||"")}</select>`)}
            ${W("Department",!1,`<select id="onbDept" style="font-size:14px;padding:10px 12px;border:1.5px solid var(--border);border-radius:8px;background:#fff;outline:none;">${Object.keys(ie).map(r=>`<option value="${S(r)}" ${r===d?"selected":""}>${q(r)}</option>`).join("")}</select>`)}
            ${W("City",!1,`<select id="onbCity" style="font-size:14px;padding:10px 12px;border:1.5px solid var(--border);border-radius:8px;background:#fff;outline:none;">${c.map(r=>`<option value="${S(r)}" ${r===t.city?"selected":""}>${q(r)}</option>`).join("")}</select>`)}
            ${W("English level",!1,`<select id="onbEnglish" style="font-size:14px;padding:10px 12px;border:1.5px solid var(--border);border-radius:8px;background:#fff;outline:none;">${["","B1","B2","C1","C2","Native"].map(r=>`<option value="${r}" ${r===t.english?"selected":""}>${r||"Select level"}</option>`).join("")}</select>`)}
          </div>
          ${xt(2,"Review →")}
        </div>`}case 4:return Ka();default:return""}}const pe="font-size:14px;padding:10px 12px;border:1.5px solid var(--border);border-radius:8px;background:#fff;outline:none;width:100%;box-sizing:border-box;",mt="flex-shrink:0;width:38px;height:38px;border:1.5px solid var(--border);border-radius:8px;background:#fff;color:var(--light);font-size:14px;cursor:pointer;";function qe(e){return`<label style="display:block;margin-bottom:8px;font-size:11px;font-weight:600;letter-spacing:.07em;text-transform:uppercase;color:var(--light);">${e}</label>`}function Ka(){var p;const e=x,t=R||{};!e.experience.length&&Array.isArray(t.workHistory)&&t.workHistory.length&&(e.experience=t.workHistory.map(f=>({company:f.company||"",title:f.title||"",from:f.from||"",to:f.to||""}))),!e.languages.length&&Array.isArray(t.languages)&&t.languages.length&&(e.languages=t.languages.filter(Boolean).map(String)),!e.skills.length&&Array.isArray(t.skills)&&t.skills.length&&(e.skills=[...new Set(t.skills.map(fe).filter(Boolean))]),!e.certifications.length&&Array.isArray(t.certifications)&&t.certifications.length&&(e.certifications=t.certifications.map(f=>({name:f.name||"",issuer:f.issuer||"",date:f.date||""})));const a=[e.firstName,e.lastName].filter(Boolean).join(" ")||((p=o.candidate)==null?void 0:p.name)||"—",n=e.targetRole||"—",s=[e.city,e.department].filter(Boolean).join(", ")||"—",i=[];e.expectedSalaryUSD&&i.push(`$${Number(e.expectedSalaryUSD).toLocaleString("en-US")} USD/mo`),e.expectedSalaryCOP&&i.push(`$${Number(e.expectedSalaryCOP).toLocaleString("es-CO")} COP/mo`);const l=i.join(" · ")||"—",d=e.english||"—",c=e.phone||"—",r=(X==null?void 0:X.name)||"",u=(f,w)=>!w||w==="—"?"":`
    <div style="display:flex;gap:16px;padding:10px 0;border-bottom:1px solid var(--border);">
      <span style="width:110px;flex-shrink:0;font-size:10px;font-weight:700;letter-spacing:.07em;text-transform:uppercase;color:var(--light);padding-top:3px;">${f}</span>
      <span style="font-size:13px;color:var(--black);line-height:1.5;">${q(String(w))}</span>
    </div>`;return`
    <div class="onb-step">
      <p class="eyebrow" style="color:var(--green);">Almost done</p>
      <h2 class="onb-heading">Does this look right?</h2>
      <p class="onb-sub" style="margin-bottom:20px;">Review your profile before we save it. You can always update it later from Settings.</p>
      <div style="border:1.5px solid var(--border);border-radius:12px;padding:2px 16px 2px;margin-bottom:24px;">
        ${u("Name",a)}
        ${u("Role",n)}
        ${u("Location",s)}
        ${u("Salary",l)}
        ${u("English",d)}
        ${u("Phone",c)}
        ${u("Current role",e.currentRole||"—")}
        ${r?u("CV",r):""}
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
        ${Ft(e.skills)}
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
    </div>`}function Oe(){const e=document.querySelector("#onbExperienceList");e&&(e.innerHTML="",x.experience.length||(e.innerHTML='<p style="font-size:12px;color:var(--light);margin:0 0 10px;">No experience added yet.</p>'),x.experience.forEach((t,a)=>{var s,i;const n=document.createElement("div");n.style.cssText="border:1.5px solid var(--border);border-radius:10px;padding:12px;margin-bottom:10px;",n.innerHTML=`
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px;">
        <input type="text" data-k="title" placeholder="Title" value="${S(t.title||"")}" style="${pe}">
        <input type="text" data-k="company" placeholder="Company" value="${S(t.company||"")}" style="${pe}">
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr auto;gap:8px;align-items:center;">
        <input type="month" data-k="from" value="${S(t.from||"")}" style="${pe}">
        <input type="month" data-k="to" value="${t.to==="present"?"":S(t.to||"")}" ${t.to==="present"?"disabled":""} style="${pe}">
        <button type="button" class="onb-list-remove" aria-label="Remove" style="${mt}">×</button>
      </div>
      <label style="display:flex;align-items:center;gap:6px;font-size:12px;color:var(--mid);margin-top:8px;">
        <input type="checkbox" data-k="current" ${t.to==="present"?"checked":""}> I currently work here
      </label>`,n.querySelectorAll('input[type="text"][data-k], input[type="month"][data-k]').forEach(l=>{l.addEventListener("input",d=>{t[d.target.dataset.k]=d.target.value})}),(s=n.querySelector('input[type="checkbox"][data-k="current"]'))==null||s.addEventListener("change",l=>{t.to=l.target.checked?"present":"",Oe()}),(i=n.querySelector(".onb-list-remove"))==null||i.addEventListener("click",()=>{x.experience.splice(a,1),Oe()}),e.appendChild(n)}))}function at(){const e=document.querySelector("#onbLanguagesList");e&&(e.innerHTML="",x.languages.length||(e.innerHTML='<p style="font-size:12px;color:var(--light);margin:0 0 10px;">No languages added yet.</p>'),x.languages.forEach((t,a)=>{const n=document.createElement("div");n.style.cssText="display:flex;gap:10px;align-items:center;margin-bottom:8px;",n.innerHTML=`
      <input type="text" value="${S(t)}" placeholder="e.g. English (B2)" style="${pe}flex:1;">
      <button type="button" class="onb-list-remove" aria-label="Remove" style="${mt}">×</button>`,n.querySelector("input").addEventListener("input",s=>{x.languages[a]=s.target.value}),n.querySelector(".onb-list-remove").addEventListener("click",()=>{x.languages.splice(a,1),at()}),e.appendChild(n)}))}function nt(){const e=document.querySelector("#onbCertificationsList");e&&(e.innerHTML="",x.certifications.length||(e.innerHTML='<p style="font-size:12px;color:var(--light);margin:0 0 10px;">No certifications added yet.</p>'),x.certifications.forEach((t,a)=>{const n=document.createElement("div");n.style.cssText="display:flex;gap:10px;align-items:flex-start;margin-bottom:8px;",n.innerHTML=`
      <div class="onb-cert-grid" style="flex:1;">
        <input type="text" data-k="name" value="${S(t.name||"")}" placeholder="Certification name" style="${pe}">
        <input type="text" data-k="issuer" value="${S(t.issuer||"")}" placeholder="Issuer" style="${pe}">
        <input type="text" data-k="date" value="${S(t.date||"")}" placeholder="Date" style="${pe}">
      </div>
      <button type="button" class="onb-list-remove" aria-label="Remove" style="${mt}">×</button>`,n.querySelectorAll("input[data-k]").forEach(s=>{s.addEventListener("input",i=>{t[i.target.dataset.k]=i.target.value})}),n.querySelector(".onb-list-remove").addEventListener("click",()=>{x.certifications.splice(a,1),nt()}),e.appendChild(n)}))}function Xa(e){var n,s,i,l,d;const t=document.querySelector("#onbBack"),a=document.querySelector("#onbNext");switch(t==null||t.addEventListener("click",()=>Te(e-1)),e){case 1:{const c=document.querySelector("#onbCvInput"),r=document.querySelector("#onbCvStatus"),u=document.querySelector("#onbSkipCv");X&&c&&(a.disabled=!1),c==null||c.addEventListener("change",()=>{var f;const p=(f=c.files)==null?void 0:f[0];p&&(X=p,r&&(r.textContent=`✓ ${p.name}`),a.disabled=!1,R=null,Me=rt(p).catch(()=>null))}),a==null||a.addEventListener("click",()=>Ze(2)),u==null||u.addEventListener("click",()=>{X=null,Me=null,Ze(2)});break}case 2:{a==null||a.addEventListener("click",()=>{var M,C,v,m,h,b,y;const c=((M=document.querySelector("#onbFirstName"))==null?void 0:M.value.trim())||"",r=((C=document.querySelector("#onbLastName"))==null?void 0:C.value.trim())||"",u=((v=document.querySelector("#onbPhone"))==null?void 0:v.value.trim())||"",p=((m=document.querySelector("#onbCurrentRole"))==null?void 0:m.value.trim())||"",f=((h=document.querySelector("#onbSalaryUSD"))==null?void 0:h.value)||"",w=((b=document.querySelector("#onbSalaryCOP"))==null?void 0:b.value)||"",T=((y=document.querySelector("#onbLinkedin"))==null?void 0:y.value.trim())||"",k=document.querySelector("#onbBasicError");if(!c||!r||!u||!p){k&&(k.textContent="Please fill in your name, phone, and current role.");return}if(!f&&!w){k&&(k.textContent="Please enter an expected salary in USD, COP, or both.");return}x.firstName=c,x.lastName=r,x.phone=u,x.currentRole=p,x.expectedSalaryUSD=f?Number(f):"",x.expectedSalaryCOP=w?Number(w):"",x.linkedin=T,Te(3)});break}case 3:{const c=document.querySelector("#onbRoleGroup"),r=document.querySelector("#onbTargetRole"),u=document.querySelector("#onbDept"),p=document.querySelector("#onbCity");c==null||c.addEventListener("change",()=>{r.innerHTML=He(c.value,"")}),u==null||u.addEventListener("change",()=>{const f=ie[u.value]||[];p.innerHTML=f.map(w=>`<option value="${S(w)}">${q(w)}</option>`).join("")}),a==null||a.addEventListener("click",()=>{var f;x.roleGroup=(c==null?void 0:c.value)||"",x.targetRole=(r==null?void 0:r.value)||"",x.department=(u==null?void 0:u.value)||"",x.city=(p==null?void 0:p.value)||"",x.english=((f=document.querySelector("#onbEnglish"))==null?void 0:f.value)||"",Ze(4)});break}case 4:{(n=document.querySelector("#onbEdit"))==null||n.addEventListener("click",()=>Te(1)),(s=document.querySelector("#onbFinish"))==null||s.addEventListener("click",en),Oe(),at(),nt(),(i=document.querySelector("#onbAddExperience"))==null||i.addEventListener("click",()=>{x.experience.push({company:"",title:"",from:"",to:""}),Oe()}),(l=document.querySelector("#onbAddLanguage"))==null||l.addEventListener("click",()=>{x.languages.push(""),at()}),(d=document.querySelector("#onbAddCertification"))==null||d.addEventListener("click",()=>{x.certifications.push({name:"",issuer:"",date:""}),nt()}),Yt();break}}}async function Ze(e){var a,n;const t=document.querySelector("#onboardingWizard");if(Me&&!R&&(t&&(t.innerHTML='<div class="onb-step"><p style="text-align:center;font-size:14px;font-weight:600;color:var(--green);padding:56px 0;">Analysing your CV…</p></div>'),R=await Me),R!=null&&R.phone&&!x.phone&&(x.phone=R.phone),R!=null&&R.name&&!x.firstName&&!x.lastName){const s=String(R.name).trim().split(/\s+/).filter(Boolean);x.firstName=s[0]||"",x.lastName=s.slice(1).join(" ")}(n=(a=R==null?void 0:R.workHistory)==null?void 0:a[0])!=null&&n.title&&!x.currentRole&&(x.currentRole=R.workHistory[0].title),Te(e)}async function en(){var a,n,s,i,l,d,c;const e=document.querySelector("#onbFinish"),t=document.querySelector("#onbFinishErr");e&&(e.disabled=!0,e.innerHTML="Saving…");try{const r=x,u=(a=o.user)==null?void 0:a.uid;if(!u)throw new Error("Not signed in");const p=r.department||"",f=r.city||"",w=Number(r.expectedSalaryUSD||0)||null,T=Number(r.expectedSalaryCOP||0)||null,k=w||T||null,M=w?"USD":T?"COP":"USD",C=k?`${M} ${k.toLocaleString()}/mo`:"",v=[...document.querySelectorAll('[data-skill-search] input[name="skills"]')].map(y=>y.value),m=[r.firstName,r.lastName].filter(Boolean).join(" ")||((n=o.candidate)==null?void 0:n.name)||((s=o.user)==null?void 0:s.displayName)||"";let h={};if(X)try{const y=await et(u,X,"");h={activeCvId:y.id,activeCvName:y.name||y.fileName,cvUrl:y.url,cvLibrary:[y]}}catch{}const b={name:m,firstName:r.firstName||"",lastName:r.lastName||"",targetRole:r.targetRole||"",headline:r.targetRole||"",currentRole:r.currentRole||"",department:p,city:f,location:[f,p].filter(Boolean).join(", "),locationCity:f,locationDepartment:p,locationCountry:"Colombia",locationId:`${String(f).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,"").replace(/[^a-z0-9]+/g,"-")}-co`,english:r.english||"",salary:C,salaryUSD:w,salaryAmount:k,salaryCurrency:M,expectedSalaryUSD:w,expectedSalaryCOP:T,expectedSalaryAmount:k,expectedSalaryCurrency:M,whatsapp:r.phone||"",phone:r.phone||"",linkedin:r.linkedin||"",skills:[...new Set(v.map(fe).filter(Boolean))],workHistory:r.experience||[],certifications:(r.certifications||[]).filter(y=>y.name&&y.name.trim()),languages:(r.languages||[]).map(y=>y.trim()).filter(Boolean),summary:(R==null?void 0:R.summary)||"",email:((i=o.candidate)==null?void 0:i.email)||((l=o.user)==null?void 0:l.email)||"",candidateCode:(d=o.candidate)==null?void 0:d.candidateCode,marketingConsent:((c=o.candidate)==null?void 0:c.marketingConsent)===!0,availability:"open",onboarded:!0,...h};await it(u,b),window.history.pushState({page:"overview"},"","/"),$({candidate:{...o.candidate,...b},activePage:"overview",message:"Welcome to Nearwork! Your profile is ready."})}catch{t&&(t.textContent="Something went wrong. Please try again."),e&&(e.disabled=!1,e.innerHTML=`${g("check")} Finish setup`)}}function tn(){var l,d,c;const e=((l=o.candidate)==null?void 0:l.targetRole)||(ut((d=o.candidate)==null?void 0:d.headline)?"":(c=o.candidate)==null?void 0:c.headline),t=$e(),a=o.jobs.map(ge).filter(r=>dt(r,t).length>=3),n=t.length>=5,s=o.matchesFiltered&&n?a:o.jobs.map(ge),i=o.matchesFiltered&&!a.length;return`
    <section class="section-block">
      <div class="section-heading">
        <div><p class="eyebrow">Openings</p><h2>${o.matchesFiltered?"Best fit from your profile":"All current openings"}</h2></div>
        <button id="filterMatches" class="secondary-action" type="button">${g(o.matchesFiltered?"list":"filter")} ${o.matchesFiltered?"Show all openings":"Filter by my role & skills"}</button>
      </div>
      <div class="match-note"><strong>${s.length}</strong> of <strong>${o.jobs.length}</strong> openings showing. Matches require <strong>3+ shared skills</strong>. Role: <strong>${e||"not set"}</strong>. Skills: <strong>${t.join(", ")||"not set"}</strong>.</div>
      <div class="job-list">${i?ht("No filtered matches yet","Add a target role and skills in Profile to improve matching."):s.map(r=>xn(r)).join("")}</div>
    </section>
  `}function an(){return`
    <section class="section-block">
      <div class="section-heading"><div><p class="eyebrow">Pipeline</p><h2>Your applications</h2></div></div>
      ${Da()?$n(Cn()):kn()}
      <div class="timeline page-gap">${o.applications.length?o.applications.map(An).join(""):ht("No applications yet","Apply to a role and your process will show here.")}</div>
    </section>
  `}function nn(){const e=ce(),t=o.assessments||[],a=t.filter(M=>["sent","started"].includes(String(M.status||"").toLowerCase())),n=t.filter(M=>String(M.status||"").toLowerCase()==="completed"),s=e?t.find(M=>M.id===e):a[0]||n[0]||null;if(o.assessmentUiStep==="techIntro"&&s)return dn(s);if(o.assessmentUiStep==="discIntro"&&s)return un(s);if(e&&!s)return`
      <div class="nw-assess-wrap nw-assess-state-page">
        <div class="nw-assess-state-card">
          <div class="nw-assess-state-icon" style="background:#FEF0F5;color:#CC3666">${g("link-2-off")}</div>
          <strong>This link isn't available</strong>
          <p>Make sure you're logged into the same account that received the assessment email. If the problem persists, reach out to your Nearwork recruiter.</p>
          <button class="primary-action fit" data-page="recruiter" type="button">${g("message-circle")} Contact support</button>
        </div>
      </div>
    `;if(!s)return`
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
    `;const i=Array.isArray(s.questions)?s.questions:[],l=String(s.status||"").toLowerCase()==="started",d=String(s.status||"").toLowerCase()==="completed",c=String(s.status||"").toLowerCase()==="cancelled",r=cn(s),u=Rt(),p=Number(s.currentQuestionIndex||0),f=Math.min(u??p,Math.max(i.length-1,0)),w=i[f],T=(w==null?void 0:w.stage)||s.currentStage||1,k=l&&!d&&!c&&!r;return`
    <div class="nw-assess-wrap">
      ${k?on(s,T,f,i):gt(s)}
      ${k?sn(s,f):""}
      <div class="nw-assess-body" id="assessmentWorkspace">
        ${d?pn(s):c?`<div class="nw-assess-state-card nw-assess-state-card--inline"><div class="nw-assess-state-icon" style="background:#F5F4F0;color:#555">${g("ban")}</div><strong>Assessment cancelled</strong><p>This assessment is no longer available. A new assigned assessment will appear here when your recruiter sends one.</p></div>`:r?`<div class="nw-assess-state-card nw-assess-state-card--inline"><div class="nw-assess-state-icon" style="background:#FEF0F5;color:#CC3666">${g("clock-x")}</div><strong>Assessment link expired</strong><p>This unique assessment link is no longer valid. Contact your Nearwork recruiter if you need a new one.</p><button class="ghost-action" data-page="recruiter" type="button">${g("message-circle")} Contact recruiter</button></div>`:rn(s,l,f)}
      </div>
      ${mn(t,s.id)}
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
  `}function sn(e,t){const a=(e.questions||[]).slice(0,70),n=K(e,1).filter(d=>be(We(e,d))).length,s=K(e,2).filter(d=>be(We(e,d))).length,i=K(e,1).length||50,l=K(e,2).length||20;return`
    <section class="assessment-progress-panel">
      <div><strong>Technical</strong><span>${n}/${i} answered</span></div>
      <div><strong>DISC</strong><span>${s}/${l} answered</span></div>
      <div class="assessment-progress-strip">
        ${a.map((d,c)=>{const r=be(We(e,d));return`<button type="button" class="${c===t?"active":""} ${r?"answered":""}" data-assessment-jump="${c}" title="${pt(d.stage)} · Q${c+1}">${c+1}</button>`}).join("")}
      </div>
    </section>
  `}function on(e,t,a,n){const s=Number(t),i=St(e.technicalStartedAt||e.startedAt)||new Date,l=St(e.discStartedAt)||new Date,d=s===1?i:l,c=Number(s===1?e.technicalMinutes||60:e.discMinutes||30),r=new Date(d.getTime()+c*60*1e3),u=s===1?"Technical":"DISC profile",p=(n||[]).filter(k=>Number(k.stage||1)===s),f=(n||[]).findIndex(k=>Number(k.stage||1)===s),w=Math.max(0,a-f),T=p.length?Math.round((w+1)/p.length*100):2;return`
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
          <span>${u} &middot; Question ${w+1} of ${p.length||(s===1?50:20)}</span>
        </div>
        <div class="nw-assess-chrome__progresstrack">
          <div class="nw-assess-chrome__progressfill" style="width:${Math.max(2,T)}%"></div>
        </div>
      </div>
      <div class="nw-timer-pill">
        ${g("timer")}
        <span id="assessmentTimer" data-end="${r.toISOString()}">${c}:00</span>
      </div>
      <button class="nw-assess-chrome__exit" type="button">${g("x")} Save &amp; exit</button>
    </div>
  `}function rn(e,t,a=null){var h,b,y;if(!t){const A=S(e.role||"Role assessment"),_=S(e.recruiterName||e.recruiter||"Nearwork"),D=Ge(e.expiresAt||e.deadline),N=K(e,1).length||50,E=K(e,2).length||20,I=Number(e.technicalMinutes||60),V=Number(e.discMinutes||30);return`
      <div class="nw-assess-welcome">
        <div class="nw-assess-welcome__header">
          <span class="nw-assess-role-chip">${g("sparkles")} ${A}</span>
          <span>Sent by ${_}${D?" &middot; expires "+D:""}</span>
        </div>
        <h2 class="nw-assess-welcome__title">Let's see how you think — and how you work.</h2>
        <p class="nw-assess-welcome__desc">This assessment has two parts: a role-knowledge check and a behavioral profile.</p>
        <div class="nw-assess-parts">
          <div class="nw-assess-part">
            <div class="nw-assess-part__blob" style="background:#E8F8F5"></div>
            <div class="nw-assess-part__icon" style="background:#E8F8F5;color:#16A085">${g("code-2")}</div>
            <span class="nw-assess-part__tag" style="color:#16A085">Part 1</span>
            <strong class="nw-assess-part__title">Technical Assessment</strong>
            <span class="nw-assess-part__sub">${N} questions &middot; ~${I} min</span>
            <p class="nw-assess-part__desc">Single-choice role scenarios. We're looking at how you think, not whether you remember definitions.</p>
          </div>
          <div class="nw-assess-part">
            <div class="nw-assess-part__blob" style="background:#F7F2FC"></div>
            <div class="nw-assess-part__icon" style="background:#F7F2FC;color:#AF7AC5">${g("compass")}</div>
            <span class="nw-assess-part__tag" style="color:#AF7AC5">Part 2</span>
            <strong class="nw-assess-part__title">DISC Profile</strong>
            <span class="nw-assess-part__sub">${E} statements &middot; ~${V} min</span>
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
    `}const n=(e.questions||[]).slice(0,70),s=Math.min(a??Number(e.currentQuestionIndex||0),Math.max(n.length-1,0)),i=n[s],l=((b=(h=e.answers)==null?void 0:h[i.id])==null?void 0:b.value)??((y=e.answers)==null?void 0:y[i.id])??"",d=Array.isArray(i.options)&&i.options.length?i.options:["Strongly agree","Agree","Neutral","Disagree"],c=n[s+1],r=c==null?void 0:c.stage,u=r&&r!==i.stage,p=tt(e,i.stage),f=u&&p.length,w=s+1>=n.length,T=w?tt(e,i.stage):[],k=!!i.multiple,M=Number(i.stage||1)===2?"nw-assess-chip--violet":"nw-assess-chip--teal",C=k?"Multi-select":"Single choice",v=S(i.part||i.type||(Number(i.stage||1)===2?"DISC":"Scenario")),m=S(i.bank||"");return`
    <form id="assessmentQuestionForm" class="nw-assess-qcard" data-current-index="${s}">
      <div class="nw-assess-qmeta">
        <span class="nw-assess-chip ${M}">${v}</span>
        ${m?`<span class="nw-assess-chip nw-assess-chip--gray">${m}</span>`:""}
        <span class="nw-assess-qtype">&middot; ${C}</span>
      </div>
      ${i.context?`<div class="nw-assess-context"><strong>Context: </strong>${S(i.context)}</div>`:""}
      <p class="nw-assess-qprompt">${S(i.q||"")}</p>
      <fieldset class="nw-assess-options${k?" nw-assess-options--multi":""}">
        <legend>${C}</legend>
        ${d.map((A,_)=>`
          <label class="nw-assess-option${k?" nw-assess-option--multi":""}">
            <input type="radio" name="answer" value="${_}" ${String(l)===String(_)?"checked":""} />
            <span class="nw-assess-option__key">${String.fromCharCode(65+_)}</span>
            <span class="nw-assess-option__text">${S(A)}</span>
            ${k?"":`<span class="nw-assess-option__check">${g("check-circle-2")}</span>`}
          </label>
        `).join("")}
      </fieldset>
      ${f||T.length?ln(e,f?p:T,i.stage):""}
      <div class="nw-assess-qfooter">
        <button class="ghost-action" id="prevAssessmentQuestion" type="button" ${s===0?"disabled":""}>${g("arrow-left")} Back</button>
        <span class="nw-assess-autosave">${g("check")} Auto-saved</span>
        <div style="flex:1"></div>
        <button class="primary-action fit" type="submit">${w?g("send")+" Submit assessment":"Next "+g("arrow-right")}</button>
      </div>
    </form>
  `}function ln(e,t,a){if(!t.length)return"";const n=(e.questions||[]).slice(0,70);return`
    <div class="nw-assess-missed">
      <strong>${g("alert-triangle")} Unanswered questions in ${pt(a)}</strong>
      <p>You skipped ${t.map(s=>`Question ${n.findIndex(i=>i.id===s.id)+1}`).join(", ")}. You can go back now or continue if you meant to leave them blank.</p>
      <div class="nw-assess-missed__links">${t.map(s=>{const i=n.findIndex(l=>l.id===s.id);return`<button class="ghost-action" type="button" data-assessment-jump="${i}">${g("arrow-left")} Go to ${i+1}</button>`}).join("")}</div>
    </div>
  `}function cn(e){return!(e!=null&&e.expiresAt)||String(e.status||"").toLowerCase()==="completed"?!1:Date.now()>new Date(e.expiresAt).getTime()}function dn(e){const t=S(e.role||"Role assessment"),a=K(e,1).length||50,n=Number(e.technicalMinutes||60);return`
    <div class="nw-assess-wrap">
      ${gt(e)}
      <div class="nw-assess-body">
        <div class="nw-assess-welcome" style="max-width:860px">
          <div style="display:inline-flex;align-items:center;gap:8px;padding:5px 12px;border-radius:999px;background:#E8F8F5;border:1px solid rgba(22,160,133,0.25);margin-bottom:4px">
            <span style="width:6px;height:6px;border-radius:50%;background:#16A085;display:inline-block"></span>
            <span style="font-size:11.5px;font-weight:600;color:#0E6B58;text-transform:uppercase;letter-spacing:0.05em">Part 1 of 2 &middot; Starting now</span>
          </div>
          <h2 class="nw-assess-welcome__title" style="font-size:2.2rem">Role knowledge check.</h2>
          <p class="nw-assess-welcome__desc">The next <strong>${a} questions</strong> are about the day-to-day of the ${t} role — scenarios, decisions, and judgement calls. We're looking at how you think, not whether you remember definitions.</p>
          <p style="font-size:0.88rem;color:#9E9E9E;margin:0">You have <strong style="color:#555">${n} minutes</strong> total. Your progress saves automatically after every question. DISC follows when you finish.</p>
          <div class="nw-assess-welcome__cta" style="margin-top:8px">
            <button class="primary-action" id="startAssessment" type="button">${g("play")} Start Part 1</button>
            <button class="ghost-action" id="backToWelcome" type="button">${g("arrow-left")} Back</button>
          </div>
        </div>
      </div>
    </div>
  `}function un(e){const t=K(e,1).length||50,a=K(e,2).length||20,n=Number(e.discMinutes||30),s=S(e.recruiterName||e.recruiter||"your recruiter"),i=(e.questions||[]).findIndex(l=>Number(l.stage||1)===2);return`
    <div class="nw-assess-wrap">
      ${gt(e)}
      <div class="nw-assess-body">
        <div style="background:#E8F8F5;border-bottom:1px solid rgba(22,160,133,0.15);padding:13px 20px;display:flex;align-items:center;gap:12px;margin-bottom:24px;border-radius:10px">
          <div style="width:26px;height:26px;border-radius:50%;background:#16A085;color:#fff;display:flex;align-items:center;justify-content:center;flex-shrink:0">${g("check")}</div>
          <div style="flex:1">
            <div style="font-size:13px;font-weight:600;color:#0E6B58">Part 1 complete — nice work.</div>
            <div style="font-size:12px;color:#12866E;margin-top:1px">${t}/${t} answered &middot; submitted to ${s} for review</div>
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
              <p class="nw-assess-part__desc">You'll see ${a} statements about how you work. For each one, pick the option that's most like you. Go with your gut — there are no right answers. Takes about ${n} minutes.</p>
            </div>
          </div>
          <div class="nw-assess-rules">
            <div class="nw-assess-rule"><div class="nw-assess-rule__icon" style="color:#AF7AC5">${g("users-round")}</div><div><strong>No right answers</strong><span>This measures style, not performance.</span></div></div>
            <div class="nw-assess-rule"><div class="nw-assess-rule__icon" style="color:#AF7AC5">${g("timer")}</div><div><strong>${n} min total</strong><span>Go with your first instinct.</span></div></div>
            <div class="nw-assess-rule"><div class="nw-assess-rule__icon" style="color:#AF7AC5">${g("shield-check")}</div><div><strong>Used for fit</strong><span>Helps match you with the right team.</span></div></div>
            <div class="nw-assess-rule"><div class="nw-assess-rule__icon" style="color:#AF7AC5">${g("check")}</div><div><strong>Auto-saved</strong><span>Progress saves on every answer.</span></div></div>
          </div>
          <div class="nw-assess-welcome__cta" style="margin-top:8px">
            <button class="primary-action" id="startDiscAssessment" data-disc-index="${i>=0?i:50}" type="button">${g("play")} Start Part 2</button>
          </div>
        </div>
      </div>
    </div>
  `}function pn(e){var l,d;const a=(((l=o.candidate)==null?void 0:l.name)||((d=o.user)==null?void 0:d.displayName)||"").split(" ")[0]||"You",n=S(e.recruiterName||e.recruiter||"your recruiter"),s=K(e,1).length||50,i=K(e,2).length||20;return`
    <div class="nw-assess-complete">
      <div class="nw-assess-complete__hero">
        <div class="nw-assess-complete__icon">
          ${g("check")}
          <div class="nw-assess-complete__ring1"></div>
          <div class="nw-assess-complete__ring2"></div>
        </div>
        <h2 class="nw-assess-complete__title">You're done, ${S(a)}.</h2>
        <p class="nw-assess-complete__desc">Your results have been sent to ${n}. They'll reach out personally — usually within a business day.</p>
      </div>
      <div class="nw-assess-complete__chips">
        <span class="nw-assess-complete__chip nw-assess-complete__chip--teal">${g("clipboard-check")} Part 1 &middot; ${s}/${s} answered</span>
        <span class="nw-assess-complete__chip nw-assess-complete__chip--violet">${g("compass")} Part 2 &middot; ${i}/${i} answered</span>
        <span class="nw-assess-complete__chip nw-assess-complete__chip--gray">${g("check-circle-2")} Assessment complete</span>
      </div>
      <div class="nw-assess-next">
        <div class="nw-assess-next__label">What happens next</div>
        ${[{icon:"inbox",title:"Your recruiter reviews your results",desc:`${n} will read your scenarios and DISC profile, usually within one business day.`,when:"Within 24h"},{icon:"message-square",title:`A personal note from ${n}`,desc:"Not an automated email. They'll share what stood out and what comes next.",when:"Tomorrow"},{icon:"calendar-check",title:"Interview with the hiring team",desc:"If there's a match, you'll get a calendar link to book a slot that works for you.",when:"This week"}].map(({icon:c,title:r,desc:u,when:p},f)=>`
          <div class="nw-assess-next__item">
            <div class="nw-assess-next__icon-wrap">
              <div class="nw-assess-next__iconbox">${g(c)}</div>
              <div class="nw-assess-next__num">${f+1}</div>
            </div>
            <div class="nw-assess-next__body">
              <div class="nw-assess-next__title">${r}</div>
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
        <button class="ghost-action" data-page="recruiter" type="button">${g("message-circle")} Message recruiter</button>
      </div>
    </div>
  `}function mn(e,t){return e.length?`
    <section class="section-block page-gap">
      <div class="section-heading"><div><p class="eyebrow">Assessment center</p><h2>Your assessment history</h2></div></div>
      <div class="assessment-history-list">
        ${e.map(a=>`
          <article class="assessment-history-row ${a.id===t?"active":""}">
            <div><strong>${S(a.role||"Nearwork assessment")}</strong><span>${S(a.id||"")}</span></div>
            <div>${S(String(a.status||"assigned"))}</div>
            <a href="/assessment/${encodeURIComponent(a.id)}/start">${a.status==="completed"?"View":"Continue"}</a>
          </article>
        `).join("")}
      </div>
    </section>
  `:""}function gn(e,t){const a=e.questions||[],n=a.filter(d=>d.stage===1),s=a.filter(d=>d.stage===2),i=n.filter(d=>{var c;return typeof d.correctIndex=="number"&&Number((c=t[d.id])==null?void 0:c.value)===d.correctIndex}).length,l=s.filter(d=>{var c;return be(((c=t[d.id])==null?void 0:c.value)??t[d.id])}).length;return{technicalScore:n.length?Math.round(i/n.length*100):0,discScore:s.length?Math.round(l/s.length*100):0}}function vn(e,t){var d,c;const a={Dominance:0,Influence:0,Steadiness:0,Conscientiousness:0};(e.questions||[]).filter(r=>Number(r.stage)===2).forEach(r=>{var w;const u=(w=t[r.id])==null?void 0:w.value;if(!be(u))return;const p=a[r.skill]!==void 0?r.skill:"Steadiness",f=Math.max(1,4-Number(u||0));a[p]+=f});const n=Object.entries(a).sort((r,u)=>u[1]-r[1]),s=((d=n[0])==null?void 0:d[0])||"Steadiness",i=((c=n[n.length-1])==null?void 0:c[0])||"Dominance";return{label:{Dominance:"D",Influence:"I",Steadiness:"S",Conscientiousness:"C"}[s]||"S",high:s,low:i,scores:a,summary:`${s} is the strongest observed DISC tendency; ${i} appears lowest based on this assessment.`}}async function fn(e,t){var c,r,u,p,f;const a="https://admin.nearwork.co/api/send-email",n=e.candidateEmail||((c=o.user)==null?void 0:c.email)||((r=o.candidate)==null?void 0:r.email),s=e.candidateName||((u=o.candidate)==null?void 0:u.name)||((p=o.user)==null?void 0:p.displayName)||"there",i=zt([e.recruiterEmail,e.stakeholderEmail,e.hiringManagerEmail].filter(Boolean).join(",")),l=[];n&&l.push(fetch(a,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({to:n,templateId:"assessment_completed_candidate",data:{name:s,role:e.role,actionUrl:"https://talent.nearwork.co/assessment",actionText:"Open assessment center"}})}));const d=i.length?i:["support@nearwork.co"];l.push(fetch(a,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({to:d,templateId:"assessment_completed_recruiter",data:{name:"Nearwork team",role:e.role,actionUrl:`https://admin.nearwork.co/assessments/${e.id}/questions`,actionText:"Review assessment",message:`${s} completed the assessment. Overall: ${t.score}%. Technical: ${t.technicalScore}%. DISC: ${((f=t.discProfile)==null?void 0:f.label)||"Submitted"}.`}})})),await Promise.allSettled(l)}function hn(){var t;const e=((t=o.candidate)==null?void 0:t.cvLibrary)||[];return`
    <section class="section-block">
      <div class="section-heading"><div><p class="eyebrow">CV picker</p><h2>Store multiple resumes</h2></div></div>
      <form id="cvForm" class="upload-box">
        ${g("upload-cloud")}<strong>Upload a CV for this role</strong><p>Save multiple versions and pick the best one for each opening.</p>
        <input name="cv" type="file" accept=".pdf,.doc,.docx" required />
        <input name="label" type="text" placeholder="CV label, e.g. CSM resume" />
        <button class="primary-action fit" type="submit">Upload CV</button>
      </form>
      <div class="cv-list">
        ${e.length?e.map(a=>`<article class="cv-item">${g("file-text")}<div><strong>${a.name||a.fileName}</strong><span>${Ge(a.uploadedAt)}</span></div>${a.url?`<a href="${a.url}" target="_blank" rel="noreferrer">Open</a>`:""}</article>`).join(""):ht("No CVs saved yet","Upload role-specific resumes here.")}
      </div>
    </section>
  `}function yn(){return`
    <section class="tips-hero"><div><p class="eyebrow">Candidate guide</p><h2>Practical prep for US SaaS interviews.</h2><p>Short, useful guidance candidates can read before recruiter screens, assessments, and client interviews.</p></div></section>
    <section class="tips-grid rich">
      ${_a.map((e,t)=>`
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
  `}function bn(){var a,n;const t=(((a=o.candidate)==null?void 0:a.recruiter)||{}).bookingUrl||((n=o.candidate)==null?void 0:n.recruiterBookingUrl)||"mailto:support@nearwork.co?subject=Nearwork%20candidate%20question";return`
    <section class="content-grid">
      <div class="section-block"><div class="section-heading"><div><p class="eyebrow">Recruiter</p><h2>Your Nearwork contact</h2></div></div>${Pn(!0)}</div>
      <div class="section-block compact"><div class="section-heading"><div><p class="eyebrow">Booking</p><h2>Schedule soon</h2></div></div><p class="muted">Ask the Nearwork recruiting team for the earliest available slot. Candidate booking links can be attached to this profile later.</p><a class="primary-action fit" href="${t}" target="_blank" rel="noreferrer">${g("calendar-plus")} Book recruiter call</a></div>
    </section>
  `}function wn(){return Sn("profile")}function j(e,t=!1){return`<span class="pf-label">${e}${t?'<span class="pf-optional">optional</span>':""}</span>`}function ee(e,t,a=""){return`
    <div class="pf-card-head">
      <div class="pf-card-icon">${g(e)}</div>
      <div class="pf-card-title">${t}</div>
      ${a?`<span class="pf-card-badge">${a}</span>`:""}
    </div>`}function vt(e,t={}){const a=e,n=(t.company||"?")[0].toUpperCase();return`
    <div class="pf-sub-card work-entry" data-work-index="${a}">
      <div class="pf-sub-card-left">
        <div class="pf-work-avatar">${n}</div>
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
      <button type="button" class="pf-remove-btn remove-work-entry" data-remove="${a}" aria-label="Remove">
        ${g("x")}
      </button>
    </div>`}function ft(e,t={}){const a=e;return`
    <div class="pf-sub-card cert-entry" data-cert-index="${a}">
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
      <button type="button" class="pf-remove-btn remove-cert-entry" data-remove="${a}" aria-label="Remove">
        ${g("x")}
      </button>
    </div>`}function Sn(e="profile"){var p,f,w,T,k,M,C,v,m,h,b,y,A,_,D,N,E;const t=$e(),a=Ba(),n=ie[a.department]||[],s=((p=o.candidate)==null?void 0:p.salaryCurrency)||"USD",i=Ot(((f=o.candidate)==null?void 0:f.salaryAmount)||((w=o.candidate)==null?void 0:w.salary)||((T=o.candidate)==null?void 0:T.salaryUSD),s),l=Ua(),d=((k=o.candidate)==null?void 0:k.targetRole)||((M=o.candidate)==null?void 0:M.headline)||"",c=Jt(),r=Vt(),u=r.filter(I=>I.done).length;return`
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
      <div class="pf-progress-label">${u} of ${r.length} sections complete</div>

      <form id="profileForm" class="pf-form">

        <!-- ── Identity ── -->
        <div class="pf-card">
          ${ee("user-round","Identity")}
          <div class="pf-identity-row">
            <div class="pf-avatar-upload">
              ${Bt("large")}
              <label class="pf-photo-btn">
                ${g("camera")} Change photo
                <input name="photo" type="file" accept="image/png,image/jpeg,image/webp" style="display:none;" />
              </label>
            </div>
            <div class="pf-field" style="flex:1;">
              ${j("Full name")}
              <input class="pf-input" name="name" value="${S(((C=o.candidate)==null?void 0:C.name)||((v=o.user)==null?void 0:v.displayName)||"")}" placeholder="Your full name" />
            </div>
          </div>
        </div>

        <!-- ── Role ── -->
        <div class="pf-card">
          ${ee("briefcase-business","Role applying for")}
          <div class="pf-field-row">
            <label class="pf-field">
              ${j("Area")}
              <select class="pf-input" name="roleGroup" id="roleGroupSelect">
                ${Ut(l)}
              </select>
            </label>
            <label class="pf-field">
              ${j("Target role")}
              <select class="pf-input" name="targetRole" id="targetRoleSelect">
                ${He(l,d)}
              </select>
            </label>
          </div>
        </div>

        <!-- ── Location ── -->
        <div class="pf-card">
          ${ee("map-pin","Location")}
          <div class="pf-field-row">
            <label class="pf-field">
              ${j("Department")}
              <select class="pf-input" name="department" id="departmentSelect">
                ${Object.keys(ie).map(I=>`<option value="${S(I)}" ${I===a.department?"selected":""}>${I}</option>`).join("")}
              </select>
            </label>
            <label class="pf-field">
              ${j("City")}
              <select class="pf-input" name="city" id="citySelect">
                ${n.map(I=>`<option value="${S(I)}" ${I===a.city?"selected":""}>${I}</option>`).join("")}
              </select>
            </label>
          </div>
        </div>

        <!-- ── Compensation ── -->
        <div class="pf-card">
          ${ee("banknote","Compensation & English")}
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
                ${["","B1","B2","C1","C2","Native"].map(I=>{var V;return`<option value="${I}" ${((V=o.candidate)==null?void 0:V.english)===I?"selected":""}>${I||"Select level"}</option>`}).join("")}
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
          ${ee("phone","Contact")}
          <div class="pf-field-row">
            <label class="pf-field">
              ${j("WhatsApp number")}
              <input class="pf-input" name="whatsapp" value="${S(((h=o.candidate)==null?void 0:h.whatsapp)||((b=o.candidate)==null?void 0:b.phone)||"")}" inputmode="tel" autocomplete="tel" placeholder="+57 300 123 4567" required />
            </label>
            <label class="pf-field">
              ${j("LinkedIn",!0)}
              <input class="pf-input" name="linkedin" value="${S(((y=o.candidate)==null?void 0:y.linkedin)||"")}" placeholder="https://linkedin.com/in/…" />
            </label>
          </div>
        </div>

        <!-- ── Skills ── -->
        <div class="pf-card">
          ${ee("sparkles","Skills",t.length?`${t.length} added`:"")}
          ${Ft(t)}
        </div>

        <!-- ── CV ── -->
        <div class="pf-card" id="profileCvCard">
          ${ee("file-text","CV")}
          <p class="pf-hint">Upload the CV you want Nearwork to use for your applications.</p>
          ${(A=o.candidate)!=null&&A.activeCvName||(_=o.candidate)!=null&&_.cvUrl?`
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
          ${ee("align-left","Summary","optional")}
          <textarea class="pf-input pf-textarea" name="summary" placeholder="Add a short note about what you do best — 2–3 sentences.">${q(((D=o.candidate)==null?void 0:D.summary)||"")}</textarea>
        </div>

        <!-- ── Work history ── -->
        <div class="pf-card" id="workHistoryCard">
          ${ee("building-2","Work experience","optional")}
          <p class="pf-hint">Add your previous roles so recruiters can see your background.</p>
          <div id="workEntries" class="pf-entries">
            ${(((N=o.candidate)==null?void 0:N.workHistory)||[]).map((I,V)=>vt(V,I)).join("")}
          </div>
          <button type="button" id="addWorkEntry" class="pf-add-btn">
            ${g("plus")} Add position
          </button>
        </div>

        <!-- ── Certifications ── -->
        <div class="pf-card" id="certCard">
          ${ee("graduation-cap","Certifications &amp; courses","optional")}
          <p class="pf-hint">Add certificates, licences, or courses relevant to your work.</p>
          <div id="certEntries" class="pf-entries">
            ${(((E=o.candidate)==null?void 0:E.certifications)||[]).map((I,V)=>ft(V,I)).join("")}
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
  `}function Jt(){const e=["name","targetRole","department","city","english","salary","whatsapp"],t=e.filter(a=>{var n,s,i,l;return a==="targetRole"?!!((n=o.candidate)!=null&&n.targetRole||!ut((s=o.candidate)==null?void 0:s.headline)&&((i=o.candidate)!=null&&i.headline)):!!((l=o.candidate)!=null&&l[a])}).length+($e().length?1:0);return Math.max(25,Math.round(t/(e.length+1)*100))}function Cn(){const e=o.applications[0];return(e==null?void 0:e.stage)||(e==null?void 0:e.status)||"profile-review"}function $n(e){const t=String(e).toLowerCase().replace(/_/g,"-").replace(/\s+/g,"-"),a=Math.max(0,wt.findIndex(n=>t.includes(n.key)||n.key.includes(t)));return`<div class="pipeline">${wt.map((n,s)=>`<article class="${s<=a?"done":""} ${s===a?"current":""}"><span>${s+1}</span><strong>${n.label}</strong><p>${n.help}</p></article>`).join("")}</div>`}function kn(){return`
    <div class="empty-state">
      ${g("briefcase-business")}
      <strong>No active pipeline yet</strong>
      <p>Browse current openings and apply when you find a role that fits. Nearwork will show a pipeline here after an application moves forward.</p>
      <div class="empty-actions">
        <button class="primary-action fit" type="button" data-page="matches">${g("sparkles")} View matches</button>
        <a class="secondary-action" href="https://jobs.nearwork.co" target="_blank" rel="noreferrer">${g("external-link")} Open jobs</a>
      </div>
    </div>
  `}function Wt(){try{return new Set(JSON.parse(localStorage.getItem("nw_talent_applied")||"[]"))}catch{return new Set}}function xn(e){const t=ge(e),n=new Set(o.applications.map(l=>l.jobId||l.openingCode)).has(t.code)||Wt().has(t.code),s=dt(t),i=`https://jobs.nearwork.co/apply?code=${encodeURIComponent(t.code)}`;return`
    <article class="job-card">
      <div>
        ${s.length>=3?`<div class="match-pill">${s.length} skill match</div>`:t.match?`<div class="match-pill">${t.match}% match</div>`:""}
        <h3><a href="${i}" target="_blank" rel="noreferrer" style="color:inherit;text-decoration:none;" onmouseover="this.style.textDecoration='underline'" onmouseout="this.style.textDecoration='none'">${t.title}</a></h3>
        <p>${t.location}</p>
      </div>
      <p class="job-description">${t.description}</p>
      <div class="skill-row">${t.skills.slice(0,4).map(l=>`<span>${l}</span>`).join("")}</div>
      ${s.length>=3?`<p class="field-hint">Matched skills: ${s.slice(0,5).map(q).join(", ")}</p>`:""}
      <div class="job-footer">
        <strong>${t.compensation}</strong>
        <div style="display:flex;gap:8px;align-items:center;">
          <a href="${i}" target="_blank" rel="noreferrer" class="secondary-action" style="text-decoration:none;font-size:12px;opacity:0.75;">View opening ↗</a>
          <button class="secondary-action" type="button" data-apply="${t.code}" ${n?"disabled":""}>${n?"Applied ✓":"Apply"}</button>
        </div>
      </div>
    </article>
  `}function An(e){return`<article class="timeline-item"><span>${g("circle-dot")}</span><div><strong>${e.jobTitle||e.title||"Application"}</strong><p>${e.clientName||e.company||"Nearwork"} · ${e.status||"submitted"}</p><small>${Ge(e.updatedAt||e.createdAt)}</small></div></article>`}function Pn(e=!1){var i;const t=((i=o.candidate)==null?void 0:i.recruiter)||{},a=t.email||"support@nearwork.co",n=t.whatsapp||Ea,s=t.whatsappUrl||Ta;return`<article class="recruiter-card"><div class="avatar recruiter-avatar">NW</div><div><strong>${t.name||"Nearwork Support"}</strong><p><a href="mailto:${a}">${a}</a></p><p><a href="${s}" target="_blank" rel="noreferrer">WhatsApp ${n}</a></p>${e?"<span>Questions about assessments, interviews, feedback, or CV selection should go here.</span>":""}</div></article>`}function ht(e,t){return`<div class="empty-state">${g("inbox")}<strong>${e}</strong><p>${t}</p></div>`}function Ln(){ct.innerHTML='<main class="loading-screen"><span class="logo-mark">N</span><p>Loading Talent...</p></main>'}function Nn(){var e,t,a,n,s,i,l,d,c,r,u,p,f,w,T,k,M,C;(e=document.querySelector("#signOut"))==null||e.addEventListener("click",async()=>{await la(O),oe&&oe(),oe=null,window.history.pushState({page:"overview"},"","/"),$({user:null,candidate:null,applications:[],assessments:[],jobs:[],view:"login",activePage:"overview",message:""})}),(t=document.querySelector("#signIn"))==null||t.addEventListener("click",()=>{window.history.pushState({page:"overview"},"","/"),$({view:"login",activePage:"overview",message:""})}),document.querySelectorAll("[data-page]").forEach(v=>{v.addEventListener("click",m=>{const h=m.currentTarget.closest("[data-page]")||m.currentTarget;Re(h.dataset.page)})}),(a=document.querySelector("[data-dashboard-home]"))==null||a.addEventListener("click",()=>Re("overview")),(n=document.querySelector("#notificationBell"))==null||n.addEventListener("click",()=>{$({notificationPanelOpen:!o.notificationPanelOpen,notificationSettingsOpen:!1})}),(s=document.querySelector("#notificationSettings"))==null||s.addEventListener("click",()=>{$({notificationSettingsOpen:!o.notificationSettingsOpen,notificationPanelOpen:!1})}),document.querySelectorAll("[data-notification-read]").forEach(v=>{v.addEventListener("click",async()=>{const m=v.dataset.notificationRead;o.user&&ue&&await La(m).catch(()=>null),$({notifications:o.notifications.map(h=>h.id===m?{...h,read:!0}:h)})})}),document.querySelectorAll("[data-notification-pref]").forEach(v=>{v.addEventListener("change",async()=>{var y;const m=structuredClone(((y=o.candidate)==null?void 0:y.notificationPreferences)||{}),h=v.dataset.notificationPref,b=v.dataset.channel;m[h]={...m[h]||{},[b]:v.checked},$({candidate:{...o.candidate,notificationPreferences:m}}),o.user&&ue&&await Na(o.user.uid,m).catch(()=>null)})}),document.querySelectorAll("[data-assessment-jump]").forEach(v=>{v.addEventListener("click",async()=>{var _,D,N;const m=ce()||((_=(o.assessments||[])[0])==null?void 0:_.id),h=(o.assessments||[]).find(E=>E.id===m),b=Number(v.dataset.assessmentJump||0),y=(D=h==null?void 0:h.questions)==null?void 0:D[b];if(!m||!y)return;await Ee(m,"__progress__","",{currentQuestionIndex:b,totalQuestions:((N=h==null?void 0:h.questions)==null?void 0:N.length)||70,currentStage:y.stage||1}),he(m,b);const A=(o.assessments||[]).map(E=>E.id===m?{...E,currentQuestionIndex:b,currentStage:y.stage||1}:E);$({assessments:A,activePage:"assessment",message:""})})}),document.querySelector("#availability").addEventListener("change",async v=>{const m=v.target.value;$({candidate:{...o.candidate,availability:m}}),o.user&&ue?await xa(o.user.uid,m):$({message:"Sign in with Google to save availability."})}),(i=document.querySelector("#filterMatches"))==null||i.addEventListener("click",()=>{const v=$e().length>=3;$({matchesFiltered:v?!o.matchesFiltered:!1,message:v?"":"Add at least 5 skills in Profile first, then filter matching openings."})}),(l=document.querySelector("#departmentSelect"))==null||l.addEventListener("change",v=>{const m=document.querySelector("#citySelect"),h=ie[v.target.value]||[];m.innerHTML=h.map(b=>`<option value="${S(b)}">${b}</option>`).join("")}),(d=document.querySelector("#roleGroupSelect"))==null||d.addEventListener("change",v=>{const m=document.querySelector("#targetRoleSelect");m.innerHTML=He(v.target.value,"")}),(c=document.querySelector("#salaryCurrencyInput"))==null||c.addEventListener("change",v=>{const m=document.querySelector("#salaryInput");if(!m)return;const h=Ct(m.value,v.target.value);v.target.value=h,m.placeholder=h==="COP"?"5,000,000":"2,500",m.value=$t(m.value,h)}),(r=document.querySelector("#salaryInput"))==null||r.addEventListener("blur",v=>{const m=document.querySelector("#salaryCurrencyInput"),h=Ct(v.target.value,(m==null?void 0:m.value)||"USD");m&&(m.value=h),v.target.placeholder=h==="COP"?"5,000,000":"2,500",v.target.value=$t(v.target.value,h)}),Ya(),Yt(),_n(),En(),Mn(),document.querySelectorAll("[data-apply]").forEach(v=>{v.addEventListener("click",async()=>{const m=o.jobs.map(ge).find(b=>b.code===v.dataset.apply),h=v.dataset.apply;if(v.disabled=!0,v.textContent="Submitted",o.user&&ue){try{const b=Wt();b.add(h),localStorage.setItem("nw_talent_applied",JSON.stringify([...b]))}catch{}await ka(o.user.uid,m),await Ht(o.user),Re("applications")}else $({message:"Sign in with Google to apply to this opening."})})}),(u=document.querySelector("#showTechIntro"))==null||u.addEventListener("click",()=>{$({assessmentUiStep:"techIntro",message:""})}),(p=document.querySelector("#backToWelcome"))==null||p.addEventListener("click",()=>{$({assessmentUiStep:null,message:""})}),(f=document.querySelector("#startDiscAssessment"))==null||f.addEventListener("click",async()=>{var D;const v=ce()||((D=(o.assessments||[])[0])==null?void 0:D.id),m=(o.assessments||[]).find(N=>N.id===v);if(!v||!m)return;const h=m.questions||[],b=document.querySelector("#startDiscAssessment"),y=b?Number(b.dataset.discIndex||50):h.findIndex(N=>Number(N.stage||1)===2),A=y>=0?y:50,_=new Date().toISOString();try{await Ee(v,"__progress__","",{currentQuestionIndex:A,totalQuestions:h.length,currentStage:2,discStartedAt:_}),he(v,A);const N=(o.assessments||[]).map(E=>E.id===v?{...E,currentQuestionIndex:A,currentStage:2,discStartedAt:_}:E);$({assessments:N,activePage:"assessment",assessmentUiStep:null,message:""})}catch(N){$({message:de(N)})}}),(w=document.querySelector("#startAssessment"))==null||w.addEventListener("click",async()=>{var h;const v=ce()||((h=(o.assessments||[])[0])==null?void 0:h.id),m=(o.assessments||[]).find(b=>b.id===v)||(o.assessments||[])[0];if(!v||!o.user){$({message:"Please log in to start your assessment."});return}try{await Ca(v,o.user.uid),he(v,Number((m==null?void 0:m.currentQuestionIndex)||0),!0);const b=(o.assessments||[]).map(y=>y.id===v?{...y,status:"started",startedAt:y.startedAt||new Date().toISOString(),technicalStartedAt:y.technicalStartedAt||new Date().toISOString()}:y);$({assessments:b,activePage:"assessment",assessmentUiStep:null,message:""})}catch(b){$({message:de(b)})}}),(T=document.querySelector("#prevAssessmentQuestion"))==null||T.addEventListener("click",async()=>{var _,D,N,E;const v=ce()||((_=(o.assessments||[])[0])==null?void 0:_.id),m=(o.assessments||[]).find(I=>I.id===v),h=Number(((D=document.querySelector("#assessmentQuestionForm"))==null?void 0:D.dataset.currentIndex)??(m==null?void 0:m.currentQuestionIndex)??0),b=Math.max(0,h-1),y=(N=m==null?void 0:m.questions)==null?void 0:N[b];await Ee(v,"__progress__","",{currentQuestionIndex:b,totalQuestions:((E=m==null?void 0:m.questions)==null?void 0:E.length)||70,currentStage:(y==null?void 0:y.stage)||1}),he(v,b);const A=(o.assessments||[]).map(I=>I.id===v?{...I,currentQuestionIndex:b,currentStage:(y==null?void 0:y.stage)||1}:I);$({assessments:A,activePage:"assessment",message:""})}),(k=document.querySelector("#assessmentQuestionForm"))==null||k.addEventListener("submit",async v=>{var ke;v.preventDefault();const m=ce()||((ke=(o.assessments||[])[0])==null?void 0:ke.id),h=(o.assessments||[]).find(U=>U.id===m),b=(h==null?void 0:h.questions)||[],y=Number(v.currentTarget.dataset.currentIndex??(h==null?void 0:h.currentQuestionIndex)??0),A=b[y],_=new FormData(v.currentTarget).get("answer");if(!A){$({message:"This question could not be loaded. Please refresh and try again."});return}const D=_===null?{value:"",skipped:!0,answeredAt:new Date().toISOString()}:{value:Number(_),skipped:!1,answeredAt:new Date().toISOString()},N={...h.answers||{},[A.id]:D},E=b[y+1],I=E&&Number(E.stage||1)!==Number(A.stage||1),V=tt(h,A.stage,N);try{if((I||y+1>=b.length)&&V.length){await Ee(m,A.id,N[A.id],{currentQuestionIndex:y,totalQuestions:b.length,currentStage:A.stage||1});const U=(o.assessments||[]).map(J=>J.id===m?{...J,answers:N,currentQuestionIndex:y,currentStage:A.stage||1,progress:`${y+1}/${b.length}`}:J);$({assessments:U,activePage:"assessment",message:`You missed ${V.length} question${V.length===1?"":"s"} in the ${pt(A.stage)}.`});return}if(y+1>=b.length){const U=gn(h,N),J=vn(h,N);await $a(m,N,{totalQuestions:b.length,technicalScore:U.technicalScore,discScore:U.discScore,score:Math.round(U.technicalScore*.75+U.discScore*.25),discProfile:J}),fetch("https://admin.nearwork.co/api/generate-assessment-insights",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({assessmentId:m})}).catch(()=>null),fn(h,{score:Math.round(U.technicalScore*.75+U.discScore*.25),technicalScore:U.technicalScore,discScore:U.discScore,discProfile:J}).catch(re=>console.warn(re));const Q=(o.assessments||[]).map(re=>re.id===m?{...re,answers:N,status:"completed",score:Math.round(U.technicalScore*.75+U.discScore*.25),technical:U.technicalScore,disc:J.label,discProfile:J,progress:`${b.length}/${b.length}`}:re);$({assessments:Q,activePage:"assessment",message:""})}else{const U=A.stage===1&&(E==null?void 0:E.stage)===2&&!h.discStartedAt;await Ee(m,A.id,N[A.id],{currentQuestionIndex:y+1,totalQuestions:b.length,currentStage:(E==null?void 0:E.stage)||A.stage||1}),he(m,y+1);const J=(o.assessments||[]).map(Q=>Q.id===m?{...Q,answers:N,currentQuestionIndex:y+1,currentStage:(E==null?void 0:E.stage)||A.stage||1,progress:`${y+1}/${b.length}`}:Q);$({assessments:J,activePage:"assessment",message:"",assessmentUiStep:U?"discIntro":null})}}catch(U){$({message:de(U)})}}),(M=document.querySelector("#profileForm"))==null||M.addEventListener("submit",async v=>{var _,D,N,E,I,V,ke,U,J;v.preventDefault();const m=new FormData(v.currentTarget),h=m.get("department"),b=m.get("city"),y=Ot(m.get("salary"),m.get("salaryCurrency")),A={name:m.get("name"),targetRole:m.get("targetRole"),headline:m.get("targetRole"),department:h,city:b,locationId:`${String(b).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g,"-")}-co`,location:`${b}, ${h}`,locationCity:b,locationDepartment:h,locationCountry:"Colombia",english:m.get("english"),salary:y.salary,salaryUSD:y.salaryUSD,salaryAmount:y.salaryAmount,salaryCurrency:y.salaryCurrency,expectedSalaryAmount:y.salaryAmount,expectedSalaryCurrency:y.salaryCurrency,linkedin:m.get("linkedin"),whatsapp:m.get("whatsapp"),phone:m.get("whatsapp"),skills:[...new Set(m.getAll("skills").map(fe).filter(Boolean))],otherSkills:[],languages:(m.get("languages")||"").split(",").map(Q=>Q.trim()).filter(Boolean),summary:m.get("summary"),email:((_=o.candidate)==null?void 0:_.email)||((D=o.user)==null?void 0:D.email)||"",availability:((N=o.candidate)==null?void 0:N.availability)||"open",onboarded:!0};if(!o.user){$({candidate:{...o.candidate,...A},message:"Preview updated. Sign in with Google to save this profile."});return}try{const Q=m.get("photo");let re=((E=o.candidate)==null?void 0:E.photoURL)||((I=o.user)==null?void 0:I.photoURL)||"";Q!=null&&Q.name&&(re=await Aa(o.user.uid,Q));const Ie=(V=m.get("profileCv"))!=null&&V.name?m.get("profileCv"):Ue;let ve=null,yt=!1;if(Ie!=null&&Ie.name)try{ve=await et(o.user.uid,Ie,m.get("profileCvLabel")||""),Ue=null}catch{yt=!0}const Ve={...A,photoURL:re,candidateCode:(ke=o.candidate)==null?void 0:ke.candidateCode,marketingConsent:((U=o.candidate)==null?void 0:U.marketingConsent)===!0,...ve?{activeCvId:ve.id,activeCvName:ve.name||ve.fileName,cvUrl:ve.url,cvLibrary:[...((J=o.candidate)==null?void 0:J.cvLibrary)||[],ve]}:{},workHistory:(()=>{var Ae,Pe,Le,Ne;const xe=Tn();return xe.length?xe:(Ae=Y==null?void 0:Y.workHistory)!=null&&Ae.length&&(ye||!((Le=(Pe=o.candidate)==null?void 0:Pe.workHistory)!=null&&Le.length))?Y.workHistory:((Ne=o.candidate)==null?void 0:Ne.workHistory)||[]})(),certifications:(()=>{var Ae,Pe,Le,Ne;const xe=In();return xe.length?xe:(Ae=Y==null?void 0:Y.certifications)!=null&&Ae.length&&(ye||!((Le=(Pe=o.candidate)==null?void 0:Pe.certifications)!=null&&Le.length))?Y.certifications:((Ne=o.candidate)==null?void 0:Ne.certifications)||[]})()};Y=null,ye=!1;const Qe=await it(o.user.uid,Ve),Kt=yt?"Profile saved, but the CV failed to upload. Try uploading it again from the CV section.":(Qe==null?void 0:Qe.atsSynced)===!1?"Profile saved. Nearwork will finish connecting it to your workspace.":"Profile saved.";m.get("mode")==="onboarding"?(window.history.pushState({page:"overview"},"","/"),$({candidate:{...o.candidate,...Ve},activePage:"overview",message:"Profile complete. Welcome to Talent."})):$({candidate:{...o.candidate,...Ve},message:Kt})}catch(Q){$({message:de(Q)})}}),(C=document.querySelector("#cvForm"))==null||C.addEventListener("submit",async v=>{var b;v.preventDefault();const m=new FormData(v.currentTarget),h=m.get("cv");if(h!=null&&h.name){if(!o.user){$({message:"Sign in with Google to upload and store CVs."});return}try{const y=await et(o.user.uid,h,m.get("label"));$({candidate:{...o.candidate,cvLibrary:[...((b=o.candidate)==null?void 0:b.cvLibrary)||[],y],activeCvId:y.id},message:"CV uploaded."})}catch(y){$({message:de(y)})}}})}function En(){const e=document.querySelector("#workHistoryCard");if(!e)return;let t=e.querySelectorAll(".work-entry").length;e.addEventListener("click",a=>{var s;const n=a.target.closest(".remove-work-entry");if(n){(s=n.closest(".work-entry"))==null||s.remove();return}if(a.target.closest("#addWorkEntry")){const i=document.querySelector("#workEntries");if(!i)return;const l=document.createElement("div");l.innerHTML=vt(t++,{}),i.appendChild(l.firstElementChild)}})}function Tn(){return[...document.querySelectorAll(".work-entry")].map(e=>{const t=a=>{var n,s;return((s=(n=e.querySelector(`[data-field="${a}"]`))==null?void 0:n.value)==null?void 0:s.trim())||""};return{title:t("title"),company:t("company"),from:t("from"),to:t("to")}}).filter(e=>e.title||e.company)}function Mn(){const e=document.querySelector("#certCard");if(!e)return;let t=e.querySelectorAll(".cert-entry").length;e.addEventListener("click",a=>{var s;const n=a.target.closest(".remove-cert-entry");if(n){(s=n.closest(".cert-entry"))==null||s.remove();return}if(a.target.closest("#addCertEntry")){const i=document.querySelector("#certEntries");if(!i)return;const l=document.createElement("div");l.innerHTML=ft(t++,{}),i.appendChild(l.firstElementChild)}})}function In(){return[...document.querySelectorAll(".cert-entry")].map(e=>{const t=a=>{var n,s;return((s=(n=e.querySelector(`[data-field="${a}"]`))==null?void 0:n.value)==null?void 0:s.trim())||""};return{name:t("name"),issuer:t("issuer"),date:t("date")}}).filter(e=>e.name)}function _n(){var n,s,i,l,d,c;const e=document.querySelector("#profileForm"),t=e==null?void 0:e.querySelector('input[name="profileCv"]');if(!e||!t)return;((n=e.querySelector('input[name="mode"]'))==null?void 0:n.value)==="onboarding"&&!((i=(s=o.candidate)==null?void 0:s.skills)!=null&&i.length)&&!((d=(l=o.candidate)==null?void 0:l.workHistory)!=null&&d.length)&&!((c=o.candidate)!=null&&c.name)?qn(e,t):Rn(t)}function qn(e,t){var l;const a=document.querySelector("#profileCvCard");if(!a)return;const n=[...e.children].filter(d=>d!==a&&d.type!=="hidden"&&d.getAttribute("name")!=="mode");n.forEach(d=>{d.style.display="none"});const s=document.createElement("p");s.id="cvGatePrompt",s.style.cssText="font-size:13px;color:var(--mid);margin:10px 0 4px;text-align:center;",s.innerHTML=`Upload your CV and we'll fill in the rest for you — or <button type="button" id="skipCvParse" style="background:none;border:none;padding:0;font-size:13px;color:var(--green);cursor:pointer;text-decoration:underline;">skip and fill in manually</button>`,a.insertAdjacentElement("afterend",s);function i(){var d,c;(d=document.querySelector("#cvGatePrompt"))==null||d.remove(),(c=document.querySelector("#cvParseLoading"))==null||c.remove(),n.forEach(r=>{r.style.display=""})}(l=document.querySelector("#skipCvParse"))==null||l.addEventListener("click",i),t.addEventListener("change",async()=>{var u,p;const d=(u=t.files)==null?void 0:u[0];if(!d)return;(p=document.querySelector("#cvGatePrompt"))==null||p.remove();const c=document.createElement("p");c.id="cvParseLoading",c.style.cssText="font-size:13px;font-weight:600;color:var(--green);padding:14px 0;text-align:center;",c.textContent="Analysing your CV…",a.insertAdjacentElement("afterend",c),Y=null,ye=!0;const r=await rt(d);i(),r&&(Y=r,Dn(r,!0),Bn(r,t))})}function Rn(e){e.addEventListener("change",async()=>{var d,c,r,u,p,f,w,T,k;const t=(d=e.files)==null?void 0:d[0];if(!t)return;Y=null,ye=!1,Ue=null,$({message:"⏳ Analysing your CV — this takes up to 30 seconds…"});const a=await rt(t);if(!a){$({message:"⚠️ Could not read your CV. Check the browser console for details, or try a different file."});return}Y=a,ye=!0,Ue=t;const n=o.candidate||{},s={...n,...a.name?{name:a.name}:{},...a.phone?{whatsapp:a.phone,phone:a.phone}:{},...a.summary?{summary:a.summary}:{},skills:(c=a.skills)!=null&&c.length?[...new Set(a.skills.map(fe).filter(Boolean))]:n.skills||[],workHistory:(r=a.workHistory)!=null&&r.length?a.workHistory:n.workHistory||[],certifications:(u=a.certifications)!=null&&u.length?a.certifications:n.certifications||[],languages:(p=a.languages)!=null&&p.length?a.languages:n.languages||[]},i=[];a.name&&i.push("name"),a.phone&&i.push("phone"),a.summary&&i.push("summary"),(f=a.skills)!=null&&f.length&&i.push(`${a.skills.length} skill${a.skills.length!==1?"s":""}`),(w=a.workHistory)!=null&&w.length&&i.push(`${a.workHistory.length} role${a.workHistory.length!==1?"s":""}`),(T=a.certifications)!=null&&T.length&&i.push(`${a.certifications.length} cert${a.certifications.length!==1?"s":""}`),(k=a.languages)!=null&&k.length&&i.push("languages");const l=i.length?`✓ Pre-filled from CV: ${i.join(", ")}. Review and save your profile.`:"✓ CV analysed. Review your profile and save.";$({candidate:s,message:l})})}function Dn(e,t){var n,s,i,l,d;const a=(c,r)=>{const u=document.querySelector(c);u&&r&&t&&(u.value=r)};if(a('input[name="name"]',e.name),a('input[name="whatsapp"]',e.phone),a('textarea[name="summary"]',e.summary),(n=e.skills)!=null&&n.length){const c=document.querySelector("#selectedSkills");if(c){c.innerHTML="";const r=new Set([...c.querySelectorAll('input[name="skills"]')].map(p=>p.value.toLowerCase()));(s=c.querySelector(".skill-empty"))==null||s.remove(),[...new Set(e.skills.map(fe).filter(Boolean))].forEach(p=>{if(r.has(p.toLowerCase()))return;r.add(p.toLowerCase());const f=document.createElement("span");f.className="selected-skill",f.setAttribute("data-skill-chip",p),f.innerHTML=`${q(p)}<button type="button" class="skill-remove" data-remove-skill="${S(p)}" aria-label="Remove ${S(p)}">×</button><input type="hidden" name="skills" value="${S(p)}" />`,c.appendChild(f)})}}if((i=e.workHistory)!=null&&i.length){const c=document.querySelector("#workEntries");if(c){c.innerHTML="";let r=c.querySelectorAll(".work-entry").length;e.workHistory.forEach(u=>{const p=document.createElement("div");p.innerHTML=vt(r++,u),c.appendChild(p.firstElementChild)})}}if((l=e.languages)!=null&&l.length){const c=document.querySelector('input[name="languages"]');c&&t&&(c.value=e.languages.join(", "))}if((d=e.certifications)!=null&&d.length){const c=document.querySelector("#certEntries");if(c){c.innerHTML="";let r=c.querySelectorAll(".cert-entry").length;e.certifications.forEach(u=>{const p=document.createElement("div");p.innerHTML=ft(r++,u),c.appendChild(p.firstElementChild)})}}ze()}function Bn(e,t){var s,i,l,d,c;const a=[];e.name&&a.push("name"),e.phone&&a.push("phone"),(s=e.skills)!=null&&s.length&&a.push(`${e.skills.length} skill${e.skills.length>1?"s":""}`),(i=e.workHistory)!=null&&i.length&&a.push(`${e.workHistory.length} role${e.workHistory.length>1?"s":""}`),(l=e.certifications)!=null&&l.length&&a.push(`${e.certifications.length} cert${e.certifications.length>1?"s":""}`),(d=e.languages)!=null&&d.length&&a.push("languages"),(c=document.querySelector("#cvParseHint"))==null||c.remove();const n=document.createElement("p");n.id="cvParseHint",n.style.cssText="font-size:12px;color:var(--green);margin:4px 0 0;",n.innerHTML=a.length?`✓ Pre-filled: <strong>${a.join(", ")}</strong>. Review and save.`:"✓ CV analysed. Review your profile and save.",t.insertAdjacentElement("afterend",n)}function Yt(){var c;const e=document.querySelector("[data-skill-search]");if(!e)return;const t=e.querySelector("#skillSearchInput"),a=e.querySelector("#skillSuggestions"),n=e.querySelector("#selectedSkills"),s=()=>[...n.querySelectorAll('input[name="skills"]')].map(r=>r.value),i=r=>{n.innerHTML=r.length?r.map(u=>`
      <span class="selected-skill" data-skill-chip="${S(u)}">
        ${q(u)}
        <button type="button" class="skill-remove" data-remove-skill="${S(u)}" aria-label="Remove ${S(u)}">×</button>
        <input type="hidden" name="skills" value="${S(u)}" />
      </span>`).join(""):'<span class="skill-empty">Selected skills will appear here.</span>'},l=()=>{const r=G(t.value),u=t.value.trim(),p=new Set(s().map(G)),f=_t.filter(M=>!p.has(G(M))).filter(M=>!r||G(M).includes(r)).slice(0,12),w=f.find(M=>G(M)===r),k=u.length>1&&!p.has(G(u))&&!w?`<button type="button" class="skill-suggestion add-custom" data-skill="${S(u)}">+ Add "${q(u)}"</button>`:"";a.innerHTML=k+f.map(M=>`<button type="button" class="skill-suggestion" data-skill="${S(M)}">${q(M)}</button>`).join("")},d=r=>{const u=(r||t.value).trim(),p=fe(u);if(!p)return;const f=G(p),w=s();if(w.length>=20&&!w.some(k=>G(k)===f)){t.value="";return}const T=[...w.filter(k=>G(k)!==f),p];i(T),t.value="",l()};t==null||t.addEventListener("input",l),t==null||t.addEventListener("focus",l),t==null||t.addEventListener("keydown",r=>{if(r.key!=="Enter")return;r.preventDefault();const u=G(t.value),p=[...a.querySelectorAll(".skill-suggestion:not(.add-custom)")].find(f=>G(f.dataset.skill)===u);d((p==null?void 0:p.dataset.skill)||t.value)}),(c=e.querySelector("#addTypedSkill"))==null||c.addEventListener("click",()=>d(t.value)),a.addEventListener("click",r=>{const u=r.target.closest("[data-skill]");u&&d(u.dataset.skill)}),n.addEventListener("click",r=>{const u=r.target.closest("[data-remove-skill]");if(!u)return;const p=G(u.dataset.removeSkill);i(s().filter(f=>G(f)!==p)),l()})}function Zt(){if(o.loading)return Ln();if(o.view==="dashboard")return Qt();Gt()}window.addEventListener("popstate",()=>{const e=Fe();e==="overview"&&!o.user?$({view:"login",activePage:"overview",message:""}):o.view==="dashboard"?Re(e,!1):De()});ue?(na(O,e=>{if(e)Ht(e);else{try{localStorage.removeItem("nw_talent_applied")}catch{}De()}}),window.setTimeout(()=>{o.loading&&De()},2500)):De();
