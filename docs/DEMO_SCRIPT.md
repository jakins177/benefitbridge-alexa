# BenefitBridge Demo Script

## Purpose

Define the canonical three-minute product story before implementation expands. All engineering decisions should make this exact path more credible.

## Seed household

- Kansas resident
- Household of three
- At least one child under 19
- Recent job loss
- Expected current-month gross income: $1,200
- No current health coverage
- Responsible for the home-energy bill

## Conversation

1. User: “Alexa, I lost my job yesterday and I’m worried about food, healthcare, and my utility bill.”
2. BenefitBridge acknowledges the situation and asks only the facts needed for routing.
3. The user supplies the seeded household facts.
4. BenefitBridge presents:
   - Kansas Unemployment as an immediate action.
   - SNAP and KanCare as official screenings to begin.
   - LIEAP as a closed seasonal window to monitor, not an open application.
5. User expands one recommendation and sees its reason, documents, verification date, and official source.
6. User marks an action started and enables the LIEAP watch.
7. The page is refreshed to demonstrate saved progress.
8. Later AWS milestone: the reminder is persisted in DynamoDB and scheduled through EventBridge.

## Closing line

“BenefitBridge does not promise benefits. It makes sure a difficult life event does not become a maze of missed programs, missing documents, and forgotten deadlines.”
