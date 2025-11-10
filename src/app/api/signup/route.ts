import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, name, firstName, lastName } = body ?? {};
    if (!email || !password) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) {
      return NextResponse.json({ error: "Email already in use" }, { status: 409 });
    }

    // derive first/last
    let f = (firstName ?? "").trim();
    let l = (lastName ?? "").trim();
    if ((!f || !l) && name) {
      const parts = String(name).trim().split(/\s+/);
      f = f || parts.shift() || "";
      l = l || parts.join(" ");
    }

    const hash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        email,
        password: hash,
        firstName: f || null,
        lastName: l || null,
      },
      select: { id: true, email: true },
    });

    // ✅ await cookies() before setting
    const cookieStore = await cookies();
    cookieStore.set("uid", user.id, { httpOnly: true, path: "/" });

    return NextResponse.json(user, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Signup failed" }, { status: 500 });
  }
}
