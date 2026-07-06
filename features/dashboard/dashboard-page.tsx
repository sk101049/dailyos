"use client";

import Link from "next/link";
import type React from "react";
import { useEffect, useMemo, useState } from "react";
import {
  Bell,
  Bot,
  CheckCircle2,
  Clapperboard,
  FolderKanban,
  HeartPulse,
  LibraryBig,
  ListChecks,
  Megaphone,
  Plus,
  Rocket,
  Search,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  UserRound,
  Video
} from "lucide-react";
import { IssueReportButton } from "@/components/issue-report-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DEMO_SEEDED_KEY, readIssueReports } from "@/lib/beta-validation";
import { readRenderQueue, type RenderJob } from "@/lib/render-queue";

type Icon = React.ComponentType<{ className?: string }>;

type ContentTask = {
  id: string;
  title: string;
  platform: string;
  status: string;
  publishDate: string;
};

type WeeklyPlanItem = {
  id: string;
  dateLabel: string;
  title: string;
  category: string;
  status: string;
};

type CreatorProject = {
  id: string;
  name: string;
  description?: string;
  brand?: string;
  status?: string;
  updatedAt?: string;
};

type RenderedVideo = {
  id: string;
  title?: string;
  name?: string;
  fileName: string;
  projectName: string;
  importedAt: string;
};

type ProviderStatus = {
  id: string;
  label: string;
  available: boolean;
  configured: boolean;
};

const THEME_KEY = "dailyos-theme";
const TASKS_KEY = "dailyos-content-calendar";
const PROJECTS_KEY = "dailyos-projects";
const RENDERED_VIDEO_KEY = "dailyos-rendered-videos";
const WEEKLY_PLAN_KEY = "dailyos-weekly-production-plan";
const BRAND_KEY = "dailyos-brand-library";
const WORKFLOW_KEY = "dailyos-workflow-templates";
const ASSET_KEYS = [
  "dailyos-script-library",
  "dailyos-character-library",
  "dailyos-voice-library",
  "dailyos-storyboard-v2",
  "dailyos-video-packages"
];

const today = new Date().toISOString().slice(0, 10);

const themes = ["Sunrise", "Aurora", "Forest", "Light", "Dark"];

const fallbackTasks: ContentTask[] = [
  { id: "task-script", title: "完成今天的短影音腳本", platform: "DailyOS", status: "待處理", publishDate: today },
  { id: "task-follow-up", title: "追蹤 3 位潛在客戶", platform: "CRM", status: "待處理", publishDate: today },
  { id: "task-appointment", title: "準備明天的預約內容", platform: "行事曆", status: "待確認", publishDate: today }
];

