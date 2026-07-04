import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import type { StoryboardRow } from "../types";

type StoryboardBuilderProps = {
  rows: StoryboardRow[];
  message: string | null;
  onBuild: () => void;
  onCopy: () => void;
  onAdd: () => void;
  onDelete: (id: string) => void;
  onUpdate: (
    id: string,
    field: keyof Omit<StoryboardRow, "id">,
    value: string
  ) => void;
};

export function StoryboardBuilder({
  rows,
  message,
  onBuild,
  onCopy,
  onAdd,
  onDelete,
  onUpdate
}: StoryboardBuilderProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <CardTitle>分鏡腳本</CardTitle>
            <CardDescription>
              將目前腳本整理成可編輯的短影音分鏡。
            </CardDescription>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button variant="outline" onClick={onBuild}>
              從目前腳本建立分鏡
            </Button>
            <Button variant="outline" onClick={onCopy}>
              複製分鏡
            </Button>
            <Button onClick={onAdd}>新增鏡次</Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {rows.map((row) => (
          <div
            key={row.id}
            className="grid gap-3 rounded-lg border bg-background p-4 lg:grid-cols-[80px_minmax(0,1fr)_minmax(0,1fr)]"
          >
            <label className="space-y-2">
              <span className="text-sm font-medium">鏡次</span>
              <input
                className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={row.shot}
                onChange={(event) => onUpdate(row.id, "shot", event.target.value)}
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium">畫面描述</span>
              <textarea
                className="min-h-24 w-full resize-y rounded-md border bg-background px-3 py-2 text-sm leading-6 outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={row.visual}
                onChange={(event) => onUpdate(row.id, "visual", event.target.value)}
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium">旁白</span>
              <textarea
                className="min-h-24 w-full resize-y rounded-md border bg-background px-3 py-2 text-sm leading-6 outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={row.narration}
                onChange={(event) => onUpdate(row.id, "narration", event.target.value)}
              />
            </label>
            <label className="space-y-2 lg:col-start-2">
              <span className="text-sm font-medium">字幕</span>
              <input
                className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={row.subtitle}
                onChange={(event) => onUpdate(row.id, "subtitle", event.target.value)}
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium">B-roll</span>
              <input
                className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={row.broll}
                onChange={(event) => onUpdate(row.id, "broll", event.target.value)}
              />
            </label>
            <div className="flex items-end lg:col-start-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDelete(row.id)}
              >
                刪除
              </Button>
            </div>
          </div>
        ))}
        {message ? (
          <p className="rounded-md border bg-background px-3 py-2 text-sm text-muted-foreground">
            {message}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
