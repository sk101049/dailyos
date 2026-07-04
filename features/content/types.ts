export type ScriptGenerationForm = {
  topic: string;
  targetAudience: string;
  videoLength: string;
  tone: string;
  platform: string;
};

export type ScriptPreviewKey =
  | "title"
  | "hook"
  | "script"
  | "cta"
  | "hashtags"
  | "coverText";

export type GeneratedScript = Record<ScriptPreviewKey, string>;

export type ScriptApiResponse = {
  script?: GeneratedScript;
  error?: string;
};

export type ScriptStatus = "草稿" | "已完成" | "已發布";

export type ThumbnailStyle = "寫實" | "插畫" | "3D" | "動漫";
export type ThumbnailRatio = "9:16" | "16:9" | "1:1";

export type StoryboardRow = {
  id: string;
  shot: string;
  visual: string;
  narration: string;
  subtitle: string;
  broll: string;
};

export type SavedScript = GeneratedScript & {
  id: string;
  title: string;
  topic: string;
  targetAudience: string;
  status: ScriptStatus;
  createdAt: string;
  updatedAt: string;
};
