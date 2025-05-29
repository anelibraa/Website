// app/read/[id]/page.js
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

// Define the base URL for your preferred external manga reading site
const EXTERNAL_READ_MANGA_BASE_URL = "https://mangataro.net/home";

export default function MangaDetail() {
  const params = useParams();
  const router = useRouter();
  const mangaId = params.id; // This will be the AniList ID passed from the URL
  const [manga, setManga] = useState(null);

  useEffect(() => {
    if (!mangaId) return;

    const query = `
      query ($id: Int) {
        Media(id: $id, type: MANGA) {
          id
          title {
            english
            romaji
          }
          coverImage {
            large
          }
          description(asHtml: false)
          siteUrl
        }
      }
    `;

    fetch("https://graphql.anilist.co", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, variables: { id: parseInt(mangaId) } }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data && data.data && data.data.Media) {
          setManga(data.data.Media);
        } else {
          console.error("Failed to fetch manga details:", data);
          setManga(null);
        }
      })
      .catch((error) => {
        console.error("Error fetching manga details:", error);
        setManga(null);
      });
  }, [mangaId]);

  // Function to clean the description by removing unwanted text
  const cleanDescription = (description) => {
    if (!description) return "No description available.";

    let cleanedText = description;

    // Remove "(Source: Viz Media)" and surrounding <br> tags
    cleanedText = cleanedText.replace(/<br\s*\/?>\s*<br\s*\/?>\s*\(Source: Viz Media\)/g, '');
    cleanedText = cleanedText.replace(/\(Source: Viz Media\)/g, '');

    // Remove the entire "Notes:" section and its content
    cleanedText = cleanedText.replace(/<br\s*\/?>\s*<br\s*\/?>\s*<i>Notes:[\s\S]*<\/i>/gi, '');
    cleanedText = cleanedText.replace(/Notes:[\s\S]*/gi, '');

    return cleanedText.trim();
  };

  // Function to navigate back to the homepage
  const handleBackToHome = () => {
    router.push('/');
  };

  // Function to open the external manga reading site
  const handleReadManga = () => {
    window.open(EXTERNAL_READ_MANGA_BASE_URL, '_blank');
  };

  if (!manga) {
    return (
      <div className="bg-gray-900 min-h-screen flex justify-center items-center text-white">
        Loading manga details...
      </div>
    );
  }

  const displayDescription = cleanDescription(manga.description);

  return (
    <main className="bg-gray-900 min-h-screen p-6 text-white max-w-4xl mx-auto">
      {/* Back Button */}
      <button
        onClick={handleBackToHome}
        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md transition duration-300 shadow-md mb-8 flex items-center space-x-2"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
        <span>Back to Home</span>
      </button>

      {/* Manga Title */}
      <h1 className="text-4xl font-bold mb-6">
        {manga.title.english || manga.title.romaji}
      </h1>

      {/* Manga Details Section */}
      <div className="flex flex-col md:flex-row gap-6 bg-gray-800 p-6 rounded-lg shadow-lg">
        {/* Manga Cover Image */}
        <img
          src={manga.coverImage.large}
          alt={manga.title.english || manga.title.romaji}
          className="rounded-lg shadow-lg md:w-1/3 object-cover w-full h-auto max-h-[400px]"
          onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/300x400/333/FFF?text=No+Image"; }}
        />

        {/* Manga Description and Read Manga Link */}
        <div className="md:w-2/3 flex flex-col justify-between">
          <p className="mb-6 whitespace-pre-line text-gray-300">
            {displayDescription}
          </p>

          <button
            onClick={handleReadManga}
            className="inline-block bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-md transition duration-300 font-semibold text-center mt-auto"
          >
            Read Manga Now!
          </button>
        </div>
      </div>
    </main>
  );
}