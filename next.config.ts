
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  output: 'export', // Add this line for static HTML export
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**',
      }
    ],
    // When outputting static HTML, next/image needs unoptimized: true
    // if you don't have a custom image loader or Netlify's image processing.
    // However, output: 'export' often handles this, or Netlify's build
    // process can optimize images. Let's start without it and add if needed.
    // unoptimized: true, 
  },
};

export default nextConfig;
