import "./globals.css";
import type { Metadata } from "next";
import Link from "next/link";
import Providers from "@/components/Providers";
import AuthButtons from "@/components/AuthButtons";
import HeaderSearch from "@/components/HeaderSearch"; // new

export const metadata: Metadata = {
  title: "Transparency",
  description: "Job listings with real response rates.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      {/* CHANGED: make body a flex column so footer can stick to bottom */}
      <body className="flex min-h-screen flex-col bg-gray-50 text-gray-900 antialiased">
        <Providers>
          <header className="border-b bg-white">
            <nav className="mx-auto flex max-w-6xl items-center justify-between gap-4 p-4">
              <Link href="/" className="text-xl font-semibold text-black hover:opacity-80">
                Transparency
              </Link>

              {/* Search Bar */}
              <div className="flex-1 max-w-xl">
                <HeaderSearch />
              </div>

              <div className="flex items-center gap-3">
                <Link
                  href="/jobs"
                  className="rounded-lg border px-4 py-2 hover:bg-gray-50"
                >
                  Jobs
                </Link>
                <AuthButtons />
              </div>
            </nav>
          </header>

          <main className="flex-1">{children}</main>
          
          <footer className="border-t bg-white">
            <div className="mx-auto max-w-6xl px-4 py-6 text-sm text-gray-500 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>© {new Date().getFullYear()} Transparency</div>
              <div className="flex gap-4">
                <Link href="/about" className="hover:text-gray-700">About</Link>
                <Link href="/privacy" className="hover:text-gray-700">Privacy</Link>
                <Link href="/contact" className="hover:text-gray-700">Contact</Link>
              </div>
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
