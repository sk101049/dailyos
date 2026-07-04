# Voice Profile JSON Schema

DailyOS Voice Studio stores MVP voice profiles in `localStorage` under `dailyos-voice-library`.

The schema is provider-agnostic. Future TTS integrations should adapt this shape to Piper, ElevenLabs, OpenAI TTS, Azure Speech, or another provider without moving provider-specific logic into UI components.

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "DailyOS Voice Profile",
  "type": "object",
  "required": [
    "id",
    "name",
    "genderAge",
    "speakingStyle",
    "tone",
    "speed",
    "pauseLevel",
    "emotionalWarmth",
    "formalityLevel",
    "preset",
    "legalUseNote",
    "createdAt",
    "updatedAt"
  ],
  "properties": {
    "id": { "type": "string" },
    "name": { "type": "string" },
    "genderAge": { "type": "string" },
    "speakingStyle": { "type": "string" },
    "tone": { "type": "string" },
    "speed": { "enum": ["Slow", "Medium", "Fast"] },
    "pauseLevel": { "enum": ["Low", "Medium", "High"] },
    "emotionalWarmth": { "enum": ["Low", "Medium", "High"] },
    "formalityLevel": { "enum": ["Casual", "Warm", "Professional"] },
    "preset": {
      "enum": ["生活化聊天", "專業教學", "溫柔說明", "活潑短影音"]
    },
    "providerNotes": { "type": "string" },
    "legalUseNote": { "type": "string" },
    "createdAt": { "type": "string", "format": "date-time" },
    "updatedAt": { "type": "string", "format": "date-time" }
  }
}
```

## Speech Optimizer Contract

The MVP Speech Optimizer is local-only. It:

- accepts pasted text or a script loaded from Script Library
- rewrites common formal phrases into spoken Traditional Chinese
- inserts `[pause]` markers after sentence endings
- wraps important insurance words with `**emphasis**`

## Future TTS Guardrails

- Do not add paid TTS calls until an issue explicitly requests provider integration.
- Use only legally owned or explicitly permitted voice samples.
- Keep provider-specific voice IDs and model settings as adapter metadata, not required profile fields.
