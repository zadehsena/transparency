// src/app/applications/page.tsx
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function ApplicationsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return (
      <section className="mx-auto max-w-xl p-8">
        <p className="mb-4">Please log in to view your applications.</p>
        <Link href="/login" className="underline">
          Log In
        </Link>
      </section>
    );
  }

  // Load the logged-in user's applications (server-side)
  const res = await fetch(`${process.env.NEXTAUTH_URL}/api/applications`, {
    cache: "no-store",
  });
  if (!res.ok) {
    return (
      <section className="mx-auto max-w-xl p-8">
        <p className="text-red-600">Failed to load applications.</p>
      </section>
    );
  }
  const data = await res.json();
  const apps = (data.applications || []) as Array<{
    id: string;
    status: string;
    job?: { title?: string; company?: string; location?: string; url?: string };
  }>;

  // Server action to change status
  async function changeStatus(formData: FormData) {
    "use server";
    const id = String(formData.get("id") || "");
    const status = String(formData.get("status") || "");
    if (!id || !status) return;
    await fetch(`${process.env.NEXTAUTH_URL}/api/applications/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
      cache: "no-store",
    });
    // Let Next re-render with fresh data after PATCH
  }

  return (
    <section className="mx-auto max-w-4xl p-6">
      <h1 className="mb-6 text-2xl font-semibold">Your applications</h1>

      {apps.length === 0 ? (
        <div className="rounded-2xl border bg-white p-4 text-gray-600">
          No applications yet.{" "}
          <Link className="underline" href="/jobs">
            Find a job
          </Link>
        </div>
      ) : (
        <ul className="mt-2 divide-y rounded-2xl border bg-white">
          {apps.map((a) => (
            <li key={a.id} className="flex items-center justify-between gap-4 p-4">
              <div>
                <div className="font-medium">
                  {a.job?.title} @ {a.job?.company}
                </div>
                <div className="text-sm text-gray-600">{a.job?.location}</div>
              </div>

              <div className="flex items-center gap-3">
                {a.job?.url && (
                  <Link
                    href={a.job.url}
                    target="_blank"
                    className="text-sm underline"
                  >
                    View Job
                  </Link>
                )}

                <form action={changeStatus} className="flex items-center gap-2">
                  <input type="hidden" name="id" value={a.id} />
                  <select
                    name="status"
                    defaultValue={a.status}
                    className="rounded border px-2 py-1 text-sm"
                  >
                    <option value="applied">Applied</option>
                    <option value="interview">Interview</option>
                    <option value="offer">Offer</option>
                    <option value="rejected">Rejected</option>
                  </select>
                  <button
                    type="submit"
                    className="rounded bg-black px-3 py-1 text-sm text-white hover:bg-gray-900"
                  >
                    Save
                  </button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
