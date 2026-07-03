"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { messages } from "@/messages/zh-TW";

type ScriptGenerationForm = {
  topic: string;
  targetAudience: string;
  videoLength: string;
  tone: string;
  platform: string;
};

type ScriptPreviewKey = "title" | "hook" | "script" | "cta" | "hashtags" | "coverText";

type GeneratedScript = Record<ScriptPreviewKey, string>;

type ScriptApiResponse = {
  script?: GeneratedScript;
  error?: string;
};

type ScriptStatus = "草稿" | "已完成" | "已發布";

type SavedScript = GeneratedScript & {
  id: string;
  title: string;
  topic: string;
  targetAudience: string;
  status: ScriptStatus;
  createdAt: string;
  updatedAt: string;
};

const SCRIPT_LIBRARY_STORAGE_KEY = "dailyos-script-library";

const gptOutputHeadings: { key: ScriptPreviewKey; labels: string[] }[] = [
  { key: "title", labels: ["標題"] },
  { key: "hook", labels: ["開場吸引句"] },
  { key: "script", labels: ["腳本"] },
  { key: "cta", labels: ["行動呼籲"] },
  { key: "hashtags", labels: ["標籤"] },
  { key: "coverText", labels: ["封面文字"] }
];

const topics = [
  {
    title: "退休規劃",
    description: "把退休規劃問題轉成短影音教育內容。"
  },
  {
    title: "醫療保障",
    description: "用簡單語言說明醫療保障的基本概念。"
  },
  {
    title: "癌症保障",
    description: "準備更有同理心的癌症保障規劃內容。"
  },
  {
    title: "失能保障",
    description: "發想收入保護與復原規劃相關內容。"
  },
  {
    title: "長期照護",
    description: "協助家庭與照顧者理解長照需求。"
  },
  {
    title: "家庭保障",
    description: "幫助家庭理解風險、責任與下一步。"
  }
];

const workspaceSections = [
  {
    title: "標題",
    placeholder: "範例：購買醫療險前要問的 3 個問題"
  },
  {
    title: messages.contentStudio.hook,
    placeholder: "用常見的客戶擔心或迷思作為開場。"
  },
  {
    title: "腳本",
    placeholder: "整理 30-60 秒影片的主要教學重點。"
  },
  {
    title: messages.contentStudio.cta,
    placeholder: "邀請觀眾檢視保單或先準備想問的問題。"
  },
  {
    title: messages.contentStudio.hashtags,
    placeholder: "#保險 #退休規劃 #家庭保障"
  },
  {
    title: messages.contentStudio.coverText,
    placeholder: "讓觀眾一眼看懂的短封面文字。"
  }
];

const generatorControls = [
  {
    key: "topic",
    label: "保險主題",
    options: ["退休規劃", "醫療保障", "癌症保障", "失能保障", "長期照護", "家庭保障"]
  },
  {
    key: "targetAudience",
    label: messages.contentStudio.targetAudience,
    options: ["年輕家庭", "上班族", "企業主", "退休族"]
  },
  {
    key: "videoLength",
    label: messages.contentStudio.videoLength,
    options: ["30 秒", "60 秒", "90 秒"]
  },
  {
    key: "tone",
    label: messages.contentStudio.tone,
    options: ["教育型", "溫暖", "專業", "急迫"]
  },
  {
    key: "platform",
    label: messages.contentStudio.platform,
    options: ["YouTube Shorts", "TikTok", "Instagram Reels", "Facebook Reels"]
  }
] satisfies {
  key: keyof ScriptGenerationForm;
  label: string;
  options: string[];
}[];

const initialFormValues: ScriptGenerationForm = {
  topic: "退休規劃",
  targetAudience: "年輕家庭",
  videoLength: "60 秒",
  tone: "教育型",
  platform: "YouTube Shorts"
};

const initialGeneratedScript: GeneratedScript = {
  title: "如果收入中斷，你的家庭還能維持原本生活嗎？",
  hook: "多數家庭會規劃成長，卻忘了規劃中斷時怎麼辦。",
  script: "用這段示範腳本說明一個保障缺口、一個生活案例，以及一個簡單下一步。",
  cta: "在下一個重大家庭決定前，先檢視你目前的保障。",
  hashtags: "#保險 #家庭保障 #財務規劃",
  coverText: "守住家人依靠的收入。"
};

const previewLabels: { key: ScriptPreviewKey; title: string }[] = [
  { key: "title", title: "標題" },
  { key: "hook", title: messages.contentStudio.hook },
  { key: "script", title: "腳本" },
  { key: "cta", title: messages.contentStudio.cta },
  { key: "hashtags", title: messages.contentStudio.hashtags },
  { key: "coverText", title: messages.contentStudio.coverText }
];

