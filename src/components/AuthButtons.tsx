"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export default function AuthButtons() {
  const { status } = useSession();

  if (status === "authenticated") {
    return (
      <div className="hidden gap-3 sm:flex">
        <Link href="/profile" className="rounded-lg border px-4 py-2 hover:bg-gray-50">
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
      <Link href="/login" className="rounded-lg border px-4 py-2 hover:bg-gray-50">
        Log in
      </Link>
      <Link href="/signup" className="rounded-lg bg-black px-4 py-2 text-white hover:bg-gray-900">
        Sign up
      </Link>
    </div>
  );
}
