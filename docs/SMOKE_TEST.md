# AI Creator OS Smoke Test

Use this checklist before future redesigns or provider integrations.

## Build

- [ ] Run `npm run build`.
- [ ] Confirm `/content`, `/character`, `/voice`, `/video`, `/settings/api-keys`, `/calendar`, and `/publishing` appear in the build output.

## Local App Flow

- [ ] Start the app with `npm run dev`.
- [ ] Open Dashboard and confirm the app shell navigation is visible.
- [ ] Open Content Studio and save a script to Script Library.
- [ ] Open Character Studio and save one character profile.
- [ ] Open Voice Studio and save one voice profile.
- [ ] Return to Content Studio and create storyboard scenes.
- [ ] Open Video Studio and confirm the saved script, character, voice, and storyboard are available.
- [ ] Select Gemini and export `production-package.json`, `project-manifest.json`, `gemini-prompt-package.md`, and `render-command.md`.
- [ ] Select OpenMontage and export `openmontage-props.json`.
- [ ] Open API Key Settings and confirm provider statuses are readable without exposing secret values.
- [ ] Open Calendar and Publishing to confirm local planning pages still render.

## localStorage Flow

- Script Library uses `dailyos-script-library`.
- Character Studio uses `dailyos-character-library`.
- Voice Studio uses `dailyos-voice-library`.
- Storyboard Studio uses `dailyos-storyboard-v2`.
- Video Studio reads those keys and writes `dailyos-video-packages`.
- Calendar uses `dailyos-content-calendar`.
- Publishing uses `dailyos-publishing-center`.

These keys should stay separate except where a later studio intentionally reads an earlier studio asset.

## Out of Scope For This Smoke Test

- Automatic provider generation.
- Cloud sync.
- Login.
- Database writes.
- Background render workers.
