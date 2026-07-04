# AI Video Setup

Local setup notes for Ponytail and OpenMontage. This does not integrate either project into DailyOS.

## Installation

### Local paths

- Ponytail: `vendor/ponytail`
- OpenMontage: `vendor/OpenMontage`
- OpenMontage venv: `vendor/OpenMontage/.venv`
- OpenMontage demo output: `vendor/OpenMontage/projects/demos/renders/code-to-screen.mp4`

`vendor/` is gitignored because these are third-party checkouts and local install artifacts.

### Ponytail

Official repo:

```powershell
git clone https://github.com/DietrichGebert/ponytail vendor\ponytail
cd vendor\ponytail
npm.cmd install
cd ponytail-mcp
npm.cmd install
```

Ponytail's README documents agent/plugin installation rather than a DailyOS runtime dependency. For this local checkout, the useful verification path is the included Node test suite and MCP package.

### OpenMontage

Official repo:

```powershell
git clone https://github.com/calesthio/OpenMontage vendor\OpenMontage
cd vendor\OpenMontage
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
cd remotion-composer
npm.cmd install
cd ..
.\.venv\Scripts\python.exe -m pip install piper-tts
Copy-Item .env.example .env -Force
npx.cmd --yes hyperframes --version
npx.cmd --yes hyperframes browser ensure
```

The official Windows README uses `py -3`; this machine does not have the `py` launcher, so `python` was used. PowerShell activation was avoided by calling `.venv\Scripts\python.exe` directly.

## Requirements

### Ponytail

- Node.js: required for Codex/Claude lifecycle hooks and tests. Tested with `v24.18.0`.
- Python: only needed for benchmark/correctness tests. Tested with `Python 3.12.10`.
- Extra Python package for benchmark smoke: `pandas`.
- GPU/CUDA: not required.
- FFmpeg: not required by Ponytail.
- API keys: none required.

### OpenMontage

- Python: official requirement is `3.10+`; repo `.python-version` is `3.10`. Tested with `3.12.10`.
- Node.js: official requirement is `18+`; HyperFrames requires `22+`. Tested with `v24.18.0`.
- FFmpeg: required. Tested with `ffmpeg 8.1.1-full_build-www.gyan.dev`.
- Remotion composer: installed through `vendor/OpenMontage/remotion-composer/npm.cmd install`.
- Piper TTS: installed with `piper-tts 1.4.2`.
- HyperFrames: `npx hyperframes` installed/cached as version `0.7.31`.
- Chrome Headless Shell:
  - HyperFrames cache: `C:\Users\sk101\.cache\hyperframes\chrome\chrome-headless-shell\win64-131.0.6778.85\chrome-headless-shell-win64\chrome-headless-shell.exe`
  - Remotion downloaded its own Chrome Headless Shell during the demo render.
- GPU/CUDA:
  - `nvidia-smi` is not available on this machine.
  - GPU local video generation was not installed.
  - Official GPU dependencies are `torch`, `torchaudio`, `torchvision`, plus `diffusers transformers accelerate` via `make install-gpu`.
- CUDA:
  - Required only for local GPU video generation, SadTalker/Wav2Lip, and similar GPU providers.
  - Not configured here.

## Required Models

### Ponytail

No model files are required.

### OpenMontage

- Piper local TTS requires a voice model. The official provider guide gives:

```powershell
piper --download-dir ~/.piper/models --model en_US-lessac-medium
```

- No local video model was installed because no CUDA GPU was detected.
- Official local video model options:
  - `wan2.1-1.3b` - 6GB+ VRAM
  - `wan2.1-14b` - 24GB+ VRAM
  - `hunyuan-1.5` - 12GB+ VRAM
  - `ltx2-local` - 8GB+ VRAM
  - `cogvideo-5b` - 10GB+ VRAM
  - `cogvideo-2b` - 6GB+ VRAM

## API Keys

No API keys were added. `vendor/OpenMontage/.env` was copied from `.env.example` only.

Official OpenMontage keys:

- `PEXELS_API_KEY` - free stock photos/videos
- `PIXABAY_API_KEY` - free stock photos/videos
- `GOOGLE_API_KEY` - Google TTS and Imagen
- `GOOGLE_APPLICATION_CREDENTIALS`, `GOOGLE_CLOUD_PROJECT`, `GOOGLE_CLOUD_LOCATION` - Google service account/Vertex path
- `ELEVENLABS_API_KEY` - TTS, music, sound effects
- `OPENAI_API_KEY` - OpenAI TTS and image generation
- `XAI_API_KEY` - Grok image/video
- `DOUBAO_SPEECH_API_KEY`, `DOUBAO_SPEECH_VOICE_TYPE` - Doubao Mandarin TTS
- `DASHSCOPE_API_KEY` - DashScope image/TTS/ASR
- `SUNO_API_KEY` - music generation
- `FAL_KEY` - FLUX/Recraft/Kling/Veo/MiniMax/Seedance gateway
- `HEYGEN_API_KEY` - HeyGen gateway
- `RUNWAY_API_KEY` - Runway direct API
- `HIGGSFIELD_API_KEY`, `HIGGSFIELD_API_SECRET`, or `HIGGSFIELD_KEY`
- `REPLICATE_API_TOKEN` - Seedance via Replicate
- `VIDEO_GEN_LOCAL_ENABLED`, `VIDEO_GEN_LOCAL_MODEL` - local GPU video generation
- `MODAL_LTX2_ENDPOINT_URL` - Modal-hosted LTX endpoint
- `UNSPLASH_ACCESS_KEY`
- `HF_TOKEN`
- `WAV2LIP_PATH`, `SADTALKER_PATH`

