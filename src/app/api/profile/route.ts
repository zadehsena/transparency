// app/api/profile/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client"; // ✅ add this

// Typed helper for queries that include profile
type UserWithProfile = Prisma.UserGetPayload<{ include: { profile: true } }>;

const getUserId = async () => "cme8lfogx000035kvz2ebyiyu";

export async function GET() {
  const userId = await getUserId();

  const user: UserWithProfile | null = await prisma.user.findUnique({
    where: { id: userId },
    include: { profile: true }, // ✅ relation included in the payload type
  });
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const total = await prisma.application.count({ where: { userId } });
  const responded = await prisma.application.count({
    where: { userId, NOT: { status: "applied" } },
  });

  return NextResponse.json(toDto(user, total, responded));
}

export async function PATCH(req: Request) {
  const userId = await getUserId();
  const body = await req.json().catch(() => ({}));

  const nextUser: any = {};
  if (typeof body.name === "string") nextUser.name = body.name.trim();
  if (typeof body.email === "string") nextUser.email = body.email.trim();
  if (Object.keys(nextUser).length) {
    await prisma.user.update({ where: { id: userId }, data: nextUser });
  }

  const nextProfile: any = {};
  const copy = (k: string) => {
    if (k in body) nextProfile[k] = body[k];
  };
  [
    "phone","location","visibility","openToWork",
    "website","linkedin","github","portfolio",
    "yearsExperience","seniority","summary",
    "desiredSalaryMin","desiredSalaryMax","salaryCurrency",
    "remotePreference","willingToRelocate",
  ].forEach(copy);
  if (Array.isArray(body.skills)) nextProfile.skills = body.skills;
  if (Array.isArray(body.industries)) nextProfile.industries = body.industries;
  if (Array.isArray(body.jobTypes)) nextProfile.jobTypes = body.jobTypes;
  if (Array.isArray(body.preferredLocations)) nextProfile.preferredLocations = body.preferredLocations;
  if (body.notifications && typeof body.notifications === "object") nextProfile.notifications = body.notifications;

  await prisma.profile.upsert({
    where: { userId },
    update: nextProfile,
    create: { userId, ...nextProfile },
  });

  const user: UserWithProfile | null = await prisma.user.findUnique({
    where: { id: userId },
    include: { profile: true }, // ✅
  });

  const total = await prisma.application.count({ where: { userId } });
  const responded = await prisma.application.count({
    where: { userId, NOT: { status: "applied" } },
  });

  return NextResponse.json(toDto(user!, total, responded));
}

// ✅ Use the payload type here (not ReturnType<typeof ...>)
function toDto(user: UserWithProfile, total: number, responded: number) {
  const p = user.profile; // now typed
  return {
    name: user.name ?? "",
    email: user.email,

    phone: p?.phone ?? "",
    location: p?.location ?? "",
    visibility: p?.visibility ?? "everyone",
    openToWork: p?.openToWork ?? true,

    website: p?.website ?? "",
    linkedin: p?.linkedin ?? "",
    github: p?.github ?? "",
    portfolio: p?.portfolio ?? "",

    yearsExperience: p?.yearsExperience ?? null,
    seniority: p?.seniority ?? null,
    skills: (p?.skills as string[]) ?? [],
    industries: (p?.industries as string[]) ?? [],
    summary: p?.summary ?? "",

    desiredSalaryMin: p?.desiredSalaryMin ?? null,
    desiredSalaryMax: p?.desiredSalaryMax ?? null,
    salaryCurrency: p?.salaryCurrency ?? "USD",
    remotePreference: p?.remotePreference ?? "noPreference",
    willingToRelocate: p?.willingToRelocate ?? false,
    jobTypes: (p?.jobTypes as string[]) ?? [],
    preferredLocations: (p?.preferredLocations as string[]) ?? [],

    notifications:
      (p?.notifications as Record<string, boolean>) ?? { jobMatches: true, companyUpdates: true },

    stats: {
      overallResponseRate: total ? Math.round((responded / total) * 100) : 0,
      totalApplications: total,
      medianResponseDays: null,
    },
  };
}
