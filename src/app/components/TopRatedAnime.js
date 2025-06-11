// app/components/TopRatedAnime.js
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

export default function TopRatedAnime() {
  const [animeList, setAnimeList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchTopRatedAnime = async () => {
      setLoading(true);
      setError(false);
      try {
        // Jikan API endpoint for top-rated anime (default sort is by score)
        const response = await fetch("https://api.jikan.moe/v4/top/anime");

        if (!response.ok) {
          if (response.status === 429) {
            console.warn("Jikan API rate limit hit for Top Rated Anime. Please wait a moment and refresh.");
            setError(true);
            return;
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data && data.data) {
          setAnimeList(data.data);
        } else {
          console.error("Failed to fetch top rated anime data from Jikan:", data);
          setAnimeList([]);
          setError(true);
        }
      } catch (err) {
        console.error("Error fetching top rated anime from Jikan:", err);
        setAnimeList([]);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(() => {
      fetchTopRatedAnime();
    }, 1000); // Debounce API call slightly

    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="mb-8 mt-12">
      {loading ? (
        <p className="text-text-dark text-center py-8">
          Loading top rated anime...
        </p>
      ) : error ? (
        <p className="text-highlight-color text-center py-8">
          Failed to load top rated anime. (Rate limit? Please wait a moment and refresh.)
        </p>
      ) : animeList.length === 0 ? (
        <p className="text-text-dark text-center py-8">
          No top rated anime available.
        </p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
          {animeList.map((anime) => {
            const title = anime.title || "Untitled";
            const coverImage = anime.images?.jpg?.large_image_url;
            const year = anime.aired?.prop?.from?.year || 'N/A';

            return (
              <Link
                key={anime.mal_id}
                href={`/anime/${anime.mal_id}`}
                className="rounded-lg shadow-md overflow-hidden bg-secondary-bg hover:bg-accent-color transition transform hover:scale-[1.02] block group"
              >
                <div className="relative w-full h-48 sm:h-56">
                  <Image
                    src={coverImage || "https://placehold.co/192x224/16213E/E0E0E0?text=No+Image"}
                    alt={title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, (max-width: 1280px) 20vw, 16vw"
                    className="object-cover rounded-t-lg transition-transform duration-300 group-hover:scale-105"
                    priority={false}
                  />
                </div>
                <div className="p-3">
                  <h3 className="text-sm font-semibold mb-1 text-text-light line-clamp-2">
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