"use client";

import { useEffect, useMemo, useState } from "react";
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

type ContentTaskStatus = "待製作" | "待剪輯" | "待發布" | "已發布";

type ContentTask = {
  id: string;
  title: string;
  platform: string;
  status: ContentTaskStatus;
  publishDate: string;
};

type TaskForm = Omit<ContentTask, "id">;

const STORAGE_KEY = "dailyos-content-calendar";
const statuses: ContentTaskStatus[] = ["待製作", "待剪輯", "待發布", "已發布"];
const platforms = ["YouTube Shorts", "TikTok", "Instagram Reels", "Facebook Reels"];
const weekdays = ["日", "一", "二", "三", "四", "五", "六"];

const initialTasks: ContentTask[] = [
  {
    id: "launch-medical",
    title: "醫療險三個常見問題",
    platform: "YouTube Shorts",
    status: "待製作",
    publishDate: "2026-07-08"
  },
  {
    id: "retirement-hook",
    title: "退休規劃開場短片",
    platform: "Instagram Reels",
    status: "待剪輯",
    publishDate: "2026-07-12"
  },
  {
    id: "family-cover",
    title: "家庭保障檢視提醒",
    platform: "Facebook Reels",
    status: "待發布",
    publishDate: "2026-07-18"
  }
];

function toDateValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function monthLabel(date: Date) {
  return `${date.getFullYear()} 年 ${date.getMonth() + 1} 月`;
}

function buildMonthDays(month: Date) {
  const firstDay = new Date(month.getFullYear(), month.getMonth(), 1);
  const firstGridDay = new Date(firstDay);
  firstGridDay.setDate(firstDay.getDate() - firstDay.getDay());

  return Array.from({ length: 42 }, (_, index) => {
    const day = new Date(firstGridDay);
    day.setDate(firstGridDay.getDate() + index);
    return day;
  });
}

function emptyForm(date: string): TaskForm {
  return {
    title: "",
    platform: platforms[0],
    status: "待製作",
    publishDate: date
  };
}

