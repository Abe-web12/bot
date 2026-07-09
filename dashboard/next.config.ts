import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  output: "standalone",
  // Suppress Turbopack workspace root warning when using monorepo
  turbopack: { root: __dirname },
}

export default nextConfig
