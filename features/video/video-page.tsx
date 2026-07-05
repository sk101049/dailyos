"use client";

import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";

type ScriptAsset = {
  id: string;
  title: string;
  topic?: string;
  script: string;
};

type CharacterAsset = {
  id: string;
  name: string;
  hairstyle?: string;
  hairColor?: string;
  outfit?: string;
  brandAttributes?: string;
};

type VoiceAsset = {
  id: string;
  name: string;
  speakingStyle?: string;
  tone?: string;
  speed?: string;
  pauseLevel?: string;
  emotionalWarmth?: string;
};

type StoryboardScene = {
  id: string;
  shot: string;
  visual: string;
  narration: string;
  subtitle: string;
  characterProfileId?: string;
  voiceProfileId?: string;
  imagePrompt?: string;
  videoPrompt?: string;
};

type ProductionPackage = {
  id: string;
  title: string;
  createdAt: string;
  provider: string;
  script: ScriptAsset | null;
  character: CharacterAsset | null;
  voice: VoiceAsset | null;
  storyboard: StoryboardScene[];
  config: {
    format: string;
    renderTarget: string;
    status: string;
    integrations: string[];
  };
  gemini?: GeminiSettings;
};

type GeminiSettings = {
  aspectRatio: string;
  targetDuration: string;
  visualStyle: string;
  characterReferenceNotes: string;
  voiceAudioDirection: string;
  subtitleDirection: string;
  outputNotes: string;
};

type ProviderStatus = {
  id: string;
  label: string;
  installed: boolean;
  configured: boolean;
  envVars: string[];
  missingEnvVars: string[];
  manualWorkflow: boolean;
  connectionTest: {
    status: string;
    message: string;
  };
};

type GeminiVideoApiStatus = {
  enabled: boolean;
  configured: boolean;
  model: string;
  envVars: string[];
};

type GeminiRenderAttempt = {
  id: string;
  createdAt: string;
  provider: "Gemini";
  request: {
    aspectRatio: string;
    durationSeconds: string;
    resolution: string;
  };
  ok: boolean;
  status: string;
  message: string;
  response: unknown;
};

const SCRIPT_KEY = "dailyos-script-library";
const CHARACTER_KEY = "dailyos-character-library";
const VOICE_KEY = "dailyos-voice-library";
const STORYBOARD_KEY = "dailyos-storyboard-v2";
const PACKAGE_KEY = "dailyos-video-packages";
const GEMINI_RENDER_ATTEMPT_KEY = "dailyos-gemini-render-attempt";
const GEMINI_URL = "https://gemini.google.com";
const AI_STUDIO_URL = "https://aistudio.google.com";