const fallbackWeeklyPlan: WeeklyPlanItem[] = [
  { id: "plan-ai", dateLabel: "今天", title: "AI Shorts", category: "AI", status: "待腳本" },
  { id: "plan-insurance", dateLabel: "週三", title: "保險觀念短片", category: "保險", status: "待生成" },
  { id: "plan-faq", dateLabel: "週五", title: "房貸 FAQ", category: "房地產", status: "待發布" }
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

function formatDate(value?: string) {
  if (!value) return "尚未更新";
  try {
    return new Intl.DateTimeFormat("zh-TW", {
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit"
    }).format(new Date(value));
  } catch {
    return value;
  }
}

export function DashboardPage() {
  const [theme, setTheme] = useState("Sunrise");
  const [toast, setToast] = useState("");
  const [tasks, setTasks] = useState<ContentTask[]>(fallbackTasks);
  const [weeklyPlan, setWeeklyPlan] = useState<WeeklyPlanItem[]>(fallbackWeeklyPlan);
  const [renderJobs, setRenderJobs] = useState<RenderJob[]>([]);
  const [projects, setProjects] = useState<CreatorProject[]>([]);
  const [renderedVideos, setRenderedVideos] = useState<RenderedVideo[]>([]);
  const [providerStatuses, setProviderStatuses] = useState<ProviderStatus[]>([]);
  const [brandCount, setBrandCount] = useState(0);
  const [workflowCount, setWorkflowCount] = useState(0);
  const [assetCount, setAssetCount] = useState(0);
  const [demoSeeded, setDemoSeeded] = useState(false);
  const [issueReportCount, setIssueReportCount] = useState(0);

  useEffect(() => {
    const savedTheme = window.localStorage.getItem(THEME_KEY) ?? "sunrise";
    setTheme(labelTheme(savedTheme));
    setTasks(readArray<ContentTask>(TASKS_KEY, fallbackTasks));
    setWeeklyPlan(readArray<WeeklyPlanItem>(WEEKLY_PLAN_KEY, fallbackWeeklyPlan));
    setRenderJobs(readRenderQueue());
    setProjects(readArray<CreatorProject>(PROJECTS_KEY));
    setRenderedVideos(readArray<RenderedVideo>(RENDERED_VIDEO_KEY));
    setBrandCount(readArray<unknown>(BRAND_KEY).length);
    setWorkflowCount(readArray<unknown>(WORKFLOW_KEY).length);
    setAssetCount(ASSET_KEYS.reduce((total, key) => total + readArray<unknown>(key).length, 0));
    setDemoSeeded(Boolean(window.localStorage.getItem(DEMO_SEEDED_KEY)));
    setIssueReportCount(readIssueReports().length);
    void loadProviderStatuses();
  }, []);

  const todayTasks = tasks.filter((task) => task.publishDate === today);
  const visibleTasks = todayTasks.length ? todayTasks : tasks;
  const recentJobs = renderJobs.slice(0, 5);
  const recentProjects = projects.slice(0, 4);
  const completedVideos = renderedVideos.slice(0, 5);
  const monthPublished = completedVideos.length;
  const providerOnline = providerStatuses.filter((item) => item.available).length;

  const kpis = useMemo(
    () => [
      { label: "進行中專案", value: projects.length, detail: "目前內容專案", icon: FolderKanban, tone: "from-indigo-500 to-violet-500" },
      { label: "今日任務", value: visibleTasks.length, detail: "待處理與待確認", icon: ListChecks, tone: "from-sky-500 to-blue-500" },
      { label: "生成影片", value: renderJobs.length, detail: "Render Queue 工作", icon: Video, tone: "from-amber-400 to-orange-500" },
      { label: "本月發布", value: monthPublished, detail: "完成影片資產", icon: Megaphone, tone: "from-emerald-500 to-teal-500" },
      { label: "素材數", value: assetCount, detail: "腳本、人物、配音、分鏡", icon: LibraryBig, tone: "from-pink-500 to-rose-500" }
    ],
    [assetCount, monthPublished, projects.length, renderJobs.length, visibleTasks.length]
  );

  function changeTheme(nextTheme: string) {
    setTheme(nextTheme);
    const value = nextTheme.toLowerCase();
    window.localStorage.setItem(THEME_KEY, value);
    document.documentElement.dataset.theme = value;
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

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 2200);
  }

  return (
    <div className="space-y-6">
      {toast ? (
        <div className="v1-toast fixed right-6 top-6 z-50 rounded-3xl border bg-white/90 px-4 py-3 text-sm font-medium shadow-2xl backdrop-blur">
          {toast}
        </div>
      ) : null}

      <header className="relative overflow-hidden rounded-[2rem] border border-white/70 bg-white/70 p-6 shadow-2xl backdrop-blur-2xl">
        <HeroArt />
        <div className="relative z-10 grid gap-6 xl:grid-cols-[minmax(0,1fr)_560px] xl:items-start">
          <div className="pt-4">
            <p className="text-sm font-semibold text-primary">早安，DailyOS 使用者</p>
            <h1 className="mt-2 max-w-2xl text-3xl font-bold tracking-normal text-slate-900 sm:text-5xl">
              今天也是創造精彩內容的一天
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-6 text-slate-600">
              整合 AI Director、Video Studio、Gemini、OpenMontage 與 DailyOS 工作流，快速掌握今天的創作狀態。
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto_auto_auto_auto]">
            <label className="flex h-12 items-center gap-3 rounded-2xl border bg-white/80 px-4 shadow-sm backdrop-blur">
              <Search className="h-5 w-5 text-muted-foreground" />
              <input
                className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                placeholder="搜尋專案、素材或 Render Job"
              />
            </label>
            <Button asChild className="v1-gradient-button h-12 rounded-2xl px-5">
              <Link href="/director">
                <Plus className="h-4 w-4" />
                快速創作
              </Link>
            </Button>
            <Button variant="outline" size="icon" className="h-12 w-12 rounded-2xl bg-white/80" onClick={() => showToast("目前沒有新通知")}>
              <Bell className="h-5 w-5" />
            </Button>
            <Button variant="outline" size="icon" className="h-12 w-12 rounded-2xl bg-white/80">
              <UserRound className="h-5 w-5" />
            </Button>
            <select
              value={theme}
              onChange={(event) => changeTheme(event.target.value)}
              className="h-12 rounded-2xl border bg-white/80 px-3 text-sm font-medium outline-none"
              aria-label="Theme"
            >
              {themes.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </div>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {kpis.map((item) => (
          <KpiCard key={item.label} {...item} />
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1fr_1fr_360px]">
        <Panel title="今日任務" action="查看全部" href="/calendar">
          {visibleTasks.slice(0, 4).map((task) => (
            <ListRow key={task.id} icon={CheckCircle2} title={task.title} detail={`${task.platform} · ${task.publishDate}`} status={task.status} />
          ))}
        </Panel>

        <Panel title="本週創作計畫" action="查看 Workflow" href="/workflow">
          {(weeklyPlan.length ? weeklyPlan : fallbackWeeklyPlan).slice(0, 4).map((item) => (
            <ListRow key={item.id} icon={Clapperboard} title={item.title} detail={`${item.dateLabel} · ${item.category}`} status={item.status} />
          ))}
        </Panel>

        <Card className="v1-card overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-primary" />
              AI 助理
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <RobotArt />
            <div className="space-y-2">
              <p className="text-sm font-semibold">今天建議</p>
              {["ChatGPT Shorts", "Gemini 教學", "房貸 FAQ"].map((item) => (
                <div key={item} className="flex items-center gap-2 rounded-2xl bg-white/72 px-3 py-2 text-sm">
                  <Sparkles className="h-4 w-4 text-primary" />
                  {item}
                </div>
              ))}
            </div>
            <Button asChild className="v1-gradient-button w-full rounded-2xl">
              <Link href="/director">開始創作</Link>
            </Button>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <Panel title="最近專案" action="前往專案" href="/projects">
          {recentProjects.length ? (
            recentProjects.map((project) => (
              <ListRow
                key={project.id}
                icon={FolderKanban}
                title={project.name}
                detail={`${project.brand || "未套用品牌"} · ${formatDate(project.updatedAt)}`}
                status={project.status || "草稿"}
              />
            ))
          ) : (
            <EmptyState text="尚未建立專案，從 AI Director 開始即可。" />
          )}
        </Panel>

        <Panel title="最近 Render Queue" action="查看佇列" href="/render-queue">
          {recentJobs.length ? (
            recentJobs.map((job) => (
              <ListRow key={job.id} icon={Rocket} title={job.title} detail={`${job.provider} · ${formatDate(job.updatedAt)}`} status={job.status} />
            ))
          ) : (
            <EmptyState text="目前沒有生成工作。" skeleton />
          )}
        </Panel>

        <Panel title="系統健康" action="回報問題" href="/dashboard">
          <HealthRow label="Build" value="正常" icon={ShieldCheck} />
          <HealthRow label="Smoke Test" value={demoSeeded ? "正常" : "待建立 Demo"} icon={HeartPulse} />
          <HealthRow label="Provider" value={`${providerOnline} 個可用`} icon={Rocket} />
          <HealthRow label="Workflow" value={`${workflowCount} 個模板`} icon={Sparkles} />
          <HealthRow label="問題回報" value={`${issueReportCount} 筆`} icon={ListChecks} />
          <IssueReportButton page="Dashboard" />
        </Panel>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <QuickStart title="AI 幫我規劃影片" detail="進入 AI Director" href="/director" icon={Bot} tone="from-indigo-500 to-violet-500" />
        <QuickStart title="查看熱門趨勢" detail="找今天的題材" href="/trends" icon={TrendingUp} tone="from-sky-500 to-blue-500" />
        <QuickStart title="繼續上次專案" detail="回到專案中心" href="/projects" icon={FolderKanban} tone="from-amber-400 to-orange-500" />
        <QuickStart title="建立新專案" detail="整理內容資產" href="/projects" icon={Plus} tone="from-emerald-500 to-teal-500" />
      </section>
    </div>
  );
}

function labelTheme(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function KpiCard({
  label,
  value,
  detail,
  icon: Icon,
  tone
}: {
  label: string;
  value: number;
  detail: string;
  icon: Icon;
  tone: string;
}) {
  return (
    <Card className="v1-card overflow-hidden">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${tone} text-white shadow-lg`}>
            <Icon className="h-6 w-6" />
          </div>
          <Badge variant="outline" className="rounded-full bg-white/70">今日</Badge>
        </div>
        <p className="mt-5 text-sm text-muted-foreground">{label}</p>
        <p className="v1-count mt-2 text-4xl font-bold">{value}</p>
        <p className="mt-2 text-sm text-muted-foreground">{detail}</p>
      </CardContent>
    </Card>
  );
}

function Panel({
  title,
  action,
  href,
  children
}: {
  title: string;
  action: string;
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="v1-card">
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <CardTitle>{title}</CardTitle>
          <Button asChild variant="outline" size="sm" className="rounded-full bg-white/70">
            <Link href={href}>{action}</Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">{children}</CardContent>
    </Card>
  );
}

function ListRow({
  icon: Icon,
  title,
  detail,
  status
}: {
  icon: Icon;
  title: string;
  detail: string;
  status: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border bg-white/68 p-3 text-sm backdrop-blur">
      <div className="flex min-w-0 items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <p className="truncate font-semibold">{title}</p>
          <p className="truncate text-muted-foreground">{detail}</p>
        </div>
      </div>
      <Badge variant="outline" className="shrink-0 rounded-full bg-white/70">{status}</Badge>
    </div>
  );
}

function HealthRow({ label, value, icon: Icon }: { label: string; value: string; icon: Icon }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border bg-white/68 px-3 py-2 text-sm">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-primary" />
        <span className="font-medium">{label}</span>
      </div>
      <Badge variant="outline" className="rounded-full bg-white/70">{value}</Badge>
    </div>
  );
}

function QuickStart({
  title,
  detail,
  href,
  icon: Icon,
  tone
}: {
  title: string;
  detail: string;
  href: string;
  icon: Icon;
  tone: string;
}) {
  return (
    <Link href={href} className={`group rounded-[1.6rem] bg-gradient-to-br ${tone} p-5 text-white shadow-2xl transition-all hover:-translate-y-1 hover:scale-[1.02]`}>
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur">
        <Icon className="h-6 w-6" />
      </div>
      <p className="mt-5 text-lg font-bold">{title}</p>
      <p className="mt-1 text-sm text-white/82">{detail}</p>
    </Link>
  );
}

function EmptyState({ text, skeleton = false }: { text: string; skeleton?: boolean }) {
  return (
    <div className="rounded-2xl border bg-white/68 p-4 text-sm text-muted-foreground">
      {skeleton ? <div className="v1-skeleton mb-3 h-3 w-32 rounded-full" /> : null}
      {text}
    </div>
  );
}

function HeroArt() {
  return (
    <svg className="absolute inset-y-0 right-0 h-full w-[52%] min-w-[420px] opacity-95" viewBox="0 0 560 320" role="img" aria-label="太陽、火箭、天空與雲朵">
      <defs>
        <linearGradient id="sky" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="#dbeafe" />
          <stop offset="52%" stopColor="#ede9fe" />
          <stop offset="100%" stopColor="#fef3c7" />
        </linearGradient>
      </defs>
      <rect width="560" height="320" rx="42" fill="url(#sky)" opacity="0.68" />
      <circle cx="405" cy="78" r="44" fill="#F59E0B" opacity="0.9" />
      <path d="M50 250c38-40 88-40 126 0 28-28 68-30 98-4 38-34 92-26 122 13H50z" fill="#fff" opacity="0.9" />
      <path d="M340 210c48-54 99-70 154-90-17 56-37 105-92 154l-62-64z" fill="#6C63FF" />
      <path d="M401 146l39 39" stroke="#fff" strokeWidth="12" strokeLinecap="round" />
      <circle cx="406" cy="183" r="17" fill="#DBEAFE" />
      <path d="M332 223l-34 14 15-34" fill="#F59E0B" />
      <path d="M364 258c-8 17-25 28-51 31 3-26 15-43 32-51l19 20z" fill="#F59E0B" opacity="0.9" />
    </svg>
  );
}

function RobotArt() {
  return (
    <div className="rounded-[1.5rem] bg-gradient-to-br from-indigo-500 via-blue-500 to-amber-400 p-5 text-white shadow-xl">
      <svg viewBox="0 0 180 120" className="h-28 w-full" role="img" aria-label="AI Robot">
        <rect x="45" y="30" width="90" height="68" rx="24" fill="rgba(255,255,255,0.92)" />
        <circle cx="75" cy="64" r="8" fill="#6C63FF" />
        <circle cx="105" cy="64" r="8" fill="#6C63FF" />
        <path d="M76 84c12 8 25 8 37 0" stroke="#3B82F6" strokeWidth="6" strokeLinecap="round" fill="none" />
        <path d="M90 30V14" stroke="#fff" strokeWidth="7" strokeLinecap="round" />
        <circle cx="90" cy="11" r="7" fill="#F59E0B" />
        <path d="M44 62H25M136 62h19" stroke="#fff" strokeWidth="8" strokeLinecap="round" />
      </svg>
    </div>
  );
}
