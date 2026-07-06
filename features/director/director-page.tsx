"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { contentCategories } from "@/features/content/constants";

type Asset = {
  id: string;
  title?: string;
  name?: string;
};

type Brand = {
  id: string;
  name: string;
  primaryColor: string;
  subtitleStyle: string;
  introNote: string;
  outroCta: string;
  defaultCharacterId: string;
  defaultVoiceId: string;
  defaultVideoStyle: string;
};

type ProductionPackageAsset = Asset & {
  script?: {
    title: string;
    hook: string;
    script: string;
    cta: string;
    coverText: string;
  } | null;
  storyboard?: Array<{
    shot: string;
    visual: string;
    narration: string;
    subtitle: string;
    broll?: string;
  }>;
};

type DirectorPlan = {
  projectName: string;
  scriptTitle: string;
  hook: string;
  script: string;
  cta: string;
  coverText: string;
  storyboard: Array<{
    shot: string;
    visual: string;
    narration: string;
    subtitle: string;
    broll: string;
  }>;
};

const PROJECTS_KEY = "dailyos-projects";
const ACTIVE_PROJECT_KEY = "dailyos-active-project-id";
const DASHBOARD_PROJECT_KEY = "dailyos-creator-dashboard-project";
const SCRIPT_KEY = "dailyos-script-library";
const STORYBOARD_KEY = "dailyos-storyboard-v2";
const CHARACTER_KEY = "dailyos-character-library";
const VOICE_KEY = "dailyos-voice-library";
const PACKAGE_KEY = "dailyos-video-packages";
const BRAND_KEY = "dailyos-brand-library";

const defaultPrompt =
  "我要做一支30秒介紹ChatGPT最新功能的短影片，風格活潑，目標觀眾25~40歲。";

const demoCases = [
  {
    title: "AI 工具介紹",
    category: "AI",
    prompt: "我要做一支30秒介紹ChatGPT最新功能的短影片，風格活潑，目標觀眾25~40歲。"
  },
  {
    title: "保險知識",
    category: "保險",
    prompt: "我要做一支30秒說明有醫療險是不是就夠了的短影片，語氣親切，讓一般家庭聽得懂。"
  },
  {
    title: "房地產知識",
    category: "房地產",
    prompt: "我要做一支30秒說明第一次看房要注意什麼的短影片，風格清楚務實，適合首購族。"
  },
  {
    title: "健康小知識",
    category: "健康",
    prompt: "我要做一支30秒提醒上班族如何改善久坐疲勞的短影片，風格溫暖、生活化。"
  },
  {
    title: "旅遊推薦",
    category: "旅遊",
    prompt: "我要做一支30秒推薦週末小旅行景點的短影片，風格輕鬆明亮，目標觀眾25到40歲。"
  }
];

