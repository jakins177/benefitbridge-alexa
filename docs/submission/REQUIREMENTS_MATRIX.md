# BenefitBridge — requirements and evidence matrix
Updated October 14, 2026 UTC. Draft, not eligibility/legal attestation.

## Official-source verification boundary
Official pages: https://amazonappdev2026.devpost.com/ • /rules • /details/faqs.
Direct rules fetch returned HTTP 403. Google yielded no usable snippets; Bing returned unrelated results. DuckDuckGo yielded indexed official Devpost snippets, saved in reports/final-demo/rules-fetch-duck.json. Further targeted queries hit a bot challenge. These are partial indexed excerpts, not a complete fresh rules review. The parent's earlier fresh-verification claim was withdrawn; do not cite it as evidence.

| Requirement | Evidence / remaining gate |
|---|---|
| Deadline | Historical project checklist: October 23, 2026 noon PDT (19:00 UTC / 14:00 CDT). Not independently confirmed in this edit. Owner verifies live deadline; internal target October 19. |
| Eligibility | Age, residence, sanctions, affiliations, team/entity and prize clauses require owner's complete rules review. No claim all eligibility verified. |
| Build window / ownership | Owner supplies dated new-work summary, distinguishes prior work and third-party components, confirms licensing/AI disclosures. |
| Simulation / technology | Historical September 28 project evidence records self-hosted MCP/own simulator route. Exact current permitted Alexa+ simulation wording and whether any framework/SDK/protocol is required remain unverified. Do not impose MCP as a proven universal competition requirement. Our MCP is an implementation choice. |
| Source | Existing public https://github.com/jakins177/benefitbridge-alexa; parent verifies latest reviewed commit, license, setup and assets pushed. No new repo or publication in this task. |
| Video | Historical checklist records public English YouTube/Vimeo video under three minutes. Local caption-led final edit produced; owner reconfirms exact artifact/platform/access requirement and uploads. |
| Fields / mini challenges | Owner confirms current fields, feedback and Alexa+/AWS Builder/Open Source definitions; select only earned categories. No DHS claim. |
| Judging (partial indexed official evidence) | Official /updates/46456-got-an-idea indexed snippet: “Every submission is scored 1 to 5 on four equally weighted criteria: Technical Implementation, Design, Potential Impact, and Quality of the Idea.” Overview snippet asks how well built/effectively uses required tech, and whether design is a complete coherent experience. Rules snippet reserves sponsor/administrator control over eligibility and judging methodology. Full wording, tie-breaks, bonus and exceptions still require live rules. |

## Reconciled engineering evidence
- reports/tests.log: 31 passing tests; reports/lint.log and build.log pass.
- reports/browser.log and desktop/mobile screenshots: actual Chrome acceptance. Extended voice events use mocks, not live microphone/Alexa proof.
- Production npm audit: zero. Full npm audit: five HIGH development-chain entries from unpatched braces; do not call the full audit clean. Exact deployed image ECR scan completed with zero findings October 14.
- Browser is intentionally local, session-only unless on-device saving is opted in. It does not call cloud MCP. Separate operator MCP fails closed with private token and origin controls; not per-user authorization.
- October 14 release: exact image sha256:8c142caded2add32c766516b71273c4cdacf0b5e59de534bb8e0420f53fe8ed5 completed ECR scan with zero findings and was deployed through CloudFormation. Private MCP denies anonymous requests; fictional-data live DynamoDB, Bedrock and EventBridge/Lambda checks passed. See docs/RELEASE_EVIDENCE.md for proof and limits.
- Source cloud adapters: Bedrock constrained language/fallback, DynamoDB, 30-day EventBridge due-marker Lambda. Separate live cloud execution verified October 14; no live publication monitor or outbound notifications.

## Editorial emphasis (not additional official criteria)
Show a focused fictional job-loss journey, readable agency-linked reasons, seasonal closure, consent and progress. Separate local proof from source cloud capability. Explain impact as a hypothesis; no invented customers, approved benefits or savings.
