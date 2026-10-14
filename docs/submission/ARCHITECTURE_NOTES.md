# Architecture and evidence boundary
The accessible architecture.svg describes implemented source, not a verified current deployment.

The browser intentionally remains separate from private operator MCP. There is no pending browser/cloud wiring promise: anonymous public paid writes would expand abuse risk. Browser uses shared deterministic routing, session state and opt-in on-device persistence. It contains no operator token.

Private MCP uses operator-token/origin protections, constrained optional Bedrock language, configured DynamoDB storage and a thirty-day EventBridge/Lambda due-marker path. This is not per-user authorization. AWS SSO expired and current hardened code has not been redeployed. Old anonymous deployment does not inherit local fixes. No live agency-window monitor or outbound notification exists.

Alt text: “BenefitBridge local browser simulation uses shared deterministic routing and session-only or opt-in device storage. A separate private operator MCP path supports optional Bedrock language and configured DynamoDB/EventBridge/Lambda adapters. No browser-to-MCP connection, actual Alexa execution, fresh AWS verification or outbound notifications are represented.”
