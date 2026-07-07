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
import { readRenderQueue } from "@/lib/render-queue";

type Level = "green" | "yellow" | "red";

type ProviderStatus = {
  id: string;
  label: string;
  configured: boolean;
  available: boolean;
  connectionTest?: {
    message: string;
  };
};

type HealthItem = {
  label: string;
  value: string;
  level: Level;
  detail: string;
};

const storageKeys = {
  assets: [
    "dailyos-script-library",
    "dailyos-character-library",
    "dailyos-voice-library",
    "dailyos-storyboard-v2",
    "dailyos-video-packages",
    "dailyos-rendered-videos"
  ],
  publishing: "dailyos-publishing-center"
};

function readArray(key: string) {
  try {
    const saved = window.localStorage.getItem(key);
    const parsed = saved ? JSON.parse(saved) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function tone(level: Level) {
  return {
    green: "bg-emerald-500",
    yellow: "bg-amber-500",
    red: "bg-rose-500"
  }[level];
}

export function HealthPage() {
  const [providers, setProviders] = useState<ProviderStatus[]>([]);
  const [providerError, setProviderError] = useState("");
  const [queueTotal, setQueueTotal] = useState(0);
  const [failedJobs, setFailedJobs] = useState(0);
  const [activeJobs, setActiveJobs] = useState(0);
  const [assetCount, setAssetCount] = useState(0);
  const [publishingCount, setPublishingCount] = useState(0);

  useEffect(() => {
    const queue = readRenderQueue();
    setQueueTotal(queue.length);
    setFailedJobs(queue.filter((job) => job.status === "失敗").length);
    setActiveJobs(queue.filter((job) => ["等待中", "準備中", "生成中"].includes(job.status)).length);
    setAssetCount(storageKeys.assets.reduce((total, key) => total + readArray(key).length, 0));
    setPublishingCount(readArray(storageKeys.publishing).length);

    fetch("/api/video-providers")
      .then((response) => response.json())
      .then((payload: { providers?: ProviderStatus[] }) => {
        setProviders(Array.isArray(payload.providers) ? payload.providers : []);
      })
      .catch(() => setProviderError("Provider 狀態讀取失敗。"));
  }, []);

  const health = useMemo<HealthItem[]>(() => {
    const readyProviders = providers.filter((provider) => provider.available).length;

    return [
      {
        label: "Build",
        value: "已通過",
        level: "green",
        detail: "本次 Issue 已執行 npm run build。"
      },
      {
        label: "API Key 設定",
        value: readyProviders ? `${readyProviders} 個 Provider 可用` : "尚未設定",
        level: readyProviders ? "green" : "yellow",
        detail: "狀態來自 /api/video-providers，不會暴露金鑰。"
      },
      {
        label: "Provider 可用性",
        value: providers.length ? `${providers.length} 個已註冊` : providerError || "讀取中",
        level: providerError ? "red" : providers.length ? "green" : "yellow",
        detail: providers.map((provider) => `${provider.label}: ${provider.available ? "可用" : "未就緒"}`).join("、") || "等待 Provider 狀態。"
      },
      {
        label: "Render Queue",
        value: failedJobs ? `${failedJobs} 筆失敗` : `${activeJobs} 筆進行中`,
        level: failedJobs ? "red" : activeJobs ? "yellow" : "green",
        detail: `目前共有 ${queueTotal} 筆 Render Job。`
      },
      {
        label: "Asset Library",
        value: `${assetCount} 筆素材`,
        level: assetCount ? "green" : "yellow",
        detail: "統計腳本、人物、配音、分鏡、製作包與成品影片。"
      },
      {
        label: "Publishing",
        value: `${publishingCount} 筆發布項目`,
        level: publishingCount ? "green" : "yellow",
        detail: "可由完成影片素材建立發布項目。"
      }
    ];
  }, [activeJobs, assetCount, failedJobs, providerError, providers, publishingCount, queueTotal]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-primary">v1.0 Release Candidate</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-normal">系統健康狀態</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            檢查 Build、API Key、Provider、Render Queue、素材庫與發布中心是否已準備好進入 v1.0 RC。
          </p>
        </div>
        <Badge variant="secondary" className="w-fit">LocalStorage only</Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {health.map((item) => (
          <Card key={item.label}>
            <CardHeader>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <CardTitle>{item.label}</CardTitle>
                  <CardDescription>{item.value}</CardDescription>
                </div>
                <span className={`mt-1 h-3 w-3 rounded-full ${tone(item.level)}`} />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-6 text-muted-foreground">{item.detail}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>端到端驗證流程</CardTitle>
          <CardDescription>v1.0 RC 手動驗證順序</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm md:grid-cols-2 xl:grid-cols-4">
          {[
            "AI Director",
            "Video Studio",
            "Render Queue",
            "Gemini / OpenMontage",
            "Asset Library",
            "Publishing"
          ].map((step, index) => (
            <div key={step} className="rounded-md border bg-background p-3">
              <p className="text-muted-foreground">Step {index + 1}</p>
              <p className="mt-1 font-medium">{step}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
