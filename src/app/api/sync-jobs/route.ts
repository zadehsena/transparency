// src/app/api/sync-jobs/route.ts
import { NextResponse } from "next/server";
import { syncJobs } from "@/lib/jobs/syncFromAts";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  // ---- AUTH CHECK ----
  const expected = process.env.CRON_SECRET;
  const auth = req.headers.get("authorization");

  if (!expected) {
    console.error("CRON_SECRET is not set in the environment.");
    return NextResponse.json(
      { ok: false, error: "Server misconfiguration" },
      { status: 500 }
    );
  }

  if (auth !== `Bearer ${expected}`) {
    return NextResponse.json(
      { ok: false, error: "Unauthorized" },
      { status: 401 }
    );
  }
  // ---- END AUTH CHECK ----

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
      { status: 500 }
    );
  }
}
