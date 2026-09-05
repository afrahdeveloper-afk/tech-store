// Prisma ORM 7 CLI configuration — replaces the old implicit .env + schema
// setup (see prisma-upgrade-v7 skill: "Config and Env"). Consumed only by
// the `prisma` CLI (validate/generate/migrate/db seed) — the app itself
// reads DATABASE_URL directly (see lib/db.ts), a deliberately different
// variable from this file's own datasource.url as of the Database Role
// Hardening plan below.
import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  // Database Role Hardening (Sept 2026): CLI operations (migrate/db
  // seed/studio/pull) need full DDL rights — including `migrate dev`'s
  // shadow-database creation, which needs CREATEDB — so this stays on the
  // privileged `postgres` role via DIRECT_URL, deliberately decoupled from
  // DATABASE_URL, which lib/db.ts (app runtime only) uses under a
  // least-privilege runtime role once that role exists. `directUrl` still
  // isn't part of this installed Prisma version's (7.10.0) config type, so
  // this reads DIRECT_URL directly as the one datasource url rather than
  // using a dedicated field — see .env.example for both variables.
  datasource: {
    url: env("DIRECT_URL"),
  },
});
