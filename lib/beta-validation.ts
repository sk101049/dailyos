export const BETA_ONBOARDING_KEY = "dailyos-beta-onboarding-dismissed";
export const DEMO_SEEDED_KEY = "dailyos-demo-seeded-at";
export const ISSUE_REPORT_KEY = "dailyos-issue-reports";

const PROJECTS_KEY = "dailyos-projects";
const BRAND_KEY = "dailyos-brand-library";
const WORKFLOW_KEY = "dailyos-workflow-templates";
const SCRIPT_KEY = "dailyos-script-library";
const STORYBOARD_KEY = "dailyos-storyboard-v2";

export type DemoCase = {
  category: string;
  project: string;
  brand: string;
  workflow: string;
  script: string;
  storyboard: string[];
};

export const demoCases: DemoCase[] = [
  ["AI 工具", "5 個 AI 工具幫你省下每天 1 小時", "效率顧問", "短影音教育流程"],
  ["ChatGPT", "ChatGPT 新功能一分鐘看懂", "AI 教練", "AI 工具介紹流程"],
  ["Gemini", "Gemini 可以怎麼幫內容創作者", "科技筆記", "AI 工具介紹流程"],
  ["保險", "有醫療險就夠了嗎", "安心保險顧問", "保險知識流程"],
  ["房地產", "第一次看房先檢查這 3 件事", "首購研究室", "房地產知識流程"],
  ["股票", "新手買股票前要懂的風險", "投資筆記", "財經教育流程"],
  ["ETF", "ETF 適合懶人投資嗎", "長期投資家", "財經教育流程"],
  ["健康", "久坐上班族的 3 個伸展提醒", "健康小教室", "生活知識流程"],
  ["美食", "巷口小吃怎麼拍成短影音", "吃貨日記", "生活推薦流程"],
  ["旅遊", "週末小旅行提案", "輕旅行指南", "旅遊推薦流程"],
  ["親子", "親子共讀怎麼開始", "家庭成長筆記", "親子教育流程"],
  ["科技", "一分鐘看懂智慧眼鏡", "科技快報", "科技解析流程"],
  ["創業", "創業第一週先做什麼", "創業小路", "創業教學流程"],
  ["生產力", "今天只做三件事的工作法", "高效日常", "生產力流程"],
  ["教學", "把複雜知識講清楚的 3 步驟", "教學設計室", "教學流程"],
  ["新聞解析", "一則新聞怎麼快速拆重點", "今日解析", "新聞解析流程"],
  ["書籍摘要", "一本書如何濃縮成 30 秒", "閱讀筆記", "書摘流程"],
  ["開箱", "新產品開箱短影音腳本", "開箱實驗室", "開箱流程"],
  ["FAQ", "客戶最常問的 3 個問題", "顧問問答室", "FAQ 流程"],
  ["自訂", "把你的專業變成每日短影音", "個人品牌工作室", "自訂創作流程"]
].map(([category, project, brand, workflow]) => ({
  category,
  project,
  brand,
  workflow,
  script: `開場：${project}。今天用三個重點快速整理，讓觀眾立刻知道重點、避開誤區，最後給一個可以馬上執行的小行動。`,
  storyboard: [
    "主持人開場，畫面出現主標題。",
    "三張重點卡片依序出現，搭配簡短旁白。",
    "收尾 CTA，提醒觀眾收藏或留言。"
  ]
}));

function readArray<T>(key: string): T[] {
  try {
    const saved = window.localStorage.getItem(key);
    const parsed = saved ? (JSON.parse(saved) as T[]) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function mergeByTitle<T extends { title?: string; name?: string }>(key: string, items: T[]) {
  const current = readArray<T>(key);
  const names = new Set(current.map((item) => item.title ?? item.name));
  const next = [...items.filter((item) => !names.has(item.title ?? item.name)), ...current];
  window.localStorage.setItem(key, JSON.stringify(next));
  return next;
}

export function seedDemoData() {
  const now = new Date().toISOString();
  const brands = demoCases.map((item) => ({
    id: `demo-brand-${item.category}`,
    name: item.brand,
    primaryColor: "#4ECDC4",
    subtitleStyle: "大字、高對比、繁體中文",
    introNote: `${item.brand} 的知識型開場`,
    outroCta: "追蹤我們，學會更聰明的選擇。",
    defaultCharacterId: "",
    defaultVoiceId: "",
    defaultVideoStyle: "明亮、清楚、生活化"
  }));
  const scripts = demoCases.map((item) => ({
    id: `demo-script-${item.category}`,
    title: item.project,
    topic: item.category,
    status: "示範",
    createdAt: now,
    updatedAt: now,
    hook: `你知道 ${item.category} 其實可以更簡單嗎？`,
    script: item.script,
    cta: "收藏這支影片，下次就用得到。",
    hashtags: `#${item.category} #短影音 #DailyOS`,
    coverText: item.project
  }));
  const storyboard = demoCases.flatMap((item) =>
    item.storyboard.map((visual, index) => ({
      id: `demo-storyboard-${item.category}-${index + 1}`,
      shot: `${index + 1}`,
      visual,
      narration: `${item.project}：第 ${index + 1} 個重點。`,
      subtitle: visual,
      broll: "生活場景、文字卡、手勢說明",
      imagePrompt: `${item.category} knowledge short video scene`,
      videoPrompt: `${item.project} scene ${index + 1}`
    }))
  );
  const workflows = demoCases.map((item) => ({
    id: `demo-workflow-${item.category}`,
    name: item.workflow,
    createdAt: now,
    updatedAt: now,
    nodes: ["AI 導演", "腳本", "分鏡", "審核", "生成佇列", "發布中心"].map((label) => ({
      id: `demo-${item.category}-${label}`,
      label,
      enabled: true,
      requiresApproval: ["AI 導演", "審核", "生成佇列"].includes(label),
      defaultProvider: "Gemini"
    }))
  }));
  const projects = demoCases.map((item) => ({
    id: `demo-project-${item.category}`,
    name: item.project,
    description: `${item.category} 示範創作案例`,
    brand: item.brand,
    defaultCharacterId: "",
    defaultVoiceId: "",
    defaultVideoProvider: "Gemini",
    scriptIds: [`demo-script-${item.category}`],
    storyboardIds: item.storyboard.map((_, index) => `demo-storyboard-${item.category}-${index + 1}`),
    videoIds: [],
    calendarItemIds: [],
    publishingItemIds: [],
    status: "demo",
    createdAt: now,
    updatedAt: now
  }));

  mergeByTitle(BRAND_KEY, brands);
  mergeByTitle(SCRIPT_KEY, scripts);
  mergeByTitle(WORKFLOW_KEY, workflows);
  mergeByTitle(PROJECTS_KEY, projects);
  window.localStorage.setItem(STORYBOARD_KEY, JSON.stringify(storyboard));
  window.localStorage.setItem(DEMO_SEEDED_KEY, now);
}

export function readIssueReports() {
  return readArray<{ id: string }>(ISSUE_REPORT_KEY);
}
