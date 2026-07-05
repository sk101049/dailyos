# Gemini Video API Feasibility Notes

## Official API Path

Official docs reviewed on 2026-07-05:

- Gemini video overview: https://ai.google.dev/gemini-api/docs/video
- Veo 3.1 generation: https://ai.google.dev/gemini-api/docs/veo
- Gemini API libraries: https://ai.google.dev/gemini-api/docs/libraries
- Gemini pricing: https://ai.google.dev/gemini-api/docs/pricing
- Gemini billing: https://ai.google.dev/gemini-api/docs/billing

Google currently documents two video generation paths in the Gemini API:

- Gemini Omni Flash: `gemini-omni-flash-preview`, using the Interactions API.
- Veo 3.1: `veo-3.1-generate-preview`, using a long-running video generation flow.

For this spike, DailyOS uses the Veo 3.1 REST path because it matches the existing Gemini prompt package handoff and has an explicit long-running operation and download flow.

## SDK / Endpoint

Official SDK: Google GenAI SDK.

- JavaScript package: `@google/genai`
- Python package: `google-genai`

DailyOS does not add the SDK yet. The spike uses `fetch` against the REST endpoint to avoid adding a dependency before access is confirmed.

REST submit endpoint:

```text
POST https://generativelanguage.googleapis.com/v1beta/models/veo-3.1-generate-preview:predictLongRunning
```

Required header:

```text
x-goog-api-key: <server-side key>
```

## Request Shape

Minimal request:

```json
{
  "instances": [
    {
      "prompt": "Gemini prompt package text"
    }
  ],
  "parameters": {
    "aspectRatio": "9:16",
    "durationSeconds": "8",
    "resolution": "720p"
  }
}
```

Supported parameters relevant to DailyOS:

- `aspectRatio`: `16:9` or `9:16`
- `durationSeconds`: short clip duration, currently suitable for 8-second Veo clips
- `resolution`: `720p`, `1080p`, or `4k` depending on model and availability
- `personGeneration`: optional safety/person-generation control

## Job Status / Download Flow

Veo uses a long-running operation:

1. Submit `predictLongRunning`.
2. Read the returned operation `name`.
3. Poll the operation endpoint until `done` is true.
4. Read the generated video URI from the completed response.
5. Download the URI with the same API key.

DailyOS only implements step 1 in this spike. Polling, downloading, local file storage, and background workers are out of scope.

## Environment Variables

DailyOS checks these server-side keys:

```bash
GEMINI_API_KEY=...
GOOGLE_AI_API_KEY=...
GOOGLE_API_KEY=...
```

The spike is disabled unless this feature flag is present:

```bash
GEMINI_VIDEO_API_ENABLED=true
```

## Billing / Permission Requirements

Veo video generation is not available on the free tier according to current pricing docs. A paid Gemini API tier and billing setup are required before real submissions should be expected to work.

The API may also fail because of:

- unavailable model access for the account or region
- missing billing
- rate limits
- safety policy rejection
- audio processing failure

## DailyOS Spike

Server-side endpoint:

```text
GET /api/video-providers/gemini
POST /api/video-providers/gemini
```

`GET` returns only feature-flag/configuration status.

`POST` accepts:

```json
{
  "prompt": "...",
  "geminiPromptPackage": "...",
  "model": "veo-3.1-generate-preview",
  "aspectRatio": "9:16",
  "durationSeconds": "8",
  "resolution": "720p"
}
```

Graceful fallback behavior:

- If `GEMINI_VIDEO_API_ENABLED` is not `true`, the route returns `feature_disabled`.
- If no server-side key exists, the route returns `not_configured`.
- If the prompt is empty, the route returns `invalid_request`.
- If Google rejects the request, the route returns `api_error` without exposing secrets.

## Current Blocker

The code path is ready for a safe server-side submission, but real video generation is blocked until a paid Gemini API project with Veo access is confirmed.
