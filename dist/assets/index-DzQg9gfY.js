import{initializeApp as He}from"https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";import{getAuth as We,GoogleAuthProvider as Ye,signInWithPopup as Je,onAuthStateChanged as Ke,sendPasswordResetEmail as Ze,createUserWithEmailAndPassword as Xe,updateProfile as et,signInWithEmailAndPassword as tt,signOut as at}from"https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";import{getFirestore as st,query as L,collection as R,where as E,limit as I,getDocs as M,orderBy as be,getDoc as J,doc as k,serverTimestamp as C,setDoc as D,updateDoc as nt,addDoc as Se,arrayUnion as oe}from"https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";import{getStorage as it,ref as Ne,uploadBytes as De,getDownloadURL as Te}from"https://www.gstatic.com/firebasejs/10.12.5/firebase-storage.js";(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const a of document.querySelectorAll('link[rel="modulepreload"]'))n(a);new MutationObserver(a=>{for(const o of a)if(o.type==="childList")for(const c of o.addedNodes)c.tagName==="LINK"&&c.rel==="modulepreload"&&n(c)}).observe(document,{childList:!0,subtree:!0});function s(a){const o={};return a.integrity&&(o.integrity=a.integrity),a.referrerPolicy&&(o.referrerPolicy=a.referrerPolicy),a.crossOrigin==="use-credentials"?o.credentials="include":a.crossOrigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function n(a){if(a.ep)return;a.ep=!0;const o=s(a);fetch(a.href,o)}})();const Re={apiKey:"AIzaSyApRNyW8PoP28E0x77dUB5jOgHuTqA2by4",authDomain:"nearwork-97e3c.firebaseapp.com",projectId:"nearwork-97e3c",storageBucket:"nearwork-97e3c.firebasestorage.app",messagingSenderId:"145642656516",appId:"1:145642656516:web:0ac2da8931283121e87651",measurementId:"G-3LC8N6FFSH"},H=Object.values(Re).slice(0,6).every(Boolean),O=H?He(Re):null,U=O?We(O):null,f=O?st(O):null,ce=O?it(O):null,ot=O?new Ye:null,v={users:"users",candidates:"candidates",openings:"openings",pipelines:"pipelines",applications:"applications",assessments:"assessments",activity:"candidateActivity"};function P(){if(!O||!U||!f||!ce)throw new Error("Missing Firebase environment variables. Copy .env.example to .env.local and fill in the Admin app config.")}async function Le(e){P();const t=await J(k(f,v.users,e));return t.exists()?{id:t.id,...t.data()}:null}async function rt(e){P();const t=String(e||"").trim(),s=t.toLowerCase(),n=L(R(f,v.users),E("email","==",s),I(1)),a=await M(n);if(!a.empty)return{id:a.docs[0].id,...a.docs[0].data()};if(t===s)return null;const o=L(R(f,v.users),E("email","==",t),I(1)),c=await M(o);return c.empty?null:{id:c.docs[0].id,...c.docs[0].data()}}async function Ee(e){const t=await Le(e.uid);if(t)return t;const s=await rt(e.email);return s?(await de(e.uid,{...s,email:e.email,connectedFromUserId:s.id}),{...s,id:e.uid,connectedFromUserId:s.id}):null}async function de(e,t){P();const s={...t,role:"candidate",updatedAt:C()};await D(k(f,v.users,e),s,{merge:!0})}function te(e){return`CAND-${String(e||"").replace(/[^a-z0-9]/gi,"").slice(0,8).toUpperCase()||Date.now()}`}function lt(e){return String(e||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"")}function pe(e,t){const s=t.candidateCode||te(e),n=t.location||[t.locationCity||t.city,t.locationDepartment||t.department].filter(Boolean).join(", "),a=new Date().toISOString().slice(0,10);return{code:s,uid:e,ownerUid:e,name:t.name||"Talent member",role:t.targetRole||t.headline||"Nearwork candidate",skills:Array.isArray(t.skills)?t.skills:[],applied:t.applied||a,lastContact:t.lastContact||a,experience:Number(t.experience||0),location:n,city:lt(t.locationCity||t.city||n),department:t.locationDepartment||t.department||"",country:t.locationCountry||"Colombia",source:"talent.nearwork.co",status:t.status||"active",score:Number(t.score||50),email:t.email||"",phone:t.whatsapp||t.phone||"",whatsapp:t.whatsapp||t.phone||"",salary:t.salary||"",salaryUSD:Number(t.salaryUSD||0)||null,availability:t.availability||"open",english:t.english||"",visa:t.visa||"No",linkedin:t.linkedin||"",cv:t.activeCvName||"",tags:t.tags||["talent profile"],notes:t.summary||"",appliedBefore:!!t.appliedBefore,applications:t.applications||[],pipelineCodes:t.pipelineCodes||[],loom:t.loom||"Not uploaded",assessments:t.assessments||[],work:t.work||[],updatedAt:C()}}async function ct(){P();const e=await Je(U,ot),t=await Ee(e.user),s={email:e.user.email,name:e.user.displayName||"",availability:"open",onboarded:!1};t||await de(e.user.uid,s);const n=te(e.user.uid),a={...t||s,candidateCode:n};return await D(k(f,v.candidates,n),pe(e.user.uid,a),{merge:!0}).catch(()=>null),e.user}async function dt(e){P();const t=L(R(f,v.applications),E("candidateId","==",e),be("updatedAt","desc"),I(20)),s=L(R(f,v.applications),E("ownerUid","==",e),be("updatedAt","desc"),I(20)),n=await Promise.allSettled([M(t),M(s)]),a=new Map;return n.forEach(o=>{o.status==="fulfilled"&&o.value.docs.forEach(c=>a.set(c.id,{id:c.id,...c.data()}))}),Array.from(a.values()).sort((o,c)=>{const d=u=>{var m,g;return((g=(m=u==null?void 0:u.toDate)==null?void 0:m.call(u))==null?void 0:g.getTime())??(u?new Date(u).getTime():0)};return d(c.updatedAt||c.createdAt)-d(o.updatedAt||o.createdAt)})}async function pt(e,t="",s=""){P();const n=String(t||"").trim().toLowerCase(),a=String(s||"").trim(),o=[M(L(R(f,v.assessments),E("candidateUid","==",e),I(25))),M(L(R(f,v.assessments),E("candidateId","==",e),I(25)))];n&&o.push(M(L(R(f,v.assessments),E("candidateEmail","==",n),I(25)))),a&&o.push(M(L(R(f,v.assessments),E("candidateCode","==",a),I(25))));const c=await Promise.allSettled(o),d=new Map;return c.forEach(u=>{u.status==="fulfilled"&&u.value.docs.forEach(m=>d.set(m.id,{id:m.id,...m.data()}))}),Array.from(d.values()).sort((u,m)=>{const g=l=>{var r,p;return((p=(r=l==null?void 0:l.toDate)==null?void 0:r.call(l))==null?void 0:p.getTime())??(l?new Date(l).getTime():0)};return g(m.updatedAt||m.createdAt||m.sentAt)-g(u.updatedAt||u.createdAt||u.sentAt)})}async function ut(e,t,s="",n=""){P();const a=await J(k(f,v.assessments,e));if(!a.exists())return null;const o={id:a.id,...a.data()},c=String(s||"").trim().toLowerCase(),d=String(n||"").trim();return o.candidateUid===t||o.candidateId===t||String(o.candidateEmail||"").trim().toLowerCase()===c||String(o.candidateCode||"").trim()===d?o:null}async function mt(e,t){P();const s=await J(k(f,v.assessments,e)),n=s.exists()?s.data():{};if(n.status==="completed")throw new Error("This assessment is already completed.");if(n.expiresAt&&Date.now()>new Date(n.expiresAt).getTime())throw new Error("This assessment link has expired.");await D(k(f,v.assessments,e),{status:"started",currentQuestionIndex:Number(n.currentQuestionIndex||0),currentStage:Number(n.currentStage||1),technicalStartedAt:n.technicalStartedAt||C(),startedAt:n.startedAt||C(),updatedAt:C()},{merge:!0})}async function $e(e,t,s,n={}){P();const a=await J(k(f,v.assessments,e)),o=a.exists()?a.data():{};if(o.status==="completed")throw new Error("This assessment is already completed.");if(o.expiresAt&&Date.now()>new Date(o.expiresAt).getTime())throw new Error("This assessment link has expired.");await D(k(f,v.assessments,e),{[`answers.${t}`]:s,progress:`${n.currentQuestionIndex||0}/${n.totalQuestions||""}`.replace(/\/$/,""),currentQuestionIndex:n.currentQuestionIndex||0,currentStage:n.currentStage||1,updatedAt:C()},{merge:!0})}async function gt(e,t,s={}){P();const n=k(f,v.assessments,e),a=await J(n),o=a.exists()?a.data():{};if(o.status==="completed")throw new Error("This assessment is already completed.");if(o.expiresAt&&Date.now()>new Date(o.expiresAt).getTime())throw new Error("This assessment link has expired.");const c=Object.values(t||{}).filter(r=>String((r==null?void 0:r.value)??r??"").trim()).length,d=Number(s.totalQuestions||Object.keys(t||{}).length||0),u=Number(s.technicalScore||0),m=Number(s.discScore||0),g=Number(s.score||(d?Math.round(c/d*100):0));await D(n,{answers:t,answeredCount:c,totalQuestions:d,score:g,technical:u||g,disc:m?`${m}%`:"Submitted",progress:`${c}/${d}`,status:"completed",finished:new Date().toLocaleString("en-US",{month:"short",day:"numeric",year:"numeric",hour:"numeric",minute:"2-digit"}),finishedAt:C(),updatedAt:C()},{merge:!0});const l=Math.round(g);o.candidateUid&&await D(k(f,v.users,o.candidateUid),{score:l,nwScore:l,lastAssessmentScore:l,lastAssessmentId:e,updatedAt:C()},{merge:!0}).catch(()=>null),o.candidateCode&&await D(k(f,v.candidates,o.candidateCode),{score:l,nwScore:l,lastAssessmentScore:l,lastAssessmentId:e,updatedAt:C()},{merge:!0}).catch(()=>null)}async function Ie(){P();const e=L(R(f,v.openings),E("published","==",!0),I(12));return(await M(e)).docs.map(s=>({id:s.id,...s.data()}))}async function ht(e,t){P();const s=t.code||t.id,n=await Le(e).catch(()=>null),a={candidateId:e,candidateCode:(n==null?void 0:n.candidateCode)||te(e),candidateEmail:(n==null?void 0:n.email)||"",candidateName:(n==null?void 0:n.name)||"",openingCode:s,jobId:s,jobTitle:t.title||t.role||"Untitled role",clientName:t.orgName||t.clientName||t.company||"Nearwork client",status:"submitted",source:"talent.nearwork.co",createdAt:C(),updatedAt:C()};await Se(R(f,v.applications),a),await D(k(f,v.candidates,a.candidateCode),{...pe(e,{...n||{},candidateCode:a.candidateCode,applications:oe(s),appliedBefore:!0,lastContact:new Date().toISOString().slice(0,10)}),applications:oe(s),appliedBefore:!0},{merge:!0}).catch(()=>null),await Se(R(f,v.activity),{candidateId:e,type:"application_submitted",title:a.jobTitle,createdAt:C()}).catch(()=>null)}async function ft(e,t){await nt(k(f,v.users,e),{availability:t,updatedAt:C()})}async function vt(e,t){P();const s=t.candidateCode||te(e);await D(k(f,v.users,e),{...t,candidateCode:s,role:"candidate",updatedAt:C()},{merge:!0});try{return await D(k(f,v.candidates,s),pe(e,{...t,candidateCode:s}),{merge:!0}),{candidateCode:s,atsSynced:!0}}catch(n){return console.warn("Candidate ATS sync failed.",n),{candidateCode:s,atsSynced:!1}}}async function yt(e,t){P();const s=t.name.replace(/[^a-z0-9._-]/gi,"-").toLowerCase(),n=`candidate-photos/${e}/${Date.now()}-${s}`,a=Ne(ce,n);await De(a,t,{contentType:t.type||"application/octet-stream"});const o=await Te(a);return await D(k(f,v.users,e),{photoURL:o,updatedAt:C()},{merge:!0}),o}async function Ce(e,t,s){P();const n=t.name.replace(/[^a-z0-9._-]/gi,"-").toLowerCase(),a=`candidate-cvs/${e}/${Date.now()}-${n}`,o=Ne(ce,a);await De(o,t,{contentType:t.type||"application/octet-stream"});const c=await Te(o),d={id:a,name:s||t.name,fileName:t.name,url:c,uploadedAt:new Date().toISOString()};return await D(k(f,v.users,e),{cvLibrary:oe(d),activeCvId:d.id,activeCvName:d.name||d.fileName,updatedAt:C()},{merge:!0}),d}const ue=document.querySelector("#app"),wt="+573135928691",bt="https://wa.me/573135928691",Z=[{id:"OPEN-CSM-DEMO",code:"OPEN-CSM-DEMO",title:"Customer Success Manager",orgName:"US SaaS company",location:"Remote, Colombia",compensation:"$2,000-$2,800/mo USD",match:94,skills:["SaaS","Customer Success","English C1","QBRs"],description:"Own onboarding, adoption, renewals, and expansion for a portfolio of US-based SaaS clients."},{id:"OPEN-SDR-DEMO",code:"OPEN-SDR-DEMO",title:"SDR / Sales Development Rep",orgName:"B2B marketplace",location:"Remote",compensation:"$1,700-$2,200/mo USD",match:89,skills:["HubSpot","Outbound","Salesforce","English C1"],description:"Qualify outbound leads, book demos, and work closely with a high-performing US sales team."},{id:"OPEN-SUP-DEMO",code:"OPEN-SUP-DEMO",title:"Technical Support Specialist",orgName:"Cloud workflow platform",location:"Remote, LatAm",compensation:"$1,400-$1,900/mo USD",match:86,skills:["Technical Support","APIs","Tickets","Troubleshooting"],description:"Handle Tier 1 and Tier 2 support, troubleshoot product issues, and maintain excellent CSAT."}],W={"Customer Success":["Customer Success Manager","Customer Success Associate","Account Manager","Implementation Specialist","Onboarding Specialist","Renewals Manager"],Sales:["SDR / Sales Development Rep","BDR / Business Development Rep","Account Executive","Sales Operations Specialist","Sales Manager"],Support:["Technical Support Specialist","Customer Support Representative","Support Team Lead","QA Support Analyst"],Operations:["Operations Manager","Operations Analyst","Executive Assistant","Virtual Assistant","Project Coordinator","Recruiting Coordinator"],Marketing:["Marketing Ops / Content Specialist","Content Writer","SEO Specialist","Lifecycle Marketing Specialist","Social Media Manager"],Engineering:["Software Developer (Full Stack)","Frontend Developer","Backend Developer","No-Code Developer","Data Analyst","QA Engineer"],Finance:["Bookkeeper","Accounting Assistant","Financial Analyst","Payroll Specialist"]},St={"CRM & Sales":["HubSpot","Salesforce","Pipedrive","Apollo","Outbound","Cold Email","Discovery Calls","CRM Hygiene"],"Customer Success":["SaaS","Customer Success","QBRs","Onboarding","Renewals","Expansion","Churn Reduction","Intercom","Zendesk"],Support:["Technical Support","Tickets","Troubleshooting","APIs","Bug Reproduction","Help Center","CSAT"],Operations:["Excel","Google Sheets","Reporting","Process Design","Project Management","Notion","Airtable","Zapier"],Marketing:["Content","SEO","Lifecycle","Email Marketing","HubSpot Marketing","Copywriting","Analytics"],Engineering:["JavaScript","React","Node.js","SQL","Python","REST APIs","QA","GitHub"],Language:["English B2","English C1","English C2","Spanish Native"]},Y={Amazonas:["Leticia","Puerto Nariño"],Antioquia:["Medellín","Abejorral","Apartadó","Bello","Caldas","Caucasia","Copacabana","El Carmen de Viboral","Envigado","Girardota","Itagüí","La Ceja","La Estrella","Marinilla","Rionegro","Sabaneta","Santa Fe de Antioquia","Turbo"],Arauca:["Arauca","Arauquita","Saravena","Tame"],Atlántico:["Barranquilla","Baranoa","Galapa","Malambo","Puerto Colombia","Sabanalarga","Soledad"],"Bogotá D.C.":["Bogotá"],Bolívar:["Cartagena","Arjona","El Carmen de Bolívar","Magangué","Mompox","Turbaco"],Boyacá:["Tunja","Chiquinquirá","Duitama","Paipa","Sogamoso","Villa de Leyva"],Caldas:["Manizales","Aguadas","Chinchiná","La Dorada","Riosucio","Villamaría"],Caquetá:["Florencia","El Doncello","Puerto Rico","San Vicente del Caguán"],Casanare:["Yopal","Aguazul","Paz de Ariporo","Villanueva"],Cauca:["Popayán","El Tambo","Puerto Tejada","Santander de Quilichao"],Cesar:["Valledupar","Aguachica","Bosconia","Codazzi"],Chocó:["Quibdó","Istmina","Nuquí","Tadó"],Córdoba:["Montería","Cereté","Lorica","Sahagún"],Cundinamarca:["Chía","Cajicá","Facatativá","Fusagasugá","Girardot","Madrid","Mosquera","Soacha","Tocancipá","Zipaquirá"],Guainía:["Inírida"],Guaviare:["San José del Guaviare","Calamar","El Retorno","Miraflores"],Huila:["Neiva","Garzón","La Plata","Pitalito"],"La Guajira":["Riohacha","Maicao","San Juan del Cesar","Uribia"],Magdalena:["Santa Marta","Ciénaga","El Banco","Fundación"],Meta:["Villavicencio","Acacías","Granada","Puerto López"],Nariño:["Pasto","Ipiales","Tumaco","Túquerres"],"Norte de Santander":["Cúcuta","Ocaña","Pamplona","Villa del Rosario"],Putumayo:["Mocoa","Orito","Puerto Asís","Valle del Guamuez"],Quindío:["Armenia","Calarcá","La Tebaida","Montenegro","Quimbaya"],Risaralda:["Pereira","Dosquebradas","La Virginia","Santa Rosa de Cabal"],"San Andrés y Providencia":["San Andrés","Providencia"],Santander:["Bucaramanga","Barrancabermeja","Floridablanca","Girón","Piedecuesta","San Gil"],Sucre:["Sincelejo","Corozal","Sampués","Tolú"],Tolima:["Ibagué","Espinal","Honda","Melgar"],"Valle del Cauca":["Cali","Buga","Buenaventura","Cartago","Jamundí","Palmira","Tuluá","Yumbo"],Vaupés:["Mitú"],Vichada:["Puerto Carreño","La Primavera","Santa Rosalía"]},$t=[{title:"How to answer salary questions",tag:"Interview",read:"4 min",body:"Use a confident range, anchor it to the role, and avoid apologizing for earning in USD.",actions:["Know your floor","Use monthly USD","Mention flexibility last"]},{title:"Writing a CV for US SaaS companies",tag:"CV",read:"6 min",body:"Translate local experience into metrics US hiring managers can scan in under a minute.",actions:["Lead with outcomes","Add tools","Quantify scope"]},{title:"Before your recruiter screen",tag:"Process",read:"3 min",body:"Prepare availability, compensation, English comfort, and two strong role stories.",actions:["Check your setup","Review the opening","Bring questions"]},{title:"STAR stories that feel natural",tag:"Interview",read:"5 min",body:"Keep stories specific, concise, and tied to business impact instead of job duties.",actions:["Situation","Action","Result"]}],ke=[{key:"applied",label:"Applied",help:"Your profile is in Nearwork review."},{key:"profile",label:"Profile Review",help:"We are checking role fit, CV, and background."},{key:"assessment",label:"Assessment",help:"Complete role-specific questions when assigned."},{key:"interview",label:"Interview",help:"Meet the recruiter or client team."},{key:"decision",label:"Decision",help:"Final feedback or offer decision."}];let i={user:null,candidate:null,applications:[],assessments:[],jobs:[],loading:!0,view:"login",activePage:"overview",matchesFiltered:!1,message:""};const ie=sessionStorage.getItem("nw_restore_path");ie&&(sessionStorage.removeItem("nw_restore_path"),window.history.replaceState({page:ie},"",ie));function me(){return[["overview","layout-dashboard","Overview"],["matches","briefcase-business","Matches"],["applications","send","Applications"],["assessment","clipboard-check","Assessment"],["cvs","files","CV Picker"],["tips","book-open","Tips"],["recruiter","calendar-days","Recruiter"],["profile","user-round-cog","Profile"]]}function ee(){const t=window.location.pathname.split("/").filter(Boolean)[0];return t==="onboarding"?"onboarding":t==="assessment"||t==="assessments"?"assessment":me().some(([s])=>s===t)?t:"overview"}function _(){const e=window.location.pathname.split("/").filter(Boolean);return(e[0]==="assessment"||e[0]==="assessments")&&e[1]||""}function b(e,t){return`<i data-lucide="${e}" aria-label="${e}"></i>`}function Me(){window.lucide&&window.lucide.createIcons()}function w(e){i={...i,...e},ze()}function re(e,t=!0){const n=e==="onboarding"||me().some(([a])=>a===e)?e:"overview";i={...i,activePage:n,matchesFiltered:n==="matches"?i.matchesFiltered:!1,message:""},t&&window.history.pushState({page:n},"",n==="overview"?"/":`/${n}`),ze()}function xe(){var t,s;return(((t=i.candidate)==null?void 0:t.name)||((s=i.user)==null?void 0:s.displayName)||"there").split(" ")[0]||"there"}function Ct(){var t,s,n;return(((t=i.candidate)==null?void 0:t.name)||((s=i.user)==null?void 0:s.displayName)||((n=i.user)==null?void 0:n.email)||"NW").split(/[ @.]/).filter(Boolean).slice(0,2).map(a=>a[0]).join("").toUpperCase()}function Oe(e="normal"){var n,a;const t=((n=i.candidate)==null?void 0:n.photoURL)||((a=i.user)==null?void 0:a.photoURL)||"",s=e==="large"?"avatar avatar-large":"avatar";return t?`<img class="${s}" src="${S(t)}" alt="${S(xe())}" />`:`<div class="${s}">${Ct()}</div>`}function S(e){return String(e||"").replaceAll("&","&amp;").replaceAll('"',"&quot;").replaceAll("<","&lt;").replaceAll(">","&gt;")}function ge(e){if(!e)return"Recently";const t=e.toDate?e.toDate():new Date(e);return new Intl.DateTimeFormat("en",{month:"short",day:"numeric"}).format(t)}function ae(){var t;const e=((t=i.candidate)==null?void 0:t.skills)||[];return Array.isArray(e)?e:String(e).split(",").map(s=>s.trim()).filter(Boolean)}function kt(){var t;const e=((t=i.candidate)==null?void 0:t.otherSkills)||[];return Array.isArray(e)?e.join(", "):String(e||"")}function Ae(e){return String(e||"").split(",").map(t=>t.trim()).filter(Boolean)}function he(e){return["Nearwork candidate","Preview mode","Talent member"].includes(String(e||"").trim())}function At(){return fe()>=100}function qe(){var e,t;return!!((i.applications||[]).length||(((e=i.candidate)==null?void 0:e.pipelineCodes)||[]).length||(t=i.candidate)!=null&&t.pipelineCode)}function Pt(){var n,a,o;const e=((n=i.candidate)==null?void 0:n.department)||"Bogotá D.C.",t=Y[e]||Y["Bogotá D.C."],s=((a=i.candidate)==null?void 0:a.city)||((o=i.candidate)==null?void 0:o.locationCity)||t[0];return{department:e,city:s,label:`${s}, ${e}`}}function Nt(){var t,s,n;const e=((t=i.candidate)==null?void 0:t.targetRole)||((s=i.candidate)==null?void 0:s.headline)||"";return((n=Object.entries(W).find(([,a])=>a.includes(e)))==null?void 0:n[0])||Object.keys(W)[0]}function Dt(e){return Object.keys(W).map(t=>`<option value="${S(t)}" ${t===e?"selected":""}>${t}</option>`).join("")}function Ue(e,t){const s=W[e]||Object.values(W).flat();return['<option value="">Choose the closest role</option>'].concat(s.map(n=>`<option value="${S(n)}" ${t===n?"selected":""}>${n}</option>`)).join("")}function Tt(e){return Object.entries(St).map(([t,s])=>`
    <fieldset class="skill-group">
      <legend>${S(t)}</legend>
      <div class="skill-picker">
        ${s.map(n=>`
          <label class="skill-choice">
            <input type="checkbox" name="skills" value="${S(n)}" ${e.includes(n)?"checked":""} />
            <span>${S(n)}</span>
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
  `}function le(e){const t=Number(String(e||"").replace(/[^\d.]/g,""));if(!Number.isFinite(t)||t<=0)return{salary:"",salaryUSD:null};const s=Math.round(t);return{salary:`$${new Intl.NumberFormat("en-US").format(s)}/mo USD`,salaryUSD:s}}function Rt(e){return Array.isArray(e)?e:String(e||"").split(",").map(t=>t.trim()).filter(Boolean)}function G(e){const t=Rt(e.skills||e.requiredSkills);return{id:e.id||e.code,code:e.code||e.id,title:e.title||e.role||e.openingTitle||"Open role",orgName:e.orgName||e.company||e.clientName||"Nearwork client",location:e.location||"Remote",compensation:e.compensation||e.salary||e.rate||"Competitive",match:e.match||82,skills:t,description:e.description||e.about||"Nearwork is reviewing candidates for this role now."}}function q(e){const t=(e==null?void 0:e.code)||"";return t.includes("operation-not-allowed")?"This sign-in method is not available yet.":t.includes("unauthorized-domain")?"This website still needs to be approved for sign-in.":t.includes("permission-denied")?"We could not save this yet. Please try again in a moment or contact Nearwork support.":t.includes("weak-password")?"Password must be at least 6 characters.":t.includes("invalid-credential")||t.includes("wrong-password")?"That email/password did not match. If this account was created with Google, use Continue with Google.":t.includes("user-not-found")?"No account exists for that email yet.":t.includes("email-already-in-use")?"That email already has an account. Sign in or use Google.":t.includes("popup")?"The Google sign-in popup was closed before finishing.":"Something went wrong. Please try again or contact Nearwork support."}function Lt(e){ue.innerHTML=`
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
  `,Me()}function Be(e="login"){var s;const t=e==="signup";Lt(`
    <section class="auth-panel">
      <div class="right-brand">Near<span>work</span></div>
      <div class="candidate-chip">For candidates</div>
      <div class="panel-heading">
        <h2>${t?"Create your account.":"Welcome back."}</h2>
        <p>${t?"Create your profile, browse roles, and track your application.":"Use Google if your candidate account was created with Google."}</p>
      </div>
      ${i.message?`<div class="notice">${b("lock")} ${S(i.message)}</div>`:""}
      ${H?"":`<div class="notice">${b("triangle-alert")} Sign-in is still being set up.</div>`}
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
  `),document.querySelector("#toggleMode").addEventListener("click",()=>Be(t?"login":"signup")),document.querySelector("#googleSignIn").addEventListener("click",async()=>{const n=document.querySelector("#formMessage");n.textContent="";try{await ct()}catch(a){n.textContent=q(a)}}),(s=document.querySelector("#resetPassword"))==null||s.addEventListener("click",async()=>{const n=document.querySelector("input[name='email']").value.trim().toLowerCase(),a=document.querySelector("#formMessage");if(!n){a.textContent="Enter your email first, then request a reset link.";return}try{await Ze(U,n),a.textContent=`Password reset sent to ${n}.`}catch(o){a.textContent=q(o)}}),document.querySelector("#authForm").addEventListener("submit",async n=>{n.preventDefault();const a=new FormData(n.currentTarget),o=document.querySelector("#formMessage"),c=String(a.get("email")).trim().toLowerCase();o.textContent="";try{if(t){const d=await Xe(U,c,a.get("password"));await et(d.user,{displayName:a.get("name")}),sessionStorage.setItem("nw_new_account","1"),await de(d.user.uid,{name:a.get("name"),email:c,availability:"open",headline:"Nearwork candidate",onboarded:!1})}else await tt(U,c,a.get("password"))}catch(d){o.textContent=q(d)}})}async function z(e){w({loading:!0,user:e});try{const[t,s,n]=await Promise.allSettled([Ee(e),dt(e.uid),Ie()]),a=t.status==="fulfilled"?t.value:null,o=s.status==="fulfilled"?s.value:[],c=n.status==="fulfilled"?n.value:Z;let d=[];try{d=await pt(e.uid,e.email,(a==null?void 0:a.candidateCode)||(a==null?void 0:a.code)||"")}catch(l){console.warn(l)}const u=_();if(u&&!d.some(l=>l.id===u)){const l=await ut(u,e.uid,e.email,(a==null?void 0:a.candidateCode)||(a==null?void 0:a.code)||"").catch(()=>null);l&&(d=[l,...d])}const m=sessionStorage.getItem("nw_new_account")==="1";m&&sessionStorage.removeItem("nw_new_account");const g=m&&(a==null?void 0:a.onboarded)!==!0?"onboarding":ee();w({candidate:{...a||{},name:(a==null?void 0:a.name)||e.displayName||"Talent member",email:(a==null?void 0:a.email)||e.email,availability:(a==null?void 0:a.availability)||"open",headline:(a==null?void 0:a.headline)||(a==null?void 0:a.targetRole)||"Nearwork candidate"},applications:o,assessments:d,jobs:c.length?c.map(G):Z,loading:!1,view:"dashboard",activePage:g,message:""})}catch(t){console.warn(t),w({candidate:{name:e.displayName||"Talent member",email:e.email,availability:"open",headline:"Nearwork candidate"},applications:[],assessments:[],jobs:Z,loading:!1,view:"dashboard",activePage:ee(),message:""})}}async function X(){const e=ee();if(e==="assessment"){sessionStorage.setItem("nw_restore_path",window.location.pathname),w({user:null,candidate:null,applications:[],assessments:[],jobs:[],loading:!1,view:"login",activePage:"overview",message:"Please log in to open your assessment."});return}if(e==="overview"){w({user:null,candidate:null,loading:!1,view:"login",activePage:"overview"});return}let t=Z;try{const s=await Ie();s.length&&(t=s.map(G))}catch(s){console.warn(s)}w({user:null,candidate:{name:"Guest candidate",availability:"open",headline:"Preview mode"},applications:[],assessments:[],jobs:t,loading:!1,view:"dashboard",activePage:e,message:"Preview mode. Sign in with Google to save your profile, apply, upload CVs, or track your actual pipeline."})}function Et(){var e,t,s,n;ue.innerHTML=`
    <main class="dashboard">
      <aside class="sidebar">
        <div class="brand-top"><span class="wordmark">Near<span>work</span></span></div>
        <div class="candidate-card">
          ${Oe()}
          <strong>${((e=i.candidate)==null?void 0:e.name)||((t=i.user)==null?void 0:t.displayName)||"Talent member"}</strong>
          <span>${((s=i.candidate)==null?void 0:s.headline)||((n=i.candidate)==null?void 0:n.targetRole)||"Nearwork candidate"}</span>
        </div>
        <nav>
          ${me().map(([a,o,c])=>`
            <button class="${i.activePage===a?"active":""}" data-page="${a}">${b(o)} ${c}</button>
          `).join("")}
        </nav>
        <button id="${i.user?"signOut":"signIn"}" class="ghost-action">${b(i.user?"log-out":"log-in")} ${i.user?"Sign out":"Sign in"}</button>
      </aside>
      <section class="workspace">
        <header class="topbar">
          <div><p class="eyebrow">Candidate workspace</p><h1>${It()}</h1></div>
          <label class="availability">Availability
            <select id="availability">
              ${["open","interviewing","paused"].map(a=>{var o;return`<option value="${a}" ${((o=i.candidate)==null?void 0:o.availability)===a?"selected":""}>${a}</option>`}).join("")}
            </select>
          </label>
        </header>
        ${i.message?`<div class="notice">${i.message}</div>`:""}
        ${Mt()}
      </section>
    </main>
  `,Me(),Jt()}function It(){return{onboarding:"Complete your candidate profile",overview:`Hi ${xe()}, here's your process`,matches:"Role matches",applications:"Application pipeline",assessment:"Assessment center",cvs:"CV picker",tips:"Interview tips",recruiter:"Your recruiter",profile:"Candidate profile"}[i.activePage]||"Talent"}function Mt(){return({onboarding:xt,overview:Pe,matches:Ot,applications:qt,assessment:Ut,cvs:Vt,tips:Qt,recruiter:zt,profile:_t}[i.activePage]||Pe)()}function Pe(){var n;const e=At(),t=qe(),s=i.jobs.length;return`
    ${e?"":`
      <section class="hero-card">
        <div><p class="eyebrow">Action needed</p><h2>Finish your profile to unlock matches.</h2><p>Add your role, city, salary, and skills so Nearwork can match you to the right openings.</p></div>
        <button class="primary-action fit" data-page="profile">${b("arrow-right")} Complete profile</button>
      </section>
    `}
    <section class="summary-grid">
      ${x("Profile readiness",`${fe()}%`,"sparkles")}
      ${x("Open roles",s,"briefcase-business")}
      ${x("Applications",i.applications.length,"send")}
      ${x("CVs saved",(((n=i.candidate)==null?void 0:n.cvLibrary)||[]).length,"files")}
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
  `}function Ot(){var d,u,m;const e=((d=i.candidate)==null?void 0:d.targetRole)||(he((u=i.candidate)==null?void 0:u.headline)?"":(m=i.candidate)==null?void 0:m.headline),t=ae(),s=t.map(g=>g.toLowerCase()),n=i.jobs.map(G).filter(g=>{const l=e.toLowerCase().split(/[^a-z0-9]+/).filter(y=>y.length>2),r=[g.title,g.description,g.skills.join(" ")].join(" ").toLowerCase(),p=l.length?l.some(y=>r.includes(y)):!1,h=s.length?s.some(y=>r.includes(y)):!1;return p||h}),a=!!(e||t.length),o=i.matchesFiltered&&a?n:i.jobs.map(G),c=i.matchesFiltered&&!n.length;return`
    <section class="section-block">
      <div class="section-heading">
        <div><p class="eyebrow">Openings</p><h2>${i.matchesFiltered?"Best fit from your profile":"All current openings"}</h2></div>
        <button id="filterMatches" class="secondary-action" type="button">${b(i.matchesFiltered?"list":"filter")} ${i.matchesFiltered?"Show all openings":"Filter by my role & skills"}</button>
      </div>
      <div class="match-note"><strong>${o.length}</strong> of <strong>${i.jobs.length}</strong> openings showing. Role: <strong>${e||"not set"}</strong>. Skills: <strong>${t.join(", ")||"not set"}</strong>.</div>
      <div class="job-list">${c?V("No filtered matches yet","Add a target role and skills in Profile to improve matching."):o.map(g=>Ht(g)).join("")}</div>
    </section>
  `}function qt(){return`
    <section class="section-block">
      <div class="section-heading"><div><p class="eyebrow">Pipeline</p><h2>Your applications</h2></div></div>
      ${qe()?Ge(je()):Ve()}
      <div class="timeline page-gap">${i.applications.length?i.applications.map(Wt).join(""):V("No applications yet","Apply to a role and your process will show here.")}</div>
    </section>
  `}function Ut(){const e=_(),t=i.assessments||[],s=t.filter(o=>["sent","started"].includes(String(o.status||"").toLowerCase())),n=t.filter(o=>String(o.status||"").toLowerCase()==="completed"),a=e?t.find(o=>o.id===e):s[0]||n[0]||null;if(e&&!a)return`
      <section class="assessment-hero">
        <div><p class="eyebrow">Assessment</p><h2>No assessment available for this link.</h2><p>Make sure you are logged into the same account that received the assessment email. If this keeps happening, contact Nearwork support.</p></div>
        <button class="primary-action fit" data-page="recruiter" type="button">${b("message-circle")} Contact support</button>
      </section>
    `;if(a){const o=Array.isArray(a.questions)?a.questions:[],c=String(a.status||"").toLowerCase()==="started",d=String(a.status||"").toLowerCase()==="completed",u=String(a.status||"").toLowerCase()==="cancelled",m=Ft(a),g=Math.min(Number(a.currentQuestionIndex||0),Math.max(o.length-1,0)),l=o[g],r=(l==null?void 0:l.stage)||a.currentStage||1;return`
      <section class="assessment-hero">
        <div>
          <p class="eyebrow">Nearwork assessment</p>
          <h2>${S(a.role||"Role assessment")}</h2>
          <p>${d?"This assessment has been submitted.":u?"This assessment was cancelled by Nearwork. If a new one is assigned, it will appear here automatically.":m?"This assessment link has expired.":"This assessment has 2 stages. Stage 1 is technical, Stage 2 is DISC. You must be logged in to complete it."}</p>
        </div>
        <button class="primary-action fit" id="startAssessment" type="button" ${d||u||m?"disabled":""}>${b(c?"play":"clipboard-check")} ${c?"Continue assessment":"Start assessment"}</button>
      </section>
      <section class="info-grid">
        ${j("Stage 1","50 technical multiple-choice questions. 60 minutes.")}
        ${j("Stage 2","20 DISC multiple-choice questions. 30 minutes.")}
        ${j("24-hour link",`Expires ${ge(a.expiresAt||a.deadline)}.`)}
      </section>
      <section class="section-block page-gap" id="assessmentWorkspace">
        <div class="section-heading"><div><p class="eyebrow">${d?"Results":`Stage ${r} of 2`}</p><h2>${d?"Assessment result":`${g+1} of ${o.length||70}`}</h2></div></div>
        ${d?jt(a):u?V("Assessment cancelled","This assessment is no longer available. A new assigned assessment will appear here when your recruiter sends it."):m?V("Assessment expired","This unique assessment link is no longer available. Contact Nearwork if you need help."):Bt(a,c)}
      </section>
    `}return`
    <section class="assessment-hero">
      <div><p class="eyebrow">Assessment</p><h2>Complete role-specific questions when Nearwork assigns them.</h2><p>Your assessment will include English, work simulation, and role-specific scenarios. Results are reviewed by the Nearwork recruiting team.</p></div>
      <button class="primary-action fit" type="button" disabled>${b("lock")} Not assigned yet</button>
    </section>
    <section class="info-grid">${j("One attempt","Retakes are only opened by your recruiter when needed.")}${j("Timed work","Most role assessments take 45-90 minutes.")}${j("Recruiter review","You will get next steps or respectful feedback after review.")}</section>
  `}function Bt(e,t){var m,g,l,r;if(!t)return`
      <div class="empty-state">
        ${b("timer")}
        <strong>Ready when you are</strong>
        <p>You are entering Stage 1: Technical. After you finish it, you will continue into Stage 2: DISC.</p>
      </div>
    `;const s=(e.questions||[]).slice(0,70),n=Math.min(Number(e.currentQuestionIndex||0),Math.max(s.length-1,0)),a=s[n],o=((g=(m=e.answers)==null?void 0:m[a.id])==null?void 0:g.value)??((l=e.answers)==null?void 0:l[a.id])??"",c=Array.isArray(a.options)&&a.options.length?a.options:["Strongly agree","Agree","Neutral","Disagree"],d=(r=s[n+1])==null?void 0:r.stage,u=d&&d!==a.stage;return`
    <form id="assessmentQuestionForm" class="stacked-form">
      <div class="match-note"><strong>${S(a.part||a.type)}</strong> · ${S(a.bank||"")} · ${a.stage===1?"60 minutes":"30 minutes"}</div>
      <label>
        ${S(a.q||"")}
        <div class="skill-picker">
          ${c.map((p,h)=>`
            <label class="skill-choice">
              <input type="radio" name="answer" value="${h}" ${String(o)===String(h)?"checked":""} />
              <span>${S(p)}</span>
            </label>
          `).join("")}
        </div>
      </label>
      <p class="field-hint">${u?"After this answer, you finished Stage 1 and will enter Stage 2.":"Your progress saves after every question. If you refresh, you will return here."}</p>
      <div class="job-footer">
        <button class="ghost-action" id="prevAssessmentQuestion" type="button" ${n===0?"disabled":""}>${b("arrow-left")} Previous</button>
        <button class="primary-action fit" type="submit">${n+1>=s.length?"Submit assessment":"Save and continue"}</button>
      </div>
    </form>
  `}function Ft(e){return!(e!=null&&e.expiresAt)||String(e.status||"").toLowerCase()==="completed"?!1:Date.now()>new Date(e.expiresAt).getTime()}function jt(e){return`
    <div class="summary-grid">
      ${x("Overall",`${e.score||0}%`,"sparkles")}
      ${x("Technical",`${e.technical||0}%`,"clipboard-check")}
      ${x("DISC",String(e.disc||"Submitted"),"users")}
      ${x("Progress",e.progress||"70/70","timer")}
    </div>
    ${V("Assessment submitted","Nearwork is reviewing your answers. Your results are saved to your profile.")}
  `}function Gt(e,t){const s=e.questions||[],n=s.filter(c=>c.stage===1),a=s.filter(c=>c.stage===2),o=n.filter(c=>{var d;return typeof c.correctIndex=="number"&&Number((d=t[c.id])==null?void 0:d.value)===c.correctIndex}).length;return{technicalScore:n.length?Math.round(o/n.length*100):0,discScore:a.length?Math.round(a.filter(c=>t[c.id]).length/a.length*100):0}}function Vt(){var t;const e=((t=i.candidate)==null?void 0:t.cvLibrary)||[];return`
    <section class="section-block">
      <div class="section-heading"><div><p class="eyebrow">CV picker</p><h2>Store multiple resumes</h2></div></div>
      <form id="cvForm" class="upload-box">
        ${b("upload-cloud")}<strong>Upload a CV for this role</strong><p>Save multiple versions and pick the best one for each opening.</p>
        <input name="cv" type="file" accept=".pdf,.doc,.docx" required />
        <input name="label" type="text" placeholder="CV label, e.g. CSM resume" />
        <button class="primary-action fit" type="submit">Upload CV</button>
      </form>
      <div class="cv-list">
        ${e.length?e.map(s=>`<article class="cv-item">${b("file-text")}<div><strong>${s.name||s.fileName}</strong><span>${ge(s.uploadedAt)}</span></div>${s.url?`<a href="${s.url}" target="_blank" rel="noreferrer">Open</a>`:""}</article>`).join(""):V("No CVs saved yet","Upload role-specific resumes here.")}
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
          <div class="tip-actions">${e.actions.map(s=>`<small>${s}</small>`).join("")}</div>
          <strong>${e.read} read</strong>
        </article>
      `).join("")}
    </section>
  `}function zt(){var s,n;const t=(((s=i.candidate)==null?void 0:s.recruiter)||{}).bookingUrl||((n=i.candidate)==null?void 0:n.recruiterBookingUrl)||"mailto:support@nearwork.co?subject=Nearwork%20candidate%20question";return`
    <section class="content-grid">
      <div class="section-block"><div class="section-heading"><div><p class="eyebrow">Recruiter</p><h2>Your Nearwork contact</h2></div></div>${Qe(!0)}</div>
      <div class="section-block compact"><div class="section-heading"><div><p class="eyebrow">Booking</p><h2>Schedule soon</h2></div></div><p class="muted">Ask the Nearwork recruiting team for the earliest available slot. Candidate booking links can be attached to this profile later.</p><a class="primary-action fit" href="${t}" target="_blank" rel="noreferrer">${b("calendar-plus")} Book recruiter call</a></div>
    </section>
  `}function _t(){return Fe("profile")}function Fe(e="profile"){var d,u,m,g,l,r,p,h,y,N;const t=ae(),s=Pt(),n=Y[s.department]||[],a=le(((d=i.candidate)==null?void 0:d.salary)||((u=i.candidate)==null?void 0:u.salaryUSD)),o=Nt(),c=((m=i.candidate)==null?void 0:m.targetRole)||((g=i.candidate)==null?void 0:g.headline)||"";return`
    <section class="section-block">
      <div class="section-heading"><div><p class="eyebrow">${e==="onboarding"?"Setup":"Profile"}</p><h2>${e==="onboarding"?"Complete your account":"Improve your match quality"}</h2></div><span class="profile-score">${fe()}%</span></div>
      <form id="profileForm" class="profile-form">
        <div class="profile-card profile-identity wide">
          ${Oe("large")}
          <label>Profile photo <span class="optional-label">optional</span>
            <input name="photo" type="file" accept="image/png,image/jpeg,image/webp" />
          </label>
        </div>
        <label class="wide">Full name<input name="name" value="${S(((l=i.candidate)==null?void 0:l.name)||((r=i.user)==null?void 0:r.displayName)||"")}" /></label>
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
                ${Ue(o,c)}
              </select>
            </label>
          </div>
        </div>
        <div class="profile-card wide">
          <div class="field-label">Location</div>
          <div class="profile-card-grid">
            <label>Department
              <select name="department" id="departmentSelect">
                ${Object.keys(Y).map($=>`<option value="${S($)}" ${$===s.department?"selected":""}>${$}</option>`).join("")}
              </select>
            </label>
            <label>City
              <select name="city" id="citySelect">
                ${n.map($=>`<option value="${S($)}" ${$===s.city?"selected":""}>${$}</option>`).join("")}
              </select>
            </label>
          </div>
        </div>
        <div class="profile-card wide">
          <div class="field-label">Compensation and English</div>
          <div class="profile-card-grid">
            <label>Target monthly salary
              <div class="salary-field"><span>USD</span><input id="salaryInput" name="salary" value="${S(a.salary||"")}" inputmode="numeric" placeholder="1000" /></div>
            </label>
            <label>English level<select name="english">${["","B1","B2","C1","C2","Native"].map($=>{var T;return`<option value="${$}" ${((T=i.candidate)==null?void 0:T.english)===$?"selected":""}>${$||"Select level"}</option>`}).join("")}</select></label>
          </div>
        </div>
        <div class="profile-card wide">
          <div class="field-label">Contact</div>
          <div class="profile-card-grid">
            <label>WhatsApp number
              <input name="whatsapp" value="${S(((p=i.candidate)==null?void 0:p.whatsapp)||((h=i.candidate)==null?void 0:h.phone)||"")}" inputmode="tel" autocomplete="tel" placeholder="+57 300 123 4567" required />
            </label>
            <label>LinkedIn <span class="optional-label">optional</span>
              <input name="linkedin" value="${S(((y=i.candidate)==null?void 0:y.linkedin)||"")}" placeholder="https://linkedin.com/in/..." />
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
        <label class="wide">Summary <span class="optional-label">optional</span><textarea name="summary" placeholder="Add a short note about what you do best.">${((N=i.candidate)==null?void 0:N.summary)||""}</textarea></label>
        <input type="hidden" name="mode" value="${e}" />
        <button class="primary-action fit" type="submit">${b("save")} ${e==="onboarding"?"Finish setup":"Save profile"}</button>
      </form>
    </section>
  `}function fe(){const e=["name","targetRole","department","city","english","salary","whatsapp"],t=e.filter(s=>{var n,a,o,c;return s==="targetRole"?!!((n=i.candidate)!=null&&n.targetRole||!he((a=i.candidate)==null?void 0:a.headline)&&((o=i.candidate)!=null&&o.headline)):!!((c=i.candidate)!=null&&c[s])}).length+(ae().length?1:0);return Math.max(25,Math.round(t/(e.length+1)*100))}function je(){const e=i.applications[0];return(e==null?void 0:e.stage)||(e==null?void 0:e.status)||"profile"}function Ge(e){const t=Math.max(0,ke.findIndex(s=>e==null?void 0:e.toLowerCase().includes(s.key)));return`<div class="pipeline">${ke.map((s,n)=>`<article class="${n<=t?"done":""} ${n===t?"current":""}"><span>${n+1}</span><strong>${s.label}</strong><p>${s.help}</p></article>`).join("")}</div>`}function Ve(){return`
    <div class="empty-state">
      ${b("briefcase-business")}
      <strong>No active pipeline yet</strong>
      <p>Browse current openings and apply when you find a role that fits. Nearwork will show a pipeline here after an application moves forward.</p>
      <div class="empty-actions">
        <button class="primary-action fit" type="button" data-page="matches">${b("sparkles")} View matches</button>
        <a class="secondary-action" href="https://jobs.nearwork.co" target="_blank" rel="noreferrer">${b("external-link")} Open jobs</a>
      </div>
    </div>
  `}function x(e,t,s){return`<article class="metric"><span>${b(s)}</span><p>${e}</p><strong>${t}</strong></article>`}function Ht(e){const t=G(e),s=new Set(i.applications.map(n=>n.jobId||n.openingCode)).has(t.code);return`
    <article class="job-card">
      <div><div class="match-pill">${t.match}% match</div><h3>${t.title}</h3><p>${t.orgName} · ${t.location}</p></div>
      <p class="job-description">${t.description}</p>
      <div class="skill-row">${t.skills.slice(0,4).map(n=>`<span>${n}</span>`).join("")}</div>
      <div class="job-footer"><strong>${t.compensation}</strong><button class="secondary-action" type="button" data-apply="${t.code}" ${s?"disabled":""}>${s?"Applied":"Apply"}</button></div>
    </article>
  `}function Wt(e){return`<article class="timeline-item"><span>${b("circle-dot")}</span><div><strong>${e.jobTitle||e.title||"Application"}</strong><p>${e.clientName||e.company||"Nearwork"} · ${e.status||"submitted"}</p><small>${ge(e.updatedAt||e.createdAt)}</small></div></article>`}function j(e,t){return`<article class="info-card"><strong>${e}</strong><p>${t}</p></article>`}function Qe(e=!1){var o;const t=((o=i.candidate)==null?void 0:o.recruiter)||{},s=t.email||"support@nearwork.co",n=t.whatsapp||wt,a=t.whatsappUrl||bt;return`<article class="recruiter-card"><div class="avatar recruiter-avatar">NW</div><div><strong>${t.name||"Nearwork Support"}</strong><p><a href="mailto:${s}">${s}</a></p><p><a href="${a}" target="_blank" rel="noreferrer">WhatsApp ${n}</a></p>${e?"<span>Questions about assessments, interviews, feedback, or CV selection should go here.</span>":""}</div></article>`}function V(e,t){return`<div class="empty-state">${b("inbox")}<strong>${e}</strong><p>${t}</p></div>`}function Yt(){ue.innerHTML='<main class="loading-screen"><span class="logo-mark">N</span><p>Loading Talent...</p></main>'}function Jt(){var e,t,s,n,a,o,c,d,u,m,g;(e=document.querySelector("#signOut"))==null||e.addEventListener("click",async()=>{await at(U),window.history.pushState({page:"overview"},"","/"),w({user:null,candidate:null,applications:[],assessments:[],jobs:[],view:"login",activePage:"overview",message:""})}),(t=document.querySelector("#signIn"))==null||t.addEventListener("click",()=>{window.history.pushState({page:"overview"},"","/"),w({view:"login",activePage:"overview",message:""})}),document.querySelectorAll("[data-page]").forEach(l=>{l.addEventListener("click",()=>re(l.dataset.page))}),document.querySelector("#availability").addEventListener("change",async l=>{const r=l.target.value;w({candidate:{...i.candidate,availability:r}}),i.user&&H?await ft(i.user.uid,r):w({message:"Sign in with Google to save availability."})}),(s=document.querySelector("#filterMatches"))==null||s.addEventListener("click",()=>{var r,p,h;const l=!!((r=i.candidate)!=null&&r.targetRole||!he((p=i.candidate)==null?void 0:p.headline)&&((h=i.candidate)!=null&&h.headline)||ae().length);w({matchesFiltered:l?!i.matchesFiltered:!1,message:l?"":"Add your role and skills in Profile first, then filter openings."})}),(n=document.querySelector("#departmentSelect"))==null||n.addEventListener("change",l=>{const r=document.querySelector("#citySelect"),p=Y[l.target.value]||[];r.innerHTML=p.map(h=>`<option value="${S(h)}">${h}</option>`).join("")}),(a=document.querySelector("#roleGroupSelect"))==null||a.addEventListener("change",l=>{const r=document.querySelector("#targetRoleSelect");r.innerHTML=Ue(l.target.value,"")}),(o=document.querySelector("#salaryInput"))==null||o.addEventListener("blur",l=>{const r=le(l.target.value);r.salary&&(l.target.value=r.salary)}),document.querySelectorAll("[data-apply]").forEach(l=>{l.addEventListener("click",async()=>{const r=i.jobs.map(G).find(p=>p.code===l.dataset.apply);l.disabled=!0,l.textContent="Submitted",i.user&&H?(await ht(i.user.uid,r),await z(i.user),re("applications")):w({message:"Sign in with Google to apply to this opening."})})}),(c=document.querySelector("#startAssessment"))==null||c.addEventListener("click",async()=>{var r;const l=_()||((r=(i.assessments||[])[0])==null?void 0:r.id);if(!l||!i.user){w({message:"Please log in to start your assessment."});return}try{await mt(l,i.user.uid),await z(i.user)}catch(p){w({message:q(p)})}}),(d=document.querySelector("#prevAssessmentQuestion"))==null||d.addEventListener("click",async()=>{var y,N,$;const l=_()||((y=(i.assessments||[])[0])==null?void 0:y.id),r=(i.assessments||[]).find(T=>T.id===l),p=Math.max(0,Number((r==null?void 0:r.currentQuestionIndex)||0)-1),h=(N=r==null?void 0:r.questions)==null?void 0:N[p];await $e(l,"__progress__","",{currentQuestionIndex:p,totalQuestions:(($=r==null?void 0:r.questions)==null?void 0:$.length)||70,currentStage:(h==null?void 0:h.stage)||1}),await z(i.user)}),(u=document.querySelector("#assessmentQuestionForm"))==null||u.addEventListener("submit",async l=>{var Q;l.preventDefault();const r=_()||((Q=(i.assessments||[])[0])==null?void 0:Q.id),p=(i.assessments||[]).find(A=>A.id===r),h=(p==null?void 0:p.questions)||[],y=Number((p==null?void 0:p.currentQuestionIndex)||0),N=h[y],$=new FormData(l.currentTarget).get("answer");if(!N||$===null){w({message:"Select an answer before continuing."});return}const T={...p.answers||{},[N.id]:{value:Number($),answeredAt:new Date().toISOString()}};try{if(y+1>=h.length){const A=Gt(p,T);await gt(r,T,{totalQuestions:h.length,technicalScore:A.technicalScore,discScore:A.discScore,score:Math.round(A.technicalScore*.75+A.discScore*.25)})}else{const A=h[y+1];await $e(r,N.id,T[N.id],{currentQuestionIndex:y+1,totalQuestions:h.length,currentStage:(A==null?void 0:A.stage)||N.stage||1})}await z(i.user)}catch(A){w({message:q(A)})}}),(m=document.querySelector("#profileForm"))==null||m.addEventListener("submit",async l=>{var $,T,Q,A,ve,ye;l.preventDefault();const r=new FormData(l.currentTarget),p=r.get("department"),h=r.get("city"),y=le(r.get("salary")),N={name:r.get("name"),targetRole:r.get("targetRole"),headline:r.get("targetRole"),department:p,city:h,locationId:`${String(h).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g,"-")}-co`,location:`${h}, ${p}`,locationCity:h,locationDepartment:p,locationCountry:"Colombia",english:r.get("english"),salary:y.salary,salaryUSD:y.salaryUSD,linkedin:r.get("linkedin"),whatsapp:r.get("whatsapp"),phone:r.get("whatsapp"),skills:[...new Set([...r.getAll("skills"),...Ae(r.get("otherSkills"))])],otherSkills:Ae(r.get("otherSkills")),summary:r.get("summary"),email:(($=i.candidate)==null?void 0:$.email)||((T=i.user)==null?void 0:T.email)||"",availability:((Q=i.candidate)==null?void 0:Q.availability)||"open",onboarded:!0};if(!i.user){w({candidate:{...i.candidate,...N},message:"Preview updated. Sign in with Google to save this profile."});return}try{const B=r.get("photo");let we=((A=i.candidate)==null?void 0:A.photoURL)||((ve=i.user)==null?void 0:ve.photoURL)||"";B!=null&&B.name&&(we=await yt(i.user.uid,B));const K=r.get("profileCv");let F=null;K!=null&&K.name&&(F=await Ce(i.user.uid,K,r.get("profileCvLabel")));const se={...N,photoURL:we,...F?{activeCvId:F.id,activeCvName:F.name||F.fileName,cvLibrary:[...((ye=i.candidate)==null?void 0:ye.cvLibrary)||[],F]}:{}},ne=await vt(i.user.uid,se),_e=(ne==null?void 0:ne.atsSynced)===!1?"Profile saved. Nearwork will finish connecting it to your workspace.":"Profile saved.";r.get("mode")==="onboarding"?(window.history.pushState({page:"overview"},"","/"),w({candidate:{...i.candidate,...se},activePage:"overview",message:"Profile complete. Welcome to Talent."})):w({candidate:{...i.candidate,...se},message:_e})}catch(B){w({message:q(B)})}}),(g=document.querySelector("#cvForm"))==null||g.addEventListener("submit",async l=>{var h;l.preventDefault();const r=new FormData(l.currentTarget),p=r.get("cv");if(p!=null&&p.name){if(!i.user){w({message:"Sign in with Google to upload and store CVs."});return}try{const y=await Ce(i.user.uid,p,r.get("label"));w({candidate:{...i.candidate,cvLibrary:[...((h=i.candidate)==null?void 0:h.cvLibrary)||[],y],activeCvId:y.id},message:"CV uploaded."})}catch(y){w({message:q(y)})}}})}function ze(){if(i.loading)return Yt();if(i.view==="dashboard")return Et();Be()}window.addEventListener("popstate",()=>{const e=ee();e==="overview"&&!i.user?w({view:"login",activePage:"overview",message:""}):i.view==="dashboard"?re(e,!1):X()});H?(Ke(U,e=>{e?z(e):X()}),window.setTimeout(()=>{i.loading&&X()},2500)):X();
