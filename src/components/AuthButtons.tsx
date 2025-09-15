"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import SignupModal from "./SignupModal";
import LoginModal from "./LoginModal"; // ← add this

export default function AuthButtons() {
  const { status } = useSession();
  const [showSignup, setShowSignup] = useState(false);
  const [showLogin, setShowLogin] = useState(false); // ← add this

  if (status === "authenticated") {
    return (
      <div className="hidden gap-3 sm:flex">
        <Link
          href="/profile"
          className="inline-flex items-center rounded-lg border border-gray-900 px-4 py-2 text-gray-900 transition-colors hover:bg-gray-900 hover:text-white"
        >
          Profile
        </Link>
        <button
          className="rounded-lg bg-black px-4 py-2 text-white hover:bg-gray-900"
          onClick={() => signOut({ callbackUrl: "/" })}
        >
          Sign out
        </button>
      </div>
    );
  }

  // Logged out
  return (
    <div className="hidden gap-3 sm:flex">
      {/* Open Login modal instead of navigating to /login */}
      <button
        onClick={() => setShowLogin(true)}
        className="inline-flex items-center rounded-lg border border-gray-900 px-4 py-2 text-gray-900 transition-colors hover:bg-gray-900 hover:text-white"
      >
        Log In
      </button>

      {/* Open Signup modal */}
      <button
        onClick={() => setShowSignup(true)}
        className="rounded-lg bg-black px-4 py-2 text-white hover:bg-gray-900"
      >
        Sign up
      </button>

      {/* Modals */}
      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
      {showSignup && <SignupModal onClose={() => setShowSignup(false)} />}
    </div>
  );
}
