import {
  applyToJob,
  auth,

  createUserWithEmailAndPassword,
  deleteOwnAccount,
  getCandidateForAuthUser,
  getCandidateAssessment,
  hasFirebaseConfig,
  listCandidateApplications,
  listCandidateAssessments,
  listOpenJobs,
  markNotificationRead,
  onAuthStateChanged,
  requestPasswordReset,
  saveAssessmentAnswer,
  saveNotificationPreferences,
  sendCandidateAccountCreatedEmail,
  signInWithEmailAndPassword,
  signOut,
  startCandidateAssessment,
  subscribeToNotifications,
  submitCandidateAssessment,
  updateCandidateAvailability,
  updateCandidateProfile,
  updateProfile,
  uploadCandidateCv,
  uploadCandidatePhoto,
  upsertCandidate,
  verifyPasswordResetCode,
  parseCvWithAffinda,
  signInWithHandoffToken
} from "./firebase.js";

// Holds data extracted by Affinda until the profile form is saved.
// Reset each time a new CV is selected or the profile form is submitted.
let _cvParsedData   = null;
let _cvOverwrite    = false;
let _pendingCvFile  = null; // CV file held across the setState re-render so submit can upload it

// ─── Onboarding wizard state ──────────────────────────────────────────────────
let _onbStep         = 1;
let _onbData         = {};   // accumulated answers from steps 1-4
let _onbCvFile       = null; // File object selected in step 1
let _onbParsePromise = null; // in-flight Affinda request
let _onbParsed       = null; // resolved Affinda result
let _onbInitialized  = false; // guards against wiping wizard progress on background re-renders

// ─── Unsaved profile changes guard ────────────────────────────────────────────
let _profileFormDirty = false;
let _pendingNavTarget  = null; // sidebar page key the candidate tried to navigate to while dirty

const app = document.querySelector("#app");
const SUPPORT_WHATSAPP = "+573135928691";
const SUPPORT_WHATSAPP_URL = "https://wa.me/573135928691";

const roleGroups = {
  "Customer Success": [
    "Customer Success Manager",
    "Customer Success Associate",
    "Account Manager",
    "Technical Account Manager",
    "Client Success Specialist",
    "Implementation Specialist",
    "Onboarding Specialist",
    "Renewals Manager"
  ],
  Sales: [
    "SDR / Sales Development Rep",
    "BDR / Business Development Rep",
    "Account Executive",
    "Inside Sales Representative",
    "Channel Sales Manager",
    "Sales Operations Specialist",
    "Revenue Operations Specialist",
    "Sales Manager"
  ],
  Support: [
    "Technical Support Specialist",
    "Customer Support Representative",
    "Help Desk Technician",
    "Escalations Specialist",
    "Support Team Lead",
    "QA Support Analyst"
  ],
  Operations: [
    "Operations Manager",
    "Operations Analyst",
    "Executive Assistant",
    "Administrative Assistant",
    "Virtual Assistant",
    "Office Manager",
    "Project Coordinator",
    "Procurement Specialist",
    "Logistics Coordinator",
    "Recruiting Coordinator"
  ],
  Marketing: [
    "Marketing Ops / Content Specialist",
    "Content Writer",
    "SEO Specialist",
    "Email Marketing Specialist",
    "Lifecycle Marketing Specialist",
    "Social Media Manager",
    "Graphic Designer",
    "Growth Marketing Specialist"
  ],
  Engineering: [
    "Software Developer (Full Stack)",
    "Frontend Developer",
    "Backend Developer",
    "Mobile Developer",
    "DevOps Engineer",
    "No-Code Developer",
    "Data Analyst",
    "Data Engineer",
    "QA Engineer",
    "Product Manager"
  ],
  Finance: [
    "Bookkeeper",
    "Accounting Assistant",
    "Accounts Payable / Receivable Specialist",
    "Financial Analyst",
    "FP&A Analyst",
    "Payroll Specialist",
    "Tax Analyst"
  ],
  "Human Resources": [
    "HR Generalist",
    "Recruiter / Talent Sourcer",
    "People Operations Specialist",
    "Payroll & Benefits Coordinator",
    "Learning & Development Coordinator"
  ],
  "Healthcare & Insurance": [
    "Insurance Account Manager",
    "Claims Specialist",
    "Medical Billing Specialist",
    "Healthcare Virtual Assistant",
    "Patient Coordinator"
  ],
  Other: [
    "Other / Not Listed"
  ]
};

const skillGroups = {
  "CRM & Sales": ["HubSpot", "Salesforce", "Pipedrive", "Apollo", "Outbound", "Cold Email", "Discovery Calls", "CRM Hygiene"],
  "Customer Success": ["SaaS", "Customer Success", "QBRs", "Onboarding", "Renewals", "Expansion", "Churn Reduction", "Intercom", "Zendesk"],
  Support: ["Technical Support", "Tickets", "Troubleshooting", "APIs", "Bug Reproduction", "Help Center", "CSAT"],
  Operations: ["Excel", "Google Sheets", "Reporting", "Process Design", "Project Management", "Notion", "Airtable", "Zapier"],
  Marketing: ["Content", "SEO", "Lifecycle", "Email Marketing", "HubSpot Marketing", "Copywriting", "Analytics"],
  Engineering: ["JavaScript", "React", "Node.js", "SQL", "Python", "REST APIs", "QA", "GitHub"],
  Language: ["English B2", "English C1", "English C2", "Spanish Native"]
};

const extendedSkillCatalog = [
  "Account Management", "Accounts Payable", "Accounts Receivable", "Adobe Creative Suite", "Agile", "AI Tools",
  "Analytics", "Appointment Setting", "B2B Sales", "B2C Sales", "Billing", "Bookkeeping", "Business Analysis",
  "Canva", "Cash Collections", "Chat Support", "Cold Calling", "Community Management", "Compliance",
  "Content Strategy", "Contract Management", "Customer Onboarding", "Customer Retention", "Customer Service",
  "Data Analysis", "Data Entry", "Email Support", "Excel / Google Sheets", "Executive Assistance", "Figma",
  "Financial Reporting", "Forecasting", "Helpdesk", "HR Operations", "Inbound Calls", "Insurance Support",
  "Lead Generation", "Live Chat", "Logistics", "Looker", "Microsoft Office", "NetSuite", "Outbound Calls",
  "Payroll", "Performance Marketing", "Power BI", "Product Support", "QuickBooks", "Recruiting",
  "Salesforce Administration", "Sales Operations", "Shopify", "Slack", "Social Media", "SQL Reporting",
  "Stripe", "Tableau", "Technical Writing", "Ticket Quality", "Training", "Vendor Management", "WordPress",
  "Workday", "Workforce Management", "Zendesk Guide", "Zoho"
];
const ALL_SKILLS = [...new Set([...Object.values(skillGroups).flat(), ...extendedSkillCatalog])]
  .sort((a, b) => a.localeCompare(b));

const colombiaLocations = {
  "Amazonas": ["El Encanto", "La Chorrera", "La Pedrera", "La Victoria", "Leticia", "Miriti - Paraná", "Puerto Alegría", "Puerto Arica", "Puerto Nariño", "Puerto Santander", "Tarapacá"],
  "Antioquia": ["Abejorral", "Abriaquí", "Alejandría", "Amagá", "Amalfi", "Andes", "Angelópolis", "Angostura", "Anorí", "Anza", "Apartadó", "Arboletes", "Argelia", "Armenia", "Barbosa", "Bello", "Belmira", "Betania", "Betulia", "Briceño", "Buriticá", "Cáceres", "Caicedo", "Caldas", "Campamento", "Cañasgordas", "Caracolí", "Caramanta", "Carepa", "Carmen de Viboral", "Carolina", "Caucasia", "Chigorodó", "Cisneros", "Ciudad Bolívar", "Cocorná", "Concepción", "Concordia", "Copacabana", "Dabeiba", "Don Matías", "Ebéjico", "El Bagre", "Entrerríos", "Envigado", "Fredonia", "Frontino", "Giraldo", "Girardota", "Gómez Plata", "Granada", "Guadalupe", "Guarne", "Guatapé", "Heliconia", "Hispania", "Itagüí", "Ituango", "Jardín", "Jericó", "La Ceja", "La Estrella", "La Pintada", "La Unión", "Liborina", "Maceo", "Marinilla", "Medellín", "Montebello", "Murindó", "Mutata", "Nariño", "Nechí", "Necoclí", "Olaya", "Peñol", "Peque", "Pueblorrico", "Puerto Berrío", "Puerto Nare", "Puerto Triunfo", "Remedios", "Retiro", "Rionegro", "Sabanalarga", "Sabaneta", "Salgar", "San Andrés", "San Carlos", "San Francisco", "San Jerónimo", "San José de la Montaña", "San Juan de Urabá", "San Luis", "San Pedro", "San Pedro de Urabá", "San Rafael", "San Roque", "San Vicente", "Santa Bárbara", "Santa Rosa de Osos", "Santafé de Antioquia", "Santo Domingo", "Santuario", "Segovia", "Sonsón", "Sopetrán", "Támesis", "Tarazá", "Tarso", "Titiribí", "Toledo", "Turbo", "Uramita", "Urrao", "Valdivia", "Valparaíso", "Vegachí", "Venecia", "Vigía del Fuerte", "Yalí", "Yarumal", "Yolombó", "Yondó", "Zaragoza"],
  "Arauca": ["Arauca", "Arauquita", "Cravo Norte", "Fortul", "Puerto Rondón", "Saravena", "Tame"],
  "Atlántico": ["Baranoa", "Barranquilla", "Campo de la Cruz", "Candelaria", "Galapa", "Juan de Acosta", "Luruaco", "Malambo", "Manatí", "Palmar de Varela", "Piojó", "Polonuevo", "Ponedera", "Puerto Colombia", "Repelón", "Sabanagrande", "Sabanalarga", "Santa Lucía", "Santo Tomás", "Soledad", "Suan", "Tubara", "Usiacurí"],
  "Bogotá D.C.": ["Bogotá"],
  "Bolívar": ["Achí", "Altos del Rosario", "Arenal", "Arjona", "Arroyohondo", "Barranco de Loba", "Calamar", "Cantagallo", "Carmen de Bolívar", "Cartagena", "Cicuco", "Clemencia", "Córdoba", "El Guamo", "El Peñón", "Hatillo de Loba", "Magangué", "Mahates", "Margarita", "María la Baja", "Mompós", "Montecristo", "Morales", "Pinillos", "Regidor", "Río Viejo", "San Cristóbal", "San Estanislao", "San Fernando", "San Jacinto", "San Jacinto del Cauca", "San Juan Nepomuceno", "San Martín de Loba", "San Pablo", "Santa Catalina", "Santa Rosa de Lima", "Santa Rosa del Sur", "Simití", "Soplaviento", "Talaigua Nuevo", "Tiquisio", "Turbaco", "Turbana", "Villanueva", "Zambrano"],
  "Boyacá": ["Almeida", "Aquitania", "Arcabuco", "Belén", "Berbeo", "Betéitiva", "Boavita", "Boyacá", "Briceño", "Buenavista", "Busbanzá", "Caldas", "Campohermoso", "Cerinza", "Chinavita", "Chiquinquirá", "Chíquiza", "Chiscas", "Chita", "Chitaraque", "Chivatá", "Chivor", "Ciénega", "Cómbita", "Coper", "Corrales", "Covarachía", "Cubará", "Cucaita", "Cuítiva", "Duitama", "El Cocuy", "El Espino", "Firavitoba", "Floresta", "Gachantivá", "Gameza", "Garagoa", "Guacamayas", "Guateque", "Guayatá", "Güicán", "Iza", "Jenesano", "Jericó", "La Capilla", "La Uvita", "La Victoria", "Labranzagrande", "Macanal", "Maripí", "Miraflores", "Mongua", "Monguí", "Moniquirá", "Motavita", "Muzo", "Nobsa", "Nuevo Colón", "Oicatá", "Otanche", "Pachavita", "Páez", "Paipa", "Pajarito", "Panqueba", "Pauna", "Paya", "Paz de Río", "Pesca", "Pisba", "Puerto Boyacá", "Quípama", "Ramiriquí", "Ráquira", "Rondón", "Saboyá", "Sáchica", "Samacá", "San Eduardo", "San José de Pare", "San Luis de Gaceno", "San Mateo", "San Miguel de Sema", "San Pablo Borbur", "Santa María", "Santa Rosa de Viterbo", "Santa Sofía", "Santana", "Sativanorte", "Sativasur", "Siachoque", "Soatá", "Socha", "Socotá", "Sogamoso", "Somondoco", "Sora", "Soracá", "Sotaquirá", "Susacón", "Sutamarchán", "Sutatenza", "Tasco", "Tenza", "Tibaná", "Tibasosa", "Tinjacá", "Tipacoque", "Toca", "Togüí", "Tópaga", "Tota", "Tunja", "Tununguá", "Turmequé", "Tuta", "Tutazá", "Umbita", "Ventaquemada", "Villa de Leyva", "Viracachá", "Zetaquira"],
  "Caldas": ["Aguadas", "Anserma", "Aranzazu", "Belalcázar", "Chinchiná", "Filadelfia", "La Dorada", "La Merced", "Manizales", "Manzanares", "Marmato", "Marquetalia", "Marulanda", "Neira", "Norcasia", "Pácora", "Palestina", "Pensilvania", "Riosucio", "Risaralda", "Salamina", "Samaná", "San José", "Supía", "Victoria", "Villamaría", "Viterbo"],
  "Caquetá": ["Albania", "Belén de los Andaquíes", "Cartagena del Chairá", "Currillo", "El Doncello", "El Paujil", "Florencia", "La Montañita", "Milán", "Morelia", "Puerto Rico", "San José del Fragua", "San Vicente del Caguán", "Solano", "Solita", "Valparaiso"],
  "Casanare": ["Aguazul", "Chameza", "Hato Corozal", "La Salina", "Maní", "Monterrey", "Nunchía", "Orocué", "Paz de Ariporo", "Pore", "Recetor", "Sabanalarga", "Sácama", "San Luis de Palenque", "Támara", "Tauramena", "Trinidad", "Villanueva", "Yopal"],
  "Cauca": ["Almaguer", "Argelia", "Balboa", "Bolívar", "Buenos Aires", "Cajibío", "Caldono", "Caloto", "Corinto", "El Tambo", "Florencia", "Guapi", "Inzá", "Jambalo", "La Sierra", "La Vega", "Lopez", "Mercaderes", "Miranda", "Morales", "Padilla", "Paez", "Patia", "Piamonte", "Piendamo", "Popayán", "Puerto Tejada", "Purace", "Rosas", "San Sebastian", "Santa Rosa", "Santander de Quilichao", "Silvia", "Sotara", "Suarez", "Sucre", "Timbio", "Timbiqui", "Toribio", "Totoro", "Villa Rica"],
  "Cesar": ["Aguachica", "Agustín Codazzi", "Astrea", "Becerril", "Bosconia", "Chimichagua", "Chiriguaná", "Curumaní", "El Copey", "El Paso", "Gamarra", "González", "La Gloria", "La Jagua de Ibirico", "La Paz", "Manaure", "Pailitas", "Pelaya", "Pueblo Bello", "Río de Oro", "San Alberto", "San Diego", "San Martín", "Tamalameque", "Valledupar"],
  "Chocó": ["Acandí", "Alto Baudó", "Atrato", "Bagadó", "Bahía Solano", "Bajo Baudó", "Belén de Bajirá", "Bojayá", "Cantón de San Pablo", "Carmen del Darién", "Cértegui", "Condoto", "El Carmen de Atrato", "El Litoral del San Juan", "Istmina", "Juradó", "Lloró", "Medio Atrato", "Medio Baudó", "Medio San Juan", "Nóvita", "Nuquí", "Quibdó", "Río Iró", "Río Quito", "Riosucio", "San José del Palmar", "Sipí", "Tadó", "Unguía", "Unión Panamericana"],
  "Córdoba": ["Ayapel", "Buenavista", "Canalete", "Cereté", "Chimá", "Chinú", "Ciénaga de Oro", "Cotorra", "La Apartada", "Lorica", "Los Córdobas", "Momil", "Moñitos", "Montelíbano", "Montería", "Planeta Rica", "Pueblo Nuevo", "Puerto Escondido", "Puerto Libertador", "Purísima", "Sahagún", "San Andrés de Sotavento", "San Antero", "San Bernardo del Viento", "San Carlos", "San Pelayo", "Tierralta", "Valencia"],
  "Cundinamarca": ["Agua de Dios", "Albán", "Anapoima", "Anolaima", "Apulo", "Arbeláez", "Beltrán", "Bituima", "Bojacá", "Cabrera", "Cachipay", "Cajicá", "Caparrapí", "Cáqueza", "Carmen de Carupa", "Chaguaní", "Chía", "Chipaque", "Choachí", "Chocontá", "Cogua", "Cota", "Cucunubá", "El Colegio", "El Peñón", "El Rosal", "Facatativá", "Fomeque", "Fosca", "Funza", "Fúquene", "Fusagasugá", "Gachala", "Gachancipá", "Gachetá", "Gama", "Girardot", "Granada", "Guachetá", "Guaduas", "Guasca", "Guataquí", "Guatavita", "Guayabal de Síquima", "Guayabetal", "Gutiérrez", "Jerusalén", "Junín", "La Calera", "La Mesa", "La Palma", "La Peña", "La Vega", "Lenguazaque", "Macheta", "Madrid", "Manta", "Medina", "Mosquera", "Nariño", "Nemocón", "Nilo", "Nimaima", "Nocaima", "Pacho", "Paime", "Pandi", "Paratebueno", "Pasca", "Puerto Salgar", "Puli", "Quebradanegra", "Quetame", "Quipile", "Ricaurte", "San Antonio de Tequendama", "San Bernardo", "San Cayetano", "San Francisco", "San Juan de Rioseco", "Sasaima", "Sesquilé", "Sibaté", "Silvania", "Simijaca", "Soacha", "Sopó", "Subachoque", "Suesca", "Supatá", "Susa", "Sutatausa", "Tabio", "Tausa", "Tena", "Tenjo", "Tibacuy", "Tibirita", "Tocaima", "Tocancipá", "Topaipí", "Ubalá", "Ubaque", "Ubaté", "Une", "Útica", "Venecia", "Vergara", "Vianí", "Villagómez", "Villapinzón", "Villeta", "Viotá", "Yacopí", "Zipacón", "Zipaquirá"],
  "Guainía": ["Barranco Minas", "Cacahual", "Inírida", "La Guadalupe", "Mapiripana", "Morichal", "Pana Pana", "Puerto Colombia", "San Felipe"],
  "Guaviare": ["Calamar", "El Retorno", "Miraflores", "San José del Guaviare"],
  "Huila": ["Acevedo", "Agrado", "Aipe", "Algeciras", "Altamira", "Baraya", "Campoalegre", "Colombia", "Elías", "Garzón", "Gigante", "Guadalupe", "Hobo", "Iquira", "Isnos", "La Argentina", "La Plata", "Nátaga", "Neiva", "Oporapa", "Paicol", "Palermo", "Palestina", "Pital", "Pitalito", "Rivera", "Saladoblanco", "San Agustín", "Santa María", "Suaza", "Tarqui", "Tello", "Teruel", "Tesalia", "Timaná", "Villavieja", "Yaguará"],
  "La Guajira": ["Albania", "Barrancas", "Dibulla", "Distracción", "El Molino", "Fonseca", "Hatonuevo", "La Jagua del Pilar", "Maicao", "Manaure", "Riohacha", "San Juan del Cesar", "Uribia", "Urumita", "Villanueva"],
  "Magdalena": ["Algarrobo", "Aracataca", "Ariguaní", "Cerro San Antonio", "Chibolo", "Ciénaga", "Concordia", "El Banco", "El Piñón", "El Reten", "Fundación", "Guamal", "Nueva Granada", "Pedraza", "Pijiño del Carmen", "Pivijay", "Plato", "Pueblo Viejo", "Remolino", "Sabanas de San Ángel", "Salamina", "San Sebastián de Buenavista", "San Zenón", "Santa Ana", "Santa Bárbara de Pinto", "Santa Marta", "Sitionuevo", "Tenerife", "Zapayán", "Zona Bananera"],
  "Meta": ["Acacías", "Barranca de Upía", "Cabuyaro", "Castilla la Nueva", "Cumaral", "El Calvario", "El Castillo", "El Dorado", "Fuente de Oro", "Granada", "Guamal", "La Macarena", "La Uribe", "Lejanías", "Mapiripán", "Mesetas", "Puerto Concordia", "Puerto Gaitán", "Puerto Lleras", "Puerto López", "Puerto Rico", "Restrepo", "San Carlos Guaroa", "San Juan de Arama", "San Juanito", "San Luis de Cubarral", "San Martín", "Villavicencio", "Vista Hermosa"],
  "Nariño": ["Albán", "Aldana", "Ancuyá", "Arboleda", "Barbacoas", "Belén", "Buesaco", "Chachagüí", "Colón", "Consacá", "Contadero", "Córdoba", "Cuaspud", "Cumbal", "Cumbitara", "El Charco", "El Peñol", "El Rosario", "El Tablón de Gómez", "El Tambo", "Francisco Pizarro", "Funes", "Guachucal", "Guaitarilla", "Gualmatán", "Iles", "Imues", "Ipiales", "La Cruz", "La Florida", "La Llanada", "La Tola", "La Unión", "Leiva", "Linares", "Los Andes", "Magüí Payán", "Mallama", "Mosquera", "Nariño", "Olaya Herrera", "Ospina", "Pasto", "Policarpa", "Potosí", "Providencia", "Puerres", "Pupiales", "Ricaurte", "Roberto Payán", "Samaniego", "San Bernardo", "San Lorenzo", "San Pablo", "San Pedro de Cartago", "Sandoná", "Santa Bárbara", "Santa Cruz", "Sapuyes", "Taminango", "Tangua", "Tumaco", "Túquerres", "Yacuanquer"],
  "Norte de Santander": ["Abrego", "Arboledas", "Bochalema", "Bucarasica", "Cachirá", "Cácota", "Chinácota", "Chitagá", "Convención", "Cúcuta", "Cucutilla", "Durania", "El Carmen", "El Tarra", "El Zulia", "Gramalote", "Hacarí", "Herrán", "La Esperanza", "La Playa", "Labateca", "Los Patios", "Lourdes", "Mutiscua", "Ocaña", "Pamplona", "Pamplonita", "Puerto Santander", "Ragonvalia", "Salazar", "San Calixto", "San Cayetano", "Santiago", "Sardinata", "Silos", "Teorama", "Tibú", "Toledo", "Villa Caro", "Villa del Rosario"],
  "Putumayo": ["Colón", "Mocoa", "Orito", "Puerto Asís", "Puerto Caicedo", "Puerto Guzmán", "Puerto Leguizamo", "San Francisco", "San Miguel", "Santiago", "Sibundoy", "Valle del Guamuez", "Villa Garzón"],
  "Quindío": ["Armenia", "Buenavista", "Calarcá", "Circasia", "Córdoba", "Filandia", "Génova", "La Tebaida", "Montenegro", "Pijao", "Quimbaya", "Salento"],
  "Risaralda": ["Apía", "Balboa", "Belén de Umbría", "Dosquebradas", "Guática", "La Celia", "La Virginia", "Marsella", "Mistrató", "Pereira", "Pueblo Rico", "Quinchía", "Santa Rosa de Cabal", "Santuario"],
  "San Andrés y Providencia": ["Providencia y Santa Catalina", "San Andrés"],
  "Santander": ["Aguada", "Albania", "Aratoca", "Barbosa", "Barichara", "Barrancabermeja", "Betulia", "Bolívar", "Bucaramanga", "Cabrera", "California", "Capitanejo", "Carcasí", "Cepitá", "Cerrito", "Charalá", "Charta", "Chima", "Chipatá", "Cimitarra", "Concepción", "Confines", "Contratación", "Coromoro", "Curití", "El Carmen de Chucurí", "El Guacamayo", "El Peñón", "El Playón", "Encino", "Enciso", "Florián", "Floridablanca", "Galán", "Gambita", "Girón", "Guaca", "Guadalupe", "Guapotá", "Guavatá", "Güepsa", "Hato", "Jesús María", "Jordán", "La Belleza", "La Paz", "Landázuri", "Lebríja", "Los Santos", "Macaravita", "Málaga", "Matanza", "Mogotes", "Molagavita", "Ocamonte", "Oiba", "Onzaga", "Palmar", "Palmas del Socorro", "Páramo", "Piedecuesta", "Pinchote", "Puente Nacional", "Puerto Parra", "Puerto Wilches", "Rionegro", "Sabana de Torres", "San Andrés", "San Benito", "San Gil", "San Joaquín", "San José de Miranda", "San Miguel", "San Vicente de Chucurí", "Santa Bárbara", "Santa Helena del Opón", "Simacota", "Socorro", "Suaita", "Sucre", "Surata", "Tona", "Valle de San José", "Vélez", "Vetas", "Villanueva", "Zapatoca"],
  "Sucre": ["Buenavista", "Caimito", "Chalán", "Coloso", "Corozal", "Coveñas", "El Roble", "Galeras", "Guaranda", "La Unión", "Los Palmitos", "Majagual", "Morroa", "Ovejas", "Palmito", "Sampués", "San Benito Abad", "San Juan Betulia", "San Marcos", "San Onofre", "San Pedro", "Santiago de Tolú", "Sincé", "Sincelejo", "Sucre", "Tolú Viejo"],
  "Tolima": ["Alpujarra", "Alvarado", "Ambalema", "Anzoátegui", "Armero", "Ataco", "Cajamarca", "Carmen de Apicalá", "Casabianca", "Chaparral", "Coello", "Coyaima", "Cunday", "Dolores", "Espinal", "Falan", "Flandes", "Fresno", "Guamo", "Herveo", "Honda", "Ibagué", "Icononzo", "Lérida", "Líbano", "Mariquita", "Melgar", "Murillo", "Natagaima", "Ortega", "Palocabildo", "Piedras", "Planadas", "Prado", "Purificación", "Rioblanco", "Roncesvalles", "Rovira", "Saldaña", "San Antonio", "San Luis", "Santa Isabel", "Suárez", "Valle de San Juan", "Venadillo", "Villahermosa", "Villarrica"],
  "Valle del Cauca": ["Alcalá", "Andalucía", "Ansermanuevo", "Argelia", "Bolívar", "Buenaventura", "Buga", "Bugalagrande", "Caicedonia", "Cali", "Calima", "Candelaria", "Cartago", "Dagua", "El Águila", "El Cairo", "El Cerrito", "El Dovio", "Florida", "Ginebra", "Guacarí", "Jamundí", "La Cumbre", "La Unión", "La Victoria", "Obando", "Palmira", "Pradera", "Restrepo", "Riofrío", "Roldanillo", "San Pedro", "Sevilla", "Toro", "Trujillo", "Tuluá", "Ulloa", "Versalles", "Vijes", "Yotoco", "Yumbo", "Zarzal"],
  "Vaupés": ["Carurú", "Mitú", "Pacoa", "Papunahua", "Taraira", "Yavaraté"],
  "Vichada": ["Cumaribo", "La Primavera", "Puerto Carreño", "Santa Rosalía"]
};

