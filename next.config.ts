import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { hostname: "img.clerk.com" },
      // Supabase Storage 이미지 도메인
      { hostname: "*.supabase.co" },
      { hostname: "supabase.co" },
    ],
  },
};

export default nextConfig;
