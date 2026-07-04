# Medical Insurance Short 001 v2

## Output

- Final MP4: `exports/medical-insurance-short-001-v2.mp4`
- Format: 1080x1920, 9:16 vertical
- Duration: 30 seconds
- Topic: 有醫療險就夠了嗎？

## Template Changes

- Added local female voiceover with `Microsoft Hanhan Desktop` (`zh-TW`, female) because Piper is installed but no Piper voice model is available locally.
- Replaced scrolling word captions with fixed scene-by-scene subtitles.
- Increased subtitle readability for mobile and burned captions into the video.
- Added a friendly young Asian female presenter avatar throughout the video.
- Shifted style lighter and brighter with blue, pink, and white social-media visuals.

## Files

- `voiceover.txt` - v2 narration script
- `voiceover.wav` - generated local female voiceover
- `subtitles.srt` - fixed scene captions
- `presenter.png` - local avatar source image
- `presenter-base.mp4` - avatar plus voiceover
- `render-config.json` - OpenMontage `TalkingHead` render configuration
- `render-command.md` - commands and blocker notes
- `preview-05s.png` - visual QA frame

## Limitation

OpenMontage Remotion `TalkingHead` was attempted, but the bundle tried to load Google font files and failed in sandboxed mode. Escalated network render was unavailable because the session hit its usage limit. The final playable v2 MP4 was completed with the local FFmpeg workflow documented in `docs/AI_VIDEO_SETUP.md`.

Piper executable is installed at `vendor/OpenMontage/.venv/Scripts/piper.exe`, but no local Piper voice model exists under the expected model directory. The v2 prototype uses the already installed Windows zh-TW female voice instead of downloading a new model.

## Verification

`ffprobe` result:

```text
width=1080
height=1920
display_aspect_ratio=9:16
video duration=30.000000
audio duration=30.000000
container duration=30.000000
```