const tips = [
  {
    title: "How to answer salary questions",
    tag: "Interview",
    read: "4 min",
    body: "Use a confident range, anchor it to the role, and avoid apologizing for earning in USD.",
    actions: ["Know your floor", "Use monthly USD", "Mention flexibility last"]
  },
  {
    title: "Writing a CV for US SaaS companies",
    tag: "CV",
    read: "6 min",
    body: "Translate local experience into metrics US hiring managers can scan in under a minute.",
    actions: ["Lead with outcomes", "Add tools", "Quantify scope"]
  },
  {
    title: "Before your recruiter screen",
    tag: "Process",
    read: "3 min",
    body: "Prepare availability, compensation, English comfort, and two strong role stories.",
    actions: ["Check your setup", "Review the opening", "Bring questions"]
  },
  {
    title: "STAR stories that feel natural",
    tag: "Interview",
    read: "5 min",
    body: "Keep stories specific, concise, and tied to business impact instead of job duties.",
    actions: ["Situation", "Action", "Result"]
  }
];

const pipelineStages = [
  { key: "profile-review", label: "Profile Review", help: "We are checking role fit and your candidate profile." },
  { key: "background-check", label: "Background Checks", help: "Nearwork is verifying relevant background and work details." },
  { key: "assessment", label: "Assessment", help: "Complete role-specific questions when assigned." },
  { key: "interview", label: "Interview", help: "Meet the recruiter and book your next conversation." },
  { key: "presented", label: "Presented", help: "Your profile has been prepared for the company." },
  { key: "client-review", label: "Client Review", help: "The company is reviewing your profile and next steps." },
  { key: "hired", label: "Hired", help: "Offer accepted and onboarding is ready to begin." }
];

const CANDIDATE_STAGES = ["Applied", "Assessment", "Interview", "Final round", "Offer"];

let state = {
  user: null,
  candidate: null,
  applications: [],
  assessments: [],
  notifications: [],
  notificationPanelOpen: false,
  notificationSettingsOpen: false,
  jobs: [],
  loading: true,
  view: "login",
  activePage: "overview",
  matchesFiltered: false,
  message: "",
  assessmentUiStep: null,  // null | "techIntro" | "discIntro"
  showDeleteAccountModal: false,
  deleteAccountStatus: null,  // null | "deleting" | "error"
  deleteAccountError: "",
  showUnsavedChangesModal: false,
  resetCodeStatus: null,  // null | "resetting" | "error" | "success"
  resetCodeError: "",
};

let notificationUnsubscribe = null;

const restoredPath = sessionStorage.getItem("nw_restore_path");
if (restoredPath) {
  sessionStorage.removeItem("nw_restore_path");
  window.history.replaceState({ page: restoredPath }, "", restoredPath);
}

function navItems() {
  return [
    ["overview", "layout-dashboard", "Overview"],
    ["matches", "briefcase-business", "Matches"],
    ["applications", "send", "Applications"],
    ["assessment", "clipboard-check", "Assessment"],
    ["cvs", "files", "CV Picker"],
    ["tips", "book-open", "Tips"],
    ["recruiter", "calendar-days", "Recruiter"],
    ["profile", "user-round-cog", "Profile"]
  ];
}

function pageFromPath() {
  const parts = window.location.pathname.split("/").filter(Boolean);
  const segment = parts[0];
  if (segment === "onboarding") return "onboarding";
  if (segment === "assessment" || segment === "assessments") return "assessment";
  return navItems().some(([key]) => key === segment) ? segment : "overview";
}

function assessmentIdFromPath() {
  const parts = window.location.pathname.split("/").filter(Boolean);
  return (parts[0] === "assessment" || parts[0] === "assessments") ? parts[1] || "" : "";
}

function assessmentQuestionIndexFromPath() {
  const parts = window.location.pathname.split("/").filter(Boolean);
  const qIndex = parts.findIndex((part) => part === "q" || part === "question");
  if (qIndex === -1) return null;
  const value = Number(parts[qIndex + 1]);
  return Number.isFinite(value) && value > 0 ? value - 1 : null;
}

function assessmentQuestionUrl(assessmentId, questionIndex = 0) {
  return `/assessment/${encodeURIComponent(assessmentId)}/start/q/${Number(questionIndex || 0) + 1}`;
}

function setAssessmentQuestionUrl(assessmentId, questionIndex = 0, replace = false) {
  const url = assessmentQuestionUrl(assessmentId, questionIndex);
  if (window.location.pathname === url) return;
  const method = replace ? "replaceState" : "pushState";
  window.history[method]({ page: "assessment", assessmentId, questionIndex }, "", url);
}

function icon(name, label) {
  return `<i data-lucide="${name}" aria-label="${label || name}"></i>`;
}

let _lucideWaiting = false;

function syncIcons() {
  if (window.lucide) {
    window.lucide.createIcons();
    return;
  }
  if (_lucideWaiting) return;
  _lucideWaiting = true;
  const waitForLucide = () => {
    if (window.lucide) {
      window.lucide.createIcons();
      _lucideWaiting = false;
    } else {
      setTimeout(waitForLucide, 50);
    }
  };
  waitForLucide();
}

function setState(patch) {
  state = { ...state, ...patch };
  render();
}

function setActivePage(page, push = true) {
  const validPage = page === "onboarding" || navItems().some(([key]) => key === page);
  const nextPage = validPage ? page : "overview";
  state = { ...state, activePage: nextPage, matchesFiltered: nextPage === "matches" ? state.matchesFiltered : false, message: "", assessmentUiStep: null };
  if (push) {
    window.history.pushState({ page: nextPage }, "", nextPage === "overview" ? "/" : `/${nextPage}`);
  }
  render();
}

function firstName() {
  const name = state.candidate?.name || state.user?.displayName || "there";
  return name.split(" ")[0] || "there";
}

