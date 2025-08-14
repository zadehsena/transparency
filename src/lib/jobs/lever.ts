export type RawLeverJob = {
  id: string;
  text: string;
  hostedUrl: string;
  createdAt?: number;
  categories?: { location?: string; team?: string; commitment?: string };
  workplaceType?: string;
};

export async function fetchLever(companyHandle: string) {
  const res = await fetch(`https://api.lever.co/v0/postings/${companyHandle}?mode=json`, { next: { revalidate: 300 } });
  if (!res.ok) throw new Error(`Lever fetch failed: ${res.status}`);
  const jobs = (await res.json()) as RawLeverJob[];
  return jobs.map(j => ({
    externalId: j.id,
    title: j.text,
    location: j.categories?.location || '',
    url: j.hostedUrl,
    postedAt: j.createdAt ? new Date(j.createdAt).toISOString() : new Date().toISOString(),
    unit: j.categories?.team,
  }));
}
