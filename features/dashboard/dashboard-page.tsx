"use client";

import Link from "next/link";
import type React from "react";
import { useEffect, useState } from "react";
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
import {
  dashboardThemes,
  loadDashboardData,
  writeDashboardTheme,
  type DashboardData,
  type DashboardIconKey,
  type DashboardTheme
} from "@/features/dashboard/dashboard-data";

type Icon = React.ComponentType<{ className?: string }>;
type LoadState = "loading" | "ready" | "error";

const iconMap: Record<DashboardIconKey, Icon> = {
  bot: Bot,
  check: CheckCircle2,
  folder: FolderKanban,
  health: HeartPulse,
  library: LibraryBig,
  list: ListChecks,
  megaphone: Megaphone,
  plus: Plus,
  rocket: Rocket,
  shield: ShieldCheck,
  sparkles: Sparkles,
  trending: TrendingUp,
  video: Video
};

export function DashboardPage() {
  const [toast, setToast] = useState("");
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [error, setError] = useState("");
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);

  useEffect(() => {
    void refreshDashboard();
  }, []);

  async function refreshDashboard() {
    try {
      setLoadState("loading");
      setError("");
      setDashboard(await loadDashboardData());
      setLoadState("ready");
    } catch (caught) {
      setLoadState("error");
      setError(caught instanceof Error ? caught.message : "儀表板資料載入失敗");
    }
  }

  function changeTheme(nextTheme: DashboardTheme) {
    writeDashboardTheme(nextTheme);
    setDashboard((current) => current ? { ...current, theme: nextTheme } : current);
  }

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 2200);
  }

  if (loadState === "error") {
    return (
      <div className="space-y-6">
        <DashboardHero
          theme="Sunrise"
          onThemeChange={changeTheme}
          onNotify={() => showToast("目前沒有新通知")}
        />
        <Card className="v1-card">
          <CardContent className="space-y-4 p-6">
            <p className="text-lg font-semibold">儀表板資料載入失敗</p>
            <p className="text-sm text-muted-foreground">{error}</p>
            <Button className="v1-gradient-button rounded-2xl" onClick={refreshDashboard}>
              重新載入
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loadState === "loading" || !dashboard) {
    return (
      <div className="space-y-6">
        <DashboardHero
          theme="Sunrise"
          onThemeChange={changeTheme}
          onNotify={() => showToast("目前沒有新通知")}
        />
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {Array.from({ length: 5 }).map((_, index) => (
            <Card key={index} className="v1-card overflow-hidden">
              <CardContent className="p-5">
                <div className="v1-skeleton h-12 w-12 rounded-2xl" />
                <div className="v1-skeleton mt-5 h-3 w-24 rounded-full" />
                <div className="v1-skeleton mt-3 h-9 w-16 rounded-full" />
                <div className="v1-skeleton mt-3 h-3 w-32 rounded-full" />
              </CardContent>
            </Card>
          ))}
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {toast ? (
        <div className="v1-toast fixed right-6 top-6 z-50 rounded-3xl border bg-white/90 px-4 py-3 text-sm font-medium shadow-2xl backdrop-blur">
          {toast}
        </div>
      ) : null}

      <DashboardHero
        theme={dashboard.theme}
        onThemeChange={changeTheme}
        onNotify={() => showToast("目前沒有新通知")}
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {dashboard.kpis.map((item) => (
          <KpiCard key={item.label} {...item} icon={iconMap[item.icon]} />
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1fr_1fr_360px]">
        <Panel title="今日任務" action="查看全部" href="/calendar">
          {dashboard.todayTasks.length ? (
            dashboard.todayTasks.map((task) => (
              <ListRow key={task.id} {...task} icon={iconMap[task.icon]} />
            ))
          ) : (
            <EmptyState text="今天沒有待處理任務。" />
          )}
        </Panel>

        <Panel title="本週創作計畫" action="查看 Workflow" href="/workflow">
          {dashboard.weeklyPlan.length ? (
            dashboard.weeklyPlan.map((item) => (
              <ListRow key={item.id} {...item} icon={iconMap[item.icon]} />
            ))
          ) : (
            <EmptyState text="尚未建立本週創作計畫。" />
          )}
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
              {dashboard.assistantSuggestions.length ? (
                dashboard.assistantSuggestions.map((item) => (
                  <div key={item} className="flex items-center gap-2 rounded-2xl bg-white/72 px-3 py-2 text-sm">
                    <Sparkles className="h-4 w-4 text-primary" />
                    {item}
                  </div>
                ))
              ) : (
                <EmptyState text="目前沒有 AI 建議。" />
              )}
            </div>
            <Button asChild className="v1-gradient-button w-full rounded-2xl">
              <Link href="/director">開始創作</Link>
            </Button>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <Panel title="最近專案" action="前往專案" href="/projects">
          {dashboard.recentProjects.length ? (
            dashboard.recentProjects.map((project) => (
              <ListRow key={project.id} {...project} icon={iconMap[project.icon]} />
            ))
          ) : (
            <EmptyState text="尚未建立專案，從 AI Director 開始即可。" />
          )}
        </Panel>

        <Panel title="最近 Render Queue" action="查看佇列" href="/render-queue">
          {dashboard.renderQueue.length ? (
            dashboard.renderQueue.map((job) => (
              <ListRow key={job.id} {...job} icon={iconMap[job.icon]} />
            ))
          ) : (
            <EmptyState text="目前沒有生成工作。" skeleton />
          )}
        </Panel>

        <Panel title="系統健康" action="回報問題" href="/dashboard">
          {dashboard.health.map((item) => (
            <HealthRow key={item.id} {...item} icon={iconMap[item.icon]} />
          ))}
          <IssueReportButton page="Dashboard" />
        </Panel>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {dashboard.quickStarts.map((item) => (
          <QuickStart key={item.title} {...item} icon={iconMap[item.icon]} />
        ))}
      </section>
    </div>
  );
}

function DashboardHero({
  theme,
  onThemeChange,
  onNotify
}: {
  theme: DashboardTheme;
  onThemeChange: (theme: DashboardTheme) => void;
  onNotify: () => void;
}) {
  return (
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
          <Button variant="outline" size="icon" className="h-12 w-12 rounded-2xl bg-white/80" onClick={onNotify}>
            <Bell className="h-5 w-5" />
          </Button>
          <Button variant="outline" size="icon" className="h-12 w-12 rounded-2xl bg-white/80">
            <UserRound className="h-5 w-5" />
          </Button>
          <select
            value={theme}
            onChange={(event) => onThemeChange(event.target.value as DashboardTheme)}
            className="h-12 rounded-2xl border bg-white/80 px-3 text-sm font-medium outline-none"
            aria-label="Theme"
          >
            {dashboardThemes.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </div>
      </div>
    </header>
  );
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