function initials() {
  const name = state.candidate?.name || state.user?.displayName || state.user?.email || "NW";
  return name.split(/[ @.]/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
}

function avatarMarkup(size = "normal") {
  const photoURL = state.candidate?.photoURL || state.user?.photoURL || "";
  const className = size === "large" ? "avatar avatar-large" : "avatar";
  return photoURL
    ? `<img class="${className}" src="${escapeAttr(photoURL)}" alt="${escapeAttr(firstName())}" />`
    : `<div class="${className}">${initials()}</div>`;
}

function escapeAttr(value) {
  return String(value || "").replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

function escapeHtml(value) {
  return String(value || "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
}

function formatDate(value) {
  if (!value) return "Recently";
  const date = value.toDate ? value.toDate() : new Date(value);
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(date);
}

function candidateSkills() {
  const skills = state.candidate?.skills || [];
  if (Array.isArray(skills)) return skills;
  return String(skills).split(",").map((skill) => skill.trim()).filter(Boolean);
}

function normalizeSkillName(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function matchingSkillsForJob(job, skills = candidateSkills()) {
  const role = normalizeRole(job);
  const jobSkills = new Set((role.skills || []).map(normalizeSkillName).filter(Boolean));
  const candidateSkillMap = new Map(skills.map((skill) => [normalizeSkillName(skill), skill]).filter(([key]) => key));
  return [...candidateSkillMap.keys()]
    .filter((skill) => jobSkills.has(skill))
    .map((skill) => candidateSkillMap.get(skill));
}

function otherSkillsText() {
  const otherSkills = state.candidate?.otherSkills || [];
  if (Array.isArray(otherSkills)) return otherSkills.join(", ");
  return String(otherSkills || "");
}

function parseOtherSkills(value) {
  return String(value || "")
    .split(",")
    .map((skill) => skill.trim())
    .filter(Boolean);
}

function isPlaceholderRole(value) {
  return ["Nearwork candidate", "Talent member"].includes(String(value || "").trim());
}

function isProfileComplete() {
  return profileCompletion() >= 100;
}

function dateFromValue(value) {
  if (!value) return null;
  if (value.toDate) return value.toDate();
  if (typeof value === "object" && typeof value.seconds === "number") return new Date(value.seconds * 1000);
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function assessmentStageName(stage) {
  return Number(stage || 1) === 1 ? "Technical Assessment" : "DISC Assessment";
}

function answerValueFor(assessment, question) {
  return assessment?.answers?.[question?.id]?.value ?? assessment?.answers?.[question?.id] ?? "";
}

function isAnsweredValue(value) {
  return value !== undefined && value !== null && value !== "";
}

function stageQuestions(assessment, stage) {
  return (assessment?.questions || []).slice(0, 70).filter((question) => Number(question.stage || 1) === Number(stage));
}

function missedQuestionsForStage(assessment, stage, answers = assessment?.answers || {}) {
  return stageQuestions(assessment, stage).filter((question) => !isAnsweredValue(answers[question.id]?.value ?? answers[question.id]));
}

function candidateHasPipeline() {
  return Boolean((state.applications || []).length || (state.candidate?.pipelineCodes || []).length || state.candidate?.pipelineCode);
}

function selectedLocation() {
  const department = state.candidate?.department || "Bogotá D.C.";
  const cities = colombiaLocations[department] || colombiaLocations["Bogotá D.C."] || ["Bogotá"];
  const city = state.candidate?.city || state.candidate?.locationCity || cities[0];
  return { department, city, label: `${city}, ${department}` };
}

function roleOptions() {
  return Object.entries(roleGroups).map(([group, roles]) => `
    <optgroup label="${escapeAttr(group)}">
      ${roles.map((role) => `<option value="${escapeAttr(role)}" ${state.candidate?.targetRole === role || state.candidate?.headline === role ? "selected" : ""}>${role}</option>`).join("")}
    </optgroup>
  `).join("");
}

function selectedRoleGroup() {
  const selectedRole = state.candidate?.targetRole || state.candidate?.headline || "";
  return Object.entries(roleGroups).find(([, roles]) => roles.includes(selectedRole))?.[0] || Object.keys(roleGroups)[0];
}

function roleGroupOptions(selectedGroup) {
  return Object.keys(roleGroups).map((group) => `<option value="${escapeAttr(group)}" ${group === selectedGroup ? "selected" : ""}>${group}</option>`).join("");
}

function roleOptionsForGroup(group, selectedRole) {
  const roles = roleGroups[group] || Object.values(roleGroups).flat();
  return [`<option value="">Choose the closest role</option>`]
    .concat(roles.map((role) => `<option value="${escapeAttr(role)}" ${selectedRole === role ? "selected" : ""}>${role}</option>`))
    .join("");
}

function canonicalSkillName(value) {
  // Strip trailing/leading punctuation (Affinda often returns "Salesforce," or "Agile.")
  const raw = String(value || "").replace(/[,.\s]+$/, "").replace(/^[,.\s]+/, "").trim();
  if (!raw || raw.length < 2) return "";
  const match = ALL_SKILLS.find((skill) => normalizeSkillName(skill) === normalizeSkillName(raw));
  if (match) return match;
  return raw.split(/\s+/).map((part) => part.length <= 3 && part === part.toUpperCase()
    ? part
    : part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()).join(" ");
}

function skillSearchMarkup(selectedSkills) {
  const selected = [...new Set((selectedSkills || []).map(canonicalSkillName).filter(Boolean))];
  const popular = ["Customer Service", "Salesforce", "HubSpot", "Excel", "Google Sheets", "Technical Support", "Outbound Calls", "React", "SQL", "Payroll"];
  return `
    <div class="skill-search-shell" data-skill-search>
      <div class="selected-skills" id="selectedSkills">
        ${selected.map((skill) => `
          <span class="selected-skill" data-skill-chip="${escapeAttr(skill)}">
            ${escapeHtml(skill)}
            <button type="button" class="skill-remove" data-remove-skill="${escapeAttr(skill)}" aria-label="Remove ${escapeAttr(skill)}">×</button>
            <input type="hidden" name="skills" value="${escapeAttr(skill)}" />
          </span>
        `).join("") || '<span class="skill-empty">Selected skills will appear here.</span>'}
      </div>
      <div class="skill-search-box">
        <input id="skillSearchInput" type="search" autocomplete="off" placeholder="Type any skill — e.g. Salesforce, Excel, B2B sales, Canva…" />
        <button class="secondary-action" type="button" id="addTypedSkill">Add skill</button>
      </div>
      <div class="skill-suggestions" id="skillSuggestions">
        ${popular.map((skill) => `<button type="button" class="skill-suggestion" data-skill="${escapeAttr(skill)}">${escapeHtml(skill)}</button>`).join("")}
      </div>
      <p class="field-hint">Select between 5 and 20 skills that best describe your experience.</p>
    </div>
  `;
}

function normalizeSalaryValue(value, currency = "USD") {
  const numeric = Number(String(value || "").replace(/[^\d.]/g, ""));
  const salaryCurrency = String(currency || "USD").toUpperCase() === "COP" ? "COP" : "USD";
  if (!Number.isFinite(numeric) || numeric <= 0) return { salary: "", salaryUSD: null, salaryCurrency, salaryAmount: null };
  const rounded = Math.round(numeric);
  const locale = salaryCurrency === "COP" ? "es-CO" : "en-US";
  return {
    salary: `$${new Intl.NumberFormat(locale).format(rounded)} ${salaryCurrency}/mo`,
    salaryUSD: salaryCurrency === "USD" ? rounded : null,
    salaryCurrency,
    salaryAmount: rounded
  };
}

function salaryNumberFromInput(value) {
  return Number(String(value || "").replace(/[^\d.]/g, ""));
}

function coerceSalaryCurrency(value, currency = "USD") {
  const amount = salaryNumberFromInput(value);
  const selectedCurrency = String(currency || "USD").toUpperCase() === "COP" ? "COP" : "USD";
  if (selectedCurrency === "USD" && amount >= 100000) return "COP";
  return selectedCurrency;
}

function formatSalaryInputValue(value, currency = "USD") {
  const amount = salaryNumberFromInput(value);
  if (!Number.isFinite(amount) || amount <= 0) return "";
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(Math.round(amount));
}

function normalizeList(value) {
  if (Array.isArray(value)) return value;
  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeRole(job) {
  const skills = normalizeList(job.skills || job.requiredSkills);
  return {
    id: job.id || job.code,
    code: job.code || job.id,
    title: job.title || job.role || job.openingTitle || "Open role",
    orgName: job.orgName || job.company || job.clientName || "Nearwork client",
    location: job.location || "Remote",
    compensation: job.compensation || job.salary || job.rate || "Competitive",
    match: job.match || null,
    skills,
    description: job.description || job.about || "Nearwork is reviewing candidates for this role now."
  };
}

function friendlyAuthError(error) {
  const code = error?.code || "";
  if (code.includes("operation-not-allowed")) return "This sign-in method is not available yet.";
  if (code.includes("unauthorized-domain")) return "This website still needs to be approved for sign-in.";
  if (code.includes("permission-denied")) return "We could not save this yet. Please try again in a moment or contact Nearwork support.";
  if (code.includes("weak-password")) return "Password must be at least 6 characters.";
  if (code.includes("invalid-credential") || code.includes("wrong-password")) return "That email/password did not match.";
  if (code.includes("user-not-found")) return "No account exists for that email yet.";
  if (code.includes("email-already-in-use")) return "That email already has an account. Sign in instead.";
  return "Something went wrong. Please try again or contact Nearwork support.";
}

const candidateTestimonials = [
  {
    initials: "CP",
    name: "Camila P.",
    role: "Product Designer",
    city: "Medellín",
    quote: "I doubled my income and kept living in Medellín. The whole process took 19 days from apply to signed offer.",
  },
  {
    initials: "AR",
    name: "Andrés R.",
    role: "SDR",
    city: "Bogotá",
    quote: "I went from chasing local leads to running outbound for a US SaaS team — same desk, way better pay.",
  },
  {
    initials: "LG",
    name: "Laura G.",
    role: "Customer Success Manager",
    city: "Cali",
    quote: "No recruiters ghosting me. One profile, real interviews, and an offer that actually matched the role.",
  },
  {
    initials: "FT",
    name: "Felipe T.",
    role: "Sales Ops Analyst",
    city: "Bucaramanga",
    quote: "The matching was spot on. I only talked to teams that fit what I was looking for, and signed within a month.",
  },
  {
    initials: "DV",
    name: "Daniela V.",
    role: "Account Executive",
    city: "Cartagena",
    quote: "Now I'm closing deals for a US company in USD, still based in Cartagena. Best career move I've made.",
  },
];

let testimonialTimer = null;

function renderShell(content) {
  if (testimonialTimer) clearInterval(testimonialTimer);
  const t0 = candidateTestimonials[0];
  app.innerHTML = `
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
          ${icon("quote")}
          <div class="testimonial-content">
            <p>"${t0.quote}"</p>
            <div class="testimonial-person">
              <span class="mini-avatar">${t0.initials}</span>
              <div><strong>${t0.name}</strong><small>${t0.role}, ${t0.city}</small></div>
            </div>
          </div>
          <div class="testimonial-dots">
            ${candidateTestimonials.map((_, i) => `<span class="testimonial-dot${i === 0 ? " is-active" : ""}"></span>`).join("")}
          </div>
        </div>
        <div class="stats-bar">
          <div><strong>60%</strong><small>Salary bump</small></div>
          <div><strong>21d</strong><small>To a US offer</small></div>
          <div><strong>USD</strong><small>Remote only</small></div>
        </div>
      </section>
      ${content}
    </main>
  `;
  syncIcons();

  let testimonialIndex = 0;
  testimonialTimer = setInterval(() => {
    const container = document.querySelector(".testimonial");
    if (!container) {
      clearInterval(testimonialTimer);
      testimonialTimer = null;
      return;
    }
    const content = container.querySelector(".testimonial-content");
    content.classList.add("is-flipping");
    setTimeout(() => {
      testimonialIndex = (testimonialIndex + 1) % candidateTestimonials.length;
      const t = candidateTestimonials[testimonialIndex];
      const quote = content.querySelector("p");
      const avatar = content.querySelector(".mini-avatar");
      const name = content.querySelector(".testimonial-person strong");
      const role = content.querySelector(".testimonial-person small");
      if (quote) quote.textContent = `"${t.quote}"`;
      if (avatar) avatar.textContent = t.initials;
      if (name) name.textContent = t.name;
      if (role) role.textContent = `${t.role}, ${t.city}`;
      container.querySelectorAll(".testimonial-dot").forEach((dot, i) => dot.classList.toggle("is-active", i === testimonialIndex));
      content.classList.remove("is-flipping");
    }, 320);
  }, 6000);
}

function renderLogin(mode = "login") {
  const isSignup = mode === "signup";
  if (testimonialTimer) clearInterval(testimonialTimer);
  testimonialTimer = null;
  app.innerHTML = `
    <main class="nw-login-grid">
      <!-- Story panel (left) -->
      <div class="nw-story-panel">
        <div class="nw-story-texture"></div>
        <div class="nw-story-glow"></div>
        <div class="nw-story-inner">
          <div class="nw-story-topbar">
            <div class="nw-wordmark-login">Near<span>work</span></div>
            <a class="nw-back-home" href="https://nearwork.co">${icon("arrow-left")} NEARWORK.CO</a>
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
            ${icon("shield-check")} 100% free for candidates · Your data stays private
          </div>
        </div>
      </div>

      <!-- Sign-in side (right) -->
      <div class="nw-signin-side">
        <div class="nw-signin-card">
          <div class="nw-mobile-wm">Near<span>work</span></div>
          <div class="nw-cand-chip"><span class="nw-cand-dot"></span>For candidates</div>
          <h2 class="nw-signin-heading">${isSignup ? "Create your account." : "Welcome back."}</h2>
          ${state.message ? `<div class="notice">${icon("lock")} ${escapeAttr(state.message)}</div>` : ""}
          ${hasFirebaseConfig ? "" : `<div class="notice">${icon("triangle-alert")} Sign-in is still being set up.</div>`}
          <form id="authForm" class="nw-auth-fields">
            ${isSignup ? `
            <div class="nw-field-wrap">
              <label class="nw-field-label" for="nameInput">Full name</label>
              <div class="nw-field-inner">
                <input id="nameInput" class="nw-field-input" name="name" type="text" autocomplete="name" placeholder="Full name" required />
              </div>
            </div>` : ""}
            <div class="nw-field-wrap">
              <label class="nw-field-label" for="emailInput">Email address</label>
              <div class="nw-field-inner">
                <input id="emailInput" class="nw-field-input" name="email" type="email" autocomplete="email" placeholder="you@example.com" required />
              </div>
            </div>
            <div class="nw-field-wrap">
              <div class="nw-field-label-row">
                <label class="nw-field-label" for="passwordInput">Password</label>
                ${isSignup ? "" : `<button type="button" id="resetPassword" class="nw-forgot-link">Forgot?</button>`}
              </div>
              <div class="nw-field-inner">
                <input id="passwordInput" class="nw-field-input" name="password" type="password" autocomplete="${isSignup ? "new-password" : "current-password"}" minlength="6" placeholder="••••••••" required />
                <button type="button" class="nw-pw-toggle" data-password-toggle aria-label="Show password">${icon("eye")}</button>
              </div>
            </div>
            ${isSignup ? `
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
            </div>` : ""}
            <button class="nw-signin-btn" type="submit">
              ${isSignup ? `${icon("user-plus")} Create account` : `Sign in ${icon("arrow-right")}`}
            </button>
            <p id="formMessage" class="form-message" role="status"></p>
          </form>
          <div class="nw-card-foot">
            ${icon("sparkles")}
            <button id="toggleMode" class="nw-create-link" type="button">${isSignup ? "Already have an account? Sign in" : "New or invited by Nearwork? Create your profile"}</button>
          </div>
          <a class="nw-back-jobs" href="https://jobs.nearwork.co" target="_blank" rel="noreferrer">${icon("arrow-left")} Back to job board</a>
        </div>
      </div>
    </main>
  `;
  syncIcons();

  document.querySelector("#toggleMode").addEventListener("click", () => renderLogin(isSignup ? "login" : "signup"));
  document.querySelectorAll("[data-password-toggle]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const input = btn.previousElementSibling;
      const show = input.type === "password";
      input.type = show ? "text" : "password";
      btn.innerHTML = icon(show ? "eye-off" : "eye");
      btn.setAttribute("aria-label", show ? "Hide password" : "Show password");
      syncIcons();
    });
  });
  document.querySelector("#resetPassword")?.addEventListener("click", async () => {
    const email = document.querySelector("input[name='email']").value.trim().toLowerCase();
    const message = document.querySelector("#formMessage");
    if (!email) {
      message.classList.remove("success");
      message.textContent = "Enter your email first, then request a reset link.";
      return;
    }
    try {
      await requestPasswordReset(email);
      message.classList.add("success");
      message.textContent = `Reset link sent! Check ${email} — it should arrive within a minute.`;
    } catch (error) {
      message.classList.remove("success");
      message.textContent = friendlyAuthError(error);
    }
  });
  document.querySelector("#authForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const message = document.querySelector("#formMessage");
    const email = String(form.get("email")).trim().toLowerCase();
    message.textContent = "";
    if (isSignup) {
      const privacyBox = document.querySelector("#privacyConsent");
      const privacyError = document.querySelector("#privacyConsentError");
      if (privacyBox && !privacyBox.checked) {
        if (privacyError) privacyError.style.display = "";
        message.textContent = "Please accept the Privacy Policy to continue.";
        return;
      }
      if (privacyError) privacyError.style.display = "none";
    }
    const marketingConsent = isSignup ? (document.querySelector("#marketingConsent")?.checked === true) : false;
    const consentAt = new Date().toISOString();
    try {
      if (isSignup) {
        const credential = await createUserWithEmailAndPassword(auth, email, form.get("password"));
        await updateProfile(credential.user, { displayName: form.get("name") });
        sessionStorage.setItem("nw_new_account", "1");
        await upsertCandidate(credential.user.uid, {
          name: form.get("name"),
          email,
          availability: "open",
          headline: "Nearwork candidate",
          onboarded: false,
          source: "talent.nearwork.co",
          privacyConsent: true,
          privacyConsentAt: consentAt,
          marketingConsent,
          marketingConsentAt: marketingConsent ? consentAt : null
        });
        await sendCandidateAccountCreatedEmail({
          name: form.get("name"),
          firstName: String(form.get("name") || "").trim().split(/\s+/)[0],
          email
        }).catch((e) => console.error("[NW] account email failed:", e?.message));
      } else {
        await signInWithEmailAndPassword(auth, email, form.get("password"));
      }
    } catch (error) {
      message.textContent = friendlyAuthError(error);
    }
  });
}

function renderResetPassword() {
  const params = new URLSearchParams(window.location.search);
  const token = params.get("token") || "";
  const email = params.get("email") || "";

  renderShell(`
    <section class="auth-panel">
      <div class="auth-top">
        <div class="right-brand">Near<span>work</span></div>
        <div class="candidate-chip">Candidate portal</div>
      </div>
      <div class="panel-heading">
        <h2>Set a new password.</h2>
        <p>${email ? `Resetting password for <strong>${escapeHtml(email)}</strong>. Choose a password you haven't used before.` : "Choose a new password you haven't used before."}</p>
      </div>
      ${!token ? `
        <div class="notice">${icon("triangle-alert")} This link is invalid or has already been used. Request a new one below.</div>
        <button class="primary-action" type="button" id="backToLogin">Back to sign in</button>
      ` : state.resetCodeStatus === "success" ? `
        <div class="notice">${icon("check-circle-2")} Password updated! Sign in with your new password.</div>
        <button class="primary-action" type="button" id="backToLogin">Sign in</button>
      ` : `
      <form id="resetForm" class="stacked-form">
        <div class="field-group">
          <label class="field-label" for="newPassword">New password</label>
          <div class="password-field">
            <input id="newPassword" name="newPassword" type="password" autocomplete="new-password" minlength="6" placeholder="••••••••" required />
            <button type="button" class="password-toggle" data-password-toggle aria-label="Show password">${icon("eye")}</button>
          </div>
        </div>
        <div class="field-group">
          <label class="field-label" for="confirmPassword">Confirm password</label>
          <div class="password-field">
            <input id="confirmPassword" name="confirmPassword" type="password" autocomplete="new-password" minlength="6" placeholder="••••••••" required />
            <button type="button" class="password-toggle" data-password-toggle aria-label="Show confirm">${icon("eye")}</button>
          </div>
        </div>
        ${state.resetCodeStatus === "error" ? `<div class="notice">${icon("triangle-alert")} ${escapeHtml(state.resetCodeError || "Something went wrong. Please request a new link.")}</div>` : ""}
        <button class="primary-action" type="submit" ${state.resetCodeStatus === "resetting" ? "disabled" : ""}>
          ${state.resetCodeStatus === "resetting" ? "Updating…" : `${icon("lock")} Set new password`}
        </button>
        <p id="formMessage" class="form-message" role="status"></p>
      </form>
      <button id="backToLogin" class="text-action" type="button">Back to sign in</button>
      `}
      <p class="auth-footer">© ${new Date().getFullYear()} Nearwork Inc. All rights reserved.</p>
    </section>
  `);

  document.querySelectorAll("[data-password-toggle]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const input = btn.previousElementSibling;
      const show = input.type === "password";
      input.type = show ? "text" : "password";
      btn.innerHTML = icon(show ? "eye-off" : "eye");
      btn.setAttribute("aria-label", show ? "Hide password" : "Show password");
      syncIcons();
    });
  });

  document.querySelector("#backToLogin")?.addEventListener("click", () => {
    const msg = state.resetCodeStatus === "success"
      ? "Your password has been reset. Sign in with your new password."
      : "";
    window.history.pushState({}, "", "/");
    setState({ view: "login", message: msg, resetCodeStatus: null, resetCodeError: "" });
  });

  document.querySelector("#resetForm")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const newPassword = document.querySelector("#newPassword").value;
    const confirmPassword = document.querySelector("#confirmPassword").value;
    if (newPassword !== confirmPassword) {
      setState({ resetCodeStatus: "error", resetCodeError: "Passwords do not match." });
      return;
    }
    if (newPassword.length < 6) {
      setState({ resetCodeStatus: "error", resetCodeError: "Password must be at least 6 characters." });
      return;
    }
    setState({ resetCodeStatus: "resetting" });
    try {
      const response = await fetch('/api/confirm-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.ok) throw new Error(data.error || 'Something went wrong. Please request a new link.');
      setState({ resetCodeStatus: "success" });
    } catch (error) {
      const msg = error?.message || "This link has expired or already been used. Please request a new one.";
      setState({ resetCodeStatus: "error", resetCodeError: msg });
    }
  });
}

async function loadDashboard(user) {
  setState({ loading: true, user });
  try {
    const [candidateResult, applicationsResult, jobsResult] = await Promise.allSettled([
      getCandidateForAuthUser(user),
      listCandidateApplications(user.uid),
      listOpenJobs()
    ]);
    const candidate = candidateResult.status === "fulfilled" ? candidateResult.value : null;
    const applications = applicationsResult.status === "fulfilled" ? applicationsResult.value : [];
    const jobs = jobsResult.status === "fulfilled" ? jobsResult.value : [];
    let assessments = [];
    try {
      assessments = await listCandidateAssessments(user.uid, user.email, candidate?.candidateCode || candidate?.code || "");
    } catch (error) {
      console.warn(error);
    }
    const directAssessmentId = assessmentIdFromPath();
    if (directAssessmentId && !assessments.some((assessment) => assessment.id === directAssessmentId)) {
      const directAssessment = await getCandidateAssessment(directAssessmentId, user.uid, user.email, candidate?.candidateCode || candidate?.code || "").catch(() => null);
      if (directAssessment) assessments = [directAssessment, ...assessments];
    }
    const isNewAccount = sessionStorage.getItem("nw_new_account") === "1";
    if (isNewAccount) sessionStorage.removeItem("nw_new_account");
    const hasTargetRole = Boolean(candidate?.targetRole || (!isPlaceholderRole(candidate?.headline) && candidate?.headline));
    const hasExistingData = Boolean(candidate?.cvUrl || candidate?.applications?.length || (candidate?.skills?.length >= 3));
    const skipWizard = candidate?.onboarded || hasTargetRole || hasExistingData;
    if (!candidate?.onboarded && skipWizard) {
      updateCandidateProfile(user.uid, { onboarded: true, candidateCode: candidate?.candidateCode }).catch(() => null);
    }
    const activePage = (isNewAccount && !skipWizard) ? "onboarding" : skipWizard ? pageFromPath() : "onboarding";
    setState({
      candidate: {
        ...(candidate || {}),
        name: candidate?.name || user.displayName || "Talent member",
        email: candidate?.email || user.email,
        availability: candidate?.availability || "open",
        headline: candidate?.headline || candidate?.targetRole || "Nearwork candidate"
      },
      applications,
      assessments,
      jobs: jobs.map(normalizeRole),
      loading: false,
      view: "dashboard",
      activePage,
      message: ""
    });
    if (notificationUnsubscribe) notificationUnsubscribe();
    if (hasFirebaseConfig) {
      notificationUnsubscribe = subscribeToNotifications(user.uid, (notifications) => {
        // Preserve any in-progress flash message (e.g. "Analysing your CV…")
        // so a live notification update doesn't wipe it mid-parse.
        state.notifications = notifications;
        if (state.view === "dashboard" && !state.message) renderDashboard();
      });
    }
  } catch (error) {
    console.warn(error);
    setState({
      candidate: {
        name: user.displayName || "Talent member",
        email: user.email,
        availability: "open",
        headline: "Nearwork candidate"
      },
      applications: [],
      assessments: [],
      jobs: [],
      loading: false,
      view: "dashboard",
      activePage: pageFromPath(),
      message: ""
    });
  }
}

async function loadPublicPage() {
  if (window.location.pathname === "/reset-password") {
    if (notificationUnsubscribe) notificationUnsubscribe();
    notificationUnsubscribe = null;
    setState({ user: null, candidate: null, loading: false, view: "reset-password", resetCodeStatus: null });
    return;
  }

  const activePage = pageFromPath();
  if (activePage === "assessment") {
    sessionStorage.setItem("nw_restore_path", window.location.pathname);
    setState({
      user: null,
      candidate: null,
      applications: [],
      assessments: [],
      jobs: [],
      loading: false,
      view: "login",
      activePage: "overview",
      message: "Please log in to open your assessment."
    });
    return;
  }
  if (activePage === "overview") {
    if (notificationUnsubscribe) notificationUnsubscribe();
    notificationUnsubscribe = null;
    setState({ user: null, candidate: null, loading: false, view: "login", activePage: "overview" });
    return;
  }

  let jobs = [];
  try {
    const openings = await listOpenJobs();
    if (openings.length) jobs = openings.map(normalizeRole);
  } catch (error) {
    console.warn(error);
  }

  setState({
    user: null,
    candidate: null,
    applications: [],
    assessments: [],
    jobs,
    loading: false,
    view: "login",
    activePage: "overview",
    message: "Please log in to view your profile, matched openings, applications, and assessments."
  });
}

// ─── V2 nav sections (grouped for the new sidebar) ───────────────────────────
function navSections() {
  return [
    { label: "My journey", items: [
      ["overview",     "layout-dashboard",  "Overview"],
      ["applications", "send",              "Applications"],
      ["assessment",   "clipboard-check",   "Assessment"],
    ]},
    { label: "My search", items: [
      ["matches", "briefcase-business", "Matches"],
      ["cvs",     "files",              "CV Picker"],
    ]},
    { label: "Support", items: [
      ["tips",      "book-open",       "Tips"],
      ["recruiter", "calendar-days",   "Recruiter"],
      ["profile",   "user-round-cog",  "Profile"],
    ]},
  ];
}

function availabilityLabel() {
  return { open: "Open to roles", interviewing: "Interviewing", paused: "Not looking" }[state.candidate?.availability || "open"] || "Open to roles";
}

function profileChecklist() {
  const c = state.candidate || {};
  const skills = candidateSkills();
  return [
    { id: "name",     label: "Full name",    done: Boolean(c.name) },
    { id: "role",     label: "Target role",  done: Boolean(c.targetRole || (!isPlaceholderRole(c.headline) && c.headline)) },
    { id: "location", label: "City",         done: Boolean(c.city) },
    { id: "salary",   label: "Salary",       done: Boolean(c.salaryAmount || c.salary) },
    { id: "english",  label: "English",      done: Boolean(c.english) },
    { id: "whatsapp", label: "WhatsApp",     done: Boolean(c.whatsapp || c.phone) },
    { id: "skills",   label: "Skills (5-20)", done: skills.length >= 5 },
    { id: "cv",       label: "CV",           done: Boolean(c.cvUrl) },
  ];
}

function renderDashboard() {
  const unreadNotifications = (state.notifications || []).filter((item) => !item.read).length;
  const avail = state.candidate?.availability || "open";
  const availDotColors = { open: "#10A07C", interviewing: "#EAB308", paused: "#9AA0A6" };
  const dotColor = availDotColors[avail] || "#10A07C";
  const name = state.candidate?.name || state.user?.displayName || "Talent member";
  const headline = state.candidate?.headline || state.candidate?.targetRole || "Nearwork candidate";

  app.innerHTML = `
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
          ${navSections().map(sec => `
            <div class="nw-nav-group">
              <div class="nw-nav-group-label">${sec.label}</div>
              ${sec.items.map(([key, iconName, label]) => `
                <button class="nw-nav-item${state.activePage === key ? " active" : ""}" data-page="${key}" type="button">
                  ${icon(iconName)} ${label}
                </button>
              `).join("")}
            </div>
          `).join("")}
          <div class="nw-nav-group">
            <a class="nw-nav-item nw-nav-external" href="https://jobs.nearwork.co" target="_blank" rel="noreferrer">
              ${icon("external-link")} Browse jobs
            </a>
          </div>
        </nav>

        <!-- Profile card -->
        <div class="nw-sidebar-profile">
          ${avatarMarkup()}
          <div class="nw-sidebar-profile-text">
            <div class="nw-sidebar-profile-name">${escapeHtml(name)}</div>
            <div class="nw-sidebar-profile-role">${escapeHtml(headline)}</div>
          </div>
        </div>

        <!-- Sign out -->
        <button id="${state.user ? "signOut" : "signIn"}" class="nw-sidebar-signout" type="button">
          ${icon(state.user ? "log-out" : "log-in")} ${state.user ? "Sign out" : "Sign in"}
        </button>
      </aside>

      <!-- ── Main workspace ── -->
      <section class="nw-workspace">

        <!-- Top bar -->
        <div class="nw-topbar">
          <div class="nw-topbar-search">
            ${icon("search")}
            <input class="nw-search-input" placeholder="Search roles, companies, skills…" tabindex="-1" />
          </div>
          <div class="nw-topbar-right">
            <!-- Availability pill (wraps the real select for functionality) -->
            <div class="nw-avail-pill">
              <span class="nw-avail-dot" style="background:${dotColor};box-shadow:0 0 0 3px ${dotColor}26;"></span>
              <span class="nw-avail-label">${availabilityLabel()}</span>
              ${icon("chevron-down")}
              <select id="availability" class="nw-avail-select" aria-label="Availability">
                <option value="open"         ${avail === "open"         ? "selected" : ""}>Open to roles</option>
                <option value="interviewing" ${avail === "interviewing" ? "selected" : ""}>Interviewing</option>
                <option value="paused"       ${avail === "paused"       ? "selected" : ""}>Not looking</option>
              </select>
            </div>

            <!-- Notifications -->
            <div class="nw-notif-wrap">
              <button class="nw-icon-btn" type="button" id="notificationBell" aria-label="Notifications">
                ${icon("bell")}
                ${unreadNotifications ? `<span class="nw-notif-badge"></span>` : ""}
              </button>
              ${state.notificationPanelOpen ? renderNotificationPanel() : ""}
            </div>
            <button class="nw-icon-btn" type="button" id="notificationSettings" aria-label="Settings">
              ${icon("settings")}
            </button>
          </div>
        </div>

        <!-- Notification settings -->
        ${state.notificationSettingsOpen ? renderNotificationSettings() : ""}

        <!-- Page content -->
        ${state.message ? `<div class="notice" style="margin:0 36px;">${state.message}</div>` : ""}
        <div class="nw-page-content">
          ${(() => { try { return renderActivePage(); } catch (err) { console.error("renderActivePage error:", err); return `<div class="notice">Page failed to render. <button type="button" data-page="overview">Go to overview</button></div>`; } })()}
        </div>
      </section>
    </main>
  `;
  syncIcons();
  bindDashboardEvents();
  syncAssessmentRouteToActive();
  setupAssessmentTimer();
}

function notificationTime(value) {
  const date = value?.toDate ? value.toDate() : new Date(value || Date.now());
  return date.toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });
}

function renderNotificationPanel() {
  const items = (state.notifications || []).slice(0, 10);
  return `
    <div class="notification-panel">
      <div class="notification-panel-head"><strong>Notifications</strong><span>${items.length ? "Latest updates" : "All clear"}</span></div>
      ${items.length ? items.map((item) => `
        <button class="notification-item ${item.read ? "" : "unread"}" type="button" data-notification-read="${item.id}">
          <strong>${escapeAttr(item.title || "Nearwork update")}</strong>
          <span>${escapeAttr(item.message || "")}</span>
          <time>${notificationTime(item.createdAt)}</time>
        </button>
      `).join("") : `<div class="notification-empty">No notifications yet.</div>`}
    </div>
  `;
}

function renderNotificationSettings() {
  const preferences = state.candidate?.notificationPreferences || {};
  const rows = [
    ["recruitmentUpdates", "Recruitment updates"],
    ["assessmentUpdates", "Assessment updates"],
    ["mentions", "Mentions"],
    ["openingMovement", "Opening movement"],
    ["jobAlerts", "Similar role alerts"]
  ];
  return `
    <section class="notification-settings-card">
      <div class="section-heading"><div><p class="eyebrow">Settings</p><h2>Notification preferences</h2></div></div>
      <div class="notification-settings-grid">
        ${rows.map(([key, label]) => {
          const pref = preferences[key] || {};
          return `<div class="notification-setting-row">
            <strong>${label}</strong>
            <label><input type="checkbox" data-notification-pref="${key}" data-channel="app" ${pref.app !== false ? "checked" : ""}> In-app</label>
            <label><input type="checkbox" data-notification-pref="${key}" data-channel="email" ${pref.email !== false ? "checked" : ""}> Email</label>
          </div>`;
        }).join("")}
      </div>
      <p class="field-hint">Email notifications are grouped with a 2-hour buffer. The bell always keeps the detailed history with date and time.</p>
    </section>
  `;
}

let assessmentTimerInterval = null;

function setupAssessmentTimer() {
  if (assessmentTimerInterval) window.clearInterval(assessmentTimerInterval);
  const timer = document.querySelector("#assessmentTimer");
  if (!timer) return;
  const endTime = new Date(timer.dataset.end || "").getTime();
  const updateTimer = () => {
    const remaining = Math.max(0, endTime - Date.now());
    const totalSeconds = Math.floor(remaining / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = String(totalSeconds % 60).padStart(2, "0");
    timer.textContent = `${minutes}:${seconds}`;
    timer.classList.toggle("is-low", remaining <= 10 * 60 * 1000);
    if (remaining <= 0) window.clearInterval(assessmentTimerInterval);
  };
  updateTimer();
  assessmentTimerInterval = window.setInterval(updateTimer, 1000);
}

function syncAssessmentRouteToActive() {
  if (state.activePage !== "assessment") return;
  const assessments = state.assessments || [];
  const directId = assessmentIdFromPath();
  const directAssessment = directId ? assessments.find((assessment) => assessment.id === directId) : null;
  const activeAssessment = directAssessment || assessments.find((assessment) => ["sent", "started"].includes(String(assessment.status || "").toLowerCase()));
  if (!activeAssessment?.id) return;
  const status = String(activeAssessment.status || "").toLowerCase();
  if (status === "started" && assessmentQuestionIndexFromPath() === null) {
    setAssessmentQuestionUrl(activeAssessment.id, Number(activeAssessment.currentQuestionIndex || 0), true);
    return;
  }
  if (!directId && status === "sent") {
    const url = `/assessment/${encodeURIComponent(activeAssessment.id)}/start`;
    window.history.replaceState({ page: "assessment", assessmentId: activeAssessment.id }, "", url);
  }
}

function pageTitle() {
  const map = {
    onboarding: "Complete your candidate profile",
    overview: `Hi ${firstName()}, here's your process`,
    matches: "Role matches",
    applications: "Application pipeline",
    assessment: "Assessment center",
    cvs: "CV picker",
    tips: "Interview tips",
    recruiter: "Your recruiter",
    profile: "Candidate profile"
  };
  return map[state.activePage] || "Talent";
}

function renderActivePage() {
  const pages = {
    onboarding: renderOnboarding,
    overview: renderOverview,
    matches: renderMatches,
    applications: renderApplications,
    assessment: renderAssessment,
    cvs: renderCvs,
    tips: renderTips,
    recruiter: renderRecruiter,
    profile: renderProfile
  };
  return (pages[state.activePage] || renderOverview)();
}

function renderOverview() {
  const completion  = profileCompletion();
  const checklist   = profileChecklist();
  const done        = checklist.filter(c => c.done).length;
  const total       = checklist.length;
  const apps        = state.applications || [];
  const actionsNeeded = apps.filter(a => ["action-needed", "interview-scheduled", "assessment-sent"].includes(String(a.status || "").toLowerCase())).length;
  const jobs        = (state.jobs || []).slice(0, 3);
  const recruiter   = state.candidate?.recruiter || {};

  // SVG donut: r=52, circumference≈326.7
  const circ    = 2 * Math.PI * 52;
  const offset  = circ * (1 - completion / 100);

  const now = new Date();
  const dateStr = now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  const statTile = (label, value, sub, color, iconName) => `
    <div class="nw-stat-tile">
      <div class="nw-stat-tile-top">
        <span class="nw-stat-tile-label">${label}</span>
        <div class="nw-stat-icon" style="background:${color}14;">
          ${icon(iconName)}
        </div>
      </div>
      <div class="nw-stat-value">${value}</div>
      <div class="nw-stat-sub">${sub}</div>
    </div>`;

  const appRow = (app, isLast) => {
    const rawStage = String(app.stage || app.status || "applied").toLowerCase();
    const stageIdx = rawStage.includes("offer") ? 4 : rawStage.includes("final") ? 3 : rawStage.includes("interview") ? 2 : rawStage.includes("assessment") ? 1 : 0;
    const company  = app.clientName || app.company || "Nearwork client";
    const initials = company.split(/\s+/).slice(0, 2).map(w => w[0]).join("").toUpperCase();
    const companyColors = ["#10A07C", "#EC4E7E", "#3B82F6", "#F4A52E", "#8B5CF6"];
    const bg = companyColors[company.length % companyColors.length];
    return `
      <div class="nw-app-row${isLast ? " last" : ""}">
        <div class="nw-app-avatar" style="background:${bg};">${initials}</div>
        <div class="nw-app-info">
          <div class="nw-app-title">${escapeHtml(app.jobTitle || app.title || "Application")} <span class="nw-app-company">· ${escapeHtml(company)}</span></div>
          <div class="nw-app-stages">
            ${CANDIDATE_STAGES.map((s, i) => `<div class="nw-stage-pip${i <= stageIdx ? " done" : ""}"></div>`).join("")}
            <span class="nw-app-stage-label">${app.stage || app.status || "Applied"}</span>
          </div>
        </div>
        <div class="nw-app-meta">
          <span class="nw-app-status${actionsNeeded ? " action" : ""}">${app.status || "In review"}</span>
          <div class="nw-app-date">${formatDate(app.updatedAt || app.createdAt)}</div>
        </div>
        ${icon("chevron-right")}
      </div>`;
  };

  const matchCard = (job) => {
    const role   = normalizeRole(job);
    const matched = matchingSkillsForJob(role);
    const score  = role.match || (matched.length >= 3 ? Math.min(97, 70 + matched.length * 4) : null);
    const companyColors = ["#10A07C", "#EC4E7E", "#3B82F6", "#F4A52E"];
    const bg = companyColors[role.orgName.length % companyColors.length];
    const initials = role.orgName.split(/\s+/).slice(0, 2).map(w => w[0]).join("").toUpperCase();
    const openingUrl = `https://jobs.nearwork.co/apply?code=${encodeURIComponent(role.code)}`;
    return `
      <div class="nw-match-card">
        <div class="nw-match-card-top">
          <div class="nw-match-avatar" style="background:${bg};">${initials}</div>
          ${score ? `<div class="nw-match-score">${score}%</div>` : ""}
        </div>
        <div class="nw-match-role">${escapeHtml(role.title)}</div>
        <div class="nw-match-company">${escapeHtml(role.orgName)} · ${escapeHtml(role.location)}</div>
        ${matched.length ? `<div class="nw-match-why">${matched.slice(0,3).map(escapeHtml).join(" · ")} match</div>` : `<div class="nw-match-why">${escapeHtml(role.description).slice(0, 80)}…</div>`}
        <div class="nw-match-footer">
          <span class="nw-match-salary">${escapeHtml(role.compensation)}</span>
          <button type="button" class="nw-match-apply" data-apply="${escapeAttr(role.code)}">Apply ${icon("arrow-right")}</button>
        </div>
      </div>`;
  };

  return `
    <!-- Greeting -->
    <div class="nw-overview-header">
      <div class="nw-overview-date">Overview · ${dateStr}</div>
      <h1 class="nw-overview-greeting">
        Hi ${escapeHtml(firstName())},
        ${actionsNeeded > 0
          ? `<span class="nw-greeting-muted">you have</span> <span class="nw-greeting-accent">${actionsNeeded} thing${actionsNeeded > 1 ? "s" : ""}</span> <span class="nw-greeting-muted">that need you.</span>`
          : `<span class="nw-greeting-muted">let's get you matched.</span>`}
      </h1>
    </div>

    <!-- Readiness card -->
    ${done >= total ? "" : `
    <div class="nw-readiness-card">
      <div class="nw-readiness-donut">
        <svg viewBox="0 0 120 120" style="width:100%;height:100%;transform:rotate(-90deg);">
          <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,0.25)" stroke-width="8"/>
          <circle cx="60" cy="60" r="52" fill="none" stroke="#FFFFFF" stroke-width="8"
            stroke-dasharray="${circ.toFixed(1)}" stroke-dashoffset="${offset.toFixed(1)}"
            stroke-linecap="round"/>
        </svg>
        <div class="nw-readiness-pct">
          <span class="nw-readiness-num">${completion}<span class="nw-readiness-pct-sign">%</span></span>
          <span class="nw-readiness-ready">ready</span>
        </div>
      </div>
      <div class="nw-readiness-body">
        <div class="nw-readiness-overline">Profile readiness</div>
        <h2 class="nw-readiness-title">${total - done} more step${total - done > 1 ? "s" : ""} and Nearwork can boost your matches.</h2>
        <div class="nw-readiness-checklist">
          ${checklist.map(c => `
            <div class="nw-check-pill${c.done ? " done" : ""}">
              ${icon(c.done ? "check" : "circle")} ${c.label}
            </div>`).join("")}
        </div>
        <div class="nw-readiness-actions">
          <button class="nw-finish-btn" type="button" data-page="profile">
            Finish profile ${icon("arrow-right")}
          </button>
          <span class="nw-readiness-count">${done} of ${total} complete</span>
        </div>
      </div>
    </div>`}

    <!-- Stat tiles -->
    <div class="nw-stat-grid">
      ${statTile("Open matches",  state.jobs.length,               state.jobs.length ? `${state.jobs.length} role${state.jobs.length > 1 ? "s" : ""} waiting`    : "Complete profile to unlock", "#10A07C", "sparkles")}
      ${statTile("Applications",  apps.length,                     apps.length ? `${actionsNeeded || "0"} need your input`                                        : "Not applied yet",             "#EC4E7E", "send")}
      ${statTile("Interviews",    apps.filter(a => String(a.stage || a.status || "").toLowerCase().includes("interview")).length, "Scheduled",                               "Not yet scheduled",            "#F4A52E", "calendar-clock")}
      ${statTile("CVs saved",     (state.candidate?.cvLibrary || []).length, "In your library",                                                                   "Upload your first CV",         "#3B82F6", "files")}
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
          ${apps.length ? `<button class="nw-ghost-btn" type="button" data-page="applications">All applications ${icon("arrow-right")}</button>` : ""}
        </div>
        ${apps.length
          ? apps.slice(0, 4).map((app, i) => appRow(app, i === Math.min(apps.length, 4) - 1)).join("")
          : `<div class="nw-empty">
              ${icon("briefcase")}
              <strong>No active pipeline yet</strong>
              <p>Browse openings and apply — we'll show your pipeline here once an application moves forward.</p>
              <div style="display:flex;gap:8px;margin-top:12px;">
                <button class="nw-btn-primary" type="button" data-page="matches">${icon("sparkles")} View matches</button>
                <a class="nw-btn-secondary" href="https://jobs.nearwork.co" target="_blank" rel="noreferrer">${icon("external-link")} Open jobs</a>
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
            ${icon("bell")}
            <strong>Nothing yet</strong>
            <p>Movement on your search lands here.</p>
          </div>
        </section>

        <!-- Recruiter card (dark) -->
        <section class="nw-recruiter-dark">
          <div class="nw-recruiter-overline">Your talent partner</div>
          <div class="nw-recruiter-row">
            <div class="nw-recruiter-avatar">${recruiter.initials || "NW"}</div>
            <div>
              <div class="nw-recruiter-name">${escapeHtml(recruiter.name || "Nearwork Support")}</div>
              <div class="nw-recruiter-role">${escapeHtml(recruiter.role || "Talent Partner")}</div>
            </div>
          </div>
          <p class="nw-recruiter-bio">I'll review every match and prep you before each interview. Reach out anytime.</p>
          <div class="nw-recruiter-btns">
            <a class="nw-recruiter-msg" href="mailto:${escapeAttr(recruiter.email || "support@nearwork.co")}">${icon("message-square-text")} Message</a>
            <a class="nw-recruiter-call" href="https://wa.me/${encodeURIComponent((recruiter.whatsapp || "+1").replace(/\D/g, ""))}" target="_blank" rel="noreferrer">${icon("calendar-plus")} WhatsApp</a>
          </div>
        </section>
      </div>
    </div>

    <!-- Top matches -->
    ${jobs.length ? `
      <section class="nw-matches-section">
        <div class="nw-panel-head">
          <div>
            <div class="nw-panel-overline">Picked for you</div>
            <div class="nw-panel-title">Top matches this week</div>
          </div>
          <button class="nw-ghost-btn" type="button" data-page="matches">See all ${icon("arrow-right")}</button>
        </div>
        <div class="nw-match-grid">
          ${jobs.map(j => matchCard(j)).join("")}
        </div>
      </section>
    ` : ""}
  `;
}

function renderOnboarding() {
  // Only seed wizard state the first time the wizard is shown for this session.
  // renderDashboard() (and therefore renderOnboarding()) can be re-invoked in the
  // background — e.g. a live notifications snapshot update — and re-running this
  // setup would wipe whatever step/CV/answers the candidate has already entered.
  if (!_onbInitialized) {
    _onbInitialized = true;
    _onbStep = 1;
    // Pre-populate from any data already collected (e.g. from jobs.nearwork.co account creation)
    // so the candidate doesn't have to re-enter what they've already provided.
    const c = state.candidate || {};
    const nameParts = String(c.name || "").trim().split(/\s+/).filter(Boolean);
    _onbData = {
      roleGroup:  c.roleGroup  || "",
      targetRole: c.targetRole || "",
      department: c.department || c.locationDepartment || "",
      city:       c.city       || c.locationCity       || "",
      english:    c.english    || "",
      firstName:  c.firstName  || nameParts[0] || "",
      lastName:   c.lastName   || nameParts.slice(1).join(" ") || "",
      phone:      c.phone || c.whatsapp || "",
      currentRole: c.currentRole || "",
      expectedSalaryUSD: c.expectedSalaryUSD || (c.salaryCurrency !== "COP" ? c.salaryAmount : null) || "",
      expectedSalaryCOP: c.expectedSalaryCOP || (c.salaryCurrency === "COP" ? c.salaryAmount : null) || "",
      linkedin:   c.linkedin   || "",
      experience: Array.isArray(c.workHistory) ? c.workHistory.map(w => ({ ...w })) : [],
      languages:  Array.isArray(c.languages) ? [...c.languages] : [],
      skills:     Array.isArray(c.skills) ? [...c.skills] : [],
      certifications: Array.isArray(c.certifications) ? c.certifications.map(x => ({ ...x })) : [],
    };
    _onbCvFile = null; _onbParsePromise = null; _onbParsed = null;
  }
  return `<div id="onboardingWizard" class="onb-shell"></div>`;
}

// ─── Onboarding wizard ────────────────────────────────────────────────────────

function bindOnboardingWizardEvents() {
  if (!document.querySelector("#onboardingWizard")) return;
  _onbRender(_onbStep);
}

function _onbRender(step) {
  _onbStep = step;
  const el = document.querySelector("#onboardingWizard");
  if (!el) return;
  el.innerHTML = _onbStepHtml(step);
  _onbBindStep(step);
}

function _onbProgress(step) {
  const total = 3;
  return `
    <div style="display:flex;align-items:center;gap:5px;margin-bottom:28px;">
      ${Array.from({ length: total }, (_, i) => `
        <div style="height:5px;border-radius:3px;flex:${i < step ? 2 : 1};background:${i < step ? "var(--green)" : "var(--border)"};transition:all .3s;"></div>
      `).join("")}
      <span style="margin-left:6px;font-size:11px;font-weight:600;color:var(--light);white-space:nowrap;">${step <= total ? `${step} / ${total}` : "Review"}</span>
    </div>`;
}

function _onbField(label, optional, input) {
  return `<label style="display:flex;flex-direction:column;gap:5px;font-size:11px;font-weight:600;letter-spacing:.07em;text-transform:uppercase;color:var(--light);">${label}${optional ? `<span style="font-weight:400;font-size:10px;text-transform:none;letter-spacing:0;opacity:.7;">(optional)</span>` : ""} ${input}</label>`;
}

function _onbInput(id, type, value, placeholder, extra = "") {
  return `<input id="${id}" type="${type}" value="${escapeAttr(value || "")}" placeholder="${escapeAttr(placeholder)}" ${extra} style="font-size:14px;padding:10px 12px;border:1.5px solid var(--border);border-radius:8px;background:#fff;outline:none;width:100%;box-sizing:border-box;" />`;
}

function _onbSelect(id, options, selected) {
  const opts = options.map(([val, label]) => `<option value="${escapeAttr(val)}" ${val === selected ? "selected" : ""}>${escapeHtml(label)}</option>`).join("");
  return `<select id="${id}" style="font-size:14px;padding:10px 12px;border:1.5px solid var(--border);border-radius:8px;background:#fff;outline:none;width:100%;box-sizing:border-box;">${opts}</select>`;
}

function _onbActions(backStep, nextLabel) {
  return `<div style="display:flex;justify-content:space-between;align-items:center;margin-top:28px;">
    ${backStep ? `<button type="button" id="onbBack" class="secondary-action">← Back</button>` : `<span></span>`}
    <button type="button" id="onbNext" class="primary-action fit">${nextLabel || "Continue →"}</button>
  </div>`;
}

function _onbStepHtml(step) {
  const d = _onbData;
  switch (step) {

    // ── Step 1: CV ────────────────────────────────────────────────────────────
    case 1: {
      const hasFile = Boolean(_onbCvFile);
      return `
        <div class="onb-step">
          ${_onbProgress(1)}
          <p class="eyebrow">Step 1 · Your CV</p>
          <h2 class="onb-heading">Upload your CV to get started</h2>
          <p class="onb-sub">We'll extract your experience, skills, and contact info automatically — so you don't have to type it all out.</p>
          <div class="upload-box" style="margin-bottom:4px;" id="onbCvBox">
            <input id="onbCvInput" type="file" accept=".pdf,.doc,.docx" style="display:none;" />
            <label for="onbCvInput" class="upload-trigger">${icon("upload")} Choose file</label>
            <p id="onbCvStatus" style="font-size:12px;color:var(--green);min-height:18px;margin:0;">${hasFile ? `✓ ${escapeHtml(_onbCvFile.name)}` : ""}</p>
            <p>PDF or Word · max 10 MB</p>
          </div>
          <div style="display:flex;justify-content:space-between;align-items:center;margin-top:24px;">
            <button type="button" id="onbSkipCv" style="background:none;border:none;font-size:13px;color:var(--light);cursor:pointer;text-decoration:underline;padding:0;">Skip — I'll fill in manually</button>
            <button type="button" id="onbNext" class="primary-action fit" ${hasFile ? "" : "disabled"}>Continue →</button>
          </div>
        </div>`;
    }

    // ── Step 2: Basic info ────────────────────────────────────────────────────
    case 2: {
      const email = state.candidate?.email || state.user?.email || "";
      const phone = d.phone || (_onbParsed?.phone ?? "");
      const currentRole = d.currentRole || (_onbParsed?.workHistory?.[0]?.title ?? "");
      return `
        <div class="onb-step">
          ${_onbProgress(2)}
          <p class="eyebrow">Step 2 · Your profile</p>
          <h2 class="onb-heading">Tell us about yourself</h2>
          <p class="onb-sub">This is the basic information we'll use across every role you apply for.</p>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:4px;">
            ${_onbField("First name", false, _onbInput("onbFirstName", "text", d.firstName || "", "María", 'autocomplete="given-name"'))}
            ${_onbField("Last name", false, _onbInput("onbLastName", "text", d.lastName || "", "García", 'autocomplete="family-name"'))}
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:4px;">
            ${_onbField("Email", false, _onbInput("onbEmail", "email", email, "", "disabled"))}
            ${_onbField("Phone", false, _onbInput("onbPhone", "tel", phone, "+57 300 123 4567", 'autocomplete="tel"'))}
          </div>
          ${_onbField("Current role", false, _onbInput("onbCurrentRole", "text", currentRole, "e.g. Customer Success Manager"))}
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:4px;">
            ${_onbField("Expected salary — USD", true, _onbInput("onbSalaryUSD", "number", d.expectedSalaryUSD || "", "2500", 'min="0" step="100"'))}
            ${_onbField("Expected salary — COP", true, _onbInput("onbSalaryCOP", "number", d.expectedSalaryCOP || "", "10000000", 'min="0" step="100000"'))}
          </div>
          ${_onbField("LinkedIn", true, _onbInput("onbLinkedin", "url", d.linkedin || "", "https://linkedin.com/in/..."))}
          <p id="onbBasicError" style="font-size:12px;color:#e74c3c;min-height:16px;margin:4px 0 0;"></p>
          ${_onbActions(1)}
        </div>`;
    }

    // ── Step 3: Role + Location ────────────────────────────────────────────────
    case 3: {
      const rg = d.roleGroup || Object.keys(roleGroups)[0] || "";
      const dept  = d.department || Object.keys(colombiaLocations)[0] || "";
      const cities = colombiaLocations[dept] || [];
      return `
        <div class="onb-step">
          ${_onbProgress(3)}
          <p class="eyebrow">Step 3 · Role & location</p>
          <h2 class="onb-heading">What role are you looking for, and where are you based?</h2>
          <p class="onb-sub">We use this to match you with the right openings from our clients.</p>
          <div style="display:grid;gap:12px;margin-bottom:4px;">
            ${_onbField("Area", false, `<select id="onbRoleGroup" style="font-size:14px;padding:10px 12px;border:1.5px solid var(--border);border-radius:8px;background:#fff;outline:none;">${roleGroupOptions(rg)}</select>`)}
            ${_onbField("Role", false, `<select id="onbTargetRole" style="font-size:14px;padding:10px 12px;border:1.5px solid var(--border);border-radius:8px;background:#fff;outline:none;">${roleOptionsForGroup(rg, d.targetRole || "")}</select>`)}
            ${_onbField("Department", false, `<select id="onbDept" style="font-size:14px;padding:10px 12px;border:1.5px solid var(--border);border-radius:8px;background:#fff;outline:none;">${Object.keys(colombiaLocations).map((dep) => `<option value="${escapeAttr(dep)}" ${dep === dept ? "selected" : ""}>${escapeHtml(dep)}</option>`).join("")}</select>`)}
            ${_onbField("City", false, `<select id="onbCity" style="font-size:14px;padding:10px 12px;border:1.5px solid var(--border);border-radius:8px;background:#fff;outline:none;">${cities.map((c) => `<option value="${escapeAttr(c)}" ${c === d.city ? "selected" : ""}>${escapeHtml(c)}</option>`).join("")}</select>`)}
            ${_onbField("English level", false, `<select id="onbEnglish" style="font-size:14px;padding:10px 12px;border:1.5px solid var(--border);border-radius:8px;background:#fff;outline:none;">${["", "B1", "B2", "C1", "C2", "Native"].map((l) => `<option value="${l}" ${l === d.english ? "selected" : ""}>${l || "Select level"}</option>`).join("")}</select>`)}
          </div>
          ${_onbActions(2, "Review →")}
        </div>`;
    }

    // ── Review ────────────────────────────────────────────────────────────────
    case 4: return _onbReviewHtml();

    default: return "";
  }
}

const ONB_LIST_INPUT_STYLE = "font-size:14px;padding:10px 12px;border:1.5px solid var(--border);border-radius:8px;background:#fff;outline:none;width:100%;box-sizing:border-box;";
const ONB_LIST_REMOVE_STYLE = "flex-shrink:0;width:38px;height:38px;border:1.5px solid var(--border);border-radius:8px;background:#fff;color:var(--light);font-size:14px;cursor:pointer;";

function _onbListLabel(text) {
  return `<label style="display:block;margin-bottom:8px;font-size:11px;font-weight:600;letter-spacing:.07em;text-transform:uppercase;color:var(--light);">${text}</label>`;
}

function _onbReviewHtml() {
  const d = _onbData;
  const p = _onbParsed || {};

  // Pre-fill editable lists from the parsed CV the first time we land on Review.
  if (!d.experience.length && Array.isArray(p.workHistory) && p.workHistory.length) {
    d.experience = p.workHistory.map((w) => ({ company: w.company || "", title: w.title || "", from: w.from || "", to: w.to || "" }));
  }
  if (!d.languages.length && Array.isArray(p.languages) && p.languages.length) {
    d.languages = p.languages.filter(Boolean).map(String);
  }
  if (!d.skills.length && Array.isArray(p.skills) && p.skills.length) {
    d.skills = [...new Set(p.skills.map(canonicalSkillName).filter(Boolean))];
  }
  if (!d.certifications.length && Array.isArray(p.certifications) && p.certifications.length) {
    d.certifications = p.certifications.map((c) => ({ name: c.name || "", issuer: c.issuer || "", date: c.date || "" }));
  }

  const name     = [d.firstName, d.lastName].filter(Boolean).join(" ") || state.candidate?.name || "—";
  const role     = d.targetRole || "—";
  const location = [d.city, d.department].filter(Boolean).join(", ") || "—";
  const salaryParts = [];
  if (d.expectedSalaryUSD) salaryParts.push(`$${Number(d.expectedSalaryUSD).toLocaleString("en-US")} USD/mo`);
  if (d.expectedSalaryCOP) salaryParts.push(`$${Number(d.expectedSalaryCOP).toLocaleString("es-CO")} COP/mo`);
  const salary   = salaryParts.join(" · ") || "—";
  const english  = d.english  || "—";
  const phone    = d.phone || "—";
  const cvName   = _onbCvFile?.name || "";

  const row = (label, value) => !value || value === "—" ? "" : `
    <div style="display:flex;gap:16px;padding:10px 0;border-bottom:1px solid var(--border);">
      <span style="width:110px;flex-shrink:0;font-size:10px;font-weight:700;letter-spacing:.07em;text-transform:uppercase;color:var(--light);padding-top:3px;">${label}</span>
      <span style="font-size:13px;color:var(--black);line-height:1.5;">${escapeHtml(String(value))}</span>
    </div>`;

  return `
    <div class="onb-step">
      <p class="eyebrow" style="color:var(--green);">Almost done</p>
      <h2 class="onb-heading">Does this look right?</h2>
      <p class="onb-sub" style="margin-bottom:20px;">Review your profile before we save it. You can always update it later from Settings.</p>
      <div style="border:1.5px solid var(--border);border-radius:12px;padding:2px 16px 2px;margin-bottom:24px;">
        ${row("Name",     name)}
        ${row("Role",     role)}
        ${row("Location", location)}
        ${row("Salary",   salary)}
        ${row("English",  english)}
        ${row("Phone",    phone)}
        ${row("Current role", d.currentRole || "—")}
        ${cvName ? row("CV", cvName) : ""}
      </div>

      <div class="field" style="margin-bottom:20px;">
        ${_onbListLabel("Experience")}
        <div id="onbExperienceList"></div>
        <button type="button" class="secondary-action" id="onbAddExperience">+ Add position</button>
      </div>

      <div class="field" style="margin-bottom:20px;">
        ${_onbListLabel("Languages")}
        <div id="onbLanguagesList"></div>
        <button type="button" class="secondary-action" id="onbAddLanguage">+ Add language</button>
      </div>

      <div class="field" style="margin-bottom:20px;">
        ${_onbListLabel("Skills")}
        ${skillSearchMarkup(d.skills)}
      </div>

      <div class="field" style="margin-bottom:20px;">
        ${_onbListLabel("Certifications")}
        <div id="onbCertificationsList"></div>
        <button type="button" class="secondary-action" id="onbAddCertification">+ Add certification</button>
      </div>

      <div style="display:flex;justify-content:space-between;align-items:center;">
        <button type="button" id="onbEdit" class="secondary-action">← Edit</button>
        <button type="button" id="onbFinish" class="primary-action fit">${icon("check")} Finish setup</button>
      </div>
      <p id="onbFinishErr" style="font-size:12px;color:#e74c3c;text-align:right;min-height:18px;margin-top:6px;"></p>
    </div>`;
}

function _onbRenderExperienceList() {
  const container = document.querySelector("#onbExperienceList");
  if (!container) return;
  container.innerHTML = "";
  if (!_onbData.experience.length) {
    container.innerHTML = `<p style="font-size:12px;color:var(--light);margin:0 0 10px;">No experience added yet.</p>`;
  }
  _onbData.experience.forEach((exp, idx) => {
    const row = document.createElement("div");
    row.style.cssText = "border:1.5px solid var(--border);border-radius:10px;padding:12px;margin-bottom:10px;";
    row.innerHTML = `
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px;">
        <input type="text" data-k="title" placeholder="Title" value="${escapeAttr(exp.title || "")}" style="${ONB_LIST_INPUT_STYLE}">
        <input type="text" data-k="company" placeholder="Company" value="${escapeAttr(exp.company || "")}" style="${ONB_LIST_INPUT_STYLE}">
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr auto;gap:8px;align-items:center;">
        <input type="month" data-k="from" value="${escapeAttr(exp.from || "")}" style="${ONB_LIST_INPUT_STYLE}">
        <input type="month" data-k="to" value="${exp.to === "present" ? "" : escapeAttr(exp.to || "")}" ${exp.to === "present" ? "disabled" : ""} style="${ONB_LIST_INPUT_STYLE}">
        <button type="button" class="onb-list-remove" aria-label="Remove" style="${ONB_LIST_REMOVE_STYLE}">×</button>
      </div>
      <label style="display:flex;align-items:center;gap:6px;font-size:12px;color:var(--mid);margin-top:8px;">
        <input type="checkbox" data-k="current" ${exp.to === "present" ? "checked" : ""}> I currently work here
      </label>`;
    row.querySelectorAll('input[type="text"][data-k], input[type="month"][data-k]').forEach((inp) => {
      inp.addEventListener("input", (e) => { exp[e.target.dataset.k] = e.target.value; });
    });
    row.querySelector('input[type="checkbox"][data-k="current"]')?.addEventListener("change", (e) => {
      exp.to = e.target.checked ? "present" : "";
      _onbRenderExperienceList();
    });
    row.querySelector(".onb-list-remove")?.addEventListener("click", () => {
      _onbData.experience.splice(idx, 1);
      _onbRenderExperienceList();
    });
    container.appendChild(row);
  });
}

function _onbRenderLanguagesList() {
  const container = document.querySelector("#onbLanguagesList");
  if (!container) return;
  container.innerHTML = "";
  if (_onbData.english) {
    const englishRow = document.createElement("div");
    englishRow.style.cssText = "display:flex;align-items:center;gap:8px;margin-bottom:8px;padding:10px 12px;border:1.5px solid var(--border);border-radius:8px;background:var(--gray-1);font-size:14px;color:var(--black);";
    englishRow.innerHTML = `<span style="font-weight:600;">English</span><span style="color:var(--light);">${escapeHtml(_onbData.english)}</span>`;
    container.appendChild(englishRow);
  }
  if (!_onbData.languages.length) {
    const empty = document.createElement("p");
    empty.style.cssText = "font-size:12px;color:var(--light);margin:0 0 10px;";
    empty.textContent = "No other languages added yet.";
    container.appendChild(empty);
  }
  _onbData.languages.forEach((lang, idx) => {
    const row = document.createElement("div");
    row.style.cssText = "display:flex;gap:10px;align-items:center;margin-bottom:8px;";
    row.innerHTML = `
      <input type="text" value="${escapeAttr(lang)}" placeholder="e.g. English (B2)" style="${ONB_LIST_INPUT_STYLE}flex:1;">
      <button type="button" class="onb-list-remove" aria-label="Remove" style="${ONB_LIST_REMOVE_STYLE}">×</button>`;
    row.querySelector("input").addEventListener("input", (e) => { _onbData.languages[idx] = e.target.value; });
    row.querySelector(".onb-list-remove").addEventListener("click", () => {
      _onbData.languages.splice(idx, 1);
      _onbRenderLanguagesList();
    });
    container.appendChild(row);
  });
}

function _onbRenderCertificationsList() {
  const container = document.querySelector("#onbCertificationsList");
  if (!container) return;
  container.innerHTML = "";
  if (!_onbData.certifications.length) {
    container.innerHTML = `<p style="font-size:12px;color:var(--light);margin:0 0 10px;">No certifications added yet.</p>`;
  }
  _onbData.certifications.forEach((cert, idx) => {
    const row = document.createElement("div");
    row.style.cssText = "display:flex;gap:10px;align-items:flex-start;margin-bottom:8px;";
    row.innerHTML = `
      <div class="onb-cert-grid" style="flex:1;">
        <input type="text" data-k="name" value="${escapeAttr(cert.name || "")}" placeholder="Certification name" style="${ONB_LIST_INPUT_STYLE}">
        <input type="text" data-k="issuer" value="${escapeAttr(cert.issuer || "")}" placeholder="Issuer" style="${ONB_LIST_INPUT_STYLE}">
        <input type="text" data-k="date" value="${escapeAttr(cert.date || "")}" placeholder="Date" style="${ONB_LIST_INPUT_STYLE}">
      </div>
      <button type="button" class="onb-list-remove" aria-label="Remove" style="${ONB_LIST_REMOVE_STYLE}">×</button>`;
    row.querySelectorAll("input[data-k]").forEach((inp) => {
      inp.addEventListener("input", (e) => { cert[e.target.dataset.k] = e.target.value; });
    });
    row.querySelector(".onb-list-remove").addEventListener("click", () => {
      _onbData.certifications.splice(idx, 1);
      _onbRenderCertificationsList();
    });
    container.appendChild(row);
  });
}

function _onbBindStep(step) {
  const back = document.querySelector("#onbBack");
  const next = document.querySelector("#onbNext");
  back?.addEventListener("click", () => _onbRender(step - 1));

  switch (step) {

    case 1: {
      const cvInput = document.querySelector("#onbCvInput");
      const status  = document.querySelector("#onbCvStatus");
      const skipBtn = document.querySelector("#onbSkipCv");

      // Restore previously selected file display
      if (_onbCvFile && cvInput) next.disabled = false;

      cvInput?.addEventListener("change", () => {
        const file = cvInput.files?.[0];
        if (!file) return;
        _onbCvFile = file;
        if (status) status.textContent = `✓ ${file.name}`;
        next.disabled = false;
        // Kick off Affinda in background immediately
        _onbParsed = null;
        _onbParsePromise = parseCvWithAffinda(file).catch(() => null);
      });

      next?.addEventListener("click", () => _onbAwaitParse(2));
      skipBtn?.addEventListener("click", () => { _onbCvFile = null; _onbParsePromise = null; _onbAwaitParse(2); });
      break;
    }

    case 2: {
      next?.addEventListener("click", () => {
        const firstName   = document.querySelector("#onbFirstName")?.value.trim() || "";
        const lastName    = document.querySelector("#onbLastName")?.value.trim() || "";
        const phone       = document.querySelector("#onbPhone")?.value.trim() || "";
        const currentRole = document.querySelector("#onbCurrentRole")?.value.trim() || "";
        const usd         = document.querySelector("#onbSalaryUSD")?.value || "";
        const cop         = document.querySelector("#onbSalaryCOP")?.value || "";
        const linkedin    = document.querySelector("#onbLinkedin")?.value.trim() || "";
        const errEl       = document.querySelector("#onbBasicError");
        if (!firstName || !lastName || !phone || !currentRole) {
          if (errEl) errEl.textContent = "Please fill in your name, phone, and current role.";
          return;
        }
        if (!usd && !cop) {
          if (errEl) errEl.textContent = "Please enter an expected salary in USD, COP, or both.";
          return;
        }
        _onbData.firstName         = firstName;
        _onbData.lastName          = lastName;
        _onbData.phone             = phone;
        _onbData.currentRole       = currentRole;
        _onbData.expectedSalaryUSD = usd ? Number(usd) : "";
        _onbData.expectedSalaryCOP = cop ? Number(cop) : "";
        _onbData.linkedin          = linkedin;
        _onbRender(3);
      });
      break;
    }

    case 3: {
      const rgSel   = document.querySelector("#onbRoleGroup");
      const roleSel = document.querySelector("#onbTargetRole");
      const deptSel = document.querySelector("#onbDept");
      const citySel = document.querySelector("#onbCity");
      rgSel?.addEventListener("change", () => {
        roleSel.innerHTML = roleOptionsForGroup(rgSel.value, "");
      });
      deptSel?.addEventListener("change", () => {
        const cities = colombiaLocations[deptSel.value] || [];
        citySel.innerHTML = cities.map((c) => `<option value="${escapeAttr(c)}">${escapeHtml(c)}</option>`).join("");
      });
      next?.addEventListener("click", () => {
        _onbData.roleGroup  = rgSel?.value  || "";
        _onbData.targetRole = roleSel?.value || "";
        _onbData.department = deptSel?.value || "";
        _onbData.city       = citySel?.value || "";
        _onbData.english    = document.querySelector("#onbEnglish")?.value || "";
        _onbAwaitParse(4);
      });
      break;
    }

    case 4: {
      document.querySelector("#onbEdit")?.addEventListener("click", () => _onbRender(1));
      document.querySelector("#onbFinish")?.addEventListener("click", _onbFinish);
      _onbRenderExperienceList();
      _onbRenderLanguagesList();
      _onbRenderCertificationsList();
      document.querySelector("#onbAddExperience")?.addEventListener("click", () => {
        _onbData.experience.push({ company: "", title: "", from: "", to: "" });
        _onbRenderExperienceList();
      });
      document.querySelector("#onbAddLanguage")?.addEventListener("click", () => {
        _onbData.languages.push("");
        _onbRenderLanguagesList();
      });
      document.querySelector("#onbAddCertification")?.addEventListener("click", () => {
        _onbData.certifications.push({ name: "", issuer: "", date: "" });
        _onbRenderCertificationsList();
      });
      bindSkillSearch();
      break;
    }
  }
}

async function _onbAwaitParse(step) {
  const el = document.querySelector("#onboardingWizard");
  // Show "Analysing…" while we wait for Affinda if it's still in flight
  if (_onbParsePromise && !_onbParsed) {
    if (el) el.innerHTML = `<div class="onb-step"><p style="text-align:center;font-size:14px;font-weight:600;color:var(--green);padding:56px 0;">Analysing your CV…</p></div>`;
    _onbParsed = await _onbParsePromise;
  }
  // Merge Affinda data that wasn't explicitly entered yet
  if (_onbParsed?.phone && !_onbData.phone) _onbData.phone = _onbParsed.phone;
  if (_onbParsed?.name && !_onbData.firstName && !_onbData.lastName) {
    const parts = String(_onbParsed.name).trim().split(/\s+/).filter(Boolean);
    _onbData.firstName = parts[0] || "";
    _onbData.lastName  = parts.slice(1).join(" ");
  }
  if (_onbParsed?.workHistory?.[0]?.title && !_onbData.currentRole) {
    _onbData.currentRole = _onbParsed.workHistory[0].title;
  }
  _onbRender(step);
}

async function _onbFinish() {
  const finishBtn = document.querySelector("#onbFinish");
  const errEl     = document.querySelector("#onbFinishErr");
  if (finishBtn) { finishBtn.disabled = true; finishBtn.innerHTML = "Saving…"; }

  try {
    const d   = _onbData;
    const uid = state.user?.uid;
    if (!uid) throw new Error("Not signed in");

    const dept = d.department || "";
    const city = d.city || "";
    const usdVal = Number(d.expectedSalaryUSD || 0) || null;
    const copVal = Number(d.expectedSalaryCOP || 0) || null;
    const primaryAmount   = usdVal || copVal || null;
    const primaryCurrency = usdVal ? "USD" : (copVal ? "COP" : "USD");
    const salaryLabel = primaryAmount ? `${primaryCurrency} ${primaryAmount.toLocaleString()}/mo` : "";
    const skills = [...document.querySelectorAll('[data-skill-search] input[name="skills"]')].map((el) => el.value);
    const name = [d.firstName, d.lastName].filter(Boolean).join(" ") || state.candidate?.name || state.user?.displayName || "";

    // Upload CV (non-blocking — failure doesn't stop save)
    let cvFields = {};
    if (_onbCvFile) {
      try {
        const cv = await uploadCandidateCv(uid, _onbCvFile, "");
        cvFields = { activeCvId: cv.id, activeCvName: cv.name || cv.fileName, cvUrl: cv.url, cvLibrary: [cv] };
      } catch { /* ignore */ }
    }

    const profileData = {
      name,
      firstName:             d.firstName || "",
      lastName:              d.lastName || "",
      targetRole:            d.targetRole || "",
      headline:              d.targetRole || "",
      currentRole:           d.currentRole || "",
      department:            dept,
      city,
      location:              [city, dept].filter(Boolean).join(", "),
      locationCity:          city,
      locationDepartment:    dept,
      locationCountry:       "Colombia",
      locationId:            `${String(city).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-")}-co`,
      english:               d.english || "",
      salary:                salaryLabel,
      salaryUSD:             usdVal,
      salaryAmount:          primaryAmount,
      salaryCurrency:        primaryCurrency,
      expectedSalaryUSD:     usdVal,
      expectedSalaryCOP:     copVal,
      expectedSalaryAmount:  primaryAmount,
      expectedSalaryCurrency:primaryCurrency,
      whatsapp:              d.phone || "",
      phone:                 d.phone || "",
      linkedin:              d.linkedin || "",
      skills:                [...new Set(skills.map(canonicalSkillName).filter(Boolean))],
      workHistory:           d.experience || [],
      certifications:        (d.certifications || []).filter((c) => c.name && c.name.trim()),
      languages:             (d.languages || []).map((l) => l.trim()).filter(Boolean),
      summary:               _onbParsed?.summary || "",
      email:                 state.candidate?.email || state.user?.email || "",
      candidateCode:         state.candidate?.candidateCode,
      marketingConsent:      state.candidate?.marketingConsent === true,
      availability:          "open",
      onboarded:             true,
      ...cvFields,
    };

    await updateCandidateProfile(uid, profileData);
    window.history.pushState({ page: "overview" }, "", "/");
    setState({ candidate: { ...state.candidate, ...profileData }, activePage: "overview", message: "Welcome to Nearwork! Your profile is ready." });
  } catch {
    if (errEl)     errEl.textContent = "Something went wrong. Please try again.";
    if (finishBtn) { finishBtn.disabled = false; finishBtn.innerHTML = `${icon("check")} Finish setup`; }
  }
}

function renderMatches() {
  const skills = candidateSkills();
  const filteredJobs = state.jobs.map(normalizeRole).filter((job) => matchingSkillsForJob(job, skills).length >= 3);
  const canFilter = skills.length >= 5;
  const visibleJobs = state.matchesFiltered && canFilter ? filteredJobs : state.jobs.map(normalizeRole);
  const filteredEmpty = state.matchesFiltered && !filteredJobs.length;
  return `
    <div class="nw-page-head">
      <div class="nw-page-overline">My search</div>
      <h1 class="nw-page-title">Matches</h1>
      <p class="nw-page-lede">Roles picked for you from your skills, target role, and salary.</p>
    </div>
    <div class="nw-filterbar">
      <button id="filterMatches" class="nw-chip${state.matchesFiltered ? " active" : ""}" type="button">${icon(state.matchesFiltered ? "list" : "filter")} ${state.matchesFiltered ? "Show all openings" : "Filter by my role & skills"}</button>
      <div class="nw-filter-count">${visibleJobs.length} of ${state.jobs.length} open roles</div>
    </div>
    <div class="nw-match-grid nw-match-grid--wide">${filteredEmpty ? emptyState("No filtered matches yet", "Add a target role and skills in Profile to improve matching.") : visibleJobs.map((job) => jobCard(job)).join("")}</div>
  `;
}

function renderApplications() {
  const apps = state.applications || [];
  const hasPipeline = candidateHasPipeline();
  return `
    <div class="nw-page-head">
      <div class="nw-page-overline">My journey</div>
      <h1 class="nw-page-title">Applications</h1>
      <p class="nw-page-lede">Every role you've applied to, and exactly where it stands.</p>
    </div>
    ${hasPipeline ? `
      <section class="nw-panel nw-pipeline-panel">
        <div class="nw-panel-head"><div><div class="nw-panel-overline">Status</div><div class="nw-panel-title">Where you are in the process</div></div></div>
        ${pipelineView(currentStage())}
      </section>` : ""}
    <section class="nw-panel nw-applist">
      ${apps.length ? apps.map((app, i) => applicationCard(app, i === apps.length - 1)).join("") : noPipelineView()}
    </section>
  `;
}

function renderAssessment() {
  const directId = assessmentIdFromPath();
  const assessments = state.assessments || [];
  const assignedAssessments = assessments.filter((a) => ["sent", "started"].includes(String(a.status || "").toLowerCase()));
  const completedAssessments = assessments.filter((a) => String(a.status || "").toLowerCase() === "completed");
  const activeAssessment = directId
    ? assessments.find((a) => a.id === directId)
    : assignedAssessments[0] || completedAssessments[0] || null;

  // Tech intro step
  if (state.assessmentUiStep === "techIntro" && activeAssessment) {
    return renderAssessmentTechIntro(activeAssessment);
  }
  // DISC intro step
  if (state.assessmentUiStep === "discIntro" && activeAssessment) {
    return renderAssessmentDiscIntro(activeAssessment);
  }

  // Error: direct link but no matching assessment
  if (directId && !activeAssessment) {
    return `
      <div class="nw-page-head">
        <div class="nw-page-overline">My journey</div>
        <h1 class="nw-page-title">Assessment</h1>
        <p class="nw-page-lede">A short role assessment helps your recruiter advocate for you with real signal.</p>
      </div>
      <div class="nw-assess-wrap nw-assess-state-page">
        <div class="nw-assess-state-card">
          <div class="nw-assess-state-icon" style="background:var(--pp-pink-soft);color:#CC3666">${icon("link-2-off")}</div>
          <strong>This link isn't available</strong>
          <p>Make sure you're logged into the same account that received the assessment email. If the problem persists, reach out to your Nearwork recruiter.</p>
          <button class="primary-action fit" data-page="recruiter" type="button">${icon("message-circle")} Contact support</button>
        </div>
      </div>
    `;
  }

  // Not assigned yet
  if (!activeAssessment) {
    return `
      <div class="nw-page-head">
        <div class="nw-page-overline">My journey</div>
        <h1 class="nw-page-title">Assessment</h1>
        <p class="nw-page-lede">A short role assessment helps your recruiter advocate for you with real signal.</p>
      </div>
      <div class="nw-assess-wrap nw-assess-state-page">
        <div class="nw-assess-state-card">
          <div class="nw-assess-state-icon">${icon("inbox")}</div>
          <strong>No assessment assigned yet</strong>
          <p>Your assessment will appear here when Nearwork sends it. You'll receive an email notification when it's ready.</p>
          <div class="nw-assess-info-row">
            <div class="nw-assess-info-item">${icon("shield-check")}<span>One attempt</span></div>
            <div class="nw-assess-info-item">${icon("timer")}<span>~45–90 min</span></div>
            <div class="nw-assess-info-item">${icon("users")}<span>Recruiter reviewed</span></div>
          </div>
        </div>
      </div>
    `;
  }

  // Active assessment
  const questions = Array.isArray(activeAssessment.questions) ? activeAssessment.questions : [];
  const started = String(activeAssessment.status || "").toLowerCase() === "started";
  const completed = String(activeAssessment.status || "").toLowerCase() === "completed";
  const cancelled = String(activeAssessment.status || "").toLowerCase() === "cancelled";
  const expired = isAssessmentExpired(activeAssessment);
  const urlIndex = assessmentQuestionIndexFromPath();
  const savedIndex = Number(activeAssessment.currentQuestionIndex || 0);
  const currentIndex = Math.min(urlIndex ?? savedIndex, Math.max(questions.length - 1, 0));
  const currentQuestion = questions[currentIndex];
  const currentStage = currentQuestion?.stage || activeAssessment.currentStage || 1;
  const showChrome = started && !completed && !cancelled && !expired;

  return `
    <div class="nw-assess-wrap">
      ${showChrome
        ? renderAssessmentTimer(activeAssessment, currentStage, currentIndex, questions)
        : renderAssessmentChromeSimple(activeAssessment)}
      ${showChrome ? renderAssessmentProgress(activeAssessment, currentIndex) : ""}
      <div class="nw-assess-body" id="assessmentWorkspace">
        ${completed
          ? renderAssessmentResult(activeAssessment)
          : cancelled
          ? `<div class="nw-assess-state-card nw-assess-state-card--inline"><div class="nw-assess-state-icon" style="background:#F5F4F0;color:#555">${icon("ban")}</div><strong>Assessment cancelled</strong><p>This assessment is no longer available. A new assigned assessment will appear here when your recruiter sends one.</p></div>`
          : expired
          ? `<div class="nw-assess-state-card nw-assess-state-card--inline"><div class="nw-assess-state-icon" style="background:#FEF0F5;color:#CC3666">${icon("clock-x")}</div><strong>Assessment link expired</strong><p>This unique assessment link is no longer valid. Contact your Nearwork recruiter if you need a new one.</p><button class="ghost-action" data-page="recruiter" type="button">${icon("message-circle")} Contact recruiter</button></div>`
          : renderAssessmentQuestions(activeAssessment, started, currentIndex)}
      </div>
      ${renderAssessmentHistory(assessments, activeAssessment.id)}
    </div>
  `;
}

function renderAssessmentChromeSimple(assessment) {
  const statusText = String(assessment.status || "").toLowerCase();
  return `
    <div class="nw-assess-chrome">
      <div class="nw-assess-chrome__logo">
        <div class="nw-assess-chrome__logotile">N</div>
        <span class="nw-assess-chrome__brand">Nearwork</span>
        <div class="nw-assess-chrome__divider"></div>
        <span class="nw-assess-chrome__sub">Candidate assessment</span>
      </div>
      <div style="flex:1"></div>
      ${!["completed", "cancelled"].includes(statusText) ? `<button class="nw-assess-chrome__exit" type="button">${icon("x")} Save &amp; exit</button>` : ""}
    </div>
  `;
}

function renderAssessmentProgress(assessment, currentIndex) {
  const questions = (assessment.questions || []).slice(0, 70);
  const technicalAnswered = stageQuestions(assessment, 1).filter((q) => isAnsweredValue(answerValueFor(assessment, q))).length;
  const discAnswered = stageQuestions(assessment, 2).filter((q) => isAnsweredValue(answerValueFor(assessment, q))).length;
  const stage1Count = stageQuestions(assessment, 1).length || 50;
  const stage2Count = stageQuestions(assessment, 2).length || 20;
  return `
    <section class="assessment-progress-panel">
      <div><strong>Technical</strong><span>${technicalAnswered}/${stage1Count} answered</span></div>
      <div><strong>DISC</strong><span>${discAnswered}/${stage2Count} answered</span></div>
      <div class="assessment-progress-strip">
        ${questions.map((q, index) => {
          const answered = isAnsweredValue(answerValueFor(assessment, q));
          return `<button type="button" class="${index === currentIndex ? "active" : ""} ${answered ? "answered" : ""}" data-assessment-jump="${index}" title="${assessmentStageName(q.stage)} · Q${index + 1}">${index + 1}</button>`;
        }).join("")}
      </div>
    </section>
  `;
}

function renderAssessmentTimer(assessment, currentStage, currentIndex, questions) {
  const stage = Number(currentStage || 1);
  const technicalStartedAt = dateFromValue(assessment.technicalStartedAt || assessment.startedAt) || new Date();
  const discStartedAt = dateFromValue(assessment.discStartedAt) || new Date();
  const stageStartedAt = stage === 1 ? technicalStartedAt : discStartedAt;
  const stageMinutes = stage === 1 ? Number(assessment.technicalMinutes || 60) : Number(assessment.discMinutes || 30);
  const endsAt = new Date(stageStartedAt.getTime() + stageMinutes * 60 * 1000);
  const sectionLabel = stage === 1 ? "Technical" : "DISC profile";
  const stageQs = (questions || []).filter((q) => Number(q.stage || 1) === stage);
  const stageStart = (questions || []).findIndex((q) => Number(q.stage || 1) === stage);
  const stageIdx = Math.max(0, currentIndex - stageStart);
  const pct = stageQs.length ? Math.round(((stageIdx + 1) / stageQs.length) * 100) : 2;
  return `
    <div class="nw-assess-chrome nw-assess-chrome--active">
      <div class="nw-assess-chrome__logo">
        <div class="nw-assess-chrome__logotile">N</div>
        <span class="nw-assess-chrome__brand">Nearwork</span>
        <div class="nw-assess-chrome__divider"></div>
        <span class="nw-assess-chrome__sub">Candidate assessment</span>
      </div>
      <div class="nw-assess-chrome__center">
        <div class="nw-assess-chrome__section">
          ${icon("clipboard-check")}
          <span>${sectionLabel} &middot; Question ${stageIdx + 1} of ${stageQs.length || (stage === 1 ? 50 : 20)}</span>
        </div>
        <div class="nw-assess-chrome__progresstrack">
          <div class="nw-assess-chrome__progressfill" style="width:${Math.max(2, pct)}%"></div>
        </div>
      </div>
      <div class="nw-timer-pill">
        ${icon("timer")}
        <span id="assessmentTimer" data-end="${endsAt.toISOString()}">${stageMinutes}:00</span>
      </div>
      <button class="nw-assess-chrome__exit" type="button">${icon("x")} Save &amp; exit</button>
    </div>
  `;
}

function renderAssessmentQuestions(assessment, started, displayIndex = null) {
  // ── Welcome screen (not yet started) ────────────────────────────────────
  if (!started) {
    const role = escapeAttr(assessment.role || "Role assessment");
    const recruiter = escapeAttr(assessment.recruiterName || assessment.recruiter || "Nearwork");
    const expiry = formatDate(assessment.expiresAt || assessment.deadline);
    const stage1Q = stageQuestions(assessment, 1).length || 50;
    const stage2Q = stageQuestions(assessment, 2).length || 20;
    const stage1Min = Number(assessment.technicalMinutes || 60);
    const stage2Min = Number(assessment.discMinutes || 30);
    return `
      <div class="nw-assess-welcome">
        <div class="nw-assess-welcome__header">
          <span class="nw-assess-role-chip">${icon("sparkles")} ${role}</span>
          <span>Sent by ${recruiter}${expiry ? " &middot; expires " + expiry : ""}</span>
        </div>
        <h2 class="nw-assess-welcome__title">Let's see how you think — and how you work.</h2>
        <p class="nw-assess-welcome__desc">This assessment has two parts: a role-knowledge check and a behavioral profile.</p>
        <div class="nw-assess-parts">
          <div class="nw-assess-part">
            <div class="nw-assess-part__blob" style="background:#E4F6EF"></div>
            <div class="nw-assess-part__icon" style="background:#E4F6EF;color:#10A07C">${icon("code-2")}</div>
            <span class="nw-assess-part__tag" style="color:#10A07C">Part 1</span>
            <strong class="nw-assess-part__title">Technical Assessment</strong>
            <span class="nw-assess-part__sub">${stage1Q} questions &middot; ~${stage1Min} min</span>
            <p class="nw-assess-part__desc">Single-choice role scenarios. We're looking at how you think, not whether you remember definitions.</p>
          </div>
          <div class="nw-assess-part">
            <div class="nw-assess-part__blob" style="background:#F7F2FC"></div>
            <div class="nw-assess-part__icon" style="background:#F7F2FC;color:#AF7AC5">${icon("compass")}</div>
            <span class="nw-assess-part__tag" style="color:#AF7AC5">Part 2</span>
            <strong class="nw-assess-part__title">DISC Profile</strong>
            <span class="nw-assess-part__sub">${stage2Q} statements &middot; ~${stage2Min} min</span>
            <p class="nw-assess-part__desc">How you work, communicate, and lead under pressure. No right or wrong answers.</p>
          </div>
        </div>
        <div class="nw-assess-rules">
          <div class="nw-assess-rule"><div class="nw-assess-rule__icon">${icon("wifi")}</div><div><strong>Stable connection</strong><span>Progress saves on every answer.</span></div></div>
          <div class="nw-assess-rule"><div class="nw-assess-rule__icon">${icon("timer")}</div><div><strong>Timed sections</strong><span>A countdown runs per stage.</span></div></div>
          <div class="nw-assess-rule"><div class="nw-assess-rule__icon">${icon("lock")}</div><div><strong>One attempt</strong><span>Take it when you can give it your full focus.</span></div></div>
          <div class="nw-assess-rule"><div class="nw-assess-rule__icon">${icon("eye-off")}</div><div><strong>No proctoring</strong><span>No camera or screen recording.</span></div></div>
        </div>
        <div class="nw-assess-welcome__cta">
          <button class="primary-action" id="showTechIntro" type="button">${icon("arrow-right")} Begin assessment</button>
          <span>Questions are timed. Open when you're ready to focus.</span>
        </div>
      </div>
    `;
  }

  // ── Active question ──────────────────────────────────────────────────────
  const questions = (assessment.questions || []).slice(0, 70);
  const currentIndex = Math.min(displayIndex ?? Number(assessment.currentQuestionIndex || 0), Math.max(questions.length - 1, 0));
  const question = questions[currentIndex];
  const saved = assessment.answers?.[question.id]?.value ?? assessment.answers?.[question.id] ?? "";
  const options = Array.isArray(question.options) && question.options.length ? question.options : ["Strongly agree", "Agree", "Neutral", "Disagree"];
  const nextQuestion = questions[currentIndex + 1];
  const nextStage = nextQuestion?.stage;
  const finishesStage = nextStage && nextStage !== question.stage;
  const stageMissed = missedQuestionsForStage(assessment, question.stage);
  const shouldReviewStage = finishesStage && stageMissed.length;
  const finishingAssessment = currentIndex + 1 >= questions.length;
  const finalMissed = finishingAssessment ? missedQuestionsForStage(assessment, question.stage) : [];
  const isMulti = !!question.multiple;
  const chipVariant = Number(question.stage || 1) === 2 ? "nw-assess-chip--violet" : "nw-assess-chip--teal";
  const typeLabel = isMulti ? "Multi-select" : "Single choice";
  const partLabel = escapeAttr(question.part || question.type || (Number(question.stage || 1) === 2 ? "DISC" : "Scenario"));
  const bankLabel = escapeAttr(question.bank || "");
  return `
    <form id="assessmentQuestionForm" class="nw-assess-qcard" data-current-index="${currentIndex}">
      <div class="nw-assess-qmeta">
        <span class="nw-assess-chip ${chipVariant}">${partLabel}</span>
        ${bankLabel ? `<span class="nw-assess-chip nw-assess-chip--gray">${bankLabel}</span>` : ""}
        <span class="nw-assess-qtype">&middot; ${typeLabel}</span>
      </div>
      ${question.context ? `<div class="nw-assess-context"><strong>Context: </strong>${escapeAttr(question.context)}</div>` : ""}
      <p class="nw-assess-qprompt">${escapeAttr(question.q || "")}</p>
      <fieldset class="nw-assess-options${isMulti ? " nw-assess-options--multi" : ""}">
        <legend>${typeLabel}</legend>
        ${options.map((opt, i) => `
          <label class="nw-assess-option${isMulti ? " nw-assess-option--multi" : ""}">
            <input type="radio" name="answer" value="${i}" ${String(saved) === String(i) ? "checked" : ""} />
            <span class="nw-assess-option__key">${String.fromCharCode(65 + i)}</span>
            <span class="nw-assess-option__text">${escapeAttr(opt)}</span>
            ${!isMulti ? `<span class="nw-assess-option__check">${icon("check-circle-2")}</span>` : ""}
          </label>
        `).join("")}
      </fieldset>
      ${shouldReviewStage || finalMissed.length ? renderMissedQuestionPrompt(assessment, shouldReviewStage ? stageMissed : finalMissed, question.stage) : ""}
      <div class="nw-assess-qfooter">
        <button class="ghost-action" id="prevAssessmentQuestion" type="button" ${currentIndex === 0 ? "disabled" : ""}>${icon("arrow-left")} Back</button>
        <span class="nw-assess-autosave">${icon("check")} Auto-saved</span>
        <div style="flex:1"></div>
        <button class="primary-action fit" type="submit">${finishingAssessment ? icon("send") + " Submit assessment" : "Next " + icon("arrow-right")}</button>
      </div>
    </form>
  `;
}

function renderMissedQuestionPrompt(assessment, missed, stage) {
  if (!missed.length) return "";
  const questions = (assessment.questions || []).slice(0, 70);
  return `
    <div class="nw-assess-missed">
      <strong>${icon("alert-triangle")} Unanswered questions in ${assessmentStageName(stage)}</strong>
      <p>You skipped ${missed.map((q) => `Question ${questions.findIndex((item) => item.id === q.id) + 1}`).join(", ")}. You can go back now or continue if you meant to leave them blank.</p>
      <div class="nw-assess-missed__links">${missed.map((q) => {
        const idx = questions.findIndex((item) => item.id === q.id);
        return `<button class="ghost-action" type="button" data-assessment-jump="${idx}">${icon("arrow-left")} Go to ${idx + 1}</button>`;
      }).join("")}</div>
    </div>
  `;
}

function isAssessmentExpired(assessment) {
  if (!assessment?.expiresAt || String(assessment.status || "").toLowerCase() === "completed") return false;
  return Date.now() > new Date(assessment.expiresAt).getTime();
}

function renderAssessmentTechIntro(assessment) {
  const role = escapeAttr(assessment.role || "Role assessment");
  const stage1Q = stageQuestions(assessment, 1).length || 50;
  const stage1Min = Number(assessment.technicalMinutes || 60);
  return `
    <div class="nw-assess-wrap">
      ${renderAssessmentChromeSimple(assessment)}
      <div class="nw-assess-body">
        <div class="nw-assess-welcome" style="max-width:860px">
          <div style="display:inline-flex;align-items:center;gap:8px;padding:5px 12px;border-radius:999px;background:#E4F6EF;border:1px solid rgba(16,160,124,0.25);margin-bottom:4px">
            <span style="width:6px;height:6px;border-radius:50%;background:#10A07C;display:inline-block"></span>
            <span style="font-size:11.5px;font-weight:600;color:#0A7C5E;text-transform:uppercase;letter-spacing:0.05em">Part 1 of 2 &middot; Starting now</span>
          </div>
          <h2 class="nw-assess-welcome__title" style="font-size:2.2rem">Role knowledge check.</h2>
          <p class="nw-assess-welcome__desc">The next <strong>${stage1Q} questions</strong> are about the day-to-day of the ${role} role — scenarios, decisions, and judgement calls. We're looking at how you think, not whether you remember definitions.</p>
          <p style="font-size:0.88rem;color:#9AA0A6;margin:0">You have <strong style="color:#5C6066">${stage1Min} minutes</strong> total. Your progress saves automatically after every question. DISC follows when you finish.</p>
          <div class="nw-assess-welcome__cta" style="margin-top:8px">
            <button class="primary-action" id="startAssessment" type="button">${icon("play")} Start Part 1</button>
            <button class="ghost-action" id="backToWelcome" type="button">${icon("arrow-left")} Back</button>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderAssessmentDiscIntro(assessment) {
  const stage1Q = stageQuestions(assessment, 1).length || 50;
  const stage2Q = stageQuestions(assessment, 2).length || 20;
  const stage2Min = Number(assessment.discMinutes || 30);
  const recruiter = escapeAttr(assessment.recruiterName || assessment.recruiter || "your recruiter");
  const discIntroIdx = (assessment.questions || []).findIndex((q) => Number(q.stage || 1) === 2);
  return `
    <div class="nw-assess-wrap">
      ${renderAssessmentChromeSimple(assessment)}
      <div class="nw-assess-body">
        <div style="background:#E4F6EF;border-bottom:1px solid rgba(16,160,124,0.15);padding:13px 20px;display:flex;align-items:center;gap:12px;margin-bottom:24px;border-radius:10px">
          <div style="width:26px;height:26px;border-radius:50%;background:#10A07C;color:#fff;display:flex;align-items:center;justify-content:center;flex-shrink:0">${icon("check")}</div>
          <div style="flex:1">
            <div style="font-size:13px;font-weight:600;color:#0A7C5E">Part 1 complete — nice work.</div>
            <div style="font-size:12px;color:#0A7C5E;margin-top:1px">${stage1Q}/${stage1Q} answered &middot; submitted to ${recruiter} for review</div>
          </div>
          <span class="nw-assess-chip nw-assess-chip--teal">${icon("trophy")} Part 1 done</span>
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
              <p class="nw-assess-part__desc">You'll see ${stage2Q} statements about how you work. For each one, pick the option that's most like you. Go with your gut — there are no right answers. Takes about ${stage2Min} minutes.</p>
            </div>
          </div>
          <div class="nw-assess-rules">
            <div class="nw-assess-rule"><div class="nw-assess-rule__icon" style="color:#AF7AC5">${icon("users-round")}</div><div><strong>No right answers</strong><span>This measures style, not performance.</span></div></div>
            <div class="nw-assess-rule"><div class="nw-assess-rule__icon" style="color:#AF7AC5">${icon("timer")}</div><div><strong>${stage2Min} min total</strong><span>Go with your first instinct.</span></div></div>
            <div class="nw-assess-rule"><div class="nw-assess-rule__icon" style="color:#AF7AC5">${icon("shield-check")}</div><div><strong>Used for fit</strong><span>Helps match you with the right team.</span></div></div>
            <div class="nw-assess-rule"><div class="nw-assess-rule__icon" style="color:#AF7AC5">${icon("check")}</div><div><strong>Auto-saved</strong><span>Progress saves on every answer.</span></div></div>
          </div>
          <div class="nw-assess-welcome__cta" style="margin-top:8px">
            <button class="primary-action" id="startDiscAssessment" data-disc-index="${discIntroIdx >= 0 ? discIntroIdx : 50}" type="button">${icon("play")} Start Part 2</button>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderAssessmentResult(assessment) {
  const candidateName = state.candidate?.name || state.user?.displayName || "";
  const firstName = candidateName.split(" ")[0] || "You";
  const recruiter = escapeAttr(assessment.recruiterName || assessment.recruiter || "your recruiter");
  const stage1Q = stageQuestions(assessment, 1).length || 50;
  const stage2Q = stageQuestions(assessment, 2).length || 20;
  return `
    <div class="nw-assess-complete">
      <div class="nw-assess-complete__hero">
        <div class="nw-assess-complete__icon">
          ${icon("check")}
          <div class="nw-assess-complete__ring1"></div>
          <div class="nw-assess-complete__ring2"></div>
        </div>
        <h2 class="nw-assess-complete__title">You're done, ${escapeAttr(firstName)}.</h2>
        <p class="nw-assess-complete__desc">Your results have been sent to ${recruiter}. They'll reach out personally — usually within a business day.</p>
      </div>
      <div class="nw-assess-complete__chips">
        <span class="nw-assess-complete__chip nw-assess-complete__chip--teal">${icon("clipboard-check")} Part 1 &middot; ${stage1Q}/${stage1Q} answered</span>
        <span class="nw-assess-complete__chip nw-assess-complete__chip--violet">${icon("compass")} Part 2 &middot; ${stage2Q}/${stage2Q} answered</span>
        <span class="nw-assess-complete__chip nw-assess-complete__chip--gray">${icon("check-circle-2")} Assessment complete</span>
      </div>
      <div class="nw-assess-next">
        <div class="nw-assess-next__label">What happens next</div>
        ${[
          { icon: "inbox", title: "Your recruiter reviews your results", desc: `${recruiter} will read your scenarios and DISC profile, usually within one business day.`, when: "Within 24h" },
          { icon: "message-square", title: `A personal note from ${recruiter}`, desc: "Not an automated email. They'll share what stood out and what comes next.", when: "Tomorrow" },
          { icon: "calendar-check", title: "Interview with the hiring team", desc: "If there's a match, you'll get a calendar link to book a slot that works for you.", when: "This week" },
        ].map(({ icon: ic, title, desc, when }, i) => `
          <div class="nw-assess-next__item">
            <div class="nw-assess-next__icon-wrap">
              <div class="nw-assess-next__iconbox">${icon(ic)}</div>
              <div class="nw-assess-next__num">${i + 1}</div>
            </div>
            <div class="nw-assess-next__body">
              <div class="nw-assess-next__title">${title}</div>
              <div class="nw-assess-next__desc">${desc}</div>
            </div>
            <div class="nw-assess-next__when">${when}</div>
          </div>
        `).join("")}
      </div>
      <div class="nw-assess-recruiter">
        <div class="nw-assess-recruiter__avatar">${(assessment.recruiterName || assessment.recruiter || "NW").split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}</div>
        <div style="flex:1">
          <div class="nw-assess-recruiter__label">Your recruiter</div>
          <div class="nw-assess-recruiter__name">${recruiter}</div>
          <div class="nw-assess-recruiter__role">Talent partner &middot; Nearwork</div>
        </div>
        <button class="ghost-action" data-page="recruiter" type="button">${icon("message-circle")} Message recruiter</button>
      </div>
    </div>
  `;
}

function renderAssessmentHistory(assessments, activeId) {
  if (!assessments.length) return "";
  return `
    <section class="nw-panel" style="margin-top:18px;padding-bottom:18px;">
      <div class="nw-panel-head"><div><div class="nw-panel-overline">Assessment center</div><div class="nw-panel-title">Your assessment history</div></div></div>
      <div class="assessment-history-list">
        ${assessments.map((assessment) => `
          <article class="assessment-history-row ${assessment.id === activeId ? "active" : ""}">
            <div><strong>${escapeAttr(assessment.role || "Nearwork assessment")}</strong><span>${escapeAttr(assessment.id || "")}</span></div>
            <div>${escapeAttr(String(assessment.status || "assigned"))}</div>
            <a href="/assessment/${encodeURIComponent(assessment.id)}/start">${assessment.status === "completed" ? "View" : "Continue"}</a>
          </article>
        `).join("")}
      </div>
    </section>
  `;
}

function scoreAssessment(assessment, answers) {
  const questions = assessment.questions || [];
  const technical = questions.filter((q) => q.stage === 1);
  const disc = questions.filter((q) => q.stage === 2);
  const correct = technical.filter((q) => typeof q.correctIndex === "number" && Number(answers[q.id]?.value) === q.correctIndex).length;
  const discAnswered = disc.filter((q) => isAnsweredValue(answers[q.id]?.value ?? answers[q.id])).length;
  return {
    technicalScore: technical.length ? Math.round((correct / technical.length) * 100) : 0,
    discScore: disc.length ? Math.round((discAnswered / disc.length) * 100) : 0
  };
}

function buildDiscProfile(assessment, answers) {
  const totals = { Dominance: 0, Influence: 0, Steadiness: 0, Conscientiousness: 0 };
  (assessment.questions || []).filter((question) => Number(question.stage) === 2).forEach((question) => {
    const value = answers[question.id]?.value;
    if (!isAnsweredValue(value)) return;
    const skill = totals[question.skill] !== undefined ? question.skill : "Steadiness";
    const weight = Math.max(1, 4 - Number(value || 0));
    totals[skill] += weight;
  });
  const sorted = Object.entries(totals).sort((a, b) => b[1] - a[1]);
  const high = sorted[0]?.[0] || "Steadiness";
  const low = sorted[sorted.length - 1]?.[0] || "Dominance";
  const initials = { Dominance: "D", Influence: "I", Steadiness: "S", Conscientiousness: "C" };
  return {
    label: initials[high] || "S",
    high,
    low,
    scores: totals,
    summary: `${high} is the strongest observed DISC tendency; ${low} appears lowest based on this assessment.`
  };
}

async function notifyAssessmentCompletion(assessment, result) {
  const endpoint = "https://admin.nearwork.co/api/send-email";
  const candidateEmail = assessment.candidateEmail || state.user?.email || state.candidate?.email;
  const candidateName = assessment.candidateName || state.candidate?.name || state.user?.displayName || "there";
  const recruiterEmails = normalizeList([assessment.recruiterEmail, assessment.stakeholderEmail, assessment.hiringManagerEmail].filter(Boolean).join(","));
  const requests = [];
  if (candidateEmail) {
    requests.push(fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: candidateEmail,
        templateId: "assessment_completed_candidate",
        data: { name: candidateName, role: assessment.role, actionUrl: "https://talent.nearwork.co/assessment", actionText: "Open assessment center" }
      })
    }));
  }
  const notifyTo = recruiterEmails.length ? recruiterEmails : ["support@nearwork.co"];
  requests.push(fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      to: notifyTo,
      templateId: "assessment_completed_recruiter",
      data: {
        name: "Nearwork team",
        role: assessment.role,
        actionUrl: `https://admin.nearwork.co/assessments/${assessment.id}/questions`,
        actionText: "Review assessment",
        message: `${candidateName} completed the assessment. Overall: ${result.score}%. Technical: ${result.technicalScore}%. DISC: ${result.discProfile?.label || "Submitted"}.`
      }
    })
  }));
  await Promise.allSettled(requests);
}

