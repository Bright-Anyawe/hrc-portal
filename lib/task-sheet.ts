// Shared types and option lists for the Consultant-Client Task Sheet.
// Sections A–T mirror the HRC "Consultant-Client Task Sheet" document.

export type DocumentRow = {
  document?: string;
  dateVersion?: string;
  receivedFrom?: string;
  followUp?: string;
};

export type RiskRow = {
  risk?: string;
  likelihood?: string;
  impact?: string;
  response?: string;
};

export type ActionRow = {
  action?: string;
  responsible?: string;
  dueDate?: string;
  expectedOutput?: string;
  status?: string;
};

export type TaskSheetData = {
  // A. Client & engagement identification
  identification?: {
    clientName?: string;
    clientCode?: string;
    project?: string;
    projectCode?: string;
    leadConsultant?: string;
    consultantName?: string;
    contactPerson?: string;
    contactPosition?: string;
    interactionDate?: string;
    startTime?: string;
    endTime?: string;
    interactionNo?: string;
    location?: string;
    interactionType?: string[];
    interactionTypeOther?: string;
  };
  // B. Purpose of this interaction
  purpose?: string;
  // C. Client's presenting issue / request
  presentingIssue?: {
    account?: string;
    whenArose?: string;
    whatChanged?: string;
    effects?: string[];
    effectsOther?: string;
    effectDetails?: string;
  };
  // D. Evidence / information reviewed
  evidence?: {
    sources?: string[];
    sourcesOther?: string;
    keyObservations?: string;
    documents?: DocumentRow[];
    stillRequired?: string;
  };
  // E. Consultant's diagnostic assessment
  diagnosis?: {
    presentingProblem?: string;
    rootCauses?: string;
    contributingFactors?: string;
    constraints?: string;
    opportunities?: string;
    risks?: RiskRow[];
    status?: string[];
  };
  // F. Problem / task definition
  definition?: {
    taskStatement?: string;
    desiredResult?: string;
    scopeIncluded?: string;
    scopeExcluded?: string;
    priority?: string;
    targetDate?: string;
  };
  // G. Intervention / recommendation
  intervention?: {
    recommendation?: string;
    types?: string[];
    typesOther?: string;
    rationale?: string;
  };
  // H. Consulting methodology / work cycle
  methodology?: {
    stage?: string;
    methodUsed?: string;
  };
  // I. Agreed action plan
  actionPlan?: ActionRow[];
  // J. Decisions & agreements reached
  decisions?: {
    items?: string[];
    scopeChanged?: string;
    scopeChangeDetails?: string;
    commercialImplication?: string;
  };
  // K. Client commitments
  clientCommitments?: {
    information?: string;
    personnel?: string;
    approvals?: string;
    other?: string;
  };
  // L. Consultant commitments
  consultantCommitments?: {
    work?: string;
    deliverables?: string;
    responsible?: string;
    dueDate?: string;
  };
  // M. Issues requiring escalation
  escalation?: {
    to?: string[];
    issue?: string;
    recommendedAction?: string;
  };
  // N. Client feedback / response
  feedback?: {
    response?: string;
    comments?: string;
  };
  // O. Consultant's professional notes
  professionalNotes?: string;
  // P. Opportunities / additional needs identified
  opportunities?: {
    additionalNeed?: string;
    potentialOpportunity?: string;
    relevantService?: string;
    recommendedFollowUp?: string;
    separateProposal?: string;
  };
  // Q. Next interaction / follow-up
  nextInteraction?: {
    nextAction?: string;
    date?: string;
    purpose?: string;
    consultantResponsible?: string;
  };
  // R. Task status at end of interaction
  taskStatus?: {
    statuses?: string[];
    overallCompletion?: string;
  };
  // S. Consultant certification (reviewer part is stored on the TaskSheet row)
  certification?: {
    consultantName?: string;
    certified?: boolean;
    // Typed full name, acting as the consultant's e-signature.
    signature?: string;
    date?: string;
    // Set by the Principal / Lead Consultant when marking the sheet reviewed.
    reviewerSignature?: string;
  };
  // T. Continuity record
  continuity?: {
    previousSheetNo?: string;
    currentSheetNo?: string;
    nextSheetNo?: string;
    clientFile?: string;
  };
};

export const INTERACTION_TYPES = [
  "Meeting",
  "Site Visit",
  "Interview",
  "Workshop",
  "Phone/Virtual",
  "Review",
];

export const EFFECT_AREAS = [
  "Financial performance",
  "Operations",
  "Staff / HR",
  "Customers / beneficiaries",
  "Governance",
  "Strategy",
  "Projects/programmes",
  "Compliance",
  "Reputation",
  "Growth",
];

export const EVIDENCE_SOURCES = [
  "Client interview",
  "Management interview",
  "Staff interview",
  "Site observation",
  "Financial statements",
  "Management accounts",
  "Strategic plan",
  "Business plan",
  "HR records",
  "Policies/procedures",
  "Project reports",
  "M&E data",
  "Market information",
  "Customer/beneficiary data",
  "Previous reports",
  "Contracts",
  "TOR / RFP",
  "Survey/data set",
];

