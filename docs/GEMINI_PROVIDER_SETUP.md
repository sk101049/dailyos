# Gemini Provider Adapter Setup

DailyOS includes a Gemini video provider adapter scaffold and a server-side-only video API spike.

## Current Scope

- Server-side configuration only.
- No API key is exposed to the frontend.
- The API spike is disabled unless `GEMINI_VIDEO_API_ENABLED=true`.
- No one-click render UX is included.
- No paid API access is assumed.
- No background worker or polling worker is included.

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

Enable the spike explicitly:

```bash
GEMINI_VIDEO_API_ENABLED=true
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

`GET` returns feature-flag and configuration status only.

`POST` accepts a Gemini prompt package or prompt string and submits a Veo long-running prediction only when the feature flag and server API key are present. The route returns the operation metadata for manual follow-up. It does not expose the API key, poll in the background, download files, or store output.

## Future Upgrade Path

When official credentials and API access are available, add a user-facing submit/poll/download flow that reads the same Production Package shape. Keep UI components using the unified provider status and production package shape instead of calling provider SDKs directly.
