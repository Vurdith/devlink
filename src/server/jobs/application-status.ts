import type { ApplicationStatus } from "@prisma/client";

export const applicantVisibleApplicationStatuses = ["PENDING", "ACCEPTED", "DECLINED"] as const satisfies readonly ApplicationStatus[];

export type ApplicationStatusTransitionResult =
  | { ok: true; changed: boolean; status: ApplicationStatus }
  | { ok: false; error: string; statusCode: number };

export function parseApplicationStatus(value: unknown): ApplicationStatus | null {
  return applicantVisibleApplicationStatuses.includes(value as ApplicationStatus)
    ? (value as ApplicationStatus)
    : null;
}

export function validateApplicationStatusTransition(
  currentStatus: ApplicationStatus,
  nextStatus: ApplicationStatus
): ApplicationStatusTransitionResult {
  if (currentStatus === nextStatus) {
    return { ok: true, changed: false, status: nextStatus };
  }

  if (currentStatus !== "PENDING") {
    return {
      ok: false,
      error: `This application is already ${currentStatus.toLowerCase()}.`,
      statusCode: 409,
    };
  }

  if (nextStatus === "PENDING") {
    return {
      ok: false,
      error: "Applications can only be accepted or declined from pending.",
      statusCode: 400,
    };
  }

  return { ok: true, changed: true, status: nextStatus };
}
