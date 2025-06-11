// app/upcoming/page.js
"use client"; // This directive is crucial for client-side functionality in Next.js App Router

import { useState, useEffect, Suspense } from "react"; // Import Suspense
import { useRouter, useSearchParams } from "next/navigation"; // Used for client-side routing and URL parameters
import AnimeCard from "../components/AnimeCard"; // Your component to display individual anime cards
import Link from "next/link"; // Included in case you need it for other internal links

// Constants for pagination control
const ITEMS_PER_PAGE = 18; // Number of anime cards to display on each page
const MAX_PAGE_BUTTONS = 7; // Maximum number of numbered pagination buttons to show at once (e.g., 1 ... 4 5 6 ... 10)

// Extract the core logic into a separate component that will be wrapped by Suspense
function UpcomingContent() {
  // State variables to manage data, loading, and errors
  const [upcomingAnime, setUpcomingAnime] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastVisiblePage, setLastVisiblePage] = useState(1); // Stores the total number of available pages from the API

  // Next.js hooks for routing and URL query parameters
  const router = useRouter();
  const searchParams = useSearchParams(); // This is the hook causing the issue

  // Get the current page number from the URL query parameter 'page', default to 1 if not present
  const currentPage = parseInt(searchParams.get('page') || '1', 10);

  // useEffect hook to fetch data when the component mounts or currentPage changes
  useEffect(() => {
    const fetchUpcomingAnime = async () => {
      try {
        setLoading(true); // Set loading state to true before fetching
        setError(null);    // Clear any previous errors

        // Fetch upcoming anime data from Jikan API v4
        // Using /top/anime with filter=upcoming to get paginated results
        const response = await fetch(
          `https://api.jikan.moe/v4/top/anime?filter=upcoming&page=${currentPage}&limit=${ITEMS_PER_PAGE}`
        );

        // Check if the API response was successful
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json(); // Parse the JSON response

        setUpcomingAnime(data.data); // Update state with the fetched anime data for the current page
        setLastVisiblePage(data.pagination.last_visible_page); // Update state with the total number of pages

      } catch (e) {
        console.error("Failed to fetch upcoming anime:", e); // Log any fetching errors
        setError("Failed to load upcoming anime. Please try again later."); // Set user-friendly error message
      } finally {
        setLoading(false); // Set loading state to false after fetch (success or error)
      }
    };

    fetchUpcomingAnime(); // Call the fetch function
  }, [currentPage]); // Re-run this effect whenever currentPage changes (triggered by pagination clicks)

  // Handler for changing pagination pages
  const handlePageChange = (page) => {
    // Navigate to the new page by updating the URL query parameter
    router.push(`/upcoming?page=${page}`);
  };

  // Helper function to generate the array of page numbers to display in the pagination UI
  const getPageNumbers = () => {
    const pageNumbers = [];
    const totalPages = lastVisiblePage; // Total pages from API

    // If total pages are less than or equal to MAX_PAGE_BUTTONS, display all of them
    if (totalPages <= MAX_PAGE_BUTTONS) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Logic for displaying a subset of pages with ellipses (...) for larger page counts
      const half = Math.floor(MAX_PAGE_BUTTONS / 2);
      let start = Math.max(1, currentPage - half); // Calculate start page for the visible range
      let end = Math.min(totalPages, currentPage + half); // Calculate end page for the visible range

      // Adjust start/end to ensure MAX_PAGE_BUTTONS are displayed if possible
      if (end - start + 1 < MAX_PAGE_BUTTONS) {
        if (start === 1) { // If at the beginning, extend end
          end = Math.min(totalPages, MAX_PAGE_BUTTONS);
        } else if (end === totalPages) { // If at the end, extend start
          start = Math.max(1, totalPages - MAX_PAGE_BUTTONS + 1);
        }
      }

      // Add the first page and an ellipsis if needed
      if (start > 1) {
        pageNumbers.push(1);
        if (start > 2) {
          pageNumbers.push('...');
        }
      }

      // Add the pages within the calculated visible range
      for (let i = start; i <= end; i++) {
        pageNumbers.push(i);
      }

      // Add an ellipsis and the last page if needed
      if (end < totalPages) {
        if (end < totalPages - 1) {
          pageNumbers.push('...');
        }
        pageNumbers.push(totalPages);
      }
    }
    return pageNumbers;
  };

  // --- Conditional Rendering for Loading and Error States ---
  if (loading) {
    return (
      <div className="min-h-screen bg-primary-bg text-text-light flex items-center justify-center">
        <p className="text-xl">Loading upcoming anime...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-primary-bg text-text-light flex items-center justify-center">
        <p className="text-xl text-highlight-color">{error}</p>
      </div>
    );
  }

  // Get the array of page numbers to render based on the current page and total pages
  const pageNumbersToDisplay = getPageNumbers();

  // --- Main Component Render ---
  return (
    <> {/* Use a fragment because the outermost div is now in the parent component */}
      {/* Grid for displaying Anime Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
        {upcomingAnime.map((anime) => (
          <AnimeCard
            key={anime.mal_id} // Unique key for each anime card
            id={anime.mal_id}
            title={anime.title}
            imageUrl={anime.images.webp.large_image_url || anime.images.jpg.large_image_url}
            genres={anime.genres.map(genre => genre.name)} // Extract genre names
            score={anime.score} // Pass score if available for display
          />
        ))}
      </div>

      {/* Pagination Controls Section */}
      {lastVisiblePage > 1 && ( // Only render pagination if there's more than one page
        <div className="flex justify-center items-center space-x-2 mt-12 mb-8 flex-wrap">
          {/* Previous Page Button */}
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1} // Disable if on the first page
            className="bg-highlight-color text-white px-4 py-2 rounded-md hover:bg-purple-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors font-semibold"
          >
            Previous
          </button>

          {/* Render numbered page buttons or ellipses */}
          {pageNumbersToDisplay.map((page, index) => (
            page === '...' ? (
              // Styling for ellipsis (non-clickable)
              <span key={`ellipsis-${index}`} className="px-4 py-2 text-text-dark text-lg font-semibold select-none">...</span>
            ) : (
              // Styling for clickable page number buttons
              <button
                key={page} // Unique key for each button (the page number itself)
                onClick={() => handlePageChange(page)}
                className={`px-4 py-2 rounded-lg font-semibold min-w-[44px] text-center
                  ${currentPage === page // Apply different styles based on active/inactive state
                    ? 'bg-highlight-color text-white' // Active page: Uses your theme's highlight color as background
                    : 'bg-[#282828] text-white hover:bg-[#3A3A3A]' // Inactive page: Dark gray background, subtle hover
                  }
                  transition-colors duration-200`}
              >
                {page}
              </button>
            )
          ))}

          {/* Next Page Button */}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === lastVisiblePage} // Disable if on the last page
            className="bg-highlight-color text-white px-4 py-2 rounded-md hover:bg-purple-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors font-semibold"
          >
            Next
          </button>
        </div>
      )}
    </>
  );
}


