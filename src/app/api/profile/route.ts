// app/api/profile/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

// ---------- Helpers ----------
type UserWithProfile = Prisma.UserGetPayload<{ include: { profile: true } }>;
const getUserId = async () => "cmebiyl2h000235kd6vek3q5h";

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

function emptyToNull<T extends string | undefined | null>(v: T) {
  return v === "" ? (null as any) : v;
}

function toDto(user: UserWithProfile, totals: { total: number; responded: number; medianDays: number | null }) {
  const p = user.profile;

  // JSON fields normalized
  const skills = asStringArray(p?.skills ?? []);
  const industries = asStringArray(p?.industries ?? []);
  const jobTypes = asStringArray(p?.jobTypes ?? []);
  const preferredLocations = asStringArray(p?.preferredLocations ?? []);
  const notifications = asBoolRecord(p?.notifications ?? {});

  return {
    name: user.name ?? "",
    email: user.email,

    phone: p?.phone ?? "",
    location: p?.location ?? "",
    visibility: (p?.visibility ?? "everyone") as "everyone" | "employers" | "private",
    openToWork: p?.openToWork ?? true,

    website: p?.website ?? "",
    linkedin: p?.linkedin ?? "",
    github: p?.github ?? "",
    portfolio: p?.portfolio ?? "",

    // minimal headliner (optional in your schema; include if you added it)
    headline: (p as any)?.headline ?? "",

    yearsExperience: p?.yearsExperience ?? null,
    seniority: (p?.seniority as any) ?? null,
    skills,
    industries,
    summary: p?.summary ?? "",

    desiredSalaryMin: p?.desiredSalaryMin ?? null,
    desiredSalaryMax: p?.desiredSalaryMax ?? null,
    salaryCurrency: p?.salaryCurrency ?? "USD",
    remotePreference: (p?.remotePreference as any) ?? "noPreference",
    willingToRelocate: p?.willingToRelocate ?? false,
    jobTypes,
    preferredLocations,

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
      where: { userId, NOT: { firstResponseAt: null } as any },
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
  const userId = await getUserId();

  // Ensure profile exists
  const baseUser = await prisma.user.findUnique({ where: { id: userId } });
  if (!baseUser) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const userWithProfile = await prisma.user.findUnique({
    where: { id: userId },
    include: { profile: true },
  });

  if (!userWithProfile?.profile) {
    await prisma.profile.create({ data: { userId } });
  }

  const user: UserWithProfile | null = await prisma.user.findUnique({
    where: { id: userId },
    include: { profile: true },
  });

  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const totals = await getAppStats(userId);
  return NextResponse.json(toDto(user, totals));
}

export async function PATCH(req: Request) {
  const userId = await getUserId();
  const body = await req.json().catch(() => ({})) as Record<string, unknown>;

  // ---- Update User fields safely
  const nextUser: Prisma.UserUpdateInput = {};
  if (typeof body.name === "string") nextUser.name = body.name.trim();
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
