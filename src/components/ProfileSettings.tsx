"use client";

import { useMemo, useState } from "react";

type Visibility = "everyone" | "members" | "private";

export type ProfileSettingsValue = {
    openToWork?: boolean | null;
    visibility?: Visibility | null;
    notifications?: {
        weeklyEmail?: boolean;
        product?: boolean;
        applicationUpdates?: boolean;
    } | null;
};

export default function ProfileSettings({
    initial,
    onSaved,
}: {
    initial: ProfileSettingsValue;
    onSaved?: (saved: ProfileSettingsValue) => void;
}) {
    const [form, setForm] = useState<ProfileSettingsValue>({
        openToWork: initial.openToWork ?? true,
        visibility: initial.visibility ?? "everyone",
        notifications: {
            weeklyEmail: initial.notifications?.weeklyEmail ?? true,
            product: initial.notifications?.product ?? false,
            applicationUpdates: initial.notifications?.applicationUpdates ?? true,
        },
    });
    const [saving, setSaving] = useState(false);
    const [err, setErr] = useState<string | null>(null);

    const isDirty = useMemo(
        () => JSON.stringify(form) !== JSON.stringify({
            openToWork: initial.openToWork ?? true,
            visibility: initial.visibility ?? "everyone",
            notifications: {
                weeklyEmail: initial.notifications?.weeklyEmail ?? true,
                product: initial.notifications?.product ?? false,
                applicationUpdates: initial.notifications?.applicationUpdates ?? true,
            },
        }),
        [form, initial]
    );

    const update = <K extends keyof ProfileSettingsValue>(k: K, v: ProfileSettingsValue[K]) =>
        setForm((prev) => ({ ...prev, [k]: v }));

    const updateNotif = (k: keyof NonNullable<ProfileSettingsValue["notifications"]>, v: boolean) =>
        setForm((prev) => ({
            ...prev,
            notifications: { ...(prev.notifications ?? {}), [k]: v },
        }));

    const reset = () => {
        setForm({
            openToWork: initial.openToWork ?? true,
            visibility: initial.visibility ?? "everyone",
            notifications: {
                weeklyEmail: initial.notifications?.weeklyEmail ?? true,
                product: initial.notifications?.product ?? false,
                applicationUpdates: initial.notifications?.applicationUpdates ?? true,
            },
        });
        setErr(null);
    };

    const save = async () => {
        setSaving(true);
        setErr(null);
        try {
            const res = await fetch("/api/profile", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });
            if (!res.ok) throw new Error(await res.text());
            const saved = await res.json();
            onSaved?.(saved);
        } catch (e: unknown) {
            const message =
                e instanceof Error ? e.message : "Failed to save settings";
            setErr(message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <section className="space-y-6">
            {/* Privacy */}
            <Card title="Privacy">
                <div className="grid gap-4 sm:grid-cols-2">
                    <Select
                        label="Profile visibility"
                        value={(form.visibility ?? "everyone") as Visibility}
                        options={[
                            { value: "everyone", label: "Everyone" },
                            { value: "members", label: "Members only" },
                            { value: "private", label: "Private" },
                        ]}
                        onChange={(v) => update("visibility", v)}
                    />
                    <Toggle
                        label="Open to work"
                        checked={!!form.openToWork}
                        onChange={(v) => update("openToWork", v)}
                    />
                </div>
            </Card>

            {/* Notifications */}
            <Card title="Notifications">
                <div className="space-y-3">
                    <Toggle
                        label="Weekly email summary"
                        checked={!!form.notifications?.weeklyEmail}
                        onChange={(v) => updateNotif("weeklyEmail", v)}
                    />
                    <Toggle
                        label="Application status updates"
                        checked={!!form.notifications?.applicationUpdates}
                        onChange={(v) => updateNotif("applicationUpdates", v)}
                    />
                    <Toggle
                        label="Product updates"
                        checked={!!form.notifications?.product}
                        onChange={(v) => updateNotif("product", v)}
                    />
                </div>
            </Card>

            {/* Account (placeholders you can wire later) */}
            <Card title="Account">
                <div className="flex flex-wrap gap-3">
                    <button
                        type="button"
                        className="rounded-lg border px-4 py-2 text-sm dark:border-gray-700 dark:text-gray-200"
                        onClick={() => alert("Export coming soon")}
                    >
                        Export my data
                    </button>
                    <button
                        type="button"
                        className="rounded-lg border px-4 py-2 text-sm text-red-600 border-red-300 dark:border-red-800"
                        onClick={() => alert("Delete account flow coming soon")}
                    >
                        Delete account
                    </button>
                </div>
            </Card>

            {/* Error + Save bar */}
            <div className="flex items-center justify-end gap-3">
                {err && <p className="text-sm text-red-600">{err}</p>}
                <button
                    className="rounded-lg border px-4 py-2 text-sm dark:border-gray-700 dark:text-gray-200"
                    onClick={reset}
                    disabled={!isDirty || saving}
                >
                    Reset
                </button>
                <button
                    className="rounded-lg bg-gray-900 px-4 py-2 text-sm text-white dark:bg-gray-100 dark:text-gray-900 disabled:opacity-60"
                    onClick={save}
                    disabled={!isDirty || saving}
                >
                    {saving ? "Saving…" : "Save settings"}
                </button>
            </div>
        </section>
    );
}

/* ----- tiny local UI bits (kept here so the component is standalone) ----- */
function Card({ title, children }: { title?: string; children: React.ReactNode }) {
    return (
        <section className="rounded-2xl border bg-white p-5 shadow-sm ring-1 ring-gray-100 dark:border-gray-800 dark:bg-gray-900 dark:ring-gray-800/80">
            {title && <h3 className="mb-3 text-sm font-semibold text-gray-800 dark:text-gray-200">{title}</h3>}
            {children}
        </section>
    );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
    return (
        <label className="flex items-center justify-between gap-3">
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
    label: string; value: T; options: { value: T; label: string }[]; onChange: (v: T) => void;
}) {
    return (
        <label className="block">
            <span className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">{label}</span>
            <select
                value={value}
                onChange={(e) => onChange(e.target.value as T)}
                className="w-full rounded-lg border px-3 py-2 outline-none ring-1 ring-transparent focus:ring-2 focus:ring-gray-900/20 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-100"
            >
                {options.map((o) => (
                    <option key={`${o.label}-${o.value}`} value={o.value}>
                        {o.label}
                    </option>
                ))}
            </select>
        </label>
    );
}
