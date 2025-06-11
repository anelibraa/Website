// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}', // For your /app directory components and pages
    './pages/**/*.{js,ts,jsx,tsx,mdx}', // If you're still using the /pages directory
    './components/**/*.{js,ts,jsx,tsx,mdx}', // For components directly under /components
    './src/**/*.{js,ts,jsx,tsx,mdx}', // A broad catch-all for anything in /src
  ],
  theme: {
    extend: {
      colors: {
        'primary-bg': '#0A0A0A',
        'secondary-bg': '#1A1A1A',
        'norime-text': '#8A2BE2',
        'highlight-color': '#9333ea',
        'accent-color': '#6B21A8',
        'text-light': '#E5E7EB',
        'text-dark': '#6B7280',
      },
    },
  },
  plugins: [],
};