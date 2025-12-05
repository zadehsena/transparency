// src/components/AuthButtons.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import SignupModal from "./SignupModal";
import LoginModal from "./LoginModal";
import { listenAuthModal } from "@/lib/authModal";

export default function AuthButtons() {
  const { status } = useSession();
  const [modal, setModal] = useState<"login" | "signup" | null>(null);

  // Listen for global openAuthModal("login" | "signup")
  useEffect(() => {
    return listenAuthModal((mode) => setModal(mode));
  }, []);

  if (status === "authenticated") {
    return (
      <>
        <div className="flex gap-3">
          <Link
            href="/profile"
            className="
    inline-flex items-center rounded-lg border border-gray-900
    px-3 py-1.5 text-xs
    sm:px-4 sm:py-2 sm:text-sm
    text-gray-900 transition-colors hover:bg-gray-900 hover:text-white
  "
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

        {/* Allow global modal opens even while authed (optional) */}
        {modal === "login" && (
          <LoginModal
            onClose={() => setModal(null)}
            onRequestSignup={() => setModal("signup")}
          />
        )}
        {modal === "signup" && (
          <SignupModal
            onClose={() => setModal(null)}
            onRequestLogin={() => setModal("login")}
          />
        )}
      </>
    );
  }

  // Logged out
  // Logged out
  return (
    <>
      <div className="flex gap-2">
        <button
          onClick={() => setModal("login")}
          className="
    inline-flex items-center rounded-lg border border-gray-900
    px-3 py-1.5 text-xs
    sm:px-4 sm:py-2 sm:text-sm
    font-medium text-gray-900
    transition-colors hover:bg-gray-900 hover:text-white
  "
        >
          Log in
        </button>
      </div>

      {/* Modals */}
      {modal === "login" && (
        <LoginModal
          onClose={() => setModal(null)}
          onRequestSignup={() => setModal("signup")}
        />
      )}
      {modal === "signup" && (
        <SignupModal
          onClose={() => setModal(null)}
          onRequestLogin={() => setModal("login")}
        />
      )}
    </>
  );
}
