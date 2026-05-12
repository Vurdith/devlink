import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { prisma } from "@/server/db";

const globalForReadPrisma = global as unknown as {
  prismaRead?: PrismaClient;
  prismaReadPool?: Pool;
};

const readConnectionString = process.env.READ_DATABASE_URL;

const isServerlessRuntime =
  process.env.VERCEL === "1" ||
  Boolean(process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.NETLIFY);

function positiveIntegerFromEnv(value: string | undefined, fallback: number): number {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function createReadPool(connectionString: string) {
  const readPool = new Pool({
    connectionString,
    max: positiveIntegerFromEnv(
      process.env.READ_DATABASE_POOL_MAX,
      process.env.NODE_ENV === "production" && isServerlessRuntime ? 5 : 10
    ),
    idleTimeoutMillis: positiveIntegerFromEnv(process.env.READ_DATABASE_POOL_IDLE_MS, 30000),
    connectionTimeoutMillis: positiveIntegerFromEnv(process.env.READ_DATABASE_POOL_TIMEOUT_MS, 5000),
    allowExitOnIdle: process.env.NODE_ENV !== "production",
  });

  readPool.on("error", (err) => {
    console.error("Read replica pool error:", err);
  });

  return readPool;
}

function getReadPool(connectionString: string) {
  if (process.env.NODE_ENV === "production") {
    return createReadPool(connectionString);
  }

  globalForReadPrisma.prismaReadPool ??= createReadPool(connectionString);
  return globalForReadPrisma.prismaReadPool;
}

function createReadPrismaClient(connectionString: string) {
  return new PrismaClient({
    log: ["error"],
    adapter: new PrismaPg(getReadPool(connectionString)),
  });
}

let prismaReadInstance: PrismaClient;

if (readConnectionString) {
  prismaReadInstance =
    globalForReadPrisma.prismaRead ??
    createReadPrismaClient(readConnectionString);
} else {
  prismaReadInstance = prisma;
}

export const prismaRead = prismaReadInstance;

if (process.env.NODE_ENV !== "production") {
  globalForReadPrisma.prismaRead = prismaRead;
}
