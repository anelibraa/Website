"use client";

import { useEffect, useState } from "react";

export default function PopularManga() {
  const [mangaList, setMangaList] = useState([]);

  useEffect(() => {
    const query = `
      query {
        Page(perPage: 6) {
          media(type: MANGA, sort: POPULARITY_DESC) {
            id
            title {
              romaji
              english
            }
            coverImage {
              large
            }
            description(asHtml: false)
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
        if (data?.data?.Page?.media) {
          setMangaList(data.data.Page.media);
        } else {
          console.error("Failed to fetch popular manga data:", data);
          setMangaList([]);
        }
      })
      .catch((error) => {
        console.error("Error fetching popular manga:", error);
        setMangaList([]);
      });
  }, []);

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold mb-4 text-white">Popular Manga</h2>
      {mangaList.length === 0 ? (
        <p className="text-gray-400 text-center py-8">
          Loading popular manga or no data available...
        </p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-4">
          {mangaList.map((manga) => {
            const title = manga.title?.english ?? manga.title?.romaji ?? "Untitled";

            return (
              <div
                key={manga.id}
                className="bg-gray-800 rounded-lg shadow-md cursor-pointer hover:shadow-lg transition transform hover:scale-[1.02] overflow-hidden"
                onClick={() => {
                  let saved = JSON.parse(localStorage.getItem("continueReading") || "[]");
                  saved = saved.filter((m) => m.id !== manga.id);
                  saved.unshift({
                    id: manga.id,
                    title: title,
                    coverImage: manga.coverImage,
                  });
                  if (saved.length > 5) saved.pop();
                  localStorage.setItem("continueReading", JSON.stringify(saved));
                  window.location.href = `/read/${manga.id}`;
                }}
              >
                <img
                  src={manga.coverImage.large}
                  alt={title}
                  className="w-full h-44 object-cover rounded-t-lg shadow"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://placehold.co/170x220/333/FFF?text=No+Image";
                  }}
                />
                <div className="p-3">
                  <h3 className="text-lg font-semibold mb-1 text-white line-clamp-1">
                    {title}
                  </h3>
                  <p className="text-sm text-gray-400 line-clamp-3">
                    {manga.description || "No description available."}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
