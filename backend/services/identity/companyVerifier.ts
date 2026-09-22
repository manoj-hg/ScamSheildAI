import { CompanyVerification } from '../../types.js';

const FREE_EMAIL_PROVIDERS = new Set([
  'gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com',
  'icloud.com', 'aol.com', 'protonmail.com', 'zoho.com', 'rediffmail.com'
]);

const KNOWN_COMPANY_OFFICIAL_DOMAINS: Record<string, string> = {
  'google': 'google.com',
  'microsoft': 'microsoft.com',
  'amazon': 'amazon.com',
  'apple': 'apple.com',
  'meta': 'meta.com',
  'facebook': 'meta.com',
  'infosys': 'infosys.com',
  'tata consultancy services': 'tcs.com',
  'tcs': 'tcs.com',
  'tata': 'tcs.com',
  'wipro': 'wipro.com',
  'accenture': 'accenture.com',
  'cognizant': 'cognizant.com',
  'ibm': 'ibm.com',
  'netflix': 'netflix.com',
  'uber': 'uber.com',
  'stripe': 'stripe.com',
  'salesforce': 'salesforce.com',
  'adobe': 'adobe.com',
  'oracle': 'oracle.com',
  'cisco': 'cisco.com',
  'intel': 'intel.com',
  'nvidia': 'nvidia.com',
  'tesla': 'tesla.com',
  'deloitte': 'deloitte.com',
  'ey': 'ey.com',
  'ernst & young': 'ey.com',
  'pwc': 'pwc.com',
  'pricewaterhousecoopers': 'pwc.com',
  'kpmg': 'kpmg.com',
  'hcl': 'hcltech.com',
  'hcltech': 'hcltech.com',
  'tech mahindra': 'techmahindra.com',
  'capgemini': 'capgemini.com',
  'flipkart': 'flipkart.com',
  'walmart': 'walmart.com',
  'samsung': 'samsung.com',
  'siemens': 'siemens.com',
  'jpmorgan': 'jpmorgan.com',
  'jp morgan': 'jpmorgan.com',
  'goldman sachs': 'goldmansachs.com',
  'morgan stanley': 'morganstanley.com',
  'hsbc': 'hsbc.com',
  'barclays': 'barclays.com',
  'paypal': 'paypal.com',
  'airtel': 'airtel.in',
  'jio': 'jio.com',
  'reliance': 'ril.com',
  'larsen & toubro': 'larsentoubro.com',
  'l&t': 'larsentoubro.com',
  'swiggy': 'swiggy.in',
  'zomato': 'zomato.com'
};

export function verifyCompanyIdentity(
  claimedCompany: string,
  recruiterEmail?: string,
  offerUrl?: string
): CompanyVerification {
  const compClean = (claimedCompany || '').trim().toLowerCase();
  let officialDomain = '';
  for (const [name, domain] of Object.entries(KNOWN_COMPANY_OFFICIAL_DOMAINS)) {
    if (compClean.includes(name)) {
      officialDomain = domain;
      break;
    }
  }

  let emailDomain = '';
  if (recruiterEmail && recruiterEmail.includes('@')) {
    emailDomain = recruiterEmail.split('@')[1].toLowerCase().trim();
  }

  let urlDomain = '';
  if (offerUrl) {
    try {
      const parsed = new URL(offerUrl.startsWith('http') ? offerUrl : `http://${offerUrl}`);
      urlDomain = parsed.hostname.toLowerCase().trim();
    } catch {
      urlDomain = offerUrl.toLowerCase();
    }
  }

  // If no company was claimed or identified
  if (!claimedCompany && !emailDomain && !urlDomain) {
    return {
      claimedCompany: 'Not specified',
      officialDomain: 'Unavailable',
      recruiterEmailDomain: emailDomain || 'None provided',
      offerUrlDomain: urlDomain || 'None provided',
      mismatchDetected: false,
      status: 'UNAVAILABLE',
      details: 'Company identity could not be independently verified because no enterprise entity was identified.',
    };
  }

  let mismatch = false;
  const observations: string[] = [];

  // Check email domain
  if (emailDomain) {
    if (FREE_EMAIL_PROVIDERS.has(emailDomain)) {
      observations.push(`Recruiter communicates using a public email service (@${emailDomain}). Legitimate enterprise recruiters communicate via corporate domains.`);
      if (officialDomain) {
        mismatch = true;
        observations.push(`Claimed enterprise is ${claimedCompany} (official domain: ${officialDomain}), but recruiter uses public @${emailDomain}.`);
      }
    } else if (officialDomain && emailDomain !== officialDomain && !emailDomain.endsWith('.' + officialDomain)) {
      mismatch = true;
      observations.push(`Email domain (@${emailDomain}) does NOT match the verified corporate domain of ${claimedCompany} (@${officialDomain}).`);
    }
  }

  // Check URL domain
  if (urlDomain && officialDomain) {
    if (urlDomain !== officialDomain && !urlDomain.endsWith('.' + officialDomain)) {
      mismatch = true;
      observations.push(`Application link domain (${urlDomain}) diverges from official corporate domain (${officialDomain}).`);
    }
  }

  let status: CompanyVerification['status'] = 'UNAVAILABLE';
  if (mismatch) {
    status = 'MISMATCH';
  } else if (officialDomain && (emailDomain === officialDomain || urlDomain === officialDomain)) {
    status = 'VERIFIED';
    observations.push(`Recruiter domain accurately aligns with verified official domain (${officialDomain}).`);
  } else if (FREE_EMAIL_PROVIDERS.has(emailDomain)) {
    status = 'SUSPECTED';
  } else if (!officialDomain) {
    status = 'UNAVAILABLE';
    observations.push(`Company "${claimedCompany || 'Unknown'}" is not in the enterprise registry; identity could not be independently confirmed.`);
  }

  return {
    claimedCompany: claimedCompany || 'Independent / Unspecified',
    officialDomain: officialDomain || 'Independent domain or unverified',
    recruiterEmailDomain: emailDomain || 'None provided',
    offerUrlDomain: urlDomain || 'None provided',
    mismatchDetected: mismatch,
    status,
    details: observations.join(' '),
  };
}