const promptFields = [
  {
    label: "目標",
    value: "建立一支保險教育短影音腳本。"
  },
  {
    label: "受眾",
    value: "正在比較保障選項的年輕家庭。"
  },
  {
    label: "核心訊息",
    value: "保險規劃要保護日常生活，而不只是未來目標。",
    multiline: true
  },
  {
    label: "限制條件",
    value: "腳本控制在 60 秒內，並避免使用艱深術語。",
    multiline: true
  },
  {
    label: messages.contentStudio.cta,
    value: "邀請觀眾檢視目前的保障內容。"
  }
];

const promptPreview =
  "請為正在比較保障選項的年輕家庭，建立一支保險教育短影音腳本。強調保險規劃要保護日常生活，而不只是未來目標。腳本請控制在 60 秒內，避免艱深術語，並以邀請觀眾檢視目前保障作結。";

const assistantSuggestions = [
  "挑選一個客戶問題，轉成 30 秒回答。",
  "先選一張主題卡，再填寫開場吸引句與完整腳本。",
  "讓行動呼籲更有人味：邀請對話，而不是像自動化指令。"
];

function buildGptPrompt(formValues: ScriptGenerationForm) {
  return [
    "請你擔任保險內容策略顧問，協助我產生一支繁體中文短影音腳本。",
    "",
    "請根據以下設定撰寫內容：",
    `- 保險主題：${formValues.topic}`,
    `- 目標客群：${formValues.targetAudience}`,
    `- 影片長度：${formValues.videoLength}`,
    `- 語氣風格：${formValues.tone}`,
    `- 發布平台：${formValues.platform}`,
    "",
    "請回傳以下欄位，並使用清楚的段落標題：",
    "1. 標題",
    "2. 開場吸引句",
    "3. 腳本",
    "4. 行動呼籲",
    "5. 標籤",
    "6. 封面文字",
    "",
    "請讓內容適合保險專業人士日常使用，避免誇大承諾，語氣要可信、清楚、有同理心。"
  ].join("\n");
}

function parseGptOutput(text: string) {
  const parsed: Partial<GeneratedScript> = {};
  let currentKey: ScriptPreviewKey | null = null;

  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line) {
      continue;
    }

    const heading = gptOutputHeadings.find(({ labels }) =>
      labels.some((label) =>
        new RegExp(`^(?:\\d+[\\.、]\\s*)?${label}\\s*[:：]?`).test(line)
      )
    );

    if (heading) {
      currentKey = heading.key;
      const value = line
        .replace(new RegExp(`^(?:\\d+[\\.、]\\s*)?${heading.labels[0]}\\s*[:：]?`), "")
        .trim();

      if (value) {
        parsed[currentKey] = value;
      }
      continue;
    }

    if (currentKey) {
      parsed[currentKey] = [parsed[currentKey], line].filter(Boolean).join("\n");
    }
  }

  return parsed;
}

