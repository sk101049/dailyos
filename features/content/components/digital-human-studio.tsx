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
import type { GeneratedScript } from "../types";

type DigitalHumanStudioProps = {
  script: GeneratedScript;
};

type CharacterProfile = {
  id: string;
  name: string;
  references: string[];
  identityLock: string[];
};

type VoiceProfile = {
  id: string;
  name: string;
  samples: string[];
  style: string;
  speed: string;
  tone: string;
};

const identityLocks = [
  "臉部",
  "髮型",
  "髮色",
  "服裝",
  "身形比例",
  "視覺風格"
];

const workflowSteps = [
  "腳本",
  "口說優化",
  "聲音生成",
  "分鏡",
  "人物一致圖像",
  "影片生成",
  "OpenMontage"
];

function fileNames(files: FileList | null) {
  return Array.from(files ?? []).map((file) => file.name);
}

function naturalizeScript(text: string) {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) =>
      line
        .replace(/。/g, "。\n")
        .replace(/，/g, "， ")
        .replace(/、/g, "、 ")
        .replace(/\s+/g, " ")
        .trim()
    )
    .join("\n");
}

export function DigitalHumanStudio({ script }: DigitalHumanStudioProps) {
  const [characterName, setCharacterName] = useState("親切知識型主持人");
  const [characterReferences, setCharacterReferences] = useState<string[]>([]);
  const [lockedTraits, setLockedTraits] = useState<string[]>(identityLocks);
  const [voiceName, setVoiceName] = useState("溫暖繁中女聲");
  const [voiceSamples, setVoiceSamples] = useState<string[]>([]);
  const [speakingStyle, setSpeakingStyle] = useState("親切自然");
  const [speakingSpeed, setSpeakingSpeed] = useState("中速");
  const [emotionalTone, setEmotionalTone] = useState("溫暖專業");
  const [message, setMessage] = useState<string | null>(null);
  const [characterLibrary, setCharacterLibrary] = useState<CharacterProfile[]>([]);
  const [voiceLibrary, setVoiceLibrary] = useState<VoiceProfile[]>([]);
  const [optimizedScript, setOptimizedScript] = useState("");

  const identityPrompt = useMemo(
    () =>
      [
        `Character profile: ${characterName}`,
        `Locked traits: ${lockedTraits.join(", ")}`,
        `Reference photos: ${characterReferences.join(", ") || "None uploaded"}`,
        `Voice profile: ${voiceName}`,
        `Voice samples: ${voiceSamples.join(", ") || "None uploaded"}`,
        `Speaking style: ${speakingStyle}`,
        `Speed: ${speakingSpeed}`,
        `Emotional tone: ${emotionalTone}`,
        "Consistency rule: keep the same face, hairstyle, hair color, outfit, body proportions, voice style, pauses, emphasis, and emotional tone across every storyboard image and video scene."
      ].join("\n"),
    [
      characterName,
      characterReferences,
      emotionalTone,
      lockedTraits,
      speakingSpeed,
      speakingStyle,
      voiceName,
      voiceSamples
    ]
  );

  function toggleLock(trait: string) {
    setLockedTraits((current) =>
      current.includes(trait)
        ? current.filter((item) => item !== trait)
        : [...current, trait]
    );
  }

  function saveCharacterProfile() {
    setCharacterLibrary((items) => [
      {
        id: crypto.randomUUID(),
        name: characterName,
        references: characterReferences,
        identityLock: lockedTraits
      },
      ...items
    ]);
    setMessage("已儲存人物設定。");
  }

  function saveVoiceProfile() {
    setVoiceLibrary((items) => [
      {
        id: crypto.randomUUID(),
        name: voiceName,
        samples: voiceSamples,
        style: speakingStyle,
        speed: speakingSpeed,
        tone: emotionalTone
      },
      ...items
    ]);
    setMessage("已儲存聲音設定。");
  }

  function optimizeSpeech() {
    setOptimizedScript(naturalizeScript(script.script));
    setMessage("已將腳本改寫成較自然的口說節奏。");
  }

  async function copyIdentityPrompt() {
    if (!navigator.clipboard?.writeText) {
      setMessage("目前無法使用剪貼簿，請從下方手動複製。");
      return;
    }

    await navigator.clipboard.writeText(identityPrompt);
    setMessage("已複製數位人設定提示詞。");
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-1">
            <CardTitle>數位人工作室</CardTitle>
            <CardDescription>
              建立可重用的人物與聲音設定，讓 AI 影片主持人保持一致。
            </CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={saveCharacterProfile}>
              儲存人物
            </Button>
            <Button variant="outline" onClick={saveVoiceProfile}>
              儲存聲音
            </Button>
            <Button onClick={optimizeSpeech}>優化口說稿</Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <section className="grid gap-4 xl:grid-cols-2">
          <div className="space-y-4 rounded-lg border bg-background p-4">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-sm font-semibold">人物設定</h3>
              <Badge variant="outline">一致性鎖定</Badge>
            </div>
            <label className="space-y-2">
              <span className="text-sm font-medium">設定名稱</span>
              <input
                className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={characterName}
                onChange={(event) => setCharacterName(event.target.value)}
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium">參考照片</span>
              <input
                type="file"
                multiple
                accept="image/*"
                className="w-full text-sm text-muted-foreground"
                onChange={(event) => setCharacterReferences(fileNames(event.target.files))}
              />
              <span className="block text-xs text-muted-foreground">
                {characterReferences.join(", ") || "尚未上傳照片"}
              </span>
            </label>
            <div className="grid gap-2 sm:grid-cols-2">
              {identityLocks.map((trait) => (
                <label
                  key={trait}
                  className="flex items-center gap-2 rounded-md border bg-secondary/30 px-3 py-2 text-sm"
                >
                  <input
                    type="checkbox"
                    checked={lockedTraits.includes(trait)}
                    onChange={() => toggleLock(trait)}
                  />
                  {trait}
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-4 rounded-lg border bg-background p-4">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-sm font-semibold">聲音設定</h3>
              <Badge variant="outline">服務商中立</Badge>
            </div>
            <label className="space-y-2">
              <span className="text-sm font-medium">聲音設定名稱</span>
              <input
                className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={voiceName}
                onChange={(event) => setVoiceName(event.target.value)}
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium">合法持有的聲音樣本</span>
              <input
                type="file"
                multiple
                accept="audio/*"
                className="w-full text-sm text-muted-foreground"
                onChange={(event) => setVoiceSamples(fileNames(event.target.files))}
              />
              <span className="block text-xs text-muted-foreground">
                {voiceSamples.join(", ") || "尚未上傳樣本"}
              </span>
            </label>
            <div className="grid gap-3 md:grid-cols-3">
              <label className="space-y-2">
                <span className="text-sm font-medium">風格</span>
                <select
                  className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={speakingStyle}
                  onChange={(event) => setSpeakingStyle(event.target.value)}
                >
                  <option>親切自然</option>
                  <option>溫暖有活力</option>
                  <option>專業清楚</option>
                  <option>沉穩可信</option>
                </select>
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium">速度</span>
                <select
                  className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={speakingSpeed}
                  onChange={(event) => setSpeakingSpeed(event.target.value)}
                >
                  <option>慢速</option>
                  <option>中速</option>
                  <option>快速</option>
                </select>
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium">語氣</span>
                <select
                  className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={emotionalTone}
                  onChange={(event) => setEmotionalTone(event.target.value)}
                >
                  <option>溫暖專業</option>
                  <option>鼓勵</option>
                  <option>有同理心</option>
                  <option>有活力</option>
                </select>
              </label>
            </div>
          </div>
        </section>

        <section className="rounded-lg border bg-secondary/30 p-4">
          <h3 className="text-sm font-semibold">製作流程</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {workflowSteps.map((step, index) => (
              <div key={step} className="flex items-center gap-2">
                <Badge variant={index === 0 ? "default" : "outline"}>{step}</Badge>
                {index < workflowSteps.length - 1 ? (
                  <span className="text-muted-foreground">-&gt;</span>
                ) : null}
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-4 xl:grid-cols-2">
          <div className="rounded-lg border bg-background p-4">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-sm font-semibold">可重用資料庫</h3>
              <Badge variant="outline">
                {characterLibrary.length + voiceLibrary.length} 筆設定
              </Badge>
            </div>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase text-muted-foreground">
                  人物
                </p>
                {characterLibrary.length === 0 ? (
                  <p className="text-sm text-muted-foreground">尚無人物設定。</p>
                ) : (
                  characterLibrary.map((item) => (
                    <article key={item.id} className="rounded-md border bg-secondary/30 p-3">
                      <p className="text-sm font-medium">{item.name}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        已鎖定：{item.identityLock.join(", ")}
                      </p>
                    </article>
                  ))
                )}
              </div>
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase text-muted-foreground">
                  聲音
                </p>
                {voiceLibrary.length === 0 ? (
                  <p className="text-sm text-muted-foreground">尚無聲音設定。</p>
                ) : (
                  voiceLibrary.map((item) => (
                    <article key={item.id} className="rounded-md border bg-secondary/30 p-3">
                      <p className="text-sm font-medium">{item.name}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {item.style}, {item.speed}, {item.tone}
                      </p>
                    </article>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="rounded-lg border bg-background p-4">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-sm font-semibold">口說優化</h3>
              <Badge variant="outline">自然口吻</Badge>
            </div>
            <pre className="mt-3 max-h-64 overflow-auto whitespace-pre-wrap break-words rounded-md bg-secondary/40 p-3 text-sm leading-6 text-muted-foreground">
              {optimizedScript || "點選「優化口說稿」後，這裡會顯示更自然的口說節奏。"}
            </pre>
          </div>
        </section>

        <section className="rounded-lg border bg-background p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-sm font-semibold">一致性提示詞</h3>
              <p className="text-xs text-muted-foreground">
                可交給未來 TTS、圖像、影片或 OpenMontage 流程使用。
              </p>
            </div>
            <Button variant="outline" onClick={copyIdentityPrompt}>
              複製一致性提示詞
            </Button>
          </div>
          <pre className="mt-3 max-h-72 overflow-auto whitespace-pre-wrap break-words rounded-md bg-secondary/40 p-3 text-sm leading-6 text-muted-foreground">
            {identityPrompt}
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
