export type VideoProviderConnectionStatus = "not_configured" | "ready" | "not_run";

export type VideoProviderCapabilityKey =
  | "textToVideo"
  | "imageToVideo"
  | "multiImageCharacter"
  | "longVideo"
  | "voiceover"
  | "subtitles"
  | "localRender"
  | "cloudRender";

export type VideoProviderCapabilities = Record<VideoProviderCapabilityKey, boolean>;

export type VideoProviderStatus = {
  id: string;
  label: string;
  installed: boolean;
  configured: boolean;
  available: boolean;
  capabilities: VideoProviderCapabilities;
  envVars: string[];
  missingEnvVars: string[];
  manualWorkflow: boolean;
  connectionTest: {
    status: VideoProviderConnectionStatus;
    message: string;
  };
};

export type VideoProviderAdapter = {
  id: string;
  label: string;
  envVars: string[];
  getStatus: () => VideoProviderStatus;
};
