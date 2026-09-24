import { Badge } from "@/components/ui/badge";
import {
  TASK_SHEET_STATUS_LABEL,
  TASK_SHEET_STATUS_VARIANT,
} from "@/lib/task-sheet";
import type { TaskSheetStatus } from "@/generated/prisma/enums";

export function TaskSheetStatusBadge({ status }: { status: TaskSheetStatus }) {
  return (
    <Badge variant={TASK_SHEET_STATUS_VARIANT[status]} dot>
      {TASK_SHEET_STATUS_LABEL[status]}
    </Badge>
  );
}
