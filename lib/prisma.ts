import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

function buildDatabaseUrl() {
  const url = process.env.DATABASE_URL ?? "";
  const sep = url.includes("?") ? "&" : "?";
  // pgbouncer=true disables prepared statements (required for PgBouncer)
  // connection_limit=1 prevents exhausting Session-mode pool slots
  const params = "pgbouncer=true&connection_limit=1&pool_timeout=20";
  return url.includes("pgbouncer=true") ? url : `${url}${sep}${params}`;
}

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    datasources: { db: { url: buildDatabaseUrl() } },
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
