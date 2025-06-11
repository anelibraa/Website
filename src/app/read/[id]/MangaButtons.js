// src/app/read/[id]/MangaButtons.js
"use client"; // This component is a Client Component

import { useRouter } from "next/navigation"; // Only needed for router.push if used here
import Link from "next/link"; // For Next.js Link component

// Define the base URL (can be imported or passed as prop if needed)
const EXTERNAL_READ_MANGA_BASE_URL = "https://mangataro.net/";

export default function MangaButtons() {
  const router = useRouter(); // If you use router.push for the "Back to Home"

  const handleReadManga = () => {
    window.open(EXTERNAL_READ_MANGA_BASE_URL, "_blank");
  };

  // Note: If "Back to Home" always goes to "/", a simple <Link href="/"> is better
  // than a button with router.push for static export, but for consistency with
  // your original code, we'll keep it here for now.
  const handleBackToHome = () => {
    router.push("/");
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <button
        onClick={handleReadManga}
        className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300 shadow-lg text-lg flex items-center justify-center"
      >
        <svg
          className="w-6 h-6 mr-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          ></path>
        </svg>
        Read Manga
      </button>
      <button
        onClick={handleBackToHome}
        className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300 shadow-lg text-lg flex items-center justify-center"
      >
        <svg
          className="w-6 h-6 mr-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M10 19l-7-7m0 0l7-7m-7 7h18"
          ></path>
        </svg>
        Back to Home
      </button>
    </div>
  );
}