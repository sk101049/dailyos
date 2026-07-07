"use client";

import Link from "next/link";
import type React from "react";
import { useEffect, useState } from "react";
import {
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
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Video
} from "lucide-react";
import { IssueReportButton } from "@/components/issue-report-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DashboardCard } from "@/components/ui/dashboard-card";
import { GlassCard } from "@/components/ui/glass-card";
import { GradientButton } from "@/components/ui/gradient-button";
import { HeroBanner } from "@/components/ui/hero-banner";
import { QuickAction } from "@/components/ui/quick-action";
import { StatCard } from "@/components/ui/stat-card";
import { Topbar } from "@/components/ui/topbar";
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

  const theme = dashboard?.theme ?? "Sunrise";
  const hero = (
    <HeroBanner
      actions={(
        <Topbar
          theme={theme}
          themes={dashboardThemes}
          onThemeChange={changeTheme}
          onNotify={() => showToast("目前沒有新通知")}
        />
      )}
    />
  );

  if (loadState === "error") {
    return (
      <div className="space-y-6">
        {hero}
        <GlassCard className="p-6">
          <div className="space-y-4">
            <p className="text-lg font-semibold">儀表板資料載入失敗</p>
            <p className="text-sm text-muted-foreground">{error}</p>
            <GradientButton onClick={() => void refreshDashboard()}>
              重新載入
            </GradientButton>
          </div>
        </GlassCard>
      </div>
    );
  }

  if (loadState === "loading" || !dashboard) {
    return (
      <div className="space-y-6">
        {hero}
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {Array.from({ length: 5 }).map((_, index) => (
            <GlassCard key={index} className="overflow-hidden p-5">
              <div className="v1-skeleton h-12 w-12 rounded-2xl" />
              <div className="v1-skeleton mt-5 h-3 w-24 rounded-full" />
              <div className="v1-skeleton mt-3 h-9 w-16 rounded-full" />
              <div className="v1-skeleton mt-3 h-3 w-32 rounded-full" />
            </GlassCard>
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

      {hero}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {dashboard.kpis.map((item) => (
          <StatCard key={item.label} {...item} icon={iconMap[item.icon]} />
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1fr_1fr_360px]">
        <DashboardCard title="今日任務" action="查看全部" href="/calendar">
          {dashboard.todayTasks.length ? (
            dashboard.todayTasks.map((task) => (
              <ListRow key={task.id} {...task} icon={iconMap[task.icon]} />
            ))
          ) : (
            <EmptyState text="今天沒有待處理任務。" />
          )}
        </DashboardCard>

        <DashboardCard title="本週創作計畫" action="查看 Workflow" href="/workflow">
          {dashboard.weeklyPlan.length ? (
            dashboard.weeklyPlan.map((item) => (
              <ListRow key={item.id} {...item} icon={iconMap[item.icon]} />
            ))
          ) : (
            <EmptyState text="尚未建立本週創作計畫。" />
          )}
        </DashboardCard>

        <GlassCard className="overflow-hidden p-5">
          <div className="mb-4 flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            <h3 className="text-base font-semibold leading-none">AI 助理</h3>
          </div>
          <div className="space-y-4">
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
            <GradientButton asChild className="w-full">
              <Link href="/director">開始創作</Link>
            </GradientButton>
          </div>
        </GlassCard>
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <DashboardCard title="最近專案" action="前往專案" href="/projects">
          {dashboard.recentProjects.length ? (
            dashboard.recentProjects.map((project) => (
              <ListRow key={project.id} {...project} icon={iconMap[project.icon]} />
            ))
          ) : (
            <EmptyState text="尚未建立專案，從 AI Director 開始即可。" />
          )}
        </DashboardCard>

        <DashboardCard title="最近 Render Queue" action="查看佇列" href="/render-queue">
          {dashboard.renderQueue.length ? (
            dashboard.renderQueue.map((job) => (
              <ListRow key={job.id} {...job} icon={iconMap[job.icon]} />
            ))
          ) : (
            <EmptyState text="目前沒有生成工作。" skeleton />
          )}
        </DashboardCard>

        <DashboardCard title="最近完成影片" action="前往素材庫" href="/assets">
          {dashboard.completedVideos.length ? (
            dashboard.completedVideos.map((video) => (
              <ListRow key={video.id} {...video} icon={iconMap[video.icon]} />
            ))
          ) : (
            <EmptyState text="尚未完成生成影片。" skeleton />
          )}
        </DashboardCard>

        <DashboardCard title="最近失敗工作" action="查看佇列" href="/render-queue">
          {dashboard.failedJobs.length ? (
            dashboard.failedJobs.map((job) => (
              <ListRow key={job.id} {...job} icon={iconMap[job.icon]} />
            ))
          ) : (
            <EmptyState text="目前沒有失敗工作。" skeleton />
          )}
        </DashboardCard>

        <DashboardCard title="系統健康" action="回報問題" href="/dashboard">
          {dashboard.health.map((item) => (
            <HealthRow key={item.id} {...item} icon={iconMap[item.icon]} />
          ))}
          <IssueReportButton page="Dashboard" />
        </DashboardCard>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {dashboard.quickStarts.map((item) => (
          <QuickAction key={item.title} {...item} icon={iconMap[item.icon]} />
        ))}
      </section>
    </div>
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

function EmptyState({ text, skeleton = false }: { text: string; skeleton?: boolean }) {
  return (
    <div className="rounded-2xl border bg-white/68 p-4 text-sm text-muted-foreground">
      {skeleton ? <div className="v1-skeleton mb-3 h-3 w-32 rounded-full" /> : null}
      {text}
    </div>
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
