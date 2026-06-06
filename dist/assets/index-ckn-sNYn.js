import{initializeApp as e}from"https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";import{GoogleAuthProvider as t,createUserWithEmailAndPassword as n,getAuth as r,onAuthStateChanged as i,sendPasswordResetEmail as a,signInWithEmailAndPassword as o,signInWithPopup as s,signOut as c,updateProfile as l}from"https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";import{addDoc as u,arrayUnion as d,collection as f,doc as p,getDoc as m,getDocs as h,getFirestore as ee,limit as g,onSnapshot as te,query as _,serverTimestamp as v,setDoc as y,updateDoc as ne,where as b}from"https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";import{deleteObject as re,getDownloadURL as ie,getStorage as ae,ref as oe,uploadBytes as se}from"https://www.gstatic.com/firebasejs/10.12.5/firebase-storage.js";(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),e.crossOrigin===`use-credentials`?t.credentials=`include`:e.crossOrigin===`anonymous`?t.credentials=`omit`:t.credentials=`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var ce={apiKey:`AIzaSyApRNyW8PoP28E0x77dUB5jOgHuTqA2by4`,authDomain:`nearwork-97e3c.firebaseapp.com`,projectId:`nearwork-97e3c`,storageBucket:`nearwork-97e3c.firebasestorage.app`,messagingSenderId:`145642656516`,appId:`1:145642656516:web:0ac2da8931283121e87651`,measurementId:`G-3LC8N6FFSH`},x=Object.values(ce).slice(0,6).every(Boolean),S=x?e(ce):null,C=S?r(S):null,w=S?ee(S):null,T=S?ae(S):null,le=S?new t:null,E={users:`users`,candidates:`candidates`,openings:`openings`,pipelines:`pipelines`,applications:`applications`,assessments:`assessments`,activity:`candidateActivity`,notifications:`notifications`,notificationPreferences:`notificationPreferences`},ue=`https://admin.nearwork.co/api/send-email`;function D(){if(!S||!C||!w||!T)throw Error(`Missing Firebase environment variables. Copy .env.example to .env.local and fill in the Admin app config.`)}async function de(e={}){let t=String(e.email||C?.currentUser?.email||``).trim().toLowerCase();if(!t)return{ok:!1,skipped:!0,reason:`Missing candidate email`};let n=e.name||C?.currentUser?.displayName||``,r=e.firstName||n.split(/\s+/)[0]||`there`,i=await fetch(ue,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify({to:t,templateId:`account_created`,data:{name:n||r,firstName:r,actionUrl:`https://talent.nearwork.co`}})});return i.json().catch(()=>({ok:i.ok}))}async function fe(e={},t={}){let n=String(e?.email||C?.currentUser?.email||``).trim().toLowerCase();if(!n)return{ok:!1,skipped:!0,reason:`Missing candidate email`};let r=e?.name||C?.currentUser?.displayName||``,i=e?.firstName||r.split(/\s+/)[0]||`there`,a=await fetch(ue,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify({to:n,templateId:`job_applied`,data:{name:r||i,firstName:i,roleTitle:t.title||t.role||t.openingTitle||`this role`,openingCode:t.code||t.id||``,actionUrl:`https://talent.nearwork.co`}})});return a.json().catch(()=>({ok:a.ok}))}async function pe(e){D();let t=await m(p(w,E.users,e));return t.exists()?{id:t.id,...t.data()}:null}async function me(e){D();let t=String(e||``).trim(),n=t.toLowerCase(),r=await h(_(f(w,E.users),b(`email`,`==`,n),g(1)));if(!r.empty)return{id:r.docs[0].id,...r.docs[0].data()};if(t===n)return null;let i=await h(_(f(w,E.users),b(`email`,`==`,t),g(1)));return i.empty?null:{id:i.docs[0].id,...i.docs[0].data()}}async function he(e){let t=await pe(e.uid);if(t)return t;let n=await me(e.email);return n?(await O(e.uid,{...n,email:e.email,connectedFromUserId:n.id}),{...n,id:e.uid,connectedFromUserId:n.id}):null}async function O(e,t){D();let n={...t,role:`candidate`,updatedAt:v()};await y(p(w,E.users,e),n,{merge:!0}),M({...n,candidateCode:t.candidateCode||k(e),source:`talent.nearwork.co`}).catch(()=>null)}function k(e){return`CAND-${String(e||``).replace(/[^a-z0-9]/gi,``).slice(0,8).toUpperCase()||Date.now()}`}function ge(e){return String(e||``).toLowerCase().normalize(`NFD`).replace(/[\u0300-\u036f]/g,``).replace(/[^a-z0-9]+/g,`-`).replace(/^-|-$/g,``)}function A(e,t){let n=t.candidateCode||k(e),r=t.location||[t.locationCity||t.city,t.locationDepartment||t.department].filter(Boolean).join(`, `),i=new Date().toISOString().slice(0,10);return{code:n,uid:e,ownerUid:e,name:t.name||`Talent member`,role:t.targetRole||t.headline||`Nearwork candidate`,skills:Array.isArray(t.skills)?t.skills:[],applied:t.applied||i,lastContact:t.lastContact||i,experience:Number(t.experience||0),location:r,city:ge(t.locationCity||t.city||r),department:t.locationDepartment||t.department||``,country:t.locationCountry||`Colombia`,source:`talent.nearwork.co`,status:t.status||`active`,score:Number(t.score||50),email:t.email||``,phone:t.whatsapp||t.phone||``,whatsapp:t.whatsapp||t.phone||``,salary:t.salary||``,salaryUSD:Number(t.salaryUSD||0)||null,salaryAmount:Number(t.salaryAmount||t.expectedSalaryAmount||0)||null,salaryCurrency:t.salaryCurrency||t.expectedSalaryCurrency||`USD`,expectedSalaryAmount:Number(t.expectedSalaryAmount||t.salaryAmount||0)||null,expectedSalaryCurrency:t.expectedSalaryCurrency||t.salaryCurrency||`USD`,expectedSalary:t.expectedSalary||t.salary||``,availability:t.availability||`open`,english:t.english||``,visa:t.visa||`No`,linkedin:t.linkedin||``,cv:t.activeCvName||``,tags:t.tags||[`talent profile`],notes:t.summary||``,appliedBefore:!!t.appliedBefore,applications:t.applications||[],pipelineCodes:t.pipelineCodes||[],loom:t.loom||`Not uploaded`,assessments:t.assessments||[],work:t.work||[],updatedAt:v()}}async function _e(){D();let e=await s(C,le),t=await he(e.user),n={email:e.user.email,name:e.user.displayName||``,availability:`open`,onboarded:!1};t||(await O(e.user.uid,n),de(n).catch(()=>null));let r=k(e.user.uid),i={...t||n,candidateCode:r};return await y(p(w,E.candidates,r),A(e.user.uid,i),{merge:!0}).catch(()=>null),M({...i,candidateCode:r,source:`talent.nearwork.co`}).catch(()=>null),e.user}async function ve(e){D();let t=_(f(w,E.applications),b(`candidateId`,`==`,e),g(20)),n=_(f(w,E.applications),b(`ownerUid`,`==`,e),g(20)),r=await Promise.allSettled([h(t),h(n)]),i=new Map;return r.forEach(e=>{e.status===`fulfilled`&&e.value.docs.forEach(e=>i.set(e.id,{id:e.id,...e.data()}))}),Array.from(i.values()).sort((e,t)=>{let n=e=>e?.toDate?.()?.getTime()??(e?new Date(e).getTime():0);return n(t.updatedAt||t.createdAt)-n(e.updatedAt||e.createdAt)})}async function ye(e,t=``,n=``){D();let r=String(t||``).trim().toLowerCase(),i=String(n||``).trim(),a=[h(_(f(w,E.assessments),b(`candidateUid`,`==`,e),g(25))),h(_(f(w,E.assessments),b(`candidateId`,`==`,e),g(25)))];r&&a.push(h(_(f(w,E.assessments),b(`candidateEmail`,`==`,r),g(25)))),i&&a.push(h(_(f(w,E.assessments),b(`candidateCode`,`==`,i),g(25))));let o=await Promise.allSettled(a),s=new Map;return o.forEach(e=>{e.status===`fulfilled`&&e.value.docs.forEach(e=>s.set(e.id,{id:e.id,...e.data()}))}),Array.from(s.values()).sort((e,t)=>{let n=e=>e?.toDate?.()?.getTime()??(e?new Date(e).getTime():0);return n(t.updatedAt||t.createdAt||t.sentAt)-n(e.updatedAt||e.createdAt||e.sentAt)})}async function be(e,t,n=``,r=``){D();let i=await m(p(w,E.assessments,e));if(!i.exists())return null;let a={id:i.id,...i.data()},o=String(n||``).trim().toLowerCase(),s=String(r||``).trim();return a.candidateUid===t||a.candidateId===t||String(a.candidateEmail||``).trim().toLowerCase()===o||String(a.candidateCode||``).trim()===s?a:null}async function xe(e,t){D();let n=await m(p(w,E.assessments,e)),r=n.exists()?n.data():{};if(r.status===`completed`)throw Error(`This assessment is already completed.`);if(r.expiresAt&&Date.now()>new Date(r.expiresAt).getTime())throw Error(`This assessment link has expired.`);await y(p(w,E.assessments,e),{status:`started`,currentQuestionIndex:Number(r.currentQuestionIndex||0),currentStage:Number(r.currentStage||1),technicalStartedAt:r.technicalStartedAt||v(),startedAt:r.startedAt||v(),updatedAt:v()},{merge:!0})}async function j(e,t,n,r={}){D();let i=await m(p(w,E.assessments,e)),a=i.exists()?i.data():{};if(a.status===`completed`)throw Error(`This assessment is already completed.`);if(a.expiresAt&&Date.now()>new Date(a.expiresAt).getTime())throw Error(`This assessment link has expired.`);await y(p(w,E.assessments,e),{[`answers.${t}`]:n,progress:`${r.currentQuestionIndex||0}/${r.totalQuestions||``}`.replace(/\/$/,``),currentQuestionIndex:r.currentQuestionIndex||0,currentStage:r.currentStage||1,...r.discStartedAt?{discStartedAt:r.discStartedAt}:{},updatedAt:v()},{merge:!0})}async function Se(e,t,n={}){D();let r=p(w,E.assessments,e),i=await m(r),a=i.exists()?i.data():{};if(a.status===`completed`)throw Error(`This assessment is already completed.`);if(a.expiresAt&&Date.now()>new Date(a.expiresAt).getTime())throw Error(`This assessment link has expired.`);let o=Object.values(t||{}).filter(e=>String(e?.value??e??``).trim()).length,s=Number(n.totalQuestions||Object.keys(t||{}).length||0),c=Number(n.technicalScore||0),l=Number(n.discScore||0),u=Number(n.score||(s?Math.round(o/s*100):0));await y(r,{answers:t,answeredCount:o,totalQuestions:s,score:u,technical:c||u,disc:n.discProfile?.label||(l?`${l}%`:`Submitted`),discScore:l,discProfile:n.discProfile||null,progress:`${o}/${s}`,status:`completed`,finished:new Date().toLocaleString(`en-US`,{month:`short`,day:`numeric`,year:`numeric`,hour:`numeric`,minute:`2-digit`}),finishedAt:v(),updatedAt:v()},{merge:!0});let d=Math.round(u);a.candidateUid&&await y(p(w,E.users,a.candidateUid),{score:d,nwScore:d,lastAssessmentScore:d,lastAssessmentId:e,updatedAt:v()},{merge:!0}).catch(()=>null),a.candidateCode&&await y(p(w,E.candidates,a.candidateCode),{score:d,nwScore:d,lastAssessmentScore:d,lastAssessmentId:e,updatedAt:v()},{merge:!0}).catch(()=>null)}async function Ce(){return D(),(await h(_(f(w,E.openings),b(`published`,`==`,!0),g(12)))).docs.map(e=>({id:e.id,...e.data()}))}async function we(e,t){D();let n=t.code||t.id,r=await pe(e).catch(()=>null),i=r?.candidateCode||k(e),a=new Date().toISOString().slice(0,10),o={opening:n,openingCode:n,jobId:n,role:t.title||t.role||`Untitled role`,openingTitle:t.title||t.role||`Untitled role`,applied:a,appliedAt:a,status:`applied`,outcome:`Application only`,source:`talent.nearwork.co`},s={candidateId:e,ownerUid:e,authUid:e,candidateDocId:i,candidateCode:i,candidateEmail:r?.email||``,candidateName:r?.name||``,openingCode:n,jobId:n,openingTitle:t.title||t.role||`Untitled role`,jobTitle:t.title||t.role||`Untitled role`,title:t.title||t.role||`Untitled role`,clientName:t.orgName||t.clientName||t.company||`Nearwork client`,status:`applied`,inPipeline:!1,isMockData:!1,source:`talent.nearwork.co`,createdAt:v(),updatedAt:v()};await u(f(w,E.applications),s),await y(p(w,E.candidates,i),{...A(e,{...r||{},candidateCode:i,appliedBefore:!0,lastContact:a}),applications:d(o),appliedBefore:!0},{merge:!0}).catch(()=>null),await y(p(w,E.users,e),{role:`candidate`,candidateCode:i,code:i,applications:d(o),lastAppliedOpeningCode:n,lastAppliedAt:v(),updatedAt:v()},{merge:!0}).catch(()=>null),await u(f(w,E.activity),{candidateId:e,type:`application_submitted`,title:s.jobTitle,createdAt:v()}).catch(()=>null),fe(r,t).catch(()=>null)}async function Te(e,t){await ne(p(w,E.users,e),{availability:t,updatedAt:v()})}async function Ee(e,t){D();let n=t.candidateCode||k(e);await y(p(w,E.users,e),{...t,candidateCode:n,role:`candidate`,updatedAt:v()},{merge:!0});try{return await y(p(w,E.candidates,n),A(e,{...t,candidateCode:n}),{merge:!0}),M({...t,candidateCode:n,source:`talent.nearwork.co`}).catch(()=>null),{candidateCode:n,atsSynced:!0}}catch(e){return console.warn(`Candidate ATS sync failed.`,e),{candidateCode:n,atsSynced:!1}}}async function M(e){let t=e?.email||C.currentUser?.email||``;return t?(await fetch(`/api/sync-hubspot-candidate`,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify({candidate:{...e,email:t}})})).json().catch(()=>({ok:!1})):{ok:!1,skipped:!0}}async function De(e,t){D();let n=t.name.replace(/[^a-z0-9._-]/gi,`-`).toLowerCase(),r=oe(T,`candidate-photos/${e}/${Date.now()}-${n}`);await se(r,t,{contentType:t.type||`application/octet-stream`});let i=await ie(r);return await y(p(w,E.users,e),{photoURL:i,updatedAt:v()},{merge:!0}),i}async function Oe(e,t,n){D();let r=null;try{let t=await m(p(w,E.users,e));t.exists()&&(r=t.data().activeCvId||null)}catch{}let i=t.name.replace(/[^a-z0-9._-]/gi,`-`).toLowerCase(),a=`candidate-cvs/${e}/${Date.now()}-${i}`,o=oe(T,a);await se(o,t,{contentType:t.type||`application/octet-stream`});let s=await ie(o),c={id:a,name:n||t.name,fileName:t.name,url:s,uploadedAt:new Date().toISOString()};return await y(p(w,E.users,e),{cvLibrary:d(c),activeCvId:c.id,activeCvName:c.name||c.fileName,updatedAt:v()},{merge:!0}),r&&r!==a&&re(oe(T,r)).catch(()=>{}),c}function ke(e,t){return D(),e?te(_(f(w,E.notifications),b(`recipientUid`,`==`,e),g(50)),e=>{t(e.docs.map(e=>({id:e.id,...e.data()})).sort((e,t)=>{let n=e.createdAt?.toDate?e.createdAt.toDate().getTime():new Date(e.createdAt||0).getTime();return(t.createdAt?.toDate?t.createdAt.toDate().getTime():new Date(t.createdAt||0).getTime())-n}))}):()=>{}}async function Ae(e){D(),e&&await y(p(w,E.notifications,e),{read:!0,readAt:v()},{merge:!0})}async function je(e,t){D(),await y(p(w,E.notificationPreferences,e),{uid:e,app:`talent.nearwork.co`,preferences:t,updatedAt:v()},{merge:!0})}var Me=document.querySelector(`#app`),Ne=`+573135928691`,Pe=`https://wa.me/573135928691`,N={"Customer Success":[`Customer Success Manager`,`Customer Success Associate`,`Account Manager`,`Implementation Specialist`,`Onboarding Specialist`,`Renewals Manager`],Sales:[`SDR / Sales Development Rep`,`BDR / Business Development Rep`,`Account Executive`,`Sales Operations Specialist`,`Sales Manager`],Support:[`Technical Support Specialist`,`Customer Support Representative`,`Support Team Lead`,`QA Support Analyst`],Operations:[`Operations Manager`,`Operations Analyst`,`Executive Assistant`,`Virtual Assistant`,`Project Coordinator`,`Recruiting Coordinator`],Marketing:[`Marketing Ops / Content Specialist`,`Content Writer`,`SEO Specialist`,`Lifecycle Marketing Specialist`,`Social Media Manager`],Engineering:[`Software Developer (Full Stack)`,`Frontend Developer`,`Backend Developer`,`No-Code Developer`,`Data Analyst`,`QA Engineer`],Finance:[`Bookkeeper`,`Accounting Assistant`,`Financial Analyst`,`Payroll Specialist`]},Fe={"CRM & Sales":[`HubSpot`,`Salesforce`,`Pipedrive`,`Apollo`,`Outbound`,`Cold Email`,`Discovery Calls`,`CRM Hygiene`],"Customer Success":[`SaaS`,`Customer Success`,`QBRs`,`Onboarding`,`Renewals`,`Expansion`,`Churn Reduction`,`Intercom`,`Zendesk`],Support:[`Technical Support`,`Tickets`,`Troubleshooting`,`APIs`,`Bug Reproduction`,`Help Center`,`CSAT`],Operations:[`Excel`,`Google Sheets`,`Reporting`,`Process Design`,`Project Management`,`Notion`,`Airtable`,`Zapier`],Marketing:[`Content`,`SEO`,`Lifecycle`,`Email Marketing`,`HubSpot Marketing`,`Copywriting`,`Analytics`],Engineering:[`JavaScript`,`React`,`Node.js`,`SQL`,`Python`,`REST APIs`,`QA`,`GitHub`],Language:[`English B2`,`English C1`,`English C2`,`Spanish Native`]},Ie=`Account Management.Accounts Payable.Accounts Receivable.Adobe Creative Suite.Agile.AI Tools.Analytics.Appointment Setting.B2B Sales.B2C Sales.Billing.Bookkeeping.Business Analysis.Canva.Cash Collections.Chat Support.Cold Calling.Community Management.Compliance.Content Strategy.Contract Management.Customer Onboarding.Customer Retention.Customer Service.Data Analysis.Data Entry.Email Support.Excel / Google Sheets.Executive Assistance.Figma.Financial Reporting.Forecasting.Helpdesk.HR Operations.Inbound Calls.Insurance Support.Lead Generation.Live Chat.Logistics.Looker.Microsoft Office.NetSuite.Outbound Calls.Payroll.Performance Marketing.Power BI.Product Support.QuickBooks.Recruiting.Salesforce Administration.Sales Operations.Shopify.Slack.Social Media.SQL Reporting.Stripe.Tableau.Technical Writing.Ticket Quality.Training.Vendor Management.WordPress.Workday.Workforce Management.Zendesk Guide.Zoho`.split(`.`),Le=[...new Set([...Object.values(Fe).flat(),...Ie])].sort((e,t)=>e.localeCompare(t)),Re={Amazonas:[`Leticia`,`Puerto Nariño`],Antioquia:[`Medellín`,`Abejorral`,`Apartadó`,`Bello`,`Caldas`,`Caucasia`,`Copacabana`,`El Carmen de Viboral`,`Envigado`,`Girardota`,`Itagüí`,`La Ceja`,`La Estrella`,`Marinilla`,`Rionegro`,`Sabaneta`,`Santa Fe de Antioquia`,`Turbo`],Arauca:[`Arauca`,`Arauquita`,`Saravena`,`Tame`],Atlántico:[`Barranquilla`,`Baranoa`,`Galapa`,`Malambo`,`Puerto Colombia`,`Sabanalarga`,`Soledad`],"Bogotá D.C.":[`Bogotá`],Bolívar:[`Cartagena`,`Arjona`,`El Carmen de Bolívar`,`Magangué`,`Mompox`,`Turbaco`],Boyacá:[`Tunja`,`Chiquinquirá`,`Duitama`,`Paipa`,`Sogamoso`,`Villa de Leyva`],Caldas:[`Manizales`,`Aguadas`,`Chinchiná`,`La Dorada`,`Riosucio`,`Villamaría`],Caquetá:[`Florencia`,`El Doncello`,`Puerto Rico`,`San Vicente del Caguán`],Casanare:[`Yopal`,`Aguazul`,`Paz de Ariporo`,`Villanueva`],Cauca:[`Popayán`,`El Tambo`,`Puerto Tejada`,`Santander de Quilichao`],Cesar:[`Valledupar`,`Aguachica`,`Bosconia`,`Codazzi`],Chocó:[`Quibdó`,`Istmina`,`Nuquí`,`Tadó`],Córdoba:[`Montería`,`Cereté`,`Lorica`,`Sahagún`],Cundinamarca:[`Chía`,`Cajicá`,`Facatativá`,`Fusagasugá`,`Girardot`,`Madrid`,`Mosquera`,`Soacha`,`Tocancipá`,`Zipaquirá`],Guainía:[`Inírida`],Guaviare:[`San José del Guaviare`,`Calamar`,`El Retorno`,`Miraflores`],Huila:[`Neiva`,`Garzón`,`La Plata`,`Pitalito`],"La Guajira":[`Riohacha`,`Maicao`,`San Juan del Cesar`,`Uribia`],Magdalena:[`Santa Marta`,`Ciénaga`,`El Banco`,`Fundación`],Meta:[`Villavicencio`,`Acacías`,`Granada`,`Puerto López`],Nariño:[`Pasto`,`Ipiales`,`Tumaco`,`Túquerres`],"Norte de Santander":[`Cúcuta`,`Ocaña`,`Pamplona`,`Villa del Rosario`],Putumayo:[`Mocoa`,`Orito`,`Puerto Asís`,`Valle del Guamuez`],Quindío:[`Armenia`,`Calarcá`,`La Tebaida`,`Montenegro`,`Quimbaya`],Risaralda:[`Pereira`,`Dosquebradas`,`La Virginia`,`Santa Rosa de Cabal`],"San Andrés y Providencia":[`San Andrés`,`Providencia`],Santander:[`Bucaramanga`,`Barrancabermeja`,`Floridablanca`,`Girón`,`Piedecuesta`,`San Gil`],Sucre:[`Sincelejo`,`Corozal`,`Sampués`,`Tolú`],Tolima:[`Ibagué`,`Espinal`,`Honda`,`Melgar`],"Valle del Cauca":[`Cali`,`Buga`,`Buenaventura`,`Cartago`,`Jamundí`,`Palmira`,`Tuluá`,`Yumbo`],Vaupés:[`Mitú`],Vichada:[`Puerto Carreño`,`La Primavera`,`Santa Rosalía`]},P=Re,ze=[{title:`How to answer salary questions`,tag:`Interview`,read:`4 min`,body:`Use a confident range, anchor it to the role, and avoid apologizing for earning in USD.`,actions:[`Know your floor`,`Use monthly USD`,`Mention flexibility last`]},{title:`Writing a CV for US SaaS companies`,tag:`CV`,read:`6 min`,body:`Translate local experience into metrics US hiring managers can scan in under a minute.`,actions:[`Lead with outcomes`,`Add tools`,`Quantify scope`]},{title:`Before your recruiter screen`,tag:`Process`,read:`3 min`,body:`Prepare availability, compensation, English comfort, and two strong role stories.`,actions:[`Check your setup`,`Review the opening`,`Bring questions`]},{title:`STAR stories that feel natural`,tag:`Interview`,read:`5 min`,body:`Keep stories specific, concise, and tied to business impact instead of job duties.`,actions:[`Situation`,`Action`,`Result`]}],Be=[{key:`profile-review`,label:`Profile Review`,help:`We are checking role fit and your candidate profile.`},{key:`background-check`,label:`Background Checks`,help:`Nearwork is verifying relevant background and work details.`},{key:`assessment`,label:`Assessment`,help:`Complete role-specific questions when assigned.`},{key:`interview`,label:`Interview`,help:`Meet the recruiter and book your next conversation.`},{key:`presented`,label:`Presented`,help:`Your profile has been prepared for the company.`},{key:`client-review`,label:`Client Review`,help:`The company is reviewing your profile and next steps.`},{key:`hired`,label:`Hired`,help:`Offer accepted and onboarding is ready to begin.`}],F={user:null,candidate:null,applications:[],assessments:[],notifications:[],notificationPanelOpen:!1,notificationSettingsOpen:!1,jobs:[],loading:!0,view:`login`,activePage:`overview`,matchesFiltered:!1,message:``,assessmentUiStep:null},I=null,Ve=sessionStorage.getItem(`nw_restore_path`);Ve&&(sessionStorage.removeItem(`nw_restore_path`),window.history.replaceState({page:Ve},``,Ve));function He(){return[[`overview`,`layout-dashboard`,`Overview`],[`matches`,`briefcase-business`,`Matches`],[`applications`,`send`,`Applications`],[`assessment`,`clipboard-check`,`Assessment`],[`cvs`,`files`,`CV Picker`],[`tips`,`book-open`,`Tips`],[`recruiter`,`calendar-days`,`Recruiter`],[`profile`,`user-round-cog`,`Profile`]]}function L(){let e=window.location.pathname.split(`/`).filter(Boolean)[0];return e===`onboarding`?`onboarding`:e===`assessment`||e===`assessments`?`assessment`:He().some(([t])=>t===e)?e:`overview`}function R(){let e=window.location.pathname.split(`/`).filter(Boolean);return(e[0]===`assessment`||e[0]===`assessments`)&&e[1]||``}function Ue(){let e=window.location.pathname.split(`/`).filter(Boolean),t=e.findIndex(e=>e===`q`||e===`question`);if(t===-1)return null;let n=Number(e[t+1]);return Number.isFinite(n)&&n>0?n-1:null}function We(e,t=0){return`/assessment/${encodeURIComponent(e)}/start/q/${Number(t||0)+1}`}function z(e,t=0,n=!1){let r=We(e,t);if(window.location.pathname===r)return;let i=n?`replaceState`:`pushState`;window.history[i]({page:`assessment`,assessmentId:e,questionIndex:t},``,r)}function B(e,t){return`<i data-lucide="${e}" aria-label="${t||e}"></i>`}function Ge(){window.lucide&&window.lucide.createIcons()}function V(e){F={...F,...e},cn()}function H(e,t=!0){let n=e===`onboarding`||He().some(([t])=>t===e)?e:`overview`;F={...F,activePage:n,matchesFiltered:n===`matches`?F.matchesFiltered:!1,message:``,assessmentUiStep:null},t&&window.history.pushState({page:n},``,n===`overview`?`/`:`/${n}`),cn()}function Ke(){return(F.candidate?.name||F.user?.displayName||`there`).split(` `)[0]||`there`}function qe(){return(F.candidate?.name||F.user?.displayName||F.user?.email||`NW`).split(/[ @.]/).filter(Boolean).slice(0,2).map(e=>e[0]).join(``).toUpperCase()}function Je(e=`normal`){let t=F.candidate?.photoURL||F.user?.photoURL||``,n=e===`large`?`avatar avatar-large`:`avatar`;return t?`<img class="${n}" src="${U(t)}" alt="${U(Ke())}" />`:`<div class="${n}">${qe()}</div>`}function U(e){return String(e||``).replaceAll(`&`,`&amp;`).replaceAll(`"`,`&quot;`).replaceAll(`<`,`&lt;`).replaceAll(`>`,`&gt;`)}function Ye(e){if(!e)return`Recently`;let t=e.toDate?e.toDate():new Date(e);return new Intl.DateTimeFormat(`en`,{month:`short`,day:`numeric`}).format(t)}function W(){let e=F.candidate?.skills||[];return Array.isArray(e)?e:String(e).split(`,`).map(e=>e.trim()).filter(Boolean)}function G(e){return String(e||``).toLowerCase().normalize(`NFD`).replace(/[\u0300-\u036f]/g,``).replace(/&/g,` and `).replace(/[^a-z0-9]+/g,` `).trim().replace(/\s+/g,` `)}function Xe(e,t=W()){let n=J(e),r=new Set((n.skills||[]).map(G).filter(Boolean)),i=new Map(t.map(e=>[G(e),e]).filter(([e])=>e));return[...i.keys()].filter(e=>r.has(e)).map(e=>i.get(e))}function Ze(e){return[`Nearwork candidate`,`Talent member`].includes(String(e||``).trim())}function Qe(){return Xt()>=100}function $e(e){if(!e)return null;if(e.toDate)return e.toDate();if(typeof e==`object`&&typeof e.seconds==`number`)return new Date(e.seconds*1e3);let t=new Date(e);return Number.isNaN(t.getTime())?null:t}function et(e){return Number(e||1)===1?`Technical Assessment`:`DISC Assessment`}function tt(e,t){return e?.answers?.[t?.id]?.value??e?.answers?.[t?.id]??``}function K(e){return e!=null&&e!==``}function q(e,t){return(e?.questions||[]).slice(0,70).filter(e=>Number(e.stage||1)===Number(t))}function nt(e,t,n=e?.answers||{}){return q(e,t).filter(e=>!K(n[e.id]?.value??n[e.id]))}function rt(){return!!((F.applications||[]).length||(F.candidate?.pipelineCodes||[]).length||F.candidate?.pipelineCode)}function it(){let e=F.candidate?.department||`Bogotá D.C.`,t=P[e]||P[`Bogotá D.C.`]||[`Bogotá`],n=F.candidate?.city||F.candidate?.locationCity||t[0];return{department:e,city:n,label:`${n}, ${e}`}}async function at(){try{let e=await fetch(`/api/locations?ts=`+Date.now(),{cache:`no-store`}),t=await e.json();if(!e.ok||!t.ok||!t.departments)throw Error(t.error||`Location API unavailable`);P=t.departments}catch(e){console.warn(`Using bundled Colombia locations:`,e.message||e),P=Re}}function ot(){let e=F.candidate?.targetRole||F.candidate?.headline||``;return Object.entries(N).find(([,t])=>t.includes(e))?.[0]||Object.keys(N)[0]}function st(e){return Object.keys(N).map(t=>`<option value="${U(t)}" ${t===e?`selected`:``}>${t}</option>`).join(``)}function ct(e,t){let n=N[e]||Object.values(N).flat();return[`<option value="">Choose the closest role</option>`].concat(n.map(e=>`<option value="${U(e)}" ${t===e?`selected`:``}>${e}</option>`)).join(``)}function lt(e){let t=String(e||``).trim();return t?Le.find(e=>G(e)===G(t))||t.split(/\s+/).map(e=>e.length<=3&&e===e.toUpperCase()?e:e.charAt(0).toUpperCase()+e.slice(1).toLowerCase()).join(` `):``}function ut(e){return`
    <div class="skill-search-shell" data-skill-search>
      <div class="selected-skills" id="selectedSkills">
        ${[...new Set((e||[]).map(lt).filter(Boolean))].map(e=>`
          <span class="selected-skill" data-skill-chip="${U(e)}">
            ${escapeHtml(e)}
            <button type="button" class="skill-remove" data-remove-skill="${U(e)}" aria-label="Remove ${U(e)}">×</button>
            <input type="hidden" name="skills" value="${U(e)}" />
          </span>
        `).join(``)||`<span class="skill-empty">Selected skills will appear here.</span>`}
      </div>
      <div class="skill-search-box">
        <input id="skillSearchInput" type="search" autocomplete="off" placeholder="Search skills like Salesforce, payroll, React, B2B sales..." />
        <button class="secondary-action" type="button" id="addTypedSkill">Add skill</button>
      </div>
      <div class="skill-suggestions" id="skillSuggestions">
        ${[`Customer Service`,`Salesforce`,`HubSpot`,`Excel`,`Google Sheets`,`Technical Support`,`Outbound Calls`,`React`,`SQL`,`Payroll`].map(e=>`<button type="button" class="skill-suggestion" data-skill="${U(e)}">${escapeHtml(e)}</button>`).join(``)}
      </div>
      <p class="field-hint">Search, select, and remove skills anytime. Use as many as apply to your experience.</p>
    </div>
  `}function dt(e,t=`USD`){let n=Number(String(e||``).replace(/[^\d.]/g,``)),r=String(t||`USD`).toUpperCase()===`COP`?`COP`:`USD`;if(!Number.isFinite(n)||n<=0)return{salary:``,salaryUSD:null,salaryCurrency:r,salaryAmount:null};let i=Math.round(n);return{salary:`${r} ${new Intl.NumberFormat(`en-US`).format(i)}/mo`,salaryUSD:r===`USD`?i:null,salaryCurrency:r,salaryAmount:i}}function ft(e){return Number(String(e||``).replace(/[^\d.]/g,``))}function pt(e,t=`USD`){let n=ft(e),r=String(t||`USD`).toUpperCase()===`COP`?`COP`:`USD`;return r===`USD`&&n>=1e5?`COP`:r}function mt(e,t=`USD`){let n=ft(e);return!Number.isFinite(n)||n<=0?``:new Intl.NumberFormat(`en-US`,{maximumFractionDigits:0}).format(Math.round(n))}function ht(e){return Array.isArray(e)?e:String(e||``).split(`,`).map(e=>e.trim()).filter(Boolean)}function J(e){let t=ht(e.skills||e.requiredSkills);return{id:e.id||e.code,code:e.code||e.id,title:e.title||e.role||e.openingTitle||`Open role`,orgName:e.orgName||e.company||e.clientName||`Nearwork client`,location:e.location||`Remote`,compensation:e.compensation||e.salary||e.rate||`Competitive`,match:e.match||null,skills:t,description:e.description||e.about||`Nearwork is reviewing candidates for this role now.`}}function Y(e){let t=e?.code||``;return t.includes(`operation-not-allowed`)?`This sign-in method is not available yet.`:t.includes(`unauthorized-domain`)?`This website still needs to be approved for sign-in.`:t.includes(`permission-denied`)?`We could not save this yet. Please try again in a moment or contact Nearwork support.`:t.includes(`weak-password`)?`Password must be at least 6 characters.`:t.includes(`invalid-credential`)||t.includes(`wrong-password`)?`That email/password did not match. If this account was created with Google, use Continue with Google.`:t.includes(`user-not-found`)?`No account exists for that email yet.`:t.includes(`email-already-in-use`)?`That email already has an account. Sign in or use Google.`:t.includes(`popup`)?`The Google sign-in popup was closed before finishing.`:`Something went wrong. Please try again or contact Nearwork support.`}function gt(e){Me.innerHTML=`
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
  `,Ge()}function _t(e=`login`){let t=e===`signup`;gt(`
    <section class="auth-panel">
      <div class="right-brand">Near<span>work</span></div>
      <div class="candidate-chip">For candidates</div>
      <div class="panel-heading">
        <h2>${t?`Create your account.`:`Welcome back.`}</h2>
        <p>${t?`Create your profile, browse roles, and track your application.`:`Use Google if your candidate account was created with Google.`}</p>
      </div>
      ${F.message?`<div class="notice">${B(`lock`)} ${U(F.message)}</div>`:``}
      ${x?``:`<div class="notice">${B(`triangle-alert`)} Sign-in is still being set up.</div>`}
      <button id="googleSignIn" class="social-action" type="button">
        <span class="google-dot">G</span>
        Continue with Google
      </button>
      <div class="divider"><span></span>or use email<span></span></div>
      <form id="authForm" class="stacked-form">
        ${t?`<label>Full name<input name="name" type="text" autocomplete="name" placeholder="Full name" required /></label>`:``}
        <label>Email<input name="email" type="email" autocomplete="email" placeholder="you@example.com" required /></label>
        <label>Password<input name="password" type="password" autocomplete="${t?`new-password`:`current-password`}" minlength="6" placeholder="••••••••" required /></label>
        <button class="primary-action" type="submit">${B(t?`user-plus`:`log-in`)} ${t?`Create account`:`Sign in`}</button>
        <p id="formMessage" class="form-message" role="status"></p>
      </form>
      ${t?``:`<button id="resetPassword" class="text-action small" type="button">Forgot password?</button>`}
      <button id="toggleMode" class="text-action" type="button">${t?`Already have an account? Sign in`:`New or invited by Nearwork? Create your profile`}</button>
    </section>
  `),document.querySelector(`#toggleMode`).addEventListener(`click`,()=>_t(t?`login`:`signup`)),document.querySelector(`#googleSignIn`).addEventListener(`click`,async()=>{let e=document.querySelector(`#formMessage`);e.textContent=``;try{await _e()}catch(t){e.textContent=Y(t)}}),document.querySelector(`#resetPassword`)?.addEventListener(`click`,async()=>{let e=document.querySelector(`input[name='email']`).value.trim().toLowerCase(),t=document.querySelector(`#formMessage`);if(!e){t.textContent=`Enter your email first, then request a reset link.`;return}try{await a(C,e),t.textContent=`Password reset sent to ${e}.`}catch(e){t.textContent=Y(e)}}),document.querySelector(`#authForm`).addEventListener(`submit`,async e=>{e.preventDefault();let r=new FormData(e.currentTarget),i=document.querySelector(`#formMessage`),a=String(r.get(`email`)).trim().toLowerCase();i.textContent=``;try{if(t){let e=await n(C,a,r.get(`password`));await l(e.user,{displayName:r.get(`name`)}),sessionStorage.setItem(`nw_new_account`,`1`),await O(e.user.uid,{name:r.get(`name`),email:a,availability:`open`,headline:`Nearwork candidate`,onboarded:!1,source:`talent.nearwork.co`}),de({name:r.get(`name`),firstName:String(r.get(`name`)||``).trim().split(/\s+/)[0],email:a}).catch(()=>null)}else await o(C,a,r.get(`password`))}catch(e){i.textContent=Y(e)}})}async function vt(e){V({loading:!0,user:e});try{await at();let[t,n,r]=await Promise.allSettled([he(e),ve(e.uid),Ce()]),i=t.status===`fulfilled`?t.value:null,a=n.status===`fulfilled`?n.value:[],o=r.status===`fulfilled`?r.value:[],s=[];try{s=await ye(e.uid,e.email,i?.candidateCode||i?.code||``)}catch(e){console.warn(e)}let c=R();if(c&&!s.some(e=>e.id===c)){let t=await be(c,e.uid,e.email,i?.candidateCode||i?.code||``).catch(()=>null);t&&(s=[t,...s])}let l=sessionStorage.getItem(`nw_new_account`)===`1`;l&&sessionStorage.removeItem(`nw_new_account`);let u=l&&i?.onboarded!==!0?`onboarding`:L();V({candidate:{...i||{},name:i?.name||e.displayName||`Talent member`,email:i?.email||e.email,availability:i?.availability||`open`,headline:i?.headline||i?.targetRole||`Nearwork candidate`},applications:a,assessments:s,jobs:o.map(J),loading:!1,view:`dashboard`,activePage:u,message:``}),I&&I(),x&&(I=ke(e.uid,e=>{F.notifications=e,F.view===`dashboard`&&yt()}))}catch(t){console.warn(t),V({candidate:{name:e.displayName||`Talent member`,email:e.email,availability:`open`,headline:`Nearwork candidate`},applications:[],assessments:[],jobs:[],loading:!1,view:`dashboard`,activePage:L(),message:``})}}async function X(){let e=L();if(e===`assessment`){sessionStorage.setItem(`nw_restore_path`,window.location.pathname),V({user:null,candidate:null,applications:[],assessments:[],jobs:[],loading:!1,view:`login`,activePage:`overview`,message:`Please log in to open your assessment.`});return}if(e===`overview`){I&&I(),I=null,V({user:null,candidate:null,loading:!1,view:`login`,activePage:`overview`});return}let t=[];try{let e=await Ce();e.length&&(t=e.map(J))}catch(e){console.warn(e)}V({user:null,candidate:null,applications:[],assessments:[],jobs:t,loading:!1,view:`login`,activePage:`overview`,message:`Please log in to view your profile, matched openings, applications, and assessments.`})}function yt(){let e=(F.notifications||[]).filter(e=>!e.read).length;Me.innerHTML=`
    <main class="dashboard">
      <aside class="sidebar">
        <div class="brand-top"><button class="wordmark wordmark-button" type="button" data-dashboard-home>Near<span>work</span></button></div>
        <div class="candidate-card">
          ${Je()}
          <strong>${F.candidate?.name||F.user?.displayName||`Talent member`}</strong>
          <span>${F.candidate?.headline||F.candidate?.targetRole||`Nearwork candidate`}</span>
        </div>
        <nav>
          ${He().map(([e,t,n])=>`
            <button class="${F.activePage===e?`active`:``}" data-page="${e}">${B(t)} ${n}</button>
          `).join(``)}
          <a class="sidebar-jobs-link" href="https://jobs.nearwork.co" target="_blank" rel="noreferrer">${B(`external-link`)} Browse Jobs</a>
        </nav>
        <button id="${F.user?`signOut`:`signIn`}" class="ghost-action">${B(F.user?`log-out`:`log-in`)} ${F.user?`Sign out`:`Sign in`}</button>
      </aside>
      <section class="workspace">
        <header class="topbar">
          <div><p class="eyebrow">Candidate workspace</p><h1>${Tt()}</h1></div>
          <div class="topbar-actions">
            <div class="notification-wrap">
              <button class="icon-action" type="button" id="notificationBell" aria-label="Notifications">${B(`bell`)}${e?`<span>${e}</span>`:``}</button>
              ${F.notificationPanelOpen?xt():``}
            </div>
            <button class="icon-action" type="button" id="notificationSettings" aria-label="Notification settings">${B(`settings`)}</button>
            <label class="availability">Availability
              <select id="availability">
                ${[`open`,`interviewing`,`paused`].map(e=>`<option value="${e}" ${F.candidate?.availability===e?`selected`:``}>${e}</option>`).join(``)}
              </select>
            </label>
          </div>
        </header>
        ${F.notificationSettingsOpen?St():``}
        ${F.message?`<div class="notice">${F.message}</div>`:``}
        ${(()=>{try{return Et()}catch(e){return console.error(`renderActivePage error:`,e),`<div class="notice">Page failed to render. <button type="button" data-page="overview">Go to overview</button></div>`}})()}
      </section>
    </main>
  `,Ge(),on(),wt(),Ct()}function bt(e){return(e?.toDate?e.toDate():new Date(e||Date.now())).toLocaleString(`en-US`,{month:`short`,day:`numeric`,year:`numeric`,hour:`numeric`,minute:`2-digit`})}function xt(){let e=(F.notifications||[]).slice(0,10);return`
    <div class="notification-panel">
      <div class="notification-panel-head"><strong>Notifications</strong><span>${e.length?`Latest updates`:`All clear`}</span></div>
      ${e.length?e.map(e=>`
        <button class="notification-item ${e.read?``:`unread`}" type="button" data-notification-read="${e.id}">
          <strong>${U(e.title||`Nearwork update`)}</strong>
          <span>${U(e.message||``)}</span>
          <time>${bt(e.createdAt)}</time>
        </button>
      `).join(``):`<div class="notification-empty">No notifications yet.</div>`}
    </div>
  `}function St(){let e=F.candidate?.notificationPreferences||{};return`
    <section class="notification-settings-card">
      <div class="section-heading"><div><p class="eyebrow">Settings</p><h2>Notification preferences</h2></div></div>
      <div class="notification-settings-grid">
        ${[[`recruitmentUpdates`,`Recruitment updates`],[`assessmentUpdates`,`Assessment updates`],[`mentions`,`Mentions`],[`openingMovement`,`Opening movement`],[`jobAlerts`,`Similar role alerts`]].map(([t,n])=>{let r=e[t]||{};return`<div class="notification-setting-row">
            <strong>${n}</strong>
            <label><input type="checkbox" data-notification-pref="${t}" data-channel="app" ${r.app===!1?``:`checked`}> In-app</label>
            <label><input type="checkbox" data-notification-pref="${t}" data-channel="email" ${r.email===!1?``:`checked`}> Email</label>
          </div>`}).join(``)}
      </div>
      <p class="field-hint">Email notifications are grouped with a 2-hour buffer. The bell always keeps the detailed history with date and time.</p>
    </section>
  `}var Z=null;function Ct(){Z&&window.clearInterval(Z);let e=document.querySelector(`#assessmentTimer`);if(!e)return;let t=new Date(e.dataset.end||``).getTime(),n=()=>{let n=Math.max(0,t-Date.now()),r=Math.floor(n/1e3);e.textContent=`${Math.floor(r/60)}:${String(r%60).padStart(2,`0`)}`,e.classList.toggle(`is-low`,n<=600*1e3),n<=0&&window.clearInterval(Z)};n(),Z=window.setInterval(n,1e3)}function wt(){if(F.activePage!==`assessment`)return;let e=F.assessments||[],t=R(),n=(t?e.find(e=>e.id===t):null)||e.find(e=>[`sent`,`started`].includes(String(e.status||``).toLowerCase()));if(!n?.id)return;let r=String(n.status||``).toLowerCase();if(r===`started`&&Ue()===null){z(n.id,Number(n.currentQuestionIndex||0),!0);return}if(!t&&r===`sent`){let e=`/assessment/${encodeURIComponent(n.id)}/start`;window.history.replaceState({page:`assessment`,assessmentId:n.id},``,e)}}function Tt(){return{onboarding:`Complete your candidate profile`,overview:`Hi ${Ke()}, here's your process`,matches:`Role matches`,applications:`Application pipeline`,assessment:`Assessment center`,cvs:`CV picker`,tips:`Interview tips`,recruiter:`Your recruiter`,profile:`Candidate profile`}[F.activePage]||`Talent`}function Et(){return({onboarding:Ot,overview:Dt,matches:kt,applications:At,assessment:jt,cvs:Gt,tips:Kt,recruiter:qt,profile:Jt}[F.activePage]||Dt)()}function Dt(){let e=Qe(),t=rt(),n=F.jobs.length;return`
    ${e?``:`
      <section class="hero-card">
        <div><p class="eyebrow">Action needed</p><h2>Finish your profile to unlock matches.</h2><p>Add your role, city, salary, and skills so Nearwork can match you to the right openings.</p></div>
        <button class="primary-action fit" type="button" data-page="profile">${B(`arrow-right`)} Complete profile</button>
      </section>
    `}
    <section class="summary-grid">
      ${Q(`Profile readiness`,`${Xt()}%`,`sparkles`)}
      ${Q(`Open roles`,n,`briefcase-business`)}
      ${Q(`Applications`,F.applications.length,`send`)}
      ${Q(`CVs saved`,(F.candidate?.cvLibrary||[]).length,`files`)}
    </section>
    <section class="content-grid">
      <div class="section-block"><div class="section-heading"><div><p class="eyebrow">Now</p><h2>${t?`Talent pipeline`:`Find your next opening`}</h2></div></div>${t?Qt(Zt()):$t()}</div>
      <div class="section-block compact"><div class="section-heading"><div><p class="eyebrow">Recruiter</p><h2>Need help?</h2></div></div>${rn()}</div>
    </section>
  `}function Ot(){return`
    <section class="onboarding-hero">
      <div>
        <p class="eyebrow">New candidate setup</p>
        <h2>Tell Nearwork what role, city, salary, and skills fit you best.</h2>
        <p>This only appears as a first-run setup. After you submit it, you will land in the Talent workspace.</p>
      </div>
    </section>
    ${Yt(`onboarding`)}
  `}function kt(){let e=F.candidate?.targetRole||(Ze(F.candidate?.headline)?``:F.candidate?.headline),t=W(),n=F.jobs.map(J).filter(e=>Xe(e,t).length>=3),r=t.length>=3,i=F.matchesFiltered&&r?n:F.jobs.map(J),a=F.matchesFiltered&&!n.length;return`
    <section class="section-block">
      <div class="section-heading">
        <div><p class="eyebrow">Openings</p><h2>${F.matchesFiltered?`Best fit from your profile`:`All current openings`}</h2></div>
        <button id="filterMatches" class="secondary-action" type="button">${B(F.matchesFiltered?`list`:`filter`)} ${F.matchesFiltered?`Show all openings`:`Filter by my role & skills`}</button>
      </div>
      <div class="match-note"><strong>${i.length}</strong> of <strong>${F.jobs.length}</strong> openings showing. Matches require <strong>3+ shared skills</strong>. Role: <strong>${e||`not set`}</strong>. Skills: <strong>${t.join(`, `)||`not set`}</strong>.</div>
      <div class="job-list">${a?$(`No filtered matches yet`,`Add a target role and skills in Profile to improve matching.`):i.map(e=>tn(e)).join(``)}</div>
    </section>
  `}function At(){return`
    <section class="section-block">
      <div class="section-heading"><div><p class="eyebrow">Pipeline</p><h2>Your applications</h2></div></div>
      ${rt()?Qt(Zt()):$t()}
      <div class="timeline page-gap">${F.applications.length?F.applications.map(nn).join(``):$(`No applications yet`,`Apply to a role and your process will show here.`)}</div>
    </section>
  `}function jt(){let e=R(),t=F.assessments||[],n=t.filter(e=>[`sent`,`started`].includes(String(e.status||``).toLowerCase())),r=t.filter(e=>String(e.status||``).toLowerCase()===`completed`),i=e?t.find(t=>t.id===e):n[0]||r[0]||null;if(F.assessmentUiStep===`techIntro`&&i)return Rt(i);if(F.assessmentUiStep===`discIntro`&&i)return zt(i);if(e&&!i)return`
      <div class="nw-assess-wrap nw-assess-state-page">
        <div class="nw-assess-state-card">
          <div class="nw-assess-state-icon" style="background:#FEF0F5;color:#CC3666">${B(`link-2-off`)}</div>
          <strong>This link isn't available</strong>
          <p>Make sure you're logged into the same account that received the assessment email. If the problem persists, reach out to your Nearwork recruiter.</p>
          <button class="primary-action fit" data-page="recruiter" type="button">${B(`message-circle`)} Contact support</button>
        </div>
      </div>
    `;if(!i)return`
      <div class="nw-assess-wrap nw-assess-state-page">
        <div class="nw-assess-state-card">
          <div class="nw-assess-state-icon">${B(`inbox`)}</div>
          <strong>No assessment assigned yet</strong>
          <p>Your assessment will appear here when Nearwork sends it. You'll receive an email notification when it's ready.</p>
          <div class="nw-assess-info-row">
            <div class="nw-assess-info-item">${B(`shield-check`)}<span>One attempt</span></div>
            <div class="nw-assess-info-item">${B(`timer`)}<span>~45–90 min</span></div>
            <div class="nw-assess-info-item">${B(`users`)}<span>Recruiter reviewed</span></div>
          </div>
        </div>
      </div>
    `;let a=Array.isArray(i.questions)?i.questions:[],o=String(i.status||``).toLowerCase()===`started`,s=String(i.status||``).toLowerCase()===`completed`,c=String(i.status||``).toLowerCase()===`cancelled`,l=Lt(i),u=Ue(),d=Number(i.currentQuestionIndex||0),f=Math.min(u??d,Math.max(a.length-1,0)),p=a[f]?.stage||i.currentStage||1,m=o&&!s&&!c&&!l;return`
    <div class="nw-assess-wrap">
      ${m?Pt(i,p,f,a):Mt(i)}
      ${m?Nt(i,f):``}
      <div class="nw-assess-body" id="assessmentWorkspace">
        ${s?Bt(i):c?`<div class="nw-assess-state-card nw-assess-state-card--inline"><div class="nw-assess-state-icon" style="background:#F5F4F0;color:#555">${B(`ban`)}</div><strong>Assessment cancelled</strong><p>This assessment is no longer available. A new assigned assessment will appear here when your recruiter sends one.</p></div>`:l?`<div class="nw-assess-state-card nw-assess-state-card--inline"><div class="nw-assess-state-icon" style="background:#FEF0F5;color:#CC3666">${B(`clock-x`)}</div><strong>Assessment link expired</strong><p>This unique assessment link is no longer valid. Contact your Nearwork recruiter if you need a new one.</p><button class="ghost-action" data-page="recruiter" type="button">${B(`message-circle`)} Contact recruiter</button></div>`:Ft(i,o,f)}
      </div>
      ${Vt(t,i.id)}
    </div>
  `}function Mt(e){let t=String(e.status||``).toLowerCase();return`
    <div class="nw-assess-chrome">
      <div class="nw-assess-chrome__logo">
        <div class="nw-assess-chrome__logotile">N</div>
        <span class="nw-assess-chrome__brand">Nearwork</span>
        <div class="nw-assess-chrome__divider"></div>
        <span class="nw-assess-chrome__sub">Candidate assessment</span>
      </div>
      <div style="flex:1"></div>
      ${[`completed`,`cancelled`].includes(t)?``:`<button class="nw-assess-chrome__exit" type="button">${B(`x`)} Save &amp; exit</button>`}
    </div>
  `}function Nt(e,t){let n=(e.questions||[]).slice(0,70),r=q(e,1).filter(t=>K(tt(e,t))).length,i=q(e,2).filter(t=>K(tt(e,t))).length;return`
    <section class="assessment-progress-panel">
      <div><strong>Technical</strong><span>${r}/${q(e,1).length||50} answered</span></div>
      <div><strong>DISC</strong><span>${i}/${q(e,2).length||20} answered</span></div>
      <div class="assessment-progress-strip">
        ${n.map((n,r)=>{let i=K(tt(e,n));return`<button type="button" class="${r===t?`active`:``} ${i?`answered`:``}" data-assessment-jump="${r}" title="${et(n.stage)} · Q${r+1}">${r+1}</button>`}).join(``)}
      </div>
    </section>
  `}function Pt(e,t,n,r){let i=Number(t||1),a=$e(e.technicalStartedAt||e.startedAt)||new Date,o=$e(e.discStartedAt)||new Date,s=i===1?a:o,c=Number(i===1?e.technicalMinutes||60:e.discMinutes||30),l=new Date(s.getTime()+c*60*1e3),u=i===1?`Technical`:`DISC profile`,d=(r||[]).filter(e=>Number(e.stage||1)===i),f=(r||[]).findIndex(e=>Number(e.stage||1)===i),p=Math.max(0,n-f),m=d.length?Math.round((p+1)/d.length*100):2;return`
    <div class="nw-assess-chrome nw-assess-chrome--active">
      <div class="nw-assess-chrome__logo">
        <div class="nw-assess-chrome__logotile">N</div>
        <span class="nw-assess-chrome__brand">Nearwork</span>
        <div class="nw-assess-chrome__divider"></div>
        <span class="nw-assess-chrome__sub">Candidate assessment</span>
      </div>
      <div class="nw-assess-chrome__center">
        <div class="nw-assess-chrome__section">
          ${B(`clipboard-check`)}
          <span>${u} &middot; Question ${p+1} of ${d.length||(i===1?50:20)}</span>
        </div>
        <div class="nw-assess-chrome__progresstrack">
          <div class="nw-assess-chrome__progressfill" style="width:${Math.max(2,m)}%"></div>
        </div>
      </div>
      <div class="nw-timer-pill">
        ${B(`timer`)}
        <span id="assessmentTimer" data-end="${l.toISOString()}">${c}:00</span>
      </div>
      <button class="nw-assess-chrome__exit" type="button">${B(`x`)} Save &amp; exit</button>
    </div>
  `}function Ft(e,t,n=null){if(!t){let t=U(e.role||`Role assessment`),n=U(e.recruiterName||e.recruiter||`Nearwork`),r=Ye(e.expiresAt||e.deadline),i=q(e,1).length||50,a=q(e,2).length||20,o=Number(e.technicalMinutes||60),s=Number(e.discMinutes||30);return`
      <div class="nw-assess-welcome">
        <div class="nw-assess-welcome__header">
          <span class="nw-assess-role-chip">${B(`sparkles`)} ${t}</span>
          <span>Sent by ${n}${r?` &middot; expires `+r:``}</span>
        </div>
        <h2 class="nw-assess-welcome__title">Let's see how you think — and how you work.</h2>
        <p class="nw-assess-welcome__desc">This assessment has two parts: a role-knowledge check and a behavioral profile.</p>
        <div class="nw-assess-parts">
          <div class="nw-assess-part">
            <div class="nw-assess-part__blob" style="background:#E8F8F5"></div>
            <div class="nw-assess-part__icon" style="background:#E8F8F5;color:#16A085">${B(`code-2`)}</div>
            <span class="nw-assess-part__tag" style="color:#16A085">Part 1</span>
            <strong class="nw-assess-part__title">Technical Assessment</strong>
            <span class="nw-assess-part__sub">${i} questions &middot; ~${o} min</span>
            <p class="nw-assess-part__desc">Single-choice role scenarios. We're looking at how you think, not whether you remember definitions.</p>
          </div>
          <div class="nw-assess-part">
            <div class="nw-assess-part__blob" style="background:#F7F2FC"></div>
            <div class="nw-assess-part__icon" style="background:#F7F2FC;color:#AF7AC5">${B(`compass`)}</div>
            <span class="nw-assess-part__tag" style="color:#AF7AC5">Part 2</span>
            <strong class="nw-assess-part__title">DISC Profile</strong>
            <span class="nw-assess-part__sub">${a} statements &middot; ~${s} min</span>
            <p class="nw-assess-part__desc">How you work, communicate, and lead under pressure. No right or wrong answers.</p>
          </div>
        </div>
        <div class="nw-assess-rules">
          <div class="nw-assess-rule"><div class="nw-assess-rule__icon">${B(`wifi`)}</div><div><strong>Stable connection</strong><span>Progress saves on every answer.</span></div></div>
          <div class="nw-assess-rule"><div class="nw-assess-rule__icon">${B(`timer`)}</div><div><strong>Timed sections</strong><span>A countdown runs per stage.</span></div></div>
          <div class="nw-assess-rule"><div class="nw-assess-rule__icon">${B(`lock`)}</div><div><strong>One attempt</strong><span>Take it when you can give it your full focus.</span></div></div>
          <div class="nw-assess-rule"><div class="nw-assess-rule__icon">${B(`eye-off`)}</div><div><strong>No proctoring</strong><span>No camera or screen recording.</span></div></div>
        </div>
        <div class="nw-assess-welcome__cta">
          <button class="primary-action" id="showTechIntro" type="button">${B(`arrow-right`)} Begin assessment</button>
          <span>Questions are timed. Open when you're ready to focus.</span>
        </div>
      </div>
    `}let r=(e.questions||[]).slice(0,70),i=Math.min(n??Number(e.currentQuestionIndex||0),Math.max(r.length-1,0)),a=r[i],o=e.answers?.[a.id]?.value??e.answers?.[a.id]??``,s=Array.isArray(a.options)&&a.options.length?a.options:[`Strongly agree`,`Agree`,`Neutral`,`Disagree`],c=r[i+1]?.stage,l=c&&c!==a.stage,u=nt(e,a.stage),d=l&&u.length,f=i+1>=r.length,p=f?nt(e,a.stage):[],m=!!a.multiple,h=Number(a.stage||1)===2?`nw-assess-chip--violet`:`nw-assess-chip--teal`,ee=m?`Multi-select`:`Single choice`,g=U(a.part||a.type||(Number(a.stage||1)===2?`DISC`:`Scenario`)),te=U(a.bank||``);return`
    <form id="assessmentQuestionForm" class="nw-assess-qcard" data-current-index="${i}">
      <div class="nw-assess-qmeta">
        <span class="nw-assess-chip ${h}">${g}</span>
        ${te?`<span class="nw-assess-chip nw-assess-chip--gray">${te}</span>`:``}
        <span class="nw-assess-qtype">&middot; ${ee}</span>
      </div>
      ${a.context?`<div class="nw-assess-context"><strong>Context: </strong>${U(a.context)}</div>`:``}
      <p class="nw-assess-qprompt">${U(a.q||``)}</p>
      <fieldset class="nw-assess-options${m?` nw-assess-options--multi`:``}">
        <legend>${ee}</legend>
        ${s.map((e,t)=>`
          <label class="nw-assess-option${m?` nw-assess-option--multi`:``}">
            <input type="radio" name="answer" value="${t}" ${String(o)===String(t)?`checked`:``} />
            <span class="nw-assess-option__key">${String.fromCharCode(65+t)}</span>
            <span class="nw-assess-option__text">${U(e)}</span>
            ${m?``:`<span class="nw-assess-option__check">${B(`check-circle-2`)}</span>`}
          </label>
        `).join(``)}
      </fieldset>
      ${d||p.length?It(e,d?u:p,a.stage):``}
      <div class="nw-assess-qfooter">
        <button class="ghost-action" id="prevAssessmentQuestion" type="button" ${i===0?`disabled`:``}>${B(`arrow-left`)} Back</button>
        <span class="nw-assess-autosave">${B(`check`)} Auto-saved</span>
        <div style="flex:1"></div>
        <button class="primary-action fit" type="submit">${f?B(`send`)+` Submit assessment`:`Next `+B(`arrow-right`)}</button>
      </div>
    </form>
  `}function It(e,t,n){if(!t.length)return``;let r=(e.questions||[]).slice(0,70);return`
    <div class="nw-assess-missed">
      <strong>${B(`alert-triangle`)} Unanswered questions in ${et(n)}</strong>
      <p>You skipped ${t.map(e=>`Question ${r.findIndex(t=>t.id===e.id)+1}`).join(`, `)}. You can go back now or continue if you meant to leave them blank.</p>
      <div class="nw-assess-missed__links">${t.map(e=>{let t=r.findIndex(t=>t.id===e.id);return`<button class="ghost-action" type="button" data-assessment-jump="${t}">${B(`arrow-left`)} Go to ${t+1}</button>`}).join(``)}</div>
    </div>
  `}function Lt(e){return!e?.expiresAt||String(e.status||``).toLowerCase()===`completed`?!1:Date.now()>new Date(e.expiresAt).getTime()}function Rt(e){let t=U(e.role||`Role assessment`),n=q(e,1).length||50,r=Number(e.technicalMinutes||60);return`
    <div class="nw-assess-wrap">
      ${Mt(e)}
      <div class="nw-assess-body">
        <div class="nw-assess-welcome" style="max-width:860px">
          <div style="display:inline-flex;align-items:center;gap:8px;padding:5px 12px;border-radius:999px;background:#E8F8F5;border:1px solid rgba(22,160,133,0.25);margin-bottom:4px">
            <span style="width:6px;height:6px;border-radius:50%;background:#16A085;display:inline-block"></span>
            <span style="font-size:11.5px;font-weight:600;color:#0E6B58;text-transform:uppercase;letter-spacing:0.05em">Part 1 of 2 &middot; Starting now</span>
          </div>
          <h2 class="nw-assess-welcome__title" style="font-size:2.2rem">Role knowledge check.</h2>
          <p class="nw-assess-welcome__desc">The next <strong>${n} questions</strong> are about the day-to-day of the ${t} role — scenarios, decisions, and judgement calls. We're looking at how you think, not whether you remember definitions.</p>
          <p style="font-size:0.88rem;color:#9E9E9E;margin:0">You have <strong style="color:#555">${r} minutes</strong> total. Your progress saves automatically after every question. DISC follows when you finish.</p>
          <div class="nw-assess-welcome__cta" style="margin-top:8px">
            <button class="primary-action" id="startAssessment" type="button">${B(`play`)} Start Part 1</button>
            <button class="ghost-action" id="backToWelcome" type="button">${B(`arrow-left`)} Back</button>
          </div>
        </div>
      </div>
    </div>
  `}function zt(e){let t=q(e,1).length||50,n=q(e,2).length||20,r=Number(e.discMinutes||30),i=U(e.recruiterName||e.recruiter||`your recruiter`),a=(e.questions||[]).findIndex(e=>Number(e.stage||1)===2);return`
    <div class="nw-assess-wrap">
      ${Mt(e)}
      <div class="nw-assess-body">
        <div style="background:#E8F8F5;border-bottom:1px solid rgba(22,160,133,0.15);padding:13px 20px;display:flex;align-items:center;gap:12px;margin-bottom:24px;border-radius:10px">
          <div style="width:26px;height:26px;border-radius:50%;background:#16A085;color:#fff;display:flex;align-items:center;justify-content:center;flex-shrink:0">${B(`check`)}</div>
          <div style="flex:1">
            <div style="font-size:13px;font-weight:600;color:#0E6B58">Part 1 complete — nice work.</div>
            <div style="font-size:12px;color:#12866E;margin-top:1px">${t}/${t} answered &middot; submitted to ${i} for review</div>
          </div>
          <span class="nw-assess-chip nw-assess-chip--teal">${B(`trophy`)} Part 1 done</span>
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
              <p class="nw-assess-part__desc">You'll see ${n} statements about how you work. For each one, pick the option that's most like you. Go with your gut — there are no right answers. Takes about ${r} minutes.</p>
            </div>
          </div>
          <div class="nw-assess-rules">
            <div class="nw-assess-rule"><div class="nw-assess-rule__icon" style="color:#AF7AC5">${B(`users-round`)}</div><div><strong>No right answers</strong><span>This measures style, not performance.</span></div></div>
            <div class="nw-assess-rule"><div class="nw-assess-rule__icon" style="color:#AF7AC5">${B(`timer`)}</div><div><strong>${r} min total</strong><span>Go with your first instinct.</span></div></div>
            <div class="nw-assess-rule"><div class="nw-assess-rule__icon" style="color:#AF7AC5">${B(`shield-check`)}</div><div><strong>Used for fit</strong><span>Helps match you with the right team.</span></div></div>
            <div class="nw-assess-rule"><div class="nw-assess-rule__icon" style="color:#AF7AC5">${B(`check`)}</div><div><strong>Auto-saved</strong><span>Progress saves on every answer.</span></div></div>
          </div>
          <div class="nw-assess-welcome__cta" style="margin-top:8px">
            <button class="primary-action" id="startDiscAssessment" data-disc-index="${a>=0?a:50}" type="button">${B(`play`)} Start Part 2</button>
          </div>
        </div>
      </div>
    </div>
  `}function Bt(e){let t=(F.candidate?.name||F.user?.displayName||``).split(` `)[0]||`You`,n=U(e.recruiterName||e.recruiter||`your recruiter`),r=q(e,1).length||50,i=q(e,2).length||20;return`
    <div class="nw-assess-complete">
      <div class="nw-assess-complete__hero">
        <div class="nw-assess-complete__icon">
          ${B(`check`)}
          <div class="nw-assess-complete__ring1"></div>
          <div class="nw-assess-complete__ring2"></div>
        </div>
        <h2 class="nw-assess-complete__title">You're done, ${U(t)}.</h2>
        <p class="nw-assess-complete__desc">Your results have been sent to ${n}. They'll reach out personally — usually within a business day.</p>
      </div>
      <div class="nw-assess-complete__chips">
        <span class="nw-assess-complete__chip nw-assess-complete__chip--teal">${B(`clipboard-check`)} Part 1 &middot; ${r}/${r} answered</span>
        <span class="nw-assess-complete__chip nw-assess-complete__chip--violet">${B(`compass`)} Part 2 &middot; ${i}/${i} answered</span>
        <span class="nw-assess-complete__chip nw-assess-complete__chip--gray">${B(`check-circle-2`)} Assessment complete</span>
      </div>
      <div class="nw-assess-next">
        <div class="nw-assess-next__label">What happens next</div>
        ${[{icon:`inbox`,title:`Your recruiter reviews your results`,desc:`${n} will read your scenarios and DISC profile, usually within one business day.`,when:`Within 24h`},{icon:`message-square`,title:`A personal note from ${n}`,desc:`Not an automated email. They'll share what stood out and what comes next.`,when:`Tomorrow`},{icon:`calendar-check`,title:`Interview with the hiring team`,desc:`If there's a match, you'll get a calendar link to book a slot that works for you.`,when:`This week`}].map(({icon:e,title:t,desc:n,when:r},i)=>`
          <div class="nw-assess-next__item">
            <div class="nw-assess-next__icon-wrap">
              <div class="nw-assess-next__iconbox">${B(e)}</div>
              <div class="nw-assess-next__num">${i+1}</div>
            </div>
            <div class="nw-assess-next__body">
              <div class="nw-assess-next__title">${t}</div>
              <div class="nw-assess-next__desc">${n}</div>
            </div>
            <div class="nw-assess-next__when">${r}</div>
          </div>
        `).join(``)}
      </div>
      <div class="nw-assess-recruiter">
        <div class="nw-assess-recruiter__avatar">${(e.recruiterName||e.recruiter||`NW`).split(` `).map(e=>e[0]).join(``).slice(0,2).toUpperCase()}</div>
        <div style="flex:1">
          <div class="nw-assess-recruiter__label">Your recruiter</div>
          <div class="nw-assess-recruiter__name">${n}</div>
          <div class="nw-assess-recruiter__role">Talent partner &middot; Nearwork</div>
        </div>
        <button class="ghost-action" data-page="recruiter" type="button">${B(`message-circle`)} Message recruiter</button>
      </div>
    </div>
  `}function Vt(e,t){return e.length?`
    <section class="section-block page-gap">
      <div class="section-heading"><div><p class="eyebrow">Assessment center</p><h2>Your assessment history</h2></div></div>
      <div class="assessment-history-list">
        ${e.map(e=>`
          <article class="assessment-history-row ${e.id===t?`active`:``}">
            <div><strong>${U(e.role||`Nearwork assessment`)}</strong><span>${U(e.id||``)}</span></div>
            <div>${U(String(e.status||`assigned`))}</div>
            <a href="/assessment/${encodeURIComponent(e.id)}/start">${e.status===`completed`?`View`:`Continue`}</a>
          </article>
        `).join(``)}
      </div>
    </section>
  `:``}function Ht(e,t){let n=e.questions||[],r=n.filter(e=>e.stage===1),i=n.filter(e=>e.stage===2),a=r.filter(e=>typeof e.correctIndex==`number`&&Number(t[e.id]?.value)===e.correctIndex).length,o=i.filter(e=>K(t[e.id]?.value??t[e.id])).length;return{technicalScore:r.length?Math.round(a/r.length*100):0,discScore:i.length?Math.round(o/i.length*100):0}}function Ut(e,t){let n={Dominance:0,Influence:0,Steadiness:0,Conscientiousness:0};(e.questions||[]).filter(e=>Number(e.stage)===2).forEach(e=>{let r=t[e.id]?.value;if(!K(r))return;let i=n[e.skill]===void 0?`Steadiness`:e.skill,a=Math.max(1,4-Number(r||0));n[i]+=a});let r=Object.entries(n).sort((e,t)=>t[1]-e[1]),i=r[0]?.[0]||`Steadiness`,a=r[r.length-1]?.[0]||`Dominance`;return{label:{Dominance:`D`,Influence:`I`,Steadiness:`S`,Conscientiousness:`C`}[i]||`S`,high:i,low:a,scores:n,summary:`${i} is the strongest observed DISC tendency; ${a} appears lowest based on this assessment.`}}async function Wt(e,t){let n=`https://admin.nearwork.co/api/send-email`,r=e.candidateEmail||F.user?.email||F.candidate?.email,i=e.candidateName||F.candidate?.name||F.user?.displayName||`there`,a=ht([e.recruiterEmail,e.stakeholderEmail,e.hiringManagerEmail].filter(Boolean).join(`,`)),o=[];r&&o.push(fetch(n,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify({to:r,templateId:`assessment_completed_candidate`,data:{name:i,role:e.role,actionUrl:`https://talent.nearwork.co/assessment`,actionText:`Open assessment center`}})}));let s=a.length?a:[`support@nearwork.co`];o.push(fetch(n,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify({to:s,templateId:`assessment_completed_recruiter`,data:{name:`Nearwork team`,role:e.role,actionUrl:`https://admin.nearwork.co/assessments/${e.id}/questions`,actionText:`Review assessment`,message:`${i} completed the assessment. Overall: ${t.score}%. Technical: ${t.technicalScore}%. DISC: ${t.discProfile?.label||`Submitted`}.`}})})),await Promise.allSettled(o)}function Gt(){let e=F.candidate?.cvLibrary||[];return`
    <section class="section-block">
      <div class="section-heading"><div><p class="eyebrow">CV picker</p><h2>Store multiple resumes</h2></div></div>
      <form id="cvForm" class="upload-box">
        ${B(`upload-cloud`)}<strong>Upload a CV for this role</strong><p>Save multiple versions and pick the best one for each opening.</p>
        <input name="cv" type="file" accept=".pdf,.doc,.docx" required />
        <input name="label" type="text" placeholder="CV label, e.g. CSM resume" />
        <button class="primary-action fit" type="submit">Upload CV</button>
      </form>
      <div class="cv-list">
        ${e.length?e.map(e=>`<article class="cv-item">${B(`file-text`)}<div><strong>${e.name||e.fileName}</strong><span>${Ye(e.uploadedAt)}</span></div>${e.url?`<a href="${e.url}" target="_blank" rel="noreferrer">Open</a>`:``}</article>`).join(``):$(`No CVs saved yet`,`Upload role-specific resumes here.`)}
      </div>
    </section>
  `}function Kt(){return`
    <section class="tips-hero"><div><p class="eyebrow">Candidate guide</p><h2>Practical prep for US SaaS interviews.</h2><p>Short, useful guidance candidates can read before recruiter screens, assessments, and client interviews.</p></div></section>
    <section class="tips-grid rich">
      ${ze.map((e,t)=>`
        <article class="tip-card">
          <div class="tip-number">${String(t+1).padStart(2,`0`)}</div>
          <span>${e.tag}</span>
          <h3>${e.title}</h3>
          <p>${e.body}</p>
          <div class="tip-actions">${e.actions.map(e=>`<small>${e}</small>`).join(``)}</div>
          <strong>${e.read} read</strong>
        </article>
      `).join(``)}
    </section>
  `}function qt(){let e=(F.candidate?.recruiter||{}).bookingUrl||F.candidate?.recruiterBookingUrl||`mailto:support@nearwork.co?subject=Nearwork%20candidate%20question`;return`
    <section class="content-grid">
      <div class="section-block"><div class="section-heading"><div><p class="eyebrow">Recruiter</p><h2>Your Nearwork contact</h2></div></div>${rn(!0)}</div>
      <div class="section-block compact"><div class="section-heading"><div><p class="eyebrow">Booking</p><h2>Schedule soon</h2></div></div><p class="muted">Ask the Nearwork recruiting team for the earliest available slot. Candidate booking links can be attached to this profile later.</p><a class="primary-action fit" href="${e}" target="_blank" rel="noreferrer">${B(`calendar-plus`)} Book recruiter call</a></div>
    </section>
  `}function Jt(){return Yt(`profile`)}function Yt(e=`profile`){let t=W(),n=it(),r=P[n.department]||[],i=F.candidate?.salaryCurrency||`USD`,a=dt(F.candidate?.salaryAmount||F.candidate?.salary||F.candidate?.salaryUSD,i),o=ot(),s=F.candidate?.targetRole||F.candidate?.headline||``;return`
    <section class="section-block">
      <div class="section-heading"><div><p class="eyebrow">${e===`onboarding`?`Setup`:`Profile`}</p><h2>${e===`onboarding`?`Complete your account`:`Improve your match quality`}</h2></div><span class="profile-score">${Xt()}%</span></div>
      <form id="profileForm" class="profile-form">
        <div class="profile-card profile-identity wide">
          ${Je(`large`)}
          <label>Profile photo <span class="optional-label">optional</span>
            <input name="photo" type="file" accept="image/png,image/jpeg,image/webp" />
          </label>
        </div>
        <label class="wide">Full name<input name="name" value="${U(F.candidate?.name||F.user?.displayName||``)}" /></label>
        <div class="profile-card wide">
          <div class="field-label">Role applying for</div>
          <div class="profile-card-grid">
            <label>Area
              <select name="roleGroup" id="roleGroupSelect">
                ${st(o)}
              </select>
            </label>
            <label>Role
              <select name="targetRole" id="targetRoleSelect">
                ${ct(o,s)}
              </select>
            </label>
          </div>
        </div>
        <div class="profile-card wide">
          <div class="field-label">Location</div>
          <div class="profile-card-grid">
            <label>Department
              <select name="department" id="departmentSelect">
                ${Object.keys(P).map(e=>`<option value="${U(e)}" ${e===n.department?`selected`:``}>${e}</option>`).join(``)}
              </select>
            </label>
            <label>City
              <select name="city" id="citySelect">
                ${r.map(e=>`<option value="${U(e)}" ${e===n.city?`selected`:``}>${e}</option>`).join(``)}
              </select>
            </label>
          </div>
        </div>
        <div class="profile-card wide">
          <div class="field-label">Compensation and English</div>
          <div class="profile-card-grid">
            <label>Target monthly salary
              <div class="salary-field"><select id="salaryCurrencyInput" name="salaryCurrency"><option value="USD" ${a.salaryCurrency===`USD`?`selected`:``}>USD</option><option value="COP" ${a.salaryCurrency===`COP`?`selected`:``}>COP</option></select><input id="salaryInput" name="salary" value="${U(a.salary||``)}" inputmode="numeric" placeholder="1000" /></div>
            </label>
            <label>English level<select name="english">${[``,`B1`,`B2`,`C1`,`C2`,`Native`].map(e=>`<option value="${e}" ${F.candidate?.english===e?`selected`:``}>${e||`Select level`}</option>`).join(``)}</select></label>
          </div>
        </div>
        <div class="profile-card wide">
          <div class="field-label">Contact</div>
          <div class="profile-card-grid">
            <label>WhatsApp number
              <input name="whatsapp" value="${U(F.candidate?.whatsapp||F.candidate?.phone||``)}" inputmode="tel" autocomplete="tel" placeholder="+57 300 123 4567" required />
            </label>
            <label>LinkedIn <span class="optional-label">optional</span>
              <input name="linkedin" value="${U(F.candidate?.linkedin||``)}" placeholder="https://linkedin.com/in/..." />
            </label>
          </div>
        </div>
        <div class="profile-card wide">
          <div class="field-label">Skills</div>
          <p class="field-hint">Search for skills and add everything that applies to your experience.</p>
          ${ut(t)}
        </div>
        <div class="profile-card wide">
          <div class="field-label">CV</div>
          <p class="field-hint">Upload the CV you want Nearwork to use for your applications.</p>
          <input name="profileCv" type="file" accept=".pdf,.doc,.docx" />
          <input name="profileCvLabel" type="text" placeholder="CV label, e.g. Customer Success CV" />
        </div>
        <label class="wide">Summary <span class="optional-label">optional</span><textarea name="summary" placeholder="Add a short note about what you do best.">${F.candidate?.summary||``}</textarea></label>
        <input type="hidden" name="mode" value="${e}" />
        <button class="primary-action fit" type="submit">${B(`save`)} ${e===`onboarding`?`Finish setup`:`Save profile`}</button>
      </form>
    </section>
  `}function Xt(){let e=[`name`,`targetRole`,`department`,`city`,`english`,`salary`,`whatsapp`],t=e.filter(e=>e===`targetRole`?!!(F.candidate?.targetRole||!Ze(F.candidate?.headline)&&F.candidate?.headline):!!F.candidate?.[e]).length+ +!!W().length;return Math.max(25,Math.round(t/(e.length+1)*100))}function Zt(){let e=F.applications[0];return e?.stage||e?.status||`profile-review`}function Qt(e){let t=String(e||``).toLowerCase().replace(/_/g,`-`).replace(/\s+/g,`-`),n=Math.max(0,Be.findIndex(e=>t.includes(e.key)||e.key.includes(t)));return`<div class="pipeline">${Be.map((e,t)=>`<article class="${t<=n?`done`:``} ${t===n?`current`:``}"><span>${t+1}</span><strong>${e.label}</strong><p>${e.help}</p></article>`).join(``)}</div>`}function $t(){return`
    <div class="empty-state">
      ${B(`briefcase-business`)}
      <strong>No active pipeline yet</strong>
      <p>Browse current openings and apply when you find a role that fits. Nearwork will show a pipeline here after an application moves forward.</p>
      <div class="empty-actions">
        <button class="primary-action fit" type="button" data-page="matches">${B(`sparkles`)} View matches</button>
        <a class="secondary-action" href="https://jobs.nearwork.co" target="_blank" rel="noreferrer">${B(`external-link`)} Open jobs</a>
      </div>
    </div>
  `}function Q(e,t,n){return`<article class="metric"><span>${B(n)}</span><p>${e}</p><strong>${t}</strong></article>`}function en(){try{return new Set(JSON.parse(localStorage.getItem(`nw_talent_applied`)||`[]`))}catch{return new Set}}function tn(e){let t=J(e),n=new Set(F.applications.map(e=>e.jobId||e.openingCode)).has(t.code)||en().has(t.code),r=Xe(t),i=`https://jobs.nearwork.co/apply?code=${encodeURIComponent(t.code)}`;return`
    <article class="job-card">
      <div>
        ${r.length>=3?`<div class="match-pill">${r.length} skill match</div>`:t.match?`<div class="match-pill">${t.match}% match</div>`:``}
        <h3><a href="${i}" target="_blank" rel="noreferrer" style="color:inherit;text-decoration:none;" onmouseover="this.style.textDecoration='underline'" onmouseout="this.style.textDecoration='none'">${t.title}</a></h3>
        <p>${t.location}</p>
      </div>
      <p class="job-description">${t.description}</p>
      <div class="skill-row">${t.skills.slice(0,4).map(e=>`<span>${e}</span>`).join(``)}</div>
      ${r.length>=3?`<p class="field-hint">Matched skills: ${r.slice(0,5).map(escapeHtml).join(`, `)}</p>`:``}
      <div class="job-footer">
        <strong>${t.compensation}</strong>
        <div style="display:flex;gap:8px;align-items:center;">
          <a href="${i}" target="_blank" rel="noreferrer" class="secondary-action" style="text-decoration:none;font-size:12px;opacity:0.75;">View opening ↗</a>
          <button class="secondary-action" type="button" data-apply="${t.code}" ${n?`disabled`:``}>${n?`Applied ✓`:`Apply`}</button>
        </div>
      </div>
    </article>
  `}function nn(e){return`<article class="timeline-item"><span>${B(`circle-dot`)}</span><div><strong>${e.jobTitle||e.title||`Application`}</strong><p>${e.clientName||e.company||`Nearwork`} · ${e.status||`submitted`}</p><small>${Ye(e.updatedAt||e.createdAt)}</small></div></article>`}function rn(e=!1){let t=F.candidate?.recruiter||{},n=t.email||`support@nearwork.co`,r=t.whatsapp||Ne,i=t.whatsappUrl||Pe;return`<article class="recruiter-card"><div class="avatar recruiter-avatar">NW</div><div><strong>${t.name||`Nearwork Support`}</strong><p><a href="mailto:${n}">${n}</a></p><p><a href="${i}" target="_blank" rel="noreferrer">WhatsApp ${r}</a></p>${e?`<span>Questions about assessments, interviews, feedback, or CV selection should go here.</span>`:``}</div></article>`}function $(e,t){return`<div class="empty-state">${B(`inbox`)}<strong>${e}</strong><p>${t}</p></div>`}function an(){Me.innerHTML=`<main class="loading-screen"><span class="logo-mark">N</span><p>Loading Talent...</p></main>`}function on(){document.querySelector(`#signOut`)?.addEventListener(`click`,async()=>{await c(C),I&&I(),I=null,window.history.pushState({page:`overview`},``,`/`),V({user:null,candidate:null,applications:[],assessments:[],jobs:[],view:`login`,activePage:`overview`,message:``})}),document.querySelector(`#signIn`)?.addEventListener(`click`,()=>{window.history.pushState({page:`overview`},``,`/`),V({view:`login`,activePage:`overview`,message:``})}),document.querySelectorAll(`[data-page]`).forEach(e=>{e.addEventListener(`click`,e=>{H((e.currentTarget.closest(`[data-page]`)||e.currentTarget).dataset.page)})}),document.querySelector(`[data-dashboard-home]`)?.addEventListener(`click`,()=>H(`overview`)),document.querySelector(`#notificationBell`)?.addEventListener(`click`,()=>{V({notificationPanelOpen:!F.notificationPanelOpen,notificationSettingsOpen:!1})}),document.querySelector(`#notificationSettings`)?.addEventListener(`click`,()=>{V({notificationSettingsOpen:!F.notificationSettingsOpen,notificationPanelOpen:!1})}),document.querySelectorAll(`[data-notification-read]`).forEach(e=>{e.addEventListener(`click`,async()=>{let t=e.dataset.notificationRead;F.user&&x&&await Ae(t).catch(()=>null),V({notifications:F.notifications.map(e=>e.id===t?{...e,read:!0}:e)})})}),document.querySelectorAll(`[data-notification-pref]`).forEach(e=>{e.addEventListener(`change`,async()=>{let t=structuredClone(F.candidate?.notificationPreferences||{}),n=e.dataset.notificationPref,r=e.dataset.channel;t[n]={...t[n]||{},[r]:e.checked},V({candidate:{...F.candidate,notificationPreferences:t}}),F.user&&x&&await je(F.user.uid,t).catch(()=>null)})}),document.querySelectorAll(`[data-assessment-jump]`).forEach(e=>{e.addEventListener(`click`,async()=>{let t=R()||(F.assessments||[])[0]?.id,n=(F.assessments||[]).find(e=>e.id===t),r=Number(e.dataset.assessmentJump||0),i=n?.questions?.[r];!t||!i||(await j(t,`__progress__`,``,{currentQuestionIndex:r,totalQuestions:n?.questions?.length||70,currentStage:i.stage||1}),z(t,r),V({assessments:(F.assessments||[]).map(e=>e.id===t?{...e,currentQuestionIndex:r,currentStage:i.stage||1}:e),activePage:`assessment`,message:``}))})}),document.querySelector(`#availability`).addEventListener(`change`,async e=>{let t=e.target.value;V({candidate:{...F.candidate,availability:t}}),F.user&&x?await Te(F.user.uid,t):V({message:`Sign in with Google to save availability.`})}),document.querySelector(`#filterMatches`)?.addEventListener(`click`,()=>{let e=W().length>=3;V({matchesFiltered:e?!F.matchesFiltered:!1,message:e?``:`Add at least 3 skills in Profile first, then filter matching openings.`})}),document.querySelector(`#departmentSelect`)?.addEventListener(`change`,e=>{let t=document.querySelector(`#citySelect`);t.innerHTML=(P[e.target.value]||[]).map(e=>`<option value="${U(e)}">${e}</option>`).join(``)}),document.querySelector(`#roleGroupSelect`)?.addEventListener(`change`,e=>{let t=document.querySelector(`#targetRoleSelect`);t.innerHTML=ct(e.target.value,``)}),document.querySelector(`#salaryCurrencyInput`)?.addEventListener(`change`,e=>{let t=document.querySelector(`#salaryInput`);if(!t)return;let n=pt(t.value,e.target.value);e.target.value=n,t.placeholder=n===`COP`?`5,000,000`:`2,500`,t.value=mt(t.value,n)}),document.querySelector(`#salaryInput`)?.addEventListener(`blur`,e=>{let t=document.querySelector(`#salaryCurrencyInput`),n=pt(e.target.value,t?.value||`USD`);t&&(t.value=n),e.target.placeholder=n===`COP`?`5,000,000`:`2,500`,e.target.value=mt(e.target.value,n)}),sn(),document.querySelectorAll(`[data-apply]`).forEach(e=>{e.addEventListener(`click`,async()=>{let t=F.jobs.map(J).find(t=>t.code===e.dataset.apply),n=e.dataset.apply;if(e.disabled=!0,e.textContent=`Submitted`,F.user&&x){try{let e=en();e.add(n),localStorage.setItem(`nw_talent_applied`,JSON.stringify([...e]))}catch{}await we(F.user.uid,t),await vt(F.user),H(`applications`)}else V({message:`Sign in with Google to apply to this opening.`})})}),document.querySelector(`#showTechIntro`)?.addEventListener(`click`,()=>{V({assessmentUiStep:`techIntro`,message:``})}),document.querySelector(`#backToWelcome`)?.addEventListener(`click`,()=>{V({assessmentUiStep:null,message:``})}),document.querySelector(`#startDiscAssessment`)?.addEventListener(`click`,async()=>{let e=R()||(F.assessments||[])[0]?.id,t=(F.assessments||[]).find(t=>t.id===e);if(!e||!t)return;let n=t.questions||[],r=document.querySelector(`#startDiscAssessment`),i=r?Number(r.dataset.discIndex||50):n.findIndex(e=>Number(e.stage||1)===2),a=i>=0?i:50,o=new Date().toISOString();try{await j(e,`__progress__`,``,{currentQuestionIndex:a,totalQuestions:n.length,currentStage:2,discStartedAt:o}),z(e,a),V({assessments:(F.assessments||[]).map(t=>t.id===e?{...t,currentQuestionIndex:a,currentStage:2,discStartedAt:o}:t),activePage:`assessment`,assessmentUiStep:null,message:``})}catch(e){V({message:Y(e)})}}),document.querySelector(`#startAssessment`)?.addEventListener(`click`,async()=>{let e=R()||(F.assessments||[])[0]?.id,t=(F.assessments||[]).find(t=>t.id===e)||(F.assessments||[])[0];if(!e||!F.user){V({message:`Please log in to start your assessment.`});return}try{await xe(e,F.user.uid),z(e,Number(t?.currentQuestionIndex||0),!0),V({assessments:(F.assessments||[]).map(t=>t.id===e?{...t,status:`started`,startedAt:t.startedAt||new Date().toISOString(),technicalStartedAt:t.technicalStartedAt||new Date().toISOString()}:t),activePage:`assessment`,assessmentUiStep:null,message:``})}catch(e){V({message:Y(e)})}}),document.querySelector(`#prevAssessmentQuestion`)?.addEventListener(`click`,async()=>{let e=R()||(F.assessments||[])[0]?.id,t=(F.assessments||[]).find(t=>t.id===e),n=Number(document.querySelector(`#assessmentQuestionForm`)?.dataset.currentIndex??t?.currentQuestionIndex??0),r=Math.max(0,n-1),i=t?.questions?.[r];await j(e,`__progress__`,``,{currentQuestionIndex:r,totalQuestions:t?.questions?.length||70,currentStage:i?.stage||1}),z(e,r),V({assessments:(F.assessments||[]).map(t=>t.id===e?{...t,currentQuestionIndex:r,currentStage:i?.stage||1}:t),activePage:`assessment`,message:``})}),document.querySelector(`#assessmentQuestionForm`)?.addEventListener(`submit`,async e=>{e.preventDefault();let t=R()||(F.assessments||[])[0]?.id,n=(F.assessments||[]).find(e=>e.id===t),r=n?.questions||[],i=Number(e.currentTarget.dataset.currentIndex??n?.currentQuestionIndex??0),a=r[i],o=new FormData(e.currentTarget).get(`answer`);if(!a){V({message:`This question could not be loaded. Please refresh and try again.`});return}let s=o===null?{value:``,skipped:!0,answeredAt:new Date().toISOString()}:{value:Number(o),skipped:!1,answeredAt:new Date().toISOString()},c={...n.answers||{},[a.id]:s},l=r[i+1],u=l&&Number(l.stage||1)!==Number(a.stage||1),d=nt(n,a.stage,c);try{if((u||i+1>=r.length)&&d.length){await j(t,a.id,c[a.id],{currentQuestionIndex:i,totalQuestions:r.length,currentStage:a.stage||1}),V({assessments:(F.assessments||[]).map(e=>e.id===t?{...e,answers:c,currentQuestionIndex:i,currentStage:a.stage||1,progress:`${i+1}/${r.length}`}:e),activePage:`assessment`,message:`You missed ${d.length} question${d.length===1?``:`s`} in the ${et(a.stage)}.`});return}if(i+1>=r.length){let e=Ht(n,c),i=Ut(n,c);await Se(t,c,{totalQuestions:r.length,technicalScore:e.technicalScore,discScore:e.discScore,score:Math.round(e.technicalScore*.75+e.discScore*.25),discProfile:i}),fetch(`https://admin.nearwork.co/api/generate-assessment-insights`,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify({assessmentId:t})}).catch(()=>null),Wt(n,{score:Math.round(e.technicalScore*.75+e.discScore*.25),technicalScore:e.technicalScore,discScore:e.discScore,discProfile:i}).catch(e=>console.warn(e)),V({assessments:(F.assessments||[]).map(n=>n.id===t?{...n,answers:c,status:`completed`,score:Math.round(e.technicalScore*.75+e.discScore*.25),technical:e.technicalScore,disc:i.label,discProfile:i,progress:`${r.length}/${r.length}`}:n),activePage:`assessment`,message:``})}else{let e=a.stage===1&&l?.stage===2&&!n.discStartedAt;await j(t,a.id,c[a.id],{currentQuestionIndex:i+1,totalQuestions:r.length,currentStage:l?.stage||a.stage||1}),z(t,i+1),V({assessments:(F.assessments||[]).map(e=>e.id===t?{...e,answers:c,currentQuestionIndex:i+1,currentStage:l?.stage||a.stage||1,progress:`${i+1}/${r.length}`}:e),activePage:`assessment`,message:``,assessmentUiStep:e?`discIntro`:null})}}catch(e){V({message:Y(e)})}}),document.querySelector(`#profileForm`)?.addEventListener(`submit`,async e=>{e.preventDefault();let t=new FormData(e.currentTarget),n=t.get(`department`),r=t.get(`city`),i=dt(t.get(`salary`),t.get(`salaryCurrency`)),a={name:t.get(`name`),targetRole:t.get(`targetRole`),headline:t.get(`targetRole`),department:n,city:r,locationId:`${String(r).toLowerCase().normalize(`NFD`).replace(/[\u0300-\u036f]/g,``).replace(/[^a-z0-9]+/g,`-`)}-co`,location:`${r}, ${n}`,locationCity:r,locationDepartment:n,locationCountry:`Colombia`,english:t.get(`english`),salary:i.salary,salaryUSD:i.salaryUSD,salaryAmount:i.salaryAmount,salaryCurrency:i.salaryCurrency,expectedSalaryAmount:i.salaryAmount,expectedSalaryCurrency:i.salaryCurrency,linkedin:t.get(`linkedin`),whatsapp:t.get(`whatsapp`),phone:t.get(`whatsapp`),skills:[...new Set(t.getAll(`skills`).map(lt).filter(Boolean))],otherSkills:[],summary:t.get(`summary`),email:F.candidate?.email||F.user?.email||``,availability:F.candidate?.availability||`open`,onboarded:!0};if(!F.user){V({candidate:{...F.candidate,...a},message:`Preview updated. Sign in with Google to save this profile.`});return}try{let e=t.get(`photo`),n=F.candidate?.photoURL||F.user?.photoURL||``;e?.name&&(n=await De(F.user.uid,e));let r=t.get(`profileCv`),i=null;r?.name&&(i=await Oe(F.user.uid,r,t.get(`profileCvLabel`)));let o={...a,photoURL:n,...i?{activeCvId:i.id,activeCvName:i.name||i.fileName,cvLibrary:[...F.candidate?.cvLibrary||[],i]}:{}},s=(await Ee(F.user.uid,o))?.atsSynced===!1?`Profile saved. Nearwork will finish connecting it to your workspace.`:`Profile saved.`;t.get(`mode`)===`onboarding`?(window.history.pushState({page:`overview`},``,`/`),V({candidate:{...F.candidate,...o},activePage:`overview`,message:`Profile complete. Welcome to Talent.`})):V({candidate:{...F.candidate,...o},message:s})}catch(e){V({message:Y(e)})}}),document.querySelector(`#cvForm`)?.addEventListener(`submit`,async e=>{e.preventDefault();let t=new FormData(e.currentTarget),n=t.get(`cv`);if(n?.name){if(!F.user){V({message:`Sign in with Google to upload and store CVs.`});return}try{let e=await Oe(F.user.uid,n,t.get(`label`));V({candidate:{...F.candidate,cvLibrary:[...F.candidate?.cvLibrary||[],e],activeCvId:e.id},message:`CV uploaded.`})}catch(e){V({message:Y(e)})}}})}function sn(){let e=document.querySelector(`[data-skill-search]`);if(!e)return;let t=e.querySelector(`#skillSearchInput`),n=e.querySelector(`#skillSuggestions`),r=e.querySelector(`#selectedSkills`),i=()=>[...r.querySelectorAll(`input[name="skills"]`)].map(e=>e.value),a=e=>{r.innerHTML=e.length?e.map(e=>`
      <span class="selected-skill" data-skill-chip="${U(e)}">
        ${escapeHtml(e)}
        <button type="button" class="skill-remove" data-remove-skill="${U(e)}" aria-label="Remove ${U(e)}">×</button>
        <input type="hidden" name="skills" value="${U(e)}" />
      </span>`).join(``):`<span class="skill-empty">Selected skills will appear here.</span>`},o=()=>{let e=G(t.value),r=new Set(i().map(G)),a=Le.filter(e=>!r.has(G(e))).filter(t=>!e||G(t).includes(e)).slice(0,18);n.innerHTML=a.length?a.map(e=>`<button type="button" class="skill-suggestion" data-skill="${U(e)}">${escapeHtml(e)}</button>`).join(``):`<button type="button" class="skill-suggestion add-custom" data-skill="${U(t.value)}">Add "${escapeHtml(t.value)}"</button>`},s=e=>{let n=lt(e||t.value);if(!n)return;let r=G(n);a([...i().filter(e=>G(e)!==r),n]),t.value=``,o()};t?.addEventListener(`input`,o),t?.addEventListener(`focus`,o),t?.addEventListener(`keydown`,e=>{e.key===`Enter`&&(e.preventDefault(),s(n.querySelector(`.skill-suggestion`)?.dataset.skill||t.value))}),e.querySelector(`#addTypedSkill`)?.addEventListener(`click`,()=>s(t.value)),n.addEventListener(`click`,e=>{let t=e.target.closest(`[data-skill]`);t&&s(t.dataset.skill)}),r.addEventListener(`click`,e=>{let t=e.target.closest(`[data-remove-skill]`);if(!t)return;let n=G(t.dataset.removeSkill);a(i().filter(e=>G(e)!==n)),o()})}function cn(){if(F.loading)return an();if(F.view===`dashboard`)return yt();_t()}window.addEventListener(`popstate`,()=>{let e=L();e===`overview`&&!F.user?V({view:`login`,activePage:`overview`,message:``}):F.view===`dashboard`?H(e,!1):X()}),x?(i(C,e=>{e?vt(e):X()}),window.setTimeout(()=>{F.loading&&X()},2500)):X();