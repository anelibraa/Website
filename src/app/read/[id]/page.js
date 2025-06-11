// src/app/read/[id]/page.js
// This is now a Server Component, compatible with 'output: export'

// No "use client"; at the top for Server Components

import Link from "next/link"; // For navigation within your app
import Image from "next/image"; // For optimized image handling
import MangaButtons from "./MangaButtons"; // Import the new Client Component

// Note: EXTERNAL_READ_MANGA_BASE_URL is now only in MangaButtons.js

// generateStaticParams runs at build time to determine which static pages to generate.
export async function generateStaticParams() {
  let mangaIds = [];
  try {
    // --- IMPORTANT: Customize this section to fetch YOUR manga IDs ---
    // For rate limiting issues, consider reducing the limit here temporarily
    const response = await fetch('https://api.jikan.moe/v4/top/manga?limit=5', { // <-- Try a smaller limit here
      next: { revalidate: 3600 }
    });
    const data = await response.json();

    if (response.ok && data.data) {
      mangaIds = data.data.map((manga) => ({
        id: manga.mal_id.toString(),
      }));
    } else {
      console.error("Failed to fetch manga IDs for generateStaticParams:", data);
    }
  } catch (error) {
    console.error("Error in generateStaticParams for /read/[id]:", error);
  }

  return mangaIds;
}

// Your MangaDetail component (now a Server Component)
export default async function MangaDetail({ params }) {
  const mangaId = params.id;

  let manga = null;
  let error = false;
  let notFound = false;

  if (!mangaId) {
    notFound = true;
  } else {
    try {
      // Fetch manga details directly in the async component function
      const response = await fetch(`https://api.jikan.moe/v4/manga/${mangaId}/full`);

      if (!response.ok) {
        if (response.status === 404) {
          notFound = true;
        } else {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      }

      const data = await response.json();

      if (data && data.data) {
        manga = data.data;
      } else {
        notFound = true;
      }
    } catch (err) {
      console.error("Error fetching manga details from Jikan:", err);
      error = true;
    }
  }

  const cleanDescription = (description) => {
    if (!description) return "No description available.";
    return description.replace(/<br>|<i>|<\/i>|<b>|<\/b>|&mdash;/g, "");
  };

  // --- Render based on fetch results ---
  if (notFound) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white p-4">
        <p className="text-xl text-red-400 mb-4 text-center">
          Manga not found.
        </p>
        <Link
          href="/"
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md transition duration-300 shadow-md"
        >
          Back to Home
        </Link>
      </div>
    );
  }

  if (error || !manga) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white p-4">
        <p className="text-xl text-red-400 mb-4 text-center">
          Failed to load manga details. Please try again later.
        </p>
        <Link
          href="/"
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md transition duration-300 shadow-md"
        >
          Back to Home
        </Link>
      </div>
    );
  }

  const displayTitle = manga.title || "Untitled";
  const coverImageUrl = manga.images?.jpg?.large_image_url;
  const description = cleanDescription(manga.synopsis);

  return (
    <div className="flex flex-col items-center bg-gray-900 min-h-screen text-white p-4 sm:p-8">
      <div className="w-full max-w-4xl bg-gray-800 rounded-lg shadow-xl p-6 sm:p-8 mb-8">
        <div className="flex flex-col sm:flex-row gap-6">
          <div className="flex-shrink-0 sm:w-1/3">
            <Image
              src={coverImageUrl || "https://placehold.co/300x450/333/FFF?text=No+Image"}
              alt={displayTitle}
              width={300}
              height={450}
              className="w-full h-auto object-cover rounded-lg shadow-lg border-2 border-blue-500"
              priority={true}
            />
          </div>
          <div className="flex-grow sm:w-2/3">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-blue-400 mb-4">
              {displayTitle}
            </h1>
            <p className="text-gray-300 text-lg mb-6 leading-relaxed">
              {description}
            </p>
            {/* Use the new MangaButtons Client Component */}
            <MangaButtons />
          </div>
        </div>
      </div>
    </div>
  );
}