function renderCvs() {
  const cvs = state.candidate?.cvLibrary || [];
  return `
    <div class="nw-page-head">
      <div class="nw-page-overline">My search</div>
      <h1 class="nw-page-title">CV picker</h1>
      <p class="nw-page-lede">Save multiple resumes and pick the best one for each opening.</p>
    </div>
    <section class="nw-panel" style="margin-top:18px;padding-bottom:18px;">
      <form id="cvForm" class="upload-box">
        ${icon("upload-cloud")}<strong>Upload a CV for this role</strong><p>Save multiple versions and pick the best one for each opening.</p>
        <input name="cv" type="file" accept=".pdf,.doc,.docx" required />
        <input name="label" type="text" placeholder="CV label, e.g. CSM resume" />
        <button class="primary-action fit" type="submit">Upload CV</button>
      </form>
      <div class="cv-list">
        ${cvs.length ? cvs.map((cv) => `<article class="cv-item">${icon("file-text")}<div><strong>${cv.name || cv.fileName}</strong><span>${formatDate(cv.uploadedAt)}</span></div>${cv.url ? `<a href="${cv.url}" target="_blank" rel="noreferrer">Open</a>` : ""}</article>`).join("") : emptyState("No CVs saved yet", "Upload role-specific resumes here.")}
      </div>
    </section>
  `;
}

