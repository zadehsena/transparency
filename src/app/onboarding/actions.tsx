// src/app/onboarding/actions.tsx
"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

async function getCurrentUser() {
    const session = await getServerSession(authOptions);
    const id = (session?.user as any)?.id;
    if (!id) return null;
    return prisma.user.findUnique({ where: { id } });
}

type SaveData = Partial<{
    firstName: string;
    lastName: string;
    birthdate: string; // ISO
    location: string;
    interests: string[];
    level: "junior" | "mid" | "senior" | "lead";
}>;

export async function savePartial(data: SaveData) {
    const user = await getCurrentUser();
    if (!user) throw new Error("Unauthorized");

    // normalize interests if provided
    const interestsPayload =
        "interests" in data
            ? Array.isArray(data.interests)
                ? (data.interests as any[]).map((i) =>
                    typeof i === "string"
                        ? { category: i, subtopics: null }
                        : { category: i.category, subtopics: i.subtopics ?? null }
                )
                : []
            : undefined;

    await prisma.user.update({
        where: { id: user.id },
        data: {
            ...("firstName" in data ? { firstName: data.firstName } : {}),
            ...("lastName" in data ? { lastName: data.lastName } : {}),
            ...("birthdate" in data
                ? { birthdate: data.birthdate ? new Date(data.birthdate) : null }
                : {}),
            ...("location" in data ? { location: data.location } : {}),
            ...("level" in data ? { level: data.level } : {}),

            ...(interestsPayload
                ? {
                    interests: {
                        deleteMany: {},            // wipe existing InterestGroup rows for this user
                        createMany: { data: interestsPayload }, // recreate from payload
                    },
                }
                : {}),
        },
    });

    revalidatePath("/onboarding");
}

export async function saveEducation(ed: {
    school?: string;
    degree?: string;
    field?: string;
    graduationYear?: string; // accept string; coerce to int
}) {
    const user = await getCurrentUser();
    if (!user) throw new Error("Unauthorized");

    await prisma.profile.upsert({
        where: { userId: user.id },
        create: {
            userId: user.id,
            educationSchool: ed.school ?? null,
            educationDegree: ed.degree ?? null,
            educationField: ed.field ?? null,
            educationGraduationYear: ed.graduationYear ? parseInt(ed.graduationYear, 10) : null,
        },
        update: {
            educationSchool: ed.school ?? null,
            educationDegree: ed.degree ?? null,
            educationField: ed.field ?? null,
            educationGraduationYear: ed.graduationYear ? parseInt(ed.graduationYear, 10) : null,
        },
    });

    revalidatePath("/onboarding");
}

export async function saveCurrentJob(job: { company?: string; title?: string }) {
    const user = await getCurrentUser();
    if (!user) throw new Error("Unauthorized");

    await prisma.profile.upsert({
        where: { userId: user.id },
        create: {
            userId: user.id,
            currentCompany: job.company ?? null,
            currentTitle: job.title ?? null,
        },
        update: {
            currentCompany: job.company ?? null,
            currentTitle: job.title ?? null,
        },
    });

    revalidatePath("/onboarding");
}


export async function completeOnboarding() {
    const user = await getCurrentUser();
    if (!user) throw new Error("Unauthorized");
    await prisma.user.update({
        where: { id: user.id },
        data: { onboardingCompleted: true },
    });
    return "profile?tab=profile"; // change this to your desired post-onboarding route
}