export const DIAGNOSTIC_STATUSES = [
  "Preliminary assessment",
  "Further information required",
  "Diagnosis substantially established",
  "Client validation required",
  "Ready for intervention/action",
];

export const PRIORITIES = ["Critical/Urgent", "High", "Medium", "Low"];

export const INTERVENTION_TYPES = [
  "Advisory",
  "Research/analysis",
  "Strategy development",
  "Training/capacity building",
  "Facilitation",
  "Organisational development",
  "Project design",
  "Project management",
  "Monitoring & evaluation",
  "Feasibility study",
  "Business planning",
  "Process improvement",
  "Data analytics",
  "Technical assistance",
  "Coaching/mentoring",
];

export const METHODOLOGY_STAGES = [
  { id: "UNDERSTAND", hint: "Gather facts, context, expectations and evidence." },
  { id: "DIAGNOSE", hint: "Analyse causes, gaps, risks, constraints and opportunities." },
  { id: "DEFINE", hint: "Convert findings into a precise task statement and agreed objectives." },
  { id: "DESIGN", hint: "Develop the intervention, methodology, work plan and deliverables." },
  { id: "DELIVER", hint: "Execute the agreed professional service or intervention." },
  { id: "REVIEW", hint: "Assess outputs, client response, results, variances and lessons." },
  { id: "FOLLOW-UP", hint: "Determine further action, implementation support and subsequent needs." },
];

export const ACTION_STATUSES = [
  "Not Started",
  "In Progress",
  "Completed",
  "Deferred",
  "Cancelled",
];

export const RATINGS = ["Low", "Medium", "High"];

export const COMMERCIAL_IMPLICATIONS = [
  "None",
  "Additional fee may be required",
  "Budget adjustment required",
  "Variation required",
  "To be assessed",
];

export const ESCALATION_TARGETS = [
  "Principal Consultant",
  "Management",
  "Finance",
  "Legal/Compliance",
  "Conflict/Risk Review",
  "Client Relationship Owner",
];

export const CLIENT_RESPONSES = [
  "Accepted",
  "Accepted with modifications",
  "Further discussion required",
  "Additional information requested",
  "Not accepted",
  "Decision pending",
];

export const TASK_STATUSES = [
  "New task identified",
  "Task defined",
  "Assessment ongoing",
  "Intervention designed",
  "Work in progress",
  "Awaiting client information",
  "Awaiting client approval",
  "Deliverable submitted",
  "Client review pending",
  "Task completed",
  "Follow-up required",
  "Task closed",
];

// Client-facing summary: an explicit whitelist so diagnostic assessment,
// professional notes, escalations and opportunities never reach clients.
export type ClientTaskSheetSummary = {
  interactionType: string[];
  location?: string;
  purpose?: string;
  decisions: string[];
  scopeChange?: string;
  actionPlan: ActionRow[];
  clientCommitments: { label: string; value: string }[];
  consultantCommitments: { work?: string; deliverables?: string; dueDate?: string };
  nextInteraction?: { date?: string; purpose?: string; nextAction?: string };
};

export function clientSummary(data: TaskSheetData): ClientTaskSheetSummary {
  const id = data.identification ?? {};
  const cc = data.clientCommitments ?? {};
  const hc = data.consultantCommitments ?? {};
  const next = data.nextInteraction ?? {};
  const types = [...(id.interactionType ?? [])];
  if (id.interactionTypeOther?.trim()) types.push(id.interactionTypeOther.trim());

  return {
    interactionType: types,
    location: id.location,
    purpose: data.purpose,
    decisions: (data.decisions?.items ?? []).filter((d) => d.trim()),
    scopeChange:
      data.decisions?.scopeChanged === "Yes"
        ? data.decisions.scopeChangeDetails || "Scope change agreed"
        : undefined,
    actionPlan: (data.actionPlan ?? []).filter((r) => r.action?.trim()),
    clientCommitments: [
      { label: "Information / documents to provide", value: cc.information ?? "" },
      { label: "Personnel required", value: cc.personnel ?? "" },
      { label: "Approvals required", value: cc.approvals ?? "" },
      { label: "Other obligations", value: cc.other ?? "" },
    ].filter((c) => c.value.trim()),
    consultantCommitments: {
      work: hc.work,
      deliverables: hc.deliverables,
      dueDate: hc.dueDate,
    },
    nextInteraction:
      next.date || next.purpose || next.nextAction
        ? { date: next.date, purpose: next.purpose, nextAction: next.nextAction }
        : undefined,
  };
}

export function formatSheetNo(n: number | null | undefined): string {
  if (!n || n < 1) return "";
  return `TS-${String(n).padStart(3, "0")}`;
}

// Projects have no stored code yet, so derive a stable one from the id.
export function projectCode(projectId: string): string {
  return `PRJ-${projectId.slice(-6).toUpperCase()}`;
}

export const TASK_SHEET_STATUS_LABEL = {
  DRAFT: "Draft",
  SUBMITTED: "Submitted",
  REVIEWED: "Reviewed",
} as const;

export const TASK_SHEET_STATUS_VARIANT = {
  DRAFT: "secondary",
  SUBMITTED: "warning",
  REVIEWED: "success",
} as const;
