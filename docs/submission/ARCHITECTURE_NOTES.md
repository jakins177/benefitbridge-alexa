# Architecture and evidence boundary
The accessible architecture.svg describes implemented source, with separate current deployment evidence in ../RELEASE_EVIDENCE.md.

The browser intentionally remains separate from private operator MCP. There is no pending browser/cloud wiring promise: anonymous public paid writes would expand abuse risk. Browser uses shared deterministic routing, session state and opt-in on-device persistence. It contains no operator token.

Private MCP uses operator-token/origin protections, constrained optional Bedrock language, configured DynamoDB storage and a thirty-day EventBridge/Lambda due-marker path. This is not per-user authorization. Hardened AWS deployment and fictional-data integration checks passed October 14; see ../RELEASE_EVIDENCE.md. No live agency-window monitor or outbound notification exists.

Alt text: “BenefitBridge local browser simulation uses shared deterministic routing and session-only or opt-in device storage. A separate private operator MCP path supports optional Bedrock language and configured DynamoDB/EventBridge/Lambda adapters. No browser-to-MCP connection, actual Alexa execution, fresh AWS verification or outbound notifications are represented.”
