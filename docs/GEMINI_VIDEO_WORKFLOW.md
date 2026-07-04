# Gemini Video Workflow

DailyOS supports Gemini as a manual Video Studio provider. This is a prompt and export workflow only.

## Scope

- No API keys are stored.
- No paid access is assumed.
- No automatic Gemini, Veo, or Google AI Studio API calls are made.
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

## Provider Notes

The Gemini prompt package is generated from the existing production package:

- Script Library data
- Character Studio data
- Voice Studio data
- Storyboard Studio scenes

The provider layer stays replaceable. A future API integration should read the same production package shape and map it to the selected provider adapter.
