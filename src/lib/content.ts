/**
 * All public-site copy in one place, drawn from the PEEPs strategic roadmap.
 * Edit here; pages read from these structures.
 */

export const COMPANY = {
  name: "PEEPs.HR Partners",
  short: "PEEPs",
  tagline: "Identified. Screened. Assessed. Prepared.",
  email: "hello@peeps.hr",
  phone: "+234 800 000 0000",
  city: "Abuja, Nigeria",
  positioning:
    "PEEPs.HR Partners connects organisations with verified, assessed and professionally prepared talent, while providing recruitment, workforce development and business-support services.",
};

export const LIFECYCLE = [
  {
    key: "train",
    label: "Train",
    title: "Talent is developed",
    body: "Our training-school and partner network develops professionals in finance, technology, automotive and more. That gives us a pipeline most agencies spend years building.",
  },
  {
    key: "assess",
    label: "Assess",
    title: "Competence is measured",
    body: "Each candidate is interviewed and given a technical assessment designed for their profession. An accountant's assessment looks nothing like a mechanic's.",
  },
  {
    key: "prepare",
    label: "Prepare",
    title: "Candidates are made ready",
    body: "We review CVs honestly, coach for interviews, and confirm availability and salary expectations, so nobody arrives unprepared.",
  },
  {
    key: "match",
    label: "Match",
    title: "Fit is evidenced",
    body: "Vacancy analysis comes first. Then we match on skills, experience, location, salary and readiness, and every recommendation comes with its reasoning.",
  },
  {
    key: "deploy",
    label: "Deploy",
    title: "People start work",
    body: "Permanent hires, contract teams or managed workforce. We coordinate interviews, offers, onboarding and probation monitoring.",
  },
  {
    key: "develop",
    label: "Develop",
    title: "The loop closes",
    body: "Employer feedback goes back to our training partners. We find out what's missing and use it to develop the next cohort.",
  },
] as const;

export const DIVISIONS = [
  {
    slug: "talent",
    name: "PEEPs Talent",
    kicker: "Recruitment & placement",
    summary: "Permanent recruitment, executive search and specialist placement, delivered through the PEEPs methodology.",
    lead: "You get five qualified, evidenced candidates instead of a hundred CVs.",
    services: [
      { title: "Professional Recruitment", body: "End-to-end recruitment: vacancy analysis, sourcing, screening, interviews, technical assessment, reference checks and an evidence-based shortlist." },
      { title: "Executive Search", body: "A discreet search for CEOs, CFOs, COOs, general managers and directors, combining market mapping, direct approach and in-depth leadership assessment." },
      { title: "Specialist Placement", body: "Hard-to-find technical talent, including EV and CNG technicians, auditors, data analysts and fleet managers, drawn from our vertical talent pools." },
      { title: "Independent Assessment", body: "If you already run your own recruitment, we can act as your independent assessor and run interviews and technical tests on your shortlist." },
    ],
    outcomes: ["Shorter time to hire", "Fewer bad hires", "A documented reason for every recommendation"],
  },
  {
    slug: "academy",
    name: "PEEPs Academy",
    kicker: "Training & employability",
    summary: "Talent Ready programmes, professional development and employer-sponsored training that build the skills employers say are missing.",
    lead: "If the market doesn't have the people you need, we'll help build them.",
    services: [
      { title: "Talent Ready Programmes", body: "CV review, technical assessment, interview practice, workplace ethics and corporate etiquette. Graduates join a PEEPs talent pool." },
      { title: "Employer-Sponsored Training", body: "Tell us the skills you need. We design a programme with our partners, train the cohort and supply candidates to your specification." },
      { title: "Professional Exam Preparation", body: "We work with professional training schools on ACCA, ICAN, financial modelling and other programmes." },
      { title: "Career Development", body: "Optional CV development, interview coaching, LinkedIn optimisation and career-transition support for individuals." },
    ],
    outcomes: ["A talent pipeline built to your needs", "Skills gaps closed before hiring", "Graduates who are ready for work"],
  },
  {
    slug: "professional",
    name: "PEEPs Professional",
    kicker: "Finance & business advisory",
    summary: "Accounting, tax, audit support, financial modelling, CFO advisory and business-process work, delivered by people who have done these jobs themselves.",
    lead: "The same team that understands your hiring also understands your business.",
    services: [
      { title: "Accounting & Reporting", body: "Bookkeeping oversight, financial reporting, management reporting and budgeting." },
      { title: "Tax & Audit Support", body: "Tax advisory, internal audit, and coordination and preparation for external audits." },
      { title: "CFO Advisory & Modelling", body: "Financial modelling, CFO-level advisory, restructuring support and investor-ready numbers." },
      { title: "HR & Business Process", body: "HR advisory, SOP development, business process review and corporate governance." },
    ],
    outcomes: ["Cleaner numbers", "Stronger controls", "Decisions you can defend"],
  },
  {
    slug: "workforce",
    name: "PEEPs Workforce",
    kicker: "Staffing & outsourcing",
    summary: "Contract staffing, temporary teams, outsourcing and workforce administration. You get the people, and we manage the arrangement.",
    lead: "Need twenty accountants for six months? We can recruit, deploy and manage them.",
    services: [
      { title: "Contract & Project Staffing", body: "Assessed professionals deployed for defined projects, with replacement cover if someone leaves." },
      { title: "Temporary Staffing", body: "Short-term cover for peaks, leave and urgent gaps, drawn from pre-assessed pools." },
      { title: "Outsourced Teams", body: "Complete functions such as front desk, drivers, accounts support or workshop technicians, managed under one contract." },
      { title: "Workforce Administration", body: "Payroll administration, documentation, attendance and compliance for deployed staff." },
    ],
    outcomes: ["Flexible headcount", "One invoice, one point of contact", "Staff you know are qualified"],
  },
] as const;
export type DivisionSlug = (typeof DIVISIONS)[number]["slug"];

