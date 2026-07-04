import { messages } from "@/messages/zh-TW";
import type {
  GeneratedScript,
  ScriptGenerationForm,
  ScriptPreviewKey
} from "./types";

export const gptOutputHeadings: { key: ScriptPreviewKey; labels: string[] }[] = [
  { key: "title", labels: ["標題"] },
  { key: "hook", labels: ["開場吸引句"] },
  { key: "script", labels: ["腳本"] },
  { key: "cta", labels: ["行動呼籲"] },
  { key: "hashtags", labels: ["標籤"] },
  { key: "coverText", labels: ["封面文字"] }
];

export const topics = [
  {
    title: "退休規劃",
    description: "把退休規劃問題轉成短影音教育內容。"
  },
  {
    title: "醫療保障",
    description: "用簡單語言說明醫療保障的基本概念。"
  },
  {
    title: "癌症保障",
    description: "準備更有同理心的癌症保障規劃內容。"
  },
  {
    title: "失能保障",
    description: "發想收入保護與復原規劃相關內容。"
  },
  {
    title: "長期照護",
    description: "協助家庭與照顧者理解長照需求。"
  },
  {
    title: "家庭保障",
    description: "幫助家庭理解風險、責任與下一步。"
  }
];

export const workspaceSections = [
  {
    title: "標題",
    placeholder: "範例：購買醫療險前要問的 3 個問題"
  },
  {
    title: messages.contentStudio.hook,
    placeholder: "用常見的客戶擔心或迷思作為開場。"
  },
  {
    title: "腳本",
    placeholder: "整理 30-60 秒影片的主要教學重點。"
  },
  {
    title: messages.contentStudio.cta,
    placeholder: "邀請觀眾檢視保單或先準備想問的問題。"
  },
  {
    title: messages.contentStudio.hashtags,
    placeholder: "#保險 #退休規劃 #家庭保障"
  },
  {
    title: messages.contentStudio.coverText,
    placeholder: "讓觀眾一眼看懂的短封面文字。"
  }
];

export const generatorControls = [
  {
    key: "topic",
    label: "保險主題",
    options: ["退休規劃", "醫療保障", "癌症保障", "失能保障", "長期照護", "家庭保障"]
  },
  {
    key: "targetAudience",
    label: messages.contentStudio.targetAudience,
    options: ["年輕家庭", "上班族", "企業主", "退休族"]
  },
  {
    key: "videoLength",
    label: messages.contentStudio.videoLength,
    options: ["30 秒", "60 秒", "90 秒"]
  },
  {
    key: "tone",
    label: messages.contentStudio.tone,
    options: ["教育型", "溫暖", "專業", "急迫"]
  },
  {
    key: "platform",
    label: messages.contentStudio.platform,
    options: ["YouTube Shorts", "TikTok", "Instagram Reels", "Facebook Reels"]
  }
] satisfies {
  key: keyof ScriptGenerationForm;
  label: string;
  options: string[];
}[];

export const initialFormValues: ScriptGenerationForm = {
  topic: "退休規劃",
  targetAudience: "年輕家庭",
  videoLength: "60 秒",
  tone: "教育型",
  platform: "YouTube Shorts"
};

export const initialGeneratedScript: GeneratedScript = {
  title: "如果收入中斷，你的家庭還能維持原本生活嗎？",
  hook: "多數家庭會規劃成長，卻忘了規劃中斷時怎麼辦。",
  script: "用這段示範腳本說明一個保障缺口、一個生活案例，以及一個簡單下一步。",
  cta: "在下一個重大家庭決定前，先檢視你目前的保障。",
  hashtags: "#保險 #家庭保障 #財務規劃",
  coverText: "守住家人依靠的收入。"
};

export const previewLabels: { key: ScriptPreviewKey; title: string }[] = [
  { key: "title", title: "標題" },
  { key: "hook", title: messages.contentStudio.hook },
  { key: "script", title: "腳本" },
  { key: "cta", title: messages.contentStudio.cta },
  { key: "hashtags", title: messages.contentStudio.hashtags },
  { key: "coverText", title: messages.contentStudio.coverText }
];

export const promptFields = [
  {
    label: "目標",
    value: "建立一支保險教育短影音腳本。"
  },
  {
    label: "受眾",
    value: "正在比較保障選項的年輕家庭。"
  },
  {
    label: "核心訊息",
    value: "保險規劃要保護日常生活，而不只是未來目標。",
    multiline: true
  },
  {
    label: "限制條件",
    value: "腳本控制在 60 秒內，並避免使用艱深術語。",
    multiline: true
  },
  {
    label: messages.contentStudio.cta,
    value: "邀請觀眾檢視目前的保障內容。"
  }
];

export const promptPreview =
  "請為正在比較保障選項的年輕家庭，建立一支保險教育短影音腳本。強調保險規劃要保護日常生活，而不只是未來目標。腳本請控制在 60 秒內，避免艱深術語，並以邀請觀眾檢視目前保障作結。";

export const assistantSuggestions = [
  "挑選一個客戶問題，轉成 30 秒回答。",
  "先選一張主題卡，再填寫開場吸引句與完整腳本。",
  "讓行動呼籲更有人味：邀請對話，而不是像自動化指令。"
];
