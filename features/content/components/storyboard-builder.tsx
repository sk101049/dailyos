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
import type { StoryboardRow } from "../types";

type CharacterProfile = {
  id: string;
  name: string;
  hairstyle?: string;
  hairColor?: string;
  outfit?: string;
  brandAttributes?: string;
  providerNotes?: string;
};

type VoiceProfile = {
  id: string;
  name: string;
  speakingStyle?: string;
  tone?: string;
  speed?: string;
  pauseLevel?: string;
  emotionalWarmth?: string;
  formalityLevel?: string;
};

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
  onApplyCharacterLock: (characterProfileId: string) => void;
  onApplyVoiceLock: (voiceProfileId: string) => void;
};

const CHARACTER_STORAGE_KEY = "dailyos-character-library";
const VOICE_STORAGE_KEY = "dailyos-voice-library";

function loadLibrary<T>(key: string): T[] {
  try {
    const saved = window.localStorage.getItem(key);
    const parsed = saved ? (JSON.parse(saved) as T[]) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function findById<T extends { id: string }>(items: T[], id?: string) {
  return items.find((item) => item.id === id);
}

function buildSceneImagePrompt(
  row: StoryboardRow,
  character?: CharacterProfile
) {
  return [
    `Scene ${row.shot} image prompt`,
    `Visual: ${row.visual}`,
    `Subtitle: ${row.subtitle}`,
    `Camera: ${row.cameraShot ?? ""}`,
    `Background: ${row.backgroundLocation ?? ""}`,
    `Action: ${row.actionGesture ?? ""}`,
    `Expression: ${row.facialExpression ?? ""}`,
    character
      ? `Character lock: ${character.name}; hair ${character.hairstyle ?? ""}; color ${character.hairColor ?? ""}; outfit ${character.outfit ?? ""}; style ${character.brandAttributes ?? ""}; notes ${character.providerNotes ?? ""}`
      : "Character lock: none selected",
    "Preserve the same face, hair, outfit, body proportions, and style across scenes."
  ].join("\n");
}

function buildSceneVideoPrompt(
  row: StoryboardRow,
  character?: CharacterProfile,
  voice?: VoiceProfile
) {
  return [
    `Scene ${row.shot} video prompt`,
    `Shot: ${row.cameraShot ?? ""}`,
    `Location: ${row.backgroundLocation ?? ""}`,
    `Action: ${row.actionGesture ?? ""}`,
    `Expression: ${row.facialExpression ?? ""}`,
    `Voiceover: ${row.narration}`,
    `Subtitle: ${row.subtitle}`,
    character ? `Character: ${character.name}` : "Character: none selected",
    voice
      ? `Voice lock: ${voice.name}; style ${voice.speakingStyle ?? ""}; tone ${voice.tone ?? ""}; speed ${voice.speed ?? ""}; pauses ${voice.pauseLevel ?? ""}; warmth ${voice.emotionalWarmth ?? ""}; formality ${voice.formalityLevel ?? ""}`
      : "Voice lock: none selected",
    "Do not change character identity or voice identity between scenes."
  ].join("\n");
}

function buildStoryboardPackage(
  rows: StoryboardRow[],
  characters: CharacterProfile[],
  voices: VoiceProfile[]
) {
  return rows
    .map((row) => {
      const character = findById(characters, row.characterProfileId);
      const voice = findById(voices, row.voiceProfileId);

      return [
        `## Scene ${row.shot}`,
        "",
        "### Image Prompt",
        row.imagePrompt || buildSceneImagePrompt(row, character),
        "",
        "### Video Prompt",
        row.videoPrompt || buildSceneVideoPrompt(row, character, voice)
      ].join("\n");
    })
    .join("\n\n");
}

function downloadText(fileName: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}

export function StoryboardBuilder({
  rows,
  message,
  onBuild,
  onCopy,
  onAdd,
  onDelete,
  onUpdate,
  onApplyCharacterLock,
  onApplyVoiceLock
}: StoryboardBuilderProps) {
  const [characters, setCharacters] = useState<CharacterProfile[]>([]);
  const [voices, setVoices] = useState<VoiceProfile[]>([]);
  const [promptMessage, setPromptMessage] = useState<string | null>(null);

  useEffect(() => {
    setCharacters(loadLibrary<CharacterProfile>(CHARACTER_STORAGE_KEY));
    setVoices(loadLibrary<VoiceProfile>(VOICE_STORAGE_KEY));
  }, []);

  const storyboardPackage = useMemo(
    () => buildStoryboardPackage(rows, characters, voices),
    [characters, rows, voices]
  );

  async function copyText(text: string, success: string) {
    if (!navigator.clipboard?.writeText) {
      setPromptMessage("目前無法使用剪貼簿，請從下方手動複製。");
      return;
    }

    await navigator.clipboard.writeText(text);
    setPromptMessage(success);
  }

  function applyGeneratedPrompts(row: StoryboardRow) {
    const character = findById(characters, row.characterProfileId);
    const voice = findById(voices, row.voiceProfileId);
    onUpdate(row.id, "imagePrompt", buildSceneImagePrompt(row, character));
    onUpdate(row.id, "videoPrompt", buildSceneVideoPrompt(row, character, voice));
    setPromptMessage(`已產生第 ${row.shot} 場提示詞。`);
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <CardTitle>分鏡工作室 v2</CardTitle>
            <CardDescription>
              指派人物與聲音設定，鎖定每個場景的一致性，並匯出提示詞包。
            </CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={onBuild}>
              從腳本建立
            </Button>
            <Button variant="outline" onClick={onCopy}>
              複製基本分鏡
            </Button>
            <Button onClick={onAdd}>新增場景</Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-3 rounded-lg border bg-secondary/30 p-4 lg:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm font-medium">人物鎖定</span>
            <select
              className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              defaultValue=""
              onChange={(event) => {
                if (event.target.value) {
                  onApplyCharacterLock(event.target.value);
                }
              }}
            >
              <option value="">套用同一人物到所有場景...</option>
              {characters.map((character) => (
                <option key={character.id} value={character.id}>
                  {character.name}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-2">
            <span className="text-sm font-medium">聲音鎖定</span>
            <select
              className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              defaultValue=""
              onChange={(event) => {
                if (event.target.value) {
                  onApplyVoiceLock(event.target.value);
                }
              }}
            >
              <option value="">套用同一聲音到所有場景...</option>
              {voices.map((voice) => (
                <option key={voice.id} value={voice.id}>
                  {voice.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        {rows.map((row) => {
          const character = findById(characters, row.characterProfileId);
          const voice = findById(voices, row.voiceProfileId);
          const imagePrompt = row.imagePrompt || buildSceneImagePrompt(row, character);
          const videoPrompt = row.videoPrompt || buildSceneVideoPrompt(row, character, voice);

          return (
            <div key={row.id} className="space-y-4 rounded-lg border bg-background p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <Badge variant="outline">場景 {row.shot}</Badge>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {character?.name ?? "尚未選人物"} / {voice?.name ?? "尚未選聲音"}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" onClick={() => applyGeneratedPrompts(row)}>
                    產生提示詞
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      copyText(
                        [`# 場景 ${row.shot}`, "", imagePrompt, "", videoPrompt].join("\n"),
                        `已複製第 ${row.shot} 場提示詞。`
                      )
                    }
                  >
                    複製場景
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => onDelete(row.id)}>
                    刪除
                  </Button>
                </div>
              </div>

              <div className="grid gap-3 lg:grid-cols-3">
                <TextInput
                  label="場景"
                  value={row.shot}
                  onChange={(value) => onUpdate(row.id, "shot", value)}
                />
                <SelectInput
                  label="人物"
                  value={row.characterProfileId ?? ""}
                  options={characters.map((item) => ({ label: item.name, value: item.id }))}
                  placeholder="選擇人物..."
                  onChange={(value) => onUpdate(row.id, "characterProfileId", value)}
                />
                <SelectInput
                  label="聲音"
                  value={row.voiceProfileId ?? ""}
                  options={voices.map((item) => ({ label: item.name, value: item.id }))}
                  placeholder="選擇聲音..."
                  onChange={(value) => onUpdate(row.id, "voiceProfileId", value)}
                />
                <TextInput
                  label="鏡位"
                  value={row.cameraShot ?? ""}
                  onChange={(value) => onUpdate(row.id, "cameraShot", value)}
                />
                <TextInput
                  label="背景 / 地點"
                  value={row.backgroundLocation ?? ""}
                  onChange={(value) => onUpdate(row.id, "backgroundLocation", value)}
                />
                <TextInput
                  label="動作 / 手勢"
                  value={row.actionGesture ?? ""}
                  onChange={(value) => onUpdate(row.id, "actionGesture", value)}
                />
                <TextInput
                  label="表情"
                  value={row.facialExpression ?? ""}
                  onChange={(value) => onUpdate(row.id, "facialExpression", value)}
                />
                <TextInput
                  label="字幕"
                  value={row.subtitle}
                  onChange={(value) => onUpdate(row.id, "subtitle", value)}
                />
                <TextInput
                  label="B-roll"
                  value={row.broll}
                  onChange={(value) => onUpdate(row.id, "broll", value)}
                />
              </div>

              <div className="grid gap-3 lg:grid-cols-2">
                <TextArea
                  label="畫面"
                  value={row.visual}
                  onChange={(value) => onUpdate(row.id, "visual", value)}
                />
                <TextArea
                  label="旁白段落"
                  value={row.narration}
                  onChange={(value) => onUpdate(row.id, "narration", value)}
                />
                <TextArea
                  label="圖像提示詞"
                  value={row.imagePrompt ?? ""}
                  placeholder={imagePrompt}
                  onChange={(value) => onUpdate(row.id, "imagePrompt", value)}
                />
                <TextArea
                  label="影片提示詞"
                  value={row.videoPrompt ?? ""}
                  placeholder={videoPrompt}
                  onChange={(value) => onUpdate(row.id, "videoPrompt", value)}
                />
              </div>
            </div>
          );
        })}

        <div className="rounded-lg border bg-secondary/30 p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-sm font-semibold">完整分鏡提示詞包</h3>
              <p className="text-xs text-muted-foreground">
                每個場景的圖像與影片提示詞。
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                onClick={() => copyText(storyboardPackage, "已複製完整分鏡提示詞。")}
              >
                複製提示詞
              </Button>
              <Button
                variant="outline"
                onClick={() =>
                  downloadText(
                    "dailyos-storyboard-prompts.md",
                    storyboardPackage,
                    "text/markdown"
                  )
                }
              >
                匯出 Markdown
              </Button>
              <Button
                variant="outline"
                onClick={() =>
                  downloadText(
                    "dailyos-storyboard.json",
                    JSON.stringify(rows, null, 2),
                    "application/json"
                  )
                }
              >
                匯出 JSON
              </Button>
            </div>
          </div>
          <pre className="mt-3 max-h-72 overflow-auto whitespace-pre-wrap break-words rounded-md bg-background p-3 text-sm leading-6 text-muted-foreground">
            {storyboardPackage}
          </pre>
        </div>

        {[message, promptMessage].filter(Boolean).map((item) => (
          <p key={item} className="rounded-md border bg-background px-3 py-2 text-sm text-muted-foreground">
            {item}
          </p>
        ))}
      </CardContent>
    </Card>
  );
}

function TextInput({
  label,
  value,
  onChange
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="space-y-2">
      <span className="text-sm font-medium">{label}</span>
      <input
        className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

function TextArea({
  label,
  value,
  placeholder,
  onChange
}: {
  label: string;
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="space-y-2">
      <span className="text-sm font-medium">{label}</span>
      <textarea
        className="min-h-28 w-full resize-y rounded-md border bg-background px-3 py-2 text-sm leading-6 outline-none focus-visible:ring-2 focus-visible:ring-ring"
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

function SelectInput({
  label,
  value,
  options,
  placeholder,
  onChange
}: {
  label: string;
  value: string;
  options: Array<{ label: string; value: string }>;
  placeholder: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="space-y-2">
      <span className="text-sm font-medium">{label}</span>
      <select
        className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