export const VERTICALS = [
  {
    slug: "finance-professional",
    name: "Finance & Professional",
    launch: true,
    sectors: ["ACC", "AUD"],
    blurb: "Accountants, auditors, tax officers and analysts, many drawn from ACCA, ICAN and financial modelling programmes.",
    why: "Through our training-school relationship we reach candidates who are currently studying for professional qualifications. We screen and assess them against your exact requirements.",
    roles: ["Accountants", "Audit associates", "Internal auditors", "Tax officers", "Financial analysts", "Financial controllers", "CFO-track professionals"],
    assessment: ["Excel", "Accounting principles", "Financial reporting", "Tax", "Financial analysis"],
  },
  {
    slug: "business-administration",
    name: "Business & Administration",
    launch: true,
    sectors: ["HRA", "SAL", "EXE"],
    blurb: "HR, administration, sales, customer service, operations and management talent.",
    why: "These roles depend on judgement and communication. Our structured interview scores both, so the shortlist reflects more than polished CVs.",
    roles: ["HR officers", "Administrative officers", "Executive assistants", "Office managers", "Sales executives", "Customer service", "Operations managers"],
    assessment: ["Office software", "Organisation", "Business writing", "Corporate etiquette", "Communication"],
  },
  {
    slug: "automotive-technical",
    name: "Automotive & Technical",
    launch: true,
    sectors: ["AUT", "DRV", "ENG"],
    blurb: "Mechanics, diagnostic and EV/CNG technicians, painters, PPF installers, detailers, drivers and fleet personnel.",
    why: "Our existing automobile network gives us an unusual edge. We assess practical skills in the workshop as well as on paper.",
    roles: ["Mechanics", "Auto electricians", "Diagnostic technicians", "Panel beaters & painters", "PPF & window-film installers", "Service advisors", "EV & CNG technicians", "Drivers & fleet managers"],
    assessment: ["Diagnostics", "Mechanical knowledge", "Observed practical task", "Workshop safety", "Route and vehicle knowledge (drivers)"],
  },
  {
    slug: "technology",
    name: "Technology",
    launch: false,
    sectors: ["ITD"],
    blurb: "Developers, IT support, data analysts, network and cybersecurity professionals, sourced through partner academies.",
    why: "We use timed practical tasks alongside interviews to test real ability as well as stated experience.",
    roles: ["Developers", "IT support", "Data analysts", "Network engineers", "Cybersecurity analysts", "Digital professionals"],
    assessment: ["Technical fundamentals", "Tools & stack", "Practical task", "Troubleshooting"],
  },
  {
    slug: "hospitality",
    name: "Hospitality",
    launch: false,
    sectors: ["HOS"],
    blurb: "Chefs, cooks, front-of-house, housekeeping and hotel and restaurant management.",
    why: "We run practical cook and service tests and check hygiene standards before anyone joins a hospitality talent pool.",
    roles: ["Chefs & cooks", "Waiters", "Front-desk officers", "Housekeeping", "Restaurant supervisors", "Hotel managers"],
    assessment: ["Technical ability", "Menu knowledge", "Hygiene", "Practical assessment"],
  },
] as const;

