export type VideoProviderConnectionStatus = "not_configured" | "ready" | "not_run";

export type VideoProviderStatus = {
  id: string;
  label: string;
  installed: boolean;
  configured: boolean;
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
