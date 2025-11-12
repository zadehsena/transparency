"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import clsx from "clsx";

export default function CompanyTabs({
  active,
}: {
  active: "overview" | "myapps" | "jobs";
}) {
  const router = useRouter();
  const pathname = usePathname();
  const search = useSearchParams();

  const setTab = (tab: "overview" | "myapps" | "jobs") => {
    const next = new URLSearchParams(search.toString());
    if (tab === "overview") next.delete("tab");
    else next.set("tab", tab);
    router.replace(`${pathname}?${next.toString()}`, { scroll: false });
  };

  const tabs = [
    { key: "overview", label: "Overview" },
    { key: "jobs", label: "Job Listings" },
    { key: "myapps", label: "My Applications" },
  ];

  return (
    <div className="border-b border-gray-300 dark:border-gray-700 mt-4 mb-2">
      <div className="flex gap-3 overflow-x-auto">
        {tabs.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key as "overview" | "myapps" | "jobs")}
            className={clsx(
              "relative px-5 py-3 text-base font-medium transition-colors duration-150 rounded-t-lg",
              active === key
                ? "text-gray-200 border-b-2 border-gray-400 bg-gray-800/50"
                : "text-gray-400 hover:text-white hover:bg-gray-800/30"
            )}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );

}
