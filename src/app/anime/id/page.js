// src/app/anime/[id]/page.js
// This is a Server Component, meaning it fetches data on the server
// and renders the initial HTML for the page.
import Image from 'next/image'; // For optimized images
import Link from 'next/link';   // For navigation links

// generateStaticParams runs at build time to determine which static pages to generate.
// It must be a Server Component function.
export async function generateStaticParams() {
  let animeIds = [];
  try {
    // Fetch a list of top anime IDs to generate static pages for them.
    // Adjust the 'limit' based on how many pages you want to pre-render.
    // Be mindful of API rate limits during build time.
    // For a real application, you might fetch from your own backend or a more
    // comprehensive API endpoint that lists all relevant IDs.
    const response = await fetch('https://api.jikan.moe/v4/top/anime?limit=20', {
      // Add caching for build time if fetching a lot of data
      next: { revalidate: 3600 } // Revalidate every hour during build
    });
    const data = await response.json();

    if (response.ok && data.data) {
      animeIds = data.data.map((anime) => ({
        id: anime.mal_id.toString(), // Ensure ID is a string for the dynamic segment
      }));
    } else {
      console.error("Failed to fetch anime IDs for generateStaticParams:", data);
    }
  } catch (error) {
    console.error("Error in generateStaticParams while fetching IDs:", error);
  }
  // Return the list of params. If an error occurs, it will return an empty array,
  // meaning no dynamic detail pages will be pre-rendered, which might lead to 404s
  // unless you have a fallback mechanism or change your output config.
  return animeIds;
}

