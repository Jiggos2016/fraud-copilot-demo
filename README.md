# Fraud Copilot Demo

Evidence-grounded unemployment-insurance fraud investigation workspace for portfolio and UX demonstration.

> **Demo application. All data is synthetic/mock. Not connected to any real government system or real claimant data.**

## MVP capabilities

- Risk-ranked claim queue with risk-band and status filters
- Case workspace with claim, claimant, employer, investigator, and signal context
- Neutral Evidence panel using Available / Pending / Not Available states
- Scripted, citation-required Copilot with a deliberate "No grounded answer found for this query" fallback
- Case and policy citation chips
- AI-draft investigation memo that changes to investigator-edited state after modification
- Human-only disposition flow with explicit confirmation
- In-memory audit trail for case access, Copilot queries, citations, and dispositions
- Policy keyword search with source document and section attribution
- Read-only demo administration view

## Product guardrails

Risk scores are used only to prioritize investigative work. They are not probabilities of fraud and do not automatically determine eligibility or disposition. IP and device signals are investigative leads that require corroboration. The application never defaults or auto-selects a fraud disposition.

## Stack

React 18, TypeScript, Tailwind CSS, React Router, Vite. Data is loaded from local JSON files under `src/data` and the application has no backend, authentication, database, or live LLM dependency.

## Run locally

```bash
npm install
npm run dev
```

Production build:

```bash
npm run build
```

The output is written to `dist/`.

## Deploy on Render

Create a **Static Site** connected to this repository.

- Build command: `npm install && npm run build`
- Publish directory: `dist`

The app uses hash-based client-side routing, so it works as a static deployment without server-side route rewrites.

## Seed data

The JSON seed files are converted from synthetic demo spreadsheets for claimants, employers, claims, cases, investigators, and policy snippets. Do not replace them with claimant PII or production government data in this demo repository.
