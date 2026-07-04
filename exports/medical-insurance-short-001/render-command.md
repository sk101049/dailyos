# Render Command

## OpenMontage Render

Run from `vendor/OpenMontage/remotion-composer`:

```powershell
npx.cmd remotion render src/index.tsx Explainer ..\..\..\exports\medical-insurance-short-001-horizontal.mp4 --props ..\..\..\exports\medical-insurance-short-001\openmontage-props.json --codec h264
```

## Vertical Export

Run from the repository root:

```powershell
ffmpeg -y -i exports\medical-insurance-short-001-horizontal.mp4 -vf "scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,setsar=1" -c:v libx264 -pix_fmt yuv420p -an exports\medical-insurance-short-001.mp4
```

## Verification

```powershell
ffprobe -v error -select_streams v:0 -show_entries stream=width,height,display_aspect_ratio,duration -of default=noprint_wrappers=1 exports\medical-insurance-short-001.mp4
```

Expected output:

```text
width=1080
height=1920
display_aspect_ratio=9:16
duration=30.000000
```
