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
  // Form helpers, not part of the paper sheet.
  meta?: {
    mode?: "quick" | "full";
    carriedFrom?: string;
  };
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

// --- Form ergonomics ---------------------------------------------------------

// Step indices shown in "Quick log" mode: A, B–C, I–J, P–R, S–T.
export const QUICK_STEPS = [0, 1, 6, 9, 10];

// Sections copied from the previous sheet when a new one is created, so
// follow-up interactions become "update" rather than "rewrite".
export function carryForward(prev: TaskSheetData): TaskSheetData {
  const clone = <T,>(v: T): T => (v === undefined ? v : JSON.parse(JSON.stringify(v)));
  return {
    purpose: prev.nextInteraction?.purpose ?? "",
    identification: {
      location: prev.identification?.location,
      interactionType: clone(prev.identification?.interactionType),
      interactionTypeOther: prev.identification?.interactionTypeOther,
    },
    evidence: clone(prev.evidence),
    diagnosis: clone(prev.diagnosis),
    definition: clone(prev.definition),
    intervention: clone(prev.intervention),
    methodology: clone(prev.methodology),
    actionPlan: clone(prev.actionPlan),
    clientCommitments: clone(prev.clientCommitments),
    consultantCommitments: clone(prev.consultantCommitments),
  };
}

// Tappable phrases inserted into free-text fields (then edited as needed).
export const PHRASES = {
  purpose: [
    "Kick-off / inception meeting",
    "Clarify scope and expectations",
    "Data and information collection",
    "Diagnostic interview with management",
    "Present preliminary findings",
    "Validate draft report with client",
    "Progress review",
    "Agree next steps and work plan",
  ],
  presentingIssue: [
    "Declining financial performance",
    "Weak internal systems and controls",
    "Staff capacity gaps",
    "Unclear strategic direction",
    "Funding / resource constraints",
    "Compliance requirements not being met",
  ],
  whenArose: ["Within the last 3 months", "Over the past year", "Long-standing issue", "Since a recent leadership change"],
  whatChanged: ["New leadership", "Loss of key funding", "Rapid growth", "Regulatory change", "Market / competitive change"],
  keyObservations: [
    "Records are incomplete or outdated",
    "Roles and responsibilities are unclear",
    "Management is committed to change",
    "Processes are largely manual",
    "Data is not used for decision-making",
  ],
  stillRequired: ["Audited financial statements", "Organogram", "Strategic plan", "HR policies", "Project reports", "Staff list"],
  rootCauses: [
    "Inadequate systems and processes",
    "Capacity / skills gaps",
    "Weak governance and oversight",
    "Insufficient funding",
    "Poor communication across teams",
  ],
  constraints: ["Limited budget", "Tight timelines", "Limited staff availability", "Data unavailable", "Pending board approval"],
  opportunities: ["Management buy-in", "Donor interest", "Digitisation potential", "Untapped market segment", "Existing staff expertise"],
  taskStatement: [
    "Develop a strategic plan",
    "Conduct an organisational assessment",
    "Design and deliver a training programme",
    "Review and update policies and procedures",
    "Carry out a feasibility study",
  ],
  desiredResult: ["Approved plan adopted by the board", "Improved staff performance", "Clear, documented processes", "Funding secured", "Informed management decision"],
  recommendation: [
    "Proceed with a full diagnostic assessment",
    "Run a stakeholder validation workshop",
    "Develop a phased implementation plan",
    "Provide targeted technical assistance",
  ],
  rationale: ["Addresses the root cause identified", "Fits the client's budget and timeline", "Builds internal capacity", "Proven approach in similar organisations"],
  methodUsed: ["Structured interview", "Document review", "SWOT analysis", "Problem tree", "Stakeholder mapping", "Focus group discussion", "Site observation"],
  clientInformation: ["Financial statements", "Organogram", "Strategic plan", "HR records", "Previous reports", "Staff list"],
  clientPersonnel: ["Nominate a focal person", "Management team availability", "Finance officer", "HR officer"],
  clientApprovals: ["Approve work plan", "Approve inception report", "Approve draft report", "Approve budget"],
  consultantWork: ["Prepare inception report", "Conduct field data collection", "Draft the report", "Facilitate workshop", "Develop tools and templates"],
  deliverables: ["Inception report", "Draft report", "Final report", "Workshop report", "Presentation slides", "Training materials"],
  escalationIssue: ["Scope creep", "Delayed client information", "Payment concerns", "Potential conflict of interest"],
  feedbackComments: ["Client satisfied with progress", "Client requested more detail", "Client will revert after internal discussion"],
  professionalNotes: ["Client engaged and cooperative", "Key decision-maker was absent", "Follow-up needed on outstanding documents"],
  nextAction: ["Send meeting notes", "Share draft for review", "Collect outstanding documents", "Schedule workshop"],
  nextPurpose: ["Progress review", "Present findings", "Validation workshop", "Collect outstanding information"],
} as const;

type StepCheck = { filled: number; total: number };
const has = (v: unknown) =>
  Array.isArray(v) ? v.length > 0 : typeof v === "boolean" ? v : !!String(v ?? "").trim();

// Key fields per step, used for the ✓ / • progress indicators.
export function stepProgress(d: TaskSheetData): StepCheck[] {
  const id = d.identification ?? {};
  const checks: unknown[][] = [
    [id.interactionDate, id.contactPerson, id.location, id.interactionType],
    [d.purpose, d.presentingIssue?.account],
    [d.evidence?.sources, d.evidence?.keyObservations],
    [d.diagnosis?.presentingProblem, d.diagnosis?.rootCauses, d.diagnosis?.status],
    [d.definition?.taskStatement, d.definition?.priority],
    [d.intervention?.recommendation, d.intervention?.types, d.methodology?.stage],
    [(d.actionPlan ?? []).some((r) => r.action?.trim()), (d.decisions?.items ?? []).some((i) => i.trim())],
    [Object.values(d.clientCommitments ?? {}).some(has), d.consultantCommitments?.work],
    [d.escalation?.to, d.feedback?.response],
    [d.nextInteraction?.date || d.nextInteraction?.nextAction, d.taskStatus?.statuses],
    [d.certification?.certified, d.certification?.signature],
  ];
  return checks.map((c) => ({ filled: c.filter(has).length, total: c.length }));
}

// Fields required to submit, with the step each one lives on.
export function missingForSubmit(d: TaskSheetData): { step: number; label: string }[] {
  const out: { step: number; label: string }[] = [];
  if (!d.identification?.interactionDate) out.push({ step: 0, label: "date of interaction (A)" });
  if (!d.purpose?.trim()) out.push({ step: 1, label: "purpose of interaction (B)" });
  if (!d.presentingIssue?.account?.trim()) out.push({ step: 1, label: "presenting issue (C)" });
  if (!d.certification?.certified) out.push({ step: 10, label: "consultant certification (S)" });
  if (!d.certification?.signature?.trim()) out.push({ step: 10, label: "consultant signature (S)" });
  return out;
}
