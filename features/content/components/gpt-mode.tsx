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

type GptModeProps = {
  prompt: string;
  message: string | null;
  onCopy: () => void;
  onOpenChatGpt: () => void;
};

export function GptMode({
  prompt,
  message,
  onCopy,
  onOpenChatGpt
}: GptModeProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <CardTitle>GPT 模式</CardTitle>
            <CardDescription>
              根據目前腳本產生器欄位，建立可貼到 ChatGPT 的繁體中文 Prompt。
            </CardDescription>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button variant="outline" onClick={onCopy}>
              複製 GPT Prompt
            </Button>
            <Button onClick={onOpenChatGpt}>開啟 ChatGPT</Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-lg border bg-secondary/40 p-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold">GPT Prompt 預覽</p>
            <Badge variant="outline">{messages.common.preview}</Badge>
          </div>
          <pre className="mt-3 whitespace-pre-wrap break-words text-sm leading-6 text-muted-foreground">
            {prompt}
          </pre>
        </div>
        {message ? (
          <p className="rounded-md border bg-background px-3 py-2 text-sm text-muted-foreground">
            {message}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
