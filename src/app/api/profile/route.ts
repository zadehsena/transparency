// app/api/profile/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { getCurrentUser } from "@/lib/auth";

// ---------- Helpers ----------
type UserWithProfile = Prisma.UserGetPayload<{ include: { profile: true } }>;

// Safe JSON → string[]
function asStringArray(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v.filter((x) => typeof x === "string") as string[];
}

// Safe JSON → record<string, boolean>
function asBoolRecord(v: unknown): Record<string, boolean> {
  if (!v || typeof v !== "object") return {};
  const out: Record<string, boolean> = {};
  for (const [k, val] of Object.entries(v as Record<string, unknown>)) {
    if (typeof val === "boolean") out[k] = val;
  }
  return out;
}

function emptyToNull(v: string): string | null {
  return v === "" ? null : v;
}

function fullName(u: { firstName?: string | null; lastName?: string | null }) {
  return [u.firstName, u.lastName].filter(Boolean).join(" ");
}

function toDto(user: UserWithProfile, totals: { total: number; responded: number; medianDays: number | null }) {
  const p = user.profile;

  const skills = asStringArray(p?.skills ?? []);
  const industries = asStringArray(p?.industries ?? []);
  const notifications = asBoolRecord(p?.notifications ?? {});

  return {
    name: fullName(user),                 // <- was user.name
    email: user.email,

    phone: p?.phone ?? "",
    location: p?.location ?? "",
    headline:
      p && typeof (p as Record<string, unknown>)["headline"] === "string"
        ? ((p as Record<string, unknown>)["headline"] as string)
        : "",
    yearsExperience: p?.yearsExperience ?? null,
    skills,
    industries,
    notifications: Object.keys(notifications).length
      ? notifications
      : { jobMatches: true, companyUpdates: true },

    stats: {
      overallResponseRate: totals.total ? Math.round((totals.responded / totals.total) * 100) : 0,
      totalApplications: totals.total,
      medianResponseDays: totals.medianDays,
    },
  };
}

// If you added Application.firstResponseAt, compute median; else return null.
async function getAppStats(userId: string) {
  const total = await prisma.application.count({ where: { userId } });
  const responded = await prisma.application.count({
    where: { userId, NOT: { status: "applied" } },
  });

  // If you haven't added `firstResponseAt`, skip median.
  let medianDays: number | null = null;
  try {
    const rows = await prisma.application.findMany({
      where: { userId, NOT: { firstResponseAt: null } },
      select: { createdAt: true, firstResponseAt: true },
    });

    const diffs = rows
      .map((r) => {
        if (!r.firstResponseAt) return null;
        const d = (r.firstResponseAt.getTime() - r.createdAt.getTime()) / (1000 * 60 * 60 * 24);
        return Math.max(0, d);
      })
      .filter((n): n is number => typeof n === "number")
      .sort((a, b) => a - b);

    if (diffs.length) {
      const mid = Math.floor(diffs.length / 2);
      const m = diffs.length % 2 ? diffs[mid] : (diffs[mid - 1] + diffs[mid]) / 2;
      medianDays = Math.round(m * 10) / 10;
    }
  } catch {
    // Field may not exist yet; leave as null.
    medianDays = null;
  }

  return { total, responded, medianDays };
}

// ---------- Routes ----------
export async function GET() {
  const me = await getCurrentUser();
  if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = me.id;

  const baseUser = await prisma.user.findUnique({ where: { id: userId } });
  if (!baseUser) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // ensure profile exists, then read once
  await prisma.profile.upsert({
    where: { userId },
    update: {},
    create: { userId },
  });

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { profile: true },
  });
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const totals = await getAppStats(userId);
  return NextResponse.json(toDto(user, totals));
}

export async function PATCH(req: Request) {
  const me = await getCurrentUser();
  if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = me.id;
  const body = await req.json().catch(() => ({})) as Record<string, unknown>;

  // ---------- in PATCH ----------
  const nextUser: Prisma.UserUpdateInput = {};

  // Allow a single "name" field; split to first/last
  if (typeof body.name === "string") {
    const parts = body.name.trim().split(/\s+/);
    const first = parts.shift() || null;
    const last = parts.length ? parts.join(" ") : null;
    nextUser.firstName = first;
    nextUser.lastName = last;
  }

  // Also accept explicit firstName/lastName overrides
  if (typeof body.firstName === "string") nextUser.firstName = body.firstName.trim() || null;
  if (typeof body.lastName === "string") nextUser.lastName = body.lastName.trim() || null;

  // Email stays as-is
  if (typeof body.email === "string") nextUser.email = body.email.trim();

  if (Object.keys(nextUser).length) {
    await prisma.user.update({ where: { id: userId }, data: nextUser });
  }

  // ---- Gather Profile updates (keep your existing field set)
  const nextProfile: Record<string, unknown> = {};

  const copy = (k: keyof Prisma.ProfileUpdateInput) => {
    if (k in body) {
      // coerce empty strings to null for optional string fields
      const v = body[k as string];
      nextProfile[k as string] = typeof v === "string" ? emptyToNull(v) : v;
    }
  };

  ([
    "phone", "location", "visibility", "openToWork",
    "website", "linkedin", "github", "portfolio",
    "yearsExperience", "seniority", "summary",
    "desiredSalaryMin", "desiredSalaryMax", "salaryCurrency",
    "remotePreference", "willingToRelocate",
    // include "headline" if you added it in the schema
    "headline",
  ] as (keyof Prisma.ProfileUpdateInput)[]).forEach(copy);

  // JSON arrays
  if ("skills" in body) nextProfile.skills = asStringArray(body.skills);
  if ("industries" in body) nextProfile.industries = asStringArray(body.industries);
  if ("jobTypes" in body) nextProfile.jobTypes = asStringArray(body.jobTypes);
  if ("preferredLocations" in body) nextProfile.preferredLocations = asStringArray(body.preferredLocations);

  // Notifications as record<string, boolean>
  if ("notifications" in body) {
    nextProfile.notifications = asBoolRecord(body.notifications);
  }

  // Upsert profile
  await prisma.profile.upsert({
    where: { userId },
    update: nextProfile as Prisma.ProfileUpdateInput,
    create: {
      ...(nextProfile as Prisma.ProfileCreateInput),
      user: { connect: { id: userId } },
    },
  });

  const user: UserWithProfile | null = await prisma.user.findUnique({
    where: { id: userId },
    include: { profile: true },
  });
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const totals = await getAppStats(userId);
  return NextResponse.json(toDto(user, totals));
}
