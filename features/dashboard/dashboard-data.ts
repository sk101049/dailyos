import { DEMO_SEEDED_KEY, readIssueReports } from "@/lib/beta-validation";
import { readRenderQueue } from "@/lib/render-queue";

export type DashboardTheme = "Sunrise" | "Aurora" | "Forest" | "Light" | "Dark";
export type DashboardIconKey =
  | "bot"
  | "check"
  | "folder"
  | "health"
  | "library"
  | "list"
  | "megaphone"
  | "plus"
  | "rocket"
  | "shield"
  | "sparkles"
  | "trending"
  | "video";

export type DashboardTask = {
  id: string;
  title: string;
  platform: string;
  status: string;
  publishDate: string;
};

export type DashboardWeeklyPlanItem = {
  id: string;
  dateLabel: string;
  title: string;
  category: string;
  status: string;
};

export type DashboardProject = {
  id: string;
  name: string;
  description?: string;
  brand?: string;
  status?: string;
  updatedAt?: string;
};

export type DashboardRenderedVideo = {
  id: string;
  title?: string;
  name?: string;
  fileName: string;
  projectName: string;
  importedAt: string;
};

export type DashboardProviderStatus = {
  id: string;
  label: string;
  available: boolean;
  configured: boolean;
};

export type DashboardKpi = {
  label: string;
  value: number;
  detail: string;
  icon: DashboardIconKey;
  tone: string;
};

export type DashboardListItem = {
  id: string;
  title: string;
  detail: string;
  status: string;
  icon: DashboardIconKey;
};

export type DashboardHealthItem = {
  id: string;
  label: string;
  value: string;
  icon: DashboardIconKey;
};

export type DashboardQuickStart = {
  title: string;
  detail: string;
  href: string;
  icon: DashboardIconKey;
  tone: string;
};

