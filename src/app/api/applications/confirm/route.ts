import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type SessionUserWithEmail = { email?: string | null };

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    const email = (session?.user as SessionUserWithEmail | undefined)?.email;

    if (!email) {
        return NextResponse.json(
            { error: "Not authenticated" },
            { status: 401 },
        );
    }

    const user = await prisma.user.findUnique({
        where: { email },
    });

    if (!user) {
        return NextResponse.json(
            { error: "User not found" },
            { status: 404 },
        );
    }

    const { jobId } = await req.json();

    if (!jobId || typeof jobId !== "string") {
        return NextResponse.json(
            { error: "jobId is required" },
            { status: 400 },
        );
    }

    const application = await prisma.application.findUnique({
        where: {
            // from @@unique([userId, jobId]) in your schema
            userId_jobId: {
                userId: user.id,
                jobId,
            },
        },
    });

    if (!application) {
        return NextResponse.json(
            { error: "No existing application to confirm" },
            { status: 404 },
        );
    }

    const updated = await prisma.application.update({
        where: { id: application.id },
        data: {
            status: "applied",
            submittedAt: new Date(),
        },
    });

    return NextResponse.json({ application: updated });
}
