# DailyOS v1.0.0-rc.1 Release Notes

Release candidate date: 2026-07-07

## Summary

DailyOS v1.0.0-rc.1 is a stabilization release candidate focused on validating the local-first creator workflow:

```text
AI Director -> Video Studio -> Render Queue -> Gemini/OpenMontage -> Asset Library -> Publishing
```

## Included

- v1 Dashboard and shared Design System applied across core studios.
- Health page at `/health` for RC readiness checks.
- Gemini Render Queue flow with server-side API key handling.
- OpenMontage production package and render command handoff.
- Asset Library support for generated and imported MP4 assets.
- Publishing handoff from completed video assets.
- RC documentation:
  - `docs/ARCHITECTURE.md`
  - `docs/DESIGN_SYSTEM.md`
  - `docs/RELEASE_CHECKLIST.md`

## Validation Status

- `npm run build`: passed.
- `npm run lint`: passed through ESLint CLI.
- `/health`: verified as available and meaningful for RC checks.
- Core creation routes and provider status endpoint: HTTP 200 locally.
- Demo flows: documented as pass for local-first handoff paths.

## Known Limitations

- No database, authentication, cloud sync, or background worker in this RC.
- Gemini live generation requires valid server-side credentials and model access.
- OpenMontage rendering remains a local/manual provider path.

## Tag Preparation

Do not create the tag until explicitly approved.

Recommended commands after approval:

```bash
git checkout codex-ai-video-setup
git pull origin codex-ai-video-setup
git tag -a v1.0.0-rc.1 -m "DailyOS v1.0.0-rc.1"
git push origin v1.0.0-rc.1
```
