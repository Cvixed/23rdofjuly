import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/dashboard/mood',
        destination: '/dashboard?tab=mood',
        permanent: true,
      },
      {
        source: '/dashboard/study',
        destination: '/dashboard?tab=study',
        permanent: true,
      },
      {
        source: '/dashboard/chat',
        destination: '/dashboard?tab=chat',
        permanent: true,
      },
    ]
  },
};

export default nextConfig;
