import { prisma } from "@/server/db";
import { createLogger } from "@/server/logger";
import type { Prisma } from "@prisma/client";

const logger = createLogger("audit");

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
  | "ESROW_CREATE"
  | "ESROW_RELEASE"
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

export async function createAuditLog(input: AuditLogInput): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        userId: input.userId,
        action: input.action,
        details: (input.details || {}) as Prisma.InputJsonValue,
        ipAddress: input.ipAddress,
        userAgent: input.userAgent,
        metadata: (input.metadata || {}) as Prisma.InputJsonValue,
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
      error: String(error),
    });
  }
}

export async function getAuditLogs(
  userId?: string,
  action?: AuditAction,
  limit = 100
): Promise<Awaited<ReturnType<typeof prisma.auditLog.findMany>>> {
  return prisma.auditLog.findMany({
    where: {
      ...(userId && { userId }),
      ...(action && { action }),
    },
    take: limit,
    orderBy: { createdAt: "desc" },
  });
}

export async function getRecentUserActivity(
  userId: string,
  hours = 24
): Promise<Awaited<ReturnType<typeof prisma.auditLog.findMany>>> {
  const since = new Date(Date.now() - hours * 60 * 60 * 1000);
  return prisma.auditLog.findMany({
    where: {
      userId,
      createdAt: { gte: since },
    },
    orderBy: { createdAt: "desc" },
  });
}
