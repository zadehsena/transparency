// src/app/onboarding/actions.tsx
"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import type { Prisma } from "@prisma/client";

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

    await prisma.user.update({
        where: { id: user.id },
        data: {
            ...("firstName" in data ? { firstName: data.firstName } : {}),
            ...("lastName" in data ? { lastName: data.lastName } : {}),
            ...("birthdate" in data
                ? { birthdate: data.birthdate ? new Date(data.birthdate) : null }
                : {}),
            ...("location" in data ? { location: data.location } : {}),
            ...("interests" in data
                ? { interests: (data.interests ?? []) as Prisma.InputJsonValue }
                : {}),
            ...("level" in data ? { level: data.level } : {}),
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
    return "/applications"; // change this to your desired post-onboarding route
}
