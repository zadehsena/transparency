"use client";

import JobCard, { type JobCardJob, type JobCardStats } from "@/components/JobCard";

export type CompanyApplication = {
    id: string;
    status: string;               // enum from Prisma
    appliedAt: string;            // ISO string
    job: {
        id: string;
        title: string;
        location: string | null;
        postedAt: string;
        url?: string | null;
    };
};

export default function CompanyMyApplications({
    applications,
}: {
    applications: CompanyApplication[];
}) {
    if (!applications.length) {
        return (
            <div className="rounded-xl border bg-white p-6 text-gray-600 shadow-sm dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300">
                You haven’t applied to any roles at this company yet.
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {applications.map((app) => {
                const { job } = app;

                const cardJob: JobCardJob = {
                    id: job.id,
                    title: job.title,
                    location: job.location ?? "—",
                    postedAt: job.postedAt,
                    url: job.url ?? undefined,
                    companyName: null, // we are already inside the company page
                };

                const stats: JobCardStats = null; // hide job stats for application history

                const appliedPretty = new Date(app.appliedAt).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                });

                return (
                    <div key={app.id} className="space-y-1">
                        <JobCard job={cardJob} stats={stats} isAuthed={true} />

                        {/* Status + applied date row */}
                        <div className="ml-2 mt-1 flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                            <span className="rounded-md bg-gray-800/20 px-2 py-0.5 text-gray-300 capitalize">
                                {app.status.replace("_", " ")}
                            </span>
                            <span>•</span>
                            <span>Applied {appliedPretty}</span>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
