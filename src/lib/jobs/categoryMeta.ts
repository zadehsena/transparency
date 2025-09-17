// src/lib/jobs/categoryMeta.ts
import type { JobCategory } from "@prisma/client";

export const CATEGORY_ORDER: JobCategory[] = [
    "software",
    "data_analytics",
    "product_management",
    "design",
    "devops_sre",
    "security",
    "qa",
    "it_support",
    "marketing",
    "sales",
    "operations",
    "finance",
    "hr",
    "legal",
    "other",
];

export const LABEL: Record<JobCategory, string> = {
    software: "Software",
    data_analytics: "Data Analyst",
    product_management: "Product Manager",
    design: "Design",
    devops_sre: "DevOps/SRE",
    security: "Security",
    qa: "QA / Test",
    it_support: "IT Support",
    marketing: "Marketing",
    sales: "Sales",
    operations: "Operations",
    finance: "Finance",
    hr: "HR / People",
    legal: "Legal",
    other: "Other",
};

export const CATEGORY_ICONS: Record<JobCategory, string> = {
    software: "/images/categories/data-analytics.png",
    data_analytics: "/images/categories/data-analytics.png",
    product_management: "/images/categories/data-analytics.png",
    design: "/images/categories/data-analytics.png",
    devops_sre: "/images/categories/data-analytics.png",
    security: "/images/categories/data-analytics.png",
    qa: "/images/categories/data-analytics.png",
    it_support: "/images/categories/data-analytics.png",
    marketing: "/images/categories/data-analytics.png",
    sales: "/images/categories/data-analytics.png",
    operations: "/images/categories/data-analytics.png",
    finance: "/images/categories/data-analytics.png",
    hr: "/images/categories/data-analytics.png",
    legal: "/images/categories/data-analytics.png",
    other: "/images/categories/data-analytics.png",
};