## Tested Commands

### Base environment

```powershell
node --version
npm.cmd --version
python --version
ffmpeg -version
nvidia-smi
```

Results:

- Node.js: `v24.18.0`
- npm: `11.16.0`
- Python: `3.12.10`
- FFmpeg: `8.1.1-full_build-www.gyan.dev`
- `nvidia-smi`: not found

### Ponytail

```powershell
cd vendor\ponytail
npm.cmd install
node --test tests\correctness.test.js
node scripts\check-rule-copies.js
cd ponytail-mcp
npm.cmd install
npm.cmd test
```

Results:

- `node --test tests\correctness.test.js`: passed, 13/13.
- `node scripts\check-rule-copies.js`: passed.
- `ponytail-mcp npm.cmd test`: passed, 3/3.

Full `npm.cmd test` in `vendor/ponytail` did not fully pass on Windows:

- CSV correctness initially failed until `pandas` was installed.
- Hermes tests still fail because `tests/hermes-plugin.test.js` hardcodes `python3`, and this Windows machine exposes `python` but not `python3`.

### OpenMontage

```powershell
cd vendor\OpenMontage
.\.venv\Scripts\python.exe render_demo.py --list
.\.venv\Scripts\python.exe -c "from tools.tool_registry import registry; import json; registry.discover(); print(json.dumps(registry.provider_menu_summary(), indent=2))"
.\.venv\Scripts\python.exe -c "from tools.tool_registry import registry; registry.discover(); info = registry._tools['video_compose'].get_info(); print(info.get('render_engines'))"
.\.venv\Scripts\python.exe -m backlot --help
npx.cmd --yes hyperframes doctor
.\.venv\Scripts\python.exe render_demo.py code-to-screen
ffprobe -v error -show_entries format=duration,size -show_entries stream=codec_name,width,height -of default=noprint_wrappers=1 vendor\OpenMontage\projects\demos\renders\code-to-screen.mp4
```

Results:

- Demo fixtures found:
  - `code-to-screen`
  - `focusflow-pitch`
  - `world-in-numbers`
- Backlot CLI help loads.
- Provider summary shows:
  - FFmpeg: available
  - Remotion: available
  - Piper TTS: available
  - HyperFrames: registry reports unavailable because npm package resolve times out inside the OpenMontage runtime check.
- `npx hyperframes doctor` reports:
  - HyperFrames `0.7.31`
  - Node.js OK
  - FFmpeg/FFprobe OK
  - Chrome OK after `npx hyperframes browser ensure`
  - Docker missing
  - optional `whisper-cpp`, Kokoro TTS, and MusicGen missing
- Official zero-key Remotion demo render succeeded:
  - `vendor/OpenMontage/projects/demos/renders/code-to-screen.mp4`
  - H.264 video, AAC audio
  - 1920x1080
  - duration `25.045333`
  - size `3675640` bytes

## Troubleshooting

### PowerShell blocks `npm`

Use `npm.cmd` and `npx.cmd` on Windows. Direct `npm` can fail because `npm.ps1` is blocked by execution policy.

### `py -3` is not available

Use `python` if it points to Python 3.10+:

```powershell
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
```

### Ponytail full test fails on `python3`

The Hermes test helper calls `python3` directly. On this machine, `python3` is not on PATH. Use the narrower smoke tests listed above unless a `python3` shim or launcher is installed.

### Ponytail CSV correctness fails

Install pandas:

```powershell
python -m pip install pandas
```

### OpenMontage Remotion render downloads Chrome

The first Remotion render downloads Chrome Headless Shell. If sandboxed network blocks it, rerun the render with network access.

### HyperFrames registry mismatch

`npx hyperframes doctor` passes the core local checks after browser install, but OpenMontage's registry still reports HyperFrames unavailable because its npm package resolve check times out after 5 seconds. Treat Remotion as the verified composition runtime until that runtime check is adjusted or consistently resolves faster.

### Docker missing

`npx hyperframes doctor` reports Docker missing. Docker was not installed because OpenMontage README prerequisites do not list Docker for the base setup, and Docker Desktop usually requires a separate admin/system install.

### GPU/CUDA unavailable

`nvidia-smi` is not found. Do not enable `VIDEO_GEN_LOCAL_ENABLED=true` until an NVIDIA GPU, CUDA, and the official GPU dependencies are installed.
