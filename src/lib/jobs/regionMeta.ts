export type Region =
    | "north_america"
    | "europe"
    | "asia"
    | "oceania"
    | "latin_america"
    | "middle_east"
    | "africa"
    | "remote"
    | "global";

export const REGION_ORDER: Region[] = [
    "north_america",
    "europe",
    "asia",
    "oceania",
    "latin_america",
    "middle_east",
    "africa",
    "remote",
    "global",
];

export const REGION_LABEL: Record<Region, string> = {
    north_america: "North America",
    europe: "Europe",
    asia: "Asia",
    oceania: "Oceania",
    latin_america: "Latin America",
    middle_east: "Middle East",
    africa: "Africa",
    remote: "Remote",
    global: "Global / Worldwide",
};

// (Optional) simple blurbs under each tile
export const REGION_BLURB: Record<Region, string> = {
    north_america: "US, Canada, Mexico",
    europe: "UK, EU, Iceland, Ukraine, etc.",
    asia: "India, SEA, East Asia",
    oceania: "Australia, New Zealand",
    latin_america: "Mexico & Central/South America",
    middle_east: "GCC & neighbors",
    africa: "Across the continent",
    remote: "Explicitly remote / anywhere",
    global: "Multi-region / worldwide",
};

// swap these with your own assets if you like
export const REGION_ICONS: Record<Region, string> = {
    north_america: "/images/regions/global.png",
    europe: "/images/regions/europe.png",
    asia: "/images/regions/asia.png",
    oceania: "/images/regions/global.png",
    latin_america: "/images/regions/global.png",
    middle_east: "/images/regions/global.png",
    africa: "/images/regions/africa.png",
    remote: "/images/regions/remote.png",
    global: "/images/regions/global.png",
};

// URL <-> enum helpers
export function parseRegionParam(raw: string): Region | null {
    const key = raw?.toLowerCase().replace(/[^a-z_]/g, "") as Region;
    return (REGION_ORDER as string[]).includes(key) ? (key as Region) : null;
}

export function regionToPath(r: Region) {
    return `/jobs/${r}`;
}
