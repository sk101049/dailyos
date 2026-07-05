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

type Asset = { id: string; title?: string; name?: string; prompt?: string; coverText?: string; script?: string };

type AssetGroup = {
  label: string;
  icon: string;
  items: Array<Asset & { kind: string }>;
};

const FAVORITES_KEY = "dailyos-asset-favorites";

function readArray<T>(key: string): T[] {
  try {
    const saved = window.localStorage.getItem(key);
    const parsed = saved ? (JSON.parse(saved) as T[]) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function labelOf(asset: Asset) {
  return asset.title ?? asset.name ?? asset.coverText ?? asset.id;
}

export function AssetPage() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("全部");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [groups, setGroups] = useState<AssetGroup[]>([]);

  useEffect(() => {
    setFavorites(readArray<string>(FAVORITES_KEY));
    setGroups([
      { label: "人物模板", icon: "👤", items: readArray<Asset>("dailyos-character-library").map((item) => ({ ...item, kind: "人物模板" })) },
      { label: "配音", icon: "🎙️", items: readArray<Asset>("dailyos-voice-library").map((item) => ({ ...item, kind: "配音" })) },
      { label: "分鏡", icon: "🎬", items: readArray<Asset>("dailyos-storyboard-v2").map((item, index) => ({ ...item, id: item.id ?? `storyboard-${index}`, title: item.title ?? `分鏡 ${index + 1}`, kind: "分鏡" })) },
      { label: "封面", icon: "🖼️", items: readArray<Asset>("dailyos-script-library").filter((item) => item.coverText).map((item) => ({ ...item, title: item.coverText, kind: "封面" })) },
      { label: "成品影片", icon: "🎥", items: readArray<Asset>("dailyos-rendered-videos").map((item) => ({ ...item, kind: "成品影片" })) },
      { label: "Prompt", icon: "📝", items: readArray<Asset>("dailyos-script-library").map((item) => ({ ...item, title: item.title ?? "腳本 Prompt", kind: "Prompt" })) },
      { label: "Production Package", icon: "📦", items: readArray<Asset>("dailyos-video-packages").map((item) => ({ ...item, kind: "Production Package" })) }
    ]);
  }, []);

  const filteredGroups = useMemo(
    () =>
      groups
        .filter((group) => filter === "全部" || group.label === filter)
        .map((group) => ({
          ...group,
          items: group.items.filter((item) =>
            labelOf(item).toLowerCase().includes(query.trim().toLowerCase())
          )
        })),
    [filter, groups, query]
  );

  function toggleFavorite(id: string) {
    const next = favorites.includes(id)
      ? favorites.filter((item) => item !== id)
      : [...favorites, id];
    setFavorites(next);
    window.localStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-primary">素材庫</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-normal">可重用創作素材</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            集中查看人物、配音、分鏡、封面、成品影片、Prompt 與製作包。
          </p>
        </div>
        <Badge variant="secondary" className="w-fit">僅本機儲存</Badge>
      </div>

      <Card>
        <CardContent className="grid gap-3 pt-5 md:grid-cols-[minmax(0,1fr)_220px]">
          <input
            className="h-10 rounded-md border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="搜尋素材..."
          />
          <select
            className="h-10 rounded-md border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
          >
            {["全部", ...groups.map((group) => group.label)].map((item) => <option key={item}>{item}</option>)}
          </select>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {filteredGroups.map((group) => (
          <details key={group.label} open className="rounded-lg border bg-card">
            <summary className="cursor-pointer px-5 py-4 text-sm font-semibold">
              {group.icon} {group.label}（{group.items.length}）
            </summary>
            <div className="grid gap-3 border-t p-5 md:grid-cols-2 xl:grid-cols-3">
              {group.items.length === 0 ? (
                <p className="text-sm text-muted-foreground">尚無素材。</p>
              ) : group.items.map((item) => (
                <article key={`${group.label}-${item.id}`} className="rounded-md border bg-background p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium">{labelOf(item)}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{item.kind}</p>
                    </div>
                    <Button size="sm" variant={favorites.includes(item.id) ? "default" : "outline"} onClick={() => toggleFavorite(item.id)}>
                      {favorites.includes(item.id) ? "已收藏" : "收藏"}
                    </Button>
                  </div>
                </article>
              ))}
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}
