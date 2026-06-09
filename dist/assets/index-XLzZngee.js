import{initializeApp as e}from"https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";import{GoogleAuthProvider as t,createUserWithEmailAndPassword as n,getAuth as r,onAuthStateChanged as i,sendPasswordResetEmail as a,signInWithEmailAndPassword as o,signInWithPopup as s,signOut as c,updateProfile as l}from"https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";import{addDoc as u,arrayUnion as d,collection as f,doc as p,getDoc as m,getDocs as h,getFirestore as ee,limit as g,onSnapshot as te,query as _,serverTimestamp as v,setDoc as y,updateDoc as ne,where as b}from"https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";import{deleteObject as re,getDownloadURL as ie,getStorage as ae,ref as oe,uploadBytes as se}from"https://www.gstatic.com/firebasejs/10.12.5/firebase-storage.js";(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),e.crossOrigin===`use-credentials`?t.credentials=`include`:e.crossOrigin===`anonymous`?t.credentials=`omit`:t.credentials=`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var ce={apiKey:`AIzaSyApRNyW8PoP28E0x77dUB5jOgHuTqA2by4`,authDomain:`nearwork-97e3c.firebaseapp.com`,projectId:`nearwork-97e3c`,storageBucket:`nearwork-97e3c.firebasestorage.app`,messagingSenderId:`145642656516`,appId:`1:145642656516:web:0ac2da8931283121e87651`,measurementId:`G-3LC8N6FFSH`},x=Object.values(ce).slice(0,6).every(Boolean),S=x?e(ce):null,C=S?r(S):null,w=S?ee(S):null,le=S?ae(S):null,ue=S?new t:null,T={users:`users`,candidates:`candidates`,openings:`openings`,pipelines:`pipelines`,applications:`applications`,assessments:`assessments`,activity:`candidateActivity`,notifications:`notifications`,notificationPreferences:`notificationPreferences`},de=`https://admin.nearwork.co/api/send-email`;function E(){if(!S||!C||!w||!le)throw Error(`Missing Firebase environment variables. Copy .env.example to .env.local and fill in the Admin app config.`)}async function fe(e={}){let t=String(e.email||C?.currentUser?.email||``).trim().toLowerCase();if(!t)return{ok:!1,skipped:!0,reason:`Missing candidate email`};let n=e.name||C?.currentUser?.displayName||``,r=e.firstName||n.split(/\s+/)[0]||`there`,i=await fetch(de,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify({to:t,templateId:`account_created`,data:{name:n||r,firstName:r,actionUrl:`https://talent.nearwork.co`}})});return i.json().catch(()=>({ok:i.ok}))}async function pe(e={},t={}){let n=String(e?.email||C?.currentUser?.email||``).trim().toLowerCase();if(!n)return{ok:!1,skipped:!0,reason:`Missing candidate email`};let r=e?.name||C?.currentUser?.displayName||``,i=e?.firstName||r.split(/\s+/)[0]||`there`,a=await fetch(de,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify({to:n,templateId:`job_applied`,data:{name:r||i,firstName:i,roleTitle:t.title||t.role||t.openingTitle||`this role`,openingCode:t.code||t.id||``,actionUrl:`https://talent.nearwork.co`}})});return a.json().catch(()=>({ok:a.ok}))}async function me(e){E();let t=await m(p(w,T.users,e));return t.exists()?{id:t.id,...t.data()}:null}async function he(e){E();let t=String(e||``).trim(),n=t.toLowerCase(),r=await h(_(f(w,T.users),b(`email`,`==`,n),g(1)));if(!r.empty)return{id:r.docs[0].id,...r.docs[0].data()};if(t===n)return null;let i=await h(_(f(w,T.users),b(`email`,`==`,t),g(1)));return i.empty?null:{id:i.docs[0].id,...i.docs[0].data()}}async function ge(e){let t=await me(e.uid);if(t)return t;let n=await he(e.email);return n?(await _e(e.uid,{...n,email:e.email,connectedFromUserId:n.id}),{...n,id:e.uid,connectedFromUserId:n.id}):null}async function _e(e,t){E();let n=t.candidateCode||D(e),r={...t,candidateCode:n,role:`candidate`,updatedAt:v()};await y(p(w,T.users,e),r,{merge:!0}),await y(p(w,T.candidates,n),ye(e,{...r,candidateCode:n}),{merge:!0}).catch(()=>null),t.marketingConsent===!0&&je({...r,candidateCode:n,source:`talent.nearwork.co`}).catch(()=>null)}function D(e){return`CAND-${String(e||``).replace(/[^a-z0-9]/gi,``).slice(0,8).toUpperCase()||Date.now()}`}function ve(e){return String(e||``).toLowerCase().normalize(`NFD`).replace(/[\u0300-\u036f]/g,``).replace(/[^a-z0-9]+/g,`-`).replace(/^-|-$/g,``)}function ye(e,t){let n=t.candidateCode||D(e),r=t.location||[t.locationCity||t.city,t.locationDepartment||t.department].filter(Boolean).join(`, `),i=new Date().toISOString().slice(0,10);return{code:n,uid:e,ownerUid:e,name:t.name||`Talent member`,role:t.targetRole||t.headline||`Nearwork candidate`,skills:Array.isArray(t.skills)?t.skills:[],applied:t.applied||i,lastContact:t.lastContact||i,experience:Number(t.experience||0),location:r,city:ve(t.locationCity||t.city||r),department:t.locationDepartment||t.department||``,country:t.locationCountry||`Colombia`,source:`talent.nearwork.co`,status:t.status||`active`,score:Number(t.score||50),email:t.email||``,phone:t.whatsapp||t.phone||``,whatsapp:t.whatsapp||t.phone||``,salary:t.salary||``,salaryUSD:Number(t.salaryUSD||0)||null,salaryAmount:Number(t.salaryAmount||t.expectedSalaryAmount||0)||null,salaryCurrency:t.salaryCurrency||t.expectedSalaryCurrency||`USD`,expectedSalaryAmount:Number(t.expectedSalaryAmount||t.salaryAmount||0)||null,expectedSalaryCurrency:t.expectedSalaryCurrency||t.salaryCurrency||`USD`,expectedSalary:t.expectedSalary||t.salary||``,availability:t.availability||`open`,english:t.english||``,visa:t.visa||`No`,linkedin:t.linkedin||``,cv:t.activeCvName||``,cvUrl:t.cvUrl||null,photoUrl:t.photoURL||t.photoUrl||null,tags:t.tags||[`talent profile`],notes:t.summary||``,summary:t.summary||``,workHistory:Array.isArray(t.workHistory)?t.workHistory:[],languages:Array.isArray(t.languages)?t.languages:[],certifications:Array.isArray(t.certifications)?t.certifications:[],appliedBefore:!!t.appliedBefore,applications:t.applications||[],pipelineCodes:t.pipelineCodes||[],loom:t.loom||`Not uploaded`,assessments:t.assessments||[],work:t.work||[],updatedAt:v()}}async function be(e=!1){E();let t=await s(C,ue),n=await ge(t.user),r=new Date().toISOString(),i={email:t.user.email,name:t.user.displayName||``,availability:`open`,onboarded:!1,privacyConsent:!0,privacyConsentAt:r,marketingConsent:e,marketingConsentAt:e?r:null},a=!n;a&&(await _e(t.user.uid,i),fe(i).catch(()=>null));let o=D(t.user.uid),c={...n||i,candidateCode:o};return await y(p(w,T.candidates,o),ye(t.user.uid,c),{merge:!0}).catch(()=>null),(a?e:n?.marketingConsent===!0)&&je({...c,candidateCode:o,source:`talent.nearwork.co`}).catch(()=>null),t.user}async function xe(e){E();let t=_(f(w,T.applications),b(`candidateId`,`==`,e),g(20)),n=_(f(w,T.applications),b(`ownerUid`,`==`,e),g(20)),r=await Promise.allSettled([h(t),h(n)]),i=new Map;return r.forEach(e=>{e.status===`fulfilled`&&e.value.docs.forEach(e=>i.set(e.id,{id:e.id,...e.data()}))}),Array.from(i.values()).sort((e,t)=>{let n=e=>e?.toDate?.()?.getTime()??(e?new Date(e).getTime():0);return n(t.updatedAt||t.createdAt)-n(e.updatedAt||e.createdAt)})}async function Se(e,t=``,n=``){E();let r=String(t||``).trim().toLowerCase(),i=String(n||``).trim(),a=[h(_(f(w,T.assessments),b(`candidateUid`,`==`,e),g(25))),h(_(f(w,T.assessments),b(`candidateId`,`==`,e),g(25)))];r&&a.push(h(_(f(w,T.assessments),b(`candidateEmail`,`==`,r),g(25)))),i&&a.push(h(_(f(w,T.assessments),b(`candidateCode`,`==`,i),g(25))));let o=await Promise.allSettled(a),s=new Map;return o.forEach(e=>{e.status===`fulfilled`&&e.value.docs.forEach(e=>s.set(e.id,{id:e.id,...e.data()}))}),Array.from(s.values()).sort((e,t)=>{let n=e=>e?.toDate?.()?.getTime()??(e?new Date(e).getTime():0);return n(t.updatedAt||t.createdAt||t.sentAt)-n(e.updatedAt||e.createdAt||e.sentAt)})}async function Ce(e,t,n=``,r=``){E();let i=await m(p(w,T.assessments,e));if(!i.exists())return null;let a={id:i.id,...i.data()},o=String(n||``).trim().toLowerCase(),s=String(r||``).trim();return a.candidateUid===t||a.candidateId===t||String(a.candidateEmail||``).trim().toLowerCase()===o||String(a.candidateCode||``).trim()===s?a:null}async function we(e,t){E();let n=await m(p(w,T.assessments,e)),r=n.exists()?n.data():{};if(r.status===`completed`)throw Error(`This assessment is already completed.`);if(r.expiresAt&&Date.now()>new Date(r.expiresAt).getTime())throw Error(`This assessment link has expired.`);await y(p(w,T.assessments,e),{status:`started`,currentQuestionIndex:Number(r.currentQuestionIndex||0),currentStage:Number(r.currentStage||1),technicalStartedAt:r.technicalStartedAt||v(),startedAt:r.startedAt||v(),updatedAt:v()},{merge:!0})}async function Te(e,t,n,r={}){E();let i=await m(p(w,T.assessments,e)),a=i.exists()?i.data():{};if(a.status===`completed`)throw Error(`This assessment is already completed.`);if(a.expiresAt&&Date.now()>new Date(a.expiresAt).getTime())throw Error(`This assessment link has expired.`);await y(p(w,T.assessments,e),{[`answers.${t}`]:n,progress:`${r.currentQuestionIndex||0}/${r.totalQuestions||``}`.replace(/\/$/,``),currentQuestionIndex:r.currentQuestionIndex||0,currentStage:r.currentStage||1,...r.discStartedAt?{discStartedAt:r.discStartedAt}:{},updatedAt:v()},{merge:!0})}async function Ee(e,t,n={}){E();let r=p(w,T.assessments,e),i=await m(r),a=i.exists()?i.data():{};if(a.status===`completed`)throw Error(`This assessment is already completed.`);if(a.expiresAt&&Date.now()>new Date(a.expiresAt).getTime())throw Error(`This assessment link has expired.`);let o=Object.values(t||{}).filter(e=>String(e?.value??e??``).trim()).length,s=Number(n.totalQuestions||Object.keys(t||{}).length||0),c=Number(n.technicalScore||0),l=Number(n.discScore||0),u=Number(n.score||(s?Math.round(o/s*100):0));await y(r,{answers:t,answeredCount:o,totalQuestions:s,score:u,technical:c||u,disc:n.discProfile?.label||(l?`${l}%`:`Submitted`),discScore:l,discProfile:n.discProfile||null,progress:`${o}/${s}`,status:`completed`,finished:new Date().toLocaleString(`en-US`,{month:`short`,day:`numeric`,year:`numeric`,hour:`numeric`,minute:`2-digit`}),finishedAt:v(),updatedAt:v()},{merge:!0});let d=Math.round(u);a.candidateUid&&await y(p(w,T.users,a.candidateUid),{score:d,nwScore:d,lastAssessmentScore:d,lastAssessmentId:e,updatedAt:v()},{merge:!0}).catch(()=>null),a.candidateCode&&await y(p(w,T.candidates,a.candidateCode),{score:d,nwScore:d,lastAssessmentScore:d,lastAssessmentId:e,updatedAt:v()},{merge:!0}).catch(()=>null)}async function De(){return E(),(await h(_(f(w,T.openings),b(`published`,`==`,!0),g(12)))).docs.map(e=>({id:e.id,...e.data()}))}async function Oe(e,t){E();let n=t.code||t.id,r=await me(e).catch(()=>null),i=r?.candidateCode||D(e),a=new Date().toISOString().slice(0,10),o={opening:n,openingCode:n,jobId:n,role:t.title||t.role||`Untitled role`,openingTitle:t.title||t.role||`Untitled role`,applied:a,appliedAt:a,status:`applied`,outcome:`Application only`,source:`talent.nearwork.co`},s={candidateId:e,ownerUid:e,authUid:e,candidateDocId:i,candidateCode:i,candidateEmail:r?.email||``,candidateName:r?.name||``,openingCode:n,jobId:n,openingTitle:t.title||t.role||`Untitled role`,jobTitle:t.title||t.role||`Untitled role`,title:t.title||t.role||`Untitled role`,clientName:t.orgName||t.clientName||t.company||`Nearwork client`,status:`applied`,inPipeline:!1,isMockData:!1,source:`talent.nearwork.co`,createdAt:v(),updatedAt:v()};await u(f(w,T.applications),s),await y(p(w,T.candidates,i),{...ye(e,{...r||{},candidateCode:i,appliedBefore:!0,lastContact:a}),applications:d(o),appliedBefore:!0},{merge:!0}).catch(()=>null),await y(p(w,T.users,e),{role:`candidate`,candidateCode:i,code:i,applications:d(o),lastAppliedOpeningCode:n,lastAppliedAt:v(),updatedAt:v()},{merge:!0}).catch(()=>null),await u(f(w,T.activity),{candidateId:e,type:`application_submitted`,title:s.jobTitle,createdAt:v()}).catch(()=>null),pe(r,t).catch(()=>null)}async function ke(e,t){await ne(p(w,T.users,e),{availability:t,updatedAt:v()})}async function Ae(e,t){E();let n=t.candidateCode||D(e);await y(p(w,T.users,e),{...t,candidateCode:n,role:`candidate`,updatedAt:v()},{merge:!0});try{return await y(p(w,T.candidates,n),ye(e,{...t,candidateCode:n}),{merge:!0}),t.marketingConsent===!0&&je({...t,candidateCode:n,source:`talent.nearwork.co`}).catch(()=>null),{candidateCode:n,atsSynced:!0}}catch(e){return console.warn(`Candidate ATS sync failed.`,e),{candidateCode:n,atsSynced:!1}}}async function je(e){let t=e?.email||C.currentUser?.email||``;return t?(await fetch(`/api/sync-hubspot-candidate`,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify({candidate:{...e,email:t}})})).json().catch(()=>({ok:!1})):{ok:!1,skipped:!0}}async function Me(e,t){E();let n=t.name.replace(/[^a-z0-9._-]/gi,`-`).toLowerCase(),r=oe(le,`candidate-photos/${e}/${Date.now()}-${n}`);await se(r,t,{contentType:t.type||`application/octet-stream`});let i=await ie(r);return await y(p(w,T.users,e),{photoURL:i,updatedAt:v()},{merge:!0}),i}async function Ne(e,t,n){E();let r=null,i=D(e);try{let t=await m(p(w,T.users,e));if(t.exists()){let e=t.data();r=e.activeCvId||null,e.candidateCode&&(i=e.candidateCode)}}catch{}let a=t.name.replace(/[^a-z0-9._-]/gi,`-`).toLowerCase(),o=`candidate-cvs/${e}/${Date.now()}-${a}`,s=oe(le,o);await se(s,t,{contentType:t.type||`application/octet-stream`});let c=await ie(s),l={id:o,name:n||t.name,fileName:t.name,url:c,uploadedAt:new Date().toISOString()};return await y(p(w,T.users,e),{cvLibrary:d(l),activeCvId:l.id,activeCvName:l.name||l.fileName,cvUrl:c,updatedAt:v()},{merge:!0}),y(p(w,T.candidates,i),{cvUrl:c,activeCvId:l.id,activeCvName:l.name||l.fileName,updatedAt:v()},{merge:!0}).catch(()=>null),r&&r!==o&&re(oe(le,r)).catch(()=>{}),l}function Pe(e,t){return E(),e?te(_(f(w,T.notifications),b(`recipientUid`,`==`,e),g(50)),e=>{t(e.docs.map(e=>({id:e.id,...e.data()})).sort((e,t)=>{let n=e.createdAt?.toDate?e.createdAt.toDate().getTime():new Date(e.createdAt||0).getTime();return(t.createdAt?.toDate?t.createdAt.toDate().getTime():new Date(t.createdAt||0).getTime())-n}))}):()=>{}}async function Fe(e){E(),e&&await y(p(w,T.notifications,e),{read:!0,readAt:v()},{merge:!0})}async function Ie(e,t){E(),await y(p(w,T.notificationPreferences,e),{uid:e,app:`talent.nearwork.co`,preferences:t,updatedAt:v()},{merge:!0})}async function Le(e){if(!e)return null;try{let t=await new Promise((t,n)=>{let r=new FileReader;r.onload=()=>t(r.result.split(`,`)[1]),r.onerror=n,r.readAsDataURL(e)}),n=await fetch(`/api/parse-cv`,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify({data:t,filename:e.name,mimeType:e.type||`application/octet-stream`})});if(!n.ok)return null;let r=await n.json();if(r._topKeys&&console.log(`[CV parse] Affinda top-level keys:`,r._topKeys.join(`, `)),!r?.ok)return null;let{name:i,phone:a,city:o,summary:s,skills:c,workHistory:l,languages:u,certifications:d}=r;return{name:i,phone:a,city:o,summary:s,skills:c,workHistory:l,languages:u||[],certifications:d||[]}}catch{return null}}var O=null,k=!1,Re=null,ze=1,A={},j=null,Be=null,M=null,Ve=document.querySelector(`#app`),He=`+573135928691`,Ue=`https://wa.me/573135928691`,N={"Customer Success":[`Customer Success Manager`,`Customer Success Associate`,`Account Manager`,`Implementation Specialist`,`Onboarding Specialist`,`Renewals Manager`],Sales:[`SDR / Sales Development Rep`,`BDR / Business Development Rep`,`Account Executive`,`Sales Operations Specialist`,`Sales Manager`],Support:[`Technical Support Specialist`,`Customer Support Representative`,`Support Team Lead`,`QA Support Analyst`],Operations:[`Operations Manager`,`Operations Analyst`,`Executive Assistant`,`Virtual Assistant`,`Project Coordinator`,`Recruiting Coordinator`],Marketing:[`Marketing Ops / Content Specialist`,`Content Writer`,`SEO Specialist`,`Lifecycle Marketing Specialist`,`Social Media Manager`],Engineering:[`Software Developer (Full Stack)`,`Frontend Developer`,`Backend Developer`,`No-Code Developer`,`Data Analyst`,`QA Engineer`],Finance:[`Bookkeeper`,`Accounting Assistant`,`Financial Analyst`,`Payroll Specialist`]},We={"CRM & Sales":[`HubSpot`,`Salesforce`,`Pipedrive`,`Apollo`,`Outbound`,`Cold Email`,`Discovery Calls`,`CRM Hygiene`],"Customer Success":[`SaaS`,`Customer Success`,`QBRs`,`Onboarding`,`Renewals`,`Expansion`,`Churn Reduction`,`Intercom`,`Zendesk`],Support:[`Technical Support`,`Tickets`,`Troubleshooting`,`APIs`,`Bug Reproduction`,`Help Center`,`CSAT`],Operations:[`Excel`,`Google Sheets`,`Reporting`,`Process Design`,`Project Management`,`Notion`,`Airtable`,`Zapier`],Marketing:[`Content`,`SEO`,`Lifecycle`,`Email Marketing`,`HubSpot Marketing`,`Copywriting`,`Analytics`],Engineering:[`JavaScript`,`React`,`Node.js`,`SQL`,`Python`,`REST APIs`,`QA`,`GitHub`],Language:[`English B2`,`English C1`,`English C2`,`Spanish Native`]},Ge=`Account Management.Accounts Payable.Accounts Receivable.Adobe Creative Suite.Agile.AI Tools.Analytics.Appointment Setting.B2B Sales.B2C Sales.Billing.Bookkeeping.Business Analysis.Canva.Cash Collections.Chat Support.Cold Calling.Community Management.Compliance.Content Strategy.Contract Management.Customer Onboarding.Customer Retention.Customer Service.Data Analysis.Data Entry.Email Support.Excel / Google Sheets.Executive Assistance.Figma.Financial Reporting.Forecasting.Helpdesk.HR Operations.Inbound Calls.Insurance Support.Lead Generation.Live Chat.Logistics.Looker.Microsoft Office.NetSuite.Outbound Calls.Payroll.Performance Marketing.Power BI.Product Support.QuickBooks.Recruiting.Salesforce Administration.Sales Operations.Shopify.Slack.Social Media.SQL Reporting.Stripe.Tableau.Technical Writing.Ticket Quality.Training.Vendor Management.WordPress.Workday.Workforce Management.Zendesk Guide.Zoho`.split(`.`),Ke=[...new Set([...Object.values(We).flat(),...Ge])].sort((e,t)=>e.localeCompare(t)),qe={Amazonas:[`Leticia`,`Puerto Nariño`],Antioquia:[`Medellín`,`Abejorral`,`Apartadó`,`Bello`,`Caldas`,`Caucasia`,`Copacabana`,`El Carmen de Viboral`,`Envigado`,`Girardota`,`Itagüí`,`La Ceja`,`La Estrella`,`Marinilla`,`Rionegro`,`Sabaneta`,`Santa Fe de Antioquia`,`Turbo`],Arauca:[`Arauca`,`Arauquita`,`Saravena`,`Tame`],Atlántico:[`Barranquilla`,`Baranoa`,`Galapa`,`Malambo`,`Puerto Colombia`,`Sabanalarga`,`Soledad`],"Bogotá D.C.":[`Bogotá`],Bolívar:[`Cartagena`,`Arjona`,`El Carmen de Bolívar`,`Magangué`,`Mompox`,`Turbaco`],Boyacá:[`Tunja`,`Chiquinquirá`,`Duitama`,`Paipa`,`Sogamoso`,`Villa de Leyva`],Caldas:[`Manizales`,`Aguadas`,`Chinchiná`,`La Dorada`,`Riosucio`,`Villamaría`],Caquetá:[`Florencia`,`El Doncello`,`Puerto Rico`,`San Vicente del Caguán`],Casanare:[`Yopal`,`Aguazul`,`Paz de Ariporo`,`Villanueva`],Cauca:[`Popayán`,`El Tambo`,`Puerto Tejada`,`Santander de Quilichao`],Cesar:[`Valledupar`,`Aguachica`,`Bosconia`,`Codazzi`],Chocó:[`Quibdó`,`Istmina`,`Nuquí`,`Tadó`],Córdoba:[`Montería`,`Cereté`,`Lorica`,`Sahagún`],Cundinamarca:[`Chía`,`Cajicá`,`Facatativá`,`Fusagasugá`,`Girardot`,`Madrid`,`Mosquera`,`Soacha`,`Tocancipá`,`Zipaquirá`],Guainía:[`Inírida`],Guaviare:[`San José del Guaviare`,`Calamar`,`El Retorno`,`Miraflores`],Huila:[`Neiva`,`Garzón`,`La Plata`,`Pitalito`],"La Guajira":[`Riohacha`,`Maicao`,`San Juan del Cesar`,`Uribia`],Magdalena:[`Santa Marta`,`Ciénaga`,`El Banco`,`Fundación`],Meta:[`Villavicencio`,`Acacías`,`Granada`,`Puerto López`],Nariño:[`Pasto`,`Ipiales`,`Tumaco`,`Túquerres`],"Norte de Santander":[`Cúcuta`,`Ocaña`,`Pamplona`,`Villa del Rosario`],Putumayo:[`Mocoa`,`Orito`,`Puerto Asís`,`Valle del Guamuez`],Quindío:[`Armenia`,`Calarcá`,`La Tebaida`,`Montenegro`,`Quimbaya`],Risaralda:[`Pereira`,`Dosquebradas`,`La Virginia`,`Santa Rosa de Cabal`],"San Andrés y Providencia":[`San Andrés`,`Providencia`],Santander:[`Bucaramanga`,`Barrancabermeja`,`Floridablanca`,`Girón`,`Piedecuesta`,`San Gil`],Sucre:[`Sincelejo`,`Corozal`,`Sampués`,`Tolú`],Tolima:[`Ibagué`,`Espinal`,`Honda`,`Melgar`],"Valle del Cauca":[`Cali`,`Buga`,`Buenaventura`,`Cartago`,`Jamundí`,`Palmira`,`Tuluá`,`Yumbo`],Vaupés:[`Mitú`],Vichada:[`Puerto Carreño`,`La Primavera`,`Santa Rosalía`]},P=qe,Je=[{title:`How to answer salary questions`,tag:`Interview`,read:`4 min`,body:`Use a confident range, anchor it to the role, and avoid apologizing for earning in USD.`,actions:[`Know your floor`,`Use monthly USD`,`Mention flexibility last`]},{title:`Writing a CV for US SaaS companies`,tag:`CV`,read:`6 min`,body:`Translate local experience into metrics US hiring managers can scan in under a minute.`,actions:[`Lead with outcomes`,`Add tools`,`Quantify scope`]},{title:`Before your recruiter screen`,tag:`Process`,read:`3 min`,body:`Prepare availability, compensation, English comfort, and two strong role stories.`,actions:[`Check your setup`,`Review the opening`,`Bring questions`]},{title:`STAR stories that feel natural`,tag:`Interview`,read:`5 min`,body:`Keep stories specific, concise, and tied to business impact instead of job duties.`,actions:[`Situation`,`Action`,`Result`]}],Ye=[{key:`profile-review`,label:`Profile Review`,help:`We are checking role fit and your candidate profile.`},{key:`background-check`,label:`Background Checks`,help:`Nearwork is verifying relevant background and work details.`},{key:`assessment`,label:`Assessment`,help:`Complete role-specific questions when assigned.`},{key:`interview`,label:`Interview`,help:`Meet the recruiter and book your next conversation.`},{key:`presented`,label:`Presented`,help:`Your profile has been prepared for the company.`},{key:`client-review`,label:`Client Review`,help:`The company is reviewing your profile and next steps.`},{key:`hired`,label:`Hired`,help:`Offer accepted and onboarding is ready to begin.`}],F={user:null,candidate:null,applications:[],assessments:[],notifications:[],notificationPanelOpen:!1,notificationSettingsOpen:!1,jobs:[],loading:!0,view:`login`,activePage:`overview`,matchesFiltered:!1,message:``,assessmentUiStep:null},I=null,Xe=sessionStorage.getItem(`nw_restore_path`);Xe&&(sessionStorage.removeItem(`nw_restore_path`),window.history.replaceState({page:Xe},``,Xe));function Ze(){return[[`overview`,`layout-dashboard`,`Overview`],[`matches`,`briefcase-business`,`Matches`],[`applications`,`send`,`Applications`],[`assessment`,`clipboard-check`,`Assessment`],[`cvs`,`files`,`CV Picker`],[`tips`,`book-open`,`Tips`],[`recruiter`,`calendar-days`,`Recruiter`],[`profile`,`user-round-cog`,`Profile`]]}function Qe(){let e=window.location.pathname.split(`/`).filter(Boolean)[0];return e===`onboarding`?`onboarding`:e===`assessment`||e===`assessments`?`assessment`:Ze().some(([t])=>t===e)?e:`overview`}function L(){let e=window.location.pathname.split(`/`).filter(Boolean);return(e[0]===`assessment`||e[0]===`assessments`)&&e[1]||``}function $e(){let e=window.location.pathname.split(`/`).filter(Boolean),t=e.findIndex(e=>e===`q`||e===`question`);if(t===-1)return null;let n=Number(e[t+1]);return Number.isFinite(n)&&n>0?n-1:null}function et(e,t=0){return`/assessment/${encodeURIComponent(e)}/start/q/${Number(t||0)+1}`}function R(e,t=0,n=!1){let r=et(e,t);if(window.location.pathname===r)return;let i=n?`replaceState`:`pushState`;window.history[i]({page:`assessment`,assessmentId:e,questionIndex:t},``,r)}function z(e,t){return`<i data-lucide="${e}" aria-label="${t||e}"></i>`}function tt(){window.lucide&&window.lucide.createIcons()}function B(e){F={...F,...e},Hn()}function nt(e,t=!0){let n=e===`onboarding`||Ze().some(([t])=>t===e)?e:`overview`;F={...F,activePage:n,matchesFiltered:n===`matches`?F.matchesFiltered:!1,message:``,assessmentUiStep:null},t&&window.history.pushState({page:n},``,n===`overview`?`/`:`/${n}`),Hn()}function rt(){return(F.candidate?.name||F.user?.displayName||`there`).split(` `)[0]||`there`}function it(){return(F.candidate?.name||F.user?.displayName||F.user?.email||`NW`).split(/[ @.]/).filter(Boolean).slice(0,2).map(e=>e[0]).join(``).toUpperCase()}function at(e=`normal`){let t=F.candidate?.photoURL||F.user?.photoURL||``,n=e===`large`?`avatar avatar-large`:`avatar`;return t?`<img class="${n}" src="${V(t)}" alt="${V(rt())}" />`:`<div class="${n}">${it()}</div>`}function V(e){return String(e||``).replaceAll(`&`,`&amp;`).replaceAll(`"`,`&quot;`).replaceAll(`<`,`&lt;`).replaceAll(`>`,`&gt;`)}function H(e){return String(e||``).replaceAll(`&`,`&amp;`).replaceAll(`<`,`&lt;`).replaceAll(`>`,`&gt;`).replaceAll(`"`,`&quot;`).replaceAll(`'`,`&#039;`)}function ot(e){if(!e)return`Recently`;let t=e.toDate?e.toDate():new Date(e);return new Intl.DateTimeFormat(`en`,{month:`short`,day:`numeric`}).format(t)}function U(){let e=F.candidate?.skills||[];return Array.isArray(e)?e:String(e).split(`,`).map(e=>e.trim()).filter(Boolean)}function W(e){return String(e||``).toLowerCase().normalize(`NFD`).replace(/[\u0300-\u036f]/g,``).replace(/&/g,` and `).replace(/[^a-z0-9]+/g,` `).trim().replace(/\s+/g,` `)}function st(e,t=U()){let n=J(e),r=new Set((n.skills||[]).map(W).filter(Boolean)),i=new Map(t.map(e=>[W(e),e]).filter(([e])=>e));return[...i.keys()].filter(e=>r.has(e)).map(e=>i.get(e))}function ct(e){return[`Nearwork candidate`,`Talent member`].includes(String(e||``).trim())}function lt(e){if(!e)return null;if(e.toDate)return e.toDate();if(typeof e==`object`&&typeof e.seconds==`number`)return new Date(e.seconds*1e3);let t=new Date(e);return Number.isNaN(t.getTime())?null:t}function ut(e){return Number(e||1)===1?`Technical Assessment`:`DISC Assessment`}function dt(e,t){return e?.answers?.[t?.id]?.value??e?.answers?.[t?.id]??``}function G(e){return e!=null&&e!==``}function K(e,t){return(e?.questions||[]).slice(0,70).filter(e=>Number(e.stage||1)===Number(t))}function ft(e,t,n=e?.answers||{}){return K(e,t).filter(e=>!G(n[e.id]?.value??n[e.id]))}function pt(){return!!((F.applications||[]).length||(F.candidate?.pipelineCodes||[]).length||F.candidate?.pipelineCode)}function mt(){let e=F.candidate?.department||`Bogotá D.C.`,t=P[e]||P[`Bogotá D.C.`]||[`Bogotá`],n=F.candidate?.city||F.candidate?.locationCity||t[0];return{department:e,city:n,label:`${n}, ${e}`}}async function ht(){try{let e=await fetch(`/api/locations?ts=`+Date.now(),{cache:`no-store`}),t=await e.json();if(!e.ok||!t.ok||!t.departments)throw Error(t.error||`Location API unavailable`);P=t.departments}catch(e){console.warn(`Using bundled Colombia locations:`,e.message||e),P=qe}}function gt(){let e=F.candidate?.targetRole||F.candidate?.headline||``;return Object.entries(N).find(([,t])=>t.includes(e))?.[0]||Object.keys(N)[0]}function _t(e){return Object.keys(N).map(t=>`<option value="${V(t)}" ${t===e?`selected`:``}>${t}</option>`).join(``)}function vt(e,t){let n=N[e]||Object.values(N).flat();return[`<option value="">Choose the closest role</option>`].concat(n.map(e=>`<option value="${V(e)}" ${t===e?`selected`:``}>${e}</option>`)).join(``)}function q(e){let t=String(e||``).replace(/[,.\s]+$/,``).replace(/^[,.\s]+/,``).trim();return!t||t.length<2?``:Ke.find(e=>W(e)===W(t))||t.split(/\s+/).map(e=>e.length<=3&&e===e.toUpperCase()?e:e.charAt(0).toUpperCase()+e.slice(1).toLowerCase()).join(` `)}function yt(e){return`
    <div class="skill-search-shell" data-skill-search>
      <div class="selected-skills" id="selectedSkills">
        ${[...new Set((e||[]).map(q).filter(Boolean))].map(e=>`
          <span class="selected-skill" data-skill-chip="${V(e)}">
            ${H(e)}
            <button type="button" class="skill-remove" data-remove-skill="${V(e)}" aria-label="Remove ${V(e)}">×</button>
            <input type="hidden" name="skills" value="${V(e)}" />
          </span>
        `).join(``)||`<span class="skill-empty">Selected skills will appear here.</span>`}
      </div>
      <div class="skill-search-box">
        <input id="skillSearchInput" type="search" autocomplete="off" placeholder="Type any skill — e.g. Salesforce, Excel, B2B sales, Canva…" />
        <button class="secondary-action" type="button" id="addTypedSkill">Add skill</button>
      </div>
      <div class="skill-suggestions" id="skillSuggestions">
        ${[`Customer Service`,`Salesforce`,`HubSpot`,`Excel`,`Google Sheets`,`Technical Support`,`Outbound Calls`,`React`,`SQL`,`Payroll`].map(e=>`<button type="button" class="skill-suggestion" data-skill="${V(e)}">${H(e)}</button>`).join(``)}
      </div>
      <p class="field-hint">Search, select, and remove skills anytime. Use as many as apply to your experience.</p>
    </div>
  `}function bt(e,t=`USD`){let n=Number(String(e||``).replace(/[^\d.]/g,``)),r=String(t||`USD`).toUpperCase()===`COP`?`COP`:`USD`;if(!Number.isFinite(n)||n<=0)return{salary:``,salaryUSD:null,salaryCurrency:r,salaryAmount:null};let i=Math.round(n);return{salary:`${r} ${new Intl.NumberFormat(`en-US`).format(i)}/mo`,salaryUSD:r===`USD`?i:null,salaryCurrency:r,salaryAmount:i}}function xt(e){return Number(String(e||``).replace(/[^\d.]/g,``))}function St(e,t=`USD`){let n=xt(e),r=String(t||`USD`).toUpperCase()===`COP`?`COP`:`USD`;return r===`USD`&&n>=1e5?`COP`:r}function Ct(e,t=`USD`){let n=xt(e);return!Number.isFinite(n)||n<=0?``:new Intl.NumberFormat(`en-US`,{maximumFractionDigits:0}).format(Math.round(n))}function wt(e){return Array.isArray(e)?e:String(e||``).split(`,`).map(e=>e.trim()).filter(Boolean)}function J(e){let t=wt(e.skills||e.requiredSkills);return{id:e.id||e.code,code:e.code||e.id,title:e.title||e.role||e.openingTitle||`Open role`,orgName:e.orgName||e.company||e.clientName||`Nearwork client`,location:e.location||`Remote`,compensation:e.compensation||e.salary||e.rate||`Competitive`,match:e.match||null,skills:t,description:e.description||e.about||`Nearwork is reviewing candidates for this role now.`}}function Y(e){let t=e?.code||``;return t.includes(`operation-not-allowed`)?`This sign-in method is not available yet.`:t.includes(`unauthorized-domain`)?`This website still needs to be approved for sign-in.`:t.includes(`permission-denied`)?`We could not save this yet. Please try again in a moment or contact Nearwork support.`:t.includes(`weak-password`)?`Password must be at least 6 characters.`:t.includes(`invalid-credential`)||t.includes(`wrong-password`)?`That email/password did not match. If this account was created with Google, use Continue with Google.`:t.includes(`user-not-found`)?`No account exists for that email yet.`:t.includes(`email-already-in-use`)?`That email already has an account. Sign in or use Google.`:t.includes(`popup`)?`The Google sign-in popup was closed before finishing.`:`Something went wrong. Please try again or contact Nearwork support.`}function Tt(e){Ve.innerHTML=`
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
  `,tt()}function Et(e=`login`){let t=e===`signup`;Tt(`
    <section class="auth-panel">
      <div class="right-brand">Near<span>work</span></div>
      <div class="candidate-chip">For candidates</div>
      <div class="panel-heading">
        <h2>${t?`Create your account.`:`Welcome back.`}</h2>
        <p>${t?`Create your profile, browse roles, and track your application.`:`Use Google if your candidate account was created with Google.`}</p>
      </div>
      ${F.message?`<div class="notice">${z(`lock`)} ${V(F.message)}</div>`:``}
      ${x?``:`<div class="notice">${z(`triangle-alert`)} Sign-in is still being set up.</div>`}
      <button id="googleSignIn" class="social-action" type="button">
        <span class="google-dot">G</span>
        Continue with Google
      </button>
      <div class="divider"><span></span>or use email<span></span></div>
      <form id="authForm" class="stacked-form">
        ${t?`<label>Full name<input name="name" type="text" autocomplete="name" placeholder="Full name" required /></label>`:``}
        <label>Email<input name="email" type="email" autocomplete="email" placeholder="you@example.com" required /></label>
        <label>Password<input name="password" type="password" autocomplete="${t?`new-password`:`current-password`}" minlength="6" placeholder="••••••••" required /></label>
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
        </div>`:``}
        <button class="primary-action" type="submit">${z(t?`user-plus`:`log-in`)} ${t?`Create account`:`Sign in`}</button>
        <p id="formMessage" class="form-message" role="status"></p>
      </form>
      ${t?``:`<button id="resetPassword" class="text-action small" type="button">Forgot password?</button>`}
      <button id="toggleMode" class="text-action" type="button">${t?`Already have an account? Sign in`:`New or invited by Nearwork? Create your profile`}</button>
    </section>
  `),document.querySelector(`#toggleMode`).addEventListener(`click`,()=>Et(t?`login`:`signup`)),document.querySelector(`#googleSignIn`).addEventListener(`click`,async()=>{let e=document.querySelector(`#formMessage`);if(e.textContent=``,t){let t=document.querySelector(`#privacyConsent`),n=document.querySelector(`#privacyConsentError`);if(t&&!t.checked){n&&(n.style.display=``),e.textContent=`Please accept the Privacy Policy to continue.`,t.scrollIntoView({behavior:`smooth`,block:`center`});return}n&&(n.style.display=`none`)}let n=t?document.querySelector(`#marketingConsent`)?.checked===!0:!1;try{await be(n)}catch(t){e.textContent=Y(t)}}),document.querySelector(`#resetPassword`)?.addEventListener(`click`,async()=>{let e=document.querySelector(`input[name='email']`).value.trim().toLowerCase(),t=document.querySelector(`#formMessage`);if(!e){t.textContent=`Enter your email first, then request a reset link.`;return}try{await a(C,e),t.textContent=`Password reset sent to ${e}.`}catch(e){t.textContent=Y(e)}}),document.querySelector(`#authForm`).addEventListener(`submit`,async e=>{e.preventDefault();let r=new FormData(e.currentTarget),i=document.querySelector(`#formMessage`),a=String(r.get(`email`)).trim().toLowerCase();if(i.textContent=``,t){let e=document.querySelector(`#privacyConsent`),t=document.querySelector(`#privacyConsentError`);if(e&&!e.checked){t&&(t.style.display=``),i.textContent=`Please accept the Privacy Policy to continue.`;return}t&&(t.style.display=`none`)}let s=t?document.querySelector(`#marketingConsent`)?.checked===!0:!1,c=new Date().toISOString();try{if(t){let e=await n(C,a,r.get(`password`));await l(e.user,{displayName:r.get(`name`)}),sessionStorage.setItem(`nw_new_account`,`1`),await _e(e.user.uid,{name:r.get(`name`),email:a,availability:`open`,headline:`Nearwork candidate`,onboarded:!1,source:`talent.nearwork.co`,privacyConsent:!0,privacyConsentAt:c,marketingConsent:s,marketingConsentAt:s?c:null}),fe({name:r.get(`name`),firstName:String(r.get(`name`)||``).trim().split(/\s+/)[0],email:a}).catch(()=>null)}else await o(C,a,r.get(`password`))}catch(e){i.textContent=Y(e)}})}async function Dt(e){B({loading:!0,user:e});try{await ht();let[t,n,r]=await Promise.allSettled([ge(e),xe(e.uid),De()]),i=t.status===`fulfilled`?t.value:null,a=n.status===`fulfilled`?n.value:[],o=r.status===`fulfilled`?r.value:[],s=[];try{s=await Se(e.uid,e.email,i?.candidateCode||i?.code||``)}catch(e){console.warn(e)}let c=L();if(c&&!s.some(e=>e.id===c)){let t=await Ce(c,e.uid,e.email,i?.candidateCode||i?.code||``).catch(()=>null);t&&(s=[t,...s])}let l=sessionStorage.getItem(`nw_new_account`)===`1`;l&&sessionStorage.removeItem(`nw_new_account`);let u=!i?.onboarded&&!i?.targetRole;!i?.onboarded&&i?.targetRole&&Ae(e.uid,{onboarded:!0,candidateCode:i?.candidateCode}).catch(()=>null);let d=l||u?`onboarding`:Qe();B({candidate:{...i||{},name:i?.name||e.displayName||`Talent member`,email:i?.email||e.email,availability:i?.availability||`open`,headline:i?.headline||i?.targetRole||`Nearwork candidate`},applications:a,assessments:s,jobs:o.map(J),loading:!1,view:`dashboard`,activePage:d,message:``}),I&&I(),x&&(I=Pe(e.uid,e=>{F.notifications=e,F.view===`dashboard`&&!F.message&&Mt()}))}catch(t){console.warn(t),B({candidate:{name:e.displayName||`Talent member`,email:e.email,availability:`open`,headline:`Nearwork candidate`},applications:[],assessments:[],jobs:[],loading:!1,view:`dashboard`,activePage:Qe(),message:``})}}async function Ot(){let e=Qe();if(e===`assessment`){sessionStorage.setItem(`nw_restore_path`,window.location.pathname),B({user:null,candidate:null,applications:[],assessments:[],jobs:[],loading:!1,view:`login`,activePage:`overview`,message:`Please log in to open your assessment.`});return}if(e===`overview`){I&&I(),I=null,B({user:null,candidate:null,loading:!1,view:`login`,activePage:`overview`});return}let t=[];try{let e=await De();e.length&&(t=e.map(J))}catch(e){console.warn(e)}B({user:null,candidate:null,applications:[],assessments:[],jobs:t,loading:!1,view:`login`,activePage:`overview`,message:`Please log in to view your profile, matched openings, applications, and assessments.`})}function kt(){return[{label:`My journey`,items:[[`overview`,`layout-dashboard`,`Overview`],[`applications`,`send`,`Applications`],[`assessment`,`clipboard-check`,`Assessment`]]},{label:`My search`,items:[[`matches`,`briefcase-business`,`Matches`],[`cvs`,`files`,`CV Picker`]]},{label:`Support`,items:[[`tips`,`book-open`,`Tips`],[`recruiter`,`calendar-days`,`Recruiter`],[`profile`,`user-round-cog`,`Profile`]]}]}function At(){return{open:`Open to roles`,interviewing:`Interviewing`,paused:`Not looking`}[F.candidate?.availability||`open`]||`Open to roles`}function jt(){let e=F.candidate||{},t=U();return[{id:`name`,label:`Full name`,done:!!e.name},{id:`role`,label:`Target role`,done:!!(e.targetRole||!ct(e.headline)&&e.headline)},{id:`location`,label:`City`,done:!!e.city},{id:`salary`,label:`Salary`,done:!!(e.salaryAmount||e.salary)},{id:`english`,label:`English`,done:!!e.english},{id:`whatsapp`,label:`WhatsApp`,done:!!(e.whatsapp||e.phone)},{id:`skills`,label:`Skills (3+)`,done:t.length>=3},{id:`cv`,label:`CV`,done:!!e.cvUrl}]}function Mt(){let e=(F.notifications||[]).filter(e=>!e.read).length,t=F.candidate?.availability||`open`,n={open:`#16A085`,interviewing:`#EAB308`,paused:`#9E9E9E`}[t]||`#16A085`,r=F.candidate?.name||F.user?.displayName||`Talent member`,i=F.candidate?.headline||F.candidate?.targetRole||`Nearwork candidate`;Ve.innerHTML=`
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
          ${at()}
          <div class="nw-sidebar-profile-text">
            <div class="nw-sidebar-profile-name">${H(r)}</div>
            <div class="nw-sidebar-profile-role">${H(i)}</div>
          </div>
        </div>

        <!-- Nav sections -->
        <nav class="nw-sidebar-nav">
          ${kt().map(e=>`
            <div class="nw-nav-group">
              <div class="nw-nav-group-label">${e.label}</div>
              ${e.items.map(([e,t,n])=>`
                <button class="nw-nav-item${F.activePage===e?` active`:``}" data-page="${e}" type="button">
                  ${z(t)} ${n}
                </button>
              `).join(``)}
            </div>
          `).join(``)}
          <div class="nw-nav-group">
            <a class="nw-nav-item nw-nav-external" href="https://jobs.nearwork.co" target="_blank" rel="noreferrer">
              ${z(`external-link`)} Browse jobs
            </a>
          </div>
        </nav>

        <!-- Sign out -->
        <button id="${F.user?`signOut`:`signIn`}" class="nw-sidebar-signout" type="button">
          ${z(F.user?`log-out`:`log-in`)} ${F.user?`Sign out`:`Sign in`}
        </button>
      </aside>

      <!-- ── Main workspace ── -->
      <section class="nw-workspace">

        <!-- Top bar -->
        <div class="nw-topbar">
          <div class="nw-topbar-search">
            ${z(`search`)}
            <input class="nw-search-input" placeholder="Search roles, companies, skills…" tabindex="-1" />
          </div>
          <div class="nw-topbar-right">
            <!-- Availability pill (wraps the real select for functionality) -->
            <div class="nw-avail-pill">
              <span class="nw-avail-dot" style="background:${n};box-shadow:0 0 0 3px ${n}26;"></span>
              <span class="nw-avail-label">${At()}</span>
              ${z(`chevron-down`)}
              <select id="availability" class="nw-avail-select" aria-label="Availability">
                <option value="open"         ${t===`open`?`selected`:``}>Open to roles</option>
                <option value="interviewing" ${t===`interviewing`?`selected`:``}>Interviewing</option>
                <option value="paused"       ${t===`paused`?`selected`:``}>Not looking</option>
              </select>
            </div>

            <!-- Notifications -->
            <div class="nw-notif-wrap">
              <button class="nw-icon-btn" type="button" id="notificationBell" aria-label="Notifications">
                ${z(`bell`)}
                ${e?`<span class="nw-notif-badge"></span>`:``}
              </button>
              ${F.notificationPanelOpen?Pt():``}
            </div>
            <button class="nw-icon-btn" type="button" id="notificationSettings" aria-label="Settings">
              ${z(`settings`)}
            </button>
          </div>
        </div>

        <!-- Notification settings -->
        ${F.notificationSettingsOpen?Ft():``}

        <!-- Page content -->
        ${F.message?`<div class="notice" style="margin:0 36px;">${F.message}</div>`:``}
        <div class="nw-page-content">
          ${(()=>{try{return zt()}catch(e){return console.error(`renderActivePage error:`,e),`<div class="notice">Page failed to render. <button type="button" data-page="overview">Go to overview</button></div>`}})()}
        </div>
      </section>
    </main>
  `,tt(),jn(),Rt(),Lt()}function Nt(e){return(e?.toDate?e.toDate():new Date(e||Date.now())).toLocaleString(`en-US`,{month:`short`,day:`numeric`,year:`numeric`,hour:`numeric`,minute:`2-digit`})}function Pt(){let e=(F.notifications||[]).slice(0,10);return`
    <div class="notification-panel">
      <div class="notification-panel-head"><strong>Notifications</strong><span>${e.length?`Latest updates`:`All clear`}</span></div>
      ${e.length?e.map(e=>`
        <button class="notification-item ${e.read?``:`unread`}" type="button" data-notification-read="${e.id}">
          <strong>${V(e.title||`Nearwork update`)}</strong>
          <span>${V(e.message||``)}</span>
          <time>${Nt(e.createdAt)}</time>
        </button>
      `).join(``):`<div class="notification-empty">No notifications yet.</div>`}
    </div>
  `}function Ft(){let e=F.candidate?.notificationPreferences||{};return`
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
  `}var It=null;function Lt(){It&&window.clearInterval(It);let e=document.querySelector(`#assessmentTimer`);if(!e)return;let t=new Date(e.dataset.end||``).getTime(),n=()=>{let n=Math.max(0,t-Date.now()),r=Math.floor(n/1e3);e.textContent=`${Math.floor(r/60)}:${String(r%60).padStart(2,`0`)}`,e.classList.toggle(`is-low`,n<=600*1e3),n<=0&&window.clearInterval(It)};n(),It=window.setInterval(n,1e3)}function Rt(){if(F.activePage!==`assessment`)return;let e=F.assessments||[],t=L(),n=(t?e.find(e=>e.id===t):null)||e.find(e=>[`sent`,`started`].includes(String(e.status||``).toLowerCase()));if(!n?.id)return;let r=String(n.status||``).toLowerCase();if(r===`started`&&$e()===null){R(n.id,Number(n.currentQuestionIndex||0),!0);return}if(!t&&r===`sent`){let e=`/assessment/${encodeURIComponent(n.id)}/start`;window.history.replaceState({page:`assessment`,assessmentId:n.id},``,e)}}function zt(){return({onboarding:Vt,overview:Bt,matches:Zt,applications:Qt,assessment:$t,cvs:mn,tips:hn,recruiter:gn,profile:_n}[F.activePage]||Bt)()}function Bt(){let e=xn(),t=jt(),n=t.filter(e=>e.done).length,r=t.length,i=F.applications||[],a=i.filter(e=>[`action-needed`,`interview-scheduled`,`assessment-sent`].includes(String(e.status||``).toLowerCase())).length,o=(F.jobs||[]).slice(0,3),s=F.candidate?.recruiter||{},c=2*Math.PI*52,l=c*(1-e/100),u=new Date().toLocaleDateString(`en-US`,{weekday:`long`,month:`long`,day:`numeric`}),d=(e,t,n,r,i)=>`
    <div class="nw-stat-tile">
      <div class="nw-stat-tile-top">
        <span class="nw-stat-tile-label">${e}</span>
        <div class="nw-stat-icon" style="background:${r}14;">
          ${z(i)}
        </div>
      </div>
      <div class="nw-stat-value">${t}</div>
      <div class="nw-stat-sub">${n}</div>
    </div>`,f=(e,t)=>{let n=[`Applied`,`Assessment`,`Interview`,`Final round`,`Offer`],r=String(e.stage||e.status||`applied`).toLowerCase(),i=r.includes(`offer`)?4:r.includes(`final`)?3:r.includes(`interview`)?2:+!!r.includes(`assessment`),o=e.clientName||e.company||`Nearwork client`,s=o.split(/\s+/).slice(0,2).map(e=>e[0]).join(``).toUpperCase(),c=[`#16A085`,`#AF7AC5`,`#E74C7C`,`#3B82F6`,`#EAB308`],l=c[o.length%c.length];return`
      <div class="nw-app-row${t?` last`:``}">
        <div class="nw-app-avatar" style="background:${l};">${s}</div>
        <div class="nw-app-info">
          <div class="nw-app-title">${H(e.jobTitle||e.title||`Application`)} <span class="nw-app-company">· ${H(o)}</span></div>
          <div class="nw-app-stages">
            ${n.map((e,t)=>`<div class="nw-stage-pip${t<=i?` done`:``}"></div>`).join(``)}
            <span class="nw-app-stage-label">${e.stage||e.status||`Applied`}</span>
          </div>
        </div>
        <div class="nw-app-meta">
          <span class="nw-app-status${a?` action`:``}">${e.status||`In review`}</span>
          <div class="nw-app-date">${ot(e.updatedAt||e.createdAt)}</div>
        </div>
        ${z(`chevron-right`)}
      </div>`},p=e=>{let t=J(e),n=st(t),r=t.match||(n.length>=3?Math.min(97,70+n.length*4):null),i=[`#16A085`,`#AF7AC5`,`#E74C7C`,`#3B82F6`],a=i[t.orgName.length%i.length],o=t.orgName.split(/\s+/).slice(0,2).map(e=>e[0]).join(``).toUpperCase(),s=`https://jobs.nearwork.co/apply?code=${encodeURIComponent(t.code)}`;return`
      <div class="nw-match-card">
        <div class="nw-match-card-top">
          <div class="nw-match-avatar" style="background:${a};">${o}</div>
          ${r?`<div class="nw-match-score">${r}%</div>`:``}
        </div>
        <div class="nw-match-role">${H(t.title)}</div>
        <div class="nw-match-company">${H(t.orgName)} · ${H(t.location)}</div>
        ${n.length?`<div class="nw-match-why">${n.slice(0,3).map(H).join(` · `)} match</div>`:`<div class="nw-match-why">${H(t.description).slice(0,80)}…</div>`}
        <div class="nw-match-footer">
          <span class="nw-match-salary">${H(t.compensation)}</span>
          <a href="${s}" target="_blank" rel="noreferrer" class="nw-match-apply">Apply ${z(`arrow-right`)}</a>
        </div>
      </div>`};return`
    <!-- Greeting -->
    <div class="nw-overview-header">
      <div class="nw-overview-date">Overview · ${u}</div>
      <h1 class="nw-overview-greeting">
        Hi ${H(rt())},
        ${a>0?`<span class="nw-greeting-muted">you have</span> <span class="nw-greeting-accent">${a} thing${a>1?`s`:``}</span> <span class="nw-greeting-muted">that need you.</span>`:`<span class="nw-greeting-muted">let's get you matched.</span>`}
      </h1>
    </div>

    <!-- Readiness card -->
    <div class="nw-readiness-card">
      <div class="nw-readiness-donut">
        <svg viewBox="0 0 120 120" style="width:100%;height:100%;transform:rotate(-90deg);">
          <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,0.12)" stroke-width="8"/>
          <circle cx="60" cy="60" r="52" fill="none" stroke="#16A085" stroke-width="8"
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
        <h2 class="nw-readiness-title">${n>=r?`Your profile is complete — you're ready to match.`:`${r-n} more step${r-n>1?`s`:``} and Nearwork can boost your matches.`}</h2>
        <div class="nw-readiness-checklist">
          ${t.map(e=>`
            <div class="nw-check-pill${e.done?` done`:``}">
              ${z(e.done?`check`:`circle`)} ${e.label}
            </div>`).join(``)}
        </div>
        <div class="nw-readiness-actions">
          <button class="nw-finish-btn" type="button" data-page="profile">
            ${n>=r?`View profile`:`Finish profile`} ${z(`arrow-right`)}
          </button>
          <span class="nw-readiness-count">${n} of ${r} complete</span>
        </div>
      </div>
    </div>

    <!-- Stat tiles -->
    <div class="nw-stat-grid">
      ${d(`Open matches`,F.jobs.length,F.jobs.length?`${F.jobs.length} role${F.jobs.length>1?`s`:``} waiting`:`Complete profile to unlock`,`#16A085`,`sparkles`)}
      ${d(`Applications`,i.length,i.length?`${a||`0`} need your input`:`Not applied yet`,`#AF7AC5`,`send`)}
      ${d(`Interviews`,i.filter(e=>String(e.stage||e.status||``).toLowerCase().includes(`interview`)).length,`Scheduled`,`Not yet scheduled`,`#E74C7C`,`calendar-clock`)}
      ${d(`CVs saved`,(F.candidate?.cvLibrary||[]).length,`In your library`,`Upload your first CV`,`#555555`,`files`)}
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
          ${i.length?`<button class="nw-ghost-btn" type="button" data-page="applications">All applications ${z(`arrow-right`)}</button>`:``}
        </div>
        ${i.length?i.slice(0,4).map((e,t)=>f(e,t===Math.min(i.length,4)-1)).join(``):`<div class="nw-empty">
              ${z(`briefcase`)}
              <strong>No active pipeline yet</strong>
              <p>Browse openings and apply — we'll show your pipeline here once an application moves forward.</p>
              <div style="display:flex;gap:8px;margin-top:12px;">
                <button class="nw-btn-primary" type="button" data-page="matches">${z(`sparkles`)} View matches</button>
                <a class="nw-btn-secondary" href="https://jobs.nearwork.co" target="_blank" rel="noreferrer">${z(`external-link`)} Open jobs</a>
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
            ${z(`bell`)}
            <strong>Nothing yet</strong>
            <p>Movement on your search lands here.</p>
          </div>
        </section>

        <!-- Recruiter card (dark) -->
        <section class="nw-recruiter-dark">
          <div class="nw-recruiter-overline">Your talent partner</div>
          <div class="nw-recruiter-row">
            <div class="nw-recruiter-avatar">${s.initials||`NW`}</div>
            <div>
              <div class="nw-recruiter-name">${H(s.name||`Nearwork Support`)}</div>
              <div class="nw-recruiter-role">${H(s.role||`Talent Partner`)}</div>
            </div>
          </div>
          <p class="nw-recruiter-bio">I'll review every match and prep you before each interview. Reach out anytime.</p>
          <div class="nw-recruiter-btns">
            <a class="nw-recruiter-msg" href="mailto:${V(s.email||`support@nearwork.co`)}">${z(`message-square-text`)} Message</a>
            <a class="nw-recruiter-call" href="https://wa.me/${encodeURIComponent((s.whatsapp||`+1`).replace(/\D/g,``))}" target="_blank" rel="noreferrer">${z(`calendar-plus`)} WhatsApp</a>
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
          <button class="nw-ghost-btn" type="button" data-page="matches">See all ${z(`arrow-right`)}</button>
        </div>
        <div class="nw-match-grid">
          ${o.map(e=>p(e)).join(``)}
        </div>
      </section>
    `:``}
  `}function Vt(){ze=1;let e=F.candidate||{};return A={roleGroup:e.roleGroup||``,targetRole:e.targetRole||``,department:e.department||e.locationDepartment||``,city:e.city||e.locationCity||``,salary:String(e.salaryAmount||e.salary||``),english:e.english||``,name:e.name||``,whatsapp:e.whatsapp||e.phone||``,linkedin:e.linkedin||``},j=null,Be=null,M=null,`<div id="onboardingWizard" class="onb-shell"></div>`}function Ht(){document.querySelector(`#onboardingWizard`)&&X(ze)}function X(e){ze=e;let t=document.querySelector(`#onboardingWizard`);t&&(t.innerHTML=Kt(e),Jt(e))}function Ut(e){return`
    <div style="display:flex;align-items:center;gap:5px;margin-bottom:28px;">
      ${Array.from({length:4},(t,n)=>`
        <div style="height:5px;border-radius:3px;flex:${n<e?2:1};background:${n<e?`var(--green)`:`var(--border)`};transition:all .3s;"></div>
      `).join(``)}
      <span style="margin-left:6px;font-size:11px;font-weight:600;color:var(--light);white-space:nowrap;">${e<=4?`${e} / 4`:`Review`}</span>
    </div>`}function Z(e,t,n){return`<label style="display:flex;flex-direction:column;gap:5px;font-size:11px;font-weight:600;letter-spacing:.07em;text-transform:uppercase;color:var(--light);">${e}${t?`<span style="font-weight:400;font-size:10px;text-transform:none;letter-spacing:0;opacity:.7;">(optional)</span>`:``} ${n}</label>`}function Wt(e,t,n,r,i=``){return`<input id="${e}" type="${t}" value="${V(n||``)}" placeholder="${V(r)}" ${i} style="font-size:14px;padding:10px 12px;border:1.5px solid var(--border);border-radius:8px;background:#fff;outline:none;width:100%;box-sizing:border-box;" />`}function Gt(e,t){return`<div style="display:flex;justify-content:space-between;align-items:center;margin-top:28px;">
    ${e?`<button type="button" id="onbBack" class="secondary-action">← Back</button>`:`<span></span>`}
    <button type="button" id="onbNext" class="primary-action">${t||`Continue →`}</button>
  </div>`}function Kt(e){let t=A;switch(e){case 1:{let e=!!j;return`
        <div class="onb-step">
          ${Ut(1)}
          <p class="eyebrow">Step 1 · Your CV</p>
          <h2 class="onb-heading">Upload your CV to get started</h2>
          <p class="onb-sub">We'll extract your experience, skills, and contact info automatically — so you don't have to type it all out.</p>
          <div class="upload-box" style="margin-bottom:4px;" id="onbCvBox">
            <input id="onbCvInput" type="file" accept=".pdf,.doc,.docx" style="display:none;" />
            <label for="onbCvInput" class="upload-trigger">${z(`upload`)} Choose file</label>
            <p id="onbCvStatus" style="font-size:12px;color:var(--green);min-height:18px;margin:0;">${e?`✓ ${H(j.name)}`:``}</p>
            <p>PDF or Word · max 10 MB</p>
          </div>
          <div style="display:flex;justify-content:space-between;align-items:center;margin-top:24px;">
            <button type="button" id="onbSkipCv" style="background:none;border:none;font-size:13px;color:var(--light);cursor:pointer;text-decoration:underline;padding:0;">Skip — I'll fill in manually</button>
            <button type="button" id="onbNext" class="primary-action" ${e?``:`disabled`}>Continue →</button>
          </div>
        </div>`}case 2:{let e=t.roleGroup||Object.keys(N)[0]||``;return`
        <div class="onb-step">
          ${Ut(2)}
          <p class="eyebrow">Step 2 · Role</p>
          <h2 class="onb-heading">What role are you looking for?</h2>
          <p class="onb-sub">We use this to match you with the right openings from our clients.</p>
          <div style="display:grid;gap:12px;margin-bottom:4px;">
            ${Z(`Area`,!1,`<select id="onbRoleGroup" style="font-size:14px;padding:10px 12px;border:1.5px solid var(--border);border-radius:8px;background:#fff;outline:none;">${_t(e)}</select>`)}
            ${Z(`Role`,!1,`<select id="onbTargetRole" style="font-size:14px;padding:10px 12px;border:1.5px solid var(--border);border-radius:8px;background:#fff;outline:none;">${vt(e,t.targetRole||``)}</select>`)}
          </div>
          ${Gt(1)}
        </div>`}case 3:{let e=t.department||Object.keys(P)[0]||``,n=P[e]||[];return`
        <div class="onb-step">
          ${Ut(3)}
          <p class="eyebrow">Step 3 · Location & compensation</p>
          <h2 class="onb-heading">Where are you based?</h2>
          <p class="onb-sub">This helps us narrow down roles by location and align on salary expectations.</p>
          <div style="display:grid;gap:12px;margin-bottom:4px;">
            ${Z(`Department`,!1,`<select id="onbDept" style="font-size:14px;padding:10px 12px;border:1.5px solid var(--border);border-radius:8px;background:#fff;outline:none;">${Object.keys(P).map(t=>`<option value="${V(t)}" ${t===e?`selected`:``}>${H(t)}</option>`).join(``)}</select>`)}
            ${Z(`City`,!1,`<select id="onbCity" style="font-size:14px;padding:10px 12px;border:1.5px solid var(--border);border-radius:8px;background:#fff;outline:none;">${n.map(e=>`<option value="${V(e)}" ${e===t.city?`selected`:``}>${H(e)}</option>`).join(``)}</select>`)}
            ${Z(`Target monthly salary (USD)`,!0,Wt(`onbSalary`,`number`,t.salary||``,`e.g. 2000`,`min="0"`))}
            ${Z(`English level`,!1,`<select id="onbEnglish" style="font-size:14px;padding:10px 12px;border:1.5px solid var(--border);border-radius:8px;background:#fff;outline:none;">${[``,`B1`,`B2`,`C1`,`C2`,`Native`].map(e=>`<option value="${e}" ${e===t.english?`selected`:``}>${e||`Select level`}</option>`).join(``)}</select>`)}
          </div>
          ${Gt(2)}
        </div>`}case 4:{let e=t.name||F.candidate?.name||F.user?.displayName||``,n=t.whatsapp||(M?.phone??``);return`
        <div class="onb-step">
          ${Ut(4)}
          <p class="eyebrow">Step 4 · Contact</p>
          <h2 class="onb-heading">How can we reach you?</h2>
          <p class="onb-sub">Your WhatsApp number is how our recruiters will contact you directly.</p>
          <div style="display:grid;gap:12px;margin-bottom:4px;">
            ${Z(`Full name`,!1,Wt(`onbName`,`text`,e,`Your full name`,`autocomplete="name"`))}
            ${Z(`WhatsApp number`,!1,Wt(`onbWhatsapp`,`tel`,n,`+57 300 123 4567`,`autocomplete="tel"`))}
            ${Z(`LinkedIn`,!0,Wt(`onbLinkedin`,`url`,t.linkedin||``,`https://linkedin.com/in/...`,``))}
          </div>
          <p id="onbContactError" style="font-size:12px;color:#e74c3c;min-height:16px;margin:4px 0 0;"></p>
          ${Gt(3,`Review →`)}
        </div>`}case 5:return qt();default:return``}}function qt(){let e=A,t=M||{},n=e.name||t.name||F.candidate?.name||`—`,r=e.targetRole||`—`,i=[e.city,e.department].filter(Boolean).join(`, `)||`—`,a=e.salary?`USD ${Number(e.salary).toLocaleString()}/mo`:`—`,o=e.english||`—`,s=e.whatsapp||`—`,c=t.skills||[],l=t.workHistory||[],u=j?.name||``,d=(e,t)=>!t||t===`—`?``:`
    <div style="display:flex;gap:16px;padding:10px 0;border-bottom:1px solid var(--border);">
      <span style="width:110px;flex-shrink:0;font-size:10px;font-weight:700;letter-spacing:.07em;text-transform:uppercase;color:var(--light);padding-top:3px;">${e}</span>
      <span style="font-size:13px;color:var(--black);line-height:1.5;">${H(String(t))}</span>
    </div>`;return`
    <div class="onb-step">
      <p class="eyebrow" style="color:var(--green);">Almost done</p>
      <h2 class="onb-heading">Does this look right?</h2>
      <p class="onb-sub" style="margin-bottom:20px;">Review your profile before we save it. You can always update it later from Settings.</p>
      <div style="border:1.5px solid var(--border);border-radius:12px;padding:2px 16px 2px;margin-bottom:24px;">
        ${d(`Name`,n)}
        ${d(`Role`,r)}
        ${d(`Location`,i)}
        ${d(`Salary`,a)}
        ${d(`English`,o)}
        ${d(`WhatsApp`,s)}
        ${u?d(`CV`,u):``}
        ${c.length?`
          <div style="display:flex;gap:16px;padding:10px 0;border-bottom:1px solid var(--border);">
            <span style="width:110px;flex-shrink:0;font-size:10px;font-weight:700;letter-spacing:.07em;text-transform:uppercase;color:var(--light);padding-top:6px;">Skills</span>
            <div style="display:flex;flex-wrap:wrap;gap:4px;">
              ${c.slice(0,12).map(e=>`<span style="background:var(--bg);border:1px solid var(--border);border-radius:999px;padding:3px 10px;font-size:11px;color:var(--mid);">${H(e)}</span>`).join(``)}
              ${c.length>12?`<span style="font-size:11px;color:var(--light);padding:4px 6px;">+${c.length-12} more</span>`:``}
            </div>
          </div>`:``}
        ${l.length?`
          <div style="display:flex;gap:16px;padding:10px 0;">
            <span style="width:110px;flex-shrink:0;font-size:10px;font-weight:700;letter-spacing:.07em;text-transform:uppercase;color:var(--light);padding-top:4px;">Experience</span>
            <div style="display:flex;flex-direction:column;gap:8px;">
              ${l.map(e=>`
                <div>
                  <p style="font-size:13px;font-weight:600;color:var(--black);margin:0;">${H(e.title||`—`)}</p>
                  <p style="font-size:12px;color:var(--mid);margin:2px 0 0;">${H(e.company||``)}${e.from?` · ${e.from} → ${e.to===`present`?`Present`:e.to||`?`}`:``}</p>
                </div>`).join(``)}
            </div>
          </div>`:``}
      </div>
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <button type="button" id="onbEdit" class="secondary-action">← Edit</button>
        <button type="button" id="onbFinish" class="primary-action">${z(`check`)} Finish setup</button>
      </div>
      <p id="onbFinishErr" style="font-size:12px;color:#e74c3c;text-align:right;min-height:18px;margin-top:6px;"></p>
    </div>`}function Jt(e){let t=document.querySelector(`#onbBack`),n=document.querySelector(`#onbNext`);switch(t?.addEventListener(`click`,()=>X(e-1)),e){case 1:{let e=document.querySelector(`#onbCvInput`),t=document.querySelector(`#onbCvStatus`),r=document.querySelector(`#onbSkipCv`);j&&e&&(n.disabled=!1),e?.addEventListener(`change`,()=>{let r=e.files?.[0];r&&(j=r,t&&(t.textContent=`✓ ${r.name}`),n.disabled=!1,M=null,Be=Le(r).catch(()=>null))}),n?.addEventListener(`click`,()=>X(2)),r?.addEventListener(`click`,()=>{j=null,Be=null,X(2)});break}case 2:{let e=document.querySelector(`#onbRoleGroup`),t=document.querySelector(`#onbTargetRole`);e?.addEventListener(`change`,()=>{t.innerHTML=vt(e.value,``)}),n?.addEventListener(`click`,()=>{A.roleGroup=e?.value||``,A.targetRole=t?.value||``,X(3)});break}case 3:{let e=document.querySelector(`#onbDept`),t=document.querySelector(`#onbCity`);e?.addEventListener(`change`,()=>{t.innerHTML=(P[e.value]||[]).map(e=>`<option value="${V(e)}">${H(e)}</option>`).join(``)}),n?.addEventListener(`click`,()=>{A.department=e?.value||``,A.city=t?.value||``,A.salary=document.querySelector(`#onbSalary`)?.value||``,A.english=document.querySelector(`#onbEnglish`)?.value||``,X(4)});break}case 4:n?.addEventListener(`click`,()=>{let e=document.querySelector(`#onbName`)?.value.trim(),t=document.querySelector(`#onbWhatsapp`)?.value.trim(),n=document.querySelector(`#onbContactError`);if(!t){n&&(n.textContent=`WhatsApp number is required.`),document.querySelector(`#onbWhatsapp`)?.focus();return}A.name=e,A.whatsapp=t,A.linkedin=document.querySelector(`#onbLinkedin`)?.value.trim()||``,Yt()});break;case 5:document.querySelector(`#onbEdit`)?.addEventListener(`click`,()=>X(1)),document.querySelector(`#onbFinish`)?.addEventListener(`click`,Xt);break}}async function Yt(){let e=document.querySelector(`#onboardingWizard`);e&&(Be&&!M&&(e.innerHTML=`<div class="onb-step"><p style="text-align:center;font-size:14px;font-weight:600;color:var(--green);padding:56px 0;">Finalising your profile…</p></div>`,M=await Be),M?.phone&&!A.whatsapp&&(A.whatsapp=M.phone),M?.name&&!A.name&&(A.name=M.name),X(5))}async function Xt(){let e=document.querySelector(`#onbFinish`),t=document.querySelector(`#onbFinishErr`);e&&(e.disabled=!0,e.innerHTML=`Saving…`);try{let e=A,t=M||{},n=F.user?.uid;if(!n)throw Error(`Not signed in`);let r=bt(e.salary||``,`USD`),i=e.department||``,a=e.city||``,o={};if(j)try{let e=await Ne(n,j,``);o={activeCvId:e.id,activeCvName:e.name||e.fileName,cvUrl:e.url,cvLibrary:[e]}}catch{}let s={name:e.name||t.name||F.candidate?.name||F.user?.displayName||``,targetRole:e.targetRole||``,headline:e.targetRole||``,department:i,city:a,location:[a,i].filter(Boolean).join(`, `),locationCity:a,locationDepartment:i,locationCountry:`Colombia`,locationId:`${String(a).toLowerCase().normalize(`NFD`).replace(/[̀-ͯ]/g,``).replace(/[^a-z0-9]+/g,`-`)}-co`,english:e.english||``,salary:r.salary,salaryUSD:r.salaryUSD,salaryAmount:r.salaryAmount,salaryCurrency:`USD`,expectedSalaryAmount:r.salaryAmount,expectedSalaryCurrency:`USD`,whatsapp:e.whatsapp||``,phone:e.whatsapp||``,linkedin:e.linkedin||``,skills:[...new Set((t.skills||[]).map(q).filter(Boolean))],workHistory:t.workHistory||[],certifications:t.certifications||[],languages:t.languages||[],summary:t.summary||``,email:F.candidate?.email||F.user?.email||``,candidateCode:F.candidate?.candidateCode,marketingConsent:F.candidate?.marketingConsent===!0,availability:`open`,onboarded:!0,...o};await Ae(n,s),window.history.pushState({page:`overview`},``,`/`),B({candidate:{...F.candidate,...s},activePage:`overview`,message:`Welcome to Nearwork! Your profile is ready.`})}catch{t&&(t.textContent=`Something went wrong. Please try again.`),e&&(e.disabled=!1,e.innerHTML=`${z(`check`)} Finish setup`)}}function Zt(){let e=F.candidate?.targetRole||(ct(F.candidate?.headline)?``:F.candidate?.headline),t=U(),n=F.jobs.map(J).filter(e=>st(e,t).length>=3),r=t.length>=3,i=F.matchesFiltered&&r?n:F.jobs.map(J),a=F.matchesFiltered&&!n.length;return`
    <section class="section-block">
      <div class="section-heading">
        <div><p class="eyebrow">Openings</p><h2>${F.matchesFiltered?`Best fit from your profile`:`All current openings`}</h2></div>
        <button id="filterMatches" class="secondary-action" type="button">${z(F.matchesFiltered?`list`:`filter`)} ${F.matchesFiltered?`Show all openings`:`Filter by my role & skills`}</button>
      </div>
      <div class="match-note"><strong>${i.length}</strong> of <strong>${F.jobs.length}</strong> openings showing. Matches require <strong>3+ shared skills</strong>. Role: <strong>${e||`not set`}</strong>. Skills: <strong>${t.join(`, `)||`not set`}</strong>.</div>
      <div class="job-list">${a?kn(`No filtered matches yet`,`Add a target role and skills in Profile to improve matching.`):i.map(e=>En(e)).join(``)}</div>
    </section>
  `}function Qt(){return`
    <section class="section-block">
      <div class="section-heading"><div><p class="eyebrow">Pipeline</p><h2>Your applications</h2></div></div>
      ${pt()?Cn(Sn()):wn()}
      <div class="timeline page-gap">${F.applications.length?F.applications.map(Dn).join(``):kn(`No applications yet`,`Apply to a role and your process will show here.`)}</div>
    </section>
  `}function $t(){let e=L(),t=F.assessments||[],n=t.filter(e=>[`sent`,`started`].includes(String(e.status||``).toLowerCase())),r=t.filter(e=>String(e.status||``).toLowerCase()===`completed`),i=e?t.find(t=>t.id===e):n[0]||r[0]||null;if(F.assessmentUiStep===`techIntro`&&i)return sn(i);if(F.assessmentUiStep===`discIntro`&&i)return cn(i);if(e&&!i)return`
      <div class="nw-assess-wrap nw-assess-state-page">
        <div class="nw-assess-state-card">
          <div class="nw-assess-state-icon" style="background:#FEF0F5;color:#CC3666">${z(`link-2-off`)}</div>
          <strong>This link isn't available</strong>
          <p>Make sure you're logged into the same account that received the assessment email. If the problem persists, reach out to your Nearwork recruiter.</p>
          <button class="primary-action fit" data-page="recruiter" type="button">${z(`message-circle`)} Contact support</button>
        </div>
      </div>
    `;if(!i)return`
      <div class="nw-assess-wrap nw-assess-state-page">
        <div class="nw-assess-state-card">
          <div class="nw-assess-state-icon">${z(`inbox`)}</div>
          <strong>No assessment assigned yet</strong>
          <p>Your assessment will appear here when Nearwork sends it. You'll receive an email notification when it's ready.</p>
          <div class="nw-assess-info-row">
            <div class="nw-assess-info-item">${z(`shield-check`)}<span>One attempt</span></div>
            <div class="nw-assess-info-item">${z(`timer`)}<span>~45–90 min</span></div>
            <div class="nw-assess-info-item">${z(`users`)}<span>Recruiter reviewed</span></div>
          </div>
        </div>
      </div>
    `;let a=Array.isArray(i.questions)?i.questions:[],o=String(i.status||``).toLowerCase()===`started`,s=String(i.status||``).toLowerCase()===`completed`,c=String(i.status||``).toLowerCase()===`cancelled`,l=on(i),u=$e(),d=Number(i.currentQuestionIndex||0),f=Math.min(u??d,Math.max(a.length-1,0)),p=a[f]?.stage||i.currentStage||1,m=o&&!s&&!c&&!l;return`
    <div class="nw-assess-wrap">
      ${m?nn(i,p,f,a):en(i)}
      ${m?tn(i,f):``}
      <div class="nw-assess-body" id="assessmentWorkspace">
        ${s?ln(i):c?`<div class="nw-assess-state-card nw-assess-state-card--inline"><div class="nw-assess-state-icon" style="background:#F5F4F0;color:#555">${z(`ban`)}</div><strong>Assessment cancelled</strong><p>This assessment is no longer available. A new assigned assessment will appear here when your recruiter sends one.</p></div>`:l?`<div class="nw-assess-state-card nw-assess-state-card--inline"><div class="nw-assess-state-icon" style="background:#FEF0F5;color:#CC3666">${z(`clock-x`)}</div><strong>Assessment link expired</strong><p>This unique assessment link is no longer valid. Contact your Nearwork recruiter if you need a new one.</p><button class="ghost-action" data-page="recruiter" type="button">${z(`message-circle`)} Contact recruiter</button></div>`:rn(i,o,f)}
      </div>
      ${un(t,i.id)}
    </div>
  `}function en(e){let t=String(e.status||``).toLowerCase();return`
    <div class="nw-assess-chrome">
      <div class="nw-assess-chrome__logo">
        <div class="nw-assess-chrome__logotile">N</div>
        <span class="nw-assess-chrome__brand">Nearwork</span>
        <div class="nw-assess-chrome__divider"></div>
        <span class="nw-assess-chrome__sub">Candidate assessment</span>
      </div>
      <div style="flex:1"></div>
      ${[`completed`,`cancelled`].includes(t)?``:`<button class="nw-assess-chrome__exit" type="button">${z(`x`)} Save &amp; exit</button>`}
    </div>
  `}function tn(e,t){let n=(e.questions||[]).slice(0,70),r=K(e,1).filter(t=>G(dt(e,t))).length,i=K(e,2).filter(t=>G(dt(e,t))).length;return`
    <section class="assessment-progress-panel">
      <div><strong>Technical</strong><span>${r}/${K(e,1).length||50} answered</span></div>
      <div><strong>DISC</strong><span>${i}/${K(e,2).length||20} answered</span></div>
      <div class="assessment-progress-strip">
        ${n.map((n,r)=>{let i=G(dt(e,n));return`<button type="button" class="${r===t?`active`:``} ${i?`answered`:``}" data-assessment-jump="${r}" title="${ut(n.stage)} · Q${r+1}">${r+1}</button>`}).join(``)}
      </div>
    </section>
  `}function nn(e,t,n,r){let i=Number(t||1),a=lt(e.technicalStartedAt||e.startedAt)||new Date,o=lt(e.discStartedAt)||new Date,s=i===1?a:o,c=Number(i===1?e.technicalMinutes||60:e.discMinutes||30),l=new Date(s.getTime()+c*60*1e3),u=i===1?`Technical`:`DISC profile`,d=(r||[]).filter(e=>Number(e.stage||1)===i),f=(r||[]).findIndex(e=>Number(e.stage||1)===i),p=Math.max(0,n-f),m=d.length?Math.round((p+1)/d.length*100):2;return`
    <div class="nw-assess-chrome nw-assess-chrome--active">
      <div class="nw-assess-chrome__logo">
        <div class="nw-assess-chrome__logotile">N</div>
        <span class="nw-assess-chrome__brand">Nearwork</span>
        <div class="nw-assess-chrome__divider"></div>
        <span class="nw-assess-chrome__sub">Candidate assessment</span>
      </div>
      <div class="nw-assess-chrome__center">
        <div class="nw-assess-chrome__section">
          ${z(`clipboard-check`)}
          <span>${u} &middot; Question ${p+1} of ${d.length||(i===1?50:20)}</span>
        </div>
        <div class="nw-assess-chrome__progresstrack">
          <div class="nw-assess-chrome__progressfill" style="width:${Math.max(2,m)}%"></div>
        </div>
      </div>
      <div class="nw-timer-pill">
        ${z(`timer`)}
        <span id="assessmentTimer" data-end="${l.toISOString()}">${c}:00</span>
      </div>
      <button class="nw-assess-chrome__exit" type="button">${z(`x`)} Save &amp; exit</button>
    </div>
  `}function rn(e,t,n=null){if(!t){let t=V(e.role||`Role assessment`),n=V(e.recruiterName||e.recruiter||`Nearwork`),r=ot(e.expiresAt||e.deadline),i=K(e,1).length||50,a=K(e,2).length||20,o=Number(e.technicalMinutes||60),s=Number(e.discMinutes||30);return`
      <div class="nw-assess-welcome">
        <div class="nw-assess-welcome__header">
          <span class="nw-assess-role-chip">${z(`sparkles`)} ${t}</span>
          <span>Sent by ${n}${r?` &middot; expires `+r:``}</span>
        </div>
        <h2 class="nw-assess-welcome__title">Let's see how you think — and how you work.</h2>
        <p class="nw-assess-welcome__desc">This assessment has two parts: a role-knowledge check and a behavioral profile.</p>
        <div class="nw-assess-parts">
          <div class="nw-assess-part">
            <div class="nw-assess-part__blob" style="background:#E8F8F5"></div>
            <div class="nw-assess-part__icon" style="background:#E8F8F5;color:#16A085">${z(`code-2`)}</div>
            <span class="nw-assess-part__tag" style="color:#16A085">Part 1</span>
            <strong class="nw-assess-part__title">Technical Assessment</strong>
            <span class="nw-assess-part__sub">${i} questions &middot; ~${o} min</span>
            <p class="nw-assess-part__desc">Single-choice role scenarios. We're looking at how you think, not whether you remember definitions.</p>
          </div>
          <div class="nw-assess-part">
            <div class="nw-assess-part__blob" style="background:#F7F2FC"></div>
            <div class="nw-assess-part__icon" style="background:#F7F2FC;color:#AF7AC5">${z(`compass`)}</div>
            <span class="nw-assess-part__tag" style="color:#AF7AC5">Part 2</span>
            <strong class="nw-assess-part__title">DISC Profile</strong>
            <span class="nw-assess-part__sub">${a} statements &middot; ~${s} min</span>
            <p class="nw-assess-part__desc">How you work, communicate, and lead under pressure. No right or wrong answers.</p>
          </div>
        </div>
        <div class="nw-assess-rules">
          <div class="nw-assess-rule"><div class="nw-assess-rule__icon">${z(`wifi`)}</div><div><strong>Stable connection</strong><span>Progress saves on every answer.</span></div></div>
          <div class="nw-assess-rule"><div class="nw-assess-rule__icon">${z(`timer`)}</div><div><strong>Timed sections</strong><span>A countdown runs per stage.</span></div></div>
          <div class="nw-assess-rule"><div class="nw-assess-rule__icon">${z(`lock`)}</div><div><strong>One attempt</strong><span>Take it when you can give it your full focus.</span></div></div>
          <div class="nw-assess-rule"><div class="nw-assess-rule__icon">${z(`eye-off`)}</div><div><strong>No proctoring</strong><span>No camera or screen recording.</span></div></div>
        </div>
        <div class="nw-assess-welcome__cta">
          <button class="primary-action" id="showTechIntro" type="button">${z(`arrow-right`)} Begin assessment</button>
          <span>Questions are timed. Open when you're ready to focus.</span>
        </div>
      </div>
    `}let r=(e.questions||[]).slice(0,70),i=Math.min(n??Number(e.currentQuestionIndex||0),Math.max(r.length-1,0)),a=r[i],o=e.answers?.[a.id]?.value??e.answers?.[a.id]??``,s=Array.isArray(a.options)&&a.options.length?a.options:[`Strongly agree`,`Agree`,`Neutral`,`Disagree`],c=r[i+1]?.stage,l=c&&c!==a.stage,u=ft(e,a.stage),d=l&&u.length,f=i+1>=r.length,p=f?ft(e,a.stage):[],m=!!a.multiple,h=Number(a.stage||1)===2?`nw-assess-chip--violet`:`nw-assess-chip--teal`,ee=m?`Multi-select`:`Single choice`,g=V(a.part||a.type||(Number(a.stage||1)===2?`DISC`:`Scenario`)),te=V(a.bank||``);return`
    <form id="assessmentQuestionForm" class="nw-assess-qcard" data-current-index="${i}">
      <div class="nw-assess-qmeta">
        <span class="nw-assess-chip ${h}">${g}</span>
        ${te?`<span class="nw-assess-chip nw-assess-chip--gray">${te}</span>`:``}
        <span class="nw-assess-qtype">&middot; ${ee}</span>
      </div>
      ${a.context?`<div class="nw-assess-context"><strong>Context: </strong>${V(a.context)}</div>`:``}
      <p class="nw-assess-qprompt">${V(a.q||``)}</p>
      <fieldset class="nw-assess-options${m?` nw-assess-options--multi`:``}">
        <legend>${ee}</legend>
        ${s.map((e,t)=>`
          <label class="nw-assess-option${m?` nw-assess-option--multi`:``}">
            <input type="radio" name="answer" value="${t}" ${String(o)===String(t)?`checked`:``} />
            <span class="nw-assess-option__key">${String.fromCharCode(65+t)}</span>
            <span class="nw-assess-option__text">${V(e)}</span>
            ${m?``:`<span class="nw-assess-option__check">${z(`check-circle-2`)}</span>`}
          </label>
        `).join(``)}
      </fieldset>
      ${d||p.length?an(e,d?u:p,a.stage):``}
      <div class="nw-assess-qfooter">
        <button class="ghost-action" id="prevAssessmentQuestion" type="button" ${i===0?`disabled`:``}>${z(`arrow-left`)} Back</button>
        <span class="nw-assess-autosave">${z(`check`)} Auto-saved</span>
        <div style="flex:1"></div>
        <button class="primary-action fit" type="submit">${f?z(`send`)+` Submit assessment`:`Next `+z(`arrow-right`)}</button>
      </div>
    </form>
  `}function an(e,t,n){if(!t.length)return``;let r=(e.questions||[]).slice(0,70);return`
    <div class="nw-assess-missed">
      <strong>${z(`alert-triangle`)} Unanswered questions in ${ut(n)}</strong>
      <p>You skipped ${t.map(e=>`Question ${r.findIndex(t=>t.id===e.id)+1}`).join(`, `)}. You can go back now or continue if you meant to leave them blank.</p>
      <div class="nw-assess-missed__links">${t.map(e=>{let t=r.findIndex(t=>t.id===e.id);return`<button class="ghost-action" type="button" data-assessment-jump="${t}">${z(`arrow-left`)} Go to ${t+1}</button>`}).join(``)}</div>
    </div>
  `}function on(e){return!e?.expiresAt||String(e.status||``).toLowerCase()===`completed`?!1:Date.now()>new Date(e.expiresAt).getTime()}function sn(e){let t=V(e.role||`Role assessment`),n=K(e,1).length||50,r=Number(e.technicalMinutes||60);return`
    <div class="nw-assess-wrap">
      ${en(e)}
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
            <button class="primary-action" id="startAssessment" type="button">${z(`play`)} Start Part 1</button>
            <button class="ghost-action" id="backToWelcome" type="button">${z(`arrow-left`)} Back</button>
          </div>
        </div>
      </div>
    </div>
  `}function cn(e){let t=K(e,1).length||50,n=K(e,2).length||20,r=Number(e.discMinutes||30),i=V(e.recruiterName||e.recruiter||`your recruiter`),a=(e.questions||[]).findIndex(e=>Number(e.stage||1)===2);return`
    <div class="nw-assess-wrap">
      ${en(e)}
      <div class="nw-assess-body">
        <div style="background:#E8F8F5;border-bottom:1px solid rgba(22,160,133,0.15);padding:13px 20px;display:flex;align-items:center;gap:12px;margin-bottom:24px;border-radius:10px">
          <div style="width:26px;height:26px;border-radius:50%;background:#16A085;color:#fff;display:flex;align-items:center;justify-content:center;flex-shrink:0">${z(`check`)}</div>
          <div style="flex:1">
            <div style="font-size:13px;font-weight:600;color:#0E6B58">Part 1 complete — nice work.</div>
            <div style="font-size:12px;color:#12866E;margin-top:1px">${t}/${t} answered &middot; submitted to ${i} for review</div>
          </div>
          <span class="nw-assess-chip nw-assess-chip--teal">${z(`trophy`)} Part 1 done</span>
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
            <div class="nw-assess-rule"><div class="nw-assess-rule__icon" style="color:#AF7AC5">${z(`users-round`)}</div><div><strong>No right answers</strong><span>This measures style, not performance.</span></div></div>
            <div class="nw-assess-rule"><div class="nw-assess-rule__icon" style="color:#AF7AC5">${z(`timer`)}</div><div><strong>${r} min total</strong><span>Go with your first instinct.</span></div></div>
            <div class="nw-assess-rule"><div class="nw-assess-rule__icon" style="color:#AF7AC5">${z(`shield-check`)}</div><div><strong>Used for fit</strong><span>Helps match you with the right team.</span></div></div>
            <div class="nw-assess-rule"><div class="nw-assess-rule__icon" style="color:#AF7AC5">${z(`check`)}</div><div><strong>Auto-saved</strong><span>Progress saves on every answer.</span></div></div>
          </div>
          <div class="nw-assess-welcome__cta" style="margin-top:8px">
            <button class="primary-action" id="startDiscAssessment" data-disc-index="${a>=0?a:50}" type="button">${z(`play`)} Start Part 2</button>
          </div>
        </div>
      </div>
    </div>
  `}function ln(e){let t=(F.candidate?.name||F.user?.displayName||``).split(` `)[0]||`You`,n=V(e.recruiterName||e.recruiter||`your recruiter`),r=K(e,1).length||50,i=K(e,2).length||20;return`
    <div class="nw-assess-complete">
      <div class="nw-assess-complete__hero">
        <div class="nw-assess-complete__icon">
          ${z(`check`)}
          <div class="nw-assess-complete__ring1"></div>
          <div class="nw-assess-complete__ring2"></div>
        </div>
        <h2 class="nw-assess-complete__title">You're done, ${V(t)}.</h2>
        <p class="nw-assess-complete__desc">Your results have been sent to ${n}. They'll reach out personally — usually within a business day.</p>
      </div>
      <div class="nw-assess-complete__chips">
        <span class="nw-assess-complete__chip nw-assess-complete__chip--teal">${z(`clipboard-check`)} Part 1 &middot; ${r}/${r} answered</span>
        <span class="nw-assess-complete__chip nw-assess-complete__chip--violet">${z(`compass`)} Part 2 &middot; ${i}/${i} answered</span>
        <span class="nw-assess-complete__chip nw-assess-complete__chip--gray">${z(`check-circle-2`)} Assessment complete</span>
      </div>
      <div class="nw-assess-next">
        <div class="nw-assess-next__label">What happens next</div>
        ${[{icon:`inbox`,title:`Your recruiter reviews your results`,desc:`${n} will read your scenarios and DISC profile, usually within one business day.`,when:`Within 24h`},{icon:`message-square`,title:`A personal note from ${n}`,desc:`Not an automated email. They'll share what stood out and what comes next.`,when:`Tomorrow`},{icon:`calendar-check`,title:`Interview with the hiring team`,desc:`If there's a match, you'll get a calendar link to book a slot that works for you.`,when:`This week`}].map(({icon:e,title:t,desc:n,when:r},i)=>`
          <div class="nw-assess-next__item">
            <div class="nw-assess-next__icon-wrap">
              <div class="nw-assess-next__iconbox">${z(e)}</div>
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
        <button class="ghost-action" data-page="recruiter" type="button">${z(`message-circle`)} Message recruiter</button>
      </div>
    </div>
  `}function un(e,t){return e.length?`
    <section class="section-block page-gap">
      <div class="section-heading"><div><p class="eyebrow">Assessment center</p><h2>Your assessment history</h2></div></div>
      <div class="assessment-history-list">
        ${e.map(e=>`
          <article class="assessment-history-row ${e.id===t?`active`:``}">
            <div><strong>${V(e.role||`Nearwork assessment`)}</strong><span>${V(e.id||``)}</span></div>
            <div>${V(String(e.status||`assigned`))}</div>
            <a href="/assessment/${encodeURIComponent(e.id)}/start">${e.status===`completed`?`View`:`Continue`}</a>
          </article>
        `).join(``)}
      </div>
    </section>
  `:``}function dn(e,t){let n=e.questions||[],r=n.filter(e=>e.stage===1),i=n.filter(e=>e.stage===2),a=r.filter(e=>typeof e.correctIndex==`number`&&Number(t[e.id]?.value)===e.correctIndex).length,o=i.filter(e=>G(t[e.id]?.value??t[e.id])).length;return{technicalScore:r.length?Math.round(a/r.length*100):0,discScore:i.length?Math.round(o/i.length*100):0}}function fn(e,t){let n={Dominance:0,Influence:0,Steadiness:0,Conscientiousness:0};(e.questions||[]).filter(e=>Number(e.stage)===2).forEach(e=>{let r=t[e.id]?.value;if(!G(r))return;let i=n[e.skill]===void 0?`Steadiness`:e.skill,a=Math.max(1,4-Number(r||0));n[i]+=a});let r=Object.entries(n).sort((e,t)=>t[1]-e[1]),i=r[0]?.[0]||`Steadiness`,a=r[r.length-1]?.[0]||`Dominance`;return{label:{Dominance:`D`,Influence:`I`,Steadiness:`S`,Conscientiousness:`C`}[i]||`S`,high:i,low:a,scores:n,summary:`${i} is the strongest observed DISC tendency; ${a} appears lowest based on this assessment.`}}async function pn(e,t){let n=`https://admin.nearwork.co/api/send-email`,r=e.candidateEmail||F.user?.email||F.candidate?.email,i=e.candidateName||F.candidate?.name||F.user?.displayName||`there`,a=wt([e.recruiterEmail,e.stakeholderEmail,e.hiringManagerEmail].filter(Boolean).join(`,`)),o=[];r&&o.push(fetch(n,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify({to:r,templateId:`assessment_completed_candidate`,data:{name:i,role:e.role,actionUrl:`https://talent.nearwork.co/assessment`,actionText:`Open assessment center`}})}));let s=a.length?a:[`support@nearwork.co`];o.push(fetch(n,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify({to:s,templateId:`assessment_completed_recruiter`,data:{name:`Nearwork team`,role:e.role,actionUrl:`https://admin.nearwork.co/assessments/${e.id}/questions`,actionText:`Review assessment`,message:`${i} completed the assessment. Overall: ${t.score}%. Technical: ${t.technicalScore}%. DISC: ${t.discProfile?.label||`Submitted`}.`}})})),await Promise.allSettled(o)}function mn(){let e=F.candidate?.cvLibrary||[];return`
    <section class="section-block">
      <div class="section-heading"><div><p class="eyebrow">CV picker</p><h2>Store multiple resumes</h2></div></div>
      <form id="cvForm" class="upload-box">
        ${z(`upload-cloud`)}<strong>Upload a CV for this role</strong><p>Save multiple versions and pick the best one for each opening.</p>
        <input name="cv" type="file" accept=".pdf,.doc,.docx" required />
        <input name="label" type="text" placeholder="CV label, e.g. CSM resume" />
        <button class="primary-action fit" type="submit">Upload CV</button>
      </form>
      <div class="cv-list">
        ${e.length?e.map(e=>`<article class="cv-item">${z(`file-text`)}<div><strong>${e.name||e.fileName}</strong><span>${ot(e.uploadedAt)}</span></div>${e.url?`<a href="${e.url}" target="_blank" rel="noreferrer">Open</a>`:``}</article>`).join(``):kn(`No CVs saved yet`,`Upload role-specific resumes here.`)}
      </div>
    </section>
  `}function hn(){return`
    <section class="tips-hero"><div><p class="eyebrow">Candidate guide</p><h2>Practical prep for US SaaS interviews.</h2><p>Short, useful guidance candidates can read before recruiter screens, assessments, and client interviews.</p></div></section>
    <section class="tips-grid rich">
      ${Je.map((e,t)=>`
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
  `}function gn(){let e=(F.candidate?.recruiter||{}).bookingUrl||F.candidate?.recruiterBookingUrl||`mailto:support@nearwork.co?subject=Nearwork%20candidate%20question`;return`
    <section class="content-grid">
      <div class="section-block"><div class="section-heading"><div><p class="eyebrow">Recruiter</p><h2>Your Nearwork contact</h2></div></div>${On(!0)}</div>
      <div class="section-block compact"><div class="section-heading"><div><p class="eyebrow">Booking</p><h2>Schedule soon</h2></div></div><p class="muted">Ask the Nearwork recruiting team for the earliest available slot. Candidate booking links can be attached to this profile later.</p><a class="primary-action fit" href="${e}" target="_blank" rel="noreferrer">${z(`calendar-plus`)} Book recruiter call</a></div>
    </section>
  `}function _n(){return bn(`profile`)}function Q(e,t=!1){return`<span class="pf-label">${e}${t?`<span class="pf-optional">optional</span>`:``}</span>`}function $(e,t,n=``){return`
    <div class="pf-card-head">
      <div class="pf-card-icon">${z(e)}</div>
      <div class="pf-card-title">${t}</div>
      ${n?`<span class="pf-card-badge">${n}</span>`:``}
    </div>`}function vn(e,t={}){let n=e;return`
    <div class="pf-sub-card work-entry" data-work-index="${n}">
      <div class="pf-sub-card-left">
        <div class="pf-work-avatar">${(t.company||`?`)[0].toUpperCase()}</div>
      </div>
      <div class="pf-sub-card-body">
        <div class="pf-field-row">
          <label class="pf-field">
            ${Q(`Job title`)}
            <input type="text" class="pf-input work-field" data-field="title" value="${V(t.title||``)}" placeholder="e.g. Customer Success Manager" />
          </label>
          <label class="pf-field">
            ${Q(`Company`)}
            <input type="text" class="pf-input work-field" data-field="company" value="${V(t.company||``)}" placeholder="e.g. Acme Corp" />
          </label>
        </div>
        <div class="pf-field-row pf-field-row--3">
          <label class="pf-field">
            ${Q(`From`)}
            <input type="text" class="pf-input work-field" data-field="from" value="${V(t.from||``)}" placeholder="2021-03" />
          </label>
          <label class="pf-field">
            ${Q(`To`)}
            <input type="text" class="pf-input work-field" data-field="to" value="${V(t.to||``)}" placeholder="present" />
          </label>
          <div></div>
        </div>
      </div>
      <button type="button" class="pf-remove-btn remove-work-entry" data-remove="${n}" aria-label="Remove">
        ${z(`x`)}
      </button>
    </div>`}function yn(e,t={}){let n=e;return`
    <div class="pf-sub-card cert-entry" data-cert-index="${n}">
      <div class="pf-sub-card-left">
        <div class="pf-cert-icon">✓</div>
      </div>
      <div class="pf-sub-card-body">
        <div class="pf-field-row">
          <label class="pf-field">
            ${Q(`Certificate / Course`)}
            <input type="text" class="pf-input cert-field" data-field="name" value="${V(t.name||``)}" placeholder="e.g. Google Analytics" />
          </label>
          <label class="pf-field">
            ${Q(`Issuer`,!0)}
            <input type="text" class="pf-input cert-field" data-field="issuer" value="${V(t.issuer||``)}" placeholder="e.g. Coursera, HubSpot" />
          </label>
        </div>
        <label class="pf-field" style="max-width:200px;">
          ${Q(`Date (YYYY-MM)`,!0)}
          <input type="text" class="pf-input cert-field" data-field="date" value="${V(t.date||``)}" placeholder="2023-06" />
        </label>
      </div>
      <button type="button" class="pf-remove-btn remove-cert-entry" data-remove="${n}" aria-label="Remove">
        ${z(`x`)}
      </button>
    </div>`}function bn(e=`profile`){let t=U(),n=mt(),r=P[n.department]||[],i=F.candidate?.salaryCurrency||`USD`,a=bt(F.candidate?.salaryAmount||F.candidate?.salary||F.candidate?.salaryUSD,i),o=gt(),s=F.candidate?.targetRole||F.candidate?.headline||``,c=xn(),l=jt(),u=l.filter(e=>e.done).length;return`
    <div class="pf-page">

      <!-- Page header -->
      <div class="pf-page-header">
        <div>
          <div class="pf-page-overline">${e===`onboarding`?`Setup`:`Candidate profile`}</div>
          <h1 class="pf-page-title">${e===`onboarding`?`Let's build your profile.`:`Improve your match quality.`}</h1>
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
      <div class="pf-progress-label">${u} of ${l.length} sections complete</div>

      <form id="profileForm" class="pf-form">

        <!-- ── Identity ── -->
        <div class="pf-card">
          ${$(`user-round`,`Identity`)}
          <div class="pf-identity-row">
            <div class="pf-avatar-upload">
              ${at(`large`)}
              <label class="pf-photo-btn">
                ${z(`camera`)} Change photo
                <input name="photo" type="file" accept="image/png,image/jpeg,image/webp" style="display:none;" />
              </label>
            </div>
            <div class="pf-field" style="flex:1;">
              ${Q(`Full name`)}
              <input class="pf-input" name="name" value="${V(F.candidate?.name||F.user?.displayName||``)}" placeholder="Your full name" />
            </div>
          </div>
        </div>

        <!-- ── Role ── -->
        <div class="pf-card">
          ${$(`briefcase-business`,`Role applying for`)}
          <div class="pf-field-row">
            <label class="pf-field">
              ${Q(`Area`)}
              <select class="pf-input" name="roleGroup" id="roleGroupSelect">
                ${_t(o)}
              </select>
            </label>
            <label class="pf-field">
              ${Q(`Target role`)}
              <select class="pf-input" name="targetRole" id="targetRoleSelect">
                ${vt(o,s)}
              </select>
            </label>
          </div>
        </div>

        <!-- ── Location ── -->
        <div class="pf-card">
          ${$(`map-pin`,`Location`)}
          <div class="pf-field-row">
            <label class="pf-field">
              ${Q(`Department`)}
              <select class="pf-input" name="department" id="departmentSelect">
                ${Object.keys(P).map(e=>`<option value="${V(e)}" ${e===n.department?`selected`:``}>${e}</option>`).join(``)}
              </select>
            </label>
            <label class="pf-field">
              ${Q(`City`)}
              <select class="pf-input" name="city" id="citySelect">
                ${r.map(e=>`<option value="${V(e)}" ${e===n.city?`selected`:``}>${e}</option>`).join(``)}
              </select>
            </label>
          </div>
        </div>

        <!-- ── Compensation ── -->
        <div class="pf-card">
          ${$(`banknote`,`Compensation & English`)}
          <div class="pf-field-row pf-field-row--3">
            <label class="pf-field">
              ${Q(`Target monthly salary`)}
              <div class="pf-salary-wrap">
                <select id="salaryCurrencyInput" name="salaryCurrency" class="pf-currency-select">
                  <option value="USD" ${a.salaryCurrency===`USD`?`selected`:``}>USD</option>
                  <option value="COP" ${a.salaryCurrency===`COP`?`selected`:``}>COP</option>
                </select>
                <input class="pf-input pf-salary-input" id="salaryInput" name="salary" value="${V(a.salary||``)}" inputmode="numeric" placeholder="2,500" />
              </div>
            </label>
            <label class="pf-field">
              ${Q(`English level`)}
              <select class="pf-input" name="english">
                ${[``,`B1`,`B2`,`C1`,`C2`,`Native`].map(e=>`<option value="${e}" ${F.candidate?.english===e?`selected`:``}>${e||`Select level`}</option>`).join(``)}
              </select>
            </label>
            <label class="pf-field">
              ${Q(`Other languages`,!0)}
              <input class="pf-input" name="languages" value="${V((F.candidate?.languages||[]).join(`, `))}" placeholder="Spanish, French…" />
            </label>
          </div>
        </div>

        <!-- ── Contact ── -->
        <div class="pf-card">
          ${$(`phone`,`Contact`)}
          <div class="pf-field-row">
            <label class="pf-field">
              ${Q(`WhatsApp number`)}
              <input class="pf-input" name="whatsapp" value="${V(F.candidate?.whatsapp||F.candidate?.phone||``)}" inputmode="tel" autocomplete="tel" placeholder="+57 300 123 4567" required />
            </label>
            <label class="pf-field">
              ${Q(`LinkedIn`,!0)}
              <input class="pf-input" name="linkedin" value="${V(F.candidate?.linkedin||``)}" placeholder="https://linkedin.com/in/…" />
            </label>
          </div>
        </div>

        <!-- ── Skills ── -->
        <div class="pf-card">
          ${$(`sparkles`,`Skills`,t.length?`${t.length} added`:``)}
          <p class="pf-hint">Search for skills and add everything that applies to your experience.</p>
          ${yt(t)}
        </div>

        <!-- ── CV ── -->
        <div class="pf-card" id="profileCvCard">
          ${$(`file-text`,`CV`)}
          <p class="pf-hint">Upload the CV you want Nearwork to use for your applications.</p>
          ${F.candidate?.activeCvName||F.candidate?.cvUrl?`
            <div class="pf-cv-current">
              <div class="pf-cv-icon">${z(`file-text`)}</div>
              <div class="pf-cv-info">
                <strong>${H(F.candidate.activeCvName||`CV on file`)}</strong>
                <span>Currently active · upload below to replace</span>
              </div>
              ${F.candidate.cvUrl?`<a class="pf-cv-open" href="${V(F.candidate.cvUrl)}" target="_blank" rel="noreferrer">${z(`external-link`)} Open</a>`:``}
            </div>`:``}
          <label class="pf-file-label" for="profileCvFileInput">
            ${z(`upload`)} Choose file (.pdf, .doc, .docx)
          </label>
          <input id="profileCvFileInput" name="profileCv" type="file" accept=".pdf,.doc,.docx" style="display:none;" />
          <label class="pf-field" style="margin-top:10px;">
            ${Q(`CV label`,!0)}
            <input class="pf-input" name="profileCvLabel" type="text" placeholder="e.g. Customer Success CV" />
          </label>
        </div>

        <!-- ── Summary ── -->
        <div class="pf-card">
          ${$(`align-left`,`Summary`,`optional`)}
          <textarea class="pf-input pf-textarea" name="summary" placeholder="Add a short note about what you do best — 2–3 sentences.">${H(F.candidate?.summary||``)}</textarea>
        </div>

        <!-- ── Work history ── -->
        <div class="pf-card" id="workHistoryCard">
          ${$(`building-2`,`Work experience`,`optional`)}
          <p class="pf-hint">Add your previous roles so recruiters can see your background.</p>
          <div id="workEntries" class="pf-entries">
            ${(F.candidate?.workHistory||[]).map((e,t)=>vn(t,e)).join(``)}
          </div>
          <button type="button" id="addWorkEntry" class="pf-add-btn">
            ${z(`plus`)} Add position
          </button>
        </div>

        <!-- ── Certifications ── -->
        <div class="pf-card" id="certCard">
          ${$(`graduation-cap`,`Certifications &amp; courses`,`optional`)}
          <p class="pf-hint">Add certificates, licences, or courses relevant to your work.</p>
          <div id="certEntries" class="pf-entries">
            ${(F.candidate?.certifications||[]).map((e,t)=>yn(t,e)).join(``)}
          </div>
          <button type="button" id="addCertEntry" class="pf-add-btn">
            ${z(`plus`)} Add certificate
          </button>
        </div>

        <input type="hidden" name="mode" value="${e}" />

        <!-- Save -->
        <div class="pf-footer">
          <button class="pf-save-btn" type="submit">
            ${z(`save`)} ${e===`onboarding`?`Finish setup`:`Save profile`}
          </button>
          <span class="pf-footer-hint">Changes save to your profile instantly.</span>
        </div>

      </form>
    </div>
  `}function xn(){let e=[`name`,`targetRole`,`department`,`city`,`english`,`salary`,`whatsapp`],t=e.filter(e=>e===`targetRole`?!!(F.candidate?.targetRole||!ct(F.candidate?.headline)&&F.candidate?.headline):!!F.candidate?.[e]).length+ +!!U().length;return Math.max(25,Math.round(t/(e.length+1)*100))}function Sn(){let e=F.applications[0];return e?.stage||e?.status||`profile-review`}function Cn(e){let t=String(e||``).toLowerCase().replace(/_/g,`-`).replace(/\s+/g,`-`),n=Math.max(0,Ye.findIndex(e=>t.includes(e.key)||e.key.includes(t)));return`<div class="pipeline">${Ye.map((e,t)=>`<article class="${t<=n?`done`:``} ${t===n?`current`:``}"><span>${t+1}</span><strong>${e.label}</strong><p>${e.help}</p></article>`).join(``)}</div>`}function wn(){return`
    <div class="empty-state">
      ${z(`briefcase-business`)}
      <strong>No active pipeline yet</strong>
      <p>Browse current openings and apply when you find a role that fits. Nearwork will show a pipeline here after an application moves forward.</p>
      <div class="empty-actions">
        <button class="primary-action fit" type="button" data-page="matches">${z(`sparkles`)} View matches</button>
        <a class="secondary-action" href="https://jobs.nearwork.co" target="_blank" rel="noreferrer">${z(`external-link`)} Open jobs</a>
      </div>
    </div>
  `}function Tn(){try{return new Set(JSON.parse(localStorage.getItem(`nw_talent_applied`)||`[]`))}catch{return new Set}}function En(e){let t=J(e),n=new Set(F.applications.map(e=>e.jobId||e.openingCode)).has(t.code)||Tn().has(t.code),r=st(t),i=`https://jobs.nearwork.co/apply?code=${encodeURIComponent(t.code)}`;return`
    <article class="job-card">
      <div>
        ${r.length>=3?`<div class="match-pill">${r.length} skill match</div>`:t.match?`<div class="match-pill">${t.match}% match</div>`:``}
        <h3><a href="${i}" target="_blank" rel="noreferrer" style="color:inherit;text-decoration:none;" onmouseover="this.style.textDecoration='underline'" onmouseout="this.style.textDecoration='none'">${t.title}</a></h3>
        <p>${t.location}</p>
      </div>
      <p class="job-description">${t.description}</p>
      <div class="skill-row">${t.skills.slice(0,4).map(e=>`<span>${e}</span>`).join(``)}</div>
      ${r.length>=3?`<p class="field-hint">Matched skills: ${r.slice(0,5).map(H).join(`, `)}</p>`:``}
      <div class="job-footer">
        <strong>${t.compensation}</strong>
        <div style="display:flex;gap:8px;align-items:center;">
          <a href="${i}" target="_blank" rel="noreferrer" class="secondary-action" style="text-decoration:none;font-size:12px;opacity:0.75;">View opening ↗</a>
          <button class="secondary-action" type="button" data-apply="${t.code}" ${n?`disabled`:``}>${n?`Applied ✓`:`Apply`}</button>
        </div>
      </div>
    </article>
  `}function Dn(e){return`<article class="timeline-item"><span>${z(`circle-dot`)}</span><div><strong>${e.jobTitle||e.title||`Application`}</strong><p>${e.clientName||e.company||`Nearwork`} · ${e.status||`submitted`}</p><small>${ot(e.updatedAt||e.createdAt)}</small></div></article>`}function On(e=!1){let t=F.candidate?.recruiter||{},n=t.email||`support@nearwork.co`,r=t.whatsapp||He,i=t.whatsappUrl||Ue;return`<article class="recruiter-card"><div class="avatar recruiter-avatar">NW</div><div><strong>${t.name||`Nearwork Support`}</strong><p><a href="mailto:${n}">${n}</a></p><p><a href="${i}" target="_blank" rel="noreferrer">WhatsApp ${r}</a></p>${e?`<span>Questions about assessments, interviews, feedback, or CV selection should go here.</span>`:``}</div></article>`}function kn(e,t){return`<div class="empty-state">${z(`inbox`)}<strong>${e}</strong><p>${t}</p></div>`}function An(){Ve.innerHTML=`<main class="loading-screen"><span class="logo-mark">N</span><p>Loading Talent...</p></main>`}function jn(){document.querySelector(`#signOut`)?.addEventListener(`click`,async()=>{await c(C),I&&I(),I=null,window.history.pushState({page:`overview`},``,`/`),B({user:null,candidate:null,applications:[],assessments:[],jobs:[],view:`login`,activePage:`overview`,message:``})}),document.querySelector(`#signIn`)?.addEventListener(`click`,()=>{window.history.pushState({page:`overview`},``,`/`),B({view:`login`,activePage:`overview`,message:``})}),document.querySelectorAll(`[data-page]`).forEach(e=>{e.addEventListener(`click`,e=>{nt((e.currentTarget.closest(`[data-page]`)||e.currentTarget).dataset.page)})}),document.querySelector(`[data-dashboard-home]`)?.addEventListener(`click`,()=>nt(`overview`)),document.querySelector(`#notificationBell`)?.addEventListener(`click`,()=>{B({notificationPanelOpen:!F.notificationPanelOpen,notificationSettingsOpen:!1})}),document.querySelector(`#notificationSettings`)?.addEventListener(`click`,()=>{B({notificationSettingsOpen:!F.notificationSettingsOpen,notificationPanelOpen:!1})}),document.querySelectorAll(`[data-notification-read]`).forEach(e=>{e.addEventListener(`click`,async()=>{let t=e.dataset.notificationRead;F.user&&x&&await Fe(t).catch(()=>null),B({notifications:F.notifications.map(e=>e.id===t?{...e,read:!0}:e)})})}),document.querySelectorAll(`[data-notification-pref]`).forEach(e=>{e.addEventListener(`change`,async()=>{let t=structuredClone(F.candidate?.notificationPreferences||{}),n=e.dataset.notificationPref,r=e.dataset.channel;t[n]={...t[n]||{},[r]:e.checked},B({candidate:{...F.candidate,notificationPreferences:t}}),F.user&&x&&await Ie(F.user.uid,t).catch(()=>null)})}),document.querySelectorAll(`[data-assessment-jump]`).forEach(e=>{e.addEventListener(`click`,async()=>{let t=L()||(F.assessments||[])[0]?.id,n=(F.assessments||[]).find(e=>e.id===t),r=Number(e.dataset.assessmentJump||0),i=n?.questions?.[r];!t||!i||(await Te(t,`__progress__`,``,{currentQuestionIndex:r,totalQuestions:n?.questions?.length||70,currentStage:i.stage||1}),R(t,r),B({assessments:(F.assessments||[]).map(e=>e.id===t?{...e,currentQuestionIndex:r,currentStage:i.stage||1}:e),activePage:`assessment`,message:``}))})}),document.querySelector(`#availability`).addEventListener(`change`,async e=>{let t=e.target.value;B({candidate:{...F.candidate,availability:t}}),F.user&&x?await ke(F.user.uid,t):B({message:`Sign in with Google to save availability.`})}),document.querySelector(`#filterMatches`)?.addEventListener(`click`,()=>{let e=U().length>=3;B({matchesFiltered:e?!F.matchesFiltered:!1,message:e?``:`Add at least 3 skills in Profile first, then filter matching openings.`})}),document.querySelector(`#departmentSelect`)?.addEventListener(`change`,e=>{let t=document.querySelector(`#citySelect`);t.innerHTML=(P[e.target.value]||[]).map(e=>`<option value="${V(e)}">${e}</option>`).join(``)}),document.querySelector(`#roleGroupSelect`)?.addEventListener(`change`,e=>{let t=document.querySelector(`#targetRoleSelect`);t.innerHTML=vt(e.target.value,``)}),document.querySelector(`#salaryCurrencyInput`)?.addEventListener(`change`,e=>{let t=document.querySelector(`#salaryInput`);if(!t)return;let n=St(t.value,e.target.value);e.target.value=n,t.placeholder=n===`COP`?`5,000,000`:`2,500`,t.value=Ct(t.value,n)}),document.querySelector(`#salaryInput`)?.addEventListener(`blur`,e=>{let t=document.querySelector(`#salaryCurrencyInput`),n=St(e.target.value,t?.value||`USD`);t&&(t.value=n),e.target.placeholder=n===`COP`?`5,000,000`:`2,500`,e.target.value=Ct(e.target.value,n)}),Ht(),Vn(),In(),Mn(),Pn(),document.querySelectorAll(`[data-apply]`).forEach(e=>{e.addEventListener(`click`,async()=>{let t=F.jobs.map(J).find(t=>t.code===e.dataset.apply),n=e.dataset.apply;if(e.disabled=!0,e.textContent=`Submitted`,F.user&&x){try{let e=Tn();e.add(n),localStorage.setItem(`nw_talent_applied`,JSON.stringify([...e]))}catch{}await Oe(F.user.uid,t),await Dt(F.user),nt(`applications`)}else B({message:`Sign in with Google to apply to this opening.`})})}),document.querySelector(`#showTechIntro`)?.addEventListener(`click`,()=>{B({assessmentUiStep:`techIntro`,message:``})}),document.querySelector(`#backToWelcome`)?.addEventListener(`click`,()=>{B({assessmentUiStep:null,message:``})}),document.querySelector(`#startDiscAssessment`)?.addEventListener(`click`,async()=>{let e=L()||(F.assessments||[])[0]?.id,t=(F.assessments||[]).find(t=>t.id===e);if(!e||!t)return;let n=t.questions||[],r=document.querySelector(`#startDiscAssessment`),i=r?Number(r.dataset.discIndex||50):n.findIndex(e=>Number(e.stage||1)===2),a=i>=0?i:50,o=new Date().toISOString();try{await Te(e,`__progress__`,``,{currentQuestionIndex:a,totalQuestions:n.length,currentStage:2,discStartedAt:o}),R(e,a),B({assessments:(F.assessments||[]).map(t=>t.id===e?{...t,currentQuestionIndex:a,currentStage:2,discStartedAt:o}:t),activePage:`assessment`,assessmentUiStep:null,message:``})}catch(e){B({message:Y(e)})}}),document.querySelector(`#startAssessment`)?.addEventListener(`click`,async()=>{let e=L()||(F.assessments||[])[0]?.id,t=(F.assessments||[]).find(t=>t.id===e)||(F.assessments||[])[0];if(!e||!F.user){B({message:`Please log in to start your assessment.`});return}try{await we(e,F.user.uid),R(e,Number(t?.currentQuestionIndex||0),!0),B({assessments:(F.assessments||[]).map(t=>t.id===e?{...t,status:`started`,startedAt:t.startedAt||new Date().toISOString(),technicalStartedAt:t.technicalStartedAt||new Date().toISOString()}:t),activePage:`assessment`,assessmentUiStep:null,message:``})}catch(e){B({message:Y(e)})}}),document.querySelector(`#prevAssessmentQuestion`)?.addEventListener(`click`,async()=>{let e=L()||(F.assessments||[])[0]?.id,t=(F.assessments||[]).find(t=>t.id===e),n=Number(document.querySelector(`#assessmentQuestionForm`)?.dataset.currentIndex??t?.currentQuestionIndex??0),r=Math.max(0,n-1),i=t?.questions?.[r];await Te(e,`__progress__`,``,{currentQuestionIndex:r,totalQuestions:t?.questions?.length||70,currentStage:i?.stage||1}),R(e,r),B({assessments:(F.assessments||[]).map(t=>t.id===e?{...t,currentQuestionIndex:r,currentStage:i?.stage||1}:t),activePage:`assessment`,message:``})}),document.querySelector(`#assessmentQuestionForm`)?.addEventListener(`submit`,async e=>{e.preventDefault();let t=L()||(F.assessments||[])[0]?.id,n=(F.assessments||[]).find(e=>e.id===t),r=n?.questions||[],i=Number(e.currentTarget.dataset.currentIndex??n?.currentQuestionIndex??0),a=r[i],o=new FormData(e.currentTarget).get(`answer`);if(!a){B({message:`This question could not be loaded. Please refresh and try again.`});return}let s=o===null?{value:``,skipped:!0,answeredAt:new Date().toISOString()}:{value:Number(o),skipped:!1,answeredAt:new Date().toISOString()},c={...n.answers||{},[a.id]:s},l=r[i+1],u=l&&Number(l.stage||1)!==Number(a.stage||1),d=ft(n,a.stage,c);try{if((u||i+1>=r.length)&&d.length){await Te(t,a.id,c[a.id],{currentQuestionIndex:i,totalQuestions:r.length,currentStage:a.stage||1}),B({assessments:(F.assessments||[]).map(e=>e.id===t?{...e,answers:c,currentQuestionIndex:i,currentStage:a.stage||1,progress:`${i+1}/${r.length}`}:e),activePage:`assessment`,message:`You missed ${d.length} question${d.length===1?``:`s`} in the ${ut(a.stage)}.`});return}if(i+1>=r.length){let e=dn(n,c),i=fn(n,c);await Ee(t,c,{totalQuestions:r.length,technicalScore:e.technicalScore,discScore:e.discScore,score:Math.round(e.technicalScore*.75+e.discScore*.25),discProfile:i}),fetch(`https://admin.nearwork.co/api/generate-assessment-insights`,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify({assessmentId:t})}).catch(()=>null),pn(n,{score:Math.round(e.technicalScore*.75+e.discScore*.25),technicalScore:e.technicalScore,discScore:e.discScore,discProfile:i}).catch(e=>console.warn(e)),B({assessments:(F.assessments||[]).map(n=>n.id===t?{...n,answers:c,status:`completed`,score:Math.round(e.technicalScore*.75+e.discScore*.25),technical:e.technicalScore,disc:i.label,discProfile:i,progress:`${r.length}/${r.length}`}:n),activePage:`assessment`,message:``})}else{let e=a.stage===1&&l?.stage===2&&!n.discStartedAt;await Te(t,a.id,c[a.id],{currentQuestionIndex:i+1,totalQuestions:r.length,currentStage:l?.stage||a.stage||1}),R(t,i+1),B({assessments:(F.assessments||[]).map(e=>e.id===t?{...e,answers:c,currentQuestionIndex:i+1,currentStage:l?.stage||a.stage||1,progress:`${i+1}/${r.length}`}:e),activePage:`assessment`,message:``,assessmentUiStep:e?`discIntro`:null})}}catch(e){B({message:Y(e)})}}),document.querySelector(`#profileForm`)?.addEventListener(`submit`,async e=>{e.preventDefault();let t=new FormData(e.currentTarget),n=t.get(`department`),r=t.get(`city`),i=bt(t.get(`salary`),t.get(`salaryCurrency`)),a={name:t.get(`name`),targetRole:t.get(`targetRole`),headline:t.get(`targetRole`),department:n,city:r,locationId:`${String(r).toLowerCase().normalize(`NFD`).replace(/[\u0300-\u036f]/g,``).replace(/[^a-z0-9]+/g,`-`)}-co`,location:`${r}, ${n}`,locationCity:r,locationDepartment:n,locationCountry:`Colombia`,english:t.get(`english`),salary:i.salary,salaryUSD:i.salaryUSD,salaryAmount:i.salaryAmount,salaryCurrency:i.salaryCurrency,expectedSalaryAmount:i.salaryAmount,expectedSalaryCurrency:i.salaryCurrency,linkedin:t.get(`linkedin`),whatsapp:t.get(`whatsapp`),phone:t.get(`whatsapp`),skills:[...new Set(t.getAll(`skills`).map(q).filter(Boolean))],otherSkills:[],languages:(t.get(`languages`)||``).split(`,`).map(e=>e.trim()).filter(Boolean),summary:t.get(`summary`),email:F.candidate?.email||F.user?.email||``,availability:F.candidate?.availability||`open`,onboarded:!0};if(!F.user){B({candidate:{...F.candidate,...a},message:`Preview updated. Sign in with Google to save this profile.`});return}try{let e=t.get(`photo`),n=F.candidate?.photoURL||F.user?.photoURL||``;e?.name&&(n=await Me(F.user.uid,e));let r=t.get(`profileCv`)?.name?t.get(`profileCv`):Re,i=null,o=!1;if(r?.name)try{i=await Ne(F.user.uid,r,t.get(`profileCvLabel`)||``),Re=null}catch{o=!0}let s={...a,photoURL:n,candidateCode:F.candidate?.candidateCode,marketingConsent:F.candidate?.marketingConsent===!0,...i?{activeCvId:i.id,activeCvName:i.name||i.fileName,cvUrl:i.url,cvLibrary:[...F.candidate?.cvLibrary||[],i]}:{},workHistory:(()=>{let e=Nn();return e.length?e:O?.workHistory?.length&&(k||!F.candidate?.workHistory?.length)?O.workHistory:F.candidate?.workHistory||[]})(),certifications:(()=>{let e=Fn();return e.length?e:O?.certifications?.length&&(k||!F.candidate?.certifications?.length)?O.certifications:F.candidate?.certifications||[]})()};O=null,k=!1;let c=await Ae(F.user.uid,s),l=o?`Profile saved, but the CV failed to upload. Try uploading it again from the CV section.`:c?.atsSynced===!1?`Profile saved. Nearwork will finish connecting it to your workspace.`:`Profile saved.`;t.get(`mode`)===`onboarding`?(window.history.pushState({page:`overview`},``,`/`),B({candidate:{...F.candidate,...s},activePage:`overview`,message:`Profile complete. Welcome to Talent.`})):B({candidate:{...F.candidate,...s},message:l})}catch(e){B({message:Y(e)})}}),document.querySelector(`#cvForm`)?.addEventListener(`submit`,async e=>{e.preventDefault();let t=new FormData(e.currentTarget),n=t.get(`cv`);if(n?.name){if(!F.user){B({message:`Sign in with Google to upload and store CVs.`});return}try{let e=await Ne(F.user.uid,n,t.get(`label`));B({candidate:{...F.candidate,cvLibrary:[...F.candidate?.cvLibrary||[],e],activeCvId:e.id},message:`CV uploaded.`})}catch(e){B({message:Y(e)})}}})}function Mn(){let e=document.querySelector(`#workHistoryCard`);if(!e)return;let t=e.querySelectorAll(`.work-entry`).length;e.addEventListener(`click`,e=>{let n=e.target.closest(`.remove-work-entry`);if(n){n.closest(`.work-entry`)?.remove();return}if(e.target.closest(`#addWorkEntry`)){let e=document.querySelector(`#workEntries`);if(!e)return;let n=document.createElement(`div`);n.innerHTML=vn(t++,{}),e.appendChild(n.firstElementChild)}})}function Nn(){return[...document.querySelectorAll(`.work-entry`)].map(e=>{let t=t=>e.querySelector(`[data-field="${t}"]`)?.value?.trim()||``;return{title:t(`title`),company:t(`company`),from:t(`from`),to:t(`to`)}}).filter(e=>e.title||e.company)}function Pn(){let e=document.querySelector(`#certCard`);if(!e)return;let t=e.querySelectorAll(`.cert-entry`).length;e.addEventListener(`click`,e=>{let n=e.target.closest(`.remove-cert-entry`);if(n){n.closest(`.cert-entry`)?.remove();return}if(e.target.closest(`#addCertEntry`)){let e=document.querySelector(`#certEntries`);if(!e)return;let n=document.createElement(`div`);n.innerHTML=yn(t++,{}),e.appendChild(n.firstElementChild)}})}function Fn(){return[...document.querySelectorAll(`.cert-entry`)].map(e=>{let t=t=>e.querySelector(`[data-field="${t}"]`)?.value?.trim()||``;return{name:t(`name`),issuer:t(`issuer`),date:t(`date`)}}).filter(e=>e.name)}function In(){let e=document.querySelector(`#profileForm`),t=e?.querySelector(`input[name="profileCv"]`);!e||!t||(e.querySelector(`input[name="mode"]`)?.value===`onboarding`&&!F.candidate?.skills?.length&&!F.candidate?.workHistory?.length&&!F.candidate?.name?Ln(e,t):Rn(t))}function Ln(e,t){let n=document.querySelector(`#profileCvCard`);if(!n)return;let r=[...e.children].filter(e=>e!==n&&e.type!==`hidden`&&e.getAttribute(`name`)!==`mode`);r.forEach(e=>{e.style.display=`none`});let i=document.createElement(`p`);i.id=`cvGatePrompt`,i.style.cssText=`font-size:13px;color:var(--mid);margin:10px 0 4px;text-align:center;`,i.innerHTML=`Upload your CV and we'll fill in the rest for you — or <button type="button" id="skipCvParse" style="background:none;border:none;padding:0;font-size:13px;color:var(--green);cursor:pointer;text-decoration:underline;">skip and fill in manually</button>`,n.insertAdjacentElement(`afterend`,i);function a(){document.querySelector(`#cvGatePrompt`)?.remove(),document.querySelector(`#cvParseLoading`)?.remove(),r.forEach(e=>{e.style.display=``})}document.querySelector(`#skipCvParse`)?.addEventListener(`click`,a),t.addEventListener(`change`,async()=>{let e=t.files?.[0];if(!e)return;document.querySelector(`#cvGatePrompt`)?.remove();let r=document.createElement(`p`);r.id=`cvParseLoading`,r.style.cssText=`font-size:13px;font-weight:600;color:var(--green);padding:14px 0;text-align:center;`,r.textContent=`Analysing your CV…`,n.insertAdjacentElement(`afterend`,r),O=null,k=!0;let i=await Le(e);a(),i&&(O=i,zn(i,!0),Bn(i,t))})}function Rn(e){e.addEventListener(`change`,async()=>{let t=e.files?.[0];if(!t)return;O=null,k=!1,Re=null,B({message:`⏳ Analysing your CV — this takes up to 30 seconds…`});let n=await Le(t);if(!n){B({message:`⚠️ Could not read your CV. Check the browser console for details, or try a different file.`});return}O=n,k=!0,Re=t;let r=F.candidate||{},i={...r,...n.name?{name:n.name}:{},...n.phone?{whatsapp:n.phone,phone:n.phone}:{},...n.summary?{summary:n.summary}:{},skills:n.skills?.length?[...new Set(n.skills.map(q).filter(Boolean))]:r.skills||[],workHistory:n.workHistory?.length?n.workHistory:r.workHistory||[],certifications:n.certifications?.length?n.certifications:r.certifications||[],languages:n.languages?.length?n.languages:r.languages||[]},a=[];n.name&&a.push(`name`),n.phone&&a.push(`phone`),n.summary&&a.push(`summary`),n.skills?.length&&a.push(`${n.skills.length} skill${n.skills.length===1?``:`s`}`),n.workHistory?.length&&a.push(`${n.workHistory.length} role${n.workHistory.length===1?``:`s`}`),n.certifications?.length&&a.push(`${n.certifications.length} cert${n.certifications.length===1?``:`s`}`),n.languages?.length&&a.push(`languages`),B({candidate:i,message:a.length?`✓ Pre-filled from CV: ${a.join(`, `)}. Review and save your profile.`:`✓ CV analysed. Review your profile and save.`})})}function zn(e,t){let n=(e,n)=>{let r=document.querySelector(e);r&&n&&(t||!r.value?.trim())&&(r.value=n)};if(n(`input[name="name"]`,e.name),n(`input[name="whatsapp"]`,e.phone),n(`textarea[name="summary"]`,e.summary),e.skills?.length){let n=document.querySelector(`#selectedSkills`);if(n){t&&(n.innerHTML=``);let r=new Set([...n.querySelectorAll(`input[name="skills"]`)].map(e=>e.value.toLowerCase()));n.querySelector(`.skill-empty`)?.remove(),[...new Set(e.skills.map(q).filter(Boolean))].forEach(e=>{if(r.has(e.toLowerCase()))return;r.add(e.toLowerCase());let t=document.createElement(`span`);t.className=`selected-skill`,t.setAttribute(`data-skill-chip`,e),t.innerHTML=`${H(e)}<button type="button" class="skill-remove" data-remove-skill="${V(e)}" aria-label="Remove ${V(e)}">×</button><input type="hidden" name="skills" value="${V(e)}" />`,n.appendChild(t)})}}if(e.workHistory?.length){let n=document.querySelector(`#workEntries`);if(n){t&&(n.innerHTML=``);let r=n.querySelectorAll(`.work-entry`).length;e.workHistory.forEach(e=>{let t=document.createElement(`div`);t.innerHTML=vn(r++,e),n.appendChild(t.firstElementChild)})}}if(e.languages?.length){let n=document.querySelector(`input[name="languages"]`);n&&(t||!n.value?.trim())&&(n.value=e.languages.join(`, `))}if(e.certifications?.length){let n=document.querySelector(`#certEntries`);if(n){t&&(n.innerHTML=``);let r=n.querySelectorAll(`.cert-entry`).length;e.certifications.forEach(e=>{let t=document.createElement(`div`);t.innerHTML=yn(r++,e),n.appendChild(t.firstElementChild)})}}tt()}function Bn(e,t){let n=[];e.name&&n.push(`name`),e.phone&&n.push(`phone`),e.skills?.length&&n.push(`${e.skills.length} skill${e.skills.length>1?`s`:``}`),e.workHistory?.length&&n.push(`${e.workHistory.length} role${e.workHistory.length>1?`s`:``}`),e.certifications?.length&&n.push(`${e.certifications.length} cert${e.certifications.length>1?`s`:``}`),e.languages?.length&&n.push(`languages`),document.querySelector(`#cvParseHint`)?.remove();let r=document.createElement(`p`);r.id=`cvParseHint`,r.style.cssText=`font-size:12px;color:var(--green);margin:4px 0 0;`,r.innerHTML=n.length?`✓ Pre-filled: <strong>${n.join(`, `)}</strong>. Review and save.`:`✓ CV analysed. Review your profile and save.`,t.insertAdjacentElement(`afterend`,r)}function Vn(){let e=document.querySelector(`[data-skill-search]`);if(!e)return;let t=e.querySelector(`#skillSearchInput`),n=e.querySelector(`#skillSuggestions`),r=e.querySelector(`#selectedSkills`),i=()=>[...r.querySelectorAll(`input[name="skills"]`)].map(e=>e.value),a=e=>{r.innerHTML=e.length?e.map(e=>`
      <span class="selected-skill" data-skill-chip="${V(e)}">
        ${H(e)}
        <button type="button" class="skill-remove" data-remove-skill="${V(e)}" aria-label="Remove ${V(e)}">×</button>
        <input type="hidden" name="skills" value="${V(e)}" />
      </span>`).join(``):`<span class="skill-empty">Selected skills will appear here.</span>`},o=()=>{let e=W(t.value),r=t.value.trim(),a=new Set(i().map(W)),o=Ke.filter(e=>!a.has(W(e))).filter(t=>!e||W(t).includes(e)).slice(0,12),s=o.find(t=>W(t)===e);n.innerHTML=(r.length>1&&!a.has(W(r))&&!s?`<button type="button" class="skill-suggestion add-custom" data-skill="${V(r)}">+ Add "${H(r)}"</button>`:``)+o.map(e=>`<button type="button" class="skill-suggestion" data-skill="${V(e)}">${H(e)}</button>`).join(``)},s=e=>{let n=q((e||t.value).trim());if(!n)return;let r=W(n);a([...i().filter(e=>W(e)!==r),n]),t.value=``,o()};t?.addEventListener(`input`,o),t?.addEventListener(`focus`,o),t?.addEventListener(`keydown`,e=>{if(e.key!==`Enter`)return;e.preventDefault();let r=W(t.value);s([...n.querySelectorAll(`.skill-suggestion:not(.add-custom)`)].find(e=>W(e.dataset.skill)===r)?.dataset.skill||t.value)}),e.querySelector(`#addTypedSkill`)?.addEventListener(`click`,()=>s(t.value)),n.addEventListener(`click`,e=>{let t=e.target.closest(`[data-skill]`);t&&s(t.dataset.skill)}),r.addEventListener(`click`,e=>{let t=e.target.closest(`[data-remove-skill]`);if(!t)return;let n=W(t.dataset.removeSkill);a(i().filter(e=>W(e)!==n)),o()})}function Hn(){if(F.loading)return An();if(F.view===`dashboard`)return Mt();Et()}window.addEventListener(`popstate`,()=>{let e=Qe();e===`overview`&&!F.user?B({view:`login`,activePage:`overview`,message:``}):F.view===`dashboard`?nt(e,!1):Ot()}),x?(i(C,e=>{if(e)Dt(e);else{try{localStorage.removeItem(`nw_talent_applied`)}catch{}Ot()}}),window.setTimeout(()=>{F.loading&&Ot()},2500)):Ot();