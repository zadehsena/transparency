export default function HomePage() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-20">
      <div className="grid items-center gap-12 md:grid-cols-2">
        <div>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Job applications shouldn’t vanish into the void.
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            Transparency shows real response rates by company and role. Track your apps,
            see who replies, and stop guessing.
          </p>
          <div className="mt-8 flex gap-3">
            <a href="/signup" className="rounded-lg bg-black px-5 py-3 text-white hover:bg-gray-900">
              Get started
            </a>
            <a href="/login" className="rounded-lg border px-5 py-3 hover:bg-gray-50">
              Log in
            </a>
          </div>
          <p className="mt-3 text-sm text-gray-500">No credit card. Free to try.</p>
        </div>

        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <div className="text-sm text-gray-500">Example metric</div>
          <div className="mt-2 text-3xl font-semibold">Company X • Frontend Engineer</div>
          <ul className="mt-6 space-y-3">
            <li className="flex items-center justify-between">
              <span className="text-gray-600">Auto‑acknowledge in</span>
              <span className="font-medium">2.1 hrs</span>
            </li>
            <li className="flex items-center justify-between">
              <span className="text-gray-600">First human reply</span>
              <span className="font-medium">5.3 days</span>
            </li>
            <li className="flex items-center justify-between">
              <span className="text-gray-600">Interview rate</span>
              <span className="font-medium">18%</span>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
