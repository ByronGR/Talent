import{initializeApp as e}from"https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";import{GoogleAuthProvider as t,createUserWithEmailAndPassword as n,getAuth as r,onAuthStateChanged as i,sendPasswordResetEmail as a,signInWithEmailAndPassword as o,signInWithPopup as s,signOut as c,updateProfile as l}from"https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";import{addDoc as u,arrayUnion as d,collection as f,doc as p,getDoc as m,getDocs as h,getFirestore as ee,limit as g,onSnapshot as te,query as _,serverTimestamp as v,setDoc as y,updateDoc as ne,where as b}from"https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";import{deleteObject as re,getDownloadURL as ie,getStorage as ae,ref as oe,uploadBytes as se}from"https://www.gstatic.com/firebasejs/10.12.5/firebase-storage.js";(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),e.crossOrigin===`use-credentials`?t.credentials=`include`:e.crossOrigin===`anonymous`?t.credentials=`omit`:t.credentials=`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var ce={apiKey:`AIzaSyApRNyW8PoP28E0x77dUB5jOgHuTqA2by4`,authDomain:`nearwork-97e3c.firebaseapp.com`,projectId:`nearwork-97e3c`,storageBucket:`nearwork-97e3c.firebasestorage.app`,messagingSenderId:`145642656516`,appId:`1:145642656516:web:0ac2da8931283121e87651`,measurementId:`G-3LC8N6FFSH`},x=Object.values(ce).slice(0,6).every(Boolean),S=x?e(ce):null,C=S?r(S):null,w=S?ee(S):null,le=S?ae(S):null,ue=S?new t:null,T={users:`users`,candidates:`candidates`,openings:`openings`,pipelines:`pipelines`,applications:`applications`,assessments:`assessments`,activity:`candidateActivity`,notifications:`notifications`,notificationPreferences:`notificationPreferences`},de=`https://admin.nearwork.co/api/send-email`;function E(){if(!S||!C||!w||!le)throw Error(`Missing Firebase environment variables. Copy .env.example to .env.local and fill in the Admin app config.`)}async function fe(e={}){let t=String(e.email||C?.currentUser?.email||``).trim().toLowerCase();if(!t)return{ok:!1,skipped:!0,reason:`Missing candidate email`};let n=e.name||C?.currentUser?.displayName||``,r=e.firstName||n.split(/\s+/)[0]||`there`,i=await fetch(de,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify({to:t,templateId:`account_created`,data:{name:n||r,firstName:r,actionUrl:`https://talent.nearwork.co`}})});return i.json().catch(()=>({ok:i.ok}))}async function pe(e={},t={}){let n=String(e?.email||C?.currentUser?.email||``).trim().toLowerCase();if(!n)return{ok:!1,skipped:!0,reason:`Missing candidate email`};let r=e?.name||C?.currentUser?.displayName||``,i=e?.firstName||r.split(/\s+/)[0]||`there`,a=await fetch(de,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify({to:n,templateId:`job_applied`,data:{name:r||i,firstName:i,roleTitle:t.title||t.role||t.openingTitle||`this role`,openingCode:t.code||t.id||``,actionUrl:`https://talent.nearwork.co`}})});return a.json().catch(()=>({ok:a.ok}))}async function me(e){E();let t=await m(p(w,T.users,e));return t.exists()?{id:t.id,...t.data()}:null}async function he(e){E();let t=String(e||``).trim(),n=t.toLowerCase(),r=await h(_(f(w,T.users),b(`email`,`==`,n),g(1)));if(!r.empty)return{id:r.docs[0].id,...r.docs[0].data()};if(t===n)return null;let i=await h(_(f(w,T.users),b(`email`,`==`,t),g(1)));return i.empty?null:{id:i.docs[0].id,...i.docs[0].data()}}async function ge(e){let t=await me(e.uid);if(t)return t;let n=await he(e.email);return n?(await _e(e.uid,{...n,email:e.email,connectedFromUserId:n.id}),{...n,id:e.uid,connectedFromUserId:n.id}):null}async function _e(e,t){E();let n=t.candidateCode||D(e),r={...t,candidateCode:n,role:`candidate`,updatedAt:v()};await y(p(w,T.users,e),r,{merge:!0}),await y(p(w,T.candidates,n),ye(e,{...r,candidateCode:n}),{merge:!0}).catch(()=>null),t.marketingConsent===!0&&Ae({...r,candidateCode:n,source:`talent.nearwork.co`}).catch(()=>null)}function D(e){return`CAND-${String(e||``).replace(/[^a-z0-9]/gi,``).slice(0,8).toUpperCase()||Date.now()}`}function ve(e){return String(e||``).toLowerCase().normalize(`NFD`).replace(/[\u0300-\u036f]/g,``).replace(/[^a-z0-9]+/g,`-`).replace(/^-|-$/g,``)}function ye(e,t){let n=t.candidateCode||D(e),r=t.location||[t.locationCity||t.city,t.locationDepartment||t.department].filter(Boolean).join(`, `),i=new Date().toISOString().slice(0,10);return{code:n,uid:e,ownerUid:e,name:t.name||`Talent member`,role:t.targetRole||t.headline||`Nearwork candidate`,skills:Array.isArray(t.skills)?t.skills:[],applied:t.applied||i,lastContact:t.lastContact||i,experience:Number(t.experience||0),location:r,city:ve(t.locationCity||t.city||r),department:t.locationDepartment||t.department||``,country:t.locationCountry||`Colombia`,source:`talent.nearwork.co`,status:t.status||`active`,score:Number(t.score||50),email:t.email||``,phone:t.whatsapp||t.phone||``,whatsapp:t.whatsapp||t.phone||``,salary:t.salary||``,salaryUSD:Number(t.salaryUSD||0)||null,salaryAmount:Number(t.salaryAmount||t.expectedSalaryAmount||0)||null,salaryCurrency:t.salaryCurrency||t.expectedSalaryCurrency||`USD`,expectedSalaryAmount:Number(t.expectedSalaryAmount||t.salaryAmount||0)||null,expectedSalaryCurrency:t.expectedSalaryCurrency||t.salaryCurrency||`USD`,expectedSalary:t.expectedSalary||t.salary||``,availability:t.availability||`open`,english:t.english||``,visa:t.visa||`No`,linkedin:t.linkedin||``,cv:t.activeCvName||``,cvUrl:t.cvUrl||null,photoUrl:t.photoURL||t.photoUrl||null,tags:t.tags||[`talent profile`],notes:t.summary||``,appliedBefore:!!t.appliedBefore,applications:t.applications||[],pipelineCodes:t.pipelineCodes||[],loom:t.loom||`Not uploaded`,assessments:t.assessments||[],work:t.work||[],updatedAt:v()}}async function be(e=!1){E();let t=await s(C,ue),n=await ge(t.user),r=new Date().toISOString(),i={email:t.user.email,name:t.user.displayName||``,availability:`open`,onboarded:!1,privacyConsent:!0,privacyConsentAt:r,marketingConsent:e,marketingConsentAt:e?r:null},a=!n;a&&(await _e(t.user.uid,i),fe(i).catch(()=>null));let o=D(t.user.uid),c={...n||i,candidateCode:o};return await y(p(w,T.candidates,o),ye(t.user.uid,c),{merge:!0}).catch(()=>null),(a?e:n?.marketingConsent===!0)&&Ae({...c,candidateCode:o,source:`talent.nearwork.co`}).catch(()=>null),t.user}async function xe(e){E();let t=_(f(w,T.applications),b(`candidateId`,`==`,e),g(20)),n=_(f(w,T.applications),b(`ownerUid`,`==`,e),g(20)),r=await Promise.allSettled([h(t),h(n)]),i=new Map;return r.forEach(e=>{e.status===`fulfilled`&&e.value.docs.forEach(e=>i.set(e.id,{id:e.id,...e.data()}))}),Array.from(i.values()).sort((e,t)=>{let n=e=>e?.toDate?.()?.getTime()??(e?new Date(e).getTime():0);return n(t.updatedAt||t.createdAt)-n(e.updatedAt||e.createdAt)})}async function Se(e,t=``,n=``){E();let r=String(t||``).trim().toLowerCase(),i=String(n||``).trim(),a=[h(_(f(w,T.assessments),b(`candidateUid`,`==`,e),g(25))),h(_(f(w,T.assessments),b(`candidateId`,`==`,e),g(25)))];r&&a.push(h(_(f(w,T.assessments),b(`candidateEmail`,`==`,r),g(25)))),i&&a.push(h(_(f(w,T.assessments),b(`candidateCode`,`==`,i),g(25))));let o=await Promise.allSettled(a),s=new Map;return o.forEach(e=>{e.status===`fulfilled`&&e.value.docs.forEach(e=>s.set(e.id,{id:e.id,...e.data()}))}),Array.from(s.values()).sort((e,t)=>{let n=e=>e?.toDate?.()?.getTime()??(e?new Date(e).getTime():0);return n(t.updatedAt||t.createdAt||t.sentAt)-n(e.updatedAt||e.createdAt||e.sentAt)})}async function Ce(e,t,n=``,r=``){E();let i=await m(p(w,T.assessments,e));if(!i.exists())return null;let a={id:i.id,...i.data()},o=String(n||``).trim().toLowerCase(),s=String(r||``).trim();return a.candidateUid===t||a.candidateId===t||String(a.candidateEmail||``).trim().toLowerCase()===o||String(a.candidateCode||``).trim()===s?a:null}async function we(e,t){E();let n=await m(p(w,T.assessments,e)),r=n.exists()?n.data():{};if(r.status===`completed`)throw Error(`This assessment is already completed.`);if(r.expiresAt&&Date.now()>new Date(r.expiresAt).getTime())throw Error(`This assessment link has expired.`);await y(p(w,T.assessments,e),{status:`started`,currentQuestionIndex:Number(r.currentQuestionIndex||0),currentStage:Number(r.currentStage||1),technicalStartedAt:r.technicalStartedAt||v(),startedAt:r.startedAt||v(),updatedAt:v()},{merge:!0})}async function O(e,t,n,r={}){E();let i=await m(p(w,T.assessments,e)),a=i.exists()?i.data():{};if(a.status===`completed`)throw Error(`This assessment is already completed.`);if(a.expiresAt&&Date.now()>new Date(a.expiresAt).getTime())throw Error(`This assessment link has expired.`);await y(p(w,T.assessments,e),{[`answers.${t}`]:n,progress:`${r.currentQuestionIndex||0}/${r.totalQuestions||``}`.replace(/\/$/,``),currentQuestionIndex:r.currentQuestionIndex||0,currentStage:r.currentStage||1,...r.discStartedAt?{discStartedAt:r.discStartedAt}:{},updatedAt:v()},{merge:!0})}async function Te(e,t,n={}){E();let r=p(w,T.assessments,e),i=await m(r),a=i.exists()?i.data():{};if(a.status===`completed`)throw Error(`This assessment is already completed.`);if(a.expiresAt&&Date.now()>new Date(a.expiresAt).getTime())throw Error(`This assessment link has expired.`);let o=Object.values(t||{}).filter(e=>String(e?.value??e??``).trim()).length,s=Number(n.totalQuestions||Object.keys(t||{}).length||0),c=Number(n.technicalScore||0),l=Number(n.discScore||0),u=Number(n.score||(s?Math.round(o/s*100):0));await y(r,{answers:t,answeredCount:o,totalQuestions:s,score:u,technical:c||u,disc:n.discProfile?.label||(l?`${l}%`:`Submitted`),discScore:l,discProfile:n.discProfile||null,progress:`${o}/${s}`,status:`completed`,finished:new Date().toLocaleString(`en-US`,{month:`short`,day:`numeric`,year:`numeric`,hour:`numeric`,minute:`2-digit`}),finishedAt:v(),updatedAt:v()},{merge:!0});let d=Math.round(u);a.candidateUid&&await y(p(w,T.users,a.candidateUid),{score:d,nwScore:d,lastAssessmentScore:d,lastAssessmentId:e,updatedAt:v()},{merge:!0}).catch(()=>null),a.candidateCode&&await y(p(w,T.candidates,a.candidateCode),{score:d,nwScore:d,lastAssessmentScore:d,lastAssessmentId:e,updatedAt:v()},{merge:!0}).catch(()=>null)}async function Ee(){return E(),(await h(_(f(w,T.openings),b(`published`,`==`,!0),g(12)))).docs.map(e=>({id:e.id,...e.data()}))}async function De(e,t){E();let n=t.code||t.id,r=await me(e).catch(()=>null),i=r?.candidateCode||D(e),a=new Date().toISOString().slice(0,10),o={opening:n,openingCode:n,jobId:n,role:t.title||t.role||`Untitled role`,openingTitle:t.title||t.role||`Untitled role`,applied:a,appliedAt:a,status:`applied`,outcome:`Application only`,source:`talent.nearwork.co`},s={candidateId:e,ownerUid:e,authUid:e,candidateDocId:i,candidateCode:i,candidateEmail:r?.email||``,candidateName:r?.name||``,openingCode:n,jobId:n,openingTitle:t.title||t.role||`Untitled role`,jobTitle:t.title||t.role||`Untitled role`,title:t.title||t.role||`Untitled role`,clientName:t.orgName||t.clientName||t.company||`Nearwork client`,status:`applied`,inPipeline:!1,isMockData:!1,source:`talent.nearwork.co`,createdAt:v(),updatedAt:v()};await u(f(w,T.applications),s),await y(p(w,T.candidates,i),{...ye(e,{...r||{},candidateCode:i,appliedBefore:!0,lastContact:a}),applications:d(o),appliedBefore:!0},{merge:!0}).catch(()=>null),await y(p(w,T.users,e),{role:`candidate`,candidateCode:i,code:i,applications:d(o),lastAppliedOpeningCode:n,lastAppliedAt:v(),updatedAt:v()},{merge:!0}).catch(()=>null),await u(f(w,T.activity),{candidateId:e,type:`application_submitted`,title:s.jobTitle,createdAt:v()}).catch(()=>null),pe(r,t).catch(()=>null)}async function Oe(e,t){await ne(p(w,T.users,e),{availability:t,updatedAt:v()})}async function ke(e,t){E();let n=t.candidateCode||D(e);await y(p(w,T.users,e),{...t,candidateCode:n,role:`candidate`,updatedAt:v()},{merge:!0});try{return await y(p(w,T.candidates,n),ye(e,{...t,candidateCode:n}),{merge:!0}),t.marketingConsent===!0&&Ae({...t,candidateCode:n,source:`talent.nearwork.co`}).catch(()=>null),{candidateCode:n,atsSynced:!0}}catch(e){return console.warn(`Candidate ATS sync failed.`,e),{candidateCode:n,atsSynced:!1}}}async function Ae(e){let t=e?.email||C.currentUser?.email||``;return t?(await fetch(`/api/sync-hubspot-candidate`,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify({candidate:{...e,email:t}})})).json().catch(()=>({ok:!1})):{ok:!1,skipped:!0}}async function je(e,t){E();let n=t.name.replace(/[^a-z0-9._-]/gi,`-`).toLowerCase(),r=oe(le,`candidate-photos/${e}/${Date.now()}-${n}`);await se(r,t,{contentType:t.type||`application/octet-stream`});let i=await ie(r);return await y(p(w,T.users,e),{photoURL:i,updatedAt:v()},{merge:!0}),i}async function Me(e,t,n){E();let r=null,i=D(e);try{let t=await m(p(w,T.users,e));if(t.exists()){let e=t.data();r=e.activeCvId||null,e.candidateCode&&(i=e.candidateCode)}}catch{}let a=t.name.replace(/[^a-z0-9._-]/gi,`-`).toLowerCase(),o=`candidate-cvs/${e}/${Date.now()}-${a}`,s=oe(le,o);await se(s,t,{contentType:t.type||`application/octet-stream`});let c=await ie(s),l={id:o,name:n||t.name,fileName:t.name,url:c,uploadedAt:new Date().toISOString()};return await y(p(w,T.users,e),{cvLibrary:d(l),activeCvId:l.id,activeCvName:l.name||l.fileName,cvUrl:c,updatedAt:v()},{merge:!0}),y(p(w,T.candidates,i),{cvUrl:c,activeCvId:l.id,activeCvName:l.name||l.fileName,updatedAt:v()},{merge:!0}).catch(()=>null),r&&r!==o&&re(oe(le,r)).catch(()=>{}),l}function Ne(e,t){return E(),e?te(_(f(w,T.notifications),b(`recipientUid`,`==`,e),g(50)),e=>{t(e.docs.map(e=>({id:e.id,...e.data()})).sort((e,t)=>{let n=e.createdAt?.toDate?e.createdAt.toDate().getTime():new Date(e.createdAt||0).getTime();return(t.createdAt?.toDate?t.createdAt.toDate().getTime():new Date(t.createdAt||0).getTime())-n}))}):()=>{}}async function Pe(e){E(),e&&await y(p(w,T.notifications,e),{read:!0,readAt:v()},{merge:!0})}async function Fe(e,t){E(),await y(p(w,T.notificationPreferences,e),{uid:e,app:`talent.nearwork.co`,preferences:t,updatedAt:v()},{merge:!0})}async function Ie(e){if(!e)return null;try{let t=await new Promise((t,n)=>{let r=new FileReader;r.onload=()=>t(r.result.split(`,`)[1]),r.onerror=n,r.readAsDataURL(e)}),n=await fetch(`/api/parse-cv`,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify({data:t,filename:e.name,mimeType:e.type||`application/octet-stream`})});if(!n.ok)return null;let r=await n.json();if(!r?.ok)return null;let{name:i,phone:a,city:o,summary:s,skills:c,workHistory:l,languages:u,certifications:d}=r;return{name:i,phone:a,city:o,summary:s,skills:c,workHistory:l,languages:u||[],certifications:d||[]}}catch{return null}}var k=null,A=!1,Le=1,j={},M=null,N=null,P=null,Re=document.querySelector(`#app`),ze=`+573135928691`,Be=`https://wa.me/573135928691`,F={"Customer Success":[`Customer Success Manager`,`Customer Success Associate`,`Account Manager`,`Implementation Specialist`,`Onboarding Specialist`,`Renewals Manager`],Sales:[`SDR / Sales Development Rep`,`BDR / Business Development Rep`,`Account Executive`,`Sales Operations Specialist`,`Sales Manager`],Support:[`Technical Support Specialist`,`Customer Support Representative`,`Support Team Lead`,`QA Support Analyst`],Operations:[`Operations Manager`,`Operations Analyst`,`Executive Assistant`,`Virtual Assistant`,`Project Coordinator`,`Recruiting Coordinator`],Marketing:[`Marketing Ops / Content Specialist`,`Content Writer`,`SEO Specialist`,`Lifecycle Marketing Specialist`,`Social Media Manager`],Engineering:[`Software Developer (Full Stack)`,`Frontend Developer`,`Backend Developer`,`No-Code Developer`,`Data Analyst`,`QA Engineer`],Finance:[`Bookkeeper`,`Accounting Assistant`,`Financial Analyst`,`Payroll Specialist`]},Ve={"CRM & Sales":[`HubSpot`,`Salesforce`,`Pipedrive`,`Apollo`,`Outbound`,`Cold Email`,`Discovery Calls`,`CRM Hygiene`],"Customer Success":[`SaaS`,`Customer Success`,`QBRs`,`Onboarding`,`Renewals`,`Expansion`,`Churn Reduction`,`Intercom`,`Zendesk`],Support:[`Technical Support`,`Tickets`,`Troubleshooting`,`APIs`,`Bug Reproduction`,`Help Center`,`CSAT`],Operations:[`Excel`,`Google Sheets`,`Reporting`,`Process Design`,`Project Management`,`Notion`,`Airtable`,`Zapier`],Marketing:[`Content`,`SEO`,`Lifecycle`,`Email Marketing`,`HubSpot Marketing`,`Copywriting`,`Analytics`],Engineering:[`JavaScript`,`React`,`Node.js`,`SQL`,`Python`,`REST APIs`,`QA`,`GitHub`],Language:[`English B2`,`English C1`,`English C2`,`Spanish Native`]},He=`Account Management.Accounts Payable.Accounts Receivable.Adobe Creative Suite.Agile.AI Tools.Analytics.Appointment Setting.B2B Sales.B2C Sales.Billing.Bookkeeping.Business Analysis.Canva.Cash Collections.Chat Support.Cold Calling.Community Management.Compliance.Content Strategy.Contract Management.Customer Onboarding.Customer Retention.Customer Service.Data Analysis.Data Entry.Email Support.Excel / Google Sheets.Executive Assistance.Figma.Financial Reporting.Forecasting.Helpdesk.HR Operations.Inbound Calls.Insurance Support.Lead Generation.Live Chat.Logistics.Looker.Microsoft Office.NetSuite.Outbound Calls.Payroll.Performance Marketing.Power BI.Product Support.QuickBooks.Recruiting.Salesforce Administration.Sales Operations.Shopify.Slack.Social Media.SQL Reporting.Stripe.Tableau.Technical Writing.Ticket Quality.Training.Vendor Management.WordPress.Workday.Workforce Management.Zendesk Guide.Zoho`.split(`.`),Ue=[...new Set([...Object.values(Ve).flat(),...He])].sort((e,t)=>e.localeCompare(t)),We={Amazonas:[`Leticia`,`Puerto Nariño`],Antioquia:[`Medellín`,`Abejorral`,`Apartadó`,`Bello`,`Caldas`,`Caucasia`,`Copacabana`,`El Carmen de Viboral`,`Envigado`,`Girardota`,`Itagüí`,`La Ceja`,`La Estrella`,`Marinilla`,`Rionegro`,`Sabaneta`,`Santa Fe de Antioquia`,`Turbo`],Arauca:[`Arauca`,`Arauquita`,`Saravena`,`Tame`],Atlántico:[`Barranquilla`,`Baranoa`,`Galapa`,`Malambo`,`Puerto Colombia`,`Sabanalarga`,`Soledad`],"Bogotá D.C.":[`Bogotá`],Bolívar:[`Cartagena`,`Arjona`,`El Carmen de Bolívar`,`Magangué`,`Mompox`,`Turbaco`],Boyacá:[`Tunja`,`Chiquinquirá`,`Duitama`,`Paipa`,`Sogamoso`,`Villa de Leyva`],Caldas:[`Manizales`,`Aguadas`,`Chinchiná`,`La Dorada`,`Riosucio`,`Villamaría`],Caquetá:[`Florencia`,`El Doncello`,`Puerto Rico`,`San Vicente del Caguán`],Casanare:[`Yopal`,`Aguazul`,`Paz de Ariporo`,`Villanueva`],Cauca:[`Popayán`,`El Tambo`,`Puerto Tejada`,`Santander de Quilichao`],Cesar:[`Valledupar`,`Aguachica`,`Bosconia`,`Codazzi`],Chocó:[`Quibdó`,`Istmina`,`Nuquí`,`Tadó`],Córdoba:[`Montería`,`Cereté`,`Lorica`,`Sahagún`],Cundinamarca:[`Chía`,`Cajicá`,`Facatativá`,`Fusagasugá`,`Girardot`,`Madrid`,`Mosquera`,`Soacha`,`Tocancipá`,`Zipaquirá`],Guainía:[`Inírida`],Guaviare:[`San José del Guaviare`,`Calamar`,`El Retorno`,`Miraflores`],Huila:[`Neiva`,`Garzón`,`La Plata`,`Pitalito`],"La Guajira":[`Riohacha`,`Maicao`,`San Juan del Cesar`,`Uribia`],Magdalena:[`Santa Marta`,`Ciénaga`,`El Banco`,`Fundación`],Meta:[`Villavicencio`,`Acacías`,`Granada`,`Puerto López`],Nariño:[`Pasto`,`Ipiales`,`Tumaco`,`Túquerres`],"Norte de Santander":[`Cúcuta`,`Ocaña`,`Pamplona`,`Villa del Rosario`],Putumayo:[`Mocoa`,`Orito`,`Puerto Asís`,`Valle del Guamuez`],Quindío:[`Armenia`,`Calarcá`,`La Tebaida`,`Montenegro`,`Quimbaya`],Risaralda:[`Pereira`,`Dosquebradas`,`La Virginia`,`Santa Rosa de Cabal`],"San Andrés y Providencia":[`San Andrés`,`Providencia`],Santander:[`Bucaramanga`,`Barrancabermeja`,`Floridablanca`,`Girón`,`Piedecuesta`,`San Gil`],Sucre:[`Sincelejo`,`Corozal`,`Sampués`,`Tolú`],Tolima:[`Ibagué`,`Espinal`,`Honda`,`Melgar`],"Valle del Cauca":[`Cali`,`Buga`,`Buenaventura`,`Cartago`,`Jamundí`,`Palmira`,`Tuluá`,`Yumbo`],Vaupés:[`Mitú`],Vichada:[`Puerto Carreño`,`La Primavera`,`Santa Rosalía`]},I=We,Ge=[{title:`How to answer salary questions`,tag:`Interview`,read:`4 min`,body:`Use a confident range, anchor it to the role, and avoid apologizing for earning in USD.`,actions:[`Know your floor`,`Use monthly USD`,`Mention flexibility last`]},{title:`Writing a CV for US SaaS companies`,tag:`CV`,read:`6 min`,body:`Translate local experience into metrics US hiring managers can scan in under a minute.`,actions:[`Lead with outcomes`,`Add tools`,`Quantify scope`]},{title:`Before your recruiter screen`,tag:`Process`,read:`3 min`,body:`Prepare availability, compensation, English comfort, and two strong role stories.`,actions:[`Check your setup`,`Review the opening`,`Bring questions`]},{title:`STAR stories that feel natural`,tag:`Interview`,read:`5 min`,body:`Keep stories specific, concise, and tied to business impact instead of job duties.`,actions:[`Situation`,`Action`,`Result`]}],Ke=[{key:`profile-review`,label:`Profile Review`,help:`We are checking role fit and your candidate profile.`},{key:`background-check`,label:`Background Checks`,help:`Nearwork is verifying relevant background and work details.`},{key:`assessment`,label:`Assessment`,help:`Complete role-specific questions when assigned.`},{key:`interview`,label:`Interview`,help:`Meet the recruiter and book your next conversation.`},{key:`presented`,label:`Presented`,help:`Your profile has been prepared for the company.`},{key:`client-review`,label:`Client Review`,help:`The company is reviewing your profile and next steps.`},{key:`hired`,label:`Hired`,help:`Offer accepted and onboarding is ready to begin.`}],L={user:null,candidate:null,applications:[],assessments:[],notifications:[],notificationPanelOpen:!1,notificationSettingsOpen:!1,jobs:[],loading:!0,view:`login`,activePage:`overview`,matchesFiltered:!1,message:``,assessmentUiStep:null},R=null,qe=sessionStorage.getItem(`nw_restore_path`);qe&&(sessionStorage.removeItem(`nw_restore_path`),window.history.replaceState({page:qe},``,qe));function Je(){return[[`overview`,`layout-dashboard`,`Overview`],[`matches`,`briefcase-business`,`Matches`],[`applications`,`send`,`Applications`],[`assessment`,`clipboard-check`,`Assessment`],[`cvs`,`files`,`CV Picker`],[`tips`,`book-open`,`Tips`],[`recruiter`,`calendar-days`,`Recruiter`],[`profile`,`user-round-cog`,`Profile`]]}function Ye(){let e=window.location.pathname.split(`/`).filter(Boolean)[0];return e===`onboarding`?`onboarding`:e===`assessment`||e===`assessments`?`assessment`:Je().some(([t])=>t===e)?e:`overview`}function z(){let e=window.location.pathname.split(`/`).filter(Boolean);return(e[0]===`assessment`||e[0]===`assessments`)&&e[1]||``}function Xe(){let e=window.location.pathname.split(`/`).filter(Boolean),t=e.findIndex(e=>e===`q`||e===`question`);if(t===-1)return null;let n=Number(e[t+1]);return Number.isFinite(n)&&n>0?n-1:null}function Ze(e,t=0){return`/assessment/${encodeURIComponent(e)}/start/q/${Number(t||0)+1}`}function B(e,t=0,n=!1){let r=Ze(e,t);if(window.location.pathname===r)return;let i=n?`replaceState`:`pushState`;window.history[i]({page:`assessment`,assessmentId:e,questionIndex:t},``,r)}function V(e,t){return`<i data-lucide="${e}" aria-label="${t||e}"></i>`}function Qe(){window.lucide&&window.lucide.createIcons()}function H(e){L={...L,...e},zn()}function $e(e,t=!0){let n=e===`onboarding`||Je().some(([t])=>t===e)?e:`overview`;L={...L,activePage:n,matchesFiltered:n===`matches`?L.matchesFiltered:!1,message:``,assessmentUiStep:null},t&&window.history.pushState({page:n},``,n===`overview`?`/`:`/${n}`),zn()}function et(){return(L.candidate?.name||L.user?.displayName||`there`).split(` `)[0]||`there`}function tt(){return(L.candidate?.name||L.user?.displayName||L.user?.email||`NW`).split(/[ @.]/).filter(Boolean).slice(0,2).map(e=>e[0]).join(``).toUpperCase()}function nt(e=`normal`){let t=L.candidate?.photoURL||L.user?.photoURL||``,n=e===`large`?`avatar avatar-large`:`avatar`;return t?`<img class="${n}" src="${U(t)}" alt="${U(et())}" />`:`<div class="${n}">${tt()}</div>`}function U(e){return String(e||``).replaceAll(`&`,`&amp;`).replaceAll(`"`,`&quot;`).replaceAll(`<`,`&lt;`).replaceAll(`>`,`&gt;`)}function W(e){return String(e||``).replaceAll(`&`,`&amp;`).replaceAll(`<`,`&lt;`).replaceAll(`>`,`&gt;`).replaceAll(`"`,`&quot;`).replaceAll(`'`,`&#039;`)}function rt(e){if(!e)return`Recently`;let t=e.toDate?e.toDate():new Date(e);return new Intl.DateTimeFormat(`en`,{month:`short`,day:`numeric`}).format(t)}function G(){let e=L.candidate?.skills||[];return Array.isArray(e)?e:String(e).split(`,`).map(e=>e.trim()).filter(Boolean)}function K(e){return String(e||``).toLowerCase().normalize(`NFD`).replace(/[\u0300-\u036f]/g,``).replace(/&/g,` and `).replace(/[^a-z0-9]+/g,` `).trim().replace(/\s+/g,` `)}function it(e,t=G()){let n=X(e),r=new Set((n.skills||[]).map(K).filter(Boolean)),i=new Map(t.map(e=>[K(e),e]).filter(([e])=>e));return[...i.keys()].filter(e=>r.has(e)).map(e=>i.get(e))}function at(e){return[`Nearwork candidate`,`Talent member`].includes(String(e||``).trim())}function ot(){return _n()>=100}function st(e){if(!e)return null;if(e.toDate)return e.toDate();if(typeof e==`object`&&typeof e.seconds==`number`)return new Date(e.seconds*1e3);let t=new Date(e);return Number.isNaN(t.getTime())?null:t}function ct(e){return Number(e||1)===1?`Technical Assessment`:`DISC Assessment`}function lt(e,t){return e?.answers?.[t?.id]?.value??e?.answers?.[t?.id]??``}function q(e){return e!=null&&e!==``}function J(e,t){return(e?.questions||[]).slice(0,70).filter(e=>Number(e.stage||1)===Number(t))}function ut(e,t,n=e?.answers||{}){return J(e,t).filter(e=>!q(n[e.id]?.value??n[e.id]))}function dt(){return!!((L.applications||[]).length||(L.candidate?.pipelineCodes||[]).length||L.candidate?.pipelineCode)}function ft(){let e=L.candidate?.department||`Bogotá D.C.`,t=I[e]||I[`Bogotá D.C.`]||[`Bogotá`],n=L.candidate?.city||L.candidate?.locationCity||t[0];return{department:e,city:n,label:`${n}, ${e}`}}async function pt(){try{let e=await fetch(`/api/locations?ts=`+Date.now(),{cache:`no-store`}),t=await e.json();if(!e.ok||!t.ok||!t.departments)throw Error(t.error||`Location API unavailable`);I=t.departments}catch(e){console.warn(`Using bundled Colombia locations:`,e.message||e),I=We}}function mt(){let e=L.candidate?.targetRole||L.candidate?.headline||``;return Object.entries(F).find(([,t])=>t.includes(e))?.[0]||Object.keys(F)[0]}function ht(e){return Object.keys(F).map(t=>`<option value="${U(t)}" ${t===e?`selected`:``}>${t}</option>`).join(``)}function gt(e,t){let n=F[e]||Object.values(F).flat();return[`<option value="">Choose the closest role</option>`].concat(n.map(e=>`<option value="${U(e)}" ${t===e?`selected`:``}>${e}</option>`)).join(``)}function Y(e){let t=String(e||``).replace(/[,.\s]+$/,``).replace(/^[,.\s]+/,``).trim();return!t||t.length<2?``:Ue.find(e=>K(e)===K(t))||t.split(/\s+/).map(e=>e.length<=3&&e===e.toUpperCase()?e:e.charAt(0).toUpperCase()+e.slice(1).toLowerCase()).join(` `)}function _t(e){return`
    <div class="skill-search-shell" data-skill-search>
      <div class="selected-skills" id="selectedSkills">
        ${[...new Set((e||[]).map(Y).filter(Boolean))].map(e=>`
          <span class="selected-skill" data-skill-chip="${U(e)}">
            ${W(e)}
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
        ${[`Customer Service`,`Salesforce`,`HubSpot`,`Excel`,`Google Sheets`,`Technical Support`,`Outbound Calls`,`React`,`SQL`,`Payroll`].map(e=>`<button type="button" class="skill-suggestion" data-skill="${U(e)}">${W(e)}</button>`).join(``)}
      </div>
      <p class="field-hint">Search, select, and remove skills anytime. Use as many as apply to your experience.</p>
    </div>
  `}function vt(e,t=`USD`){let n=Number(String(e||``).replace(/[^\d.]/g,``)),r=String(t||`USD`).toUpperCase()===`COP`?`COP`:`USD`;if(!Number.isFinite(n)||n<=0)return{salary:``,salaryUSD:null,salaryCurrency:r,salaryAmount:null};let i=Math.round(n);return{salary:`${r} ${new Intl.NumberFormat(`en-US`).format(i)}/mo`,salaryUSD:r===`USD`?i:null,salaryCurrency:r,salaryAmount:i}}function yt(e){return Number(String(e||``).replace(/[^\d.]/g,``))}function bt(e,t=`USD`){let n=yt(e),r=String(t||`USD`).toUpperCase()===`COP`?`COP`:`USD`;return r===`USD`&&n>=1e5?`COP`:r}function xt(e,t=`USD`){let n=yt(e);return!Number.isFinite(n)||n<=0?``:new Intl.NumberFormat(`en-US`,{maximumFractionDigits:0}).format(Math.round(n))}function St(e){return Array.isArray(e)?e:String(e||``).split(`,`).map(e=>e.trim()).filter(Boolean)}function X(e){let t=St(e.skills||e.requiredSkills);return{id:e.id||e.code,code:e.code||e.id,title:e.title||e.role||e.openingTitle||`Open role`,orgName:e.orgName||e.company||e.clientName||`Nearwork client`,location:e.location||`Remote`,compensation:e.compensation||e.salary||e.rate||`Competitive`,match:e.match||null,skills:t,description:e.description||e.about||`Nearwork is reviewing candidates for this role now.`}}function Z(e){let t=e?.code||``;return t.includes(`operation-not-allowed`)?`This sign-in method is not available yet.`:t.includes(`unauthorized-domain`)?`This website still needs to be approved for sign-in.`:t.includes(`permission-denied`)?`We could not save this yet. Please try again in a moment or contact Nearwork support.`:t.includes(`weak-password`)?`Password must be at least 6 characters.`:t.includes(`invalid-credential`)||t.includes(`wrong-password`)?`That email/password did not match. If this account was created with Google, use Continue with Google.`:t.includes(`user-not-found`)?`No account exists for that email yet.`:t.includes(`email-already-in-use`)?`That email already has an account. Sign in or use Google.`:t.includes(`popup`)?`The Google sign-in popup was closed before finishing.`:`Something went wrong. Please try again or contact Nearwork support.`}function Ct(e){Re.innerHTML=`
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
  `,Qe()}function wt(e=`login`){let t=e===`signup`;Ct(`
    <section class="auth-panel">
      <div class="right-brand">Near<span>work</span></div>
      <div class="candidate-chip">For candidates</div>
      <div class="panel-heading">
        <h2>${t?`Create your account.`:`Welcome back.`}</h2>
        <p>${t?`Create your profile, browse roles, and track your application.`:`Use Google if your candidate account was created with Google.`}</p>
      </div>
      ${L.message?`<div class="notice">${V(`lock`)} ${U(L.message)}</div>`:``}
      ${x?``:`<div class="notice">${V(`triangle-alert`)} Sign-in is still being set up.</div>`}
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
        <button class="primary-action" type="submit">${V(t?`user-plus`:`log-in`)} ${t?`Create account`:`Sign in`}</button>
        <p id="formMessage" class="form-message" role="status"></p>
      </form>
      ${t?``:`<button id="resetPassword" class="text-action small" type="button">Forgot password?</button>`}
      <button id="toggleMode" class="text-action" type="button">${t?`Already have an account? Sign in`:`New or invited by Nearwork? Create your profile`}</button>
    </section>
  `),document.querySelector(`#toggleMode`).addEventListener(`click`,()=>wt(t?`login`:`signup`)),document.querySelector(`#googleSignIn`).addEventListener(`click`,async()=>{let e=document.querySelector(`#formMessage`);if(e.textContent=``,t){let t=document.querySelector(`#privacyConsent`),n=document.querySelector(`#privacyConsentError`);if(t&&!t.checked){n&&(n.style.display=``),e.textContent=`Please accept the Privacy Policy to continue.`,t.scrollIntoView({behavior:`smooth`,block:`center`});return}n&&(n.style.display=`none`)}let n=t?document.querySelector(`#marketingConsent`)?.checked===!0:!1;try{await be(n)}catch(t){e.textContent=Z(t)}}),document.querySelector(`#resetPassword`)?.addEventListener(`click`,async()=>{let e=document.querySelector(`input[name='email']`).value.trim().toLowerCase(),t=document.querySelector(`#formMessage`);if(!e){t.textContent=`Enter your email first, then request a reset link.`;return}try{await a(C,e),t.textContent=`Password reset sent to ${e}.`}catch(e){t.textContent=Z(e)}}),document.querySelector(`#authForm`).addEventListener(`submit`,async e=>{e.preventDefault();let r=new FormData(e.currentTarget),i=document.querySelector(`#formMessage`),a=String(r.get(`email`)).trim().toLowerCase();if(i.textContent=``,t){let e=document.querySelector(`#privacyConsent`),t=document.querySelector(`#privacyConsentError`);if(e&&!e.checked){t&&(t.style.display=``),i.textContent=`Please accept the Privacy Policy to continue.`;return}t&&(t.style.display=`none`)}let s=t?document.querySelector(`#marketingConsent`)?.checked===!0:!1,c=new Date().toISOString();try{if(t){let e=await n(C,a,r.get(`password`));await l(e.user,{displayName:r.get(`name`)}),sessionStorage.setItem(`nw_new_account`,`1`),await _e(e.user.uid,{name:r.get(`name`),email:a,availability:`open`,headline:`Nearwork candidate`,onboarded:!1,source:`talent.nearwork.co`,privacyConsent:!0,privacyConsentAt:c,marketingConsent:s,marketingConsentAt:s?c:null}),fe({name:r.get(`name`),firstName:String(r.get(`name`)||``).trim().split(/\s+/)[0],email:a}).catch(()=>null)}else await o(C,a,r.get(`password`))}catch(e){i.textContent=Z(e)}})}async function Tt(e){H({loading:!0,user:e});try{await pt();let[t,n,r]=await Promise.allSettled([ge(e),xe(e.uid),Ee()]),i=t.status===`fulfilled`?t.value:null,a=n.status===`fulfilled`?n.value:[],o=r.status===`fulfilled`?r.value:[],s=[];try{s=await Se(e.uid,e.email,i?.candidateCode||i?.code||``)}catch(e){console.warn(e)}let c=z();if(c&&!s.some(e=>e.id===c)){let t=await Ce(c,e.uid,e.email,i?.candidateCode||i?.code||``).catch(()=>null);t&&(s=[t,...s])}let l=sessionStorage.getItem(`nw_new_account`)===`1`;l&&sessionStorage.removeItem(`nw_new_account`);let u=!i?.onboarded&&!i?.targetRole;!i?.onboarded&&i?.targetRole&&ke(e.uid,{onboarded:!0,candidateCode:i?.candidateCode}).catch(()=>null);let d=l||u?`onboarding`:Ye();H({candidate:{...i||{},name:i?.name||e.displayName||`Talent member`,email:i?.email||e.email,availability:i?.availability||`open`,headline:i?.headline||i?.targetRole||`Nearwork candidate`},applications:a,assessments:s,jobs:o.map(X),loading:!1,view:`dashboard`,activePage:d,message:``}),R&&R(),x&&(R=Ne(e.uid,e=>{L.notifications=e,L.view===`dashboard`&&Dt()}))}catch(t){console.warn(t),H({candidate:{name:e.displayName||`Talent member`,email:e.email,availability:`open`,headline:`Nearwork candidate`},applications:[],assessments:[],jobs:[],loading:!1,view:`dashboard`,activePage:Ye(),message:``})}}async function Et(){let e=Ye();if(e===`assessment`){sessionStorage.setItem(`nw_restore_path`,window.location.pathname),H({user:null,candidate:null,applications:[],assessments:[],jobs:[],loading:!1,view:`login`,activePage:`overview`,message:`Please log in to open your assessment.`});return}if(e===`overview`){R&&R(),R=null,H({user:null,candidate:null,loading:!1,view:`login`,activePage:`overview`});return}let t=[];try{let e=await Ee();e.length&&(t=e.map(X))}catch(e){console.warn(e)}H({user:null,candidate:null,applications:[],assessments:[],jobs:t,loading:!1,view:`login`,activePage:`overview`,message:`Please log in to view your profile, matched openings, applications, and assessments.`})}function Dt(){let e=(L.notifications||[]).filter(e=>!e.read).length;Re.innerHTML=`
    <main class="dashboard">
      <aside class="sidebar">
        <div class="brand-top"><button class="wordmark wordmark-button" type="button" data-dashboard-home>Near<span>work</span></button></div>
        <div class="candidate-card">
          ${nt()}
          <strong>${L.candidate?.name||L.user?.displayName||`Talent member`}</strong>
          <span>${L.candidate?.headline||L.candidate?.targetRole||`Nearwork candidate`}</span>
        </div>
        <nav>
          ${Je().map(([e,t,n])=>`
            <button class="${L.activePage===e?`active`:``}" data-page="${e}">${V(t)} ${n}</button>
          `).join(``)}
          <a class="sidebar-jobs-link" href="https://jobs.nearwork.co" target="_blank" rel="noreferrer">${V(`external-link`)} Browse Jobs</a>
        </nav>
        <button id="${L.user?`signOut`:`signIn`}" class="ghost-action">${V(L.user?`log-out`:`log-in`)} ${L.user?`Sign out`:`Sign in`}</button>
      </aside>
      <section class="workspace">
        <header class="topbar">
          <div><p class="eyebrow">Candidate workspace</p><h1>${Pt()}</h1></div>
          <div class="topbar-actions">
            <div class="notification-wrap">
              <button class="icon-action" type="button" id="notificationBell" aria-label="Notifications">${V(`bell`)}${e?`<span>${e}</span>`:``}</button>
              ${L.notificationPanelOpen?kt():``}
            </div>
            <button class="icon-action" type="button" id="notificationSettings" aria-label="Notification settings">${V(`settings`)}</button>
            <label class="availability">Availability
              <select id="availability">
                ${[`open`,`interviewing`,`paused`].map(e=>`<option value="${e}" ${L.candidate?.availability===e?`selected`:``}>${e}</option>`).join(``)}
              </select>
            </label>
          </div>
        </header>
        ${L.notificationSettingsOpen?At():``}
        ${L.message?`<div class="notice">${L.message}</div>`:``}
        ${(()=>{try{return Ft()}catch(e){return console.error(`renderActivePage error:`,e),`<div class="notice">Page failed to render. <button type="button" data-page="overview">Go to overview</button></div>`}})()}
      </section>
    </main>
  `,Qe(),On(),Nt(),Mt()}function Ot(e){return(e?.toDate?e.toDate():new Date(e||Date.now())).toLocaleString(`en-US`,{month:`short`,day:`numeric`,year:`numeric`,hour:`numeric`,minute:`2-digit`})}function kt(){let e=(L.notifications||[]).slice(0,10);return`
    <div class="notification-panel">
      <div class="notification-panel-head"><strong>Notifications</strong><span>${e.length?`Latest updates`:`All clear`}</span></div>
      ${e.length?e.map(e=>`
        <button class="notification-item ${e.read?``:`unread`}" type="button" data-notification-read="${e.id}">
          <strong>${U(e.title||`Nearwork update`)}</strong>
          <span>${U(e.message||``)}</span>
          <time>${Ot(e.createdAt)}</time>
        </button>
      `).join(``):`<div class="notification-empty">No notifications yet.</div>`}
    </div>
  `}function At(){let e=L.candidate?.notificationPreferences||{};return`
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
  `}var jt=null;function Mt(){jt&&window.clearInterval(jt);let e=document.querySelector(`#assessmentTimer`);if(!e)return;let t=new Date(e.dataset.end||``).getTime(),n=()=>{let n=Math.max(0,t-Date.now()),r=Math.floor(n/1e3);e.textContent=`${Math.floor(r/60)}:${String(r%60).padStart(2,`0`)}`,e.classList.toggle(`is-low`,n<=600*1e3),n<=0&&window.clearInterval(jt)};n(),jt=window.setInterval(n,1e3)}function Nt(){if(L.activePage!==`assessment`)return;let e=L.assessments||[],t=z(),n=(t?e.find(e=>e.id===t):null)||e.find(e=>[`sent`,`started`].includes(String(e.status||``).toLowerCase()));if(!n?.id)return;let r=String(n.status||``).toLowerCase();if(r===`started`&&Xe()===null){B(n.id,Number(n.currentQuestionIndex||0),!0);return}if(!t&&r===`sent`){let e=`/assessment/${encodeURIComponent(n.id)}/start`;window.history.replaceState({page:`assessment`,assessmentId:n.id},``,e)}}function Pt(){return{onboarding:`Complete your candidate profile`,overview:`Hi ${et()}, here's your process`,matches:`Role matches`,applications:`Application pipeline`,assessment:`Assessment center`,cvs:`CV picker`,tips:`Interview tips`,recruiter:`Your recruiter`,profile:`Candidate profile`}[L.activePage]||`Talent`}function Ft(){return({onboarding:Lt,overview:It,matches:qt,applications:Jt,assessment:Yt,cvs:un,tips:dn,recruiter:fn,profile:pn}[L.activePage]||It)()}function It(){let e=ot(),t=dt(),n=L.jobs.length;return`
    ${e?``:`
      <section class="hero-card">
        <div><p class="eyebrow">Action needed</p><h2>Finish your profile to unlock matches.</h2><p>Add your role, city, salary, and skills so Nearwork can match you to the right openings.</p></div>
        <button class="primary-action fit" type="button" data-page="profile">${V(`arrow-right`)} Complete profile</button>
      </section>
    `}
    <section class="summary-grid">
      ${xn(`Profile readiness`,`${_n()}%`,`sparkles`)}
      ${xn(`Open roles`,n,`briefcase-business`)}
      ${xn(`Applications`,L.applications.length,`send`)}
      ${xn(`CVs saved`,(L.candidate?.cvLibrary||[]).length,`files`)}
    </section>
    <section class="content-grid">
      <div class="section-block"><div class="section-heading"><div><p class="eyebrow">Now</p><h2>${t?`Talent pipeline`:`Find your next opening`}</h2></div></div>${t?yn(vn()):bn()}</div>
      <div class="section-block compact"><div class="section-heading"><div><p class="eyebrow">Recruiter</p><h2>Need help?</h2></div></div>${Tn()}</div>
    </section>
  `}function Lt(){Le=1;let e=L.candidate||{};return j={roleGroup:e.roleGroup||``,targetRole:e.targetRole||``,department:e.department||e.locationDepartment||``,city:e.city||e.locationCity||``,salary:String(e.salaryAmount||e.salary||``),english:e.english||``,name:e.name||``,whatsapp:e.whatsapp||e.phone||``,linkedin:e.linkedin||``},M=null,N=null,P=null,`<div id="onboardingWizard" class="onb-shell"></div>`}function Rt(){document.querySelector(`#onboardingWizard`)&&Q(Le)}function Q(e){Le=e;let t=document.querySelector(`#onboardingWizard`);t&&(t.innerHTML=Ht(e),Wt(e))}function zt(e){return`
    <div style="display:flex;align-items:center;gap:5px;margin-bottom:28px;">
      ${Array.from({length:4},(t,n)=>`
        <div style="height:5px;border-radius:3px;flex:${n<e?2:1};background:${n<e?`var(--green)`:`var(--border)`};transition:all .3s;"></div>
      `).join(``)}
      <span style="margin-left:6px;font-size:11px;font-weight:600;color:var(--light);white-space:nowrap;">${e<=4?`${e} / 4`:`Review`}</span>
    </div>`}function $(e,t,n){return`<label style="display:flex;flex-direction:column;gap:5px;font-size:11px;font-weight:600;letter-spacing:.07em;text-transform:uppercase;color:var(--light);">${e}${t?`<span style="font-weight:400;font-size:10px;text-transform:none;letter-spacing:0;opacity:.7;">(optional)</span>`:``} ${n}</label>`}function Bt(e,t,n,r,i=``){return`<input id="${e}" type="${t}" value="${U(n||``)}" placeholder="${U(r)}" ${i} style="font-size:14px;padding:10px 12px;border:1.5px solid var(--border);border-radius:8px;background:#fff;outline:none;width:100%;box-sizing:border-box;" />`}function Vt(e,t){return`<div style="display:flex;justify-content:space-between;align-items:center;margin-top:28px;">
    ${e?`<button type="button" id="onbBack" class="secondary-action">← Back</button>`:`<span></span>`}
    <button type="button" id="onbNext" class="primary-action">${t||`Continue →`}</button>
  </div>`}function Ht(e){let t=j;switch(e){case 1:{let e=!!M;return`
        <div class="onb-step">
          ${zt(1)}
          <p class="eyebrow">Step 1 · Your CV</p>
          <h2 class="onb-heading">Upload your CV to get started</h2>
          <p class="onb-sub">We'll extract your experience, skills, and contact info automatically — so you don't have to type it all out.</p>
          <div class="upload-box" style="margin-bottom:4px;" id="onbCvBox">
            <input id="onbCvInput" type="file" accept=".pdf,.doc,.docx" style="display:none;" />
            <label for="onbCvInput" class="upload-trigger">${V(`upload`)} Choose file</label>
            <p id="onbCvStatus" style="font-size:12px;color:var(--green);min-height:18px;margin:0;">${e?`✓ ${W(M.name)}`:``}</p>
            <p>PDF or Word · max 10 MB</p>
          </div>
          <div style="display:flex;justify-content:space-between;align-items:center;margin-top:24px;">
            <button type="button" id="onbSkipCv" style="background:none;border:none;font-size:13px;color:var(--light);cursor:pointer;text-decoration:underline;padding:0;">Skip — I'll fill in manually</button>
            <button type="button" id="onbNext" class="primary-action" ${e?``:`disabled`}>Continue →</button>
          </div>
        </div>`}case 2:{let e=t.roleGroup||Object.keys(F)[0]||``;return`
        <div class="onb-step">
          ${zt(2)}
          <p class="eyebrow">Step 2 · Role</p>
          <h2 class="onb-heading">What role are you looking for?</h2>
          <p class="onb-sub">We use this to match you with the right openings from our clients.</p>
          <div style="display:grid;gap:12px;margin-bottom:4px;">
            ${$(`Area`,!1,`<select id="onbRoleGroup" style="font-size:14px;padding:10px 12px;border:1.5px solid var(--border);border-radius:8px;background:#fff;outline:none;">${ht(e)}</select>`)}
            ${$(`Role`,!1,`<select id="onbTargetRole" style="font-size:14px;padding:10px 12px;border:1.5px solid var(--border);border-radius:8px;background:#fff;outline:none;">${gt(e,t.targetRole||``)}</select>`)}
          </div>
          ${Vt(1)}
        </div>`}case 3:{let e=t.department||Object.keys(I)[0]||``,n=I[e]||[];return`
        <div class="onb-step">
          ${zt(3)}
          <p class="eyebrow">Step 3 · Location & compensation</p>
          <h2 class="onb-heading">Where are you based?</h2>
          <p class="onb-sub">This helps us narrow down roles by location and align on salary expectations.</p>
          <div style="display:grid;gap:12px;margin-bottom:4px;">
            ${$(`Department`,!1,`<select id="onbDept" style="font-size:14px;padding:10px 12px;border:1.5px solid var(--border);border-radius:8px;background:#fff;outline:none;">${Object.keys(I).map(t=>`<option value="${U(t)}" ${t===e?`selected`:``}>${W(t)}</option>`).join(``)}</select>`)}
            ${$(`City`,!1,`<select id="onbCity" style="font-size:14px;padding:10px 12px;border:1.5px solid var(--border);border-radius:8px;background:#fff;outline:none;">${n.map(e=>`<option value="${U(e)}" ${e===t.city?`selected`:``}>${W(e)}</option>`).join(``)}</select>`)}
            ${$(`Target monthly salary (USD)`,!0,Bt(`onbSalary`,`number`,t.salary||``,`e.g. 2000`,`min="0"`))}
            ${$(`English level`,!1,`<select id="onbEnglish" style="font-size:14px;padding:10px 12px;border:1.5px solid var(--border);border-radius:8px;background:#fff;outline:none;">${[``,`B1`,`B2`,`C1`,`C2`,`Native`].map(e=>`<option value="${e}" ${e===t.english?`selected`:``}>${e||`Select level`}</option>`).join(``)}</select>`)}
          </div>
          ${Vt(2)}
        </div>`}case 4:{let e=t.name||L.candidate?.name||L.user?.displayName||``,n=t.whatsapp||(P?.phone??``);return`
        <div class="onb-step">
          ${zt(4)}
          <p class="eyebrow">Step 4 · Contact</p>
          <h2 class="onb-heading">How can we reach you?</h2>
          <p class="onb-sub">Your WhatsApp number is how our recruiters will contact you directly.</p>
          <div style="display:grid;gap:12px;margin-bottom:4px;">
            ${$(`Full name`,!1,Bt(`onbName`,`text`,e,`Your full name`,`autocomplete="name"`))}
            ${$(`WhatsApp number`,!1,Bt(`onbWhatsapp`,`tel`,n,`+57 300 123 4567`,`autocomplete="tel"`))}
            ${$(`LinkedIn`,!0,Bt(`onbLinkedin`,`url`,t.linkedin||``,`https://linkedin.com/in/...`,``))}
          </div>
          <p id="onbContactError" style="font-size:12px;color:#e74c3c;min-height:16px;margin:4px 0 0;"></p>
          ${Vt(3,`Review →`)}
        </div>`}case 5:return Ut();default:return``}}function Ut(){let e=j,t=P||{},n=e.name||t.name||L.candidate?.name||`—`,r=e.targetRole||`—`,i=[e.city,e.department].filter(Boolean).join(`, `)||`—`,a=e.salary?`USD ${Number(e.salary).toLocaleString()}/mo`:`—`,o=e.english||`—`,s=e.whatsapp||`—`,c=t.skills||[],l=t.workHistory||[],u=M?.name||``,d=(e,t)=>!t||t===`—`?``:`
    <div style="display:flex;gap:16px;padding:10px 0;border-bottom:1px solid var(--border);">
      <span style="width:110px;flex-shrink:0;font-size:10px;font-weight:700;letter-spacing:.07em;text-transform:uppercase;color:var(--light);padding-top:3px;">${e}</span>
      <span style="font-size:13px;color:var(--black);line-height:1.5;">${W(String(t))}</span>
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
              ${c.slice(0,12).map(e=>`<span style="background:var(--bg);border:1px solid var(--border);border-radius:999px;padding:3px 10px;font-size:11px;color:var(--mid);">${W(e)}</span>`).join(``)}
              ${c.length>12?`<span style="font-size:11px;color:var(--light);padding:4px 6px;">+${c.length-12} more</span>`:``}
            </div>
          </div>`:``}
        ${l.length?`
          <div style="display:flex;gap:16px;padding:10px 0;">
            <span style="width:110px;flex-shrink:0;font-size:10px;font-weight:700;letter-spacing:.07em;text-transform:uppercase;color:var(--light);padding-top:4px;">Experience</span>
            <div style="display:flex;flex-direction:column;gap:8px;">
              ${l.map(e=>`
                <div>
                  <p style="font-size:13px;font-weight:600;color:var(--black);margin:0;">${W(e.title||`—`)}</p>
                  <p style="font-size:12px;color:var(--mid);margin:2px 0 0;">${W(e.company||``)}${e.from?` · ${e.from} → ${e.to===`present`?`Present`:e.to||`?`}`:``}</p>
                </div>`).join(``)}
            </div>
          </div>`:``}
      </div>
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <button type="button" id="onbEdit" class="secondary-action">← Edit</button>
        <button type="button" id="onbFinish" class="primary-action">${V(`check`)} Finish setup</button>
      </div>
      <p id="onbFinishErr" style="font-size:12px;color:#e74c3c;text-align:right;min-height:18px;margin-top:6px;"></p>
    </div>`}function Wt(e){let t=document.querySelector(`#onbBack`),n=document.querySelector(`#onbNext`);switch(t?.addEventListener(`click`,()=>Q(e-1)),e){case 1:{let e=document.querySelector(`#onbCvInput`),t=document.querySelector(`#onbCvStatus`),r=document.querySelector(`#onbSkipCv`);M&&e&&(n.disabled=!1),e?.addEventListener(`change`,()=>{let r=e.files?.[0];r&&(M=r,t&&(t.textContent=`✓ ${r.name}`),n.disabled=!1,P=null,N=Ie(r).catch(()=>null))}),n?.addEventListener(`click`,()=>Q(2)),r?.addEventListener(`click`,()=>{M=null,N=null,Q(2)});break}case 2:{let e=document.querySelector(`#onbRoleGroup`),t=document.querySelector(`#onbTargetRole`);e?.addEventListener(`change`,()=>{t.innerHTML=gt(e.value,``)}),n?.addEventListener(`click`,()=>{j.roleGroup=e?.value||``,j.targetRole=t?.value||``,Q(3)});break}case 3:{let e=document.querySelector(`#onbDept`),t=document.querySelector(`#onbCity`);e?.addEventListener(`change`,()=>{t.innerHTML=(I[e.value]||[]).map(e=>`<option value="${U(e)}">${W(e)}</option>`).join(``)}),n?.addEventListener(`click`,()=>{j.department=e?.value||``,j.city=t?.value||``,j.salary=document.querySelector(`#onbSalary`)?.value||``,j.english=document.querySelector(`#onbEnglish`)?.value||``,Q(4)});break}case 4:n?.addEventListener(`click`,()=>{let e=document.querySelector(`#onbName`)?.value.trim(),t=document.querySelector(`#onbWhatsapp`)?.value.trim(),n=document.querySelector(`#onbContactError`);if(!t){n&&(n.textContent=`WhatsApp number is required.`),document.querySelector(`#onbWhatsapp`)?.focus();return}j.name=e,j.whatsapp=t,j.linkedin=document.querySelector(`#onbLinkedin`)?.value.trim()||``,Gt()});break;case 5:document.querySelector(`#onbEdit`)?.addEventListener(`click`,()=>Q(1)),document.querySelector(`#onbFinish`)?.addEventListener(`click`,Kt);break}}async function Gt(){let e=document.querySelector(`#onboardingWizard`);e&&(N&&!P&&(e.innerHTML=`<div class="onb-step"><p style="text-align:center;font-size:14px;font-weight:600;color:var(--green);padding:56px 0;">Finalising your profile…</p></div>`,P=await N),P?.phone&&!j.whatsapp&&(j.whatsapp=P.phone),P?.name&&!j.name&&(j.name=P.name),Q(5))}async function Kt(){let e=document.querySelector(`#onbFinish`),t=document.querySelector(`#onbFinishErr`);e&&(e.disabled=!0,e.innerHTML=`Saving…`);try{let e=j,t=P||{},n=L.user?.uid;if(!n)throw Error(`Not signed in`);let r=vt(e.salary||``,`USD`),i=e.department||``,a=e.city||``,o={};if(M)try{let e=await Me(n,M,``);o={activeCvId:e.id,activeCvName:e.name||e.fileName,cvUrl:e.url,cvLibrary:[e]}}catch{}let s={name:e.name||t.name||L.candidate?.name||L.user?.displayName||``,targetRole:e.targetRole||``,headline:e.targetRole||``,department:i,city:a,location:[a,i].filter(Boolean).join(`, `),locationCity:a,locationDepartment:i,locationCountry:`Colombia`,locationId:`${String(a).toLowerCase().normalize(`NFD`).replace(/[̀-ͯ]/g,``).replace(/[^a-z0-9]+/g,`-`)}-co`,english:e.english||``,salary:r.salary,salaryUSD:r.salaryUSD,salaryAmount:r.salaryAmount,salaryCurrency:`USD`,expectedSalaryAmount:r.salaryAmount,expectedSalaryCurrency:`USD`,whatsapp:e.whatsapp||``,phone:e.whatsapp||``,linkedin:e.linkedin||``,skills:[...new Set((t.skills||[]).map(Y).filter(Boolean))],workHistory:t.workHistory||[],summary:t.summary||``,email:L.candidate?.email||L.user?.email||``,candidateCode:L.candidate?.candidateCode,marketingConsent:L.candidate?.marketingConsent===!0,availability:`open`,onboarded:!0,...o};await ke(n,s),window.history.pushState({page:`overview`},``,`/`),H({candidate:{...L.candidate,...s},activePage:`overview`,message:`Welcome to Nearwork! Your profile is ready.`})}catch{t&&(t.textContent=`Something went wrong. Please try again.`),e&&(e.disabled=!1,e.innerHTML=`${V(`check`)} Finish setup`)}}function qt(){let e=L.candidate?.targetRole||(at(L.candidate?.headline)?``:L.candidate?.headline),t=G(),n=L.jobs.map(X).filter(e=>it(e,t).length>=3),r=t.length>=3,i=L.matchesFiltered&&r?n:L.jobs.map(X),a=L.matchesFiltered&&!n.length;return`
    <section class="section-block">
      <div class="section-heading">
        <div><p class="eyebrow">Openings</p><h2>${L.matchesFiltered?`Best fit from your profile`:`All current openings`}</h2></div>
        <button id="filterMatches" class="secondary-action" type="button">${V(L.matchesFiltered?`list`:`filter`)} ${L.matchesFiltered?`Show all openings`:`Filter by my role & skills`}</button>
      </div>
      <div class="match-note"><strong>${i.length}</strong> of <strong>${L.jobs.length}</strong> openings showing. Matches require <strong>3+ shared skills</strong>. Role: <strong>${e||`not set`}</strong>. Skills: <strong>${t.join(`, `)||`not set`}</strong>.</div>
      <div class="job-list">${a?En(`No filtered matches yet`,`Add a target role and skills in Profile to improve matching.`):i.map(e=>Cn(e)).join(``)}</div>
    </section>
  `}function Jt(){return`
    <section class="section-block">
      <div class="section-heading"><div><p class="eyebrow">Pipeline</p><h2>Your applications</h2></div></div>
      ${dt()?yn(vn()):bn()}
      <div class="timeline page-gap">${L.applications.length?L.applications.map(wn).join(``):En(`No applications yet`,`Apply to a role and your process will show here.`)}</div>
    </section>
  `}function Yt(){let e=z(),t=L.assessments||[],n=t.filter(e=>[`sent`,`started`].includes(String(e.status||``).toLowerCase())),r=t.filter(e=>String(e.status||``).toLowerCase()===`completed`),i=e?t.find(t=>t.id===e):n[0]||r[0]||null;if(L.assessmentUiStep===`techIntro`&&i)return nn(i);if(L.assessmentUiStep===`discIntro`&&i)return rn(i);if(e&&!i)return`
      <div class="nw-assess-wrap nw-assess-state-page">
        <div class="nw-assess-state-card">
          <div class="nw-assess-state-icon" style="background:#FEF0F5;color:#CC3666">${V(`link-2-off`)}</div>
          <strong>This link isn't available</strong>
          <p>Make sure you're logged into the same account that received the assessment email. If the problem persists, reach out to your Nearwork recruiter.</p>
          <button class="primary-action fit" data-page="recruiter" type="button">${V(`message-circle`)} Contact support</button>
        </div>
      </div>
    `;if(!i)return`
      <div class="nw-assess-wrap nw-assess-state-page">
        <div class="nw-assess-state-card">
          <div class="nw-assess-state-icon">${V(`inbox`)}</div>
          <strong>No assessment assigned yet</strong>
          <p>Your assessment will appear here when Nearwork sends it. You'll receive an email notification when it's ready.</p>
          <div class="nw-assess-info-row">
            <div class="nw-assess-info-item">${V(`shield-check`)}<span>One attempt</span></div>
            <div class="nw-assess-info-item">${V(`timer`)}<span>~45–90 min</span></div>
            <div class="nw-assess-info-item">${V(`users`)}<span>Recruiter reviewed</span></div>
          </div>
        </div>
      </div>
    `;let a=Array.isArray(i.questions)?i.questions:[],o=String(i.status||``).toLowerCase()===`started`,s=String(i.status||``).toLowerCase()===`completed`,c=String(i.status||``).toLowerCase()===`cancelled`,l=tn(i),u=Xe(),d=Number(i.currentQuestionIndex||0),f=Math.min(u??d,Math.max(a.length-1,0)),p=a[f]?.stage||i.currentStage||1,m=o&&!s&&!c&&!l;return`
    <div class="nw-assess-wrap">
      ${m?Qt(i,p,f,a):Xt(i)}
      ${m?Zt(i,f):``}
      <div class="nw-assess-body" id="assessmentWorkspace">
        ${s?an(i):c?`<div class="nw-assess-state-card nw-assess-state-card--inline"><div class="nw-assess-state-icon" style="background:#F5F4F0;color:#555">${V(`ban`)}</div><strong>Assessment cancelled</strong><p>This assessment is no longer available. A new assigned assessment will appear here when your recruiter sends one.</p></div>`:l?`<div class="nw-assess-state-card nw-assess-state-card--inline"><div class="nw-assess-state-icon" style="background:#FEF0F5;color:#CC3666">${V(`clock-x`)}</div><strong>Assessment link expired</strong><p>This unique assessment link is no longer valid. Contact your Nearwork recruiter if you need a new one.</p><button class="ghost-action" data-page="recruiter" type="button">${V(`message-circle`)} Contact recruiter</button></div>`:$t(i,o,f)}
      </div>
      ${on(t,i.id)}
    </div>
  `}function Xt(e){let t=String(e.status||``).toLowerCase();return`
    <div class="nw-assess-chrome">
      <div class="nw-assess-chrome__logo">
        <div class="nw-assess-chrome__logotile">N</div>
        <span class="nw-assess-chrome__brand">Nearwork</span>
        <div class="nw-assess-chrome__divider"></div>
        <span class="nw-assess-chrome__sub">Candidate assessment</span>
      </div>
      <div style="flex:1"></div>
      ${[`completed`,`cancelled`].includes(t)?``:`<button class="nw-assess-chrome__exit" type="button">${V(`x`)} Save &amp; exit</button>`}
    </div>
  `}function Zt(e,t){let n=(e.questions||[]).slice(0,70),r=J(e,1).filter(t=>q(lt(e,t))).length,i=J(e,2).filter(t=>q(lt(e,t))).length;return`
    <section class="assessment-progress-panel">
      <div><strong>Technical</strong><span>${r}/${J(e,1).length||50} answered</span></div>
      <div><strong>DISC</strong><span>${i}/${J(e,2).length||20} answered</span></div>
      <div class="assessment-progress-strip">
        ${n.map((n,r)=>{let i=q(lt(e,n));return`<button type="button" class="${r===t?`active`:``} ${i?`answered`:``}" data-assessment-jump="${r}" title="${ct(n.stage)} · Q${r+1}">${r+1}</button>`}).join(``)}
      </div>
    </section>
  `}function Qt(e,t,n,r){let i=Number(t||1),a=st(e.technicalStartedAt||e.startedAt)||new Date,o=st(e.discStartedAt)||new Date,s=i===1?a:o,c=Number(i===1?e.technicalMinutes||60:e.discMinutes||30),l=new Date(s.getTime()+c*60*1e3),u=i===1?`Technical`:`DISC profile`,d=(r||[]).filter(e=>Number(e.stage||1)===i),f=(r||[]).findIndex(e=>Number(e.stage||1)===i),p=Math.max(0,n-f),m=d.length?Math.round((p+1)/d.length*100):2;return`
    <div class="nw-assess-chrome nw-assess-chrome--active">
      <div class="nw-assess-chrome__logo">
        <div class="nw-assess-chrome__logotile">N</div>
        <span class="nw-assess-chrome__brand">Nearwork</span>
        <div class="nw-assess-chrome__divider"></div>
        <span class="nw-assess-chrome__sub">Candidate assessment</span>
      </div>
      <div class="nw-assess-chrome__center">
        <div class="nw-assess-chrome__section">
          ${V(`clipboard-check`)}
          <span>${u} &middot; Question ${p+1} of ${d.length||(i===1?50:20)}</span>
        </div>
        <div class="nw-assess-chrome__progresstrack">
          <div class="nw-assess-chrome__progressfill" style="width:${Math.max(2,m)}%"></div>
        </div>
      </div>
      <div class="nw-timer-pill">
        ${V(`timer`)}
        <span id="assessmentTimer" data-end="${l.toISOString()}">${c}:00</span>
      </div>
      <button class="nw-assess-chrome__exit" type="button">${V(`x`)} Save &amp; exit</button>
    </div>
  `}function $t(e,t,n=null){if(!t){let t=U(e.role||`Role assessment`),n=U(e.recruiterName||e.recruiter||`Nearwork`),r=rt(e.expiresAt||e.deadline),i=J(e,1).length||50,a=J(e,2).length||20,o=Number(e.technicalMinutes||60),s=Number(e.discMinutes||30);return`
      <div class="nw-assess-welcome">
        <div class="nw-assess-welcome__header">
          <span class="nw-assess-role-chip">${V(`sparkles`)} ${t}</span>
          <span>Sent by ${n}${r?` &middot; expires `+r:``}</span>
        </div>
        <h2 class="nw-assess-welcome__title">Let's see how you think — and how you work.</h2>
        <p class="nw-assess-welcome__desc">This assessment has two parts: a role-knowledge check and a behavioral profile.</p>
        <div class="nw-assess-parts">
          <div class="nw-assess-part">
            <div class="nw-assess-part__blob" style="background:#E8F8F5"></div>
            <div class="nw-assess-part__icon" style="background:#E8F8F5;color:#16A085">${V(`code-2`)}</div>
            <span class="nw-assess-part__tag" style="color:#16A085">Part 1</span>
            <strong class="nw-assess-part__title">Technical Assessment</strong>
            <span class="nw-assess-part__sub">${i} questions &middot; ~${o} min</span>
            <p class="nw-assess-part__desc">Single-choice role scenarios. We're looking at how you think, not whether you remember definitions.</p>
          </div>
          <div class="nw-assess-part">
            <div class="nw-assess-part__blob" style="background:#F7F2FC"></div>
            <div class="nw-assess-part__icon" style="background:#F7F2FC;color:#AF7AC5">${V(`compass`)}</div>
            <span class="nw-assess-part__tag" style="color:#AF7AC5">Part 2</span>
            <strong class="nw-assess-part__title">DISC Profile</strong>
            <span class="nw-assess-part__sub">${a} statements &middot; ~${s} min</span>
            <p class="nw-assess-part__desc">How you work, communicate, and lead under pressure. No right or wrong answers.</p>
          </div>
        </div>
        <div class="nw-assess-rules">
          <div class="nw-assess-rule"><div class="nw-assess-rule__icon">${V(`wifi`)}</div><div><strong>Stable connection</strong><span>Progress saves on every answer.</span></div></div>
          <div class="nw-assess-rule"><div class="nw-assess-rule__icon">${V(`timer`)}</div><div><strong>Timed sections</strong><span>A countdown runs per stage.</span></div></div>
          <div class="nw-assess-rule"><div class="nw-assess-rule__icon">${V(`lock`)}</div><div><strong>One attempt</strong><span>Take it when you can give it your full focus.</span></div></div>
          <div class="nw-assess-rule"><div class="nw-assess-rule__icon">${V(`eye-off`)}</div><div><strong>No proctoring</strong><span>No camera or screen recording.</span></div></div>
        </div>
        <div class="nw-assess-welcome__cta">
          <button class="primary-action" id="showTechIntro" type="button">${V(`arrow-right`)} Begin assessment</button>
          <span>Questions are timed. Open when you're ready to focus.</span>
        </div>
      </div>
    `}let r=(e.questions||[]).slice(0,70),i=Math.min(n??Number(e.currentQuestionIndex||0),Math.max(r.length-1,0)),a=r[i],o=e.answers?.[a.id]?.value??e.answers?.[a.id]??``,s=Array.isArray(a.options)&&a.options.length?a.options:[`Strongly agree`,`Agree`,`Neutral`,`Disagree`],c=r[i+1]?.stage,l=c&&c!==a.stage,u=ut(e,a.stage),d=l&&u.length,f=i+1>=r.length,p=f?ut(e,a.stage):[],m=!!a.multiple,h=Number(a.stage||1)===2?`nw-assess-chip--violet`:`nw-assess-chip--teal`,ee=m?`Multi-select`:`Single choice`,g=U(a.part||a.type||(Number(a.stage||1)===2?`DISC`:`Scenario`)),te=U(a.bank||``);return`
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
            ${m?``:`<span class="nw-assess-option__check">${V(`check-circle-2`)}</span>`}
          </label>
        `).join(``)}
      </fieldset>
      ${d||p.length?en(e,d?u:p,a.stage):``}
      <div class="nw-assess-qfooter">
        <button class="ghost-action" id="prevAssessmentQuestion" type="button" ${i===0?`disabled`:``}>${V(`arrow-left`)} Back</button>
        <span class="nw-assess-autosave">${V(`check`)} Auto-saved</span>
        <div style="flex:1"></div>
        <button class="primary-action fit" type="submit">${f?V(`send`)+` Submit assessment`:`Next `+V(`arrow-right`)}</button>
      </div>
    </form>
  `}function en(e,t,n){if(!t.length)return``;let r=(e.questions||[]).slice(0,70);return`
    <div class="nw-assess-missed">
      <strong>${V(`alert-triangle`)} Unanswered questions in ${ct(n)}</strong>
      <p>You skipped ${t.map(e=>`Question ${r.findIndex(t=>t.id===e.id)+1}`).join(`, `)}. You can go back now or continue if you meant to leave them blank.</p>
      <div class="nw-assess-missed__links">${t.map(e=>{let t=r.findIndex(t=>t.id===e.id);return`<button class="ghost-action" type="button" data-assessment-jump="${t}">${V(`arrow-left`)} Go to ${t+1}</button>`}).join(``)}</div>
    </div>
  `}function tn(e){return!e?.expiresAt||String(e.status||``).toLowerCase()===`completed`?!1:Date.now()>new Date(e.expiresAt).getTime()}function nn(e){let t=U(e.role||`Role assessment`),n=J(e,1).length||50,r=Number(e.technicalMinutes||60);return`
    <div class="nw-assess-wrap">
      ${Xt(e)}
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
            <button class="primary-action" id="startAssessment" type="button">${V(`play`)} Start Part 1</button>
            <button class="ghost-action" id="backToWelcome" type="button">${V(`arrow-left`)} Back</button>
          </div>
        </div>
      </div>
    </div>
  `}function rn(e){let t=J(e,1).length||50,n=J(e,2).length||20,r=Number(e.discMinutes||30),i=U(e.recruiterName||e.recruiter||`your recruiter`),a=(e.questions||[]).findIndex(e=>Number(e.stage||1)===2);return`
    <div class="nw-assess-wrap">
      ${Xt(e)}
      <div class="nw-assess-body">
        <div style="background:#E8F8F5;border-bottom:1px solid rgba(22,160,133,0.15);padding:13px 20px;display:flex;align-items:center;gap:12px;margin-bottom:24px;border-radius:10px">
          <div style="width:26px;height:26px;border-radius:50%;background:#16A085;color:#fff;display:flex;align-items:center;justify-content:center;flex-shrink:0">${V(`check`)}</div>
          <div style="flex:1">
            <div style="font-size:13px;font-weight:600;color:#0E6B58">Part 1 complete — nice work.</div>
            <div style="font-size:12px;color:#12866E;margin-top:1px">${t}/${t} answered &middot; submitted to ${i} for review</div>
          </div>
          <span class="nw-assess-chip nw-assess-chip--teal">${V(`trophy`)} Part 1 done</span>
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
            <div class="nw-assess-rule"><div class="nw-assess-rule__icon" style="color:#AF7AC5">${V(`users-round`)}</div><div><strong>No right answers</strong><span>This measures style, not performance.</span></div></div>
            <div class="nw-assess-rule"><div class="nw-assess-rule__icon" style="color:#AF7AC5">${V(`timer`)}</div><div><strong>${r} min total</strong><span>Go with your first instinct.</span></div></div>
            <div class="nw-assess-rule"><div class="nw-assess-rule__icon" style="color:#AF7AC5">${V(`shield-check`)}</div><div><strong>Used for fit</strong><span>Helps match you with the right team.</span></div></div>
            <div class="nw-assess-rule"><div class="nw-assess-rule__icon" style="color:#AF7AC5">${V(`check`)}</div><div><strong>Auto-saved</strong><span>Progress saves on every answer.</span></div></div>
          </div>
          <div class="nw-assess-welcome__cta" style="margin-top:8px">
            <button class="primary-action" id="startDiscAssessment" data-disc-index="${a>=0?a:50}" type="button">${V(`play`)} Start Part 2</button>
          </div>
        </div>
      </div>
    </div>
  `}function an(e){let t=(L.candidate?.name||L.user?.displayName||``).split(` `)[0]||`You`,n=U(e.recruiterName||e.recruiter||`your recruiter`),r=J(e,1).length||50,i=J(e,2).length||20;return`
    <div class="nw-assess-complete">
      <div class="nw-assess-complete__hero">
        <div class="nw-assess-complete__icon">
          ${V(`check`)}
          <div class="nw-assess-complete__ring1"></div>
          <div class="nw-assess-complete__ring2"></div>
        </div>
        <h2 class="nw-assess-complete__title">You're done, ${U(t)}.</h2>
        <p class="nw-assess-complete__desc">Your results have been sent to ${n}. They'll reach out personally — usually within a business day.</p>
      </div>
      <div class="nw-assess-complete__chips">
        <span class="nw-assess-complete__chip nw-assess-complete__chip--teal">${V(`clipboard-check`)} Part 1 &middot; ${r}/${r} answered</span>
        <span class="nw-assess-complete__chip nw-assess-complete__chip--violet">${V(`compass`)} Part 2 &middot; ${i}/${i} answered</span>
        <span class="nw-assess-complete__chip nw-assess-complete__chip--gray">${V(`check-circle-2`)} Assessment complete</span>
      </div>
      <div class="nw-assess-next">
        <div class="nw-assess-next__label">What happens next</div>
        ${[{icon:`inbox`,title:`Your recruiter reviews your results`,desc:`${n} will read your scenarios and DISC profile, usually within one business day.`,when:`Within 24h`},{icon:`message-square`,title:`A personal note from ${n}`,desc:`Not an automated email. They'll share what stood out and what comes next.`,when:`Tomorrow`},{icon:`calendar-check`,title:`Interview with the hiring team`,desc:`If there's a match, you'll get a calendar link to book a slot that works for you.`,when:`This week`}].map(({icon:e,title:t,desc:n,when:r},i)=>`
          <div class="nw-assess-next__item">
            <div class="nw-assess-next__icon-wrap">
              <div class="nw-assess-next__iconbox">${V(e)}</div>
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
        <button class="ghost-action" data-page="recruiter" type="button">${V(`message-circle`)} Message recruiter</button>
      </div>
    </div>
  `}function on(e,t){return e.length?`
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
  `:``}function sn(e,t){let n=e.questions||[],r=n.filter(e=>e.stage===1),i=n.filter(e=>e.stage===2),a=r.filter(e=>typeof e.correctIndex==`number`&&Number(t[e.id]?.value)===e.correctIndex).length,o=i.filter(e=>q(t[e.id]?.value??t[e.id])).length;return{technicalScore:r.length?Math.round(a/r.length*100):0,discScore:i.length?Math.round(o/i.length*100):0}}function cn(e,t){let n={Dominance:0,Influence:0,Steadiness:0,Conscientiousness:0};(e.questions||[]).filter(e=>Number(e.stage)===2).forEach(e=>{let r=t[e.id]?.value;if(!q(r))return;let i=n[e.skill]===void 0?`Steadiness`:e.skill,a=Math.max(1,4-Number(r||0));n[i]+=a});let r=Object.entries(n).sort((e,t)=>t[1]-e[1]),i=r[0]?.[0]||`Steadiness`,a=r[r.length-1]?.[0]||`Dominance`;return{label:{Dominance:`D`,Influence:`I`,Steadiness:`S`,Conscientiousness:`C`}[i]||`S`,high:i,low:a,scores:n,summary:`${i} is the strongest observed DISC tendency; ${a} appears lowest based on this assessment.`}}async function ln(e,t){let n=`https://admin.nearwork.co/api/send-email`,r=e.candidateEmail||L.user?.email||L.candidate?.email,i=e.candidateName||L.candidate?.name||L.user?.displayName||`there`,a=St([e.recruiterEmail,e.stakeholderEmail,e.hiringManagerEmail].filter(Boolean).join(`,`)),o=[];r&&o.push(fetch(n,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify({to:r,templateId:`assessment_completed_candidate`,data:{name:i,role:e.role,actionUrl:`https://talent.nearwork.co/assessment`,actionText:`Open assessment center`}})}));let s=a.length?a:[`support@nearwork.co`];o.push(fetch(n,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify({to:s,templateId:`assessment_completed_recruiter`,data:{name:`Nearwork team`,role:e.role,actionUrl:`https://admin.nearwork.co/assessments/${e.id}/questions`,actionText:`Review assessment`,message:`${i} completed the assessment. Overall: ${t.score}%. Technical: ${t.technicalScore}%. DISC: ${t.discProfile?.label||`Submitted`}.`}})})),await Promise.allSettled(o)}function un(){let e=L.candidate?.cvLibrary||[];return`
    <section class="section-block">
      <div class="section-heading"><div><p class="eyebrow">CV picker</p><h2>Store multiple resumes</h2></div></div>
      <form id="cvForm" class="upload-box">
        ${V(`upload-cloud`)}<strong>Upload a CV for this role</strong><p>Save multiple versions and pick the best one for each opening.</p>
        <input name="cv" type="file" accept=".pdf,.doc,.docx" required />
        <input name="label" type="text" placeholder="CV label, e.g. CSM resume" />
        <button class="primary-action fit" type="submit">Upload CV</button>
      </form>
      <div class="cv-list">
        ${e.length?e.map(e=>`<article class="cv-item">${V(`file-text`)}<div><strong>${e.name||e.fileName}</strong><span>${rt(e.uploadedAt)}</span></div>${e.url?`<a href="${e.url}" target="_blank" rel="noreferrer">Open</a>`:``}</article>`).join(``):En(`No CVs saved yet`,`Upload role-specific resumes here.`)}
      </div>
    </section>
  `}function dn(){return`
    <section class="tips-hero"><div><p class="eyebrow">Candidate guide</p><h2>Practical prep for US SaaS interviews.</h2><p>Short, useful guidance candidates can read before recruiter screens, assessments, and client interviews.</p></div></section>
    <section class="tips-grid rich">
      ${Ge.map((e,t)=>`
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
  `}function fn(){let e=(L.candidate?.recruiter||{}).bookingUrl||L.candidate?.recruiterBookingUrl||`mailto:support@nearwork.co?subject=Nearwork%20candidate%20question`;return`
    <section class="content-grid">
      <div class="section-block"><div class="section-heading"><div><p class="eyebrow">Recruiter</p><h2>Your Nearwork contact</h2></div></div>${Tn(!0)}</div>
      <div class="section-block compact"><div class="section-heading"><div><p class="eyebrow">Booking</p><h2>Schedule soon</h2></div></div><p class="muted">Ask the Nearwork recruiting team for the earliest available slot. Candidate booking links can be attached to this profile later.</p><a class="primary-action fit" href="${e}" target="_blank" rel="noreferrer">${V(`calendar-plus`)} Book recruiter call</a></div>
    </section>
  `}function pn(){return gn(`profile`)}function mn(e,t={}){let n=e;return`
    <div class="work-entry" data-work-index="${n}" style="border:1px solid var(--border);border-radius:10px;padding:14px 16px;margin-bottom:10px;position:relative;">
      <button type="button" class="remove-work-entry" data-remove="${n}" style="position:absolute;top:10px;right:12px;background:none;border:none;font-size:16px;color:var(--light);cursor:pointer;line-height:1;padding:2px 4px;" aria-label="Remove">×</button>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:8px;">
        <label style="display:grid;gap:4px;font-size:11px;font-weight:700;color:var(--mid);letter-spacing:.04em;">Job title
          <input type="text" class="work-field" data-field="title" value="${U(t.title||``)}" placeholder="e.g. Customer Success Manager" style="min-height:38px;font-size:13px;" />
        </label>
        <label style="display:grid;gap:4px;font-size:11px;font-weight:700;color:var(--mid);letter-spacing:.04em;">Company
          <input type="text" class="work-field" data-field="company" value="${U(t.company||``)}" placeholder="e.g. Acme Corp" style="min-height:38px;font-size:13px;" />
        </label>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;align-items:end;">
        <label style="display:grid;gap:4px;font-size:11px;font-weight:700;color:var(--mid);letter-spacing:.04em;">From (YYYY-MM)
          <input type="text" class="work-field" data-field="from" value="${U(t.from||``)}" placeholder="2021-03" style="min-height:38px;font-size:13px;" />
        </label>
        <label style="display:grid;gap:4px;font-size:11px;font-weight:700;color:var(--mid);letter-spacing:.04em;">To (YYYY-MM or "present")
          <input type="text" class="work-field" data-field="to" value="${U(t.to||``)}" placeholder="present" style="min-height:38px;font-size:13px;" />
        </label>
      </div>
    </div>`}function hn(e,t={}){let n=e;return`
    <div class="cert-entry" data-cert-index="${n}" style="border:1px solid var(--border);border-radius:10px;padding:14px 16px;margin-bottom:10px;position:relative;">
      <button type="button" class="remove-cert-entry" data-remove="${n}" style="position:absolute;top:10px;right:12px;background:none;border:none;font-size:16px;color:var(--light);cursor:pointer;line-height:1;padding:2px 4px;" aria-label="Remove">×</button>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:8px;">
        <label style="display:grid;gap:4px;font-size:11px;font-weight:700;color:var(--mid);letter-spacing:.04em;">Certificate / Course
          <input type="text" class="cert-field" data-field="name" value="${U(t.name||``)}" placeholder="e.g. Google Data Analytics" style="min-height:38px;font-size:13px;" />
        </label>
        <label style="display:grid;gap:4px;font-size:11px;font-weight:700;color:var(--mid);letter-spacing:.04em;">Issuing organisation <span style="font-weight:400;opacity:.6;">optional</span>
          <input type="text" class="cert-field" data-field="issuer" value="${U(t.issuer||``)}" placeholder="e.g. Coursera, HubSpot" style="min-height:38px;font-size:13px;" />
        </label>
      </div>
      <div style="max-width:200px;">
        <label style="display:grid;gap:4px;font-size:11px;font-weight:700;color:var(--mid);letter-spacing:.04em;">Date (YYYY-MM) <span style="font-weight:400;opacity:.6;">optional</span>
          <input type="text" class="cert-field" data-field="date" value="${U(t.date||``)}" placeholder="2023-06" style="min-height:38px;font-size:13px;" />
        </label>
      </div>
    </div>`}function gn(e=`profile`){let t=G(),n=ft(),r=I[n.department]||[],i=L.candidate?.salaryCurrency||`USD`,a=vt(L.candidate?.salaryAmount||L.candidate?.salary||L.candidate?.salaryUSD,i),o=mt(),s=L.candidate?.targetRole||L.candidate?.headline||``;return`
    <section class="section-block">
      <div class="section-heading"><div><p class="eyebrow">${e===`onboarding`?`Setup`:`Profile`}</p><h2>${e===`onboarding`?`Complete your account`:`Improve your match quality`}</h2></div><span class="profile-score">${_n()}%</span></div>
      <form id="profileForm" class="profile-form">
        <div class="profile-card profile-identity wide">
          ${nt(`large`)}
          <label>Profile photo <span class="optional-label">optional</span>
            <input name="photo" type="file" accept="image/png,image/jpeg,image/webp" />
          </label>
        </div>
        <label class="wide">Full name<input name="name" value="${U(L.candidate?.name||L.user?.displayName||``)}" /></label>
        <div class="profile-card wide">
          <div class="field-label">Role applying for</div>
          <div class="profile-card-grid">
            <label>Area
              <select name="roleGroup" id="roleGroupSelect">
                ${ht(o)}
              </select>
            </label>
            <label>Role
              <select name="targetRole" id="targetRoleSelect">
                ${gt(o,s)}
              </select>
            </label>
          </div>
        </div>
        <div class="profile-card wide">
          <div class="field-label">Location</div>
          <div class="profile-card-grid">
            <label>Department
              <select name="department" id="departmentSelect">
                ${Object.keys(I).map(e=>`<option value="${U(e)}" ${e===n.department?`selected`:``}>${e}</option>`).join(``)}
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
            <label>English level<select name="english">${[``,`B1`,`B2`,`C1`,`C2`,`Native`].map(e=>`<option value="${e}" ${L.candidate?.english===e?`selected`:``}>${e||`Select level`}</option>`).join(``)}</select></label>
            <label>Other languages <span class="optional-label">optional</span>
              <input name="languages" value="${U((L.candidate?.languages||[]).join(`, `))}" placeholder="e.g. Spanish, Portuguese, French" />
            </label>
          </div>
        </div>
        <div class="profile-card wide">
          <div class="field-label">Contact</div>
          <div class="profile-card-grid">
            <label>WhatsApp number
              <input name="whatsapp" value="${U(L.candidate?.whatsapp||L.candidate?.phone||``)}" inputmode="tel" autocomplete="tel" placeholder="+57 300 123 4567" required />
            </label>
            <label>LinkedIn <span class="optional-label">optional</span>
              <input name="linkedin" value="${U(L.candidate?.linkedin||``)}" placeholder="https://linkedin.com/in/..." />
            </label>
          </div>
        </div>
        <div class="profile-card wide">
          <div class="field-label">Skills</div>
          <p class="field-hint">Search for skills and add everything that applies to your experience.</p>
          ${_t(t)}
        </div>
        <div class="profile-card wide" id="profileCvCard">
          <div class="field-label">CV</div>
          <p class="field-hint">Upload the CV you want Nearwork to use for your applications.</p>
          ${L.candidate?.activeCvName||L.candidate?.cvUrl?`
            <div class="cv-item" style="border:1px solid var(--border);border-radius:10px;margin-bottom:4px;">
              ${V(`file-text`)}
              <div>
                <strong>${L.candidate.activeCvName||`CV on file`}</strong>
                <span>Currently saved · select a new file below to replace</span>
              </div>
              ${L.candidate.cvUrl?`<a href="${L.candidate.cvUrl}" target="_blank" rel="noreferrer">Open</a>`:``}
            </div>
          `:``}
          <input name="profileCv" type="file" accept=".pdf,.doc,.docx" />
          <input name="profileCvLabel" type="text" placeholder="CV label, e.g. Customer Success CV" />
        </div>
        <label class="wide">Summary <span class="optional-label">optional</span><textarea name="summary" placeholder="Add a short note about what you do best.">${L.candidate?.summary||``}</textarea></label>
        <div class="profile-card wide" id="workHistoryCard">
          <div class="field-label">Work experience <span class="optional-label">optional</span></div>
          <p class="field-hint">Add your previous roles so recruiters can see your background.</p>
          <div id="workEntries">
            ${(L.candidate?.workHistory||[]).map((e,t)=>mn(t,e)).join(``)}
          </div>
          <button type="button" id="addWorkEntry" class="secondary-action" style="margin-top:12px;width:auto;padding:0 16px;min-height:36px;font-size:12px;">${V(`plus`)} Add position</button>
        </div>
        <div class="profile-card wide" id="certCard">
          <div class="field-label">Certifications &amp; courses <span class="optional-label">optional</span></div>
          <p class="field-hint">Add any certificates, licences, or courses relevant to your work.</p>
          <div id="certEntries">
            ${(L.candidate?.certifications||[]).map((e,t)=>hn(t,e)).join(``)}
          </div>
          <button type="button" id="addCertEntry" class="secondary-action" style="margin-top:12px;width:auto;padding:0 16px;min-height:36px;font-size:12px;">${V(`plus`)} Add certificate</button>
        </div>
        <input type="hidden" name="mode" value="${e}" />
        <button class="primary-action fit" type="submit">${V(`save`)} ${e===`onboarding`?`Finish setup`:`Save profile`}</button>
      </form>
    </section>
  `}function _n(){let e=[`name`,`targetRole`,`department`,`city`,`english`,`salary`,`whatsapp`],t=e.filter(e=>e===`targetRole`?!!(L.candidate?.targetRole||!at(L.candidate?.headline)&&L.candidate?.headline):!!L.candidate?.[e]).length+ +!!G().length;return Math.max(25,Math.round(t/(e.length+1)*100))}function vn(){let e=L.applications[0];return e?.stage||e?.status||`profile-review`}function yn(e){let t=String(e||``).toLowerCase().replace(/_/g,`-`).replace(/\s+/g,`-`),n=Math.max(0,Ke.findIndex(e=>t.includes(e.key)||e.key.includes(t)));return`<div class="pipeline">${Ke.map((e,t)=>`<article class="${t<=n?`done`:``} ${t===n?`current`:``}"><span>${t+1}</span><strong>${e.label}</strong><p>${e.help}</p></article>`).join(``)}</div>`}function bn(){return`
    <div class="empty-state">
      ${V(`briefcase-business`)}
      <strong>No active pipeline yet</strong>
      <p>Browse current openings and apply when you find a role that fits. Nearwork will show a pipeline here after an application moves forward.</p>
      <div class="empty-actions">
        <button class="primary-action fit" type="button" data-page="matches">${V(`sparkles`)} View matches</button>
        <a class="secondary-action" href="https://jobs.nearwork.co" target="_blank" rel="noreferrer">${V(`external-link`)} Open jobs</a>
      </div>
    </div>
  `}function xn(e,t,n){return`<article class="metric"><span>${V(n)}</span><p>${e}</p><strong>${t}</strong></article>`}function Sn(){try{return new Set(JSON.parse(localStorage.getItem(`nw_talent_applied`)||`[]`))}catch{return new Set}}function Cn(e){let t=X(e),n=new Set(L.applications.map(e=>e.jobId||e.openingCode)).has(t.code)||Sn().has(t.code),r=it(t),i=`https://jobs.nearwork.co/apply?code=${encodeURIComponent(t.code)}`;return`
    <article class="job-card">
      <div>
        ${r.length>=3?`<div class="match-pill">${r.length} skill match</div>`:t.match?`<div class="match-pill">${t.match}% match</div>`:``}
        <h3><a href="${i}" target="_blank" rel="noreferrer" style="color:inherit;text-decoration:none;" onmouseover="this.style.textDecoration='underline'" onmouseout="this.style.textDecoration='none'">${t.title}</a></h3>
        <p>${t.location}</p>
      </div>
      <p class="job-description">${t.description}</p>
      <div class="skill-row">${t.skills.slice(0,4).map(e=>`<span>${e}</span>`).join(``)}</div>
      ${r.length>=3?`<p class="field-hint">Matched skills: ${r.slice(0,5).map(W).join(`, `)}</p>`:``}
      <div class="job-footer">
        <strong>${t.compensation}</strong>
        <div style="display:flex;gap:8px;align-items:center;">
          <a href="${i}" target="_blank" rel="noreferrer" class="secondary-action" style="text-decoration:none;font-size:12px;opacity:0.75;">View opening ↗</a>
          <button class="secondary-action" type="button" data-apply="${t.code}" ${n?`disabled`:``}>${n?`Applied ✓`:`Apply`}</button>
        </div>
      </div>
    </article>
  `}function wn(e){return`<article class="timeline-item"><span>${V(`circle-dot`)}</span><div><strong>${e.jobTitle||e.title||`Application`}</strong><p>${e.clientName||e.company||`Nearwork`} · ${e.status||`submitted`}</p><small>${rt(e.updatedAt||e.createdAt)}</small></div></article>`}function Tn(e=!1){let t=L.candidate?.recruiter||{},n=t.email||`support@nearwork.co`,r=t.whatsapp||ze,i=t.whatsappUrl||Be;return`<article class="recruiter-card"><div class="avatar recruiter-avatar">NW</div><div><strong>${t.name||`Nearwork Support`}</strong><p><a href="mailto:${n}">${n}</a></p><p><a href="${i}" target="_blank" rel="noreferrer">WhatsApp ${r}</a></p>${e?`<span>Questions about assessments, interviews, feedback, or CV selection should go here.</span>`:``}</div></article>`}function En(e,t){return`<div class="empty-state">${V(`inbox`)}<strong>${e}</strong><p>${t}</p></div>`}function Dn(){Re.innerHTML=`<main class="loading-screen"><span class="logo-mark">N</span><p>Loading Talent...</p></main>`}function On(){document.querySelector(`#signOut`)?.addEventListener(`click`,async()=>{await c(C),R&&R(),R=null,window.history.pushState({page:`overview`},``,`/`),H({user:null,candidate:null,applications:[],assessments:[],jobs:[],view:`login`,activePage:`overview`,message:``})}),document.querySelector(`#signIn`)?.addEventListener(`click`,()=>{window.history.pushState({page:`overview`},``,`/`),H({view:`login`,activePage:`overview`,message:``})}),document.querySelectorAll(`[data-page]`).forEach(e=>{e.addEventListener(`click`,e=>{$e((e.currentTarget.closest(`[data-page]`)||e.currentTarget).dataset.page)})}),document.querySelector(`[data-dashboard-home]`)?.addEventListener(`click`,()=>$e(`overview`)),document.querySelector(`#notificationBell`)?.addEventListener(`click`,()=>{H({notificationPanelOpen:!L.notificationPanelOpen,notificationSettingsOpen:!1})}),document.querySelector(`#notificationSettings`)?.addEventListener(`click`,()=>{H({notificationSettingsOpen:!L.notificationSettingsOpen,notificationPanelOpen:!1})}),document.querySelectorAll(`[data-notification-read]`).forEach(e=>{e.addEventListener(`click`,async()=>{let t=e.dataset.notificationRead;L.user&&x&&await Pe(t).catch(()=>null),H({notifications:L.notifications.map(e=>e.id===t?{...e,read:!0}:e)})})}),document.querySelectorAll(`[data-notification-pref]`).forEach(e=>{e.addEventListener(`change`,async()=>{let t=structuredClone(L.candidate?.notificationPreferences||{}),n=e.dataset.notificationPref,r=e.dataset.channel;t[n]={...t[n]||{},[r]:e.checked},H({candidate:{...L.candidate,notificationPreferences:t}}),L.user&&x&&await Fe(L.user.uid,t).catch(()=>null)})}),document.querySelectorAll(`[data-assessment-jump]`).forEach(e=>{e.addEventListener(`click`,async()=>{let t=z()||(L.assessments||[])[0]?.id,n=(L.assessments||[]).find(e=>e.id===t),r=Number(e.dataset.assessmentJump||0),i=n?.questions?.[r];!t||!i||(await O(t,`__progress__`,``,{currentQuestionIndex:r,totalQuestions:n?.questions?.length||70,currentStage:i.stage||1}),B(t,r),H({assessments:(L.assessments||[]).map(e=>e.id===t?{...e,currentQuestionIndex:r,currentStage:i.stage||1}:e),activePage:`assessment`,message:``}))})}),document.querySelector(`#availability`).addEventListener(`change`,async e=>{let t=e.target.value;H({candidate:{...L.candidate,availability:t}}),L.user&&x?await Oe(L.user.uid,t):H({message:`Sign in with Google to save availability.`})}),document.querySelector(`#filterMatches`)?.addEventListener(`click`,()=>{let e=G().length>=3;H({matchesFiltered:e?!L.matchesFiltered:!1,message:e?``:`Add at least 3 skills in Profile first, then filter matching openings.`})}),document.querySelector(`#departmentSelect`)?.addEventListener(`change`,e=>{let t=document.querySelector(`#citySelect`);t.innerHTML=(I[e.target.value]||[]).map(e=>`<option value="${U(e)}">${e}</option>`).join(``)}),document.querySelector(`#roleGroupSelect`)?.addEventListener(`change`,e=>{let t=document.querySelector(`#targetRoleSelect`);t.innerHTML=gt(e.target.value,``)}),document.querySelector(`#salaryCurrencyInput`)?.addEventListener(`change`,e=>{let t=document.querySelector(`#salaryInput`);if(!t)return;let n=bt(t.value,e.target.value);e.target.value=n,t.placeholder=n===`COP`?`5,000,000`:`2,500`,t.value=xt(t.value,n)}),document.querySelector(`#salaryInput`)?.addEventListener(`blur`,e=>{let t=document.querySelector(`#salaryCurrencyInput`),n=bt(e.target.value,t?.value||`USD`);t&&(t.value=n),e.target.placeholder=n===`COP`?`5,000,000`:`2,500`,e.target.value=xt(e.target.value,n)}),Rt(),Rn(),Nn(),kn(),jn(),document.querySelectorAll(`[data-apply]`).forEach(e=>{e.addEventListener(`click`,async()=>{let t=L.jobs.map(X).find(t=>t.code===e.dataset.apply),n=e.dataset.apply;if(e.disabled=!0,e.textContent=`Submitted`,L.user&&x){try{let e=Sn();e.add(n),localStorage.setItem(`nw_talent_applied`,JSON.stringify([...e]))}catch{}await De(L.user.uid,t),await Tt(L.user),$e(`applications`)}else H({message:`Sign in with Google to apply to this opening.`})})}),document.querySelector(`#showTechIntro`)?.addEventListener(`click`,()=>{H({assessmentUiStep:`techIntro`,message:``})}),document.querySelector(`#backToWelcome`)?.addEventListener(`click`,()=>{H({assessmentUiStep:null,message:``})}),document.querySelector(`#startDiscAssessment`)?.addEventListener(`click`,async()=>{let e=z()||(L.assessments||[])[0]?.id,t=(L.assessments||[]).find(t=>t.id===e);if(!e||!t)return;let n=t.questions||[],r=document.querySelector(`#startDiscAssessment`),i=r?Number(r.dataset.discIndex||50):n.findIndex(e=>Number(e.stage||1)===2),a=i>=0?i:50,o=new Date().toISOString();try{await O(e,`__progress__`,``,{currentQuestionIndex:a,totalQuestions:n.length,currentStage:2,discStartedAt:o}),B(e,a),H({assessments:(L.assessments||[]).map(t=>t.id===e?{...t,currentQuestionIndex:a,currentStage:2,discStartedAt:o}:t),activePage:`assessment`,assessmentUiStep:null,message:``})}catch(e){H({message:Z(e)})}}),document.querySelector(`#startAssessment`)?.addEventListener(`click`,async()=>{let e=z()||(L.assessments||[])[0]?.id,t=(L.assessments||[]).find(t=>t.id===e)||(L.assessments||[])[0];if(!e||!L.user){H({message:`Please log in to start your assessment.`});return}try{await we(e,L.user.uid),B(e,Number(t?.currentQuestionIndex||0),!0),H({assessments:(L.assessments||[]).map(t=>t.id===e?{...t,status:`started`,startedAt:t.startedAt||new Date().toISOString(),technicalStartedAt:t.technicalStartedAt||new Date().toISOString()}:t),activePage:`assessment`,assessmentUiStep:null,message:``})}catch(e){H({message:Z(e)})}}),document.querySelector(`#prevAssessmentQuestion`)?.addEventListener(`click`,async()=>{let e=z()||(L.assessments||[])[0]?.id,t=(L.assessments||[]).find(t=>t.id===e),n=Number(document.querySelector(`#assessmentQuestionForm`)?.dataset.currentIndex??t?.currentQuestionIndex??0),r=Math.max(0,n-1),i=t?.questions?.[r];await O(e,`__progress__`,``,{currentQuestionIndex:r,totalQuestions:t?.questions?.length||70,currentStage:i?.stage||1}),B(e,r),H({assessments:(L.assessments||[]).map(t=>t.id===e?{...t,currentQuestionIndex:r,currentStage:i?.stage||1}:t),activePage:`assessment`,message:``})}),document.querySelector(`#assessmentQuestionForm`)?.addEventListener(`submit`,async e=>{e.preventDefault();let t=z()||(L.assessments||[])[0]?.id,n=(L.assessments||[]).find(e=>e.id===t),r=n?.questions||[],i=Number(e.currentTarget.dataset.currentIndex??n?.currentQuestionIndex??0),a=r[i],o=new FormData(e.currentTarget).get(`answer`);if(!a){H({message:`This question could not be loaded. Please refresh and try again.`});return}let s=o===null?{value:``,skipped:!0,answeredAt:new Date().toISOString()}:{value:Number(o),skipped:!1,answeredAt:new Date().toISOString()},c={...n.answers||{},[a.id]:s},l=r[i+1],u=l&&Number(l.stage||1)!==Number(a.stage||1),d=ut(n,a.stage,c);try{if((u||i+1>=r.length)&&d.length){await O(t,a.id,c[a.id],{currentQuestionIndex:i,totalQuestions:r.length,currentStage:a.stage||1}),H({assessments:(L.assessments||[]).map(e=>e.id===t?{...e,answers:c,currentQuestionIndex:i,currentStage:a.stage||1,progress:`${i+1}/${r.length}`}:e),activePage:`assessment`,message:`You missed ${d.length} question${d.length===1?``:`s`} in the ${ct(a.stage)}.`});return}if(i+1>=r.length){let e=sn(n,c),i=cn(n,c);await Te(t,c,{totalQuestions:r.length,technicalScore:e.technicalScore,discScore:e.discScore,score:Math.round(e.technicalScore*.75+e.discScore*.25),discProfile:i}),fetch(`https://admin.nearwork.co/api/generate-assessment-insights`,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify({assessmentId:t})}).catch(()=>null),ln(n,{score:Math.round(e.technicalScore*.75+e.discScore*.25),technicalScore:e.technicalScore,discScore:e.discScore,discProfile:i}).catch(e=>console.warn(e)),H({assessments:(L.assessments||[]).map(n=>n.id===t?{...n,answers:c,status:`completed`,score:Math.round(e.technicalScore*.75+e.discScore*.25),technical:e.technicalScore,disc:i.label,discProfile:i,progress:`${r.length}/${r.length}`}:n),activePage:`assessment`,message:``})}else{let e=a.stage===1&&l?.stage===2&&!n.discStartedAt;await O(t,a.id,c[a.id],{currentQuestionIndex:i+1,totalQuestions:r.length,currentStage:l?.stage||a.stage||1}),B(t,i+1),H({assessments:(L.assessments||[]).map(e=>e.id===t?{...e,answers:c,currentQuestionIndex:i+1,currentStage:l?.stage||a.stage||1,progress:`${i+1}/${r.length}`}:e),activePage:`assessment`,message:``,assessmentUiStep:e?`discIntro`:null})}}catch(e){H({message:Z(e)})}}),document.querySelector(`#profileForm`)?.addEventListener(`submit`,async e=>{e.preventDefault();let t=new FormData(e.currentTarget),n=t.get(`department`),r=t.get(`city`),i=vt(t.get(`salary`),t.get(`salaryCurrency`)),a={name:t.get(`name`),targetRole:t.get(`targetRole`),headline:t.get(`targetRole`),department:n,city:r,locationId:`${String(r).toLowerCase().normalize(`NFD`).replace(/[\u0300-\u036f]/g,``).replace(/[^a-z0-9]+/g,`-`)}-co`,location:`${r}, ${n}`,locationCity:r,locationDepartment:n,locationCountry:`Colombia`,english:t.get(`english`),salary:i.salary,salaryUSD:i.salaryUSD,salaryAmount:i.salaryAmount,salaryCurrency:i.salaryCurrency,expectedSalaryAmount:i.salaryAmount,expectedSalaryCurrency:i.salaryCurrency,linkedin:t.get(`linkedin`),whatsapp:t.get(`whatsapp`),phone:t.get(`whatsapp`),skills:[...new Set(t.getAll(`skills`).map(Y).filter(Boolean))],otherSkills:[],languages:(t.get(`languages`)||``).split(`,`).map(e=>e.trim()).filter(Boolean),summary:t.get(`summary`),email:L.candidate?.email||L.user?.email||``,availability:L.candidate?.availability||`open`,onboarded:!0};if(!L.user){H({candidate:{...L.candidate,...a},message:`Preview updated. Sign in with Google to save this profile.`});return}try{let e=t.get(`photo`),n=L.candidate?.photoURL||L.user?.photoURL||``;e?.name&&(n=await je(L.user.uid,e));let r=t.get(`profileCv`),i=null,o=!1;if(r?.name)try{i=await Me(L.user.uid,r,t.get(`profileCvLabel`))}catch{o=!0}let s={...a,photoURL:n,candidateCode:L.candidate?.candidateCode,marketingConsent:L.candidate?.marketingConsent===!0,...i?{activeCvId:i.id,activeCvName:i.name||i.fileName,cvUrl:i.url,cvLibrary:[...L.candidate?.cvLibrary||[],i]}:{},workHistory:(()=>{let e=An();return e.length?e:k?.workHistory?.length&&(A||!L.candidate?.workHistory?.length)?k.workHistory:L.candidate?.workHistory||[]})(),certifications:(()=>{let e=Mn();return e.length?e:k?.certifications?.length&&(A||!L.candidate?.certifications?.length)?k.certifications:L.candidate?.certifications||[]})()};k=null,A=!1;let c=await ke(L.user.uid,s),l=o?`Profile saved, but the CV failed to upload. Try uploading it again from the CV section.`:c?.atsSynced===!1?`Profile saved. Nearwork will finish connecting it to your workspace.`:`Profile saved.`;t.get(`mode`)===`onboarding`?(window.history.pushState({page:`overview`},``,`/`),H({candidate:{...L.candidate,...s},activePage:`overview`,message:`Profile complete. Welcome to Talent.`})):H({candidate:{...L.candidate,...s},message:l})}catch(e){H({message:Z(e)})}}),document.querySelector(`#cvForm`)?.addEventListener(`submit`,async e=>{e.preventDefault();let t=new FormData(e.currentTarget),n=t.get(`cv`);if(n?.name){if(!L.user){H({message:`Sign in with Google to upload and store CVs.`});return}try{let e=await Me(L.user.uid,n,t.get(`label`));H({candidate:{...L.candidate,cvLibrary:[...L.candidate?.cvLibrary||[],e],activeCvId:e.id},message:`CV uploaded.`})}catch(e){H({message:Z(e)})}}})}function kn(){let e=document.querySelector(`#workHistoryCard`);if(!e)return;let t=e.querySelectorAll(`.work-entry`).length;e.addEventListener(`click`,e=>{let n=e.target.closest(`.remove-work-entry`);if(n){n.closest(`.work-entry`)?.remove();return}if(e.target.closest(`#addWorkEntry`)){let e=document.querySelector(`#workEntries`);if(!e)return;let n=document.createElement(`div`);n.innerHTML=mn(t++,{}),e.appendChild(n.firstElementChild)}})}function An(){return[...document.querySelectorAll(`.work-entry`)].map(e=>{let t=t=>e.querySelector(`[data-field="${t}"]`)?.value?.trim()||``;return{title:t(`title`),company:t(`company`),from:t(`from`),to:t(`to`)}}).filter(e=>e.title||e.company)}function jn(){let e=document.querySelector(`#certCard`);if(!e)return;let t=e.querySelectorAll(`.cert-entry`).length;e.addEventListener(`click`,e=>{let n=e.target.closest(`.remove-cert-entry`);if(n){n.closest(`.cert-entry`)?.remove();return}if(e.target.closest(`#addCertEntry`)){let e=document.querySelector(`#certEntries`);if(!e)return;let n=document.createElement(`div`);n.innerHTML=hn(t++,{}),e.appendChild(n.firstElementChild)}})}function Mn(){return[...document.querySelectorAll(`.cert-entry`)].map(e=>{let t=t=>e.querySelector(`[data-field="${t}"]`)?.value?.trim()||``;return{name:t(`name`),issuer:t(`issuer`),date:t(`date`)}}).filter(e=>e.name)}function Nn(){let e=document.querySelector(`#profileForm`),t=e?.querySelector(`input[name="profileCv"]`);!e||!t||(e.querySelector(`input[name="mode"]`)?.value===`onboarding`&&!L.candidate?.skills?.length&&!L.candidate?.workHistory?.length&&!L.candidate?.name?Pn(e,t):Fn(t))}function Pn(e,t){let n=document.querySelector(`#profileCvCard`);if(!n)return;let r=[...e.children].filter(e=>e!==n&&e.type!==`hidden`&&e.getAttribute(`name`)!==`mode`);r.forEach(e=>{e.style.display=`none`});let i=document.createElement(`p`);i.id=`cvGatePrompt`,i.style.cssText=`font-size:13px;color:var(--mid);margin:10px 0 4px;text-align:center;`,i.innerHTML=`Upload your CV and we'll fill in the rest for you — or <button type="button" id="skipCvParse" style="background:none;border:none;padding:0;font-size:13px;color:var(--green);cursor:pointer;text-decoration:underline;">skip and fill in manually</button>`,n.insertAdjacentElement(`afterend`,i);function a(){document.querySelector(`#cvGatePrompt`)?.remove(),document.querySelector(`#cvParseLoading`)?.remove(),r.forEach(e=>{e.style.display=``})}document.querySelector(`#skipCvParse`)?.addEventListener(`click`,a),t.addEventListener(`change`,async()=>{let e=t.files?.[0];if(!e)return;document.querySelector(`#cvGatePrompt`)?.remove();let r=document.createElement(`p`);r.id=`cvParseLoading`,r.style.cssText=`font-size:13px;font-weight:600;color:var(--green);padding:14px 0;text-align:center;`,r.textContent=`Analysing your CV…`,n.insertAdjacentElement(`afterend`,r),k=null,A=!0;let i=await Ie(e);a(),i&&(k=i,In(i,!0),Ln(i,t))})}function Fn(e){e.addEventListener(`change`,()=>{let t=e.files?.[0];if(!t)return;k=null,A=!1,document.querySelector(`#cvRewriteWrap`)?.remove(),document.querySelector(`#cvParseHint`)?.remove();let n=Ie(t),r=document.createElement(`div`);r.id=`cvRewriteWrap`,r.style.cssText=`margin-top:8px;`,r.innerHTML=`<label style="display:flex;align-items:center;gap:6px;cursor:pointer;font-size:12px;color:var(--mid);"><input type="checkbox" id="cvRewriteCheck" style="accent-color:var(--green);width:14px;height:14px;" /> Update my profile information from this CV</label>`,e.insertAdjacentElement(`afterend`,r),document.querySelector(`#cvRewriteCheck`).addEventListener(`change`,async t=>{if(document.querySelector(`#cvParseHint`)?.remove(),!t.target.checked){k=null,A=!1;return}let i=document.createElement(`p`);i.id=`cvParseHint`,i.style.cssText=`font-size:12px;color:var(--green);margin:4px 0 0;`,i.textContent=`Analysing your CV…`,r.insertAdjacentElement(`afterend`,i);let a=await n;if(!a){i.textContent=`Could not extract data from this CV. The file will still be saved.`;return}k=a,A=!0,In(a,!0),Ln(a,e)})})}function In(e,t){let n=(e,n)=>{let r=document.querySelector(e);r&&n&&(t||!r.value?.trim())&&(r.value=n)};if(n(`input[name="name"]`,e.name),n(`input[name="whatsapp"]`,e.phone),n(`textarea[name="summary"]`,e.summary),e.skills?.length){let n=document.querySelector(`#selectedSkills`);if(n){t&&(n.innerHTML=``);let r=new Set([...n.querySelectorAll(`input[name="skills"]`)].map(e=>e.value.toLowerCase()));n.querySelector(`.skill-empty`)?.remove(),[...new Set(e.skills.map(Y).filter(Boolean))].forEach(e=>{if(r.has(e.toLowerCase()))return;r.add(e.toLowerCase());let t=document.createElement(`span`);t.className=`selected-skill`,t.setAttribute(`data-skill-chip`,e),t.innerHTML=`${W(e)}<button type="button" class="skill-remove" data-remove-skill="${U(e)}" aria-label="Remove ${U(e)}">×</button><input type="hidden" name="skills" value="${U(e)}" />`,n.appendChild(t)})}}if(e.workHistory?.length){let n=document.querySelector(`#workEntries`);if(n){t&&(n.innerHTML=``);let r=n.querySelectorAll(`.work-entry`).length;e.workHistory.forEach(e=>{let t=document.createElement(`div`);t.innerHTML=mn(r++,e),n.appendChild(t.firstElementChild)})}}if(e.languages?.length){let n=document.querySelector(`input[name="languages"]`);n&&(t||!n.value?.trim())&&(n.value=e.languages.join(`, `))}if(e.certifications?.length){let n=document.querySelector(`#certEntries`);if(n){t&&(n.innerHTML=``);let r=n.querySelectorAll(`.cert-entry`).length;e.certifications.forEach(e=>{let t=document.createElement(`div`);t.innerHTML=hn(r++,e),n.appendChild(t.firstElementChild)})}}}function Ln(e,t){let n=[];e.name&&n.push(`name`),e.phone&&n.push(`phone`),e.skills?.length&&n.push(`${e.skills.length} skill${e.skills.length>1?`s`:``}`),e.workHistory?.length&&n.push(`${e.workHistory.length} role${e.workHistory.length>1?`s`:``}`),e.certifications?.length&&n.push(`${e.certifications.length} cert${e.certifications.length>1?`s`:``}`),e.languages?.length&&n.push(`languages`),document.querySelector(`#cvParseHint`)?.remove();let r=document.createElement(`p`);r.id=`cvParseHint`,r.style.cssText=`font-size:12px;color:var(--green);margin:4px 0 0;`,r.innerHTML=n.length?`✓ Pre-filled: <strong>${n.join(`, `)}</strong>. Review and save.`:`✓ CV analysed. Review your profile and save.`,t.insertAdjacentElement(`afterend`,r)}function Rn(){let e=document.querySelector(`[data-skill-search]`);if(!e)return;let t=e.querySelector(`#skillSearchInput`),n=e.querySelector(`#skillSuggestions`),r=e.querySelector(`#selectedSkills`),i=()=>[...r.querySelectorAll(`input[name="skills"]`)].map(e=>e.value),a=e=>{r.innerHTML=e.length?e.map(e=>`
      <span class="selected-skill" data-skill-chip="${U(e)}">
        ${W(e)}
        <button type="button" class="skill-remove" data-remove-skill="${U(e)}" aria-label="Remove ${U(e)}">×</button>
        <input type="hidden" name="skills" value="${U(e)}" />
      </span>`).join(``):`<span class="skill-empty">Selected skills will appear here.</span>`},o=()=>{let e=K(t.value),r=new Set(i().map(K)),a=Ue.filter(e=>!r.has(K(e))).filter(t=>!e||K(t).includes(e)).slice(0,18);n.innerHTML=a.length?a.map(e=>`<button type="button" class="skill-suggestion" data-skill="${U(e)}">${W(e)}</button>`).join(``):`<button type="button" class="skill-suggestion add-custom" data-skill="${U(t.value)}">Add "${W(t.value)}"</button>`},s=e=>{let n=Y(e||t.value);if(!n)return;let r=K(n);a([...i().filter(e=>K(e)!==r),n]),t.value=``,o()};t?.addEventListener(`input`,o),t?.addEventListener(`focus`,o),t?.addEventListener(`keydown`,e=>{e.key===`Enter`&&(e.preventDefault(),s(n.querySelector(`.skill-suggestion`)?.dataset.skill||t.value))}),e.querySelector(`#addTypedSkill`)?.addEventListener(`click`,()=>s(t.value)),n.addEventListener(`click`,e=>{let t=e.target.closest(`[data-skill]`);t&&s(t.dataset.skill)}),r.addEventListener(`click`,e=>{let t=e.target.closest(`[data-remove-skill]`);if(!t)return;let n=K(t.dataset.removeSkill);a(i().filter(e=>K(e)!==n)),o()})}function zn(){if(L.loading)return Dn();if(L.view===`dashboard`)return Dt();wt()}window.addEventListener(`popstate`,()=>{let e=Ye();e===`overview`&&!L.user?H({view:`login`,activePage:`overview`,message:``}):L.view===`dashboard`?$e(e,!1):Et()}),x?(i(C,e=>{if(e)Tt(e);else{try{localStorage.removeItem(`nw_talent_applied`)}catch{}Et()}}),window.setTimeout(()=>{L.loading&&Et()},2500)):Et();