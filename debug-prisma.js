/* eslint-disable @typescript-eslint/no-require-imports -- plain Node script,
   meant to be run directly (e.g. via cPanel's "Run JS Script"), not through
   this project's TypeScript/ESM tooling. */

/**
 * One-off deployment diagnostic: `npm install`'s postinstall hook runs
 * `prisma generate` as a spawned child process, and npm's own debug log
 * only records that it failed (exit code), not what it actually printed —
 * the real error text never reaches any persisted log when triggered via
 * cPanel's "Run NPM Install" button (no interactive terminal to see it
 * live in). This runs the exact same command directly and writes its full
 * stdout+stderr to a plain text file next to it, so that output can be
 * read afterward via File Manager. Delete this file (and the log it
 * writes) once the real cause is found — not part of the app itself.
 */
const { execSync } = require("node:child_process");
const { writeFileSync } = require("node:fs");

let output = "";
try {
  output = execSync("npx prisma generate", { cwd: __dirname, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
  output += "\n=== EXIT CODE 0 (succeeded) ===\n";
} catch (err) {
  output += err.stdout ? err.stdout.toString() : "";
  output += err.stderr ? err.stderr.toString() : "";
  output += `\n=== EXIT CODE ${err.status} (failed) ===\n`;
}

writeFileSync(__dirname + "/prisma-generate-output.log", output, "utf8");
console.log("Wrote output to prisma-generate-output.log — open it via File Manager.");
