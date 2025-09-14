// src/lib/jobs/greenhouse.ts
export type RawGreenhouseJob = {
  id: number;
  title: string;
  absolute_url: string;
  updated_at?: string;
  created_at?: string;
  location?: { name?: string };
  departments?: { id: number; name: string }[];
  metadata?: { name: string; value: string }[];
};

function pickUnit(j: RawGreenhouseJob): string | undefined {
  // 1) department array
  if (j.departments?.length) return j.departments[0]?.name;

  // 2) metadata keys commonly used by companies
  const key = j.metadata?.find(m =>
    /^(team|department|org|business unit)$/i.test(m.name || "")
  );
  return key?.value || undefined;
}

async function ghFetch(url: string, attempt = 1): Promise<Response> {
  const res = await fetch(url, { cache: "no-store" });
  if (res.ok) return res;

  // retry on 429/5xx a couple times
  if ((res.status === 429 || res.status >= 500) && attempt < 3) {
    const delay = 250 * Math.pow(2, attempt - 1);
    await new Promise(r => setTimeout(r, delay));
    return ghFetch(url, attempt + 1);
  }
  return res; // let caller throw with status
}

export async function fetchGreenhouse(boardToken: string) {
  // Paginate to be safe: ?page=<n>&per_page=500 (max 500 allowed)
  const perPage = 500;
  let page = 1;
  const all: RawGreenhouseJob[] = [];

  while (true) {
    const url = `https://boards-api.greenhouse.io/v1/boards/${boardToken}/jobs?per_page=${perPage}&page=${page}`;
    const res = await ghFetch(url);
    if (!res.ok) throw new Error(`Greenhouse fetch failed: ${res.status}`);
    const data = (await res.json()) as { jobs?: RawGreenhouseJob[] };

    const batch = data.jobs ?? [];
    all.push(...batch);
    if (batch.length < perPage) break; // last page
    page++;
  }

  return all.map(j => ({
    externalId: String(j.id),
    title: j.title ?? "",
    location: j.location?.name || "",
    url: j.absolute_url,
    postedAt: j.updated_at || j.created_at || new Date().toISOString(),
    unit: pickUnit(j), // may be undefined -> default to "General" on insert
  }));
}
