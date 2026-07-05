import { geminiVideoProvider } from "./gemini";
import { openMontageVideoProvider } from "./openmontage";
import type { VideoProviderAdapter, VideoProviderStatus } from "./types";

const futureProviders: VideoProviderAdapter[] = ["Runway", "Kling", "Pika", "Hailuo"].map((label) => ({
  id: label.toLowerCase(),
  label,
  envVars: [],
  getStatus(): VideoProviderStatus {
    return {
      id: label.toLowerCase(),
      label,
      installed: false,
      configured: false,
      available: false,
      capabilities: {
        textToVideo: true,
        imageToVideo: true,
        multiImageCharacter: false,
        longVideo: false,
        voiceover: false,
        subtitles: false,
        localRender: false,
        cloudRender: true
      },
      envVars: [],
      missingEnvVars: [],
      manualWorkflow: true,
      connectionTest: {
        status: "not_configured",
        message: "預留 Provider，尚未設定。"
      }
    };
  }
}));

const providers = [geminiVideoProvider, openMontageVideoProvider, ...futureProviders];

export function getVideoProviders() {
  return providers;
}

export function getVideoProviderStatuses() {
  return providers.map((provider) => provider.getStatus());
}
