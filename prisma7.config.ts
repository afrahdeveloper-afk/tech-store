// Prisma ORM 7 CLI configuration — replaces the old implicit .env + schema
// setup (see prisma-upgrade-v7 skill: "Config and Env"). Consumed only by
// the `prisma` CLI (validate/generate/migrate/db seed), never by the app
// itself — the app reads DATABASE_URL directly (see lib/db.ts).
import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  // Note: `directUrl` isn't part of this installed Prisma version's (7.10.0)
  // config type — DATABASE_URL and DIRECT_URL currently point at the same
  // connection anyway (see .env.example). If a real pooled/direct split is
  // reintroduced later, this needs a Prisma version that types `directUrl`.
  datasource: {
    url: env("DATABASE_URL"),
  },
});
