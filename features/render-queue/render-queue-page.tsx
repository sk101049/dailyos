"use client";

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
import { readRenderQueue, renderStatuses, writeRenderQueue, type RenderJob } from "@/lib/render-queue";

const RENDERED_VIDEO_KEY = "dailyos-rendered-videos";

type RenderedVideo = {
  id: string;
  title: string;
  name: string;
  fileName: string;
  projectId: string;
  projectName: string;
  importedAt: string;
  provider: string;
  providerJobId: string;
  renderJobId: string;
  tags: string[];
};

function fmt(value: unknown) {
  return typeof value === "string" ? value : JSON.stringify(value, null, 2);
}

function readArray<T>(key: string): T[] {
  try {
    const saved = window.localStorage.getItem(key);
    const parsed = saved ? (JSON.parse(saved) as T[]) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function fileNameFromResponse(response: Response, fallback: string) {
  const header = response.headers.get("content-disposition") ?? "";
  const match = /filename="([^"]+)"/.exec(header);
  return match?.[1] ?? fallback;
}

function isGemini(job: RenderJob) {
  return job.provider === "Gemini";
}

export function RenderQueuePage() {
  const [jobs, setJobs] = useState<RenderJob[]>([]);
  const [workerMessage, setWorkerMessage] = useState<string | null>(null);
  const [isWorking, setIsWorking] = useState(false);

  useEffect(() => {
    setJobs(readRenderQueue());
  }, []);

  const grouped = useMemo(
    () => Array.from(new Set(jobs.map((job) => job.provider))).map((provider) => ({
      provider,
      statuses: renderStatuses.map((status) => ({
        status,
        jobs: jobs.filter((job) => job.provider === provider && job.status === status)
      }))
    })),
    [jobs]
  );

  const nextGeminiJob = jobs.find(
    (job) => isGemini(job) && ["等待中", "準備中"].includes(job.status)
  );

  function persist(next: RenderJob[]) {
    setJobs(next);
    writeRenderQueue(next);
  }

  function updateJob(jobId: string, update: (job: RenderJob) => RenderJob) {
    const next = jobs.map((job) => job.id === jobId ? update(job) : job);
    persist(next);
    return next.find((job) => job.id === jobId);
  }

  function createVideoAsset(job: RenderJob, fileName: string, at = new Date().toISOString()) {
    const videos = readArray<RenderedVideo>(RENDERED_VIDEO_KEY);
    const existing = videos.find((video) => video.renderJobId === job.id || video.providerJobId === job.providerJobId);
    if (existing) {
      const next = videos.map((video) =>
        video.id === existing.id ? { ...video, fileName, importedAt: at } : video
      );
      window.localStorage.setItem(RENDERED_VIDEO_KEY, JSON.stringify(next));
      return { ...existing, fileName, importedAt: at };
    }

    const video: RenderedVideo = {
      id: crypto.randomUUID(),
      title: job.title,
      name: job.title,
      fileName,
      projectId: "",
      projectName: job.project,
      importedAt: at,
      provider: job.provider,
      providerJobId: job.providerJobId ?? "",
      renderJobId: job.id,
      tags: ["Gemini", "自動生成", job.project].filter(Boolean)
    };
    window.localStorage.setItem(RENDERED_VIDEO_KEY, JSON.stringify([video, ...videos]));
    return video;
  }

  async function startGeminiJob(jobId = nextGeminiJob?.id) {
    if (!jobId || isWorking) {
      setWorkerMessage("目前沒有可開始的 Gemini 工作。");
      return;
    }

    setIsWorking(true);
    const startedAt = new Date().toISOString();
    const workingJob = updateJob(jobId, (job) => ({
      ...job,
      status: "生成中",
      updatedAt: startedAt,
      error: "",
      statusHistory: [
        ...job.statusHistory,
        { status: "準備中", at: startedAt, note: "已讀取 Render Job。" },
        { status: "生成中", at: startedAt, note: "正在送出 Gemini 生成請求。" }
      ]
    }));

    try {
      const response = await fetch("/api/video-providers/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          geminiPromptPackage: workingJob?.prompt ?? "",
          aspectRatio: "9:16",
          durationSeconds: "8",
          resolution: "720p"
        })
      });
      const payload = await response.json().catch(() => null);
      const doneAt = new Date().toISOString();
      const ok = response.ok && payload?.ok !== false;
      const providerJobId = typeof payload?.operationName === "string" ? payload.operationName : "";

      updateJob(jobId, (job) => ({
        ...job,
        status: ok ? "生成中" : "失敗",
        updatedAt: doneAt,
        providerJobId: providerJobId || job.providerJobId,
        lastSyncedAt: doneAt,
        response: payload,
        error: ok ? "" : payload?.message ?? `Gemini API 回傳 HTTP ${response.status}`,
        statusHistory: [
          ...job.statusHistory,
          {
            status: ok ? "生成中" : "失敗",
            at: doneAt,
            note: ok ? "Gemini 已接受生成工作，Provider Job ID 已保存。" : "Gemini 生成請求失敗。"
          }
        ]
      }));
      setWorkerMessage(ok ? "Gemini 已開始生成，Provider Job ID 已保存。" : "Gemini 生成失敗，請查看 Provider Response。");
    } catch (error) {
      failJob(jobId, "Gemini 生成請求發生錯誤。", error);
    } finally {
      setIsWorking(false);
    }
  }

  async function syncGeminiStatus(jobId: string) {
    const job = jobs.find((item) => item.id === jobId);
    if (!job?.providerJobId) {
      setWorkerMessage("這筆工作尚未取得 Provider Job ID，請先開始生成。");
      return;
    }

    setIsWorking(true);
    try {
      const response = await fetch(`/api/video-providers/gemini?operationName=${encodeURIComponent(job.providerJobId)}`);
      const payload = await response.json().catch(() => null);
      const syncedAt = new Date().toISOString();
      const ok = response.ok && payload?.ok !== false;
      const done = payload?.status === "done";
      const nextStatus = ok ? done ? "已完成" : "生成中" : "失敗";

      const updated = updateJob(jobId, (current) => ({
        ...current,
        status: nextStatus,
        updatedAt: syncedAt,
        lastSyncedAt: syncedAt,
        response: payload,
        error: ok ? "" : payload?.message ?? `Gemini 狀態同步 HTTP ${response.status}`,
        statusHistory: [
          ...current.statusHistory,
          {
            status: nextStatus,
            at: syncedAt,
            note: ok ? "已同步 Gemini 狀態。" : "Gemini 狀態同步失敗。"
          }
        ]
      }));

      if (updated && done) {
        createVideoAsset(updated, `${updated.title}.mp4`, syncedAt);
      }
      setWorkerMessage(done ? "Gemini 工作已完成，已自動建立影片素材。" : ok ? "Gemini 狀態已更新。" : "Gemini 狀態更新失敗。");
    } catch (error) {
      failJob(jobId, "同步 Gemini 狀態時發生錯誤。", error);
    } finally {
      setIsWorking(false);
    }
  }

  function cancelJob(jobId: string) {
    const canceledAt = new Date().toISOString();
    updateJob(jobId, (job) => ({
      ...job,
      status: "失敗",
      updatedAt: canceledAt,
      error: "使用者已取消生成。",
      statusHistory: [
        ...job.statusHistory,
        { status: "失敗", at: canceledAt, note: "使用者已取消生成。" }
      ]
    }));
    setWorkerMessage("已取消生成。");
  }

  function retryJob(jobId: string) {
    const retriedAt = new Date().toISOString();
    updateJob(jobId, (job) => ({
      ...job,
      status: "等待中",
      updatedAt: retriedAt,
      providerJobId: "",
      lastSyncedAt: "",
      response: null,
      error: "",
      statusHistory: [
        ...job.statusHistory,
        { status: "等待中", at: retriedAt, note: "已重新排入生成佇列。" }
      ]
    }));
    setWorkerMessage("已重新排入生成佇列。");
  }

  async function downloadGeminiVideo(jobId: string) {
    const job = jobs.find((item) => item.id === jobId);
    if (!job?.providerJobId) {
      setWorkerMessage("這筆工作沒有 Provider Job ID，無法下載。");
      return;
    }

    setIsWorking(true);
    try {
      const response = await fetch(`/api/video-providers/gemini?operationName=${encodeURIComponent(job.providerJobId)}&download=1`);
      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        setWorkerMessage(payload?.message ?? `下載失敗，HTTP ${response.status}`);
        return;
      }

      const blob = await response.blob();
      const fileName = fileNameFromResponse(response, `${job.title}.mp4`);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      link.click();
      URL.revokeObjectURL(url);
      createVideoAsset(job, fileName);
      setWorkerMessage("影片已下載，並已保存到素材庫。");
    } catch (error) {
      setWorkerMessage(error instanceof Error ? error.message : "影片下載失敗。");
    } finally {
      setIsWorking(false);
    }
  }

  function failJob(jobId: string, note: string, error: unknown) {
    const failedAt = new Date().toISOString();
    updateJob(jobId, (job) => ({
      ...job,
      status: "失敗",
      updatedAt: failedAt,
      lastSyncedAt: failedAt,
      error: error instanceof Error ? error.message : "未知錯誤",
      statusHistory: [
        ...job.statusHistory,
        { status: "失敗", at: failedAt, note }
      ]
    }));
    setWorkerMessage(note);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-primary">製作中心</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-normal">Render Queue</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            從 Video Studio 建立生成工作，送出 Gemini API、同步狀態，完成後下載影片並保存到素材庫。
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <IssueReportButton page="Render Queue" />
          <Button onClick={() => startGeminiJob()} disabled={isWorking || !nextGeminiJob}>
            {isWorking ? "處理中..." : "開始下一個 Gemini 工作"}
          </Button>
        </div>
      </div>

      {workerMessage ? (
        <p className="rounded-md border bg-background px-3 py-2 text-sm text-muted-foreground">
          {workerMessage}
        </p>
      ) : null}

      <div className="space-y-3">
        {grouped.length === 0 ? (
          <Card>
            <CardContent className="p-5 text-sm text-muted-foreground">
              目前沒有 Render Job。
            </CardContent>
          </Card>
        ) : (
          grouped.map((providerGroup) => (
            <details key={providerGroup.provider} open className="rounded-lg border bg-card">
              <summary className="cursor-pointer px-5 py-4 text-sm font-semibold">
                {providerGroup.provider}（{providerGroup.statuses.reduce((total, group) => total + group.jobs.length, 0)}）
              </summary>
              <div className="space-y-3 border-t p-5">
                {providerGroup.statuses.map((group) => group.jobs.length ? (
                  <details key={group.status} open className="rounded-md border bg-background">
                    <summary className="cursor-pointer px-4 py-3 text-sm font-medium">
                      {group.status}（{group.jobs.length}）
                    </summary>
                    <div className="space-y-3 border-t p-3">
                      {group.jobs.map((job) => (
                        <RenderJobCard
                          key={job.id}
                          job={job}
                          isWorking={isWorking}
                          onStart={() => startGeminiJob(job.id)}
                          onCancel={() => cancelJob(job.id)}
                          onRetry={() => retryJob(job.id)}
                          onSync={() => syncGeminiStatus(job.id)}
                          onDownload={() => downloadGeminiVideo(job.id)}
                        />
                      ))}
                    </div>
                  </details>
                ) : null)}
              </div>
            </details>
          ))
        )}
      </div>
    </div>
  );
}

