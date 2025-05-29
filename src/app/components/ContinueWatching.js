"use client";

import { useEffect, useState } from "react";

export default function ContinueWatching() {
  const [continueReading, setContinueReading] = useState([]);

  // Effect hook to load "continue reading" data from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("continueReading");
      if (saved) {
        setContinueReading(JSON.parse(saved));
      }
    } catch (error) {
      console.error("Error parsing localStorage 'continueReading':", error);
      setContinueReading([]); // Reset if there's an error parsing
    }
  }, []); // Empty dependency array means this effect runs once on mount

  // If there are no items to continue reading, don't render the section
  if (continueReading.length === 0) return null;

  return (
    // Section container for "Continue Reading" with top margin and full width
    <section className="mt-8 w-full">
      <h2 className="text-2xl font-bold mb-4 text-white">Continue Reading</h2> {/* Section heading */}
      {/* Flex container for horizontal scrolling items */}
      <div className="flex space-x-4 overflow-x-auto pb-4 custom-scrollbar"> {/* Added pb-4 for scrollbar clearance and custom-scrollbar class */}
        {continueReading.map((manga) => (
          // Individual manga item card
          <div
            key={manga.id}
            onClick={() => {
              window.location.href = `/read/${manga.id}`; // Navigate to reading page
            }}
            role="button" // For accessibility
            tabIndex={0} // For keyboard navigation
            onKeyDown={(e) =>
              e.key === "Enter" && (window.location.href = `/read/${manga.id}`)
            }
            className="cursor-pointer min-w-[140px] flex-none rounded-lg p-2 bg-gray-800 hover:bg-gray-700 transition transform hover:scale-[1.02] shadow-md" // Card styling
          >
            <img
              src={manga.coverImage.medium}
              alt={manga.title}
              className="rounded-lg mb-2 w-full h-48 object-cover shadow" // Image styling with fixed height
              // Add onerror to handle broken image links
              onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/140x192/333/FFF?text=No+Image"; }}
            />
            <p className="text-sm font-medium text-white line-clamp-2"> {/* Title styling with truncation */}
            {typeof manga.title === "string"
            ? manga.title
            : manga.title?.english ?? manga.title?.romaji ?? "Untitled"}

            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
