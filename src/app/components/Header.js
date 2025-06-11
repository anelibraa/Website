// app/components/Header.js
"use client";

import React, { useEffect, useState, useRef } from "react";
import { auth } from "../firebase-config";
import { onAuthStateChanged, signOut } from "firebase/auth";
import Link from "next/link";
import { useRouter } from 'next/navigation';

export default function Header({ onLoginClick, onUpdateProfilePictureClick }) {
  const [user, setUser] = useState(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showSearchInput, setShowSearchInput] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showHamburgerMenu, setShowHamburgerMenu] = useState(false);

  const userMenuRef = useRef(null);
  const hamburgerMenuRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        setShowUserMenu(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // Effect to close user menu when clicking outside
  useEffect(() => {
    const handleClickOutsideUserMenu = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutsideUserMenu);
    return () => {
      document.removeEventListener("mousedown", handleClickOutsideUserMenu);
    };
  }, [showUserMenu]);

  // Effect to close hamburger menu when clicking outside AND not on the hamburger icon
  useEffect(() => {
    const handleClickOutsideHamburgerMenu = (event) => {
      if (hamburgerMenuRef.current && !hamburgerMenuRef.current.contains(event.target)) {
        const hamburgerButton = document.querySelector('[aria-label="Open menu"]');
        if (hamburgerButton && hamburgerButton.contains(event.target)) {
          return;
        }
        setShowHamburgerMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutsideHamburgerMenu);
    return () => {
      document.removeEventListener("mousedown", handleClickOutsideHamburgerMenu);
    };
  }, [showHamburgerMenu]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      console.log("User logged out successfully.");
      setShowUserMenu(false);
      setShowHamburgerMenu(false);
    } catch (error) {
      console.error("Error logging out:", error.message);
    }
  };

  const toggleUserMenu = () => {
    setShowUserMenu(!showUserMenu);
    setShowHamburgerMenu(false);
  };

  const toggleHamburgerMenu = () => {
    setShowHamburgerMenu(!showHamburgerMenu);
    setShowUserMenu(false);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      setShowSearchInput(false);
      setShowHamburgerMenu(false);
    } else {
      router.push(`/search`);
      setShowSearchInput(false);
      setShowHamburgerMenu(false);
    }
  };

  return (
    <header className="relative w-full bg-primary-bg py-4 px-6 flex justify-between items-center z-40 shadow-xl">
      {/* Left section: MangaVerse Logo */}
      <Link href="/" className="text-norime-text text-3xl font-extrabold tracking-wider hover:text-highlight-color transition-colors duration-200">
        MangaVerse
      </Link>

      {/* Right section: Search Icon, User/Login, Menu Icon */}
      <div className="flex items-center space-x-4">
        {/* Search Icon / Input */}
        <div className="relative">
          {showSearchInput ? (
            <form onSubmit={handleSearchSubmit} className="flex items-center">
              <input
                type="text"
                placeholder="Search..."
                className="bg-secondary-bg text-text-light border border-accent-color rounded-full py-2 px-4 focus:outline-none focus:ring-2 focus:ring-highlight-color w-40 sm:w-60"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                onBlur={() => {
                  if (!searchQuery) setShowSearchInput(false);
                }}
              />
              <button type="submit" className="ml-2 text-highlight-color hover:text-text-light transition-colors" aria-label="Submit search">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M15.5 14h-.79l-.28-.27C14.01 12.95 14.5 11.55 14.5 10c0-3.59-2.91-6.5-6.5-6.5S1.5 6.41 1.5 10s2.91 6.5 6.5 6.5c1.55 0 2.95-.49 4.03-1.33l.27.28v.79l5 4.99L20.49 19l-4.99-5zM8 14c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z"></path>
                </svg>
              </button>
            </form>
          ) : (
            <button
              onClick={() => setShowSearchInput(true)}
              className="text-text-light hover:text-highlight-color transition-colors"
              aria-label="Toggle search input"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M15.5 14h-.79l-.28-.27C14.01 12.95 14.5 11.55 14.5 10c0-3.59-2.91-6.5-6.5-6.5S1.5 6.41 1.5 10s2.91 6.5 6.5 6.5c1.55 0 2.95-.49 4.03-1.33l.27.28v.79l5 4.99L20.49 19l-4.99-5zM8 14c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z"></path>
              </svg>
            </button>
          )}
        </div>

        {/* User Profile / Login Button */}
        {user ? (
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={toggleUserMenu}
              className="flex items-center space-x-2 focus:outline-none"
              aria-label="User menu"
            >
              <img
                src={user.photoURL || "https://placehold.co/40x40/333/FFF?text=U"}
                alt="Profile"
                className="w-10 h-10 rounded-full object-cover border-2 border-highlight-color"
              />
              <span className="hidden sm:inline text-text-light font-medium">
                {user.email.split('@')[0]}
              </span>
              <svg
                className={`w-4 h-4 text-text-light transform transition-transform duration-200 ${showUserMenu ? 'rotate-180' : 'rotate-0'}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-3 w-48 bg-secondary-bg rounded-md shadow-lg py-1 z-50">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onUpdateProfilePictureClick();
                    setShowUserMenu(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-text-light hover:bg-accent-color transition-colors"
                >
                  Update Profile Picture
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLogout();
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-highlight-color hover:bg-accent-color transition-colors"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={onLoginClick}
            className="bg-highlight-color text-white font-semibold py-2 px-4 rounded-md transition duration-300 shadow-md text-sm hover:bg-[#FF80C0]"
          >
            Login / Sign Up
          </button>
        )}

        {/* Hamburger Menu Icon */}
        <button
          onClick={toggleHamburgerMenu}
          className="text-text-light hover:text-highlight-color transition-colors focus:outline-none"
          aria-label="Open menu"
        >
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
          </svg>
        </button>
      </div>

      {/* Hamburger Menu Sidebar */}
      <div
        ref={hamburgerMenuRef}
        className={`fixed top-0 right-0 h-full w-64 bg-primary-bg shadow-lg transform transition-transform duration-300 ease-in-out z-50
          ${showHamburgerMenu ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="p-6">
          <button
            onClick={toggleHamburgerMenu}
            className="absolute top-4 right-4 text-text-light hover:text-highlight-color text-3xl"
            aria-label="Close menu"
          >
            &times;
          </button>
          <h3 className="text-xl font-bold mb-6 text-norime-text mt-8">Menu</h3>
          <nav>
            <ul>
              {/* Upcoming Anime Link */}
              <li className="mb-3">
                <Link
                  href="/upcoming"
                  className="block text-text-light hover:bg-purple-500 transition-colors py-2 px-4 rounded-md"
                  onClick={toggleHamburgerMenu}
                >
                  Upcoming Anime
                </Link>
              </li>
              {/* Popular Anime Link */}
              <li className="mb-3">
                <Link
                  href="/popular"
                  className="block text-text-light hover:bg-purple-500 transition-colors py-2 px-4 rounded-md"
                  onClick={toggleHamburgerMenu}
                >
                  Popular Anime
                </Link>
              </li>
              {/* Top Rated Anime Link (New) */}
              <li className="mb-3">
                <Link
                  href="/top-rated" // Assuming you will create app/top-rated/page.js
                  className="block text-text-light hover:bg-purple-500 transition-colors py-2 px-4 rounded-md"
                  onClick={toggleHamburgerMenu}
                >
                  Top Rated Anime
                </Link>
              </li>
              {/* Ongoing Anime Link (New - distinct from other categories) */}
              <li className="mb-3">
                <Link
                  href="/ongoing" // Assuming you will create app/ongoing/page.js
                  className="block text-text-light hover:bg-purple-500 transition-colors py-2 px-4 rounded-md"
                  onClick={toggleHamburgerMenu}
                >
                  Ongoing Anime
                </Link>
              </li>
              {/* Search Anime Link */}
              <li className="mb-3">
                <Link
                  href="/search"
                  className="block text-text-light hover:bg-purple-500 transition-colors py-2 px-4 rounded-md"
                  onClick={toggleHamburgerMenu}
                >
                  Search Anime
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
}