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
    "sn": 1,
    "workstream": "Business",
    "activity": "Client build & QA (MB/IB/IVR/LR/Batch files)",
    "owner": "FB",
    "leads": "Dinu/ Dinesh",
    "dateRaised": "—",
    "targetDate": "31-07-2026",
    "rag": "warning"
  },
  {
    "sn": 2,
    "workstream": "Business",
    "activity": "Approach notes to be finalized and signed off",
    "owner": "FB",
    "leads": "Kishore",
    "dateRaised": "—",
    "targetDate": "15-07-2026",
    "rag": "warning"
  },
  {
    "sn": 3,
    "workstream": "Platform/Infrastructure",
    "activity": "Creation of Prod and Data Migration environment with service testing",
    "owner": "FB",
    "leads": "Dinu",
    "dateRaised": "—",
    "targetDate": "15-07-2026",
    "rag": "critical"
  },
  {
    "sn": 4,
    "workstream": "Scheme",
    "activity": "Production key exchange between TSYS & scheme post BAR forms finalization",
    "owner": "TSYS & FB",
    "leads": "Jason/Sreejith",
    "dateRaised": "—",
    "targetDate": "15-07-2026",
    "rag": "warning"
  },
  {
    "sn": 5,
    "workstream": "Business",
    "activity": "Testing partner onboarding",
    "owner": "FB",
    "leads": "Libu",
    "dateRaised": "—",
    "targetDate": "15-07-2026",
    "rag": "warning"
  },
  {
    "sn": 6,
    "workstream": "Mar-Com",
    "activity": "Consent communication has been rescheduled from 3 July to the third week of July'26",
    "owner": "SCB",
    "leads": "Neha",
    "dateRaised": "—",
    "targetDate": "3/7/2026",
    "rag": "critical"
  },
  {
    "sn": 7,
    "workstream": "IT",
    "activity": "KAFKA Configuration and payload requirement from TSYS",
    "owner": "FB & TSYS",
    "leads": "Dinu, Eldho/Christos",
    "dateRaised": "—",
    "targetDate": "1/7/2026",
    "rag": "critical"
  }
];

export const pendingFromTsys: PendingItem[] = [
  {
    "sn": 1,
    "workstream": "Program Plan",
    "activity": "Detailed Project Plan to be shared by TSYS to FB including joint tripartite plan",
    "leads": "Himanshu/Ananya",
    "dateRaised": "1/6/2026"
  },
  {
    "sn": 2,
    "workstream": "DWH/data hosting",
    "activity": "Development to be initiated by 13th July, and is getting delayed, at high risk",
    "leads": "Vipin/Petros",
    "dateRaised": "22/6/2026"
  },
  {
    "sn": 3,
    "workstream": "Embossing Files",
    "activity": "TSYS to start development with changes shared by FB, Final SON awaited",
    "leads": "Mahendra",
    "dateRaised": "3/7/2026"
  },
  {
    "sn": 4,
    "workstream": "UCC & CRM integration",
    "activity": "Sample data required by Saven tech for testing APIs, time shared as 17th July",
    "leads": "Neha",
    "dateRaised": "6/7/2026"
  },
  {
    "sn": 5,
    "workstream": "KAFKA Configurations",
    "activity": "Continious network issue, logs shared with TSYS multiple times by FB",
    "leads": "Nicholas",
    "dateRaised": "6/7/2026"
  },
  {
    "sn": 6,
    "workstream": "KAFKA SMS and Email payload details.",
    "activity": "Received payload details for 60 SMS & emails on 9 Jul. Pending details for 30 SMS and Email payloads.",
    "leads": "Vipin",
    "dateRaised": "30/6/2026"
  },
  {
    "sn": 7,
    "workstream": "Reason codes for GL mapping",
    "activity": "The reason codes details for the GL mapping",
    "leads": "Vipin",
    "dateRaised": "6/7/2026"
  },
  {
    "sn": 8,
    "workstream": "Firewall approval",
    "activity": "Security testing report for firewall approval at FB. FB needs to re do the work if it didn't gets resolved by 13th July",
    "leads": "Ananya",
    "dateRaised": "3/7/2026"
  }
];

export const programKpis = {
  total: 219,
  completed: 17,
  inProgress: 35,
  notStarted: 167,
  onHold: 0,
  atRisk: 0,
  overdue: 0,
  overall: 8,
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
  remarks: string;
}

