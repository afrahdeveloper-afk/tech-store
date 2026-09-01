import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
   allowedDevOrigins: ['192.168.68.109'],
  // Pin the workspace root: a stray package.json/package-lock.json exists at
  // C:\Users\HP (an unrelated leftover, not a real project — see the home
  // CLAUDE.md) which Turbopack would otherwise try to infer as the root.
  turbopack: {
    root: path.join(__dirname),
  },
};

export default nextConfig;
