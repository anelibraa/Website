// app/search/page.js
"use client"; // This component needs client-side interactivity

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [genres, setGenres] = useState([]); // Stores all available genres (name, ID)
  const [selectedGenreIds, setSelectedGenreIds] = useState([]); // Stores IDs of genres user has selected
  const [animeResults, setAnimeResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [page, setPage] = useState(1); // Current page for pagination
  const [hasMore, setHasMore] = useState(true); // True if there are more pages to load

  // --- 1. Fetch available genres once when the page loads ---
  useEffect(() => {
    console.log("[SearchPage] useEffect: Fetching genres...");
    const fetchGenres = async () => {
      try {
        const response = await fetch("https://api.jikan.moe/v4/genres/anime");
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        setGenres(data.data); // Store the list of genres
        console.log("[SearchPage] Genres fetched successfully.");
      } catch (err) {
        console.error("[SearchPage] Error fetching genres:", err);
      }
    };
    fetchGenres();
  }, []); // Empty dependency array means this runs only once on mount

  // --- 2. Main search function, memoized with useCallback ---
  const executeSearch = useCallback(async (currentPage) => {
    // Log the actual values to ensure they are correct before constructing URL
    console.log(`[SearchPage] executeSearch called. Page: ${currentPage}, Query: "${searchQuery}", Genres: [${selectedGenreIds.join(",")}]`);

    setLoading(true);
    setError(false);

    const genreParam = selectedGenreIds.length > 0 ? `&genres=${selectedGenreIds.join(",")}` : "";
    const qParam = searchQuery.trim() ? `&q=${encodeURIComponent(searchQuery.trim())}` : "";

    // Prevent API call if no search query and no genres selected for the first page
    if (!qParam && !genreParam && currentPage === 1) {
      console.log("[SearchPage] No search criteria on page 1. Skipping API call.");
      setAnimeResults([]);
      setLoading(false);
      setHasMore(false);
      return;
    }

    try {
      const apiUrl = `https://api.jikan.moe/v4/anime?${qParam}${genreParam}&page=${currentPage}`;
      console.log("[SearchPage] Fetching from API:", apiUrl);
      const response = await fetch(apiUrl);

      console.log("[SearchPage] API Response Status:", response.status);

      if (!response.ok) {
        if (response.status === 429) {
          console.warn("[SearchPage] Jikan API rate limit hit! Please wait a moment and try again.");
          setError(true);
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("[SearchPage] API Data received:", data);

      if (data && data.data) {
        setAnimeResults((prevResults) =>
          currentPage === 1 ? data.data : [...prevResults, ...data.data] // Replace for page 1, append for others
        );
        setHasMore(data.pagination.has_next_page);
        console.log(`[SearchPage] Anime results updated. Total items: ${data.data.length}. Has More: ${data.pagination.has_next_page}`);
      } else {
        console.log("[SearchPage] No data.data found in API response or data is empty.");
        setAnimeResults(currentPage === 1 ? [] : animeResults); // Clear if no results on first page, keep old otherwise
        setHasMore(false);
      }
    } catch (err) {
      console.error("[SearchPage] Error during API fetch:", err);
      setError(true);
      setHasMore(false);
    } finally {
      setLoading(false);
      console.log("[SearchPage] Search execution finished.");
    }
  }, [searchQuery, selectedGenreIds]); // executeSearch changes when query or selected genres change

  // --- 3. Effect to trigger search on query/genre change (debounced) ---
  useEffect(() => {
    // Log the current state values accurately for debugging
    console.log(`[SearchPage] useEffect: Query/Genre change detected. currentQuery: "${searchQuery}", currentGenres: [${selectedGenreIds.join(",")}]`);

    setPage(1); // Reset page to 1 for new search/filter

    const debounceTimer = setTimeout(() => {
      console.log("[SearchPage] Debounce finished. Calling executeSearch(1).");
      executeSearch(1); // Execute search for the first page
    }, 500);

    return () => {
      clearTimeout(debounceTimer);
      console.log("[SearchPage] Debounce timer cleared.");
    };
  }, [searchQuery, selectedGenreIds, executeSearch]); // Re-run when query or genres change

  // --- 4. Effect to trigger search when page changes (for "Load More") ---
  useEffect(() => {
    console.log(`[SearchPage] useEffect: Page change detected. Current page: ${page}`);
    if (page > 1) { // Only fetch if page has incremented for "Load More"
      executeSearch(page);
    }
  }, [page, executeSearch]);

  // --- Handlers ---
  const handleSearchInputChange = (e) => {
    console.log("[SearchPage] Search input changed:", e.target.value);
    setSearchQuery(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    console.log("[SearchPage] Search button clicked/form submitted.");
    // The useEffect listening to searchQuery changes will handle triggering the search
  };

  const handleGenreChange = (genreId) => {
    setSelectedGenreIds((prevSelected) => {
      const newSelected = prevSelected.includes(genreId)
        ? prevSelected.filter((id) => id !== genreId)
        : [...prevSelected, genreId];
      console.log(`[SearchPage] Genre changed. New selected genres: [${newSelected.join(",")}]`);
      return newSelected;
    });
  };

  const handleLoadMore = () => {
    console.log("[SearchPage] Load More button clicked.");
    if (!loading && hasMore) {
      setPage((prevPage) => prevPage + 1);
    }
  };

  // --- Message Display Logic ---
  let message = null;
  if (loading && animeResults.length === 0) {
    message = <p className="text-text-dark text-center py-8 text-lg">Loading anime results...</p>;
  } else if (error) {
    message = <p className="text-highlight-color text-center py-8 text-lg">Failed to load search results. (API rate limit? Try refreshing!)</p>;
  } else if (animeResults.length === 0) {
    if (searchQuery.trim() || selectedGenreIds.length > 0) {
      // No results found after a search attempt
      message = <p className="text-text-dark text-center py-8 text-lg">No anime found matching your criteria. Try a different search!</p>;
    } else {
      // Initial state with no search criteria yet
      message = <p className="text-text-dark text-center py-8 text-lg">Start typing in the search bar or select genres to find anime!</p>;
    }
  }

  return (
    <main className="min-h-screen bg-primary-bg text-text-light p-4 md:p-8 lg:p-12">
      <div className="max-w-7xl mx-auto">
        {/* Back to Home Button */}
        <div className="mb-8 text-center md:text-left">
          <Link
            href="/"
            className="inline-block bg-highlight-color text-white font-semibold py-2 px-6 rounded-md hover:bg-purple-500 transition duration-300 shadow-lg text-lg"
          >
            &larr; Back to Home
          </Link>
        </div>

        <h1 className="text-3xl md:text-4xl font-bold mb-8 text-highlight-color text-center">
          Search Anime
        </h1>

        {/* Search Bar Section */}
        <form onSubmit={handleSearchSubmit} className="flex justify-center flex-wrap gap-4 mb-8">
          <input
            type="text"
            placeholder="Search anime by title..."
            className="w-full max-w-md bg-secondary-bg text-text-light border border-accent-color rounded-full py-3 px-6 focus:outline-none focus:ring-2 focus:ring-highlight-color text-lg"
            value={searchQuery}
            onChange={handleSearchInputChange}
          />
          <button
            type="submit"
            className="bg-highlight-color text-white font-semibold py-3 px-8 rounded-full hover:bg-purple-500 transition duration-300 shadow-lg text-lg"
          >
            Search
          </button>
        </form>

        {/* Genre Filters Section */}
        <div className="mb-12 p-4 bg-secondary-bg rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4 text-text-light text-center">Filter by Genre</h2>
          <div className="flex flex-wrap justify-center gap-2 max-h-60 overflow-y-auto custom-scrollbar p-2 rounded-lg border border-secondary-bg">
            {genres.length === 0 ? (
              <p className="text-text-dark">Loading genres...</p>
            ) : (
              genres.map((genre) => (
                <label key={genre.mal_id} className="inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    value={genre.mal_id}
                    checked={selectedGenreIds.includes(genre.mal_id)}
                    onChange={() => handleGenreChange(genre.mal_id)}
                    className="form-checkbox h-5 w-5 text-highlight-color rounded border-gray-300 focus:ring-highlight-color"
                  />
                  <span className="ml-2 text-text-dark text-sm whitespace-nowrap">
                    {genre.name}
                  </span>
                </label>
              ))
            )}
          </div>
        </div>

        {/* Search Results Display */}
        <section>
          {message || ( // If message exists, display it, otherwise display the results grid
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
                {animeResults.map((anime) => {
                  const title = anime.title || "Untitled";
                  const coverImage = anime.images?.jpg?.large_image_url;
                  const year = anime.aired?.prop?.from?.year || 'N/A';

                  return (
                    <Link
                      key={anime.mal_id}
                      href={`/anime/${anime.mal_id}`} // Link to the new anime detail page
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

              {/* Load More Button */}
              {hasMore && (
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
 
              {!hasMore && animeResults.length > 0 && (
                <p className="text-text-dark text-center py-8">
                  You've reached the end of the search results!
                </p>
              )}
            </>
          )}
        </section>
      </div>
    </main>
  );
}