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
    leads: "Dinu / Dinesh",
    dateRaised: "04-06-2026",
    targetDate: "15-07-2026",
    rag: "critical",
  },
  {
    sn: 2,
    workstream: "Business",
    activity: "Approach notes to be finalized and signed off",
    owner: "FB",
    leads: "Kishore",
    dateRaised: "05-06-2026",
    targetDate: "15-07-2026",
    rag: "warning",
  },
  {
    sn: 3,
    workstream: "Platform/Infrastructure",
    activity: "Creation of Prod and Data Migration environment with service testing",
    owner: "TSYS",
    leads: "Dinu / Dinesh",
    dateRaised: "22-06-2026",
    targetDate: "15-07-2026",
    rag: "critical",
  },
  {
    sn: 5,
    workstream: "Channel Connectivity",
    activity: "Prod key exchange",
    owner: "FB",
    leads: "Sreejith",
    dateRaised: "26-06-2026",
    targetDate: "15-07-2026",
    rag: "warning",
  },
  {
    sn: 6,
    workstream: "Business",
    activity: "Testing partner onboarding",
    owner: "FB",
    leads: "Libu",
    dateRaised: "26-06-2026",
    targetDate: "15-07-2026",
    rag: "warning",
  },
];

export const pendingFromTsys: PendingItem[] = [
  { sn: 1, workstream: "Program Plan", activity: "Detailed Plan", leads: "Himanshu / Ananya", dateRaised: "01-06-2026" },
  { sn: 6, workstream: "Data Migration", activity: "Final Data migration scope agreement", leads: "Nitin", dateRaised: "03-07-2026" },
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
      "TSYS detailed project plan is not progressing; if the same is not received by mid next week it will be challenging to track all critical activities.",
    mitigation:
      "Workshop at Mumbai is scheduled on 8th–12th June for scoping and plan finalisation. Direction on 3rd JIC for detailing the plan based on triparty discussion.",
    raised: "15-05-2026",
    level: "High",
    status: "WIP",
  },
  {
    sn: 2,
    workstream: "IT",
    detail:
      "Federal IT team yet to start with the API build and requires significant time to create wrapper APIs.",
    mitigation: "Right resource allocation for AWS, Infra, connectivity.",
    raised: "25-05-2026",
    level: "Medium",
    status: "WIP",
  },
  {
    sn: 3,
    workstream: "Product & Network",
    detail:
      "TSYS & FB to discuss project timelines considering scheme & encryption setup timelines for VISA.",
    mitigation:
      "Develop a plan for interdependent activities such as recarding, go-live, customer communications, and card activation.",
    raised: "03-06-2026",
    level: "High",
    status: "Open",
  },
  {
    sn: 4,
    workstream: "IT",
    detail:
      "IT will complete client onboarding to the cloud environment (S3, Kafka, Web, REST API sample testing). Platform/infrastructure readiness remains contingent on CISO approvals.",
    mitigation: "—",
    raised: "—",
    level: "High",
    status: "Open",
  },
  {
    sn: 5,
    workstream: "Due Diligence",
    detail: "Mandatory Due Diligence to be completed by Deloitte (third party) for TSYS.",
    mitigation: "Initiate the pre-requisite clearance by TSYS.",
    raised: "—",
    level: "Low",
    status: "Open",
  },
  {
    sn: 6,
    workstream: "Business",
    detail:
      "Onboard a dedicated testing partner at Federal Bank to support validation of systems, processes, and integrations.",
    mitigation: "—",
    raised: "—",
    level: "Medium",
    status: "Open",
  },
];

export const decisionLogs: DecisionLog[] = [
  { sn: 1, workstream: "Business", area: "Card features", details: "A key decision has been made to replicate all existing Soulfire card configurations, features, and pricing structures in the Federal environment without any modifications.", owner: "Libu", status: "Closed" },
  { sn: 2, workstream: "Business", area: "Card Fee", details: "Annual fee services will be migrated and maintained under Federal Bank, with fees charged based on original migrated services and existing card charge dates (not re-carding dates).", owner: "Libu", status: "Open" },
  { sn: 3, workstream: "Business", area: "Card Account", details: "All customer accounts, including active and closed, will be migrated from SCB to Federal Bank portfolio. Scope includes all cards irrespective of status (active, inactive, closed, expired, replaced).", owner: "Libu", status: "Open" },
  { sn: 4, workstream: "Business", area: "Product", details: "SI to be re-submitted by the customer as the card details will be new.", owner: "Libu", status: "Open" },
  { sn: 5, workstream: "Platform & Infrastructure", area: "Network Connectivity", details: "Network connectivity between FB and TSYS will be established via a private link. IT team will provide cost details for setting up the Project Soulfire infrastructure.", owner: "Dinu", status: "WIP" },
  { sn: 6, workstream: "Compliance", area: "KYC", details: "An approach note pertaining to KYC, customer risk categorization and delivery address update to be drafted to ensure regulatory alignment for new portfolio.", owner: "Kishore / Sreejith", status: "WIP" },
  { sn: 7, workstream: "Business", area: "Rewards", details: "All LR rewards accrual and redemption activities will be processed within the LR system. TSYS will continue to implement and maintain the required business logic and ensure seamless routing of all relevant transactions to LR.", owner: "Libu", status: "Open" },
  { sn: 8, workstream: "Data Migration", area: "Scope", details: "The scope of data migration and its subsequent attributes will be discussed and agreed between all three parties (FB, SCB, TSYS).", owner: "Joint", status: "WIP" },
  { sn: 9, workstream: "Marketing & Communication", area: "Consent & Communication", details: "Consent mechanism, channels, frequency and calendar plan is awaited. Proposed to be discussed in upcoming JIC on 08-06-2026.", owner: "Shefali", status: "Closed" },
  { sn: 10, workstream: "Business", area: "Product", details: "A joint decision between SCB and FB needs to be made on usage of Manhattan card name post portfolio transfer.", owner: "Leadership (FB)", status: "Open" },
  { sn: 11, workstream: "Business", area: "Recarding", details: "The decision on 37-day timeline for card closure is agreed to commence from the Big Bang date.", owner: "Saugata", status: "Open" },
  { sn: 12, workstream: "IT", area: "Authentication Protocol", details: "Email Authentication as MFA method will be enabled for integration/configurations.", owner: "Dinu", status: "Closed" },
  { sn: 13, workstream: "Operations", area: "Dispute Management", details: "FB to work on BPO setup / dispute management for acquired portfolio. TSYS BPO is based in the Philippines while data storage is in India — decision needed on the operating model from compliance & regulatory perspective in India.", owner: "Saugata / Brijesh", status: "WIP" },
  { sn: 14, workstream: "IT", area: "Environment Setup & Testing", details: "IT to take up CISO exception approval for Production environment creation and data migration environment creation.", owner: "Sreejith", status: "Closed" },
  { sn: 15, workstream: "Recarding", area: "Embossing File", details: "Single-line format, in alignment with the specifications and expectations of the embossing team, eliminating the need for the earlier two-line format.", owner: "TSYS", status: "Closed" },
];