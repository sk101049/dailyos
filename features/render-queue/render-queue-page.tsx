"use client";

import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { readRenderQueue, renderStatuses, type RenderJob } from "@/lib/render-queue";

function fmt(value: unknown) {
  return typeof value === "string" ? value : JSON.stringify(value, null, 2);
}

export function RenderQueuePage() {
  const [jobs, setJobs] = useState<RenderJob[]>([]);

  useEffect(() => {
    setJobs(readRenderQueue());
  }, []);

  const grouped = useMemo(
    () => renderStatuses.map((status) => ({
      status,
      jobs: jobs.filter((job) => job.status === status)
    })),
    [jobs]
  );

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-primary">生成佇列</p>
        <h2 className="mt-2 text-3xl font-semibold tracking-normal">生成佇列</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          管理所有 AI 影片生成工作。這裡只讀寫本機佇列，不啟動背景生成。
        </p>
      </div>

      <div className="space-y-3">
        {grouped.map((group) => (
          <details key={group.status} open className="rounded-lg border bg-card">
            <summary className="cursor-pointer px-5 py-4 text-sm font-semibold">
              {group.status}（{group.jobs.length}）
            </summary>
            <div className="space-y-3 border-t p-5">
              {group.jobs.length === 0 ? (
                <p className="text-sm text-muted-foreground">目前沒有生成工作。</p>
              ) : (
                group.jobs.map((job) => (
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
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-muted-foreground">狀態</span>
                        <Badge>{job.status}</Badge>
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
                ))
              )}
            </div>
          </details>
        ))}
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
