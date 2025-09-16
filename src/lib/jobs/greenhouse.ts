// src/lib/jobs/greenhouse.ts
import { fetchWithTimeout } from "@/lib/http";
import type { JobCategory } from "@prisma/client";
import { categorizeJobTitle } from "./classify";

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
  if (j.departments?.length) return j.departments[0]?.name;
  const key = j.metadata?.find(m =>
    /^(team|department|org|business unit)$/i.test(m.name || "")
  );
  return key?.value || undefined;
}

export async function fetchGreenhouse(boardToken: string) {
  // 👇 Single call. No content=true (huge), no pagination params.
  const url = `https://boards-api.greenhouse.io/v1/boards/${boardToken}/jobs`;

  const res = await fetchWithTimeout(url, { timeoutMs: 15000 });
  if (!res.ok) throw new Error(`Greenhouse fetch failed: ${res.status}`);

  const data = (await res.json()) as { jobs?: RawGreenhouseJob[] };
  const jobs = data.jobs ?? [];

  return jobs.map(j => {
    const category: JobCategory = categorizeJobTitle(j.title ?? "");

    return {
      externalId: String(j.id),
      title: j.title ?? "",
      location: j.location?.name || "",
      url: j.absolute_url,
      postedAt: j.updated_at || j.created_at || new Date().toISOString(),
      unit: pickUnit(j),
      category, // 👈 new field
    };
  });
}
