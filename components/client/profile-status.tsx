import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ClipboardCheck, Check, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

type ProfileStatus = "DRAFT" | "PENDING_REVIEW" | "APPROVED" | "REJECTED";

const STATUS_CONFIG: Record<
  ProfileStatus,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
  DRAFT: { label: "Draft", variant: "secondary" },
  PENDING_REVIEW: { label: "Pending Review", variant: "default" },
  APPROVED: { label: "Approved", variant: "default" },
  REJECTED: { label: "Needs Updates", variant: "destructive" },
};

export function ProfileStatusBadge({ status }: { status: ProfileStatus }) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.DRAFT;
  return <Badge variant={config.variant}>{config.label}</Badge>;
}

type ChecklistItem = {
  key: string;
  label: string;
  checked: boolean;
};

function buildChecklist(
  status: ProfileStatus,
  completionPct: number,
  hrcData: Record<string, unknown>,
  hasConsultant: boolean
): ChecklistItem[] {
  return [
    {
      key: "profile_completed",
      label: "Client profile completed",
      checked: completionPct >= 80,
    },
    {
      key: "scope_received",
      label: "Scope / TOR received",
      checked: !!hrcData.proposalReference,
    },
    {
      key: "commercial_terms",
      label: "Commercial terms discussed",
      checked: status === "APPROVED",
    },
    {
      key: "nda_executed",
      label: "NDA executed (if applicable)",
      checked: hrcData.confidentialityRequired === "No" || status === "APPROVED",
    },
    {
      key: "tax_details",
      label: "Tax / invoicing details confirmed",
      checked: status === "APPROVED",
    },
    {
      key: "lead_consultant",
      label: "Lead consultant assigned",
      checked: hasConsultant,
    },
    {
      key: "primary_verified",
      label: "Primary contact verified",
      checked: status === "APPROVED",
    },
    {
      key: "conflict_check",
      label: "Conflict check completed",
      checked: !!hrcData.conflictCheckDate,
    },
    {
      key: "proposal_issued",
      label: "Proposal / quotation issued",
      checked: hrcData.proposalRequired === "No" || status === "APPROVED",
    },
    {
      key: "contract_signed",
      label: "Contract / engagement letter signed",
      checked: status === "APPROVED",
    },
    {
      key: "project_code",
      label: "Project code created",
      checked: false,
    },
    {
      key: "kickoff_meeting",
      label: "Kick-off meeting scheduled",
      checked: false,
    },
  ];
}

export function OnboardingChecklist({
  status,
  completionPct,
  hrcData,
  hasConsultant,
}: {
  status: ProfileStatus;
  completionPct: number;
  hrcData: Record<string, unknown>;
  hasConsultant: boolean;
}) {
  const items = buildChecklist(status, completionPct, hrcData, hasConsultant);
  const checkedCount = items.filter((i) => i.checked).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5 text-primary" />
            Onboarding Checklist
          </span>
          <span className="text-sm font-normal text-muted-foreground">
            {checkedCount}/{items.length}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-2 sm:grid-cols-2">
          {items.map((item) => (
            <div
              key={item.key}
              className={cn(
                "flex items-center gap-2 rounded-md border px-3 py-2 text-sm",
                item.checked
                  ? "border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-900/20"
                  : "border-border"
              )}
            >
              {item.checked ? (
                <Check className="h-4 w-4 shrink-0 text-emerald-600" />
              ) : (
                <Circle className="h-4 w-4 shrink-0 text-muted-foreground" />
              )}
              <span
                className={cn(
                  item.checked && "text-emerald-800 dark:text-emerald-200"
                )}
              >
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
