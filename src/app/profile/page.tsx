// src/app/profile/page.tsx
"use client";

import { useEffect, useMemo, useState, useCallback, Suspense } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

/* =========================
   Types / DTOs
   ========================= */
type Visibility = "everyone" | "employers" | "private";

type Profile = {
  name: string;
  email: string;
  phone: string;
  location: string;
  openToWork: boolean;
  visibility: Visibility;
  website?: string;
  linkedin?: string;
  github?: string;
  headline?: string;
  summary?: string;
  skills?: string[];
};

type Application = {
  id: string;
  company: string;
  title: string;
  status: "applied" | "screen" | "interview" | "offer" | "rejected";
  appliedAt: string;        // ISO
  url?: string;
  firstResponseAt?: string; // ISO (optional)
};

/* =========================
   Tabs
   ========================= */
const TABS = ["profile", "applications"] as const;
type TabKey = typeof TABS[number];
const TAB_LABEL: Record<TabKey, string> = {
  profile: "Profile",
  applications: "Applications",
};

function isTabKey(v: string | null): v is TabKey {
  return !!v && TABS.includes(v as TabKey);
}

/* =========================
   Helpers
   ========================= */
function computeAppStats(apps: Application[] | null | undefined) {
  const list = Array.isArray(apps) ? apps : [];
  const total = list.length;

  const responded = list.filter(
    (a) => a.status === "screen" || a.status === "interview" || a.status === "offer" || a.status === "rejected"
  ).length;

  const overallResponseRate = total ? Math.round((responded / total) * 100) : 0;

  const diffs = list
    .filter((a) => a.firstResponseAt)
    .map((a) => {
      const applied = new Date(a.appliedAt).getTime();
      const first = new Date(a.firstResponseAt as string).getTime();
      return Math.max(0, (first - applied) / (1000 * 60 * 60 * 24));
    })
    .sort((a, b) => a - b);

  let medianResponseDays: number | null = null;
  if (diffs.length) {
    const mid = Math.floor(diffs.length / 2);
    const m = diffs.length % 2 ? diffs[mid] : (diffs[mid - 1] + diffs[mid]) / 2;
    medianResponseDays = Math.round(m * 10) / 10;
  }

  return { total, overallResponseRate, medianResponseDays };
}

function formatDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

/* =========================
   Skeleton
   ========================= */
function Skeleton() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-16 space-y-4">
      <div className="h-8 w-48 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
      <div className="h-4 w-72 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
    </section>
  );
}

/* =========================
   Content (uses useSearchParams)
   ========================= */