// Your AnimeDetailPage component (Server Component)
export default async function AnimeDetailPage({ params }) {
  const { id } = params; // Get the dynamic 'id' from the URL

  let anime = null;
  let characters = [];
  let error = false; // Use boolean for error state
  let notFound = false;

  try {
    // Fetch full details and characters in parallel
    const [animeResponse, charactersResponse] = await Promise.all([
      fetch(`https://api.jikan.moe/v4/anime/${id}/full`), // Fetch full details
      fetch(`https://api.jikan.moe/v4/anime/${id}/characters`), // Fetch characters
    ]);

    // Handle main anime data
    if (!animeResponse.ok) {
      if (animeResponse.status === 404) {
        notFound = true;
        // Don't throw, let the notFound state be handled
      } else {
        throw new Error(`HTTP error! status: ${animeResponse.status} for anime details`);
      }
    } else {
      const animeData = await animeResponse.json();
      if (animeData.data) {
        anime = animeData.data;
      } else {
        notFound = true; // If no data.data, consider it not found
      }
    }

    // Handle characters data (even if main anime fetch succeeded)
    if (!charactersResponse.ok) {
      console.warn(`Warning: Could not fetch characters (status: ${charactersResponse.status}). Proceeding without them.`);
      characters = []; // Set empty array if characters fail
    } else {
      const charactersData = await charactersResponse.json();
      if (charactersData.data) {
        characters = charactersData.data;
      } else {
        characters = [];
      }
    }

  } catch (err) {
    console.error("Error fetching anime data:", err);
    error = true;
  }

  // --- Render based on fetch results ---
  if (notFound) {
    return (
      <main className="min-h-screen bg-primary-bg flex flex-col items-center justify-center text-text-light text-2xl p-4">
        <p className="mb-4 text-center">Anime not found.</p>
        <Link
          href="/search" // Or back to a listing page
          className="bg-highlight-color text-white font-semibold py-2 px-6 rounded-md hover:bg-purple-500 transition duration-300 shadow-lg"
        >
          Back to Search
        </Link>
      </main>
    );
  }

  if (error || !anime) { // If there was a general error or anime data is unexpectedly missing
    return (
      <main className="min-h-screen bg-primary-bg flex flex-col items-center justify-center text-highlight-color text-2xl p-4">
        <p className="mb-4 text-center">Failed to load anime details. Please try again later.</p>
        <Link
          href="/"
          className="bg-highlight-color text-white font-semibold py-2 px-6 rounded-md hover:bg-purple-500 transition duration-300 shadow-lg"
        >
          Back to Home
        </Link>
      </main>
    );
  }


  // If we reach here, anime data is loaded
  const coverImage = anime.images?.jpg?.large_image_url || "https://placehold.co/300x450/16213E/E0E0E0?text=No+Image";
  const title = anime.title || anime.title_english || anime.title_japanese || "Untitled";
  const synopsis = anime.synopsis || "No synopsis available.";
  const genres = anime.genres?.map(g => g.name).join(", ") || "N/A";
  const studios = anime.studios?.map(s => s.name).join(", ") || "N/A";
  const aired = anime.aired?.string || "N/A";
  const episodes = anime.episodes || "N/A";
  const status = anime.status || "N/A";
  // The 'score' line had a syntax issue, fixed below
  const score = anime.score ? `${anime.score} (Rank #${anime.rank})` : "N/A";
  const type = anime.type || "N/A";
  const duration = anime.duration || "N/A";
  const rating = anime.rating || "N/A";
  const popularity = anime.popularity ? `#${anime.popularity}` : "N/A";
  const members = anime.members ? anime.members.toLocaleString() : "N/A";
  const trailerUrl = anime.trailer?.embed_url;

  // Filter for main characters (usually those with a Japanese voice actor)
  const mainCharacters = characters.filter(char => char.role === 'Main' || char.role === 'Supporting');

  return (
    <main className="min-h-screen bg-primary-bg text-text-light p-4 md:p-8 lg:p-12">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <div className="mb-8 text-center md:text-left">
          <Link
            href="/search" // Link back to the search page
            className="inline-block bg-highlight-color text-white font-semibold py-2 px-6 rounded-md hover:bg-purple-500 transition duration-300 shadow-lg text-lg"
          >
            &larr; Back to Search
          </Link>
        </div>

        {/* Anime Main Info */}
        <div className="bg-secondary-bg rounded-lg shadow-xl p-6 md:p-8 mb-12 flex flex-col md:flex-row gap-8">
          <div className="md:w-1/3 flex-shrink-0">
            {/* Using Next.js Image component for better optimization and layout shifts */}
            <Image
              src={coverImage}
              alt={title}
              width={300} // Base width for consistency
              height={450} // Base height for consistency
              className="rounded-lg shadow-md w-full h-auto object-cover"
              priority={true} // Prioritize loading for the main image
              // If you encounter issues with `Image` and `output: 'export'`,
              // you might need `unoptimized: true` in next.config.js
              // OR revert to a standard <img> tag for the main image.
            />
            {trailerUrl && (
              <div className="mt-6">
                <h3 className="text-xl font-bold mb-3 text-highlight-color">Trailer</h3>
                <div className="relative" style={{ paddingBottom: '56.25%', height: 0 }}>
                  <iframe
                    src={trailerUrl}
                    title={`${title} Trailer`}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="absolute top-0 left-0 w-full h-full rounded-md"
                  ></iframe>
                </div>
              </div>
            )}
          </div>

          <div className="md:w-2/3">
            <h1 className="text-4xl font-extrabold text-highlight-color mb-3">{title}</h1>
            <p className="text-xl text-text-dark mb-4">
              Score: <span className="font-semibold">{score}</span> | Popularity: <span className="font-semibold">{popularity}</span> | Members: <span className="font-semibold">{members}</span>
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-lg mb-6">
              <p><span className="font-semibold text-accent-color">Type:</span> {type}</p>
              <p><span className="font-semibold text-accent-color">Episodes:</span> {episodes}</p>
              <p><span className="font-semibold text-accent-color">Status:</span> {status}</p>
              <p><span className="font-semibold text-accent-color">Aired:</span> {aired}</p>
              <p><span className="font-semibold text-accent-color">Duration:</span> {duration}</p>
              <p><span className="font-semibold text-accent-color">Rating:</span> {rating}</p>
              <p className="col-span-1 sm:col-span-2"><span className="font-semibold text-accent-color">Genres:</span> {genres}</p>
              <p className="col-span-1 sm:col-span-2"><span className="font-semibold text-accent-color">Studios:</span> {studios}</p>
            </div>

            <h2 className="text-2xl font-bold text-text-light mb-3">Synopsis</h2>
            <p className="text-lg text-text-dark leading-relaxed whitespace-pre-wrap">{synopsis}</p>

            {/* Could add related anime here if desired, using anime.relations */}
          </div>
        </div>

        {/* Characters Section */}
        {mainCharacters.length > 0 && (
          <div className="bg-secondary-bg rounded-lg shadow-xl p-6 md:p-8 mb-12">
            <h2 className="text-3xl font-bold text-highlight-color mb-6 text-center">Characters & Voice Actors</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
              {mainCharacters.map((charData) => (
                <div key={charData.character.mal_id} className="bg-primary-bg rounded-lg shadow-md overflow-hidden transform transition hover:scale-105">
                  <div className="relative w-full h-48">
                    <Image
                      src={charData.character.images?.jpg?.image_url || "https://placehold.co/100x150/2C3E50/ECF0F1?text=No+Char+Image"}
                      alt={charData.character.name}
                      fill // Fills the parent div
                      sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 20vw" // Required for 'fill'
                      className="object-cover object-top"
                    />
                  </div>
                  <div className="p-3">
                    <h3 className="text-md font-semibold text-text-light line-clamp-2">
                      {charData.character.name}
                    </h3>
                    <p className="text-sm text-accent-color font-medium mb-1">
                      ({charData.role})
                    </p>
                    {charData.voice_actors.length > 0 && (
                      <div className="mt-2 text-xs text-text-dark">
                        {charData.voice_actors
                          .filter(va => va.language === 'Japanese') // Prioritize Japanese VAs
                          .slice(0, 1) // Take only the first Japanese VA for simplicity
                          .map(va => (
                            <p key={va.person.mal_id} className="text-accent-color">
                              {va.person.name} (JP VA)
                            </p>
                          ))
                        }
                        {/* Fallback to first non-Japanese VA if no Japanese VA found */}
                        {charData.voice_actors.length > 0 && !charData.voice_actors.some(va => va.language === 'Japanese') && (
                          <p className="text-accent-color">
                            {charData.voice_actors[0].person.name} ({charData.voice_actors[0].language} VA)
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {mainCharacters.length === 0 && !error && (
          <p className="text-text-dark text-center py-8">No main characters found for this anime.</p>
        )}

        {/* Back to Top/Bottom Button */}
        <div className="text-center mt-12">
          <Link
            href="/search"
            className="inline-block bg-highlight-color text-white font-semibold py-2 px-6 rounded-md hover:bg-purple-500 transition duration-300 shadow-lg text-lg"
          >
            &larr; Back to Search
          </Link>
        </div>

      </div>
    </main>
  );
}