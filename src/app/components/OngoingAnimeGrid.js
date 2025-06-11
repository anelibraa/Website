// app/components/OngoingAnimeGrid.js
"use client";

import { useEffect, useState, useCallback } from "react"; // Import useCallback
import Link from "next/link";
import Image from "next/image";

export default function OngoingAnimeGrid() {
  const [animeList, setAnimeList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [page, setPage] = useState(1); // New state for current page
  const [hasMore, setHasMore] = useState(true); // New state to check if there are more pages

  const fetchOngoingAnime = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      // Include the page parameter in the API call
      const response = await fetch(`https://api.jikan.moe/v4/seasons/now?page=${page}`);

      if (!response.ok) {
        if (response.status === 429) {
          console.warn("Jikan API rate limit hit for Ongoing Anime. Please wait a moment and refresh.");
          setError(true);
          setLoading(false); // Stop loading if rate limited
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data && data.data) {
        // Append new data to the existing list
        setAnimeList((prevList) => [...prevList, ...data.data]);
        // Check if there are more pages based on API response
        setHasMore(data.pagination.has_next_page);
      } else {
        console.error("Failed to fetch ongoing anime data from Jikan:", data);
        setError(true);
        setHasMore(false); // No more data if fetch failed
      }
    } catch (err) {
      console.error("Error fetching ongoing anime from Jikan:", err);
      setError(true);
      setHasMore(false); // No more data if error occurred
    } finally {
      setLoading(false);
    }
  }, [page]); // Re-run effect when 'page' changes

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchOngoingAnime();
    }, 1000); // Debounce API call slightly

    return () => clearTimeout(timer);
  }, [fetchOngoingAnime]); // Dependency array includes fetchOngoingAnime

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      setPage((prevPage) => prevPage + 1); // Increment page to load next set of anime
    }
  };

  return (
    <section className="mb-8 mt-12">
      {animeList.length === 0 && loading ? (
        <p className="text-text-dark text-center py-8">
          Loading ongoing anime...
        </p>
      ) : error ? (
        <p className="text-highlight-color text-center py-8">
          Failed to load ongoing anime. (Rate limit? Please wait a moment and refresh.)
        </p>
      ) : animeList.length === 0 ? (
        <p className="text-text-dark text-center py-8">
          No ongoing anime available.
        </p>
      ) : (
        <>
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

          {hasMore && ( // Only show button if there are more pages
            <div className="text-center mt-12">
              <button
                onClick={handleLoadMore}
                disabled={loading} // Disable button while loading
                className="bg-highlight-color text-white font-semibold py-3 px-8 rounded-full hover:bg-purple-500 transition duration-300 shadow-lg text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Loading more..." : "Load More"}
              </button>
            </div>
          )}

          {!hasMore && animeList.length > 0 && ( // Message when all anime are loaded
            <p className="text-text-dark text-center py-8">
              You've reached the end of the list!
            </p>
          )}
        </>
      )}
    </section>
  );
}