// The main page component which acts as a Server Component "wrapper" for client logic
export default function UpcomingPageWrapper() {
  const router = useRouter(); // Keeping useRouter here for the back button, it's fine.

  return (
    <div className="min-h-screen bg-primary-bg text-text-light py-8 px-4 md:px-8 lg:px-12">
      <div className="max-w-7xl mx-auto">
        {/* Back Button and Page Title Section */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => router.push('/')} // CHANGED: Now directly navigates to the homepage ('/')
            className="bg-secondary-bg text-text-light hover:bg-purple-500 px-4 py-2 rounded-md transition-colors duration-200 flex items-center"
            aria-label="Go to homepage" // Updated accessibility label
          >
            {/* SVG for a left arrow icon */}
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
            Back to Home
          </button>
          {/* Main Page Title */}
          <h1 className="text-4xl font-bold text-highlight-color text-center flex-grow-1">
            Upcoming Anime
          </h1>
          {/* A transparent div to help center the title when there's an element on the left */}
          <div className="w-[100px] h-0"></div> {/* Adjust width as needed to balance title */}
        </div>

        {/* Wrap the client-side content (UpcomingContent) in a Suspense boundary */}
        <Suspense fallback={
          <div className="flex justify-center items-center h-64">
            <p className="text-xl text-text-dark">Loading upcoming anime list...</p>
          </div>
        }>
          <UpcomingContent />
        </Suspense>
      </div>
    </div>
  );
}