# Prompts

Use these templates when asking AI agents to work on DailyOS.

## Standard Codex Task Prompt

```text
You are the software engineer for DailyOS.

Complete GitHub Issue #[number].

Rules:
- Read the issue before changing files.
- Keep the work scoped to the issue.
- Do not modify unrelated files.
- Follow .ai/CODING_RULES.md, .ai/UI_RULES.md, and .ai/PRODUCT_PRINCIPLES.md.
- Run relevant checks.
- Commit with the issue's requested commit message when provided.

After finishing, summarize:
- Files changed
- What was implemented
- Checks run
- Commit hash
```

## Standard Code Review Prompt

```text
Review the current DailyOS changes.

Focus on:
- Bugs or broken behavior
- Scope creep beyond the issue
- TypeScript or Next.js problems
- UI consistency with .ai/UI_RULES.md
- Missing checks or documentation

Return findings first, ordered by severity, with file references.
```

## Standard Bugfix Prompt

```text
Fix the reported DailyOS bug.

Context:
- Bug:
- Expected behavior:
- Actual behavior:
- Relevant files:

Rules:
- Reproduce or inspect the problem first.
- Make the smallest safe fix.
- Do not add unrelated features.
- Run relevant checks.
- Summarize the root cause and fix.
```
