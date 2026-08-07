"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { CalendarClock, Loader2 } from "lucide-react";
import { toggleTask } from "@/app/actions/staff";
import { cn } from "@/lib/utils";

export type TaskItemData = {
  id: string;
  title: string;
  isCompleted: boolean;
  dueDate: string | null;
};

export function TaskItem({ task }: { task: TaskItemData }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const toggle = () => {
    startTransition(async () => {
      await toggleTask(task.id, !task.isCompleted);
      router.refresh();
    });
  };

  return (
    <label
      className={cn(
        "flex cursor-pointer items-start gap-3 rounded-md border px-3 py-2.5 transition-colors hover:bg-muted/50",
        pending && "opacity-60"
      )}
    >
      <input
        type="checkbox"
        checked={task.isCompleted}
        disabled={pending}
        onChange={toggle}
        className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-primary"
      />
      <span className="flex-1">
        <span
          className={cn(
            "block text-sm font-medium",
            task.isCompleted && "text-muted-foreground line-through"
          )}
        >
          {task.title}
        </span>
        {task.dueDate && (
          <span className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
            <CalendarClock className="h-3 w-3" />
            {new Date(task.dueDate).toLocaleDateString()}
          </span>
        )}
      </span>
      {pending && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
    </label>
  );
}
