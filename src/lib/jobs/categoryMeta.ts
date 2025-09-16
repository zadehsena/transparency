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
