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
import type { ThumbnailRatio, ThumbnailStyle } from "../types";

type ThumbnailPromptBuilderProps = {
  prompt: string;
  style: ThumbnailStyle;
  ratio: ThumbnailRatio;
  includePerson: boolean;
  message: string | null;
  onCopy: () => void;
  onStyleChange: (value: ThumbnailStyle) => void;
  onRatioChange: (value: ThumbnailRatio) => void;
  onIncludePersonChange: (value: boolean) => void;
};

export function ThumbnailPromptBuilder({
  prompt,
  style,
  ratio,
  includePerson,
  message,
  onCopy,
  onStyleChange,
  onRatioChange,
  onIncludePersonChange
}: ThumbnailPromptBuilderProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <CardTitle>縮圖 Prompt Builder</CardTitle>
            <CardDescription>
              根據目前腳本標題、開場、主題與目標客群建立縮圖圖像 Prompt。
            </CardDescription>
          </div>
          <Button variant="outline" onClick={onCopy}>
            複製縮圖 Prompt
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 md:grid-cols-3">
          <label className="space-y-2">
            <span className="text-sm font-medium">風格</span>
            <select
              className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              value={style}
              onChange={(event) => onStyleChange(event.target.value as ThumbnailStyle)}
            >
              <option value="寫實">寫實</option>
              <option value="插畫">插畫</option>
              <option value="3D">3D</option>
              <option value="動漫">動漫</option>
            </select>
          </label>
          <label className="space-y-2">
            <span className="text-sm font-medium">比例</span>
            <select
              className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              value={ratio}
              onChange={(event) => onRatioChange(event.target.value as ThumbnailRatio)}
            >
              <option value="9:16">9:16</option>
              <option value="16:9">16:9</option>
              <option value="1:1">1:1</option>
            </select>
          </label>
          <label className="flex items-center gap-3 rounded-md border bg-background px-3 py-2 text-sm">
            <input
              type="checkbox"
              checked={includePerson}
              onChange={(event) => onIncludePersonChange(event.target.checked)}
            />
            包含人物
          </label>
        </div>

        <div className="rounded-lg border bg-secondary/40 p-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold">縮圖 Prompt 預覽</p>
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