export const SELECTION_STEPS = [
  { title: "Registration", body: "Candidates submit their profile, qualifications, experience, desired role, location and salary expectations, and give explicit consent for us to process their data." },
  { title: "CV review", body: "A consultant reviews structure, career history, gaps, achievements, errors and suitability for the role. We repackage CVs honestly and never exaggerate them." },
  { title: "Verification", body: "We confirm identity. Education and professional qualifications are verified with the institution or awarding body where applicable." },
  { title: "Interview", body: "A structured preliminary interview scores communication, professionalism, knowledge, experience, attitude, problem solving and role suitability." },
  { title: "Assessment", body: "A sector-specific technical assessment: Excel and IFRS for accountants, diagnostics for mechanics, routes and safety for drivers, a practical cook for chefs." },
  { title: "Reference checking", body: "Where appropriate we contact previous employers, professional referees and training institutions." },
  { title: "Classification", body: "We give each candidate an internal classification of Entry, Competent, Experienced or Specialist, with a written rationale based on the evidence. We don't use simplistic numerical scores." },
  { title: "Employer matching", body: "Vacancy analysis comes first. We then match on skills, experience, location, salary and readiness, and the employer receives a shortlist report with the evidence behind each candidate." },
] as const;

export const QUALITY_FRAMEWORK = [
  { area: "Identity", standard: "Verified" },
  { area: "Qualification", standard: "Verified where applicable" },
  { area: "Experience", standard: "Checked" },
  { area: "Technical competence", standard: "Assessed where applicable" },
  { area: "Communication", standard: "Assessed" },
  { area: "References", standard: "Checked where applicable" },
  { area: "Availability", standard: "Confirmed" },
  { area: "Salary expectations", standard: "Confirmed" },
  { area: "Role suitability", standard: "Assessed" },
] as const;

export const EMPLOYER_PROCESS = [
  { title: "Employer registration", body: "You tell us the role, headcount, salary range, experience, qualifications and deadline." },
  { title: "Vacancy analysis", body: "Before we send any CVs, we work out what kind of person will actually succeed in your organisation." },
  { title: "Talent search", body: "We search the PEEPs registry, training-school students, partner centres and professional networks." },
  { title: "Screening", body: "Every applicant is screened against the agreed criteria." },
  { title: "Shortlist", body: "You receive around five qualified candidates, each with an assessment report." },
  { title: "Interview coordination", body: "We schedule interviews, or run preliminary and technical rounds for you." },
  { title: "Selection", body: "You choose. We gather feedback from both sides." },
  { title: "Offer & onboarding", body: "We support offer documentation, final checks, onboarding and probation monitoring." },
] as const;

export const CAREER_SERVICES = [
  { title: "CV development", body: "We turn your CV into a clear, honest PEEPs Professional CV." },
  { title: "Interview preparation", body: "Mock interviews with structured feedback against our scoring criteria." },
  { title: "Career coaching", body: "One-to-one sessions on direction, progression and career transitions." },
  { title: "Professional assessments", body: "Find out where you stand technically before an employer does." },
  { title: "LinkedIn & profile optimisation", body: "Present your experience professionally online." },
  { title: "Training & exam preparation", body: "ACCA, ICAN, financial modelling and partner programmes." },
] as const;

