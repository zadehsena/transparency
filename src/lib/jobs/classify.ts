// src/lib/jobs/classify.ts
import type { JobCategory } from "@prisma/client";

const RX = {
    software: /\b(software|developer|engineer|full[-\s]?stack|backend|front[-\s]?end|mobile|android|ios)\b/i,
    data: /\b(data|analytics?|scientist|ml|machine learning|bi|business intelligence)\b/i,
    product: /\b(product\s?(manager|owner)|\bpm\b)\b/i,
    design: /\b(design|ux|ui|product designer|visual designer)\b/i,
    devops: /\b(devops|sre|platform|site reliability|infra(structure)?|kubernetes|terraform)\b/i,
    security: /\b(security|appsec|infosec|iam|soc|siem)\b/i,
    qa: /\b(q[ae]|quality|test(er|ing))\b/i,
    it: /\b(it|help ?desk|desktop support|sysadmin|system administrator)\b/i,
    marketing: /\b(marketing|growth|seo|sem|content marketer)\b/i,
    sales: /\b(sales|account executive|\bae\b|solutions? engineer|pre[-\s]?sales)\b/i,
    ops: /\b(operations?|bizops|business operations)\b/i,
    finance: /\b(finance|financial|accountant|fp&a|controller)\b/i,
    hr: /\b(hr|recruit(er|ing)|talent|people ops)\b/i,
    legal: /\b(legal|counsel|paralegal)\b/i,
};

export function categorizeJobTitle(title: string): JobCategory {
    const t = title || "";
    if (RX.software.test(t)) return "software";
    if (RX.data.test(t)) return "data_analytics";
    if (RX.product.test(t)) return "product_management";
    if (RX.design.test(t)) return "design";
    if (RX.devops.test(t)) return "devops_sre";
    if (RX.security.test(t)) return "security";
    if (RX.qa.test(t)) return "qa";
    if (RX.it.test(t)) return "it_support";
    if (RX.marketing.test(t)) return "marketing";
    if (RX.sales.test(t)) return "sales";
    if (RX.ops.test(t)) return "operations";
    if (RX.finance.test(t)) return "finance";
    if (RX.hr.test(t)) return "hr";
    if (RX.legal.test(t)) return "legal";
    return "other";
}