function readArray<T>(key: string): T[] {
  try {
    const saved = window.localStorage.getItem(key);
    const parsed = saved ? (JSON.parse(saved) as T[]) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function titleOf(asset: Asset) {
  return asset.title ?? asset.name ?? asset.id;
}

function buildPlan(prompt: string, category: string, duration: string): DirectorPlan {
  const cleanPrompt = prompt.trim() || defaultPrompt;
  const topic = cleanPrompt.replace(/\s+/g, " ").slice(0, 34);
  const projectName = `${category}短影片｜${topic}`;

  return {
    projectName,
    scriptTitle: projectName,
    hook: `你有沒有想過，${topic} 其實可以用更簡單的方式理解？`,
    script: `今天用 ${duration} 帶你快速整理：第一，這個主題和你現在的生活有什麼關係；第二，最容易忽略的重點是什麼；第三，你可以立刻採取的一個小行動。`,
    cta: "想看更多實用整理，先把這支影片存起來。",
    coverText: `${category}重點一次看`,
    storyboard: [
      {
        shot: "1",
        visual: "主持人看向鏡頭，畫面出現大標題。",
        narration: `今天聊聊：${topic}`,
        subtitle: topic,
        broll: "乾淨桌面、手機短影音介面"
      },
      {
        shot: "2",
        visual: "用三個重點卡片拆解內容。",
        narration: `用三個重點，在 ${duration} 內快速看懂。`,
        subtitle: "3 個重點快速看懂",
        broll: "重點清單、手寫筆記、生活情境"
      },
      {
        shot: "3",
        visual: "收尾畫面搭配明確行動提示。",
        narration: "先從一個你今天就能做的小行動開始。",
        subtitle: "先做一個小行動",
        broll: "收藏影片、打開備忘錄、準備下一步"
      }
    ]
  };
}

export function DirectorPage() {
  const router = useRouter();
  const [prompt, setPrompt] = useState(defaultPrompt);
  const [category, setCategory] = useState("AI");
  const [brand, setBrand] = useState("");
  const [brandId, setBrandId] = useState("");
  const [assetPackageId, setAssetPackageId] = useState("");
  const [projectId, setProjectId] = useState("");
  const [characterId, setCharacterId] = useState("");
  const [voiceId, setVoiceId] = useState("");
  const [ratio, setRatio] = useState("9:16");
  const [duration, setDuration] = useState("30 秒");
  const [projects, setProjects] = useState<Asset[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [packages, setPackages] = useState<ProductionPackageAsset[]>([]);
  const [characters, setCharacters] = useState<Asset[]>([]);
  const [voices, setVoices] = useState<Asset[]>([]);
  const [plan, setPlan] = useState<DirectorPlan | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    setProjects(readArray<Asset>(PROJECTS_KEY));
    setBrands(readArray<Brand>(BRAND_KEY));
    setPackages(readArray<ProductionPackageAsset>(PACKAGE_KEY));
    setCharacters(readArray<Asset>(CHARACTER_KEY));
    setVoices(readArray<Asset>(VOICE_KEY));
  }, []);

  const progress = useMemo(
    () => [
      { label: "專案", done: Boolean(plan) },
      { label: "腳本", done: Boolean(plan) },
      { label: "分鏡", done: Boolean(plan?.storyboard.length) },
      { label: "人物", done: Boolean(characterId || plan) },
      { label: "聲音", done: Boolean(voiceId || plan) },
      { label: "製作包", done: Boolean(plan) }
    ],
    [characterId, plan, voiceId]
  );

  function updatePlan(key: keyof DirectorPlan, value: string) {
    setPlan((current) => current ? { ...current, [key]: value } : current);
  }

  function updateScene(index: number, key: keyof DirectorPlan["storyboard"][number], value: string) {
    setPlan((current) =>
      current
        ? {
            ...current,
            storyboard: current.storyboard.map((scene, sceneIndex) =>
              sceneIndex === index ? { ...scene, [key]: value } : scene
            )
          }
        : current
    );
  }

  function planWithAi() {
    setPlan(buildPlan(prompt, category, duration));
    setMessage("AI 導演已整理可編輯預覽，確認後才會寫入本機資料。");
  }

  function applyDemoCase(item: (typeof demoCases)[number]) {
    setPrompt(item.prompt);
    setCategory(item.category);
    setMessage(`已載入示範案例「${item.title}」。`);
  }

  function applyBrand() {
    const selected = brands.find((item) => item.id === brandId);
    if (!selected) {
      setMessage("請先選擇品牌。");
      return;
    }

    setBrand(selected.name);
    setCharacterId(selected.defaultCharacterId);
    setVoiceId(selected.defaultVoiceId);
    setPrompt((current) =>
      [
        current,
        `品牌風格：${selected.defaultVideoStyle}`,
        `字幕樣式：${selected.subtitleStyle}`,
        `片頭：${selected.introNote}`,
        `片尾 CTA：${selected.outroCta}`
      ].join("\n")
    );
    setMessage(`已套用品牌「${selected.name}」。`);
  }

  function applyAssetPackage() {
    const selected = packages.find((item) => item.id === assetPackageId);
    if (!selected?.script) {
      setMessage("請先選擇含有腳本的製作包。");
      return;
    }

    setPlan({
      projectName: titleOf(selected),
      scriptTitle: selected.script.title,
      hook: selected.script.hook,
      script: selected.script.script,
      cta: selected.script.cta,
      coverText: selected.script.coverText,
      storyboard: (selected.storyboard ?? []).map((scene) => ({
        shot: scene.shot,
        visual: scene.visual,
        narration: scene.narration,
        subtitle: scene.subtitle,
        broll: scene.broll ?? ""
      }))
    });
    setMessage(`已從素材庫載入「${titleOf(selected)}」。`);
  }

  function startProduction() {
    if (!plan) {
      return;
    }

    const now = new Date().toISOString();
    const script = {
      id: crypto.randomUUID(),
      title: plan.scriptTitle,
      topic: category,
      targetAudience: "AI 導演使用者",
      status: "草稿",
      createdAt: now,
      updatedAt: now,
      hook: plan.hook,
      script: plan.script,
      cta: plan.cta,
      hashtags: `#${category} #短影音 #DailyOS`,
      coverText: plan.coverText
    };
    const character =
      characters.find((item) => item.id === characterId) ??
      {
        id: crypto.randomUUID(),
        name: "AI 導演預設人物",
        version: 1,
        references: [],
        hairstyle: "自然乾淨",
        hairColor: "深棕色",
        outfit: "簡潔專業穿搭",
        expressions: "親切、自然、有精神",
        brandAttributes: "可信、清楚、生活化",
        providerNotes: "保持人物一致性",
        createdAt: now,
        updatedAt: now
      };
    const voice =
      voices.find((item) => item.id === voiceId) ??
      {
        id: crypto.randomUUID(),
        name: "AI 導演預設配音",
        genderAge: "繁中自然聲線",
        speakingStyle: "活潑清楚",
        tone: "親切可信",
        speed: "Medium",
        pauseLevel: "Medium",
        emotionalWarmth: "High",
        formalityLevel: "Warm",
        preset: "活潑短影音",
        providerNotes: "適合短影音旁白",
        legalUseNote: "僅使用合法持有或授權聲音。",
        createdAt: now,
        updatedAt: now
      };
    const storyboard = plan.storyboard.map((scene) => ({
      id: crypto.randomUUID(),
      ...scene,
      characterProfileId: character.id,
      voiceProfileId: voice.id,
      cameraShot: "Medium shot",
      backgroundLocation: "明亮室內或生活場景",
      actionGesture: "自然手勢",
      facialExpression: "親切自信"
    }));
    const project = {
      id: projectId || crypto.randomUUID(),
      name: plan.projectName,
      description: prompt,
      brand,
      defaultCharacterId: character.id,
      defaultVoiceId: voice.id,
      defaultVideoProvider: "Gemini",
      scriptIds: [script.id],
      storyboardIds: storyboard.map((scene) => scene.id),
      videoIds: [],
      calendarItemIds: [],
      publishingItemIds: [],
      status: "active",
      createdAt: now,
      updatedAt: now
    };
    const productionPackage = {
      id: crypto.randomUUID(),
      title: plan.projectName,
      createdAt: now,
      provider: "Gemini",
      script,
      character,
      voice,
      storyboard,
      config: {
        format: `直式短影音 ${ratio}`,
        renderTarget: "手動交接 Gemini / Google AI Studio",
        status: "待檢查",
        integrations: ["Gemini metadata", "不需要 API key", "不自動生成影片"]
      }
    };

    const nextProjects = projectId
      ? readArray<typeof project>(PROJECTS_KEY).map((item) => item.id === projectId ? project : item)
      : [project, ...readArray<typeof project>(PROJECTS_KEY)];

    window.localStorage.setItem(PROJECTS_KEY, JSON.stringify(nextProjects));
    window.localStorage.setItem(ACTIVE_PROJECT_KEY, project.id);
    window.localStorage.setItem(DASHBOARD_PROJECT_KEY, project.name);
    window.localStorage.setItem(SCRIPT_KEY, JSON.stringify([script, ...readArray<typeof script>(SCRIPT_KEY)]));
    if (!characterId) {
      window.localStorage.setItem(CHARACTER_KEY, JSON.stringify([character, ...readArray<typeof character>(CHARACTER_KEY)]));
    }
    if (!voiceId) {
      window.localStorage.setItem(VOICE_KEY, JSON.stringify([voice, ...readArray<typeof voice>(VOICE_KEY)]));
    }
    window.localStorage.setItem(STORYBOARD_KEY, JSON.stringify(storyboard));
    window.localStorage.setItem(PACKAGE_KEY, JSON.stringify([productionPackage, ...readArray<typeof productionPackage>(PACKAGE_KEY)]));

    router.push("/video#export");
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <section className="space-y-5 rounded-2xl border bg-card p-5 shadow-sm sm:p-8">
        <div>
          <p className="text-sm font-medium text-primary">AI 導演</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-normal">今天想創作什麼？</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            直接像聊天一樣描述主題、觀眾與風格；需要靈感時先套用下方示範案例。
          </p>
        </div>

        <textarea
          className="min-h-44 w-full resize-y rounded-xl border bg-background p-4 text-base leading-7 outline-none focus-visible:ring-2 focus-visible:ring-ring"
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          placeholder={defaultPrompt}
        />

        <div className="space-y-3">
          <p className="text-sm font-medium">示範案例</p>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
            {demoCases.map((item) => (
              <button
                key={item.title}
                type="button"
                className="rounded-md border bg-background px-3 py-2 text-left text-sm transition-colors hover:bg-secondary"
                onClick={() => applyDemoCase(item)}
              >
                <span className="font-medium">{item.title}</span>
                <span className="mt-1 block text-xs text-muted-foreground">{item.category}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-sm font-medium">內容分類</p>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
            {contentCategories.map((item) => (
              <label key={item} className="flex items-center gap-2 rounded-md border bg-background px-3 py-2 text-sm">
                <input
                  type="radio"
                  name="director-category"
                  checked={category === item}
                  onChange={() => setCategory(item)}
                />
                {item}
              </label>
            ))}
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-5">
          <Field label="品牌" value={brand} onChange={setBrand} placeholder="可留白" />
          <Select label="套用品牌" value={brandId} onChange={setBrandId} placeholder="選擇品牌" options={brands.map((item) => ({ label: item.name, value: item.id }))} />
          <Select label="從素材庫選擇" value={assetPackageId} onChange={setAssetPackageId} placeholder="選擇製作包" options={packages.map((item) => ({ label: titleOf(item), value: item.id }))} />
          <Select label="專案" value={projectId} onChange={setProjectId} placeholder="建立新專案" options={projects.map((item) => ({ label: titleOf(item), value: item.id }))} />
          <Select label="人物模板" value={characterId} onChange={setCharacterId} placeholder="自動建立" options={characters.map((item) => ({ label: titleOf(item), value: item.id }))} />
          <Select label="配音" value={voiceId} onChange={setVoiceId} placeholder="自動建立" options={voices.map((item) => ({ label: titleOf(item), value: item.id }))} />
          <Select label="影片比例" value={ratio} onChange={setRatio} placeholder="選擇比例" options={["9:16", "16:9", "1:1"].map((item) => ({ label: item, value: item }))} />
          <Select label="影片長度" value={duration} onChange={setDuration} placeholder="選擇長度" options={["30 秒", "60 秒", "90 秒"].map((item) => ({ label: item, value: item }))} />
        </div>

        <div className="flex flex-wrap gap-2">
          <Button onClick={planWithAi}>請 AI 導演幫我規劃</Button>
          <Button variant="outline" onClick={applyBrand}>套用品牌</Button>
          <Button variant="outline" onClick={applyAssetPackage}>載入素材</Button>
        </div>
      </section>

      {message ? (
        <p className="rounded-md border bg-background px-3 py-2 text-sm text-muted-foreground">{message}</p>
      ) : null}

      {plan ? (
        <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
          <Card>
            <CardHeader>
              <CardTitle>預覽</CardTitle>
              <CardDescription>可先修改，再開始製作影片。</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Field label="專案" value={plan.projectName} onChange={(value) => updatePlan("projectName", value)} />
              <Field label="腳本標題" value={plan.scriptTitle} onChange={(value) => updatePlan("scriptTitle", value)} />
              <Field label="開場吸引句" value={plan.hook} onChange={(value) => updatePlan("hook", value)} />
              <TextArea label="腳本" value={plan.script} onChange={(value) => updatePlan("script", value)} />
              <Field label="行動呼籲" value={plan.cta} onChange={(value) => updatePlan("cta", value)} />
              <Field label="封面文字" value={plan.coverText} onChange={(value) => updatePlan("coverText", value)} />
              <div className="space-y-3">
                <p className="text-sm font-medium">分鏡</p>
                {plan.storyboard.map((scene, index) => (
                  <div key={scene.shot} className="grid gap-3 rounded-md border bg-secondary/30 p-3 md:grid-cols-2">
                    <Field label="畫面" value={scene.visual} onChange={(value) => updateScene(index, "visual", value)} />
                    <Field label="字幕" value={scene.subtitle} onChange={(value) => updateScene(index, "subtitle", value)} />
                    <TextArea label="旁白" value={scene.narration} onChange={(value) => updateScene(index, "narration", value)} />
                    <TextArea label="B-roll" value={scene.broll} onChange={(value) => updateScene(index, "broll", value)} />
                  </div>
                ))}
              </div>
              <Button onClick={startProduction}>開始製作影片</Button>
            </CardContent>
          </Card>

          <aside className="space-y-4">
            <Card className="xl:sticky xl:top-24">
              <CardHeader>
                <CardTitle>產生項目</CardTitle>
                <CardDescription>確認後寫入既有工作室資料結構</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {progress.map((item) => (
                  <div key={item.label} className="flex items-center justify-between rounded-md border bg-background px-3 py-2 text-sm">
                    <span>✓ {item.label}</span>
                    <Badge variant={item.done ? "default" : "outline"}>{item.done ? "已規劃" : "待規劃"}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </aside>
        </section>
      ) : null}
    </div>
  );
}

function Field({
  label,
  value,
  placeholder,
  onChange
}: {
  label: string;
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="space-y-2">
      <span className="text-sm font-medium">{label}</span>
      <input
        className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

function TextArea({
  label,
  value,
  onChange
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="space-y-2">
      <span className="text-sm font-medium">{label}</span>
      <textarea
        className="min-h-28 w-full resize-y rounded-md border bg-background px-3 py-2 text-sm leading-6 outline-none focus-visible:ring-2 focus-visible:ring-ring"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

function Select({
  label,
  value,
  options,
  placeholder,
  onChange
}: {
  label: string;
  value: string;
  options: Array<{ label: string; value: string }>;
  placeholder: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="space-y-2">
      <span className="text-sm font-medium">{label}</span>
      <select
        className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    </label>
  );
}