function readArray<T>(key: string): T[] {
  try {
    const saved = window.localStorage.getItem(key);
    const parsed = saved ? (JSON.parse(saved) as T[]) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function findById<T extends { id: string }>(items: T[], id: string) {
  return items.find((item) => item.id === id) ?? null;
}

function downloadText(fileName: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}

function geminiPromptPackage(item: ProductionPackage, settings: GeminiSettings) {
  return [
    "# Gemini / Veo Video Prompt Package",
    "",
    `Provider: ${item.provider}`,
    `Aspect ratio: ${settings.aspectRatio}`,
    `Target duration: ${settings.targetDuration}`,
    `Visual style: ${settings.visualStyle}`,
    "",
    "## Project",
    `Script: ${item.script?.title ?? "未選擇"}`,
    `Character: ${item.character?.name ?? "未選擇"}`,
    `Voice: ${item.voice?.name ?? "未選擇"}`,
    "",
    "## Character Reference Notes",
    settings.characterReferenceNotes ||
      [
        item.character?.name,
        item.character?.hairstyle,
        item.character?.hairColor,
        item.character?.outfit,
        item.character?.brandAttributes
      ].filter(Boolean).join("; ") ||
      "Keep character identity consistent across all scenes.",
    "",
    "## Voice / Audio Direction",
    settings.voiceAudioDirection ||
      [
        item.voice?.name,
        item.voice?.speakingStyle,
        item.voice?.tone,
        item.voice?.speed,
        item.voice?.pauseLevel,
        item.voice?.emotionalWarmth
      ].filter(Boolean).join("; ") ||
      "Natural Traditional Chinese narration, warm and clear.",
    "",
    "## Subtitle Direction",
    settings.subtitleDirection,
    "",
    "## Full Prompt",
    "Generate a vertical Traditional Chinese insurance education short video.",
    "Maintain the same presenter identity, outfit, hair, tone, and visual style in every scene.",
    "Use clear camera movement, natural gestures, readable subtitles, and warm professional pacing.",
    "",
    ...item.storyboard.map((scene) =>
      [
        `### Scene ${scene.shot}`,
        `Visual: ${scene.visual}`,
        `Voiceover: ${scene.narration}`,
        `Subtitle: ${scene.subtitle}`,
        `Image prompt: ${scene.imagePrompt ?? ""}`,
        `Video prompt: ${scene.videoPrompt ?? ""}`
      ].join("\n")
    ),
    "",
    "## Manual Result Tracking",
    settings.outputNotes || "Paste Gemini / AI Studio output URL or local file path here."
  ].join("\n");
}

function projectManifest(item: ProductionPackage) {
  return {
    name: item.title,
    createdAt: item.createdAt,
    provider: item.provider,
    format: item.config.format,
    renderTarget: item.config.renderTarget,
    status: item.config.status,
    assets: {
      scriptId: item.script?.id ?? null,
      characterId: item.character?.id ?? null,
      voiceId: item.voice?.id ?? null,
      storyboardSceneIds: item.storyboard.map((scene) => scene.id)
    },
    sceneCount: item.storyboard.length,
    integrations: item.config.integrations
  };
}

function openMontageProps(item: ProductionPackage) {
  return {
    title: item.title,
    provider: item.provider,
    format: item.config.format,
    script: item.script,
    character: item.character,
    voice: item.voice,
    scenes: item.storyboard.map((scene, index) => ({
      id: scene.id,
      order: index + 1,
      shot: scene.shot,
      visual: scene.visual,
      voiceover: scene.narration,
      subtitle: scene.subtitle,
      imagePrompt: scene.imagePrompt ?? "",
      videoPrompt: scene.videoPrompt ?? ""
    }))
  };
}

function renderCommandMarkdown(item: ProductionPackage) {
  const providerInstructions =
    item.provider === "OpenMontage"
      ? [
          "## OpenMontage",
          "Review `openmontage-props.json`, adapt it to the local OpenMontage project, then render manually.",
          "",
          "```powershell",
          "python vendor\\OpenMontage\\render_demo.py <project-name>",
          "```"
        ]
      : [
          "## Gemini",
          "1. Export `gemini-prompt-package.md`.",
          "2. Open Gemini or Google AI Studio.",
          "3. Paste the prompts scene by scene.",
          "4. Save the generated output URL or local path back in Video Studio."
        ];

  return [
    "# Render Command",
    "",
    `Provider: ${item.provider}`,
    `Render target: ${item.config.renderTarget}`,
    "",
    "Manual workflow only. DailyOS does not call APIs, start workers, or render automatically.",
    "",
    ...providerInstructions
  ].join("\n");
}

export function VideoPage() {
  const [scripts, setScripts] = useState<ScriptAsset[]>([]);
  const [characters, setCharacters] = useState<CharacterAsset[]>([]);
  const [voices, setVoices] = useState<VoiceAsset[]>([]);
  const [storyboard, setStoryboard] = useState<StoryboardScene[]>([]);
  const [scriptId, setScriptId] = useState("");
  const [characterId, setCharacterId] = useState("");
  const [voiceId, setVoiceId] = useState("");
  const [provider, setProvider] = useState("Gemini");
  const [geminiSettings, setGeminiSettings] = useState<GeminiSettings>({
    aspectRatio: "9:16",
    targetDuration: "30 seconds",
    visualStyle: "Warm, bright, trustworthy insurance education short",
    characterReferenceNotes: "",
    voiceAudioDirection: "",
    subtitleDirection: "Traditional Chinese subtitles, large readable text, high contrast",
    outputNotes: ""
  });
  const [message, setMessage] = useState<string | null>(null);
  const [packages, setPackages] = useState<ProductionPackage[]>([]);
  const [providerStatuses, setProviderStatuses] = useState<ProviderStatus[]>([]);
  const [geminiVideoApi, setGeminiVideoApi] = useState<GeminiVideoApiStatus | null>(null);
  const [geminiRenderAttempt, setGeminiRenderAttempt] = useState<GeminiRenderAttempt | null>(null);
  const [isSubmittingGemini, setIsSubmittingGemini] = useState(false);

  useEffect(() => {
    const loadedScripts = readArray<ScriptAsset>(SCRIPT_KEY);
    const loadedCharacters = readArray<CharacterAsset>(CHARACTER_KEY);
    const loadedVoices = readArray<VoiceAsset>(VOICE_KEY);
    const loadedStoryboard = readArray<StoryboardScene>(STORYBOARD_KEY);
    const loadedPackages = readArray<ProductionPackage>(PACKAGE_KEY);

    setScripts(loadedScripts);
    setCharacters(loadedCharacters);
    setVoices(loadedVoices);
    setStoryboard(loadedStoryboard);
    setPackages(loadedPackages);
    setScriptId(loadedScripts[0]?.id ?? "");
    setCharacterId(loadedCharacters[0]?.id ?? "");
    setVoiceId(loadedVoices[0]?.id ?? "");
    const savedAttempt = window.localStorage.getItem(GEMINI_RENDER_ATTEMPT_KEY);
    if (savedAttempt) {
      try {
        setGeminiRenderAttempt(JSON.parse(savedAttempt) as GeminiRenderAttempt);
      } catch {
        window.localStorage.removeItem(GEMINI_RENDER_ATTEMPT_KEY);
      }
    }
  }, []);

  useEffect(() => {
    void loadProviderStatuses();
    void loadGeminiVideoApiStatus();
  }, []);

  const productionPackage = useMemo<ProductionPackage>(() => {
    const character = findById(characters, characterId);
    const voice = findById(voices, voiceId);

    return {
      id: crypto.randomUUID(),
      title: "DailyOS Video Production Package",
      createdAt: new Date().toISOString(),
      provider,
      script: findById(scripts, scriptId),
      character,
      voice,
      storyboard: storyboard.map((scene) => ({
        ...scene,
        characterProfileId: scene.characterProfileId || character?.id,
        voiceProfileId: scene.voiceProfileId || voice?.id
      })),
      config: {
        format: `Vertical short video, ${geminiSettings.aspectRatio}`,
        renderTarget: provider === "Gemini" ? "Manual Gemini / Google AI Studio handoff" : "Manual OpenMontage handoff",
        status: "Ready for review",
        integrations: [
          `${provider}-ready metadata`,
          "No API keys",
          "No automatic rendering"
        ]
      },
      gemini: provider === "Gemini" ? geminiSettings : undefined
    };
  }, [characterId, characters, geminiSettings, provider, scriptId, scripts, storyboard, voiceId, voices]);

  const geminiPackage = useMemo(
    () => geminiPromptPackage(productionPackage, geminiSettings),
    [geminiSettings, productionPackage]
  );
  const nextSteps = [
    productionPackage.script ? null : "到 Script Studio 儲存一支腳本。",
    productionPackage.character ? null : "到人物模板建立一個人物。",
    productionPackage.voice ? null : "到聲音工作室建立一個聲音。",
    productionPackage.storyboard.length ? null : "到分鏡工作區建立分鏡場次。"
  ].filter((step): step is string => Boolean(step));

  function savePackage() {
    const next = [productionPackage, ...packages];
    setPackages(next);
    window.localStorage.setItem(PACKAGE_KEY, JSON.stringify(next));
    setMessage("Production package assembled and saved locally.");
  }

  async function copyGeminiPrompt() {
    if (!navigator.clipboard?.writeText) {
      setMessage("剪貼簿不可用，請直接複製下方 Gemini prompt。");
      return;
    }

    await navigator.clipboard.writeText(geminiPackage);
    setMessage("Gemini prompt package 已複製。");
  }

  function updateGeminiSettings(key: keyof GeminiSettings, value: string) {
    setGeminiSettings((current) => ({ ...current, [key]: value }));
  }

  async function loadProviderStatuses() {
    try {
      const response = await fetch("/api/video-providers");
      const payload = (await response.json()) as { providers?: ProviderStatus[] };
      setProviderStatuses(Array.isArray(payload.providers) ? payload.providers : []);
    } catch {
      setProviderStatuses([]);
    }
  }

  async function loadGeminiVideoApiStatus() {
    try {
      const response = await fetch("/api/video-providers/gemini");
      const payload = (await response.json()) as { videoApi?: GeminiVideoApiStatus };
      setGeminiVideoApi(payload.videoApi ?? null);
    } catch {
      setGeminiVideoApi(null);
    }
  }

  async function submitGeminiRender() {
    setIsSubmittingGemini(true);

    try {
      const response = await fetch("/api/video-providers/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          geminiPromptPackage: geminiPackage,
          productionPackage,
          aspectRatio: geminiSettings.aspectRatio === "16:9" ? "16:9" : "9:16",
          durationSeconds: "8",
          resolution: "720p"
        })
      });
      const payload = await response.json().catch(() => null);
      const attempt: GeminiRenderAttempt = {
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        provider: "Gemini",
        request: {
          aspectRatio: geminiSettings.aspectRatio === "16:9" ? "16:9" : "9:16",
          durationSeconds: "8",
          resolution: "720p"
        },
        ok: response.ok,
        status: typeof payload?.status === "string" ? payload.status : response.ok ? "submitted" : "unknown_error",
        message:
          typeof payload?.message === "string"
            ? payload.message
            : response.ok
              ? "Gemini test generation submitted."
              : `Gemini test generation failed with HTTP ${response.status}.`,
        response: payload
      };

      setGeminiRenderAttempt(attempt);
      window.localStorage.setItem(GEMINI_RENDER_ATTEMPT_KEY, JSON.stringify(attempt));
      setMessage(attempt.ok ? "Gemini 測試生成已送出。" : `Gemini 測試生成未送出：${attempt.message}`);
      void loadGeminiVideoApiStatus();
    } catch (error) {
      const attempt: GeminiRenderAttempt = {
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        provider: "Gemini",
        request: {
          aspectRatio: geminiSettings.aspectRatio === "16:9" ? "16:9" : "9:16",
          durationSeconds: "8",
          resolution: "720p"
        },
        ok: false,
        status: "network_error",
        message: error instanceof Error ? error.message : "Unknown network error.",
        response: null
      };

      setGeminiRenderAttempt(attempt);
      window.localStorage.setItem(GEMINI_RENDER_ATTEMPT_KEY, JSON.stringify(attempt));
      setMessage(`Gemini 測試生成未送出：${attempt.message}`);
    } finally {
      setIsSubmittingGemini(false);
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
      <section className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-primary">影片工作室</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-normal">
              影片製作包
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              將腳本、人物、聲音與分鏡組成可匯出的製作包。這版只做手動 Gemini / Google AI Studio 工作流，不呼叫 API。
            </p>
          </div>
          <Badge variant="secondary" className="w-fit">
            本機儲存 MVP
          </Badge>
        </div>

        <Card id="export" className="scroll-mt-24">
          <CardHeader>
            <CardTitle>素材選擇</CardTitle>
            <CardDescription>
              重用腳本庫、人物模板、聲音與分鏡工作區的本機資料。
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {message ? (
              <p className="rounded-md border bg-background px-3 py-2 text-sm text-muted-foreground">
                {message}
              </p>
            ) : null}
            {nextSteps.length > 0 ? (
              <div className="rounded-md border bg-secondary/30 p-3 text-sm text-muted-foreground">
                <p className="font-medium text-foreground">下一步</p>
                <ul className="mt-2 list-disc space-y-1 pl-5">
                  {nextSteps.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ul>
              </div>
            ) : null}
            <div className="grid gap-4 md:grid-cols-2">
              <SelectField
                label="腳本"
                value={scriptId}
                placeholder="尚無已儲存腳本"
                options={scripts.map((item) => ({ label: item.title, value: item.id }))}
                onChange={setScriptId}
              />
              <SelectField
                label="人物"
                value={characterId}
                placeholder="尚無人物設定"
                options={characters.map((item) => ({ label: item.name, value: item.id }))}
                onChange={setCharacterId}
              />
              <SelectField
                label="聲音"
                value={voiceId}
                placeholder="尚無聲音設定"
                options={voices.map((item) => ({ label: item.name, value: item.id }))}
                onChange={setVoiceId}
              />
              <label className="space-y-2">
                <span className="text-sm font-medium">分鏡</span>
                <select
                  className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={storyboard.length ? "current" : ""}
                  disabled
                >
                  <option value={storyboard.length ? "current" : ""}>
                    {storyboard.length ? `目前分鏡（${storyboard.length} 場）` : "尚無分鏡場次"}
                  </option>
                </select>
              </label>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button onClick={savePackage}>產生製作包</Button>
              <Button
                variant="outline"
                onClick={() =>
                  downloadText(
                    "production-package.json",
                    JSON.stringify(productionPackage, null, 2),
                    "application/json"
                  )
                }
              >
                匯出 production-package.json
              </Button>
              <Button
                variant="outline"
                onClick={() =>
                  downloadText(
                    "project-manifest.json",
                    JSON.stringify(projectManifest(productionPackage), null, 2),
                    "application/json"
                  )
                }
              >
                匯出 project-manifest.json
              </Button>
              {provider === "OpenMontage" ? (
                <Button
                  variant="outline"
                  onClick={() =>
                    downloadText(
                      "openmontage-props.json",
                      JSON.stringify(openMontageProps(productionPackage), null, 2),
                      "application/json"
                    )
                  }
                >
                  匯出 openmontage-props.json
                </Button>
              ) : null}
              {provider === "Gemini" ? (
                <Button
                  variant="outline"
                  onClick={() =>
                    downloadText(
                      "gemini-prompt-package.md",
                      geminiPackage,
                      "text/markdown"
                    )
                  }
                >
                  匯出 gemini-prompt-package.md
                </Button>
              ) : null}
              <Button
                variant="outline"
                onClick={() =>
                  downloadText(
                    "render-command.md",
                    renderCommandMarkdown(productionPackage),
                    "text/markdown"
                  )
                }
              >
                匯出 render-command.md
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card id="gemini-render" className="scroll-mt-24">
          <CardHeader>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <CardTitle>Gemini / Google AI Studio 工作流</CardTitle>
                <CardDescription>
                  選擇 Gemini provider，產生可貼到 Gemini 或 AI Studio 的 Veo-style prompt。
                </CardDescription>
              </div>
              <Badge variant="outline">手動工作流</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <SelectField
                label="影片 provider"
                value={provider}
                placeholder="選擇 provider"
                options={[
                  { label: "Gemini", value: "Gemini" },
                  { label: "OpenMontage", value: "OpenMontage" }
                ]}
                onChange={setProvider}
              />
              <SelectField
                label="畫面比例"
                value={geminiSettings.aspectRatio}
                placeholder="選擇比例"
                options={[
                  { label: "9:16", value: "9:16" },
                  { label: "16:9", value: "16:9" },
                  { label: "1:1", value: "1:1" }
                ]}
                onChange={(value) => updateGeminiSettings("aspectRatio", value)}
              />
              <TextField
                label="目標長度"
                value={geminiSettings.targetDuration}
                onChange={(value) => updateGeminiSettings("targetDuration", value)}
              />
              <TextField
                label="視覺風格"
                value={geminiSettings.visualStyle}
                onChange={(value) => updateGeminiSettings("visualStyle", value)}
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <TextArea
                label="人物參考說明"
                value={geminiSettings.characterReferenceNotes}
                placeholder="留白時會使用人物模板資料。"
                onChange={(value) => updateGeminiSettings("characterReferenceNotes", value)}
              />
              <TextArea
                label="聲音 / 音訊方向"
                value={geminiSettings.voiceAudioDirection}
                placeholder="留白時會使用聲音工作室資料。"
                onChange={(value) => updateGeminiSettings("voiceAudioDirection", value)}
              />
              <TextArea
                label="字幕方向"
                value={geminiSettings.subtitleDirection}
                onChange={(value) => updateGeminiSettings("subtitleDirection", value)}
              />
              <TextArea
                label="手動結果追蹤"
                value={geminiSettings.outputNotes}
                placeholder="貼上 Gemini / AI Studio 輸出 URL 或本機檔案路徑。"
                onChange={(value) => updateGeminiSettings("outputNotes", value)}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button onClick={copyGeminiPrompt}>複製 Gemini prompt</Button>
              <Button variant="outline" onClick={() => window.open(GEMINI_URL, "_blank", "noopener,noreferrer")}>
                開啟 Gemini
              </Button>
              <Button variant="outline" onClick={() => window.open(AI_STUDIO_URL, "_blank", "noopener,noreferrer")}>
                開啟 Google AI Studio
              </Button>
              <Button
                variant="outline"
                onClick={() =>
                  downloadText(
                    "gemini-prompt-package.md",
                    geminiPackage,
                    "text/markdown"
                  )
                }
              >
                匯出 gemini-prompt-package.md
              </Button>
            </div>
            <pre className="max-h-[520px] overflow-auto whitespace-pre-wrap break-words rounded-md bg-secondary/40 p-3 text-sm leading-6 text-muted-foreground">
              {geminiPackage}
            </pre>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <CardTitle>Gemini 測試生成</CardTitle>
                <CardDescription>
                  使用伺服器端 Gemini provider spike 送出目前提示詞包。API key 不會暴露到前端。
                </CardDescription>
              </div>
              <Badge variant="outline">功能旗標</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 md:grid-cols-3">
              <SummaryRow
                label="API key"
                value={geminiVideoApi?.configured ? "已設定" : "未設定"}
              />
              <SummaryRow
                label="功能旗標"
                value={geminiVideoApi?.enabled ? "已啟用" : "未啟用"}
              />
              <SummaryRow label="手動流程" value="可用" />
            </div>
            {geminiVideoApi?.configured && geminiVideoApi.enabled ? null : (
              <p className="rounded-md border bg-secondary/30 p-3 text-sm text-muted-foreground">
                阻擋原因：{geminiVideoApi?.configured ? "" : "缺少伺服器端 Gemini API key。"}
                {geminiVideoApi?.enabled ? "" : " GEMINI_VIDEO_API_ENABLED 尚未設為 true。"}
                手動 Gemini workflow 仍可使用。
              </p>
            )}
            <div className="flex flex-wrap gap-2">
              <Button onClick={submitGeminiRender} disabled={isSubmittingGemini || provider !== "Gemini"}>
                {isSubmittingGemini ? "送出中..." : "送出 Gemini 測試生成"}
              </Button>
              <Button variant="outline" onClick={loadGeminiVideoApiStatus}>
                重新檢查 Gemini API
              </Button>
            </div>
            {geminiRenderAttempt ? (
              <div className="space-y-3">
                <div className="grid gap-3 md:grid-cols-3">
                  <SummaryRow label="最後狀態" value={geminiRenderAttempt.status} />
                  <SummaryRow label="結果" value={geminiRenderAttempt.ok ? "成功" : "阻擋或錯誤"} />
                  <SummaryRow label="建立時間" value={geminiRenderAttempt.createdAt} />
                </div>
                <p className="rounded-md border bg-background p-3 text-sm text-muted-foreground">
                  {geminiRenderAttempt.message}
                </p>
                <pre className="max-h-80 overflow-auto whitespace-pre-wrap break-words rounded-md bg-secondary/40 p-3 text-xs leading-5 text-muted-foreground">
                  {JSON.stringify(geminiRenderAttempt.response, null, 2)}
                </pre>
              </div>
            ) : (
              <p className="rounded-md border bg-background p-3 text-sm text-muted-foreground">
                尚未送出 Gemini render attempt。
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>專案設定預覽</CardTitle>
            <CardDescription>
              可重複使用的 provider handoff package，未包含 API key。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="max-h-[520px] overflow-auto whitespace-pre-wrap break-words rounded-md bg-secondary/40 p-3 text-sm leading-6 text-muted-foreground">
              {JSON.stringify(productionPackage, null, 2)}
            </pre>
          </CardContent>
        </Card>
      </section>

      <aside className="space-y-4">
        <Card className="xl:sticky xl:top-24">
          <CardHeader>
            <CardTitle>製作包摘要</CardTitle>
            <CardDescription>{packages.length} 個本機製作包</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <SummaryRow label="影片服務" value={provider} />
            <SummaryRow label="腳本" value={productionPackage.script?.title ?? "未選擇"} />
            <SummaryRow label="人物" value={productionPackage.character?.name ?? "未選擇"} />
            <SummaryRow label="聲音" value={productionPackage.voice?.name ?? "未選擇"} />
            <SummaryRow label="場次" value={String(productionPackage.storyboard.length)} />
            <SummaryRow label="Render" value="僅手動" />
            <div className="rounded-md border bg-secondary/30 p-3 text-sm text-muted-foreground">
              這版不使用 API key、不假設付費權限，也不自動 render。
            </div>
          </CardContent>
        </Card>

        <Card id="providers" className="scroll-mt-24">
          <CardHeader>
            <div className="flex items-start justify-between gap-3">
              <div>
                <CardTitle>影片服務狀態</CardTitle>
                <CardDescription>僅顯示伺服器端設定狀態</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={loadProviderStatuses}>
                重新檢查
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {providerStatuses.length === 0 ? (
              <p className="rounded-md border bg-background p-3 text-sm text-muted-foreground">
                尚未取得 provider 狀態。
              </p>
            ) : (
              providerStatuses.map((item) => (
                <div key={item.id} className="rounded-md border bg-background p-3 text-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium">{item.label}</p>
                      <p className="mt-1 text-muted-foreground">
                        {item.connectionTest.message}
                      </p>
                    </div>
                    <Badge variant={item.configured ? "default" : "outline"}>
                      {item.configured ? "已設定" : "未設定"}
                    </Badge>
                  </div>
                  <p className="mt-3 text-xs text-muted-foreground">
                    Env: {item.envVars.join(", ")}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Connection test: {item.connectionTest.status}
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}

function SelectField({
  label,
  value,
  options,
  placeholder,
  onChange
}: {
  label: string;
  value: string;
  options: Array<{ label: string; value: string }>;
  placeholder: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="space-y-2">
      <span className="text-sm font-medium">{label}</span>
      <select
        className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function TextField({
  label,
  value,
  onChange
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="space-y-2">
      <span className="text-sm font-medium">{label}</span>
      <input
        className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

function TextArea({
  label,
  value,
  placeholder,
  onChange
}: {
  label: string;
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="space-y-2">
      <span className="text-sm font-medium">{label}</span>
      <textarea
        className="min-h-28 w-full resize-y rounded-md border bg-background px-3 py-2 text-sm leading-6 outline-none focus-visible:ring-2 focus-visible:ring-ring"
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-md border bg-background p-3 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  );
}