function ProfileContent() {
  const [form, setForm] = useState<Profile | null>(null);
  const [initial, setInitial] = useState<Profile | null>(null);
  const [apps, setApps] = useState<Application[] | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [, setError] = useState<string | null>(null);

  const isDirty = useMemo(
    () => form && initial && JSON.stringify(form) !== JSON.stringify(initial),
    [form, initial]
  );

  // URL tab state (?tab=profile|applications)
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const initialTab: TabKey = isTabKey(sp.get("tab")) ? (sp.get("tab") as TabKey) : "profile";
  const [tab, setTab] = useState<TabKey>(initialTab);

  useEffect(() => {
    const current = sp.get("tab");
    setTab(isTabKey(current) ? current : "profile");
  }, [sp]);

  const setTabInUrl = useCallback(
    (t: TabKey) => {
      const next = new URLSearchParams(sp.toString());
      next.set("tab", t);
      router.replace(`${pathname}?${next.toString()}`);
      setTab(t);
    },
    [router, pathname, sp]
  );

  // Load profile + apps
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [pRes, aRes] = await Promise.all([
          fetch("/api/profile", { cache: "no-store" }),
          fetch("/api/applications", { cache: "no-store" }),
        ]);

        if (!pRes.ok) throw new Error(await pRes.text());
        if (!aRes.ok) throw new Error(await aRes.text());

        const p = (await pRes.json()) as Profile;
        const raw = await aRes.json();
        const a: Application[] = Array.isArray(raw) ? raw : (raw?.applications ?? []);

        if (!active) return;

        setForm(p);
        setInitial(p);
        setApps(a);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Failed to load");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const update = <K extends keyof Profile>(key: K, value: Profile[K]) =>
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));

  const patch = async () => {
    if (!form) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error(await res.text());
      const saved = (await res.json()) as Profile;
      setInitial(saved);
      setForm(saved);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !form) return <Skeleton />;

  const { total, overallResponseRate, medianResponseDays } = computeAppStats(apps);

  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            {form.name || "Your profile"}
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Edit your info and track your applications.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            className="rounded-lg border px-5 py-2 text-gray-800 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800/60 disabled:opacity-60"
            onClick={() => setForm(initial)}
            disabled={!isDirty || saving}
          >
            Cancel
          </button>
          <button
            className="rounded-lg bg-gray-900 px-5 py-2 text-white transition hover:bg-black dark:bg-gray-100 dark:text-gray-900 disabled:opacity-60"
            onClick={patch}
            disabled={!isDirty || saving}
          >
            {saving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex flex-wrap gap-2">
        {TABS.map((t) => {
          const active = tab === t;
          return (
            <button
              key={t}
              role="tab"
              aria-selected={active}
              onClick={() => setTabInUrl(t)}
              className={[
                "rounded-lg px-3 py-2 text-sm transition",
                active
                  ? "bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900"
                  : "border text-gray-800 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800/60",
              ].join(" ")}
            >
              {TAB_LABEL[t]}
            </button>
          );
        })}
      </div>

      {/* CONTENT */}
      <div className="space-y-8">
        {/* Profile tab — minimal fields */}
        <div role="tabpanel" hidden={tab !== "profile"}>
          <div className="space-y-4 rounded-2xl border bg-white p-6 shadow-sm ring-1 ring-gray-100 dark:border-gray-800 dark:bg-gray-900 dark:ring-gray-800/80">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field label="Full name" value={form.name} onChange={(v) => update("name", v)} required />
              <Field label="Email" type="email" value={form.email} onChange={(v) => update("email", v)} required />
              <Field label="Phone" value={form.phone} onChange={(v) => update("phone", v)} />
              <Field label="Location" value={form.location} onChange={(v) => update("location", v)} placeholder="City, State" />
            </div>

            <Field label="Headline" value={form.headline ?? ""} onChange={(v) => update("headline", v)} placeholder="e.g., Backend Engineer" />

            <Textarea label="Summary" value={form.summary ?? ""} onChange={(v) => update("summary", v)} placeholder="Short bio or highlights…" />

            <TagInput
              label="Skills"
              values={form.skills ?? []}
              onChange={(vals) => update("skills", vals)}
              placeholder="Add a skill and press Enter"
            />

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <Field label="Website" value={form.website ?? ""} onChange={(v) => update("website", v)} />
              <Field label="LinkedIn" value={form.linkedin ?? ""} onChange={(v) => update("linkedin", v)} />
              <Field label="GitHub" value={form.github ?? ""} onChange={(v) => update("github", v)} />
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <Toggle label="Open to work" checked={form.openToWork} onChange={(v) => update("openToWork", v)} />
              <Select<Visibility>
                label="Profile visibility"
                value={form.visibility}
                options={[
                  { value: "everyone", label: "Everyone" },
                  { value: "employers", label: "Employers only" },
                  { value: "private", label: "Private" },
                ]}
                onChange={(v) => update("visibility", v as Visibility)}
              />
            </div>
          </div>
        </div>

        {/* Applications tab */}
        <div role="tabpanel" hidden={tab !== "applications"}>
          {/* Stats card — always visible */}
          <div className="mb-6 rounded-2xl border bg-white p-6 text-center shadow-sm ring-1 ring-gray-100 dark:border-gray-800 dark:bg-gray-900 dark:ring-gray-800/80">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <StatCard label="Overall Response Rate" value={`${overallResponseRate}%`} />
              <StatCard label="Total Applications" value={`${total}`} />
              <StatCard
                label="Median Response Time"
                value={medianResponseDays == null ? "—" : `${medianResponseDays} days`}
              />
            </div>
          </div>

          {/* Table/list card */}
          <div className="rounded-2xl border bg-white p-0 shadow-sm ring-1 ring-gray-100 dark:border-gray-800 dark:bg-gray-900 dark:ring-gray-800/80">
            {!apps ? (
              <div className="p-6 text-sm text-gray-600 dark:text-gray-400">Loading your applications…</div>
            ) : apps.length === 0 ? (
              <div className="p-6 text-sm text-gray-600 dark:text-gray-400">No applications yet.</div>
            ) : (
              <ApplicationTable apps={apps} />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

/* =========================
   Default export with Suspense
   ========================= */
export default function ProfilePage() {
  return (
    <Suspense fallback={<Skeleton />}>
      <ProfileContent />
    </Suspense>
  );
}

/* =========================
   UI bits (home-page styling)
   ========================= */
function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border p-4 text-center dark:border-gray-800">
      <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{value}</p>
      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{label}</p>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">
        {label}
        {required && " *"}
      </span>
      <input
        type={type}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="w-full rounded-lg border px-3 py-2 outline-none ring-1 ring-transparent focus:ring-2 focus:ring-gray-900/20 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-100"
      />
    </label>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-3">
      <span className="text-sm text-gray-800 dark:text-gray-200">{label}</span>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 rounded-full border transition-colors dark:border-gray-700 ${checked ? "bg-gray-900" : "bg-gray-200 dark:bg-gray-800"}`}
        aria-pressed={checked}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${checked ? "right-0.5" : "left-0.5"}`}
        />
      </button>
    </label>
  );
}

