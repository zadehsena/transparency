// src/app/profile/page.tsx
"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

/* =========================
   Types
   ========================= */
type Profile = {
  // kept minimal
  name?: string | null;          // for fallback header only
  email: string;
  phone: string;
  location: string;

  // onboarding fields we want
  firstName?: string | null;
  lastName?: string | null;
  birthdate?: string | null;     // ISO "YYYY-MM-DD"
  interests?: string[] | null;
  level?: "Entry" | "Mid" | "Senior" | "Director" | "VP" | "Other" | null;

  educationSchool?: string | null;
  educationDegree?: string | null;
  educationField?: string | null;
  educationGraduationYear?: number | null;

  // Current job (single set)
  currentCompany?: string | null;
  currentTitle?: string | null;
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
const LABEL: Record<TabKey, string> = { profile: "Profile", applications: "Applications" };
const ALL_INTERESTS = ["Software", "Data", "Product", "Design", "DevOps", "Security"] as const;
const LEVELS = ["Entry", "Mid", "Senior", "Director", "VP", "Other"] as const;

/* =========================
   Helpers
   ========================= */
function computeAppStats(apps: Application[] | null | undefined) {
  const list = Array.isArray(apps) ? apps : [];
  const total = list.length;
  const responded = list.filter(a =>
    a.status === "screen" || a.status === "interview" || a.status === "offer" || a.status === "rejected"
  ).length;
  const overallResponseRate = total ? Math.round((responded / total) * 100) : 0;

  const diffs = list.filter(a => a.firstResponseAt).map(a => {
    const applied = new Date(a.appliedAt).getTime();
    const first = new Date(a.firstResponseAt as string).getTime();
    return Math.max(0, (first - applied) / 86400000);
  }).sort((a, b) => a - b);

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
  return Number.isNaN(d.getTime()) ? "—" :
    d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}
function isoForDateInput(iso?: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "" : d.toISOString().slice(0, 10);
}

/* =========================
   Skeleton
   ========================= */
function Skeleton() {
  return (
    <section className="mx-auto max-w-6xl space-y-4 px-6 py-16">
      <div className="h-8 w-48 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
      <div className="h-4 w-72 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
    </section>
  );
}

/* =========================
   Content
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

  // tabs in URL
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const initialTab = (sp.get("tab") as TabKey) || "profile";
  const [tab, setTab] = useState<TabKey>(["profile", "applications"].includes(initialTab) ? initialTab : "profile");

  useEffect(() => {
    const current = sp.get("tab");
    setTab(["profile", "applications"].includes(String(current)) ? (current as TabKey) : "profile");
  }, [sp]);

  const setTabInUrl = useCallback((t: TabKey) => {
    const next = new URLSearchParams(sp.toString());
    next.set("tab", t);
    router.replace(`${pathname}?${next.toString()}`);
    setTab(t);
  }, [router, pathname, sp]);

  // load
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
    return () => { active = false; };
  }, []);

  const update = <K extends keyof Profile>(key: K, value: Profile[K]) =>
    setForm(prev => (prev ? { ...prev, [key]: value } : prev));

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

  const headerName =
    (form.firstName || form.lastName)
      ? [form.firstName, form.lastName].filter(Boolean).join(" ")
      : form.name || "Your profile";

  const { total, overallResponseRate, medianResponseDays } = computeAppStats(apps);

  return (
    <section className="mx-auto max-w-6xl px-6 py-16">

      {/* Tabs */}
      <div className="mb-6 flex flex-wrap gap-2">
        {TABS.map(t => {
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
              {LABEL[t]}
            </button>
          );
        })}
      </div>

      {/* CONTENT */}
      <div className="space-y-8">
        {/* Profile tab — minimal */}
        {/* Profile tab — PayPal-style layout */}
        <div role="tabpanel" hidden={tab !== "profile"}>
          <div className="grid gap-6 lg:grid-cols-3">
            {/* LEFT: main column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Profile hero */}
              <Card>
                <div className="flex items-center gap-4">
                  <AvatarCircle name={headerName} />
                  <div className="flex-1">
                    <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">{headerName}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {(form.level ?? "—")}{form.location ? ` · ${form.location}` : ""}
                    </div>
                  </div>
                </div>
              </Card>

              {/* Personal details */}
              <Card title="Personal details">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <Field label="First name" value={form.firstName ?? ""} onChange={(v) => update("firstName", v)} />
                  <Field label="Last name" value={form.lastName ?? ""} onChange={(v) => update("lastName", v)} />
                  <Field label="Birthdate" type="date" value={isoForDateInput(form.birthdate)} onChange={(v) => update("birthdate", v)} />
                </div>
                <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
                  <Field label="Location" value={form.location} onChange={(v) => update("location", v)} placeholder="City, State" />
                  <Select
                    label="Level"
                    value={(form.level ?? "") as any}
                    options={[{ value: "", label: "Select level" }, "Entry", "Mid", "Senior", "Director", "VP", "Other"].map((v: any) =>
                      typeof v === "string" ? ({ value: v, label: v }) : v
                    )}
                    onChange={(v) => update("level", (v || null) as any)}
                  />
                </div>
              </Card>

              {/* Interests */}
              <Card title="Interests">
                <InterestsPicker
                  label=""
                  options={["Software", "Data", "Product", "Design", "DevOps", "Security"]}
                  values={(form.interests ?? []) as string[]}
                  onChange={(vals) => update("interests", vals)}
                />
              </Card>

              {/* Current job */}
              <Card title="Current job">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <Field
                    label="Company"
                    value={form.currentCompany ?? ""}
                    onChange={(v) => update("currentCompany", v)}
                  />
                  <Field
                    label="Title"
                    value={form.currentTitle ?? ""}
                    onChange={(v) => update("currentTitle", v)}
                  />
                  {/* yearsExperience / seniority exist in Prisma, but you said you don't want them now */}
                </div>
              </Card>

              {/* Education */}
              <Card title="Education">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                  <Field
                    label="School"
                    value={form.educationSchool ?? ""}
                    onChange={(v) => update("educationSchool", v)}
                  />
                  <Field
                    label="Degree"
                    value={form.educationDegree ?? ""}
                    onChange={(v) => update("educationDegree", v)}
                  />
                  <Field
                    label="Field"
                    value={form.educationField ?? ""}
                    onChange={(v) => update("educationField", v)}
                  />
                  <Field
                    label="Graduation year"
                    type="number"
                    value={String(form.educationGraduationYear ?? "")}
                    onChange={(v) =>
                      update("educationGraduationYear", v ? Number(v) : null)
                    }
                  />
                </div>
              </Card>
            </div>

            {/* RIGHT: side column */}
            <div className="space-y-6">
              <Card title="Email" action={<MiniAction onClick={() => { }} label="Edit" />}>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-900 dark:text-gray-100">{form.email || "—"}</div>
                  <div className="rounded-full border px-2 py-0.5 text-xs text-gray-600 dark:border-gray-700 dark:text-gray-300">Primary</div>
                </div>
              </Card>

              <Card title="Phone" action={<MiniAction onClick={() => { }} label="Edit" />}>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-900 dark:text-gray-100">{form.phone || "—"}</div>
                  <div className="rounded-full border px-2 py-0.5 text-xs text-gray-600 dark:border-gray-700 dark:text-gray-300">Mobile</div>
                </div>
              </Card>

              {/* Apps summary */}
              <Card title="Applications summary">
                <div className="grid grid-cols-3 gap-3 text-center">
                  <SmallStat label="Response Rate" value={`${overallResponseRate}%`} />
                  <SmallStat label="Total" value={`${total}`} />
                  <SmallStat label="Median Resp." value={medianResponseDays == null ? "—" : `${medianResponseDays}d`} />
                </div>
              </Card>

              {/* Save / Cancel pinned here for quick access */}
              <div className="flex justify-end gap-2">
                <button
                  className="rounded-lg border px-4 py-2 text-sm dark:border-gray-700 dark:text-gray-200"
                  onClick={() => setForm(initial)}
                  disabled={!isDirty || saving}
                >
                  Cancel
                </button>
                <button
                  className="rounded-lg bg-gray-900 px-4 py-2 text-sm text-white dark:bg-gray-100 dark:text-gray-900"
                  onClick={patch}
                  disabled={!isDirty || saving}
                >
                  {saving ? "Saving…" : "Save"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Applications tab */}
        <div role="tabpanel" hidden={tab !== "applications"}>
          <div className="mb-6 rounded-2xl border bg-white p-6 text-center shadow-sm ring-1 ring-gray-100 dark:border-gray-800 dark:bg-gray-900 dark:ring-gray-800/80">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <StatCard label="Overall Response Rate" value={`${computeAppStats(apps).overallResponseRate}%`} />
              <StatCard label="Total Applications" value={`${computeAppStats(apps).total}`} />
              <StatCard label="Median Response Time" value={
                computeAppStats(apps).medianResponseDays == null ? "—" : `${computeAppStats(apps).medianResponseDays} days`
              } />
            </div>
          </div>

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
    </section >
  );
}