function renderTips() {
  return `
    <div class="nw-page-head">
      <div class="nw-page-overline">Support</div>
      <h1 class="nw-page-title">Tips</h1>
      <p class="nw-page-lede">Practical prep for US SaaS interviews — short, useful guidance before recruiter screens, assessments, and client interviews.</p>
    </div>
    <section class="tips-grid rich" style="margin-top:18px;">
      ${tips.map((tip, index) => `
        <article class="tip-card">
          <div class="tip-number">${String(index + 1).padStart(2, "0")}</div>
          <span>${tip.tag}</span>
          <h3>${tip.title}</h3>
          <p>${tip.body}</p>
          <div class="tip-actions">${tip.actions.map((action) => `<small>${action}</small>`).join("")}</div>
          <strong>${tip.read} read</strong>
        </article>
      `).join("")}
    </section>
  `;
}

function renderRecruiter() {
  const recruiter = state.candidate?.recruiter || {};
  const bookingUrl = recruiter.bookingUrl || state.candidate?.recruiterBookingUrl || "mailto:support@nearwork.co?subject=Nearwork%20candidate%20question";
  return `
    <div class="nw-page-head">
      <div class="nw-page-overline">Support</div>
      <h1 class="nw-page-title">Recruiter</h1>
      <p class="nw-page-lede">Your Nearwork talent partner — reach out anytime about assessments, interviews, feedback, or CV selection.</p>
    </div>
    <div class="nw-split" style="margin-top:18px;">
      <section class="nw-panel" style="padding-bottom:18px;">
        <div class="nw-panel-head"><div><div class="nw-panel-overline">Recruiter</div><div class="nw-panel-title">Your Nearwork contact</div></div></div>
        ${recruiterCard(true)}
      </section>
      <section class="nw-panel" style="padding-bottom:18px;">
        <div class="nw-panel-head"><div><div class="nw-panel-overline">Booking</div><div class="nw-panel-title">Schedule soon</div></div></div>
        <p class="muted">Ask the Nearwork recruiting team for the earliest available slot. Candidate booking links can be attached to this profile later.</p>
        <a class="primary-action fit" href="${bookingUrl}" target="_blank" rel="noreferrer">${icon("calendar-plus")} Book recruiter call</a>
      </section>
    </div>
  `;
}

