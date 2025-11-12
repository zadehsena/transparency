"use client";
import clsx from "clsx";

export type ProfileTabKey = "profile" | "applications" | "settings";
const LABEL: Record<ProfileTabKey, string> = {
    profile: "Profile",
    applications: "Applications",
    settings: "Settings",
};

export default function ProfileTabs({
    active,
    onChange,
}: {
    active: ProfileTabKey;
    onChange: (t: ProfileTabKey) => void;
}) {
    const TABS: ProfileTabKey[] = ["profile", "applications", "settings"];

    return (
        <div className="border-b border-gray-300 dark:border-gray-700 mt-4 mb-2">
            <div className="flex gap-3 overflow-x-auto" role="tablist" aria-label="Profile tabs">
                {TABS.map((key) => (
                    <button
                        key={key}
                        role="tab"
                        aria-selected={active === key}
                        aria-controls={`panel-${key}`}
                        onClick={() => onChange(key)}
                        className={clsx(
                            "relative px-5 py-3 text-base font-medium rounded-t-lg transition-colors",
                            active === key
                                ? "text-gray-200 border-b-2 border-gray-400 bg-gray-800/50"
                                : "text-gray-400 hover:text-white hover:bg-gray-800/30",
                        )}
                    >
                        {LABEL[key]}
                    </button>
                ))}
            </div>
        </div>
    );
}
