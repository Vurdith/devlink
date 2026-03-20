import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { prisma } from "@/server/db";

const globalForReadPrisma = global as unknown as { prismaRead?: PrismaClient };

const readConnectionString =
  process.env.NODE_ENV !== "production" && process.env.DIRECT_URL
    ? process.env.DIRECT_URL
    : process.env.READ_DATABASE_URL || process.env.DATABASE_URL;

let prismaReadInstance: PrismaClient;

if (readConnectionString) {
  const readPool = new Pool({
    connectionString: readConnectionString,
    max: 10,
    min: 1,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
    allowExitOnIdle: false,
  });

  readPool.on("error", (err) => {
    console.error("Read replica pool error:", err);
  });

  const readAdapter = new PrismaPg(readPool);
  prismaReadInstance =
    globalForReadPrisma.prismaRead ??
    new PrismaClient({
      log: ["error"],
      adapter: readAdapter,
    });
} else {
  prismaReadInstance = prisma;
}

export const prismaRead = prismaReadInstance;

if (process.env.NODE_ENV !== "production") {
  globalForReadPrisma.prismaRead = prismaRead;
}
