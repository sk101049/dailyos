import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import type { SavedScript, ScriptStatus } from "../types";

type ScriptLibraryProps = {
  scripts: SavedScript[];
  status: ScriptStatus;
  message: string | null;
  onStatusChange: (status: ScriptStatus) => void;
  onSave: () => void;
  onLoad: (script: SavedScript) => void;
  onDelete: (id: string) => void;
};

export function ScriptLibrary({
  scripts,
  status,
  message,
  onStatusChange,
  onSave,
  onLoad,
  onDelete
}: ScriptLibraryProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <CardTitle>腳本庫</CardTitle>
            <CardDescription>
              將目前預覽卡片儲存在此瀏覽器，稍後可載入或刪除。
            </CardDescription>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <select
              className="h-10 rounded-md border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              value={status}
              onChange={(event) => onStatusChange(event.target.value as ScriptStatus)}
            >
              <option value="草稿">草稿</option>
              <option value="已完成">已完成</option>
              <option value="已發布">已發布</option>
            </select>
            <Button onClick={onSave}>儲存目前腳本</Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {message ? (
          <p className="rounded-md border bg-background px-3 py-2 text-sm text-muted-foreground">
            {message}
          </p>
        ) : null}
        {scripts.length === 0 ? (
          <div className="rounded-lg border border-dashed bg-muted/40 p-4 text-sm text-muted-foreground">
            尚未儲存腳本。
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {scripts.map((script) => (
              <Card key={script.id} className="shadow-none">
                <CardHeader>
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <CardTitle>{script.title}</CardTitle>
                      <CardDescription>
                        {script.topic} / {script.targetAudience}
                      </CardDescription>
                    </div>
                    <Badge variant="outline">{script.status}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="line-clamp-3 text-sm leading-6 text-muted-foreground">
                    {script.hook}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => onLoad(script)}
                    >
                      載入
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDelete(script.id)}
                    >
                      刪除
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
