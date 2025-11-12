// src/lib/aggregateJobs.ts
type Job = { postedAt?: string | Date | null };

function toUTCDate(d: string | Date) {
    const x = new Date(d);
    // normalize to midnight UTC for stable bucketing
    return new Date(Date.UTC(x.getUTCFullYear(), x.getUTCMonth(), x.getUTCDate()));
}

function fmt(d: Date) {
    const y = d.getUTCFullYear();
    const m = String(d.getUTCMonth() + 1).padStart(2, "0");
    const day = String(d.getUTCDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
}

function startOfISOWeekUTC(d: Date) {
    // Monday as start (ISO): (0=Sun … 6=Sat) -> convert to 1..7
    const day = d.getUTCDay() || 7;
    const monday = new Date(d);
    monday.setUTCDate(d.getUTCDate() - (day - 1));
    monday.setUTCHours(0, 0, 0, 0);
    return monday;
}

function startOfMonthUTC(d: Date) {
    return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1));
}

function addWeeksUTC(d: Date, n: number) {
    const x = new Date(d);
    x.setUTCDate(x.getUTCDate() + n * 7);
    return x;
}

function addMonthsUTC(d: Date, n: number) {
    const x = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + n, 1));
    return x;
}

export function aggregateWeekly(jobs: Job[], weeks = 26) {
    const counts = new Map<string, number>();

    for (const j of jobs) {
        if (!j.postedAt) continue;
        const d = toUTCDate(j.postedAt);
        const bucket = startOfISOWeekUTC(d);
        const key = fmt(bucket);
        counts.set(key, (counts.get(key) ?? 0) + 1);
    }

    // produce continuous series for the last N weeks
    const end = startOfISOWeekUTC(new Date());
    const start = addWeeksUTC(end, -(weeks - 1));

    const out: { date: string; count: number }[] = [];
    for (let t = new Date(start); t <= end; t = addWeeksUTC(t, 1)) {
        const key = fmt(t);
        out.push({ date: key, count: counts.get(key) ?? 0 });
    }
    return out;
}

export function aggregateMonthly(jobs: Job[], months = 12) {
    const counts = new Map<string, number>();

    for (const j of jobs) {
        if (!j.postedAt) continue;
        const d = toUTCDate(j.postedAt);
        const bucket = startOfMonthUTC(d);
        const key = fmt(bucket);
        counts.set(key, (counts.get(key) ?? 0) + 1);
    }

    const end = startOfMonthUTC(new Date());
    const start = addMonthsUTC(end, -(months - 1));

    const out: { date: string; count: number }[] = [];
    for (let t = new Date(start); t <= end; t = addMonthsUTC(t, 1)) {
        const key = fmt(t);
        out.push({ date: key, count: counts.get(key) ?? 0 });
    }
    return out;
}
