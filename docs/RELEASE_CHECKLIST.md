# DailyOS v1.0 Release Candidate Checklist

## Build

- [x] `npm run build` passes.
- [ ] `npm run lint` currently opens the deprecated `next lint` interactive migration prompt; migrate to ESLint CLI before v1.0 final.

## End-to-End Validation

- [ ] AI Director creates a usable draft.
- [ ] Video Studio creates a Render Job.
- [ ] Render Queue can start and sync a Gemini job.
- [ ] OpenMontage jobs preserve props and render command.
- [ ] Completed videos appear in Asset Library.
- [ ] Publishing can create an item from a completed video asset.

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

- Preserve LocalStorage compatibility.
- Do not add authentication, database, or background workers for this RC.
- Keep provider secrets server-side only.
