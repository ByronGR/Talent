import{initializeApp as Ia}from"https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";import{getAuth as Da,GoogleAuthProvider as Ba,signInWithCustomToken as Ua,signInWithPopup as Ra,onAuthStateChanged as Fa,createUserWithEmailAndPassword as Oa,updateProfile as ja,signInWithEmailAndPassword as za,signOut as wt}from"https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";import{getFirestore as Ha,query as ve,collection as re,where as fe,limit as he,getDocs as we,getDoc as Me,doc as R,setDoc as te,serverTimestamp as j,onSnapshot as Va,updateDoc as Ga,addDoc as Jt,arrayUnion as At}from"https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";import{getStorage as Wa,ref as xt,uploadBytes as sa,getDownloadURL as ia,deleteObject as Qa}from"https://www.gstatic.com/firebasejs/10.12.5/firebase-storage.js";(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))n(s);new MutationObserver(s=>{for(const i of s)if(i.type==="childList")for(const l of i.addedNodes)l.tagName==="LINK"&&l.rel==="modulepreload"&&n(l)}).observe(document,{childList:!0,subtree:!0});function a(s){const i={};return s.integrity&&(i.integrity=s.integrity),s.referrerPolicy&&(i.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?i.credentials="include":s.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function n(s){if(s.ep)return;s.ep=!0;const i=a(s);fetch(s.href,i)}})();const oa={apiKey:"AIzaSyApRNyW8PoP28E0x77dUB5jOgHuTqA2by4",authDomain:"nearwork-97e3c.firebaseapp.com",projectId:"nearwork-97e3c",storageBucket:"nearwork-97e3c.firebasestorage.app",messagingSenderId:"145642656516",appId:"1:145642656516:web:0ac2da8931283121e87651",measurementId:"G-3LC8N6FFSH"},le=Object.values(oa).slice(0,6).every(Boolean),Pe=le?Ia(oa):null,U=Pe?Da(Pe):null,ct=Pe?new Ba:null;ct&&ct.setCustomParameters({prompt:"select_account"});async function Ja(){if(!U||!ct)throw new Error("Authentication is not configured.");return(await Ra(U,ct)).user}const _=Pe?Ha(Pe):null,dt=Pe?Wa(Pe):null,q={users:"users",candidates:"candidates",openings:"openings",pipelines:"pipelines",applications:"applications",assessments:"assessments",activity:"candidateActivity",notifications:"notifications",notificationPreferences:"notificationPreferences"},ra="/api/send-email-proxy";function J(){if(!Pe||!U||!_||!dt)throw new Error("Missing Firebase environment variables. Copy .env.example to .env.local and fill in the Admin app config.")}async function Ya(e={}){var i,l;const t=String(e.email||((i=U==null?void 0:U.currentUser)==null?void 0:i.email)||"").trim().toLowerCase();if(!t)return{ok:!1,skipped:!0,reason:"Missing candidate email"};const a=e.name||((l=U==null?void 0:U.currentUser)==null?void 0:l.displayName)||"",n=e.firstName||a.split(/\s+/)[0]||"there",s=await fetch(ra,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({to:t,templateId:"account_created",data:{name:a||n,firstName:n,actionUrl:"https://talent.nearwork.co"}})});return s.json().catch(()=>({ok:s.ok}))}async function Za(e={},t={}){var l,o;const a=String((e==null?void 0:e.email)||((l=U==null?void 0:U.currentUser)==null?void 0:l.email)||"").trim().toLowerCase();if(!a)return{ok:!1,skipped:!0,reason:"Missing candidate email"};const n=(e==null?void 0:e.name)||((o=U==null?void 0:U.currentUser)==null?void 0:o.displayName)||"",s=(e==null?void 0:e.firstName)||n.split(/\s+/)[0]||"there",i=await fetch(ra,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({to:a,templateId:"job_applied",data:{name:n||s,firstName:s,roleTitle:t.title||t.role||t.openingTitle||"this role",openingCode:t.code||t.id||"",actionUrl:"https://talent.nearwork.co"}})});return i.json().catch(()=>({ok:i.ok}))}async function la(e){J();const t=await Me(R(_,q.users,e));return t.exists()?{id:t.id,...t.data()}:null}async function Ka(e){J();const t=String(e||"").trim(),a=t.toLowerCase(),n=ve(re(_,q.users),fe("email","==",a),he(1)),s=await we(n);if(!s.empty)return{id:s.docs[0].id,...s.docs[0].data()};if(t===a)return null;const i=ve(re(_,q.users),fe("email","==",t),he(1)),l=await we(i);return l.empty?null:{id:l.docs[0].id,...l.docs[0].data()}}async function Xa(e){const t=await la(e.uid);if(t)return t;const a=await Ka(e.email);return a?(await da(e.uid,{...a,email:e.email,connectedFromUserId:a.id}),{...a,id:e.uid,connectedFromUserId:a.id}):null}async function ca(e,t,a){const n=await Me(R(_,q.candidates,t)).catch(()=>null),s=n!=null&&n.exists()?n.data():{};return ua(e,{...s,...a,candidateCode:t})}async function da(e,t){J();const a=t.candidateCode||Ke(e),n={...t,candidateCode:a,role:"candidate",updatedAt:j()};await te(R(_,q.users,e),n,{merge:!0}),await te(R(_,q.candidates,a),await ca(e,a,{...n,candidateCode:a}),{merge:!0}).catch(()=>null)}function Ke(e){return`CAND-${String(e||"").replace(/[^a-z0-9]/gi,"").slice(0,8).toUpperCase()||Date.now()}`}function en(e){return String(e||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"")}function Yt(e){const t=String(e||"").trim();return t.includes("@")?"":t}function ua(e,t){const a=t.candidateCode||Ke(e),n=t.location||[t.locationCity||t.city,t.locationDepartment||t.department].filter(Boolean).join(", "),s=Yt(n),i=Yt(t.locationCity||t.city||s),l=new Date().toISOString().slice(0,10);return{code:a,uid:e,ownerUid:e,name:t.name||"Talent member",role:t.targetRole||t.headline||"Nearwork candidate",skills:Array.isArray(t.skills)?t.skills:[],applied:t.applied||l,lastContact:t.lastContact||l,experience:Number(t.experience||0),location:s,city:en(i),department:t.locationDepartment||t.department||"",country:t.locationCountry||"Colombia",timezone:t.timezone||t.timeZone||"",timezoneName:t.timezoneName||"",source:"talent.nearwork.co",status:t.status||"active",score:Number(t.score||50),email:t.email||"",phone:t.whatsapp||t.phone||"",whatsapp:t.whatsapp||t.phone||"",currentRole:t.currentRole||"",salary:t.salary||"",salaryUSD:Number(t.salaryUSD||0)||null,salaryAmount:Number(t.salaryAmount||t.expectedSalaryAmount||0)||null,salaryCurrency:t.salaryCurrency||t.expectedSalaryCurrency||"USD",expectedSalaryUSD:Number(t.expectedSalaryUSD||0)||null,expectedSalaryCOP:Number(t.expectedSalaryCOP||0)||null,expectedSalaryAmount:Number(t.expectedSalaryAmount||t.salaryAmount||0)||null,expectedSalaryCurrency:t.expectedSalaryCurrency||t.salaryCurrency||"USD",expectedSalary:t.expectedSalary||t.salary||"",availability:t.availability||"open",english:t.english||"",visa:t.visa||"No",linkedin:t.linkedin||"",cv:t.activeCvName||"",cvUrl:t.cvUrl||null,photoUrl:t.photoURL||t.photoUrl||null,tags:t.tags||["talent profile"],notes:t.summary||"",summary:t.summary||"",workHistory:Array.isArray(t.workHistory)?t.workHistory:[],languages:Array.isArray(t.languages)?t.languages:[],certifications:Array.isArray(t.certifications)?t.certifications:[],appliedBefore:!!t.appliedBefore,applications:t.applications||[],pipelineCodes:t.pipelineCodes||[],loom:t.loom||"Not uploaded",assessments:t.assessments||[],work:t.work||[],updatedAt:j()}}async function tn(e){J();const t=ve(re(_,q.applications),fe("candidateId","==",e),he(20)),a=ve(re(_,q.applications),fe("ownerUid","==",e),he(20)),n=await Promise.allSettled([we(t),we(a)]),s=new Map;return n.forEach(i=>{i.status==="fulfilled"&&i.value.docs.forEach(l=>s.set(l.id,{id:l.id,...l.data()}))}),Array.from(s.values()).sort((i,l)=>{const o=d=>{var u,p;return((p=(u=d==null?void 0:d.toDate)==null?void 0:u.call(d))==null?void 0:p.getTime())??(d?new Date(d).getTime():0)};return o(l.updatedAt||l.createdAt)-o(i.updatedAt||i.createdAt)})}async function an(e,t="",a=""){J();const n=String(t||"").trim().toLowerCase(),s=String(a||"").trim(),i=[we(ve(re(_,q.assessments),fe("candidateUid","==",e),he(25))),we(ve(re(_,q.assessments),fe("candidateId","==",e),he(25)))];n&&i.push(we(ve(re(_,q.assessments),fe("candidateEmail","==",n),he(25)))),s&&i.push(we(ve(re(_,q.assessments),fe("candidateCode","==",s),he(25))));const l=await Promise.allSettled(i),o=new Map;return l.forEach(d=>{d.status==="fulfilled"&&d.value.docs.forEach(u=>o.set(u.id,{id:u.id,...u.data()}))}),Array.from(o.values()).sort((d,u)=>{const p=c=>{var m,f;return((f=(m=c==null?void 0:c.toDate)==null?void 0:m.call(c))==null?void 0:f.getTime())??(c?new Date(c).getTime():0)};return p(u.updatedAt||u.createdAt||u.sentAt)-p(d.updatedAt||d.createdAt||d.sentAt)})}async function nn(e,t,a="",n=""){J();const s=await Me(R(_,q.assessments,e));if(!s.exists())return null;const i={id:s.id,...s.data()},l=String(a||"").trim().toLowerCase(),o=String(n||"").trim();return i.candidateUid===t||i.candidateId===t||String(i.candidateEmail||"").trim().toLowerCase()===l||String(i.candidateCode||"").trim()===o?i:null}async function sn(e,t){J();const a=await Me(R(_,q.assessments,e)),n=a.exists()?a.data():{};if(n.status==="completed")throw new Error("This assessment is already completed.");if(n.expiresAt&&Date.now()>new Date(n.expiresAt).getTime())throw new Error("This assessment link has expired.");await te(R(_,q.assessments,e),{status:"started",currentQuestionIndex:Number(n.currentQuestionIndex||0),currentStage:Number(n.currentStage||1),technicalStartedAt:n.technicalStartedAt||j(),startedAt:n.startedAt||j(),updatedAt:j()},{merge:!0})}async function He(e,t,a,n={}){J();const s=await Me(R(_,q.assessments,e)),i=s.exists()?s.data():{};if(i.status==="completed")throw new Error("This assessment is already completed.");if(i.expiresAt&&Date.now()>new Date(i.expiresAt).getTime())throw new Error("This assessment link has expired.");await te(R(_,q.assessments,e),{[`answers.${t}`]:a,progress:`${n.currentQuestionIndex||0}/${n.totalQuestions||""}`.replace(/\/$/,""),currentQuestionIndex:n.currentQuestionIndex||0,currentStage:n.currentStage||1,...n.discStartedAt?{discStartedAt:n.discStartedAt}:{},updatedAt:j()},{merge:!0})}async function on(e,t,a={}){var m;J();const n=R(_,q.assessments,e),s=await Me(n),i=s.exists()?s.data():{};if(i.status==="completed")throw new Error("This assessment is already completed.");if(i.expiresAt&&Date.now()>new Date(i.expiresAt).getTime())throw new Error("This assessment link has expired.");const l=Object.values(t||{}).filter(f=>String((f==null?void 0:f.value)??f??"").trim()).length,o=Number(a.totalQuestions||Object.keys(t||{}).length||0),d=Number(a.technicalScore||0),u=Number(a.discScore||0),p=Number(a.score||(o?Math.round(l/o*100):0));await te(n,{answers:t,answeredCount:l,totalQuestions:o,score:p,technical:d||p,disc:((m=a.discProfile)==null?void 0:m.label)||(u?`${u}%`:"Submitted"),discScore:u,discProfile:a.discProfile||null,progress:`${l}/${o}`,status:"completed",finished:new Date().toLocaleString("en-US",{month:"short",day:"numeric",year:"numeric",hour:"numeric",minute:"2-digit"}),finishedAt:j(),updatedAt:j()},{merge:!0});const c=Math.round(p);i.candidateUid&&await te(R(_,q.users,i.candidateUid),{score:c,nwScore:c,lastAssessmentScore:c,lastAssessmentId:e,updatedAt:j()},{merge:!0}).catch(()=>null),i.candidateCode&&await te(R(_,q.candidates,i.candidateCode),{score:c,nwScore:c,lastAssessmentScore:c,lastAssessmentId:e,updatedAt:j()},{merge:!0}).catch(()=>null)}async function pa(){J();const e=ve(re(_,q.openings),fe("published","==",!0),he(12));return(await we(e)).docs.map(a=>({id:a.id,...a.data()}))}async function rn(e,t){J();const a=t.code||t.id,n=await la(e).catch(()=>null),s=(n==null?void 0:n.candidateCode)||Ke(e),i=new Date().toISOString().slice(0,10),l={opening:a,openingCode:a,jobId:a,role:t.title||t.role||"Untitled role",openingTitle:t.title||t.role||"Untitled role",applied:i,appliedAt:i,status:"applied",outcome:"Application only",source:"talent.nearwork.co"},o={candidateId:e,ownerUid:e,authUid:e,candidateDocId:s,candidateCode:s,candidateEmail:(n==null?void 0:n.email)||"",candidateName:(n==null?void 0:n.name)||"",openingCode:a,jobId:a,openingTitle:t.title||t.role||"Untitled role",jobTitle:t.title||t.role||"Untitled role",title:t.title||t.role||"Untitled role",clientName:t.orgName||t.clientName||t.company||"Nearwork client",status:"applied",inPipeline:!1,isMockData:!1,source:"talent.nearwork.co",createdAt:j(),updatedAt:j()};await Jt(re(_,q.applications),o),await te(R(_,q.candidates,s),{...ua(e,{...n||{},candidateCode:s,appliedBefore:!0,lastContact:i}),applications:At(l),appliedBefore:!0},{merge:!0}).catch(()=>null),await te(R(_,q.users,e),{role:"candidate",candidateCode:s,code:s,applications:At(l),lastAppliedOpeningCode:a,lastAppliedAt:j(),updatedAt:j()},{merge:!0}).catch(()=>null),await Jt(re(_,q.activity),{candidateId:e,type:"application_submitted",title:o.jobTitle,createdAt:j()}).catch(()=>null),Za(n,t).catch(()=>null)}async function ln(e,t){await Ga(R(_,q.users,e),{availability:t,updatedAt:j()})}async function Xe(e,t){J();const a=t.candidateCode||Ke(e);await te(R(_,q.users,e),{...t,candidateCode:a,role:"candidate",updatedAt:j()},{merge:!0});try{return await te(R(_,q.candidates,a),await ca(e,a,{...t,candidateCode:a}),{merge:!0}),{candidateCode:a,atsSynced:!0}}catch(n){return console.warn("Candidate ATS sync failed.",n),{candidateCode:a,atsSynced:!1}}}async function cn(){var n;J();const e=await((n=U.currentUser)==null?void 0:n.getIdToken());if(!e)throw new Error("You must be signed in to delete your account.");const t=await fetch("/api/delete-account",{method:"POST",headers:{Authorization:`Bearer ${e}`}}),a=await t.json().catch(()=>({}));if(!t.ok||!a.ok)throw new Error(a.error||"Failed to delete account.");return a}async function dn(e){const t=await fetch("/api/send-reset",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:e,continueUrl:`${window.location.origin}/reset-password`})}),a=await t.json().catch(()=>({}));if(!t.ok||!a.ok)throw new Error(a.error||"Failed to send the reset email.");return a}async function un(e,t){J();const a=t.name.replace(/[^a-z0-9._-]/gi,"-").toLowerCase(),n=`candidate-photos/${e}/${Date.now()}-${a}`,s=xt(dt,n);await sa(s,t,{contentType:t.type||"application/octet-stream"});const i=await ia(s);return await te(R(_,q.users,e),{photoURL:i,updatedAt:j()},{merge:!0}),i}async function ut(e,t,a){J();let n=null,s=Ke(e);try{const p=await Me(R(_,q.users,e));if(p.exists()){const c=p.data();n=c.activeCvId||null,c.candidateCode&&(s=c.candidateCode)}}catch{}const i=t.name.replace(/[^a-z0-9._-]/gi,"-").toLowerCase(),l=`candidate-cvs/${e}/${Date.now()}-${i}`,o=xt(dt,l);await sa(o,t,{contentType:t.type||"application/octet-stream"});const d=await ia(o),u={id:l,name:a||t.name,fileName:t.name,url:d,uploadedAt:new Date().toISOString()};return await te(R(_,q.users,e),{cvLibrary:At(u),activeCvId:u.id,activeCvName:u.name||u.fileName,cvUrl:d,updatedAt:j()},{merge:!0}),te(R(_,q.candidates,s),{cvUrl:d,activeCvId:u.id,activeCvName:u.name||u.fileName,updatedAt:j()},{merge:!0}).catch(()=>null),n&&n!==l&&Qa(xt(dt,n)).catch(()=>{}),u}function pn(e,t){if(J(),!e)return()=>{};const a=ve(re(_,q.notifications),fe("recipientUid","==",e),he(50));return Va(a,n=>{const s=n.docs.map(i=>({id:i.id,...i.data()})).sort((i,l)=>{var u,p;const o=(u=i.createdAt)!=null&&u.toDate?i.createdAt.toDate().getTime():new Date(i.createdAt||0).getTime();return((p=l.createdAt)!=null&&p.toDate?l.createdAt.toDate().getTime():new Date(l.createdAt||0).getTime())-o});t(s)})}async function mn(e){J(),e&&await te(R(_,q.notifications,e),{read:!0,readAt:j()},{merge:!0})}async function gn(e,t){J(),await te(R(_,q.notificationPreferences,e),{uid:e,app:"talent.nearwork.co",preferences:t,updatedAt:j()},{merge:!0})}async function _t(e){var t;if(!e)return null;try{const a=await new Promise((E,P)=>{const T=new FileReader;T.onload=()=>E(T.result.split(",")[1]),T.onerror=P,T.readAsDataURL(e)}),n=await((t=U.currentUser)==null?void 0:t.getIdToken().catch(()=>""))??"",s=await fetch("/api/parse-cv",{method:"POST",headers:{"Content-Type":"application/json",...n?{Authorization:`Bearer ${n}`}:{}},body:JSON.stringify({data:a,filename:e.name,mimeType:e.type||"application/octet-stream"})});if(!s.ok)return null;const i=await s.json();if(!(i!=null&&i.ok))return null;const{name:l,phone:o,city:d,summary:u,skills:p,workHistory:c,languages:m,certifications:f}=i;return{name:l,phone:o,city:d,summary:u,skills:p,workHistory:c,languages:m||[],certifications:f||[]}}catch{return null}}async function vn(e){return Ua(U,e)}let oe=null,De=!1,pt=null,pe=0,y={},Je=null,mt=null,Qe=!1,Se="idle",ye=0,rt=null,be=null,Et=!1,K=!1,ue=null;const et=document.querySelector("#app"),fn="+573135928691",hn="https://wa.me/573135928691",Ye={"Customer Success":["Customer Success Manager","Customer Success Associate","Account Manager","Technical Account Manager","Client Success Specialist","Implementation Specialist","Onboarding Specialist","Renewals Manager"],Sales:["SDR / Sales Development Rep","BDR / Business Development Rep","Account Executive","Inside Sales Representative","Channel Sales Manager","Sales Operations Specialist","Revenue Operations Specialist","Sales Manager"],Support:["Technical Support Specialist","Customer Support Representative","Help Desk Technician","Escalations Specialist","Support Team Lead","QA Support Analyst"],Operations:["Operations Manager","Operations Analyst","Executive Assistant","Administrative Assistant","Virtual Assistant","Office Manager","Project Coordinator","Procurement Specialist","Logistics Coordinator","Recruiting Coordinator"],Marketing:["Marketing Ops / Content Specialist","Content Writer","SEO Specialist","Email Marketing Specialist","Lifecycle Marketing Specialist","Social Media Manager","Graphic Designer","Growth Marketing Specialist"],Engineering:["Software Developer (Full Stack)","Frontend Developer","Backend Developer","Mobile Developer","DevOps Engineer","No-Code Developer","Data Analyst","Data Engineer","QA Engineer","Product Manager"],Finance:["Bookkeeper","Accounting Assistant","Accounts Payable / Receivable Specialist","Financial Analyst","FP&A Analyst","Payroll Specialist","Tax Analyst"],"Human Resources":["HR Generalist","Recruiter / Talent Sourcer","People Operations Specialist","Payroll & Benefits Coordinator","Learning & Development Coordinator"],"Healthcare & Insurance":["Insurance Account Manager","Claims Specialist","Medical Billing Specialist","Healthcare Virtual Assistant","Patient Coordinator"],Other:["Other / Not Listed"]},yn={"CRM & Sales":["HubSpot","Salesforce","Pipedrive","Apollo","Outbound","Cold Email","Discovery Calls","CRM Hygiene"],"Customer Success":["SaaS","Customer Success","QBRs","Onboarding","Renewals","Expansion","Churn Reduction","Intercom","Zendesk"],Support:["Technical Support","Tickets","Troubleshooting","APIs","Bug Reproduction","Help Center","CSAT"],Operations:["Excel","Google Sheets","Reporting","Process Design","Project Management","Notion","Airtable","Zapier"],Marketing:["Content","SEO","Lifecycle","Email Marketing","HubSpot Marketing","Copywriting","Analytics"],Engineering:["JavaScript","React","Node.js","SQL","Python","REST APIs","QA","GitHub"],Language:["English B2","English C1","English C2","Spanish Native"]},bn=["Account Management","Accounts Payable","Accounts Receivable","Adobe Creative Suite","Agile","AI Tools","Analytics","Appointment Setting","B2B Sales","B2C Sales","Billing","Bookkeeping","Business Analysis","Canva","Cash Collections","Chat Support","Cold Calling","Community Management","Compliance","Content Strategy","Contract Management","Customer Onboarding","Customer Retention","Customer Service","Data Analysis","Data Entry","Email Support","Excel / Google Sheets","Executive Assistance","Figma","Financial Reporting","Forecasting","Helpdesk","HR Operations","Inbound Calls","Insurance Support","Lead Generation","Live Chat","Logistics","Looker","Microsoft Office","NetSuite","Outbound Calls","Payroll","Performance Marketing","Power BI","Product Support","QuickBooks","Recruiting","Salesforce Administration","Sales Operations","Shopify","Slack","Social Media","SQL Reporting","Stripe","Tableau","Technical Writing","Ticket Quality","Training","Vendor Management","WordPress","Workday","Workforce Management","Zendesk Guide","Zoho"],ma=[...new Set([...Object.values(yn).flat(),...bn])].sort((e,t)=>e.localeCompare(t)),wn=["Colombia","Afghanistan","Albania","Algeria","Andorra","Angola","Antigua and Barbuda","Argentina","Armenia","Australia","Austria","Azerbaijan","Bahamas","Bahrain","Bangladesh","Barbados","Belarus","Belgium","Belize","Benin","Bhutan","Bolivia","Bosnia and Herzegovina","Botswana","Brazil","Brunei","Bulgaria","Burkina Faso","Burundi","Cambodia","Cameroon","Canada","Cape Verde","Central African Republic","Chad","Chile","China","Comoros","Congo (Brazzaville)","Congo (Kinshasa)","Costa Rica","Côte d'Ivoire","Croatia","Cuba","Cyprus","Czechia","Denmark","Djibouti","Dominica","Dominican Republic","Ecuador","Egypt","El Salvador","Equatorial Guinea","Eritrea","Estonia","Eswatini","Ethiopia","Fiji","Finland","France","Gabon","Gambia","Georgia","Germany","Ghana","Greece","Grenada","Guatemala","Guinea","Guinea-Bissau","Guyana","Haiti","Honduras","Hungary","Iceland","India","Indonesia","Iran","Iraq","Ireland","Israel","Italy","Jamaica","Japan","Jordan","Kazakhstan","Kenya","Kiribati","Kosovo","Kuwait","Kyrgyzstan","Laos","Latvia","Lebanon","Lesotho","Liberia","Libya","Liechtenstein","Lithuania","Luxembourg","Madagascar","Malawi","Malaysia","Maldives","Mali","Malta","Marshall Islands","Mauritania","Mauritius","Mexico","Micronesia","Moldova","Monaco","Mongolia","Montenegro","Morocco","Mozambique","Myanmar","Namibia","Nauru","Nepal","Netherlands","New Zealand","Nicaragua","Niger","Nigeria","North Korea","North Macedonia","Norway","Oman","Pakistan","Palau","Palestine","Panama","Papua New Guinea","Paraguay","Peru","Philippines","Poland","Portugal","Qatar","Romania","Russia","Rwanda","Saint Kitts and Nevis","Saint Lucia","Saint Vincent and the Grenadines","Samoa","San Marino","Sao Tome and Principe","Saudi Arabia","Senegal","Serbia","Seychelles","Sierra Leone","Singapore","Slovakia","Slovenia","Solomon Islands","Somalia","South Africa","South Korea","South Sudan","Spain","Sri Lanka","Sudan","Suriname","Sweden","Switzerland","Syria","Taiwan","Tajikistan","Tanzania","Thailand","Timor-Leste","Togo","Tonga","Trinidad and Tobago","Tunisia","Turkey","Turkmenistan","Tuvalu","Uganda","Ukraine","United Arab Emirates","United Kingdom","United States","Uruguay","Uzbekistan","Vanuatu","Vatican City","Venezuela","Vietnam","Yemen","Zambia","Zimbabwe"],Ze={Amazonas:["El Encanto","La Chorrera","La Pedrera","La Victoria","Leticia","Miriti - Paraná","Puerto Alegría","Puerto Arica","Puerto Nariño","Puerto Santander","Tarapacá"],Antioquia:["Abejorral","Abriaquí","Alejandría","Amagá","Amalfi","Andes","Angelópolis","Angostura","Anorí","Anza","Apartadó","Arboletes","Argelia","Armenia","Barbosa","Bello","Belmira","Betania","Betulia","Briceño","Buriticá","Cáceres","Caicedo","Caldas","Campamento","Cañasgordas","Caracolí","Caramanta","Carepa","Carmen de Viboral","Carolina","Caucasia","Chigorodó","Cisneros","Ciudad Bolívar","Cocorná","Concepción","Concordia","Copacabana","Dabeiba","Don Matías","Ebéjico","El Bagre","Entrerríos","Envigado","Fredonia","Frontino","Giraldo","Girardota","Gómez Plata","Granada","Guadalupe","Guarne","Guatapé","Heliconia","Hispania","Itagüí","Ituango","Jardín","Jericó","La Ceja","La Estrella","La Pintada","La Unión","Liborina","Maceo","Marinilla","Medellín","Montebello","Murindó","Mutata","Nariño","Nechí","Necoclí","Olaya","Peñol","Peque","Pueblorrico","Puerto Berrío","Puerto Nare","Puerto Triunfo","Remedios","Retiro","Rionegro","Sabanalarga","Sabaneta","Salgar","San Andrés","San Carlos","San Francisco","San Jerónimo","San José de la Montaña","San Juan de Urabá","San Luis","San Pedro","San Pedro de Urabá","San Rafael","San Roque","San Vicente","Santa Bárbara","Santa Rosa de Osos","Santafé de Antioquia","Santo Domingo","Santuario","Segovia","Sonsón","Sopetrán","Támesis","Tarazá","Tarso","Titiribí","Toledo","Turbo","Uramita","Urrao","Valdivia","Valparaíso","Vegachí","Venecia","Vigía del Fuerte","Yalí","Yarumal","Yolombó","Yondó","Zaragoza"],Arauca:["Arauca","Arauquita","Cravo Norte","Fortul","Puerto Rondón","Saravena","Tame"],Atlántico:["Baranoa","Barranquilla","Campo de la Cruz","Candelaria","Galapa","Juan de Acosta","Luruaco","Malambo","Manatí","Palmar de Varela","Piojó","Polonuevo","Ponedera","Puerto Colombia","Repelón","Sabanagrande","Sabanalarga","Santa Lucía","Santo Tomás","Soledad","Suan","Tubara","Usiacurí"],"Bogotá D.C.":["Bogotá"],Bolívar:["Achí","Altos del Rosario","Arenal","Arjona","Arroyohondo","Barranco de Loba","Calamar","Cantagallo","Carmen de Bolívar","Cartagena","Cicuco","Clemencia","Córdoba","El Guamo","El Peñón","Hatillo de Loba","Magangué","Mahates","Margarita","María la Baja","Mompós","Montecristo","Morales","Pinillos","Regidor","Río Viejo","San Cristóbal","San Estanislao","San Fernando","San Jacinto","San Jacinto del Cauca","San Juan Nepomuceno","San Martín de Loba","San Pablo","Santa Catalina","Santa Rosa de Lima","Santa Rosa del Sur","Simití","Soplaviento","Talaigua Nuevo","Tiquisio","Turbaco","Turbana","Villanueva","Zambrano"],Boyacá:["Almeida","Aquitania","Arcabuco","Belén","Berbeo","Betéitiva","Boavita","Boyacá","Briceño","Buenavista","Busbanzá","Caldas","Campohermoso","Cerinza","Chinavita","Chiquinquirá","Chíquiza","Chiscas","Chita","Chitaraque","Chivatá","Chivor","Ciénega","Cómbita","Coper","Corrales","Covarachía","Cubará","Cucaita","Cuítiva","Duitama","El Cocuy","El Espino","Firavitoba","Floresta","Gachantivá","Gameza","Garagoa","Guacamayas","Guateque","Guayatá","Güicán","Iza","Jenesano","Jericó","La Capilla","La Uvita","La Victoria","Labranzagrande","Macanal","Maripí","Miraflores","Mongua","Monguí","Moniquirá","Motavita","Muzo","Nobsa","Nuevo Colón","Oicatá","Otanche","Pachavita","Páez","Paipa","Pajarito","Panqueba","Pauna","Paya","Paz de Río","Pesca","Pisba","Puerto Boyacá","Quípama","Ramiriquí","Ráquira","Rondón","Saboyá","Sáchica","Samacá","San Eduardo","San José de Pare","San Luis de Gaceno","San Mateo","San Miguel de Sema","San Pablo Borbur","Santa María","Santa Rosa de Viterbo","Santa Sofía","Santana","Sativanorte","Sativasur","Siachoque","Soatá","Socha","Socotá","Sogamoso","Somondoco","Sora","Soracá","Sotaquirá","Susacón","Sutamarchán","Sutatenza","Tasco","Tenza","Tibaná","Tibasosa","Tinjacá","Tipacoque","Toca","Togüí","Tópaga","Tota","Tunja","Tununguá","Turmequé","Tuta","Tutazá","Umbita","Ventaquemada","Villa de Leyva","Viracachá","Zetaquira"],Caldas:["Aguadas","Anserma","Aranzazu","Belalcázar","Chinchiná","Filadelfia","La Dorada","La Merced","Manizales","Manzanares","Marmato","Marquetalia","Marulanda","Neira","Norcasia","Pácora","Palestina","Pensilvania","Riosucio","Risaralda","Salamina","Samaná","San José","Supía","Victoria","Villamaría","Viterbo"],Caquetá:["Albania","Belén de los Andaquíes","Cartagena del Chairá","Currillo","El Doncello","El Paujil","Florencia","La Montañita","Milán","Morelia","Puerto Rico","San José del Fragua","San Vicente del Caguán","Solano","Solita","Valparaiso"],Casanare:["Aguazul","Chameza","Hato Corozal","La Salina","Maní","Monterrey","Nunchía","Orocué","Paz de Ariporo","Pore","Recetor","Sabanalarga","Sácama","San Luis de Palenque","Támara","Tauramena","Trinidad","Villanueva","Yopal"],Cauca:["Almaguer","Argelia","Balboa","Bolívar","Buenos Aires","Cajibío","Caldono","Caloto","Corinto","El Tambo","Florencia","Guapi","Inzá","Jambalo","La Sierra","La Vega","Lopez","Mercaderes","Miranda","Morales","Padilla","Paez","Patia","Piamonte","Piendamo","Popayán","Puerto Tejada","Purace","Rosas","San Sebastian","Santa Rosa","Santander de Quilichao","Silvia","Sotara","Suarez","Sucre","Timbio","Timbiqui","Toribio","Totoro","Villa Rica"],Cesar:["Aguachica","Agustín Codazzi","Astrea","Becerril","Bosconia","Chimichagua","Chiriguaná","Curumaní","El Copey","El Paso","Gamarra","González","La Gloria","La Jagua de Ibirico","La Paz","Manaure","Pailitas","Pelaya","Pueblo Bello","Río de Oro","San Alberto","San Diego","San Martín","Tamalameque","Valledupar"],Chocó:["Acandí","Alto Baudó","Atrato","Bagadó","Bahía Solano","Bajo Baudó","Belén de Bajirá","Bojayá","Cantón de San Pablo","Carmen del Darién","Cértegui","Condoto","El Carmen de Atrato","El Litoral del San Juan","Istmina","Juradó","Lloró","Medio Atrato","Medio Baudó","Medio San Juan","Nóvita","Nuquí","Quibdó","Río Iró","Río Quito","Riosucio","San José del Palmar","Sipí","Tadó","Unguía","Unión Panamericana"],Córdoba:["Ayapel","Buenavista","Canalete","Cereté","Chimá","Chinú","Ciénaga de Oro","Cotorra","La Apartada","Lorica","Los Córdobas","Momil","Moñitos","Montelíbano","Montería","Planeta Rica","Pueblo Nuevo","Puerto Escondido","Puerto Libertador","Purísima","Sahagún","San Andrés de Sotavento","San Antero","San Bernardo del Viento","San Carlos","San Pelayo","Tierralta","Valencia"],Cundinamarca:["Agua de Dios","Albán","Anapoima","Anolaima","Apulo","Arbeláez","Beltrán","Bituima","Bojacá","Cabrera","Cachipay","Cajicá","Caparrapí","Cáqueza","Carmen de Carupa","Chaguaní","Chía","Chipaque","Choachí","Chocontá","Cogua","Cota","Cucunubá","El Colegio","El Peñón","El Rosal","Facatativá","Fomeque","Fosca","Funza","Fúquene","Fusagasugá","Gachala","Gachancipá","Gachetá","Gama","Girardot","Granada","Guachetá","Guaduas","Guasca","Guataquí","Guatavita","Guayabal de Síquima","Guayabetal","Gutiérrez","Jerusalén","Junín","La Calera","La Mesa","La Palma","La Peña","La Vega","Lenguazaque","Macheta","Madrid","Manta","Medina","Mosquera","Nariño","Nemocón","Nilo","Nimaima","Nocaima","Pacho","Paime","Pandi","Paratebueno","Pasca","Puerto Salgar","Puli","Quebradanegra","Quetame","Quipile","Ricaurte","San Antonio de Tequendama","San Bernardo","San Cayetano","San Francisco","San Juan de Rioseco","Sasaima","Sesquilé","Sibaté","Silvania","Simijaca","Soacha","Sopó","Subachoque","Suesca","Supatá","Susa","Sutatausa","Tabio","Tausa","Tena","Tenjo","Tibacuy","Tibirita","Tocaima","Tocancipá","Topaipí","Ubalá","Ubaque","Ubaté","Une","Útica","Venecia","Vergara","Vianí","Villagómez","Villapinzón","Villeta","Viotá","Yacopí","Zipacón","Zipaquirá"],Guainía:["Barranco Minas","Cacahual","Inírida","La Guadalupe","Mapiripana","Morichal","Pana Pana","Puerto Colombia","San Felipe"],Guaviare:["Calamar","El Retorno","Miraflores","San José del Guaviare"],Huila:["Acevedo","Agrado","Aipe","Algeciras","Altamira","Baraya","Campoalegre","Colombia","Elías","Garzón","Gigante","Guadalupe","Hobo","Iquira","Isnos","La Argentina","La Plata","Nátaga","Neiva","Oporapa","Paicol","Palermo","Palestina","Pital","Pitalito","Rivera","Saladoblanco","San Agustín","Santa María","Suaza","Tarqui","Tello","Teruel","Tesalia","Timaná","Villavieja","Yaguará"],"La Guajira":["Albania","Barrancas","Dibulla","Distracción","El Molino","Fonseca","Hatonuevo","La Jagua del Pilar","Maicao","Manaure","Riohacha","San Juan del Cesar","Uribia","Urumita","Villanueva"],Magdalena:["Algarrobo","Aracataca","Ariguaní","Cerro San Antonio","Chibolo","Ciénaga","Concordia","El Banco","El Piñón","El Reten","Fundación","Guamal","Nueva Granada","Pedraza","Pijiño del Carmen","Pivijay","Plato","Pueblo Viejo","Remolino","Sabanas de San Ángel","Salamina","San Sebastián de Buenavista","San Zenón","Santa Ana","Santa Bárbara de Pinto","Santa Marta","Sitionuevo","Tenerife","Zapayán","Zona Bananera"],Meta:["Acacías","Barranca de Upía","Cabuyaro","Castilla la Nueva","Cumaral","El Calvario","El Castillo","El Dorado","Fuente de Oro","Granada","Guamal","La Macarena","La Uribe","Lejanías","Mapiripán","Mesetas","Puerto Concordia","Puerto Gaitán","Puerto Lleras","Puerto López","Puerto Rico","Restrepo","San Carlos Guaroa","San Juan de Arama","San Juanito","San Luis de Cubarral","San Martín","Villavicencio","Vista Hermosa"],Nariño:["Albán","Aldana","Ancuyá","Arboleda","Barbacoas","Belén","Buesaco","Chachagüí","Colón","Consacá","Contadero","Córdoba","Cuaspud","Cumbal","Cumbitara","El Charco","El Peñol","El Rosario","El Tablón de Gómez","El Tambo","Francisco Pizarro","Funes","Guachucal","Guaitarilla","Gualmatán","Iles","Imues","Ipiales","La Cruz","La Florida","La Llanada","La Tola","La Unión","Leiva","Linares","Los Andes","Magüí Payán","Mallama","Mosquera","Nariño","Olaya Herrera","Ospina","Pasto","Policarpa","Potosí","Providencia","Puerres","Pupiales","Ricaurte","Roberto Payán","Samaniego","San Bernardo","San Lorenzo","San Pablo","San Pedro de Cartago","Sandoná","Santa Bárbara","Santa Cruz","Sapuyes","Taminango","Tangua","Tumaco","Túquerres","Yacuanquer"],"Norte de Santander":["Abrego","Arboledas","Bochalema","Bucarasica","Cachirá","Cácota","Chinácota","Chitagá","Convención","Cúcuta","Cucutilla","Durania","El Carmen","El Tarra","El Zulia","Gramalote","Hacarí","Herrán","La Esperanza","La Playa","Labateca","Los Patios","Lourdes","Mutiscua","Ocaña","Pamplona","Pamplonita","Puerto Santander","Ragonvalia","Salazar","San Calixto","San Cayetano","Santiago","Sardinata","Silos","Teorama","Tibú","Toledo","Villa Caro","Villa del Rosario"],Putumayo:["Colón","Mocoa","Orito","Puerto Asís","Puerto Caicedo","Puerto Guzmán","Puerto Leguizamo","San Francisco","San Miguel","Santiago","Sibundoy","Valle del Guamuez","Villa Garzón"],Quindío:["Armenia","Buenavista","Calarcá","Circasia","Córdoba","Filandia","Génova","La Tebaida","Montenegro","Pijao","Quimbaya","Salento"],Risaralda:["Apía","Balboa","Belén de Umbría","Dosquebradas","Guática","La Celia","La Virginia","Marsella","Mistrató","Pereira","Pueblo Rico","Quinchía","Santa Rosa de Cabal","Santuario"],"San Andrés y Providencia":["Providencia y Santa Catalina","San Andrés"],Santander:["Aguada","Albania","Aratoca","Barbosa","Barichara","Barrancabermeja","Betulia","Bolívar","Bucaramanga","Cabrera","California","Capitanejo","Carcasí","Cepitá","Cerrito","Charalá","Charta","Chima","Chipatá","Cimitarra","Concepción","Confines","Contratación","Coromoro","Curití","El Carmen de Chucurí","El Guacamayo","El Peñón","El Playón","Encino","Enciso","Florián","Floridablanca","Galán","Gambita","Girón","Guaca","Guadalupe","Guapotá","Guavatá","Güepsa","Hato","Jesús María","Jordán","La Belleza","La Paz","Landázuri","Lebríja","Los Santos","Macaravita","Málaga","Matanza","Mogotes","Molagavita","Ocamonte","Oiba","Onzaga","Palmar","Palmas del Socorro","Páramo","Piedecuesta","Pinchote","Puente Nacional","Puerto Parra","Puerto Wilches","Rionegro","Sabana de Torres","San Andrés","San Benito","San Gil","San Joaquín","San José de Miranda","San Miguel","San Vicente de Chucurí","Santa Bárbara","Santa Helena del Opón","Simacota","Socorro","Suaita","Sucre","Surata","Tona","Valle de San José","Vélez","Vetas","Villanueva","Zapatoca"],Sucre:["Buenavista","Caimito","Chalán","Coloso","Corozal","Coveñas","El Roble","Galeras","Guaranda","La Unión","Los Palmitos","Majagual","Morroa","Ovejas","Palmito","Sampués","San Benito Abad","San Juan Betulia","San Marcos","San Onofre","San Pedro","Santiago de Tolú","Sincé","Sincelejo","Sucre","Tolú Viejo"],Tolima:["Alpujarra","Alvarado","Ambalema","Anzoátegui","Armero","Ataco","Cajamarca","Carmen de Apicalá","Casabianca","Chaparral","Coello","Coyaima","Cunday","Dolores","Espinal","Falan","Flandes","Fresno","Guamo","Herveo","Honda","Ibagué","Icononzo","Lérida","Líbano","Mariquita","Melgar","Murillo","Natagaima","Ortega","Palocabildo","Piedras","Planadas","Prado","Purificación","Rioblanco","Roncesvalles","Rovira","Saldaña","San Antonio","San Luis","Santa Isabel","Suárez","Valle de San Juan","Venadillo","Villahermosa","Villarrica"],"Valle del Cauca":["Alcalá","Andalucía","Ansermanuevo","Argelia","Bolívar","Buenaventura","Buga","Bugalagrande","Caicedonia","Cali","Calima","Candelaria","Cartago","Dagua","El Águila","El Cairo","El Cerrito","El Dovio","Florida","Ginebra","Guacarí","Jamundí","La Cumbre","La Unión","La Victoria","Obando","Palmira","Pradera","Restrepo","Riofrío","Roldanillo","San Pedro","Sevilla","Toro","Trujillo","Tuluá","Ulloa","Versalles","Vijes","Yotoco","Yumbo","Zarzal"],Vaupés:["Carurú","Mitú","Pacoa","Papunahua","Taraira","Yavaraté"],Vichada:["Cumaribo","La Primavera","Puerto Carreño","Santa Rosalía"]},Sn=[{title:"How to answer salary questions",tag:"Interview",read:"4 min",body:"Use a confident range, anchor it to the role, and avoid apologizing for earning in USD.",actions:["Know your floor","Use monthly USD","Mention flexibility last"]},{title:"Writing a CV for US SaaS companies",tag:"CV",read:"6 min",body:"Translate local experience into metrics US hiring managers can scan in under a minute.",actions:["Lead with outcomes","Add tools","Quantify scope"]},{title:"Before your recruiter screen",tag:"Process",read:"3 min",body:"Prepare availability, compensation, English comfort, and two strong role stories.",actions:["Check your setup","Review the opening","Bring questions"]},{title:"STAR stories that feel natural",tag:"Interview",read:"5 min",body:"Keep stories specific, concise, and tied to business impact instead of job duties.",actions:["Situation","Action","Result"]}],Zt=[{key:"profile-review",label:"Profile Review",help:"We are checking role fit and your candidate profile."},{key:"background-check",label:"Background Checks",help:"Nearwork is verifying relevant background and work details."},{key:"assessment",label:"Assessment",help:"Complete role-specific questions when assigned."},{key:"interview",label:"Interview",help:"Meet the recruiter and book your next conversation."},{key:"presented",label:"Presented",help:"Your profile has been prepared for the company."},{key:"client-review",label:"Client Review",help:"The company is reviewing your profile and next steps."},{key:"hired",label:"Hired",help:"Offer accepted and onboarding is ready to begin."}],ga=["Applied","Assessment","Interview","Final round","Offer"];let r={user:null,candidate:null,applications:[],assessments:[],notifications:[],notificationPanelOpen:!1,notificationSettingsOpen:!1,jobs:[],loading:!0,view:"login",activePage:"overview",matchesFiltered:!1,message:"",assessmentUiStep:null,showDeleteAccountModal:!1,deleteAccountStatus:null,deleteAccountError:"",showUnsavedChangesModal:!1,resetCodeStatus:null,resetCodeError:""},Q=null;const St=sessionStorage.getItem("nw_restore_path");St&&(sessionStorage.removeItem("nw_restore_path"),window.history.replaceState({page:St},"",St));function va(){return[["overview","layout-dashboard","Overview"],["matches","briefcase-business","Matches"],["applications","send","Applications"],["assessment","clipboard-check","Assessment"],["cvs","files","CV Picker"],["tips","book-open","Tips"],["recruiter","calendar-days","Recruiter"],["profile","user-round-cog","Profile"]]}function gt(){const t=window.location.pathname.split("/").filter(Boolean)[0];return t==="onboarding"?"onboarding":t==="assessment"||t==="assessments"?"assessment":va().some(([a])=>a===t)?t:"overview"}function Ae(){const e=window.location.pathname.split("/").filter(Boolean);return(e[0]==="assessment"||e[0]==="assessments")&&e[1]||""}function fa(){const e=window.location.pathname.split("/").filter(Boolean),t=e.findIndex(n=>n==="q"||n==="question");if(t===-1)return null;const a=Number(e[t+1]);return Number.isFinite(a)&&a>0?a-1:null}function Cn(e,t=0){return`/assessment/${encodeURIComponent(e)}/start/q/${Number(t||0)+1}`}function Ie(e,t=0,a=!1){const n=Cn(e,t);if(window.location.pathname===n)return;const s=a?"replaceState":"pushState";window.history[s]({page:"assessment",assessmentId:e,questionIndex:t},"",n)}function g(e,t){return`<i data-lucide="${e}" aria-label="${e}"></i>`}let Ct=!1;function de(){if(window.lucide){window.lucide.createIcons();return}if(Ct)return;Ct=!0;const e=()=>{window.lucide?(window.lucide.createIcons(),Ct=!1):setTimeout(e,50)};e()}function $(e){r={...r,...e},_a()}function Ge(e,t=!0){const n=e==="onboarding"||va().some(([s])=>s===e)?e:"overview";r={...r,activePage:n,matchesFiltered:n==="matches"?r.matchesFiltered:!1,message:"",assessmentUiStep:null},t&&window.history.pushState({page:n},"",n==="overview"?"/":`/${n}`),_a()}function ha(){var t,a;return(((t=r.candidate)==null?void 0:t.name)||((a=r.user)==null?void 0:a.displayName)||"there").split(" ")[0]||"there"}function $n(){var t,a,n;return(((t=r.candidate)==null?void 0:t.name)||((a=r.user)==null?void 0:a.displayName)||((n=r.user)==null?void 0:n.email)||"NW").split(/[ @.]/).filter(Boolean).slice(0,2).map(s=>s[0]).join("").toUpperCase()}function ya(e="normal"){var n,s;const t=((n=r.candidate)==null?void 0:n.photoURL)||((s=r.user)==null?void 0:s.photoURL)||"",a=e==="large"?"avatar avatar-large":"avatar";return t?`<img class="${a}" src="${k(t)}" alt="${k(ha())}" />`:`<div class="${a}">${$n()}</div>`}function k(e){return String(e||"").replaceAll("&","&amp;").replaceAll('"',"&quot;").replaceAll("<","&lt;").replaceAll(">","&gt;")}function C(e){return String(e||"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;")}function ft(e){if(!e)return"Recently";const t=e.toDate?e.toDate():new Date(e);return new Intl.DateTimeFormat("en",{month:"short",day:"numeric"}).format(t)}function tt(){var t;const e=((t=r.candidate)==null?void 0:t.skills)||[];return Array.isArray(e)?e:String(e).split(",").map(a=>a.trim()).filter(Boolean)}function Z(e){return String(e||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/&/g," and ").replace(/[^a-z0-9]+/g," ").trim().replace(/\s+/g," ")}function qt(e,t=tt()){const a=Le(e),n=new Set((a.skills||[]).map(Z).filter(Boolean)),s=new Map(t.map(i=>[Z(i),i]).filter(([i])=>i));return[...s.keys()].filter(i=>n.has(i)).map(i=>s.get(i))}function ba(e){return["Nearwork candidate","Talent member"].includes(String(e||"").trim())}function Kt(e){if(!e)return null;if(e.toDate)return e.toDate();if(typeof e=="object"&&typeof e.seconds=="number")return new Date(e.seconds*1e3);const t=new Date(e);return Number.isNaN(t.getTime())?null:t}function It(e){return Number(e||1)===1?"Technical Assessment":"DISC Assessment"}function $t(e,t){var a,n,s;return((n=(a=e==null?void 0:e.answers)==null?void 0:a[t==null?void 0:t.id])==null?void 0:n.value)??((s=e==null?void 0:e.answers)==null?void 0:s[t==null?void 0:t.id])??""}function Be(e){return e!=null&&e!==""}function ce(e,t){return((e==null?void 0:e.questions)||[]).slice(0,70).filter(a=>Number(a.stage||1)===Number(t))}function Pt(e,t,a=(e==null?void 0:e.answers)||{}){return ce(e,t).filter(n=>{var s;return!Be(((s=a[n.id])==null?void 0:s.value)??a[n.id])})}function kn(){var e,t;return!!((r.applications||[]).length||(((e=r.candidate)==null?void 0:e.pipelineCodes)||[]).length||(t=r.candidate)!=null&&t.pipelineCode)}function An(){var i,l,o,d,u;const e=((i=r.candidate)==null?void 0:i.locationCountry)||((l=r.candidate)==null?void 0:l.country)||"Colombia",t=((o=r.candidate)==null?void 0:o.department)||"Bogotá D.C.",a=Ze[t]||Ze["Bogotá D.C."]||["Bogotá"],n=((d=r.candidate)==null?void 0:d.city)||((u=r.candidate)==null?void 0:u.locationCity)||a[0],s=e==="Colombia"?`${n}, ${t}`:e;return{country:e,department:t,city:n,label:s}}function xn(){var t,a,n;const e=((t=r.candidate)==null?void 0:t.targetRole)||((a=r.candidate)==null?void 0:a.headline)||"";return((n=Object.entries(Ye).find(([,s])=>s.includes(e)))==null?void 0:n[0])||Object.keys(Ye)[0]}function En(e){return Object.keys(Ye).map(t=>`<option value="${k(t)}" ${t===e?"selected":""}>${t}</option>`).join("")}function wa(e,t){const a=Ye[e]||Object.values(Ye).flat();return['<option value="">Choose the closest role</option>'].concat(a.map(n=>`<option value="${k(n)}" ${t===n?"selected":""}>${n}</option>`)).join("")}function Ce(e){const t=String(e||"").replace(/[,.\s]+$/,"").replace(/^[,.\s]+/,"").trim();if(!t||t.length<2)return"";const a=ma.find(n=>Z(n)===Z(t));return a||t.split(/\s+/).map(n=>n.length<=3&&n===n.toUpperCase()?n:n.charAt(0).toUpperCase()+n.slice(1).toLowerCase()).join(" ")}function Pn(e){const t=[...new Set((e||[]).map(Ce).filter(Boolean))],a=["Customer Service","Salesforce","HubSpot","Excel","Google Sheets","Technical Support","Outbound Calls","React","SQL","Payroll"];return`
    <div class="skill-search-shell" data-skill-search>
      <div class="selected-skills" id="selectedSkills">
        ${t.map(n=>`
          <span class="selected-skill" data-skill-chip="${k(n)}">
            ${C(n)}
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
        ${a.map(n=>`<button type="button" class="skill-suggestion" data-skill="${k(n)}">${C(n)}</button>`).join("")}
      </div>
      <p class="field-hint">Select between 5 and 20 skills that best describe your experience.</p>
    </div>
  `}function Sa(e,t="USD"){const a=Number(String(e||"").replace(/[^\d.]/g,"")),n=String(t||"USD").toUpperCase()==="COP"?"COP":"USD";if(!Number.isFinite(a)||a<=0)return{salary:"",salaryUSD:null,salaryCurrency:n,salaryAmount:null};const s=Math.round(a),i=n==="COP"?"es-CO":"en-US";return{salary:`$${new Intl.NumberFormat(i).format(s)} ${n}/mo`,salaryUSD:n==="USD"?s:null,salaryCurrency:n,salaryAmount:s}}function Ca(e){return Number(String(e||"").replace(/[^\d.]/g,""))}function Xt(e,t="USD"){const a=Ca(e),n=String(t||"USD").toUpperCase()==="COP"?"COP":"USD";return n==="USD"&&a>=1e5?"COP":n}function Lt(e,t="USD"){const a=Ca(e);return!Number.isFinite(a)||a<=0?"":new Intl.NumberFormat("en-US",{maximumFractionDigits:0}).format(Math.round(a))}typeof window<"u"&&(window.__fmtSalary=function(e){const t=String(e.value||"").replace(/[^\d]/g,"");e.value=t?Number(t).toLocaleString("en-US"):""});function Ue(e){return String(e||"").replace(/\S+/g,t=>/[A-Za-zÀ-ÿ]/.test(t)&&t===t.toUpperCase()?t.charAt(0).toUpperCase()+t.slice(1).toLowerCase():t)}function $a(e){return Array.isArray(e)?e:String(e||"").split(",").map(t=>t.trim()).filter(Boolean)}function Le(e){const t=$a(e.skills||e.requiredSkills);return{id:e.id||e.code,code:e.code||e.id,title:e.title||e.role||e.openingTitle||"Open role",orgName:e.orgName||e.company||e.clientName||"Nearwork client",location:e.location||"Remote",compensation:e.compensation||e.salary||e.rate||"Competitive",match:e.match||null,skills:t,description:e.description||e.about||"Nearwork is reviewing candidates for this role now."}}function xe(e){const t=(e==null?void 0:e.code)||"";return t.includes("operation-not-allowed")?"This sign-in method is not available yet.":t.includes("unauthorized-domain")?"This website still needs to be approved for sign-in.":t.includes("permission-denied")?"We could not save this yet. Please try again in a moment or contact Nearwork support.":t.includes("weak-password")?"Password must be at least 6 characters.":t.includes("invalid-credential")||t.includes("wrong-password")?"That email/password did not match.":t.includes("user-not-found")?"No account exists for that email yet.":t.includes("email-already-in-use")?"That email already has an account. Sign in instead.":"Something went wrong. Please try again or contact Nearwork support."}const nt=[{initials:"CP",name:"Camila P.",role:"Product Designer",city:"Medellín",quote:"I doubled my income and kept living in Medellín. The whole process took 19 days from apply to signed offer."},{initials:"AR",name:"Andrés R.",role:"SDR",city:"Bogotá",quote:"I went from chasing local leads to running outbound for a US SaaS team — same desk, way better pay."},{initials:"LG",name:"Laura G.",role:"Customer Success Manager",city:"Cali",quote:"No recruiters ghosting me. One profile, real interviews, and an offer that actually matched the role."},{initials:"FT",name:"Felipe T.",role:"Sales Ops Analyst",city:"Bucaramanga",quote:"The matching was spot on. I only talked to teams that fit what I was looking for, and signed within a month."},{initials:"DV",name:"Daniela V.",role:"Account Executive",city:"Cartagena",quote:"Now I'm closing deals for a US company in USD, still based in Cartagena. Best career move I've made."}];let Ee=null;function Ln(e){Ee&&clearInterval(Ee);const t=nt[0];et.innerHTML=`
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
            <p>"${t.quote}"</p>
            <div class="testimonial-person">
              <span class="mini-avatar">${t.initials}</span>
              <div><strong>${t.name}</strong><small>${t.role}, ${t.city}</small></div>
            </div>
          </div>
          <div class="testimonial-dots">
            ${nt.map((n,s)=>`<span class="testimonial-dot${s===0?" is-active":""}"></span>`).join("")}
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
  `,de();let a=0;Ee=setInterval(()=>{const n=document.querySelector(".testimonial");if(!n){clearInterval(Ee),Ee=null;return}const s=n.querySelector(".testimonial-content");s.classList.add("is-flipping"),setTimeout(()=>{a=(a+1)%nt.length;const i=nt[a],l=s.querySelector("p"),o=s.querySelector(".mini-avatar"),d=s.querySelector(".testimonial-person strong"),u=s.querySelector(".testimonial-person small");l&&(l.textContent=`"${i.quote}"`),o&&(o.textContent=i.initials),d&&(d.textContent=i.name),u&&(u.textContent=`${i.role}, ${i.city}`),n.querySelectorAll(".testimonial-dot").forEach((p,c)=>p.classList.toggle("is-active",c===a)),s.classList.remove("is-flipping")},320)},6e3)}function ka(e="login"){var s,i;const t=e==="signup";Ee&&clearInterval(Ee),Ee=null,et.innerHTML=`
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
          <h2 class="nw-signin-heading">${t?"Create your account.":"Welcome back."}</h2>
          ${r.message?`<div class="notice">${g("lock")} ${k(r.message)}</div>`:""}
          ${le?"":`<div class="notice">${g("triangle-alert")} Sign-in is still being set up.</div>`}
          ${le?`
          <button type="button" id="googleSignInBtn" class="nw-signin-btn" style="background:#fff;color:#111;border:1.5px solid #d9d9d9;box-shadow:none;margin-bottom:4px;">
            <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true" style="flex-shrink:0"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
            Continue with Google
          </button>
          <div class="nw-auth-divider" style="display:flex;align-items:center;gap:10px;margin:8px 0;color:#9e9e9e;font-size:12px;"><span style="flex:1;height:1px;background:#ebebeb;"></span>or<span style="flex:1;height:1px;background:#ebebeb;"></span></div>`:""}
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
                <button type="button" class="nw-pw-toggle" data-password-toggle aria-label="Show password">${g("eye")}</button>
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
              ${t?`${g("user-plus")} Create account`:`Sign in ${g("arrow-right")}`}
            </button>
            <p id="formMessage" class="form-message" role="status"></p>
          </form>
          <div class="nw-card-foot">
            ${g("sparkles")}
            <button id="toggleMode" class="nw-create-link" type="button">${t?"Already have an account? Sign in":"New or invited by Nearwork? Create your profile"}</button>
          </div>
          <a class="nw-back-jobs" href="https://www.nearwork.co/jobs" target="_blank" rel="noreferrer">${g("arrow-left")} Back to job board</a>
        </div>
      </div>
    </main>
  `,de();const a=new URLSearchParams(window.location.search).get("email");if(a){const l=document.querySelector("#emailInput");l&&(l.value=a,l.dispatchEvent(new Event("input")));const o=document.querySelector("#passwordInput");o&&o.focus()}if(new URLSearchParams(window.location.search).get("from")==="jobs"&&r.message!=="Welcome from Jobs — log in to view your dashboard."){const l=document.querySelector("#formMessage");l&&(l.textContent="Welcome from Jobs — log in to view your dashboard.",l.classList.add("success"))}document.querySelector("#toggleMode").addEventListener("click",()=>ka(t?"login":"signup")),document.querySelectorAll("[data-password-toggle]").forEach(l=>{l.addEventListener("click",()=>{const o=l.previousElementSibling,d=o.type==="password";o.type=d?"text":"password",l.innerHTML=g(d?"eye-off":"eye"),l.setAttribute("aria-label",d?"Hide password":"Show password"),de()})}),(s=document.querySelector("#resetPassword"))==null||s.addEventListener("click",async()=>{const l=document.querySelector("input[name='email']").value.trim().toLowerCase(),o=document.querySelector("#formMessage");if(!l){o.classList.remove("success"),o.textContent="Enter your email first, then request a reset link.";return}try{await dn(l),o.classList.add("success"),o.textContent=`Reset link sent! Check ${l} — it should arrive within a minute.`}catch(d){o.classList.remove("success"),o.textContent=xe(d)}}),document.querySelector("#authForm").addEventListener("submit",async l=>{var m;l.preventDefault();const o=new FormData(l.currentTarget),d=document.querySelector("#formMessage"),u=String(o.get("email")).trim().toLowerCase();if(d.textContent="",t){const f=document.querySelector("#privacyConsent"),E=document.querySelector("#privacyConsentError");if(f&&!f.checked){E&&(E.style.display=""),d.textContent="Please accept the Privacy Policy to continue.";return}E&&(E.style.display="none")}const p=t?((m=document.querySelector("#marketingConsent"))==null?void 0:m.checked)===!0:!1,c=new Date().toISOString();try{if(t){const f=Ue(String(o.get("name")||"").trim()),E=await Oa(U,u,o.get("password"));await ja(E.user,{displayName:f}),sessionStorage.setItem("nw_new_account","1"),await da(E.user.uid,{name:f,email:u,availability:"open",headline:"Nearwork candidate",onboarded:!1,source:"talent.nearwork.co",privacyConsent:!0,privacyConsentAt:c,marketingConsent:p,marketingConsentAt:p?c:null}),await Ya({name:f,firstName:f.split(/\s+/)[0],email:u}).catch(P=>console.error("[NW] account email failed:",P==null?void 0:P.message))}else await za(U,u,o.get("password"))}catch(f){d.textContent=xe(f)}}),(i=document.getElementById("googleSignInBtn"))==null||i.addEventListener("click",async()=>{const l=document.getElementById("googleSignInBtn"),o=document.getElementById("formMessage");l&&(l.disabled=!0),o&&(o.classList.remove("success"),o.textContent="Opening Google…");try{await Ja()}catch(d){l&&(l.disabled=!1),o&&(o.textContent=xe(d))}})}function Tn(){var n,s;const e=new URLSearchParams(window.location.search),t=e.get("token")||"",a=e.get("email")||"";Ln(`
    <section class="auth-panel">
      <div class="auth-top">
        <div class="right-brand">Near<span>work</span></div>
        <div class="candidate-chip">Candidate portal</div>
      </div>
      <div class="panel-heading">
        <h2>Set a new password.</h2>
        <p>${a?`Resetting password for <strong>${C(a)}</strong>. Choose a password you haven't used before.`:"Choose a new password you haven't used before."}</p>
      </div>
      ${t?r.resetCodeStatus==="success"?`
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
        ${r.resetCodeStatus==="error"?`<div class="notice">${g("triangle-alert")} ${C(r.resetCodeError||"Something went wrong. Please request a new link.")}</div>`:""}
        <button class="primary-action" type="submit" ${r.resetCodeStatus==="resetting"?"disabled":""}>
          ${r.resetCodeStatus==="resetting"?"Updating…":`${g("lock")} Set new password`}
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
  `),document.querySelectorAll("[data-password-toggle]").forEach(i=>{i.addEventListener("click",()=>{const l=i.previousElementSibling,o=l.type==="password";l.type=o?"text":"password",i.innerHTML=g(o?"eye-off":"eye"),i.setAttribute("aria-label",o?"Hide password":"Show password"),de()})}),(n=document.querySelector("#backToLogin"))==null||n.addEventListener("click",()=>{const i=r.resetCodeStatus==="success"?"Your password has been reset. Sign in with your new password.":"";window.history.pushState({},"","/"),$({view:"login",message:i,resetCodeStatus:null,resetCodeError:""})}),(s=document.querySelector("#resetForm"))==null||s.addEventListener("submit",async i=>{i.preventDefault();const l=document.querySelector("#newPassword").value,o=document.querySelector("#confirmPassword").value;if(l!==o){$({resetCodeStatus:"error",resetCodeError:"Passwords do not match."});return}if(l.length<6){$({resetCodeStatus:"error",resetCodeError:"Password must be at least 6 characters."});return}$({resetCodeStatus:"resetting"});try{const d=await fetch("/api/confirm-reset",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({token:t,newPassword:l})}),u=await d.json().catch(()=>({}));if(!d.ok||!u.ok)throw new Error(u.error||"Something went wrong. Please request a new link.");$({resetCodeStatus:"success"})}catch(d){const u=(d==null?void 0:d.message)||"This link has expired or already been used. Please request a new one.";$({resetCodeStatus:"error",resetCodeError:u})}})}async function ea(e){var t,a,n;$({loading:!0,user:e});try{const[s,i,l]=await Promise.allSettled([Xa(e),tn(e.uid),pa()]);let o=s.status==="fulfilled"?s.value:null;if(!o){const x=s.status==="rejected"?(t=s.reason)==null?void 0:t.message:"document not found";console.error("[NW] profile load:",x,"uid:",e.uid,"email:",e.email),new URLSearchParams(window.location.search).get("debug")==="1"&&alert("Profile debug — uid: "+e.uid+`
Status: `+s.status+`
Reason: `+x)}const d=i.status==="fulfilled"?i.value:[],u=l.status==="fulfilled"?l.value:[];let p=[];try{p=await an(e.uid,e.email,(o==null?void 0:o.candidateCode)||(o==null?void 0:o.code)||"")}catch(x){console.warn(x)}const c=Ae();if(c&&!p.some(x=>x.id===c)){const x=await nn(c,e.uid,e.email,(o==null?void 0:o.candidateCode)||(o==null?void 0:o.code)||"").catch(()=>null);x&&(p=[x,...p])}const m=sessionStorage.getItem("nw_new_account")==="1";m&&sessionStorage.removeItem("nw_new_account");const f=!!(o!=null&&o.targetRole||!ba(o==null?void 0:o.headline)&&(o!=null&&o.headline)),E=new URLSearchParams(window.location.search).get("from")==="jobs",P=!!(o!=null&&o.cvUrl||(a=o==null?void 0:o.applications)!=null&&a.length||((n=o==null?void 0:o.skills)==null?void 0:n.length)>=3),T=(o==null?void 0:o.onboarded)||f||P||E;!(o!=null&&o.onboarded)&&T&&(o!=null&&o.candidateCode)&&Xe(e.uid,{onboarded:!0,candidateCode:o.candidateCode}).catch(()=>null);const L=m&&!T?"onboarding":T?gt():"onboarding";$({candidate:{...o||{},name:(o==null?void 0:o.name)||e.displayName||"Talent member",email:(o==null?void 0:o.email)||e.email,availability:(o==null?void 0:o.availability)||"open",headline:(o==null?void 0:o.headline)||(o==null?void 0:o.targetRole)||"Nearwork candidate"},applications:d,assessments:p,jobs:u.map(Le),loading:!1,view:"dashboard",activePage:L,message:""}),fetch("/api/intercom-token",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({userId:e.uid,email:e.email})}).then(x=>x.ok?x.json():null).then(x=>{x!=null&&x.token&&window.Intercom&&window.Intercom("boot",{api_base:"https://api-iam.intercom.io",app_id:"pelltlav",intercom_user_jwt:x.token,user_id:e.uid,name:(o==null?void 0:o.name)||e.displayName||"",email:e.email,session_duration:864e5})}).catch(()=>{}),Q&&Q(),le&&(Q=pn(e.uid,x=>{r.notifications=x,r.view==="dashboard"&&r.activePage!=="onboarding"&&!r.message&&Aa()}))}catch(s){console.warn(s),$({candidate:{name:e.displayName||"Talent member",email:e.email,availability:"open",headline:"Nearwork candidate"},applications:[],assessments:[],jobs:[],loading:!1,view:"dashboard",activePage:gt(),message:""})}}async function We(){if(window.location.pathname==="/reset-password"){Q&&Q(),Q=null,$({user:null,candidate:null,loading:!1,view:"reset-password",resetCodeStatus:null});return}const e=gt();if(e==="assessment"){sessionStorage.setItem("nw_restore_path",window.location.pathname),$({user:null,candidate:null,applications:[],assessments:[],jobs:[],loading:!1,view:"login",activePage:"overview",message:"Please log in to open your assessment."});return}if(e==="overview"){Q&&Q(),Q=null,$({user:null,candidate:null,loading:!1,view:"login",activePage:"overview"});return}let t=[];try{const a=await pa();a.length&&(t=a.map(Le))}catch(a){console.warn(a)}$({user:null,candidate:null,applications:[],assessments:[],jobs:t,loading:!1,view:"login",activePage:"overview",message:"Please log in to view your profile, matched openings, applications, and assessments."})}function Nn(){return[{label:"My journey",items:[["overview","layout-dashboard","Overview"],["applications","send","Applications"],["assessment","clipboard-check","Assessment"]]},{label:"My search",items:[["matches","briefcase-business","Matches"],["cvs","files","CV Picker"]]},{label:"Support",items:[["tips","book-open","Tips"],["recruiter","calendar-days","Recruiter"],["profile","user-round-cog","Profile"]]}]}function Mn(){var e;return{open:"Open to roles",interviewing:"Interviewing",paused:"Not looking"}[((e=r.candidate)==null?void 0:e.availability)||"open"]||"Open to roles"}function Dt(){const e=r.candidate||{},t=tt();return[{id:"name",label:"Full name",done:!!e.name},{id:"role",label:"Target role",done:!!(e.targetRole||!ba(e.headline)&&e.headline)},{id:"location",label:"City",done:!!e.city},{id:"salary",label:"Salary",done:!!(e.salaryAmount||e.salary)},{id:"english",label:"English",done:!!e.english},{id:"whatsapp",label:"WhatsApp",done:!!(e.whatsapp||e.phone)},{id:"skills",label:"Skills (5-20)",done:t.length>=5},{id:"cv",label:"CV",done:!!e.cvUrl}]}function Aa(){var l,o,d,u,p;const e=(r.notifications||[]).filter(c=>!c.read).length,t=((l=r.candidate)==null?void 0:l.availability)||"open",n={open:"#10A07C",interviewing:"#EAB308",paused:"#9AA0A6"}[t]||"#10A07C",s=((o=r.candidate)==null?void 0:o.name)||((d=r.user)==null?void 0:d.displayName)||"Talent member",i=((u=r.candidate)==null?void 0:u.headline)||((p=r.candidate)==null?void 0:p.targetRole)||"Nearwork candidate";et.innerHTML=`
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
          ${Nn().map(c=>`
            <div class="nw-nav-group">
              <div class="nw-nav-group-label">${c.label}</div>
              ${c.items.map(([m,f,E])=>`
                <button class="nw-nav-item${r.activePage===m?" active":""}" data-page="${m}" type="button">
                  ${g(f)} ${E}
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
          ${ya()}
          <div class="nw-sidebar-profile-text">
            <div class="nw-sidebar-profile-name">${C(s)}</div>
            <div class="nw-sidebar-profile-role">${C(i)}</div>
          </div>
        </div>

        <!-- Sign out -->
        <button id="${r.user?"signOut":"signIn"}" class="nw-sidebar-signout" type="button">
          ${g(r.user?"log-out":"log-in")} ${r.user?"Sign out":"Sign in"}
        </button>
      </aside>

      <!-- ── Mobile bottom nav ── -->
      <nav class="nw-mobile-nav">
        <button class="nw-mob-tab${r.activePage==="overview"?" active":""}" data-page="overview" type="button">${g("layout-dashboard")}<span>Home</span></button>
        <button class="nw-mob-tab${r.activePage==="applications"?" active":""}" data-page="applications" type="button">${g("send")}<span>Applied</span></button>
        <button class="nw-mob-tab${r.activePage==="matches"?" active":""}" data-page="matches" type="button">${g("briefcase-business")}<span>Jobs</span></button>
        <button class="nw-mob-tab${r.activePage==="profile"?" active":""}" data-page="profile" type="button">${g("user-round-cog")}<span>Profile</span></button>
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
              <span class="nw-avail-label">${Mn()}</span>
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
              ${r.notificationPanelOpen?qn():""}
            </div>
            <button class="nw-icon-btn" type="button" id="notificationSettings" aria-label="Settings">
              ${g("settings")}
            </button>
          </div>
        </div>

        <!-- Notification settings -->
        ${r.notificationSettingsOpen?In():""}

        <!-- Page content -->
        ${r.message?`<div class="notice" style="margin:0 36px;">${r.message}</div>`:""}
        <div class="nw-page-content">
          ${(()=>{try{return Un()}catch(c){return console.error("renderActivePage error:",c),'<div class="notice">Page failed to render. <button type="button" data-page="overview">Go to overview</button></div>'}})()}
        </div>
      </section>
    </main>
  `,de(),Ks(),Bn(),Dn()}function _n(e){return(e!=null&&e.toDate?e.toDate():new Date(e||Date.now())).toLocaleString("en-US",{month:"short",day:"numeric",year:"numeric",hour:"numeric",minute:"2-digit"})}function qn(){const e=(r.notifications||[]).slice(0,10);return`
    <div class="notification-panel">
      <div class="notification-panel-head"><strong>Notifications</strong><span>${e.length?"Latest updates":"All clear"}</span></div>
      ${e.length?e.map(t=>`
        <button class="notification-item ${t.read?"":"unread"}" type="button" data-notification-read="${t.id}">
          <strong>${k(t.title||"Nearwork update")}</strong>
          <span>${k(t.message||"")}</span>
          <time>${_n(t.createdAt)}</time>
        </button>
      `).join(""):'<div class="notification-empty">No notifications yet.</div>'}
    </div>
  `}function In(){var a;const e=((a=r.candidate)==null?void 0:a.notificationPreferences)||{};return`
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
  `}let st=null;function Dn(){st&&window.clearInterval(st);const e=document.querySelector("#assessmentTimer");if(!e)return;const t=new Date(e.dataset.end||"").getTime(),a=()=>{const n=Math.max(0,t-Date.now()),s=Math.floor(n/1e3),i=Math.floor(s/60),l=String(s%60).padStart(2,"0");e.textContent=`${i}:${l}`,e.classList.toggle("is-low",n<=10*60*1e3),n<=0&&window.clearInterval(st)};a(),st=window.setInterval(a,1e3)}function Bn(){if(r.activePage!=="assessment")return;const e=r.assessments||[],t=Ae(),n=(t?e.find(i=>i.id===t):null)||e.find(i=>["sent","started"].includes(String(i.status||"").toLowerCase()));if(!(n!=null&&n.id))return;const s=String(n.status||"").toLowerCase();if(s==="started"&&fa()===null){Ie(n.id,Number(n.currentQuestionIndex||0),!0);return}if(!t&&s==="sent"){const i=`/assessment/${encodeURIComponent(n.id)}/start`;window.history.replaceState({page:"assessment",assessmentId:n.id},"",i)}}function Un(){return({onboarding:zn,overview:ta,matches:Cs,applications:$s,assessment:ks,cvs:Bs,tips:Us,recruiter:Rs,profile:Fs}[r.activePage]||ta)()}function ta(){var P,T;const e=Ta(),t=Dt(),a=t.filter(L=>L.done).length,n=t.length,s=r.applications||[],i=s.filter(L=>["action-needed","interview-scheduled","assessment-sent"].includes(String(L.status||"").toLowerCase())).length,l=(r.jobs||[]).slice(0,3),o=((P=r.candidate)==null?void 0:P.recruiter)||{},d=2*Math.PI*52,u=d*(1-e/100),c=new Date().toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"}),m=(L,x,I,F,V)=>`
    <div class="nw-stat-tile">
      <div class="nw-stat-tile-top">
        <span class="nw-stat-tile-label">${L}</span>
        <div class="nw-stat-icon" style="background:${F}14;">
          ${g(V)}
        </div>
      </div>
      <div class="nw-stat-value">${x}</div>
      <div class="nw-stat-sub">${I}</div>
    </div>`,f=(L,x)=>{const I=String(L.stage||L.status||"applied").toLowerCase(),F=I.includes("offer")?4:I.includes("final")?3:I.includes("interview")?2:I.includes("assessment")?1:0,V=L.clientName||L.company||"Nearwork client",ae=V.split(/\s+/).slice(0,2).map(ne=>ne[0]).join("").toUpperCase(),Y=["#10A07C","#EC4E7E","#3B82F6","#F4A52E","#8B5CF6"],G=Y[V.length%Y.length];return`
      <div class="nw-app-row${x?" last":""}">
        <div class="nw-app-avatar" style="background:${G};">${ae}</div>
        <div class="nw-app-info">
          <div class="nw-app-title">${C(L.jobTitle||L.title||"Application")} <span class="nw-app-company">· ${C(V)}</span></div>
          <div class="nw-app-stages">
            ${ga.map((ne,h)=>`<div class="nw-stage-pip${h<=F?" done":""}"></div>`).join("")}
            <span class="nw-app-stage-label">${L.stage||L.status||"Applied"}</span>
          </div>
        </div>
        <div class="nw-app-meta">
          <span class="nw-app-status${i?" action":""}">${L.status||"In review"}</span>
          <div class="nw-app-date">${ft(L.updatedAt||L.createdAt)}</div>
        </div>
        ${g("chevron-right")}
      </div>`},E=L=>{const x=Le(L),I=qt(x),F=x.match||(I.length>=3?Math.min(97,70+I.length*4):null),V=["#10A07C","#EC4E7E","#3B82F6","#F4A52E"],ae=V[x.orgName.length%V.length],Y=x.orgName.split(/\s+/).slice(0,2).map(G=>G[0]).join("").toUpperCase();return`${encodeURIComponent(x.code)}`,`
      <div class="nw-match-card">
        <div class="nw-match-card-top">
          <div class="nw-match-avatar" style="background:${ae};">${Y}</div>
          ${F?`<div class="nw-match-score">${F}%</div>`:""}
        </div>
        <div class="nw-match-role">${C(x.title)}</div>
        <div class="nw-match-company">${C(x.orgName)} · ${C(x.location)}</div>
        ${I.length?`<div class="nw-match-why">${I.slice(0,3).map(C).join(" · ")} match</div>`:`<div class="nw-match-why">${C(x.description).slice(0,80)}…</div>`}
        <div class="nw-match-footer">
          <span class="nw-match-salary">${C(x.compensation)}</span>
          <button type="button" class="nw-match-apply" data-apply="${k(x.code)}">Apply ${g("arrow-right")}</button>
        </div>
      </div>`};return`
    <!-- Greeting -->
    <div class="nw-overview-header">
      <div class="nw-overview-date">Overview · ${c}</div>
      <h1 class="nw-overview-greeting">
        Hi ${C(ha())},
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
        <h2 class="nw-readiness-title">${n-a} more step${n-a>1?"s":""} and Nearwork can boost your matches.</h2>
        <div class="nw-readiness-checklist">
          ${t.map(L=>`
            <div class="nw-check-pill${L.done?" done":""}">
              ${g(L.done?"check":"circle")} ${L.label}
            </div>`).join("")}
        </div>
        <div class="nw-readiness-actions">
          <button class="nw-finish-btn" type="button" data-page="profile">
            Finish profile ${g("arrow-right")}
          </button>
          <span class="nw-readiness-count">${a} of ${n} complete</span>
        </div>
      </div>
    </div>`}

    <!-- Stat tiles -->
    <div class="nw-stat-grid">
      ${m("Open matches",r.jobs.length,r.jobs.length?`${r.jobs.length} role${r.jobs.length>1?"s":""} waiting`:"Complete profile to unlock","#10A07C","sparkles")}
      ${m("Applications",s.length,s.length?`${i||"0"} need your input`:"Not applied yet","#EC4E7E","send")}
      ${m("Interviews",s.filter(L=>String(L.stage||L.status||"").toLowerCase().includes("interview")).length,"Scheduled","Not yet scheduled","#F4A52E")}
      ${m("CVs saved",(((T=r.candidate)==null?void 0:T.cvLibrary)||[]).length,"In your library","Upload your first CV","#3B82F6")}
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
        ${s.length?s.slice(0,4).map((L,x)=>f(L,x===Math.min(s.length,4)-1)).join(""):`<div class="nw-empty">
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
            <div class="nw-recruiter-avatar">${o.initials||"NW"}</div>
            <div>
              <div class="nw-recruiter-name">${C(o.name||"Nearwork Support")}</div>
              <div class="nw-recruiter-role">${C(o.role||"Talent Partner")}</div>
            </div>
          </div>
          <p class="nw-recruiter-bio">I'll review every match and prep you before each interview. Reach out anytime.</p>
          <div class="nw-recruiter-btns">
            <a class="nw-recruiter-msg" href="mailto:${k(o.email||"support@nearwork.co")}">${g("message-square-text")} Message</a>
            <a class="nw-recruiter-call" href="https://wa.me/${encodeURIComponent((o.whatsapp||"+1").replace(/\D/g,""))}" target="_blank" rel="noreferrer">${g("calendar-plus")} WhatsApp</a>
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
          ${l.map(L=>E(L)).join("")}
        </div>
      </section>
    `:""}
  `}const Rn=["Customer Success","Sales / SDR","Operations","Finance & Accounting","Marketing","Design","Engineering","Data","People / HR","Executive Assistant"],Fn=["Google search","LinkedIn","A friend or colleague","ChatGPT","Claude","Instagram or TikTok","A Nearwork recruiter","Another job board","Other"],On=["HubSpot","Salesforce","Zendesk","Excel","SQL","Notion","Figma","Churn analysis","Onboarding","QBRs","Process design"],jn={basic:"A2",intermediate:"B1",advanced:"B2",fluent:"C1"},aa={"Customer Success":"Customer Success",Sales:"Sales / SDR",Support:"Customer Success",Operations:"Operations",Marketing:"Marketing",Engineering:"Engineering",Finance:"Finance & Accounting","Human Resources":"People / HR"};function zn(){return""}function Hn(e){const t=String(e||"").toUpperCase();return t?t.includes("NATIVE")||t.startsWith("C")?"fluent":t.startsWith("B2")?"advanced":t.startsWith("B")?"intermediate":t.startsWith("A")?"basic":"":""}function Vn(){var o;if(Qe)return;Qe=!0,pe=0,Et=!1;const e=r.candidate||{},t=String(e.name||"").trim().split(/\s+/).filter(Boolean),a=e.location||[e.city||e.locationCity,e.department||e.locationDepartment].filter(Boolean).join(", ")||"",n=Array.isArray(e.workHistory)&&e.workHistory.length?e.workHistory.map(d=>({title:d.title||"",company:d.company||"",from:d.from||"",to:(d.to==="present"?"":d.to)||"",current:d.to==="present"||!!d.current,open:!1})):[],s=Array.isArray(e.certifications)&&e.certifications.length?e.certifications.map(d=>({kind:"cert",title:d.name||d.title||"",school:d.issuer||d.school||"",year:d.date||d.year||"",open:!1})):[];Array.isArray(e.education)&&e.education.forEach(d=>s.push({kind:"degree",title:d.degree||d.title||"",school:d.institution||d.school||"",year:d.year||"",open:!1}));const i=Number(e.expectedSalaryUSD||e.salaryUSD||0)||"",l=String(e.linkedin||"").replace(/^https?:\/\//,"").replace(/^(www\.)?linkedin\.com\/in\//,"");y={cv:e.activeCvName||null,first:e.firstName||t[0]||"",last:e.lastName||t.slice(1).join(" ")||"",email:e.email||((o=r.user)==null?void 0:o.email)||"",phone:String(e.phone||e.whatsapp||"").replace(/^\+?57\s?/,""),city:a,country:e.locationCountry||e.country||"",timezone:e.timezone||e.timeZone||"",timezoneName:e.timezoneName||"",linkedin:l,english:e.englishLevel||Hn(e.english),roles:n,education:s,skills:Array.isArray(e.skills)?[...new Set(e.skills.map(Ce).filter(Boolean))]:[],functions:Array.isArray(e.functions)&&e.functions.length?[...e.functions]:aa[e.roleGroup]?[aa[e.roleGroup]]:[],workType:e.workType||"full",availability:e.startAvailability||"2w",salaryMin:e.expectedSalaryMinUSD||i||"",salaryMax:e.expectedSalaryMaxUSD||i||"",portfolio:String(e.portfolio||"").replace(/^https?:\/\//,""),files:Array.isArray(e.attachments)?[...e.attachments]:[],source:e.source||"",sourceOther:e.sourceOther||"",shareProfile:e.shareProfile!==!1,notifyMatches:e.notifyMatches!==!1,notifyNews:e.notifyNews===!0,summary:e.summary||"",_cvFlags:{}},Je=null,Se=y.cv?"done":"idle",ye=y.cv?4:0}function N(e,t=16,a=""){return`<span class="onb2-i" style="--isz:${t}px;${a?`color:${a};`:""}">${g(e)}</span>`}function xa(e){return`<div class="onb2-wm" style="font-size:${e||22}px">Near<span>work</span></div>`}function Gn(){Vn(),et.innerHTML=`
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
    </div>`,B(pe)}function B(e){pe=e;const t=document.querySelector("#onb2Card");if(!t)return;const a=document.querySelector("#onb2Rail"),n=document.querySelector("#onb2Topbar"),s=document.querySelector("#onb2Footer"),i=document.querySelector("#onb2Savebar");a&&(a.innerHTML=Ea()),n&&(n.innerHTML=Qn()),i&&(i.innerHTML=e<4?`<button type="button" class="onb2-linkrow" data-onb-save-exit>Save &amp; finish later ${N("log-out",14,"#9E9E9E")}</button>`:""),t.innerHTML=Yn(e),t.classList.remove("onb2-card"),t.offsetWidth,t.classList.add("onb2-card"),s&&(s.innerHTML=e<4?Jn(e):""),de(),fs(e),e===4&&Ss()}function Ea(){const e=[["Your CV","20 sec"],["About you","40 sec"],["Experience","45 sec"],["What you want","45 sec"]],t=Bt();return`
    <div>
      <div style="margin-bottom:34px">${xa()}</div>
      <div style="display:flex;flex-direction:column;gap:2px">
        ${e.map((a,n)=>{const s=n<pe;return`<button type="button" class="onb2-railstep ${n===pe?"is-on":""} ${s?"is-done":""}" data-onb-nav="${n}">
            <span class="onb2-railnum">${s?N("check",12,"#fff"):n+1}</span>
            <span><span class="onb2-railstep-label">${a[0]}</span><span class="onb2-railstep-hint">${a[1]}</span></span>
          </button>`}).join("")}
      </div>
    </div>
    <div style="display:flex;flex-direction:column;gap:14px">
      ${Wn()}
      <div style="padding-top:14px;border-top:1px solid var(--onb2-g200)">
        <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:7px">
          <span style="font-size:12px;font-weight:600;color:var(--onb2-g600)">Profile strength</span>
          <span style="font-size:12px;color:var(--onb2-accent-ink);font-weight:500" id="onb2StrengthPct">${t}%</span>
        </div>
        <div class="onb2-meter"><div class="onb2-meter-fill" id="onb2StrengthBar" style="width:${t}%"></div></div>
      </div>
      <div style="display:flex;align-items:center;gap:9px;font-size:12px;color:var(--onb2-g500)">
        ${N("lock",13,"#9E9E9E")}<span>Private until you say otherwise</span>
      </div>
    </div>`}function Wn(){if(Se==="idle")return`<div class="onb2-parsecard is-idle">${N("scan-line",15,"#9E9E9E")}<span style="font-size:12.3px;line-height:1.45;color:var(--onb2-g500)">Add a CV and we'll fill the rest of this form for you.</span></div>`;const e=Se==="done",t=y.roles.length,a=y.education.length,n=y.skills.length,s=[["file-text","Reading your document"],["briefcase",`Work history · ${t} role${t===1?"":"s"}`],["graduation-cap",`Education · ${a} ${a===1?"entry":"entries"}`],["tags",`Skills · ${n} found`]];return`<div class="onb2-parsecard ${e?"is-done":""}">
    <div style="display:flex;align-items:center;gap:9px;margin-bottom:11px">
      ${e?N("check-circle",15,"#10A07C"):'<span class="onb2-spin" style="width:14px;height:14px;border-radius:50%;border:2px solid var(--onb2-g200);border-top-color:var(--onb2-accent);display:inline-block"></span>'}
      <span style="font-size:11px;letter-spacing:0.05em;color:${e?"var(--onb2-accent-ink)":"var(--onb2-g500)"};font-weight:600">${e?"CV IMPORTED":"READING CV…"}</span>
    </div>
    <div style="display:flex;flex-direction:column;gap:8px">
      ${s.map((i,l)=>{const o=ye>l;return`<div style="display:flex;align-items:center;gap:9px;opacity:${o?1:.4};transition:opacity 300ms">
          ${N(o?"check":i[0],13,o?"#10A07C":"#9E9E9E")}
          <span style="font-size:12.3px;color:${o?"var(--onb2-g700)":"var(--onb2-g500)"}">${i[1]}</span>
        </div>`}).join("")}
    </div>
  </div>`}function Qn(){return`
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
      ${xa(19)}
      <span style="font-size:11.5px;letter-spacing:0.04em;color:var(--onb2-g500);font-weight:600">${pe>=4?"DONE":`${pe+1} / 4`}</span>
    </div>
    <div style="height:4px;border-radius:999px;background:var(--onb2-g200);overflow:hidden">
      <div style="width:${(Math.min(pe,4)+1)/5*100}%;height:100%;background:linear-gradient(90deg,#10A07C,#AF7AC5);transition:width 400ms cubic-bezier(0.16,1,0.3,1)"></div>
    </div>`}function Jn(e){const t=Ut(e),a=!!y.cv,n=e===0?a?"Continue while it reads":"Continue":e===3?y.first?`Finish, ${C(y.first)}`:"Finish and go live":"Continue",s=e===0&&!a;return`
    <div class="onb2-footer">
      <div id="onb2Blocker">${t?`<div class="onb2-blocker">${N("info",14,"#E74C7C")}${C(t)}</div>`:""}</div>
      <div class="onb2-footer-row">
        ${e>0?`<button type="button" class="onb2-btn onb2-btn-ghost" data-onb-back>${N("arrow-left",17,"#555555")}Back</button>`:""}
        <button type="button" class="onb2-btn onb2-btn-primary" id="onb2Next" data-onb-next ${t?"disabled":""}>${n}${N("arrow-right",17,"#fff")}</button>
        ${s?'<button type="button" class="onb2-linkrow" data-onb-skip style="text-decoration:underline;text-underline-offset:3px">Skip for now</button>':""}
        <span class="onb2-saved">${N("cloud",14,"#9E9E9E")}Saved automatically</span>
      </div>
    </div>`}function Pa(){return(y.roles||[]).filter(e=>e.title&&e.company)}function Bt(e){const t=y,a=Pa().length;return Math.min(100,Math.round(5+(t.cv?14:0)+(t.first?4:0)+(t.last?4:0)+(t.phone?5:0)+(t.city?5:0)+(t.linkedin?6:0)+Math.min(18,a*9)+Math.min(8,t.education.filter(n=>n.title).length*4)+Math.min(12,t.skills.length*1.5)+Math.min(6,t.functions.length*3)+(Number(t.salaryMin)&&Number(t.salaryMax)?4:0)+(t.portfolio||t.files.length?3:0)+(t.shareProfile?3:0)+(e||pe>=4?3:0)))}function Ut(e){const t=y;return e===1?!t.first||!t.last?"Add your first and last name to continue.":t.phone?t.city?null:"Let us know where you’re based.":"Add a phone number so companies can schedule interviews.":e===2?Pa().length?t.skills.length<3?"Pick at least 3 skills so we can match you (more is better).":null:"Add at least one role — job title and company.":e===3?t.functions.length?!Number(t.salaryMin)||!Number(t.salaryMax)?"Add your salary range — companies filter on it.":null:"Pick at least one type of role you’re open to.":null}function La(){const e=y.functions&&y.functions[0]||"";return{Engineering:[1800,3400],Data:[1700,3200],Design:[1500,2800],"Finance & Accounting":[1500,2600],Marketing:[1400,2600]}[e]||[1400,2300]}function X(e){const t=`class="onb2-input" ${e.textarea?'rows="3"':`type="${e.type||"text"}"`} ${e.locked?"disabled":""} placeholder="${k(e.placeholder||"")}" ${e.data||""}`,a=e.textarea?`<textarea ${t}>${C(e.value||"")}</textarea>`:`<input ${t} value="${k(e.value==null?"":e.value)}" />`;return`<label class="onb2-fieldwrap">
    <div class="onb2-fieldhead">
      <span class="onb2-fieldlabel">${C(e.label)}${e.req?'<span class="onb2-req" title="Required">*</span>':""}${e.badge?`<span class="onb2-badge">${N("sparkles",10,"#10A07C")}${C(e.badge)}</span>`:""}</span>
      ${e.aside||""}
    </div>
    <div class="onb2-fieldbox ${e.locked?"is-locked":""}">
      ${e.prefix?`<span class="onb2-prefix">${C(e.prefix)}</span>`:""}
      ${a}
      ${e.trailing||""}
    </div>
    ${e.hint?`<div class="onb2-fieldhint">${e.hint}</div>`:""}
  </label>`}function Tt(e,t,a,n){return`<div class="onb2-seg" style="grid-template-columns:repeat(${t.length},minmax(0,1fr))">
    ${t.map(s=>`<button type="button" class="onb2-seg-btn ${s.v===a?"is-on":""}" data-onb-seg="${e}" data-onb-val="${k(s.v)}">${C(s.label)}${n&&s.sub?`<div class="onb2-seg-sub">${C(s.sub)}</div>`:""}</button>`).join("")}
  </div>`}function Nt(e,t,a,n){return`<div class="onb2-chips">
    ${t.map(s=>{const i=a.includes(s);return`<button type="button" class="onb2-chip ${i?"is-on":""}" data-onb-chip="${e}" data-onb-val="${k(s)}">${i?N("check",13,"#10A07C"):""}${C(s)}</button>`}).join("")}
    ${n?`<span class="onb2-chip-add"><input type="text" placeholder="Add your own" data-onb-chip-input="${e}" /><button type="button" data-onb-chip-add="${e}" aria-label="Add">${N("plus",14,"#757575")}</button></span>`:""}
  </div>`}function kt(e,t,a,n,s){return`<div class="onb2-toggle ${n?"is-on":""} " data-onb-toggle="${e}" >
    <div style="flex:1">
      <div class="onb2-toggle-title">${C(t)}</div>
      <p class="onb2-toggle-desc">${C(a)}</p>
    </div>
    <div class="onb2-switch"><div class="onb2-knob"></div></div>
  </div>`}function ht(e,t,a,n){return`<div style="margin-bottom:26px">
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px">
      <span class="onb2-eyebrow">${C(e)}</span>
      ${t?`<span class="onb2-eyebrow-dot"></span><span class="onb2-minutes">${C(t)}</span>`:""}
    </div>
    <h1 class="onb2-title">${C(a)}</h1>
    <p class="onb2-sub">${C(n)}</p>
  </div>`}function ge(e){return`<div>
    <div style="display:flex;justify-content:space-between;align-items:baseline;gap:12px;margin-bottom:${e.hint?4:9}px">
      <span class="onb2-grouplabel">${C(e.label)}${e.req?'<span class="onb2-req">*</span>':""}</span>
      ${e.aside||""}
    </div>
    ${e.hint?`<div class="onb2-grouphint" style="margin-bottom:10px">${e.hint}</div>`:""}
    ${e.body}
  </div>`}function Yn(e){switch(e){case 0:return Zn();case 1:return Kn();case 2:return ss();case 3:return os();case 4:return rs();default:return""}}function Zn(){const e=!!y.cv,t=Math.round(ye/4*100),a=e?`<div class="onb2-filecard">
        <div style="display:flex;align-items:center;gap:14px">
          <div style="width:42px;height:42px;border-radius:11px;background:#fff;border:1px solid var(--onb2-accent-border);display:inline-flex;align-items:center;justify-content:center;flex-shrink:0">${N("file-text",19,"#10A07C")}</div>
          <div style="flex:1;min-width:0">
            <div style="font-size:14.5px;font-weight:600;color:var(--onb2-black);letter-spacing:-0.01em;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${C(y.cv)}</div>
            <div style="font-size:12.5px;color:var(--onb2-g600);margin-top:3px" id="onb2CvStatus">${Se==="done"?"Imported":`Reading (${t}%)`}</div>
          </div>
          <button type="button" data-onb-cv-remove aria-label="Remove CV" style="background:transparent;border:none;cursor:pointer;padding:8px;border-radius:9px;display:inline-flex">${N("x",17,"#757575")}</button>
        </div>
        ${Se!=="done"?`<div style="height:5px;border-radius:999px;background:rgba(255,255,255,0.7);margin-top:14px;overflow:hidden"><div id="onb2CvBar" style="width:${Math.max(8,t)}%;height:100%;background:var(--onb2-accent);border-radius:999px;transition:width 600ms cubic-bezier(0.16,1,0.3,1)"></div></div>`:""}
      </div>`:`<div class="onb2-dropzone" id="onb2Dropzone">
        <input type="file" id="onb2CvInput" accept=".pdf,.doc,.docx" style="display:none" />
        <div style="width:54px;height:54px;border-radius:16px;background:var(--onb2-accent-bg);border:1px solid var(--onb2-accent-border);display:inline-flex;align-items:center;justify-content:center;margin-bottom:16px">${N("upload-cloud",24,"#10A07C")}</div>
        <div style="font-size:16.5px;font-weight:600;color:var(--onb2-black);letter-spacing:-0.02em">Drop your CV here, or browse</div>
        <div style="font-size:13.5px;color:var(--onb2-g500);margin-top:7px">PDF, DOC or DOCX · up to 10 MB · English or Spanish</div>
      </div>`;return`<div>
    ${ht("STEP 01 · YOUR CV","20 SEC","Start with your CV.","Drop it in and we'll read it while you answer a few short questions — no retyping your whole career.")}
    ${a}
    <div style="margin-top:14px">
      <button type="button" class="onb2-import" data-onb-manual>
        ${N("pencil-line",17,"#10A07C")}
        <span style="flex:1"><span style="display:block;font-size:14px;font-weight:600;color:var(--onb2-black);letter-spacing:-0.01em">Enter my details manually</span><span style="display:block;font-size:12.5px;color:var(--onb2-g500);margin-top:3px">No CV handy? It takes about 3 minutes</span></span>
        ${N("arrow-right",16,"#9E9E9E")}
      </button>
    </div>
    <div style="display:flex;gap:11px;align-items:flex-start;margin-top:22px;padding:14px 16px;background:var(--onb2-g50);border-radius:12px">
      ${N("shield-check",16,"#757575")}
      <p style="font-size:12.8px;line-height:1.5;color:var(--onb2-g600);margin:0">Your CV is only used to build your profile. Nothing is shared with a company until you approve it on the last step.</p>
    </div>
  </div>`}function Kn(){const e=y,t=!!e.cv,a=e._cvFlags||{};return`<div>
    ${ht("STEP 02 · ABOUT YOU","40 SEC",t&&e.first?`Nice to meet you, ${e.first}.`:"Tell us who you are.",t?"We pulled these from your CV — fix anything that looks off.":"The basics a hiring team needs to reach you.")}
    <div style="display:flex;flex-direction:column;gap:18px">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px" class="onb2-two">
        ${X({label:"First name",req:!0,value:e.first,placeholder:"Camila",badge:a.first?"CV":null,data:'data-onb-field="first"'})}
        ${X({label:"Last name",req:!0,value:e.last,placeholder:"Restrepo",badge:a.last?"CV":null,data:'data-onb-field="last"'})}
      </div>
      ${X({label:"Email",req:!0,value:e.email,locked:!0,trailing:`<span class="onb2-verified">${N("check",12,"#16A34A")}Verified</span>`})}
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px" class="onb2-two">
        ${X({label:"WhatsApp / phone",req:!0,prefix:"+57",value:e.phone,placeholder:"300 123 4567",hint:"Used for interview scheduling only.",data:'data-onb-field="phone"'})}
        ${X({label:"Where you’re based",req:!0,value:e.city,placeholder:"Medellín, Colombia",badge:a.city?"CV":null,hint:"We match you to overlapping US time zones.",data:'data-onb-field="city"'})}
      </div>
      ${X({label:"LinkedIn",prefix:"linkedin.com/in/",value:e.linkedin,placeholder:"your-handle",hint:"Optional, but profiles with LinkedIn get shortlisted ~2× more often.",data:'data-onb-field="linkedin"'})}
      ${ge({label:"English level",req:!0,hint:"Be honest — we place people at every level, and we'll never put you in an interview you can't win.",body:Tt("english",[{v:"basic",label:"Basic",sub:"A1–A2"},{v:"intermediate",label:"Intermediate",sub:"B1"},{v:"advanced",label:"Advanced",sub:"B2"},{v:"fluent",label:"Fluent",sub:"C1+"}],e.english,!0)})}
    </div>
  </div>`}const Ve=new Map;function Xn(e){const t=e.trim().toLowerCase();if(!t)return Promise.resolve(null);if(Ve.has(t)){const n=Ve.get(t);return n instanceof Promise?n:Promise.resolve(n)}const a=fetch(`https://autocomplete.clearbit.com/v1/companies/suggest?query=${encodeURIComponent(e)}`).then(n=>n.ok?n.json():[]).then(n=>{const s=Array.isArray(n)&&n[0]&&n[0].domain?n[0].domain:null;return Ve.set(t,s),s}).catch(()=>(Ve.set(t,null),null));return Ve.set(t,a),a}function es(){document.querySelectorAll("[data-onb-rolelogo]").forEach(t=>{const a=Number(t.dataset.onbRolelogo),n=(y.roles[a]&&y.roles[a].company||"").trim();n&&Xn(n).then(s=>{if(!s||!t.isConnected||(y.roles[a]&&y.roles[a].company||"").trim().toLowerCase()!==n.toLowerCase()||t.querySelector("img[data-onb-logo-img]"))return;const l=document.createElement("img");l.dataset.onbLogoImg="1",l.alt="",l.style.cssText="width:100%;height:100%;object-fit:contain;border-radius:8px;background:#fff;",l.onerror=()=>l.remove(),l.src=`https://icons.duckduckgo.com/ip3/${s}.ico`,t.appendChild(l)}).catch(()=>{})})}function ts(e,t){const a=e.open,n=(e.company||"?").slice(0,2).toUpperCase(),s=[e.company,e.from&&`${e.from} – ${e.current?"Present":e.to||""}`].filter(Boolean).join(" · ")||"Add the details";return`<div class="onb2-ecard ${a?"is-open":""}">
    <div class="onb2-ecard-head">
      <div class="onb2-ecard-icon" data-onb-rolelogo="${t}">${C(n)}</div>
      <div style="flex:1;min-width:0">
        <div class="onb2-ecard-title">${C(e.title||"New role")}</div>
        <div class="onb2-ecard-meta">${C(s)}</div>
      </div>
      ${e.current?'<span class="onb2-current-chip">CURRENT</span>':""}
      <button type="button" class="onb2-ecard-edit" data-onb-role-edit="${t}">${a?"Done":"Edit"}${N(a?"chevron-up":"chevron-down",14,"#10A07C")}</button>
    </div>
    ${a?`<div class="onb2-ecard-body">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px" class="onb2-two">
        ${X({label:"Job title",value:e.title,placeholder:"Customer Success Manager",data:`data-onb-rolefield="title" data-onb-idx="${t}"`})}
        ${X({label:"Company",value:e.company,placeholder:"Rappi",data:`data-onb-rolefield="company" data-onb-idx="${t}"`})}
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px" class="onb2-two">
        ${X({label:"Started",value:e.from,placeholder:"Mar 2022",data:`data-onb-rolefield="from" data-onb-idx="${t}"`})}
        ${X({label:"Ended",value:e.current?"":e.to,placeholder:"Present",locked:e.current,data:`data-onb-rolefield="to" data-onb-idx="${t}"`})}
      </div>
      <div style="display:flex;align-items:center;justify-content:space-between;gap:12px">
        <button type="button" data-onb-role-current="${t}" style="display:inline-flex;align-items:center;gap:9px;background:transparent;border:none;cursor:pointer;font:inherit;font-size:13.5px;color:var(--onb2-g700)">
          <span style="width:18px;height:18px;border-radius:5px;border:1.5px solid ${e.current?"var(--onb2-accent)":"var(--onb2-g300)"};background:${e.current?"var(--onb2-accent)":"#fff"};display:inline-flex;align-items:center;justify-content:center">${e.current?N("check",12,"#fff"):""}</span>
          I still work here
        </button>
        <button type="button" data-onb-role-remove="${t}" style="background:transparent;border:none;cursor:pointer;font:inherit;font-size:13px;color:var(--onb2-g500);display:inline-flex;align-items:center;gap:6px">${N("trash-2",14,"#9E9E9E")}Remove</button>
      </div>
    </div>`:""}
  </div>`}function as(e,t){const a=e.open,n=e.kind==="cert",s=[e.school,e.year].filter(Boolean).join(" · ")||"Add the details";return`<div class="onb2-ecard ${a?"is-open":""}">
    <div class="onb2-ecard-head">
      <div class="onb2-ecard-icon">${N(n?"award":"graduation-cap",17,"#757575")}</div>
      <div style="flex:1;min-width:0">
        <div class="onb2-ecard-title">${C(e.title||(n?"New certification":"New education"))}</div>
        <div class="onb2-ecard-meta">${C(s)}</div>
      </div>
      <button type="button" class="onb2-ecard-edit" data-onb-edu-edit="${t}">${a?"Done":"Edit"}${N(a?"chevron-up":"chevron-down",14,"#10A07C")}</button>
    </div>
    ${a?`<div class="onb2-ecard-body">
      ${X({label:n?"Certification or course":"Degree or programme",value:e.title,placeholder:n?"Project Management Professional (PMP)":"BSc Business Administration",data:`data-onb-edufield="title" data-onb-idx="${t}"`})}
      <div style="display:grid;grid-template-columns:1.6fr 1fr;gap:12px" class="onb2-two">
        ${X({label:n?"Issued by":"Institution",value:e.school,placeholder:n?"PMI":"Universidad EAFIT",data:`data-onb-edufield="school" data-onb-idx="${t}"`})}
        ${X({label:n?"Year earned":"Year finished",value:e.year,placeholder:"2023",data:`data-onb-edufield="year" data-onb-idx="${t}"`})}
      </div>
      <button type="button" data-onb-edu-remove="${t}" style="align-self:flex-start;background:transparent;border:none;cursor:pointer;font:inherit;font-size:13px;color:var(--onb2-g500);display:inline-flex;align-items:center;gap:6px">${N("trash-2",14,"#9E9E9E")}Remove</button>
    </div>`:""}
  </div>`}function ns(e){const a=e===0?"Pick at least 3":e<3?`${3-e} more to continue`:e<8?`${e} selected · ${8-e} more unlocks more alerts`:`${e} selected · great coverage`,n=e>=3?"var(--onb2-accent)":"#EAB308";return`<span style="display:inline-flex;align-items:center;gap:9px">
    <span style="width:62px;height:5px;border-radius:999px;background:var(--onb2-g200);overflow:hidden;display:inline-block"><span style="display:block;width:${Math.min(100,e/8*100)}%;height:100%;background:${n};transition:width 300ms"></span></span>
    <span style="font-size:11.5px;color:${e>=3?"var(--onb2-g500)":"#CA8A04"};font-weight:500">${C(a)}</span>
  </span>`}function ss(){const e=y,t=!!e.cv;return`<div>
    ${ht("STEP 03 · EXPERIENCE","45 SEC",t?e.first?`${e.first}, check your history.`:"Check your work history.":"Add your work history.",t?"Straight from your CV. Confirm the last two roles — that's all companies really read.":"Your two most recent roles are enough to get started.")}
    ${ge({label:"Work history",req:!0,body:`<div style="display:flex;flex-direction:column;gap:12px">
      ${e.roles.map((a,n)=>ts(a,n)).join("")}
      <button type="button" class="onb2-addtile" data-onb-role-add>${N("plus",16)}Add another role</button>
    </div>`})}
    <div style="margin-top:26px">
      ${ge({label:"Education & certifications",hint:t?"Pulled from your CV. Add any course or certificate that isn't listed — a project management course, a Google or HubSpot cert, a bootcamp. They count.":"Degrees, courses, bootcamps and certificates — a project management course counts as much as a degree here.",body:`<div style="display:flex;flex-direction:column;gap:12px">
        ${e.education.map((a,n)=>as(a,n)).join("")}
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px" class="onb2-two">
          <button type="button" class="onb2-addtile" data-onb-edu-add="degree">${N("graduation-cap",16)}Add education</button>
          <button type="button" class="onb2-addtile" data-onb-edu-add="cert">${N("award",16)}Add certification</button>
        </div>
      </div>`})}
    </div>
    <div style="margin-top:26px">
      ${ge({label:"Your skills",req:!0,hint:t?"Add as many as you honestly have — every skill is another job alert we can send you. Tap to remove anything you'd rather not be matched on.":"Add as many as you honestly have. Each one is another job alert we can send you when something opens up.",aside:ns(e.skills.length),body:Nt("skills",[...new Set([...e.skills,...On])],e.skills,!0)})}
    </div>
  </div>`}function is(){const e=y,t=La(),a=Number(e.salaryMin)||0,n=a>=t[0]-400&&a<=t[1],s=`$${t[0].toLocaleString("en-US")}–$${t[1].toLocaleString("en-US")}/mo`,i=e.functions&&e.functions[0]||"These",l=n?`Similar ${C(i)} profiles are placed at <strong style="color:var(--onb2-black)">${s}</strong>. Your range is right in the market.`:`Heads up: most roles like yours pay <strong style="color:var(--onb2-black)">${s}</strong>. A range outside that will limit your matches.`;return ge({label:"Monthly salary expectation (USD)",req:!0,hint:"Give a range you'd genuinely accept. Companies filter on this, so a wider range means more matches.",body:`<div style="display:flex;flex-direction:column;gap:12px">
    <div style="display:grid;grid-template-columns:1fr auto 1fr;gap:12px;align-items:end">
      ${X({label:"Minimum",prefix:"$",value:e.salaryMin,placeholder:"1,500",data:'data-onb-field="salaryMin" inputmode="numeric"'})}
      <span style="padding-bottom:14px;color:var(--onb2-g400);font-size:14px">to</span>
      ${X({label:"Ideal",prefix:"$",value:e.salaryMax,placeholder:"2,200",data:'data-onb-field="salaryMax" inputmode="numeric"'})}
    </div>
    <div id="onb2SalaryCallout" style="display:flex;gap:11px;align-items:flex-start;padding:13px 15px;background:${n?"#F0FDF4":"#FEFCE8"};border:1px solid ${n?"#DCFCE7":"#FEF9C3"};border-radius:12px">
      ${N(n?"trending-up":"info",15,n?"#16A34A":"#CA8A04")}
      <p style="font-size:12.8px;line-height:1.5;color:var(--onb2-g700);margin:0">${l}</p>
    </div>
  </div>`})}function os(){const e=y;return`<div>
    ${ht("STEP 04 · WHAT YOU WANT","45 SEC",e.first?`Last part, ${e.first}.`:"Last part.","This decides which roles reach you — and it's the only thing we can't read off a CV.")}
    <div style="display:flex;flex-direction:column;gap:24px">
      ${ge({label:"Roles you’re open to",req:!0,hint:"Pick up to three. You can change this any time.",body:Nt("functions",Rn,e.functions,!1)})}
      ${ge({label:"Work type",req:!0,body:Tt("workType",[{v:"full",label:"Full-time"},{v:"part",label:"Part-time"},{v:"contract",label:"Contract"}],e.workType)})}
      ${ge({label:"When can you start?",body:Tt("availability",[{v:"now",label:"Right away"},{v:"2w",label:"In 2 weeks"},{v:"1m",label:"In a month"},{v:"look",label:"Just browsing"}],e.availability)})}
      ${is()}
      ${ge({label:"Anything else worth showing?",hint:"Portfolio, case study or personal site — optional, but it helps for design, marketing and data roles.",body:`<div style="display:flex;flex-direction:column;gap:10px">
        ${X({label:"Portfolio or website",prefix:"https://",value:e.portfolio,placeholder:"your-site.com",data:'data-onb-field="portfolio"'})}
      </div>`})}
      ${ge({label:"How did you hear about Nearwork?",hint:"Optional — it just helps us reach more people like you.",body:`<div style="display:flex;flex-direction:column;gap:10px">
        ${Nt("source",Fn,e.source?[e.source]:[],!1)}
        ${e.source==="Other"?X({label:"Where exactly?",value:e.sourceOther,placeholder:"A podcast, a university fair, a Slack group…",data:'data-onb-field="sourceOther"'}):""}
      </div>`})}
      <div>
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px">
          <span style="font-size:10.5px;letter-spacing:0.12em;color:var(--onb2-g500)">PERMISSIONS</span>
          <span style="flex:1;height:1px;background:var(--onb2-g100)"></span>
        </div>
        <div style="display:flex;flex-direction:column;gap:10px">
          ${kt("shareProfile","Show my profile to vetted Nearwork companies","Hiring teams see your experience, skills and salary range — never your phone, email or exact address until you accept an interview.",e.shareProfile)}
          ${kt("notifyMatches","Email me when a role matches","A short note when something fits — roughly once a week, never more than twice.",e.notifyMatches)}
          ${kt("notifyNews","Send me interview tips and salary reports","Our monthly guide to landing US roles from Latin America.",e.notifyNews)}
        </div>
        <p style="font-size:12.3px;line-height:1.55;color:var(--onb2-g500);margin:14px 0 0">By finishing you agree to the <a href="https://www.nearwork.co/terms" target="_blank" rel="noreferrer" style="color:var(--onb2-accent-ink);font-weight:600">Terms</a> and <a href="https://www.nearwork.co/privacy" target="_blank" rel="noreferrer" style="color:var(--onb2-accent-ink);font-weight:600">Privacy Policy</a>. You can export or delete everything from your settings at any time.</p>
      </div>
    </div>
  </div>`}function rs(){const e=y,t=e.functions.length?C(e.functions[0]):"New";let a=null;try{a=JSON.parse(sessionStorage.getItem("nw_apply_role")||"null")}catch{}const n=a&&a.title?`<div style="display:inline-flex;align-items:center;gap:8px;background:var(--onb2-accent-bg);border:1px solid var(--onb2-accent-border);color:#0E7060;border-radius:999px;padding:8px 15px;font-size:13.5px;font-weight:600;margin-top:16px">${N("check-circle",16,"#10A07C")} Application sent — ${C(a.title)}</div>`:"",s=[{icon:"clipboard-check",title:"Take your 12-minute assessment",desc:"One short skills + working-style check. Profiles with it get 3× more interviews.",cta:"Start now",act:"assessment"},{icon:"search",title:"See who’s hiring right now",desc:`${t} roles inside your salary range are live today.`,cta:"See roles",act:"jobs"}];return`<div style="max-width:560px">
    <canvas class="onb2-confetti" id="onb2Confetti"></canvas>
    <div class="onb2-done-badge">${N("check",28,"#fff")}</div>
    <h1 class="onb2-title" style="font-size:clamp(28px,3.2vw,36px)">You're in, ${e.first?C(e.first):"there"}.</h1>
    ${n}
    <p style="font-size:15.5px;line-height:1.55;color:var(--onb2-g600);margin:12px 0 0">Your profile is live with our matching team. Most candidates hear about their first role within 10 days.</p>
    <div style="display:flex;flex-direction:column;gap:10px;margin-top:30px">
      ${s.map(i=>`<div style="display:flex;gap:14px;align-items:center;background:#fff;border:1.5px solid var(--onb2-g200);border-radius:14px;padding:16px 17px">
        <div style="width:38px;height:38px;border-radius:11px;background:var(--onb2-accent-bg);border:1px solid var(--onb2-accent-border);display:inline-flex;align-items:center;justify-content:center;flex-shrink:0">${N(i.icon,17,"#10A07C")}</div>
        <div style="flex:1"><div style="font-size:14.5px;font-weight:600;color:var(--onb2-black);letter-spacing:-0.01em">${C(i.title)}</div><div style="font-size:12.8px;color:var(--onb2-g600);margin-top:3px;line-height:1.45">${C(i.desc)}</div></div>
        <button type="button" class="onb2-btn onb2-btn-soft is-sm" data-onb-done-act="${i.act}">${C(i.cta)}${N("arrow-right",17,"#10A07C")}</button>
      </div>`).join("")}
    </div>
    <div style="display:flex;gap:12px;align-items:center;margin-top:28px;padding-top:22px;border-top:1px solid var(--onb2-g100);flex-wrap:wrap">
      <button type="button" class="onb2-btn onb2-btn-primary" data-onb-done-act="dashboard">Go to my dashboard${N("arrow-right",17,"#fff")}</button>
      <button type="button" class="onb2-btn onb2-btn-ghost" data-onb-done-act="jobs">${N("search",17,"#555555")}Browse jobs</button>
    </div>
  </div>`}function Mt(){rt&&(clearInterval(rt),rt=null)}function na(e){var n;if(!(/\.(pdf|docx?)$/i.test(e.name)||["application/pdf","application/msword","application/vnd.openxmlformats-officedocument.wordprocessingml.document"].includes(e.type))){alert("Please upload a PDF, DOC or DOCX file.");return}if(e.size>10*1024*1024){alert("That file is larger than 10 MB. Please upload a smaller CV.");return}Je=e,y.cv=e.name,mt=null;const a=(n=r.user)==null?void 0:n.uid;a&&le&&ut(a,e,"").then(s=>{mt=s}).catch(()=>{}),Se="parsing",ye=0,Mt(),rt=setInterval(()=>{ye<3&&(ye++,cs())},800),B(0),_t(e).then(s=>{ls(s)}).catch(()=>{}).finally(()=>{Mt(),ye=4,Se="done",ds()}),W()}function ls(e){if(!e)return;const t=y,a=t._cvFlags||(t._cvFlags={});if(e.name&&!t.first&&!t.last){const n=String(e.name).trim().split(/\s+/).filter(Boolean);t.first=Ue(n[0]||""),t.last=Ue(n.slice(1).join(" ")),a.first=!!t.first,a.last=!!t.last}if(e.phone&&!t.phone&&(t.phone=String(e.phone).replace(/^\+?57\s?/,"")),e.city&&!t.city&&(t.city=e.city,a.city=!0),Array.isArray(e.workHistory)&&e.workHistory.length&&!t.roles.length&&(t.roles=e.workHistory.slice(0,6).map(n=>({title:n.title||"",company:n.company||"",from:n.from||"",to:(n.to==="present"?"":n.to)||"",current:n.to==="present"||!!n.current,open:!1}))),Array.isArray(e.skills)&&e.skills.length&&(t.skills=[...new Set([...t.skills,...e.skills.map(Ce).filter(Boolean)])]),!t.education.length){const n=[];Array.isArray(e.education)&&e.education.forEach(s=>n.push({kind:"degree",title:s.degree||s.title||s.name||"",school:s.institution||s.school||"",year:s.year||s.date||"",open:!1})),Array.isArray(e.certifications)&&e.certifications.forEach(s=>n.push({kind:"cert",title:s.name||s.title||"",school:s.issuer||s.school||"",year:s.date||s.year||"",open:!1})),n.length&&(t.education=n.filter(s=>s.title||s.school))}e.summary&&!t.summary&&(t.summary=e.summary)}function cs(){const e=document.querySelector("#onb2Rail");e&&(e.innerHTML=Ea(),de(),e.querySelectorAll("[data-onb-nav]").forEach(n=>n.addEventListener("click",()=>B(Number(n.dataset.onbNav)))));const t=document.querySelector("#onb2CvBar");t&&(t.style.width=Math.max(8,Math.round(ye/4*100))+"%");const a=document.querySelector("#onb2CvStatus");a&&(a.textContent=Se==="done"?"Imported":`Reading (${Math.round(ye/4*100)}%)`)}function ds(){document.querySelector("#onb2Card")&&B(pe)}function lt(){const e=Bt(),t=document.querySelector("#onb2StrengthPct");t&&(t.textContent=e+"%");const a=document.querySelector("#onb2StrengthBar");a&&(a.style.width=e+"%");const n=Ut(pe),s=document.querySelector("#onb2Blocker");s&&(s.innerHTML=n?`<div class="onb2-blocker">${N("info",14,"#E74C7C")}${C(n)}</div>`:"",de());const i=document.querySelector("#onb2Next");i&&(i.disabled=!!n)}function us(){const e=document.querySelector("#onb2SalaryCallout");if(!e)return;const t=La(),a=Number(y.salaryMin)||0,n=a>=t[0]-400&&a<=t[1],s=`$${t[0].toLocaleString("en-US")}–$${t[1].toLocaleString("en-US")}/mo`,i=y.functions&&y.functions[0]||"These";e.style.background=n?"#F0FDF4":"#FEFCE8",e.style.border=`1px solid ${n?"#DCFCE7":"#FEF9C3"}`,e.innerHTML=`${N(n?"trending-up":"info",15,n?"#16A34A":"#CA8A04")}<p style="font-size:12.8px;line-height:1.5;color:var(--onb2-g700);margin:0">${n?`Similar ${C(i)} profiles are placed at <strong style="color:var(--onb2-black)">${s}</strong>. Your range is right in the market.`:`Heads up: most roles like yours pay <strong style="color:var(--onb2-black)">${s}</strong>. A range outside that will limit your matches.`}`,de()}let it=null;function ps(){return it||(it=Promise.resolve(null),it)}async function ms(e,t){}function gs(){const e=document.querySelector("#onb2TzHint");e&&(y.timezone?(e.textContent=`Time zone: ${y.timezone} · auto-detected`,e.style.display=""):e.style.display="none")}async function vs(){const e=document.querySelector('input[data-onb-field="city"]');if(!e)return;const t=e.closest(".onb2-fieldwrap");if(!t||t.dataset.onbCityEnhanced)return;t.dataset.onbCityEnhanced="pending";const a=await ps();if(!a||!document.body.contains(e)){delete t.dataset.onbCityEnhanced;return}let n;try{({PlaceAutocompleteElement:n}=await a.importLibrary("places"))}catch{delete t.dataset.onbCityEnhanced;return}if(!n||!document.body.contains(e)){delete t.dataset.onbCityEnhanced;return}let s;try{s=new n({types:["(cities)"]})}catch{delete t.dataset.onbCityEnhanced;return}t.dataset.onbCityEnhanced="1",s.className="onb2-gmaps-ac";const i=t.querySelector(".onb2-fieldbox");i&&(i.style.display="none");const l=t.querySelector(".onb2-fieldhint");l?l.insertAdjacentElement("beforebegin",s):t.appendChild(s);const o=document.createElement("div");o.id="onb2TzHint",o.className="onb2-fieldhint onb2-tzhint",o.style.display="none",(l||s).insertAdjacentElement("afterend",o),gs();const d=y.city?y.country&&!String(y.city).includes(",")?`${y.city}, ${y.country}`:y.city:"";if(d){try{s.value=d}catch{}requestAnimationFrame(()=>{const u=s.querySelector("input");u&&!u.value&&(u.value=d)})}s.addEventListener("gmp-select",async({placePrediction:u})=>{try{const p=u.toPlace();await p.fetchFields({fields:["displayName","formattedAddress","location","addressComponents"]});const c=p.addressComponents||[],m=I=>c.find(F=>(F.types||[]).includes(I)),f=I=>I&&(I.longText||I.long_name)||"",E=m("locality")||m("postal_town")||m("administrative_area_level_2")||m("administrative_area_level_1"),P=m("country"),T=f(E),L=f(P);T&&(y.city=T),L&&(y.country=L),lt();const x=p.location;if(x){const I=typeof x.lat=="function"?x.lat():x.lat,F=typeof x.lng=="function"?x.lng():x.lng;await ms(I,F)}W()}catch{}})}function fs(e){var n,s,i,l,o,d,u,p;document.querySelectorAll("[data-onb-nav]").forEach(c=>c.addEventListener("click",()=>B(Number(c.dataset.onbNav)))),(n=document.querySelector("[data-onb-save-exit]"))==null||n.addEventListener("click",bs),(s=document.querySelector("[data-onb-back]"))==null||s.addEventListener("click",()=>B(Math.max(0,e-1))),(i=document.querySelector("[data-onb-next]"))==null||i.addEventListener("click",()=>hs(e)),(l=document.querySelector("[data-onb-skip]"))==null||l.addEventListener("click",()=>B(1)),document.querySelectorAll("[data-onb-field]").forEach(c=>c.addEventListener("input",()=>{const m=c.dataset.onbField;let f=c.value;(m==="salaryMin"||m==="salaryMax")&&(f=f.replace(/\D/g,""),c.value=f),y[m]=f,(m==="salaryMin"||m==="salaryMax")&&us(),lt(),W()})),document.querySelectorAll("[data-onb-seg]").forEach(c=>c.addEventListener("click",()=>{y[c.dataset.onbSeg]=c.dataset.onbVal,B(e),W()}));const t=(c,m)=>{if(m)if(c==="skills"){const f=Ce(m)||m;y.skills.includes(f)||y.skills.push(f)}else y[c].includes(m)||y[c].push(m)};document.querySelectorAll("[data-onb-chip]").forEach(c=>c.addEventListener("click",()=>{const m=c.dataset.onbChip,f=c.dataset.onbVal;if(m==="source")y.source=y.source===f?"":f,f!=="Other"&&(y.sourceOther="");else if(m==="functions"){const E=y.functions;y.functions=E.includes(f)?E.filter(P=>P!==f):E.length>=3?E:[...E,f]}else{const E=y[m];y[m]=E.includes(f)?E.filter(P=>P!==f):[...E,f]}B(e),W()})),document.querySelectorAll("[data-onb-chip-add]").forEach(c=>c.addEventListener("click",()=>{const m=c.dataset.onbChipAdd,f=document.querySelector(`[data-onb-chip-input="${m}"]`);t(m,((f==null?void 0:f.value)||"").trim()),B(e),W()})),document.querySelectorAll("[data-onb-chip-input]").forEach(c=>c.addEventListener("keydown",m=>{m.key==="Enter"&&(m.preventDefault(),t(c.dataset.onbChipInput,c.value.trim()),B(e),W())})),document.querySelectorAll("[data-onb-toggle]").forEach(c=>c.addEventListener("click",()=>{if(c.dataset.onbRequired)return;const m=c.dataset.onbToggle;y[m]=!y[m],B(e),W()})),document.querySelectorAll("[data-onb-rolefield]").forEach(c=>c.addEventListener("input",()=>{y.roles[Number(c.dataset.onbIdx)][c.dataset.onbRolefield]=c.value,lt(),W()})),(o=document.querySelector("[data-onb-role-add]"))==null||o.addEventListener("click",()=>{y.roles.push({title:"",company:"",from:"",to:"",current:!1,open:!0}),B(e),W()}),document.querySelectorAll("[data-onb-role-edit]").forEach(c=>c.addEventListener("click",()=>{const m=Number(c.dataset.onbRoleEdit);y.roles[m].open=!y.roles[m].open,B(e)})),document.querySelectorAll("[data-onb-role-remove]").forEach(c=>c.addEventListener("click",()=>{y.roles.splice(Number(c.dataset.onbRoleRemove),1),B(e),W()})),document.querySelectorAll("[data-onb-role-current]").forEach(c=>c.addEventListener("click",()=>{const m=Number(c.dataset.onbRoleCurrent);y.roles[m].current=!y.roles[m].current,y.roles[m].current&&(y.roles[m].to=""),B(e),W()})),e===2&&es(),document.querySelectorAll("[data-onb-edufield]").forEach(c=>c.addEventListener("input",()=>{y.education[Number(c.dataset.onbIdx)][c.dataset.onbEdufield]=c.value,lt(),W()})),document.querySelectorAll("[data-onb-edu-add]").forEach(c=>c.addEventListener("click",()=>{y.education.push({kind:c.dataset.onbEduAdd,title:"",school:"",year:"",open:!0}),B(e),W()})),document.querySelectorAll("[data-onb-edu-edit]").forEach(c=>c.addEventListener("click",()=>{const m=Number(c.dataset.onbEduEdit);y.education[m].open=!y.education[m].open,B(e)})),document.querySelectorAll("[data-onb-edu-remove]").forEach(c=>c.addEventListener("click",()=>{y.education.splice(Number(c.dataset.onbEduRemove),1),B(e),W()}));const a=document.querySelector("#onb2FileInput");if((d=document.querySelector("[data-onb-file-add]"))==null||d.addEventListener("click",()=>a==null?void 0:a.click()),a==null||a.addEventListener("change",()=>{[...a.files||[]].forEach(c=>{y.files.includes(c.name)||y.files.push(c.name)}),B(e),W()}),document.querySelectorAll("[data-onb-file-remove]").forEach(c=>c.addEventListener("click",()=>{y.files=y.files.filter(m=>m!==c.dataset.onbFileRemove),B(e),W()})),e===0){const c=document.querySelector("#onb2Dropzone"),m=document.querySelector("#onb2CvInput");c==null||c.addEventListener("click",()=>m==null?void 0:m.click()),c==null||c.addEventListener("dragover",f=>{f.preventDefault(),c.classList.add("is-drag")}),c==null||c.addEventListener("dragleave",()=>c.classList.remove("is-drag")),c==null||c.addEventListener("drop",f=>{var P,T;f.preventDefault(),c.classList.remove("is-drag");const E=(T=(P=f.dataTransfer)==null?void 0:P.files)==null?void 0:T[0];E&&na(E)}),m==null||m.addEventListener("change",()=>{var E;const f=(E=m.files)==null?void 0:E[0];f&&na(f)}),(u=document.querySelector("[data-onb-cv-remove]"))==null||u.addEventListener("click",()=>{Mt(),Je=null,mt=null,y.cv=null,Se="idle",ye=0,B(0),W()}),(p=document.querySelector("[data-onb-manual]"))==null||p.addEventListener("click",()=>B(1))}e===1&&vs(),e===4&&document.querySelectorAll("[data-onb-done-act]").forEach(c=>c.addEventListener("click",()=>{const m=c.dataset.onbDoneAct;m==="dashboard"?(window.history.pushState({page:"overview"},"","/"),$({activePage:"overview",message:""})):m==="assessment"?(window.history.pushState({page:"assessment"},"","/assessment"),$({activePage:"assessment",message:""})):m==="jobs"&&window.open("https://www.nearwork.co/jobs","_blank","noreferrer")}))}function hs(e){if(!Ut(e)){if(e<3){B(e+1);return}e===3&&ws()}}function Rt(e){var Y,G,ne,h,v,b,S,w,M,ee,H,D;const t=y,a=Ue(t.first||""),n=Ue(t.last||""),s=[a,n].filter(Boolean).join(" ")||((Y=r.candidate)==null?void 0:Y.name)||((G=r.user)==null?void 0:G.displayName)||"",i=String(t.city||"").split(",").map(A=>A.trim()).filter(Boolean),l=i[0]||"",o=i.length>1?i[i.length-1]:"",d=t.country||o||((ne=r.candidate)==null?void 0:ne.locationCountry)||"Colombia",u=[l,d].filter(Boolean).join(", ")||String(t.city||""),p=Number(t.salaryMin)||null,c=Number(t.salaryMax)||null,m=p&&c?`$${p.toLocaleString("en-US")}–$${c.toLocaleString("en-US")} USD/mo`:p?`$${p.toLocaleString("en-US")} USD/mo`:"",f=t.phone?String(t.phone).trim().startsWith("+")?String(t.phone).trim():`+57 ${String(t.phone).trim()}`:"",E=t.linkedin?/^https?:\/\//i.test(t.linkedin)?t.linkedin:`https://linkedin.com/in/${String(t.linkedin).replace(/^\/+/,"")}`:"",P=t.portfolio?/^https?:\/\//i.test(t.portfolio)?t.portfolio:`https://${t.portfolio}`:"",T=(t.roles||[]).filter(A=>A.title||A.company).map(A=>({title:A.title||"",company:A.company||"",from:A.from||"",to:A.current?"present":A.to||"",current:!!A.current})),L=(t.education||[]).filter(A=>A.kind==="cert"&&(A.title||A.school)).map(A=>({name:A.title||"",issuer:A.school||"",date:A.year||""})),x=(t.education||[]).filter(A=>A.kind==="degree"&&(A.title||A.school)).map(A=>({degree:A.title||"",institution:A.school||"",year:A.year||""})),I=[...new Set((t.skills||[]).map(Ce).filter(Boolean))],F=t.functions[0]||((h=r.candidate)==null?void 0:h.targetRole)||"",V=((v=T.find(A=>A.current)||T[0])==null?void 0:v.title)||"",ae={name:s,firstName:a,lastName:n,targetRole:F,headline:F||((b=r.candidate)==null?void 0:b.headline)||"Nearwork candidate",currentRole:V,location:u,locationCity:l,city:l,locationCountry:d,timezone:t.timezone||"",timeZone:t.timezone||"",timezoneName:t.timezoneName||"",english:jn[t.english]||t.english||"",englishLevel:t.english||"",salary:m,salaryUSD:p,salaryAmount:p,salaryCurrency:"USD",expectedSalaryUSD:p,expectedSalaryAmount:p,expectedSalaryCurrency:"USD",expectedSalaryMinUSD:p,expectedSalaryMaxUSD:c,expectedSalary:m,whatsapp:f,phone:f,linkedin:E,skills:I,workHistory:T,certifications:L,education:x,functions:[...t.functions],workType:t.workType||"",startAvailability:t.availability||"",availability:((S=r.candidate)==null?void 0:S.availability)||"open",portfolio:P,attachments:[...t.files],source:t.source||"",sourceOther:t.sourceOther||"",shareProfile:!!t.shareProfile,notifyMatches:!!t.notifyMatches,notifyNews:!!t.notifyNews,marketingConsent:t.notifyNews===!0||((w=r.candidate)==null?void 0:w.marketingConsent)===!0,summary:t.summary||((M=r.candidate)==null?void 0:M.summary)||"",profile_strength:Bt(e),email:((ee=r.candidate)==null?void 0:ee.email)||((H=r.user)==null?void 0:H.email)||"",candidateCode:(D=r.candidate)==null?void 0:D.candidateCode};return e&&(ae.onboarded=!0),ae}function W(){be&&clearTimeout(be),be=setTimeout(()=>{be=null,ys()},600)}async function ys(){var t;const e=(t=r.user)==null?void 0:t.uid;if(!(!e||!le))try{await Xe(e,Rt(!1))}catch{}}async function bs(){var t;const e=(t=r.user)==null?void 0:t.uid;if(be&&(clearTimeout(be),be=null),e&&le)try{await Xe(e,Rt(!1))}catch{}window.history.pushState({page:"overview"},"","/"),$({activePage:"overview",message:"Saved. You can finish your profile any time."})}async function ws(){var t;const e=document.querySelector("#onb2Next");e&&(e.disabled=!0,e.textContent="Saving…");try{const a=(t=r.user)==null?void 0:t.uid;if(!a)throw new Error("Not signed in");be&&(clearTimeout(be),be=null);let n={};if(Je)try{const i=mt||await ut(a,Je,"");n={activeCvId:i.id,activeCvName:i.name||i.fileName,cvUrl:i.url,cvLibrary:[i]}}catch{}const s={...Rt(!0),...n};await Xe(a,s),r={...r,candidate:{...r.candidate,...s}},B(4)}catch{e&&(e.disabled=!1,e.innerHTML=`Finish and go live${N("arrow-right",17,"#fff")}`,de());const n=document.querySelector("#onb2Blocker");n&&(n.innerHTML=`<div class="onb2-blocker">${N("info",14,"#E74C7C")}Something went wrong saving your profile. Please try again.</div>`,de())}}function Ss(){if(Et)return;const e=document.querySelector("#onb2Confetti");if(!e)return;Et=!0;const t=e.getContext("2d"),a=window.devicePixelRatio||1;(()=>{e.width=e.clientWidth*a,e.height=e.clientHeight*a,t.setTransform(a,0,0,a,0,0)})();const s=()=>e.clientWidth,i=()=>e.clientHeight,l=["#10A07C","#AF7AC5","#E74C7C","#1ABC9C","#EAB308"],o=Array.from({length:130},()=>({x:s()*(.15+Math.random()*.7),y:-20-Math.random()*i()*.5,vx:(Math.random()-.5)*2.4,vy:2+Math.random()*3.4,w:5+Math.random()*6,h:8+Math.random()*8,rot:Math.random()*Math.PI,vr:(Math.random()-.5)*.22,c:l[Math.floor(Math.random()*l.length)]}));let d=0;const u=()=>{d+=1,t.clearRect(0,0,s(),i()),o.forEach(p=>{p.x+=p.vx,p.y+=p.vy,p.vy+=.035,p.rot+=p.vr,t.save(),t.translate(p.x,p.y),t.rotate(p.rot),t.globalAlpha=Math.max(0,1-d/300),t.fillStyle=p.c,t.fillRect(-p.w/2,-p.h/2,p.w,p.h),t.restore()}),d<300?requestAnimationFrame(u):t.clearRect(0,0,s(),i())};u()}function Cs(){const e=tt(),t=r.jobs.map(Le).filter(i=>qt(i,e).length>=3),a=e.length>=5,n=r.matchesFiltered&&a?t:r.jobs.map(Le),s=r.matchesFiltered&&!t.length;return`
    <div class="nw-page-head">
      <div class="nw-page-overline">My search</div>
      <h1 class="nw-page-title">Matches</h1>
      <p class="nw-page-lede">Roles picked for you from your skills, target role, and salary.</p>
    </div>
    <div class="nw-filterbar">
      <button id="filterMatches" class="nw-chip${r.matchesFiltered?" active":""}" type="button">${g(r.matchesFiltered?"list":"filter")} ${r.matchesFiltered?"Show all openings":"Filter by my role & skills"}</button>
      <div class="nw-filter-count">${n.length} of ${r.jobs.length} open roles</div>
    </div>
    <div class="nw-match-grid nw-match-grid--wide">${s?Ma("No filtered matches yet","Add a target role and skills in Profile to improve matching."):n.map(i=>Gs(i)).join("")}</div>
  `}function $s(){const e=r.applications||[];return`
    <div class="nw-page-head">
      <div class="nw-page-overline">My journey</div>
      <h1 class="nw-page-title">Applications</h1>
      <p class="nw-page-lede">Every role you've applied to, and exactly where it stands.</p>
    </div>
    ${kn()?`
      <section class="nw-panel nw-pipeline-panel">
        <div class="nw-panel-head"><div><div class="nw-panel-overline">Status</div><div class="nw-panel-title">Where you are in the process</div></div></div>
        ${Hs(zs())}
      </section>`:""}
    <section class="nw-panel nw-applist">
      ${e.length?e.map((a,n)=>Ws(a,n===e.length-1)).join(""):Vs()}
    </section>
  `}function ks(){const e=Ae(),t=r.assessments||[],a=t.filter(T=>["sent","started"].includes(String(T.status||"").toLowerCase())),n=t.filter(T=>String(T.status||"").toLowerCase()==="completed"),s=e?t.find(T=>T.id===e):a[0]||n[0]||null;if(r.assessmentUiStep==="techIntro"&&s)return Ts(s);if(r.assessmentUiStep==="discIntro"&&s)return Ns(s);if(e&&!s)return`
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
    `;const i=Array.isArray(s.questions)?s.questions:[],l=String(s.status||"").toLowerCase()==="started",o=String(s.status||"").toLowerCase()==="completed",d=String(s.status||"").toLowerCase()==="cancelled",u=Ls(s),p=fa(),c=Number(s.currentQuestionIndex||0),m=Math.min(p??c,Math.max(i.length-1,0)),f=i[m],E=(f==null?void 0:f.stage)||s.currentStage||1,P=l&&!o&&!d&&!u;return`
    <div class="nw-assess-wrap">
      ${P?xs(s,E,m,i):Ft(s)}
      ${P?As(s,m):""}
      <div class="nw-assess-body" id="assessmentWorkspace">
        ${o?Ms(s):d?`<div class="nw-assess-state-card nw-assess-state-card--inline"><div class="nw-assess-state-icon" style="background:#F5F4F0;color:#555">${g("ban")}</div><strong>Assessment cancelled</strong><p>This assessment is no longer available. A new assigned assessment will appear here when your recruiter sends one.</p></div>`:u?`<div class="nw-assess-state-card nw-assess-state-card--inline"><div class="nw-assess-state-icon" style="background:#FEF0F5;color:#CC3666">${g("clock-x")}</div><strong>Assessment link expired</strong><p>This unique assessment link is no longer valid. Contact your Nearwork recruiter if you need a new one.</p><button class="ghost-action" data-page="recruiter" type="button">${g("message-circle")} Contact recruiter</button></div>`:Es(s,l,m)}
      </div>
      ${_s(t,s.id)}
    </div>
  `}function Ft(e){const t=String(e.status||"").toLowerCase();return`
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
  `}function As(e,t){const a=(e.questions||[]).slice(0,70),n=ce(e,1).filter(o=>Be($t(e,o))).length,s=ce(e,2).filter(o=>Be($t(e,o))).length,i=ce(e,1).length||50,l=ce(e,2).length||20;return`
    <section class="assessment-progress-panel">
      <div><strong>Technical</strong><span>${n}/${i} answered</span></div>
      <div><strong>DISC</strong><span>${s}/${l} answered</span></div>
      <div class="assessment-progress-strip">
        ${a.map((o,d)=>{const u=Be($t(e,o));return`<button type="button" class="${d===t?"active":""} ${u?"answered":""}" data-assessment-jump="${d}" title="${It(o.stage)} · Q${d+1}">${d+1}</button>`}).join("")}
      </div>
    </section>
  `}function xs(e,t,a,n){const s=Number(t),i=Kt(e.technicalStartedAt||e.startedAt)||new Date,l=Kt(e.discStartedAt)||new Date,o=s===1?i:l,d=Number(s===1?e.technicalMinutes||60:e.discMinutes||30),u=new Date(o.getTime()+d*60*1e3),p=s===1?"Technical":"DISC profile",c=(n||[]).filter(P=>Number(P.stage||1)===s),m=(n||[]).findIndex(P=>Number(P.stage||1)===s),f=Math.max(0,a-m),E=c.length?Math.round((f+1)/c.length*100):2;return`
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
          <span>${p} &middot; Question ${f+1} of ${c.length||(s===1?50:20)}</span>
        </div>
        <div class="nw-assess-chrome__progresstrack">
          <div class="nw-assess-chrome__progressfill" style="width:${Math.max(2,E)}%"></div>
        </div>
      </div>
      <div class="nw-timer-pill">
        ${g("timer")}
        <span id="assessmentTimer" data-end="${u.toISOString()}">${d}:00</span>
      </div>
      <button class="nw-assess-chrome__exit" type="button">${g("x")} Save &amp; exit</button>
    </div>
  `}function Es(e,t,a=null){var F,V,ae;if(!t){const Y=k(e.role||"Role assessment"),G=k(e.recruiterName||e.recruiter||"Nearwork"),ne=ft(e.expiresAt||e.deadline),h=ce(e,1).length||50,v=ce(e,2).length||20,b=Number(e.technicalMinutes||60),S=Number(e.discMinutes||30);return`
      <div class="nw-assess-welcome">
        <div class="nw-assess-welcome__header">
          <span class="nw-assess-role-chip">${g("sparkles")} ${Y}</span>
          <span>Sent by ${G}${ne?" &middot; expires "+ne:""}</span>
        </div>
        <h2 class="nw-assess-welcome__title">Let's see how you think — and how you work.</h2>
        <p class="nw-assess-welcome__desc">This assessment has two parts: a role-knowledge check and a behavioral profile.</p>
        <div class="nw-assess-parts">
          <div class="nw-assess-part">
            <div class="nw-assess-part__blob" style="background:#E4F6EF"></div>
            <div class="nw-assess-part__icon" style="background:#E4F6EF;color:#10A07C">${g("code-2")}</div>
            <span class="nw-assess-part__tag" style="color:#10A07C">Part 1</span>
            <strong class="nw-assess-part__title">Technical Assessment</strong>
            <span class="nw-assess-part__sub">${h} questions &middot; ~${b} min</span>
            <p class="nw-assess-part__desc">Single-choice role scenarios. We're looking at how you think, not whether you remember definitions.</p>
          </div>
          <div class="nw-assess-part">
            <div class="nw-assess-part__blob" style="background:#F7F2FC"></div>
            <div class="nw-assess-part__icon" style="background:#F7F2FC;color:#AF7AC5">${g("compass")}</div>
            <span class="nw-assess-part__tag" style="color:#AF7AC5">Part 2</span>
            <strong class="nw-assess-part__title">DISC Profile</strong>
            <span class="nw-assess-part__sub">${v} statements &middot; ~${S} min</span>
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
    `}const n=(e.questions||[]).slice(0,70),s=Math.min(a??Number(e.currentQuestionIndex||0),Math.max(n.length-1,0)),i=n[s],l=((V=(F=e.answers)==null?void 0:F[i.id])==null?void 0:V.value)??((ae=e.answers)==null?void 0:ae[i.id])??"",o=Array.isArray(i.options)&&i.options.length?i.options:["Strongly agree","Agree","Neutral","Disagree"],d=n[s+1],u=d==null?void 0:d.stage,p=u&&u!==i.stage,c=Pt(e,i.stage),m=p&&c.length,f=s+1>=n.length,E=f?Pt(e,i.stage):[],P=!!i.multiple,T=Number(i.stage||1)===2?"nw-assess-chip--violet":"nw-assess-chip--teal",L=P?"Multi-select":"Single choice",x=k(i.part||i.type||(Number(i.stage||1)===2?"DISC":"Scenario")),I=k(i.bank||"");return`
    <form id="assessmentQuestionForm" class="nw-assess-qcard" data-current-index="${s}">
      <div class="nw-assess-qmeta">
        <span class="nw-assess-chip ${T}">${x}</span>
        ${I?`<span class="nw-assess-chip nw-assess-chip--gray">${I}</span>`:""}
        <span class="nw-assess-qtype">&middot; ${L}</span>
      </div>
      ${i.context?`<div class="nw-assess-context"><strong>Context: </strong>${k(i.context)}</div>`:""}
      <p class="nw-assess-qprompt">${k(i.q||"")}</p>
      <fieldset class="nw-assess-options${P?" nw-assess-options--multi":""}">
        <legend>${L}</legend>
        ${o.map((Y,G)=>`
          <label class="nw-assess-option${P?" nw-assess-option--multi":""}">
            <input type="radio" name="answer" value="${G}" ${String(l)===String(G)?"checked":""} />
            <span class="nw-assess-option__key">${String.fromCharCode(65+G)}</span>
            <span class="nw-assess-option__text">${k(Y)}</span>
            ${P?"":`<span class="nw-assess-option__check">${g("check-circle-2")}</span>`}
          </label>
        `).join("")}
      </fieldset>
      ${m||E.length?Ps(e,m?c:E,i.stage):""}
      <div class="nw-assess-qfooter">
        <button class="ghost-action" id="prevAssessmentQuestion" type="button" ${s===0?"disabled":""}>${g("arrow-left")} Back</button>
        <span class="nw-assess-autosave">${g("check")} Auto-saved</span>
        <div style="flex:1"></div>
        <button class="primary-action fit" type="submit">${f?g("send")+" Submit assessment":"Next "+g("arrow-right")}</button>
      </div>
    </form>
  `}function Ps(e,t,a){if(!t.length)return"";const n=(e.questions||[]).slice(0,70);return`
    <div class="nw-assess-missed">
      <strong>${g("alert-triangle")} Unanswered questions in ${It(a)}</strong>
      <p>You skipped ${t.map(s=>`Question ${n.findIndex(i=>i.id===s.id)+1}`).join(", ")}. You can go back now or continue if you meant to leave them blank.</p>
      <div class="nw-assess-missed__links">${t.map(s=>{const i=n.findIndex(l=>l.id===s.id);return`<button class="ghost-action" type="button" data-assessment-jump="${i}">${g("arrow-left")} Go to ${i+1}</button>`}).join("")}</div>
    </div>
  `}function Ls(e){return!(e!=null&&e.expiresAt)||String(e.status||"").toLowerCase()==="completed"?!1:Date.now()>new Date(e.expiresAt).getTime()}function Ts(e){const t=k(e.role||"Role assessment"),a=ce(e,1).length||50,n=Number(e.technicalMinutes||60);return`
    <div class="nw-assess-wrap">
      ${Ft(e)}
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
            <button class="primary-action" id="startAssessment" type="button">${g("play")} Start Part 1</button>
            <button class="ghost-action" id="backToWelcome" type="button">${g("arrow-left")} Back</button>
          </div>
        </div>
      </div>
    </div>
  `}function Ns(e){const t=ce(e,1).length||50,a=ce(e,2).length||20,n=Number(e.discMinutes||30),s=k(e.recruiterName||e.recruiter||"your recruiter"),i=(e.questions||[]).findIndex(l=>Number(l.stage||1)===2);return`
    <div class="nw-assess-wrap">
      ${Ft(e)}
      <div class="nw-assess-body">
        <div style="background:#E4F6EF;border-bottom:1px solid rgba(16,160,124,0.15);padding:13px 20px;display:flex;align-items:center;gap:12px;margin-bottom:24px;border-radius:10px">
          <div style="width:26px;height:26px;border-radius:50%;background:#10A07C;color:#fff;display:flex;align-items:center;justify-content:center;flex-shrink:0">${g("check")}</div>
          <div style="flex:1">
            <div style="font-size:13px;font-weight:600;color:#0A7C5E">Part 1 complete — nice work.</div>
            <div style="font-size:12px;color:#0A7C5E;margin-top:1px">${t}/${t} answered &middot; submitted to ${s} for review</div>
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
  `}function Ms(e){var l,o;const a=(((l=r.candidate)==null?void 0:l.name)||((o=r.user)==null?void 0:o.displayName)||"").split(" ")[0]||"You",n=k(e.recruiterName||e.recruiter||"your recruiter"),s=ce(e,1).length||50,i=ce(e,2).length||20;return`
    <div class="nw-assess-complete">
      <div class="nw-assess-complete__hero">
        <div class="nw-assess-complete__icon">
          ${g("check")}
          <div class="nw-assess-complete__ring1"></div>
          <div class="nw-assess-complete__ring2"></div>
        </div>
        <h2 class="nw-assess-complete__title">You're done, ${k(a)}.</h2>
        <p class="nw-assess-complete__desc">Your results have been sent to ${n}. They'll reach out personally — usually within a business day.</p>
      </div>
      <div class="nw-assess-complete__chips">
        <span class="nw-assess-complete__chip nw-assess-complete__chip--teal">${g("clipboard-check")} Part 1 &middot; ${s}/${s} answered</span>
        <span class="nw-assess-complete__chip nw-assess-complete__chip--violet">${g("compass")} Part 2 &middot; ${i}/${i} answered</span>
        <span class="nw-assess-complete__chip nw-assess-complete__chip--gray">${g("check-circle-2")} Assessment complete</span>
      </div>
      <div class="nw-assess-next">
        <div class="nw-assess-next__label">What happens next</div>
        ${[{icon:"inbox",title:"Your recruiter reviews your results",desc:`${n} will read your scenarios and DISC profile, usually within one business day.`,when:"Within 24h"},{icon:"message-square",title:`A personal note from ${n}`,desc:"Not an automated email. They'll share what stood out and what comes next.",when:"Tomorrow"},{icon:"calendar-check",title:"Interview with the hiring team",desc:"If there's a match, you'll get a calendar link to book a slot that works for you.",when:"This week"}].map(({icon:d,title:u,desc:p,when:c},m)=>`
          <div class="nw-assess-next__item">
            <div class="nw-assess-next__icon-wrap">
              <div class="nw-assess-next__iconbox">${g(d)}</div>
              <div class="nw-assess-next__num">${m+1}</div>
            </div>
            <div class="nw-assess-next__body">
              <div class="nw-assess-next__title">${u}</div>
              <div class="nw-assess-next__desc">${p}</div>
            </div>
            <div class="nw-assess-next__when">${c}</div>
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
  `}function _s(e,t){return e.length?`
    <section class="nw-panel" style="margin-top:18px;padding-bottom:18px;">
      <div class="nw-panel-head"><div><div class="nw-panel-overline">Assessment center</div><div class="nw-panel-title">Your assessment history</div></div></div>
      <div class="assessment-history-list">
        ${e.map(a=>`
          <article class="assessment-history-row ${a.id===t?"active":""}">
            <div><strong>${k(a.role||"Nearwork assessment")}</strong><span>${k(a.id||"")}</span></div>
            <div>${k(String(a.status||"assigned"))}</div>
            <a href="/assessment/${encodeURIComponent(a.id)}/start">${a.status==="completed"?"View":"Continue"}</a>
          </article>
        `).join("")}
      </div>
    </section>
  `:""}function qs(e,t){const a=e.questions||[],n=a.filter(o=>o.stage===1),s=a.filter(o=>o.stage===2),i=n.filter(o=>{var d;return typeof o.correctIndex=="number"&&Number((d=t[o.id])==null?void 0:d.value)===o.correctIndex}).length,l=s.filter(o=>{var d;return Be(((d=t[o.id])==null?void 0:d.value)??t[o.id])}).length;return{technicalScore:n.length?Math.round(i/n.length*100):0,discScore:s.length?Math.round(l/s.length*100):0}}function Is(e,t){var o,d;const a={Dominance:0,Influence:0,Steadiness:0,Conscientiousness:0};(e.questions||[]).filter(u=>Number(u.stage)===2).forEach(u=>{var f;const p=(f=t[u.id])==null?void 0:f.value;if(!Be(p))return;const c=a[u.skill]!==void 0?u.skill:"Steadiness",m=Math.max(1,4-Number(p||0));a[c]+=m});const n=Object.entries(a).sort((u,p)=>p[1]-u[1]),s=((o=n[0])==null?void 0:o[0])||"Steadiness",i=((d=n[n.length-1])==null?void 0:d[0])||"Dominance";return{label:{Dominance:"D",Influence:"I",Steadiness:"S",Conscientiousness:"C"}[s]||"S",high:s,low:i,scores:a,summary:`${s} is the strongest observed DISC tendency; ${i} appears lowest based on this assessment.`}}async function Ds(e,t){var d,u,p,c,m;const a="https://admin.nearwork.co/api/send-email",n=e.candidateEmail||((d=r.user)==null?void 0:d.email)||((u=r.candidate)==null?void 0:u.email),s=e.candidateName||((p=r.candidate)==null?void 0:p.name)||((c=r.user)==null?void 0:c.displayName)||"there",i=$a([e.recruiterEmail,e.stakeholderEmail,e.hiringManagerEmail].filter(Boolean).join(",")),l=[];n&&l.push(fetch(a,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({to:n,templateId:"assessment_completed_candidate",data:{name:s,role:e.role,actionUrl:"https://talent.nearwork.co/assessment",actionText:"Open assessment center"}})}));const o=i.length?i:["support@nearwork.co"];l.push(fetch(a,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({to:o,templateId:"assessment_completed_recruiter",data:{name:"Nearwork team",role:e.role,actionUrl:`https://admin.nearwork.co/assessments/${e.id}/questions`,actionText:"Review assessment",message:`${s} completed the assessment. Overall: ${t.score}%. Technical: ${t.technicalScore}%. DISC: ${((m=t.discProfile)==null?void 0:m.label)||"Submitted"}.`}})})),await Promise.allSettled(l)}function Bs(){var t;const e=((t=r.candidate)==null?void 0:t.cvLibrary)||[];return`
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
        ${e.length?e.map(a=>`<article class="cv-item">${g("file-text")}<div><strong>${a.name||a.fileName}</strong><span>${ft(a.uploadedAt)}</span></div>${a.url?`<a href="${a.url}" target="_blank" rel="noreferrer">Open</a>`:""}</article>`).join(""):Ma("No CVs saved yet","Upload role-specific resumes here.")}
      </div>
    </section>
  `}function Us(){return`
    <div class="nw-page-head">
      <div class="nw-page-overline">Support</div>
      <h1 class="nw-page-title">Tips</h1>
      <p class="nw-page-lede">Practical prep for US SaaS interviews — short, useful guidance before recruiter screens, assessments, and client interviews.</p>
    </div>
    <section class="tips-grid rich" style="margin-top:18px;">
      ${Sn.map((e,t)=>`
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
  `}function Rs(){var a,n;const t=(((a=r.candidate)==null?void 0:a.recruiter)||{}).bookingUrl||((n=r.candidate)==null?void 0:n.recruiterBookingUrl)||"mailto:support@nearwork.co?subject=Nearwork%20candidate%20question";return`
    <div class="nw-page-head">
      <div class="nw-page-overline">Support</div>
      <h1 class="nw-page-title">Recruiter</h1>
      <p class="nw-page-lede">Your Nearwork talent partner — reach out anytime about assessments, interviews, feedback, or CV selection.</p>
    </div>
    <div class="nw-split" style="margin-top:18px;">
      <section class="nw-panel" style="padding-bottom:18px;">
        <div class="nw-panel-head"><div><div class="nw-panel-overline">Recruiter</div><div class="nw-panel-title">Your Nearwork contact</div></div></div>
        ${Qs(!0)}
      </section>
      <section class="nw-panel" style="padding-bottom:18px;">
        <div class="nw-panel-head"><div><div class="nw-panel-overline">Booking</div><div class="nw-panel-title">Schedule soon</div></div></div>
        <p class="muted">Ask the Nearwork recruiting team for the earliest available slot. Candidate booking links can be attached to this profile later.</p>
        <a class="primary-action fit" href="${t}" target="_blank" rel="noreferrer">${g("calendar-plus")} Book recruiter call</a>
      </section>
    </div>
  `}function Fs(){return js("profile")}function z(e,t=!1){return`<span class="pf-label">${e}${t?'<span class="pf-optional">optional</span>':""}</span>`}function ie(e,t,a=""){return`
    <div class="pf-card-head">
      <div class="pf-card-icon">${g(e)}</div>
      <div class="pf-card-title">${t}</div>
      ${a?`<span class="pf-card-badge">${a}</span>`:""}
    </div>`}function Ot(e,t={}){const a=e,n=(t.company||"?")[0].toUpperCase();return`
    <div class="pf-sub-card work-entry" data-work-index="${a}">
      <div class="pf-sub-card-left">
        <div class="pf-work-avatar">${n}</div>
      </div>
      <div class="pf-sub-card-body">
        <div class="pf-field-row">
          <label class="pf-field">
            ${z("Job title")}
            <input type="text" class="pf-input work-field" data-field="title" value="${k(t.title||"")}" placeholder="e.g. Customer Success Manager" />
          </label>
          <label class="pf-field">
            ${z("Company")}
            <input type="text" class="pf-input work-field" data-field="company" value="${k(t.company||"")}" placeholder="e.g. Acme Corp" />
          </label>
        </div>
        <div class="pf-field-row pf-field-row--3">
          <label class="pf-field">
            ${z("From")}
            <input type="text" class="pf-input work-field" data-field="from" value="${k(t.from||"")}" placeholder="2021-03" />
          </label>
          <label class="pf-field">
            ${z("To")}
            <input type="text" class="pf-input work-field" data-field="to" value="${k(t.to||"")}" placeholder="present" />
          </label>
          <div></div>
        </div>
      </div>
      <button type="button" class="pf-remove-btn remove-work-entry" data-remove="${a}" aria-label="Remove">
        ${g("x")}
      </button>
    </div>`}const Os=["","A1","A2","B1","B2","C1","C2","Native"];function jt(e,t={}){const a=e,n=typeof t=="string"?{name:t,level:""}:t;return`
    <div class="pf-sub-card lang-entry" data-lang-index="${a}">
      <div class="pf-sub-card-body">
        <div class="pf-field-row">
          <label class="pf-field">
            ${z("Language")}
            <input type="text" class="pf-input lang-field" data-field="name" value="${k(n.name||"")}" placeholder="e.g. Spanish, French…" />
          </label>
          <label class="pf-field">
            ${z("Level")}
            <select class="pf-input lang-field" data-field="level">
              ${Os.map(s=>`<option value="${s}" ${(n.level||"")===s?"selected":""}>${s||"Select level"}</option>`).join("")}
            </select>
          </label>
        </div>
      </div>
      <button type="button" class="pf-remove-btn remove-lang-entry" data-remove="${a}" aria-label="Remove">
        ${g("x")}
      </button>
    </div>`}function zt(e,t={}){const a=e;return`
    <div class="pf-sub-card cert-entry" data-cert-index="${a}">
      <div class="pf-sub-card-left">
        <div class="pf-cert-icon">✓</div>
      </div>
      <div class="pf-sub-card-body">
        <div class="pf-field-row">
          <label class="pf-field">
            ${z("Certificate / Course")}
            <input type="text" class="pf-input cert-field" data-field="name" value="${k(t.name||"")}" placeholder="e.g. Google Analytics" />
          </label>
          <label class="pf-field">
            ${z("Issuer",!0)}
            <input type="text" class="pf-input cert-field" data-field="issuer" value="${k(t.issuer||"")}" placeholder="e.g. Coursera, HubSpot" />
          </label>
        </div>
        <label class="pf-field" style="max-width:200px;">
          ${z("Date (YYYY-MM)",!0)}
          <input type="text" class="pf-input cert-field" data-field="date" value="${k(t.date||"")}" placeholder="2023-06" />
        </label>
      </div>
      <button type="button" class="pf-remove-btn remove-cert-entry" data-remove="${a}" aria-label="Remove">
        ${g("x")}
      </button>
    </div>`}function js(e="profile"){var m,f,E,P,T,L,x,I,F,V,ae,Y,G,ne,h,v,b,S;const t=tt(),a=An(),n=a.country==="Colombia",s=Ze[a.department]||[],i=((m=r.candidate)==null?void 0:m.salaryCurrency)||"USD",l=Sa(((f=r.candidate)==null?void 0:f.salaryAmount)||((E=r.candidate)==null?void 0:E.salary)||((P=r.candidate)==null?void 0:P.salaryUSD),i),o=xn(),d=((T=r.candidate)==null?void 0:T.targetRole)||((L=r.candidate)==null?void 0:L.headline)||"",u=Ta(),p=Dt(),c=p.filter(w=>w.done).length;return`
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
      <div class="pf-progress-label">${c} of ${p.length} sections complete</div>

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
                ${ya("large")}
                <label class="pf-photo-btn">
                  ${g("camera")} Change photo
                  <input name="photo" type="file" accept="image/png,image/jpeg,image/webp" style="display:none;" />
                </label>
              </div>
              <div class="pf-field" style="flex:1;">
                ${z("Full name")}
                <input class="pf-input" name="name" value="${k(((x=r.candidate)==null?void 0:x.name)||((I=r.user)==null?void 0:I.displayName)||"")}" placeholder="Your full name" />
              </div>
            </div>
          </div>

          <!-- ── Role ── -->
          <div class="pf-card">
            ${ie("briefcase-business","Role applying for")}
            <div class="pf-field-row">
              <label class="pf-field">
                ${z("Area")}
                <select class="pf-input" name="roleGroup" id="roleGroupSelect">
                  ${En(o)}
                </select>
              </label>
              <label class="pf-field">
                ${z("Target role")}
                <select class="pf-input" name="targetRole" id="targetRoleSelect">
                  ${wa(o,d)}
                </select>
              </label>
            </div>
          </div>

          <!-- ── Location ── -->
          <div class="pf-card">
            ${ie("map-pin","Location")}
            <label class="pf-field" style="margin-bottom:14px;">
              ${z("Country")}
              <select class="pf-input" name="country" id="countrySelect">
                ${wn.map(w=>`<option value="${k(w)}" ${w===a.country?"selected":""}>${C(w)}</option>`).join("")}
              </select>
            </label>
            <div class="pf-field-row" id="pfCoLoc" style="display:${n?"":"none"};">
              <label class="pf-field">
                ${z("Department")}
                <select class="pf-input" name="department" id="departmentSelect">
                  ${Object.keys(Ze).map(w=>`<option value="${k(w)}" ${w===a.department?"selected":""}>${w}</option>`).join("")}
                </select>
              </label>
              <label class="pf-field">
                ${z("City")}
                <select class="pf-input" name="city" id="citySelect">
                  ${s.map(w=>`<option value="${k(w)}" ${w===a.city?"selected":""}>${w}</option>`).join("")}
                </select>
              </label>
            </div>
            <p id="pfCoHint" style="display:${n?"none":"block"};font-size:12.5px;color:var(--mid);margin:0;line-height:1.5;">No state or city needed — country is enough.</p>
          </div>

          <!-- ── Compensation ── -->
          <div class="pf-card">
            ${ie("banknote","Compensation")}
            <label class="pf-field" style="max-width:280px;">
              ${z("Target monthly salary")}
              <div class="pf-salary-wrap">
                <select id="salaryCurrencyInput" name="salaryCurrency" class="pf-currency-select">
                  <option value="USD" ${l.salaryCurrency==="USD"?"selected":""}>USD</option>
                  <option value="COP" ${l.salaryCurrency==="COP"?"selected":""}>COP</option>
                </select>
                <input class="pf-input pf-salary-input" id="salaryInput" name="salary" value="${k(l.salaryAmount?Lt(l.salaryAmount,l.salaryCurrency):"")}" inputmode="numeric" oninput="window.__fmtSalary(this)" placeholder="2,500" />
              </div>
              <span class="pf-hint">How much you're looking for, per month.</span>
            </label>
          </div>

          <!-- ── English & languages ── -->
          <div class="pf-card" id="langCard">
            ${ie("languages","English & languages")}
            <label class="pf-field" style="max-width:280px; margin-bottom:14px;">
              ${z("English level")}
              <select class="pf-input" name="english">
                ${["","B1","B2","C1","C2","Native"].map(w=>{var M;return`<option value="${w}" ${((M=r.candidate)==null?void 0:M.english)===w?"selected":""}>${w||"Select level"}</option>`}).join("")}
              </select>
            </label>
            ${z("Other languages",!0)}
            <p class="pf-hint">Add any other languages you speak and your level in each.</p>
            <div id="langEntries" class="pf-entries">
              ${(((F=r.candidate)==null?void 0:F.languages)||[]).map((w,M)=>jt(M,w)).join("")}
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
                ${z("WhatsApp number")}
                <input class="pf-input" name="whatsapp" value="${k(((V=r.candidate)==null?void 0:V.whatsapp)||((ae=r.candidate)==null?void 0:ae.phone)||"")}" inputmode="tel" autocomplete="tel" placeholder="+57 300 123 4567" required />
              </label>
              <label class="pf-field">
                ${z("LinkedIn",!0)}
                <input class="pf-input" name="linkedin" value="${k(((Y=r.candidate)==null?void 0:Y.linkedin)||"")}" placeholder="https://linkedin.com/in/…" />
              </label>
            </div>
          </div>

          <!-- ── Communications ── -->
          <div class="pf-card">
            ${ie("mail","Communications")}
            <label class="pf-checkbox-row">
              <input type="checkbox" name="marketingConsent" ${((G=r.candidate)==null?void 0:G.marketingConsent)===!0?"checked":""} />
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
            ${ie("sparkles","Skills",t.length?`${t.length} added`:"")}
            ${Pn(t)}
          </div>
        </div>

        <!-- ── CV ── -->
        <div class="pf-tab-panel" data-tab-panel="cv" hidden>
          <div class="pf-card" id="profileCvCard">
            ${ie("file-text","CV")}
            <p class="pf-hint">Upload the CV you want Nearwork to use for your applications.</p>
            ${(ne=r.candidate)!=null&&ne.activeCvName||(h=r.candidate)!=null&&h.cvUrl?`
              <div class="pf-cv-current">
                <div class="pf-cv-icon">${g("file-text")}</div>
                <div class="pf-cv-info">
                  <strong>${C(r.candidate.activeCvName||"CV on file")}</strong>
                  <span>Currently active · upload below to replace</span>
                </div>
                ${r.candidate.cvUrl?`<a class="pf-cv-open" href="${k(r.candidate.cvUrl)}" target="_blank" rel="noreferrer">${g("external-link")} Open</a>`:""}
              </div>`:""}
            <label class="pf-file-label" for="profileCvFileInput">
              ${g("upload")} Choose file (.pdf, .doc, .docx)
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
            ${ie("align-left","Summary","optional")}
            <textarea class="pf-input pf-textarea" name="summary" placeholder="Add a short note about what you do best — 2–3 sentences.">${C(((v=r.candidate)==null?void 0:v.summary)||"")}</textarea>
          </div>

          <!-- ── Work history ── -->
          <div class="pf-card" id="workHistoryCard">
            ${ie("building-2","Work experience","optional")}
            <p class="pf-hint">Add your previous roles so recruiters can see your background.</p>
            <div id="workEntries" class="pf-entries">
              ${(((b=r.candidate)==null?void 0:b.workHistory)||[]).map((w,M)=>Ot(M,w)).join("")}
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
              ${(((S=r.candidate)==null?void 0:S.certifications)||[]).map((w,M)=>zt(M,w)).join("")}
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

      ${r.showDeleteAccountModal?`
      <div class="nw-modal-overlay" id="deleteAccountOverlay">
        <div class="nw-modal">
          <h3>Delete your account?</h3>
          <p>This will permanently delete your profile, resume, applications, and assessment history from Nearwork. This cannot be undone.</p>
          <label class="pf-field">
            <span class="pf-label" style="text-transform:none;">Type DELETE to confirm</span>
            <input class="pf-input" id="deleteConfirmInput" autocomplete="off" />
          </label>
          ${r.deleteAccountStatus==="error"?`<div class="nw-modal-error">${C(r.deleteAccountError||"Something went wrong.")}</div>`:""}
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
  `}function Ta(){const e=Dt(),t=e.filter(a=>a.done).length;return Math.max(25,Math.round(t/e.length*100))}function zs(){const e=r.applications[0];return(e==null?void 0:e.stage)||(e==null?void 0:e.status)||"profile-review"}function Hs(e){const t=String(e).toLowerCase().replace(/_/g,"-").replace(/\s+/g,"-"),a=Math.max(0,Zt.findIndex(n=>t.includes(n.key)||n.key.includes(t)));return`<div class="pipeline">${Zt.map((n,s)=>`<article class="${s<=a?"done":""} ${s===a?"current":""}"><span>${s+1}</span><strong>${n.label}</strong><p>${n.help}</p></article>`).join("")}</div>`}function Vs(){return`
    <div class="nw-empty">
      ${g("briefcase-business")}
      <strong>No active pipeline yet</strong>
      <p>Browse current openings and apply when you find a role that fits. Nearwork will show your applications here once you apply.</p>
      <div style="display:flex;gap:8px;margin-top:12px;">
        <button class="nw-btn-primary" type="button" data-page="matches">${g("sparkles")} View matches</button>
        <a class="nw-btn-secondary" href="https://jobs.nearwork.co" target="_blank" rel="noreferrer">${g("external-link")} Open jobs</a>
      </div>
    </div>
  `}function Na(){try{return new Set(JSON.parse(localStorage.getItem("nw_talent_applied")||"[]"))}catch{return new Set}}function Gs(e){const t=Le(e),n=new Set(r.applications.map(c=>c.jobId||c.openingCode)).has(t.code)||Na().has(t.code),s=qt(t),i=t.match||(s.length>=3?Math.min(97,70+s.length*4):null),l=["#10A07C","#EC4E7E","#3B82F6","#F4A52E"],o=l[t.orgName.length%l.length],d=t.orgName.split(/\s+/).slice(0,2).map(c=>c[0]).join("").toUpperCase(),u=`https://jobs.nearwork.co/apply?code=${encodeURIComponent(t.code)}`,p=(s.length?s:t.skills).slice(0,3);return`
    <div class="nw-match-card">
      <div class="nw-match-card-top">
        <div class="nw-match-avatar" style="background:${o};">${d}</div>
        ${i?`<div class="nw-match-score">${i}% match</div>`:""}
      </div>
      <div class="nw-match-role">${C(t.title)}</div>
      <div class="nw-match-company">${C(t.orgName)} · ${C(t.location)}</div>
      <div class="nw-match-chips">${p.map(C).map(c=>`<span class="nw-match-chip">${c}</span>`).join("")}</div>
      <div class="nw-match-footer">
        <span class="nw-match-salary">${C(t.compensation)}</span>
        <button type="button" class="nw-match-view" data-open-url="${k(u)}">View opening ${g("arrow-up-right")}</button>
      </div>
      <button class="nw-match-applybtn${n?" applied":""}" type="button" data-apply="${t.code}" ${n?"disabled":""}>${n?`${g("check")} Applied`:`Apply now ${g("arrow-right")}`}</button>
    </div>
  `}function Ws(e,t){const a=String(e.stage||e.status||"applied").toLowerCase(),n=a.includes("offer")?4:a.includes("final")?3:a.includes("interview")?2:a.includes("assessment")?1:0,s=e.clientName||e.company||"Nearwork client",i=s.split(/\s+/).slice(0,2).map(u=>u[0]).join("").toUpperCase(),l=["#10A07C","#EC4E7E","#3B82F6","#F4A52E","#8B5CF6"],o=l[s.length%l.length],d=["action-needed","interview-scheduled","assessment-sent"].includes(String(e.status||"").toLowerCase());return`
    <div class="nw-app-row${t?" last":""}">
      <div class="nw-app-avatar" style="background:${o};">${i}</div>
      <div class="nw-app-info">
        <div class="nw-app-title">${C(e.jobTitle||e.title||"Application")} <span class="nw-app-company">· ${C(s)}</span></div>
        <div class="nw-app-stages">
          ${ga.map((u,p)=>`<div class="nw-stage-pip${p<=n?" done":""}"></div>`).join("")}
          <span class="nw-app-stage-label">${e.stage||e.status||"Applied"}</span>
        </div>
      </div>
      <div class="nw-app-meta">
        <span class="nw-app-status${d?" action":""}">${e.status||"In review"}</span>
        <div class="nw-app-date">${ft(e.updatedAt||e.createdAt)}</div>
      </div>
      ${g("chevron-right")}
    </div>`}function Qs(e=!1){var i;const t=((i=r.candidate)==null?void 0:i.recruiter)||{},a=t.email||"support@nearwork.co",n=t.whatsapp||fn,s=t.whatsappUrl||hn;return`<article class="recruiter-card"><div class="avatar recruiter-avatar">NW</div><div><strong>${t.name||"Nearwork Support"}</strong><p><a href="mailto:${a}">${a}</a></p><p><a href="${s}" target="_blank" rel="noreferrer">WhatsApp ${n}</a></p>${e?"<span>Questions about assessments, interviews, feedback, or CV selection should go here.</span>":""}</div></article>`}function Ma(e,t){return`<div class="empty-state">${g("inbox")}<strong>${e}</strong><p>${t}</p></div>`}function Js(e){const t=(e==null?void 0:e.title)||(e==null?void 0:e.role)||"this role",a=document.createElement("div");a.className="nw-modal-overlay",a.innerHTML=`
    <div class="nw-modal" style="text-align:center;padding:32px 28px;">
      <div style="font-size:48px;margin-bottom:12px;">🎉</div>
      <h3 style="font-size:18px;margin-bottom:10px;">Application submitted!</h3>
      <p style="margin-bottom:6px;">You've applied to <strong>${C(t)}</strong>. Our team will review your profile and reach out with next steps shortly.</p>
      <p style="font-size:12px;color:var(--light);margin-bottom:20px;">You can track your application status in the Applications tab.</p>
      <button type="button" class="pf-btn-primary" id="dismissApplySuccess" style="padding:11px 28px;border-radius:99px;font-size:14px;">Got it</button>
    </div>`,document.body.appendChild(a),a.addEventListener("click",n=>{(n.target===a||n.target.id==="dismissApplySuccess")&&a.remove()}),document.getElementById("dismissApplySuccess").focus()}function Ys(){et.innerHTML='<main class="loading-screen"><span class="logo-mark">N</span><p>Loading Talent...</p></main>'}async function Zs(e){var t;try{const a=await((t=U.currentUser)==null?void 0:t.getIdToken().catch(()=>""));if(a){const n=await fetch("/api/auth-handoff",{method:"POST",headers:{Authorization:"Bearer "+a,"Content-Type":"application/json"}});if(n.ok){const{customToken:s}=await n.json();if(s){const i=new URL(e);i.searchParams.set("ct",s),window.open(i.toString(),"_blank","noreferrer");return}}}}catch{}window.open(e,"_blank","noreferrer")}function Ks(){var e,t,a,n,s,i,l,o,d,u,p,c,m,f,E,P,T,L,x,I,F,V,ae,Y,G,ne;(e=document.querySelector("#signOut"))==null||e.addEventListener("click",async()=>{await wt(U),Q&&Q(),Q=null,Qe=!1,K=!1,ue=null,window.history.pushState({page:"overview"},"","/"),$({user:null,candidate:null,applications:[],assessments:[],jobs:[],view:"login",activePage:"overview",message:""})}),(t=document.querySelector("#mobileSignOut"))==null||t.addEventListener("click",async()=>{await wt(U),Q&&Q(),Q=null,Qe=!1,K=!1,ue=null,window.history.pushState({page:"overview"},"","/"),$({user:null,candidate:null,applications:[],assessments:[],jobs:[],view:"login",activePage:"overview",message:""})}),(a=document.querySelector("#signIn"))==null||a.addEventListener("click",()=>{window.history.pushState({page:"overview"},"","/"),$({view:"login",activePage:"overview",message:""})}),(n=document.querySelector("#openDeleteAccount"))==null||n.addEventListener("click",()=>{$({showDeleteAccountModal:!0,deleteAccountStatus:null,deleteAccountError:""})}),(s=document.querySelector("#cancelDeleteAccount"))==null||s.addEventListener("click",()=>{$({showDeleteAccountModal:!1,deleteAccountStatus:null,deleteAccountError:""})}),(i=document.querySelector("#confirmDeleteAccount"))==null||i.addEventListener("click",async()=>{var v,b;if(((b=(v=document.querySelector("#deleteConfirmInput"))==null?void 0:v.value)==null?void 0:b.trim())!=="DELETE"){$({deleteAccountStatus:"error",deleteAccountError:'Type "DELETE" to confirm.'});return}$({deleteAccountStatus:"deleting"});try{await cn(),await wt(U),Q&&Q(),Q=null,Qe=!1,K=!1,ue=null,window.history.pushState({page:"overview"},"","/"),$({user:null,candidate:null,applications:[],assessments:[],jobs:[],view:"login",activePage:"overview",showDeleteAccountModal:!1,deleteAccountStatus:null,deleteAccountError:"",message:"Your account has been deleted. You're welcome to sign up again anytime."})}catch(S){$({deleteAccountStatus:"error",deleteAccountError:S.message||"Failed to delete account."})}}),document.querySelectorAll("[data-page]").forEach(h=>{h.addEventListener("click",v=>{const S=(v.currentTarget.closest("[data-page]")||v.currentTarget).dataset.page;if(r.activePage==="profile"&&K&&S!=="profile"){ue=S,$({showUnsavedChangesModal:!0});return}Ge(S)})}),(l=document.querySelector("[data-dashboard-home]"))==null||l.addEventListener("click",()=>{if(r.activePage==="profile"&&K){ue="overview",$({showUnsavedChangesModal:!0});return}Ge("overview")}),(o=document.querySelector("#cancelUnsavedNav"))==null||o.addEventListener("click",()=>{ue=null,$({showUnsavedChangesModal:!1})}),(d=document.querySelector("#discardUnsavedNav"))==null||d.addEventListener("click",()=>{K=!1;const h=ue;ue=null,$({showUnsavedChangesModal:!1}),h&&Ge(h)}),(u=document.querySelector("#saveUnsavedNav"))==null||u.addEventListener("click",()=>{var h;$({showUnsavedChangesModal:!1}),(h=document.querySelector("#profileForm"))==null||h.requestSubmit()}),(p=document.querySelector("#notificationBell"))==null||p.addEventListener("click",()=>{$({notificationPanelOpen:!r.notificationPanelOpen,notificationSettingsOpen:!1})}),(c=document.querySelector("#notificationSettings"))==null||c.addEventListener("click",()=>{$({notificationSettingsOpen:!r.notificationSettingsOpen,notificationPanelOpen:!1})}),document.querySelectorAll("[data-notification-read]").forEach(h=>{h.addEventListener("click",async()=>{const v=h.dataset.notificationRead;r.user&&le&&await mn(v).catch(()=>null),$({notifications:r.notifications.map(b=>b.id===v?{...b,read:!0}:b)})})}),document.querySelectorAll("[data-notification-pref]").forEach(h=>{h.addEventListener("change",async()=>{var w;const v=structuredClone(((w=r.candidate)==null?void 0:w.notificationPreferences)||{}),b=h.dataset.notificationPref,S=h.dataset.channel;v[b]={...v[b]||{},[S]:h.checked},$({candidate:{...r.candidate,notificationPreferences:v}}),r.user&&le&&await gn(r.user.uid,v).catch(()=>null)})}),document.querySelectorAll("[data-assessment-jump]").forEach(h=>{h.addEventListener("click",async()=>{var ee,H,D;const v=Ae()||((ee=(r.assessments||[])[0])==null?void 0:ee.id),b=(r.assessments||[]).find(A=>A.id===v),S=Number(h.dataset.assessmentJump||0),w=(H=b==null?void 0:b.questions)==null?void 0:H[S];if(!v||!w)return;await He(v,"__progress__","",{currentQuestionIndex:S,totalQuestions:((D=b==null?void 0:b.questions)==null?void 0:D.length)||70,currentStage:w.stage||1}),Ie(v,S);const M=(r.assessments||[]).map(A=>A.id===v?{...A,currentQuestionIndex:S,currentStage:w.stage||1}:A);$({assessments:M,activePage:"assessment",message:""})})}),document.querySelector("#availability").addEventListener("change",async h=>{const v=h.target.value;$({candidate:{...r.candidate,availability:v}}),r.user&&le?await ln(r.user.uid,v):$({message:"Sign in to save availability."})}),(m=document.querySelector("#filterMatches"))==null||m.addEventListener("click",()=>{const h=tt().length>=3;$({matchesFiltered:h?!r.matchesFiltered:!1,message:h?"":"Add at least 5 skills in Profile first, then filter matching openings."})}),(f=document.querySelector("#departmentSelect"))==null||f.addEventListener("change",h=>{const v=document.querySelector("#citySelect"),b=Ze[h.target.value]||[];v.innerHTML=b.map(S=>`<option value="${k(S)}">${S}</option>`).join("")}),(E=document.querySelector("#countrySelect"))==null||E.addEventListener("change",h=>{const v=h.target.value==="Colombia",b=document.querySelector("#pfCoLoc"),S=document.querySelector("#pfCoHint");b&&(b.style.display=v?"":"none"),S&&(S.style.display=v?"none":"block")}),(P=document.querySelector("#roleGroupSelect"))==null||P.addEventListener("change",h=>{const v=document.querySelector("#targetRoleSelect");v.innerHTML=wa(h.target.value,"")}),(T=document.querySelector("#salaryCurrencyInput"))==null||T.addEventListener("change",h=>{const v=document.querySelector("#salaryInput");if(!v)return;const b=Xt(v.value,h.target.value);h.target.value=b,v.placeholder=b==="COP"?"5,000,000":"2,500",v.value=Lt(v.value,b)}),(L=document.querySelector("#salaryInput"))==null||L.addEventListener("blur",h=>{const v=document.querySelector("#salaryCurrencyInput"),b=Xt(h.target.value,(v==null?void 0:v.value)||"USD");v&&(v.value=b),h.target.placeholder=b==="COP"?"5,000,000":"2,500",h.target.value=Lt(h.target.value,b)}),ui(),oi(),ei(),si(),ai(),Xs(),document.querySelectorAll("[data-open-url]").forEach(h=>{h.addEventListener("click",()=>Zs(h.dataset.openUrl))}),document.querySelectorAll("[data-apply]").forEach(h=>{h.addEventListener("click",async()=>{const v=r.jobs.map(Le).find(S=>S.code===h.dataset.apply),b=h.dataset.apply;if(h.disabled=!0,h.textContent="Submitting...",r.user&&le){try{const S=Na();S.add(b),localStorage.setItem("nw_talent_applied",JSON.stringify([...S]))}catch{}await rn(r.user.uid,v),h.textContent=`${g("check")} Applied`,h.classList.add("applied"),Js(v)}else $({message:"Sign in to apply to this opening."})})}),(x=document.querySelector("#showTechIntro"))==null||x.addEventListener("click",()=>{$({assessmentUiStep:"techIntro",message:""})}),(I=document.querySelector("#backToWelcome"))==null||I.addEventListener("click",()=>{$({assessmentUiStep:null,message:""})}),(F=document.querySelector("#startDiscAssessment"))==null||F.addEventListener("click",async()=>{var H;const h=Ae()||((H=(r.assessments||[])[0])==null?void 0:H.id),v=(r.assessments||[]).find(D=>D.id===h);if(!h||!v)return;const b=v.questions||[],S=document.querySelector("#startDiscAssessment"),w=S?Number(S.dataset.discIndex||50):b.findIndex(D=>Number(D.stage||1)===2),M=w>=0?w:50,ee=new Date().toISOString();try{await He(h,"__progress__","",{currentQuestionIndex:M,totalQuestions:b.length,currentStage:2,discStartedAt:ee}),Ie(h,M);const D=(r.assessments||[]).map(A=>A.id===h?{...A,currentQuestionIndex:M,currentStage:2,discStartedAt:ee}:A);$({assessments:D,activePage:"assessment",assessmentUiStep:null,message:""})}catch(D){$({message:xe(D)})}}),(V=document.querySelector("#startAssessment"))==null||V.addEventListener("click",async()=>{var b;const h=Ae()||((b=(r.assessments||[])[0])==null?void 0:b.id),v=(r.assessments||[]).find(S=>S.id===h)||(r.assessments||[])[0];if(!h||!r.user){$({message:"Please log in to start your assessment."});return}try{await sn(h,r.user.uid),Ie(h,Number((v==null?void 0:v.currentQuestionIndex)||0),!0);const S=(r.assessments||[]).map(w=>w.id===h?{...w,status:"started",startedAt:w.startedAt||new Date().toISOString(),technicalStartedAt:w.technicalStartedAt||new Date().toISOString()}:w);$({assessments:S,activePage:"assessment",assessmentUiStep:null,message:""})}catch(S){$({message:xe(S)})}}),(ae=document.querySelector("#prevAssessmentQuestion"))==null||ae.addEventListener("click",async()=>{var ee,H,D,A;const h=Ae()||((ee=(r.assessments||[])[0])==null?void 0:ee.id),v=(r.assessments||[]).find(me=>me.id===h),b=Number(((H=document.querySelector("#assessmentQuestionForm"))==null?void 0:H.dataset.currentIndex)??(v==null?void 0:v.currentQuestionIndex)??0),S=Math.max(0,b-1),w=(D=v==null?void 0:v.questions)==null?void 0:D[S];await He(h,"__progress__","",{currentQuestionIndex:S,totalQuestions:((A=v==null?void 0:v.questions)==null?void 0:A.length)||70,currentStage:(w==null?void 0:w.stage)||1}),Ie(h,S);const M=(r.assessments||[]).map(me=>me.id===h?{...me,currentQuestionIndex:S,currentStage:(w==null?void 0:w.stage)||1}:me);$({assessments:M,activePage:"assessment",message:""})}),(Y=document.querySelector("#assessmentQuestionForm"))==null||Y.addEventListener("submit",async h=>{var Re;h.preventDefault();const v=Ae()||((Re=(r.assessments||[])[0])==null?void 0:Re.id),b=(r.assessments||[]).find(O=>O.id===v),S=(b==null?void 0:b.questions)||[],w=Number(h.currentTarget.dataset.currentIndex??(b==null?void 0:b.currentQuestionIndex)??0),M=S[w],ee=new FormData(h.currentTarget).get("answer");if(!M){$({message:"This question could not be loaded. Please refresh and try again."});return}const H=ee===null?{value:"",skipped:!0,answeredAt:new Date().toISOString()}:{value:Number(ee),skipped:!1,answeredAt:new Date().toISOString()},D={...b.answers||{},[M.id]:H},A=S[w+1],me=A&&Number(A.stage||1)!==Number(M.stage||1),_e=Pt(b,M.stage,D);try{if((me||w+1>=S.length)&&_e.length){await He(v,M.id,D[M.id],{currentQuestionIndex:w,totalQuestions:S.length,currentStage:M.stage||1});const O=(r.assessments||[]).map(se=>se.id===v?{...se,answers:D,currentQuestionIndex:w,currentStage:M.stage||1,progress:`${w+1}/${S.length}`}:se);$({assessments:O,activePage:"assessment",message:`You missed ${_e.length} question${_e.length===1?"":"s"} in the ${It(M.stage)}.`});return}if(w+1>=S.length){const O=qs(b,D),se=Is(b,D);await on(v,D,{totalQuestions:S.length,technicalScore:O.technicalScore,discScore:O.discScore,score:Math.round(O.technicalScore*.75+O.discScore*.25),discProfile:se}),fetch("https://admin.nearwork.co/api/generate-assessment-insights",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({assessmentId:v})}).catch(()=>null),Ds(b,{score:Math.round(O.technicalScore*.75+O.discScore*.25),technicalScore:O.technicalScore,discScore:O.discScore,discProfile:se}).catch(ke=>console.warn(ke));const $e=(r.assessments||[]).map(ke=>ke.id===v?{...ke,answers:D,status:"completed",score:Math.round(O.technicalScore*.75+O.discScore*.25),technical:O.technicalScore,disc:se.label,discProfile:se,progress:`${S.length}/${S.length}`}:ke);$({assessments:$e,activePage:"assessment",message:""})}else{const O=M.stage===1&&(A==null?void 0:A.stage)===2&&!b.discStartedAt;await He(v,M.id,D[M.id],{currentQuestionIndex:w+1,totalQuestions:S.length,currentStage:(A==null?void 0:A.stage)||M.stage||1}),Ie(v,w+1);const se=(r.assessments||[]).map($e=>$e.id===v?{...$e,answers:D,currentQuestionIndex:w+1,currentStage:(A==null?void 0:A.stage)||M.stage||1,progress:`${w+1}/${S.length}`}:$e);$({assessments:se,activePage:"assessment",message:"",assessmentUiStep:O?"discIntro":null})}}catch(O){$({message:xe(O)})}}),(G=document.querySelector("#profileForm"))==null||G.addEventListener("submit",async h=>{var me,_e,Re,O,se,$e,ke,Ht,Vt,Gt;h.preventDefault();const v=new FormData(h.currentTarget),b=v.get("country")||"Colombia",S=b==="Colombia",w=S?v.get("department"):"",M=S?v.get("city"):"",ee=String(b).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,""),H=Sa(v.get("salary"),v.get("salaryCurrency")),D=v.get("marketingConsent")==="on",A={name:Ue(v.get("name")),targetRole:v.get("targetRole"),headline:v.get("targetRole"),department:w,city:M,locationId:S?`${String(M).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g,"-")}-co`:ee,location:S?`${M}, ${w}`:b,locationCity:M,locationDepartment:w,locationCountry:b,english:v.get("english"),salary:H.salary,salaryUSD:H.salaryUSD,salaryAmount:H.salaryAmount,salaryCurrency:H.salaryCurrency,expectedSalaryAmount:H.salaryAmount,expectedSalaryCurrency:H.salaryCurrency,linkedin:v.get("linkedin"),whatsapp:v.get("whatsapp"),phone:v.get("whatsapp"),skills:[...new Set(v.getAll("skills").map(Ce).filter(Boolean))],otherSkills:[],languages:ni(),summary:v.get("summary"),email:((me=r.candidate)==null?void 0:me.email)||((_e=r.user)==null?void 0:_e.email)||"",availability:((Re=r.candidate)==null?void 0:Re.availability)||"open",marketingConsent:D,marketingConsentAt:D?((O=r.candidate)==null?void 0:O.marketingConsent)===!0?((se=r.candidate)==null?void 0:se.marketingConsentAt)||null:new Date().toISOString():null,onboarded:!0};if(!r.user){$({candidate:{...r.candidate,...A},message:"Preview updated. Sign in to save this profile."});return}try{const qe=v.get("photo");let Wt=(($e=r.candidate)==null?void 0:$e.photoURL)||((ke=r.user)==null?void 0:ke.photoURL)||"";qe!=null&&qe.name&&(Wt=await un(r.user.uid,qe));const at=(Ht=v.get("profileCv"))!=null&&Ht.name?v.get("profileCv"):pt;let Te=null,Qt=!1;if(at!=null&&at.name)try{Te=await ut(r.user.uid,at,v.get("profileCvLabel")||""),pt=null}catch{Qt=!0}const yt={...A,photoURL:Wt,candidateCode:(Vt=r.candidate)==null?void 0:Vt.candidateCode,...Te?{activeCvId:Te.id,activeCvName:Te.name||Te.fileName,cvUrl:Te.url,cvLibrary:[...((Gt=r.candidate)==null?void 0:Gt.cvLibrary)||[],Te]}:{},workHistory:(()=>{var Fe,Oe,je,ze;const Ne=ti();return Ne.length?Ne:(Fe=oe==null?void 0:oe.workHistory)!=null&&Fe.length&&(De||!((je=(Oe=r.candidate)==null?void 0:Oe.workHistory)!=null&&je.length))?oe.workHistory:((ze=r.candidate)==null?void 0:ze.workHistory)||[]})(),certifications:(()=>{var Fe,Oe,je,ze;const Ne=ii();return Ne.length?Ne:(Fe=oe==null?void 0:oe.certifications)!=null&&Fe.length&&(De||!((je=(Oe=r.candidate)==null?void 0:Oe.certifications)!=null&&je.length))?oe.certifications:((ze=r.candidate)==null?void 0:ze.certifications)||[]})()};oe=null,De=!1;const bt=await Xe(r.user.uid,yt),qa=Qt?"Profile saved, but the CV failed to upload. Try uploading it again from the CV section.":(bt==null?void 0:bt.atsSynced)===!1?"Profile saved. Nearwork will finish connecting it to your workspace.":"Profile saved.";if(v.get("mode")==="onboarding")window.history.pushState({page:"overview"},"","/"),$({candidate:{...r.candidate,...yt},activePage:"overview",message:"Profile complete. Welcome to Talent."});else if(K=!1,$({candidate:{...r.candidate,...yt},message:qa,showUnsavedChangesModal:!1}),ue){const Ne=ue;ue=null,Ge(Ne)}}catch(qe){$({message:xe(qe)})}}),(ne=document.querySelector("#cvForm"))==null||ne.addEventListener("submit",async h=>{var S;h.preventDefault();const v=new FormData(h.currentTarget),b=v.get("cv");if(b!=null&&b.name){if(!r.user){$({message:"Sign in to upload and store CVs."});return}try{const w=await ut(r.user.uid,b,v.get("label"));$({candidate:{...r.candidate,cvLibrary:[...((S=r.candidate)==null?void 0:S.cvLibrary)||[],w],activeCvId:w.id},message:"CV uploaded."})}catch(w){$({message:xe(w)})}}})}function Xs(){var s;const e=document.querySelectorAll(".pf-tab"),t=document.querySelectorAll(".pf-tab-panel");if(!e.length||!t.length)return;const a=i=>{e.forEach(l=>l.classList.toggle("active",l.dataset.tab===i)),t.forEach(l=>{l.hidden=l.dataset.tabPanel!==i})};e.forEach(i=>{i.addEventListener("click",()=>a(i.dataset.tab))}),(s=document.querySelector("#profileForm"))==null||s.addEventListener("invalid",i=>{const l=i.target.closest(".pf-tab-panel");l&&a(l.dataset.tabPanel)},!0);const n=document.querySelector("#profileForm");n==null||n.addEventListener("input",()=>{K=!0}),n==null||n.addEventListener("change",()=>{K=!0})}function ei(){const e=document.querySelector("#workHistoryCard");if(!e)return;let t=e.querySelectorAll(".work-entry").length;e.addEventListener("click",a=>{var s;const n=a.target.closest(".remove-work-entry");if(n){(s=n.closest(".work-entry"))==null||s.remove(),K=!0;return}if(a.target.closest("#addWorkEntry")){const i=document.querySelector("#workEntries");if(!i)return;const l=document.createElement("div");l.innerHTML=Ot(t++,{}),i.appendChild(l.firstElementChild),K=!0}})}function ti(){return[...document.querySelectorAll(".work-entry")].map(e=>{const t=a=>{var n,s;return((s=(n=e.querySelector(`[data-field="${a}"]`))==null?void 0:n.value)==null?void 0:s.trim())||""};return{title:t("title"),company:t("company"),from:t("from"),to:t("to")}}).filter(e=>e.title||e.company)}function ai(){const e=document.querySelector("#langCard");if(!e)return;let t=e.querySelectorAll(".lang-entry").length;e.addEventListener("click",a=>{var s;const n=a.target.closest(".remove-lang-entry");if(n){(s=n.closest(".lang-entry"))==null||s.remove(),K=!0;return}if(a.target.closest("#addLangEntry")){const i=document.querySelector("#langEntries");if(!i)return;const l=document.createElement("div");l.innerHTML=jt(t++,{}),i.appendChild(l.firstElementChild),K=!0}})}function ni(){return[...document.querySelectorAll(".lang-entry")].map(e=>{const t=a=>{var n,s;return((s=(n=e.querySelector(`[data-field="${a}"]`))==null?void 0:n.value)==null?void 0:s.trim())||""};return{name:t("name"),level:t("level")}}).filter(e=>e.name)}function si(){const e=document.querySelector("#certCard");if(!e)return;let t=e.querySelectorAll(".cert-entry").length;e.addEventListener("click",a=>{var s;const n=a.target.closest(".remove-cert-entry");if(n){(s=n.closest(".cert-entry"))==null||s.remove(),K=!0;return}if(a.target.closest("#addCertEntry")){const i=document.querySelector("#certEntries");if(!i)return;const l=document.createElement("div");l.innerHTML=zt(t++,{}),i.appendChild(l.firstElementChild),K=!0}})}function ii(){return[...document.querySelectorAll(".cert-entry")].map(e=>{const t=a=>{var n,s;return((s=(n=e.querySelector(`[data-field="${a}"]`))==null?void 0:n.value)==null?void 0:s.trim())||""};return{name:t("name"),issuer:t("issuer"),date:t("date")}}).filter(e=>e.name)}function oi(){var n,s,i,l,o,d;const e=document.querySelector("#profileForm"),t=e==null?void 0:e.querySelector('input[name="profileCv"]');if(!e||!t)return;((n=e.querySelector('input[name="mode"]'))==null?void 0:n.value)==="onboarding"&&!((i=(s=r.candidate)==null?void 0:s.skills)!=null&&i.length)&&!((o=(l=r.candidate)==null?void 0:l.workHistory)!=null&&o.length)&&!((d=r.candidate)!=null&&d.name)?ri(e,t):li(t)}function ri(e,t){var l;const a=document.querySelector("#profileCvCard");if(!a)return;const n=[...e.children].filter(o=>o!==a&&o.type!=="hidden"&&o.getAttribute("name")!=="mode");n.forEach(o=>{o.style.display="none"});const s=document.createElement("p");s.id="cvGatePrompt",s.style.cssText="font-size:13px;color:var(--mid);margin:10px 0 4px;text-align:center;",s.innerHTML=`Upload your CV and we'll fill in the rest for you — or <button type="button" id="skipCvParse" style="background:none;border:none;padding:0;font-size:13px;color:var(--green);cursor:pointer;text-decoration:underline;">skip and fill in manually</button>`,a.insertAdjacentElement("afterend",s);function i(){var o,d;(o=document.querySelector("#cvGatePrompt"))==null||o.remove(),(d=document.querySelector("#cvParseLoading"))==null||d.remove(),n.forEach(u=>{u.style.display=""})}(l=document.querySelector("#skipCvParse"))==null||l.addEventListener("click",i),t.addEventListener("change",async()=>{var p,c;const o=(p=t.files)==null?void 0:p[0];if(!o)return;(c=document.querySelector("#cvGatePrompt"))==null||c.remove();const d=document.createElement("p");d.id="cvParseLoading",d.style.cssText="font-size:13px;font-weight:600;color:var(--green);padding:14px 0;text-align:center;",d.textContent="Analysing your CV…",a.insertAdjacentElement("afterend",d),oe=null,De=!0;const u=await _t(o);i(),u&&(oe=u,ci(u,!0),di(u,t))})}function li(e){e.addEventListener("change",async()=>{var o,d,u,p,c,m,f,E,P;const t=(o=e.files)==null?void 0:o[0];if(!t)return;oe=null,De=!1,pt=null,$({message:"⏳ Analysing your CV — this takes up to 30 seconds…"});const a=await _t(t);if(!a){$({message:"⚠️ Could not read your CV. Check the browser console for details, or try a different file."});return}oe=a,De=!0,pt=t;const n=r.candidate||{},s={...n,...a.name?{name:a.name}:{},...a.phone?{whatsapp:a.phone,phone:a.phone}:{},...a.summary?{summary:a.summary}:{},skills:(d=a.skills)!=null&&d.length?[...new Set(a.skills.map(Ce).filter(Boolean))]:n.skills||[],workHistory:(u=a.workHistory)!=null&&u.length?a.workHistory:n.workHistory||[],certifications:(p=a.certifications)!=null&&p.length?a.certifications:n.certifications||[],languages:(c=a.languages)!=null&&c.length?a.languages:n.languages||[]},i=[];a.name&&i.push("name"),a.phone&&i.push("phone"),a.summary&&i.push("summary"),(m=a.skills)!=null&&m.length&&i.push(`${a.skills.length} skill${a.skills.length!==1?"s":""}`),(f=a.workHistory)!=null&&f.length&&i.push(`${a.workHistory.length} role${a.workHistory.length!==1?"s":""}`),(E=a.certifications)!=null&&E.length&&i.push(`${a.certifications.length} cert${a.certifications.length!==1?"s":""}`),(P=a.languages)!=null&&P.length&&i.push("languages");const l=i.length?`✓ Pre-filled from CV: ${i.join(", ")}. Review and save your profile.`:"✓ CV analysed. Review your profile and save.";$({candidate:s,message:l})})}function ci(e,t){var n,s,i,l,o;const a=(d,u)=>{const p=document.querySelector(d);p&&u&&t&&(p.value=u)};if(a('input[name="name"]',e.name),a('input[name="whatsapp"]',e.phone),a('textarea[name="summary"]',e.summary),(n=e.skills)!=null&&n.length){const d=document.querySelector("#selectedSkills");if(d){d.innerHTML="";const u=new Set([...d.querySelectorAll('input[name="skills"]')].map(c=>c.value.toLowerCase()));(s=d.querySelector(".skill-empty"))==null||s.remove(),[...new Set(e.skills.map(Ce).filter(Boolean))].forEach(c=>{if(u.has(c.toLowerCase()))return;u.add(c.toLowerCase());const m=document.createElement("span");m.className="selected-skill",m.setAttribute("data-skill-chip",c),m.innerHTML=`${C(c)}<button type="button" class="skill-remove" data-remove-skill="${k(c)}" aria-label="Remove ${k(c)}">×</button><input type="hidden" name="skills" value="${k(c)}" />`,d.appendChild(m)})}}if((i=e.workHistory)!=null&&i.length){const d=document.querySelector("#workEntries");if(d){d.innerHTML="";let u=d.querySelectorAll(".work-entry").length;e.workHistory.forEach(p=>{const c=document.createElement("div");c.innerHTML=Ot(u++,p),d.appendChild(c.firstElementChild)})}}if((l=e.languages)!=null&&l.length){const d=document.querySelector("#langEntries");if(d){d.innerHTML="";let u=d.querySelectorAll(".lang-entry").length;e.languages.forEach(p=>{const c=document.createElement("div");c.innerHTML=jt(u++,p),d.appendChild(c.firstElementChild)})}}if((o=e.certifications)!=null&&o.length){const d=document.querySelector("#certEntries");if(d){d.innerHTML="";let u=d.querySelectorAll(".cert-entry").length;e.certifications.forEach(p=>{const c=document.createElement("div");c.innerHTML=zt(u++,p),d.appendChild(c.firstElementChild)})}}de()}function di(e,t){var s,i,l,o,d;const a=[];e.name&&a.push("name"),e.phone&&a.push("phone"),(s=e.skills)!=null&&s.length&&a.push(`${e.skills.length} skill${e.skills.length>1?"s":""}`),(i=e.workHistory)!=null&&i.length&&a.push(`${e.workHistory.length} role${e.workHistory.length>1?"s":""}`),(l=e.certifications)!=null&&l.length&&a.push(`${e.certifications.length} cert${e.certifications.length>1?"s":""}`),(o=e.languages)!=null&&o.length&&a.push("languages"),(d=document.querySelector("#cvParseHint"))==null||d.remove();const n=document.createElement("p");n.id="cvParseHint",n.style.cssText="font-size:12px;color:var(--green);margin:4px 0 0;",n.innerHTML=a.length?`✓ Pre-filled: <strong>${a.join(", ")}</strong>. Review and save.`:"✓ CV analysed. Review your profile and save.",t.insertAdjacentElement("afterend",n)}function ui(){var d;const e=document.querySelector("[data-skill-search]");if(!e)return;const t=e.querySelector("#skillSearchInput"),a=e.querySelector("#skillSuggestions"),n=e.querySelector("#selectedSkills"),s=()=>[...n.querySelectorAll('input[name="skills"]')].map(u=>u.value),i=u=>{n.innerHTML=u.length?u.map(p=>`
      <span class="selected-skill" data-skill-chip="${k(p)}">
        ${C(p)}
        <button type="button" class="skill-remove" data-remove-skill="${k(p)}" aria-label="Remove ${k(p)}">×</button>
        <input type="hidden" name="skills" value="${k(p)}" />
      </span>`).join(""):'<span class="skill-empty">Selected skills will appear here.</span>'},l=()=>{const u=Z(t.value),p=t.value.trim(),c=new Set(s().map(Z)),m=ma.filter(T=>!c.has(Z(T))).filter(T=>!u||Z(T).includes(u)).slice(0,12),f=m.find(T=>Z(T)===u),P=p.length>1&&!c.has(Z(p))&&!f?`<button type="button" class="skill-suggestion add-custom" data-skill="${k(p)}">+ Add "${C(p)}"</button>`:"";a.innerHTML=P+m.map(T=>`<button type="button" class="skill-suggestion" data-skill="${k(T)}">${C(T)}</button>`).join("")},o=u=>{const p=(u||t.value).trim(),c=Ce(p);if(!c)return;const m=Z(c),f=s();if(f.length>=20&&!f.some(P=>Z(P)===m)){t.value="";return}const E=[...f.filter(P=>Z(P)!==m),c];i(E),t.value="",l(),K=!0};t==null||t.addEventListener("input",l),t==null||t.addEventListener("focus",l),t==null||t.addEventListener("keydown",u=>{if(u.key!=="Enter")return;u.preventDefault();const p=Z(t.value),c=[...a.querySelectorAll(".skill-suggestion:not(.add-custom)")].find(m=>Z(m.dataset.skill)===p);o((c==null?void 0:c.dataset.skill)||t.value)}),(d=e.querySelector("#addTypedSkill"))==null||d.addEventListener("click",()=>o(t.value)),a.addEventListener("click",u=>{const p=u.target.closest("[data-skill]");p&&o(p.dataset.skill)}),n.addEventListener("click",u=>{const p=u.target.closest("[data-remove-skill]");if(!p)return;const c=Z(p.dataset.removeSkill);i(s().filter(m=>Z(m)!==c)),l(),K=!0})}function _a(){if(r.loading)return Ys();if(r.view==="reset-password")return Tn();if(r.view==="dashboard"&&r.activePage==="onboarding")return Gn();if(r.view==="dashboard")return Aa();ka()}window.addEventListener("popstate",()=>{if(window.location.pathname==="/reset-password"){$({view:"reset-password",resetCodeStatus:null,resetCodeError:""});return}const e=gt();e==="overview"&&!r.user?$({view:"login",activePage:"overview",message:""}):r.view==="dashboard"?Ge(e,!1):We()});const vt=new URLSearchParams(window.location.search).get("ct");try{const e=new URLSearchParams(window.location.search),t=e.get("role"),a=e.get("roleTitle");(t||a)&&sessionStorage.setItem("nw_apply_role",JSON.stringify({code:t||"",title:a||t||""}))}catch{}vt&&window.history.replaceState({},"",window.location.pathname);let ot=!!vt;le?(Fa(U,e=>{if(!ot)if(e)ea(e);else{try{localStorage.removeItem("nw_talent_applied")}catch{}We()}}),window.setTimeout(()=>{r.loading&&!ot&&We()},2500),vt&&vn(vt).then(e=>{ot=!1,ea(e.user)}).catch(()=>{ot=!1,We()})):We();
