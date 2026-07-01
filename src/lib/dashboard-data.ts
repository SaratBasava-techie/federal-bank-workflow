export type RagStatus = "critical" | "warning" | "ontrack";

export interface RagItem {
  sn: number;
  workstream: string;
  activity: string;
  owner: string;
  leads: string;
  dateRaised: string;
  targetDate: string;
  rag: RagStatus;
}

export interface PendingItem {
  sn: number;
  workstream: string;
  activity: string;
  leads: string;
  dateRaised: string;
}

export const ragSummary: RagItem[] = [
  {
    sn: 1,
    workstream: "Business",
    activity: "Client build & QA (MB/IB/IVR/LR/Batch files)",
    owner: "FB",
    leads: "Dinu/ Dinesh",
    dateRaised: "—",
    targetDate: "31-07-2026",
    rag: "warning",
  },
  {
    sn: 2,
    workstream: "Business",
    activity: "Approach notes to be finalized and signed off",
    owner: "FB",
    leads: "Kishore",
    dateRaised: "—",
    targetDate: "15-07-2026",
    rag: "warning",
  },
  {
    sn: 3,
    workstream: "Platform/Infrastructure",
    activity: "Creation of Prod and Data Migration environment with service testing",
    owner: "FB",
    leads: "Dinu",
    dateRaised: "—",
    targetDate: "15-07-2026",
    rag: "critical",
  },
  {
    sn: 4,
    workstream: "Scheme",
    activity: "Production key exchange between TSYS & scheme post BAR forms finalization",
    owner: "TSYS & FB",
    leads: "Jason/Sreejith",
    dateRaised: "—",
    targetDate: "15-07-2026",
    rag: "warning",
  },
  {
    sn: 5,
    workstream: "Business",
    activity: "Testing partner onboarding",
    owner: "FB",
    leads: "Libu",
    dateRaised: "—",
    targetDate: "15-07-2026",
    rag: "warning",
  },
  {
    sn: 6,
    workstream: "Mar-Com",
    activity: "Consent communication has been rescheduled from 3 July to the second week of July, with the first tranche of 10K customers tentatively planned for 8 July. SCB content is awaited and expected by 3 July.",
    owner: "SCB",
    leads: "Neha",
    dateRaised: "—",
    targetDate: "03-07-2026",
    rag: "critical",
  },
];

export const pendingFromTsys: PendingItem[] = [
  { sn: 1, workstream: "Program Plan", activity: "Detailed Project Plan to be shared by TSYS to FB including joint tripartite plan", leads: "Himanshu/Ananya", dateRaised: "01-06-2026" },
  { sn: 2, workstream: "Data Migration", activity: "Final Data migration scope agreement", leads: "Nitin", dateRaised: "03-07-2026" },
];

export const programKpis = {
  total: 74,
  completed: 22,
  inProgress: 7,
  notStarted: 36,
  onHold: 8,
  atRisk: 1,
  overdue: 0,
  overall: 30,
};

export const completionStatus = [
  { name: "Completed", value: 22, color: "var(--rag-ontrack)" },
  { name: "In Progress", value: 7, color: "oklch(0.6 0.13 195)" },
  { name: "Not Started", value: 36, color: "oklch(0.82 0.01 250)" },
  { name: "On Hold", value: 8, color: "var(--fed-gold)" },
  { name: "At Risk", value: 1, color: "var(--rag-critical)" },
];

export const completionByPhase = [
  { phase: "Initiation", pct: 100 },
  { phase: "Discovery", pct: 100 },
  { phase: "Env Setup", pct: 100 },
  { phase: "Config", pct: 35 },
  { phase: "Integration", pct: 0 },
  { phase: "UAT", pct: 0 },
  { phase: "Migration", pct: 0 },
  { phase: "Go-Live", pct: 0 },
  { phase: "Post-Live", pct: 0 },
];

export const activitiesPerWeek = [
  { week: "15-Jun", due: 4, completed: 3 },
  { week: "22-Jun", due: 6, completed: 4 },
  { week: "29-Jun", due: 8, completed: 5 },
  { week: "06-Jul", due: 7, completed: 2 },
  { week: "13-Jul", due: 9, completed: 0 },
  { week: "20-Jul", due: 6, completed: 0 },
  { week: "27-Jul", due: 5, completed: 0 },
  { week: "03-Aug", due: 4, completed: 0 },
  { week: "10-Aug", due: 3, completed: 0 },
  { week: "17-Aug", due: 2, completed: 0 },
];

export const immediateAttention = [
  "CISO approval pending — blocking AWS environment setup.",
  "KYC risk categorization note overdue from Business workstream.",
  "Production encryption key provisioning awaiting TSYS confirmation.",
];

export type LogStatus = "Open" | "Closed" | "WIP";
export type RiskLevel = "High" | "Medium" | "Low";

export interface RiskLog {
  sn: number;
  workstream: string;
  detail: string;
  mitigation: string;
  raised: string;
  level: RiskLevel;
  status: LogStatus;
}

export interface DecisionLog {
  sn: number;
  workstream: string;
  area: string;
  details: string;
  owner: string;
  status: LogStatus;
}

