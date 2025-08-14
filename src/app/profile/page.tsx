"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

/* ---------- Types (same DTO shape as your API) ---------- */
type Visibility = "everyone" | "employers" | "private";
type RemotePreference = "remote" | "hybrid" | "onsite" | "noPreference";
type Seniority = "intern" | "junior" | "mid" | "senior" | "staff" | "principal" | "lead";

type ProfileDTO = {
  name: string;
  email: string;
  phone: string;
  location: string;
  visibility: Visibility;
  openToWork: boolean;

  website: string;
  linkedin: string;
  github: string;
  portfolio: string;

  yearsExperience: number | null;
  seniority: Seniority | null;
  skills: string[];
  industries: string[];
  summary: string;

  desiredTitle: string;
  desiredSalaryMin: number | null;
  desiredSalaryMax: number | null;
  salaryCurrency: string | null;
  remotePreference: RemotePreference;
  willingToRelocate: boolean;
  jobTypes: string[];
  preferredLocations: string[];

  notifications: { jobMatches?: boolean; companyUpdates?: boolean };

  stats: {
    overallResponseRate: number;
    totalApplications: number;
    medianResponseDays: number | null;
  };
};

/* ---------- Tabs ---------- */
const TABS = ["basic", "resume", "qualifications", "preferences", "notifications", "applications"] as const;
type TabKey = typeof TABS[number];
const TAB_LABEL: Record<TabKey, string> = {
  basic: "Basic Info",
  resume: "Resume & Links",
  qualifications: "Qualifications",
  preferences: "Job Preferences",
  notifications: "Notifications",
  applications: "Application Insights",
};

