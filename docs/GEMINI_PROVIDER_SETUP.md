# Gemini Provider Adapter Setup

DailyOS includes a Gemini video provider adapter scaffold and a server-side-only video API spike.

## Current Scope

- Server-side configuration only.
- No API key is exposed to the frontend.
- Render Queue can submit, sync, and download Gemini video jobs.
- No paid API access is assumed.
- No background worker is included; status updates are manual.

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

Gemini video is enabled by default when a server key exists. To disable it locally:

```bash
GEMINI_VIDEO_API_ENABLED=false
```

DailyOS only reports whether configuration exists. It never returns the secret value to the client.

## Status Endpoint

The Video Studio reads provider status from:

```text
GET /api/video-providers
```

The response contains provider metadata, configuration status, missing env var names, and a placeholder connection-test message.

The server-side Gemini video spike is available at:

```text
GET /api/video-providers/gemini
POST /api/video-providers/gemini
```

`GET` returns configuration status, or polls an operation when `operationName` is provided.

`POST` accepts a Gemini prompt package or prompt string and submits a Veo long-running prediction when the server API key is present.

Downloads use:

```text
GET /api/video-providers/gemini?operationName=...&download=1
```

The route downloads through the server so the API key is not exposed to the browser.

## Future Upgrade Path

Keep UI components using the unified provider status and production package shape instead of calling provider SDKs directly. Add background workers only when DailyOS moves beyond the LocalStorage-only MVP.
