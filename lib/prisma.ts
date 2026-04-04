import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

function dbUrl() {
  const url = process.env.DATABASE_URL ?? "";
  const params: string[] = [];
  if (!url.includes("connection_limit")) params.push("connection_limit=1");
  if (!url.includes("pgbouncer")) params.push("pgbouncer=true");
  if (!url.includes("pool_timeout")) params.push("pool_timeout=20");
  if (params.length === 0) return url;
  return url + (url.includes("?") ? "&" : "?") + params.join("&");
}

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    datasources: { db: { url: dbUrl() } },
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
