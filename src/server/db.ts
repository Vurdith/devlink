import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = global as unknown as {
  prisma?: PrismaClient;
  prismaPool?: Pool;
};

const connectionString =
  process.env.NODE_ENV !== "production" && process.env.DIRECT_URL
    ? process.env.DIRECT_URL
    : process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("Missing DATABASE_URL (or DIRECT_URL) environment variable");
}

const isServerlessRuntime =
  process.env.VERCEL === "1" ||
  Boolean(process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.NETLIFY);

function positiveIntegerFromEnv(value: string | undefined, fallback: number): number {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function createPool() {
  const pool = new Pool({
    connectionString,
    max: positiveIntegerFromEnv(
      process.env.DATABASE_POOL_MAX,
      process.env.NODE_ENV === "production" && isServerlessRuntime ? 5 : 20
    ),
    idleTimeoutMillis: positiveIntegerFromEnv(process.env.DATABASE_POOL_IDLE_MS, 30000),
    connectionTimeoutMillis: positiveIntegerFromEnv(process.env.DATABASE_POOL_TIMEOUT_MS, 5000),
    allowExitOnIdle: process.env.NODE_ENV !== "production",
  });

  pool.on("error", (err) => {
    console.error("PostgreSQL pool error:", err);
  });

  return pool;
}

function getPool() {
  if (process.env.NODE_ENV === "production") {
    return createPool();
  }

  globalForPrisma.prismaPool ??= createPool();
  return globalForPrisma.prismaPool;
}

function createPrismaClient() {
  return new PrismaClient({
    log: ["error"],
    adapter: new PrismaPg(getPool()),
  });
}

export const prisma =
  globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
