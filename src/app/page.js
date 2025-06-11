"use client";

import { useState, useEffect } from "react";
import { auth } from "./firebase-config";
import { onAuthStateChanged, signOut, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";

// Import new/modified components
import Header from "./components/Header";
import HeroSection from "./components/HeroSection";
import OngoingAnime from "./components/OnGoingAnime"; // Renamed PopularManga to OngoingAnime


// Define a list of sample avatar URLs (kept for auth modal functionality)
const AVATAR_URLS = [
  "https://i.pinimg.com/736x/44/4c/8d/444c8d4580a228de682255aa1c5b775e.jpg", //chainsaw
  "https://th.bing.com/th/id/OIP.5BhqzdCU81GTEq8QV-YS6QHaHa?rs=1&pid=ImgDetMain", //naruto
  "https://avatarfiles.alphacoders.com/207/207935.jpg", //itachi
  "https://i.pinimg.com/originals/58/df/ae/58dfae343c0b0078546f3efda94e8cda.jpg", //HXH
  "https://th.bing.com/th/id/OIP.m_x77YGKoDGbX3vCD6vXzAHaIo?rs=1&pid=ImgDetMain", //jojo
  "https://th.bing.com/th/id/OIP.VwuukD1JQwfdTz6ZQNFLNQHaHa?rs=1&pid=ImgDetMain", //teensanfu
  "https://th.bing.com/th/id/OIP.6xESU_loiqZ3hRDqfjv2bwHaGj?rs=1&pid=ImgDetMain", //akamegakill
  "https://i.pinimg.com/736x/23/8d/4e/238d4e1881315010a7868ca2b4390daf.jpg", //vinlandsaga
];

export default function Page() {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [profileUpdateMessage, setProfileUpdateMessage] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser && showAuthModal && isLogin) {
        setShowAuthModal(false);
        setEmail("");
        setPassword("");
        setErrorMsg("");
      }
    });
    return () => unsubscribe();
  }, [showAuthModal, isLogin]);

  useEffect(() => {
    const scriptId = 'jotform-chatbot-script';
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://cdn.jotfor.ms/agent/embedjs/0196d537c72c7231803833cad4c06bb15c03/embed.js?skipWelcome=1&maximizable=1';
      script.async = true;
      document.body.appendChild(script);
      return () => {
        if (document.getElementById(scriptId)) {
          document.body.removeChild(script);
        }
      };
    }
  }, []);

  const toggleMode = () => {
    setErrorMsg("");
    setIsLogin(!isLogin);
  };

  const handleAuth = async () => {
    setErrorMsg("");
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (error) {
      setErrorMsg(error.message);
    }
  };

  const handleOpenLoginModal = () => {
    setIsLogin(true);
    setEmail("");
    setPassword("");
    setErrorMsg("");
    setProfileUpdateMessage("");
    setShowAuthModal(true);
  };

  const handleOpenProfilePictureModal = () => {
    if (!user) {
      handleOpenLoginModal();
      return;
    }
    setIsLogin(false);
    setEmail("");
    setPassword("");
    setErrorMsg("");
    setProfileUpdateMessage("");
    setShowAuthModal(true);
  };

  const handleCloseAuthModal = () => {
    setShowAuthModal(false);
    setEmail("");
    setPassword("");
    setErrorMsg("");
    setProfileUpdateMessage("");
  };

  const handleSelectAvatar = async (avatarUrl) => {
    if (!user) {
      setProfileUpdateMessage("Error: Not logged in.");
      return;
    }

    setProfileUpdateMessage("Updating profile...");
    try {
      await updateProfile(user, { photoURL: avatarUrl });
      setUser({ ...user, photoURL: avatarUrl });
      setProfileUpdateMessage("Profile picture updated successfully!");
      setTimeout(() => {
        handleCloseAuthModal();
      }, 1000);
    } catch (error) {
      console.error("Error updating profile picture:", error);
      setProfileUpdateMessage(`Failed to update picture: ${error.message}`);
    }
  };


  return (
    <main className="min-h-screen bg-primary-bg text-text-light flex flex-col items-center">
      <Header
        onLoginClick={handleOpenLoginModal}
        onUpdateProfilePictureClick={handleOpenProfilePictureModal}
      />

      {/* Main content area - now without max-w-7xl on the outer div to allow HeroSection to span full width */}
      <div className="w-full flex flex-col items-center"> {/* Removed px-4 md:px-8 lg:px-12 py-8 here */}
        {/* Hero Section - will now span full width */}
        <HeroSection />

        {/* Inner container for other sections to maintain content width */}
        <div className="w-full max-w-7xl px-4 md:px-8 lg:px-12 py-8">
          {/* Ongoing Anime Section (formerly PopularManga) */}
          <OngoingAnime />
        </div>
      </div>


      {/* Authentication/Profile Picture Modal (conditionally rendered) */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-secondary-bg p-8 rounded-lg shadow-xl w-full max-w-md relative border border-accent-color">
            <button
              onClick={handleCloseAuthModal}
              className="absolute top-3 right-3 text-text-dark hover:text-text-light text-2xl font-bold"
              aria-label="Close modal"
            >
              &times;
            </button>

            {!user ? (
              <>
                <h2 className="text-3xl font-bold mb-6 text-center text-highlight-color">
                  {isLogin ? "Login" : "Sign Up"}
                </h2>
                {errorMsg && <p className="text-highlight-color mb-4 text-center text-sm">{errorMsg}</p>}
                <input
                  type="email"
                  placeholder="Email"
                  className="w-full mb-4 p-3 rounded-md bg-primary-bg border border-accent-color text-text-light placeholder-text-dark focus:outline-none focus:ring-2 focus:ring-highlight-color"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <input
                  type="password"
                  placeholder="Password"
                  className="w-full mb-6 p-3 rounded-md bg-primary-bg border border-accent-color text-text-light placeholder-text-dark focus:outline-none focus:ring-2 focus:ring-highlight-color"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  onClick={handleAuth}
                  className="w-full bg-highlight-color py-3 rounded-md hover:bg-purple-700 transition duration-300 font-semibold text-lg shadow-md text-white"
                >
                  {isLogin ? "Login" : "Sign Up"}
                </button>
                <button
                  onClick={toggleMode}
                  className="mt-5 text-sm underline text-text-dark hover:text-text-light transition duration-300 block text-center"
                >
                  {isLogin ? "Don't have an account? Create one!" : "Already have an account? Login here."}
                </button>
              </>
            ) : (
              <>
                <h2 className="text-3xl font-bold mb-6 text-highlight-color text-center">Choose Your Avatar</h2>

                <div className="mb-6">
                  <img
                    src={user.photoURL || "https://placehold.co/100x100/333/FFF?text=U"}
                    alt="Current Avatar"
                    className="w-24 h-24 rounded-full object-cover mx-auto border-4 border-highlight-color shadow-lg"
                  />
                  <p className="text-text-dark text-sm mt-2 text-center">Your current avatar</p>
                </div>

                <div className="grid grid-cols-4 gap-4 max-h-60 overflow-y-auto custom-scrollbar p-2">
                  {AVATAR_URLS.map((url, index) => (
                    <img
                      key={index}
                      src={url}
                      alt={`Avatar ${index + 1}`}
                      className={`w-16 h-16 rounded-full object-cover cursor-pointer border-2 transition transform hover:scale-110 hover:border-purple-500 hover:shadow-lg hover:shadow-purple-600 ${user.photoURL === url ? 'border-purple-500 shadow-lg' : 'border-accent-color'}`}
                      onClick={() => handleSelectAvatar(url)}
                      onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/64x64/333/FFF?text=X"; }}
                    />
                  ))}
                </div>

                {profileUpdateMessage && (
                  <p className={`mt-4 text-center text-sm ${profileUpdateMessage.includes("Error") ? 'text-highlight-color' : 'text-green-400'}`}>
                    {profileUpdateMessage}
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </main>
  );
}