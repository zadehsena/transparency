// src/app/api/sync-jobs/route.ts
import { NextResponse } from "next/server";
import { syncJobs } from "@/lib/jobs/syncFromAts";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const url = new URL(req.url);
    const slug = (url.searchParams.get("slug") || "").trim() || undefined;

    const { results } = await syncJobs(slug);
    return NextResponse.json({ ok: true, results });
  } catch (e: any) {
    console.error("sync-jobs failed:", e);
    return NextResponse.json(
      { ok: false, error: e?.message ?? "Unknown error" },
      { status: 500 },
    );
  }
}
