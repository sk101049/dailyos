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
import { promptFields, promptPreview } from "../constants";

export function PromptBuilder() {
  return (
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
  );
}
