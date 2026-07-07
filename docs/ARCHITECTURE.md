# DailyOS Architecture

DailyOS is a local-first Next.js App Router application for insurance-focused content planning and AI video production.

## Runtime

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn-style shared UI components
- Browser LocalStorage for MVP data
- Server-side API routes for provider calls that require secrets

## Core Flow

```text
AI Director
  -> Video Studio
  -> Render Queue
  -> Gemini / OpenMontage
  -> Asset Library
  -> Publishing
```

## Data Boundaries

- UI pages live in `app/`.
- Feature implementations live in `features/`.
- Shared UI primitives live in `components/ui/`.
- Provider adapters live in `lib/video-providers/`.
- Render queue helpers live in `lib/render-queue.ts`.
- Documentation lives in `docs/`.

## LocalStorage Keys

- `dailyos-projects`
- `dailyos-script-library`
- `dailyos-character-library`
- `dailyos-voice-library`
- `dailyos-storyboard-v2`
- `dailyos-video-packages`
- `dailyos-render-queue`
- `dailyos-rendered-videos`
- `dailyos-publishing-center`

## Provider Security

Provider secrets stay on the server. The frontend calls API routes such as `/api/video-providers` and `/api/video-providers/gemini`; API keys are never returned to the browser.
