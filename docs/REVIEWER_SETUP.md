# Reviewer setup

BenefitBridge is a fictional Kansas benefits-navigation prototype, not an official eligibility service. The browser simulates an Alexa+-style interaction; no actual Alexa device integration is claimed. The browser does not call the private cloud MCP backend.

## Reproduce locally
Use Node.js22 and npm. From the repository root:
```sh
npm ci
npm test
npm run lint
npm run build -- --webpack
npm run start
```
Open http://localhost:3000. Select recent job loss, household3, children yes, monthly gross income1200, no health coverage, energy responsibility yes. Review four descriptions and official links. Mark an action started; optionally opt in to saving this fictional plan on your device, reload, then clear demo data. Without opt-in the plan is session-only. Browser speech depends on browser/provider permission; typed/buttons are the reliable path.

## Optional local MCP
Set server-only BENEFITBRIDGE_MCP_TOKEN to a freshly generated random secret of at least32 characters before starting the server. Do not put it in client code or public artifacts. Requests to /mcp require Authorization: Bearer followed by that secret. No cloud variables means in-memory case storage and deterministic language fallback. Restarting loses in-memory cases. Nine tools are discoverable using tools/list over Streamable HTTP; protocol2025-11-25 is supported.

The shared operator token is not multi-user authentication. Never use real personal data. No AWS access or credentials are needed to evaluate the browser simulation.

## Limits
Agency decisions are authoritative. Sources are statically reviewed, not monitored live. Browser follow-up saves a date; cloud follow-up marks a case due, not an outbound notification. Full development dependency audit currently includes five HIGH entries from braces; production audit is separately recorded.

## Assets
English caption-led draft: reports/final-demo/benefitbridge-final-demo.mp4. Screenshots and architecture: reports/*.png and docs/submission/architecture.svg. Video owner approval and external upload remain separate from this source publication.
