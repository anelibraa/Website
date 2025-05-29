"use client";

import React, { useEffect, useState, useRef } from "react";
import { auth } from "../firebase-config";
import { onAuthStateChanged, signOut } from "firebase/auth";

export default function Header({ onLoginClick, onUpdateProfilePictureClick }) {
  const [user, setUser] = useState(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef(null);

  // Effect to listen for Firebase authentication state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      // Close menu if user logs out
      if (!currentUser) {
        setShowUserMenu(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // Effect to handle clicks outside the user menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };

    if (showUserMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showUserMenu]);

  // Handles user logout directly within Header
  const handleLogout = async () => {
    try {
      await signOut(auth);
      console.log("User logged out successfully.");
      setShowUserMenu(false); // Close menu after logout
    } catch (error) {
      console.error("Error logging out:", error.message);
    }
  };

  // Toggles the user menu visibility
  const toggleUserMenu = () => {
    setShowUserMenu(!showUserMenu);
  };

  return (
    <header className="flex flex-col sm:flex-row justify-between items-center w-full max-w-7xl p-4 bg-gray-800 text-white rounded-lg shadow-lg mb-8">
      <h1 className="text-3xl font-extrabold cursor-pointer text-blue-400 mb-4 sm:mb-0">
        MangaVerse
      </h1>

      <div className="text-center sm:text-right relative">
        {user ? (
          <div className="flex items-center space-x-3 cursor-pointer" onClick={toggleUserMenu}>
            <img
              src={user.photoURL || "https://placehold.co/40x40/333/FFF?text=U"}
              alt="Profile"
              className="w-10 h-10 rounded-full object-cover border-2 border-blue-400"
            />
            <span className="text-lg font-medium text-gray-300">
              Welcome, <span className="font-bold text-blue-300">{user.email.split('@')[0]}</span>!
            </span>
            <svg
              className={`w-4 h-4 ml-1 transform transition-transform duration-200 ${showUserMenu ? 'rotate-180' : 'rotate-0'}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
            </svg>

            {/* User Menu Dropdown */}
            {showUserMenu && (
              <div
                ref={menuRef}
                className="absolute right-0 mt-2 w-48 bg-gray-700 rounded-md shadow-lg py-1 z-10 top-full"
              >
                <button
                  onClick={(e) => { // Added event parameter 'e'
                    e.stopPropagation(); // STOP PROPAGATION HERE
                    onUpdateProfilePictureClick(); // Call prop to open profile picture modal
                    setShowUserMenu(false); // Close menu
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-gray-600"
                >
                  Update Profile Picture
                </button>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-sm text-red-300 hover:bg-gray-600"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={onLoginClick}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md transition duration-300 shadow-md"
          >
            Login / Sign Up
          </button>
        )}
      </div>
    </header>
  );
}
