"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { messages } from "@/messages/zh-TW";

type PublishingStatus = "待製作" | "待剪輯" | "待發布" | "已發布";

type PublishingItem = {
  id: string;
  title: string;
  platform: string;
  status: PublishingStatus;
  scheduledDate: string;
  note: string;
  sourceCalendarTaskId?: string;
};

const STORAGE_KEY = "dailyos-publishing-center";

const publishingStatuses: PublishingStatus[] = [
  "待製作",
  "待剪輯",
  "待發布",
  "已發布"
];

const initialItems: PublishingItem[] = [
  {
    id: "income-protection",
    title: "收入中斷時，家庭還能撐多久？",
    platform: "YouTube Shorts",
    status: "待剪輯",
    scheduledDate: "2026-07-06",
    note: "補上字幕與封面圖。"
  },
  {
    id: "medical-policy",
    title: "買醫療險前先問的 3 個問題",
    platform: "Instagram Reels",
    status: "待發布",
    scheduledDate: "2026-07-08",
    note: "發布前檢查 CTA。"
  },
  {
    id: "retirement-plan",
    title: "退休規劃不要只看數字",
    platform: "TikTok",
    status: "待製作",
    scheduledDate: "2026-07-10",
    note: "先錄 60 秒口播版本。"
  },
  {
    id: "family-coverage",
    title: "家庭保障檢視清單",
    platform: "Facebook Reels",
    status: "已發布",
    scheduledDate: "2026-07-02",
    note: "觀察留言問題，整理下一支主題。"
  }
];

export function PublishingPage() {
  const [items, setItems] = useState<PublishingItem[]>(initialItems);
  const [hasLoadedItems, setHasLoadedItems] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      setHasLoadedItems(true);
      return;
    }

    try {
      const parsed = JSON.parse(saved) as PublishingItem[];
      if (Array.isArray(parsed)) {
        setItems(parsed);
      }
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    } finally {
      setHasLoadedItems(true);
    }
  }, []);

  useEffect(() => {
    if (!hasLoadedItems) {
      return;
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [hasLoadedItems, items]);

  function updateStatus(id: string, status: PublishingStatus) {
    setItems((current) =>
      current.map((item) => (item.id === id ? { ...item, status } : item))
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-primary">
            {messages.navigation.publishing}
          </p>
          <h2 className="mt-2 text-3xl font-semibold tracking-normal">
            短影音發布進度
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            用本機 UI 管理 YouTube Shorts、TikTok、Instagram Reels 與 Facebook Reels 的發布狀態。
          </p>
        </div>
        <Badge variant="secondary" className="w-fit">
          {messages.common.placeholderData}
        </Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {publishingStatuses.map((status) => (
          <Card key={status} className="min-h-36">
            <CardHeader>
              <CardTitle>{status}</CardTitle>
              <CardDescription>目前影片數量</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold">
                {items.filter((item) => item.status === status).length}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>發布清單</CardTitle>
          <CardDescription>
            管理內容標題、平台、狀態、預定發布日期與備註。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="border-b text-muted-foreground">
                <tr>
                  <th className="py-3 pr-4 font-medium">標題</th>
                  <th className="py-3 pr-4 font-medium">平台</th>
                  <th className="py-3 pr-4 font-medium">狀態</th>
                  <th className="py-3 pr-4 font-medium">預定發布日期</th>
                  <th className="py-3 font-medium">備註</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {items.map((item) => (
                  <tr key={item.id}>
                    <td className="py-4 pr-4 font-medium">{item.title}</td>
                    <td className="py-4 pr-4 text-muted-foreground">
                      {item.platform}
                    </td>
                    <td className="py-4 pr-4">
                      <select
                        className="h-10 rounded-md border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        value={item.status}
                        onChange={(event) =>
                          updateStatus(item.id, event.target.value as PublishingStatus)
                        }
                      >
                        {publishingStatuses.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-4 pr-4 text-muted-foreground">
                      {item.scheduledDate}
                    </td>
                    <td className="py-4 leading-6 text-muted-foreground">
                      {item.note}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
