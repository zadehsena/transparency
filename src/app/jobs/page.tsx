// src/app/jobs/page.tsx
import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { PrismaClient } from "@prisma/client";
import { authOptions } from "../api/auth/[...nextauth]/route";

const prisma = new PrismaClient();

export default async function JobsPage() {
  const [session, jobs] = await Promise.all([
    getServerSession(authOptions),
    prisma.job.findMany({ orderBy: { postedAt: "desc" } }),
  ]);

  // Which jobs has this user already applied to?
  const appliedIds = new Set<string>();
  if (session?.user?.email) {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });
    if (user) {
      const apps = await prisma.application.findMany({
        where: { userId: user.id },
        select: { jobId: true },
      });
      apps.forEach((a) => appliedIds.add(a.jobId));
    }
  }

  // Server action: create application or route to login
  async function applyAction(formData: FormData) {
    "use server";
    const jobId = String(formData.get("jobId") || "");
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) redirect("/login");

    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
      select: { id: true },
    });
    if (!user) redirect("/login");

    // prevent duplicate applications
    const existing = await prisma.application.findFirst({
      where: { userId: user.id, jobId },
    });
    if (!existing) {
      await prisma.application.create({
        data: { userId: user.id, jobId, status: "applied" },
      });
    }

    redirect("/applications");
  }

  return (
    <section className="mx-auto max-w-4xl p-8">
      <h1 className="mb-6 text-2xl font-bold">Job Listings</h1>

      {jobs.length === 0 ? (
        <p>No jobs available right now.</p>
      ) : (
        <ul className="space-y-4">
          {jobs.map((job) => {
            const alreadyApplied = appliedIds.has(job.id);
            return (
              <li key={job.id} className="rounded-lg border p-4 transition hover:shadow-md">
                <h2 className="text-lg font-semibold">{job.title}</h2>
                <p className="text-sm text-gray-600">
                  {job.company} — {job.location}
                </p>

                <div className="mt-3 flex gap-3">
                  {job.url && (
                    <Link
                      href={job.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-50"
                    >
                      View Job Posting
                    </Link>
                  )}

                  {alreadyApplied ? (
                    <Link
                      href="/applications"
                      className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-50"
                      title="You already applied to this job"
                    >
                      View application
                    </Link>
                  ) : (
                    <form action={applyAction}>
                      <input type="hidden" name="jobId" value={job.id} />
                      <button
                        type="submit"
                        className="rounded-lg bg-black px-4 py-2 text-sm text-white hover:bg-gray-900"
                        title={session ? "Record application" : "Log in to apply"}
                      >
                        Apply
                      </button>
                    </form>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
