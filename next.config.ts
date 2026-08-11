import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  compress: true,
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "react-toastify",
      "chart.js",
      "@tanstack/react-table",
    ],
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
