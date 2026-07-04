# Medical Insurance Short 001

## Topic

有醫療險就夠了嗎？

## Output

- Final video: `exports/medical-insurance-short-001.mp4`
- Duration target: 30 seconds
- Final format target: 9:16 vertical short
- Source props: `exports/medical-insurance-short-001/openmontage-props.json`

## Included Assets

- Storyboard: `exports/medical-insurance-short-001/storyboard.md`
- Voiceover script: `exports/medical-insurance-short-001/voiceover.txt`
- Subtitles: `exports/medical-insurance-short-001/subtitles.srt`
- OpenMontage props: `exports/medical-insurance-short-001/openmontage-props.json`

## Render Command

From `vendor/OpenMontage/remotion-composer`:

```powershell
npx.cmd remotion render src/index.tsx Explainer ..\..\..\exports\medical-insurance-short-001-horizontal.mp4 --props ..\..\..\exports\medical-insurance-short-001\openmontage-props.json --codec h264
```

Vertical conversion from repository root:

```powershell
ffmpeg -y -i exports\medical-insurance-short-001-horizontal.mp4 -vf "scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,setsar=1" -c:v libx264 -pix_fmt yuv420p -an exports\medical-insurance-short-001.mp4
```

## Limitation

The OpenMontage `Explainer` composition currently renders at 1920x1080. The prototype uses that working OpenMontage renderer first, then converts the rendered file to 1080x1920 with FFmpeg for the requested vertical short output.
