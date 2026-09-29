# BenefitBridge Alexa+ Status

Last updated: 2026-09-29 03:50 UTC

## Current Focus

- First local vertical slice is working and production-build validated.
- Josh approved a separate public GitHub repository with an open-source license.
- Next focus: move the local stateful simulation onto the required MCP/AWS architecture without weakening the reliable demo path.

## Active Tasks

- [x] Josh: register for the Amazon Developer Hackathon.
- [x] Josh: request the per-participant $150 AWS promotional credit; approval/redemption remains to be confirmed.
- [x] Josh: approve a separate public GitHub repository and open-source license.
- [x] Define and freeze the smallest MVP conversation and eligibility workflow.
- [x] Build the first deterministic benefits-routing engine with tests.
- [x] Build the first Alexa+ web simulation with voice/text interaction and visual cards.
- [x] Save case progress and reminder state across browser sessions.
- [x] Add official-source links, verification dates, disclaimers, documentation, and submission checklist.
- [x] Pass unit tests, lint, production build, dependency audit, and live HTTP smoke test.
- [ ] Implement the self-hosted Streamable HTTP MCP server using specification 2025-11-25 or later.
- [ ] Add DynamoDB persistence and EventBridge reminder scheduling.
- [ ] Connect Bedrock for structured conversational extraction and plain-language explanations.
- [ ] Add an AWS service integration and document it for the AWS Builder mini-challenge.
- [ ] Enter both the Alexa+ primary track and the $5,000 AWS Builder mini-challenge.
- [ ] Pursue the DHS challenge only if a credible bioinformatics adviser is recruited within 48 hours.
- [ ] Record the demo video and prepare the Devpost submission.

## Next Steps

1. Josh registers on Devpost and requests the AWS credit.
2. Implement and test the MCP tool surface against the frozen demo.
3. Add AWS persistence/reminders behind adapters while retaining a local fallback.
4. Deploy a review URL, perform accessibility and browser testing, and begin the friction log.
5. Keep DHS explicitly out of scope unless the adviser gate is met.

## Build Evidence

- `npm test`: 3/3 tests passing.
- `npm run lint`: passing.
- `npm run build`: production compilation and TypeScript validation passing.
- `npm audit`: 0 known vulnerabilities after upgrading Next.js and Vitest.
- HTTP smoke test: rendered BenefitBridge landing experience successfully on local port 3017.
