// import type { NextConfig } from "next";

// const nextConfig: NextConfig = {
//   /* config options here */
// };

// export default nextConfig;

import type { NextConfig } from 'next'; // Import the NextConfig type

const nextConfig: NextConfig = { // Apply the type directly
  images: {
    domains: [
      'cdn.sanity.io',
      'placehold.co',
      // Add your specific Supabase project reference here:
      // 'abcdefg12345.supabase.co' (replace with your actual project ref)
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
      },
      {
        protocol: 'https',
        hostname: 'm.media-amazon.com',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
    ],
  },
};

export default nextConfig; // Use export default syntax