export const riskLogs: RiskLog[] = [
  {
    sn: 1,
    workstream: "PMO",
    detail:
      "TSYS detailed project plan is not progressing , if the same is not received by mid next week it will be challenging to track all critical activities.",
    mitigation:
      "Workshop at Mumbai is scheduled on 8th June to 12th June for scoping and for plan finalisation. Direction on 3rd JIC for detailing the plan based on triparty discussion.",
    raised: "15-May-2026",
    level: "High",
    status: "WIP",
  },
  {
    sn: 2,
    workstream: "IT",
    detail:
      "FB IT team to commence application build and QA activities, which may potentially impact the UAT timeline.",
    mitigation: "Right resouce allocation for AWS, Infra, connectivity",
    raised: "25-May-2026",
    level: "Medium",
    status: "WIP",
  },
  {
    sn: 3,
    workstream: "Product & Network",
    detail:
      "TSYS & FB to discuss project timelines considering scheme & encryption setup timelines for VISA",
    mitigation:
      "To develop a plan for interdependent activities such as recarding, go-live, customer communications, and card activation.",
    raised: "3-Jun-2026",
    level: "High",
    status: "Open",
  },
  {
    sn: 4,
    workstream: "IT",
    detail:
      "FD IT to complete production and migration enviroment setup and testing",
    mitigation: "",
    raised: "18-Jun-2026",
    level: "High",
    status: "Open",
  },
  {
    sn: 5,
    workstream: "Due Deligence",
    detail: "It is mandatory Due Diligence to be completed by Deloitte (third party) for TSYS.",
    mitigation: "Initate the pre-requisite clearance by TSYS",
    raised: "25-Jun-2026",
    level: "Low",
    status: "Open",
  },
  {
    sn: 6,
    workstream: "Business",
    detail:
      "Onboard a dedicated testing partner at Federal Bank to support validation of systems, processes, and integrations",
    mitigation: "",
    raised: "29-Jun-2026",
    level: "Medium",
    status: "Open",
  },
];

export const decisionLogs: DecisionLog[] = [
  { sn: 1, workstream: "Business", area: "Card features", details: "A key decision has been made to replicate all existing Soulfire card configurations, features, and pricing structures in the Federal environment without any modifications.", owner: "Libu", status: "Closed" },
  { sn: 2, workstream: "Business", area: "Card Fee", details: "Annual fee services will be migrated and maintained under Federal Bank, with fees charged based on original migrated services and existing card charge dates (not re-carding dates).", owner: "Libu", status: "Closed" },
  { sn: 3, workstream: "Business", area: "Card Account", details: "All customer accounts, including active and closed, will be migrated from Standard Chartered Bank to the Federal Bank portfolio. The migration scope will include all cards, irrespective of status (active, inactive, closed, expired, or replaced).", owner: "Libu", status: "Closed" },
  { sn: 4, workstream: "Data Migration", area: "Scope", details: "The scope of data migration and its subsequent attributes will be discussed and agreed  between all three parties (FB, SCB, TSYS)", owner: "Joint", status: "WIP" },
  { sn: 5, workstream: "Platform & Infrastructure", area: "Network Connectivity", details: "Network connectivity between FB and TSYS will be established via a private link. The IT team will provide the cost details for setting up the Project Soulfire infrastructure in due course.", owner: "Dinu", status: "Closed" },
  { sn: 6, workstream: "Compliance", area: "KYC", details: "An approach note pertaining to KYC, customer risk categorization and delivery address update to be drafted to ensure regulatory alignment for new portfolio.", owner: "Kishore/Sreejith", status: "WIP" },
  { sn: 7, workstream: "Business", area: "Rewards", details: "A decision has been made that all LR rewards accrual and redemption activities will be processed within the LR system. TSYS will continue to implement and maintain the required business logic updates within its platform and ensure seamless routing of all relevant transactions to LR.", owner: "Libu", status: "Closed" },
  { sn: 8, workstream: "Marketing & Communication", area: "Consent & communication", details: "Consent mechanism, channels, frequency and calendar plan is awaited. This is proposed to be discussed in upcoming JIC on 08-06-2026", owner: "Shefali", status: "Closed" },
  { sn: 9, workstream: "Business", area: "Product ", details: "A Joint decision between SCB and FB, needs to be made on usage of Manhattan card name post portfolio transfer.", owner: "Leadership (FB, SCB)", status: "Closed" },
  { sn: 10, workstream: "Business", area: "Recarding", details: "The decision on 37 day timeline for card closure is agreed to commence from the BIG Bang date.", owner: "Saugata", status: "Closed" },
  { sn: 11, workstream: "IT", area: "Authentication Protocol", details: "As a Authentication Protocol the Email Authentication, as MFA method will be enabled for integration/configurations.", owner: "Dinu", status: "Closed" },
  { sn: 12, workstream: "Operations", area: "Dispute Management", details: "FB to work on BPO set up/dispute management for aquired portfolio. To elaborate the TSYS BPO setup is based out of the Philippines, while the data storage is maintained in India. Require the decision makking on the operating model with compliance & regulatory perspective in India", owner: "Saugata/Brijesh", status: "Closed" },
  { sn: 13, workstream: "IT", area: "Enviroment set-up & testing", details: "IT to take-up CISO exception approval for Production enviroment creation and data migration enviroment creation", owner: "Sreejith", status: "Closed" },
  { sn: 14, workstream: "Recarding", area: "Embossing File", details: "FIS has confirmed that the embossing file can be generated in a single-line format, in alignment with the specifications and expectations of the embossing team, eliminating the need for the earlier two-line format.", owner: "TSYS", status: "Closed" },
];