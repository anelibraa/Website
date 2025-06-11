// app/components/SearchComponent.js
"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useSearchParams } from 'next/navigation'; // <-- NEW: Import useSearchParams

export default function SearchComponent() {
  const searchParams = useSearchParams(); // <-- NEW: Get URL search parameters
  const initialSearchQuery = searchParams.get('q') || ''; // <-- NEW: Read 'q' parameter from URL

  const [searchTerm, setSearchTerm] = useState(initialSearchQuery); // Initialize with URL query
  const [selectedGenres, setSelectedGenres] = useState([]); // Stores genre IDs
  const [availableGenres, setAvailableGenres] = useState([]); // Stores {id, name}
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasSearched, setHasSearched] = useState(false); // New state to track if a search has been performed

  // --- Fetch Available Genres on Component Mount ---
  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const response = await fetch("https://api.jikan.moe/v4/genres/anime");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (data && data.data) {
          setAvailableGenres(data.data);
        }
      } catch (err) {
        console.error("Error fetching genres:", err);
      }
    };
    fetchGenres();
  }, []);

  // --- Handle Search Logic ---
  const performSearch = useCallback(async () => {
    // Only perform search if there's a search term or selected genres
    if (!searchTerm.trim() && selectedGenres.length === 0) {
      setSearchResults([]);
      setLoading(false);
      setError(null);
      // setHasSearched(false); // Keep this false if no criteria
      return; // Don't search if no criteria
    }

    setLoading(true);
    setError(null); // Clear previous errors
    setHasSearched(true); // Mark that a search attempt has been made

    try {
      const params = new URLSearchParams();
      if (searchTerm.trim()) {
        params.append("q", searchTerm.trim());
      }
      if (selectedGenres.length > 0) {
        params.append("genres", selectedGenres.join(",")); // Jikan API expects comma-separated IDs
      }

      const queryString = params.toString();
      const url = `https://api.jikan.moe/v4/anime?${queryString}`;

      const response = await fetch(url);

      if (!response.ok) {
        if (response.status === 429) {
          setError("Too many requests. Please wait a moment before searching again.");
        } else {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      }

      const data = await response.json();
      if (data && data.data) {
        setSearchResults(data.data);
      } else {
        setSearchResults([]); // No results or unexpected data format
      }
    } catch (err) {
      console.error("Error searching anime:", err);
      setError("Failed to perform search. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, [searchTerm, selectedGenres]);

  // Debounce effect for search input and genre selection
  useEffect(() => {
    const handler = setTimeout(() => {
      // Only trigger if there's *actually* a search term or genres selected
      // and not just on initial render if no query from URL.
      if (searchTerm || selectedGenres.length > 0) {
        performSearch();
      }
    }, 500); // 500ms debounce

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm, selectedGenres, performSearch]);

  // Handle initial search when component mounts with a query from URL or if genres are initially selected
  useEffect(() => {
    // Only perform an initial search if there's an initial query or genres are selected
    if (initialSearchQuery || selectedGenres.length > 0) {
        performSearch();
    }
  }, [initialSearchQuery, selectedGenres.length]); // Added selectedGenres.length for re-trigger if genres change on mount

  const handleGenreChange = (event) => {
    const genreId = parseInt(event.target.value); // Convert to number
    if (event.target.checked) {
      setSelectedGenres((prev) => [...prev, genreId]);
    } else {
      setSelectedGenres((prev) => prev.filter((id) => id !== genreId));
    }
  };


  return (
    <div className="max-w-7xl mx-auto py-8">
      {/* Search Input (now primarily for direct use on this page) */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search anime by title..."
          className="w-full p-3 rounded-md bg-secondary-bg border border-accent-color text-text-light placeholder-text-dark focus:outline-none focus:ring-2 focus:ring-highlight-color"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Genre Filters */}
      <div className="mb-8 p-4 bg-secondary-bg rounded-lg shadow-md">
        <h3 className="text-xl font-semibold mb-3 text-text-light">Filter by Genres:</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-y-2 gap-x-4 max-h-60 overflow-y-auto custom-scrollbar pr-2">
          {availableGenres.length > 0 ? (
            availableGenres.map((genre) => (
              <label key={genre.mal_id} className="inline-flex items-center text-text-dark hover:text-text-light cursor-pointer">
                <input
                  type="checkbox"
                  value={genre.mal_id}
                  checked={selectedGenres.includes(genre.mal_id)}
                  onChange={handleGenreChange}
                  className="form-checkbox h-4 w-4 text-highlight-color rounded border-gray-300 focus:ring-highlight-color bg-primary-bg"
                />
                <span className="ml-2 text-sm">{genre.name}</span>
              </label>
            ))
          ) : (
            <p className="col-span-full text-text-dark">Loading genres...</p>
          )}
        </div>
      </div>

      {/* Search Results Display */}
      {loading && <p className="text-center text-text-dark text-lg">Searching...</p>}
      {error && <p className="text-center text-highlight-color text-lg">{error}</p>}

      {!loading && !error && hasSearched && searchResults.length === 0 && (
        <p className="text-center text-text-dark text-lg mt-8">No anime found matching your criteria.</p>
      )}
      {/* Show initial guidance only if no search has been performed and no query/genres are set */}
      {!loading && !error && !hasSearched && !searchTerm && selectedGenres.length === 0 && (
        <p className="text-center text-text-dark text-lg mt-8">Start typing or select genres to find anime.</p>
      )}


      {!loading && !error && searchResults.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-8">
          {searchResults.map((anime) => (
            <Link
              key={anime.mal_id}
              href={`/anime/${anime.mal_id}`} // Adjust this route if needed for single anime page
              className="flex-none rounded-lg shadow-md overflow-hidden bg-secondary-bg hover:bg-accent-color transition transform hover:scale-[1.02] block"
            >
              <img
                src={anime.images?.jpg?.large_image_url || "https://placehold.co/192x224/16213E/E0E0E0?text=No+Image"}
                alt={anime.title || "Untitled"}
                className="w-full h-56 object-cover rounded-t-lg"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://placehold.co/192x224/16213E/E0E0E0?text=No+Image";
                }}
              />
              <div className="p-3">
                <h3 className="text-md font-semibold mb-1 text-text-light line-clamp-2">
                  {anime.title || "Untitled"}
                </h3>
                <p className="text-xs text-text-dark">
                  {anime.aired?.prop?.from?.year || 'N/A'}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}