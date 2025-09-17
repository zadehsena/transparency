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
    software: "/images/categories/software.png",
    data_analytics: "/images/categories/data-analytics.png",
    product_management: "/images/categories/product_management.png",
    design: "/images/categories/design.png",
    devops_sre: "/images/categories/devops_sre.png",
    security: "/images/categories/security.png",
    qa: "/images/categories/qa.png",
    it_support: "/images/categories/it_support.png",
    marketing: "/images/categories/data-analytics.png",
    sales: "/images/categories/data-analytics.png",
    operations: "/images/categories/data-analytics.png",
    finance: "/images/categories/data-analytics.png",
    hr: "/images/categories/data-analytics.png",
    legal: "/images/categories/data-analytics.png",
    other: "/images/categories/other.png",
};
