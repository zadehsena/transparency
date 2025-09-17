import type { Region } from "@prisma/client";

// Normalize accents and collapse whitespace
function norm(raw: string) {
    return raw
        .normalize("NFD")
        .replace(/\p{Diacritic}/gu, "") // remove accents
        .toLowerCase()
        .replace(/[_–—]/g, "-")
        .replace(/\s+/g, " ")
        .trim();
}

// US states
const US_STATE_ABBRS = new Set([
    "al", "ak", "az", "ar", "ca", "co", "ct", "dc", "de", "fl", "ga", "hi", "ia", "id", "il", "in", "ks", "ky",
    "la", "ma", "md", "me", "mi", "mn", "mo", "ms", "mt", "nc", "nd", "ne", "nh", "nj", "nm", "nv", "ny", "oh",
    "ok", "or", "pa", "ri", "sc", "sd", "tn", "tx", "ut", "va", "vt", "wa", "wi", "wv", "wy"
]);

// Canadian provinces (full & abbr)
const CA_PROV = new Set([
    "ontario", "quebec", "british columbia", "alberta", "manitoba", "saskatchewan", "nova scotia",
    "new brunswick", "newfoundland and labrador", "prince edward island", "nunavut", "yukon",
    "northwest territories", "on", "qc", "bc", "ab", "mb", "sk", "ns", "nb", "nl", "pe", "nu", "yt", "nt"
]);

// Keyword shorthands by region
const KEYWORDS: Array<[RegExp, Region]> = [
    [/\bremote\b/, "remote"],
    [/\bglobal\b/, "global"],
    [/\bapac\b/, "asia"],
    [/\bemea\b/, "europe"],
    [/\bamericas?\b/, "north_america"],
    [/\buk\b/, "europe"], // common shorthand
];

// Countries → region
const COUNTRY_TO_REGION: Record<string, Region> = {
    // North America
    "united states": "north_america", "usa": "north_america", "u.s.": "north_america",
    "canada": "north_america", "mexico": "north_america",
    // Europe
    "united kingdom": "europe", "ireland": "europe", "france": "europe", "germany": "europe",
    "netherlands": "europe", "spain": "europe", "portugal": "europe", "sweden": "europe",
    "norway": "europe", "denmark": "europe", "finland": "europe", "poland": "europe",
    "italy": "europe", "switzerland": "europe", "austria": "europe", "belgium": "europe",
    "czech republic": "europe", "czechia": "europe", "romania": "europe", "hungary": "europe",
    "greece": "europe", "estonia": "europe", "lithuania": "europe", "latvia": "europe",
    // Asia
    "india": "asia", "china": "asia", "japan": "asia", "singapore": "asia", "south korea": "asia",
    "korea": "asia", "vietnam": "asia", "thailand": "asia", "malaysia": "asia",
    "philippines": "asia", "indonesia": "asia", "hong kong": "asia", "taiwan": "asia",
    "pakistan": "asia", "sri lanka": "asia",
    // Oceania
    "australia": "oceania", "new zealand": "oceania",
    // LATAM
    "brazil": "latin_america", "argentina": "latin_america", "chile": "latin_america",
    "colombia": "latin_america", "peru": "latin_america", "uruguay": "latin_america",
    "ecuador": "latin_america", "bolivia": "latin_america",
    // Middle East
    "united arab emirates": "middle_east", "uae": "middle_east", "israel": "middle_east",
    "saudi arabia": "middle_east", "qatar": "middle_east", "bahrain": "middle_east",
    "oman": "middle_east", "jordan": "middle_east", "turkey": "middle_east", "turkiye": "middle_east",
    // Africa
    "south africa": "africa", "nigeria": "africa", "kenya": "africa", "egypt": "africa",
    "morocco": "africa", "ghana": "africa", "ethiopia": "africa", "tanzania": "africa",
};

// City hints (add more as needed)
const CITY_TO_REGION: Record<string, Region> = {
    // NA
    "new york": "north_america", "boston": "north_america", "chicago": "north_america", "seattle": "north_america",
    "san francisco": "north_america", "austin": "north_america", "atlanta": "north_america", "los angeles": "north_america",
    "toronto": "north_america", "vancouver": "north_america", "montreal": "north_america", "ottawa": "north_america",
    // Europe
    "london": "europe", "paris": "europe", "berlin": "europe", "amsterdam": "europe", "dublin": "europe", "madrid": "europe",
    "barcelona": "europe", "zurich": "europe", "warsaw": "europe", "milan": "europe", "lisbon": "europe", "prague": "europe",
    "stockholm": "europe", "copenhagen": "europe", "helsinki": "europe", "rome": "europe", "munich": "europe",
    // Asia (incl. India aliases)
    "singapore": "asia", "tokyo": "asia", "seoul": "asia", "beijing": "asia", "shanghai": "asia", "hong kong": "asia",
    "taipei": "asia", "kuala lumpur": "asia", "bangkok": "asia", "manila": "asia", "jakarta": "asia",
    "bengaluru": "asia", "bangalore": "asia", "mumbai": "asia", "pune": "asia", "hyderabad": "asia",
    "chennai": "asia", "gurgaon": "asia", "gurugram": "asia", "noida": "asia", "delhi": "asia", "new delhi": "asia",
    "ahmedabad": "asia", "kolkata": "asia",
    // Oceania
    "sydney": "oceania", "melbourne": "oceania", "auckland": "oceania", "brisbane": "oceania",
    // LATAM
    "sao paulo": "latin_america", "rio de janeiro": "latin_america", "buenos aires": "latin_america",
    "bogota": "latin_america", "lima": "latin_america", "montevideo": "latin_america", "santiago": "latin_america",
    "mexico city": "latin_america", "guadalajara": "latin_america",
    // Middle East
    "dubai": "middle_east", "abu dhabi": "middle_east", "riyadh": "middle_east", "doha": "middle_east", "tel aviv": "middle_east",
    "istanbul": "middle_east",
    // Africa
    "johannesburg": "africa", "cape town": "africa", "nairobi": "africa", "lagos": "africa", "cairo": "africa", "casablanca": "africa",
};

export function regionFromLocation(raw?: string | null): Region | null {
    if (!raw) return null;
    const s = norm(raw);

    // quick keywords
    for (const [re, region] of KEYWORDS) {
        if (re.test(s)) return region;
    }

    // US states like "Austin, TX" or "Remote - US"
    if (/\b(united states|u\.?s\.?a?\.?)\b/.test(s)) return "north_america";
    for (const abbr of US_STATE_ABBRS) {
        if (new RegExp(`\\b${abbr}\\b`).test(s)) return "north_america";
    }

    // Canada provinces & country
    if (/\bcanada\b/.test(s)) return "north_america";
    for (const token of CA_PROV) {
        if (new RegExp(`\\b${token}\\b`).test(s)) return "north_america";
    }

    // countries
    for (const [country, region] of Object.entries(COUNTRY_TO_REGION)) {
        if (s.includes(country)) return region;
    }

    // cities
    for (const [city, region] of Object.entries(CITY_TO_REGION)) {
        if (s.includes(city)) return region;
    }

    return null;
}
