/* eslint-disable @typescript-eslint/no-require-imports -- plain Node script,
   meant to be run directly (e.g. via cPanel's "Run JS Script"), not through
   this project's TypeScript/ESM tooling. */

/**
 * cPanel deployment helper: runs `npm run build` as a real child process
 * with its output streamed through, for hosts (like cPanel's Node.js App
 * "Run JS Script" button) that can execute a JS file but don't otherwise
 * expose a way to run an arbitrary npm script or a shell command. Not used
 * by any other deployment path (Vercel/Railway/CI all just run
 * `npm run build` directly) — this exists only for that one constraint.
 */
const { execSync } = require("node:child_process");

try {
  execSync("npm run build", { stdio: "inherit", cwd: __dirname });
  console.log("\n=== BUILD SUCCEEDED ===");
} catch (err) {
  console.error("\n=== BUILD FAILED ===");
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
}
