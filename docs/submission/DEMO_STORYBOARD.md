# Demo storyboard and narration — target 2:40
English voiceover, readable captions, no background music required. Keep the published runtime below 3:00. Record real interactions; label any time jump and simulated behavior. Use only fictional data and crop tokens, account identifiers and case access secrets. Do not use an Alexa logo/device scene to imply actual Alexa execution.

Seed: Kansas; recent job loss; household 3; child present; expected current-month gross income $1,200; no coverage; responsible for energy costs. This is an illustrative routing scenario, not an eligibility assessment.

| Time | Screen / interaction | Narration |
|---|---|---|
| 0:00–0:15 | Crisp plan preview; title “BenefitBridge — Alexa+ interaction simulation / fictional household” | “Losing a job should not mean losing your way through public-program websites. BenefitBridge turns one difficult moment into a clear next-step plan. This is our Alexa+-style interaction simulation, using a fictional Kansas household.” |
| 0:15–0:40 | Reset; start job-loss path; answer household, child, income, coverage and energy questions. Editing may compress waits, not fabricate responses. | “Our household has three people, including a child, expects twelve hundred dollars in monthly gross income, has no health coverage, and pays its energy bill. We ask a short set of questions to organize next steps—not to decide eligibility.” |
| 0:40–1:05 | Four cards visible; move focus in priority order. | “The plan puts unemployment first: temporary, partial wage replacement for workers who meet state requirements. Food Assistance helps qualifying households buy food. KanCare offers medical-assistance pathways. Energy assistance is different: Kansas says the 2026 application period is closed, so we do not send this household to an open application that does not exist.” |
| 1:05–1:25 | Expand SNAP or KanCare; show reason, documents, official source and source date. | “Every recommendation explains why it appears and where to verify it. Here are the official agency link and a preparation checklist. These are screening suggestions. Only the agencies can make final decisions.” |
| 1:25–1:50 | Mark a task; prove resume using final implemented mode. For local-only path retain label “Browser local-storage resume.” For verified cloud path use independent fresh session/tool read and sanitized case identifier. | “The household can keep track of its next action and return to the plan. [LOCAL VERSION: This browser demonstration saves progress locally. The separate MCP backend includes a cloud case repository.] [CLOUD VERSION ONLY AFTER PROOF: We reload the same saved case in a fresh session and recover the task state from the server.]” |
| 1:50–2:10 | Enable follow-up; show actual due date and mode. Separate backend proof panel if browser not wired. | “The backend can schedule a one-time follow-up thirty days ahead. Its handler marks the saved case due for review. It does not monitor government websites, detect a new application window, or send a push notification.” |
| 2:10–2:30 | Architecture SVG; short actual MCP output excerpt if verified; no scrolling raw logs. | “MCP tools connect intake, routing and progress. Deterministic rules choose the program list. Optional Amazon Bedrock language support can interpret an answer or explain that list, with a deterministic fallback. DynamoDB and EventBridge are the backend persistence and follow-up adapters.” |
| 2:30–2:40 | Return to clean plan; title/tagline and repository. | “BenefitBridge does not promise benefits. It helps a difficult life event become a manageable next step.” |

Read the exact final narration once against a timer; adjust pauses, not disclosure text. Replace every alternative with one truthful version before recording. If no fresh cloud proof exists, narrate repository capability and show separately labeled local/MCP modes—not a cloud success montage. If voice recognition is unreliable, use buttons; never synthesize Alexa audio that suggests a real integration.

## Screenshot shotlist (capture after engineering freeze)
1. **Cover, 16:9:** real plan, four cards and concise tagline. No fictional testimonial or invented metrics.
2. **Intake, desktop:** question and answer controls, simulation and fictional-data labels visible.
3. **Trust detail:** expanded SNAP/KanCare card with explanation, official link, checked date and disclaimer. Do not replace source dates with this documentation’s research date without implementation/content review.
4. **Closed seasonal state:** LIEAP “closed” wording beside honest thirty-day follow-up control; no “watch live” claim.
5. **Persistence proof:** before/after task state; visible local/server mode; sanitize access handles.
6. **Mobile, approximately 390 px:** readable cards, keyboard focus and no horizontal overflow.
7. **Backend evidence, optional:** sanitized MCP structured output, persistence mode and schedule time from an actual run; not mocked terminal text.
8. **Architecture:** architecture.svg; it is an explanatory diagram, not an app screenshot.

Capture PNG at 1440×900 or 1920×1080 for desktop; prefer genuine browser output over compositing. Provide descriptive alt text. No actual screenshots/video are produced by this package; engineering owns browser proof and owner owns recording/upload.
