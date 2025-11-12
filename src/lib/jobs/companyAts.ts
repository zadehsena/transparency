// Map your companies to their ATS provider + token/handle.
// Fill in board tokens / handles per company slug.
export type AtsProvider = 'greenhouse' | 'lever';
export type CompanyAts = { slug: string; provider: AtsProvider; token: string };

export const COMPANY_ATS: CompanyAts[] = [
  // --- Greenhouse ---
  { slug: 'stripe', provider: 'greenhouse', token: 'stripe' },
  { slug: 'airbnb', provider: 'greenhouse', token: 'airbnb' },
  { slug: 'doordash', provider: 'greenhouse', token: 'doordashusa' },
  { slug: 'coinbase', provider: 'greenhouse', token: 'coinbase' },
  { slug: 'cloudflare', provider: 'greenhouse', token: 'cloudflare' },
  { slug: 'datadog', provider: 'greenhouse', token: 'datadog' },
  { slug: 'servicenow', provider: 'greenhouse', token: 'servicenowinc' },
  { slug: 'shopify', provider: 'greenhouse', token: 'shopify' },
  { slug: 'openai', provider: 'greenhouse', token: 'openai' },
  { slug: 'dropbox', provider: 'greenhouse', token: 'dropbox' },
  { slug: 'figma', provider: 'greenhouse', token: 'figma' },
  { slug: 'plaid', provider: 'greenhouse', token: 'plaid' },
  { slug: 'robinhood', provider: 'greenhouse', token: 'robinhood' },
  { slug: 'reddit', provider: 'greenhouse', token: 'reddit' },
  { slug: 'hubspot', provider: 'greenhouse', token: 'hubspot' },
  { slug: 'asana', provider: 'greenhouse', token: 'asana' },
  { slug: 'affirm', provider: 'greenhouse', token: 'affirm' },
  { slug: 'lyft', provider: 'greenhouse', token: 'lyft' },
  { slug: 'brex', provider: 'greenhouse', token: 'brex' },
  { slug: 'twilio', provider: 'greenhouse', token: 'twilio' },
  { slug: 'gusto', provider: 'greenhouse', token: 'gusto' },
  { slug: 'discord', provider: 'greenhouse', token: 'discord' },
  { slug: 'instacart', provider: 'greenhouse', token: 'instacart' },
  { slug: 'ramp', provider: 'greenhouse', token: 'ramp' },
  { slug: 'segment', provider: 'greenhouse', token: 'twilio' },
  { slug: 'notion', provider: 'greenhouse', token: 'notion' },
  { slug: 'postman', provider: 'greenhouse', token: 'postman' },
  { slug: 'databricks', provider: 'greenhouse', token: 'databricks' },
  { slug: 'zapier', provider: 'greenhouse', token: 'zapier' },
  { slug: 'attentive', provider: 'greenhouse', token: 'attentivemobile' },
  { slug: 'peloton', provider: 'greenhouse', token: 'peloton' },
  { slug: 'coursera', provider: 'greenhouse', token: 'coursera' },
  { slug: 'maven', provider: 'greenhouse', token: 'maven' },
  { slug: 'pilot', provider: 'greenhouse', token: 'pilot' },
  { slug: 'mercury', provider: 'greenhouse', token: 'mercury' },

  // --- Lever ---
  { slug: 'netflix', provider: 'lever', token: 'netflix' },
  { slug: 'nvidia', provider: 'lever', token: 'nvidia' },
  { slug: 'snowflake', provider: 'lever', token: 'snowflake' },
  { slug: 'zoom', provider: 'lever', token: 'zoom' },
  { slug: 'slack', provider: 'lever', token: 'slack' },
  { slug: 'quora', provider: 'lever', token: 'quora' },
  { slug: 'yelp', provider: 'lever', token: 'yelp' },
  { slug: 'robinhood', provider: 'lever', token: 'robinhood' }, // some companies switch ATS
  { slug: 'paypal', provider: 'lever', token: 'paypal' },
  { slug: 'lever', provider: 'lever', token: 'lever' }, // Lever’s own jobs
  { slug: 'square', provider: 'lever', token: 'square' },
  { slug: 'shopify-lever', provider: 'lever', token: 'shopify' }, // past Lever use
  { slug: 'sonos', provider: 'lever', token: 'sonos' },
  { slug: 'medium', provider: 'lever', token: 'medium' },
  { slug: 'unity', provider: 'lever', token: 'unity' },
  { slug: 'hashicorp', provider: 'lever', token: 'hashicorp' },
  { slug: 'docker', provider: 'lever', token: 'docker' },
  { slug: 'duolingo', provider: 'lever', token: 'duolingo' },
  { slug: 'flexport', provider: 'lever', token: 'flexport' },
];

// Google, Apple, Microsoft, Amazon, Meta, Adobe, Oracle, Uber, Salesforce