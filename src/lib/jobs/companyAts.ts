// Map your companies to their ATS provider + token/handle.
// Fill in board tokens / handles per company slug.
export type AtsProvider = 'greenhouse' | 'lever';
export type CompanyAts = { slug: string; provider: AtsProvider; token: string };

export const COMPANY_ATS: CompanyAts[] = [
  { slug: 'stripe', provider: 'greenhouse', token: 'stripe' }
];
