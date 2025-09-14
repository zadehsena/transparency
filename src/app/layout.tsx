import "./globals.css";
import type { Metadata } from "next";
import Link from "next/link";
import Providers from "@/components/Providers";
import AuthButtons from "@/components/AuthButtons";
import HeaderSearch from "@/components/HeaderSearch"; // new

export const metadata: Metadata = {
  title: "Transparency",
  description: "Job listings with real response rates.",
  icons: {
    icon: "/images/void.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
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
                  className="inline-flex items-center rounded-lg border border-gray-900 px-4 py-2 text-gray-900 hover:bg-gray-900 hover:text-white focus:outline-none focus:ring-2 focus:ring-gray-900/20 transition-colors"
                >
                  Jobs
                </Link>
                <AuthButtons />
              </div>
            </nav>
          </header>

          <main className="flex-1">{children}</main>

          <footer className="border-t bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:bg-gray-900/80 dark:border-gray-800">
            <div className="mx-auto max-w-6xl px-4 py-10">
              <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4">
                {/* Brand */}
                <div>
                  <Link href="/" className="text-lg font-semibold text-black dark:text-white">
                    Transparency
                  </Link>
                  <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
                    Job listings with real response rates. Track your apps and see who replies.
                  </p>
                </div>

                {/* Product */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Product</h3>
                  <ul className="mt-3 space-y-2 text-sm">
                    <li><Link href="/jobs" className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200">Jobs</Link></li>
                    <li><Link href="/applications" className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200">Your applications</Link></li>
                  </ul>
                </div>

                {/* Company */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Company</h3>
                  <ul className="mt-3 space-y-2 text-sm">
                    <li><Link href="/about" className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200">About</Link></li>
                    <li><Link href="/contact" className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200">Contact</Link></li>
                  </ul>
                </div>

                {/* Legal & Social */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Legal</h3>
                  <ul className="mt-3 space-y-2 text-sm">
                    <li><Link href="/privacy" className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200">Privacy</Link></li>
                    <li><Link href="/terms" className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200">Terms</Link></li>
                  </ul>

                  <div className="mt-4 flex items-center gap-4">
                    <a
                      href="https://github.com/zadehsena/transparency"
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="GitHub"
                      className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                      title="GitHub"
                    >
                      {/* GitHub icon */}
                      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M12 2C6.48 2 2 6.58 2 12.25c0 4.51 2.87 8.33 6.84 9.68.5.1.68-.22.68-.48 0-.24-.01-.87-.01-1.7-2.78.62-3.37-1.37-3.37-1.37-.45-1.18-1.11-1.49-1.11-1.49-.91-.64.07-.63.07-.63 1 .07 1.54 1.06 1.54 1.06 .9 1.58 2.37 1.12 2.95.85.09-.68.35-1.12.63-1.38-2.22-.26-4.56-1.14-4.56-5.09 0-1.12.39-2.04 1.03-2.76-.1-.26-.45-1.31.1-2.73 0 0 .85-.28 2.79 1.05A9.36 9.36 0 0 1 12 7.5c.86 0 1.73.12 2.54.36 1.93-1.33 2.78-1.05 2.78-1.05 .56 1.42.21 2.47.1 2.73.64.72 1.03 1.64 1.03 2.76 0 3.96-2.34 4.82-4.57 5.07.36.32.68.94.68 1.9 0 1.37-.01 2.47-.01 2.81 0 .26.18.59.69.48A10 10 0 0 0 22 12.25C22 6.58 17.52 2 12 2z" clipRule="evenodd" />
                      </svg>
                    </a>
                    <a
                      href="https://x.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Twitter"
                      className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                      title="Twitter / X"
                    >
                      {/* X icon */}
                      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
                        <path d="M18.244 2H21l-6.66 7.62L22 22h-6.9l-4.5-5.9L4.5 22H2l7.44-8.52L2 2h6.9l4.14 5.44L18.244 2Zm-2.42 18h2.14L8.27 4H6.13l9.694 16Z" />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Slim legal bar */}
            <div className="border-t bg-gray-50/70 dark:bg-gray-950/60 dark:border-gray-800">
              <div className="mx-auto max-w-6xl px-4 py-4 text-xs text-gray-500 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <span>© {new Date().getFullYear()} Transparency. All rights reserved.</span>
                <span className="flex gap-4">
                  <Link href="/cookies" className="hover:text-gray-700 dark:hover:text-gray-300">Cookies</Link>
                  <Link href="/privacy" className="hover:text-gray-700 dark:hover:text-gray-300">Privacy</Link>
                  <Link href="/terms" className="hover:text-gray-700 dark:hover:text-gray-300">Terms</Link>
                </span>
              </div>
            </div>
          </footer>

        </Providers>
      </body>
    </html>
  );
}
