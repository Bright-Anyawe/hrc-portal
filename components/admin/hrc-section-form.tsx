"use client";

import { useState } from "react";
import { useActionState } from "react";
import {
  updateHrcSection,
  approveProfile,
  rejectProfile,
  type ActionResult,
  type HrcInternalData,
} from "@/app/actions/client-profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Shield, CheckCircle, XCircle } from "lucide-react";

export function HrcSectionForm({
  profileId,
  initialData,
  profileStatus,
}: {
  profileId: string;
  initialData: HrcInternalData;
  profileStatus: string;
}) {
  const [local, setLocal] = useState(initialData);
  const [state, formAction, pending] = useActionState<ActionResult, FormData>(
    updateHrcSection,
    { ok: false }
  );
  const [rejectReason, setRejectReason] = useState("");
  const [approvePending, setApprovePending] = useState(false);
  const [decisionResult, setDecisionResult] = useState<ActionResult | null>(
    null
  );

  const handleSave = () => {
    const fd = new FormData();
    fd.append("profileId", profileId);
    fd.append("data", JSON.stringify(local));
    formAction(fd);
  };

  const handleApprove = async () => {
    setApprovePending(true);
    const result = await approveProfile(profileId);
    setDecisionResult(result);
    setApprovePending(false);
  };

  const handleReject = async () => {
    setApprovePending(true);
    const result = await rejectProfile(profileId, rejectReason);
    setDecisionResult(result);
    setApprovePending(false);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            HRC Internal Section
          </CardTitle>
          <CardDescription>
            Internal classification, compliance, and approval details. Not
            visible to the client.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {state.ok && (
            <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200">
              Section saved.
            </p>
          )}
          {state.error && (
            <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {state.error}
            </p>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Client ID / Account No.</Label>
              <Input
                value={local.clientId ?? ""}
                onChange={(e) =>
                  setLocal({ ...local, clientId: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Client Classification</Label>
              <Select
                value={local.clientClassification ?? ""}
                onChange={(e) =>
                  setLocal({ ...local, clientClassification: e.target.value })
                }
              >
                <option value="">Select</option>
                <option value="Strategic">Strategic</option>
                <option value="Key Account">Key Account</option>
                <option value="Standard">Standard</option>
                <option value="Prospective">Prospective</option>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Engagement Risk Rating</Label>
              <Select
                value={local.engagementRiskRating ?? ""}
                onChange={(e) =>
                  setLocal({ ...local, engagementRiskRating: e.target.value })
                }
              >
                <option value="">Select</option>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Conflict Check Completed By</Label>
              <Input
                value={local.conflictCheckCompleted ?? ""}
                onChange={(e) =>
                  setLocal({ ...local, conflictCheckCompleted: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Conflict Check Date</Label>
              <Input
                type="date"
                value={local.conflictCheckDate ?? ""}
                onChange={(e) =>
                  setLocal({ ...local, conflictCheckDate: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Due Diligence / KYC Status</Label>
              <Select
                value={local.dueDiligenceStatus ?? ""}
                onChange={(e) =>
                  setLocal({ ...local, dueDiligenceStatus: e.target.value })
                }
              >
                <option value="">Select</option>
                <option value="Complete">Complete</option>
                <option value="Pending">Pending</option>
                <option value="Not Required">Not Required</option>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Proposal Required?</Label>
              <Select
                value={local.proposalRequired ?? ""}
                onChange={(e) =>
                  setLocal({ ...local, proposalRequired: e.target.value })
                }
              >
                <option value="">Select</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Proposal / Opportunity Reference</Label>
              <Input
                value={local.proposalReference ?? ""}
                onChange={(e) =>
                  setLocal({ ...local, proposalReference: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Assigned Principal / Lead Consultant</Label>
              <Input
                value={local.assignedPrincipal ?? ""}
                onChange={(e) =>
                  setLocal({ ...local, assignedPrincipal: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Approved By</Label>
              <Input
                value={local.approvedBy ?? ""}
                onChange={(e) =>
                  setLocal({ ...local, approvedBy: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Approval Date</Label>
              <Input
                type="date"
                value={local.approvalDate ?? ""}
                onChange={(e) =>
                  setLocal({ ...local, approvalDate: e.target.value })
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Internal notes / next actions</Label>
            <textarea
              value={local.internalNotes ?? ""}
              onChange={(e) =>
                setLocal({ ...local, internalNotes: e.target.value })
              }
              rows={4}
              className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={pending}>
              {pending ? "Saving..." : "Save HRC Section"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Approval Actions */}
      {profileStatus === "PENDING_REVIEW" && (
        <Card>
          <CardHeader>
            <CardTitle>Review Decision</CardTitle>
            <CardDescription>
              Approve or reject this client profile.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {decisionResult?.error && (
              <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {decisionResult.error}
              </p>
            )}
            {decisionResult?.ok && (
              <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200">
                Decision recorded.
              </p>
            )}

            <div className="flex gap-3">
              <Button
                onClick={handleApprove}
                disabled={approvePending}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                <CheckCircle className="h-4 w-4" />
                {approvePending ? "Processing..." : "Approve Profile"}
              </Button>

              <div className="flex gap-2">
                <Input
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Rejection reason (optional)"
                  className="w-64"
                />
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleReject}
                  disabled={approvePending}
                >
                  <XCircle className="h-4 w-4" />
                  Reject
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
