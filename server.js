/**
 * cPanel / Passenger deployment entry point.
 *
 * cPanel's "Setup Node.js App" (Phusion Passenger) expects a single startup
 * file it can `require()` directly — it doesn't know how to run the `next
 * start` CLI itself. This wraps Next.js's own documented custom-server API
 * (`next(...)` + `app.getRequestHandler()`) in a plain `http` server, which
 * still runs Next's full request pipeline — including `proxy.ts` — exactly
 * the same as `next start` would. Not used in local dev or in the Vercel/
 * Railway/Render path (those run `next dev`/`next start` directly); this
 * file exists only for cPanel-style hosts that require one.
 *
 * Passenger sets `PORT` (and normally `NODE_ENV=production`) itself — this
 * only falls back to 3000 for a manual `node server.js` run outside Passenger.
 */
/* eslint-disable @typescript-eslint/no-require-imports -- Passenger executes
   this file directly with plain Node (CommonJS), not through this project's
   TypeScript/ESM tooling, so `require()` is the correct, portable choice here. */
const { createServer } = require("node:http");
const next = require("next");

const port = Number(process.env.PORT) || 3000;
const app = next({ dev: process.env.NODE_ENV !== "production" });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer((req, res) => {
    handle(req, res);
  }).listen(port, () => {
    console.log(`> Ready on port ${port}`);
  });
});
