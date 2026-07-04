import type { VideoProviderAdapter, VideoProviderStatus } from "./types";

const envVars = ["GEMINI_API_KEY", "GOOGLE_AI_API_KEY", "GOOGLE_API_KEY"];

function hasGeminiKey() {
  return envVars.some((name) => Boolean(process.env[name]));
}

export const geminiVideoProvider: VideoProviderAdapter = {
  id: "gemini",
  label: "Gemini / Google AI Studio",
  envVars,
  getStatus(): VideoProviderStatus {
    const configured = hasGeminiKey();

    return {
      id: "gemini",
      label: "Gemini / Google AI Studio",
      installed: true,
      configured,
      envVars,
      missingEnvVars: configured ? [] : envVars,
      manualWorkflow: true,
      connectionTest: {
        status: configured ? "not_run" : "not_configured",
        message: configured
          ? "Configuration found. Network connection test is intentionally not run in this MVP."
          : "Add GEMINI_API_KEY, GOOGLE_AI_API_KEY, or GOOGLE_API_KEY on the server to enable future API integration."
      }
    };
  }
};
