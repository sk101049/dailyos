# DailyOS v1.0 Release Candidate Checklist

Status updated for `v1.0.0-rc.1` on 2026-07-07.

## Build

- [x] `npm run build` passes.
- [ ] `npm run lint` currently opens the deprecated `next lint` interactive migration prompt; migrate to ESLint CLI before v1.0 final.

## End-to-End Validation

- [x] AI Director creates a usable draft.
- [x] Video Studio creates a Render Job.
- [x] Render Queue can start and sync a Gemini job when server credentials are configured.
- [x] OpenMontage jobs preserve props and render command.
- [x] Completed videos appear in Asset Library.
- [x] Publishing can create an item from a completed video asset.

## Demo Scenarios

- [x] AI short-form demo: AI Director -> Video Studio -> Render Queue.
- [x] Insurance education demo: Production Package -> Gemini prompt package -> Render Queue.
- [x] OpenMontage demo: Video Studio -> `openmontage-props.json` -> render command.
- [x] Completed video handoff: Asset Library -> Publishing.
- [x] System health verification: `/health` shows Build, API Key, Provider, Render Queue, Asset Library, and Publishing readiness.

## System Health

- [x] Health page exists at `/health`.
- [x] Build status is visible.
- [x] Provider availability is visible.
- [x] Render Queue health is visible.
- [x] Asset Library health is visible.
- [x] Publishing readiness is visible.

## Documentation

- [x] `docs/ARCHITECTURE.md`
- [x] `docs/DESIGN_SYSTEM.md`
- [x] `docs/RELEASE_CHECKLIST.md`

## Release Notes

- [x] `docs/RELEASE_NOTES_v1.0.0-rc.1.md` exists.
- Preserve LocalStorage compatibility.
- Do not add authentication, database, or background workers for this RC.
- Keep provider secrets server-side only.

## Known RC Gaps

- `npm run lint` uses deprecated `next lint` and opens an interactive migration prompt under Next.js 15.
- Gemini live rendering requires a valid server-side API key and provider access.
- OpenMontage remains a local/manual render path.
