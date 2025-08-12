"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import clsx from "clsx";

export default function CompanyTabs({ active }: { active: "stats" | "jobs" }) {
  const router = useRouter();
  const pathname = usePathname();
  const search = useSearchParams();

  const setTab = (tab: "stats" | "jobs") => {
    const next = new URLSearchParams(search.toString());
    if (tab === "stats") next.delete("tab");
    else next.set("tab", "jobs");
    router.replace(`${pathname}?${next.toString()}`, { scroll: false });
  };

  return (
    <div className="border-b">
      <div className="flex gap-2">
        <button
          onClick={() => setTab("stats")}
          className={clsx(
            "px-4 py-2 text-sm",
            active === "stats" ? "border-b-2 border-black font-medium"
                               : "text-gray-600 hover:text-gray-800"
          )}
        >
          Application Stats
        </button>
        <button
          onClick={() => setTab("jobs")}
          className={clsx(
            "px-4 py-2 text-sm",
            active === "jobs" ? "border-b-2 border-black font-medium"
                               : "text-gray-600 hover:text-gray-800"
          )}
        >
          Job Listings
        </button>
      </div>
    </div>
  );
}