/* =========================
   Default
   ========================= */
export default function ProfilePage() {
  return (
    <Suspense fallback={<Skeleton />}>
      <ProfileContent />
    </Suspense>
  );
}

/* =========================
   Small UI bits
   ========================= */
function Field({
  label, value, onChange, type = "text", placeholder,
}: {
  label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">{label}</span>
      <input
        type={type}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border px-3 py-2 outline-none ring-1 ring-transparent focus:ring-2 focus:ring-gray-900/20 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-100"
      />
    </label>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-3">
      <span className="text-sm text-gray-800 dark:text-gray-200">{label}</span>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 rounded-full border transition-colors dark:border-gray-700 ${checked ? "bg-gray-900" : "bg-gray-200 dark:bg-gray-800"}`}
        aria-pressed={checked}
      >
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${checked ? "right-0.5" : "left-0.5"}`} />
      </button>
    </label>
  );
}

function Select<T extends string>({
  label, value, options, onChange,
}: {
  label: string; value: T | ""; options: { value: T | ""; label: string }[]; onChange: (v: T | "") => void;
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
          <option key={`${o.label}-${o.value}`} value={o.value}>{o.label}</option>
        ))}
      </select>
    </label>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border p-4 text-center dark:border-gray-800">
      <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{value}</p>
      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{label}</p>
    </div>
  );
}

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
                  <a href={a.url} target="_blank" rel="noopener noreferrer" className="text-gray-900 underline underline-offset-2 hover:no-underline dark:text-gray-100">
                    View
                  </a>
                ) : <span className="text-gray-400">—</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function InterestsPicker({
  label, options, values, onChange,
}: {
  label: string; options: string[]; values: string[]; onChange: (vals: string[]) => void;
}) {
  const toggle = (opt: string) => {
    if (values.includes(opt)) onChange(values.filter((v) => v !== opt));
    else onChange([...values, opt]);
  };
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">{label}</label>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const active = values.includes(opt);
          return (
            <button
              type="button"
              key={opt}
              onClick={() => toggle(opt)}
              className={[
                "rounded-full border px-3 py-1 text-sm transition",
                active
                  ? "border-gray-900 bg-gray-900 text-white dark:border-gray-100 dark:bg-gray-100 dark:text-gray-900"
                  : "border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800/60",
              ].join(" ")}
              aria-pressed={active}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Card({
  title, action, children,
}: { title?: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border bg-white p-5 shadow-sm ring-1 ring-gray-100 dark:border-gray-800 dark:bg-gray-900 dark:ring-gray-800/80">
      {(title || action) && (
        <header className="mb-4 flex items-center justify-between">
          {title ? <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">{title}</h3> : <div />}
          {action}
        </header>
      )}
      {children}
    </section>
  );
}

function MiniAction({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button onClick={onClick} className="text-xs text-gray-600 underline hover:no-underline dark:text-gray-300">
      {label}
    </button>
  );
}

function SmallStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border p-3 dark:border-gray-800">
      <div className="text-base font-semibold text-gray-900 dark:text-gray-100">{value}</div>
      <div className="mt-1 text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400">{label}</div>
    </div>
  );
}

function AvatarCircle({ name }: { name: string }) {
  const initials = name.split(" ").filter(Boolean).map((s) => s[0]?.toUpperCase()).slice(0, 2).join("") || "U";
  return (
    <div className="grid h-14 w-14 place-items-center rounded-full bg-gray-200 text-sm font-semibold text-gray-700 dark:bg-gray-800 dark:text-gray-200">
      {initials}
    </div>
  );
}
