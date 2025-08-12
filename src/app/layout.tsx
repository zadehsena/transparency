import "./globals.css";
import type { Metadata } from "next";
import Link from "next/link";
import Providers from "@/components/Providers";
import AuthButtons from "@/components/AuthButtons";

export const metadata: Metadata = {
  title: "Transparency",
  description: "Job listings with real response rates.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900 antialiased">
        <Providers>
          <header className="border-b bg-white">
            <nav className="mx-auto flex max-w-6xl items-center justify-between p-4">
              <Link href="/" className="text-xl font-semibold hover:opacity-80">
                Transparency
              </Link>
              <AuthButtons />
            </nav>
          </header>
          <main>{children}</main>
        </Providers>
      </body>
    </html>
  );
}
