import { NextResponse } from "next/server";

export const dynamic = "force-dynamic"; // don't cache in dev

type NominatimResult = {
    place_id: number | string;
    display_name: string;
    // we don't care about the rest, so keep it open
    [key: string]: unknown;
};

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const q = (searchParams.get("q") || "").trim();

    if (!q) {
        return NextResponse.json({ features: [] });
    }

    // OpenStreetMap Nominatim (no key, free)
    const url = new URL("https://nominatim.openstreetmap.org/search");
    url.searchParams.set("q", q);
    url.searchParams.set("format", "json");
    url.searchParams.set("addressdetails", "1");
    url.searchParams.set("limit", "5");

    const r = await fetch(url.toString(), {
        headers: { "User-Agent": "transparency-app/1.0 (onboarding)" },
        // optional: cache: "no-store",
    });

    if (!r.ok) {
        return NextResponse.json({ features: [] }, { status: 502 });
    }

    const json = (await r.json()) as NominatimResult[];

    return NextResponse.json({
        features: json.map((x) => ({
            id: String(x.place_id),
            place_name: String(x.display_name),
        })),
    });
}