export function ContentPage() {
  const [formValues, setFormValues] =
    useState<ScriptGenerationForm>(initialFormValues);
  const [generatedScript, setGeneratedScript] =
    useState<GeneratedScript>(initialGeneratedScript);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copyMessage, setCopyMessage] = useState<string | null>(null);
  const [gptOutput, setGptOutput] = useState("");
  const [gptImportMessage, setGptImportMessage] = useState<string | null>(null);
  const [scriptStatus, setScriptStatus] = useState<ScriptStatus>("草稿");
  const [savedScripts, setSavedScripts] = useState<SavedScript[]>([]);
  const [libraryMessage, setLibraryMessage] = useState<string | null>(null);
  const gptPrompt = buildGptPrompt(formValues);

  useEffect(() => {
    const saved = window.localStorage.getItem(SCRIPT_LIBRARY_STORAGE_KEY);
    if (!saved) {
      return;
    }

    try {
      const parsed = JSON.parse(saved) as SavedScript[];
      if (Array.isArray(parsed)) {
        setSavedScripts(parsed);
      }
    } catch {
      setLibraryMessage("無法讀取腳本庫，請稍後再試。");
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(
      SCRIPT_LIBRARY_STORAGE_KEY,
      JSON.stringify(savedScripts)
    );
  }, [savedScripts]);

  async function handleGenerateScript() {
    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch("/api/script", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formValues)
      });
      const payload = (await response.json()) as ScriptApiResponse;

      if (!response.ok || !payload.script) {
        throw new Error(payload.error ?? "無法產生腳本，請稍後再試。");
      }

      setGeneratedScript(payload.script);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "無法產生腳本，請稍後再試。"
      );
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleCopyGptPrompt() {
    if (!navigator.clipboard?.writeText) {
      setCopyMessage("目前瀏覽器不支援自動複製，請手動選取並複製 GPT Prompt。");
      return;
    }

    try {
      await navigator.clipboard.writeText(gptPrompt);
      setCopyMessage("已複製 GPT Prompt。");
    } catch {
      setCopyMessage("無法自動複製，請手動選取並複製 GPT Prompt。");
    }
  }

  function handleApplyGptOutput() {
    const parsed = parseGptOutput(gptOutput);

    if (Object.keys(parsed).length === 0) {
      setGptImportMessage("找不到可辨識的段落，請確認內容包含標題、開場吸引句、腳本、行動呼籲、標籤或封面文字。");
      return;
    }

    setGeneratedScript((current) => ({
      ...current,
      ...parsed
    }));
    setGptImportMessage("已套用可辨識的 GPT 結果到預覽卡片。");
  }

  function handleSaveScript() {
    const now = new Date().toISOString();
    const savedScript: SavedScript = {
      id: crypto.randomUUID(),
      ...generatedScript,
      title: generatedScript.title,
      topic: formValues.topic,
      targetAudience: formValues.targetAudience,
      status: scriptStatus,
      createdAt: now,
      updatedAt: now
    };

    setSavedScripts((current) => [savedScript, ...current]);
    setLibraryMessage("已儲存到腳本庫。");
  }

  function handleLoadScript(script: SavedScript) {
    setGeneratedScript({
      title: script.title,
      hook: script.hook,
      script: script.script,
      cta: script.cta,
      hashtags: script.hashtags,
      coverText: script.coverText
    });
    setFormValues((current) => ({
      ...current,
      topic: script.topic,
      targetAudience: script.targetAudience
    }));
    setScriptStatus(script.status);
    setLibraryMessage("已載入腳本到預覽卡片。");
  }

  function handleDeleteScript(id: string) {
    setSavedScripts((current) => current.filter((script) => script.id !== id));
    setLibraryMessage("已刪除腳本。");
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
      <section className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-primary">
              {messages.navigation.content}
            </p>
            <h2 className="mt-2 text-3xl font-semibold tracking-normal">
              把保險想法整理成短影音內容
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              在 AI 產生與後端儲存加入前，先用示範主題卡與腳本區塊規劃影片點子。
            </p>
          </div>
          <Badge variant="secondary" className="w-fit">
            {messages.common.staticWorkspace}
          </Badge>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>主題選擇器</CardTitle>
            <CardDescription>
              選擇一個保險主題，作為下一支影片點子的框架。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {topics.map((topic) => (
                <Card key={topic.title} className="min-h-36 shadow-none">
                  <CardHeader>
                    <CardTitle>{topic.title}</CardTitle>
                    <CardDescription>{topic.description}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-1">
                <CardTitle>腳本庫</CardTitle>
                <CardDescription>
                  將目前預覽卡片儲存在此瀏覽器，稍後可載入或刪除。
                </CardDescription>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <select
                  className="h-10 rounded-md border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={scriptStatus}
                  onChange={(event) =>
                    setScriptStatus(event.target.value as ScriptStatus)
                  }
                >
                  <option value="草稿">草稿</option>
                  <option value="已完成">已完成</option>
                  <option value="已發布">已發布</option>
                </select>
                <Button onClick={handleSaveScript}>儲存目前腳本</Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {libraryMessage ? (
              <p className="rounded-md border bg-background px-3 py-2 text-sm text-muted-foreground">
                {libraryMessage}
              </p>
            ) : null}
            {savedScripts.length === 0 ? (
              <div className="rounded-lg border border-dashed bg-muted/40 p-4 text-sm text-muted-foreground">
                尚未儲存腳本。
              </div>
            ) : (
              <div className="grid gap-4 lg:grid-cols-2">
                {savedScripts.map((script) => (
                  <Card key={script.id} className="shadow-none">
                    <CardHeader>
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <CardTitle>{script.title}</CardTitle>
                          <CardDescription>
                            {script.topic} / {script.targetAudience}
                          </CardDescription>
                        </div>
                        <Badge variant="outline">{script.status}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="line-clamp-3 text-sm leading-6 text-muted-foreground">
                        {script.hook}
                      </p>
                      <div className="flex gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleLoadScript(script)}
                        >
                          載入
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteScript(script.id)}
                        >
                          刪除
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-1">
                <CardTitle>貼上 GPT 結果</CardTitle>
                <CardDescription>
                  將 ChatGPT 產生的內容貼回 DailyOS，並套用到現有預覽卡片。
                </CardDescription>
              </div>
              <Button variant="outline" onClick={handleApplyGptOutput}>
                套用到預覽卡片
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <textarea
              className="min-h-56 w-full resize-y rounded-md border bg-background px-3 py-2 text-sm leading-6 outline-none transition-colors placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
              placeholder={"標題：...\n開場吸引句：...\n腳本：...\n行動呼籲：...\n標籤：...\n封面文字：..."}
              value={gptOutput}
              onChange={(event) => {
                setGptImportMessage(null);
                setGptOutput(event.target.value);
              }}
            />
            {gptImportMessage ? (
              <p className="rounded-md border bg-background px-3 py-2 text-sm text-muted-foreground">
                {gptImportMessage}
              </p>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-1">
                <CardTitle>{messages.contentStudio.aiScriptGenerator}</CardTitle>
                <CardDescription>
                  用目前欄位呼叫 OpenAI，產生保險短影音腳本預覽。
                </CardDescription>
              </div>
              <Badge variant="outline" className="w-fit">
                OpenAI
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
              {generatorControls.map((control) => (
                <label
                  key={control.key}
                  className="rounded-lg border bg-background p-4"
                >
                  <span className="text-xs font-medium text-muted-foreground">
                    {control.label}
                  </span>
                  <select
                    className="mt-2 h-10 w-full rounded-md border bg-background px-3 text-sm font-semibold outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    value={formValues[control.key]}
                    onChange={(event) => {
                      setCopyMessage(null);
                      setFormValues((current) => ({
                        ...current,
                        [control.key]: event.target.value
                      }));
                    }}
                  >
                    {control.options.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>
              ))}
            </div>

            <div className="space-y-3">
              <Button onClick={handleGenerateScript} disabled={isGenerating}>
                {isGenerating ? "產生中..." : messages.contentStudio.generateScript}
              </Button>
              {error ? (
                <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {error}
                </p>
              ) : null}
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              {previewLabels.map((preview) => (
                <Card key={preview.key} className="shadow-none">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-3">
                      <CardTitle>{preview.title}</CardTitle>
                      <Badge variant="outline">{messages.common.preview}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="min-h-24 rounded-md border bg-secondary/40 p-4 text-sm leading-6">
                      {generatedScript[preview.key]}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-1">
                <CardTitle>GPT 模式</CardTitle>
                <CardDescription>
                  根據目前腳本產生器欄位，建立可貼到 ChatGPT 的繁體中文 Prompt。
                </CardDescription>
              </div>
              <Button variant="outline" onClick={handleCopyGptPrompt}>
                複製 GPT Prompt
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border bg-secondary/40 p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold">GPT Prompt 預覽</p>
                <Badge variant="outline">{messages.common.preview}</Badge>
              </div>
              <pre className="mt-3 whitespace-pre-wrap break-words text-sm leading-6 text-muted-foreground">
                {gptPrompt}
              </pre>
            </div>
            {copyMessage ? (
              <p className="rounded-md border bg-background px-3 py-2 text-sm text-muted-foreground">
                {copyMessage}
              </p>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-1">
                <CardTitle>{messages.contentStudio.promptBuilder}</CardTitle>
                <CardDescription>
                  用靜態可編輯欄位整理未來的 AI 腳本提示詞。
                </CardDescription>
              </div>
              <Button variant="outline">{messages.contentStudio.copyPrompt}</Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 lg:grid-cols-2">
              {promptFields.map((field) => (
                <label key={field.label} className="space-y-2">
                  <span className="text-sm font-medium">{field.label}</span>
                  {field.multiline ? (
                    <textarea
                      className="min-h-28 w-full resize-none rounded-md border bg-background px-3 py-2 text-sm leading-6 outline-none transition-colors placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
                      defaultValue={field.value}
                    />
                  ) : (
                    <input
                      className="h-10 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
                      defaultValue={field.value}
                    />
                  )}
                </label>
              ))}
            </div>

            <div className="rounded-lg border bg-secondary/40 p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold">提示詞預覽</p>
                <Badge variant="outline">{messages.common.readOnly}</Badge>
              </div>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                {promptPreview}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>腳本工作區</CardTitle>
            <CardDescription>
              在真正產生腳本前，先用示範區塊規劃影片內容。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 lg:grid-cols-2">
              {workspaceSections.map((section) => (
                <Card key={section.title} className="shadow-none">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-3">
                      <CardTitle>{section.title}</CardTitle>
                      <Badge variant="outline">{messages.common.draft}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="min-h-24 rounded-md border border-dashed bg-muted/40 p-4 text-sm leading-6 text-muted-foreground">
                      {section.placeholder}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      <aside className="space-y-4">
        <Card className="xl:sticky xl:top-24">
          <CardHeader>
            <CardTitle>{messages.common.contentAssistant}</CardTitle>
            <CardDescription>
              用於規劃影片點子的示範建議。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {assistantSuggestions.map((suggestion) => (
                <li
                  key={suggestion}
                  className="rounded-md border bg-secondary/50 px-3 py-3 text-sm leading-6"
                >
                  {suggestion}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}
