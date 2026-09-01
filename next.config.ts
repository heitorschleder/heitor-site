import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Nothing under content/ may become a route by accident.
  pageExtensions: ['ts', 'tsx'],
};

export default nextConfig;
