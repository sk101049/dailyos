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
import { readRenderQueue, writeRenderQueue, type RenderJob } from "@/lib/render-queue";

type ScriptAsset = {
  id: string;
  title: string;
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

type BrandAsset = {
  id: string;
  name: string;
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

type ProviderStatus = {
  id: string;
  label: string;
  installed: boolean;
  configured: boolean;
  available: boolean;
  capabilities: Record<string, boolean>;
  envVars: string[];
  missingEnvVars: string[];
  manualWorkflow: boolean;
  connectionTest: {
    status: string;
    message: string;
  };
};

const SCRIPT_KEY = "dailyos-script-library";
const CHARACTER_KEY = "dailyos-character-library";
const VOICE_KEY = "dailyos-voice-library";
const STORYBOARD_KEY = "dailyos-storyboard-v2";
const PACKAGE_KEY = "dailyos-video-packages";
const BRAND_KEY = "dailyos-brand-library";

const providerValueById: Record<string, string> = {
  gemini: "Gemini",
  openmontage: "OpenMontage",
  runway: "Runway",
  kling: "Kling",
  pika: "Pika",
  hailuo: "Hailuo"
};

const capabilityLabels: Record<string, string> = {
  textToVideo: "文生影片",
  imageToVideo: "圖生影片",
  multiImageCharacter: "多圖片一致人物",
  longVideo: "長影片",
  voiceover: "配音",
  subtitles: "字幕",
  localRender: "本機生成",
  cloudRender: "雲端生成"
};

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
    "# Gemini / Veo Prompt Package",
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
    "## Full Prompt",
    "請生成一支繁體中文直式短影音，語氣溫暖、清楚、可信任。",
    settings.characterReferenceNotes ? `人物一致性：${settings.characterReferenceNotes}` : "",
    settings.voiceAudioDirection ? `配音方向：${settings.voiceAudioDirection}` : "",
    settings.subtitleDirection ? `字幕方向：${settings.subtitleDirection}` : "",
    "",
    ...item.storyboard.map((scene) =>
      [
        `### ${scene.shot}`,
        `畫面：${scene.visual}`,
        `旁白：${scene.narration}`,
        `字幕：${scene.subtitle}`,
        `圖片提示：${scene.imagePrompt ?? ""}`,
        `影片提示：${scene.videoPrompt ?? ""}`
      ].join("\n")
    ),
    "",
    "## 結果紀錄",
    settings.outputNotes || "在這裡貼上 Gemini / AI Studio 輸出 URL 或本機檔案路徑。"
  ].filter(Boolean).join("\n");
}

