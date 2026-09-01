/**
 * Server-only Prisma Client singleton.
 *
 * Prisma ORM 7 requires an explicit driver adapter for SQL providers (see
 * the prisma-upgrade-v7 skill) — `PrismaPg` wraps `pg` against
 * `DATABASE_URL`. Never import this from a Client Component (see CLAUDE.md
 * "do not access Prisma from Client Components") — only from Server
 * Components, route handlers, or server actions.
 *
 * The `globalThis` cache avoids exhausting the connection pool from
 * duplicate clients created by Next.js dev-mode hot reload.
 */
import { PrismaClient } from "@/lib/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
