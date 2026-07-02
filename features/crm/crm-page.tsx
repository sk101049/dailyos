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

const summaryCards = [
  {
    title: messages.crm.activeLeads,
    value: "12",
    detail: "仍在洽談中的保險需求客戶。"
  },
  {
    title: messages.crm.followUpsDue,
    value: "5",
    detail: "今天需要處理的客戶接觸點。"
  },
  {
    title: messages.crm.appointments,
    value: "4",
    detail: "本週已安排的會議與檢視通話。"
  },
  {
    title: messages.crm.closedDeals,
    value: "3",
    detail: "近期已完成決策的客戶案件。"
  }
];

const customers = [
  {
    name: "陳怡君",
    need: "家庭保障檢視",
    stage: "追蹤中",
    nextFollowUpDate: "2026-07-03",
    nextAction: "週五前提供一份簡單的保單比較。"
  },
  {
    name: "吳志明",
    need: "退休收入規劃",
    stage: "已預約",
    nextFollowUpDate: "2026-07-05",
    nextAction: "為規劃通話準備三個關鍵問題。"
  },
  {
    name: "林佳蓉",
    need: "醫療與癌症保障",
    stage: "潛在客戶",
    nextFollowUpDate: "2026-07-08",
    nextAction: "確認目前保障缺口與家庭預算。"
  }
];

const assistantSuggestions = [
  "先處理追蹤日期是今天的客戶。",
  "每次預約前先準備一個清楚的下一步。",
  "將已結案對話移出進行中的追蹤清單。"
];

export function CrmPage() {
  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
      <section className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-primary">
              {messages.navigation.crm}
            </p>
            <h2 className="mt-2 text-3xl font-semibold tracking-normal">
              客戶追蹤與下一步行動
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              在後端儲存或整合加入前，先用靜態客戶管理工作區檢視示範客戶。
            </p>
          </div>
          <Badge variant="secondary" className="w-fit">
            {messages.common.placeholderData}
          </Badge>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {summaryCards.map((card) => (
            <Card key={card.title} className="min-h-40">
              <CardHeader>
                <CardTitle>{card.title}</CardTitle>
                <CardDescription>{card.detail}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-semibold">{card.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="text-xl font-semibold">客戶清單</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              用於每日追蹤規劃的示範客戶卡片。
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            {customers.map((customer) => (
              <Card key={customer.name}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <CardTitle>{customer.name}</CardTitle>
                      <CardDescription>{customer.need}</CardDescription>
                    </div>
                    <Badge variant="outline">{customer.stage}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-5">
                  <dl className="space-y-3 text-sm">
                    <div>
                      <dt className="text-muted-foreground">下次追蹤日期</dt>
                      <dd className="mt-1 font-medium">{customer.nextFollowUpDate}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">下一步行動</dt>
                      <dd className="mt-1 font-medium leading-6">{customer.nextAction}</dd>
                    </div>
                  </dl>

                  <div className="grid grid-cols-3 gap-2">
                    <Button variant="secondary" size="sm">
                      完成
                    </Button>
                    <Button variant="outline" size="sm">
                      延後
                    </Button>
                    <Button size="sm">結案</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <aside className="space-y-4">
        <Card className="xl:sticky xl:top-24">
          <CardHeader>
            <CardTitle>{messages.common.crmAssistant}</CardTitle>
            <CardDescription>
              用於客戶追蹤規劃的示範建議。
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
