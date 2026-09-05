/**
 * Browser-safe unique id for client-side, non-cryptographic tracking ids —
 * React `key`s, a toast's id, an in-flight upload's pending-placeholder id.
 * Never used for anything security-sensitive: a Storage object path is
 * always generated server-side, with Node's own `randomUUID()` from
 * `node:crypto` (see `lib/storage.ts`), which is unaffected by this and
 * intentionally left alone.
 *
 * `crypto.randomUUID()` only exists in a secure context (HTTPS, or
 * `localhost`) — this project's dev server is also reachable over plain
 * HTTP on a LAN IP (see `next.config.ts`'s `allowedDevOrigins`), where it's
 * `undefined` and throws "crypto.randomUUID is not a function".
 * `crypto.getRandomValues()` has no such restriction, so it's a safe
 * fallback — not `Math.random()`, which isn't a cryptographically-backed
 * random source. One shared helper, reused by every client-side call site
 * that needs one, rather than each reimplementing the same fallback.
 */
export function createClientId(): string {
  if (typeof globalThis.crypto?.randomUUID === "function") {
    return globalThis.crypto.randomUUID();
  }

  const bytes = new Uint8Array(16);
  globalThis.crypto.getRandomValues(bytes);

  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}
