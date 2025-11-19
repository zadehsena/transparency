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
  } catch (e: unknown) {
    console.error("sync-jobs failed:", e);

    const message =
      e instanceof Error
        ? e.message
        : typeof e === "string"
          ? e
          : "Unknown error";

    return NextResponse.json(
      { ok: false, error: message },
      { status: 500 },
    );
  }
}
