"use client";

import Link from "next/link";
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

type ContentTask = {
  id: string;
  title: string;
  platform: string;
  status: string;
  publishDate: string;
};

type PublishingItem = {
  id: string;
  title: string;
  platform: string;
  status: string;
  scheduledDate: string;
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
};

const SCRIPT_KEY = "dailyos-script-library";
const CHARACTER_KEY = "dailyos-character-library";
const VOICE_KEY = "dailyos-voice-library";
const STORYBOARD_KEY = "dailyos-storyboard-v2";
const PACKAGE_KEY = "dailyos-video-packages";
const PROJECT_KEY = "dailyos-creator-dashboard-project";
const CALENDAR_KEY = "dailyos-content-calendar";
const PUBLISHING_KEY = "dailyos-publishing-center";

const today = new Date().toISOString().slice(0, 10);

const initialTasks: ContentTask[] = [
  {
    id: "launch-medical",
    title: "醫療險缺口短影音",
    platform: "YouTube Shorts",
    status: "待製作",
    publishDate: today
  }
];

const initialPublishing: PublishingItem[] = [
  {
    id: "medical-policy",
    title: "醫療險不等於完整保障",
    platform: "Instagram Reels",
    status: "待發布",
    scheduledDate: today
  }
];

function readArray<T>(key: string, fallback: T[] = []) {
  try {
    const saved = window.localStorage.getItem(key);
    const parsed = saved ? (JSON.parse(saved) as T[]) : fallback;
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

function findById<T extends { id: string }>(items: T[], id: string) {
  return items.find((item) => item.id === id) ?? null;
}

export function DashboardPage() {
  const [scripts, setScripts] = useState<ScriptAsset[]>([]);
  const [characters, setCharacters] = useState<CharacterAsset[]>([]);
  const [voices, setVoices] = useState<VoiceAsset[]>([]);
  const [storyboard, setStoryboard] = useState<StoryboardScene[]>([]);
  const [packages, setPackages] = useState<ProductionPackage[]>([]);
  const [tasks, setTasks] = useState<ContentTask[]>(initialTasks);
  const [publishing, setPublishing] = useState<PublishingItem[]>(initialPublishing);
  const [projectTitle, setProjectTitle] = useState("DailyOS Creator Project");
  const [scriptId, setScriptId] = useState("");
  const [characterId, setCharacterId] = useState("");
  const [voiceId, setVoiceId] = useState("");
  const [provider, setProvider] = useState("Gemini");
  const [message, setMessage] = useState<string | null>(null);

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
    setTasks(readArray<ContentTask>(CALENDAR_KEY, initialTasks));
    setPublishing(readArray<PublishingItem>(PUBLISHING_KEY, initialPublishing));
    setProjectTitle(window.localStorage.getItem(PROJECT_KEY) ?? loadedPackages[0]?.title ?? "DailyOS Creator Project");
    setScriptId(loadedPackages[0]?.script?.id ?? loadedScripts[0]?.id ?? "");
    setCharacterId(loadedPackages[0]?.character?.id ?? loadedCharacters[0]?.id ?? "");
    setVoiceId(loadedPackages[0]?.voice?.id ?? loadedVoices[0]?.id ?? "");
    setProvider(loadedPackages[0]?.provider ?? "Gemini");
  }, []);

  useEffect(() => {
    window.localStorage.setItem(PROJECT_KEY, projectTitle);
  }, [projectTitle]);

  const productionPackage = useMemo<ProductionPackage>(() => {
    const character = findById(characters, characterId);
    const voice = findById(voices, voiceId);

    return {
      id: crypto.randomUUID(),
      title: projectTitle || "DailyOS Creator Project",
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
        format: "Vertical short video, 9:16",
        renderTarget: provider === "Gemini" ? "Manual Gemini / Google AI Studio handoff" : "Manual OpenMontage handoff",
        status: "Ready for review",
        integrations: [`${provider}-ready metadata`, "No API keys", "No automatic rendering"]
      }
    };
  }, [characterId, characters, projectTitle, provider, scriptId, scripts, storyboard, voiceId, voices]);

  const steps = [
    { label: "專案", done: Boolean(projectTitle.trim()), href: "/dashboard" },
    { label: "腳本", done: Boolean(productionPackage.script), href: "/content" },
    { label: "人物", done: Boolean(productionPackage.character), href: "/character" },
    { label: "聲音", done: Boolean(productionPackage.voice), href: "/voice" },
    { label: "分鏡", done: productionPackage.storyboard.length > 0, href: "/content" },
    { label: "Provider", done: Boolean(provider), href: "/video" },
    { label: "製作包", done: packages.length > 0, href: "/video" }
  ];
  const completedSteps = steps.filter((step) => step.done).length;
  const missingSteps = steps.filter((step) => !step.done);
  const missingRequiredSteps = steps.slice(0, 6).filter((step) => !step.done);
  const todayTasks = tasks.filter((task) => task.publishDate === today);
  const activePublishing = publishing.filter((item) => item.status !== "已發布").slice(0, 4);

  function savePackage() {
    const next = [productionPackage, ...packages];
    setPackages(next);
    window.localStorage.setItem(PACKAGE_KEY, JSON.stringify(next));
    setMessage("Production package 已從 Creator Dashboard 儲存。");
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
      <section className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-primary">Creator Dashboard</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-normal">
              今日內容生產工作台
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              從同一個入口選專案、腳本、人物、聲音、分鏡與 provider，最後產生本機 production package。
            </p>
          </div>
          <Badge variant="secondary" className="w-fit">
            LocalStorage only
          </Badge>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <CardTitle>Production Wizard</CardTitle>
                <CardDescription>
                  {completedSteps} / {steps.length} 步完成。缺少資產時，使用下方捷徑回到既有 Studio 建立。
                </CardDescription>
              </div>
              <Button onClick={savePackage} disabled={missingRequiredSteps.length > 0}>
                產生 production package
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            {message ? (
              <p className="rounded-md border bg-background px-3 py-2 text-sm text-muted-foreground">
                {message}
              </p>
            ) : null}
            <div className="h-2 overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full bg-primary transition-all"
                style={{ width: `${(completedSteps / steps.length) * 100}%` }}
              />
            </div>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <TextField label="專案名稱" value={projectTitle} onChange={setProjectTitle} />
              <SelectField
                label="腳本"
                value={scriptId}
                placeholder="選擇腳本..."
                options={scripts.map((item) => ({ label: item.title, value: item.id }))}
                onChange={setScriptId}
              />
              <SelectField
                label="人物"
                value={characterId}
                placeholder="選擇人物..."
                options={characters.map((item) => ({ label: item.name, value: item.id }))}
                onChange={setCharacterId}
              />
              <SelectField
                label="聲音"
                value={voiceId}
                placeholder="選擇聲音..."
                options={voices.map((item) => ({ label: item.name, value: item.id }))}
                onChange={setVoiceId}
              />
              <SelectField
                label="Provider"
                value={provider}
                placeholder="選擇 provider..."
                options={[
                  { label: "Gemini", value: "Gemini" },
                  { label: "OpenMontage", value: "OpenMontage" }
                ]}
                onChange={setProvider}
              />
              <div className="rounded-md border bg-secondary/30 p-3 text-sm">
                <p className="font-medium">分鏡</p>
                <p className="mt-2 text-muted-foreground">
                  {storyboard.length ? `${storyboard.length} 個場次可用` : "尚無分鏡場次"}
                </p>
              </div>
              <div className="rounded-md border bg-secondary/30 p-3 text-sm">
                <p className="font-medium">最近製作包</p>
                <p className="mt-2 text-muted-foreground">
                  {packages[0]?.title ?? "尚未產生 production package"}
                </p>
              </div>
            </div>
            {missingRequiredSteps.length > 0 ? (
              <div className="rounded-md border bg-background p-3">
                <p className="text-sm font-medium">缺少資產與下一步</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {missingRequiredSteps.map((step) => (
                    <Button key={step.label} asChild variant="outline" size="sm">
                      <Link href={step.href}>補齊{step.label}</Link>
                    </Button>
                  ))}
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>今日 Calendar 任務</CardTitle>
              <CardDescription>{today} 的內容排程</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {(todayTasks.length ? todayTasks : tasks.slice(0, 3)).map((task) => (
                <div key={task.id} className="rounded-md border bg-background p-3 text-sm">
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-medium">{task.title}</p>
                    <Badge variant="outline">{task.status}</Badge>
                  </div>
                  <p className="mt-1 text-muted-foreground">
                    {task.platform} · {task.publishDate}
                  </p>
                </div>
              ))}
              <Button asChild variant="outline" size="sm">
                <Link href="/calendar">開啟 Calendar</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Publishing Queue</CardTitle>
              <CardDescription>快速查看尚未發布的內容</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {(activePublishing.length ? activePublishing : initialPublishing).map((item) => (
                <div key={item.id} className="rounded-md border bg-background p-3 text-sm">
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-medium">{item.title}</p>
                    <Badge variant="outline">{item.status}</Badge>
                  </div>
                  <p className="mt-1 text-muted-foreground">
                    {item.platform} · {item.scheduledDate}
                  </p>
                </div>
              ))}
              <Button asChild variant="outline" size="sm">
                <Link href="/publishing">開啟 Publishing</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      <aside className="space-y-4">
        <Card className="xl:sticky xl:top-24">
          <CardHeader>
            <CardTitle>Resume Last Project</CardTitle>
            <CardDescription>從最近的本機 production package 繼續。</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <SummaryRow label="專案" value={packages[0]?.title ?? projectTitle} />
            <SummaryRow label="腳本" value={productionPackage.script?.title ?? "未選擇"} />
            <SummaryRow label="人物" value={productionPackage.character?.name ?? "未選擇"} />
            <SummaryRow label="聲音" value={productionPackage.voice?.name ?? "未選擇"} />
            <SummaryRow label="分鏡" value={`${storyboard.length} 場`} />
            <SummaryRow label="Provider" value={provider} />
            <Button asChild className="w-full">
              <Link href="/video">到 Video Studio 匯出</Link>
            </Button>
          </CardContent>
        </Card>
      </aside>
    </div>
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

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-md border bg-background px-3 py-2 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="max-w-44 text-right font-medium">{value}</span>
    </div>
  );
}
