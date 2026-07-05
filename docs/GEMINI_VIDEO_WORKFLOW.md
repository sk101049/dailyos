# Gemini Video Workflow

DailyOS supports Gemini as a manual Video Studio provider. A server-side API spike also exists, but it is feature-flagged and not connected to one-click rendering.

## Scope

- No API keys are stored.
- No API keys are exposed to the frontend.
- No paid access is assumed.
- No automatic Gemini, Veo, or Google AI Studio API calls are made by the UI.
- Output is copied or exported for manual use.

## Workflow

1. Open `Video Studio`.
2. Select a script, character profile, voice profile, and the current storyboard.
3. Choose `Gemini` as the video provider.
4. Confirm the video settings:
   - aspect ratio
   - target duration
   - visual style
   - character reference notes
   - voice/audio direction
   - subtitle direction
5. Copy the Gemini prompt package.
6. Open Gemini or Google AI Studio.
7. Paste the prompt and generate the video manually.
8. Paste the output URL or local file path into the manual result tracking field.
9. Export the metadata JSON or Gemini prompts markdown when needed.

## Optional API Spike

The spike endpoint is server-side only:

```text
POST /api/video-providers/gemini
```

It is disabled unless `GEMINI_VIDEO_API_ENABLED=true` is set on the server. It accepts:

```json
{
  "geminiPromptPackage": "...",
  "aspectRatio": "9:16",
  "durationSeconds": "8",
  "resolution": "720p"
}
```

When enabled and configured, it submits a long-running Veo request and returns the operation metadata. DailyOS does not poll the job, download the video, or store output yet.

## Provider Notes

The Gemini prompt package is generated from the existing production package:

- Script Library data
- Character Studio data
- Voice Studio data
- Storyboard Studio scenes

The provider layer stays replaceable. A future API integration should read the same production package shape and map it to the selected provider adapter.
