"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import clsx from "clsx";

// ✅ add "referrals"
export type CompanyTabKey = "overview" | "metrics" | "jobs" | "myapps" | "referrals";

export default function CompanyTabs({ active }: { active: CompanyTabKey }) {
  const router = useRouter();
  const pathname = usePathname();
  const search = useSearchParams();

  const setTab = (tab: CompanyTabKey) => {
    const next = new URLSearchParams(search.toString());
    if (tab === "overview") next.delete("tab");
    else next.set("tab", tab);
    router.replace(`${pathname}?${next.toString()}`, { scroll: false });
  };

  const tabs: { key: CompanyTabKey; label: string }[] = [
    { key: "overview", label: "Overview" },
    { key: "jobs", label: "Job Listings" },
    { key: "metrics", label: "Metrics" },
    { key: "myapps", label: "My Applications" },
    { key: "referrals", label: "Referrals" },
  ];

  return (
    <div className="border-b border-gray-300 dark:border-gray-700 mt-4 mb-2">
      <div className="flex gap-3 overflow-x-auto">
        {tabs.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={clsx(
              "relative px-5 py-3 text-base font-medium transition-colors duration-150 rounded-t-lg",

              // ACTIVE (non-referrals)
              active === key &&
              key !== "referrals" &&
              "text-gray-200 border-b-2 border-gray-400 bg-gray-800/50",

              // ACTIVE REFERRALS — bright gold highlight
              active === key &&
              key === "referrals" &&
              "text-amber-300 border-b-2 border-amber-400 bg-gray-800/40 shadow-[0_0_18px_rgba(255,200,0,0.5)]",

              // INACTIVE REFERRALS — faint gold tint
              active !== key &&
              key === "referrals" &&
              "text-amber-200/80 hover:text-amber-300 hover:bg-gray-800/20 shadow-[0_0_6px_rgba(255,200,0,0.15)]",

              // INACTIVE regular tabs
              active !== key &&
              key !== "referrals" &&
              "text-gray-400 hover:text-white hover:bg-gray-800/30"
            )}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