export const VALUES = [
  { title: "Evidence over claims", body: "We say what we have checked, and nothing more. A PEEPs badge always has a record behind it." },
  { title: "Fair to candidates", body: "Employers pay for recruitment. We never charge jobseekers placement fees." },
  { title: "Partners, not vendors", body: "We aim to understand your organisation before we recommend anyone to it." },
  { title: "Close the loop", body: "Employer feedback goes back into training, so the talent pipeline keeps improving." },
  { title: "Confidentiality", body: "Candidate data is handled with consent and care, in line with the Nigeria Data Protection Act." },
] as const;

export const ROADMAP = [
  {
    phase: "Phase 1",
    window: "Months 0–6",
    title: "Build credibility",
    points: ["Recruitment and candidate database", "Screening and assessment", "Finance and automotive talent pools", "First 10–20 corporate clients"],
  },
  {
    phase: "Phase 2",
    window: "Months 6–18",
    title: "Build the platform",
    points: ["Candidate and employer portals", "Online assessments", "Contract staffing and outsourcing", "Executive search"],
  },
  {
    phase: "Phase 3",
    window: "Months 18–36",
    title: "Become a talent marketplace",
    points: ["Training providers and assessors on-platform", "Matching and recommendations", "International partners", "Nigeria ↔ international talent desk"],
  },
] as const;

export const PARTNER_TYPES_COPY = [
  { title: "Professional training institutions", body: "ACCA, ICAN and financial modelling schools whose students make up our finance talent pool." },
  { title: "Universities & polytechnics", body: "Graduate pipelines with employability preparation built in." },
  { title: "Technical & automotive centres", body: "Mechanics, EV/CNG and trade technicians, assessed in the workshop." },
  { title: "IT academies", body: "Developers, data and support talent, tested with practical tasks." },
  { title: "Professional & industry associations", body: "Credential verification and access to experienced members." },
  { title: "International recruitment partners", body: "Specialist talent that is hard to source locally (later phase)." },
] as const;

export const FAQS = [
  {
    q: "How is PEEPs different from a job board?",
    a: "Job boards hold millions of CVs and leave the screening to you. We identify, screen, verify and assess candidates before they reach you. You get a short list, and every name on it comes with evidence.",
  },
  {
    q: "Do candidates pay to be placed?",
    a: "No. Employers pay for recruitment. Candidates can choose optional career-development services such as CV development or interview coaching, but these are never a condition of being put forward for a job.",
  },
  {
    q: "What does “PEEPs Verified” actually mean?",
    a: "It means we have confirmed the candidate's identity and, where applicable, their education and professional qualifications. Uploading a CV never earns a badge. Each stage on our quality ladder needs recorded evidence.",
  },
  {
    q: "Which sectors do you recruit for?",
    a: "We launched with three verticals: Finance & Professional, Business & Administration, and Automotive & Technical. Technology and Hospitality talent pools are growing through partner academies.",
  },
  {
    q: "Can PEEPs train candidates to our specification?",
    a: "Yes. Through PEEPs Academy and our training partners, we can design an employer-sponsored programme, train the cohort and supply graduates who match your requirements.",
  },
  {
    q: "How do you protect candidate data?",
    a: "We collect explicit, versioned consent at registration and limit employer access to shortlisted profiles. We share contact details only once an interview is agreed, and we handle personal data in line with the Nigeria Data Protection Act 2023.",
  },
] as const;

export const SAMPLE_PROFILE = {
  pepId: "PEP-ACC-000231",
  name: "Sample candidate",
  profession: "Accountant",
  experience: "4 years",
  qualification: "B.Sc Accounting",
  professional: "ICAN (in progress)",
  location: "Abuja",
  availability: "Immediate",
  classification: "Competent",
  checks: [
    { label: "Identity", status: "Verified" },
    { label: "Employment history", status: "Verified" },
    { label: "Excel", status: "Assessed" },
    { label: "Financial reporting", status: "Assessed" },
    { label: "Communication", status: "Interviewed" },
    { label: "References", status: "Checked" },
  ],
} as const;
