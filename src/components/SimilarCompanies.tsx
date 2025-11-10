"use client";

import Link from "next/link";
import CompanyLogo from "@/components/CompanyLogo";

type Item = {
    slug: string;
    name: string;
};

export default function SimilarCompanies({ items }: { items: Item[] }) {
    if (!items?.length) return null;

    return (
        <section className="rounded-2xl border bg-white p-6 shadow-sm ring-1 ring-gray-100 transition hover:shadow-md dark:border-gray-800 dark:bg-gray-900 dark:ring-gray-800/80">
            <div className="mb-1 text-lg font-bold text-white">Similar companies</div>
            <p className="mb-4 text-xs text-gray-400">
                Other companies with active job listings and transparency data.
            </p>

            <ul className="flex flex-col gap-3">
                {items.map((c) => (
                    <li key={c.slug}>
                        <Link
                            href={`/company/${c.slug}`}
                            className="group flex items-center gap-2 rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 transition hover:border-gray-300 hover:bg-gray-100 dark:border-gray-800 dark:bg-gray-800 dark:hover:border-gray-700 dark:hover:bg-gray-800/70"
                        >
                            <CompanyLogo slug={c.slug} name={c.name} size={22} />
                            <span className="truncate text-sm font-medium text-gray-900 group-hover:text-black dark:text-gray-100 dark:group-hover:text-white">
                                {c.name}
                            </span>
                        </Link>
                    </li>
                ))}
            </ul>
        </section>
    );
}