export interface DecisionLog {
  sn: number;
  workstream: string;
  area: string;
  details: string;
  owner: string;
  status: LogStatus;
  remarks: string;
}

export const riskLogs: RiskLog[] = [
  {
    "sn": 1,
    "workstream": "PMO",
    "detail": "TSYS detailed project plan is not progressing , if the same is not received by mid next week it will be challenging to track all critical activities.",
    "mitigation": "Workshop at Mumbai is scheduled on 8th June to 12th June for scoping and for plan finalisation. Direction on 3rd JIC for detailing the plan based on triparty discussion.",
    "raised": "15-May-2026",
    "level": "High",
    "status": "WIP",
    "remarks": "TBD with Saugata"
  },
  {
    "sn": 2,
    "workstream": "IT",
    "detail": "FB IT team to commence application build and QA activities, which may potentially impact the UAT timeline.",
    "mitigation": "Right resouce allocation for AWS, Infra, connectivity",
    "raised": "25-May-2026",
    "level": "Medium",
    "status": "WIP",
    "remarks": "To be revalidate post Dinesh call"
  },
  {
    "sn": 3,
    "workstream": "Product & Network",
    "detail": "TSYS & FB to discuss project timelines considering scheme & encryption setup timelines for VISA",
    "mitigation": "To develop a plan for interdependent activities such as recarding, go-live, customer communications, and card activation.",
    "raised": "3-Jun-2026",
    "level": "High",
    "status": "Open",
    "remarks": "To be checked with Mohit/ Ananya"
  },
  {
    "sn": 4,
    "workstream": "IT",
    "detail": "FD IT to complete production and migration enviroment setup and testing",
    "mitigation": "",
    "raised": "18-Jun-2026",
    "level": "High",
    "status": "Open",
    "remarks": "CISO approval has been received on 22 Jun."
  },
  {
    "sn": 5,
    "workstream": "IT",
    "detail": "DWH Files/data flow to FB, its mapping and development at FB's end",
    "mitigation": "",
    "raised": "22-Jun-2026",
    "level": "High",
    "status": "Open",
    "remarks": ""
  },
  {
    "sn": 6,
    "workstream": "Due Deligence",
    "detail": "It is mandatory Due Diligence to be completed by Deloitte (third party) for TSYS.",
    "mitigation": "Initate the pre-requisite clearance by TSYS",
    "raised": "25-Jun-2026",
    "level": "Low",
    "status": "Open",
    "remarks": ""
  },
  {
    "sn": 7,
    "workstream": "Business",
    "detail": "Onboard a dedicated testing partner at Federal Bank to support validation of systems, processes, and integrations",
    "mitigation": "",
    "raised": "29-Jun-2026",
    "level": "Medium",
    "status": "Open",
    "remarks": ""
  },
  {
    "sn": 8,
    "workstream": "IT",
    "detail": "A CIF unique identifer aligned with the existing TSYS reference number should be defined and confirmed by SCB.",
    "mitigation": "",
    "raised": "7-Jun-2026",
    "level": "High",
    "status": "Open",
    "remarks": ""
  },
  {
    "sn": 9,
    "workstream": "IT",
    "detail": "KAFKA Payload related development",
    "mitigation": "",
    "raised": "1-Jul-2026",
    "level": "High",
    "status": "Open",
    "remarks": ""
  }
];

