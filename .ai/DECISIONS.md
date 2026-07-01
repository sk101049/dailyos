# Decisions

Use this file to record durable technical and product decisions.

## Decision Log Format

```text
## YYYY-MM-DD: Decision Title

Status: Proposed | Accepted | Replaced

Decision:
Short statement of the decision.

Context:
Why this decision was needed.

Impact:
What this changes for future work.
```

## 2026-07-01: Use Next.js App Router

Status: Accepted

Decision:
DailyOS uses the Next.js App Router for routing, layouts, and pages.

Context:
The project needs a modern React foundation with clear route-level organization.

Impact:
New screens should be added under `app/` unless a future decision replaces this approach.

## 2026-07-01: Use TypeScript

Status: Accepted

Decision:
DailyOS uses TypeScript for application code.

Context:
The project should remain safe for AI-assisted edits and easier to refactor over time.

Impact:
New app code should be typed and compatible with strict TypeScript settings.

## 2026-07-01: Use Tailwind CSS

Status: Accepted

Decision:
DailyOS uses Tailwind CSS for styling.

Context:
The project needs fast, consistent UI styling without a large custom design system.

Impact:
New UI should use Tailwind classes and shared theme tokens.

## 2026-07-01: Build UI Before AI Integrations

Status: Accepted

Decision:
DailyOS should build the core user interface before adding AI integrations.

Context:
The user workflow needs to be clear before automation or model calls are introduced.

Impact:
AI features should wait for dedicated issues after the manual workflow exists.
