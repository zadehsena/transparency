// Map your companies to their ATS provider + token/handle.
// Fill in board tokens / handles per company slug.
export type AtsProvider = 'greenhouse';
export type CompanyAts = { slug: string; provider: AtsProvider; token: string };

export const COMPANY_ATS: CompanyAts[] = [
  { slug: '23andme', provider: 'greenhouse', token: '23andme' },
  { slug: 'affirm', provider: 'greenhouse', token: 'affirm' },
  { slug: 'airbnb', provider: 'greenhouse', token: 'airbnb' },
  { slug: 'algolia', provider: 'greenhouse', token: 'algolia' },
  { slug: 'ampersand', provider: 'greenhouse', token: 'ampersand' },
  { slug: 'anthropic', provider: 'greenhouse', token: 'anthropic' },
  { slug: 'arize-ai', provider: 'greenhouse', token: 'arizeai' },
  { slug: 'armada', provider: 'greenhouse', token: 'armada' },
  { slug: 'asana', provider: 'greenhouse', token: 'asana' },
  { slug: 'aurora-innovation', provider: 'greenhouse', token: 'aurorainnovation' },

  { slug: 'benchling', provider: 'greenhouse', token: 'benchling' },
  { slug: 'bitly', provider: 'greenhouse', token: 'bitly' },
  { slug: 'blend', provider: 'greenhouse', token: 'blend' },
  { slug: 'box', provider: 'greenhouse', token: 'boxinc' },
  { slug: 'brex', provider: 'greenhouse', token: 'brex' },

  { slug: 'calendly', provider: 'greenhouse', token: 'calendly' },
  { slug: 'canopy-connect', provider: 'greenhouse', token: 'canopyconnect' },
  { slug: 'carta', provider: 'greenhouse', token: 'carta' },
  { slug: 'cloudflare', provider: 'greenhouse', token: 'cloudflare' },
  { slug: 'cockroachlabs', provider: 'greenhouse', token: 'cockroachlabs' },
  { slug: 'collibra', provider: 'greenhouse', token: 'collibra' },
  { slug: 'coinbase', provider: 'greenhouse', token: 'coinbase' },
  { slug: 'corelight', provider: 'greenhouse', token: 'corelight' },
  { slug: 'coursera', provider: 'greenhouse', token: 'coursera' },
  { slug: 'current', provider: 'greenhouse', token: 'current81' },

  { slug: 'dataiku', provider: 'greenhouse', token: 'dataiku' },
  { slug: 'databricks', provider: 'greenhouse', token: 'databricks' },
  { slug: 'datadog', provider: 'greenhouse', token: 'datadog' },
  { slug: 'discord', provider: 'greenhouse', token: 'discord' },
  { slug: 'doordash', provider: 'greenhouse', token: 'doordashusa' },
  { slug: 'dropbox', provider: 'greenhouse', token: 'dropbox' },
  { slug: 'duolingo', provider: 'greenhouse', token: 'duolingo' },

  { slug: 'elastic', provider: 'greenhouse', token: 'elastic' },
  { slug: 'emslinqinc', provider: 'greenhouse', token: 'emslinqinc' }, // linq
  { slug: 'ensono', provider: 'greenhouse', token: 'ensono' },
  { slug: 'epicgames', provider: 'greenhouse', token: 'epicgames' },

  { slug: 'fastly', provider: 'greenhouse', token: 'fastly' },
  { slug: 'figma', provider: 'greenhouse', token: 'figma' },
  { slug: 'flatiron', provider: 'greenhouse', token: 'flatironhealth' },

  { slug: 'glossier', provider: 'greenhouse', token: 'glossier' },
  { slug: 'gomotive', provider: 'greenhouse', token: 'gomotive' }, // motive
  { slug: 'gusto', provider: 'greenhouse', token: 'gusto' },

  { slug: 'hashicorp', provider: 'greenhouse', token: 'hashicorp' },
  { slug: 'herald', provider: 'greenhouse', token: 'heraldapi' },
  { slug: 'hubspot', provider: 'greenhouse', token: 'hubspotjobs' },

  { slug: 'infotrust', provider: 'greenhouse', token: 'infotrust' },
  { slug: 'instabase', provider: 'greenhouse', token: 'instabase' },
  { slug: 'instacart', provider: 'greenhouse', token: 'instacart' },
  { slug: 'intrinsic', provider: 'greenhouse', token: 'intrinsicrobotics' },

  { slug: 'klaviyo', provider: 'greenhouse', token: 'klaviyo' },

  { slug: 'launchdarkly', provider: 'greenhouse', token: 'launchdarkly' },
  { slug: 'lattice', provider: 'greenhouse', token: 'lattice' },
  { slug: 'liquid-death', provider: 'greenhouse', token: 'liquiddeath' },
  { slug: 'linq', provider: 'greenhouse', token: 'emslinqinc' },
  { slug: 'lyft', provider: 'greenhouse', token: 'lyft' },

  { slug: 'maven', provider: 'greenhouse', token: 'maven' },
  { slug: 'mercury', provider: 'greenhouse', token: 'mercury' },
  { slug: 'metronome', provider: 'greenhouse', token: 'metronome' },
  { slug: 'mongodb', provider: 'greenhouse', token: 'mongodb' },
  { slug: 'motive', provider: 'greenhouse', token: 'gomotive' },

  { slug: 'netlify', provider: 'greenhouse', token: 'netlify' },
  { slug: 'nice', provider: 'greenhouse', token: 'nice' },
  { slug: 'nuro', provider: 'greenhouse', token: 'nuro' },

  { slug: 'ocrolus', provider: 'greenhouse', token: 'ocrolusinc' },
  { slug: 'okta', provider: 'greenhouse', token: 'okta' },

  { slug: 'peloton', provider: 'greenhouse', token: 'peloton' },
  { slug: 'pilot', provider: 'greenhouse', token: 'pilot' },
  { slug: 'pinterest', provider: 'greenhouse', token: 'pinterest' },
  { slug: 'postman', provider: 'greenhouse', token: 'postman' },
  { slug: 'purestorage', provider: 'greenhouse', token: 'purestorage' },

  { slug: 'reddit', provider: 'greenhouse', token: 'reddit' },
  { slug: 'renttherunway', provider: 'greenhouse', token: 'renttherunway' },
  { slug: 'retool', provider: 'greenhouse', token: 'retool' },
  { slug: 'ripple', provider: 'greenhouse', token: 'ripple' },
  { slug: 'robinhood', provider: 'greenhouse', token: 'robinhood' },

  { slug: 'scaleai', provider: 'greenhouse', token: 'scaleai' },
  { slug: 'seatgeek', provider: 'greenhouse', token: 'seatgeek' },
  { slug: 'segment', provider: 'greenhouse', token: 'twilio' },
  { slug: 'skydio', provider: 'greenhouse', token: 'skydio' },
  { slug: 'sofi', provider: 'greenhouse', token: 'sofi' },
  { slug: 'stripe', provider: 'greenhouse', token: 'stripe' },

  { slug: 'taboola', provider: 'greenhouse', token: 'taboola' },
  { slug: 'tripactions', provider: 'greenhouse', token: 'tripactions' },
  { slug: 'twitch', provider: 'greenhouse', token: 'twitch' },
  { slug: 'twilio', provider: 'greenhouse', token: 'twilio' },

  { slug: 'vercel', provider: 'greenhouse', token: 'vercel' },

  { slug: 'wayfair', provider: 'greenhouse', token: 'wayfair' },
  { slug: 'weavegrid', provider: 'greenhouse', token: 'weavegrid' },
  { slug: 'webflow', provider: 'greenhouse', token: 'webflow' },

  { slug: 'xai', provider: 'greenhouse', token: 'xai' },
];
