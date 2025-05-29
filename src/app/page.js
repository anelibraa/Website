// app/page.js
"use client";

import { useState, useEffect } from "react";
import { auth } from "./firebase-config";
import { onAuthStateChanged, signOut, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";

// Import your components
import Header from "./components/Header";
import ContinueWatching from "./components/ContinueWatching";
import PopularManga from "./components/PopularManga";
import RankingSidebar from "./components/RankingSidebar";
import MoreManga from "./components/MoreManga";


// Define a list of sample avatar URLs
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
  // State variables for user authentication and UI
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState(""); // For auth errors
  const [isLogin, setIsLogin] = useState(true); // true for login mode, false for signup mode
  const [showAuthModal, setShowAuthModal] = useState(false); // State for modal visibility
  const [profileUpdateMessage, setProfileUpdateMessage] = useState(""); // Message for profile update success/error

  // Effect hook to listen for Firebase authentication state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      // Automatically close modal and clear inputs/errors if user logs in successfully
      if (currentUser && showAuthModal && isLogin) { // Only close if it was a login attempt
        setShowAuthModal(false);
        setEmail("");
        setPassword("");
        setErrorMsg("");
      }
    });
    return () => unsubscribe();
  }, [showAuthModal, isLogin]);

  // Effect to load the Jotform chatbot script
  useEffect(() => {
    const scriptId = 'jotform-chatbot-script';
    // Check if the script is already loaded to prevent duplicates
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://cdn.jotfor.ms/agent/embedjs/0196d537c72c7231803833cad4c06bb15c03/embed.js?skipWelcome=1&maximizable=1';
      script.async = true; // Load script asynchronously
      document.body.appendChild(script);

      // Optional: Cleanup function to remove the script when the component unmounts
      return () => {
        if (document.getElementById(scriptId)) {
          document.body.removeChild(script);
        }
      };
    }
  }, []); // Empty dependency array ensures this runs only once on mount


  // Toggles between login and signup modes within the modal
  const toggleMode = () => {
    setErrorMsg(""); // Clear any previous auth error messages
    setIsLogin(!isLogin); // Toggle the mode
  };

  // Handles user authentication (login or signup)
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

  // Function to open the auth modal for login/signup
  const handleOpenLoginModal = () => {
    setIsLogin(true); // Default to login mode when opening
    setEmail(""); // Clear inputs
    setPassword("");
    setErrorMsg(""); // Clear auth errors
    setProfileUpdateMessage(""); // Clear profile update messages
    setShowAuthModal(true);
  };

  // Function to open the auth modal specifically for profile picture update
  const handleOpenProfilePictureModal = () => {
    if (!user) {
      handleOpenLoginModal();
      return;
    }
    setIsLogin(false); // Ensure modal doesn't show login/signup form (it will show avatar selection)
    setEmail("");
    setPassword("");
    setErrorMsg("");
    setProfileUpdateMessage("");
    setShowAuthModal(true);
  };

  // Function to close the auth modal
  const handleCloseAuthModal = () => {
    setShowAuthModal(false);
    setEmail(""); // Clear inputs when closing
    setPassword("");
    setErrorMsg(""); // Clear auth errors
    setProfileUpdateMessage(""); // Clear profile update messages
  };

  // Handles selecting an avatar and updating user profile
  const handleSelectAvatar = async (avatarUrl) => {
    if (!user) {
      setProfileUpdateMessage("Error: Not logged in.");
      return;
    }

    setProfileUpdateMessage("Updating profile...");
    try {
      await updateProfile(user, { photoURL: avatarUrl });
      // Update local user state to reflect the new photoURL
      setUser({ ...user, photoURL: avatarUrl });
      setProfileUpdateMessage("Profile picture updated successfully!");
      // Optionally close modal after successful update
      setTimeout(() => {
        handleCloseAuthModal();
      }, 1000); // Close after 1 second
    } catch (error) {
      console.error("Error updating profile picture:", error);
      setProfileUpdateMessage(`Failed to update picture: ${error.message}`);
    }
  };


  return (
    <main className="bg-gray-900 min-h-screen text-white p-6 flex flex-col items-center font-inter">
      <Header
        onLoginClick={handleOpenLoginModal}
        onUpdateProfilePictureClick={handleOpenProfilePictureModal}
      />

      <div className="w-full max-w-7xl flex flex-col md:flex-row justify-between gap-8 mt-8">
        <div className="flex-1 flex flex-col gap-8">
          <PopularManga />
          <MoreManga />
          <ContinueWatching />
        </div>

        <div className="w-full md:w-56">
          <RankingSidebar />
        </div>
      </div>

      {/* Authentication/Profile Picture Modal (conditionally rendered) */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-md relative border border-gray-700">
            <button
              onClick={handleCloseAuthModal}
              className="absolute top-3 right-3 text-gray-400 hover:text-white text-2xl font-bold"
              aria-label="Close modal"
            >
              &times;
            </button>

            {!user ? (
              <>
                <h2 className="text-3xl font-bold mb-6 text-center text-blue-400">
                  {isLogin ? "Login" : "Sign Up"}
                </h2>
                {errorMsg && <p className="text-red-400 mb-4 text-center text-sm">{errorMsg}</p>}
                <input
                  type="email"
                  placeholder="Email"
                  className="w-full mb-4 p-3 rounded-md bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <input
                  type="password"
                  placeholder="Password"
                  className="w-full mb-6 p-3 rounded-md bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  onClick={handleAuth}
                  className="w-full bg-blue-600 py-3 rounded-md hover:bg-blue-700 transition duration-300 font-semibold text-lg shadow-md"
                >
                  {isLogin ? "Login" : "Sign Up"}
                </button>
                <button
                  onClick={toggleMode}
                  className="mt-5 text-sm underline text-gray-400 hover:text-gray-200 transition duration-300 block text-center"
                >
                  {isLogin ? "Don't have an account? Create one!" : "Already have an account? Login here."}
                </button>
              </>
            ) : (
              <>
                <h2 className="text-3xl font-bold mb-6 text-blue-400 text-center">Choose Your Avatar</h2>

                <div className="mb-6">
                  <img
                    src={user.photoURL || "https://placehold.co/100x100/333/FFF?text=U"}
                    alt="Current Avatar"
                    className="w-24 h-24 rounded-full object-cover mx-auto border-4 border-blue-500 shadow-lg"
                  />
                  <p className="text-gray-400 text-sm mt-2">Your current avatar</p>
                </div>

                <div className="grid grid-cols-4 gap-4 max-h-60 overflow-y-auto custom-scrollbar p-2">
                  {AVATAR_URLS.map((url, index) => (
                    <img
                      key={index}
                      src={url}
                      alt={`Avatar ${index + 1}`}
                      className={`w-16 h-16 rounded-full object-cover cursor-pointer border-2 transition transform hover:scale-110 ${user.photoURL === url ? 'border-green-500 shadow-lg' : 'border-gray-600'}`}
                      onClick={() => handleSelectAvatar(url)}
                      onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/64x64/333/FFF?text=X"; }}
                    />
                  ))}
                </div>

                {profileUpdateMessage && (
                  <p className={`mt-4 text-center text-sm ${profileUpdateMessage.includes("Error") ? 'text-red-400' : 'text-green-400'}`}>
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