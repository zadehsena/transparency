import type { Region } from "@prisma/client";

// ---------- utils ----------
const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const wb = (s: string) => new RegExp(`(?:^|\\b|[^a-z0-9])${escapeRe(s)}(?:$|\\b|[^a-z0-9])`, "i");

function norm(raw: string) {
    return (raw || "")
        .normalize("NFD")
        .replace(/\p{Diacritic}/gu, "")
        .toLowerCase()
        .replace(/[|]/g, ",")
        .replace(/[–—]/g, "-")
        .replace(/\s+/g, " ")
        .trim();
}

function tokenize(s: string) {
    return s.replace(/[(),/]/g, " ").split(/\s+/).filter(Boolean);
}

// ---------- lexicons ----------
const US_STATE_ABBRS = new Set([
    "al", "ak", "az", "ar", "ca", "co", "ct", "dc", "de", "fl", "ga", "hi", "ia", "id", "il", "in", "ks", "ky", "la", "ma", "md", "me", "mi", "mn", "mo", "ms", "mt", "nc", "nd", "ne", "nh", "nj", "nm", "nv", "ny", "oh", "ok", "or", "pa", "ri", "sc", "sd", "tn", "tx", "ut", "va", "vt", "wa", "wi", "wv", "wy"
]);

const CA_PROV = new Set([
    "ontario", "quebec", "british columbia", "alberta", "manitoba", "saskatchewan", "nova scotia", "new brunswick",
    "newfoundland and labrador", "prince edward island", "nunavut", "yukon", "northwest territories",
    "on", "qc", "bc", "ab", "mb", "sk", "ns", "nb", "nl", "pe", "nu", "yt", "nt"
]);

// Countries → region (word-boundary matched)
const COUNTRY_TO_REGION: Record<string, Region> = {
    // Europe
    "germany": "europe", "united kingdom": "europe", "uk": "europe", "england": "europe", "scotland": "europe", "wales": "europe",
    "ireland": "europe", "france": "europe", "netherlands": "europe", "spain": "europe", "portugal": "europe", "sweden": "europe",
    "norway": "europe", "denmark": "europe", "finland": "europe", "poland": "europe", "italy": "europe", "switzerland": "europe",
    "austria": "europe", "belgium": "europe", "czech republic": "europe", "czechia": "europe", "romania": "europe", "hungary": "europe",
    "greece": "europe", "estonia": "europe", "lithuania": "europe", "latvia": "europe", "ukraine": "europe", "iceland": "europe",

    // North America
    "united states": "north_america", "usa": "north_america", "u.s.": "north_america", "us": "north_america",
    "canada": "north_america", "mexico": "north_america",

    // Asia
    "india": "asia", "china": "asia", "japan": "asia", "singapore": "asia", "south korea": "asia", "korea": "asia", "vietnam": "asia",
    "thailand": "asia", "malaysia": "asia", "philippines": "asia", "indonesia": "asia", "hong kong": "asia", "taiwan": "asia",
    "pakistan": "asia", "sri lanka": "asia",

    // Oceania
    "australia": "oceania", "new zealand": "oceania", "nz": "oceania",

    // LATAM
    "brazil": "latin_america", "argentina": "latin_america", "chile": "latin_america", "colombia": "latin_america",
    "peru": "latin_america", "uruguay": "latin_america", "ecuador": "latin_america", "bolivia": "latin_america",
    "guatemala": "latin_america", "panama": "latin_america", "costa rica": "latin_america", "dominican republic": "latin_america",
    "venezuela": "latin_america", "nicaragua": "latin_america", "paraguay": "latin_america",

    // Middle East
    "united arab emirates": "middle_east", "uae": "middle_east", "israel": "middle_east", "saudi arabia": "middle_east",
    "qatar": "middle_east", "bahrain": "middle_east", "oman": "middle_east", "jordan": "middle_east", "turkey": "middle_east", "turkiye": "middle_east",

    // Africa
    "south africa": "africa", "nigeria": "africa", "kenya": "africa", "egypt": "africa", "morocco": "africa", "ghana": "africa",
    "ethiopia": "africa", "tanzania": "africa",
};

