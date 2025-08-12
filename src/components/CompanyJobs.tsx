export type Job = {
  id: string;
  title: string;
  location: string;
  postedAt: string; // ISO date
  url: string;
  unit?: string;
};

export default function CompanyJobs({ jobs }: { jobs: Job[] }) {
  if (!jobs?.length) {
    return (
      <div className="rounded-lg border bg-white p-6 text-sm text-gray-600">
        No active listings right now.
      </div>
    );
  }

  return (
    <div className="divide-y rounded-lg border bg-white">
      {jobs.map((j) => (
        <a
          key={j.id}
          href={j.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block p-4 hover:bg-gray-50"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">{j.title}</div>
              <div className="text-sm text-gray-600">
                {j.location} {j.unit ? `• ${j.unit}` : ""}
              </div>
            </div>
            <div className="text-xs text-gray-500">
              {new Date(j.postedAt).toLocaleDateString()}
            </div>
          </div>
        </a>
      ))}
    </div>
  );
}
