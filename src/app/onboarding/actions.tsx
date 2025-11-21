// src/app/onboarding/actions.tsx
"use server";

import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

type SessionUserWithId = {
    id: string;
};

async function getCurrentUser() {
    const session = await getServerSession(authOptions);
    const id = (session?.user as SessionUserWithId | undefined)?.id;
    if (!id) return null;
    return prisma.user.findUnique({ where: { id } });
}

type InterestInput =
    | string
    | {
        category: string;
        subtopics?: string[] | null;
    };

type SaveData = Partial<{
    firstName: string;
    lastName: string;
    birthdate: string; // ISO
    location: string;
    interests: InterestInput[];
    level: "junior" | "mid" | "senior" | "lead";
}>;

export async function savePartial(data: SaveData) {
    const user = await getCurrentUser();
    if (!user) throw new Error("Unauthorized");

    // normalize interests if provided → array of createMany inputs
    const interestsPayload =
        "interests" in data
            ? Array.isArray(data.interests)
                ? data.interests.map((i) =>
                    typeof i === "string"
                        ? { category: i, subtopics: null }
                        : { category: i.category, subtopics: i.subtopics ?? null }
                )
                : []
            : undefined;

    // build nested interests update in a type-safe-ish way
    const interestsUpdate =
        interestsPayload && interestsPayload.length > 0
            ? ({
                deleteMany: {}, // delete all existing rows for this user
                createMany: { data: interestsPayload },
            } as unknown as Prisma.UserUpdateInput["interests"])
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
            ...(interestsUpdate ? { interests: interestsUpdate } : {}),
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
            educationGraduationYear: ed.graduationYear
                ? parseInt(ed.graduationYear, 10)
                : null,
        },
        update: {
            educationSchool: ed.school ?? null,
            educationDegree: ed.degree ?? null,
            educationField: ed.field ?? null,
            educationGraduationYear: ed.graduationYear
                ? parseInt(ed.graduationYear, 10)
                : null,
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

export async function completeOnboarding(): Promise<string> {
    const user = await getCurrentUser();
    if (!user) throw new Error("Unauthorized");

    await prisma.user.update({
        where: { id: user.id },
        data: { onboardingCompleted: true },
    });

    // Route to land on after onboarding
    return "/profile?tab=profile";
}
