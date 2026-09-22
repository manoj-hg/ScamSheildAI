# ScamShield AI — ML Datasets & Training Architecture

This directory provides dataset schemas, sample benchmarking vectors, and preprocessing scripts for training and fine-tuning offline detection models:

1. **Employment Scam Classifier (`datasets/employment/`)**
   - References: EMSCAD (Employment Scam Aegean Dataset) & Kaggle Fake Job Postings.
   - Features: Title, company profile, description, requirements, benefits, telecommuting, has_company_logo, has_questions, salary_range, fraudulent label.

2. **Phishing URL Classifier (`datasets/phishing/`)**
   - Features: URL length, domain length, entropy, subdomains count, hyphen count, IP detection, suspicious TLD flag, brand lexical distance, phishing label.

3. **Message & Social Engineering Classifier (`datasets/messages/`)**
   - Features: Text tokens, urgency frequency, payment mentions, authority words, fear words, label.

Offline ML classifiers output probability tensors that feed into the deterministic weighted Scam Threat Index engine.
