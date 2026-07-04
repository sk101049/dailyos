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
  "Face",
  "Hairstyle",
  "Hair color",
  "Outfit",
  "Body proportions",
  "Visual style"
];

const workflowSteps = [
  "Script",
  "Speech Optimizer",
  "Voice Generation",
  "Storyboard",
  "Character Locked Images",
  "Video Generation",
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
  const [characterName, setCharacterName] = useState("Friendly Insurance Host");
  const [characterReferences, setCharacterReferences] = useState<string[]>([]);
  const [lockedTraits, setLockedTraits] = useState<string[]>(identityLocks);
  const [voiceName, setVoiceName] = useState("Warm zh-TW Female Voice");
  const [voiceSamples, setVoiceSamples] = useState<string[]>([]);
  const [speakingStyle, setSpeakingStyle] = useState("Friendly and conversational");
  const [speakingSpeed, setSpeakingSpeed] = useState("Medium");
  const [emotionalTone, setEmotionalTone] = useState("Warm and professional");
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
    setMessage("Character profile saved to reusable library.");
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
    setMessage("Voice profile saved to reusable library.");
  }

  function optimizeSpeech() {
    setOptimizedScript(naturalizeScript(script.script));
    setMessage("Script optimized for natural spoken delivery.");
  }

  async function copyIdentityPrompt() {
    if (!navigator.clipboard?.writeText) {
      setMessage("Clipboard is unavailable. Identity prompt is visible below.");
      return;
    }

    await navigator.clipboard.writeText(identityPrompt);
    setMessage("Digital human identity prompt copied.");
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-1">
            <CardTitle>Digital Human Studio</CardTitle>
            <CardDescription>
              Create reusable character and voice identities for consistent AI video presenters.
            </CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={saveCharacterProfile}>
              Save Character Profile
            </Button>
            <Button variant="outline" onClick={saveVoiceProfile}>
              Save Voice Profile
            </Button>
            <Button onClick={optimizeSpeech}>Optimize Speech</Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <section className="grid gap-4 xl:grid-cols-2">
          <div className="space-y-4 rounded-lg border bg-background p-4">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-sm font-semibold">Character Studio</h3>
              <Badge variant="outline">Identity Lock</Badge>
            </div>
            <label className="space-y-2">
              <span className="text-sm font-medium">Profile name</span>
              <input
                className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={characterName}
                onChange={(event) => setCharacterName(event.target.value)}
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium">Reference photos</span>
              <input
                type="file"
                multiple
                accept="image/*"
                className="w-full text-sm text-muted-foreground"
                onChange={(event) => setCharacterReferences(fileNames(event.target.files))}
              />
              <span className="block text-xs text-muted-foreground">
                {characterReferences.join(", ") || "No photos uploaded"}
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
              <h3 className="text-sm font-semibold">Voice Studio</h3>
              <Badge variant="outline">Provider Agnostic</Badge>
            </div>
            <label className="space-y-2">
              <span className="text-sm font-medium">Voice profile name</span>
              <input
                className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={voiceName}
                onChange={(event) => setVoiceName(event.target.value)}
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium">Legally owned voice samples</span>
              <input
                type="file"
                multiple
                accept="audio/*"
                className="w-full text-sm text-muted-foreground"
                onChange={(event) => setVoiceSamples(fileNames(event.target.files))}
              />
              <span className="block text-xs text-muted-foreground">
                {voiceSamples.join(", ") || "No samples uploaded"}
              </span>
            </label>
            <div className="grid gap-3 md:grid-cols-3">
              <label className="space-y-2">
                <span className="text-sm font-medium">Style</span>
                <select
                  className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={speakingStyle}
                  onChange={(event) => setSpeakingStyle(event.target.value)}
                >
                  <option>Friendly and conversational</option>
                  <option>Warm and energetic</option>
                  <option>Professional and clear</option>
                  <option>Calm and trustworthy</option>
                </select>
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium">Speed</span>
                <select
                  className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={speakingSpeed}
                  onChange={(event) => setSpeakingSpeed(event.target.value)}
                >
                  <option>Slow</option>
                  <option>Medium</option>
                  <option>Fast</option>
                </select>
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium">Tone</span>
                <select
                  className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={emotionalTone}
                  onChange={(event) => setEmotionalTone(event.target.value)}
                >
                  <option>Warm and professional</option>
                  <option>Encouraging</option>
                  <option>Empathetic</option>
                  <option>Energetic</option>
                </select>
              </label>
            </div>
          </div>
        </section>

        <section className="rounded-lg border bg-secondary/30 p-4">
          <h3 className="text-sm font-semibold">Workflow</h3>
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
              <h3 className="text-sm font-semibold">Reusable Libraries</h3>
              <Badge variant="outline">
                {characterLibrary.length + voiceLibrary.length} profiles
              </Badge>
            </div>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase text-muted-foreground">
                  Characters
                </p>
                {characterLibrary.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No character profiles yet.</p>
                ) : (
                  characterLibrary.map((item) => (
                    <article key={item.id} className="rounded-md border bg-secondary/30 p-3">
                      <p className="text-sm font-medium">{item.name}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Locked: {item.identityLock.join(", ")}
                      </p>
                    </article>
                  ))
                )}
              </div>
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase text-muted-foreground">
                  Voices
                </p>
                {voiceLibrary.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No voice profiles yet.</p>
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
              <h3 className="text-sm font-semibold">Speech Optimizer</h3>
              <Badge variant="outline">Natural Delivery</Badge>
            </div>
            <pre className="mt-3 max-h-64 overflow-auto whitespace-pre-wrap break-words rounded-md bg-secondary/40 p-3 text-sm leading-6 text-muted-foreground">
              {optimizedScript || "Click Optimize Speech to rewrite the current script into spoken-language pacing."}
            </pre>
          </div>
        </section>

        <section className="rounded-lg border bg-background p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-sm font-semibold">Identity Prompt</h3>
              <p className="text-xs text-muted-foreground">
                Use this package with future TTS, image, video, or OpenMontage integrations.
              </p>
            </div>
            <Button variant="outline" onClick={copyIdentityPrompt}>
              Copy Identity Prompt
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
