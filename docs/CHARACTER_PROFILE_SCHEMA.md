# Character Profile JSON Schema

DailyOS Character Studio stores MVP character profiles in `localStorage` under `dailyos-character-library`.

The schema is provider-agnostic. Future image, video, or OpenMontage integrations should adapt this shape instead of putting provider fields directly into UI components.

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "DailyOS Character Profile",
  "type": "object",
  "required": [
    "id",
    "name",
    "version",
    "references",
    "hairstyle",
    "hairColor",
    "outfit",
    "expressions",
    "brandAttributes",
    "createdAt",
    "updatedAt"
  ],
  "properties": {
    "id": { "type": "string" },
    "name": { "type": "string" },
    "version": { "type": "integer", "minimum": 1 },
    "references": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["angle", "fileName"],
        "properties": {
          "angle": { "enum": ["front", "45", "side"] },
          "fileName": { "type": "string" }
        }
      }
    },
    "hairstyle": { "type": "string" },
    "hairColor": { "type": "string" },
    "outfit": { "type": "string" },
    "expressions": { "type": "string" },
    "brandAttributes": { "type": "string" },
    "providerNotes": { "type": "string" },
    "createdAt": { "type": "string", "format": "date-time" },
    "updatedAt": { "type": "string", "format": "date-time" }
  }
}
```

## Prompt Package Contract

Each profile can be converted into a reusable prompt package with:

- character name and version
- front, 45-degree, and side reference image names
- hairstyle and hair color
- outfit
- expression range
- brand attributes
- provider notes
- consistency lock for face, hairstyle, hair color, outfit, body proportions, expression range, and brand style

## MVP Limits

- Uploaded image files are not persisted; only filenames are stored.
- No cloud sync.
- No authentication.
- No external image or video generation provider is called.
