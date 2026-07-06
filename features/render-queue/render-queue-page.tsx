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

function fmt(value: unknown) {
  return typeof value === "string" ? value : JSON.stringify(value, null, 2);
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
    (job) => job.provider === "Gemini" && ["等待中", "準備中"].includes(job.status)
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

  async function runGeminiWorker(jobId = nextGeminiJob?.id) {
    if (!jobId || isWorking) {
      setWorkerMessage("目前沒有可執行的 Gemini 工作。");
      return;
    }

    setIsWorking(true);
    setWorkerMessage("Gemini 工作者已開始處理。");
    const startedAt = new Date().toISOString();
    const workingJob = updateJob(jobId, (job) => ({
      ...job,
      status: "生成中",
      updatedAt: startedAt,
      statusHistory: [
        ...job.statusHistory,
        { status: "準備中", at: startedAt, note: "Gemini 工作者已讀取工作。" },
        { status: "生成中", at: startedAt, note: "已送出 Gemini 生成請求。" }
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
            note: ok ? "Gemini 已接受生成工作，等待手動更新狀態。" : "Gemini 生成請求失敗。"
          }
        ]
      }));
      setWorkerMessage(ok ? "Gemini 工作者已送出生成，服務商工作 ID 已儲存。" : "Gemini 工作者執行失敗，詳情已寫入工作。");
    } catch (error) {
      const failedAt = new Date().toISOString();
      updateJob(jobId, (job) => ({
        ...job,
        status: "失敗",
        updatedAt: failedAt,
        response: null,
        error: error instanceof Error ? error.message : "未知錯誤",
        statusHistory: [
          ...job.statusHistory,
          { status: "失敗", at: failedAt, note: "Gemini 工作者發生網路或執行錯誤。" }
        ]
      }));
      setWorkerMessage("Gemini 工作者執行失敗，詳情已寫入工作。");
    } finally {
      setIsWorking(false);
    }
  }

  async function syncGeminiStatus(jobId: string) {
    const job = jobs.find((item) => item.id === jobId);
    if (!job?.providerJobId) {
      setWorkerMessage("這筆工作尚未有 Provider Job ID，請先送出生成。");
      return;
    }

    setIsWorking(true);
    try {
      const response = await fetch(`/api/video-providers/gemini?operationName=${encodeURIComponent(job.providerJobId)}`);
      const payload = await response.json().catch(() => null);
      const syncedAt = new Date().toISOString();
      const ok = response.ok && payload?.ok !== false;
      const done = payload?.status === "done";

      updateJob(jobId, (current) => ({
        ...current,
        status: ok ? done ? "已完成" : "生成中" : "失敗",
        updatedAt: syncedAt,
        lastSyncedAt: syncedAt,
        response: payload,
        error: ok ? "" : payload?.message ?? `Gemini 狀態同步 HTTP ${response.status}`,
        statusHistory: [
          ...current.statusHistory,
          {
            status: ok ? done ? "已完成" : "生成中" : "失敗",
            at: syncedAt,
            note: ok ? "已手動同步 Gemini 狀態。" : "Gemini 狀態同步失敗。"
          }
        ]
      }));
      setWorkerMessage(ok ? "Gemini 狀態已更新。" : "Gemini 狀態更新失敗。");
    } catch (error) {
      const failedAt = new Date().toISOString();
      updateJob(jobId, (current) => ({
        ...current,
        status: "失敗",
        updatedAt: failedAt,
        lastSyncedAt: failedAt,
        error: error instanceof Error ? error.message : "未知錯誤",
        statusHistory: [
          ...current.statusHistory,
          { status: "失敗", at: failedAt, note: "手動同步 Gemini 狀態時發生錯誤。" }
        ]
      }));
      setWorkerMessage("Gemini 狀態更新失敗。");
    } finally {
      setIsWorking(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-primary">生成佇列</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-normal">生成佇列</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            管理所有 AI 影片生成工作。可混合 Gemini / Veo 與 OpenMontage，不啟動背景服務。
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <IssueReportButton page="Render Queue" />
          <Button onClick={() => runGeminiWorker()} disabled={isWorking || !nextGeminiJob}>
            {isWorking ? "執行中..." : "執行下一個 Gemini 工作"}
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
              目前沒有生成工作。
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
                  <Card key={job.id} className="shadow-none">
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
                        <Info label="服務商" value={job.provider} />
                        <Info label="建立時間" value={job.createdAt} />
                        <Info label="最後更新" value={job.updatedAt} />
                        <Info label="服務商工作 ID" value={job.providerJobId ?? "尚未送出"} />
                        <Info label="最後同步" value={job.lastSyncedAt ?? "尚未同步"} />
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-muted-foreground">狀態</span>
                        <Badge>{job.status}</Badge>
                        {job.provider === "Gemini" && ["等待中", "準備中"].includes(job.status) ? (
                          <Button size="sm" variant="outline" onClick={() => runGeminiWorker(job.id)} disabled={isWorking}>
                            送出生成
                          </Button>
                        ) : null}
                        {job.provider === "Gemini" && job.providerJobId ? (
                          <Button size="sm" variant="outline" onClick={() => syncGeminiStatus(job.id)} disabled={isWorking}>
                            更新狀態
                          </Button>
                        ) : null}
                      </div>
                      <details className="rounded-md border bg-background">
                        <summary className="cursor-pointer px-3 py-2 text-sm font-medium">
                          查看詳情
                        </summary>
                        <div className="grid gap-3 border-t p-3 lg:grid-cols-2">
                          <Detail title="提示詞" value={job.prompt} />
                          <Detail title="製作包" value={job.productionPackage} />
                          <Detail title="人物" value={job.character} />
                          <Detail title="品牌" value={job.brand} />
                          <Detail title="聲音" value={job.voice} />
                          <Detail title="服務商" value={job.provider} />
                          <Detail title="請求" value={job.request} />
                          <Detail title="回應" value={job.response} />
                          <Detail title="錯誤" value={job.error || "無"} />
                          <Detail title="狀態紀錄" value={job.statusHistory} />
                        </div>
                      </details>
                    </CardContent>
                  </Card>
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
