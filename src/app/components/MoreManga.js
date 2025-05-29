// app/components/MoreManga.js
"use client";

import { useState } from "react";

// IMPORTANT: Replace 'anilistId' with the actual AniList IDs for each manga.
// You can search for them on anilist.co and find their IDs in the URL.
const moreMangaList = [
  { title: "Naruto", image: "https://cdn.kobo.com/book-images/e354f3eb-d7f8-4339-9c95-f6b1885bad7d/1200/1200/False/naruto-vol-1.jpg", anilistId: 21479 },
  { title: "Teen Snafu", image: "https://th.bing.com/th/id/OIP.anr-6k2xEqtU9eweth-hDwHaKX?rs=1&pid=ImgDetMain", anilistId: 85298 }, // My Youth Romantic Comedy Is Wrong, As I Expected (Light Novel)
  { title: "Tokyo Ghoul", image: "https://th.bing.com/th/id/OIP.puR-0yoH2KALEttlH4BBswHaKn?rs=1&pid=ImgDetMain", anilistId: 63327 },
  { title: "Golden Time", image: "https://th.bing.com/th/id/OIP.ys7Uk0sS82Oj62w4tagP1gHaKd?rs=1&pid=ImgDetMain", anilistId: 74533 },
  { title: "Kimimni Todoke", image: "https://th.bing.com/th/id/OIP.x_AUXZACOwXOHFwvT3VJHQHaLI?rs=1&pid=ImgDetMain", anilistId: 33783 },
  { title: "Ao Haru Ride", image: "https://th.bing.com/th/id/OIP.EcG9325zYDE2G7bAwXZR5QHaLH?rs=1&pid=ImgDetMain", anilistId: 64969 },
  { title: "Your Lie in April", image: "https://th.bing.com/th/id/OIP.t4Nc2oj4gmaJI13aKy9GUwHaLH?rs=1&pid=ImgDetMain", anilistId: 85272 },
  { title: "Food Wars", image: "https://th.bing.com/th/id/R.e5e368e9e305974ca56555f83b7e16cd?rik=6dhZo%2foqV5eLhA&riu=http%3a%2f%2fimg.manga-sanctuary.com%2fbig%2ffood-wars-manga-volume-1-simple-212235.jpg&ehk=YDF2DGAASWlXOrQ8XrVDEn0QpQvSR0Ipb%2b9l1oEuJXQ%3d&risl=&pid=ImgRaw&r=0", anilistId: 84087 },
  { title: "Blue Lock", image: "https://th.bing.com/th/id/OIP.td3wZlnNR59nwf4ux_QP6gAAAA?rs=1&pid=ImgDetMain", anilistId: 137839 },
  { title: "Summer Time Rendering", image: "https://th.bing.com/th/id/OIP.Obm3VeCiNZ8oXsJSq0TBHgHaK2?rs=1&pid=ImgDetMain", anilistId: 114757 },
  { title: "Lookism", image: "https://th.bing.com/th/id/OIP.anr-6k2xEqtU9eweth-hDwHaKX?rs=1&pid=ImgDetMain", anilistId: 87405 }, // Lookism (Webtoon) - Placeholder image used for now
  { title: "Initial D", image: "https://th.bing.com/th/id/OIP.n7p84iAY4bSW4l4fNMYOHAHaKn?rs=1&pid=ImgDetMain", anilistId: 23644 },
  { title: "AkameGaKill", image: "https://th.bing.com/th/id/R.9fbd4c4dfa0f101057c762b1b280a205?rik=vQVHFUdbEfDn0g&pid=ImgRaw&r=0", anilistId: 64512 },
  { title: "Akira", image: "https://th.bing.com/th/id/OIP.Amx3f64S600TLRLJqULH-AHaKt?rs=1&pid=ImgDetMain", anilistId: 30043 },
  { title: "Spy x Family", image: "https://th.bing.com/th/id/OIP.20gpX1dTvVRUaMjJ1zKMrwHaLb?rs=1&pid=ImgDetMain", anilistId: 110019 },
  { title: "Black Clover", image: "https://th.bing.com/th/id/OIP.Cc0_F8uikvaBd55X9R8eOADGE6?rs=1&pid=ImgDetMain", anilistId: 87403 },
];

export default function MoreManga() {
  const [scrollPos, setScrollPos] = useState(0);

  const mangaCount = moreMangaList.length;
  const visibleCount = 4;
  const maxScroll = mangaCount - visibleCount;

  const handleScroll = (direction) => {
    setScrollPos((pos) => {
      if (direction === "left") return Math.max(pos - 1, 0);
      if (direction === "right") return Math.min(pos + 1, maxScroll);
      return pos;
    });
  };

  const handleClick = (manga) => {
    // Use the anilistId directly for navigation
    const id = manga.anilistId;
    if (!id) {
        console.error("Manga does not have an AniList ID:", manga.title);
        return; // Prevent navigation if ID is missing
    }

    let saved = JSON.parse(localStorage.getItem("continueReading") || "[]");
    saved = saved.filter((m) => m.id !== id);
    saved.unshift({
      id: id,
      title: manga.title,
      coverImage: { medium: manga.image }, // Assuming your continueReading expects 'medium'
    });
    if (saved.length > 5) saved.pop();
    localStorage.setItem("continueReading", JSON.stringify(saved));
    
    // Navigate using the AniList ID
    window.location.href = `/read/${id}`;
  };

  return (
    <div className="w-full max-w-7xl mt-10">
      <h2 className="text-xl font-semibold mb-4 text-white-400">More Manga</h2>
      <div className="relative flex items-center">
        <button
          onClick={() => handleScroll("left")}
          disabled={scrollPos === 0}
          className="p-2 rounded-full bg-gray-700 hover:bg-gray-600 disabled:opacity-40 transition mr-2"
          style={{ visibility: scrollPos === 0 ? "hidden" : "visible" }}
        >
          &#8592;
        </button>

        <div className="flex overflow-hidden w-full">
          <div
            className="flex transition-transform duration-300"
            style={{ transform: `translateX(-${scrollPos * 160}px)` }}
          >
            {moreMangaList.map((manga, i) => (
              <div
                key={manga.anilistId || i}
                onClick={() => handleClick(manga)}
                className="flex-shrink-0 w-[180px] mr-4 cursor-pointer rounded-lg bg-gray-800 shadow-md hover:shadow-lg hover:scale-[1.02] transition-transform"
              >
                <img
                  src={manga.image}
                  alt={manga.title}
                  className="w-full h-[260px] object-cover rounded-t-lg"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://placehold.co/180x260/333/FFF?text=No+Image";
                  }}
                />
                <p className="text-center p-2 text-white font-semibold">
                  {manga.title}
                </p>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={() => handleScroll("right")}
          disabled={scrollPos === maxScroll}
          className="p-2 rounded-full bg-gray-700 hover:bg-gray-600 disabled:opacity-40 transition ml-2"
          style={{ visibility: scrollPos === maxScroll ? "hidden" : "visible" }}
        >
          &#8594;
        </button>
      </div>
    </div>
  );
}