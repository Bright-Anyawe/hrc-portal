"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Undo2 } from "lucide-react";
import { reviewTaskSheet } from "@/app/actions/task-sheets";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormAlert } from "@/components/ui/form-alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function TaskSheetReview({
  sheetId,
  reviewerName,
}: {
  sheetId: string;
  reviewerName: string;
}) {
  const router = useRouter();
  const [comments, setComments] = useState("");
  const [signature, setSignature] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const decide = (decision: "REVIEWED" | "RETURNED") =>
    startTransition(async () => {
      const res = await reviewTaskSheet(sheetId, decision, comments, signature);
      if (res.ok) router.refresh();
      else setError(res.error ?? "Review failed.");
    });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Principal / Lead Consultant review</CardTitle>
        <CardDescription>
          Record review comments, then mark the sheet reviewed or return it to
          the consultant for revision.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {error && <FormAlert>{error}</FormAlert>}
        <textarea
          value={comments}
          onChange={(e) => setComments(e.target.value)}
          rows={3}
          placeholder="Review comments"
          className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Reviewed by</Label>
            <Input value={reviewerName} disabled />
          </div>
          <div className="space-y-2">
            <Label>Reviewer signature (type your full name)</Label>
            <Input
              value={signature}
              onChange={(e) => setSignature(e.target.value)}
              placeholder={reviewerName}
              className="font-serif italic"
            />
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          The signature is required to mark the sheet reviewed; the date is recorded automatically.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => decide("REVIEWED")} loading={pending}>
            <CheckCircle2 className="h-4 w-4" />
            Mark reviewed
          </Button>
          <Button
            variant="outline"
            onClick={() => decide("RETURNED")}
            disabled={pending}
          >
            <Undo2 className="h-4 w-4" />
            Return for revision
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
