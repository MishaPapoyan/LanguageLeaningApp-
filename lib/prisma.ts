import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

function dbUrl() {
  const url = process.env.DATABASE_URL ?? "";
  if (url.includes("connection_limit")) return url;
  return url + (url.includes("?") ? "&" : "?") + "connection_limit=1&pool_timeout=20";
}

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    datasources: { db: { url: dbUrl() } },
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
