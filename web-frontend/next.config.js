// // // next.config.ts
// // import type { NextConfig } from 'next';

// // const nextConfig: NextConfig = {
// //   images: {
// //     // FIX: Add this block to allow SVGs, which is required by placehold.co
// //     dangerouslyAllowSVG: true,
// //     contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    
// //     remotePatterns: [
// //       { protocol: 'https', hostname: '*.supabase.co' },
// //       { protocol: 'https', hostname: 'cdn.sanity.io' },
// //       { protocol: 'https', hostname: 'm.media-amazon.com' },
// //       { protocol: 'https', hostname: 'placehold.co' },
// //        {
// //         protocol: 'https', hostname: 'lh3.googleusercontent.com', port: '',
// //         pathname: '/**',
// //       },
// //     ],
// //   },
// // };

// // module.exports = {
// //   images: {
// //     domains: ['cdn.sanity.io'],
// //   },
// // }


// // export default nextConfig;


// // next.config.ts
// import type { NextConfig } from 'next';

// const nextConfig: NextConfig = {
//   // Add this eslint block here
//   eslint: {
//     ignoreDuringBuilds: true,
//   },
//   images: {
//     // FIX: Add this block to allow SVGs, which is required by placehold.co
//     dangerouslyAllowSVG: true,
//     contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",

//     remotePatterns: [
//       { protocol: 'https', hostname: '*.supabase.co' },
//       { protocol: 'https', hostname: 'cdn.sanity.io' },
//       { protocol: 'https', hostname: 'm.media-amazon.com' },
//       { protocol: 'https', hostname: 'placehold.co' },
//       {
//         protocol: 'https', hostname: 'lh3.googleusercontent.com', port: '',
//         pathname: '/**',
//       },
//     ],
//   },
// };

// export default nextConfig;

// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Add this eslint block here
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    // FIX: Add this block to allow SVGs, which is required by placehold.co
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",

    remotePatterns: [
      { protocol: 'https', hostname: '*.supabase.co' },
      { protocol: 'https', hostname: 'cdn.sanity.io' },
      { protocol: 'https', hostname: 'm.media-amazon.com' },
      { protocol: 'https', hostname: 'placehold.co' },
      {
        protocol: 'https', 
        hostname: 'lh3.googleusercontent.com', 
        port: '',
        pathname: '/**',
      },
    ],
  },
};

module.exports = nextConfig;
