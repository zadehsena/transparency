// src/app/api/applications/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET /api/applications
// Returns all applications for the current user (for "My Applications" etc.)
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ applications: [] });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    return NextResponse.json({ applications: [] });
  }

  const apps = await prisma.application.findMany({
    where: { userId: user.id },
    include: { job: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ applications: apps });
}

// POST /api/applications
// Called when the user clicks "Apply" on a job:
// - creates or updates an Application as `clicked`
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json(
      { error: "Not authenticated" },
      { status: 401 },
    );
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
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

  const application = await prisma.application.upsert({
    where: {
      // comes from @@unique([userId, jobId]) in your schema
      userId_jobId: {
        userId: user.id,
        jobId,
      },
    },
    update: {
      status: "clicked",
      createdAt: new Date(), // refresh "clicked" timestamp
    },
    create: {
      userId: user.id,
      jobId,
      status: "clicked",
    },
    include: {
      job: true,
    },
  });

  return NextResponse.json({ application });
}
