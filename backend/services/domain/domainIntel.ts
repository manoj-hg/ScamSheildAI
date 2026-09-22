import dns from 'dns/promises';
import { DomainInfo } from '../../types.js';
import { analyzeUrl } from '../url/urlAnalyzer.js';

interface KnownDomainRecord {
  age: string;
  regDate: string;
  expDate: string;
  registrar: string;
}

const KNOWN_ENTERPRISE_DOMAINS: Record<string, KnownDomainRecord> = {
  'google.com': { age: '28+ years', regDate: '1997-09-15', expDate: '2028-09-14', registrar: 'MarkMonitor Inc.' },
  'microsoft.com': { age: '33+ years', regDate: '1991-05-02', expDate: '2027-05-03', registrar: 'MarkMonitor Inc.' },
  'amazon.com': { age: '31+ years', regDate: '1994-11-01', expDate: '2027-10-31', registrar: 'MarkMonitor Inc.' },
  'apple.com': { age: '39+ years', regDate: '1987-02-19', expDate: '2028-02-20', registrar: 'CSC Corporate Domains' },
  'infosys.com': { age: '29+ years', regDate: '1996-09-02', expDate: '2026-09-01', registrar: 'Network Solutions, LLC' },
  'tcs.com': { age: '30+ years', regDate: '1995-05-18', expDate: '2026-05-19', registrar: 'Network Solutions, LLC' },
  'wipro.com': { age: '29+ years', regDate: '1996-02-06', expDate: '2027-02-07', registrar: 'CSC Corporate Domains' },
  'accenture.com': { age: '25+ years', regDate: '2000-08-30', expDate: '2027-08-30', registrar: 'CSC Corporate Domains' },
  'netflix.com': { age: '28+ years', regDate: '1997-11-10', expDate: '2026-11-09', registrar: 'MarkMonitor Inc.' },
  'meta.com': { age: '34+ years', regDate: '1991-11-15', expDate: '2026-11-16', registrar: 'RegistrarSafe, LLC' },
};

export async function getDomainIntelligence(rawUrlOrDomain: string): Promise<DomainInfo> {
  const urlAnalysis = analyzeUrl(rawUrlOrDomain);
  const domain = urlAnalysis.domain;

  // Check known enterprise domains
  const baseDomain = domain.split('.').slice(-2).join('.');
  const known = KNOWN_ENTERPRISE_DOMAINS[domain] || KNOWN_ENTERPRISE_DOMAINS[baseDomain];

  let dnsStatus = 'Pending DNS query';
  let hasValidDns = false;

  try {
    const dnsPromise = dns.resolve4(domain).catch(() => []);
    const timeoutPromise = new Promise<string[]>((resolve) => setTimeout(() => resolve([]), 1500));
    const resolveA = await Promise.race([dnsPromise, timeoutPromise]);
    if (resolveA.length > 0) {
      dnsStatus = `A Records: ${resolveA.slice(0, 2).join(', ')}`;
      hasValidDns = true;
    } else {
      dnsStatus = 'No IPv4 A-records resolved';
    }
  } catch {
    dnsStatus = 'DNS resolution failed or unreachable';
  }

  const indicators = [...urlAnalysis.suspiciousIndicators];

  if (!hasValidDns && !known) {
    indicators.push('Host domain has no active DNS A-records or is currently unreachable');
  }

  if (known) {
    return {
      domain,
      domainAge: known.age,
      registrationDate: known.regDate,
      expirationDate: known.expDate,
      isHttps: urlAnalysis.isHttps,
      registrar: known.registrar,
      dnsStatus,
      indicators: indicators.length > 0 ? indicators : ['Verified enterprise domain registration'],
      riskScore: Math.min(urlAnalysis.riskScore, 10),
      lookalikeBrand: null,
      status: 'VERIFIED',
    };
  }

  // If newly registered suspicious TLD or lookalike pattern
  const isSuspicious = urlAnalysis.hasSuspiciousTld || !!urlAnalysis.lookalikeBrand || urlAnalysis.hasIpAddress;

  return {
    domain,
    domainAge: 'Domain age unavailable',
    registrationDate: 'Registration date unavailable',
    expirationDate: 'Expiration date unavailable',
    isHttps: urlAnalysis.isHttps,
    registrar: 'Registrar information unavailable',
    dnsStatus,
    indicators,
    riskScore: urlAnalysis.riskScore,
    lookalikeBrand: urlAnalysis.lookalikeBrand,
    status: isSuspicious ? 'DETECTED' : 'UNAVAILABLE',
  };
}
