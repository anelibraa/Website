// app/layout.js
// Removed Geist font imports, as we're using Google Fonts via <link>
// import { Geist, Geist_Mono } from "next/font/google"; // REMOVE THIS LINE

import "./globals.css";

export const metadata = {
  title: "Norime - Your Anime & Manga Hub", // Updated title
  description: "Explore the world of anime and manga.", // Updated description
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Google Fonts via <link> tag */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Montserrat:wght@600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      {/* Removed font variables from body as fonts are now defined in globals.css body/h1-h6 rules */}
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
