import type { ProjectStatus } from "@/generated/prisma/enums";

export const STATUS_LABEL: Record<ProjectStatus, string> = {
  PLANNING: "Planning",
  ACTIVE: "Active",
  ON_HOLD: "On hold",
  COMPLETED: "Completed",
};

export const STATUS_VARIANT: Record<
  ProjectStatus,
  "info" | "default" | "warning" | "success"
> = {
  PLANNING: "info",
  ACTIVE: "default",
  ON_HOLD: "warning",
  COMPLETED: "success",
};
