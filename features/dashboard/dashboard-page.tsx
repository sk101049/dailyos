import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { messages } from "@/messages/zh-TW";

const dashboardCards = [
  {
    title: "今日任務",
    value: "6 項待辦",
    detail: "優先處理客戶追蹤、準備事項與內容任務。",
    status: "焦點"
  },
  {
    title: "影片流程",
    value: "2 份草稿",
    detail: "有一個教育主題今天可以開始錄製。",
    status: "內容"
  },
  {
    title: "客戶追蹤",
    value: "3 位客戶",
    detail: "檢查近期保單問題與續約時程。",
    status: messages.navigation.crm
  },
  {
    title: messages.crm.appointments,
    value: "4 場已排程",
    detail: "今天結束前先確認明天的會議內容。",
    status: "行事曆"
  },
  {
    title: "銷售進度",
    value: "68%",
    detail: "掌握進行中的機會與下一步關係經營。",
    status: "流程"
  }
];

const suggestions = [
  "追蹤 3 位客戶。",
  "錄製一支保險教育影片。",
  "準備明天的預約會議。"
];

export function DashboardPage() {
  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
      <section className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-primary">第 1 衝刺</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-normal">
              今日優先事項
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              在後端資料與 AI 自動化加入前，先用示範工作儀表板檢視每日保險工作。
            </p>
          </div>
          <Badge variant="secondary" className="w-fit">
            {messages.common.placeholderData}
          </Badge>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {dashboardCards.map((card) => (
            <Card key={card.title} className="min-h-44">
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <CardTitle>{card.title}</CardTitle>
                    <CardDescription>{card.detail}</CardDescription>
                  </div>
                  <Badge variant="outline">{card.status}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-semibold">{card.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <aside className="space-y-4">
        <Card className="xl:sticky xl:top-24">
          <CardHeader>
            <CardTitle>{messages.common.aiAssistant}</CardTitle>
            <CardDescription>
              用於規劃今日工作的示範建議。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {suggestions.map((suggestion) => (
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
