import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Optimize barrel file imports for faster builds and smaller bundles (rule 2.1)
  experimental: {
    optimizePackageImports: ['lucide-react', '@base-ui/react'],
  },
};

export default nextConfig;
