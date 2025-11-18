// Map your companies to their ATS provider + token/handle.
// Fill in board tokens / handles per company slug.
export type AtsProvider = 'greenhouse';
export type CompanyAts = { slug: string; provider: AtsProvider; token: string };

export const COMPANY_ATS: CompanyAts[] = [
  // --- Greenhouse ---
  { slug: 'stripe', provider: 'greenhouse', token: 'stripe' },
  { slug: 'airbnb', provider: 'greenhouse', token: 'airbnb' },
  { slug: 'doordash', provider: 'greenhouse', token: 'doordashusa' },
  { slug: 'coinbase', provider: 'greenhouse', token: 'coinbase' },
  { slug: 'cloudflare', provider: 'greenhouse', token: 'cloudflare' },
  { slug: 'datadog', provider: 'greenhouse', token: 'datadog' },
  { slug: 'dropbox', provider: 'greenhouse', token: 'dropbox' },
  { slug: 'figma', provider: 'greenhouse', token: 'figma' },
  { slug: 'robinhood', provider: 'greenhouse', token: 'robinhood' },
  { slug: 'reddit', provider: 'greenhouse', token: 'reddit' },
  { slug: 'hubspot', provider: 'greenhouse', token: 'hubspotjobs' },
  { slug: 'klaviyo', provider: 'greenhouse', token: 'klaviyo' },
  { slug: 'elastic', provider: 'greenhouse', token: 'elastic' },
  { slug: 'taboola', provider: 'greenhouse', token: 'taboola' },
  { slug: 'ripple', provider: 'greenhouse', token: 'ripple' },
  { slug: 'purestorage', provider: 'greenhouse', token: 'purestorage' },
  { slug: 'skydio', provider: 'greenhouse', token: 'skydio' },
  { slug: 'metronome', provider: 'greenhouse', token: 'metronome' },
  { slug: 'asana', provider: 'greenhouse', token: 'asana' },
  { slug: 'affirm', provider: 'greenhouse', token: 'affirm' },
  { slug: 'lyft', provider: 'greenhouse', token: 'lyft' },
  { slug: 'brex', provider: 'greenhouse', token: 'brex' },
  { slug: 'twilio', provider: 'greenhouse', token: 'twilio' },
  { slug: 'gusto', provider: 'greenhouse', token: 'gusto' },
  { slug: 'discord', provider: 'greenhouse', token: 'discord' },
  { slug: 'instacart', provider: 'greenhouse', token: 'instacart' },
  { slug: 'segment', provider: 'greenhouse', token: 'twilio' },
  { slug: 'postman', provider: 'greenhouse', token: 'postman' },
  { slug: 'databricks', provider: 'greenhouse', token: 'databricks' },
  { slug: 'peloton', provider: 'greenhouse', token: 'peloton' },
  { slug: 'coursera', provider: 'greenhouse', token: 'coursera' },
  { slug: 'maven', provider: 'greenhouse', token: 'maven' },
  { slug: 'pilot', provider: 'greenhouse', token: 'pilot' },
  { slug: 'mercury', provider: 'greenhouse', token: 'mercury' },
];