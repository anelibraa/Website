"use client";

import { useEffect, useState } from "react";

export default function RankingSidebar() {
  const [topManga, setTopManga] = useState([]);
  const [showModal, setShowModal] = useState(false);

  // Disable background scroll when modal is open
  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [showModal]);

  // Fetch top manga
  useEffect(() => {
    const query = `
      query {
        Page(perPage: 10) {
          media(type: MANGA, sort: SCORE_DESC) {
            id
            title {
              romaji
              english
            }
            coverImage {
              medium
            }
            averageScore
          }
        }
      }
    `;

    fetch("https://graphql.anilist.co", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
    })
      .then((res) => res.json())
      .then((data) => {
        setTopManga(data?.data?.Page?.media || []);
      })
      .catch((error) => {
        console.error("Error fetching top manga:", error);
        setTopManga([]);
      });
  }, []);

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

            {topManga.length === 0 ? (
              <p className="text-gray-400 text-center py-4">
                Loading rankings or no data available...
              </p>
            ) : (
              <ul className="space-y-4">
                {topManga.map((manga, index) => (
                  <li
                    key={manga.id}
                    className="flex items-center space-x-3 hover:bg-gray-700 p-2 rounded-md transition"
                  >
                    <span className="text-xl font-bold text-blue-400">
                      {index + 1}.
                    </span>
                    <img
                      src={manga.coverImage.medium}
                      alt={manga.title.english || manga.title.romaji}
                      className="w-12 h-16 object-cover rounded-md shadow-sm"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src =
                          "https://placehold.co/48x64/333/FFF?text=No+Image";
                      }}
                    />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-white break-words">
                        {manga.title.english || manga.title.romaji}
                      </p>
                      {manga.averageScore && (
                        <p className="text-xs text-gray-400">
                          Score: {manga.averageScore}%
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
