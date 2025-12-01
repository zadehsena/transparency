import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type SessionUserWithEmail = { email?: string | null };

export async function GET() {
    const session = await getServerSession(authOptions);
    const email = (session?.user as SessionUserWithEmail | undefined)?.email;

    if (!email) {
        return NextResponse.json({ applications: [] });
    }

    const user = await prisma.user.findUnique({
        where: { email },
    });

    if (!user) {
        return NextResponse.json({ applications: [] });
    }

    const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);

    const applications = await prisma.application.findMany({
        where: {
            userId: user.id,
            status: "clicked",
            createdAt: { gte: fourteenDaysAgo },
        },
        orderBy: { createdAt: "desc" },
        include: {
            job: {
                select: {
                    id: true,
                    title: true,
                    company: true, // string field on Job
                },
            },
        },
        take: 10, // keep popup small
    });

    return NextResponse.json({
        applications: applications.map((app) => ({
            id: app.id,
            jobId: app.jobId,
            createdAt: app.createdAt,
            job: app.job,
        })),
    });
}
