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

type ScriptAsset = {
  id: string;
  title: string;
  topic?: string;
  script: string;
};

type CharacterAsset = {
  id: string;
  name: string;
  hairstyle?: string;
  hairColor?: string;
  outfit?: string;
  brandAttributes?: string;
};

type VoiceAsset = {
  id: string;
  name: string;
  speakingStyle?: string;
  tone?: string;
  speed?: string;
  pauseLevel?: string;
  emotionalWarmth?: string;
};

type StoryboardScene = {
  id: string;
  shot: string;
  visual: string;
  narration: string;
  subtitle: string;
  characterProfileId?: string;
  voiceProfileId?: string;
  imagePrompt?: string;
  videoPrompt?: string;
};

type ProductionPackage = {
  id: string;
  title: string;
  createdAt: string;
  script: ScriptAsset | null;
  character: CharacterAsset | null;
  voice: VoiceAsset | null;
  storyboard: StoryboardScene[];
  config: {
    format: string;
    renderTarget: string;
    status: string;
    integrations: string[];
  };
};

const SCRIPT_KEY = "dailyos-script-library";
const CHARACTER_KEY = "dailyos-character-library";
const VOICE_KEY = "dailyos-voice-library";
const STORYBOARD_KEY = "dailyos-storyboard-v2";
const PACKAGE_KEY = "dailyos-video-packages";

