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
    <div className="border-b">
      <div className="flex gap-2">
        {tabs.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key as "overview" | "myapps" | "jobs")}
            className={clsx(
              "px-4 py-2 text-sm transition-colors",
              active === key
                ? "border-b-2 border-black font-medium text-black"
                : "text-gray-600 hover:text-gray-800"
            )}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
