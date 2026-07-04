import { geminiVideoProvider } from "./gemini";

const providers = [geminiVideoProvider];

export function getVideoProviders() {
  return providers;
}

export function getVideoProviderStatuses() {
  return providers.map((provider) => provider.getStatus());
}
