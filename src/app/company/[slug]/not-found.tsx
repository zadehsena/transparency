import Link from "next/link";

export default function CompanyNotFound() {
  return (
    <div className="mx-auto max-w-3xl p-8 text-center">
      <h1 className="text-2xl font-semibold">Company not found</h1>
      <p className="mt-2 text-gray-600">We couldn’t find that company. Try another search.</p>
      <Link href="/" className="mt-6 inline-block rounded-lg border px-4 py-2 hover:bg-gray-50">
        Back home
      </Link>
    </div>
  );
}
