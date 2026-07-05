"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import type { GeneratedScript, StoryboardRow } from "../types";

type AIImageStudioProps = {
  script: GeneratedScript;
  storyboardRows: StoryboardRow[];
};

type ReferenceMode = "character" | "style" | "both";

type LibraryItem = {
  id: string;
  title: string;
  description: string;
  prompt: string;
};

function fileNames(files: FileList | null) {
  return Array.from(files ?? []).map((file) => file.name);
}

function compactList(items: string[]) {
  return items.length > 0 ? items.join(", ") : "尚未上傳參考";
}

export function AIImageStudio({ script, storyboardRows }: AIImageStudioProps) {
  const [characterReferences, setCharacterReferences] = useState<string[]>([]);
  const [styleReferences, setStyleReferences] = useState<string[]>([]);
  const [storyboardReferences, setStoryboardReferences] = useState<string[]>([]);
  const [referenceMode, setReferenceMode] = useState<ReferenceMode>("both");
  const [message, setMessage] = useState<string | null>(null);
  const [characterLibrary, setCharacterLibrary] = useState<LibraryItem[]>([]);
  const [storyboardLibrary, setStoryboardLibrary] = useState<LibraryItem[]>([]);

  const promptPackage = useMemo(() => {
    const scenes = storyboardRows
      .map((row) => `${row.shot}. ${row.visual || row.subtitle || row.narration}`)
      .join("\n");

    return [
      `Project: ${script.title}`,
      "Goal: Generate reusable character template and storyboard images.",
      "Character: friendly female insurance knowledge host, age 30-40, natural, trustworthy, warm, social-media ready.",
      "Style: bright 9:16 vertical insurance education short, large fixed text, clean layout, consistent outfit and colors.",
      `Reference mode: ${referenceMode}`,
      `Character references: ${compactList(characterReferences)}`,
      `Style references: ${compactList(styleReferences)}`,
      `Storyboard layout references: ${compactList(storyboardReferences)}`,
      "Script:",
      script.script,
      "Storyboard scenes:",
      scenes || "Use the current script to create 7 clear storyboard frames."
    ].join("\n");
  }, [
    characterReferences,
    referenceMode,
    script.script,
    script.title,
    storyboardReferences,
    storyboardRows,
    styleReferences
  ]);

  function generateCharacterTemplate() {
    const item: LibraryItem = {
      id: crypto.randomUUID(),
      title: `${script.title} 人物模板`,
      description: "包含身分、服裝、色彩、表情與手勢的人物模板草稿。",
      prompt: promptPackage
    };

    setCharacterLibrary((items) => [item, ...items]);
    setMessage("已儲存人物模板提示詞。");
  }

  function generateStoryboardImages() {
    const item: LibraryItem = {
      id: crypto.randomUUID(),
      title: `${script.title} 分鏡圖像包`,
      description: "包含場次圖、完整分鏡表與生成提示詞的草稿。",
      prompt: promptPackage
    };

    setStoryboardLibrary((items) => [item, ...items]);
    setMessage("已儲存分鏡圖像提示詞。");
  }

  async function copyPromptPackage() {
    if (!navigator.clipboard?.writeText) {
      setMessage("目前無法使用剪貼簿，請從下方手動複製。");
      return;
    }

    await navigator.clipboard.writeText(promptPackage);
    setMessage("已複製提示詞包。");
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-1">
            <CardTitle>AI 圖像工作室</CardTitle>
            <CardDescription>
              從目前腳本整理人物模板與分鏡圖像提示詞。
            </CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={generateCharacterTemplate}>
              產生人物模板
            </Button>
            <Button onClick={generateStoryboardImages}>
              產生分鏡圖像
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <section className="grid gap-3 lg:grid-cols-4">
          <label className="space-y-2 rounded-lg border bg-background p-3">
            <span className="text-sm font-medium">上傳人物參考</span>
            <input
              type="file"
              multiple
              accept="image/*"
              className="w-full text-sm text-muted-foreground"
              onChange={(event) => setCharacterReferences(fileNames(event.target.files))}
            />
            <span className="block text-xs text-muted-foreground">
              人物：{compactList(characterReferences)}
            </span>
          </label>
          <label className="space-y-2 rounded-lg border bg-background p-3">
            <span className="text-sm font-medium">風格參考板</span>
            <input
              type="file"
              multiple
              accept="image/*"
              className="w-full text-sm text-muted-foreground"
              onChange={(event) => setStyleReferences(fileNames(event.target.files))}
            />
            <span className="block text-xs text-muted-foreground">
              風格：{compactList(styleReferences)}
            </span>
          </label>
          <label className="space-y-2 rounded-lg border bg-background p-3">
            <span className="text-sm font-medium">分鏡版面</span>
            <input
              type="file"
              multiple
              accept="image/*"
              className="w-full text-sm text-muted-foreground"
              onChange={(event) => setStoryboardReferences(fileNames(event.target.files))}
            />
            <span className="block text-xs text-muted-foreground">
              版面：{compactList(storyboardReferences)}
            </span>
          </label>
          <label className="space-y-2 rounded-lg border bg-background p-3">
            <span className="text-sm font-medium">套用參考到</span>
            <select
              className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              value={referenceMode}
              onChange={(event) => setReferenceMode(event.target.value as ReferenceMode)}
            >
              <option value="both">人物與風格</option>
              <option value="character">只套用人物</option>
              <option value="style">只套用風格</option>
            </select>
          </label>
        </section>

        <section className="grid gap-4 xl:grid-cols-2">
          <div className="rounded-lg border bg-secondary/40 p-4">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-sm font-semibold">人物模板庫</h3>
              <Badge variant="outline">模板表</Badge>
            </div>
            <div className="mt-3 space-y-2">
              {characterLibrary.length === 0 ? (
                <p className="text-sm text-muted-foreground">尚無人物模板。</p>
              ) : (
                characterLibrary.map((item) => (
                  <article key={item.id} className="rounded-md border bg-background p-3">
                    <p className="text-sm font-medium">{item.title}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{item.description}</p>
                  </article>
                ))
              )}
            </div>
          </div>
          <div className="rounded-lg border bg-secondary/40 p-4">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-sm font-semibold">分鏡圖像庫</h3>
              <Badge variant="outline">場景圖</Badge>
            </div>
            <div className="mt-3 space-y-2">
              {storyboardLibrary.length === 0 ? (
                <p className="text-sm text-muted-foreground">尚無分鏡圖像包。</p>
              ) : (
                storyboardLibrary.map((item) => (
                  <article key={item.id} className="rounded-md border bg-background p-3">
                    <p className="text-sm font-medium">{item.title}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{item.description}</p>
                  </article>
                ))
              )}
            </div>
          </div>
        </section>

        <section className="rounded-lg border bg-background p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-sm font-semibold">提示詞包</h3>
              <p className="text-xs text-muted-foreground">
                包含人物表、單場景圖、完整分鏡表與生成備註。
              </p>
            </div>
            <Button variant="outline" onClick={copyPromptPackage}>
              複製提示詞包
            </Button>
          </div>
          <pre className="mt-3 max-h-72 overflow-auto whitespace-pre-wrap break-words rounded-md bg-secondary/40 p-3 text-sm leading-6 text-muted-foreground">
            {promptPackage}
          </pre>
        </section>

        {message ? (
          <p className="rounded-md border bg-background px-3 py-2 text-sm text-muted-foreground">
            {message}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
