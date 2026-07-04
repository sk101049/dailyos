# Render Command v2

## Voiceover

```powershell
Add-Type -AssemblyName System.Speech; $text = Get-Content exports\medical-insurance-short-001-v2\voiceover.txt -Raw; $synth = New-Object System.Speech.Synthesis.SpeechSynthesizer; $synth.SelectVoice('Microsoft Hanhan Desktop'); $synth.Rate = 1; $synth.Volume = 100; $synth.SetOutputToWaveFile('exports\medical-insurance-short-001-v2\voiceover.wav'); $synth.Speak($text); $synth.Dispose()
```

## Presenter Base

```powershell
ffmpeg -y -loop 1 -i exports\medical-insurance-short-001-v2\presenter.png -i exports\medical-insurance-short-001-v2\voiceover.wav -t 30 -c:v libx264 -pix_fmt yuv420p -vf "scale=1080:1920,setsar=1" -af apad -c:a aac exports\medical-insurance-short-001-v2\presenter-base.mp4
```

## Final MP4

```powershell
ffmpeg -y -i exports\medical-insurance-short-001-v2\presenter-base.mp4 -vf "subtitles=exports/medical-insurance-short-001-v2/subtitles.srt:force_style='FontName=Microsoft JhengHei UI,Fontsize=11,PrimaryColour=&H00FFFFFF&,BackColour=&HCC111111&,BorderStyle=4,Outline=2,Shadow=0,MarginV=30,Alignment=2'" -c:v libx264 -pix_fmt yuv420p -c:a copy exports\medical-insurance-short-001-v2.mp4
```

## OpenMontage Remotion Attempt

```powershell
npx.cmd remotion render src/index.tsx TalkingHead ..\..\..\exports\medical-insurance-short-001-v2.mp4 --props ..\..\..\exports\medical-insurance-short-001-v2\render-config.json --codec h264 --frames 0-899
```

Blocked by Google font network loading inside the Remotion bundle. Escalated network render was unavailable because the session hit its usage limit, so v2 used the local FFmpeg workflow from the OpenMontage setup.

## Verification

```powershell
ffprobe -v error -show_entries format=duration -show_entries stream=index,codec_type,width,height,display_aspect_ratio,duration -of default=noprint_wrappers=1 exports\medical-insurance-short-001-v2.mp4
```
