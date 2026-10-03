# VERIDOC AI — AI-Based Fake Identity & Document Screening System

**Smart India Hackathon (SIH) Problem Statement: 26188**  
*Next-Generation Border Control & Immigration Document Verification Prototype*

---

## 🎯 Project Overview

**VERIDOC AI** is an AI-assisted screening platform designed for border security, airport immigration, and checkpoint officers. It provides automated detection of fake, tampered, expired, or mismatched identity and travel documents.

> **Note on AI Decision Making**: VERIDOC AI serves as an **AI-assisted screening tool**, not an autonomous decision maker. It highlights forensic anomalies and calculates multi-factor risk scores to empower human officers to make timely, informed border control decisions.

---

## 🚀 Key Demonstration Pages (7-Stage Demo Flow)

1. **Page 1 — Login**: Secure officer authentication terminal with SIH 26188 problem statement branding and 1-click Demo Bypass.
2. **Page 2 — Screening Dashboard**: Real-time checkpoint overview with active statistics:
   - **Documents Screened**: `1,248`
   - **Low Risk**: `1,102` (88.3%)
   - **Medium Risk**: `96` (7.7%)
   - **High Risk**: `50` (4.0%)
   - **Flagged Cases**: `32`
   - Live Recent Screenings table with 1-click "View / Review" links.
3. **Page 3 — New Screening**:
   - Ingestion dropzones for **Passport**, **Visa**, **National ID (Aadhaar)**, and **Live Biometric Face Capture**.
   - **1-Click Demo Scenarios Switcher**:
     - ⚡ **Case C (High Risk - 82/100)**: Rahul Sharma — Photo manipulation, facial mismatch, DOB inconsistency.
     - ⚡ **Case B (Medium Risk - 47/100)**: Amit Patel — Visa expiry approaching, name transliteration variance.
     - ⚡ **Case A (Low Risk - 8/100)**: Priya Nair — Clean traveler, verified genuine.
4. **Page 4 — Screening Analysis**:
   - High-tech forensic progression through the 7 verification stages:
     1. Document Classification
     2. OCR Information Extraction
     3. Document Validation
     4. Tampering Detection
     5. Face Verification
     6. Cross-Document Verification
     7. Risk Assessment
   - Animated radar sweep, active laser scan line, and streaming terminal logs.
5. **Page 5 — Screening Result (Showcase Screen)**:
   - **Circular Risk Score Gauge**: 82/100 with dynamic high-contrast glowing status rings.
   - **6 Deep Verification Module Cards**:
     - *OCR Extraction*: Name, Passport No, Nationality, DOB, Expiry, MRZ checksums.
     - *Document Validation*: ICAO Doc 9303 compliance, mandatory field presence, syntax verification.
     - *Tampering Detection*: Status Suspicious (87% confidence). Interactive document preview with **Normal View**, **Forensic ELA Heatmap & Splicing Overlay**, and **UV / Hologram Band**.
     - *Face Verification*: Status Mismatch (42% similarity). Side-by-side biometric comparison with 128D facial feature vectors and 75% threshold indicator.
     - *Cross-Document Verification*: Passport DOB (`12/05/2001`) vs National ID DOB (`12/05/1998`) diff matrix.
     - *Database Validation*: MEA and Interpol SLTD watchlist verification.
   - **Multi-Factor Risk Breakdown**: Shows individual weighted point contributions (+35 Tampering, +30 Face Mismatch, +15 DOB Inconsistency, +2 Validation).
   - **Detected Issues Warning Banner**: Summary of flagged threat indicators.
   - **Final Recommendation Panel**: `MANUAL REVIEW REQUIRED` with ethical AI governance notice.
6. **Page 6 — Screening History**: Filterable, searchable case ledger with status badges and risk filters.
7. **Page 7 — Case Details Dossier**: Full investigative dossier with officer disposition recording and printable PDF report generator.

---

## 🛠 Tech Stack

- **Framework**: React 19 + TypeScript
- **Bundler**: Vite 8
- **Styling**: Tailwind CSS v4 (Custom dark border-security / defense theme)
- **Icons**: Lucide React
- **Architecture**: Modular, component-driven, pluggable mock store ready for future Python/FastAPI backend integration.

---

## 💻 Running the Prototype Locally

```bash
# Install dependencies
npm install

# Start local development server
npm run dev

# Open browser at:
http://localhost:5173/
```

To create a production build:
```bash
npm run build
```

