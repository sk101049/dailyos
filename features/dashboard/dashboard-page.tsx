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

type CreatorProject = {
  id: string;
  name: string;
  description: string;
  brand: string;
  defaultCharacterId: string;
  defaultVoiceId: string;
  defaultVideoProvider: string;
  scriptIds: string[];
  storyboardIds: string[];
  videoIds: string[];
  calendarItemIds: string[];
  publishingItemIds: string[];
  status: string;
};

const SCRIPT_KEY = "dailyos-script-library";
const CHARACTER_KEY = "dailyos-character-library";
const VOICE_KEY = "dailyos-voice-library";
const STORYBOARD_KEY = "dailyos-storyboard-v2";
const PACKAGE_KEY = "dailyos-video-packages";
const PROJECT_KEY = "dailyos-creator-dashboard-project";
const PROJECTS_KEY = "dailyos-projects";
const ACTIVE_PROJECT_KEY = "dailyos-active-project-id";
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
  const [activeProject, setActiveProject] = useState<CreatorProject | null>(null);
  const [projectTitle, setProjectTitle] = useState("今日創作專案");
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
    const loadedProjects = readArray<CreatorProject>(PROJECTS_KEY);
    const activeProjectId = window.localStorage.getItem(ACTIVE_PROJECT_KEY) ?? "";
    const project = loadedProjects.find((item) => item.id === activeProjectId) ?? null;

    setScripts(loadedScripts);
    setCharacters(loadedCharacters);
    setVoices(loadedVoices);
    setStoryboard(loadedStoryboard);
    setPackages(loadedPackages);
    setTasks(readArray<ContentTask>(CALENDAR_KEY, initialTasks));
    setPublishing(readArray<PublishingItem>(PUBLISHING_KEY, initialPublishing));
    setActiveProject(project);
    setProjectTitle(project?.name ?? window.localStorage.getItem(PROJECT_KEY) ?? loadedPackages[0]?.title ?? "今日創作專案");
    setScriptId(project?.scriptIds[0] ?? loadedPackages[0]?.script?.id ?? loadedScripts[0]?.id ?? "");
    setCharacterId(project?.defaultCharacterId ?? loadedPackages[0]?.character?.id ?? loadedCharacters[0]?.id ?? "");
    setVoiceId(project?.defaultVoiceId ?? loadedPackages[0]?.voice?.id ?? loadedVoices[0]?.id ?? "");
    setProvider(project?.defaultVideoProvider ?? loadedPackages[0]?.provider ?? "Gemini");
  }, []);

  useEffect(() => {
    window.localStorage.setItem(PROJECT_KEY, projectTitle);
  }, [projectTitle]);

  const productionPackage = useMemo<ProductionPackage>(() => {
    const character = findById(characters, characterId);
    const voice = findById(voices, voiceId);

    return {
      id: crypto.randomUUID(),
      title: projectTitle || "今日創作專案",
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
        format: "直式短影音 9:16",
        renderTarget: provider === "Gemini" ? "手動交接 Gemini / Google AI Studio" : "手動交接 OpenMontage",
        status: "待檢查",
        integrations: [`${provider} metadata`, "不需要 API key", "不自動生成影片"]
      }
    };
  }, [characterId, characters, projectTitle, provider, scriptId, scripts, storyboard, voiceId, voices]);

  const steps = [
    { label: "專案", done: Boolean(projectTitle.trim()), href: "/dashboard" },
    { label: "腳本", done: Boolean(productionPackage.script), href: "/content#script" },
    { label: "人物", done: Boolean(productionPackage.character), href: "/character" },
    { label: "聲音", done: Boolean(productionPackage.voice), href: "/voice" },
    { label: "分鏡", done: productionPackage.storyboard.length > 0, href: "/content#storyboard" },
    { label: "影片服務", done: Boolean(provider), href: "/video#providers" },
    { label: "製作包", done: packages.length > 0, href: "/video#export" }
  ];
  const completedSteps = steps.filter((step) => step.done).length;
  const missingSteps = steps.filter((step) => !step.done);
  const missingRequiredSteps = steps.slice(0, 6).filter((step) => !step.done);
  const todayTasks = tasks.filter((task) => task.publishDate === today);
  const activePublishing = publishing.filter((item) => item.status !== "已發布").slice(0, 4);
  const recentVideos = packages.slice(0, 3);

  function savePackage() {
    const next = [productionPackage, ...packages];
    setPackages(next);
    window.localStorage.setItem(PACKAGE_KEY, JSON.stringify(next));
    setMessage("製作包已從創作者儀表板儲存。");
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
      <section className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-primary">創作者儀表板</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-normal">
              今天的創作工作台
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              先看今日專案與製作進度，再開始下一支影片。
            </p>
          </div>
          <Button asChild>
            <Link href="/content#script">開始今天的影片</Link>
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>今日專案</CardTitle>
              <CardDescription>{activeProject?.description || "尚未設定專案描述。"}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-lg font-semibold">{activeProject?.name ?? projectTitle}</p>
              <Button asChild variant="outline" size="sm">
                <Link href="/projects">管理專案</Link>
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>今日製作進度</CardTitle>
              <CardDescription>{completedSteps} / {steps.length} 步完成</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="h-2 overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full bg-primary transition-all"
                  style={{ width: `${(completedSteps / steps.length) * 100}%` }}
                />
              </div>
              <p className="text-sm text-muted-foreground">
                {missingSteps[0] ? `下一步：${missingSteps[0].label}` : "今天的製作素材已齊全。"}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>最近影片</CardTitle>
              <CardDescription>最近建立的製作包</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {recentVideos.length === 0 ? (
                <p className="text-sm text-muted-foreground">尚未建立影片製作包。</p>
              ) : (
                recentVideos.map((item) => (
                  <p key={item.id} className="truncate text-sm font-medium">{item.title}</p>
                ))
              )}
              <Button asChild variant="outline" size="sm">
                <Link href="/video#export">前往影片工作室</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <CardTitle>製作流程精靈</CardTitle>
                <CardDescription>
                  {completedSteps} / {steps.length} 步完成。缺少資產時，使用下方捷徑回到既有 Studio 建立。
                </CardDescription>
              </div>
              <Button onClick={savePackage} disabled={missingRequiredSteps.length > 0}>
                產生製作包
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
                label="影片服務"
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
                  {packages[0]?.title ?? "尚未產生製作包"}
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
              <CardTitle>今日行事曆任務</CardTitle>
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
                <Link href="/calendar">開啟行事曆</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>發布佇列</CardTitle>
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
                <Link href="/publishing">開啟發布中心</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      <aside className="space-y-4">
        <Card className="xl:sticky xl:top-24">
          <CardHeader>
            <CardTitle>繼續上次專案</CardTitle>
            <CardDescription>從最近的本機製作包繼續。</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <SummaryRow label="目前專案" value={activeProject?.name ?? "未選擇"} />
            <SummaryRow label="品牌" value={activeProject?.brand ?? "未設定"} />
            <SummaryRow label="專案" value={packages[0]?.title ?? projectTitle} />
            <SummaryRow label="腳本" value={productionPackage.script?.title ?? "未選擇"} />
            <SummaryRow label="人物" value={productionPackage.character?.name ?? "未選擇"} />
            <SummaryRow label="聲音" value={productionPackage.voice?.name ?? "未選擇"} />
            <SummaryRow label="分鏡" value={`${storyboard.length} 場`} />
            <SummaryRow label="影片服務" value={provider} />
            <Button asChild className="w-full">
              <Link href="/video#export">到影片工作室匯出</Link>
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
