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
        "group flex cursor-pointer items-start gap-3 rounded-md border px-3 py-2.5 transition-all duration-150 hover:border-ring/40 hover:bg-muted/50",
        task.isCompleted && "border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-900/10",
        pending && "pointer-events-none opacity-60"
      )}
    >
      <input
        type="checkbox"
        checked={task.isCompleted}
        disabled={pending}
        onChange={toggle}
        className="peer sr-only"
      />
      <span
        aria-hidden
        className="mt-0.5 flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[5px] border-2 border-input transition-all duration-150 group-hover:border-brand-sky peer-checked:border-brand-sky peer-checked:bg-brand-sky"
      >
        <svg
          viewBox="0 0 16 16"
          className="h-3 w-3"
          fill="none"
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path
            d="M3 8.5 6.5 12 13 4.5"
            className={cn(task.isCompleted && "animate-draw-check")}
          />
        </svg>
      </span>
      <span className="flex-1">
        <span
          className={cn(
            "block text-sm font-medium transition-colors duration-150",
            task.isCompleted && "text-muted-foreground line-through"
          )}
        >
          {task.title}
        </span>
        {task.dueDate && (
          <span
            className={cn(
              "mt-0.5 flex items-center gap-1 text-xs transition-colors duration-150",
              task.isCompleted
                ? "text-muted-foreground/70"
                : "text-muted-foreground"
            )}
          >
            <CalendarClock className="h-3 w-3" />
            {new Date(task.dueDate).toLocaleDateString()}
          </span>
        )}
      </span>
      {pending && (
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      )}
    </label>
  );
}