import { gptOutputHeadings } from "./constants";
import type {
  GeneratedScript,
  ScriptGenerationForm,
  ScriptPreviewKey,
  StoryboardRow,
  ThumbnailRatio,
  ThumbnailStyle
} from "./types";

export function buildGptPrompt(formValues: ScriptGenerationForm) {
  return [
    "請你擔任保險內容策略顧問，協助我產生一支繁體中文短影音腳本。",
    "",
    "請根據以下設定撰寫內容：",
    `- 內容分類：${formValues.category}`,
    `- 內容主題：${formValues.topic}`,
    `- 目標客群：${formValues.targetAudience}`,
    `- 影片長度：${formValues.videoLength}`,
    `- 語氣風格：${formValues.tone}`,
    `- 發布平台：${formValues.platform}`,
    "",
    "請回傳以下欄位，並使用清楚的段落標題：",
    "1. 標題",
    "2. 開場吸引句",
    "3. 腳本",
    "4. 行動呼籲",
    "5. 標籤",
    "6. 封面文字",
    "",
    "請讓內容適合創作者日常使用，避免誇大承諾，語氣要可信、清楚、有同理心。"
  ].join("\n");
}

export function buildThumbnailPrompt({
  script,
  formValues,
  style,
  ratio,
  includePerson
}: {
  script: GeneratedScript;
  formValues: ScriptGenerationForm;
  style: ThumbnailStyle;
  ratio: ThumbnailRatio;
  includePerson: boolean;
}) {
  return [
    "請產生一張社群短影音縮圖的 AI 圖像 Prompt。",
    `主題：${formValues.topic}`,
    `目標客群：${formValues.targetAudience}`,
    `影片標題：${script.title}`,
    `開場重點：${script.hook}`,
    `視覺風格：${style}`,
    `圖片比例：${ratio}`,
    includePerson
      ? "畫面包含一位可信、親切的保險顧問或目標客群人物。"
      : "畫面不包含人物，聚焦在清楚的視覺隱喻、文字空間與主題物件。",
    "畫面要乾淨、有高對比、適合 YouTube Shorts 和社群平台縮圖。",
    "保留明確文字區域，避免雜亂背景，不要加入品牌 logo。"
  ].join("\n");
}

export function buildInitialStoryboard(script: GeneratedScript): StoryboardRow[] {
  return [
    {
      id: crypto.randomUUID(),
      shot: "1",
      visual: `用強烈標題呈現：${script.title}`,
      narration: script.hook,
      subtitle: script.hook,
      broll: "人物看著鏡頭或生活情境特寫"
    },
    {
      id: crypto.randomUUID(),
      shot: "2",
      visual: "用簡單畫面說明主要觀念",
      narration: script.script,
      subtitle: script.title,
      broll: "保單、家庭、桌面規劃畫面"
    },
    {
      id: crypto.randomUUID(),
      shot: "3",
      visual: "收尾畫面搭配明確行動提示",
      narration: script.cta,
      subtitle: script.cta,
      broll: "手機訊息、預約諮詢或整理資料畫面"
    }
  ];
}

export function formatStoryboard(rows: StoryboardRow[]) {
  return rows
    .map((row) =>
      [
        `鏡次：${row.shot}`,
        `畫面描述：${row.visual}`,
        `旁白：${row.narration}`,
        `字幕：${row.subtitle}`,
        `B-roll：${row.broll}`
      ].join("\n")
    )
    .join("\n\n");
}

export function parseGptOutput(text: string) {
  const parsed: Partial<GeneratedScript> = {};
  let currentKey: ScriptPreviewKey | null = null;

  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line) {
      continue;
    }

    const heading = gptOutputHeadings.find(({ labels }) =>
      labels.some((label) =>
        new RegExp(`^(?:\\d+[\\.、]\\s*)?${label}\\s*[:：]?`).test(line)
      )
    );

    if (heading) {
      currentKey = heading.key;
      const value = line
        .replace(new RegExp(`^(?:\\d+[\\.、]\\s*)?${heading.labels[0]}\\s*[:：]?`), "")
        .trim();

      if (value) {
        parsed[currentKey] = value;
      }
      continue;
    }

    if (currentKey) {
      parsed[currentKey] = [parsed[currentKey], line].filter(Boolean).join("\n");
    }
  }

  return parsed;
}
