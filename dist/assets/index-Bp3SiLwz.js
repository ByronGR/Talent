import{initializeApp as Ct}from"https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";import{getAuth as $t,signInWithCustomToken as kt,onAuthStateChanged as At,createUserWithEmailAndPassword as xt,updateProfile as Pt,signInWithEmailAndPassword as Et,signOut as da}from"https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";import{getFirestore as Lt,query as de,collection as ie,where as ue,limit as pe,getDocs as me,getDoc as Pe,doc as B,setDoc as X,serverTimestamp as j,onSnapshot as Tt,updateDoc as Nt,addDoc as Ba,arrayUnion as fa}from"https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";import{getStorage as Mt,ref as ha,uploadBytes as Va,getDownloadURL as Qa,deleteObject as qt}from"https://www.gstatic.com/firebasejs/10.12.5/firebase-storage.js";(function(){const a=document.createElement("link").relList;if(a&&a.supports&&a.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))n(s);new MutationObserver(s=>{for(const i of s)if(i.type==="childList")for(const l of i.addedNodes)l.tagName==="LINK"&&l.rel==="modulepreload"&&n(l)}).observe(document,{childList:!0,subtree:!0});function t(s){const i={};return s.integrity&&(i.integrity=s.integrity),s.referrerPolicy&&(i.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?i.credentials="include":s.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function n(s){if(s.ep)return;s.ep=!0;const i=t(s);fetch(s.href,i)}})();const Ja={apiKey:"AIzaSyApRNyW8PoP28E0x77dUB5jOgHuTqA2by4",authDomain:"nearwork-97e3c.firebaseapp.com",projectId:"nearwork-97e3c",storageBucket:"nearwork-97e3c.firebasestorage.app",messagingSenderId:"145642656516",appId:"1:145642656516:web:0ac2da8931283121e87651",measurementId:"G-3LC8N6FFSH"},be=Object.values(Ja).slice(0,6).every(Boolean),xe=be?Ct(Ja):null,U=xe?$t(xe):null,N=xe?Lt(xe):null,ea=xe?Mt(xe):null,M={users:"users",candidates:"candidates",openings:"openings",pipelines:"pipelines",applications:"applications",assessments:"assessments",activity:"candidateActivity",notifications:"notifications",notificationPreferences:"notificationPreferences"},Wa="/api/send-email-proxy";function Q(){if(!xe||!U||!N||!ea)throw new Error("Missing Firebase environment variables. Copy .env.example to .env.local and fill in the Admin app config.")}async function It(e={}){var i,l;const a=String(e.email||((i=U==null?void 0:U.currentUser)==null?void 0:i.email)||"").trim().toLowerCase();if(!a)return{ok:!1,skipped:!0,reason:"Missing candidate email"};const t=e.name||((l=U==null?void 0:U.currentUser)==null?void 0:l.displayName)||"",n=e.firstName||t.split(/\s+/)[0]||"there",s=await fetch(Wa,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({to:a,templateId:"account_created",data:{name:t||n,firstName:n,actionUrl:"https://talent.nearwork.co"}})});return s.json().catch(()=>({ok:s.ok}))}async function Dt(e={},a={}){var l,o;const t=String((e==null?void 0:e.email)||((l=U==null?void 0:U.currentUser)==null?void 0:l.email)||"").trim().toLowerCase();if(!t)return{ok:!1,skipped:!0,reason:"Missing candidate email"};const n=(e==null?void 0:e.name)||((o=U==null?void 0:U.currentUser)==null?void 0:o.displayName)||"",s=(e==null?void 0:e.firstName)||n.split(/\s+/)[0]||"there",i=await fetch(Wa,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({to:t,templateId:"job_applied",data:{name:n||s,firstName:s,roleTitle:a.title||a.role||a.openingTitle||"this role",openingCode:a.code||a.id||"",actionUrl:"https://talent.nearwork.co"}})});return i.json().catch(()=>({ok:i.ok}))}async function Ya(e){Q();const a=await Pe(B(N,M.users,e));return a.exists()?{id:a.id,...a.data()}:null}async function _t(e){Q();const a=String(e||"").trim(),t=a.toLowerCase(),n=de(ie(N,M.users),ue("email","==",t),pe(1)),s=await me(n);if(!s.empty)return{id:s.docs[0].id,...s.docs[0].data()};if(a===t)return null;const i=de(ie(N,M.users),ue("email","==",a),pe(1)),l=await me(i);return l.empty?null:{id:l.docs[0].id,...l.docs[0].data()}}async function Rt(e){const a=await Ya(e.uid);if(a)return a;const t=await _t(e.email);return t?(await Za(e.uid,{...t,email:e.email,connectedFromUserId:t.id}),{...t,id:e.uid,connectedFromUserId:t.id}):null}async function Ka(e,a,t){const n=await Pe(B(N,M.candidates,a)).catch(()=>null),s=n!=null&&n.exists()?n.data():{};return Xa(e,{...s,...t,candidateCode:a})}async function Za(e,a){Q();const t=a.candidateCode||Qe(e),n={...a,candidateCode:t,role:"candidate",updatedAt:j()};await X(B(N,M.users,e),n,{merge:!0}),await X(B(N,M.candidates,t),await Ka(e,t,{...n,candidateCode:t}),{merge:!0}).catch(()=>null)}function Qe(e){return`CAND-${String(e||"").replace(/[^a-z0-9]/gi,"").slice(0,8).toUpperCase()||Date.now()}`}function Ut(e){return String(e||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"")}function Xa(e,a){const t=a.candidateCode||Qe(e),n=a.location||[a.locationCity||a.city,a.locationDepartment||a.department].filter(Boolean).join(", "),s=new Date().toISOString().slice(0,10);return{code:t,uid:e,ownerUid:e,name:a.name||"Talent member",role:a.targetRole||a.headline||"Nearwork candidate",skills:Array.isArray(a.skills)?a.skills:[],applied:a.applied||s,lastContact:a.lastContact||s,experience:Number(a.experience||0),location:n,city:Ut(a.locationCity||a.city||n),department:a.locationDepartment||a.department||"",country:a.locationCountry||"Colombia",source:"talent.nearwork.co",status:a.status||"active",score:Number(a.score||50),email:a.email||"",phone:a.whatsapp||a.phone||"",whatsapp:a.whatsapp||a.phone||"",currentRole:a.currentRole||"",salary:a.salary||"",salaryUSD:Number(a.salaryUSD||0)||null,salaryAmount:Number(a.salaryAmount||a.expectedSalaryAmount||0)||null,salaryCurrency:a.salaryCurrency||a.expectedSalaryCurrency||"USD",expectedSalaryUSD:Number(a.expectedSalaryUSD||0)||null,expectedSalaryCOP:Number(a.expectedSalaryCOP||0)||null,expectedSalaryAmount:Number(a.expectedSalaryAmount||a.salaryAmount||0)||null,expectedSalaryCurrency:a.expectedSalaryCurrency||a.salaryCurrency||"USD",expectedSalary:a.expectedSalary||a.salary||"",availability:a.availability||"open",english:a.english||"",visa:a.visa||"No",linkedin:a.linkedin||"",cv:a.activeCvName||"",cvUrl:a.cvUrl||null,photoUrl:a.photoURL||a.photoUrl||null,tags:a.tags||["talent profile"],notes:a.summary||"",summary:a.summary||"",workHistory:Array.isArray(a.workHistory)?a.workHistory:[],languages:Array.isArray(a.languages)?a.languages:[],certifications:Array.isArray(a.certifications)?a.certifications:[],appliedBefore:!!a.appliedBefore,applications:a.applications||[],pipelineCodes:a.pipelineCodes||[],loom:a.loom||"Not uploaded",assessments:a.assessments||[],work:a.work||[],updatedAt:j()}}async function Bt(e){Q();const a=de(ie(N,M.applications),ue("candidateId","==",e),pe(20)),t=de(ie(N,M.applications),ue("ownerUid","==",e),pe(20)),n=await Promise.allSettled([me(a),me(t)]),s=new Map;return n.forEach(i=>{i.status==="fulfilled"&&i.value.docs.forEach(l=>s.set(l.id,{id:l.id,...l.data()}))}),Array.from(s.values()).sort((i,l)=>{const o=d=>{var c,p;return((p=(c=d==null?void 0:d.toDate)==null?void 0:c.call(d))==null?void 0:p.getTime())??(d?new Date(d).getTime():0)};return o(l.updatedAt||l.createdAt)-o(i.updatedAt||i.createdAt)})}async function Ft(e,a="",t=""){Q();const n=String(a||"").trim().toLowerCase(),s=String(t||"").trim(),i=[me(de(ie(N,M.assessments),ue("candidateUid","==",e),pe(25))),me(de(ie(N,M.assessments),ue("candidateId","==",e),pe(25)))];n&&i.push(me(de(ie(N,M.assessments),ue("candidateEmail","==",n),pe(25)))),s&&i.push(me(de(ie(N,M.assessments),ue("candidateCode","==",s),pe(25))));const l=await Promise.allSettled(i),o=new Map;return l.forEach(d=>{d.status==="fulfilled"&&d.value.docs.forEach(c=>o.set(c.id,{id:c.id,...c.data()}))}),Array.from(o.values()).sort((d,c)=>{const p=u=>{var v,w;return((w=(v=u==null?void 0:u.toDate)==null?void 0:v.call(u))==null?void 0:w.getTime())??(u?new Date(u).getTime():0)};return p(c.updatedAt||c.createdAt||c.sentAt)-p(d.updatedAt||d.createdAt||d.sentAt)})}async function Ot(e,a,t="",n=""){Q();const s=await Pe(B(N,M.assessments,e));if(!s.exists())return null;const i={id:s.id,...s.data()},l=String(t||"").trim().toLowerCase(),o=String(n||"").trim();return i.candidateUid===a||i.candidateId===a||String(i.candidateEmail||"").trim().toLowerCase()===l||String(i.candidateCode||"").trim()===o?i:null}async function jt(e,a){Q();const t=await Pe(B(N,M.assessments,e)),n=t.exists()?t.data():{};if(n.status==="completed")throw new Error("This assessment is already completed.");if(n.expiresAt&&Date.now()>new Date(n.expiresAt).getTime())throw new Error("This assessment link has expired.");await X(B(N,M.assessments,e),{status:"started",currentQuestionIndex:Number(n.currentQuestionIndex||0),currentStage:Number(n.currentStage||1),technicalStartedAt:n.technicalStartedAt||j(),startedAt:n.startedAt||j(),updatedAt:j()},{merge:!0})}async function Oe(e,a,t,n={}){Q();const s=await Pe(B(N,M.assessments,e)),i=s.exists()?s.data():{};if(i.status==="completed")throw new Error("This assessment is already completed.");if(i.expiresAt&&Date.now()>new Date(i.expiresAt).getTime())throw new Error("This assessment link has expired.");await X(B(N,M.assessments,e),{[`answers.${a}`]:t,progress:`${n.currentQuestionIndex||0}/${n.totalQuestions||""}`.replace(/\/$/,""),currentQuestionIndex:n.currentQuestionIndex||0,currentStage:n.currentStage||1,...n.discStartedAt?{discStartedAt:n.discStartedAt}:{},updatedAt:j()},{merge:!0})}async function zt(e,a,t={}){var v;Q();const n=B(N,M.assessments,e),s=await Pe(n),i=s.exists()?s.data():{};if(i.status==="completed")throw new Error("This assessment is already completed.");if(i.expiresAt&&Date.now()>new Date(i.expiresAt).getTime())throw new Error("This assessment link has expired.");const l=Object.values(a||{}).filter(w=>String((w==null?void 0:w.value)??w??"").trim()).length,o=Number(t.totalQuestions||Object.keys(a||{}).length||0),d=Number(t.technicalScore||0),c=Number(t.discScore||0),p=Number(t.score||(o?Math.round(l/o*100):0));await X(n,{answers:a,answeredCount:l,totalQuestions:o,score:p,technical:d||p,disc:((v=t.discProfile)==null?void 0:v.label)||(c?`${c}%`:"Submitted"),discScore:c,discProfile:t.discProfile||null,progress:`${l}/${o}`,status:"completed",finished:new Date().toLocaleString("en-US",{month:"short",day:"numeric",year:"numeric",hour:"numeric",minute:"2-digit"}),finishedAt:j(),updatedAt:j()},{merge:!0});const u=Math.round(p);i.candidateUid&&await X(B(N,M.users,i.candidateUid),{score:u,nwScore:u,lastAssessmentScore:u,lastAssessmentId:e,updatedAt:j()},{merge:!0}).catch(()=>null),i.candidateCode&&await X(B(N,M.candidates,i.candidateCode),{score:u,nwScore:u,lastAssessmentScore:u,lastAssessmentId:e,updatedAt:j()},{merge:!0}).catch(()=>null)}async function et(){Q();const e=de(ie(N,M.openings),ue("published","==",!0),pe(12));return(await me(e)).docs.map(t=>({id:t.id,...t.data()}))}async function Ht(e,a){Q();const t=a.code||a.id,n=await Ya(e).catch(()=>null),s=(n==null?void 0:n.candidateCode)||Qe(e),i=new Date().toISOString().slice(0,10),l={opening:t,openingCode:t,jobId:t,role:a.title||a.role||"Untitled role",openingTitle:a.title||a.role||"Untitled role",applied:i,appliedAt:i,status:"applied",outcome:"Application only",source:"talent.nearwork.co"},o={candidateId:e,ownerUid:e,authUid:e,candidateDocId:s,candidateCode:s,candidateEmail:(n==null?void 0:n.email)||"",candidateName:(n==null?void 0:n.name)||"",openingCode:t,jobId:t,openingTitle:a.title||a.role||"Untitled role",jobTitle:a.title||a.role||"Untitled role",title:a.title||a.role||"Untitled role",clientName:a.orgName||a.clientName||a.company||"Nearwork client",status:"applied",inPipeline:!1,isMockData:!1,source:"talent.nearwork.co",createdAt:j(),updatedAt:j()};await Ba(ie(N,M.applications),o),await X(B(N,M.candidates,s),{...Xa(e,{...n||{},candidateCode:s,appliedBefore:!0,lastContact:i}),applications:fa(l),appliedBefore:!0},{merge:!0}).catch(()=>null),await X(B(N,M.users,e),{role:"candidate",candidateCode:s,code:s,applications:fa(l),lastAppliedOpeningCode:t,lastAppliedAt:j(),updatedAt:j()},{merge:!0}).catch(()=>null),await Ba(ie(N,M.activity),{candidateId:e,type:"application_submitted",title:o.jobTitle,createdAt:j()}).catch(()=>null),Dt(n,a).catch(()=>null)}async function Gt(e,a){await Nt(B(N,M.users,e),{availability:a,updatedAt:j()})}async function $a(e,a){Q();const t=a.candidateCode||Qe(e);await X(B(N,M.users,e),{...a,candidateCode:t,role:"candidate",updatedAt:j()},{merge:!0});try{return await X(B(N,M.candidates,t),await Ka(e,t,{...a,candidateCode:t}),{merge:!0}),{candidateCode:t,atsSynced:!0}}catch(n){return console.warn("Candidate ATS sync failed.",n),{candidateCode:t,atsSynced:!1}}}async function Vt(){var n;Q();const e=await((n=U.currentUser)==null?void 0:n.getIdToken());if(!e)throw new Error("You must be signed in to delete your account.");const a=await fetch("/api/delete-account",{method:"POST",headers:{Authorization:`Bearer ${e}`}}),t=await a.json().catch(()=>({}));if(!a.ok||!t.ok)throw new Error(t.error||"Failed to delete account.");return t}async function Qt(e){const a=await fetch("/api/send-reset",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:e,continueUrl:`${window.location.origin}/reset-password`})}),t=await a.json().catch(()=>({}));if(!a.ok||!t.ok)throw new Error(t.error||"Failed to send the reset email.");return t}async function Jt(e,a){Q();const t=a.name.replace(/[^a-z0-9._-]/gi,"-").toLowerCase(),n=`candidate-photos/${e}/${Date.now()}-${t}`,s=ha(ea,n);await Va(s,a,{contentType:a.type||"application/octet-stream"});const i=await Qa(s);return await X(B(N,M.users,e),{photoURL:i,updatedAt:j()},{merge:!0}),i}async function ya(e,a,t){Q();let n=null,s=Qe(e);try{const p=await Pe(B(N,M.users,e));if(p.exists()){const u=p.data();n=u.activeCvId||null,u.candidateCode&&(s=u.candidateCode)}}catch{}const i=a.name.replace(/[^a-z0-9._-]/gi,"-").toLowerCase(),l=`candidate-cvs/${e}/${Date.now()}-${i}`,o=ha(ea,l);await Va(o,a,{contentType:a.type||"application/octet-stream"});const d=await Qa(o),c={id:l,name:t||a.name,fileName:a.name,url:d,uploadedAt:new Date().toISOString()};return await X(B(N,M.users,e),{cvLibrary:fa(c),activeCvId:c.id,activeCvName:c.name||c.fileName,cvUrl:d,updatedAt:j()},{merge:!0}),X(B(N,M.candidates,s),{cvUrl:d,activeCvId:c.id,activeCvName:c.name||c.fileName,updatedAt:j()},{merge:!0}).catch(()=>null),n&&n!==l&&qt(ha(ea,n)).catch(()=>{}),c}function Wt(e,a){if(Q(),!e)return()=>{};const t=de(ie(N,M.notifications),ue("recipientUid","==",e),pe(50));return Tt(t,n=>{const s=n.docs.map(i=>({id:i.id,...i.data()})).sort((i,l)=>{var c,p;const o=(c=i.createdAt)!=null&&c.toDate?i.createdAt.toDate().getTime():new Date(i.createdAt||0).getTime();return((p=l.createdAt)!=null&&p.toDate?l.createdAt.toDate().getTime():new Date(l.createdAt||0).getTime())-o});a(s)})}async function Yt(e){Q(),e&&await X(B(N,M.notifications,e),{read:!0,readAt:j()},{merge:!0})}async function Kt(e,a){Q(),await X(B(N,M.notificationPreferences,e),{uid:e,app:"talent.nearwork.co",preferences:a,updatedAt:j()},{merge:!0})}async function ka(e){var a;if(!e)return null;try{const t=await new Promise((L,k)=>{const A=new FileReader;A.onload=()=>L(A.result.split(",")[1]),A.onerror=k,A.readAsDataURL(e)}),n=await((a=U.currentUser)==null?void 0:a.getIdToken().catch(()=>""))??"",s=await fetch("/api/parse-cv",{method:"POST",headers:{"Content-Type":"application/json",...n?{Authorization:`Bearer ${n}`}:{}},body:JSON.stringify({data:t,filename:e.name,mimeType:e.type||"application/octet-stream"})});if(!s.ok)return null;const i=await s.json();if(!(i!=null&&i.ok))return null;const{name:l,phone:o,city:d,summary:c,skills:p,workHistory:u,languages:v,certifications:w}=i;return{name:l,phone:o,city:d,summary:c,skills:p,workHistory:u,languages:v||[],certifications:w||[]}}catch{return null}}async function Zt(e){return kt(U,e)}let se=null,Me=!1,aa=null,Aa=1,P={},le=null,Ve=null,_=null,He=!1,Z=!1,re=null;const ia=document.querySelector("#app"),Xt="+573135928691",en="https://wa.me/573135928691",Ie={"Customer Success":["Customer Success Manager","Customer Success Associate","Account Manager","Technical Account Manager","Client Success Specialist","Implementation Specialist","Onboarding Specialist","Renewals Manager"],Sales:["SDR / Sales Development Rep","BDR / Business Development Rep","Account Executive","Inside Sales Representative","Channel Sales Manager","Sales Operations Specialist","Revenue Operations Specialist","Sales Manager"],Support:["Technical Support Specialist","Customer Support Representative","Help Desk Technician","Escalations Specialist","Support Team Lead","QA Support Analyst"],Operations:["Operations Manager","Operations Analyst","Executive Assistant","Administrative Assistant","Virtual Assistant","Office Manager","Project Coordinator","Procurement Specialist","Logistics Coordinator","Recruiting Coordinator"],Marketing:["Marketing Ops / Content Specialist","Content Writer","SEO Specialist","Email Marketing Specialist","Lifecycle Marketing Specialist","Social Media Manager","Graphic Designer","Growth Marketing Specialist"],Engineering:["Software Developer (Full Stack)","Frontend Developer","Backend Developer","Mobile Developer","DevOps Engineer","No-Code Developer","Data Analyst","Data Engineer","QA Engineer","Product Manager"],Finance:["Bookkeeper","Accounting Assistant","Accounts Payable / Receivable Specialist","Financial Analyst","FP&A Analyst","Payroll Specialist","Tax Analyst"],"Human Resources":["HR Generalist","Recruiter / Talent Sourcer","People Operations Specialist","Payroll & Benefits Coordinator","Learning & Development Coordinator"],"Healthcare & Insurance":["Insurance Account Manager","Claims Specialist","Medical Billing Specialist","Healthcare Virtual Assistant","Patient Coordinator"],Other:["Other / Not Listed"]},an={"CRM & Sales":["HubSpot","Salesforce","Pipedrive","Apollo","Outbound","Cold Email","Discovery Calls","CRM Hygiene"],"Customer Success":["SaaS","Customer Success","QBRs","Onboarding","Renewals","Expansion","Churn Reduction","Intercom","Zendesk"],Support:["Technical Support","Tickets","Troubleshooting","APIs","Bug Reproduction","Help Center","CSAT"],Operations:["Excel","Google Sheets","Reporting","Process Design","Project Management","Notion","Airtable","Zapier"],Marketing:["Content","SEO","Lifecycle","Email Marketing","HubSpot Marketing","Copywriting","Analytics"],Engineering:["JavaScript","React","Node.js","SQL","Python","REST APIs","QA","GitHub"],Language:["English B2","English C1","English C2","Spanish Native"]},tn=["Account Management","Accounts Payable","Accounts Receivable","Adobe Creative Suite","Agile","AI Tools","Analytics","Appointment Setting","B2B Sales","B2C Sales","Billing","Bookkeeping","Business Analysis","Canva","Cash Collections","Chat Support","Cold Calling","Community Management","Compliance","Content Strategy","Contract Management","Customer Onboarding","Customer Retention","Customer Service","Data Analysis","Data Entry","Email Support","Excel / Google Sheets","Executive Assistance","Figma","Financial Reporting","Forecasting","Helpdesk","HR Operations","Inbound Calls","Insurance Support","Lead Generation","Live Chat","Logistics","Looker","Microsoft Office","NetSuite","Outbound Calls","Payroll","Performance Marketing","Power BI","Product Support","QuickBooks","Recruiting","Salesforce Administration","Sales Operations","Shopify","Slack","Social Media","SQL Reporting","Stripe","Tableau","Technical Writing","Ticket Quality","Training","Vendor Management","WordPress","Workday","Workforce Management","Zendesk Guide","Zoho"],at=[...new Set([...Object.values(an).flat(),...tn])].sort((e,a)=>e.localeCompare(a)),tt=["Colombia","Afghanistan","Albania","Algeria","Andorra","Angola","Antigua and Barbuda","Argentina","Armenia","Australia","Austria","Azerbaijan","Bahamas","Bahrain","Bangladesh","Barbados","Belarus","Belgium","Belize","Benin","Bhutan","Bolivia","Bosnia and Herzegovina","Botswana","Brazil","Brunei","Bulgaria","Burkina Faso","Burundi","Cambodia","Cameroon","Canada","Cape Verde","Central African Republic","Chad","Chile","China","Comoros","Congo (Brazzaville)","Congo (Kinshasa)","Costa Rica","Côte d'Ivoire","Croatia","Cuba","Cyprus","Czechia","Denmark","Djibouti","Dominica","Dominican Republic","Ecuador","Egypt","El Salvador","Equatorial Guinea","Eritrea","Estonia","Eswatini","Ethiopia","Fiji","Finland","France","Gabon","Gambia","Georgia","Germany","Ghana","Greece","Grenada","Guatemala","Guinea","Guinea-Bissau","Guyana","Haiti","Honduras","Hungary","Iceland","India","Indonesia","Iran","Iraq","Ireland","Israel","Italy","Jamaica","Japan","Jordan","Kazakhstan","Kenya","Kiribati","Kosovo","Kuwait","Kyrgyzstan","Laos","Latvia","Lebanon","Lesotho","Liberia","Libya","Liechtenstein","Lithuania","Luxembourg","Madagascar","Malawi","Malaysia","Maldives","Mali","Malta","Marshall Islands","Mauritania","Mauritius","Mexico","Micronesia","Moldova","Monaco","Mongolia","Montenegro","Morocco","Mozambique","Myanmar","Namibia","Nauru","Nepal","Netherlands","New Zealand","Nicaragua","Niger","Nigeria","North Korea","North Macedonia","Norway","Oman","Pakistan","Palau","Palestine","Panama","Papua New Guinea","Paraguay","Peru","Philippines","Poland","Portugal","Qatar","Romania","Russia","Rwanda","Saint Kitts and Nevis","Saint Lucia","Saint Vincent and the Grenadines","Samoa","San Marino","Sao Tome and Principe","Saudi Arabia","Senegal","Serbia","Seychelles","Sierra Leone","Singapore","Slovakia","Slovenia","Solomon Islands","Somalia","South Africa","South Korea","South Sudan","Spain","Sri Lanka","Sudan","Suriname","Sweden","Switzerland","Syria","Taiwan","Tajikistan","Tanzania","Thailand","Timor-Leste","Togo","Tonga","Trinidad and Tobago","Tunisia","Turkey","Turkmenistan","Tuvalu","Uganda","Ukraine","United Arab Emirates","United Kingdom","United States","Uruguay","Uzbekistan","Vanuatu","Vatican City","Venezuela","Vietnam","Yemen","Zambia","Zimbabwe"],ge={Amazonas:["El Encanto","La Chorrera","La Pedrera","La Victoria","Leticia","Miriti - Paraná","Puerto Alegría","Puerto Arica","Puerto Nariño","Puerto Santander","Tarapacá"],Antioquia:["Abejorral","Abriaquí","Alejandría","Amagá","Amalfi","Andes","Angelópolis","Angostura","Anorí","Anza","Apartadó","Arboletes","Argelia","Armenia","Barbosa","Bello","Belmira","Betania","Betulia","Briceño","Buriticá","Cáceres","Caicedo","Caldas","Campamento","Cañasgordas","Caracolí","Caramanta","Carepa","Carmen de Viboral","Carolina","Caucasia","Chigorodó","Cisneros","Ciudad Bolívar","Cocorná","Concepción","Concordia","Copacabana","Dabeiba","Don Matías","Ebéjico","El Bagre","Entrerríos","Envigado","Fredonia","Frontino","Giraldo","Girardota","Gómez Plata","Granada","Guadalupe","Guarne","Guatapé","Heliconia","Hispania","Itagüí","Ituango","Jardín","Jericó","La Ceja","La Estrella","La Pintada","La Unión","Liborina","Maceo","Marinilla","Medellín","Montebello","Murindó","Mutata","Nariño","Nechí","Necoclí","Olaya","Peñol","Peque","Pueblorrico","Puerto Berrío","Puerto Nare","Puerto Triunfo","Remedios","Retiro","Rionegro","Sabanalarga","Sabaneta","Salgar","San Andrés","San Carlos","San Francisco","San Jerónimo","San José de la Montaña","San Juan de Urabá","San Luis","San Pedro","San Pedro de Urabá","San Rafael","San Roque","San Vicente","Santa Bárbara","Santa Rosa de Osos","Santafé de Antioquia","Santo Domingo","Santuario","Segovia","Sonsón","Sopetrán","Támesis","Tarazá","Tarso","Titiribí","Toledo","Turbo","Uramita","Urrao","Valdivia","Valparaíso","Vegachí","Venecia","Vigía del Fuerte","Yalí","Yarumal","Yolombó","Yondó","Zaragoza"],Arauca:["Arauca","Arauquita","Cravo Norte","Fortul","Puerto Rondón","Saravena","Tame"],Atlántico:["Baranoa","Barranquilla","Campo de la Cruz","Candelaria","Galapa","Juan de Acosta","Luruaco","Malambo","Manatí","Palmar de Varela","Piojó","Polonuevo","Ponedera","Puerto Colombia","Repelón","Sabanagrande","Sabanalarga","Santa Lucía","Santo Tomás","Soledad","Suan","Tubara","Usiacurí"],"Bogotá D.C.":["Bogotá"],Bolívar:["Achí","Altos del Rosario","Arenal","Arjona","Arroyohondo","Barranco de Loba","Calamar","Cantagallo","Carmen de Bolívar","Cartagena","Cicuco","Clemencia","Córdoba","El Guamo","El Peñón","Hatillo de Loba","Magangué","Mahates","Margarita","María la Baja","Mompós","Montecristo","Morales","Pinillos","Regidor","Río Viejo","San Cristóbal","San Estanislao","San Fernando","San Jacinto","San Jacinto del Cauca","San Juan Nepomuceno","San Martín de Loba","San Pablo","Santa Catalina","Santa Rosa de Lima","Santa Rosa del Sur","Simití","Soplaviento","Talaigua Nuevo","Tiquisio","Turbaco","Turbana","Villanueva","Zambrano"],Boyacá:["Almeida","Aquitania","Arcabuco","Belén","Berbeo","Betéitiva","Boavita","Boyacá","Briceño","Buenavista","Busbanzá","Caldas","Campohermoso","Cerinza","Chinavita","Chiquinquirá","Chíquiza","Chiscas","Chita","Chitaraque","Chivatá","Chivor","Ciénega","Cómbita","Coper","Corrales","Covarachía","Cubará","Cucaita","Cuítiva","Duitama","El Cocuy","El Espino","Firavitoba","Floresta","Gachantivá","Gameza","Garagoa","Guacamayas","Guateque","Guayatá","Güicán","Iza","Jenesano","Jericó","La Capilla","La Uvita","La Victoria","Labranzagrande","Macanal","Maripí","Miraflores","Mongua","Monguí","Moniquirá","Motavita","Muzo","Nobsa","Nuevo Colón","Oicatá","Otanche","Pachavita","Páez","Paipa","Pajarito","Panqueba","Pauna","Paya","Paz de Río","Pesca","Pisba","Puerto Boyacá","Quípama","Ramiriquí","Ráquira","Rondón","Saboyá","Sáchica","Samacá","San Eduardo","San José de Pare","San Luis de Gaceno","San Mateo","San Miguel de Sema","San Pablo Borbur","Santa María","Santa Rosa de Viterbo","Santa Sofía","Santana","Sativanorte","Sativasur","Siachoque","Soatá","Socha","Socotá","Sogamoso","Somondoco","Sora","Soracá","Sotaquirá","Susacón","Sutamarchán","Sutatenza","Tasco","Tenza","Tibaná","Tibasosa","Tinjacá","Tipacoque","Toca","Togüí","Tópaga","Tota","Tunja","Tununguá","Turmequé","Tuta","Tutazá","Umbita","Ventaquemada","Villa de Leyva","Viracachá","Zetaquira"],Caldas:["Aguadas","Anserma","Aranzazu","Belalcázar","Chinchiná","Filadelfia","La Dorada","La Merced","Manizales","Manzanares","Marmato","Marquetalia","Marulanda","Neira","Norcasia","Pácora","Palestina","Pensilvania","Riosucio","Risaralda","Salamina","Samaná","San José","Supía","Victoria","Villamaría","Viterbo"],Caquetá:["Albania","Belén de los Andaquíes","Cartagena del Chairá","Currillo","El Doncello","El Paujil","Florencia","La Montañita","Milán","Morelia","Puerto Rico","San José del Fragua","San Vicente del Caguán","Solano","Solita","Valparaiso"],Casanare:["Aguazul","Chameza","Hato Corozal","La Salina","Maní","Monterrey","Nunchía","Orocué","Paz de Ariporo","Pore","Recetor","Sabanalarga","Sácama","San Luis de Palenque","Támara","Tauramena","Trinidad","Villanueva","Yopal"],Cauca:["Almaguer","Argelia","Balboa","Bolívar","Buenos Aires","Cajibío","Caldono","Caloto","Corinto","El Tambo","Florencia","Guapi","Inzá","Jambalo","La Sierra","La Vega","Lopez","Mercaderes","Miranda","Morales","Padilla","Paez","Patia","Piamonte","Piendamo","Popayán","Puerto Tejada","Purace","Rosas","San Sebastian","Santa Rosa","Santander de Quilichao","Silvia","Sotara","Suarez","Sucre","Timbio","Timbiqui","Toribio","Totoro","Villa Rica"],Cesar:["Aguachica","Agustín Codazzi","Astrea","Becerril","Bosconia","Chimichagua","Chiriguaná","Curumaní","El Copey","El Paso","Gamarra","González","La Gloria","La Jagua de Ibirico","La Paz","Manaure","Pailitas","Pelaya","Pueblo Bello","Río de Oro","San Alberto","San Diego","San Martín","Tamalameque","Valledupar"],Chocó:["Acandí","Alto Baudó","Atrato","Bagadó","Bahía Solano","Bajo Baudó","Belén de Bajirá","Bojayá","Cantón de San Pablo","Carmen del Darién","Cértegui","Condoto","El Carmen de Atrato","El Litoral del San Juan","Istmina","Juradó","Lloró","Medio Atrato","Medio Baudó","Medio San Juan","Nóvita","Nuquí","Quibdó","Río Iró","Río Quito","Riosucio","San José del Palmar","Sipí","Tadó","Unguía","Unión Panamericana"],Córdoba:["Ayapel","Buenavista","Canalete","Cereté","Chimá","Chinú","Ciénaga de Oro","Cotorra","La Apartada","Lorica","Los Córdobas","Momil","Moñitos","Montelíbano","Montería","Planeta Rica","Pueblo Nuevo","Puerto Escondido","Puerto Libertador","Purísima","Sahagún","San Andrés de Sotavento","San Antero","San Bernardo del Viento","San Carlos","San Pelayo","Tierralta","Valencia"],Cundinamarca:["Agua de Dios","Albán","Anapoima","Anolaima","Apulo","Arbeláez","Beltrán","Bituima","Bojacá","Cabrera","Cachipay","Cajicá","Caparrapí","Cáqueza","Carmen de Carupa","Chaguaní","Chía","Chipaque","Choachí","Chocontá","Cogua","Cota","Cucunubá","El Colegio","El Peñón","El Rosal","Facatativá","Fomeque","Fosca","Funza","Fúquene","Fusagasugá","Gachala","Gachancipá","Gachetá","Gama","Girardot","Granada","Guachetá","Guaduas","Guasca","Guataquí","Guatavita","Guayabal de Síquima","Guayabetal","Gutiérrez","Jerusalén","Junín","La Calera","La Mesa","La Palma","La Peña","La Vega","Lenguazaque","Macheta","Madrid","Manta","Medina","Mosquera","Nariño","Nemocón","Nilo","Nimaima","Nocaima","Pacho","Paime","Pandi","Paratebueno","Pasca","Puerto Salgar","Puli","Quebradanegra","Quetame","Quipile","Ricaurte","San Antonio de Tequendama","San Bernardo","San Cayetano","San Francisco","San Juan de Rioseco","Sasaima","Sesquilé","Sibaté","Silvania","Simijaca","Soacha","Sopó","Subachoque","Suesca","Supatá","Susa","Sutatausa","Tabio","Tausa","Tena","Tenjo","Tibacuy","Tibirita","Tocaima","Tocancipá","Topaipí","Ubalá","Ubaque","Ubaté","Une","Útica","Venecia","Vergara","Vianí","Villagómez","Villapinzón","Villeta","Viotá","Yacopí","Zipacón","Zipaquirá"],Guainía:["Barranco Minas","Cacahual","Inírida","La Guadalupe","Mapiripana","Morichal","Pana Pana","Puerto Colombia","San Felipe"],Guaviare:["Calamar","El Retorno","Miraflores","San José del Guaviare"],Huila:["Acevedo","Agrado","Aipe","Algeciras","Altamira","Baraya","Campoalegre","Colombia","Elías","Garzón","Gigante","Guadalupe","Hobo","Iquira","Isnos","La Argentina","La Plata","Nátaga","Neiva","Oporapa","Paicol","Palermo","Palestina","Pital","Pitalito","Rivera","Saladoblanco","San Agustín","Santa María","Suaza","Tarqui","Tello","Teruel","Tesalia","Timaná","Villavieja","Yaguará"],"La Guajira":["Albania","Barrancas","Dibulla","Distracción","El Molino","Fonseca","Hatonuevo","La Jagua del Pilar","Maicao","Manaure","Riohacha","San Juan del Cesar","Uribia","Urumita","Villanueva"],Magdalena:["Algarrobo","Aracataca","Ariguaní","Cerro San Antonio","Chibolo","Ciénaga","Concordia","El Banco","El Piñón","El Reten","Fundación","Guamal","Nueva Granada","Pedraza","Pijiño del Carmen","Pivijay","Plato","Pueblo Viejo","Remolino","Sabanas de San Ángel","Salamina","San Sebastián de Buenavista","San Zenón","Santa Ana","Santa Bárbara de Pinto","Santa Marta","Sitionuevo","Tenerife","Zapayán","Zona Bananera"],Meta:["Acacías","Barranca de Upía","Cabuyaro","Castilla la Nueva","Cumaral","El Calvario","El Castillo","El Dorado","Fuente de Oro","Granada","Guamal","La Macarena","La Uribe","Lejanías","Mapiripán","Mesetas","Puerto Concordia","Puerto Gaitán","Puerto Lleras","Puerto López","Puerto Rico","Restrepo","San Carlos Guaroa","San Juan de Arama","San Juanito","San Luis de Cubarral","San Martín","Villavicencio","Vista Hermosa"],Nariño:["Albán","Aldana","Ancuyá","Arboleda","Barbacoas","Belén","Buesaco","Chachagüí","Colón","Consacá","Contadero","Córdoba","Cuaspud","Cumbal","Cumbitara","El Charco","El Peñol","El Rosario","El Tablón de Gómez","El Tambo","Francisco Pizarro","Funes","Guachucal","Guaitarilla","Gualmatán","Iles","Imues","Ipiales","La Cruz","La Florida","La Llanada","La Tola","La Unión","Leiva","Linares","Los Andes","Magüí Payán","Mallama","Mosquera","Nariño","Olaya Herrera","Ospina","Pasto","Policarpa","Potosí","Providencia","Puerres","Pupiales","Ricaurte","Roberto Payán","Samaniego","San Bernardo","San Lorenzo","San Pablo","San Pedro de Cartago","Sandoná","Santa Bárbara","Santa Cruz","Sapuyes","Taminango","Tangua","Tumaco","Túquerres","Yacuanquer"],"Norte de Santander":["Abrego","Arboledas","Bochalema","Bucarasica","Cachirá","Cácota","Chinácota","Chitagá","Convención","Cúcuta","Cucutilla","Durania","El Carmen","El Tarra","El Zulia","Gramalote","Hacarí","Herrán","La Esperanza","La Playa","Labateca","Los Patios","Lourdes","Mutiscua","Ocaña","Pamplona","Pamplonita","Puerto Santander","Ragonvalia","Salazar","San Calixto","San Cayetano","Santiago","Sardinata","Silos","Teorama","Tibú","Toledo","Villa Caro","Villa del Rosario"],Putumayo:["Colón","Mocoa","Orito","Puerto Asís","Puerto Caicedo","Puerto Guzmán","Puerto Leguizamo","San Francisco","San Miguel","Santiago","Sibundoy","Valle del Guamuez","Villa Garzón"],Quindío:["Armenia","Buenavista","Calarcá","Circasia","Córdoba","Filandia","Génova","La Tebaida","Montenegro","Pijao","Quimbaya","Salento"],Risaralda:["Apía","Balboa","Belén de Umbría","Dosquebradas","Guática","La Celia","La Virginia","Marsella","Mistrató","Pereira","Pueblo Rico","Quinchía","Santa Rosa de Cabal","Santuario"],"San Andrés y Providencia":["Providencia y Santa Catalina","San Andrés"],Santander:["Aguada","Albania","Aratoca","Barbosa","Barichara","Barrancabermeja","Betulia","Bolívar","Bucaramanga","Cabrera","California","Capitanejo","Carcasí","Cepitá","Cerrito","Charalá","Charta","Chima","Chipatá","Cimitarra","Concepción","Confines","Contratación","Coromoro","Curití","El Carmen de Chucurí","El Guacamayo","El Peñón","El Playón","Encino","Enciso","Florián","Floridablanca","Galán","Gambita","Girón","Guaca","Guadalupe","Guapotá","Guavatá","Güepsa","Hato","Jesús María","Jordán","La Belleza","La Paz","Landázuri","Lebríja","Los Santos","Macaravita","Málaga","Matanza","Mogotes","Molagavita","Ocamonte","Oiba","Onzaga","Palmar","Palmas del Socorro","Páramo","Piedecuesta","Pinchote","Puente Nacional","Puerto Parra","Puerto Wilches","Rionegro","Sabana de Torres","San Andrés","San Benito","San Gil","San Joaquín","San José de Miranda","San Miguel","San Vicente de Chucurí","Santa Bárbara","Santa Helena del Opón","Simacota","Socorro","Suaita","Sucre","Surata","Tona","Valle de San José","Vélez","Vetas","Villanueva","Zapatoca"],Sucre:["Buenavista","Caimito","Chalán","Coloso","Corozal","Coveñas","El Roble","Galeras","Guaranda","La Unión","Los Palmitos","Majagual","Morroa","Ovejas","Palmito","Sampués","San Benito Abad","San Juan Betulia","San Marcos","San Onofre","San Pedro","Santiago de Tolú","Sincé","Sincelejo","Sucre","Tolú Viejo"],Tolima:["Alpujarra","Alvarado","Ambalema","Anzoátegui","Armero","Ataco","Cajamarca","Carmen de Apicalá","Casabianca","Chaparral","Coello","Coyaima","Cunday","Dolores","Espinal","Falan","Flandes","Fresno","Guamo","Herveo","Honda","Ibagué","Icononzo","Lérida","Líbano","Mariquita","Melgar","Murillo","Natagaima","Ortega","Palocabildo","Piedras","Planadas","Prado","Purificación","Rioblanco","Roncesvalles","Rovira","Saldaña","San Antonio","San Luis","Santa Isabel","Suárez","Valle de San Juan","Venadillo","Villahermosa","Villarrica"],"Valle del Cauca":["Alcalá","Andalucía","Ansermanuevo","Argelia","Bolívar","Buenaventura","Buga","Bugalagrande","Caicedonia","Cali","Calima","Candelaria","Cartago","Dagua","El Águila","El Cairo","El Cerrito","El Dovio","Florida","Ginebra","Guacarí","Jamundí","La Cumbre","La Unión","La Victoria","Obando","Palmira","Pradera","Restrepo","Riofrío","Roldanillo","San Pedro","Sevilla","Toro","Trujillo","Tuluá","Ulloa","Versalles","Vijes","Yotoco","Yumbo","Zarzal"],Vaupés:["Carurú","Mitú","Pacoa","Papunahua","Taraira","Yavaraté"],Vichada:["Cumaribo","La Primavera","Puerto Carreño","Santa Rosalía"]},nn=[{title:"How to answer salary questions",tag:"Interview",read:"4 min",body:"Use a confident range, anchor it to the role, and avoid apologizing for earning in USD.",actions:["Know your floor","Use monthly USD","Mention flexibility last"]},{title:"Writing a CV for US SaaS companies",tag:"CV",read:"6 min",body:"Translate local experience into metrics US hiring managers can scan in under a minute.",actions:["Lead with outcomes","Add tools","Quantify scope"]},{title:"Before your recruiter screen",tag:"Process",read:"3 min",body:"Prepare availability, compensation, English comfort, and two strong role stories.",actions:["Check your setup","Review the opening","Bring questions"]},{title:"STAR stories that feel natural",tag:"Interview",read:"5 min",body:"Keep stories specific, concise, and tied to business impact instead of job duties.",actions:["Situation","Action","Result"]}],Fa=[{key:"profile-review",label:"Profile Review",help:"We are checking role fit and your candidate profile."},{key:"background-check",label:"Background Checks",help:"Nearwork is verifying relevant background and work details."},{key:"assessment",label:"Assessment",help:"Complete role-specific questions when assigned."},{key:"interview",label:"Interview",help:"Meet the recruiter and book your next conversation."},{key:"presented",label:"Presented",help:"Your profile has been prepared for the company."},{key:"client-review",label:"Client Review",help:"The company is reviewing your profile and next steps."},{key:"hired",label:"Hired",help:"Offer accepted and onboarding is ready to begin."}],nt=["Applied","Assessment","Interview","Final round","Offer"];let r={user:null,candidate:null,applications:[],assessments:[],notifications:[],notificationPanelOpen:!1,notificationSettingsOpen:!1,jobs:[],loading:!0,view:"login",activePage:"overview",matchesFiltered:!1,message:"",assessmentUiStep:null,showDeleteAccountModal:!1,deleteAccountStatus:null,deleteAccountError:"",showUnsavedChangesModal:!1,resetCodeStatus:null,resetCodeError:""},V=null;const ua=sessionStorage.getItem("nw_restore_path");ua&&(sessionStorage.removeItem("nw_restore_path"),window.history.replaceState({page:ua},"",ua));function st(){return[["overview","layout-dashboard","Overview"],["matches","briefcase-business","Matches"],["applications","send","Applications"],["assessment","clipboard-check","Assessment"],["cvs","files","CV Picker"],["tips","book-open","Tips"],["recruiter","calendar-days","Recruiter"],["profile","user-round-cog","Profile"]]}function ta(){const a=window.location.pathname.split("/").filter(Boolean)[0];return a==="onboarding"?"onboarding":a==="assessment"||a==="assessments"?"assessment":st().some(([t])=>t===a)?a:"overview"}function ye(){const e=window.location.pathname.split("/").filter(Boolean);return(e[0]==="assessment"||e[0]==="assessments")&&e[1]||""}function it(){const e=window.location.pathname.split("/").filter(Boolean),a=e.findIndex(n=>n==="q"||n==="question");if(a===-1)return null;const t=Number(e[a+1]);return Number.isFinite(t)&&t>0?t-1:null}function sn(e,a=0){return`/assessment/${encodeURIComponent(e)}/start/q/${Number(a||0)+1}`}function Ne(e,a=0,t=!1){const n=sn(e,a);if(window.location.pathname===n)return;const s=t?"replaceState":"pushState";window.history[s]({page:"assessment",assessmentId:e,questionIndex:a},"",n)}function m(e,a){return`<i data-lucide="${e}" aria-label="${e}"></i>`}let pa=!1;function De(){if(window.lucide){window.lucide.createIcons();return}if(pa)return;pa=!0;const e=()=>{window.lucide?(window.lucide.createIcons(),pa=!1):setTimeout(e,50)};e()}function C(e){r={...r,...e},bt()}function je(e,a=!0){const n=e==="onboarding"||st().some(([s])=>s===e)?e:"overview";r={...r,activePage:n,matchesFiltered:n==="matches"?r.matchesFiltered:!1,message:"",assessmentUiStep:null},a&&window.history.pushState({page:n},"",n==="overview"?"/":`/${n}`),bt()}function ot(){var a,t;return(((a=r.candidate)==null?void 0:a.name)||((t=r.user)==null?void 0:t.displayName)||"there").split(" ")[0]||"there"}function on(){var a,t,n;return(((a=r.candidate)==null?void 0:a.name)||((t=r.user)==null?void 0:t.displayName)||((n=r.user)==null?void 0:n.email)||"NW").split(/[ @.]/).filter(Boolean).slice(0,2).map(s=>s[0]).join("").toUpperCase()}function rt(e="normal"){var n,s;const a=((n=r.candidate)==null?void 0:n.photoURL)||((s=r.user)==null?void 0:s.photoURL)||"",t=e==="large"?"avatar avatar-large":"avatar";return a?`<img class="${t}" src="${h(a)}" alt="${h(ot())}" />`:`<div class="${t}">${on()}</div>`}function h(e){return String(e||"").replaceAll("&","&amp;").replaceAll('"',"&quot;").replaceAll("<","&lt;").replaceAll(">","&gt;")}function E(e){return String(e||"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;")}function oa(e){if(!e)return"Recently";const a=e.toDate?e.toDate():new Date(e);return new Intl.DateTimeFormat("en",{month:"short",day:"numeric"}).format(a)}function Je(){var a;const e=((a=r.candidate)==null?void 0:a.skills)||[];return Array.isArray(e)?e:String(e).split(",").map(t=>t.trim()).filter(Boolean)}function K(e){return String(e||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/&/g," and ").replace(/[^a-z0-9]+/g," ").trim().replace(/\s+/g," ")}function xa(e,a=Je()){const t=Ce(e),n=new Set((t.skills||[]).map(K).filter(Boolean)),s=new Map(a.map(i=>[K(i),i]).filter(([i])=>i));return[...s.keys()].filter(i=>n.has(i)).map(i=>s.get(i))}function lt(e){return["Nearwork candidate","Talent member"].includes(String(e||"").trim())}function Oa(e){if(!e)return null;if(e.toDate)return e.toDate();if(typeof e=="object"&&typeof e.seconds=="number")return new Date(e.seconds*1e3);const a=new Date(e);return Number.isNaN(a.getTime())?null:a}function Pa(e){return Number(e||1)===1?"Technical Assessment":"DISC Assessment"}function ma(e,a){var t,n,s;return((n=(t=e==null?void 0:e.answers)==null?void 0:t[a==null?void 0:a.id])==null?void 0:n.value)??((s=e==null?void 0:e.answers)==null?void 0:s[a==null?void 0:a.id])??""}function qe(e){return e!=null&&e!==""}function oe(e,a){return((e==null?void 0:e.questions)||[]).slice(0,70).filter(t=>Number(t.stage||1)===Number(a))}function wa(e,a,t=(e==null?void 0:e.answers)||{}){return oe(e,a).filter(n=>{var s;return!qe(((s=t[n.id])==null?void 0:s.value)??t[n.id])})}function rn(){var e,a;return!!((r.applications||[]).length||(((e=r.candidate)==null?void 0:e.pipelineCodes)||[]).length||(a=r.candidate)!=null&&a.pipelineCode)}function ln(){var i,l,o,d,c;const e=((i=r.candidate)==null?void 0:i.locationCountry)||((l=r.candidate)==null?void 0:l.country)||"Colombia",a=((o=r.candidate)==null?void 0:o.department)||"Bogotá D.C.",t=ge[a]||ge["Bogotá D.C."]||["Bogotá"],n=((d=r.candidate)==null?void 0:d.city)||((c=r.candidate)==null?void 0:c.locationCity)||t[0],s=e==="Colombia"?`${n}, ${a}`:e;return{country:e,department:a,city:n,label:s}}function cn(){var a,t,n;const e=((a=r.candidate)==null?void 0:a.targetRole)||((t=r.candidate)==null?void 0:t.headline)||"";return((n=Object.entries(Ie).find(([,s])=>s.includes(e)))==null?void 0:n[0])||Object.keys(Ie)[0]}function ct(e){return Object.keys(Ie).map(a=>`<option value="${h(a)}" ${a===e?"selected":""}>${a}</option>`).join("")}function ra(e,a){const t=Ie[e]||Object.values(Ie).flat();return['<option value="">Choose the closest role</option>'].concat(t.map(n=>`<option value="${h(n)}" ${a===n?"selected":""}>${n}</option>`)).join("")}function Ee(e){const a=String(e||"").replace(/[,.\s]+$/,"").replace(/^[,.\s]+/,"").trim();if(!a||a.length<2)return"";const t=at.find(n=>K(n)===K(a));return t||a.split(/\s+/).map(n=>n.length<=3&&n===n.toUpperCase()?n:n.charAt(0).toUpperCase()+n.slice(1).toLowerCase()).join(" ")}function dt(e){const a=[...new Set((e||[]).map(Ee).filter(Boolean))],t=["Customer Service","Salesforce","HubSpot","Excel","Google Sheets","Technical Support","Outbound Calls","React","SQL","Payroll"];return`
    <div class="skill-search-shell" data-skill-search>
      <div class="selected-skills" id="selectedSkills">
        ${a.map(n=>`
          <span class="selected-skill" data-skill-chip="${h(n)}">
            ${E(n)}
            <button type="button" class="skill-remove" data-remove-skill="${h(n)}" aria-label="Remove ${h(n)}">×</button>
            <input type="hidden" name="skills" value="${h(n)}" />
          </span>
        `).join("")||'<span class="skill-empty">Selected skills will appear here.</span>'}
      </div>
      <div class="skill-search-box">
        <input id="skillSearchInput" type="search" autocomplete="off" placeholder="Type any skill — e.g. Salesforce, Excel, B2B sales, Canva…" />
        <button class="secondary-action" type="button" id="addTypedSkill">Add skill</button>
      </div>
      <div class="skill-suggestions" id="skillSuggestions">
        ${t.map(n=>`<button type="button" class="skill-suggestion" data-skill="${h(n)}">${E(n)}</button>`).join("")}
      </div>
      <p class="field-hint">Select between 5 and 20 skills that best describe your experience.</p>
    </div>
  `}function ut(e,a="USD"){const t=Number(String(e||"").replace(/[^\d.]/g,"")),n=String(a||"USD").toUpperCase()==="COP"?"COP":"USD";if(!Number.isFinite(t)||t<=0)return{salary:"",salaryUSD:null,salaryCurrency:n,salaryAmount:null};const s=Math.round(t),i=n==="COP"?"es-CO":"en-US";return{salary:`$${new Intl.NumberFormat(i).format(s)} ${n}/mo`,salaryUSD:n==="USD"?s:null,salaryCurrency:n,salaryAmount:s}}function pt(e){return Number(String(e||"").replace(/[^\d.]/g,""))}function ja(e,a="USD"){const t=pt(e),n=String(a||"USD").toUpperCase()==="COP"?"COP":"USD";return n==="USD"&&t>=1e5?"COP":n}function ba(e,a="USD"){const t=pt(e);return!Number.isFinite(t)||t<=0?"":new Intl.NumberFormat("en-US",{maximumFractionDigits:0}).format(Math.round(t))}function mt(e){return Array.isArray(e)?e:String(e||"").split(",").map(a=>a.trim()).filter(Boolean)}function Ce(e){const a=mt(e.skills||e.requiredSkills);return{id:e.id||e.code,code:e.code||e.id,title:e.title||e.role||e.openingTitle||"Open role",orgName:e.orgName||e.company||e.clientName||"Nearwork client",location:e.location||"Remote",compensation:e.compensation||e.salary||e.rate||"Competitive",match:e.match||null,skills:a,description:e.description||e.about||"Nearwork is reviewing candidates for this role now."}}function Ae(e){const a=(e==null?void 0:e.code)||"";return a.includes("operation-not-allowed")?"This sign-in method is not available yet.":a.includes("unauthorized-domain")?"This website still needs to be approved for sign-in.":a.includes("permission-denied")?"We could not save this yet. Please try again in a moment or contact Nearwork support.":a.includes("weak-password")?"Password must be at least 6 characters.":a.includes("invalid-credential")||a.includes("wrong-password")?"That email/password did not match.":a.includes("user-not-found")?"No account exists for that email yet.":a.includes("email-already-in-use")?"That email already has an account. Sign in instead.":"Something went wrong. Please try again or contact Nearwork support."}const Ye=[{initials:"CP",name:"Camila P.",role:"Product Designer",city:"Medellín",quote:"I doubled my income and kept living in Medellín. The whole process took 19 days from apply to signed offer."},{initials:"AR",name:"Andrés R.",role:"SDR",city:"Bogotá",quote:"I went from chasing local leads to running outbound for a US SaaS team — same desk, way better pay."},{initials:"LG",name:"Laura G.",role:"Customer Success Manager",city:"Cali",quote:"No recruiters ghosting me. One profile, real interviews, and an offer that actually matched the role."},{initials:"FT",name:"Felipe T.",role:"Sales Ops Analyst",city:"Bucaramanga",quote:"The matching was spot on. I only talked to teams that fit what I was looking for, and signed within a month."},{initials:"DV",name:"Daniela V.",role:"Account Executive",city:"Cartagena",quote:"Now I'm closing deals for a US company in USD, still based in Cartagena. Best career move I've made."}];let we=null;function dn(e){we&&clearInterval(we);const a=Ye[0];ia.innerHTML=`
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
            <p>"${a.quote}"</p>
            <div class="testimonial-person">
              <span class="mini-avatar">${a.initials}</span>
              <div><strong>${a.name}</strong><small>${a.role}, ${a.city}</small></div>
            </div>
          </div>
          <div class="testimonial-dots">
            ${Ye.map((n,s)=>`<span class="testimonial-dot${s===0?" is-active":""}"></span>`).join("")}
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
  `,De();let t=0;we=setInterval(()=>{const n=document.querySelector(".testimonial");if(!n){clearInterval(we),we=null;return}const s=n.querySelector(".testimonial-content");s.classList.add("is-flipping"),setTimeout(()=>{t=(t+1)%Ye.length;const i=Ye[t],l=s.querySelector("p"),o=s.querySelector(".mini-avatar"),d=s.querySelector(".testimonial-person strong"),c=s.querySelector(".testimonial-person small");l&&(l.textContent=`"${i.quote}"`),o&&(o.textContent=i.initials),d&&(d.textContent=i.name),c&&(c.textContent=`${i.role}, ${i.city}`),n.querySelectorAll(".testimonial-dot").forEach((p,u)=>p.classList.toggle("is-active",u===t)),s.classList.remove("is-flipping")},320)},6e3)}function gt(e="login"){var s;const a=e==="signup";we&&clearInterval(we),we=null,ia.innerHTML=`
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
          <h2 class="nw-signin-heading">${a?"Create your account.":"Welcome back."}</h2>
          ${r.message?`<div class="notice">${m("lock")} ${h(r.message)}</div>`:""}
          ${be?"":`<div class="notice">${m("triangle-alert")} Sign-in is still being set up.</div>`}
          <form id="authForm" class="nw-auth-fields">
            ${a?`
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
                ${a?"":'<button type="button" id="resetPassword" class="nw-forgot-link">Forgot?</button>'}
              </div>
              <div class="nw-field-inner">
                <input id="passwordInput" class="nw-field-input" name="password" type="password" autocomplete="${a?"new-password":"current-password"}" minlength="6" placeholder="••••••••" required />
                <button type="button" class="nw-pw-toggle" data-password-toggle aria-label="Show password">${m("eye")}</button>
              </div>
            </div>
            ${a?`
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
              ${a?`${m("user-plus")} Create account`:`Sign in ${m("arrow-right")}`}
            </button>
            <p id="formMessage" class="form-message" role="status"></p>
          </form>
          <div class="nw-card-foot">
            ${m("sparkles")}
            <button id="toggleMode" class="nw-create-link" type="button">${a?"Already have an account? Sign in":"New or invited by Nearwork? Create your profile"}</button>
          </div>
          <a class="nw-back-jobs" href="https://jobs.nearwork.co" target="_blank" rel="noreferrer">${m("arrow-left")} Back to job board</a>
        </div>
      </div>
    </main>
  `,De();const t=new URLSearchParams(window.location.search).get("email");if(t){const i=document.querySelector("#emailInput");i&&(i.value=t,i.dispatchEvent(new Event("input")));const l=document.querySelector("#passwordInput");l&&l.focus()}if(new URLSearchParams(window.location.search).get("from")==="jobs"&&r.message!=="Welcome from Jobs — log in to view your dashboard."){const i=document.querySelector("#formMessage");i&&(i.textContent="Welcome from Jobs — log in to view your dashboard.",i.classList.add("success"))}document.querySelector("#toggleMode").addEventListener("click",()=>gt(a?"login":"signup")),document.querySelectorAll("[data-password-toggle]").forEach(i=>{i.addEventListener("click",()=>{const l=i.previousElementSibling,o=l.type==="password";l.type=o?"text":"password",i.innerHTML=m(o?"eye-off":"eye"),i.setAttribute("aria-label",o?"Hide password":"Show password"),De()})}),(s=document.querySelector("#resetPassword"))==null||s.addEventListener("click",async()=>{const i=document.querySelector("input[name='email']").value.trim().toLowerCase(),l=document.querySelector("#formMessage");if(!i){l.classList.remove("success"),l.textContent="Enter your email first, then request a reset link.";return}try{await Qt(i),l.classList.add("success"),l.textContent=`Reset link sent! Check ${i} — it should arrive within a minute.`}catch(o){l.classList.remove("success"),l.textContent=Ae(o)}}),document.querySelector("#authForm").addEventListener("submit",async i=>{var u;i.preventDefault();const l=new FormData(i.currentTarget),o=document.querySelector("#formMessage"),d=String(l.get("email")).trim().toLowerCase();if(o.textContent="",a){const v=document.querySelector("#privacyConsent"),w=document.querySelector("#privacyConsentError");if(v&&!v.checked){w&&(w.style.display=""),o.textContent="Please accept the Privacy Policy to continue.";return}w&&(w.style.display="none")}const c=a?((u=document.querySelector("#marketingConsent"))==null?void 0:u.checked)===!0:!1,p=new Date().toISOString();try{if(a){const v=await xt(U,d,l.get("password"));await Pt(v.user,{displayName:l.get("name")}),sessionStorage.setItem("nw_new_account","1"),await Za(v.user.uid,{name:l.get("name"),email:d,availability:"open",headline:"Nearwork candidate",onboarded:!1,source:"talent.nearwork.co",privacyConsent:!0,privacyConsentAt:p,marketingConsent:c,marketingConsentAt:c?p:null}),await It({name:l.get("name"),firstName:String(l.get("name")||"").trim().split(/\s+/)[0],email:d}).catch(w=>console.error("[NW] account email failed:",w==null?void 0:w.message))}else await Et(U,d,l.get("password"))}catch(v){o.textContent=Ae(v)}})}function un(){var n,s;const e=new URLSearchParams(window.location.search),a=e.get("token")||"",t=e.get("email")||"";dn(`
    <section class="auth-panel">
      <div class="auth-top">
        <div class="right-brand">Near<span>work</span></div>
        <div class="candidate-chip">Candidate portal</div>
      </div>
      <div class="panel-heading">
        <h2>Set a new password.</h2>
        <p>${t?`Resetting password for <strong>${E(t)}</strong>. Choose a password you haven't used before.`:"Choose a new password you haven't used before."}</p>
      </div>
      ${a?r.resetCodeStatus==="success"?`
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
  `),document.querySelectorAll("[data-password-toggle]").forEach(i=>{i.addEventListener("click",()=>{const l=i.previousElementSibling,o=l.type==="password";l.type=o?"text":"password",i.innerHTML=m(o?"eye-off":"eye"),i.setAttribute("aria-label",o?"Hide password":"Show password"),De()})}),(n=document.querySelector("#backToLogin"))==null||n.addEventListener("click",()=>{const i=r.resetCodeStatus==="success"?"Your password has been reset. Sign in with your new password.":"";window.history.pushState({},"","/"),C({view:"login",message:i,resetCodeStatus:null,resetCodeError:""})}),(s=document.querySelector("#resetForm"))==null||s.addEventListener("submit",async i=>{i.preventDefault();const l=document.querySelector("#newPassword").value,o=document.querySelector("#confirmPassword").value;if(l!==o){C({resetCodeStatus:"error",resetCodeError:"Passwords do not match."});return}if(l.length<6){C({resetCodeStatus:"error",resetCodeError:"Password must be at least 6 characters."});return}C({resetCodeStatus:"resetting"});try{const d=await fetch("/api/confirm-reset",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({token:a,newPassword:l})}),c=await d.json().catch(()=>({}));if(!d.ok||!c.ok)throw new Error(c.error||"Something went wrong. Please request a new link.");C({resetCodeStatus:"success"})}catch(d){const c=(d==null?void 0:d.message)||"This link has expired or already been used. Please request a new one.";C({resetCodeStatus:"error",resetCodeError:c})}})}async function za(e){var a,t,n;C({loading:!0,user:e});try{const[s,i,l]=await Promise.allSettled([Rt(e),Bt(e.uid),et()]);let o=s.status==="fulfilled"?s.value:null;if(!o){const $=s.status==="rejected"?(a=s.reason)==null?void 0:a.message:"document not found";console.error("[NW] profile load:",$,"uid:",e.uid,"email:",e.email),new URLSearchParams(window.location.search).get("debug")==="1"&&alert("Profile debug — uid: "+e.uid+`
Status: `+s.status+`
Reason: `+$)}const d=i.status==="fulfilled"?i.value:[],c=l.status==="fulfilled"?l.value:[];let p=[];try{p=await Ft(e.uid,e.email,(o==null?void 0:o.candidateCode)||(o==null?void 0:o.code)||"")}catch($){console.warn($)}const u=ye();if(u&&!p.some($=>$.id===u)){const $=await Ot(u,e.uid,e.email,(o==null?void 0:o.candidateCode)||(o==null?void 0:o.code)||"").catch(()=>null);$&&(p=[$,...p])}const v=sessionStorage.getItem("nw_new_account")==="1";v&&sessionStorage.removeItem("nw_new_account");const w=!!(o!=null&&o.targetRole||!lt(o==null?void 0:o.headline)&&(o!=null&&o.headline)),L=new URLSearchParams(window.location.search).get("from")==="jobs",k=!!(o!=null&&o.cvUrl||(t=o==null?void 0:o.applications)!=null&&t.length||((n=o==null?void 0:o.skills)==null?void 0:n.length)>=3),A=(o==null?void 0:o.onboarded)||w||k||L;!(o!=null&&o.onboarded)&&A&&(o!=null&&o.candidateCode)&&$a(e.uid,{onboarded:!0,candidateCode:o.candidateCode}).catch(()=>null);const x=v&&!A?"onboarding":A?ta():"onboarding";C({candidate:{...o||{},name:(o==null?void 0:o.name)||e.displayName||"Talent member",email:(o==null?void 0:o.email)||e.email,availability:(o==null?void 0:o.availability)||"open",headline:(o==null?void 0:o.headline)||(o==null?void 0:o.targetRole)||"Nearwork candidate"},applications:d,assessments:p,jobs:c.map(Ce),loading:!1,view:"dashboard",activePage:x,message:""}),fetch("/api/intercom-token",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({userId:e.uid,email:e.email})}).then($=>$.ok?$.json():null).then($=>{$!=null&&$.token&&window.Intercom&&window.Intercom("boot",{api_base:"https://api-iam.intercom.io",app_id:"pelltlav",intercom_user_jwt:$.token,user_id:e.uid,name:(o==null?void 0:o.name)||e.displayName||"",email:e.email,session_duration:864e5})}).catch(()=>{}),V&&V(),be&&(V=Wt(e.uid,$=>{r.notifications=$,r.view==="dashboard"&&!r.message&&vt()}))}catch(s){console.warn(s),C({candidate:{name:e.displayName||"Talent member",email:e.email,availability:"open",headline:"Nearwork candidate"},applications:[],assessments:[],jobs:[],loading:!1,view:"dashboard",activePage:ta(),message:""})}}async function ze(){if(window.location.pathname==="/reset-password"){V&&V(),V=null,C({user:null,candidate:null,loading:!1,view:"reset-password",resetCodeStatus:null});return}const e=ta();if(e==="assessment"){sessionStorage.setItem("nw_restore_path",window.location.pathname),C({user:null,candidate:null,applications:[],assessments:[],jobs:[],loading:!1,view:"login",activePage:"overview",message:"Please log in to open your assessment."});return}if(e==="overview"){V&&V(),V=null,C({user:null,candidate:null,loading:!1,view:"login",activePage:"overview"});return}let a=[];try{const t=await et();t.length&&(a=t.map(Ce))}catch(t){console.warn(t)}C({user:null,candidate:null,applications:[],assessments:[],jobs:a,loading:!1,view:"login",activePage:"overview",message:"Please log in to view your profile, matched openings, applications, and assessments."})}function pn(){return[{label:"My journey",items:[["overview","layout-dashboard","Overview"],["applications","send","Applications"],["assessment","clipboard-check","Assessment"]]},{label:"My search",items:[["matches","briefcase-business","Matches"],["cvs","files","CV Picker"]]},{label:"Support",items:[["tips","book-open","Tips"],["recruiter","calendar-days","Recruiter"],["profile","user-round-cog","Profile"]]}]}function mn(){var e;return{open:"Open to roles",interviewing:"Interviewing",paused:"Not looking"}[((e=r.candidate)==null?void 0:e.availability)||"open"]||"Open to roles"}function Ea(){const e=r.candidate||{},a=Je();return[{id:"name",label:"Full name",done:!!e.name},{id:"role",label:"Target role",done:!!(e.targetRole||!lt(e.headline)&&e.headline)},{id:"location",label:"City",done:!!e.city},{id:"salary",label:"Salary",done:!!(e.salaryAmount||e.salary)},{id:"english",label:"English",done:!!e.english},{id:"whatsapp",label:"WhatsApp",done:!!(e.whatsapp||e.phone)},{id:"skills",label:"Skills (5-20)",done:a.length>=5},{id:"cv",label:"CV",done:!!e.cvUrl}]}function vt(){var l,o,d,c,p;const e=(r.notifications||[]).filter(u=>!u.read).length,a=((l=r.candidate)==null?void 0:l.availability)||"open",n={open:"#10A07C",interviewing:"#EAB308",paused:"#9AA0A6"}[a]||"#10A07C",s=((o=r.candidate)==null?void 0:o.name)||((d=r.user)==null?void 0:d.displayName)||"Talent member",i=((c=r.candidate)==null?void 0:c.headline)||((p=r.candidate)==null?void 0:p.targetRole)||"Nearwork candidate";ia.innerHTML=`
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
          ${pn().map(u=>`
            <div class="nw-nav-group">
              <div class="nw-nav-group-label">${u.label}</div>
              ${u.items.map(([v,w,L])=>`
                <button class="nw-nav-item${r.activePage===v?" active":""}" data-page="${v}" type="button">
                  ${m(w)} ${L}
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
          ${rt()}
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

      <!-- ── Mobile bottom nav ── -->
      <nav class="nw-mobile-nav">
        <button class="nw-mob-tab${r.activePage==="overview"?" active":""}" data-page="overview" type="button">${m("layout-dashboard")}<span>Home</span></button>
        <button class="nw-mob-tab${r.activePage==="applications"?" active":""}" data-page="applications" type="button">${m("send")}<span>Applied</span></button>
        <button class="nw-mob-tab${r.activePage==="matches"?" active":""}" data-page="matches" type="button">${m("briefcase-business")}<span>Jobs</span></button>
        <button class="nw-mob-tab${r.activePage==="profile"?" active":""}" data-page="profile" type="button">${m("user-round-cog")}<span>Profile</span></button>
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
              <span class="nw-avail-label">${mn()}</span>
              ${m("chevron-down")}
              <select id="availability" class="nw-avail-select" aria-label="Availability">
                <option value="open"         ${a==="open"?"selected":""}>Open to roles</option>
                <option value="interviewing" ${a==="interviewing"?"selected":""}>Interviewing</option>
                <option value="paused"       ${a==="paused"?"selected":""}>Not looking</option>
              </select>
            </div>

            <!-- Notifications -->
            <div class="nw-notif-wrap">
              <button class="nw-icon-btn" type="button" id="notificationBell" aria-label="Notifications">
                ${m("bell")}
                ${e?'<span class="nw-notif-badge"></span>':""}
              </button>
              ${r.notificationPanelOpen?vn():""}
            </div>
            <button class="nw-icon-btn" type="button" id="notificationSettings" aria-label="Settings">
              ${m("settings")}
            </button>
          </div>
        </div>

        <!-- Notification settings -->
        ${r.notificationSettingsOpen?fn():""}

        <!-- Page content -->
        ${r.message?`<div class="notice" style="margin:0 36px;">${r.message}</div>`:""}
        <div class="nw-page-content">
          ${(()=>{try{return wn()}catch(u){return console.error("renderActivePage error:",u),'<div class="notice">Page failed to render. <button type="button" data-page="overview">Go to overview</button></div>'}})()}
        </div>
      </section>
    </main>
  `,De(),ts(),yn(),hn()}function gn(e){return(e!=null&&e.toDate?e.toDate():new Date(e||Date.now())).toLocaleString("en-US",{month:"short",day:"numeric",year:"numeric",hour:"numeric",minute:"2-digit"})}function vn(){const e=(r.notifications||[]).slice(0,10);return`
    <div class="notification-panel">
      <div class="notification-panel-head"><strong>Notifications</strong><span>${e.length?"Latest updates":"All clear"}</span></div>
      ${e.length?e.map(a=>`
        <button class="notification-item ${a.read?"":"unread"}" type="button" data-notification-read="${a.id}">
          <strong>${h(a.title||"Nearwork update")}</strong>
          <span>${h(a.message||"")}</span>
          <time>${gn(a.createdAt)}</time>
        </button>
      `).join(""):'<div class="notification-empty">No notifications yet.</div>'}
    </div>
  `}function fn(){var t;const e=((t=r.candidate)==null?void 0:t.notificationPreferences)||{};return`
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
  `}let Ke=null;function hn(){Ke&&window.clearInterval(Ke);const e=document.querySelector("#assessmentTimer");if(!e)return;const a=new Date(e.dataset.end||"").getTime(),t=()=>{const n=Math.max(0,a-Date.now()),s=Math.floor(n/1e3),i=Math.floor(s/60),l=String(s%60).padStart(2,"0");e.textContent=`${i}:${l}`,e.classList.toggle("is-low",n<=10*60*1e3),n<=0&&window.clearInterval(Ke)};t(),Ke=window.setInterval(t,1e3)}function yn(){if(r.activePage!=="assessment")return;const e=r.assessments||[],a=ye(),n=(a?e.find(i=>i.id===a):null)||e.find(i=>["sent","started"].includes(String(i.status||"").toLowerCase()));if(!(n!=null&&n.id))return;const s=String(n.status||"").toLowerCase();if(s==="started"&&it()===null){Ne(n.id,Number(n.currentQuestionIndex||0),!0);return}if(!a&&s==="sent"){const i=`/assessment/${encodeURIComponent(n.id)}/start`;window.history.replaceState({page:"assessment",assessmentId:n.id},"",i)}}function wn(){return({onboarding:bn,overview:Ha,matches:xn,applications:Pn,assessment:En,cvs:On,tips:jn,recruiter:zn,profile:Hn}[r.activePage]||Ha)()}function Ha(){var k,A;const e=ft(),a=Ea(),t=a.filter(x=>x.done).length,n=a.length,s=r.applications||[],i=s.filter(x=>["action-needed","interview-scheduled","assessment-sent"].includes(String(x.status||"").toLowerCase())).length,l=(r.jobs||[]).slice(0,3),o=((k=r.candidate)==null?void 0:k.recruiter)||{},d=2*Math.PI*52,c=d*(1-e/100),u=new Date().toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"}),v=(x,$,q,H,F)=>`
    <div class="nw-stat-tile">
      <div class="nw-stat-tile-top">
        <span class="nw-stat-tile-label">${x}</span>
        <div class="nw-stat-icon" style="background:${H}14;">
          ${m(F)}
        </div>
      </div>
      <div class="nw-stat-value">${$}</div>
      <div class="nw-stat-sub">${q}</div>
    </div>`,w=(x,$)=>{const q=String(x.stage||x.status||"applied").toLowerCase(),H=q.includes("offer")?4:q.includes("final")?3:q.includes("interview")?2:q.includes("assessment")?1:0,F=x.clientName||x.company||"Nearwork client",J=F.split(/\s+/).slice(0,2).map(R=>R[0]).join("").toUpperCase(),W=["#10A07C","#EC4E7E","#3B82F6","#F4A52E","#8B5CF6"],G=W[F.length%W.length];return`
      <div class="nw-app-row${$?" last":""}">
        <div class="nw-app-avatar" style="background:${G};">${J}</div>
        <div class="nw-app-info">
          <div class="nw-app-title">${E(x.jobTitle||x.title||"Application")} <span class="nw-app-company">· ${E(F)}</span></div>
          <div class="nw-app-stages">
            ${nt.map((R,f)=>`<div class="nw-stage-pip${f<=H?" done":""}"></div>`).join("")}
            <span class="nw-app-stage-label">${x.stage||x.status||"Applied"}</span>
          </div>
        </div>
        <div class="nw-app-meta">
          <span class="nw-app-status${i?" action":""}">${x.status||"In review"}</span>
          <div class="nw-app-date">${oa(x.updatedAt||x.createdAt)}</div>
        </div>
        ${m("chevron-right")}
      </div>`},L=x=>{const $=Ce(x),q=xa($),H=$.match||(q.length>=3?Math.min(97,70+q.length*4):null),F=["#10A07C","#EC4E7E","#3B82F6","#F4A52E"],J=F[$.orgName.length%F.length],W=$.orgName.split(/\s+/).slice(0,2).map(G=>G[0]).join("").toUpperCase();return`${encodeURIComponent($.code)}`,`
      <div class="nw-match-card">
        <div class="nw-match-card-top">
          <div class="nw-match-avatar" style="background:${J};">${W}</div>
          ${H?`<div class="nw-match-score">${H}%</div>`:""}
        </div>
        <div class="nw-match-role">${E($.title)}</div>
        <div class="nw-match-company">${E($.orgName)} · ${E($.location)}</div>
        ${q.length?`<div class="nw-match-why">${q.slice(0,3).map(E).join(" · ")} match</div>`:`<div class="nw-match-why">${E($.description).slice(0,80)}…</div>`}
        <div class="nw-match-footer">
          <span class="nw-match-salary">${E($.compensation)}</span>
          <button type="button" class="nw-match-apply" data-apply="${h($.code)}">Apply ${m("arrow-right")}</button>
        </div>
      </div>`};return`
    <!-- Greeting -->
    <div class="nw-overview-header">
      <div class="nw-overview-date">Overview · ${u}</div>
      <h1 class="nw-overview-greeting">
        Hi ${E(ot())},
        ${i>0?`<span class="nw-greeting-muted">you have</span> <span class="nw-greeting-accent">${i} thing${i>1?"s":""}</span> <span class="nw-greeting-muted">that need you.</span>`:`<span class="nw-greeting-muted">let's get you matched.</span>`}
      </h1>
    </div>

    <!-- Readiness card -->
    ${t>=n?"":`
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
        <h2 class="nw-readiness-title">${n-t} more step${n-t>1?"s":""} and Nearwork can boost your matches.</h2>
        <div class="nw-readiness-checklist">
          ${a.map(x=>`
            <div class="nw-check-pill${x.done?" done":""}">
              ${m(x.done?"check":"circle")} ${x.label}
            </div>`).join("")}
        </div>
        <div class="nw-readiness-actions">
          <button class="nw-finish-btn" type="button" data-page="profile">
            Finish profile ${m("arrow-right")}
          </button>
          <span class="nw-readiness-count">${t} of ${n} complete</span>
        </div>
      </div>
    </div>`}

    <!-- Stat tiles -->
    <div class="nw-stat-grid">
      ${v("Open matches",r.jobs.length,r.jobs.length?`${r.jobs.length} role${r.jobs.length>1?"s":""} waiting`:"Complete profile to unlock","#10A07C","sparkles")}
      ${v("Applications",s.length,s.length?`${i||"0"} need your input`:"Not applied yet","#EC4E7E","send")}
      ${v("Interviews",s.filter(x=>String(x.stage||x.status||"").toLowerCase().includes("interview")).length,"Scheduled","Not yet scheduled","#F4A52E")}
      ${v("CVs saved",(((A=r.candidate)==null?void 0:A.cvLibrary)||[]).length,"In your library","Upload your first CV","#3B82F6")}
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
        ${s.length?s.slice(0,4).map((x,$)=>w(x,$===Math.min(s.length,4)-1)).join(""):`<div class="nw-empty">
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
            <div class="nw-recruiter-avatar">${o.initials||"NW"}</div>
            <div>
              <div class="nw-recruiter-name">${E(o.name||"Nearwork Support")}</div>
              <div class="nw-recruiter-role">${E(o.role||"Talent Partner")}</div>
            </div>
          </div>
          <p class="nw-recruiter-bio">I'll review every match and prep you before each interview. Reach out anytime.</p>
          <div class="nw-recruiter-btns">
            <a class="nw-recruiter-msg" href="mailto:${h(o.email||"support@nearwork.co")}">${m("message-square-text")} Message</a>
            <a class="nw-recruiter-call" href="https://wa.me/${encodeURIComponent((o.whatsapp||"+1").replace(/\D/g,""))}" target="_blank" rel="noreferrer">${m("calendar-plus")} WhatsApp</a>
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
          ${l.map(x=>L(x)).join("")}
        </div>
      </section>
    `:""}
  `}function bn(){if(!He){He=!0,Aa=1;const e=r.candidate||{},a=String(e.name||"").trim().split(/\s+/).filter(Boolean);P={roleGroup:e.roleGroup||"",targetRole:e.targetRole||"",country:e.locationCountry||e.country||"Colombia",department:e.department||e.locationDepartment||"",city:e.city||e.locationCity||"",english:e.english||"",firstName:e.firstName||a[0]||"",lastName:e.lastName||a.slice(1).join(" ")||"",phone:e.phone||e.whatsapp||"",currentRole:e.currentRole||"",expectedSalaryUSD:e.expectedSalaryUSD||(e.salaryCurrency!=="COP"?e.salaryAmount:null)||"",expectedSalaryCOP:e.expectedSalaryCOP||(e.salaryCurrency==="COP"?e.salaryAmount:null)||"",linkedin:e.linkedin||"",experience:Array.isArray(e.workHistory)?e.workHistory.map(t=>({...t})):[],languages:Array.isArray(e.languages)?[...e.languages]:[],skills:Array.isArray(e.skills)?[...e.skills]:[],certifications:Array.isArray(e.certifications)?e.certifications.map(t=>({...t})):[]},le=null,Ve=null,_=null}return'<div id="onboardingWizard" class="onb-shell"></div>'}function Sn(){document.querySelector("#onboardingWizard")&&Ge(Aa)}function Ge(e){Aa=e;const a=document.querySelector("#onboardingWizard");a&&(a.innerHTML=Cn(e),kn(e))}function ga(e){return`
    <div style="display:flex;align-items:center;gap:5px;margin-bottom:28px;">
      ${Array.from({length:3},(t,n)=>`
        <div style="height:5px;border-radius:3px;flex:${n<e?2:1};background:${n<e?"var(--green)":"var(--border)"};transition:all .3s;"></div>
      `).join("")}
      <span style="margin-left:6px;font-size:11px;font-weight:600;color:var(--light);white-space:nowrap;">${e<=3?`${e} / 3`:"Review"}</span>
    </div>`}function ee(e,a,t){return`<label style="display:flex;flex-direction:column;gap:5px;font-size:11px;font-weight:600;letter-spacing:.07em;text-transform:uppercase;color:var(--light);">${e}${a?'<span style="font-weight:400;font-size:10px;text-transform:none;letter-spacing:0;opacity:.7;">(optional)</span>':""} ${t}</label>`}function he(e,a,t,n,s=""){return`<input id="${e}" type="${a}" value="${h(t||"")}" placeholder="${h(n)}" ${s} style="font-size:14px;padding:10px 12px;border:1.5px solid var(--border);border-radius:8px;background:#fff;outline:none;width:100%;box-sizing:border-box;" />`}function Ga(e,a){return`<div style="display:flex;justify-content:space-between;align-items:center;margin-top:28px;">
    ${e?'<button type="button" id="onbBack" class="secondary-action">← Back</button>':"<span></span>"}
    <button type="button" id="onbNext" class="primary-action fit">${a||"Continue →"}</button>
  </div>`}function Cn(e){var t,n,s,i;const a=P;switch(e){case 1:{const l=!!le;return`
        <div class="onb-step">
          ${ga(1)}
          <p class="eyebrow">Step 1 · Your CV</p>
          <h2 class="onb-heading">Upload your CV to get started</h2>
          <p class="onb-sub">We'll extract your experience, skills, and contact info automatically — so you don't have to type it all out.</p>
          <div class="upload-box" style="margin-bottom:4px;" id="onbCvBox">
            <input id="onbCvInput" type="file" accept=".pdf,.doc,.docx" style="display:none;" />
            <label for="onbCvInput" class="upload-trigger">${m("upload")} Choose file</label>
            <p id="onbCvStatus" style="font-size:12px;color:var(--green);min-height:18px;margin:0;">${l?`✓ ${E(le.name)}`:""}</p>
            <p>PDF or Word · max 10 MB</p>
          </div>
          <div style="display:flex;justify-content:space-between;align-items:center;margin-top:24px;">
            <button type="button" id="onbSkipCv" style="background:none;border:none;font-size:13px;color:var(--light);cursor:pointer;text-decoration:underline;padding:0;">Skip — I'll fill in manually</button>
            <button type="button" id="onbNext" class="primary-action fit" ${l?"":"disabled"}>Continue →</button>
          </div>
        </div>`}case 2:{const l=((t=r.candidate)==null?void 0:t.email)||((n=r.user)==null?void 0:n.email)||"",o=a.phone||((_==null?void 0:_.phone)??""),d=a.currentRole||(((i=(s=_==null?void 0:_.workHistory)==null?void 0:s[0])==null?void 0:i.title)??"");return`
        <div class="onb-step">
          ${ga(2)}
          <p class="eyebrow">Step 2 · Your profile</p>
          <h2 class="onb-heading">Tell us about yourself</h2>
          <p class="onb-sub">This is the basic information we'll use across every role you apply for.</p>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:4px;">
            ${ee("First name",!1,he("onbFirstName","text",a.firstName||"","María",'autocomplete="given-name"'))}
            ${ee("Last name",!1,he("onbLastName","text",a.lastName||"","García",'autocomplete="family-name"'))}
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:4px;">
            ${ee("Email",!1,he("onbEmail","email",l,"","disabled"))}
            ${ee("Phone",!1,he("onbPhone","tel",o,"+57 300 123 4567",'autocomplete="tel"'))}
          </div>
          ${ee("Current role",!1,he("onbCurrentRole","text",d,"e.g. Customer Success Manager"))}
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:4px;">
            ${ee("Expected salary — USD",!0,he("onbSalaryUSD","number",a.expectedSalaryUSD||"","2500",'min="0" step="100"'))}
            ${ee("Expected salary — COP",!0,he("onbSalaryCOP","number",a.expectedSalaryCOP||"","10000000",'min="0" step="100000"'))}
          </div>
          ${ee("LinkedIn",!0,he("onbLinkedin","url",a.linkedin||"","https://linkedin.com/in/..."))}
          <p id="onbBasicError" style="font-size:12px;color:#e74c3c;min-height:16px;margin:4px 0 0;"></p>
          ${Ga(1)}
        </div>`}case 3:{const l=a.roleGroup||Object.keys(Ie)[0]||"",o=a.country||"Colombia",d=o==="Colombia",c=a.department||Object.keys(ge)[0]||"",p=ge[c]||[];return`
        <div class="onb-step">
          ${ga(3)}
          <p class="eyebrow">Step 3 · Role & location</p>
          <h2 class="onb-heading">What role are you looking for, and where are you based?</h2>
          <p class="onb-sub">We use this to match you with the right openings from our clients.</p>
          <div style="display:grid;gap:12px;margin-bottom:4px;">
            ${ee("Area",!1,`<select id="onbRoleGroup" style="font-size:14px;padding:10px 12px;border:1.5px solid var(--border);border-radius:8px;background:#fff;outline:none;">${ct(l)}</select>`)}
            ${ee("Role",!1,`<select id="onbTargetRole" style="font-size:14px;padding:10px 12px;border:1.5px solid var(--border);border-radius:8px;background:#fff;outline:none;">${ra(l,a.targetRole||"")}</select>`)}
            ${ee("Country",!1,`<select id="onbCountry" style="font-size:14px;padding:10px 12px;border:1.5px solid var(--border);border-radius:8px;background:#fff;outline:none;">${tt.map(u=>`<option value="${h(u)}" ${u===o?"selected":""}>${E(u)}</option>`).join("")}</select>`)}
            <div id="onbCoLoc" style="display:${d?"grid":"none"};gap:12px;">
              ${ee("Department",!1,`<select id="onbDept" style="font-size:14px;padding:10px 12px;border:1.5px solid var(--border);border-radius:8px;background:#fff;outline:none;">${Object.keys(ge).map(u=>`<option value="${h(u)}" ${u===c?"selected":""}>${E(u)}</option>`).join("")}</select>`)}
              ${ee("City",!1,`<select id="onbCity" style="font-size:14px;padding:10px 12px;border:1.5px solid var(--border);border-radius:8px;background:#fff;outline:none;">${p.map(u=>`<option value="${h(u)}" ${u===a.city?"selected":""}>${E(u)}</option>`).join("")}</select>`)}
            </div>
            <p id="onbCoHint" style="display:${d?"none":"block"};font-size:12.5px;color:var(--mid);margin:0;line-height:1.5;">No state or city needed — country is enough to continue.</p>
            ${ee("English level",!1,`<select id="onbEnglish" style="font-size:14px;padding:10px 12px;border:1.5px solid var(--border);border-radius:8px;background:#fff;outline:none;">${["","B1","B2","C1","C2","Native"].map(u=>`<option value="${u}" ${u===a.english?"selected":""}>${u||"Select level"}</option>`).join("")}</select>`)}
          </div>
          ${Ga(2,"Review →")}
        </div>`}case 4:return $n();default:return""}}const Se="font-size:14px;padding:10px 12px;border:1.5px solid var(--border);border-radius:8px;background:#fff;outline:none;width:100%;box-sizing:border-box;",La="flex-shrink:0;width:38px;height:38px;border:1.5px solid var(--border);border-radius:8px;background:#fff;color:var(--light);font-size:14px;cursor:pointer;";function Ze(e){return`<label style="display:block;margin-bottom:8px;font-size:11px;font-weight:600;letter-spacing:.07em;text-transform:uppercase;color:var(--light);">${e}</label>`}function $n(){var u;const e=P,a=_||{};!e.experience.length&&Array.isArray(a.workHistory)&&a.workHistory.length&&(e.experience=a.workHistory.map(v=>({company:v.company||"",title:v.title||"",from:v.from||"",to:v.to||""}))),!e.languages.length&&Array.isArray(a.languages)&&a.languages.length&&(e.languages=a.languages.filter(Boolean).map(String)),!e.skills.length&&Array.isArray(a.skills)&&a.skills.length&&(e.skills=[...new Set(a.skills.map(Ee).filter(Boolean))]),!e.certifications.length&&Array.isArray(a.certifications)&&a.certifications.length&&(e.certifications=a.certifications.map(v=>({name:v.name||"",issuer:v.issuer||"",date:v.date||""})));const t=[e.firstName,e.lastName].filter(Boolean).join(" ")||((u=r.candidate)==null?void 0:u.name)||"—",n=e.targetRole||"—",s=e.country&&e.country!=="Colombia"?e.country:[e.city,e.department].filter(Boolean).join(", ")||"—",i=[];e.expectedSalaryUSD&&i.push(`$${Number(e.expectedSalaryUSD).toLocaleString("en-US")} USD/mo`),e.expectedSalaryCOP&&i.push(`$${Number(e.expectedSalaryCOP).toLocaleString("es-CO")} COP/mo`);const l=i.join(" · ")||"—",o=e.english||"—",d=e.phone||"—",c=(le==null?void 0:le.name)||"",p=(v,w)=>!w||w==="—"?"":`
    <div style="display:flex;gap:16px;padding:10px 0;border-bottom:1px solid var(--border);">
      <span style="width:110px;flex-shrink:0;font-size:10px;font-weight:700;letter-spacing:.07em;text-transform:uppercase;color:var(--light);padding-top:3px;">${v}</span>
      <span style="font-size:13px;color:var(--black);line-height:1.5;">${E(String(w))}</span>
    </div>`;return`
    <div class="onb-step">
      <p class="eyebrow" style="color:var(--green);">Almost done</p>
      <h2 class="onb-heading">Does this look right?</h2>
      <p class="onb-sub" style="margin-bottom:20px;">Review your profile before we save it. You can always update it later from Settings.</p>
      <div style="border:1.5px solid var(--border);border-radius:12px;padding:2px 16px 2px;margin-bottom:24px;">
        ${p("Name",t)}
        ${p("Role",n)}
        ${p("Location",s)}
        ${p("Salary",l)}
        ${p("English",o)}
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
        ${dt(e.skills)}
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
    </div>`}function na(){const e=document.querySelector("#onbExperienceList");e&&(e.innerHTML="",P.experience.length||(e.innerHTML='<p style="font-size:12px;color:var(--light);margin:0 0 10px;">No experience added yet.</p>'),P.experience.forEach((a,t)=>{var s,i;const n=document.createElement("div");n.style.cssText="border:1.5px solid var(--border);border-radius:10px;padding:12px;margin-bottom:10px;",n.innerHTML=`
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px;">
        <input type="text" data-k="title" placeholder="Title" value="${h(a.title||"")}" style="${Se}">
        <input type="text" data-k="company" placeholder="Company" value="${h(a.company||"")}" style="${Se}">
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr auto;gap:8px;align-items:center;">
        <input type="month" data-k="from" value="${h(a.from||"")}" style="${Se}">
        <input type="month" data-k="to" value="${a.to==="present"?"":h(a.to||"")}" ${a.to==="present"?"disabled":""} style="${Se}">
        <button type="button" class="onb-list-remove" aria-label="Remove" style="${La}">×</button>
      </div>
      <label style="display:flex;align-items:center;gap:6px;font-size:12px;color:var(--mid);margin-top:8px;">
        <input type="checkbox" data-k="current" ${a.to==="present"?"checked":""}> I currently work here
      </label>`,n.querySelectorAll('input[type="text"][data-k], input[type="month"][data-k]').forEach(l=>{l.addEventListener("input",o=>{a[o.target.dataset.k]=o.target.value})}),(s=n.querySelector('input[type="checkbox"][data-k="current"]'))==null||s.addEventListener("change",l=>{a.to=l.target.checked?"present":"",na()}),(i=n.querySelector(".onb-list-remove"))==null||i.addEventListener("click",()=>{P.experience.splice(t,1),na()}),e.appendChild(n)}))}function Sa(){const e=document.querySelector("#onbLanguagesList");if(e){if(e.innerHTML="",P.english){const a=document.createElement("div");a.style.cssText="display:flex;align-items:center;gap:8px;margin-bottom:8px;padding:10px 12px;border:1.5px solid var(--border);border-radius:8px;background:var(--gray-1);font-size:14px;color:var(--black);",a.innerHTML=`<span style="font-weight:600;">English</span><span style="color:var(--light);">${E(P.english)}</span>`,e.appendChild(a)}if(!P.languages.length){const a=document.createElement("p");a.style.cssText="font-size:12px;color:var(--light);margin:0 0 10px;",a.textContent="No other languages added yet.",e.appendChild(a)}P.languages.forEach((a,t)=>{const n=document.createElement("div");n.style.cssText="display:flex;gap:10px;align-items:center;margin-bottom:8px;",n.innerHTML=`
      <input type="text" value="${h(a)}" placeholder="e.g. English (B2)" style="${Se}flex:1;">
      <button type="button" class="onb-list-remove" aria-label="Remove" style="${La}">×</button>`,n.querySelector("input").addEventListener("input",s=>{P.languages[t]=s.target.value}),n.querySelector(".onb-list-remove").addEventListener("click",()=>{P.languages.splice(t,1),Sa()}),e.appendChild(n)})}}function Ca(){const e=document.querySelector("#onbCertificationsList");e&&(e.innerHTML="",P.certifications.length||(e.innerHTML='<p style="font-size:12px;color:var(--light);margin:0 0 10px;">No certifications added yet.</p>'),P.certifications.forEach((a,t)=>{const n=document.createElement("div");n.style.cssText="display:flex;gap:10px;align-items:flex-start;margin-bottom:8px;",n.innerHTML=`
      <div class="onb-cert-grid" style="flex:1;">
        <input type="text" data-k="name" value="${h(a.name||"")}" placeholder="Certification name" style="${Se}">
        <input type="text" data-k="issuer" value="${h(a.issuer||"")}" placeholder="Issuer" style="${Se}">
        <input type="text" data-k="date" value="${h(a.date||"")}" placeholder="Date" style="${Se}">
      </div>
      <button type="button" class="onb-list-remove" aria-label="Remove" style="${La}">×</button>`,n.querySelectorAll("input[data-k]").forEach(s=>{s.addEventListener("input",i=>{a[i.target.dataset.k]=i.target.value})}),n.querySelector(".onb-list-remove").addEventListener("click",()=>{P.certifications.splice(t,1),Ca()}),e.appendChild(n)}))}function kn(e){var n,s,i,l,o;const a=document.querySelector("#onbBack"),t=document.querySelector("#onbNext");switch(a==null||a.addEventListener("click",()=>Ge(e-1)),e){case 1:{const d=document.querySelector("#onbCvInput"),c=document.querySelector("#onbCvStatus"),p=document.querySelector("#onbSkipCv");le&&d&&(t.disabled=!1),d==null||d.addEventListener("change",()=>{var v;const u=(v=d.files)==null?void 0:v[0];u&&(le=u,c&&(c.textContent=`✓ ${u.name}`),t.disabled=!1,_=null,Ve=ka(u).catch(()=>null))}),t==null||t.addEventListener("click",()=>va(2)),p==null||p.addEventListener("click",()=>{le=null,Ve=null,va(2)});break}case 2:{t==null||t.addEventListener("click",()=>{var A,x,$,q,H,F,J;const d=((A=document.querySelector("#onbFirstName"))==null?void 0:A.value.trim())||"",c=((x=document.querySelector("#onbLastName"))==null?void 0:x.value.trim())||"",p=(($=document.querySelector("#onbPhone"))==null?void 0:$.value.trim())||"",u=((q=document.querySelector("#onbCurrentRole"))==null?void 0:q.value.trim())||"",v=((H=document.querySelector("#onbSalaryUSD"))==null?void 0:H.value)||"",w=((F=document.querySelector("#onbSalaryCOP"))==null?void 0:F.value)||"",L=((J=document.querySelector("#onbLinkedin"))==null?void 0:J.value.trim())||"",k=document.querySelector("#onbBasicError");if(!d||!c||!p||!u){k&&(k.textContent="Please fill in your name, phone, and current role.");return}if(!v&&!w){k&&(k.textContent="Please enter an expected salary in USD, COP, or both.");return}P.firstName=d,P.lastName=c,P.phone=p,P.currentRole=u,P.expectedSalaryUSD=v?Number(v):"",P.expectedSalaryCOP=w?Number(w):"",P.linkedin=L,Ge(3)});break}case 3:{const d=document.querySelector("#onbRoleGroup"),c=document.querySelector("#onbTargetRole"),p=document.querySelector("#onbCountry"),u=document.querySelector("#onbDept"),v=document.querySelector("#onbCity"),w=document.querySelector("#onbCoLoc"),L=document.querySelector("#onbCoHint");d==null||d.addEventListener("change",()=>{c.innerHTML=ra(d.value,"")}),p==null||p.addEventListener("change",()=>{const k=p.value==="Colombia";w&&(w.style.display=k?"grid":"none"),L&&(L.style.display=k?"none":"block")}),u==null||u.addEventListener("change",()=>{const k=ge[u.value]||[];v.innerHTML=k.map(A=>`<option value="${h(A)}">${E(A)}</option>`).join("")}),t==null||t.addEventListener("click",()=>{var A;P.roleGroup=(d==null?void 0:d.value)||"",P.targetRole=(c==null?void 0:c.value)||"",P.country=(p==null?void 0:p.value)||"Colombia";const k=P.country==="Colombia";P.department=k&&(u==null?void 0:u.value)||"",P.city=k&&(v==null?void 0:v.value)||"",P.english=((A=document.querySelector("#onbEnglish"))==null?void 0:A.value)||"",va(4)});break}case 4:{(n=document.querySelector("#onbEdit"))==null||n.addEventListener("click",()=>Ge(1)),(s=document.querySelector("#onbFinish"))==null||s.addEventListener("click",An),na(),Sa(),Ca(),(i=document.querySelector("#onbAddExperience"))==null||i.addEventListener("click",()=>{P.experience.push({company:"",title:"",from:"",to:""}),na()}),(l=document.querySelector("#onbAddLanguage"))==null||l.addEventListener("click",()=>{P.languages.push(""),Sa()}),(o=document.querySelector("#onbAddCertification"))==null||o.addEventListener("click",()=>{P.certifications.push({name:"",issuer:"",date:""}),Ca()}),wt();break}}}async function va(e){var t,n;const a=document.querySelector("#onboardingWizard");if(Ve&&!_&&(a&&(a.innerHTML='<div class="onb-step"><p style="text-align:center;font-size:14px;font-weight:600;color:var(--green);padding:56px 0;">Analysing your CV…</p></div>'),_=await Ve),_!=null&&_.phone&&!P.phone&&(P.phone=_.phone),_!=null&&_.name&&!P.firstName&&!P.lastName){const s=String(_.name).trim().split(/\s+/).filter(Boolean);P.firstName=s[0]||"",P.lastName=s.slice(1).join(" ")}(n=(t=_==null?void 0:_.workHistory)==null?void 0:t[0])!=null&&n.title&&!P.currentRole&&(P.currentRole=_.workHistory[0].title),Ge(e)}async function An(){var t,n,s,i,l,o,d;const e=document.querySelector("#onbFinish"),a=document.querySelector("#onbFinishErr");e&&(e.disabled=!0,e.innerHTML="Saving…");try{const c=P,p=(t=r.user)==null?void 0:t.uid;if(!p)throw new Error("Not signed in");const u=c.country||"Colombia",v=u==="Colombia",w=v&&c.department||"",L=v&&c.city||"",k=String(u).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,""),A=Number(c.expectedSalaryUSD||0)||null,x=Number(c.expectedSalaryCOP||0)||null,$=A||x||null,q=A?"USD":x?"COP":"USD",H=$?`${q} ${$.toLocaleString()}/mo`:"",F=[...document.querySelectorAll('[data-skill-search] input[name="skills"]')].map(R=>R.value),J=[c.firstName,c.lastName].filter(Boolean).join(" ")||((n=r.candidate)==null?void 0:n.name)||((s=r.user)==null?void 0:s.displayName)||"";let W={};if(le)try{const R=await ya(p,le,"");W={activeCvId:R.id,activeCvName:R.name||R.fileName,cvUrl:R.url,cvLibrary:[R]}}catch{}const G={name:J,firstName:c.firstName||"",lastName:c.lastName||"",targetRole:c.targetRole||"",headline:c.targetRole||"",currentRole:c.currentRole||"",department:w,city:L,location:v?[L,w].filter(Boolean).join(", "):u,locationCity:L,locationDepartment:w,locationCountry:u,locationId:v?`${String(L).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,"").replace(/[^a-z0-9]+/g,"-")}-co`:k,english:c.english||"",salary:H,salaryUSD:A,salaryAmount:$,salaryCurrency:q,expectedSalaryUSD:A,expectedSalaryCOP:x,expectedSalaryAmount:$,expectedSalaryCurrency:q,whatsapp:c.phone||"",phone:c.phone||"",linkedin:c.linkedin||"",skills:[...new Set(F.map(Ee).filter(Boolean))],workHistory:c.experience||[],certifications:(c.certifications||[]).filter(R=>R.name&&R.name.trim()),languages:(c.languages||[]).map(R=>R.trim()).filter(Boolean),summary:(_==null?void 0:_.summary)||"",email:((i=r.candidate)==null?void 0:i.email)||((l=r.user)==null?void 0:l.email)||"",candidateCode:(o=r.candidate)==null?void 0:o.candidateCode,marketingConsent:((d=r.candidate)==null?void 0:d.marketingConsent)===!0,availability:"open",onboarded:!0,...W};await $a(p,G),window.history.pushState({page:"overview"},"","/"),C({candidate:{...r.candidate,...G},activePage:"overview",message:"Welcome to Nearwork! Your profile is ready."})}catch{a&&(a.textContent="Something went wrong. Please try again."),e&&(e.disabled=!1,e.innerHTML=`${m("check")} Finish setup`)}}function xn(){const e=Je(),a=r.jobs.map(Ce).filter(i=>xa(i,e).length>=3),t=e.length>=5,n=r.matchesFiltered&&t?a:r.jobs.map(Ce),s=r.matchesFiltered&&!a.length;return`
    <div class="nw-page-head">
      <div class="nw-page-overline">My search</div>
      <h1 class="nw-page-title">Matches</h1>
      <p class="nw-page-lede">Roles picked for you from your skills, target role, and salary.</p>
    </div>
    <div class="nw-filterbar">
      <button id="filterMatches" class="nw-chip${r.matchesFiltered?" active":""}" type="button">${m(r.matchesFiltered?"list":"filter")} ${r.matchesFiltered?"Show all openings":"Filter by my role & skills"}</button>
      <div class="nw-filter-count">${n.length} of ${r.jobs.length} open roles</div>
    </div>
    <div class="nw-match-grid nw-match-grid--wide">${s?yt("No filtered matches yet","Add a target role and skills in Profile to improve matching."):n.map(i=>Yn(i)).join("")}</div>
  `}function Pn(){const e=r.applications||[];return`
    <div class="nw-page-head">
      <div class="nw-page-overline">My journey</div>
      <h1 class="nw-page-title">Applications</h1>
      <p class="nw-page-lede">Every role you've applied to, and exactly where it stands.</p>
    </div>
    ${rn()?`
      <section class="nw-panel nw-pipeline-panel">
        <div class="nw-panel-head"><div><div class="nw-panel-overline">Status</div><div class="nw-panel-title">Where you are in the process</div></div></div>
        ${Jn(Qn())}
      </section>`:""}
    <section class="nw-panel nw-applist">
      ${e.length?e.map((t,n)=>Kn(t,n===e.length-1)).join(""):Wn()}
    </section>
  `}function En(){const e=ye(),a=r.assessments||[],t=a.filter(A=>["sent","started"].includes(String(A.status||"").toLowerCase())),n=a.filter(A=>String(A.status||"").toLowerCase()==="completed"),s=e?a.find(A=>A.id===e):t[0]||n[0]||null;if(r.assessmentUiStep==="techIntro"&&s)return In(s);if(r.assessmentUiStep==="discIntro"&&s)return Dn(s);if(e&&!s)return`
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
    `;const i=Array.isArray(s.questions)?s.questions:[],l=String(s.status||"").toLowerCase()==="started",o=String(s.status||"").toLowerCase()==="completed",d=String(s.status||"").toLowerCase()==="cancelled",c=qn(s),p=it(),u=Number(s.currentQuestionIndex||0),v=Math.min(p??u,Math.max(i.length-1,0)),w=i[v],L=(w==null?void 0:w.stage)||s.currentStage||1,k=l&&!o&&!d&&!c;return`
    <div class="nw-assess-wrap">
      ${k?Tn(s,L,v,i):Ta(s)}
      ${k?Ln(s,v):""}
      <div class="nw-assess-body" id="assessmentWorkspace">
        ${o?_n(s):d?`<div class="nw-assess-state-card nw-assess-state-card--inline"><div class="nw-assess-state-icon" style="background:#F5F4F0;color:#555">${m("ban")}</div><strong>Assessment cancelled</strong><p>This assessment is no longer available. A new assigned assessment will appear here when your recruiter sends one.</p></div>`:c?`<div class="nw-assess-state-card nw-assess-state-card--inline"><div class="nw-assess-state-icon" style="background:#FEF0F5;color:#CC3666">${m("clock-x")}</div><strong>Assessment link expired</strong><p>This unique assessment link is no longer valid. Contact your Nearwork recruiter if you need a new one.</p><button class="ghost-action" data-page="recruiter" type="button">${m("message-circle")} Contact recruiter</button></div>`:Nn(s,l,v)}
      </div>
      ${Rn(a,s.id)}
    </div>
  `}function Ta(e){const a=String(e.status||"").toLowerCase();return`
    <div class="nw-assess-chrome">
      <div class="nw-assess-chrome__logo">
        <div class="nw-assess-chrome__logotile">N</div>
        <span class="nw-assess-chrome__brand">Nearwork</span>
        <div class="nw-assess-chrome__divider"></div>
        <span class="nw-assess-chrome__sub">Candidate assessment</span>
      </div>
      <div style="flex:1"></div>
      ${["completed","cancelled"].includes(a)?"":`<button class="nw-assess-chrome__exit" type="button">${m("x")} Save &amp; exit</button>`}
    </div>
  `}function Ln(e,a){const t=(e.questions||[]).slice(0,70),n=oe(e,1).filter(o=>qe(ma(e,o))).length,s=oe(e,2).filter(o=>qe(ma(e,o))).length,i=oe(e,1).length||50,l=oe(e,2).length||20;return`
    <section class="assessment-progress-panel">
      <div><strong>Technical</strong><span>${n}/${i} answered</span></div>
      <div><strong>DISC</strong><span>${s}/${l} answered</span></div>
      <div class="assessment-progress-strip">
        ${t.map((o,d)=>{const c=qe(ma(e,o));return`<button type="button" class="${d===a?"active":""} ${c?"answered":""}" data-assessment-jump="${d}" title="${Pa(o.stage)} · Q${d+1}">${d+1}</button>`}).join("")}
      </div>
    </section>
  `}function Tn(e,a,t,n){const s=Number(a),i=Oa(e.technicalStartedAt||e.startedAt)||new Date,l=Oa(e.discStartedAt)||new Date,o=s===1?i:l,d=Number(s===1?e.technicalMinutes||60:e.discMinutes||30),c=new Date(o.getTime()+d*60*1e3),p=s===1?"Technical":"DISC profile",u=(n||[]).filter(k=>Number(k.stage||1)===s),v=(n||[]).findIndex(k=>Number(k.stage||1)===s),w=Math.max(0,t-v),L=u.length?Math.round((w+1)/u.length*100):2;return`
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
          <span>${p} &middot; Question ${w+1} of ${u.length||(s===1?50:20)}</span>
        </div>
        <div class="nw-assess-chrome__progresstrack">
          <div class="nw-assess-chrome__progressfill" style="width:${Math.max(2,L)}%"></div>
        </div>
      </div>
      <div class="nw-timer-pill">
        ${m("timer")}
        <span id="assessmentTimer" data-end="${c.toISOString()}">${d}:00</span>
      </div>
      <button class="nw-assess-chrome__exit" type="button">${m("x")} Save &amp; exit</button>
    </div>
  `}function Nn(e,a,t=null){var H,F,J;if(!a){const W=h(e.role||"Role assessment"),G=h(e.recruiterName||e.recruiter||"Nearwork"),R=oa(e.expiresAt||e.deadline),f=oe(e,1).length||50,g=oe(e,2).length||20,y=Number(e.technicalMinutes||60),S=Number(e.discMinutes||30);return`
      <div class="nw-assess-welcome">
        <div class="nw-assess-welcome__header">
          <span class="nw-assess-role-chip">${m("sparkles")} ${W}</span>
          <span>Sent by ${G}${R?" &middot; expires "+R:""}</span>
        </div>
        <h2 class="nw-assess-welcome__title">Let's see how you think — and how you work.</h2>
        <p class="nw-assess-welcome__desc">This assessment has two parts: a role-knowledge check and a behavioral profile.</p>
        <div class="nw-assess-parts">
          <div class="nw-assess-part">
            <div class="nw-assess-part__blob" style="background:#E4F6EF"></div>
            <div class="nw-assess-part__icon" style="background:#E4F6EF;color:#10A07C">${m("code-2")}</div>
            <span class="nw-assess-part__tag" style="color:#10A07C">Part 1</span>
            <strong class="nw-assess-part__title">Technical Assessment</strong>
            <span class="nw-assess-part__sub">${f} questions &middot; ~${y} min</span>
            <p class="nw-assess-part__desc">Single-choice role scenarios. We're looking at how you think, not whether you remember definitions.</p>
          </div>
          <div class="nw-assess-part">
            <div class="nw-assess-part__blob" style="background:#F7F2FC"></div>
            <div class="nw-assess-part__icon" style="background:#F7F2FC;color:#AF7AC5">${m("compass")}</div>
            <span class="nw-assess-part__tag" style="color:#AF7AC5">Part 2</span>
            <strong class="nw-assess-part__title">DISC Profile</strong>
            <span class="nw-assess-part__sub">${g} statements &middot; ~${S} min</span>
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
    `}const n=(e.questions||[]).slice(0,70),s=Math.min(t??Number(e.currentQuestionIndex||0),Math.max(n.length-1,0)),i=n[s],l=((F=(H=e.answers)==null?void 0:H[i.id])==null?void 0:F.value)??((J=e.answers)==null?void 0:J[i.id])??"",o=Array.isArray(i.options)&&i.options.length?i.options:["Strongly agree","Agree","Neutral","Disagree"],d=n[s+1],c=d==null?void 0:d.stage,p=c&&c!==i.stage,u=wa(e,i.stage),v=p&&u.length,w=s+1>=n.length,L=w?wa(e,i.stage):[],k=!!i.multiple,A=Number(i.stage||1)===2?"nw-assess-chip--violet":"nw-assess-chip--teal",x=k?"Multi-select":"Single choice",$=h(i.part||i.type||(Number(i.stage||1)===2?"DISC":"Scenario")),q=h(i.bank||"");return`
    <form id="assessmentQuestionForm" class="nw-assess-qcard" data-current-index="${s}">
      <div class="nw-assess-qmeta">
        <span class="nw-assess-chip ${A}">${$}</span>
        ${q?`<span class="nw-assess-chip nw-assess-chip--gray">${q}</span>`:""}
        <span class="nw-assess-qtype">&middot; ${x}</span>
      </div>
      ${i.context?`<div class="nw-assess-context"><strong>Context: </strong>${h(i.context)}</div>`:""}
      <p class="nw-assess-qprompt">${h(i.q||"")}</p>
      <fieldset class="nw-assess-options${k?" nw-assess-options--multi":""}">
        <legend>${x}</legend>
        ${o.map((W,G)=>`
          <label class="nw-assess-option${k?" nw-assess-option--multi":""}">
            <input type="radio" name="answer" value="${G}" ${String(l)===String(G)?"checked":""} />
            <span class="nw-assess-option__key">${String.fromCharCode(65+G)}</span>
            <span class="nw-assess-option__text">${h(W)}</span>
            ${k?"":`<span class="nw-assess-option__check">${m("check-circle-2")}</span>`}
          </label>
        `).join("")}
      </fieldset>
      ${v||L.length?Mn(e,v?u:L,i.stage):""}
      <div class="nw-assess-qfooter">
        <button class="ghost-action" id="prevAssessmentQuestion" type="button" ${s===0?"disabled":""}>${m("arrow-left")} Back</button>
        <span class="nw-assess-autosave">${m("check")} Auto-saved</span>
        <div style="flex:1"></div>
        <button class="primary-action fit" type="submit">${w?m("send")+" Submit assessment":"Next "+m("arrow-right")}</button>
      </div>
    </form>
  `}function Mn(e,a,t){if(!a.length)return"";const n=(e.questions||[]).slice(0,70);return`
    <div class="nw-assess-missed">
      <strong>${m("alert-triangle")} Unanswered questions in ${Pa(t)}</strong>
      <p>You skipped ${a.map(s=>`Question ${n.findIndex(i=>i.id===s.id)+1}`).join(", ")}. You can go back now or continue if you meant to leave them blank.</p>
      <div class="nw-assess-missed__links">${a.map(s=>{const i=n.findIndex(l=>l.id===s.id);return`<button class="ghost-action" type="button" data-assessment-jump="${i}">${m("arrow-left")} Go to ${i+1}</button>`}).join("")}</div>
    </div>
  `}function qn(e){return!(e!=null&&e.expiresAt)||String(e.status||"").toLowerCase()==="completed"?!1:Date.now()>new Date(e.expiresAt).getTime()}function In(e){const a=h(e.role||"Role assessment"),t=oe(e,1).length||50,n=Number(e.technicalMinutes||60);return`
    <div class="nw-assess-wrap">
      ${Ta(e)}
      <div class="nw-assess-body">
        <div class="nw-assess-welcome" style="max-width:860px">
          <div style="display:inline-flex;align-items:center;gap:8px;padding:5px 12px;border-radius:999px;background:#E4F6EF;border:1px solid rgba(16,160,124,0.25);margin-bottom:4px">
            <span style="width:6px;height:6px;border-radius:50%;background:#10A07C;display:inline-block"></span>
            <span style="font-size:11.5px;font-weight:600;color:#0A7C5E;text-transform:uppercase;letter-spacing:0.05em">Part 1 of 2 &middot; Starting now</span>
          </div>
          <h2 class="nw-assess-welcome__title" style="font-size:2.2rem">Role knowledge check.</h2>
          <p class="nw-assess-welcome__desc">The next <strong>${t} questions</strong> are about the day-to-day of the ${a} role — scenarios, decisions, and judgement calls. We're looking at how you think, not whether you remember definitions.</p>
          <p style="font-size:0.88rem;color:#9AA0A6;margin:0">You have <strong style="color:#5C6066">${n} minutes</strong> total. Your progress saves automatically after every question. DISC follows when you finish.</p>
          <div class="nw-assess-welcome__cta" style="margin-top:8px">
            <button class="primary-action" id="startAssessment" type="button">${m("play")} Start Part 1</button>
            <button class="ghost-action" id="backToWelcome" type="button">${m("arrow-left")} Back</button>
          </div>
        </div>
      </div>
    </div>
  `}function Dn(e){const a=oe(e,1).length||50,t=oe(e,2).length||20,n=Number(e.discMinutes||30),s=h(e.recruiterName||e.recruiter||"your recruiter"),i=(e.questions||[]).findIndex(l=>Number(l.stage||1)===2);return`
    <div class="nw-assess-wrap">
      ${Ta(e)}
      <div class="nw-assess-body">
        <div style="background:#E4F6EF;border-bottom:1px solid rgba(16,160,124,0.15);padding:13px 20px;display:flex;align-items:center;gap:12px;margin-bottom:24px;border-radius:10px">
          <div style="width:26px;height:26px;border-radius:50%;background:#10A07C;color:#fff;display:flex;align-items:center;justify-content:center;flex-shrink:0">${m("check")}</div>
          <div style="flex:1">
            <div style="font-size:13px;font-weight:600;color:#0A7C5E">Part 1 complete — nice work.</div>
            <div style="font-size:12px;color:#0A7C5E;margin-top:1px">${a}/${a} answered &middot; submitted to ${s} for review</div>
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
              <p class="nw-assess-part__desc">You'll see ${t} statements about how you work. For each one, pick the option that's most like you. Go with your gut — there are no right answers. Takes about ${n} minutes.</p>
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
  `}function _n(e){var l,o;const t=(((l=r.candidate)==null?void 0:l.name)||((o=r.user)==null?void 0:o.displayName)||"").split(" ")[0]||"You",n=h(e.recruiterName||e.recruiter||"your recruiter"),s=oe(e,1).length||50,i=oe(e,2).length||20;return`
    <div class="nw-assess-complete">
      <div class="nw-assess-complete__hero">
        <div class="nw-assess-complete__icon">
          ${m("check")}
          <div class="nw-assess-complete__ring1"></div>
          <div class="nw-assess-complete__ring2"></div>
        </div>
        <h2 class="nw-assess-complete__title">You're done, ${h(t)}.</h2>
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
  `}function Rn(e,a){return e.length?`
    <section class="nw-panel" style="margin-top:18px;padding-bottom:18px;">
      <div class="nw-panel-head"><div><div class="nw-panel-overline">Assessment center</div><div class="nw-panel-title">Your assessment history</div></div></div>
      <div class="assessment-history-list">
        ${e.map(t=>`
          <article class="assessment-history-row ${t.id===a?"active":""}">
            <div><strong>${h(t.role||"Nearwork assessment")}</strong><span>${h(t.id||"")}</span></div>
            <div>${h(String(t.status||"assigned"))}</div>
            <a href="/assessment/${encodeURIComponent(t.id)}/start">${t.status==="completed"?"View":"Continue"}</a>
          </article>
        `).join("")}
      </div>
    </section>
  `:""}function Un(e,a){const t=e.questions||[],n=t.filter(o=>o.stage===1),s=t.filter(o=>o.stage===2),i=n.filter(o=>{var d;return typeof o.correctIndex=="number"&&Number((d=a[o.id])==null?void 0:d.value)===o.correctIndex}).length,l=s.filter(o=>{var d;return qe(((d=a[o.id])==null?void 0:d.value)??a[o.id])}).length;return{technicalScore:n.length?Math.round(i/n.length*100):0,discScore:s.length?Math.round(l/s.length*100):0}}function Bn(e,a){var o,d;const t={Dominance:0,Influence:0,Steadiness:0,Conscientiousness:0};(e.questions||[]).filter(c=>Number(c.stage)===2).forEach(c=>{var w;const p=(w=a[c.id])==null?void 0:w.value;if(!qe(p))return;const u=t[c.skill]!==void 0?c.skill:"Steadiness",v=Math.max(1,4-Number(p||0));t[u]+=v});const n=Object.entries(t).sort((c,p)=>p[1]-c[1]),s=((o=n[0])==null?void 0:o[0])||"Steadiness",i=((d=n[n.length-1])==null?void 0:d[0])||"Dominance";return{label:{Dominance:"D",Influence:"I",Steadiness:"S",Conscientiousness:"C"}[s]||"S",high:s,low:i,scores:t,summary:`${s} is the strongest observed DISC tendency; ${i} appears lowest based on this assessment.`}}async function Fn(e,a){var d,c,p,u,v;const t="https://admin.nearwork.co/api/send-email",n=e.candidateEmail||((d=r.user)==null?void 0:d.email)||((c=r.candidate)==null?void 0:c.email),s=e.candidateName||((p=r.candidate)==null?void 0:p.name)||((u=r.user)==null?void 0:u.displayName)||"there",i=mt([e.recruiterEmail,e.stakeholderEmail,e.hiringManagerEmail].filter(Boolean).join(",")),l=[];n&&l.push(fetch(t,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({to:n,templateId:"assessment_completed_candidate",data:{name:s,role:e.role,actionUrl:"https://talent.nearwork.co/assessment",actionText:"Open assessment center"}})}));const o=i.length?i:["support@nearwork.co"];l.push(fetch(t,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({to:o,templateId:"assessment_completed_recruiter",data:{name:"Nearwork team",role:e.role,actionUrl:`https://admin.nearwork.co/assessments/${e.id}/questions`,actionText:"Review assessment",message:`${s} completed the assessment. Overall: ${a.score}%. Technical: ${a.technicalScore}%. DISC: ${((v=a.discProfile)==null?void 0:v.label)||"Submitted"}.`}})})),await Promise.allSettled(l)}function On(){var a;const e=((a=r.candidate)==null?void 0:a.cvLibrary)||[];return`
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
        ${e.length?e.map(t=>`<article class="cv-item">${m("file-text")}<div><strong>${t.name||t.fileName}</strong><span>${oa(t.uploadedAt)}</span></div>${t.url?`<a href="${t.url}" target="_blank" rel="noreferrer">Open</a>`:""}</article>`).join(""):yt("No CVs saved yet","Upload role-specific resumes here.")}
      </div>
    </section>
  `}function jn(){return`
    <div class="nw-page-head">
      <div class="nw-page-overline">Support</div>
      <h1 class="nw-page-title">Tips</h1>
      <p class="nw-page-lede">Practical prep for US SaaS interviews — short, useful guidance before recruiter screens, assessments, and client interviews.</p>
    </div>
    <section class="tips-grid rich" style="margin-top:18px;">
      ${nn.map((e,a)=>`
        <article class="tip-card">
          <div class="tip-number">${String(a+1).padStart(2,"0")}</div>
          <span>${e.tag}</span>
          <h3>${e.title}</h3>
          <p>${e.body}</p>
          <div class="tip-actions">${e.actions.map(t=>`<small>${t}</small>`).join("")}</div>
          <strong>${e.read} read</strong>
        </article>
      `).join("")}
    </section>
  `}function zn(){var t,n;const a=(((t=r.candidate)==null?void 0:t.recruiter)||{}).bookingUrl||((n=r.candidate)==null?void 0:n.recruiterBookingUrl)||"mailto:support@nearwork.co?subject=Nearwork%20candidate%20question";return`
    <div class="nw-page-head">
      <div class="nw-page-overline">Support</div>
      <h1 class="nw-page-title">Recruiter</h1>
      <p class="nw-page-lede">Your Nearwork talent partner — reach out anytime about assessments, interviews, feedback, or CV selection.</p>
    </div>
    <div class="nw-split" style="margin-top:18px;">
      <section class="nw-panel" style="padding-bottom:18px;">
        <div class="nw-panel-head"><div><div class="nw-panel-overline">Recruiter</div><div class="nw-panel-title">Your Nearwork contact</div></div></div>
        ${Zn(!0)}
      </section>
      <section class="nw-panel" style="padding-bottom:18px;">
        <div class="nw-panel-head"><div><div class="nw-panel-overline">Booking</div><div class="nw-panel-title">Schedule soon</div></div></div>
        <p class="muted">Ask the Nearwork recruiting team for the earliest available slot. Candidate booking links can be attached to this profile later.</p>
        <a class="primary-action fit" href="${a}" target="_blank" rel="noreferrer">${m("calendar-plus")} Book recruiter call</a>
      </section>
    </div>
  `}function Hn(){return Vn("profile")}function z(e,a=!1){return`<span class="pf-label">${e}${a?'<span class="pf-optional">optional</span>':""}</span>`}function ne(e,a,t=""){return`
    <div class="pf-card-head">
      <div class="pf-card-icon">${m(e)}</div>
      <div class="pf-card-title">${a}</div>
      ${t?`<span class="pf-card-badge">${t}</span>`:""}
    </div>`}function Na(e,a={}){const t=e,n=(a.company||"?")[0].toUpperCase();return`
    <div class="pf-sub-card work-entry" data-work-index="${t}">
      <div class="pf-sub-card-left">
        <div class="pf-work-avatar">${n}</div>
      </div>
      <div class="pf-sub-card-body">
        <div class="pf-field-row">
          <label class="pf-field">
            ${z("Job title")}
            <input type="text" class="pf-input work-field" data-field="title" value="${h(a.title||"")}" placeholder="e.g. Customer Success Manager" />
          </label>
          <label class="pf-field">
            ${z("Company")}
            <input type="text" class="pf-input work-field" data-field="company" value="${h(a.company||"")}" placeholder="e.g. Acme Corp" />
          </label>
        </div>
        <div class="pf-field-row pf-field-row--3">
          <label class="pf-field">
            ${z("From")}
            <input type="text" class="pf-input work-field" data-field="from" value="${h(a.from||"")}" placeholder="2021-03" />
          </label>
          <label class="pf-field">
            ${z("To")}
            <input type="text" class="pf-input work-field" data-field="to" value="${h(a.to||"")}" placeholder="present" />
          </label>
          <div></div>
        </div>
      </div>
      <button type="button" class="pf-remove-btn remove-work-entry" data-remove="${t}" aria-label="Remove">
        ${m("x")}
      </button>
    </div>`}const Gn=["","A1","A2","B1","B2","C1","C2","Native"];function Ma(e,a={}){const t=e,n=typeof a=="string"?{name:a,level:""}:a;return`
    <div class="pf-sub-card lang-entry" data-lang-index="${t}">
      <div class="pf-sub-card-body">
        <div class="pf-field-row">
          <label class="pf-field">
            ${z("Language")}
            <input type="text" class="pf-input lang-field" data-field="name" value="${h(n.name||"")}" placeholder="e.g. Spanish, French…" />
          </label>
          <label class="pf-field">
            ${z("Level")}
            <select class="pf-input lang-field" data-field="level">
              ${Gn.map(s=>`<option value="${s}" ${(n.level||"")===s?"selected":""}>${s||"Select level"}</option>`).join("")}
            </select>
          </label>
        </div>
      </div>
      <button type="button" class="pf-remove-btn remove-lang-entry" data-remove="${t}" aria-label="Remove">
        ${m("x")}
      </button>
    </div>`}function qa(e,a={}){const t=e;return`
    <div class="pf-sub-card cert-entry" data-cert-index="${t}">
      <div class="pf-sub-card-left">
        <div class="pf-cert-icon">✓</div>
      </div>
      <div class="pf-sub-card-body">
        <div class="pf-field-row">
          <label class="pf-field">
            ${z("Certificate / Course")}
            <input type="text" class="pf-input cert-field" data-field="name" value="${h(a.name||"")}" placeholder="e.g. Google Analytics" />
          </label>
          <label class="pf-field">
            ${z("Issuer",!0)}
            <input type="text" class="pf-input cert-field" data-field="issuer" value="${h(a.issuer||"")}" placeholder="e.g. Coursera, HubSpot" />
          </label>
        </div>
        <label class="pf-field" style="max-width:200px;">
          ${z("Date (YYYY-MM)",!0)}
          <input type="text" class="pf-input cert-field" data-field="date" value="${h(a.date||"")}" placeholder="2023-06" />
        </label>
      </div>
      <button type="button" class="pf-remove-btn remove-cert-entry" data-remove="${t}" aria-label="Remove">
        ${m("x")}
      </button>
    </div>`}function Vn(e="profile"){var v,w,L,k,A,x,$,q,H,F,J,W,G,R,f,g,y,S;const a=Je(),t=ln(),n=t.country==="Colombia",s=ge[t.department]||[],i=((v=r.candidate)==null?void 0:v.salaryCurrency)||"USD",l=ut(((w=r.candidate)==null?void 0:w.salaryAmount)||((L=r.candidate)==null?void 0:L.salary)||((k=r.candidate)==null?void 0:k.salaryUSD),i),o=cn(),d=((A=r.candidate)==null?void 0:A.targetRole)||((x=r.candidate)==null?void 0:x.headline)||"",c=ft(),p=Ea(),u=p.filter(b=>b.done).length;return`
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
      <div class="pf-progress-label">${u} of ${p.length} sections complete</div>

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
            ${ne("user-round","Identity")}
            <div class="pf-identity-row">
              <div class="pf-avatar-upload">
                ${rt("large")}
                <label class="pf-photo-btn">
                  ${m("camera")} Change photo
                  <input name="photo" type="file" accept="image/png,image/jpeg,image/webp" style="display:none;" />
                </label>
              </div>
              <div class="pf-field" style="flex:1;">
                ${z("Full name")}
                <input class="pf-input" name="name" value="${h((($=r.candidate)==null?void 0:$.name)||((q=r.user)==null?void 0:q.displayName)||"")}" placeholder="Your full name" />
              </div>
            </div>
          </div>

          <!-- ── Role ── -->
          <div class="pf-card">
            ${ne("briefcase-business","Role applying for")}
            <div class="pf-field-row">
              <label class="pf-field">
                ${z("Area")}
                <select class="pf-input" name="roleGroup" id="roleGroupSelect">
                  ${ct(o)}
                </select>
              </label>
              <label class="pf-field">
                ${z("Target role")}
                <select class="pf-input" name="targetRole" id="targetRoleSelect">
                  ${ra(o,d)}
                </select>
              </label>
            </div>
          </div>

          <!-- ── Location ── -->
          <div class="pf-card">
            ${ne("map-pin","Location")}
            <label class="pf-field" style="margin-bottom:14px;">
              ${z("Country")}
              <select class="pf-input" name="country" id="countrySelect">
                ${tt.map(b=>`<option value="${h(b)}" ${b===t.country?"selected":""}>${E(b)}</option>`).join("")}
              </select>
            </label>
            <div class="pf-field-row" id="pfCoLoc" style="display:${n?"":"none"};">
              <label class="pf-field">
                ${z("Department")}
                <select class="pf-input" name="department" id="departmentSelect">
                  ${Object.keys(ge).map(b=>`<option value="${h(b)}" ${b===t.department?"selected":""}>${b}</option>`).join("")}
                </select>
              </label>
              <label class="pf-field">
                ${z("City")}
                <select class="pf-input" name="city" id="citySelect">
                  ${s.map(b=>`<option value="${h(b)}" ${b===t.city?"selected":""}>${b}</option>`).join("")}
                </select>
              </label>
            </div>
            <p id="pfCoHint" style="display:${n?"none":"block"};font-size:12.5px;color:var(--mid);margin:0;line-height:1.5;">No state or city needed — country is enough.</p>
          </div>

          <!-- ── Compensation ── -->
          <div class="pf-card">
            ${ne("banknote","Compensation")}
            <label class="pf-field" style="max-width:280px;">
              ${z("Target monthly salary")}
              <div class="pf-salary-wrap">
                <select id="salaryCurrencyInput" name="salaryCurrency" class="pf-currency-select">
                  <option value="USD" ${l.salaryCurrency==="USD"?"selected":""}>USD</option>
                  <option value="COP" ${l.salaryCurrency==="COP"?"selected":""}>COP</option>
                </select>
                <input class="pf-input pf-salary-input" id="salaryInput" name="salary" value="${h(l.salaryAmount?ba(l.salaryAmount,l.salaryCurrency):"")}" inputmode="numeric" placeholder="2,500" />
              </div>
              <span class="pf-hint">How much you're looking for, per month.</span>
            </label>
          </div>

          <!-- ── English & languages ── -->
          <div class="pf-card" id="langCard">
            ${ne("languages","English & languages")}
            <label class="pf-field" style="max-width:280px; margin-bottom:14px;">
              ${z("English level")}
              <select class="pf-input" name="english">
                ${["","B1","B2","C1","C2","Native"].map(b=>{var T;return`<option value="${b}" ${((T=r.candidate)==null?void 0:T.english)===b?"selected":""}>${b||"Select level"}</option>`}).join("")}
              </select>
            </label>
            ${z("Other languages",!0)}
            <p class="pf-hint">Add any other languages you speak and your level in each.</p>
            <div id="langEntries" class="pf-entries">
              ${(((H=r.candidate)==null?void 0:H.languages)||[]).map((b,T)=>Ma(T,b)).join("")}
            </div>
            <button type="button" id="addLangEntry" class="pf-add-btn">
              ${m("plus")} Add language
            </button>
          </div>

          <!-- ── Contact ── -->
          <div class="pf-card">
            ${ne("phone","Contact")}
            <div class="pf-field-row">
              <label class="pf-field">
                ${z("WhatsApp number")}
                <input class="pf-input" name="whatsapp" value="${h(((F=r.candidate)==null?void 0:F.whatsapp)||((J=r.candidate)==null?void 0:J.phone)||"")}" inputmode="tel" autocomplete="tel" placeholder="+57 300 123 4567" required />
              </label>
              <label class="pf-field">
                ${z("LinkedIn",!0)}
                <input class="pf-input" name="linkedin" value="${h(((W=r.candidate)==null?void 0:W.linkedin)||"")}" placeholder="https://linkedin.com/in/…" />
              </label>
            </div>
          </div>

          <!-- ── Communications ── -->
          <div class="pf-card">
            ${ne("mail","Communications")}
            <label class="pf-checkbox-row">
              <input type="checkbox" name="marketingConsent" ${((G=r.candidate)==null?void 0:G.marketingConsent)===!0?"checked":""} />
              <span>Send me job opportunities and updates from Nearwork by email</span>
            </label>
            <p class="pf-hint">You can turn this on or off at any time. It won't affect emails about your active applications.</p>
          </div>

          ${e==="onboarding"?"":`
          <!-- ── Danger zone ── -->
          <div class="pf-card pf-danger-card">
            ${ne("trash-2","Delete account")}
            <p class="pf-hint">Permanently delete your Nearwork profile, resume, applications, and assessment history. This cannot be undone — you can create a new account with the same email later if you change your mind.</p>
            <button type="button" id="openDeleteAccount" class="pf-danger-btn">
              ${m("trash-2")} Delete my account
            </button>
          </div>`}

        </div>

        <!-- ── Skills ── -->
        <div class="pf-tab-panel" data-tab-panel="skills" hidden>
          <div class="pf-card">
            ${ne("sparkles","Skills",a.length?`${a.length} added`:"")}
            ${dt(a)}
          </div>
        </div>

        <!-- ── CV ── -->
        <div class="pf-tab-panel" data-tab-panel="cv" hidden>
          <div class="pf-card" id="profileCvCard">
            ${ne("file-text","CV")}
            <p class="pf-hint">Upload the CV you want Nearwork to use for your applications.</p>
            ${(R=r.candidate)!=null&&R.activeCvName||(f=r.candidate)!=null&&f.cvUrl?`
              <div class="pf-cv-current">
                <div class="pf-cv-icon">${m("file-text")}</div>
                <div class="pf-cv-info">
                  <strong>${E(r.candidate.activeCvName||"CV on file")}</strong>
                  <span>Currently active · upload below to replace</span>
                </div>
                ${r.candidate.cvUrl?`<a class="pf-cv-open" href="${h(r.candidate.cvUrl)}" target="_blank" rel="noreferrer">${m("external-link")} Open</a>`:""}
              </div>`:""}
            <label class="pf-file-label" for="profileCvFileInput">
              ${m("upload")} Choose file (.pdf, .doc, .docx)
            </label>
            <input id="profileCvFileInput" name="profileCv" type="file" accept=".pdf,.doc,.docx" style="display:none;" />
            <label class="pf-field" style="margin-top:10px;">
              ${z("CV label",!0)}
              <input class="pf-input" name="profileCvLabel" type="text" placeholder="e.g. Customer Success CV" />
            </label>
          </div>
        </div>

        <!-- ── Experience ── -->
        <div class="pf-tab-panel" data-tab-panel="experience" hidden>

          <!-- ── Summary ── -->
          <div class="pf-card">
            ${ne("align-left","Summary","optional")}
            <textarea class="pf-input pf-textarea" name="summary" placeholder="Add a short note about what you do best — 2–3 sentences.">${E(((g=r.candidate)==null?void 0:g.summary)||"")}</textarea>
          </div>

          <!-- ── Work history ── -->
          <div class="pf-card" id="workHistoryCard">
            ${ne("building-2","Work experience","optional")}
            <p class="pf-hint">Add your previous roles so recruiters can see your background.</p>
            <div id="workEntries" class="pf-entries">
              ${(((y=r.candidate)==null?void 0:y.workHistory)||[]).map((b,T)=>Na(T,b)).join("")}
            </div>
            <button type="button" id="addWorkEntry" class="pf-add-btn">
              ${m("plus")} Add position
            </button>
          </div>

        </div>

        <!-- ── Certifications ── -->
        <div class="pf-tab-panel" data-tab-panel="certifications" hidden>
          <div class="pf-card" id="certCard">
            ${ne("graduation-cap","Certifications &amp; courses","optional")}
            <p class="pf-hint">Add certificates, licences, or courses relevant to your work.</p>
            <div id="certEntries" class="pf-entries">
              ${(((S=r.candidate)==null?void 0:S.certifications)||[]).map((b,T)=>qa(T,b)).join("")}
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
  `}function ft(){const e=Ea(),a=e.filter(t=>t.done).length;return Math.max(25,Math.round(a/e.length*100))}function Qn(){const e=r.applications[0];return(e==null?void 0:e.stage)||(e==null?void 0:e.status)||"profile-review"}function Jn(e){const a=String(e).toLowerCase().replace(/_/g,"-").replace(/\s+/g,"-"),t=Math.max(0,Fa.findIndex(n=>a.includes(n.key)||n.key.includes(a)));return`<div class="pipeline">${Fa.map((n,s)=>`<article class="${s<=t?"done":""} ${s===t?"current":""}"><span>${s+1}</span><strong>${n.label}</strong><p>${n.help}</p></article>`).join("")}</div>`}function Wn(){return`
    <div class="nw-empty">
      ${m("briefcase-business")}
      <strong>No active pipeline yet</strong>
      <p>Browse current openings and apply when you find a role that fits. Nearwork will show your applications here once you apply.</p>
      <div style="display:flex;gap:8px;margin-top:12px;">
        <button class="nw-btn-primary" type="button" data-page="matches">${m("sparkles")} View matches</button>
        <a class="nw-btn-secondary" href="https://jobs.nearwork.co" target="_blank" rel="noreferrer">${m("external-link")} Open jobs</a>
      </div>
    </div>
  `}function ht(){try{return new Set(JSON.parse(localStorage.getItem("nw_talent_applied")||"[]"))}catch{return new Set}}function Yn(e){const a=Ce(e),n=new Set(r.applications.map(u=>u.jobId||u.openingCode)).has(a.code)||ht().has(a.code),s=xa(a),i=a.match||(s.length>=3?Math.min(97,70+s.length*4):null),l=["#10A07C","#EC4E7E","#3B82F6","#F4A52E"],o=l[a.orgName.length%l.length],d=a.orgName.split(/\s+/).slice(0,2).map(u=>u[0]).join("").toUpperCase(),c=`https://jobs.nearwork.co/apply?code=${encodeURIComponent(a.code)}`,p=(s.length?s:a.skills).slice(0,3);return`
    <div class="nw-match-card">
      <div class="nw-match-card-top">
        <div class="nw-match-avatar" style="background:${o};">${d}</div>
        ${i?`<div class="nw-match-score">${i}% match</div>`:""}
      </div>
      <div class="nw-match-role">${E(a.title)}</div>
      <div class="nw-match-company">${E(a.orgName)} · ${E(a.location)}</div>
      <div class="nw-match-chips">${p.map(E).map(u=>`<span class="nw-match-chip">${u}</span>`).join("")}</div>
      <div class="nw-match-footer">
        <span class="nw-match-salary">${E(a.compensation)}</span>
        <button type="button" class="nw-match-view" data-open-url="${h(c)}">View opening ${m("arrow-up-right")}</button>
      </div>
      <button class="nw-match-applybtn${n?" applied":""}" type="button" data-apply="${a.code}" ${n?"disabled":""}>${n?`${m("check")} Applied`:`Apply now ${m("arrow-right")}`}</button>
    </div>
  `}function Kn(e,a){const t=String(e.stage||e.status||"applied").toLowerCase(),n=t.includes("offer")?4:t.includes("final")?3:t.includes("interview")?2:t.includes("assessment")?1:0,s=e.clientName||e.company||"Nearwork client",i=s.split(/\s+/).slice(0,2).map(c=>c[0]).join("").toUpperCase(),l=["#10A07C","#EC4E7E","#3B82F6","#F4A52E","#8B5CF6"],o=l[s.length%l.length],d=["action-needed","interview-scheduled","assessment-sent"].includes(String(e.status||"").toLowerCase());return`
    <div class="nw-app-row${a?" last":""}">
      <div class="nw-app-avatar" style="background:${o};">${i}</div>
      <div class="nw-app-info">
        <div class="nw-app-title">${E(e.jobTitle||e.title||"Application")} <span class="nw-app-company">· ${E(s)}</span></div>
        <div class="nw-app-stages">
          ${nt.map((c,p)=>`<div class="nw-stage-pip${p<=n?" done":""}"></div>`).join("")}
          <span class="nw-app-stage-label">${e.stage||e.status||"Applied"}</span>
        </div>
      </div>
      <div class="nw-app-meta">
        <span class="nw-app-status${d?" action":""}">${e.status||"In review"}</span>
        <div class="nw-app-date">${oa(e.updatedAt||e.createdAt)}</div>
      </div>
      ${m("chevron-right")}
    </div>`}function Zn(e=!1){var i;const a=((i=r.candidate)==null?void 0:i.recruiter)||{},t=a.email||"support@nearwork.co",n=a.whatsapp||Xt,s=a.whatsappUrl||en;return`<article class="recruiter-card"><div class="avatar recruiter-avatar">NW</div><div><strong>${a.name||"Nearwork Support"}</strong><p><a href="mailto:${t}">${t}</a></p><p><a href="${s}" target="_blank" rel="noreferrer">WhatsApp ${n}</a></p>${e?"<span>Questions about assessments, interviews, feedback, or CV selection should go here.</span>":""}</div></article>`}function yt(e,a){return`<div class="empty-state">${m("inbox")}<strong>${e}</strong><p>${a}</p></div>`}function Xn(e){const a=(e==null?void 0:e.title)||(e==null?void 0:e.role)||"this role",t=document.createElement("div");t.className="nw-modal-overlay",t.innerHTML=`
    <div class="nw-modal" style="text-align:center;padding:32px 28px;">
      <div style="font-size:48px;margin-bottom:12px;">🎉</div>
      <h3 style="font-size:18px;margin-bottom:10px;">Application submitted!</h3>
      <p style="margin-bottom:6px;">You've applied to <strong>${E(a)}</strong>. Our team will review your profile and reach out with next steps shortly.</p>
      <p style="font-size:12px;color:var(--light);margin-bottom:20px;">You can track your application status in the Applications tab.</p>
      <button type="button" class="pf-btn-primary" id="dismissApplySuccess" style="padding:11px 28px;border-radius:99px;font-size:14px;">Got it</button>
    </div>`,document.body.appendChild(t),t.addEventListener("click",n=>{(n.target===t||n.target.id==="dismissApplySuccess")&&t.remove()}),document.getElementById("dismissApplySuccess").focus()}function es(){ia.innerHTML='<main class="loading-screen"><span class="logo-mark">N</span><p>Loading Talent...</p></main>'}async function as(e){var a;try{const t=await((a=U.currentUser)==null?void 0:a.getIdToken().catch(()=>""));if(t){const n=await fetch("/api/auth-handoff",{method:"POST",headers:{Authorization:"Bearer "+t,"Content-Type":"application/json"}});if(n.ok){const{customToken:s}=await n.json();if(s){const i=new URL(e);i.searchParams.set("ct",s),window.open(i.toString(),"_blank","noreferrer");return}}}}catch{}window.open(e,"_blank","noreferrer")}function ts(){var e,a,t,n,s,i,l,o,d,c,p,u,v,w,L,k,A,x,$,q,H,F,J,W,G,R;(e=document.querySelector("#signOut"))==null||e.addEventListener("click",async()=>{await da(U),V&&V(),V=null,He=!1,Z=!1,re=null,window.history.pushState({page:"overview"},"","/"),C({user:null,candidate:null,applications:[],assessments:[],jobs:[],view:"login",activePage:"overview",message:""})}),(a=document.querySelector("#mobileSignOut"))==null||a.addEventListener("click",async()=>{await da(U),V&&V(),V=null,He=!1,Z=!1,re=null,window.history.pushState({page:"overview"},"","/"),C({user:null,candidate:null,applications:[],assessments:[],jobs:[],view:"login",activePage:"overview",message:""})}),(t=document.querySelector("#signIn"))==null||t.addEventListener("click",()=>{window.history.pushState({page:"overview"},"","/"),C({view:"login",activePage:"overview",message:""})}),(n=document.querySelector("#openDeleteAccount"))==null||n.addEventListener("click",()=>{C({showDeleteAccountModal:!0,deleteAccountStatus:null,deleteAccountError:""})}),(s=document.querySelector("#cancelDeleteAccount"))==null||s.addEventListener("click",()=>{C({showDeleteAccountModal:!1,deleteAccountStatus:null,deleteAccountError:""})}),(i=document.querySelector("#confirmDeleteAccount"))==null||i.addEventListener("click",async()=>{var g,y;if(((y=(g=document.querySelector("#deleteConfirmInput"))==null?void 0:g.value)==null?void 0:y.trim())!=="DELETE"){C({deleteAccountStatus:"error",deleteAccountError:'Type "DELETE" to confirm.'});return}C({deleteAccountStatus:"deleting"});try{await Vt(),await da(U),V&&V(),V=null,He=!1,Z=!1,re=null,window.history.pushState({page:"overview"},"","/"),C({user:null,candidate:null,applications:[],assessments:[],jobs:[],view:"login",activePage:"overview",showDeleteAccountModal:!1,deleteAccountStatus:null,deleteAccountError:"",message:"Your account has been deleted. You're welcome to sign up again anytime."})}catch(S){C({deleteAccountStatus:"error",deleteAccountError:S.message||"Failed to delete account."})}}),document.querySelectorAll("[data-page]").forEach(f=>{f.addEventListener("click",g=>{const S=(g.currentTarget.closest("[data-page]")||g.currentTarget).dataset.page;if(r.activePage==="profile"&&Z&&S!=="profile"){re=S,C({showUnsavedChangesModal:!0});return}je(S)})}),(l=document.querySelector("[data-dashboard-home]"))==null||l.addEventListener("click",()=>{if(r.activePage==="profile"&&Z){re="overview",C({showUnsavedChangesModal:!0});return}je("overview")}),(o=document.querySelector("#cancelUnsavedNav"))==null||o.addEventListener("click",()=>{re=null,C({showUnsavedChangesModal:!1})}),(d=document.querySelector("#discardUnsavedNav"))==null||d.addEventListener("click",()=>{Z=!1;const f=re;re=null,C({showUnsavedChangesModal:!1}),f&&je(f)}),(c=document.querySelector("#saveUnsavedNav"))==null||c.addEventListener("click",()=>{var f;C({showUnsavedChangesModal:!1}),(f=document.querySelector("#profileForm"))==null||f.requestSubmit()}),(p=document.querySelector("#notificationBell"))==null||p.addEventListener("click",()=>{C({notificationPanelOpen:!r.notificationPanelOpen,notificationSettingsOpen:!1})}),(u=document.querySelector("#notificationSettings"))==null||u.addEventListener("click",()=>{C({notificationSettingsOpen:!r.notificationSettingsOpen,notificationPanelOpen:!1})}),document.querySelectorAll("[data-notification-read]").forEach(f=>{f.addEventListener("click",async()=>{const g=f.dataset.notificationRead;r.user&&be&&await Yt(g).catch(()=>null),C({notifications:r.notifications.map(y=>y.id===g?{...y,read:!0}:y)})})}),document.querySelectorAll("[data-notification-pref]").forEach(f=>{f.addEventListener("change",async()=>{var b;const g=structuredClone(((b=r.candidate)==null?void 0:b.notificationPreferences)||{}),y=f.dataset.notificationPref,S=f.dataset.channel;g[y]={...g[y]||{},[S]:f.checked},C({candidate:{...r.candidate,notificationPreferences:g}}),r.user&&be&&await Kt(r.user.uid,g).catch(()=>null)})}),document.querySelectorAll("[data-assessment-jump]").forEach(f=>{f.addEventListener("click",async()=>{var ae,Y,D;const g=ye()||((ae=(r.assessments||[])[0])==null?void 0:ae.id),y=(r.assessments||[]).find(I=>I.id===g),S=Number(f.dataset.assessmentJump||0),b=(Y=y==null?void 0:y.questions)==null?void 0:Y[S];if(!g||!b)return;await Oe(g,"__progress__","",{currentQuestionIndex:S,totalQuestions:((D=y==null?void 0:y.questions)==null?void 0:D.length)||70,currentStage:b.stage||1}),Ne(g,S);const T=(r.assessments||[]).map(I=>I.id===g?{...I,currentQuestionIndex:S,currentStage:b.stage||1}:I);C({assessments:T,activePage:"assessment",message:""})})}),document.querySelector("#availability").addEventListener("change",async f=>{const g=f.target.value;C({candidate:{...r.candidate,availability:g}}),r.user&&be?await Gt(r.user.uid,g):C({message:"Sign in to save availability."})}),(v=document.querySelector("#filterMatches"))==null||v.addEventListener("click",()=>{const f=Je().length>=3;C({matchesFiltered:f?!r.matchesFiltered:!1,message:f?"":"Add at least 5 skills in Profile first, then filter matching openings."})}),(w=document.querySelector("#departmentSelect"))==null||w.addEventListener("change",f=>{const g=document.querySelector("#citySelect"),y=ge[f.target.value]||[];g.innerHTML=y.map(S=>`<option value="${h(S)}">${S}</option>`).join("")}),(L=document.querySelector("#countrySelect"))==null||L.addEventListener("change",f=>{const g=f.target.value==="Colombia",y=document.querySelector("#pfCoLoc"),S=document.querySelector("#pfCoHint");y&&(y.style.display=g?"":"none"),S&&(S.style.display=g?"none":"block")}),(k=document.querySelector("#roleGroupSelect"))==null||k.addEventListener("change",f=>{const g=document.querySelector("#targetRoleSelect");g.innerHTML=ra(f.target.value,"")}),(A=document.querySelector("#salaryCurrencyInput"))==null||A.addEventListener("change",f=>{const g=document.querySelector("#salaryInput");if(!g)return;const y=ja(g.value,f.target.value);f.target.value=y,g.placeholder=y==="COP"?"5,000,000":"2,500",g.value=ba(g.value,y)}),(x=document.querySelector("#salaryInput"))==null||x.addEventListener("blur",f=>{const g=document.querySelector("#salaryCurrencyInput"),y=ja(f.target.value,(g==null?void 0:g.value)||"USD");g&&(g.value=y),f.target.placeholder=y==="COP"?"5,000,000":"2,500",f.target.value=ba(f.target.value,y)}),Sn(),wt(),ds(),ss(),ls(),os(),ns(),document.querySelectorAll("[data-open-url]").forEach(f=>{f.addEventListener("click",()=>as(f.dataset.openUrl))}),document.querySelectorAll("[data-apply]").forEach(f=>{f.addEventListener("click",async()=>{const g=r.jobs.map(Ce).find(S=>S.code===f.dataset.apply),y=f.dataset.apply;if(f.disabled=!0,f.textContent="Submitting...",r.user&&be){try{const S=ht();S.add(y),localStorage.setItem("nw_talent_applied",JSON.stringify([...S]))}catch{}await Ht(r.user.uid,g),f.textContent=`${m("check")} Applied`,f.classList.add("applied"),Xn(g)}else C({message:"Sign in to apply to this opening."})})}),($=document.querySelector("#showTechIntro"))==null||$.addEventListener("click",()=>{C({assessmentUiStep:"techIntro",message:""})}),(q=document.querySelector("#backToWelcome"))==null||q.addEventListener("click",()=>{C({assessmentUiStep:null,message:""})}),(H=document.querySelector("#startDiscAssessment"))==null||H.addEventListener("click",async()=>{var Y;const f=ye()||((Y=(r.assessments||[])[0])==null?void 0:Y.id),g=(r.assessments||[]).find(D=>D.id===f);if(!f||!g)return;const y=g.questions||[],S=document.querySelector("#startDiscAssessment"),b=S?Number(S.dataset.discIndex||50):y.findIndex(D=>Number(D.stage||1)===2),T=b>=0?b:50,ae=new Date().toISOString();try{await Oe(f,"__progress__","",{currentQuestionIndex:T,totalQuestions:y.length,currentStage:2,discStartedAt:ae}),Ne(f,T);const D=(r.assessments||[]).map(I=>I.id===f?{...I,currentQuestionIndex:T,currentStage:2,discStartedAt:ae}:I);C({assessments:D,activePage:"assessment",assessmentUiStep:null,message:""})}catch(D){C({message:Ae(D)})}}),(F=document.querySelector("#startAssessment"))==null||F.addEventListener("click",async()=>{var y;const f=ye()||((y=(r.assessments||[])[0])==null?void 0:y.id),g=(r.assessments||[]).find(S=>S.id===f)||(r.assessments||[])[0];if(!f||!r.user){C({message:"Please log in to start your assessment."});return}try{await jt(f,r.user.uid),Ne(f,Number((g==null?void 0:g.currentQuestionIndex)||0),!0);const S=(r.assessments||[]).map(b=>b.id===f?{...b,status:"started",startedAt:b.startedAt||new Date().toISOString(),technicalStartedAt:b.technicalStartedAt||new Date().toISOString()}:b);C({assessments:S,activePage:"assessment",assessmentUiStep:null,message:""})}catch(S){C({message:Ae(S)})}}),(J=document.querySelector("#prevAssessmentQuestion"))==null||J.addEventListener("click",async()=>{var ae,Y,D,I;const f=ye()||((ae=(r.assessments||[])[0])==null?void 0:ae.id),g=(r.assessments||[]).find(ce=>ce.id===f),y=Number(((Y=document.querySelector("#assessmentQuestionForm"))==null?void 0:Y.dataset.currentIndex)??(g==null?void 0:g.currentQuestionIndex)??0),S=Math.max(0,y-1),b=(D=g==null?void 0:g.questions)==null?void 0:D[S];await Oe(f,"__progress__","",{currentQuestionIndex:S,totalQuestions:((I=g==null?void 0:g.questions)==null?void 0:I.length)||70,currentStage:(b==null?void 0:b.stage)||1}),Ne(f,S);const T=(r.assessments||[]).map(ce=>ce.id===f?{...ce,currentQuestionIndex:S,currentStage:(b==null?void 0:b.stage)||1}:ce);C({assessments:T,activePage:"assessment",message:""})}),(W=document.querySelector("#assessmentQuestionForm"))==null||W.addEventListener("submit",async f=>{var _e;f.preventDefault();const g=ye()||((_e=(r.assessments||[])[0])==null?void 0:_e.id),y=(r.assessments||[]).find(O=>O.id===g),S=(y==null?void 0:y.questions)||[],b=Number(f.currentTarget.dataset.currentIndex??(y==null?void 0:y.currentQuestionIndex)??0),T=S[b],ae=new FormData(f.currentTarget).get("answer");if(!T){C({message:"This question could not be loaded. Please refresh and try again."});return}const Y=ae===null?{value:"",skipped:!0,answeredAt:new Date().toISOString()}:{value:Number(ae),skipped:!1,answeredAt:new Date().toISOString()},D={...y.answers||{},[T.id]:Y},I=S[b+1],ce=I&&Number(I.stage||1)!==Number(T.stage||1),Le=wa(y,T.stage,D);try{if((ce||b+1>=S.length)&&Le.length){await Oe(g,T.id,D[T.id],{currentQuestionIndex:b,totalQuestions:S.length,currentStage:T.stage||1});const O=(r.assessments||[]).map(te=>te.id===g?{...te,answers:D,currentQuestionIndex:b,currentStage:T.stage||1,progress:`${b+1}/${S.length}`}:te);C({assessments:O,activePage:"assessment",message:`You missed ${Le.length} question${Le.length===1?"":"s"} in the ${Pa(T.stage)}.`});return}if(b+1>=S.length){const O=Un(y,D),te=Bn(y,D);await zt(g,D,{totalQuestions:S.length,technicalScore:O.technicalScore,discScore:O.discScore,score:Math.round(O.technicalScore*.75+O.discScore*.25),discProfile:te}),fetch("https://admin.nearwork.co/api/generate-assessment-insights",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({assessmentId:g})}).catch(()=>null),Fn(y,{score:Math.round(O.technicalScore*.75+O.discScore*.25),technicalScore:O.technicalScore,discScore:O.discScore,discProfile:te}).catch(fe=>console.warn(fe));const ve=(r.assessments||[]).map(fe=>fe.id===g?{...fe,answers:D,status:"completed",score:Math.round(O.technicalScore*.75+O.discScore*.25),technical:O.technicalScore,disc:te.label,discProfile:te,progress:`${S.length}/${S.length}`}:fe);C({assessments:ve,activePage:"assessment",message:""})}else{const O=T.stage===1&&(I==null?void 0:I.stage)===2&&!y.discStartedAt;await Oe(g,T.id,D[T.id],{currentQuestionIndex:b+1,totalQuestions:S.length,currentStage:(I==null?void 0:I.stage)||T.stage||1}),Ne(g,b+1);const te=(r.assessments||[]).map(ve=>ve.id===g?{...ve,answers:D,currentQuestionIndex:b+1,currentStage:(I==null?void 0:I.stage)||T.stage||1,progress:`${b+1}/${S.length}`}:ve);C({assessments:te,activePage:"assessment",message:"",assessmentUiStep:O?"discIntro":null})}}catch(O){C({message:Ae(O)})}}),(G=document.querySelector("#profileForm"))==null||G.addEventListener("submit",async f=>{var ce,Le,_e,O,te,ve,fe,Ia,Da,_a;f.preventDefault();const g=new FormData(f.currentTarget),y=g.get("country")||"Colombia",S=y==="Colombia",b=S?g.get("department"):"",T=S?g.get("city"):"",ae=String(y).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,""),Y=ut(g.get("salary"),g.get("salaryCurrency")),D=g.get("marketingConsent")==="on",I={name:g.get("name"),targetRole:g.get("targetRole"),headline:g.get("targetRole"),department:b,city:T,locationId:S?`${String(T).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g,"-")}-co`:ae,location:S?`${T}, ${b}`:y,locationCity:T,locationDepartment:b,locationCountry:y,english:g.get("english"),salary:Y.salary,salaryUSD:Y.salaryUSD,salaryAmount:Y.salaryAmount,salaryCurrency:Y.salaryCurrency,expectedSalaryAmount:Y.salaryAmount,expectedSalaryCurrency:Y.salaryCurrency,linkedin:g.get("linkedin"),whatsapp:g.get("whatsapp"),phone:g.get("whatsapp"),skills:[...new Set(g.getAll("skills").map(Ee).filter(Boolean))],otherSkills:[],languages:rs(),summary:g.get("summary"),email:((ce=r.candidate)==null?void 0:ce.email)||((Le=r.user)==null?void 0:Le.email)||"",availability:((_e=r.candidate)==null?void 0:_e.availability)||"open",marketingConsent:D,marketingConsentAt:D?((O=r.candidate)==null?void 0:O.marketingConsent)===!0?((te=r.candidate)==null?void 0:te.marketingConsentAt)||null:new Date().toISOString():null,onboarded:!0};if(!r.user){C({candidate:{...r.candidate,...I},message:"Preview updated. Sign in to save this profile."});return}try{const Te=g.get("photo");let Ra=((ve=r.candidate)==null?void 0:ve.photoURL)||((fe=r.user)==null?void 0:fe.photoURL)||"";Te!=null&&Te.name&&(Ra=await Jt(r.user.uid,Te));const We=(Ia=g.get("profileCv"))!=null&&Ia.name?g.get("profileCv"):aa;let $e=null,Ua=!1;if(We!=null&&We.name)try{$e=await ya(r.user.uid,We,g.get("profileCvLabel")||""),aa=null}catch{Ua=!0}const la={...I,photoURL:Ra,candidateCode:(Da=r.candidate)==null?void 0:Da.candidateCode,...$e?{activeCvId:$e.id,activeCvName:$e.name||$e.fileName,cvUrl:$e.url,cvLibrary:[...((_a=r.candidate)==null?void 0:_a.cvLibrary)||[],$e]}:{},workHistory:(()=>{var Re,Ue,Be,Fe;const ke=is();return ke.length?ke:(Re=se==null?void 0:se.workHistory)!=null&&Re.length&&(Me||!((Be=(Ue=r.candidate)==null?void 0:Ue.workHistory)!=null&&Be.length))?se.workHistory:((Fe=r.candidate)==null?void 0:Fe.workHistory)||[]})(),certifications:(()=>{var Re,Ue,Be,Fe;const ke=cs();return ke.length?ke:(Re=se==null?void 0:se.certifications)!=null&&Re.length&&(Me||!((Be=(Ue=r.candidate)==null?void 0:Ue.certifications)!=null&&Be.length))?se.certifications:((Fe=r.candidate)==null?void 0:Fe.certifications)||[]})()};se=null,Me=!1;const ca=await $a(r.user.uid,la),St=Ua?"Profile saved, but the CV failed to upload. Try uploading it again from the CV section.":(ca==null?void 0:ca.atsSynced)===!1?"Profile saved. Nearwork will finish connecting it to your workspace.":"Profile saved.";if(g.get("mode")==="onboarding")window.history.pushState({page:"overview"},"","/"),C({candidate:{...r.candidate,...la},activePage:"overview",message:"Profile complete. Welcome to Talent."});else if(Z=!1,C({candidate:{...r.candidate,...la},message:St,showUnsavedChangesModal:!1}),re){const ke=re;re=null,je(ke)}}catch(Te){C({message:Ae(Te)})}}),(R=document.querySelector("#cvForm"))==null||R.addEventListener("submit",async f=>{var S;f.preventDefault();const g=new FormData(f.currentTarget),y=g.get("cv");if(y!=null&&y.name){if(!r.user){C({message:"Sign in to upload and store CVs."});return}try{const b=await ya(r.user.uid,y,g.get("label"));C({candidate:{...r.candidate,cvLibrary:[...((S=r.candidate)==null?void 0:S.cvLibrary)||[],b],activeCvId:b.id},message:"CV uploaded."})}catch(b){C({message:Ae(b)})}}})}function ns(){var s;const e=document.querySelectorAll(".pf-tab"),a=document.querySelectorAll(".pf-tab-panel");if(!e.length||!a.length)return;const t=i=>{e.forEach(l=>l.classList.toggle("active",l.dataset.tab===i)),a.forEach(l=>{l.hidden=l.dataset.tabPanel!==i})};e.forEach(i=>{i.addEventListener("click",()=>t(i.dataset.tab))}),(s=document.querySelector("#profileForm"))==null||s.addEventListener("invalid",i=>{const l=i.target.closest(".pf-tab-panel");l&&t(l.dataset.tabPanel)},!0);const n=document.querySelector("#profileForm");n==null||n.addEventListener("input",()=>{Z=!0}),n==null||n.addEventListener("change",()=>{Z=!0})}function ss(){const e=document.querySelector("#workHistoryCard");if(!e)return;let a=e.querySelectorAll(".work-entry").length;e.addEventListener("click",t=>{var s;const n=t.target.closest(".remove-work-entry");if(n){(s=n.closest(".work-entry"))==null||s.remove(),Z=!0;return}if(t.target.closest("#addWorkEntry")){const i=document.querySelector("#workEntries");if(!i)return;const l=document.createElement("div");l.innerHTML=Na(a++,{}),i.appendChild(l.firstElementChild),Z=!0}})}function is(){return[...document.querySelectorAll(".work-entry")].map(e=>{const a=t=>{var n,s;return((s=(n=e.querySelector(`[data-field="${t}"]`))==null?void 0:n.value)==null?void 0:s.trim())||""};return{title:a("title"),company:a("company"),from:a("from"),to:a("to")}}).filter(e=>e.title||e.company)}function os(){const e=document.querySelector("#langCard");if(!e)return;let a=e.querySelectorAll(".lang-entry").length;e.addEventListener("click",t=>{var s;const n=t.target.closest(".remove-lang-entry");if(n){(s=n.closest(".lang-entry"))==null||s.remove(),Z=!0;return}if(t.target.closest("#addLangEntry")){const i=document.querySelector("#langEntries");if(!i)return;const l=document.createElement("div");l.innerHTML=Ma(a++,{}),i.appendChild(l.firstElementChild),Z=!0}})}function rs(){return[...document.querySelectorAll(".lang-entry")].map(e=>{const a=t=>{var n,s;return((s=(n=e.querySelector(`[data-field="${t}"]`))==null?void 0:n.value)==null?void 0:s.trim())||""};return{name:a("name"),level:a("level")}}).filter(e=>e.name)}function ls(){const e=document.querySelector("#certCard");if(!e)return;let a=e.querySelectorAll(".cert-entry").length;e.addEventListener("click",t=>{var s;const n=t.target.closest(".remove-cert-entry");if(n){(s=n.closest(".cert-entry"))==null||s.remove(),Z=!0;return}if(t.target.closest("#addCertEntry")){const i=document.querySelector("#certEntries");if(!i)return;const l=document.createElement("div");l.innerHTML=qa(a++,{}),i.appendChild(l.firstElementChild),Z=!0}})}function cs(){return[...document.querySelectorAll(".cert-entry")].map(e=>{const a=t=>{var n,s;return((s=(n=e.querySelector(`[data-field="${t}"]`))==null?void 0:n.value)==null?void 0:s.trim())||""};return{name:a("name"),issuer:a("issuer"),date:a("date")}}).filter(e=>e.name)}function ds(){var n,s,i,l,o,d;const e=document.querySelector("#profileForm"),a=e==null?void 0:e.querySelector('input[name="profileCv"]');if(!e||!a)return;((n=e.querySelector('input[name="mode"]'))==null?void 0:n.value)==="onboarding"&&!((i=(s=r.candidate)==null?void 0:s.skills)!=null&&i.length)&&!((o=(l=r.candidate)==null?void 0:l.workHistory)!=null&&o.length)&&!((d=r.candidate)!=null&&d.name)?us(e,a):ps(a)}function us(e,a){var l;const t=document.querySelector("#profileCvCard");if(!t)return;const n=[...e.children].filter(o=>o!==t&&o.type!=="hidden"&&o.getAttribute("name")!=="mode");n.forEach(o=>{o.style.display="none"});const s=document.createElement("p");s.id="cvGatePrompt",s.style.cssText="font-size:13px;color:var(--mid);margin:10px 0 4px;text-align:center;",s.innerHTML=`Upload your CV and we'll fill in the rest for you — or <button type="button" id="skipCvParse" style="background:none;border:none;padding:0;font-size:13px;color:var(--green);cursor:pointer;text-decoration:underline;">skip and fill in manually</button>`,t.insertAdjacentElement("afterend",s);function i(){var o,d;(o=document.querySelector("#cvGatePrompt"))==null||o.remove(),(d=document.querySelector("#cvParseLoading"))==null||d.remove(),n.forEach(c=>{c.style.display=""})}(l=document.querySelector("#skipCvParse"))==null||l.addEventListener("click",i),a.addEventListener("change",async()=>{var p,u;const o=(p=a.files)==null?void 0:p[0];if(!o)return;(u=document.querySelector("#cvGatePrompt"))==null||u.remove();const d=document.createElement("p");d.id="cvParseLoading",d.style.cssText="font-size:13px;font-weight:600;color:var(--green);padding:14px 0;text-align:center;",d.textContent="Analysing your CV…",t.insertAdjacentElement("afterend",d),se=null,Me=!0;const c=await ka(o);i(),c&&(se=c,ms(c,!0),gs(c,a))})}function ps(e){e.addEventListener("change",async()=>{var o,d,c,p,u,v,w,L,k;const a=(o=e.files)==null?void 0:o[0];if(!a)return;se=null,Me=!1,aa=null,C({message:"⏳ Analysing your CV — this takes up to 30 seconds…"});const t=await ka(a);if(!t){C({message:"⚠️ Could not read your CV. Check the browser console for details, or try a different file."});return}se=t,Me=!0,aa=a;const n=r.candidate||{},s={...n,...t.name?{name:t.name}:{},...t.phone?{whatsapp:t.phone,phone:t.phone}:{},...t.summary?{summary:t.summary}:{},skills:(d=t.skills)!=null&&d.length?[...new Set(t.skills.map(Ee).filter(Boolean))]:n.skills||[],workHistory:(c=t.workHistory)!=null&&c.length?t.workHistory:n.workHistory||[],certifications:(p=t.certifications)!=null&&p.length?t.certifications:n.certifications||[],languages:(u=t.languages)!=null&&u.length?t.languages:n.languages||[]},i=[];t.name&&i.push("name"),t.phone&&i.push("phone"),t.summary&&i.push("summary"),(v=t.skills)!=null&&v.length&&i.push(`${t.skills.length} skill${t.skills.length!==1?"s":""}`),(w=t.workHistory)!=null&&w.length&&i.push(`${t.workHistory.length} role${t.workHistory.length!==1?"s":""}`),(L=t.certifications)!=null&&L.length&&i.push(`${t.certifications.length} cert${t.certifications.length!==1?"s":""}`),(k=t.languages)!=null&&k.length&&i.push("languages");const l=i.length?`✓ Pre-filled from CV: ${i.join(", ")}. Review and save your profile.`:"✓ CV analysed. Review your profile and save.";C({candidate:s,message:l})})}function ms(e,a){var n,s,i,l,o;const t=(d,c)=>{const p=document.querySelector(d);p&&c&&a&&(p.value=c)};if(t('input[name="name"]',e.name),t('input[name="whatsapp"]',e.phone),t('textarea[name="summary"]',e.summary),(n=e.skills)!=null&&n.length){const d=document.querySelector("#selectedSkills");if(d){d.innerHTML="";const c=new Set([...d.querySelectorAll('input[name="skills"]')].map(u=>u.value.toLowerCase()));(s=d.querySelector(".skill-empty"))==null||s.remove(),[...new Set(e.skills.map(Ee).filter(Boolean))].forEach(u=>{if(c.has(u.toLowerCase()))return;c.add(u.toLowerCase());const v=document.createElement("span");v.className="selected-skill",v.setAttribute("data-skill-chip",u),v.innerHTML=`${E(u)}<button type="button" class="skill-remove" data-remove-skill="${h(u)}" aria-label="Remove ${h(u)}">×</button><input type="hidden" name="skills" value="${h(u)}" />`,d.appendChild(v)})}}if((i=e.workHistory)!=null&&i.length){const d=document.querySelector("#workEntries");if(d){d.innerHTML="";let c=d.querySelectorAll(".work-entry").length;e.workHistory.forEach(p=>{const u=document.createElement("div");u.innerHTML=Na(c++,p),d.appendChild(u.firstElementChild)})}}if((l=e.languages)!=null&&l.length){const d=document.querySelector("#langEntries");if(d){d.innerHTML="";let c=d.querySelectorAll(".lang-entry").length;e.languages.forEach(p=>{const u=document.createElement("div");u.innerHTML=Ma(c++,p),d.appendChild(u.firstElementChild)})}}if((o=e.certifications)!=null&&o.length){const d=document.querySelector("#certEntries");if(d){d.innerHTML="";let c=d.querySelectorAll(".cert-entry").length;e.certifications.forEach(p=>{const u=document.createElement("div");u.innerHTML=qa(c++,p),d.appendChild(u.firstElementChild)})}}De()}function gs(e,a){var s,i,l,o,d;const t=[];e.name&&t.push("name"),e.phone&&t.push("phone"),(s=e.skills)!=null&&s.length&&t.push(`${e.skills.length} skill${e.skills.length>1?"s":""}`),(i=e.workHistory)!=null&&i.length&&t.push(`${e.workHistory.length} role${e.workHistory.length>1?"s":""}`),(l=e.certifications)!=null&&l.length&&t.push(`${e.certifications.length} cert${e.certifications.length>1?"s":""}`),(o=e.languages)!=null&&o.length&&t.push("languages"),(d=document.querySelector("#cvParseHint"))==null||d.remove();const n=document.createElement("p");n.id="cvParseHint",n.style.cssText="font-size:12px;color:var(--green);margin:4px 0 0;",n.innerHTML=t.length?`✓ Pre-filled: <strong>${t.join(", ")}</strong>. Review and save.`:"✓ CV analysed. Review your profile and save.",a.insertAdjacentElement("afterend",n)}function wt(){var d;const e=document.querySelector("[data-skill-search]");if(!e)return;const a=e.querySelector("#skillSearchInput"),t=e.querySelector("#skillSuggestions"),n=e.querySelector("#selectedSkills"),s=()=>[...n.querySelectorAll('input[name="skills"]')].map(c=>c.value),i=c=>{n.innerHTML=c.length?c.map(p=>`
      <span class="selected-skill" data-skill-chip="${h(p)}">
        ${E(p)}
        <button type="button" class="skill-remove" data-remove-skill="${h(p)}" aria-label="Remove ${h(p)}">×</button>
        <input type="hidden" name="skills" value="${h(p)}" />
      </span>`).join(""):'<span class="skill-empty">Selected skills will appear here.</span>'},l=()=>{const c=K(a.value),p=a.value.trim(),u=new Set(s().map(K)),v=at.filter(A=>!u.has(K(A))).filter(A=>!c||K(A).includes(c)).slice(0,12),w=v.find(A=>K(A)===c),k=p.length>1&&!u.has(K(p))&&!w?`<button type="button" class="skill-suggestion add-custom" data-skill="${h(p)}">+ Add "${E(p)}"</button>`:"";t.innerHTML=k+v.map(A=>`<button type="button" class="skill-suggestion" data-skill="${h(A)}">${E(A)}</button>`).join("")},o=c=>{const p=(c||a.value).trim(),u=Ee(p);if(!u)return;const v=K(u),w=s();if(w.length>=20&&!w.some(k=>K(k)===v)){a.value="";return}const L=[...w.filter(k=>K(k)!==v),u];i(L),a.value="",l(),Z=!0};a==null||a.addEventListener("input",l),a==null||a.addEventListener("focus",l),a==null||a.addEventListener("keydown",c=>{if(c.key!=="Enter")return;c.preventDefault();const p=K(a.value),u=[...t.querySelectorAll(".skill-suggestion:not(.add-custom)")].find(v=>K(v.dataset.skill)===p);o((u==null?void 0:u.dataset.skill)||a.value)}),(d=e.querySelector("#addTypedSkill"))==null||d.addEventListener("click",()=>o(a.value)),t.addEventListener("click",c=>{const p=c.target.closest("[data-skill]");p&&o(p.dataset.skill)}),n.addEventListener("click",c=>{const p=c.target.closest("[data-remove-skill]");if(!p)return;const u=K(p.dataset.removeSkill);i(s().filter(v=>K(v)!==u)),l(),Z=!0})}function bt(){if(r.loading)return es();if(r.view==="reset-password")return un();if(r.view==="dashboard")return vt();gt()}window.addEventListener("popstate",()=>{if(window.location.pathname==="/reset-password"){C({view:"reset-password",resetCodeStatus:null,resetCodeError:""});return}const e=ta();e==="overview"&&!r.user?C({view:"login",activePage:"overview",message:""}):r.view==="dashboard"?je(e,!1):ze()});const sa=new URLSearchParams(window.location.search).get("ct");sa&&window.history.replaceState({},"",window.location.pathname);let Xe=!!sa;be?(At(U,e=>{if(!Xe)if(e)za(e);else{try{localStorage.removeItem("nw_talent_applied")}catch{}ze()}}),window.setTimeout(()=>{r.loading&&(Xe=!1,ze())},2500),sa&&Zt(sa).then(e=>{Xe=!1,za(e.user)}).catch(()=>{Xe=!1,ze()})):ze();
