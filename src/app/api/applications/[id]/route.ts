// src/app/api/applications/[id]/route.ts
import { NextResponse, type NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ApplicationStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Derive id from URL (second arg is optional in App Router handlers)
  const id = req.nextUrl.pathname.split("/").pop();
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  // Parse and validate body
  const body = (await req.json().catch(() => ({}))) as { status?: ApplicationStatus };
  const status = body.status;
  if (!status) {
    return NextResponse.json({ error: "Missing status" }, { status: 400 });
  }

  // Ensure the application exists and belongs to the logged-in user
  const app = await prisma.application.findUnique({
    where: { id },
    select: { id: true, userId: true },
  });
  if (!app) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const owner = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });
  if (!owner || owner.id !== app.userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const updated = await prisma.application.update({
    where: { id },
    data: { status },
  });

  return NextResponse.json({ application: updated });
}
