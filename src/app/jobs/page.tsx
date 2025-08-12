import { PrismaClient } from "@prisma/client";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";

const prisma = new PrismaClient();

export default async function JobsPage() {
  const jobs = await prisma.job.findMany({
    orderBy: { postedAt: "desc" },
  });

  const session = await getServerSession(authOptions);

  return (
    <section className="mx-auto max-w-4xl p-8">
      <h1 className="text-2xl font-bold mb-6">Job Listings</h1>
      {jobs.length === 0 ? (
        <p>No jobs available right now.</p>
      ) : (
        <ul className="space-y-4">
          {jobs.map((job) => (
            <li
              key={job.id}
              className="border rounded-lg p-4 hover:shadow-md transition"
            >
              <h2 className="text-lg font-semibold">{job.title}</h2>
              <p className="text-sm text-gray-600">
                {job.company} — {job.location}
              </p>
              {job.url && (
                <Link
                  href={job.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline text-sm"
                >
                  View Job Posting
                </Link>
              )}

              <form
                action={
                  session
                    ? async () => {
                        "use server";
                        await fetch("/api/applications", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ jobId: job.id }),
                        });
                      }
                    : `/login`
                }
              >
                <button
                  type="submit"
                  className="mt-3 inline-block rounded bg-black px-4 py-2 text-white hover:bg-gray-900"
                >
                  Apply
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
