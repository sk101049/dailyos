import { Badge } from "@/components/ui/badge";
import { messages } from "@/messages/zh-TW";

export function PageHero() {
  return (
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
  );
}
