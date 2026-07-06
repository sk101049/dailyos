"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { IssueReportButton } from "@/components/issue-report-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  BETA_ONBOARDING_KEY,
  DEMO_SEEDED_KEY,
  demoCases,
  readIssueReports,
  seedDemoData
} from "@/lib/beta-validation";
import { readRenderQueue, type RenderJob } from "@/lib/render-queue";

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

type RenderedVideo = {
  id: string;
  title?: string;
  name?: string;
  fileName: string;
  projectName: string;
  importedAt: string;
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

type ProviderStatus = {
  id: string;
  label: string;
  available: boolean;
  configured: boolean;
};

type WeeklyPlanItem = {
  id: string;
  dateLabel: string;
  title: string;
  category: string;
  status: string;
};

const SCRIPT_KEY = "dailyos-script-library";
const CHARACTER_KEY = "dailyos-character-library";
const VOICE_KEY = "dailyos-voice-library";
const STORYBOARD_KEY = "dailyos-storyboard-v2";
const PACKAGE_KEY = "dailyos-video-packages";
const BRAND_KEY = "dailyos-brand-library";
const WORKFLOW_KEY = "dailyos-workflow-templates";
const PROJECT_KEY = "dailyos-creator-dashboard-project";
const PROJECTS_KEY = "dailyos-projects";
const ACTIVE_PROJECT_KEY = "dailyos-active-project-id";
const CALENDAR_KEY = "dailyos-content-calendar";
const PUBLISHING_KEY = "dailyos-publishing-center";
const RENDERED_VIDEO_KEY = "dailyos-rendered-videos";
const WEEKLY_PLAN_KEY = "dailyos-weekly-production-plan";

const today = new Date().toISOString().slice(0, 10);

const initialTasks: ContentTask[] = [
  {
    id: "launch-medical",
    title: "醫療險缺口短影音",
    platform: "YouTube 短影音",
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
  const [brandCount, setBrandCount] = useState(0);
  const [workflowCount, setWorkflowCount] = useState(0);
  const [tasks, setTasks] = useState<ContentTask[]>(initialTasks);
  const [publishing, setPublishing] = useState<PublishingItem[]>(initialPublishing);
  const [activeProject, setActiveProject] = useState<CreatorProject | null>(null);
  const [renderJobs, setRenderJobs] = useState<RenderJob[]>([]);
  const [renderedVideos, setRenderedVideos] = useState<RenderedVideo[]>([]);
  const [providerStatuses, setProviderStatuses] = useState<ProviderStatus[]>([]);
  const [weeklyPlan, setWeeklyPlan] = useState<WeeklyPlanItem[]>([]);
  const [projectTitle, setProjectTitle] = useState("今日創作專案");
  const [scriptId, setScriptId] = useState("");
  const [characterId, setCharacterId] = useState("");
  const [voiceId, setVoiceId] = useState("");
  const [provider, setProvider] = useState("Gemini");
  const [message, setMessage] = useState<string | null>(null);
  const [onboardingDismissed, setOnboardingDismissed] = useState(true);
  const [demoSeededAt, setDemoSeededAt] = useState("");
  const [issueReportCount, setIssueReportCount] = useState(0);

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
    setBrandCount(readArray<unknown>(BRAND_KEY).length);
    setWorkflowCount(readArray<unknown>(WORKFLOW_KEY).length);
    setTasks(readArray<ContentTask>(CALENDAR_KEY, initialTasks));
    setPublishing(readArray<PublishingItem>(PUBLISHING_KEY, initialPublishing));
    setRenderJobs(readRenderQueue());
    setRenderedVideos(readArray<RenderedVideo>(RENDERED_VIDEO_KEY));
    setWeeklyPlan(readArray<WeeklyPlanItem>(WEEKLY_PLAN_KEY));
    setActiveProject(project);
    setProjectTitle(project?.name ?? window.localStorage.getItem(PROJECT_KEY) ?? loadedPackages[0]?.title ?? "今日創作專案");
    setScriptId(project?.scriptIds[0] ?? loadedPackages[0]?.script?.id ?? loadedScripts[0]?.id ?? "");
    setCharacterId(project?.defaultCharacterId ?? loadedPackages[0]?.character?.id ?? loadedCharacters[0]?.id ?? "");
    setVoiceId(project?.defaultVoiceId ?? loadedPackages[0]?.voice?.id ?? loadedVoices[0]?.id ?? "");
    setProvider(project?.defaultVideoProvider ?? loadedPackages[0]?.provider ?? "Gemini");
    setOnboardingDismissed(window.localStorage.getItem(BETA_ONBOARDING_KEY) === "true");
    setDemoSeededAt(window.localStorage.getItem(DEMO_SEEDED_KEY) ?? "");
    setIssueReportCount(readIssueReports().length);
    void loadProviderStatuses();
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
  const recentRenderJobs = renderJobs.slice(0, 5);
  const recentCompletedVideos = renderedVideos.slice(0, 5);
  const recentFailedRenders = renderJobs.filter((job) => job.status === "失敗").slice(0, 5);
  const weeklyPlanPreview = weeklyPlan.slice(0, 5);
  const focusItems = [
    missingSteps[0]?.label ? `補齊${missingSteps[0].label}` : "素材已齊全",
    weeklyPlanPreview[0] ? `${weeklyPlanPreview[0].title}：${weeklyPlanPreview[0].status}` : "建立本週創作計畫",
    recentRenderJobs[0] ? `檢查生成：${recentRenderJobs[0].status}` : "建立第一筆生成工作"
  ];
  const onboardingSteps = [
    { label: "建立品牌", done: brandCount > 0, href: "/brand" },
    { label: "建立人物", done: characters.length > 0, href: "/character" },
    { label: "建立配音", done: voices.length > 0, href: "/voice" },
    { label: "建立第一支影片", done: packages.length > 0 || renderJobs.length > 0, href: "/director" }
  ];
  const betaHealth = [
    { label: "Build", status: "green", detail: "最近一次 build 已通過" },
    { label: "Smoke Test", status: demoSeededAt ? "green" : "yellow", detail: demoSeededAt ? "已載入示範資料" : "建議先跑 Beta 檢查表" },
    { label: "Provider", status: providerStatuses.some((item) => item.available) ? "green" : "yellow", detail: providerStatuses.length ? "可讀取服務狀態" : "尚未讀取服務狀態" },
    { label: "Workflow", status: workflowCount > 0 ? "green" : "yellow", detail: workflowCount > 0 ? `${workflowCount} 個流程模板` : "尚未建立流程模板" },
    { label: "Asset", status: scripts.length + characters.length + voices.length > 0 ? "green" : "red", detail: `${scripts.length + characters.length + voices.length} 個核心素材` },
    { label: "Publishing", status: publishing.length > 0 ? "green" : "yellow", detail: `${publishing.length} 筆發布項目` }
  ];

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
    setMessage("製作包已從創作者儀表板儲存。");
  }

  function dismissOnboarding() {
    window.localStorage.setItem(BETA_ONBOARDING_KEY, "true");
    setOnboardingDismissed(true);
  }

  function loadDemoData() {
    seedDemoData();
    setDemoSeededAt(window.localStorage.getItem(DEMO_SEEDED_KEY) ?? new Date().toISOString());
    setMessage(`已載入 ${demoCases.length} 個示範創作案例。`);
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
          <div className="flex flex-wrap gap-2">
            <IssueReportButton page="Dashboard" />
            <Button asChild>
              <Link href="/director">開始今天的影片</Link>
            </Button>
          </div>
        </div>

        {!onboardingDismissed ? (
          <Card>
            <CardHeader>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <CardTitle>歡迎使用 DailyOS Beta</CardTitle>
                  <CardDescription>先完成四個步驟，就能開始製作第一支影片。</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={dismissOnboarding}>我知道了</Button>
              </div>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-4">
              {onboardingSteps.map((step) => (
                <Link key={step.label} href={step.href} className="rounded-md border bg-background p-3 text-sm">
                  <Badge variant={step.done ? "default" : "outline"}>{step.done ? "完成" : "待完成"}</Badge>
                  <p className="mt-2 font-medium">{step.label}</p>
                </Link>
              ))}
            </CardContent>
          </Card>
        ) : null}

        <Card>
          <CardHeader>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <CardTitle>Beta 狀態</CardTitle>
                <CardDescription>Build、Smoke Test、Provider、Workflow、Asset、Publishing 的快速健康檢查。</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={loadDemoData}>載入 20 個示範案例</Button>
            </div>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-3">
            {betaHealth.map((item) => (
              <div key={item.label} className="rounded-md border bg-background p-3 text-sm">
                <div className="flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${item.status === "green" ? "bg-emerald-500" : item.status === "yellow" ? "bg-amber-500" : "bg-red-500"}`} />
                  <p className="font-medium">{item.label}</p>
                </div>
                <p className="mt-2 text-muted-foreground">{item.detail}</p>
              </div>
            ))}
            <div className="rounded-md border bg-background p-3 text-sm">
              <p className="font-medium">問題回報</p>
              <p className="mt-2 text-muted-foreground">{issueReportCount} 筆本機紀錄</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>今天先看這三件事</CardTitle>
            <CardDescription>把每日工作台收斂成最需要處理的下一步。</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-3">
            {focusItems.map((item, index) => (
              <div key={item} className="rounded-md border bg-background p-3 text-sm">
                <p className="text-muted-foreground">第 {index + 1} 件</p>
                <p className="mt-1 font-medium">{item}</p>
              </div>
            ))}
          </CardContent>
        </Card>

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
              <CardDescription>最近匯入的完成影片</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {recentCompletedVideos.length === 0 ? (
                <p className="text-sm text-muted-foreground">尚未匯入完成影片。</p>
              ) : (
                recentCompletedVideos.map((item) => (
                  <div key={item.id} className="text-sm">
                    <p className="truncate font-medium">{item.title ?? item.name ?? item.fileName}</p>
                    <p className="truncate text-muted-foreground">{item.projectName}</p>
                  </div>
                ))
              )}
              <Button asChild variant="outline" size="sm">
                <Link href="/assets">開啟素材庫</Link>
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>服務狀態</CardTitle>
              <CardDescription>影片生成服務可用性</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {providerStatuses.length === 0 ? (
                <p className="text-sm text-muted-foreground">尚未取得服務狀態。</p>
              ) : (
                providerStatuses.slice(0, 5).map((item) => (
                  <div key={item.id} className="flex items-center justify-between gap-3 text-sm">
                    <span className="font-medium">{item.label}</span>
                    <span className="text-muted-foreground">
                      {item.available ? "● 可用" : item.configured ? "● 已設定" : "○ 尚未設定"}
                    </span>
                  </div>
                ))
              )}
              <Button variant="outline" size="sm" onClick={loadProviderStatuses}>
                重新檢查
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

        <Card>
          <CardHeader>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <CardTitle>本週創作計畫</CardTitle>
                <CardDescription>AI 製作人建立的待審核內容。</CardDescription>
              </div>
              <Button asChild variant="outline" size="sm">
                <Link href="/workflow">開啟流程編排</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {weeklyPlanPreview.length === 0 ? (
              <p className="rounded-md border bg-background p-3 text-sm text-muted-foreground">
                尚未建立本週創作計畫。
              </p>
            ) : (
              weeklyPlanPreview.map((item) => (
                <div key={item.id} className="flex flex-col gap-2 rounded-md border bg-background p-3 text-sm sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-medium">{item.dateLabel}</p>
                    <p className="text-muted-foreground">{item.title}</p>
                  </div>
                  <Badge variant="outline">{item.status}</Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>今天生成工作</CardTitle>
              <CardDescription>最近五筆生成佇列</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentRenderJobs.length === 0 ? (
                <p className="rounded-md border bg-background p-3 text-sm text-muted-foreground">
                  尚未建立生成工作。
                </p>
              ) : (
                recentRenderJobs.map((job) => (
                  <div key={job.id} className="rounded-md border bg-background p-3 text-sm">
                    <div className="flex items-start justify-between gap-3">
                      <p className="font-medium">{job.title}</p>
                      <Badge variant="outline">{job.status}</Badge>
                    </div>
                    <p className="mt-1 text-muted-foreground">
                      {job.provider} · {job.updatedAt}
                    </p>
                  </div>
                ))
              )}
              <Button asChild variant="outline" size="sm">
                <Link href="/render-queue">開啟生成佇列</Link>
              </Button>
            </CardContent>
          </Card>

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

          <Card>
            <CardHeader>
              <CardTitle>最近失敗生成</CardTitle>
              <CardDescription>需要手動檢查的生成工作</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentFailedRenders.length === 0 ? (
                <p className="rounded-md border bg-background p-3 text-sm text-muted-foreground">
                  目前沒有失敗的生成工作。
                </p>
              ) : (
                recentFailedRenders.map((job) => (
                  <div key={job.id} className="rounded-md border bg-background p-3 text-sm">
                    <div className="flex items-start justify-between gap-3">
                      <p className="font-medium">{job.title}</p>
                      <Badge variant="outline">{job.provider}</Badge>
                    </div>
                    <p className="mt-1 line-clamp-2 text-muted-foreground">{job.error || "未知錯誤"}</p>
                  </div>
                ))
              )}
              <Button asChild variant="outline" size="sm">
                <Link href="/render-queue">查看生成佇列</Link>
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
