export interface UrlAnalysisResult {
  url: string;
  domain: string;
  isHttps: boolean;
  urlLength: number;
  domainLength: number;
  subdomainCount: number;
  dotCount: number;
  hyphenCount: number;
  hasIpAddress: boolean;
  isShortener: boolean;
  hasSuspiciousTld: boolean;
  tld: string;
  lookalikeBrand: string | null;
  suspiciousIndicators: string[];
  riskScore: number; // 0 - 100
}

const SUSPICIOUS_TLDS = new Set([
  'xyz', 'top', 'work', 'click', 'loan', 'gq', 'cf', 'tk', 'ml', 'ga',
  'fit', 'live', 'date', 'vip', 'monster', 'download', 'win', 'racing',
  'stream', 'accountant', 'science', 'cricket', 'party', 'men'
]);

const SHORTENERS = new Set([
  'bit.ly', 'tinyurl.com', 't.co', 'goo.gl', 'is.gd', 'buff.ly',
  'ow.ly', 'rebrand.ly', 'cutt.ly', 'shorturl.at', 'rb.gy'
]);

const FAMOUS_BRANDS = [
  { name: 'Google', pattern: /(?:google|alphabet)/i, officialDomains: ['google.com', 'alphabet.com'] },
  { name: 'Microsoft', pattern: /(?:microsoft|msft|windows|azure)/i, officialDomains: ['microsoft.com'] },
  { name: 'Amazon', pattern: /(?:amazon|aws)/i, officialDomains: ['amazon.com'] },
  { name: 'Apple', pattern: /(?:apple|icloud)/i, officialDomains: ['apple.com'] },
  { name: 'Meta', pattern: /(?:meta|facebook|instagram|whatsapp)/i, officialDomains: ['meta.com', 'facebook.com', 'whatsapp.com'] },
  { name: 'Infosys', pattern: /(?:infosys)/i, officialDomains: ['infosys.com'] },
  { name: 'TCS', pattern: /(?:tcs|tataconsultancy)/i, officialDomains: ['tcs.com'] },
  { name: 'Wipro', pattern: /(?:wipro)/i, officialDomains: ['wipro.com'] },
  { name: 'Accenture', pattern: /(?:accenture)/i, officialDomains: ['accenture.com'] },
  { name: 'Cognizant', pattern: /(?:cognizant)/i, officialDomains: ['cognizant.com'] },
  { name: 'PayPal', pattern: /(?:paypal)/i, officialDomains: ['paypal.com'] },
  { name: 'Netflix', pattern: /(?:netflix)/i, officialDomains: ['netflix.com'] },
];

export function analyzeUrl(rawUrl: string): UrlAnalysisResult {
  let normalizedUrl = rawUrl.trim();
  if (!/^https?:\/\//i.test(normalizedUrl)) {
    normalizedUrl = 'http://' + normalizedUrl;
  }

  let parsed: URL;
  try {
    parsed = new URL(normalizedUrl);
  } catch {
    return {
      url: rawUrl,
      domain: rawUrl,
      isHttps: false,
      urlLength: rawUrl.length,
      domainLength: rawUrl.length,
      subdomainCount: 0,
      dotCount: (rawUrl.match(/\./g) || []).length,
      hyphenCount: (rawUrl.match(/-/g) || []).length,
      hasIpAddress: false,
      isShortener: false,
      hasSuspiciousTld: false,
      tld: '',
      lookalikeBrand: null,
      suspiciousIndicators: ['Malformed or invalid URL syntax'],
      riskScore: 75,
    };
  }

  const domain = parsed.hostname.toLowerCase();
  const isHttps = parsed.protocol === 'https:';
  const urlLength = normalizedUrl.length;
  const domainLength = domain.length;
  const dotCount = (domain.match(/\./g) || []).length;
  const hyphenCount = (domain.match(/-/g) || []).length;
  const parts = domain.split('.');
  const tld = parts.length > 1 ? parts[parts.length - 1] : '';
  const subdomainCount = Math.max(0, parts.length - 2);

  // IP address check
  const ipPattern = /^(\d{1,3}\.){3}\d{1,3}$/;
  const hasIpAddress = ipPattern.test(domain);

  // Shortener check
  const isShortener = SHORTENERS.has(domain);

  // Suspicious TLD check
  const hasSuspiciousTld = SUSPICIOUS_TLDS.has(tld);

  // Lookalike Brand Detection
  let lookalikeBrand: string | null = null;
  for (const brand of FAMOUS_BRANDS) {
    if (brand.pattern.test(domain)) {
      const isOfficial = brand.officialDomains.some(od => domain === od || domain.endsWith('.' + od));
      if (!isOfficial) {
        lookalikeBrand = brand.name;
        break;
      }
    }
  }

  // Suspicious keyword checks in hostname or path
  const suspiciousKeywordsInUrl = [
    'login', 'verify', 'account', 'update', 'secure', 'careers-apply',
    'hr-portal', 'onboarding-form', 'job-application', 'payment', 'confirm-identity'
  ];
  const urlPath = parsed.pathname.toLowerCase() + parsed.search.toLowerCase();
  const matchedKeywords = suspiciousKeywordsInUrl.filter(k => domain.includes(k) || urlPath.includes(k));

  const indicators: string[] = [];
  let riskScore = 0;

  if (!isHttps) {
    indicators.push('Unencrypted HTTP protocol (no SSL/TLS certificate)');
    riskScore += 25;
  }
  if (hasIpAddress) {
    indicators.push('Raw numeric IP address used instead of legitimate registered domain');
    riskScore += 40;
  }
  if (isShortener) {
    indicators.push('URL redirection shortener masking the true destination');
    riskScore += 20;
  }
  if (hasSuspiciousTld) {
    indicators.push(`High-abuse top-level domain (.${tld}) commonly leveraged in disposable phishing campaigns`);
    riskScore += 30;
  }
  if (lookalikeBrand) {
    indicators.push(`Brand impersonation / typosquatting detected targeting ${lookalikeBrand}`);
    riskScore += 45;
  }
  if (hyphenCount >= 2) {
    indicators.push(`Excessive hyphens (${hyphenCount}) indicative of keyword-stuffed phishing subdomains`);
    riskScore += 15;
  }
  if (subdomainCount >= 3) {
    indicators.push(`Deep subdomain nesting (${subdomainCount} subdomains) masking true host authority`);
    riskScore += 15;
  }
  if (urlLength > 100) {
    indicators.push('Abnormally long URL string with obfuscated query parameters');
    riskScore += 10;
  }
  if (matchedKeywords.length > 0 && (lookalikeBrand || hasSuspiciousTld || !isHttps)) {
    indicators.push(`High-risk credential/payment lure keywords detected: ${matchedKeywords.join(', ')}`);
    riskScore += 20;
  }

  // Normalization
  riskScore = Math.min(100, Math.max(0, riskScore));

  return {
    url: rawUrl,
    domain,
    isHttps,
    urlLength,
    domainLength,
    subdomainCount,
    dotCount,
    hyphenCount,
    hasIpAddress,
    isShortener,
    hasSuspiciousTld,
    tld,
    lookalikeBrand,
    suspiciousIndicators: indicators,
    riskScore,
  };
}
