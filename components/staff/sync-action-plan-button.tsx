"use client";

import { useState, useTransition } from "react";
import { ListPlus } from "lucide-react";
import { syncActionPlanToTasks } from "@/app/actions/task-sheets";
import { Button } from "@/components/ui/button";

export function SyncActionPlanButton({ sheetId }: { sheetId: string }) {
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const sync = () =>
    startTransition(async () => {
      const res = await syncActionPlanToTasks(sheetId);
      if (!res.ok) setMessage(res.error ?? "Sync failed.");
      else if (res.added === 0) setMessage("Task tracker is already up to date.");
      else setMessage(`Added ${res.added} action${res.added === 1 ? "" : "s"} to the task tracker.`);
    });

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button type="button" variant="outline" size="sm" onClick={sync} loading={pending}>
        <ListPlus className="h-4 w-4" />
        Add action plan to task tracker
      </Button>
      {message && <span className="text-xs text-muted-foreground">{message}</span>}
    </div>
  );
}