export default function ProfilePage() {
  const [form, setForm] = useState<ProfileDTO | null>(null);
  const [initial, setInitial] = useState<ProfileDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isDirty = useMemo(() => form && initial && JSON.stringify(form) !== JSON.stringify(initial), [form, initial]);

  // URL tab state (?tab=)
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const tabFromUrl = (sp.get("tab") as TabKey) || "basic";
  const [tab, setTab] = useState<TabKey>(TABS.includes(tabFromUrl as any) ? tabFromUrl : "basic");
  useEffect(() => setTab(TABS.includes(tabFromUrl as any) ? tabFromUrl : "basic"), [tabFromUrl]);

  const setTabInUrl = useCallback(
    (t: TabKey) => {
      const next = new URLSearchParams(sp.toString());
      next.set("tab", t);
      router.replace(`${pathname}?${next.toString()}`);
      setTab(t);
    },
    [router, pathname, sp]
  );

  // Load
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch("/api/profile", { cache: "no-store" });
        if (!res.ok) throw new Error(await res.text());
        const data = (await res.json()) as ProfileDTO;
        if (active) {
          setForm(data);
          setInitial(data);
        }
      } catch (e: any) {
        setError(e?.message ?? "Failed to load profile");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const update = <K extends keyof ProfileDTO>(key: K, value: ProfileDTO[K]) =>
    setForm((p) => (p ? { ...p, [key]: value } : p));

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
      const saved = (await res.json()) as ProfileDTO;
      setInitial(saved);
      setForm(saved);
    } catch (e: any) {
      setError(e?.message ?? "Save failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !form) {
    return (
      <section className="mx-auto max-w-4xl p-8 space-y-4">
        <div className="h-8 w-48 animate-pulse rounded bg-gray-200" />
        <div className="h-4 w-72 animate-pulse rounded bg-gray-200" />
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-4xl p-6 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{form.name || "Your profile"}</h1>
        </div>
        <div className="flex gap-2">
          <button
            className="rounded-lg border px-4 py-2 disabled:opacity-60"
            onClick={() => setForm(initial)}
            disabled={!isDirty || saving}
          >
            Cancel
          </button>
          <button
            className="rounded-lg bg-black px-4 py-2 text-white disabled:opacity-60"
            onClick={patch}
            disabled={!isDirty || saving}
          >
            {saving ? "Saving..." : "Save changes"}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div role="tablist" aria-label="Profile sections" className="flex flex-wrap gap-2 border-b">
        {TABS.map((t) => (
          <button
            key={t}
            role="tab"
            aria-selected={tab === t}
            onClick={() => setTabInUrl(t)}
            className={`rounded-t-lg px-3 py-2 text-sm ${
              tab === t ? "bg-black text-white" : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            {TAB_LABEL[t]}
          </button>
        ))}
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>
      )}

      {/* Panels */}
      <div role="tabpanel" hidden={tab !== "basic"} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Name" value={form.name} onChange={(v) => update("name", v)} required />
          <Field label="Email" type="email" value={form.email} onChange={(v) => update("email", v)} required />
          <Field label="Phone" value={form.phone} onChange={(v) => update("phone", v)} />
          <Field label="Location" value={form.location} onChange={(v) => update("location", v)} placeholder="City, State, Zip" />
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <Toggle label="Open to work" checked={form.openToWork} onChange={(v) => update("openToWork", v)} />
          <Select
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

      <div role="tabpanel" hidden={tab !== "resume"} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Website" value={form.website} onChange={(v) => update("website", v)} />
          <Field label="LinkedIn" value={form.linkedin} onChange={(v) => update("linkedin", v)} />
          <Field label="GitHub" value={form.github} onChange={(v) => update("github", v)} />
          <Field label="Portfolio" value={form.portfolio} onChange={(v) => update("portfolio", v)} />
        </div>
      </div>

      <div role="tabpanel" hidden={tab !== "qualifications"} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Field
            label="Years of experience"
            type="number"
            value={form.yearsExperience == null ? "" : String(form.yearsExperience)}
            onChange={(v) => update("yearsExperience", v ? Number(v) : null)}
            min={0}
          />
          <Select
            label="Seniority"
            value={form.seniority ?? ""}
            options={[
              { value: "", label: "—" },
              { value: "intern", label: "Intern" },
              { value: "junior", label: "Junior" },
              { value: "mid", label: "Mid" },
              { value: "senior", label: "Senior" },
              { value: "staff", label: "Staff" },
              { value: "principal", label: "Principal" },
              { value: "lead", label: "Lead" },
            ]}
            onChange={(v) => update("seniority", (v || null) as any)}
          />
          <Field label="Desired title" value={form.desiredTitle} onChange={(v) => update("desiredTitle", v)} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TagInput label="Skills" values={form.skills} onChange={(vals) => update("skills", vals)} placeholder="Add a skill and press Enter" />
          <TagInput label="Industries" values={form.industries} onChange={(vals) => update("industries", vals)} placeholder="Add an industry and press Enter" />
        </div>
        <Textarea label="Summary" value={form.summary} onChange={(v) => update("summary", v)} placeholder="Short bio or highlights..." />
      </div>

      <div role="tabpanel" hidden={tab !== "preferences"} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Field
            label="Min salary"
            type="number"
            value={form.desiredSalaryMin == null ? "" : String(form.desiredSalaryMin)}
            onChange={(v) => update("desiredSalaryMin", v ? Number(v) : null)}
            min={0}
          />
          <Field
            label="Max salary"
            type="number"
            value={form.desiredSalaryMax == null ? "" : String(form.desiredSalaryMax)}
            onChange={(v) => update("desiredSalaryMax", v ? Number(v) : null)}
            min={0}
          />
          <Field label="Currency" value={form.salaryCurrency ?? "USD"} onChange={(v) => update("salaryCurrency", v)} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Select
            label="Work setting"
            value={form.remotePreference}
            options={[
              { value: "noPreference", label: "No preference" },
              { value: "remote", label: "Remote" },
              { value: "hybrid", label: "Hybrid" },
              { value: "onsite", label: "On-site" },
            ]}
            onChange={(v) => update("remotePreference", v as RemotePreference)}
          />
          <Toggle label="Willing to relocate" checked={form.willingToRelocate} onChange={(v) => update("willingToRelocate", v)} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TagInput label="Job types" values={form.jobTypes} onChange={(vals) => update("jobTypes", vals)} placeholder="e.g., full-time, contract…" />
          <TagInput label="Preferred locations" values={form.preferredLocations} onChange={(vals) => update("preferredLocations", vals)} placeholder="e.g., Remote, Raleigh NC…" />
        </div>
      </div>

      <div role="tabpanel" hidden={tab !== "notifications"} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Toggle
            label="Job match emails"
            checked={!!form.notifications?.jobMatches}
            onChange={(v) => update("notifications", { ...form.notifications, jobMatches: v })}
          />
          <Toggle
            label="Company updates"
            checked={!!form.notifications?.companyUpdates}
            onChange={(v) => update("notifications", { ...form.notifications, companyUpdates: v })}
          />
        </div>
      </div>

      <div role="tabpanel" hidden={tab !== "applications"} className="space-y-4">
        <div className="grid grid-cols-3 gap-4 text-center">
          <StatCard label="Overall Response Rate" value={`${form.stats.overallResponseRate}%`} />
          <StatCard label="Total Applications" value={String(form.stats.totalApplications)} />
          <StatCard
            label="Median Response Time"
            value={form.stats.medianResponseDays == null ? "—" : `${form.stats.medianResponseDays} days`}
          />
        </div>
        <p className="text-sm text-gray-600">
          Tip: we can show your recent applications here and surface per-company response rates next.
        </p>
      </div>

      {!isDirty && <p className="text-sm text-gray-500">All changes saved</p>}
    </section>
  );
}

/* ---------- Reusable UI ---------- */
function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border p-4">
      <p className="text-lg font-bold">{value}</p>
      <p className="text-gray-500 text-sm">{label}</p>
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
  min,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
  min?: number;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-gray-700">
        {label}
        {required && " *"}
      </span>
      <input
        type={type}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        min={min}
        className="w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-black/20"
      />
    </label>
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
      <span className="mb-1 block text-sm font-medium text-gray-700">{label}</span>
      <textarea
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={4}
        className="w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-black/20"
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
      <span className="text-sm text-gray-800">{label}</span>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`h-6 w-11 rounded-full border ${checked ? "bg-black" : "bg-gray-200"} relative transition-colors`}
        aria-pressed={checked}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${
            checked ? "right-0.5" : "left-0.5"
          }`}
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
      <span className="mb-1 block text-sm font-medium text-gray-700">{label}</span>
      <select
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value as T | "")}
        className="w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-black/20"
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
      <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>
      <div className="flex flex-wrap items-center gap-2 rounded-lg border p-2">
        {values.map((v, i) => (
          <span key={`${v}-${i}`} className="flex items-center gap-1 rounded-full border px-2 py-1 text-sm">
            {v}
            <button
              type="button"
              className="text-gray-500 hover:text-black"
              onClick={() => remove(i)}
              aria-label={`Remove ${v}`}
            >
              ×
            </button>
          </span>
        ))}
        <input
          className="flex-1 min-w-[140px] outline-none"
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
