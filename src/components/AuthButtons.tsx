"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export default function AuthButtons() {
  const { status } = useSession();

  if (status === "authenticated") {
    return (
      <div className="hidden gap-3 sm:flex">
        <Link href="/profile" className="inline-flex items-center rounded-lg border border-gray-900 px-4 py-2 text-gray-900 hover:bg-gray-900 hover:text-white focus:outline-none focus:ring-2 focus:ring-gray-900/20 transition-colors">
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
      <Link href="/login" className="inline-flex items-center rounded-lg border border-gray-900 px-4 py-2 text-gray-900 hover:bg-gray-900 hover:text-white focus:outline-none focus:ring-2 focus:ring-gray-900/20 transition-colors">
        Log In
      </Link>
      <Link href="/signup" className="rounded-lg bg-black px-4 py-2 text-white hover:bg-gray-900">
        Sign up
      </Link>
    </div>
  );
}
