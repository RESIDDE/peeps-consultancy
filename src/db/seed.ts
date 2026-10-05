/**
 * Seeds a fictional but realistic PEEPs operating dataset. Every person and
 * company here is invented. Candidate stages are derived with the same
 * computeStage() the app uses, so the ladder is always evidence-consistent.
 */
import { hashPassword } from "better-auth/crypto";
import { eq } from "drizzle-orm";
import { db } from "./index";
import * as s from "./schema";
import { computeStage, type CheckRecord, type CheckType, type CheckStatus } from "../lib/quality";
import { scoreMatch } from "../lib/matching";
import { formatPepId } from "../lib/pep-id";
import { INTERVIEW_TEMPLATE, templateForSector, type SectorCode } from "../lib/taxonomy";
import { CONSENT_VERSION } from "../lib/consent";

const DEMO_PASSWORD = "peeps-demo-2026";
const NOW = Date.now();
const DAY = 86_400_000;
const daysAgo = (d: number) => new Date(NOW - d * DAY);

/* Deterministic PRNG so every reset produces the same dataset. */
let seed = 20261004;
function rand() {
  seed |= 0;
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
const pick = <T,>(arr: readonly T[]): T => arr[Math.floor(rand() * arr.length)];
const between = (min: number, max: number) => Math.floor(min + rand() * (max - min + 1));
const sample = <T,>(arr: readonly T[], n: number): T[] => {
  const copy = [...arr];
  const out: T[] = [];
  while (out.length < n && copy.length) out.push(copy.splice(Math.floor(rand() * copy.length), 1)[0]);
  return out;
};
const roundTo = (n: number, step: number) => Math.round(n / step) * step;

/* ------------------------------------------------------------------ */

const FIRST = [
  "Chiamaka", "Tunde", "Aisha", "Emeka", "Folake", "Ibrahim", "Ngozi", "Segun", "Zainab", "Obinna",
  "Funmilayo", "Musa", "Adaeze", "Kelechi", "Halima", "Babatunde", "Ifeoma", "Yusuf", "Temitope", "Chidi",
  "Amina", "Olumide", "Blessing", "Uche", "Hauwa", "Damilola", "Nnamdi", "Fatima", "Kehinde", "Ebuka",
  "Rukayat", "Ikechukwu", "Bisola", "Abdullahi", "Chinonso", "Morenike", "Sani", "Ifeanyi", "Precious", "Tobiloba",
  "Esther", "Godwin",
];
const LAST = [
  "Okafor", "Adeyemi", "Bello", "Eze", "Ogunleye", "Abubakar", "Nwosu", "Balogun", "Mohammed", "Okonkwo",
  "Adebayo", "Usman", "Chukwu", "Olawale", "Danjuma", "Obi", "Afolabi", "Ibrahim", "Nnaji", "Akande",
  "Lawal", "Onyeka", "Salami", "Garba", "Ezeh", "Ajayi", "Okeke", "Yakubu", "Amadi", "Oyelaran",
];
const STATE_OF: Record<string, string> = {
  Abuja: "FCT", Lagos: "Lagos", "Port Harcourt": "Rivers", Kano: "Kano", Ibadan: "Oyo", Enugu: "Enugu",
};
const CITIES = ["Abuja", "Abuja", "Abuja", "Lagos", "Lagos", "Port Harcourt", "Kano", "Ibadan", "Enugu"];

interface SectorProfile {
  professions: string[];
  skills: string[];
  software: string[];
  qualifications: string[];
  training: string[];
  institutions: string[];
  degrees: string[];
  salary: [number, number];
  years: [number, number];
  employers: string[];
  needsProfQual: boolean;
}

const PROFILES: Partial<Record<SectorCode, SectorProfile>> = {
  ACC: {
    professions: ["Accountant", "Accounts Officer", "Financial Analyst", "Financial Controller"],
    skills: ["Excel", "IFRS", "Financial reporting", "Reconciliation", "Payroll", "Budgeting", "Tax computation", "Financial modelling"],
    software: ["Sage", "QuickBooks", "SAP", "Power BI"],
    qualifications: ["ICAN (in progress)", "ACCA (in progress)", "ICAN", "ACCA"],
    training: ["ACCA", "ICAN", "Financial modelling"],
    institutions: ["University of Abuja", "University of Lagos", "University of Nigeria, Nsukka", "Ahmadu Bello University"],
    degrees: ["B.Sc Accounting", "B.Sc Accounting", "B.Sc Banking & Finance", "HND Accountancy"],
    salary: [180_000, 650_000],
    years: [1, 9],
    employers: ["a mid-sized audit firm", "a microfinance bank", "a logistics company", "an FMCG distributor"],
    needsProfQual: true,
  },
  AUD: {
    professions: ["Audit Associate", "Internal Auditor", "Tax Officer"],
    skills: ["Audit planning", "Internal controls", "IFRS", "Tax computation", "Excel", "Risk assessment"],
    software: ["CaseWare", "Excel", "IDEA"],
    qualifications: ["ICAN", "ACA", "CITN", "CISA (in progress)"],
    training: ["ICAN", "Financial modelling"],
    institutions: ["Obafemi Awolowo University", "University of Benin", "Lagos State University"],
    degrees: ["B.Sc Accounting", "B.Sc Accounting"],
    salary: [220_000, 700_000],
    years: [2, 8],
    employers: ["an audit and assurance firm", "a manufacturing group", "a state revenue service"],
    needsProfQual: true,
  },
  HRA: {
    professions: ["HR Officer", "Administrative Officer", "Executive Assistant", "Office Manager"],
    skills: ["Recruitment", "HR administration", "Payroll", "Minutes & correspondence", "Scheduling", "Customer service", "Record keeping"],
    software: ["MS Office", "Google Workspace", "Excel"],
    qualifications: ["CIPM (in progress)", "CIPM", "NIM"],
    training: ["PEEPs Talent Ready — Administration"],
    institutions: ["University of Ibadan", "Bayero University Kano", "Nnamdi Azikiwe University"],
    degrees: ["B.Sc Business Administration", "B.A English", "B.Sc Public Administration"],
    salary: [120_000, 450_000],
    years: [1, 10],
    employers: ["an NGO programme office", "a property company", "a private hospital"],
    needsProfQual: false,
  },
  SAL: {
    professions: ["Sales Executive", "Customer Service Officer", "Business Development Officer"],
    skills: ["Prospecting", "Negotiation", "Customer service", "CRM", "Presentation", "Complaint resolution"],
    software: ["HubSpot", "Excel", "Salesforce"],
    qualifications: [],
    training: ["PEEPs Talent Ready — Sales"],
    institutions: ["University of Port Harcourt", "Covenant University", "Federal Polytechnic Nekede"],
    degrees: ["B.Sc Marketing", "HND Business Administration"],
    salary: [120_000, 400_000],
    years: [1, 7],
    employers: ["a telecom dealer", "an automobile dealership", "a retail chain"],
    needsProfQual: false,
  },
  ITD: {
    professions: ["Software Developer", "IT Support Officer", "Data Analyst", "Network Engineer"],
    skills: ["JavaScript", "React", "SQL", "Python", "Networking", "Power BI", "Linux", "Troubleshooting"],
    software: ["Git", "AWS", "Excel", "Active Directory"],
    qualifications: ["CCNA", "CompTIA A+", "Google Data Analytics"],
    training: ["Partner IT academy — Data Analytics", "Partner IT academy — Full-stack"],
    institutions: ["Federal University of Technology, Akure", "University of Lagos", "Yaba College of Technology"],
    degrees: ["B.Sc Computer Science", "B.Eng Electrical Engineering", "HND Computer Science"],
    salary: [200_000, 900_000],
    years: [1, 8],
    employers: ["a fintech startup", "a systems integrator", "a bank's IT unit"],
    needsProfQual: false,
  },
  AUT: {
    professions: ["Mechanic", "Diagnostic Technician", "Auto Electrician", "EV Technician", "CNG Technician", "Auto Painter", "PPF Installer", "Service Advisor"],
    skills: ["Engine diagnostics", "OBD-II scanning", "Brake systems", "Auto electrical", "EV systems", "CNG conversion", "Spray painting", "PPF installation", "Detailing"],
    software: ["Launch X431", "Autel MaxiSys"],
    qualifications: ["Trade Test I", "Trade Test II", "NABTEB", "OEM certification"],
    training: ["Partner automotive centre — EV systems", "Partner automotive centre — CNG conversion"],
    institutions: ["Government Technical College", "Federal Polytechnic", "Partner automotive centre"],
    degrees: ["NABTEB Motor Vehicle Mechanics", "OND Mechanical Engineering", "Trade certificate"],
    salary: [90_000, 380_000],
    years: [1, 12],
    employers: ["a franchise dealership workshop", "an independent garage", "a fleet maintenance yard"],
    needsProfQual: true,
  },
  DRV: {
    professions: ["Driver", "Fleet Manager"],
    skills: ["Defensive driving", "Route planning", "Vehicle checks", "Logbook management", "Fleet tracking"],
    software: ["Fleet tracking app"],
    qualifications: ["FRSC licence (Class E)", "Defensive driving certificate"],
    training: [],
    institutions: ["Government Secondary School"],
    degrees: ["SSCE"],
    salary: [80_000, 250_000],
    years: [2, 14],
    employers: ["a haulage company", "an embassy motor pool", "a corporate executive fleet"],
    needsProfQual: true,
  },
  HOS: {
    professions: ["Chef", "Cook", "Front-desk Officer", "Restaurant Supervisor"],
    skills: ["Continental cuisine", "Nigerian cuisine", "Food hygiene", "Pastry", "Front desk", "Inventory control"],
    software: ["Opera PMS", "POS"],
    qualifications: ["Food hygiene certificate", "Culinary diploma"],
    training: ["Partner culinary school"],
    institutions: ["Partner culinary school", "Federal Polytechnic Bauchi"],
    degrees: ["OND Hospitality Management", "Culinary diploma"],
    salary: [80_000, 350_000],
    years: [1, 10],
    employers: ["a boutique hotel", "a restaurant group", "a corporate canteen operator"],
    needsProfQual: false,
  },
  EXE: {
    professions: ["Finance Director", "General Manager"],
    skills: ["Strategy", "P&L management", "Team leadership", "Stakeholder management", "Financial planning", "Excel"],
    software: ["SAP", "Power BI"],
    qualifications: ["ICAN", "ACCA", "MBA"],
    training: ["Financial modelling"],
    institutions: ["Lagos Business School", "University of Nigeria, Nsukka"],
    degrees: ["MBA", "B.Sc Accounting"],
    salary: [1_500_000, 3_500_000],
    years: [12, 20],
    employers: ["a manufacturing group", "a regional distribution company"],
    needsProfQual: true,
  },
};

/** Which sectors, how many, and target evidence level for each candidate. */
type Level = "registered" | "screened" | "verified" | "assessed" | "ready";
const PLAN: [SectorCode, Level][] = [
  ["ACC", "ready"], ["ACC", "ready"], ["ACC", "ready"], ["ACC", "ready"], ["ACC", "assessed"], ["ACC", "assessed"],
  ["ACC", "verified"], ["ACC", "screened"], ["ACC", "registered"], ["ACC", "registered"],
  ["AUD", "ready"], ["AUD", "ready"], ["AUD", "verified"], ["AUD", "screened"],
  ["HRA", "ready"], ["HRA", "ready"], ["HRA", "assessed"], ["HRA", "verified"], ["HRA", "registered"], ["HRA", "screened"],
  ["SAL", "ready"], ["SAL", "assessed"], ["SAL", "registered"],
  ["ITD", "ready"], ["ITD", "assessed"], ["ITD", "verified"], ["ITD", "screened"], ["ITD", "registered"],
  ["AUT", "ready"], ["AUT", "ready"], ["AUT", "ready"], ["AUT", "assessed"], ["AUT", "verified"], ["AUT", "screened"], ["AUT", "registered"],
  ["DRV", "ready"], ["DRV", "ready"], ["DRV", "verified"],
  ["HOS", "ready"], ["HOS", "ready"], ["HOS", "screened"],
  ["EXE", "ready"],
];

const LEVEL_ORDER: Level[] = ["registered", "screened", "verified", "assessed", "ready"];
const atLeast = (lvl: Level, target: Level) => LEVEL_ORDER.indexOf(lvl) >= LEVEL_ORDER.indexOf(target);

async function main() {
  const existing = await db.select({ id: s.user.id }).from(s.user).limit(1);
  if (existing.length) {
    console.log("Database already has users — run `npm run db:reset` to wipe and reseed.");
    return;
  }

  /* ---------------- Users ---------------- */
  const hash = await hashPassword(DEMO_PASSWORD);
  async function makeUser(name: string, email: string, role: s.Role) {
    const id = crypto.randomUUID();
    await db.insert(s.user).values({ id, name, email, role, emailVerified: true, createdAt: daysAgo(150), updatedAt: daysAgo(150) });
    await db.insert(s.account).values({
      id: crypto.randomUUID(),
      accountId: id,
      providerId: "credential",
      userId: id,
      password: hash,
      createdAt: daysAgo(150),
      updatedAt: daysAgo(150),
    });
    return id;
  }
  const adminId = await makeUser("Admin", "admin@peeps.local", "admin");
  const recruiterId = await makeUser("Ada Nwankwo", "recruiter@peeps.local", "recruiter");
  const employerUserId = await makeUser("Kunle Adesanya", "employer@peeps.local", "employer");
  const candidateUserId = await makeUser("Chiamaka Okafor", "candidate@peeps.local", "candidate");
  const staff = [adminId, recruiterId];

  /* ---------------- Partners ---------------- */
  const partnerRows = await db
    .insert(s.partners)
    .values([
      { name: "Apex Professional Training School", type: "training_school", city: "Abuja", contactName: "Programme Director", contactEmail: "programmes@apex-training.example", programmes: ["ACCA", "ICAN", "Financial modelling"], mouStatus: "signed", notes: "Founding pipeline partner. Quarterly talent-day with final-level students.", createdAt: daysAgo(160) },
      { name: "Torque Automotive Skills Centre", type: "automotive", city: "Lagos", contactName: "Head of Training", contactEmail: "training@torque-skills.example", programmes: ["EV systems", "CNG conversion", "Diagnostics"], mouStatus: "signed", notes: "Practical assessments run in their workshop.", createdAt: daysAgo(140) },
      { name: "CodeBridge Academy", type: "it_academy", city: "Abuja", contactName: "Placement Lead", contactEmail: "placements@codebridge.example", programmes: ["Data Analytics", "Full-stack"], mouStatus: "in_discussion", createdAt: daysAgo(90) },
      { name: "Savory Culinary Institute", type: "technical", city: "Abuja", contactName: "Principal", contactEmail: "office@savory-culinary.example", programmes: ["Professional cookery", "Pastry"], mouStatus: "in_discussion", createdAt: daysAgo(70) },
      { name: "Federal Polytechnic (Careers Office)", type: "polytechnic", city: "Kaduna", contactName: "Careers Officer", contactEmail: "careers@fedpoly.example", programmes: ["HND Accountancy", "HND Computer Science"], mouStatus: "prospect", createdAt: daysAgo(30) },
      { name: "Institute of HR Practitioners (Abuja Chapter)", type: "association", city: "Abuja", contactName: "Chapter Secretary", contactEmail: "secretary@ihrp.example", programmes: [], mouStatus: "prospect", createdAt: daysAgo(20) },
    ])
    .returning();
  const partnerFor = (code: SectorCode) =>
    code === "ACC" || code === "AUD" || code === "EXE"
      ? partnerRows[0]
      : code === "AUT"
        ? partnerRows[1]
        : code === "ITD"
          ? partnerRows[2]
          : code === "HOS"
            ? partnerRows[3]
            : null;

  /* ---------------- Candidates ---------------- */
  const counters: Partial<Record<SectorCode, number>> = {};
  const usedNames = new Set<string>();
  type SeedCandidate = s.Candidate & { level: Level };
  const seeded: SeedCandidate[] = [];

  for (let i = 0; i < PLAN.length; i++) {
    const [code, level] = PLAN[i];
    const p = PROFILES[code]!;
    let first: string, last: string;
    if (i === 0) {
      first = "Chiamaka";
      last = "Okafor";
    } else {
      do {
        first = pick(FIRST);
        last = pick(LAST);
      } while (usedNames.has(`${first} ${last}`));
    }
    usedNames.add(`${first} ${last}`);

    counters[code] = (counters[code] ?? 0) + 1;
    const pepId = formatPepId(code, 100 + counters[code]! * 7);
    const city = i === 0 ? "Abuja" : pick(CITIES);
    const years = i === 0 ? 4 : between(...p.years);
    const profession = i === 0 ? "Accountant" : pick(p.professions);
    const salaryMin = roundTo(between(p.salary[0], p.salary[1]), 10_000);
    const partner = partnerFor(code);
    const source = partner && rand() < 0.65 ? (partner.type === "training_school" ? "training_school" : "partner") : pick(["website", "referral", "social", "university", "campaign"]);
    const createdAt = level === "ready" ? daysAgo(between(130, 175)) : daysAgo(between(5, 120));
    const prevEmployer = pick(p.employers);
    const quals = p.qualifications.length ? sample(p.qualifications, between(1, Math.min(2, p.qualifications.length))) : [];

    const [row] = await db
      .insert(s.candidates)
      .values({
        pepId,
        userId: i === 0 ? candidateUserId : null,
        firstName: first,
        lastName: last,
        email: `${first}.${last}${i}@example.com`.toLowerCase(),
        phone: `+234 80${between(1, 9)} ${between(100, 999)} ${between(1000, 9999)}`,
        city,
        state: STATE_OF[city] ?? null,
        sectorCode: code,
        profession,
        headline: `${profession} · ${years} yr${years === 1 ? "" : "s"} experience`,
        summary: `${profession} with ${years} years' experience, most recently at ${prevEmployer}. ${quals.length ? `Holds ${quals.join(" and ")}.` : ""}`.trim(),
        yearsExperience: years,
        currentEmployer: rand() < 0.5 ? null : prevEmployer.replace(/^an? /, "").replace(/^./, (c) => c.toUpperCase()),
        employmentStatus: pick(["employed", "employed", "unemployed", "self_employed", "nysc"]),
        availability: pick(["immediate", "immediate", "two_weeks", "one_month", "three_months"]),
        employmentTypes: sample(["full_time", "full_time", "contract", "temporary", "remote"], 2).filter((v, j, a) => a.indexOf(v) === j),
        preferredLocations: sample(["Abuja", "Lagos", "Port Harcourt"], between(0, 2)),
        willingToRelocate: rand() < 0.4,
        salaryMin,
        salaryMax: roundTo(salaryMin * (1.2 + rand() * 0.3), 10_000),
        skills: i === 0 ? ["Excel", "IFRS", "Financial reporting", "Reconciliation", "Tax computation"] : sample(p.skills, between(3, 5)),
        software: i === 0 ? ["Sage", "QuickBooks"] : sample(p.software, between(1, 2)),
        languages: ["English", pick(["Yoruba", "Igbo", "Hausa", "Pidgin"])],
        education: [{ institution: pick(p.institutions), qualification: pick(p.degrees), year: String(2026 - years - between(1, 3)) }],
        qualifications: i === 0 ? ["ICAN (in progress)"] : quals,
        training: p.training.length && rand() < 0.7 ? sample(p.training, 1) : [],
        experience: years > 0
          ? [{ employer: prevEmployer.replace(/^an? /, "").replace(/^./, (c) => c.toUpperCase()), title: profession, start: String(2026 - years), end: "Present", summary: `Core ${profession.toLowerCase()} responsibilities.` }]
          : [],
        source,
        partnerId: source === "training_school" || source === "partner" ? partner?.id ?? null : null,
        consentAt: createdAt,
        consentVersion: CONSENT_VERSION,
        createdAt,
        updatedAt: createdAt,
      })
      .returning();
    seeded.push({ ...row, level: i === 0 ? "assessed" : level });
  }

  /* ---------------- Checks, assessments, classification ---------------- */
  const classifyFor = (years: number) => (years >= 12 ? "specialist" : years >= 6 ? "experienced" : years >= 2 ? "competent" : "entry");
  const RATIONALE: Record<string, string> = {
    entry: "Trained and assessed with limited workplace history; strong fundamentals in the technical assessment. Suited to structured junior roles.",
    competent: "Verified history in comparable roles; assessment shows independent performance on core tasks; references positive.",
    experienced: "Several years of verified, relevant experience; scored proficient-to-advanced across technical criteria; strong references.",
    specialist: "Deep, evidenced expertise at senior level; leadership assessment and referee feedback confirm specialist standing.",
  };

  for (const c of seeded) {
    const p = PROFILES[c.sectorCode as SectorCode]!;
    const t0 = c.createdAt.getTime();
    const checks: { type: CheckType; status: CheckStatus; notes: string; at: number }[] = [];
    const add = (type: CheckType, status: CheckStatus, notes: string, offsetDays: number) =>
      checks.push({ type, status, notes, at: Math.min(t0 + offsetDays * DAY, NOW - DAY) });

    if (atLeast(c.level, "screened")) add("cv_review", "passed", "CV structure and history reviewed; PEEPs Professional CV prepared.", 2);
    if (atLeast(c.level, "verified")) {
      add("identity", "passed", "NIN slip and photo ID sighted and matched in person.", 5);
      add("education", "passed", `${c.education[0]?.qualification ?? "Certificate"} sighted; institution confirmation received.`, 8);
      if (p.needsProfQual && c.qualifications.length) {
        add("professional_qualification", "passed", `${c.qualifications[0]} confirmed with awarding body.`, 9);
      } else {
        add("professional_qualification", "not_applicable", "Target roles do not require a professional qualification.", 9);
      }
    } else if (c.level === "screened") {
      add("identity", "pending", "Awaiting ID document upload.", 3);
      // One realistic failed check for the console's "blocked" state.
      if (c.sectorCode === "AUD") {
        add("education", "failed", "Institution could not confirm the certificate number provided. Original requested.", 6);
      }
    }
    if (atLeast(c.level, "assessed")) {
      add("interview", "passed", "Structured preliminary interview completed.", 12);
      add("skills_assessment", "passed", `${templateForSector(c.sectorCode).name} assessment completed.`, 14);
    } else if (c.level === "verified") {
      add("interview", "pending", "Interview slot offered.", 10);
    }
    if (c.level === "ready") {
      if (c.yearsExperience >= 1) add("employment_history", "passed", "Dates and titles confirmed with previous employer HR.", 18);
      else add("employment_history", "not_applicable", "First role after training; no prior employment.", 18);
      add("references", "passed", "Two references received; both positive on reliability and competence.", 20);
      add("readiness", "passed", "Availability, salary expectations and preferred locations confirmed by phone.", 21);
    } else if (c.level === "assessed") {
      add("references", "pending", "Referee contact details requested.", 16);
    }

    for (const ch of checks) {
      await db.insert(s.verificationChecks).values({
        candidateId: c.id,
        type: ch.type,
        status: ch.status,
        notes: ch.notes,
        verifiedById: ch.status === "pending" ? null : pick(staff),
        verifiedAt: ch.status === "pending" ? null : new Date(ch.at),
      });
    }

    if (atLeast(c.level, "assessed")) {
      const strong = c.yearsExperience >= 4;
      const score = () => (strong ? between(3, 4) : between(2, 4));
      const tech = templateForSector(c.sectorCode);
      await db.insert(s.assessments).values([
        {
          candidateId: c.id,
          kind: "interview",
          template: "interview",
          scores: Object.fromEntries(INTERVIEW_TEMPLATE.criteria.map((k) => [k.key, score()])),
          outcome: "recommend",
          evidence: "Clear, structured answers; gave concrete examples from recent roles. Professional presentation.",
          assessorId: pick(staff),
          assessedAt: new Date(Math.min(t0 + 12 * DAY, NOW - DAY)),
        },
        {
          candidateId: c.id,
          kind: "technical",
          template: tech.key,
          scores: Object.fromEntries(tech.criteria.map((k) => [k.key, score()])),
          outcome: "recommend",
          evidence: `Completed the ${tech.name.toLowerCase()} assessment under timed conditions.`,
          assessorId: pick(staff),
          assessedAt: new Date(Math.min(t0 + 14 * DAY, NOW - DAY)),
        },
      ]);
    }

    if (c.level === "ready") {
      const cls = classifyFor(c.yearsExperience);
      await db.update(s.candidates).set({ classification: cls, classificationRationale: RATIONALE[cls] }).where(eq(s.candidates.id, c.id));
      c.classification = cls;
    }

  }

  /* ---------------- Employers ---------------- */
  const EMPLOYERS: { name: string; industry: string; city: string; size: string; stage: string; tier?: string; contact: [string, string]; next?: string; nextIn?: number }[] = [
    { name: "Crestfield Ledger & Co.", industry: "Accounting & audit", city: "Abuja", size: "51–200", stage: "placement", tier: "corporate", contact: ["Kunle Adesanya", "HR Manager"], next: "Collect feedback on first audit hire", nextIn: 2 },
    { name: "Zuriel Motors", industry: "Automotive", city: "Lagos", size: "51–200", stage: "pilot", contact: ["Service Director", "Aftersales"], next: "Send diagnostic technician shortlist", nextIn: 1 },
    { name: "Harmattan Suites", industry: "Hospitality", city: "Abuja", size: "201–500", stage: "retention", contact: ["General Manager", "Operations"], next: "6-month check-in on sous chef", nextIn: 12 },
    { name: "Sahelway Logistics", industry: "Logistics", city: "Kano", size: "201–500", stage: "pilot", contact: ["Fleet Manager", "Operations"], next: "Confirm driver offer dates", nextIn: 3 },
    { name: "BrightPath Development Trust", industry: "NGO / development", city: "Abuja", size: "11–50", stage: "repeat", tier: "corporate", contact: ["Country Director", "Leadership"], next: "Quarterly workforce review", nextIn: 20 },
    { name: "Okoya Agro-Processing", industry: "Manufacturing", city: "Ibadan", size: "500+", stage: "proposal", contact: ["Head of Finance", "Finance"], next: "Follow up on executive search proposal", nextIn: 4 },
    { name: "Ivory Gate Microfinance", industry: "Banking & finance", city: "Enugu", size: "51–200", stage: "discovery", contact: ["HR Lead", "Human Resources"], next: "Discovery call — branch accountant needs", nextIn: 5 },
    { name: "Novatek Systems", industry: "Technology", city: "Abuja", size: "11–50", stage: "placement", contact: ["CTO", "Engineering"], next: "Start vacancy analysis for data analyst", nextIn: 6 },
    { name: "Meridian Care Clinics", industry: "Healthcare", city: "Port Harcourt", size: "51–200", stage: "contact", contact: ["Practice Manager", "Admin"], next: "Second outreach — WhatsApp", nextIn: 2 },
    { name: "Kestrel Fleet Services", industry: "Logistics", city: "Lagos", size: "51–200", stage: "research", contact: ["Operations Manager", "Operations"], next: "Identify HR decision-maker", nextIn: 7 },
    { name: "Bluecrest Properties", industry: "Construction", city: "Abuja", size: "11–50", stage: "target", contact: ["Managing Director", "Leadership"], next: "Research current vacancies", nextIn: 10 },
    { name: "Granite & Oak Builders", industry: "Construction", city: "Lagos", size: "51–200", stage: "target", contact: ["HR Manager", "HR"], next: "Add to Q4 outreach list", nextIn: 14 },
  ];
  const emp: Record<string, s.Employer> = {};
  for (const [i, e] of EMPLOYERS.entries()) {
    const [row] = await db
      .insert(s.employers)
      .values({
        name: e.name,
        industry: e.industry,
        city: e.city,
        state: STATE_OF[e.city] ?? null,
        size: e.size,
        website: `https://${e.name.toLowerCase().replace(/[^a-z]+/g, "")}.example`,
        crmStage: e.stage,
        ownerId: i % 3 === 0 ? adminId : recruiterId,
        nextAction: e.next,
        nextActionAt: e.nextIn ? new Date(NOW + e.nextIn * DAY) : null,
        source: pick(["network", "referral", "outreach", "website"]),
        membershipTier: e.tier ?? "none",
        createdAt: daysAgo(between(20, 160)),
      })
      .returning();
    emp[e.name] = row;
    await db.insert(s.employerContacts).values({
      employerId: row.id,
      userId: i === 0 ? employerUserId : null,
      name: e.contact[0],
      role: e.contact[1],
      email: i === 0 ? "employer@peeps.local" : `${e.contact[1].toLowerCase().replace(/[^a-z]+/g, "")}@${e.name.toLowerCase().replace(/[^a-z]+/g, "")}.example`,
      phone: `+234 70${between(1, 9)} ${between(100, 999)} ${between(1000, 9999)}`,
      isPrimary: true,
    });
  }

  /* ---------------- Vacancies ---------------- */
  type V = Omit<typeof s.vacancies.$inferInsert, "ref" | "employerId"> & { employer: string; ago: number };
  const VACANCIES: V[] = [
    { employer: "Crestfield Ledger & Co.", title: "Accountant", sectorCode: "ACC", headcount: 2, salaryMin: 300_000, salaryMax: 480_000, experienceMin: 3, requiredSkills: ["Excel", "IFRS", "Financial reporting", "Reconciliation"], qualifications: "B.Sc Accounting; ICAN or ACCA (in progress acceptable)", city: "Abuja", employmentType: "full_time", package: "professional", status: "interviewing", published: true, ago: 40, description: "Two accountants to support a growing client portfolio: monthly close, reconciliations and IFRS reporting.", analysisNotes: "Partner wants self-starters who can face clients. Excel depth matters more than years. Team is small — attitude is critical." },
    { employer: "Crestfield Ledger & Co.", title: "Audit Associate", sectorCode: "AUD", headcount: 1, salaryMin: 280_000, salaryMax: 420_000, experienceMin: 2, requiredSkills: ["Audit planning", "Internal controls", "Excel"], qualifications: "ICAN/ACA preferred", city: "Abuja", employmentType: "full_time", package: "professional", status: "filled", ago: 120, description: "Associate for statutory audit engagements.", analysisNotes: "Pilot engagement. Needs someone comfortable with travel to client sites." },
    { employer: "Zuriel Motors", title: "Diagnostic Technician", sectorCode: "AUT", headcount: 2, salaryMin: 180_000, salaryMax: 320_000, experienceMin: 3, requiredSkills: ["Engine diagnostics", "OBD-II scanning", "Auto electrical"], qualifications: "Trade Test II or OEM certification", city: "Lagos", employmentType: "full_time", package: "professional", status: "shortlisting", published: true, ago: 21, description: "Diagnose and repair late-model vehicles in a franchise workshop.", analysisNotes: "Workshop practical is mandatory. Brand experience (Toyota/Hyundai) a plus." },
    { employer: "Zuriel Motors", title: "EV Technician", sectorCode: "AUT", headcount: 1, salaryMin: 250_000, salaryMax: 400_000, experienceMin: 2, requiredSkills: ["EV systems", "Auto electrical", "Engine diagnostics"], city: "Lagos", employmentType: "full_time", package: "professional", status: "sourcing", published: true, ago: 9, description: "Service hybrid and EV models as the dealership expands its EV line." },
    { employer: "BrightPath Development Trust", title: "Executive Assistant", sectorCode: "HRA", headcount: 1, salaryMin: 250_000, salaryMax: 380_000, experienceMin: 3, requiredSkills: ["Scheduling", "Minutes & correspondence", "Record keeping"], city: "Abuja", employmentType: "full_time", package: "professional", status: "filled", ago: 150, description: "Support the Country Director." },
    { employer: "Sahelway Logistics", title: "Fleet Driver", sectorCode: "DRV", headcount: 5, salaryMin: 100_000, salaryMax: 180_000, experienceMin: 3, requiredSkills: ["Defensive driving", "Route planning", "Vehicle checks"], qualifications: "Valid FRSC Class E licence", city: "Kano", employmentType: "contract", package: "contract", status: "offer", ago: 30, description: "Inter-state haulage drivers on 12-month contracts." },
    { employer: "Harmattan Suites", title: "Sous Chef", sectorCode: "HOS", headcount: 1, salaryMin: 200_000, salaryMax: 320_000, experienceMin: 3, requiredSkills: ["Continental cuisine", "Nigerian cuisine", "Food hygiene"], city: "Abuja", employmentType: "full_time", package: "professional", status: "filled", ago: 130, description: "Second-in-command for a 120-cover hotel kitchen." },
    { employer: "Novatek Systems", title: "Data Analyst", sectorCode: "ITD", headcount: 1, salaryMin: 350_000, salaryMax: 600_000, experienceMin: 2, requiredSkills: ["SQL", "Power BI", "Python", "Excel"], city: "Abuja", employmentType: "full_time", package: "basic", status: "analysis", published: true, ago: 6, description: "Build dashboards and reporting for public-sector clients." },
    { employer: "Okoya Agro-Processing", title: "Financial Controller", sectorCode: "ACC", headcount: 1, salaryMin: 1_200_000, salaryMax: 1_800_000, experienceMin: 8, requiredSkills: ["IFRS", "Financial reporting", "Budgeting", "Team leadership"], qualifications: "ICAN/ACCA chartered", city: "Ibadan", employmentType: "full_time", package: "executive", status: "received", ago: 3, description: "Lead group finance for a fast-growing processor." },
    { employer: "BrightPath Development Trust", title: "HR Officer", sectorCode: "HRA", headcount: 1, salaryMin: 220_000, salaryMax: 330_000, experienceMin: 2, requiredSkills: ["Recruitment", "HR administration", "Payroll"], city: "Abuja", employmentType: "full_time", package: "professional", status: "filled", ago: 100, description: "Generalist HR for a 40-person programme office." },
    { employer: "Novatek Systems", title: "IT Support Officer", sectorCode: "ITD", headcount: 1, salaryMin: 180_000, salaryMax: 280_000, experienceMin: 1, requiredSkills: ["Troubleshooting", "Networking", "Linux"], city: "Abuja", employmentType: "full_time", package: "basic", status: "filled", ago: 80, description: "First-line support for 60 staff." },
    { employer: "Zuriel Motors", title: "Customer Service Officer", sectorCode: "SAL", headcount: 2, salaryMin: 120_000, salaryMax: 200_000, experienceMin: 1, requiredSkills: ["Customer service", "Complaint resolution", "CRM"], city: "Lagos", employmentType: "full_time", package: "basic", status: "sourcing", published: true, ago: 5, description: "Front-of-house for the service reception." },
  ];
  const vac: s.Vacancy[] = [];
  for (const [i, v] of VACANCIES.entries()) {
    const { employer, ago, ...rest } = v;
    const [row] = await db
      .insert(s.vacancies)
      .values({
        ...rest,
        ref: `VAC-${String(i + 1).padStart(4, "0")}`,
        employerId: emp[employer].id,
        deadline: new Date(NOW + between(10, 40) * DAY),
        createdAt: daysAgo(ago),
      })
      .returning();
    vac.push(row);
  }

  /* ---------------- Applications & placements ---------------- */
  const ready = (code: string) => seeded.filter((c) => c.level === "ready" && c.sectorCode === code);
  const notReady = (code: string) => seeded.filter((c) => c.level !== "ready" && c.level !== "registered" && c.sectorCode === code);
  // The demo candidate's own pipeline is set up explicitly below.
  const used = new Set<string>([seeded[0].id]);
  const take = (pool: SeedCandidate[]) => {
    const c = pool.find((x) => !used.has(x.id));
    if (c) used.add(c.id);
    return c;
  };

  /** Shortlist summary written from the candidate's actual record. */
  function summaryFor(c: SeedCandidate, v: s.Vacancy) {
    const have = new Set([...c.skills, ...c.software].map((x) => x.toLowerCase()));
    const hits = v.requiredSkills.filter((x) => have.has(x.toLowerCase()));
    const years = `${c.yearsExperience} year${c.yearsExperience === 1 ? "" : "s"}`;
    const prev = c.experience[0]?.employer ? ` most recently at ${c.experience[0].employer.toLowerCase()}` : "";
    const quals = c.qualifications.length ? ` ${c.qualifications.join(" and ")}.` : "";
    const skills = hits.length ? ` Assessed as strong on ${hits.slice(0, 3).join(", ")}.` : " Solid across the technical assessment.";
    return `${years} as ${/^[aeiou]/i.test(c.profession) ? "an" : "a"} ${c.profession.toLowerCase()}${prev}.${quals}${skills} Verified history and positive references.`;
  }

  async function apply(v: s.Vacancy, c: SeedCandidate | undefined, stage: string, ago: number) {
    if (!c) return null;
    const summary = ["shortlisted", "client_interview", "offer", "placed"].includes(stage) ? summaryFor(c, v) : null;
    const match = scoreMatch(
      { ...c, stage: c.level === "ready" ? "peeps_ready" : c.level },
      { ...v },
    );
    const [row] = await db
      .insert(s.applications)
      .values({
        vacancyId: v.id,
        candidateId: c.id,
        stage,
        origin: rand() < 0.3 ? "applied" : "sourced",
        matchScore: match.total,
        shortlistSummary: summary,
        createdAt: daysAgo(ago),
        updatedAt: daysAgo(Math.max(1, ago - 5)),
      })
      .returning();
    return row;
  }

  async function place(v: s.Vacancy, c: SeedCandidate | undefined, startAgo: number, feedback?: s.PlacementFeedback, invoice = "paid") {
    const app = await apply(v, c, "placed", startAgo + 25);
    if (!app || !c) return;
    const monthly = Math.round(((v.salaryMin ?? 0) + (v.salaryMax ?? 0)) / 2 / 10_000) * 10_000;
    const annual = monthly * 12;
    const fee = roundTo(annual * 0.15, 5_000);
    const months = startAgo / 30;
    const [pl] = await db
      .insert(s.placements)
      .values({
        applicationId: app.id,
        candidateId: c.id,
        employerId: v.employerId,
        vacancyId: v.id,
        startDate: daysAgo(startAgo),
        annualSalary: annual,
        fee,
        invoiceStatus: invoice,
        retention3m: months >= 3 ? "retained" : "pending",
        retention6m: months >= 6 ? "retained" : "pending",
        feedback: feedback ?? null,
        feedbackAt: feedback ? daysAgo(Math.max(1, startAgo - 30)) : null,
        createdAt: daysAgo(startAgo + 5),
      })
      .returning();
    await db.insert(s.revenueEntries).values({
      stream: "recruitment",
      amount: fee,
      date: daysAgo(startAgo),
      description: `Placement fee — ${v.title} (${c.pepId})`,
      employerId: v.employerId,
      placementId: pl.id,
    });
  }

  const [vAcc, vAud, vDiag, vEv, vEa, vDrv, vChef, vData, , vHr, vIt, vCs] = vac;

  // Filled roles
  // Demo employer's first hire — feedback left open so it can be submitted from the portal.
  await place(vAud, take(ready("AUD")), 95, undefined, "paid");
  await place(vEa, take(ready("HRA")), 125, { suitable: "yes", strengths: "Excellent organisation and discretion.", weaknesses: "None significant.", missingSkills: "Advanced Excel", wouldHireAgain: true, rating: 5 }, "paid");
  await place(vChef, take(ready("HOS")), 105, { suitable: "partly", strengths: "Excellent Nigerian menu and hygiene standards.", weaknesses: "Continental range narrower than expected.", missingSkills: "Pastry, continental sauces", wouldHireAgain: true, rating: 4 }, "paid");
  await place(vHr, take(ready("HRA")), 70, { suitable: "yes", strengths: "Hit the ground running on recruitment admin.", weaknesses: "Payroll knowledge still developing.", missingSkills: "Payroll software", wouldHireAgain: true, rating: 4 }, "sent");
  await place(vIt, take(ready("ITD")), 50, undefined, "sent");

  // Demo employer: Accountant vacancy in client-interview stage
  const accPool = ready("ACC");
  await apply(vAcc, take(accPool), "client_interview", 25);
  await apply(vAcc, take(accPool), "shortlisted", 22);
  await apply(vAcc, take(accPool), "shortlisted", 20);
  await apply(vAcc, take(notReady("ACC")), "interviewed", 15);
  await apply(vAcc, take(notReady("ACC")), "screened", 10);
  await apply(vAcc, take(notReady("ACC")), "sourced", 6);

  // Automotive shortlisting
  const autPool = ready("AUT");
  await apply(vDiag, take(autPool), "shortlisted", 14);
  await apply(vDiag, take(autPool), "interviewed", 12);
  await apply(vDiag, take(notReady("AUT")), "screened", 8);
  await apply(vEv, take(autPool), "sourced", 4);
  await apply(vEv, take(notReady("AUT")), "sourced", 3);

  // Drivers at offer stage
  const drvPool = ready("DRV");
  await apply(vDrv, take(drvPool), "offer", 18);
  await apply(vDrv, take(drvPool), "client_interview", 16);
  await apply(vDrv, take(notReady("DRV")), "interviewed", 12);

  // Others
  await apply(vData, take(notReady("ITD")), "sourced", 3);
  await apply(vCs, take(ready("SAL")), "screened", 2);
  await apply(vCs, take(notReady("SAL")), "applied", 1);

  // The demo candidate applied to the demo employer's accountant role.
  await apply(vAcc, seeded[0], "screened", 8);

  /* ---------------- Recompute every stage from evidence ---------------- */
  for (const c of seeded) {
    const checks = (await db
      .select({ type: s.verificationChecks.type, status: s.verificationChecks.status, notes: s.verificationChecks.notes })
      .from(s.verificationChecks)
      .where(eq(s.verificationChecks.candidateId, c.id))) as CheckRecord[];
    const apps = await db.select({ stage: s.applications.stage }).from(s.applications).where(eq(s.applications.candidateId, c.id));
    const pls = await db.select({ id: s.placements.id }).from(s.placements).where(eq(s.placements.candidateId, c.id));
    const [fresh] = await db.select({ classification: s.candidates.classification }).from(s.candidates).where(eq(s.candidates.id, c.id));
    const stage = computeStage({
      consented: true,
      checks,
      classification: fresh.classification,
      shortlisted: apps.some((a) => ["shortlisted", "client_interview", "offer", "placed"].includes(a.stage)),
      placed: pls.length > 0,
    });
    await db.update(s.candidates).set({ stage }).where(eq(s.candidates.id, c.id));
  }

  /* ---------------- Other revenue streams ---------------- */
  await db.insert(s.revenueEntries).values([
    { stream: "training", amount: 2_400_000, date: daysAgo(110), description: "Employer-sponsored Excel & IFRS bootcamp (12 learners)", employerId: emp["Crestfield Ledger & Co."].id },
    { stream: "training", amount: 1_600_000, date: daysAgo(45), description: "Talent Ready — Automotive cohort sponsorship", employerId: emp["Zuriel Motors"].id },
    { stream: "consulting", amount: 1_800_000, date: daysAgo(80), description: "Tax health-check and VAT remediation", employerId: emp["Okoya Agro-Processing"].id },
    { stream: "consulting", amount: 950_000, date: daysAgo(20), description: "Finance SOP development", employerId: emp["BrightPath Development Trust"].id },
    { stream: "membership", amount: 600_000, date: daysAgo(130), description: "Corporate membership — annual", employerId: emp["BrightPath Development Trust"].id },
    { stream: "membership", amount: 600_000, date: daysAgo(60), description: "Corporate membership — annual", employerId: emp["Crestfield Ledger & Co."].id },
    { stream: "workforce", amount: 1_350_000, date: daysAgo(15), description: "Contract drivers — September management fee", employerId: emp["Sahelway Logistics"].id },
    { stream: "career_services", amount: 75_000, date: daysAgo(100), description: "CV development (5 candidates)" },
    { stream: "career_services", amount: 120_000, date: daysAgo(55), description: "Interview preparation sessions (8)" },
    { stream: "career_services", amount: 90_000, date: daysAgo(12), description: "CV development & LinkedIn optimisation (6)" },
  ]);

  /* ---------------- Enquiries ---------------- */
  await db.insert(s.enquiries).values([
    { type: "talent_request", name: "Head of Finance", email: "finance@okoya.example", organisation: "Okoya Agro-Processing", subject: "Financial Controller (VAC-0009)", message: "We need a chartered financial controller to lead group finance. Confidential search preferred.", status: "in_progress", createdAt: daysAgo(3) },
    { type: "partner", name: "Placement Lead", email: "placements@codebridge.example", organisation: "CodeBridge Academy", subject: "Graduate pipeline partnership", message: "Our Data Analytics cohort graduates in November — 24 learners. We'd like PEEPs to assess and place them.", status: "in_progress", createdAt: daysAgo(12) },
    { type: "pilot", name: "Practice Manager", email: "admin@meridiancare.example", organisation: "Meridian Care Clinics", subject: "Pilot: front-desk officers", message: "Interested in a pilot for two front-desk officers at our new clinic.", status: "new", createdAt: daysAgo(1) },
    { type: "career_service", name: "Temitope A.", email: "temitope@example.com", subject: "CV development", message: "I'm an ICAN student looking for my first accounts role and would like help with my CV.", status: "new", createdAt: daysAgo(2) },
    { type: "career_service", name: "Ebuka N.", email: "ebuka@example.com", subject: "Interview preparation", message: "I have a panel interview at a bank next week. Can I book a mock interview?", status: "closed", createdAt: daysAgo(20) },
    { type: "academy", name: "HR Lead", email: "hr@ivorygate.example", organisation: "Ivory Gate Microfinance", subject: "Training for branch accountants", message: "Could you run a reconciliation and Excel programme for 15 branch staff?", status: "new", createdAt: daysAgo(4) },
    { type: "contact", name: "Operations Manager", email: "ops@kestrel.example", organisation: "Kestrel Fleet Services", subject: "Fleet staffing", message: "We may need 10 drivers and 2 mechanics in Q1. What does contract staffing cost?", status: "new", createdAt: daysAgo(6) },
  ]);

  /* ---------------- Notes ---------------- */
  await db.insert(s.notes).values([
    { entity: "employer", entityId: emp["Crestfield Ledger & Co."].id, body: "Partner very happy with the audit associate. Wants two accountants before year-end close. Mentioned possible training engagement for juniors.", authorId: adminId, createdAt: daysAgo(40) },
    { entity: "employer", entityId: emp["Zuriel Motors"].id, body: "Pilot agreed: diagnostic technicians first. If successful, EV and customer service roles follow.", authorId: recruiterId, createdAt: daysAgo(22) },
    { entity: "employer", entityId: emp["Okoya Agro-Processing"].id, body: "Proposal sent for retained executive search (Financial Controller). Decision expected next week.", authorId: adminId, createdAt: daysAgo(3) },
    { entity: "candidate", entityId: seeded[0].id, body: "Excellent technical assessment. Waiting on referee details before PEEPs Ready.", authorId: recruiterId, createdAt: daysAgo(6) },
  ]);

  /* ---------------- Activity log ---------------- */
  const recent = seeded.filter((c) => c.level !== "registered").slice(0, 8);
  const acts: (typeof s.activityLog.$inferInsert)[] = [];
  recent.forEach((c, i) => {
    acts.push({ actorId: i % 2 ? recruiterId : adminId, entity: "candidate", entityId: c.id, action: "check_updated", detail: `${c.firstName} ${c.lastName}: identity passed`, createdAt: daysAgo(9 - i) });
  });
  acts.push(
    { actorId: recruiterId, entity: "vacancy", entityId: vDiag.id, action: "updated", detail: "Diagnostic Technician: shortlist in progress", createdAt: daysAgo(1) },
    { actorId: adminId, entity: "employer", entityId: emp["Okoya Agro-Processing"].id, action: "stage_changed", detail: "Okoya Agro-Processing: discovery → proposal", createdAt: daysAgo(3) },
    { actorId: null, entity: "vacancy", entityId: vac[8].id, action: "received", detail: "Financial Controller: website talent request", createdAt: daysAgo(3) },
    { actorId: recruiterId, entity: "candidate", entityId: seeded[0].id, action: "assessed", detail: "Chiamaka Okafor: accounting technical assessment, recommend", createdAt: daysAgo(6) },
  );
  await db.insert(s.activityLog).values(acts);

  console.log(`Seeded ${seeded.length} candidates, ${EMPLOYERS.length} employers, ${vac.length} vacancies.`);
  console.log(`\nDemo logins (password: ${DEMO_PASSWORD})`);
  console.log("  admin@peeps.local      — PEEPs Console (admin)");
  console.log("  recruiter@peeps.local  — PEEPs Console (recruiter)");
  console.log("  employer@peeps.local   — Employer portal (Crestfield Ledger & Co.)");
  console.log("  candidate@peeps.local  — Candidate portal (Chiamaka Okafor)");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
