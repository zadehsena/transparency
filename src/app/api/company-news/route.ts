import { NextResponse } from "next/server";

type GNewsArticle = {
    title: string;
    url: string;
    description?: string;
    image?: string;
    publishedAt?: string;
    source?: { name?: string };
};

type GNewsResponse = {
    articles?: GNewsArticle[];
};

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const name = searchParams.get("name") || "Reddit";

    if (!process.env.GNEWS_API_KEY) {
        return NextResponse.json(
            { items: [], error: "Missing GNEWS_API_KEY" },
            { status: 400 }
        );
    }

    const url = `https://gnews.io/api/v4/search?q=${encodeURIComponent(
        name
    )}&lang=en&max=10&apikey=${process.env.GNEWS_API_KEY}`;

    const res = await fetch(url, { cache: "no-store" });

    // 💡 No more any!
    const data = (await res.json()) as GNewsResponse;

    const items = (data.articles ?? []).map((a) => ({
        title: a.title,
        url: a.url,
        source: a.source?.name || "GNews",
        publishedAt: a.publishedAt,
        image: a.image,
        summary: a.description,
    }));

    return NextResponse.json({ items });
}
