# BenefitBridge Alexa+

## Purpose

BenefitBridge turns a sudden income crisis into a prioritized, persistent recovery plan. The initial Amazon Developer Hackathon demo serves a Kansas resident who has recently lost a job.

## Function

The web experience simulates an Alexa+ conversation, collects a minimal household profile, runs deterministic routing rules for four public programs, creates an explainable action plan, stores progress across sessions, and saves a fixed 30-day follow-up to manually recheck a seasonal program. It does not monitor government announcements.

This is preliminary guidance, not an official eligibility determination. Government agencies make final decisions.

## Inputs and outputs

- Inputs: sample household size, children, expected monthly gross income, coverage, energy responsibility, and recent job loss.
- Outputs: ordered program recommendations, reasons, official links, likely document lists, completion state, and reminder state.
- Storage: the browser demo optionally retains `localStorage`; MCP cases use DynamoDB when `BENEFITBRIDGE_CASES_TABLE` is set and an in-memory adapter for local development.

## MCP server

The application exposes a self-hosted Streamable HTTP MCP endpoint at `POST /mcp`. It uses the official TypeScript SDK, supports the `2025-11-25` protocol revision, returns structured tool output, and creates a fresh server instance for every request.

Available tools:

- `benefitbridge_start_case`
- `benefitbridge_apply_intake_answer`
- `benefitbridge_evaluate_programs`
- `benefitbridge_get_program`
- `benefitbridge_set_task_status`
- `benefitbridge_set_reminder`
- `benefitbridge_get_case`
- `benefitbridge_interpret_intake`
- `benefitbridge_explain_plan`

Case-changing tools preserve the original case-object contract while loading the authoritative record by ID and saving every mutation. `benefitbridge_get_case` resumes a case by ID.

## AWS persistence

Create a DynamoDB table with string partition key `id`, then configure the application:

```bash
export AWS_REGION=us-east-1
export BENEFITBRIDGE_CASES_TABLE=BenefitBridgeCases
export BENEFITBRIDGE_SCHEDULE_GROUP=benefitbridge
export BENEFITBRIDGE_REMINDER_TARGET_ARN=arn:aws:lambda:REGION:ACCOUNT:function:benefitbridge-reminder-handler
export BENEFITBRIDGE_SCHEDULER_ROLE_ARN=arn:aws:iam::ACCOUNT:role/SCHEDULER_ROLE
export BENEFITBRIDGE_BEDROCK_MODEL_ID=amazon.nova-micro-v1:0
```

The runtime identity needs `dynamodb:GetItem` and `dynamodb:PutItem` on that table. Do not place AWS credentials in this repository; use an IAM role or IAM Identity Center locally.

The reproducible table definition is in `infra/dynamodb.yaml`. The hackathon AWS account currently has an active `BenefitBridgeCases` table in `us-east-1` using on-demand billing.

## Reminder scheduling

When the MCP reminder tool is enabled, BenefitBridge creates an EventBridge Scheduler one-time follow-up check 30 days ahead. The schedule invokes a small Lambda that marks the persisted case `reminderDue: true`; completed schedules delete themselves automatically. Disabling a reminder cancels its schedule.

`infra/reminders.yaml` defines the schedule group, least-privilege execution roles, Lambda target, and DynamoDB permission. The deployed stack is named `benefitbridge-reminders`.

## Bedrock language layer

The optional Bedrock adapter uses the Converse API to normalize natural-language intake responses and explain plans whose program recommendations were already selected by deterministic rules. It cannot add programs or make eligibility decisions. When Bedrock is unconfigured or unavailable, the same MCP tools use a tested deterministic parser and grounded explanation.

Live Bedrock verification completed successfully on 2026-10-01. The deployed low-cost model is Amazon Nova Micro (`amazon.nova-micro-v1:0`), with the deterministic fallback retained for resilience.

## Public deployment

