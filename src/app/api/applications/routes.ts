import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { jobId } = await req.json();
  if (!jobId) {
    return NextResponse.json({ error: "Missing jobId" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Check if already applied
  const existing = await prisma.application.findFirst({
    where: { userId: user.id, jobId },
  });

  if (existing) {
    return NextResponse.json({ error: "Already applied" }, { status: 409 });
  }

  const application = await prisma.application.create({
    data: {
      userId: user.id,
      jobId,
      status: "applied",
    },
  });

  return NextResponse.json(application);
}
