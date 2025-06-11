// next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // <-- THIS LINE IS CRUCIAL FOR STATIC EXPORT
  images: {
    unoptimized: true, // <-- THIS IS RECOMMENDED FOR STATIC EXPORT TO PREVENT IMAGE ERRORS
    domains: [
      'cdn.myanimelist.net', // For MyAnimeList images (anime covers, characters, people)
      'api.jikan.moe',       // Sometimes images might be served directly from here
      'placehold.co'          // For your fallback placeholder images
    ],
  },
};

export default nextConfig;