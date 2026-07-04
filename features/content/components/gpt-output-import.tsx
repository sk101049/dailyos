import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";

type GptOutputImportProps = {
  value: string;
  message: string | null;
  onChange: (value: string) => void;
  onApply: () => void;
};

export function GptOutputImport({
  value,
  message,
  onChange,
  onApply
}: GptOutputImportProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <CardTitle>貼上 GPT 結果</CardTitle>
            <CardDescription>
              將 ChatGPT 產生的內容貼回 DailyOS，並套用到現有預覽卡片。
            </CardDescription>
          </div>
          <Button variant="outline" onClick={onApply}>
            套用到預覽卡片
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <textarea
          className="min-h-56 w-full resize-y rounded-md border bg-background px-3 py-2 text-sm leading-6 outline-none transition-colors placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
          placeholder={"標題：...\n開場吸引句：...\n腳本：...\n行動呼籲：...\n標籤：...\n封面文字：..."}
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
        {message ? (
          <p className="rounded-md border bg-background px-3 py-2 text-sm text-muted-foreground">
            {message}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
