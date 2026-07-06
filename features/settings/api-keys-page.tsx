"use client";

import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";

type ProviderStatus = "not_configured" | "configured" | "coming_soon";

type ProviderField = {
  id: string;
  name: string;
  envVars: string[];
  status: ProviderStatus;
  note: string;
};

type VideoProviderStatus = {
  id: string;
  configured: boolean;
};

type EnvHelper = {
  projectRoot: string;
  envPath: string;
  openCommand: string;
  template: string;
  canWriteFile: boolean;
  note: string;
};

const providers: ProviderField[] = [
  {
    id: "openai",
    name: "OpenAI",
    envVars: ["OPENAI_API_KEY"],
    status: "not_configured",
    note: "腳本生成只讀取伺服器端環境變數。"
  },
  {
    id: "gemini",
    name: "Gemini / Google AI Studio",
    envVars: ["GEMINI_API_KEY", "GOOGLE_AI_API_KEY", "GOOGLE_API_KEY"],
    status: "not_configured",
    note: "狀態來自伺服器端 Gemini 影片 adapter。"
  },
  {
    id: "elevenlabs",
    name: "ElevenLabs",
    envVars: ["ELEVENLABS_API_KEY"],
    status: "coming_soon",
    note: "未來配音整合預留。"
  },
  {
    id: "azure-speech",
    name: "Azure Speech",
    envVars: ["AZURE_SPEECH_KEY", "AZURE_SPEECH_REGION"],
    status: "coming_soon",
    note: "未來語音整合預留。"
  },
  {
    id: "runway",
    name: "Runway",
    envVars: ["RUNWAY_API_KEY"],
    status: "coming_soon",
    note: "未來影片服務預留。"
  },
  {
    id: "kling",
    name: "Kling",
    envVars: ["KLING_API_KEY"],
    status: "coming_soon",
    note: "未來影片服務預留。"
  },
  {
    id: "pika",
    name: "Pika",
    envVars: ["PIKA_API_KEY"],
    status: "coming_soon",
    note: "未來影片服務預留。"
  },
  {
    id: "custom",
    name: "自訂 Provider",
    envVars: ["CUSTOM_VIDEO_PROVIDER_API_KEY"],
    status: "coming_soon",
    note: "保留給本機 provider 實驗。"
  }
];

function statusLabel(status: ProviderStatus) {
  if (status === "configured") {
    return "已設定";
  }

  if (status === "coming_soon") {
    return "即將支援";
  }

  return "未設定";
}

function envTemplate(items: ProviderField[]) {
  return items
    .flatMap((provider) => provider.envVars.map((name) => `${name}=`))
    .join("\n");
}

