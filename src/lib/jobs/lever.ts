// src/lib/jobs/lever.ts
import { fetchWithTimeout } from "@/lib/http";
import type { JobCategory } from "@prisma/client";
import { categorizeJobTitle } from "./classify";

export type RawLeverJob = {
  id: string;
  text: string;
  hostedUrl: string;
  createdAt?: number;
  categories?: { location?: string; team?: string; commitment?: string };
  workplaceType?: string;
};

export async function fetchLever(companyHandle: string) {
  const base = `https://api.lever.co/v0/postings/${companyHandle}?mode=json`;

  const res = await fetchWithTimeout(base, { timeoutMs: 15000 });
  if (!res.ok) throw new Error(`Lever fetch failed: ${res.status}`);

  const jobs = (await res.json()) as RawLeverJob[];

  // safety cap (avoid OOM if Lever goes wild)
  const MAX_JOBS = 1000;
  const safeJobs = jobs.slice(0, MAX_JOBS);

  return safeJobs.map(j => {
    // Use title (and team as a hint) for categorization
    const titleForCat = [j.text, j.categories?.team].filter(Boolean).join(" - ");
    const category: JobCategory = categorizeJobTitle(titleForCat);

    return {
      externalId: j.id,
      title: j.text,
      location: j.categories?.location || "",
      url: j.hostedUrl,
      postedAt: j.createdAt
        ? new Date(j.createdAt).toISOString()
        : new Date().toISOString(),
      unit: j.categories?.team,
      category, // 👈 new field
    };
  });
}
