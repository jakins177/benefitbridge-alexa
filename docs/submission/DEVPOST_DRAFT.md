# Devpost draft — owner review required
Updated October 14, 2026. Local and separate cloud evidence verified; no final submission or eligibility attestation.

## Project name
BenefitBridge

## Tagline
From “I lost my job” to a clear, source-linked next-step plan.

## Inspiration
A sudden job loss creates several problems at once: replacing income, buying food, finding health coverage and keeping the lights on. Each program has its own website and language. BenefitBridge explores how an Alexa+-style conversation can turn that moment into a manageable plan without pretending to decide who qualifies.

## What it does
The fictional Kansas household demo asks a short set of questions about household size, children, expected monthly gross income, health coverage and energy costs. Deterministic routing organizes four programs:
- Kansas Unemployment Insurance: temporary, partial wage replacement for workers who meet state requirements.
- Food Assistance (SNAP): food benefits for qualifying low-income households.
- KanCare: medical-assistance pathways for families, children, older adults and people with disabilities.
- LIEAP: help with part of eligible households’ home-energy costs. The 2026 application period is closed, not presented as open.

Cards explain why they appear, link to official sources, and provide non-exhaustive preparation checklists. Agencies make final eligibility decisions. No applications or identity-document uploads are performed. Sources were checked October 13; this is static reviewed content, not a live government feed.

## How we built it
Next.js, React and TypeScript provide an explicitly labeled local interaction simulator. Shared strict parsing and deterministic rules distinguish income loss from job loss and require confirmation/correction rather than silently accepting ambiguous answers. The browser is session-only by default; storing the fictional plan on the device requires opt-in, and it can be cleared.

A separate self-hosted Streamable HTTP MCP implementation exposes structured intake, routing, case and progress tools. Its HTTP path now fails closed unless configured for a private operator token, with origin checks. The browser deliberately does not call this endpoint or hold its token. This is not a real multi-user intake service.

Source includes optional constrained Amazon Bedrock Converse language support with deterministic fallback, a DynamoDB case adapter, and EventBridge Scheduler invoking a Lambda due-marker handler thirty days later. These are separate cloud capabilities, not what the browser recording demonstrates. The handler does not watch agency websites or send a notification. October 14 release: exact image sha256:8c142caded2add32c766516b71273c4cdacf0b5e59de534bb8e0420f53fe8ed5 completed ECR scan with zero findings and was deployed through CloudFormation. Private MCP denies anonymous requests; fictional-data live DynamoDB, Bedrock and EventBridge/Lambda checks passed. See docs/RELEASE_EVIDENCE.md for proof and limits.

The exact current hackathon permission for the own-simulation route must still be confirmed from official rules/FAQ before final submission. No actual Alexa+ execution, SDK integration or certification is claimed.

## Challenges we ran into
Honest boundary labeling mattered more than making the browser appear cloud-connected. Exposing anonymous paid backend writes would expand abuse and data-access risk, so we kept the local demonstration separate from private operator tools. Historical project logs record gated preview access, Bedrock account-verification delay and Lambda concurrency constraints; owner will reconcile specific product feedback with services actually used.

## Accomplishments
31 deterministic/unit/integration tests passed, as did lint and the production build. Actual Chrome desktop and mobile acceptance exercised intake, correction, descriptions, links, progress, consent-based restore, cancellation and clearing. Production npm audit has zero findings; the full audit still contains five HIGH development-chain entries from unpatched braces. Voice event tests use mocks and do not prove live microphone operation.

We are proud of the separation between trustworthy routing and conversational presentation: reasons, agency links and next actions instead of a promise that someone qualifies. A closed seasonal program is visibly distinct from an action someone can take now.

## What we learned
A useful public-benefits assistant needs boundaries as much as intelligence. Local device persistence and cloud case storage are not interchangeable proof. A due flag is not a delivered reminder. Making those distinctions visible improves the integrity of the prototype.

## What is next
Cloud redeployment, clean exact-digest ECR scan and fictional-data retesting are complete; see ../RELEASE_EVIDENCE.md. Before real users: per-user authorization, quotas, retention/consent policy, representative usability review and maintainable agency-reviewed content. Geography expansion and outbound notifications are future work, not delivered features.

## Built with
TypeScript, React, Next.js, shared deterministic routing, MCP / Streamable HTTP. Separate implemented cloud adapters: Amazon Bedrock Converse, DynamoDB, EventBridge Scheduler, Lambda, CloudFormation and ECR. These cloud integrations were separately live-tested October 14; they are not what the browser video shows.

## Owner-completed fields
- Repository: https://github.com/jakins177/benefitbridge-alexa — verify latest reviewed commit is pushed.
- Demo URL: owner uploads reports/final-demo/benefitbridge-final-demo.mp4 and supplies public URL.
- Review app: public fictional simulator at https://te5gyh6vmfigmn24l37hfdzzom0lkkil.lambda-url.us-east-1.on.aws/ ; MCP is private. See ../REVIEWER_SETUP.md.
- New work: owner supplies dated event-window commit summary.
- Category/feedback: owner confirms live definitions and fields.

Safety footer: Fictional Kansas demonstration. Preliminary information, not medical/legal eligibility advice. Government agencies decide applications. No government endorsement or Alexa certification claimed.
