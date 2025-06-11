// app/components/AnimeCard.js
// This component displays a single anime card and makes it clickable.
// It uses Next.js's Link for navigation and Image for optimized image loading.

import Link from 'next/link'; // Import Link for client-side navigation
import Image from 'next/image'; // Import Image for optimized image rendering

export default function AnimeCard({ id, title, imageUrl, genres, score }) {
  // Prepare data for display, providing fallbacks for missing information.
  const displayTitle = title || "Untitled";
  // Use a placeholder image if the provided imageUrl is null or undefined.
  const finalImageUrl = imageUrl || "https://placehold.co/300x450/333/FFF?text=No+Image";
  // Join genres into a comma-separated string, or display "N/A" if none.
  const displayGenres = Array.isArray(genres) && genres.length > 0 ? genres.join(', ') : "N/A";
  // Format the score to one decimal place, or display "N/A" if not available.
  const displayScore = score !== undefined && score !== null ? score.toFixed(1) : "N/A";

  return (
    // The entire card is wrapped in a Next.js Link component.
    // When clicked, it navigates to the dynamic route /anime/[id].
    <Link
      href={`/anime/${id}`} // Dynamically constructs the URL to the anime detail page.
      className="block group rounded-lg overflow-hidden shadow-lg bg-secondary-bg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
    >
      <div className="relative w-full aspect-[2/3] overflow-hidden">
        {/* Next.js Image component for optimized image loading. */}
        {/* 'fill' makes the image fill its parent container, which must be 'relative'. */}
        {/* 'sizes' helps the browser choose the best image size for different viewports. */}
        <Image
          src={finalImageUrl}
          alt={displayTitle} // Accessible alt text for the image.
          fill // Image will fill the parent div (which has aspect-[2/3] and overflow-hidden)
          sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, (max-width: 1280px) 20vw, 16vw"
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          priority={false} // Set to true only for images in the initial viewport (LCP).
        />
        {/* Display score if available */}
        {score && (
          <div className="absolute top-2 right-2 bg-highlight-color text-white text-xs font-bold px-2 py-1 rounded-full">
            ⭐ {displayScore}
          </div>
        )}
      </div>
      <div className="p-3">
        {/* Anime Title */}
        <h3 className="text-sm md:text-base font-semibold text-text-light group-hover:text-norime-text transition-colors duration-200 line-clamp-2">
          {displayTitle}
        </h3>
        {/* Anime Genres */}
        {genreList !== "N/A" && (
          <p className="text-xs text-text-dark mt-1 line-clamp-1">{genreList}</p>
        )}
      </div>
    </Link>
  );
}
