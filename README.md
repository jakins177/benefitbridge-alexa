# BenefitBridge Alexa+

## Purpose

BenefitBridge turns a sudden income crisis into a prioritized, persistent recovery plan. The initial Amazon Developer Hackathon demo serves a Kansas resident who has recently lost a job.

## Function

The web experience simulates an Alexa+ conversation, collects a minimal household profile, runs deterministic routing rules for four public programs, creates an explainable action plan, stores progress across sessions, and monitors a closed seasonal program for its next window.

This is preliminary guidance, not an official eligibility determination. Government agencies make final decisions.

## Inputs and outputs

- Inputs: sample household size, children, expected monthly gross income, coverage, energy responsibility, and recent job loss.
- Outputs: ordered program recommendations, reasons, official links, likely document lists, completion state, and reminder state.
- Storage: the first vertical slice uses browser `localStorage`. DynamoDB and EventBridge adapters are planned for the AWS-integrated milestone.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`. Use the buttons for a deterministic demo or browser voice recognition where supported.

## Validate

```bash
npm test
npm run lint
npm run build
```

## Safety design

- The application says “screen recommended,” not “eligible.”
- The language model will not own eligibility logic.
- Each recommendation links to an official source and shows its verification date.
- Real identity documents are out of scope for the hackathon demo.
- The seeded demo uses fictional information.

See `docs/DEMO_SCRIPT.md`, `docs/SUBMISSION_CHECKLIST.md`, and `docs/FRICTION_LOG.md`.
