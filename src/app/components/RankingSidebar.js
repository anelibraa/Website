// app/components/RankingSidebar.js
"use client";

import { useEffect, useState } from "react";

export default function RankingSidebar() {
  const [topManga, setTopManga] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Disable background scroll when modal is open
  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [showModal]);

  // Fetch top manga from Jikan API
  useEffect(() => {
    const fetchTopManga = async () => {
      setLoading(true);
      setError(false);
      try {
        // Jikan API endpoint for top manga, sorted by score
        // 'filter=bypopularity' is used to get popular manga
        // For score, Jikan's /top/manga endpoint already returns by score by default.
        const response = await fetch("https://api.jikan.moe/v4/top/manga?limit=10");

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data && data.data) {
          setTopManga(data.data);
        } else {
          console.error("Failed to fetch top manga data from Jikan:", data);
          setTopManga([]);
          setError(true);
        }
      } catch (err) {
        console.error("Error fetching top manga from Jikan:", err);
        setTopManga([]);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchTopManga();
  }, []); // Empty dependency array means this effect runs once on mount

  return (
    <div className="p-4">
      <button
        onClick={() => setShowModal(true)}
        className="text-white text-base px-4 py-2 rounded-md transition hover:bg-gray-700 bg-gray-800"
      >
        See Leaderboard
      </button>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-60 flex items-center justify-center">
          <div className="bg-gray-900 p-6 rounded-lg max-w-md w-full max-h-[80vh] overflow-y-auto shadow-lg relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-2 right-3 text-gray-400 hover:text-white text-xl"
            >
              ✕
            </button>

            <h2 className="text-xl font-bold text-white mb-4">Top Manga</h2>

            {loading ? (
              <p className="text-gray-400 text-center py-4">
                Loading rankings...
              </p>
            ) : error ? (
              <p className="text-red-400 text-center py-4">
                Failed to load rankings. Please try again later.
              </p>
            ) : topManga.length === 0 ? (
              <p className="text-gray-400 text-center py-4">
                No top manga available.
              </p>
            ) : (
              <ul className="space-y-4">
                {topManga.map((manga, index) => (
                  <li
                    key={manga.mal_id} // Use Jikan's mal_id as the key
                    className="flex items-center space-x-3 hover:bg-gray-700 p-2 rounded-md transition"
                  >
                    <span className="text-xl font-bold text-blue-400">
                      {index + 1}.
                    </span>
                    <img
                      src={manga.images?.jpg?.small_image_url} // Use Jikan's small image URL
                      alt={manga.title}
                      className="w-12 h-16 object-cover rounded-md shadow-sm"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src =
                          "https://placehold.co/48x64/333/FFF?text=No+Image";
                      }}
                    />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-white break-words">
                        {manga.title}
                      </p>
                      {manga.score && ( // Jikan uses 'score' for average score
                        <p className="text-xs text-gray-400">
                          Score: {manga.score}%
                        </p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
