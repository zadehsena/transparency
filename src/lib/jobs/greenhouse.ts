export type RawGreenhouseJob = {
  id: number;
  title: string;
  absolute_url: string;
  updated_at?: string;
  created_at?: string;
  location?: { name?: string };
  departments?: { id: number; name: string }[];
  metadata?: { name: string; value: string }[];
  content?: string;
};

export async function fetchGreenhouse(boardToken: string) {
  const res = await fetch(`https://boards-api.greenhouse.io/v1/boards/${boardToken}/jobs?content=true`, { next: { revalidate: 300 } });
  if (!res.ok) throw new Error(`Greenhouse fetch failed: ${res.status}`);
  const data = await res.json();
  const jobs = (data.jobs || []) as RawGreenhouseJob[];
  return jobs.map(j => ({
    externalId: String(j.id),
    title: j.title,
    location: j.location?.name || '',
    url: j.absolute_url,
    postedAt: j.updated_at || j.created_at || new Date().toISOString(),
    unit: j.departments?.[0]?.name,
  }));
}
