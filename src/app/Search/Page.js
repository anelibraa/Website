// app/search/page.js
import SearchComponent from '../components/SearchComponent';

// This is a client component because SearchComponent will use useState and useEffect
// for handling user input and API calls.
export default function SearchPage() {
  return (
    <main className="min-h-screen bg-primary-bg text-text-light p-4 md:p-8 lg:p-12">
      <h1 className="text-3xl md:text-4xl font-bold mb-8 text-highlight-color text-center">
        Anime Search
      </h1>
      <SearchComponent />
    </main>
  );
}