// City → region (word-boundary matched)
const CITY_TO_REGION: Record<string, Region> = {
    // Europe (include German cities)
    "berlin": "europe", "munich": "europe", "muenchen": "europe", "hamburg": "europe", "frankfurt": "europe", "cologne": "europe",
    "koeln": "europe", "stuttgart": "europe", "duesseldorf": "europe", "dusseldorf": "europe", "leipzig": "europe",
    "london": "europe", "paris": "europe", "amsterdam": "europe", "dublin": "europe", "madrid": "europe", "barcelona": "europe",
    "zurich": "europe", "warsaw": "europe", "milan": "europe", "lisbon": "europe", "prague": "europe", "stockholm": "europe",
    "copenhagen": "europe", "helsinki": "europe", "rome": "europe",

    // North America
    "new york": "north_america", "boston": "north_america", "chicago": "north_america", "seattle": "north_america",
    "san francisco": "north_america", "austin": "north_america", "atlanta": "north_america", "los angeles": "north_america",
    "toronto": "north_america", "vancouver": "north_america", "montreal": "north_america", "ottawa": "north_america",

    // Asia
    "singapore": "asia", "tokyo": "asia", "seoul": "asia", "beijing": "asia", "shanghai": "asia", "hong kong": "asia", "taipei": "asia",
    "kuala lumpur": "asia", "bangkok": "asia", "manila": "asia", "jakarta": "asia", "bengaluru": "asia", "bangalore": "asia",
    "mumbai": "asia", "pune": "asia", "hyderabad": "asia", "chennai": "asia", "gurgaon": "asia", "gurugram": "asia", "noida": "asia",
    "delhi": "asia", "new delhi": "asia", "ahmedabad": "asia", "kolkata": "asia",

    // Oceania
    "sydney": "oceania", "melbourne": "oceania", "auckland": "oceania", "brisbane": "oceania",

    // LATAM
    "sao paulo": "latin_america", "rio de janeiro": "latin_america", "buenos aires": "latin_america", "bogota": "latin_america",
    "lima": "latin_america", "montevideo": "latin_america", "santiago": "latin_america", "mexico city": "latin_america",
    "guadalajara": "latin_america",

    // Middle East
    "dubai": "middle_east", "abu dhabi": "middle_east", "riyadh": "middle_east", "doha": "middle_east", "tel aviv": "middle_east", "istanbul": "middle_east",

    // Africa
    "johannesburg": "africa", "cape town": "africa", "nairobi": "africa", "lagos": "africa", "cairo": "africa", "casablanca": "africa",
};

// High-level keywords (word-boundary)
const KEYWORDS: Array<[RegExp, Region]> = [
    [/\bremote\b/, "remote"],
    [/\banywhere\b/, "remote"],
    [/\bdistributed\b/, "remote"],
    [/\bglobal\b/, "global"],
    [/\bworldwide\b/, "global"],
    [/\beu\b/, "europe"],
    [/\bemea\b/, "europe"],
    [/\bapac\b/, "asia"],
    [/\bamericas?\b/, "north_america"],
    [/\buk\b/, "europe"],
];

// ---------- main ----------
export function regionFromLocation(raw?: string | null): Region | null {
    const s = norm(raw || "");

    if (!s || s === "-" || s === "n/a" || s === "na" || s === "location") return null;

    // 1) Explicit remote/global keywords
    for (const [re, region] of KEYWORDS) {
        if (re.test(s)) return region;
    }

    // 2) City ⇒ Region (exact tokens)
    for (const city in CITY_TO_REGION) {
        if (wb(city).test(s)) return CITY_TO_REGION[city];
    }

    // 3) Country ⇒ Region (exact tokens)
    for (const country in COUNTRY_TO_REGION) {
        if (wb(country).test(s)) return COUNTRY_TO_REGION[country];
    }

    // 4) US states / CA provinces (two-letter tokens, etc.)
    const toks = tokenize(s).map(t => t.replace(/\./g, "").toLowerCase());
    for (const t of toks) {
        if (US_STATE_ABBRS.has(t) || CA_PROV.has(t)) return "north_america";
    }

    // 5) Continent words (fallbacks; exact phrases)
    if (/\bnorth america\b/.test(s) || /\bunited states\b/.test(s) || /\busa\b/.test(s) || /\bcanada\b/.test(s) || /\bmexico\b/.test(s))
        return "north_america";
    if (/\beurope\b/.test(s)) return "europe";
    if (/\basia\b/.test(s)) return "asia";
    if (/\boceania\b/.test(s) || /\baustralia\b/.test(s) || /\bnew zealand\b/.test(s)) return "oceania";
    if (/\blatin america\b/.test(s) || /\bla[-\s]?tam\b/.test(s)) return "latin_america";
    if (/\bmiddle east\b/.test(s)) return "middle_east";
    if (/\bafrica\b/.test(s)) return "africa";

    // 6) DO NOT treat bare "na" as North America
    if (/\bna\b/.test(s)) return null;

    return null;
}