function RenderJobCard({
  job,
  isWorking,
  onStart,
  onCancel,
  onRetry,
  onSync,
  onDownload
}: {
  job: RenderJob;
  isWorking: boolean;
  onStart: () => void;
  onCancel: () => void;
  onRetry: () => void;
  onSync: () => void;
  onDownload: () => void;
}) {
  return (
    <Card className="shadow-none">
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle>{job.title}</CardTitle>
            <CardDescription>{job.project}</CardDescription>
          </div>
          <Badge variant="outline">{job.provider}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid gap-3 md:grid-cols-5">
          <Info label="專案" value={job.project} />
          <Info label="標題" value={job.title} />
          <Info label="Provider" value={job.provider} />
          <Info label="建立時間" value={job.createdAt} />
          <Info label="最後更新" value={job.updatedAt} />
          <Info label="Provider Job ID" value={job.providerJobId || "尚未送出"} />
          <Info label="最後同步" value={job.lastSyncedAt || "尚未同步"} />
        </div>

        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="text-muted-foreground">狀態</span>
          <Badge>{job.status}</Badge>
          {isGemini(job) && ["等待中", "準備中"].includes(job.status) ? (
            <Button size="sm" variant="outline" onClick={onStart} disabled={isWorking}>
              開始生成
            </Button>
          ) : null}
          {isGemini(job) && job.status === "生成中" ? (
            <Button size="sm" variant="outline" onClick={onCancel} disabled={isWorking}>
              取消生成
            </Button>
          ) : null}
          {isGemini(job) && job.status === "失敗" ? (
            <Button size="sm" variant="outline" onClick={onRetry} disabled={isWorking}>
              重新生成
            </Button>
          ) : null}
          {isGemini(job) && job.providerJobId ? (
            <Button size="sm" variant="outline" onClick={onSync} disabled={isWorking}>
              更新狀態
            </Button>
          ) : null}
          {isGemini(job) && job.status === "已完成" && job.providerJobId ? (
            <Button size="sm" variant="outline" onClick={onDownload} disabled={isWorking}>
              下載影片
            </Button>
          ) : null}
        </div>

        <details className="rounded-md border bg-background">
          <summary className="cursor-pointer px-3 py-2 text-sm font-medium">
            查看 Provider Response
          </summary>
          <div className="grid gap-3 border-t p-3 lg:grid-cols-2">
            <Detail title="Prompt" value={job.prompt} />
            <Detail title="Production Package" value={job.productionPackage} />
            <Detail title="Character" value={job.character} />
            <Detail title="Brand" value={job.brand} />
            <Detail title="Voice" value={job.voice} />
            <Detail title="Provider" value={job.provider} />
            <Detail title="Request" value={job.request} />
            <Detail title="Response" value={job.response} />
            <Detail title="Error" value={job.error || "無"} />
            <Detail title="Status History" value={job.statusHistory} />
          </div>
        </details>
      </CardContent>
    </Card>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border bg-background p-3 text-sm">
      <p className="text-muted-foreground">{label}</p>
      <p className="mt-1 break-words font-medium">{value}</p>
    </div>
  );
}

function Detail({ title, value }: { title: string; value: unknown }) {
  return (
    <div className="rounded-md border bg-secondary/30 p-3">
      <p className="text-sm font-medium">{title}</p>
      <pre className="mt-2 max-h-72 overflow-auto whitespace-pre-wrap break-words text-xs leading-5 text-muted-foreground">
        {fmt(value)}
      </pre>
    </div>
  );
}
