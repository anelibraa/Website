// app/components/HeroSection.js
"use client";

import { useEffect, useState } from "react";

export default function HeroSection() {
  const [featuredAnimeList, setFeaturedAnimeList] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchFeaturedAnime = async () => {
      setLoading(true);
      setError(false);
      try {
        const response = await fetch("https://api.jikan.moe/v4/top/anime?filter=upcoming&limit=5");

        if (!response.ok) {
          if (response.status === 429) {
            console.warn("Jikan API rate limit hit for Hero Section. Please wait a moment and refresh.");
            setError(true);
            return;
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data && data.data && data.data.length > 0) {
          setFeaturedAnimeList(data.data);
        } else {
          console.warn("No upcoming anime found or unexpected data for Hero Section:", data);
          setError(true);
        }
      } catch (err) {
        console.error("Error fetching featured anime for Hero Section:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    const fetchTimer = setTimeout(() => {
      fetchFeaturedAnime();
    }, 1500);

    return () => clearTimeout(fetchTimer);
  }, []);

  useEffect(() => {
    if (featuredAnimeList.length > 1) {
      const rotateTimer = setInterval(() => {
        setCurrentIndex((prevIndex) =>
          (prevIndex + 1) % featuredAnimeList.length
        );
      }, 3000);

      return () => clearInterval(rotateTimer);
    }
  }, [featuredAnimeList]);

  const currentAnime = featuredAnimeList[currentIndex];

  if (loading) {
    return (
      <section className="relative w-full h-[60vh] md:h-[70vh] bg-secondary-bg flex items-center justify-center overflow-hidden shadow-xl mb-8">
        <p className="text-text-light text-xl">Loading featured anime...</p>
      </section>
    );
  }

  if (error || !currentAnime) {
    return (
      <section className="relative w-full h-[60vh] md:h-[70vh] bg-secondary-bg flex items-center justify-center overflow-hidden shadow-xl mb-8">
        <p className="text-highlight-color text-xl text-center">
          Failed to load featured anime. Please check console for details or refresh.
        </p>
      </section>
    );
  }

  const imageUrl = currentAnime.images?.webp?.large_image_url || currentAnime.images?.jpg?.large_image_url || "https://placehold.co/1920x1080/1A1A2E/E0E0E0?text=No+Hero+Image";
  const title = currentAnime.title || "Untitled Upcoming Anime";
  const genres = currentAnime.genres?.map(g => g.name).join(', ') || "Unknown Genre";
  const type = currentAnime.type || "Anime";
  const status = currentAnime.status || "Unknown Status";
  const releaseYear = currentAnime.aired?.prop?.from?.year;
  const broadcastDay = currentAnime.broadcast?.day;

  return (
    <section className="relative w-full h-[60vh] md:h-[70vh] overflow-hidden shadow-xl mb-8 group">
      <div
        className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
        style={{ backgroundImage: `url(${imageUrl})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-primary-bg via-transparent to-primary-bg opacity-90"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-primary-bg/70 via-transparent to-transparent"></div>
      </div>

      <div className="absolute bottom-0 left-0 p-8 md:p-12 text-white max-w-2xl z-10">
        <h2 className="text-3xl md:text-5xl font-extrabold mb-3 leading-tight text-norime-text drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
          {title}
        </h2>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-4">
          <span className="bg-highlight-color text-white px-3 py-1 rounded-full text-sm font-semibold">
            {status.includes("Not yet aired") ? "Upcoming" : status}
          </span>
          {releaseYear && (
            <span className="text-text-light text-sm font-medium">
              {releaseYear}
            </span>
          )}
          {broadcastDay && (
            <span className="text-text-light text-sm font-medium">
              Airs: {broadcastDay}
            </span>
          )}
          <span className="text-text-light text-sm font-medium">{type}</span>
          <span className="text-text-light text-sm font-medium">{genres}</span>
        </div>
        {currentAnime.trailer?.embed_url && (
          <a
            href={currentAnime.trailer.embed_url}
            target="_blank"
            rel="noopener noreferrer"
            // TEMPORARY: Using direct Tailwind purple classes for testing
            className="inline-flex items-center bg-purple-600 hover:bg-purple-700 transition-colors duration-300 text-white font-bold py-3 px-6 rounded-lg shadow-md mt-4 text-lg"
          >
            <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 5v14l11-7z"></path>
            </svg>
            Watch Trailer
          </a>
        )}
      </div>

      {/* Carousel Dots - MODIFIED FOR CENTERING */}
      {featuredAnimeList.length > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
          {featuredAnimeList.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-3 h-3 rounded-full transition-colors duration-300 ${
                index === currentIndex ? "bg-highlight-color" : "bg-text-dark/50 hover:bg-text-dark"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            ></button>
          ))}
        </div>
      )}
    </section>
  );
}