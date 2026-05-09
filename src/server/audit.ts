import { prisma } from "@/server/db";
import { createLogger } from "@/server/logger";
import type { AuditLog, Prisma } from "@prisma/client";

const logger = createLogger("audit");
const DEFAULT_AUDIT_LOG_LIMIT = 100;
const MAX_AUDIT_LOG_LIMIT = 500;
const EMPTY_JSON_OBJECT = {} as Prisma.InputJsonObject;

export type AuditAction =
  | "USER_LOGIN"
  | "USER_LOGOUT"
  | "USER_REGISTER"
  | "PASSWORD_CHANGE"
  | "PASSWORD_RESET"
  | "EMAIL_CHANGE"
  | "ACCOUNT_DELETE"
  | "POST_CREATE"
  | "POST_DELETE"
  | "PROFILE_UPDATE"
  | "ESCROW_CREATE"
  | "ESCROW_RELEASE"
  | "VERIFICATION_SUBMIT"
  | "TWO_FA_ENABLE"
  | "TWO_FA_DISABLE"
  | "ROLE_CHANGE"
  | "SETTINGS_UPDATE"
  | "API_KEY_CREATE"
  | "API_KEY_DELETE";

interface AuditLogInput {
  userId: string;
  action: AuditAction;
  details?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
}

function normalizeAuditLimit(limit: number): number {
  if (!Number.isFinite(limit) || limit < 1) return DEFAULT_AUDIT_LOG_LIMIT;
  return Math.min(Math.floor(limit), MAX_AUDIT_LOG_LIMIT);
}

export async function createAuditLog(input: AuditLogInput): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        userId: input.userId,
        action: input.action,
        details: (input.details ?? EMPTY_JSON_OBJECT) as Prisma.InputJsonValue,
        ipAddress: input.ipAddress,
        userAgent: input.userAgent,
        metadata: (input.metadata ?? EMPTY_JSON_OBJECT) as Prisma.InputJsonValue,
      },
    });

    logger.info({
      action: input.action,
      userId: input.userId,
      ipAddress: input.ipAddress,
    });
  } catch (error) {
    logger.error({
      message: "Failed to create audit log",
      action: input.action,
      userId: input.userId,
      error,
    });
  }
}

export async function getAuditLogs(
  userId?: string,
  action?: AuditAction,
  limit = 100
): Promise<AuditLog[]> {
  return prisma.auditLog.findMany({
    where: {
      ...(userId && { userId }),
      ...(action && { action }),
    },
    take: normalizeAuditLimit(limit),
    orderBy: { createdAt: "desc" },
  });
}

export async function getRecentUserActivity(
  userId: string,
  hours = 24
): Promise<AuditLog[]> {
  const normalizedHours = Number.isFinite(hours) && hours > 0 ? hours : 24;
  const since = new Date(Date.now() - normalizedHours * 60 * 60 * 1000);
  return prisma.auditLog.findMany({
    where: {
      userId,
      createdAt: { gte: since },
    },
    orderBy: { createdAt: "desc" },
  });
}