export function ApiKeysPage() {
  const [values, setValues] = useState<Record<string, string>>({});
  const [visible, setVisible] = useState<Record<string, boolean>>({});
  const [message, setMessage] = useState<string | null>(null);
  const [geminiConfigured, setGeminiConfigured] = useState(false);
  const [envHelper, setEnvHelper] = useState<EnvHelper | null>(null);

  useEffect(() => {
    void loadGeminiStatus();
    void loadEnvHelper();
  }, []);

  const providerRows = useMemo<ProviderField[]>(
    () =>
      providers.map((provider) =>
        provider.id === "gemini"
          ? {
              ...provider,
              status: geminiConfigured ? "configured" : "not_configured"
            }
          : provider
      ),
    [geminiConfigured]
  );

  const template = useMemo(() => envTemplate(providers), []);

  async function loadGeminiStatus() {
    try {
      const response = await fetch("/api/video-providers");
      const payload = (await response.json()) as { providers?: VideoProviderStatus[] };
      const gemini = payload.providers?.find((item) => item.id === "gemini");
      setGeminiConfigured(Boolean(gemini?.configured));
    } catch {
      setGeminiConfigured(false);
    }
  }

  async function loadEnvHelper() {
    try {
      const response = await fetch("/api/env-helper");
      const payload = (await response.json()) as EnvHelper;
      setEnvHelper(payload);
    } catch {
      setEnvHelper(null);
    }
  }

  async function copyText(value: string, success: string) {
    if (!navigator.clipboard?.writeText) {
      setMessage("剪貼簿不可用，請手動複製下方內容。");
      return;
    }

    await navigator.clipboard.writeText(value);
    setMessage(success);
  }

  async function copyTemplate() {
    await copyText(envHelper?.template ?? template, ".env.local 範本已複製。");
  }

  function updateValue(key: string, value: string) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  function toggleVisible(key: string) {
    setVisible((current) => ({ ...current, [key]: !current[key] }));
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-primary">設定</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-normal">
            API Key 設定
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            集中管理未來 provider 的設定欄位。MVP 只提供本機填寫與 .env.local 範本，不會送出或使用瀏覽器輸入的金鑰。
          </p>
        </div>
        <Button variant="outline" onClick={copyTemplate}>
          複製 .env.local 範本
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>.env.local 檔案位置</CardTitle>
          <CardDescription>
            這裡只顯示路徑與空白範本，不會讀取或暴露已存在的 API key。
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2">
            <Info label="專案根目錄" value={envHelper?.projectRoot ?? "偵測中..."} />
            <Info label="預期 .env.local 路徑" value={envHelper?.envPath ?? "偵測中..."} />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={() => copyText(envHelper?.envPath ?? "", ".env.local 路徑已複製。")}
              disabled={!envHelper}
            >
              複製 .env.local 路徑
            </Button>
            <Button
              variant="outline"
              onClick={() => copyText(envHelper?.openCommand ?? "", "PowerShell 開啟指令已複製。")}
              disabled={!envHelper}
            >
              複製 PowerShell 開啟指令
            </Button>
            <Button variant="outline" onClick={copyTemplate}>
              複製完整 .env.local 範本
            </Button>
          </div>
          <div className="rounded-md border bg-secondary/30 p-3 text-sm leading-6 text-muted-foreground">
            <p>1. 將範本貼到 `.env.local`。</p>
            <p>2. 填入需要的 API key 並儲存檔案。</p>
            <p>3. 重新啟動 `npm run dev`。</p>
            <p className="mt-2">{envHelper?.note ?? "目前不支援直接寫入檔案，請手動貼上範本。"}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>安全提醒</CardTitle>
          <CardDescription>請把正式整合放在伺服器端環境變數。</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm text-muted-foreground md:grid-cols-3">
          <p className="rounded-md border bg-secondary/30 p-3">
            瀏覽器內輸入或暫存的金鑰不適合正式環境，不能視為安全儲存。
          </p>
          <p className="rounded-md border bg-secondary/30 p-3">
            正式 provider 整合應使用伺服器端 `.env.local` 或部署平台的環境變數。
          </p>
          <p className="rounded-md border bg-secondary/30 p-3">
            永遠不要把 API key commit 到 git，也不要貼到 issue、PR 或公開文件。
          </p>
        </CardContent>
      </Card>

      {message ? (
        <p className="rounded-md border bg-background px-3 py-2 text-sm text-muted-foreground">
          {message}
        </p>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-2">
        {providerRows.map((provider) => (
          <Card key={provider.id}>
            <CardHeader>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <CardTitle>{provider.name}</CardTitle>
                  <CardDescription>{provider.note}</CardDescription>
                </div>
                <Badge variant={provider.status === "configured" ? "default" : "outline"}>
                  {statusLabel(provider.status)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {provider.envVars.map((envVar) => (
                <label key={envVar} className="space-y-2">
                  <span className="text-sm font-medium">{envVar}</span>
                  <div className="flex gap-2">
                    <input
                      className="h-10 min-w-0 flex-1 rounded-md border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      type={visible[envVar] ? "text" : "password"}
                      value={values[envVar] ?? ""}
                      placeholder="只供本機備註，不會送出"
                      onChange={(event) => updateValue(envVar, event.target.value)}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => toggleVisible(envVar)}
                    >
                      {visible[envVar] ? "隱藏" : "顯示"}
                    </Button>
                  </div>
                </label>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>.env.local 範本</CardTitle>
          <CardDescription>
            將需要的 key 設定在伺服器端。這個頁面的輸入欄不會被自動 provider 呼叫使用。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <pre className="max-h-80 overflow-auto whitespace-pre-wrap break-words rounded-md bg-secondary/40 p-3 text-sm leading-6 text-muted-foreground">
            {envHelper?.template ?? template}
          </pre>
        </CardContent>
      </Card>
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
