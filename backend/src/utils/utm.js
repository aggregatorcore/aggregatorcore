const crypto = require('crypto');

function buildUtmParams({ userId, lenderId }) {
  const shortRandom = crypto.randomBytes(4).toString('hex');
  const utm_code = `${shortRandom}${Date.now().toString(36)}`;

  return {
    utm_source: 'app',
    utm_medium: 'affiliate',
    utm_campaign: 'loan_aggregator',
    utm_content: String(lenderId || ''),
    utm_term: String(userId || ''),
    utm_code,
  };
}

function appendUtmToUrl(baseUrl, params) {
  if (!baseUrl || typeof baseUrl !== 'string') return baseUrl;

  const newParams = new URLSearchParams(params);
  const queryString = newParams.toString();
  if (!queryString) return baseUrl;

  try {
    const url = new URL(baseUrl);
    const existing = new URLSearchParams(url.search);
    for (const [k, v] of newParams) existing.set(k, v);
    url.search = existing.toString();
    return url.toString();
  } catch {
    const separator = baseUrl.includes('?') ? '&' : '?';
    return `${baseUrl}${separator}${queryString}`;
  }
}

module.exports = { buildUtmParams, appendUtmToUrl };
