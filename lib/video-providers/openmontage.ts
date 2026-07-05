import { existsSync } from "node:fs";
import { join } from "node:path";
import type { VideoProviderAdapter, VideoProviderStatus } from "./types";

const root = join(process.cwd(), "vendor", "OpenMontage");

function isInstalled() {
  return existsSync(root);
}

export const openMontageVideoProvider: VideoProviderAdapter = {
  id: "openmontage",
  label: "OpenMontage",
  envVars: [],
  getStatus(): VideoProviderStatus {
    const installed = isInstalled();

    return {
      id: "openmontage",
      label: "OpenMontage",
      installed,
      configured: installed,
      available: installed,
      capabilities: {
        textToVideo: false,
        imageToVideo: false,
        multiImageCharacter: false,
        longVideo: true,
        voiceover: true,
        subtitles: true,
        localRender: true,
        cloudRender: false
      },
      envVars: [],
      missingEnvVars: [],
      manualWorkflow: true,
      connectionTest: {
        status: installed ? "ready" : "not_configured",
        message: installed
          ? "已偵測到 vendor/OpenMontage，可建立本機手動渲染工作。"
          : "尚未偵測到 vendor/OpenMontage。"
      }
    };
  }
};
