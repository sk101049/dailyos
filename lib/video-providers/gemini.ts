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
  return process.env.GEMINI_VIDEO_API_ENABLED === "true";
}

type GeminiVeoVideoInput = {
  prompt: string;
  model?: string;
  aspectRatio?: "16:9" | "9:16";
  durationSeconds?: "4" | "6" | "8";
  resolution?: "720p" | "1080p" | "4k";
  personGeneration?: "allow_all" | "allow_adult" | "dont_allow";
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
    };

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
      message: "Gemini video API spike is disabled. Set GEMINI_VIDEO_API_ENABLED=true on the server to submit requests."
    };
  }

  const apiKey = getGeminiKey();
  if (!apiKey) {
    return {
      ok: false,
      status: "not_configured",
      message: "Missing GEMINI_API_KEY, GOOGLE_AI_API_KEY, or GOOGLE_API_KEY on the server."
    };
  }

  if (!input.prompt.trim()) {
    return {
      ok: false,
      status: "invalid_request",
      message: "Prompt is required."
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
      message: `Gemini video API request failed with HTTP ${response.status}.`,
      details: payload
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
      message: "Missing GEMINI_API_KEY, GOOGLE_AI_API_KEY, or GOOGLE_API_KEY on the server."
    };
  }

  if (!operationName.trim()) {
    return {
      ok: false,
      status: "invalid_request",
      message: "Provider job ID is required."
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
      message: `Gemini operation status request failed with HTTP ${response.status}.`,
      details: payload
    };
  }

  return {
    ok: true,
    status: payload?.done ? "done" : "running",
    operation: payload
  };
}

export const geminiVideoProvider: VideoProviderAdapter = {
  id: "gemini",
  label: "Gemini / Veo",
  envVars,
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
          ? "Configuration found. Video API spike is server-side and feature-flagged."
          : "Add GEMINI_API_KEY, GOOGLE_AI_API_KEY, or GOOGLE_API_KEY on the server to enable future API integration."
      }
    };
  }
};
