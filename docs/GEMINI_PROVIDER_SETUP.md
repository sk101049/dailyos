# Gemini Provider Adapter Setup

DailyOS includes a Gemini video provider adapter scaffold for future API integration.

## Current Scope

- Server-side configuration only.
- No API key is exposed to the frontend.
- No automatic video generation.
- No paid API access is assumed.
- No network connection test is run in this MVP.

## Environment Variables

Set one of these variables on the server:

```bash
GEMINI_API_KEY=your_key_here
```

Fallback names are also recognized:

```bash
GOOGLE_AI_API_KEY=your_key_here
GOOGLE_API_KEY=your_key_here
```

DailyOS only reports whether configuration exists. It never returns the secret value to the client.

## Status Endpoint

The Video Studio reads provider status from:

```text
GET /api/video-providers
```

The response contains provider metadata, configuration status, missing env var names, and a placeholder connection-test message.

## Future Upgrade Path

When official credentials and API access are available, add the real Gemini request logic inside the Gemini adapter. Keep UI components using the unified provider status and production package shape instead of calling provider SDKs directly.
