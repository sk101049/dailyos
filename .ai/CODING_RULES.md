# Coding Rules

These rules guide AI agents and developers working on DailyOS.

## TypeScript Standards

- Use TypeScript for application code.
- Prefer explicit types for shared data structures, props, and exported functions.
- Keep `strict` mode compatible code.
- Avoid `any` unless there is a clear boundary with an unknown external value.
- Keep functions small and named around the user action or domain concept they support.

## Component Rules

- Build UI with React components in the Next.js App Router.
- Prefer server components by default; use client components only for state, effects, or browser-only APIs.
- Keep reusable UI primitives in `components/ui/`.
- Keep product-specific components close to their feature or route.
- Use shadcn/ui patterns and the shared `cn()` helper for class composition.

## Folder Conventions

- `app/`: routes, layouts, and route-level pages.
- `components/ui/`: reusable shadcn-style primitives.
- `components/`: shared application components.
- `lib/`: utilities and framework-agnostic helpers.
- `docs/`: human-readable project documentation.
- `.ai/`: AI-agent rules, decisions, prompts, and checklists.

## Commit Conventions

- Use concise conventional commit messages.
- Use `docs:` for documentation-only changes.
- Use `chore:` for setup, tooling, or maintenance changes.
- Use `feat:` for user-facing product capabilities.
- Use `fix:` for bug fixes.

## What Not To Do

- Do not add backend services before the UI workflow is clear.
- Do not add database, authentication, or AI integrations without a dedicated issue.
- Do not commit secrets, API keys, generated media, or local build output.
- Do not introduce large abstractions before the product flow needs them.
- Do not mix unrelated product, infrastructure, and documentation changes in one commit.