function renderProfile() {
  return renderProfileForm("profile");
}

// ─── V2 profile form helpers ─────────────────────────────────────────────────

function pfLabel(text, optional = false) {
  return `<span class="pf-label">${text}${optional ? `<span class="pf-optional">optional</span>` : ""}</span>`;
}

function pfCardHead(iconName, title, badge = "") {
  return `
    <div class="pf-card-head">
      <div class="pf-card-icon">${icon(iconName)}</div>
      <div class="pf-card-title">${title}</div>
      ${badge ? `<span class="pf-card-badge">${badge}</span>` : ""}
    </div>`;
}

function workEntryHtml(index, entry = {}) {
  const i = index;
  const companyInitial = (entry.company || "?")[0].toUpperCase();
  return `
    <div class="pf-sub-card work-entry" data-work-index="${i}">
      <div class="pf-sub-card-left">
        <div class="pf-work-avatar">${companyInitial}</div>
      </div>
      <div class="pf-sub-card-body">
        <div class="pf-field-row">
          <label class="pf-field">
            ${pfLabel("Job title")}
            <input type="text" class="pf-input work-field" data-field="title" value="${escapeAttr(entry.title || "")}" placeholder="e.g. Customer Success Manager" />
          </label>
          <label class="pf-field">
            ${pfLabel("Company")}
            <input type="text" class="pf-input work-field" data-field="company" value="${escapeAttr(entry.company || "")}" placeholder="e.g. Acme Corp" />
          </label>
        </div>
        <div class="pf-field-row pf-field-row--3">
          <label class="pf-field">
            ${pfLabel("From")}
            <input type="text" class="pf-input work-field" data-field="from" value="${escapeAttr(entry.from || "")}" placeholder="2021-03" />
          </label>
          <label class="pf-field">
            ${pfLabel("To")}
            <input type="text" class="pf-input work-field" data-field="to" value="${escapeAttr(entry.to || "")}" placeholder="present" />
          </label>
          <div></div>
        </div>
      </div>
      <button type="button" class="pf-remove-btn remove-work-entry" data-remove="${i}" aria-label="Remove">
        ${icon("x")}
      </button>
    </div>`;
}

const LANGUAGE_LEVELS = ["", "A1", "A2", "B1", "B2", "C1", "C2", "Native"];

function langEntryHtml(index, entry = {}) {
  const i = index;
  const data = typeof entry === "string" ? { name: entry, level: "" } : entry;
  return `
    <div class="pf-sub-card lang-entry" data-lang-index="${i}">
      <div class="pf-sub-card-body">
        <div class="pf-field-row">
          <label class="pf-field">
            ${pfLabel("Language")}
            <input type="text" class="pf-input lang-field" data-field="name" value="${escapeAttr(data.name || "")}" placeholder="e.g. Spanish, French…" />
          </label>
          <label class="pf-field">
            ${pfLabel("Level")}
            <select class="pf-input lang-field" data-field="level">
              ${LANGUAGE_LEVELS.map((level) => `<option value="${level}" ${(data.level || "") === level ? "selected" : ""}>${level || "Select level"}</option>`).join("")}
            </select>
          </label>
        </div>
      </div>
      <button type="button" class="pf-remove-btn remove-lang-entry" data-remove="${i}" aria-label="Remove">
        ${icon("x")}
      </button>
    </div>`;
}

function certEntryHtml(index, entry = {}) {
  const i = index;
  return `
    <div class="pf-sub-card cert-entry" data-cert-index="${i}">
      <div class="pf-sub-card-left">
        <div class="pf-cert-icon">✓</div>
      </div>
      <div class="pf-sub-card-body">
        <div class="pf-field-row">
          <label class="pf-field">
            ${pfLabel("Certificate / Course")}
            <input type="text" class="pf-input cert-field" data-field="name" value="${escapeAttr(entry.name || "")}" placeholder="e.g. Google Analytics" />
          </label>
          <label class="pf-field">
            ${pfLabel("Issuer", true)}
            <input type="text" class="pf-input cert-field" data-field="issuer" value="${escapeAttr(entry.issuer || "")}" placeholder="e.g. Coursera, HubSpot" />
          </label>
        </div>
        <label class="pf-field" style="max-width:200px;">
          ${pfLabel("Date (YYYY-MM)", true)}
          <input type="text" class="pf-input cert-field" data-field="date" value="${escapeAttr(entry.date || "")}" placeholder="2023-06" />
        </label>
      </div>
      <button type="button" class="pf-remove-btn remove-cert-entry" data-remove="${i}" aria-label="Remove">
        ${icon("x")}
      </button>
    </div>`;
}

function renderProfileForm(mode = "profile") {
  const skills = candidateSkills();
  const location = selectedLocation();
  const cities = colombiaLocations[location.department] || [];
  const salaryCurrency = state.candidate?.salaryCurrency || "USD";
  const normalizedSalary = normalizeSalaryValue(state.candidate?.salaryAmount || state.candidate?.salary || state.candidate?.salaryUSD, salaryCurrency);
  const roleGroup = selectedRoleGroup();
  const selectedRole = state.candidate?.targetRole || state.candidate?.headline || "";
  const completion = profileCompletion();
  const checklist = profileChecklist();
  const done = checklist.filter(c => c.done).length;

  return `
    <div class="pf-page">

      <!-- Page header -->
      <div class="pf-page-header">
        <div>
          <div class="pf-page-overline">${mode === "onboarding" ? "Setup" : "Candidate profile"}</div>
          <h1 class="pf-page-title">${mode === "onboarding" ? "Let's build your profile." : "Improve your match quality."}</h1>
        </div>
        <div class="pf-completion-badge">
          <svg viewBox="0 0 40 40" class="pf-completion-ring">
            <circle cx="20" cy="20" r="16" fill="none" stroke="#EBEDF0" stroke-width="3"/>
            <circle cx="20" cy="20" r="16" fill="none" stroke="#10A07C" stroke-width="3"
              stroke-dasharray="${(2*Math.PI*16).toFixed(1)}"
              stroke-dashoffset="${(2*Math.PI*16*(1-completion/100)).toFixed(1)}"
              stroke-linecap="round" transform="rotate(-90 20 20)"/>
          </svg>
          <span class="pf-completion-pct">${completion}%</span>
        </div>
      </div>

      <!-- Progress bar -->
      <div class="pf-progress-bar">
        <div class="pf-progress-fill" style="width:${completion}%;"></div>
      </div>
      <div class="pf-progress-label">${done} of ${checklist.length} sections complete</div>

      <!-- Tabs -->
      <div class="pf-tabs" role="tablist">
        <button type="button" class="pf-tab active" data-tab="profile">${icon("user-round")} Profile</button>
        <button type="button" class="pf-tab" data-tab="skills">${icon("sparkles")} Skills</button>
        <button type="button" class="pf-tab" data-tab="cv">${icon("file-text")} CV</button>
        <button type="button" class="pf-tab" data-tab="experience">${icon("building-2")} Experience</button>
        <button type="button" class="pf-tab" data-tab="certifications">${icon("graduation-cap")} Certifications</button>
      </div>

      <form id="profileForm" class="pf-form">

        <!-- ── Profile ── -->
        <div class="pf-tab-panel" data-tab-panel="profile">

          <!-- ── Identity ── -->
          <div class="pf-card">
            ${pfCardHead("user-round", "Identity")}
            <div class="pf-identity-row">
              <div class="pf-avatar-upload">
                ${avatarMarkup("large")}
                <label class="pf-photo-btn">
                  ${icon("camera")} Change photo
                  <input name="photo" type="file" accept="image/png,image/jpeg,image/webp" style="display:none;" />
                </label>
              </div>
              <div class="pf-field" style="flex:1;">
                ${pfLabel("Full name")}
                <input class="pf-input" name="name" value="${escapeAttr(state.candidate?.name || state.user?.displayName || "")}" placeholder="Your full name" />
              </div>
            </div>
          </div>

          <!-- ── Role ── -->
          <div class="pf-card">
            ${pfCardHead("briefcase-business", "Role applying for")}
            <div class="pf-field-row">
              <label class="pf-field">
                ${pfLabel("Area")}
                <select class="pf-input" name="roleGroup" id="roleGroupSelect">
                  ${roleGroupOptions(roleGroup)}
                </select>
              </label>
              <label class="pf-field">
                ${pfLabel("Target role")}
                <select class="pf-input" name="targetRole" id="targetRoleSelect">
                  ${roleOptionsForGroup(roleGroup, selectedRole)}
                </select>
              </label>
            </div>
          </div>

          <!-- ── Location ── -->
          <div class="pf-card">
            ${pfCardHead("map-pin", "Location")}
            <div class="pf-field-row">
              <label class="pf-field">
                ${pfLabel("Department")}
                <select class="pf-input" name="department" id="departmentSelect">
                  ${Object.keys(colombiaLocations).map((dept) => `<option value="${escapeAttr(dept)}" ${dept === location.department ? "selected" : ""}>${dept}</option>`).join("")}
                </select>
              </label>
              <label class="pf-field">
                ${pfLabel("City")}
                <select class="pf-input" name="city" id="citySelect">
                  ${cities.map((city) => `<option value="${escapeAttr(city)}" ${city === location.city ? "selected" : ""}>${city}</option>`).join("")}
                </select>
              </label>
            </div>
          </div>

          <!-- ── Compensation ── -->
          <div class="pf-card">
            ${pfCardHead("banknote", "Compensation")}
            <label class="pf-field" style="max-width:280px;">
              ${pfLabel("Target monthly salary")}
              <div class="pf-salary-wrap">
                <select id="salaryCurrencyInput" name="salaryCurrency" class="pf-currency-select">
                  <option value="USD" ${normalizedSalary.salaryCurrency === "USD" ? "selected" : ""}>USD</option>
                  <option value="COP" ${normalizedSalary.salaryCurrency === "COP" ? "selected" : ""}>COP</option>
                </select>
                <input class="pf-input pf-salary-input" id="salaryInput" name="salary" value="${escapeAttr(normalizedSalary.salaryAmount ? formatSalaryInputValue(normalizedSalary.salaryAmount, normalizedSalary.salaryCurrency) : "")}" inputmode="numeric" placeholder="2,500" />
              </div>
              <span class="pf-hint">How much you're looking for, per month.</span>
            </label>
          </div>

          <!-- ── English & languages ── -->
          <div class="pf-card" id="langCard">
            ${pfCardHead("languages", "English & languages")}
            <label class="pf-field" style="max-width:280px; margin-bottom:14px;">
              ${pfLabel("English level")}
              <select class="pf-input" name="english">
                ${["", "B1", "B2", "C1", "C2", "Native"].map((level) => `<option value="${level}" ${state.candidate?.english === level ? "selected" : ""}>${level || "Select level"}</option>`).join("")}
              </select>
            </label>
            ${pfLabel("Other languages", true)}
            <p class="pf-hint">Add any other languages you speak and your level in each.</p>
            <div id="langEntries" class="pf-entries">
              ${(state.candidate?.languages || []).map((l, i) => langEntryHtml(i, l)).join("")}
            </div>
            <button type="button" id="addLangEntry" class="pf-add-btn">
              ${icon("plus")} Add language
            </button>
          </div>

          <!-- ── Contact ── -->
          <div class="pf-card">
            ${pfCardHead("phone", "Contact")}
            <div class="pf-field-row">
              <label class="pf-field">
                ${pfLabel("WhatsApp number")}
                <input class="pf-input" name="whatsapp" value="${escapeAttr(state.candidate?.whatsapp || state.candidate?.phone || "")}" inputmode="tel" autocomplete="tel" placeholder="+57 300 123 4567" required />
              </label>
              <label class="pf-field">
                ${pfLabel("LinkedIn", true)}
                <input class="pf-input" name="linkedin" value="${escapeAttr(state.candidate?.linkedin || "")}" placeholder="https://linkedin.com/in/…" />
              </label>
            </div>
          </div>

          <!-- ── Communications ── -->
          <div class="pf-card">
            ${pfCardHead("mail", "Communications")}
            <label class="pf-checkbox-row">
              <input type="checkbox" name="marketingConsent" ${state.candidate?.marketingConsent === true ? "checked" : ""} />
              <span>Send me job opportunities and updates from Nearwork by email</span>
            </label>
            <p class="pf-hint">You can turn this on or off at any time. It won't affect emails about your active applications.</p>
          </div>

          ${mode === "onboarding" ? "" : `
          <!-- ── Danger zone ── -->
          <div class="pf-card pf-danger-card">
            ${pfCardHead("trash-2", "Delete account")}
            <p class="pf-hint">Permanently delete your Nearwork profile, resume, applications, and assessment history. This cannot be undone — you can create a new account with the same email later if you change your mind.</p>
            <button type="button" id="openDeleteAccount" class="pf-danger-btn">
              ${icon("trash-2")} Delete my account
            </button>
          </div>`}

        </div>

        <!-- ── Skills ── -->
        <div class="pf-tab-panel" data-tab-panel="skills" hidden>
          <div class="pf-card">
            ${pfCardHead("sparkles", "Skills", skills.length ? `${skills.length} added` : "")}
            ${skillSearchMarkup(skills)}
          </div>
        </div>

        <!-- ── CV ── -->
        <div class="pf-tab-panel" data-tab-panel="cv" hidden>
          <div class="pf-card" id="profileCvCard">
            ${pfCardHead("file-text", "CV")}
            <p class="pf-hint">Upload the CV you want Nearwork to use for your applications.</p>
            ${state.candidate?.activeCvName || state.candidate?.cvUrl ? `
              <div class="pf-cv-current">
                <div class="pf-cv-icon">${icon("file-text")}</div>
                <div class="pf-cv-info">
                  <strong>${escapeHtml(state.candidate.activeCvName || "CV on file")}</strong>
                  <span>Currently active · upload below to replace</span>
                </div>
                ${state.candidate.cvUrl ? `<a class="pf-cv-open" href="${escapeAttr(state.candidate.cvUrl)}" target="_blank" rel="noreferrer">${icon("external-link")} Open</a>` : ""}
              </div>` : ""}
            <label class="pf-file-label" for="profileCvFileInput">
              ${icon("upload")} Choose file (.pdf, .doc, .docx)
            </label>
            <input id="profileCvFileInput" name="profileCv" type="file" accept=".pdf,.doc,.docx" style="display:none;" />
            <label class="pf-field" style="margin-top:10px;">
              ${pfLabel("CV label", true)}
              <input class="pf-input" name="profileCvLabel" type="text" placeholder="e.g. Customer Success CV" />
            </label>
          </div>
        </div>

        <!-- ── Experience ── -->
        <div class="pf-tab-panel" data-tab-panel="experience" hidden>

          <!-- ── Summary ── -->
          <div class="pf-card">
            ${pfCardHead("align-left", "Summary", "optional")}
            <textarea class="pf-input pf-textarea" name="summary" placeholder="Add a short note about what you do best — 2–3 sentences.">${escapeHtml(state.candidate?.summary || "")}</textarea>
          </div>

          <!-- ── Work history ── -->
          <div class="pf-card" id="workHistoryCard">
            ${pfCardHead("building-2", "Work experience", "optional")}
            <p class="pf-hint">Add your previous roles so recruiters can see your background.</p>
            <div id="workEntries" class="pf-entries">
              ${(state.candidate?.workHistory || []).map((w, i) => workEntryHtml(i, w)).join("")}
            </div>
            <button type="button" id="addWorkEntry" class="pf-add-btn">
              ${icon("plus")} Add position
            </button>
          </div>

        </div>

        <!-- ── Certifications ── -->
        <div class="pf-tab-panel" data-tab-panel="certifications" hidden>
          <div class="pf-card" id="certCard">
            ${pfCardHead("graduation-cap", "Certifications &amp; courses", "optional")}
            <p class="pf-hint">Add certificates, licences, or courses relevant to your work.</p>
            <div id="certEntries" class="pf-entries">
              ${(state.candidate?.certifications || []).map((c, i) => certEntryHtml(i, c)).join("")}
            </div>
            <button type="button" id="addCertEntry" class="pf-add-btn">
              ${icon("plus")} Add certificate
            </button>
          </div>
        </div>

        <input type="hidden" name="mode" value="${mode}" />

        <!-- Save -->
        <div class="pf-footer">
          <button class="pf-save-btn" type="submit">
            ${icon("save")} ${mode === "onboarding" ? "Finish setup" : "Save profile"}
          </button>
          <span class="pf-footer-hint">Changes save to your profile instantly.</span>
        </div>

      </form>

      ${state.showDeleteAccountModal ? `
      <div class="nw-modal-overlay" id="deleteAccountOverlay">
        <div class="nw-modal">
          <h3>Delete your account?</h3>
          <p>This will permanently delete your profile, resume, applications, and assessment history from Nearwork. This cannot be undone.</p>
          <label class="pf-field">
            <span class="pf-label" style="text-transform:none;">Type DELETE to confirm</span>
            <input class="pf-input" id="deleteConfirmInput" autocomplete="off" />
          </label>
          ${state.deleteAccountStatus === "error" ? `<div class="nw-modal-error">${escapeHtml(state.deleteAccountError || "Something went wrong.")}</div>` : ""}
          <div class="nw-modal-actions">
            <button type="button" id="cancelDeleteAccount" class="nw-btn-secondary" ${state.deleteAccountStatus === "deleting" ? "disabled" : ""}>Cancel</button>
            <button type="button" id="confirmDeleteAccount" class="pf-danger-btn" ${state.deleteAccountStatus === "deleting" ? "disabled" : ""}>
              ${state.deleteAccountStatus === "deleting" ? "Deleting…" : "Delete permanently"}
            </button>
          </div>
        </div>
      </div>` : ""}

      ${mode === "profile" && state.showUnsavedChangesModal ? `
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
      </div>` : ""}
    </div>
  `;
}