function readArray<T>(key: string): T[] {
  try {
    const saved = window.localStorage.getItem(key);
    const parsed = saved ? (JSON.parse(saved) as T[]) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function findById<T extends { id: string }>(items: T[], id: string) {
  return items.find((item) => item.id === id) ?? null;
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

function packageMarkdown(item: ProductionPackage) {
  return [
    `# ${item.title}`,
    "",
    `Created: ${item.createdAt}`,
    `Format: ${item.config.format}`,
    `Render target: ${item.config.renderTarget}`,
    `Status: ${item.config.status}`,
    "",
    "## Assets",
    `Script: ${item.script?.title ?? "None"}`,
    `Character: ${item.character?.name ?? "None"}`,
    `Voice: ${item.voice?.name ?? "None"}`,
    "",
    "## Scenes",
    ...item.storyboard.map((scene) =>
      [
        `### Scene ${scene.shot}`,
        `Visual: ${scene.visual}`,
        `Voiceover: ${scene.narration}`,
        `Subtitle: ${scene.subtitle}`,
        `Image prompt: ${scene.imagePrompt ?? ""}`,
        `Video prompt: ${scene.videoPrompt ?? ""}`
      ].join("\n")
    )
  ].join("\n");
}

export function VideoPage() {
  const [scripts, setScripts] = useState<ScriptAsset[]>([]);
  const [characters, setCharacters] = useState<CharacterAsset[]>([]);
  const [voices, setVoices] = useState<VoiceAsset[]>([]);
  const [storyboard, setStoryboard] = useState<StoryboardScene[]>([]);
  const [scriptId, setScriptId] = useState("");
  const [characterId, setCharacterId] = useState("");
  const [voiceId, setVoiceId] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [packages, setPackages] = useState<ProductionPackage[]>([]);

  useEffect(() => {
    const loadedScripts = readArray<ScriptAsset>(SCRIPT_KEY);
    const loadedCharacters = readArray<CharacterAsset>(CHARACTER_KEY);
    const loadedVoices = readArray<VoiceAsset>(VOICE_KEY);
    const loadedStoryboard = readArray<StoryboardScene>(STORYBOARD_KEY);
    const loadedPackages = readArray<ProductionPackage>(PACKAGE_KEY);

    setScripts(loadedScripts);
    setCharacters(loadedCharacters);
    setVoices(loadedVoices);
    setStoryboard(loadedStoryboard);
    setPackages(loadedPackages);
    setScriptId(loadedScripts[0]?.id ?? "");
    setCharacterId(loadedCharacters[0]?.id ?? "");
    setVoiceId(loadedVoices[0]?.id ?? "");
  }, []);

  const productionPackage = useMemo<ProductionPackage>(() => {
    const character = findById(characters, characterId);
    const voice = findById(voices, voiceId);

    return {
      id: crypto.randomUUID(),
      title: "DailyOS Video Production Package",
      createdAt: new Date().toISOString(),
      script: findById(scripts, scriptId),
      character,
      voice,
      storyboard: storyboard.map((scene) => ({
        ...scene,
        characterProfileId: scene.characterProfileId || character?.id,
        voiceProfileId: scene.voiceProfileId || voice?.id
      })),
      config: {
        format: "Vertical short video, 9:16",
        renderTarget: "Manual OpenMontage handoff",
        status: "Ready for review",
        integrations: ["OpenMontage-ready metadata", "No automatic rendering"]
      }
    };
  }, [characterId, characters, scriptId, scripts, storyboard, voiceId, voices]);

  function savePackage() {
    const next = [productionPackage, ...packages];
    setPackages(next);
    window.localStorage.setItem(PACKAGE_KEY, JSON.stringify(next));
    setMessage("Production package assembled and saved locally.");
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
      <section className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-primary">Video Studio</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-normal">
              Production Package
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              Assemble script, character, voice, and storyboard assets into an exportable
              production package. Rendering stays manual for this MVP.
            </p>
          </div>
          <Badge variant="secondary" className="w-fit">
            localStorage MVP
          </Badge>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Asset Selection</CardTitle>
            <CardDescription>
              Reuses saved Script Library, Character Studio, Voice Studio, and Storyboard Studio data.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {message ? (
              <p className="rounded-md border bg-background px-3 py-2 text-sm text-muted-foreground">
                {message}
              </p>
            ) : null}
            <div className="grid gap-4 md:grid-cols-2">
              <SelectField
                label="Script"
                value={scriptId}
                placeholder="No saved scripts"
                options={scripts.map((item) => ({ label: item.title, value: item.id }))}
                onChange={setScriptId}
              />
              <SelectField
                label="Character"
                value={characterId}
                placeholder="No character profiles"
                options={characters.map((item) => ({ label: item.name, value: item.id }))}
                onChange={setCharacterId}
              />
              <SelectField
                label="Voice"
                value={voiceId}
                placeholder="No voice profiles"
                options={voices.map((item) => ({ label: item.name, value: item.id }))}
                onChange={setVoiceId}
              />
              <label className="space-y-2">
                <span className="text-sm font-medium">Storyboard</span>
                <select
                  className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={storyboard.length ? "current" : ""}
                  disabled
                >
                  <option value={storyboard.length ? "current" : ""}>
                    {storyboard.length ? `Current Storyboard (${storyboard.length} scenes)` : "No storyboard scenes"}
                  </option>
                </select>
              </label>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button onClick={savePackage}>Generate Production Package</Button>
              <Button
                variant="outline"
                onClick={() =>
                  downloadText(
                    "dailyos-video-package.json",
                    JSON.stringify(productionPackage, null, 2),
                    "application/json"
                  )
                }
              >
                Export Metadata JSON
              </Button>
              <Button
                variant="outline"
                onClick={() =>
                  downloadText(
                    "dailyos-video-package.md",
                    packageMarkdown(productionPackage),
                    "text/markdown"
                  )
                }
              >
                Export Config Markdown
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Project Configuration Preview</CardTitle>
            <CardDescription>
              This is the reusable handoff package for future OpenMontage or provider adapters.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="max-h-[520px] overflow-auto whitespace-pre-wrap break-words rounded-md bg-secondary/40 p-3 text-sm leading-6 text-muted-foreground">
              {JSON.stringify(productionPackage, null, 2)}
            </pre>
          </CardContent>
        </Card>
      </section>

      <aside className="space-y-4">
        <Card className="xl:sticky xl:top-24">
          <CardHeader>
            <CardTitle>Package Summary</CardTitle>
            <CardDescription>{packages.length} saved local packages</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <SummaryRow label="Script" value={productionPackage.script?.title ?? "Missing"} />
            <SummaryRow label="Character" value={productionPackage.character?.name ?? "Missing"} />
            <SummaryRow label="Voice" value={productionPackage.voice?.name ?? "Missing"} />
            <SummaryRow label="Scenes" value={String(productionPackage.storyboard.length)} />
            <SummaryRow label="Render" value="Manual only" />
            <div className="rounded-md border bg-secondary/30 p-3 text-sm text-muted-foreground">
              No cloud sync, paid providers, or automatic rendering are used in this MVP.
            </div>
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}

function SelectField({
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

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-md border bg-background p-3 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  );
}