function openMontageProps(item: ProductionPackage) {
  return {
    title: item.title,
    provider: item.provider,
    format: item.config.format,
    outputPath: `exports/${item.title.replace(/\s+/g, "-").toLowerCase()}.mp4`,
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

function renderCommandMarkdown(item: ProductionPackage) {
  if (item.provider === "OpenMontage") {
    return [
      "# Render Command",
      "",
      "## OpenMontage",
      "先匯出 `openmontage-props.json`，再依目前安裝版本手動渲染。",
      "",
      "```powershell",
      "python vendor\\OpenMontage\\render_demo.py openmontage-props.json",
      "```",
      "",
      `Output path: ${openMontageProps(item).outputPath}`
    ].join("\n");
  }

  return [
    "# Render Command",
    "",
    "## Gemini / Veo",
    "1. 匯出 `gemini-prompt-package.md`。",
    "2. 開啟 Gemini 或 Google AI Studio。",
    "3. 貼上 prompt 並手動生成。",
    "4. 下載 MP4 後回素材庫匯入。"
  ].join("\n");
}

export function VideoPage() {
  const [scripts, setScripts] = useState<ScriptAsset[]>([]);
  const [characters, setCharacters] = useState<CharacterAsset[]>([]);
  const [voices, setVoices] = useState<VoiceAsset[]>([]);
  const [storyboard, setStoryboard] = useState<StoryboardScene[]>([]);
  const [brands, setBrands] = useState<BrandAsset[]>([]);
  const [packages, setPackages] = useState<ProductionPackage[]>([]);
  const [providerStatuses, setProviderStatuses] = useState<ProviderStatus[]>([]);
  const [scriptId, setScriptId] = useState("");
  const [characterId, setCharacterId] = useState("");
  const [voiceId, setVoiceId] = useState("");
  const [provider, setProvider] = useState("Gemini");
  const [message, setMessage] = useState<string | null>(null);
  const [geminiSettings, setGeminiSettings] = useState<GeminiSettings>({
    aspectRatio: "9:16",
    targetDuration: "30 秒",
    visualStyle: "明亮、溫暖、可信任的保險教育短影音",
    characterReferenceNotes: "",
    voiceAudioDirection: "",
    subtitleDirection: "繁體中文字幕，字大、清楚、對比強",
    outputNotes: ""
  });

  useEffect(() => {
    const loadedScripts = readArray<ScriptAsset>(SCRIPT_KEY);
    const loadedCharacters = readArray<CharacterAsset>(CHARACTER_KEY);
    const loadedVoices = readArray<VoiceAsset>(VOICE_KEY);

    setScripts(loadedScripts);
    setCharacters(loadedCharacters);
    setVoices(loadedVoices);
    setStoryboard(readArray<StoryboardScene>(STORYBOARD_KEY));
    setBrands(readArray<BrandAsset>(BRAND_KEY));
    setPackages(readArray<ProductionPackage>(PACKAGE_KEY));
    setScriptId(loadedScripts[0]?.id ?? "");
    setCharacterId(loadedCharacters[0]?.id ?? "");
    setVoiceId(loadedVoices[0]?.id ?? "");
    void loadProviderStatuses();
  }, []);

  const productionPackage = useMemo<ProductionPackage>(() => {
    const character = findById(characters, characterId);
    const voice = findById(voices, voiceId);

    return {
      id: crypto.randomUUID(),
      title: findById(scripts, scriptId)?.title ?? "DailyOS Video Production Package",
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
        format: `直式短影音，${geminiSettings.aspectRatio}`,
        renderTarget: provider === "OpenMontage" ? "本機 OpenMontage 手動渲染" : "Gemini / Veo 雲端手動生成",
        status: "待檢查",
        integrations: [`${provider} metadata`, "本機資料", "不啟動背景工作"]
      },
      gemini: provider === "Gemini" ? geminiSettings : undefined
    };
  }, [characterId, characters, geminiSettings, provider, scriptId, scripts, storyboard, voiceId, voices]);

  const geminiPackage = useMemo(
    () => geminiPromptPackage(productionPackage, geminiSettings),
    [geminiSettings, productionPackage]
  );
  const providerOptions = providerStatuses.length
    ? providerStatuses.map((item) => ({
        ...item,
        value: providerValueById[item.id] ?? item.label
      }))
    : [
        { id: "gemini", label: "Gemini / Veo", value: "Gemini" },
        { id: "openmontage", label: "OpenMontage", value: "OpenMontage" }
      ];
  const selectedStatus = providerOptions.find((item) => item.value === provider) as ProviderStatus | undefined;
  const requiredSteps = [
    productionPackage.script ? null : "請先選擇腳本",
    productionPackage.character ? null : "請先選擇人物模板",
    productionPackage.voice ? null : "請先選擇配音",
    productionPackage.storyboard.length ? null : "請先建立分鏡"
  ].filter((item): item is string => Boolean(item));

  async function loadProviderStatuses() {
    try {
      const response = await fetch("/api/video-providers");
      const payload = (await response.json()) as { providers?: ProviderStatus[] };
      setProviderStatuses(Array.isArray(payload.providers) ? payload.providers : []);
    } catch {
      setProviderStatuses([]);
    }
  }

  function savePackage() {
    const next = [productionPackage, ...packages];
    setPackages(next);
    window.localStorage.setItem(PACKAGE_KEY, JSON.stringify(next));
    setMessage("製作包已儲存。");
  }

  function createRenderJob() {
    const now = new Date().toISOString();
    const props = openMontageProps(productionPackage);
    const command = renderCommandMarkdown(productionPackage);
    const job: RenderJob = {
      id: crypto.randomUUID(),
      project: productionPackage.title,
      title: productionPackage.script?.title ?? productionPackage.title,
      provider,
      createdAt: now,
      updatedAt: now,
      status: "等待中",
      prompt: provider === "Gemini" ? geminiPackage : command,
      productionPackage,
      character: productionPackage.character,
      brand: brands[0] ?? null,
      voice: productionPackage.voice,
      request: provider === "OpenMontage"
        ? {
            provider,
            project: productionPackage.title,
            props,
            renderCommand: command,
            outputPath: props.outputPath
          }
        : {
            provider,
            aspectRatio: geminiSettings.aspectRatio,
            targetDuration: geminiSettings.targetDuration,
            renderTarget: productionPackage.config.renderTarget
          },
      response: null,
      error: "",
      statusHistory: [
        {
          status: "等待中",
          at: now,
          note: provider === "OpenMontage"
            ? "已建立 OpenMontage 手動渲染工作。"
            : "已建立 Gemini / Veo 生成工作。"
        }
      ]
    };

    writeRenderQueue([job, ...readRenderQueue()]);
    setMessage("已建立 Render Job，請到生成佇列繼續處理。");
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
      <section className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-primary">影片工作室</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-normal">多服務影片製作</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              選擇腳本、人物、配音、分鏡與影片生成服務，建立同一套 Render Queue 工作。
            </p>
          </div>
          <Badge variant="secondary" className="w-fit">服務測試版</Badge>
        </div>

        <Card id="export" className="scroll-mt-24">
          <CardHeader>
            <CardTitle>製作包</CardTitle>
            <CardDescription>所有資料都保存在瀏覽器 LocalStorage，不會自動呼叫影片 API。</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {message ? (
              <p className="rounded-md border bg-background px-3 py-2 text-sm text-muted-foreground">{message}</p>
            ) : null}
            {requiredSteps.length > 0 ? (
              <div className="rounded-md border bg-secondary/30 p-3 text-sm text-muted-foreground">
                <p className="font-medium text-foreground">下一步</p>
                <ul className="mt-2 list-disc space-y-1 pl-5">
                  {requiredSteps.map((step) => <li key={step}>{step}</li>)}
                </ul>
              </div>
            ) : null}
            <div className="grid gap-4 md:grid-cols-2">
              <SelectField label="腳本" value={scriptId} placeholder="選擇腳本" options={scripts.map((item) => ({ label: item.title, value: item.id }))} onChange={setScriptId} />
              <SelectField label="人物模板" value={characterId} placeholder="選擇人物模板" options={characters.map((item) => ({ label: item.name, value: item.id }))} onChange={setCharacterId} />
              <SelectField label="配音" value={voiceId} placeholder="選擇配音" options={voices.map((item) => ({ label: item.name, value: item.id }))} onChange={setVoiceId} />
              <div className="rounded-md border bg-background p-3 text-sm">
                <p className="font-medium">分鏡</p>
                <p className="mt-1 text-muted-foreground">{storyboard.length ? `${storyboard.length} 個場次可用` : "尚未建立分鏡"}</p>
              </div>
            </div>
            <ProviderPicker
              value={provider}
              providers={providerOptions}
              onChange={setProvider}
            />
            <div className="grid gap-4 md:grid-cols-2">
              <TextField label="影片比例" value={geminiSettings.aspectRatio} onChange={(value) => setGeminiSettings((current) => ({ ...current, aspectRatio: value }))} />
              <TextField label="影片長度" value={geminiSettings.targetDuration} onChange={(value) => setGeminiSettings((current) => ({ ...current, targetDuration: value }))} />
              <TextField label="影片風格" value={geminiSettings.visualStyle} onChange={(value) => setGeminiSettings((current) => ({ ...current, visualStyle: value }))} />
              <TextField label="字幕樣式" value={geminiSettings.subtitleDirection} onChange={(value) => setGeminiSettings((current) => ({ ...current, subtitleDirection: value }))} />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button onClick={savePackage}>儲存製作包</Button>
              <Button onClick={createRenderJob} disabled={requiredSteps.length > 0}>開始生成影片</Button>
              <ExportButton name="production-package.json" content={JSON.stringify(productionPackage, null, 2)} type="application/json" />
              <ExportButton name="project-manifest.json" content={JSON.stringify(projectManifest(productionPackage), null, 2)} type="application/json" />
              {provider === "OpenMontage" ? (
                <ExportButton name="openmontage-props.json" content={JSON.stringify(openMontageProps(productionPackage), null, 2)} type="application/json" />
              ) : (
                <ExportButton name="gemini-prompt-package.md" content={geminiPackage} type="text/markdown" />
              )}
              <ExportButton name="render-command.md" content={renderCommandMarkdown(productionPackage)} type="text/markdown" />
            </div>
          </CardContent>
        </Card>

        <Card id="providers" className="scroll-mt-24">
          <CardHeader>
            <div className="flex items-start justify-between gap-3">
              <div>
                <CardTitle>服務狀態與能力</CardTitle>
                <CardDescription>同一個流程可混用 Gemini / Veo 與 OpenMontage，其他服務先預留。</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={loadProviderStatuses}>重新檢查</Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {providerStatuses.map((item) => (
              <ProviderCard key={item.id} provider={item} />
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{provider === "OpenMontage" ? "OpenMontage 預覽" : "Gemini / Veo Prompt 預覽"}</CardTitle>
            <CardDescription>建立 Render Job 後，這些資料會被保存到生成佇列。</CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="max-h-[520px] overflow-auto whitespace-pre-wrap break-words rounded-md bg-secondary/40 p-3 text-sm leading-6 text-muted-foreground">
              {provider === "OpenMontage" ? JSON.stringify(openMontageProps(productionPackage), null, 2) : geminiPackage}
            </pre>
          </CardContent>
        </Card>
      </section>

      <aside className="space-y-4">
        <Card className="xl:sticky xl:top-24">
          <CardHeader>
            <CardTitle>專案摘要</CardTitle>
            <CardDescription>{packages.length} 個本機製作包</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <SummaryRow label="影片服務" value={selectedStatus?.label ?? provider} />
            <SummaryRow label="可用狀態" value={selectedStatus?.available ? "可用" : "尚未設定"} />
            <SummaryRow label="腳本" value={productionPackage.script?.title ?? "未選擇"} />
            <SummaryRow label="人物" value={productionPackage.character?.name ?? "未選擇"} />
            <SummaryRow label="配音" value={productionPackage.voice?.name ?? "未選擇"} />
            <SummaryRow label="分鏡" value={`${storyboard.length} 場`} />
            <div className="rounded-md border bg-secondary/30 p-3 text-sm text-muted-foreground">
              {provider === "OpenMontage"
                ? "OpenMontage 工作會保存 props、render command 與 output path。"
                : "Gemini / Veo 工作會保存 prompt，後續到生成佇列送出。"}
            </div>
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}

function ProviderPicker({
  value,
  providers,
  onChange
}: {
  value: string;
  providers: Array<Partial<ProviderStatus> & { id: string; label: string; value: string }>;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-3">
      <p className="text-sm font-medium">影片生成服務</p>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {providers.map((item) => (
          <label key={item.id} className="flex cursor-pointer gap-3 rounded-md border bg-background p-3 text-sm">
            <input
              type="radio"
              name="video-provider"
              value={item.value}
              checked={value === item.value}
              onChange={() => onChange(item.value)}
            />
            <span>
              <span className="block font-medium">{item.label}</span>
              <span className="mt-1 block text-muted-foreground">
                {item.available ? "可用" : item.installed ? "已安裝，待設定" : "尚未設定"}
              </span>
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}

function ProviderCard({ provider }: { provider: ProviderStatus }) {
  return (
    <div className="rounded-md border bg-background p-3 text-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-medium">{provider.label}</p>
          <p className="mt-1 text-muted-foreground">{provider.connectionTest.message}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant={provider.installed ? "default" : "outline"}>{provider.installed ? "已安裝" : "未安裝"}</Badge>
          <Badge variant={provider.configured ? "default" : "outline"}>{provider.configured ? "API 已設定" : "API 尚未設定"}</Badge>
          <Badge variant={provider.available ? "default" : "outline"}>{provider.available ? "可用" : "尚未可用"}</Badge>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {Object.entries(provider.capabilities).map(([key, enabled]) => (
          <Badge key={key} variant={enabled ? "secondary" : "outline"}>
            {enabled ? "✓" : "－"} {capabilityLabels[key] ?? key}
          </Badge>
        ))}
      </div>
    </div>
  );
}

function ExportButton({ name, content, type }: { name: string; content: string; type: string }) {
  return (
    <Button variant="outline" onClick={() => downloadText(name, content, type)}>
      匯出 {name}
    </Button>
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
          <option key={option.value} value={option.value}>{option.label}</option>
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

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-md border bg-background p-3 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="max-w-44 text-right font-medium">{value}</span>
    </div>
  );
}