export const decisionLogs: DecisionLog[] = [
  {
    "sn": 1,
    "workstream": "Business",
    "area": "Card features",
    "details": "A key decision has been made to replicate all existing Soulfire card configurations, features, and pricing structures in the Federal environment without any modifications.",
    "owner": "Libu",
    "status": "Closed",
    "remarks": "Product Mapping is completed with SCB. Product code has been clarified to TSYS"
  },
  {
    "sn": 2,
    "workstream": "Business",
    "area": "Card Fee",
    "details": "Annual fee services will be migrated and maintained under Federal Bank, with fees charged based on original migrated services and existing card charge dates (not re-carding dates).",
    "owner": "Libu",
    "status": "Closed",
    "remarks": "Data migration scope document to be considered as evidence"
  },
  {
    "sn": 3,
    "workstream": "Business",
    "area": "Card Account",
    "details": "All customer accounts, including active and closed, will be migrated from Standard Chartered Bank to the Federal Bank portfolio. The migration scope will include all cards, irrespective of status (active, inactive, closed, expired, or replaced).",
    "owner": "Libu",
    "status": "Closed",
    "remarks": "Data migration scope document to be considered as evidence"
  },
  {
    "sn": 9,
    "workstream": "Data Migration",
    "area": "Scope",
    "details": "The scope of data migration and its subsequent attributes will be discussed and agreed  between all three parties (FB, SCB, TSYS)",
    "owner": "Joint",
    "status": "WIP",
    "remarks": ""
  },
  {
    "sn": 5,
    "workstream": "Platform & Infrastructure",
    "area": "Network Connectivity",
    "details": "Network connectivity between FB and TSYS will be established via a private link. The IT team will provide the cost details for setting up the Project Soulfire infrastructure in due course.",
    "owner": "Dinu",
    "status": "Closed",
    "remarks": ""
  },
  {
    "sn": 7,
    "workstream": "Compliance",
    "area": "KYC",
    "details": "An approach note pertaining to KYC, customer risk categorization and delivery address update to be drafted to ensure regulatory alignment for new portfolio.",
    "owner": "Kishore/Sreejith",
    "status": "WIP",
    "remarks": ""
  },
  {
    "sn": 8,
    "workstream": "Business",
    "area": "Rewards",
    "details": "A decision has been made that all LR rewards accrual and redemption activities will be processed within the LR system. TSYS will continue to implement and maintain the required business logic updates within its platform and ensure seamless routing of all relevant transactions to LR.",
    "owner": "Libu",
    "status": "Closed",
    "remarks": "Data migration scope document to be considered as evidence"
  },
  {
    "sn": 10,
    "workstream": "Marketing & Communication",
    "area": "Consent & communication",
    "details": "Consent mechanism, channels, frequency and calendar plan is awaited. This is proposed to be discussed in upcoming JIC on 08-06-2026",
    "owner": "Shefali",
    "status": "Closed",
    "remarks": "Point discussed in 2nd JIC on 8 Jun."
  },
  {
    "sn": 11,
    "workstream": "Business",
    "area": "Product",
    "details": "A Joint decision between SCB and FB, needs to be made on usage of Manhattan card name post portfolio transfer.",
    "owner": "Leadership (FB, SCB)",
    "status": "Closed",
    "remarks": "Evidence considered as product code mapping confirmation to TSYS, where mentioned VISA Manhattan Platinum card mapping to FB Manhattan Platinum Primary card."
  },
  {
    "sn": 12,
    "workstream": "Business",
    "area": "Recarding",
    "details": "The decision on 37 day timeline for card closure is agreed to commence from the BIG Bang date.",
    "owner": "Saugata",
    "status": "Closed",
    "remarks": "This can be closed based on Recarding note"
  },
  {
    "sn": 13,
    "workstream": "IT",
    "area": "Authentication Protocol",
    "details": "As a Authentication Protocol the Email Authentication, as MFA method will be enabled for integration/configurations.",
    "owner": "Dinu",
    "status": "Closed",
    "remarks": "Dinu confirmed through email on 8 Jun."
  },
  {
    "sn": 14,
    "workstream": "Operations",
    "area": "Dispute Management",
    "details": "FB to work on BPO set up/dispute management for aquired portfolio. To elaborate the TSYS BPO setup is based out of the Philippines, while the data storage is maintained in India. Require the decision makking on the operating model with compliance & regulatory perspective in India",
    "owner": "Saugata/Brijesh",
    "status": "Closed",
    "remarks": ""
  },
  {
    "sn": 15,
    "workstream": "IT",
    "area": "Enviroment set-up & testing",
    "details": "IT to take-up CISO exception approval for Production enviroment creation and data migration enviroment creation",
    "owner": "Sreejith",
    "status": "Closed",
    "remarks": "CISO approval received on 22 Jun"
  },
  {
    "sn": 16,
    "workstream": "Recarding",
    "area": "Embossing File",
    "details": "FIS has confirmed that the embossing file can be generated in a single-line format, in alignment with the specifications and expectations of the embossing team, eliminating the need for the earlier two-line format.",
    "owner": "TSYS",
    "status": "Closed",
    "remarks": "Mahendra confirmed on 25 Jun."
  },
  {
    "sn": 17,
    "workstream": "Business",
    "area": "Statement",
    "details": "Decision on revision of the past 12 month's statement format in line with the Federal template, with finalization and approval from SCB, considering that existing statements contain card details and branding elements.",
    "owner": "Libu",
    "status": "WIP",
    "remarks": ""
  }
];