function profileCompletion() {
  const checklist = profileChecklist();
  const done = checklist.filter((c) => c.done).length;
  return Math.max(25, Math.round((done / checklist.length) * 100));
}

function currentStage() {
  const first = state.applications[0];
  return first?.stage || first?.status || "profile-review";
}

function pipelineView(activeStage) {
  const normalizedStage = String(activeStage || "")
    .toLowerCase()
    .replace(/_/g, "-")
    .replace(/\s+/g, "-");
  const activeIndex = Math.max(0, pipelineStages.findIndex((stage) => normalizedStage.includes(stage.key) || stage.key.includes(normalizedStage)));
  return `<div class="pipeline">${pipelineStages.map((stage, index) => `<article class="${index <= activeIndex ? "done" : ""} ${index === activeIndex ? "current" : ""}"><span>${index + 1}</span><strong>${stage.label}</strong><p>${stage.help}</p></article>`).join("")}</div>`;
}

function noPipelineView() {
  return `
    <div class="nw-empty">
      ${icon("briefcase-business")}
      <strong>No active pipeline yet</strong>
      <p>Browse current openings and apply when you find a role that fits. Nearwork will show your applications here once you apply.</p>
      <div style="display:flex;gap:8px;margin-top:12px;">
        <button class="nw-btn-primary" type="button" data-page="matches">${icon("sparkles")} View matches</button>
        <a class="nw-btn-secondary" href="https://jobs.nearwork.co" target="_blank" rel="noreferrer">${icon("external-link")} Open jobs</a>
      </div>
    </div>
  `;
}

function metricCard(label, value, iconName) {
  return `<article class="metric"><span>${icon(iconName)}</span><p>${label}</p><strong>${value}</strong></article>`;
}

function getLocalAppliedSet() {
  try { return new Set(JSON.parse(localStorage.getItem("nw_talent_applied") || "[]")); } catch { return new Set(); }
}

function jobCard(job) {
  const role = normalizeRole(job);
  // Check Firestore-loaded applications first, then fall back to localStorage
  // so the "Applied" state survives a page refresh even when Firestore reads fail.
  const appliedFromServer = new Set(state.applications.map((item) => item.jobId || item.openingCode)).has(role.code);
  const applied = appliedFromServer || getLocalAppliedSet().has(role.code);
  const matchedSkills = matchingSkillsForJob(role);
  const score = role.match || (matchedSkills.length >= 3 ? Math.min(97, 70 + matchedSkills.length * 4) : null);
  const companyColors = ["#10A07C", "#EC4E7E", "#3B82F6", "#F4A52E"];
  const bg = companyColors[role.orgName.length % companyColors.length];
  const initials = role.orgName.split(/\s+/).slice(0, 2).map(w => w[0]).join("").toUpperCase();
  const openingUrl = `https://jobs.nearwork.co/apply?code=${encodeURIComponent(role.code)}`;
  const chips = (matchedSkills.length ? matchedSkills : role.skills).slice(0, 3);
  return `
    <div class="nw-match-card">
      <div class="nw-match-card-top">
        <div class="nw-match-avatar" style="background:${bg};">${initials}</div>
        ${score ? `<div class="nw-match-score">${score}% match</div>` : ""}
      </div>
      <div class="nw-match-role">${escapeHtml(role.title)}</div>
      <div class="nw-match-company">${escapeHtml(role.orgName)} · ${escapeHtml(role.location)}</div>
      <div class="nw-match-chips">${chips.map(escapeHtml).map((s) => `<span class="nw-match-chip">${s}</span>`).join("")}</div>
      <div class="nw-match-footer">
        <span class="nw-match-salary">${escapeHtml(role.compensation)}</span>
        <button type="button" class="nw-match-view" data-open-url="${escapeAttr(openingUrl)}">View opening ${icon("arrow-up-right")}</button>
      </div>
      <button class="nw-match-applybtn${applied ? " applied" : ""}" type="button" data-apply="${role.code}" ${applied ? "disabled" : ""}>${applied ? `${icon("check")} Applied` : `Apply now ${icon("arrow-right")}`}</button>
    </div>
  `;
}

function applicationCard(application, isLast) {
  const rawStage = String(application.stage || application.status || "applied").toLowerCase();
  const stageIdx = rawStage.includes("offer") ? 4 : rawStage.includes("final") ? 3 : rawStage.includes("interview") ? 2 : rawStage.includes("assessment") ? 1 : 0;
  const company  = application.clientName || application.company || "Nearwork client";
  const initials = company.split(/\s+/).slice(0, 2).map(w => w[0]).join("").toUpperCase();
  const companyColors = ["#10A07C", "#EC4E7E", "#3B82F6", "#F4A52E", "#8B5CF6"];
  const bg = companyColors[company.length % companyColors.length];
  const needsAction = ["action-needed", "interview-scheduled", "assessment-sent"].includes(String(application.status || "").toLowerCase());
  return `
    <div class="nw-app-row${isLast ? " last" : ""}">
      <div class="nw-app-avatar" style="background:${bg};">${initials}</div>
      <div class="nw-app-info">
        <div class="nw-app-title">${escapeHtml(application.jobTitle || application.title || "Application")} <span class="nw-app-company">· ${escapeHtml(company)}</span></div>
        <div class="nw-app-stages">
          ${CANDIDATE_STAGES.map((s, i) => `<div class="nw-stage-pip${i <= stageIdx ? " done" : ""}"></div>`).join("")}
          <span class="nw-app-stage-label">${application.stage || application.status || "Applied"}</span>
        </div>
      </div>
      <div class="nw-app-meta">
        <span class="nw-app-status${needsAction ? " action" : ""}">${application.status || "In review"}</span>
        <div class="nw-app-date">${formatDate(application.updatedAt || application.createdAt)}</div>
      </div>
      ${icon("chevron-right")}
    </div>`;
}

function infoCard(title, body) {
  return `<article class="info-card"><strong>${title}</strong><p>${body}</p></article>`;
}

function recruiterCard(full = false) {
  const recruiter = state.candidate?.recruiter || {};
  const email = recruiter.email || "support@nearwork.co";
  const whatsapp = recruiter.whatsapp || SUPPORT_WHATSAPP;
  const whatsappUrl = recruiter.whatsappUrl || SUPPORT_WHATSAPP_URL;
  return `<article class="recruiter-card"><div class="avatar recruiter-avatar">NW</div><div><strong>${recruiter.name || "Nearwork Support"}</strong><p><a href="mailto:${email}">${email}</a></p><p><a href="${whatsappUrl}" target="_blank" rel="noreferrer">WhatsApp ${whatsapp}</a></p>${full ? `<span>Questions about assessments, interviews, feedback, or CV selection should go here.</span>` : ""}</div></article>`;
}

function emptyState(title, body) {
  return `<div class="empty-state">${icon("inbox")}<strong>${title}</strong><p>${body}</p></div>`;
}

function renderLoading() {
  app.innerHTML = `<main class="loading-screen"><span class="logo-mark">N</span><p>Loading Talent...</p></main>`;
}

async function openWithHandoff(url) {
  try {
    const idToken = await auth.currentUser?.getIdToken().catch(() => '');
    if (idToken) {
      const r = await fetch('/api/auth-handoff', {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + idToken, 'Content-Type': 'application/json' }
      });
      if (r.ok) {
        const { customToken } = await r.json();
        if (customToken) {
          const dest = new URL(url);
          dest.searchParams.set('ct', customToken);
          window.open(dest.toString(), '_blank', 'noreferrer');
          return;
        }
      }
    }
  } catch (_e) {}
  window.open(url, '_blank', 'noreferrer');
}

function bindDashboardEvents() {
  document.querySelector("#signOut")?.addEventListener("click", async () => {
    await signOut(auth);
    if (notificationUnsubscribe) notificationUnsubscribe();
    notificationUnsubscribe = null;
    _onbInitialized = false;
    _profileFormDirty = false;
    _pendingNavTarget = null;
    window.history.pushState({ page: "overview" }, "", "/");
    setState({ user: null, candidate: null, applications: [], assessments: [], jobs: [], view: "login", activePage: "overview", message: "" });
  });
  document.querySelector("#signIn")?.addEventListener("click", () => {
    window.history.pushState({ page: "overview" }, "", "/");
    setState({ view: "login", activePage: "overview", message: "" });
  });
  document.querySelector("#openDeleteAccount")?.addEventListener("click", () => {
    setState({ showDeleteAccountModal: true, deleteAccountStatus: null, deleteAccountError: "" });
  });
  document.querySelector("#cancelDeleteAccount")?.addEventListener("click", () => {
    setState({ showDeleteAccountModal: false, deleteAccountStatus: null, deleteAccountError: "" });
  });
  document.querySelector("#confirmDeleteAccount")?.addEventListener("click", async () => {
    const confirmValue = document.querySelector("#deleteConfirmInput")?.value?.trim();
    if (confirmValue !== "DELETE") {
      setState({ deleteAccountStatus: "error", deleteAccountError: 'Type "DELETE" to confirm.' });
      return;
    }
    setState({ deleteAccountStatus: "deleting" });
    try {
      await deleteOwnAccount();
      await signOut(auth);
      if (notificationUnsubscribe) notificationUnsubscribe();
      notificationUnsubscribe = null;
      _onbInitialized = false;
      _profileFormDirty = false;
      _pendingNavTarget = null;
      window.history.pushState({ page: "overview" }, "", "/");
      setState({
        user: null,
        candidate: null,
        applications: [],
        assessments: [],
        jobs: [],
        view: "login",
        activePage: "overview",
        showDeleteAccountModal: false,
        deleteAccountStatus: null,
        deleteAccountError: "",
        message: "Your account has been deleted. You're welcome to sign up again anytime."
      });
    } catch (error) {
      setState({ deleteAccountStatus: "error", deleteAccountError: error.message || "Failed to delete account." });
    }
  });
  document.querySelectorAll("[data-page]").forEach((button) => {
    button.addEventListener("click", (e) => {
      const target = e.currentTarget.closest("[data-page]") || e.currentTarget;
      const targetPage = target.dataset.page;
      if (state.activePage === "profile" && _profileFormDirty && targetPage !== "profile") {
        _pendingNavTarget = targetPage;
        setState({ showUnsavedChangesModal: true });
        return;
      }
      setActivePage(targetPage);
    });
  });
  document.querySelector("[data-dashboard-home]")?.addEventListener("click", () => {
    if (state.activePage === "profile" && _profileFormDirty) {
      _pendingNavTarget = "overview";
      setState({ showUnsavedChangesModal: true });
      return;
    }
    setActivePage("overview");
  });
  document.querySelector("#cancelUnsavedNav")?.addEventListener("click", () => {
    _pendingNavTarget = null;
    setState({ showUnsavedChangesModal: false });
  });
  document.querySelector("#discardUnsavedNav")?.addEventListener("click", () => {
    _profileFormDirty = false;
    const target = _pendingNavTarget;
    _pendingNavTarget = null;
    setState({ showUnsavedChangesModal: false });
    if (target) setActivePage(target);
  });
  document.querySelector("#saveUnsavedNav")?.addEventListener("click", () => {
    setState({ showUnsavedChangesModal: false });
    document.querySelector("#profileForm")?.requestSubmit();
  });
  document.querySelector("#notificationBell")?.addEventListener("click", () => {
    setState({ notificationPanelOpen: !state.notificationPanelOpen, notificationSettingsOpen: false });
  });
  document.querySelector("#notificationSettings")?.addEventListener("click", () => {
    setState({ notificationSettingsOpen: !state.notificationSettingsOpen, notificationPanelOpen: false });
  });
  document.querySelectorAll("[data-notification-read]").forEach((button) => {
    button.addEventListener("click", async () => {
      const id = button.dataset.notificationRead;
      if (state.user && hasFirebaseConfig) await markNotificationRead(id).catch(() => null);
      setState({ notifications: state.notifications.map((item) => item.id === id ? { ...item, read: true } : item) });
    });
  });
  document.querySelectorAll("[data-notification-pref]").forEach((input) => {
    input.addEventListener("change", async () => {
      const preferences = structuredClone(state.candidate?.notificationPreferences || {});
      const key = input.dataset.notificationPref;
      const channel = input.dataset.channel;
      preferences[key] = { ...(preferences[key] || {}), [channel]: input.checked };
      setState({ candidate: { ...state.candidate, notificationPreferences: preferences } });
      if (state.user && hasFirebaseConfig) await saveNotificationPreferences(state.user.uid, preferences).catch(() => null);
    });
  });
  document.querySelectorAll("[data-assessment-jump]").forEach((button) => {
    button.addEventListener("click", async () => {
      const assessmentId = assessmentIdFromPath() || (state.assessments || [])[0]?.id;
      const assessment = (state.assessments || []).find((item) => item.id === assessmentId);
      const targetIndex = Number(button.dataset.assessmentJump || 0);
      const question = assessment?.questions?.[targetIndex];
      if (!assessmentId || !question) return;
      await saveAssessmentAnswer(assessmentId, "__progress__", "", {
        currentQuestionIndex: targetIndex,
        totalQuestions: assessment?.questions?.length || 70,
        currentStage: question.stage || 1
      });
      setAssessmentQuestionUrl(assessmentId, targetIndex);
      const updatedAssessments = (state.assessments || []).map((item) => item.id === assessmentId
        ? { ...item, currentQuestionIndex: targetIndex, currentStage: question.stage || 1 }
        : item);
      setState({ assessments: updatedAssessments, activePage: "assessment", message: "" });
    });
  });
  document.querySelector("#availability").addEventListener("change", async (event) => {
    const availability = event.target.value;
    setState({ candidate: { ...state.candidate, availability } });
    if (state.user && hasFirebaseConfig) await updateCandidateAvailability(state.user.uid, availability);
    else setState({ message: "Sign in to save availability." });
  });
  document.querySelector("#filterMatches")?.addEventListener("click", () => {
    const hasProfileSignals = candidateSkills().length >= 3;
    setState({
      matchesFiltered: hasProfileSignals ? !state.matchesFiltered : false,
      message: hasProfileSignals ? "" : "Add at least 5 skills in Profile first, then filter matching openings."
    });
  });
  document.querySelector("#departmentSelect")?.addEventListener("change", (event) => {
    const citySelect = document.querySelector("#citySelect");
    const cities = colombiaLocations[event.target.value] || [];
    citySelect.innerHTML = cities.map((city) => `<option value="${escapeAttr(city)}">${city}</option>`).join("");
  });
  document.querySelector("#roleGroupSelect")?.addEventListener("change", (event) => {
    const targetRoleSelect = document.querySelector("#targetRoleSelect");
    targetRoleSelect.innerHTML = roleOptionsForGroup(event.target.value, "");
  });
  document.querySelector("#salaryCurrencyInput")?.addEventListener("change", (event) => {
    const input = document.querySelector("#salaryInput");
    if (!input) return;
    const currency = coerceSalaryCurrency(input.value, event.target.value);
    event.target.value = currency;
    input.placeholder = currency === "COP" ? "5,000,000" : "2,500";
    input.value = formatSalaryInputValue(input.value, currency);
  });
  document.querySelector("#salaryInput")?.addEventListener("blur", (event) => {
    const currencySelect = document.querySelector("#salaryCurrencyInput");
    const currency = coerceSalaryCurrency(event.target.value, currencySelect?.value || "USD");
    if (currencySelect) currencySelect.value = currency;
    event.target.placeholder = currency === "COP" ? "5,000,000" : "2,500";
    event.target.value = formatSalaryInputValue(event.target.value, currency);
  });
  bindOnboardingWizardEvents();
  bindSkillSearch();
  bindCvAutofill();
  bindWorkHistoryEditor();
  bindCertEditor();
  bindLangEditor();
  bindProfileTabs();
  document.querySelectorAll("[data-open-url]").forEach((btn) => {
    btn.addEventListener("click", () => openWithHandoff(btn.dataset.openUrl));
  });
  document.querySelectorAll("[data-apply]").forEach((button) => {
    button.addEventListener("click", async () => {
      const job = state.jobs.map(normalizeRole).find((item) => item.code === button.dataset.apply);
      const code = button.dataset.apply;
      button.disabled = true;
      button.textContent = "Submitted";
      if (state.user && hasFirebaseConfig) {
        // Persist to localStorage immediately so refresh still shows Applied state
        try {
          const _set = getLocalAppliedSet();
          _set.add(code);
          localStorage.setItem("nw_talent_applied", JSON.stringify([..._set]));
        } catch (_e) {}
        await applyToJob(state.user.uid, job);
        await loadDashboard(state.user);
        setActivePage("applications");
      } else {
        setState({ message: "Sign in to apply to this opening." });
      }
    });
  });
  // Welcome → Tech intro
  document.querySelector("#showTechIntro")?.addEventListener("click", () => {
    setState({ assessmentUiStep: "techIntro", message: "" });
  });

  // Tech intro → back to welcome
  document.querySelector("#backToWelcome")?.addEventListener("click", () => {
    setState({ assessmentUiStep: null, message: "" });
  });

  // DISC intro → start Part 2
  document.querySelector("#startDiscAssessment")?.addEventListener("click", async () => {
    const assessmentId = assessmentIdFromPath() || (state.assessments || [])[0]?.id;
    const assessment = (state.assessments || []).find((item) => item.id === assessmentId);
    if (!assessmentId || !assessment) return;
    const questions = assessment.questions || [];
    const discBtn = document.querySelector("#startDiscAssessment");
    const discIndex = discBtn ? Number(discBtn.dataset.discIndex || 50) : questions.findIndex((q) => Number(q.stage || 1) === 2);
    const safeIndex = discIndex >= 0 ? discIndex : 50;
    const discStartedAt = new Date().toISOString();
    try {
      await saveAssessmentAnswer(assessmentId, "__progress__", "", {
        currentQuestionIndex: safeIndex,
        totalQuestions: questions.length,
        currentStage: 2,
        discStartedAt
      });
      setAssessmentQuestionUrl(assessmentId, safeIndex);
      const updatedAssessments = (state.assessments || []).map((item) => item.id === assessmentId
        ? { ...item, currentQuestionIndex: safeIndex, currentStage: 2, discStartedAt }
        : item);
      setState({ assessments: updatedAssessments, activePage: "assessment", assessmentUiStep: null, message: "" });
    } catch (error) {
      setState({ message: friendlyAuthError(error) });
    }
  });

  document.querySelector("#startAssessment")?.addEventListener("click", async () => {
    const assessmentId = assessmentIdFromPath() || (state.assessments || [])[0]?.id;
    const assessment = (state.assessments || []).find((item) => item.id === assessmentId) || (state.assessments || [])[0];
    if (!assessmentId || !state.user) {
      setState({ message: "Please log in to start your assessment." });
      return;
    }
    try {
      await startCandidateAssessment(assessmentId, state.user.uid);
      setAssessmentQuestionUrl(assessmentId, Number(assessment?.currentQuestionIndex || 0), true);
      const updatedAssessments = (state.assessments || []).map((item) => item.id === assessmentId
        ? { ...item, status: "started", startedAt: item.startedAt || new Date().toISOString(), technicalStartedAt: item.technicalStartedAt || new Date().toISOString() }
        : item);
      setState({ assessments: updatedAssessments, activePage: "assessment", assessmentUiStep: null, message: "" });
    } catch (error) {
      setState({ message: friendlyAuthError(error) });
    }
  });
  document.querySelector("#prevAssessmentQuestion")?.addEventListener("click", async () => {
    const assessmentId = assessmentIdFromPath() || (state.assessments || [])[0]?.id;
    const assessment = (state.assessments || []).find((item) => item.id === assessmentId);
    const currentDisplayIndex = Number(document.querySelector("#assessmentQuestionForm")?.dataset.currentIndex ?? assessment?.currentQuestionIndex ?? 0);
    const prevIndex = Math.max(0, currentDisplayIndex - 1);
    const question = assessment?.questions?.[prevIndex];
    await saveAssessmentAnswer(assessmentId, "__progress__", "", {
      currentQuestionIndex: prevIndex,
      totalQuestions: assessment?.questions?.length || 70,
      currentStage: question?.stage || 1
    });
    setAssessmentQuestionUrl(assessmentId, prevIndex);
    const updatedAssessments = (state.assessments || []).map((item) => item.id === assessmentId
      ? { ...item, currentQuestionIndex: prevIndex, currentStage: question?.stage || 1 }
      : item);
    setState({ assessments: updatedAssessments, activePage: "assessment", message: "" });
  });
  document.querySelector("#assessmentQuestionForm")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const assessmentId = assessmentIdFromPath() || (state.assessments || [])[0]?.id;
    const assessment = (state.assessments || []).find((item) => item.id === assessmentId);
    const questions = assessment?.questions || [];
    const currentIndex = Number(event.currentTarget.dataset.currentIndex ?? assessment?.currentQuestionIndex ?? 0);
    const question = questions[currentIndex];
    const answer = new FormData(event.currentTarget).get("answer");
    if (!question) {
      setState({ message: "This question could not be loaded. Please refresh and try again." });
      return;
    }
    const answerPayload = answer === null
      ? { value: "", skipped: true, answeredAt: new Date().toISOString() }
      : { value: Number(answer), skipped: false, answeredAt: new Date().toISOString() };
    const answers = { ...(assessment.answers || {}), [question.id]: answerPayload };
    const nextQuestion = questions[currentIndex + 1];
    const finishesStage = nextQuestion && Number(nextQuestion.stage || 1) !== Number(question.stage || 1);
    const missedThisStage = missedQuestionsForStage(assessment, question.stage, answers);
    try {
      if ((finishesStage || currentIndex + 1 >= questions.length) && missedThisStage.length) {
        await saveAssessmentAnswer(assessmentId, question.id, answers[question.id], {
          currentQuestionIndex: currentIndex,
          totalQuestions: questions.length,
          currentStage: question.stage || 1
        });
        const updatedAssessments = (state.assessments || []).map((item) => item.id === assessmentId
          ? { ...item, answers, currentQuestionIndex: currentIndex, currentStage: question.stage || 1, progress: `${currentIndex + 1}/${questions.length}` }
          : item);
        setState({ assessments: updatedAssessments, activePage: "assessment", message: `You missed ${missedThisStage.length} question${missedThisStage.length === 1 ? "" : "s"} in the ${assessmentStageName(question.stage)}.` });
        return;
      }
      if (currentIndex + 1 >= questions.length) {
        const scores = scoreAssessment(assessment, answers);
        const discProfile = buildDiscProfile(assessment, answers);
        await submitCandidateAssessment(assessmentId, answers, {
          totalQuestions: questions.length,
          technicalScore: scores.technicalScore,
          discScore: scores.discScore,
          score: Math.round((scores.technicalScore * 0.75) + (scores.discScore * 0.25)),
          discProfile
        });
        // Auto-generate AI insights (fire-and-forget — non-blocking)
        fetch("https://admin.nearwork.co/api/generate-assessment-insights", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ assessmentId })
        }).catch(() => null);
        notifyAssessmentCompletion(assessment, {
          score: Math.round((scores.technicalScore * 0.75) + (scores.discScore * 0.25)),
          technicalScore: scores.technicalScore,
          discScore: scores.discScore,
          discProfile
        }).catch((error) => console.warn(error));
        const completedAssessments = (state.assessments || []).map((item) => item.id === assessmentId
          ? { ...item, answers, status: "completed", score: Math.round((scores.technicalScore * 0.75) + (scores.discScore * 0.25)), technical: scores.technicalScore, disc: discProfile.label, discProfile, progress: `${questions.length}/${questions.length}` }
          : item);
        setState({ assessments: completedAssessments, activePage: "assessment", message: "" });
      } else {
        const enteringDisc = question.stage === 1 && nextQuestion?.stage === 2 && !assessment.discStartedAt;
        await saveAssessmentAnswer(assessmentId, question.id, answers[question.id], {
          currentQuestionIndex: currentIndex + 1,
          totalQuestions: questions.length,
          currentStage: nextQuestion?.stage || question.stage || 1,
        });
        setAssessmentQuestionUrl(assessmentId, currentIndex + 1);
        const updatedAssessments = (state.assessments || []).map((item) => item.id === assessmentId
          ? { ...item, answers, currentQuestionIndex: currentIndex + 1, currentStage: nextQuestion?.stage || question.stage || 1, progress: `${currentIndex + 1}/${questions.length}` }
          : item);
        // Show DISC intro screen before the first DISC question
        setState({ assessments: updatedAssessments, activePage: "assessment", message: "", assessmentUiStep: enteringDisc ? "discIntro" : null });
      }
    } catch (error) {
      setState({ message: friendlyAuthError(error) });
    }
  });
  document.querySelector("#profileForm")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const department = form.get("department");
    const city = form.get("city");
    const salary = normalizeSalaryValue(form.get("salary"), form.get("salaryCurrency"));
    const marketingConsent = form.get("marketingConsent") === "on";
    const data = {
      name: form.get("name"),
      targetRole: form.get("targetRole"),
      headline: form.get("targetRole"),
      department,
      city,
      locationId: `${String(city).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-")}-co`,
      location: `${city}, ${department}`,
      locationCity: city,
      locationDepartment: department,
      locationCountry: "Colombia",
      english: form.get("english"),
      salary: salary.salary,
      salaryUSD: salary.salaryUSD,
      salaryAmount: salary.salaryAmount,
      salaryCurrency: salary.salaryCurrency,
      expectedSalaryAmount: salary.salaryAmount,
      expectedSalaryCurrency: salary.salaryCurrency,
      linkedin: form.get("linkedin"),
      whatsapp: form.get("whatsapp"),
      phone: form.get("whatsapp"),
      skills: [...new Set(form.getAll("skills").map(canonicalSkillName).filter(Boolean))],
      otherSkills: [],
      languages: collectLanguages(),
      summary: form.get("summary"),
      email: state.candidate?.email || state.user?.email || "",
      availability: state.candidate?.availability || "open",
      marketingConsent,
      marketingConsentAt: marketingConsent
        ? (state.candidate?.marketingConsent === true ? (state.candidate?.marketingConsentAt || null) : new Date().toISOString())
        : null,
      onboarded: true
    };
    if (!state.user) {
      setState({ candidate: { ...state.candidate, ...data }, message: "Preview updated. Sign in to save this profile." });
      return;
    }
    try {
      const photoFile = form.get("photo");
      let photoURL = state.candidate?.photoURL || state.user?.photoURL || "";
      if (photoFile?.name) {
        photoURL = await uploadCandidatePhoto(state.user.uid, photoFile);
      }

      // CV upload is non-blocking — a Storage failure must not prevent the
      // rest of the profile (name, salary, skills, etc.) from saving.
      // _pendingCvFile holds the file when the CV autofill re-render cleared the input element.
      const cvFile = form.get("profileCv")?.name ? form.get("profileCv") : _pendingCvFile;
      let cv = null;
      let cvUploadFailed = false;
      if (cvFile?.name) {
        try {
          cv = await uploadCandidateCv(state.user.uid, cvFile, form.get("profileCvLabel") || "");
          _pendingCvFile = null;
        } catch {
          cvUploadFailed = true;
        }
      }

      const enrichedData = {
        ...data,
        photoURL,
        // Preserve the existing CAND code so we never create a duplicate candidate doc
        candidateCode: state.candidate?.candidateCode,
        ...(cv ? {
          activeCvId: cv.id,
          activeCvName: cv.name || cv.fileName,
          cvUrl: cv.url,           // synced to candidates collection so Admin can see the file
          cvLibrary: [...(state.candidate?.cvLibrary || []), cv]
        } : {}),
        // Work history: prefer manual entries from the editor when present;
        // fall back to Affinda-parsed data (always for new, only on rewrite for returning).
        workHistory: (() => {
          const manual = collectWorkHistory();
          if (manual.length) return manual;
          if (_cvParsedData?.workHistory?.length && (_cvOverwrite || !state.candidate?.workHistory?.length))
            return _cvParsedData.workHistory;
          return state.candidate?.workHistory || [];
        })(),
        certifications: (() => {
          const manual = collectCertifications();
          if (manual.length) return manual;
          if (_cvParsedData?.certifications?.length && (_cvOverwrite || !state.candidate?.certifications?.length))
            return _cvParsedData.certifications;
          return state.candidate?.certifications || [];
        })()
      };
      _cvParsedData = null; _cvOverwrite = false; // consumed — reset for next upload
      const result = await updateCandidateProfile(state.user.uid, enrichedData);
      const savedMessage = cvUploadFailed
        ? "Profile saved, but the CV failed to upload. Try uploading it again from the CV section."
        : result?.atsSynced === false
          ? "Profile saved. Nearwork will finish connecting it to your workspace."
          : "Profile saved.";
      if (form.get("mode") === "onboarding") {
        window.history.pushState({ page: "overview" }, "", "/");
        setState({ candidate: { ...state.candidate, ...enrichedData }, activePage: "overview", message: "Profile complete. Welcome to Talent." });
      } else {
        _profileFormDirty = false;
        setState({ candidate: { ...state.candidate, ...enrichedData }, message: savedMessage, showUnsavedChangesModal: false });
        if (_pendingNavTarget) {
          const target = _pendingNavTarget;
          _pendingNavTarget = null;
          setActivePage(target);
        }
      }
    } catch (error) {
      setState({ message: friendlyAuthError(error) });
    }
  });
  document.querySelector("#cvForm")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const file = form.get("cv");
    if (!file?.name) return;
    if (!state.user) {
      setState({ message: "Sign in to upload and store CVs." });
      return;
    }
    try {
      const cv = await uploadCandidateCv(state.user.uid, file, form.get("label"));
      setState({
        candidate: {
          ...state.candidate,
          cvLibrary: [...(state.candidate?.cvLibrary || []), cv],
          activeCvId: cv.id
        },
        message: "CV uploaded."
      });
    } catch (error) {
      setState({ message: friendlyAuthError(error) });
    }
  });
}

