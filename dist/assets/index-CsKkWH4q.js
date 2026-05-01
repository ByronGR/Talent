import{initializeApp as He}from"https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";import{getAuth as We,GoogleAuthProvider as Ye,signInWithPopup as Je,onAuthStateChanged as Ke,sendPasswordResetEmail as Ze,createUserWithEmailAndPassword as Xe,updateProfile as et,signInWithEmailAndPassword as tt,signOut as at}from"https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";import{getFirestore as st,query as L,collection as R,where as I,limit as M,getDocs as x,orderBy as be,getDoc as Y,doc as k,serverTimestamp as C,setDoc as D,updateDoc as nt,addDoc as Se,arrayUnion as oe}from"https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";import{getStorage as it,ref as Ne,uploadBytes as De,getDownloadURL as Te}from"https://www.gstatic.com/firebasejs/10.12.5/firebase-storage.js";(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))s(i);new MutationObserver(i=>{for(const o of i)if(o.type==="childList")for(const l of o.addedNodes)l.tagName==="LINK"&&l.rel==="modulepreload"&&s(l)}).observe(document,{childList:!0,subtree:!0});function a(i){const o={};return i.integrity&&(o.integrity=i.integrity),i.referrerPolicy&&(o.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?o.credentials="include":i.crossOrigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function s(i){if(i.ep)return;i.ep=!0;const o=a(i);fetch(i.href,o)}})();const Re={apiKey:"AIzaSyApRNyW8PoP28E0x77dUB5jOgHuTqA2by4",authDomain:"nearwork-97e3c.firebaseapp.com",projectId:"nearwork-97e3c",storageBucket:"nearwork-97e3c.firebasestorage.app",messagingSenderId:"145642656516",appId:"1:145642656516:web:0ac2da8931283121e87651",measurementId:"G-3LC8N6FFSH"},_=Object.values(Re).slice(0,6).every(Boolean),O=_?He(Re):null,U=O?We(O):null,f=O?st(O):null,ce=O?it(O):null,ot=O?new Ye:null,v={users:"users",candidates:"candidates",openings:"openings",pipelines:"pipelines",applications:"applications",assessments:"assessments",activity:"candidateActivity"};function P(){if(!O||!U||!f||!ce)throw new Error("Missing Firebase environment variables. Copy .env.example to .env.local and fill in the Admin app config.")}async function Ee(e){P();const t=await Y(k(f,v.users,e));return t.exists()?{id:t.id,...t.data()}:null}async function rt(e){P();const t=String(e||"").trim(),a=t.toLowerCase(),s=L(R(f,v.users),I("email","==",a),M(1)),i=await x(s);if(!i.empty)return{id:i.docs[0].id,...i.docs[0].data()};if(t===a)return null;const o=L(R(f,v.users),I("email","==",t),M(1)),l=await x(o);return l.empty?null:{id:l.docs[0].id,...l.docs[0].data()}}async function Le(e){const t=await Ee(e.uid);if(t)return t;const a=await rt(e.email);return a?(await de(e.uid,{...a,email:e.email,connectedFromUserId:a.id}),{...a,id:e.uid,connectedFromUserId:a.id}):null}async function de(e,t){P();const a={...t,role:"candidate",updatedAt:C()};await D(k(f,v.users,e),a,{merge:!0})}function te(e){return`CAND-${String(e||"").replace(/[^a-z0-9]/gi,"").slice(0,8).toUpperCase()||Date.now()}`}function lt(e){return String(e||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"")}function pe(e,t){const a=t.candidateCode||te(e),s=t.location||[t.locationCity||t.city,t.locationDepartment||t.department].filter(Boolean).join(", "),i=new Date().toISOString().slice(0,10);return{code:a,uid:e,ownerUid:e,name:t.name||"Talent member",role:t.targetRole||t.headline||"Nearwork candidate",skills:Array.isArray(t.skills)?t.skills:[],applied:t.applied||i,lastContact:t.lastContact||i,experience:Number(t.experience||0),location:s,city:lt(t.locationCity||t.city||s),department:t.locationDepartment||t.department||"",country:t.locationCountry||"Colombia",source:"talent.nearwork.co",status:t.status||"active",score:Number(t.score||50),email:t.email||"",phone:t.whatsapp||t.phone||"",whatsapp:t.whatsapp||t.phone||"",salary:t.salary||"",salaryUSD:Number(t.salaryUSD||0)||null,availability:t.availability||"open",english:t.english||"",visa:t.visa||"No",linkedin:t.linkedin||"",cv:t.activeCvName||"",tags:t.tags||["talent profile"],notes:t.summary||"",appliedBefore:!!t.appliedBefore,applications:t.applications||[],pipelineCodes:t.pipelineCodes||[],loom:t.loom||"Not uploaded",assessments:t.assessments||[],work:t.work||[],updatedAt:C()}}async function ct(){P();const e=await Je(U,ot),t=await Le(e.user),a={email:e.user.email,name:e.user.displayName||"",availability:"open",onboarded:!1};t||await de(e.user.uid,a);const s=te(e.user.uid),i={...t||a,candidateCode:s};return await D(k(f,v.candidates,s),pe(e.user.uid,i),{merge:!0}).catch(()=>null),e.user}async function dt(e){P();const t=L(R(f,v.applications),I("candidateId","==",e),be("updatedAt","desc"),M(20)),a=L(R(f,v.applications),I("ownerUid","==",e),be("updatedAt","desc"),M(20)),s=await Promise.allSettled([x(t),x(a)]),i=new Map;return s.forEach(o=>{o.status==="fulfilled"&&o.value.docs.forEach(l=>i.set(l.id,{id:l.id,...l.data()}))}),Array.from(i.values()).sort((o,l)=>{const d=u=>{var m,h;return((h=(m=u==null?void 0:u.toDate)==null?void 0:m.call(u))==null?void 0:h.getTime())??(u?new Date(u).getTime():0)};return d(l.updatedAt||l.createdAt)-d(o.updatedAt||o.createdAt)})}async function pt(e,t=""){P();const a=String(t||"").trim().toLowerCase(),s=[x(L(R(f,v.assessments),I("candidateUid","==",e),M(25))),x(L(R(f,v.assessments),I("candidateId","==",e),M(25)))];a&&s.push(x(L(R(f,v.assessments),I("candidateEmail","==",a),M(25))));const i=await Promise.allSettled(s),o=new Map;return i.forEach(l=>{l.status==="fulfilled"&&l.value.docs.forEach(d=>o.set(d.id,{id:d.id,...d.data()}))}),Array.from(o.values()).sort((l,d)=>{const u=m=>{var h,c;return((c=(h=m==null?void 0:m.toDate)==null?void 0:h.call(m))==null?void 0:c.getTime())??(m?new Date(m).getTime():0)};return u(d.updatedAt||d.createdAt||d.sentAt)-u(l.updatedAt||l.createdAt||l.sentAt)})}async function ut(e,t,a=""){P();const s=await Y(k(f,v.assessments,e));if(!s.exists())return null;const i={id:s.id,...s.data()},o=String(a||"").trim().toLowerCase();return i.candidateUid===t||i.candidateId===t||String(i.candidateEmail||"").trim().toLowerCase()===o?i:null}async function mt(e,t){P();const a=await Y(k(f,v.assessments,e)),s=a.exists()?a.data():{};if(s.status==="completed")throw new Error("This assessment is already completed.");if(s.expiresAt&&Date.now()>new Date(s.expiresAt).getTime())throw new Error("This assessment link has expired.");await D(k(f,v.assessments,e),{status:"started",currentQuestionIndex:Number(s.currentQuestionIndex||0),currentStage:Number(s.currentStage||1),technicalStartedAt:s.technicalStartedAt||C(),startedAt:s.startedAt||C(),updatedAt:C()},{merge:!0})}async function $e(e,t,a,s={}){P();const i=await Y(k(f,v.assessments,e)),o=i.exists()?i.data():{};if(o.status==="completed")throw new Error("This assessment is already completed.");if(o.expiresAt&&Date.now()>new Date(o.expiresAt).getTime())throw new Error("This assessment link has expired.");await D(k(f,v.assessments,e),{[`answers.${t}`]:a,progress:`${s.currentQuestionIndex||0}/${s.totalQuestions||""}`.replace(/\/$/,""),currentQuestionIndex:s.currentQuestionIndex||0,currentStage:s.currentStage||1,updatedAt:C()},{merge:!0})}async function gt(e,t,a={}){P();const s=k(f,v.assessments,e),i=await Y(s),o=i.exists()?i.data():{};if(o.status==="completed")throw new Error("This assessment is already completed.");if(o.expiresAt&&Date.now()>new Date(o.expiresAt).getTime())throw new Error("This assessment link has expired.");const l=Object.values(t||{}).filter(r=>String((r==null?void 0:r.value)??r??"").trim()).length,d=Number(a.totalQuestions||Object.keys(t||{}).length||0),u=Number(a.technicalScore||0),m=Number(a.discScore||0),h=Number(a.score||(d?Math.round(l/d*100):0));await D(s,{answers:t,answeredCount:l,totalQuestions:d,score:h,technical:u||h,disc:m?`${m}%`:"Submitted",progress:`${l}/${d}`,status:"completed",finished:new Date().toLocaleString("en-US",{month:"short",day:"numeric",year:"numeric",hour:"numeric",minute:"2-digit"}),finishedAt:C(),updatedAt:C()},{merge:!0});const c=Math.round(h);o.candidateUid&&await D(k(f,v.users,o.candidateUid),{score:c,nwScore:c,lastAssessmentScore:c,lastAssessmentId:e,updatedAt:C()},{merge:!0}).catch(()=>null),o.candidateCode&&await D(k(f,v.candidates,o.candidateCode),{score:c,nwScore:c,lastAssessmentScore:c,lastAssessmentId:e,updatedAt:C()},{merge:!0}).catch(()=>null)}async function Ie(){P();const e=L(R(f,v.openings),I("published","==",!0),M(12));return(await x(e)).docs.map(a=>({id:a.id,...a.data()}))}async function ht(e,t){P();const a=t.code||t.id,s=await Ee(e).catch(()=>null),i={candidateId:e,candidateCode:(s==null?void 0:s.candidateCode)||te(e),candidateEmail:(s==null?void 0:s.email)||"",candidateName:(s==null?void 0:s.name)||"",openingCode:a,jobId:a,jobTitle:t.title||t.role||"Untitled role",clientName:t.orgName||t.clientName||t.company||"Nearwork client",status:"submitted",source:"talent.nearwork.co",createdAt:C(),updatedAt:C()};await Se(R(f,v.applications),i),await D(k(f,v.candidates,i.candidateCode),{...pe(e,{...s||{},candidateCode:i.candidateCode,applications:oe(a),appliedBefore:!0,lastContact:new Date().toISOString().slice(0,10)}),applications:oe(a),appliedBefore:!0},{merge:!0}).catch(()=>null),await Se(R(f,v.activity),{candidateId:e,type:"application_submitted",title:i.jobTitle,createdAt:C()}).catch(()=>null)}async function ft(e,t){await nt(k(f,v.users,e),{availability:t,updatedAt:C()})}async function vt(e,t){P();const a=t.candidateCode||te(e);await D(k(f,v.users,e),{...t,candidateCode:a,role:"candidate",updatedAt:C()},{merge:!0});try{return await D(k(f,v.candidates,a),pe(e,{...t,candidateCode:a}),{merge:!0}),{candidateCode:a,atsSynced:!0}}catch(s){return console.warn("Candidate ATS sync failed.",s),{candidateCode:a,atsSynced:!1}}}async function yt(e,t){P();const a=t.name.replace(/[^a-z0-9._-]/gi,"-").toLowerCase(),s=`candidate-photos/${e}/${Date.now()}-${a}`,i=Ne(ce,s);await De(i,t,{contentType:t.type||"application/octet-stream"});const o=await Te(i);return await D(k(f,v.users,e),{photoURL:o,updatedAt:C()},{merge:!0}),o}async function Ce(e,t,a){P();const s=t.name.replace(/[^a-z0-9._-]/gi,"-").toLowerCase(),i=`candidate-cvs/${e}/${Date.now()}-${s}`,o=Ne(ce,i);await De(o,t,{contentType:t.type||"application/octet-stream"});const l=await Te(o),d={id:i,name:a||t.name,fileName:t.name,url:l,uploadedAt:new Date().toISOString()};return await D(k(f,v.users,e),{cvLibrary:oe(d),activeCvId:d.id,activeCvName:d.name||d.fileName,updatedAt:C()},{merge:!0}),d}const ue=document.querySelector("#app"),wt="+573135928691",bt="https://wa.me/573135928691",Z=[{id:"OPEN-CSM-DEMO",code:"OPEN-CSM-DEMO",title:"Customer Success Manager",orgName:"US SaaS company",location:"Remote, Colombia",compensation:"$2,000-$2,800/mo USD",match:94,skills:["SaaS","Customer Success","English C1","QBRs"],description:"Own onboarding, adoption, renewals, and expansion for a portfolio of US-based SaaS clients."},{id:"OPEN-SDR-DEMO",code:"OPEN-SDR-DEMO",title:"SDR / Sales Development Rep",orgName:"B2B marketplace",location:"Remote",compensation:"$1,700-$2,200/mo USD",match:89,skills:["HubSpot","Outbound","Salesforce","English C1"],description:"Qualify outbound leads, book demos, and work closely with a high-performing US sales team."},{id:"OPEN-SUP-DEMO",code:"OPEN-SUP-DEMO",title:"Technical Support Specialist",orgName:"Cloud workflow platform",location:"Remote, LatAm",compensation:"$1,400-$1,900/mo USD",match:86,skills:["Technical Support","APIs","Tickets","Troubleshooting"],description:"Handle Tier 1 and Tier 2 support, troubleshoot product issues, and maintain excellent CSAT."}],H={"Customer Success":["Customer Success Manager","Customer Success Associate","Account Manager","Implementation Specialist","Onboarding Specialist","Renewals Manager"],Sales:["SDR / Sales Development Rep","BDR / Business Development Rep","Account Executive","Sales Operations Specialist","Sales Manager"],Support:["Technical Support Specialist","Customer Support Representative","Support Team Lead","QA Support Analyst"],Operations:["Operations Manager","Operations Analyst","Executive Assistant","Virtual Assistant","Project Coordinator","Recruiting Coordinator"],Marketing:["Marketing Ops / Content Specialist","Content Writer","SEO Specialist","Lifecycle Marketing Specialist","Social Media Manager"],Engineering:["Software Developer (Full Stack)","Frontend Developer","Backend Developer","No-Code Developer","Data Analyst","QA Engineer"],Finance:["Bookkeeper","Accounting Assistant","Financial Analyst","Payroll Specialist"]},St={"CRM & Sales":["HubSpot","Salesforce","Pipedrive","Apollo","Outbound","Cold Email","Discovery Calls","CRM Hygiene"],"Customer Success":["SaaS","Customer Success","QBRs","Onboarding","Renewals","Expansion","Churn Reduction","Intercom","Zendesk"],Support:["Technical Support","Tickets","Troubleshooting","APIs","Bug Reproduction","Help Center","CSAT"],Operations:["Excel","Google Sheets","Reporting","Process Design","Project Management","Notion","Airtable","Zapier"],Marketing:["Content","SEO","Lifecycle","Email Marketing","HubSpot Marketing","Copywriting","Analytics"],Engineering:["JavaScript","React","Node.js","SQL","Python","REST APIs","QA","GitHub"],Language:["English B2","English C1","English C2","Spanish Native"]},W={Amazonas:["Leticia","Puerto Nariño"],Antioquia:["Medellín","Abejorral","Apartadó","Bello","Caldas","Caucasia","Copacabana","El Carmen de Viboral","Envigado","Girardota","Itagüí","La Ceja","La Estrella","Marinilla","Rionegro","Sabaneta","Santa Fe de Antioquia","Turbo"],Arauca:["Arauca","Arauquita","Saravena","Tame"],Atlántico:["Barranquilla","Baranoa","Galapa","Malambo","Puerto Colombia","Sabanalarga","Soledad"],"Bogotá D.C.":["Bogotá"],Bolívar:["Cartagena","Arjona","El Carmen de Bolívar","Magangué","Mompox","Turbaco"],Boyacá:["Tunja","Chiquinquirá","Duitama","Paipa","Sogamoso","Villa de Leyva"],Caldas:["Manizales","Aguadas","Chinchiná","La Dorada","Riosucio","Villamaría"],Caquetá:["Florencia","El Doncello","Puerto Rico","San Vicente del Caguán"],Casanare:["Yopal","Aguazul","Paz de Ariporo","Villanueva"],Cauca:["Popayán","El Tambo","Puerto Tejada","Santander de Quilichao"],Cesar:["Valledupar","Aguachica","Bosconia","Codazzi"],Chocó:["Quibdó","Istmina","Nuquí","Tadó"],Córdoba:["Montería","Cereté","Lorica","Sahagún"],Cundinamarca:["Chía","Cajicá","Facatativá","Fusagasugá","Girardot","Madrid","Mosquera","Soacha","Tocancipá","Zipaquirá"],Guainía:["Inírida"],Guaviare:["San José del Guaviare","Calamar","El Retorno","Miraflores"],Huila:["Neiva","Garzón","La Plata","Pitalito"],"La Guajira":["Riohacha","Maicao","San Juan del Cesar","Uribia"],Magdalena:["Santa Marta","Ciénaga","El Banco","Fundación"],Meta:["Villavicencio","Acacías","Granada","Puerto López"],Nariño:["Pasto","Ipiales","Tumaco","Túquerres"],"Norte de Santander":["Cúcuta","Ocaña","Pamplona","Villa del Rosario"],Putumayo:["Mocoa","Orito","Puerto Asís","Valle del Guamuez"],Quindío:["Armenia","Calarcá","La Tebaida","Montenegro","Quimbaya"],Risaralda:["Pereira","Dosquebradas","La Virginia","Santa Rosa de Cabal"],"San Andrés y Providencia":["San Andrés","Providencia"],Santander:["Bucaramanga","Barrancabermeja","Floridablanca","Girón","Piedecuesta","San Gil"],Sucre:["Sincelejo","Corozal","Sampués","Tolú"],Tolima:["Ibagué","Espinal","Honda","Melgar"],"Valle del Cauca":["Cali","Buga","Buenaventura","Cartago","Jamundí","Palmira","Tuluá","Yumbo"],Vaupés:["Mitú"],Vichada:["Puerto Carreño","La Primavera","Santa Rosalía"]},$t=[{title:"How to answer salary questions",tag:"Interview",read:"4 min",body:"Use a confident range, anchor it to the role, and avoid apologizing for earning in USD.",actions:["Know your floor","Use monthly USD","Mention flexibility last"]},{title:"Writing a CV for US SaaS companies",tag:"CV",read:"6 min",body:"Translate local experience into metrics US hiring managers can scan in under a minute.",actions:["Lead with outcomes","Add tools","Quantify scope"]},{title:"Before your recruiter screen",tag:"Process",read:"3 min",body:"Prepare availability, compensation, English comfort, and two strong role stories.",actions:["Check your setup","Review the opening","Bring questions"]},{title:"STAR stories that feel natural",tag:"Interview",read:"5 min",body:"Keep stories specific, concise, and tied to business impact instead of job duties.",actions:["Situation","Action","Result"]}],ke=[{key:"applied",label:"Applied",help:"Your profile is in Nearwork review."},{key:"profile",label:"Profile Review",help:"We are checking role fit, CV, and background."},{key:"assessment",label:"Assessment",help:"Complete role-specific questions when assigned."},{key:"interview",label:"Interview",help:"Meet the recruiter or client team."},{key:"decision",label:"Decision",help:"Final feedback or offer decision."}];let n={user:null,candidate:null,applications:[],assessments:[],jobs:[],loading:!0,view:"login",activePage:"overview",matchesFiltered:!1,message:""};const ie=sessionStorage.getItem("nw_restore_path");ie&&(sessionStorage.removeItem("nw_restore_path"),window.history.replaceState({page:ie},"",ie));function me(){return[["overview","layout-dashboard","Overview"],["matches","briefcase-business","Matches"],["applications","send","Applications"],["assessment","clipboard-check","Assessment"],["cvs","files","CV Picker"],["tips","book-open","Tips"],["recruiter","calendar-days","Recruiter"],["profile","user-round-cog","Profile"]]}function ee(){const t=window.location.pathname.split("/").filter(Boolean)[0];return t==="onboarding"?"onboarding":t==="assessment"||t==="assessments"?"assessment":me().some(([a])=>a===t)?t:"overview"}function z(){const e=window.location.pathname.split("/").filter(Boolean);return(e[0]==="assessment"||e[0]==="assessments")&&e[1]||""}function b(e,t){return`<i data-lucide="${e}" aria-label="${e}"></i>`}function Me(){window.lucide&&window.lucide.createIcons()}function w(e){n={...n,...e},ze()}function re(e,t=!0){const s=e==="onboarding"||me().some(([i])=>i===e)?e:"overview";n={...n,activePage:s,matchesFiltered:s==="matches"?n.matchesFiltered:!1,message:""},t&&window.history.pushState({page:s},"",s==="overview"?"/":`/${s}`),ze()}function xe(){var t,a;return(((t=n.candidate)==null?void 0:t.name)||((a=n.user)==null?void 0:a.displayName)||"there").split(" ")[0]||"there"}function Ct(){var t,a,s;return(((t=n.candidate)==null?void 0:t.name)||((a=n.user)==null?void 0:a.displayName)||((s=n.user)==null?void 0:s.email)||"NW").split(/[ @.]/).filter(Boolean).slice(0,2).map(i=>i[0]).join("").toUpperCase()}function Oe(e="normal"){var s,i;const t=((s=n.candidate)==null?void 0:s.photoURL)||((i=n.user)==null?void 0:i.photoURL)||"",a=e==="large"?"avatar avatar-large":"avatar";return t?`<img class="${a}" src="${S(t)}" alt="${S(xe())}" />`:`<div class="${a}">${Ct()}</div>`}function S(e){return String(e||"").replaceAll("&","&amp;").replaceAll('"',"&quot;").replaceAll("<","&lt;").replaceAll(">","&gt;")}function ge(e){if(!e)return"Recently";const t=e.toDate?e.toDate():new Date(e);return new Intl.DateTimeFormat("en",{month:"short",day:"numeric"}).format(t)}function ae(){var t;const e=((t=n.candidate)==null?void 0:t.skills)||[];return Array.isArray(e)?e:String(e).split(",").map(a=>a.trim()).filter(Boolean)}function kt(){var t;const e=((t=n.candidate)==null?void 0:t.otherSkills)||[];return Array.isArray(e)?e.join(", "):String(e||"")}function Ae(e){return String(e||"").split(",").map(t=>t.trim()).filter(Boolean)}function he(e){return["Nearwork candidate","Preview mode","Talent member"].includes(String(e||"").trim())}function At(){return fe()>=100}function qe(){var e,t;return!!((n.applications||[]).length||(((e=n.candidate)==null?void 0:e.pipelineCodes)||[]).length||(t=n.candidate)!=null&&t.pipelineCode)}function Pt(){var s,i,o;const e=((s=n.candidate)==null?void 0:s.department)||"Bogotá D.C.",t=W[e]||W["Bogotá D.C."],a=((i=n.candidate)==null?void 0:i.city)||((o=n.candidate)==null?void 0:o.locationCity)||t[0];return{department:e,city:a,label:`${a}, ${e}`}}function Nt(){var t,a,s;const e=((t=n.candidate)==null?void 0:t.targetRole)||((a=n.candidate)==null?void 0:a.headline)||"";return((s=Object.entries(H).find(([,i])=>i.includes(e)))==null?void 0:s[0])||Object.keys(H)[0]}function Dt(e){return Object.keys(H).map(t=>`<option value="${S(t)}" ${t===e?"selected":""}>${t}</option>`).join("")}function Ue(e,t){const a=H[e]||Object.values(H).flat();return['<option value="">Choose the closest role</option>'].concat(a.map(s=>`<option value="${S(s)}" ${t===s?"selected":""}>${s}</option>`)).join("")}function Tt(e){return Object.entries(St).map(([t,a])=>`
    <fieldset class="skill-group">
      <legend>${S(t)}</legend>
      <div class="skill-picker">
        ${a.map(s=>`
          <label class="skill-choice">
            <input type="checkbox" name="skills" value="${S(s)}" ${e.includes(s)?"checked":""} />
            <span>${S(s)}</span>
          </label>
        `).join("")}
      </div>
    </fieldset>
  `).join("")+`
    <fieldset class="skill-group">
      <legend>Other</legend>
      <label>Other skills
        <input name="otherSkills" value="${S(kt())}" placeholder="Type extra skills, separated by commas" />
      </label>
    </fieldset>
  `}function le(e){const t=Number(String(e||"").replace(/[^\d.]/g,""));if(!Number.isFinite(t)||t<=0)return{salary:"",salaryUSD:null};const a=Math.round(t);return{salary:`$${new Intl.NumberFormat("en-US").format(a)}/mo USD`,salaryUSD:a}}function Rt(e){return Array.isArray(e)?e:String(e||"").split(",").map(t=>t.trim()).filter(Boolean)}function G(e){const t=Rt(e.skills||e.requiredSkills);return{id:e.id||e.code,code:e.code||e.id,title:e.title||e.role||e.openingTitle||"Open role",orgName:e.orgName||e.company||e.clientName||"Nearwork client",location:e.location||"Remote",compensation:e.compensation||e.salary||e.rate||"Competitive",match:e.match||82,skills:t,description:e.description||e.about||"Nearwork is reviewing candidates for this role now."}}function q(e){const t=(e==null?void 0:e.code)||"";return t.includes("operation-not-allowed")?"This sign-in method is not available yet.":t.includes("unauthorized-domain")?"This website still needs to be approved for sign-in.":t.includes("permission-denied")?"We could not save this yet. Please try again in a moment or contact Nearwork support.":t.includes("weak-password")?"Password must be at least 6 characters.":t.includes("invalid-credential")||t.includes("wrong-password")?"That email/password did not match. If this account was created with Google, use Continue with Google.":t.includes("user-not-found")?"No account exists for that email yet.":t.includes("email-already-in-use")?"That email already has an account. Sign in or use Google.":t.includes("popup")?"The Google sign-in popup was closed before finishing.":"Something went wrong. Please try again or contact Nearwork support."}function Et(e){ue.innerHTML=`
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
  `,Me()}function Be(e="login"){var a;const t=e==="signup";Et(`
    <section class="auth-panel">
      <div class="right-brand">Near<span>work</span></div>
      <div class="candidate-chip">For candidates</div>
      <div class="panel-heading">
        <h2>${t?"Create your account.":"Welcome back."}</h2>
        <p>${t?"Create your profile, browse roles, and track your application.":"Use Google if your candidate account was created with Google."}</p>
      </div>
      ${n.message?`<div class="notice">${b("lock")} ${S(n.message)}</div>`:""}
      ${_?"":`<div class="notice">${b("triangle-alert")} Sign-in is still being set up.</div>`}
      <button id="googleSignIn" class="social-action" type="button">
        <span class="google-dot">G</span>
        Continue with Google
      </button>
      <div class="divider"><span></span>or use email<span></span></div>
      <form id="authForm" class="stacked-form">
        ${t?'<label>Full name<input name="name" type="text" autocomplete="name" placeholder="Byron Giraldo" required /></label>':""}
        <label>Email<input name="email" type="email" autocomplete="email" placeholder="you@example.com" required /></label>
        <label>Password<input name="password" type="password" autocomplete="${t?"new-password":"current-password"}" minlength="6" placeholder="••••••••" required /></label>
        <button class="primary-action" type="submit">${b(t?"user-plus":"log-in")} ${t?"Create account":"Sign in"}</button>
        <p id="formMessage" class="form-message" role="status"></p>
      </form>
      ${t?"":'<button id="resetPassword" class="text-action small" type="button">Forgot password?</button>'}
      <button id="toggleMode" class="text-action" type="button">${t?"Already have an account? Sign in":"New or invited by Nearwork? Create your profile"}</button>
    </section>
  `),document.querySelector("#toggleMode").addEventListener("click",()=>Be(t?"login":"signup")),document.querySelector("#googleSignIn").addEventListener("click",async()=>{const s=document.querySelector("#formMessage");s.textContent="";try{await ct()}catch(i){s.textContent=q(i)}}),(a=document.querySelector("#resetPassword"))==null||a.addEventListener("click",async()=>{const s=document.querySelector("input[name='email']").value.trim().toLowerCase(),i=document.querySelector("#formMessage");if(!s){i.textContent="Enter your email first, then request a reset link.";return}try{await Ze(U,s),i.textContent=`Password reset sent to ${s}.`}catch(o){i.textContent=q(o)}}),document.querySelector("#authForm").addEventListener("submit",async s=>{s.preventDefault();const i=new FormData(s.currentTarget),o=document.querySelector("#formMessage"),l=String(i.get("email")).trim().toLowerCase();o.textContent="";try{if(t){const d=await Xe(U,l,i.get("password"));await et(d.user,{displayName:i.get("name")}),sessionStorage.setItem("nw_new_account","1"),await de(d.user.uid,{name:i.get("name"),email:l,availability:"open",headline:"Nearwork candidate",onboarded:!1})}else await tt(U,l,i.get("password"))}catch(d){o.textContent=q(d)}})}async function Q(e){w({loading:!0,user:e});try{const[t,a,s,i]=await Promise.allSettled([Le(e),dt(e.uid),Ie(),pt(e.uid,e.email)]),o=t.status==="fulfilled"?t.value:null,l=a.status==="fulfilled"?a.value:[],d=s.status==="fulfilled"?s.value:Z;let u=i.status==="fulfilled"?i.value:[];const m=z();if(m&&!u.some(r=>r.id===m)){const r=await ut(m,e.uid,e.email).catch(()=>null);r&&(u=[r,...u])}const h=sessionStorage.getItem("nw_new_account")==="1";h&&sessionStorage.removeItem("nw_new_account");const c=h&&(o==null?void 0:o.onboarded)!==!0?"onboarding":ee();w({candidate:{...o||{},name:(o==null?void 0:o.name)||e.displayName||"Talent member",email:(o==null?void 0:o.email)||e.email,availability:(o==null?void 0:o.availability)||"open",headline:(o==null?void 0:o.headline)||(o==null?void 0:o.targetRole)||"Nearwork candidate"},applications:l,assessments:u,jobs:d.length?d.map(G):Z,loading:!1,view:"dashboard",activePage:c,message:""})}catch(t){console.warn(t),w({candidate:{name:e.displayName||"Talent member",email:e.email,availability:"open",headline:"Nearwork candidate"},applications:[],assessments:[],jobs:Z,loading:!1,view:"dashboard",activePage:ee(),message:""})}}async function X(){const e=ee();if(e==="assessment"){sessionStorage.setItem("nw_restore_path",window.location.pathname),w({user:null,candidate:null,applications:[],assessments:[],jobs:[],loading:!1,view:"login",activePage:"overview",message:"Please log in to open your assessment."});return}if(e==="overview"){w({user:null,candidate:null,loading:!1,view:"login",activePage:"overview"});return}let t=Z;try{const a=await Ie();a.length&&(t=a.map(G))}catch(a){console.warn(a)}w({user:null,candidate:{name:"Guest candidate",availability:"open",headline:"Preview mode"},applications:[],assessments:[],jobs:t,loading:!1,view:"dashboard",activePage:e,message:"Preview mode. Sign in with Google to save your profile, apply, upload CVs, or track your actual pipeline."})}function Lt(){var e,t,a,s;ue.innerHTML=`
    <main class="dashboard">
      <aside class="sidebar">
        <div class="brand-top"><span class="wordmark">Near<span>work</span></span></div>
        <div class="candidate-card">
          ${Oe()}
          <strong>${((e=n.candidate)==null?void 0:e.name)||((t=n.user)==null?void 0:t.displayName)||"Talent member"}</strong>
          <span>${((a=n.candidate)==null?void 0:a.headline)||((s=n.candidate)==null?void 0:s.targetRole)||"Nearwork candidate"}</span>
        </div>
        <nav>
          ${me().map(([i,o,l])=>`
            <button class="${n.activePage===i?"active":""}" data-page="${i}">${b(o)} ${l}</button>
          `).join("")}
        </nav>
        <button id="${n.user?"signOut":"signIn"}" class="ghost-action">${b(n.user?"log-out":"log-in")} ${n.user?"Sign out":"Sign in"}</button>
      </aside>
      <section class="workspace">
        <header class="topbar">
          <div><p class="eyebrow">Candidate workspace</p><h1>${It()}</h1></div>
          <label class="availability">Availability
            <select id="availability">
              ${["open","interviewing","paused"].map(i=>{var o;return`<option value="${i}" ${((o=n.candidate)==null?void 0:o.availability)===i?"selected":""}>${i}</option>`}).join("")}
            </select>
          </label>
        </header>
        ${n.message?`<div class="notice">${n.message}</div>`:""}
        ${Mt()}
      </section>
    </main>
  `,Me(),Jt()}function It(){return{onboarding:"Complete your candidate profile",overview:`Hi ${xe()}, here's your process`,matches:"Role matches",applications:"Application pipeline",assessment:"Assessment center",cvs:"CV picker",tips:"Interview tips",recruiter:"Your recruiter",profile:"Candidate profile"}[n.activePage]||"Talent"}function Mt(){return({onboarding:xt,overview:Pe,matches:Ot,applications:qt,assessment:Ut,cvs:Vt,tips:Qt,recruiter:zt,profile:_t}[n.activePage]||Pe)()}function Pe(){var s;const e=At(),t=qe(),a=n.jobs.length;return`
    ${e?"":`
      <section class="hero-card">
        <div><p class="eyebrow">Action needed</p><h2>Finish your profile to unlock matches.</h2><p>Add your role, city, salary, and skills so Nearwork can match you to the right openings.</p></div>
        <button class="primary-action fit" data-page="profile">${b("arrow-right")} Complete profile</button>
      </section>
    `}
    <section class="summary-grid">
      ${E("Profile readiness",`${fe()}%`,"sparkles")}
      ${E("Open roles",a,"briefcase-business")}
      ${E("Applications",n.applications.length,"send")}
      ${E("CVs saved",(((s=n.candidate)==null?void 0:s.cvLibrary)||[]).length,"files")}
    </section>
    <section class="content-grid">
      <div class="section-block"><div class="section-heading"><div><p class="eyebrow">Now</p><h2>${t?"Talent pipeline":"Find your next opening"}</h2></div></div>${t?Ge(je()):Ve()}</div>
      <div class="section-block compact"><div class="section-heading"><div><p class="eyebrow">Recruiter</p><h2>Need help?</h2></div></div>${Qe()}</div>
    </section>
  `}function xt(){return`
    <section class="onboarding-hero">
      <div>
        <p class="eyebrow">New candidate setup</p>
        <h2>Tell Nearwork what role, city, salary, and skills fit you best.</h2>
        <p>This only appears as a first-run setup. After you submit it, you will land in the Talent workspace.</p>
      </div>
    </section>
    ${Fe("onboarding")}
  `}function Ot(){var d,u,m;const e=((d=n.candidate)==null?void 0:d.targetRole)||(he((u=n.candidate)==null?void 0:u.headline)?"":(m=n.candidate)==null?void 0:m.headline),t=ae(),a=t.map(h=>h.toLowerCase()),s=n.jobs.map(G).filter(h=>{const c=e.toLowerCase().split(/[^a-z0-9]+/).filter(y=>y.length>2),r=[h.title,h.description,h.skills.join(" ")].join(" ").toLowerCase(),p=c.length?c.some(y=>r.includes(y)):!1,g=a.length?a.some(y=>r.includes(y)):!1;return p||g}),i=!!(e||t.length),o=n.matchesFiltered&&i?s:n.jobs.map(G),l=n.matchesFiltered&&!s.length;return`
    <section class="section-block">
      <div class="section-heading">
        <div><p class="eyebrow">Openings</p><h2>${n.matchesFiltered?"Best fit from your profile":"All current openings"}</h2></div>
        <button id="filterMatches" class="secondary-action" type="button">${b(n.matchesFiltered?"list":"filter")} ${n.matchesFiltered?"Show all openings":"Filter by my role & skills"}</button>
      </div>
      <div class="match-note"><strong>${o.length}</strong> of <strong>${n.jobs.length}</strong> openings showing. Role: <strong>${e||"not set"}</strong>. Skills: <strong>${t.join(", ")||"not set"}</strong>.</div>
      <div class="job-list">${l?J("No filtered matches yet","Add a target role and skills in Profile to improve matching."):o.map(h=>Ht(h)).join("")}</div>
    </section>
  `}function qt(){return`
    <section class="section-block">
      <div class="section-heading"><div><p class="eyebrow">Pipeline</p><h2>Your applications</h2></div></div>
      ${qe()?Ge(je()):Ve()}
      <div class="timeline page-gap">${n.applications.length?n.applications.map(Wt).join(""):J("No applications yet","Apply to a role and your process will show here.")}</div>
    </section>
  `}function Ut(){const e=z(),t=n.assessments||[],a=e?t.find(s=>s.id===e):t.find(s=>["sent","started"].includes(String(s.status||"").toLowerCase()))||t[0];if(e&&!a)return`
      <section class="assessment-hero">
        <div><p class="eyebrow">Assessment</p><h2>No assessment available for this link.</h2><p>Make sure you are logged into the same account that received the assessment email. If this keeps happening, contact Nearwork support.</p></div>
        <button class="primary-action fit" data-page="recruiter" type="button">${b("message-circle")} Contact support</button>
      </section>
    `;if(a){const s=Array.isArray(a.questions)?a.questions:[],i=String(a.status||"").toLowerCase()==="started",o=String(a.status||"").toLowerCase()==="completed",l=Ft(a),d=Math.min(Number(a.currentQuestionIndex||0),Math.max(s.length-1,0)),u=s[d],m=(u==null?void 0:u.stage)||a.currentStage||1;return`
      <section class="assessment-hero">
        <div>
          <p class="eyebrow">Nearwork assessment</p>
          <h2>${S(a.role||"Role assessment")}</h2>
          <p>${o?"This assessment has been submitted.":l?"This assessment link has expired.":"This assessment has 2 stages. Stage 1 is technical, Stage 2 is DISC. You must be logged in to complete it."}</p>
        </div>
        <button class="primary-action fit" id="startAssessment" type="button" ${o||l?"disabled":""}>${b(i?"play":"clipboard-check")} ${i?"Continue assessment":"Start assessment"}</button>
      </section>
      <section class="info-grid">
        ${j("Stage 1","50 technical multiple-choice questions. 60 minutes.")}
        ${j("Stage 2","20 DISC multiple-choice questions. 30 minutes.")}
        ${j("24-hour link",`Expires ${ge(a.expiresAt||a.deadline)}.`)}
      </section>
      <section class="section-block page-gap" id="assessmentWorkspace">
        <div class="section-heading"><div><p class="eyebrow">${o?"Results":`Stage ${m} of 2`}</p><h2>${o?"Assessment result":`${d+1} of ${s.length||70}`}</h2></div></div>
        ${o?jt(a):l?J("Assessment expired","This unique assessment link is no longer available. Contact Nearwork if you need help."):Bt(a,i)}
      </section>
    `}return`
    <section class="assessment-hero">
      <div><p class="eyebrow">Assessment</p><h2>Complete role-specific questions when Nearwork assigns them.</h2><p>Your assessment will include English, work simulation, and role-specific scenarios. Results are reviewed by the Nearwork recruiting team.</p></div>
      <button class="primary-action fit" type="button" disabled>${b("lock")} Not assigned yet</button>
    </section>
    <section class="info-grid">${j("One attempt","Retakes are only opened by your recruiter when needed.")}${j("Timed work","Most role assessments take 45-90 minutes.")}${j("Recruiter review","You will get next steps or respectful feedback after review.")}</section>
  `}function Bt(e,t){var m,h,c,r;if(!t)return`
      <div class="empty-state">
        ${b("timer")}
        <strong>Ready when you are</strong>
        <p>You are entering Stage 1: Technical. After you finish it, you will continue into Stage 2: DISC.</p>
      </div>
    `;const a=(e.questions||[]).slice(0,70),s=Math.min(Number(e.currentQuestionIndex||0),Math.max(a.length-1,0)),i=a[s],o=((h=(m=e.answers)==null?void 0:m[i.id])==null?void 0:h.value)??((c=e.answers)==null?void 0:c[i.id])??"",l=Array.isArray(i.options)&&i.options.length?i.options:["Strongly agree","Agree","Neutral","Disagree"],d=(r=a[s+1])==null?void 0:r.stage,u=d&&d!==i.stage;return`
    <form id="assessmentQuestionForm" class="stacked-form">
      <div class="match-note"><strong>${S(i.part||i.type)}</strong> · ${S(i.bank||"")} · ${i.stage===1?"60 minutes":"30 minutes"}</div>
      <label>
        ${S(i.q||"")}
        <div class="skill-picker">
          ${l.map((p,g)=>`
            <label class="skill-choice">
              <input type="radio" name="answer" value="${g}" ${String(o)===String(g)?"checked":""} />
              <span>${S(p)}</span>
            </label>
          `).join("")}
        </div>
      </label>
      <p class="field-hint">${u?"After this answer, you finished Stage 1 and will enter Stage 2.":"Your progress saves after every question. If you refresh, you will return here."}</p>
      <div class="job-footer">
        <button class="ghost-action" id="prevAssessmentQuestion" type="button" ${s===0?"disabled":""}>${b("arrow-left")} Previous</button>
        <button class="primary-action fit" type="submit">${s+1>=a.length?"Submit assessment":"Save and continue"}</button>
      </div>
    </form>
  `}function Ft(e){return!(e!=null&&e.expiresAt)||String(e.status||"").toLowerCase()==="completed"?!1:Date.now()>new Date(e.expiresAt).getTime()}function jt(e){return`
    <div class="summary-grid">
      ${E("Overall",`${e.score||0}%`,"sparkles")}
      ${E("Technical",`${e.technical||0}%`,"clipboard-check")}
      ${E("DISC",String(e.disc||"Submitted"),"users")}
      ${E("Progress",e.progress||"70/70","timer")}
    </div>
    ${J("Assessment submitted","Nearwork is reviewing your answers. Your results are saved to your profile.")}
  `}function Gt(e,t){const a=e.questions||[],s=a.filter(l=>l.stage===1),i=a.filter(l=>l.stage===2),o=s.filter(l=>{var d;return typeof l.correctIndex=="number"&&Number((d=t[l.id])==null?void 0:d.value)===l.correctIndex}).length;return{technicalScore:s.length?Math.round(o/s.length*100):0,discScore:i.length?Math.round(i.filter(l=>t[l.id]).length/i.length*100):0}}function Vt(){var t;const e=((t=n.candidate)==null?void 0:t.cvLibrary)||[];return`
    <section class="section-block">
      <div class="section-heading"><div><p class="eyebrow">CV picker</p><h2>Store multiple resumes</h2></div></div>
      <form id="cvForm" class="upload-box">
        ${b("upload-cloud")}<strong>Upload a CV for this role</strong><p>Save multiple versions and pick the best one for each opening.</p>
        <input name="cv" type="file" accept=".pdf,.doc,.docx" required />
        <input name="label" type="text" placeholder="CV label, e.g. CSM resume" />
        <button class="primary-action fit" type="submit">Upload CV</button>
      </form>
      <div class="cv-list">
        ${e.length?e.map(a=>`<article class="cv-item">${b("file-text")}<div><strong>${a.name||a.fileName}</strong><span>${ge(a.uploadedAt)}</span></div>${a.url?`<a href="${a.url}" target="_blank" rel="noreferrer">Open</a>`:""}</article>`).join(""):J("No CVs saved yet","Upload role-specific resumes here.")}
      </div>
    </section>
  `}function Qt(){return`
    <section class="tips-hero"><div><p class="eyebrow">Candidate guide</p><h2>Practical prep for US SaaS interviews.</h2><p>Short, useful guidance candidates can read before recruiter screens, assessments, and client interviews.</p></div></section>
    <section class="tips-grid rich">
      ${$t.map((e,t)=>`
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
  `}function zt(){var a,s;const t=(((a=n.candidate)==null?void 0:a.recruiter)||{}).bookingUrl||((s=n.candidate)==null?void 0:s.recruiterBookingUrl)||"mailto:support@nearwork.co?subject=Nearwork%20candidate%20question";return`
    <section class="content-grid">
      <div class="section-block"><div class="section-heading"><div><p class="eyebrow">Recruiter</p><h2>Your Nearwork contact</h2></div></div>${Qe(!0)}</div>
      <div class="section-block compact"><div class="section-heading"><div><p class="eyebrow">Booking</p><h2>Schedule soon</h2></div></div><p class="muted">Ask the Nearwork recruiting team for the earliest available slot. Candidate booking links can be attached to this profile later.</p><a class="primary-action fit" href="${t}" target="_blank" rel="noreferrer">${b("calendar-plus")} Book recruiter call</a></div>
    </section>
  `}function _t(){return Fe("profile")}function Fe(e="profile"){var d,u,m,h,c,r,p,g,y,N;const t=ae(),a=Pt(),s=W[a.department]||[],i=le(((d=n.candidate)==null?void 0:d.salary)||((u=n.candidate)==null?void 0:u.salaryUSD)),o=Nt(),l=((m=n.candidate)==null?void 0:m.targetRole)||((h=n.candidate)==null?void 0:h.headline)||"";return`
    <section class="section-block">
      <div class="section-heading"><div><p class="eyebrow">${e==="onboarding"?"Setup":"Profile"}</p><h2>${e==="onboarding"?"Complete your account":"Improve your match quality"}</h2></div><span class="profile-score">${fe()}%</span></div>
      <form id="profileForm" class="profile-form">
        <div class="profile-card profile-identity wide">
          ${Oe("large")}
          <label>Profile photo <span class="optional-label">optional</span>
            <input name="photo" type="file" accept="image/png,image/jpeg,image/webp" />
          </label>
        </div>
        <label class="wide">Full name<input name="name" value="${S(((c=n.candidate)==null?void 0:c.name)||((r=n.user)==null?void 0:r.displayName)||"")}" /></label>
        <div class="profile-card wide">
          <div class="field-label">Role applying for</div>
          <div class="profile-card-grid">
            <label>Area
              <select name="roleGroup" id="roleGroupSelect">
                ${Dt(o)}
              </select>
            </label>
            <label>Role
              <select name="targetRole" id="targetRoleSelect">
                ${Ue(o,l)}
              </select>
            </label>
          </div>
        </div>
        <div class="profile-card wide">
          <div class="field-label">Location</div>
          <div class="profile-card-grid">
            <label>Department
              <select name="department" id="departmentSelect">
                ${Object.keys(W).map($=>`<option value="${S($)}" ${$===a.department?"selected":""}>${$}</option>`).join("")}
              </select>
            </label>
            <label>City
              <select name="city" id="citySelect">
                ${s.map($=>`<option value="${S($)}" ${$===a.city?"selected":""}>${$}</option>`).join("")}
              </select>
            </label>
          </div>
        </div>
        <div class="profile-card wide">
          <div class="field-label">Compensation and English</div>
          <div class="profile-card-grid">
            <label>Target monthly salary
              <div class="salary-field"><span>USD</span><input id="salaryInput" name="salary" value="${S(i.salary||"")}" inputmode="numeric" placeholder="1000" /></div>
            </label>
            <label>English level<select name="english">${["","B1","B2","C1","C2","Native"].map($=>{var T;return`<option value="${$}" ${((T=n.candidate)==null?void 0:T.english)===$?"selected":""}>${$||"Select level"}</option>`}).join("")}</select></label>
          </div>
        </div>
        <div class="profile-card wide">
          <div class="field-label">Contact</div>
          <div class="profile-card-grid">
            <label>WhatsApp number
              <input name="whatsapp" value="${S(((p=n.candidate)==null?void 0:p.whatsapp)||((g=n.candidate)==null?void 0:g.phone)||"")}" inputmode="tel" autocomplete="tel" placeholder="+57 300 123 4567" required />
            </label>
            <label>LinkedIn <span class="optional-label">optional</span>
              <input name="linkedin" value="${S(((y=n.candidate)==null?void 0:y.linkedin)||"")}" placeholder="https://linkedin.com/in/..." />
            </label>
          </div>
        </div>
        <div class="profile-card wide">
          <div class="field-label">Skills</div>
          <p class="field-hint">Tap the skills that best match your experience.</p>
          ${Tt(t)}
        </div>
        <div class="profile-card wide">
          <div class="field-label">CV</div>
          <p class="field-hint">Upload the CV you want Nearwork to use for your applications.</p>
          <input name="profileCv" type="file" accept=".pdf,.doc,.docx" />
          <input name="profileCvLabel" type="text" placeholder="CV label, e.g. Customer Success CV" />
        </div>
        <label class="wide">Summary <span class="optional-label">optional</span><textarea name="summary" placeholder="Add a short note about what you do best.">${((N=n.candidate)==null?void 0:N.summary)||""}</textarea></label>
        <input type="hidden" name="mode" value="${e}" />
        <button class="primary-action fit" type="submit">${b("save")} ${e==="onboarding"?"Finish setup":"Save profile"}</button>
      </form>
    </section>
  `}function fe(){const e=["name","targetRole","department","city","english","salary","whatsapp"],t=e.filter(a=>{var s,i,o,l;return a==="targetRole"?!!((s=n.candidate)!=null&&s.targetRole||!he((i=n.candidate)==null?void 0:i.headline)&&((o=n.candidate)!=null&&o.headline)):!!((l=n.candidate)!=null&&l[a])}).length+(ae().length?1:0);return Math.max(25,Math.round(t/(e.length+1)*100))}function je(){const e=n.applications[0];return(e==null?void 0:e.stage)||(e==null?void 0:e.status)||"profile"}function Ge(e){const t=Math.max(0,ke.findIndex(a=>e==null?void 0:e.toLowerCase().includes(a.key)));return`<div class="pipeline">${ke.map((a,s)=>`<article class="${s<=t?"done":""} ${s===t?"current":""}"><span>${s+1}</span><strong>${a.label}</strong><p>${a.help}</p></article>`).join("")}</div>`}function Ve(){return`
    <div class="empty-state">
      ${b("briefcase-business")}
      <strong>No active pipeline yet</strong>
      <p>Browse current openings and apply when you find a role that fits. Nearwork will show a pipeline here after an application moves forward.</p>
      <div class="empty-actions">
        <button class="primary-action fit" type="button" data-page="matches">${b("sparkles")} View matches</button>
        <a class="secondary-action" href="https://jobs.nearwork.co" target="_blank" rel="noreferrer">${b("external-link")} Open jobs</a>
      </div>
    </div>
  `}function E(e,t,a){return`<article class="metric"><span>${b(a)}</span><p>${e}</p><strong>${t}</strong></article>`}function Ht(e){const t=G(e),a=new Set(n.applications.map(s=>s.jobId||s.openingCode)).has(t.code);return`
    <article class="job-card">
      <div><div class="match-pill">${t.match}% match</div><h3>${t.title}</h3><p>${t.orgName} · ${t.location}</p></div>
      <p class="job-description">${t.description}</p>
      <div class="skill-row">${t.skills.slice(0,4).map(s=>`<span>${s}</span>`).join("")}</div>
      <div class="job-footer"><strong>${t.compensation}</strong><button class="secondary-action" type="button" data-apply="${t.code}" ${a?"disabled":""}>${a?"Applied":"Apply"}</button></div>
    </article>
  `}function Wt(e){return`<article class="timeline-item"><span>${b("circle-dot")}</span><div><strong>${e.jobTitle||e.title||"Application"}</strong><p>${e.clientName||e.company||"Nearwork"} · ${e.status||"submitted"}</p><small>${ge(e.updatedAt||e.createdAt)}</small></div></article>`}function j(e,t){return`<article class="info-card"><strong>${e}</strong><p>${t}</p></article>`}function Qe(e=!1){var o;const t=((o=n.candidate)==null?void 0:o.recruiter)||{},a=t.email||"support@nearwork.co",s=t.whatsapp||wt,i=t.whatsappUrl||bt;return`<article class="recruiter-card"><div class="avatar recruiter-avatar">NW</div><div><strong>${t.name||"Nearwork Support"}</strong><p><a href="mailto:${a}">${a}</a></p><p><a href="${i}" target="_blank" rel="noreferrer">WhatsApp ${s}</a></p>${e?"<span>Questions about assessments, interviews, feedback, or CV selection should go here.</span>":""}</div></article>`}function J(e,t){return`<div class="empty-state">${b("inbox")}<strong>${e}</strong><p>${t}</p></div>`}function Yt(){ue.innerHTML='<main class="loading-screen"><span class="logo-mark">N</span><p>Loading Talent...</p></main>'}function Jt(){var e,t,a,s,i,o,l,d,u,m,h;(e=document.querySelector("#signOut"))==null||e.addEventListener("click",async()=>{await at(U),window.history.pushState({page:"overview"},"","/"),w({user:null,candidate:null,applications:[],assessments:[],jobs:[],view:"login",activePage:"overview",message:""})}),(t=document.querySelector("#signIn"))==null||t.addEventListener("click",()=>{window.history.pushState({page:"overview"},"","/"),w({view:"login",activePage:"overview",message:""})}),document.querySelectorAll("[data-page]").forEach(c=>{c.addEventListener("click",()=>re(c.dataset.page))}),document.querySelector("#availability").addEventListener("change",async c=>{const r=c.target.value;w({candidate:{...n.candidate,availability:r}}),n.user&&_?await ft(n.user.uid,r):w({message:"Sign in with Google to save availability."})}),(a=document.querySelector("#filterMatches"))==null||a.addEventListener("click",()=>{var r,p,g;const c=!!((r=n.candidate)!=null&&r.targetRole||!he((p=n.candidate)==null?void 0:p.headline)&&((g=n.candidate)!=null&&g.headline)||ae().length);w({matchesFiltered:c?!n.matchesFiltered:!1,message:c?"":"Add your role and skills in Profile first, then filter openings."})}),(s=document.querySelector("#departmentSelect"))==null||s.addEventListener("change",c=>{const r=document.querySelector("#citySelect"),p=W[c.target.value]||[];r.innerHTML=p.map(g=>`<option value="${S(g)}">${g}</option>`).join("")}),(i=document.querySelector("#roleGroupSelect"))==null||i.addEventListener("change",c=>{const r=document.querySelector("#targetRoleSelect");r.innerHTML=Ue(c.target.value,"")}),(o=document.querySelector("#salaryInput"))==null||o.addEventListener("blur",c=>{const r=le(c.target.value);r.salary&&(c.target.value=r.salary)}),document.querySelectorAll("[data-apply]").forEach(c=>{c.addEventListener("click",async()=>{const r=n.jobs.map(G).find(p=>p.code===c.dataset.apply);c.disabled=!0,c.textContent="Submitted",n.user&&_?(await ht(n.user.uid,r),await Q(n.user),re("applications")):w({message:"Sign in with Google to apply to this opening."})})}),(l=document.querySelector("#startAssessment"))==null||l.addEventListener("click",async()=>{var r;const c=z()||((r=(n.assessments||[])[0])==null?void 0:r.id);if(!c||!n.user){w({message:"Please log in to start your assessment."});return}try{await mt(c,n.user.uid),await Q(n.user)}catch(p){w({message:q(p)})}}),(d=document.querySelector("#prevAssessmentQuestion"))==null||d.addEventListener("click",async()=>{var y,N,$;const c=z()||((y=(n.assessments||[])[0])==null?void 0:y.id),r=(n.assessments||[]).find(T=>T.id===c),p=Math.max(0,Number((r==null?void 0:r.currentQuestionIndex)||0)-1),g=(N=r==null?void 0:r.questions)==null?void 0:N[p];await $e(c,"__progress__","",{currentQuestionIndex:p,totalQuestions:(($=r==null?void 0:r.questions)==null?void 0:$.length)||70,currentStage:(g==null?void 0:g.stage)||1}),await Q(n.user)}),(u=document.querySelector("#assessmentQuestionForm"))==null||u.addEventListener("submit",async c=>{var V;c.preventDefault();const r=z()||((V=(n.assessments||[])[0])==null?void 0:V.id),p=(n.assessments||[]).find(A=>A.id===r),g=(p==null?void 0:p.questions)||[],y=Number((p==null?void 0:p.currentQuestionIndex)||0),N=g[y],$=new FormData(c.currentTarget).get("answer");if(!N||$===null){w({message:"Select an answer before continuing."});return}const T={...p.answers||{},[N.id]:{value:Number($),answeredAt:new Date().toISOString()}};try{if(y+1>=g.length){const A=Gt(p,T);await gt(r,T,{totalQuestions:g.length,technicalScore:A.technicalScore,discScore:A.discScore,score:Math.round(A.technicalScore*.75+A.discScore*.25)})}else{const A=g[y+1];await $e(r,N.id,T[N.id],{currentQuestionIndex:y+1,totalQuestions:g.length,currentStage:(A==null?void 0:A.stage)||N.stage||1})}await Q(n.user)}catch(A){w({message:q(A)})}}),(m=document.querySelector("#profileForm"))==null||m.addEventListener("submit",async c=>{var $,T,V,A,ve,ye;c.preventDefault();const r=new FormData(c.currentTarget),p=r.get("department"),g=r.get("city"),y=le(r.get("salary")),N={name:r.get("name"),targetRole:r.get("targetRole"),headline:r.get("targetRole"),department:p,city:g,locationId:`${String(g).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g,"-")}-co`,location:`${g}, ${p}`,locationCity:g,locationDepartment:p,locationCountry:"Colombia",english:r.get("english"),salary:y.salary,salaryUSD:y.salaryUSD,linkedin:r.get("linkedin"),whatsapp:r.get("whatsapp"),phone:r.get("whatsapp"),skills:[...new Set([...r.getAll("skills"),...Ae(r.get("otherSkills"))])],otherSkills:Ae(r.get("otherSkills")),summary:r.get("summary"),email:(($=n.candidate)==null?void 0:$.email)||((T=n.user)==null?void 0:T.email)||"",availability:((V=n.candidate)==null?void 0:V.availability)||"open",onboarded:!0};if(!n.user){w({candidate:{...n.candidate,...N},message:"Preview updated. Sign in with Google to save this profile."});return}try{const B=r.get("photo");let we=((A=n.candidate)==null?void 0:A.photoURL)||((ve=n.user)==null?void 0:ve.photoURL)||"";B!=null&&B.name&&(we=await yt(n.user.uid,B));const K=r.get("profileCv");let F=null;K!=null&&K.name&&(F=await Ce(n.user.uid,K,r.get("profileCvLabel")));const se={...N,photoURL:we,...F?{activeCvId:F.id,activeCvName:F.name||F.fileName,cvLibrary:[...((ye=n.candidate)==null?void 0:ye.cvLibrary)||[],F]}:{}},ne=await vt(n.user.uid,se),_e=(ne==null?void 0:ne.atsSynced)===!1?"Profile saved. Nearwork will finish connecting it to your workspace.":"Profile saved.";r.get("mode")==="onboarding"?(window.history.pushState({page:"overview"},"","/"),w({candidate:{...n.candidate,...se},activePage:"overview",message:"Profile complete. Welcome to Talent."})):w({candidate:{...n.candidate,...se},message:_e})}catch(B){w({message:q(B)})}}),(h=document.querySelector("#cvForm"))==null||h.addEventListener("submit",async c=>{var g;c.preventDefault();const r=new FormData(c.currentTarget),p=r.get("cv");if(p!=null&&p.name){if(!n.user){w({message:"Sign in with Google to upload and store CVs."});return}try{const y=await Ce(n.user.uid,p,r.get("label"));w({candidate:{...n.candidate,cvLibrary:[...((g=n.candidate)==null?void 0:g.cvLibrary)||[],y],activeCvId:y.id},message:"CV uploaded."})}catch(y){w({message:q(y)})}}})}function ze(){if(n.loading)return Yt();if(n.view==="dashboard")return Lt();Be()}window.addEventListener("popstate",()=>{const e=ee();e==="overview"&&!n.user?w({view:"login",activePage:"overview",message:""}):n.view==="dashboard"?re(e,!1):X()});_?(Ke(U,e=>{e?Q(e):X()}),window.setTimeout(()=>{n.loading&&X()},2500)):X();
