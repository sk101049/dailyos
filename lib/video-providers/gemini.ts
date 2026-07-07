import type { VideoProviderAdapter, VideoProviderStatus } from "./types";

const envVars = ["GEMINI_API_KEY", "GOOGLE_AI_API_KEY", "GOOGLE_API_KEY"];
const baseUrl = "https://generativelanguage.googleapis.com/v1beta";
const defaultVeoModel = "veo-3.1-generate-preview";

function hasGeminiKey() {
  return envVars.some((name) => Boolean(process.env[name]));
}

function getGeminiKey() {
  return envVars.map((name) => process.env[name]).find(Boolean);
}

function isVideoApiEnabled() {
  return process.env.GEMINI_VIDEO_API_ENABLED !== "false";
}

type GeminiVeoVideoInput = {
  prompt: string;
  model?: string;
  aspectRatio?: "16:9" | "9:16";
  durationSeconds?: "4" | "6" | "8";
  resolution?: "720p" | "1080p" | "4k";
  personGeneration?: "allow_all" | "allow_adult" | "dont_allow";
};

type GeminiDownloadResult =
  | {
      ok: true;
      fileName: string;
      contentType: string;
      blob: Blob;
      sourceUri: string;
    }
  | {
      ok: false;
      status: "not_configured" | "invalid_request" | "not_found" | "api_error" | "timeout";
      message: string;
      details?: unknown;
      httpStatus?: number;
    };

export type GeminiVeoVideoResult =
  | {
      ok: true;
      status: "submitted";
      model: string;
      operationName: string;
      operation: unknown;
    }
  | {
      ok: false;
      status: "feature_disabled" | "not_configured" | "invalid_request" | "api_error";
      message: string;
      details?: unknown;
      httpStatus?: number;
    };

export type GeminiOperationResult =
  | {
      ok: true;
      status: "running" | "done";
      operation: unknown;
    }
  | {
      ok: false;
      status: "not_configured" | "invalid_request" | "api_error";
      message: string;
      details?: unknown;
      httpStatus?: number;
    };

function geminiErrorMessage(httpStatus: number) {
  const messages: Record<number, string> = {
    401: "Gemini API 金鑰無效或未授權，請檢查伺服器端 API Key。",
    403: "Gemini API 權限不足，請確認專案已開通 Veo / Gemini 影片生成權限。",
    404: "找不到 Gemini 工作或輸出影片，可能已過期或 Job ID 不正確。",
    429: "Gemini API 目前達到速率限制，請稍後再試。",
    500: "Gemini 服務暫時發生錯誤，請稍後重試。"
  };
  return messages[httpStatus] ?? `Gemini API 回傳 HTTP ${httpStatus}。`;
}

function findVideoUri(value: unknown): string {
  if (!value || typeof value !== "object") return "";
  if ("uri" in value && typeof value.uri === "string" && /^https?:\/\//.test(value.uri)) {
    return value.uri;
  }
  for (const item of Object.values(value)) {
    if (Array.isArray(item)) {
      for (const entry of item) {
        const uri = findVideoUri(entry);
        if (uri) return uri;
      }
    } else {
      const uri = findVideoUri(item);
      if (uri) return uri;
    }
  }
  return "";
}

export function getGeminiVideoApiStatus() {
  return {
    enabled: isVideoApiEnabled(),
    configured: hasGeminiKey(),
    model: defaultVeoModel,
    envVars
  };
}

export function buildGeminiVeoRequest(input: GeminiVeoVideoInput) {
  return {
    instances: [{ prompt: input.prompt }],
    parameters: {
      ...(input.aspectRatio ? { aspectRatio: input.aspectRatio } : {}),
      ...(input.durationSeconds ? { durationSeconds: input.durationSeconds } : {}),
      ...(input.resolution ? { resolution: input.resolution } : {}),
      ...(input.personGeneration ? { personGeneration: input.personGeneration } : {})
    }
  };
}

export async function startGeminiVeoVideo(input: GeminiVeoVideoInput): Promise<GeminiVeoVideoResult> {
  if (!isVideoApiEnabled()) {
    return {
      ok: false,
      status: "feature_disabled",
      message: "Gemini 影片 API 已被停用，請移除 GEMINI_VIDEO_API_ENABLED=false 或改成 true。"
    };
  }

  const apiKey = getGeminiKey();
  if (!apiKey) {
    return {
      ok: false,
      status: "not_configured",
      message: "伺服器端缺少 GEMINI_API_KEY、GOOGLE_AI_API_KEY 或 GOOGLE_API_KEY。"
    };
  }

  if (!input.prompt.trim()) {
    return {
      ok: false,
      status: "invalid_request",
      message: "請先提供影片生成 Prompt。"
    };
  }

  const model = input.model ?? defaultVeoModel;
  const response = await fetch(`${baseUrl}/models/${model}:predictLongRunning`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": apiKey
    },
    body: JSON.stringify(buildGeminiVeoRequest(input))
  });
  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    return {
      ok: false,
      status: "api_error",
      message: geminiErrorMessage(response.status),
      details: payload,
      httpStatus: response.status
    };
  }

  return {
    ok: true,
    status: "submitted",
    model,
    operationName: typeof payload?.name === "string" ? payload.name : "",
    operation: payload
  };
}

