import { ScanType, InputType } from '../types';

export interface DemoPreset {
  id: string;
  title: string;
  badge: string;
  badgeColor: string;
  scanType: ScanType;
  inputType: InputType;
  description: string;
  payload: {
    text?: string;
    url?: string;
  };
}

export const DEMO_PRESETS: DemoPreset[] = [
  {
    id: 'demo-fake-job',
    title: 'Fake Remote Developer Offer (Equipment Scam)',
    badge: 'HIGH THREAT (JOB)',
    badgeColor: 'border-red-500/40 text-red-400 bg-red-950/40',
    scanType: 'JOB_OFFER',
    inputType: 'TEXT',
    description: 'Selected without interview, demands ₹4,999 laptop fee, 30-min urgent deadline via UPI.',
    payload: {
      text: `SUBJECT: DIRECT APPOINTMENT LETTER — GOOGLE TECHNOLOGIES PVT LTD

Dear Candidate,

Congratulations! We are delighted to inform you that you have been directly selected for the position of Remote Software Developer without any technical interview round.

Position: Senior Full Stack Engineer
Annual CTC: ₹18,50,000 per annum + Work from Home Allowance
Joining Date: Immediate Joining within 24 Hours

MANDATORY ONBOARDING REQUIREMENT:
As per company asset allocation policy, you are required to deposit a refundable equipment processing and laptop courier security charge of ₹4,999/-. This amount is 100% refundable upon your first monthly salary credit.

Please complete the payment immediately to our authorized finance department:
UPI ID: hr-equipment-desk@okaxis
Amount: ₹4,999.00

CRITICAL NOTICE: Due to high candidate volume, payment must be completed within 30 minutes of receipt of this letter, failing which your employment appointment will be immediately cancelled and forfeited.

Send the payment screenshot to recruitment.google.hr@gmail.com.

Sincerely,
Priya Sharma
Senior Human Resources Specialist
Google India Careers Desk`
    }
  },
  {
    id: 'demo-phishing-url',
    title: 'Microsoft Careers Typosquatting Phishing URL',
    badge: 'PHISHING LINK',
    badgeColor: 'border-amber-500/40 text-amber-400 bg-amber-950/40',
    scanType: 'JOB_OFFER',
    inputType: 'URL',
    description: 'Impersonates Microsoft using suspicious .xyz TLD, excessive subdomains, and credential capture endpoint.',
    payload: {
      url: 'https://microsoft-careers-apply.xyz/login?session=verify_offer_auth'
    }
  },
  {
    id: 'demo-rental-scam',
    title: 'Rental Deposit Fraud (Absentee Landlord)',
    badge: 'RENTAL SCAM',
    badgeColor: 'border-purple-500/40 text-purple-400 bg-purple-950/40',
    scanType: 'RENTAL_SCAM',
    inputType: 'TEXT',
    description: 'Luxury flat priced 60% below market, landlord in UK, demands ₹25,000 token before key viewing.',
    payload: {
      text: `Listing: Ultra-Luxury 3BHK Penthouse in City Center — Fully Furnished with Private Terrace.
Rent: ₹15,000 per month (includes maintenance and parking).

Message from Landlord:
"Hello, thank you for your interest in my apartment. I am currently out of the country in the United Kingdom serving on an urgent humanitarian mission with the Red Cross, so I cannot show you the flat in person right now. 

The apartment is locked and keys are with the courier company. Because I have received over 40 inquiries today, I require an advance security deposit of ₹25,000 to reserve the flat and initiate key dispatch via courier to your address. 

Transfer ₹25,000 immediately via UPI to landlord.security@okhdfcbank or wire transfer. Once payment is confirmed, the courier driver will deliver the keys within 2 hours for inspection. If you do not like the flat, your deposit will be 100% refunded on the spot. Please send payment proof within 1 hour."`
    }
  },
  {
    id: 'demo-legit-offer',
    title: 'Legitimate Corporate Offer (Infosys Ltd)',
    badge: 'VERIFIED LEGITIMATE',
    badgeColor: 'border-emerald-500/40 text-emerald-400 bg-emerald-950/40',
    scanType: 'JOB_OFFER',
    inputType: 'TEXT',
    description: 'Genuine offer letter, authentic corporate domain, no fees, standard 7-day review window.',
    payload: {
      text: `Infosys Limited
Electronic City, Hosur Road, Bengaluru 560100, India

Ref: INF/HR/OFFER/2026/89412
Date: September 22, 2026

Dear Rahul Verma,

Following your successful technical assessments and panel interview, Infosys Limited is pleased to make an offer of employment for the position of Senior Systems Associate.

Compensation Package:
Fixed Gross Salary: ₹7,50,000 per annum
Annual Performance Incentive: ₹1,00,000 per annum
Total Annual CTC: ₹8,50,000

Work Location: Bengaluru Development Centre
Proposed Date of Joining: November 02, 2026

Important Notice Regarding Recruitment Policies:
Infosys does NOT charge any fee at any stage of the recruitment process or for training/equipment allocation. All hardware will be provisioned by Infosys IT upon physical or verified virtual onboarding.

Please review the attached terms and conditions. You may confirm your acceptance by uploading your signed acceptance letter via our secure careers portal:
https://www.infosys.com/careers.html

If you have questions, please reach out to your designated onboarding specialist at onboarding-india@infosys.com.

Welcome to Infosys.

Warm regards,
Talent Acquisition Team
Infosys Limited`
    }
  }
];
