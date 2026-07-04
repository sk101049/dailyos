# API Key Settings

DailyOS includes `/settings/api-keys` as a central setup page for future provider integrations.

## Security Rules

- Do not commit API keys to git.
- Do not paste real keys into issues, pull requests, or public docs.
- Browser-entered keys are not secure for production.
- Production integrations should use server-side environment variables.
- The MVP settings page does not send browser-entered keys anywhere.

## `.env.local` Setup

Create or update `.env.local` in the project root:

```bash
OPENAI_API_KEY=
GEMINI_API_KEY=
GOOGLE_AI_API_KEY=
GOOGLE_API_KEY=
ELEVENLABS_API_KEY=
AZURE_SPEECH_KEY=
AZURE_SPEECH_REGION=
RUNWAY_API_KEY=
KLING_API_KEY=
PIKA_API_KEY=
CUSTOM_VIDEO_PROVIDER_API_KEY=
```

Only fill the variables you actually use.

## Source of Truth

Actual provider usage should read from server-side environment variables. For Gemini, the existing video provider adapter reports configuration through:

```text
GET /api/video-providers
```

The frontend only receives provider status. Secret values are never returned.