export async function getGeminiOperation(operationName: string): Promise<GeminiOperationResult> {
  const apiKey = getGeminiKey();
  if (!apiKey) {
    return {
      ok: false,
      status: "not_configured",
      message: "伺服器端缺少 GEMINI_API_KEY、GOOGLE_AI_API_KEY 或 GOOGLE_API_KEY。"
    };
  }

  if (!operationName.trim()) {
    return {
      ok: false,
      status: "invalid_request",
      message: "請提供 Provider Job ID。"
    };
  }

  const response = await fetch(`${baseUrl}/${operationName}`, {
    headers: { "x-goog-api-key": apiKey }
  });
  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    return {
      ok: false,
      status: "api_error",
      message: geminiErrorMessage(response.status),
      details: payload,
      httpStatus: response.status
    };
  }

  return {
    ok: true,
    status: payload?.done ? "done" : "running",
    operation: payload
  };
}

export async function createGeminiJob(input: GeminiVeoVideoInput) {
  return startGeminiVeoVideo(input);
}

export async function getGeminiJobStatus(providerJobId: string) {
  return getGeminiOperation(providerJobId);
}

export async function downloadGeminiResult(providerJobId: string): Promise<GeminiDownloadResult> {
  const status = await getGeminiOperation(providerJobId);
  if (!status.ok) return status;
  if (status.status !== "done") {
    return {
      ok: false,
      status: "invalid_request",
      message: "Gemini 工作尚未完成，完成後才能下載影片。",
      details: status.operation
    };
  }

  const apiKey = getGeminiKey();
  const sourceUri = findVideoUri(status.operation);
  if (!apiKey) {
    return {
      ok: false,
      status: "not_configured",
      message: "伺服器端缺少 Gemini API Key，無法下載影片。"
    };
  }
  if (!sourceUri) {
    return {
      ok: false,
      status: "not_found",
      message: "Gemini 回應中找不到可下載的影片 URI。",
      details: status.operation
    };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 60_000);
  try {
    const response = await fetch(sourceUri, {
      headers: { "x-goog-api-key": apiKey },
      signal: controller.signal
    });
    if (!response.ok) {
      return {
        ok: false,
        status: "api_error",
        message: geminiErrorMessage(response.status),
        httpStatus: response.status,
        details: await response.json().catch(() => null)
      };
    }
    return {
      ok: true,
      fileName: `${providerJobId.split("/").pop() || "gemini-video"}.mp4`,
      contentType: response.headers.get("content-type") || "video/mp4",
      blob: await response.blob(),
      sourceUri
    };
  } catch (error) {
    return {
      ok: false,
      status: "timeout",
      message: error instanceof DOMException && error.name === "AbortError"
        ? "Gemini 影片下載逾時，請稍後重試。"
        : "Gemini 影片下載失敗，請稍後重試。",
      details: error instanceof Error ? error.message : error
    };
  } finally {
    clearTimeout(timeout);
  }
}

export const geminiVideoProvider: VideoProviderAdapter<GeminiVeoVideoInput> = {
  id: "gemini",
  label: "Gemini / Veo",
  envVars,
  createJob: createGeminiJob,
  getJobStatus: getGeminiJobStatus,
  downloadResult: downloadGeminiResult,
  getStatus(): VideoProviderStatus {
    const configured = hasGeminiKey();

    return {
      id: "gemini",
      label: "Gemini / Veo",
      installed: true,
      configured,
      available: configured,
      capabilities: {
        textToVideo: true,
        imageToVideo: true,
        multiImageCharacter: true,
        longVideo: false,
        voiceover: false,
        subtitles: false,
        localRender: false,
        cloudRender: true
      },
      envVars,
      missingEnvVars: configured ? [] : envVars,
      manualWorkflow: true,
      connectionTest: {
        status: configured ? "not_run" : "not_configured",
        message: configured
          ? "已找到 Gemini API Key，可由 Render Queue 送出影片生成工作。"
          : "Add GEMINI_API_KEY, GOOGLE_AI_API_KEY, or GOOGLE_API_KEY on the server to enable future API integration."
      }
    };
  }
};
