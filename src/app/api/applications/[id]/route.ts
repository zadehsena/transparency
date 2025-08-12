import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { PrismaClient, ApplicationStatus } from "@prisma/client";

const prisma = new PrismaClient();

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const status = body?.status as ApplicationStatus | undefined;
  if (!status) return NextResponse.json({ error: "Missing status" }, { status: 400 });

  // ensure the app belongs to the logged-in user
  const app = await prisma.application.findUnique({ where: { id: params.id }, include: { user: true } });
  if (!app) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const owner = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!owner || owner.id !== app.userId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const updated = await prisma.application.update({
    where: { id: params.id },
    data: { status },
  });

  return NextResponse.json({ application: updated });
}
