import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { messages } from "@/messages/zh-TW";

const topics = [
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

const workspaceSections = [
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

const generatorControls = [
  {
    label: "保險主題",
    value: "退休規劃",
    options: [
      "退休規劃",
      "醫療保障",
      "癌症保障",
      "失能保障",
      "長期照護",
      "家庭保障"
    ]
  },
  {
    label: messages.contentStudio.targetAudience,
    value: "年輕家庭",
    options: ["年輕家庭", "上班族", "企業主", "退休族"]
  },
  {
    label: messages.contentStudio.videoLength,
    value: "60 秒",
    options: ["30 秒", "60 秒", "90 秒"]
  },
  {
    label: messages.contentStudio.tone,
    value: "教育型",
    options: ["教育型", "溫暖", "專業", "急迫"]
  },
  {
    label: messages.contentStudio.platform,
    value: "YouTube Shorts",
    options: ["YouTube Shorts", "TikTok", "Instagram Reels", "Facebook Reels"]
  }
];

const generatorPreviews = [
  {
    title: "標題",
    content: "如果收入中斷，你的家庭還能維持原本生活嗎？"
  },
  {
    title: messages.contentStudio.hook,
    content: "多數家庭會規劃成長，卻忘了規劃中斷時怎麼辦。"
  },
  {
    title: "腳本",
    content:
      "用這段示範腳本說明一個保障缺口、一個生活案例，以及一個簡單下一步。"
  },
  {
    title: messages.contentStudio.cta,
    content: "在下一個重大家庭決定前，先檢視你目前的保障。"
  },
  {
    title: messages.contentStudio.hashtags,
    content: "#保險 #家庭保障 #財務規劃"
  },
  {
    title: messages.contentStudio.coverText,
    content: "守住家人依靠的收入。"
  }
];

const promptFields = [
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

const promptPreview =
  "請為正在比較保障選項的年輕家庭，建立一支保險教育短影音腳本。強調保險規劃要保護日常生活，而不只是未來目標。腳本請控制在 60 秒內，避免艱深術語，並以邀請觀眾檢視目前保障作結。";

const assistantSuggestions = [
  "挑選一個客戶問題，轉成 30 秒回答。",
  "先選一張主題卡，再填寫開場吸引句與完整腳本。",
  "讓行動呼籲更有人味：邀請對話，而不是像自動化指令。"
];

export function ContentPage() {
  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
      <section className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-primary">
              {messages.navigation.content}
            </p>
            <h2 className="mt-2 text-3xl font-semibold tracking-normal">
              把保險想法整理成短影音內容
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              在 AI 產生與後端儲存加入前，先用示範主題卡與腳本區塊規劃影片點子。
            </p>
          </div>
          <Badge variant="secondary" className="w-fit">
            {messages.common.staticWorkspace}
          </Badge>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>主題選擇器</CardTitle>
            <CardDescription>
              選擇一個保險主題，作為下一支影片點子的框架。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {topics.map((topic) => (
                <Card key={topic.title} className="min-h-36 shadow-none">
                  <CardHeader>
                    <CardTitle>{topic.title}</CardTitle>
                    <CardDescription>{topic.description}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-1">
                <CardTitle>{messages.contentStudio.aiScriptGenerator}</CardTitle>
                <CardDescription>
                  用靜態控制項規劃未來的 AI 保險短影音腳本。
                </CardDescription>
              </div>
              <Badge variant="outline" className="w-fit">
                {messages.common.uiOnly}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
              {generatorControls.map((control) => (
                <div
                  key={control.label}
                  className="rounded-lg border bg-background p-4"
                >
                  <p className="text-xs font-medium uppercase text-muted-foreground">
                    {control.label}
                  </p>
                  <p className="mt-2 text-sm font-semibold">{control.value}</p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {control.options.map((option) => (
                      <Badge
                        key={option}
                        variant={option === control.value ? "secondary" : "outline"}
                      >
                        {option}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <Button>{messages.contentStudio.generateScript}</Button>

            <div className="grid gap-4 lg:grid-cols-2">
              {generatorPreviews.map((preview) => (
                <Card key={preview.title} className="shadow-none">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-3">
                      <CardTitle>{preview.title}</CardTitle>
                      <Badge variant="outline">{messages.common.preview}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="min-h-24 rounded-md border bg-secondary/40 p-4 text-sm leading-6">
                      {preview.content}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-1">
                <CardTitle>{messages.contentStudio.promptBuilder}</CardTitle>
                <CardDescription>
                  用靜態可編輯欄位整理未來的 AI 腳本提示詞。
                </CardDescription>
              </div>
              <Button variant="outline">{messages.contentStudio.copyPrompt}</Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 lg:grid-cols-2">
              {promptFields.map((field) => (
                <label key={field.label} className="space-y-2">
                  <span className="text-sm font-medium">{field.label}</span>
                  {field.multiline ? (
                    <textarea
                      className="min-h-28 w-full resize-none rounded-md border bg-background px-3 py-2 text-sm leading-6 outline-none transition-colors placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
                      defaultValue={field.value}
                    />
                  ) : (
                    <input
                      className="h-10 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
                      defaultValue={field.value}
                    />
                  )}
                </label>
              ))}
            </div>

            <div className="rounded-lg border bg-secondary/40 p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold">提示詞預覽</p>
                <Badge variant="outline">{messages.common.readOnly}</Badge>
              </div>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                {promptPreview}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>腳本工作區</CardTitle>
            <CardDescription>
              在真正產生腳本前，先用示範區塊規劃影片內容。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 lg:grid-cols-2">
              {workspaceSections.map((section) => (
                <Card key={section.title} className="shadow-none">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-3">
                      <CardTitle>{section.title}</CardTitle>
                      <Badge variant="outline">{messages.common.draft}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="min-h-24 rounded-md border border-dashed bg-muted/40 p-4 text-sm leading-6 text-muted-foreground">
                      {section.placeholder}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      <aside className="space-y-4">
        <Card className="xl:sticky xl:top-24">
          <CardHeader>
            <CardTitle>{messages.common.contentAssistant}</CardTitle>
            <CardDescription>
              用於規劃影片點子的示範建議。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {assistantSuggestions.map((suggestion) => (
                <li
                  key={suggestion}
                  className="rounded-md border bg-secondary/50 px-3 py-3 text-sm leading-6"
                >
                  {suggestion}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}
