import "./globals.css";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Transparency",
  description: "Job listings with real response rates.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900 antialiased">
        <header className="border-b bg-white">
          <nav className="mx-auto flex max-w-6xl items-center justify-between p-4">
            {/* Link to home */}
            <Link href="/" className="text-xl font-semibold hover:opacity-80">
              Transparency
            </Link>
            <div className="hidden gap-3 sm:flex">
              <Link href="/login" className="rounded-lg border px-4 py-2 hover:bg-gray-50">
                Log in
              </Link>
              <Link
                href="/signup"
                className="rounded-lg bg-black px-4 py-2 text-white hover:bg-gray-900"
              >
                Sign up
              </Link>
            </div>
          </nav>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
