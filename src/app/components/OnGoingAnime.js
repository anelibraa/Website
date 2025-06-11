// app/components/OngoingAnime.js (formerly PopularManga.js)
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function OngoingAnime() {
  const [animeList, setAnimeList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchOngoingAnime = async () => {
      setLoading(true);
      setError(false);
      try {
        const response = await fetch("https://api.jikan.moe/v4/top/anime?filter=airing&limit=10");

        if (!response.ok) {
          if (response.status === 429) {
            console.warn("Jikan API rate limit hit for Ongoing Anime. Please wait a moment and refresh.");
            setError(true);
            return;
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data && data.data) {
          setAnimeList(data.data);
        } else {
          console.error("Failed to fetch ongoing anime data from Jikan:", data);
          setAnimeList([]);
          setError(true);
        }
      } catch (err) {
        console.error("Error fetching ongoing anime from Jikan:", err);
        setAnimeList([]);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(() => {
      fetchOngoingAnime();
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="mb-8 mt-12">
      <h2 className="text-2xl font-bold mb-4 text-text-light">Ongoing Anime</h2>
      {loading ? (
        <p className="text-text-dark text-center py-8">
          Loading ongoing anime...
        </p>
      ) : error ? (
        // Uses new highlight color for error messages
        <p className="text-highlight-color text-center py-8">
          Failed to load ongoing anime. (Rate limit? Please wait a moment and refresh.)
        </p>
      ) : animeList.length === 0 ? (
        <p className="text-text-dark text-center py-8">
          No ongoing anime available.
        </p>
      ) : (
        <div className="flex space-x-4 overflow-x-auto pb-4 custom-scrollbar">
          {animeList.map((anime, index) => { // Added 'index' to the map callback
            const title = anime.title || "Untitled";
            const coverImage = anime.images?.jpg?.large_image_url;
            const year = anime.aired?.prop?.from?.year || 'N/A';

            return (
              <Link
                key={`${anime.mal_id}-${index}`} // <--- **FIX IS HERE: Combined mal_id with index for unique key**
                href={`/read/${anime.mal_id}`}
                // Card hover now uses new accent-color
                className="flex-none w-40 sm:w-48 rounded-lg shadow-md overflow-hidden bg-secondary-bg hover:bg-accent-color transition transform hover:scale-[1.02]"
              >
                <img
                  src={coverImage}
                  alt={title}
                  className="w-full h-56 object-cover rounded-t-lg"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://placehold.co/192x224/16213E/E0E0E0?text=No+Image";
                  }}
                />
                <div className="p-3">
                  <h3 className="text-md font-semibold mb-1 text-text-light line-clamp-2">
                    {title}
                  </h3>
                  <p className="text-xs text-text-dark">
                    {year}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}