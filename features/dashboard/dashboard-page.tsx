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
import { DEMO_SEEDED_KEY, readIssueReports } from "@/lib/beta-validation";
import { readRenderQueue, type RenderJob } from "@/lib/render-queue";

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

const fallbackTasks: ContentTask[] = [
  {
    id: "today-script",
    title: "完成今天的短影音腳本",
    platform: "DailyOS",
    status: "待處理",
    publishDate: today
  },
  {
    id: "today-follow-up",
    title: "追蹤 3 位潛在客戶",
    platform: "CRM",
    status: "待處理",
    publishDate: today
  }
];

const fallbackWeeklyPlan: WeeklyPlanItem[] = [
  { id: "mon", dateLabel: "今天", title: "AI Shorts", category: "AI", status: "待腳本" },
  { id: "wed", dateLabel: "週三", title: "保險知識短片", category: "保險", status: "待生成" },
  { id: "fri", dateLabel: "週五", title: "客戶 FAQ", category: "FAQ", status: "待發布" }
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
  const recentJobs = renderJobs.slice(0, 5);
  const completedVideos = renderedVideos.slice(0, 5);
  const failedJobs = renderJobs.filter((job) => job.status === "失敗" || job.status.includes("失")).slice(0, 5);
  const recentProjects = projects.slice(0, 4);
  const providerOnline = providerStatuses.filter((item) => item.available).length;

  const kpis = useMemo(
    () => [
      { label: "今日任務", value: `${(todayTasks.length ? todayTasks : tasks).length}`, detail: "待處理內容與客戶追蹤" },
      { label: "本週計畫", value: `${weeklyPlan.length}`, detail: "已排入創作節奏" },
      { label: "生成佇列", value: `${renderJobs.length}`, detail: "跨 Provider 工作" },
      { label: "完成影片", value: `${renderedVideos.length}`, detail: "素材庫影片資產" }
    ],
    [renderJobs.length, renderedVideos.length, tasks, todayTasks, weeklyPlan.length]
  );

  const assistantSuggestions = [
    "先完成今天的短影音腳本，再送進 Render Queue。",
    "追蹤 3 位潛在客戶，並把回覆整理成明天的 FAQ 題材。",
    "檢查本週創作計畫，確認每支影片都有品牌、人物與配音。",
    "如果 Gemini 忙碌，可以改用 OpenMontage 建立本機 Render Job。"
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

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
      <section className="space-y-6">
        <div className="v1-hero overflow-hidden p-6 text-white sm:p-8">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_260px] lg:items-center">
            <div>
              <p className="text-sm font-semibold text-white/80">DailyOS v1</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-normal sm:text-4xl">
                今天的創作、生成與發布，一眼掌握。
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/86">
                從 AI Director、Video Studio 到 Render Queue，這裡是每日內容營運的起點。
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                <IssueReportButton page="Dashboard" />
                <Button asChild className="rounded-full bg-white text-slate-900 hover:bg-white/90">
                  <Link href="/director">AI 幫我規劃</Link>
                </Button>
                <Button asChild variant="outline" className="rounded-full border-white/50 bg-white/10 text-white hover:bg-white/20 hover:text-white">
                  <Link href="/video">前往 Video Studio</Link>
                </Button>
              </div>
            </div>
            <div className="rounded-2xl border border-white/30 bg-white/18 p-5 shadow-lg backdrop-blur">
              <p className="text-sm font-medium text-white/80">今日焦點</p>
              <p className="mt-3 text-4xl font-semibold">{renderJobs.length + weeklyPlan.length}</p>
              <p className="mt-2 text-sm leading-6 text-white/82">個內容節點正在排程或等待處理</p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {kpis.map((item, index) => (
            <Card key={item.label} className="v1-card overflow-hidden">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm text-muted-foreground">{item.label}</p>
                    <p className="mt-2 text-3xl font-semibold">{item.value}</p>
                  </div>
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl v1-gradient text-sm font-semibold text-white">
                    {index + 1}
                  </span>
                </div>
                <p className="mt-3 text-sm text-muted-foreground">{item.detail}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <DashboardCard title="今日任務" description={`${today} 的內容與追蹤事項`} href="/calendar" action="查看行事曆">
            {(todayTasks.length ? todayTasks : tasks).slice(0, 5).map((task) => (
              <ListRow key={task.id} title={task.title} detail={`${task.platform} · ${task.publishDate}`} status={task.status} />
            ))}
          </DashboardCard>

          <DashboardCard title="本週創作計畫" description="AI Producer 建立的待審核內容節奏" href="/workflow" action="查看 Workflow">
            {(weeklyPlan.length ? weeklyPlan : fallbackWeeklyPlan).slice(0, 5).map((item) => (
              <ListRow key={item.id} title={item.title} detail={`${item.dateLabel} · ${item.category}`} status={item.status} />
            ))}
          </DashboardCard>

          <DashboardCard title="Render Queue" description="最近五筆生成工作" href="/render-queue" action="查看佇列">
            {recentJobs.length ? (
              recentJobs.map((job) => (
                <ListRow key={job.id} title={job.title} detail={`${job.provider} · ${formatDate(job.updatedAt)}`} status={job.status} />
              ))
            ) : (
              <EmptyState text="目前沒有生成工作。" />
            )}
          </DashboardCard>

          <DashboardCard title="最近專案" description="最近建立或更新的內容專案" href="/projects" action="查看專案">
            {recentProjects.length ? (
              recentProjects.map((project) => (
                <ListRow
                  key={project.id}
                  title={project.name}
                  detail={`${project.brand || "未套用品牌"} · ${formatDate(project.updatedAt)}`}
                  status={project.status || "草稿"}
                />
              ))
            ) : (
              <EmptyState text="尚未建立專案，可從 AI Director 開始。" />
            )}
          </DashboardCard>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <StatusCard label="品牌" value={brandCount} detail="品牌工作室設定" />
          <StatusCard label="素材" value={assetCount} detail="腳本、人物、配音、分鏡與 Package" />
          <StatusCard label="Workflow" value={workflowCount} detail="已儲存流程模板" />
        </div>
      </section>

      <aside className="space-y-4">
        <Card className="v1-card xl:sticky xl:top-24">
          <CardHeader>
            <CardTitle>AI 助理</CardTitle>
            <CardDescription>根據目前工作區提供下一步建議。</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {assistantSuggestions.map((item) => (
              <div key={item} className="rounded-xl border bg-background/80 p-3 text-sm leading-6">
                {item}
              </div>
            ))}
            <Button asChild className="v1-gradient-button w-full rounded-full">
              <Link href="/director">開始新的創作</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="v1-card">
          <CardHeader>
            <CardTitle>服務狀態</CardTitle>
            <CardDescription>{providerOnline} 個服務可用。</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {providerStatuses.length ? (
              providerStatuses.slice(0, 6).map((provider) => (
                <div key={provider.id} className="flex items-center justify-between rounded-xl border bg-background/80 px-3 py-2 text-sm">
                  <span className="font-medium">{provider.label}</span>
                  <Badge variant={provider.available ? "default" : "outline"}>
                    {provider.available ? "可用" : provider.configured ? "已設定" : "未設定"}
                  </Badge>
                </div>
              ))
            ) : (
              <EmptyState text="尚未讀取 Provider 狀態。" />
            )}
          </CardContent>
        </Card>

        <Card className="v1-card">
          <CardHeader>
            <CardTitle>Beta 狀態</CardTitle>
            <CardDescription>Build、Smoke Test 與回報紀錄。</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <HealthRow label="Build" status="綠" detail="本地 build 驗證中" />
            <HealthRow label="Smoke Test" status={demoSeeded ? "綠" : "黃"} detail={demoSeeded ? "Demo 資料已建立" : "尚未建立 Demo 資料"} />
            <HealthRow label="回報問題" status={issueReportCount ? "黃" : "綠"} detail={`${issueReportCount} 筆本機紀錄`} />
          </CardContent>
        </Card>

        <Card className="v1-card">
          <CardHeader>
            <CardTitle>最近完成影片</CardTitle>
            <CardDescription>可直接前往素材庫管理。</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {completedVideos.length ? (
              completedVideos.map((video) => (
                <ListRow
                  key={video.id}
                  title={video.title ?? video.name ?? video.fileName}
                  detail={video.projectName}
                  status={formatDate(video.importedAt)}
                />
              ))
            ) : (
              <EmptyState text="尚未匯入完成影片。" />
            )}
            {failedJobs.length ? (
              <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                最近有 {failedJobs.length} 筆失敗 Render，請到佇列查看。
              </div>
            ) : null}
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}

function DashboardCard({
  title,
  description,
  href,
  action,
  children
}: {
  title: string;
  description: string;
  href: string;
  action: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="v1-card">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          <Button asChild variant="outline" size="sm" className="rounded-full">
            <Link href={href}>{action}</Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">{children}</CardContent>
    </Card>
  );
}

function ListRow({ title, detail, status }: { title: string; detail: string; status: string }) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-xl border bg-background/80 p-3 text-sm">
      <div className="min-w-0">
        <p className="truncate font-medium">{title}</p>
        <p className="mt-1 truncate text-muted-foreground">{detail}</p>
      </div>
      <Badge variant="outline" className="shrink-0">
        {status}
      </Badge>
    </div>
  );
}

function StatusCard({ label, value, detail }: { label: string; value: number; detail: string }) {
  return (
    <Card className="v1-card">
      <CardContent className="p-5">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="mt-2 text-3xl font-semibold">{value}</p>
        <p className="mt-2 text-sm text-muted-foreground">{detail}</p>
      </CardContent>
    </Card>
  );
}

function HealthRow({ label, status, detail }: { label: string; status: "綠" | "黃"; detail: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border bg-background/80 px-3 py-2">
      <div>
        <p className="font-medium">{label}</p>
        <p className="text-muted-foreground">{detail}</p>
      </div>
      <Badge variant={status === "綠" ? "default" : "outline"}>{status}</Badge>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <p className="rounded-xl border bg-background/80 p-3 text-sm text-muted-foreground">
      {text}
    </p>
  );
}