export type DashboardData = {
  theme: DashboardTheme;
  kpis: DashboardKpi[];
  todayTasks: DashboardListItem[];
  weeklyPlan: DashboardListItem[];
  assistantSuggestions: string[];
  recentProjects: DashboardListItem[];
  renderQueue: DashboardListItem[];
  health: DashboardHealthItem[];
  quickStarts: DashboardQuickStart[];
  isDemoSeeded: boolean;
  issueReportCount: number;
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

const fallbackTasks: DashboardTask[] = [
  { id: "task-script", title: "完成今天的短影音腳本", platform: "DailyOS", status: "待處理", publishDate: today },
  { id: "task-follow-up", title: "追蹤 3 位潛在客戶", platform: "CRM", status: "待處理", publishDate: today },
  { id: "task-appointment", title: "準備明天的預約內容", platform: "行事曆", status: "待確認", publishDate: today }
];

const fallbackWeeklyPlan: DashboardWeeklyPlanItem[] = [
  { id: "plan-ai", dateLabel: "今天", title: "AI Shorts", category: "AI", status: "待腳本" },
  { id: "plan-insurance", dateLabel: "週三", title: "保險觀念短片", category: "保險", status: "待生成" },
  { id: "plan-faq", dateLabel: "週五", title: "房貸 FAQ", category: "房地產", status: "待發布" }
];

const assistantSuggestions = ["ChatGPT Shorts", "Gemini 教學", "房貸 FAQ"];

const quickStarts: DashboardQuickStart[] = [
  { title: "AI 幫我規劃影片", detail: "進入 AI Director", href: "/director", icon: "bot", tone: "from-indigo-500 to-violet-500" },
  { title: "查看熱門趨勢", detail: "找今天的題材", href: "/trends", icon: "trending", tone: "from-sky-500 to-blue-500" },
  { title: "繼續上次專案", detail: "回到專案中心", href: "/projects", icon: "folder", tone: "from-amber-400 to-orange-500" },
  { title: "建立新專案", detail: "整理內容資產", href: "/projects", icon: "plus", tone: "from-emerald-500 to-teal-500" }
];

export const dashboardThemes: DashboardTheme[] = ["Sunrise", "Aurora", "Forest", "Light", "Dark"];

export function themeFromStorage(value: string | null): DashboardTheme {
  const normalized = (value ?? "sunrise").toLowerCase();
  return dashboardThemes.find((theme) => theme.toLowerCase() === normalized) ?? "Sunrise";
}

export function writeDashboardTheme(theme: DashboardTheme) {
  const value = theme.toLowerCase();
  window.localStorage.setItem(THEME_KEY, value);
  document.documentElement.dataset.theme = value;
}

export async function loadDashboardData(): Promise<DashboardData> {
  const tasks = readTasks();
  const weeklyPlan = readArray<DashboardWeeklyPlanItem>(WEEKLY_PLAN_KEY, fallbackWeeklyPlan);
  const renderJobs = readRenderQueue();
  const projects = readArray<DashboardProject>(PROJECTS_KEY);
  const renderedVideos = readArray<DashboardRenderedVideo>(RENDERED_VIDEO_KEY);
  const brandCount = readArray<unknown>(BRAND_KEY).length;
  const workflowCount = readArray<unknown>(WORKFLOW_KEY).length;
  const assetCount = ASSET_KEYS.reduce((total, key) => total + readArray<unknown>(key).length, 0);
  const providerStatuses = await loadProviderStatuses();
  const visibleTasks = tasks.filter((task) => task.publishDate === today);
  const taskList = visibleTasks.length ? visibleTasks : tasks;
  const monthPublished = renderedVideos.slice(0, 5).length;
  const providerOnline = providerStatuses.filter((item) => item.available).length;
  const isDemoSeeded = Boolean(window.localStorage.getItem(DEMO_SEEDED_KEY));
  const issueReportCount = readIssueReports().length;

  return {
    theme: themeFromStorage(window.localStorage.getItem(THEME_KEY)),
    kpis: [
      { label: "進行中專案", value: projects.length, detail: "目前內容專案", icon: "folder", tone: "from-indigo-500 to-violet-500" },
      { label: "今日任務", value: taskList.length, detail: "待處理與待確認", icon: "list", tone: "from-sky-500 to-blue-500" },
      { label: "生成影片", value: renderJobs.length, detail: "Render Queue 工作", icon: "video", tone: "from-amber-400 to-orange-500" },
      { label: "本月發布", value: monthPublished, detail: "完成影片資產", icon: "megaphone", tone: "from-emerald-500 to-teal-500" },
      { label: "素材數", value: assetCount, detail: "腳本、人物、配音、分鏡", icon: "library", tone: "from-pink-500 to-rose-500" }
    ],
    todayTasks: taskList.slice(0, 4).map((task) => ({
      id: task.id,
      title: task.title,
      detail: `${task.platform} · ${task.publishDate}`,
      status: task.status,
      icon: "check"
    })),
    weeklyPlan: (weeklyPlan.length ? weeklyPlan : fallbackWeeklyPlan).slice(0, 4).map((item) => ({
      id: item.id,
      title: item.title,
      detail: `${item.dateLabel} · ${item.category}`,
      status: item.status,
      icon: "video"
    })),
    assistantSuggestions,
    recentProjects: projects.slice(0, 4).map((project) => ({
      id: project.id,
      title: project.name,
      detail: `${project.brand || "未套用品牌"} · ${formatDate(project.updatedAt)}`,
      status: project.status || "草稿",
      icon: "folder"
    })),
    renderQueue: renderJobs.slice(0, 5).map((job) => ({
      id: job.id,
      title: job.title,
      detail: `${job.provider} · ${formatDate(job.updatedAt)}`,
      status: job.status,
      icon: "rocket"
    })),
    health: [
      { id: "build", label: "Build", value: "正常", icon: "shield" },
      { id: "smoke", label: "Smoke Test", value: isDemoSeeded ? "正常" : "待建立 Demo", icon: "health" },
      { id: "provider", label: "Provider", value: `${providerOnline} 個可用`, icon: "rocket" },
      { id: "workflow", label: "Workflow", value: `${workflowCount} 個模板`, icon: "sparkles" },
      { id: "reports", label: "問題回報", value: `${issueReportCount} 筆`, icon: "list" }
    ],
    quickStarts,
    isDemoSeeded,
    issueReportCount
  };
}

function readTasks() {
  return readArray<DashboardTask>(TASKS_KEY, fallbackTasks);
}

function writeTasks(tasks: DashboardTask[]) {
  window.localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
}

async function loadProviderStatuses() {
  try {
    const response = await fetch("/api/video-providers");
    const payload = (await response.json()) as { providers?: DashboardProviderStatus[] };
    return Array.isArray(payload.providers) ? payload.providers : [];
  } catch {
    return [];
  }
}

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