- Review interface: `https://te5gyh6vmfigmn24l37hfdzzom0lkkil.lambda-url.us-east-1.on.aws/`
- MCP endpoint: `https://te5gyh6vmfigmn24l37hfdzzom0lkkil.lambda-url.us-east-1.on.aws/mcp`
- Health endpoint: `https://te5gyh6vmfigmn24l37hfdzzom0lkkil.lambda-url.us-east-1.on.aws/api/health`

The application runs as a Next.js standalone container on Lambda through AWS Lambda Web Adapter `1.1.0`. The image is stored in a private, encrypted ECR repository with immutable tags; this release explicitly requested and awaited its exact-digest scan. CloudFormation stack `benefitbridge-application` owns the function, least-privilege execution role, and response-streaming Function URL. The account-wide $25 budget alerts remain the current cost guardrail; AWS would not allow reserved concurrency because the new account has only the minimum unreserved concurrency quota.

A deployment health check is available at `GET /api/health`.

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
npm audit
```

## Safety design

- The application says “screen recommended,” not “eligible.”
- The language model will not own eligibility logic.
- Each recommendation links to an official source and shows its verification date.
- Real identity documents are out of scope for the hackathon demo.
- The seeded demo uses fictional information.

See `docs/DEMO_SCRIPT.md`, `docs/SUBMISSION_CHECKLIST.md`, and `docs/FRICTION_LOG.md`.

## October 13 hardening and review build

- Public browser: standalone fictional-data simulator. No cloud requests, no applications submitted, no Alexa device integration claimed. Buttons, typed answers and optional browser speech share deterministic parsing; typed/voice interpretations require confirmation.
- Program cards and MCP output include plain-English descriptions grounded in official Kansas sources fetched October 13, 2026 (reports/official-*.txt).
- Session-only by default. Explicit device-storage opt-in, validated restore, current program refresh, clear-data control, and visible corrupt-storage recovery. Voice may use the browser vendor's service: fictional answers only.
- Private MCP: all nine tools remain implemented. HTTP fails closed unless server-only BENEFITBRIDGE_MCP_TOKEN (at least 32 characters) is configured. Every request requires Authorization: Bearer TOKEN. Never put the token in a browser bundle or public submission. Random UUID IDs, authoritative persisted mutations, stale intake rejection, and no client-supplied record fallback.
- Follow-up means a fixed date 30 days ahead. Browser: a saved date only. Private AWS adapter: EventBridge invokes a Lambda that marks the case due. Neither path watches government publications or sends email/Alexa notifications.
- Next.js and matching ESLint config updated from 16.3.6 to official 16.3.8; source-map-js to 1.2.2. Production dependency audit is clean. Full audit still reports five HIGH development-tool dependency entries from the same braces <=3.0.3 advisory. npm registry currently has no patched braces release. No forced downgrade or unofficial fork introduced. Treat lint patterns as trusted repository content, not user input.
- October 14 release: exact image sha256:8c142caded2add32c766516b71273c4cdacf0b5e59de534bb8e0420f53fe8ed5 completed ECR scan with zero findings and was deployed through CloudFormation. Private MCP denies anonymous requests; fictional-data live DynamoDB, Bedrock and EventBridge/Lambda checks passed. See docs/RELEASE_EVIDENCE.md for proof and limits.

### Local verification

Run npm ci, npm test, npm run lint, npm run build -- --webpack, then npm run start -- --hostname 127.0.0.1 --port 3026.
Browser acceptance: node scripts/browser-acceptance.cjs (installed Chrome and environment-specific Playwright path; adjust for another machine). Logs and screenshots: reports/.

### Security limits before real-user use

This is not a benefits application system. No real sensitive data. Production requires per-user authentication/ownership checks, durable request quotas, cost limits, retention/deletion policy, concurrency controls, monitoring, and independent security review. A UUID alone is not authorization. The shared demo token limits public abuse but does not isolate multiple users. Keep it private; fail closed when absent. Existing cloud records/schedules were not inspected or modified while SSO was expired.