// ─── CV autofill (Affinda) ────────────────────────────────────────────────────
// NEW CANDIDATE  — the form is hidden behind the CV upload. Everything stays
//                  locked until Affinda finishes (or the user clicks "skip").
// RETURNING CANDIDATE — form shows normally. Uploading a new CV reveals a
//                  toggle "Update my profile from this CV" (default: off).

// ─── Work history editor (profile page) ──────────────────────────────────────
// Manages add/remove of work experience rows in the profile form.
// Entries are read from the DOM on form submit via collectWorkHistory().

// ─── Profile tabs ──────────────────────────────────────────────────────────
// Switches between the Profile / Skills / CV / Experience / Certifications
// panels. Hidden panels stay in the DOM (and in the form), so saving still
// collects every field regardless of which tab is active. If a required
// field in a hidden tab fails validation on submit, jump to its tab so the
// browser's validation message is visible.

function bindProfileTabs() {
  const tabs = document.querySelectorAll(".pf-tab");
  const panels = document.querySelectorAll(".pf-tab-panel");
  if (!tabs.length || !panels.length) return;

  const activate = (target) => {
    tabs.forEach((t) => t.classList.toggle("active", t.dataset.tab === target));
    panels.forEach((p) => { p.hidden = p.dataset.tabPanel !== target; });
  };

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => activate(tab.dataset.tab));
  });

  document.querySelector("#profileForm")?.addEventListener("invalid", (event) => {
    const panel = event.target.closest(".pf-tab-panel");
    if (panel) activate(panel.dataset.tabPanel);
  }, true);

  // Track unsaved edits so we can warn before the candidate navigates away.
  const form = document.querySelector("#profileForm");
  form?.addEventListener("input", () => { _profileFormDirty = true; });
  form?.addEventListener("change", () => { _profileFormDirty = true; });
}

function bindWorkHistoryEditor() {
  const container = document.querySelector("#workHistoryCard");
  if (!container) return;
  let nextIndex = container.querySelectorAll(".work-entry").length;

  container.addEventListener("click", (e) => {
    // Remove entry
    const removeBtn = e.target.closest(".remove-work-entry");
    if (removeBtn) {
      removeBtn.closest(".work-entry")?.remove();
      _profileFormDirty = true;
      return;
    }
    // Add entry
    if (e.target.closest("#addWorkEntry")) {
      const entries = document.querySelector("#workEntries");
      if (!entries) return;
      const div = document.createElement("div");
      div.innerHTML = workEntryHtml(nextIndex++, {});
      entries.appendChild(div.firstElementChild);
      _profileFormDirty = true;
    }
  });
}

function collectWorkHistory() {
  return [...document.querySelectorAll(".work-entry")].map((row) => {
    const f = (field) => row.querySelector(`[data-field="${field}"]`)?.value?.trim() || "";
    return { title: f("title"), company: f("company"), from: f("from"), to: f("to") };
  }).filter((w) => w.title || w.company);
}

function bindLangEditor() {
  const container = document.querySelector("#langCard");
  if (!container) return;
  let nextIndex = container.querySelectorAll(".lang-entry").length;

  container.addEventListener("click", (e) => {
    const removeBtn = e.target.closest(".remove-lang-entry");
    if (removeBtn) { removeBtn.closest(".lang-entry")?.remove(); _profileFormDirty = true; return; }
    if (e.target.closest("#addLangEntry")) {
      const entries = document.querySelector("#langEntries");
      if (!entries) return;
      const div = document.createElement("div");
      div.innerHTML = langEntryHtml(nextIndex++, {});
      entries.appendChild(div.firstElementChild);
      _profileFormDirty = true;
    }
  });
}

function collectLanguages() {
  return [...document.querySelectorAll(".lang-entry")].map((row) => {
    const f = (field) => row.querySelector(`[data-field="${field}"]`)?.value?.trim() || "";
    return { name: f("name"), level: f("level") };
  }).filter((l) => l.name);
}

function bindCertEditor() {
  const container = document.querySelector("#certCard");
  if (!container) return;
  let nextIndex = container.querySelectorAll(".cert-entry").length;

  container.addEventListener("click", (e) => {
    const removeBtn = e.target.closest(".remove-cert-entry");
    if (removeBtn) { removeBtn.closest(".cert-entry")?.remove(); _profileFormDirty = true; return; }
    if (e.target.closest("#addCertEntry")) {
      const entries = document.querySelector("#certEntries");
      if (!entries) return;
      const div = document.createElement("div");
      div.innerHTML = certEntryHtml(nextIndex++, {});
      entries.appendChild(div.firstElementChild);
      _profileFormDirty = true;
    }
  });
}

function collectCertifications() {
  return [...document.querySelectorAll(".cert-entry")].map((row) => {
    const f = (field) => row.querySelector(`[data-field="${field}"]`)?.value?.trim() || "";
    return { name: f("name"), issuer: f("issuer"), date: f("date") };
  }).filter((c) => c.name);
}

function bindCvAutofill() {
  const form    = document.querySelector("#profileForm");
  const cvInput = form?.querySelector('input[name="profileCv"]');
  if (!form || !cvInput) return;

  // A candidate is "new" if they haven't onboarded yet and have no profile data
  const isNew = form.querySelector('input[name="mode"]')?.value === "onboarding"
    && !state.candidate?.skills?.length
    && !state.candidate?.workHistory?.length
    && !state.candidate?.name;

  if (isNew) {
    _bindNewCandidateCvGate(form, cvInput);
  } else {
    _bindReturnCandidateCvToggle(cvInput);
  }
}

// ── New candidate: gate the form behind the CV upload ────────────────────────

function _bindNewCandidateCvGate(form, cvInput) {
  const cvCard = document.querySelector("#profileCvCard");
  if (!cvCard) return;

  // Hide every direct child of the form except the CV card and hidden inputs
  const hideable = [...form.children].filter(
    (el) => el !== cvCard && el.type !== "hidden" && el.getAttribute("name") !== "mode"
  );
  hideable.forEach((el) => { el.style.display = "none"; });

  // Gate prompt
  const gate = document.createElement("p");
  gate.id = "cvGatePrompt";
  gate.style.cssText = "font-size:13px;color:var(--mid);margin:10px 0 4px;text-align:center;";
  gate.innerHTML = `Upload your CV and we'll fill in the rest for you — or <button type="button" id="skipCvParse" style="background:none;border:none;padding:0;font-size:13px;color:var(--green);cursor:pointer;text-decoration:underline;">skip and fill in manually</button>`;
  cvCard.insertAdjacentElement("afterend", gate);

  function revealForm() {
    document.querySelector("#cvGatePrompt")?.remove();
    document.querySelector("#cvParseLoading")?.remove();
    hideable.forEach((el) => { el.style.display = ""; });
  }

  document.querySelector("#skipCvParse")?.addEventListener("click", revealForm);

  cvInput.addEventListener("change", async () => {
    const file = cvInput.files?.[0];
    if (!file) return;

    // Replace gate with loading message — form stays hidden
    document.querySelector("#cvGatePrompt")?.remove();
    const loading = document.createElement("p");
    loading.id = "cvParseLoading";
    loading.style.cssText = "font-size:13px;font-weight:600;color:var(--green);padding:14px 0;text-align:center;";
    loading.textContent = "Analysing your CV…";
    cvCard.insertAdjacentElement("afterend", loading);

    _cvParsedData = null;
    _cvOverwrite  = true; // new candidate — always overwrite (nothing to protect)
    const parsed  = await parseCvWithAffinda(file);

    revealForm(); // always reveal, even if parsing failed

    if (!parsed) return;

    _cvParsedData = parsed;
    _applyParsedToForm(parsed, true);
    _showCvParseBanner(parsed, cvInput);
  });
}

// ── Returning candidate: auto-apply on file select ────────────────────────────

function _bindReturnCandidateCvToggle(cvInput) {
  cvInput.addEventListener("change", async () => {
    const file = cvInput.files?.[0];
    if (!file) return;

    _cvParsedData  = null;
    _cvOverwrite   = false;
    _pendingCvFile = null;

    // Show "Analysing…" via the flash bar so it survives any notification-triggered re-render
    setState({ message: "⏳ Analysing your CV — this takes up to 30 seconds…" });

    const parsed = await parseCvWithAffinda(file);

    if (!parsed) {
      setState({ message: "⚠️ Could not read your CV. Check the browser console for details, or try a different file." });
      return;
    }

    _cvParsedData  = parsed;
    _cvOverwrite   = true;
    _pendingCvFile = file; // held so the submit handler can upload it after re-render clears the input

    // Merge parsed data into state.candidate and do ONE re-render — renderProfileForm
    // reads every field from state.candidate so everything appears pre-filled automatically.
    const c = state.candidate || {};
    const mergedCandidate = {
      ...c,
      ...(parsed.name    ? { name: parsed.name }                          : {}),
      ...(parsed.phone   ? { whatsapp: parsed.phone, phone: parsed.phone } : {}),
      ...(parsed.summary ? { summary: parsed.summary }                     : {}),
      skills:         parsed.skills?.length
        ? [...new Set(parsed.skills.map(canonicalSkillName).filter(Boolean))]
        : c.skills || [],
      workHistory:    parsed.workHistory?.length    ? parsed.workHistory    : c.workHistory    || [],
      certifications: parsed.certifications?.length ? parsed.certifications : c.certifications || [],
      languages:      parsed.languages?.length      ? parsed.languages      : c.languages      || [],
    };

    const parts = [];
    if (parsed.name)                   parts.push("name");
    if (parsed.phone)                  parts.push("phone");
    if (parsed.summary)                parts.push("summary");
    if (parsed.skills?.length)         parts.push(`${parsed.skills.length} skill${parsed.skills.length !== 1 ? "s" : ""}`);
    if (parsed.workHistory?.length)    parts.push(`${parsed.workHistory.length} role${parsed.workHistory.length !== 1 ? "s" : ""}`);
    if (parsed.certifications?.length) parts.push(`${parsed.certifications.length} cert${parsed.certifications.length !== 1 ? "s" : ""}`);
    if (parsed.languages?.length)      parts.push("languages");

    const msg = parts.length
      ? `✓ Pre-filled from CV: ${parts.join(", ")}. Review and save your profile.`
      : "✓ CV analysed. Review your profile and save.";

    setState({ candidate: mergedCandidate, message: msg });
  });
}

// ── Shared helpers ────────────────────────────────────────────────────────────

function _applyParsedToForm(parsed, overwrite) {
  const set = (sel, val) => {
    const el = document.querySelector(sel);
    if (el && val && (overwrite || !el.value?.trim())) el.value = val;
  };
  set('input[name="name"]',       parsed.name);
  set('input[name="whatsapp"]',   parsed.phone);
  set('textarea[name="summary"]', parsed.summary);

  if (parsed.skills?.length) {
    const wrap = document.querySelector("#selectedSkills");
    if (wrap) {
      if (overwrite) wrap.innerHTML = "";
      const existing = new Set([...wrap.querySelectorAll('input[name="skills"]')].map((i) => i.value.toLowerCase()));
      wrap.querySelector(".skill-empty")?.remove();
      const canonical = [...new Set(parsed.skills.map(canonicalSkillName).filter(Boolean))];
      canonical.forEach((skill) => {
        if (existing.has(skill.toLowerCase())) return;
        existing.add(skill.toLowerCase());
        const span = document.createElement("span");
        span.className = "selected-skill";
        span.setAttribute("data-skill-chip", skill);
        span.innerHTML = `${escapeHtml(skill)}<button type="button" class="skill-remove" data-remove-skill="${escapeAttr(skill)}" aria-label="Remove ${escapeAttr(skill)}">×</button><input type="hidden" name="skills" value="${escapeAttr(skill)}" />`;
        wrap.appendChild(span);
      });
    }
  }

  if (parsed.workHistory?.length) {
    const entries = document.querySelector("#workEntries");
    if (entries) {
      if (overwrite) entries.innerHTML = "";
      let idx = entries.querySelectorAll(".work-entry").length;
      parsed.workHistory.forEach((w) => {
        const div = document.createElement("div");
        div.innerHTML = workEntryHtml(idx++, w);
        entries.appendChild(div.firstElementChild);
      });
    }
  }

  if (parsed.languages?.length) {
    const entries = document.querySelector("#langEntries");
    if (entries) {
      if (overwrite) entries.innerHTML = "";
      let idx = entries.querySelectorAll(".lang-entry").length;
      parsed.languages.forEach((l) => {
        const div = document.createElement("div");
        div.innerHTML = langEntryHtml(idx++, l);
        entries.appendChild(div.firstElementChild);
      });
    }
  }

  if (parsed.certifications?.length) {
    const certEntries = document.querySelector("#certEntries");
    if (certEntries) {
      if (overwrite) certEntries.innerHTML = "";
      let idx = certEntries.querySelectorAll(".cert-entry").length;
      parsed.certifications.forEach((c) => {
        const div = document.createElement("div");
        div.innerHTML = certEntryHtml(idx++, c);
        certEntries.appendChild(div.firstElementChild);
      });
    }
  }

  syncIcons();
}

function _showCvParseBanner(parsed, cvInput) {
  const parts = [];
  if (parsed.name)                    parts.push("name");
  if (parsed.phone)                   parts.push("phone");
  if (parsed.skills?.length)          parts.push(`${parsed.skills.length} skill${parsed.skills.length > 1 ? "s" : ""}`);
  if (parsed.workHistory?.length)     parts.push(`${parsed.workHistory.length} role${parsed.workHistory.length > 1 ? "s" : ""}`);
  if (parsed.certifications?.length)  parts.push(`${parsed.certifications.length} cert${parsed.certifications.length > 1 ? "s" : ""}`);
  if (parsed.languages?.length)       parts.push(`languages`);

  document.querySelector("#cvParseHint")?.remove();
  const hint = document.createElement("p");
  hint.id = "cvParseHint";
  hint.style.cssText = "font-size:12px;color:var(--green);margin:4px 0 0;";
  hint.innerHTML = parts.length
    ? `✓ Pre-filled: <strong>${parts.join(", ")}</strong>. Review and save.`
    : "✓ CV analysed. Review your profile and save.";
  cvInput.insertAdjacentElement("afterend", hint);
}

function bindSkillSearch() {
  const shell = document.querySelector("[data-skill-search]");
  if (!shell) return;
  const input = shell.querySelector("#skillSearchInput");
  const suggestions = shell.querySelector("#skillSuggestions");
  const selectedWrap = shell.querySelector("#selectedSkills");

  const selected = () => [...selectedWrap.querySelectorAll('input[name="skills"]')].map((item) => item.value);
  const renderSelected = (skills) => {
    selectedWrap.innerHTML = skills.length ? skills.map((skill) => `
      <span class="selected-skill" data-skill-chip="${escapeAttr(skill)}">
        ${escapeHtml(skill)}
        <button type="button" class="skill-remove" data-remove-skill="${escapeAttr(skill)}" aria-label="Remove ${escapeAttr(skill)}">×</button>
        <input type="hidden" name="skills" value="${escapeAttr(skill)}" />
      </span>`).join("") : '<span class="skill-empty">Selected skills will appear here.</span>';
  };
  const renderSuggestions = () => {
    const queryText = normalizeSkillName(input.value);
    const rawText   = input.value.trim();
    const current   = new Set(selected().map(normalizeSkillName));
    const matches   = ALL_SKILLS
      .filter((skill) => !current.has(normalizeSkillName(skill)))
      .filter((skill) => !queryText || normalizeSkillName(skill).includes(queryText))
      .slice(0, 12);
    // When the user has typed something, always offer to add their exact text
    const exactMatch  = matches.find((s) => normalizeSkillName(s) === queryText);
    const showCustom  = rawText.length > 1 && !current.has(normalizeSkillName(rawText)) && !exactMatch;
    const customBtn   = showCustom ? `<button type="button" class="skill-suggestion add-custom" data-skill="${escapeAttr(rawText)}">+ Add "${escapeHtml(rawText)}"</button>` : "";
    suggestions.innerHTML = customBtn + matches.map((skill) =>
      `<button type="button" class="skill-suggestion" data-skill="${escapeAttr(skill)}">${escapeHtml(skill)}</button>`
    ).join("");
  };
  const addSkill = (value) => {
    const raw   = (value || input.value).trim();
    const skill = canonicalSkillName(raw);
    if (!skill) return;
    const normalized = normalizeSkillName(skill);
    const current = selected();
    if (current.length >= 20 && !current.some((item) => normalizeSkillName(item) === normalized)) {
      input.value = "";
      return;
    }
    const next = [...current.filter((item) => normalizeSkillName(item) !== normalized), skill];
    renderSelected(next);
    input.value = "";
    renderSuggestions();
    _profileFormDirty = true;
  };

  input?.addEventListener("input", renderSuggestions);
  input?.addEventListener("focus", renderSuggestions);
  input?.addEventListener("keydown", (event) => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    // Prefer an exact catalog match, otherwise add exactly what was typed
    const queryText = normalizeSkillName(input.value);
    const exactBtn  = [...suggestions.querySelectorAll(".skill-suggestion:not(.add-custom)")].find((b) => normalizeSkillName(b.dataset.skill) === queryText);
    addSkill(exactBtn?.dataset.skill || input.value);
  });
  shell.querySelector("#addTypedSkill")?.addEventListener("click", () => addSkill(input.value));
  suggestions.addEventListener("click", (event) => {
    const button = event.target.closest("[data-skill]");
    if (button) addSkill(button.dataset.skill);
  });
  selectedWrap.addEventListener("click", (event) => {
    const button = event.target.closest("[data-remove-skill]");
    if (!button) return;
    const remove = normalizeSkillName(button.dataset.removeSkill);
    renderSelected(selected().filter((skill) => normalizeSkillName(skill) !== remove));
    renderSuggestions();
    _profileFormDirty = true;
  });
}

function render() {
  if (state.loading) return renderLoading();
  if (state.view === "reset-password") return renderResetPassword();
  if (state.view === "dashboard") return renderDashboard();
  renderLogin();
}

window.addEventListener("popstate", () => {
  if (window.location.pathname === "/reset-password") {
    setState({ view: "reset-password", resetCodeStatus: null, resetCodeError: "" });
    return;
  }
  const page = pageFromPath();
  if (page === "overview" && !state.user) {
    setState({ view: "login", activePage: "overview", message: "" });
  } else if (state.view === "dashboard") {
    setActivePage(page, false);
  } else {
    loadPublicPage();
  }
});

// Cross-domain sign-in handoff from jobs.nearwork.co: ?ct=<customToken>
const _pendingCt = new URLSearchParams(window.location.search).get('ct');
if (_pendingCt) window.history.replaceState({}, '', window.location.pathname);
let _ctPending = Boolean(_pendingCt);

if (hasFirebaseConfig) {
  onAuthStateChanged(auth, (user) => {
    if (_ctPending) return;
    if (user) {
      loadDashboard(user);
    } else {
      try { localStorage.removeItem("nw_talent_applied"); } catch {}
      loadPublicPage();
    }
  });
  window.setTimeout(() => {
    if (state.loading) {
      _ctPending = false;
      loadPublicPage();
    }
  }, 2500);
  if (_pendingCt) {
    signInWithHandoffToken(_pendingCt)
      .then((cred) => { _ctPending = false; loadDashboard(cred.user); })
      .catch(() => { _ctPending = false; loadPublicPage(); });
  }
} else {
  loadPublicPage();
}
