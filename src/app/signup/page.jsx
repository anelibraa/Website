'use client';

import { useState } from 'react';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  GoogleAuthProvider,
  TwitterAuthProvider,
} from 'firebase/auth';
import { app } from '../firebase-config';
import { FcGoogle } from 'react-icons/fc';
import { FaApple, FaTwitter } from 'react-icons/fa';

export default function AuthForm() {
  const [isSignup, setIsSignup] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [isHumanVerified, setIsHumanVerified] = useState(false);

  const auth = getAuth(app);
  const googleProvider = new GoogleAuthProvider();
  const twitterProvider = new TwitterAuthProvider();

  const handleAuth = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!isHumanVerified) {
      setError('Please verify that you are human.');
      return;
    }

    try {
      if (isSignup) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        setMessage(`Signup successful! Welcome, ${userCredential.user.email}`);
        setUserEmail(userCredential.user.email);
      } else {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        setMessage(`Login successful! Welcome back, ${userCredential.user.email}`);
        setUserEmail(userCredential.user.email);
      }
      setIsLoggedIn(true);
      setEmail('');
      setPassword('');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleOAuthLogin = async (provider) => {
    setError('');
    setMessage('');

    if (!isHumanVerified) {
      setError('Please verify that you are human.');
      return;
    }

    try {
      const result = await signInWithPopup(auth, provider);
      setUserEmail(result.user.email || result.user.displayName);
      setIsLoggedIn(true);
      setMessage(`Logged in as ${result.user.displayName || result.user.email}`);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
    setIsLoggedIn(false);
    setUserEmail('');
    setMessage('');
    setError('');
    setIsHumanVerified(false);
  };

  if (isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-white to-blue-50">
        <div className="text-center p-8 bg-white rounded-2xl shadow-2xl border border-gray-200">
          <h2 className="text-xl font-bold mb-4">App</h2>
          <p className="text-gray-700 mb-6">Welcome {userEmail}!</p>
          <p className="text-gray-700 mb-6">You are now logged in. 🎉</p>
          <button
            onClick={handleSignOut}
            className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg shadow-md transition"
          >
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-white to-blue-50 px-4">
      <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-2xl border border-gray-200">
        <div className="flex mb-6 transition">
          <button
            onClick={() => setIsSignup(true)}
            className={`flex-1 py-2 font-semibold rounded-l-xl transition ${isSignup ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            Sign Up
          </button>
          <button
            onClick={() => setIsSignup(false)}
            className={`flex-1 py-2 font-semibold rounded-r-xl transition ${!isSignup ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            Log In
          </button>
        </div>

        <form onSubmit={handleAuth} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              checked={isHumanVerified}
              onChange={() => setIsHumanVerified(!isHumanVerified)}
              className="mr-2"
            />
            <label className="text-sm font-medium text-gray-700">I'm not a robot</label>
          </div>

          <button
            type="submit"
            className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition"
          >
            {isSignup ? 'Create Account' : 'Log In'}
          </button>
        </form>

        <div className="my-6 text-center text-gray-400">or continue with</div>

        <div className="flex justify-center gap-4">
          <button
            onClick={() => handleOAuthLogin(googleProvider)}
            className="flex items-center gap-2 px-4 py-2 bg-white border rounded-lg shadow-sm hover:shadow-md transition"
          >
            <FcGoogle size={20} />
            <span className="text-sm font-medium text-gray-700">Google</span>
          </button>

          <button
            onClick={() => alert('Apple login requires setup via Apple Developer account.')}
            className="flex items-center gap-2 px-4 py-2 bg-white border rounded-lg shadow-sm hover:shadow-md transition"
          >
            <FaApple size={20} className="text-black" />
            <span className="text-sm font-medium text-gray-700">Apple</span>
          </button>

          <button
            onClick={() => handleOAuthLogin(twitterProvider)}
            className="flex items-center gap-2 px-4 py-2 bg-white border rounded-lg shadow-sm hover:shadow-md transition"
          >
            <FaTwitter size={20} className="text-sky-500" />
            <span className="text-sm font-medium text-gray-700">Twitter</span>
          </button>
        </div>

        {error && <p className="mt-4 text-sm text-red-500 text-center">{error}</p>}
        {message && <p className="mt-4 text-sm text-green-600 text-center">{message}</p>}
      </div>
    </div>
  );
}
