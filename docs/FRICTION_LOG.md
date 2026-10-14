# Product Friction Log

Historical project feedback below requires owner reconciliation before submission. Any judging bonus and current tooling-access statements must be checked against official current rules. Record exact behavior, workaround, severity, and an actionable suggestion as tools are used.

| Date | Tool/API | Task | Expected | Actual | Severity | Workaround | Suggested improvement |
|---|---|---|---|---|---|---|---|
| 2026-09-28 | Alexa+ developer tooling | Determine hackathon-accessible integration path | Access to Alexa+ preview SDKs or simulator | FAQ says gated tools are unavailable to hackathon participants | Medium | Use a self-hosted MCP server and our own web simulation | Provide a hackathon-specific starter simulator and clearly link it from every setup guide |
| 2026-10-01 | Amazon Bedrock Converse API | Run the first Nova Micro inference in a new credited AWS account | Immediate model invocation after IAM Identity Center setup | `AccessDeniedException` reported that account verification was still underway and normally takes under two hours | Medium | Implement and test a deterministic fallback while retaining automatic Bedrock activation through configuration | Surface verification status and estimated completion in the Bedrock console before developers attempt their first invocation |
| 2026-10-01 | AWS Lambda concurrency | Cap the public review function at two concurrent executions as a cost guardrail | Allow a small function-level reservation within the account quota | Lambda rejected it because reducing unreserved concurrency below the account minimum of 10 is prohibited | Low | Keep the function unreserved and rely on the existing $25 budget alerts during the hackathon | Offer a simple per-function maximum-concurrency control that does not consume reserved account concurrency |

Do not manufacture friction. Add entries only from direct project experience.
