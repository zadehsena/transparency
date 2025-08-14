// Map your companies to their ATS provider + token/handle.
// Fill in board tokens / handles per company slug.
export type AtsProvider = 'greenhouse' | 'lever';
export type CompanyAts = { slug: string; provider: AtsProvider; token: string };

export const COMPANY_ATS: CompanyAts[] = [
  { slug: 'stripe', provider: 'greenhouse', token: 'stripe' },
  { slug: 'airbnb', provider: 'greenhouse', token: 'airbnb' },
  { slug: 'doordash', provider: 'greenhouse', token: 'doordash' },
  { slug: 'coinbase', provider: 'greenhouse', token: 'coinbase' },
  { slug: 'cloudflare', provider: 'greenhouse', token: 'cloudflare' },
  { slug: 'datadog', provider: 'greenhouse', token: 'datadoghq' },
  { slug: 'servicenow', provider: 'greenhouse', token: 'servicenow' },
  { slug: 'shopify', provider: 'greenhouse', token: 'shopify' },
  { slug: 'netflix', provider: 'lever', token: 'netflix' },
  { slug: 'nvidia', provider: 'lever', token: 'nvidia' },
  { slug: 'snowflake', provider: 'lever', token: 'snowflake' },
];

// Google, Apple, Microsoft, Amazon, Meta, Adobe, Oracle, Uber, Salesforce