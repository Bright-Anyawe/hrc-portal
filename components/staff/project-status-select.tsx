"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateProjectStatus } from "@/app/actions/staff";
import { Select } from "@/components/ui/select";
import { STATUS_LABEL } from "@/lib/status";
import type { ProjectStatus } from "@/generated/prisma/enums";

const OPTIONS: ProjectStatus[] = [
  "PLANNING",
  "ACTIVE",
  "ON_HOLD",
  "COMPLETED",
];

export function ProjectStatusSelect({
  projectId,
  current,
}: {
  projectId: string;
  current: ProjectStatus;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const change = (value: string) => {
    startTransition(async () => {
      await updateProjectStatus(projectId, value as ProjectStatus);
      router.refresh();
    });
  };

  return (
    <Select
      value={current}
      disabled={pending}
      onChange={(e) => change(e.target.value)}
      className="w-40"
      aria-label="Project status"
    >
      {OPTIONS.map((status) => (
        <option key={status} value={status}>
          {STATUS_LABEL[status]}
        </option>
      ))}
    </Select>
  );
}
