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
    workstream: "Platform/Infrastructure",
    activity: "CISO approval as in-principal approval for AWS set up & deployment.",
    owner: "FB",
    leads: "Dinu / Sreejith",
    dateRaised: "04-06-2026",
    targetDate: "19-06-2026",
    rag: "critical",
  },
  {
    sn: 2,
    workstream: "Business",
    activity: "KYC approach note for risk categorization to be finalized.",
    owner: "FB",
    leads: "Sreejith",
    dateRaised: "05-06-2026",
    targetDate: "15-06-2026",
    rag: "critical",
  },
  {
    sn: 3,
    workstream: "Platform/Infrastructure",
    activity: "Creation of Test and Data Migration environment.",
    owner: "TSYS",
    leads: "Anupam, Nithin",
    dateRaised: "—",
    targetDate: "30-06-2026",
    rag: "warning",
  },
  {
    sn: 4,
    workstream: "Channel Connectivity",
    activity: "Key channel services validation (Web, API, Batch files, Kafka).",
    owner: "FB, TSYS",
    leads: "Dinesh, Dinu, Anupam",
    dateRaised: "—",
    targetDate: "30-06-2026",
    rag: "warning",
  },
];

export const pendingFromTsys: PendingItem[] = [
  { sn: 1, workstream: "Contracting", activity: "TSYS Due diligence by third party.", leads: "Himanshu / Ananya", dateRaised: "01-06-2026" },
  { sn: 2, workstream: "Platform/Infrastructure", activity: "API endpoint gateway testing details.", leads: "Anupam", dateRaised: "—" },
  { sn: 3, workstream: "Business", activity: "Finalization for S3-S3 replication mechanism for FB DWH.", leads: "Mathew / Pill", dateRaised: "15-06-2026" },
  { sn: 4, workstream: "Platform/Infrastructure", activity: "Details of server IP for connectivity.", leads: "TBD", dateRaised: "—" },
  { sn: 5, workstream: "Scheme & Compliance", activity: "Provisioning of the Production encryption keys.", leads: "Jason / Mahendra", dateRaised: "18-06-2026" },
  { sn: 6, workstream: "Data Migration", activity: "Final Data migration scoping document.", leads: "Nitin", dateRaised: "19-06-2026" },
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

export type DecisionRiskType = "Decision" | "Risk";
export type DecisionRiskStatus = "Open" | "Closed" | "In Review";

export interface DecisionRiskLog {
  sn: number;
  type: DecisionRiskType;
  workstream: string;
  description: string;
  owner: string;
  raised: string;
  target: string;
  status: DecisionRiskStatus;
  impact: "High" | "Medium" | "Low";
}

export const decisionRiskLogs: DecisionRiskLog[] = [
  {
    sn: 1,
    type: "Decision",
    workstream: "Platform/Infrastructure",
    description: "AWS account & VPC design approved by CISO with private-link based connectivity to TSYS.",
    owner: "Dinu",
    raised: "04-06-2026",
    target: "19-06-2026",
    status: "Closed",
    impact: "High",
  },
  {
    sn: 2,
    type: "Decision",
    workstream: "Business",
    description: "KYC risk categorisation approach — to follow FB internal scorecard rather than legacy SCB model.",
    owner: "Sreejith",
    raised: "05-06-2026",
    target: "20-06-2026",
    status: "In Review",
    impact: "High",
  },
  {
    sn: 3,
    type: "Risk",
    workstream: "Data Migration",
    description: "Final data migration scoping document delayed from TSYS — risk to dry-run schedule.",
    owner: "Nitin",
    raised: "19-06-2026",
    target: "30-06-2026",
    status: "Open",
    impact: "High",
  },
  {
    sn: 4,
    type: "Risk",
    workstream: "Channel Connectivity",
    description: "WhatsApp banking integration with TSYS / IVR — requirements pending from business.",
    owner: "Bhagyashree",
    raised: "26-06-2026",
    target: "30-06-2026",
    status: "Open",
    impact: "Medium",
  },
  {
    sn: 5,
    type: "Decision",
    workstream: "Scheme & Compliance",
    description: "Production encryption key ceremony to be conducted jointly with TSYS and FB CISO.",
    owner: "Jason / Mahendra",
    raised: "18-06-2026",
    target: "30-06-2026",
    status: "Open",
    impact: "High",
  },
  {
    sn: 6,
    type: "Risk",
    workstream: "Application Build & Support",
    description: "MB/IB API gateway hosting alignment between FB IT and PRIME team pending.",
    owner: "Dinesh",
    raised: "20-06-2026",
    target: "10-07-2026",
    status: "In Review",
    impact: "Medium",
  },
];