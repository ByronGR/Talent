import{initializeApp as Nt}from"https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";import{getAuth as Mt,signInWithCustomToken as _t,onAuthStateChanged as qt,createUserWithEmailAndPassword as It,updateProfile as Dt,signInWithEmailAndPassword as Ut,signOut as ga}from"https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";import{getFirestore as Bt,query as ge,collection as re,where as ve,limit as fe,getDocs as we,getDoc as Me,doc as R,setDoc as ae,serverTimestamp as O,onSnapshot as Rt,updateDoc as Ft,addDoc as Va,arrayUnion as wa}from"https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";import{getStorage as Ot,ref as Sa,uploadBytes as et,getDownloadURL as at,deleteObject as jt}from"https://www.gstatic.com/firebasejs/10.12.5/firebase-storage.js";(function(){const a=document.createElement("link").relList;if(a&&a.supports&&a.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))n(s);new MutationObserver(s=>{for(const i of s)if(i.type==="childList")for(const c of i.addedNodes)c.tagName==="LINK"&&c.rel==="modulepreload"&&n(c)}).observe(document,{childList:!0,subtree:!0});function t(s){const i={};return s.integrity&&(i.integrity=s.integrity),s.referrerPolicy&&(i.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?i.credentials="include":s.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function n(s){if(s.ep)return;s.ep=!0;const i=t(s);fetch(s.href,i)}})();const tt={apiKey:"AIzaSyApRNyW8PoP28E0x77dUB5jOgHuTqA2by4",authDomain:"nearwork-97e3c.firebaseapp.com",projectId:"nearwork-97e3c",storageBucket:"nearwork-97e3c.firebasestorage.app",messagingSenderId:"145642656516",appId:"1:145642656516:web:0ac2da8931283121e87651",measurementId:"G-3LC8N6FFSH"},he=Object.values(tt).slice(0,6).every(Boolean),Ne=he?Nt(tt):null,B=Ne?Mt(Ne):null,_=Ne?Bt(Ne):null,oa=Ne?Ot(Ne):null,q={users:"users",candidates:"candidates",openings:"openings",pipelines:"pipelines",applications:"applications",assessments:"assessments",activity:"candidateActivity",notifications:"notifications",notificationPreferences:"notificationPreferences"},nt="/api/send-email-proxy";function Q(){if(!Ne||!B||!_||!oa)throw new Error("Missing Firebase environment variables. Copy .env.example to .env.local and fill in the Admin app config.")}async function zt(e={}){var i,c;const a=String(e.email||((i=B==null?void 0:B.currentUser)==null?void 0:i.email)||"").trim().toLowerCase();if(!a)return{ok:!1,skipped:!0,reason:"Missing candidate email"};const t=e.name||((c=B==null?void 0:B.currentUser)==null?void 0:c.displayName)||"",n=e.firstName||t.split(/\s+/)[0]||"there",s=await fetch(nt,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({to:a,templateId:"account_created",data:{name:t||n,firstName:n,actionUrl:"https://talent.nearwork.co"}})});return s.json().catch(()=>({ok:s.ok}))}async function Ht(e={},a={}){var c,r;const t=String((e==null?void 0:e.email)||((c=B==null?void 0:B.currentUser)==null?void 0:c.email)||"").trim().toLowerCase();if(!t)return{ok:!1,skipped:!0,reason:"Missing candidate email"};const n=(e==null?void 0:e.name)||((r=B==null?void 0:B.currentUser)==null?void 0:r.displayName)||"",s=(e==null?void 0:e.firstName)||n.split(/\s+/)[0]||"there",i=await fetch(nt,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({to:t,templateId:"job_applied",data:{name:n||s,firstName:s,roleTitle:a.title||a.role||a.openingTitle||"this role",openingCode:a.code||a.id||"",actionUrl:"https://talent.nearwork.co"}})});return i.json().catch(()=>({ok:i.ok}))}async function st(e){Q();const a=await Me(R(_,q.users,e));return a.exists()?{id:a.id,...a.data()}:null}async function Vt(e){Q();const a=String(e||"").trim(),t=a.toLowerCase(),n=ge(re(_,q.users),ve("email","==",t),fe(1)),s=await we(n);if(!s.empty)return{id:s.docs[0].id,...s.docs[0].data()};if(a===t)return null;const i=ge(re(_,q.users),ve("email","==",a),fe(1)),c=await we(i);return c.empty?null:{id:c.docs[0].id,...c.docs[0].data()}}async function Gt(e){const a=await st(e.uid);if(a)return a;const t=await Vt(e.email);return t?(await ot(e.uid,{...t,email:e.email,connectedFromUserId:t.id}),{...t,id:e.uid,connectedFromUserId:t.id}):null}async function it(e,a,t){const n=await Me(R(_,q.candidates,a)).catch(()=>null),s=n!=null&&n.exists()?n.data():{};return rt(e,{...s,...t,candidateCode:a})}async function ot(e,a){Q();const t=a.candidateCode||Ze(e),n={...a,candidateCode:t,role:"candidate",updatedAt:O()};await ae(R(_,q.users,e),n,{merge:!0}),await ae(R(_,q.candidates,t),await it(e,t,{...n,candidateCode:t}),{merge:!0}).catch(()=>null)}function Ze(e){return`CAND-${String(e||"").replace(/[^a-z0-9]/gi,"").slice(0,8).toUpperCase()||Date.now()}`}function Qt(e){return String(e||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"")}function Ga(e){const a=String(e||"").trim();return a.includes("@")?"":a}function rt(e,a){const t=a.candidateCode||Ze(e),n=a.location||[a.locationCity||a.city,a.locationDepartment||a.department].filter(Boolean).join(", "),s=Ga(n),i=Ga(a.locationCity||a.city||s),c=new Date().toISOString().slice(0,10);return{code:t,uid:e,ownerUid:e,name:a.name||"Talent member",role:a.targetRole||a.headline||"Nearwork candidate",skills:Array.isArray(a.skills)?a.skills:[],applied:a.applied||c,lastContact:a.lastContact||c,experience:Number(a.experience||0),location:s,city:Qt(i),department:a.locationDepartment||a.department||"",country:a.locationCountry||"Colombia",source:"talent.nearwork.co",status:a.status||"active",score:Number(a.score||50),email:a.email||"",phone:a.whatsapp||a.phone||"",whatsapp:a.whatsapp||a.phone||"",currentRole:a.currentRole||"",salary:a.salary||"",salaryUSD:Number(a.salaryUSD||0)||null,salaryAmount:Number(a.salaryAmount||a.expectedSalaryAmount||0)||null,salaryCurrency:a.salaryCurrency||a.expectedSalaryCurrency||"USD",expectedSalaryUSD:Number(a.expectedSalaryUSD||0)||null,expectedSalaryCOP:Number(a.expectedSalaryCOP||0)||null,expectedSalaryAmount:Number(a.expectedSalaryAmount||a.salaryAmount||0)||null,expectedSalaryCurrency:a.expectedSalaryCurrency||a.salaryCurrency||"USD",expectedSalary:a.expectedSalary||a.salary||"",availability:a.availability||"open",english:a.english||"",visa:a.visa||"No",linkedin:a.linkedin||"",cv:a.activeCvName||"",cvUrl:a.cvUrl||null,photoUrl:a.photoURL||a.photoUrl||null,tags:a.tags||["talent profile"],notes:a.summary||"",summary:a.summary||"",workHistory:Array.isArray(a.workHistory)?a.workHistory:[],languages:Array.isArray(a.languages)?a.languages:[],certifications:Array.isArray(a.certifications)?a.certifications:[],appliedBefore:!!a.appliedBefore,applications:a.applications||[],pipelineCodes:a.pipelineCodes||[],loom:a.loom||"Not uploaded",assessments:a.assessments||[],work:a.work||[],updatedAt:O()}}async function Wt(e){Q();const a=ge(re(_,q.applications),ve("candidateId","==",e),fe(20)),t=ge(re(_,q.applications),ve("ownerUid","==",e),fe(20)),n=await Promise.allSettled([we(a),we(t)]),s=new Map;return n.forEach(i=>{i.status==="fulfilled"&&i.value.docs.forEach(c=>s.set(c.id,{id:c.id,...c.data()}))}),Array.from(s.values()).sort((i,c)=>{const r=d=>{var u,m;return((m=(u=d==null?void 0:d.toDate)==null?void 0:u.call(d))==null?void 0:m.getTime())??(d?new Date(d).getTime():0)};return r(c.updatedAt||c.createdAt)-r(i.updatedAt||i.createdAt)})}async function Jt(e,a="",t=""){Q();const n=String(a||"").trim().toLowerCase(),s=String(t||"").trim(),i=[we(ge(re(_,q.assessments),ve("candidateUid","==",e),fe(25))),we(ge(re(_,q.assessments),ve("candidateId","==",e),fe(25)))];n&&i.push(we(ge(re(_,q.assessments),ve("candidateEmail","==",n),fe(25)))),s&&i.push(we(ge(re(_,q.assessments),ve("candidateCode","==",s),fe(25))));const c=await Promise.allSettled(i),r=new Map;return c.forEach(d=>{d.status==="fulfilled"&&d.value.docs.forEach(u=>r.set(u.id,{id:u.id,...u.data()}))}),Array.from(r.values()).sort((d,u)=>{const m=l=>{var p,h;return((h=(p=l==null?void 0:l.toDate)==null?void 0:p.call(l))==null?void 0:h.getTime())??(l?new Date(l).getTime():0)};return m(u.updatedAt||u.createdAt||u.sentAt)-m(d.updatedAt||d.createdAt||d.sentAt)})}async function Yt(e,a,t="",n=""){Q();const s=await Me(R(_,q.assessments,e));if(!s.exists())return null;const i={id:s.id,...s.data()},c=String(t||"").trim().toLowerCase(),r=String(n||"").trim();return i.candidateUid===a||i.candidateId===a||String(i.candidateEmail||"").trim().toLowerCase()===c||String(i.candidateCode||"").trim()===r?i:null}async function Zt(e,a){Q();const t=await Me(R(_,q.assessments,e)),n=t.exists()?t.data():{};if(n.status==="completed")throw new Error("This assessment is already completed.");if(n.expiresAt&&Date.now()>new Date(n.expiresAt).getTime())throw new Error("This assessment link has expired.");await ae(R(_,q.assessments,e),{status:"started",currentQuestionIndex:Number(n.currentQuestionIndex||0),currentStage:Number(n.currentStage||1),technicalStartedAt:n.technicalStartedAt||O(),startedAt:n.startedAt||O(),updatedAt:O()},{merge:!0})}async function He(e,a,t,n={}){Q();const s=await Me(R(_,q.assessments,e)),i=s.exists()?s.data():{};if(i.status==="completed")throw new Error("This assessment is already completed.");if(i.expiresAt&&Date.now()>new Date(i.expiresAt).getTime())throw new Error("This assessment link has expired.");await ae(R(_,q.assessments,e),{[`answers.${a}`]:t,progress:`${n.currentQuestionIndex||0}/${n.totalQuestions||""}`.replace(/\/$/,""),currentQuestionIndex:n.currentQuestionIndex||0,currentStage:n.currentStage||1,...n.discStartedAt?{discStartedAt:n.discStartedAt}:{},updatedAt:O()},{merge:!0})}async function Kt(e,a,t={}){var p;Q();const n=R(_,q.assessments,e),s=await Me(n),i=s.exists()?s.data():{};if(i.status==="completed")throw new Error("This assessment is already completed.");if(i.expiresAt&&Date.now()>new Date(i.expiresAt).getTime())throw new Error("This assessment link has expired.");const c=Object.values(a||{}).filter(h=>String((h==null?void 0:h.value)??h??"").trim()).length,r=Number(t.totalQuestions||Object.keys(a||{}).length||0),d=Number(t.technicalScore||0),u=Number(t.discScore||0),m=Number(t.score||(r?Math.round(c/r*100):0));await ae(n,{answers:a,answeredCount:c,totalQuestions:r,score:m,technical:d||m,disc:((p=t.discProfile)==null?void 0:p.label)||(u?`${u}%`:"Submitted"),discScore:u,discProfile:t.discProfile||null,progress:`${c}/${r}`,status:"completed",finished:new Date().toLocaleString("en-US",{month:"short",day:"numeric",year:"numeric",hour:"numeric",minute:"2-digit"}),finishedAt:O(),updatedAt:O()},{merge:!0});const l=Math.round(m);i.candidateUid&&await ae(R(_,q.users,i.candidateUid),{score:l,nwScore:l,lastAssessmentScore:l,lastAssessmentId:e,updatedAt:O()},{merge:!0}).catch(()=>null),i.candidateCode&&await ae(R(_,q.candidates,i.candidateCode),{score:l,nwScore:l,lastAssessmentScore:l,lastAssessmentId:e,updatedAt:O()},{merge:!0}).catch(()=>null)}async function lt(){Q();const e=ge(re(_,q.openings),ve("published","==",!0),fe(12));return(await we(e)).docs.map(t=>({id:t.id,...t.data()}))}async function Xt(e,a){Q();const t=a.code||a.id,n=await st(e).catch(()=>null),s=(n==null?void 0:n.candidateCode)||Ze(e),i=new Date().toISOString().slice(0,10),c={opening:t,openingCode:t,jobId:t,role:a.title||a.role||"Untitled role",openingTitle:a.title||a.role||"Untitled role",applied:i,appliedAt:i,status:"applied",outcome:"Application only",source:"talent.nearwork.co"},r={candidateId:e,ownerUid:e,authUid:e,candidateDocId:s,candidateCode:s,candidateEmail:(n==null?void 0:n.email)||"",candidateName:(n==null?void 0:n.name)||"",openingCode:t,jobId:t,openingTitle:a.title||a.role||"Untitled role",jobTitle:a.title||a.role||"Untitled role",title:a.title||a.role||"Untitled role",clientName:a.orgName||a.clientName||a.company||"Nearwork client",status:"applied",inPipeline:!1,isMockData:!1,source:"talent.nearwork.co",createdAt:O(),updatedAt:O()};await Va(re(_,q.applications),r),await ae(R(_,q.candidates,s),{...rt(e,{...n||{},candidateCode:s,appliedBefore:!0,lastContact:i}),applications:wa(c),appliedBefore:!0},{merge:!0}).catch(()=>null),await ae(R(_,q.users,e),{role:"candidate",candidateCode:s,code:s,applications:wa(c),lastAppliedOpeningCode:t,lastAppliedAt:O(),updatedAt:O()},{merge:!0}).catch(()=>null),await Va(re(_,q.activity),{candidateId:e,type:"application_submitted",title:r.jobTitle,createdAt:O()}).catch(()=>null),Ht(n,a).catch(()=>null)}async function en(e,a){await Ft(R(_,q.users,e),{availability:a,updatedAt:O()})}async function Ke(e,a){Q();const t=a.candidateCode||Ze(e);await ae(R(_,q.users,e),{...a,candidateCode:t,role:"candidate",updatedAt:O()},{merge:!0});try{return await ae(R(_,q.candidates,t),await it(e,t,{...a,candidateCode:t}),{merge:!0}),{candidateCode:t,atsSynced:!0}}catch(n){return console.warn("Candidate ATS sync failed.",n),{candidateCode:t,atsSynced:!1}}}async function an(){var n;Q();const e=await((n=B.currentUser)==null?void 0:n.getIdToken());if(!e)throw new Error("You must be signed in to delete your account.");const a=await fetch("/api/delete-account",{method:"POST",headers:{Authorization:`Bearer ${e}`}}),t=await a.json().catch(()=>({}));if(!a.ok||!t.ok)throw new Error(t.error||"Failed to delete account.");return t}async function tn(e){const a=await fetch("/api/send-reset",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:e,continueUrl:`${window.location.origin}/reset-password`})}),t=await a.json().catch(()=>({}));if(!a.ok||!t.ok)throw new Error(t.error||"Failed to send the reset email.");return t}async function nn(e,a){Q();const t=a.name.replace(/[^a-z0-9._-]/gi,"-").toLowerCase(),n=`candidate-photos/${e}/${Date.now()}-${t}`,s=Sa(oa,n);await et(s,a,{contentType:a.type||"application/octet-stream"});const i=await at(s);return await ae(R(_,q.users,e),{photoURL:i,updatedAt:O()},{merge:!0}),i}async function Ca(e,a,t){Q();let n=null,s=Ze(e);try{const m=await Me(R(_,q.users,e));if(m.exists()){const l=m.data();n=l.activeCvId||null,l.candidateCode&&(s=l.candidateCode)}}catch{}const i=a.name.replace(/[^a-z0-9._-]/gi,"-").toLowerCase(),c=`candidate-cvs/${e}/${Date.now()}-${i}`,r=Sa(oa,c);await et(r,a,{contentType:a.type||"application/octet-stream"});const d=await at(r),u={id:c,name:t||a.name,fileName:a.name,url:d,uploadedAt:new Date().toISOString()};return await ae(R(_,q.users,e),{cvLibrary:wa(u),activeCvId:u.id,activeCvName:u.name||u.fileName,cvUrl:d,updatedAt:O()},{merge:!0}),ae(R(_,q.candidates,s),{cvUrl:d,activeCvId:u.id,activeCvName:u.name||u.fileName,updatedAt:O()},{merge:!0}).catch(()=>null),n&&n!==c&&jt(Sa(oa,n)).catch(()=>{}),u}function sn(e,a){if(Q(),!e)return()=>{};const t=ge(re(_,q.notifications),ve("recipientUid","==",e),fe(50));return Rt(t,n=>{const s=n.docs.map(i=>({id:i.id,...i.data()})).sort((i,c)=>{var u,m;const r=(u=i.createdAt)!=null&&u.toDate?i.createdAt.toDate().getTime():new Date(i.createdAt||0).getTime();return((m=c.createdAt)!=null&&m.toDate?c.createdAt.toDate().getTime():new Date(c.createdAt||0).getTime())-r});a(s)})}async function on(e){Q(),e&&await ae(R(_,q.notifications,e),{read:!0,readAt:O()},{merge:!0})}async function rn(e,a){Q(),await ae(R(_,q.notificationPreferences,e),{uid:e,app:"talent.nearwork.co",preferences:a,updatedAt:O()},{merge:!0})}async function La(e){var a;if(!e)return null;try{const t=await new Promise((x,P)=>{const N=new FileReader;N.onload=()=>x(N.result.split(",")[1]),N.onerror=P,N.readAsDataURL(e)}),n=await((a=B.currentUser)==null?void 0:a.getIdToken().catch(()=>""))??"",s=await fetch("/api/parse-cv",{method:"POST",headers:{"Content-Type":"application/json",...n?{Authorization:`Bearer ${n}`}:{}},body:JSON.stringify({data:t,filename:e.name,mimeType:e.type||"application/octet-stream"})});if(!s.ok)return null;const i=await s.json();if(!(i!=null&&i.ok))return null;const{name:c,phone:r,city:d,summary:u,skills:m,workHistory:l,languages:p,certifications:h}=i;return{name:c,phone:r,city:d,summary:u,skills:m,workHistory:l,languages:p||[],certifications:h||[]}}catch{return null}}async function ln(e){return _t(B,e)}let oe=null,De=!1,ra=null,ue=0,$={},We=null,Qe=!1,Se="idle",ye=0,ia=null,be=null,$a=!1,K=!1,de=null;const Xe=document.querySelector("#app"),cn="+573135928691",dn="https://wa.me/573135928691",Je={"Customer Success":["Customer Success Manager","Customer Success Associate","Account Manager","Technical Account Manager","Client Success Specialist","Implementation Specialist","Onboarding Specialist","Renewals Manager"],Sales:["SDR / Sales Development Rep","BDR / Business Development Rep","Account Executive","Inside Sales Representative","Channel Sales Manager","Sales Operations Specialist","Revenue Operations Specialist","Sales Manager"],Support:["Technical Support Specialist","Customer Support Representative","Help Desk Technician","Escalations Specialist","Support Team Lead","QA Support Analyst"],Operations:["Operations Manager","Operations Analyst","Executive Assistant","Administrative Assistant","Virtual Assistant","Office Manager","Project Coordinator","Procurement Specialist","Logistics Coordinator","Recruiting Coordinator"],Marketing:["Marketing Ops / Content Specialist","Content Writer","SEO Specialist","Email Marketing Specialist","Lifecycle Marketing Specialist","Social Media Manager","Graphic Designer","Growth Marketing Specialist"],Engineering:["Software Developer (Full Stack)","Frontend Developer","Backend Developer","Mobile Developer","DevOps Engineer","No-Code Developer","Data Analyst","Data Engineer","QA Engineer","Product Manager"],Finance:["Bookkeeper","Accounting Assistant","Accounts Payable / Receivable Specialist","Financial Analyst","FP&A Analyst","Payroll Specialist","Tax Analyst"],"Human Resources":["HR Generalist","Recruiter / Talent Sourcer","People Operations Specialist","Payroll & Benefits Coordinator","Learning & Development Coordinator"],"Healthcare & Insurance":["Insurance Account Manager","Claims Specialist","Medical Billing Specialist","Healthcare Virtual Assistant","Patient Coordinator"],Other:["Other / Not Listed"]},un={"CRM & Sales":["HubSpot","Salesforce","Pipedrive","Apollo","Outbound","Cold Email","Discovery Calls","CRM Hygiene"],"Customer Success":["SaaS","Customer Success","QBRs","Onboarding","Renewals","Expansion","Churn Reduction","Intercom","Zendesk"],Support:["Technical Support","Tickets","Troubleshooting","APIs","Bug Reproduction","Help Center","CSAT"],Operations:["Excel","Google Sheets","Reporting","Process Design","Project Management","Notion","Airtable","Zapier"],Marketing:["Content","SEO","Lifecycle","Email Marketing","HubSpot Marketing","Copywriting","Analytics"],Engineering:["JavaScript","React","Node.js","SQL","Python","REST APIs","QA","GitHub"],Language:["English B2","English C1","English C2","Spanish Native"]},pn=["Account Management","Accounts Payable","Accounts Receivable","Adobe Creative Suite","Agile","AI Tools","Analytics","Appointment Setting","B2B Sales","B2C Sales","Billing","Bookkeeping","Business Analysis","Canva","Cash Collections","Chat Support","Cold Calling","Community Management","Compliance","Content Strategy","Contract Management","Customer Onboarding","Customer Retention","Customer Service","Data Analysis","Data Entry","Email Support","Excel / Google Sheets","Executive Assistance","Figma","Financial Reporting","Forecasting","Helpdesk","HR Operations","Inbound Calls","Insurance Support","Lead Generation","Live Chat","Logistics","Looker","Microsoft Office","NetSuite","Outbound Calls","Payroll","Performance Marketing","Power BI","Product Support","QuickBooks","Recruiting","Salesforce Administration","Sales Operations","Shopify","Slack","Social Media","SQL Reporting","Stripe","Tableau","Technical Writing","Ticket Quality","Training","Vendor Management","WordPress","Workday","Workforce Management","Zendesk Guide","Zoho"],ct=[...new Set([...Object.values(un).flat(),...pn])].sort((e,a)=>e.localeCompare(a)),mn=["Colombia","Afghanistan","Albania","Algeria","Andorra","Angola","Antigua and Barbuda","Argentina","Armenia","Australia","Austria","Azerbaijan","Bahamas","Bahrain","Bangladesh","Barbados","Belarus","Belgium","Belize","Benin","Bhutan","Bolivia","Bosnia and Herzegovina","Botswana","Brazil","Brunei","Bulgaria","Burkina Faso","Burundi","Cambodia","Cameroon","Canada","Cape Verde","Central African Republic","Chad","Chile","China","Comoros","Congo (Brazzaville)","Congo (Kinshasa)","Costa Rica","Côte d'Ivoire","Croatia","Cuba","Cyprus","Czechia","Denmark","Djibouti","Dominica","Dominican Republic","Ecuador","Egypt","El Salvador","Equatorial Guinea","Eritrea","Estonia","Eswatini","Ethiopia","Fiji","Finland","France","Gabon","Gambia","Georgia","Germany","Ghana","Greece","Grenada","Guatemala","Guinea","Guinea-Bissau","Guyana","Haiti","Honduras","Hungary","Iceland","India","Indonesia","Iran","Iraq","Ireland","Israel","Italy","Jamaica","Japan","Jordan","Kazakhstan","Kenya","Kiribati","Kosovo","Kuwait","Kyrgyzstan","Laos","Latvia","Lebanon","Lesotho","Liberia","Libya","Liechtenstein","Lithuania","Luxembourg","Madagascar","Malawi","Malaysia","Maldives","Mali","Malta","Marshall Islands","Mauritania","Mauritius","Mexico","Micronesia","Moldova","Monaco","Mongolia","Montenegro","Morocco","Mozambique","Myanmar","Namibia","Nauru","Nepal","Netherlands","New Zealand","Nicaragua","Niger","Nigeria","North Korea","North Macedonia","Norway","Oman","Pakistan","Palau","Palestine","Panama","Papua New Guinea","Paraguay","Peru","Philippines","Poland","Portugal","Qatar","Romania","Russia","Rwanda","Saint Kitts and Nevis","Saint Lucia","Saint Vincent and the Grenadines","Samoa","San Marino","Sao Tome and Principe","Saudi Arabia","Senegal","Serbia","Seychelles","Sierra Leone","Singapore","Slovakia","Slovenia","Solomon Islands","Somalia","South Africa","South Korea","South Sudan","Spain","Sri Lanka","Sudan","Suriname","Sweden","Switzerland","Syria","Taiwan","Tajikistan","Tanzania","Thailand","Timor-Leste","Togo","Tonga","Trinidad and Tobago","Tunisia","Turkey","Turkmenistan","Tuvalu","Uganda","Ukraine","United Arab Emirates","United Kingdom","United States","Uruguay","Uzbekistan","Vanuatu","Vatican City","Venezuela","Vietnam","Yemen","Zambia","Zimbabwe"],Ye={Amazonas:["El Encanto","La Chorrera","La Pedrera","La Victoria","Leticia","Miriti - Paraná","Puerto Alegría","Puerto Arica","Puerto Nariño","Puerto Santander","Tarapacá"],Antioquia:["Abejorral","Abriaquí","Alejandría","Amagá","Amalfi","Andes","Angelópolis","Angostura","Anorí","Anza","Apartadó","Arboletes","Argelia","Armenia","Barbosa","Bello","Belmira","Betania","Betulia","Briceño","Buriticá","Cáceres","Caicedo","Caldas","Campamento","Cañasgordas","Caracolí","Caramanta","Carepa","Carmen de Viboral","Carolina","Caucasia","Chigorodó","Cisneros","Ciudad Bolívar","Cocorná","Concepción","Concordia","Copacabana","Dabeiba","Don Matías","Ebéjico","El Bagre","Entrerríos","Envigado","Fredonia","Frontino","Giraldo","Girardota","Gómez Plata","Granada","Guadalupe","Guarne","Guatapé","Heliconia","Hispania","Itagüí","Ituango","Jardín","Jericó","La Ceja","La Estrella","La Pintada","La Unión","Liborina","Maceo","Marinilla","Medellín","Montebello","Murindó","Mutata","Nariño","Nechí","Necoclí","Olaya","Peñol","Peque","Pueblorrico","Puerto Berrío","Puerto Nare","Puerto Triunfo","Remedios","Retiro","Rionegro","Sabanalarga","Sabaneta","Salgar","San Andrés","San Carlos","San Francisco","San Jerónimo","San José de la Montaña","San Juan de Urabá","San Luis","San Pedro","San Pedro de Urabá","San Rafael","San Roque","San Vicente","Santa Bárbara","Santa Rosa de Osos","Santafé de Antioquia","Santo Domingo","Santuario","Segovia","Sonsón","Sopetrán","Támesis","Tarazá","Tarso","Titiribí","Toledo","Turbo","Uramita","Urrao","Valdivia","Valparaíso","Vegachí","Venecia","Vigía del Fuerte","Yalí","Yarumal","Yolombó","Yondó","Zaragoza"],Arauca:["Arauca","Arauquita","Cravo Norte","Fortul","Puerto Rondón","Saravena","Tame"],Atlántico:["Baranoa","Barranquilla","Campo de la Cruz","Candelaria","Galapa","Juan de Acosta","Luruaco","Malambo","Manatí","Palmar de Varela","Piojó","Polonuevo","Ponedera","Puerto Colombia","Repelón","Sabanagrande","Sabanalarga","Santa Lucía","Santo Tomás","Soledad","Suan","Tubara","Usiacurí"],"Bogotá D.C.":["Bogotá"],Bolívar:["Achí","Altos del Rosario","Arenal","Arjona","Arroyohondo","Barranco de Loba","Calamar","Cantagallo","Carmen de Bolívar","Cartagena","Cicuco","Clemencia","Córdoba","El Guamo","El Peñón","Hatillo de Loba","Magangué","Mahates","Margarita","María la Baja","Mompós","Montecristo","Morales","Pinillos","Regidor","Río Viejo","San Cristóbal","San Estanislao","San Fernando","San Jacinto","San Jacinto del Cauca","San Juan Nepomuceno","San Martín de Loba","San Pablo","Santa Catalina","Santa Rosa de Lima","Santa Rosa del Sur","Simití","Soplaviento","Talaigua Nuevo","Tiquisio","Turbaco","Turbana","Villanueva","Zambrano"],Boyacá:["Almeida","Aquitania","Arcabuco","Belén","Berbeo","Betéitiva","Boavita","Boyacá","Briceño","Buenavista","Busbanzá","Caldas","Campohermoso","Cerinza","Chinavita","Chiquinquirá","Chíquiza","Chiscas","Chita","Chitaraque","Chivatá","Chivor","Ciénega","Cómbita","Coper","Corrales","Covarachía","Cubará","Cucaita","Cuítiva","Duitama","El Cocuy","El Espino","Firavitoba","Floresta","Gachantivá","Gameza","Garagoa","Guacamayas","Guateque","Guayatá","Güicán","Iza","Jenesano","Jericó","La Capilla","La Uvita","La Victoria","Labranzagrande","Macanal","Maripí","Miraflores","Mongua","Monguí","Moniquirá","Motavita","Muzo","Nobsa","Nuevo Colón","Oicatá","Otanche","Pachavita","Páez","Paipa","Pajarito","Panqueba","Pauna","Paya","Paz de Río","Pesca","Pisba","Puerto Boyacá","Quípama","Ramiriquí","Ráquira","Rondón","Saboyá","Sáchica","Samacá","San Eduardo","San José de Pare","San Luis de Gaceno","San Mateo","San Miguel de Sema","San Pablo Borbur","Santa María","Santa Rosa de Viterbo","Santa Sofía","Santana","Sativanorte","Sativasur","Siachoque","Soatá","Socha","Socotá","Sogamoso","Somondoco","Sora","Soracá","Sotaquirá","Susacón","Sutamarchán","Sutatenza","Tasco","Tenza","Tibaná","Tibasosa","Tinjacá","Tipacoque","Toca","Togüí","Tópaga","Tota","Tunja","Tununguá","Turmequé","Tuta","Tutazá","Umbita","Ventaquemada","Villa de Leyva","Viracachá","Zetaquira"],Caldas:["Aguadas","Anserma","Aranzazu","Belalcázar","Chinchiná","Filadelfia","La Dorada","La Merced","Manizales","Manzanares","Marmato","Marquetalia","Marulanda","Neira","Norcasia","Pácora","Palestina","Pensilvania","Riosucio","Risaralda","Salamina","Samaná","San José","Supía","Victoria","Villamaría","Viterbo"],Caquetá:["Albania","Belén de los Andaquíes","Cartagena del Chairá","Currillo","El Doncello","El Paujil","Florencia","La Montañita","Milán","Morelia","Puerto Rico","San José del Fragua","San Vicente del Caguán","Solano","Solita","Valparaiso"],Casanare:["Aguazul","Chameza","Hato Corozal","La Salina","Maní","Monterrey","Nunchía","Orocué","Paz de Ariporo","Pore","Recetor","Sabanalarga","Sácama","San Luis de Palenque","Támara","Tauramena","Trinidad","Villanueva","Yopal"],Cauca:["Almaguer","Argelia","Balboa","Bolívar","Buenos Aires","Cajibío","Caldono","Caloto","Corinto","El Tambo","Florencia","Guapi","Inzá","Jambalo","La Sierra","La Vega","Lopez","Mercaderes","Miranda","Morales","Padilla","Paez","Patia","Piamonte","Piendamo","Popayán","Puerto Tejada","Purace","Rosas","San Sebastian","Santa Rosa","Santander de Quilichao","Silvia","Sotara","Suarez","Sucre","Timbio","Timbiqui","Toribio","Totoro","Villa Rica"],Cesar:["Aguachica","Agustín Codazzi","Astrea","Becerril","Bosconia","Chimichagua","Chiriguaná","Curumaní","El Copey","El Paso","Gamarra","González","La Gloria","La Jagua de Ibirico","La Paz","Manaure","Pailitas","Pelaya","Pueblo Bello","Río de Oro","San Alberto","San Diego","San Martín","Tamalameque","Valledupar"],Chocó:["Acandí","Alto Baudó","Atrato","Bagadó","Bahía Solano","Bajo Baudó","Belén de Bajirá","Bojayá","Cantón de San Pablo","Carmen del Darién","Cértegui","Condoto","El Carmen de Atrato","El Litoral del San Juan","Istmina","Juradó","Lloró","Medio Atrato","Medio Baudó","Medio San Juan","Nóvita","Nuquí","Quibdó","Río Iró","Río Quito","Riosucio","San José del Palmar","Sipí","Tadó","Unguía","Unión Panamericana"],Córdoba:["Ayapel","Buenavista","Canalete","Cereté","Chimá","Chinú","Ciénaga de Oro","Cotorra","La Apartada","Lorica","Los Córdobas","Momil","Moñitos","Montelíbano","Montería","Planeta Rica","Pueblo Nuevo","Puerto Escondido","Puerto Libertador","Purísima","Sahagún","San Andrés de Sotavento","San Antero","San Bernardo del Viento","San Carlos","San Pelayo","Tierralta","Valencia"],Cundinamarca:["Agua de Dios","Albán","Anapoima","Anolaima","Apulo","Arbeláez","Beltrán","Bituima","Bojacá","Cabrera","Cachipay","Cajicá","Caparrapí","Cáqueza","Carmen de Carupa","Chaguaní","Chía","Chipaque","Choachí","Chocontá","Cogua","Cota","Cucunubá","El Colegio","El Peñón","El Rosal","Facatativá","Fomeque","Fosca","Funza","Fúquene","Fusagasugá","Gachala","Gachancipá","Gachetá","Gama","Girardot","Granada","Guachetá","Guaduas","Guasca","Guataquí","Guatavita","Guayabal de Síquima","Guayabetal","Gutiérrez","Jerusalén","Junín","La Calera","La Mesa","La Palma","La Peña","La Vega","Lenguazaque","Macheta","Madrid","Manta","Medina","Mosquera","Nariño","Nemocón","Nilo","Nimaima","Nocaima","Pacho","Paime","Pandi","Paratebueno","Pasca","Puerto Salgar","Puli","Quebradanegra","Quetame","Quipile","Ricaurte","San Antonio de Tequendama","San Bernardo","San Cayetano","San Francisco","San Juan de Rioseco","Sasaima","Sesquilé","Sibaté","Silvania","Simijaca","Soacha","Sopó","Subachoque","Suesca","Supatá","Susa","Sutatausa","Tabio","Tausa","Tena","Tenjo","Tibacuy","Tibirita","Tocaima","Tocancipá","Topaipí","Ubalá","Ubaque","Ubaté","Une","Útica","Venecia","Vergara","Vianí","Villagómez","Villapinzón","Villeta","Viotá","Yacopí","Zipacón","Zipaquirá"],Guainía:["Barranco Minas","Cacahual","Inírida","La Guadalupe","Mapiripana","Morichal","Pana Pana","Puerto Colombia","San Felipe"],Guaviare:["Calamar","El Retorno","Miraflores","San José del Guaviare"],Huila:["Acevedo","Agrado","Aipe","Algeciras","Altamira","Baraya","Campoalegre","Colombia","Elías","Garzón","Gigante","Guadalupe","Hobo","Iquira","Isnos","La Argentina","La Plata","Nátaga","Neiva","Oporapa","Paicol","Palermo","Palestina","Pital","Pitalito","Rivera","Saladoblanco","San Agustín","Santa María","Suaza","Tarqui","Tello","Teruel","Tesalia","Timaná","Villavieja","Yaguará"],"La Guajira":["Albania","Barrancas","Dibulla","Distracción","El Molino","Fonseca","Hatonuevo","La Jagua del Pilar","Maicao","Manaure","Riohacha","San Juan del Cesar","Uribia","Urumita","Villanueva"],Magdalena:["Algarrobo","Aracataca","Ariguaní","Cerro San Antonio","Chibolo","Ciénaga","Concordia","El Banco","El Piñón","El Reten","Fundación","Guamal","Nueva Granada","Pedraza","Pijiño del Carmen","Pivijay","Plato","Pueblo Viejo","Remolino","Sabanas de San Ángel","Salamina","San Sebastián de Buenavista","San Zenón","Santa Ana","Santa Bárbara de Pinto","Santa Marta","Sitionuevo","Tenerife","Zapayán","Zona Bananera"],Meta:["Acacías","Barranca de Upía","Cabuyaro","Castilla la Nueva","Cumaral","El Calvario","El Castillo","El Dorado","Fuente de Oro","Granada","Guamal","La Macarena","La Uribe","Lejanías","Mapiripán","Mesetas","Puerto Concordia","Puerto Gaitán","Puerto Lleras","Puerto López","Puerto Rico","Restrepo","San Carlos Guaroa","San Juan de Arama","San Juanito","San Luis de Cubarral","San Martín","Villavicencio","Vista Hermosa"],Nariño:["Albán","Aldana","Ancuyá","Arboleda","Barbacoas","Belén","Buesaco","Chachagüí","Colón","Consacá","Contadero","Córdoba","Cuaspud","Cumbal","Cumbitara","El Charco","El Peñol","El Rosario","El Tablón de Gómez","El Tambo","Francisco Pizarro","Funes","Guachucal","Guaitarilla","Gualmatán","Iles","Imues","Ipiales","La Cruz","La Florida","La Llanada","La Tola","La Unión","Leiva","Linares","Los Andes","Magüí Payán","Mallama","Mosquera","Nariño","Olaya Herrera","Ospina","Pasto","Policarpa","Potosí","Providencia","Puerres","Pupiales","Ricaurte","Roberto Payán","Samaniego","San Bernardo","San Lorenzo","San Pablo","San Pedro de Cartago","Sandoná","Santa Bárbara","Santa Cruz","Sapuyes","Taminango","Tangua","Tumaco","Túquerres","Yacuanquer"],"Norte de Santander":["Abrego","Arboledas","Bochalema","Bucarasica","Cachirá","Cácota","Chinácota","Chitagá","Convención","Cúcuta","Cucutilla","Durania","El Carmen","El Tarra","El Zulia","Gramalote","Hacarí","Herrán","La Esperanza","La Playa","Labateca","Los Patios","Lourdes","Mutiscua","Ocaña","Pamplona","Pamplonita","Puerto Santander","Ragonvalia","Salazar","San Calixto","San Cayetano","Santiago","Sardinata","Silos","Teorama","Tibú","Toledo","Villa Caro","Villa del Rosario"],Putumayo:["Colón","Mocoa","Orito","Puerto Asís","Puerto Caicedo","Puerto Guzmán","Puerto Leguizamo","San Francisco","San Miguel","Santiago","Sibundoy","Valle del Guamuez","Villa Garzón"],Quindío:["Armenia","Buenavista","Calarcá","Circasia","Córdoba","Filandia","Génova","La Tebaida","Montenegro","Pijao","Quimbaya","Salento"],Risaralda:["Apía","Balboa","Belén de Umbría","Dosquebradas","Guática","La Celia","La Virginia","Marsella","Mistrató","Pereira","Pueblo Rico","Quinchía","Santa Rosa de Cabal","Santuario"],"San Andrés y Providencia":["Providencia y Santa Catalina","San Andrés"],Santander:["Aguada","Albania","Aratoca","Barbosa","Barichara","Barrancabermeja","Betulia","Bolívar","Bucaramanga","Cabrera","California","Capitanejo","Carcasí","Cepitá","Cerrito","Charalá","Charta","Chima","Chipatá","Cimitarra","Concepción","Confines","Contratación","Coromoro","Curití","El Carmen de Chucurí","El Guacamayo","El Peñón","El Playón","Encino","Enciso","Florián","Floridablanca","Galán","Gambita","Girón","Guaca","Guadalupe","Guapotá","Guavatá","Güepsa","Hato","Jesús María","Jordán","La Belleza","La Paz","Landázuri","Lebríja","Los Santos","Macaravita","Málaga","Matanza","Mogotes","Molagavita","Ocamonte","Oiba","Onzaga","Palmar","Palmas del Socorro","Páramo","Piedecuesta","Pinchote","Puente Nacional","Puerto Parra","Puerto Wilches","Rionegro","Sabana de Torres","San Andrés","San Benito","San Gil","San Joaquín","San José de Miranda","San Miguel","San Vicente de Chucurí","Santa Bárbara","Santa Helena del Opón","Simacota","Socorro","Suaita","Sucre","Surata","Tona","Valle de San José","Vélez","Vetas","Villanueva","Zapatoca"],Sucre:["Buenavista","Caimito","Chalán","Coloso","Corozal","Coveñas","El Roble","Galeras","Guaranda","La Unión","Los Palmitos","Majagual","Morroa","Ovejas","Palmito","Sampués","San Benito Abad","San Juan Betulia","San Marcos","San Onofre","San Pedro","Santiago de Tolú","Sincé","Sincelejo","Sucre","Tolú Viejo"],Tolima:["Alpujarra","Alvarado","Ambalema","Anzoátegui","Armero","Ataco","Cajamarca","Carmen de Apicalá","Casabianca","Chaparral","Coello","Coyaima","Cunday","Dolores","Espinal","Falan","Flandes","Fresno","Guamo","Herveo","Honda","Ibagué","Icononzo","Lérida","Líbano","Mariquita","Melgar","Murillo","Natagaima","Ortega","Palocabildo","Piedras","Planadas","Prado","Purificación","Rioblanco","Roncesvalles","Rovira","Saldaña","San Antonio","San Luis","Santa Isabel","Suárez","Valle de San Juan","Venadillo","Villahermosa","Villarrica"],"Valle del Cauca":["Alcalá","Andalucía","Ansermanuevo","Argelia","Bolívar","Buenaventura","Buga","Bugalagrande","Caicedonia","Cali","Calima","Candelaria","Cartago","Dagua","El Águila","El Cairo","El Cerrito","El Dovio","Florida","Ginebra","Guacarí","Jamundí","La Cumbre","La Unión","La Victoria","Obando","Palmira","Pradera","Restrepo","Riofrío","Roldanillo","San Pedro","Sevilla","Toro","Trujillo","Tuluá","Ulloa","Versalles","Vijes","Yotoco","Yumbo","Zarzal"],Vaupés:["Carurú","Mitú","Pacoa","Papunahua","Taraira","Yavaraté"],Vichada:["Cumaribo","La Primavera","Puerto Carreño","Santa Rosalía"]},gn=[{title:"How to answer salary questions",tag:"Interview",read:"4 min",body:"Use a confident range, anchor it to the role, and avoid apologizing for earning in USD.",actions:["Know your floor","Use monthly USD","Mention flexibility last"]},{title:"Writing a CV for US SaaS companies",tag:"CV",read:"6 min",body:"Translate local experience into metrics US hiring managers can scan in under a minute.",actions:["Lead with outcomes","Add tools","Quantify scope"]},{title:"Before your recruiter screen",tag:"Process",read:"3 min",body:"Prepare availability, compensation, English comfort, and two strong role stories.",actions:["Check your setup","Review the opening","Bring questions"]},{title:"STAR stories that feel natural",tag:"Interview",read:"5 min",body:"Keep stories specific, concise, and tied to business impact instead of job duties.",actions:["Situation","Action","Result"]}],Qa=[{key:"profile-review",label:"Profile Review",help:"We are checking role fit and your candidate profile."},{key:"background-check",label:"Background Checks",help:"Nearwork is verifying relevant background and work details."},{key:"assessment",label:"Assessment",help:"Complete role-specific questions when assigned."},{key:"interview",label:"Interview",help:"Meet the recruiter and book your next conversation."},{key:"presented",label:"Presented",help:"Your profile has been prepared for the company."},{key:"client-review",label:"Client Review",help:"The company is reviewing your profile and next steps."},{key:"hired",label:"Hired",help:"Offer accepted and onboarding is ready to begin."}],dt=["Applied","Assessment","Interview","Final round","Offer"];let o={user:null,candidate:null,applications:[],assessments:[],notifications:[],notificationPanelOpen:!1,notificationSettingsOpen:!1,jobs:[],loading:!0,view:"login",activePage:"overview",matchesFiltered:!1,message:"",assessmentUiStep:null,showDeleteAccountModal:!1,deleteAccountStatus:null,deleteAccountError:"",showUnsavedChangesModal:!1,resetCodeStatus:null,resetCodeError:""},G=null;const va=sessionStorage.getItem("nw_restore_path");va&&(sessionStorage.removeItem("nw_restore_path"),window.history.replaceState({page:va},"",va));function ut(){return[["overview","layout-dashboard","Overview"],["matches","briefcase-business","Matches"],["applications","send","Applications"],["assessment","clipboard-check","Assessment"],["cvs","files","CV Picker"],["tips","book-open","Tips"],["recruiter","calendar-days","Recruiter"],["profile","user-round-cog","Profile"]]}function la(){const a=window.location.pathname.split("/").filter(Boolean)[0];return a==="onboarding"?"onboarding":a==="assessment"||a==="assessments"?"assessment":ut().some(([t])=>t===a)?a:"overview"}function Ae(){const e=window.location.pathname.split("/").filter(Boolean);return(e[0]==="assessment"||e[0]==="assessments")&&e[1]||""}function pt(){const e=window.location.pathname.split("/").filter(Boolean),a=e.findIndex(n=>n==="q"||n==="question");if(a===-1)return null;const t=Number(e[a+1]);return Number.isFinite(t)&&t>0?t-1:null}function vn(e,a=0){return`/assessment/${encodeURIComponent(e)}/start/q/${Number(a||0)+1}`}function Ie(e,a=0,t=!1){const n=vn(e,a);if(window.location.pathname===n)return;const s=t?"replaceState":"pushState";window.history[s]({page:"assessment",assessmentId:e,questionIndex:a},"",n)}function g(e,a){return`<i data-lucide="${e}" aria-label="${e}"></i>`}let fa=!1;function ce(){if(window.lucide){window.lucide.createIcons();return}if(fa)return;fa=!0;const e=()=>{window.lucide?(window.lucide.createIcons(),fa=!1):setTimeout(e,50)};e()}function C(e){o={...o,...e},Lt()}function Ve(e,a=!0){const n=e==="onboarding"||ut().some(([s])=>s===e)?e:"overview";o={...o,activePage:n,matchesFiltered:n==="matches"?o.matchesFiltered:!1,message:"",assessmentUiStep:null},a&&window.history.pushState({page:n},"",n==="overview"?"/":`/${n}`),Lt()}function mt(){var a,t;return(((a=o.candidate)==null?void 0:a.name)||((t=o.user)==null?void 0:t.displayName)||"there").split(" ")[0]||"there"}function fn(){var a,t,n;return(((a=o.candidate)==null?void 0:a.name)||((t=o.user)==null?void 0:t.displayName)||((n=o.user)==null?void 0:n.email)||"NW").split(/[ @.]/).filter(Boolean).slice(0,2).map(s=>s[0]).join("").toUpperCase()}function gt(e="normal"){var n,s;const a=((n=o.candidate)==null?void 0:n.photoURL)||((s=o.user)==null?void 0:s.photoURL)||"",t=e==="large"?"avatar avatar-large":"avatar";return a?`<img class="${t}" src="${k(a)}" alt="${k(mt())}" />`:`<div class="${t}">${fn()}</div>`}function k(e){return String(e||"").replaceAll("&","&amp;").replaceAll('"',"&quot;").replaceAll("<","&lt;").replaceAll(">","&gt;")}function S(e){return String(e||"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;")}function da(e){if(!e)return"Recently";const a=e.toDate?e.toDate():new Date(e);return new Intl.DateTimeFormat("en",{month:"short",day:"numeric"}).format(a)}function ea(){var a;const e=((a=o.candidate)==null?void 0:a.skills)||[];return Array.isArray(e)?e:String(e).split(",").map(t=>t.trim()).filter(Boolean)}function Z(e){return String(e||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/&/g," and ").replace(/[^a-z0-9]+/g," ").trim().replace(/\s+/g," ")}function Ta(e,a=ea()){const t=Ee(e),n=new Set((t.skills||[]).map(Z).filter(Boolean)),s=new Map(a.map(i=>[Z(i),i]).filter(([i])=>i));return[...s.keys()].filter(i=>n.has(i)).map(i=>s.get(i))}function vt(e){return["Nearwork candidate","Talent member"].includes(String(e||"").trim())}function Wa(e){if(!e)return null;if(e.toDate)return e.toDate();if(typeof e=="object"&&typeof e.seconds=="number")return new Date(e.seconds*1e3);const a=new Date(e);return Number.isNaN(a.getTime())?null:a}function Na(e){return Number(e||1)===1?"Technical Assessment":"DISC Assessment"}function ha(e,a){var t,n,s;return((n=(t=e==null?void 0:e.answers)==null?void 0:t[a==null?void 0:a.id])==null?void 0:n.value)??((s=e==null?void 0:e.answers)==null?void 0:s[a==null?void 0:a.id])??""}function Ue(e){return e!=null&&e!==""}function le(e,a){return((e==null?void 0:e.questions)||[]).slice(0,70).filter(t=>Number(t.stage||1)===Number(a))}function ka(e,a,t=(e==null?void 0:e.answers)||{}){return le(e,a).filter(n=>{var s;return!Ue(((s=t[n.id])==null?void 0:s.value)??t[n.id])})}function hn(){var e,a;return!!((o.applications||[]).length||(((e=o.candidate)==null?void 0:e.pipelineCodes)||[]).length||(a=o.candidate)!=null&&a.pipelineCode)}function yn(){var i,c,r,d,u;const e=((i=o.candidate)==null?void 0:i.locationCountry)||((c=o.candidate)==null?void 0:c.country)||"Colombia",a=((r=o.candidate)==null?void 0:r.department)||"Bogotá D.C.",t=Ye[a]||Ye["Bogotá D.C."]||["Bogotá"],n=((d=o.candidate)==null?void 0:d.city)||((u=o.candidate)==null?void 0:u.locationCity)||t[0],s=e==="Colombia"?`${n}, ${a}`:e;return{country:e,department:a,city:n,label:s}}function bn(){var a,t,n;const e=((a=o.candidate)==null?void 0:a.targetRole)||((t=o.candidate)==null?void 0:t.headline)||"";return((n=Object.entries(Je).find(([,s])=>s.includes(e)))==null?void 0:n[0])||Object.keys(Je)[0]}function wn(e){return Object.keys(Je).map(a=>`<option value="${k(a)}" ${a===e?"selected":""}>${a}</option>`).join("")}function ft(e,a){const t=Je[e]||Object.values(Je).flat();return['<option value="">Choose the closest role</option>'].concat(t.map(n=>`<option value="${k(n)}" ${a===n?"selected":""}>${n}</option>`)).join("")}function Ce(e){const a=String(e||"").replace(/[,.\s]+$/,"").replace(/^[,.\s]+/,"").trim();if(!a||a.length<2)return"";const t=ct.find(n=>Z(n)===Z(a));return t||a.split(/\s+/).map(n=>n.length<=3&&n===n.toUpperCase()?n:n.charAt(0).toUpperCase()+n.slice(1).toLowerCase()).join(" ")}function Sn(e){const a=[...new Set((e||[]).map(Ce).filter(Boolean))],t=["Customer Service","Salesforce","HubSpot","Excel","Google Sheets","Technical Support","Outbound Calls","React","SQL","Payroll"];return`
    <div class="skill-search-shell" data-skill-search>
      <div class="selected-skills" id="selectedSkills">
        ${a.map(n=>`
          <span class="selected-skill" data-skill-chip="${k(n)}">
            ${S(n)}
            <button type="button" class="skill-remove" data-remove-skill="${k(n)}" aria-label="Remove ${k(n)}">×</button>
            <input type="hidden" name="skills" value="${k(n)}" />
          </span>
        `).join("")||'<span class="skill-empty">Selected skills will appear here.</span>'}
      </div>
      <div class="skill-search-box">
        <input id="skillSearchInput" type="search" autocomplete="off" placeholder="Type any skill — e.g. Salesforce, Excel, B2B sales, Canva…" />
        <button class="secondary-action" type="button" id="addTypedSkill">Add skill</button>
      </div>
      <div class="skill-suggestions" id="skillSuggestions">
        ${t.map(n=>`<button type="button" class="skill-suggestion" data-skill="${k(n)}">${S(n)}</button>`).join("")}
      </div>
      <p class="field-hint">Select between 5 and 20 skills that best describe your experience.</p>
    </div>
  `}function ht(e,a="USD"){const t=Number(String(e||"").replace(/[^\d.]/g,"")),n=String(a||"USD").toUpperCase()==="COP"?"COP":"USD";if(!Number.isFinite(t)||t<=0)return{salary:"",salaryUSD:null,salaryCurrency:n,salaryAmount:null};const s=Math.round(t),i=n==="COP"?"es-CO":"en-US";return{salary:`$${new Intl.NumberFormat(i).format(s)} ${n}/mo`,salaryUSD:n==="USD"?s:null,salaryCurrency:n,salaryAmount:s}}function yt(e){return Number(String(e||"").replace(/[^\d.]/g,""))}function Ja(e,a="USD"){const t=yt(e),n=String(a||"USD").toUpperCase()==="COP"?"COP":"USD";return n==="USD"&&t>=1e5?"COP":n}function Aa(e,a="USD"){const t=yt(e);return!Number.isFinite(t)||t<=0?"":new Intl.NumberFormat("en-US",{maximumFractionDigits:0}).format(Math.round(t))}typeof window<"u"&&(window.__fmtSalary=function(e){const a=String(e.value||"").replace(/[^\d]/g,"");e.value=a?Number(a).toLocaleString("en-US"):""});function Be(e){return String(e||"").replace(/\S+/g,a=>/[A-Za-zÀ-ÿ]/.test(a)&&a===a.toUpperCase()?a.charAt(0).toUpperCase()+a.slice(1).toLowerCase():a)}function bt(e){return Array.isArray(e)?e:String(e||"").split(",").map(a=>a.trim()).filter(Boolean)}function Ee(e){const a=bt(e.skills||e.requiredSkills);return{id:e.id||e.code,code:e.code||e.id,title:e.title||e.role||e.openingTitle||"Open role",orgName:e.orgName||e.company||e.clientName||"Nearwork client",location:e.location||"Remote",compensation:e.compensation||e.salary||e.rate||"Competitive",match:e.match||null,skills:a,description:e.description||e.about||"Nearwork is reviewing candidates for this role now."}}function Te(e){const a=(e==null?void 0:e.code)||"";return a.includes("operation-not-allowed")?"This sign-in method is not available yet.":a.includes("unauthorized-domain")?"This website still needs to be approved for sign-in.":a.includes("permission-denied")?"We could not save this yet. Please try again in a moment or contact Nearwork support.":a.includes("weak-password")?"Password must be at least 6 characters.":a.includes("invalid-credential")||a.includes("wrong-password")?"That email/password did not match.":a.includes("user-not-found")?"No account exists for that email yet.":a.includes("email-already-in-use")?"That email already has an account. Sign in instead.":"Something went wrong. Please try again or contact Nearwork support."}const ta=[{initials:"CP",name:"Camila P.",role:"Product Designer",city:"Medellín",quote:"I doubled my income and kept living in Medellín. The whole process took 19 days from apply to signed offer."},{initials:"AR",name:"Andrés R.",role:"SDR",city:"Bogotá",quote:"I went from chasing local leads to running outbound for a US SaaS team — same desk, way better pay."},{initials:"LG",name:"Laura G.",role:"Customer Success Manager",city:"Cali",quote:"No recruiters ghosting me. One profile, real interviews, and an offer that actually matched the role."},{initials:"FT",name:"Felipe T.",role:"Sales Ops Analyst",city:"Bucaramanga",quote:"The matching was spot on. I only talked to teams that fit what I was looking for, and signed within a month."},{initials:"DV",name:"Daniela V.",role:"Account Executive",city:"Cartagena",quote:"Now I'm closing deals for a US company in USD, still based in Cartagena. Best career move I've made."}];let xe=null;function Cn(e){xe&&clearInterval(xe);const a=ta[0];Xe.innerHTML=`
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
          ${g("quote")}
          <div class="testimonial-content">
            <p>"${a.quote}"</p>
            <div class="testimonial-person">
              <span class="mini-avatar">${a.initials}</span>
              <div><strong>${a.name}</strong><small>${a.role}, ${a.city}</small></div>
            </div>
          </div>
          <div class="testimonial-dots">
            ${ta.map((n,s)=>`<span class="testimonial-dot${s===0?" is-active":""}"></span>`).join("")}
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
  `,ce();let t=0;xe=setInterval(()=>{const n=document.querySelector(".testimonial");if(!n){clearInterval(xe),xe=null;return}const s=n.querySelector(".testimonial-content");s.classList.add("is-flipping"),setTimeout(()=>{t=(t+1)%ta.length;const i=ta[t],c=s.querySelector("p"),r=s.querySelector(".mini-avatar"),d=s.querySelector(".testimonial-person strong"),u=s.querySelector(".testimonial-person small");c&&(c.textContent=`"${i.quote}"`),r&&(r.textContent=i.initials),d&&(d.textContent=i.name),u&&(u.textContent=`${i.role}, ${i.city}`),n.querySelectorAll(".testimonial-dot").forEach((m,l)=>m.classList.toggle("is-active",l===t)),s.classList.remove("is-flipping")},320)},6e3)}function wt(e="login"){var s;const a=e==="signup";xe&&clearInterval(xe),xe=null,Xe.innerHTML=`
    <main class="nw-login-grid">
      <!-- Story panel (left) -->
      <div class="nw-story-panel">
        <div class="nw-story-texture"></div>
        <div class="nw-story-glow"></div>
        <div class="nw-story-inner">
          <div class="nw-story-topbar">
            <div class="nw-wordmark-login">Near<span>work</span></div>
            <a class="nw-back-home" href="https://nearwork.co">${g("arrow-left")} NEARWORK.CO</a>
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
            ${g("shield-check")} 100% free for candidates · Your data stays private
          </div>
        </div>
      </div>

      <!-- Sign-in side (right) -->
      <div class="nw-signin-side">
        <div class="nw-signin-card">
          <div class="nw-mobile-wm">Near<span>work</span></div>
          <div class="nw-cand-chip"><span class="nw-cand-dot"></span>For candidates</div>
          <h2 class="nw-signin-heading">${a?"Create your account.":"Welcome back."}</h2>
          ${o.message?`<div class="notice">${g("lock")} ${k(o.message)}</div>`:""}
          ${he?"":`<div class="notice">${g("triangle-alert")} Sign-in is still being set up.</div>`}
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
                <button type="button" class="nw-pw-toggle" data-password-toggle aria-label="Show password">${g("eye")}</button>
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
              ${a?`${g("user-plus")} Create account`:`Sign in ${g("arrow-right")}`}
            </button>
            <p id="formMessage" class="form-message" role="status"></p>
          </form>
          <div class="nw-card-foot">
            ${g("sparkles")}
            <button id="toggleMode" class="nw-create-link" type="button">${a?"Already have an account? Sign in":"New or invited by Nearwork? Create your profile"}</button>
          </div>
          <a class="nw-back-jobs" href="https://jobs.nearwork.co" target="_blank" rel="noreferrer">${g("arrow-left")} Back to job board</a>
        </div>
      </div>
    </main>
  `,ce();const t=new URLSearchParams(window.location.search).get("email");if(t){const i=document.querySelector("#emailInput");i&&(i.value=t,i.dispatchEvent(new Event("input")));const c=document.querySelector("#passwordInput");c&&c.focus()}if(new URLSearchParams(window.location.search).get("from")==="jobs"&&o.message!=="Welcome from Jobs — log in to view your dashboard."){const i=document.querySelector("#formMessage");i&&(i.textContent="Welcome from Jobs — log in to view your dashboard.",i.classList.add("success"))}document.querySelector("#toggleMode").addEventListener("click",()=>wt(a?"login":"signup")),document.querySelectorAll("[data-password-toggle]").forEach(i=>{i.addEventListener("click",()=>{const c=i.previousElementSibling,r=c.type==="password";c.type=r?"text":"password",i.innerHTML=g(r?"eye-off":"eye"),i.setAttribute("aria-label",r?"Hide password":"Show password"),ce()})}),(s=document.querySelector("#resetPassword"))==null||s.addEventListener("click",async()=>{const i=document.querySelector("input[name='email']").value.trim().toLowerCase(),c=document.querySelector("#formMessage");if(!i){c.classList.remove("success"),c.textContent="Enter your email first, then request a reset link.";return}try{await tn(i),c.classList.add("success"),c.textContent=`Reset link sent! Check ${i} — it should arrive within a minute.`}catch(r){c.classList.remove("success"),c.textContent=Te(r)}}),document.querySelector("#authForm").addEventListener("submit",async i=>{var l;i.preventDefault();const c=new FormData(i.currentTarget),r=document.querySelector("#formMessage"),d=String(c.get("email")).trim().toLowerCase();if(r.textContent="",a){const p=document.querySelector("#privacyConsent"),h=document.querySelector("#privacyConsentError");if(p&&!p.checked){h&&(h.style.display=""),r.textContent="Please accept the Privacy Policy to continue.";return}h&&(h.style.display="none")}const u=a?((l=document.querySelector("#marketingConsent"))==null?void 0:l.checked)===!0:!1,m=new Date().toISOString();try{if(a){const p=Be(String(c.get("name")||"").trim()),h=await It(B,d,c.get("password"));await Dt(h.user,{displayName:p}),sessionStorage.setItem("nw_new_account","1"),await ot(h.user.uid,{name:p,email:d,availability:"open",headline:"Nearwork candidate",onboarded:!1,source:"talent.nearwork.co",privacyConsent:!0,privacyConsentAt:m,marketingConsent:u,marketingConsentAt:u?m:null}),await zt({name:p,firstName:p.split(/\s+/)[0],email:d}).catch(x=>console.error("[NW] account email failed:",x==null?void 0:x.message))}else await Ut(B,d,c.get("password"))}catch(p){r.textContent=Te(p)}})}function $n(){var n,s;const e=new URLSearchParams(window.location.search),a=e.get("token")||"",t=e.get("email")||"";Cn(`
    <section class="auth-panel">
      <div class="auth-top">
        <div class="right-brand">Near<span>work</span></div>
        <div class="candidate-chip">Candidate portal</div>
      </div>
      <div class="panel-heading">
        <h2>Set a new password.</h2>
        <p>${t?`Resetting password for <strong>${S(t)}</strong>. Choose a password you haven't used before.`:"Choose a new password you haven't used before."}</p>
      </div>
      ${a?o.resetCodeStatus==="success"?`
        <div class="notice">${g("check-circle-2")} Password updated! Sign in with your new password.</div>
        <button class="primary-action" type="button" id="backToLogin">Sign in</button>
      `:`
      <form id="resetForm" class="stacked-form">
        <div class="field-group">
          <label class="field-label" for="newPassword">New password</label>
          <div class="password-field">
            <input id="newPassword" name="newPassword" type="password" autocomplete="new-password" minlength="6" placeholder="••••••••" required />
            <button type="button" class="password-toggle" data-password-toggle aria-label="Show password">${g("eye")}</button>
          </div>
        </div>
        <div class="field-group">
          <label class="field-label" for="confirmPassword">Confirm password</label>
          <div class="password-field">
            <input id="confirmPassword" name="confirmPassword" type="password" autocomplete="new-password" minlength="6" placeholder="••••••••" required />
            <button type="button" class="password-toggle" data-password-toggle aria-label="Show confirm">${g("eye")}</button>
          </div>
        </div>
        ${o.resetCodeStatus==="error"?`<div class="notice">${g("triangle-alert")} ${S(o.resetCodeError||"Something went wrong. Please request a new link.")}</div>`:""}
        <button class="primary-action" type="submit" ${o.resetCodeStatus==="resetting"?"disabled":""}>
          ${o.resetCodeStatus==="resetting"?"Updating…":`${g("lock")} Set new password`}
        </button>
        <p id="formMessage" class="form-message" role="status"></p>
      </form>
      <button id="backToLogin" class="text-action" type="button">Back to sign in</button>
      `:`
        <div class="notice">${g("triangle-alert")} This link is invalid or has already been used. Request a new one below.</div>
        <button class="primary-action" type="button" id="backToLogin">Back to sign in</button>
      `}
      <p class="auth-footer">© ${new Date().getFullYear()} Nearwork Inc. All rights reserved.</p>
    </section>
  `),document.querySelectorAll("[data-password-toggle]").forEach(i=>{i.addEventListener("click",()=>{const c=i.previousElementSibling,r=c.type==="password";c.type=r?"text":"password",i.innerHTML=g(r?"eye-off":"eye"),i.setAttribute("aria-label",r?"Hide password":"Show password"),ce()})}),(n=document.querySelector("#backToLogin"))==null||n.addEventListener("click",()=>{const i=o.resetCodeStatus==="success"?"Your password has been reset. Sign in with your new password.":"";window.history.pushState({},"","/"),C({view:"login",message:i,resetCodeStatus:null,resetCodeError:""})}),(s=document.querySelector("#resetForm"))==null||s.addEventListener("submit",async i=>{i.preventDefault();const c=document.querySelector("#newPassword").value,r=document.querySelector("#confirmPassword").value;if(c!==r){C({resetCodeStatus:"error",resetCodeError:"Passwords do not match."});return}if(c.length<6){C({resetCodeStatus:"error",resetCodeError:"Password must be at least 6 characters."});return}C({resetCodeStatus:"resetting"});try{const d=await fetch("/api/confirm-reset",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({token:a,newPassword:c})}),u=await d.json().catch(()=>({}));if(!d.ok||!u.ok)throw new Error(u.error||"Something went wrong. Please request a new link.");C({resetCodeStatus:"success"})}catch(d){const u=(d==null?void 0:d.message)||"This link has expired or already been used. Please request a new one.";C({resetCodeStatus:"error",resetCodeError:u})}})}async function Ya(e){var a,t,n;C({loading:!0,user:e});try{const[s,i,c]=await Promise.allSettled([Gt(e),Wt(e.uid),lt()]);let r=s.status==="fulfilled"?s.value:null;if(!r){const E=s.status==="rejected"?(a=s.reason)==null?void 0:a.message:"document not found";console.error("[NW] profile load:",E,"uid:",e.uid,"email:",e.email),new URLSearchParams(window.location.search).get("debug")==="1"&&alert("Profile debug — uid: "+e.uid+`
Status: `+s.status+`
Reason: `+E)}const d=i.status==="fulfilled"?i.value:[],u=c.status==="fulfilled"?c.value:[];let m=[];try{m=await Jt(e.uid,e.email,(r==null?void 0:r.candidateCode)||(r==null?void 0:r.code)||"")}catch(E){console.warn(E)}const l=Ae();if(l&&!m.some(E=>E.id===l)){const E=await Yt(l,e.uid,e.email,(r==null?void 0:r.candidateCode)||(r==null?void 0:r.code)||"").catch(()=>null);E&&(m=[E,...m])}const p=sessionStorage.getItem("nw_new_account")==="1";p&&sessionStorage.removeItem("nw_new_account");const h=!!(r!=null&&r.targetRole||!vt(r==null?void 0:r.headline)&&(r!=null&&r.headline)),x=new URLSearchParams(window.location.search).get("from")==="jobs",P=!!(r!=null&&r.cvUrl||(t=r==null?void 0:r.applications)!=null&&t.length||((n=r==null?void 0:r.skills)==null?void 0:n.length)>=3),N=(r==null?void 0:r.onboarded)||h||P||x;!(r!=null&&r.onboarded)&&N&&(r!=null&&r.candidateCode)&&Ke(e.uid,{onboarded:!0,candidateCode:r.candidateCode}).catch(()=>null);const L=p&&!N?"onboarding":N?la():"onboarding";C({candidate:{...r||{},name:(r==null?void 0:r.name)||e.displayName||"Talent member",email:(r==null?void 0:r.email)||e.email,availability:(r==null?void 0:r.availability)||"open",headline:(r==null?void 0:r.headline)||(r==null?void 0:r.targetRole)||"Nearwork candidate"},applications:d,assessments:m,jobs:u.map(Ee),loading:!1,view:"dashboard",activePage:L,message:""}),fetch("/api/intercom-token",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({userId:e.uid,email:e.email})}).then(E=>E.ok?E.json():null).then(E=>{E!=null&&E.token&&window.Intercom&&window.Intercom("boot",{api_base:"https://api-iam.intercom.io",app_id:"pelltlav",intercom_user_jwt:E.token,user_id:e.uid,name:(r==null?void 0:r.name)||e.displayName||"",email:e.email,session_duration:864e5})}).catch(()=>{}),G&&G(),he&&(G=sn(e.uid,E=>{o.notifications=E,o.view==="dashboard"&&o.activePage!=="onboarding"&&!o.message&&St()}))}catch(s){console.warn(s),C({candidate:{name:e.displayName||"Talent member",email:e.email,availability:"open",headline:"Nearwork candidate"},applications:[],assessments:[],jobs:[],loading:!1,view:"dashboard",activePage:la(),message:""})}}async function Ge(){if(window.location.pathname==="/reset-password"){G&&G(),G=null,C({user:null,candidate:null,loading:!1,view:"reset-password",resetCodeStatus:null});return}const e=la();if(e==="assessment"){sessionStorage.setItem("nw_restore_path",window.location.pathname),C({user:null,candidate:null,applications:[],assessments:[],jobs:[],loading:!1,view:"login",activePage:"overview",message:"Please log in to open your assessment."});return}if(e==="overview"){G&&G(),G=null,C({user:null,candidate:null,loading:!1,view:"login",activePage:"overview"});return}let a=[];try{const t=await lt();t.length&&(a=t.map(Ee))}catch(t){console.warn(t)}C({user:null,candidate:null,applications:[],assessments:[],jobs:a,loading:!1,view:"login",activePage:"overview",message:"Please log in to view your profile, matched openings, applications, and assessments."})}function kn(){return[{label:"My journey",items:[["overview","layout-dashboard","Overview"],["applications","send","Applications"],["assessment","clipboard-check","Assessment"]]},{label:"My search",items:[["matches","briefcase-business","Matches"],["cvs","files","CV Picker"]]},{label:"Support",items:[["tips","book-open","Tips"],["recruiter","calendar-days","Recruiter"],["profile","user-round-cog","Profile"]]}]}function An(){var e;return{open:"Open to roles",interviewing:"Interviewing",paused:"Not looking"}[((e=o.candidate)==null?void 0:e.availability)||"open"]||"Open to roles"}function Ma(){const e=o.candidate||{},a=ea();return[{id:"name",label:"Full name",done:!!e.name},{id:"role",label:"Target role",done:!!(e.targetRole||!vt(e.headline)&&e.headline)},{id:"location",label:"City",done:!!e.city},{id:"salary",label:"Salary",done:!!(e.salaryAmount||e.salary)},{id:"english",label:"English",done:!!e.english},{id:"whatsapp",label:"WhatsApp",done:!!(e.whatsapp||e.phone)},{id:"skills",label:"Skills (5-20)",done:a.length>=5},{id:"cv",label:"CV",done:!!e.cvUrl}]}function St(){var c,r,d,u,m;const e=(o.notifications||[]).filter(l=>!l.read).length,a=((c=o.candidate)==null?void 0:c.availability)||"open",n={open:"#10A07C",interviewing:"#EAB308",paused:"#9AA0A6"}[a]||"#10A07C",s=((r=o.candidate)==null?void 0:r.name)||((d=o.user)==null?void 0:d.displayName)||"Talent member",i=((u=o.candidate)==null?void 0:u.headline)||((m=o.candidate)==null?void 0:m.targetRole)||"Nearwork candidate";Xe.innerHTML=`
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
          ${kn().map(l=>`
            <div class="nw-nav-group">
              <div class="nw-nav-group-label">${l.label}</div>
              ${l.items.map(([p,h,x])=>`
                <button class="nw-nav-item${o.activePage===p?" active":""}" data-page="${p}" type="button">
                  ${g(h)} ${x}
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

        <!-- Profile card -->
        <div class="nw-sidebar-profile">
          ${gt()}
          <div class="nw-sidebar-profile-text">
            <div class="nw-sidebar-profile-name">${S(s)}</div>
            <div class="nw-sidebar-profile-role">${S(i)}</div>
          </div>
        </div>

        <!-- Sign out -->
        <button id="${o.user?"signOut":"signIn"}" class="nw-sidebar-signout" type="button">
          ${g(o.user?"log-out":"log-in")} ${o.user?"Sign out":"Sign in"}
        </button>
      </aside>

      <!-- ── Mobile bottom nav ── -->
      <nav class="nw-mobile-nav">
        <button class="nw-mob-tab${o.activePage==="overview"?" active":""}" data-page="overview" type="button">${g("layout-dashboard")}<span>Home</span></button>
        <button class="nw-mob-tab${o.activePage==="applications"?" active":""}" data-page="applications" type="button">${g("send")}<span>Applied</span></button>
        <button class="nw-mob-tab${o.activePage==="matches"?" active":""}" data-page="matches" type="button">${g("briefcase-business")}<span>Jobs</span></button>
        <button class="nw-mob-tab${o.activePage==="profile"?" active":""}" data-page="profile" type="button">${g("user-round-cog")}<span>Profile</span></button>
        <button id="mobileSignOut" class="nw-mob-tab" type="button">${g("log-out")}<span>Out</span></button>
      </nav>

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
              <span class="nw-avail-label">${An()}</span>
              ${g("chevron-down")}
              <select id="availability" class="nw-avail-select" aria-label="Availability">
                <option value="open"         ${a==="open"?"selected":""}>Open to roles</option>
                <option value="interviewing" ${a==="interviewing"?"selected":""}>Interviewing</option>
                <option value="paused"       ${a==="paused"?"selected":""}>Not looking</option>
              </select>
            </div>

            <!-- Notifications -->
            <div class="nw-notif-wrap">
              <button class="nw-icon-btn" type="button" id="notificationBell" aria-label="Notifications">
                ${g("bell")}
                ${e?'<span class="nw-notif-badge"></span>':""}
              </button>
              ${o.notificationPanelOpen?En():""}
            </div>
            <button class="nw-icon-btn" type="button" id="notificationSettings" aria-label="Settings">
              ${g("settings")}
            </button>
          </div>
        </div>

        <!-- Notification settings -->
        ${o.notificationSettingsOpen?Pn():""}

        <!-- Page content -->
        ${o.message?`<div class="notice" style="margin:0 36px;">${o.message}</div>`:""}
        <div class="nw-page-content">
          ${(()=>{try{return Nn()}catch(l){return console.error("renderActivePage error:",l),'<div class="notice">Page failed to render. <button type="button" data-page="overview">Go to overview</button></div>'}})()}
        </div>
      </section>
    </main>
  `,ce(),Rs(),Tn(),Ln()}function xn(e){return(e!=null&&e.toDate?e.toDate():new Date(e||Date.now())).toLocaleString("en-US",{month:"short",day:"numeric",year:"numeric",hour:"numeric",minute:"2-digit"})}function En(){const e=(o.notifications||[]).slice(0,10);return`
    <div class="notification-panel">
      <div class="notification-panel-head"><strong>Notifications</strong><span>${e.length?"Latest updates":"All clear"}</span></div>
      ${e.length?e.map(a=>`
        <button class="notification-item ${a.read?"":"unread"}" type="button" data-notification-read="${a.id}">
          <strong>${k(a.title||"Nearwork update")}</strong>
          <span>${k(a.message||"")}</span>
          <time>${xn(a.createdAt)}</time>
        </button>
      `).join(""):'<div class="notification-empty">No notifications yet.</div>'}
    </div>
  `}function Pn(){var t;const e=((t=o.candidate)==null?void 0:t.notificationPreferences)||{};return`
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
  `}let na=null;function Ln(){na&&window.clearInterval(na);const e=document.querySelector("#assessmentTimer");if(!e)return;const a=new Date(e.dataset.end||"").getTime(),t=()=>{const n=Math.max(0,a-Date.now()),s=Math.floor(n/1e3),i=Math.floor(s/60),c=String(s%60).padStart(2,"0");e.textContent=`${i}:${c}`,e.classList.toggle("is-low",n<=10*60*1e3),n<=0&&window.clearInterval(na)};t(),na=window.setInterval(t,1e3)}function Tn(){if(o.activePage!=="assessment")return;const e=o.assessments||[],a=Ae(),n=(a?e.find(i=>i.id===a):null)||e.find(i=>["sent","started"].includes(String(i.status||"").toLowerCase()));if(!(n!=null&&n.id))return;const s=String(n.status||"").toLowerCase();if(s==="started"&&pt()===null){Ie(n.id,Number(n.currentQuestionIndex||0),!0);return}if(!a&&s==="sent"){const i=`/assessment/${encodeURIComponent(n.id)}/start`;window.history.replaceState({page:"assessment",assessmentId:n.id},"",i)}}function Nn(){return({onboarding:Dn,overview:Za,matches:cs,applications:ds,assessment:us,cvs:ks,tips:As,recruiter:xs,profile:Es}[o.activePage]||Za)()}function Za(){var P,N;const e=xt(),a=Ma(),t=a.filter(L=>L.done).length,n=a.length,s=o.applications||[],i=s.filter(L=>["action-needed","interview-scheduled","assessment-sent"].includes(String(L.status||"").toLowerCase())).length,c=(o.jobs||[]).slice(0,3),r=((P=o.candidate)==null?void 0:P.recruiter)||{},d=2*Math.PI*52,u=d*(1-e/100),l=new Date().toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"}),p=(L,E,U,W,z)=>`
    <div class="nw-stat-tile">
      <div class="nw-stat-tile-top">
        <span class="nw-stat-tile-label">${L}</span>
        <div class="nw-stat-icon" style="background:${W}14;">
          ${g(z)}
        </div>
      </div>
      <div class="nw-stat-value">${E}</div>
      <div class="nw-stat-sub">${U}</div>
    </div>`,h=(L,E)=>{const U=String(L.stage||L.status||"applied").toLowerCase(),W=U.includes("offer")?4:U.includes("final")?3:U.includes("interview")?2:U.includes("assessment")?1:0,z=L.clientName||L.company||"Nearwork client",te=z.split(/\s+/).slice(0,2).map(ne=>ne[0]).join("").toUpperCase(),J=["#10A07C","#EC4E7E","#3B82F6","#F4A52E","#8B5CF6"],V=J[z.length%J.length];return`
      <div class="nw-app-row${E?" last":""}">
        <div class="nw-app-avatar" style="background:${V};">${te}</div>
        <div class="nw-app-info">
          <div class="nw-app-title">${S(L.jobTitle||L.title||"Application")} <span class="nw-app-company">· ${S(z)}</span></div>
          <div class="nw-app-stages">
            ${dt.map((ne,f)=>`<div class="nw-stage-pip${f<=W?" done":""}"></div>`).join("")}
            <span class="nw-app-stage-label">${L.stage||L.status||"Applied"}</span>
          </div>
        </div>
        <div class="nw-app-meta">
          <span class="nw-app-status${i?" action":""}">${L.status||"In review"}</span>
          <div class="nw-app-date">${da(L.updatedAt||L.createdAt)}</div>
        </div>
        ${g("chevron-right")}
      </div>`},x=L=>{const E=Ee(L),U=Ta(E),W=E.match||(U.length>=3?Math.min(97,70+U.length*4):null),z=["#10A07C","#EC4E7E","#3B82F6","#F4A52E"],te=z[E.orgName.length%z.length],J=E.orgName.split(/\s+/).slice(0,2).map(V=>V[0]).join("").toUpperCase();return`${encodeURIComponent(E.code)}`,`
      <div class="nw-match-card">
        <div class="nw-match-card-top">
          <div class="nw-match-avatar" style="background:${te};">${J}</div>
          ${W?`<div class="nw-match-score">${W}%</div>`:""}
        </div>
        <div class="nw-match-role">${S(E.title)}</div>
        <div class="nw-match-company">${S(E.orgName)} · ${S(E.location)}</div>
        ${U.length?`<div class="nw-match-why">${U.slice(0,3).map(S).join(" · ")} match</div>`:`<div class="nw-match-why">${S(E.description).slice(0,80)}…</div>`}
        <div class="nw-match-footer">
          <span class="nw-match-salary">${S(E.compensation)}</span>
          <button type="button" class="nw-match-apply" data-apply="${k(E.code)}">Apply ${g("arrow-right")}</button>
        </div>
      </div>`};return`
    <!-- Greeting -->
    <div class="nw-overview-header">
      <div class="nw-overview-date">Overview · ${l}</div>
      <h1 class="nw-overview-greeting">
        Hi ${S(mt())},
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
            stroke-dasharray="${d.toFixed(1)}" stroke-dashoffset="${u.toFixed(1)}"
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
          ${a.map(L=>`
            <div class="nw-check-pill${L.done?" done":""}">
              ${g(L.done?"check":"circle")} ${L.label}
            </div>`).join("")}
        </div>
        <div class="nw-readiness-actions">
          <button class="nw-finish-btn" type="button" data-page="profile">
            Finish profile ${g("arrow-right")}
          </button>
          <span class="nw-readiness-count">${t} of ${n} complete</span>
        </div>
      </div>
    </div>`}

    <!-- Stat tiles -->
    <div class="nw-stat-grid">
      ${p("Open matches",o.jobs.length,o.jobs.length?`${o.jobs.length} role${o.jobs.length>1?"s":""} waiting`:"Complete profile to unlock","#10A07C","sparkles")}
      ${p("Applications",s.length,s.length?`${i||"0"} need your input`:"Not applied yet","#EC4E7E","send")}
      ${p("Interviews",s.filter(L=>String(L.stage||L.status||"").toLowerCase().includes("interview")).length,"Scheduled","Not yet scheduled","#F4A52E")}
      ${p("CVs saved",(((N=o.candidate)==null?void 0:N.cvLibrary)||[]).length,"In your library","Upload your first CV","#3B82F6")}
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
        ${s.length?s.slice(0,4).map((L,E)=>h(L,E===Math.min(s.length,4)-1)).join(""):`<div class="nw-empty">
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
            <div class="nw-recruiter-avatar">${r.initials||"NW"}</div>
            <div>
              <div class="nw-recruiter-name">${S(r.name||"Nearwork Support")}</div>
              <div class="nw-recruiter-role">${S(r.role||"Talent Partner")}</div>
            </div>
          </div>
          <p class="nw-recruiter-bio">I'll review every match and prep you before each interview. Reach out anytime.</p>
          <div class="nw-recruiter-btns">
            <a class="nw-recruiter-msg" href="mailto:${k(r.email||"support@nearwork.co")}">${g("message-square-text")} Message</a>
            <a class="nw-recruiter-call" href="https://wa.me/${encodeURIComponent((r.whatsapp||"+1").replace(/\D/g,""))}" target="_blank" rel="noreferrer">${g("calendar-plus")} WhatsApp</a>
          </div>
        </section>
      </div>
    </div>

    <!-- Top matches -->
    ${c.length?`
      <section class="nw-matches-section">
        <div class="nw-panel-head">
          <div>
            <div class="nw-panel-overline">Picked for you</div>
            <div class="nw-panel-title">Top matches this week</div>
          </div>
          <button class="nw-ghost-btn" type="button" data-page="matches">See all ${g("arrow-right")}</button>
        </div>
        <div class="nw-match-grid">
          ${c.map(L=>x(L)).join("")}
        </div>
      </section>
    `:""}
  `}const Mn=["Customer Success","Sales / SDR","Operations","Finance & Accounting","Marketing","Design","Engineering","Data","People / HR","Executive Assistant"],_n=["Google search","LinkedIn","A friend or colleague","ChatGPT","Claude","Instagram or TikTok","A Nearwork recruiter","Another job board","Other"],qn=["HubSpot","Salesforce","Zendesk","Excel","SQL","Notion","Figma","Churn analysis","Onboarding","QBRs","Process design"],In={basic:"A2",intermediate:"B1",advanced:"B2",fluent:"C1"},Ka={"Customer Success":"Customer Success",Sales:"Sales / SDR",Support:"Customer Success",Operations:"Operations",Marketing:"Marketing",Engineering:"Engineering",Finance:"Finance & Accounting","Human Resources":"People / HR"};function Dn(){return""}function Un(e){const a=String(e||"").toUpperCase();return a?a.includes("NATIVE")||a.startsWith("C")?"fluent":a.startsWith("B2")?"advanced":a.startsWith("B")?"intermediate":a.startsWith("A")?"basic":"":""}function Bn(){var r;if(Qe)return;Qe=!0,ue=0,$a=!1;const e=o.candidate||{},a=String(e.name||"").trim().split(/\s+/).filter(Boolean),t=e.location||[e.city||e.locationCity,e.department||e.locationDepartment].filter(Boolean).join(", ")||"",n=Array.isArray(e.workHistory)&&e.workHistory.length?e.workHistory.map(d=>({title:d.title||"",company:d.company||"",from:d.from||"",to:(d.to==="present"?"":d.to)||"",current:d.to==="present"||!!d.current,open:!1})):[],s=Array.isArray(e.certifications)&&e.certifications.length?e.certifications.map(d=>({kind:"cert",title:d.name||d.title||"",school:d.issuer||d.school||"",year:d.date||d.year||"",open:!1})):[];Array.isArray(e.education)&&e.education.forEach(d=>s.push({kind:"degree",title:d.degree||d.title||"",school:d.institution||d.school||"",year:d.year||"",open:!1}));const i=Number(e.expectedSalaryUSD||e.salaryUSD||0)||"",c=String(e.linkedin||"").replace(/^https?:\/\//,"").replace(/^(www\.)?linkedin\.com\/in\//,"");$={cv:e.activeCvName||null,first:e.firstName||a[0]||"",last:e.lastName||a.slice(1).join(" ")||"",email:e.email||((r=o.user)==null?void 0:r.email)||"",phone:String(e.phone||e.whatsapp||"").replace(/^\+?57\s?/,""),city:t,linkedin:c,english:e.englishLevel||Un(e.english),roles:n,education:s,skills:Array.isArray(e.skills)?[...new Set(e.skills.map(Ce).filter(Boolean))]:[],functions:Array.isArray(e.functions)&&e.functions.length?[...e.functions]:Ka[e.roleGroup]?[Ka[e.roleGroup]]:[],workType:e.workType||"full",availability:e.startAvailability||"2w",salaryMin:e.expectedSalaryMinUSD||i||"",salaryMax:e.expectedSalaryMaxUSD||i||"",portfolio:String(e.portfolio||"").replace(/^https?:\/\//,""),files:Array.isArray(e.attachments)?[...e.attachments]:[],source:e.source||"",sourceOther:e.sourceOther||"",shareProfile:e.shareProfile!==!1,notifyMatches:e.notifyMatches!==!1,notifyNews:e.notifyNews===!0,summary:e.summary||"",_cvFlags:{}},We=null,Se=$.cv?"done":"idle",ye=$.cv?4:0}function T(e,a=16,t=""){return`<span class="onb2-i" style="--isz:${a}px;${t?`color:${t};`:""}">${g(e)}</span>`}function Ct(e){return`<div class="onb2-wm" style="font-size:${e||22}px">Near<span>work</span></div>`}function Rn(){Bn(),Xe.innerHTML=`
    <div class="onb2-page">
      <aside class="onb2-rail" id="onb2Rail"></aside>
      <div class="onb2-col">
        <div class="onb2-topbar" id="onb2Topbar"></div>
        <main class="onb2-main">
          <div class="onb2-savebar" id="onb2Savebar"></div>
          <div class="onb2-card" id="onb2Card"></div>
          <div id="onb2Footer"></div>
        </main>
      </div>
    </div>`,D(ue)}function D(e){ue=e;const a=document.querySelector("#onb2Card");if(!a)return;const t=document.querySelector("#onb2Rail"),n=document.querySelector("#onb2Topbar"),s=document.querySelector("#onb2Footer"),i=document.querySelector("#onb2Savebar");t&&(t.innerHTML=$t()),n&&(n.innerHTML=On()),i&&(i.innerHTML=e<4?`<button type="button" class="onb2-linkrow" data-onb-save-exit>Save &amp; finish later ${T("log-out",14,"#9E9E9E")}</button>`:""),a.innerHTML=zn(e),a.classList.remove("onb2-card"),a.offsetWidth,a.classList.add("onb2-card"),s&&(s.innerHTML=e<4?jn(e):""),ce(),ns(e),e===4&&ls()}function $t(){const e=[["Your CV","20 sec"],["About you","40 sec"],["Experience","45 sec"],["What you want","45 sec"]],a=_a();return`
    <div>
      <div style="margin-bottom:34px">${Ct()}</div>
      <div style="display:flex;flex-direction:column;gap:2px">
        ${e.map((t,n)=>{const s=n<ue;return`<button type="button" class="onb2-railstep ${n===ue?"is-on":""} ${s?"is-done":""}" data-onb-nav="${n}">
            <span class="onb2-railnum">${s?T("check",12,"#fff"):n+1}</span>
            <span><span class="onb2-railstep-label">${t[0]}</span><span class="onb2-railstep-hint">${t[1]}</span></span>
          </button>`}).join("")}
      </div>
    </div>
    <div style="display:flex;flex-direction:column;gap:14px">
      ${Fn()}
      <div style="padding-top:14px;border-top:1px solid var(--onb2-g200)">
        <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:7px">
          <span style="font-size:12px;font-weight:600;color:var(--onb2-g600)">Profile strength</span>
          <span style="font-size:12px;color:var(--onb2-accent-ink);font-weight:500" id="onb2StrengthPct">${a}%</span>
        </div>
        <div class="onb2-meter"><div class="onb2-meter-fill" id="onb2StrengthBar" style="width:${a}%"></div></div>
      </div>
      <div style="display:flex;align-items:center;gap:9px;font-size:12px;color:var(--onb2-g500)">
        ${T("lock",13,"#9E9E9E")}<span>Private until you say otherwise</span>
      </div>
    </div>`}function Fn(){if(Se==="idle")return`<div class="onb2-parsecard is-idle">${T("scan-line",15,"#9E9E9E")}<span style="font-size:12.3px;line-height:1.45;color:var(--onb2-g500)">Add a CV and we'll fill the rest of this form for you.</span></div>`;const e=Se==="done",a=$.roles.length,t=$.education.length,n=$.skills.length,s=[["file-text","Reading your document"],["briefcase",`Work history · ${a} role${a===1?"":"s"}`],["graduation-cap",`Education · ${t} ${t===1?"entry":"entries"}`],["tags",`Skills · ${n} found`]];return`<div class="onb2-parsecard ${e?"is-done":""}">
    <div style="display:flex;align-items:center;gap:9px;margin-bottom:11px">
      ${e?T("check-circle",15,"#10A07C"):'<span class="onb2-spin" style="width:14px;height:14px;border-radius:50%;border:2px solid var(--onb2-g200);border-top-color:var(--onb2-accent);display:inline-block"></span>'}
      <span style="font-size:11px;letter-spacing:0.05em;color:${e?"var(--onb2-accent-ink)":"var(--onb2-g500)"};font-weight:600">${e?"CV IMPORTED":"READING CV…"}</span>
    </div>
    <div style="display:flex;flex-direction:column;gap:8px">
      ${s.map((i,c)=>{const r=ye>c;return`<div style="display:flex;align-items:center;gap:9px;opacity:${r?1:.4};transition:opacity 300ms">
          ${T(r?"check":i[0],13,r?"#10A07C":"#9E9E9E")}
          <span style="font-size:12.3px;color:${r?"var(--onb2-g700)":"var(--onb2-g500)"}">${i[1]}</span>
        </div>`}).join("")}
    </div>
  </div>`}function On(){return`
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
      ${Ct(19)}
      <span style="font-size:11.5px;letter-spacing:0.04em;color:var(--onb2-g500);font-weight:600">${ue>=4?"DONE":`${ue+1} / 4`}</span>
    </div>
    <div style="height:4px;border-radius:999px;background:var(--onb2-g200);overflow:hidden">
      <div style="width:${(Math.min(ue,4)+1)/5*100}%;height:100%;background:linear-gradient(90deg,#10A07C,#AF7AC5);transition:width 400ms cubic-bezier(0.16,1,0.3,1)"></div>
    </div>`}function jn(e){const a=qa(e),t=!!$.cv,n=e===0?t?"Continue while it reads":"Continue":e===3?$.first?`Finish, ${S($.first)}`:"Finish and go live":"Continue",s=e===0&&!t;return`
    <div class="onb2-footer">
      <div id="onb2Blocker">${a?`<div class="onb2-blocker">${T("info",14,"#E74C7C")}${S(a)}</div>`:""}</div>
      <div class="onb2-footer-row">
        ${e>0?`<button type="button" class="onb2-btn onb2-btn-ghost" data-onb-back>${T("arrow-left",17,"#555555")}Back</button>`:""}
        <button type="button" class="onb2-btn onb2-btn-primary" id="onb2Next" data-onb-next ${a?"disabled":""}>${n}${T("arrow-right",17,"#fff")}</button>
        ${s?'<button type="button" class="onb2-linkrow" data-onb-skip style="text-decoration:underline;text-underline-offset:3px">Skip for now</button>':""}
        <span class="onb2-saved">${T("cloud",14,"#9E9E9E")}Saved automatically</span>
      </div>
    </div>`}function kt(){return($.roles||[]).filter(e=>e.title&&e.company)}function _a(e){const a=$,t=kt().length;return Math.min(100,Math.round(5+(a.cv?14:0)+(a.first?4:0)+(a.last?4:0)+(a.phone?5:0)+(a.city?5:0)+(a.linkedin?6:0)+Math.min(18,t*9)+Math.min(8,a.education.filter(n=>n.title).length*4)+Math.min(12,a.skills.length*1.5)+Math.min(6,a.functions.length*3)+(Number(a.salaryMin)&&Number(a.salaryMax)?4:0)+(a.portfolio||a.files.length?3:0)+(a.shareProfile?3:0)+(e||ue>=4?3:0)))}function qa(e){const a=$;return e===1?!a.first||!a.last?"Add your first and last name to continue.":a.phone?a.city?null:"Let us know where you’re based.":"Add a phone number so companies can schedule interviews.":e===2?kt().length?a.skills.length<3?"Pick at least 3 skills so we can match you (more is better).":null:"Add at least one role — job title and company.":e===3?a.functions.length?!Number(a.salaryMin)||!Number(a.salaryMax)?"Add your salary range — companies filter on it.":a.shareProfile?null:"We need permission to show your profile to companies.":"Pick at least one type of role you’re open to.":null}function At(){const e=$.functions&&$.functions[0]||"";return{Engineering:[1800,3400],Data:[1700,3200],Design:[1500,2800],"Finance & Accounting":[1500,2600],Marketing:[1400,2600]}[e]||[1400,2300]}function X(e){const a=`class="onb2-input" ${e.textarea?'rows="3"':`type="${e.type||"text"}"`} ${e.locked?"disabled":""} placeholder="${k(e.placeholder||"")}" ${e.data||""}`,t=e.textarea?`<textarea ${a}>${S(e.value||"")}</textarea>`:`<input ${a} value="${k(e.value==null?"":e.value)}" />`;return`<label class="onb2-fieldwrap">
    <div class="onb2-fieldhead">
      <span class="onb2-fieldlabel">${S(e.label)}${e.req?'<span class="onb2-req" title="Required">*</span>':""}${e.badge?`<span class="onb2-badge">${T("sparkles",10,"#10A07C")}${S(e.badge)}</span>`:""}</span>
      ${e.aside||""}
    </div>
    <div class="onb2-fieldbox ${e.locked?"is-locked":""}">
      ${e.prefix?`<span class="onb2-prefix">${S(e.prefix)}</span>`:""}
      ${t}
      ${e.trailing||""}
    </div>
    ${e.hint?`<div class="onb2-fieldhint">${e.hint}</div>`:""}
  </label>`}function xa(e,a,t,n){return`<div class="onb2-seg" style="grid-template-columns:repeat(${a.length},minmax(0,1fr))">
    ${a.map(s=>`<button type="button" class="onb2-seg-btn ${s.v===t?"is-on":""}" data-onb-seg="${e}" data-onb-val="${k(s.v)}">${S(s.label)}${n&&s.sub?`<div class="onb2-seg-sub">${S(s.sub)}</div>`:""}</button>`).join("")}
  </div>`}function Ea(e,a,t,n){return`<div class="onb2-chips">
    ${a.map(s=>{const i=t.includes(s);return`<button type="button" class="onb2-chip ${i?"is-on":""}" data-onb-chip="${e}" data-onb-val="${k(s)}">${i?T("check",13,"#10A07C"):""}${S(s)}</button>`}).join("")}
    ${n?`<span class="onb2-chip-add"><input type="text" placeholder="Add your own" data-onb-chip-input="${e}" /><button type="button" data-onb-chip-add="${e}" aria-label="Add">${T("plus",14,"#757575")}</button></span>`:""}
  </div>`}function ya(e,a,t,n,s){return`<div class="onb2-toggle ${n?"is-on":""} ${s?"is-required":""}" data-onb-toggle="${e}" ${s?'data-onb-required="1"':""}>
    <div style="flex:1">
      <div class="onb2-toggle-title">${S(a)}${s?'<span class="onb2-toggle-req">REQUIRED</span>':""}</div>
      <p class="onb2-toggle-desc">${S(t)}</p>
    </div>
    <div class="onb2-switch"><div class="onb2-knob"></div></div>
  </div>`}function ua(e,a,t,n){return`<div style="margin-bottom:26px">
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px">
      <span class="onb2-eyebrow">${S(e)}</span>
      ${a?`<span class="onb2-eyebrow-dot"></span><span class="onb2-minutes">${S(a)}</span>`:""}
    </div>
    <h1 class="onb2-title">${S(t)}</h1>
    <p class="onb2-sub">${S(n)}</p>
  </div>`}function me(e){return`<div>
    <div style="display:flex;justify-content:space-between;align-items:baseline;gap:12px;margin-bottom:${e.hint?4:9}px">
      <span class="onb2-grouplabel">${S(e.label)}${e.req?'<span class="onb2-req">*</span>':""}</span>
      ${e.aside||""}
    </div>
    ${e.hint?`<div class="onb2-grouphint" style="margin-bottom:10px">${e.hint}</div>`:""}
    ${e.body}
  </div>`}function zn(e){switch(e){case 0:return Hn();case 1:return Vn();case 2:return Jn();case 3:return Zn();case 4:return Kn();default:return""}}function Hn(){const e=!!$.cv,a=Math.round(ye/4*100),t=e?`<div class="onb2-filecard">
        <div style="display:flex;align-items:center;gap:14px">
          <div style="width:42px;height:42px;border-radius:11px;background:#fff;border:1px solid var(--onb2-accent-border);display:inline-flex;align-items:center;justify-content:center;flex-shrink:0">${T("file-text",19,"#10A07C")}</div>
          <div style="flex:1;min-width:0">
            <div style="font-size:14.5px;font-weight:600;color:var(--onb2-black);letter-spacing:-0.01em;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${S($.cv)}</div>
            <div style="font-size:12.5px;color:var(--onb2-g600);margin-top:3px" id="onb2CvStatus">${Se==="done"?"Imported":`Reading (${a}%)`}</div>
          </div>
          <button type="button" data-onb-cv-remove aria-label="Remove CV" style="background:transparent;border:none;cursor:pointer;padding:8px;border-radius:9px;display:inline-flex">${T("x",17,"#757575")}</button>
        </div>
        ${Se!=="done"?`<div style="height:5px;border-radius:999px;background:rgba(255,255,255,0.7);margin-top:14px;overflow:hidden"><div id="onb2CvBar" style="width:${Math.max(8,a)}%;height:100%;background:var(--onb2-accent);border-radius:999px;transition:width 600ms cubic-bezier(0.16,1,0.3,1)"></div></div>`:""}
      </div>`:`<div class="onb2-dropzone" id="onb2Dropzone">
        <input type="file" id="onb2CvInput" accept=".pdf,.doc,.docx" style="display:none" />
        <div style="width:54px;height:54px;border-radius:16px;background:var(--onb2-accent-bg);border:1px solid var(--onb2-accent-border);display:inline-flex;align-items:center;justify-content:center;margin-bottom:16px">${T("upload-cloud",24,"#10A07C")}</div>
        <div style="font-size:16.5px;font-weight:600;color:var(--onb2-black);letter-spacing:-0.02em">Drop your CV here, or browse</div>
        <div style="font-size:13.5px;color:var(--onb2-g500);margin-top:7px">PDF, DOC or DOCX · up to 10 MB · English or Spanish</div>
      </div>`;return`<div>
    ${ua("STEP 01 · YOUR CV","20 SEC","Start with your CV.","Drop it in and we'll read it while you answer a few short questions — no retyping your whole career.")}
    ${t}
    <div style="margin-top:14px">
      <button type="button" class="onb2-import" data-onb-manual>
        ${T("pencil-line",17,"#10A07C")}
        <span style="flex:1"><span style="display:block;font-size:14px;font-weight:600;color:var(--onb2-black);letter-spacing:-0.01em">Enter my details manually</span><span style="display:block;font-size:12.5px;color:var(--onb2-g500);margin-top:3px">No CV handy? It takes about 3 minutes</span></span>
        ${T("arrow-right",16,"#9E9E9E")}
      </button>
    </div>
    <div style="display:flex;gap:11px;align-items:flex-start;margin-top:22px;padding:14px 16px;background:var(--onb2-g50);border-radius:12px">
      ${T("shield-check",16,"#757575")}
      <p style="font-size:12.8px;line-height:1.5;color:var(--onb2-g600);margin:0">Your CV is only used to build your profile. Nothing is shared with a company until you approve it on the last step.</p>
    </div>
  </div>`}function Vn(){const e=$,a=!!e.cv,t=e._cvFlags||{};return`<div>
    ${ua("STEP 02 · ABOUT YOU","40 SEC",a&&e.first?`Nice to meet you, ${e.first}.`:"Tell us who you are.",a?"We pulled these from your CV — fix anything that looks off.":"The basics a hiring team needs to reach you.")}
    <div style="display:flex;flex-direction:column;gap:18px">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px" class="onb2-two">
        ${X({label:"First name",req:!0,value:e.first,placeholder:"Camila",badge:t.first?"CV":null,data:'data-onb-field="first"'})}
        ${X({label:"Last name",req:!0,value:e.last,placeholder:"Restrepo",badge:t.last?"CV":null,data:'data-onb-field="last"'})}
      </div>
      ${X({label:"Email",req:!0,value:e.email,locked:!0,trailing:`<span class="onb2-verified">${T("check",12,"#16A34A")}Verified</span>`})}
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px" class="onb2-two">
        ${X({label:"WhatsApp / phone",req:!0,prefix:"+57",value:e.phone,placeholder:"300 123 4567",hint:"Used for interview scheduling only.",data:'data-onb-field="phone"'})}
        ${X({label:"Where you’re based",req:!0,value:e.city,placeholder:"Medellín, Colombia",badge:t.city?"CV":null,hint:"We match you to overlapping US time zones.",data:'data-onb-field="city"'})}
      </div>
      ${X({label:"LinkedIn",prefix:"linkedin.com/in/",value:e.linkedin,placeholder:"your-handle",hint:"Optional, but profiles with LinkedIn get shortlisted ~2× more often.",data:'data-onb-field="linkedin"'})}
      ${me({label:"English level",req:!0,hint:"Be honest — we place people at every level, and we'll never put you in an interview you can't win.",body:xa("english",[{v:"basic",label:"Basic",sub:"A1–A2"},{v:"intermediate",label:"Intermediate",sub:"B1"},{v:"advanced",label:"Advanced",sub:"B2"},{v:"fluent",label:"Fluent",sub:"C1+"}],e.english,!0)})}
    </div>
  </div>`}function Gn(e,a){const t=e.open,n=(e.company||"?").slice(0,2).toUpperCase(),s=[e.company,e.from&&`${e.from} – ${e.current?"Present":e.to||""}`].filter(Boolean).join(" · ")||"Add the details";return`<div class="onb2-ecard ${t?"is-open":""}">
    <div class="onb2-ecard-head">
      <div class="onb2-ecard-icon">${S(n)}</div>
      <div style="flex:1;min-width:0">
        <div class="onb2-ecard-title">${S(e.title||"New role")}</div>
        <div class="onb2-ecard-meta">${S(s)}</div>
      </div>
      ${e.current?'<span class="onb2-current-chip">CURRENT</span>':""}
      <button type="button" class="onb2-ecard-edit" data-onb-role-edit="${a}">${t?"Done":"Edit"}${T(t?"chevron-up":"chevron-down",14,"#10A07C")}</button>
    </div>
    ${t?`<div class="onb2-ecard-body">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px" class="onb2-two">
        ${X({label:"Job title",value:e.title,placeholder:"Customer Success Manager",data:`data-onb-rolefield="title" data-onb-idx="${a}"`})}
        ${X({label:"Company",value:e.company,placeholder:"Rappi",data:`data-onb-rolefield="company" data-onb-idx="${a}"`})}
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px" class="onb2-two">
        ${X({label:"Started",value:e.from,placeholder:"Mar 2022",data:`data-onb-rolefield="from" data-onb-idx="${a}"`})}
        ${X({label:"Ended",value:e.current?"":e.to,placeholder:"Present",locked:e.current,data:`data-onb-rolefield="to" data-onb-idx="${a}"`})}
      </div>
      <div style="display:flex;align-items:center;justify-content:space-between;gap:12px">
        <button type="button" data-onb-role-current="${a}" style="display:inline-flex;align-items:center;gap:9px;background:transparent;border:none;cursor:pointer;font:inherit;font-size:13.5px;color:var(--onb2-g700)">
          <span style="width:18px;height:18px;border-radius:5px;border:1.5px solid ${e.current?"var(--onb2-accent)":"var(--onb2-g300)"};background:${e.current?"var(--onb2-accent)":"#fff"};display:inline-flex;align-items:center;justify-content:center">${e.current?T("check",12,"#fff"):""}</span>
          I still work here
        </button>
        <button type="button" data-onb-role-remove="${a}" style="background:transparent;border:none;cursor:pointer;font:inherit;font-size:13px;color:var(--onb2-g500);display:inline-flex;align-items:center;gap:6px">${T("trash-2",14,"#9E9E9E")}Remove</button>
      </div>
    </div>`:""}
  </div>`}function Qn(e,a){const t=e.open,n=e.kind==="cert",s=[e.school,e.year].filter(Boolean).join(" · ")||"Add the details";return`<div class="onb2-ecard ${t?"is-open":""}">
    <div class="onb2-ecard-head">
      <div class="onb2-ecard-icon">${T(n?"award":"graduation-cap",17,"#757575")}</div>
      <div style="flex:1;min-width:0">
        <div class="onb2-ecard-title">${S(e.title||(n?"New certification":"New education"))}</div>
        <div class="onb2-ecard-meta">${S(s)}</div>
      </div>
      <button type="button" class="onb2-ecard-edit" data-onb-edu-edit="${a}">${t?"Done":"Edit"}${T(t?"chevron-up":"chevron-down",14,"#10A07C")}</button>
    </div>
    ${t?`<div class="onb2-ecard-body">
      ${X({label:n?"Certification or course":"Degree or programme",value:e.title,placeholder:n?"Project Management Professional (PMP)":"BSc Business Administration",data:`data-onb-edufield="title" data-onb-idx="${a}"`})}
      <div style="display:grid;grid-template-columns:1.6fr 1fr;gap:12px" class="onb2-two">
        ${X({label:n?"Issued by":"Institution",value:e.school,placeholder:n?"PMI":"Universidad EAFIT",data:`data-onb-edufield="school" data-onb-idx="${a}"`})}
        ${X({label:n?"Year earned":"Year finished",value:e.year,placeholder:"2023",data:`data-onb-edufield="year" data-onb-idx="${a}"`})}
      </div>
      <button type="button" data-onb-edu-remove="${a}" style="align-self:flex-start;background:transparent;border:none;cursor:pointer;font:inherit;font-size:13px;color:var(--onb2-g500);display:inline-flex;align-items:center;gap:6px">${T("trash-2",14,"#9E9E9E")}Remove</button>
    </div>`:""}
  </div>`}function Wn(e){const t=e===0?"Pick at least 3":e<3?`${3-e} more to continue`:e<8?`${e} selected · ${8-e} more unlocks more alerts`:`${e} selected · great coverage`,n=e>=3?"var(--onb2-accent)":"#EAB308";return`<span style="display:inline-flex;align-items:center;gap:9px">
    <span style="width:62px;height:5px;border-radius:999px;background:var(--onb2-g200);overflow:hidden;display:inline-block"><span style="display:block;width:${Math.min(100,e/8*100)}%;height:100%;background:${n};transition:width 300ms"></span></span>
    <span style="font-size:11.5px;color:${e>=3?"var(--onb2-g500)":"#CA8A04"};font-weight:500">${S(t)}</span>
  </span>`}function Jn(){const e=$,a=!!e.cv;return`<div>
    ${ua("STEP 03 · EXPERIENCE","45 SEC",a?e.first?`${e.first}, check your history.`:"Check your work history.":"Add your work history.",a?"Straight from your CV. Confirm the last two roles — that's all companies really read.":"Your two most recent roles are enough to get started.")}
    ${me({label:"Work history",req:!0,body:`<div style="display:flex;flex-direction:column;gap:12px">
      ${e.roles.map((t,n)=>Gn(t,n)).join("")}
      <button type="button" class="onb2-addtile" data-onb-role-add>${T("plus",16)}Add another role</button>
    </div>`})}
    <div style="margin-top:26px">
      ${me({label:"Education & certifications",hint:a?"Pulled from your CV. Add any course or certificate that isn't listed — a project management course, a Google or HubSpot cert, a bootcamp. They count.":"Degrees, courses, bootcamps and certificates — a project management course counts as much as a degree here.",body:`<div style="display:flex;flex-direction:column;gap:12px">
        ${e.education.map((t,n)=>Qn(t,n)).join("")}
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px" class="onb2-two">
          <button type="button" class="onb2-addtile" data-onb-edu-add="degree">${T("graduation-cap",16)}Add education</button>
          <button type="button" class="onb2-addtile" data-onb-edu-add="cert">${T("award",16)}Add certification</button>
        </div>
      </div>`})}
    </div>
    <div style="margin-top:26px">
      ${me({label:"Your skills",req:!0,hint:a?"Add as many as you honestly have — every skill is another job alert we can send you. Tap to remove anything you'd rather not be matched on.":"Add as many as you honestly have. Each one is another job alert we can send you when something opens up.",aside:Wn(e.skills.length),body:Ea("skills",[...new Set([...e.skills,...qn])],e.skills,!0)})}
    </div>
  </div>`}function Yn(){const e=$,a=At(),t=Number(e.salaryMin)||0,n=t>=a[0]-400&&t<=a[1],s=`$${a[0].toLocaleString("en-US")}–$${a[1].toLocaleString("en-US")}/mo`,i=e.functions&&e.functions[0]||"These",c=n?`Similar ${S(i)} profiles are placed at <strong style="color:var(--onb2-black)">${s}</strong>. Your range is right in the market.`:`Heads up: most roles like yours pay <strong style="color:var(--onb2-black)">${s}</strong>. A range outside that will limit your matches.`;return me({label:"Monthly salary expectation (USD)",req:!0,hint:"Give a range you'd genuinely accept. Companies filter on this, so a wider range means more matches.",body:`<div style="display:flex;flex-direction:column;gap:12px">
    <div style="display:grid;grid-template-columns:1fr auto 1fr;gap:12px;align-items:end">
      ${X({label:"Minimum",prefix:"$",value:e.salaryMin,placeholder:"1,500",data:'data-onb-field="salaryMin" inputmode="numeric"'})}
      <span style="padding-bottom:14px;color:var(--onb2-g400);font-size:14px">to</span>
      ${X({label:"Ideal",prefix:"$",value:e.salaryMax,placeholder:"2,200",data:'data-onb-field="salaryMax" inputmode="numeric"'})}
    </div>
    <div id="onb2SalaryCallout" style="display:flex;gap:11px;align-items:flex-start;padding:13px 15px;background:${n?"#F0FDF4":"#FEFCE8"};border:1px solid ${n?"#DCFCE7":"#FEF9C3"};border-radius:12px">
      ${T(n?"trending-up":"info",15,n?"#16A34A":"#CA8A04")}
      <p style="font-size:12.8px;line-height:1.5;color:var(--onb2-g700);margin:0">${c}</p>
    </div>
  </div>`})}function Zn(){const e=$;return`<div>
    ${ua("STEP 04 · WHAT YOU WANT","45 SEC",e.first?`Last part, ${e.first}.`:"Last part.","This decides which roles reach you — and it's the only thing we can't read off a CV.")}
    <div style="display:flex;flex-direction:column;gap:24px">
      ${me({label:"Roles you’re open to",req:!0,hint:"Pick up to three. You can change this any time.",body:Ea("functions",Mn,e.functions,!1)})}
      ${me({label:"Work type",req:!0,body:xa("workType",[{v:"full",label:"Full-time"},{v:"part",label:"Part-time"},{v:"contract",label:"Contract"}],e.workType)})}
      ${me({label:"When can you start?",body:xa("availability",[{v:"now",label:"Right away"},{v:"2w",label:"In 2 weeks"},{v:"1m",label:"In a month"},{v:"look",label:"Just browsing"}],e.availability)})}
      ${Yn()}
      ${me({label:"Anything else worth showing?",hint:"Portfolio, case study, certificate, reference letter — optional, but it helps for design, marketing and data roles.",body:`<div style="display:flex;flex-direction:column;gap:10px">
        ${X({label:"Portfolio or website",prefix:"https://",value:e.portfolio,placeholder:"camila.design",data:'data-onb-field="portfolio"'})}
        <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:2px">
          <input type="file" id="onb2FileInput" multiple style="display:none" />
          ${e.files.map(a=>`<span style="display:inline-flex;align-items:center;gap:8px;background:#fff;border:1.5px solid var(--onb2-g200);border-radius:999px;padding:7px 8px 7px 13px;font-size:13px;color:var(--onb2-g700)">${T("paperclip",13,"#757575")}${S(a)}<button type="button" data-onb-file-remove="${k(a)}" aria-label="Remove file" style="background:transparent;border:none;cursor:pointer;padding:3px;display:inline-flex">${T("x",13,"#9E9E9E")}</button></span>`).join("")}
          <button type="button" data-onb-file-add style="display:inline-flex;align-items:center;gap:7px;background:#fff;border:1.5px dashed var(--onb2-g300);border-radius:999px;padding:7px 14px;cursor:pointer;font:inherit;font-size:13px;font-weight:600;color:var(--onb2-g600)">${T("plus",13,"#757575")}Attach a file</button>
        </div>
      </div>`})}
      ${me({label:"How did you hear about Nearwork?",hint:"Optional — it just helps us reach more people like you.",body:`<div style="display:flex;flex-direction:column;gap:10px">
        ${Ea("source",_n,e.source?[e.source]:[],!1)}
        ${e.source==="Other"?X({label:"Where exactly?",value:e.sourceOther,placeholder:"A podcast, a university fair, a Slack group…",data:'data-onb-field="sourceOther"'}):""}
      </div>`})}
      <div>
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px">
          <span style="font-size:10.5px;letter-spacing:0.12em;color:var(--onb2-g500)">PERMISSIONS</span>
          <span style="flex:1;height:1px;background:var(--onb2-g100)"></span>
        </div>
        <div style="display:flex;flex-direction:column;gap:10px">
          ${ya("shareProfile","Show my profile to vetted Nearwork companies","Hiring teams see your experience, skills and salary range — never your phone, email or exact address until you accept an interview.",e.shareProfile,!0)}
          ${ya("notifyMatches","Email me when a role matches","A short note when something fits — roughly once a week, never more than twice.",e.notifyMatches,!1)}
          ${ya("notifyNews","Send me interview tips and salary reports","Our monthly guide to landing US roles from Latin America.",e.notifyNews,!1)}
        </div>
        <p style="font-size:12.3px;line-height:1.55;color:var(--onb2-g500);margin:14px 0 0">By finishing you agree to the <a href="https://www.nearwork.co/terms" target="_blank" rel="noreferrer" style="color:var(--onb2-accent-ink);font-weight:600">Terms</a> and <a href="https://www.nearwork.co/privacy" target="_blank" rel="noreferrer" style="color:var(--onb2-accent-ink);font-weight:600">Privacy Policy</a>. You can export or delete everything from your settings at any time.</p>
      </div>
    </div>
  </div>`}function Kn(){const e=$,a=e.functions.length?S(e.functions[0]):"New",t=[{icon:"clipboard-check",title:"Take your 12-minute assessment",desc:"One short skills + working-style check. Profiles with it get 3× more interviews.",cta:"Start now",act:"assessment"},{icon:"search",title:"See who’s hiring right now",desc:`${a} roles inside your salary range are live today.`,cta:"See roles",act:"jobs"}];return`<div style="max-width:560px">
    <canvas class="onb2-confetti" id="onb2Confetti"></canvas>
    <div class="onb2-done-badge">${T("check",28,"#fff")}</div>
    <h1 class="onb2-title" style="font-size:clamp(28px,3.2vw,36px)">You're in, ${e.first?S(e.first):"there"}.</h1>
    <p style="font-size:15.5px;line-height:1.55;color:var(--onb2-g600);margin:12px 0 0">Your profile is live with our matching team. Most candidates hear about their first role within 10 days.</p>
    <div style="display:flex;flex-direction:column;gap:10px;margin-top:30px">
      ${t.map(n=>`<div style="display:flex;gap:14px;align-items:center;background:#fff;border:1.5px solid var(--onb2-g200);border-radius:14px;padding:16px 17px">
        <div style="width:38px;height:38px;border-radius:11px;background:var(--onb2-accent-bg);border:1px solid var(--onb2-accent-border);display:inline-flex;align-items:center;justify-content:center;flex-shrink:0">${T(n.icon,17,"#10A07C")}</div>
        <div style="flex:1"><div style="font-size:14.5px;font-weight:600;color:var(--onb2-black);letter-spacing:-0.01em">${S(n.title)}</div><div style="font-size:12.8px;color:var(--onb2-g600);margin-top:3px;line-height:1.45">${S(n.desc)}</div></div>
        <button type="button" class="onb2-btn onb2-btn-soft is-sm" data-onb-done-act="${n.act}">${S(n.cta)}${T("arrow-right",17,"#10A07C")}</button>
      </div>`).join("")}
    </div>
    <div style="display:flex;gap:12px;align-items:center;margin-top:28px;padding-top:22px;border-top:1px solid var(--onb2-g100);flex-wrap:wrap">
      <button type="button" class="onb2-btn onb2-btn-primary" data-onb-done-act="dashboard">Go to my dashboard${T("arrow-right",17,"#fff")}</button>
      <button type="button" class="onb2-btn onb2-btn-ghost" data-onb-done-act="jobs">${T("search",17,"#555555")}Browse jobs</button>
    </div>
  </div>`}function Pa(){ia&&(clearInterval(ia),ia=null)}function Xa(e){if(!(/\.(pdf|docx?)$/i.test(e.name)||["application/pdf","application/msword","application/vnd.openxmlformats-officedocument.wordprocessingml.document"].includes(e.type))){alert("Please upload a PDF, DOC or DOCX file.");return}if(e.size>10*1024*1024){alert("That file is larger than 10 MB. Please upload a smaller CV.");return}We=e,$.cv=e.name,Se="parsing",ye=0,Pa(),ia=setInterval(()=>{ye<3&&(ye++,es())},800),D(0),La(e).then(t=>{Xn(t)}).catch(()=>{}).finally(()=>{Pa(),ye=4,Se="done",as()}),Y()}function Xn(e){if(!e)return;const a=$,t=a._cvFlags||(a._cvFlags={});if(e.name&&!a.first&&!a.last){const n=String(e.name).trim().split(/\s+/).filter(Boolean);a.first=Be(n[0]||""),a.last=Be(n.slice(1).join(" ")),t.first=!!a.first,t.last=!!a.last}e.phone&&!a.phone&&(a.phone=String(e.phone).replace(/^\+?57\s?/,"")),e.city&&!a.city&&(a.city=e.city,t.city=!0),Array.isArray(e.workHistory)&&e.workHistory.length&&!a.roles.length&&(a.roles=e.workHistory.slice(0,6).map(n=>({title:n.title||"",company:n.company||"",from:n.from||"",to:(n.to==="present"?"":n.to)||"",current:n.to==="present"||!!n.current,open:!1}))),Array.isArray(e.skills)&&e.skills.length&&(a.skills=[...new Set([...a.skills,...e.skills.map(Ce).filter(Boolean)])]),Array.isArray(e.certifications)&&e.certifications.length&&!a.education.length&&(a.education=e.certifications.map(n=>({kind:"cert",title:n.name||n.title||"",school:n.issuer||"",year:n.date||"",open:!1}))),e.summary&&!a.summary&&(a.summary=e.summary)}function es(){const e=document.querySelector("#onb2Rail");e&&(e.innerHTML=$t(),ce(),e.querySelectorAll("[data-onb-nav]").forEach(n=>n.addEventListener("click",()=>D(Number(n.dataset.onbNav)))));const a=document.querySelector("#onb2CvBar");a&&(a.style.width=Math.max(8,Math.round(ye/4*100))+"%");const t=document.querySelector("#onb2CvStatus");t&&(t.textContent=Se==="done"?"Imported":`Reading (${Math.round(ye/4*100)}%)`)}function as(){document.querySelector("#onb2Card")&&D(ue)}function ba(){const e=_a(),a=document.querySelector("#onb2StrengthPct");a&&(a.textContent=e+"%");const t=document.querySelector("#onb2StrengthBar");t&&(t.style.width=e+"%");const n=qa(ue),s=document.querySelector("#onb2Blocker");s&&(s.innerHTML=n?`<div class="onb2-blocker">${T("info",14,"#E74C7C")}${S(n)}</div>`:"",ce());const i=document.querySelector("#onb2Next");i&&(i.disabled=!!n)}function ts(){const e=document.querySelector("#onb2SalaryCallout");if(!e)return;const a=At(),t=Number($.salaryMin)||0,n=t>=a[0]-400&&t<=a[1],s=`$${a[0].toLocaleString("en-US")}–$${a[1].toLocaleString("en-US")}/mo`,i=$.functions&&$.functions[0]||"These";e.style.background=n?"#F0FDF4":"#FEFCE8",e.style.border=`1px solid ${n?"#DCFCE7":"#FEF9C3"}`,e.innerHTML=`${T(n?"trending-up":"info",15,n?"#16A34A":"#CA8A04")}<p style="font-size:12.8px;line-height:1.5;color:var(--onb2-g700);margin:0">${n?`Similar ${S(i)} profiles are placed at <strong style="color:var(--onb2-black)">${s}</strong>. Your range is right in the market.`:`Heads up: most roles like yours pay <strong style="color:var(--onb2-black)">${s}</strong>. A range outside that will limit your matches.`}`,ce()}function ns(e){var n,s,i,c,r,d,u,m;document.querySelectorAll("[data-onb-nav]").forEach(l=>l.addEventListener("click",()=>D(Number(l.dataset.onbNav)))),(n=document.querySelector("[data-onb-save-exit]"))==null||n.addEventListener("click",os),(s=document.querySelector("[data-onb-back]"))==null||s.addEventListener("click",()=>D(Math.max(0,e-1))),(i=document.querySelector("[data-onb-next]"))==null||i.addEventListener("click",()=>ss(e)),(c=document.querySelector("[data-onb-skip]"))==null||c.addEventListener("click",()=>D(1)),document.querySelectorAll("[data-onb-field]").forEach(l=>l.addEventListener("input",()=>{const p=l.dataset.onbField;let h=l.value;(p==="salaryMin"||p==="salaryMax")&&(h=h.replace(/\D/g,""),l.value=h),$[p]=h,(p==="salaryMin"||p==="salaryMax")&&ts(),ba(),Y()})),document.querySelectorAll("[data-onb-seg]").forEach(l=>l.addEventListener("click",()=>{$[l.dataset.onbSeg]=l.dataset.onbVal,D(e),Y()}));const a=(l,p)=>{if(p)if(l==="skills"){const h=Ce(p)||p;$.skills.includes(h)||$.skills.push(h)}else $[l].includes(p)||$[l].push(p)};document.querySelectorAll("[data-onb-chip]").forEach(l=>l.addEventListener("click",()=>{const p=l.dataset.onbChip,h=l.dataset.onbVal;if(p==="source")$.source=$.source===h?"":h,h!=="Other"&&($.sourceOther="");else if(p==="functions"){const x=$.functions;$.functions=x.includes(h)?x.filter(P=>P!==h):x.length>=3?x:[...x,h]}else{const x=$[p];$[p]=x.includes(h)?x.filter(P=>P!==h):[...x,h]}D(e),Y()})),document.querySelectorAll("[data-onb-chip-add]").forEach(l=>l.addEventListener("click",()=>{const p=l.dataset.onbChipAdd,h=document.querySelector(`[data-onb-chip-input="${p}"]`);a(p,((h==null?void 0:h.value)||"").trim()),D(e),Y()})),document.querySelectorAll("[data-onb-chip-input]").forEach(l=>l.addEventListener("keydown",p=>{p.key==="Enter"&&(p.preventDefault(),a(l.dataset.onbChipInput,l.value.trim()),D(e),Y())})),document.querySelectorAll("[data-onb-toggle]").forEach(l=>l.addEventListener("click",()=>{if(l.dataset.onbRequired)return;const p=l.dataset.onbToggle;$[p]=!$[p],D(e),Y()})),document.querySelectorAll("[data-onb-rolefield]").forEach(l=>l.addEventListener("input",()=>{$.roles[Number(l.dataset.onbIdx)][l.dataset.onbRolefield]=l.value,ba(),Y()})),(r=document.querySelector("[data-onb-role-add]"))==null||r.addEventListener("click",()=>{$.roles.push({title:"",company:"",from:"",to:"",current:!1,open:!0}),D(e),Y()}),document.querySelectorAll("[data-onb-role-edit]").forEach(l=>l.addEventListener("click",()=>{const p=Number(l.dataset.onbRoleEdit);$.roles[p].open=!$.roles[p].open,D(e)})),document.querySelectorAll("[data-onb-role-remove]").forEach(l=>l.addEventListener("click",()=>{$.roles.splice(Number(l.dataset.onbRoleRemove),1),D(e),Y()})),document.querySelectorAll("[data-onb-role-current]").forEach(l=>l.addEventListener("click",()=>{const p=Number(l.dataset.onbRoleCurrent);$.roles[p].current=!$.roles[p].current,$.roles[p].current&&($.roles[p].to=""),D(e),Y()})),document.querySelectorAll("[data-onb-edufield]").forEach(l=>l.addEventListener("input",()=>{$.education[Number(l.dataset.onbIdx)][l.dataset.onbEdufield]=l.value,ba(),Y()})),document.querySelectorAll("[data-onb-edu-add]").forEach(l=>l.addEventListener("click",()=>{$.education.push({kind:l.dataset.onbEduAdd,title:"",school:"",year:"",open:!0}),D(e),Y()})),document.querySelectorAll("[data-onb-edu-edit]").forEach(l=>l.addEventListener("click",()=>{const p=Number(l.dataset.onbEduEdit);$.education[p].open=!$.education[p].open,D(e)})),document.querySelectorAll("[data-onb-edu-remove]").forEach(l=>l.addEventListener("click",()=>{$.education.splice(Number(l.dataset.onbEduRemove),1),D(e),Y()}));const t=document.querySelector("#onb2FileInput");if((d=document.querySelector("[data-onb-file-add]"))==null||d.addEventListener("click",()=>t==null?void 0:t.click()),t==null||t.addEventListener("change",()=>{[...t.files||[]].forEach(l=>{$.files.includes(l.name)||$.files.push(l.name)}),D(e),Y()}),document.querySelectorAll("[data-onb-file-remove]").forEach(l=>l.addEventListener("click",()=>{$.files=$.files.filter(p=>p!==l.dataset.onbFileRemove),D(e),Y()})),e===0){const l=document.querySelector("#onb2Dropzone"),p=document.querySelector("#onb2CvInput");l==null||l.addEventListener("click",()=>p==null?void 0:p.click()),l==null||l.addEventListener("dragover",h=>{h.preventDefault(),l.classList.add("is-drag")}),l==null||l.addEventListener("dragleave",()=>l.classList.remove("is-drag")),l==null||l.addEventListener("drop",h=>{var P,N;h.preventDefault(),l.classList.remove("is-drag");const x=(N=(P=h.dataTransfer)==null?void 0:P.files)==null?void 0:N[0];x&&Xa(x)}),p==null||p.addEventListener("change",()=>{var x;const h=(x=p.files)==null?void 0:x[0];h&&Xa(h)}),(u=document.querySelector("[data-onb-cv-remove]"))==null||u.addEventListener("click",()=>{Pa(),We=null,$.cv=null,Se="idle",ye=0,D(0),Y()}),(m=document.querySelector("[data-onb-manual]"))==null||m.addEventListener("click",()=>D(1))}e===4&&document.querySelectorAll("[data-onb-done-act]").forEach(l=>l.addEventListener("click",()=>{const p=l.dataset.onbDoneAct;p==="dashboard"?(window.history.pushState({page:"overview"},"","/"),C({activePage:"overview",message:""})):p==="assessment"?(window.history.pushState({page:"assessment"},"","/assessment"),C({activePage:"assessment",message:""})):p==="jobs"&&window.open("https://www.nearwork.co/jobs","_blank","noreferrer")}))}function ss(e){if(!qa(e)){if(e<3){D(e+1);return}e===3&&rs()}}function Ia(e){var te,J,V,ne,f,v,y,w,b,M,ee,H;const a=$,t=Be(a.first||""),n=Be(a.last||""),s=[t,n].filter(Boolean).join(" ")||((te=o.candidate)==null?void 0:te.name)||((J=o.user)==null?void 0:J.displayName)||"",i=String(a.city||"").split(",").map(A=>A.trim()).filter(Boolean),c=i[0]||"",d=(i.length>1?i[i.length-1]:"")||((V=o.candidate)==null?void 0:V.locationCountry)||"Colombia",u=Number(a.salaryMin)||null,m=Number(a.salaryMax)||null,l=u&&m?`$${u.toLocaleString("en-US")}–$${m.toLocaleString("en-US")} USD/mo`:u?`$${u.toLocaleString("en-US")} USD/mo`:"",p=a.phone?String(a.phone).trim().startsWith("+")?String(a.phone).trim():`+57 ${String(a.phone).trim()}`:"",h=a.linkedin?/^https?:\/\//i.test(a.linkedin)?a.linkedin:`https://linkedin.com/in/${String(a.linkedin).replace(/^\/+/,"")}`:"",x=a.portfolio?/^https?:\/\//i.test(a.portfolio)?a.portfolio:`https://${a.portfolio}`:"",P=(a.roles||[]).filter(A=>A.title||A.company).map(A=>({title:A.title||"",company:A.company||"",from:A.from||"",to:A.current?"present":A.to||"",current:!!A.current})),N=(a.education||[]).filter(A=>A.kind==="cert"&&(A.title||A.school)).map(A=>({name:A.title||"",issuer:A.school||"",date:A.year||""})),L=(a.education||[]).filter(A=>A.kind==="degree"&&(A.title||A.school)).map(A=>({degree:A.title||"",institution:A.school||"",year:A.year||""})),E=[...new Set((a.skills||[]).map(Ce).filter(Boolean))],U=a.functions[0]||((ne=o.candidate)==null?void 0:ne.targetRole)||"",W=((f=P.find(A=>A.current)||P[0])==null?void 0:f.title)||"",z={name:s,firstName:t,lastName:n,targetRole:U,headline:U||((v=o.candidate)==null?void 0:v.headline)||"Nearwork candidate",currentRole:W,location:a.city||"",locationCity:c,city:c,locationCountry:d,english:In[a.english]||a.english||"",englishLevel:a.english||"",salary:l,salaryUSD:u,salaryAmount:u,salaryCurrency:"USD",expectedSalaryUSD:u,expectedSalaryAmount:u,expectedSalaryCurrency:"USD",expectedSalaryMinUSD:u,expectedSalaryMaxUSD:m,expectedSalary:l,whatsapp:p,phone:p,linkedin:h,skills:E,workHistory:P,certifications:N,education:L,functions:[...a.functions],workType:a.workType||"",startAvailability:a.availability||"",availability:((y=o.candidate)==null?void 0:y.availability)||"open",portfolio:x,attachments:[...a.files],source:a.source||"",sourceOther:a.sourceOther||"",shareProfile:!!a.shareProfile,notifyMatches:!!a.notifyMatches,notifyNews:!!a.notifyNews,marketingConsent:a.notifyNews===!0||((w=o.candidate)==null?void 0:w.marketingConsent)===!0,summary:a.summary||((b=o.candidate)==null?void 0:b.summary)||"",profile_strength:_a(e),email:((M=o.candidate)==null?void 0:M.email)||((ee=o.user)==null?void 0:ee.email)||"",candidateCode:(H=o.candidate)==null?void 0:H.candidateCode};return e&&(z.onboarded=!0),z}function Y(){be&&clearTimeout(be),be=setTimeout(()=>{be=null,is()},600)}async function is(){var a;const e=(a=o.user)==null?void 0:a.uid;if(!(!e||!he))try{await Ke(e,Ia(!1))}catch{}}async function os(){var a;const e=(a=o.user)==null?void 0:a.uid;if(be&&(clearTimeout(be),be=null),e&&he)try{await Ke(e,Ia(!1))}catch{}window.history.pushState({page:"overview"},"","/"),C({activePage:"overview",message:"Saved. You can finish your profile any time."})}async function rs(){var a;const e=document.querySelector("#onb2Next");e&&(e.disabled=!0,e.textContent="Saving…");try{const t=(a=o.user)==null?void 0:a.uid;if(!t)throw new Error("Not signed in");be&&(clearTimeout(be),be=null);let n={};if(We)try{const i=await Ca(t,We,"");n={activeCvId:i.id,activeCvName:i.name||i.fileName,cvUrl:i.url,cvLibrary:[i]}}catch{}const s={...Ia(!0),...n};await Ke(t,s),o={...o,candidate:{...o.candidate,...s}},D(4)}catch{e&&(e.disabled=!1,e.innerHTML=`Finish and go live${T("arrow-right",17,"#fff")}`,ce());const n=document.querySelector("#onb2Blocker");n&&(n.innerHTML=`<div class="onb2-blocker">${T("info",14,"#E74C7C")}Something went wrong saving your profile. Please try again.</div>`,ce())}}function ls(){if($a)return;const e=document.querySelector("#onb2Confetti");if(!e)return;$a=!0;const a=e.getContext("2d"),t=window.devicePixelRatio||1;(()=>{e.width=e.clientWidth*t,e.height=e.clientHeight*t,a.setTransform(t,0,0,t,0,0)})();const s=()=>e.clientWidth,i=()=>e.clientHeight,c=["#10A07C","#AF7AC5","#E74C7C","#1ABC9C","#EAB308"],r=Array.from({length:130},()=>({x:s()*(.15+Math.random()*.7),y:-20-Math.random()*i()*.5,vx:(Math.random()-.5)*2.4,vy:2+Math.random()*3.4,w:5+Math.random()*6,h:8+Math.random()*8,rot:Math.random()*Math.PI,vr:(Math.random()-.5)*.22,c:c[Math.floor(Math.random()*c.length)]}));let d=0;const u=()=>{d+=1,a.clearRect(0,0,s(),i()),r.forEach(m=>{m.x+=m.vx,m.y+=m.vy,m.vy+=.035,m.rot+=m.vr,a.save(),a.translate(m.x,m.y),a.rotate(m.rot),a.globalAlpha=Math.max(0,1-d/300),a.fillStyle=m.c,a.fillRect(-m.w/2,-m.h/2,m.w,m.h),a.restore()}),d<300?requestAnimationFrame(u):a.clearRect(0,0,s(),i())};u()}function cs(){const e=ea(),a=o.jobs.map(Ee).filter(i=>Ta(i,e).length>=3),t=e.length>=5,n=o.matchesFiltered&&t?a:o.jobs.map(Ee),s=o.matchesFiltered&&!a.length;return`
    <div class="nw-page-head">
      <div class="nw-page-overline">My search</div>
      <h1 class="nw-page-title">Matches</h1>
      <p class="nw-page-lede">Roles picked for you from your skills, target role, and salary.</p>
    </div>
    <div class="nw-filterbar">
      <button id="filterMatches" class="nw-chip${o.matchesFiltered?" active":""}" type="button">${g(o.matchesFiltered?"list":"filter")} ${o.matchesFiltered?"Show all openings":"Filter by my role & skills"}</button>
      <div class="nw-filter-count">${n.length} of ${o.jobs.length} open roles</div>
    </div>
    <div class="nw-match-grid nw-match-grid--wide">${s?Pt("No filtered matches yet","Add a target role and skills in Profile to improve matching."):n.map(i=>_s(i)).join("")}</div>
  `}function ds(){const e=o.applications||[];return`
    <div class="nw-page-head">
      <div class="nw-page-overline">My journey</div>
      <h1 class="nw-page-title">Applications</h1>
      <p class="nw-page-lede">Every role you've applied to, and exactly where it stands.</p>
    </div>
    ${hn()?`
      <section class="nw-panel nw-pipeline-panel">
        <div class="nw-panel-head"><div><div class="nw-panel-overline">Status</div><div class="nw-panel-title">Where you are in the process</div></div></div>
        ${Ns(Ts())}
      </section>`:""}
    <section class="nw-panel nw-applist">
      ${e.length?e.map((t,n)=>qs(t,n===e.length-1)).join(""):Ms()}
    </section>
  `}function us(){const e=Ae(),a=o.assessments||[],t=a.filter(N=>["sent","started"].includes(String(N.status||"").toLowerCase())),n=a.filter(N=>String(N.status||"").toLowerCase()==="completed"),s=e?a.find(N=>N.id===e):t[0]||n[0]||null;if(o.assessmentUiStep==="techIntro"&&s)return hs(s);if(o.assessmentUiStep==="discIntro"&&s)return ys(s);if(e&&!s)return`
      <div class="nw-page-head">
        <div class="nw-page-overline">My journey</div>
        <h1 class="nw-page-title">Assessment</h1>
        <p class="nw-page-lede">A short role assessment helps your recruiter advocate for you with real signal.</p>
      </div>
      <div class="nw-assess-wrap nw-assess-state-page">
        <div class="nw-assess-state-card">
          <div class="nw-assess-state-icon" style="background:var(--pp-pink-soft);color:#CC3666">${g("link-2-off")}</div>
          <strong>This link isn't available</strong>
          <p>Make sure you're logged into the same account that received the assessment email. If the problem persists, reach out to your Nearwork recruiter.</p>
          <button class="primary-action fit" data-page="recruiter" type="button">${g("message-circle")} Contact support</button>
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
    `;const i=Array.isArray(s.questions)?s.questions:[],c=String(s.status||"").toLowerCase()==="started",r=String(s.status||"").toLowerCase()==="completed",d=String(s.status||"").toLowerCase()==="cancelled",u=fs(s),m=pt(),l=Number(s.currentQuestionIndex||0),p=Math.min(m??l,Math.max(i.length-1,0)),h=i[p],x=(h==null?void 0:h.stage)||s.currentStage||1,P=c&&!r&&!d&&!u;return`
    <div class="nw-assess-wrap">
      ${P?ms(s,x,p,i):Da(s)}
      ${P?ps(s,p):""}
      <div class="nw-assess-body" id="assessmentWorkspace">
        ${r?bs(s):d?`<div class="nw-assess-state-card nw-assess-state-card--inline"><div class="nw-assess-state-icon" style="background:#F5F4F0;color:#555">${g("ban")}</div><strong>Assessment cancelled</strong><p>This assessment is no longer available. A new assigned assessment will appear here when your recruiter sends one.</p></div>`:u?`<div class="nw-assess-state-card nw-assess-state-card--inline"><div class="nw-assess-state-icon" style="background:#FEF0F5;color:#CC3666">${g("clock-x")}</div><strong>Assessment link expired</strong><p>This unique assessment link is no longer valid. Contact your Nearwork recruiter if you need a new one.</p><button class="ghost-action" data-page="recruiter" type="button">${g("message-circle")} Contact recruiter</button></div>`:gs(s,c,p)}
      </div>
      ${ws(a,s.id)}
    </div>
  `}function Da(e){const a=String(e.status||"").toLowerCase();return`
    <div class="nw-assess-chrome">
      <div class="nw-assess-chrome__logo">
        <div class="nw-assess-chrome__logotile">N</div>
        <span class="nw-assess-chrome__brand">Nearwork</span>
        <div class="nw-assess-chrome__divider"></div>
        <span class="nw-assess-chrome__sub">Candidate assessment</span>
      </div>
      <div style="flex:1"></div>
      ${["completed","cancelled"].includes(a)?"":`<button class="nw-assess-chrome__exit" type="button">${g("x")} Save &amp; exit</button>`}
    </div>
  `}function ps(e,a){const t=(e.questions||[]).slice(0,70),n=le(e,1).filter(r=>Ue(ha(e,r))).length,s=le(e,2).filter(r=>Ue(ha(e,r))).length,i=le(e,1).length||50,c=le(e,2).length||20;return`
    <section class="assessment-progress-panel">
      <div><strong>Technical</strong><span>${n}/${i} answered</span></div>
      <div><strong>DISC</strong><span>${s}/${c} answered</span></div>
      <div class="assessment-progress-strip">
        ${t.map((r,d)=>{const u=Ue(ha(e,r));return`<button type="button" class="${d===a?"active":""} ${u?"answered":""}" data-assessment-jump="${d}" title="${Na(r.stage)} · Q${d+1}">${d+1}</button>`}).join("")}
      </div>
    </section>
  `}function ms(e,a,t,n){const s=Number(a),i=Wa(e.technicalStartedAt||e.startedAt)||new Date,c=Wa(e.discStartedAt)||new Date,r=s===1?i:c,d=Number(s===1?e.technicalMinutes||60:e.discMinutes||30),u=new Date(r.getTime()+d*60*1e3),m=s===1?"Technical":"DISC profile",l=(n||[]).filter(P=>Number(P.stage||1)===s),p=(n||[]).findIndex(P=>Number(P.stage||1)===s),h=Math.max(0,t-p),x=l.length?Math.round((h+1)/l.length*100):2;return`
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
          <span>${m} &middot; Question ${h+1} of ${l.length||(s===1?50:20)}</span>
        </div>
        <div class="nw-assess-chrome__progresstrack">
          <div class="nw-assess-chrome__progressfill" style="width:${Math.max(2,x)}%"></div>
        </div>
      </div>
      <div class="nw-timer-pill">
        ${g("timer")}
        <span id="assessmentTimer" data-end="${u.toISOString()}">${d}:00</span>
      </div>
      <button class="nw-assess-chrome__exit" type="button">${g("x")} Save &amp; exit</button>
    </div>
  `}function gs(e,a,t=null){var W,z,te;if(!a){const J=k(e.role||"Role assessment"),V=k(e.recruiterName||e.recruiter||"Nearwork"),ne=da(e.expiresAt||e.deadline),f=le(e,1).length||50,v=le(e,2).length||20,y=Number(e.technicalMinutes||60),w=Number(e.discMinutes||30);return`
      <div class="nw-assess-welcome">
        <div class="nw-assess-welcome__header">
          <span class="nw-assess-role-chip">${g("sparkles")} ${J}</span>
          <span>Sent by ${V}${ne?" &middot; expires "+ne:""}</span>
        </div>
        <h2 class="nw-assess-welcome__title">Let's see how you think — and how you work.</h2>
        <p class="nw-assess-welcome__desc">This assessment has two parts: a role-knowledge check and a behavioral profile.</p>
        <div class="nw-assess-parts">
          <div class="nw-assess-part">
            <div class="nw-assess-part__blob" style="background:#E4F6EF"></div>
            <div class="nw-assess-part__icon" style="background:#E4F6EF;color:#10A07C">${g("code-2")}</div>
            <span class="nw-assess-part__tag" style="color:#10A07C">Part 1</span>
            <strong class="nw-assess-part__title">Technical Assessment</strong>
            <span class="nw-assess-part__sub">${f} questions &middot; ~${y} min</span>
            <p class="nw-assess-part__desc">Single-choice role scenarios. We're looking at how you think, not whether you remember definitions.</p>
          </div>
          <div class="nw-assess-part">
            <div class="nw-assess-part__blob" style="background:#F7F2FC"></div>
            <div class="nw-assess-part__icon" style="background:#F7F2FC;color:#AF7AC5">${g("compass")}</div>
            <span class="nw-assess-part__tag" style="color:#AF7AC5">Part 2</span>
            <strong class="nw-assess-part__title">DISC Profile</strong>
            <span class="nw-assess-part__sub">${v} statements &middot; ~${w} min</span>
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
    `}const n=(e.questions||[]).slice(0,70),s=Math.min(t??Number(e.currentQuestionIndex||0),Math.max(n.length-1,0)),i=n[s],c=((z=(W=e.answers)==null?void 0:W[i.id])==null?void 0:z.value)??((te=e.answers)==null?void 0:te[i.id])??"",r=Array.isArray(i.options)&&i.options.length?i.options:["Strongly agree","Agree","Neutral","Disagree"],d=n[s+1],u=d==null?void 0:d.stage,m=u&&u!==i.stage,l=ka(e,i.stage),p=m&&l.length,h=s+1>=n.length,x=h?ka(e,i.stage):[],P=!!i.multiple,N=Number(i.stage||1)===2?"nw-assess-chip--violet":"nw-assess-chip--teal",L=P?"Multi-select":"Single choice",E=k(i.part||i.type||(Number(i.stage||1)===2?"DISC":"Scenario")),U=k(i.bank||"");return`
    <form id="assessmentQuestionForm" class="nw-assess-qcard" data-current-index="${s}">
      <div class="nw-assess-qmeta">
        <span class="nw-assess-chip ${N}">${E}</span>
        ${U?`<span class="nw-assess-chip nw-assess-chip--gray">${U}</span>`:""}
        <span class="nw-assess-qtype">&middot; ${L}</span>
      </div>
      ${i.context?`<div class="nw-assess-context"><strong>Context: </strong>${k(i.context)}</div>`:""}
      <p class="nw-assess-qprompt">${k(i.q||"")}</p>
      <fieldset class="nw-assess-options${P?" nw-assess-options--multi":""}">
        <legend>${L}</legend>
        ${r.map((J,V)=>`
          <label class="nw-assess-option${P?" nw-assess-option--multi":""}">
            <input type="radio" name="answer" value="${V}" ${String(c)===String(V)?"checked":""} />
            <span class="nw-assess-option__key">${String.fromCharCode(65+V)}</span>
            <span class="nw-assess-option__text">${k(J)}</span>
            ${P?"":`<span class="nw-assess-option__check">${g("check-circle-2")}</span>`}
          </label>
        `).join("")}
      </fieldset>
      ${p||x.length?vs(e,p?l:x,i.stage):""}
      <div class="nw-assess-qfooter">
        <button class="ghost-action" id="prevAssessmentQuestion" type="button" ${s===0?"disabled":""}>${g("arrow-left")} Back</button>
        <span class="nw-assess-autosave">${g("check")} Auto-saved</span>
        <div style="flex:1"></div>
        <button class="primary-action fit" type="submit">${h?g("send")+" Submit assessment":"Next "+g("arrow-right")}</button>
      </div>
    </form>
  `}function vs(e,a,t){if(!a.length)return"";const n=(e.questions||[]).slice(0,70);return`
    <div class="nw-assess-missed">
      <strong>${g("alert-triangle")} Unanswered questions in ${Na(t)}</strong>
      <p>You skipped ${a.map(s=>`Question ${n.findIndex(i=>i.id===s.id)+1}`).join(", ")}. You can go back now or continue if you meant to leave them blank.</p>
      <div class="nw-assess-missed__links">${a.map(s=>{const i=n.findIndex(c=>c.id===s.id);return`<button class="ghost-action" type="button" data-assessment-jump="${i}">${g("arrow-left")} Go to ${i+1}</button>`}).join("")}</div>
    </div>
  `}function fs(e){return!(e!=null&&e.expiresAt)||String(e.status||"").toLowerCase()==="completed"?!1:Date.now()>new Date(e.expiresAt).getTime()}function hs(e){const a=k(e.role||"Role assessment"),t=le(e,1).length||50,n=Number(e.technicalMinutes||60);return`
    <div class="nw-assess-wrap">
      ${Da(e)}
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
            <button class="primary-action" id="startAssessment" type="button">${g("play")} Start Part 1</button>
            <button class="ghost-action" id="backToWelcome" type="button">${g("arrow-left")} Back</button>
          </div>
        </div>
      </div>
    </div>
  `}function ys(e){const a=le(e,1).length||50,t=le(e,2).length||20,n=Number(e.discMinutes||30),s=k(e.recruiterName||e.recruiter||"your recruiter"),i=(e.questions||[]).findIndex(c=>Number(c.stage||1)===2);return`
    <div class="nw-assess-wrap">
      ${Da(e)}
      <div class="nw-assess-body">
        <div style="background:#E4F6EF;border-bottom:1px solid rgba(16,160,124,0.15);padding:13px 20px;display:flex;align-items:center;gap:12px;margin-bottom:24px;border-radius:10px">
          <div style="width:26px;height:26px;border-radius:50%;background:#10A07C;color:#fff;display:flex;align-items:center;justify-content:center;flex-shrink:0">${g("check")}</div>
          <div style="flex:1">
            <div style="font-size:13px;font-weight:600;color:#0A7C5E">Part 1 complete — nice work.</div>
            <div style="font-size:12px;color:#0A7C5E;margin-top:1px">${a}/${a} answered &middot; submitted to ${s} for review</div>
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
              <p class="nw-assess-part__desc">You'll see ${t} statements about how you work. For each one, pick the option that's most like you. Go with your gut — there are no right answers. Takes about ${n} minutes.</p>
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
  `}function bs(e){var c,r;const t=(((c=o.candidate)==null?void 0:c.name)||((r=o.user)==null?void 0:r.displayName)||"").split(" ")[0]||"You",n=k(e.recruiterName||e.recruiter||"your recruiter"),s=le(e,1).length||50,i=le(e,2).length||20;return`
    <div class="nw-assess-complete">
      <div class="nw-assess-complete__hero">
        <div class="nw-assess-complete__icon">
          ${g("check")}
          <div class="nw-assess-complete__ring1"></div>
          <div class="nw-assess-complete__ring2"></div>
        </div>
        <h2 class="nw-assess-complete__title">You're done, ${k(t)}.</h2>
        <p class="nw-assess-complete__desc">Your results have been sent to ${n}. They'll reach out personally — usually within a business day.</p>
      </div>
      <div class="nw-assess-complete__chips">
        <span class="nw-assess-complete__chip nw-assess-complete__chip--teal">${g("clipboard-check")} Part 1 &middot; ${s}/${s} answered</span>
        <span class="nw-assess-complete__chip nw-assess-complete__chip--violet">${g("compass")} Part 2 &middot; ${i}/${i} answered</span>
        <span class="nw-assess-complete__chip nw-assess-complete__chip--gray">${g("check-circle-2")} Assessment complete</span>
      </div>
      <div class="nw-assess-next">
        <div class="nw-assess-next__label">What happens next</div>
        ${[{icon:"inbox",title:"Your recruiter reviews your results",desc:`${n} will read your scenarios and DISC profile, usually within one business day.`,when:"Within 24h"},{icon:"message-square",title:`A personal note from ${n}`,desc:"Not an automated email. They'll share what stood out and what comes next.",when:"Tomorrow"},{icon:"calendar-check",title:"Interview with the hiring team",desc:"If there's a match, you'll get a calendar link to book a slot that works for you.",when:"This week"}].map(({icon:d,title:u,desc:m,when:l},p)=>`
          <div class="nw-assess-next__item">
            <div class="nw-assess-next__icon-wrap">
              <div class="nw-assess-next__iconbox">${g(d)}</div>
              <div class="nw-assess-next__num">${p+1}</div>
            </div>
            <div class="nw-assess-next__body">
              <div class="nw-assess-next__title">${u}</div>
              <div class="nw-assess-next__desc">${m}</div>
            </div>
            <div class="nw-assess-next__when">${l}</div>
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
        <button class="ghost-action" data-page="recruiter" type="button">${g("message-circle")} Message recruiter</button>
      </div>
    </div>
  `}function ws(e,a){return e.length?`
    <section class="nw-panel" style="margin-top:18px;padding-bottom:18px;">
      <div class="nw-panel-head"><div><div class="nw-panel-overline">Assessment center</div><div class="nw-panel-title">Your assessment history</div></div></div>
      <div class="assessment-history-list">
        ${e.map(t=>`
          <article class="assessment-history-row ${t.id===a?"active":""}">
            <div><strong>${k(t.role||"Nearwork assessment")}</strong><span>${k(t.id||"")}</span></div>
            <div>${k(String(t.status||"assigned"))}</div>
            <a href="/assessment/${encodeURIComponent(t.id)}/start">${t.status==="completed"?"View":"Continue"}</a>
          </article>
        `).join("")}
      </div>
    </section>
  `:""}function Ss(e,a){const t=e.questions||[],n=t.filter(r=>r.stage===1),s=t.filter(r=>r.stage===2),i=n.filter(r=>{var d;return typeof r.correctIndex=="number"&&Number((d=a[r.id])==null?void 0:d.value)===r.correctIndex}).length,c=s.filter(r=>{var d;return Ue(((d=a[r.id])==null?void 0:d.value)??a[r.id])}).length;return{technicalScore:n.length?Math.round(i/n.length*100):0,discScore:s.length?Math.round(c/s.length*100):0}}function Cs(e,a){var r,d;const t={Dominance:0,Influence:0,Steadiness:0,Conscientiousness:0};(e.questions||[]).filter(u=>Number(u.stage)===2).forEach(u=>{var h;const m=(h=a[u.id])==null?void 0:h.value;if(!Ue(m))return;const l=t[u.skill]!==void 0?u.skill:"Steadiness",p=Math.max(1,4-Number(m||0));t[l]+=p});const n=Object.entries(t).sort((u,m)=>m[1]-u[1]),s=((r=n[0])==null?void 0:r[0])||"Steadiness",i=((d=n[n.length-1])==null?void 0:d[0])||"Dominance";return{label:{Dominance:"D",Influence:"I",Steadiness:"S",Conscientiousness:"C"}[s]||"S",high:s,low:i,scores:t,summary:`${s} is the strongest observed DISC tendency; ${i} appears lowest based on this assessment.`}}async function $s(e,a){var d,u,m,l,p;const t="https://admin.nearwork.co/api/send-email",n=e.candidateEmail||((d=o.user)==null?void 0:d.email)||((u=o.candidate)==null?void 0:u.email),s=e.candidateName||((m=o.candidate)==null?void 0:m.name)||((l=o.user)==null?void 0:l.displayName)||"there",i=bt([e.recruiterEmail,e.stakeholderEmail,e.hiringManagerEmail].filter(Boolean).join(",")),c=[];n&&c.push(fetch(t,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({to:n,templateId:"assessment_completed_candidate",data:{name:s,role:e.role,actionUrl:"https://talent.nearwork.co/assessment",actionText:"Open assessment center"}})}));const r=i.length?i:["support@nearwork.co"];c.push(fetch(t,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({to:r,templateId:"assessment_completed_recruiter",data:{name:"Nearwork team",role:e.role,actionUrl:`https://admin.nearwork.co/assessments/${e.id}/questions`,actionText:"Review assessment",message:`${s} completed the assessment. Overall: ${a.score}%. Technical: ${a.technicalScore}%. DISC: ${((p=a.discProfile)==null?void 0:p.label)||"Submitted"}.`}})})),await Promise.allSettled(c)}function ks(){var a;const e=((a=o.candidate)==null?void 0:a.cvLibrary)||[];return`
    <div class="nw-page-head">
      <div class="nw-page-overline">My search</div>
      <h1 class="nw-page-title">CV picker</h1>
      <p class="nw-page-lede">Save multiple resumes and pick the best one for each opening.</p>
    </div>
    <section class="nw-panel" style="margin-top:18px;padding-bottom:18px;">
      <form id="cvForm" class="upload-box">
        ${g("upload-cloud")}<strong>Upload a CV for this role</strong><p>Save multiple versions and pick the best one for each opening.</p>
        <input name="cv" type="file" accept=".pdf,.doc,.docx" required />
        <input name="label" type="text" placeholder="CV label, e.g. CSM resume" />
        <button class="primary-action fit" type="submit">Upload CV</button>
      </form>
      <div class="cv-list">
        ${e.length?e.map(t=>`<article class="cv-item">${g("file-text")}<div><strong>${t.name||t.fileName}</strong><span>${da(t.uploadedAt)}</span></div>${t.url?`<a href="${t.url}" target="_blank" rel="noreferrer">Open</a>`:""}</article>`).join(""):Pt("No CVs saved yet","Upload role-specific resumes here.")}
      </div>
    </section>
  `}function As(){return`
    <div class="nw-page-head">
      <div class="nw-page-overline">Support</div>
      <h1 class="nw-page-title">Tips</h1>
      <p class="nw-page-lede">Practical prep for US SaaS interviews — short, useful guidance before recruiter screens, assessments, and client interviews.</p>
    </div>
    <section class="tips-grid rich" style="margin-top:18px;">
      ${gn.map((e,a)=>`
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
  `}function xs(){var t,n;const a=(((t=o.candidate)==null?void 0:t.recruiter)||{}).bookingUrl||((n=o.candidate)==null?void 0:n.recruiterBookingUrl)||"mailto:support@nearwork.co?subject=Nearwork%20candidate%20question";return`
    <div class="nw-page-head">
      <div class="nw-page-overline">Support</div>
      <h1 class="nw-page-title">Recruiter</h1>
      <p class="nw-page-lede">Your Nearwork talent partner — reach out anytime about assessments, interviews, feedback, or CV selection.</p>
    </div>
    <div class="nw-split" style="margin-top:18px;">
      <section class="nw-panel" style="padding-bottom:18px;">
        <div class="nw-panel-head"><div><div class="nw-panel-overline">Recruiter</div><div class="nw-panel-title">Your Nearwork contact</div></div></div>
        ${Is(!0)}
      </section>
      <section class="nw-panel" style="padding-bottom:18px;">
        <div class="nw-panel-head"><div><div class="nw-panel-overline">Booking</div><div class="nw-panel-title">Schedule soon</div></div></div>
        <p class="muted">Ask the Nearwork recruiting team for the earliest available slot. Candidate booking links can be attached to this profile later.</p>
        <a class="primary-action fit" href="${a}" target="_blank" rel="noreferrer">${g("calendar-plus")} Book recruiter call</a>
      </section>
    </div>
  `}function Es(){return Ls("profile")}function j(e,a=!1){return`<span class="pf-label">${e}${a?'<span class="pf-optional">optional</span>':""}</span>`}function ie(e,a,t=""){return`
    <div class="pf-card-head">
      <div class="pf-card-icon">${g(e)}</div>
      <div class="pf-card-title">${a}</div>
      ${t?`<span class="pf-card-badge">${t}</span>`:""}
    </div>`}function Ua(e,a={}){const t=e,n=(a.company||"?")[0].toUpperCase();return`
    <div class="pf-sub-card work-entry" data-work-index="${t}">
      <div class="pf-sub-card-left">
        <div class="pf-work-avatar">${n}</div>
      </div>
      <div class="pf-sub-card-body">
        <div class="pf-field-row">
          <label class="pf-field">
            ${j("Job title")}
            <input type="text" class="pf-input work-field" data-field="title" value="${k(a.title||"")}" placeholder="e.g. Customer Success Manager" />
          </label>
          <label class="pf-field">
            ${j("Company")}
            <input type="text" class="pf-input work-field" data-field="company" value="${k(a.company||"")}" placeholder="e.g. Acme Corp" />
          </label>
        </div>
        <div class="pf-field-row pf-field-row--3">
          <label class="pf-field">
            ${j("From")}
            <input type="text" class="pf-input work-field" data-field="from" value="${k(a.from||"")}" placeholder="2021-03" />
          </label>
          <label class="pf-field">
            ${j("To")}
            <input type="text" class="pf-input work-field" data-field="to" value="${k(a.to||"")}" placeholder="present" />
          </label>
          <div></div>
        </div>
      </div>
      <button type="button" class="pf-remove-btn remove-work-entry" data-remove="${t}" aria-label="Remove">
        ${g("x")}
      </button>
    </div>`}const Ps=["","A1","A2","B1","B2","C1","C2","Native"];function Ba(e,a={}){const t=e,n=typeof a=="string"?{name:a,level:""}:a;return`
    <div class="pf-sub-card lang-entry" data-lang-index="${t}">
      <div class="pf-sub-card-body">
        <div class="pf-field-row">
          <label class="pf-field">
            ${j("Language")}
            <input type="text" class="pf-input lang-field" data-field="name" value="${k(n.name||"")}" placeholder="e.g. Spanish, French…" />
          </label>
          <label class="pf-field">
            ${j("Level")}
            <select class="pf-input lang-field" data-field="level">
              ${Ps.map(s=>`<option value="${s}" ${(n.level||"")===s?"selected":""}>${s||"Select level"}</option>`).join("")}
            </select>
          </label>
        </div>
      </div>
      <button type="button" class="pf-remove-btn remove-lang-entry" data-remove="${t}" aria-label="Remove">
        ${g("x")}
      </button>
    </div>`}function Ra(e,a={}){const t=e;return`
    <div class="pf-sub-card cert-entry" data-cert-index="${t}">
      <div class="pf-sub-card-left">
        <div class="pf-cert-icon">✓</div>
      </div>
      <div class="pf-sub-card-body">
        <div class="pf-field-row">
          <label class="pf-field">
            ${j("Certificate / Course")}
            <input type="text" class="pf-input cert-field" data-field="name" value="${k(a.name||"")}" placeholder="e.g. Google Analytics" />
          </label>
          <label class="pf-field">
            ${j("Issuer",!0)}
            <input type="text" class="pf-input cert-field" data-field="issuer" value="${k(a.issuer||"")}" placeholder="e.g. Coursera, HubSpot" />
          </label>
        </div>
        <label class="pf-field" style="max-width:200px;">
          ${j("Date (YYYY-MM)",!0)}
          <input type="text" class="pf-input cert-field" data-field="date" value="${k(a.date||"")}" placeholder="2023-06" />
        </label>
      </div>
      <button type="button" class="pf-remove-btn remove-cert-entry" data-remove="${t}" aria-label="Remove">
        ${g("x")}
      </button>
    </div>`}function Ls(e="profile"){var p,h,x,P,N,L,E,U,W,z,te,J,V,ne,f,v,y,w;const a=ea(),t=yn(),n=t.country==="Colombia",s=Ye[t.department]||[],i=((p=o.candidate)==null?void 0:p.salaryCurrency)||"USD",c=ht(((h=o.candidate)==null?void 0:h.salaryAmount)||((x=o.candidate)==null?void 0:x.salary)||((P=o.candidate)==null?void 0:P.salaryUSD),i),r=bn(),d=((N=o.candidate)==null?void 0:N.targetRole)||((L=o.candidate)==null?void 0:L.headline)||"",u=xt(),m=Ma(),l=m.filter(b=>b.done).length;return`
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
              stroke-dashoffset="${(2*Math.PI*16*(1-u/100)).toFixed(1)}"
              stroke-linecap="round" transform="rotate(-90 20 20)"/>
          </svg>
          <span class="pf-completion-pct">${u}%</span>
        </div>
      </div>

      <!-- Progress bar -->
      <div class="pf-progress-bar">
        <div class="pf-progress-fill" style="width:${u}%;"></div>
      </div>
      <div class="pf-progress-label">${l} of ${m.length} sections complete</div>

      <!-- Tabs -->
      <div class="pf-tabs" role="tablist">
        <button type="button" class="pf-tab active" data-tab="profile">${g("user-round")} Profile</button>
        <button type="button" class="pf-tab" data-tab="skills">${g("sparkles")} Skills</button>
        <button type="button" class="pf-tab" data-tab="cv">${g("file-text")} CV</button>
        <button type="button" class="pf-tab" data-tab="experience">${g("building-2")} Experience</button>
        <button type="button" class="pf-tab" data-tab="certifications">${g("graduation-cap")} Certifications</button>
      </div>

      <form id="profileForm" class="pf-form">

        <!-- ── Profile ── -->
        <div class="pf-tab-panel" data-tab-panel="profile">

          <!-- ── Identity ── -->
          <div class="pf-card">
            ${ie("user-round","Identity")}
            <div class="pf-identity-row">
              <div class="pf-avatar-upload">
                ${gt("large")}
                <label class="pf-photo-btn">
                  ${g("camera")} Change photo
                  <input name="photo" type="file" accept="image/png,image/jpeg,image/webp" style="display:none;" />
                </label>
              </div>
              <div class="pf-field" style="flex:1;">
                ${j("Full name")}
                <input class="pf-input" name="name" value="${k(((E=o.candidate)==null?void 0:E.name)||((U=o.user)==null?void 0:U.displayName)||"")}" placeholder="Your full name" />
              </div>
            </div>
          </div>

          <!-- ── Role ── -->
          <div class="pf-card">
            ${ie("briefcase-business","Role applying for")}
            <div class="pf-field-row">
              <label class="pf-field">
                ${j("Area")}
                <select class="pf-input" name="roleGroup" id="roleGroupSelect">
                  ${wn(r)}
                </select>
              </label>
              <label class="pf-field">
                ${j("Target role")}
                <select class="pf-input" name="targetRole" id="targetRoleSelect">
                  ${ft(r,d)}
                </select>
              </label>
            </div>
          </div>

          <!-- ── Location ── -->
          <div class="pf-card">
            ${ie("map-pin","Location")}
            <label class="pf-field" style="margin-bottom:14px;">
              ${j("Country")}
              <select class="pf-input" name="country" id="countrySelect">
                ${mn.map(b=>`<option value="${k(b)}" ${b===t.country?"selected":""}>${S(b)}</option>`).join("")}
              </select>
            </label>
            <div class="pf-field-row" id="pfCoLoc" style="display:${n?"":"none"};">
              <label class="pf-field">
                ${j("Department")}
                <select class="pf-input" name="department" id="departmentSelect">
                  ${Object.keys(Ye).map(b=>`<option value="${k(b)}" ${b===t.department?"selected":""}>${b}</option>`).join("")}
                </select>
              </label>
              <label class="pf-field">
                ${j("City")}
                <select class="pf-input" name="city" id="citySelect">
                  ${s.map(b=>`<option value="${k(b)}" ${b===t.city?"selected":""}>${b}</option>`).join("")}
                </select>
              </label>
            </div>
            <p id="pfCoHint" style="display:${n?"none":"block"};font-size:12.5px;color:var(--mid);margin:0;line-height:1.5;">No state or city needed — country is enough.</p>
          </div>

          <!-- ── Compensation ── -->
          <div class="pf-card">
            ${ie("banknote","Compensation")}
            <label class="pf-field" style="max-width:280px;">
              ${j("Target monthly salary")}
              <div class="pf-salary-wrap">
                <select id="salaryCurrencyInput" name="salaryCurrency" class="pf-currency-select">
                  <option value="USD" ${c.salaryCurrency==="USD"?"selected":""}>USD</option>
                  <option value="COP" ${c.salaryCurrency==="COP"?"selected":""}>COP</option>
                </select>
                <input class="pf-input pf-salary-input" id="salaryInput" name="salary" value="${k(c.salaryAmount?Aa(c.salaryAmount,c.salaryCurrency):"")}" inputmode="numeric" oninput="window.__fmtSalary(this)" placeholder="2,500" />
              </div>
              <span class="pf-hint">How much you're looking for, per month.</span>
            </label>
          </div>

          <!-- ── English & languages ── -->
          <div class="pf-card" id="langCard">
            ${ie("languages","English & languages")}
            <label class="pf-field" style="max-width:280px; margin-bottom:14px;">
              ${j("English level")}
              <select class="pf-input" name="english">
                ${["","B1","B2","C1","C2","Native"].map(b=>{var M;return`<option value="${b}" ${((M=o.candidate)==null?void 0:M.english)===b?"selected":""}>${b||"Select level"}</option>`}).join("")}
              </select>
            </label>
            ${j("Other languages",!0)}
            <p class="pf-hint">Add any other languages you speak and your level in each.</p>
            <div id="langEntries" class="pf-entries">
              ${(((W=o.candidate)==null?void 0:W.languages)||[]).map((b,M)=>Ba(M,b)).join("")}
            </div>
            <button type="button" id="addLangEntry" class="pf-add-btn">
              ${g("plus")} Add language
            </button>
          </div>

          <!-- ── Contact ── -->
          <div class="pf-card">
            ${ie("phone","Contact")}
            <div class="pf-field-row">
              <label class="pf-field">
                ${j("WhatsApp number")}
                <input class="pf-input" name="whatsapp" value="${k(((z=o.candidate)==null?void 0:z.whatsapp)||((te=o.candidate)==null?void 0:te.phone)||"")}" inputmode="tel" autocomplete="tel" placeholder="+57 300 123 4567" required />
              </label>
              <label class="pf-field">
                ${j("LinkedIn",!0)}
                <input class="pf-input" name="linkedin" value="${k(((J=o.candidate)==null?void 0:J.linkedin)||"")}" placeholder="https://linkedin.com/in/…" />
              </label>
            </div>
          </div>

          <!-- ── Communications ── -->
          <div class="pf-card">
            ${ie("mail","Communications")}
            <label class="pf-checkbox-row">
              <input type="checkbox" name="marketingConsent" ${((V=o.candidate)==null?void 0:V.marketingConsent)===!0?"checked":""} />
              <span>Send me job opportunities and updates from Nearwork by email</span>
            </label>
            <p class="pf-hint">You can turn this on or off at any time. It won't affect emails about your active applications.</p>
          </div>

          ${e==="onboarding"?"":`
          <!-- ── Danger zone ── -->
          <div class="pf-card pf-danger-card">
            ${ie("trash-2","Delete account")}
            <p class="pf-hint">Permanently delete your Nearwork profile, resume, applications, and assessment history. This cannot be undone — you can create a new account with the same email later if you change your mind.</p>
            <button type="button" id="openDeleteAccount" class="pf-danger-btn">
              ${g("trash-2")} Delete my account
            </button>
          </div>`}

        </div>

        <!-- ── Skills ── -->
        <div class="pf-tab-panel" data-tab-panel="skills" hidden>
          <div class="pf-card">
            ${ie("sparkles","Skills",a.length?`${a.length} added`:"")}
            ${Sn(a)}
          </div>
        </div>

        <!-- ── CV ── -->
        <div class="pf-tab-panel" data-tab-panel="cv" hidden>
          <div class="pf-card" id="profileCvCard">
            ${ie("file-text","CV")}
            <p class="pf-hint">Upload the CV you want Nearwork to use for your applications.</p>
            ${(ne=o.candidate)!=null&&ne.activeCvName||(f=o.candidate)!=null&&f.cvUrl?`
              <div class="pf-cv-current">
                <div class="pf-cv-icon">${g("file-text")}</div>
                <div class="pf-cv-info">
                  <strong>${S(o.candidate.activeCvName||"CV on file")}</strong>
                  <span>Currently active · upload below to replace</span>
                </div>
                ${o.candidate.cvUrl?`<a class="pf-cv-open" href="${k(o.candidate.cvUrl)}" target="_blank" rel="noreferrer">${g("external-link")} Open</a>`:""}
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
        </div>

        <!-- ── Experience ── -->
        <div class="pf-tab-panel" data-tab-panel="experience" hidden>

          <!-- ── Summary ── -->
          <div class="pf-card">
            ${ie("align-left","Summary","optional")}
            <textarea class="pf-input pf-textarea" name="summary" placeholder="Add a short note about what you do best — 2–3 sentences.">${S(((v=o.candidate)==null?void 0:v.summary)||"")}</textarea>
          </div>

          <!-- ── Work history ── -->
          <div class="pf-card" id="workHistoryCard">
            ${ie("building-2","Work experience","optional")}
            <p class="pf-hint">Add your previous roles so recruiters can see your background.</p>
            <div id="workEntries" class="pf-entries">
              ${(((y=o.candidate)==null?void 0:y.workHistory)||[]).map((b,M)=>Ua(M,b)).join("")}
            </div>
            <button type="button" id="addWorkEntry" class="pf-add-btn">
              ${g("plus")} Add position
            </button>
          </div>

        </div>

        <!-- ── Certifications ── -->
        <div class="pf-tab-panel" data-tab-panel="certifications" hidden>
          <div class="pf-card" id="certCard">
            ${ie("graduation-cap","Certifications &amp; courses","optional")}
            <p class="pf-hint">Add certificates, licences, or courses relevant to your work.</p>
            <div id="certEntries" class="pf-entries">
              ${(((w=o.candidate)==null?void 0:w.certifications)||[]).map((b,M)=>Ra(M,b)).join("")}
            </div>
            <button type="button" id="addCertEntry" class="pf-add-btn">
              ${g("plus")} Add certificate
            </button>
          </div>
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

      ${o.showDeleteAccountModal?`
      <div class="nw-modal-overlay" id="deleteAccountOverlay">
        <div class="nw-modal">
          <h3>Delete your account?</h3>
          <p>This will permanently delete your profile, resume, applications, and assessment history from Nearwork. This cannot be undone.</p>
          <label class="pf-field">
            <span class="pf-label" style="text-transform:none;">Type DELETE to confirm</span>
            <input class="pf-input" id="deleteConfirmInput" autocomplete="off" />
          </label>
          ${o.deleteAccountStatus==="error"?`<div class="nw-modal-error">${S(o.deleteAccountError||"Something went wrong.")}</div>`:""}
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
  `}function xt(){const e=Ma(),a=e.filter(t=>t.done).length;return Math.max(25,Math.round(a/e.length*100))}function Ts(){const e=o.applications[0];return(e==null?void 0:e.stage)||(e==null?void 0:e.status)||"profile-review"}function Ns(e){const a=String(e).toLowerCase().replace(/_/g,"-").replace(/\s+/g,"-"),t=Math.max(0,Qa.findIndex(n=>a.includes(n.key)||n.key.includes(a)));return`<div class="pipeline">${Qa.map((n,s)=>`<article class="${s<=t?"done":""} ${s===t?"current":""}"><span>${s+1}</span><strong>${n.label}</strong><p>${n.help}</p></article>`).join("")}</div>`}function Ms(){return`
    <div class="nw-empty">
      ${g("briefcase-business")}
      <strong>No active pipeline yet</strong>
      <p>Browse current openings and apply when you find a role that fits. Nearwork will show your applications here once you apply.</p>
      <div style="display:flex;gap:8px;margin-top:12px;">
        <button class="nw-btn-primary" type="button" data-page="matches">${g("sparkles")} View matches</button>
        <a class="nw-btn-secondary" href="https://jobs.nearwork.co" target="_blank" rel="noreferrer">${g("external-link")} Open jobs</a>
      </div>
    </div>
  `}function Et(){try{return new Set(JSON.parse(localStorage.getItem("nw_talent_applied")||"[]"))}catch{return new Set}}function _s(e){const a=Ee(e),n=new Set(o.applications.map(l=>l.jobId||l.openingCode)).has(a.code)||Et().has(a.code),s=Ta(a),i=a.match||(s.length>=3?Math.min(97,70+s.length*4):null),c=["#10A07C","#EC4E7E","#3B82F6","#F4A52E"],r=c[a.orgName.length%c.length],d=a.orgName.split(/\s+/).slice(0,2).map(l=>l[0]).join("").toUpperCase(),u=`https://jobs.nearwork.co/apply?code=${encodeURIComponent(a.code)}`,m=(s.length?s:a.skills).slice(0,3);return`
    <div class="nw-match-card">
      <div class="nw-match-card-top">
        <div class="nw-match-avatar" style="background:${r};">${d}</div>
        ${i?`<div class="nw-match-score">${i}% match</div>`:""}
      </div>
      <div class="nw-match-role">${S(a.title)}</div>
      <div class="nw-match-company">${S(a.orgName)} · ${S(a.location)}</div>
      <div class="nw-match-chips">${m.map(S).map(l=>`<span class="nw-match-chip">${l}</span>`).join("")}</div>
      <div class="nw-match-footer">
        <span class="nw-match-salary">${S(a.compensation)}</span>
        <button type="button" class="nw-match-view" data-open-url="${k(u)}">View opening ${g("arrow-up-right")}</button>
      </div>
      <button class="nw-match-applybtn${n?" applied":""}" type="button" data-apply="${a.code}" ${n?"disabled":""}>${n?`${g("check")} Applied`:`Apply now ${g("arrow-right")}`}</button>
    </div>
  `}function qs(e,a){const t=String(e.stage||e.status||"applied").toLowerCase(),n=t.includes("offer")?4:t.includes("final")?3:t.includes("interview")?2:t.includes("assessment")?1:0,s=e.clientName||e.company||"Nearwork client",i=s.split(/\s+/).slice(0,2).map(u=>u[0]).join("").toUpperCase(),c=["#10A07C","#EC4E7E","#3B82F6","#F4A52E","#8B5CF6"],r=c[s.length%c.length],d=["action-needed","interview-scheduled","assessment-sent"].includes(String(e.status||"").toLowerCase());return`
    <div class="nw-app-row${a?" last":""}">
      <div class="nw-app-avatar" style="background:${r};">${i}</div>
      <div class="nw-app-info">
        <div class="nw-app-title">${S(e.jobTitle||e.title||"Application")} <span class="nw-app-company">· ${S(s)}</span></div>
        <div class="nw-app-stages">
          ${dt.map((u,m)=>`<div class="nw-stage-pip${m<=n?" done":""}"></div>`).join("")}
          <span class="nw-app-stage-label">${e.stage||e.status||"Applied"}</span>
        </div>
      </div>
      <div class="nw-app-meta">
        <span class="nw-app-status${d?" action":""}">${e.status||"In review"}</span>
        <div class="nw-app-date">${da(e.updatedAt||e.createdAt)}</div>
      </div>
      ${g("chevron-right")}
    </div>`}function Is(e=!1){var i;const a=((i=o.candidate)==null?void 0:i.recruiter)||{},t=a.email||"support@nearwork.co",n=a.whatsapp||cn,s=a.whatsappUrl||dn;return`<article class="recruiter-card"><div class="avatar recruiter-avatar">NW</div><div><strong>${a.name||"Nearwork Support"}</strong><p><a href="mailto:${t}">${t}</a></p><p><a href="${s}" target="_blank" rel="noreferrer">WhatsApp ${n}</a></p>${e?"<span>Questions about assessments, interviews, feedback, or CV selection should go here.</span>":""}</div></article>`}function Pt(e,a){return`<div class="empty-state">${g("inbox")}<strong>${e}</strong><p>${a}</p></div>`}function Ds(e){const a=(e==null?void 0:e.title)||(e==null?void 0:e.role)||"this role",t=document.createElement("div");t.className="nw-modal-overlay",t.innerHTML=`
    <div class="nw-modal" style="text-align:center;padding:32px 28px;">
      <div style="font-size:48px;margin-bottom:12px;">🎉</div>
      <h3 style="font-size:18px;margin-bottom:10px;">Application submitted!</h3>
      <p style="margin-bottom:6px;">You've applied to <strong>${S(a)}</strong>. Our team will review your profile and reach out with next steps shortly.</p>
      <p style="font-size:12px;color:var(--light);margin-bottom:20px;">You can track your application status in the Applications tab.</p>
      <button type="button" class="pf-btn-primary" id="dismissApplySuccess" style="padding:11px 28px;border-radius:99px;font-size:14px;">Got it</button>
    </div>`,document.body.appendChild(t),t.addEventListener("click",n=>{(n.target===t||n.target.id==="dismissApplySuccess")&&t.remove()}),document.getElementById("dismissApplySuccess").focus()}function Us(){Xe.innerHTML='<main class="loading-screen"><span class="logo-mark">N</span><p>Loading Talent...</p></main>'}async function Bs(e){var a;try{const t=await((a=B.currentUser)==null?void 0:a.getIdToken().catch(()=>""));if(t){const n=await fetch("/api/auth-handoff",{method:"POST",headers:{Authorization:"Bearer "+t,"Content-Type":"application/json"}});if(n.ok){const{customToken:s}=await n.json();if(s){const i=new URL(e);i.searchParams.set("ct",s),window.open(i.toString(),"_blank","noreferrer");return}}}}catch{}window.open(e,"_blank","noreferrer")}function Rs(){var e,a,t,n,s,i,c,r,d,u,m,l,p,h,x,P,N,L,E,U,W,z,te,J,V,ne;(e=document.querySelector("#signOut"))==null||e.addEventListener("click",async()=>{await ga(B),G&&G(),G=null,Qe=!1,K=!1,de=null,window.history.pushState({page:"overview"},"","/"),C({user:null,candidate:null,applications:[],assessments:[],jobs:[],view:"login",activePage:"overview",message:""})}),(a=document.querySelector("#mobileSignOut"))==null||a.addEventListener("click",async()=>{await ga(B),G&&G(),G=null,Qe=!1,K=!1,de=null,window.history.pushState({page:"overview"},"","/"),C({user:null,candidate:null,applications:[],assessments:[],jobs:[],view:"login",activePage:"overview",message:""})}),(t=document.querySelector("#signIn"))==null||t.addEventListener("click",()=>{window.history.pushState({page:"overview"},"","/"),C({view:"login",activePage:"overview",message:""})}),(n=document.querySelector("#openDeleteAccount"))==null||n.addEventListener("click",()=>{C({showDeleteAccountModal:!0,deleteAccountStatus:null,deleteAccountError:""})}),(s=document.querySelector("#cancelDeleteAccount"))==null||s.addEventListener("click",()=>{C({showDeleteAccountModal:!1,deleteAccountStatus:null,deleteAccountError:""})}),(i=document.querySelector("#confirmDeleteAccount"))==null||i.addEventListener("click",async()=>{var v,y;if(((y=(v=document.querySelector("#deleteConfirmInput"))==null?void 0:v.value)==null?void 0:y.trim())!=="DELETE"){C({deleteAccountStatus:"error",deleteAccountError:'Type "DELETE" to confirm.'});return}C({deleteAccountStatus:"deleting"});try{await an(),await ga(B),G&&G(),G=null,Qe=!1,K=!1,de=null,window.history.pushState({page:"overview"},"","/"),C({user:null,candidate:null,applications:[],assessments:[],jobs:[],view:"login",activePage:"overview",showDeleteAccountModal:!1,deleteAccountStatus:null,deleteAccountError:"",message:"Your account has been deleted. You're welcome to sign up again anytime."})}catch(w){C({deleteAccountStatus:"error",deleteAccountError:w.message||"Failed to delete account."})}}),document.querySelectorAll("[data-page]").forEach(f=>{f.addEventListener("click",v=>{const w=(v.currentTarget.closest("[data-page]")||v.currentTarget).dataset.page;if(o.activePage==="profile"&&K&&w!=="profile"){de=w,C({showUnsavedChangesModal:!0});return}Ve(w)})}),(c=document.querySelector("[data-dashboard-home]"))==null||c.addEventListener("click",()=>{if(o.activePage==="profile"&&K){de="overview",C({showUnsavedChangesModal:!0});return}Ve("overview")}),(r=document.querySelector("#cancelUnsavedNav"))==null||r.addEventListener("click",()=>{de=null,C({showUnsavedChangesModal:!1})}),(d=document.querySelector("#discardUnsavedNav"))==null||d.addEventListener("click",()=>{K=!1;const f=de;de=null,C({showUnsavedChangesModal:!1}),f&&Ve(f)}),(u=document.querySelector("#saveUnsavedNav"))==null||u.addEventListener("click",()=>{var f;C({showUnsavedChangesModal:!1}),(f=document.querySelector("#profileForm"))==null||f.requestSubmit()}),(m=document.querySelector("#notificationBell"))==null||m.addEventListener("click",()=>{C({notificationPanelOpen:!o.notificationPanelOpen,notificationSettingsOpen:!1})}),(l=document.querySelector("#notificationSettings"))==null||l.addEventListener("click",()=>{C({notificationSettingsOpen:!o.notificationSettingsOpen,notificationPanelOpen:!1})}),document.querySelectorAll("[data-notification-read]").forEach(f=>{f.addEventListener("click",async()=>{const v=f.dataset.notificationRead;o.user&&he&&await on(v).catch(()=>null),C({notifications:o.notifications.map(y=>y.id===v?{...y,read:!0}:y)})})}),document.querySelectorAll("[data-notification-pref]").forEach(f=>{f.addEventListener("change",async()=>{var b;const v=structuredClone(((b=o.candidate)==null?void 0:b.notificationPreferences)||{}),y=f.dataset.notificationPref,w=f.dataset.channel;v[y]={...v[y]||{},[w]:f.checked},C({candidate:{...o.candidate,notificationPreferences:v}}),o.user&&he&&await rn(o.user.uid,v).catch(()=>null)})}),document.querySelectorAll("[data-assessment-jump]").forEach(f=>{f.addEventListener("click",async()=>{var ee,H,A;const v=Ae()||((ee=(o.assessments||[])[0])==null?void 0:ee.id),y=(o.assessments||[]).find(I=>I.id===v),w=Number(f.dataset.assessmentJump||0),b=(H=y==null?void 0:y.questions)==null?void 0:H[w];if(!v||!b)return;await He(v,"__progress__","",{currentQuestionIndex:w,totalQuestions:((A=y==null?void 0:y.questions)==null?void 0:A.length)||70,currentStage:b.stage||1}),Ie(v,w);const M=(o.assessments||[]).map(I=>I.id===v?{...I,currentQuestionIndex:w,currentStage:b.stage||1}:I);C({assessments:M,activePage:"assessment",message:""})})}),document.querySelector("#availability").addEventListener("change",async f=>{const v=f.target.value;C({candidate:{...o.candidate,availability:v}}),o.user&&he?await en(o.user.uid,v):C({message:"Sign in to save availability."})}),(p=document.querySelector("#filterMatches"))==null||p.addEventListener("click",()=>{const f=ea().length>=3;C({matchesFiltered:f?!o.matchesFiltered:!1,message:f?"":"Add at least 5 skills in Profile first, then filter matching openings."})}),(h=document.querySelector("#departmentSelect"))==null||h.addEventListener("change",f=>{const v=document.querySelector("#citySelect"),y=Ye[f.target.value]||[];v.innerHTML=y.map(w=>`<option value="${k(w)}">${w}</option>`).join("")}),(x=document.querySelector("#countrySelect"))==null||x.addEventListener("change",f=>{const v=f.target.value==="Colombia",y=document.querySelector("#pfCoLoc"),w=document.querySelector("#pfCoHint");y&&(y.style.display=v?"":"none"),w&&(w.style.display=v?"none":"block")}),(P=document.querySelector("#roleGroupSelect"))==null||P.addEventListener("change",f=>{const v=document.querySelector("#targetRoleSelect");v.innerHTML=ft(f.target.value,"")}),(N=document.querySelector("#salaryCurrencyInput"))==null||N.addEventListener("change",f=>{const v=document.querySelector("#salaryInput");if(!v)return;const y=Ja(v.value,f.target.value);f.target.value=y,v.placeholder=y==="COP"?"5,000,000":"2,500",v.value=Aa(v.value,y)}),(L=document.querySelector("#salaryInput"))==null||L.addEventListener("blur",f=>{const v=document.querySelector("#salaryCurrencyInput"),y=Ja(f.target.value,(v==null?void 0:v.value)||"USD");v&&(v.value=y),f.target.placeholder=y==="COP"?"5,000,000":"2,500",f.target.value=Aa(f.target.value,y)}),Ks(),Qs(),Os(),Vs(),zs(),Fs(),document.querySelectorAll("[data-open-url]").forEach(f=>{f.addEventListener("click",()=>Bs(f.dataset.openUrl))}),document.querySelectorAll("[data-apply]").forEach(f=>{f.addEventListener("click",async()=>{const v=o.jobs.map(Ee).find(w=>w.code===f.dataset.apply),y=f.dataset.apply;if(f.disabled=!0,f.textContent="Submitting...",o.user&&he){try{const w=Et();w.add(y),localStorage.setItem("nw_talent_applied",JSON.stringify([...w]))}catch{}await Xt(o.user.uid,v),f.textContent=`${g("check")} Applied`,f.classList.add("applied"),Ds(v)}else C({message:"Sign in to apply to this opening."})})}),(E=document.querySelector("#showTechIntro"))==null||E.addEventListener("click",()=>{C({assessmentUiStep:"techIntro",message:""})}),(U=document.querySelector("#backToWelcome"))==null||U.addEventListener("click",()=>{C({assessmentUiStep:null,message:""})}),(W=document.querySelector("#startDiscAssessment"))==null||W.addEventListener("click",async()=>{var H;const f=Ae()||((H=(o.assessments||[])[0])==null?void 0:H.id),v=(o.assessments||[]).find(A=>A.id===f);if(!f||!v)return;const y=v.questions||[],w=document.querySelector("#startDiscAssessment"),b=w?Number(w.dataset.discIndex||50):y.findIndex(A=>Number(A.stage||1)===2),M=b>=0?b:50,ee=new Date().toISOString();try{await He(f,"__progress__","",{currentQuestionIndex:M,totalQuestions:y.length,currentStage:2,discStartedAt:ee}),Ie(f,M);const A=(o.assessments||[]).map(I=>I.id===f?{...I,currentQuestionIndex:M,currentStage:2,discStartedAt:ee}:I);C({assessments:A,activePage:"assessment",assessmentUiStep:null,message:""})}catch(A){C({message:Te(A)})}}),(z=document.querySelector("#startAssessment"))==null||z.addEventListener("click",async()=>{var y;const f=Ae()||((y=(o.assessments||[])[0])==null?void 0:y.id),v=(o.assessments||[]).find(w=>w.id===f)||(o.assessments||[])[0];if(!f||!o.user){C({message:"Please log in to start your assessment."});return}try{await Zt(f,o.user.uid),Ie(f,Number((v==null?void 0:v.currentQuestionIndex)||0),!0);const w=(o.assessments||[]).map(b=>b.id===f?{...b,status:"started",startedAt:b.startedAt||new Date().toISOString(),technicalStartedAt:b.technicalStartedAt||new Date().toISOString()}:b);C({assessments:w,activePage:"assessment",assessmentUiStep:null,message:""})}catch(w){C({message:Te(w)})}}),(te=document.querySelector("#prevAssessmentQuestion"))==null||te.addEventListener("click",async()=>{var ee,H,A,I;const f=Ae()||((ee=(o.assessments||[])[0])==null?void 0:ee.id),v=(o.assessments||[]).find(pe=>pe.id===f),y=Number(((H=document.querySelector("#assessmentQuestionForm"))==null?void 0:H.dataset.currentIndex)??(v==null?void 0:v.currentQuestionIndex)??0),w=Math.max(0,y-1),b=(A=v==null?void 0:v.questions)==null?void 0:A[w];await He(f,"__progress__","",{currentQuestionIndex:w,totalQuestions:((I=v==null?void 0:v.questions)==null?void 0:I.length)||70,currentStage:(b==null?void 0:b.stage)||1}),Ie(f,w);const M=(o.assessments||[]).map(pe=>pe.id===f?{...pe,currentQuestionIndex:w,currentStage:(b==null?void 0:b.stage)||1}:pe);C({assessments:M,activePage:"assessment",message:""})}),(J=document.querySelector("#assessmentQuestionForm"))==null||J.addEventListener("submit",async f=>{var Re;f.preventDefault();const v=Ae()||((Re=(o.assessments||[])[0])==null?void 0:Re.id),y=(o.assessments||[]).find(F=>F.id===v),w=(y==null?void 0:y.questions)||[],b=Number(f.currentTarget.dataset.currentIndex??(y==null?void 0:y.currentQuestionIndex)??0),M=w[b],ee=new FormData(f.currentTarget).get("answer");if(!M){C({message:"This question could not be loaded. Please refresh and try again."});return}const H=ee===null?{value:"",skipped:!0,answeredAt:new Date().toISOString()}:{value:Number(ee),skipped:!1,answeredAt:new Date().toISOString()},A={...y.answers||{},[M.id]:H},I=w[b+1],pe=I&&Number(I.stage||1)!==Number(M.stage||1),_e=ka(y,M.stage,A);try{if((pe||b+1>=w.length)&&_e.length){await He(v,M.id,A[M.id],{currentQuestionIndex:b,totalQuestions:w.length,currentStage:M.stage||1});const F=(o.assessments||[]).map(se=>se.id===v?{...se,answers:A,currentQuestionIndex:b,currentStage:M.stage||1,progress:`${b+1}/${w.length}`}:se);C({assessments:F,activePage:"assessment",message:`You missed ${_e.length} question${_e.length===1?"":"s"} in the ${Na(M.stage)}.`});return}if(b+1>=w.length){const F=Ss(y,A),se=Cs(y,A);await Kt(v,A,{totalQuestions:w.length,technicalScore:F.technicalScore,discScore:F.discScore,score:Math.round(F.technicalScore*.75+F.discScore*.25),discProfile:se}),fetch("https://admin.nearwork.co/api/generate-assessment-insights",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({assessmentId:v})}).catch(()=>null),$s(y,{score:Math.round(F.technicalScore*.75+F.discScore*.25),technicalScore:F.technicalScore,discScore:F.discScore,discProfile:se}).catch(ke=>console.warn(ke));const $e=(o.assessments||[]).map(ke=>ke.id===v?{...ke,answers:A,status:"completed",score:Math.round(F.technicalScore*.75+F.discScore*.25),technical:F.technicalScore,disc:se.label,discProfile:se,progress:`${w.length}/${w.length}`}:ke);C({assessments:$e,activePage:"assessment",message:""})}else{const F=M.stage===1&&(I==null?void 0:I.stage)===2&&!y.discStartedAt;await He(v,M.id,A[M.id],{currentQuestionIndex:b+1,totalQuestions:w.length,currentStage:(I==null?void 0:I.stage)||M.stage||1}),Ie(v,b+1);const se=(o.assessments||[]).map($e=>$e.id===v?{...$e,answers:A,currentQuestionIndex:b+1,currentStage:(I==null?void 0:I.stage)||M.stage||1,progress:`${b+1}/${w.length}`}:$e);C({assessments:se,activePage:"assessment",message:"",assessmentUiStep:F?"discIntro":null})}}catch(F){C({message:Te(F)})}}),(V=document.querySelector("#profileForm"))==null||V.addEventListener("submit",async f=>{var pe,_e,Re,F,se,$e,ke,Fa,Oa,ja;f.preventDefault();const v=new FormData(f.currentTarget),y=v.get("country")||"Colombia",w=y==="Colombia",b=w?v.get("department"):"",M=w?v.get("city"):"",ee=String(y).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,""),H=ht(v.get("salary"),v.get("salaryCurrency")),A=v.get("marketingConsent")==="on",I={name:Be(v.get("name")),targetRole:v.get("targetRole"),headline:v.get("targetRole"),department:b,city:M,locationId:w?`${String(M).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g,"-")}-co`:ee,location:w?`${M}, ${b}`:y,locationCity:M,locationDepartment:b,locationCountry:y,english:v.get("english"),salary:H.salary,salaryUSD:H.salaryUSD,salaryAmount:H.salaryAmount,salaryCurrency:H.salaryCurrency,expectedSalaryAmount:H.salaryAmount,expectedSalaryCurrency:H.salaryCurrency,linkedin:v.get("linkedin"),whatsapp:v.get("whatsapp"),phone:v.get("whatsapp"),skills:[...new Set(v.getAll("skills").map(Ce).filter(Boolean))],otherSkills:[],languages:Hs(),summary:v.get("summary"),email:((pe=o.candidate)==null?void 0:pe.email)||((_e=o.user)==null?void 0:_e.email)||"",availability:((Re=o.candidate)==null?void 0:Re.availability)||"open",marketingConsent:A,marketingConsentAt:A?((F=o.candidate)==null?void 0:F.marketingConsent)===!0?((se=o.candidate)==null?void 0:se.marketingConsentAt)||null:new Date().toISOString():null,onboarded:!0};if(!o.user){C({candidate:{...o.candidate,...I},message:"Preview updated. Sign in to save this profile."});return}try{const qe=v.get("photo");let za=(($e=o.candidate)==null?void 0:$e.photoURL)||((ke=o.user)==null?void 0:ke.photoURL)||"";qe!=null&&qe.name&&(za=await nn(o.user.uid,qe));const aa=(Fa=v.get("profileCv"))!=null&&Fa.name?v.get("profileCv"):ra;let Pe=null,Ha=!1;if(aa!=null&&aa.name)try{Pe=await Ca(o.user.uid,aa,v.get("profileCvLabel")||""),ra=null}catch{Ha=!0}const pa={...I,photoURL:za,candidateCode:(Oa=o.candidate)==null?void 0:Oa.candidateCode,...Pe?{activeCvId:Pe.id,activeCvName:Pe.name||Pe.fileName,cvUrl:Pe.url,cvLibrary:[...((ja=o.candidate)==null?void 0:ja.cvLibrary)||[],Pe]}:{},workHistory:(()=>{var Fe,Oe,je,ze;const Le=js();return Le.length?Le:(Fe=oe==null?void 0:oe.workHistory)!=null&&Fe.length&&(De||!((je=(Oe=o.candidate)==null?void 0:Oe.workHistory)!=null&&je.length))?oe.workHistory:((ze=o.candidate)==null?void 0:ze.workHistory)||[]})(),certifications:(()=>{var Fe,Oe,je,ze;const Le=Gs();return Le.length?Le:(Fe=oe==null?void 0:oe.certifications)!=null&&Fe.length&&(De||!((je=(Oe=o.candidate)==null?void 0:Oe.certifications)!=null&&je.length))?oe.certifications:((ze=o.candidate)==null?void 0:ze.certifications)||[]})()};oe=null,De=!1;const ma=await Ke(o.user.uid,pa),Tt=Ha?"Profile saved, but the CV failed to upload. Try uploading it again from the CV section.":(ma==null?void 0:ma.atsSynced)===!1?"Profile saved. Nearwork will finish connecting it to your workspace.":"Profile saved.";if(v.get("mode")==="onboarding")window.history.pushState({page:"overview"},"","/"),C({candidate:{...o.candidate,...pa},activePage:"overview",message:"Profile complete. Welcome to Talent."});else if(K=!1,C({candidate:{...o.candidate,...pa},message:Tt,showUnsavedChangesModal:!1}),de){const Le=de;de=null,Ve(Le)}}catch(qe){C({message:Te(qe)})}}),(ne=document.querySelector("#cvForm"))==null||ne.addEventListener("submit",async f=>{var w;f.preventDefault();const v=new FormData(f.currentTarget),y=v.get("cv");if(y!=null&&y.name){if(!o.user){C({message:"Sign in to upload and store CVs."});return}try{const b=await Ca(o.user.uid,y,v.get("label"));C({candidate:{...o.candidate,cvLibrary:[...((w=o.candidate)==null?void 0:w.cvLibrary)||[],b],activeCvId:b.id},message:"CV uploaded."})}catch(b){C({message:Te(b)})}}})}function Fs(){var s;const e=document.querySelectorAll(".pf-tab"),a=document.querySelectorAll(".pf-tab-panel");if(!e.length||!a.length)return;const t=i=>{e.forEach(c=>c.classList.toggle("active",c.dataset.tab===i)),a.forEach(c=>{c.hidden=c.dataset.tabPanel!==i})};e.forEach(i=>{i.addEventListener("click",()=>t(i.dataset.tab))}),(s=document.querySelector("#profileForm"))==null||s.addEventListener("invalid",i=>{const c=i.target.closest(".pf-tab-panel");c&&t(c.dataset.tabPanel)},!0);const n=document.querySelector("#profileForm");n==null||n.addEventListener("input",()=>{K=!0}),n==null||n.addEventListener("change",()=>{K=!0})}function Os(){const e=document.querySelector("#workHistoryCard");if(!e)return;let a=e.querySelectorAll(".work-entry").length;e.addEventListener("click",t=>{var s;const n=t.target.closest(".remove-work-entry");if(n){(s=n.closest(".work-entry"))==null||s.remove(),K=!0;return}if(t.target.closest("#addWorkEntry")){const i=document.querySelector("#workEntries");if(!i)return;const c=document.createElement("div");c.innerHTML=Ua(a++,{}),i.appendChild(c.firstElementChild),K=!0}})}function js(){return[...document.querySelectorAll(".work-entry")].map(e=>{const a=t=>{var n,s;return((s=(n=e.querySelector(`[data-field="${t}"]`))==null?void 0:n.value)==null?void 0:s.trim())||""};return{title:a("title"),company:a("company"),from:a("from"),to:a("to")}}).filter(e=>e.title||e.company)}function zs(){const e=document.querySelector("#langCard");if(!e)return;let a=e.querySelectorAll(".lang-entry").length;e.addEventListener("click",t=>{var s;const n=t.target.closest(".remove-lang-entry");if(n){(s=n.closest(".lang-entry"))==null||s.remove(),K=!0;return}if(t.target.closest("#addLangEntry")){const i=document.querySelector("#langEntries");if(!i)return;const c=document.createElement("div");c.innerHTML=Ba(a++,{}),i.appendChild(c.firstElementChild),K=!0}})}function Hs(){return[...document.querySelectorAll(".lang-entry")].map(e=>{const a=t=>{var n,s;return((s=(n=e.querySelector(`[data-field="${t}"]`))==null?void 0:n.value)==null?void 0:s.trim())||""};return{name:a("name"),level:a("level")}}).filter(e=>e.name)}function Vs(){const e=document.querySelector("#certCard");if(!e)return;let a=e.querySelectorAll(".cert-entry").length;e.addEventListener("click",t=>{var s;const n=t.target.closest(".remove-cert-entry");if(n){(s=n.closest(".cert-entry"))==null||s.remove(),K=!0;return}if(t.target.closest("#addCertEntry")){const i=document.querySelector("#certEntries");if(!i)return;const c=document.createElement("div");c.innerHTML=Ra(a++,{}),i.appendChild(c.firstElementChild),K=!0}})}function Gs(){return[...document.querySelectorAll(".cert-entry")].map(e=>{const a=t=>{var n,s;return((s=(n=e.querySelector(`[data-field="${t}"]`))==null?void 0:n.value)==null?void 0:s.trim())||""};return{name:a("name"),issuer:a("issuer"),date:a("date")}}).filter(e=>e.name)}function Qs(){var n,s,i,c,r,d;const e=document.querySelector("#profileForm"),a=e==null?void 0:e.querySelector('input[name="profileCv"]');if(!e||!a)return;((n=e.querySelector('input[name="mode"]'))==null?void 0:n.value)==="onboarding"&&!((i=(s=o.candidate)==null?void 0:s.skills)!=null&&i.length)&&!((r=(c=o.candidate)==null?void 0:c.workHistory)!=null&&r.length)&&!((d=o.candidate)!=null&&d.name)?Ws(e,a):Js(a)}function Ws(e,a){var c;const t=document.querySelector("#profileCvCard");if(!t)return;const n=[...e.children].filter(r=>r!==t&&r.type!=="hidden"&&r.getAttribute("name")!=="mode");n.forEach(r=>{r.style.display="none"});const s=document.createElement("p");s.id="cvGatePrompt",s.style.cssText="font-size:13px;color:var(--mid);margin:10px 0 4px;text-align:center;",s.innerHTML=`Upload your CV and we'll fill in the rest for you — or <button type="button" id="skipCvParse" style="background:none;border:none;padding:0;font-size:13px;color:var(--green);cursor:pointer;text-decoration:underline;">skip and fill in manually</button>`,t.insertAdjacentElement("afterend",s);function i(){var r,d;(r=document.querySelector("#cvGatePrompt"))==null||r.remove(),(d=document.querySelector("#cvParseLoading"))==null||d.remove(),n.forEach(u=>{u.style.display=""})}(c=document.querySelector("#skipCvParse"))==null||c.addEventListener("click",i),a.addEventListener("change",async()=>{var m,l;const r=(m=a.files)==null?void 0:m[0];if(!r)return;(l=document.querySelector("#cvGatePrompt"))==null||l.remove();const d=document.createElement("p");d.id="cvParseLoading",d.style.cssText="font-size:13px;font-weight:600;color:var(--green);padding:14px 0;text-align:center;",d.textContent="Analysing your CV…",t.insertAdjacentElement("afterend",d),oe=null,De=!0;const u=await La(r);i(),u&&(oe=u,Ys(u,!0),Zs(u,a))})}function Js(e){e.addEventListener("change",async()=>{var r,d,u,m,l,p,h,x,P;const a=(r=e.files)==null?void 0:r[0];if(!a)return;oe=null,De=!1,ra=null,C({message:"⏳ Analysing your CV — this takes up to 30 seconds…"});const t=await La(a);if(!t){C({message:"⚠️ Could not read your CV. Check the browser console for details, or try a different file."});return}oe=t,De=!0,ra=a;const n=o.candidate||{},s={...n,...t.name?{name:t.name}:{},...t.phone?{whatsapp:t.phone,phone:t.phone}:{},...t.summary?{summary:t.summary}:{},skills:(d=t.skills)!=null&&d.length?[...new Set(t.skills.map(Ce).filter(Boolean))]:n.skills||[],workHistory:(u=t.workHistory)!=null&&u.length?t.workHistory:n.workHistory||[],certifications:(m=t.certifications)!=null&&m.length?t.certifications:n.certifications||[],languages:(l=t.languages)!=null&&l.length?t.languages:n.languages||[]},i=[];t.name&&i.push("name"),t.phone&&i.push("phone"),t.summary&&i.push("summary"),(p=t.skills)!=null&&p.length&&i.push(`${t.skills.length} skill${t.skills.length!==1?"s":""}`),(h=t.workHistory)!=null&&h.length&&i.push(`${t.workHistory.length} role${t.workHistory.length!==1?"s":""}`),(x=t.certifications)!=null&&x.length&&i.push(`${t.certifications.length} cert${t.certifications.length!==1?"s":""}`),(P=t.languages)!=null&&P.length&&i.push("languages");const c=i.length?`✓ Pre-filled from CV: ${i.join(", ")}. Review and save your profile.`:"✓ CV analysed. Review your profile and save.";C({candidate:s,message:c})})}function Ys(e,a){var n,s,i,c,r;const t=(d,u)=>{const m=document.querySelector(d);m&&u&&a&&(m.value=u)};if(t('input[name="name"]',e.name),t('input[name="whatsapp"]',e.phone),t('textarea[name="summary"]',e.summary),(n=e.skills)!=null&&n.length){const d=document.querySelector("#selectedSkills");if(d){d.innerHTML="";const u=new Set([...d.querySelectorAll('input[name="skills"]')].map(l=>l.value.toLowerCase()));(s=d.querySelector(".skill-empty"))==null||s.remove(),[...new Set(e.skills.map(Ce).filter(Boolean))].forEach(l=>{if(u.has(l.toLowerCase()))return;u.add(l.toLowerCase());const p=document.createElement("span");p.className="selected-skill",p.setAttribute("data-skill-chip",l),p.innerHTML=`${S(l)}<button type="button" class="skill-remove" data-remove-skill="${k(l)}" aria-label="Remove ${k(l)}">×</button><input type="hidden" name="skills" value="${k(l)}" />`,d.appendChild(p)})}}if((i=e.workHistory)!=null&&i.length){const d=document.querySelector("#workEntries");if(d){d.innerHTML="";let u=d.querySelectorAll(".work-entry").length;e.workHistory.forEach(m=>{const l=document.createElement("div");l.innerHTML=Ua(u++,m),d.appendChild(l.firstElementChild)})}}if((c=e.languages)!=null&&c.length){const d=document.querySelector("#langEntries");if(d){d.innerHTML="";let u=d.querySelectorAll(".lang-entry").length;e.languages.forEach(m=>{const l=document.createElement("div");l.innerHTML=Ba(u++,m),d.appendChild(l.firstElementChild)})}}if((r=e.certifications)!=null&&r.length){const d=document.querySelector("#certEntries");if(d){d.innerHTML="";let u=d.querySelectorAll(".cert-entry").length;e.certifications.forEach(m=>{const l=document.createElement("div");l.innerHTML=Ra(u++,m),d.appendChild(l.firstElementChild)})}}ce()}function Zs(e,a){var s,i,c,r,d;const t=[];e.name&&t.push("name"),e.phone&&t.push("phone"),(s=e.skills)!=null&&s.length&&t.push(`${e.skills.length} skill${e.skills.length>1?"s":""}`),(i=e.workHistory)!=null&&i.length&&t.push(`${e.workHistory.length} role${e.workHistory.length>1?"s":""}`),(c=e.certifications)!=null&&c.length&&t.push(`${e.certifications.length} cert${e.certifications.length>1?"s":""}`),(r=e.languages)!=null&&r.length&&t.push("languages"),(d=document.querySelector("#cvParseHint"))==null||d.remove();const n=document.createElement("p");n.id="cvParseHint",n.style.cssText="font-size:12px;color:var(--green);margin:4px 0 0;",n.innerHTML=t.length?`✓ Pre-filled: <strong>${t.join(", ")}</strong>. Review and save.`:"✓ CV analysed. Review your profile and save.",a.insertAdjacentElement("afterend",n)}function Ks(){var d;const e=document.querySelector("[data-skill-search]");if(!e)return;const a=e.querySelector("#skillSearchInput"),t=e.querySelector("#skillSuggestions"),n=e.querySelector("#selectedSkills"),s=()=>[...n.querySelectorAll('input[name="skills"]')].map(u=>u.value),i=u=>{n.innerHTML=u.length?u.map(m=>`
      <span class="selected-skill" data-skill-chip="${k(m)}">
        ${S(m)}
        <button type="button" class="skill-remove" data-remove-skill="${k(m)}" aria-label="Remove ${k(m)}">×</button>
        <input type="hidden" name="skills" value="${k(m)}" />
      </span>`).join(""):'<span class="skill-empty">Selected skills will appear here.</span>'},c=()=>{const u=Z(a.value),m=a.value.trim(),l=new Set(s().map(Z)),p=ct.filter(N=>!l.has(Z(N))).filter(N=>!u||Z(N).includes(u)).slice(0,12),h=p.find(N=>Z(N)===u),P=m.length>1&&!l.has(Z(m))&&!h?`<button type="button" class="skill-suggestion add-custom" data-skill="${k(m)}">+ Add "${S(m)}"</button>`:"";t.innerHTML=P+p.map(N=>`<button type="button" class="skill-suggestion" data-skill="${k(N)}">${S(N)}</button>`).join("")},r=u=>{const m=(u||a.value).trim(),l=Ce(m);if(!l)return;const p=Z(l),h=s();if(h.length>=20&&!h.some(P=>Z(P)===p)){a.value="";return}const x=[...h.filter(P=>Z(P)!==p),l];i(x),a.value="",c(),K=!0};a==null||a.addEventListener("input",c),a==null||a.addEventListener("focus",c),a==null||a.addEventListener("keydown",u=>{if(u.key!=="Enter")return;u.preventDefault();const m=Z(a.value),l=[...t.querySelectorAll(".skill-suggestion:not(.add-custom)")].find(p=>Z(p.dataset.skill)===m);r((l==null?void 0:l.dataset.skill)||a.value)}),(d=e.querySelector("#addTypedSkill"))==null||d.addEventListener("click",()=>r(a.value)),t.addEventListener("click",u=>{const m=u.target.closest("[data-skill]");m&&r(m.dataset.skill)}),n.addEventListener("click",u=>{const m=u.target.closest("[data-remove-skill]");if(!m)return;const l=Z(m.dataset.removeSkill);i(s().filter(p=>Z(p)!==l)),c(),K=!0})}function Lt(){if(o.loading)return Us();if(o.view==="reset-password")return $n();if(o.view==="dashboard"&&o.activePage==="onboarding")return Rn();if(o.view==="dashboard")return St();wt()}window.addEventListener("popstate",()=>{if(window.location.pathname==="/reset-password"){C({view:"reset-password",resetCodeStatus:null,resetCodeError:""});return}const e=la();e==="overview"&&!o.user?C({view:"login",activePage:"overview",message:""}):o.view==="dashboard"?Ve(e,!1):Ge()});const ca=new URLSearchParams(window.location.search).get("ct");ca&&window.history.replaceState({},"",window.location.pathname);let sa=!!ca;he?(qt(B,e=>{if(!sa)if(e)Ya(e);else{try{localStorage.removeItem("nw_talent_applied")}catch{}Ge()}}),window.setTimeout(()=>{o.loading&&(sa=!1,Ge())},2500),ca&&ln(ca).then(e=>{sa=!1,Ya(e.user)}).catch(()=>{sa=!1,Ge()})):Ge();
