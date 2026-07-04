"use client";

import { useState } from "react";
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

type CalendarStatus = "待製作" | "待剪輯" | "待發布" | "已發布";

type CalendarTask = {
  id: string;
  title: string;
  platform: string;
  status: CalendarStatus;
  publishDate: string;
};

type ScheduleForm = {
  platform: string;
  status: CalendarStatus;
  publishDate: string;
};

const CALENDAR_STORAGE_KEY = "dailyos-content-calendar";
const platforms = ["YouTube Shorts", "TikTok", "Instagram Reels", "Facebook Reels"];
const calendarStatuses: CalendarStatus[] = ["待製作", "待剪輯", "待發布", "已發布"];

function todayValue() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

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
  const [scheduleForms, setScheduleForms] = useState<Record<string, ScheduleForm>>({});
  const [scheduleMessage, setScheduleMessage] = useState<string | null>(null);

  function getForm(scriptId: string): ScheduleForm {
    return (
      scheduleForms[scriptId] ?? {
        platform: platforms[0],
        status: "待製作",
        publishDate: todayValue()
      }
    );
  }

  function updateScheduleForm(
    scriptId: string,
    field: keyof ScheduleForm,
    value: string
  ) {
    setScheduleForms((current) => ({
      ...current,
      [scriptId]: {
        ...getForm(scriptId),
        [field]: value
      }
    }));
  }

  function scheduleScript(script: SavedScript) {
    const form = getForm(script.id);
    let nextTasks: CalendarTask[] = [];

    if (!form.publishDate) {
      setScheduleMessage("請先選擇發布日期。");
      return;
    }

    try {
      const saved = window.localStorage.getItem(CALENDAR_STORAGE_KEY);
      const tasks = saved ? (JSON.parse(saved) as CalendarTask[]) : [];
      nextTasks = Array.isArray(tasks) ? tasks : [];
    } catch {
      nextTasks = [];
    }

    window.localStorage.setItem(
      CALENDAR_STORAGE_KEY,
      JSON.stringify([
        ...nextTasks,
        {
          id: crypto.randomUUID(),
          title: script.title,
          platform: form.platform,
          status: form.status,
          publishDate: form.publishDate
        }
      ])
    );
    setScheduleMessage(`已將「${script.title}」排程到內容行事曆。`);
  }

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
        {scheduleMessage ? (
          <p className="rounded-md border bg-background px-3 py-2 text-sm text-muted-foreground">
            {scheduleMessage}
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
                  <div className="grid gap-3 rounded-md border bg-secondary/30 p-3 md:grid-cols-3">
                    <label className="space-y-1">
                      <span className="text-xs font-medium text-muted-foreground">
                        發布日期
                      </span>
                      <input
                        type="date"
                        className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        value={getForm(script.id).publishDate}
                        onChange={(event) =>
                          updateScheduleForm(script.id, "publishDate", event.target.value)
                        }
                      />
                    </label>
                    <label className="space-y-1">
                      <span className="text-xs font-medium text-muted-foreground">
                        平台
                      </span>
                      <select
                        className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        value={getForm(script.id).platform}
                        onChange={(event) =>
                          updateScheduleForm(script.id, "platform", event.target.value)
                        }
                      >
                        {platforms.map((platform) => (
                          <option key={platform} value={platform}>
                            {platform}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="space-y-1">
                      <span className="text-xs font-medium text-muted-foreground">
                        狀態
                      </span>
                      <select
                        className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        value={getForm(script.id).status}
                        onChange={(event) =>
                          updateScheduleForm(script.id, "status", event.target.value)
                        }
                      >
                        {calendarStatuses.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => onLoad(script)}
                    >
                      載入
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => scheduleScript(script)}
                    >
                      排程到行事曆
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
