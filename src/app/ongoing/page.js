// app/ongoing/page.js
import OngoingAnimeGrid from '../components/OngoingAnimeGrid'; // Import the NEW component
import Link from 'next/link'; // Import Link

export default function OngoingPage() {
  return (
    <main className="min-h-screen bg-primary-bg text-text-light p-4 md:p-8 lg:p-12">
      <div className="max-w-7xl mx-auto">
        {/* Back to Home Button */}
        <div className="mb-8 text-center md:text-left">
          <Link
            href="/" // Link back to the homepage
            className="inline-block bg-highlight-color text-white font-semibold py-2 px-6 rounded-md hover:bg-purple-500 transition duration-300 shadow-lg text-lg"
          >
            &larr; Back to Home
          </Link>
        </div>

        <h1 className="text-3xl md:text-4xl font-bold mb-8 text-highlight-color text-center">
          Ongoing Anime
        </h1>

        <OngoingAnimeGrid /> {/* Render the new Ongoing Anime GRID component */}
      </div>
    </main>
  );
}