function Select<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T | "";
  options: { value: T | ""; label: string }[];
  onChange: (v: T | "") => void;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">{label}</span>
      <select
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value as T | "")}
        className="w-full rounded-lg border px-3 py-2 outline-none ring-1 ring-transparent focus:ring-2 focus:ring-gray-900/20 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-100"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

/* =========================
   Applications Table
   ========================= */
function ApplicationTable({ apps }: { apps: Application[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-gray-50 text-left dark:border-gray-800 dark:bg-gray-950">
            <th className="px-4 py-3 font-medium text-gray-700 dark:text-gray-200">Company</th>
            <th className="px-4 py-3 font-medium text-gray-700 dark:text-gray-200">Title</th>
            <th className="px-4 py-3 font-medium text-gray-700 dark:text-gray-200">Status</th>
            <th className="px-4 py-3 font-medium text-gray-700 dark:text-gray-200">Applied</th>
            <th className="px-4 py-3 font-medium text-gray-700 dark:text-gray-200">First Response</th>
            <th className="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody className="divide-y dark:divide-gray-800">
          {apps.map((a) => (
            <tr key={a.id} className="hover:bg-gray-50 dark:hover:bg-gray-950/60">
              <td className="px-4 py-3 text-gray-900 dark:text-gray-100">{a.company}</td>
              <td className="px-4 py-3 text-gray-900 dark:text-gray-100">{a.title}</td>
              <td className="px-4 py-3 capitalize text-gray-700 dark:text-gray-300">{a.status}</td>
              <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{formatDate(a.appliedAt)}</td>
              <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                {a.firstResponseAt ? formatDate(a.firstResponseAt) : "—"}
              </td>
              <td className="px-4 py-3 text-right">
                {a.url ? (
                  <a
                    href={a.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-900 underline underline-offset-2 hover:no-underline dark:text-gray-100"
                  >
                    View
                  </a>
                ) : (
                  <span className="text-gray-400">—</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Textarea({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">
        {label}
      </span>
      <textarea
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={4}
        className="w-full rounded-lg border px-3 py-2 outline-none ring-1 ring-transparent focus:ring-2 focus:ring-gray-900/20 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-100"
      />
    </label>
  );
}

function TagInput({
  label,
  values,
  onChange,
  placeholder,
}: {
  label: string;
  values: string[];
  onChange: (vals: string[]) => void;
  placeholder?: string;
}) {
  const [input, setInput] = useState("");

  const add = (val: string) => {
    const v = val.trim();
    if (!v || values.includes(v)) return;
    onChange([...values, v]);
    setInput("");
  };
  const remove = (idx: number) => {
    const next = values.slice();
    next.splice(idx, 1);
    onChange(next);
  };

  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">
        {label}
      </label>
      <div className="flex flex-wrap items-center gap-2 rounded-lg border p-2 dark:border-gray-800">
        {values.map((v, i) => (
          <span
            key={`${v}-${i}`}
            className="flex items-center gap-1 rounded-full border px-2 py-1 text-sm dark:border-gray-700"
          >
            {v}
            <button
              type="button"
              className="text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-gray-200"
              onClick={() => remove(i)}
              aria-label={`Remove ${v}`}
            >
              ×
            </button>
          </span>
        ))}
        <input
          className="min-w-[140px] flex-1 bg-transparent outline-none"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault();
              add(input);
            }
            if (e.key === "Backspace" && !input && values.length) {
              remove(values.length - 1);
            }
          }}
          placeholder={placeholder}
        />
      </div>
    </div>
  );
}
