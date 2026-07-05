export const RENDER_QUEUE_KEY = "dailyos-render-queue";

export const renderStatuses = ["等待中", "準備中", "生成中", "已完成", "失敗"] as const;
export type RenderStatus = (typeof renderStatuses)[number];

export const renderProviders = [
  "Gemini",
  "OpenMontage",
  "Runway",
  "Kling",
  "Pika",
  "Hailuo",
  "Veo"
] as const;
export type RenderProvider = (typeof renderProviders)[number] | string;

export type RenderJob = {
  id: string;
  project: string;
  title: string;
  provider: RenderProvider;
  createdAt: string;
  updatedAt: string;
  status: RenderStatus;
  prompt: string;
  productionPackage: unknown;
  character: unknown;
  brand: unknown;
  voice: unknown;
  request: unknown;
  response: unknown;
  error: string;
  statusHistory: Array<{
    status: RenderStatus;
    at: string;
    note: string;
  }>;
};

export function readRenderQueue(): RenderJob[] {
  try {
    const saved = window.localStorage.getItem(RENDER_QUEUE_KEY);
    const parsed = saved ? (JSON.parse(saved) as RenderJob[]) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function writeRenderQueue(jobs: RenderJob[]) {
  window.localStorage.setItem(RENDER_QUEUE_KEY, JSON.stringify(jobs));
}
