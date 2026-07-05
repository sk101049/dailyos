"use client";

import Link from "next/link";
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

type CreatorProject = {
  id: string;
  name: string;
  description: string;
  brand: string;
  defaultCharacterId: string;
  defaultVoiceId: string;
  defaultVideoProvider: string;
  scriptIds: string[];
  storyboardIds: string[];
  videoIds: string[];
  calendarItemIds: string[];
  publishingItemIds: string[];
  status: "active" | "archived";
  createdAt: string;
  updatedAt: string;
};

type Inspiration = {
  title: string;
  category: string;
  description: string;
  region: "台灣" | "全球";
};

const PROJECTS_KEY = "dailyos-projects";
const ACTIVE_PROJECT_KEY = "dailyos-active-project-id";
const DASHBOARD_PROJECT_KEY = "dailyos-creator-dashboard-project";

const inspirations: Inspiration[] = [
  {
    title: "AI 工具如何改變日常工作",
    category: "AI",
    description: "把一個實用工具拆成 3 個生活化使用情境。",
    region: "全球"
  },
  {
    title: "小資族每月現金流檢查",
    category: "財經",
    description: "用簡單清單提醒觀眾看懂收入、支出與備用金。",
    region: "台灣"
  },
  {
    title: "首購族看房前要準備什麼",
    category: "房地產",
    description: "整理預算、貸款、生活圈與風險提醒。",
    region: "台灣"
  },
  {
    title: "有醫療險就夠了嗎",
    category: "保險",
    description: "用短影音說清楚醫療險與完整保障的差異。",
    region: "台灣"
  },
  {
    title: "外食族的一週健康習慣",
    category: "健康",
    description: "用不說教的方式提供 3 個可執行選擇。",
    region: "全球"
  },
  {
    title: "親子週末半日旅行",
    category: "旅遊",
    description: "把行程、預算與備案整理成短影音腳本。",
    region: "台灣"
  }
];

function readProjects() {
  try {
    const saved = window.localStorage.getItem(PROJECTS_KEY);
    const parsed = saved ? (JSON.parse(saved) as CreatorProject[]) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function TrendPage() {
  const [message, setMessage] = useState<string | null>(null);

  function createProject(item: Inspiration) {
    const now = new Date().toISOString();
    const project: CreatorProject = {
      id: crypto.randomUUID(),
      name: item.title,
      description: `${item.category}｜${item.description}`,
      brand: item.region,
      defaultCharacterId: "",
      defaultVoiceId: "",
      defaultVideoProvider: "Gemini",
      scriptIds: [],
      storyboardIds: [],
      videoIds: [],
      calendarItemIds: [],
      publishingItemIds: [],
      status: "active",
      createdAt: now,
      updatedAt: now
    };
    const next = [project, ...readProjects()];

    window.localStorage.setItem(PROJECTS_KEY, JSON.stringify(next));
    window.localStorage.setItem(ACTIVE_PROJECT_KEY, project.id);
    window.localStorage.setItem(DASHBOARD_PROJECT_KEY, project.name);
    setMessage(`已建立「${project.name}」，並設為今日專案。`);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-primary">趨勢中心</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-normal">
            今天可以拍什麼？
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            從台灣與全球靈感清單挑一個方向，一鍵建立本機專案。
          </p>
        </div>
        <Badge variant="secondary" className="w-fit">
          僅本機儲存
        </Badge>
      </div>

      {message ? (
        <p className="rounded-md border bg-background px-3 py-2 text-sm text-muted-foreground">
          {message}
        </p>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {inspirations.map((item) => (
          <Card key={item.title}>
            <CardHeader>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <CardTitle>{item.title}</CardTitle>
                  <CardDescription>{item.description}</CardDescription>
                </div>
                <Badge variant="outline">{item.region}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">分類：{item.category}</p>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" onClick={() => createProject(item)}>
                  建立專案
                </Button>
                <Button asChild size="sm" variant="outline">
                  <Link href="/projects">查看專案</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