export function CalendarPage() {
  const today = toDateValue(new Date());
  const [currentMonth, setCurrentMonth] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState(today);
  const [tasks, setTasks] = useState<ContentTask[]>(initialTasks);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<TaskForm>(() => emptyForm(today));

  const monthDays = useMemo(() => buildMonthDays(currentMonth), [currentMonth]);
  const selectedTasks = tasks.filter((task) => task.publishDate === selectedDate);

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      return;
    }

    try {
      const parsed = JSON.parse(saved) as ContentTask[];
      if (Array.isArray(parsed)) {
        setTasks(parsed);
      }
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks]);

  function selectDate(date: string) {
    setSelectedDate(date);
    setEditingId(null);
    setForm(emptyForm(date));
  }

  function changeMonth(offset: number) {
    setCurrentMonth((month) => new Date(month.getFullYear(), month.getMonth() + offset, 1));
  }

  function saveTask() {
    if (!form.title.trim()) {
      return;
    }

    if (editingId) {
      setTasks((current) =>
        current.map((task) =>
          task.id === editingId ? { ...task, ...form, title: form.title.trim() } : task
        )
      );
    } else {
      setTasks((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          ...form,
          title: form.title.trim()
        }
      ]);
    }

    setEditingId(null);
    setForm(emptyForm(selectedDate));
  }

  function editTask(task: ContentTask) {
    setEditingId(task.id);
    setForm({
      title: task.title,
      platform: task.platform,
      status: task.status,
      publishDate: task.publishDate
    });
  }

  function deleteTask(id: string) {
    setTasks((current) => current.filter((task) => task.id !== id));
    if (editingId === id) {
      setEditingId(null);
      setForm(emptyForm(selectedDate));
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
      <section className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-primary">
              {messages.navigation.calendar}
            </p>
            <h2 className="mt-2 text-3xl font-semibold tracking-normal">
              內容排程月曆
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              用本機行事曆安排內容製作、剪輯與發布日期。
            </p>
          </div>
          <Badge variant="secondary" className="w-fit">
            localStorage
          </Badge>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle>{monthLabel(currentMonth)}</CardTitle>
                <CardDescription>點選日期查看或新增排程內容。</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => changeMonth(-1)}>
                  上個月
                </Button>
                <Button variant="outline" onClick={() => changeMonth(1)}>
                  下個月
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-7 gap-2 text-center text-xs font-medium text-muted-foreground">
              {weekdays.map((weekday) => (
                <div key={weekday}>{weekday}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-2">
              {monthDays.map((day) => {
                const dateValue = toDateValue(day);
                const dayTasks = tasks.filter((task) => task.publishDate === dateValue);
                const inMonth = day.getMonth() === currentMonth.getMonth();
                const selected = dateValue === selectedDate;

                return (
                  <button
                    key={dateValue}
                    className={[
                      "min-h-24 rounded-md border p-2 text-left transition-colors",
                      selected ? "border-primary bg-primary/10" : "bg-background hover:bg-secondary",
                      inMonth ? "text-foreground" : "text-muted-foreground"
                    ].join(" ")}
                    onClick={() => selectDate(dateValue)}
                  >
                    <span className="text-sm font-medium">{day.getDate()}</span>
                    <div className="mt-2 space-y-1">
                      {dayTasks.slice(0, 2).map((task) => (
                        <div
                          key={task.id}
                          className="truncate rounded bg-secondary px-2 py-1 text-xs"
                        >
                          {task.title}
                        </div>
                      ))}
                      {dayTasks.length > 2 ? (
                        <div className="text-xs text-muted-foreground">
                          +{dayTasks.length - 2} 項
                        </div>
                      ) : null}
                    </div>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </section>

      <aside className="space-y-4">
        <Card className="xl:sticky xl:top-24">
          <CardHeader>
            <CardTitle>{selectedDate}</CardTitle>
            <CardDescription>當日內容排程</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {selectedTasks.length === 0 ? (
                <p className="rounded-md border border-dashed bg-muted/40 p-3 text-sm text-muted-foreground">
                  這天尚未安排內容。
                </p>
              ) : (
                selectedTasks.map((task) => (
                  <div key={task.id} className="rounded-md border p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium">{task.title}</p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {task.platform}
                        </p>
                      </div>
                      <Badge variant="outline">{task.status}</Badge>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <Button variant="secondary" size="sm" onClick={() => editTask(task)}>
                        編輯
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => deleteTask(task.id)}>
                        刪除
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="space-y-3 rounded-md border bg-secondary/30 p-3">
              <p className="text-sm font-semibold">
                {editingId ? "編輯內容任務" : "新增內容任務"}
              </p>
              <label className="space-y-1">
                <span className="text-xs font-medium text-muted-foreground">標題</span>
                <input
                  className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={form.title}
                  onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                />
              </label>
              <label className="space-y-1">
                <span className="text-xs font-medium text-muted-foreground">平台</span>
                <select
                  className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={form.platform}
                  onChange={(event) => setForm((current) => ({ ...current, platform: event.target.value }))}
                >
                  {platforms.map((platform) => (
                    <option key={platform} value={platform}>
                      {platform}
                    </option>
                  ))}
                </select>
              </label>
              <label className="space-y-1">
                <span className="text-xs font-medium text-muted-foreground">狀態</span>
                <select
                  className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={form.status}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      status: event.target.value as ContentTaskStatus
                    }))
                  }
                >
                  {statuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </label>
              <label className="space-y-1">
                <span className="text-xs font-medium text-muted-foreground">發布日期</span>
                <input
                  type="date"
                  className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={form.publishDate}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, publishDate: event.target.value }))
                  }
                />
              </label>
              <div className="flex gap-2">
                <Button onClick={saveTask}>{editingId ? "儲存變更" : "新增任務"}</Button>
                {editingId ? (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setEditingId(null);
                      setForm(emptyForm(selectedDate));
                    }}
                  >
                    取消
                  </Button>
                ) : null}
              </div>
            </div>
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}
