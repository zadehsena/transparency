// app/api/contact/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const ContactSchema = z.object({
    name: z.string().min(2).max(120),
    email: z.string().email().max(200),
    subject: z.string().min(2).max(200),
    message: z.string().min(5).max(5000),
    website: z.string().optional(), // honeypot
});

export async function POST(req: Request) {
    try {
        const json = await req.json();
        const parsed = ContactSchema.safeParse(json);

        if (!parsed.success) {
            return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
        }

        const { website, ...data } = parsed.data;

        // Honeypot (bots will fill this)
        if (website && website.trim().length > 0) {
            return NextResponse.json({ ok: true }); // pretend success
        }

        const ip =
            (req.headers.get("x-forwarded-for") || "").split(",")[0]?.trim() ||
            (req as any).ip ||
            null;

        await prisma.contactMessage.create({
            data: {
                ...data,
                ip: ip || null,
            },
        });

        // Optionally send an email notification here
        // await sendContactEmail(data); // implement if you want

        return NextResponse.json({ ok: true });
    } catch (e) {
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
