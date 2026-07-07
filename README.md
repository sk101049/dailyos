# DailyOS

DailyOS is a personal AI insurance workspace for planning content, organizing daily work, and assembling local AI video production packages.

Current version: 0.1.0-beta

## Current MVP

- Dashboard for daily priorities and assistant suggestions.
- Script Studio in Content Studio with GPT Mode, GPT output paste, editable script preview, and Script Library.
- Character Studio for reusable presenter profiles.
- Voice Studio for reusable narration profiles.
- Storyboard Studio in Content Studio for scene prompts, character locks, and voice locks.
- Video Studio for assembling a local production package from script, character, voice, storyboard, and selected provider.
- API Key Settings for checking local environment configuration without exposing secrets to the frontend.
- System Health page for v1.0 RC readiness checks.
- CRM workspace for client follow-up planning.
- Calendar for local content planning.
- Publishing Center for local-first short-form video publishing status.

## Local Usage Flow

1. Run the app locally.

```bash
npm install
npm run dev
```

2. Open the local Next.js URL shown in the terminal.
3. Create or save a script in Content Studio.
4. Create a character in Character Studio.
5. Create a voice in Voice Studio.
6. Build storyboard scenes in Content Studio.
7. Open Video Studio and assemble the production package.
8. Export the package files for a manual Gemini or OpenMontage workflow.
9. Use API Key Settings only to confirm which local keys are configured.

DailyOS uses browser localStorage for the current MVP. It does not require login, a database, cloud sync, background render workers, or automatic provider generation.

## Project Structure

```text
README.md
app/
  dashboard/
  content/
  character/
  voice/
  video/
  settings/api-keys/
  health/
  calendar/
  crm/
  publishing/
features/
  dashboard/
  content/
  character/
  voice/
  video/
  settings/
  health/
  calendar/
  crm/
  publishing/
components/
  ui/
docs/
  PROJECT.md
  ROADMAP.md
  TASKS.md
  SMOKE_TEST.md
  CHANGELOG.md
```

## Documentation

- [Project overview](docs/PROJECT.md)
- [Development roadmap](docs/ROADMAP.md)
- [Tasks](docs/TASKS.md)
- [End-to-end smoke test checklist](docs/SMOKE_TEST.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Design system](docs/DESIGN_SYSTEM.md)
- [Release checklist](docs/RELEASE_CHECKLIST.md)
